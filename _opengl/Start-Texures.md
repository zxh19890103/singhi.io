---
layout: bookdetail
chapter: 七
description: "我們已經知道，要往我們的物件裡添加更多的細節，可以使用頂點顏色創造出一些有趣的圖案。然爾，要實現稍微逼真一點的效果，我們還必須要更多的頂點，如此，我們才能定義足夠量的顏色。然爾，這需要相當量的額外開銷，這是因為每一個模型都需要非常大量的頂點，並且同時，每一個頂點都需要一個顏色屬性。"
title: 开始 &bull; 紋理
category: tech
src: https://learnopengl.com/Getting-started/Textures
date: 2025-06-03
book: opengl
order: 7
permalink: /opengl/Start/Textures
glcate: Start
gltopic: Textures
---

我們已經知道，要往我們的物件裡添加更多的細節，可以使用頂點顏色創造出一些有趣的圖案。然爾，要實現稍微逼真一點的效果，我們還必須要更多的頂點，如此，我們才能定義足夠量的顏色。然爾，這需要相當量的額外開銷，這是因為每一個模型都需要非常大量的頂點，並且同時，每一個頂點都需要一個顏色屬性。

藝術創作者以及程序員通常偏好的做法是使用紋理。紋理是一個 2D 圖片（ 1D 和 3D 紋理也是存在的），它用於向物件添加更多的細節；將紋理想像為一張紙，紙上畫有一個漂亮的磚塊圖案（舉個例子），爾這張紙可以將你的 3D 房子完全包裹起來，如此看上去你的房子就有了一種石頭堆砌的外觀。我們可以向圖片加入足量的細節，物件因此也就顯得細節十足，而且這無需我們提供額外的頂點信息。

