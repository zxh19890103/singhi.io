---
layout: post
title: TinyMCE自定义插件编写
short: 最近要使用 TinyMCE，为了在内容里插入代码块，我研究给它加一个代码编辑的功能。因为之前没仔细看内置插件列表，没发现其实 TinyMCE已经有了这个功能，我花了几乎一日的时间搞这个代码编辑插件。后来发现这个情况后，会心一笑，只当学习了吧
tags:
  - TinyMCE
  - 自定义插件
category: tech
---

### 概述

最近要使用 TinyMCE，为了在内容里插入代码块，我研究给它加一个代码编辑的功能。因为之前没仔细看内置插件列表，没发现其实 TinyMCE已经有了这个功能，我花了几乎一日的时间搞这个代码编辑插件。后来发现这个情况后，会心一笑，只当学习了吧。

这篇文章仅仅记录一下Plugin怎么写，TinyMCE 相关的内容这里不谈。

### 目录、文件

在 plugins 目录下创建一个子目录叫 `codeeditor`，在 `codeeditor` 里新建两个文件：editor.html、plugin.min.js。

### JS脚本

为 TinyMCE 创建一个插件需要使用 `tinymce.PluginManager` 的 `add` 方法：

```js
tinymce.PluginManager.add('codeeditor', function(editor, url) {
  // todo:
});
```

回调函数接收的第一个参数 editor 是相应的 `tinymce.Editor` 实例，回调函数中我们要做的是给编辑器的 Menu 加一个 Item，需要使用接口 `tinymce.Editor.addMenuItem`：

```js
editor.addMenuItem('codeeditor', {
    text: 'Code editor',
    context: 'tools',
    onclick: function() {
        // todo:
    }
});
```

配置中第3项 onclick 定义的是 MenuItem 点击后的响应函数，在函数里，我们需要打开一个窗口，需要使用 `tinymce.WindowManager.open` 接口，我们将整个打开新窗口的操作封装为一个函数：

```js
function openCodeEditor() {
    editor.focus();
    editor.selection.collapse(true);

    var config = {
        title: 'Code editor',
        url: url + '/editor.html',
        width: '650px',
        height: '450px',
        resizable : true,
        maximizable : true,
        buttons: [
            { text: 'Ok', subtype: 'primary', onclick: function(){
                var ifr = document.querySelectorAll('.mce-container-body>iframe')[0];
                ifr.contentWindow.submit();
                win.close();
            }},
            { text: 'Cancel', onclick: 'close' }
        ]
    };

    var win = editor.windowManager.open(config);
}
```

### HTML标签

`editor.html` 是新窗口内容，和普通编写一个 HTML 页面没什么差别，这个页面将会以 iframe 的方式请求并渲染，你可以在页面的 script 脚本块中访问到 `tinymce.Editor` 实例:

```js
tinymce = parent.tinymce;
editor = tinymce.activeEditor;
```

`tinymce.Editor` 提供了大量的 dom 操作接口，其中`tinymce.Editor`集成的`jquery`库几乎可以满足任何需要，访问方式是：

```js
tinymce.Editor.$('#elid')...
```

### 使用

```js
tinymce.init(
  {
    // ...
    plugins: '... codeeditor ...'
    // ...
  }
)
```
