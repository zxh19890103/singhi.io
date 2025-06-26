---
layout: bookdetail
chapter: 五
short: "對於 OpenGL 來說，一切都發生在 3D 空間中，但螢幕或視窗其實是由二維像素所組成的陣列，因此 OpenGL 的主要工作之一就是將 3D 座標轉換為適合顯示在螢幕上的 2D 像素。這個從 3D 座標轉換為 2D 像素的過程是由 OpenGL 的圖形管線所處理的。圖形管線可以分為兩個主要部分：第一部分將 3D 座標轉換為 2D 座標，第二部分則將這些 2D 座標轉換為實際的彩色像素。本章將簡要介紹圖形管線的運作方式，並說明我們如何善用它來創造炫麗的像素效果。"
title: 开始 &bull; Hello, 三角形
src: https://learnopengl.com/Getting-started/Hello-Triangle
category: tech
date: 2025-05-29
tweet: 1
book: opengl
---

對於 OpenGL 來說，一切都發生在 3D 空間中，但螢幕或視窗其實是由二維像素所組成的陣列，因此 OpenGL 的主要工作之一就是將 3D 座標轉換為適合顯示在螢幕上的 2D 像素。這個從 3D 座標轉換為 2D 像素的過程是由 OpenGL 的圖形管線所處理的。圖形管線可以分為兩個主要部分：第一部分將 3D 座標轉換為 2D 座標，第二部分則將這些 2D 座標轉換為實際的彩色像素。本章將簡要介紹圖形管線的運作方式，並說明我們如何善用它來創造炫麗的像素效果。

圖形管線將一組 3D 座標作為輸入，並將其轉換為顯示在螢幕上的彩色 2D 像素。圖形管線可以分為多個步驟，每個步驟都需要前一個步驟的輸出作為輸入。這些步驟都是高度專職化的（每個步驟只執行特定的功能），而且很容易實現並行處理。正因為具有並行的特性，現今的顯示卡配備了成千上萬個小型處理核心，能夠快速地在圖形管線中處理大量資料。這些處理核心會在 GPU 上執行一些小型程式片段，來完成管線中的各個步驟。這些小程式就被稱為 Shader（著色器）。

有些著色器（shaders）是可由開發者自定義的，這讓我們能夠撰寫自己的 shader，以取代預設的內建 shader。這讓我們對圖形管線中的特定步驟擁有更精細的控制權。由於這些 shader 是在 GPU 上執行的，它們也能幫我們節省寶貴的 CPU 時間。Shader 是使用 OpenGL 的著色語言 GLSL 編寫的，我們將在下一章中深入探討這部分內容。

以下是圖形管線各階段的抽象示意圖。請注意，藍色部分代表我們可以插入自訂 shader 程式碼的位置。

{% include img.html src="https://learnopengl.com/img/getting-started/pipeline.png" %}

如你所見，圖形管線包含許多階段，每一個都負責處理將頂點數據轉換為最終像素的特定部分。我們將以簡明易懂的方式簡要介紹管線的各個階段，幫助你對整個管線的運作有一個清晰且全面的認識。

我們將一組三個 3D 座標作為圖形管線的輸入，這組數據稱為頂點數據，這些頂點數據組成一個三角形。頂點數據是由多個頂點構成的集合。每個頂點包含一組數據，用頂點屬性（vertex attributes）來表示，這些屬性可以包含任意你想要的數據。不過為了簡化起見，這裡假設每個頂點只包含一個 3D 位置和一些顏色值。

