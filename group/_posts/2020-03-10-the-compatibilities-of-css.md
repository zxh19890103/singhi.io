---
layout: post
title: 常见浏览器兼容性问题与解决方案
short: 列举常见 CSS 兼容性问题，面试老是问这种无趣的问题
src: https://www.cnblogs.com/iceflorence/p/6646344.html
tags:
  - CSS
  - 兼容性
---

### 浏览器兼容问题

#### 不同浏览器的标签默认的 margin 和 padding 不同

**问题症状**：随便写几个标签，不加样式控制的情况下，各自的`margin`和`padding`差异较大。

**碰到频率**: 100%

**解决方案**：可以使用Normalize来清除默认样式，具体可参考文章：[来，让我们谈一谈 Normalize.css](https://jerryzou.com/posts/aboutNormalizeCss/)

#### 块属性标签 float 后，又有横行的 margin 情况下，在 IE6 显示 margin 比设置的大

**问题症状**：常见症状是 IE6 中后面的一块被顶到下一行

**碰到频率**：90%（稍微复杂点的页面都会碰到，`float`布局最常见的浏览器兼容问题）

**解决方案**：在`float`的标签样式控制中加入`display:inline;`将其转化为行内属性 

**备注**：我们最常用的就是`div+CSS`布局了，而 `div` 就是一个典型的块属性标签，横向布局的时候我们通常都是用 `div float` 实现的，横向的间距设置如果用`margin`实现，这就是一个必然会碰到的兼容性问题。

#### 设置较小高度标签（一般小于 10px），在  IE6、IE7，遨游中高度超出自己设置高度

**问题症状**：IE6、7 和遨游里这个标签的高度不受控制，超出自己设置的高度

**碰到频率**：60%

**解决方案**：给超出高度的标签设置`overflow:hidden;`或者设置行高`line-height`小于你设置的高度。

**备注**：这种情况一般出现在我们设置小圆角背景的标签里。出现这个问题的原因是 IE8 之前的浏览器都会给标签一个最小默认的行高的高度。即使你的标签是空的，这个标签的高度还是会达到默认的行高。

#### 行内属性标签，设置 display:block 后采用 float 布局，又有横行的 margin 的情况，IE6 间距 bug

**问题症状**：IE6里的间距比超过设置的间距 

**碰到几率**：20%

**解决方案**：在`display:block;`后面加入`display:inline;display:table;` 

**备注**：行内属性标签，为了设置宽高，我们需要设置`display:block;`(除了`input/img`标签比较特殊)。在用`float`布局并有横向的`margin`后，在 IE6 下，他就具有了块属性`float`后的横向`margin`的 bug。不过因为它本身就是行内属性标签，所以我们再加上`display:inline`的话，它的高宽就不可设了。这时候我们还需要在`display:inline`后面加入`display:talbe`。

#### 图片默认有间距

**问题症状**：几个`img`标签放在一起的时候，有些浏览器会有默认的间距，通配符清除间距也不起作用。

**碰到几率**：20% 

**解决方案**：使用 `float` 属性为 `img` 布局

**备注**：因为 `img` 标签是行内属性标签，所以只要不超出容器宽度，`img` 标签都会排在一行里，但是部分浏览器的 `img` 标签之间会有个间距。去掉这个间距使用 `float` 是正道。（也可使用负 `margin`，虽然能解决，但负`margin`本身就是容易引起浏览器兼容问题的用法，所以尽量不要使用）

#### 标签最低高度设置 min-height 不兼容

**问题症状**：因为 `min-height` 本身就是一个不兼容的 CSS 属性，所以设置`min-height` 时不能很好的被各个浏览器兼容

**碰到几率**：5%

**解决方案**：如果我们要设置一个标签的最小高度 `200px`，需要进行的设置为：`{ min-height:200px; height:auto !important; height:200px;overflow:visible; }`

**备注**：在 B/S 系统前端开发时，有很多情况下我们有这种需求。当内容小于一个值（如`300px`）时。容器的高度为`300px`；当内容高度大于这个值时，容器高度被撑高，而不是出现滚动条。这时候我们就会面临这个兼容性问题。

#### 各种特殊样式的兼容，比如透明度、圆角、阴影等。特殊样式每个浏览器的代码区别很大，所以，只能现查资料通过给不同浏览器写不同的代码来解决。

### 清除浮动

```css
  .clearfix::after {
      content: "";
      display: table;
      clear: both;
  }

  .clearfix {
      *zoom: 1;
  }
```

### 盒模型

```css
  Element {
      box-sizing: border-box;
      /*box-sizing: content-box;*/
  }
```

### CSS hack 

我很少使用 hacker 的，可能是个人习惯吧，我不喜欢写的代码IE不兼容，然后用hack 来解决。不过 hacker 还是非常好用的。使用 hacker 我可以把浏览器分为3类：IE6、IE7、遨游、其他（IE8 chrome ff safari opera等）

IE6 认识的 hacker 是下划线`_`和星号`*`

IE7 遨游认识的 hacker 是星号`*`

比如这样一个 CSS 设置：

```css
  div { height: 300px; *height: 200px; _height:100px; }
```

IE6 浏览器在读到`height:300px`的时候会认为高时`300px`；继续往下读，他也认识`*heihgt`， 所以当IE6读到 `*height:200px`的时候会覆盖掉前一条的相冲突设置，认为高度是`200px`。继续往下读，IE6 还认识`_height`，所以他又会覆盖掉`200px`高的设置，把高度设置为`100px`；

IE7 和遨游也是一样的从高度`300px`的设置往下读。当它们读到`*height200px`的时候就停下了，因为它们不认识`_height`。所以它们会把高度解析为`200px`，剩下的浏览器只认识第一个`height:300px;`所以他们会把高度解析为`300px`。因为优先级相同且想冲突的属性设置后一个会覆盖掉前一个，所以书写的次序是很重要的。 

做兼容页面的方法是：每写一小段代码（布局中的一行或者一块）我们都要在不同的浏览器中看是否兼容，当然熟练到一定的程度就没这么麻烦了。建议经常会碰到兼容性问题的新手使用。很多兼容性问题都是因为浏览器对标签的默认属性解析不同造成的，只要我们稍加设置都能轻松地解决这些兼容问题。如果我们熟悉标签的默认属性的话，就能很好的理解为什么会出现兼容问题以及怎么去解决这些兼容问题。

实战是解决问题的最佳途径，也是遇到问题的唯一途径，大家多多亲自制作才能更快更好的成长，另外多去借鉴别人的经验也是进步的捷径。