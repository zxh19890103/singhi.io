---
layout: post
title: XMLHttpRequest 的 withCredentials 属性
short: 项目开发中经常遇到文中提及的错误，只有深刻理解了withCredentials属性的含义，才能更好的使用
tags:
  - XHR
  - withCredentials
---

### 问题

开发公司的一个项目，上传文件的时候，遇到以下错误：

{% include img.html src="http://zxh1989.oss-cn-qingdao.aliyuncs.com/20180508/181448_71873.jpg" title="跨域请求" %}

翻译过来就是：

[CORS预检请求](https://developer.mozilla.org/zh-CN/docs/Glossary/Preflight_request)（OPTIOINS请求）的响应没有通过访问控制检查，在请求的 `credentials mode` `是include` 的情况下，Response 头字段 `Access-Control-Allow-Origin` 的值不允许为 `*`。Origin `http://...` 因此不允许访问服务器。请求的 `credentials mode` 的设定由 `XMLHttpRequest` 的 `withCredentials` 属性决定。

 
### withCredentials的作用

可以参考[文档](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials) 

https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials

### 解决

按照文档的指示，有两个解决办法：

1. 设置 `withCredentials` 为 `false`
2. 服务端设置 `Access-Control-Allow-Origin` 包含请求源域名（如 http://zhangxinghai.cn）
