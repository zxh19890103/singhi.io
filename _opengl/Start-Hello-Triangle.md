---
layout: bookdetail
chapter: 五
short:
title: 开始 &bull; Hello, 三角形
src: https://learnopengl.com/Getting-started/Hello-Window
category: tech
date: 2025-05-29
editing: 1
---

In OpenGL everything is in 3D space, but the screen or window is a 2D array of pixels so a large part of OpenGL's work is about transforming all 3D coordinates to 2D pixels that fit on your screen. The process of transforming 3D coordinates to 2D pixels is managed by the graphics pipeline of OpenGL. The graphics pipeline can be divided into two large parts: the first transforms your 3D coordinates into 2D coordinates and the second part transforms the 2D coordinates into actual colored pixels. In this chapter we'll briefly discuss the graphics pipeline and how we can use it to our advantage to create fancy pixels.

對於 OpenGL 來說，一切都在 3D 空間，但是屏幕或者窗口是一個二維像素數組，因此 OpenGL 的大量工作是將 3D 座標轉換為 2D 像素，顯示在屏幕的合適位置。3D 座標轉 2D 像素的過程由 OpenGL 的圖形管線管理。圖形管線可以分為兩大部分：第一個是將你的 3D 座標轉換為 2D 座標，第二部分是將 2D 座標轉換為實際的顏色像素。本章，我們將簡要地討論一下圖形管線，以及我們如何使用我們的優勢來創建華麗的像素效果。

The graphics pipeline takes as input a set of 3D coordinates and transforms these to colored 2D pixels on your screen. The graphics pipeline can be divided into several steps where each step requires the output of the previous step as its input. All of these steps are highly specialized (they have one specific function) and can easily be executed in parallel. Because of their parallel nature, graphics cards of today have thousands of small processing cores to quickly process your data within the graphics pipeline. The processing cores run small programs on the GPU for each step of the pipeline. These small programs are called shaders.

圖形管線將一組 3D 座標作為輸入，將其轉換為 2D 像素顯示在你的屏幕上。管線可以分為幾個步驟，每一步需要將上一步的輸出作為輸入。所有的步驟都是高度指專職化的（它們有一個主函數），並且容易並行執行。因爲它的並行特點，今天的顯示卡擁有好幾千個小的處理單元，從而能夠通過管線快速處理你的數據。處理核心可以在 GPU 上為管線的每一步運行小的程序片段。這些程序片段被稱為 shader。

Some of these shaders are configurable by the developer which allows us to write our own shaders to replace the existing default shaders. This gives us much more fine-grained control over specific parts of the pipeline and because they run on the GPU, they can also save us valuable CPU time. Shaders are written in the OpenGL Shading Language (GLSL) and we'll delve more into that in the next chapter.

有些 shaders 被設計得可以支持開發者編寫自己的 shader 以替換默認已存在的 shader。這給了我們精細地掌控管線的各個步驟的能力，它們運行在 GPU 上，因此它們也可以為我們節省珍貴的 CPU 時間。Shaders 使用 OpenGL 的 Shading 語言 GLSL 編寫，我們將會在下一章涉及更多。

Below you'll find an abstract representation of all the stages of the graphics pipeline. Note that the blue sections represent sections where we can inject our own shaders.

以下，你會看到圖形管線各個階段的抽象描述。注意，藍色的部分代表我麼可以插入我們自己 shader 代碼的地方。

{% include img.html src="https://learnopengl.com/img/getting-started/pipeline.png" %}

As you can see, the graphics pipeline contains a large number of sections that each handle one specific part of converting your vertex data to a fully rendered pixel. We will briefly explain each part of the pipeline in a simplified way to give you a good overview of how the pipeline operates.

如你所見，圖形管線包含了好多部分，每一個都負責處理完整的定點到像素轉化流程的一個特定部分。我們將簡要以簡單易懂的方式解釋管線的每一個部分，希望你能對管線處理有一個非常棒的全景了解。

As input to the graphics pipeline we pass in a list of three 3D coordinates that should form a triangle in an array here called Vertex Data; this vertex data is a collection of vertices. A vertex is a collection of data per 3D coordinate. This vertex's data is represented using vertex attributes that can contain any data we'd like, but for simplicity's sake let's assume that each vertex consists of just a 3D position and some color value.

我們將一組 3D 座標數據作為管線的輸入，它們可以形成一個三角形，我們稱這為頂點數據。此頂點數據是很多頂點的集合。一個頂點是一個座標數據。我們使用 attributes 表達頂點數據，它允許包含你想要的任何數據組，但是簡單起見，讓我們假設每一個頂點只包含一個 3D 座標以及一些顏色值。

