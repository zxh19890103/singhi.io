---
layout: post
chapter: 一
short:
title: 开始 - 认识 OpenGL
sort: 20
category: tech
---

## OpenGL

在开始我们的旅程之前，我们首先应该定义一下 OpenGL 实际上是什么。OpenGL 主要被视为一个 API（应用程序编程接口），它为我们提供了一组可以用来操作图形和图像的函数。然而，OpenGL 本身并不是一个 API，而只是一个规范，由 [Khronos Group](http://www.khronos.org/) 开发和维护。

<img src="https://learnopengl.com/img/getting-started/opengl.jpg" class="right" alt="Image of OpenGL's logo">

OpenGL 规范明确指定了每个函数的结果/输出应该是什么，以及它应该如何执行。然后，由开发人员来实现这个规范，并提出如何让该函数运作的解决方案。由于 OpenGL 规范并未提供实现细节，实际开发出来的 OpenGL 版本可以有不同的实现，只要它们的结果符合规范（因此对用户而言是相同的）。

实际开发 OpenGL 库的人通常是显卡制造商。你购买的每一块显卡都支持特定版本的 OpenGL，这些版本是专门为该显卡（系列）开发的。当使用 Apple 系统时，OpenGL 库由 Apple 自行维护，而在 Linux 系统下，则存在图形供应商的版本与爱好者改编的库版本的结合。这也意味着，当 OpenGL 出现不正常的行为时，通常是显卡制造商（或开发/维护库的人）的错。

{% include box.html color="green" content="由于大多数实现都是由显卡制造商构建的，因此当实现出现 bug 时，通常通过更新显卡驱动程序来解决；这些驱动程序包含了你显卡支持的最新版本的 OpenGL。这也是为什么我们总是建议定期更新显卡驱动程序的原因之一。." %}

Khronos 公共托管所有 OpenGL 版本的规范文档。有兴趣的读者可以在这里找到我们将使用的 3.3 版本的 [OpenGL 规范](https://www.opengl.org/registry/doc/glspec33.core.20100311.withchanges.pdf)，这是一份非常值得阅读的文档，如果你想深入了解 OpenGL 的细节（注意，它们主要描述的是结果，而不是实现）。这些规范也提供了一个很好的参考，帮助你了解其函数的具体工作原理。

## 核心模式（Core-profile）与即时模式（Immediate mode）

在过去，使用 OpenGL 意味着开发即时模式（通常被称为固定功能管线），这是一种易于使用的图形绘制方法。OpenGL 的大部分功能被封装在库内部，开发者对 OpenGL 如何执行计算没有太多控制权。随着时间的推移，开发者对更高灵活性的需求不断增加，OpenGL 规范也变得越来越灵活；开发者逐渐获得了更多对图形的控制权。即时模式非常容易理解和使用，但它的效率极低。正因如此，OpenGL 从 3.2 版本开始逐步弃用即时模式的功能，并开始鼓励开发者使用 OpenGL 的核心模式（core-profile），这是一种去除了所有过时功能的 OpenGL 规范分支。

使用 OpenGL 核心模式时，OpenGL 强制我们采用现代的做法。每当我们尝试使用 OpenGL 中被弃用的函数时，OpenGL 会抛出错误并停止绘制。学习现代方法的好处是，它非常灵活且高效。然而，它也更难学习。即时模式将很多实际操作从 OpenGL 的运作中抽象了出来，虽然学习起来简单，但却很难理解 OpenGL 是如何工作的。现代方法要求开发者真正理解 OpenGL 和图形编程，虽然有些困难，但它提供了更高的灵活性和效率，最重要的是，它让我们能更好地理解图形编程。

这也是为什么本书以 OpenGL 3.3 核心模式为基础的原因。尽管它更难，但付出的努力绝对值得。

至于今天，OpenGL 提供了更高版本的选择（在撰写本文时为 4.6）。那么你可能会问：既然 OpenGL 4.6 已经发布，为什么还要学习 OpenGL 3.3 呢？答案相对简单。从 3.3 版本开始，所有未来的 OpenGL 版本都会为 OpenGL 增加一些有用的新特性，而不会改变 OpenGL 的核心机制；新版本只是提供了更高效或更有用的方式来完成相同的任务。结果是，现代 OpenGL 版本中的所有概念和技术保持不变，因此学习 OpenGL 3.3 完全有效。只要你准备好，或者更有经验时，你可以轻松地使用更新版本 OpenGL 中的特定功能。

{% include box.html color="red" content="当使用 OpenGL 最新版本的功能时，只有最现代的显卡能够运行你的应用程序。这也是为什么大多数开发者通常会针对较低版本的 OpenGL 进行开发，并可选择性地启用更高版本的功能。" %}

在某些章节中，你会发现一些更现代的特性，它们会被特别标注出来。

## 扩展

OpenGL 的一个伟大特点是它对扩展的支持。每当显卡公司提出一种新的技术或新的大规模渲染优化时，通常会通过驱动程序中的扩展来实现。如果应用程序运行的硬件支持这样的扩展，开发者就可以利用该扩展提供的功能，从而实现更先进或更高效的图形渲染。通过这种方式，图形开发者可以在不需要等待 OpenGL 将该功能纳入未来版本的情况下，直接使用这些新的渲染技术，只需检查显卡是否支持该扩展。通常，当某个扩展变得非常流行或有用时，它最终会成为未来 OpenGL 版本的一部分。

开发者在使用扩展之前必须查询这些扩展是否可用（或者使用 OpenGL 扩展库）。这样，开发者可以根据扩展的可用性，做得更好或更高效。

```cpp
if(GL_ARB_extension_name)
{
    // Do cool new and modern stuff supported by hardware
}
else
{
    // Extension not supported: do it the old way
}
```

在 OpenGL 3.3 版本中，大多数技术通常不需要扩展，但在需要时，会提供适当的说明。

## 状态机

OpenGL 本身是一个大型的状态机：它是一个由多个变量组成的集合，这些变量定义了 OpenGL 当前的操作方式。OpenGL 的状态通常被称为 OpenGL 上下文。在使用 OpenGL 时，我们经常通过设置一些选项、操作一些缓冲区来改变其状态，然后使用当前的上下文进行渲染。

例如，当我们告诉 OpenGL 我们现在想绘制线条而不是三角形时，我们通过改变某些上下文变量来改变 OpenGL 的状态，告诉 OpenGL 应该如何绘制。一旦我们通过告诉 OpenGL 绘制线条来改变了上下文，接下来的绘制命令就会绘制线条，而不是三角形。

在 OpenGL 中工作时，我们会遇到几个改变状态的函数，这些函数会改变上下文，还有一些基于当前状态执行操作的函数。只要你记住 OpenGL 本质上是一个大型的状态机，它的大多数功能就会变得更容易理解。

## 对象

OpenGL 库是用 C 语言编写的，并允许在其他语言中进行许多派生，但其核心依然是 C 库。由于 C 语言的许多语言构造在其他更高级语言中不太容易转换，OpenGL 的开发考虑了多个抽象层次。OpenGL 中的一个抽象层次就是对象。

OpenGL 中的一个对象是一些选项的集合，代表了 OpenGL 状态的一个子集。例如，我们可以有一个对象，表示绘制窗口的设置；然后我们可以设置它的大小、支持的颜色数量等等。可以将对象想象为一个类似 C 语言的结构体：

```cpp
struct object_name {
  float  option1;
  int    option2;
  char[] name;
};
```

当我们想要使用对象时，通常会看到如下的结构（将 OpenGL 的上下文可视化为一个大的结构体）：

```cpp

// The State of OpenGL
struct OpenGL_Context {
  	...
  	object_name* object_Window_Target;
  	...
};
```

```cpp
// create object
unsigned int objectId = 0;
glGenObject(1, &objectId);
// bind/assign object to context
glBindObject(GL_WINDOW_TARGET, objectId);
// set options of object currently bound to GL_WINDOW_TARGET
glSetObjectOption(GL_WINDOW_TARGET, GL_OPTION_WINDOW_WIDTH,  800);
glSetObjectOption(GL_WINDOW_TARGET, GL_OPTION_WINDOW_HEIGHT, 600);
// set context target back to default
glBindObject(GL_WINDOW_TARGET, 0);
```

这段代码展示了你在使用 OpenGL 时会经常遇到的工作流程。首先，我们创建一个对象并将其引用存储为一个 ID（实际对象的数据在后台存储）。然后，我们将对象绑定（使用它的 ID）到上下文的目标位置（在这个例子中，窗口对象的目标位置定义为 `GL_WINDOW_TARGET`）。接下来，我们设置窗口选项，最后通过将当前窗口目标的对象 ID 设置为 0 来取消绑定。我们设置的选项存储在由 `objectId` 引用的对象中，一旦我们重新将该对象绑定回 `GL_WINDOW_TARGET`，这些选项会被恢复。

{% include box.html color="red" content="到目前为止提供的代码示例只是 OpenGL 操作的近似概述；在本书中，你将会遇到足够多的实际示例。" %}

使用这些对象的好处在于，我们可以在应用程序中定义多个对象，设置它们的选项，然后每当开始一个使用 OpenGL 状态的操作时，我们只需绑定拥有我们所需设置的对象。例如，某些对象充当 3D 模型数据的容器（如房屋或角色），每当我们想绘制它们时，只需要绑定包含我们想绘制的模型数据的对象（这些对象是在之前创建并设置了选项的）。拥有多个对象让我们能够指定许多模型，而每当我们想绘制特定模型时，只需在绘制前绑定对应的对象，而不需要再次设置所有选项。

## 让我们开始吧

现在你已经了解了一些关于 OpenGL 作为一个规范和库的基本知识，知道了 OpenGL 大致是如何在背后操作的，以及它使用的一些技巧。如果你没有完全理解，不用担心；在接下来的书中，我们将一步步讲解每个概念，并且通过足够的实例帮助你真正掌握 OpenGL。

## 补充资源

- [opengl.org](https://www.opengl.org/): OpenGL 官方网站.
- [OpenGL registry](https://www.opengl.org/registry/): Khronos Group 托管了所有 OpenGL 版本的规格和扩展文档。
