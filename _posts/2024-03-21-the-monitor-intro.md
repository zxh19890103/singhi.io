---
layout: post
title: 仓库监控系统介绍
short: 简要介绍一下我在海柔创新设计和开发的仓库监控系统
category: tech
---

## 设计

{% include img.html src="/demo/images/monitor-design.jpg" %}

## 为什么这么设计

我最初阅读了 leaflet 的文档，并且试用了其 API，发觉 leaflet 内部大量使用了原型链技巧。我觉得这对年轻程序员非常不利，因此有了一个大概的想法 —— 独立地定义一套业务模型，然后使用业务模型去驱动 leaflet 初始化、更新以及销毁。

因此有一个业务模型到 leaflet layer （视图）的映射关系，对此我定义了应用启动后的 "build 阶段" 这个概念。“build 阶段”就是建立业务模型和 leaflet layer 的关联关系，并做了变更事件绑定以实现视图的实时刷新。这里的刷新逻辑需要根据具体的 layer 以及业务含义是分别实现。

既然有 “build 阶段”，当然就需要定义一个 “destroy 阶段”。在 “destroy 阶段”，删去关联关系和事件绑定。

每种设备类型都有其对应的模型，而每种模型都会建立自己的 `Collection` 对象，`Collection` 会管理模型的增加、修改和删除，并且通过事件实时更新到视图上。

我的一大部分工作聚焦到模型的 `update` 上，因为在这里，我需要对每种模型做 diff，diff 的逻辑需要结合数据的特征以及业务含义。diff 后，如果发现数据有变化，模型就发射一个事件。订阅了模型事件的 leaflet layer 和 react component 就会刷新 —— 使用最新的模型状态渲染。

然而，在设计[编辑器](./the-editor-intro)的时候，我改变了想法。在编辑器里，业务模型是基于 leaflet layer 扩展的。于是，我仔细阅读了 leaflet 关于构建 layer 的代码，并写了几个 decorator 以帮助开发者更好地基于 layer 扩展自己的业务模型。想法上之所以有这样的转变，在于我发现 leaflet 本身就是一套完整的事件系统，我们基于它追加业务属性会更加方便，只是要多注意 leaflet 本身的 api，不要出现命名冲突，不要污染了 leaflet 对象的状态。因为，你要知道 leaflet 有很多隐藏的字段，它们并没有使用类型声明。

## 如何解决高频推送，比如：50Hz

以 50Hz 的频率刷新 DOM 是不现实的 —— 页面会非常卡顿，因此这里需要 throttle。

但是，50Hz 刷新 JS 对象问题不大，因此，只要把事件发射的频次降下来就好。

因此，我对监控系统中的业务模型的事件系统做了一定的改造。

{% include code.html path="monitor-intro-changableObj.ts" %}

其中的 `notificationRate` 用于实现 throttle —— 节流。

## 如何实现多库区

on the way...

## 如何实现 DOM 的刷新

请看以下代码片段：

```ts
export let globalTick = 0
export const doGlobalTick = () => {
  return ++globalTick
}

export const useGlobalTick = () => {
  const [_, dispatch] = useReducer(doGlobalTick, globalTick)
  return dispatch
}
```

这就是我实现 react 组件实时刷新的核心代码，简单吧？

会出现整型数字益处吗？JS 平台下最大安全整数为 `9007199254740991`

```js
console.log(Number.MAX_SAFE_INTEGER)
// 9007199254740991
```

因此整个应用组件刷新次数最多可以高达 `9,007,199,254,740,991`，我想是足够的。
