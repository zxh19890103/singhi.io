---
layout: post
title: CentOS7 设置 hostname
short: 局域网中一台CentOS机器，为了通过ssh客户端对其访问，但机器局域网IP不固定，可以设置HostName，用HostName来访问之
---


### 问题

今天在新电脑上通过 `virtualbox` 在一个 Linux 机器上安装了 CentOS7 系统，网络采用桥接网卡模式。欲在Mac机器上通过 `ssh` 客户端访问它，用分配的局域网 IP 当然不存在问题，只是考虑下次重启电脑之后，IP 会发生变更，于是想到用 HostName 替代 IP 访问。

这样，我就不用去查看虚拟机 IP 了。

### 第一步，修改 `/etc/sysconfig/network`

```sh
NETWORKING = yes
HOSTNAME = ronnie.dev
```

### 第二步，修改 `/etc/hosts`

```sh
127.0.0.1 ... ronnie.dev ...
::1 ... ronnie.dev ...
```

将默认为 localhost.localdomain 的部分替换为 ronnie.dev

### 第三步，修改 `/etc/hostname`

将原文本修改为 ronnie.dev，默认为 localhost.localdomain，据说这一步是必须的，参考这个博客。

### 说明

博主并不了解其中原由，只是参考他人博客，照葫芦画瓢，记录下来慢慢研究。
