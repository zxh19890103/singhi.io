---
layout: post
title: WebAssembly 系列 - 运行
short: WebAssembly 是除 JavaScript，另一种可以运行在 web 页面上的编程语言。过去，当你想运行一段代码，以与页面的其它部分交互，唯一的选择就是 JavaScript
src: https://hacks.mozilla.org/2017/02/creating-and-working-with-webassembly-modules/
category: tech
---

这是系列的第四篇，如果你还没有阅读之前的内容，我们建议你从头开始。

WebAssembly 是除 JavaScript，另一种可以运行在 web 页面上的编程语言。过去，当你想运行一段代码，以与页面的其它部分交互，唯一的选择就是 JavaScript。

因此，当人们说 WebAssembly 很快的时候，比较的对象就是 JavaScript。但是，这并不是一个非此即彼的情况，也就是，并不是要么使用 WebAssembly，要么使用 JavaScript。

实际上，我期望大家会在一个系统开发中同时使用 WebAssembly 和 Javascript。即使，你没有自己亲手编写 WebAssembly 代码，你也能从中获益。

WebAssembly 模块定义了很多函数，供 JavaScript 调用。就像，你下载 lodash 这个模块，然后，访问它的 API，将来你也可下载 WebAssembly。那么，让我们来看看 WebAssembly 模块如何创建，然后如何使用于 JavaScript。

#### 将 WebAssembly 置于何处？

在那篇关于 Assembly 的博客中，我谈到过编译器是如何将高级编程语言翻译为机器码的。

{% include img.html src="//zxh1989.oss-cn-qingdao.aliyuncs.com/2021-04-11-webassembly-work/04-01-langs09-768x469.png" title="高级语言和 assembly 语言之间的关系，中间存在一个 IR 语言" %}

上边这个图，WebAssembly 应该放在哪里呢？

你可能会认为，这个只是另一种 assembly 语言。没错，但是需要看到，每种 assembly 语言（x86、ARM）都对应独自的机器架构。

当你，通过 web，将代码送到用户的机器并执行它，你不知到用户机器的目标架构是什么，因此你也不知道他能运行什么样的 assembly 代码。

因此，WebAssembly，与其它的 assembly 有少许不同。它是针对某种概念机而言的，并不是实际的、物理的机器。

由此，WebAssembly 的指令有时被叫做虚拟指令。相比较 JavaScript 源码，它与机器码有着更加直接的映射。而与其它 assembly 码相比，基于一些流行的通用硬件上的高效的处理方式，有重叠部分。但是对于硬件差异方面，它并没有做直接的映射。

{% include img.html src="//zxh1989.oss-cn-qingdao.aliyuncs.com/2021-04-11-webassembly-work/04-02-langs08-768x501.png" title="webassembly 应该放到 IR 和 assembly 之间吧" %}

浏览器下载 WebAssembly，然后，稍稍转换一下，就将 WebAssembly 变为目标机器 assembly 代码。

#### 编译到 .wasm.

当前，能够大范围支持 WebAssembly 的编译器工具链就是 LLVM 了。有几个存在不同之处的前端工具和后端工具，需要插入 LLVM。

<blockquote>
注意：WebAssembly 模块的开发者使用 C、Rust 来编程，然后将其编译为 WebAssembly，但是有其它的方式创建 WebAssembly 模块。比如，有个实验性的工具可以帮助我们将 TypeScript 构建为 WebAssembly，或者你可以直接写 WebAssembly 代码。
</blockquote>

假如我们要将 C 变为 WebAssembly，我们将使用 clang 前端工具将 C 编译为 LLVM 中的 IR（中间语言）。接着，LLVM 会对 IR 做一些优化。

为了将 LLVM 的 IR，编译为 WebAssembly，我们需要一个后端工具。LLVM 项目目前正在开发这个工具，大部分功能都做得差不多了，应该很快就能投入使用了吧。目前，我们可以使用一点花招。

