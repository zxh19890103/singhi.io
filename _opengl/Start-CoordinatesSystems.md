---
layout: bookdetail
chapter: 九
short: 我們現在知道如何創建物件，為它們上顏色，以及如何使用紋理為它們的外觀填充細節
description: 我們現在知道如何創建物件，為它們上顏色，以及如何使用紋理為它們的外觀填充細節
title: 开始 &bull; 座標系統
category: tech
src: https://learnopengl.com/Getting-started/Coordinate-Systems
date: 2025-06-11
math: 1
book: opengl
editing: 1
image: https://learnopengl.com/img/getting-started/orthographic_frustum.png
---

In the last chapter we learned how we can use matrices to our advantage by transforming all vertices with transformation matrices. OpenGL expects all the vertices, that we want to become visible, to be in normalized device coordinates after each vertex shader run. That is, the x, y and z coordinates of each vertex should be between -1.0 and 1.0; coordinates outside this range will not be visible. What we usually do, is specify the coordinates in a range (or space) we determine ourselves and in the vertex shader transform these coordinates to normalized device coordinates (NDC). These NDC are then given to the rasterizer to transform them to 2D coordinates/pixels on your screen.

在上一章，我們了解了如何使用矩陣作為武器，來實現對頂點的轉換。對於那些你希望被渲染在屏幕上的頂點，OpenGL 希望它們在跑完 shader 代碼之後，全部落在**標準設備座標**（NDC）空間。也就是說，每個頂點的 x、y、z 座標都應該落在 -1.0 到 +1.0 之間；對於此範圍之外的點，它們將無法被看到。我們通常的做法是，在一個範圍（或者空間）裡指定一個座標系，這個這座標系由我們自己來決定，然後在頂點著色器裡，轉換頂點座標為標準設備座標。接著這些 NDC 會被交給光珊，以將它們轉換為屏幕上的 2D 座標/像素。

Transforming coordinates to NDC is usually accomplished in a step-by-step fashion where we transform an object's vertices to several coordinate systems before finally transforming them to NDC. The advantage of transforming them to several intermediate coordinate systems is that some operations/calculations are easier in certain coordinate systems as will soon become apparent. There are a total of 5 different coordinate systems that are of importance to us:

將座標轉換為 NDC 通常是一步一步來完成的，其中，我們會將一個物件的頂點轉換到若干個座標系統，最終才是 NDC 系統。經過若干個座標系統轉換的好處是，某些操作/計算只在特定座標系統才更容易，我們馬上就可以看到。一共有 5 個不同的座標系統，它們對我們來說是重要的：

- Local space (or Object space)
- World space
- View space (or Eye space)
- Clip space
- Screen space

- 本地空間（或者，物件空間）
- 世界空間
- 視圖空間（或者，視覺空間）
- 裁剪空間
- 屏幕空間

Those are all a different state at which our vertices will be transformed in before finally ending up as fragments.

這些都是頂點在最終變成片段（fragments）之前所經歷的不同轉換階段。

You're probably quite confused by now by what a space or coordinate system actually is so we'll explain them in a more high-level fashion first by showing the total picture and what each specific space represents.

到目前，你或許對這些**空間**或者**座標系**實際是什麼感到有些困惑。那麼我們會站在一個更高的層次來對它們進行解釋，先展示一張全局圖，然後說一下每一個空間所代表的含義。

## 全局圖

To transform the coordinates from one space to the next coordinate space we'll use several transformation matrices of which the most important are the model, view and projection matrix. Our vertex coordinates first start in local space as local coordinates and are then further processed to world coordinates, view coordinates, clip coordinates and eventually end up as screen coordinates. The following image displays the process and shows what each transformation does:

要將座標從一個空間轉換到下一個空間，我們將使用到幾個轉換矩陣，其中最重要的是 Model、View 和 Projection 矩陣。我們的頂點座標首先處在本地空間，作為本地座標存儲，然後會被處理成世界座標、視圖座標、裁剪座標，以及最終的屏幕座標。下面這張圖顯示了整個處理流程以及每個轉換都做了什麼：

