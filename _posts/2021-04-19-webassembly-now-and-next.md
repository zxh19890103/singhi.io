---
layout: post
title: WebAssembly 系列 - 现在与未来
short: 今年，2017 年，二月28日，4 大浏览器一致表示他们已经完成了针对 WebAssembly 的 MVP 版本的发布
src: https://hacks.mozilla.org/2017/02/where-is-webassembly-now-and-whats-next/
---

这是系列的第六篇，如果你还没有阅读其它篇章，我们建议你从头开始哦。

今年（2017 年）二月28日，4 大浏览器一致表示他们已经完成了针对 WebAssembly 的 MVP [版本](https://lists.w3.org/Archives/Public/public-webassembly/2017Feb/0002.html) 的发布。这意味着浏览器已经基本可以承载 WebAssembly 的基本功能。

{% include img.html src="https://hacks.mozilla.org/files/2017/02/logo_party01-500x169.png" title="当代浏览器携手共进" %}

这提供了一个浏览器可承载的稳定内核。这个内核并非包含了社区计划的全部的特性，但那也是够快、够用了。

由此，开发者们可以开始发布他们的 WebAssembly 代码了。对于早期版本的浏览器，开发者们可以发送 asm.js 版本的代码。因为 asm.js 是 javascript 的子集，任何 js 引擎都可运行它。使用 Emscripten，你可以将一个 app 同时编译成 WebAssembly 和 asm.js。

虽然这是首次发布，WebAssembly 也会相当的快。然而，通过后期的修正、加入新特性，在将来，它会更快。

### 浏览器端提升 WebAssembly 性能

有些速度上的提升，会由浏览器引擎对于 WebAssembly 更好的支持做出。各个浏览器厂商对于这些问题的处理都是独立进行的。

#### 程序间（JS 和 WebAssembly）函数调用更快

目前，在 JS 代码里调用一个 WebAssembly 函数比它理所应当的要慢。因为，这里面需要做一些额外的事情，它被称为 trampolining（蹦床）。JIT 不知道如何直接操作 WebAssembly，因此，我们需要将 WebAssembly 路由过去。相关的引擎（就是用于启动和运行优化后的 WebAssembly 代码的那个）在执行这个动作的时候非常缓慢。

{% include img.html src="https://hacks.mozilla.org/files/2017/02/06-02-trampoline01-768x613.png" title="Person jumping from JS on to a trampoline setup function to get to WebAssembly" %}

如果 JIT 知道如何直接处理 WebAssembly，我们的速度将提高 100 倍。

如果将仅仅一个重任务派发给 WebAssembly 模块，你不会注意到这个 overhead 。但是，如果你有很多 JS 和 WebAssembly 之间的通讯任务（小的任务）要做，这个 overhead 就很明显了。

#### 加载更快

JIT 必须平衡更快加载和更快执行二者。如果你在一开始花费更多的时间来编译和优化，那么执行速度得到了提升，然而启动变慢了。

基于代码运行时的实际情况考虑，和先期编译的时间代价，关于如何平衡二者，还是有很多的工作要做的。先期编译可以确保代码一旦运行，便没有任何的明显的性能问题；而运行时的实际情况是指，很多的代码不会运行很长时间，于是优化也就显得不划算。

由于 WebAssembly 不需要具体化要使用的类型，引擎也就不必操心去检测运行时类型。这给了引擎更多的选择，比如编译和执行可以并行。

另外，新加的 JS API 允许 WebAssembly 的流式编译。这意味着引擎可以在字节下载期间启动编译。

在 Firefox 浏览器，我们基于双编译器系统工作。一个编译器善于代码基本优化（compiler optimization），会在先期（ AOT ）运行。与此同时，另一个编译器则会在后台执行全面优化，全面优化后的代码在就绪后会顶替基本优化版本。

### 向规范追加后 MVP 特性

WebAssembly 的目标之一，制定规范是小步伐并且是测试同行的，而非一开始就设计出全部。

这就是说，还有很多特性值得期待，只是目前尚未 100% 构思明白。这些值得期待的特性将会被严格的写入规范，所有的浏览器厂家都会参与进来。

这些特性我们称为准特性，这里列举几个吧。

#### 直接操作 DOM

目前，WebAssembly 无法直接与 DOM 交互。这就是说，使用 WebAssembly 你还不能做类似如下操作：

```ts
element.innerHTML = `...`
```

相反，你必须通过 Js 来处理。这就是说你需要将值传回到 JavaScript 的调用者。另外一方面，这也意味着，在 WebAssembly 调用 JS 函数（无论 JS 函数或 WebAssembly 函数），可以借助 WebAssembly 模块中的 imports 指令。

{% include img.html  src="https://hacks.mozilla.org/files/2017/02/06-03-dom01-768x642.png" title="在 WebAssembly 程序中，人们必须通过 Js 来访问 DOM"%}

不管哪种方式，看起来，经由 JavaScript 比直接操作显得要慢。有些 WebAssembly 应用可能会在 DOM 处理期间挂起。

#### 共享内存协同

提高代码运行速度的方法之一就是将代码分为几个部分，然后并行执行它们。这可能会适得其反，因为，线程之间的通讯的 overhead 比执行任务的耗时都要多。

但是，如果你能够在线程间共享内存，便可以减少 overhead。为了达到目的，WebAssembly 使用 Js 的 `SharedArrayBuffer`。一旦浏览器支持，工作组就可以开始为此制定规范，来设计 WebAssembly 与 `SharedArrayBuffer` 的交互法则。

#### SIMD

如果你阅读过其它关于 WebAssembly 的文章，你可能听说过 `SIMD`。它是 `single instruction, multiple data` 的简写。这是另一种并行机制。

有了 `SIMD`，你就可以向大数据块（比如：一个包含了不同数值的向量）的不同部分发送相同指令，以同时处理一个数据块。由此，它可以显著提升游戏或者 VR 应用的计算速度。

这对普通应用不太重要，但如果是需要操作 multimiedia，比如游戏开发，这就是非常重要的。

#### 异常处理

许多基于 C++ 语言的项目都会用到异常处理，然而，它目前还没有写进 WebAssembly 的规范中。

如果你使用 Emscripten 来编译你的代码，可能需要在编译优化级别上去模拟异常处理。这很慢，因此你很可能会使用 `DISABLE_EXCEPTION_CATCHING` 关闭此功能。

一旦 WebAssembly 内置了异常处理，这个`模拟`的工作就是不必要的。

### 其它改进 —— 面向开发者更加友善

此准特性无关性能，而是为了改善开发体验。

- **First-class 源码级开发工具**
  目前，在浏览器上调试 WebAssembly 就像是调试原始的 assembly。很少有开发者不借助工具就能够将 source code 映射到 assembly。我们正在考虑如何改进我们的工具，以使得开发者能够调试代码。
- **垃圾回收**
  如果你能在编译时确定类型，你应该可以把你的代码转为 WebAssembly。因此使用类似 TypeScript 等强类型语言编写的代码与 WebAssembly 是兼容的。目前唯一的问题是，WebAssembly 不知道如何与既存的垃圾收集器交互，比如 Js 引擎内置的那个 GC。这个准特性的想法就是打算允许 WebAssembly 通过一系列低级别的 GC 基础类型和操作，优先访问 JS 引擎内置 GC。
- **ES6 模块集成**
  浏览器目前支持使用 `script` 标签来加载模块化的脚本文本。一旦这个准特性加入规范，你便可以使用同样的方式加载 WebAssembly 模块。

### 最后

WebAssembly 很快，随着一些新的特性的加入和方方面面的改进，它一定会更快！
