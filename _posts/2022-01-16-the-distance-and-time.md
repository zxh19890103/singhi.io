---
layout: post
title: 时间与距离
short: 这章我们要考虑下时间和距离的概念。我们强调过，物理学，甚或全部的科学，都基于观测
src: https://feynmanlectures.caltech.edu/I_05.html
---

### 前言

本文翻译自 Feynman 的物理学讲义，《距离与时间》一章。读完之后，基本颠覆了我对于时间和空间的认知！原来我们习以为常的东西竟然是如此的不可理解。

### 目录

- 运动
- 时间
- 微观时间
- 宏观时间
- 时间的单位与标准
- 宏观距离
- 微观距离
- 最后

### 运动

这章我们要考虑下时间和距离的概念。我们强调过，物理学，甚或全部的科学，都基于观测。人们可能也会说，物理科学发展至如今形态，很大程度上来说，源于我们对量化观测的重视。只有基于量化的观测，我们才能得到事物的数量关系，这正是物理学的核心。

许多人喜欢将物理学的发端溯至 350 年前 Galileo 所做的工作，并且称其为第一位物理学家。截止当时，对于运动的研究都是哲学性质的，它基于思辨，将概念强加于人心。多数的思辨归功于 Aristotle 和其它一些古希腊哲学家，他们称这个过程为“证明”。Galileo 是批判的，他做了一个关于运动的实验，是这样：他允许一个小球沿着一个斜面向下滚动，同时观察其运动。而且，Galileo 并非只观看小球的滚动，还测量了小球在一段时间内的滚动距离。

Galileo 在此所采用的距离测量方法在其之前就已经广为人知，但是对于时间的测量在当时还没有一个精确的方法，尤其是较短的时间。Galileo 后来发明了令人较为满意的钟（当然，不是我们现在所使用的），然而，他的第一个运动试验对于时间的记录借助的是他自己的脉搏。让我们来重复一下他的那个实验吧。

我们可以数着自己脉搏的跳动，同时观察小球向下滚动的路径：

一，二，三，四，五，六，七，八，...，

我们请一个朋友帮我们记录小球在每次计时的时刻所处的位置；由此，我们就测量到了小球从释放处滚下的距离：

一，二，三，...，

它们和计时节凑一致。Galileo 将他的观测结果总结为：假如小球在 1、2、3、4 、(自释放瞬间算起的时间) ... 被标记下了位置，这些标记对应的滚动距离（自释放处算起）与 1、4、9、16、... 这些数字成比例。今天我们会说`距离与时间的平方成比例`：

{% include img.html src="//zxh1989.oss-cn-qingdao.aliyuncs.com/2022-01-16-the-distance-and-time/1.png" title="小球在斜面上的滚动" %}

作为全部物理学的基础——运动学，它要处理的两个问题便是：

**“哪里发生？何时发生？”**

### 时间

让我们来考虑一下我们所说的时间意为何物。什么是时间？如果我们能够找到一个对时间的定义，那就非常好。Webster 把“一单位的时间”定义为“一个时间片段”，然而又将后者定义为“一单位的时间”，这看上去没有太多用处。或许我们应该说，时间是`当前正发生着的唯一的某个事物`🤔️，这个说法也未能给予我们更多说明。可能这样说也不错，如果我们承认时间是某种我们无从定义（在词典的意义上）的东西，而只是说它是某种我们既知的东西，就是：`我们以等待而逝去的`。

真正重要的事情不在于我们如何定义时间，而是如何测量它。测量时间的方法之一就是将某个重复进行一种固定动作的东西（某种具有周期性特征的东西）制作成工具。比如说，“昼”。“昼”看上去就是不断重复发生的事情。然而，当我们开始思考它的时候，你可能会问：“昼是周期性的吗？是固定节奏的吗？全部的昼是相等长度的吗？”当然，我们对此的确切印象是夏季的昼比冬季的昼要长。然而，有些冬季里的昼会显得特别的久，假如你那些天特别的无聊的话。你肯定曾听过某人说“该死，今天何以如此漫长也！”

