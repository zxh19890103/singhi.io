---
layout: bookdetail
chapter: 二十四
title: 高級 OpenGL &bull; Framebuffers
category: tech
src: "https://learnopengl.com/Advanced-OpenGL/Framebuffers"
date: 2025-06-30
math: 1
book: opengl
image: "https://learnopengl.com/img/advanced/framebuffers_screen_texture.png"
order: 24
lang: zh
glcate: Advanced-OpenGL
gltopic: Framebuffers
permalink: /opengl/Advanced-OpenGL/Framebuffers
---

到目前為止，我們已經使用了幾種類型的螢幕緩衝區：用於寫入顏色值的**顏色緩衝區**、用於寫入和測試深度資訊的**深度緩衝區**，以及最後允許我們根據某些條件捨棄特定片段的**模板緩衝區**。這些緩衝區的組合儲存在 GPU 記憶體中的某個位置，並被稱為**幀緩衝區**（`framebuffer`）。OpenGL 賦予我們定義自己幀緩衝區的靈活性，因此我們可以定義自己的顏色（以及可選的深度和模板）緩衝區。

我們迄今為止所做的所有渲染操作都是在附加到**預設幀緩衝區**（`default framebuffer`）的渲染緩衝區之上完成的。預設幀緩衝區在您建立視窗時（GLFW 為我們完成此操作）被建立和配置。透過建立我們自己的幀緩衝區，我們可以獲得一個額外的渲染目標。

幀緩衝區的應用可能不會立即讓人明白，但將您的場景渲染到不同的幀緩衝區，可以讓我們使用該結果在場景中建立鏡像，或者實現酷炫的後製處理效果。首先我們將討論它們的實際運作方式，然後我們將透過實作那些酷炫的後製處理效果來使用它們。

## 建立一個幀緩衝區

就像 OpenGL 中的任何其他物件一樣，我們可以透過呼叫 `glGenFramebuffers` 函式來建立一個**幀緩衝區物件**（`framebuffer object`，縮寫為 FBO）：

```cpp
unsigned int fbo;
glGenFramebuffers(1, &fbo);
```

這種物件建立與使用的模式我們已經看過數十次了，所以它們的使用函式與我們見過的其他所有物件都相似：首先我們建立一個幀緩衝區物件，將其綁定為當前活躍的幀緩衝區，執行一些操作，然後解除綁定幀緩衝區。要綁定幀緩衝區，我們使用 `glBindFramebuffer`：

```cpp
glBindFramebuffer(GL_FRAMEBUFFER, fbo);
```

透過綁定至 **`GL_FRAMEBUFFER`** 目標，接下來所有的**讀取**（read）和**寫入**（write）幀緩衝區操作都將影響當前綁定的幀緩衝區。也可以透過分別綁定至 **`GL_READ_FRAMEBUFFER`** 或 **`GL_DRAW_FRAMEBUFFER`**，將幀緩衝區專門綁定至讀取或寫入目標。綁定至 `GL_READ_FRAMEBUFFER` 的幀緩衝區將用於所有讀取操作，例如 `glReadPixels`；而綁定至 `GL_DRAW_FRAMEBUFFER` 的幀緩衝區則用作渲染、清除及其他寫入操作的目的地。不過，大多數情況下你不需要做這種區分，通常會直接綁定到 `GL_FRAMEBUFFER`，它同時涵蓋讀取和寫入。

遺憾的是，我們的幀緩衝區目前還無法使用，因為它並不「**完整**」（`complete`）。一個幀緩衝區必須滿足以下要求才能算是完整：

- 我們必須至少附加一個緩衝區（顏色、深度或模板緩衝區）。
- 必須至少有一個顏色附件。
- 所有附件本身也必須是完整的（即已保留記憶體）。
- 每個緩衝區應具有相同數量的採樣數（samples）。

如果你不了解採樣數是什麼，別擔心，我們會在[之後的章節](/opengl/Advanced-OpenGL/Anti-Aliasing)中討論。