{% include box.html color="green" content="
In order for OpenGL to know what to make of your collection of coordinates and color values OpenGL requires you to hint what kind of render types you want to form with the data. Do we want the data rendered as a collection of points, a collection of triangles or perhaps just one long line? Those hints are called primitives and are given to OpenGL while calling any of the drawing commands. Some of these hints are GL_POINTS, GL_TRIANGLES and GL_LINE_STRIP.
" %}

{% include box.html color="green" content="
為了讓 OpenGL 明白你使用這些座標和顏色值數據集合繪製什麼，OpenGL 需要你提供渲染類型。使用這些數據，我們想渲染一些點嗎、一些三角形、一條長長的線段？這些指示被稱作圖元，OpenGL 使用它來調用繪製命令。其中一些指示包含：GL_POINTS、GL_TRIANGLES 以及 GL_LINE_STRIP。
" %}

The first part of the pipeline is the vertex shader that takes as input a single vertex. The main purpose of the vertex shader is to transform 3D coordinates into different 3D coordinates (more on that later) and the vertex shader allows us to do some basic processing on the vertex attributes.

管線的第一部分是頂點 shader （vertex shader），它接受一個頂點作為輸入。其主要目的是將 3D 座標轉換為另一種 3D 座標（稍後解釋），並且它允許我們針對 vertex attributes 做一些基本的處理。

The output of the vertex shader stage is optionally passed to the geometry shader. The geometry shader takes as input a collection of vertices that form a primitive and has the ability to generate other shapes by emitting new vertices to form new (or other) primitive(s). In this example case, it generates a second triangle out of the given shape.

vertex shader 的輸出，可能會傳入 geometry shader （幾何 shader）。Geomemtry shader 將一組頂點作為輸入以形成一個圖元，進而可以通過生成新的頂點生成其它形狀。這個例子，它根據已有的形狀生成了第二個三角形。

The primitive assembly stage takes as input all the vertices (or vertex if GL_POINTS is chosen) from the vertex (or geometry) shader that form one or more primitives and assembles all the point(s) in the primitive shape given; in this case two triangles.

基本圖元組裝階段會從頂點著色器（或幾何著色器）接收所有構成一個或多個基本圖元的頂點（若選擇的是 GL_POINTS，則為單個頂點），並將這些點組合成指定的基本圖元形狀；在本例中是兩個三角形。

The output of the primitive assembly stage is then passed on to the rasterization stage where it maps the resulting primitive(s) to the corresponding pixels on the final screen, resulting in fragments for the fragment shader to use. Before the fragment shaders run, clipping is performed. Clipping discards all fragments that are outside your view, increasing performance.

接著，基本圖元組裝階段的輸出傳入到光柵化階段，它將這些基本圖元映射為對應的屏幕像素，它產生了 fragment，以供片段著色器使用。片段著色器運行之前，裁減會被執行。裁減的工作是忽略掉視野之外的片段，以提高性能。

{% include box.html color="green" content="
A fragment in OpenGL is all the data required for OpenGL to render a single pixel.
" %}

{% include box.html color="green" content="
 OpenGL 中的一個 fragment 是 OpenGL 用以渲染一個像素所需要的全部數據
" %}

The main purpose of the fragment shader is to calculate the final color of a pixel and this is usually the stage where all the advanced OpenGL effects occur. Usually the fragment shader contains data about the 3D scene that it can use to calculate the final pixel color (like lights, shadows, color of the light and so on).

片段著色器的主要目的是計算最終的像素顏色，這一階段通常就是所有高級 3D 顯示效果的產生階段。通常，片段著色器包含了 3D 場景的全部數據，由此可以計算最終的像素值（例如：光、陰影、光的顏色，等等）。

After all the corresponding color values have been determined, the final object will then pass through one more stage that we call the alpha test and blending stage. This stage checks the corresponding depth (and stencil) value (we'll get to those later) of the fragment and uses those to check if the resulting fragment is in front or behind other objects and should be discarded accordingly. The stage also checks for alpha values (alpha values define the opacity of an object) and blends the objects accordingly. So even if a pixel output color is calculated in the fragment shader, the final pixel color could still be something entirely different when rendering multiple triangles.

所有的顏色值確定之後，結果會被傳入另一個階段，稱之為 alpha test 和 blending 階段。這個階段將檢查最終 fragment 對應的深度（和模板）值（我們將會稍後涉及），使用它們來判斷最終 fragment 是在其它物體前面還是後面，以及是否需要被忽略掉。這個階段也會檢查 alpha 值（alpha 值是物體的不透明度），以及對物體進行相應的色值混合。因此，即便一個輸出的像素值在片段著色器中被計算完成，在渲染多個三角形的時候，最終的像素顏色呈現仍然可能完全不一樣。

As you can see, the graphics pipeline is quite a complex whole and contains many configurable parts. However, for almost all the cases we only have to work with the vertex and fragment shader. The geometry shader is optional and usually left to its default shader. There is also the tessellation stage and transform feedback loop that we haven't depicted here, but that's something for later.

正如你所見，圖形管線是一個很複雜的整體，包含了很多可配置的部分。然爾，大部分時候，我們只需要和頂點著色器以及片段著色器打交道。幾何著色器是可選項，人們常常使用默認配置。另外還有細分階段（tessellation stage）和變換回饋迴圈（transform feedback loop），我們這裡還沒有描述，不過這些會在後面再說明。

In modern OpenGL we are required to define at least a vertex and fragment shader of our own (there are no default vertex/fragment shaders on the GPU). For this reason it is often quite difficult to start learning modern OpenGL since a great deal of knowledge is required before being able to render your first triangle. Once you do get to finally render your triangle at the end of this chapter you will end up knowing a lot more about graphics programming.

在現代 OpenGL 中，我們需要定義至少一個頂點著色器和一個片段著色器（GPU 不提供默認的頂點/片段著色器）。因此，學習現代 OpenGL 總會是一件比較困難的事，因為即便僅僅是畫一個簡單的三角形，依然需要掌握很多的知識。本章的最後，一旦你完成了三角形的渲染，你將會學到大量圖形編程的知識。

## Vertex input

## 頂點輸入

To start drawing something we have to first give OpenGL some input vertex data. OpenGL is a 3D graphics library so all coordinates that we specify in OpenGL are in 3D (x, y and z coordinate). OpenGL doesn't simply transform all your 3D coordinates to 2D pixels on your screen; OpenGL only processes 3D coordinates when they're in a specific range between -1.0 and 1.0 on all 3 axes (x, y and z). All coordinates within this so called normalized device coordinates range will end up visible on your screen (and all coordinates outside this region won't).

要開始繪製點什麼，我們首先必須要為 OpenGL 提供一些頂點數據。OpenGL 是一個 3D 圖形庫，因此，所有在 OpenGL 中出現的座標都必須是 3D 的（x、y、z 座標）。OpenGL 不是簡單的將你的 3D 座標轉換為 2D 屏幕像素；OpenGL 只會處理在三個軸上範圍均在 -1.0 到 1.0 的 3D 座標。所有位於所謂「標準化裝置座標（normalized device coordinates，簡稱 NDC）」範圍內的座標，最終都會顯示在螢幕上；而在這個範圍之外的座標則不會顯示。

Because we want to render a single triangle we want to specify a total of three vertices with each vertex having a 3D position. We define them in normalized device coordinates (the visible region of OpenGL) in a float array:

因為我們想要繪製一個三角形，所以需要指定三個頂點，而每個頂點都具有一個三維位置（3D position）。
我們將這些頂點的座標定義在 標準化裝置座標（Normalized Device Coordinates，OpenGL 的可見區域）中，並用一個 **浮點數陣列（float array）**來表示。

```cpp
float vertices[] = {
    -0.5f, -0.5f, 0.0f,
     0.5f, -0.5f, 0.0f,
     0.0f,  0.5f, 0.0f
};
```

Because OpenGL works in 3D space we render a 2D triangle with each vertex having a z coordinate of 0.0. This way the depth of the triangle remains the same making it look like it's 2D.

因為 OpenGL 處理的是 3D 空間，我們將每一個頂點的 z 值設為 0 渲染一個 2D 三角形。這樣我們將三角形的深度設為同一個值，讓它看上去是 2D 的。

{% include box.html color="green" content="

#### Normalized Device Coordinates (NDC)

Once your vertex coordinates have been processed in the vertex shader, they should be in normalized device coordinates which is a small space where the x, y and z values vary from -1.0 to 1.0. Any coordinates that fall outside this range will be discarded/clipped and won't be visible on your screen. Below you can see the triangle we specified within normalized device coordinates (ignoring the z axis):

<img src='https://learnopengl.com/img/getting-started/ndc.png'>

Unlike usual screen coordinates the positive y-axis points in the up-direction and the (0,0) coordinates are at the center of the graph, instead of top-left. Eventually you want all the (transformed) coordinates to end up in this coordinate space, otherwise they won't be visible.

Your NDC coordinates will then be transformed to screen-space coordinates via the viewport transform using the data you provided with glViewport. The resulting screen-space coordinates are then transformed to fragments as inputs to your fragment shader.

" %}

{% include box.html color="green" content="

#### 標準設備座標 （NDC）

Once your vertex coordinates have been processed in the vertex shader, they should be in normalized device coordinates which is a small space where the x, y and z values vary from -1.0 to 1.0. Any coordinates that fall outside this range will be discarded/clipped and won't be visible on your screen. Below you can see the triangle we specified within normalized device coordinates (ignoring the z axis):

當你的頂點座標在頂點著色器中處理之後，它們應該處於在 NDC 空間，NDC 是一個很小的座標系統，三個軸的取值範圍都是 -1.0 到 1.0。任何落在 NDC 區域之外的座標將會被忽略/裁減掉，也就不會顯示在你的屏幕上。以下，可以看到，我們定義的三角形處於標準設備座標系下（忽略了 z 軸）：

<img src='https://learnopengl.com/img/getting-started/ndc.png'>

Unlike usual screen coordinates the positive y-axis points in the up-direction and the (0,0) coordinates are at the center of the graph, instead of top-left. Eventually you want all the (transformed) coordinates to end up in this coordinate space, otherwise they won't be visible.

不同於常規意義上的屏幕座標系，NDC 的 y 軸指向上方，（0，0）座標處於中心，而非左上角。最終你需要所有的（轉換之後的）座標都落在這個座標空間，否則它們不會出現。

Your NDC coordinates will then be transformed to screen-space coordinates via the viewport transform using the data you provided with glViewport. The resulting screen-space coordinates are then transformed to fragments as inputs to your fragment shader.

使用 glViewport 對視窗進行配置，通過視窗變換，NDC 座標將會轉變為屏幕空間座標。最終的屏幕空間座標會被轉變為 fragment，作為片段著色器的輸入。

" %}

With the vertex data defined we'd like to send it as input to the first process of the graphics pipeline: the vertex shader. This is done by creating memory on the GPU where we store the vertex data, configure how OpenGL should interpret the memory and specify how to send the data to the graphics card. The vertex shader then processes as much vertices as we tell it to from its memory.

頂點數據定義完畢，我們希望將其發送給管線的第一步：頂點著色器。我們通過在 GPU 端開闢一塊內存區，並往其中存儲頂點數據，配置 OpenGL 告訴它該如何解析這個內存區，以及如何將數據發送到顯示卡。然後，頂點著色器會按照我們的告訴它的規模處理對應量的數據。

We manage this memory via so called vertex buffer objects (VBO) that can store a large number of vertices in the GPU's memory. The advantage of using those buffer objects is that we can send large batches of data all at once to the graphics card, and keep it there if there's enough memory left, without having to send data one vertex at a time. Sending data to the graphics card from the CPU is relatively slow, so wherever we can we try to send as much data as possible at once. Once the data is in the graphics card's memory the vertex shader has almost instant access to the vertices making it extremely fast

我們通過所謂的頂點緩衝對象（VBO）來管理這個內存區，它可以在 GPU 內存中存儲大量的頂點數據。使用這些緩存對象的優勢在於，我們可以一次性發送多個大批量的數據到顯示卡，並且如果內存充足，它們會一直保存在那裡，爾無需一個頂點一個頂點地發送。將數據從 CPU 發送之顯示卡 是相對較慢的一個過程，因此任何情況下我們希望每一次都發送儘可能多的數據。一旦數據在顯示卡內存，頂點著色器訪問它們就會非常的快速。

A vertex buffer object is our first occurrence of an [OpenGL](https://learnopengl.com/Getting-Started/OpenGL) object as we've discussed in the OpenGL chapter. Just like any object in OpenGL, this buffer has a unique ID corresponding to that buffer, so we can generate one with a buffer ID using the glGenBuffers function:

VBO （頂點緩存對象）是我們在 OpenGL 章節裡第一次出現的對象，這個緩存對象有一個唯一的 ID，因此我們可以使用 glGenBuffers 生成一個緩存 ID：

```cpp
unsigned int VBO;
glGenBuffers(1, &VBO);
```

OpenGL has many types of buffer objects and the buffer type of a vertex buffer object is GL_ARRAY_BUFFER. OpenGL allows us to bind to several buffers at once as long as they have a different buffer type. We can bind the newly created buffer to the GL_ARRAY_BUFFER target with the glBindBuffer function:

OpenGL 有多種類型的緩衝對象，而頂點緩衝對象（VBO）的緩衝類型是 GL_ARRAY_BUFFER。
OpenGL 允許我們同時綁定多個緩衝對象，只要它們的緩衝類型不同。
我們可以使用 glBindBuffer 函數，將新創建的緩衝對象綁定到 GL_ARRAY_BUFFER 目標上：

```cpp
glBindBuffer(GL_ARRAY_BUFFER, VBO);
```

From that point on any buffer calls we make (on the GL_ARRAY_BUFFER target) will be used to configure the currently bound buffer, which is VBO. Then we can make a call to the glBufferData function that copies the previously defined vertex data into the buffer's memory:

從這一點開始，我們對 GL_ARRAY_BUFFER 目標所做的任何緩衝區操作，都會作用於當前綁定的緩衝對象，也就是 VBO（頂點緩衝對象）。
接下來，我們可以調用 glBufferData 函數，將之前定義好的頂點數據複製到該緩衝區的內存中：

```cpp
glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);
```

glBufferData is a function specifically targeted to copy user-defined data into the currently bound buffer. Its first argument is the type of the buffer we want to copy data into: the vertex buffer object currently bound to the GL_ARRAY_BUFFER target. The second argument specifies the size of the data (in bytes) we want to pass to the buffer; a simple sizeof of the vertex data suffices. The third parameter is the actual data we want to send.

glBufferData 是一個專門用於將用戶定義數據複製到當前綁定的緩衝區的函數。它的第一個參數是緩衝的類型：頂點緩衝對象當前綁定到 GL_ARRAY_BUFFER 目標。第二個參數定義了帶發送數據的大小（字節為單位）。調用一個簡單的 sizeof 內置函數即可。第三個參數就是我們要發送的數據了。

The fourth parameter specifies how we want the graphics card to manage the given data. This can take 3 forms:

第四個參數定義了顯示卡管理這些數據的形式，它可以使用以下三種：

GL_STREAM_DRAW: the data is set only once and used by the GPU at most a few times.
GL_STATIC_DRAW: the data is set only once and used many times.
GL_DYNAMIC_DRAW: the data is changed a lot and used many times.

The position data of the triangle does not change, is used a lot, and stays the same for every render call so its usage type should best be GL_STATIC_DRAW. If, for instance, one would have a buffer with data that is likely to change frequently, a usage type of GL_DYNAMIC_DRAW ensures the graphics card will place the data in memory that allows for faster writes.

- GL_STREAM_DRAW: 數據只發送一次，並且通常被 GPU 使用幾次。
- GL_STATIC_DRAW: 數據只發送一次，但是會使用很多次
- GL_DYNAMIC_DRAW: 數據修改了很多，並且使用了多次。

三角形的位置數據沒有修改，使用頻繁，並且每一幀保持不變，因此 usage type 最好設為 GL_STATIC_DRAW。如果有一個包含數據的 buffer 很可能被修改頻繁，GL_DYNAMIC_DRAW 確保顯示卡將這些數據放置在快速寫入內存區。

As of now we stored the vertex data within memory on the graphics card as managed by a vertex buffer object named VBO. Next we want to create a vertex and fragment shader that actually processes this data, so let's start building those.

截至目前，我們已經將頂點數據儲存在顯卡內存中，並通過 VBO（頂點緩衝對象）進行管理。接下來，我們希望創建一個頂點著色器和一個片段著色器，用來實際處理這些數據，那麼讓我們開始動手編寫吧。

## Vertex shader

The vertex shader is one of the shaders that are programmable by people like us. Modern OpenGL requires that we at least set up a vertex and fragment shader if we want to do some rendering so we will briefly introduce shaders and configure two very simple shaders for drawing our first triangle. In the next chapter we'll discuss shaders in more detail.

頂點著色器是可編程著色器中的一個。如果我們想渲染點什麼，現代 OpenGL 需要我們至少設置一個頂點著色器和一個片段著色器。因此我們將簡要地介紹著色器，配置兩個非常簡單的著色器，由此繪製我們的第一個三角形。下一章，我們將深入探討著色器。

The first thing we need to do is write the vertex shader in the shader language GLSL (OpenGL Shading Language) and then compile this shader so we can use it in our application. Below you'll find the source code of a very basic vertex shader in GLSL:

首先，我們需要做的是寫一個頂點著色器，使用的是 glsl 語言（OpenGL 著色語言），然後編譯這個著色器，由此就可在我們的應用當中使用它。以下，你將看到一個非常基礎的頂點著色器的源代碼，它使用的是 glsl 語言：

```cpp
#version 330 core
layout (location = 0) in vec3 aPos;

void main()
{
    gl_Position = vec4(aPos.x, aPos.y, aPos.z, 1.0);
}
```

As you can see, GLSL looks similar to C. Each shader begins with a declaration of its version. Since OpenGL 3.3 and higher the version numbers of GLSL match the version of OpenGL (GLSL version 420 corresponds to OpenGL version 4.2 for example). We also explicitly mention we're using core profile functionality.

如你所見，glsl 看上去和 c 語言類似。每一個著色器開始於一段版本聲明。自從 OpenGL 3.3 以來，glsl 的版本號與 OpenGL 的版本號是對應關係（比如，glsl 版本 420 對應 OpenGL 版本 4.2）。我們也會顯式地告訴我們正在使用的核心配置功能。

Next we declare all the input vertex attributes in the vertex shader with the in keyword. Right now we only care about position data so we only need a single vertex attribute. GLSL has a vector datatype that contains 1 to 4 floats based on its postfix digit. Since each vertex has a 3D coordinate we create a vec3 input variable with the name aPos. We also specifically set the location of the input variable via layout (location = 0) and you'll later see that why we're going to need that location.

接下來，我們在頂點著色器中聲明所有的輸入頂點屬性，使用 in 關鍵字。當前我們只關心位置數據，因此我們只需要一個頂點屬性。GLSL 有一個矢量數據類型，它包含 1 到 4 個浮點數，從關鍵字的數字後綴可見。由於每一個頂點有一個 3D 座標，我們創建一個 vec3 類型的變量，命名為 aPos。我們也特別設置了輸入的 location，通過 `layout (location = 0)`，你後邊會看到為什麼我們需要那個 location。

{% include box.html color="green" content="

#### Vector

In graphics programming we use the mathematical concept of a vector quite often, since it neatly represents positions/directions in any space and has useful mathematical properties. A vector in GLSL has a maximum size of 4 and each of its values can be retrieved via vec.x, vec.y, vec.z and vec.w respectively where each of them represents a coordinate in space. Note that the vec.w component is not used as a position in space (we're dealing with 3D, not 4D) but is used for something called perspective division. We'll discuss vectors in much greater depth in a later chapter.

在圖形編程中，我們常常使用數學概念中的矢量，因為它剛好表達了空間中的位置/方向，也提供了非常有用的數學屬性。GLSL 中的矢量最大緯度為 4，每一維度的值可以通過 vec.x, vec.y, vec.z 以及 ,vec.w 分別讀取，它們各自代表了空間中對應維度的座標值。注意，vec.w 分量在空間位置當中並未用到 （我們面對的是 3D ，不是 4D），但是會用於透視除法。在後邊的章節，我們將會非常深入地討論矢量問題。

" %}

To set the output of the vertex shader we have to assign the position data to the predefined gl_Position variable which is a vec4 behind the scenes. At the end of the main function, whatever we set gl_Position to will be used as the output of the vertex shader. Since our input is a vector of size 3 we have to cast this to a vector of size 4. We can do this by inserting the vec3 values inside the constructor of vec4 and set its w component to 1.0f (we will explain why in a later chapter).

要為頂點著色器設置輸出（output），我們必須將位置信息設置到預定義的變量 gl_Position，它是一個 vec4 類型的值。最後，在 main 函數，不管 gl_Position 被設置為什麼，它都會作為頂點著色器的輸出。因為我們的輸入是一個大小為 3 的矢量，我們必須將它轉化為大小為 4 的矢量。我們可以通過將這個 vec3 類型的值插入到 vec4 構造函數中，並將 w 設置為 1.0f （我們將在稍後章節解釋為什麼這樣）。

The current vertex shader is probably the most simple vertex shader we can imagine because we did no processing whatsoever on the input data and simply forwarded it to the shader's output. In real applications the input data is usually not already in normalized device coordinates so we first have to transform the input data to coordinates that fall within OpenGL's visible region.

這個頂點著色器可能是我們能想像得到的最簡單的頂點著色器了，因為我們沒有對輸入數據做任何處理，只是簡單地將它傳遞給輸出。在實際的應用當中，輸入數據常常不會是落在 NDC 空間裡的，因此我們首先需要將它做一次轉換，使它能夠落入 OpenGL 的可視區域。

## Compiling a shader

We take the source code for the vertex shader and store it in a const C string at the top of the code file for now:

我們拿到頂點著色器的代碼，將其存儲在一個 C 語言字符串常量，目前在文件頭部：

```cpp
const char *vertexShaderSource = "#version 330 core\n"
    "layout (location = 0) in vec3 aPos;\n"
    "void main()\n"
    "{\n"
    "   gl_Position = vec4(aPos.x, aPos.y, aPos.z, 1.0);\n"
    "}\0";
```

In order for OpenGL to use the shader it has to dynamically compile it at run-time from its source code. The first thing we need to do is create a shader object, again referenced by an ID. So we store the vertex shader as an unsigned int and create the shader with glCreateShader:

為了使用著色器，OpenGL 需要在運行時從源碼動態編譯它。首要的事就是我們需要創建一個著色器對象，一樣，它引用於一個 ID。因此我們將這個頂點著色器存儲於一個無符號的整型數字，創建時使用函數 glCreateShader：

```cpp
unsigned int vertexShader;
vertexShader = glCreateShader(GL_VERTEX_SHADER);
```

We provide the type of shader we want to create as an argument to glCreateShader. Since we're creating a vertex shader we pass in GL_VERTEX_SHADER.

我們提供了著色器的類型，它作為 glCreateShader 的一個參數傳入。由於我們是在創建頂點著色器，因此我們傳入的是 GL_VERTEX_SHADER。

Next we attach the shader source code to the shader object and compile the shader:

接下來，我們將源代碼關聯到這個著色器對象並開始編譯它。

```cpp
glShaderSource(vertexShader, 1, &vertexShaderSource, NULL);
glCompileShader(vertexShader);
```

The glShaderSource function takes the shader object to compile to as its first argument. The second argument specifies how many strings we're passing as source code, which is only one. The third parameter is the actual source code of the vertex shader and we can leave the 4th parameter to NULL.

glShaderSource 函數以 shader 對象為第一個參數。第二個參數是我們傳入了多少個字符串，這裡只一個。第三個參數就是著色器的源代碼，我們可以將第四個參數置為 null。

{% include box.html color="green" content="

You probably want to check if compilation was successful after the call to glCompileShader and if not, what errors were found so you can fix those. Checking for compile-time errors is accomplished as follows:

你或許想在調用 glCompileShader 之後檢查一下編譯是否成功，如果沒有成功，那麼你想知道錯誤是什麼，以方便你定位和處理問題。檢查編譯時錯誤可以按照以下方式：

```cpp
int  success;
char infoLog[512];
glGetShaderiv(vertexShader, GL_COMPILE_STATUS, &success);
```

First we define an integer to indicate success and a storage container for the error messages (if any). Then we check if compilation was successful with glGetShaderiv. If compilation failed, we should retrieve the error message with glGetShaderInfoLog and print the error message.

首先，我們定義了一個整型，它表示編譯成功，以及一個存儲容器，它存放錯誤內容（若有）。然後，我們檢查編譯是否成功，這裡使用到 glGetShaderiv。入閣編譯失敗，我們應該得到一個錯誤信息，通過調用 glGetShaderInfoLog 可以得到這個信息。

```cpp
if(!success)
{
    glGetShaderInfoLog(vertexShader, 512, NULL, infoLog);
    std::cout << 'ERROR::SHADER::VERTEX::COMPILATION_FAILED\n' << infoLog << std::endl;
}
```

" %}

If no errors were detected while compiling the vertex shader it is now compiled.

如果編譯時沒有錯誤被檢測到，那它已經編譯通過。

## Fragment shader

The fragment shader is the second and final shader we're going to create for rendering a triangle. The fragment shader is all about calculating the color output of your pixels. To keep things simple the fragment shader will always output an orange-ish color.

要渲染一個三角形，片段著色器時第二個也是最後一個，我們需要創建的著色器。片段著色器用於計算輸出的像素顏色。簡單起見，片段著色器將總是輸出一個橘色。

{% include box.html color="green" content="
Colors in computer graphics are represented as an array of 4 values: the red, green, blue and alpha (opacity) component, commonly abbreviated to RGBA. When defining a color in OpenGL or GLSL we set the strength of each component to a value between 0.0 and 1.0. If, for example, we would set red to 1.0 and green to 1.0 we would get a mixture of both colors and get the color yellow. Given those 3 color components we can generate over 16 million different colors!

顏色在計算機圖形學當中使用一個 4 維數組表達：紅色、綠色、藍色，以及 alpha，通常簡寫為 RGBA。當在 OpenGL 或著 glsl 中定義顏色時，我們設置的是其中每個分量的強度，強度值在 0.0 到 1.0 之間。舉個例子，如果我們設置紅色分量為 1.0，綠色分量為 1.0，我們將得到一個兩個顏色的混合，也就是黃色。使用這 3 個分量，我們可以生成 16,000,000 個不同的顏色。

" %}

```cpp
#version 330 core
out vec4 FragColor;

void main()
{
    FragColor = vec4(1.0f, 0.5f, 0.2f, 1.0f);
}
```

The fragment shader only requires one output variable and that is a vector of size 4 that defines the final color output that we should calculate ourselves. We can declare output values with the out keyword, that we here promptly named FragColor. Next we simply assign a vec4 to the color output as an orange color with an alpha value of 1.0 (1.0 being completely opaque).

片段著色器只需一個輸出變量，它是一個 vec4 結構值，定義了最終輸出的顏色。我們可以使用 out 關鍵字定義輸出值，這裡我們就命名為 FragColor。接下來我們簡單地將一個 vec4 值賦給輸出，它是一個橘色，alpha 為 1.0 （1.0 就是完全不透明）。

The process for compiling a fragment shader is similar to the vertex shader, although this time we use the GL_FRAGMENT_SHADER constant as the shader type:

編譯片段著色器和編譯頂點著色器類似，只是這次我們使用 GL_FRAGMENT_SHADER 作為著色器類型。

```cpp
unsigned int fragmentShader;
fragmentShader = glCreateShader(GL_FRAGMENT_SHADER);
glShaderSource(fragmentShader, 1, &fragmentShaderSource, NULL);
glCompileShader(fragmentShader);
```

Both the shaders are now compiled and the only thing left to do is link both shader objects into a shader program that we can use for rendering. Make sure to check for compile errors here as well!

這兩個著色器現在都已經被編譯，剩下的事就是將兩個著色器對象綁定到著色器程序，使用它我們便可以執行渲染。一樣，確保檢查一下編譯錯誤。

## Shader program

A shader program object is the final linked version of multiple shaders combined. To use the recently compiled shaders we have to link them to a shader program object and then activate this shader program when rendering objects. The activated shader program's shaders will be used when we issue render calls.

著色器程序對象，是多個著色器結合之後的最終鏈接版本。要使用最近編譯的著色器，我們必須將它們鏈接到著色器程序對象，然後渲染物體的時候激活這個程序。這個激活的程序下的著色器將會在我們發起渲染呼叫的時候被使用到。

When linking the shaders into a program it links the outputs of each shader to the inputs of the next shader. This is also where you'll get linking errors if your outputs and inputs do not match.

將著色器關聯到程序，它將每一個著色器的輸出鏈接到下一個著色器的輸入。如果你的輸出和輸入不匹配，在這裡你也可以攔截鏈接錯誤。

Creating a program object is easy:

創建一個程序對象很簡單：

```cpp
unsigned int shaderProgram;
shaderProgram = glCreateProgram();
```

The glCreateProgram function creates a program and returns the ID reference to the newly created program object. Now we need to attach the previously compiled shaders to the program object and then link them with glLinkProgram:

glCreateProgram 函數創建一個程序，返回 id，這個 ID 引用到這個剛創建出來的程序對象。現在我們需要將之前的編譯好的著色器綁定其上，然後使用 glLinkProgram 執行連結。

```cpp
glAttachShader(shaderProgram, vertexShader);
glAttachShader(shaderProgram, fragmentShader);
glLinkProgram(shaderProgram);
```

The code should be pretty self-explanatory, we attach the shaders to the program and link them via glLinkProgram.

這段代碼非常完美地進行了自解釋，我們使用 glLinkProgram 將著色器綁定到程序。

{% include box.html color="green" content="
Just like shader compilation we can also check if linking a shader program failed and retrieve the corresponding log. However, instead of using glGetShaderiv and glGetShaderInfoLog we now use:

就像著色器編譯，我們也可以檢查連結操作成功與否，並獲得對應的日誌。當然，這裡不是使用 glGetShaderiv，而是 glGetShaderInfoLog：

```cpp
glGetProgramiv(shaderProgram, GL_LINK_STATUS, &success);
if(!success) {
    glGetProgramInfoLog(shaderProgram, 512, NULL, infoLog);
    ...
}
```

" %}

The result is a program object that we can activate by calling glUseProgram with the newly created program object as its argument:

最後我們得到一個可以通過調用 glUseProgram 函數激活的程序對象，它作為其參數：

```cpp
glUseProgram(shaderProgram);
```

Every shader and rendering call after glUseProgram will now use this program object (and thus the shaders).

使用 glUseProgram 之後，每一個著色器，以及渲染呼叫，都是使用這個程序對象（因此也包含其中關聯的著色器）。

Oh yeah, and don't forget to delete the shader objects once we've linked them into the program object; we no longer need them anymore:

喔，媽的，不要忘記刪除著色器對象了，因為在一旦我們將它們關聯之後，我們就不再需要它們了。

```cpp
glDeleteShader(vertexShader);
glDeleteShader(fragmentShader);
```

Right now we sent the input vertex data to the GPU and instructed the GPU how it should process the vertex data within a vertex and fragment shader. We're almost there, but not quite yet. OpenGL does not yet know how it should interpret the vertex data in memory and how it should connect the vertex data to the vertex shader's attributes. We'll be nice and tell OpenGL how to do that.

現在，我們將頂點數據發送給 GPU，並且告訴 GPU 如何在兩個著色器中處理這些頂點數據。我們做得差不多了，但是還有一點事情要做。OpenGL 並不知道如何從內存中解析頂點數據，也不知道如何將頂點數據連結到頂點著色器的屬性。我們最好告訴 OpenGL 該如何做這件事。

## Linking Vertex Attributes

The vertex shader allows us to specify any input we want in the form of vertex attributes and while this allows for great flexibility, it does mean we have to manually specify what part of our input data goes to which vertex attribute in the vertex shader. This means we have to specify how OpenGL should interpret the vertex data before rendering.

以頂點屬性的形式，頂點著色器允許我們輸入任何內容，這給了我們極大的靈活性。它意味著，我們必須手動的地說明數據的哪些部分走入著色器的哪個屬性。

Our vertex buffer data is formatted as follows:

我們的頂點緩衝數據的格式如下：

{% include img.html src="https://learnopengl.com/img/getting-started/vertex_attribute_pointer.png" %}

- The position data is stored as 32-bit (4 byte) floating point values.
- Each position is composed of 3 of those values.
- There is no space (or other values) between each set of 3 values. The values are tightly packed in the array.
- The first value in the data is at the beginning of the buffer.

- 位置數據以 32 位 （4 字節）浮點數存儲
- 每個位置由 3 個這樣類型的數字組成
- 這 3 個數值之間再無其它內容，它們被緊密的壓縮在一個數組當中
- 數組的第一個值在 buffer 的開頭。

With this knowledge we can tell OpenGL how it should interpret the vertex data (per vertex attribute) using glVertexAttribPointer:

有了這些知識，我們可以告訴 OpenGL 如何通過 glVertexAttribPointer 解析頂點數據（頂點屬性）：

```cpp
glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(float), (void*)0);
glEnableVertexAttribArray(0);
```

The function glVertexAttribPointer has quite a few parameters so let's carefully walk through them:

函數 glVertexAttribPointer 有為數不多的幾個參數，讓我們來仔過一遍：

- The first parameter specifies which vertex attribute we want to configure. Remember that we specified the location of the position vertex attribute in the vertex shader with layout (location = 0). This sets the location of the vertex attribute to 0 and since we want to pass data to this vertex attribute, we pass in 0.

- 第一個參數用於說明哪個頂點屬性將被配置。記住，我們使用 layout （location = 0）指定頂點屬性的位置。這樣就可以將屬性的位置設置為 0，因為我們要將數據發送到這個屬性上，傳入 0。

- The next argument specifies the size of the vertex attribute. The vertex attribute is a vec3 so it is composed of 3 values.

- 第二個參數指定屬性的 size，頂點屬性是一個 vec3 結構，因此它由 3 個值組成。

- The third argument specifies the type of the data which is GL_FLOAT (a vec\* in GLSL consists of floating point values).

- 第三個參數指定數據的類型，這裡為 GL_FLOAT （一個 GLSL 浮點型矢量結構）。

- The next argument specifies if we want the data to be normalized. If we're inputting integer data types (int, byte) and we've set this to GL_TRUE, the integer data is normalized to 0 (or -1 for signed
  data) and 1 when converted to float. This is not relevant for us so we'll leave this at GL_FALSE.

- 接下來，第四個參數指明我們的數據是否需要被歸一化。如果 我們輸入整型數據（int 或著 byte），我們設置其為 GL_TRUE，整型數據向浮點型轉化，會被歸一化為 0（或著是 -1，對於有符號類型）和 1。這和我們沒什麼關係，因此我們將其設置為 GL_FALSE。

- The fifth argument is known as the stride and tells us the space between consecutive vertex attributes. Since the next set of position data is located exactly 3 times the size of a float away we specify that value as the stride. Note that since we know that the array is tightly packed (there is no space between the next vertex attribute value) we could've also specified the stride as 0 to let OpenGL determine the stride (this only works when values are tightly packed). Whenever we have more vertex attributes we have to carefully define the spacing between each vertex attribute but we'll get to see more examples of that later on.

- 第五個參數，步長，它告訴我們在連貫的頂點屬性中的空間大小。因為下一個位置數據剛好在浮點型數值大小的 3 倍處，因此我們將這個計算值設置為步長。注意，由於我們知道數組是被緊密排列的（兩個值之間是沒有間隙的），我們也可以將步長設置為 0，讓 OpenGL 自行確定（這只適用於緊密排列的情況）。如果我們有更多的頂點屬性，我麼還必須仔細定義好屬性之間的間隙，我們後邊會遇到很多這樣的例子。

- The last parameter is of type void\* and thus requires that weird cast. This is the offset of where the position data begins in the buffer. Since the position data is at the start of the data array this value is just 0. We will explore this parameter in more detail later on。

- 最後一個參數，其類型為 void\*，因此需要一個奇怪的轉化。它是位置數據在緩衝起始的偏移。因為位置數據在數組的開頭，因此它的值被設置為 0。我們將稍後詳細了解這個參數。

{% include box.html color="green" content="
Each vertex attribute takes its data from memory managed by a VBO and which VBO it takes its data from (you can have multiple VBOs) is determined by the VBO currently bound to GL_ARRAY_BUFFER when calling glVertexAttribPointer. Since the previously defined VBO is still bound before calling glVertexAttribPointer vertex attribute 0 is now associated with its vertex data.

每個頂點屬性都會從由 VBO（頂點緩衝對象）管理的內存中獲取數據。它從哪個 VBO 獲取數據，取決於調用 glVertexAttribPointer 時當前綁定到 GL_ARRAY_BUFFER 的 VBO（因為你可以有多個 VBO）。由於在調用 glVertexAttribPointer 之前，之前定義的 VBO 仍然是綁定狀態，所以頂點屬性 0 現在就與這個 VBO 中的頂點數據建立了關聯。
" %}

Now that we specified how OpenGL should interpret the vertex data we should also enable the vertex attribute with glEnableVertexAttribArray giving the vertex attribute location as its argument; vertex attributes are disabled by default. From that point on we have everything set up: we initialized the vertex data in a buffer using a vertex buffer object, set up a vertex and fragment shader and told OpenGL how to link the vertex data to the vertex shader's vertex attributes. Drawing an object in OpenGL would now look something like this:

現在，我們向 OpenGL 指明了該如何解析頂點數據，我們也需要使用 glEnableVertexAttribArray 開啟頂點屬性，並傳入屬性的位置作為其第一個參數。頂點屬性默認是關閉的。從此開始，我們已經設置好一切：使用頂點緩衝對象對頂點數據進行了初始化；設置了一個頂點和片段著色器，並且告訴了 OpenGL 如何連接頂點數據到著色器的頂點屬性。使用 OpenGL 繪製一個物體看上去是這樣的：

```cpp
// 0. copy our vertices array in a buffer for OpenGL to use
glBindBuffer(GL_ARRAY_BUFFER, VBO);
glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);
// 1. then set the vertex attributes pointers
glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(float), (void*)0);
glEnableVertexAttribArray(0);
// 2. use our shader program when we want to render an object
glUseProgram(shaderProgram);
// 3. now draw the object
someOpenGLFunctionThatDrawsOurTriangle();
```

We have to repeat this process every time we want to draw an object. It may not look like that much, but imagine if we have over 5 vertex attributes and perhaps 100s of different objects (which is not uncommon). Binding the appropriate buffer objects and configuring all vertex attributes for each of those objects quickly becomes a cumbersome process. What if there was some way we could store all these state configurations into an object and simply bind this object to restore its state?

每次我們要繪製一個物體時，都需要重複這些步驟。這看起來似乎沒什麼，但試想一下：如果我們有超過 5 個頂點屬性，並且有上百個不同的物體（這在實際應用中並不少見），那麼綁定正確的緩衝對象並為每個物體配置頂點屬性，很快就會變成一個繁瑣的工作。如果有一種方法能夠將這些狀態配置統一存儲到某個對象中，然後只需綁定這個對象就能恢復所有狀態，那該多好？

### Vertex Array Object

A vertex array object (also known as VAO) can be bound just like a vertex buffer object and any subsequent vertex attribute calls from that point on will be stored inside the VAO. This has the advantage that when configuring vertex attribute pointers you only have to make those calls once and whenever we want to draw the object, we can just bind the corresponding VAO. This makes switching between different vertex data and attribute configurations as easy as binding a different VAO. All the state we just set is stored inside the VAO.

頂點數組對象 （簡稱 VAO）可被綁定，就像頂點緩衝對象那樣，並且任何頂點屬性的子序列呼叫都會被存儲到 VAO。這就有了一種好處，當配置頂點屬性指針，你只需調用它們一次，而且當我們想繪製這個物體的時候，我們可以綁定對應的 VAO。這讓對頂點數據和頂點屬性配置的切換變簡化為一個對 VBO 綁定的操作。我們設置的全部狀態都會被存入 VAO。

{% include box.html color="red" content="
Core OpenGL requires that we use a VAO so it knows what to do with our vertex inputs. If we fail to bind a VAO, OpenGL will most likely refuse to draw anything.

OpenGL 的核心需要我們使用 VAO，從而它知道如何處理我們的頂點輸入，如果我們綁定 VAO 失敗，OpenGL 大概率會拒絕執行任何繪製。
" %}

A vertex array object stores the following:

一個頂點數組對象保存了以下內容：

- Calls to glEnableVertexAttribArray or glDisableVertexAttribArray.

- 調用 glEnableVertexAttribArray 或著 glDisableVertexAttribArray

- Vertex attribute configurations via glVertexAttribPointer.

-  通過 glVertexAttribPointer 進行頂點屬性配置

- Vertex buffer objects associated with vertex attributes by calls to glVertexAttribPointer.

- 通過調用 glVertexAttribPointer，對頂點緩衝對象關聯到頂點屬性。

{% include img.html src="https://learnopengl.com/img/getting-started/vertex_array_objects.png" %}

The process to generate a VAO looks similar to that of a VBO:

生成一個 VBO 的方式類似於 VBO：

```cpp
unsigned int VAO;
glGenVertexArrays(1, &VAO);
```

To use a VAO all you have to do is bind the VAO using glBindVertexArray. From that point on we should bind/configure the corresponding VBO(s) and attribute pointer(s) and then unbind the VAO for later use. As soon as we want to draw an object, we simply bind the VAO with the preferred settings before drawing the object and that is it. In code this would look a bit like this:

要使用 VAO，你需要做的全部事情是使用 glBindVertexArray 綁定這個 VAO。然後，我們應該綁定/配置對應的 VBO 以及屬性指針，接著，對 VAO 解綁以用於後續。一旦我們要繪製一個物體，首先，我們簡單地使用偏好設置綁定這個 VAO，僅此而已。代碼層面差不多這樣：

```cpp
// ..:: Initialization code (done once (unless your object frequently changes)) :: ..
// 1. bind Vertex Array Object
glBindVertexArray(VAO);
// 2. copy our vertices array in a buffer for OpenGL to use
glBindBuffer(GL_ARRAY_BUFFER, VBO);
glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);
// 3. then set our vertex attributes pointers
glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(float), (void*)0);
glEnableVertexAttribArray(0);


[...]

// ..:: Drawing code (in render loop) :: ..
// 4. draw the object
glUseProgram(shaderProgram);
glBindVertexArray(VAO);
someOpenGLFunctionThatDrawsOurTriangle();
```

And that is it! Everything we did the last few million pages led up to this moment, a VAO that stores our vertex attribute configuration and which VBO to use. Usually when you have multiple objects you want to draw, you first generate/configure all the VAOs (and thus the required VBO and attribute pointers) and store those for later use. The moment we want to draw one of our objects, we take the corresponding VAO, bind it, then draw the object and unbind the VAO again.

就這些了！一切

### The triangle we've all been waiting for

To draw our objects of choice, OpenGL provides us with the glDrawArrays function that draws primitives using the currently active shader, the previously defined vertex attribute configuration and with the VBO's vertex data (indirectly bound via the VAO).

```cpp
glUseProgram(shaderProgram);
glBindVertexArray(VAO);
glDrawArrays(GL_TRIANGLES, 0, 3);
```

The glDrawArrays function takes as its first argument the OpenGL primitive type we would like to draw. Since I said at the start we wanted to draw a triangle, and I don't like lying to you, we pass in GL_TRIANGLES. The second argument specifies the starting index of the vertex array we'd like to draw; we just leave this at 0. The last argument specifies how many vertices we want to draw, which is 3 (we only render 1 triangle from our data, which is exactly 3 vertices long).

Now try to compile the code and work your way backwards if any errors popped up. As soon as your application compiles, you should see the following result:

{% include img.html src="https://learnopengl.com/img/getting-started/hellotriangle.png" %}

The source code for the complete program can be found [here](https://learnopengl.com/code_viewer_gh.php?code=src/1.getting_started/2.1.hello_triangle/hello_triangle.cpp) .

If your output does not look the same you probably did something wrong along the way so check the complete source code and see if you missed anything.

## Element Buffer Objects

There is one last thing we'd like to discuss when rendering vertices and that is element buffer objects abbreviated to EBO. To explain how element buffer objects work it's best to give an example: suppose we want to draw a rectangle instead of a triangle. We can draw a rectangle using two triangles (OpenGL mainly works with triangles). This will generate the following set of vertices:

```cpp
float vertices[] = {
    // first triangle
     0.5f,  0.5f, 0.0f,  // top right
     0.5f, -0.5f, 0.0f,  // bottom right
    -0.5f,  0.5f, 0.0f,  // top left
    // second triangle
     0.5f, -0.5f, 0.0f,  // bottom right
    -0.5f, -0.5f, 0.0f,  // bottom left
    -0.5f,  0.5f, 0.0f   // top left
};
```

As you can see, there is some overlap on the vertices specified. We specify bottom right and top left twice! This is an overhead of 50% since the same rectangle could also be specified with only 4 vertices, instead of 6. This will only get worse as soon as we have more complex models that have over 1000s of triangles where there will be large chunks that overlap. What would be a better solution is to store only the unique vertices and then specify the order at which we want to draw these vertices in. In that case we would only have to store 4 vertices for the rectangle, and then just specify at which order we'd like to draw them. Wouldn't it be great if OpenGL provided us with a feature like that?

Thankfully, element buffer objects work exactly like that. An EBO is a buffer, just like a vertex buffer object, that stores indices that OpenGL uses to decide what vertices to draw. This so called indexed drawing is exactly the solution to our problem. To get started we first have to specify the (unique) vertices and the indices to draw them as a rectangle:

```cpp
float vertices[] = {
     0.5f,  0.5f, 0.0f,  // top right
     0.5f, -0.5f, 0.0f,  // bottom right
    -0.5f, -0.5f, 0.0f,  // bottom left
    -0.5f,  0.5f, 0.0f   // top left
};
unsigned int indices[] = {  // note that we start from 0!
    0, 1, 3,   // first triangle
    1, 2, 3    // second triangle
};
```

You can see that, when using indices, we only need 4 vertices instead of 6. Next we need to create the element buffer object:

```cpp
unsigned int EBO;
glGenBuffers(1, &EBO);
```

Similar to the VBO we bind the EBO and copy the indices into the buffer with glBufferData. Also, just like the VBO we want to place those calls between a bind and an unbind call, although this time we specify GL_ELEMENT_ARRAY_BUFFER as the buffer type.

```cpp
glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, EBO);
glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(indices), indices, GL_STATIC_DRAW);
```

Note that we're now giving GL_ELEMENT_ARRAY_BUFFER as the buffer target. The last thing left to do is replace the glDrawArrays call with glDrawElements to indicate we want to render the triangles from an index buffer. When using glDrawElements we're going to draw using indices provided in the element buffer object currently bound:

```cpp
glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, EBO);
glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_INT, 0);
```

The first argument specifies the mode we want to draw in, similar to glDrawArrays. The second argument is the count or number of elements we'd like to draw. We specified 6 indices so we want to draw 6 vertices in total. The third argument is the type of the indices which is of type GL_UNSIGNED_INT. The last argument allows us to specify an offset in the EBO (or pass in an index array, but that is when you're not using element buffer objects), but we're just going to leave this at 0.

The glDrawElements function takes its indices from the EBO currently bound to the GL_ELEMENT_ARRAY_BUFFER target. This means we have to bind the corresponding EBO each time we want to render an object with indices which again is a bit cumbersome. It just so happens that a vertex array object also keeps track of element buffer object bindings. The last element buffer object that gets bound while a VAO is bound, is stored as the VAO's element buffer object. Binding to a VAO then also automatically binds that EBO.

{% include img.html src="https://learnopengl.com/img/getting-started/vertex_array_objects_ebo.png" %}

{% include box.html color="red" content="
A VAO stores the glBindBuffer calls when the target is GL_ELEMENT_ARRAY_BUFFER. This also means it stores its unbind calls so make sure you don't unbind the element array buffer before unbinding your VAO, otherwise it doesn't have an EBO configured.
" %}

The resulting initialization and drawing code now looks something like this:

```cpp
// ..:: Initialization code :: ..
// 1. bind Vertex Array Object
glBindVertexArray(VAO);
// 2. copy our vertices array in a vertex buffer for OpenGL to use
glBindBuffer(GL_ARRAY_BUFFER, VBO);
glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);
// 3. copy our index array in a element buffer for OpenGL to use
glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, EBO);
glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(indices), indices, GL_STATIC_DRAW);
// 4. then set the vertex attributes pointers
glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(float), (void*)0);
glEnableVertexAttribArray(0);

[...]

// ..:: Drawing code (in render loop) :: ..
glUseProgram(shaderProgram);
glBindVertexArray(VAO);
glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_INT, 0);
glBindVertexArray(0);
```

Running the program should give an image as depicted below. The left image should look familiar and the right image is the rectangle drawn in wireframe mode. The wireframe rectangle shows that the rectangle indeed consists of two triangles.

{% include img.html src="https://learnopengl.com/img/getting-started/hellotriangle2.png" %}

{% include box.html color="green" content="
*Wireframe mode*
To draw your triangles in wireframe mode, you can configure how OpenGL draws its primitives via glPolygonMode(GL_FRONT_AND_BACK, GL_LINE). The first argument says we want to apply it to the front and back of all triangles and the second line tells us to draw them as lines. Any subsequent drawing calls will render the triangles in wireframe mode until we set it back to its default using glPolygonMode(GL_FRONT_AND_BACK, GL_FILL).
" %}

If you have any errors, work your way backwards and see if you missed anything. You can find the complete source code here.

If you managed to draw a triangle or a rectangle just like we did then congratulations, you managed to make it past one of the hardest parts of modern OpenGL: drawing your first triangle. This is a difficult part since there is a large chunk of knowledge required before being able to draw your first triangle. Thankfully, we now made it past that barrier and the upcoming chapters will hopefully be much easier to understand.

## Additional resources

- [antongerdelan.net/hellotriangle](http://antongerdelan.net/opengl/hellotriangle.html): Anton Gerdelan's take on rendering the first triangle.
- [open.gl/drawing](https://open.gl/drawing): Alexander Overvoorde's take on rendering the first triangle.
- [antongerdelan.net/vertexbuffers](http://antongerdelan.net/opengl/vertexbuffers.html): some extra insights into vertex buffer objects.
- [learnopengl.com/In-Practice/Debugging](https://learnopengl.com/In-Practice/Debugging): there are a lot of steps involved in this chapter; if you're stuck it may be worthwhile to read a bit on debugging in OpenGL (up until the debug output section).
