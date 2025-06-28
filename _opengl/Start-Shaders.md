---
layout: bookdetail
chapter: 六
description: "上章提到，著色器是運行在 GPU 上的小程序。這些程序運行在圖形管線的各個部分。基本來講，著色器不過是將輸入轉換為輸出的程序。著色器同時也是彼此隔離的，它們之間不允許有通訊，唯一的通訊途徑是通過輸入和輸出。"
title: 开始 &bull; 著色器
category: tech
src: https://learnopengl.com/Getting-started/Shaders
date: 2025-06-01
book: opengl
order: 6
permalink: /opengl/Start/Shaders
glcate: Start
gltopic: Shaders
---

[上章]({{page.previous.url}})提到，著色器是運行在 GPU 上的小程序。這些程序運行在圖形管線的各個部分。基本來講，著色器不過是將輸入轉換為輸出的程序。著色器同時也是彼此隔離的，它們之間不允許有通訊，唯一的通訊途徑是通過輸入和輸出。

在上一章，我們簡要地介紹了著色器的表面概念，以及如何正確地使用它們。現在我們來解釋什麼是著色器，通常來說，它們就是指 OpenGL Shading Language。

## GLSL

著色器使用類 C 語言 GLSL 編寫。GLSL 是專門為計算機圖形設計的，包含了有用地特性，特別是針對 `vector` （向量）和 `matrix` （矩陣）操作。

著色器總是開始於版本聲明，跟隨的是一段輸入輸出變量、統一變量（uniforms）、以及 `main` 函數。每一個著色器的入口都是它的 `main` 函數，於此我們會處理輸入變量，以及使用輸出變量輸出結果。不要擔心，如果你不知道什麼是 uniforms，我們很快就會涉及。

一個經典的著色器具備以下結構：

```cpp

#version version_number
in type in_variable_name;
in type in_variable_name;

out type out_variable_name;

uniform type uniform_name;

void main()
{
  // process input(s) and do some weird graphics stuff
  ...
  // output processed stuff to output variable
  out_variable_name = weird_stuff_we_processed;
}
```

當我們談論頂點著色器，每一個輸入變量也被稱為頂點屬性。硬件對頂點屬性的最大數量是有限制的。OpenGL 確保至少有 16 個 4 分量的頂點屬性可供使用，但是有些硬件或許允許更多，你可以通過訪問 `GL_MAX_VERTEX_ATTRIBS` 獲得：

```cpp
int nrAttributes;
glGetIntegerv(GL_MAX_VERTEX_ATTRIBS, &nrAttributes);
std::cout << "Maximum nr of vertex attributes supported: " << nrAttributes << std::endl;
```

這總是返回最小值 16，對於大多數情況應該都綽綽有餘。

## 類型

和其它編程語言類似，GLSL 有一套數據類型，用於指定我們想使用變量的類型。GLSL 擁有一組來自 C 語言的基本數據類型：`int、float、double、unit`，以及 `bool`。GLSL 也包含了兩個我們會經常使用到的容器類型，分別是 `vector` 和 `matrix`。我們會在後邊的章節討論 `matrix`。

**向量 （Vector）**

GLSL 中的 `vector` 是一個 2、3 或著 4 分量的容器，分量的類型也就是我們方才提到的基本數據類型。它們可以是以下形式（`n` 代表分量的數量）

- _vecn_: n 個浮點型數值分量的默認向量
- _bvecn_: n 個布爾型分量的向量
- _ivecn_: n 個整型分量的向量
- _uvecn_: n 個無符號整型分量的向量
- _dvecn_: n 個雙浮點型分量的向量

大多數時候，我們使用 `vecn`，因為浮點型適用於大部分情況。

向量的分量可以通過 `vec.x` 來訪問，這裡 `x` 是向量的第一個分量。你可以使用 `.x`, `.y`, `.z` 以及 `w` 分別訪問它們的第二個、第三個以及第四個分量。 GLSL 也允許你針對色值使用 `rgba`，或著針對文理座標使用 `stpq`，訪問到相同的分量。

向量使你能夠進行一些有趣和靈活的分量選擇操作，稱之為 swizzling。Swizzling 允許我們使用類似以下語法：

```cpp
vec2 someVec;
vec4 differentVec = someVec.xyxx;
vec3 anotherVec = differentVec.zyw;
vec4 otherVec = someVec.xxxx + anotherVec.yxzy;
```