從這些要求中可以清楚看出，我們需要為幀緩衝區建立某種附件，並將其附加到幀緩衝區。在我們滿足所有要求後，可以透過呼叫 `glCheckFramebufferStatus` 並傳入 `GL_FRAMEBUFFER` 來檢查是否成功完成幀緩衝區的設定。它會檢查當前綁定的幀緩衝區，並回傳規格中列出的[任何這些值](https://www.khronos.org/registry/OpenGL-Refpages/gl4/html/%67lCheckFramebufferStatus.xhtml)。如果它回傳 **`GL_FRAMEBUFFER_COMPLETE`**，那麼我們就可以開始使用了。

```cpp
if(glCheckFramebufferStatus(GL_FRAMEBUFFER) == GL_FRAMEBUFFER_COMPLETE)
  // execute victory dance
```

所有後續的渲染操作現在都會渲染到目前綁定幀緩衝區的附件上。由於我們的幀緩衝區不是預設幀緩衝區，渲染指令將不會對您視窗的視覺輸出產生任何影響。因此，這種渲染到不同幀緩衝區的行為被稱為「**離屏渲染**」（`off-screen rendering`）。如果您希望所有渲染操作再次對主視窗產生視覺影響，我們需要透過綁定到 `0` 來啟用預設幀緩衝區：

```cpp
glBindFramebuffer(GL_FRAMEBUFFER, 0);
```

當我們完成所有幀緩衝區操作後，別忘了刪除幀緩衝區物件：

```cpp
glDeleteFramebuffers(1, &fbo);
```

現在，在執行完整性檢查之前，我們需要將一個或多個**附件**（attachment）附加到幀緩衝區。附件是記憶體中的一個位置，可以作為幀緩衝區的緩衝區，你可以將它想像成一張圖片。在建立附件時，我們有兩種選擇：**紋理**（textures）或**渲染緩衝區**（`renderbuffer`）物件。

### 紋理附件

當把**紋理**（texture）附加到幀緩衝區時，所有的渲染指令都會寫入到該紋理，就像它是一個普通的顏色/深度或模板緩衝區一樣。使用紋理的優點是，渲染輸出會儲存在紋理圖像中，這樣我們就能在著色器中輕鬆使用它。

為幀緩衝區建立紋理的過程大致與建立普通紋理相同：

```cpp
unsigned int texture;
glGenTextures(1, &texture);
glBindTexture(GL_TEXTURE_2D, texture);

glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB, 800, 600, 0, GL_RGB, GL_UNSIGNED_BYTE, NULL);

glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
```

這當中的主要區別在於，我們將紋理的尺寸設定為與螢幕大小相同（儘管這不是強制性的），並且將 `NULL` 作為紋理的 `data` 參數。對於這個紋理，我們只是分配了記憶體，但沒有實際填充它。紋理的填充會在我們渲染到幀緩衝區時發生。另外請注意，我們不關心任何環繞方式或 Mipmap，因為在大多數情況下我們不會用到它們。

{% include box.html content="如果你想將整個螢幕渲染到一個尺寸更大或更小的紋理上，你需要再次呼叫 `glViewport`（在渲染到你的幀緩衝區之前），並傳入你的紋理的新尺寸，否則渲染指令只會填充紋理的一部分。" color="green" %}

現在我們已經建立了一個紋理，最後需要做的就是將它附加到幀緩衝區：

```cpp
glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, texture, 0);
```

`glFrameBufferTexture2D` 函式具有以下參數：

- `target`：我們目標的幀緩衝區類型（繪製、讀取或兩者）。
- `attachment`：我們要附加的附件類型。現在我們附加的是一個顏色附件。請注意，末尾的 `0` 表示我們可以附加超過 1 個顏色附件。我們將在後續章節中討論這部分。
- `textarget`：您要附加的紋理類型。
- `texture`：要附加的實際紋理。
- `level`：Mipmap 等級。我們將其保持為 `0`。

除了顏色附件，我們還可以將深度和模板紋理附加到幀緩衝區物件。要附加深度附件，我們將附件類型指定為 **`GL_DEPTH_ATTACHMENT`**。請注意，此時紋理的 `format` 和 `internalformat` 類型應變為 **`GL_DEPTH_COMPONENT`**，以反映深度緩衝區的儲存格式。要附加模板緩衝區，您可以使用 **`GL_STENCIL_ATTACHMENT`** 作為第二個參數，並將紋理的格式指定為 **`GL_STENCIL_INDEX`**。

也可以將深度緩衝區和模板緩衝區作為單一紋理附加。此時，紋理的每個 32 位元值包含 24 位元的深度資訊和 8 位元的模板資訊。要將深度和模板緩衝區作為一個紋理附加，我們使用 **`GL_DEPTH_STENCIL_ATTACHMENT`** 類型，並將紋理的格式配置為包含組合的深度和模板值。以下是一個將深度和模板緩衝區作為單一紋理附加到幀緩衝區的範例：

```cpp
glTexImage2D(
  GL_TEXTURE_2D, 0, GL_DEPTH24_STENCIL8, 800, 600, 0,
  GL_DEPTH_STENCIL, GL_UNSIGNED_INT_24_8, NULL
);

glFramebufferTexture2D(GL_FRAMEBUFFER, GL_DEPTH_STENCIL_ATTACHMENT, GL_TEXTURE_2D, texture, 0);
```

### 渲染緩衝區物件附件

`渲染緩衝區物件`是在紋理之後，作為一種可能的幀緩衝區附件類型被引入 OpenGL 的。就像紋理圖像一樣，渲染緩衝區物件是一個實際的緩衝區，例如位元組、整數、像素等陣列。然而，渲染緩衝區物件不能直接讀取。這賦予它額外的優勢，即 OpenGL 可以執行一些記憶體最佳化，這可以在對幀緩衝區進行離屏渲染時，提供比紋理更好的效能。

渲染緩衝區物件將所有渲染資料直接儲存到其緩衝區中，無需轉換為紋理特定格式，這使得它們作為可寫儲存介質更快。你不能直接從它們讀取，但可以透過緩慢的 `glReadPixels` 讀取。這會從當前綁定的幀緩衝區返回指定區域的像素，而不是直接從附件本身讀取。

由於它們的資料是原生格式，因此在寫入資料或將資料複製到其他緩衝區時，它們的速度非常快。因此，在使用渲染緩衝區物件時，切換緩衝區等操作非常快。我們在每幀結束時使用的 `glfwSwapBuffers` 函式，很可能就是使用渲染緩衝區物件實現的：我們簡單地寫入一個渲染緩衝區圖像，並在結束時切換到另一個。渲染緩衝區物件非常適合這類操作。

建立渲染緩衝區物件的程式碼與幀緩衝區的程式碼相似：

```cpp
unsigned int rbo;
glGenRenderbuffers(1, &rbo);
```

同樣地，我們需要綁定渲染緩衝區物件，這樣所有後續的渲染緩衝區操作都會影響當前的 `rbo`：

```cpp
glBindRenderbuffer(GL_RENDERBUFFER, rbo);
```

由於渲染緩衝區物件是唯寫的，它們經常被用作深度和模板附件，因為大多數時候我們並不需要真正從中讀取值，但我們確實關心深度和模板測試。我們**需要**深度和模板值進行測試，但不需要**採樣**這些值，因此渲染緩衝區物件非常適合此用途。當我們不從這些緩衝區採樣時，通常會優先選擇渲染緩衝區物件。

建立深度和模板渲染緩衝區物件是透過呼叫 `glRenderbufferStorage` 函式來完成的：

```cpp
glRenderbufferStorage(GL_RENDERBUFFER, GL_DEPTH24_STENCIL8, 800, 600);
```

建立渲染緩衝區物件與紋理物件類似，不同之處在於，渲染緩衝區物件是專門設計用作幀緩衝區附件，而非像紋理那樣的通用資料緩衝區。這裡我們選擇了 `GL_DEPTH24_STENCIL8` 作為內部格式，它分別以 24 位元和 8 位元儲存深度和模板緩衝區。

最後剩下的就是實際附加渲染緩衝區物件：

```cpp
glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_DEPTH_STENCIL_ATTACHMENT, GL_RENDERBUFFER, rbo);
```

渲染緩衝區物件在您的離屏渲染專案中可能更有效率，但重要的是要了解何時使用渲染緩衝區物件，以及何時使用紋理。一般原則是，如果您從不需要從特定緩衝區採樣資料，那麼為該特定緩衝區使用渲染緩衝區物件是明智的選擇。如果您需要從特定緩衝區（如顏色或深度值）採樣資料，則應該改用紋理附件。

## 渲染到紋理

既然我們（或多或少）了解了幀緩衝區的運作方式，現在是時候好好利用它們了。我們將場景渲染到一個附加到我們所建立幀緩衝區物件的顏色紋理中，然後將這個紋理繪製到一個覆蓋整個螢幕的簡單四邊形上。這樣一來，視覺輸出將與沒有幀緩衝區時完全相同，但這次所有內容都呈現在一個單一的四邊形上。那麼，這有什麼用呢？在下一節中我們將看到原因。

首先要做的是建立一個實際的幀緩衝區物件並將其綁定，這一切都相對簡單：

```cpp
unsigned int framebuffer;
glGenFramebuffers(1, &framebuffer);
glBindFramebuffer(GL_FRAMEBUFFER, framebuffer);
```

接下來，我們建立一個紋理圖像，並將其作為顏色附件附加到幀緩衝區。我們將紋理的尺寸設定為與視窗的寬度與高度相同，並讓其資料保持未初始化：

```cpp
// generate texture
unsigned int textureColorbuffer;
glGenTextures(1, &textureColorbuffer);
glBindTexture(GL_TEXTURE_2D, textureColorbuffer);
glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB, 800, 600, 0, GL_RGB, GL_UNSIGNED_BYTE, NULL);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR );
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
glBindTexture(GL_TEXTURE_2D, 0);

// attach it to currently bound framebuffer object
glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, textureColorbuffer, 0);
```

我們也需要確保 OpenGL 能夠進行**深度測試**（並且可選地進行模板測試），因此我們必須確保為幀緩衝區添加一個**深度**（以及模板）附件。由於我們只會採樣顏色緩衝區，而不會採樣其他緩衝區，因此我們可以為此目的建立一個**渲染緩衝區物件**。

建立渲染緩衝區物件並不困難。我們唯一需要記住的是，我們將其建立為**深度**和**模板**附件的渲染緩衝區物件。我們將其**內部格式**設定為 `GL_DEPTH24_STENCIL8`，這對我們的目的來說已經足夠精確了：

```cpp
unsigned int rbo;
glGenRenderbuffers(1, &rbo);
glBindRenderbuffer(GL_RENDERBUFFER, rbo);
glRenderbufferStorage(GL_RENDERBUFFER, GL_DEPTH24_STENCIL8, 800, 600);
glBindRenderbuffer(GL_RENDERBUFFER, 0);
```

一旦我們為渲染緩衝區物件分配了足夠的記憶體，就可以解除綁定該渲染緩衝區。

接著，在完成幀緩衝區之前的最後一步，我們將渲染緩衝區物件附加到幀緩衝區的深度**和**模板附件：

```cpp
glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_DEPTH_STENCIL_ATTACHMENT, GL_RENDERBUFFER, rbo);
```

接著，我們要檢查幀緩衝區是否完整，如果沒有，就印出錯誤訊息。

```cpp
if(glCheckFramebufferStatus(GL_FRAMEBUFFER) != GL_FRAMEBUFFER_COMPLETE)
	std::cout << "ERROR::FRAMEBUFFER:: Framebuffer is not complete!" << std::endl;
glBindFramebuffer(GL_FRAMEBUFFER, 0);
```

請務必**解除綁定**幀緩衝區，以確保我們不會意外地渲染到錯誤的幀緩衝區。

現在幀緩衝區已完整，要將場景渲染到幀緩衝區的緩衝區而非預設幀緩衝區，只需簡單地**綁定**該幀緩衝區物件即可。所有後續的渲染指令都將影響當前綁定的幀緩衝區。如果深度和模板附件可用，所有深度和模板操作也會從當前綁定的幀緩衝區中讀取。例如，如果您省略了深度緩衝區，所有深度測試操作將不再起作用。

因此，要將場景繪製到單一紋理上，我們必須採取以下步驟：

1.  如往常一樣，將新的幀緩衝區綁定為活躍幀緩衝區，然後渲染場景。
2.  綁定回預設幀緩衝區。
3.  繪製一個覆蓋整個螢幕的四邊形，並將新幀緩衝區的顏色緩衝區作為其紋理。

我們將渲染在[深度測試](/opengl/Advanced-OpenGL/Depth-testing)章節中使用過的相同場景，但這次使用舊式的[容器](https://learnopengl.com/img/textures/container.jpg)紋理。

為了渲染這個四邊形，我們將建立一套全新的簡單著色器。我們不會包含複雜的矩陣變換，因為我們將以[正規化設備座標](https://learnopengl.com/code_viewer.php?code=advanced/framebuffers_quad_vertices)的形式提供頂點座標，這樣我們就可以直接將它們作為頂點著色器的輸出。頂點著色器如下所示：

```cpp
#version 330 core
layout (location = 0) in vec2 aPos;
layout (location = 1) in vec2 aTexCoords;

out vec2 TexCoords;

void main()
{
    gl_Position = vec4(aPos.x, aPos.y, 0.0, 1.0);
    TexCoords = aTexCoords;
}
```

沒什麼特別花俏的。片段著色器甚至更為基本，因為我們唯一需要做的就是從紋理中取樣：

```cpp
#version 330 core
out vec4 FragColor;

in vec2 TexCoords;

uniform sampler2D screenTexture;

void main()
{
    FragColor = texture(screenTexture, TexCoords);
}
```

由你來為螢幕四邊形建立並配置一個 VAO。幀緩衝區程序的單次渲染迭代具有以下結構：

```cpp
// first pass
glBindFramebuffer(GL_FRAMEBUFFER, framebuffer);
glClearColor(0.1f, 0.1f, 0.1f, 1.0f);
glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT); // we're not using the stencil buffer now
glEnable(GL_DEPTH_TEST);
DrawScene();

// second pass
glBindFramebuffer(GL_FRAMEBUFFER, 0); // back to default
glClearColor(1.0f, 1.0f, 1.0f, 1.0f);
glClear(GL_COLOR_BUFFER_BIT);

screenShader.use();
glBindVertexArray(quadVAO);
glDisable(GL_DEPTH_TEST);
glBindTexture(GL_TEXTURE_2D, textureColorbuffer);
glDrawArrays(GL_TRIANGLES, 0, 6);
```

有幾點需要注意。首先，由於我們使用的每個幀緩衝區都有自己的一組緩衝區，因此我們需要透過呼叫 `glClear` 並設定適當的位元來清除每個緩衝區。其次，在繪製四邊形時，我們禁用了深度測試，因為我們希望確保四邊形始終在其他所有物體的前面渲染；但在繪製正常場景時，我們必須再次啟用深度測試。

這裡有很多步驟都可能出錯，所以如果你沒有任何輸出，請盡可能嘗試偵錯並重新閱讀章節中的相關部分。如果一切順利，你將會得到一個看起來像這樣的視覺結果：

![](https://learnopengl.com/img/advanced/framebuffers_screen_texture.png)

左側顯示的是視覺輸出，與我們在[深度測試](/opengl/Advanced-OpenGL/Depth-testing)章節中看到的完全相同，但這次是渲染在一個簡單的四邊形上。如果我們以線框模式渲染場景，就能清楚地看到我們在預設幀緩衝區中只繪製了一個單一的四邊形。

您可以在[這裡](https://learnopengl.com/code_viewer_gh.php?code=src/4.advanced_opengl/5.1.framebuffers/framebuffers.cpp)找到該應用程式的原始碼。

那麼，這到底有什麼用呢？嗯，由於我們現在可以自由地將完整渲染的場景中每個像素作為單一紋理圖像來存取，我們就能在片段著色器中創造出一些有趣的特效了。

## 後期處理

現在整個場景都渲染到單一紋理上，我們可以透過操作場景紋理來創造出酷炫的**後期處理**（`post-processing`）效果。在本節中，我們將向您展示一些較受歡迎的後期處理效果，以及您如何憑藉一些額外的創意來創造自己的效果。

讓我們從一個最簡單的後期處理效果開始。

### 反相

我們可以存取渲染輸出的每個顏色，因此在片段著色器中回傳這些顏色的反相並不難。我們可以取螢幕紋理的顏色，並透過將其從 `1.0` 中減去來反相：

```cpp
void main()
{
    FragColor = vec4(vec3(1.0 - texture(screenTexture, TexCoords)), 1.0);
}
```

儘管反相是一個相對簡單的後期處理效果，但它已經能產生奇特的效果：

![](https://learnopengl.com/img/advanced/framebuffers_inverse.png)

整個場景的顏色現在都透過片段著色器中的一行程式碼實現了反相。是不是很酷？

### 灰階

另一個有趣的效果是將場景中除了白色、灰色和黑色之外的所有顏色移除，有效地將整個圖像灰階化。一個簡單的方法是取所有顏色分量並將它們的結果平均：

```cpp
void main()
{
    FragColor = texture(screenTexture, TexCoords);
    float average = (FragColor.r + FragColor.g + FragColor.b) / 3.0;
    FragColor = vec4(average, average, average, 1.0);
}
```

這樣做已經能產生相當不錯的結果，但人眼對綠色比較敏感，對藍色則最不敏感。所以為了獲得最符合物理真實的結果，我們需要使用加權通道：

```cpp
void main()
{
    FragColor = texture(screenTexture, TexCoords);
    float average = 0.2126 * FragColor.r + 0.7152 * FragColor.g + 0.0722 * FragColor.b;
    FragColor = vec4(average, average, average, 1.0);
}
```

![](https://learnopengl.com/img/advanced/framebuffers_grayscale.png)

你可能不會馬上注意到差異，但對於更複雜的場景，這種加權灰階效果通常會更真實。

## 核心效果

在單一紋理圖像上進行後期處理的另一個優勢是，我們可以從紋理中採樣不屬於該片段的其他部分的顏色值。例如，我們可以圍繞當前紋理座標取一個小區域，並在當前紋理值周圍採樣多個紋理值。然後，我們可以透過創意組合它們來創造出有趣的效果。

**核心**（`kernel`，或稱卷積矩陣）是一個以當前像素為中心的小型矩陣狀數值陣列，它將周圍像素值乘以其核心值，並將它們全部加起來形成一個單一值。我們透過對當前像素周圍的方向紋理座標添加一個小的偏移量，並根據核心組合結果。以下是一個核心的範例：

```math
\begin{bmatrix}2 & 2 & 2 \\ 2 & -15 & 2 \\ 2 & 2 & 2 \end{bmatrix}
```

這個核心（kernel）會取 8 個周圍的像素值，將它們乘以 `2`，然後將當前像素乘以 `-15`。這個範例核心將周圍像素乘以核心中預設的幾個權重，並透過將當前像素乘以一個較大的負權重來平衡結果。

{% include box.html content="你在網路上找到的大多數核心，如果將所有權重加起來，總和都會是 `1`。如果它們的總和不為 `1`，則表示最終的紋理顏色會比原始紋理值更亮或更暗。" color="green" %}

核心是後期處理極其有用的工具，因為它們使用和實驗起來都相當容易，而且網路上可以找到許多範例。我們確實需要稍微修改片段著色器，才能真正支援核心。我們假設每個我們將要使用的核心都是 3x3 的（大多數核心都是如此）：

```cpp
const float offset = 1.0 / 300.0;

void main()
{
    vec2 offsets[9] = vec2[](
        vec2(-offset,  offset), // top-left
        vec2( 0.0f,    offset), // top-center
        vec2( offset,  offset), // top-right
        vec2(-offset,  0.0f),   // center-left
        vec2( 0.0f,    0.0f),   // center-center
        vec2( offset,  0.0f),   // center-right
        vec2(-offset, -offset), // bottom-left
        vec2( 0.0f,   -offset), // bottom-center
        vec2( offset, -offset)  // bottom-right
    );

    float kernel[9] = float[](
        -1, -1, -1,
        -1,  9, -1,
        -1, -1, -1
    );

    vec3 sampleTex[9];
    for(int i = 0; i < 9; i++)
    {
        sampleTex[i] = vec3(texture(screenTexture, TexCoords.st + offsets[i]));
    }
    vec3 col = vec3(0.0);
    for(int i = 0; i < 9; i++)
        col += sampleTex[i] * kernel[i];

    FragColor = vec4(col, 1.0);
}
```

在片段著色器中，我們首先為每個周圍紋理座標建立一個包含 9 個 `vec2` 偏移量的陣列。這個偏移量是一個常數值，你可以根據喜好自訂。然後我們定義核心（kernel），在這裡是一個 `sharpen` 核心，它透過一種有趣的方式採樣所有周圍像素來銳化每個顏色值。最後，我們在採樣時將每個偏移量加到當前紋理座標上，並將這些紋理值與我們相加的加權核心值相乘。

這個特定的銳化核心看起來像這樣：

![](https://learnopengl.com/img/advanced/framebuffers_sharpen.png)

這可能會是一些有趣效果的基礎，例如你的玩家可能正在進行一場麻醉冒險。

### 模糊

產生「**模糊**」（`blur`）效果的核心定義如下：

```math
{\begin{bmatrix} 1 & 2 & 1 \\ 2 & 4 & 2 \\ 1 & 2 & 1 \end{bmatrix}} / 16
```

由於所有數值加起來等於 16，直接返回組合後的採樣顏色會導致顏色極度明亮，因此我們必須將核心中的每個數值都除以 `16`。這樣，最終的核心陣列就變成了：

```cpp
float kernel[9] = float[](
    1.0 / 16, 2.0 / 16, 1.0 / 16,
    2.0 / 16, 4.0 / 16, 2.0 / 16,
    1.0 / 16, 2.0 / 16, 1.0 / 16
);
```

透過只更改片段著色器中的核心陣列，我們就能徹底改變後期處理效果。它現在看起來像這樣：

![](https://learnopengl.com/img/advanced/framebuffers_blur.png)

這種模糊效果創造了許多有趣的**可能性**。我們可以隨時間變化模糊量，以營造出某人喝醉酒的效果，或者在主角沒有戴眼鏡時增加模糊。模糊也是平滑顏色值的實用工具，我們將在後續章節中看到它的應用。

你可以看到，一旦我們有了這樣一個小型的核心（kernel）實作，創造酷炫的後期處理效果就變得相當容易了。讓我們向你展示最後一個流行的效果，以結束這次討論。

### 邊緣偵測

以下是一個類似銳化核心的「**邊緣偵測**」（`edge-detection`）核心：

```math
\begin{bmatrix}2 & 2 & 2 \\ 2 & -15 & 2 \\ 2 & 2 & 2 \end{bmatrix}
```

這個核心能凸顯所有邊緣並使其他部分變暗，這在我們只關心圖像中的邊緣時非常有用。

![](https://learnopengl.com/img/advanced/framebuffers_edge_detection.png)

您說的沒錯！像這類核心確實被廣泛應用於 Photoshop 等圖像處理工具的濾鏡功能中。由於圖形處理器 (GPU) 具備極強的平行處理能力，能夠同時處理大量的片段（像素），這使得我們能以相對輕鬆的方式，即時地對圖像進行逐像素的操作。因此，圖像編輯工具傾向於利用圖形卡來進行圖像處理。
