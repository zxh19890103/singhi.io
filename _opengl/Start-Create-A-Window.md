---
layout: bookdetail
chapter: 三
short: 在我们开始创建令人惊叹的图形之前，首先需要做的事情是创建一个 OpenGL 上下文和一个应用窗口来进行绘制。
title: 开始 &bull; 创建一个窗口
category: tech
src: https://learnopengl.com/Getting-started/Creating-a-window
date: 2025-02-19
book: opengl
---

在我们开始创建令人惊叹的图形之前，首先需要做的事情是创建一个 OpenGL 上下文和一个应用窗口来进行绘制。然而，这些操作在不同的操作系统上是特定的，而 OpenGL 刻意地将自己与这些操作抽象开来。这意味着我们必须自己创建一个窗口、定义一个上下文，并处理用户输入。

幸运的是，有很多库可以提供我们需要的功能，其中一些库专门面向 OpenGL。这些库为我们省去了所有与操作系统相关的工作，并为我们提供了一个可以渲染的窗口和 OpenGL 上下文。一些比较流行的库包括 GLUT、SDL、SFML 和 GLFW。在 LearnOpenGL 中，我们将使用 **GLFW**。你也可以自由选择使用其他库，它们的设置方式通常与 GLFW 的设置相似。

## GLFW

GLFW 是一个用 C 语言编写的库，专门面向 OpenGL。它为我们提供了渲染所需的基本功能，允许我们创建一个 OpenGL 上下文、定义窗口参数并处理用户输入，这些功能足以满足我们的需求。

本章和下一章的重点是让 GLFW 正常运行，确保它正确创建 OpenGL 上下文并显示一个简单的窗口供我们进行操作。本章将采取一步步的方式，介绍如何获取、构建和链接 GLFW 库。本文使用的是 Microsoft Visual Studio 2019 IDE（注意，这个过程在更新版本的 Visual Studio 中是相同的）。如果你不是在使用 Visual Studio（或使用的是较旧版本），也不用担心，其他大多数 IDE 中的过程也是类似的。

## 构建 GLFW