另一个工具，名字叫做 Emscripten，目前更易于使用。对于生成 WebAssembly，它有自己的后端，做法是先将 IR 转为另一种叫做  asm.js 的目标语言 ，进而转为 WebAssembly。它底层使用了 LLVM，因此，你可以 在讲个后端之间切换 LLVM 和 Emscription。

{% include img.html src="//zxh1989.oss-cn-qingdao.aliyuncs.com/2021-04-11-webassembly-work/04-03-toolchain07-768x631.png" title="编译工具链" %}

Emscripten 包括了很多的扩展工具，以及一些库，以转载整个 C/C++ 工程，因此，它看起来更像是一个 SDK（比较于编译器）。举个例子，系统开发者常常需要一个文件系统来读写，于是 Emscripten 能够使用 IndexedDB 模拟出一个文件系统。

不管你用的什么工具链，最终的结果都是一个后缀为 .wasm 的文件。我将更加具体的说明这个文件的结构。我们先来看看怎么在 JavaScript 中使用它吧。

#### 在 JavaScript 中加载 .wasm 模块

.wasm 文件就是一个 WebAssembly 模块，它能够被 JavaScript 加载。目前（2017），加载的方式有点复杂。

```js
function fetchAndInstantiate(url, importObject) {
  return fetch(url).then(response =>
    response.arrayBuffer()
  ).then(bytes =>
    WebAssembly.instantiate(bytes, importObject)
  ).then(results =>
    results.instance
  );
}
```

