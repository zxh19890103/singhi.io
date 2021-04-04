---
layout: post
title: WebAssembly 系列 - Assembly
short: 要想理解 WebAssembly 是如何工作的，先去理解 assembly 是什么以及编译器是如何生成它的，会很有帮助
src: https://hacks.mozilla.org/2017/02/a-crash-course-in-assembly/
---

这是系列的第三篇，如果你还没有阅读其它篇章，我建议你从首篇开始。

要想理解 WebAssembly 是如何工作的，先去理解 assembly 是什么以及编译器是如何生成它的，会很有帮助。

在上一篇关于 JIT 的文章里，我提到过，与计算机交流类似于我们与外星人交流。

{% include img.html src="https://2r4s9p1yi1fa2jd7j43zph8r-wpengine.netdna-ssl.com/files/2017/02/03-01-alien03.png" title="人类手里拿着一个写有源码的符号牌，外星人呢，则回馈以一些二进制数据" %}

我现在想看看外星人的大脑是怎么工作的，也就是，计算机的大脑是怎么解析和理解来自外界的通讯信息。

大脑的一个区域负责思考事情，比如加法、减法、逻辑运算等。其附近还有一个区域提供了短期存储功能，另一个区域提供长期存储功能。

不同的区域有不同的名字。

- 负责思考的区域叫做逻辑计算单元（ALU）
- 负责短期存储的区域叫做寄存器（Registers）
- 负责长期存储的区域叫做内存（Random Access Memory，或者 RAM）

{% include img.html src="https://2r4s9p1yi1fa2jd7j43zph8r-wpengine.netdna-ssl.com/files/2017/02/03-02-computer_architecture09.png" title="CPU、ALU、寄存器以及 RAM" %}

机器码里的句子叫做指令。

当一段指令进入大脑，会发生什么呢？这里需要拆分几个部分，不同部分意思不一样。

拆分的方式，和大脑的连线方式有关系。

举个例子，以如此连线方式形成的大脑，可能总会拿出前 6 个位，将其送到 ALU。ALU 会根据 1 和 0 的位置，知道它需要将两个东西相加。

这段数据被叫做“opcode”，也就是操作码，因为它告诉 ALU 进行哪种操作。

{% include img.html src="https://2r4s9p1yi1fa2jd7j43zph8r-wpengine.netdna-ssl.com/files/2017/02/03-03-computer_architecture12.png" title="从 16 位指令段中读取 6 个位，送入 ALU" %}


然后，大脑将取出接下来的两个数据段，以决定将要相加的是哪两个数字。它们将被送到寄存器保存起来。

{% include img.html src="https://2r4s9p1yi1fa2jd7j43zph8r-wpengine.netdna-ssl.com/files/2017/02/03-04-computer_architecture17.png" title="两个 3 位的数据段被解码、保存到寄存器" %}

注意机器码上面的那段注解，它有助于我们人类来理解里面发生了什么。这就是 assembly 了。它被称为符号化的机器码。它是人类更好了解机器码的一种方式。

这里你能看到 assembly 和机器码有非常直接的关系。鉴于此，不同的机器架构对应不同类型的 assembly。当你的机器架构有点特别，就需要一种与之对应的“方言”来表示 assembly。

那么，我们的翻译目标不止一个了。机器码并不唯一，存在许多不同类型的机器码。就如同我们人类说着不同的语言，机器也说着不同的语言。

将人类语言翻译到外星人语言，这里的人类语言可能指的是英语、俄语、汉语普通话，而外星人语言可能指的是方言 A 或者方言 B。在编程术语中，也就是，将 C、C++ 或者 Rust 编译到 x86 或者 ARM。

你想将其中一种高级编程语言翻译为某种 assembly 语言（对应不同的架构）。一种方式就是创造出全部的翻译器，以将任一种高级语言翻译为任一种 assembly 语言。

{% include img.html src="https://2r4s9p1yi1fa2jd7j43zph8r-wpengine.netdna-ssl.com/files/2017/02/03-05-langs05.png" title="左侧是 C、C++、Rust ，右侧是 x86 架构与 ARM 架构下的 Assembly 语言，它们两两相连" %}

这看上去非常的低效。为了解决这个问题，多数的编译器会在中间放置至少一个层。编译器会将高级编程语言翻译为某种不那么高级，但也并非能与机器码那般，能直接执行的东西。这个东西被称为中介码（IR）。

{% include img.html src="https://2r4s9p1yi1fa2jd7j43zph8r-wpengine.netdna-ssl.com/files/2017/02/03-06-langs06.png" title="中介码位于高级编程语言和 assembly 语言之间，箭头由高级语言到中介码，然后由中介码到 assembly 语言" %}

这意味着，编译器能够将各种高级编程语言编译为这个 IR 语言。由此出发，另一种编译器会将 IR 代码编译为符合目标架构标准的某种代码。

编译器的前端将高级编程语言编为 IR，而后端编译器则将 IR 编译为目标架构的 assembly 码。

{% include img.html src="https://2r4s9p1yi1fa2jd7j43zph8r-wpengine.netdna-ssl.com/files/2017/02/03-07-langs09.png" title="编译器前后端示意图" %}

## 结论

以上介绍了 assembly 是什么，以及编译器如何将高级编程语言编译为 assembly。下一篇，我们将看到 WebAssembly 是被如何安排进来的。
