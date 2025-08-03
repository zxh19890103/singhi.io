---
layout: bookdetail
chapter: 二十五
title: 高級 OpenGL &bull; Cubemaps
category: tech
src: "https://learnopengl.com/Advanced-OpenGL/Cubemaps"
date: 2025-06-30
math: 1
book: opengl
image: "https://learnopengl.com/img/advanced/cubemaps_sampling.png"
order: 25
lang: zh
glcate: Advanced-OpenGL
gltopic: Cubemaps
permalink: /opengl/Advanced-OpenGL/Cubemaps
---

我們已經使用 2D 紋理好一陣子了，但還有更多我們尚未探索的紋理類型。在本章中，我們將討論一種結合多個紋理為一體的紋理類型：`立方體貼圖 (cube map)`。

立方體貼圖是一種包含 6 個獨立 2D 紋理的紋理，每個紋理都構成立方體的一個側面：一個帶有紋理的立方體。你可能會好奇這種立方體有什麼用處？為什麼要費心將 6 個獨立紋理組合成一個實體，而不是直接使用 6 個獨立紋理呢？嗯，立方體貼圖具有一個有用的特性，就是可以使用方向向量來索引/採樣它。想像我們有一個 1x1x1 的單位立方體，方向向量的原點位於其中心。用一個橘色方向向量從立方體貼圖採樣紋理值看起來有點像這樣：

