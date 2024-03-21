---
layout: post
title: 编辑器介绍
short: 简要介绍一下我在海柔设计和开发的编辑器项目
category: tech
---

## 它是一个什么样的编辑器？

不同于市面上流行的那种图形编辑器，比如，飞书文档里面流程图编辑器，或者像 Figma 这样的 web 设计软件。本编辑器针对仓库布局的需要而产生。所谓仓库布局，就是将实际仓库里会出现的那些设备，比如，货架、库位、充电桩、输送线等，以图形的方式表现在画布上，编辑器提供用户以物理配置和业务配置的能力。

物理配置即物件的大小、位置、角度、外观等可见的数据；业务配置是那些用于描述物件和仓库软件底层逻辑所需的关系。

本编辑器的原始设计源于 CAD 稿，提供了个体和批量配置调整的能力。

## 为什么需要这个编辑器以及其核心功能

原本基于 `JSON` 文件编辑的形式比较容易出错，而且非专业人员无法参与这项工作，公司也提供了一两款功能单一、对技术能力要求较高的软件，因此需要一个包含全部仓库地图设计流程的软件，用以简化工作流程，并且保证配置准确。

核心功能：

- 导入：从 cad 稿初始化
- 编辑：设备的物理和业务配置
- 导出：地图文件
- 多用户协同
- 服务端 undo/redo
- 输送线编辑

## 设计

以下是三个基本接口，

### 对象管理 - Collection

对象管理 —— 集合，它的作用在于管理图形或非图形元素，元素的增加、删除、修改都需要通过集合进行

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

用于管理可持久化对象，基本逻辑继承“集合”，但同时补充了同步数据的逻辑

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

可持久化对象的状态，提交存储的时候，会根据这些状态做出不同的行为

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

1. leaflet (not the best! maybe the wrong choice)
2. glmatrix
3. react
4. antd components.

Lealfet 是用于构建地图应用的 library，用它来做仓库编辑器似乎不是很妥当。之所以选择它，有其历史原因。

我在开发监控系统的时候，尝试过使用 X6，考虑过 Fabric，X6 采取 SVG 渲染，非常不适合渲染量图形元素，这是做过试验的，大概超过 3000 个点就渲染不动了，尤其体现在后期的交互上。

Fabric 在历史项目中被采用过，对于大批量元素的渲染能力也非常有限。

Leaflet 的渲染包含多种，有供地图使用的瓦片渲染，其实就是图片，有 svg 渲染，也有 canvas 渲染。我测试过使用 canvas 去画 10000 个点，似乎没啥问题，后期的交互依然非常顺畅。这要归因于 leaflet 内部所做的优化工作，即超出视界的部分，leaflet 会忽略掉。

leaflet 是当时的部门经理极力推荐使用的。

以上是在我开发监控软件的时候的选择，其实在现在看来，leaflet 这个 library 比较失败，它过于老旧，API 非常不友好，有许多基本功能需要亲自实现，比如图形的转换。还有很多功能，是根本实现不了的，或者说实现起来会得不偿失。

长期对于 leaflet 的使用，使得我摸清了 leaflet 的底层逻辑，对它的 API 了解非常全面，其提供的视窗交互能力也非常不错，基于这些背景，我们开始做编辑器的时候，我自然也选择它作为图形渲染的基础。

后来我们考察了 pixi 这样的库，性能和 API 真的比 leaflet 好很多。这部分我会在图形库里提及。

Glmatrix 是我在个人研究 3d 渲染的时候使用到的 lib，它提供的各种函数非常全面，我比较熟悉，我使用它对 leaflet 进行了的图形变换的扩展，这里参考了 threejs 的相关实现。

React 用于 dom 渲染，这是公司技术栈的要求。

组件库我们选择了 antd，它提供组件非常全面，口碑佳生态好，是国内组件库的首选，会节省我们大量的时间。

## 实现中遇到的若干问题以及我如何解决

1. 对 leaflet 进行功能扩展，使其具备基本的图形变换能力
2. 如何做到地图的实时渲染
3. 如何实现 undo/redo，考虑到地图是实时渲染
4. 大批量图形元素的渲染如何可能，比如：10w 点
5. 如何做到多用户同时操作

### 对 leaflet 进行功能扩展，使其具备基本的图形变换能力

我使用了 glmatrix，并参考了 threejs 的实现，写了一个 Mixin，这个 Mixin 会混淆到 leaflet 自己的 layer 上，从而使 leafelt 的图形元素具备了变换能力。

### 如何做到地图的实时渲染

这个比较复杂，首先为什么需要实时渲染？这是因为整个项目的初期设计导致的，最初的开发人员比较少，因此大量的生成和校验计算会丢给后端同事。后端计算之后，会将结果通过 WS 推送到前端，前端要及时响应。因此，编辑器不光需要关注 UI 对它的变更，还需要关注后端（或者 WS）对其提出的变更请求。

这里主要是设计好接口，数据需要经过特定管道流通，最后反映到界面。

### 如何实现 undo/redo，考虑到地图是实时渲染

这个更加困难，因为数据是实时存储的，因此 undo/redo 不能由前端实现，而是后端的事，前端需要管理一个操作队列，用户点击 undo 的时候，请求后端，让后端做出 undo 的操作，然后将变更推送给前端，前端及时做出响应。redo 也是如此。

### 大批量图形元素的渲染如何可能，比如：10w 点

这里主要改写了 leaflet 的图形事件的实现，使得用户可以跨 canvas 交互！可以查看代码。

不同类型的元素会被绘制到不同的 canvas 上，这样渲染 10w 个点是不存在问题的！

## 我从中收获到了什么？

1. 定义了一套 mixin 的实现标准，见代码
2. 明白了 threejs 内部图形变换的实现逻辑
3. 对 SVG 有了更多的了解
4. 对 leaflet 这样的地图渲染库有了很多了解
5. 如何开发一个大型 app，关键在于关注点分离，在编辑器项目中，图形、DOM、Domain、Data 都是严格隔开的，同时要做好通讯机制的设计
