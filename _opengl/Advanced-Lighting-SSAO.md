---
layout: bookdetail
chapter: 三十九
title: 高級光照 &bull; SSAO
category: tech
src: "https://learnopengl.com/Advanced-Lighting/SSAO"
date: 2025-07-02
math: 1
book: opengl
image: "https://learnopengl.com/img/advanced-lighting/ssao_example.png"
order: 39
lang: zh
glcate: Advanced-Lighting
gltopic: SSAO
permalink: /opengl/Advanced-Lighting/SSAO
---

我們在基礎光照章節中曾簡單提到過一個主題：環境光（ambient lighting）。環境光是一種固定的光照常數，我們將它加到場景的整體光照中，用以模擬光線的「散射」效果。現實中，光線會以各種方向、不同強度散射，因此場景中間接受光照的部分強度也會有所不同。其中一種間接光照的近似方法叫做「環境光遮蔽」（ambient occlusion），它試圖透過使折痕、孔洞以及彼此靠近的表面變暗來模擬間接光照。這些區域因為被周圍幾何體大部分遮擋，光線逃逸的路徑較少，因此看起來較暗。你可以觀察一下房間的角落和折痕，那裡的光線通常會稍微暗一些。

下方是同一場景在有與沒有環境光遮蔽的比較圖片。可以注意到特別是在折痕之間，（環境）光線被更多遮蔽：

