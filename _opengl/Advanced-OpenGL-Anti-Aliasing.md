---
layout: bookdetail
chapter: 二十九
title: 高級 OpenGL &bull; Anti-Aliasing
category: tech
src: "https://learnopengl.com/Advanced-OpenGL/Anti-Aliasing"
date: 2025-06-30
math: 1
book: opengl
image: "https://learnopengl.com/img/advanced/anti_aliasing_aliasing.png"
order: 29
lang: zh
glcate: Advanced-OpenGL
gltopic: Anti-Aliasing
permalink: /opengl/Advanced-OpenGL/Anti-Aliasing
---

在您充滿冒險精神的渲染旅程中，您可能遇到過模型邊緣出現的一些鋸齒狀圖案。這些「鋸齒邊緣（jagged edges）」之所以會出現，是因為光柵器（rasterizer）在幕後將頂點資料轉換為實際片段（fragments）的方式。在繪製一個簡單的立方體時，就可以看到這些鋸齒狀邊緣是什麼樣子：

![](https://learnopengl.com/img/advanced/anti_aliasing_aliasing.png)

雖然沒有立即顯現，但如果你仔細觀察立方體的邊緣，你會看到鋸齒狀的圖案。如果我們放大來看，你會看到以下內容：

![](https://learnopengl.com/img/advanced/anti_aliasing_zoomed.png)

這顯然不是我們在應用程式最終版本中想要的東西。這種清楚地看到構成邊緣的像素形狀的效果被稱為「鋸齒（aliasing）」。目前有許多被稱為「反鋸齒（anti-aliasing）」的技術，它們透過產生「更平滑」的邊緣來對抗這種鋸齒現象。

最初我們有一種叫做「超級取樣反鋸齒（super sample anti-aliasing）」（SSAA）的技術，它會暫時使用一個更高的解析度渲染緩衝區來渲染場景（超級取樣）。然後，當整個場景渲染完成後，解析度會被降取樣（downsampled）回正常的解析度。這個「額外」的解析度被用來防止這些鋸齒邊緣。雖然它確實為我們提供了鋸齒問題的解決方案，但它帶來了主要的效能缺點，因為我們必須繪製比平常多得多的片段。因此，這項技術只經歷了一個短暫的輝煌時刻。

這項技術確實催生了一種更現代的技術，稱為「多重取樣反鋸齒（multisample anti-aliasing）」或 MSAA，它借鑒了 SSAA 背後的概念，同時實施了更有效的方法。在本章中，我們將深入討論這種內建於 OpenGL 的 MSAA 技術。

## 多重取樣（Multisampling）

要了解多重取樣是什麼以及它是如何解決鋸齒問題的，我們首先需要更深入地研究 OpenGL 光柵器的內部運作。

光柵器是所有演算法和處理過程的組合，位於最終處理的頂點和片段著色器之間。光柵器會將屬於單個圖元的所有頂點，轉換為一組片段。頂點座標理論上可以有任何座標，但片段不能，因為它們受限於螢幕的解析度。頂點座標和片段之間幾乎永遠不會有一對一的映射，所以光柵器必須以某種方式確定每個特定的頂點最終將會落在哪個片段／螢幕座標上。

![](https://learnopengl.com/img/advanced/anti_aliasing_rasterization.png)

在這裡，我們看到一個螢幕像素網格，每個像素的中心都包含一個「取樣點（sample point）」，用來判斷一個像素是否被三角形覆蓋。紅色的取樣點被三角形覆蓋，並且會為該被覆蓋的像素生成一個片段。儘管三角形邊緣的某些部分仍然進入了某些螢幕像素，但該像素的取樣點沒有被三角形內部覆蓋，所以這個像素不會受到任何片段著色器的影響。

你現在可能已經能弄清楚鋸齒的起源了。渲染出的完整三角形在你的螢幕上看起來會是這樣：

![](https://learnopengl.com/img/advanced/anti_aliasing_rasterization_filled.png)

由於螢幕像素數量有限，一些像素將沿著邊緣渲染，而另一些則不會。結果就是我們渲染的圖元邊緣不平滑，從而產生了我們之前看到的鋸齒邊緣。

多重取樣所做的，不是使用單個取樣點來判斷三角形的覆蓋範圍，而是使用多個取樣點（猜猜它的名字從何而來）。我們不是在每個像素的中心放置一個單獨的取樣點，而是在每個像素中以一種通用模式放置 `4` 個「子取樣（subsamples）」，並使用這些點來確定像素的覆蓋範圍。

![](https://learnopengl.com/img/advanced/anti_aliasing_sample_points.png)

圖片的左側展示了我們通常如何判斷三角形的覆蓋範圍。這個特定的像素不會執行片段著色器（因此保持空白），因為它的取樣點沒有被三角形覆蓋。圖片的右側展示了一個多重取樣版本，其中每個像素包含 `4` 個取樣點。在這裡我們可以看到，只有 `2` 個取樣點覆蓋了三角形。

{% include box.html content="
取樣點的數量可以是我們想要的任何數字，更多的取樣點會給我們更好的覆蓋精確度。
" color="green" %}

這就是多重取樣變得有趣的地方。我們確定了 `2` 個子取樣被三角形覆蓋，所以下一步是為這個特定像素確定一個顏色。我們最初的猜測可能是，我們為每個被覆蓋的子取樣執行片段著色器，然後再將每個像素中每個子取樣的顏色進行平均。在這種情況下，我們將在每個子取樣處對插值後的頂點資料執行兩次片段著色器，並將得到的顏色儲存在那些取樣點中。這（幸運地）**不是**它的運作方式，因為這將意味著我們需要執行比沒有多重取樣時多得多的片段著色器，這會急劇降低效能。

MSAA 的實際運作方式是，片段著色器每個像素（對於每個圖元）只執行**一次**，無論三角形覆蓋了多少個子取樣；片段著色器在插值到像素**中心**的頂點資料上運行。然後，MSAA 使用一個更大的深度/模板緩衝區來確定子取樣的覆蓋範圍。被覆蓋的子取樣數量決定了該像素的顏色對畫面緩衝區（framebuffer）的貢獻程度。因為在之前的圖片中，4 個取樣中只有 2 個被覆蓋，所以三角形顏色的一半會與畫面緩衝區顏色（在本例中是清除顏色）混合，產生一個淺藍色的顏色。

結果是一個更高解析度的緩衝區（帶有更高解析度的深度/模板），其中所有的圖元邊緣現在都產生了更平滑的圖案。讓我們看看當我們確定之前那個三角形的覆蓋範圍時，多重取樣看起來像什麼：

![](https://learnopengl.com/img/advanced/anti_aliasing_rasterization_samples.png)

在這裡，每個像素包含 4 個子取樣（不相關的取樣已被隱藏），其中藍色子取樣被三角形覆蓋，而灰色取樣點則沒有。在三角形的內部區域中，所有像素都會執行一次片段著色器，其顏色輸出直接儲存在畫面緩衝區中（假設沒有混合）。然而，在三角形的內部邊緣，並非所有的子取樣都會被覆蓋，因此片段著色器的結果不會完全貢獻給畫面緩衝區。根據被覆蓋的取樣數量，三角形片段顏色或多或少會影響該像素。

對於每個像素，屬於三角形的子取樣越少，它採用的三角形顏色就越少。如果我們填入實際的像素顏色，我們就會得到以下圖片：

![](https://learnopengl.com/img/advanced/anti_aliasing_rasterization_samples_filled.png)

三角形的硬邊現在被比實際邊緣顏色略淺的顏色包圍，這使得從遠處看時邊緣顯得平滑。

深度和模板值是按子取樣儲存的，並且，儘管我們只執行一次片段著色器，但對於多個三角形重疊單個像素的情況，顏色值也是按子取樣儲存的。對於深度測試，頂點的深度值在執行深度測試之前被插值到每個子取樣，而對於模板測試，我們將模板值按子取樣儲存。這確實意味著緩衝區的大小現在會根據每個像素的子取樣數量而增加。

到目前為止我們討論的，是多重取樣反鋸齒在幕後如何運作的一個基本概述。光柵器背後的實際邏輯要複雜一些，但這個簡短的描述應該足以理解多重取樣反鋸齒背後的概念和邏輯；這足以深入研究實際應用層面了。

## OpenGL 中的 MSAA

如果我們想在 OpenGL 中使用 MSAA，我們需要一個能夠儲存每個像素超過一個取樣值的緩衝區。我們需要一種能夠儲存給定數量多重取樣的新型緩衝區，這被稱為「多重取樣緩衝區（multisample buffer）」。

大多數視窗系統都能夠為我們提供一個多重取樣緩衝區，而不是一個預設緩衝區。GLFW 也為我們提供了這個功能，我們所需要做的，就是在建立視窗之前呼叫 `glfwWindowHint`，來「提示（hint）」GLFW 我們想要使用一個帶有 N 個取樣的多重取樣緩衝區，而不是一個普通的緩衝區：

```cpp
glfwWindowHint(GLFW_SAMPLES, 4);
```

現在，當我們呼叫 `glfwCreateWindow` 時，我們建立了一個渲染視窗，但這次它的緩衝區每個螢幕座標包含 4 個子取樣。這確實意味著緩衝區的大小增加了 4 倍。

現在我們已經要求 GLFW 提供多重取樣緩衝區，我們需要透過使用 `GL_MULTISAMPLE` 呼叫 `glEnable` 來啟用多重取樣。在大多數 OpenGL 驅動程式上，多重取樣預設是啟用的，所以這個呼叫有點多餘，但無論如何啟用它通常是個好主意。這樣，所有 OpenGL 實作都將啟用多重取樣。

```cpp
glEnable(GL_MULTISAMPLE);
```

因為實際的多重取樣演算法是在你的 OpenGL 驅動程式中的光柵器中實作的，所以我們不需要做太多其他的事情。如果我們現在要渲染本章開頭的那個綠色立方體，我們應該會看到更平滑的邊緣：

![](https://learnopengl.com/img/advanced/anti_aliasing_multisampled.png)

立方體看起來確實平滑了許多，對於你在場景中繪製的任何其他物件也同樣適用。你可以在[這裡](https://learnopengl.com/code_viewer_gh.php?code=src/4.advanced_opengl/11.1.anti_aliasing_msaa/anti_aliasing_msaa.cpp)找到這個簡單範例的原始碼。

## 離屏 MSAA（Off-screen MSAA）

因為 GLFW 負責建立多重取樣緩衝區，所以啟用 MSAA 非常容易。然而，如果我們想使用自己的畫面緩衝區，我們就必須自己生成多重取樣緩衝區；現在我們確實需要**自己**來處理建立多重取樣緩衝區的工作。

有兩種方法可以建立多重取樣緩衝區，以充當畫面緩衝區的附著：紋理附著（texture attachments）和渲染緩衝區附著（renderbuffer attachments）。這與我們在[畫面緩衝區](https://www.google.com/search?q=/opengl/Advanced-OpenGL/Framebuffers)章節中討論過的普通附著非常相似。

### 多重取樣紋理附著

要建立一個支援儲存多個取樣點的紋理，我們使用 `glTexImage2DMultisample` 來代替 `glTexImage2D`，它接受 `GL_TEXTURE_2D_MULTISAPLE` 作為其紋理目標：

```cpp
glBindTexture(GL_TEXTURE_2D_MULTISAMPLE, tex);
glTexImage2DMultisample(GL_TEXTURE_2D_MULTISAMPLE, samples, GL_RGB, width, height, GL_TRUE);
glBindTexture(GL_TEXTURE_2D_MULTISAMPLE, 0);
```

第二個參數設定了我們希望紋理擁有的取樣數量。如果最後一個參數設定為 `GL_TRUE`，則圖像將為每個紋素（texel）使用相同的取樣位置和相同數量的子取樣。

要將多重取樣紋理附著到畫面緩衝區，我們使用 `glFramebufferTexture2D`，但這次使用 `GL_TEXTURE_2D_MULTISAMPLE` 作為紋理類型：

```cpp
glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D_MULTISAMPLE, tex, 0);
```

目前繫結的畫面緩衝區現在有一個以紋理圖像形式存在的多重取樣顏色緩衝區。

### 多重取樣渲染緩衝區物件

與紋理一樣，創建一個多重取樣渲染緩衝區物件並不困難。它甚至相當簡單，因為當我們配置（目前繫結的）渲染緩衝區的記憶體儲存時，我們所需要做的，就是將 `glRenderbufferStorage` 改為 `glRenderbufferStorageMultisample`：

```cpp
glRenderbufferStorageMultisample(GL_RENDERBUFFER, 4, GL_DEPTH24_STENCIL8, width, height);
```

這裡改變的一點是額外的第二個參數，我們在其中設定了我們想要使用的取樣數量；在本例中為 4。

### 渲染到多重取樣畫面緩衝區

渲染到多重取樣畫面緩衝區是簡單明瞭的。每當我們在畫面緩衝區物件被繫結時繪製任何東西，光柵器都會處理所有多重取樣操作。然而，因為多重取樣緩衝區有點特別，我們不能直接將緩衝區用於其他操作，例如在著色器中對其進行取樣。

多重取樣圖像包含比普通圖像多得多的資訊，所以我們需要做的是將圖像降取樣（downscale）或「解析（resolve）」。解析一個多重取樣畫面緩衝區通常是透過 `glBlitFramebuffer` 來完成的，它將一個區域從一個畫面緩衝區複製到另一個，同時也會解析任何多重取樣緩衝區。

`glBlitFramebuffer` 將一個由 4 個螢幕空間座標定義的給定「來源（source）」區域，傳輸到一個同樣由 4 個螢幕空間座標定義的給定「目標（target）」區域。你可能還記得在[畫面緩衝區](https://www.google.com/search?q=/opengl/Advanced-OpenGL/Framebuffers)章節中，如果我們繫結到 `GL_FRAMEBUFFER`，我們就是同時繫結到讀取和繪製畫面緩衝區目標。我們也可以透過分別將畫面緩衝區繫結到 `GL_READ_FRAMEBUFFER` 和 `GL_DRAW_FRAMEBUFFER` 來單獨繫結到這些目標。`glBlitFramebuffer` 函式從這兩個目標中讀取，以確定哪個是來源，哪個是目標畫面緩衝區。然後，我們可以透過將圖像「位元區塊傳輸（blitting）」到預設畫面緩衝區，將多重取樣畫面緩衝區的輸出傳輸到實際的螢幕上，如下所示：

```cpp
glBindFramebuffer(GL_READ_FRAMEBUFFER, multisampledFBO);
glBindFramebuffer(GL_DRAW_FRAMEBUFFER, 0);
glBlitFramebuffer(0, 0, width, height, 0, 0, width, height, GL_COLOR_BUFFER_BIT, GL_NEAREST);
```

如果我們現在要渲染相同的應用程式，我們應該會得到相同的輸出：一個帶有 MSAA 的檸檬綠立方體，再次顯示出明顯更少的鋸齒邊緣：

![](https://learnopengl.com/img/advanced/anti_aliasing_multisampled.png)

你可以在[這裡](https://learnopengl.com/code_viewer_gh.php?code=src/4.advanced_opengl/11.2.anti_aliasing_offscreen/anti_aliasing_offscreen.cpp)找到原始碼。

但是，如果我們想使用多重取樣畫面緩衝區的紋理結果來進行後處理（post-processing）之類的事情該怎麼辦？我們無法直接在片段著色器中使用多重取樣紋理。然而，我們可以做的是將多重取樣緩衝區位元區塊傳輸到一個帶有非多重取樣紋理附著的不同 FBO。然後，我們使用這個普通的顏色附著紋理進行後處理，有效地對透過多重取樣渲染的圖像進行後處理。這確實意味著我們必須生成一個新的 FBO，它僅僅作為一個中間畫面緩衝區物件，用於將多重取樣緩衝區解析為一個普通的 2D 紋理，供我們在片段著色器中使用。這個過程用虛擬碼表示如下：

```cpp
unsigned int msFBO = CreateFBOWithMultiSampledAttachments();
// then create another FBO with a normal texture color attachment
[...]
glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, screenTexture, 0);
[...]
while(!glfwWindowShouldClose(window))
{
    [...]

    glBindFramebuffer(msFBO);
    ClearFrameBuffer();
    DrawScene();
    // now resolve multisampled buffer(s) into intermediate FBO
    glBindFramebuffer(GL_READ_FRAMEBUFFER, msFBO);
    glBindFramebuffer(GL_DRAW_FRAMEBUFFER, intermediateFBO);
    glBlitFramebuffer(0, 0, width, height, 0, 0, width, height, GL_COLOR_BUFFER_BIT, GL_NEAREST);
    // now scene is stored as 2D texture image, so use that image for post-processing
    glBindFramebuffer(GL_FRAMEBUFFER, 0);
    ClearFramebuffer();
    glBindTexture(GL_TEXTURE_2D, screenTexture);
    DrawPostProcessingQuad();

    [...]
}
```

如果我們將其實現到[畫面緩衝區](https://www.google.com/search?q=/opengl/Advanced-OpenGL/Framebuffers)章節的後處理程式碼中，我們就能夠在一個（幾乎）沒有鋸齒邊緣的場景紋理上，創建各種很酷的後處理效果。應用灰階後處理濾鏡後，它看起來會像這樣：

![](https://learnopengl.com/img/advanced/anti_aliasing_post_processing.png)

{% include box.html content="
因為螢幕紋理再次是一個普通的（非多重取樣）紋理，所以像「邊緣偵測（edge-detection）」這樣的某些後處理濾鏡會再次引入鋸齒邊緣。為了應對這個問題，你可以在之後對紋理進行模糊處理，或者建立你自己的反鋸齒演算法。
" color="green" %}

您可以看到，當我們想要將多重取樣與離屏渲染結合時，我們需要處理一些額外的步驟。然而，這些步驟是值得額外付出的努力的，因為多重取樣會顯著提升場景的視覺品質。請注意，使用的取樣越多，啟用多重取樣可能會顯著降低效能。

## 自訂反鋸齒演算法

可以將多重取樣紋理圖像直接傳遞給片段著色器，而不是先對其進行解析。GLSL 讓我們能夠按子取樣來對紋理圖像進行取樣，這樣我們就可以建立自己的自訂反鋸齒演算法。

要獲取每個子取樣的紋理值，你必須將紋理 uniform 取樣器定義為 `sampler2DMS`，而不是通常的 `sampler2D`：

```cpp
uniform sampler2DMS screenTextureMS;
```

然後，使用 `texelFetch` 函式，就可以檢索每個取樣的顏色值：

```cpp
vec4 colorSample = texelFetch(screenTextureMS, TexCoords, 3);  // 4th subsample
```

我們不會在這裡深入探討創建自訂反鋸齒技術的細節，但這可能足以讓您開始自己構建一個。
