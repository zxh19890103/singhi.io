---
layout: post
title: 在 Windows 机器上搭建 GIT 中心，并借 SSH 传输资源
short: 前些日子，在做一个关于植物的本地网站。网站的静态资源、图片服务和 WWW 服务都部署在一个低端的 windows 笔记本上
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
cd ~
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

user 默认使用 windows 系统本地账户，此时需要你输入相应的密码。

OK，现在我们有了 ssh 和 git，回到上边的问题：如何写 git 中心仓库的地址？

```bash
git clone ssh:user@192.168.10.243 ??? // 后边是什么呢？
```

这个“小问题”困扰了我一个下午，不管你信或不信。我尝试了各种拼写方式，搜索了 google、bing，甚至不惜动用了百度 😂。

比如：

```bash
git clone ssh:user@192.168.10.243/~/plants
```

使用了 ~，因为我在 windows 上使用的是 bash 终端。~ 表示了当前用户的 home 目录。Mac 上，这个命令返回了错误提示：

```bash
'git-upload-pack' ?????ڲ????ⲿ???Ҳ???ǿ????еĳ???
?????????ļ???
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
and the repository exists.
```

这样一段乱码对于我探寻问题的究竟，制造了莫大的困难！开始，我试图先解决这个乱码的问题，设置了终端的编码，什么 utf8、gb2312、gbk 等等，无所获；也在各大搜索引擎输入“git ssh 乱码”等关键词，均无果。

总之 clone 不成！

我回到 windows 电脑，做了另一件事。我用 bash 终端，将中心仓库 clone 到另一个目录：

```bash
git clone ~/pants plants_run
```

这是成功的，后续的 pull 或 push 都没什么问题。

我使用 `ssh user@localhost` 登录到系统，进入 ~/plants_run 目录，执行了 `git pull` 和 `git push`，也没什么问题。

索性搜索一下 git-upload-pack 和 Could not read from remote repository，得到了一些相似问题的分析，其中书声的博客所写的[Git 克隆远程仓库提示...](https://php.cn/blog/detail/18277.html)与我当前的问题十分相近，也许乱码的部分就是“未找到命令”。

按照这个思路，我猜测 git-upload-pack 是一个命令，在我们需要远程下载仓库的时候用到了它。那么，它在什么地方呢？是谁使用了它？客户端还是服务端？

还是在 bash 终端，我敲下了 where git-upload-pack 发现它是存在的：

```
C:\Program Files\Git\mingw64\bin\git-upload-pack.exe
```

如此，事实与猜测不符了 😢

无奈之下，我又逐行阅读了 cnblogs 上的一篇[文章](https://www.cnblogs.com/sparkdev/p/10166061.html)。这篇文章指导了我安装 OpenSSH Server。

当读到“*连接成功后默认的 shell 是 Windows Command shell (cmd.exe) 程序：*”的时候，我似乎有了主意。

难道，当我在 mac 上使用 `git clone ssh:...` 的时候，服务端启动了 windows 上的 cmd 来提供命令执行环境？

**的确如此！**

切换到 windows，打开 cmd，输入 `git-upload-pack`，系统果然提示“*git-upload-pack 不是内部或外部命令，也不是可运行的程序或批处理文件*”。

**设置环境变量！**

找到 git-upload-pack 所在的 bin 目录，将其路径添加到系统环境变量中。

再来在 mac 上试一下命令 `git clone ssh:user@192.168.10.243/~/plants`，以为这下没问题了，结果😭：

```bash
fatal: ''~/plants'' does not appear to be a git repository
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
and the repository exists.
```

**这下是仓库的路径写得不对！（1）**

那么，应该怎么写呢？

既然，openSSH Server 启动 cmd 作为执行环境，那么这个路径的书写应该遵循 cmd 的规则。cmd 的规则中没有 ~，写绝对路径吧？

```bash
git clone ssh://user@192.168.10.243/C://.../plants
```

**路径还是不对！（2）**再试：

```bash
git clone ssh://user@192.168.10.243/%HOME%/plants
```

**不对！（3）**参照[GIT 官方网站](https://git-scm.com/docs/git-clone#_git_urls) 再试：

```bash
git clone ssh://user@192.168.10.243/~user/plants
```

**还是不对！（4）**Google、Bing、甚至 Baidu 也都用尽了，没能探寻出答案。

远不止 4 次尝试，因为我记得自己消耗在这上的时间以小时计的。

但是这不应该是个大问题，一个路径而已，到底该怎么写？竟然找不到任何正统的说明，左一嘴右一舌头，每一个解决我的问题，真的气死人😠

**换终端！**不用这个 cmd 了，太多的毛病，早些年还很喜欢的。

要换终端，需要写注册表，注册表的路径在：

```
计算机/HKEY_LOCAL_MACHINE/SOFTWARE/OpenSSH
```

在万能搜索框输入“regedit”打开注册表编辑器，进入以上目录，添加一个项目，类型为“字符串”，键名为“DefaultShell”，值为 bash.exe 所在的路径（自己去找一下）。

**重启 SSH 服务**，即大功告成！

终于可以工作了，GIT 的中心和 WWW 目录都在 windows 上，Mac 上主要编码，每次阶段性编码完成，执行：

```bash
git add .
git commit -m "..."
git push
```

然后到 windows 上的 WWW 目录，执行：

```bash
git pull
```

看上起非常麻烦😂

还有一件事可以简化流程，就是使用 SSH 的 publicKEY 做登录验证，避免重复地输入密码。

客户端使用 `ssh-keygen` 脚手架生成私钥和公钥。将公钥复制到服务端（这里就是我的那台 windows 电脑）的 authorized_keys 文件中，换行间隔多个 key。

有人可能会问 authorized_keys 在哪啊？默认在 ~/.ssh/ 目录下，如果没有，你自己新建一个吧。

再来执行 git 操作，你会发现没啥 *GP* 效果。这是因为还有事情没做，你需要打开 /c/ProgramData/ssh/sshd_config（bash）编辑一下：

```ruby
## ...
PubkeyAuthentication yes # 这行请去掉注释
## ...
AuthorizedKeysFile .ssh/authorized_keys # 这行也去掉注释
## ...
## 以下**十分重要**，务必注释以下两行（默认是开启的），不要相信官方的说明，我已经试了 N 次，均失败
# Match Group administrators
#  AuthorizedKeysFile __PROGRAMDATA__/ssh/administrators_authorized_keys
```

谢谢关注！2020 年大吉大利！
