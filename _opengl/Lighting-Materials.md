---
layout: bookdetail
chapter: 十三
description: "本篇介紹了物體的材質概念，材質是對物體表面反射光組合的描述，目的是使物體看起來更真實，所謂更真實，意思是“像”你肉眼看見的那些自然或人工製造的東西。依然是對三種反射光進行處理，分別是環境光、漫射光和鏡面光。材質描述了物體的這三種光（如何反射太陽光）以及各自的反射強度"
title: 光 &bull; 材質
category: tech
src: "https://learnopengl.com/Lighting/Materials"
date: 2025-06-27
book: opengl
image: "https://learnopengl.com/img/lighting/materials_real_world.png"
---

> 本篇介紹了物體的材質概念，材質是對物體表面反射光組合的描述，目的是使物體看起來更真實，所謂更真實，意思是“像”你肉眼看見的那些自然或人工製造的東西。依然是對三種反射光進行處理，分別是環境光、漫射光和鏡面光。材質描述了物體的這三種光（如何反射太陽光）以及各自的反射強度。

在現實世界中，每個物體對光線都有不同的反應。例如，鋼製物體通常比黏土花瓶更光亮，木製容器對光的反應也與鋼製容器不同。有些物體反射光線時散射不多，產生小的鏡面高光，而另一些物體則散射很多，使高光半徑更大。如果我們想在 OpenGL 中模擬多種類型的物體，我們必須為每個表面定義特定的材質屬性。

在[上一章]({{page.previous.url}})中，我們定義了物體和光的顏色來定義物體的視覺輸出，並結合了環境光和鏡面反射強度分量。在描述表面時，我們可以為三個照明分量（環境光、漫射光和鏡面光）中的每一個定義一種材質顏色。通過為每個分量指定顏色，我們可以精細控制表面的顏色輸出。現在，將光澤度分量添加到這三個顏色中，我們就擁有了所需的所有材質屬性：

```cpp
#version 330 core
struct Material {
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
    float shininess;
};

uniform Material material;
```

在片段著色器中，我們建立一個 `struct` 來儲存表面的材質屬性。我們也可以將它們儲存為單獨的 uniform 值，但將它們儲存為 struct 可以使其更有條理。我們首先定義 struct 的佈局，然後簡單地宣告一個以新建立的 struct 作為其類型的 uniform 變數。

如您所見，我們為 Phong 光照的每個組成部分定義了一個顏色向量。`ambient` 材質向量定義了表面在環境光照下反射的顏色；這通常與表面的顏色相同。`diffuse` 材質向量定義了表面在漫射光照下的顏色。漫射顏色（就像環境光照一樣）設定為所需的表面顏色。`specular` 材質向量設定了表面鏡面高光的顏色（甚至可能反射表面特定的顏色）。最後，`shininess` 影響了鏡面高光的散射/半徑。

