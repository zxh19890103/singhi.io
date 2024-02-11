---
layout: post
title: Javascript 中 “==” 操作符
short: 总结了JavaScript中 “==” 操作符的计算法则
category: tech
---

{% include img.html src="http://zxh1989.oss-cn-qingdao.aliyuncs.com/20190317/003621_69137.jpg" title="复习一下 js 中的原型链模型" %}

比较运算 x == y，其中 x 和 y 是值，产生 true 或者 false。这样的比较按如下方式进行：

定义 typeofX = Type(x)、typeofY = Type(y)

1. 若 typeofX 与 typeofY 相同，则
    1. 若 typeofX 为 Undefined，返回 true
    2. 若 typeofX 为 Null，返回 true
    3. 若 typeofX 为 Number，则
      1. 若 x 为NaN，返回 false
      2. 若 y 为 NaN，返回 false
      3. 若 x 与 y 为相等数值，返回 true
      4. 若 x 为 +0 且 y 为 -0，返回 true
      5. 若 x 为 -0 且 y 为 +0，返回 true
      6. 返回false
    4. 若 typeofX 为 String，则当 x 和 y 为完全相同的字符序列（长度相等且相同字符在相同位置）时返回 true；否则，返回 false
    5. 若 typeofX 为 Boolean，当 x 和 y 同为 true 或者同为 false 时返回 true；否则，返回 false
    6. 当 x 和 y 为引用同一对象时返回 true；否则，返回 false
2. 若 x 为 null 且 y 为 undefined，返回 true
3. 若 x 为 undefined 且 y 为 null，返回 true
4. 若 typeofX 为 Number 且 typeofY 为 String，返回 Comparison x == ToNumber(y)
5. 若 typeofX 为 String 且 typeofY 为 Number，返回 Comparison ToNumber(x) == y
6. 若 typeofX 为 Boolean，返回 Comparison ToNumber(x) == y
7. 若 typeofY 为 Boolean，返回 Comparison x == ToNumber(y)
8. 若 typeofX 为 String 或 Number，且 typeofY 为 Object，返回 Comparison x == ToPrimitive(y)
9. 若 typeofX 为 Object 且 typeofY 为 String 或 Number，返回 Comparison ToPrimitive(x) == y
10. 返回 false
