---
layout: post
title: Js查询字符串解析函数
short: Js查询字符串解析函数，选自《JavaScript高级程序设计——第三版》的BOM-location章节
---

这个函数是从著名的《JavaScript高级程序设计》一书摘取。

因为平时开发当中，偶尔也会有需要用到这个功能，而每次我都是到stack上查找，结果很多，难以选定。

所以，就以名著为标准了，具体内容如下。
```js
function getQueryStringArgs(){ 
    //取得查询字符串并去掉开头的问号
    var qs = (location.search.length > 0 ? location.search.substring(1) : ""),
        args = {},  //保存数据的对象
        items = qs.length ? qs.split("&") : [],  //取得每一项
        item = null,
        name = null
        value = null, //在 for 循环中使用
        i = 0,
        len = items.length; //逐个将每一项添加到 args 对象中
    for (i=0; i < len; i++){
        item = items[i].split("=");
        name = decodeURIComponent(item[0]);
        value = decodeURIComponent(item[1]);
        if (name.length) {
            args[name] = value;
        }
    }
    return args;
}
```
