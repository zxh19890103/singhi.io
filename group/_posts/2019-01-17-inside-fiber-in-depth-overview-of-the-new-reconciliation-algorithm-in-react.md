---
layout: post
title: 深入Fiber：React16 新协调算法全面深度剖析
short: React16以来，Reconciliation算法已经由基于Stack的实现更新为基于Fiber的实现，官方为什么要如此设计？又是如何来设计的？本文将给出明确的回答。文本对Fiber的核心思想作了简化以便于读者理解
tags:
  - React
  - Fiber
---

{% include img.html src="http://zxh1989.oss-cn-qingdao.aliyuncs.com/20190127/145120_44667.png" %}

React 是一款用于构建用户界面的库。React是如何跟踪组件内的状态变化并将变化投射到页面上，其核心阐明了这种机制。我们知道在React中，这种机制被称为 reconciliation(调协)。我们调用setState 方法，React 检测组件的状态或属性是否改变，并重新渲染组件到界面上。

对此机制，React 的官方文档对其关键要素给出了高度概括性的描述：React 元素的作用、生命周期函数和 render 方法、以及用于判断组件变化的 DIFF 算法。经过 React 组件 render 方法返回的元素具有不可更变性，其形成一个树结构，通常被称为“Virtual DOM”。这个名词早期很能帮助使用者理解一些东西，但也存在一些叫人困惑的地方，如今 React 官网不再使用之。在本文中，我将一贯称之为React元素树。

除了 React元素树，React 还会有一棵由内部实例（组件、DOM节点等）构成的树，以保持应用的状态。从最新的版本16开始，React 推出了一种新的管理内部实例树的算法，称之为 Fiber。要了解 Fiber 架构带来的优点，请查看另一篇文章《React为何以及如何将Fiber设计为链表结构》（翻译中...）。

>写出这篇文章，我花费了较之更长的时间。倘如没有大神Dan Abramov的帮助，这篇文章的深度将大打折扣！

本篇文章是介绍 React 内部架构的系列的第一篇。在此，我欲对那些重要的概念、涉及算法的数据结构作一个深度而且全面的介绍。一旦我们有了一定的知识背景，我们将去研究一下用于遍历、处理 Fiber 树的算法和主要的函数。系列的次篇，我将演示 React 是如何使用此算法来执行初始渲染和后续的状态、属性更新。我们将深入到 Scheduler（调度）、子节点 reconciliation 处理、构建 effect链表 之原理的细节当中。

我将在此告诉你一些较为高级的知识。希望你能耐心地读完，如此方能识透 Concurrent React 内部运作背后的机关。如果你想要参与到 React 开源项目的开发、维护工作，这一系列的文章也将有所帮助。我是 reverse-engineering 的坚定信徒，因此，文中出现的源链接多来自最新版本16.6.0。

知识量庞大，需要你花费大量的精力，如果有些地方不是很明白，请不要有压力。多花些时间去掌握，那很是值得的。请注意，仅仅是使用 React 来开发项目的话，大可不必去了解这些。这篇文章要介绍的是React 内部工作原理。

### 预备

我准备了一个极其简单的应用，它将贯穿这整个系列。页面上有一个 button，每次点击将导致其右边的数字加一：

{% include img.html src="http://zxh1989.oss-cn-qingdao.aliyuncs.com/20190127/145217_86295.gif" %}

