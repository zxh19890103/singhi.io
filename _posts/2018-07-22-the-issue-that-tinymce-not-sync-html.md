---
layout: post
title: 关于TinyMCE不同步HTML内容的问题
short: EM...，两个地方采用同样的方式提交表单，结果一个同步了，另一个不同步
tags:
  - TinyMCE
category: tech
---

我在自己的博客系统中使用了这个TinyMCE富文本编辑器，很久之前，我便遇到了TinyMCE并不自动同步HTML内容到textarea控件的问题。曾经有所解决，并且成功了，再没管这事。现在我又遇到了这个问题，查了几个文档，都建议表单submit之前，执行一下tinymce.triggerSave()，这个没问题，解决了我的问题！但是令我疑惑的是另一个地方能够自动同步。

我现在把问题描述一下。

我对TinyMCE的配置如下：

```js
var PLUGINS = [
    "image", "code", "emoticons", "pagebreak", "table",
    "advlist", "autolink", "lists", "link", "imagetools", "textcolor",
    "help", "codeeditor", "codesample", "wordcount", "fullscreen",
    "quote"
];
var TOOLBARS = [
    "image", "code", "emoticons", "pagebreak", "forecolor",
    "backcolor", "numlist", "bullist", "fullscreen"
];
var STYLE = [
    'pre.code { border: 1px solid #eee; border-left-width: 3px; padding: 5px;}',
    'blockquote { background: #F3F5F9; padding: 15px 25px; border-left: none; margin: 0; }',
    'body { color: #666; }',
    'h3, h4 { border-bottom: 1px dashed #ddd; color: initial; }',
    'h3:before { content: \'#\'; color: #888; font-size: .86em; }',
    'h4:before { content: \'##\'; color: #888; font-size: .86em; }'
];
tinymce.init({
    selector: '#richTextInput',
    plugins: PLUGINS.join(' '),
    toolbar: TOOLBARS.join(' '),
    width: '100%',
    height : 450,
    entity_encoding : "raw",
    images_upload_url: '/xxx/postAcceptor.php',
    images_upload_base_path: '',
    images_upload_credentials: true,
    content_style: STYLE.join(' ')
});
```

这个配置我应用于两个地方，一个是文档内容编辑、另一个是单页面内容编辑。

首先看一下文档内容编辑的HTML代码：

```html
<form id="postForm" method="POST">
 <div style="width: 86.7%; margin: 0 auto;">
  <h5>为XXX编写内容</h5>
  <textarea id="richTextInput" name="content">{{HTML}}</textarea>
  <div style="margin: 1.9em 0;">
   <button class="waves-effect waves-light btn" type="submit">保存</button>
   <button class="waves-effect waves-light btn grey" type="button">取消</button>
  </div>
 </div>
</form>
```

对此表单的提交用到 `jQuery.fn.serialize`、`jQuery.ajax` 两个方法。

再来看看单页面内容编辑的 HTML 代码：

```html
<form id="Form" method="POST">
 <!--上面还有其它字段-->
 <fieldset><legend>内容</legend>
  <div class="row">
   <div class="input-field col s12">
    <textarea id="richTextInput" name="content">{{HTML}}</textarea>
   </div>
  </div>
 </fieldset>
 <!--下面还有其它字段、保存按钮等-->
</form>
```

看看，也就是表单结构和字段数量稍有不同而已，结果是上边的情况可以在提交前自动同步HTML，而后者不能。

这个里面应该还有些道道，我现在不清楚。

目前的解决办法就是用 `triggerSave` 手动同步一下。
