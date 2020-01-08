---
layout: post
title: TypeScript 与 Babel 的完美婚姻
short: 由 TypeScript 和 Babel 两大研发团队，历时一年之久，专为 TypeScript 打造出了 Babel 插件 @babel/preset-typescript。得益于此，TypeScript 的使用从未如此简单！本文将从 4 点来陈述为什么 TypeScript 和 Babel 是一场完美的搭配；以及，如何花十分钟，一步一步地将项目迁移至 TypeScript 语言
source: https://iamturns.com/typescript-babel/
tags:
  - typescript
  - webpack
---

由 TypeScript 和 Babel 两大研发团队，历时一年之久，专为 TypeScript 打造出了 Babel 插件`@babel/preset-typescript`。得益于此，TypeScript 的使用从未如此简单！本文将从 4 点来陈述为什么 TypeScript 和 Babel 是一场完美的搭配；以及，如何花十分钟，一步一步地，将项目从 Js 语言迁移至 TypeScript 语言。

### preset-typescript 是什么？为什么要有它？

我一开始并不理解存在这个新的 preset （预设的插件集合）的意义。

难道 Babel 和 TypeScript 不是两个完全不同的玩意吗？Babel 如何能做 TypeScript 中的所谓“类型检查”呢？TypeScript 既能像 Babel 那样将你的**现代代码**转化为 ES5，那此举意义何在？将 Babel 和 TypeScript 揉在一起不是把事情搞得更复杂了吗？

经过数小时的分析，我得出结论：**TypeScript 和 Babel 的结合，实在是完美！**

现在让我来告诉为什么。

#### 你（应该）既已使用 Babel

你一定是以下三种开发者中的一种：