以下代码为其实现：

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


    render() {
        return [
            <button key="1" onClick={this.handleClick}>Update counter</button>,
            <span key="2">{this.state.count}</span>
        ]
    }
}
```

你可以在[这里](https://stackblitz.com/edit/react-t4rdmh)运行它。正如你所看到的，它就是一个很简单的组件，render 方法返回了两个子元素：一个 button、一个 span。点击按钮，组件的状态在事件处理函数中被修改。由此，它将更新 span 元素内的文本。

在整个 reconciliation 期间，React 会存在大量的操作。比如，本示例中，在组件首次渲染以及状态更新之后，React 会存在以下几个操作：

- 更新组件 ClickCounter 状态中的 count 属性
- 获取并比较 ClickCounter 的子节点以及它们的属性
- 更新 span 元素的属性

还有其它一些操作，例如调用生命周期方法（Lifecycle methods）或更新元素引用（Refs）。所有这些操作在 Fiber 架构中被称为 Work（工作单元）。不同种类的元素（React元素）对应不同种类的Work。比如，对于 Class 组件，React 需要创建一个组件的实例，这不会在 Functional 组件上执行。如你所知，我们有很多种（React）元素类型，如 class 和 functional 组件、host 组件（DOM 节点）、portals 等等。React元素的类型（type）由函数 createElement 的第一个参数决定。这个函数一般用于 render 方法中以生成一个 element。

在正式开始介绍这些操作和 fiber 算法的要义之前，让我们首先来熟悉下 React 内部定义的数据结构。

### 从 React 元素到 Fiber 节点

每一个组件都有一个由 render 方法返回的UI呈现，我们可以称之以 View 或者 Template。ClickCounter 组件的 Template 如下：

```html
<button key="1" onClick={this.onClick}>Update counter</button>
<span key="2">{this.state.count}</span>
```

#### React Elements（React元素）
一旦 JSX 编译器编译完一个 Template，你会得到一组 React 元素。这是经 render 方法所真正返回的内容，并不是 HTML。如果我们不想用 JSX，ClickCounter 组件 render 方法返回的内容将是：

```js
class ClickCounter {
    ...
    render() {
        return [
            React.createElement(
                'button',
                {
                    key: '1',
                    onClick: this.onClick
                },
                'Update counter'
            ),
            React.createElement(
                'span',
                {
                    key: '2'
                },
                this.state.count
            )
        ]
    }
}
```

render 方法中调用 React.createElement 将生成两个对象，其数据结构像下面这样：

```js
[
    {
        $$typeof: Symbol(react.element),
        type: 'button',
        key: "1",
        props: {
            children: 'Update counter',
            onClick: () => { ... }
        }
    },
    {
        $$typeof: Symbol(react.element),
        type: 'span',
        key: "2",
        props: {
            children: 0
        }
    }
]
```

你可以看到 React 给这些对象添加了属性 $$typeof，以标识它们是 React 元素。然后，我们有属性 type、key、props，以描述元素。这些值取决于你传入 React.createElement 的参数。特别注意一下，对于 button 和 span 元素的 textContent 属性，React是如何表达的。对于 button 元素的 click 事件处理函数，React 又是如何表达的。还有其它的一些属性，如 ref，这超出了本文的范畴。

由 ClickCounter 组件生成的元素没有任何 props 和 key：

```js
{
    $$typeof: Symbol(react.element),
    key: null,
    props: {},
    ref: null,
    type: ClickCounter
}
```

#### Fiber nodes（fiber节点）

在 reconciliation 期间，由组件的 render 方法所返回的数据会被合并到 fiber 树中。每一个React元素都有一个对应的fiber节点。不像React元素，fiber节点不会在每次render的时候重新创建，它们是可变更的数据结构，fiber以此保存着组件的状态和对 DOM 节点的引用。

我们之前说过，对于不同类型的元素，React 需要做不同的操作。在我们的例子中，对于class组件 ClickCounter ，React 会调用生命周期方法、render 方法；而对于 span 元素，其被称为 host 组件（DOM节点），React 会执行必要的 DOM 变更。因此，每一个 React 元素，根据其类型转为对应类型的 Fiber 节点，Fiber 节点的类型告诉 React 要对此类节点做些什么。

> 你可以这么考虑 Fiber，它以特定的数据结构表达了要做的一些事，或换句话，一个工作单元。Fiber 架构为任务跟踪、任务调度、任务暂停、任务丢弃的实现提供了便利。
 
当一个 React 元素首次被转化为 Fiber 节点的时候，React 使用 element 数据作为参数，来调用函数 [createFiberFromTypeAndProps](https://github.com/facebook/react/blob/769b1f270e1251d9dbdce0fcbd9e92e502d059b8/packages/react-reconciler/src/ReactFiber.js#L414)。随后的更新，React 会复用这些 Fiber 节点，根据新生成的element 数据，仅仅更新那些需要改变的属性。React 可能会根据元素的 key 属性，在 Fiber 结构中移动或移除节点。

> 去看看 ChildReconciler 函数，了解一下 React 对于构建起来的 Fiber 节点，所做的全部操作及其对应的函数实现。

由于 React 会为每一个元素创建 Fiber 节点，这样当我们有了一个元素树之后，也就有了一个 Fiber 节点树。拿我们这个例子来说，其结构类似：

{% include img.html src="http://zxh1989.oss-cn-qingdao.aliyuncs.com/20190127/164841_97912.png" title="React Fiber节点结构" %}

所有 Fiber 节点链接起来，形成了一个链表结构，这得益于节点上的三个属性：child、sibling、return。至于为什么要这样设计，请参考文章《React为何以及如何将Fiber设计为链表结构》。

#### Current and work in progress trees (当前树和工作树)

首次渲染之后，React 持有一个 fiber 节点树，它反映了用以渲染了UI的当前状态。这个树（tree）被引用为 current。应用状态变更的时候，React会构建一个所谓的 workInProgress 树，它反映了一个未来的、用以更新UI的状态。

全部的操作都发生在 workInProgress 树上。React 遍历 current 树时候，对于每个 fiber 节点，创建一个 alternate 节点，这些 alternate 节点组建起了 workInProgress 树。alternate 节点是根据 render 方法返回的数据创建出来的。当状态更新得到处理、并且相关的全部 Work 已完成，React 拥有了一个 alternate 树，它将被绘制到界面上。当这个 alternate 树（也就是workInProgress树）被绘制到界面上，它就变为 current 树。

React 的核心理念之一就是一致性（consistency）。React 总是一气呵成地完成全部的 DOM 更新，而非部分地进行。workInProgress 树充当草稿的作用，对于用户不可见，因此 React 可以先处理全部的组件更新，然后来将变化反映到UI上。

在 React 源码中，你会发现。存在很多的函数，它们同时接收了 current 和 workInProgress 树上的 fiber 节点。下面是个例子：

```js
function updateHostComponent(current, workInProgress, renderExpirationTime) {
  // ...
}
```
每个 fiber 节点持有来自其它树（current、workInProgress）的对偶节点，它被存储在 alternate 字段中。一个来自 current 树的节点的 alternate 属性指向来自 workInProgress 树的一个与之对偶的节点，相反也是如此。

#### Side-effects
我们可以这样看待 React 组件，它是一个函数，使用状态（state）、属性（props）来计算UI呈现。其它的操作，例如更新DOM、调用生命周期方法，应该被称作 side-effect，或者简单些，叫做 effect。Effects 在官方文档中也提到过：

> You’ve likely performed data fetching, subscriptions, or manually changing the DOM from React components before. We call these operations “side effects” (or “effects” for short) because they can affect other components and can’t be done during rendering.

你可以看到，多数状态、属性的变更将导致 side-effect。由于应用（apply） effect（使 effect 生效、用户可体验）是一种类型的工作（Work），fiber 节点的运行机制可以方便地对于 effect，包括状态更新（updates），进行跟踪。每一个 fiber 节点会有 effects 与之相关联，它们的值被编码并存放在 effectTag 字段中。

因此在 Fiber 中，组件实例的更新得以处理之后，effects 对需要做的工作（Work）做了基本定义。对于 host 组件（DOM元素）这些工作（Work）包括添加、更新、移除元素。对于 class 组件，React 可能会更新 refs、调用 componentDidMount、componentDidUpdate 等生命周期函数。对于其它类型的 fiber 节点，对应不同的 effects。

#### Effects list（Effect 链表）

React 处理更新非常之快，为了达到这样的性能，它使用了几个有趣的技术。其中之一，就是将 fiber 节点构建成一个链表结构，节点携带 effects，这样可快速迭代。线性迭代比树形迭代要快得多，并且React 不会在没有 side-effects 的节点上浪费时间。

Effect 链表存在的目的是，标记 fiber，告诉 React，有 DOM 更新或其它类型的 Work 要做。它是 finishedWork 树的一个子集，以 nextEffect 属性联系起来（`current和workInProgress树用的是child属性`）。

Dan Abramov 给出了一个 effect 链表的结构图。他喜欢称之为结着圣诞灯的圣诞树，这些灯将包含有 effect 的节点联系在一起。为使其可视化，让我们来想象，以下这个 fiber 树，高亮的节点表示其有 effect，有等待处理的 Work。举个例子，c2 节点将被插入到 DOM 中，d2 和 c1 需要修改属性，b2 即将触发周期方法。effect 链表将如此链接起来，以便 React 能够跳过其它节点：

{% include img.html src="http://zxh1989.oss-cn-qingdao.aliyuncs.com/20190127/181245_60244.png" title="Effects list" %}

你能看到，这些包含 effects 的节点是如何联系到一起的。遍历节点的时候，React 使用 firstEffect 指针来决定从链表的何处开始。因此，上图可以表现为线性形式如下：

{% include img.html src="http://zxh1989.oss-cn-qingdao.aliyuncs.com/20190127/181604_73989.png" title="Effect linear list" %}

可以看到，React 以从子到父的顺序应用 effects。

### Root of the fiber tree（fiber树的根）
每一个React 应用都有至少一个 DOM 元素充当容器。在我们的这个例子中，它是一个 ID = container 的 div 元素。

```js
const domContainer = document.querySelector('#container');
ReactDOM.render(React.createElement(ClickCounter), domContainer);
```

React 会为每一个容器创建一个 fiber root 对象，你可以用根 DOM 元素的以下属性访问到这个对象：

```js
const fiberRoot = query('#container')._reactRootContainer._internalRoot
```

React 以此持有整个 fiber 树，它存储在 current 属性中：

```js
const hostRootFiberNode = fiberRoot.current
```

fiber tree 始于一个特殊的 fiber 节点类型，即 HostRoot。它由内部创建，作为根级组件所属 fiber 节点的父节点。它有一个 stateNode 属性，用以指向 fiberRoot 对象：

```js
fiberRoot.current.stateNode === fiberRoot; // true
```

由此，你可通过 fiber root 拿到 HostRoot 根节点，来遍历整个 fiber 树。或者，你也可以拿到任意一个 React 组件实例对应的 fiber 节点，以此方式：

```js
compInstance._reactInternalFiber
```

#### fiber node structure（fiber节点的数据结构）

现在，我们来看看由 ClickCounter 创建来的fiber节点的数据结构：

```js
{
    stateNode: new ClickCounter,
    type: ClickCounter,
    alternate: null,
    key: null,
    updateQueue: null,
    memoizedState: {count: 0},
    pendingProps: {},
    memoizedProps: {},
    tag: 1,
    effectTag: 0,
    nextEffect: null
}
```
以及 span 这个 DOM 元素的 fiber node：

```js
{
    stateNode: new HTMLSpanElement,
    type: "span",
    alternate: null,
    key: "2",
    updateQueue: null,
    memoizedState: null,
    pendingProps: {children: 0},
    memoizedProps: {children: 0},
    tag: 5,
    effectTag: 0,
    nextEffect: null
}
```

还有许多其它的字段，不在此列举。我在上一部分中解释过字段 alternate、effectTag 和 nextEffect 的作用，现在让我们来看看为什么需要其它几个。

**stateNode**

对当前 fiber node 所关联的组件实例、DOM 节点或者其它 React 元素的引用。一句话，我们可以说这个字段存储了 fiber node 的本地状态。

**type**

定义了 fiber node 相关联的 function 或 class。对于 class 组件，它指向其构造函数；对于 DOM 元素，它是 HTML 标签。我常常使用这个字段来了解一个 fiber node 所关联的是什么样的元素。

**tag**

定义 fiber node 自己的类型。它告诉 reconciliation 算法，对于一个 fiber node，该执行什么样的 Work。前面提到，Work 因 React 元素的类型不同而不同。函数 [createFiberFromAndProps](https://github.com/facebook/react/blob/769b1f270e1251d9dbdce0fcbd9e92e502d059b8/packages/react-reconciler/src/ReactFiber.js#L414) 将各类型的 React 元素映射为对应类型的 fiber node。在我们的应用中，对于 ClickCounter 组件，属性 tag 的值为 1，它表示 ClassComponent；对于 span 元素，tag 的值为 5，它表示 HostComponent。

**updateQueue**

一个承载状态更新、回调、DOM变更等数据的队列。

**memoizedQueue**

用来产生了输出（子组件）的状态数据，正在处理更新的时候，它反映了当前已经用以渲染到UI上的状态。

**memoizedProps**

在前一轮的渲染中，已经用来产生了输出（子组件）的属性数据。

**pendingProps**

由 React 元素的新数据，更新之后的属性数据，它将要被用到子组件或 DOM 元素上。

**key**

用于标识一组子节点中的每个节点的唯一性。它帮助 React 辨识那些项发生了改变，需要从子节点组中添加或移除。React 文档对此有[描述](https://reactjs.org/docs/lists-and-keys.html#keys)。


你可以去 [GitHub](https://github.com/facebook/react/blob/6e4f7c788603dac7fccd227a4852c110b072fe16/packages/react-reconciler/src/ReactFiber.js#L78) 上查看 fiber node 的完整结构，上面的解释中，我忽略了很多的字段。尤其是，我跳过了 child、sibling、return 这三个用来构建树结构的字段，关于这个，我在[前一篇文章](https://medium.com/dailyjs/the-how-and-why-on-reacts-usage-of-linked-list-in-fiber-67f1014d0eb7)有解释。至于 expirationTime、childExpirationTime 和 mode 字段，它们属于 Scheduler 范畴。

### General algorithm（算法梗概）

React 执行工作（Work）分为两个阶段：render 和 commit。

在首次 render 阶段，通过调用 setState 或 React.render 计算出来的UI更新的数据表达被列入调度队列，React 按照调度队列将这些更新的数据表达应用（apply）到组件上。如果这是首次 render，React 将为每一个组件，根据其 render 方法的返回值，创建一个 fiber node。在后续的更新，对于尚存在的组件，其对应的 fiber node 会被复用并得以更新。render 阶段的结果就是一个标记着 side-effects 的 fiber 树。这些 effect 描述了将要在 commit 阶段完成的工作（Work）。在 commit 阶段，React 获得了一个标记着 effects 的 fiber 树，并将 effects 应用到组件实例上。React 遍历整个effects 链，执行 DOM 更新以及其它用户可见的变化。

**很重要的一点，你需要知道**，render 阶段的 Work 可以异步地去完成。React 可以根据可用的时间，来处理一个或多个 fiber node，然后停止，将做完的 Work 暂存起来，转而去响应一些事件。接着，React 将从暂停的地方开始继续执行 Work，有些时候，它可能会忽略之前完成的 Work，从头来。这个阶段发生的一些暂停不会导致用户可见的变化，比如 DOM 更新。相反，接下来的 commit 阶段却总是同步的。这是因为这个阶段要执行的工作会导致用户界面的变化（用户可见）。这就是为什么 React 需要一次性地搞定它。

调用生命周期方法是 React 要执行的 Work 中的一种。其中有一些方法在 render 阶段调用，另外一些在 commit 阶段调用。以下列出在 render 阶段需要调用的生命周期函数：

- [UNSAF_E_]componentWillMount (deprecated)
- [UNSAF_E_]componentWillReceiveProps (deprecated)
- getDer_ivedStateFromProps
- should_ComponentUpdate
- [UNSAF_E_]componentWillUpdate (deprecated)
- render

你一定注意到了，其中一些遗留的周期方法从版本16.3开始，被标记了 UNSAFE。在官方文档中，它们现在被称为历史遗留周期方法。它们将在版本 16.x 发布的时候不建议使用，其对应的函数（无 UNSAFE 前缀），将在版本 17.0 的时候被移除。关于这些变化以及迁移建议，你可以去官方文档了解更多。

你一定对 UNSAFE 感到好奇，对吧？

好的，我们方才了解到 render 阶段不会产生如 DOM 更新的 side-effect，React 可以异步地来处理组件的更新（理论上，甚至可以多线程处理）。然而，被标记为 UNSAFE 的那些周期函数经常被误解并且无意误用。开发者会想着把产生 side-effects 的代码放到这些函数中，这样可能会导致新的异步渲染（render）。尽管只将移除对应的无 UNSAFE 前缀的周期函数，这些 Unsafe 的周期函数，在即将上场的 Concurrent 模式下，仍然会导致一些问题。

在 commit 阶段，以下方法会被调用：

- getSnapshotBeforeUpdate
- componentDidMount
- componentDidUpdate
- componentWillUnmount

由于这些方法是同步执行，它们可能包含产生 side-effect（下一轮 commit 处理）、操作 DOM 的代码。

好了，我们现在有了一定的基础，是时候了解下遍历树并执行 Work 的算法概要。让我们沉浸下去吧！

### Render phase

我们的 reconciliation 算法（就是DIFF算法）总是从最顶级的 fiber 节点开始，使用的是 renderRoot 函数。当然了，React 会跳过那些已经处理过的或无需处理的节点，直到找到一个携有待处理 Work 的节点。举例来说，如果你在组件树的深层节点调用了 setState ，React 将从树根开始遍历，但是跳过多层父组件之后，很快便能找到这个组件。

#### Main steps of work loop

所有的 fiber 节点都在一个叫做  work loop  循环中得以处理。以下是这个循环同步部分的实现：

```js
function workLoop(isYieldy) {
  if (!isYieldy) {
    while (nextUnitOfWork !== null) {
      nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    }
  } else {...}
}
```

以上代码中，nextUnitOfWork 持有来自 workInProgress 树的一个 fiber 节点，这个节点有待处理的 Work。在 React 遍历 Fiber 树的时候，它使用这个变量来判断是否还有其它包含待处理 Work 的 fiber 节点。当前节点的 Work 处理完毕，nextUnitOfWork 将指向下一个节点或者 null。一旦为 null，React 将退出 Work loop，并准备进入 commit 阶段以提交变化。

主要有4个函数，来遍历 Fiber 树，初始化或者结束一个 Fiber 上的 Work：

- performUnitOfWork
- beginWork
- completeUnitOfWork
- completeWork

为了演示它们是如何运行的，看下下面的遍历 fiber 树的动画。为演示起见，我对这些函数做了精简化实现。每一个函数接收一个 fiber 节点，随 React 深入到树的各个节点，可以看到当前正在被处理的节点（注意颜色）如何变化。通过视频，你可以清楚的看到我们的算法是如何从一个分支到另一个分支。它首先完成子节点上的 Work，然后移至父节点。

{% include img.html src="http://zxh1989.oss-cn-qingdao.aliyuncs.com/20190127/234224_88123.gif" title="Fiber节点遍历，蓝色表示初始状态，橙色表示正在处理状态，绿色表示处理完毕" %}

*注意，纵向链接表示兄弟节点，横向链接表示子节点，比如 b1 没有子节点，而 b2 有一个子节点 c1 。*

提供一下[视频链接](https://vimeo.com/302222454)，借此，你可以暂停播放来观察当前节点的状态以及4个函数调用情况。从概念上来说，你可以将“begin”考虑为“stepping into”到一个组件中，将“complete”考虑为从这个组件中“stepping out”。你也可来研究下这个示例和实现，链接在此，这里我说明了这些函数都做了些什么。

现在来看看前面两个函数 performUnitOfWork 和 beginWork：

```js
function performUnitOfWork(workInProgress) {
    let next = beginWork(workInProgress);
    if (next === null) {
        next = completeUnitOfWork(workInProgress);
    }
    return next;
}

