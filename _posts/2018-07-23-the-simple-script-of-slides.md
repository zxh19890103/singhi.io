---
layout: post
title: 简单的图片轮播功能实现
short: 图片轮播，网上能实现它的资源不在少数。闲来无事，在个人的博客中，我自己简单实现了一下
category: tech
---

单纯拿切换图片来说，并非难事。做图片轮播功能的难点在于切换效果的实现。我在此实现了一个淡出淡入的切换效果，提供了设计思路，供日后有需要时参考。

给我2张图片，`A.png` 和 `B.png`。

给我一个矩形区域 `DIV`。

我要在 `DIV` 中以层叠的方式放入 A、B 两张图片，那么需要 DIV 的 `style.position = relative` ，需要 A、B 的 `style.position = absolute` ，同时 A、B fill了 DIV 的全部空间，也就是 `A { top: 0, left: 0, width: 100%, height: 100% } `，B 同。

这样下来，显示出来的是B图片，因为 B 在 A 之后放置。

如何显示 A 呢？可以设置 B 的 `opacity` 为 `0`。

为了切换 A、B，我们需要来回设置 A、B 的 `opacity` 为 `0、1`。

为了切换时更为优雅，我们可以用 CSS3 的缓动属性 `transition`。

### HTML代码

```html
<div class="slides">
  <a href="javascript:void(0);" data-index="0" class="slides__item" style="opacity: 0;"> 
    <img src="B.png">
  </a>
  <a href="javascript:void(0);" data-index="1" class="slides__item" style="opacity: 0;"> 
    <img src="B.png">
  </a>
</div>
```

### JavaScript

```js
var N = 2
var current = -1;
var elements = {};

function init() {
    $('.ad > .ad__img').each(function() {
        var key = $(this).data('index');
        elements[key] = $(this);
    })
}

function fadeInImg(key) {
    var element = elements[key];
    var prevElement = current > -1 ? elements[current] : null;
    prevElement && (prevElement.css({ opacity: 0 }));
    element.css({ opacity: 1 });
    current = key;
    setTimeout(function() {
        var nextKey = + key + 1;
        if (nextKey === N) nextKey = 0;
        fadeInImg(nextKey);
    }, 10 * 1000);
}

init(); // 设置
fadeInImg(0); // 开始切换
```

### CSS (SCSS)

```scss
.slides {
    position: relative;
    height: 88px;
    &__item {
        position: absolute;
        top: 0;
        left: 0;
        display: block;
        padding: 4px 0;
        @include transition(opacity 3s linear);
        > img {
            width: 100%;
            height: 80px;
            border-radius: 4px;
        }
    }
}
```
 
注意，`transition` 中设置的 `duration` 要小于 `setTimeout` 的 `duration`，这里前者是`3`秒，后者是`10`秒。
