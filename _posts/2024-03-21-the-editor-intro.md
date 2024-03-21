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

原本基于 json 文件编辑的形式比较容易出错，而且非专业人员无法参与这项工作，公司也提供了一两款功能单一、对技术能力要求较高的软件，因此需要一个包含全部仓库地图设计流程的软件，用以简化工作流程，并且保证配置准确。

核心功能：

- 导入：从 cad 稿初始化
- 编辑：设备的物理和业务配置
- 导出：地图文件
- 多用户协同
- 服务端 undo/redo
- 输送线编辑

## 最初的设计

### 三个基本接口

1. 对象管理 - Collection

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

2. 可持久化对象

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

3. 可持久化对象集合

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

4. 状态

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

## 实现中遇到的若干问题以及我如何解决

1. real-time saving and react the changes from sever
2. undo/redo under the case of the real-time.
3. big map (1w points and 8k locations.) rendering - layers management, and events can pass through the layer of canvas.
4. multi users collapration?

## 我从中收获到了什么？

1. define a pattern to implementing mixin.
2. graphic elements transform: rotate, translate, scale.
3. usage of SVG
4. how does leaflet work. (rewrote its source code in this project)
5. how to orgainize a large-scale app? separate layers in reason, and separate data from UI.
