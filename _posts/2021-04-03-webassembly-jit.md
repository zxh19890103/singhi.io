---
layout: post
title: WebAssembly 系列 - JIT
short: 你应该听说过，WebAssembly 非常的快。但是使它如此之快的缘故是什么呢？这一系列，我想向你对于这个问题做一个解释
src: https://hacks.mozilla.org/2017/02/a-crash-course-in-just-in-time-jit-compilers/
---

这是本系列的第二篇，如果你尚未阅读其它篇章，我建议你从首篇开始。

JavaScript 开始的时候运行是缓慢的，但是拜 JIT 所赐，执行速度会越来越快。那么，JIT 是如何工作的？

## JavaScript 如何在浏览器中运行

作为一个开发者，当你将一段 JavaScript 脚本加入页面，其中存在一个目标和一个问题。

目标：我想告诉计算机做什么
问题：你和计算机说着不同的语言

你讲的是人类语言，计算机说的是机器语言。即便你不认为 JavaScript 或者其它高级编程语言是人类语言，它们确实是的！它们是为了人类而设计的，不是为了计算机。

因此，JavaScript 引擎的职责就是讲人类语言转变为计算机可理解的语言。

这让我想到了电影《到达》，里面包含了人类试图和外星人谈话的场景。

{% include img.html src="https://2r4s9p1yi1fa2jd7j43zph8r-wpengine.netdna-ssl.com/files/2017/02/02-01-alien03.png" title="A person holding a sign with source code on it, and an alien responding in binary" %}

那部电影里，人类和外星人并不仅仅是做语句翻译。这两个群体拥有截然不同的方式以思考这个世界。人类和计算机所处的情况类似！（我将在下一篇更详细的解释这部分）

那么，翻译是如何发生的呢？

在编程领域，通常包含两种转译机器语言的方式。你可以用解释器（interpreter）或者编译器（compiler）。

使用解释器，翻译的过程完全就是一行一行的，并且在程序运行的同时进行。

{% include img.html src="https://2r4s9p1yi1fa2jd7j43zph8r-wpengine.netdna-ssl.com/files/2017/02/02-02-interp02.png" title="A person standing in front of a whiteboard, translating source code to binary as they go" %}

编译器则不同，它不会在程序运行的时候做翻译。它需要在一开始就做完翻译，然后写下翻译的结果。

{% include img.html src="https://2r4s9p1yi1fa2jd7j43zph8r-wpengine.netdna-ssl.com/files/2017/02/02-03-compile02.png" title="A person holding up a page of translated binary" %}

以上二者所持的翻译方式各有利弊。

## 解释器的优缺点

解释器可以非常快速地启动和运行。你不需要通过全部的编译步骤，就可以开始执行你的代码。你仅仅翻译万第一行就立马执行它。

因此，一个解释器看起来就像天然为了 JavaScript 或类似的东西而存在的。对于 Web 开发者，非常重要的一点就是能够让他们的代码快速进入执行阶段。

这就是为什么浏览器一开始就使用了 JavaScript 解释器。

但是，当有一段需要重复执行的代码时，解释器的问题就出现了。例如，你需要执行一个循环，解释器会一遍又一遍地翻译循环体里的代码。

## 编译器的优缺点

编译器的问题正好相反。

它需要耗费一个时间去启动你的代码，因为它必须在一开始将全部的代码编译完全。但是后续的运行的速度会快一些，因为那个时候不再需要编译的动作了。

另一个区别是编译器需要更多的时间去检查、修改代码，以使之能够运行更快。这里“修改”动作其实就是优化。

解释器在运行的时候启动工作，因此它不可能花费那个时间去对代码做优化。

## Just-in-time 编译器：取二者之长

上边说到，解释器的问题在于，它低效，它会做重复劳动，尤其有循环代码的时候。为了避免这个问题，浏览器混入了编译器。

