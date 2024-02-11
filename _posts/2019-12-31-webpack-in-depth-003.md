---
layout: post
title: Webpack 优化分包之 maxInitialRequests 以及 maxAsyncRequests
short: 文本要介绍的是配置项 maxInitialRequests 和 maxAsyncRequests 的作用
tags:
  - webpack
  - 优化
  - 分包
category: tech
---

### 官方定义

对 maxInitialRequests 的定义：

> Maximum number of parallel requests at an entry point.

以及，对 maxAsyncRequests 的定义：

> Maximum number of parallel requests when on-demand loading.

我们只需要研究明白 `maxInitialRequests` 就行。从定义可以看出，`maxInitialRequests` 指示的是“请求数”，而 parallel 一词将“请求”限定为“并行的”，`at an entry point` 后缀词进而将“请求”限定为“从入口发起的”；maximum 一词则将这个“数”限定为“最多的”。

从而，其中文定义类似这样：

> 从入口发起的并行请求的最大数目

“入口”可以理解为`chunk`的“根”，而`chunk`可以理解为模块的依赖关系。作为 initial，此时的“入口”，我们姑且理解为 webpack 配置中的那个 entry 所表示的意思。

### 什么叫“并行请求”？webpack 打包的结果为什么会出现“并行请求”？

首先，什么叫“并行请求”呢？

“并行”是相对“排队”、“阻塞”来说的，“并行请求”就是同时进行的请求。比如，我们的应用包含了 app.js 和 jquery.js，并且我们标记为 “defer” 或 “async” 以不阻塞文档解释；如此，浏览器自然会在解释到它们时立即发送 HTTP 请求，因为确实没有必要“一个一个”地来。

那 webpack 打包的结果怎么会出现“并行请求”呢？

这是由 webpack 的分包机制导致的。对于一个`chunk` C，如果根据分包规则（比如字节数太大、第三方包等）从中分离出了若干`chunk` C¡，¡ > 0，那么当请求 C 的时候，浏览器**同时也需要**请求所有的 C¡，¡ > 0。

**注意**，我们这里所提到的“分包”是有限制的。根据 webpack 的官方文档，有三种分包方式：

- Entry Points
- Dynamic Imports
- Prevent Duplication

其中前两种是你在定义代码结构的时候确定的：对 entry 属性的构造、使用 import 函数。而第三种是根据“cacheGroups”的规则来对代码块（前两种定义下分出的 chunk）进一步进行拆分。

**这里“分包”专指第三种！**

### 实例验证

首先，我还是给出 webpack 的配置：

```js
const CleanWebpackPlugin = require("clean-webpack-plugin")
const path = require("path")
const DIR = __dirname
const L_DIR = DIR.length

const nameFac = (module, chunks, cacheGroupKey) => {
  const m = module.identifier().substr(L_DIR).split('/').join('_')
  return `${cacheGroupKey}-${chunks.map(c => c.name).join('~')}-${m}`
}

module.exports = {
  mode: "production",
  entry: {
    foo: "./src/foo",
  },
  output: {
    path: path.resolve("./dist"),
    filename: "[name].bundle.[hash:7].js",
    chunkFilename: "[name].chunk.[chunkhash:7].js"
  },
  plugins: [new CleanWebpackPlugin.CleanWebpackPlugin({})],
  optimization: {
    minimize: false,
    moduleIds: "named",
    splitChunks: {
      chunks: "all", // 分包的基本条件
      minSize: 16, // 分包的基本条件
      maxInitialRequests: 4,
      maxAsyncRequests: 3,
      cacheGroups: {
        foodeps: {
          test: /foo\-dep/,
          name: nameFac
        }
      }
    }
  }
}
```

我们的目录结构如下：

{% include img.html src="https://zxh1989.oss-cn-qingdao.aliyuncs.com/posts/webpack-in-depth-003/maxrequests-001.jpg" %}

主要看 foo.js 中的内容。

foo.js
```js
import "./foo-dep-01"
import "./foo-dep-02"
import "./foo-dep-03"

const DESC = `
 This is the module FOO which is an entry point.
`

console.log(DESC)
```

`cacheGroups.foodeps` 定义了分包规则，它可以将 foo-dep-01、foo-dep-02、foo-dep-03 三个模块分别分离为独立的代码块。

我们首先设置 maxInitialRequests 为 3，我们预期有 `3` 个模块被分别分离出去！

执行 `npm run mr`，终端输出：

{% include img.html src="https://zxh1989.oss-cn-qingdao.aliyuncs.com/posts/webpack-in-depth-003/maxrequests-002.jpg" %}

奇怪！🤔，好像模块 foo-dep-03 并未被分离出来！我打开 foo.bundle.22c18e3.js 文件，它在里面。

有几点隐藏的控制，“渴望做梦”在他的[一篇博客](https://www.cnblogs.com/kwzm/p/10316217.html)里总结得很好，现摘录如下：

>
- 入口文件本身算一个请求
- 如果入口里面有动态加载得模块这个不算在内
- 通过 runtimeChunk 拆分出的 runtime 不算在内
- 只算 js 文件的请求，css 不算在内
- 如果同时又有两个模块满足 cacheGroup 的规则要进行拆分，但是  maxInitialRequests 的值只能允许再拆分一个模块，那尺寸更大的模块会被拆分出来

根据第一条，我们将 maxInitialRequests 改为 4，结果符合我们的预期：

{% include img.html src="https://zxh1989.oss-cn-qingdao.aliyuncs.com/posts/webpack-in-depth-003/maxrequests-003.jpg" %}

maxAsyncRequests 与 maxInitialRequests 作用类似，只不过“入口”点是“import()”，而不是 entry。
