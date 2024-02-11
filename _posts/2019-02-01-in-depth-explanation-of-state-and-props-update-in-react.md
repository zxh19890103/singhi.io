---
layout: post
title: 深度理解：React 中 State 和 Props 更新机制
short: 理解 React 执行“更新”的机制，所需要的基本知识，我在上一篇作了说明；本篇，我们就来深入“更新”的细节中
tags:
  - React
category: tech
---

{% include img.html src="http://zxh1989.oss-cn-qingdao.aliyuncs.com/20190129/000731_49174.png" %}

之前，我勾画出了 React 中几个重要的数据结构，解释了一些重要的概念。尤其是，Fiber nodes、current 树、work-in-progress 树、side-effects 以及 effects-list。我也从大局对主要的算法作了分析，对 render 和 commit 两大阶段的区别作了说明。本篇来说，这些都是基础，如果你尚未读过前一篇，我建议你从那里开始。

我也引进了一个小巧的 React 应用，一个 button，每点击一次，其右边的数字会加1:


{% include img.html src="http://zxh1989.oss-cn-qingdao.aliyuncs.com/20190129/001801_37216.gif" %}

给你一个可以运行它的网站：

https://stackblitz.com/edit/react-jwqn64

我只是简单实现了它，定义了一个组件，render 方法返回一个 button 和一个 span。当你点击 button 的时候，handleClick 被触发，state.count 加 1，最终导致 span 元素的文本得以更新。 

```js
class ClickCounter extends React.Component {
    constructor(props) {
        super(props);
        this.state = {count: 0};
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        this.setState((state) => {
            return {count: state.count + 1};
        });
    }
    
    componentDidUpdate() {}

    render() {
        return [
            <button key="1" onClick={this.handleClick}>Update counter</button>,
            <span key="2">{this.state.count}</span>
        ]
    }
}
```

