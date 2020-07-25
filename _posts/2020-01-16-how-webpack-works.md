---
layout: post
title: 关于 Webpack 一些基本
short: 不解读源码，从表象上来看看 Webpack
tags:
 - webpack
---

### 历史

相关的历史可以看 [https://survivejs.com/webpack/foreword/](https://survivejs.com/webpack/foreword/)

第一段翻译如下：

> 关于 webpack，存在一段有趣的故事。我沉迷 JavaScript 之前是一名 Java 开发，那时，我正尝试一个 GMT（Google Web Toolkit） 项目。GWT 是一个能将 Java 转化为 JavaScript 的编译器，并且它拥有一个不错的特性：code splitting。我喜欢这个特性，但是既存的 JavaScript 工具缺少了它。我向一个模块打包工具提了一个 issue，但是未能推进。这时，webpack 诞生了！

第二段意思是，Instagram 项目促使了 webpack 的繁荣昌盛。

### 是什么及其存在的意义

> webpack is a module bundler.

Webpack 是基于 Nodejs 开发的脚本程序，该脚本程序能够按照模块规范将模块中的内容贯穿起来，输出为一个整体，并保证这个整体按照原先的模块间依赖关系运行。就我了解，Webpack 早在 2015 年之前就得到了大面积的应用，当时的版本是 `1.x`。经过几年的发展，目前是 `5.x`。

> 记得当年（≈2016）我的同事 P 使用 webpack 1.x 和 VUE 1.x， 边写着代码，边向我介绍这一开发方式。P 说：“现在很流行这样的写法”，他指着代码中出现的“require”一词。当时，我还只是一个 jQuery 用户，没能感触到它的威力！

目前版本的 Webpack 可理解的模块规范有：Commonjs、ES6、AMD；另外， CSS 中的 `@import` 声明、`url(...)` 和 HTML 中的 `<img src=...` 也都被认作 [Module](https://webpack.js.org/concepts/modules/#what-is-a-webpack-module)。

Nodejs 平台可以理解 `require("path/to/module")` 与 `module.exports = ...`，而 `require` 和 `exports` 是构建模块关系的关键。因此，我们通过 `require` 和 `exports` 构建的模块化脚本应用能够被 Nodejs 平台解析并运行。

在浏览器上，虽然目前多数已支持 ES6 模块规范：

```html
<script type="module">
  import "path/to/module" // will cause network loading.
</script>
```

然而，对于模块化脚本资源的加载是基于网络的，因此尚存在一些性能和体验问题。另一方面，目前大量的 npm 包资源基于 Commonjs 规范，浏览器对此不能理解（虽然可以支持，比如 SystemJs 等，但是 2 种模块规范的混用可能会导致不必要的麻烦）。

对于需要运行于浏览器端的脚本应用， 先经过 Webpack 进行打包（bundle）处理是必要的。

然而，打包只是基本能力，Webpack 的更重要的意义在于向用户提供了两大特性：*Code Splitting* 和 *HMR*。要知道 Webpack 最初出现的原因就是 *Code Splitting* 。

### 如何做到

#### 如何 Bundle

bundle 是根据“模块依赖声明”递归地分析一个模块的依赖而得以实现的。所谓“模块依赖声明”，就是各种模块规范所约定的那些关键字或函数，比如 Commonjs 的 `require`、ES6 的 `import` 等。所谓“递归”，是因为模块的依赖关系是一种树结构，通过“递归”可以将结构中的全部模块加载进来。

> 你可以阅读项目 [minipack](https://github.com/ronami/minipack) 的源码了解 webpack 的机制。

首先，函数`createAsset`根据给定 path 创建 module，借 [babylon](https://github.com/babel/babel/tree/master/packages/babel-parser) 来分析 module 的依赖 dependencies。然后，函数`createGraph`，根据给定 path，借助 `createAsset` 构建模块关系图。最后，函数 `bundle` 对 module 的 code 部分进行封装，并加上 runtime 部分，写盘。

注意，虽然我上面提到“递归”，但由于其可能导致堆栈溢出， webpack 后来采用 *Queue* 来迭代模块的依赖。

#### 如何 Code Splitting

有两处依赖声明会导致独立的 chunk 产生，一个是`entry`，另一个是`import(...)`。为了方便起见，我们先抛开 webpack 提供的分包能力。

首先，对于 entry 的配置，最标准的方式是：

```js
{
  entry: {
    main: "src/index.js",
    lib: "node_modules/react"
  },
  output: {
    filename: "[name].js"
  }
}
```

假设 index 中不包含任何的依赖，那么这会产生 2 个 js 文件：main.js 和 lib.js；并且，main 与 lib 完全独立。如果，我们的 index 模块包含了依赖声明 `import "react"`，main.js 将包含 react。

而如果，index 模块包含依赖声明：

```js
import(/* webpackChunkName: "react~in~main" */"react")
```

那么，webpack 将产生 3 个 js 文件：

  - main.js
  - react~in~main.js
  - lib.js

这是由于 `import(...)` 也是一个“分离点”。下面来考虑 webpack 用于防止重复（*已经超出这个范围*）的“优化分包”能力。要记住，“优化分包”是基于以上两种分包而言的。

为此需要理解 3 个概念：

- Chunk（下边统称：块）
- ChunkGroup（下边统称：块组）
- CacheGroup（下边统称：缓存组）

块是一个对模块关系网的描述，可以理解为系统的整个模块关系网中的一个子部分。它往往对应于最后的资源输出。

块组是 webpack 用以处理块关系的新模型，它替换了早期的 `parent-child` 模型，`parent-child` 模型现在用于块组上。每个块组包含了若干块，由 `entry` 和 `import(...)` 分离点产生的块处在同一个块组中，这意味着其中的所有块都是平行关系。而一个块可能同时处在多个块组中。在这样的模型下，块分离的意思就是“将分离出来的块加入到所有其原始块所在的块组中”。其中“原始块”是指，新的块在分离之前所在的那些块。

缓存组收集了符合其规则的那些模块，这些模块最后会形成一个或多个块以作为依赖提供给其它块。

如今 webpack 默认为我们设置了 2 个缓存组：

```js
{
  splitChunks: {
    // more options
    cacheGroups: {
      default: {
        minChunks: 2,
        priority: -20
        reuseExistingChunk: true,
      },
      vendors: {
        test: /[\\/]node_modules[\\/]/,
        priority: -10
      }
    }
  }
}
```

可见，考虑 chunks、minSize、minChunks、maxAsyncRequests、maxInitialRequests 条件之后，有：1）凡是 npm 包都被划入 vendors 缓存组；2）凡是在两个以上的块中存在依赖的模块都被划入 default 缓存组。而由此产生的块将会分散到相应的块组中，最后，根据块组的关系生成有关联的资源包。

`splitChunks.name` 可以对缓存组中的模块从 3 个层次加以细分：

- cacheGroupKey，按缓存组的 key 来分。比如 vendors 或 default，这时，分离的块的名字就是 key 的值，缓存组中的全部模块都被合并到一起。
- chunks，按所被依赖的 chunks 来分。
- module，按模块来分。这是最小粒度的分包。

关于`splitChunks.name`的使用，我会专门拿出一篇详细讲解。

#### 如何 HMR

HMR 也就是 Hot Module Replacement. 此机制可以在 app 运行期间加载、运行变更的模块，以得到良好的开发体验。

我们从 4 个视角来说明：

一、应用（application）

app 会分 4 步来更替模块：

  1. app 叫 HMR runtime 去检查更新
  2. runtime 异步下载更新并通知 app
  3. app 然后叫 runtime 应用这些更新
  4. runtime 同步地运行更新

二、编译器（compiler）

作为对普通资源包的补充，编译器需要提供一个“update”以做新旧版本替换，这个“update”包含 2 个部分：

  1. JSON 格式的清单
  2. 一个或多个 js 资源包

清单包含了一个新的 compilation hash 和一组更新的 js 包，每一个 js 包包含了更新的模块，或者提供一个“删除”的标志。编译器确保模块的 ID 和块的 ID 在各次构建时均保持不变。这些 ID 常常被存储在内存（比如 webpack-dev-server 的做法）中，但是偶尔也有必要存在一个 JSON 文件中。

三、模块（module）

HMR 是一个可选特性，只有当你的模块中包含了 HMR 代码时才能工作。一个例子就是通过使用 style-loader 来更新样式的变更，为此，style-loader 实现了 HMR 接口；当它通过 HMR 接收到了更新内容时，旧的样式被新的替换。

类似地，如果在一个模块里实现了 HMR 接口，你可以描述当模块修改后要做的事情。当然，多数情况下，为每个模块实现 HMR 接口是一件不可能的事情。如果一个模块没有提供那个 HMR 句柄，那么对模块的“修改”将会随着模块树上浮。这意味着，仅一个句柄就能处理整个模块树。如果树中任一模块更新了，那么整个依赖结构都会重新加载。

四、运行时（runtime）

对于模块系统的运行时，生成了额外代码以追踪模块的父子关系。管理上，运行时支持 `check` 和 `apply` 两个方法。

check 方法的调用，会引发 HTTP 请求以更新清单。如果请求失败，则表明没有更新；否则，一组更新包将会和一组当前已载入的代码块作一番比较。对于每一个载入的代码块，对应的更新包被下载。所有的更新包都会被存储在运行时里。如果所有的更新包下载完毕并且准备好运行，运行时转入 ready 状态。

apply 方法将所有的待更新模块标记为 invalid。对于每一个 invalid 的模块，都需要有一个更新句柄，这可能来自它自己，或者它的父模块。否则，这个 invalid 标记会随着模块树冒泡，并将其父模块标记为 invalid。冒泡行为将持续到应用的入口点，或者某个能访问到句柄的模块。如果上浮到入口点，则操作失败。

之后，所有的 invalid 模块都会被释放（调用 dispose 句柄）并卸载。当前的 hash 被更新，并且所有的 accept 句柄得以调用。运行时将状态转回到 idle，一切恢复正常。

#### 资源加载器（loader）

一个资源加载器就是一个暴漏出一个函数的 node 模块。而这个函数会在一个资源需要它来执行转换的时候被调用，依靠 `this` 指代的上下文，函数能够访问到资源加载器的 API 。

#### 插件（plugin）

插件对第三方开发者提供了增强 webpack 引擎的一切可能。通过使用构建阶段的各种回调，开发者能够向构建流程引入他们自己的行为。构建一个插件比构建一个资源加载器要困难一些，因为你需要了解 webpack 的某些内部机制，以将自定义行为挂入（hook）其中。准备好阅读源码了吗？

### 工作流程

- 从 CL 读取参数
- 读取 webpack.config.js，若为函数，则执行它并得到配置
- 将 CL 参数转化、合并到配置
- 基于配置，调用 webpack 的 API
  - 根据 Schema 校验配置
  - 应用基于 nodejs 环境的插件：input / output / watch
  - 调用 WebpackOptionsApply 处理配置
    - 将配置项**全部**转化为插件
    - 应用默认插件（非第三方插件）
  - 创建 `Compiler`
  - 调用 `Compiler` 上的 `run` 或者 `watch` 方法
    - `Compiler.run()`
      - compile &rArr; `Complilation`
        - addEntry(dependency)
        - finish
        - seal（Process、Optimize、Sort、Ids、Record、Hash、Assets）
      - emit &rArr; write assets
    - `Compiler.watch()`
      - run
      - watch dependencies &rArr; run again
    - 所有的插件都被放到`Compiler`上
  - 暴露配置中的插件，一备后用
