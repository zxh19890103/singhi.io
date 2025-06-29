---
layout: bookdetail
chapter: 十五
title: 光 &bull; 光源
category: tech
src: "https://learnopengl.com/Lighting/Light-casters"
date: 2025-06-28
math: 1
book: opengl
image: "https://learnopengl.com/img/lighting/light_casters_directional.png"
order: 15
lang: zh
permalink: /opengl/Lighting/Light-casters
glcate: Lighting
gltopic: Light-casters
---

我們目前為止使用的所有光線都來自空間中的單一光源。這能提供不錯的效果，但在現實世界中，我們有幾種不同類型的光線，它們各自有不同的作用。會「投射」光線到物體上的光源稱為 `light caster`（光線投射器）。在本章中，我們將討論幾種不同的光線投射器類型。學習模擬不同的光源是你的工具箱中的另一個工具，可以進一步豐富你的環境。

我們將首先討論定向光，然後是點光源（這是我們之前討論的擴展），最後我們將討論聚光燈。在[下一章](https://learnopengl.com/Lighting/Multiple-lights)中，我們將把幾種不同的光線類型組合到一個場景中。

## 定向光

當光源距離很遠時，來自光源的光線彼此之間幾乎是平行的。無論物體和/或觀察者在哪裡，看起來所有的光線都來自同一個方向。當光源被模擬為「無限」遠時，它被稱為 `directional light`（定向光），因為它的所有光線都具有相同的方向；它與光源的位置無關。

我們所熟知的太陽就是定向光的一個很好的例子。太陽並非離我們無限遠，但在光照計算中，它足夠遠，我們可以將其視為無限遠。來自太陽的所有光線隨後被模擬為平行光線，如下圖所示：

因為所有的光線都是平行的，所以每個物體與光源位置的關係並不重要，因為光線方向對於場景中的每個物體都保持不變。由於光線的方向向量保持不變，因此場景中每個物體的光照計算都將相似。

我們可以透過定義一個光線方向向量而不是位置向量來模擬這種定向光。著色器計算大部分保持不變，只是這次我們直接使用光線的 `direction` 向量，而不是使用光線的 `position` 向量來計算 `lightDir` 向量：

```cpp
struct Light {
    // vec3 position; // 使用定向光時不再需要。
    vec3 direction;

    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};
[...]
void main()
{
  vec3 lightDir = normalize(-light.direction);
  [...]
}
```

請注意，我們首先對 `light.direction` 向量取反。我們目前使用的光照計算期望光線方向是從片段「指向」光源的方向，但人們通常更喜歡將定向光指定為從光源「發出」的全局方向。因此，我們必須對全局光線方向向量取反以改變其方向；它現在是指向光源的方向向量。此外，請務必正規化向量，因為假設輸入向量是單位向量是不明智的。

然後，得到的 `lightDir` 向量像以前一樣用於漫反射和鏡面反射計算。

為了清楚地證明定向光對多個物體產生相同的效果，我們重新審視[座標系統](https://learnopengl.com/Getting-started/Coordinate-Systems)章節末尾的容器派對場景。如果你錯過了派對，我們定義了 10 個不同的[容器位置](https://learnopengl.com/code_viewer.php?code=lighting/light_casters_container_positions)，並為每個容器生成了一個不同的模型矩陣，其中每個模型矩陣都包含適當的局部到世界變換：

```cpp
for(unsigned int i = 0; i < 10; i++)
{
    glm::mat4 model = glm::mat4(1.0f);
    model = glm::translate(model, cubePositions[i]);
    float angle = 20.0f * i;
    model = glm::rotate(model, glm::radians(angle), glm::vec3(1.0f, 0.3f, 0.5f));
    lightingShader.setMat4("model", model);

    glDrawArrays(GL_TRIANGLES, 0, 36);
}
```

此外，別忘了實際指定光源的方向（請注意，我們將方向定義為從光源「發出」的方向；你可以很快看到光線方向指向下方）：

```cpp
lightingShader.setVec3("light.direction", -0.2f, -1.0f, -0.3f);
```

{% include box.html content="

我們已經將光源的位置和方向向量作為 `vec3`s 傳遞了一段時間，但有些人傾向於將所有向量定義為 `vec4`。將位置向量定義為 `vec4` 時，將 `w` 分量設置為 `1.0` 非常重要，這樣才能正確應用平移和投影。然而，當將方向向量定義為 `vec4` 時，我們不希望平移產生影響（因為它們只代表方向，僅此而已），因此我們將 `w` 分量定義為 `0.0`。

方向向量可以表示為：`vec4(-0.2f, -1.0f, -0.3f, 0.0f)`。這也可以作為光線類型的一個簡單檢查：你可以檢查 `w` 分量是否等於 `1.0` 以判斷我們現在有一個光源位置向量，如果 `w` 等於 `0.0` 則我們有一個光源方向向量；因此根據此調整計算：

```cpp
if(lightVector.w == 0.0) // 注意：小心浮點錯誤
  // 執行定向光計算
else if(lightVector.w == 1.0)
  // 使用光源位置執行光線計算（如前幾章所示）
```

有趣的事實：這實際上是舊版 OpenGL（固定功能）如何判斷光源是定向光還是位置光源，並根據此調整其光照。

" color="green" %}

如果你現在編譯應用程式並在場景中飛行，看起來有一個類似太陽的光源正在照亮所有物體。你能看到漫反射和鏡面反射分量都像是天空中有一個光源一樣地反應嗎？它看起來會像這樣：

你可以在[這裡](https://learnopengl.com/code_viewer_gh.php?code=src/2.lighting/5.1.light_casters_directional/light_casters_directional.cpp)找到應用程式的完整原始碼。

## 點光源

定向光對於照亮整個場景的全局光線非常有用，但我們通常也希望在場景中散佈幾個「點光源」。點光源是位於世界某處的具有給定位置的光源，它向所有方向發光，光線隨距離衰減。可以將燈泡和火炬視為作為點光源的光線投射器。

在前面的章節中，我們一直在使用一個簡化的點光源。我們在給定位置有一個光源，它從該給定光源位置向所有方向散射光線。然而，我們定義的光源模擬了永不衰減的光線，因此它看起來像光源極其強大。在大多數 3D 應用程式中，我們希望模擬一個只照亮光源附近區域而不是整個場景的光源。

如果你將 10 個容器添加到前幾章的光照場景中，你會注意到最裡面的容器與光源前面的容器以相同的強度被照亮；目前還沒有隨距離減弱光線的邏輯。我們希望最裡面的容器與靠近光源的容器相比，只被輕微照亮。

### 衰減

光線強度隨光線傳播距離的減小通常稱為「衰減」。一種隨距離減小光線強度的方法是簡單地使用線性方程式。這樣的方程式會線性地減小光線強度隨距離的變化，從而確保遠處的物體亮度較低。然而，這樣的線性函數看起來有點假。在現實世界中，光線通常在近處非常明亮，但光源的亮度隨距離迅速減弱；剩餘的光線強度隨後隨距離緩慢減弱。因此，我們需要一個不同的方程式來減小光線強度。

幸運的是，一些聰明的人已經為我們解決了這個問題。以下公式根據片段到光源的距離計算衰減值，我們稍後將其乘以光源的強度向量：

\\begin{equation} F\_{att} = \\frac{1.0}{K_c + K_l \* d + K_q \* d^2} \\end{equation}

這裡的 \\(d\\) 表示片段到光源的距離。然後，為了計算衰減值，我們定義了 3 個（可配置的）項：`常數`項 \\(K_c\\)，`線性`項 \\(K_l\\) 和 `二次`項 \\(K_q\\)。

- 常數項通常保持為 `1.0`，這主要是為了確保分母永遠不會小於 `1`，否則在某些距離下會增強強度，這不是我們想要的效果。
- 線性項乘以距離值，以線性方式降低強度。
- 二次項乘以距離的平方，設定光源強度呈二次方衰減。當距離較小時，二次項相對於線性項的影響較小，但隨著距離的增加，二次項會變得大得多。

由於二次項的存在，光線將主要以線性方式減弱，直到距離足夠大，使二次項超越線性項，然後光線強度將更快地減弱。由此產生的效果是，光線在近距離時非常強烈，但隨著距離的增加迅速失去亮度，直到最終以更慢的速度失去亮度。下圖顯示了這種衰減在距離為 `100` 時的效果：

你可以看到，當距離較小時，光線強度最高，但隨著距離的增加，其強度顯著降低，並在大約 `100` 的距離處緩慢達到 `0` 強度。這正是我們想要的。

#### 選擇合適的值

但是我們應該將這 3 個術語設定為多少值呢？設定正確的值取決於許多因素：環境、你希望光線覆蓋的距離、光線類型等。在大多數情況下，這只是經驗和適度調整的問題。下表顯示了這些術語可以採用的一些值，以模擬覆蓋特定半徑（距離）的逼真（某種程度）光源。第一欄指定了光線在給定術語下將覆蓋的距離。這些值是大多數光線的良好起點，感謝 [Ogre3D's wiki](http://www.ogre3d.org/tikiwiki/tiki-index.php?page=-Point+Light+Attenuation)：

<div class="table">
<table><tbody><tr><th>距離</th><th>常數</th><th>線性</th><th>二次</th></tr><tr><td><code>7</code></td><td><code>1.0</code></td><td><code>0.7</code></td><td><code>1.8</code></td></tr><tr><td><code>13</code></td><td><code>1.0</code></td><td><code>0.35</code></td><td><code>0.44</code></td></tr><tr><td><code>20</code></td><td><code>1.0</code></td><td><code>0.22</code></td><td><code>0.20</code></td></tr><tr><td><code>32</code></td><td><code>1.0</code></td><td><code>0.14</code></td><td><code>0.07</code></td></tr><tr><td><code>50</code></td><td><code>1.0</code></td><td><code>0.09</code></td><td><code>0.032</code></td></tr><tr><td><code>65</code></td><td><code>1.0</code></td><td><code>0.07</code></td><td><code>0.017</code></td></tr><tr><td><code>100</code></td><td><code>1.0</code></td><td><code>0.045</code></td><td><code>0.0075</code></td></tr><tr><td><code>160</code></td><td><code>1.0</code></td><td><code>0.027</code></td><td><code>0.0028</code></td></tr><tr><td><code>200</code></td><td><code>1.0</code></td><td><code>0.022</code></td><td><code>0.0019</code></td></tr><tr><td><code>325</code></td><td><code>1.0</code></td><td><code>0.014</code></td><td><code>0.0007</code></td></tr><tr><td><code>600</code></td><td><code>1.0</code></td><td><code>0.007</code></td><td><code>0.0002</code></td></tr><tr><td><code>3250</code></td><td><code>1.0</code></td><td><code>0.0014</code></td><td><code>0.000007</code></td></tr></tbody></table>
</div>

如你所見，常數項 \\(K_c\\) 在所有情況下都保持為 `1.0`。線性項 \\(K_l\\) 通常很小，以覆蓋更大的距離，而二次項 \\(K_q\\) 甚至更小。嘗試使用這些值進行一些實驗，以查看它們在你的實現中的效果。在我們的環境中，`32` 到 `100` 的距離通常足以應付大多數光線。

#### 實施衰減

為了實施衰減，我們需要在片段著色器中額外需要 3 個值：即方程式的常數、線性和二次項。這些最好儲存在我們之前定義的 `Light` 結構中。請注意，我們需要再次使用 `position` 計算 `lightDir`，因為這是一個點光源（如前一章所示），而不是定向光。

```cpp
struct Light {
    vec3 position;

    vec3 ambient;
    vec3 diffuse;
    vec3 specular;

    float constant;
    float linear;
    float quadratic;
};
```

然後我們在應用程式中設定這些項：我們希望光線覆蓋 `50` 的距離，所以我們將使用表格中相應的常數、線性和二次項：

```cpp
lightingShader.setFloat("light.constant",  1.0f);
lightingShader.setFloat("light.linear",    0.09f);
lightingShader.setFloat("light.quadratic", 0.032f);
```

在片段著色器中實作衰減相對簡單：我們只需根據方程式計算一個衰減值，然後將其乘以環境光、漫反射和鏡面反射分量。

然而，為了使方程式生效，我們需要到光源的距離。還記得我們如何計算向量的長度嗎？我們可以透過計算片段與光源之間的差向量並取該結果向量的長度來獲取距離項。為此，我們可以使用 GLSL 內建的 `length` 函數：

```cpp
float distance    = length(light.position - FragPos);
float attenuation = 1.0 / (light.constant + light.linear * distance +
            light.quadratic * (distance * distance));
```

然後，我們將這個衰減值包含在光照計算中，方法是將衰減值乘以環境光、漫反射和鏡面反射顏色。

{% include box.html content="我們可以單獨保留環境光分量，這樣環境光不會隨距離減小，但如果我們使用多個光源，所有環境光分量將開始堆疊。在這種情況下，我們也希望衰減環境光。只需根據你的環境嘗試什麼是最好的。" color="green" %}

```cpp
ambient  *= attenuation;
diffuse  *= attenuation;
specular *= attenuation;
```

如果你運行應用程式，你會得到類似這樣的結果：

你可以看到，現在只有前面的容器被照亮，而最靠近光源的容器最亮。後面的容器根本沒有被照亮，因為它們離光源太遠了。你可以在[這裡](https://learnopengl.com/code_viewer_gh.php?code=src/2.lighting/5.2.light_casters_point/light_casters_point.cpp)找到應用程式的原始碼。

點光源因此是一個具有可配置位置並對其光照計算應用衰減的光源。這是我們光照武器庫中的又一種光源類型。

## 聚光燈

我們要討論的最後一種光線類型是「聚光燈」。聚光燈是位於環境某處的光源，它不像向所有方向發射光線，而是僅向特定方向發射光線。結果是只有聚光燈方向一定半徑內的物體會被照亮，其他一切都保持黑暗。聚光燈的一個很好的例子是路燈或手電筒。

OpenGL 中的聚光燈由世界空間位置、方向和一個指定聚光燈半徑的 `cutoff` 角度表示。對於每個片段，我們計算片段是否位於聚光燈的截止方向之間（因此在其圓錐體內），如果是，我們相應地照亮片段。下圖讓你了解聚光燈的工作原理：

- `LightDir`: 從片段指向光源的向量。
- `SpotDir`: 聚光燈瞄準的方向。
- `Phi` \\(\\phi\\): 指定聚光燈半徑的截止角度。在此角度之外的一切都不會被聚光燈照亮。
- `Theta` \\(\\theta\\): `LightDir` 向量和 `SpotDir` 向量之間的角度。\\(\\theta\\) 值應小於 \\(\\Phi\\) 才能在聚光燈內。

所以我們基本上需要做的，就是計算 `LightDir` 向量和 `SpotDir` 向量之間的點積（返回兩個單位向量之間夾角的餘弦值），並將其與截止角度 \\(\\phi\\) 進行比較。現在你（或多或少）理解了聚光燈的全部內容，我們將以手電筒的形式創建一個聚光燈。

### 手電筒

手電筒是一種聚光燈，位於觀察者的位置，通常從玩家的角度直射前方。手電筒基本上是一個普通的聚光燈，但其位置和方向會根據玩家的位置和方向不斷更新。

因此，片段著色器需要的值是聚光燈的位置向量（用於計算片段到光源的方向向量）、聚光燈的方向向量和截止角度。我們可以將這些值儲存在 `Light` 結構中：

```cpp
struct Light {
    vec3  position;
    vec3  direction;
    float cutOff;
    ...
};
```

接下來我們將適當的值傳遞給著色器：

```cpp
lightingShader.setVec3("light.position",  camera.Position);
lightingShader.setVec3("light.direction", camera.Front);
lightingShader.setFloat("light.cutOff",   glm::cos(glm::radians(12.5f)));
```

如你所見，我們沒有為截止值設定角度，而是根據角度計算餘弦值並將餘弦結果傳遞給片段著色器。這樣做的原因是，在片段著色器中，我們計算 `LightDir` 和 `SpotDir` 向量之間的點積，點積返回一個餘弦值而不是角度；我們不能直接比較角度和餘弦值。為了在著色器中獲得角度，我們必須計算點積結果的反餘弦，這是一個昂貴的操作。因此，為了節省一些性能，我們預先計算給定截止角度的餘弦值，並將此結果傳遞給片段著色器。由於現在兩個角度都表示為餘弦值，我們可以直接比較它們而無需昂貴的操作。

現在剩下的就是計算 theta \\(\\theta\\) 值並將其與截止 \\(\\phi\\) 值進行比較，以確定我們是在聚光燈內部還是外部：

```cpp
float theta = dot(lightDir, normalize(-light.direction));

if(theta > light.cutOff)
{
  // 執行光照計算
}
else  // 否則，使用環境光，這樣聚光燈外部的場景就不會完全黑暗。
  color = vec4(light.ambient * vec3(texture(material.diffuse, TexCoords)), 1.0);
```

我們首先計算 `lightDir` 向量與負的 `direction` 向量之間的點積（取負號，因為我們希望向量指向光源，而不是從光源發出）。務必正規化所有相關向量。

{% include box.html content="

你可能想知道為什麼 `if` 條件中是 `>` 號而不是 `<` 號。難道 `theta` 不應該小於光線的截止值才能在聚光燈內部嗎？這是對的，但別忘了角度值是以餘弦值表示的，並且 `0` 度角表示為餘弦值 `1.0`，而 `90` 度角表示為餘弦值 `0.0`，如你所見：

你現在可以看到，餘弦值越接近 `1.0`，其角度越小。現在你就明白為什麼 `theta` 需要大於截止值了。截止值目前設定為 `12.5` 度的餘弦值，等於 `0.976`，因此介於 `0.976` 和 `1.0` 之間的餘弦 `theta` 值將導致片段被照亮，如同在聚光燈內部一樣。

" color="green" %}

執行應用程式會產生一個聚光燈，它只照亮直接位於聚光燈圓錐體內的片段。它看起來會像這樣：

你可以在[這裡](https://learnopengl.com/code_viewer_gh.php?code=src/2.lighting/5.3.light_casters_spot/light_casters_spot.cpp)找到完整的原始碼。

不過它看起來還是有點假，主要是因為聚光燈邊緣很硬。只要片段到達聚光燈圓錐體的邊緣，它就會完全關閉，而不是平滑漸變。逼真的聚光燈會在其邊緣逐漸減弱光線。

### 平滑/柔和邊緣

為了創建平滑邊緣聚光燈的效果，我們希望模擬一個具有「內」錐體和「外」錐體的聚光燈。我們可以將內錐體設定為上一節中定義的錐體，但我們也希望有一個外錐體，它會將光線從內錐體逐漸調暗到外錐體的邊緣。

為了創建一個外錐體，我們只需定義另一個餘弦值，表示聚光燈方向向量和外錐體向量（等於其半徑）之間的角度。然後，如果片段位於內錐體和外錐體之間，它應該計算一個介於 `0.0` 和 `1.0` 之間的光強度值。如果片段位於內錐體內部，其強度等於 `1.0`，如果片段位於外錐體外部，則為 `0.0`。

我們可以使用以下方程式計算這樣的值：\\begin{equation} I = \\frac{\\theta - \\gamma}{\\epsilon} \\end{equation} 這裡的 \\(\\epsilon\\)（epsilon）是內錐體 (\\(\\phi\\)) 和外錐體 (\\(\\gamma\\)) 之間的餘弦差 (\\(\\epsilon = \\phi - \\gamma\\))。得到的 \\(I\\) 值就是當前片段處的聚光燈強度。

很難想像這個公式實際上是如何工作的，所以讓我們用幾個樣本值來試驗一下：

<div class="table">
<table><tbody><tr><th>\(\theta\)</th><th>\(\theta\)（度）</th><th>\(\phi\)（內截止）</th><th>\(\phi\)（度）</th><th>\(\gamma\)（外截止）</th><th>\(\gamma\)（度）</th><th>\(\epsilon\)</th><th>\(I\)</th></tr><tr><td><code>0.87</code></td><td><code>30</code></td><td><code>0.91</code></td><td><code>25</code></td><td><code>0.82</code></td><td><code>35</code></td><td><code>0.91 - 0.82 = 0.09</code></td><td><code>0.87 - 0.82 / 0.09 = 0.56</code></td></tr><tr><td><code>0.9</code></td><td><code>26</code></td><td><code>0.91</code></td><td><code>25</code></td><td><code>0.82</code></td><td><code>35</code></td><td><code>0.91 - 0.82 = 0.09</code></td><td><code>0.9 - 0.82 / 0.09 = 0.89</code></td></tr><tr><td><code>0.97</code></td><td><code>14</code></td><td><code>0.91</code></td><td><code>25</code></td><td><code>0.82</code></td><td><code>35</code></td><td><code>0.91 - 0.82 = 0.09</code></td><td><code>0.97 - 0.82 / 0.09 = 1.67</code></td></tr><tr><td><code>0.83</code></td><td><code>34</code></td><td><code>0.91</code></td><td><code>25</code></td><td><code>0.82</code></td><td><code>35</code></td><td><code>0.91 - 0.82 = 0.09</code></td><td><code>0.83 - 0.82 / 0.09 = 0.11</code></td></tr><tr><td><code>0.64</code></td><td><code>50</code></td><td><code>0.91</code></td><td><code>25</code></td><td><code>0.82</code></td><td><code>35</code></td><td><code>0.91 - 0.82 = 0.09</code></td><td><code>0.64 - 0.82 / 0.09 = -2.0</code></td></tr><tr><td><code>0.966</code></td><td><code>15</code></td><td><code>0.9978</code></td><td><code>12.5</code></td><td><code>0.953</code></td><td><code>17.5</code></td><td><code>0.9978 - 0.953 = 0.0448</code></td><td><code>0.966 - 0.953 / 0.0448 = 0.29</code></td></tr></tbody></table>
</div>

如你所見，我們基本上是根據 \\(\\theta\\) 值在外部餘弦和內部餘弦之間進行插值。如果你仍然不清楚發生了什麼，別擔心，你可以簡單地把公式當作理所當然，等你年紀更大、更聰明時再回來這裡。

我們現在有一個光照強度值，當在聚光燈外部時為負值，當在內錐體內部時高於 `1.0`，而在邊緣附近則介於兩者之間。如果我們正確地鉗制這些值，我們就不再需要在片段著色器中使用 `if-else`，並且我們可以簡單地將光照分量乘以計算出的強度值：

```cpp
float theta     = dot(lightDir, normalize(-light.direction));
float epsilon   = light.cutOff - light.outerCutOff;
float intensity = clamp((theta - light.outerCutOff) / epsilon, 0.0, 1.0);
...
// 我們將環境光保持不受影響，這樣我們總會有一點光。
diffuse  *= intensity;
specular *= intensity;
...
```

請注意，我們使用了 `clamp` 函數，它將其第一個參數「鉗制」在 `0.0` 和 `1.0` 之間。這確保了強度值不會超出 \[`0`, `1`\] 範圍。

確保將 `outerCutOff` 值添加到 `Light` 結構體中，並在應用程式中設定其 uniform 值。對於下圖，內截止角度為 `12.5`，外截止角度為 `17.5`：

啊，這樣好多了。玩玩內外截止角度，嘗試創建一個更適合你需求的聚光燈。你可以在[這裡](https://learnopengl.com/code_viewer_gh.php?code=src/2.lighting/5.4.light_casters_spot_soft/light_casters_spot_soft.cpp)找到應用程式的原始碼。

這種手電筒/聚光燈類型的燈具非常適合恐怖遊戲，與定向光和點光源結合使用，環境將真正開始被照亮。
