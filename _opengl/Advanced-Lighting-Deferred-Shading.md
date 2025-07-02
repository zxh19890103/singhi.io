---
layout: bookdetail
chapter: 三十八
title: 高級光照 &bull; 延遲著色
category: tech
src: "https://learnopengl.com/Advanced-Lighting/Deferred-Shading"
date: 2025-07-02
math: 1
book: opengl
image: "https://learnopengl.com/img/advanced-lighting/deferred_example.png"
order: 38
lang: zh
glcate: Advanced-Lighting
gltopic: Deferred-Shading
permalink: /opengl/Advanced-Lighting/Deferred-Shading
---

我們目前使用的光照方法稱為「前向渲染」（forward rendering）或「前向著色」（forward shading）。這是一種直接的方法：我們對場景中的每個物體分別進行渲染，並根據所有光源為其計算光照。雖然這種方法易於理解和實現，但效能負擔較重，因為每個渲染的物體都要對每個光源對每個片元執行迭代，數量相當龐大！此外，在深度複雜度高（多個物體覆蓋同一像素）時，前向渲染也會浪費大量片元著色器的運算，因為片元輸出會被覆寫。

「延遲著色」（Deferred shading）或「延遲渲染」（deferred rendering）則試圖解決這些問題，並徹底改變渲染流程。它提供多種優化手段，可以讓我們在場景中高效處理大量光源，甚至能夠以可接受的幀率渲染數百或數千個光源。下圖是一個使用延遲著色渲染，擁有 1847 個點光源的場景（圖片來源：Hannes Nevalainen），這是在前向渲染下無法實現的。

