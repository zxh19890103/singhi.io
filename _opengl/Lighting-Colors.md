---
layout: bookdetail
chapter: 十一
description: "本文首先介紹了物理世界顏色的本質（相對），以及在計算機圖形領域，人們是如何模擬物理世界的色彩。人們將色彩的產生歸因於光源的顏色以及物體本身的顏色，二者相乘，就可以計算出物體被感知的顏色。根據這個模型，筆者寫了一個帶有光源的場景，凡是放置在其中的物件外觀顯示上都會被光源影響。"
title: 光 &bull; 顏色
category: tech
src: "https://learnopengl.com/Lighting/Colors"
date: 2025-06-25
book: opengl
image: "https://learnopengl.com/img/lighting/light_reflection.png"
---

> 譯者總結：本文首先介紹了物理世界顏色的本質（相對），以及在計算機圖形領域，人們是如何模擬物理世界的色彩。人們將色彩的產生歸因於光源的顏色以及物體本身的顏色，二者相乘，就可以計算出物體被感知的顏色。根據這個模型，筆者寫了一個帶有光源的場景，凡是放置在其中的物件外觀顯示上都會被光源影響。

此前章節，我們對顏色已經有一些使用和計算，但從未好好地對其進行一番定義。現在，我們將討論什麼是顏色，並著手構建一個專屬場景，為此後“光”主題下的章節所用。

在现实世界中，颜色可以取任何已知的颜色值，每个物体都有其自身的颜色。數字世界，我們需要將（無限多的）真實顏色映射為（有限多的）數位值，因此不是所有的真實顏色會被數字表達。顏色可以使用 `red`, `green` 和 `blue` 三個分量表達，經常被簡寫為 `RGB`。使用此三值的不同組合，三個值取值範圍均為 `[0,1]`，那麼我們就可以表達絕大多數的存在的顏色。比如，要得到 _coral_ 這個顏色，我們可以定義一個顏色向量：

```cpp
glm::vec3 coral(1.0f, 0.5f, 0.31f);
```

現實生活裡，我們所看見的物體的顏色並非其本身的顏色，而是其反射出來的顏色。不為物體所接納的顏色被我們感知到。舉個例子，太陽光，它被我們識別為白色，白色是許多不同顏色（圖片裡所見）結合之後的顏色。如果我們用它照射一個藍色的玩具，玩具將接納除了藍色之外的全部顏色分量（子顏色）。由於玩具不接收藍色部分，它被返回了。被返回的顏色進入我們的眼睛，使得這個玩具看起來就是藍色的。下圖顯示了這個說法，下圖顯示的是一個珊瑚色玩具，它反射出多種不同強度的顏色：

