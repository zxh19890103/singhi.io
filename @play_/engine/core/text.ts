import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";
import {
  type CoreOptions,
  type ComposedOptions,
  type WithAnimations,
  DEFAULT_OPTIONS,
} from "./types.js";

export abstract class Text<P = {}>
  extends CSS2DObject
  implements WithAnimations
{
  readonly options: ComposedOptions<P>;
  readonly $el: HTMLDivElement;

  constructor(
    options: CoreOptions,
    className: string,
    style?: CSSStyleDeclaration,
  ) {
    const _options = {
      ...DEFAULT_OPTIONS,
      ...options,
    };

    const element = document.createElement("div");
    style && Object.assign(element.style, style);
    element.className = `TextBase ${className}`;

    const innerHTML = document.createElement("div");
    element.appendChild(innerHTML);
    innerHTML.className = "InnerHTML";

    super(element);

    this.$el = innerHTML;
    this.options = _options as ComposedOptions<P>;
  }

  appear(duration: number): this {
    throw new Error("Method not implemented.");
  }
  fadeIn(duration: number): this {
    throw new Error("Method not implemented.");
  }
  fadeOut(duration: number): this {
    throw new Error("Method not implemented.");
  }
  popup(duration: number): this {
    throw new Error("Method not implemented.");
  }
  enlarge(duration: number): this {
    throw new Error("Method not implemented.");
  }
  shrink(duration: number): this {
    throw new Error("Method not implemented.");
  }
  disappear(duration: number): this {
    throw new Error("Method not implemented.");
  }
  move(offset: [number, number], duration: number): this {
    throw new Error("Method not implemented.");
  }
  moveTo(position: [number, number], duration: number): this {
    throw new Error("Method not implemented.");
  }
  rotate(angle: number, duration: number): this {
    throw new Error("Method not implemented.");
  }
  rotateTo(angle: number, duration: number): this {
    throw new Error("Method not implemented.");
  }
}