然而似乎平均看来，昼是相等长度的。我们有什么办法来检验一下这个“看似”的结论吗——或进行邻值比较，或基于平均值？有一个办法，就是我们可以将其和某种周期性的现象进行比较。让我们来看看如何使用沙漏（⏳）来实施这个办法。使用沙漏，我们可以“创造”一种周期性发生的事件，只要我们让一个人日以继夜地站在它的旁边，在最后一把沙子流尽之后，将之翻转过来。

我们于是可以对这样的“翻转”动作进行计数，从当日早到次日早。我们将会看到，所得到的这个时间，也就是“小时”的个数（即：沙漏的翻转次数），并不每“天”相等。我们不应该信任太阳，或者沙漏，或者二者。片刻地思索之后，我们可能会想到，如果我们对“小时”的一次计数基于当日的正午到次日的正午（正午在这里不是指 12 点整，而是太阳在最高点的那个时刻），那么我们会发现，所得到的这个时间，也就是每一天的“小时”数就是相等的。

我们现在有信心说“小时”和“昼”均具有一个固定的周期，即：我们可以对时间进行等间距划分，虽然我们并不能*证明*二者是否“真”的具有周期性。有人或许会问是否可能有一个全能的存在，他对沙子的流速，于夜间减慢，而于昼间加快。我们的实验固然无法对这样的问题给出答案。我们所能够知道的是：一种节律总是能和另一种节律相适应。我们只能这样说，我们将时间定义于某种可见的周期性事件的基础之上了。

### 微观时间

现在，我们应该注意到，在验证“昼”的重复性的过程当中，有一个意外的收获。我们发现了一种方法，以更加精确地测量时间，精确度小于“一天”。我们发现了一种方法来对小段的时间进行计数。那么我们可以更进一步，能够测量出更小的时间间隔吗？

Galileo 阐明了这样一个事实：一个给定的钟摆，只要摆动的幅度足够小，那么它来和回所需的时间总是相同的。有一个测试，它对钟摆在一个小时内的摆动次数进行了统计观察，发现 Galileo 的结论是确凿无疑的。我们可以使用这个方法来定义“小时”。如果我们使用一个机械设备来计数摆动次数——且使之保持住这般工作——我们就有了一个摆钟，就是我们的祖父所使用的那种。

让我们假设，如果钟摆在一个小时之内摆动 3600 次（并且我们说 24 个这样的“小时”就是“一天”），我们就可以说钟摆的一个摆动周期就是“一秒”。我们于是就对原来的时间单位切分为近似 10<sup>5</sup> 个部分。我们可以使用相同的原则来对“秒”进行更细的切分。也就是，我门意识到，去制造一种高频率的钟摆并不现实，但是我门现在可以制造一个电子钟摆，它被称为“振荡器”，能够以非常小的摆动、周期性地产生事件。在这些电子振荡器中，可类比于机械钟摆的摆的，是来回"摆动"（方向的变化）的电流。

我们可以制造一系列的这样的电子振荡器，每一种都 10 倍快于前一种。我们通过计数新一代振荡器在前一代（较慢的）摆动周期内的摆动次数，来标定其规格。当振荡的周期小于一秒的时候，我们就不能不借助某种设备来观测了。其中一种设备就是电子束示波器，它类似于`时间的显微镜`。这种设备会在发光的显示屏上示出电流（或者电压）随时间变化的图线。通过依次将两路电流接入示波器，我们就可以首先绘出第一个电流的波形图，接着绘出另一个，如下图的两个图像：Fig-5-2。我们因此就可以确定，快振荡器在慢振荡器的一个周期内的波动次数。

{% include img.html src="//zxh1989.oss-cn-qingdao.aliyuncs.com/2022-01-16-the-distance-and-time/2.png" title="Fig. 5–2. 同一个示波器显示出的两个波形图，a 连的是较慢的那个振荡器，b 连的是较快的那个振荡器。" %}

借助现代电子技术，振荡器周期已经可以小于 10<sup>-12</sup> 秒，并且标定它们的方法（如上所述，通过比较的办法）基于我们的对时间单位的标准定义——秒。过去几年，随着“激光”技术的发明和完善，或者光波放大器，有可能制造出周期小于这个值的振荡器，但是标定的办法可能不同于以上，但是无疑它们将会被制造出来。