- 你使用了 Babel。即便你没直接去用它，Webpack 也会将你的 js 文件交给 Babel 来处理（很多的 webpack 配置样板都是这个情况，包括 [create-react-app](https://github.com/facebook/create-react-app)）。
- 你仅使用 TypeScript。那么考虑下将 Babel 加进来，它将提供很多独特的功能，这个一会儿将说到。
- 你不使用 Babel？那么，来吧！

**1. 无破坏性编写现代 JS 脚本**

你的代码需要在老旧的浏览器上运行吗？没问题，Babel 将你的代码作一番转换就万事大吉了。所以，尽管使用最新的、最棒的语言特性吧，没有关系。

TypeScript 有类似的功能，通过设置`target`为`ES5`或`ES6`。但是 Babel 提供的`babel-preset-env`插件集可以把这件事做得更好！由此，你不需要去关注那些具体的 JS 特性（ES5、ES6、等），而只需列出你想支持的环境：

```json
{
  "targets": {
    "browsers": ["last 2 versions", "safari >= 7"],
    "node": "6.10"
  }
}
```

Babel 使用 [compat-table](https://kangax.github.io/compat-table/) 来判断哪些 JavaScript 特性需要去“转”、去 polyfill，以满足其指定“环境”的需要。

{% include img.html src="https://iamturns.com/static/compat-table-4011bf23893b052a3c08c9a89da0548e-44611.png" title="Take a moment to appreciate the genius who named this project ‘compat-table’." %}

`create-react-app`使用了一个有趣的技巧：为了**速度**，在开发时以“最新的浏览器”为目标环境进行编译；为了**兼容**，切换为“以更宽泛的浏览器”为目标环境，漂亮！

**2. Babel 有极强的可配置性**

想使用 JSX、 Flow 、TypeScript ？您只需要安装相应的插件，Babel 就能处理它。[官方插件](https://babeljs.io/docs/en/plugins)为您提供了大量的选择，大多覆盖到将至的 JavaScript 语法特性。另外，有丰富的第三方插件供选择，如 [improve lodash imports](https://github.com/lodash/babel-plugin-lodash)、[enhance console.log](https://github.com/mattphillips/babel-plugin-console) 以及 [strip console.log](https://github.com/betaorbust/babel-plugin-groundskeeper-willie)。您可在 [awesome-babel](https://github.com/babel/awesome-babel) 列表中去查找。

但是请注意，如果您使用的插件大幅修改语法，那么 TypeScript 可能无法做解析工作了。举个例子，极有可能通过的[可选链特性](https://github.com/tc39/proposal-optional-chaining)存在一个对应的插件：

{% include img.html src="https://iamturns.com/static/optional-chaining-4e8453e2d02f36a6771957310609d1c5-605fa.png" title="@babel/plugin-proposal-optional-chaining" %}

但是不幸，TypeScript 不能理解这个语法。

不要紧张，有一个替代方案......

**3. Babel Macros**

你知道 [Kent C Dodds](https://twitter.com/kentcdodds) 吗？他创造性地写了一个 Babel 插件：[babel-plugin-macros](https://github.com/kentcdodds/babel-plugin-macros)。

并不需要将此插件添加到 Babel 的配置文件的插件列表中，而是将其作为依赖安装并直接在代码中导入(import)。Macro 会在 Babel 编译的时候潜入，并按照设计修改你的代码。

一个例子，在[可选链](https://github.com/tc39/proposal-optional-chaining)正式标准化之前，我们使用 [idx.macro](https://www.npmjs.com/package/idx.macro) 来暂且处理问题。

```js
import idx from 'idx.macro';

const friends = idx(
  props,
  _ => _.user.friends[0].friends
);
```

这将编译为：

```js
const friends =
  props.user == null ? props.user :
  props.user.friends == null ? props.user.friends :
  props.user.friends[0] == null ? props.user.friends[0] :
  props.user.friends[0].friends
```

Macros 是很新鲜的东西，但是很快得到了应用。尤其，它将要在 [create-react-app v2.0](https://reactjs.org/blog/2018/10/01/create-react-app-v2.html) 落地。CSS in JS 已有相关应用：[styled-jsx](https://www.npmjs.com/package/styled-jsx#using-resolve-as-a-babel-macro)、[styled-components](https://www.styled-components.com/docs/tooling#babel-macro) 和 [emotion](https://emotion.sh/docs/babel-plugin-emotion#babel-macros)。Webpack 也提供了相关的插件，如 [raw-loader](https://github.com/pveyes/raw.macro)、[url-loader](https://github.com/Andarist/data-uri.macro) 以及 [filesize-loader](https://www.npmjs.com/package/filesize.macro)。更多请前往 [awesome-babel-macros](https://github.com/jgierer12/awesome-babel-macros)。

最重要的是：不像 Babel 插件，所有的 Babel macros 都兼容于 TypeScript。Macros 也有益于减少运行时依赖，避免了客户端的计算，以及早在构建时捕获错误。您可阅读[这篇文章](https://babeljs.io/blog/2017/09/11/zero-config-with-babel-macros)以获取更多细节。

{% include img.html src="https://iamturns.com/static/console.72e0a8b3.gif" title="A better console.log: scope.macro" %}

#### 管理单个编译器更为容易

TypeScript 有它自己的编译器，它提供了不可思议的类型检查超级能力。

**1.那暗淡的岁月里（Babel 7 之前）**

同时使用 TypeScript 和 Babel 这两个编译器并非轻易的事情。我们的编译流程是这样的：`TS > TS Compiler > JS > Babel > Js (again)`。

我们常常借助 Webpack 来处理这个问题。通过对 module.rules 的配置，我们将`*.ts`文件交给 TypeScript 来处理，然后将其处理的结果给到 Babel。但是你使用的 TypeScript 加载器（loader）是哪个？比较流行的是 [ts-loader](https://github.com/TypeStrong/ts-loader) 和 [awesome-typescript-loader](https://github.com/s-panferov/awesome-typescript-loader)。[awesome-typescript-loader](https://github.com/s-panferov/awesome-typescript-loader) 项目的 README.md 提到`awesome-typescript-loader`可能对于某些处理会很慢，并建议使用`ts-loader`，配合以 [HappyPack](https://github.com/amireh/happypack) 或者 [thread-loader](https://webpack.js.org/loaders/thread-loader/)。[ts-loader](https://github.com/TypeStrong/ts-loader) 项目的 RADMME.md 则建议结合 [fork-ts-checker-webpack-plugin](https://github.com/Realytics/fork-ts-checker-webpack-plugin)、[HappyPack](https://github.com/amireh/happypack)、[thread-loader](https://github.com/webpack-contrib/thread-loader) 或者 [cache-loader](https://github.com/webpack-contrib/cache-loader)。

啊，不！这就是很多人感到非常恼火的地方，并且终于将 TypeScript 扔到 “太难使用” 的篮子里。我并不责怪他们～

{% include img.html src="https://iamturns.com/static/simply-configure-typescript-1933ffec04eb2221fd05695a070016a5-27dc3.jpg" %}

**2. 阳光灿烂的日子里（Babel 7 以来）**

假如存在一个这样的 js 编译工具，怎么样？不管你的代码是否包含 ES6 特性、JSX 语法、TypeScript 语法 甚至某些自定义的用法，这个编译器都知道怎么处理。

我刚刚粗略地说过 Babel。让 Babel 来扮演这个角色，就没有必要在复杂的 webpack 里管理、配置、揉合两个编译器了。

这也将简化整个 Javascipt 生态。我们使用的 linter、test runners、构建系统以及模板从此不再依赖两个编译器，它们只需支持 Babel 就可以了。从此，你只需专心配置 Babel 就足够。从此，你将告别 [ts-node](https://github.com/TypeStrong/ts-node)、[ts-jest](https://github.com/kulshekhar/ts-jest)、[ts-karma](https://github.com/monounity/karma-typescript)、[create-react-app-typescript](https://github.com/wmonk/create-react-app-typescript)、等等，转而使用那些对 Babel 的支持。如今，对Babel 的支持有很多，您可以去看看 [Babel setup](https://babeljs.io/en/setup) 这个文档：

{% include img.html src="https://iamturns.com/static/babel-support-83d89cdf00af707da859a373ff56dbf5-30759.png" title="Babel has you covered." %}

#### 更快的编译速度

警告！你或许需要坐下来认真看看下面的内容。

Babel 是如何处理 TypeScript 代码的呢？回答是：去除它们！

是的，它会删除所有的 TypeScript 代码，将其变为 “普通”的 JS 代码，继而按照它乐意的方式进行。

这听起来很奇怪，但是为此得到了两大好处。

第一，⚡️ 如闪电般的处理速度 ⚡️。

很多的 TypeScript 用户在启用 development / watch 模式的时候，体验着极度迟钝的编译过程。你编完码，然后你保存了文件，接着 TypeScript开始工作了，啦啦啦啦，最后你终于看到了效果。啊——！你发现了一处编排错误，你修改了它，保存，然后，啦啦啦啦，嗯——。太慢了，至于让你十分的气恼，它打断了你的思路！

我们不太好去责备 TypeScript 编译器，它做的事情真的太多了。它要扫描类型声明文件 (*.d.ts)，包括 node_modules 目录下的，并且要确保你的代码书写正确。这就是为什么很多的开发者会将 TypeScript 的类型检查这一工作丢到一个独立的进程中。然而，Babel + TypeScript 组合仍然提供了很快的编译速度，这得益于 Babel 的缓存优先和单文件输出的架构。

那么，如果 Babel 删掉了全部的 TypeScript 代码，我们写 TypeScript 的价值何在呢？这自然引出了第二个好处。

#### 只在你准备就绪的时候检测类型错误

你在破解一些代码，很快你有了一个解决方案来验证你的想法。你保存了文件，TypeScript 向你发出了尖叫：

> “不！我不能编译这个！你的代码有毁坏，涉及 42 个文件！”

是的，你知道代码有毁坏。你甚至也同时破坏了几处单元测试的代码。但是，你这是在实验，然而持续不断地来做类型检查将令人抓狂。

这是 Babel 删除 TypeScript 代码所带来的第二点好处。你写了一些代码，然后保存，接着，Babel 开始编译（非常快速）它，没有做类型检查。持续对你的方案进行实验，直到 TypeScript 可以检查错误，你在进行连续编码的过程就类似这样。

那么你将怎么样来检查类型错误呢？添加一个脚本`npm run check-types`来调用 TypeScript 编译器。我习惯于在`npm test`之前运行类型检查脚本，然后运行单元测试。

### 这还不是完美的婚姻

根据 [announcement post](https://blogs.msdn.microsoft.com/typescript/2018/08/27/typescript-and-babel-7/)，由于 Babel 的单文件输出架构，有 4 个 TypeScript 特性不被编译。

不要担心，这不是什么坏事。开启`isolatedModules`选项，TypeScript 会对此给出警告。

**1. 命名空间（Namespaces）**

解决：不要使用它！这个概念已经过时了。使用 ES6
的标准化的模块（import / export）替代之。[recommended tslint rules](https://github.com/palantir/tslint/blob/21358296ad11a857918b45e6a9cc628290dc3f96/src/configs/recommended.ts#L89) 可确保 namespaces 不出现在项目中。

**2. 使用 &lt;T&gt;x 语法做类型转换**

解决：使用`x as T`。

**3. Const enums**

这写法现在是不对的，使用常规写法就好。

**4. import / export 的遗留风格**

例如：`import foo = require(...) 和 export = foo`。

我在写 TypeScript 的这么多年里从来不出现这种东西。谁还用呢？尽快收手吧！

### 好，我们来试一下 TypeScript + Babel 新模式

{% include img.html src="https://iamturns.com/static/yeah-6e69b732a6647969c78b6249f42ca636-e24d6.jpg" title="Photo by rawpixel.com" %}

让我们开始动手，这大概需要 10 分钟的时间。

我假设你已经安装了 Babel 7。如果没有，请看 [Babel 升级指南](https://babeljs.io/docs/en/v7-migration.html)。

**1. 重命名 .js 文件为 .ts**

假设你的文件位于`/src`：

```sh
find src -name "*.js" -exec sh -c 'mv "$0" "${0%.js}.ts"' {}
```

**2. 将 TypeScript 加到 Babel**

几个依赖：

```sh
npm install --save-dev @babel/preset-typescript @babel/plugin-proposal-class-properties @babel/plugin-proposal-object-rest-spread
```

在你的 Babel 配置中（`.babelrc or babel.config.js`）:

```json
{
  "presets": [
      "@babel/typescript"
  ],
  "plugins": [
      "@babel/proposal-class-properties",
      "@babel/proposal-object-rest-spread"
  ]
}
```

TypeScript 有几个额外的特性，Babel 需要了解（列出的 那2 个插件）。

Babel 默认查找 .js 文件，可惜的是，你不能在 Babel 配置文件里配置这个行为。

如果你使用 Babel CLI，加上`--extensions '.ts'`。

如果你使用 webpack，将 `'ts'` 加在`resolve.extensions`数组中。

**3. 加上 ‘check-types’ 命令**

在`package.json`中：

```json
"scripts": {
  "check-types": "tsc"
}
```

这个命令仅仅是调用了 TypeScript 编译器（tsc）。

tsc 从哪里来？我们需要安装 TypeScript：

```sh
npm install --save-dev typescript
```

欲配置 Ts（以及 tsc），我们需要在项目根目录创建一个`tsconfig.json`文件。

```json
{
  "compilerOptions": {
    // Target latest version of ECMAScript.
    "target": "esnext",
    // Search under node_modules for non-relative imports.
    "moduleResolution": "node",
    // Process & infer types from .js files.
    "allowJs": true,
    // Don't emit; allow Babel to transform files.
    "noEmit": true,
    // Enable strictest settings like strictNullChecks & noImplicitAny.
    "strict": true,
    // Disallow features that require cross-file information for emit.
    "isolatedModules": true,
    // Import non-ES modules as default imports.
    "esModuleInterop": true
  },
  "include": [
    "src"
  ]
}
```

**完毕！**

好的，基础设置工作已完成。现在运行一下`check-types`命令（watch 模式：npm run check-types --watch）并确保 TypeScript 已经接受了你的代码（not broken!）。你将可能发现几个你未注意到的 bug，这是好事！从 [Js 迁移到 Ts](https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html) 的指南在此。更多的，你可以去看  [TypeScript-Babel-Starter](https://github.com/Microsoft/TypeScript-Babel-Starter)，里面对从〇安装Babel、类型声明（d.ts）文件的生成、用于 React 等方面有详细介绍。

### linting 如何？

~~使用 tslint~~。

**更新（2019 九月份）**：使用 Eslint！TypeScript 团队从一月份就开始着手于 Eslint 的集成。得益于 @typescript-eslint 项目，配置 Eslint 并不复杂。启发之见，看看我的 [mega ESLint config](https://github.com/iamturns/create-exposed-app/blob/master/.eslintrc.js)，里面包含了 Ts、Airbnb、Prettier 以及 React。

### Babel + TypeScript = 一场完美的婚姻

{% include img.html src="https://iamturns.com/static/love-6816a7c4005415586f0da1a9fea5407b-e24d6.jpg" title="Photo by Akshar Dave" %}

编译器，你仅需 Babel，通过配置，它能处理任何事情。

不必为了两个具有相似功能的编译器而劳神费力。现在，你可利用 linters、test runners、构建系统对 Babel 的不可思议的集成， 简化你的项目配置。

Babel 和 TypeScript 的组合是编译速度变得快如闪电，并且在编码进行的时候保持“等待”状态，直到就绪才开始执行类型检查。

### 预测：TypeScript 使用量将增长

根据 Stack Overflow 最近针对开发者的调查统计，Js 是最流行的编程语言，TypeScript 排在第 12 位。这对于 TypeScript 是巨大的成就，它超过了 Ruby、Swift 和 Go。

{% include img.html src="https://iamturns.com/static/dev-survey-7e7416c3e24796eb8de66d34164a8777-5afb1.png" %}

我预测 TypeScript 将在接下来的一年（译者：指 2020 年）进入前 10 名。

TypeScript 团队正在极力布道。本 Babel 预设（babel-preset-typescript）是历时 1 年的合作所取得的成果，团队的新目标是[优化 ESLint 集成](https://github.com/Microsoft/TypeScript/issues/29288)。这是明智之举，它增强了功能、社区、既有工具的插件的发展。因为，开发两个具有相似功能的编译器和 linter 无疑就是浪费精力。

通过调整我们所喜欢工具的配置，TypeScript 的使用变得一帆风顺，入门的障碍已经被清除。

随着 VS Code 的日渐流行，开发者们已经装配上了令人振奋的 TypeScript 环境。Autocomplete on steroids will bring tears of joy（不会翻译这句）。

TypeScript 已经集成到 [create-react-app v2.0](https://reactjs.org/blog/2018/10/01/create-react-app-v2.html)，从而得到了每月 200k 下载量所对应的关注度。

如果你因为 TypeScript 难于配置而关闭了它，那么现在不这不再是个问题。是时候让它重新运行起来了！
