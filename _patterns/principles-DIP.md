---
layout: post
date: 2019-09-03
short: High level modules should not depend upon low level modules. Both should depend upon abstractions. Abstractions should not depend upon details. Details should depend upon abstractions.
title: 依赖倒置原则（DIP）
sort: 20
category: tech
---

## 依赖倒置原则的定义

> High level modules should not depend upon low level modules. Both should depend upon abstractions. Abstractions should not depend upon details. Details should depend upon abstractions.

依赖倒置原则（Dependence Inversion Principle，DIP）是 Object Mentor 公司总裁罗伯特·马丁（Robert C.Martin）于 1996 年在 C++ Report 上发表的文章。

依赖倒置原则的原始定义为：_高层模块不应该依赖低层模块，两者都应该依赖其抽象；抽象不应该依赖细节，细节应该依赖抽象_（High level modules should not depend upon low level modules. Both should depend upon abstractions. Abstractions should not depend upon details. Details should depend upon abstractions）。其核心思想是：_要面向接口编程，不要面向实现编程_。

_依赖倒置原则是实现开闭原则的重要途径之一，它降低了客户与实现模块之间的耦合。_

由于在软件设计中，细节具有多变性，而抽象层则相对稳定，因此以抽象为基础搭建起来的架构要比以细节为基础搭建起来的架构要稳定得多。这里的抽象指的是接口或者抽象类，而细节是指具体的实现类。

使用接口或者抽象类的目的是制定好规范和契约，而不去涉及任何具体的操作，把展现细节的任务交给它们的实现类去完成。

## 依赖、倒置原则的作用

依赖倒置原则的主要作用如下：

- 依赖倒置原则可以降低类间的耦合性。
- 依赖倒置原则可以提高系统的稳定性。
- 依赖倒置原则可以减少并行开发引起的风险。
- 依赖倒置原则可以提高代码的可读性和可维护性。

## 依赖倒置原则的实现方法

依赖倒置原则的目的是通过要面向接口的编程来降低类间的耦合性，所以我们在实际编程中只要遵循以下 4 点，就能在项目中满足这个规则：

- 每个类尽量提供接口或抽象类，或者两者都具备。
- 变量的声明类型尽量是接口或者是抽象类。
- 任何类都不应该从具体类派生。
- 使用继承时尽量遵循里氏替换原则。

## 实例

### 依赖倒置原则在“顾客购物程序”中的应用

**分析**：本程序反映了 “顾客类”与“商店类”的关系。商店类中有 sell() 方法，顾客类通过该方法购物以下代码定义了顾客类通过T恤网店 TshirtShop 购物：

```ts
class Customer {
  shopping(shop: TshirtShop) {
    //购物
    console.log(shop.sell());
  }
}
```

但是，这种设计存在缺点，如果该顾客想从另外一家商店（如鞋网店 ShoesShop）购物，就要将该顾客的代码修改如下：

```ts
class Customer {
  shopping(shop: ShoesShop) {
    //购物
    console.log(shop.sell());
  }
}
```

顾客每更换一家商店，都要修改一次代码，这明显违背了开闭原则。存在以上缺点的原因是：顾客类设计时同具体的商店类绑定了，这违背了依赖倒置原则。解决方法是：定义“T恤网店”和“鞋网店”的共同接口 Shop，顾客类面向该接口编程，其代码修改如下：

```ts
class Customer {
  shopping(shop: Shop) {
    //购物
    console.log(shop.sell());
  }
}
```

这样，不管顾客类 Customer 访问什么商店，或者增加新的商店，都不需要修改原有代码了，其类图如图 1 所示。

{% include img.html src="//zxh1989.oss-cn-qingdao.aliyuncs.com/principles-DIP/3-1Q113131610L7.gif" title="顾客购物程序的类图" %}

程序代码如下：

```ts
const main = () => {
  const tshirtShop = new TShirtShop();
  const shoesShop = new ShoesShop();
  const customer = new Customer();
  console.log("顾客购买以下商品：");
  customer.shopping(tshirtShop);
  customer.shopping(shoesShop);
};

main();

interface Shop {
  sell(): string;
}

class TShirtShop implements Shop {
  sell() {
    return "T恤......";
  }
}

class ShoesShop implements Shop {
  sell() {
    return "鞋子.......";
  }
}

class Customer {
  shopping(shop: Shop) {
    console.log(shop.sell());
  }
}
```

程序的运行结果如下：

```sh
顾客购买以下商品：
T恤......
鞋子......
```