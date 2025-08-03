---
layout: bookdetail
chapter: 三十七
title: 高級光照 &bull; 輝光（Bloom）
category: tech
src: "https://learnopengl.com/Advanced-Lighting/Bloom"
date: 2025-07-02
math: 1
book: opengl
image: "https://learnopengl.com/img/advanced-lighting/bloom_example.png"
order: 37
lang: zh
glcate: Advanced-Lighting
gltopic: Bloom
permalink: /opengl/Advanced-Lighting/Bloom
---

明亮的光源以及被強光照射的區域，常常難以在顯示器上真實呈現，因為顯示器的亮度範圍有限。一種讓光源在螢幕上更顯著的方法是讓它發光（glow）；光線會從光源周圍「溢出」(bleed)，這樣能有效給觀眾一種光源非常明亮的視覺錯覺。

這種光線溢出或發光效果，是透過一種後製特效「輝光（Bloom）」來實現的。Bloom 會讓場景中所有明亮區域呈現類似發光的效果。下面是有無輝光效果的比較範例（圖片來源：Epic Games）：

![](https://learnopengl.com/img/advanced-lighting/bloom_example.png)

Bloom 能讓物體的亮度有明顯的視覺提示。如果輕微且適度使用（但許多遊戲未能做到這點），Bloom 可以大幅提升場景的光影表現，並帶來各種戲劇化的效果。

Bloom 最適合與 [HDR](/opengl/Advanced-Lighting/HDR) 渲染結合使用。很多人誤以為 HDR 就是 Bloom，甚至將兩者混用，然而它們其實是完全不同的技術，目標和用途也不同。Bloom 可以在傳統的 8-bit 色深幀緩衝區(framebuffer)上實現，HDR 也可以在不使用 Bloom 的情況下實現。只是 HDR 讓 Bloom 更容易發揮其效果（稍後我們會看到）。

要實作 Bloom，我們先像平常一樣渲染出一個有光照的場景，接著取出場景的 HDR 色彩緩衝區，並額外取出一張只包含明亮區域的圖像。這張明亮區域圖像會被模糊處理，然後再將結果疊加回原始 HDR 場景圖像上。

讓我們一步步說明這個過程。我們渲染一個有 4 個明亮光源的場景，這些光源以彩色立方體表示。彩色立方體的亮度值介於 `1.5` 到 `15.0`。若將此渲染到 HDR 色彩緩衝區，場景會是這樣：

![](https://learnopengl.com/img/advanced-lighting/bloom_scene.png)

接著我們從這個 HDR 色彩緩衝區中擷取亮度超過特定門檻的所有片段(fragment)。這樣得到的圖像只會顯示亮色區域，因為它們的亮度高於門檻值：

![](https://learnopengl.com/img/advanced-lighting/bloom_extracted.png)

然後我們對這張亮度圖做模糊處理。Bloom 效果的強弱主要取決於使用的模糊濾波器的範圍與強度。

![](https://learnopengl.com/img/advanced-lighting/bloom_blurred.png)

模糊後的結果就是用來呈現發光或光線溢出效果的貼圖。我們將此模糊圖疊加在原始 HDR 場景貼圖之上。因為明亮區域因模糊濾波器的影響在寬度和高度上都有延伸，場景中這些亮區看起來就像在發光或「溢出」光線。

![](https://learnopengl.com/img/advanced-lighting/bloom_small.png)

Bloom 本身不算複雜的技術，但要調整得恰到好處卻不容易。Bloom 的視覺品質很大程度上取決於用於模糊亮區的濾波器品質與類型。稍微調整濾波器參數就可能讓 Bloom 效果大不同。

依照以上步驟，我們就能實現 Bloom 後製特效。下圖簡要總結了實作 Bloom 需要的步驟：

![](https://learnopengl.com/img/advanced-lighting/bloom_steps.png)

第一步是根據亮度門檻值擷取場景中所有明亮的顏色。接下來讓我們先深入了解這一步驟。

## 擷取明亮色彩

第一步，我們需要從渲染出的場景中擷取兩張影像。我們可以分兩次渲染場景，使用不同的幀緩衝區和不同的著色器，但也可以使用一個很棒的小技巧，叫做「多重渲染目標（Multiple Render Targets，MRT）」，它允許我們在片段著色器中輸出多個顏色輸出；這樣我們就能在一次渲染過程中，同時擷取出兩張影像。

透過在片段著色器輸出變數前指定 `layout location`，我們可以控制片段著色器輸出寫入哪個顏色緩衝區：

```cpp
layout (location = 0) out vec4 FragColor;
layout (location = 1) out vec4 BrightColor;
```

這個方法只有在我們實際有多個緩衝區可寫入時才有效。使用多重片段著色器輸出的一個必要條件是：當前綁定的幀緩衝區物件（framebuffer object）必須附加多個顏色緩衝區（color buffers）。

你可能還記得在[幀緩衝區（framebuffers）](/opengl/Advanced-OpenGL/Framebuffers)章節中，我們可以在將紋理作為幀緩衝區的顏色緩衝時，指定顏色附件號（color attachment number）。到目前為止，我們一直使用 `GL_COLOR_ATTACHMENT0`，但如果同時使用 `GL_COLOR_ATTACHMENT1`，我們就可以讓一個幀緩衝物件附加兩個顏色緩衝區，如下所示：

```cpp
// set up floating point framebuffer to render scene to
unsigned int hdrFBO;
glGenFramebuffers(1, &hdrFBO);
glBindFramebuffer(GL_FRAMEBUFFER, hdrFBO);
unsigned int colorBuffers[2];
glGenTextures(2, colorBuffers);
for (unsigned int i = 0; i < 2; i++)
{
    glBindTexture(GL_TEXTURE_2D, colorBuffers[i]);
    glTexImage2D(
        GL_TEXTURE_2D, 0, GL_RGBA16F, SCR_WIDTH, SCR_HEIGHT, 0, GL_RGBA, GL_FLOAT, NULL
    );
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
    // attach texture to framebuffer
    glFramebufferTexture2D(
        GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0 + i, GL_TEXTURE_2D, colorBuffers[i], 0
    );
}
```

我們必須明確告訴 OpenGL 我們要渲染到多個顏色緩衝區，這是透過 `glDrawBuffers` 函數來實現的。預設情況下，OpenGL 只會渲染到幀緩衝區的第一個顏色附件（color attachment），而忽略其他附件。

我們可以透過傳入一個顏色附件枚舉值（color attachment enums）陣列，來指定後續操作中要渲染到哪些顏色緩衝區：

```cpp
unsigned int attachments[2] = { GL_COLOR_ATTACHMENT0, GL_COLOR_ATTACHMENT1 };
glDrawBuffers(2, attachments);
```

當我們向這個幀緩衝區渲染時，只要片段著色器中使用了 `layout location` 指定符，對應的位置就會對應到相應的顏色緩衝區，該緩衝區會用來渲染該片段。這樣做非常好，因為我們可以直接從正在渲染的片段中提取亮區，省去了額外的渲染通道來抽取亮區的步驟。

```cpp
#version 330 core
layout (location = 0) out vec4 FragColor;
layout (location = 1) out vec4 BrightColor;

[...]

void main()
{
    [...] // first do normal lighting calculations and output results
    FragColor = vec4(lighting, 1.0);
    // check whether fragment output is higher than threshold, if so output as brightness color
    float brightness = dot(FragColor.rgb, vec3(0.2126, 0.7152, 0.0722));
    if(brightness > 1.0)
        BrightColor = vec4(FragColor.rgb, 1.0);
    else
        BrightColor = vec4(0.0, 0.0, 0.0, 1.0);
}
```

這裡我們先像平常一樣計算光照結果，並將其傳遞給片段著色器的第一個輸出變數 `FragColor`。接著，我們利用 `FragColor` 中目前的顏色值計算該片段的亮度，判斷其是否超過某個閾值。亮度的計算先將顏色轉成灰階（透過兩個向量的點積運算，實際上是將各個通道分別乘以權重後相加），如果亮度超過閾值，則將該顏色輸出到第二個顏色緩衝區。對於光源立方體的顏色，也採用相同方法處理。

這也說明了為什麼 Bloom 效果與 HDR 渲染搭配得非常好。由於 HDR 允許顏色值超過 `1.0`，我們可以設定一個大於預設範圍的亮度閾值，這讓我們對於「什麼是亮」擁有更大的控制權。若沒有 HDR，我們只能將閾值設在 `1.0` 以下，雖然仍可運作，但亮區的判定會更容易達成，有時會讓發光效果過於強烈（例如白色發光的雪地）。

透過這兩個顏色緩衝區，我們可以在單次渲染過程中同時生成一張場景的正常圖像與一張只包含提取出來亮區的圖像。

![](https://learnopengl.com/img/advanced-lighting/bloom_attachments.png)

有了這張亮區圖像後，我們接下來要對它進行模糊處理。我們可以用簡單的盒狀濾波器（box filter）來模糊，正如在幀緩衝區章節的後期處理部分所做的，但我們更想使用一種更先進且效果更佳的模糊濾波器，稱為「高斯模糊」（Gaussian blur）。

## 高斯模糊

在後期處理章節的模糊中，我們是對圖像周圍所有像素取平均值。雖然這種方式簡單且能達到模糊效果，但結果並不理想。高斯模糊則是基於高斯曲線（Gaussian curve），這條曲線通常被描述為一條「鐘形曲線」，在中心點附近數值較高，並隨著距離逐漸減少。高斯曲線可以用不同數學形式來表示，但通常形狀如下面圖片所示：

![](https://learnopengl.com/img/advanced-lighting/bloom_gaussian.png)

由於高斯曲線在中心附近覆蓋範圍較大，使用其作為權重對圖像進行模糊時，距離中心點較近的樣本會有較高的權重，讓模糊效果更加自然。例如，若我們取一個 32x32 的區域進行取樣，距離中心像素越遠的樣本權重越小，這樣能產生更好且更真實的模糊效果，這就是所謂的「高斯模糊」。

實現高斯模糊濾波器時，我們需要一個二維的權重矩陣，而這個矩陣可以從二維的高斯曲線方程式獲得。然而這種方法的計算量非常大，例如用一個 32x32 的模糊核，對每個像素都要取樣 1024 次，性能代價非常高。

幸運的是，高斯方程有一個巧妙的性質，可以將二維方程拆成兩個一維方程：一個描述水平方向的權重，另一個描述垂直方向的權重。這樣我們可以先用水平方向的權重對場景貼圖做模糊，然後再用垂直方向的權重對結果做模糊。這樣的效果和直接做二維模糊一樣好，但性能大幅提升：只需做 32 + 32 次取樣，而非 1024 次！這種技術被稱為「雙通道高斯模糊」（two-pass Gaussian blur）。

![](https://learnopengl.com/img/advanced-lighting/bloom_gaussian_two_pass.png)

這表示我們至少需要模糊兩次圖像，而這種操作最適合使用幀緩衝區（framebuffer objects）。對於雙通道高斯模糊，我們會實作所謂的「乒乓幀緩衝區」（ping-pong framebuffers），即兩個幀緩衝區交替使用：每次渲染時把其中一個幀緩衝區的顏色緩衝區作為輸入，並將結果渲染到另一個幀緩衝區中，接著再互換，重複若干次。這樣，我們先在第一個幀緩衝區對場景紋理做水平模糊，再將結果傳入第二個幀緩衝區做垂直模糊，然後反覆切換，達到多次模糊的效果。

在深入幀緩衝區的實作前，我們先來看看高斯模糊的片段著色器。

```cpp
#version 330 core
out vec4 FragColor;

in vec2 TexCoords;

uniform sampler2D image;

uniform bool horizontal;
uniform float weight[5] = float[] (0.227027, 0.1945946, 0.1216216, 0.054054, 0.016216);

void main()
{
    vec2 tex_offset = 1.0 / textureSize(image, 0); // gets size of single texel
    vec3 result = texture(image, TexCoords).rgb * weight[0]; // current fragment's contribution
    if(horizontal)
    {
        for(int i = 1; i < 5; ++i)
        {
            result += texture(image, TexCoords + vec2(tex_offset.x * i, 0.0)).rgb * weight[i];
            result += texture(image, TexCoords - vec2(tex_offset.x * i, 0.0)).rgb * weight[i];
        }
    }
    else
    {
        for(int i = 1; i < 5; ++i)
        {
            result += texture(image, TexCoords + vec2(0.0, tex_offset.y * i)).rgb * weight[i];
            result += texture(image, TexCoords - vec2(0.0, tex_offset.y * i)).rgb * weight[i];
        }
    }
    FragColor = vec4(result, 1.0);
}
```

這裡我們使用了一組相對較小的高斯權重樣本，分別用來給當前片段附近的水平或垂直方向取樣點賦予不同的權重。你可以看到我們根據傳入的 `horizontal` uniform 來決定是做水平方向模糊還是垂直方向模糊，將模糊濾波器拆分成兩個階段。

偏移距離的計算則根據貼圖中單個像素（texel）的大小來決定，透過將 `1.0` 除以貼圖的尺寸（使用 `textureSize` 函數得到的 `vec2`）取得。

在模糊圖像時，我們會建立兩個基本的幀緩衝區（framebuffer），每個幀緩衝區只附加一個顏色緩衝紋理：

```cpp
unsigned int pingpongFBO[2];
unsigned int pingpongBuffer[2];
glGenFramebuffers(2, pingpongFBO);
glGenTextures(2, pingpongBuffer);
for (unsigned int i = 0; i < 2; i++)
{
    glBindFramebuffer(GL_FRAMEBUFFER, pingpongFBO[i]);
    glBindTexture(GL_TEXTURE_2D, pingpongBuffer[i]);
    glTexImage2D(
        GL_TEXTURE_2D, 0, GL_RGBA16F, SCR_WIDTH, SCR_HEIGHT, 0, GL_RGBA, GL_FLOAT, NULL
    );
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
    glFramebufferTexture2D(
        GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, pingpongBuffer[i], 0
    );
}
```

在我們取得 HDR 紋理和提取出的亮度紋理後，我們會先將亮度紋理填充到其中一個乒乓幀緩衝區中，接著對該圖像進行 10 次模糊操作（其中 5 次為水平方向，5 次為垂直方向）。

```cpp
bool horizontal = true, first_iteration = true;
int amount = 10;
shaderBlur.use();
for (unsigned int i = 0; i < amount; i++)
{
    glBindFramebuffer(GL_FRAMEBUFFER, pingpongFBO[horizontal]);
    shaderBlur.setInt("horizontal", horizontal);
    glBindTexture(
        GL_TEXTURE_2D, first_iteration ? colorBuffers[1] : pingpongBuffers[!horizontal]
    );
    RenderQuad();
    horizontal = !horizontal;
    if (first_iteration)
        first_iteration = false;
}
glBindFramebuffer(GL_FRAMEBUFFER, 0);
```

每次迭代時，我們根據要水平模糊還是垂直模糊來綁定兩個幀緩衝區中的一個，並將另一個幀緩衝區的顏色緩衝區綁定為要模糊的紋理。在第一次迭代時，我們特別綁定想要模糊的紋理（`brightnessTexture`），因為如果不這樣做，兩個顏色緩衝區都會是空的。通過重複這個過程 10 次，亮度圖像最終會被完整地做了 5 次高斯模糊。這種設計讓我們可以任意次數地對任何圖像進行模糊；高斯模糊迭代越多，模糊效果越強。

通過對提取出的亮度紋理做 5 次模糊，我們得到了場景中所有明亮區域的正確模糊圖像。

![](https://learnopengl.com/img/advanced-lighting/bloom_blurred_large.png)

完成 Bloom 效果的最後一步是將這個模糊過的亮度紋理和原始場景的 HDR 紋理結合起來。

## 混合兩個紋理

當我們擁有了場景的 HDR 紋理以及經過模糊處理的場景亮度紋理後，只需將兩者結合即可實現著名的 Bloom（泛光）或發光效果。在最終的片段著色器中（大致與我們在 [HDR](/opengl/Advanced-Lighting/HDR) 章節中使用的相似），我們對這兩個紋理進行加法混合：

```cpp
#version 330 core
out vec4 FragColor;

in vec2 TexCoords;

uniform sampler2D scene;
uniform sampler2D bloomBlur;
uniform float exposure;

void main()
{
    const float gamma = 2.2;
    vec3 hdrColor = texture(scene, TexCoords).rgb;
    vec3 bloomColor = texture(bloomBlur, TexCoords).rgb;
    hdrColor += bloomColor; // additive blending
    // tone mapping
    vec3 result = vec3(1.0) - exp(-hdrColor * exposure);
    // also gamma correct while we're at it
    result = pow(result, vec3(1.0 / gamma));
    FragColor = vec4(result, 1.0);
}
```

有趣的是，我們是在應用色調映射（tone mapping）之前加入 Bloom 效果。這樣一來，Bloom 增加的亮度也會被柔和地轉換到低動態範圍（LDR），使得整體光線效果更自然、相對更協調。

將兩個紋理加在一起後，場景中所有明亮區域都會有適當的發光效果：

![](https://learnopengl.com/img/advanced-lighting/bloom.png)

彩色立方體現在看起來更亮，也更有作為光源物體的感覺。這是一個相對簡單的場景，因此 Bloom 效果並不算特別驚艷，但在光線充足的複雜場景中，經過良好配置的 Bloom 效果可以帶來顯著差異。你可以在這裡找到這個簡單範例的源碼：[點此查看](https://learnopengl.com/code_viewer_gh.php?code=src/5.advanced_lighting/7.bloom/bloom.cpp)。

在本章中，我們使用了一個相對簡單的高斯模糊濾波器，每個方向只取 5 個樣本。若想提升模糊效果，可以採用更大半徑取更多樣本，或者重複模糊過程多次。模糊效果的品質與 Bloom 效果的品質直接相關，改進模糊步驟會帶來明顯提升。有些改進方式是結合不同大小的模糊核，或使用多個高斯曲線來選擇性地組合權重。Kalogirou 和 Epic Games 的額外資源中討論了如何透過改進高斯模糊來顯著提升 Bloom 效果。

## 額外資源

- [使用線性取樣的高效高斯模糊](http://rastergrid.com/blog/2010/09/efficient-gaussian-blur-with-linear-sampling/)：詳細說明了高斯模糊的原理，以及如何利用 OpenGL 的雙線性紋理取樣來提升性能。
- [Bloom 後處理效果](https://web.archive.org/web/20190128205221/https://udk-legacy.unrealengine.com/udk/Three/Bloom.html)：Epic Games 的文章，介紹如何通過結合多條高斯曲線的權重來改進 Bloom 效果。
- [如何為 HDR 渲染實現優秀的 Bloom](http://kalogirou.net/2006/05/20/how-to-do-good-bloom-for-hdr-rendering/)：Kalogirou 的文章，描述了如何使用更好的高斯模糊方法來提升 Bloom 效果。
