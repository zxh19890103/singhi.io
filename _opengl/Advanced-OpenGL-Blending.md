---
layout: bookdetail
chapter: 二十二
title: 高級 OpenGL &bull; 混合
category: tech
src: "https://learnopengl.com/Advanced-OpenGL/Blending"
date: 2025-06-29
math: 1
book: opengl
image: "https://learnopengl.com/img/advanced/blending_transparency.png"
order: 22
lang: zh
glcate: Advanced-OpenGL
gltopic: Blending
permalink: /opengl/Advanced-OpenGL/Blending
---

OpenGL 中的「混合」（Blending）通常被稱為在物件中實現「透明度」（transparency）的技術。透明度的重點在於物件（或其部分）不具有實心顏色，而是由物件本身的顏色和其後方任何其他物件的顏色以不同強度組合而成。彩繪玻璃窗就是一個透明的物件；玻璃本身有顏色，但最終的顏色也包含了玻璃後方所有物件的顏色。這也是「混合」這個名稱的由來，因為我們將多個像素顏色（來自不同物件）「混合」成單一顏色。因此，透明度使我們能夠看穿物件。

![](https://learnopengl.com/img/advanced/blending_transparency.png)

透明物件可以是完全透明（讓所有顏色穿透）或部分透明（讓顏色穿透，但也透出部分自身顏色）。物件的透明度由其顏色的 `alpha` 值定義。alpha 顏色值是你現在可能經常看到的顏色向量的第四個分量。直到本章，我們一直將這個第四個分量保持在 `1.0` 的值，使物件具有 `0.0` 的透明度。alpha 值為 `0.0` 將導致物件完全透明。alpha 值為 `0.5` 告訴我們物件的顏色由 50% 的自身顏色和 50% 的物件後方顏色組成。

我們目前使用的紋理都包含 `3` 個顏色分量：紅色、綠色和藍色，但有些紋理也嵌入了一個 alpha 通道，其中包含每個紋素的 `alpha` 值。這個 alpha 值精確地告訴我們紋理的哪些部分具有透明度以及透明度是多少。例如，以下[窗戶紋理](https://learnopengl.com/img/advanced/blending_transparent_window.png)在其玻璃部分具有 `0.25` 的 alpha 值，在其角落具有 `0.0` 的 alpha 值。玻璃部分通常會是完全紅色，但由於它有 75% 的透明度，它在很大程度上會顯示頁面的背景，使其看起來不那麼紅：

![](https://learnopengl.com/img/advanced/blending_transparent_window.png)

我們很快就會將這個有窗戶的紋理添加到深度測試章節的場景中，但首先我們將討論一種更容易實現透明度的方法，適用於完全透明或完全不透明的像素。

## 捨棄片元

有些效果不關心部分透明度，而是根據紋理的顏色值來決定是顯示還是完全不顯示。想想草地；要不費吹灰之力地創建像草地這樣的東西，你通常會將草地紋理貼到一個 2D 四邊形上，然後將該四邊形放置在你的場景中。然而，草地並不是完全的 2D 正方形形狀，所以你只想顯示草地紋理的某些部分，而忽略其他部分。

以下[紋理](https://learnopengl.com/img/textures/grass.png)就是這樣一種紋理，它要么完全不透明（alpha 值為 `1.0`），要么完全透明（alpha 值為 `0.0`），中間沒有任何過渡。你可以看到，凡是沒有草的地方，圖像顯示的是頁面的背景顏色，而不是它自己的顏色。

![](https://learnopengl.com/img/textures/grass.png)

所以，當我們將植被添加到場景中時，我們不希望看到一個方形的草地圖像，而是只顯示實際的草地並看穿圖像的其餘部分。我們希望「捨棄」顯示紋理透明部分的片元，而不是將該片元儲存到顏色緩衝區中。

在我們深入探討之前，我們首先需要學習如何載入透明紋理。要載入帶有 alpha 值的紋理，我們不需要做太多更改。`stb_image` 會自動載入圖像的 alpha 通道（如果可用），但我們確實需要在紋理生成過程中告訴 OpenGL 我們的紋理現在使用 alpha 通道：

```cpp
glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, width, height, 0, GL_RGBA, GL_UNSIGNED_BYTE, data);
```

另外，請確保你在片元著色器中擷取紋理的所有 `4` 個顏色分量，而不僅僅是 RGB 分量：

```cpp
void main()
{
    // FragColor = vec4(vec3(texture(texture1, TexCoords)), 1.0);
    FragColor = texture(texture1, TexCoords);
}
```

既然我們已經知道如何載入透明紋理，現在是時候將它應用到實踐中，在[深度測試](https://learnopengl.com/Advanced-OpenGL/Depth-testing)章節介紹的基礎場景中添加幾片草葉。

我們創建一個小的 `vector` 陣列，其中添加了幾個 `glm::vec3` 向量來表示草葉的位置：

```cpp
vector<glm::vec3> vegetation;
vegetation.push_back(glm::vec3(-1.5f,  0.0f, -0.48f));
vegetation.push_back(glm::vec3( 1.5f,  0.0f,  0.51f));
vegetation.push_back(glm::vec3( 0.0f,  0.0f,  0.7f));
vegetation.push_back(glm::vec3(-0.3f,  0.0f, -2.3f));
vegetation.push_back(glm::vec3( 0.5f,  0.0f, -0.6f));
```

每個草地物件都以單個四邊形的形式渲染，並附上草地紋理。這並非完美的 3D 草地呈現方式，但比載入和渲染大量複雜模型要高效得多。透過一些技巧，例如添加隨機旋轉和縮放，你可以用四邊形獲得相當逼真的效果。

因為草地紋理將顯示在四邊形物件上，我們需要再次創建另一個 VAO，填充 VBO，並設定適當的頂點屬性指針。然後在我們渲染完地板和兩個立方體之後，我們將渲染草葉：

```cpp
glBindVertexArray(vegetationVAO);
glBindTexture(GL_TEXTURE_2D, grassTexture);
for(unsigned int i = 0; i < vegetation.size(); i++)
{
    model = glm::mat4(1.0f);
    model = glm::translate(model, vegetation[i]);
    shader.setMat4("model", model);
    glDrawArrays(GL_TRIANGLES, 0, 6);
}
```

運行應用程式現在看起來會像這樣：

![](https://learnopengl.com/img/advanced/blending_no_discard.png)

發生這種情況是因為 OpenGL 預設不知道如何處理 alpha 值，也不知道何時捨棄它們。我們必須手動完成此操作。幸運的是，多虧了著色器的使用，這變得非常容易。GLSL 提供了 `discard` 命令，一旦呼叫，它會確保片段不再被進一步處理，因此不會進入顏色緩衝區。由於此命令，我們可以檢查片段的 alpha 值是否低於某個閾值，如果是，則捨棄該片段，就像它從未被處理過一樣：

```cpp
#version 330 core
out vec4 FragColor;

in vec2 TexCoords;

uniform sampler2D texture1;

void main()
{
    vec4 texColor = texture(texture1, TexCoords);
    if(texColor.a < 0.1)
        discard;
    FragColor = texColor;
}
```

在此，我們檢查取樣紋理顏色是否包含低於 `0.1` 閾值的 alpha 值，如果是，則丟棄該片元。這個片元著色器確保我們只渲染非（幾乎）完全透明的片元。現在它看起來應該會是這樣：

![](https://learnopengl.com/img/advanced/blending_discard.png)

{% include box.html content="

請注意，當在紋理邊界取樣時，OpenGL 會將邊界值與紋理的下一個重複值進行插值（因為我們預設將其環繞參數設定為 `GL_REPEAT`）。這通常沒問題，但由於我們使用透明值，紋理圖像的頂部會將其透明值與底部邊界的實心顏色值進行插值。結果就會是一個你可能會看到的稍微半透明的有色邊界環繞著你的紋理四邊形。為了防止這種情況，當你使用不希望重複的 alpha 紋理時，請將紋理環繞方法設定為 `GL_CLAMP_TO_EDGE`：

```cpp
glTexParameteri( GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
glTexParameteri( GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
```

" color="green" %}

你可以在[這裡](https://learnopengl.com/code_viewer_gh.php?code=src/4.advanced_opengl/3.1.blending_discard/blending_discard.cpp)找到原始碼。

## 混合

儘管捨棄片段非常有用，但它無法讓我們靈活地渲染半透明圖像；我們只能選擇渲染片段或完全捨棄它。為了渲染具有不同透明度級別的圖像，我們必須啟用「混合」（blending）。與 OpenGL 的大多數功能一樣，我們可以透過啟用 `GL_BLEND` 來啟用混合：

```cpp
glEnable(GL_BLEND);
```

現在我們已經啟用混合，我們需要告訴 OpenGL 實際**如何**進行混合。

OpenGL 中的混合是透過以下方程式進行的：

```math
\begin{equation}
\bar{C}_{result} = \bar{\color{green}C}_{source} * {\color{green}F}_{source} + \bar{\color{red}C}_{destination} * {\color{red}F}_{destination}
\end{equation}
```

- \\(\\bar{\\color{green}C}\_{source}\\): 來源顏色向量。這是片元著色器的顏色輸出。
- \\(\\bar{\\color{red}C}\_{destination}\\): 目標顏色向量。這是目前儲存在顏色緩衝區中的顏色向量。
- \\(\\color{green}F\_{source}\\): 來源因子值。設定 alpha 值對來源顏色的影響。
- \\(\\color{red}F\_{destination}\\): 目標因子值。設定 alpha 值對目標顏色的影響。

在片元著色器執行完畢且所有測試都通過之後，這個「混合方程式」就會對片元的顏色輸出以及顏色緩衝區中當前的內容起作用。來源和目標顏色會由 OpenGL 自動設定，但來源和目標因子可以設定為我們選擇的值。讓我們從一個簡單的例子開始：

![](https://learnopengl.com/img/advanced/blending_equation.png)

我們有兩個方塊，我們想將半透明的綠色方塊繪製在紅色方塊之上。紅色方塊將是目標顏色（因此應該首先出現在顏色緩衝區中），而我們現在要將綠色方塊繪製在紅色方塊之上。

問題隨之而來：我們將因子值設定為什麼？嗯，我們至少希望將綠色方塊乘以其 alpha 值，所以我們想將 \\(F\_{src}\\) 設定為等於來源顏色向量的 alpha 值，即 `0.6`。然後，讓目標方塊的貢獻等於 alpha 值的剩餘部分是合理的。如果綠色方塊對最終顏色貢獻 60%，我們希望紅色方塊對最終顏色貢獻 40%，例如 `1.0 - 0.6`。所以我們將 \\(F\_{destination}\\) 設定為一減去來源顏色向量的 alpha 值。因此，方程式變成：

\\begin{equation}\\bar{C}\_{result} = \\begin{pmatrix} \\color{red}{0.0} \\\\ \\color{green}{1.0} \\\\ \\color{blue}{0.0} \\\\ \\color{purple}{0.6} \\end{pmatrix} \* \\color{green}{0.6} + \\begin{pmatrix} \\color{red}{1.0} \\\\ \\color{green}{0.0} \\\\ \\color{blue}{0.0} \\\\ \\color{purple}{1.0} \\end{pmatrix} \* (\\color{red}{1 - 0.6}) \\end{equation}

得到的結果是，組合後的正方形碎片顏色為 60% 綠色和 40% 紅色：

![](https://learnopengl.com/img/advanced/blending_equation_mixed.png)

所得顏色隨後儲存到顏色緩衝區中，取代之前的顏色。

這一切都很好，但我們實際上如何告訴 OpenGL 使用這樣的因子呢？碰巧有一個名為 `glBlendFunc` 的函數可以做到這一點。

`glBlendFunc(GLenum sfactor, GLenum dfactor)` 函數需要兩個參數，用於設定「來源」和「目標因子」的選項。OpenGL 為我們定義了相當多的選項，我們將在下面列出最常見的選項。請注意，常數顏色向量 \\({\\color{blue}C}\_{constant}\\) 可以透過 `glBlendColor` 函數單獨設定。

<div class="table">
<table>
  <thead>
    <tr>
      <th>選項</th>
      <th>值</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>GL_ZERO</code></td>
      <td>因子等於 \(0\)。</td>
    </tr>
    <tr>
      <td><code>GL_ONE</code></td>
      <td>因子等於 \(1\)。</td>
    </tr>
    <tr>
      <td><code>GL_SRC_COLOR</code></td>
      <td>因子等於來源顏色向量 \(\bar{\color{green}C}_{source}\)。</td>
    </tr>
    <tr>
      <td><code>GL_ONE_MINUS_SRC_COLOR</code></td>
      <td>
        因子等於 \(1\) 減去來源顏色向量：\(1 - \bar{\color{green}C}_{source}\)。
      </td>
    </tr>
    <tr>
      <td><code>GL_DST_COLOR</code></td>
      <td>因子等於目標顏色向量 \(\bar{\color{red}C}_{destination}\)</td>
    </tr>
    <tr>
      <td><code>GL_ONE_MINUS_DST_COLOR</code></td>
      <td>
        因子等於 \(1\) 減去目標顏色向量：\(1 -
        \bar{\color{red}C}_{destination}\)。
      </td>
    </tr>
    <tr>
      <td><code>GL_SRC_ALPHA</code></td>
      <td>
        因子等於來源顏色向量 \(\bar{\color{green}C}_{source}\) 的 \(alpha\)
        分量。
      </td>
    </tr>
    <tr>
      <td><code>GL_ONE_MINUS_SRC_ALPHA</code></td>
      <td>
        因子等於來源顏色向量 \(\bar{\color{green}C}_{source}\) 的 \(1 -
        alpha\)。
      </td>
    </tr>
    <tr>
      <td><code>GL_DST_ALPHA</code></td>
      <td>
        因子等於目標顏色向量 \(\bar{\color{red}C}_{destination}\) 的 \(alpha\)
        分量。
      </td>
    </tr>
    <tr>
      <td><code>GL_ONE_MINUS_DST_ALPHA</code></td>
      <td>
        因子等於目標顏色向量 \(\bar{\color{red}C}_{destination}\) 的 \(1 -
        alpha\)。
      </td>
    </tr>
    <tr>
      <td><code>GL_CONSTANT_COLOR</code></td>
      <td>因子等於常數顏色向量 \(\bar{\color{blue}C}_{constant}\)。</td>
    </tr>
    <tr>
      <td><code>GL_ONE_MINUS_CONSTANT_COLOR</code></td>
      <td>
        因子等於 \(1\) 減去常數顏色向量 \(\bar{\color{blue}C}_{constant}\)。
      </td>
    </tr>
    <tr>
      <td><code>GL_CONSTANT_ALPHA</code></td>
      <td>
        因子等於常數顏色向量 \(\bar{\color{blue}C}_{constant}\) 的 \(alpha\)
        分量。
      </td>
    </tr>
    <tr>
      <td><code>GL_ONE_MINUS_CONSTANT_ALPHA</code></td>
      <td>
        因子等於常數顏色向量 \(\bar{\color{blue}C}_{constant}\) 的 \(1 -
        alpha\)。
      </td>
    </tr>
  </tbody>
</table>
</div>

為了獲得我們小小的兩個方塊範例的混合結果，我們希望將來源顏色向量的 \\(alpha\\) 值作為來源因子，並將相同顏色向量的 \\(1 - alpha\\) 值作為目標因子。這在 `glBlendFunc` 中轉換如下：

```cpp
glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
```

也可以使用 `glBlendFuncSeparate` 為 RGB 和 alpha 通道單獨設定不同的選項：

```cpp
glBlendFuncSeparate(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA, GL_ONE, GL_ZERO);
```

這個函數會像我們之前設定的那樣設定 RGB 分量，但只讓最終的 alpha 分量受來源 alpha 值的影響。

OpenGL 透過允許我們更改方程式中來源和目標部分之間的操作符，賦予我們更大的靈活性。現在，來源和目標分量是相加的，但如果我們願意，我們也可以將它們相減。`glBlendEquation(GLenum mode)` 允許我們設定此操作，並有 5 個可能的選項：

- `GL_FUNC_ADD`：預設值，將兩種顏色相加：\\(\\bar{C}\_{result} = \\color{green}{Src} + \\color{red}{Dst}\\)。
- `GL_FUNC_SUBTRACT`：將兩種顏色相減：\\(\\bar{C}\_{result} = \\color{green}{Src} - \\color{red}{Dst}\\)。
- `GL_FUNC_REVERSE_SUBTRACT`：將兩種顏色相減，但顛倒順序：\\(\\bar{C}\_{result} = \\color{red}{Dst} - \\color{green}{Src}\\)。
- `GL_MIN`：取兩種顏色的分量最小值：\\(\\bar{C}\_{result} = min(\\color{red}{Dst}, \\color{green}{Src})\\)。
- `GL_MAX`：取兩種顏色的分量最大值：\\(\\bar{C}\_{result} = max(\\color{red}{Dst}, \\color{green}{Src})\\)。

通常我們可以簡單地省略對 `glBlendEquation` 的呼叫，因為 `GL_FUNC_ADD` 是大多數操作的首選混合方程式，但如果你真的想盡力打破主流常規，任何其他方程式都可能適合你的需求。

## 渲染半透明紋理

現在我們已經了解了 OpenGL 關於混合的工作原理，是時候將我們的知識付諸實踐，添加幾個半透明窗戶了。我們將使用本章開頭的相同場景，但這次我們將使用本章開頭的[透明窗戶紋理](https://learnopengl.com/img/advanced/blending_transparent_window.png)來代替渲染草地紋理。

首先，在初始化時，我們啟用混合並設定適當的混合函數：

```cpp
glEnable(GL_BLEND);
glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
```

由於我們啟用了混合，因此無需捨棄片段，所以我們將片元著色器重設為其原始版本：

```cpp
#version 330 core
out vec4 FragColor;

in vec2 TexCoords;

uniform sampler2D texture1;

void main()
{
    FragColor = texture(texture1, TexCoords);
}
```

現在（每當 OpenGL 渲染一個片段時），它會根據 `FragColor` 的 alpha 值，將當前片段的顏色與目前在顏色緩衝區中的片段顏色結合。由於窗戶紋理的玻璃部分是半透明的，我們應該能夠透過這個窗戶看到場景的其餘部分。

![](https://learnopengl.com/img/advanced/blending_incorrect_order.png)

然而，如果你仔細觀察，你可能會注意到有些不對勁。前窗的透明部分遮擋了背景中的窗戶。這是為什麼呢？

原因在於深度測試與混合結合時會有點棘手。當寫入深度緩衝區時，深度測試不關心片段是否透明，因此透明部分像任何其他值一樣寫入深度緩衝區。結果是背景窗戶像任何其他不透明物體一樣進行深度測試，忽略了透明度。儘管透明部分應該顯示其後方的窗戶，但深度測試卻將它們丟棄了。

因此，我們不能簡單地隨心所欲地渲染窗戶，並期望深度緩衝區為我們解決所有問題；這也是混合變得有點麻煩的地方。為了確保窗戶能顯示其後方的窗戶，我們必須先繪製背景中的窗戶。這意味著我們必須手動將窗戶從最遠到最近排序，然後據此自行繪製。

{% include box.html content="

請注意，對於像草葉這樣完全透明的物體，我們可以在捨棄透明片段而不是混合它們之間做出選擇，這為我們省去了一些麻煩（沒有深度問題）。

" color="green" %}

## 不要打破順序

為了讓混合作用於多個物件，我們必須先繪製最遠的物件，最後繪製最近的物件。正常的非混合物件仍然可以像往常一樣使用深度緩衝區繪製，因此它們不需要排序。我們確實必須確保它們在繪製（已排序的）透明物件之前先繪製。當繪製包含非透明和透明物件的場景時，一般的大綱通常如下：

1.  首先繪製所有不透明物件。
2.  對所有透明物件進行排序。
3.  按排序順序繪製所有透明物件。

對透明物件進行排序的一種方法是從觀看者的角度檢索物件的距離。這可以透過計算攝影機位置向量和物件位置向量之間的距離來實現。然後，我們將此距離與相應的位置向量一起儲存在 STL 函式庫的 `map` 資料結構中。`map` 會自動根據其鍵值對其值進行排序，因此一旦我們將所有位置及其距離作為鍵添加進去，它們就會自動按其距離值進行排序：

```cpp
std::map<float, glm::vec3> sorted;
for (unsigned int i = 0; i < windows.size(); i++)
{
    float distance = glm::length(camera.Position - windows[i]);
    sorted[distance] = windows[i];
}
```

結果是一個排序過的容器物件，它根據距離鍵值（從最低到最高距離）儲存每個窗戶的位置。

然後，這次在渲染時，我們以相反的順序（從最遠到最近）取出地圖中的每個值，然後以正確的順序繪製相應的窗戶：

```cpp
for(std::map<float,glm::vec3>::reverse_iterator it = sorted.rbegin(); it != sorted.rend(); ++it)
{
    model = glm::mat4(1.0f);
    model = glm::translate(model, it->second);
    shader.setMat4("model", model);
    glDrawArrays(GL_TRIANGLES, 0, 6);
}
```

我們使用 `map` 的反向迭代器來反向迭代每個項目，然後將每個視窗四邊形平移到相應的視窗位置。這種相對簡單的透明物件排序方法解決了之前的問題，現在場景看起來像這樣：

![](https://learnopengl.com/img/advanced/blending_sorted.png)

你可以在[這裡](https://learnopengl.com/code_viewer_gh.php?code=src/4.advanced_opengl/3.2.blending_sort/blending_sorted.cpp)找到包含排序的完整原始碼。

雖然這種根據距離對物件進行排序的方法對於這個特定的場景非常有效，但它沒有考慮旋轉、縮放或任何其他變換，而且形狀奇怪的物件需要一個不同於簡單位置向量的度量標準。

在場景中排序物件是一項艱鉅的任務，它很大程度上取決於你擁有的場景類型，更不用說它所花費的額外處理能力了。完全渲染包含實心和透明物件的場景並不是那麼容易。還有更進階的技術，例如「獨立於順序的透明度」(order independent transparency)，但這些超出了本章的範圍。目前你必須忍受正常混合物件，但如果你小心並了解限制，你可以獲得相當不錯的混合實現。