小于 10<sup>-12</sup> 的时间已经被测量出来，但是以不同的技术。事实上，我们这里使用了一种不同的时间的定义。其中之一就是通过观测一个移动物体上的两个事件的距离。比如说，如果一个移动的汽车的头灯先打开继而关闭，且我们知道它们在哪里打开，在哪里关闭，以及汽车移动得多快，我们便可以计算出亮灯所持续的时间。时间就是头灯所移动的距离除以汽车的速度。

最近几年，这样的技术已被用于测量 π0-meson 粒子的寿命。通过观察一个 π0-meson 粒子分裂之前在摄影感光乳剂（photographic emulsion）上留下的一小段轨迹，可以看到粒子（已知其运动速度是一个接近于光速的确定值）行走的距离平均大概是 10<sup>-7</sup> 米，它只存在了 10<sup>-16</sup> 秒。应该强调的是，我们这里对于时间使用的定义不同于以往，但只要没有对概念造成不一致就没什么问题。而我们对于这些定义时间的方式感到非常自信，它们完全是等效的。

通过进一步推广我们的技术——必要时包括定义——我们可以对更快变化的物理事件的时间进行推断。我们可以谈论原子核的振荡周期，我们可以谈论第二章中所提到的新发现的奇怪反射事件的"寿命"。它们完整的生命所占据的时间不过 10<sup>-24</sup> 秒，近似于光（其传播速度已知，且是宇宙间速度的极限）穿越氢原子（已知最小的东西）的核所需的时间。

更小的时间如何？时间在更小的尺度上存在吗？对于我们无可测量的更小尺度的时间，是否有谈论的意义？或者对此我们可能想象得出来——然而有什么可以在那么短的时间内发生呢？可能并没有吧。有一些非常开放的问题，你们可以大胆地提出来，也许接下来的二十年、三十年内就会有结论。

### 宏观时间

现在，让我们来看看长于“昼”的时间。测量宏观时间是容易的，我们只需要按天数数就可以了——只要有某人准备去这么数。首先我们发现了存在着的另一种天然的周期律——年，它大概是 365 天。我们也发现了自然有时候提供了一个常年运转的计数器，它们以树的年轮或者河床的沉淀物呈现出来。一些情况下，我们可以使用这些天然的记号来确定某个事件发生的时间。

当我们不能对年进行计数来测量宏观时间的时候，就必须寻找另一种办法。其中之一，也是最有效的，就是将放射性物质作为计时设备——钟。这样的情况下，我们没有周期性事件，就像“昼”和钟摆，但是存在一种新的“规律”。人们发现一个样本的放射量会在一个确定的时间里发生固定比例的衰减。如果绘制出一张图，来表示放射量对时间（比如，以天为单位）的函数，就会得到以下曲线 Fig 5-3。我们观察到如果放射量在 T 天（被称为“半衰期”）内减少到一半，那么它将会在下一个 T 天减少到四分之一，以此类推。在一个任意的时间间隔 t，有 t/T 个 “半衰期”，且剩下的放射量是 (1/2)<sup>t/T</sup>

{% include img.html src="//zxh1989.oss-cn-qingdao.aliyuncs.com/2022-01-16-the-distance-and-time/3.png" title="Fig. 5–3. 放射量随时间减少. 放射量在每一个“半衰期” T 内衰减一半" %}

如果我们得知一块物质，比如木头，在其形成的时候，包含的放射量为 A，然后我们又通过测量知道了它现在包含的放射量是 B，由此就可以计算出它的年龄 t，通过解以下方程：

(1/2)<sup>t/T</sup> = B/A.

幸运的是，有些时候我们能够知道一个物质在其形成时候的放射量。我们知道，比如说，二氧化碳在空气中包含有一个固定比例的放射性同位素 C14（eplenished continuously by the action of cosmic rays）。如果测量一个物质中含有的碳元素总量，我们又已知其中一定比例的量原本是 C14，因此我们就可以计算出最开始的量 A，通过以上公式。C14 的半衰期是 5000 年，经过细致的测量，我们可以计算得 20 个半衰期之后所剩下的放射量，因此就可以确定生长了 100000 年之久的有机物的年龄。

