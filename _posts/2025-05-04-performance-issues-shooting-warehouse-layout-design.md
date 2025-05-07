---
layout: post
title: 我的 3D 仓库系统是如何实现高效渲染的？
short: 我的 3D 仓库系统是如何实现高效渲染的？
category: tech
---

<div style="text-align: center;">
<iframe width="424" height="238" src="https://www.youtube.com/embed/VVTQTGhVmd4" title="Warehouse Visualization With Wik (Based On ThreeJs)" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

最近有不少陌生朋友看了我在 YouTube 上发布的 3D 仓库系统演示视频，写信来询问源码或实现思路，尤其好奇为何系统运行如此流畅。

由于前段时间一直在外旅行，没能静下心来系统地谈谈这个问题，但我一直惦记着。觉得有必要写点什么——一方面是回应这些热情的朋友，另一方面也是为了帮助自己从更高的角度回顾和整理当初的设计思路。

希望这篇简短的文章，既能帮到你，也能帮到我自己。

---

## 图形的绘制：从零生成的输送线与包裹

你可能不相信，页面上所有的图形都**不是模型导入的**，而是我直接在代码中「写」出来的。所有形状都是基于 `THREE.BufferGeometry`，通过计算顶点来构建图形，包括料箱、包裹、货架，甚至复杂的输送线系统。

### 输送线的绘制与抽象设计

现实中的输送线由不同类型的线体构成，比如直线段、弧线段、倾斜段等。为了模拟这一点，我将每个线体的形状抽象成一段 JSON 数据，通过读取这段描述来动态计算对应的顶点，实现线体的拼接。

这个过程虽然有些繁琐，也未必是最优解，但它带来了极大的灵活性——你可以在任意线体上安装设备，甚至动态调整结构。

你可以参考以下核心文件：

* `ConveyorReal.class.ts`
* `Item.class.ts`
* `Rack.class.ts`
* `Container.class.ts`

---

## 大批量相似物体的高效渲染

由于仓库中的货架、料箱、包裹形状都完全相同，仅尺寸、颜色、位置不同，为了提升渲染效率，我使用了 **`THREE.InstancedMesh`**，并封装成了自定义的 `wik.InstancedMesh` 类，增强了它的交互性与动态能力。

### 为什么使用 InstancedMesh？

InstancedMesh 能带来如下性能优势：

* **极大减少 draw call**
  渲染 1000 个物体本来需要 1000 次调用，用 InstancedMesh 只需一次调用，极大减轻 CPU 到 GPU 的通信负担。

* **共用几何体与材质**
  所有实例共用一套模型与材质，节省内存，减少状态切换。

* **GPU 并行处理实例变换**
  每个实例的位置、旋转、缩放等信息可以一次性传给 GPU 并行处理，效率更高。

一句话总结：“少沟通、多批量处理”，GPU 干活才高效。

---

### wik.InstancedMesh 实现了什么？

我封装的 `wik.InstancedMesh`，具备以下特性：

* 支持 **动态添加 / 删除实例**
* 使用 `updateRange` 合并更新区域，减少数据上传
* 可通过 `toIndividual` 分离某个实例为独立物体，便于动画等个体操作，再用 `toInstanced` 恢复回去

---

## 交互与状态管理

在这个 3D 仓库系统中，任何物体都可以被选中，且在鼠标悬停时具有样式变化。这背后我实现了一套统一的鼠标交互规范。

### 实现方法

通过实现 `Interactive.ts` 中定义的接口，只需为你的物体（可以是 `Object3D`，也可以是 `InstancedMesh`）挂载交互逻辑，就能自动获得：

* 鼠标悬停高亮
* 点击选中响应
* 状态管理能力

这一规范的设计，极大地提升了系统的扩展性与一致性。

---

## 动画系统设计

动画的实现是基于帧函数（frame function）的注册机制。你可以在任何时刻向系统添加一个帧函数来控制动画流程，并在动画结束后将其注销。

示例代码如下：

```ts
const ffn = (delta, elapsed) => {
  // 自定义动画逻辑
  if (/* 动画结束条件 */) this.unframe(ffn);
};

this.onframe(ffn);  // 注册动画函数
```

这套机制很轻量，适合局部控制，灵活性强，易于管理。

---

## 总结

对于需要渲染大量相似图形的场景，性能始终是首要问题。我的做法是：

* 使用 `InstancedMesh` 减少 draw call 数量
* 使用 `updateRange` 精准控制数据更新区域
* 封装交互协议和渲染逻辑，提升可扩展性
* 抽象输送线输入结构，实现灵活构建与动态变化

这些思路不一定是最完美的，但它们确实解决了我当时遇到的问题，并支撑了整个系统流畅运行。

如果你对某一部分实现感兴趣，或者希望我深入讲讲哪一块，欢迎留言交流。我也会在未来有空的时候，继续分享更多细节和心得。

感谢阅读！