你可以使用至多 4 的字母的組合來創建一個新的向量 （相同的類型），只要原向量有這些分量即可；舉個例子，訪問 `vec2` 類型向量的 `z` 分量是不被允許的。我們同樣可以將向量作為參數傳入其它向量的構造函數，這樣減少了所需參數的數量：

```cpp
vec2 vect = vec2(0.5, 0.7);
vec4 result = vec4(vect, 0.0, 0.0);
vec4 otherResult = vec4(result.xyz, 1.0);
```

向量因此是一種非常靈活的數據類型，我們將其用於各種輸入和輸出。在這本書中，你講會看到大量關於我們如何創意性地使用向量的例子。

## 輸入和輸出（Ins and outs）

著色器本身是一種非常小巧而獨立的程序，但是它們是整個系統的一部分，我們因此需要為每一個著色器配置輸入和輸出，這樣我們才可以讓它們彼此傳遞信息。GLSL 專門為此定義了 `in` 和 `out` 關鍵字。每一個著色器可以通過此關鍵字聲明自己的 inputs 和 outputs，只要輸出變量和下一個著色器的輸入**對應**上，它們就會被傳遞過去。雖然頂點和片段著色器略有不同。

頂點著色器應該接受某種形式的輸入，否則它將沒有效果。頂點著色器的輸入有所不同，因為它直接從頂點數據獲取輸入。为了定義頂點數據的組織方式，我們使用 `location metadata` 指定輸入變量，这样我們就可以在 CPU 上配置頂點屬性（vertex attributes）。我們在上一章已經看到了這樣的表述： `layout (location = 0)` 。因而，頂點著色器的輸入需要額外的 `layout` 規範，以使我們能夠連結頂點數據。

