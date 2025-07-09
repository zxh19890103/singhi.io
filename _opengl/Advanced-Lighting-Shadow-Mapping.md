---
layout: bookdetail
chapter: 三十二
title: 高級光照 &bull; 陰影貼圖
category: tech
src: "https://learnopengl.com/Advanced-Lighting/Shadows/Shadow-Mapping"
date: 2025-07-02
math: 1
book: opengl
image: "https://learnopengl.com/img/advanced-lighting/shadow_mapping_with_without.png"
order: 32
lang: zh
glcate: Advanced-Lighting
gltopic: Shadow-Mapping
permalink: /opengl/Advanced-Lighting/Shadow-Mapping
---

陰影是光線被遮蔽而產生的。當一個光源的光線被其他物體遮擋而未能照射到某個物體時，該物體便處於陰影之中。陰影為光照場景增添了大量的真實感，並讓觀看者更容易觀察物體之間的空間關係。它們為我們的場景和物體提供了更強烈的深度感。例如，請看以下有陰影和無陰影的場景圖片：

![](https://learnopengl.com/img/advanced-lighting/shadow_mapping_with_without.png)

你可以看到，有了陰影，物體之間的關係變得更加清晰。例如，其中一個立方體漂浮在其他立方體之上，只有在有陰影的情況下才能真正注意到這一點。

然而，陰影的實作有點棘手，特別是因為在目前的即時（光柵化圖形）研究中，尚未開發出完美的陰影演算法。有幾種不錯的陰影近似技術，但它們都有各自的小怪癖和惱人之處，我們必須將其考慮在內。

大多數電玩遊戲中使用的一種技術，能提供不錯的結果且相對容易實作，那就是**陰影貼圖（shadow mapping）**。陰影貼圖不難理解，效能開銷不大，而且很容易擴展到更進階的演算法（例如[全向陰影貼圖](https://learnopengl.com/Advanced-Lighting/Shadows/Point-Shadows)和[級聯陰影貼圖](https://learnopengl.com/Guest-Articles/2021/CSM)）。

## 陰影貼圖

陰影貼圖背後的想法很簡單：我們從光源的角度渲染場景，從光源視角能看到的一切都是被照亮的，而看不到的一切都必然處於陰影之中。想像一下，地板上有一大箱子介於地板和光源之間。由於光源在看向那個方向時會看到這個箱子而不是地板，因此那塊特定的地板區域應該處於陰影之中。

![](https://learnopengl.com/img/advanced-lighting/shadow_mapping_theory.png)

這裡所有藍線代表光源能看到的所有片段（fragment）。被遮擋的片段則顯示為黑線：這些片段將被渲染為陰影。如果我們從光源向最右邊的箱子上的某個片段畫一條線或**光線（ray）**，我們可以看到光線首先擊中浮動的容器，然後才擊中最右邊的容器。結果，浮動容器的片段被照亮，而最右邊容器的片段則未被照亮，因此處於陰影之中。

我們想獲取光線第一次擊中物體的那個點，並將這個\*\*最近點（closest point）\*\*與這條光線上的其他點進行比較。然後我們做一個基本測試，看看一個測試點的光線位置是否比最近點更靠後，如果是，那麼該測試點就必然處於陰影中。然而，對光源發出的數千條光線進行迭代是一種極其低效的方法，不適用於即時渲染。我們可以做類似的事情，但無需投射光線。相反，我們使用我們相當熟悉的東西：深度緩衝區（depth buffer）。

你可能還記得在[深度測試](https://learnopengl.com/Advanced-OpenGL/Depth-testing)章節中，深度緩衝區中的值對應於從攝影機視角來看，被限制在 $[0,1]$ 範圍內的片段深度。如果我們從光源的角度渲染場景，並將結果深度值儲存在紋理中呢？這樣，我們就可以從光源的角度採樣最近的深度值。畢竟，深度值顯示了從光源視角可見的第一個片段。我們將所有這些深度值儲存在一個紋理中，我們稱之為**深度貼圖（depth map）或陰影貼圖（shadow map）**。

![](https://learnopengl.com/img/advanced-lighting/shadow_mapping_theory_spaces.png)

左圖顯示了一個定向光源（所有光線皆平行）在立方體下方的表面投射陰影。我們使用儲存在深度貼圖中的深度值來找到最近點，並用它來判斷片段是否處於陰影中。我們透過使用專屬於該光源的視圖（view）和投影（projection）矩陣來渲染場景（從光源的角度），以創建深度貼圖。這個投影和視圖矩陣共同形成一個變換 $T$，該變換將任何 3D 位置轉換到光源的（可見）座標空間。

{% include box.html content="
定向光源由於被建模為無限遠，因此沒有位置。然而，為了陰影貼圖的目的，我們需要從光源的角度渲染場景，因此要從光源方向線上的某個位置渲染場景。
" color="green" %}

在右圖中，我們看到相同的定向光源和觀察者。我們在點 $\bar{\color{red}{P}}$ 處渲染一個片段，我們必須判斷它是否處於陰影中。為此，我們首先使用 $T$ 將點 $\bar{\color{red}{P}}$ 轉換到光源的座標空間。由於點 $\bar{\color{red}{P}}$ 現在是從光源角度看到的，其 `z` 座標對應於其深度，在此範例中為 `0.9`。使用點 $\bar{\color{red}{P}}$ 我們還可以索引深度/陰影貼圖，以獲取從光源角度看最近的可見深度，該點位於 $\\bar{\\color{green}{C}}$，採樣深度為 `0.4`。由於索引深度貼圖返回的深度小於點 $\bar{\\color{red}{P}}$ 處的深度，我們可以得出結論，點 $\\bar{\color{red}{P}}$ 被遮蔽，因此處於陰影中。

因此，陰影貼圖包含兩個階段：首先我們渲染深度貼圖，第二階段我們正常渲染場景並使用生成的深度貼圖來計算片段是否處於陰影中。這聽起來可能有點複雜，但一旦我們逐步深入了解這項技術，它可能會變得有意義。

## 深度貼圖

第一個階段要求我們生成一個深度貼圖。深度貼圖是從光源角度渲染的深度紋理，我們將用它來測試陰影。因為我們需要將場景的渲染結果儲存在紋理中，所以我們將再次需要[幀緩衝區](https://learnopengl.com/Advanced-OpenGL/Framebuffers)。

首先我們將創建一個幀緩衝區物件，用於渲染深度貼圖：

```cpp
unsigned int depthMapFBO;
glGenFramebuffers(1, &depthMapFBO);
```

接下來我們創建一個 2D 紋理，將其用作幀緩衝區的深度緩衝區：

```cpp
const unsigned int SHADOW_WIDTH = 1024, SHADOW_HEIGHT = 1024;

unsigned int depthMap;
glGenTextures(1, &depthMap);
glBindTexture(GL_TEXTURE_2D, depthMap);
glTexImage2D(GL_TEXTURE_2D, 0, GL_DEPTH_COMPONENT,
             SHADOW_WIDTH, SHADOW_HEIGHT, 0, GL_DEPTH_COMPONENT, GL_FLOAT, NULL);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_REPEAT);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_REPEAT);
```

深度貼圖的生成看起來不應該太複雜。因為我們只關心深度值，所以我們將紋理的格式指定為 `GL_DEPTH_COMPONENT`。我們還將紋理的寬度和高度設為 `1024`：這就是深度貼圖的解析度。

有了生成的深度紋理，我們就可以將其附加為幀緩衝區的深度緩衝區：

```cpp
glBindFramebuffer(GL_FRAMEBUFFER, depthMapFBO);
glFramebufferTexture2D(GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, GL_TEXTURE_2D, depthMap, 0);
glDrawBuffer(GL_NONE);
glReadBuffer(GL_NONE);
glBindFramebuffer(GL_FRAMEBUFFER, 0);
```

我們在從光源角度渲染場景時只需要深度資訊，因此不需要顏色緩衝區。然而，幀緩衝區物件在沒有顏色緩衝區的情況下是不完整的，所以我們需要明確告知 OpenGL 我們不打算渲染任何顏色資料。我們透過將 `glDrawBuffer` 和 `glReadbuffer` 都設定為 `GL_NONE` 來做到這一點。

有了正確配置的幀緩衝區，它可以將深度值渲染到紋理中，我們就可以開始第一個階段：生成深度貼圖。當與第二個階段結合時，完整的渲染階段將會像這樣：

```cpp
// 1. first render to depth map
glViewport(0, 0, SHADOW_WIDTH, SHADOW_HEIGHT);
glBindFramebuffer(GL_FRAMEBUFFER, depthMapFBO);
    glClear(GL_DEPTH_BUFFER_BIT);
    ConfigureShaderAndMatrices();
    RenderScene();
glBindFramebuffer(GL_FRAMEBUFFER, 0);
// 2. then render scene as normal with shadow mapping (using depth map)
glViewport(0, 0, SCR_WIDTH, SCR_HEIGHT);
glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
ConfigureShaderAndMatrices();
glBindTexture(GL_TEXTURE_2D, depthMap);
RenderScene();
```

這段程式碼省略了一些細節，但它會讓你對陰影貼圖有個大致的了解。這裡需要特別注意的是對 `glViewport` 的呼叫。因為陰影貼圖的解析度通常與我們最初渲染場景的解析度（通常是視窗解析度）不同，所以我們需要更改視埠（viewport）參數以適應陰影貼圖的大小。如果我們忘記更新視埠參數，最終的深度貼圖將會不完整或過小。

### 光源空間變換

前面程式碼片段中一個未知的部分是 `ConfigureShaderAndMatrices` 函式。在第二個階段，這都是老樣子：確保設定了正確的投影和視圖矩陣，並為每個物體設定相關的模型矩陣。然而，在第一個階段中，我們需要使用不同的投影和視圖矩陣來從光源的角度渲染場景。

由於我們正在模擬一個定向光源，它的所有光線都是平行的。因此，我們將為光源使用一個正交投影矩陣，其中沒有透視變形：

```cpp
float near_plane = 1.0f, far_plane = 7.5f;
glm::mat4 lightProjection = glm::ortho(-10.0f, 10.0f, -10.0f, 10.0f, near_plane, far_plane);
```

這是本章示範場景中使用的一個正交投影矩陣範例。由於投影矩陣間接決定了可見範圍（例如，什麼不會被裁剪），你需要確保投影截錐體（frustum）的大小正確地包含了你希望出現在深度貼圖中的物件。如果物件或片段不在深度貼圖中，它們將不會產生陰影。

為了創建一個視圖矩陣來轉換每個物件，使它們從光源的角度可見，我們將使用著名的 `glm::lookAt` 函式；這次使用光源的位置看向場景中心。

```cpp
glm::mat4 lightView = glm::lookAt(glm::vec3(-2.0f, 4.0f, -1.0f),
                                  glm::vec3( 0.0f, 0.0f,  0.0f),
                                  glm::vec3( 0.0f, 1.0f,  0.0f));
```

將這兩者結合起來，我們就得到了一個光源空間變換矩陣，它可以將每個世界空間向量轉換為從光源角度可見的空間；這正是我們渲染深度貼圖所需要的。

```cpp
glm::mat4 lightSpaceMatrix = lightProjection * lightView;
```

這個 `lightSpaceMatrix` 就是我們之前表示為 $T$ 的變換矩陣。有了這個 `lightSpaceMatrix`，我們就可以像往常一樣渲染場景，只要我們給每個著色器（shader）傳遞投影和視圖矩陣的光源空間等效值即可。然而，我們只關心深度值，而不關心所有昂貴的片段（光照）計算。為了節省效能，我們將使用一個不同的但更簡單的著色器來渲染到深度貼圖。

### 渲染到深度貼圖

當我們從光源的角度渲染場景時，我們更希望使用一個簡單的著色器，它只將頂點轉換到光源空間，而不需要做太多其他事情。對於這樣一個名為 `simpleDepthShader` 的簡單著色器，我們將使用以下頂點著色器：

```glsl
#version 330 core
layout (location = 0) in vec3 aPos;

uniform mat4 lightSpaceMatrix;
uniform mat4 model;

void main()
{
    gl_Position = lightSpaceMatrix * model * vec4(aPos, 1.0);
}
```

這個頂點著色器接收一個每個物件的模型、一個頂點，並使用 `lightSpaceMatrix` 將所有頂點轉換到光源空間。

由於我們沒有顏色緩衝區，並且禁用了繪圖和讀取緩衝區，因此生成的片段不需要任何處理，所以我們可以直接使用一個空的片段著色器：

```glsl
#version 330 core

void main()
{
    // gl_FragDepth = gl_FragCoord.z;
}
```

這個空的片段著色器沒有做任何處理，在它執行結束時，深度緩衝區就會被更新。我們可以透過取消其單行的註解來明確設定深度，但這實際上無論如何都會在幕後發生。

現在，渲染深度/陰影貼圖實際上變成了：

```cpp
simpleDepthShader.use();
glUniformMatrix4fv(lightSpaceMatrixLocation, 1, GL_FALSE, glm::value_ptr(lightSpaceMatrix));

glViewport(0, 0, SHADOW_WIDTH, SHADOW_HEIGHT);
glBindFramebuffer(GL_FRAMEBUFFER, depthMapFBO);
    glClear(GL_DEPTH_BUFFER_BIT);
    RenderScene(simpleDepthShader);
glBindFramebuffer(GL_FRAMEBUFFER, 0);
```

這裡的 `RenderScene` 函式接受一個著色器程式，呼叫所有相關的繪圖函式並在必要時設定對應的模型矩陣。

結果就是一個填充良好的深度緩衝區，其中包含從光源角度看每個可見片段的最近深度。透過將這個紋理渲染到一個填滿螢幕的 2D 四邊形上（類似於我們在[幀緩衝區](https://learnopengl.com/Advanced-OpenGL/Framebuffers)章節末尾的後處理部分所做的那樣），我們將得到類似這樣的結果：

![](https://learnopengl.com/img/advanced-lighting/shadow_mapping_depth_map.png)

為了將深度貼圖渲染到四邊形上，我們使用了以下片段著色器：

```glsl
#version 330 core
out vec4 FragColor;

in vec2 TexCoords;

uniform sampler2D depthMap;

void main()
{
    float depthValue = texture(depthMap, TexCoords).r;
    FragColor = vec4(vec3(depthValue), 1.0);
}
```

請注意，使用透視投影矩陣顯示深度時會有一些細微的變化，因為透視投影下的深度是非線性的。本章結尾我們將討論這些細微差異。

你可以在[這裡](https://learnopengl.com/code_viewer_gh.php?code=src/5.advanced_lighting/3.1.1.shadow_mapping_depth/shadow_mapping_depth.cpp)找到將場景渲染到深度貼圖的原始碼。

## 渲染陰影

有了正確生成的深度貼圖，我們就可以開始渲染實際的陰影了。檢查片段是否在陰影中的程式碼（很明顯地）在片段著色器中執行，但我們在頂點著色器中進行光源空間變換：

```glsl
#version 330 core
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec3 aNormal;
layout (location = 2) in vec2 aTexCoords;

out VS_OUT {
    vec3 FragPos;
    vec3 Normal;
    vec2 TexCoords;
    vec4 FragPosLightSpace;
} vs_out;

uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;
uniform mat4 lightSpaceMatrix;

void main()
{
    vs_out.FragPos = vec3(model * vec4(aPos, 1.0));
    vs_out.Normal = transpose(inverse(mat3(model))) * aNormal;
    vs_out.TexCoords = aTexCoords;
    vs_out.FragPosLightSpace = lightSpaceMatrix * vec4(vs_out.FragPos, 1.0);
    gl_Position = projection * view * vec4(vs_out.FragPos, 1.0);
}
```

這裡的新內容是額外的輸出向量 `FragPosLightSpace`。我們使用相同的 `lightSpaceMatrix`（在深度貼圖階段用於將頂點轉換到光源空間），並將世界空間的頂點位置轉換到光源空間，以便在片段著色器中使用。

我們將用於渲染場景的主要片段著色器採用 Blinn-Phong 光照模型。在片段著色器中，我們會計算一個 `shadow` 值，當片段在陰影中時為 `1.0`，不在陰影中時為 `0.0`。然後，將計算出的 `diffuse` 和 `specular` 分量乘以這個陰影分量。由於陰影很少是完全黑暗的（因為光線散射），我們將 `ambient` 分量排除在陰影乘法之外。

```glsl
#version 330 core
out vec4 FragColor;

in VS_OUT {
    vec3 FragPos;
    vec3 Normal;
    vec2 TexCoords;
    vec4 FragPosLightSpace;
} fs_in;

uniform sampler2D diffuseTexture;
uniform sampler2D shadowMap;

uniform vec3 lightPos;
uniform vec3 viewPos;

float ShadowCalculation(vec4 fragPosLightSpace)
{
    [...]
}

void main()
{
    vec3 color = texture(diffuseTexture, fs_in.TexCoords).rgb;
    vec3 normal = normalize(fs_in.Normal);
    vec3 lightColor = vec3(1.0);
    // ambient
    vec3 ambient = 0.15 * lightColor;
    // diffuse
    vec3 lightDir = normalize(lightPos - fs_in.FragPos);
    float diff = max(dot(lightDir, normal), 0.0);
    vec3 diffuse = diff * lightColor;
    // specular
    vec3 viewDir = normalize(viewPos - fs_in.FragPos);
    float spec = 0.0;
    vec3 halfwayDir = normalize(lightDir + viewDir);
    spec = pow(max(dot(normal, halfwayDir), 0.0), 64.0);
    vec3 specular = spec * lightColor;
    // calculate shadow
    float shadow = ShadowCalculation(fs_in.FragPosLightSpace);
    vec3 lighting = (ambient + (1.0 - shadow) * (diffuse + specular)) * color;

    FragColor = vec4(lighting, 1.0);
}
```

這個片段著色器基本上是我們在[進階光照](https://learnopengl.com/Advanced-Lighting/Advanced-Lighting)章節中使用過的副本，但增加了一個陰影計算。我們宣告了一個 `ShadowCalculation` 函式，它負責大部分的陰影工作。在片段著色器的末尾，我們將漫反射和鏡面反射的貢獻乘以 `shadow` 分量的倒數，也就是片段**不在**陰影中的程度。這個片段著色器將光照空間中的片段位置和從第一個渲染階段生成的深度貼圖作為額外輸入。

檢查片段是否在陰影中的第一件事，是將光照空間中的片段位置從裁剪空間轉換為標準化設備座標。當我們在頂點著色器中將裁剪空間的頂點位置輸出到 `gl_Position` 時，OpenGL 會自動執行透視除法，例如透過將 `x`、`y` 和 `z` 分量除以向量的 `w` 分量，將裁剪空間座標從 `[-w, w]` 範圍轉換到 `[-1, 1]` 範圍。由於裁剪空間的 `FragPosLightSpace` 並未透過 `gl_Position` 傳遞到片段著色器，我們必須自己執行這個透視除法：

```glsl
float ShadowCalculation(vec4 fragPosLightSpace)
{
    // perform perspective divide
    vec3 projCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;
    [...]
}
```

這會回傳片段在光照空間中的位置，範圍為 `[-1, 1]`。

{% include box.html content="
當使用正交投影矩陣時，頂點的 `w` 分量保持不變，因此這一步實際上意義不大。然而，當使用透視投影時，這一步是必要的，所以保留這行程式碼可以確保它同時適用於兩種投影矩陣。
" color="green" %}

因為深度貼圖中的深度值範圍為 `[0, 1]`，而且我們也想使用 `projCoords` 從深度貼圖取樣，所以我們將 NDC 座標轉換到 `[0, 1]` 範圍：

```glsl
projCoords = projCoords * 0.5 + 0.5;
```

有了這些投影座標，我們就可以對深度貼圖進行取樣，因為 `projCoords` 產生的 `[0,1]` 座標直接對應於第一次渲染時的 NDC 轉換座標。這給了我們從光源角度看的最接近深度：

```glsl
float closestDepth = texture(shadowMap, projCoords.xy).r;
```

為了獲得此片段的當前深度，我們只需檢索投影向量的 `z` 座標，該座標等於此片段從光源角度看的深度。

```glsl
float currentDepth = projCoords.z;
```

實際的比較就是簡單地檢查 `currentDepth` 是否大於 `closestDepth`，如果是，則片段處於陰影中：

```glsl
float shadow = currentDepth > closestDepth ? 1.0 : 0.0;
```

完整的 `ShadowCalculation` 函式因此變為：

```glsl
float ShadowCalculation(vec4 fragPosLightSpace)
{
    // perform perspective divide
    vec3 projCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;
    // transform to [0,1] range
    projCoords = projCoords * 0.5 + 0.5;
    // get closest depth value from light's perspective (using [0,1] range fragPosLight as coords)
    float closestDepth = texture(shadowMap, projCoords.xy).r;
    // get depth of current fragment from light's perspective
    float currentDepth = projCoords.z;
    // check whether current frag pos is in shadow
    float shadow = currentDepth > closestDepth  ? 1.0 : 0.0;

    return shadow;
}
```

啟用這個著色器，綁定適當的紋理，並在第二個渲染階段中啟用預設的投影和視圖矩陣，應該會給你類似於下面圖片的結果：

![](https://learnopengl.com/img/advanced-lighting/shadow_mapping_shadows.png)

如果你操作正確，確實應該能看到地板和立方體上的陰影（儘管帶有不少瑕疵）。你可以在[這裡](https://learnopengl.com/code_viewer_gh.php?code=src/5.advanced_lighting/3.1.2.shadow_mapping_base/shadow_mapping_base.cpp)找到示範應用程式的原始碼。

## 改進陰影貼圖

我們已經成功地讓陰影貼圖的基本功能運作起來，但正如你所見，由於陰影貼圖相關的一些（清晰可見的）瑕疵，我們還沒達到理想效果，需要修正。在接下來的章節中，我們將專注於修復這些瑕疵。

### 陰影痤瘡 (Shadow Acne)

從上一張圖片可以明顯看出有些地方不對勁。進一步放大後，我們可以看到非常明顯的莫列波紋（Moiré-like pattern）：

![](https://learnopengl.com/img/advanced-lighting/shadow_mapping_acne.png)

我們可以看到地板四邊形的大部分區域都渲染出明顯的黑色線條，呈交替排列。這種陰影貼圖的瑕疵稱為「陰影痤瘡」（shadow acne），可以用下圖來解釋：

![](https://learnopengl.com/img/advanced-lighting/shadow_mapping_acne_diagram.png)

由於陰影貼圖的解析度有限，當多個片段距離光源相對較遠時，它們可能會從深度貼圖中取樣到相同的值。圖片顯示了地板，其中每個黃色的傾斜面板代表深度貼圖的一個紋素（texel）。如你所見，多個片段取樣了相同的深度樣本。

雖然這通常沒問題，但當光源以某個角度照射到表面時，這就成了一個問題，因為在這種情況下，深度貼圖也會以傾斜的角度渲染。然後，多個片段會存取同一個傾斜的深度紋素，而其中有些片段位於地板上方，有些則位於地板下方；這會導致陰影的不一致。因此，有些片段被認為在陰影中，有些則不在，從而產生圖片中的條紋圖案。

我們可以透過一個稱為**陰影偏移（shadow bias）**的小技巧來解決這個問題，我們只需將表面的深度（或陰影貼圖）偏移一個很小的量，這樣片段就不會被錯誤地認為在表面之上。

![](https://learnopengl.com/img/advanced-lighting/shadow_mapping_acne_bias.png)

在應用偏移後，所有樣本的深度都小於表面的深度，因此整個表面都被正確地照亮，沒有任何陰影。我們可以這樣實現這種偏移：

```glsl
float bias = 0.005;
float shadow = currentDepth - bias > closestDepth  ? 1.0 : 0.0;
```

`0.005` 的陰影偏移在很大程度上解決了我們場景中的問題，但你可以想像偏移值高度依賴於光源和表面之間的角度。如果表面與光源的角度很陡峭，陰影可能仍然會出現陰影痤瘡。一個更穩健的方法是根據表面與光源的角度來改變偏移量：這可以用點積來解決：

```glsl
float bias = max(0.05 * (1.0 - dot(normal, lightDir)), 0.005);
```

這裡我們根據表面的法線和光源方向，設定了最大偏移量為 `0.05`，最小偏移量為 `0.005`。這樣一來，像地板這種幾乎與光源垂直的表面會得到較小的偏移，而像立方體側邊這種表面則會得到更大的偏移。下圖顯示了相同的場景，但現在帶有陰影偏移：

![](https://learnopengl.com/img/advanced-lighting/shadow_mapping_with_bias.png)

選擇正確的偏移值需要一些微調，因為每個場景都會不同，但大多數時候，這只是緩慢增加偏移量直到所有陰影痤瘡都消除的問題。

### 彼得潘症候群 (Peter Panning)

使用陰影偏移的一個缺點是，你對物體的實際深度應用了一個偏移量。結果，偏移量可能會變得足夠大，導致陰影相對於實際物體位置出現可見的偏移，如下所示（使用誇張的偏移值）：

![](https://learnopengl.com/img/advanced-lighting/shadow_mapping_peter_panning.png)

這種陰影瑕疵被稱為「彼得潘症候群」（peter panning），因為物體看起來似乎與其陰影稍微「分離」了。我們可以使用一個小技巧來解決大部分的彼得潘問題，即在渲染深度貼圖時使用正向剔除（front face culling）。你可能還記得在[面剔除](https://learnopengl.com/Advanced-OpenGL/Face-Culling)章節中，OpenGL 預設剔除背面。透過在陰影貼圖階段告訴 OpenGL 我們要剔除正面，我們就將這個順序反轉了。

因為我們只需要深度貼圖的深度值，所以對於實心物體來說，無論我們是取其正面還是背面的深度都無關緊要。使用背面的深度並不會產生錯誤的結果，因為物體內部的陰影對我們來說並不重要；反正我們也看不到那裡。

![](https://learnopengl.com/img/advanced-lighting/shadow_mapping_culling.png)

為了修復彼得潘問題，我們在生成陰影貼圖時剔除所有正面。請注意，您需要先啟用 `GL_CULL_FACE`。

```cpp
glCullFace(GL_FRONT);
RenderSceneToDepthMap();
glCullFace(GL_BACK); // don't forget to reset original culling face
```

這有效地解決了彼得潘問題，但**僅適用於**那些確實有內部且沒有開口的**實心**物體。例如，在我們的場景中，這在立方體上運作良好。然而，在地板上則不然，因為剔除正面會完全移除地板。地板是一個單一平面，因此會被完全剔除。如果想用這個技巧解決彼得潘問題，必須注意只剔除那些有意義的物體的正面。

另一個考量是，靠近陰影接收器（例如遠處的立方體）的物體可能仍然會產生不正確的結果。然而，使用正常的偏移值通常可以避免彼得潘問題。

### 過度取樣 (Over Sampling)

另一個你可能喜歡或不喜歡的視覺差異是，光源可視截錐體（frustum）之外的區域會被視為陰影，而實際上它們（通常）並非如此。發生這種情況的原因是，光源截錐體之外的投影座標會大於 `1.0`，因此會從深度紋理的預設範圍 `[0,1]` 之外取樣。根據紋理的環繞方式，我們將得到不基於光源真實深度值的不正確深度結果。

![](https://learnopengl.com/img/advanced-lighting/shadow_mapping_outside_frustum.png)

您可以在圖像中看到某種假想的光線區域，以及該區域外部很大一部分處於陰影中；這個區域代表了投影到地板上的深度貼圖的大小。發生這種情況的原因是我們之前將深度貼圖的環繞選項設定為 `GL_REPEAT`。

我們更希望的是，深度貼圖範圍之外的所有座標都具有 `1.0` 的深度，這導致這些座標永遠不會處於陰影中（因為沒有物體的深度會大於 `1.0`）。我們可以透過配置紋理邊界顏色並將深度貼圖的紋理環繞選項設定為 `GL_CLAMP_TO_BORDER` 來實現這一點：

```cpp
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_BORDER);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_BORDER);
float borderColor[] = { 1.0f, 1.0f, 1.0f, 1.0f };
glTexParameterfv(GL_TEXTURE_2D, GL_TEXTURE_BORDER_COLOR, borderColor);
```

現在，每當我們在深度貼圖的 `[0,1]` 座標範圍之外取樣時，`texture` 函式將始終返回 `1.0` 的深度，產生 `0.0` 的 `shadow` 值。結果現在看起來更合理了：

![](https://learnopengl.com/img/advanced-lighting/shadow_mapping_clamp_edge.png)

這裡似乎還有一塊區域顯示為深色。這些是位於光源正交截錐體遠裁剪平面（far plane）之外的座標。您可以透過觀察陰影的方向，看到這個深色區域總是出現在光源截錐體的遠端。

當光源空間投影的片段座標的 `z` 座標大於 `1.0` 時，它就位於光源的遠裁剪平面之外。在這種情況下，`GL_CLAMP_TO_BORDER` 環繞方式就不再起作用了，因為我們將座標的 `z` 分量與深度貼圖值進行比較；對於 `z` 大於 `1.0` 的情況，這總是返回真。

解決這個問題也相對容易，我們只需在投影向量的 `z` 座標大於 `1.0` 時，強制 `shadow` 值為 `0.0`：

```glsl
float ShadowCalculation(vec4 fragPosLightSpace)
{
    [...]
    if(projCoords.z > 1.0)
        shadow = 0.0;

    return shadow;
}
```

檢查遠裁剪平面並將深度貼圖鉗制到手動指定的邊界顏色，解決了深度貼圖的過度取樣問題。這最終給了我們想要的效果：

![](https://learnopengl.com/img/advanced-lighting/shadow_mapping_over_sampling_fixed.png)

所有這些結果意味著我們只在投影片段座標位於深度貼圖範圍內的地方才有陰影，因此光錐（light frustum）之外的任何東西都不會有可見的陰影。由於遊戲通常會確保這種情況只發生在遠處，因此它比我們之前明顯的黑色區域更為合理。

## PCF (Percentage-Closer Filtering)

目前的陰影為場景增添了不錯的效果，但仍然不是我們想要的。如果你放大陰影，陰影貼圖的解析度依賴性會很快變得明顯。

![](https://learnopengl.com/img/advanced-lighting/shadow_mapping_zoom.png)

由於深度貼圖具有固定的解析度，深度通常每個紋素（texel）會跨越多個片段。因此，多個片段從深度貼圖取樣到相同的深度值，並得出相同的陰影結論，這會產生這些鋸齒狀的塊狀邊緣。

您可以透過增加深度貼圖解析度，或嘗試將光源截錐體盡可能緊密地貼合場景來減少這些塊狀陰影。

另一種（部分）解決這些鋸齒狀邊緣的方法稱為 PCF，即「百分比接近度過濾」（`percentage-closer filtering`），這是一個包含許多不同過濾函數的術語，這些函數能產生**更柔和**的陰影，使其看起來不那麼塊狀或生硬。其思想是從深度貼圖中多次取樣，每次都使用稍微不同的紋理座標。對於每個單獨的樣本，我們檢查它是否在陰影中。然後將所有子結果組合並平均，我們就會得到一個看起來不錯的柔和陰影。

PCF 的一個簡單實作就是簡單地取樣深度貼圖周圍的紋素並平均結果：

```glsl
float shadow = 0.0;
vec2 texelSize = 1.0 / textureSize(shadowMap, 0);
for(int x = -1; x <= 1; ++x)
{
    for(int y = -1; y <= 1; ++y)
    {
        float pcfDepth = texture(shadowMap, projCoords.xy + vec2(x, y) * texelSize).r;
        shadow += currentDepth - bias > pcfDepth ? 1.0 : 0.0;
    }
}
shadow /= 9.0;
```

這裡的 `textureSize` 會回傳指定取樣器紋理在 mipmap 層級 `0` 的寬度和高度 `vec2`。用 1 除以它會得到單個紋素的大小，我們用它來偏移紋理座標，確保每個新取樣都能取樣到不同的深度值。在這裡，我們取樣投影座標 `x` 和 `y` 值周圍的 9 個值，測試陰影遮蔽，最後將結果除以取樣的總數來取平均值。

透過使用更多的取樣和/或改變 `texelSize` 變數，你可以提高柔和陰影的品質。下面你可以看到應用了簡單 PCF 的陰影：

![](https://learnopengl.com/img/advanced-lighting/shadow_mapping_soft_shadows.png)

從遠處看，陰影看起來好多了，也沒那麼生硬。如果你放大看，仍然可以看到陰影貼圖的解析度瑕疵，但總體來說，這對於大多數應用程式來說都能提供不錯的效果。

你可以在[這裡](https://learnopengl.com/code_viewer_gh.php?code=src/5.advanced_lighting/3.1.3.shadow_mapping/shadow_mapping.cpp)找到這個範例的完整原始碼。

實際上，PCF 還有很多內容，也有不少技術可以顯著提高柔和陰影的品質，但為了本章的篇幅，我們將把這些留待以後討論。

## 正交投影 vs 透視投影

使用正交投影矩陣或透視投影矩陣渲染深度貼圖是不同的。正交投影矩陣不會用透視來變形場景，因此所有視圖/光源光線都是平行的。這使其成為定向光源的絕佳投影矩陣。然而，透視投影矩陣會根據透視來變形所有頂點，這會產生不同的結果。下圖顯示了兩種投影方法的不同陰影區域：

![](https://learnopengl.com/img/advanced-lighting/shadow_mapping_projection.png)

透視投影矩陣最適合用於具有實際位置的光源，而不是定向光源。透視投影通常用於聚光燈和點光源，而正交投影則用於定向光源。

另一個使用透視投影矩陣時的細微差別是，視覺化深度緩衝區時，結果通常會幾乎完全是白色的。這是因為透視投影會將深度轉換為非線性深度值，並且大多數可察覺的範圍都接近近裁剪平面。為了能夠正確地查看深度值，就像我們使用正交投影時一樣，你首先需要將非線性深度值轉換為線性深度值，就像我們在[深度測試](https://learnopengl.com/Advanced-OpenGL/Depth-testing)章節中討論的那樣：

```cpp
#version 330 core
out vec4 FragColor;

in vec2 TexCoords;

uniform sampler2D depthMap;
uniform float near_plane;
uniform float far_plane;

float LinearizeDepth(float depth)
{
    float z = depth * 2.0 - 1.0; // Back to NDC
    return (2.0 * near_plane * far_plane) / (far_plane + near_plane - z * (far_plane - near_plane));
}

void main()
{
    float depthValue = texture(depthMap, TexCoords).r;
    FragColor = vec4(vec3(LinearizeDepth(depthValue) / far_plane), 1.0); // perspective
    // FragColor = vec4(vec3(depthValue), 1.0); // orthographic
}
```

這顯示了與正交投影相似的深度值。請注意，這僅對除錯有用；無論使用正交還是透視矩陣，深度檢查保持不變，因為相對深度不會改變。

## Additional resources

- [Tutorial 16 : Shadow mapping](http://www.opengl-tutorial.org/intermediate-tutorials/tutorial-16-shadow-mapping/): 來自 opengl-tutorial.org 的類似陰影貼圖教學，並附上一些額外說明
- [Shadow Mapping - Part 1](http://ogldev.atspace.co.uk/www/tutorial23/tutorial23.html): another shadow mapping tutorial by ogldev.
- [How Shadow Mapping Works](https://www.youtube.com/watch?v=EsccgeUpdsM): TheBennyBox 製作的三部曲 YouTube 教學，介紹陰影貼圖及其實作方法。
- [Common Techniques to Improve Shadow Depth Maps](https://msdn.microsoft.com/en-us/library/windows/desktop/ee416324%28v=vs.85%29.aspx): 一篇由微軟撰寫的精彩文章，列出了大量用於提高陰影貼圖品質的技術。

- [How I Implemented Shadows in my Game Engine](https://www.youtube.com/watch?v=uueB2kVvbHo): ThinMatrix 關於改進陰影貼圖方法的精彩影片。
