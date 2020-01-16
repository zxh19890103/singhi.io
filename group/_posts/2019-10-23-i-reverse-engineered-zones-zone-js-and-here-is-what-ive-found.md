---
layout: post
title: 深入研究 Zone.js 之后的发现
short: Zones 是帮助开发人员处理多个有逻辑关联性异步操作的新机制。它将每个异步操作通过 zone 关联起来
src: https://blog.angularindepth.com/i-reverse-engineered-zones-zone-js-and-here-is-what-ive-found-1f48dc87659b
tags:
  - Zone.js
---

{% include img.html src="https://cn.bing.com/th?id=OHR.CountyBridge_ZH-CN6500717169_UHD.jpg&rf=LaDigue_UHD.jpg&pid=hp&w=3840&h=2160&rs=1&c=4" %}

Zones 是帮助开发人员处理多个有逻辑关联性异步操作的新机制。它将每个异步操作通过 zone 关联起来。使用 Zones 开发人员将得到以下好处：

- 贯穿（共享）数据，类似其它编程语言的“线程本地存储”，它可以通过 zone 在任何异步操作中访问到这些数据。
- 自动追踪异步操作，以执行“清理”、“渲染”、“测试断言”等。
- 计时，可用于统计或者 in-the-field profiling
- 异常捕获，zone 中的任何异常都可以在其内得以捕获，避免向顶层传播。

互联网上的大多数文章不是描述过时的 API，就是用极度简化的架构图来解释。本文，我将使用最新的 API，尽可能详细地过一遍必要的 API。我将首先描述一下这些API，然后展示一下异步任务的“关联”机制，接下来说一下拦截器。文章的最后，对于 Zones 原理，我会给出一个简短的解释。

