---
layout: post
title: WebAssembly 系列 - 速度
short: 因此，这里择偶问题不需纠结。然而，我们希望的是，一些程序员会将部分的 JavaScript 代码切换为 WebAssembly 版本
src: https://hacks.mozilla.org/2017/02/what-makes-webassembly-fast/
category: tech
---

这是系列的第五篇，如果你还没有阅读之前的内容，我们建议你从头开始。

上一篇，我说过了，对于编程语言是选择 WebAssembly 还是 JavaScript 并不对立。我并不希望大量的程序员会去编写全 WebAssembly 代码。

因此，这里择偶问题不需纠结。然而，我们希望的是，一些程序员会将部分的 JavaScript 代码切换为 WebAssembly 版本。

例如，React 团队可以将涉及协调算法的那部分代码使用 WebAssembly 来实现。用户无需关心这些，现有的应用会照常运行，只是它们会从 WebAssembly 中得到很多益处。

用户将对 React 团队的切换行为感到满意，因为 WebAssembly 使得他们的应用更快了。但是，究竟是什么使得它如此之快呢？

#### 今日的 JavaScript 性能如何？

在我们去了解 JavaScript 和 WebAssembly 之间的性能差别之前，需要理解 JS 引擎的工作机制。

下面这张图，对于一个 Web 应用启动时的性能表现给出了一个粗略的钩勒。

<blockquote>
Js 引擎用于执行这些任务所需花费的时间取决于页面使用的 Js 脚本逻辑。这张图并没有完整地展示出执行的各个阶段。相反，它只是宏观地说出了对于一个相同的函数，Js 和 WebAssembly 各自如何处理。
</blockquote>

{% include img.html src="//zxh1989.oss-cn-qingdao.aliyuncs.com/2021-04-18-webassembly-why-so-fast/05-01-diagram_now01-768x198.png" title="当前 JS 引擎处理任务涉及的 5 种内容" %}

每一条段展示了对应具体任务的耗时长短。

- 解析 —— 将源代码处理为某种解释器可以运行的东西，其所耗的时间
- 编译 + 优化 —— 基线编译和优化编译耗时。某些优化编译不在主线程，因此不包含在此处
- 反优化 —— 当假设不成立时， JIT 将撤销优化编译到基线、再优化所耗的时间
- 执行 —— 运行代码耗时
- 垃圾回收 —— 清理内存耗时

有一点需要注意，这些任务并非存在于离散的区块，或者说它们不是顺序的。相反，它们将是相继被处理的。解析完一点，执行一点，然后编译一点；接着，又一小点被解析，然后被执行，如此云云。

这种方式使得早期的 JS 在体验方面有了较大改善，这个过程看起来像是这样：

{% include img.html src="//zxh1989.oss-cn-qingdao.aliyuncs.com/2021-04-18-webassembly-why-so-fast/05-02-diagram_past01-768x225.png" title="过去的 JS 引擎，只涉及 3 种类型的工作，这要比现代的 JS 引擎消耗更多的时间" %}

刚开始，只使用解释器来运行 JS。后来，JIT 出世了，Js 的执行速度又得到了大幅度的提升。

相应的代价就是开头的监控和代码编译需要消耗一定的时间。如果人们还是像早年那样开发 JS 程序，解析和编译的时耗会非常的短。但是，性能的飞跃导致人们开始创建更大的 Web 应用。

这意味着还有可优化的空间。

#### 如何衡量 WebAssembly？

相对传统 web 应用，基于 WebAssembly 的应用表现如何呢？ 这里有个粗略的估算。

{% include img.html src="//zxh1989.oss-cn-qingdao.aliyuncs.com/2021-04-18-webassembly-why-so-fast/05-03-diagram_future01-768x328.png" title="处理 WebAssembly 涉及的 3 种类型的工作，时间比上图更短" %}

对于不同的浏览器，处理这些阶段的方式会稍稍不同。这里使用 SpiderMonkey 作为我们的模型。

#### 获取

这个没有在上图中体现，但是要将文件从服务器拿到本地显然是需要一定时间的。

因为 WebAssembly 是非常紧凑的，至少比起 JS 是如此，获取它相对快一些。即便 JS 被压缩后，体积会显著减小，以二进制呈现的 WebAssembly 依然较之更小。

这就是说，WebAssembly 的加载时间比较少，在弱网环境下尤其明显。

#### 解析

一旦到达浏览器，Js 源代码就被解析为 AST。

浏览器往往惰性地处理这件事，只解析马上需要用的那些代码，对不急于调用的那些函数姑且打个桩先。

相较之下，WebAssembly 不需要这步转换，因为它已经是 IR 语言。它只需被解码，然后校验一下以确保没有什么错误。

{% include img.html src="//zxh1989.oss-cn-qingdao.aliyuncs.com/2021-04-18-webassembly-why-so-fast/05-04-diagram_compare02-768x259.png" title="当前 JS 引擎解析耗时比 WebAssembly 的解码耗时要长" %}

#### 编译 + 优化

就像我在 JIT 那边所介绍的，JS 边执行边解析。依赖于运行时使用到的类型，相同代码的会对应多个编译结果。

