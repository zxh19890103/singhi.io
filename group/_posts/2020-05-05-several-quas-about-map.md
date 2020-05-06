---
layout: post
title: 关于地图方面的几个小问题
short: 最近做小程序，用到组件库里 map，遇到了 2 个小问题，拿出来和大家分享一下
tags: 
  - PPI
  - Map
  - Zoom
---

### 我最近在做什么

我在自己鼓捣一个跟“植物”有关的 web 项目。目前已经实现了 H5 端。使用这个 web 应用，你可以随时随地对一株植物进行各角度拍照，并写上与之相关的描述，应用会采集拍照的时间与精确位置。展示上，我计入了“脚步”、“日期”、“知识”、“照片” 4 大内容块。其中，“脚步”以地图的方式显示了你拍照的位置点。下图是一个例子：

{% include img.html src="https://zxh1989.oss-cn-qingdao.aliyuncs.com/posts/several-quas-about-map/Screen%20Shot%202020-05-05%20at%209.07.40%20PM.jpg" title="上半部分" %}

{% include img.html src="https://zxh1989.oss-cn-qingdao.aliyuncs.com/posts/several-quas-about-map/Screen%20Shot%202020-05-05%20at%209.08.16%20PM.jpg" title="下半部分" %}

整个应用基于 [React 16.8](https://reactjs.org/)，自己实现的动态路由系统。

本文要谈的问题主要出自其中的“地图”，正在并行开发的“微信小程序”项目中也包含了“地图”，遇到了几个同样的问题。

### 在有限的范围内容纳全部的坐标点

这是我要做的一件很重要的事情，腾讯地图或者高德地图给了我功能强大的接口，但是需要我来提供合适的条件。这些条件是什么呢？

- 缩放级别，腾讯谓之 scale，高德称以 zoom
- 四个坐标点，其依次连接而形成的梯形（想一想，为什么是梯形？）恰如其分地将全部的坐标点融入梯形当中
- 实际的横纵距离
- “地理/地图”分辨率

四个坐标点的选取全仗我们的坐标点集合，我将坐标点集合定义为以下结构：

```typescript
interface Point {
  longitude: number
  latitude: number
}

type PointSet = Point[]
```

定义经纬线的结构：

```typescript
interface Edge<X extends number, Y extends number> {
  longitude: X
  latitude: Y
}
```

这样 `Edge<0, number>` 表示了本初子午线（经线），而 `Edge<number, 0>` 表示了赤道。

我们只要设想四条线（两纵两横），这四条线围起来的范围容纳了我们的坐标点集合。

设这四条线分别是`Edge<L, number>`、`Edge<R, number>`、`Edge<number, T>`、`Edge<number, B>`

其中 L（left）、R（right）、T（top）、B（bottom） 就是我们要求得的值。

```js
function getTRBL(points) {
  let L = 135.083333 // maximum left
  let R = 73.55 // minimal right
  let B = 53.55 // maximum bottom
  let T = 3.85 // minimal top
  for (const p of points) {
    const { longitude, latitude } = p
    if (longitude < L) L = longitude
    if (longitude > R) R = longitude
    if (latitude < B) B = latitude
    if (latitude > T) T = latitude
  }
  return [T, R, B, L]
}
```

让我们用 T、R、B、L 来定义一个梯形吧：

```typescript
interface Trapezium {
  T: number
  R: number
  B: number
  L: number
}
```

注意到我为 T、R、B、L 赋予了初始值，`[53.55, 135.083333, 3.85, 73.55]` 刚好把中国围了起来。我们这里只考虑国内的情况。

我们有了 4 条线，现在要计算 `Distance(L, R)` 和 `Distance(T, B)`。我在网上查阅了资料，发现：

- 在纵线上，也就是经线（Longitude Line），一个纬度的变化会引起 `111` km 的地表位移
- 在横线上，也就是纬线（Latitude Line），一个经度的变化所能引起的地表位移是“纬度”的函，它是 `111 * cos(la) ` km。

```js
function disance(l, r, t, b) {
  return [
    (r - l) * 111 * Math.cos(b * Math.PI / 180 ),
    (t - b) * 111
  ]
}
```

按道理，这里涉及到了积分学，但是考虑到实际情况，姑且取“下纬线”对应的度数（需要转换为基于 PI 的弧度制）来计算横向间距。

我们得到了一个矩形！

我们将全部的坐标点放到了这个矩形中。现在我们来看看，地图上，我们如何处理这个矩形。

有一个地图分辨率的概念：

```js
// 单位是 cm / px
const resolution = [实际距离（厘米）] / [像素数量]
```

假设我要在 `414px * 360px` 的平面展示我们上面计算出的那个矩形。那么，横向上的分辨率为：

```js
const dX = (R - L) * 111 * Math.cos(B * Math.PI / 180)
const resoX = dX * 100000 / 414
```

而，纵向上的分辨率为：

```js
const dY = (T - B) * 111
const resoY = dY * 100000 / 360
```

为了将全部的坐标点显示在 414px * 360px 的地图上，我们还用到了 zoom 的概念。

我借助高德地图，分析出了级别（zoom）与分辨率之间的关联：

```json
[
  { "zoom": 3, "reso": 1747785 },
  { "zoom": 4, "reso": 859400 },
  { "zoom": 5, "reso": 423048 },
  { "zoom": 6, "reso": 212032 },
  { "zoom": 7, "reso": 105777 },
  { "zoom": 8, "reso": 52829 },
  { "zoom": 9, "reso": 26399 },
  { "zoom": 10, "reso": 13196 },
  { "zoom": 11, "reso": 6597 },
  { "zoom": 12, "reso": 3267 },
  { "zoom": 13, "reso": 1634 },
  { "zoom": 14, "reso": 817 },
  { "zoom": 15, "reso": 408 },
  { "zoom": 16, "reso": 204 },
  { "zoom": 17, "reso": 102 },
  { "zoom": 18, "reso": 51 },
  { "zoom": 19, "reso": 26 },
  { "zoom": 20, "reso": 0 }
]
```

由此，我可以根据分辨率反推 zoom 的值：

```js
function getZoom(cmPerPx) {
  for (let i = 0, l = relationOfZoomAndReso.length; i < l; i++) {
    const { zoom, reso } = relationOfZoomAndReso[i]
    if (reso < cmPerPx) {
      return zoom - 1
    }
  }
  return 11
}
```

测试了，效果还不错。

### 计算中心点

这个问题比较简单了，取上面我们所得到矩形的中心。

```js
const center = { longitude: (T + B) / 2, latitude: (R + L) / 2 }
```

### 调用地图接口及效果

对于高德静态地图：

```
https://restapi.amap.com/v3/staticmap?key=[your key]&size=414*256&zoom=14&scale=2&traffic=1&markers=large%2C%2CF%3A113.807343%2C22.683340%7Clarge%2C%2C1%3A113.822260%2C22.688535%7Clarge%2C%2C1%3A113.822307%2C22.691457%7Clarge%2C%2C1%3A113.813363%2C22.688976
```

对于微信小程序：
{% raw %}
```html
<map setting="{{mapSettings}}" markers="{{markers}}" />
```
```js
Page({
  // ...
  data: {
    mapSettings: {
      scale: 14
    },
    markers: [...]
  }
  // ...
})
```
{% endraw %}

看一下效果：

{% include img.html src="https://zxh1989.oss-cn-qingdao.aliyuncs.com/posts/several-quas-about-map/staticmap.jpg" title="高德静态地图" %}

{% include img.html src="https://zxh1989.oss-cn-qingdao.aliyuncs.com/posts/several-quas-about-map/WechatIMG12.jpeg" title="微信小程序界面" %}

### 如何将多个近邻的坐标点融合为一个

这是第二个问题，比较复杂。问题是由于高德静态地图的 marker 数量限制。下一篇我将详细地分析这个问题。
