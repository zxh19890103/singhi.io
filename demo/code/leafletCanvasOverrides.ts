import L, { DomEvent, DomUtil } from 'leaflet';

import { HrMap } from './Map.class';

type PaneGet2Order = 'cover' | 'cover2' | 'cover3' | 'min' | 'max' | number;

/**
 * 0 - no
 * 1 - loop
 * 2 - break
 */
let phaseOfMouseEventHandleLoopFrame = 0;
let fireEventCall = 0; // on called counter.

console.log('warn!. L.Canvas prototype was overrided.');

(L.Canvas.prototype as any)._initContainer = function () {
  const container = (this._container = document.createElement('canvas'));

  // These 3 lines are deleted for we will use a proxy pane.
  // DomEvent.on(container, 'mousemove', this._onMouseMove, this);
  // DomEvent.on(container, 'click dblclick mousedown mouseup contextmenu', this._onClick, this);
  // DomEvent.on(container, 'mouseout', this._handleMouseOut, this);

  container['_leaflet_disable_events'] = true; // 1.8

  this._ctx = container.getContext('2d');
};

(L.Canvas.prototype as any)._fireEvent = function (layers, e, type) {
  const map = this._map as HrMap;

  if (this.__of_proxy_pane__) {
    map._fireDOMEvent(e, type || e.type, layers);
    return;
  }

  /**
   * 这个是保持 leaflet 默认的事件发射逻辑
   */
  if (phaseOfMouseEventHandleLoopFrame === 0) {
    // default
    map._fireDOMEvent(e, type || e.type, layers);
    return;
  }

  /**
   * 检测到物体，停止设置 phaseOfMouseEventHandleLoopFrame = 2 表示要中止遍历，因为目的已经达到
   */
  if (layers && phaseOfMouseEventHandleLoopFrame === 1) {
    map._fireDOMEvent(e, type || e.type, layers);
    phaseOfMouseEventHandleLoopFrame = 2;
    return;
  }

  /**
   * 全部遍历完毕，没有检测到物体
   */
  if (fireEventCall === map.__canvas_renderers_size__) {
    map._fireDOMEvent(e, type || e.type, layers);
  }
};

// IT's really un
(L.Canvas.prototype as any)._handleMouseHover = function (e, point) {
  if (this._mouseHoverThrottled) {
    return;
  }

  let layer, candidateHoveredLayer;

  for (let order = this._drawFirst; order; order = order.next) {
    layer = order.layer;
    if (layer.options.interactive && layer._containsPoint(point)) {
      candidateHoveredLayer = layer;
    }
  }

  if (candidateHoveredLayer !== this._hoveredLayer) {
    this._handleMouseOut(e);

    if (candidateHoveredLayer) {
      DomUtil.addClass(this.$$proxyc, 'leaflet-interactive'); // change cursor
      this._fireEvent([candidateHoveredLayer], e, 'mouseover');
      this._hoveredLayer = candidateHoveredLayer;
    }
  }

  this._fireEvent(this._hoveredLayer ? [this._hoveredLayer] : false, e);

  this._mouseHoverThrottled = true;
  setTimeout(() => {
    this._mouseHoverThrottled = false;
  }, 32);
};

(L.Canvas.prototype as any)._handleMouseOut = function (e) {
  const layer = this._hoveredLayer;
  if (layer) {
    // if we're leaving the layer, fire mouseout
    DomUtil.removeClass(this.$$proxyc, 'leaflet-interactive');
    this._fireEvent([layer], e, 'mouseout');
    this._hoveredLayer = null;
    this._mouseHoverThrottled = false;
  }
};

export type PaneType = 'svg' | 'canvas' | 'overlay';

/**
 * 一个 pane 只放一个 renderer
 */
export class Pane {
  /**
   * L.Canvas Or L.SVG
   */
  readonly renderer: any;
  readonly type: PaneType;
  readonly name: string;
  readonly fullname: string;
  readonly container: HTMLDivElement;

  /**
   * 是否 canvas 渲染
   */
  readonly canvas: boolean = false;
  /**
   * 是否代理层
   */
  readonly proxy: boolean = false;

  /**
   * 排序
   */
  order: number = 0;
  /**
   *是否显示
   */
  visible: boolean = true;
  /**
   * 绝对 z 值
   */
  z: number = null;
  /**
   * 序号
   */
  i: number = 0;
  /**
   * 挂载的 layer 的个数
   */
  used: number = 0;
  /**
   * true 表示会放到图层面板
   *
   * false 表示只是临时生成的 renderer，用完可能会删除
   */
  configurable: boolean = true;

  /**
   * parent
   */
  mgr: PaneManager = null;