我们更想了解的是，并且我们也确实已经了解到，那些持续生存更久的东西。我们的多数知识源自对于有着各异半衰期的放射性同位素的测量。如果我们对一个有更长半衰期的同位素进行测量，就有能力去测量更长的时间。比如，Uranium（铀）有一个同位素，其半衰期是 10<sup>9</sup>  年，因此如果一块物质在 10<sup>9</sup> 年前形成，那么现在就只剩下一半的放射量。当 uranium 分裂时，它变为 lead（锂）。考虑以某种化学过程，形成于很久之前的一块石头，由于 lead 与 uranium 有着不同的化学性质，lead 将会出现在石头的某一部分，而 uranium 则在另一部分，二者将是呈分离的状态。如果我们今天看着一块这样的石头，它只包含了 uranium，那么现在我们可以测量到一特定比例的 uranium 和 lead。通过比较这些组成比例，我们就能分析出有百分之多少的 uranium 变为了 lead。以此方法，有些石头的年龄就被确定为几十亿年。对此方法进行推广，我们不使用某些石头，而是去看一下海洋里的 uranium 和 lead 的成分，在地球的范围平均采样，这样的办法确定（过去几年的事）了地球的年龄，他大概是 45 亿年。 

鼓舞人心的是，通过 uranium 同位素测量法，人们发现，地球的年龄和到达地球那些陨石的年龄一致。看上去地球就是由那些太空中漂浮的石头形成的，并且那些陨石，看上去非常像是余下的太空漂浮物。远在五十亿年前，宇宙开始形成。现在人们相信，我们的宇宙至少是在 100 - 120 亿年前形成的。我们不知道的是那之前发生了什么。事实上，我们的不禁再次问：这些问题有意义吗？更早的那些时间是否有某种意义？

{% include img.html src="//zxh1989.oss-cn-qingdao.aliyuncs.com/2022-01-16-the-distance-and-time/4.png" title="Times" %}

### 时间的单位与标准

我们暗示过，若一开始便采取标准时间单位将会非常方便，比如以“天”或者“秒”，且其它所有时间量均以表示为这些单位的倍数或者分数。那么我们应该使用什么作为时间的基本标准呢？我们应该采取人类的脉搏吗？如果我们比较各种脉搏，就会发现它们变化无常。那么比较两个时钟如何？你会发现它们变化不大。你或许会说，好吧，我们使用时钟作为标准吧。但是用谁的时钟呢？这里有个故事，一个瑞士男孩希望他镇子上所有的钟都在中午同时响起。因而，他四处奔走，尝试说服人们这件事的价值。人们都认为一旦其它人的钟与自己一同在中午响起，那会很神奇。非常难办的是，选择谁的钟为参考标准。幸运的是，我们共享着一个钟——地球。很长一段时间，地球的自转周期被当作时间的基本标准。随着测量技术的越发精确，使用最优的钟进行测量之后，人们发现地球的自转周期也不是那么确定。所谓“最优”的钟，就是那些我们有理由信任它们的精确性和彼此一致性的钟。现在我们相信，由于各种各样的原因，有些“天”的会比另外一些长一点，而有些较短，平均而言，地球的自转周期较几个世纪之前变长了一点点。

直到近代，我们依然发现没有什么比地球的周期更好用的“时间设备”了，因此所有的钟都相对“昼”的长度而言，且“秒”被定义为 `1/86400` 平均天。最近，我们获得了一些自然振荡器方面的经验，对于其中有些，现在相信其能够提供更加稳固的时间参考，这是相较于地球这个钟来说。它同样基于每个人都经历的自然现象，就是所谓的“原子钟”。基本的内部周期发自原子的振动，它对温度或其它外界环境几乎毫无反应。这些钟将时间的精度保持在 10<sup>9</sup>分之一秒，甚至更高。过去的两年，一种改善过的原子钟由哈弗大学的 Norman Ramsey 教授设计出来，它基于氢原子的振动。Norman Ramsey 相信这款钟可能百倍精确。测量工作正在进行中，它将揭示 Norman Ramsey 的信念的真伪。

