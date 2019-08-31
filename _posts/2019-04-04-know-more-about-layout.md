---
layout: post
title: 知道一下前端常见布局
short: 自以为很了解所谓“布局”，比如用百分比、相对文档元素的rem单位、浮动、flex等，但还是很肤浅，也未得要领，布局大概会分为“固定布局”、“流式布局”、“响应布局”、“弹性布局”，本文将给出其三者的定义，演示常见的布局手段
tags:
  - CSS
  - Layout
---

自以为很了解所谓“布局”，比如用百分比、相对文档元素的rem单位、浮动、flex等，但还是很肤浅，也未得要领，布局大概会分为“固定布局”、“流式布局”、“响应布局”、“弹性布局”，本文将给出其三者的定义，演示常见的布局手段。

### 固定布局（Static Layout）

固定布局，也有叫做静态布局。具体做法就是所有的布局元素都用 px 单位。

无论[视觉视窗](https://www.quirksmode.org/mobile/viewports2.html)（ Visual Viewport）的尺寸是多少，我们的页面宽度始终是一个固定值，比如 1080px。而如果视觉视窗的宽度小于 1080px，窗口将出现滚动条。

多数企业官网都采用固定布局，比如下面这个网站（http://dljianfa.com）就是：

{% include img.html src="http://zxh1989.oss-cn-qingdao.aliyuncs.com/20190424/192631_48887.jpg" title="大连建发官网 - 固定布局案例" %}

### 流式布局（Liquid Layout）
流式布局，对于布局元素的宽采取百分比来设置，一般结合 min-* 和 max-* 属性限制在一个可伸缩的范围内。流式布局在横向上，几乎可以适应各种不同视窗尺寸的设备，但只是调整布局元素的宽度，页面结构不会发生变化。

### 响应式布局（Responsive Layout）
响应式布局，主要借助 CSS3 的 媒体查询 技术，通过设置 视窗尺寸断点 来动态调整页面结构，以使页面不管在何种尺寸的屏幕上均有一个合理的排布。所以此种布局方式可以用作 PC / Pad / Mobile 适配，当然，你也可以结合其它布局。

### 弹性布局（Elastic Layout）
弹性布局，即使用 rem 作为单位设置布局元素的尺寸。rem 是相对 html 元素字体大小的尺寸单位，因此，对于不一样的字体大小设置，我们的布局元素的宽高也会随之变化。

浏览器默认的字号为 16px，多数时候，我们会设置 html 元素的 font-size 为 62.5%，这是因为 16px * 62.5% = 10px，这样方便计算。那为什么不直接设置为 10px 呢？因为有些浏览器默认字号不是 16px，或者用户修改了默认字号，如果我们直接设置为 10px，岂不是不尊重用户了吗？

### 一些常见的布局技巧

水平居中 - 用 display: inline-block 和 text-align: center，行内块级元素配合 text-align:center

{% include img.html src="http://zxh1989.oss-cn-qingdao.aliyuncs.com/20190424/194729_45489.jpg" %}

水平居中 - 用 margin: 0 auto，外边距自动调节

{% include img.html src="http://zxh1989.oss-cn-qingdao.aliyuncs.com/20190424/194913_41208.jpg" %}

水平居中 - 用 display: table，利用 table 设置水平居中，设置表现为“表格”，可以不用设置宽度

{% include img.html src="http://zxh1989.oss-cn-qingdao.aliyuncs.com/20190424/195045_76343.jpg" %}

水平居中 - 用绝对定位 position: absolute 和 transform，用绝对定位，然后用 CSS3 的 transform 做一个偏移

{% include img.html src="http://zxh1989.oss-cn-qingdao.aliyuncs.com/20190424/195318_22043.jpg" %}

水平居中 - 用 flex

{% include img.html src="http://zxh1989.oss-cn-qingdao.aliyuncs.com/20190424/195502_57492.png" %}

垂直居中 - 用 display: table-cell

{% include img.html src="http://zxh1989.oss-cn-qingdao.aliyuncs.com/20190424/195634_71013.jpg" %}

垂直居中 - 用 inline-block，通过设置 line-height = height 来居中

{% include img.html src="http://zxh1989.oss-cn-qingdao.aliyuncs.com/20190424/195755_22600.jpg" %}

垂直居中 - 用绝对定位 + transform 偏移实现垂直居中（同水平居中）
{% include img.html src="http://zxh1989.oss-cn-qingdao.aliyuncs.com/20190424/195959_70572.png" %}

垂直居中 - 用 flex

{% include img.html src="http://zxh1989.oss-cn-qingdao.aliyuncs.com/20190424/200105_65752.jpg" %}

九宫格  - HTML 部分

```html
<div class="grid-9x9">
  <div class="row">
    <div class="item"></div>
    <div class="item"></div>
    <div class="item"></div>
  </div>
  <div class="row">
    <div class="item"></div>
    <div class="item"></div>
    <div class="item"></div>
  </div>
  <div class="row">
    <div class="item"></div>
    <div class="item"></div>
    <div class="item"></div>
  </div>  
</div>
```

九宫格 - CSS 部分 (by Sass)

```css
.grid-9x9 {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: 300px;
  height: 300px;
  .row {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-around;
  }
  .item {
    // flex-grow: 1;
    width: 90px;
    height: 90px;
    border: 1px solid #980;
    background: #a9b8c7;
  }
}
```

九宫格 - 效果

{% include img.html src="http://zxh1989.oss-cn-qingdao.aliyuncs.com/20190424/200822_51421.png" %}

一个全屏布局的例子

{% include img.html src="http://zxh1989.oss-cn-qingdao.aliyuncs.com/20190424/200642_93289.jpg" %}
