---
layout: post
title: ES5创建Object的七种模式
short: ES5中创建Object的模式有很多，每一种模式诞生的背后都暗藏着创作者的经验与智慧，值得我们后人好好学习一下。本篇内容摘自《JavaScript高级程序设计（第三版）》
category: tech
---

### 工厂模式
工厂模式是软件工程领域一种极其常见的设计模式，这种模式抽象了创建具体对象的过程。考虑到在ES5中无法创建类，开发人员就发明了一种函数，用函数来封装以特定接口创建对象的细节，如下面的例子所示。
```js
function createPerson(name, age, gender) {
    var person = new Object();
    person.name = name;
    person.age = age;
    person.gender = gender;
    person.sayHello = function() {
        alert('Hello');
    };
    return person;
}

var person0 = createPerson('Singhi John', 29, 'male');
var person1 = createPerson('Ronnie O\'Sullivan', 45, 'male');
```

工厂模式可以无限次地创建拥有类似结构的数据对象，这正如它的名字——工厂。但是它的缺陷是无法确定对象的类型。由此，新的模式来了——构造函数模式

### 构造函数模式
ES5 中内置的构造函数有很多，如 Function、Array、Date、String、Number、Boolean、Object、RegExp等，使用它们的时候，我们一般用new关键字（有的也可不用），如：

```js
var arr = new Array(5);
arr[0] = 90;
arr[3] = 'Singhi'

var num = new Number(34); // typeof is object
var num1 = Number(34); // typeof is number
var num2 = 34;
console.log(num2 === num1); // true
console.log(num2 === num); // false
console.log(num2 == num); // true
```

ES6当中新增了很多内置构造函数，如 Promise、Proxy、Map、Set、WeakMap、WeakSet、Symbol等。

我们也可以在应用或库级别定义自己的构造函数。

构造函数也属于函数范畴，与功能函数比较主要在于用不用new关键字，使用了new关键字this的指向和返回值有所差别。
```js
function animal() {
    console.log(this.constructor.name);
}
// as a normal function
animal() // prints Window, returns undefined cuz animal has no return statement.

// as a construct function
new animal(); // prints animal, returns an object.
```

现在，我们来创建一个构造函数，还是拿上面的Person来示例。

```js
function Person(name, age, gender) {
    this.name = name;
    this.age = age;
    this.gender = gender;
    this.sayHello = function() {
        alert('Hello, World');
    }
}

var person0 = new Person('Singhi', 29, 'male');
var person1 = new Person('Ronnie', 43, 'male');
```

new 关键字所做的事并不特别，可拆分为以下4步：

1. 创建一个新对象 var o = new Object()
1. 将构造函数的作用域赋值给新对象，也就是让this指向o
1. 执行构造函数中的代码，使用 call 或 apply
1. 返回新对象

如此构建的对象，我们可以用 instanceOf 来判断其所使用的构造函数，如 person0 instanceOf Person 将返回 true。

构造函数模式的问题在于，方法不能在实例间共享！如上面定义的sayHello方法，每次我们实例化的时候，执行环境都会创建一个新的Function类型的对象（函数也是对象，使用new Function构造）。很明显，对着实例的增加，内存的消耗也将增加。然而这并不是我们想要的结果，我们希望方法能够在实例之间共享。

原型模式如是登场！

### 原型模式
什么是原型？我不想在此过多介绍，可以参考相关文档研究以下。

简单来说就是，每个对象都有一个`[[Prototype]]`属性，当然它对于我们编程不可见（可以用属性`__proto__`访问、或者用`Object.getPrototypeOf`），prototype指向另一个对象，假如 `o.__proto__` 是 oo，这看上去没什么的，要紧的是，当o和oo有了这层关系之后，o能够访问到oo的自有成员。原型模式就是利用这点来实现实例间成员共享的。

```js
var o = new Object();
var o1 = new Object();
var oo = {
    sayHello: function() {
        alert('Hello');
    }
};

o.__proto__ = oo;
o2.__proto__ == oo;

o.sayHello(); // we didn't define method sayHello, but it is there.
o1.sayHello(); // the same.

console.log(o.sayHello === o1.sayHello); // this will print true.
```

这特性有什么用？共享了成员啊。它让我们不必再在o和o1上定义sayHello方法，因此，只需要在原型oo上定义一遍就行了。