我们或许可以期许着，一旦有可能制造出比天文钟更加精确的钟，很快科学家们就会对“基于某个原子钟来对时间进行标准定义”表达一致赞成。

### 宏观距离

让我们转向另一个问题，关于距离。一个东西有多远，或者多大？每个人知道测量一个距离的办法就是使用一把尺子在空间中反复丈量并计数，或者使用拇指也可以吧。这里你到底使用了“单位”来计数。如何测量很小的物体呢？如何对一段距离进行划分？使用与切分时间相同的办法：我们使用一个很小的单位，覆盖更大的单位，数出需要总个数。由此，我们就可以测量出越来越小的长度。

但是我们并不总是将距离理解为对于米尺的计数。想使用米尺测量两个山峰的水平距离是困难的。我们由经验已经看到，距离可以借助另一个有名的方式来测量，那就是“三角学测量法”。虽然我们确实使用了另一种对于距离的定义，但只要两种方式可以达成一致就不存在问题。空间多少就是如 Euclid 所想的那样，因此这两种测量方式基本吻合。由于在地球尺度上看二者也是吻合的，因此我们有了充分的自信去使用三角法来测量大距离。比如，我们可以使用三角法测量一个地球卫星的高度。我们发现它大约是 5x10<sup>5</sup> 米。对于地月距离的更为精细的测量也是用这样的办法。在地球表面，分别在两个地点放置一个望远镜，就可以得到我们所需的两个角度数。使用这样的办法，我们测得的月球大约离我们 4x10<sup>8</sup> 米远。

{% include img.html src="//zxh1989.oss-cn-qingdao.aliyuncs.com/2022-01-16-the-distance-and-time/5.png" title="Fig. 5–4. 使用三角学测量确定了人造地球卫星的高度" %}

我们无法对太阳也这么做，或者至少迄今没人做到过。聚焦太阳上的一点以取得的角度，其精度不足以支持我们对于太阳距离的测量。那么我们该如何测量这个距离呢？我们必须扩展一下三角学思想。我们通过对行星出现位置的观测，得到的是每一个行星的相对距离，而非绝对的距离。需要测量出其中某颗行星的绝对距离才行，我们已经有了若干方式。其中之一，直到最近才被认为是最精确的，那就是测量地球到 Eros 的距离，Eros 是一颗小行星，它会不时旁经地球。对 Eros 使用三角学，人们可以得到一个必要的测量值。考虑到其它行星的相对距离都是已知的，那么就可以得到各自的绝对距离。比如，从地球到太阳，或者从地球到 Pluto（冥王星）。

近几年，对太阳系尺度的认知已经有了很大的提升。在 JPL（Jet Propulsion Laboratory），地球到 Venus 的距离通过雷达得以相当精确地测量。当然，这又是另一种对于距离的推演。这里意味着，首先我们知道光在空间中的传播速度，然后假设它在地球和 Venus 之间的空间中传播的速度也总是这个值。我们发射一束无线电波出去，然后计数它反射回来的时间，通过时间来推断距离，假设我们已知其传播速度。如此，我们确实有了另一种对于距离测量的定义。

我们如何测量到一颗恒星的距离呢？恒星是非常遥远的。有幸的是，我们可以回到三角法测量，因为地球围绕太阳的公转给我们提供了一个很大的基线，以测量出太阳系外星体的距离。如果我们分别在夏季和冬季把望远镜聚焦到一颗恒星上，就有希望确定两个角度，其精度足够测量出恒星的距离。

{% include img.html src="//zxh1989.oss-cn-qingdao.aliyuncs.com/2022-01-16-the-distance-and-time/6.png" title="Fig. 5–5. 使用地球轨道基线，可以使用三角法测量到恒星的距离" %}

