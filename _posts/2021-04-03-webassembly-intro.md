---
layout: post
title: WebAssembly 系列 - 简介
short: 你应该听说过，WebAssembly 非常的快。但是使它如此之快的缘故是什么呢？这一系列，我想向你对于这个问题做一个解释
src: https://hacks.mozilla.org/2017/02/a-cartoon-intro-to-webassembly/
---

你应该听说过，WebAssembly 非常的快。但是使它如此之快的缘故是什么呢？这一系列，我想向你对于这个问题做一个解释。

## 等一下，那什么是 WebAssembly 呢？

WebAssembly 是一种编码方式，不使用 JavaScript，其代码可以在浏览器上运行。因此，当人们说 WebAssembly 很快的时候，他们是想说 WebAssembly 比 JavaScript 快。

现在，我不想暗示我们应该抛弃 JavaScript，开始使用 WebAssembly 了。事实上，我希望开发者们能够在同一个项目里面同时使用二者。

但是，有必要对二者做一个比较，从而，你可以理解 WebAssembly 具有的潜力。

## 性能简史

JavaScript 创建于 1995 年。它最初设计的时候，并不考虑速度，在此后十年，它并不快。

后来浏览器开始了激烈的竞争。

在 2008 年，人们称之为浏览器性能战争元年。多个浏览器加入了 Just-in-time 编译器，也被称为 JITs。当 JavaScript 脚本在执行的时候，JIT 会注意到一些模式，基于这些模式，它可以使代码运行的更快一些。

这些 JIT 的引入，使得 JS 在性能上产生了重大转折。执行 JS 的速度较先前提高了十倍不止。

{% include img.html src="//zxh1989.oss-cn-qingdao.aliyuncs.com/2021-04-03-webassembly-intro/01-01-perf_graph05.png" title="JS 性能转折点出现在 2008" %}

有了这些性能提升，JavaScript 开始用于一些之前所不能指望的场景，比如，Node.js 代表的服务端编程。性能提升也使得 JavaScript 处理全部新型问题变得现实。

鉴于 WebAssembly 的出现，我们可能处在另一个转折点。

{% include img.html src="//zxh1989.oss-cn-qingdao.aliyuncs.com/2021-04-03-webassembly-intro/01-02-perf_graph10.png" title="也许，2017 年是另一个性能转折点" %}

那么，让我们深入研究下到底是什么让 WebAssembly 如此的快。