![Coordinates Systems](https://learnopengl.com/img/getting-started/coordinate_systems.png)

1. Local coordinates are the coordinates of your object relative to its local origin; they're the coordinates your object begins in.
2. 本地座標就是你物件相對它本地原點的座標，它們是物件所在座標的開始。
3. The next step is to transform the local coordinates to world-space coordinates which are coordinates in respect of a larger world. These coordinates are relative to some global origin of the world, together with many other objects also placed relative to this world's origin.
4. 接下來的一步是將本地座標轉換為世界空間座標，這些座標相對一個更大的世界。它們相對這個世界的一個原點，很多其它物件也會相對整個世界原點被放進來。
5. Next we transform the world coordinates to view-space coordinates in such a way that each coordinate is as seen from the camera or viewer's point of view.
6. 接下來，我們將世界座標轉換為視圖空間座標，其中，每一個座標都是從相機或者觀察者的眼睛出發被看到的。
7. After the coordinates are in view space we want to project them to clip coordinates. Clip coordinates are processed to the -1.0 and 1.0 range and determine which vertices will end up on the screen. Projection to clip-space coordinates can add perspective if using perspective projection.
8. 在座標放進視圖空間之後，我們還需要將它們投射成裁剪座標。裁剪座標會被處理為 -1.0 到 1.0 之間，它們決定了那些頂點最終會被顯示在屏幕上。如果使用了透視投射，裁剪空間便有了透視效果。
9. And lastly we transform the clip coordinates to screen coordinates in a process we call viewport transform that transforms the coordinates from -1.0 and 1.0 to the coordinate range defined by glViewport. The resulting coordinates are then sent to the rasterizer to turn them into fragments.
10. 最後，我們將裁剪座標轉換為屏幕座標，這裡我們採取了一個被稱為視窗轉換的處理，它將座標從 -1.0 到 1.0 轉換到 glViewport 定義的座標範圍。最終的座標被發送到光珊，被變為片元（fragments）

You probably got a slight idea what each individual space is used for. The reason we're transforming our vertices into all these different spaces is that some operations make more sense or are easier to use in certain coordinate systems. For example, when modifying your object it makes most sense to do this in local space, while calculating certain operations on the object with respect to the position of other objects makes most sense in world coordinates and so on. If we want, we could define one transformation matrix that goes from local space to clip space all in one go, but that leaves us with less flexibility.

你或許對這些空間的用途有了一些了解。至於我們為什麼要將頂點依次放入這些空間，那是因為，在特定座標系統中進行一些操作會顯得更容易。比如，當我們要修改物件本身時，在本地空間進行是非常合適的；當基於其它物件進行一些計算的時候時候，放在世界座標系下進行會更合理；如此等等。如果我們願意，我們也可以定義一個轉換矩陣，它包含了從本地空間到裁剪空間的全部轉換，然而，這樣會讓我們失去靈活性。

We'll discuss each coordinate system in more detail below.

我們現在來對每一個座標系進行詳細的討論。

## 本地空間（Local Space）

Local space is the coordinate space that is local to your object, i.e. where your object begins in. Imagine that you've created your cube in a modeling software package (like Blender). The origin of your cube is probably at (0,0,0) even though your cube may end up at a different location in your final application. Probably all the models you've created all have (0,0,0) as their initial position. All the vertices of your model are therefore in local space: they are all local to your object.

本地空間是相對物件而言的座標空間，也就是物件一開始所出的空間。設想一下，你使用一個模型軟件（像 Blender）創建了一個方塊。這個方塊的原點可能是在位置 $(0,0,0)$，雖然在最終應用運行的時候，它可能出現在一個不同的位置。可能你創建的全部模型都是使用 $(0,0,0)$ 作為起始位置。模型中的全部頂點因此在本地空間：它們（頂點）對於物件全是局部的。

The vertices of the container we've been using were specified as coordinates between -0.5 and 0.5 with 0.0 as its origin. These are local coordinates.

對於我們在使用的箱子，它的頂點座標都在 -0.5 到 0.5 之間，0.0 是它的原點。它們因此都是本地座標，或者叫做局部座標。

## 世界空間（World space）

If we would import all our objects directly in the application they would probably all be somewhere positioned inside each other at the world's origin of (0,0,0) which is not what we want. We want to define a position for each object to position them inside a larger world. The coordinates in world space are exactly what they sound like: the coordinates of all your vertices relative to a (game) world. This is the coordinate space where you want your objects transformed to in such a way that they're all scattered around the place (preferably in a realistic fashion). The coordinates of your object are transformed from local to world space; this is accomplished with the model matrix.

如果我們將所有的物件導入到應用，它們可能會被放置在世界的中心位置 (0,0,0)，並相互重疊，這並不是我們想要的結果。我們需要為每一個物件定義一個位置，這個位置相對於整個世界座標系的。世界空間裡的座就是如它的名字那樣：你的所有頂點座標都是相對一個（遊戲）世界的。這正是你想將你的物件變換到的那個座標系統，物件分散其中（最好以一種真實的方式呈現）。你的物件的座標從本地轉換到世界空間，這一步是由 Model Matrix 完成。

The model matrix is a transformation matrix that translates, scales and/or rotates your object to place it in the world at a location/orientation they belong to. Think of it as transforming a house by scaling it down (it was a bit too large in local space), translating it to a suburbia town and rotating it a bit to the left on the y-axis so that it neatly fits with the neighboring houses. You could think of the matrix in the previous chapter to position the container all over the scene as a sort of model matrix as well; we transformed the local coordinates of the container to some different place in the scene/world.

Model Matrix 是一種轉換矩陣，它對你的物件進行平移、縮放以及旋轉，從而放置到世界的某個位置，以它需要的朝向。考慮一個房子，我們對它進行縮小轉換（它在本地看上去太大了），然後平移至郊外的一個鎮子上，並在沿著 Y 軸稍稍向左旋轉一點，這樣它和其它相鄰的房子排列的更和諧。你可能想到了上一章出現的那個矩陣，它將箱子擺到整個場景一個位置上，那個矩陣也是一種 Mode Matrix。我們將箱子的本地座標轉換到場景/世界的某個位置。

## 視圖空間（View space）

The view space is what people usually refer to as the camera of OpenGL (it is sometimes also known as camera space or eye space). The view space is the result of transforming your world-space coordinates to coordinates that are in front of the user's view. The view space is thus the space as seen from the camera's point of view. This is usually accomplished with a combination of translations and rotations to translate/rotate the scene so that certain items are transformed to the front of the camera. These combined transformations are generally stored inside a view matrix that transforms world coordinates to view space. In the next chapter we'll extensively discuss how to create such a view matrix to simulate a camera.

視圖空間就是人們常常提及的 OpenGL 相機（它有時候也會被稱為相機空間或者眼睛空間）。視圖空間（View Space）是將物體的世界空間座標轉換為相對於使用者視角前方的座標系之後所形成的空間。它因此也就是從相機的位置觀察時產生的空間。這通常是透過平移與旋轉的組合來實現的，目的是將場景中的某些物件轉換到攝影機前方的位置。這些轉換組合通常保存在視圖矩陣裡，它將世界座標轉到視圖空間。下一章我們會全面地討論如何創建這樣一個視圖矩陣，以模擬一個相機。

## 裁剪空間（Clip space）

At the end of each vertex shader run, OpenGL expects the coordinates to be within a specific range and any coordinate that falls outside this range is clipped. Coordinates that are clipped are discarded, so the remaining coordinates will end up as fragments visible on your screen. This is also where clip space gets its name from.

在每一個頂點著色器運行的結尾，OpenGL 期望座標落在某一個範圍之內，範圍之外的座標將被裁剪掉。爾裁剪掉的座標將被丟棄，這樣，餘下的座標將作為片段呈現在你的屏幕上。這也就是裁剪空間之所以稱為裁剪空間的原因。

Because specifying all the visible coordinates to be within the range -1.0 and 1.0 isn't really intuitive, we specify our own coordinate set to work in and convert those back to NDC as OpenGL expects them.

由於直接把所有可見物體的座標限制在 -1.0 到 1.0 之間並不直觀，我們通常會在一個自定義的座標系中工作，最後再將座標轉換成 OpenGL 所要求的 NDC（Normalized Device Coordinates）範圍。

To transform vertex coordinates from view to clip-space we define a so called projection matrix that specifies a range of coordinates e.g. -1000 and 1000 in each dimension. The projection matrix then converts coordinates within this specified range to normalized device coordinates (-1.0, 1.0) (not directly, a step called Perspective Division sits in between). All coordinates outside this range will not be mapped between -1.0 and 1.0 and therefore be clipped. With this range we specified in the projection matrix, a coordinate of (1250, 500, 750) would not be visible, since the x coordinate is out of range and thus gets converted to a coordinate higher than 1.0 in NDC and is therefore clipped.

要將頂點座標從視圖空間轉到裁剪空間，我們定義一個所謂的投影矩陣，它將每個緯度的座標範圍指定在 -1000 到 1000 之間。透視矩陣然後會將這個範圍裡的座標轉換為標準設備座標 $(-1.0, 1.0)$ （並非直接完成，其中包含一步，叫做透視除法）。範圍之外的座標將不會被映射到 -1.0 到 1.0，也就是被裁剪掉了。這個範圍我們也會在透視矩陣裡指定，座標 (1250, 500, 750) 將不會出現，因為 其 x 座標超出範圍，轉換出來的值將超過 NDC 的 1.0 ，因此被裁剪掉。

{% include box.html color="green" content="

Note that if only a part of a primitive e.g. a triangle is outside the clipping volume OpenGL will reconstruct the triangle as one or more triangles to fit inside the clipping range.

請注意，如果一個圖元（例如三角形）只有部分超出裁剪體積，OpenGL 會將該三角形重新構建為一個或多個三角形，使其完全落在裁剪範圍內。

" %}

This viewing box a projection matrix creates is called a frustum and each coordinate that ends up inside this frustum will end up on the user's screen. The total process to convert coordinates within a specified range to NDC that can easily be mapped to 2D view-space coordinates is called projection since the projection matrix projects 3D coordinates to the easy-to-map-to-2D normalized device coordinates.

投影矩陣創建出來的視圖盒子被稱為視椎，落在此視椎裡的每一個座標都最終會呈現在用戶的屏幕裡。整個將特定範圍裡的座標轉為 NDC （可以很容易被映射到 2D 視圖空間）的處理被稱為投影，因為投影矩陣將 3D 座標投射為方便映射 2D 的標準設備座標。

Once all the vertices are transformed to clip space a final operation called perspective division is performed where we divide the x, y and z components of the position vectors by the vector's homogeneous w component; perspective division is what transforms the 4D clip space coordinates to 3D normalized device coordinates. This step is performed automatically at the end of the vertex shader step.

一旦全部的惡頂點被轉換到裁剪空間，最後一步——透視除法——會被執行，其中我們將 x、y、z 分量分別除以向量的齊次座標 w 分量。透視除法用於對 4D 裁剪空間座標轉換為 3D 標準設備座標。這一步在頂點著色器的最後自動被執行。

It is after this stage where the resulting coordinates are mapped to screen coordinates (using the settings of glViewport) and turned into fragments.

這個階段之後，最終的座標會被映射到屏幕座標（使用 glViewport 的設置），並轉變為片元（fragments）。

The projection matrix to transform view coordinates to clip coordinates usually takes two different forms, where each form defines its own unique frustum. We can either create an orthographic projection matrix or a perspective projection matrix.

這種負責將視圖空間座標轉為裁剪空間座標的投影矩陣通常有兩種形式，各自都會定義自己的視椎。我們可以創建一個正交投影矩陣（orthographic projection matrix）或者一個透視投影矩陣（perspective projection matrix）。

### 正交投影（Orthographic projection）

An orthographic projection matrix defines a cube-like frustum box that defines the clipping space where each vertex outside this box is clipped. When creating an orthographic projection matrix we specify the width, height and length of the visible frustum. All the coordinates inside this frustum will end up within the NDC range after transformed by its matrix and thus won't be clipped. The frustum looks a bit like a container:

正交投影定義了一個立方體形的椎體盒子，它指定了裁剪空間，其中盒子之外的頂點都將被裁剪掉。當創建一個正交投影矩陣的時候，我們指定視椎的寬、高和長度。所有落在視椎內的座標經過轉換最終都會在 NDC 範圍裡，因而不會被裁剪。這個椎體看上去像一個箱子：

![Orthograhic Frustum](https://learnopengl.com/img/getting-started/orthographic_frustum.png)

The frustum defines the visible coordinates and is specified by a width, a height and a near and far plane. Any coordinate in front of the near plane is clipped and the same applies to coordinates behind the far plane. The orthographic frustum directly maps all coordinates inside the frustum to normalized device coordinates without any special side effects since it won't touch the w component of the transformed vector; if the w component remains equal to 1.0 perspective division won't change the coordinates.

通過指定寬、高，near 和 far 平面，椎體確定可見的座標。任何座標，如果它在 near 平面之前，它會被裁剪掉，對於 far 平面之後的座標，情況也一樣。正交椎體直接將椎體裡的座標映射為標準化設備座標，爾不需要任何其它處理，因為它不涉及 w 分量；如果 w 分量保持為 1.0，透視除法不會改變座標值。

To create an orthographic projection matrix we make use of GLM's built-in function glm::ortho:

要創建一個正交投射矩陣，我們使用 glm 內置的函數 glm::ortho：

```cpp
glm::ortho(0.0f, 800.0f, 0.0f, 600.0f, 0.1f, 100.0f);
```

The first two parameters specify the left and right coordinate of the frustum and the third and fourth parameter specify the bottom and top part of the frustum. With those 4 points we've defined the size of the near and far planes and the 5th and 6th parameter then define the distances between the near and far plane. This specific projection matrix transforms all coordinates between these x, y and z range values to normalized device coordinates.

前面兩個參數指定了椎體左右兩邊的座標；第三第四個參數指定了視椎的下方和上方。使用這個 4 個參數，我們定義出了 near 和 far 平面的大小，第五和第六個參數指明了 near 和 far 平面到視點之間的距離。這種投影矩陣將全部在這些 x、y、z 範圍內的座標轉換為標準設備座標。

An orthographic projection matrix directly maps coordinates to the 2D plane that is your screen, but in reality a direct projection produces unrealistic results since the projection doesn't take perspective into account. That is something the perspective projection matrix fixes for us.

正交投影矩陣直接將座標映射到 2D 平面，也就是你的屏幕。但是現實中，直接投影會產生一種不真實感，因為投影沒有將透視效果考慮在內。這就是透視投影矩陣為我們做的修正：

### 透視投影（Perspective projection）

If you ever were to enjoy the graphics the real life has to offer you'll notice that objects that are farther away appear much smaller. This weird effect is something we call perspective. Perspective is especially noticeable when looking down the end of an infinite motorway or railway as seen in the following image:

如果你曾經很喜歡圖形，真實的生活一定讓你注意到遠處的物體裡距離越遠，顯得就越小。這種奇怪的效應，我們稱之為透視。透視很容易被觀察到，當我們看向無限遠處的高速路或者鐵軌時，就如下面這張圖所示：

![perspective](https://learnopengl.com/img/getting-started/perspective.png)

As you can see, due to perspective the lines seem to coincide at a far enough distance. This is exactly the effect perspective projection tries to mimic and it does so using a perspective projection matrix. The projection matrix maps a given frustum range to clip space, but also manipulates the w value of each vertex coordinate in such a way that the further away a vertex coordinate is from the viewer, the higher this w component becomes. Once the coordinates are transformed to clip space they are in the range -w to w (anything outside this range is clipped). OpenGL requires that the visible coordinates fall between the range -1.0 and 1.0 as the final vertex shader output, thus once the coordinates are in clip space, perspective division is applied to the clip space coordinates:

如你所見，由於透視效果，線條會在足夠遠的距離處重合。這正好就是透視投影嘗試模擬的地方，它通過一個透視投影矩陣實現。投影矩陣將給定的椎體映射到裁剪空間，但是同時也對每個頂點座標的 `w` 值進行一種操作，就是如果頂點座標離視點越遠，`w` 的值越高。一旦座標被轉到裁剪空間，它們將會落在 `-w` 和 `w` 之間（之外的內容全部被裁剪掉）。經過最後一個頂點著色器輸出後，OpenGL 要求可見座標必須落入 `-1.0` 到 `1.0` 數值範圍，因此一旦座標在裁剪空間，透視除法會被應用到裁剪空間座標：

```math
\text{out} = \begin{pmatrix}
x/{w} \\
y/{w} \\
z/{w}
\end{pmatrix}
```

Each component of the vertex coordinate is divided by its w component giving smaller vertex coordinates the further away a vertex is from the viewer. This is another reason why the w component is important, since it helps us with perspective projection. The resulting coordinates are then in normalized device space. If you're interested to figure out how the orthographic and perspective projection matrices are actually calculated (and aren't too scared of the mathematics) I can recommend [this excellent article](http://www.songho.ca/opengl/gl_projectionmatrix.html) by Songho.

頂點座標的每一個分量除以 w 分量後，頂點位置裡視點越遠，頂點座標越小。這也是 w 分量十分重要的另一個原因，因為它能幫助我們做透視投影。最終的座標於是在標準化設備座標空間。如果你對 orthographic 和 perspective 投射矩陣的計算（對數學不太畏懼 😂）感興趣，並想弄懂它們，我推薦 Songho 的這篇[絕佳的文章](http://www.songho.ca/opengl/gl_projectionmatrix.html)。

A perspective projection matrix can be created in GLM as follows:

使用 GLM，一個透視投影矩陣可以這樣被創建出來：

```cpp
glm::mat4 proj = glm::perspective(glm::radians(45.0f), (float)width/(float)height, 0.1f, 100.0f);
```

What `glm::perspective` does is again create a large frustum that defines the visible space, anything outside the frustum will not end up in the clip space volume and will thus become clipped. A perspective frustum can be visualized as a non-uniformly shaped box from where each coordinate inside this box will be mapped to a point in clip space. An image of a perspective frustum is seen below:

`glm::perspective` 所做的事情是創建一個大的椎體，用於定義可見空間，任何椎體之外的東西最後也都將在裁剪空間之外，因而被裁剪掉。透視椎體被可視化為一個非均勻的盒子，其中盒子中的每一個座標都將被映射為裁剪空間裡的一個點。用一張圖來說明透視椎體圖下：

![perspective frustum](https://learnopengl.com/img/getting-started/perspective_frustum.png)

Its first parameter defines the fov value, that stands for field of view and sets how large the viewspace is. For a realistic view it is usually set to 45 degrees, but for more doom-style results you could set it to a higher value. The second parameter sets the aspect ratio which is calculated by dividing the viewport's width by its height. The third and fourth parameter set the near and far plane of the frustum. We usually set the near distance to 0.1 and the far distance to 100.0. All the vertices between the near and far plane and inside the frustum will be rendered.

第一個參數定義 fov 的值，它的意思是 field of view，描述 viewspace 有多大。為了真實性，它通常被設置為 45 度，但是為了一些更加 doom-style 的效果，你可以將它設置得更高一些。第二個參數設置了 aspect ratio，使用視窗的寬度除以它的高度可以得到這個值。 第三個和第四個參數設置了椎體的 near 和 far 平面。我們通常將 near 距離設置為 0.1，並將 far 距離設置為 100.0。處於 near 和 far 平面之間，並且在椎體內部的全部頂點將會被渲染。

{% include box.html color="green" content="

Whenever the near value of your perspective matrix is set too high (like 10.0), OpenGL will clip all coordinates close to the camera (between 0.0 and 10.0), which can give a visual result you maybe have seen before in videogames where you could see through certain objects when moving uncomfortably close to them.

當你將透視矩陣的 near 值設置太高（比如 10.0），OpenGL 會裁剪掉太靠近相機（0.0 到 10.0 之間）的座標，這將導致你注意到一種效果，你可能曾在視頻遊戲裡見到過，當過於靠近一些物體時，你能夠從視覺上穿透它們。

" %}

When using orthographic projection, each of the vertex coordinates are directly mapped to clip space without any fancy perspective division (it still does perspective division, but the w component is not manipulated (it stays 1) and thus has no effect). Because the orthographic projection doesn't use perspective projection, objects farther away do not seem smaller, which produces a weird visual output. For this reason the orthographic projection is mainly used for 2D renderings and for some architectural or engineering applications where we'd rather not have vertices distorted by perspective. Applications like Blender that are used for 3D modeling sometimes use orthographic projection for modeling, because it more accurately depicts each object's dimensions. Below you'll see a comparison of both projection methods in Blender:

當使用正交投影，每一個頂點座標直接被映射到裁剪空間，不需要巧妙的透視除法（它仍然進行了透視除法，但是 w 分量沒有經過處理，因為 w 始終是 1，因此沒有效果）。由於正交投影不使用透視，遠處的物體不會變小，這產生了一種奇怪的效果。鑒於此，正交投影主要用於 2D 渲染，以及用於一些建築或者工程類應用，這些應用不需要將頂點做透視變形。類似 Blender 這種用於處理 3D 建模的軟件，有時候也會使用正交投影，因為需要更精確地刻畫每一個物體的大小。以下你將看到 Blender 下這兩種投影的比較：

![perspective vs orthographic](https://learnopengl.com/img/getting-started/perspective_orthographic.png)

### 放在一起

We create a transformation matrix for each of the aforementioned steps: model, view and projection matrix. A vertex coordinate is then transformed to clip coordinates as follows:

我們為上述步驟分別創建了轉換矩陣：model、view 以及 projection 矩陣。頂點座標於是按照以下方式轉換為裁剪座標：

```math
\vec{V}_{clip} = M_{projection} \cdot M_{view} \cdot M_{model} \cdot \vec{V}_{local}
```

Note that the order of matrix multiplication is reversed (remember that we need to read matrix multiplication from right to left). The resulting vertex should then be assigned to gl_Position in the vertex shader and OpenGL will then automatically perform perspective division and clipping.

注意，矩陣乘法的順序是反的（記住我們需要從右往左地去閱讀矩陣乘法）。在頂點著色器中，最終的頂點需要交給 gl_Position，OpenGL 會自動執行透視除法以及裁剪。

{% include box.html color="green" content="

**And then?**

**接下來呢?**

The output of the vertex shader requires the coordinates to be in clip-space which is what we just did with the transformation matrices. OpenGL then performs perspective division on the clip-space coordinates to transform them to normalized-device coordinates. OpenGL then uses the parameters from glViewPort to map the normalized-device coordinates to screen coordinates where each coordinate corresponds to a point on your screen (in our case a 800x600 screen). This process is called the viewport transform.

經過頂點著色器輸出的頂點要求其座標在裁剪空間，我們剛剛使用一些轉換矩陣所做的事情正是要達到這個目的。OpenGL 接下來會對裁剪空間座標執行透視除法，將它們放入標準設備座標系。OpenGL 使用 glViewPort 的參數將 NDC 轉換為屏幕座標，每一個座標對應你屏幕上的一個點（在我們這裡是一個 800x600 的屏幕）。這個過程被稱為視窗轉換。

" %}

This is a difficult topic to understand so if you're still not exactly sure about what each space is used for you don't have to worry. Below you'll see how we can actually put these coordinate spaces to good use and enough examples will follow in the upcoming chapters.

這是最難理解的部分，如果你依然沒有對這些空間準確理解，不必慌張。接下來你將看到我們可以實際如何使用這些座標空間，在接下來的章節裡也會有大量的例子呈現給你。

## Going 3D

## 進入 3D

Now that we know how to transform 3D coordinates to 2D coordinates we can start rendering real 3D objects instead of the lame 2D plane we've been showing so far.

現在我們知道如何將 3D 座標轉換為 2D 座標，我們可以開始渲染真正的 3D 物體，而不是我們此前演示的那種無趣的 2D 屏平面。

To start drawing in 3D we'll first create a model matrix. The model matrix consists of translations, scaling and/or rotations we'd like to apply to transform all object's vertices to the global world space. Let's transform our plane a bit by rotating it on the x-axis so it looks like it's laying on the floor. The model matrix then looks like this:

要在 3D 空間繪製物體，我們首先創建 model 矩陣。model 矩陣包含了平移、縮放以及旋轉，我們用它來將物體的全部頂點轉換到全局世界空間。讓我們將我們的平面沿著 x 軸稍稍旋轉一點，讓它看上去像是躺在地上。這裡 model 矩陣看上去是這樣的：

```cpp
glm::mat4 model = glm::mat4(1.0f);
model = glm::rotate(model, glm::radians(-55.0f), glm::vec3(1.0f, 0.0f, 0.0f));
```

By multiplying the vertex coordinates with this model matrix we're transforming the vertex coordinates to world coordinates. Our plane that is slightly on the floor thus represents the plane in the global world.

通過讓頂點座標與 model 矩陣相乘，我們將頂點座標轉化成世界座標。我們的平面因此微微倒向地面，這就是它在全局世界空間裡的呈現。

Next we need to create a view matrix. We want to move slightly backwards in the scene so the object becomes visible (when in world space we're located at the origin $(0,0,0)$). To move around the scene, think about the following:

接下來，我們需要創建 view 矩陣。我們希望在場景裡稍稍向後退一點，這樣物件可以被看到（在世界空間，我們將 $(0,0,0)$ 設定為萬物的原點）。要圍繞場景移動，考慮以下表述：

- To move a camera backwards, is the same as moving the entire scene forward.

- 將相機向後移動，和將整個場景向前移動是等效的。

That is exactly what a view matrix does, we move the entire scene around inversed to where we want the camera to move.
Because we want to move backwards and since OpenGL is a right-handed system we have to move in the positive z-axis. We do this by translating the scene towards the negative z-axis. This gives the impression that we are moving backwards.

這正是 view 矩陣所做的事情，我們會將整個場景反向地移動，來達到攝影機移動到指定位置的效果。由於我們需要向後移動，OpenGL 是一個遵循右手法則的系統，我們需要在 z 軸上移動。我們通過對場景沿著 z 軸的負方向平移達到這個目的。這樣可以給我們一種印象——我們在後退。

{% include box.html color="green" content="

**Right-handed system**

By convention, OpenGL is a right-handed system. What this basically says is that the positive x-axis is to your right, the positive y-axis is up and the positive z-axis is backwards. Think of your screen being the center of the 3 axes and the positive z-axis going through your screen towards you. The axes are drawn as follows:

![coordinate_systems_right_handed](https://learnopengl.com/img/getting-started/coordinate_systems_right_handed.png)

To understand why it's called right-handed do the following:

- Stretch your right-arm along the positive y-axis with your hand up top.
- Let your thumb point to the right.
- Let your pointing finger point up.
- Now bend your middle finger downwards 90 degrees.

If you did things right, your thumb should point towards the positive x-axis, the pointing finger towards the positive y-axis and your middle finger towards the positive z-axis. If you were to do this with your left-arm you would see the z-axis is reversed. This is known as a left-handed system and is commonly used by DirectX. Note that in normalized device coordinates OpenGL actually uses a left-handed system (the projection matrix switches the handedness).

**右手座標系統**

按照慣例，OpenGL 是一個右手坐標系。這基本上表示正的 x 軸朝右，正的 y 軸朝上，而正的 z 軸朝後。你可以想像螢幕是三個坐標軸的中心，而正的 z 軸從螢幕穿出，朝向你。坐標軸繪製如下圖所示：

![coordinate_systems_right_handed](https://learnopengl.com/img/getting-started/coordinate_systems_right_handed.png)

為了理解為什麼叫做右手坐標系，請這樣做：

- 伸出你的右手，沿著正的 y 軸方向舉起手。
- 讓你的拇指指向右邊。
- 讓你的食指指向上方。
- 然後將你的中指向下彎曲 90 度。

如果你做對了，你的拇指應該指向正的 x 軸，食指指向正的 y 軸，而中指指向正的 z 軸。如果你用左手做這個動作，你會發現 z 軸的方向是反的。這就是所謂的左手坐標系，DirectX 就常使用這種系統。請注意，在標準化裝置坐標（NDC）中，OpenGL 實際上使用的是左手坐標系（投影矩陣會改變慣用手系統）。

" %}

We'll discuss how to move around the scene in more detail in the next chapter. For now the view matrix looks like this:

我們將在下一章裡詳細地討論如何移動場景。現在我們的 view 矩陣看起來這樣：

```cpp
glm::mat4 view = glm::mat4(1.0f);
// note that we're translating the scene in the reverse direction of where we want to move
view = glm::translate(view, glm::vec3(0.0f, 0.0f, -3.0f));
```

The last thing we need to define is the projection matrix. We want to use perspective projection for our scene so we'll declare the projection matrix like this:

最後一件事，我們需要定義投影矩陣。我們希望為我們的場景使用透視投影，因此我們聲明一個透視矩陣，像這樣：

```cpp
glm::mat4 projection;
projection = glm::perspective(glm::radians(45.0f), 800.0f / 600.0f, 0.1f, 100.0f);
```

Now that we created the transformation matrices we should pass them to our shaders. First let's declare the transformation matrices as uniforms in the vertex shader and multiply them with the vertex coordinates:

現在，我們創建了轉換矩陣，我們要將它們傳入到著色器中。首先讓我們在頂點著色器中將轉換矩陣聲明為 uniforms，並且讓它們和頂點座標相乘：

```cpp
#version 330 core
layout (location = 0) in vec3 aPos;
...
uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

void main()
{
    // note that we read the multiplication from right to left
    gl_Position = projection * view * model * vec4(aPos, 1.0);
    ...
}
```

We should also send the matrices to the shader (this is usually done each frame since transformation matrices tend to change a lot):

我們應該也將矩陣發送到 shader（通常會在每一幀做這個事情，因為矩陣經常改變）：

```cpp
int modelLoc = glGetUniformLocation(ourShader.ID, "model");
glUniformMatrix4fv(modelLoc, 1, GL_FALSE, glm::value_ptr(model));
... // same for View Matrix and Projection Matrix
```

Now that our vertex coordinates are transformed via the model, view and projection matrix the final object should be:

現在我們的頂點座標通過 model、view 和 projection 被轉換，最終的物體將：

- Tilted backwards to the floor.
- A bit farther away from us.
- Be displayed with perspective (it should get smaller, the further its vertices are).

- 向地面傾倒
- 離我們稍遠
- 有了透視感（越遠的頂點，顯示上越小）

Let's check if the result actually does fulfill these requirements:

讓我們來檢驗一下最終的結果是否確實如我們所願：

![coordinate_systems_result](https://learnopengl.com/img/getting-started/coordinate_systems_result.png)

It does indeed look like the plane is a 3D plane that's resting at some imaginary floor. If you're not getting the same result, compare your code with the complete [source code](https://learnopengl.com/code_viewer_gh.php?code=src/1.getting_started/6.1.coordinate_systems/coordinate_systems.cpp).

當然，它看上去很 3D 了，一個在可想像的地面上休息的“平面”。如果你沒有獲得一致的結果，將你的代碼和完整的[源代碼](https://learnopengl.com/code_viewer_gh.php?code=src/1.getting_started/6.1.coordinate_systems/coordinate_systems.cpp)做一番比對。

## More 3D

## 更加 3D

So far we've been working with a 2D plane, even in 3D space, so let's take the adventurous route and extend our 2D plane to a 3D cube. To render a cube we need a total of 36 vertices (6 faces _ 2 triangles _ 3 vertices each). 36 vertices are a lot to sum up so you can retrieve them from [here](https://learnopengl.com/code_viewer.php?code=getting-started/cube_vertices).

目前為止，我們處理的只是一個 2D 的平面，雖然我們將它放入 3D 空間了，讓我們來一點更有挑戰的路徑，將我們的 2D 平面 擴展為 3D 的方塊。要渲染一個方塊，我們需要一共 36 個頂點（6 個面 _ 2 個三角形 _ 3 个頂點）。36 個頂點算起來還不少，你可以從[這裡](https://learnopengl.com/code_viewer.php?code=getting-started/cube_vertices)獲取它們。

For fun, we'll let the cube rotate over time:

為了有趣一點，我們讓這個方塊隨著時間選擇起來：

```cpp
model = glm::rotate(model, (float)glfwGetTime() * glm::radians(50.0f), glm::vec3(0.5f, 1.0f, 0.0f));
```

And then we'll draw the cube using glDrawArrays (as we didn't specify indices), but this time with a count of 36 vertices.

然後，我們將使用 glDrawArrays （因為我們沒有指定索引）來繪製這個方塊，但是目前我們使用 36 個頂點。

```cpp
glDrawArrays(GL_TRIANGLES, 0, 36);
```

You should get something similar to the following:

你應該對以下動畫有些熟悉：

<video width="600" height="450" autoplay controls loop="">
  <source src="https://learnopengl.com/video/getting-started/coordinate_system_no_depth.mp4" type="video/mp4">
</video>

It does resemble a cube slightly but something's off. Some sides of the cubes are being drawn over other sides of the cube. This happens because when OpenGL draws your cube triangle-by-triangle, fragment by fragment, it will overwrite any pixel color that may have already been drawn there before. Since OpenGL gives no guarantee on the order of triangles rendered (within the same draw call), some triangles are drawn on top of each other even though one should clearly be in front of the other.

它確實有點像方塊，但是哪裡怪怪的。方塊的有些面畫在了另一些面的上方。這是因為 OpenGL 是逐個三角形、逐個片元繪製的，如此就會覆蓋一些已經畫好的像素。由於 OpenGL 不確保三角形的繪製次序（在一次 draw call 內），有些三角形繪製在彼此的上方，儘管其中一個明顯應該繪製在另一個的前面（立鏡頭更近）。

Luckily, OpenGL stores depth information in a buffer called the z-buffer that allows OpenGL to decide when to draw over a pixel and when not to. Using the z-buffer we can configure OpenGL to do depth-testing.

好消息是，OpenGL 保存了“深度”信息，它們被保存在一個叫 z-buffer 的緩衝對象裡，這允許 OpenGL 判斷什麼時候需要覆蓋像素、什麼時候不需要。使用 z-buffer，我們可以配置 OpenGL 以進行深度測試。

### z-buffer

### z-buffer

OpenGL stores all its depth information in a z-buffer, also known as a depth buffer. GLFW automatically creates such a buffer for you (just like it has a color-buffer that stores the colors of the output image). The depth is stored within each fragment (as the fragment's z value) and whenever the fragment wants to output its color, OpenGL compares its depth values with the z-buffer. If the current fragment is behind the other fragment it is discarded, otherwise overwritten. This process is called depth testing and is done automatically by OpenGL.

OpenGL 保存了全部的深度信息，放在 z-buffer 當中，也被稱為深度緩衝。GLFW 自動為你創建了這個 buffer（就像它有一個顏色緩衝區，用來儲存輸出影像的顏色一樣）。深度針對每一個片元（作為片元的 z 值）存儲，任何時候片元需要輸出它的顏色，OpenGL 會比較 z-buffer 中的深度值。如果當前的片元在其它片元之後，該片元會被丟棄，否則寫入。這個過程被稱為深度測試，OpenGL 會自動執行這部分。

However, if we want to make sure OpenGL actually performs the depth testing we first need to tell OpenGL we want to enable depth testing; it is disabled by default. We can enable depth testing using glEnable. The glEnable and glDisable functions allow us to enable/disable certain functionality in OpenGL. That functionality is then enabled/disabled until another call is made to disable/enable it. Right now we want to enable depth testing by enabling GL_DEPTH_TEST:

然而，如果我們像確保 OpenGL 執行了深度測試，我們首先需要告訴 OpenGL 我們需要開啟深度測試；它默認是關閉的。我們可以使用 glEnable 開啟深度測試。glEnable 和 glDisable 函數允許我們開啟/關閉 OpenGL 的某些功能。指定的功能於是被打開/關閉，直到再此調用了它對功能進行了關閉/打開操作。現在，我們唷開啟深度測試，要開啟的是 GL_DEPTH_TEST：

```cpp
glEnable(GL_DEPTH_TEST);
```

Since we're using a depth buffer we also want to clear the depth buffer before each render iteration (otherwise the depth information of the previous frame stays in the buffer). Just like clearing the color buffer, we can clear the depth buffer by specifying the DEPTH_BUFFER_BIT bit in the glClear function:

由於我們使用了深度緩衝（depth buffer），我們也希望在每一幀之前清除深度緩衝（否則，之前的深度信息會保留在 buffer 裡）。就像清理顏色 buffer 一樣，我們可以清理深度 buffer，這裡需要用到元位標記 DEPTH_BUFFER_BIT，調用的函數是 glClear：

```cpp
glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
```

Let's re-run our program and see if OpenGL now performs depth testing:

讓我們重新運行程序，看 OpenGL 是否執行了深度測試：

<video width="600" height="450" autoplay controls loop="">
  <source src="https://learnopengl.com/video/getting-started/coordinate_system_depth.mp4" type="video/mp4">
</video>

There we go! A fully textured cube with proper depth testing that rotates over time. Check the source code [here](https://learnopengl.com/code_viewer_gh.php?code=src/1.getting_started/6.2.coordinate_systems_depth/coordinate_systems_depth.cpp).

太好了！正確地使用了深度測試之後，一個完整的、上了紋理的方塊現在雖=隨時間旋轉。你可以參考一下[源代碼](https://learnopengl.com/code_viewer_gh.php?code=src/1.getting_started/6.2.coordinate_systems_depth/coordinate_systems_depth.cpp)。

### More cubes!

### 更多的方塊！

Say we wanted to display 10 of our cubes on screen. Each cube will look the same but will only differ in where it's located in the world with each a different rotation. The graphical layout of the cube is already defined so we don't have to change our buffers or attribute arrays when rendering more objects. The only thing we have to change for each object is its model matrix where we transform the cubes into the world.

現在假設，我們希望在屏幕上顯示 10 個這樣的方塊。每一個方塊和此前我繪製的一樣，除了它們出現在世界的位置以及帶有的旋轉角不同之外。方塊的圖形佈局我們已經定義過的，因此在渲染更多方塊的時候，我們不必修改緩衝或者屬性（attributes）。唯一需要我們修改的是，每一個方塊的 model 矩陣，我們用它來將方塊轉換至世界空間。

First, let's define a translation vector for each cube that specifies its position in world space. We'll define 10 cube positions in a `glm::vec3` array:

首先，讓我們為每一個方塊定義平移向量，它指定了方塊的世界位置。我們將定義 10 個方塊的位置，放在 `glm::vec3` 數組當中：

```cpp
glm::vec3 cubePositions[] = {
    glm::vec3( 0.0f,  0.0f,  0.0f),
    glm::vec3( 2.0f,  5.0f, -15.0f),
    glm::vec3(-1.5f, -2.2f, -2.5f),
    glm::vec3(-3.8f, -2.0f, -12.3f),
    glm::vec3( 2.4f, -0.4f, -3.5f),
    glm::vec3(-1.7f,  3.0f, -7.5f),
    glm::vec3( 1.3f, -2.0f, -2.5f),
    glm::vec3( 1.5f,  2.0f, -2.5f),
    glm::vec3( 1.5f,  0.2f, -1.5f),
    glm::vec3(-1.3f,  1.0f, -1.5f)
};
```

Now, within the render loop we want to call glDrawArrays 10 times, but this time send a different model matrix to the vertex shader each time before we send out the draw call. We will create a small loop within the render loop that renders our object 10 times with a different model matrix each time. Note that we also add a small unique rotation to each container.

現在，在渲染循環函數裡，我們需要調用 glDrawArrays 10 次，但是這次在發送 draw call 請求之前，我們要發送不同的 model 矩陣到頂點著色器。我們將在渲染循環裡創建一個小的循環，以使用不同的 model 矩陣對我們的物體渲染 10 次。注意，我們也需要分別為每一個箱子添加一點旋轉效果。

```cpp
glBindVertexArray(VAO);
for(unsigned int i = 0; i < 10; i++)
{
    glm::mat4 model = glm::mat4(1.0f);
    model = glm::translate(model, cubePositions[i]);
    float angle = 20.0f * i;
    model = glm::rotate(model, glm::radians(angle), glm::vec3(1.0f, 0.3f, 0.5f));
    ourShader.setMat4("model", model);

    glDrawArrays(GL_TRIANGLES, 0, 36);
}
```

This snippet of code will update the model matrix each time a new cube is drawn and do this 10 times in total. Right now we should be looking into a world filled with 10 oddly rotated cubes:

這段代碼做的事情是，每一個新的方塊被繪製的時，更新它的 model 矩陣，如此執行一共 10 次。現在我們應該可以看到世界放入了 10 個隨機旋轉的方塊：

![coordinate_systems_multiple_objects](https://learnopengl.com/img/getting-started/coordinate_systems_multiple_objects.png)

Perfect! It looks like our container found some like-minded friends. If you're stuck see if you can compare your code with [the source code](https://learnopengl.com/code_viewer_gh.php?code=src/1.getting_started/6.3.coordinate_systems_multiple/coordinate_systems_multiple.cpp).

完美！看上去，我們的箱子找到了幾個志同道合的朋友 😄。如果你遇到了困難，看看是否可以將你的代碼與[源代碼](https://learnopengl.com/code_viewer_gh.php?code=src/1.getting_started/6.3.coordinate_systems_multiple/coordinate_systems_multiple.cpp)對照一下。
