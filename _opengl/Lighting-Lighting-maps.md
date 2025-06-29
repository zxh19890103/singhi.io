---
layout: bookdetail
chapter: 十四
title: 光 &bull; 光照貼圖
category: tech
src: "https://learnopengl.com/Lighting/Lighting-maps"
date: 2025-06-28
math: 1
book: opengl
image: "https://learnopengl.com/img/textures/container2.png"
order: 14
lang: zh
permalink: /opengl/Lighting/Lighting-maps
glcate: Lighting
gltopic: Lighting-maps
---

> 貼圖，就是提供一張紋理圖（一般如此），紋理圖佈滿像素，像素值的一般格式為 RGBA，也就是顏色，爾顏色可用於著色器的 Fragment，這樣會讓物體看上去更逼真。紋理圖的存在在於提供一種可行的方式，以實現對物體表面的精確刻畫。

在[前一章]({{ page.previous.url }})中，我們討論了每個物體擁有獨特材質的可能性，使其對光線產生不同的反應。這對於讓每個物體與其他物體相比擁有獨特外觀很有幫助，但在物體的視覺輸出方面，靈活性仍然有限。

在上一章中，我們為整個物體定義了一種材質。然而，現實世界中的物體通常不只由單一材質構成，而是由多種材質組成。想想一輛汽車：它的外部由閃亮的織物組成，車窗部分反射周圍環境，輪胎一點也不閃亮所以沒有鏡面高光，而輪蠏則超級閃亮（如果你真的把車洗乾淨的話）。汽車的漫反射和環境光顏色對於整個物體來說也不是相同的；一輛汽車會顯示許多不同的環境光/漫反射顏色。總而言之，這樣的物體對於其不同的部分擁有不同的材質屬性。

因此，前一章中的材質系統不足以應付除了最簡單的模型之外的所有情況，所以我們需要透過引入「漫反射貼圖」和「鏡面反射貼圖」來擴展該系統。這些貼圖使我們能夠更精確地影響物體的漫反射（並間接影響環境光分量，因為它們應該是相同的）和鏡面反射分量。

## 漫反射貼圖

我們需要一種方法來為每個單獨的片段設定物體的漫反射顏色。某種系統，我們可以根據片段在物體上的位置來檢索顏色值？

這聽起來應該都很熟悉，而且我們已經使用這種系統一段時間了。這聽起來就像我們在其中一個[較早的章節](/opengl/Start-Textures)中廣泛討論的「紋理」，而且它基本上就是：一個紋理。我們只是對相同的基本原理使用了不同的名稱：使用包覆在物體上的圖像，我們可以對每個片段索引以獲得獨特的顏色值。在打光的場景中，這通常被稱為漫反射貼圖（在 PBR 出現之前，3D 藝術家通常這樣稱呼它們），因為紋理圖像代表了物體的所有漫反射顏色。