编译 WebAssembly 明显不同。有些浏览器在开始执行程序之前处理基线编译，其它浏览器使用 JIT。

无论哪种方法，WebAssembly 的起点已经非常接近机器码了。比如说，类型是程序的一部分，基于以下几个理由，它要更快：

1. 在开始编译优化之前，编译器不需要运行一段时间，才能发现所使用的类型是什么
2. 编译器不必对一段代码，基于发现的类型，生成多编译结果
3. LLVM 事先已经做了大量的优化。因此，后续的编译和优化工作相对要少一些

{% include img.html src="//zxh1989.oss-cn-qingdao.aliyuncs.com/2021-04-18-webassembly-why-so-fast/05-05-diagram_compare03-768x269.png" title="比较编译和优化，WebAssembly 更快" %}

#### 再优化

有时候，JIT 必须放弃优化后版本，并且重新尝试优化。

前面基于运行时做出的假设，后来被发现是不成立的时候，就会发生这样的事情。例如，执行循环的时候，在第 N 次迭代，变量 V 的类型突然发生了改变，或者原型链上加入了新的函数的时候，反优化就会发生。

反优化有两个消耗。第一，它需要丢弃优化版本的代码，然后回到基线版本。第二，如果那个函数依然被频繁调用，JIT 会决定将其再次送入优化编译，那么这里存在二次编译的时耗。

在 WebAssembly，像类型这种东西是显式的，因此 JIT 不需要在运行阶段花时间去做假设。这样就不必进入再优化的循环中。

{% include img.html src="//zxh1989.oss-cn-qingdao.aliyuncs.com/2021-04-18-webassembly-why-so-fast/05-06-diagram_compare04-768x309.png" title="JS 中的再优化，对于 WebAssembly 是不存在的" %}

#### 执行

写出高性能的 Js 代码是可能的，前提是你明白 JIT 是如何做优化的。比如，你需要知道怎么写代码才能让编译器更好的做类型具化，就如我在 JIT 那篇文章所讲。

然而，大多数的开发者并不了解 JIT 的内部工作机制。即使那些知道的开发者，要写出让编译器满意的代码还是很难。许多使得代码更容易阅读的编程模式，恰巧中了编译器的下怀。

另外，JIT 优化方法因浏览器而异。对于浏览器 A 来说是高效的代码，放在浏览器 B 就会不那么高效。

因此，执行 WebAssembly 代码通常很快。对于 Js 的许多优化工作（比如类型具化），对于 WebAssembly 都是无需要的。

补充一点，WebAssembly 是为了编译器而设计的。这就是说，它是用编译器生成的，而非人类去手写的。

由于我们人类不会直接手写 WebAssembly 代码，WebAssembly 提供了一套对机器来说非常理想的指令集。基于代码所要做的工作，这些指令在任何地方运行都能将速度提升 10% 到 800%。

{% include img.html src="//zxh1989.oss-cn-qingdao.aliyuncs.com/2021-04-18-webassembly-why-so-fast/05-07-diagram_compare05-768x263.png" title="对比执行，WebAssembly 更快" %}

#### 垃圾回收

在 JS 中，开发者通常不必为清理那些不再使用的变量而操心。因为，JS 引擎会使用垃圾回收器自动地帮你做掉那些变量。

然而，如果你想对性能做到可预测，这会存在一些困难。你不能控制垃圾回收器何时开始工作，它可能出现得不合时宜。多数浏览器会做出良好的回收计划，但是它还是会对于你代码的执行产生一定阻碍。

至少现在（2017年），WebAssembly 仍然对于垃圾回收不理不睬。内存需要你自己去管理的（就像使用 C 或者 C++ 语言时那样）。在令开发者难于编码的同时，这也使得性能得到了提高。

{% include img.html src="//zxh1989.oss-cn-qingdao.aliyuncs.com/2021-04-18-webassembly-why-so-fast/05-08-diagram_compare06-768x314.png" title="JS 中的垃圾回收，对于 WebAssembly 也是不存在的" %}

#### 结论

WebAssembly 比 JS 快，主要基于以下方面：

- 获取 WebAssembly 代码耗时少，因为它比 JS 紧凑，即使是压缩的 JS
- 解码 WebAssembly 的耗时比解析 JS 少
- 编译和优化的耗时少，因为 WebAssembly 更接近机器码，它早在服务端就已经被优化过了
- 再优化是不可能发生的事情，因为 WebAssembly 包含了类型以及其它内置信息。因此 JS 引擎不必像对待 JavaScript 那样做类型具化
- 执行花销更少的时间，因为开发者不需要了解很多的针对编译器的优化技巧，就可以写出持续高性能的代码，另外 WebAssembly 还提供了一套适合机器的指令集
- 没有垃圾回收，需要手动管理内存

这就是为什么，基于同一问题， WebAssembly 在许多方面都比 JavaScript 表现更加出色。

有些情况，WebAssembly 处理起来并没有设想的那么优秀；另外，放眼观之，还有很多可以使得它更快的改变会发生。我将在下篇覆盖。