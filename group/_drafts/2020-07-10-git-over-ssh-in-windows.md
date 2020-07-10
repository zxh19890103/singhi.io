---
layout: post
title: 在 Windows 机器上搭建 GIT 中心，并借 SSH 传输资源
short: 是的
tags: 
  - Windows
  - GIT
  - SSH
---

前些日子，在做一个关于植物的本地网站。网站的静态资源、图片服务和 WWW 服务都部署在一个低端的 windows 笔记本上。笔记本性能非常糟糕，打开 VSCode 都比较的卡顿。因此，比较好的方式是，在 mac 上开发，然后，将代码上传到 windows 上，服务自动重启。

我想到用 GIT 的代码管理能力，以及 SSH 的传输能力，来达到我的目标。

我的设想是这样的，在 windows 上安装一个 GIT 中心仓库，它托管了全部代码和资源，然后 mac 通过 git clone 将仓库复制下来。开发阶段性完成后，git push 到 windows GIT 仓库中心。nodemon 检测到代码的更新，重启服务。

这里有一点不便，即每次都要 `git push`，但这似乎无法避免！

然而，除此之外，有一个更不妙的地方。GIT 要求中心仓库必须是 bare 的，bare 的仓库不存在工作区，只有索引区。关于 bare，可以查看这篇[文章](http://www.saintsjd.com/2011/01/what-is-a-bare-git-repository/)。因此，需要在 windows 上另外再 clone 一份代码，以其作为网站的资源目录。

```bash
mkdir ./plants
cd ./plants
git init --bare 
```

好了，现在我有了中心仓库。接下来，我需要在 mac 上 clone 它。

```bash
git clone ???
```

事情往往不如你想象的那么简单，这时问题出现了：

**git clone 的路径该怎么写呢？**

根据官方的文档 https://www.git-scm.com/docs/git-clone#_git_urls，我可以选择 ssh 协议来 clone。那么命令可能是：

```bash
git clone ssh:user@192.168.10.243??
```

需要在 windows 上安装 SSH 服务了。在 windows10 上安装 SSH 服务是比较方便的，windows10 已经预设了该功能，只需要你点点鼠标就能安装。具体的操作是：

设置 > 应用 > 应用和功能 > 可选功能 > 添加可选功能 > 点击“OpenSSH Server”

等服务安装好，在 win10 的万能搜索框中输入“services.msc”打开服务管理器。找到 OpenSSH Server，设置为自行启动。

在 mac 上测试链接：

```bash
ssh user@192.168.10.243
```

user 默认使用 windows 系统本地账户。