如果两个恒星的距离太远，以至于我们无法使用三角法呢？天文学家总是在发明新的测量方法。他们注意到，比如说，可以由恒星的颜色估计出它的大小和亮度。很多近距恒星——其距离都通过三角法测量得到——的颜色和亮度都已经被测量出来，由之发现了星体的颜色和固有亮度与距离存在一个一般的关系（很大程度上）。如果有人现在测量得一个远距离恒星的颜色，他就可以使用颜色-亮度关系来计算其固有亮度。通过测量它在地面的观测亮度（或者我们应该说它看上去的暗度），就可以计算得它离我们有多久。（因为，给定一个固定亮度，感官亮度随着距离的平方线性递减。）对此测量恒星距离的方法的有效性的确证，源自对于一个星团的观测结果，此星团被称为 globular 簇。其中一个团的照片如下图 Fig 5-6。通过观察这张照片，你可以确信的是这些星星都是在一起的。使用颜色-亮度关系法测量的距离数据给出了相同的结果。

{% include img.html src="//zxh1989.oss-cn-qingdao.aliyuncs.com/2022-01-16-the-distance-and-time/7.png" title="Fig. 5–6. 处于我们银河系中心的一个星簇，它们离地球 30,000 光年——大约是 3 x 10<sup>20</sup> 米" %}

对于大量 globular clusters 的研究，也提供了另一个重要的信息。这些星簇高度集中于天空中的确定的一处，而且它们往往距离我们差不多远。结合其它的一些证据，我们得出结论，集中的星簇就是我们银河系的中心。我们于是知道了银河系的中心距离——大约 10<sup>20</sup> 米。

知道了我们的银河系的尺寸，我们就可以测量更大的距离了——到其它星系的距离。图 5-7 就是某个星系的照片，它和我们自己的银河系非常像，也许还是相同的大小。（其它证据支持了“所有星系一般大”的观点。）如果它和我们的星系一般大，我们就可以知道其距离。我们可测量它在天空中展开的夹角，我们也知道它的直径，因此就可以计算它的距离——还是使用三角法测量！

{% include img.html src="//zxh1989.oss-cn-qingdao.aliyuncs.com/2022-01-16-the-distance-and-time/8.png" title="Fig. 5–7. 一个类似银河系的涡旋星系.  假设它的直径和银河系差不多，我们由其感官尺寸可以计算出它和地球的距离，是 30 million 光年（3 x 10<sup>23</sup> 米）" %}

最近，很多极度遥远的星系也被超级 Palomar 望远镜拍摄到了。图 5-8 是其中之一。可以相信的是，它们中的有些星系远在宇宙尺寸——10<sup>26</sup> 米——的一半的距离，这样的距离我们无法企及。

{% include img.html src="//zxh1989.oss-cn-qingdao.aliyuncs.com/2022-01-16-the-distance-and-time/9.png" title="Fig. 5–8.最遥远的星系 3C 295 in Boötes (箭头所指), 由 200-inch 口径的望远镜所观测 (1960 年)." %}

### 微观距离

现在让我们来考虑微观距离或者小距离。对一米的长度进行划分是容易的，不费多大力气，我们就可以将一米的距离划分为一千份。使用类似的方式（借助一个好的显微镜），只是稍微困难一点，我们可以继续将一毫米的空间划分为一千等份，以得到微米的尺度（一米的百万分之一）。继续分下去会比较难，因为我们“看不见”比可见光的波长（大约 5 x 10<sup>-7</sup> 米）还短的东西。

{% include img.html src="//zxh1989.oss-cn-qingdao.aliyuncs.com/2022-01-16-the-distance-and-time/10.png" title="Fig. 5–9. 电子显微镜下的病毒细胞。其中“较大”些的球状物是对照物，其直径是 2 x 10 <sup>-7</sup> 米" %}

然而我们不能满足于“看见”我们能看得见的东西。借助电子显微镜，我们可以继续我们的微观之旅，制作出对更微小的尺度的影像，比如达到 10<sup>-8</sup> 米。使用间接测量——借助一种微观尺度下的三角学——我们可以继续测量到更小的尺寸。首先，短波光（X 射线）经一个已知间隙的条纹标记物（是什么仪器？🤔️）反射，观察其行为之后，我们可以确定光线振动的波长。然后，我们让这些光通过某个晶体所形成的分离条纹，可以确定晶体中的原子的相对位置，这样的结果与通过化学手段得到的原子尺寸相当一致。我们看到，通过这样的办法，原子的直径大约是 10<sup>-10</sup> 米。