  /**
   * 禁止响应
   */
  disabled: boolean = false;

  constructor(
    name: string,
    type: PaneType,
    container: HTMLDivElement,
    renderer: L.Renderer = null,
  ) {
    this.name = name;
    this.fullname = `${this.name}Pane`;
    this.type = type;
    this.renderer = renderer;
    this.container = container;
    this.canvas = type === 'canvas';
    this.proxy = this.name === 'proxy';
    this.configurable = this.proxy ? false : true;

    if (this.renderer) {
      this.renderer['__of_proxy_pane__'] = this.proxy;
    }
  }

  _remove() {
    this.renderer?.remove();
    this.container.remove();
  }

  remove() {
    this.mgr.remove(this);
  }

  get zIndex() {
    if (this.z !== null) {
      return this.z;
    }

    switch (this.type) {
      case 'overlay':
        return 501 + this.i;
      case 'svg':
        return 451 + this.i;
      case 'canvas': {
        return 401 + this.i;
      }
      default: {
        return 400;
      }
    }
  }
}

const orderSort = (a: Pane, b: Pane) => b.order - a.order;

// canvas 402 - 450
// svg 451 - 499
// overlay 500 - 599

/**
 * @event order/add/remove
 */
export class PaneManager extends L.Evented {
  private styleElement: HTMLStyleElement = null;
  private panes: Pane[] = [];
  private panesDict: Record<string, Pane> = {};
  private canvases: Pane[] = [];
  /**
   * proxy pane's renderer.
   */
  private proxy: any = null;

  /**
   * 全部层的父级节点
   */
  container: HTMLDivElement = null;

  /**
   * 禁止响应
   */
  disabled = false;

  constructor(private map: HrMap) {
    super();

    this.container = map._container;

    this.map.__canvas_renderers_size__ = 0;

    Object.defineProperty(this.map, 'paneMgr', { value: this });
  }

  private _scheduled = false;
  requestRender() {
    if (this._scheduled) return;

    queueMicrotask(() => {
      this.renderStyle();
      this._scheduled = false;
    });

    this._scheduled = true;
  }

  renderStyle() {
    this.panes.sort(orderSort);

    let i = this.panes.length;
    for (const pane of this.panes) {
      pane.i = i--;
    }

    this.canvases = this.panes.filter((p) => p.canvas);

    this.styleElement.innerHTML = `
    .leaflet-pane.leaflet-proxy-pane {
      z-index: 450 !important;
    }
    ${this.panes
      .map((pane) => {
        return ` .leaflet-pane.leaflet-${pane.name}-pane {
        z-index: ${pane.zIndex} !important; 
        display: ${pane.visible ? 'block' : 'none'}
      }`;
      })
      .join('\n')}
    `;

    this.fire('render');
  }

  createStyle() {
    this.styleElement = document.createElement('style');
    this.styleElement.id = 'panes';
    document.head.appendChild(this.styleElement);
  }

  setOrder(name: string, order: PaneGet2Order) {
    const pane = this._get(name);

    this._setOrder(pane, order);

    this.requestRender();
    this.fire('order');
  }

  _setOrder(pane: Pane, order: PaneGet2Order) {
    if (typeof order === 'number') {
      pane.order = order;
      pane.z = null;
    } else if (order === 'cover') {
      pane.z = 451;
    } else if (order === 'cover2') {
      pane.z = 500;
    } else if (order === 'cover3') {
      pane.z = 599;
    } else if (order === 'max') {
      pane.order = Math.max(...this.panes.filter((p) => p.configurable).map((x) => x.order)) + 1;
      pane.z = null;
    } else if (order === 'min') {
      pane.order = Math.min(...this.panes.filter((p) => p.configurable).map((x) => x.order)) - 1;
      pane.z = null;
    } else {
      //
    }
  }

  setTop(name: string) {
    this.setOrder(name, 'max');
  }

  setVisible(name: string, visible: boolean) {
    const pane = this._get(name);
    pane.visible = visible;

    this.requestRender();
    this.fire('visible');
  }

  toggleVisible(name: string) {
    const pane = this._get(name);
    if (!name) return;

    this.setVisible(pane.name, !pane.visible);
  }

  _get(name: string) {
    return this.panesDict[name];
  }

  has(name: string) {
    return !!this.panesDict[name];
  }

  /**
   * 排除 used 为 0 的项目
   */
  getPanes() {
    return this.panes.filter((x) => x.configurable && x.used);
  }

  /**
   * get 可以帮助你创建并加入管理
   */
  get(name: string, type: PaneType = 'canvas', order: number = 0) {
    let pane = this._get(name);

    if (pane) {
      pane.order = order;
    } else {
      pane = this.create(name, type, order);
      this.add(pane);
    }

    return pane;
  }