![](https://learnopengl.com/img/lighting/light_reflection.png)

你可以看到白色的陽光是所有可見光的集合，物體吸收了其大部分顏色。它所返回的顏色也就是其顏色，這些顏色的組合也就是我們能感知到的那個顏色（這裡就是珊瑚色）。

{% include box.html content="

技術上，這優點複雜，但是我們將在 PBR 主題下的章節裡去展開。

" color="green" %}

顏色的反射規則直接被運用到圖形領域。當我們在 OpenGL 中定義一個光源的時候，我們希望給光源<del>一點</del>（一個）顏色 😝。在之前的段落裡，我們有一個白色，因此我們也將給光源一個白色。如果我們將光源的顏色乘物體的顏色，那麼結果會是這個物體反射的顏色（也就是感知顏色）。讓我們再看看我們的玩具，看看我們該如何在圖形領域計算感知顏色。通過將對光和物體的顏色進行一個“分量乘法”，我們拿到結果：

```cpp
glm::vec3 lightColor(1.0f, 1.0f, 1.0f);
glm::vec3 toyColor(1.0f, 0.5f, 0.31f);
glm::vec3 result = lightColor * toyColor; // = (1.0f, 0.5f, 0.31f);
```

{% include color-compute.html color1="white" color2="coral" result="coral" %}

我們可以看到玩具的顏色 _接納_ 了大部分白色光，但是反射了一些紅色、綠色和藍色，基於它自身的顏色值。這就是現實生活中顏色運作機制的展示。我們因此定義物體的顏色為：_從光源反射出的顏色分量_。現在，如果是綠色的光會發生什麼呢？

```cpp
glm::vec3 lightColor(0.0f, 1.0f, 0.0f);
glm::vec3 toyColor(1.0f, 0.5f, 0.31f);
glm::vec3 result = lightColor * toyColor; // = (0.0f, 0.5f, 0.0f);
```

{% include color-compute.html color1="#00ff00" color2="#FF804F" result="#008000" %}

可以看到，玩具沒有紅色和藍色分量。玩具也吸收了光源綠色分量的一半。這樣，我們能感知到的玩具顏色是深綠色。可以看到如果我們使用綠色的光，是有綠色分量會被反射、被感知，不再有紅色和藍色被感知到。作為結果，珊瑚色物體突然變為深綠色。讓我們再來嘗試一個例子，使用深橄欖綠顏色的光：

```cpp
glm::vec3 lightColor(0.33f, 0.42f, 0.18f);
glm::vec3 toyColor(1.0f, 0.5f, 0.31f);
glm::vec3 result = lightColor * toyColor; // = (0.33f, 0.21f, 0.06f);
```

{% include color-compute.html color1="#546B2E" color2="#FF804F" result="#54360F" %}

如你所見，使用不同的顏色的光，我們可以從物體獲得有趣的顏色。要基於顏色做一些有創意的事並不難。

但是顏色的討論就這些，讓我們構建一個場景，以便讓我們在其中探索一番。

## 照明場景（A lighting scene）

在接下來的章節，我們將創造引人入勝的視覺效果。這會透過模擬真實光線來實現，並大量運用色彩。既然現在我們將使用光源，我們希望將其作為可見物體呈現在場景中，並至少添加一個物件，以模擬其所產生的光照效果。

第一件事，我們需要一個物件，光線會投射其上，並且，我們將使用前幾章裡的那個讓人討厭的集裝箱。我們也需要一個物件，它用於顯示光源在 3D 場景中的位置。簡單起見，我們將也使用一個方塊來表示光源（我們已經有了其[頂點數據](https://learnopengl.com/code_viewer.php?code=getting-started/cube_vertices_pos) right?)）。

那麼，填充頂點緩衝對象（VBO），配置頂點屬性指針，以及所有與此相關的東西，對你來說應該都算是熟悉的；因此，我們跳過那些步驟。如果你對那些是怎麼回事一無所知，那麼在繼續之前，我建議你回頭再去看一下[前面的章節](/opengl/Started-Hello-Triangle)，並且過一遍其中的練習，如果可能的話。

因此，第一件事，我們需要頂點著色器，用於繪製集裝箱。集裝箱的頂點數據都是一樣的（雖然這次我們將不使用紋理座標），因此代碼也將沒啥不一樣。我們將使用上個幾章裡的頂點著色器的精簡版本。

```cpp
#version 330 core
layout (location = 0) in vec3 aPos;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

void main()
{
    gl_Position = projection * view * model * vec4(aPos, 1.0);
}
```

確保對頂點數據和屬性指針進行更新，以匹配現在頂點著色器（如果你想，事實上，你也可以保持紋理數據及其屬性指針的激活態；我們現在只是不去使用它們）。

因為我們也要渲染一個光源立方體，所以我們想要特別為光源產生一個新的 VAO。我們可以利用相同的 VAO 渲染光源，然後對 `model` 矩陣進行一些光源位置轉換，但在接下來的章節中，我們會經常改變容器物件的頂點資料和屬性指標，而且我們不希望這些改變傳播到光源物件（我們只關心光源立方體的頂點位置），所以我們會建立一個新的 VAO：

```cpp
unsigned int lightVAO;
glGenVertexArrays(1, &lightVAO);
glBindVertexArray(lightVAO);
// we only need to bind to the VBO, the container's VBO's data already contains the data.
glBindBuffer(GL_ARRAY_BUFFER, VBO);
// set the vertex attribute
glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(float), (void*)0);
glEnableVertexAttribArray(0);
```

這段程式碼應該相對簡單。既然我們已經建立了容器和光源立方體，還剩下一個東西需要定義，那就是容器和光源的片段著色器：

```cpp
#version 330 core
out vec4 FragColor;

uniform vec3 objectColor;
uniform vec3 lightColor;

void main()
{
    FragColor = vec4(lightColor * objectColor, 1.0);
}
```

片段著色器接受來自 uniform 變數的物件顏色和光源顏色。在這裡，我們將光源的顏色與物件（反射）的顏色相乘，就像我們在本章開頭討論的那樣。同樣地，這個著色器應該很容易理解。讓我們將物件的顏色設定為上一節的珊瑚色，並搭配白色光源：

```cpp
// don't forget to use the corresponding shader program first (to set the uniform)
lightingShader.use();
lightingShader.setVec3("objectColor", 1.0f, 0.5f, 0.31f);
lightingShader.setVec3("lightColor",  1.0f, 1.0f, 1.0f);
```

還有一點需要注意的是，當我們在接下來的章節開始更新這些「光照著色器」時，光源立方體也會受到影響，而這並不是我們想要的。我們不希望光源物體的顏色受到光照計算的影響，而是希望光源與其他部分隔離開來。我們希望光源具有恆定的明亮顏色，不受其他顏色變化的影響（這使得光源立方體看起來確實是光的來源）。

為了達成這個目的，我們需要建立第二組著色器，用來繪製光源立方體，這樣就不會受到光照著色器的任何改變影響。頂點著色器和光照頂點著色器是相同的，所以你可以直接複製原始碼。光源立方體的片段著色器透過在燈上定義一個恆定的白色，確保立方體的顏色保持明亮：

為了達成這個目的，我們需要建立第二組著色器，用來繪製光源立方體，這樣就不會受到光照著色器的任何改變影響。頂點著色器和光照頂點著色器是相同的，所以你可以直接複製原始碼。光源立方體的片段著色器透過在燈上定義一個恆定的白色，確保立方體的顏色保持明亮：

```glsl
#version 330 core
out vec4 FragColor;

void main()
{
    FragColor = vec4(1.0); // set all 4 vector values to 1.0
}
```

當我們想要渲染時，我們會使用剛定義的光照著色器來渲染容器物件（也可能還有許多其他物件），而當我們想要繪製光源時，則使用光源的著色器。在「光照」章節中，我們將逐步更新光照著色器，以逐漸實現更真實的效果。

光源立方體的主要目的是顯示光的來源。我們通常會在場景中的某處定義光源的位置，但這只是一個沒有視覺意義的位置。為了顯示光源實際的位置，我們在光源的相同位置渲染一個立方體。我們使用光源立方體著色器來渲染這個立方體，以確保立方體始終保持白色，無論場景的光照條件如何。

所以，讓我們宣告一個全域的 `vec3` 變數，它代表光源在世界空間座標中的位置：

```cpp
glm::vec3 lightPos(1.2f, 1.0f, 2.0f);
```

然後，我們將光源立方體平移到光源的位置，並在渲染之前將其縮小：

```cpp
model = glm::mat4(1.0f);
model = glm::translate(model, lightPos);
model = glm::scale(model, glm::vec3(0.2f));
```

這樣一來，光源立方體的渲染程式碼應該會像這樣：

```cpp
lightCubeShader.use();
// set the model, view and projection matrix uniforms
[...]
// draw the light cube object
glBindVertexArray(lightCubeVAO);
glDrawArrays(GL_TRIANGLES, 0, 36);
```

將所有程式碼片段注入到其適當的位置後，將會產生一個乾淨的 OpenGL 應用程式，並正確配置以進行光照實驗。如果一切編譯成功，它應該會像這樣：

![](https://learnopengl.com/img/lighting/colors_scene.png)

目前看起來沒什麼特別的，但我保證在接下來的章節中會變得更有趣。

如果你在將所有程式碼片段整合到整個應用程式中遇到困難，請查看[這裡](https://learnopengl.com/code_viewer_gh.php?code=src/2.lighting/1.colors/colors.cpp)的原始碼，並仔細閱讀程式碼/註釋。

既然我們對顏色有了一定的了解，並建立了一個用於光照實驗的基本場景，我們就可以跳到[下一個](/opengl/Lighting-Basic-Lighting)章節，真正的魔法將從那裡開始。