![](https://learnopengl.com/img/advanced-lighting/ssao_example.png)

雖然這種效果不是特別明顯，但啟用環境光遮蔽後的圖片，因為這些細微的遮蔽細節，整個場景會感覺更加真實且具有深度感。

環境光遮蔽技術比較耗費計算資源，因為它必須考慮周圍的幾何結構。理論上，可以對空間中每個點發射大量光線來判定遮蔽程度，但這很快就會變成無法用於即時運算的龐大負擔。2007 年，Crytek 發表了一種稱為「螢幕空間環境光遮蔽」（Screen-Space Ambient Occlusion, SSAO）的技術，用於他們的遊戲《Crysis》中。此方法利用螢幕空間的深度緩衝區（depth buffer）來判斷遮蔽程度，而非真實的幾何資料。這種做法比傳統環境光遮蔽快很多，且效果合理，因此成為了即時環境光遮蔽的事實標準。

螢幕空間環境光遮蔽的基本原理很簡單：對螢幕上每個填滿的片段（fragment），根據片段周圍的深度值計算一個「遮蔽因子」（occlusion factor）。這個遮蔽因子用來減少或抵消該片段的環境光成分。取得遮蔽因子的方法是，在片段位置周圍以球形範圍內取多個深度樣本，並將這些樣本與當前片段的深度值比較。樣本中深度值比該片段深的數量即代表遮蔽程度。

![](https://learnopengl.com/img/advanced-lighting/ssao_crysis_circle.png)

灰色深度樣本中，位於幾何體內的點會對總遮蔽因子產生貢獻；越多樣本落在幾何體內，該片段最終應接受的環境光就越少。

顯然，效果的品質和精度與採樣點數量密切相關。若採樣數太少，精度大幅下降，會產生一種稱為「階梯紋」（banding）的假象；若採樣數太多，則會損失效能。我們可以透過在採樣核中加入隨機性，降低所需測試的樣本數。對每個片段隨機旋轉採樣核，可以用更少的樣本數得到高品質結果。但這樣會引入明顯的「噪點模式」（noise pattern），必須透過模糊處理來修正。以下圖片（出自 John Chapman）展示了階梯紋效應和隨機性對結果的影響：

![](https://learnopengl.com/img/advanced-lighting/ssao_banding_noise.jpg)

如你所見，雖然因採樣數低而造成明顯的階梯紋，但加入隨機性後，階梯紋幾乎完全消失。

Crytek 開發的 SSAO 方法有其特定的視覺風格。由於採樣核是球形的，導致平坦的牆面看起來呈灰色，因為一半的採樣點落入了周圍幾何體中。下圖為《Crysis》中螢幕空間環境光遮蔽，明顯展現了這種灰暗感：

![](https://learnopengl.com/img/advanced-lighting/ssao_crysis.jpg)

因此，我們不會使用球形採樣核，而會使用沿著表面法線方向的半球形採樣核。

![](https://learnopengl.com/img/advanced-lighting/ssao_hemisphere.png)

透過在這個「法線導向半球」周圍取樣，我們不會將片段下方的幾何體納入遮蔽因子，這樣可去除環境光遮蔽的灰暗感，並且一般會產生更真實的效果。本章所使用的技術即基於這種法線導向半球方法，以及 John Chapman 精彩的[SSAO 教學](http://john-chapman-graphics.blogspot.nl/2013/01/ssao-tutorial.html)的稍微修改版本。

## 取樣緩衝區（Sample buffers）

SSAO 需要幾何資訊，因為我們必須有辦法判斷片段（fragment）的遮蔽因子。對於每個片段，我們需要以下資料：

- 每個片段的 **位置向量**（position vector）。
- 每個片段的 **法線向量**（normal vector）。
- 每個片段的 **反照率顏色**（albedo color）。
- 一組 **取樣核**（sample kernel）。
- 每個片段的 **隨機旋轉向量**，用於旋轉取樣核。

利用每個片段在視景空間（view-space）中的位置，我們可以沿著該片段在視景空間的表面法線定向一個半球形取樣核，並用這個取樣核以不同偏移量取樣位置緩衝區貼圖。對每個片段的取樣核樣本，我們將其深度與位置緩衝區中對應的深度值比較，以判斷遮蔽程度。計算出的遮蔽因子用來限制最終的環境光照成分。另外透過加入每片段的旋轉向量，我們可以大幅減少需要測試的樣本數，稍後你會看到這點。

![](https://learnopengl.com/img/advanced-lighting/ssao_overview.png)

由於 SSAO 是螢幕空間技術，我們在一個填滿螢幕的 2D 四邊形（quad）上，對每個片段計算其遮蔽效果。這代表我們並沒有場景的幾何資訊。我們能做的是把每個片段的幾何資料渲染到螢幕空間的貼圖中，之後傳送給 SSAO 著色器使用，這樣就能存取每片段的幾何資料。如果你跟著前一章節的教學，你會發現這跟延遲渲染（deferred rendering）中的 G-buffer 配置非常相似。因此，SSAO 非常適合搭配延遲渲染一起使用，因為 G-buffer 已經包含了位置和法線向量。

{% include box.html content="
本章將基於稍微簡化版的延遲渲染器（參考[延遲光照](/opengl/Advanced-Lighting/Deferred-Shading)章節）來實作 SSAO。如果你不太清楚什麼是延遲光照，建議先閱讀相關章節。
" color="green" %}

由於場景物件的每個片段位置和法線資料都可取得，幾何階段的片段著色器相對簡單：

```cpp
#version 330 core
layout (location = 0) out vec4 gPosition;
layout (location = 1) out vec3 gNormal;
layout (location = 2) out vec4 gAlbedoSpec;

in vec2 TexCoords;
in vec3 FragPos;
in vec3 Normal;

void main()
{
    // store the fragment position vector in the first gbuffer texture
    gPosition = FragPos;
    // also store the per-fragment normals into the gbuffer
    gNormal = normalize(Normal);
    // and the diffuse per-fragment color, ignore specular
    gAlbedoSpec.rgb = vec3(0.95);
}
```

由於 SSAO 是一種螢幕空間技術，遮蔽的計算是基於可見視角的景象，因此將演算法實現在視景空間（view-space）是合理的。因此，幾何階段頂點著色器所輸出的 `FragPos`（片段位置）和 `Normal`（法線）會先轉換到視景空間（同時乘以視圖矩陣）。

{% include box.html content="
其實也可以只用深度值，透過一些巧妙的技巧來重建位置向量，正如 Matt Pettineo 在他的[部落格](https://mynameismjp.wordpress.com/2010/09/05/position-from-depth-3/)所描述的。這需要在著色器中額外做一些計算，但可以省去在 G-buffer 中存儲位置資料的需求（節省大量記憶體）。為了保持範例的簡單性，我們在本章中不會使用這種優化。
" color="green" %}

`gPosition` 色彩緩衝貼圖的設定如下：

```cpp
glGenTextures(1, &gPosition);
glBindTexture(GL_TEXTURE_2D, gPosition);
glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA16F, SCR_WIDTH, SCR_HEIGHT, 0, GL_RGBA, GL_FLOAT, NULL);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
```

這樣我們就有了一張位置貼圖，可以用來取得每個取樣核樣本的深度值。請注意，我們將位置存成浮點數格式，這樣位置值不會被限制在 $`0.0`,`1.0`$ 範圍內，而是保持較高的精度。另外也要注意貼圖的包裹方式設定為 `GL_CLAMP_TO_EDGE`，這可以避免我們在螢幕空間中取樣時，不小心取到超出貼圖座標區域外的位置或深度值。

接下來，我們需要實際的半球取樣核以及一種方法，能讓它隨機旋轉。

## 法線導向的半球 (Normal-oriented hemisphere)

我們需要產生一組取樣點，這些點沿著表面的法線方向排列。正如本章開始時簡單提過的，我們希望生成形成半球形狀的取樣點。由於為每個表面法線方向生成取樣核既困難又不切實際，我們將在[切線空間](/opengl/Advanced-Lighting/Normal-Mapping)中生成取樣核，並假設法線向量指向正的 z 軸方向。

![](https://learnopengl.com/img/advanced-lighting/ssao_hemisphere.png)

假設我們有一個單位半球，最大可取得 `64` 個取樣點的取樣核，方法如下：

```cpp
std::uniform_real_distribution<float> randomFloats(0.0, 1.0); // random floats between [0.0, 1.0]
std::default_random_engine generator;
std::vector<glm::vec3> ssaoKernel;
for (unsigned int i = 0; i < 64; ++i)
{
    glm::vec3 sample(
        randomFloats(generator) * 2.0 - 1.0,
        randomFloats(generator) * 2.0 - 1.0,
        randomFloats(generator)
    );
    sample  = glm::normalize(sample);
    sample *= randomFloats(generator);
    ssaoKernel.push_back(sample);
}
```

我們在切線空間中將 `x` 和 `y` 方向的取樣點範圍設定在 `-1.0` 到 `1.0` 之間，而 `z` 方向的取樣點則限制在 `0.0` 到 `1.0` 之間（如果 `z` 方向也從 `-1.0` 到 `1.0`，那麼取樣核將是球形的）。由於取樣核會沿著表面法線定向，因此取樣向量最終都會落在半球內。

目前，所有取樣點在取樣核中是隨機分布的，但我們希望對接近當前片段的遮蔽區域給予更高的權重，也就是希望讓更多取樣點靠近原點。為此，我們可以使用一個加速的插值函數來分布取樣點：

```cpp
float scale = (float)i / 64.0;
   scale   = lerp(0.1f, 1.0f, scale * scale);
   sample *= scale;
   ssaoKernel.push_back(sample);
}
```

Where `lerp` is defined as:

```cpp
float lerp(float a, float b, float f)
{
    return a + f * (b - a);
}
```

這樣我們就得到一個取樣核分佈，大部分取樣點都集中在原點附近。

![](https://learnopengl.com/img/advanced-lighting/ssao_kernel_weight.png)

每個取樣核中的樣本都會用來偏移視景空間中該片段的位置，以便取樣周圍的幾何體。我們確實需要相當多的取樣點才能達到較真實的效果，但這可能會對效能造成負擔。不過，如果我們能在每個片段基礎上引入一些半隨機的旋轉或噪點，就能大幅減少所需的取樣數量。

## 隨機取樣核旋轉（Random kernel rotations）

透過在取樣核中加入隨機性，我們大幅降低了達成良好效果所需的取樣數量。理論上我們可以為場景中每個片段創建一個隨機旋轉向量，但這樣會很快耗盡記憶體。更合理的做法是建立一張小型的隨機旋轉向量貼圖，並將其平鋪（tile）到整個螢幕。

我們製作一個 4x4 的隨機旋轉向量陣列，這些向量皆圍繞切線空間中的表面法線方向排列：

```cpp
std::vector<glm::vec3> ssaoNoise;
for (unsigned int i = 0; i < 16; i++)
{
    glm::vec3 noise(
        randomFloats(generator) * 2.0 - 1.0,
        randomFloats(generator) * 2.0 - 1.0,
        0.0f);
    ssaoNoise.push_back(noise);
}
```

由於取樣核在切線空間中沿著正的 z 軸方向定向，我們將旋轉向量的 `z` 分量設為 `0.0`，這樣旋轉會圍繞 z 軸進行。

接著，我們建立一張 4x4 的貼圖，用來存放這些隨機旋轉向量；記得將貼圖的包裹方式設定為 `GL_REPEAT`，以確保它能正確地在螢幕上平鋪。

```cpp
unsigned int noiseTexture;
glGenTextures(1, &noiseTexture);
glBindTexture(GL_TEXTURE_2D, noiseTexture);
glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA16F, 4, 4, 0, GL_RGB, GL_FLOAT, &ssaoNoise[0]);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_REPEAT);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_REPEAT);
```

我們現在已經擁有實作 SSAO 所需的所有相關輸入資料。

## SSAO 著色器

SSAO 著色器運行於填滿整個螢幕的 2D 四邊形（quad）上，計算每個片段的遮蔽值。由於我們需要將 SSAO 階段的結果儲存起來（以便在最終的光照著色器中使用），因此我們會建立另一個 framebuffer 物件：

```cpp
unsigned int ssaoFBO;
glGenFramebuffers(1, &ssaoFBO);
glBindFramebuffer(GL_FRAMEBUFFER, ssaoFBO);

unsigned int ssaoColorBuffer;
glGenTextures(1, &ssaoColorBuffer);
glBindTexture(GL_TEXTURE_2D, ssaoColorBuffer);
glTexImage2D(GL_TEXTURE_2D, 0, GL_RED, SCR_WIDTH, SCR_HEIGHT, 0, GL_RED, GL_FLOAT, NULL);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);

glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, ssaoColorBuffer, 0);
```

由於環境光遮蔽（ambient occlusion）的結果是一個單一的灰階值，我們只需要使用貼圖的紅色通道，因此將色彩緩衝區的內部格式設為 `GL_RED`。

整個 SSAO 的渲染流程大致如下：

```cpp
// geometry pass: render stuff into G-buffer
glBindFramebuffer(GL_FRAMEBUFFER, gBuffer);
    [...]
glBindFramebuffer(GL_FRAMEBUFFER, 0);

// use G-buffer to render SSAO texture
glBindFramebuffer(GL_FRAMEBUFFER, ssaoFBO);
    glClear(GL_COLOR_BUFFER_BIT);
    glActiveTexture(GL_TEXTURE0);
    glBindTexture(GL_TEXTURE_2D, gPosition);
    glActiveTexture(GL_TEXTURE1);
    glBindTexture(GL_TEXTURE_2D, gNormal);
    glActiveTexture(GL_TEXTURE2);
    glBindTexture(GL_TEXTURE_2D, noiseTexture);
    shaderSSAO.use();
    SendKernelSamplesToShader();
    shaderSSAO.setMat4("projection", projection);
    RenderQuad();
glBindFramebuffer(GL_FRAMEBUFFER, 0);

// lighting pass: render scene lighting
glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
shaderLightingPass.use();
[...]
glActiveTexture(GL_TEXTURE3);
glBindTexture(GL_TEXTURE_2D, ssaoColorBuffer);
[...]
RenderQuad();
```

`shaderSSAO` 著色器會接收相關的 G-buffer 貼圖、噪點貼圖，以及法線導向的半球取樣核作為輸入：

```cpp
#version 330 core
out float FragColor;

in vec2 TexCoords;

uniform sampler2D gPosition;
uniform sampler2D gNormal;
uniform sampler2D texNoise;

uniform vec3 samples[64];
uniform mat4 projection;

// tile noise texture over screen, based on screen dimensions divided by noise size
const vec2 noiseScale = vec2(800.0/4.0, 600.0/4.0); // screen = 800x600

void main()
{
    [...]
}
```

這裡有個有趣的點是 `noiseScale` 變數。我們想要將噪點貼圖平鋪覆蓋整個螢幕，但由於 `TexCoords` 的範圍是從 `0.0` 到 `1.0`，直接使用 `texNoise` 貼圖是不會平鋪的。因此，我們會計算需要將 `TexCoords` 放大的比例，方法是用螢幕尺寸除以噪點貼圖的大小，來調整貼圖座標。

```cpp
vec3 fragPos   = texture(gPosition, TexCoords).xyz;
vec3 normal    = texture(gNormal, TexCoords).rgb;
vec3 randomVec = texture(texNoise, TexCoords * noiseScale).xyz;
```

由於我們將 `texNoise` 的平鋪參數設定為 `GL_REPEAT`，隨機值會在整個螢幕上重複出現。結合 `fragPos` 和 `normal` 向量，我們就擁有足夠的資料來建立一個 TBN 矩陣，將任何向量從切線空間（tangent-space）轉換到視景空間（view-space）：

```cpp
vec3 tangent   = normalize(randomVec - normal * dot(randomVec, normal));
vec3 bitangent = cross(normal, tangent);
mat3 TBN       = mat3(tangent, bitangent, normal);
```

利用稱為「格拉姆–施密特正交化過程」（Gram-Schmidt process）的方法，我們建立一組正交基底，每次都根據 `randomVec` 的值稍微傾斜。請注意，由於我們使用隨機向量來構造切線向量，因此不需要讓 TBN 矩陣完全對齊幾何體表面，也不需要每個頂點擁有切線（和副切線）向量。

接著，我們對取樣核中的每一個樣本進行迭代，將樣本從切線空間轉換到視景空間，將其加到目前片段的位置上，然後比較該片段位置的深度與視景空間位置緩衝區中存的樣本深度。以下我們一步步說明這個過程：

```cpp
float occlusion = 0.0;
for(int i = 0; i < kernelSize; ++i)
{
    // get sample position
    vec3 samplePos = TBN * samples[i]; // from tangent to view-space
    samplePos = fragPos + samplePos * radius;

    [...]
}
```

這裡的 `kernelSize` 和 `radius` 是我們用來調整效果的變數；在此範例中分別設為 `64` 和 `0.5`。每次迭代時，我們先將對應的取樣點轉換到視景空間。接著，將視景空間的取樣核偏移量加到視景空間片段位置上。然後，我們會將偏移取樣點乘以 `radius`，以增加（或減少）SSAO 的取樣半徑。

接著，我們需要將 `sample` 從視景空間轉換到螢幕空間，這樣才能像直接在螢幕上渲染它的位置一樣，取樣 `sample` 的位置/深度值。由於該向量目前位於視景空間，我們會先使用 `projection` 矩陣（uniform）將它轉換到裁切空間（clip-space）：

```cpp
vec4 offset = vec4(samplePos, 1.0);
offset      = projection * offset;    // from view to clip-space
offset.xyz /= offset.w;               // perspective divide
offset.xyz  = offset.xyz * 0.5 + 0.5; // transform to range 0.0 - 1.0
```

After the variable is transformed to clip-space, we perform the perspective divide step by dividing its `xyz` components with its `w` component. The resulting normalized device coordinates are then transformed to the \[`0.0`, `1.0`\] range so we can use them to sample the position texture:

```cpp
float sampleDepth = texture(gPosition, offset.xy).z;
```

我們使用 `offset` 向量的 `x` 和 `y` 分量去取樣位置貼圖，以取得從觀察者視角看到的樣本位置的深度（或稱 `z` 值）（也就是第一個未被遮蔽的可見片段）。接著，我們會檢查樣本目前的深度值是否比儲存的深度值大，如果是，則將其加到最終的遮蔽貢獻因子中：

```cpp
occlusion += (sampleDepth >= samplePos.z + bias ? 1.0 : 0.0);
```

請注意，我們在原始片段的深度值上加了一個小的 `bias`（本例中設為 `0.025`）。雖然 bias 不一定是必須的，但它有助於視覺上微調 SSAO 效果，並且能解決因場景複雜度造成的「痘痘效應」（acne effect）。

不過我們還沒完全完成，因為還有一個小問題需要考慮。當測試的片段靠近表面邊緣時，它也會考慮距離該表面很遠的深度值；這些深度值會（錯誤地）影響遮蔽因子。這個問題可以透過加入「範圍檢查」來解決，如下圖（出自 [John Chapman](http://john-chapman-graphics.blogspot.com/)）所示：

![](https://learnopengl.com/img/advanced-lighting/ssao_range_check.png)

我們加入了一個範圍檢查，確保只有當片段的深度值在取樣半徑範圍內時，才會對遮蔽因子有所貢獻。最後一行程式碼改為：

```cpp
float rangeCheck = smoothstep(0.0, 1.0, radius / abs(fragPos.z - sampleDepth));
occlusion       += (sampleDepth >= samplePos.z + bias ? 1.0 : 0.0) * rangeCheck;
```

這裡我們使用了 GLSL 的 `smoothstep` 函數，它會在第一與第二個參數的範圍內，對第三個參數進行平滑插值。如果第三個參數小於或等於第一個參數，則回傳 `0.0`；若大於或等於第二個參數，則回傳 `1.0`。當深度差值介於 `radius` 範圍之間時，其值會根據下圖的曲線，在 `0.0` 和 `1.0` 之間平滑插值：

![](https://learnopengl.com/img/advanced-lighting/ssao_smoothstep.png)

若我們使用硬切斷的範圍檢查（即深度值超出 `radius` 時立刻不考慮遮蔽貢獻），會在檢查邊界產生明顯且不美觀的界線。

最後一步，我們將遮蔽貢獻除以取樣核大小來做正規化，並輸出結果。請注意，我們是用 `1.0` 減去遮蔽因子，這樣可以直接用遮蔽因子來縮放環境光成分。

```cpp
occlusion = 1.0 - (occlusion / kernelSize);
FragColor = occlusion;
```

假設我們有一個喜愛的背包模型正在小憩，環境光遮蔽著色器會產生以下貼圖：

![](https://learnopengl.com/img/advanced-lighting/ssao_without_blur.png)

如你所見，環境光遮蔽帶來了很好的深度感。單看這張環境光遮蔽貼圖，我們就能清楚辨識出模型確實是躺在地板上，而不是懸浮在空中。

不過效果還不夠完美，因為噪點貼圖的重複圖案非常明顯。為了讓環境光遮蔽結果更加平滑，我們需要對環境光遮蔽貼圖進行模糊處理。

## 環境光遮蔽模糊（Ambient occlusion blur）

在 SSAO 階段和光照階段之間，我們會先對 SSAO 貼圖做模糊處理。所以我們再建立一個 framebuffer 物件來存放模糊後的結果：

```cpp
unsigned int ssaoBlurFBO, ssaoColorBufferBlur;
glGenFramebuffers(1, &ssaoBlurFBO);
glBindFramebuffer(GL_FRAMEBUFFER, ssaoBlurFBO);
glGenTextures(1, &ssaoColorBufferBlur);
glBindTexture(GL_TEXTURE_2D, ssaoColorBufferBlur);
glTexImage2D(GL_TEXTURE_2D, 0, GL_RED, SCR_WIDTH, SCR_HEIGHT, 0, GL_RED, GL_FLOAT, NULL);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, ssaoColorBufferBlur, 0);
```

由於平鋪的隨機向量貼圖提供了連續且一致的隨機性，我們可以利用這個特性來實作一個簡單的模糊著色器：

```cpp
#version 330 core
out float FragColor;

in vec2 TexCoords;

uniform sampler2D ssaoInput;

void main() {
    vec2 texelSize = 1.0 / vec2(textureSize(ssaoInput, 0));
    float result = 0.0;
    for (int x = -2; x < 2; ++x)
    {
        for (int y = -2; y < 2; ++y)
        {
            vec2 offset = vec2(float(x), float(y)) * texelSize;
            result += texture(ssaoInput, TexCoords + offset).r;
        }
    }
    FragColor = result / (4.0 * 4.0);
}
```

這裡我們遍歷周圍的 SSAO 紋理像素（texels），範圍在 `-2.0` 到 `2.0` 之間，取樣 SSAO 貼圖的次數與噪點貼圖的尺寸相同。我們使用 `textureSize` 函數取得貼圖的尺寸（回傳一個 `vec2`），並以此為單位偏移每個貼圖座標，確保精確地取樣每個像素。最後將取得的結果平均，得到一個簡單但有效的模糊效果：

![](https://learnopengl.com/img/advanced-lighting/ssao.png)

這樣，我們就有一張包含每個片段環境光遮蔽資料的貼圖，準備在光照階段使用。

## 應用環境光遮蔽

將遮蔽因子套用到光照方程式非常簡單：只需將每個片段的環境光遮蔽因子乘到光照的環境光成分上即可完成。如果我們以上一章的 Blinn-Phong 延遲光照著色器為基礎，稍作調整，片段著色器就會長成如下：

```cpp
#version 330 core
out vec4 FragColor;

in vec2 TexCoords;

uniform sampler2D gPosition;
uniform sampler2D gNormal;
uniform sampler2D gAlbedo;
uniform sampler2D ssao;

struct Light {
    vec3 Position;
    vec3 Color;

    float Linear;
    float Quadratic;
    float Radius;
};
uniform Light light;

void main()
{
    // retrieve data from gbuffer
    vec3 FragPos = texture(gPosition, TexCoords).rgb;
    vec3 Normal = texture(gNormal, TexCoords).rgb;
    vec3 Diffuse = texture(gAlbedo, TexCoords).rgb;
    float AmbientOcclusion = texture(ssao, TexCoords).r;

    // blinn-phong (in view-space)
    vec3 ambient = vec3(0.3 * Diffuse * AmbientOcclusion); // here we add occlusion factor
    vec3 lighting  = ambient;
    vec3 viewDir  = normalize(-FragPos); // viewpos is (0.0.0) in view-space
    // diffuse
    vec3 lightDir = normalize(light.Position - FragPos);
    vec3 diffuse = max(dot(Normal, lightDir), 0.0) * Diffuse * light.Color;
    // specular
    vec3 halfwayDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(Normal, halfwayDir), 0.0), 8.0);
    vec3 specular = light.Color * spec;
    // attenuation
    float dist = length(light.Position - FragPos);
    float attenuation = 1.0 / (1.0 + light.Linear * dist + light.Quadratic * dist * dist);
    diffuse  *= attenuation;
    specular *= attenuation;
    lighting += diffuse + specular;

    FragColor = vec4(lighting, 1.0);
}
```

除了將計算改為視景空間外，我們真正改動的只有將場景的環境光成分乘上 `AmbientOcclusion`。場景中若只有一個帶點藍色調的點光源，結果會像這樣：

![](https://learnopengl.com/img/advanced-lighting/ssao_final.png)

你可以在這裡找到完整的示範程式碼：[連結](https://learnopengl.com/code_viewer_gh.php?code=src/5.advanced_lighting/9.ssao/ssao.cpp)。

螢幕空間環境光遮蔽（SSAO）是一個高度可自訂的效果，參數需要根據場景類型不斷調整。沒有一組完美的參數能適用於所有場景。有些場景只適合用較小的半徑，而其他場景則需要更大半徑與更多取樣點數，才能呈現真實效果。當前示範使用了 `64` 個取樣點，稍顯過多；你可以嘗試用較小的取樣核大小來調整，找出合適的效果。

你可以調整的參數（例如用 uniform 傳入）有：取樣核大小（kernel size）、半徑（radius）、偏差（bias）和噪點核大小。你也可以將最終的遮蔽值以使用者定義的指數提升，以增加其強度：

```cpp
occlusion = 1.0 - (occlusion / kernelSize);
FragColor = pow(occlusion, power);
```

多試試不同的場景和參數設定，來體會 SSAO 的高度可調性。

雖然 SSAO 是一種細微、不易明顯察覺的效果，但它能大幅提升良好光照場景的真實感，絕對是你工具箱中值得擁有的一項技術。

## 額外資源

- [SSAO 教學](http://john-chapman-graphics.blogspot.nl/2013/01/ssao-tutorial.html)：John Chapman 的優秀 SSAO 教學；本章的大部分程式碼與技術都基於他的文章。
- [了解你的 SSAO 畫面瑕疵](https://mtnphil.wordpress.com/2013/06/26/know-your-ssao-artifacts/)：一篇關於改善 SSAO 特有瑕疵的好文章。
- [帶深度重建的 SSAO](http://ogldev.atspace.co.uk/www/tutorial46/tutorial46.html)：OGLDev 的進階教學，講述如何僅用深度資訊重建位置向量，節省在 G-buffer 中存放高成本位置向量的需求。
