---
layout: post
title: Webpack 优化分包之 name
short: 文本要介绍的是配置项 name 的作用
tags:
  - webpack
  - 优化
  - 分包
category: tech
---

### name 是包含 3 个变量的函数

虽然，name 的取值类型有`true`、`false`、`string`，但最终都可以用 `function` 来替代。这个函数包含了 3 个变量，它们分别是：`module`、`chunks`、`cacheGroupKey`。那么这个三个变量分别指的是什么意思呢？下面就一一详细加以分析。

#### module - 模块

module 是类型 [Module](https://github.com/webpack/webpack/blob/master/lib/Module.js) 的实例。在进行优化分析的时候，webpack 要将它添加到符合纳入规则的缓存组（CacheGroup）中。module 上的一些属性（或方法）对我们定义的模块作出了描述，如 `Module.identifier()` 返回了 module 的唯一标识，一般是`.js`文件在磁盘中的绝对位置。

#### chunks - 一组代码块

这不是指全部的代码块，有两个范围限定：

- 由 entry splitpoint 和 async splitpoint 拆分出来的
- 依赖 module（就是函数 name 的第一个变量的值） 

不考虑优化拆包，webpack 只在“入口分离点”与“异步依赖分离点”会分别产生代码块（称为：原始代码块，英文称为：Origin Chunk）。往昔的 [CommonsChunkPlugin](https://webpack.js.org/plugins/commons-chunk-plugin/) 插件和如今的 [optimization.splitChunks](https://webpack.js.org/plugins/split-chunks-plugin/) 配置项都是对于这个基础来说的。

如果“异步依赖分离点”对应的代码块 A 是 B 的子代码块，且 A、B 均依赖 module，那么提供给函数 name 的 chunks 变量里只有 B。其中，A 是 B 的子代码块是指，B 中包含了 `import(/* webpackChunkName: "A"*/ ...)`。

#### cacheGroupKey - 缓存组的键

也就是你在配置的时候，写下的那个 key，如以下配置的 `common`：

```js
{
  cacheGroups: {
    common: {
      // ...
    }
  }
}
```

### 意义为何

按说，将一个缓存组纳入的全部模块放到一个代码块里是没问题的，比如这样定义 name：

```js
{
  name: "vendor" | () => "vendor"
}
```

第三个变量 cacheGroupKey 可以用于标识代码块。但是并不建议这样处理，原因就在于，这忽略了变量 chunks 的可能变化。什么意思呢？上述的做法仅仅考虑了 cacheGroupKey 的变化，它将所有符合缓存组规则的模块放到一个代码块中。

举个例子来说，模块 `m1` 和 `m2` 均符合缓存组 `CG007` 的规则（minSize、maxSize、minChunks、chunks、maxAsyncRequests、maxInitialRequests、test、...）；`m1` 来自原始代码块 `OC1`，`m2` 来自原始代码块 `OC2`；`m1` 和 `m2` 合并为一个分离的代码块为 `C1`。这样的情况，当仅加载 `OC1` 或 `OC2` 的时候，我们不加选择地将 `m1` 和 `m2` 一并加载进来。显然，这是没有必要的。第二个变量 chunks 也就是用于处理这个问题。

一般我们会将 chunks 的名字部分连接起来，作为一个唯一标识。它标识的是，在此缓存组中，那些同时由这些原始代码块所依赖的模块的集合。

```js
{
  name: (m, chunks, key) => {
    return `${key}_${chunks.map((item) => item.name).join('~')}`
  }
}
```

最后，要考虑 module 吗？一般是不必要的，那样的话就分得太细碎了，而网络请求数太多，对于只限 6 个并行 HTTP 会话的浏览器不是好事。

### 经典做法

> It is recommended to set splitChunks.name to false for production builds so that it doesn't change names unnecessarily.

这是官方的建议，这样大概不能对缓存组里的模块做分拣。或许，大多数情况是实用的。

而，name 的默认值是 `true`，`true` 表示考虑了缓存组的键和原始代码块两大变量，*所以你很多时候不需要配置 name*。