有了這 4 個定義物體材質的組成部分，我們可以模擬許多真實世界的材質。在 [devernay.free.fr](http://devernay.free.fr/cours/opengl/materials.html) 上的一個表格顯示了模擬現實世界中真實材質的材質屬性列表。下圖顯示了其中一些真實世界材質值對我們的立方體產生的效果：

如您所見，通過正確指定表面的材質屬性，似乎改變了我們對物體的感知。效果顯而易見，但為了獲得更真實的結果，我們需要用更複雜的東西替換立方體。在[模型載入](/opengl/Model-Loading-Assimp)章節中，我們將討論更複雜的形狀。

為物體找出正確的材質設定是一項艱鉅的任務，主要需要實驗和大量經驗。由於材質放置不當而完全破壞物體的視覺品質並非不常見。

讓我們嘗試在著色器中實現這樣的材質系統。

## 設定材質

我們在片段著色器中建立了一個 uniform 材質結構，接下來我們想要更改光照計算以符合新的材質屬性。由於所有材質變數都儲存在一個結構中，我們可以從 `material` uniform 訪問它們：

```cpp
void main()
{
    // ambient
    vec3 ambient = lightColor * material.ambient;

    // diffuse
    vec3 norm = normalize(Normal);
    vec3 lightDir = normalize(lightPos - FragPos);
    float diff = max(dot(norm, lightDir), 0.0);
    vec3 diffuse = lightColor * (diff * material.diffuse);

    // specular
    vec3 viewDir = normalize(viewPos - FragPos);
    vec3 reflectDir = reflect(-lightDir, norm);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
    vec3 specular = lightColor * (spec * material.specular);

    vec3 result = ambient + diffuse + specular;
    FragColor = vec4(result, 1.0);
}
```

如您所見，我們現在在需要的地方都可以存取 `material` 結構的所有屬性，並這次藉助材質的顏色計算出最終的輸出顏色。物體的每個材質屬性都與其各自的照明分量相乘。

我們可以在應用程式中透過設定相應的 uniform 變數來設定物體的材質。然而，GLSL 中的結構在設定 uniform 變數時沒有任何特殊之處；結構實際上只充當 uniform 變數的命名空間。如果我們要填充這個結構，我們必須設定單獨的 uniform 變數，但要加上結構名稱作為前綴：

```cpp
lightingShader.setVec3("material.ambient", 1.0f, 0.5f, 0.31f);
lightingShader.setVec3("material.diffuse", 1.0f, 0.5f, 0.31f);
lightingShader.setVec3("material.specular", 0.5f, 0.5f, 0.5f);
lightingShader.setFloat("material.shininess", 32.0f);
```

我們將環境光和漫射光分量設定為我們希望物體擁有的顏色，並將物體的鏡面反射分量設定為中等亮度；我們不希望鏡面反射分量太強。我們也將光澤度保持在 `32`。

我們現在可以輕鬆地從應用程式中影響物體的材質。運行程式會得到類似這樣的結果：

不過看起來不太對勁，不是嗎？

### 光線屬性

物體太亮了。物體太亮的原因是環境光、漫射光和鏡面反射光顏色從任何光源都以全強度反射。光源對於它們各自的環境光、漫射光和鏡面反射光分量也有不同的強度。在上一章中，我們通過使用強度值改變環境光和鏡面反射光強度來解決這個問題。我們想要做類似的事情，但這次是為每個光照分量指定強度向量。如果我們將 `lightColor` 視覺化為 `vec3(1.0)`，程式碼將會像這樣：

```cpp
vec3 ambient  = vec3(1.0) * material.ambient;
vec3 diffuse  = vec3(1.0) * (diff * material.diffuse);
vec3 specular = vec3(1.0) * (spec * material.specular);
```

光線的每個組成部分都會以全強度反射物體的每個材質屬性。這些 `vec3(1.0)` 值也可以針對每個光源單獨調整，這通常就是我們想要的。現在，物體的環境光照分量完全影響了立方體的顏色。環境光照分量不應該對最終顏色產生如此大的影響，因此我們可以透過將光源的環境光強度設定為較低的值來限制環境光照顏色：

```cpp
vec3 ambient = vec3(0.1) * material.ambient;
```

我們可以透過同樣的方式影響光源的漫射和鏡面強度。這與我們在[上一章](/opengl/Lighting-Basic-Lighting)中所做的非常相似；你可以說我們已經創建了一些光照屬性來獨立影響每個光照組件。我們將會為光照屬性創建一個類似於材質結構的東西：

```cpp
struct Light {
    vec3 position;

    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};

uniform Light light;
```

光源對於其「環境光」、「漫射光」和「鏡面光」分量具有不同的強度。環境光通常設定為較低的強度，因為我們不希望環境光顏色過於主導。光源的漫射分量通常設定為我們希望光線具有的精確顏色；通常是明亮的白色。鏡面分量通常保持在 `vec3(1.0)`，以全強度發光。請注意，我們還將光源的位置向量添加到了結構中。

就像材質 uniform 一樣，我們需要更新片段著色器：

```cpp
vec3 ambient  = light.ambient * material.ambient;
vec3 diffuse  = light.diffuse * (diff * material.diffuse);
vec3 specular = light.specular * (spec * material.specular);
```

我們然後希望在應用中設置光線強度：

```cpp
lightingShader.setVec3("light.ambient",  0.2f, 0.2f, 0.2f);
lightingShader.setVec3("light.diffuse",  0.5f, 0.5f, 0.5f); // darken diffuse light a bit
lightingShader.setVec3("light.specular", 1.0f, 1.0f, 1.0f);
```

現在我們調整了光線如何影響物體的材質，我們得到了與上一章非常相似的視覺輸出。然而這次，我們完全控制了物體的光照和材質：

現在改變物體的視覺效果相對容易。讓我們加點料吧！

### 不同的光線顏色

到目前為止，我們僅使用光線顏色來改變其各個組件的強度，透過選擇從白色到灰色再到黑色的顏色，而不影響物體的實際顏色（僅影響其強度）。由於我們現在可以輕鬆存取光線的屬性，我們可以隨時間改變它們的顏色，以獲得一些非常有趣的視覺效果。由於片段著色器中的一切都已設定好，改變光線的顏色非常簡單，並且能立即創造出一些時髦的效果：

{% include vid.html src="[https://learnopengl.com/video/lighting/materials.mp4](https://learnopengl.com/video/lighting/materials.mp4)" %}

如您所見，不同的光線顏色會極大地影響物體的顏色輸出。由於光線顏色直接影響物體可以反射的顏色（您可能還記得[顏色](/opengl/Lighting-Colors)章節），因此它對視覺輸出有著顯著的影響。

我們可以透過 `sin` 和 `glfwGetTime` 輕鬆地隨時間改變光線的環境光和漫射光顏色：

```cpp
glm::vec3 lightColor;
lightColor.x = sin(glfwGetTime() * 2.0f);
lightColor.y = sin(glfwGetTime() * 0.7f);
lightColor.z = sin(glfwGetTime() * 1.3f);

glm::vec3 diffuseColor = lightColor   * glm::vec3(0.5f);
glm::vec3 ambientColor = diffuseColor * glm::vec3(0.2f);

lightingShader.setVec3("light.ambient", ambientColor);
lightingShader.setVec3("light.diffuse", diffuseColor);
```

請嘗試不同的光照和材質值，看看它們如何影響視覺輸出。您可以在[這裡](https://learnopengl.com/code_viewer_gh.php?code=src/2.lighting/3.1.materials/materials.cpp)找到應用程式的原始碼。
