---
layout: post
title: 编辑器介绍
short: 简要介绍一下我海柔创新科技设计和开发的编辑器项目
category: tech
---

## 它是一个什么样的编辑器？

不同于市面上流行的那种图形编辑器，比如，飞书文档里面流程编辑器，或者像 Figma 这样的 web 设计软件；本编辑器针对仓库布局的需要而产生。所谓仓库布局，就是将实际仓库里会出现的那些设备，比如，货架、库位、充电桩、输送线等，以图形的方式表现在画布上，编辑器提供用户以物理配置和业务配置的能力。

物理配置即设备的大小、位置、角度、外观等可见的数据；业务配置是那些用于描述设备和仓库软件底层逻辑所需的关系。

本编辑器的原始设计源于 CAD 稿，提供了个体配置和批量配置的能力。

## 为什么需要这个编辑器以及其核心功能

原本基于 `JSON` 文件编辑的形式比较容易出错，而且非专业人员无法参与这项工作，公司之前也开发了一两款功能单一、对技术能力要求较高的配置软件，因此需要一个包含全部仓库地图制作流程的软件，用以规范工作流程，并且确保配置的准确性。

核心功能：

- 导入：从 CAD 稿初始化
- 编辑：设备的物理和业务配置
- 导出：地图文件
- 多用户协同
- 服务端 undo/redo
- 输送线编辑

## 设计

### 应用结构

{% include img.html src="/demo/images/editor-design.SVG" %}

以下是三个核心接口：

### 对象管理 - Collection

对象管理 —— 集合，它的作用在于管理图形或非图形元素，元素的增加、删除、修改都需要通过集合进行，

```ts
interface Collection<M = any> extends Iterable<M> {
  /**
   * 将一个对象加入到数据集，标记为 Added，将在下次提交时远程添加
   */
  add(item: M): void
  addRange(...items: M[]): void
  /**
   * 将一个对象加入到数据集，如果是本地数据，则标记为 Added，否则就是 UnChanged
   */
  attach(item: M): void
  attachRange(...items: M[]): void
  /**
   * 将对象从数据集移除，并将其标记为 Deleted，将在下次提交时远程删除
   */
  remove(item: M): void
  removeRange(...items: M[]): void
  /**
   * 将对象标记为 Modified，将在下次提交时更新对应的远程对象
   */
  update(item: M): void
  updateRange(...items: M[]): void
  has(key: string | M): boolean
  find(key: string): M
  query(predicate: (item: M) => boolean): M[]
  /**
   * 创建一个默认的对象，并且将其添加至数据集
   */
  create(...args: any[]): M
}
```

### 可持久化对象

实现了本接口的对象具备与服务器同步数据的能力，

```ts
interface PersistableObject {
  /**
   * 当前关联的数据上下文
   */
  $context: PersistableContext
  /**
   * 当前关联的批量对象
   */
  $batch: Batch
  /**
   * 当前关联的集合
   */
  $set: PersistableCollection

  persistableObjectType: PersistableObjectType
  persistingId: string
  persistingState: PersistableState

  /**
   * 数据是否正在同步
   */
  commiting: boolean
  isUpdateRequestFromOtherClient: boolean
  isInFromJSONValueFrame: boolean

  /**
   * 提交当前对象，以期望其与远程系统同步，并且等待远程回复
   */
  commit(): void
  /**
   * 远程给出的应答
   */
  receiveCommit(error?: any, payload?: CommitAnswer): void
  /**
   * 是否只是本地数据
   */
  isLocal(): boolean

  /**
   * 你已经知道该项需要被删除，因此执行 remove 同步该操作
   *
   * 之所以叫 removeSelf，因为 Leaflet Layer 已经有一个方法名叫 remove
   */
  removeSelf(): void
  /**
   * 你已经知道本地的数据发生了修改，因此执行 update 上传这些修改
   */
  updateSelf(): void

  /**
   * 生成快照
   */
  snapshot(): void
}
```

### 可持久化对象集合

用于管理可持久化对象，基本逻辑继承“集合”，但同时补充了同步数据的逻辑，