我们在此为组件添加了 componentDidUpdate 周期方法。这方便于演示，在 commit 阶段，React 是如何添加用以调用此 hook 的 [effects](https://medium.com/react-in-depth/inside-fiber-in-depth-overview-of-the-new-reconciliation-algorithm-in-react-e1c04700ef6e#b30b)。

本篇，我将告诉你 React 是如何处理状态更新以及如何构建 effects list。我们亦将看到，在 render、commit 两大阶段，React 运行了哪些主要的函数。

尤其，我们将了解到，在 completeWork 函数中，React 做了以下几件事：

- 更新了 ClickCounter 状态（state）的 count 属性
- 调用 render 方法，以获得子元素列表，并执行差异比较
- 更新 span 元素的属性

并，在 commitRoot 函数中，React 做了如下工作：

- 更新 span 元素的 textContent 属性
- 调用周期函数 componentDidUpdate

但是，在此之前，让我们快速过一下，当调用 setState 方法之后，React 是如何将 Work 列入调度队列的。

### 更新调度（Scheduling updates）

当我们点击 button，click 事件被触发，React 执行我们通过属性赋给的回调。我们这个应用只是简单地将对状态 count 加 1。

```js
class ClickCounter extends React.Component {
    // ...
    handleClick() {
        this.setState((state) => {
            return {count: state.count + 1};
        });
    }
}
```

每一个 React 组件都有一个关联的 updater，它充当连接组件和 React 核心（Core）的媒介。这种设计，允许 ReactDOM、React Native、SSR 和 Testing Utilities 分别实现各自的逻辑。

本文，我们将着眼于 ReactDOM 中 updater 的实现，它是基于 Fiber reconciler。对于 ClickCounter 组件，它是 classComponentUpdater。它的作用在于创建 Fiber 实例、将更新加入队列、Work 计划执行。

当更新被加入队列，它实际上是被加到了 Fiber 节点上的更新队列。在我们的例子中，ClickCounter 对应的 Fiber 节点，拥有以下结构：

```js
{
    stateNode: new ClickCounter,
    type: ClickCounter,
    updateQueue: {
         baseState: {count: 0}
         firstUpdate: {
             next: {
                 payload: (state) => { return {count: state.count + 1} }
             }
         },
        // ...
     },
    // ...
}
```
你可以看到，函数 updateQueque.firstUpdate.next.payload 就是我们传入 setState 方法的参数。它是在 render 阶段要被执行的第一个更新。

### 对 ClickCounter 组件 Fiber 节点更新的处理（Processing updates for the ClickCounter Fiber node）

我在上一篇文章中说明了全局变量 nextUnitOfWork 的作用，它指向 workInProgress 树中的某个包含 Work 的 Fiber 节点。React 遍历 Fiber 树，使用这个变量来判断是否还有未完成的 Work。

我们从调用 setState 开始说起吧，React 将传入 setState 的回调函数加入到 ClickCounter 组件对应 Fiber 节点的 updateQueque 中，并在将来被执行。React 进入 render 阶段，使用 renderRoot 函数从 Fiber 树的根节点开始遍历。当然，React 会跳过已经处理过的节点，快速到达有 Work 的节点。这里，只有一个 Fiber 节点有待完成的 Work，他就是 ClickCounter 对应的 Fiber 节点。

React 在 Fiber 节点的副本上执行Work，这个副本保存在节点的 alternate 字段。如果 alternate 尚未定义，React 就通过调用函数 createWorkInProgress 赋值一份，继而执行 Work。我们来假设，现在，变量 nextUnitOfWork 指向 ClickCounter 的 Fiber 节点的那个副本（alternate）。

### beginWork

首先，我们的 Fiber 会进入 函数 beginWork。

> 由于这个函数对于Fiber树中的每个节点都会调用，因此，在这里加个断点来对 render 阶段进行调试是个不错的方法。我经常使用这种方式来判断某个Fiber节点的类型是不是我期望的。

beginWork 函数其实就是个大的 switch 条件语句，它利用节点的 tag 属性来判断需要做什么。对于 ClickCounter，它是个 class 组件，因此程序会进入该条件分支：

``` js
function beginWork(current$$1, workInProgress, ...) {
    ...
    switch (workInProgress.tag) {
        ...
        case FunctionalComponent: {...}
        case ClassComponent:
        {
            ...
            return updateClassComponent(current$$1, workInProgress, ...);
        }
        case HostComponent: {...}
        case ...
}
```

我们进入到 updateClassComponent 函数：

```js
function updateClassComponent(current, workInProgress, Component, ...) {
    ...
    const instance = workInProgress.stateNode;
    let shouldUpdate;
    if (instance === null) {
        ...
        // In the initial pass we might need to construct the instance.
        constructClassInstance(workInProgress, Component, ...);
        mountClassInstance(workInProgress, Component, ...);
        shouldUpdate = true;
    } else if (current === null) {
        // In a resume, we'll already have an instance we can reuse.
        shouldUpdate = resumeMountClassInstance(workInProgress, Component, ...);
    } else {
        shouldUpdate = updateClassInstance(current, workInProgress, ...);
    }
    return finishClassComponent(current, workInProgress, Component, shouldUpdate, ...);
}
```

取决于组件是否首次 render、render 重执行或者状态更新，React 决定是要创建一个组件实例或者仅仅执行一下更新。

### Processing updates for the ClickCounter Fiber

我们已经有了 ClickCounter 组件的实例，现在我们进入函数 updateClassInstance。对于 Class 组件，React 完成的大多数工作就在这里。下面按照执行顺序，列出几个最重要的操作：

- 调用 UNSAFE_componentWillReceiveProps() hooks (deprecated)
- 处理 updateQueque 中的更新，并生成新的状态（state）
- 利用新生成的状态（state），调用 getDerivedStateFromProps，获得结果
- 调用 shouldComponentUpdate 来知道组件是否希望被更新；如果返回 false，则跳过全部的渲染- （render）处理，包括调用组件上的和及其子元素的 render 方法；否则，处理更新。
- 调用 UNSAF_componentWillUpdate (deprecated)
- 添加一个 effect，以在 commit 阶段能够触发 componentDidUpdate 周期函数
- 更新组件实例上的 state 和 props

*state 和 props 应当在 render 方法被调用之前被更新，这是因为，render 返回的内容依赖于 state 和 props。若不如此，render 每次都将返回一致的结果。*

以下是该函数的简化实现：

```js
function updateClassInstance(current, workInProgress, ctor, newProps, ...) {
    const instance = workInProgress.stateNode;

    const oldProps = workInProgress.memoizedProps;
    instance.props = oldProps;
    if (oldProps !== newProps) {
        callComponentWillReceiveProps(workInProgress, instance, newProps, ...);
    }

    let updateQueue = workInProgress.updateQueue;
    if (updateQueue !== null) {
        processUpdateQueue(workInProgress, updateQueue, ...);
        newState = workInProgress.memoizedState;
    }

    applyDerivedStateFromProps(workInProgress, ...);
    newState = workInProgress.memoizedState;

    const shouldUpdate = checkShouldComponentUpdate(workInProgress, ctor, ...);
    if (shouldUpdate) {
        instance.componentWillUpdate(newProps, newState, nextContext);
        workInProgress.effectTag |= Update;
        workInProgress.effectTag |= Snapshot;
    }

    instance.props = newProps;
    instance.state = newState;

    return shouldUpdate;
}
```

以上，我已经移除了一些辅助性的代码，例如，在调用周期函数或添加用于调用周期函数的 effects 之前，React 用 typeof 运算符来知道组件是否实现了这些周期函数。在此处，添加 effect 之前，React 要检测的是 componentDidUpdate。

好了，现在我们知道了，在 render 阶段，React 在 ClickCounter 对应的 Fiber 节点上做了些什么。让我们进一步，来了解下 React 是如何修改 Fiber 节点上的值的。当 React 开始启动工作，ClickCounter 的 Fiber 节点看起来如下：

```js
{
    effectTag: 0,
    elementType: class ClickCounter,
    firstEffect: null,
    memoizedState: {count: 0},
    type: class ClickCounter,
    stateNode: {
        state: {count: 0}
    },
    updateQueue: {
        baseState: {count: 0},
        firstUpdate: {
            next: {
                payload: (state, props) => {/* … */}
            }
        },
        // ...
    }
}
```

Work 完成之后，我们的 Fiber 节点看起来如下：

```js
{
    effectTag: 4,
    elementType: class ClickCounter,
    firstEffect: null,
    memoizedState: {count: 1},
    type: class ClickCounter,
    stateNode: {
        state: {count: 1}
    },
    updateQueue: {
        baseState: {count: 1},
        firstUpdate: null,
       //  ...
    }
}
```

### Take a moment to observe the differences in properties values

更新生效之后，memoizedState 以及 updateQueue.baseState 中的属性 count 的值变为 1，同时，React 也会更新组件实例上的 state。

这时，在更新队列中已无更新，因此 firstUpdate = null。注意，我们的 effectTag 属性有了修改，它的值不再是 0，而是 4。二进制来说就是 100，这表示数据的第三位（third bit）被设置，这正是 side-effect tag 中 Update 的值。

```js
export const Update = 0b00000000100;
```

总结一下，在 ClickCounter 的 Fiber 节点上，React 调用了变更前（pre-mutation）周期函数、更新状态、定义相关的副作用（side-effects）。

### Reconciling children for the ClickCounter Fiber

之后，React 进入 [finishClassComponent](https://github.com/facebook/react/blob/340bfd9393e8173adca5380e6587e1ea1a23cefa/packages/react-reconciler/src/ReactFiberBeginWork.js#L355) 函数。在这里，React 调用组件实例的 render 方法，对返回的子元素应用 diffing 算法。对此，官方文档提供了概述性描述，这里截取一部分：

*When comparing two React DOM elements of the same type, React looks at the attributes of both, keeps the same underlying DOM node, and only updates the changed attributes.*

如果我们深挖一下，我会发现其实 React 比较的是包含 React 元素的 Fiber 节点。我不打算在这里涉及太多细节，因为那过于精密。我将在另一篇中着重关注下 Child Reconciliation。

*If you’re anxious to learn details on your own, check out the [reconcileChildrenArray](https://github.com/facebook/react/blob/95a313ec0b957f71798a69d8e83408f40e76765b/packages/react-reconciler/src/ReactChildFiber.js#L732) function since in our application the render method returns an array of React Elements.*

现在，有两点需要你重点理解，其一，在 React 进行 Child Reconciliation 的时侯，它要创建或者更新 Fiber 节点，以用于 render 返回的子元素渲染。函数 finishClassComponent 返回的是当前 Fiber 节点的第一个 child，它被赋值给 nextUnitOfWork，并在之后的 work loop 中得以处理。第二，子节点上的属性更新操作，其实是在其父节点上执行的。如何做到？React 使用 render 方法返回的数据即可！

举个例子，看下 span 元素对应的 Fiber 节点，在 React 对 ClickCounter 节点（Fiber节点）进行 reconciliation 之前，其结构看上去大概是：

```js
{
    stateNode: new HTMLSpanElement,
    type: "span",
    key: "2",
    memoizedProps: {children: 0},
    pendingProps: {children: 0},
    // ...
}
```
可以看到，memoizedProps 和 pendingProps 的 children 属性的值都是 0。以下则是 render 返回的 span 元素（React元素）的数据结构：

```js
{
    $$typeof: Symbol(react.element)
    key: "2"
    props: {children: 1}
    ref: null
    type: "span"
}
```

可以看到，两者的 props 之间有些区别。在函数 createWorkInProgress 中，React 使用 React 元素来创建 Fiber 节点的将替代品（alternate），React 会将 React 元素上的值拷贝到 Fiber 节点上。

React 对 ClickCounter 的子元素完成了 reconciliation 之后，span 的 Fiber 节点将会更新 pendingProps 值，它将和 span 元素（React元素）的 props 值一致：

```js
{
    stateNode: new HTMLSpanElement,
    type: "span",
    key: "2",
    memoizedProps: {children: 0},
    pendingProps: {children: 1},
    // ...
}
```
之后，在 React 将要执行 span 的 Fiber 节点上的 Work 时，pendingProps 中的值将会被拷贝到 memoizedProps，并且添加副作用（effects）来更新DOM

以上就是 render 阶段，React在 ClickCounter 的Fiber节点上执行（performs）的操作（Work）。由于 button 是 ClickCounter 的第一个孩子（child），它将被赋值给 nextUnitOfWork。对此 button，React 无需做任何事，于是，React 移步至 button 的 兄弟节点（sibling），它是 span 的 Fiber node。根据算法，这些逻辑在 completeUnitOfWork 函数中实现。

### Processing updates for span fiber

好，变量 nextUnitOfWork 现在指向了 span Fiber 节点的 alternate，React 开始处理此节点。类似处理 ClickCounter Fiber 节点，我们的程序从 beginWork 开始。

span 节点（Fiber节点）的类型是 HostComponent，这一次在 swicth 条件语句中，React 选择 HostComponent 分支：

```js
function beginWork(current$$1, workInProgress, ...) {
    ...
    switch (workInProgress.tag) {
        case FunctionalComponent: {...}
        case ClassComponent: {...}
        case HostComponent:
          return updateHostComponent(current, workInProgress, ...);
        // case ...
}
```
这次调用了 updateHostCompnoent 函数，可以看到此次调用与在 ClassComponent 分支下调用函数 updateClassComponent 具有一致性。对于函数组件，将调用的函数是 updateFunctionComponent，诸如此类。你可以在 [ReactFiberBeginWork.js](https://github.com/facebook/react/blob/1034e26fe5e42ba07492a736da7bdf5bf2108bc6/packages/react-reconciler/src/ReactFiberBeginWork.js) 文件中找到这些函数。

### Reconciling children for the span fiber

在我们这个例子里，对于更新 span 节点时调用的 updateHostComponent 函数，并无值得多言之处。

### Completing work for the Span node

beginWork 运行完毕，节点进入 completeWork 函数。但在此之前，React 需要更新 span 节点上的 memoizedProps。你应该还记得在 reconciling ClickCounter 的子元素的时候，React 对 span 节点上 pendingProps 的更新操作吧？

```js
{
    stateNode: new HTMLSpanElement,
    type: "span",
    key: "2",
    memoizedProps: {children: 0},
    pendingProps: {children: 1},
    // ...
}
```

因此，对 span 节点执行 beginWork 完毕，React 要更新 memoizedProps 以求与 pendingProps 一致。

```js
function performUnitOfWork(workInProgress) {
    ...
    next = beginWork(current$$1, workInProgress, nextRenderExpirationTime);
    workInProgress.memoizedProps = workInProgress.pendingProps;
    ...
}
```

继而，React 要调用 completeWork 函数，这也是一个大的 switch 条件语句，和 beginWork 类似：

```js
function completeWork(current, workInProgress, ...) {
    ...
    switch (workInProgress.tag) {
        case FunctionComponent: {...}
        case ClassComponent: {...}
        case HostComponent: {
            ...
            updateHostComponent(current, workInProgress, ...);
        }
        case ...
    }
}
```

由于我们的 span 节点的类型是 HostComponent，updateHostComponent 得以执行，它大概要执行以下操作：

- 准备DOM更新数据
- 将更新加入 span 节点的 updateQueue
- 添加 effect （副作用）以实现最终的DOM更新

执行这些之前，span 节点的数据结构像这样：

```js
{
    stateNode: new HTMLSpanElement,
    type: "span",
    effectTag: 0
    updateQueue: null
    // ...
}
```

执行完毕，变为这样：

```js
{
    stateNode: new HTMLSpanElement,
    type: "span",
    effectTag: 4,
    updateQueue: ["children", "1"],
    // ...
}
```

注意这两者的 effectTag 和 updateQueue 之异，effectTag 属性的值不再是 0， 而是 4，二进制来说就是 100，数据的第三位被设置，这正是副作用标签（side-effect tag）：Update。这是在即将到来的 commit 阶段，对 span 节点要做的唯一一个工作（Work）。updateQueue 字段持有更新数据，待执行更新操作的时候使用。

当 React 处理完 ClickCounter 和它的子元素，render 阶段结束。现在可以将完成的 alternate 树赋值给 FiberRoot 的 finishedWork 属性。finishedWork 就是用于将更新（updates）释放（flush）到屏幕上的那个树。而这个 flush 的操作可能是 render 节点之后立马执行，或者在稍后的时候（浏览器给React执行的时间）。

### Effect list

这个例子中，由于 span 元素和  ClickCounter 组件有产生副作用，React 会在 HostFiber 的 firstEffect 属性和 span 节点（Fiber节点）之间建立一个连接（link）。

React 在函数 completeUnitOfWork 中构建 effects list（副作用链表）。本例中，render 阶段之后得到的 Fiber 树，拥有更新 span 元素 text 的 effect 以及 调用 ClickCounter 元素 hooks 的 effect，树的结构如下：

{% include img.html src="http://zxh1989.oss-cn-qingdao.aliyuncs.com/20190201/015019_34672.png" title="effect list" %}
画成线性链表就是：

 
{% include img.html src="http://zxh1989.oss-cn-qingdao.aliyuncs.com/20190201/015130_12620.png" title="linear effect list" %}

### Commit phase

这个阶段开始于函数 [completeRoot](https://github.com/facebook/react/blob/95a313ec0b957f71798a69d8e83408f40e76765b/packages/react-reconciler/src/ReactFiberScheduler.js#L2306)。在执行一切 Work 之前，React 会将 FiberRoot 的 finishedWork 属性的值设置为 null：

```js
root.finishedWork = null;
```

不像前面的 render 阶段，commit 阶段总是同步完成的，从而可以放心地更新 HostRoot，此即表示 commit Work 已经开始。

commit 阶段里，React 更新 DOM、调用变更后（post-mutation）周期函数 componentDidUpdate。为此，React 对 render 阶段构造的 Effect list 进行迭代并应用 Effect。

对于 span 和 ClickCounter 节点，我们在 render 阶段生成了以下 Effects：

```js
{ type: ClickCounter, effectTag: 5 }
{ type: 'span', effectTag: 4 }
```

ClickCounter 节点的 effect tag 值为 5 或者 0b101（二进制），它定义了一个 Update 任务（Work），对于 class 组件，这表示要调用 componentDidUpdate 周期函数。Effect Tag 值的最小位（the least significant bit）也被设置（1），这表示该（Fiber）节点上的全部任务（Work）在 render 阶段已经完成。（*The least significant bit is also set to signal that all work has been completed for this Fiber node in the render phase*）

span 节点的effect tag值位 4 或者 100（二进制），它定义了一个 Update 任务（Work）。对于 span 元素，React 将需要更新元素的 textContent 属性

### Applying Effects
 
现在来看看 React 是如何应用（apply）那些副作用的（effects）。函数 commitRoot 是用来应用 effects 的，它包含了三个子函数的调用：

```js
function commitRoot(root, finishedWork) {
    commitBeforeMutationLifecycles()
    commitAllHostEffects();
    root.current = finishedWork;
    commitAllLifeCycles();
}
```

每个子调用，都对副作用链表（effects list）进行了迭代，以检查 effects 的类型，当发现 effect 与调用函数相关，则应用该 Effect。在我们的例子中，componentDidUpdate 在 ClickCounter 组件上得以调用、span 元素的 text 属性被更新。

第一个函数  [commitBeforeMutationCycles](https://github.com/facebook/react/blob/fefa1269e2a67fa5ef0992d5cc1d6114b7948b7e/packages/react-reconciler/src/ReactFiberCommitWork.js#L183) 查询 Tag 值为 [Snapshot](https://github.com/facebook/react/blob/b87aabdfe1b7461e7331abb3601d9e6bb27544bc/packages/shared/ReactSideEffectTags.js#L25) 的 Effect，并调用 getSnapshotBeforeUpdate 方法。但是由于我们的组件中没有定义这个方法，因此在 render 阶段，React 不会为节点添加这个 Effect。因此，在此情况下，这个函数毫无作用。

### DOM updates

接下来执行的是 [commitAllHostEffects](https://github.com/facebook/react/blob/95a313ec0b957f71798a69d8e83408f40e76765b/packages/react-reconciler/src/ReactFiberScheduler.js#L376) 函数。这里，span 元素的 text 从 0 改为 1，而对于ClickCounter 元素，这个函数没什么用。

这个函数的要义就是选择合适的 Effect 类型，并执行对应的操作。我们这里就是更新 span 元素的 text 值，因此，我们来看看其 Update 分支：

```js
function updateHostEffects() {
    switch (primaryEffectTag) {
      case Placement: {...}
      case PlacementAndUpdate: {...}
      case Update:
        {
          var current = nextEffect.alternate;
          commitWork(current, nextEffect);
          break;
        }
      case Deletion: {...}
    }
}
```

执行到 commitWork，最终我们执行到了 updateDOMProperties 函数。React 用节点的 updateQueue 数据（*render阶段添加的*）来对 span 元素的 textContent 属性进行重设：

```js
function updateDOMProperties(domElement, updatePayload, ...) {
  for (let i = 0; i < updatePayload.length; i += 2) {
    const propKey = updatePayload[i];
    const propValue = updatePayload[i + 1];
    if (propKey === STYLE) { ...} 
    else if (propKey === DANGEROUSLY_SET_INNER_HTML) {...} 
    else if (propKey === CHILDREN) {
      setTextContent(domElement, propValue);
    } else {...}
  }
}
```

DOM 更新之后，React 在 HostRoot 上设置 finishedWork 树，将 alternate 树 设置为当前树（current）

```js
root.current = finishedWork;
```

### Calling post mutation lifecycle hooks

最后一步，就是调用函数 [commitAllLifecycles](https://github.com/facebook/react/blob/d5e1bf07d086e4fc1998653331adecddcd0f5274/packages/react-reconciler/src/ReactFiberScheduler.js#L479)。这里，React 会调用变更后（post-mutation）周期函数。在 render 阶段，React 在 ClickCounter 节点上添加了 Update Effect。commitAllLifecycles 函数会从 Effect list中查找这类Effect以调用 componetDidUpdate 方法。

```js
function commitAllLifeCycles(finishedRoot, ...) {
    while (nextEffect !== null) {
        const effectTag = nextEffect.effectTag;

        if (effectTag & (Update | Callback)) {
            const current = nextEffect.alternate;
            commitLifeCycles(finishedRoot, current, nextEffect, ...);
        }
        
        if (effectTag & Ref) {
            commitAttachRef(nextEffect);
        }
        
        nextEffect = nextEffect.nextEffect;
    }
}
```

这个函数也更新 [refs](https://reactjs.org/docs/refs-and-the-dom.html)，但是我们这里并未用到。在 [commitLifeCycles](https://github.com/facebook/react/blob/e58ecda9a2381735f2c326ee99a1ffa6486321ab/packages/react-reconciler/src/ReactFiberCommitWork.js#L351) 函数中调用的方法：

```js
function commitLifeCycles(finishedRoot, current, ...) {
  // ...
  switch (finishedWork.tag) {
    case FunctionComponent: {...}
    case ClassComponent: {
      const instance = finishedWork.stateNode;
      if (finishedWork.effectTag & Update) {
        if (current === null) {
          instance.componentDidMount();
        } else {
          // ...
          instance.componentDidUpdate(prevProps, prevState, ...);
        }
      }
    }
    case HostComponent: {...}
    // case ...
}
```

你同样可以观察到，这里就是类组件的 hook 函数，在第一次渲染之后，componentDidMount 被调用的地方。

### Ending

本文是翻译而来的，作者是 [Max Koretskyi](https://medium.com/@maxim.koretskyi)，在此表示感谢。后续还有他在Medium上发表的若干文章的翻译，敬请期待。

本人翻译能力有限，有错误、牵强、不当之处，希望能留言指出，谢谢。
