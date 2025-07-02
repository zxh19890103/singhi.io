---
layout: bookdetail
chapter: 三十五
title: 高級光照 &bull; 視差貼圖（Parallax Mapping）
category: tech
src: "https://learnopengl.com/Advanced-Lighting/Parallax-Mapping"
date: 2025-07-02
math: 1
book: opengl
image: "https://learnopengl.com/img/advanced-lighting/parallax_mapping_height_map.png"
order: 35
lang: zh
glcate: Advanced-Lighting
gltopic: Parallax-Mapping
permalink: /opengl/Advanced-Lighting/Parallax-Mapping
---

**視差映射（Parallax Mapping）** 是一種和法線映射（Normal Mapping）類似，但基於不同原理的技術。就像法線映射一樣，視差映射能顯著提升材質表面的細節感，並賦予其深度感。雖然這也是一種視覺幻象，但視差映射在表達深度感方面比法線映射更為出色，兩者結合時可以呈現出極為逼真的效果。視差映射不完全屬於（進階）光照技術，但它是法線映射的自然延伸，因此這裡還是會介紹它。值得注意的是，理解法線映射，特別是切線空間（tangent space）的概念，對學習視差映射非常重要。

視差映射和「位移映射（Displacement Mapping）」家族關係密切，這類技術會根據存放在貼圖中的幾何資訊來 _位移_ 或 _偏移_ 頂點。舉例來說，可以先用一個大約有 1000 個頂點的平面，然後根據一張貼圖裡每個區域的高度值去位移這些頂點。這種包含每個像素高度值的貼圖稱為「高度圖（Height Map）」。下面這張高度圖是根據一個簡單磚塊表面的幾何特性所製作的範例：