function beginWork(workInProgress) {
    console.log('work performed for ' + workInProgress.name);
    return workInProgress.child;
}
```

函数 performUnitOfWork 从 workInProgress 树接收一个 fiber node，通过调用 beginWork 函数开始处理节点 Work。全部的 Work 均在函数 beginWork 中处理。见于演示之用，我们只是简单地 console.log 出 fiber 节点的 name 属性，以表示 Work 已经被处理掉。beginWork 总是返回下一个 child 的引用或者 null。

如果存在下一个 child，它将在 workLoop 函数中被赋值给变量 nextUnitOfWork 。如果没有下一个 child，React 知道已经到了当前分支终点，因此可以结束当前节点。一旦节点结束处理，React 需要处理兄弟节点上的 Work，之后返回到父节点。这些在函数 completeUnitOfWork 中完成：

```js
function completeUnitOfWork(workInProgress) {
    while (true) {
        let returnFiber = workInProgress.return;
        let siblingFiber = workInProgress.sibling;

        nextUnitOfWork = completeWork(workInProgress);

        if (siblingFiber !== null) {
            // If there is a sibling, return it
            // to perform work for this sibling
            return siblingFiber;
        } else if (returnFiber !== null) {
            // If there's no more work in this returnFiber,
            // continue the loop to complete the parent.
            workInProgress = returnFiber;
            continue;
        } else {
            // We've reached the root.
            return null;
        }
    }
}

