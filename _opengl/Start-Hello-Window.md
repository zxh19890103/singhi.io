---
layout: bookdetail
chapter: 四
title: 开始 &bull; Hello, 窗口
src: https://learnopengl.com/Getting-started/Hello-Window
category: tech
date: 2025-05-28
book: opengl
order: 4
permalink: /opengl/Start/Hello-Window
glcate: Start
gltopic: Hello-Window
---

讓我們看看是否可以啟動並運行 `GLFW`。首先，我們創建一個 `.cpp` 文件，然後在其頭部添加以下 `includes`。

```cpp
#include <glad/glad.h>
#include <GLFW/glfw3.h>
```

{% include box.html color="red" content="
請務必在包含 `GLFW` 之前先包含 `GLAD`。`GLAD` 的標頭檔會在背後自動包含必要的 `OpenGL` 標頭（例如 `GL/gl.h`），所以一定要在任何需要用到 `OpenGL` 的其他標頭檔（例如 `GLFW`）之前先包含 `GLAD`。
" %}

接著，我們創建 `main` 函數，在其中我們將初始化 `GLFW` 窗口。

```cpp
int main()
{
  glfwInit();
  glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
  glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
  glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);
    //glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GL_TRUE);
      return 0;
}
```

在 `main` 函數中，我們首先使用 `glwInit` 初始化 GLFW。緊接著，我們可以使用 `glfwWindowHint` 對 GLFW 進行配置。`glfwWindowHint` 的第一個參數告訴我們需要配置那些選項，我們可以從一個以 GLFW\_ 為前綴的大枚舉類型中選擇一項。第二個參數是一個整型，它是選項的值。此枚舉類型的全部可能取值可從文檔 GLFW's [window handling documentation](http://www.glfw.org/docs/latest/window.html#window_hints) 找到。如果你現在嘗試運行一個應用，控制台會給出大量“未定義引用錯誤”，它表示我們沒有正確鏈接到 GLFW 庫。

```cpp
glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GL_TRUE);
```

由於本書聚焦於 OpenGL 3.3 版本，我們將告訴 GLFW 3.3 是我們希望用到的 OpenGL 版本。這確保當用戶沒有按轉合適的 OpenGL 版本時，GLFW 將運行不起來。我們設置了主版本和次版本都為 3。我們也會告訴 GLFW 我們希望顯式地使用核心配置。告訴 GLFW 我們要用到核心配置的意思是，我們可以訪問到 OpenGL 特性的最小集合，排除向後兼容的那些特性，因為我們不需要那些。注意，Mac OS X 上，你需要添加 `glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GL_TRUE);` 到你的初始化代碼，確保它能工作。

{% include box.html color="green" content="請確保你的系統或硬體上安裝了 OpenGL 3.3 版本或更高，否則應用程式可能會崩潰或出現未定義的行為。要查看你電腦上的 OpenGL 版本，在 Linux 系統上可以使用 glxinfo 指令，Windows 上則可使用 OpenGL 擴展查看工具（[OpenGL Extension Viewer](https://learnopengl.com/Getting-started/Hello-Window#:~:text=OpenGL%20Extension%20Viewer)）。如果你的支持版本較低，請檢查你的顯卡是否支持 OpenGL 3.3 以上（否則顯卡可能非常老舊），並嘗試更新驅動程式。" %}

接下來，我們需要創建一個窗口對象。這個對象保存了所有與窗口相關的資料，是大多數 GLFW 函數所依賴的。

```cpp
GLFWwindow\* window = glfwCreateWindow(800, 600, "LearnOpenGL", NULL, NULL);
if (window == NULL)
{
std::cout << "Failed to create GLFW window" << std::endl;
glfwTerminate();
return -1;
}
glfwMakeContextCurrent(window);
```

函数 `glfwCreateWindow` 需要窗口的宽度和高度，分别作为第一个和第二个参数。第三个参数用于指定窗口的名称，目前我们将其命名为 "LearnOpenGL"，当然你也可以起一个你喜欢的名字。最后两个参数可以忽略。该函数会返回一个 GLFWwindow 对象，我们在后续的其他 GLFW 操作中会用到它。接下来，我们告诉 GLFW 将该窗口的上下文设置为当前线程的主上下文。

## GLAD

在上一章中我们提到，GLAD 负责管理 OpenGL 的函数指针，因此在调用任何 OpenGL 函数之前，我们需要先初始化 GLAD。

```cpp
if (!gladLoadGLLoader((GLADloadproc)glfwGetProcAddress))
{
std::cout << "Failed to initialize GLAD" << std::endl;
return -1;
}
```

我们向 GLAD 传入一个用于加载 OpenGL 函数指针地址的函数，这个过程是与操作系统相关的。GLFW 提供了 `glfwGetProcAddress`，它会根据我们编译所针对的操作系统来提供正确的函数。

## 視窗

在我們開始執行渲染工作之前，還有最後一件事要做：我們需要告訴 OpenGL 視窗的大小，這樣它才知道我們希望如何在視窗中顯示數據與座標。這些尺寸可以通過 `glViewport` 函數來設定。

```cpp
glViewport(0, 0, 800, 600);
```

前兩個參數用於設置視窗左下角的位置，第三和第四個參數用於設置渲染視窗的寬度和高度，單位是像素，這個尺寸通常設為與我們為 GLFW 視窗設定的大小相同。

我們可以將 viewport 的尺寸設定得比 GLFW 視窗小；這樣一來，OpenGL 的渲染內容就會顯示在較小的區域中，而我們也可以在 viewport 之外的區域繪製其他內容。

{% include box.html color="green" content="
在幕後，OpenGL 會根據傳入 `glViewport` 的資訊，將處理後的 2D 座標轉換為螢幕上的實際位置。例如，一個處理後的位置 `(-0.5, 0.5)`，最終會被映射到螢幕座標的 `(200, 450)`。請注意，OpenGL 處理後的座標值介於 `-1` 到 `1` 之間，因此我們實際上是將 (-1 到 1) 的範圍有效地映射到 `(0, 800)` 和 `(0, 600)` 的螢幕座標範圍中。" %}

然而，當使用者改變視窗大小時，viewport 也應當隨之調整。我們可以註冊一個回調函式，使其在每次視窗尺寸改變時自動被呼叫。這個回調函式具有以下的原型：

```cpp
void framebuffer_size_callback(GLFWwindow\* window, int width, int height);
```

函數 `framebuffer size` 接受一個 `GLFWwindow` 作為第一個參數，後面兩個參數則表示新的視窗尺寸。每當視窗大小改變時，這個函數就會被調用，並且會傳入相應的參數供你處理。

```cpp
void framebuffer_size_callback(GLFWwindow\* window, int width, int height)
{
  glViewport(0, 0, width, height);
}
```

我們必須告訴 GLFW，當視窗大小改變時要呼叫這個函式，方法是註冊該函式：

```cpp
glfwSetFramebufferSizeCallback(window, framebuffer_size_callback);
```

當視窗第一次顯示時，`framebuffer_size_callback` 也會被呼叫，並傳入視窗最終呈現的尺寸。對於 Retina 顯示器來說，寬度和高度通常會比初始輸入的值大很多。

除此之外，還有許多可註冊的回調函式。例如，我們可以編寫回調函式來處理搖桿輸入、錯誤訊息等。我們會在視窗建立之後、渲染循環開始之前註冊這些回調函式。

## 準備你的引擎

我們不希望應用程式繪製完一張圖像後就立即退出並關閉視窗。我們希望它能持續運行，並處理使用者輸入，直到程式被明確告知退出。因此，我們必須建立一個 `while` 迴圈，也就是所謂的渲染迴圈，讓應用程式持續執行，直到我們指示 GLFW 停止。以下程式碼展示了一個簡單的渲染迴圈範例：

```cpp
while(!glfwWindowShouldClose(window))
{
  glfwSwapBuffers(window);
  glfwPollEvents();
}
```

`glfwWindowShouldClose` 函數會在每一次迭代的過程中被調用，以檢查 GLFW 是否被指示關閉。如果是，那麼這個函數返回 `true`，循環結束，接著我們關閉應用。

`glfwPollEvents` 函數會檢查是否有使用者事件觸發（如鍵盤事件和滑鼠移動事件），更新視窗狀態，並呼叫相應的函式（即我們註冊的回調函式）。而 `glfwSwapBuffers` 則會交換顏色緩衝區（一個大型二維緩衝區，為視窗中的每個像素存儲顏色值），並將本次渲染迭代的內容呈現在螢幕上。

{% include box.html color="green" content="

_雙緩衝區（Double Buffer）_

當應用程式只使用一個緩衝區進行繪製時，最終顯示的畫面可能會出現閃爍現象。這是因為圖像的輸出並非瞬間完成，而是逐像素地從左到右、從上到下依序繪製。在圖像尚未完整渲染完成時就被顯示出來，容易導致畫面中出現瑕疵。

為了解決這個問題，視窗應用程式通常會使用雙緩衝技術來進行渲染。系統會準備兩個緩衝區：前緩衝區用來顯示最終畫面，而所有的渲染命令都會先作用在後緩衝區。當所有的渲染操作完成後，系統會將後緩衝區與前緩衝區進行交換（swap）。這樣一來，顯示在螢幕上的圖像就不會處於渲染過程中，從而避免了上述的閃爍與圖像瑕疵。" %}

## 最後一件事

一旦我們退出渲染循環，就需要正確清理並釋放系統分配給 GLFW 的所有資源。我們可以透過呼叫 glfwTerminate 函數來完成這個工作，通常將它放在主函數（main）的結尾。

```cpp
glfwTerminate();
return 0;
```

這樣會清理所有資源，並正確地結束應用程式。現在試著編譯你的程式碼，如果一切順利，你應該會看到以下輸出：

<img src="https://learnopengl.com/img/getting-started/hellowindow.png" class="right" alt="Image of GLFW window output as most basic example">

如果你看到的是一個非常單調無聊的黑色畫面，那麼你做得很正確。
如果你沒有得到預期的畫面，或者對上述代碼的結構感到疑惑，可以查看完整的[原始碼](https://learnopengl.com/Getting-started/Hello-Window#:~:text=full%20source%20code-,here,-(and%20if%20it))（如果畫面開始閃爍多種顏色，那就繼續往下看）。

如果你在編譯應用程式時遇到問題，首先請確認你的 linker 配置是否正確，並且已經在 IDE 中正確引入了相關目錄（如上一章所提及）。同時，也要確保你的程式碼沒有錯誤；你可以將你的程式碼與完整原始碼進行比對來核對。

## 用戶輸入

我們也希望能實現用戶輸入的功能，這可以通過 GLFW 的多個輸入函數來完成。我們將使用 `glfwGetKey` 函數，它接受一個視窗指標和一個按鍵作為參數，並返回該按鍵當前是否被按下的狀態。

```cpp
void processInput(GLFWwindow \*window)
{
  if(glfwGetKey(window, GLFW_KEY_ESCAPE) == GLFW_PRESS)
    glfwSetWindowShouldClose(window, true);
}
```

這裡，我們檢查用戶是否按下了 Escape 鍵（如果沒有按下，`glfwGetKey` 會返回 `GLFW_RELEASE`）。如果用戶按下了 Escape 鍵，我們通過調用 `glfwSetWindowShouldClose` 函數將 `WindowShouldClose` 設置為 true，從而關閉 GLFW 窗口。主循環的下一次條件判斷將不再成立，因此應用程序會退出。

我們於是在每一次循環迭代中調用 processInput。

```cpp
while (!glfwWindowShouldClose(window))
{
  processInput(window);
  glfwSwapBuffers(window);
  glfwPollEvents();
}
```

這給我們提供了一個簡便的方法，用於檢查某個鍵是否按下，並且在每一幀中做出正確的響應。渲染循環中的一次迭代通常被稱之為“一幀”。

## 渲染

我們想把所有渲染命令放進渲染循環，因為我們希望每一幀都執行這些命令。程式大致看起來像這樣：

```cpp
// render loop
while(!glfwWindowShouldClose(window))
{
  // input
  processInput(window);
  // rendering commands here
  // ...
  // check and call events and swap the buffers
  glfwPollEvents();
  glfwSwapBuffers(window);
}
```

為了測試功能是否正常，我們希望用指定的顏色來清空屏幕。在每一幀的開始，我們都要先清理屏幕，否則會看到上一幀渲染遺留下來的畫面（當然，有時你可能會想保留這個效果，但通常不會）。我們可以透過調用 `glClear` 來清空屏幕的緩衝區，需要傳入對應的位元組來指定要清理哪些緩衝區。可用的位元組有 `GL_COLOR_BUFFER_BIT`、`GL_DEPTH_BUFFER_BIT` 和 `GL_STENCIL_BUFFER_BIT`。目前我們只關心顏色緩衝區，因此只清理顏色緩衝區即可。

```cpp
glClearColor(0.2f, 0.3f, 0.3f, 1.0f);
glClear(GL_COLOR_BUFFER_BIT);
```

注意，我們使用 `glClearColor` 來指定用於清空屏幕的顏色。每當我們調用 `glClear` 並清空顏色緩衝區時，整個緩衝區都會被 `glClearColor` 設定的顏色填滿。這會使屏幕呈現出一種暗綠藍色調。

{% include box.html color="green" content="
你可以回顧一下 OpenGL 章節，`glClearColor` 是一個用來設置狀態的函數，而 `glClear` 則是一個使用狀態的函數，它會從當前狀態中獲取用於清屏的顏色。
" %}

<img src="https://learnopengl.com/img/getting-started/hellowindow2.png" class="right" alt="Image of OpenGL's logo">

該項目的完整代碼[在此](https://learnopengl.com/code_viewer_gh.php?code=src/1.getting_started/1.2.hello_window_clear/hello_window_clear.cpp)。

那麼現在，一切準備就緒，我們可以在渲染循環中加入大量的渲染調用，不過那是下一章的內容。我想我們這次已經講得差不多了。