![高度圖範例](https://learnopengl.com/img/advanced-lighting/parallax_mapping_height_map.png)

當將這張高度圖映射到平面上時，每個頂點都會根據高度圖中取樣的高度值被位移，從而將一個平坦的平面轉變成具有粗糙凹凸感的表面。例如，對上面高度圖作用的平面效果如下：

![平面位移效果](https://learnopengl.com/img/advanced-lighting/parallax_mapping_plane_heightmap.png)

但這種透過頂點位移的方式有個問題：要做到逼真的位移效果，平面需要非常多的三角形，否則位移看起來會非常方塊狀。由於要達到這種效果，可能需要超過一萬個頂點，計算成本會非常高昂。那如果我們可以用更少的頂點達成相似的逼真效果怎麼辦？實際上，上面展示的「位移效果」表面，其實只用了兩個三角形繪製。這就是「視差映射」的魔力——它是一種位移映射技術，無需額外頂點資料，靠巧妙的視覺欺騙來傳達深度感，類似於法線映射。

視差映射的核心想法，是改變材質的貼圖座標，使得表面上的某個片元看起來比實際更高或更低，這種偏移是根據視角方向（View Direction）和高度圖來計算的。為了理解它的工作原理，可以看下面這張磚塊表面示意圖：

![視差映射示意](https://learnopengl.com/img/advanced-lighting/parallax_mapping_plane_height.png)

圖中紅色粗線代表高度圖中磚塊表面的幾何曲面，而橘色箭頭 \\(\color{orange}{\bar{V}}\\) 是從表面指向觀察者的方向向量（viewDir）。如果平面真的有位移，觀察者會看到藍色點 \\(\color{blue}B\\) 的表面。但因為我們的平面沒有真實位移，實際的視線方向是從綠色點 \\(\color{green}A\\) 出發。視差映射就是想辦法在片元位置 \\(\color{green}A\\) 偏移貼圖座標，使得能得到藍色點 \\(\color{blue}B\\) 的貼圖座標，並用這個坐標去取樣材質，營造出看起來像觀察者真的在看 \\(\color{blue}B\\) 點的錯覺。

關鍵問題是：如何從綠色點 \\(\color{green}A\\) 推算出藍色點 \\(\color{blue}B\\) 的貼圖座標？視差映射的做法是將片元到視點的方向向量 \\(\color{orange}{\bar{V}}\\) 乘上高度圖中 \\(\color{green}A\\) 點的高度值 \\(\color{green}{H(A)}\\)，也就是根據高度來調整向量長度。下圖展示了這個放縮後的向量 \\(\color{brown}{\bar{P}}\\)：

![放縮向量示意](https://learnopengl.com/img/advanced-lighting/parallax_mapping_scaled_height.png)

接著，我們將這個向量 \\(\color{brown}{\bar{P}}\\) 在平面上的分量（向量的 x、y 坐標）作為貼圖坐標的偏移量。因為 \\(\color{brown}{\bar{P}}\\) 是依據高度計算的，所以片元高度越高，偏移量也越大。

這個方法多數情況下表現良好，但它只是非常粗略的近似，尤其當表面高度快速變化時，計算得到的 \\(\color{brown}{\bar{P}}\\) 並不會很接近理想的點 \\(\color{blue}B\\)，結果會看起來不自然，如下圖：

![錯誤偏移示意](https://learnopengl.com/img/advanced-lighting/parallax_mapping_incorrect_p.png)

另外一個問題是，如果表面經過任意旋轉，我們要從向量 \\(\color{brown}{\bar{P}}\\) 取哪兩個分量作為偏移就不容易判斷了。理想情況是我們希望偏移的 x 和 y 分量總是對齊材質表面座標系的方向。這時候，如果你有看過[法線映射章節](https://learnopengl.com/Advanced-Lighting/Normal-Mapping)，你可能已經猜到答案：我們會在切線空間（tangent space）裡做視差映射。

只要把片元到視點方向向量 \\(\color{orange}{\bar{V}}\\) 轉換到切線空間，計算出來的偏移向量 \\(\color{brown}{\bar{P}}\\) 就能保證 x、y 分量和表面上的切線（tangent）及副切線（bitangent）方向一致。因為切線和副切線方向與材質貼圖的座標軸方向相同，我們就能直接用這兩個分量當作偏移量，無論表面如何旋轉都沒問題。

理論說明就到這裡，接下來我們就開始實作真正的視差映射吧！

## 視差映射

在視差映射的實作中，我們會使用一個簡單的二維平面，並且在送入 GPU 前先計算好該平面的切線（tangent）和副切線（bitangent）向量，這與我們在法線映射章節中所做的類似。在這個平面上，我們會附加一張 [漫反射貼圖](https://learnopengl.com/img/textures/bricks2.jpg)、一張 [法線貼圖](https://learnopengl.com/img/textures/bricks2_normal.jpg)，以及一張 [位移貼圖](https://learnopengl.com/img/textures/bricks2_disp.jpg)，這些貼圖你都可以從它們的連結下載。在這個範例中，我們會將視差映射和法線映射一起使用。因為視差映射本身創造的是表面位移的錯覺，如果光照和表面細節不符，這種錯覺就會被破壞。而法線貼圖通常是從高度圖（heightmap）產生的，所以將法線貼圖和高度圖一起使用，可以保證光照和位移效果一致，讓整體看起來更自然。

你可能已經注意到，上面連結的位移貼圖（displacement map）是本章開始時展示的高度圖的反向（inverse）。在視差映射中，使用高度圖的反向會更合理，因為在平面上製造深度的錯覺比製造高度的錯覺更容易。這也稍微改變了我們對視差映射的感知，如下圖所示：

![視差映射深度示意](https://learnopengl.com/img/advanced-lighting/parallax_mapping_depth.png)

圖中依舊有綠色點 \\(\color{green}A\\) 和藍色點 \\(\color{blue}B\\)，但這次我們是用 **用綠色點 \\(\color{green}A\\) 的貼圖坐標減去** 橘色向量 \\(\color{orange}{\bar{V}}\\) 得到棕色向量 \\(\color{brown}{\bar{P}}\\)。在著色器中，可以透過用 `1.0` 減去高度圖的取樣值來取得深度值，也可以像我們對上面深度貼圖做的那樣，在影像編輯軟體中反轉貼圖的顏色值。

由於位移效果會隨著三角形表面不同位置改變，視差映射必須在片元著色器（fragment shader）中實現。在片元著色器裡，我們需要計算片元到視點的方向向量 \\(\color{orange}{\bar{V}}\\)，因此需要視點位置和片元在切線空間中的位置。前面法線映射章節中，我們已經有一個頂點著色器會傳送這些切線空間中的向量，因此這裡我們可以直接複製該章節的頂點著色器程式碼：

```glsl
#version 330 core
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec3 aNormal;
layout (location = 2) in vec2 aTexCoords;
layout (location = 3) in vec3 aTangent;
layout (location = 4) in vec3 aBitangent;

out VS_OUT {
    vec3 FragPos;
    vec2 TexCoords;
    vec3 TangentLightPos;
    vec3 TangentViewPos;
    vec3 TangentFragPos;
} vs_out;

uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;

uniform vec3 lightPos;
uniform vec3 viewPos;

void main()
{
    gl_Position      = projection * view * model * vec4(aPos, 1.0);
    vs_out.FragPos   = vec3(model * vec4(aPos, 1.0));
    vs_out.TexCoords = aTexCoords;

    vec3 T   = normalize(mat3(model) * aTangent);
    vec3 B   = normalize(mat3(model) * aBitangent);
    vec3 N   = normalize(mat3(model) * aNormal);
    mat3 TBN = transpose(mat3(T, B, N));

    vs_out.TangentLightPos = TBN * lightPos;
    vs_out.TangentViewPos  = TBN * viewPos;
    vs_out.TangentFragPos  = TBN * vs_out.FragPos;
}
```

在片元著色器中，我們會實作視差映射的邏輯。片元著色器的結構大致如下：

```glsl
#version 330 core
out vec4 FragColor;

in VS_OUT {
    vec3 FragPos;
    vec2 TexCoords;
    vec3 TangentLightPos;
    vec3 TangentViewPos;
    vec3 TangentFragPos;
} fs_in;

uniform sampler2D diffuseMap;
uniform sampler2D normalMap;
uniform sampler2D depthMap;

uniform float height_scale;

vec2 ParallaxMapping(vec2 texCoords, vec3 viewDir);

void main()
{
    // offset texture coordinates with Parallax Mapping
    vec3 viewDir   = normalize(fs_in.TangentViewPos - fs_in.TangentFragPos);
    vec2 texCoords = ParallaxMapping(fs_in.TexCoords,  viewDir);

    // then sample textures with new texture coords
    vec3 diffuse = texture(diffuseMap, texCoords);
    vec3 normal  = texture(normalMap, texCoords);
    normal = normalize(normal * 2.0 - 1.0);
    // proceed with lighting code
    [...]
}
```

我們定義了一個名為 `ParallaxMapping` 的函數，它接收片元的貼圖座標和切線空間中的片元到視角方向向量 \\(\color{orange}{\bar{V}}\\) 作為輸入。這個函數會回傳經過位移後的貼圖座標。接著，我們使用這些「位移後的貼圖座標」去取樣漫反射貼圖（diffuse map）和法線貼圖（normal map）。這樣做的結果是，片元的漫反射顏色和法線向量能夠正確對應到表面經過位移的幾何細節。

讓我們來看看 `ParallaxMapping` 函數的內部實作：

```glsl
vec2 ParallaxMapping(vec2 texCoords, vec3 viewDir)
{
    float height =  texture(depthMap, texCoords).r;
    vec2 p = viewDir.xy / viewDir.z * (height * height_scale);
    return texCoords - p;
}
```

這個相當簡單的函數，直接反映了我們之前討論的原理。我們以原始的貼圖座標 `texCoords` 去從 `depthMap` 取樣，取得當前片元 \\(\color{green}{A}\\) 的高度值（或深度值） \\(\color{green}{H(A)}\\)。接著，我們計算向量 \\(\color{brown}{\bar{P}}\\)，它是將切線空間中 `viewDir` 向量的 `x` 和 `y` 分量除以其 `z` 分量後，再乘以高度值 \\(\color{green}{H(A)}\\)。此外，我們也加入了一個 `height_scale` 的 uniform 來調整效果強度，因為沒有這個縮放參數的話，視差效果通常會太過強烈。最後，我們用原本的貼圖座標減去這個向量 \\(\color{brown}{\bar{P}}\\)，得到最終位移後的貼圖座標。

這裡值得注意的是，我們為什麼要將 `viewDir.xy` 除以 `viewDir.z`。因為 `viewDir` 是歸一化向量，所以它的 `z` 分量介於 `0.0` 到 `1.0` 之間。當視線方向幾乎與表面平行時，`viewDir.z` 接近 `0.0`，這會讓除法結果（\\(\color{brown}{\bar{P}}\\)）變得非常大；反之，當視線接近平行於表面法線方向時，`viewDir.z` 接近 `1.0`，位移向量就比較小。這樣的設計可以根據視角自動調整貼圖座標的偏移量，讓視差效果在側視角度時更明顯，而在正視時較小，讓視覺效果更自然逼真。

不過也有人選擇去掉這個除法操作，因為原始的視差映射在側視角度時可能會產生不理想的結果，這種修改版本叫做「帶有偏移限制的視差映射」（Parallax Mapping with Offset Limiting）。要使用哪種方式，多半是依個人偏好決定。

最後得到的貼圖座標會用來取樣其他貼圖（漫反射貼圖和法線貼圖），從而產生非常漂亮的位移效果，以下圖展示了大約 `height_scale = 0.1` 的效果：

![](https://learnopengl.com/img/advanced-lighting/parallax_mapping.png)

這裡你可以看到普通的法線映射和結合視差映射的差異。因為視差映射嘗試模擬深度，視角不同時會看到磚塊好像彼此重疊，效果更真實。

不過你還是會看到視差映射平面邊緣有些怪異的邊界偽影，這是因為貼圖座標經過位移後可能會超出貼圖的合法範圍 $`0`, `1`$，依貼圖的包裹模式（wrapping mode）不同，超出範圍取樣會產生不自然的效果。一個簡單又實用的解決方法是：當取樣後的貼圖座標超出範圍時，直接丟棄（discard）該片元。

```glsl
texCoords = ParallaxMapping(fs_in.TexCoords,  viewDir);
if(texCoords.x > 1.0 || texCoords.y > 1.0 || texCoords.x < 0.0 || texCoords.y < 0.0)
    discard;
```

所有貼圖座標（包含位移後的）超出預設範圍 $[0,1]$ 的片元會被丟棄（discard），這樣做能讓視差映射在表面邊緣附近呈現更正確的效果。需要注意的是，這種技巧並不適用於所有類型的表面，但應用在平面上效果非常棒：

![](https://learnopengl.com/img/advanced-lighting/parallax_mapping_edge_fix.png)

你也可以在這裡找到完整原始碼：[source code](https://learnopengl.com/code_viewer_gh.php?code=src/5.advanced_lighting/5.1.parallax_mapping/parallax_mapping.cpp)。

這種方法不僅看起來很棒，而且效能也很好，因為視差映射只需要額外一次貼圖取樣。然而，它還是存在一些問題：當從斜角度觀看時（類似於法線貼圖），效果會變差，尤其在高度變化陡峭的區域會出現不正確的結果，如下圖所示：

![](https://learnopengl.com/img/advanced-lighting/parallax_mapping_issues.png)

這是因為視差映射其實只是位移映射的一種粗略近似方法。好消息是，我們可以使用一些額外的技巧來提升效果，即使面對陡峭高度變化與斜視角度，也能得到幾乎完美的結果。例如，我們可以不只取一個樣本，而是多次取樣，嘗試找到最接近真實位移點 \\(\color{blue}B\\) 的貼圖座標，這樣能更精準地模擬出視差位移效果。

## 陡峭視差貼圖（Steep Parallax Mapping）

陡峭視差貼圖是在基本視差貼圖的基礎上做的擴展，它採用了相同的原理，但不是只取一個樣本，而是採用多個樣本來更精確地定位向量 \\(\color{brown}{\bar{P}}\\) 到點 \\(\color{blue}B\\) 的位置。這使得效果更好，即使在高度變化劇烈的地方，也能保持較高的精度，因為技術的準確度隨著樣本數量的增加而提高。

陡峭視差貼圖的核心思路是：將整個深度範圍分成多層，這些層的高度／深度相同。對於每一層，我們從深度圖（depthmap）中取樣，沿著向量 \\(\color{brown}{\bar{P}}\\) 的方向偏移貼圖座標，直到找到一個取樣的深度值比當前層的深度值還要小為止。請看下面的示意圖：

![](https://learnopengl.com/img/advanced-lighting/parallax_mapping_steep_parallax_mapping_diagram.png)

我們從最頂層開始往下遍歷這些深度層，並將每一層的深度值與深度貼圖（depthmap）中存儲的深度值進行比較。如果該層的深度值小於深度貼圖中的值，表示這一層向量 \\(\color{brown}{\bar{P}}\\) 的部分並不在表面以下。我們會繼續這個過程，直到某一層的深度值高於深度貼圖中的值，這個位置就表示該點位於（位移後的）幾何表面之下。

在這個例子中，我們看到第二層的深度貼圖值 (D(2) = 0.73) 小於第二層的深度值 `0.4`，所以繼續往下檢查。在下一次迭代中，該層深度值 `0.6` 大於深度貼圖中的取樣值 (D(3) = 0.37)。因此，我們可以認為向量 \\(\color{brown}{\bar{P}}\\) 在第三層的位置是位移後幾何表面最合適的位置。接著，我們取用向量 \\(\color{brown}{\bar{P_3}}\\) 的貼圖座標偏移量 \\(T_3\\)，用來位移該片段的貼圖座標。可以看出，當深度層數越多，精度也隨之提升。

要實現這個技術，我們只需要修改 `ParallaxMapping` 函數，因為我們已經擁有所有所需的變數了：

```cpp
vec2 ParallaxMapping(vec2 texCoords, vec3 viewDir)
{
    // number of depth layers
    const float numLayers = 10;
    // calculate the size of each layer
    float layerDepth = 1.0 / numLayers;
    // depth of current layer
    float currentLayerDepth = 0.0;
    // the amount to shift the texture coordinates per layer (from vector P)
    vec2 P = viewDir.xy * height_scale;
    vec2 deltaTexCoords = P / numLayers;

    [...]
}
```

這裡我們首先進行初始化設定：指定層數（number of layers）、計算每一層的深度偏移量，最後計算每一層沿著向量 \\(\color{brown}{\bar{P}}\\) 方向所需偏移的貼圖座標量。

接著，我們從最頂層開始，逐層迭代，直到找到一個深度貼圖（depthmap）取樣值小於該層的深度值為止：

```cpp
// get initial values
vec2  currentTexCoords     = texCoords;
float currentDepthMapValue = texture(depthMap, currentTexCoords).r;

while(currentLayerDepth < currentDepthMapValue)
{
    // shift texture coordinates along direction of P
    currentTexCoords -= deltaTexCoords;
    // get depthmap value at current texture coordinates
    currentDepthMapValue = texture(depthMap, currentTexCoords).r;
    // get depth of next layer
    currentLayerDepth += layerDepth;
}

return currentTexCoords;
```

這裡我們對每一層深度進行迴圈，直到找到第一個沿著向量 \\(\color{brown}{\bar{P}}\\) 的貼圖座標偏移，使得取樣到的深度值低於（位移後的）表面為止。得到的偏移值會從片段的原始貼圖座標中減去，從而得到最終更準確的位移後貼圖座標，這種方法的準確度遠高於傳統的視差貼圖。

使用大約 `10` 次取樣時，即使從斜角看這塊磚牆表面，也已經顯得非常逼真；但陡峭視差貼圖（Steep Parallax Mapping）在處理具有劇烈高度變化的複雜表面時效果更佳，就像之前展示的那個木製玩具表面：

![](https://learnopengl.com/img/advanced-lighting/parallax_mapping_steep_parallax_mapping.png)

我們可以透過利用視差貼圖的一個特性來改進這個算法：當視線正對表面時，貼圖位移不明顯；而當視角斜視表面時，位移效果則很顯著（可以想像視線方向在兩種情況下的差異）。因此，我們可以在正對表面時採樣較少次數，斜視時採樣較多次數，這樣只採樣必要的量：

```cpp
const float minLayers = 8.0;
const float maxLayers = 32.0;
float numLayers = mix(maxLayers, minLayers, max(dot(vec3(0.0, 0.0, 1.0), viewDir), 0.0));
```

這段程式碼中，我們計算 `viewDir` 與正向 z 軸（在切線空間中，z 軸方向即是表面法線方向） 的點積，並根據點積結果將採樣層數線性插值到 `minLayers` 或 `maxLayers`，使採樣數量隨視角調整。如果視線方向與表面平行，則會使用最多 `32` 層的採樣。

你可以在這裡找到更新後的原始碼：[連結](https://learnopengl.com/code_viewer_gh.php?code=src/5.advanced_lighting/5.2.steep_parallax_mapping/steep_parallax_mapping.cpp)。木製玩具盒表面的貼圖素材也在這裡：[漫反射貼圖](https://learnopengl.com/img/textures/wood.png)、[法線貼圖](https://learnopengl.com/img/textures/toy_box_normal.png) 以及 [深度貼圖](https://learnopengl.com/img/textures/toy_box_disp.png)。

然而，陡峭視差貼圖（Steep Parallax Mapping）也有它的問題。由於此技術是基於有限次數的取樣，會產生鋸齒狀的走樣效果，層與層之間的分界線容易被察覺：

![](https://learnopengl.com/img/advanced-lighting/parallax_mapping_steep_artifact.png)

我們可以透過增加取樣數量來減輕這個問題，但這樣會迅速加重效能負擔。為了解決這個問題，有一些方法不直接使用第一個低於（位移後）表面的取樣點，而是透過**在該點前後兩層深度值之間插值**，來找到更接近真實位置 \\(\color{blue}B\\) 的取樣點。

其中較為流行的兩種方法是「Relief Parallax Mapping」和「Parallax Occlusion Mapping」，其中 Relief Parallax Mapping 的效果最精確，但相對地對效能要求較高；而 Parallax Occlusion Mapping 幾乎能達到與 Relief Parallax Mapping 同樣的效果，但效能更佳，因此更常被採用。

## 位移遮蔽視差貼圖（Parallax Occlusion Mapping）

位移遮蔽視差貼圖基於與陡峭視差貼圖相同的原理，但它不是直接取碰撞後的第一個深度層的貼圖座標，而是在碰撞前後的兩個深度層之間進行線性插值。插值的權重取決於表面高度與這兩個深度層值的距離。下面這張圖能幫助你理解它的運作方式：

![](https://learnopengl.com/img/advanced-lighting/parallax_mapping_parallax_occlusion_mapping_diagram.png)

如圖所示，這和陡峭視差貼圖非常相似，只是多了一個步驟——在碰撞點附近的兩個深度層貼圖座標之間做線性插值。這仍然是一種近似方法，但比陡峭視差貼圖準確很多。

位移遮蔽視差貼圖的程式碼是在陡峭視差貼圖基礎上的擴展，實現並不複雜：

```cpp
[...] // steep parallax mapping code here

// get texture coordinates before collision (reverse operations)
vec2 prevTexCoords = currentTexCoords + deltaTexCoords;

// get depth after and before collision for linear interpolation
float afterDepth  = currentDepthMapValue - currentLayerDepth;
float beforeDepth = texture(depthMap, prevTexCoords).r - currentLayerDepth + layerDepth;

// interpolation of texture coordinates
float weight = afterDepth / (afterDepth - beforeDepth);
vec2 finalTexCoords = prevTexCoords * weight + currentTexCoords * (1.0 - weight);

return finalTexCoords;
```

在找到與（位移後）表面幾何相交的深度層之後，我們還會取得交點之前那層的貼圖座標。接著計算位移幾何深度與這兩層深度值的距離，並在這兩個貼圖座標之間做線性插值。這個線性插值是對兩個層的貼圖座標進行基本的插值計算。最後這個函數回傳插值後的最終貼圖座標。

位移遮蔽視差貼圖（Parallax Occlusion Mapping）能帶來令人驚豔的效果，雖然在某些情況下仍會看到輕微的瑕疵和鋸齒現象，但整體來說是一個不錯的折衷方案。只有在大幅放大或從非常陡的角度觀看時，這些瑕疵才會明顯可見。

![](https://learnopengl.com/img/advanced-lighting/parallax_mapping_parallax_occlusion_mapping.png)

你可以在這裡找到它的原始碼：[連結](https://learnopengl.com/code_viewer_gh.php?code=src/5.advanced_lighting/5.3.parallax_occlusion_mapping/parallax_occlusion_mapping.cpp)。

視差貼圖（Parallax Mapping）是一個能大幅提升場景細節的好技術，但使用時也需注意它可能帶來的一些瑕疵。通常，視差貼圖多用在地板或牆面這類不易辨識輪廓，且觀看角度大多接近垂直於表面的平面上。這樣一來，視差貼圖的瑕疵就不那麼明顯，使它成為非常有趣且實用的細節增強技術。

## 額外資源

- [視差位移貼圖的原理](https://www.youtube.com/watch?v=xvOT62L-fQI)：TheBennyBox 製作的視差貼圖工作原理解說影片，內容很不錯。