不同的浏览器实现这个方案的方式略有不同，但是基本的思想是一致的。他们向 JavaScript 引擎加入了一个新的成员，叫做 monitor（又称：画像）。这个 monitor 在代码运行期间会持续盯着代码，并记录下某段代码执行的次数，以及其所使用的 types 是啥。

一开始，monitor 只是通过解释器运行一切。

{% include img.html src="https://2r4s9p1yi1fa2jd7j43zph8r-wpengine.netdna-ssl.com/files/2017/02/02-04-jit02.png" title="Monitor watching code execution and signaling that code should be interpreted" %}

如果一段代码执行了若干次，那部分代码会被记为暖（warm）。如果执行了许多次，则被记为热（hot）。

## 基线编译器

当一个函数开始变暖，JIT 就会将它送入待编译的行列。然后，它的编译结果就会被保存起来。

{% include img.html src="https://2r4s9p1yi1fa2jd7j43zph8r-wpengine.netdna-ssl.com/files/2017/02/02-05-jit06.png" title="Monitor sees function is called multiple times, signals that it should go to the baseline compiler to have a stub created" %}

函数的每一行都被编译到一个 “stub”里。Stubs 按照行号和变量类型被索引（我稍后会解释为什么这很重要）。如果 monitor 发现即将执行拥有相同变量类型的相同代码段，那么取出与之对应的编译版本执行。

这对于速度的提升大有帮助。但是如我所言，编译器能做的不止这些。编译器能够花费一些时间来决策出更加高效的方式，来优化我们的代码。

基线编译器负责了这种优化的部分工作（我会在下边给出一个例子）。尽管如此，它不欲消耗过多的时间在这上面，因为，它不想让执行等待太久。

然而，如果代码非常的热，比如一个反复很多次的循环，额外花点时间来做优化是值得的。

## 优化编译器

当一段代码非常的热，monitor 就会将其送入优化编译器。它将生成一个更快的版本，生成的内容同样会被保存起来。

{% include img.html src="https://2r4s9p1yi1fa2jd7j43zph8r-wpengine.netdna-ssl.com/files/2017/02/02-06-jit09.png" title="Monitor sees function is called even more times, signals that it should be fully optimized" %}

为了生成一个更快的版本，优化编译器会做一些假设。

比如，它会假设，某个构造器所创建出来的对象都具有相同的形状。也就是，这些对象具有相同的属性名，并且以相同的顺序排列。由此，优化编译器就能够排除一些例外。

优化编译器使用 monitor 收集起来的这些信息，来做出判断。如果之前的每次迭代都符合它的判断，那么它会假设下一个也会是如此。

但是，我们知道，JavaScript 并不会保障这个假设成立。或许前 99 个对象都是一样的形状，但是到了第 100 个，它不一样了，它少了一个属性，也不好说。

因此，编译结果在运行之前需要检查，看看其是否依然符合编译器的假设，如果符合，则执行代码。否则，JIT 认为它做出了一个错误的假设，因此需要删除优化后的代码。

{% include img.html src="https://2r4s9p1yi1fa2jd7j43zph8r-wpengine.netdna-ssl.com/files/2017/02/02-07-jit11.png" title="Monitor sees that types don't match expectations, and signals to go back to interpreter. Optimizer throws out optimized code" %}

执行器回到解释器或这个基线编译器版本。这个过程被称为反优化（又叫做：bailing out）

通常，优化编译器使代码更快，但是有些时候，它也会引发一些意外的性能问题。如果对你的代码持续地进行优化和反优化，结果就是执行速度比仅仅使用基线编译器更慢。

多数的浏览器会对限制 优化/反优化 的反复次数，如果 JIT 对代码进行了优化，然后又舍弃了优化，如此进行了 10 次之后，就不再这么尝试了。

## 一个例子：类型具化

存在许多的不同种类的优化，但是我这里只说其中一种，从而你能够感受到优化是怎么做的。优化编译器最大的亮点在于一种叫做类型具化的概念。JavaScript 所使用的动态类型系统在运行时，需要做一点额外的工作。一个例子，看一下以下代码：