可以从 GLFW 的网页的 [下载](http://www.glfw.org/download.html) 页面获取 GLFW。GLFW 已经为 Visual Studio 2012 到 2019 提供了预编译的二进制文件和头文件，但为了完整起见，我们将从源代码自己编译 GLFW。这是为了让你了解编译开源库的过程，因为并不是所有的库都会提供预编译的二进制文件。所以，让我们下载 _源代码包_。

{% include box.html color="red" content="我们将以 64 位二进制格式构建所有库，因此如果你使用的是预编译的二进制文件，确保获取 64 位版本。" %}

下载完源代码包后，解压并打开其内容。我们只关心几个项目：

- 编译后的库文件。
- **include** 文件夹。

从源代码编译库可以确保编译后的库是完全针对你的 CPU/操作系统量身定制的，而预编译的二进制文件有时无法提供这种定制（有时预编译的二进制文件可能不适用于你的系统）。不过，向公众提供源代码的问题是，并非每个人都使用相同的 IDE 或构建系统开发他们的应用程序，这意味着提供的项目/解决方案文件可能与其他人的设置不兼容。因此，人们需要使用给定的 .c/.cpp 和 .h/.hpp 文件自行设置项目/解决方案，这会比较麻烦。正是出于这些原因，CMake 工具应运而生。

### CMake

CMake 是一个工具，可以通过预定义的 CMake 脚本，从一组源代码文件生成用户选择的项目/解决方案文件（例如 Visual Studio、Code::Blocks、Eclipse）。这使我们能够从 GLFW 的源代码包生成一个 Visual Studio 2019 项目文件，之后可以用它来编译库。首先，我们需要下载并安装 CMake，可以从他们的 [下载](http://www.cmake.org/cmake/resources/software.html) 页面进行下载。

安装 CMake 后，你可以选择通过命令行或者 GUI 来运行 CMake。为了避免过于复杂，我们将使用 GUI 版本。CMake 需要一个源代码文件夹和一个目标二进制文件夹。对于源代码文件夹，我们选择下载的 GLFW 源代码包的根文件夹，对于构建文件夹，我们创建一个新目录 _build_，并选择该目录。

![CMake Logo 图片](https://learnopengl.com/img/getting-started/cmake.png)

一旦源代码和目标文件夹设置好，点击 `Configure` 按钮，CMake 将读取所需的设置和源代码。然后我们需要选择项目的生成器，既然我们使用的是 Visual Studio 2019，那么我们将选择 `Visual Studio 16` 选项（Visual Studio 2019 也被称为 Visual Studio 16）。CMake 会显示出配置生成库的可选构建选项。我们可以保持默认值，并再次点击 `Configure` 来保存设置。设置好之后，点击 `Generate`，CMake 会在你的 `build` 文件夹中生成相应的项目文件。

### 编译

在 `build` 文件夹中现在可以找到一个名为 `GLFW.sln` 的文件，我们可以使用 Visual Studio 2019 打开它。由于 CMake 生成的项目文件已经包含了正确的配置设置，所以我们只需构建该解决方案。CMake 应该已经自动配置了解决方案，使其编译成 64 位库；现在点击构建解决方案。这将生成一个编译好的库文件，位于 `build/src/Debug` 文件夹中，文件名为 `glfw3.lib`。

生成库之后，我们需要确保 IDE 知道在哪里找到库文件和包含文件，以便用于我们的 OpenGL 程序。有两种常见的做法：

1. 我们找到 IDE/编译器的 `/lib` 和 `/include` 文件夹，将 GLFW 的 `include` 文件夹中的内容添加到 IDE 的 `/include` 文件夹中，并将 `glfw3.lib` 添加到 IDE 的 `/lib` 文件夹中。虽然这样做是可行的，但并不是推荐的方法。因为很难管理你的库和包含文件，而且每次重新安装 IDE/编译器时，你都需要重新进行这个过程。
2. 另一种方法（推荐）是创建一个新的目录集合，选择一个你想要的位置，包含所有第三方库的头文件和库文件，之后可以从 IDE/编译器中引用它们。例如，你可以创建一个包含 `Libs` 和 `Include` 文件夹的文件夹，分别存储所有 OpenGL 项目的库文件和头文件。这样，所有的第三方库都会组织在一个统一的位置（可以在多个计算机之间共享）。但是，要求是每次创建新项目时都需要告诉 IDE 在哪里找到这些目录。

一旦所需的文件存放在你选择的位置，我们就可以开始创建我们的第一个 OpenGL GLFW 项目了。

## 我们的第一个项目

首先，打开 Visual Studio 并创建一个新项目。如果有多个选项，选择 C++，然后选择 `Empty Project`（不要忘了给你的项目起个合适的名字）。因为我们将使用 64 位进行所有开发，而项目默认是 32 位的，所以需要将顶部 Debug 旁边的下拉菜单从 `x86` 改为 `x64`：

![如何从 x86 切换到 x64](https://learnopengl.com/img/getting-started/x64.png)

完成后，我们就有了一个工作区，可以开始创建我们的第一个 OpenGL 应用程序了！

## 链接

为了让项目使用 GLFW，我们需要将库与项目链接。可以通过在链接器设置中指定使用 `glfw3.lib` 来实现，但因为我们将第三方库存储在不同的目录中，项目尚不知道在哪里找到 `glfw3.lib`。因此，我们首先需要将这个目录添加到项目中。

我们可以告诉 IDE 在需要查找库和头文件时考虑这个目录。右键点击解决方案资源管理器中的项目名称，然后转到 `VC++ Directories`，如下图所示：

![Visual Studio 的 VC++ Directories 配置](https://learnopengl.com/img/getting-started/vc_directories.png)

接下来，你可以添加自己的目录，以便让项目知道去哪里查找。这可以通过手动插入目录路径，或者点击相应的字符串并选择 `<Edit..>` 选项来完成。对 `Library Directories` 和 `Include Directories` 都进行相同的操作：

![Visual Studio 的 Include Directories 配置](https://learnopengl.com/img/getting-started/include_directories.png)

在这里，你可以添加任意数量的目录。从此，IDE 在搜索库和头文件时也会搜索这些目录。一旦将 GLFW 的 `Include` 文件夹添加进去，你就可以通过 `#include <GLFW/..>` 来找到所有 GLFW 的头文件。库目录同样适用。

由于 VS 现在可以找到所有所需的文件，我们终于可以将 GLFW 链接到项目中。接着转到 `Linker` 选项卡中的 `Input`：

![Visual Studio 的 Linker 配置](https://learnopengl.com/img/getting-started/linker_input.png)

然后，要链接到库，需要在链接器中指定库的名称。因为库名是 `glfw3.lib`，所以将其添加到 `Additional Dependencies` 字段中（可以手动添加或使用 `<Edit..>` 选项）。从此，当我们编译时，GLFW 会自动被链接到项目中。除了 GLFW 外，我们还应当添加 OpenGL 库的链接，但这可能会根据操作系统的不同而有所变化：

### Windows 系统上的 OpenGL 库

如果你使用的是 Windows，OpenGL 库 `opengl32.lib` 是随 Microsoft SDK 一起提供的，而这个 SDK 是在安装 Visual Studio 时默认安装的。由于本章使用的是 Visual Studio 编译器并且是在 Windows 上进行开发，我们需要将 `opengl32.lib` 添加到链接器设置中。需要注意的是，OpenGL 库的 64 位版本也叫 `opengl32.lib`，与 32 位版本同名，这个名字可能有点令人困惑。

### Linux 系统上的 OpenGL 库

在 Linux 系统上，你需要通过将 `-lGL` 添加到链接器设置来链接到 `libGL.so` 库。如果找不到该库，可能需要安装 Mesa、NVIDIA 或 AMD 的开发包。

然后，一旦你将 GLFW 和 OpenGL 库添加到链接器设置中，你就可以如下方式包含 GLFW 的头文件：

```cpp
#include <GLFW/glfw3.h>
```

{% include box.html color="green" content="对于使用 GCC 编译的 Linux 用户，以下命令行选项可能会帮助你编译项目：<code>-lglfw3 -lGL -lX11 -lpthread -lXrandr -lXi -ldl</code>。如果没有正确链接相应的库，将会产生许多 <em>未定义引用</em> 错误。" %}

这就是 GLFW 的设置和配置过程。

## GLAD

我们还没有完全完成设置，因为还有一件事需要做。由于 OpenGL 只是一个标准/规范，具体的图形卡驱动程序需要根据该规范进行实现。由于 OpenGL 驱动程序有很多不同的版本，大多数函数的位置在编译时并不知道，需要在运行时查询。因此，开发者的任务是获取需要的函数的位置，并将它们存储到函数指针中以备后用。获取这些位置是[操作系统特定的](https://www.khronos.org/opengl/wiki/Load_OpenGL_Functions)。在 Windows 上，它的做法如下：

```cpp
// 定义函数的原型
typedef void (*GL_GENBUFFERS) (GLsizei, GLuint*);
// 查找函数并将其赋值给函数指针
GL_GENBUFFERS glGenBuffers  = (GL_GENBUFFERS)wglGetProcAddress("glGenBuffers");
// 现在可以像正常的函数一样调用
unsigned int buffer;
glGenBuffers(1, &buffer);
```

正如你所看到的，代码看起来复杂，而且对于每个未声明的函数，必须逐个处理，过程相当繁琐。幸运的是，也有库可以解决这个问题，其中 **GLAD** 是一个流行且更新的库。

### 配置 GLAD

GLAD 是一个开源库，能够管理我们之前提到的繁琐工作。与大多数常见的开源库不同，GLAD 有着稍微不同的配置方式。GLAD 使用一个 Web 服务，我们可以告诉 GLAD 我们希望定义和加载哪个版本的 OpenGL 相关函数。

访问 GLAD 的 Web 服务，确保语言设置为 C++，在 API 部分选择至少 3.3 版本的 OpenGL（这是我们将使用的版本；更高版本也可以）。同时，确保配置文件设置为 Core，并勾选 Generate a loader 选项。忽略扩展（目前），然后点击 Generate 来生成相应的库文件。

确保从 [https://glad.dav1d.de/](https://glad.dav1d.de/) 下载的是 **GLAD1** 版本，而不是 **GLAD2** 版本，后者在本项目中无法编译。

GLAD 现在应该已经提供了一个包含两个 include 文件夹和一个 glad.c 文件的 zip 文件。将这两个 include 文件夹（glad 和 KHR）复制到你的 include 目录中（或者添加一个额外的项指向这些文件夹），并将 glad.c 文件添加到你的项目中。

完成上述步骤后，你应该能够在文件顶部添加以下 include 指令：

```cpp
#include <glad/glad.h>
```

此时，点击编译按钮应该不会再报错。接下来，你就可以进入 [下一章节](https://learnopengl.com/Getting-started/Hello-Window)，在这一章中我们将讨论如何使用 GLFW 和 GLAD 来配置一个 OpenGL 上下文并创建一个窗口。确保检查所有的 `include` 和 `library` 目录是否正确，并确保链接器设置中的库名称与相应的库文件匹配。

## 其它资源

- [GLFW: 窗口指南](http://www.glfw.org/docs/latest/window_guide.html)：官方的 GLFW 窗口设置和配置指南。
- [构建应用程序](http://www.opengl-tutorial.org/miscellaneous/building-your-own-c-application/)：提供有关应用程序编译/链接过程的详细信息，并列出了可能出现的错误及其解决方案。
- [在 Code::Blocks 中使用 GLFW](http://wiki.codeblocks.org/index.php?title=Using_GLFW_with_Code::Blocks)：在 Code::Blocks IDE 中构建 GLFW。
- [运行 CMake](http://www.cmake.org/runningcmake/)：简要概述了如何在 Windows 和 Linux 上运行 CMake。
- [在 Linux 下编写构建系统](https://learnopengl.com/demo/autotools_tutorial.txt)：Wouter Verholst 的 Autotools 教程，介绍如何在 Linux 中编写构建系统。
- [Polytonic/Glitter](https://github.com/Polytonic/Glitter)：一个简单的模板项目，预先配置了所有相关库；如果你不想自己编译所有库，可以作为示例项目使用。