在经典的原子的 10<sup>-10</sup> 米级尺度与原子核的 10<sup>-15</sup> 米级尺度之间，存在一个巨大的“鸿沟”，后者大约要小 10<sup>-5</sup> 倍。对于原子核的尺寸的测量，需要采取一种特别的方式比较合适。我们测量一个可观的面积，σ，被称作有效覆盖面。如果我们希望得到半径，我们可以同过公式 `σ=πr^2` 获得，因为核非常接近球状。

对核的覆盖面测量法可以这样实施，让一束高能粒子通过一张薄薄的障碍物，并观测未能通过此障碍物的那些粒子。这些高能粒子将会穿过较薄的电子云层，而会被重核挡下或者被改变方向。假设我们我们的障碍物为 1 厘米厚，大约有 10 <sup>8</sup> 个原子层。但是原子核是如此微小，很难说它们会两两相邻。我们或许可以对此想象出一个放大的图像——跟随粒子束的方向，它看起来如下图这般：

{% include img.html src="//zxh1989.oss-cn-qingdao.aliyuncs.com/2022-01-16-the-distance-and-time/11.png" title="一副设想的图景，一厘米厚的碳物质块，假设只能看到原子核" %}

一个非常小的粒子击中核的机会就是核所占的面积除以障碍物的总面积。假设我们已知障碍物的总面积为 `A`，一共有 `N` 个原子（当然，每一个原子包含一个核），那么核所占面积比例就是 `Nσ/A`。现在设粒子束中粒子的数量为 `n1`，穿透障碍物的粒子数量为 `n2`，那么未能穿透障碍物的粒子数比例就是 `(n1−n2)/n1`，这个值应该刚好与前面的核的面积占比相等。我们由此得到了核的半径，通过以下公式：

{% include img.html src="//zxh1989.oss-cn-qingdao.aliyuncs.com/2022-01-16-the-distance-and-time/12.png" title="EQ" %}

通过这个实验，我们发现核的半径大概是 1~6 乘以 10<sup>-15</sup> 米，这个 10<sup>-15</sup> 米长度被称为飞米（fermi），因 Enrico Fermi （1901-1954）而得名。

如果遇到更小的距离怎么办呢？我们是否能测量出来？这个问题目前不可回答。有人认为这个关于核力的未解之谜，需要等到我们对于微观空间或测量的观念作出一番改变之后方能得以解决。

{% include img.html src="//zxh1989.oss-cn-qingdao.aliyuncs.com/2022-01-16-the-distance-and-time/13.png" title="尺度图" %}

也许使用一个自然存在的长度作为空间单位是个不错的主意——比如说，使用地球的半径，或者它的某个比例。单位米起初就是使用了  (π/2)×10<sup>-7</sup> 倍地球的半径，然而，这不怎么方便，也不那么精确。很长一段时间内，人们统一使用法国某个实验室里的一根杆的两端的长度作为米的单位。直到最近，人们意识到这个定义既不精确，也不那么稳定。最近人们又考虑采用一种新的方式来定义长度单位，它基于某个谱线的波长的一个一致认定的（任意的）倍数。

### 最后

对距离和时间的测量结果取决于观测者。两个相对移动着的观测者对于同一段距离和时间的测量会得出不同的结果。距离和时间间隔具有不同程度的放大，这取决于测量系统（或者“参考系”）。我们将会在下一章里学习到这些东西。

对距离和时间的完全精确的测量是不可能的，这是自然律所限制的。我们曾提到过，对位置的测量误差至少是以下值：

Δx≥ℏ/2Δp,

其中，`ℏ`是一个很小的基本物理量，称为`演绎的 Planck 常量`，`Δp` 是一个物体的动量的测量误差。我们也提到过，对于位置的测量的不确定性和粒子的波动性有关。

时空相对性理论暗示了时间测量也存在一个最小误差，它由以下公式给出：

Δt≥ℏ/2ΔE,

其中，`ΔE` 是一段过程中，我们对能量的观测结果的误差。如果我们希望更加精确地知道正在发生的事情，那么就意味着我们对之知道得就更少，因为我们必须减少对能量观测的行为。时间的不确定同样有关于物质的波动性。