另外，关于原型，还有一个特性。每个函数都有一个prototype属性，它默认指向一个只有constructor属性的对象。每次new这个函数的时候，创建出来的对象，其原型就是这个函数的prototype。既然如此，我们就可以利用原型+构造函数模式产生出一个新的模式——原型模式。
```js
function Person(name, age, gender) {
    this.name = name;
    this.age = age;
    this.gender = gender;
}

Person.prototype.sayHello = function() {
    alert('Hello');
}

var person0 = new Person('Singhi', 29, 'male');
var person1 = new Person('Ronnie', 43, 'male');

console.log(person0.__proto__ === person1.__proto__); // this will print true.
console.log(person0.sayHello === person1.sayHello); // this also will print true.
```

至于原型链，网上的文档也是一大把，请您自己去查看、并理解。

在上面这个例子当中，我们只是将方法写到原型对象里了，值的话，我们并不想共享，因为每个实例都应该持有自己的数据——字段，而不是共享同一个。我们只需要将行为共享即可！

注意：《JavaScript高级程序设计》一书中，将原型模式视为将全部成员写入原型对象中（不管是数据还是方法），我这里所谓的原型模式恰巧是书中所谓的构造函数与原型混合模式。

动态原型模式
简单说一下这个玩意，如上面那段代码，我们将构造函数的实现和原型的定义分开了。这在许多C#、Java工程师的眼里会显得意外和不适应，因为在C#、Java的世界里，构造和原型应该是一体的，比如当你定义一个类的时候，你将构造、数据、方法放在一个代码块中，对不对？

动态原型模式就是为了迎合C#、Java工程师的书写习惯而生的，具体来说就像下边这样：

```js
function Person(name, age, gender) {
    this.name = name;
    this.age = age;
    this.gender = gender;
    if (typeof this.sayHello !== 'function') {
        Person.prototype.sayHello = function() {
            alert('Hello, World');
        }
    }
}

var person = new Person('Ronnie', 43, 'male');
person.sayHello();
```

可以看到，我们将对原型的定义放到一个条件代码块中，其实这就是个风格而已，没啥～

寄生构造函数模式
补充一下new关键字的使用方法，当你使用new来调用一个函数时，如果此函数没有return值（undefined），那么你将得到一个新的对象（参考上面的4步）；否则，返回的就是函数的return值。

寄生（parasitic）构造函数模式利用这点，来包装创建对象的过程，并在new的时候显得很像你是在构造一个对象，而不是单纯的工厂生成。

```js
function ET(name,age) {
    var person = new Person(name, age, 'male');
    person.isET = true;
    return person;
}

var et = new ET('Jack Ma',50);
console.log(et.isET); // prints true
```

看到了没？就是这样，我们要基于Person这个构造函数来创建一个新的构造函数——ET。

值得注意的是，您所创造出来的ET实例的原型并非是ET.prototype。

### 稳妥构造函数模式
道格拉斯·克罗克福德（Douglas Crockford）发明了 JavaScript 中的稳妥对象（durable objects）这个概念。所谓稳妥对象，指的是没有公共属性，而且其方法也不引用 this 的对象。稳妥对象最适合在一些安全的环境中（这些环境中会禁止使用 this 和 new），或者在防止数据被其他应用程序（如 Mashup 程序）改动时使用。稳妥构造函数遵循与寄生构造函数类似的模式，但有两点不同：一是新创建对象的 实例方法不引用 this；二是不使用 new 操作符调用构造函数。按照稳妥构造函数的要求，可以将前面的 Person 构造函数重写如下：
```js
function Person(name, age) {
    var o = new Object();
    o.myNameIs = function() {
        alert('my name is ' + name);
    };
    return o;
}

var person = Person('Mark Selby', 37);
person.myNameIs(); // my name is Mark Selby.
```

这显然就是JavaScript中著名的闭包用法啊。我们从外部传入的参数将被o.myNameIs函数所持有，我们只能通过它来访问name和age；除此之外，别无他法。

即使有其他代码会给这个对象添加方法或数据成员，但也不可能有别的办法访问传入到构造函数中的原始数据。稳妥构造函数模式提供的这种安全性，使得它非常适合在某些安全执行环境——例如，ADsafe（www.adsafe.org）和 Caja（http://code.google.com/p/google-caja/）提供的环境——下使用。

类似寄生构造函数模式，同样需要注意，构造出来的对象和构造函数没有任何关系，person不是Person的实例。
