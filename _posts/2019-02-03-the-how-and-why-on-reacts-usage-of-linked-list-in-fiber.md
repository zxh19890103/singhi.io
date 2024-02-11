---
layout: post
title: React 如何以及为何在 Fiber 架构中使用链表结构来遍历组件树
short: 我在Web逆向工程技术上花了不少的时间，写下了自己的发现，以助于自己和社区的学习、成长。去年（2017年）的时候，我的注意力集中在Angular的源码，并在网上发表了我的分析成果——深入Angular
tags:
  - React
  - Fiber
category: tech
---
 
{% include img.html src="http://zxh1989.oss-cn-qingdao.aliyuncs.com/20190202/225837_64986.png" title="Work loop representation from an amazing talk by Lin Clark at ReactConf 2017" %}

我在[Web逆向工程技术](https://blog.angularindepth.com/practical-application-of-reverse-engineering-guidelines-and-principles-784c004bb657)上花了不少的时间，写下了自己的发现，以助于自己和社区的学习、成长。去年（2017年）的时候，我的注意力集中在Angular的源码，并在网上发表了我的分析成果——[深入Angular](https://blog.angularindepth.com/)。现在，我开始沉浸于分析React。对于Angular，更新检测是我主要的研究领域，并且达到了相当的深度，为此，我怀持着极大的耐心完成了大量的调试。希望对于React，我能达到这样的深度。

在React中，更新检测机制常被称为 reconciliation (调协或者一致性比较) 或者 rendering，Fiber 是其最新实现。Fiber 架构给予 React 许多有意思的特性，比如：非阻塞性 rendering、基于优先级的任务执行、后台预渲染等。这些特性在 [Concurrent React](https://twitter.com/acdlite/status/1056612147432574976) 思想中被称为 time-slicing（时间切片）。

基于 Fiber 架构的 React 的内部运行机制，除解决使用者的实际问题，从工程角度也具有广泛的意义。其源码包含了大量的知识，以供开发者们去学习、成长。

今天，如果去 Google “React Fiber” 关键词，你将获得大量的结果。这当中，[Andrew Clark的笔记](https://github.com/acdlite/react-fiber-architecture)解释得相当透彻，此外，没什么好的东西。本文中，我将借鉴他的这则笔记，来对 Fiber 中的一些重要概念给出具体的解释。这之后，你将拥有足够的知识去理解[Lin Clark在ReactConf 2017一次非常棒的演讲](https://www.youtube.com/watch?v=ZCuYPiUIONs)中提到的所谓任务循环（Work loop）。那个演讲你需要去看看，但是如果你愿意花费一些时间去看看源码，将更有帮助。

[这是剖析React Fiber内部运行机制系列的首篇文章](https://medium.com/react-in-depth/inside-fiber-in-depth-overview-of-the-new-reconciliation-algorithm-in-react-e1c04700ef6e)。我对此内部实现细节理解了70%，写了3篇关于任务调度和渲染机制的文章。

让我们开始吧！

### Setting the background（背景）

Fiber 架构主要有两大阶段：reconciliation / render （调协）以及 commit （提交）。在源码中，reconciliation 阶段大多称为 “render phase”。这个阶段，React 遍历组件树并完成下边几个事：

- 更新状态、属性
- 调用生命周期函数
- 获取组件的子元素
- 和之前的子元素进行比较
- 计算出需要需要做怎样的DOM操作

所有的这些活动，在 Fiber 架构内部均被称为 Work（任务）。需要完成的 Work 的类型由 React 元素的类型来决定。例如，对于 Class 组件，React 需要实例化这个 Class，而对于 Functional 组件，这不必要。如果你有兴趣，可以参阅此文，可以看到 Fiber 架构中全部的 Work 类型。这些任务（Work）是什么？Andrew在演讲中说得很清楚：

>When dealing with UIs, the problem is that if too much work is executed all at once, it can cause animations to drop frames…

怎么理解 “all at once”？基本上，如果React同步地来遍历整个组件树，并完成每个组件上的Work，对于一个应用这大概需要16ms以完成逻辑执行。而这将引发丢帧，从而导致视觉上的卡顿效果。

这个问题有解决之道吗？

>Newer browsers (and React Native) implement APIs that help address this exact problem…

Andrew 提到的这个 API 就是 [requestIdleCallback](https://developers.google.com/web/updates/2015/08/using-requestidlecallback)，它能将一个函数加入队列，并在浏览器空闲的时候来执行之。

```js
requestIdleCallback((deadline)=>{
    console.log(deadline.timeRemaining(), deadline.didTimeout)
});
```

打开浏览器的控制台，Chrome 将打印 `49.9 false` 。这个结果说的是，我还有 `49.9ms` 来处理任务我想处理的事，以及我还没有用完分配给我的时间，否则 `deadline.didTimeout` 将会是 `true`。需要记住，一旦浏览器收到任务 `timeRemaining` 的值是会变化的，因此需要实时检测这个值。

> requestIdleCallback is actually a bit too restrictive and [is not executed often enough](https://github.com/facebook/react/issues/13206#issuecomment-418923831) to implement smooth UI rendering, so React team [had to implement their own version](https://github.com/facebook/react/issues/13206#issuecomment-418923831).

现在，如果我们将 React 在一个组件上要执行的任务放入一个函数 perforWork 中，并使用 requestCallback 来调度，我们的代码看起来是这样的：

```js
requestIdleCallback((deadline) => {
    // while we have time, perform work for a part of the components tree
    while ((deadline.timeRemaining() > 0 || deadline.didTimeout) && nextComponent) {
        nextComponent = performWork(nextComponent);
    }
});
```

我们完成了一个组件上的任务之后，返回下一个有待处理任务的组件。你不能同步地处理整个组件树，就像之前的 reconciliation 算法实现。关于这个问题，正如 Andrew 所说：

> in order to use those APIs, you need a way to break rendering work into incremental units

因而，React 需要重新实现这个算法，以将之前基于内部栈的同步递归遍历模型，换为如今的基于链表结构的异步模型。Andrew 如是写到：

> If you rely only on the [built-in] call stack, it will keep doing work until the stack is empty…Wouldn’t it be great if we could interrupt the call stack at will and manipulate stack frames manually? That’s the purpose of React Fiber. Fiber is re-implementation of the stack, specialized for React components. You can think of a single fiber as a virtual stack frame.

这也是我将要解释的内容。

### A work about stack（关于调用栈）

我假设你们都已经对调用栈的概念很熟悉了。这个就是当在代码中打了断点之后，在浏览器的调试工具中看到的东西。以下是来自维基百科提供的图文解释；

> In computer science, a call stack is a stack data structure that stores information about the active subroutines of a computer program… the main reason for having call stack is to keep track of the point to which each active subroutine should return control when it finishes executing… A call stack is composed of stack frames… Each stack frame corresponds to a call to a subroutine which has not yet terminated with a return. For example, if a subroutine named DrawLine is currently running, having been called by a subroutine DrawSquare, the top part of the call stack might be laid out like in the adjacent picture.

{% include img.html src="http://zxh1989.oss-cn-qingdao.aliyuncs.com/20190203/123244_77856.png" title="call stack" %}

### 为什么 stack 和 React 有关

按照我在在前面的定义，React 在render 阶段遍历组件树并执行组件上的任务。之前的 reconciler 实现是基于内置栈来同步递归整个树，官方文档对此处理方式做了详尽了描述：

> By default, when recursing on the children of a DOM node, React just iterates over both lists of children at the same time and generates a mutation whenever there’s a difference.

细想一下，每一个递归调用都将向栈中加入一帧，这是如此的同步！假设我们有了以下组件树：

{% include img.html src="http://zxh1989.oss-cn-qingdao.aliyuncs.com/20190203/123932_30433.png" title="tree of compnents" %}

`render` 方法返回的是一些对象的数组，将它们看作组件实例即可：

```js
const a1 = {name: 'a1'};
const b1 = {name: 'b1'};
const b2 = {name: 'b2'};
const b3 = {name: 'b3'};
const c1 = {name: 'c1'};
const c2 = {name: 'c2'};
const d1 = {name: 'd1'};
const d2 = {name: 'd2'};

a1.render = () => [b1, b2, b3];
b1.render = () => [];
b2.render = () => [c1];
b3.render = () => [c2];
c1.render = () => [d1, d2];
c2.render = () => [];
d1.render = () => [];
d2.render = () => [];
```

React 需要迭代这个树结构，并为每个组件执行任务。为简化起见，要做的任务是打印出当前组件的名字并获取子元素。

### Recursive traversal （递归遍历）

用于迭代整棵树的函数叫 walk，其实现如下：

```js
walk(a1);

function walk(instance) {
    doWork(instance);
    const children = instance.render();
    children.forEach(walk);
}

function doWork(o) {
    console.log(o.name);
}
```

以下是输出：

```sh
a1, b1, b2, c1, d1, d2, b3, c2
```

如果你不能把递归理解得明白，可以参考这个文章《[my in-depth article on recursion](https://medium.freecodecamp.org/learn-recursion-in-10-minutes-e3262ac08a1)》。

用递归的方式实现是非常直觉的，对于树结构其正适合不过。但是正如我们所发现的，它有局限性。最大的问题就是，我们不能够将这个组件上的任务划分为增量单元。我们无法在处理某个组件时停止调协工作，并在稍后继续。以目前的这种方式，React 只能不停地迭代下去，直到全部的组件被处理完，并且栈为空。

那么，React 是如何实现这个算法以使遍历不依靠递归的呢？它使用了一个单向链表树（linked list tree）结构的遍历算法。这样，暂停任务变为可能，也防止了调用栈的增长。

### Linked list traversal （链表遍历）

我非常幸运地发现了 Sebastian Markbage 对调协（conciliation）算法提供的[核心原理说明](https://github.com/facebook/react/issues/7942#issue-182373497)。要实现这个算法，我们需要包含以下三个字段的数据结构：

- child —— 指向第一个子节点
- sibling —— 指向第一个兄弟节点
- return —— 指向父节点

在 React 的新版调度算法中，这个结构被称为 Fiber。*Under the hood it’s the representation of a React Element that keeps a queue of work to do. More on that in my next articles*。

下图演示了链表的层级结构，以及它们之间的关联：

{% include img.html src="http://zxh1989.oss-cn-qingdao.aliyuncs.com/20190203/131519_44743.png" title="hierarchy of objects linked through the linked list" %}

下边定义了节点的构造函数；

```js
class Node {
    constructor(instance) {
        this.instance = instance;
        this.child = null;
        this.sibling = null;
        this.return = null;
    }
}
```

以及用于将节点联系起来的的那个函数，它有一个节点数组作为参数。我们将使用它来关联子节点（ render 方法返回）

```js
function link(parent, elements) {
    if (elements === null) elements = [];

    parent.child = elements.reduceRight((previous, current) => {
        const node = new Node(current);
        node.return = parent;
        node.sibling = previous;
        return node;
    }, null);

    return parent.child;
}
```

这个函数从最后一个节点开始，对整个子节点数组进行迭代，将它们联系成一个单向链表（singly linked list）。他返回了节点数组中的第一个。以下演示了这是如何进行的：

```js
const children = [{name: 'b1'}, {name: 'b2'}];
const parent = new Node({name: 'a1'});
const child = link(parent, children);

// the following two statements are true
console.log(child.instance.name === 'b1');
console.log(child.sibling.instance === children[1]);
```

我们要为处理节点任务写一个帮助函数，在我们这个例子中，它要做的是打印出组件的名字，同时也需要获得子组件并建立联系。

```js
function doWork(node) {
    console.log(node.instance.name);
    const children = node.instance.render();
    return link(node, children);
}
```

好了，我们现在来实现主要的遍历算法，它是基于父节点优先、深度优先实现的，这里是包含了一些必要注释的代码：

```js
function walk(o) {
    let root = o;
    let current = o;

    while (true) {
        // perform work for a node, retrieve & link the children
        let child = doWork(current);

        // if there's a child, set it as the current active node
        if (child) {
            current = child;
            continue;
        }

        // if we've returned to the top, exit the function
        if (current === root) {
            return;
        }

        // keep going up until we find the sibling
        while (!current.sibling) {

            // if we've returned to the top, exit the function
            if (!current.return || current.return === root) {
                return;
            }

            // set the parent as the current active node
            current = current.return;
        }

        // if found, set the sibling as the current active node
        current = current.sibling;
    }
}
```

尽管这并不难于理解，你还是需要去亲自运行一下。这个想法就是定义一个变量，指向当前 Fiber 节点，当深入树结构当中时，变量指向新的节点，直到分支的结束。然后，我们使用 return 指针来返回到共同的父节点。

如果我们看看调用栈的情况，将如下图：

{% include img.html src="http://zxh1989.oss-cn-qingdao.aliyuncs.com/20190203/133346_86886.gif" title="call stack based on this implementation" %}

你可以看到，调用栈并没有深入到树中。但是如果在 roWork 函数中打个断点，并输出节点的名字，我们可以看如下输出：

{% include img.html src="http://zxh1989.oss-cn-qingdao.aliyuncs.com/20190203/133608_13055.gif" title="output name of nodes" %}

这就像浏览器中的一个回调，因此以这个算法，我们高效地将浏览器自己对调用栈的实现替换为我们自己的实现。这也就是 Andrew 所说的：

> Fiber is re-implementation of the stack, specialized for React components. You can think of a single fiber as a virtual stack frame.

由于现在我们可以控制调用栈，并保证当前节点始终在头帧被访问（top frame）：

```js
function walk(o) {
    let root = o;
    let current = o;

    while (true) {
            ...

            current = child;
            ...
            
            current = current.return;
            ...

            current = current.sibling;
    }
}
```

我们能够在遍历的任何时候暂停，并在稍后继续。这是我们可以去使用浏览器新的 API requestIdleCallback 的条件。

### Work loop in React （React 中的任务循环）

React 里实现任务循环的代码在此：

```js
function workLoop(isYieldy) {
    if (!isYieldy) {
        // Flush work without yielding
        while (nextUnitOfWork !== null) {
            nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
        }
    } else {
        // Flush asynchronous work until the deadline runs out of time.
        while (nextUnitOfWork !== null && !shouldYield()) {
            nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
        }
    }
}
```

可以看到，它的这个算法很像我上边写的，它定义了一个全局变量 nextUnitOfWork 用来保存当前需要处理的节点。

这个算法可以同步的遍历节点树，并执行树中（nextUnitOfWork）每个节点上的任务（Work）。这通常是所谓的由UI事件（click、input等）引发的交互更新。或者，它亦可根据可用于处理节点的剩余时间，异步地遍历整个组件树。函数 shouldYield 返回的结果基于 deadlineDidExpire 和 deadline 这两个常变的变量（React 处理节点任务的时候）。

函数 permUnitOfWork 在[此处有详细讨论](https://medium.com/react-in-depth/inside-fiber-in-depth-overview-of-the-new-reconciliation-algorithm-in-react-e1c04700ef6e#1a7d)。

### 结束

本文是翻译而来的，作者是 Max Koretskyi，在此表示感谢。后续还有他在 Medium 上发表的若干文章的翻译，敬请期待。

本人翻译能力有限，有错误、牵强、不当之处，希望能留言指出，谢谢。
