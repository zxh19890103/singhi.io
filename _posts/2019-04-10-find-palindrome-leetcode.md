---
layout: post
title: LeetCode 超级回文数
tags:
  - LeetCode
  - Palindrome
---

## 题目是这样描述的

如果一个正整数自身是回文数，而且它也是一个回文数的平方，那么我们称这个数为超级回文数。

现在，给定两个正整数 `L` 和 `R` （以字符串形式表示），返回包含在范围 `[L, R]` 中的超级回文数的数目。

## 限制范围

 - 1 <= len(L) <= 18
 - 1 <= len(R) <= 18
 - L 和 R 是表示 [1, 10^18) 范围的整数的字符串
 - int(L) <= int(R)

## 最初的思路

从 `N = 1` 开始启动循环，循环体按照以下步骤处理：

- `N` 本身是否回文数 ？
- 如果不是，则跳过；否则，判断 `N * N` 是否回文数，如果是，那么计数 `+1`，否则 `N + 1` 继续下一轮
- 直到 `N * N` 超出 `R`

代码如下：

```js
let N = 1
let D = 0
let C = 0
while ((D = N * N) <= R) {
  if (D >= L) {
   if (isPalindrome(N)){
     if (isPalindrome(D)) {
       C += 1
     }
   }
  }
  N += 1
}
```

这是比较直接的思路，`[L,R]` 区间不大的时候可以得到结果。

一旦区间很大，比如 `[ "38455498359", "999999999999999999" ]`，这段程序是跑不下去的！

继续分析
问题在于，`[L,R]` 区间过大时，循环次数太多。所以要想办法减少循环的次数。我们给 `N` 每次加 `1`，这显然是很没必要的。

按照超级回文数的定义，`N` 本身必须是回文数，最小的超级回文数是 `1`，因此我们还可以从 `1` 开始。

能否根据当前的回文数计算出下一个回文数呢？

比如，存在一个函数 `m = ƒ(n)`，其中 `n` 是一个回文数，`m` 是下一个回文数（`m > n`）。

```js
ƒ(1) = 2
ƒ(2) = 3
...
ƒ(9) = 11
ƒ(99) = 101
ƒ(989) = 999
ƒ(999) = 1001
...
```

这是有规律的，因此可以写出函数的形式：

```js
const nextPalindrome = (expr) => {
    if (expr === '9') return 11
    if (expr.length === 1) {
        return Number(expr) + 1
    }
    let isEven = expr.length % 2 === 0
    let mid = Math.ceil(expr.length / 2)
    let exprLeft = expr.substring(0, mid)
    exprLeft = + exprLeft + 1 + ''
    const chars = Array.from(exprLeft).reverse()
    if (!isEven) chars.shift()
    if (isTenTimes(exprLeft)) {
        chars.shift()
    }
    return Number(exprLeft + chars.join(''))
}
```

其中，`isTenTimes` 是判断一个字符串表达的数值是否是 `10ˆn`，比如 10、100、1000、...

给定回文数 `N1`，计算下一个回文数 `N2` 的规则是这样的，对于 1 - 8 我们直接返回` +1` 后的值，对于 `9` 返回 `11`，对位数大于 `1` 的回文数，我们首先将它按中间位置切分，取前面一段。

比如：µ(151) = 15, µ(8778) = 87, ...

`µ(N1) + 1` 就是下一个回文数 `N2` 的左半部分，将其反转之后得到 `T`，如果 `N1` 的位数是奇数，则需要去掉 `T` 的首位字符，余下的可能是 `N2` 的右半部分。

为什么是可能呢？这里需要考虑进位的情况，对于 `N1 = 9999`，`N2 = 10001`，我们 `µ(9999) = 99, +1` 之后是 `100`，得到 `N2` 是 `100001`，对吗？ 因此，如果发生进位，则需要再去掉次位字符（一共去掉了前面的两个字符），此时余下的就是` N2` 的右半部分。

再来写上面的循环，就应该是：

```js
function superpalindromesInRange(L, R) {
    let r = 0
    const min = BigInt(L) - 1n
    const max = BigInt(R) + 1n
    let i = 1n
    let double = 0n
    while ((double = (i * i)) < max) {
        if (double > min) {
            if (isPalindrome(double + '')) {
                r ++
            }
        }
        i = nextPalindrome(i + '')
        i = BigInt(i)
    }
    return r
}
```

强调一下，JS 中最大安全数值为 `9007199254740991` ，大于这个值的数字是不精确的，因此我才用到了 ES6 的新特性 “BigInt”。