  /**
   * get2 创建不受管理的 pane
   */
  get2(type: PaneType, order: PaneGet2Order = 'min', name: string = null) {
    const _name = name || `p${Math.random().toString(36).substring(2)}`;

    if (this.has(_name)) {
      return this._get(_name);
    }

    const pane = this.create(_name, type, 0);
    this._setOrder(pane, order);
    pane.configurable = false;

    this.add(pane);

    return pane;
  }

  add(pane: Pane) {
    this.panes.unshift(pane);
    this.panesDict[pane.name] = pane;

    if (pane.type === 'canvas') {
      this.map.__canvas_renderers_size__ += 1;
      /**
       * 将 proxy 的 canvas 元素挂载到当前 renderer，用于鼠标交互时访问
       */
      pane.renderer.$$proxyc = this.proxy._container;
    }

    pane.mgr = this;

    this.requestRender();

    this.fire('add');
  }

  remove(name: string | Pane) {
    const pane = typeof name === 'string' ? this._get(name) : name;

    if (!pane) return;

    this.panes = this.panes.filter((x) => x !== pane);
    delete this.panesDict[pane.name];

    pane._remove();

    if (pane.type === 'canvas') {
      this.map.__canvas_renderers_size__ -= 1;
    }

    this.requestRender();

    this.fire('remove');
  }

  /**
   * @param name without "Pane" suffix
   * @param type svg or canvas
   * @param z default order must
   * @returns
   */
  create(name: string, type: PaneType, order = 0): Pane {
    const fullname = `${name}Pane`;

    let container: HTMLDivElement = null;
    let renderer: L.Renderer = null;

    if ('map,tile,overlay,shadow,marker,tooltip,popup'.indexOf(name) > -1) {
      container = this.container.querySelector(`.leaflet-${name}-pane`);
    } else {
      container = this.map.createPane(`${name}Pane`) as HTMLDivElement;
    }

    if (type !== 'overlay') {
      renderer =
        type === 'canvas' ? new L.Canvas({ pane: fullname }) : new L.SVG({ pane: fullname });
    }

    const pane = new Pane(name, type, container, renderer);
    pane.order = order;

    return pane;
  }

  interact() {
    const pane = this.create('proxy', 'canvas');
    this.map.addLayer(pane.renderer);

    this.proxy = pane.renderer;

    const container = pane.renderer._container;

    DomEvent.on(container, 'mousemove', this.onmousemove, this);
    DomEvent.on(container, 'click dblclick mousedown mouseup contextmenu', this.onclick, this);
    DomEvent.on(container, 'mouseout', this.onmouseout, this);

    this.createStyle();
    this.renderStyle();
  }

  /**
   * 存在的问题： 货架遮挡在点之上，move 事件还是会对被遮挡的点起作用，因为，move 此时不会对货架产生 hover 事件
   */
  private onmousemove(e) {
    if (this.disabled) {
      this.proxy._onMouseMove(e);
      return;
    }

    phaseOfMouseEventHandleLoopFrame = 1;
    fireEventCall = 0;

    for (const { renderer, visible, disabled } of this.canvases) {
      fireEventCall++;
      if (phaseOfMouseEventHandleLoopFrame === 2) continue;
      if (!renderer._map || !visible || disabled) continue;
      renderer._onMouseMove(e);
    }

    fireEventCall = 0;
    phaseOfMouseEventHandleLoopFrame = 0;
  }

  private onclick(e) {
    if (this.disabled) {
      this.proxy._onClick(e);
      return;
    }

    phaseOfMouseEventHandleLoopFrame = 1;
    fireEventCall = 0;

    for (const { renderer, visible, disabled } of this.canvases) {
      fireEventCall++;
      if (phaseOfMouseEventHandleLoopFrame === 2) continue;
      if (!renderer._map || !visible || disabled) continue;
      renderer._onClick(e);
    }

    fireEventCall = 0;
    phaseOfMouseEventHandleLoopFrame = 0;
  }

  private onmouseout(e) {
    if (this.disabled) {
      this.proxy._handleMouseOut(e);
      return;
    }

    phaseOfMouseEventHandleLoopFrame = 1;
    fireEventCall = 0;

    for (const { renderer, visible, disabled } of this.canvases) {
      fireEventCall++;
      if (phaseOfMouseEventHandleLoopFrame === 2) continue;
      if (!renderer._map || !visible || disabled) continue;
      renderer._handleMouseOut(e);
    }

    fireEventCall = 0;
    phaseOfMouseEventHandleLoopFrame = 0;
  }
}