Zones 当前还在进 EcmaScript 标准的提案阶段，目前[阻塞在 Node 那里](https://github.com/nodejs/TSC/issues/340)。Zones 经常等视为 Zone.js ，这可见于它的[源码仓库](https://github.com/angular/zone.js)和 [npm包](https://www.npmjs.com/package/zone.js)。但是，文本将使用`Zone` 这个名字，因为它在标准中已有具体阐述。请注意，本文不是关于 `ngZone` 的，而是 `ngZone` 的基础 - Zones（zone.js）。掌握了本文的知识，你就可以自己来创建一个 NgZone，或者明白 Angular 中的 NgZone 的工作原理。想知道更多关于 NgZone 的知识，可以看看我的另一篇文章 [《你还是认为 NgZone 是 Angular 脏检查的必备机制吗？》](https://blog.angularindepth.com/do-you-still-think-that-ngzone-zone-js-is-required-for-change-detection-in-angular-16f7a575afef)

### Zone 相关的 API

让我们首先来看看 Zones 上的一些方法。Zone 类实现了以下接口：

```ts
class Zone {
  constructor(parent: Zone, zoneSpec: ZoneSpec);
  static get current();
  get name();
  get parent();

  fork(zoneSpec: ZoneSpec);
  run(callback, applyThis, applyArgs, source);
  runGuarded(callback, applyThis, applyArgs, source);
  wrap(callback, source);

}
```

`current zone` 在 Zones 中是一个非常重要的概念。current zone 是贯穿于所有异步操作的异步上下文（async context）。它是对与当前的执行栈/异步任务相关联的那个 zone 的引用。你可以通过 Zone.current 来访问到它。

每一个 zone 都有一个 `name`，主要用于调试目的。zone 还定义了下边这些方法：

- `z.run(callback, ...)` 在指定的`zone`中同步地执行给定的函数。在执行的时候，它将当前的`zone`赋值给`z`，之后将其重置为前一个 `zone`。在`zone`中执行回调通常称为“entering a zone”。

- `z.runGuarded(callback, ...)` 和 `run` 一样，但是它能捕获运行时异常，并提供拦截机制。如果一个异常没有被任何父 `Zone` 处理，它将被再次抛出。

- `z.wrap(callback)` 负责生产一个新的函数，来闭包 `z`，它底层会调用 `z.runGuarded(callback)`。如果一个回调函数传递给另一个 `zone` 的 `run` 方法，那么它仍然在 z 上下文中执行，而不是“另一个 zone”。这个类似 `Function.prototype.bind` 的机制。

下面的部分，我们将花点篇幅来谈谈 `fork` 方法。`Zone` 也有一系列的方法来执行、计划、取消一个任务。

```ts
class Zone {
  runTask(...);
  scheduleTask(...);
  scheduleMicroTask(...);
  scheduleMacroTask(...);
  scheduleEventTask(...);
  cancelTask(...);
}
```

这些都是底层方法，作为使用者，我们很少涉及，因此，我不打算更详细地讨论它们。 Scheduling 一个任务是 `Zone` 的一个内部操作，有点像使用 `setTimeout` 来派发一个异步操作。

### 跨调用栈持久 zone

`Javascript` 虚拟机都在各自的栈帧中执行每个函数。因此，如果你有下边这样的代码：

```ts
function c() {
    // capturing stack trace
    try {
        new Function('throw new Error()')();
    } catch (e) {
        console.log(e.stack);
    }
}

function b() { c() }
function a() { b() }

a();
```

在 `c` 函数中，有以下调用栈：

```
at c (index.js:3)
at b (index.js:10)
at a (index.js:14)
at index.js:17
```

至于捕获 `c` 函数中调用栈轨迹的方法，在 [MDN 网站](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/stack)有系统描述。

上面的回调可以用下图表达：

{% include img.html src="https://zxh1989.oss-cn-qingdao.aliyuncs.com/personal-site/20191026-zonejs/repository-open-graph-template.png" %}

因此，我们有了 3 个函数调用栈帧和一个全局上下文栈帧。

在 `javascript` 环境中，`c` 的栈帧无论如何都无法与 `a` 函数的栈帧关联起来。`Zone` 则允许我们使用一个 `zone` 把每个栈帧关联起来。一个例子，我们能将那个 `a` 和 `c` 的栈帧用一个 `zone` 连接起来。因此，我们有了下图：

{% include img.html src="https://zxh1989.oss-cn-qingdao.aliyuncs.com/personal-site/20191026-zonejs/1_OuIDBX9o8UoUX4vfU6osRQ.png" %}

我们马上就可以看到这是怎么做到的。

#### 使用 zone.fork 来创建一个 child zone

对于 `Zone`，最常用到的一个性质，就是使用 `fork` 方法来创建一个新的 `zone`。`Forking` 一个 `zone` 会创建一个新的 `zone` ，并将其 `parent` 设置为调用 `fork` 函数的那个 `zone`。

```ts
const c = z.fork({name: 'c'});
console.log(c.parent === z); // true
```

`fork` 方法的底层只是简单地使用 `Zone` 类创建了一个新的 `zone`：

```ts
new Zone(targetZone, zoneSpec);
```

因此，为了能够关联 `a` 和 `c` 于一个 `zone`，我门首先要创建一个 `zone`。我们使用 `fork` 方法来实现：

```ts
const zoneAC = Zone.current.fork({name: 'AC'});
```

我们传入 `fork` 方法的参数被称为 `zone` 细则（`ZoneSpec`），它包含了以下属性：

```ts
interface ZoneSpec {
    name: string;
    properties?: { [key: string]: any };
    onFork?: ( ... );
    onIntercept?: ( ... );
    onInvoke?: ( ... );
    onHandleError?: ( ... );
    onScheduleTask?: ( ... );
    onInvokeTask?: ( ... );
    onCancelTask?: ( ... );
    onHasTask?: ( ... );
```
`name` 定义了 `zone` 的名字，`properties` 用来保存栈帧间的共享数据。所有其它的方法都是拦截器，它们允许 `paernt zone` 拦截 `child zones` 的某些操作。要点是，`forking` 创建了一个 `zones` 的层级结构，`Zone` 类上的所有方法都能被 `parent zone` 通过钩子拦截。后边，我们将看到如何通过 `properties` 来在异步操作和钩子函数中共享数据，以实现对任务的跟踪。

让我们再来创建一个 `child zone`：

```ts
const zoneB = Zone.current.fork({name: 'B'});
```

现在，我们有了两个 `zone`，我们能使用它在某个 `zone` 中执行函数。我们可以使用 `zone.run` 方法。

#### 在 zones 间切换 zone

要想使一个函数执行栈帧与某个 `zone` 关联起来，我们需要调用 `run` 方法来运行一个函数。你已经知道，`run` 会在指定的 `zone` 中同步地运行一个回调，而后，他将恢复到 `parent zone`。

因此，应用这些知识，我们来稍微修改一下这个例子：

```ts
function c() {
    console.log(Zone.current.name);  // AC
}
function b() {
    console.log(Zone.current.name);  // B
    zoneAC.run(c);
}
function a() {
    console.log(Zone.current.name);  // AC
    zoneB.run(b);
}
zoneAC.run(a);
```

每个调用栈都关联了一个 `zone`：


{% include img.html src="https://zxh1989.oss-cn-qingdao.aliyuncs.com/personal-site/20191026-zonejs/1_OuIDBX9o8UoUX4vfU6osRQ.png" %}

你可以看到，我们执行每个函数的时候，都是分别使用对应 `zone` 的 `run` 方法。你可能好奇，如果我们不使用 `run` 方法，而仅仅是在一个 `zone` 中直接地调用这些函数，那将会怎样？

重要的是要理解，一个函数中的所有的同步或异步函数调用，都会在同一个指定的 `zone` 中。

我们知道总是有一个 `root zone`。因此，如果我们不使用 `run` 来切换 `zone` 的话，我们预计所有的函数调用都在 `root` 这个 `zone` 中。让我们来瞧瞧：

```ts
function c() {
    console.log(Zone.current.name);  // <root>
}
function b() {
    console.log(Zone.current.name);  // <root>
    c();
}
function a() {
    console.log(Zone.current.name);  // <root>
    b();
}
a();
```

哈，就是这个情况，下面是图：

{% include img.html src="https://zxh1989.oss-cn-qingdao.aliyuncs.com/personal-site/20191026-zonejs/1_LB_47YNH39VIWp-7T0IK3g.png" %}

如果我们只在 `a` 函数中使用 `zoneAB.run` ，`b` 和 `c` 将会在 `AB` 这个 `zone` 中得以只执行：

```ts
const zoneAB = Zone.current.fork({name: 'AB'});

function c() {
    console.log(Zone.current.name);  // AB
}

function b() {
    console.log(Zone.current.name);  // AB
    c();
}

function a() {
    console.log(Zone.current.name);  // <root>
    zoneAB.run(b);
}

a();
```

{% include img.html src="https://zxh1989.oss-cn-qingdao.aliyuncs.com/personal-site/20191026-zonejs/1_jRTcSKXREhGtjdiQiipK2w.png" %}

你可以看到我们显式地在 `AB zone` 中调用过了 `b` 函数，然而，`c` 函数也是在这个 `zone` 中执行。

### 在异步任务中持久 zone

JavaScript 开发的特点之一就是异步编程。许多刚入门的 `js` 开发者都会很熟练地使用 `setTimeout` 方法来延迟一个函数的执行。`Zone` 称 `setTimeout` 为异步任务，具体来说，是一个宏任务。另一批任务被叫做微任务，比如 `promise.then`。
这是浏览器专业术语，Jake Archibald 在文章[“Tasks, microtasks,queues and schedules.”](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/) 作出了深刻的解释。

让我们来看看 `Zone` 到底是如何处理像 `setTimeout` 这样的异步操作的。我们还是使用上面的代码，只是将对 `c` 的直接调用改为使用 `setTimeout` 来回调。这样，函数会在将来的某个时间点执行于一个独立的栈中。

```ts
const zoneBC = Zone.current.fork({name: 'BC'});

function c() {
    console.log(Zone.current.name);  // BC
}

function b() {
    console.log(Zone.current.name);  // BC
    setTimeout(c, 2000);
}

function a() {
    console.log(Zone.current.name);  // <root>
    zoneBC.run(b);
}

a();
```

我们上面已经提到，如果我们在一个 `zone` 中执行一个函数，那么所有在其中调用的函数将始终在这个 `zone` 中被执行。这个特点对于异步操作也是适用的。如果我们对一个异步操作指明了一个回调函数，那么它执行时所在的 `zone` 和任务发派时的 `zone` 是同一个。

因此，我们可以绘制出下面这个调用栈图：

{% include img.html src="https://zxh1989.oss-cn-qingdao.aliyuncs.com/personal-site/20191026-zonejs/1__lTVsXAh9_mFIr5QVrq8yA.png" %}

非常好！然而这个图隐藏了一些细节。在底层，`Zone` 必须为每个异步任务恢复到正确的 `zone`。欲如此，我们必须记住任务执行时理应所在的那个 `zone`，做法则是持有对 `zone` 的引用。这个 `zone` 将会用于在 `root zone` 中来对任务进行调用。

这意味着，每一个异步任务的回调都是从 `root zone` 开始的，它首先使用与任务相关的信息来恢复到正确的 `zone`，然后执行。下面这张图更为精确：

{% include img.html src="https://zxh1989.oss-cn-qingdao.aliyuncs.com/personal-site/20191026-zonejs/1_90FaJGpYiclfiBLRZLk0qg.png" %}

### 在异步任务之间传播数据

`Zone` 有很多有趣的性质，能够帮助到开发者。其中之一就是跨异步任务的数据转播功能。简单说，`Zone` 能够为一个 `zone` 挂载数据，然后在同一个 `zone` 环境下执行的异步任务里可以访问到。

让我们来结合一个例子，看看 `Zone` 是如何在 `setTimeout` 异步任务中持久数据的。正如我们之前了解到的，`forking` 一个新的 `zone`，需要传入一个 `spec` 对象，这里又一个可选项 `properties`。我们能用这个选项来为 `zone` 关联数据，像下面这样：

```ts
const zoneBC = Zone.current.fork({
    name: 'BC',
    properties: {
        data: 'initial'
    }
});
```

然后，我们使用 `zone.get` 方法访问数据：

```ts
function a() {
    console.log(Zone.current.get('data')); // 'initial'
}

function b() {
    console.log(Zone.current.get('data')); // 'initial'
    setTimeout(a, 2000);
}

zoneBC.run(b);
```

`properties` 对象是 `shallow-immutable` 的，这意味着你不能 添加/移除 它的属性。这很大程度上是因为 `Zone` 没有提供相应的方法来处理这些事。因此，上面的例子中，我们不能修改 `properties.data` 的值。

但是我们可以将 `data` 定义为一个对象，而非基本类型数据。这样，我们就可以修改里面的数据了：

```ts
const zoneBC = Zone.current.fork({
    name: 'BC',
    properties: {
        data: {
            value: 'initial'
        }
    }
});

function a() {
    console.log(Zone.current.get('data').value); // 'updated'
}

function b() {
    console.log(Zone.current.get('data').value); // 'initial'
    Zone.current.get('data').value = 'updated';
    setTimeout(a, 2000);
}

zoneBC.run(b);
```

还有一点很有意思，就是 `propetties` 的继承性。使用 `fork` 方法创建的 `zone` 继承了 `parent zone` 的 `properties` 中的内容。

```ts
const parent = Zone.current.fork({
    name: 'parent',
    properties: { data: 'data from parent' }
});

const child = parent.fork({name: 'child'});

child.run(() => {
    console.log(Zone.current.name); // 'child'
    console.log(Zone.current.get('data')); // 'data from parent'
});
```

### 跟踪异步任务

另一个特性，更为有趣的，就是 `Zone` 能够跟踪异步的宏任务或微任务。`Zone` 会将所有的异步任务放到一个队列里。要在这个队列的状态发生改变的时候，收到通知，你需要使用 `zone` 上的 `onHasTask` 钩子。下面是它的签名：

```ts
onHasTask(delegate, currentZone, targetZone, hasTaskState);
```

因为，`parent zones` 能够拦截到 `child zones` 的事件，`Zone` 提供了 `currentZone` 和 `targetZone` 参数来区别事件发生所在的那个 `zone` 和 接收事件通知的 `zone`。例如，如果你需要确定我拦截的是当前的这个 `zone`，只需比较这两个值：

```ts
// We are only interested in event which originate from our zone
if (currentZone === targetZone) { ... }
```

传入的最后一个参数是 `hasTaskState`， 它描述的是任务队列的状态，下面是它的签名：

```ts
type HasTaskState = {
    microTask: boolean; 
    macroTask: boolean; 
    eventTask: boolean; 
    change: 'microTask'|'macroTask'|'eventTask';
};
```

因此，如果我们在一个 `zone` 中调用了 `setTimeout` ，我们将收到下面这个对象：

```ts
{
    microTask: false,
    macroTask: true,
    eventTask: false,
    change: 'macroTask',
}
```

这表示，队列中存在一个 `pending` 状态的宏任务，队列状态的改变源自 `macrotask`。

我们来实际看看：

```ts
const z = Zone.current.fork({
    name: 'z',
    onHasTask(delegate, current, target, hasTaskState) {
        console.log(hasTaskState.change);          // "macroTask"
        console.log(hasTaskState.macroTask);       // true
        console.log(JSON.stringify(hasTaskState));
    }
});

function a() {}

function b() {
    // synchronously triggers `onHasTask` event with
    // change === "macroTask" since `setTimeout` is a macrotask
    setTimeout(a, 2000);
}

z.run(b);
```

得到如下输出：

```
macroTask
true
{
    "microTask": false,
    "macroTask": true,
    "eventTask": false,
    "change": "macroTask"
}
```

大概`2`秒之后，`timeout` 结束执行，`onHasTask` 再次触发：

```
macroTask
false
{
    "microTask": false,
    "macroTask": false,
    "eventTask": false,
    "change": "macroTask"
}
```

这里需要提醒一下，使用 `onHasTask` 我们只能跟踪整个任务队列的 `empty/non-empty` 状态的变化。你不能用它来跟踪单个任务的状态。如果你运行下边的代码：

```ts
let timer;

const z = Zone.current.fork({
    name: 'z',
    onHasTask(delegate, current, target, hasTaskState) {
        console.log(Date.now() - timer);
        console.log(hasTaskState.change);
        console.log(hasTaskState.macroTask);
    }
});

function a1() {}
function a2() {}

function b() {
    timer = Date.now();
    setTimeout(a1, 2000);
    setTimeout(a2, 4000);
}

z.run(b);
```

你将得到这样的结果：

```
1
macroTask
true

4006
macroTask
false
```

你可以看到这里没有出现 `2` 秒的那个定时任务的事件。`onHasTask` 在第一个 `setTimeout` 派发任务之后，由于队列由空变为非空，从而触发一次。在 `4` 秒的那个定时任务执行结束后，队列的状态由非空变为空，其再一次触发。

如果你想跟踪单个任务，你需要使用 `onSheduleTask` 和 `onInvoke` 这两个钩子。

#### onSheduleTask and onInvokeTask

`Zone spec` 定义了两个钩子函数，借此，你可以追踪每个任务的进度。

- **onScheduleTask**，检测到异步操作时（例如 `setTimeout`）执行。
- **onInvokeTask**，在异步的回调函数执行之后执行。

下面的代码使用了这两个钩子来追踪任务进度：

```ts
let timer;

const z = Zone.current.fork({
    name: 'z',
    onScheduleTask(delegate, currentZone, targetZone, task) {
      const result = delegate.scheduleTask(targetZone, task);
      const name = task.callback.name;
      console.log(
          Date.now() - timer, 
         `task with callback '${name}' is added to the task queue`
      );
      return result;
    },
    onInvokeTask(delegate, currentZone, targetZone, task, ...args) {
      const result = delegate.invokeTask(targetZone, task, ...args);
      const name = task.callback.name;
      console.log(
        Date.now() - timer, 
       `task with callback '${name}' is removed from the task queue`
     );
     return result;
    }
});

function a1() {}
function a2() {}

function b() {
    timer = Date.now();
    setTimeout(a1, 2000);
    setTimeout(a2, 4000);
}

z.run(b);
```

输出：

```
1 “task with callback ‘a1’ is added to the task queue”
2 “task with callback ‘a2’ is added to the task queue”
2001 “task with callback ‘a1’ is removed from the task queue”
4003 “task with callback ‘a2’ is removed from the task queue”
```

#### 通过 onInvoke 拦截 zone 的切换

一个 `zone` 会由于显式地调用了 `z.run` 或 隐式地调用一个任务而切成当前 `zone`。在上一节，我解释了 `onInvokeTask` 用于拦截内部执行异步任务的回调时导致的 `zone` 的切换。另一个钩子 `onInvoke`，你可用于监听`zone` 由执行 `run` 方法而发生的切换。

下面是一个用例：

```ts
const z = Zone.current.fork({
    name: 'z',
    onInvoke(delegate, current, target, callback, ...args) {
        console.log(`entering zone '${target.name}'`);
        return delegate.invoke(target, callback, ...args);
    }
});

function b() {}

z.run(b);
```

输出：

```
entering zone ‘z’
```

### `Zone.current` 的工作原理

当前 `zone` 保存在 `_currentZoneFrame` 的变量中。它被保存在一个闭包中，并在 `Zone.current` 的 `getter` 方法中返回。因此，要切换 `zone`，只需要简单地更新一下 `_currentZoneFrame`。现在你可以通过执行 `z.run` 或者调用一个任务来切换 `zone`。

下面的代码展示了 `run` 方法中给 `_currentZoneFrame` 赋值的操作：

```ts
class Zone {
   ...
   run(callback, applyThis, applyArgs,source) {
      ...
      _currentZoneFrame = {parent: _currentZoneFrame, zone: this};
```

对于 `runTask` 方法，赋值操作如下：

```ts
class Zone {
   ...
   runTask(task, applyThis, applyArgs) {
      ...
      _currentZoneFrame = { parent: _currentZoneFrame, zone: this };
```

`runTask` 方法在 `task` 的 `invokeTask` 方法中调用：

```ts
class ZoneTask {
    invokeTask() {
         _numberOfNestedTaskFrames++;
      try {
          self.runCount++;
          return self.zone.runTask(self, this, arguments);
```

每个任务被创建后，将 `zone` 保存在一个 `zone` 属性中。这个 `zone` 就是在将来执行任务回调时用到的 `zone`。

```ts
self.zone.runTask(self, this, arguments);
```

（完）
