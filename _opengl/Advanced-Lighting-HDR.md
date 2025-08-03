---
layout: bookdetail
chapter: 三十六
title: 高級光照 &bull; HDR
category: tech
src: "https://learnopengl.com/Advanced-Lighting/HDR"
date: 2025-07-02
math: 1
book: opengl
image: "https://learnopengl.com/img/advanced-lighting/hdr_clamped.png"
order: 36
lang: zh
glcate: Advanced-Lighting
gltopic: HDR
permalink: /opengl/Advanced-Lighting/HDR
---

亮度與色彩值在預設情況下，當被儲存進 framebuffer（幀緩衝）時，會被限制在 `0.0` 到 `1.0` 之間。這看似無害的設定，導致我們總是必須在這個範圍內設定光源與顏色的數值，努力讓它們「剛好」地適配場景。這麼做雖然勉強能夠產生還不錯的結果，但如果我們走進一個非常明亮的區域，有多個強光源，總亮度加起來超過 `1.0`，那會發生什麼事呢？答案是，所有亮度或顏色總和超過 `1.0` 的片元都會被夾制（clamp）成 `1.0`，這樣的畫面看起來就會非常怪異：

![](https://learnopengl.com/img/advanced-lighting/hdr_clamped.png)

由於大量片元的顏色值都被限制為 `1.0`，結果就是這些亮片元在畫面上的大區域變成一模一樣的純白色，導致細節完全消失，視覺上也顯得不真實。

一個解法是降低光源的強度，確保場景中沒有任何區域的亮度超過 `1.0`。但這不是好方法，因為這等於強迫你使用不真實的光照參數。更好的方式是：允許顏色值在中途暫時超過 `1.0`，然後在最後一步再轉換回 `0.0` 到 `1.0` 的範圍，同時保留細節。

雖然螢幕（非 HDR）只能顯示 `0.0` 到 `1.0` 的顏色值，但在光照計算中並沒有這樣的限制。如果我們允許片元顏色超出 `1.0`，就能在一個稱為「高動態範圍（HDR）」的範圍中運作。使用 HDR，可以讓亮的物體真的很亮，暗的部分也能真的很暗，而且在兩者之中都保有細節。

HDR 最初只被用在攝影中，攝影師會對同一個場景用不同曝光值拍攝多張照片，捕捉更寬廣的亮度資訊。這些照片合成後，就會產生一張 HDR 圖像，可以根據觀看時的曝光設定顯示出更多細節。例如以下這張圖（圖片來源：Colin Smith），在低曝光下，可以看到窗戶明亮區域的細節；而這些細節在高曝光下則消失了。不過高曝光又能讓我們看到暗處先前不可見的細節。

![](https://learnopengl.com/img/advanced-lighting/hdr_image.png)

這其實和人眼的運作方式很相似，也是 HDR 渲染的基礎。當周圍光線變暗時，人的眼睛會自動調整，使暗部變得可見；而當光變亮時，眼睛也會調整感光能力。就像我們的視覺系統有一個自動的曝光滑桿，根據場景亮度不斷調整。

HDR 渲染的原理也是類似的：我們允許場景中的顏色值超出傳統範圍，收集畫面中亮部與暗部的細節資訊，最後再將這些 HDR 數值轉換回一般顯示設備能處理的「低動態範圍（LDR）」$0.0, 1.0$。這個轉換過程稱為「色調映射（tone mapping）」，其目的是在轉換時保留最多的 HDR 細節。色調映射通常也包含一個曝光參數，可根據需求偏向顯示暗部或亮部細節。

對於即時渲染而言，HDR 不僅可以讓我們超越 LDR 的 $0.0, 1.0$ 限制，保留更多細節，還能讓我們以「真實強度」設定光源。例如太陽的亮度遠高於手電筒，那為什麼不如實設為 `100.0` 呢？這讓我們可以使用更符合現實的光照參數來建構場景，這在 LDR 中幾乎不可能，因為超過 `1.0` 就會被夾制。

不過，因為（非 HDR）螢幕仍只能顯示 `0.0` 到 `1.0` 的範圍，所以我們還是得把 HDR 數值轉回這個範圍。直接將 HDR 顏色平均縮放可能會讓亮部過度主導畫面。相反地，我們可以透過各種公式與曲線來將 HDR 轉為 LDR，這樣就能完全控制畫面的整體亮度。這正是前面提到的「色調映射」處理，也是 HDR 渲染的最後一步。

## 浮點數幀緩衝區（Floating point framebuffers）

要實作高動態範圍（HDR）渲染，我們需要某種方法來防止每次 fragment shader 執行後，顏色值被夾制（clamp）。當幀緩衝區（framebuffer）使用標準的定點格式（例如 `GL_RGB`）作為其 color buffer 的內部格式時，OpenGL 會自動將顏色值限制在 `0.0` 到 `1.0` 之間再儲存進幀緩衝區。這個行為適用於大多數的幀緩衝格式，但「浮點數格式（floating point formats）」除外。

當我們將幀緩衝區的 color buffer 內部格式指定為 `GL_RGB16F`、`GL_RGBA16F`、`GL_RGB32F` 或 `GL_RGBA32F` 時，該幀緩衝區就成為一個「浮點數幀緩衝區（floating point framebuffer）」，它可以儲存超出預設 `0.0` 到 `1.0` 範圍的浮點數值。這正是實現 HDR 渲染的理想選擇！

要建立一個浮點數幀緩衝區，我們只需要變更 color buffer 的內部格式參數即可：

```cpp
glBindTexture(GL_TEXTURE_2D, colorBuffer);
glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA16F, SCR_WIDTH, SCR_HEIGHT, 0, GL_RGBA, GL_FLOAT, NULL);
```

OpenGL 的預設幀緩衝區每個顏色通道只佔用 8 位元（bit）。但如果使用 `GL_RGB32F` 或 `GL_RGBA32F` 等格式的浮點數幀緩衝區，每個顏色通道會佔用 32 位元，這表示會使用 **4 倍的記憶體** 來儲存顏色資訊。由於 32 位元的精度通常並不必要（除非你真的需要非常高的精度），因此使用 `GL_RGBA16F` 就已經足夠了。

一旦幀緩衝區的 color buffer 採用浮點數格式，我們就可以安心地將場景渲染到這個幀緩衝區中，而不必擔心顏色值會被夾制在 `0.0` 到 `1.0` 的範圍內。在本章的範例中，我們先將一個已打光的場景渲染到浮點數幀緩衝區中，然後再把這個 color buffer 畫到一個覆蓋整個螢幕的四邊形（quad）上，整體流程如下所示：

```cpp
glBindFramebuffer(GL_FRAMEBUFFER, hdrFBO);
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    // [...] render (lit) scene
glBindFramebuffer(GL_FRAMEBUFFER, 0);

// now render hdr color buffer to 2D screen-filling quad with tone mapping shader
hdrShader.use();
glActiveTexture(GL_TEXTURE0);
glBindTexture(GL_TEXTURE_2D, hdrColorBufferTexture);
RenderQuad();
```

這裡，場景的顏色值會被寫入一個浮點數 color buffer（顏色緩衝區）中，而這個緩衝區可以包含任意顏色值，甚至可以超過 `1.0`。在本章的範例中，我們建立了一個簡單的展示場景：一個被拉長的大立方體模擬成一個隧道，並在其中放置了四個點光源，其中一個非常明亮的光源被放在隧道的盡頭。

```cpp
std::vector<glm::vec3> lightColors;
lightColors.push_back(glm::vec3(200.0f, 200.0f, 200.0f));
lightColors.push_back(glm::vec3(0.1f, 0.0f, 0.0f));
lightColors.push_back(glm::vec3(0.0f, 0.0f, 0.2f));
lightColors.push_back(glm::vec3(0.0f, 0.1f, 0.0f));
```

將場景渲染到浮點數幀緩衝區的方式，與一般渲染到幀緩衝區的方式其實是完全相同的。唯一不同的是，我們需要一個新的 fragment shader，這裡稱為 `hdrShader`，它會將浮點數 color buffer 的內容渲染到一個 2D 螢幕填滿的四邊形（quad）上。

我們先來定義一個簡單的 pass-through fragment shader（直通式片段著色器）：

```cpp
#version 330 core
out vec4 FragColor;

in vec2 TexCoords;

uniform sampler2D hdrBuffer;

void main()
{
    vec3 hdrColor = texture(hdrBuffer, TexCoords).rgb;
    FragColor = vec4(hdrColor, 1.0);
}
```

這裡我們直接對浮點數 color buffer 進行取樣，並將其顏色值作為 fragment shader 的輸出。然而，因為這個 2D 四邊形（quad）的輸出會被直接渲染到預設幀緩衝區中，而預設幀緩衝區只能儲存 `0.0` 到 `1.0` 之間的顏色值，所以無論浮點數 color texture 中有多少超過 `1.0` 的值，最終都會被強制截斷（clamp）到 `1.0`。

![](https://learnopengl.com/img/advanced-lighting/hdr_direct.png)

從圖中我們可以清楚看到，在隧道盡頭強烈的光線被截斷成一大片純白色區域，導致所有的光照細節都消失了。由於我們直接將 HDR 的數值寫入 LDR（低動態範圍）輸出緩衝區，結果就像根本沒開啟 HDR 一樣。

為了解決這個問題，我們需要在不丟失細節的情況下，將所有浮點數顏色值轉換回 `0.0` 到 `1.0` 的範圍。這個過程就叫做「色調映射（tone mapping）」。

## 色調映射（Tone Mapping）

色調映射是將浮點色彩值轉換到預期的 $`0.0`, `1.0`$ 範圍內（即低動態範圍，LDR）的過程，同時盡量不損失太多細節，且通常會搭配特定的風格化色彩平衡。

其中一種較簡單的色調映射演算法是「Reinhard 色調映射」，它是通過將整個 HDR 色彩值除以（加上）LDR 色彩值來完成。Reinhard 色調映射演算法能夠均勻地將所有亮度值平衡到 LDR 範圍內。我們將 Reinhard 色調映射加入之前的片段著色器中，並且為了效果更佳，同時加上 [伽瑪校正](/opengl/Advanced-Lighting/Gamma-Correction) 過濾（包括使用 sRGB 色彩空間的紋理）。

```cpp
void main()
{
    const float gamma = 2.2;
    vec3 hdrColor = texture(hdrBuffer, TexCoords).rgb;

    // reinhard tone mapping
    vec3 mapped = hdrColor / (hdrColor + vec3(1.0));
    // gamma correction
    mapped = pow(mapped, vec3(1.0 / gamma));

    FragColor = vec4(mapped, 1.0);
}
```

套用 Reinhard 色調映射後，我們在場景的亮部不會再失去任何細節。不過，它確實稍微偏向亮部，使得較暗的區域看起來細節較少、較不明顯：

![](https://learnopengl.com/img/advanced-lighting/hdr_reinhard.png)

你可以看到隧道盡頭的木質紋理細節再次清晰可見。透過這個相對簡單的色調映射演算法，我們能夠正確顯示儲存在浮點幀緩衝區中整個範圍的 HDR 值，讓我們在不失細節的前提下精確控制場景的光照效果。

{% include box.html content="
注意，我們也可以直接在光照著色器的最後階段進行色調映射，這樣就不必使用任何浮點幀緩衝區！不過隨著場景越來越複雜，經常會需要將中間的 HDR 結果儲存成浮點緩衝區，因此這是一個很好的練習。
" color="green" %}

色調映射的另一個有趣用法是允許使用曝光參數。你可能還記得在介紹中提到 HDR 圖像會在不同曝光下呈現許多可見的細節。如果我們的場景有日夜循環，那麼在白天使用較低曝光、晚上使用較高曝光是合理的，這與人眼的自動調節很相似。透過曝光參數，我們能在不同的光照條件下設定適合白天和夜晚的光照參數，只需改變曝光參數即可。

一個相對簡單的曝光色調映射演算法如下：

```cpp
uniform float exposure;

void main()
{
    const float gamma = 2.2;
    vec3 hdrColor = texture(hdrBuffer, TexCoords).rgb;

    // exposure tone mapping
    vec3 mapped = vec3(1.0) - exp(-hdrColor * exposure);
    // gamma correction
    mapped = pow(mapped, vec3(1.0 / gamma));

    FragColor = vec4(mapped, 1.0);
}
```

我們定義了一個 `exposure` uniform，預設值為 `1.0`，它讓我們能更精確地控制是否要更著重於 HDR 色彩值的暗部或亮部細節。舉例來說，曝光值高時，隧道的暗部細節會顯示得更明顯；相反地，曝光值低時，暗部細節會大幅減少，但亮部細節會更清晰。下方圖片展示了不同曝光值下的隧道效果：

![](https://learnopengl.com/img/advanced-lighting/hdr_exposure.png)

這張圖清楚地呈現了高動態範圍渲染的優勢。調整曝光值後，我們可以看到場景中大量原本低動態範圍渲染會遺失的細節。以隧道末端為例，正常曝光下木質結構幾乎看不見，但在低曝光時，細緻的木紋清晰可見。近處的木紋在高曝光時也會更加明顯。

你可以在這裡找到示範程式碼的原始碼：[連結](https://learnopengl.com/code_viewer_gh.php?code=src/5.advanced_lighting/6.hdr/hdr.cpp)。

### 更多關於 HDR

以上展示的兩種色調映射演算法只是眾多（較進階）演算法中的一小部分，每種都有其優缺點。有些色調映射演算法偏好某些顏色或強度，有些則能同時呈現低曝光與高曝光的色彩，創造出更豐富多彩且細節豐富的畫面。此外，還有一類稱為「自動曝光調整」或「眼睛適應」的技術，會根據上一幀畫面的亮度來（緩慢地）調整曝光參數，使場景的暗部變亮、亮部變暗，模擬人眼的自動適應功能。

HDR 渲染的真正價值在於處理複雜且光照豐富的場景。因為教學用的範例場景往往較簡單且缺少細節，所以本章的範例也較小規模。即便如此，它仍展示了 HDR 渲染的部分優勢：高亮及暗部細節不會遺失，能靠色調映射復原；多光源環境不會導致色彩被限制（clamped）；光源強度可以用真實亮度來設定，而不被低動態範圍限制。此外，HDR 渲染還讓其他有趣且更逼真的效果成為可能，其中之一是我們在下一章 \[Bloom\] 將討論的「輝光」效果。

## 補充資源

- [如果不使用輝光（bloom），HDR 渲染還有什麼好處嗎？](http://gamedev.stackexchange.com/questions/62836/does-hdr-rendering-have-any-benefits-if-bloom-wont-be-applied)：這是一個 Stack Exchange 問題，裡面有一個詳盡的答案，說明了 HDR 渲染的一些好處。
- [什麼是色調映射？它與 HDR 有什麼關係？](http://photo.stackexchange.com/questions/7630/what-is-tone-mapping-how-does-it-relate-to-hdr)：另一個有趣的回答，並附有很棒的參考圖片來解釋色調映射。
