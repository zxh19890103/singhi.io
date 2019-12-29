---
layout: post
title: Webpack 优化分包之 minSize 和 maxSize
short: 文本要介绍的是配置项 minSize 和 maxSize 的作用
tags:
  - webpack
  - 优化
  - 分包
---

### minSize

> Minimum size, in bytes, for a chunk to be generated.

以上就是 webpack 官方给出的解释。但是，我认为它什么都没说！当然 minSize 是一个缩略词，minimum size 给出了它代指的那个词组；in bytes 则给出了其单位，即“字节”；for a chunk to be generated 指出了 minSize 这个量值的目标物，即 chunk。

翻译过来：***那将要生成的代码块的最小字节数***。

这是一个结论，设想我们已经通过 webpack 生成了最后的代码块，那么它所说的是：

> 这些代码块的字节数不会小于 minSize 的值。

现在我们来验证一下 minSize 是否真如此。

首先，我们需要“分包”发生，webpack 的分包规则由 cacheGroup 来定义，默认 webpack 提供 vendors 和 default 缓存组分包规则。

default 缓存组分包规则（下面简称“default 规则”）只处理那些[按需加载的代码块](https://webpack.js.org/plugins/split-chunks-plugin/#defaults)，也就是使用 import() 函数分出的那些包。default 包含有以下 2 条规则：

> - New chunk can be shared OR modules are from the node_modules folder
- New chunk would be bigger than 30kb (before min+gz)

第一条说的是，假如有一个代码块分离出来了，比如 A.chunk.js，其存在一个入口模块为 M。那么这意味着 M 在至少两个其它的代码块中被引用；或者，M 来自 npm 安装包，比如 react。

第二条说的正是 minSize，它是说，假如有一个代码块分离出来了，比如 A.chunk.js，那么它将大于 30kb（混淆、压缩之前）。

由此，我们知道，欲测试 minSize 的功能，我们需要满足“条件1”。

我先给出 webpack 配置如下：

```js
module.exports = {
  mode: "production",
  entry: {
    foo: "./src/foo",
    bar: "./src/bar"
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
      chunks: "all",
      minSize: 16,
    }
  }
};
```

入口有两个，一个是 bar，另一个是 foo，这将产生两个chunk（entry chunk），其目的是使得 shared 被“共享”，代码如下：

bar.js
```js
import "./shared"
console.log('This is bar. It uses shared.js')
```

foo.js
```js
import "./shared"
console.log('This is foo. It uses shared.js')
```

shared.js
```js
const DESC = `
  I am shared and I will be shared with bar.js and foo.js.
  I must be bigger than 16 bytes for splitting.
`
console.log(DESC)
```

注意 splitChunks 的配置，chunks 我们设置为 "all"，否则，按照默认规则，webpack 不会将 `import "./shared.js"` 分离出来。另外，minSize 我们设置为16，因此，你看到 `shared.js` 文件的字节数超过了 `16`。

按照 webpack 的说法，一旦我们按照这个配置打包我们的代码，将产生 3 个 chunk。

执行 `npm run mms`，终端输出：

{% include img.html src="https://raw.githubusercontent.com/zxh19890103/learnwebpack/master/snapshots/1577547568939.jpg" %}

`minSize` 发现了 `foo` 和 `bar` 之间的“共享”部分，并将其分离为`bar~foo`。

### maxSize

首先看看官方解释：

[https://webpack.js.org/plugins/split-chunks-plugin/#splitchunksmaxsize](https://webpack.js.org/plugins/split-chunks-plugin/#splitchunksmaxsize)

maxSize 就是将字节数大于 maxSize 值的那些包拆分为更小的包，使得这些更小的包的字节数小于 maxSize 的设置值，但是至少要大于 minSize 的设置值。

> The algorithm is deterministic and changes to the modules will only have local impact.

这句很重要，它说, **maxSize 相关算法是确定的，对于模块的修改只会产生局部影响**

为此，我们修改我们的 webpack 配置：

```json
{
    "splitChunks": {
      "chunks": "all",
      "minSize": 16,
      "maxSize": 32,
    }
}
```

并且新增一个文件，shared-extra.js

shared-extra.js
```js
const DESC = `
  I am shared-extra and I will be imported in shared.js.
  I must be bigger than 16 bytes for splitting.
`

console.log(DESC)
```

修改 `shared.js`，导入 `shared-extra`

shared.js
```js
import "./shared-extra"
// ...
```

我们期望 shared-extra 被分离出去，因为如若不然，bar~foo 的字节数将大于 32。

再执行 `npm run mms`，终端输出：

{% include img.html src="https://raw.githubusercontent.com/zxh19890103/learnwebpack/master/snapshots/B08CDE08-BA5E-4CAB-B50E-8DC36947B81A.jpg" %}

可以看到 `bar~foo~84b2f14a.chunk.42d51b7.js` 的内容正是来自`shared-extra.js`，shared-extra 确实被分离出去了！

`hidePathInfo`设为`false`的时候，由`shared-extra.js`分离的包的名字将包含其路径信息，比如：`bar~foo~._src_shared-extra.js~54bb3df8.chunk.87e211c.js`

值得注意的是，maxSize 的设计意图是配合 “HTTP/2” 来使用的，它分离出更多的更小的包，因而会产生更多的并发请求！

最后，注意下优先级，其中 minSize 优先于 maxSize。这是什么意思呢？
