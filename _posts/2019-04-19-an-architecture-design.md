---
layout: post
title: 从设计到上线：基于微信侧的“洗衣服务”项目客户端
short: 一八年初，我尚在大连，供职于一家名为 Lanwatcher 的外企，职位为“软件开发工程师”
tags:
  - Architecture
  - Re-design
  - Web
---

### 背景

一八年初，我尚在大连，供职于一家名为 Lanwatcher 的外企，职位为“软件开发工程师”。

年前，我们开发部门接到来自其它业务部门的产品需求，一个基于菜鸟驿站的洗衣服务平台，其中涉及四个端：

- 平台
- 门店
- 工厂
- 会员

业务流程大概是这样：

 {% include img.html src="//zxh1989.oss-cn-qingdao.aliyuncs.com/20190419/184758_15199.png" title="菜鸟驿站洗衣服务平台业务流程图" %}

我们在厘清需求之后，得出了技术方案：

首先，采取前后端分离开发模式，后端接口提供遵循 REST 规范，前端基于 MVVM 框架。

技术栈上，后端框架为 [Feathers](https://feathersjs.com/)，因为它适合小团队快速生成大量实体读写接口（兼具 HTTP、WebSocket 两种协议类型的接口输出）；另外，Feathers 在之前的项目中有使用过，相对熟练；数据库用 [Postgres](https://www.postgresql.org/) ；ORM 使用 Github 星级较高的 [sequelize](https://sequelize.org/) 。

前端有三个，分别为平台端、会员端、门店端。

其中平台端由我负责，因为项目只分配一个月的工期，因此我选择了工程化程度更高、工具链更强大的前端框架 Angular v5；由于这一端提供给我们内部使用，对于界面要求不高，所以我直接搭配组件超级丰富的 UI 库 [PrimeNg](https://www.primefaces.org/primeng/#/) ；以此来确保开发的进度。

会员端、门店端 分别由另几位同事负责。

年前，我们完成了项目的初次迭代。年后，业务部因对会员端的界面设计不满意，找到我们，希望重新替换下页面，同时有几处业务上的改动。而此时，负责会员端的同事 D 已经高飞，因此，领导将这个任务交给我。

怎么处理呢？基于之前的成果替换下模板可行吗？

### 问题分析

是基于之前的成果开发还是重新选择一个技术栈重写，这个问题在我脑海纠缠了很久。上级给的工期为两周，因此我必须迅速得出结论。

如果是基于之前的成果来开发，那我要看看之前做出来的东西（主要从以下四点来分析）：

- 维护性如何
- 业务复杂度多高
- 是否存在难以解决技术问题
- 技术栈是否选择恰当

首先，来看看会员端这个项目的大致现状：

- 基于 Angular v5 开发的单页面应用，项目架构用其 CLI 生成（庞大）
- 引用了 weui 界面库、jQuery、fontawesome 图标库 以及 jwexin （用于调用微信底层接口的官方库）
- 五个 Module ：
  1. `start/` 相当于欢迎页；
  2. `shared/` 定义数据模型（Models）、Guards （Ng 的路由守卫）、公共组件（footer、header）、Resolvers（Ng 路由数据预解析）、若干公共服务；
  3. `main/` 开放页面（无需登录平台，只需要微信授权即可浏览）；
  4. `personal/` 个人中心（需要登入平台，有平台颁发的 token 才能浏览）；
  5. `account/` 登录、注册、关注页面

并且微信官方就公众号 SPA 使用 JS-SDK 有过一个提醒：

> 所有需要使用`JS-SDK`的页面必须先注入配置信息，否则将无法调用（同一个url仅需调用一次，对于变化url的 SPA 的 web app 可在每次url变化时进行调用,目前Android微信客户端不支持`pushState`的H5新特性，所以使用 `pushState` 来实现 web app 的页面会导致签名失败，此问题会在 Android6.2 中修复。

其次，在进行 oauth2 鉴权的时候不支持 hash 信息传递：

> 例如：https://open.weixin.qq.com/connect/oauth2/authorize?appid=xxx& redirect_uri=view/guide/home.php#share/service/detail/ 
只能得到: view/guide/home.php

其中第二个限制被我的同事 D 反馈出来，纠缠了很久，他得到的解决思路是使用 localStorage 来保存需要跳转的前端 *url*，鉴权完成后，取出这个 *url*，做一下跳转。

{% include img.html src="//zxh1989.oss-cn-qingdao.aliyuncs.com/20190419/221135_37817.jpg" title="解决微信进行 oauth2 鉴权的时候不支持 hash 信息的问题" %}

然后，我整理出了需要做的页面数量：

- 个人中心 / 首页（+底部导航）
- 个人中心 / 充值（SDK）
- 个人中心 / 我的账户
- 个人中心 / 优惠卷
- 个人中心 / 订单查询
- 个人中心 / 订单详情
- 个人中心 / 支付记录
- <del>预约（个人中心，删除）</del>
- 个人中心 / 我的基本信息
- 店铺详情
- 洗衣价格
- 洗衣流程
- 首页3，引导页
- 首页4 + 底部导航
- 文化 + 底部导航
- 服务 + 底部导航
- 登录

一共 **16** 个页面，从设计稿来看，页面多数为展示类，涉及交互的页面大概才几个。因此，我认为这个项目业务上并不算复杂。我大概读了一遍之前的工作成果，并把复杂的地方记录下来：

- 微信授权
- 扫一扫支付
- 手机验证登录（纯粹为了收集用户手机号码）

就这三个！

那为什么之前要用 Angular， 还引进了 weui 和 jQuery 以及 FA 图标库？查了一下，发现 jQuery 是 weui 组件库的依赖包，而图标确实在页面中有少许使用！然而，这是及其不划算的。其实，光“采用 Angular 开发” 这条就很是不划算！整个项目打包下来 JS 与 CSS 资源都好几兆了。而会员端又是面向C端用户的，体验这点十分要紧。

由此，我决定重写整个项目。

### 设计

那么，是换个框架继续 SPA 吗？或者，SSR？考虑到整个应用展示类页面居多，根本构不成应用的级别，因此这个完全没有必要选择 SPA。这两年，前端开发者被框架冲昏了头脑，什么项目都是 SPA + CLI + RESTful。我的观点是，够不上应用的项目就不要用这么高级的框架了。

好了，决定以 SSR 方式开发之后，就需要结合目前的系统架构，来设计这个项目的整体结构。我的系统架构如下：

{% include img.html src="//zxh1989.oss-cn-qingdao.aliyuncs.com/20190419/233746_20502.jpg" title="菜鸟洗衣平台系统架构图" %}

关注会员端，如何更好的将应用集成到平台中，是一个需要仔细考虑的问题。我大概想到了以下思路：

采用 Express 框架，通过中间件的方式向平台注册一个子路由，比如 `app.use('/customer', CustomerSubApp)`。但是，经讨论，这个点子被负责平台开发的同事 L 否决了，理由是耦合性太强，建议分离成独立应用并通过 API 来通讯。

#### 技术栈选择

依然选择 Express 作为应用框架， 模板引擎选择比较中庸的 Ejs，理由是他符合 PHP、.NET 等 HTML 模板风格，并且网上对其没有过分的指责。选择 [express-ejs-layout](https://github.com/Soarez/express-ejs-layouts/issues) （好像就这一个）作为布局支持。其它几个依赖项如下：

- [body-parser](https://github.com/expressjs/body-parser)
- [cookie-parser](https://github.com/expressjs/cookie-parser)
- [moment](http://momentjs.com/docs/)
- [superagent](https://visionmedia.github.io/superagent/)

#### 规范

我要和同事 Y 一起来完成这个项目的开发，虽然人不多，但是考虑到以后可能的维护，我制定了若干规范：

- IDE 用 VSCode
- 用 GIT 进行版本管理、协作开发、配置 .gitignore
- 配置 .editorconfig、.eslintrc
- 不管前端还是服务端均使用 ES6 规范
- 样式使用 SASS 预处理工具，命名遵循 BEM 规范
- 遵循 HTML5 语义
- 图片资源统一转换为 .webp

#### 业务模块划分
主要两个大目录，**public/** 用于存放无需构建的资源，**src/** 存放需要构建的资源（代码、HTML模板）

src/ 结构设计如下：

{% include img.html src="//zxh1989.oss-cn-qingdao.aliyuncs.com/20190420/012631_48980.jpg" title="源代码模块分拆" %}

其中 *client/* 用于管理前端 JS + CSS 代码，包括以下部分：

- *compoents/* 定义组件，如 dialog、notifier、spinner 等；
- *pages/* 定义页面逻辑，如首页 *./home/* 包含 *index.js* 和 style.scss，js 在首页加载完成时运行，scss 则是定义首页该有的样式规则；
- *presentation/* 定义全局样式；
- *cache.js* 前端缓存；
- *config.js* 前端配置；
- *dom.js* 自己封装的 DOM 操作函数；
- *route-run-map.js* 这个是用来运行 “页面脚本” （如：*pages/home/index.js*）的引擎函数
- *share.js* 公共函数；
- *wx.js* 我对微信 SDK 结合具体业务进行的封装

*handlers/* 借助 .NET 的 code-behind 设计，我将每个页面的纯逻辑 (JS) 部分抽象出来，举个例子，*./home.handler.js* 代码像这样：

```js
const Proxy = require('../proxy')

module.exports = (req, res, next) => {
  const proxy = new Proxy(req.app, req, res)
  proxy.getTop10Shops().then(r => {
    res.render('home', { shops: r.data })
  }, next)
}
```

如此，我们在配置路由（Router）的时候，就显得很清晰，一个路由对应一个 handler，handler 也是最后一个中间件（叫**终极件**吧）；

*middlewares/* 中间件定义，如 auth、err、safe 等，err 是为全局配置的；

*proxy/* 定义接口调用；

*views/* 定义模板；

*app.js* 应用启动入口；

*app-dev.js* 应用启动入口（开发模式）；

*locals.js* 定义模板上下文，输出一个对象，其属性（值任意）可在模板上访问；

*pager.js* 分页数据模型；

*public-router.js、personal-router.js、vendor-router.js* 分别定义公开域路由、个人中心域路由以及工厂域路由；

*setup.js* 配置 Express 应用，如注册子路由、全局中间件、全局变量、模版引擎相关配置等；

这里有个特别的设计：

```js
const setUp = (app, routerFac, options) => {
  app.set('views', path.resolve(__dirname, './views'))
  app.set('view engine', 'ejs')
  app.locals.$ = locals // Helpers
  app.use(ejsLayouts)
  // use many things...
  // 开放域路由
  const publicRouter = publicRouterFac(app, routerFac(), {})
  app.use('/', publicRouter)
  // use many other things...
}
```

setUp 的第一个参数是一个 Express 应用实例（app），routerFac 是一个 Function，它要求返回一个 Express.Router 对象，这样设计是为了能够兼容“通过中间件，将会员端应用直接集成到平台中”这一被否决的实施方案。

*utils.js* 是公共函数。

#### 构建工具

我喜欢用 nodejs 开发一些辅助工具，比如，封装 webpack、自动上传、sass 编译、网页抓取 等。这个项目当然也需要做这些工作。我做了三个工具，以方便开发、构建：

- dev 运行开发环境
- pack 构建 client/ 代码、复制 node 端代码到指定目录
- inject 根据 pack 之后的 manifest 将构建好的 js、css 文件注入到 .ejs 文件

使用的第三方包：

- webpack 4.5
- webpack-dev-middleware
- webpack-hot-middleware
- nodemon 1.17
- babel 6.26
- node-sass 4.0

有了这些工具，我实现了前后端基于一个 serve 的开发方式。serve 一次，你就可以同时去开发 client 端和 server 端的功能，此得益于 webpack-dev-middleware 这个中间件。

### 填充业务代码

确定了代码规范、划分了模块、提供了开发构建工具之后，便可以进入业务代码的编写阶段了。

我们的流程设计是：设计稿 -> PS 切图 -> 编写 HTML -> 转为 ejs -> 写 handler 业务以提供 ejs 需要的数据 -> 界面测试 -> 修改 -> ...

### 对于鉴权与登录的设计

{% include img.html src="//zxh1989.oss-cn-qingdao.aliyuncs.com/20190420/020418_17649.jpg" title="鉴权 + 登录 流程图" %}

### 程序打包、上线

打包只需要运行命令：

```sh
>> npm run pack
```

生成的 dist 目录即构建结果，将它上传到服务器的指定目录上，并启动 app，用 pm2 或类似守护进程维持应用的可用性。
