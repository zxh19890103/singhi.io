---
layout: post
title: 基于 jQuery 的 tooltip 简单小插件
short: 常常困于在互联网上找到满意的js库，或许是方法问题
tags:
  - jQuery
  - Tooltip
  - Plugins
---

### 概述

不知何故，常常困于在互联网上找到满意的js库，或许是方法问题。

今天想找个简单的、独立的 tooltip 的 js 工具，未果！

`jQuery-ui` 提供的 `tooltip` 需要引入一整套 `jQuery-ui` 的样式和脚本库，我觉得不值得，放弃了。

有个叫 `popoverjs` 的库，看似不错，但是用起来有一堆讲究，放弃。

`Bootstrap` 需要引入一整套样式和脚本库，不可用。

花费了一段时间之后，才决定自己简单实现一套，也没用太多时间。

### 分析与思路

#### 对 `tooltip` 的要求：

- 任何包含title属性的标签可启用 tooltip 功能，并取消系统默认的tooltip功能
- 能自动调整 tooltip 浮动窗口的位置以确保它能被完整看到
- 样式符合我的网站风格

#### tooltip的实现思路：

- 用jQuery找到页面所有包含title属性的标签
- 对每个标签绑定mouseenter和mouseleave事件处理函数
- 在mouseenter中创建tooltip窗口元素并在合适的位置显示出来
- 在mouseleave中移除当前tooltip元素

#### 难点：tooltip窗口元素的位置计算。

### 解决办法：

1. tooltip窗口元素style.position为fixed；
2. 确保tooltip窗口内容不换行，那么窗口的高度为padding + height （height = font-size），3. 窗口宽度不设置，可自动调整并不换行；
4. 基于mouse事件对象的clientX和clientY，即光标所在位置，对tooltip窗口top和left进行调整；
5. 当空间充足，top = clientY + 14 * 2，left = clientX - 14 * (tooltip内容字符数 + 2)，tooltip窗口在光标左下边；
6. 当底边空间不足，top = clientY - 14 * 4（左上）；
7. 当左边空间不足，left = clientX（右下）；
8. 14 是font-size的值，单位是px

\* 2 是因为元素的内边距为1em（1em = 14px），我们需要让 tooltip 窗口下移2个字符高度，以确保在 Y 方向上离开光标位置。

\* (tooltip 内容字符数 + 2) 是在计算 tooltip 的宽度，一个字符近似 `1em` 宽，`+2` 是为了包含 padding 值，这样可确保 tooltip 窗口整体向左偏移一个宽度。

以上是在假设底边和左边空间充足的情况下进行的位置计算，那么当底边、左边空间不足时，需要调整，如上 5、6。

### 代码

代码很简单：

#### CSS

```css
.x-tooltip {
    display: inline-block;
    padding: .6em 1em;
    border: 1px solid #DDD;
    border-radius: 3px 4px;
    position: fixed;
    top: 0;
    left: 0;
    opacity: 0;
    transition: opacity .3s;
    background-color: rgba(0, 0, 0, .8);
    color: #FFF;
    box-shadow: 3px 4px 5px rgba(0, 0, 0, .3);
    z-index: 1;
}
```

#### HTML

```html
Hello
```

#### Js

```js
// tooltip
function createTooltipElement(text_) {
    var el = document.createElement('div')
    $(el).addClass('x-tooltip').text(text_).appendTo(document.body);
    return el;
}

jQuery.fn.tooltip = function() {
    this.each(function(i, el) {
        if (!el.title) return;
        this.tooltipCfg = { };
        this._title = this.title;
        this.title = '';
        $(this).on('mouseenter', function(e) {
            this.tooltipCfg.el = createTooltipElement(this._title);
            this.tooltipCfg.charLen = this._title.length + 2;
            var pos = {
                top: e.clientY + 14 * 2,
                left: e.clientX - 14 * this.tooltipCfg.charLen
            };
            // Why 3 ? padding-top 1em + padding-bottom 1em + char height 1em
            if (G.viewH - e.clientY < 14 * 3) {
                pos.top = e.clientY - 14 * 4;
            }
            if (e.clientX < 14 * this.tooltipCfg.charLen) {
                pos.left = e.clientX;
            }
            $(this.tooltipCfg.el).css(pos);
            $(this.tooltipCfg.el).css('opacity', 1);
        }).on('mouseleave', function() {
            if (this.tooltipCfg.el) {
                $(this.tooltipCfg.el).remove();
            }
        });
    });
}
```

G.viewW、G.viewH的计算：

```js
if (document.documentElement) {
    G.viewW = document.documentElement.clientWidth;
    G.viewH = document.documentElement.clientHeight;
} else {
    G.viewW = window.innerHeight;
    G.viewW = window.innerWidth;
}
```

#### 使用

```js
$(function() {
    $('[title]').tooltip();
});
```

#### 效果
 
{% include img.html src="http://zxh1989.oss-cn-qingdao.aliyuncs.com/20180524/135018_79382.png" title="窦唯，窦唯" %}
