---
layout: post
title: 应试
short: 面试效果不好，网上找了一篇经验，先分析下答案，试试效果怎么样
src: https://www.jianshu.com/p/6c6b13329d25
---

### 技术问题

#### Web 性能指标有哪些？

[https://juejin.cn/post/6854573208671092743](https://juejin.cn/post/6854573208671092743)

- 技术视角
  - 首字节
  - DOMContentLoaded
  - onLoad
- 用户视角
  - FP（First Paint）
  - FCP（First Contentful Paint）
  - FMP（First Meaningful Paint）
  - TTI（Time to Interactive）

#### 什么是栅格？有什么用？怎么用？有没有自己设计过？

[https://design.youzan.com/pattern/grid.html](https://design.youzan.com/pattern/grid.html)

1. 布局的栅格化系统，基于行（Row）和列（Col）来定义信息区块的外部框架
2. 保证页面的每个模块能够清晰地排布起来且保证统一性
3. 先定义行，行里放单元格，单元格里放入内容块
4. 使用 flex 或者 float 可实现，最新的 grid 也可以，一般需要使用媒体查询指令询问视窗的宽以合理分配单元格（列）的占比

#### 只用CSS如何实现单行文本溢出效果？多行文本溢出效果呢？

[https://www.zoo.team/article/text-overflow](https://www.zoo.team/article/text-overflow)

单行文本：
```css
overflow: hidden; /** 文字长度超出限定宽度，则隐藏超出的内容 */
white-space: nowrap; /** 设置文字在一行显示，不能换行 */
text-overflow: ellipsis; /** 规定当文本溢出时，显示省略符号来代表被修剪的文本 */
```
多行文本：
```css
-webkit-line-clamp: 2; /*用来限制在一个块元素显示的文本的行数,2表示最多显示2行。 为了实现该效果，它需要组合其他的WebKit属性*/
display: -webkit-box; /* 和1结合使用，将对象作为弹性伸缩盒子模型显示 */
-webkit-box-orient: vertical; /*和1结合使用 ，设置或检索伸缩盒对象的子元素的排列方式 */
overflow: hidden;  /* 文本溢出限定的宽度就隐藏内容 */
text-overflow: ellipsis; /*多行文本的情况下，用省略号“…”隐藏溢出范围的文本 */
```

#### CommonJS 规范中的 require 和 ESM 规范中的 import 有什么区别？

- CommonJs 为运行时，而 ESM 为编译时
- require 返回的是值引用，可模块外修改，import 为只读


#### 说说 CommonJS、AMD\CMD、ESM 的区别？

- SKIP


#### 能说说什么是 MVVM 吗？每个字母分别代表什么含义？自己有实现过 MVVM 吗？主流的 MVVM 框架有哪些，它们的实现原理有没有了解过？

- MVVM 就是 Model - View - ViewModel
- Model changes -> ViewModel -> View / View events -> ViewModel -> changes Model
- Vue & Angluar
- Vue 基于 Object.defineProperty 响应式；Angular 基于 Zonejs 的脏检查

#### 手写冒泡排序

```ts

const sort = (arr) => {
  let i = 0
  let j = 0

  const trySwap = (x, y) => {
    if (arr[x] <= arr[y]) return
    const e0 = arr[x]
    const e1 = arr[y]
    arr[x] = e1
    arr[y] = e0
  }

  for (const L = arr.length, i = L - 1; i > 1; i -= 1) {
    for (j = 0; j < i; j ++) {
      if (arr[j] > arr[j + 1]) {
        trySwap(j, j + 1)
      }
    }
  }
}

```

#### 手写快排

```ts
const sort = (arr) => {
  const partial = (i, j) => {
    if (j - i < 1) return
    let p = i
    let pv = arr[i]
    // so
    for () {
      // 将小于 pv 的元素移到左边
      // 将大于等于 pv 的元素移到右边
    }
    partial(i, p - 1)
    partial(p + 1, j)
  }
  partial(0, arr.length - 1)
}
```

#### 说说 vue 和 react 的区别？

- 监听数据变化的方式，Vue 是基于 getter 和 setter 的劫持；React 基于 render / commit
- 数据流，Vue 组件单向，DOM 元素和组件是双向的（v-model）；React 单向，DOM 事件响应基于函数回调
- HoC 和 mixins，Vue 只能使用 mixins 做功能增强；React 使用 HoC
- 组件通讯，Vue 使用属性、事件、provider/inject；React使用 props、函数回调、context
- 模板渲染方式，Vue 通过指令；React 只是 JS
- 渲染过程，Vue 更快速计算虚拟 DOM 的差异，因为保存了数据和组件的依赖关系；React 是全部子组件渲染
- 框架本质，Vue 是 MVVM；React 是前端组件化框架
- Vuex 和 Redux，数据可变，基于 getter/setter；React 数据不可变

#### 有没有看过 vue 源码？能说说双向绑定是如何实现的吗？

```ts

declare var compile: (html: string) => () => any

const html = `<input v-model="data.value" />`
const $this = {}
const data = { value: "" }

const getter = () => {
  return data.value
}

const setter = (value) => {
  data.value = value
}

const render = () => {
  const value = getter()
  const vnode = compile(html).call($this)
  $createOrUpdate(value)
  $diff()
  $bind(vnode.$el, "change", (e) => {
    setter(e.target.value)
  })
}

```

#### vue中 watch 和 computed 的区别是什么？computed 和 watch 的实现原理是什么？

- watch 用于监听数据变化，无返回值；computed 可以返回值，并且做了缓存优化
- 二者都是 Watcher，被 Dep 收集起来

#### 项目中 vue 组件间是如何通信的？

- 属性 / 事件
- provide / inject
- vuex
- event bus (an instance of VUE)
- ref / $children / $parent

#### 能说说vue组件的生命周期吗？

Ref: [https://vuejs.org/v2/guide/instance.html#Lifecycle-Diagram](https://vuejs.org/v2/guide/instance.html#Lifecycle-Diagram)

- beforeCreate
- created
- beforeMount
- mount
- Circle -- (beforeUpdate & updated)
- beforeDestroy
- destroyed

#### vue2 中 vdom 有了解吗？有什么用？vue2 中为什么要引入 vdom？

- vdom 就是用 js 对象构建的一种树结构，与 HTML DOM 树结构类似
- 用于最后生成 HTML DOM 或者更新 HTML DOM
- 为了渲染效率，也就是首先基于 js vdom 计算出补丁（首次是整体创建），这样就避免了不必要的 DOM API 调用

#### vue2 中 vdom 的 diff 算法是怎么实现的？

```ts
const patch = {}
const diff = (nextNode, oldNode) => {
  if (!eq(nextNode, oldNode)) {
    oldNode.$patch = { type: "replace", with: nextNode }
    return
  }
  diffChildren(
    nextNode,
    oldNode
  )
}

const diffChildren = (nextNode, oldNode) => {
  //...
}

```

#### vue2 中 $nextTick 有什么用？在什么场景下适合用到？它和 setTimeout/setImediate 的区别是什么？

- 在下次 DOM 更新循环结束之后执行延迟回调
- 需要立马访问修改后的 DOM
- setTimeout/setImediate 与 DOM 本身没关系（TODO）

#### 用一句话概况为什么选择vue（react）而不用react（vue）？

- 国内生态和用户数 Vue 都要大大优于 React

#### 对 react 是否熟悉？能说说组件有哪几种吗？为什么会有这么多种？

- Yes
- Class, Functional, HoC, Container, Presentational
- 存在很多场景，代码复用，组件功能增强

#### redux 中的 reducer 有什么用？

- 根据 action 返回新的状态

#### 项目中有没有用到 webpack？怎么用的，帮你解决了什么问题？

- Yes
- 配置入口、loader、plugin、output，调用 API，使用 devServer
- js 模块打包，支持了绝大多数模块规范，兼容 esm 和 commonjs，优化代码，合理分包，善用客户端缓存

#### 说说你们项目中使用到的 webpack 的 loader 有哪些？为什么要用这些 loader 呢？

- babel-loader
- css-loader
- style-loader
- sass-loader
- ts-loader
- file-loader
- postcss-loader
- url-loader
- cache-loader
- thread-loader

#### 说说 webpack 的 tree-shake 是什么？用于解决什么问题？

- 一种做 dead-code elimination 的机制，起源于 rollup
- 静态分析 import 和 export，用于死码消除
- 减小代码包体积

#### 说说 webpack 的 caching 机制是什么？为什么会有 caching？

- hash, contenthash, chunkhash
- 提升用户体验

### 说说 webpack 的 runtime 是什么？有什么用？

- 基于 webpack 构建的模块化应用系统，需要一个引擎来运行接连模块关系，runtime 就是这个引擎
- 配合模块清单，runtime 可以加载、解析模块的依赖，执行 lazy-loading

#### 有看过 webpack 的源代码吗？有自己写过 webpack 的插件吗？说说 webpack 的工作原理？

- Not that much
- of course, IT's a class with an `apply` method in which you can tap your handle to HOOKs.
- 大概流程：
  1. 初始化参数
  2. 开始编译
  3. 确定入口
  4. 编译模块
  5. 完成模块编译
  6. 输出资源
  7. 输出完成

#### 说说 webpack 配置文件主要都有哪些常用配置项？每个配置项的作用是什么？

- SKIP

#### 说说 webpack 的 bundle、chunk、module 的区别吗？

- bundle 由入口定义的，但入口对应一个，多入口会对应多个
- chunk 对应多个 module，根据分包规则以及 import()，合入到一个代码块
- module 就是我们写的模块，esm 下就是一个 js 文件

#### 项目中是否用到 gulp？能否手写一个 gulp 任务实现文件复制功能？

- Skip

#### 前端代码有用到 ES6/7/8 吗？如何保证他们在 IE 上正常运行？

- Yes
- polyfill， like core.js Or babel

### 是否用过 babel？有什么用？如何用？babel 的原理是什么？

- Yes
- 将现代代码（ES6）转换为传统代码（ES5）
- install babel.js 配置 babelrc 特别是 preset，也就是插件集，调用 API 或者使用 babel-loader 或者 babel cli
- es6 code (ts code)-> ast -> query browserslist & can i use? -> apply plugins -> change syntax, polyfill &etc. -> es5 code.

#### 什么是 CSS 模块化？有什么用？如何用？

- SKIP

#### 现在有一段文本，需要做首行缩进效果，需要用到哪个 css 属性？用什么单位比较合适？

- text-indent
- em

#### 段落文字之间的左右间距怎么控制？

- padding

#### margin 和 padding 可以为负数吗？margin 为负数用在什么场景下？

- margin can be, not for padding.

#### hasLayout 属性有什么用？

- 不知道

#### position 有哪些值？（考虑CSS3中新增的）

- static
- fixed
- relative
- absolute
- sticky

#### 什么是圣杯布局和双飞翼布局？如何实现？

- float + BFC
- flex
- grid

#### 是否了解 em/rem/px 的区别？使用 rem 的时候有没有遇到什么坑？

- em 相对直接元素的 font-size
- rem 相对 HTML 元素的 font-size
- 1px = 1 / 96 inch as usual
- [https://zhuanlan.zhihu.com/p/50978525](https://zhuanlan.zhihu.com/p/50978525)

####  有没有做过移动端开发？移动端开发如何适应各种屏幕？

- rem
- set fontSize on HTML element using media query.

#### 微信小程序端有做过吗？说说微信小程序开发中有什么坑？

- 无

#### 什么是 CSRF？如何防御？

- CSRF，跨站请求伪造，又称 XSRF，one-click attack OR session riding，基于 zero-sized image，hidden form，XHR；非用户意愿
- 防御
  1. STP，Form Token
  2. Cookie-to-header Token，X-Csrf-Token
  3. Origin、Referer
  4. SameSite of Cookie Setting

#### 说说 http 缓存策略有哪些？如何实现协商缓存呢？

- 种类：
  1. 强缓存
  2. 协商缓存
  3. 代理缓存（中间浏览器）
- 协商缓存
  1. 基于 Cache-Control：no-store、no-cache、private（不允许代理缓存）、max-age
  2. 基于 Expires：一个绝对时间点
  3. If-None-Match & Etag
  4. Last-Modified-Since & Date

#### 是否了解http2？能简单说下它的新特性吗？

- 二进制分帧
- 服务端推送
- 多路复用
- 首部压缩

#### 如何实现 util.promisify() 方法？

```ts
const promisify = (apiWithCallback, ...args) => {
  return new Promise((resolve, reject) => {
    apiWithCallback(...args, (err, data) => {
      if (err !== null) reject(err)
      else resolve(data)
    })
  })
}
```

#### 项目中有用到 nodejs 吗？帮你们做了哪些事情？你觉得用 nodejs 来做这些事情合适吗？

- Yes
- 反向代理、网关、mock API

#### 说说对于这句代码，JS 引擎做了哪些事情 let obj = new Person();

- tokenize AST
- compile line by line
- monitor
- optimization / de-optimization
- execution:
  - ...
- garbage collection

#### proto 和 prototype 的区别是什么？

- proto 是挂在对象上的一个属性，它表示该对象的原型是什么
- prototype 是函数上的，由该函数构造出来的对象的 proto 就是它

#### 说说 nodejs 的异步 IO 指的是什么？什么又是事件驱动？nodejs 异步队列有哪些？

- 用户进程触发 I/O 操作后立即返回，继续执行后续程序，I/O 操作完毕收到通知
- 有事件，程序就会运行下去，事件回调又会建立新的任务
- IO 队列、计时器队列、微任务队列、检查队列、关闭队列

#### 说说浏览器端事件循环和 nodejs 端事件循环的区别？

- script -> micro tasks -> macro tasks -> ...
- timers -> pending callbacks -> idle,prepare -> poll -> check -> close callbacks -> ...

#### 说说未来的职业规划？

- 高级工程师（for 1 years）
- 架构师（for 3 years）
- 技术经理（for many years）
- 学习 WebAssembly、Vue 3， C++、OpenGL
- One Company for at least 5 years

#### 说说你过去项目中自己觉得最亮眼的点/你做过最得意的项目是什么？

- EM...

### 二面

面试官会先自我介绍，然后轮到面试者自我介绍。这一轮继续考察技术的广度和深度，面试官会结合简历上写的技术点来发问。（某些厂会有笔试）

#### 什么是 BFC？有什么用？如何触发 BFC？（相关概念：IFC、FFC、清除浮动、margin collapse）

- keep

#### 说说 web 缓存分为哪两大类？http 缓存是什么？浏览器缓存是什么？

- HTTP 缓存和浏览器缓存
- 分别解释如下：
  1. HTTP 基于协议的缓存，主要缓存文本资源
  2. 浏览器缓存，基于 API，如 sessionStorage、localStorage、indexedDB、cookie、service Worker

#### 使用 ES6 语法一行代码如何实现数组去重？

```ts
let arr = [1,2,3,4,5,12,1,3,1,2]
arr = [...new Set(...arr)]
```

#### 解释一下盒子模型宽高值得计算方式？box-sizing 有什么用？

```ts
const rect = element.getBoundingClientRect()
rect.width
rect.height

// OR

element.clientWidth
element.clientHeight

```

box-sizing 使得元素 width 和 height 包含了 border 和 padding

#### fetch 和 ajax 的区别是什么？fetch 有什么坑吗？

- diffs
  0. API，fetch - Promise & ajax - callbacks
  1. fetch 不会 reject 400 和 500 HTTP 码；只会 reject 网络错误
  2. 不会发送跨域 cookies，除非设置了 `credentials = "includes"`
  3. fetch 不能发射 progress 事件
  4. IE 不支持 fetch
- 坑
  - 不支持 timeout
  - 不支持 abort

#### 知道 margin collapse 吗？如何解决？

- ing

#### 块级元素和行级元素有什么区别？行级元素有哪些？行级元素能设置宽高值吗，举个例子？行级元素设置display:inline-block之后为什么宽高会起效？

- ing

#### 说说 JS 中逗号运算符的作用？

多个表达式用逗号间隔，JS 引擎会由左及右地执行，最后返回最右侧的表达式值

#### 浏览器中输入一个 url，按下 Enter 键后会发生什么？（尽量说的完整）

[https://stackoverflow.com/questions/34269416/when-does-parsing-html-dom-tree-happen](https://stackoverflow.com/questions/34269416/when-does-parsing-html-dom-tree-happen)

1. DNS 解析
2. GET url  HTTP/1.0
3. HTML is downloading, while
4. Parsing HTML making DOM
    - halts if `<script>` is there.
      - downloads & parses & executes it.
      - done
    - continue parsing
5. Downloading stylesheets & make CSSOM
6. #4 is done & #5 is done
7. makes render tree
8. layout & painting

#### 说说什么是 JS 闭包、原型、原型链、作用域、作用域链？

- 闭包：ing

#### 页面DOM节点太多会出现什么问题？

- 绘制卡顿，回流的话，渲染进程的工作量会非常大

#### 如何获取元素到视图顶部的距离？

- getBoundingClientRect

#### getBoundingClientRect 中获取的 top 和 offsetTop 中获取的 top 有什么区别？

getBoundingClientRect 返回的 top 是元素上外边缘相到视窗上边缘的距离，而 offsetTop 返回的当前元素的上外边缘到其父元素的上内边缘的距离

#### 浏览器端 setTimeout 有什么坑吗？

- 无法回收
- 手机端浏览器后台运行时不触发
- 未被激活的 tab，最小时间间隔 1000 ms
- `>= 2 ** 31 ms` 会溢出，定时器立即执行

#### setTimeout 和 requestAnimationFrame 有什么区别？

- requestAnimationFrame 在下一次重绘制之前执行回调，绘制后生效
- setTimeout 是的等待时间不能保证，如果有一个常任务，timer 的回调就一辈子不会触发了

#### defineProperty 属于 ES6 吗？它和 Proxy 有什么区别？

- defineProperty 不属于 ES6
- defineProperty 只能代理 setter 和 getter；Proxy 可以代理 getter、setter、deleteProperty、ownKeys、has、defineProperty、getOwnPropertyDescriptor、enumerate
- Proxy 性能会大大优于 defineProperty

#### 说说 ES6 中都有哪些新特性？

- 语法
  - class
  - default, spread & rest args
  - destructuring
  - arrow function
  - for-of
  - async/await
  - generator / yield
  - template string
  - modules
  - let & const
- API
  - Object
    - entries
    - fromEntries
    - assign
  - String
    - includes
    - repeat
  - Array
    - findIndex
    - find
    - from
    - of
    - fill
    - keys / values
    - copyWithin
  - Map & Set (with weak)
  - Proxy / Reflect
  - BigInt
  - Symbols
  - Promise

#### vue 中数组如何更新值？有什么性能问题吗？如何实现只更改数组中的某一项（从性能方面考虑）？

- this.$set
- ing

#### JSONP 原理是什么？ CORS 是怎么执行的？

- request an URL with a callback's name, a global function, with content-type of `text/javascript`, and server response `${callback}([params])`
- with a HTTP header named `ALLOWD...`
  - simple, GET, POST which is normal.
  - no simple with preflight. Some special headers.

#### MessageChannel 和 postMessage 各有什么用？

- ing

#### setTimeout 和 Promise.then 的执行顺序有了解吗？在浏览器环境下和 nodejs 环境下各是如何？

- ing

#### 说说 web 安全性方面的认识？项目中是如何做的？

- CSP
- CSRF
- XSS
- Cookie HTTPOnly Secure
- HTTPs

#### 说说单点登录流程的实现逻辑？

[https://www.cnblogs.com/ywlaker/p/6113927.html](https://www.cnblogs.com/ywlaker/p/6113927.html)

- 基于 cookie 主域共享
- 不同主域名的话
  - 访问 URL
  - 401
  - 跳转到认证中心，输入账户密码，得到 token
  - 跳转到 redirectURL（也就是 URL）
  - 应用#1向认证中心检验 token，有效，注册，建立局部会话，此后不再麻烦认证中心
  - 应用#2同样流程，发现已经登录，检验/注册，建立局部会话
  - 注销：
    1. 应用#1发起注销请求
    2. 认证中心销毁全局会话
    3. 认证中心向所有的持有此 token 的应用发起注销请求
    4. 各应用注销，销毁局部会话
    5. 跳转到登录页面

#### 项目开发中有没有遇到什么技术问题？说说解决的过程？

思路：好难！

#### 介绍一下自己感觉最有挑战性的项目（可以从这几个方面入手：项目性质、项目规模、项目架构、自己承担的工作、项目亮点、项目难点、性能优化）

思路：
  1. 背景
  2. 技术
  3. 负责的内容
  4. 难点或者亮点

Pmall 商城：
  1. 业务抽象能力，设计模式的合理使用
Sentinel 控制台：
  1. 分面图 4 x QPS + 1 RT
  2. Brush 功能
  3. 面板多图表同步更新
  4. Json schema parser

#### 你有什么要问我的？（本轮面试的表现怎么样？你们常用的技术栈是哪些？）

- 自我感觉不好就说“谢谢，再见”
- 感觉良好，就问：
  1. 具体团队规模，初级/高级比例如何
  4. 是否有技术分享
  2. 发展机会、晋升空间
  3. 简单说下此岗位的日常工作
  5. 简介公司的现有产品，以及计划的产品、项目
  6. 是否会尝试新的技术

#### 说说 TCP 三次握手/四次挥手的过程？为什么挥手要四次而握手只要三次？SYN 攻击属于哪个阶段？

3-way handshakes

- Client sends `SYN, seq = x` to Server
- Server recrived, and send `SYN, seq = y, ack = x + 1`
- Client received, and send `ACK, ack = y + 1`
- Server received
- established

4-way goodbyes

- A sends `FIN, seq = x, ack = s`
- B receives & sends `ACK, seq = s, ack = x + 1`
- data transfering still
- data ack
- B sends `FIN, seq = s, ack = x + 1`
- A receives & sends `ACK, seq = x, ack = s + 1`

why 3 and 4?

to be sure two hosts both confirm the other side is right and ready to connect. For 4-way handshakes, because one of these two hosts must be finished the work being doing, and after which it can send `FIN` to tell the other it gets ready to be close.

#### 说说 https 的原理（结合传输层和应用层来谈）？为什么 http 性能比 https 好？为什么 https 比 http 安全？

[https://juejin.cn/post/6844903830916694030](https://juejin.cn/post/6844903830916694030)

HTTP 通信接口部分用 SSL 和 TLS 协议代替而已。

通常，HTTP 直接和 TCP 通信。当使用SSL时，则演变成先和 SSL 通信，再由 SSL 和 TCP 通信了。简言之，所谓HTTPS，其实就是身披 SSL 协议这层外壳的 HTTP。

解决的问题：

- 加密传输（被窃听）
- 数字签名（篡改）
- 数字证书（身份伪装）

流程：

- B 发起请求
- S 发送证书到 B
- B 用公钥加密“伪随机数”，发送到 S 作为会话密钥
- S 用私钥解密会话密钥
- S 使用会话密钥加密后的明文到 B，B 收到使用会话密钥解密
- B 同样

Is http fast than https? Of course, it is.

- more CPU computing.
- more connections and more data transfering.

### 团队管理

#### 说说你是如何管理前端团队的？

- 不知道

#### 如果说团队里面两个同学业务表现都得到了业务方的认可，那你还会从哪些方面去定 KPI？

- 唉，这种问题

#### 能不能找一两个你最熟悉的项目，然后聊聊你在里面做的事情（收获）？

- Sentinel Dashboard：开发环境搭建；镜面图表；可编辑表格；
- 想不起来了

### 综面

主要聊项目，中间也会穿插些技术问题。体现学习能力、抗压能力、敬业精神；会深挖简历中提到的每个技术点。

#### 你最熟悉的项目是哪个？说说项目架构？你负责的是哪部分？有什么亮点/业绩？使用了哪些技术？为什么要用这些技术？

- ing

#### 你觉得你最大的优势是什么？

- ing

#### 说说未来三年的职业规划？

- ing

#### 说一次失败的经历？

- ing

#### 工作过程中遇到的最大挑战是什么？如何解决的？

- ing

#### 为什么要离职？

- ing

#### 说说你的优缺点？

- ing

#### 说说你在项目中遇到的最大挑战是什么？

- ing

#### 说说你的前端项目架构是怎么样的？你觉得什么地方还可以再改进？

- ing

#### 你觉得要让你加入我们团队的话，你最大的优势是什么？

- ing

#### 说说你是怎么带前端团队的？

- ing

#### 团队中每个人的开发方式是不相同的，你们团队用了哪些方式来保证代码质量？

- ing

#### 如果团队有新人进来，有什么办法可以使其在一周左右的时间开始进行业务开发？

- ing

#### 团队中有没有做工程化工具方面的提炼？

- ing

#### 说说你的每段工作经历以及每段经历中的收获，现在回顾这些工作经历，你觉得哪些是对你成长最有帮助的？

- ing

#### 如果加入一个新团队/公司，你现在的顾虑有哪些？你准备怎么去解决/消除顾虑？

- ing

### 鸣谢

作者：hongboy

链接：https://www.jianshu.com/p/6c6b13329d25
