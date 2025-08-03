---
layout: bookdetail
chapter: 三十
title: 高級光照
category: tech
src: "https://learnopengl.com/Advanced-Lighting/Advanced-Lighting"
date: 2025-07-01
math: 1
book: opengl
image: "https://learnopengl.com/img/advanced-lighting/advanced_lighting_phong_limit.png"
order: 30
lang: zh
glcate: Advanced-Lighting
gltopic: Advanced-Lighting
permalink: /opengl/Advanced-Lighting/Advanced-Lighting
---

在[光照](/opengl/Lighting/Basic-Lighting)章節中，我們簡要介紹了 Phong 光照模型，為場景帶來基本的真實感。Phong 模型看起來不錯，但在本章中我們將重點關注它的一些細微差別。

## Blinn-Phong

Phong 光照是對光照的一種出色且非常高效的近似，但它的鏡面反射在某些條件下會失效，特別是當 shininess 屬性較低，導致鏡面區域較大（粗糙）時。下圖顯示了當我們在平面紋理平面上使用 `1.0` 的鏡面 shininess 指數時會發生什麼：

![](https://learnopengl.com/img/advanced-lighting/advanced_lighting_phong_limit.png)

你可以看到在邊緣處，鏡面區域會立刻被切斷。發生這種情況的原因是視線向量和反射向量之間的夾角不會超過 90 度。如果夾角大於 90 度，則點積結果為負，這會導致鏡面指數為 `0.0`。你可能會想這不會是個問題，因為我們本來就不應該得到任何角度大於 90 度的光線，對嗎？

錯了，這僅適用於漫射分量，其中法線和光源之間大於 90 度的夾角表示光源位於被照亮表面下方，因此光的漫射貢獻應等於 `0.0`。然而，對於鏡面光照，我們測量的不是光源和法線之間的夾角，而是視線和反射向量之間的夾角。看看下面兩張圖片：

![](https://learnopengl.com/img/advanced-lighting/advanced_lighting_over_90.png)

這下問題應該很明顯了。左圖顯示了熟悉的 Phong 反射，其中 $\theta$ 小於 90 度。在右圖中，我們可以看到視線和反射向量之間的夾角 $\theta$ 大於 90 度，這導致鏡面貢獻為零。這通常不是問題，因為視線方向與反射方向相距甚遠，但如果我們使用較低的鏡面指數，鏡面半徑就足夠大，可以在這些條件下產生貢獻。由於我們在角度大於 90 度時將此貢獻歸零，因此會出現第一張圖片中看到的偽影。

1977 年，James F. Blinn 引入了 `Blinn-Phong` 著色模型，作為我們目前使用的 Phong 著色的擴展。Blinn-Phong 模型大體相似，但處理鏡面模型的方式略有不同，因此克服了我們的問題。我們不再依賴反射向量，而是使用一個所謂的 `半向量`，它是一個單位向量，正好位於視線方向和光線方向之間的中點。這個半向量與表面法線向量對齊得越緊密，鏡面貢獻就越高。

![](https://learnopengl.com/img/advanced-lighting/advanced_lighting_halfway_vector.png)

當視線方向與（現在虛擬的）反射向量完美對齊時，半向量會與法線向量完美對齊。視線方向越接近原始反射方向，鏡面高光就越強。

在這裡你可以看到，無論觀察者從哪個方向看，半向量與表面法線之間的角度永遠不會超過 90 度（當然，除非光線遠低於表面）。結果與 Phong 反射略有不同，但通常在視覺上更為合理，尤其是在鏡面指數較低的情況下。Blinn-Phong 著色模型也是 OpenGL 早期固定功能管線中使用的確切著色模型。

獲取半向量很簡單，我們將光線的方向向量和視線向量相加並將結果正規化：

```math
\bar{H} = \frac{\bar{L} + \bar{V}}{||\bar{L} + \bar{V}||}
```

這轉換為 GLSL 程式碼如下：

```cpp
vec3 lightDir   = normalize(lightPos - FragPos);
vec3 viewDir    = normalize(viewPos - FragPos);
vec3 halfwayDir = normalize(lightDir + viewDir);
```

然後，鏡面項的實際計算就變成了表面法線與半向量之間的鉗位點積，以獲得它們之間的餘弦角，我們再次將其提高到鏡面光澤指數：

```cpp
float spec = pow(max(dot(normal, halfwayDir), 0.0), shininess);
vec3 specular = lightColor * spec;
```

Blinn-Phong 的內容就只有我們剛才描述的這些。Blinn-Phong 和 Phong 鏡面反射之間唯一的區別在於，我們現在測量的是法線和半向量之間的角度，而不是視線和反射向量之間的角度。

引入半向量後，我們應該不再有 Phong 著色的鏡面截止問題。下圖顯示了兩種方法在鏡面指數為 `0.5` 時的鏡面區域：

![](https://learnopengl.com/img/advanced-lighting/advanced_lighting_comparrison.png)

Phong 和 Blinn-Phong 著色之間另一個細微的差異是，半向量與表面法線之間的角度通常比視線與反射向量之間的角度短。因此，為了獲得與 Phong 著色相似的視覺效果，鏡面光澤指數必須設定得更高一些。一般來說，經驗法則是將其設定為 Phong 光澤指數的 2 到 4 倍。

以下是兩種鏡面反射模型的比較，其中 Phong 指數設定為 `8.0`，Blinn-Phong 分量設定為 `32.0`：

![](https://learnopengl.com/img/advanced-lighting/advanced_lighting_comparrison2.png)

你可以看到 Blinn-Phong 的鏡面指數與 Phong 相比，光斑更銳利一些。通常需要稍微調整才能獲得與你之前使用 Phong 著色時類似的結果。不過這是值得的，因為 Blinn-Phong 著色通常比預設的 Phong 著色更真實。

這裡我們使用了一個簡單的片段著色器，它可以在常規 Phong 反射和 Blinn-Phong 反射之間切換：

```cpp
void main()
{
    [...]
    float spec = 0.0;
    if(blinn)
    {
        vec3 halfwayDir = normalize(lightDir + viewDir);
        spec = pow(max(dot(normal, halfwayDir), 0.0), 16.0);
    }
    else
    {
        vec3 reflectDir = reflect(-lightDir, normal);
        spec = pow(max(dot(viewDir, reflectDir), 0.0), 8.0);
    }
```

你可以在[這裡](https://learnopengl.com/code_viewer_gh.php?code=src/5.advanced_lighting/1.advanced_lighting/advanced_lighting.cpp)找到這個簡單範例的原始碼。透過按下 `b` 鍵，範例會從 Phong 光照切換到 Blinn-Phong 光照，反之亦然。