為了演示漫反射貼圖，我們將使用[以下圖像](https://learnopengl.com/img/textures/container2.png)，這是一個帶有鋼邊的木製容器：

在著色器中使用漫反射貼圖與我們在紋理章節中展示的完全一樣。然而這次，我們將紋理作為 `sampler2D` 儲存在 `Material` 結構體中。我們用漫反射貼圖替換了之前定義的 `vec3` 漫反射顏色向量。

{% include box.html content="請記住，`sampler2D` 是一種所謂的「不透明類型」，這意味著我們不能實例化這些類型，而只能將它們定義為 uniform。如果結構體以 uniform 以外的方式實例化（例如作為函數參數），GLSL 可能會拋出奇怪的錯誤；因此，這也適用於任何包含此類不透明類型的結構體。" color="red" %}

我們也移除了環境材質顏色向量，因為既然我們現在用光源控制環境光，環境光顏色反正等於漫反射顏色。所以沒有必要單獨儲存它：

```cpp
struct Material {
    sampler2D diffuse;
    vec3      specular;
    float     shininess;
};
...
in vec2 TexCoords;
```

{% include box.html content="如果你有點固執，仍然想將環境光顏色設定為不同的值（而不是漫反射值），你可以保留環境光 `vec3`，但這樣一來，整個物體的環境光顏色仍然會保持不變。若要為每個片段取得不同的環境光值，你必須單獨為環境光值使用另一個紋理。" color="green" %}

請注意，我們將再次在片段著色器中需要紋理座標，因此我們聲明了一個額外的輸入變數。然後我們只需從紋理中採樣以檢索片段的漫反射顏色值：

```cpp
vec3 diffuse = light.diffuse * diff * vec3(texture(material.diffuse, TexCoords));
```

此外，別忘了將環境材質的顏色也設定為與漫反射材質的顏色相同：

```cpp
vec3 ambient = light.ambient * vec3(texture(material.diffuse, TexCoords));
```

這就是使用漫反射貼圖所需的全部。如你所見，這並不是什麼新東西，但它確實顯著提升了視覺品質。為了讓它正常運作，我們需要用紋理座標更新頂點資料，將它們作為頂點屬性傳輸到片段著色器，載入紋理，並將紋理綁定到適當的紋理單元。

更新後的頂點資料可以在[這裡](https://learnopengl.com/code_viewer.php?code=lighting/vertex_data_textures)找到。頂點資料現在包含立方體每個頂點的頂點位置、法線向量和紋理座標。讓我們更新頂點著色器以接受紋理座標作為頂點屬性，並將它們轉發到片段著色器：

```cpp
#version 330 core
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec3 aNormal;
layout (location = 2) in vec2 aTexCoords;
...
out vec2 TexCoords;

void main()
{
    ...
    TexCoords = aTexCoords;
}
```

請務必更新兩個 VAO 的頂點屬性指標，使其與新的頂點資料匹配，並將容器圖像載入為紋理。在渲染立方體之前，我們需要為 `material.diffuse` uniform 採樣器指定正確的紋理單元，並將容器紋理綁定到此紋理單元：

```cpp
lightingShader.setInt("material.diffuse", 0);
...
glActiveTexture(GL_TEXTURE0);
glBindTexture(GL_TEXTURE_2D, diffuseMap);
```

現在，使用漫反射貼圖，我們再次獲得了巨大的細節提升，這次容器真正開始閃閃發光（字面上是如此）。你的容器現在可能看起來像這樣：

你可以在[這裡](https://learnopengl.com/code_viewer_gh.php?code=src/2.lighting/4.1.lighting_maps_diffuse_map/lighting_maps_diffuse.cpp)找到完整的應用程式原始碼。

## 鏡面反射貼圖

你可能注意到鏡面高光看起來有點奇怪，因為物體是一個主要由木材組成的容器，而木材不應該有那樣的鏡面高光。我們可以透過將物體的鏡面反射材質設定為 `vec3(0.0)` 來解決這個問題，但這意味著容器的鋼邊也會停止顯示鏡面高光，而鋼材**應該**顯示鏡面高光。我們希望能夠控制物體的哪些部分應該顯示具有不同強度的鏡面高光。這個問題聽起來很熟悉。巧合？我不這麼認為。

我們也可以僅為鏡面高光使用紋理貼圖。這意味著我們需要生成一個黑白（或者如果你喜歡，也可以是彩色）紋理，它定義了物體每個部分的鏡面高光強度。一個[鏡面反射貼圖](https://learnopengl.com/img/textures/container2_specular.png)的例子如下圖所示：

鏡面高光的強度來自圖像中每個像素的亮度。鏡面貼圖的每個像素都可以表示為一個顏色向量，例如黑色表示顏色向量 `vec3(0.0)`，灰色表示顏色向量 `vec3(0.5)`。在片段著色器中，我們然後採樣相應的顏色值，並將此值乘以光源的鏡面強度。像素越「白」，乘法的結果越高，因此物體的鏡面分量就越亮。

由於容器主要由木材組成，而木材作為一種材料不應該有鏡面高光，因此漫反射紋理的整個木質部分被轉換為黑色：黑色部分沒有任何鏡面高光。容器的鋼邊具有不同的鏡面強度，鋼材本身相對容易產生鏡面高光，而裂縫則不然。

{% include box.html content="從技術上講，木材也有鏡面高光，儘管其光澤度值低得多（光散射更多），影響也較小，但出於學習目的，我們可以假裝木材對鏡面光沒有任何反應。" color="green" %}

使用 _Photoshop_ 或 _Gimp_ 等工具，透過剪切一些部分、將其轉換為黑白並增加亮度/對比度，將漫反射紋理轉換為這樣的鏡面圖像相對容易。

### 採樣鏡面反射貼圖

鏡面反射貼圖就像任何其他紋理一樣，因此程式碼類似於漫反射貼圖程式碼。確保正確載入圖像並生成紋理物件。由於我們在同一個片段著色器中使用另一個紋理採樣器，我們必須為鏡面反射貼圖使用不同的紋理單元（請參閱[紋理](/opengl/Start-Textures)），因此讓我們先在渲染之前將其綁定到適當的紋理單元：

```cpp
lightingShader.setInt("material.specular", 1);
...
glActiveTexture(GL_TEXTURE1);
glBindTexture(GL_TEXTURE_2D, specularMap);
```

然後更新片段著色器的材質屬性，使其接受 `sampler2D` 作為其鏡面反射分量，而不是 `vec3`：

```cpp
struct Material {
    sampler2D diffuse;
    sampler2D specular;
    float     shininess;
};
```

最後，我們要採樣鏡面反射貼圖，以檢索片段對應的鏡面反射強度：

```cpp
vec3 ambient  = light.ambient  * vec3(texture(material.diffuse, TexCoords));
vec3 diffuse  = light.diffuse  * diff * vec3(texture(material.diffuse, TexCoords));
vec3 specular = light.specular * spec * vec3(texture(material.specular, TexCoords));
FragColor = vec4(ambient + diffuse + specular, 1.0);
```

透過使用鏡面反射貼圖，我們可以巨細靡遺地指定物體的哪些部分具有「閃亮」特性，甚至可以控制其相對應的強度。鏡面反射貼圖在漫反射貼圖的基礎上，為我們提供了額外的光照控制層次。

{% include box.html content="如果你不想太主流，你也可以在鏡面反射貼圖中使用實際顏色，不僅設定每個片段的鏡面反射強度，也設定鏡面高光的顏色。然而，實際上，鏡面高光的顏色主要由光源本身決定，因此這樣做不會產生逼真的視覺效果（這就是為什麼圖像通常是黑白的：我們只關心強度）。" color="green" %}

如果你現在運行應用程式，你可以清楚地看到容器的材質現在與帶有鋼框的真實木製容器非常相似：

你可以在[這裡](https://learnopengl.com/code_viewer_gh.php?code=src/2.lighting/4.2.lighting_maps_specular_map/lighting_maps_specular.cpp)找到完整的應用程式原始碼。

使用漫反射和鏡面反射貼圖，我們確實可以為相對簡單的物體添加大量的細節。我們甚至可以使用其他紋理貼圖，如法線/凹凸貼圖和/或反射貼圖，為物體添加更多細節，但這將留到後續章節討論。向你的所有朋友和家人展示你的容器，並為我們的容器有一天會變得比現在更漂亮而感到滿足吧！
