---
layout: post
title: Webpack 优化分包之 minChunks
short: 文本要介绍的是配置项 minChunks 的作用
tags:
  - webpack
  - 优化
  - 分包
---

### 官方定义

> Minimum number of chunks that must share a module before splitting.

这是说，**在 webpack 对模块 M 执行分离之前，共享了模块 M 的代码块的最小数目。**

`before splitting` 是针对 `a module`（be shared by at least [minChunks] chunks）而言的。在满足 minChunks 的条件下，`a module` 将会被分离出去。

`minimum number` 则是针对 `chunks` (share the module) 而言的，它限定了 chunks 的个数。

下面用数学语言来说明一下。

设存在一些代码块（chunk）C1、C2、...、Cn，这里 n > 2；并，设存在模块 M，代码块 C¡ 均引用之（import M），其中 ¡ 属于集合 [1, 2, ..., n]；

设 minChunks 为一个自然数，那么当 `n < minChunks`，M 将分别拷贝到 C1、C2、...、Cn 中；当 `n > minChunks`，M 将独立为一个代码块，并分别在 C1、C2、...、Cn 中得以引用。

这就是 **minChunks** 所要说的！

下面用实例验证。

我首先给出 webpack 的配置如下：

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
      default: {
        minSize: 16,
        minChunks: 2,
      }
    }
  }
}
```

这里 `splitChunks.chunks` 为 `"all"` 以及 `splitChunks.deault.minSize` 为 16 是为了满足基本的分包条件，在[《Webpack 优化分包之 minSize 和 maxSize》](/2019/12/28/webpack-in-depth-001.html) 已经解释过。

> 为什么要覆盖 default 缓存组配置，而不直接配置 splitChunks？这里有个不同，默认缓存组和 splitChunks 的配置似乎是两码事。缓存组的（若干）配置可以从 splitChunks 上继承而来。当不覆盖 default 缓存组配置时 splitChunks.minChunks 似乎没有起作用，只有 splitChunks.minSize 起作用！也就是配置 `{ minSize: 16, minChunks: n }`  产生的效果是一致的（其中，n 为变量）。

我们有 `foo.js` 和 `bar.js` 两个入口模块文件，它们都引用了第三个模块 `m.js`，

bar.js
```js
import "./m"

const DESC = `
  This is page BAR;
  I imported m.
`

alert(DESC)
```

foo.js
```js
import "./m"

const DESC = `
  This is page FOO;
  I imported m.
`

alert(DESC)
```

m.js
```js
const DESC = `This is a module shared by BAR & FOO`
alert(DESC)
```

我将 `splitChunks.default.minChunks` 设置为 2，如此配置，我们的期望是 webpack 能够将 m.js 作为一个代码块分离出来，是不是呢？

执行 `npm run mc`，终端输出：

{% include img.html src="https://raw.githubusercontent.com/zxh19890103/learnwebpack/master/snapshots/7NJNJHGFDSAQW3455.jpg" %}

现在，我们将 `splitChunks.default.minChunks` 设置为 3，我们期望 webpack 不分离 `m.js`。

打包结果如下：

{% include img.html src="https://raw.githubusercontent.com/zxh19890103/learnwebpack/master/snapshots/78FVH766T5FCFCGVHV.jpg" %}

可以看到，如其所愿！

但是，将 splitChunks.default.minChunks 设置为 1 的时候，webpack 会将 bar.js、foo.js、m.js 都分离一次，我不大理解。🤔

下面就是其打包结果：

- bar.bundle.a831d0e.js
- default~bar.chunk.9d38e0a.js
- default~bar~foo.chunk.7141de8.js
- default~foo.chunk.ea7a1f5.js
- foo.bundle.a831d0e.js



