---
layout: post
title: ES2020 新特性列举
short: ES2020 新特性列举
tags:
  - ES2020
date: 2020-03-10 23:31
category: tech
---

- Promise.allSettled

  无论 fulfilled 或 rejected 都算是 settled
- Optional chaining
  ```js
  const thatOne = { }
  const lastname = thatOne.info?.lastname
  // no error! lastname equals undefined
  ```
- Nullish coalescing Operator

  空值合并运算符。undefined 和 null 是 “Nullish”
- dynamic-import
  ```js
  import('../path/to/module')
  ```
- globalThis
  ```js
  var getGlobal = function () {
    if (typeof self !== 'undefined') {
      return self;
    }
    if (typeof window !== 'undefined') {
      return window;
    }
    if (typeof global !== 'undefined') {
      return global;
    }
    throw new Error('unable to locate global object');
  };
  var globals = getGlobal();
  ```
- BigInt

  计算 `-(2^53-1)至 2^53-1` 范围之外的整数
- String.prototype.matchAll

  `String.prototype.macth(reg with flag: global)` 不会匹配“子项”，也即是 `group`，去掉 `global` 标记，则返回第一个匹配。如果获取到全局所有匹配项，包括子项呢？ `String.prototype.matchAll`返回一个迭代器。
