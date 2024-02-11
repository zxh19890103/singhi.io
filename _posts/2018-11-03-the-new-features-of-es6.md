---
layout: post
title: ES6新特性列举
short: 列举几个罕用的新玩法，当前用不着的。但是不保证今后什么时候会用上
tags:
  - ES6
category: tech
---


看Babel官网，无意发现了ES6的新特性介绍。其中，大多数平时在项目中用过，这里，我想拿出几个不常用——至少是我没怎么用——的新特性（ES6出来这么多年了，感觉算是老特性了）来说说。

### 增强的对象字面量
ES5里，如果想给一个对象设置原型，可以用到 `__proto__` 属性。

ES6里，我们直接在字面量里声明：
```js
var obj = {
    // Sets the prototype. "__proto__" or '__proto__' would also work.
    __proto__: theProtoObj,
    // Computed property name does not set prototype or trigger early error for
    // duplicate __proto__ properties.
    ['__proto__']: somethingElse,
    // Shorthand for ‘handler: handler’
    handler,
    // Methods
    toString() {
     // Super calls
     return "d " + super.toString();
    },
    // Computed (dynamic) property names
    [ "prop_" + (() => 42)() ]: 42
};
```
其中 “Computed property name does not set prototype or trigger early error for ...”，我感觉有些不明确。

经过在Chrome Console运行测试，结果是后者覆盖前者，没报什么错误啊！

### 迭代器（Iterator）和 ForOf
定义一个迭代器，可以有两种方法，其一是利用 `Symbol.iterator`，基于对象字面量声明特殊方法（见下例）；其二是结合生成器（Generator）。

先看第一个方法：

```js
let fibonacci = {
  [Symbol.iterator]() {
    let pre = 0, cur = 1;
    return {
      next() {
        [pre, cur] = [cur, pre + cur];
        return { done: false, value: cur }
      }
    }
  }
}

for (var n of fibonacci) {
  // truncate the sequence at 1000
  if (n > 1000)
    break;
  console.log(n);
}
```

可以看到，我们在fibonacci对象上声明了一个方法，其键值为Symbol.iterator，方法返回一个持有next方法的对象，而next方法返回的是 { done: Boolean, value: Any } 这样的结构。

仅此而已！fibonacci就变成了一个Iterator。

而另一种方式：

```js
var fibonacci = {
  [Symbol.iterator]: function*() {
    var pre = 0, cur = 1;
    for (;;) {
      var temp = pre;
      pre = cur;
      cur += temp;
      yield cur;
    }
  }
}

for (var n of fibonacci) {
  // truncate the sequence at 1000
  if (n > 1000)
    break;
  console.log(n);
}
```

这一次，Symbol.iterator 映射的不是一个普通函数。带有*符号的函数被成为 Generator 函数。

对于 Generator 函数，其被执行后返回的是一个 generator，它有三个方法：next、throw、return。你应该发现了，上面的那种定义方式其实就是在模仿生成器函数，具体做法就是构造相似的结构。

### import
import在ES6中仅用于导入模块的命令吗？不是的！

它也是个函数，返回Promise，主要用于异步加载模块。

### Binary and Octal Literals
数值的二进制表示和八进制字面量表示：

```js
0b111110111 === 503 // true
0o767 === 503 // true
```

### Math + Number + String + Object APIs
```js
Number.EPSILON
Number.isInteger(Infinity) // false
Number.isNaN("NaN") // false

Math.acosh(3) // 1.762747174039086
Math.hypot(3, 4) // 5
Math.imul(Math.pow(2, 32) - 1, Math.pow(2, 32) - 2) // 2

"abcde".includes("cd") // true
"abc".repeat(3) // "abcabcabc"

Array.from(document.querySelectorAll("*")) // Returns a real Array
Array.of(1, 2, 3) // Similar to new Array(...), but without special one-arg behavior
[0, 0, 0].fill(7, 1) // [0,7,7]
[1,2,3].findIndex(x => x == 2) // 1
["a", "b", "c"].entries() // iterator [0, "a"], [1,"b"], [2,"c"]
["a", "b", "c"].keys() // iterator 0, 1, 2
["a", "b", "c"].values() // iterator "a", "b", "c"

Object.assign(Point, { origin: new Point(0,0) })
```
