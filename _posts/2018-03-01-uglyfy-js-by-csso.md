---
layout: post
title: 用 csso 压缩前端资源
short: CSSO (CSS Optimizer) 是一款CSS压缩工具。它可以实现3种对CSS代码的转换
tags:
  - CSSO
  - 前端压缩
---

### 概述

CSSO (CSS Optimizer) 是一款CSS压缩工具。它可以实现3种对CSS代码的转换：

- 清理 - 去除冗余代码
- 压缩 - 简化源代码
- 重构 - 对声明、规则集等的合并

总之，CSSO 可以使你的 CSS 代码体量变得更小。

### API

CSSO 暴露的接口并不多，我们可以一一拿出来解释。

#### 方法 compress(ast[,options])
给定一个 AST 对象，执行压缩操作，返回的是一个压缩后的 AST。

AST 是什么？ AST 全称是 Abstract Syntax Tree，您有兴趣的话可以看看 [Wikipedia](https://en.wikipedia.org/wiki/Abstract_syntax_tree) 上的解释。

CSSO 是基于 CSSTree 现实的，您可以通过 `CSSO.syntax` 来访问 CSSTree 的API。

CSSTree 可以将 CSS 代码编译为 AST 对象，comporess 方法将遍历 AST、生成压缩版的 AST，最后 CSSTree 可以根据压缩后的 AST 生成 css，此时的 css 即压缩后的 css。

看一下示例代码：

```js
var csso = require('csso')
var ast = csso.syntax.parse('.test { color: #ff0000; }')
var compressedAst = csso.compress(ast).ast
var minifiedCss = csso.syntax.generate(compressedAst)

console.log(minifiedCss)
// .test{color:red}
```

配置项解释：

- restructure - Boolean，默认true，是否对css代码结构进行优化
- forceMediaMerge - Boolean，默认false，合并相同query的@media规则。这个优化操作通常不见得很安全，但是多数场景下还是有效的，看您的意愿吧！
- clone - Boolean，默认 false，对输入的AST对象先进行copy，然后做后续操作。如果需要用到未经处理的AST对象，此项可设置为true

- comments - `String | Boolean`，默认true，明确哪些注释需要保留： a. 'exclamation' 或 true 表示保留全部注释；b. 'first-exclamation' 表示仅保留第一个注释；c. false表示移除全部注释
- usage - `Object | null`，默认null，详见 [Usage data](http://www.zhangxinghai.cn/d/26#usageData)
- logger - `Function | null`，默认null，跟踪每一步转换过程

#### 方法 minify(source[,options])

对提供的CSS源码进行压缩，返回一个对象，包含字段 css、map，其中 `css` 就是压缩后的结果了。

配置项解释：

- sourceMap - Boolean，默认false，是否生成source map
- filename - String，css的文件名，这个用于生成source map
- debug - Boolean，默认false，在输出种附带debug信息，目前未实现
- beforeCompress - `Func(AST, options) | Array<Func(AST, options)> | null`，默认null，在parse完后执行
- afterCompress - `Func(compressResult, options) | Array<Func(compressResult, options)> | null`，默认null，compress执行完后运行
- 其它配置 - 同compress方法的配置

#### 方法 minifyBlock(source[,options])

和方法minify差不多，只是它要压缩的内容是一段css声明列表，通常是元素的style属性值。

参考示例：

```js
var result = csso.minifyBlock('color: rgba(255,0,0, 1);  color: #ff0000');
console.log(result.css);
// > color:red
```

#### Source maps
想要获得 source map，你需要设置 sourceMap 配置项为 `true`。同时，你可以配置 filename 为 css 的源文件路径。这样，在 minify 返回的结果的 map 字段就是一个 `SourceMapGenerator` 实例。这个实例能和其它 source map 混合、能转换为字符串（通过 `toString` 方法），看一段代码：

```js
var csso = require('csso')
var css - fs.readFileSync('path/to/my.css', 'utf8')
var result = csso.minify(css, {
  filename: 'path/to/my.css',
  sourceMap: true
})

console.log(result.map.toString())
// '{ .. source map content .. }'
```

#### Usage data

CSSO 可以通过 usage 配置项来规定CSS如果作用到标签上，以获得更棒的压缩效果。usagedata 配置项可以由以下几部分组成：

- blacklist - 黑名单
- tags - 以标签名定义的白名单
- ids - 以属性id定义的白名单
- classes - 以属性class定义的白名单
- scopes - 一组或多组classes

以上全部都是可选的。tags、ids、classes的值是Array，scopes的值是 `Array<Array>`。

*注意：ids、classes的内容是大小写敏感的，tags不是。*

如果您定义了 tags 为 ['UL','li']，那么 `CSSO` 会过滤掉没有使用 `UL` 选择器、也没有使用 `li` 选择器的 CSS 规则：

一段CSS源码：

```css
* { color: green; }

ul, ol, li { color: blue; }

UL.foo, span.bar { color: red; }
```

我的 usage 定义为：

```json
{
  "tags": ["ul", "LI"]
}
```

结果将是：

```css
*{color:green}ul,li{color:blue}ul.foo{color:red}
```

blacklist 的内容包含tags、ids、classes，类型同上，它的作用与 whitelist 刚好相反，不再赘述。

scopes 是给 CSS 分组用的，以获得更好的压缩效果：

有一段css源码：

```css
.module1-foo { color: red; }
.module1-bar { font-size: 1.5em; background: yellow; }

.module2-baz { color: red; }
.module2-qux { font-size: 1.5em; background: yellow; width: 50px; }
```

这段 CSS 有可能是两组彼此不相干的规则，也就是它们不会作用到同一个标签上。但是 CSSO 对此没有把握，它会以更靠谱的方式（仅仅移除空格和分号及换行符）压缩这段css：

```css
.module1-foo{color:red}.module1-bar{font-size:1.5em;background:yellow}.module2-baz{ color:red}.module2-qux{font-size:1.5em;background:yellow;width:50px}
```

但是我们心里知道，这2组规则的的确确是相互独立的，绝不会作用在同一个标签上，这个时候，我们需要明确告诉 CSSO：

```json
{
  "scopes": [
    ["module1-foo", "module1-bar"],
    ["module2-baz", "module2-qux"]
  ]
}
```

我们得到的结果将会是（减少了29字节）：

```json
.module1-foo,.module2-baz{color:red}.module1-bar,.module2-qux{font-size:1.5em;background:#ff0}.module2-qux{width:50px}
```
*注意：同一个class不能同时存在于多个scope中，同时选择器也不能是来自不同的scope，否则会抛出异常。*