![](https://learnopengl.com/img/advanced-lighting/deferred_example.png)

延遲著色的核心概念是將大部分昂貴的渲染工作（例如光照計算）「延遲」或「推遲」到後期進行。延遲著色分為兩個階段：第一階段稱為「幾何階段」（geometry pass），我們將場景渲染一次，並從物體中擷取各種幾何資訊，存入一組稱為「G-buffer」的多個紋理中；這些資訊包括位置向量、顏色向量、法線向量及鏡面反射值等。這些存於 G-buffer 中的幾何資訊，將用於後續較複雜的光照計算。下圖為單一幀的 G-buffer 內容示意：

![](https://learnopengl.com/img/advanced-lighting/deferred_g_buffer.png)

接著在第二階段，即「光照階段」（lighting pass），我們渲染一個覆蓋整個畫面的四邊形，並使用 G-buffer 中儲存的幾何資訊，為每個片元計算場景光照；即逐像素地遍歷 G-buffer。這樣，我們不必將每個物體的資料從頂點著色器一路傳到片元著色器，而是將複雜的片元運算後置。光照計算方式相同，但此時所需的輸入變數來自相應的 G-buffer 紋理，而非頂點著色器（加上一些 uniform 變數）。

下圖清楚展示了延遲著色的流程：

![](https://learnopengl.com/img/advanced-lighting/deferred_overview.png)

這種方法的一大優點是，G-buffer 中留下的每個片元資訊即為最後在畫面上的像素資訊，深度測試已確保它是最頂層可見的片元。因此，在光照階段，我們只需為每個像素計算一次光照。此外，延遲渲染使得處理更多光源成為可能，遠超前向渲染的能力。

不過它也有一些缺點，例如 G-buffer 需要較大量的場景數據存入紋理緩衝，佔用較多記憶體，特別是像位置向量這類需要高精度的資料。另一個缺點是它不支援混合（blending），因為只保存了最上層的片元資訊，且多重採樣抗鋸齒（MSAA）也不再適用。這些問題有一些替代方案，我們會在本章末尾探討。

填充 G-buffer（幾何階段）成本不高，因為我們直接將物體資訊如位置、顏色、法線等存入幀緩衝，處理量少甚至幾乎沒有。透過「多重渲染目標」（multiple render targets, MRT）技術，我們甚至可以在一次渲染通過中同時完成所有這些資料的寫入。

## G 緩衝區（G-buffer）

「G-buffer」是用來儲存與光照相關資料的所有紋理（textures）的總稱，這些資料會在最終的光照階段中被使用。我們先來回顧一下在前向渲染中，要對一個片元進行光照計算所需要的資料：

- 一個三維的世界空間 **位置向量**（position vector），用於計算 `lightDir`（光源方向）與 `viewDir`（視角方向）；
- 一個 RGB 的漫反射 **顏色向量**，也叫作 `albedo`；
- 一個三維的 **法線向量**（normal vector），用來判斷表面的傾斜程度；
- 一個 **鏡面反射強度**（specular intensity）的浮點數；
- 所有光源的位置與顏色向量；
- 玩家或觀察者的位置向量。

有了這些（針對每個片元的）資料後，我們就能計算出熟悉的（Blinn-）Phong 光照模型。當中，光源的位置與顏色、玩家的視角位置等可以透過 uniform 變數配置；但其餘變數（位置、顏色、法線、鏡面強度）都是每個片元所特有的。

如果我們能將這些片元資料儲存在某個地方，在延遲光照階段重新讀取，就能夠對每個片元（即使是在一張 2D 全畫面四邊形上）進行和前向渲染一樣的光照計算。

由於 OpenGL 對於一個紋理中能存什麼資料沒有限制，我們自然可以把所有的 per-fragment 資訊儲存在一張或多張 G-buffer 紋理中，並在之後的光照階段使用。因為 G-buffer 的紋理大小與我們用來進行光照階段渲染的 2D 四邊形大小一致，所以每個片元資料都能一對一地對應。也就是說，我們獲得了和前向渲染中一模一樣的資料，但這次是在延遲渲染的光照階段取得。

整個流程的偽代碼大致如下所示：

```cpp
while(...) // render loop
{
    // 1. geometry pass: render all geometric/color data to g-buffer
    glBindFramebuffer(GL_FRAMEBUFFER, gBuffer);
    glClearColor(0.0, 0.0, 0.0, 1.0); // keep it black so it doesn't leak into g-buffer
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    gBufferShader.use();
    for(Object obj : Objects)
    {
        ConfigureShaderTransformsAndUniforms();
        obj.Draw();
    }
    // 2. lighting pass: use g-buffer to calculate the scene's lighting
    glBindFramebuffer(GL_FRAMEBUFFER, 0);
    lightingPassShader.use();
    BindAllGBufferTextures();
    SetLightingUniforms();
    RenderQuad();
}
```

我們需要為每個片元儲存的資料包括：**位置向量**、**法線向量**、**顏色向量**，以及一個 **鏡面反射強度值**。在 geometry pass（幾何階段）中，我們要將場景中所有物件繪製出來，並將這些資料寫入 G-buffer。這裡我們同樣可以使用 `multiple render targets`（多重渲染目標），在單次渲染過程中輸出到多個顏色緩衝區；這在之前的 [Bloom](https://learnopengl.com/Advanced-Lighting/Bloom) 章節中有簡略提及。

在 geometry pass 中，我們需要初始化一個 framebuffer 物件，命名為 `gBuffer`，它要附加多個顏色緩衝紋理，以及一個深度 renderbuffer。對於儲存位置與法線的紋理，我們最好使用高精度格式（每個分量為 16 或 32 位元的浮點數），以確保足夠的精度。而對於 `albedo`（表面色）與鏡面反射值（specular intensity），使用預設的 8 位元精度就足夠了。

另外請注意，我們在這裡選擇使用 `GL_RGBA16F` 而非 `GL_RGB16F`，因為 GPU 通常偏好四分量（4-component）的格式，這有利於記憶體位元對齊（byte alignment）；否則在某些驅動下 framebuffer 可能無法正確建立。

```cpp
unsigned int gBuffer;
glGenFramebuffers(1, &gBuffer);
glBindFramebuffer(GL_FRAMEBUFFER, gBuffer);
unsigned int gPosition, gNormal, gColorSpec;

// - position color buffer
glGenTextures(1, &gPosition);
glBindTexture(GL_TEXTURE_2D, gPosition);
glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA16F, SCR_WIDTH, SCR_HEIGHT, 0, GL_RGBA, GL_FLOAT, NULL);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, gPosition, 0);

// - normal color buffer
glGenTextures(1, &gNormal);
glBindTexture(GL_TEXTURE_2D, gNormal);
glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA16F, SCR_WIDTH, SCR_HEIGHT, 0, GL_RGBA, GL_FLOAT, NULL);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT1, GL_TEXTURE_2D, gNormal, 0);

// - color + specular color buffer
glGenTextures(1, &gAlbedoSpec);
glBindTexture(GL_TEXTURE_2D, gAlbedoSpec);
glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, SCR_WIDTH, SCR_HEIGHT, 0, GL_RGBA, GL_UNSIGNED_BYTE, NULL);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT2, GL_TEXTURE_2D, gAlbedoSpec, 0);

// - tell OpenGL which color attachments we'll use (of this framebuffer) for rendering
unsigned int attachments[3] = { GL_COLOR_ATTACHMENT0, GL_COLOR_ATTACHMENT1, GL_COLOR_ATTACHMENT2 };
glDrawBuffers(3, attachments);

// then also add render buffer object as depth buffer and check for completeness.
[...]
```

由於我們使用了「多重渲染目標（multiple render targets）」，我們必須明確地告訴 OpenGL，當前要把片元輸出寫入 `GBuffer` 中的哪些顏色緩衝區，這需要透過 `glDrawBuffers` 指定。

這裡還有一個有趣的技巧值得注意：我們把「顏色資訊」和「鏡面反射強度」整合到一張 `RGBA` 紋理中。這樣就可以省去額外再建立一個顏色緩衝紋理的需求。當你的延遲渲染流程變得越來越複雜、需要儲存更多類型的資料時，你會發現類似這樣「資料打包」的方法非常有幫助，能減少記憶體使用與渲染開銷。

接下來我們要將資料寫入 G-buffer。假設每個物件都擁有一張漫反射（diffuse）、法線（normal）、以及鏡面（specular）紋理，我們可以使用以下這樣的 fragment shader 來把這些資訊寫入 G-buffer：

```cpp
#version 330 core
layout (location = 0) out vec3 gPosition;
layout (location = 1) out vec3 gNormal;
layout (location = 2) out vec4 gAlbedoSpec;

in vec2 TexCoords;
in vec3 FragPos;
in vec3 Normal;

uniform sampler2D texture_diffuse1;
uniform sampler2D texture_specular1;

void main()
{
    // store the fragment position vector in the first gbuffer texture
    gPosition = FragPos;
    // also store the per-fragment normals into the gbuffer
    gNormal = normalize(Normal);
    // and the diffuse per-fragment color
    gAlbedoSpec.rgb = texture(texture_diffuse1, TexCoords).rgb;
    // store specular intensity in gAlbedoSpec's alpha component
    gAlbedoSpec.a = texture(texture_specular1, TexCoords).r;
}
```

由於我們使用了多重渲染目標（Multiple Render Targets, MRT），`layout` 說明符會告訴 OpenGL 要把輸出寫入目前綁定的 framebuffer 的哪一個顏色緩衝區。請注意，我們並沒有將鏡面反射強度（specular intensity）單獨儲存在一張 color buffer 紋理中，因為它只是一個單一的浮點值（float），我們可以直接把它存在其他 color buffer 紋理的 alpha 分量裡。

{% include box.html content="
請牢記，在進行光照計算時，將所有相關變數維持在**相同的座標空間**中是極其重要的。在這裡，我們儲存（並計算）的所有變數都在世界座標（world-space）中。
" color="red" %}

假設現在我們將大量的背包模型渲染進 `gBuffer` framebuffer 中，並且將每一張 color buffer 紋理單獨投影到一個覆蓋整個螢幕的四邊形上進行可視化，就會看到如下這樣的畫面：

![](https://learnopengl.com/img/advanced-lighting/deferred_g_buffer.png)

試著觀察這些世界座標中的 position 與 normal 向量是否正確。比如說，朝向右方的法線向量，在畫面中應該會偏紅；而從場景原點往右延伸的 position 向量，也會顯示成較紅的顏色。一旦你對 G-buffer 的內容確認無誤，就可以進入下一階段：
**Lighting Pass（光照階段）**。

## 延遲光照階段（Deferred Lighting Pass）

現在我們已經擁有了儲存在 G-buffer 中大量的片段資料，就能開始完整地計算整個場景最終的光照顏色了。這個過程是逐像素（pixel by pixel）遍歷所有 G-buffer 紋理，並將其內容作為光照算法的輸入。由於 G-buffer 中的資料都是已經轉換完成的片段資訊，因此每個像素只需執行一次昂貴的光照運算。這在複雜的場景中特別有用，否則在前向渲染中，我們可能會對每個像素執行多次代價高昂的 fragment shader。

在這個光照階段中，我們會渲染一個覆蓋整個畫面的 2D 四邊形（有點類似後處理效果），並在每個像素上執行計算密集的光照 fragment shader：

```cpp
glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
glActiveTexture(GL_TEXTURE0);
glBindTexture(GL_TEXTURE_2D, gPosition);
glActiveTexture(GL_TEXTURE1);
glBindTexture(GL_TEXTURE_2D, gNormal);
glActiveTexture(GL_TEXTURE2);
glBindTexture(GL_TEXTURE_2D, gAlbedoSpec);
// also send light relevant uniforms
shaderLightingPass.use();
SendAllLightUniformsToShader(shaderLightingPass);
shaderLightingPass.setVec3("viewPos", camera.Position);
RenderQuad();
```

我們在開始渲染前，會先綁定 G-buffer 中所有相關的紋理，並傳入光照所需的 uniform 變數給 shader。

Lighting Pass 的 fragment shader 基本上和之前光照章節中使用的 shader 類似。不同的是：
這次我們不再從頂點 shader 或物件本身取得輸入，而是**直接從 G-buffer 中取樣所需的光照輸入變數**，例如位置、法線、材質色等。這種做法使我們可以只對每個螢幕像素進行一次光照計算，大幅提升效率。

```cpp
#version 330 core
out vec4 FragColor;

in vec2 TexCoords;

uniform sampler2D gPosition;
uniform sampler2D gNormal;
uniform sampler2D gAlbedoSpec;

struct Light {
    vec3 Position;
    vec3 Color;
};
const int NR_LIGHTS = 32;
uniform Light lights[NR_LIGHTS];
uniform vec3 viewPos;

void main()
{
    // retrieve data from G-buffer
    vec3 FragPos = texture(gPosition, TexCoords).rgb;
    vec3 Normal = texture(gNormal, TexCoords).rgb;
    vec3 Albedo = texture(gAlbedoSpec, TexCoords).rgb;
    float Specular = texture(gAlbedoSpec, TexCoords).a;

    // then calculate lighting as usual
    vec3 lighting = Albedo * 0.1; // hard-coded ambient component
    vec3 viewDir = normalize(viewPos - FragPos);
    for(int i = 0; i < NR_LIGHTS; ++i)
    {
        // diffuse
        vec3 lightDir = normalize(lights[i].Position - FragPos);
        vec3 diffuse = max(dot(Normal, lightDir), 0.0) * Albedo * lights[i].Color;
        lighting += diffuse;
    }

    FragColor = vec4(lighting, 1.0);
}
```

光照階段的著色器接收三個 uniform 紋理，代表 G-buffer，包含了我們在幾何階段存儲的所有資料。如果用當前片段的紋理坐標去取樣，我們將獲得與直接渲染幾何體完全相同的片段值。注意，我們從單一的 `gAlbedoSpec` 紋理中同時取得了 `Albedo` 色彩和 `Specular` 強度。

由於我們現在擁有計算 Blinn-Phong 光照所需的每片段變數（以及相關的 uniform 變數），因此不需要對光照代碼做任何修改。在延遲渲染中，我們唯一改變的是獲取光照輸入變數的方法。

執行一個簡單的示範，使用總共 `32` 個小光源，效果如下：

![](https://learnopengl.com/img/advanced-lighting/deferred_shading.png)

延遲渲染的一個缺點是無法執行[混合](https://learnopengl.com/Advanced-OpenGL/Blending)，因為 G-buffer 中的所有值都來自單一片段，而混合則是多個片段組合的操作。另一個缺點是延遲渲染通常迫使你對場景的大部分光照使用相同的光照算法；不過可以透過在 G-buffer 中包含更多材質特定資料稍微緩解此問題。

為了解決這些缺點（尤其是混合問題），我們通常將渲染器拆分成兩部分：一部分是延遲渲染，用於大部分場景渲染；另一部分是前向渲染，專門用於混合或不適合延遲渲染管線的特殊著色器效果。為了說明其運作，我們將使用前向渲染器將光源渲染為小立方體，因為光源立方體需要一個特殊著色器（簡單輸出單一光源顏色）。

## 結合延遲渲染與前向渲染

假設我們想將每個光源渲染成一個 3D 立方體，位置在光源位置並發出光源的顏色。一個直覺的想法是，在延遲渲染流程結束後，將所有光源以前向渲染的方式渲染到延遲光照的屏幕四邊形上。基本上就是照常渲染立方體，但要放在延遲渲染操作完成之後。

程式碼大致會是這樣：

```cpp
// deferred lighting pass
[...]
RenderQuad();

// now render all light cubes with forward rendering as we'd normally do
shaderLightBox.use();
shaderLightBox.setMat4("projection", projection);
shaderLightBox.setMat4("view", view);
for (unsigned int i = 0; i < lightPositions.size(); i++)
{
    model = glm::mat4(1.0f);
    model = glm::translate(model, lightPositions[i]);
    model = glm::scale(model, glm::vec3(0.25f));
    shaderLightBox.setMat4("model", model);
    shaderLightBox.setVec3("lightColor", lightColors[i]);
    RenderCube();
}
```

然而，這些被渲染的立方體並沒有考慮延遲渲染器中儲存的幾何深度資訊，因此它們總是會被渲染在之前物體的上方；這並不是我們想要的結果。

![](https://learnopengl.com/img/advanced-lighting/deferred_lights_no_depth.png)

我們需要先將幾何階段儲存的深度資訊複製到預設幀緩衝的深度緩衝中，然後再渲染光源立方體。這樣，只有當光源立方體的片段位於之前渲染的幾何體之上時，才會被渲染。

我們可以使用 `glBlitFramebuffer` 函數將一個幀緩衝的內容複製到另一個幀緩衝。這個函數也曾在[抗鋸齒](https://learnopengl.com/Advanced-OpenGL/Anti-Aliasing)章節中用於解決多重採樣幀緩衝。`glBlitFramebuffer` 允許我們指定來源幀緩衝和目標幀緩衝的區域進行拷貝。

我們在延遲幾何階段將所有物體的深度資訊存入 `gBuffer` FBO。如果我們把它的深度緩衝內容複製到預設幀緩衝的深度緩衝，光源立方體就會像在前向渲染中一樣，正確地依照場景幾何體的深度關係渲染。正如抗鋸齒章節所述，我們必須指定一個幀緩衝作為讀取幀緩衝，同時指定另一個幀緩衝作為寫入幀緩衝：

```cpp
glBindFramebuffer(GL_READ_FRAMEBUFFER, gBuffer);
glBindFramebuffer(GL_DRAW_FRAMEBUFFER, 0); // write to default framebuffer
glBlitFramebuffer(
  0, 0, SCR_WIDTH, SCR_HEIGHT, 0, 0, SCR_WIDTH, SCR_HEIGHT, GL_DEPTH_BUFFER_BIT, GL_NEAREST
);
glBindFramebuffer(GL_FRAMEBUFFER, 0);
// now render light cubes as before
[...]
```

我們將整個讀取幀緩衝（read framebuffer）的深度緩衝內容複製到預設幀緩衝（default framebuffer）的深度緩衝；類似的操作也可以用於顏色緩衝和模板緩衝。然後當我們渲染光源立方體時，這些立方體就能正確地覆蓋在場景幾何體之上：

![](https://learnopengl.com/img/advanced-lighting/deferred_lights_depth.png)

你可以在這裡找到完整的範例原始碼：[demo source code](https://learnopengl.com/code_viewer_gh.php?code=src/5.advanced_lighting/8.1.deferred_shading/deferred_shading.cpp)。

透過這種方式，我們能輕鬆地將延遲著色（deferred shading）和前向著色（forward shading）結合使用。這非常棒，因為我們仍然可以應用混合（blending）並渲染需要特殊著色器效果的物件，這在純粹的延遲渲染環境中是無法做到的。

## 大量光源

延遲渲染常被讚譽的原因之一，是它能在不大幅犧牲效能的情況下，渲染大量的光源。單純的延遲渲染本身並不能有效處理非常多的光源，因為仍然需要針對場景中每個光源計算每個片段的光照貢獻。讓大量光源變得可行的關鍵，是我們可以在延遲渲染管線中應用的一項巧妙優化技術：`光體積`（light volumes）。

通常在渲染一個光源眾多的場景時，我們會計算場景中**每一個**光源對每個片段的影響，不論它們與片段的距離遠近。但事實上，大部分光源的光線不會照射到該片段，為何還要浪費資源去計算這些光照？

光體積的概念就是先計算光源的半徑或範圍，也就是光線能影響到的區域。因為大多數光源都會使用某種形式的衰減（attenuation），我們可以利用這個衰減函數來求出光線影響的最大距離或半徑。接著，只有當片段位於一個或多個光體積內時，才進行耗費較大的光照計算。這樣就能大幅減少不必要的計算量，僅在真正需要的地方進行光照運算。

這個方法的關鍵是如何計算光源的光體積大小或半徑。

### 計算光源的體積或半徑

為了取得光源的半徑，我們必須解衰減方程，找出光線貢獻降到 `0.0`（或接近零）的距離。這裡使用的衰減函數是[光源投射](https://learnopengl.com/Lighting/Light-casters)章節介紹的函數：

\\\[F\_{light} = \\frac{I}{K_c + K_l \* d + K_q \* d^2}\\\]

我們想解這個方程，使得 \\(F\_{light}\\) 等於 `0.0`，但實際上這個方程式永遠不會精確等於 `0.0`，因此沒有精確解。不過，我們可以改成求解一個接近 `0.0`，但仍被視為暗的亮度值。在本章範例中，亮度值取 \\(5/256\\) 是可接受的；這裡除以 256 是因為預設的 8-bit 幀緩衝每個色彩通道只能顯示 256 級強度。

{% include box.html content="

使用的衰減函數在其可見範圍內大多保持較暗。如果我們將亮度限制得比 \\(5/256\\) 還暗，光體積就會變得過大，反而降低效率。只要使用者看不出光源在體積邊界處突然消失，我們就沒問題。當然，這也取決於場景類型；較高的亮度閾值會導致較小的光體積，效率更佳，但可能會產生明顯的假象，使得光照在體積邊界處看起來斷裂。

" color="green" %}

我們要解的衰減方程變成：

$$
\frac{5}{256} = \frac{I_{\max}}{\text{Attenuation}}
$$

這裡的 $I_{\max}$ 是光源中最亮的顏色分量。我們用光源最亮的顏色分量來求解，因為以光的最亮強度值來解方程，最能反映理想的光體積半徑。

接下來，我們繼續解這個方程：

\\\[\\frac{5}{256} \* Attenuation = I\_{max} \\\]

\\\[5 \* Attenuation = I\_{max} \* 256 \\\]

\\\[Attenuation = I\_{max} \* \\frac{256}{5} \\\]

\\\[K_c + K_l \* d + K_q \* d^2 = I\_{max} \* \\frac{256}{5} \\\]

\\\[K_q \* d^2 + K_l \* d + K_c - I\_{max} \* \\frac{256}{5} = 0 \\\]

最後的方程式是形如 \\(ax^2 + bx + c = 0\\) 的方程，我們可以使用二次方程式來求解：

\\\[x = \frac{-K_l + \sqrt{K_l^2 - 4 \times K_q \times (K_c - I\_{\text{max}} \times \frac{256}{5})}}{2 \times K_q}\\]

這給出了通用的方程式，使我們能夠計算 \\(x\\)，即給定常數項、一次項和二次項參數後光源的光照範圍半徑。

```cpp
float constant  = 1.0;
float linear    = 0.7;
float quadratic = 1.8;
float lightMax  = std::fmaxf(std::fmaxf(lightColor.r, lightColor.g), lightColor.b);
float radius    =
  (-linear +  std::sqrtf(linear * linear - 4 * quadratic * (constant - (256.0 / 5.0) * lightMax)))
  / (2 * quadratic);
```

我們為場景中的每個光源計算這個半徑，並且只在片段位於該光源的光照範圍內時計算該光源的光照。以下是考慮光照範圍的更新版光照通道片段著色器。請注意，這種方法僅用於教學目的，並不適合實際應用，稍後我們會進一步說明：

```cpp
struct Light {
    [...]
    float Radius;
};

void main()
{
    [...]
    for(int i = 0; i < NR_LIGHTS; ++i)
    {
        // calculate distance between light source and current fragment
        float distance = length(lights[i].Position - FragPos);
        if(distance < lights[i].Radius)
        {
            // do expensive lighting
            [...]
        }
    }
}
```

結果與之前完全相同，但這次每個光源只對其光照範圍內的片段計算光照。

你可以在這裡找到該示範的最終原始碼：[點此查看](https://learnopengl.com/code_viewer_gh.php?code=src/5.advanced_lighting/8.2.deferred_shading_volumes/deferred_shading_volumes.cpp)。

### 我們真正使用光體積的方式

上面展示的片段著色器在實際應用中並不奏效，它只是用來說明我們**大致上**如何利用光體積來減少光照計算。事實上，你的 GPU 和 GLSL 在優化迴圈和分支方面表現不佳。原因是 GPU 上的著色器執行高度平行，大部分架構要求大量執行緒必須執行**完全相同的著色器代碼**以確保效率。這通常導致著色器會執行 `if` 條件語句中的**所有分支**，確保該組執行緒的著色器行為一致，因此之前提到的「半徑檢查」優化完全沒用；我們仍然會對所有光源計算光照！

正確使用光體積的方法是繪製實際的球體，這些球體根據光體積半徑進行縮放。球心位置在光源位置，而球體大小剛好包覆光源的可見範圍。關鍵在於：我們用延遲光照著色器來渲染這些球體。渲染出的球體會觸發的片段著色器調用剛好匹配光源影響的像素，因此我們只處理相關像素，跳過其他像素。下面的圖片說明了這一點：

![](https://learnopengl.com/img/advanced-lighting/deferred_light_volume_rendered.png)

對場景中每個光源都做這樣處理，並將結果以加法混合疊加，最終場景看起來與之前相同，但這次只渲染每個光源影響的相關片段。這有效將計算量從 `物件數量 * 光源數量` 降為 `物件數量 + 光源數量`，在光源數量多的場景中特別高效。這也是為什麼延遲渲染非常適合大量光源渲染。

這方法仍有問題：必須啟用面剔除（否則光源影響會被渲染兩次），但啟用面剔除後，使用者若進入光體積內部，該體積因背面剔除不再被渲染，導致光源影響消失；解決方法是只渲染球體的背面。

渲染光體積會耗費效能，雖然一般來說比普通延遲渲染處理大量光源更快，但仍有進一步優化空間。兩個熱門且更有效率的延遲渲染擴展叫做 `deferred lighting` 和 `tile-based deferred shading`，它們對大量光源更有效率，且能較有效支援 MSAA。

## 延遲渲染 vs 前向渲染

延遲渲染本身（不含光體積）是一種不錯的優化，因為每個像素只執行一次片段著色器，而前向渲染則往往多次執行每像素的片段著色器。延遲渲染也有缺點：大量記憶體需求、不支援 MSAA，以及混合效果仍需用前向渲染來實現。

當場景小、光源少時，延遲渲染不一定較快，有時反而較慢，因為額外開銷超過效益。在複雜場景中，延遲渲染很快成為重要優化，尤其搭配更先進的優化擴展。此外，一些效果（特別是後製特效）在延遲渲染管線中會較便宜，因為許多場景輸入已經存在 G-buffer 中。

最後想提的是，幾乎所有前向渲染能做的效果都能在延遲渲染環境中實現，通常只要稍作改變即可。例如若想在延遲渲染中用法線貼圖，只要改幾何通道（geometry pass）著色器輸出從法線貼圖取出的世界空間法線（用 TBN 矩陣轉換），而非表面法線；而光照計算（lighting pass）不用變。若想用視差貼圖，則需先在幾何通道變更紋理座標，再取樣漫反射、高光、法線貼圖。理解延遲渲染的原理後，創意發揮起來並不難。

## 補充資源

- [Tutorial 35: Deferred Shading - Part 1](http://ogldev.atspace.co.uk/www/tutorial35/tutorial35.html)：由 OGLDev 提供的三部分延遲著色教學。
- [Deferred Rendering for Current and Future Rendering Pipelines](https://software.intel.com/sites/default/files/m/d/4/1/d/8/lauritzen_deferred_shading_siggraph_2010.pdf)：Andrew Lauritzen 的簡報，討論高階的基於平鋪（tile-based）的延遲著色與延遲光照技術。