{% include box.html color="green" content="

也可以忽略 `layout (location = 0)` 這個指定，而在 OpenGL 代碼中使用 `glGetAttribLocation` 來查詢屬性的 `locations`，但是我更偏向在著色器中設置它們。它不難理解，而且可以省去你（以及 OpenGL）的一些工作。

" %}

另一個不同是片段著色器需要一個 `vec4` 類型的顏色輸出變量，這是由於片段著色器需要生成最終的顏色。如果你在片段著色器中指定的顏色輸出不正確，那麼著色器的顏色緩衝將是 `undefined` （通常意味著 OpenGL 將會將它們渲染為黑色或者白色）。

因此，如果我們希望從一個著色器發送數據到另一個，必須在發送端著色器聲明輸出，並在接受端著色器聲明輸入。在兩端，當類型和名字匹配上，OpenGL 將會對這些變量進行關聯，從而，著色器之間發送數據成為可能（這是在連結到程序對象之後完成的）。為了展示這是如何工作的，我們將修改上一章出現的著色器代碼，讓頂點著色器決定片段著色器的輸出顏色。

**Vertex shader**

```c
#version 330 core
layout (location = 0) in vec3 aPos; // the position variable has attribute position 0

out vec4 vertexColor; // specify a color output to the fragment shader

void main()
{
    gl_Position = vec4(aPos, 1.0); // see how we directly give a vec3 to vec4's constructor
    vertexColor = vec4(0.5, 0.0, 0.0, 1.0); // set the output variable to a dark-red color
}
```

**Fragment shader**

```c
#version 330 core
out vec4 FragColor;

in vec4 vertexColor; // the input variable from the vertex shader (same name and same type)

void main()
{
    FragColor = vertexColor;
}
```

你可以看到我們在頂點著色器中聲明了一個變量 `vertexColor`，它是一個 `vec4` 結構的輸出，並且我們也在片段著色器中聲明了一個類似的 `vertexColor` 的輸入。由於它們擁有一致的類型和名稱，片段著色器中的 `vertexColor` 會關聯到頂點著色器。因為我們在頂點著色器中將顏色設置為 `dark-red`，那麼片段著色器中也必定是 `dark-red` 顏色。下面這張圖顯示了輸出的結果：

{% include img.html src="https://learnopengl.com/img/getting-started/shaders.png" %}

搞定！我們成功將值從頂點著色器傳遞到了片段著色器。讓我們加點變化吧，看看我們是否可以將顏色從我們的應用發送到片段著色器！

## 統一變量

統一變量（uniforms）是將數據從 CPU 端應用傳遞至 GPU 端著色器的另一種方式。但統一變量和頂點屬性存在輕微的**差別**。首先，統一變量是**全局**的。全局者，意味著對每一個著色器程序對象而言，它們是唯一的，並且可以被任何階段的著色器訪問到。其次，不管你將統一變量設置為何物，它都將保持不變，直至它被重置或更新。

要在 GLSL 中聲明一個統一變量，我們簡單地對著色器加上一個 uniform 關鍵字，以及指定變量的類型與名字。這樣，我們可以使用方才在著色器中聲明的 uniform。現在，看看如果我們將三角形的顏色以 uniform 的方式設置會如何：

```c
#version 330 core
out vec4 FragColor;

uniform vec4 ourColor; // we set this variable in the OpenGL code.

void main()
{
    FragColor = ourColor;
}
```

我們在片段著色器中聲明了一個 `uniform` 變量，`vec4 ourColor`，並且將片段的輸出設置為整個統一變量的值。由於統一變量是全局性的，我們可在任意著色器階段中定義它，而無需回到頂點著色器獲取。我們沒有在頂點著色器使用這個統一變量，因此無需去定義它。

{% include box.html color="red" content="

如果你聲明的統一變量在你的 GLSL 代碼中從未用到，編譯器會在編譯期間悄悄將其移除，這導致了一些令人困惑的錯誤，所以記住這點！

" %}

統一變量目前是空的；我們還沒有向它添加任何數據，那麼讓我們來處理這個問題。我們首先需要找到著色器中該統一變量屬性的 `index` 或者 `location`。一旦我們有了 `index` 或者 `location`，我們就可以更新它的值。讓我們來點好玩的，不是將單一顏色設置到片段著色器，而是隨著時間去漸漸改變這個顏色：

```c
float timeValue = glfwGetTime();
float greenValue = (sin(timeValue) / 2.0f) + 0.5f;
int vertexColorLocation = glGetUniformLocation(shaderProgram, "ourColor");
glUseProgram(shaderProgram);
glUniform4f(vertexColorLocation, 0.0f, greenValue, 0.0f, 1.0f);
```

首先，我們通過 `glfwGetTime()` 獲取運行時間，單位是秒。然後我們讓顏色值在 `0.0` - `1.0` 之間變化，這裡使用到的是 `sin` 函數，並將它保存至 `greenValue`。

接下來，我們使用 `glGetUniformLocation` 查詢 `ourColor` 的位置 （location）。我們向這個查詢函數提供了著色器程序以及統一變量的名字（我們想要從此處讀取）。如果 `glGetUniformLocation` 返回了 `-1`，那就是位置沒有被找到。最後，我們可以使用 `glUniform4f` 函數設置 `uniform` 的值。注意，查找 `uniform` 位置並不需要先使用著色器程序，但是更新一個 `uniform` 卻需要你使用著色器程序（通過調用 `glUseProgram`），因為，這是對當前激活（使用中的）的著色器程序進行操作。

{% include box.html color="green" content="

由於 OpenGL 本質上是一個 C 語言庫，它無法支持原生的函數重載，因此，但凡函數需要使用不同的數據類型，OpenGL 就需要為每一個類型定義一個新函數。`glUniform` 就是一個極好的例子。它以一個特定的後綴來聲明你需要設置的 `uniform` 類型。其中幾個後綴如下：

- **f**: 函數期望一個浮點型作為其值
- **i**: 函數期望一個整型作為其值
- **ui**: 函數期望一個無符號整型作為其值
- **3f**: 函數期望三個浮點型作為其值
- **fv**: 函數期望一個浮點型向量/數組作為其值

在你要配置 OpenGL 選項的時候，只需選擇其中和你所需類型匹配的重載函數即可。在我們的例子當中，我們希望對此 uniform 變量設置 4 個浮點型數，因此我們使用 glUniform4f 傳入我們數據（注意，我們亦可使用 fv 這個選項）。

" %}

現在，我們知道了如何對統一變量設置值，我們可以使用它們來執行渲染。如果我們希望顏色出現漸變，我們想要每一幀都更新這個 uniform 變量，否則如果我們只是設置一次的話，三角形只會維持一個實心顏色不變。如此，我們計算 `greenValue`，並且更新在每一個渲染迭代（幀）設置這個 uniform 變量。

```c
while(!glfwWindowShouldClose(window))
{
    // input
    processInput(window);

    // render
    // clear the colorbuffer
    glClearColor(0.2f, 0.3f, 0.3f, 1.0f);
    glClear(GL_COLOR_BUFFER_BIT);

    // be sure to activate the shader
    glUseProgram(shaderProgram);

    // update the uniform color
    float timeValue = glfwGetTime();
    float greenValue = sin(timeValue) / 2.0f + 0.5f;
    int vertexColorLocation = glGetUniformLocation(shaderProgram, "ourColor");
    glUniform4f(vertexColorLocation, 0.0f, greenValue, 0.0f, 1.0f);

    // now render the triangle
    glBindVertexArray(VAO);
    glDrawArrays(GL_TRIANGLES, 0, 3);

    // swap buffers and poll IO events
    glfwSwapBuffers(window);
    glfwPollEvents();
}
```

這段代碼是對先前程式碼做的相對簡單的改寫。這一回，我們在每一幀繪製三角形之前，更新統一變量的值。如果你更新統一變量正確的話，你應該看到三角形的顏色出現漸變動畫，從綠色到黑色，然後回到綠色。

<video autoplay controls width="600" height="450">
  <source src="https://learnopengl.com/video/getting-started/shaders.mp4" type="video/mp4">
</video>

如果你遇到了阻塞，對照一下[源代碼](https://learnopengl.com/code_viewer_gh.php?code=src/1.getting_started/3.1.shaders_uniform/shaders_uniform.cpp)。

你可以看到，對於每一幀都需要改變的那些屬性的設定，uniforms 是一種有效的工具；或者，對於你的應用和你的著色器之間進行數據交換，它也是如此。但是，如果你想為每一個頂點設置一個顏色，該如何呢？那種情況，我們必須聲明跟頂點數目一樣多的 uniform 變量。一個好的解決方案將會是，在頂點屬性包含更多信息，這是我們接下來就觸及的問題。

## 更多的屬性 （more attributes）

我們在上一章知道了如何填充 VBO，配置頂點屬性指針，然後將其保存在一個 VAO 當中。這回，我們同樣希望將顏色數據添加至頂點數據當中。我們將顏色以 3 個浮點數保存至頂點數組。我們對三角形的每一個**角**分別設置 `red`、`green` 和 `blue` 三個分量。

```c
float vertices[] = {
    // positions         // colors
     0.5f, -0.5f, 0.0f,  1.0f, 0.0f, 0.0f,   // bottom right
    -0.5f, -0.5f, 0.0f,  0.0f, 1.0f, 0.0f,   // bottom left
     0.0f,  0.5f, 0.0f,  0.0f, 0.0f, 1.0f    // top
};
```

以我們現在有了更多的數據要發送至頂點著色器，有必要調整一下它，讓它也能夠以頂點屬性的方式接收到顏色值。注意，我們將屬性 `aColor` 的 `location` 設置為 `1`，使用 `layout` 關鍵字指定：

```c

#version 330 core
layout (location = 0) in vec3 aPos;   // the position variable has attribute position 0
layout (location = 1) in vec3 aColor; // the color variable has attribute position 1

out vec3 ourColor; // output a color to the fragment shader

void main()
{
    gl_Position = vec4(aPos, 1.0);
    ourColor = aColor; // set ourColor to the input color we got from the vertex data
}
```

以我們不再使用 uniform 表示片段著色器的顏色值，而是使用頂點著色器的 `ourColor` 輸出變量，我們也必須調整片段著色器的代碼：

```c
#version 330 core
out vec4 FragColor;
in vec3 ourColor;

void main()
{
    FragColor = vec4(ourColor, 1.0);
}
```

因為我們加入了另一個頂點屬性，並且更新了 VBO 的內存，我們必須重新配置頂點屬性的指針。更新之後 VBO 內存中的數據現在看起來像是這樣的：

{% include img.html src="https://learnopengl.com/img/getting-started/vertex_attribute_pointer_interleaved.png" %}

知道當前的 `layout` 後，我們可以使用 `glVertexAttribPointer` 來更新頂點格式：

```c
// position attribute
glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 6 * sizeof(float), (void*)0);
glEnableVertexAttribArray(0);
// color attribute
glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, 6 * sizeof(float), (void*)(3* sizeof(float)));
glEnableVertexAttribArray(1);
```

`glVertexAttribPointer` 的前幾個參數相對直觀。這回，我們在屬性位置 `1` 對頂點屬性進行配置。顏色值的大小是 3 倍浮點數，我們這裡無需對頂點數據歸一化。

以我們現在有了兩個頂點屬性，我們必須重新計算步長（stride）。要從數據序列中得到下一個屬性值（比如，下一個位置的 `x` 分量），我們需要向右移動 6 個浮點數，3 個給位置，3 個給顏色。這樣，我們得到的步長就是 6 倍浮點，以字節為單位就是 24。

同樣，這回我們也指定了偏移（offset），對於每一個頂點，位置頂點屬性在先，因此我們聲明其偏移為 0，顏色屬性在後，因此偏移為 `3 * sizeof(float)`，以字節計算，就是 12。

運行應用，你應該看到以下畫面：

{% include img.html src="https://learnopengl.com/img/getting-started/shaders3.png" %}

如果你遇到阻塞，對照一下[源代碼](https://learnopengl.com/code_viewer_gh.php?code=src/1.getting_started/3.2.shaders_interpolation/shaders_interpolation.cpp)。

這張圖或許與你的期待不符，因為我們只提供了 3 個顏色，而非一個龐大的色板，也就是我們現在看到的這樣。這是片段著色器中**片段插值**生成的結果。當渲染一個三角形的時候，**光珊化階段**通常生成比原始頂點多得多的片段。然後，光珊器 （rasterizer）根據片段所處三角形的位置，為其確定座標。

基於這些位置，它對片段著色器的輸入變量進行插值。比如，我們有一條線，上方的點對應一個綠色，下方的點對應一個藍色。如果片段著色器正在運行的片段處於線段 70% 的位置，那麼此處的顏色輸入屬性的結果將會是綠色和藍色的線性混合；準確來說，就是 30% 的藍色加 70% 的綠色。

這就是三角形為什麼會呈現那樣的原因。我們有三個頂點，對應三個顏色，根據三角形的像素來判斷，大概包含了 50000 個片段，這裡片段著色器在那些像素之間進行插值。如果你好好看一下那些顏色，你將會注意到事情正是如此：紅色變到藍色時，首先逐步變成紫色，然後又逐漸變成藍色。片段插值操作會應用到全部片段著色器輸入屬性上。

## 我們自訂的著色器類

編寫、編譯以及管理著色器代碼會是一件較為繁重的工作。在著色器這個主題的最後，我們將創建一個著色器 class 以使工作簡化，它從磁盤讀取著色器代碼文本、編譯以及連結它們，檢查錯誤，並且方便使用。這也給你提供了一點啟示，關於我們如何將截至目前學到的知識封裝到一個方便使用的抽象對象中。

我們將完全在一個 header 文件中創建這個著色器類，這主要是為了學習目的以及方便遷移。那麼讓我們從加入必要的 `includes` 和定義類結構開始吧：

```c
#ifndef SHADER_H
#define SHADER_H

#include <glad/glad.h> // include glad to get all the required OpenGL headers

#include <string>
#include <fstream>
#include <sstream>
#include <iostream>


class Shader
{
public:
    // the program ID
    unsigned int ID;

    // constructor reads and builds the shader
    Shader(const char* vertexPath, const char* fragmentPath);
    // use/activate the shader
    void use();
    // utility uniform functions
    void setBool(const std::string &name, bool value) const;
    void setInt(const std::string &name, int value) const;
    void setFloat(const std::string &name, float value) const;
};

#endif
```

{% include box.html color="green" content="

我們在文件的開頭使用了若干預處理指令。使用這幾個簡短的語句告訴你的編譯器，只在這個頭文件尚未被 include 的時候 include 以及 compile 它，哪怕有多個文件 include 了該著色器 header。這防止了連接衝突。

" %}

這個 `shader class` 持有著色器程序的 ID。它的構造函數需要頂點著色器和片段著色器的源代碼文件的磁盤路徑。為了增添一些便利，我們還會加入幾個實用的輔助函式，讓開發過程更加輕鬆：`use` 激活著色器程序，以及全部的 `set...` 函數，它們會查詢 uniform 的位置並對其進行值設置。

## 從文件讀取

我們使用 C++ 文件流將文件的內容讀取出來，放入到幾個字符串對象：

```c
Shader(const char* vertexPath, const char* fragmentPath)
{
    // 1. retrieve the vertex/fragment source code from filePath
    std::string vertexCode;
    std::string fragmentCode;
    std::ifstream vShaderFile;
    std::ifstream fShaderFile;
    // ensure ifstream objects can throw exceptions:
    vShaderFile.exceptions (std::ifstream::failbit | std::ifstream::badbit);
    fShaderFile.exceptions (std::ifstream::failbit | std::ifstream::badbit);
    try
    {
        // open files
        vShaderFile.open(vertexPath);
        fShaderFile.open(fragmentPath);
        std::stringstream vShaderStream, fShaderStream;
        // read file's buffer contents into streams
        vShaderStream << vShaderFile.rdbuf();
        fShaderStream << fShaderFile.rdbuf();
        // close file handlers
        vShaderFile.close();
        fShaderFile.close();
        // convert stream into string
        vertexCode   = vShaderStream.str();
        fragmentCode = fShaderStream.str();
    }
    catch(std::ifstream::failure e)
    {
        std::cout << "ERROR::SHADER::FILE_NOT_SUCCESFULLY_READ" << std::endl;
    }
    const char* vShaderCode = vertexCode.c_str();
    const char* fShaderCode = fragmentCode.c_str();
    [...]
```

然後，我們需要編譯和連結這些著色器。注意，我們也需要檢視編譯/連結是否出現錯誤，如果是，那麼將編譯時錯誤信息打印出來。這對 debugging 機器有幫助（你最終會用得上這些錯誤日誌）：

```c
// 2. compile shaders
unsigned int vertex, fragment;
int success;
char infoLog[512];

// vertex Shader
vertex = glCreateShader(GL_VERTEX_SHADER);
glShaderSource(vertex, 1, &vShaderCode, NULL);
glCompileShader(vertex);
// print compile errors if any
glGetShaderiv(vertex, GL_COMPILE_STATUS, &success);
if(!success)
{
    glGetShaderInfoLog(vertex, 512, NULL, infoLog);
    std::cout << "ERROR::SHADER::VERTEX::COMPILATION_FAILED\n" << infoLog << std::endl;
};

// similiar for Fragment Shader
[...]

// shader Program
ID = glCreateProgram();
glAttachShader(ID, vertex);
glAttachShader(ID, fragment);
glLinkProgram(ID);
// print linking errors if any
glGetProgramiv(ID, GL_LINK_STATUS, &success);
if(!success)
{
    glGetProgramInfoLog(ID, 512, NULL, infoLog);
    std::cout << "ERROR::SHADER::PROGRAM::LINKING_FAILED\n" << infoLog << std::endl;
}

// delete the shaders as they're linked into our program now and no longer necessary
glDeleteShader(vertex);
glDeleteShader(fragment);
```

`use` 函數的功能是直觀的：

```c
void use()
{
    glUseProgram(ID);
}
```

和任何 uniform 的設定函數類似：

```c
void setBool(const std::string &name, bool value) const
{
    glUniform1i(glGetUniformLocation(ID, name.c_str()), (int)value);
}
void setInt(const std::string &name, int value) const
{
    glUniform1i(glGetUniformLocation(ID, name.c_str()), value);
}
void setFloat(const std::string &name, float value) const
{
    glUniform1f(glGetUniformLocation(ID, name.c_str()), value);
}
```

就是這些了，我們有了一個完整的 [shader class](https://learnopengl.com/code_viewer_gh.php?code=includes/learnopengl/shader_s.h)。使用這個 shader class 非常容易；我們創建一個 shader 對象，之後就可以開始使用它了：

```c
Shader ourShader("path/to/shaders/shader.vs", "path/to/shaders/shader.fs");
[...]
while(...)
{
    ourShader.use();
    ourShader.setFloat("someUniform", 1.0f);
    DrawStuff();
}
```

這裡我們將頂點著色器和片段著色器的源代碼分別存儲在兩個文件當中，一個是 **shader.vs** 另一個是 **shader.fs**。你可以隨意對其進行命名，但我個人發覺後綴 `.vs` 和 `.fs` 非常的直觀。

你可以在這裡查看[源代碼](https://learnopengl.com/code_viewer_gh.php?code=src/1.getting_started/3.3.shaders_class/shaders_class.cpp)，使用我們剛剛創建的 [shader class](https://learnopengl.com/code_viewer_gh.php?code=includes/learnopengl/shader_s.h)。注意，你可以點擊著色器文件的路徑，從而找到它們的源代碼。