```ts
export interface IPersistableCollection<
  T extends PersistableObjectExports = PersistableObjectExports,
> {
  isUpdateRequestFromOtherClient: boolean
  $context: PersistableContext
  findFromTrash(key: string): T
  find(id: string): T
  update(item: T): void
  requestToRemove(item: T): void
  requestToCreate(args: any): void
  requestToModify(item: T, args: any): void
  createFromJSON(arg: any): T
  createDefault(...args: any[]): T
  has(item: T): boolean
  add(item: T): void
  iter(fn: (m: T) => void): void
  getIdentity(): string
  updateIndexById(received: any): void
}
```

### 状态

可持久化对象的状态，提交存储的时候，会根据这些状态做出不同的行为，

```ts
enum PersistableState {
  Added = 10,
  Deleted = 20,
  Detached = 30,
  Modified = 40,
  Unchanged = 50,
}
```

## 技术选型

- [Leaflet](https://leafletjs.com/reference.html), 作为图形渲染的底层
- [glMatrix](https://glMatrix.net/docs/)，用于对 Leaflet 进行图形变换功能的扩展
- [React](https://react.dev/reference/react)，DOM 渲染
- [Antd](https://ant.design/components/overview/)，组件

Leaflet 本是用于构建地图应用的 library，用它来做仓库编辑器似乎不是很妥当。我们之所以选择它，有其历史原因。

我们在开发[监控系统](./the-realtime-monitor-intro.md)的时候，尝试过使用 [X6](https://x6.antv.antgroup.com/)，考虑过 [FabricJs](https://fabricjs.com/)，X6 采取 SVG 渲染，极不适合渲染成规模的图形元素，这是做过试验的，大概超过 **3000** 个点（最简单的图形）渲染就会表现得吃力，在后期的交互上更是不堪。

FabricJs 在海柔的若干历史项目中被采用过，据相关同事反馈，其对于大批量元素的渲染能力也非常有限。

Leaflet 的渲染包含多种：

- 供地图使用的瓦片渲染，其实就是图片
- SVG 渲染
- Canvas 渲染
- DOM 渲染，比如 HTML、图片

我测试过使用 Canvas 去画 **10,000** 个点，基本是过关的，而且其在后期的交互方面依然非常出色。这其实要归因于 leaflet 内部所做的一项优化，即超出视界的部分，leaflet 会忽略渲染。

另外，leaflet 是当时的部门经理极力推荐的，他说其分层特性可以解决一些渲染时的性能问题。

以上是在我开发**监控软件**的时候的选择，其实在现在看来，选择 leaflet 这个 library 客观说是比较失败的，原因是：

- 它过于老旧，API 非常不友好
- 许多基本功能需要亲自实现，比如图形的转换
- 模块化做的不好，导致我在扩展它的时候必须非常谨慎
- 因为 10 年前尚未推出 es6，leaflet 内部使用了大量的原型链技巧，使得代码读起来十分费解
- 很多功能是根本实现不了的，或者说实现起来会得不偿失，比如，？？（一时想不起来，但确实碰到了许多此类情况）

对于 leaflet 的使用持续了一年多，使得我摸清了 leaflet 的底层逻辑，对它的 API 了解非常全面，其提供的**视窗交互**能力也非常不错，基于这些背景，在开始做编辑器的时候，我们认为继续使用 leaflet 作为图形渲染的部分应该是比较保险的，毕竟学习一项新的图形库会非常耗时，坦白讲，我们有些担心在有限的时间内无法完成工作。

当然，后来我们考察了 [pixi](https://pixijs.com/) 这样的库，它是在 webgl 上开发出来的 2D 图形库，其渲染性能和 API 确实比 leaflet 好很多，但其没有分层逻辑（我在图形库项目中自己实现了分层，也就是不同类型的元素可以渲染到各自的 canvas 上），视窗功能需要用户集成第三方插件。

glMatrix 是早年我私自研究 3D 渲染期间使用到的 lib，它提供的各种变换或三维矢量计算函数非常全面，我比较熟悉。在编辑器项目中，我使用它对 leaflet 进行了图形变换功能的扩展，这里参考了 threejs 的相关实现。

{% include code.html path="/demo/code/editor-intro-transform.ts" %}

React 用于 DOM 渲染，这是公司技术栈的要求。

组件库我们选择了 antd，它提供组件非常全面，口碑佳且生态好，是国内组件库的首选，相信会节省我们大量的时间。

以上就是我们的技术选型过程，没有特别复杂的考虑，大部分都是基于历史原因，以及个人的熟练程度；另外，我本人对使用这些技术实现需求也非常有信心。

## 实现中遇到的若干问题以及我如何解决

- 对 leaflet 进行功能扩展，使其具备基本的图形变换能力
- 如何做到地图的实时存储及渲染
- 如何实现 [undo/redo](https://wik.zhangxinghai.cn/guides/undo-redo.html)，考虑到地图是实时存储及渲染
- 大批量图形元素的渲染如何可能，比如：10w 点
- 如何做到多用户同时操作

### 对 leaflet 进行功能扩展，使其具备基本的图形变换能力

我使用了 glMatrix，并参考了 [threejs](https://github.com/mrdoob/three.js/blob/dev/src/core/Object3D.js#L578) 的实现，写了一个 Mixin，这个 Mixin 会混淆到 leaflet 的 layer 上，从而使 leaflet 的图形元素具备了变换能力。

### 如何做到地图的实时存储与渲染

这个比较复杂，首先为什么需要实时渲染？这是因为整个项目的初期设计导致的，最初的开发人员比较少，因此大量的生成和校验计算会交给后端同事。后端计算之后，会将结果通过 Websocket 推送到前端，前端会调协本地状态，使本地状态与服务端状态保持一致，以及在界面上做出正确的响应。因此，编辑器不光需要关注 UI 对它的变更，还需要关注后端（或者 WS）对其提出的变更请求。

UI 交互会导致本地状态发生变更，这些变更需要不断地推送到后端，后端一方面会存储这些状态，并反馈一个 ok 给前端，从而前端修改元素状态为`Unchanged`。

要实现这个功能，并非需要特别高深的技术，要做的仅仅是规范数据流通管道，以及设计好原子数据的状态。

### 如何实现 undo/redo，考虑到地图是实时存储与渲染

这个更加困难，因为数据是实时存储的，因此 undo/redo 不能由前端实现，而是后端的事。前端需要管理一个操作栈，用户点击 undo/redo 的时候，请求后端，让后端做出 undo/redo 的操作，然后将变更推送给前端，前端及时做出响应，这个问题在上一节中讲述过。

### 大批量图形元素的渲染如何可能，比如：10w 点

这里改写了 leaflet 的图形事件的实现，使得用户可以跨 canvas 交互！可以查看代码。

{% include code.html path="/demo/code/leafletCanvasOverrides.ts" %}

不同类型的元素会被绘制到不同的 canvas 上，这样渲染 `10w` 个点是不存在问题的！

## 我从中收获到了什么？

- 定义了一套 mixin 的实现标准
- 明白了 threejs 内部图形变换的实现逻辑
- 对 SVG 有了更多的了解
- 对 leaflet 这样的地图渲染库有了很多了解
- 如何开发一个大型 App
- 做技术预研，要亲自实验，测试其 API 友好度、性能，以及功能是否能满足需求

### 定义了一套 mixin 的实现标准，见代码

{% include code.html path="/demo/code/mixin-routine.ts" %}

### 明白了 threejs 内部图形变换的实现逻辑

元素的三项变化——位置，朝向以及大小——并不会影响子元素的此三项属性的值，threejs 内部为每一个元素维护了一个变换矩阵，三项变化影响是这个矩阵，然后将矩阵发送到 webgl，webgl 会帮助计算子元素应该显示在什么位置、如何朝向、以及大小如何。

### 对 SVG 有了更多的了解

比如，SVG 中的视窗概念、动画，其实外部的 CSS 也可以直接访问 SVG 节点，因此也可以写入样式和动画。

### 对 leaflet 这样的地图渲染库有了很多了解

明白了地图是怎么渲染出来的，一定程度上了解了 [geojson](https://geojson.org/) 标准。

### 如何开发一个大型 App

- 关注点分离，并设计好通讯机制
- 数据流通管道，不要容忍数据被任意修改

在编辑器项目中，Canvas Rendering、DOM Rendering、Domain、Data 都是严格区隔的，同时要做好通讯机制的设计。

开发大型 App，需要从高层设计，把核心概念抽象出来，描述清楚它们之间的关系，定义接口，确定层与层、模块与模块之间如何通讯，设置（最好是强制的）关键的数据流通管道，使开发更加规范，后期开发人员对代码也更有控制力。
