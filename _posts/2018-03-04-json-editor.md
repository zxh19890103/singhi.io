---
layout: post
title: Json Editor - 可视化编辑JS对象
short: 一款用于在线可视化编辑JS对象的工具库，增删改均具备。你可以扩展为在线编辑json文件等
tags:
  - Json
  - Editor
---


### 概述

一款用于在线可视化编辑JS对象的工具库，增删改均具备。你可以扩展为在线编辑json文件等。

源码及使用说明：[https://github.com/zxh19890103/jsoneditor](https://github.com/zxh19890103/jsoneditor)

### 使用

需要放入一下HTML内容：

```html
<!-- Required!!! Area for displaying json -->
<div id="jsonViewWrap" class="json-view-wrap">
    <div id="jsonView" class="json-view"></div>
</div>
<!-- Required!!! Edit Input: for adding node or editing node. -->
<div id="jsonViewInput" class="json-view-mask json-view-input">
    <form>
        <input type="text" name="dataKey" placeholder="Enter Key" style="width: 61.8%;">
        <br>
        <input type="text" name="dataValue" placeholder="Enter Value">
        <br>
        <div>
            <input type="radio" name="dataType" id="dataType_0" value="string"><label for="dataType_0">string</label>
            <input type="radio" name="dataType" id="dataType_1" value="boolean"><label for="dataType_1">boolean</label>
            <input type="radio" name="dataType" id="dataType_2" value="number"><label for="dataType_2">number</label>
            <input type="radio" name="dataType" id="dataType_3" value="array"><label for="dataType_3">array</label>
        </div>
        <br>
        <button type="submit" class="btn green">OK</button>
    </form>
</div>
```

接口很简单：

```js
var data = { 
    name: "Singhi John",
    age: 29,
    male: true,
    skills: ["Angular", "Vue", ".NET", "PHP"],
    address: {
        country: "China",
        state: "LiaoNing"
    }
};
var jv = new JsonViewer('jsonViewWrap', 'jsonViewInput', data);
```

JsonViewer 接收 `3` 个参数，第一个是显示 JSON 内容的元素 ID，第二个是对JSON进行编辑时的表单元素的 ID，最后是一个 object。

## 效果

{% include img.html src="https://zxh1989.oss-cn-qingdao.aliyuncs.com/posts/json-editor/demo.gif" title="json editor" %}