你可以到我们的[文档](https://developer.mozilla.org/en-US/docs/WebAssembly)深入的了解这些。

我们正在想办法使得这个流程更加简单。我们期望，优化我们的工具链，以使得它能够更好的与既有的 bundlers 协作，比如 webpack 或者 SystemJs。我们详相信，加载 WebAssembly 模块最终能够和加载 JavaScript 模块一样简单。

与 JavaScript 模块最大的差异，在于 WebAssembly 里的函数的参数和返回值只能是数字（整型或者浮点型）。

{% include img.html src="//zxh1989.oss-cn-qingdao.aliyuncs.com/2021-04-11-webassembly-work/04-04-memory04-768x143.png" title="js 调用 c  的函数，传入了一个数字，c 函数返回了一个整数" %}

对于复杂的数据类型，比如字符串，我们只能使用 WebAssembly 中的模块内存。

如果你经常使用 JavaScript，直接使用内存的场景不会很常见。许多的高性能语言，比如 C 和 C++， 以及 Rust 等，都提供了手动内存管理。WebAssembly 模块的内存模拟了堆的概念，这在其它语言中可以看到。

为了实现这个目标，需要用到 JavaScript 中的一个概念，叫做 ArrayBuffer。Array Buffer 是一个字节数组，因此数组的索引就是内存地址。

如果你想在 JavaScript 和 WebAssembly 之间传递字符串，你将字符转换为对应的字符码。然后，你将他们写入 array buffer。由于 index 是整型的，一个 index 是可以传入 WebAssembly 函数的。于是，首字符的索引就是这个字符串的指针。

{% include img.html src="//zxh1989.oss-cn-qingdao.aliyuncs.com/2021-04-11-webassembly-work/04-05-memory12-768x614.png" title="js 调用了 c 函数，传入了一个整数，作为内存指针，然后 c 会将其写入内存" %}

通常开发 WebAssembly 模块的人会将写一个 wrapper 来包装它的模块。这样，你作为使用者，就不用操心内存的管理了。

想要学到更多的相关知识，看看我们的[文档](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_objects/WebAssembly/Memory)吧。

#### wasm 文件的结构

如果你在使用一门高级语言来编写代码，然后将其编译为 WebAssembly，你不需要知道 WebAssembly 的内部结构。但是知道它会帮助你来理解相关的基础。

如果你还没准备好，那么我建议你阅读[关于 assembly](https://hacks.mozilla.org/2017/02/a-crash-course-in-assembly/)这篇文章先。

以下是一段用 C 写的函数，我们要将它转为 WebAssembly：

```c
int add42(int num) {
  return num + 42;
}
```

你可以使用 [Wasm Explorer](http://mbebenita.github.io/WasmExplorer/) 来编译这个函数。

如果你打开这个 .wasm 文件（假设你的编辑器支持查看），你将会看到如下这样的内容：

```
00 61 73 6D 0D 00 00 00 01 86 80 80 80 00 01 60
01 7F 01 7F 03 82 80 80 80 00 01 00 04 84 80 80
80 00 01 70 00 00 05 83 80 80 80 00 01 00 01 06
81 80 80 80 00 00 07 96 80 80 80 00 02 06 6D 65
6D 6F 72 79 02 00 09 5F 5A 35 61 64 64 34 32 69
00 00 0A 8D 80 80 80 00 01 87 80 80 80 00 00 20
00 41 2A 6A 0B
```

这是“二进制”的表达。我在二进制这个单词上加了引号的原因是，它通常以 16 进制来显示，转为二进制或者某种人类可读性的格式也很简单。

举个例子，这里的 `num + 42` 像这样：

{% include img.html src="//zxh1989.oss-cn-qingdao.aliyuncs.com/2021-04-11-webassembly-work/04-06-hex_binary_asm01-768x391.png" title="3 段指令，分别以 16 进制、二进制、文本呈现 " %}

#### 代码是如何工作的：一个栈机

按照你的意愿，相关的指令如下：

{% include img.html src="//zxh1989.oss-cn-qingdao.aliyuncs.com/2021-04-11-webassembly-work/04-07-hex_binary_asm02-768x269.png" title="get_local 0 从第一个参数获得值，并压入栈。i32.const 42 则将一个常数压栈。i32.add 则对栈首的两个值进行了加法运算，并压入结果" %}

你可能会注意到，加法操作符并未告诉我们要操作的值在哪里。这是因为 WebAssembly 是一个典型的栈机。这意味着，所有的值，都需要提前压入栈中。

想 `add` 这样的操作符，都知道自己需要多少个值用于计算。由于 add 需要两个值，它将会用栈首取出两个。这意味着，`add` 指令可以是 short 类型（一个字节），因为这个指令不需要指明源地址或者目标寄存器，这减少了 wasm 文件的大小，也就意味着更少的加载时间。

即便 WebAssembly 基于栈机，其于物理机上的运行机制全非如此。当浏览器转码 WebAssembly 为对应机器码的时候，它会使用到寄存器。而 WebAssembly 不会指定寄存器，如此，就能够让浏览器以更加灵活的方式来使用最好的寄存器地址分配方案。

#### 模块的组成

wasm 文件中，除了 `add42` 函数本身，还存起其它部分。他们被称为区块（sections）。其中一些区块是必需的，其它为可选。

必需：

- **Type**. 包含了函数签名，函数包括模块内部定义或者引入的
- **Function**. 索引，以调用模块中的函数
- **Code**. 对应每个函数的实现主体

可选：

- **Export**.  使得函数、内存、表、全局变量，能够被外部模块（wasm 和 js）访问。这样就允许分离编译并动态连接，这就是 WebAssembly 版本的 .dll
- **Import**.  声明来自其它模块（wasm 或 js）的函数、内存、表和全局变量。
- **Start**. 一个函数，在 WebAssembly 被加之后能够被自动执行，基本就像是 main 函数。
- **Global**. 模块内的全局变量定义
- **Memory**. 定义模块内存
- **Table**.  与模块外的值映射，比如 javascript 的对象。这对于允许间接函数调用非常有用。
- **Data**. 本地内存初始化
- **Element**.  本地表的初始化

对于更多的区块（sections），有一篇[文章](https://rsms.me/wasm-intro)进行了非常深入的阐述。