```javascript
function arraySum(arr) {
  var sum = 0;
  for (var i = 0; i < arr.length; i++) {
    sum += arr[i];
  }
}
```

其中循环里的 `+= step` 看起来很简单。看起来，这个计算只是一步操作而已。然而出乎你预料的是，由于是动态类型，真正执行的时候会是多步骤操作。

让我们假设 `arr` 是一个包含了 `100` 个整型的数组。一旦代码开始变暖，基线编译器便开始为函数里的每一行创建一个 `stub`。那么，就会有一个 `stub` ，它对应于 `sum += arr[i]`，这句话用于整型的 `+=` 运算。

然而，`sum` 和 `arr[i]` 不会确保始终为整型。因为，JavaScript 里的类型是动态的，有可能在下一个迭代，`arr[i]` 是一个字符串。整型加法和字符串拼接是两个非常不同的操作。因此，它会被编译为两种不同的机器码。

JIT 解决这个问题的办法是创建多个基线 `stub`。如果一段代码是单态的（即，多次执行时，某变量总是一种类型），它将使用一个 `stub`。如果时多态的（反复执行时，同一变量出现了不同的类型），那么它将为每一种类型创建一个 `stub`。

这意味着，JIT 选择 `stub` 的时候会进行多次询问。

{% include img.html src="https://2r4s9p1yi1fa2jd7j43zph8r-wpengine.netdna-ssl.com/files/2017/02/02-08-decision_tree01.png" title="Decision tree showing 4 type checks" %}

Because each line of code has its own set of stubs in the baseline compiler, the JIT needs to keep checking the types each time the line of code is executed. So for each iteration through the loop, it will have to ask the same questions.

由于每一行代码在基线编译器中有它自己的 stub，每次执行该行代码的时候，JIT 需要检查变量类型。因此，每次迭代的时候，都需要问一组相同的问题。

{% include img.html src="https://2r4s9p1yi1fa2jd7j43zph8r-wpengine.netdna-ssl.com/files/2017/02/02-09-jit_loop02.png" title="Code looping with JIT asking what types are being used in each loop" %}

The code would execute a lot faster if the JIT didn’t need to repeat those checks. And that’s one of the things the optimizing compiler does.

如果 JIT 不反复询问，代码的执行速度将会提升。这就是优化编译器的存在的理由。

In the optimizing compiler, the whole function is compiled together. The type checks are moved so that they happen before the loop.

在优化编译器里，整个函数被一起编译。类型检查从中被删除，它们被移到循环执行之前。

{% include img.html src="https://2r4s9p1yi1fa2jd7j43zph8r-wpengine.netdna-ssl.com/files/2017/02/02-10-jit_loop02.png" title="Code looping with questions being asked ahead of time" %}

有些 JIT 甚至对此做出了更进一步的优化。比如，在 Firefox，存在一个特殊的数组类型，它只存储整型。如果 `arr` 属于这个类型，JIT 就不会去检查 `arr[i]` 是否整型。这就是说 JIT 可以在进入循环之前完成类型检查。

## 总结

这就是 JIT 的大概。它通过使用 monitor ，监控代码的运行，并将热代码发送给优化编译器进行优化，从而让 JavaScript 跑得更快。这对于大多数 JavaScript 应用，产生了 N 倍的性能提升效果。

即便有了这些优化，JavaScript 性能依然会不可预测。为了更快，JIT 在运行时加入了以下前期操作：

- 优化/反优化
- 对 monitor 的记录进行缓存，并且当 bailouts 发生的时候，恢复它
- 对函数的基线版本和优化版本进行缓存

依然有优化的空间：前期操作可以移除，使性能更加可预测。这些是 WebAssmebly 要做的事情。

下一篇，我将更多地解释 assembly，以及编译器是如何处理它的。