{% include box.html color="green" content="
為了讓 OpenGL 知道如何處理你這些座標和顏色值的數據集合，你需要告訴它想用這些數據繪製哪種類型的圖形。你是想把這些數據渲染成一組點、一組三角形，還是一條長線？這些指示稱為圖元（primitives），在調用繪製命令時會傳遞給 OpenGL。常見的圖元類型有 `GL_POINTS`、`GL_TRIANGLES` 和 `GL_LINE_STRIP`。
" %}

管線的第一個階段是頂點著色器（vertex shader），它接收單個頂點作為輸入。頂點著色器的主要作用是將 3D 座標轉換成另一組 3D 座標（稍後會詳細說明），同時允許我們對頂點屬性（vertex attributes）進行一些基本處理。

vertex shader 的輸出可選地傳入幾何著色器（geometry shader）。幾何著色器以形成一個圖元的一組頂點作為輸入，並能通過發射新的頂點來生成其他形狀，從而形成新的（或其他）圖元。在本例中，它根據給定的形狀生成了第二個三角形。

基本圖元組裝階段會從頂點著色器（或幾何著色器）接收所有構成一個或多個基本圖元的頂點（如果選擇的是 `GL_POINTS`，則為單個頂點），並將這些點組合成指定的基本圖元形狀；本例中為兩個三角形。

接著，基本圖元組裝階段的輸出會傳入光柵化階段，在這裡它將基本圖元映射到最終屏幕上的相應像素，產生片段供片段著色器使用。在片段著色器運行之前，會先執行裁剪。裁剪會捨棄所有視野之外的片段，從而提升性能。

{% include box.html color="green" content="
 OpenGL 中的 fragment（片段）是指渲染單個像素所需的全部數據。
" %}

片段著色器的主要目的是計算最終的像素顏色，這一階段通常就是所有高級 OpenGL 效果產生的地方。通常，片段著色器會包含關於 3D 場景的數據，藉此計算像素的最終顏色（例如光源、陰影、光的顏色等等）。

所有顏色值確定之後，最終結果會進入一個稱為 Alpha 測試與混合（Blending） 的階段。這個階段會檢查 fragment 所對應的深度值（以及模板值，這部分我們稍後會說明），藉此判斷該 fragment 是位於其他物體的前方還是後方，並據此決定是否應該被捨棄。同時，這個階段也會檢查 alpha 值（alpha 值代表物體的不透明程度），並根據它進行顏色混合。因此，即使在片段著色器中計算出了某個像素的顏色值，當多個三角形一同被渲染時，最終呈現出的像素顏色仍可能完全不同。

正如你所見，圖形管線是一個相當複雜的整體，包含許多可配置的階段。不過，在絕大多數情況下，我們只需要與頂點著色器和片段著色器打交道。幾何著色器是可選的，通常會使用預設的設定。此外，還有**細分階段（Tessellation Stage）與變換回饋（Transform Feedback）**階段，我們在這裡尚未提及，稍後會再做說明。

在現代 OpenGL 中，我們必須自行定義至少一個頂點著色器與一個片段著色器（GPU 並不提供預設的頂點或片段著色器）。也正因如此，初學現代 OpenGL 往往顯得格外困難——即使只是要繪製一個最基本的三角形，也需要先掌握大量基礎知識。不過，一旦你在本章末順利畫出你的第一個三角形，你將會對圖形程式設計有更深刻的理解與認識。

## 頂點輸入

要開始繪製任何圖形，首先必須將一些頂點資料傳遞給 OpenGL。由於 OpenGL 是一個 3D 圖形函式庫，因此我們在其中所指定的所有座標都是三維的（包含 x、y、z 軸）。

需要注意的是，OpenGL 並不會直接將這些 3D 座標轉換為螢幕上的 2D 像素；它只會處理那些位於特定範圍內的 3D 座標——也就是在 x、y、z 三軸上都落在 `-1.0` 到 `1.0` 之間的座標。這個範圍被稱為標準化裝置座標（Normalized Device Coordinates，簡稱 NDC）。所有落在這個範圍內的座標才會被映射到螢幕上呈現；而超出此範圍的座標則會被裁剪，無法顯示出來。

由於我們要繪製一個三角形，因此需要定義三個頂點，而每個頂點都必須包含一個三維座標（3D position）。

這些座標會被定義在 標準化裝置座標（Normalized Device Coordinates，即 OpenGL 的可見區域）中，並透過一個 浮點數陣列（float array）來表示。

```cpp
float vertices[] = {
    -0.5f, -0.5f, 0.0f,
     0.5f, -0.5f, 0.0f,
     0.0f,  0.5f, 0.0f
};
```

由於 OpenGL 處理的是三維空間，我們在渲染一個二維三角形時，會將每個頂點的 z 座標設為 `0.0`。這樣一來，三角形在深度上的位置就保持一致，讓它看起來像是平面的二維圖形。

{% include box.html color="green" content="

#### 標準設備座標 （NDC）

當你的頂點座標在頂點著色器中處理完成後，它們應該會被轉換到標準化裝置座標系（Normalized Device Coordinates，簡稱 NDC）。NDC 是一個範圍非常小的三維空間，其中 x、y、z 三個軸的座標值都介於 `-1.0` 到 `1.0` 之間。任何落在這個範圍之外的座標都會被裁剪（clipped），也就是不會顯示在螢幕上。下圖顯示了我們所定義的三角形，它位於 NDC 空間中（這裡我們忽略 z 軸）：

<img src='https://learnopengl.com/img/getting-started/ndc.png'>

與常見的螢幕座標系不同，NDC 空間中 y 軸的正方向是朝上，而 (0, 0) 座標位於螢幕中央，而不是左上角。你必須確保所有經過轉換的頂點座標最終都落在這個 NDC 空間中，否則它們將不會被渲染出來。

接下來，這些 NDC 座標會透過 視口變換（viewport transform） 被轉換為螢幕空間座標。這個轉換使用的是你透過 `glViewport` 所提供的視口參數。轉換完成後，螢幕座標將會產生對應的 fragment，作為片段著色器的輸入。

" %}

在定義好頂點數據之後，我們希望將它作為輸入發送到圖形管線的第一個階段：頂點著色器（Vertex Shader）。這個過程需要在 GPU 上開闢一塊記憶體來儲存頂點資料，接著我們需要設定 OpenGL 如何解讀這塊記憶體的資料格式，並指定如何將這些資料傳遞給顯示卡。頂點著色器會根據我們的設定，從這塊記憶體中讀取並處理相對應數量的頂點。

我們透過所謂的 頂點緩衝物件（Vertex Buffer Object, VBO） 來管理這塊記憶體區域，它能在 GPU 的記憶體中儲存大量頂點資料。使用這些緩衝物件的好處在於，我們可以一次性將大量資料批次傳送到顯示卡，並且只要記憶體足夠，資料就會一直保存在那裡，而不必一個頂點一個頂點地發送。由於從 CPU 傳輸資料到顯示卡的速度相對較慢，因此我們盡可能一次送出更多資料。資料一旦儲存在顯示卡記憶體中，頂點著色器便能幾乎即時存取這些頂點，極大地提升了處理效率。

頂點緩衝物件（Vertex Buffer Object，簡稱 VBO）是我們在 [OpenGL](https://learnopengl.com/Getting-Started/OpenGL) 章節中首次接觸到的 OpenGL 物件。跟其他 OpenGL 物件一樣，這個緩衝物件有一個對應的唯一 ID，因此我們可以使用 `glGenBuffers` 函數來生成這個緩衝物件的 ID：

```cpp
unsigned int VBO;
glGenBuffers(1, &VBO);
```

OpenGL 有多種類型的緩衝物件，而頂點緩衝物件（VBO）所對應的緩衝類型是 `GL_ARRAY_BUFFER`。OpenGL 允許我們同時綁定多個緩衝物件，只要它們的緩衝類型不同。我們可以使用 `glBindBuffer` 函數，將新建立的緩衝物件綁定到 `GL_ARRAY_BUFFER` 目標：

```cpp
glBindBuffer(GL_ARRAY_BUFFER, VBO);
```

從這時起，對 `GL_ARRAY_BUFFER` 目標所做的任何緩衝區操作，都會作用於當前綁定的緩衝區，也就是這個頂點緩衝對象（VBO）。接著，我們可以呼叫 `glBufferData` 函數，將先前定義的頂點資料複製到該緩衝區的記憶體中：

```cpp
glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);
```

`glBufferData` 是一個專門用來將用戶定義的數據複製到當前綁定緩衝區的函數。它的第一個參數是要複製數據的緩衝類型，也就是目前綁定在 `GL_ARRAY_BUFFER` 目標上的頂點緩衝對象。第二個參數指定要傳入緩衝區的數據大小（以字節為單位），這裡通常用 `sizeof` 來計算頂點數據的大小。第三個參數則是我們要發送的實際數據。

第四個參數用來指定顯示卡如何管理這些數據，它有三種選項：

- *`GL_STREAM_DRAW`*：數據只會發送一次，且通常被 GPU 使用的次數較少（幾次左右）。
- *`GL_STATIC_DRAW`*：數據只會發送一次，但會被 GPU 多次使用，適合靜態數據。
- *`GL_DYNAMIC_DRAW`*：數據會經常修改，並且會被 GPU 多次使用，適合動態變化的數據。

三角形的位置數據不會改變，使用頻率高，且每次渲染都保持不變，因此最適合設定 `usage type` 為 `GL_STATIC_DRAW`。
反之，若某個緩衝區內的數據經常被修改，設定為 `GL_DYNAMIC_DRAW`，能讓顯示卡將數據存放於更適合快速寫入的內存區，提升性能。

截至目前，我們已經把頂點數據存放在顯示卡的記憶體中，並使用 VBO（頂點緩衝物件）來管理它們。接下來，我們要建立頂點著色器和片段著色器，來真正處理這些數據。那麼，讓我們開始編寫這兩個著色器吧！

## 顶点着色器 （Vertex Shader）

頂點著色器是可由我們這類使用者編寫的可編程著色器之一。現代 OpenGL 要求如果想要進行渲染，至少必須設置一個頂點著色器和一個片段著色器。因此，我們將簡單介紹著色器的概念，並配置兩個非常簡單的著色器，用來繪製我們的第一個三角形。下一章會更深入地講解著色器。

首先，我們需要撰寫一個頂點著色器，使用 GLSL（OpenGL 著色語言）來編寫，接著將這個著色器編譯，這樣才能在我們的應用程式中使用。下面是用 GLSL 寫成的非常基礎的頂點著色器原始碼：

```cpp
#version 330 core
layout (location = 0) in vec3 aPos;

void main()
{
    gl_Position = vec4(aPos.x, aPos.y, aPos.z, 1.0);
}
```

如你所見，GLSL 的語法和 C 語言相似。每個著色器程式碼開頭都會宣告版本號。從 OpenGL 3.3 開始，GLSL 的版本號會與 OpenGL 的版本號對應（例如，GLSL 版本 420 對應 OpenGL 版本 4.2）。我們也會明確標示出使用的是核心（core）配置的功能。

接下來，我們在頂點著色器中使用 in 關鍵字聲明所有輸入的頂點屬性。目前我們只關心頂點的位置數據，因此只需要一個頂點屬性。GLSL 提供了矢量類型，包含 1 到 4 個浮點數，這個數量由類型名稱後綴的數字決定。由於每個頂點有一個三維座標，我們定義了一個名為 `aPos` 的 `vec3` 輸入變量。此外，我們使用 `layout(location = 0)` 明確指定這個輸入變量的位置（location），稍後你將會看到為什麼這個位置設定是必要的。

{% include box.html color="green" content="

#### 向量

在圖形編程中，我們經常使用數學中的矢量概念，因為它能夠簡潔地表示空間中的位置或方向，並且具有許多有用的數學特性。GLSL 中的矢量最大維度為 4，每個分量可以分別通過 `vec.x、vec.y、vec.z` 和 `vec.w` 訪問，這些分量對應空間中的不同座標。需要注意的是，`vec.w` 並不是表示位置空間的坐標（我們處理的是三維空間，不是四維），而是用於一種稱為透視除法（perspective division）的操作。我們會在後面的章節中更深入地探討矢量相關內容。

" %}

要設置頂點著色器的輸出，我們必須將位置數據賦值給預定義的變量 `gl_Position`，它在底層是一個 vec4 類型的變量。在 main 函數結束時，我們對 `gl_Position` 的賦值會成為頂點著色器的輸出。由於輸入的頂點位置是三維向量（vec3），我們需要將它轉換成四維向量（vec4）。這可以通過將 vec3 的值放入 vec4 的構造函數中，並將其 `w` 分量設置為 `1.0f` 來實現（為什麼要這麼做，我們會在後面的章節詳細解釋）。

目前的頂點著色器可能是我們能想像中最簡單的，因為它沒有對輸入數據進行任何處理，而是直接將數據傳遞到著色器輸出。在實際應用中，輸入的數據通常並不是已經處於標準化設備座標（NDC）空間，因此我們必須先對這些數據進行轉換，將它們映射到 OpenGL 的可視區域內。

## 编译着色器

我們將頂點著色器的源代碼以一個 C 語言的字串常量形式保存起來，暫時放在程式碼檔案的頂部：

```cpp
const char *vertexShaderSource = "#version 330 core\n"
    "layout (location = 0) in vec3 aPos;\n"
    "void main()\n"
    "{\n"
    "   gl_Position = vec4(aPos.x, aPos.y, aPos.z, 1.0);\n"
    "}\0";
```

為了讓 OpenGL 能使用這個著色器，它必須在運行時動態地從源碼編譯它。首先，我們需要創建一個著色器對象，這個對象同樣由一個 `ID` 來標識。因此，我們將頂點著色器存儲在一個無符號整數中，並使用 `glCreateShader` 函數來創建它：

```cpp
unsigned int vertexShader;
vertexShader = glCreateShader(GL_VERTEX_SHADER);
```

我們需要將想要創建的著色器類型作為參數傳入 `glCreateShader`。因為我們現在要創建的是頂點著色器，所以傳入的參數是 `GL_VERTEX_SHADER`。

接著，我們把著色器的源代碼附加到著色器對象上，然後編譯該著色器。

```cpp
glShaderSource(vertexShader, 1, &vertexShaderSource, NULL);
glCompileShader(vertexShader);
```

`glShaderSource` 函數的第一個參數是要編譯的著色器對象。第二個參數指定傳入了多少個字符串作為源代碼，這裡是 1 個。第三個參數是實際的著色器源代碼，而第四個參數通常設為 `NULL`。

{% include box.html color="green" content="

在調用 `glCompileShader` 之後，你可能會想檢查編譯是否成功。如果編譯失敗，你也會想知道錯誤內容以便調試。檢查編譯錯誤的方法如下：

```cpp
int  success;
char infoLog[512];
glGetShaderiv(vertexShader, GL_COMPILE_STATUS, &success);
```

首先，我們定義一個整型變量用來表示編譯是否成功，並準備一個緩衝區來存放錯誤訊息（如果有的話）。接著，我們使用 `glGetShaderiv` 來檢查編譯結果。如果編譯失敗，我們會用 `glGetShaderInfoLog` 取得錯誤訊息，並將其輸出，以便排查問題。

```cpp
if(!success)
{
    glGetShaderInfoLog(vertexShader, 512, NULL, infoLog);
    std::cout << 'ERROR::SHADER::VERTEX::COMPILATION_FAILED\n' << infoLog << std::endl;
}
```

" %}

如果在編譯頂點著色器時沒有檢測到任何錯誤，那麼它就已經成功編譯完成了。

## 片段着色器

要渲染三角形，我們需要創建的第二個也是最後一個著色器是片段著色器。片段著色器負責計算每個像素的輸出顏色。為了簡化起見，這個片段著色器將固定輸出一個橘色調的顏色。

{% include box.html color="green" content="
在計算機圖形學中，顏色用一個包含四個分量的數組來表示：紅色（Red）、綠色（Green）、藍色（Blue）和透明度（Alpha），通常簡稱為 RGBA。在 OpenGL 或 GLSL 中定義顏色時，我們為每個分量設置一個強度值，範圍從 `0.0` 到 `1.0`。例如，如果將紅色分量和綠色分量都設為 `1.0`，則會混合出黃色。僅憑這三個顏色分量，我們就能生成超過一千六百萬種不同的顏色！
" %}

```cpp
#version 330 core
out vec4 FragColor;

void main()
{
    FragColor = vec4(1.0f, 0.5f, 0.2f, 1.0f);
}
```

片段著色器只需要一個輸出變量，這個變量是一個大小為 4 的向量（vec4），用來定義我們自己計算出的最終顏色輸出。我們可以用 `out` 關鍵字來聲明輸出變量，這裡我們將其命名為 `FragColor`。接著，我們直接給這個輸出賦值一個 vec4，代表橘色，並將 `alpha` 設為 `1.0`（1.0 表示完全不透明）。

編譯片段著色器的過程和編譯頂點著色器很類似，不同的是這次我們傳入的著色器類型參數是 `GL_FRAGMENT_SHADER`。

```cpp
unsigned int fragmentShader;
fragmentShader = glCreateShader(GL_FRAGMENT_SHADER);
glShaderSource(fragmentShader, 1, &fragmentShaderSource, NULL);
glCompileShader(fragmentShader);
```

這兩個著色器現在都已經編譯完成，接下來我們只需將它們鏈接（link）成一個著色器程序，這樣就能用來渲染了。記得在這個階段也要檢查鏈接錯誤喔！

## 着色器程序

著色器程序對象是多個著色器經過鏈接後形成的最終版本。要使用剛剛編譯完成的著色器，我們需要將它們鏈接到一個著色器程序對象中，然後在渲染物體時激活該程序。激活後，這個程序中的著色器將會被用來執行渲染指令。

在將著色器鏈接成程序時，系統會把每個著色器的輸出連接到下一個著色器的輸入。如果輸出和輸入不匹配，這時候就會產生鏈接錯誤，方便你進行錯誤排查。

創建一個程序對象很簡單：

```cpp
unsigned int shaderProgram;
shaderProgram = glCreateProgram();
```

`glCreateProgram` 函數會創建一個程序，並返回一個 ID，這個 ID 用來引用新創建的程序對象。接著，我們需要將之前編譯好的著色器附加到這個程序對象上，然後使用 `glLinkProgram` 函數進行連結。

```cpp
glAttachShader(shaderProgram, vertexShader);
glAttachShader(shaderProgram, fragmentShader);
glLinkProgram(shaderProgram);
```

這段代碼很容易理解，我們先將著色器附加到程序，然後通過 `glLinkProgram` 將它們連結起來。

{% include box.html color="green" content="

就像編譯著色器一樣，我們也可以檢查著色器程序的連結是否失敗，並取得對應的錯誤日誌。不過這一次，我們不再使用 `glGetShaderiv` 和 `glGetShaderInfoLog`，而是改用 `glGetProgramiv` 和 `glGetProgramInfoLog`。

```cpp
glGetProgramiv(shaderProgram, GL_LINK_STATUS, &success);
if(!success) {
    glGetProgramInfoLog(shaderProgram, 512, NULL, infoLog);
    ...
}
```

" %}

最後，我們得到了一个程序对象，可以通过调用 `glUseProgram` 函数并传入这个新创建的程序对象作为参数来激活它。

```cpp
glUseProgram(shaderProgram);
```

在呼叫 `glUseProgram` 之後，之後的每一個著色器與渲染操作都會使用這個程序對象（也就是它所關聯的著色器）。

喔對了，別忘了在著色器被鏈接進程序對象之後就把它們刪掉，因為我們已經不再需要這些著色器對象了。

```cpp
glDeleteShader(vertexShader);
glDeleteShader(fragmentShader);
```

現在，我們已經把頂點數據傳送到 GPU，並告訴它該如何透過頂點與片段著色器來處理這些數據。我們已經完成了大部分工作，但還有最後一步。OpenGL 此時還不知道該如何解析記憶體中的頂點數據，也不知道該怎麼將這些數據對應到頂點著色器中的屬性。我們需要主動告訴 OpenGL 如何進行這項對應。

## 链接顶点属性（Vertex Attributes）

頂點著色器允許我們透過頂點屬性的形式來輸入任何資料，這帶來了極大的靈活性。不過，這也意味著我們必須手動指定輸入資料中的哪一部分對應到頂點著色器中的哪一個屬性。在渲染之前，我們需要明確告訴 OpenGL 該如何解析這些頂點資料。

我們的頂點緩衝數據的格式如下：

{% include img.html src="https://learnopengl.com/img/getting-started/vertex_attribute_pointer.png" %}

- 位置資料是以 32 位（4 字節）的浮點數形式儲存。
- 每個位置由 3 個這樣的浮點數組成。
- 每組 3 個值之間沒有其他間隔或數據，這些值在陣列中是緊密排列的。
- 陣列的第一個值從緩衝區（buffer）的起始位置開始。

有了這些基礎，我們現在可以使用 `glVertexAttribPointer` 函數，來告訴 OpenGL 如何解析每個頂點屬性的資料。

```cpp
glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(float), (void*)0);
glEnableVertexAttribArray(0);
```

函數 `glVertexAttribPointer` 有幾個參數，我們一一仔細講解：

- 第一個參數 用來指定要配置的是哪一個頂點屬性。記得我們在頂點著色器中使用 `layout(location = 0)` 來設定位置屬性的索引位置。這意味著這個屬性位於位置 0，因此這裡我們傳入 0，把資料傳送給它。

- 第二個參數 用來指定此頂點屬性的大小。由於它是一個 vec3，所以包含三個浮點數值。

- 第三個參數 指定資料的類型，這裡為 `GL_FLOAT`（因為在 GLSL 中，vec\* 是由浮點數組成的）。

- 第四個參數 指定是否要對數據進行歸一化。當我們輸入整數型數據（如 int 或 byte）並設為 `GL_TRUE` 時，這些整數會在轉為浮點數時被歸一化為 `0` 到 `1`（有符號類型則為 `-1` 到 `1`）。不過這與我們目前的資料無關，因此設為 `GL_FALSE`。

- 第五個參數 是「步長」（stride），也就是每組頂點屬性之間的間距。因為每個位置屬性由 3 個 `float` 組成，所以下一組數據剛好在 `float` 大小的三倍距離處。我們就把這個值當作步長傳入。注意，因為我們的數據是緊密排列的（之間沒有填充空間），我們也可以直接把步長設為 0，讓 OpenGL 自行推斷（這只適用於緊密排列的情況）。當我們有多個頂點屬性時，必須更仔細地定義每個屬性之間的間距——稍後我們會看到更多例子。

- 最後一個參數 是 void\* 類型，因此需要進行一個看起來有點奇怪的強制轉型。它表示的是頂點數據在緩衝區中的起始偏移量。由於我們的頂點資料從緩衝區的開頭開始，所以這裡直接設為 0。這個參數我們之後還會進一步深入探討。

{% include box.html color="green" content="
每個頂點屬性都會從由 VBO（頂點緩衝對象）管理的內存中獲取數據。它從哪個 VBO 獲取數據，取決於調用 `glVertexAttribPointer` 時當前綁定到 `GL_ARRAY_BUFFER` 的 VBO（因為你可以有多個 VBO）。由於在調用 `glVertexAttribPointer` 之前，之前定義的 VBO 仍然是綁定狀態，所以頂點屬性 0 現在就與這個 VBO 中的頂點數據建立了關聯。
" %}

現在，我們已經告訴了 OpenGL 該如何解析頂點數據，接下來還需要透過 `glEnableVertexAttribArray` 來啟用對應的頂點屬性，並將屬性的索引位置作為參數傳入；因為所有頂點屬性在預設情況下都是關閉的。
從這裡開始，所有的基本設置就完成了：我們使用頂點緩衝物件（VBO）初始化了頂點數據，建立了頂點著色器和片段著色器，並且告訴 OpenGL 如何將頂點資料與著色器中的頂點屬性連接起來。
接下來，在 OpenGL 中繪製一個物體的程式碼會長得像這樣：

```cpp
// 0. copy our vertices array in a buffer for OpenGL to use
glBindBuffer(GL_ARRAY_BUFFER, VBO);
glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);
// 1. then set the vertex attributes pointers
glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(float), (void*)0);
glEnableVertexAttribArray(0);
// 2. use our shader program when we want to render an object
glUseProgram(shaderProgram);
// 3. now draw the object
someOpenGLFunctionThatDrawsOurTriangle();
```

每次我們要繪製一個物體時，都需要重複這些步驟。這看起來似乎沒什麼，但試想一下：如果我們有超過 5 個頂點屬性，並且有上百個不同的物體（這在實際應用中並不少見），那麼綁定正確的緩衝對象並為每個物體配置頂點屬性，很快就會變成一個繁瑣的工作。如果有一種方法能夠將這些狀態配置統一存儲到某個對象中，然後只需綁定這個對象就能恢復所有狀態，那該多好？

### 顶点数组对象 （Vertex Array Object）

頂點數組對象 （簡稱 VAO）可被綁定，就像頂點緩衝對象那樣，並且任何頂點屬性的子序列呼叫都會被存儲到 VAO。這就有了一種好處，當配置頂點屬性指針，你只需調用它們一次，而且當我們想繪製這個物體的時候，我們可以綁定對應的 VAO。這讓對頂點數據和頂點屬性配置的切換變簡化為一個對 VBO 綁定的操作。我們設置的全部狀態都會被存入 VAO。

{% include box.html color="red" content="
OpenGL 的核心規範要求我們必須使用 VAO（頂點陣列物件），這樣它才能知道如何處理頂點輸入資料。如果沒有正確綁定 VAO，OpenGL 很可能不會執行任何繪製操作。
" %}

一個頂點數組對象保存了以下內容：

- 調用 `glEnableVertexAttribArray` 或著 `glDisableVertexAttribArray`
- 通過 `glVertexAttribPointer` 進行頂點屬性配置
- 通過調用 `glVertexAttribPointer`，對頂點緩衝對象關聯到頂點屬性。

{% include img.html src="https://learnopengl.com/img/getting-started/vertex_array_objects.png" %}

生成一個 VBO 的方式類似於 VBO：

```cpp
unsigned int VAO;
glGenVertexArrays(1, &VAO);
```

要使用 VAO，你需要做的全部事情是使用 `glBindVertexArray` 綁定這個 VAO。然後，我們應該綁定/配置對應的 VBO 以及屬性指針，接著，對 VAO 解綁以用於後續。一旦我們要繪製一個物體，首先，我們簡單地使用偏好設置綁定這個 VAO，僅此而已。代碼層面差不多這樣：

```cpp
// ..:: Initialization code (done once (unless your object frequently changes)) :: ..
// 1. bind Vertex Array Object
glBindVertexArray(VAO);
// 2. copy our vertices array in a buffer for OpenGL to use
glBindBuffer(GL_ARRAY_BUFFER, VBO);
glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);
// 3. then set our vertex attributes pointers
glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(float), (void*)0);
glEnableVertexAttribArray(0);


[...]

// ..:: Drawing code (in render loop) :: ..
// 4. draw the object
glUseProgram(shaderProgram);
glBindVertexArray(VAO);
someOpenGLFunctionThatDrawsOurTriangle();
```

就是這樣！我們在過去「幾百萬頁」所做的一切，最終都是為了這一刻——創建一個 VAO，用來存儲我們的頂點屬性配置以及對應使用的 VBO。通常情況下，當你需要繪製多個物體時，應該先生成並配置好所有 VAO（同時也就設置好了所需的 VBO 和屬性指針），然後將這些 VAO 存儲起來以備後續使用。當我們需要繪製其中一個物體時，只需取出對應的 VAO，綁定它，執行繪製操作，然後再取消綁定即可。

### 我們一直期待的三角形

為了繪製我們選擇的物體，OpenGL 為我們提供了函數 `glDrawArrays`，它使用當前激活的著色器、之前定義的頂點屬性配置以及 VBO 下的頂點數據（直接由 VAO 綁定），來繪製圖元，

```cpp
glUseProgram(shaderProgram);
glBindVertexArray(VAO);
glDrawArrays(GL_TRIANGLES, 0, 3);
```

`glDrawArrays` 函數持有的第一個參數是 OpenGL 下的圖元類型。由於我一開始就說我們想畫一個三角形，我不會欺騙你，我們傳入 `GL_TRIANGLES`。第二個參數指明了頂點數組的起始索引；我們將其設置為 0。最後一個參數指明了我們希望畫多少個頂點，這裡是 3 （我們只通過這些數據繪製一個三角形，只需三個頂點）。

現在，我們編譯代碼，如果有錯誤拋出，我們需要返回檢查。一旦應用編譯好，我們應該看到以下結果：

{% include img.html src="https://learnopengl.com/img/getting-started/hellotriangle.png" %}

The source code for the complete program can be found [here](https://learnopengl.com/code_viewer_gh.php?code=src/1.getting_started/2.1.hello_triangle/hello_triangle.cpp) .

該程序的源代碼可見於[此處](https://learnopengl.com/code_viewer_gh.php?code=src/1.getting_started/2.1.hello_triangle/hello_triangle.cpp) 。

如果你的結果與它不太一樣，那麼你很可能做錯了什麼。那麼，請查看完成的源代碼，看看你是否遺漏了什麼。

## 元素緩衝對象 （Element Buffer Objects）

這是我們想討論的關於渲染頂點的最後一件事，就是元素緩衝對象，簡稱 EBO。要解釋它如何工作，最好的辦法是給一個例子，假設我們想繪製一個矩形而非三角形。我們可以通過兩個三角形繪製出一個矩形（OpenGL 基本只會繪製三角形）。那麼我們可以生成以下頂點集合：

```cpp
float vertices[] = {
    // first triangle
     0.5f,  0.5f, 0.0f,  // top right
     0.5f, -0.5f, 0.0f,  // bottom right
    -0.5f,  0.5f, 0.0f,  // top left
    // second triangle
     0.5f, -0.5f, 0.0f,  // bottom right
    -0.5f, -0.5f, 0.0f,  // bottom left
    -0.5f,  0.5f, 0.0f   // top left
};
```

如你所見，頂點的聲明上存在一些重複。我們聲明右下角和左上角分別兩次。這產生了 `50%` 的開銷，因為矩形可以使用 4 個頂點來描述，而非 6 個。這會變得很糟糕，一旦我們的繪製非常複雜的模型，比如它有超過好幾千個三角形，那麼將會有大量的重複頂點。一個好的辦法是，我們只存處唯一頂點，然後將頂點標明序號，再使用序號來查找頂點數據用於繪製。那樣的話，我們只需要為矩形存儲 4 個頂點，接著指定繪製它的頂點順序。OpenGL 為我們提供了一個很棒的的特性，不是嗎？

感謝！元素緩衝對象就是那樣工作的。一個 EBO 是一個緩衝，就像頂點緩衝對象一樣，它存儲了頂點的索引，OpenGL 按照此索引決定那些頂點需要用於繪製。這就是所謂的索引化繪製，它正好可以解決我們面臨的問題。要使用它，我們首先指定一個唯一的頂點序列，以及一個索引序列，來繪製一個矩形：

```cpp
float vertices[] = {
     0.5f,  0.5f, 0.0f,  // top right
     0.5f, -0.5f, 0.0f,  // bottom right
    -0.5f, -0.5f, 0.0f,  // bottom left
    -0.5f,  0.5f, 0.0f   // top left
};
unsigned int indices[] = {  // note that we start from 0!
    0, 1, 3,   // first triangle
    1, 2, 3    // second triangle
};
```

我們可以看到，當使用索引的時候，我們只需要 4 個頂點，而非 6 個。接下來我們需要創建一個元素緩衝對象：

```cpp
unsigned int EBO;
glGenBuffers(1, &EBO);
```

類似於 VBO，我們將 EBO 綁定並將索引拷貝至這個緩衝，使用的是函數 `glBufferData`。同樣，如 VBO，我們要將對它的調用放在 bind 和 unbind 之間，只是我們這裡需要聲明的緩衝類型是 `GL_ELEMENT_ARRAY_BUFFER`。

```cpp
glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, EBO);
glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(indices), indices, GL_STATIC_DRAW);
```

注意，我們現在 `GL_ELEMENT_ARRAY_BUFFER` 作為緩衝目標。最後一件事是將 `glDrawArrays` 替換為 `glDrawElements`，它的意思是我們要從索引渲染三角形。當使用 `glDrawElements` 時，我們會根據元素緩衝對象中提供的索引來繪製圖形：

```cpp
glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, EBO);
glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_INT, 0);
```

第一個參數指明我們要繪製的模式，類似 `glDrawArrays`。第二個參數是要繪製的元素數量。我們提供了 6 個索引，因為我們一共要繪製 6 個頂點。第三個參數表示索引的類型，這裡是無符號整型。最後一個讓我們提供 EBO 的偏移（或者傳入一個索引數組，這是在你沒有使用 EBO 的情況下），但是我們這裡將置其為 0。

`glDrawElements` 函數會從當前綁定到 `GL_ELEMENT_ARRAY_BUFFER` 目標的 EBO（元素緩衝對象）中獲取索引數據。這意味著每次我們想用索引來繪製物體時，都需要手動綁定對應的 EBO，這會顯得有些繁瑣。不過，頂點數組對象（VAO）也會記錄與其綁定的元素緩衝對象。在綁定 VAO 的狀態下，最後綁定的 EBO 會被存儲為該 VAO 的元素緩衝對象。這樣一來，當再次綁定該 VAO 時，對應的 EBO 也會自動綁定。

{% include img.html src="https://learnopengl.com/img/getting-started/vertex_array_objects_ebo.png" %}

{% include box.html color="red" content="
當目標是 `GL_ELEMENT_ARRAY_BUFFER` 時，VAO 存儲 `glBindBuffer` 操作。這也意味著它會保存解綁操作，因此確保你沒有在解綁你的 VAO 之前解綁元素數組緩衝，否則會缺少一個 EBO 配置。
" %}

最終的初始化和繪製代碼看起來是這樣的：

```cpp
// ..:: Initialization code :: ..
// 1. bind Vertex Array Object
glBindVertexArray(VAO);
// 2. copy our vertices array in a vertex buffer for OpenGL to use
glBindBuffer(GL_ARRAY_BUFFER, VBO);
glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);
// 3. copy our index array in a element buffer for OpenGL to use
glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, EBO);
glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(indices), indices, GL_STATIC_DRAW);
// 4. then set the vertex attributes pointers
glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(float), (void*)0);
glEnableVertexAttribArray(0);

[...]

// ..:: Drawing code (in render loop) :: ..
glUseProgram(shaderProgram);
glBindVertexArray(VAO);
glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_INT, 0);
glBindVertexArray(0);
```

程序的運行應該用以下這張圖片來說明。左邊的圖看起來不陌生，而右邊這張是一個以線框（wireframe）模式繪製出的矩形。這個線框矩形顯示出這個矩形確實是由兩個三角形組成的。

{% include img.html src="https://learnopengl.com/img/getting-started/hellotriangle2.png" %}

{% include box.html color="green" content="
_線框模式_

要以線框模式繪製三角形，你可以使用 `glPolygonMode(GL_FRONT_AND_BACK, GL_LINE)` 来配置 OpenGL 进行图元绘制。第一个参数说的是我们想将它应用于所有三角形的正面和反面。第二个参数告诉我们将它们绘制为线条。任何绘制调用将会以线框模式渲染三角形，直到我们使用 `glPolygonMode(GL_FRONT_AND_BACK, GL_FILL)`. 将模式设置回默认。
" %}

如果你遇到了任何錯誤，返回去再做一遍，看看你是否丟失了什麼。你可以在這裡看到[源代碼](https://learnopengl.com/code_viewer_gh.php?code=src/1.getting_started/2.2.hello_triangle_indexed/hello_triangle_indexed.cpp)

如果你成功繪製出了一個三角形或者一個矩形，就像我們做的那樣，那麼恭喜你，你已經成功跨越了現代 OpenGL 最難的一步：繪製你的第一個三角形。這是最難的一步，因為要繪製出它，你需要儲備大量的知識。感謝，我們現在已經克服了那道障礙，接下來的章節理解起來將會容易得多。

## 補充資料

- [antongerdelan.net/hellotriangle](http://antongerdelan.net/opengl/hellotriangle.html): Anton Gerdelan 關於如何渲染第一個三角形的講解。
- [open.gl/drawing](https://open.gl/drawing): Alexander Overvoorde 對渲染第一個三角形的解讀。
- [antongerdelan.net/vertexbuffers](http://antongerdelan.net/opengl/vertexbuffers.html): 關於頂點緩衝物件（VBO）的一些額外見解。
- [learnopengl.com/In-Practice/Debugging](https://learnopengl.com/In-Practice/Debugging): 這一章節包含了許多步驟；如果你卡住了，閱讀一些 OpenGL 除錯相關的內容（直到「除錯輸出」那一節）可能會有所幫助。