function completeWork(workInProgress) {
    console.log('work completed for ' + workInProgress.name);
    return null;
}
```

你可以注意到这个函数是一个大的 while 循环。React 在 workInProgress 没有 child 的时候进入这个函数。在结束当前节点 Work 之后，检查是否有兄弟节点。如果有，函数返回对这个兄弟节点的引用。React 将这个节点引用赋值给变量 nextUnitOfWork，并开始处理以这个兄弟节点开端的分支。一定要明白，这个时候，React 已经结束了之前的兄弟节点上的 Work，父节点上的 Work 还没有结束呢。只有所有自子节点开端的分支上的 Work 得以结束，React 才会来结束父节点的 Work，并原路返回。

从实现你可以看到，performUnitOfWork 和 completeUnitOfWork 主要用于迭代之目的，而主要的、实质的工作在 beginWork 和 completeWork 两个函数中完成。在下一篇文章中，我们将了解到对于 ClickCounter 组件和 span 节点，beginWork 和 completeWork 都做了些什么。

### Commit phase

这个阶段始于函数completeRoot。此时，React 开始更新 DOM 并且调用更新前、后的生命周期方法。

当 React 进入这个阶段，存在 2 个树和一个 effect 链表。第一个是已经呈现到UI的树，然后还有一个 alternate 树，它创建于 render 阶段，在源码中被叫做 finishedWork 或者 workInProgress， 并且将要呈现到UI。和 current 树类似，alternate 树也通过 child、sibling、return 指针构成。

effect 链表是 finishedWork 树的一个子集，它们仰仗 nextEffect 指针形成。记住，effect 链表是 render 阶段结束后的产物。 render 阶段的全部要义就是明确哪些 DOM 节点要插入、更新、删除，哪些组件需要触发其生命周期方法，这些最后都由 effect list 告诉我们。实际上，commit 阶段要遍历的仅是这个链表！

> 见于调试目的，current 树可通过fiber root的 current 属性访问。finishedWork 树可以通过current树的 HostFiber 节点的 alternate 属性访问获得。

commit 期间需要调用的主要函数是 commitRoot。它基本上做了以下几件事：

- 对于标记以 Snapshot effect 的节点，调用周期函数 getSnapshotBeforeUpdate
- 对于标记以 Deletion effect 的节点，调用周期函数 componentWillUnmount
- 执行全部的DOM插入、更新、移除操作
- 将 finishedWork 树设置为当前树（current）
- 对于标记以 Placement effect 的节点，调用周期函数 componentDidMount
- 对于标记以 Update effect 的节点，调用周期函数 componentDidUpdate

当调用了更变前（pre-mutation）方法 getSnapshotBeforeUpdate 之后，React 提交树中全部的 - side-effects，这个分两步走。第一步，执行全部的 DOM（host）插入、更新、移除，以及 ref 的释放。接着，React 将 finishedWork 树赋值给 FiberRoot 并将 workInProgress 树标记为 current 树。这些在 commit 阶段的第一步完成，因此，在 componentWillUnmount 的时候，current 树依然是之前的（有不明确之处）。在第二步，React 调用全部其它的周期方法以及 ref callbacks。这些方法在在单独的一步- 里来执行，因此可以确保之前在整个树上所发生的DOM变更都已经得到执行。

commitRoot 函数的实现大概如下：

```js
function commitRoot(root, finishedWork) {
    commitBeforeMutationLifecycles()
    commitAllHostEffects();
    root.current = finishedWork;
    commitAllLifeCycles();
}
```

每一个在其中调用子函数都会去迭代 effect list，检查 effect 的类型（type）。当发现 effect 适于在当前函数中使用，则使用（applies）之。

#### Pre-mutation lifecycle methods

以下是一个示例，遍历整个 effect 链表并检查存在标记有 Snapshot effect 的节点：

```js
function commitBeforeMutationLifecycles() {
    while (nextEffect !== null) {
        const effectTag = nextEffect.effectTag;
        if (effectTag & Snapshot) {
            const current = nextEffect.alternate;
            commitBeforeMutationLifeCycles(current, nextEffect);
        }
        nextEffect = nextEffect.nextEffect;
    }
}
```

对于 class 组件，这个 effect 意味着要调用 getSnapshotBeforeUpdate 周期方法。

#### DOM updates
[commitAllHostEffects](https://github.com/facebook/react/blob/95a313ec0b957f71798a69d8e83408f40e76765b/packages/react-reconciler/src/ReactFiberScheduler.js#L376) 函数用于执行DOM变更。它基本上就是定义了几种类型的待处理的操作，并且处理之：

```js
function commitAllHostEffects() {
    switch (primaryEffectTag) {
        case Placement: {
            commitPlacement(nextEffect);
            ...
        }
        case PlacementAndUpdate: {
            commitPlacement(nextEffect);
            commitWork(current, nextEffect);
            ...
        }
        case Update: {
            commitWork(current, nextEffect);
            ...
        }
        case Deletion: {
            commitDeletion(nextEffect);
            ...
        }
    }
}
```

有趣的是，React 会将 componentWillUnmount 当作删除操作的一部分，在 commitDeletion 函数中来调用。

#### Post-mutation lifecycle methods

函数 [commitAllLifecycles](https://github.com/facebook/react/blob/95a313ec0b957f71798a69d8e83408f40e76765b/packages/react-reconciler/src/ReactFiberScheduler.js#L465) 是 React 用来调用剩余周期方法 componentDidUpdate 和 componentDidMount 的。

### 结束
本文是翻译而来的，作者是 [Max Koretskyi](https://medium.com/@maxim.koretskyi)，在此表示感谢。后续还有他在 Medium 上发表的若干文章的翻译，敬请期待。

本人翻译能力有限，有错误、牵强、不当之处，请留言指出，谢谢。