{% include box.html color="green" content="

除了用於圖像，紋理也可以用於存儲大量任意數據集合，並發送給著色器，我們將其放到另一個不同的主題去討論。

" %}

以下你可以看到一張畫有[磚塊](https://learnopengl.com/img/textures/wall.jpg)的圖片紋理，它被映射到上一章我們繪製的三角形上。

{% include img.html src="https://learnopengl.com/img/getting-started/textures.png" %}

为了将纹理映射到三角形上，我们需要明确每一个三角形的顶点对应纹理的哪个部分。因此，每一个顶点都应该具备一个纹理坐标，它指明了该从纹理的哪个部分采样。接着，片段插值機制可以对其它片段进行处理。

纹理坐标在 x、y 两个轴的取值在 0 到 1 之间（记住，我们使用 2D 纹理图）。从纹理坐标获取纹理色值的操作称为取样。紋理座標開始於左下角 (0,0) 到右上角 (1,1)。下面這張圖展示了我們如何將紋理座標對應到三角形上。

{% include img.html src="https://learnopengl.com/img/getting-started/tex_coords.png" %}

我們為三角形配置了 3 個紋理座標。我們希望三角形的左下角對應紋理圖的左下角，因此我們對三角形的左下角頂點使用紋理座標 (0,0) 。紋理右下角情況類似。三角形的頂部對應紋理圖的頂部中心位置，我們取 (0.5,1.0) 作為紋理座標。我們只向頂點著色器傳入了 3 個紋理座標，它們將被傳入到片段著色器，並且整齊地將紋理座標插入到每一個片段。

最終，最終的紋理座標看起來將是這樣：

```c

float texCoords[] = {
    0.0f, 0.0f,  // lower-left corner
    1.0f, 0.0f,  // lower-right corner
    0.5f, 1.0f   // top-center corner
};
```

紋理取樣並非以一種邏輯，它可以有很多種不同的方式來進行。因此我們需要明確告訴 OpenGL 應該如何對紋理取樣。

## 紋理越界行為（Texture Wrapping）

紋理座標通常從 (0,0) 到 (1,1)，但如果我們指定的座標超出範圍了呢？OpenGL 默認的做法是重複（repeat）紋理圖（我們基本上忽略），但提供了更多的選項：

- _GL_REPEAT_: 默認行為，重複紋理圖
- _GL_MIRRORED_REPEAT_: 與 GL_REPEAT 一樣，不過每次重複會取圖案的鏡像
- _GL_CLAMP_TO_EDGE_: 將紋理座標限制到 0 到 1。結果是超出的座標會被放置到圖案邊緣，進而呈現一種邊緣拉伸效果。
- _GL_CLAMP_TO_BORDER_: 對於範圍之外的座標，容許用戶自定義邊緣顏色。

當使用紋理座標超出範圍，這些選項各自有不同的視覺輸出。它們都會出現什麼樣的效果呢？ 我們拿一張采樣紋理圖為例進行演示，讓我們來看看：（原圖由 Hólger Rezende 提供）

{% include img.html src="https://learnopengl.com/img/getting-started/texture_wrapping.png" %}

之前提及的那些選項中的每一個，都可以使用函數 `glTexParameter*` 針對每個軸線進行設置（`s`、`t`，如果是 3D 紋理需要 `r`，這和 `x`、`y`、`z` 等同）。

```c
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_MIRRORED_REPEAT);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_MIRRORED_REPEAT);
```

第一個參數指明了紋理目標（texture target）；我們處理的是 2D 紋理，因此紋理目標是 `GL_TEXTURE_2D`。第二個參數需要我們明確要設置的選項是什麼，以及針對的軸線是什麼。我們希望配置 S 和 T 軸。最後一個參數需要我們傳入紋理 `wrapping mode`，這裡 OpenGL 將會對當前激活的紋理設置 `wrapping mode` 為 `GL_MIRRORED_REPEAT`。

如果選擇 `GL_CLAMP_TO_BORDER`，還需要給定邊框顏色。這是通過使用與 `glTexParameter` 函數等效的 `fv` 變體來實現的，設置 `GL_TEXTURE_BORDER_COLOR` 作為選項，並傳入一個包含邊界顏色值的浮點數組：

```c
float borderColor[] = { 1.0f, 1.0f, 0.0f, 1.0f };
glTexParameterfv(GL_TEXTURE_2D, GL_TEXTURE_BORDER_COLOR, borderColor);
```

## 紋理過濾（Texture Filtering）

紋理座標無關分辨率，但是可以是任意浮點數，因此 OpenGL 必須找到對應到紋理座標的紋理像素（也被稱為紋素）。如果你有一個非常大的物件和一個非常低分辨率的紋理圖，這種情況是值得注意的。現在你或許可以猜到，OpenGL 也為 `texture filtering` 提供了配置項。存在若干選項，但是我們將探討其中最重要的兩個：`GL_NEAREST` 和 `GL_LINEAR`。

`GL_NEAREST` （也被稱為`最近鄰居`或著`點過濾`）是默認選項。當 `texture filtering` 被設置為 `GL_NEAREST` 的時候，OpenGL 會選擇最靠近紋理座標中心的紋素。以下，你可以看到 4 個像素，其中的 “+” 代表準確的紋理座標。左上角紋素的中心最靠近紋理座標，因此選擇它作為采樣顏色：

{% include img.html src="https://learnopengl.com/img/getting-started/filter_nearest.png" %}

`GL_LINEAR`（也被稱為線性過濾）通過與當前紋理座標相鄰的紋素，使用插值計算，估算紋素之間的顏色值。紋理座標到紋素中心距離越短，紋素對采樣色的貢獻就越多。以下，我們可以看到由鄰居像素混合計算得的顏色：

{% include img.html src="https://learnopengl.com/img/getting-started/filter_linear.png" %}

然爾，這些 `texture filtering` 處理的視覺效果是什麼呢？讓我們將一個低分辨率紋理應用到一個超級大的物件，來看看這些處理方法的工作邏輯（紋理因此被放大了，並且個體紋素變得肉眼可見）。

{% include img.html src="https://learnopengl.com/img/getting-started/texture_filtering.png" %}

`GL_NEAREST` 產生了塊狀圖案，我們可以清楚看到其中從紋理抓取出來的像素；爾 `GL_LINEAR` 產生的是一種平滑的圖案，我們很難注意到單個的像素。`GL_LINEAR` 的效果更為逼真，然爾有些開發者更喜歡 由 `GL_NEAREST` 選項生成的 `8-bit` 風格。

`Texure filtering` 考慮到了紋理圖片的放大和縮小情況，這樣你可以在紋理被縮小的時候使用 `nearest` ，被放大的時候使用 `linear`。因此我們必須為兩個情況明確其 filtering 方法，這裡使用到的函數是 `glTexParameter*`。代碼看上去和設置 `wrapping` 差不多：

```c
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
```

### Mipmaps

想像一下，我們有了一個很大的房間，裡頭有幾千個物件，每一個都使用了紋理。那麼，有些物件離鏡頭非常遙遠，但是紋理分辨率卻和近處的物件所使用的一樣。由於物件遠離鏡頭，它們可能只需幾個片段就足夠了，OpenGL 對如何從高分辨率的紋理為這些片段提取正確的顏色感到有些困難；這是因為，物件的片段跨越的紋理範圍太大，OpenGL 需要從這樣一個大範圍中選擇一個紋理顏色。對於視覺上很小的物件，這會產生可見的瑕疵。我們且不提對它們使用高分辨率紋理文件所浪費的內存帶寬。

要解決這個問題，OpenGL 使用了 mipmaps 這個概念，基本上，它是是多個紋理的集合，其中第 `n+1` 個紋理是第 `n` 個的**一半**。mipmaps 背後的邏輯很好掌握：物件到鏡頭的距離超過一個闕值，OpenGL 就會使用一個不同的 mipmap 紋理，此紋理能更好地適應物件的視覺大小。因為物件很遠，使用較小分辨率紋理對於用戶並不會注意到。這樣 OpenGL 也可以輕鬆獲取到正確的紋素，並且在對此 mipmap 采樣的時候也會涉及較少的內存緩存。讓我們來看看使用 mipmap 之後的紋理長什麼樣子：

{% include img.html src="https://learnopengl.com/img/getting-started/mipmaps.png" %}

手動為每一個紋理圖創建 mipmapped 紋理集合有些繁瑣，但是幸運的是 OpenGL 可以為我們處理所有的這些工作，只需在創建好紋理對象之後調用函數 `glGenerateMipmap` 即可。

在渲染過程中切換不同 mipmap 等級時，OpenGL 可能會顯示一些偽影，例如在兩個 mipmap 層之間出現明顯的銳利邊緣。就像普通的紋理過濾（texture filtering）一樣，也可以在 mipmap 等級之間進行過濾，使用 `NEAREST` 或 `LINEAR` 過濾方式來切換 mipmap 層級。為了指定 mipmap 層級之間的過濾方法，我們可以將原始過濾方法替換為以下四種選項之一：

- _GL_NEAREST_MIPMAP_NEAREST_：選擇最接近的 mipmap 層級，使用最近點採樣，可能導致塊狀或銳利邊緣（類似你提到的“blocked patterns”）。
- _GL_NEAREST_MIPMAP_LINEAR_：選擇最接近的 mipmap 層級，使用線性插值，稍平滑。
- _GL_LINEAR_MIPMAP_NEAREST_：在最接近的 mipmap 層級上使用線性採樣，但層級間不插值。
- _GL_LINEAR_MIPMAP_LINEAR_：在 mipmap 層級間進行線性插值（三線性過濾），最平滑，減少偽影（如“銳利邊緣”）。

就像紋理過濾一樣，我們可以使用 `glTexParameteri` 將過濾方法設置為前述四種方法之一：

```c
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR_MIPMAP_LINEAR);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
```

一個常見的錯誤是將 mipmap 過濾方法設置到 `mag filter` 上。mipmaps 本就是用於當紋理縮小的情況，對其使用 `mag filter` 不會有效果。紋理 `magnification` 不會使用 mipmaps，如果對這項配置設置了一個 `mipmap filtering` 方法，OpenGL 將會拋出 `GL_INVALID_ENUM` 錯誤。

## 加載和創建紋理

實際上首要的事情是將紋理載入我們的應用。紋理圖案可以被存儲以十多種格式，每一種擁有自己的數據結構以及排序，那麼我們如何在我們的應用中拿到那些圖片呢？方案之一是選擇一種我們喜歡的格式，比如 `.png`，編寫圖片加載器並將其轉換為大型字節數組。你不難編寫出你自己的圖片加載器，但是要支持更多文件格式或許並不簡單吧？這樣，你必須為所有你需要的格式寫一個圖片加載器。

另一個方案或許不錯，那就是使用圖片加載工具庫，它要能夠支持機種流行格式以及幫助我們處理了其中全部困難的部分。其中一個是 `stb_image.h`：

### stb_image.h

`stb_image.h` 是一個非常流行的圖片加載庫，作者是 [Sean Barrett](https://github.com/nothings)，它能夠加載大部分流行的文件格式，也非常容易集成到你的項目當中。`stb_image.h` 可以從[這裡](https://github.com/nothings/stb/blob/master/stb_image.h)下載。將這個頭文件下載下來，以 `stb_image.h` 文件添加到你的項目當中，並創建一個額外的 c++ 文件，代碼如下：

```c
#define STB_IMAGE_IMPLEMENTATION
#include "stb_image.h"
```

通過定義 `STB_IMAGE_IMPLEMENTATION`，預處理器會修改頭文件，使其僅包含相關的定義源代碼，實際上將頭文件轉化為一個 `.cpp` 文件，僅此而已。現在，只需在你的程式中某處包含 `stb_image.h` 並進行編譯即可。

對於以下紋理部分，我們將使用 [wooden container](https://learnopengl.com/img/textures/container.jpg) 的一張圖片。要使用 stb_image.h 加載這張圖片，我們使用其中的 `stbi_load` 函數：

```c
int width, height, nrChannels;
unsigned char *data = stbi_load("container.jpg", &width, &height, &nrChannels, 0);
```

函數首先將圖片文件的位置作為輸入。然後，期望你給它 3 個整數，分別是第二、第三和第四個參數，它們將用於填充加載圖片的寬、高以及顏色通道的個數。我們會在稍後生成紋理的時候使用到寬和高。

### 生成紋理

就像任何其它 OpenGL 對象，紋理也會被一個 ID 引用；讓我們創建一個：

```c
unsigned int texture;
glGenTextures(1, &texture);
```

函數 `glGenTextures` 首先需要知道我們想生成多少個紋理，其次作為第二個參數，傳入用於存儲紋理數據的無符號整型數組，在我們的例子中只有一個。如其它物件類似，我們需要將它綁定，這樣後續的紋理命令將對當前綁定的紋理執行。

```c
glBindTexture(GL_TEXTURE_2D, texture);
```

現在，紋理已被綁定，我們可以開始生成紋理了，這裡使用先前加載的圖片數據。紋理的生成使用 `glTexImage2D`：

```c
glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB, width, height, 0, GL_RGB, GL_UNSIGNED_BYTE, data);
glGenerateMipmap(GL_TEXTURE_2D);
```

這是一個大函數，需要好幾個參數，我們來一個一個的看一下：

- 第一個參數指定紋理目標；將其設置為 `GL_TEXTURE_2D` 表示此操作將在當前綁定的紋理對象上生成一個紋理，目標相同（因此，任何綁定到 `GL_TEXTURE_1D` 或 `GL_TEXTURE_3D` 目標的紋理都不會受到影響）。
- 第二個參數指定我們想要為哪一個 mipmap 等級建立紋理，如果你想手動設定每個 mipmap 等級的話可以用它，但我們這裡會保留在基礎等級，也就是 0。
- 第三個參數告訴 OpenGL 我們希望存儲紋理的格式。我們的圖案只有 RGB 值，因此我們將紋理也設置為 RGB 值。
- 第 4 和第 5 個參數分別設置了生成紋理的寬度和高度。我們將在加載圖片之前將其保存起來，這樣我們將可以使用對應的變量。
- 接下來的參數大概總是 0 （這屬於歷史遺留問題）
- 第 7 和第 8 個參數指定了原圖像的格式和數據類型。我們加載了包含 RGB 值的圖像，然後將它們保存為字符（字節），因而我們傳入對應的值。
- 最後一個參數就是實際的圖片數據

一旦 `glTexImage2D` 調用，當前綁定的紋理對象將有一個與之關聯的紋理圖片。然爾，當前它只加載了原等級圖片，如果我們需要使用 mipmaps，還需要專門聲明所有不同紋理圖（調整第二個參數的值），或著，我們可以在生成紋理之後調用 `glGenerateMipmap`。這將自動為當前綁定的紋理生成所有需要的 mipmaps。

生成（紋理和對應的 mipmaps）的操作完成之後，好的習慣是釋放圖像內存占用：

```c
stbi_image_free(data);
```

生成紋理的完整過程看上去像是這樣：

```c
unsigned int texture;
glGenTextures(1, &texture);
glBindTexture(GL_TEXTURE_2D, texture);
// set the texture wrapping/filtering options (on the currently bound texture object)
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_REPEAT);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_REPEAT);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR_MIPMAP_LINEAR);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
// load and generate the texture
int width, height, nrChannels;
unsigned char *data = stbi_load("container.jpg", &width, &height, &nrChannels, 0);
if (data)
{
    glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB, width, height, 0, GL_RGB, GL_UNSIGNED_BYTE, data);
    glGenerateMipmap(GL_TEXTURE_2D);
}
else
{
    std::cout << "Failed to load texture" << std::endl;
}
stbi_image_free(data);
```

### 使用紋理

後續的部分我們將使用到上一章“三角形”的最後一部分出現的矩形，使用 `glDrawElements` 繪製的。我們需要告訴 OpenGL 如何從紋理取樣，那樣我們將必須更新包含紋理座標的頂點數據，

```c
float vertices[] = {
    // positions          // colors           // texture coords
     0.5f,  0.5f, 0.0f,   1.0f, 0.0f, 0.0f,   1.0f, 1.0f,   // top right
     0.5f, -0.5f, 0.0f,   0.0f, 1.0f, 0.0f,   1.0f, 0.0f,   // bottom right
    -0.5f, -0.5f, 0.0f,   0.0f, 0.0f, 1.0f,   0.0f, 0.0f,   // bottom left
    -0.5f,  0.5f, 0.0f,   1.0f, 1.0f, 0.0f,   0.0f, 1.0f    // top left
};
```

由於我們已經加入了額外的頂點屬性，我們還必須通知 OpenGL 新的頂點格式：

{% include img.html src="https://learnopengl.com/img/getting-started/vertex_attribute_pointer_interleaved_textures.png" %}

```c
glVertexAttribPointer(2, 2, GL_FLOAT, GL_FALSE, 8 * sizeof(float), (void*)(6 * sizeof(float)));
glEnableVertexAttribArray(2);
```

注意，我們必須將前兩個頂點屬性的步長調整為 `8 * sizeof(float)`。

接下來我們需要修改頂點著色器，以接收紋理座標，然後將其傳遞至片段著色器：

```c
#version 330 core
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec3 aColor;
layout (location = 2) in vec2 aTexCoord;

out vec3 ourColor;
out vec2 TexCoord;

void main()
{
    gl_Position = vec4(aPos, 1.0);
    ourColor = aColor;
    TexCoord = aTexCoord;
}
```

片段著色器將輸出 `TexCoord` 作為輸入接收。

片段著色器也需要訪問到紋理對象，但是如何將紋理對象傳入片段著色器呢？GLSL 有一個內置的數據類型專門為紋理對象涉及的，名字叫做 sampler，它的後綴表達了紋理的類型，比如 sampler1D、sampler3D，或著在我們使用到的 sampler2D。將紋理加入到片段著色器，我們只需要簡單地聲明一個 `uniform sampler2D`，而後我們就會將紋理賦值給它。

```c
#version 330 core
out vec4 FragColor;

in vec3 ourColor;
in vec2 TexCoord;

uniform sampler2D ourTexture;

void main()
{
    FragColor = texture(ourTexture, TexCoord);
}
```

要從紋理中對顏色值進行取樣，我們使用 GLSL 內置的 `texture` 函數，它的第一個參數是紋理取樣器，第二個參數是對應的紋理座標。`texture` 函數會按照之前我們的配置對紋理進行顏色取樣。片段著色器的輸出是（插值後的）紋理座標處的（過濾後的）顏色。

調用 `glDrawElements` 進行繪製之前，剩下我們要做的全部事情是綁定紋理，這樣在片段著色器當中，紋理會自動賦值給 sampler。

```c
glBindTexture(GL_TEXTURE_2D, texture);
glBindVertexArray(VAO);
glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_INT, 0);
```

如果你做得沒錯，你該看到以下這樣圖：

{% include img.html src="https://learnopengl.com/img/getting-started/textures2.png" %}

如果你的矩形是完全黑白色的，你或許在過程中犯了錯誤。檢查你的著色器日誌，並且將你的代碼和應用[源代碼](https://learnopengl.com/code_viewer_gh.php?code=src/1.getting_started/4.1.textures/textures.cpp)進行對照一番。

{% include box.html color="red" content="
如果你的紋理無法工作，或著完全顯示為黑色，那麼繼續閱讀下去，一步一步地，到最後一個例子，應該就沒問題了。有些圖形驅動需要將為每個 sampler 分配 `texture unit`，這是本章馬上要討論的東西。
" %}

為了讓事情有趣一點，我們也可以將最終的紋理顏色和頂點顏色進行 mix。我們簡單地講它們執行 `multiply` 計算：

```c
FragColor = texture(ourTexture, TexCoord) * vec4(ourColor, 1.0);
```

最終的結果將會是頂點顏色和紋理顏色的混合：

{% include img.html src="https://learnopengl.com/img/getting-started/textures_funky.png" %}

我猜你可能會說我們的箱子看上去像一個迪斯可舞廳。

### 紋理單元 （Texture Units）

你或許會疑惑，為什麼我們甚至都沒有使用 `glUniform` 賦值， 代碼中的 sampler2D uniform 變量卻有值。使用 `glUniform1i`，我們實際上可以為紋理取樣器分配一個位置，如此就可以為片段著色器一次性設置多個紋理。這個紋理位置通常被稱爲紋理單元（texture unit）。默認的紋理單元是 0，也是默認啟用的單元，因此我們之前沒有為這個位置進行代碼層面上的分配。注意，並非所有的圖形驅動會分配默認紋理單元，因此在上一部分，你的渲染可能無效。

紋理單元的主要的目的是允許我們在著色器中使用 1 個或多個紋理。通過將紋理單元賦值給取樣器，我們可以一次綁定都多個紋理，只要我們首先激活對應的紋理單元即可。像 `glBindTexture`，我們可以使用 `glActiveTexture`，傳入我們需要用到的紋理單元，激活它。

```c
glActiveTexture(GL_TEXTURE0); // activate the texture unit first before binding texture
glBindTexture(GL_TEXTURE_2D, texture);
```

激活之後，接下來執行 `glBindTexture` `來綁定這個紋理到當前的激活的紋理單元。GL_TEXTURE0` 總是默認被激活的，因此在上面的例子裡，我們不需要在調用 `glBindTexture` 之前執行激活操作。

{% include box.html color="green" content="
OpenGL 至少有 16 個紋理單元供你使用，你可以激活的紋理單元可以從 `GL_TEXTURE0` 到 `GL_TEXTURE15`。它們按照順序被定義，因此我們也可以通過計算 `GL_TEXTURE0 + 8` 得到 `GL_TEXTURE8`，當我們對多個單元進行循環操作的時候，這很有用處。
" %}

我們還需要對片段著色器進行修改，以接收另一個 sampler，現在這很明確了：

```c
#version 330 core
...

uniform sampler2D texture1;
uniform sampler2D texture2;

void main()
{
    FragColor = mix(texture(texture1, TexCoord), texture(texture2, TexCoord), 0.2);
}
```

現在，最後輸出的顏色是兩個紋理查詢值的混合。 GLSL 內置的 `mix` 函數接收兩個值作為輸入，基於第三個參數，對它們進行線性插值。如果第三個參數是 `0.0`，它返回第一個參數；如果是 `1.0`， 它返回第二個參數；如果是 `0.2`，返回的值將會是對第一個值的 `80%` 以及第二個值的 `20%` 值之和。

我們現在需要加載並創建另一個紋理；你應該對這些步驟很熟悉了。請確保建立另一個紋理物件，載入圖片，並使用 `glTexImage2D` 產生最終的紋理。對於第二個紋理，我們將使用[你學習 OpenGL 時的面部表情](https://learnopengl.com/img/textures/awesomeface.png)：

```c

unsigned char *data = stbi_load("awesomeface.png", &width, &height, &nrChannels, 0);
if (data)
{
    glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB, width, height, 0, GL_RGBA, GL_UNSIGNED_BYTE, data);
    glGenerateMipmap(GL_TEXTURE_2D);
}
```

注意，我們加載了一個 `.png` 圖片，它包含了一個 `aplha` （透明度）通道。這意味著，我們現在需要指定圖案裡包含了 `aplha` 通道，這需要使用 `GL_RGBA` 作為數據類型。不如此，OpenGL 將無法正確解析圖案數據。

要使用第二個紋理（以及第一個紋理），我們必須略為修改一下渲染流程，將兩個紋理分別綁定到對應的紋理單元上：

```c
glActiveTexture(GL_TEXTURE0);
glBindTexture(GL_TEXTURE_2D, texture1);
glActiveTexture(GL_TEXTURE1);
glBindTexture(GL_TEXTURE_2D, texture2);

glBindVertexArray(VAO);
glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_INT, 0);
```

我們也必須告訴 OpenGL 采樣器對應的單元是哪個，這通過 `glUniform1i` 進行設定。我們只需要設置一次即可，因此我們將其放置到渲染循環之前：

```c
ourShader.use(); // don't forget to activate the shader before setting uniforms!
glUniform1i(glGetUniformLocation(ourShader.ID, "texture1"), 0); // set it manually
ourShader.setInt("texture2", 1); // or with shader class

while(...)
{
    [...]
}
```

通過 `glUniform1i` 設置了采樣器，我們保證了每一個 uniform 采樣器有了對應的紋理單元。你應該可以得到以下結果：

{% include img.html src="https://learnopengl.com/img/getting-started/textures_combined.png" %}

你或許注意到了，紋理被上下反轉了！這是由於 OpenGL 將 y 軸的 `0.0` 座標設置為圖片的底部了，但是圖片本身使用 `0.0` 表示 y 軸的頂部。幸運的是，`stb_image.h` 庫可以幫助我們將圖案圍繞 y 軸反轉，你在加載圖案的時候加上以下語句：

```c
stbi_set_flip_vertically_on_load(true);
```

告訴 `stb_image.h` 我們需要繞 y 軸翻轉圖案之後，你將得到這樣的結果：

{% include img.html src="https://learnopengl.com/img/getting-started/textures_combined2.png" %}

如果你看到了一個“開心”的箱子，那麼你做得不錯。你可以將你的代碼和[源代碼](https://learnopengl.com/code_viewer_gh.php?code=src/1.getting_started/4.2.textures_combined/textures_combined.cpp)對照一番。