![](https://learnopengl.com/img/advanced/cubemaps_sampling.png)

{% include box.html content="方向向量的量值並不重要。只要提供一個方向，OpenGL 就會擷取該方向最終擊中的對應紋素，並返回正確採樣的紋理值。" color="green" %}

如果我們想像有一個立方體形狀，我們將這樣的立方體貼圖附加到它上面，這個方向向量將類似於立方體的（插值）局部頂點位置。這樣一來，只要立方體以原點為中心，我們就可以使用立方體的實際位置向量來採樣立方體貼圖。因此，在採樣立方體貼圖時，我們將立方體的所有頂點位置視為其紋理座標。結果是紋理座標可以存取立方體貼圖的適當獨立 `face` 紋理。

## 建立立方體貼圖

立方體貼圖與任何其他紋理一樣，因此要建立一個，我們生成一個紋理並在進行任何進一步的紋理操作之前將其綁定到適當的紋理目標。這次將其綁定到 `GL_TEXTURE_CUBE_MAP`：

```cpp
unsigned int textureID;
glGenTextures(1, &textureID);
glBindTexture(GL_TEXTURE_CUBE_MAP, textureID);
```

因為立方體貼圖包含 6 個紋理，每個面一個，我們必須呼叫 `glTexImage2D` 六次，其參數設定與前幾章相似。然而，這次我們必須將紋理 _target_ 參數設定為與立方體貼圖的特定面匹配，告訴 OpenGL 我們正在為立方體貼圖的哪一面建立紋理。這表示我們必須為立方體貼圖的每個面呼叫 `glTexImage2D` 一次。

由於我們有 6 個面，OpenGL 提供了 6 個特殊的紋理目標來針對立方體貼圖的一個面：

<div class="table">
<table><tbody><tr><th>紋理目標</th><th>方向</th></tr><tr><td><code>GL_TEXTURE_CUBE_MAP_POSITIVE_X</code></td><td>右</td></tr><tr><td><code>GL_TEXTURE_CUBE_MAP_NEGATIVE_X</code></td><td>左</td></tr><tr><td><code>GL_TEXTURE_CUBE_MAP_POSITIVE_Y</code></td><td>上</td></tr><tr><td><code>GL_TEXTURE_CUBE_MAP_NEGATIVE_Y</code></td><td>下</td></tr><tr><td><code>GL_TEXTURE_CUBE_MAP_POSITIVE_Z</code></td><td>後</td></tr><tr><td><code>GL_TEXTURE_CUBE_MAP_NEGATIVE_Z</code></td><td>前</td></tr></tbody></table>
</div>

如同許多 OpenGL 的列舉型別，它們幕後的 `int` 值是線性遞增的，因此如果我們有一個紋理位置的陣列或向量，我們可以從 `GL_TEXTURE_CUBE_MAP_POSITIVE_X` 開始並每次疊代將列舉型別遞增 1 來遍歷它們，有效地遍歷所有紋理目標：

```cpp
int width, height, nrChannels;
unsigned char *data;
for(unsigned int i = 0; i < textures_faces.size(); i++)
{
    data = stbi_load(textures_faces[i].c_str(), &width, &height, &nrChannels, 0);
    glTexImage2D(
        GL_TEXTURE_CUBE_MAP_POSITIVE_X + i,
        0, GL_RGB, width, height, 0, GL_RGB, GL_UNSIGNED_BYTE, data
    );
}
```

在這裡，我們有一個名為 `textures_faces` 的 `vector`，其中包含按表格中給定順序排列的所有立方體貼圖所需紋理的位置。這將為目前綁定的立方體貼圖的每個面生成一個紋理。

因為立方體貼圖就像任何其他紋理一樣，我們也會指定它的環繞和過濾方式：

```cpp
glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_WRAP_R, GL_CLAMP_TO_EDGE);
```

別被 `GL_TEXTURE_WRAP_R` 嚇到了，這只是設定紋理 `R` 座標的環繞方法，它對應於紋理的第三維（就像位置的 `z`）。我們將環繞方法設定為 `GL_CLAMP_TO_EDGE`，因為正好位於兩個面之間的紋理座標可能不會擊中確切的面（由於某些硬體限制），所以透過使用 `GL_CLAMP_TO_EDGE`，每當我們在面之間取樣時，OpenGL 總是返回它們的邊緣值。

然後，在繪製將使用立方體貼圖的物件之前，我們啟用相應的紋理單元並在渲染之前綁定立方體貼圖；與普通的 2D 紋理相比，沒有太大區別。

在片段著色器中，我們還必須使用不同類型的取樣器 `samplerCube`，我們使用 `texture` 函數從中取樣，但這次使用 `vec3` 方向向量而不是 `vec2`。使用立方體貼圖的片段著色器範例如下：

```cpp
in vec3 textureDir; // 表示 3D 紋理座標的方向向量
uniform samplerCube cubemap; // 立方體貼圖紋理取樣器

void main()
{
    FragColor = texture(cubemap, textureDir);
}
```

這仍然很棒，但是為什麼要費心呢？嗯，碰巧有很多有趣的技術使用立方體貼圖會更容易實現。其中一種技術是建立一個 `天空盒 (skybox)`。

## 天空盒

天空盒是一個（巨大）立方體，它包圍著整個場景，並包含 6 個周圍環境的圖像，讓玩家產生他所處的環境實際上比實際大得多的錯覺。遊戲中使用的天空盒的一些例子包括山脈、雲朵或繁星點點的夜空圖像。以下是第三款上古卷軸遊戲的截圖，其中展示了使用繁星點點的夜空圖像的天空盒：

![](https://learnopengl.com/img/advanced/cubemaps_morrowind.jpg)

您大概已經猜到，像這樣的天空盒非常適合立方體貼圖：我們有一個六面的立方體，需要為每個面貼上紋理。在上一張圖片中，他們使用了幾張夜空圖像，給玩家營造了一種身處廣闊宇宙的錯覺，而他實際上只身處一個小小的盒子中。

網路上通常有足夠的資源可以找到這樣的天空盒。這些天空盒圖片通常具有以下模式：

![](https://learnopengl.com/img/advanced/cubemaps_skybox.png)

如果將這 6 個面摺疊成一個立方體，您將得到一個完全紋理化的立方體，它模擬了一個大型景觀。有些資源提供此類格式的天空盒，在這種情況下，您必須手動提取 6 個面圖像，但在大多數情況下，它們以 6 個單個紋理圖像的形式提供。

我們將使用這個特定的（高品質）天空盒用於我們的場景，可以從[這裡](https://learnopengl.com/img/textures/skybox.zip)下載。

### 載入天空盒

由於天空盒本身就是一個立方體貼圖，因此載入天空盒與本章開頭所見的沒有太大區別。為了載入天空盒，我們將使用以下函數，該函數接受一個包含 6 個紋理位置的 `vector`：

```cpp
unsigned int loadCubemap(vector<std::string> faces)
{
    unsigned int textureID;
    glGenTextures(1, &textureID);
    glBindTexture(GL_TEXTURE_CUBE_MAP, textureID);

    int width, height, nrChannels;
    for (unsigned int i = 0; i < faces.size(); i++)
    {
        unsigned char *data = stbi_load(faces[i].c_str(), &width, &height, &nrChannels, 0);
        if (data)
        {
            glTexImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_X + i,
                         0, GL_RGB, width, height, 0, GL_RGB, GL_UNSIGNED_BYTE, data
            );
            stbi_image_free(data);
        }
        else
        {
            std::cout << "Cubemap tex failed to load at path: " << faces[i] << std::endl;
            stbi_image_free(data);
        }
    }
    glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
    glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
    glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_WRAP_R, GL_CLAMP_TO_EDGE);

    return textureID;
}
```

這個函數本身應該不會太令人驚訝。它基本上是我們在上一節中看到的所有立方體貼圖程式碼，但合併在一個單一可管理的函數中。

現在，在我們呼叫這個函數之前，我們將按照立方體貼圖列舉所指定的順序，將適當的紋理路徑載入到一個向量中：

```cpp
vector<std::string> faces;
{
    "right.jpg",
    "left.jpg",
    "top.jpg",
    "bottom.jpg",
    "front.jpg",
    "back.jpg"
};
unsigned int cubemapTexture = loadCubemap(faces);
```

我們已將天空盒載入為立方體貼圖，其 ID 為 `cubemapTexture`。我們現在終於可以將它綁定到立方體，以取代我們一直以來使用的那個遜斃的清除顏色了。

### 顯示天空盒

因為天空盒是繪製在一個立方體上的，所以我們需要另一個 VAO、VBO 和一組新的頂點，就像任何其他 3D 物件一樣。您可以從[這裡](https://learnopengl.com/code_viewer.php?code=advanced/cubemaps_skybox_data)取得其頂點資料。

用於為 3D 立方體貼圖的立方體貼圖可以使用立方體的局部位置作為其紋理座標進行採樣。當立方體以原點 (0,0,0) 為中心時，其每個位置向量也是從原點發出的方向向量。這個方向向量正是我們在該特定立方體位置處獲取相應紋理值所需的。因此，我們只需要提供位置向量，而不需要紋理座標。

為了渲染天空盒，我們需要一套新的著色器，它們並不太複雜。因為我們只有一個頂點屬性，所以頂點著色器相當簡單：

```cpp
#version 330 core
layout (location = 0) in vec3 aPos;

out vec3 TexCoords;

uniform mat4 projection;
uniform mat4 view;

void main()
{
    TexCoords = aPos;
    gl_Position = projection * view * vec4(aPos, 1.0);
}
```

這個頂點著色器有趣的部分是，我們將傳入的局部位置向量設定為傳出的紋理座標，以便在片段著色器中（插值）使用。然後片段著色器將這些作為輸入來採樣 `samplerCube`：

```cpp
#version 330 core
out vec4 FragColor;

in vec3 TexCoords;

uniform samplerCube skybox;

void main()
{
    FragColor = texture(skybox, TexCoords);
}
```

片段著色器相對簡單。我們將頂點屬性的插值位置向量作為紋理的方向向量，並使用它從立方體貼圖中採樣紋理值。

現在我們有了立方體貼圖紋理，渲染天空盒就很簡單了，我們只需綁定立方體貼圖紋理，`skybox` 採樣器就會自動填充天空盒立方體貼圖。為了繪製天空盒，我們將它繪製為場景中的第一個物件並禁用深度寫入。這樣，天空盒將始終繪製在所有其他物件的背景中，因為單位立方體很可能比場景的其餘部分小。

```cpp
glDepthMask(GL_FALSE);
skyboxShader.use();
// ... set view and projection matrix
glBindVertexArray(skyboxVAO);
glBindTexture(GL_TEXTURE_CUBE_MAP, cubemapTexture);
glDrawArrays(GL_TRIANGLES, 0, 36);
glDepthMask(GL_TRUE);
// ... draw rest of the scene
```

然而，如果您運行此程式碼，您將會遇到困難。我們希望天空盒以玩家為中心，這樣無論玩家移動多遠，天空盒都不會更靠近，給人一種周圍環境極其巨大的印象。然而，當前的視圖矩陣會旋轉、縮放和平移所有天空盒的位置，因此如果玩家移動，立方體貼圖也會移動！我們希望移除視圖矩陣的平移部分，這樣只有旋轉會影響天空盒的位置向量。

您可能還記得在[基本光照](/opengl/Lighting/Basic-Lighting)章節中，我們可以透過從 4x4 矩陣中取出左上角 3x3 矩陣來移除轉換矩陣的平移部分。我們可以透過將視圖矩陣轉換為 3x3 矩陣（移除平移）並將其轉換回 4x4 矩陣來實現此目的：

```cpp
glm::mat4 view = glm::mat4(glm::mat3(camera.GetViewMatrix()));
```

這會移除所有平移，但會保留所有旋轉轉換，因此使用者仍然可以環顧場景。

結果是場景由於我們的天空盒而立即看起來非常巨大。如果您繞著基本容器飛行，您會立即感受到尺度感，這大大提高了場景的真實感。結果看起來像這樣：

![](https://learnopengl.com/img/advanced/cubemaps_skybox_result.png)

嘗試使用不同的天空盒，看看它們如何對場景的外觀和感覺產生巨大影響。

### 優化

目前我們是先渲染天空盒，然後才渲染場景中的所有其他物件。這樣做效果很好，但效率不高。如果我們首先渲染天空盒，我們將為螢幕上的每個像素運行片段著色器，即使最終只有一小部分天空盒可見；這些片段本來可以透過 `早期深度測試 (early depth testing)` 輕鬆捨棄，為我們節省寶貴的頻寬。

所以為了稍微提升性能，我們將最後渲染天空盒。這樣，深度緩衝區將完全填充所有場景的深度值，所以我們只需要在早期深度測試通過的地方渲染天空盒的片段，大大減少了片段著色器調用次數。問題是天空盒很可能會渲染在所有其他物件之上，因為它只是一個 1x1x1 的立方體，會通過大多數深度測試。簡單地不進行深度測試就渲染它並不是一個解決方案，因為天空盒在最後渲染時仍然會覆蓋場景中的所有其他物件。我們需要欺騙深度緩衝區，讓它相信天空盒具有最大的深度值 `1.0`，這樣當它前面有不同的物件時，它就會無法通過深度測試。

在[座標系統](/opengl/Getting-started/Coordinate-Systems)章節中，我們提到 _透視除法 (perspective division)_ 在頂點著色器執行後進行，將 `gl_Position` 的 `xyz` 座標除以其 `w` 分量。我們也從[深度測試](/opengl/Advanced-OpenGL/Depth-testing)章節中得知，結果除法的 `z` 分量等於該頂點的深度值。利用這些資訊，我們可以將輸出位置的 `z` 分量設定為等於其 `w` 分量，這將導致 `z` 分量始終等於 `1.0`，因為當應用透視除法時，其 `z` 分量轉換為 `w` / `w` = `1.0`：

```cpp
void main()
{
    TexCoords = aPos;
    vec4 pos = projection * view * vec4(aPos, 1.0);
    gl_Position = pos.xyww;
}
```

這樣一來，最終的 _正規化裝置座標 (normalized device coordinates)_ 的 `z` 值將始終等於 `1.0`：也就是最大深度值。因此，天空盒只會在沒有可見物件的地方渲染（只有這樣它才能通過深度測試，其他一切都在天空盒前面）。

我們確實必須稍微改變深度函數，將其設定為 `GL_LEQUAL` 而不是預設的 `GL_LESS`。深度緩衝區將填充天空盒的 `1.0` 值，因此我們需要確保天空盒通過深度測試的值是 _小於或等於_ 深度緩衝區的值，而不是 _小於_。

您可以在[這裡](https://learnopengl.com/code_viewer_gh.php?code=src/4.advanced_opengl/6.1.cubemaps_skybox/cubemaps_skybox.cpp)找到更優化版本的原始碼。

## 環境貼圖

我們現在已將整個周圍環境映射到單一紋理物件中，並且我們可以利用這些資訊不僅僅用於天空盒。利用帶有環境的立方體貼圖，我們可以賦予物件反射或折射的特性。像這樣使用環境立方體貼圖的技術稱為 `環境貼圖 (environment mapping)` 技術，其中兩種最受歡迎的是 `反射 (reflection)` 和 `折射 (refraction)`。

### 反射

反射是一種性質，指物體（或物體的一部分）`反射`其周圍環境，例如物體的顏色或多或少地與其環境相等，取決於觀察者的角度。例如，鏡子就是一個反射物體：它根據觀察者的角度反射其周圍環境。

反射的基本原理並不難。下圖顯示了如何計算 `反射向量 (reflection vector)` 並使用該向量從立方體貼圖採樣：

![](https://learnopengl.com/img/advanced/cubemaps_reflection_theory.png)

我們根據視線方向向量 \\(\\color{gray}{\\bar{I}}\\) 計算圍繞物體法向量 \\(\\color{red}{\\bar{N}}\\) 的反射向量 \\(\\color{green}{\\bar{R}}\\) 。我們可以使用 GLSL 的內建函數 `reflect` 計算此反射向量。所得向量 \\(\\color{green}{\\bar{R}}\\) 然後用作索引/採樣立方體貼圖的方向向量，返回環境的顏色值。最終效果是物體似乎反射了天空盒。

既然我們已經在場景中設置了天空盒，那麼創建反射就不會太困難了。我們將更改容器使用的片段著色器，以賦予容器反射屬性：

```cpp
#version 330 core
out vec4 FragColor;

in vec3 Normal;
in vec3 Position;

uniform vec3 cameraPos;
uniform samplerCube skybox;

void main()
{
    vec3 I = normalize(Position - cameraPos);
    vec3 R = reflect(I, normalize(Normal));
    FragColor = vec4(texture(skybox, R).rgb, 1.0);
}
```

我們首先計算視圖/攝影機方向向量 `I`，並用它來計算反射向量 `R`，然後我們用 `R` 從天空盒立方體貼圖中取樣。請注意，我們再次擁有片段的插值 `Normal` 和 `Position` 變數，因此我們也需要調整頂點著色器：

```cpp
#version 330 core
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec3 aNormal;

out vec3 Normal;
out vec3 Position;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

void main()
{
    Normal = mat3(transpose(inverse(model))) * aNormal;
    Position = vec3(model * vec4(aPos, 1.0));
    gl_Position = projection * view * vec4(Position, 1.0);
}
```

我們正在使用法向量，因此我們將再次使用法向量矩陣轉換它們。`Position` 輸出向量是世界空間位置向量。頂點著色器的這個 `Position` 輸出用於在片段著色器中計算視圖方向向量。

因為我們正在使用法線，所以您會想要更新[頂點資料](https://learnopengl.com/code_viewer.php?code=lighting/basic_lighting_vertex_data)並更新屬性指標。同時也要確保設定 `cameraPos` uniform。

然後我們也要在渲染容器之前綁定立方體貼圖紋理：

```cpp
glBindVertexArray(cubeVAO);
glBindTexture(GL_TEXTURE_CUBE_MAP, skyboxTexture);
glDrawArrays(GL_TRIANGLES, 0, 36);
```

編譯並執行您的程式碼，您會得到一個像完美鏡子一樣的容器。周圍的天空盒完美地反射在容器上：

![](https://learnopengl.com/img/advanced/cubemaps_reflection.png)

您可以在[這裡](https://learnopengl.com/code_viewer_gh.php?code=src/4.advanced_opengl/6.2.cubemaps_environment_mapping/cubemaps_environment_mapping.cpp)找到完整的原始碼。

當反射應用於整個物件（如容器）時，物件看起來就像是具有高反射材料，例如鋼或鉻。如果我們載入一個更有趣的物件（如[模型載入](/opengl/Model-Loading/Model)章節中的背包模型），我們會得到物件看起來完全由鉻製成的效果：

![](https://learnopengl.com/img/advanced/cubemaps_reflection_nanosuit.png)

這看起來很棒，但實際上大多數模型並非完全反射。我們可引進 `反射貼圖 (reflection maps)` 來為模型增加額外的細節層次。就像漫射和鏡面貼圖一樣，反射貼圖是紋理圖像，我們可以對其進行取樣以確定片段的反射率。透過這些反射貼圖，我們可以確定模型的哪些部分顯示反射以及反射強度。

### 折射

另一種環境貼圖的形式稱為 `折射 (refraction)`，與反射相似。折射是光線由於穿過材料的變化而改變方向的性質。折射是我們通常在水狀表面看到的情況，光線不會直接穿過，而是稍微彎曲。這就像看著你的手臂半伸入水中一樣。

折射由[史涅爾定律](http://en.wikipedia.org/wiki/Snell%27s_law)描述，其與環境貼圖結合看起來像這樣：

![](https://learnopengl.com/img/advanced/cubemaps_refraction_theory.png)

同樣地，我們有一個視線向量 \\(\\color{gray}{\\bar{I}}\\)、一個法線向量 \\(\\color{red}{\\bar{N}}\\) ，而這次有一個結果的折射向量 \\(\\color{green}{\\bar{R}}\\) 。如你所見，視線向量的方向稍微彎曲。這個結果的彎曲向量 \\(\\color{green}{\\bar{R}}\\) 然後用來從立方體貼圖中取樣。

使用 GLSL 內建的 `refract` 函數來實現折射相當容易，該函數需要一個法向量、一個視線方向以及兩種材料的`折射率`之間的比率。

折射率決定了光線在材料中扭曲/彎曲的程度，每種材料都有自己的折射率。以下表格列出了最常見的折射率：

<div class="table">
<table><tbody><tr><th>材質</th><th>折射率</th></tr><tr><td>空氣</td><td>1.00</td></tr><tr><td>水</td><td>1.33</td></tr><tr><td>冰</td><td>1.309</td></tr><tr><td>玻璃</td><td>1.52</td></tr><tr><td>鑽石</td><td>2.42</td></tr></tbody></table>
</div>

我們使用這些折射率來計算光線穿過兩種材料之間的比率。在我們的案例中，光線/視線射線從 _空氣_ 進入 _玻璃_ (如果我們假設物件由玻璃製成)，因此比率變為 \\(\\frac{1.00}{1.52} = 0.658\\)。

我們已經綁定了立方體貼圖，提供了帶有法線的頂點資料，並將攝影機位置設定為均勻變數。我們唯一需要更改的是片段著色器：

```cpp
void main()
{
    float ratio = 1.00 / 1.52;
    vec3 I = normalize(Position - cameraPos);
    vec3 R = refract(I, normalize(Normal), ratio);
    FragColor = vec4(texture(skybox, R).rgb, 1.0);
}
```

透過改變折射率，您可以創造出完全不同的視覺效果。然而，在容器物件上編譯並執行結果並不是很令人感興趣，因為它並沒有真正顯示折射所產生的效果，除了它現在充當放大鏡。但是，在載入的 3D 模型上使用相同的著色器確實顯示了我們正在尋找的效果：一個玻璃狀的物件。

![](https://learnopengl.com/img/advanced/cubemaps_refraction.png)

您可以想像，透過正確的光照、反射、折射和頂點移動組合，您可以創造出非常精美的水面圖形。請注意，為了獲得物理上精確的結果，當光線離開物件時，我們應該**再次**折射光線；現在我們只是簡單地使用了單面折射，這對於大多數目的來說已經足夠了。

### 動態環境貼圖

目前我們一直使用靜態圖像組合作為天空盒，這看起來很棒，但它不包含實際的 3D 場景，其中可能包含移動物件。我們並沒有真正注意到這一點，因為我們只使用了一個物件。如果我們有一個像鏡子一樣的物件，周圍有多個物件，那麼鏡子中只會看到天空盒，就像它是場景中唯一的物件一樣。

利用影格緩衝區，可以從相關物件的不同 6 個角度建立場景的紋理，並將它們每幀儲存在立方體貼圖中。我們然後可以使用這個（動態生成的）立方體貼圖來建立逼真的反射和折射表面，其中包含所有其他物件。這稱為 `動態環境貼圖 (dynamic environment mapping)`，因為我們動態地建立物件周圍環境的立方體貼圖，並將其用作其環境貼圖。

雖然它看起來很棒，但它有一個巨大的缺點：我們必須為每個使用環境貼圖的物件渲染場景 6 次，這會對您的應用程式造成巨大的效能損失。現代應用程式盡可能多地使用天空盒，並盡可能預渲染立方體貼圖，以仍然某種程度上建立動態環境貼圖。儘管動態環境貼圖是一種很棒的技術，但它需要大量巧妙的技巧和方法才能在實際渲染應用程式中運行而不會造成太多效能下降。
