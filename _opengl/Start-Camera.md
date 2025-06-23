---
layout: bookdetail
chapter: 十
short: 在上一章，我們知道了如何使用矩陣作為武器，來實現對頂點的轉換。對於那些你希望被渲染在屏幕上的頂點，OpenGL 要求它們在跑完 shader 代碼之後
description: 在上一章，我們知道了如何使用矩陣作為武器，來實現對頂點的轉換。對於那些你希望被渲染在屏幕上的頂點，OpenGL 要求它們在跑完 shader 代碼之後
title: 开始 &bull; 相機
category: tech
src: https://learnopengl.com/Getting-started/Camera

date: 2025-06-14
math: 1
book: opengl
image: "https://learnopengl.com/img/getting-started/camera_axes.png"
---

上一章，我們討論了 view 矩陣以及如何使用它來移動場景（我們向後移動了一些），OpenGL 自己並不清楚相機這個概念，但是我們可以嘗試模擬一個，方式是使場景裡的所有物件反方向移動，這給了用戶一種幻覺——是我們自己在移動。

這一章，我們將討論如何在 OpenGL 裡配置相機。我們將討論 fly 風格的相機，它讓你圍繞 3D 場景自由地移動。我們也將討論鍵盤和鼠標輸入，最後我們會完成一個相機類（class）。

## 相機/視圖空間

當我們在談論相機/視圖空間的時候，我們談論的是所有的頂點座標，那些我們能夠以相機視角——作為場景的中心——看見的頂點座標：此視圖矩陣將全體世界座標轉換為視圖空間座標，即相對相機之位置、朝向。欲定義一個相機，我們需要其在世界的位置，以其所看之方向，一個指向其右側的向量，一個指向其上方的向量。細心讀者或許注意到，我們實際上正創建一個座標系統，憑藉的是 3 個正交的單位軸，相機位置作為原點。

![Camera Axes](https://learnopengl.com/img/getting-started/camera_axes.png)

### 1. 相機位置

獲取相機位置容易。位置是一個向量，它處於世界空間，指向相機的位置。我們將相機置於此前所放之位置：

```cpp
glm::vec3 cameraPos = glm::vec3(0.0f, 0.0f, 3.0f);
```

{% include box.html color="green" content="
莫忘 z 軸正向乃穿透屏幕指向你，因此若我們要後移相機，沿 z 軸正向即可。
" %}

### 2. 相機方向

此後所需之向量，乃相機之方向，即相機所指。此時，我們令其指向場景之中心 $(0,0,0)$。記得否，如對二向量行減法，所得是二者之差？故，對相機位置及場景之中心行減法，所得正是我們想要的那個向量：相機方向。至於視圖矩陣所含之座標系統，我們將置其 z 軸為正，因就 OpenGL 慣例所言，相機指向 z 軸之負向，我們將其方向向量行 negate 操作。如將上述減法中二向量順序調換，我們將得到一個指向相機 z 負軸的向量。

```cpp
glm::vec3 cameraTarget = glm::vec3(0.0f, 0.0f, 0.0f);
glm::vec3 cameraDirection = glm::normalize(cameraPos - cameraTarget);
```

{% include box.html color="red" content="
此處，名稱“方向向量”非最好的名字，因為它實際上指向的是相機所看目標之反方向。
" %}

### 3. Right 軸 （Right axis）

此後所需向量，乃 right 向量，亦即相機空間的 x 正向。欲取得此向量，我們使用一個小技巧，其中我們會首先確定一個 up 向量，一個相對世界空間指向上方的向量。然後，我們對 up 向量和 direction 向量執行叉積計算。由於叉積的結果是一個對二向量都正交的向量，我們將得到一個指向 x 軸正方向的向量（如果我們交換叉積算子的順序，我們將得到一個指向 x 軸負向的向量）：

```cpp
glm::vec3 up = glm::vec3(0.0f, 1.0f, 0.0f);
glm::vec3 cameraRight = glm::normalize(glm::cross(up, cameraDirection));
```

### 4. Up 軸

現在，我們有了 x 軸以及 z 軸，要獲得相機的 y 軸就相對容易了，我們對 right 向量和 direction 向量執行叉積計算：

```cpp
glm::vec3 cameraUp = glm::cross(cameraDirection, cameraRight);
```

得益於叉積法則，以及幾個小技巧，我們能夠創建出相機空間的全部向量。對於對數學有熱情的讀者，這個過程在線性代數，被稱為 Gram-Schmidt 計算。使用相機的這些向量，我們現在可以創建 LookAt 矩陣，它對於相機的創建事實上非常有用！

## Look At

矩陣有個有趣的特點，就是當你定義了 3 個相互正交的（或者叫做非線性）軸，使用這三個軸加上一個平移向量，你創建出一個矩陣，藉助這個矩陣，你便可以通過“矩陣-向量”乘法，將任意向量轉入由這“3 個軸和 1 個平移向量”定義的座標空間。

```math
LookAt = \begin{bmatrix} \color{red}{R_x} & \color{red}{R_y} & \color{red}{R_z} & 0 \\ \color{green}{U_x} & \color{green}{U_y} & \color{green}{U_z} & 0 \\ \color{blue}{D_x} & \color{blue}{D_y} & \color{blue}{D_z} & 0 \\ 0 & 0 & 0  & 1 \end{bmatrix} * \begin{bmatrix} 1 & 0 & 0 & -\color{purple}{P_x} \\ 0 & 1 & 0 & -\color{purple}{P_y} \\ 0 & 0 & 1 & -\color{purple}{P_z} \\ 0 & 0 & 0  & 1 \end{bmatrix}
```

其中 $\color{red}{R}$ 是 Right 向量，$\color{green}{U}$ 是 Up 向量，$\color{blue}{D}$ 是 Direction 向量，$\color{purple}{P}$ 是相機的位置向量。注意旋轉（左邊矩陣）以及平移（右邊矩陣）部分被反轉了（分別被 transposed 和 negated），這是因為，我們希望以與相機運動相反的方向旋轉和移動場景（世界）。將這個 LookAt 矩陣作為我們的視圖矩陣，剛好可以將全部的世界座標轉入我們方才定義的相機空間。LookAt 矩陣準確地表述了它的目的：它創建一個視圖矩陣，使看向指定的目標。

有幸，GLM 已幫助我們做了全部工作。我們只需指定相機位置，一個目標位置以及一個在世界空間的 Up 向量（我們使用它來計算 Right 向量）。GLM 然後創建 LookAt 矩陣，也就是我們的視圖矩陣：

```cpp
glm::mat4 view;
view = glm::lookAt(glm::vec3(0.0f, 0.0f, 3.0f),
  		   glm::vec3(0.0f, 0.0f, 0.0f),
  		   glm::vec3(0.0f, 1.0f, 0.0f));
```

`glm::LookAt` 函數需要一個位置、目標以及一個 Up 向量。這個例子創建了一個視圖矩陣，這和上一章我們創建過的那個是一樣的。

在探索“用戶輸入”之前，我們來一點有趣的，首先我們繞著世界轉動我們相機。我們將目標固定在 **(0,0,0)**。使用一點三角函數的知識，在沒一幀創建一個 x 和 z 座標，它們分別表示一個“圓”上的點，我們將會把這個“點”設為相機的位置。通過再計算 x 和 y 座標，我們對圓上的每一個點進行遍歷，於是，相機就會繞著場景（世界）旋轉。爾通過定義好的半徑，我們在每一幀對這個圓擴大，繼而創建一個新的視圖矩陣，使用的是 GLFW 的 `glfwGetTime` 函數獲取時間：

```cpp
const float radius = 10.0f;
float camX = sin(glfwGetTime()) * radius;
float camZ = cos(glfwGetTime()) * radius;
glm::mat4 view;
view = glm::lookAt(glm::vec3(camX, 0.0, camZ), glm::vec3(0.0, 0.0, 0.0), glm::vec3(0.0, 1.0, 0.0));
```

如果你的代碼跑起來，應該得到這樣的結果：

{% include vid.html src="https://learnopengl.com/video/getting-started/camera_circle.mp4" %}

使用這一小段代碼，相機現在圍繞場景不斷轉圈。儘管去嘗試修改半徑和位置/方向等參數，這樣你可以感知 LookAt 是如何工作的。同時，如果遇到阻礙，也可以查閱源代碼。

## 散步（Walk around）

使相機繞場景旋轉很有趣，然而更有趣的是讓相機的運動受我們控制！首先我們需要設置一個相機系統，如此，在程序的最開始定義一些相機參數非常有用：

```cpp
glm::vec3 cameraPos   = glm::vec3(0.0f, 0.0f,  3.0f);
glm::vec3 cameraFront = glm::vec3(0.0f, 0.0f, -1.0f);
glm::vec3 cameraUp    = glm::vec3(0.0f, 1.0f,  0.0f);
```

Look At 函數現在是這樣：

```cpp
view = glm::lookAt(cameraPos, cameraPos + cameraFront, cameraUp);
```

First we set the camera position to the previously defined `cameraPos`. The direction is the current position + the direction vector we just defined. This ensures that however we move, the camera keeps looking at the target direction. Let's play a bit with these variables by updating the `cameraPos` vector when we press some keys.

首先，我們設置相機的位置為方才定義的 `cameraPos`。方向是當前位置加上方才定義的方向向量。這可以確保不管我們如何移動，相機始終看向目的方向。當我們按下某些鍵的時候，我們通過修改 `cameraPos` 向量來把玩一下。

We already defined a `processInput` function to manage GLFW's keyboard input so let's add a few extra key commands:

我們已經定義了函數 `processInput`，它用於管理 GLFW 的鍵盤輸入，讓我們加入幾個額外的按鍵命令：

```cpp
void processInput(GLFWwindow *window)
{
    ...
    const float cameraSpeed = 0.05f; // adjust accordingly
    if (glfwGetKey(window, GLFW_KEY_W) == GLFW_PRESS)
        cameraPos += cameraSpeed * cameraFront;
    if (glfwGetKey(window, GLFW_KEY_S) == GLFW_PRESS)
        cameraPos -= cameraSpeed * cameraFront;
    if (glfwGetKey(window, GLFW_KEY_A) == GLFW_PRESS)
        cameraPos -= glm::normalize(glm::cross(cameraFront, cameraUp)) * cameraSpeed;
    if (glfwGetKey(window, GLFW_KEY_D) == GLFW_PRESS)
        cameraPos += glm::normalize(glm::cross(cameraFront, cameraUp)) * cameraSpeed;
}
```

Whenever we press one of the WASD keys, the camera's position is updated accordingly. If we want to move forward or backwards we add or subtract the direction vector from the position vector scaled by some speed value. If we want to move sideways we do a cross product to create a right vector and we move along the right vector accordingly. This creates the familiar strafe effect when using the camera.

當我們按下 WASD 的任意一個鍵的時候，相機的位置會被相應改變。如果我們想向前或者向後移動，我們對相機位置向量加或者減這個方向向量 \* 一個移動速度標量。如果我們想向兩側移動相機，使用叉積創建一個 Right 向量，然後我們沿著這個向量移動一個距離。這會在使用攝影機時產生熟悉的平移（Strafe）效果。

{% include box.html color="green" content="
注意，我們對最後的 Right 向量進行了標準化。如果我們沒有這樣做，最後叉積返回的結果會由 `cameraFront` 變量決定，在 `size` 上稍稍不同。缺少了標準化這一步，我們移動的速度會根據相機的朝向時快時慢，而非平緩。
" %}

此時，你應該已經能夠讓攝影機稍微移動了，儘管速度會因系統而異，因此你可能需要調整 `cameraSpeed`。

### 移動速度

Currently we used a constant value for movement speed when walking around. In theory this seems fine, but in practice people's machines have different processing powers and the result of that is that some people are able to render much more frames than others each second. Whenever a user renders more frames than another user he also calls processInput more often. The result is that some people move really fast and some really slow depending on their setup. When shipping your application you want to make sure it runs the same on all kinds of hardware.

目前我們使用一個常量來控制相機移動速度。理論上這似乎沒啥問題，但是實際上，用戶電腦的處理能力和結果會稍稍不同，有些電腦每秒可以渲染更多的幀數。一旦用戶電腦單秒渲染幀數多於其它用戶，其接收輸入也會更頻繁。結果就是有些用戶移動得快，爾有些移動得慢，取決於他們的配置。當發布應用的時候，你一定希望確保其運行效果在所有硬件上是一致的。

Graphics applications and games usually keep track of a deltatime variable that stores the time it took to render the last frame. We then multiply all velocities with this deltaTime value. The result is that when we have a large deltaTime in a frame, meaning that the last frame took longer than average, the velocity for that frame will also be a bit higher to balance it all out. When using this approach it does not matter if you have a very fast or slow pc, the velocity of the camera will be balanced out accordingly so each user will have the same experience.

圖形應用和遊戲常常跟蹤 deltatime 這個變量，它保存了上一幀花銷的時間。我們使用它乘以所有的速度值。結果就是，當 deltaTime 的值很大，也就意味著上一幀花銷的時間長於平均值，那一幀的速度也會稍微快一點，以達到整體的平衡。當使用此辦法，電腦處理快慢就無所謂了，相機速度也會根據用戶設備相應地做出平衡調整，從而使我們獲得一致的體驗。

To calculate the deltaTime value we keep track of 2 global variables:

為了計算 deltaTime，我們跟蹤 2 個全局變量：

```cpp
loat deltaTime = 0.0f;	// Time between current frame and last frame
float lastFrame = 0.0f; // Time of last frame
```

Within each frame we then calculate the new deltaTime value for later use:

接下來，在幀內，我們計算最新的 deltaTime 值，以後續之用：

```cpp
float currentFrame = glfwGetTime();
deltaTime = currentFrame - lastFrame;
lastFrame = currentFrame;
```

Now that we have deltaTime we can take it into account when calculating the velocities:

現在，我們有了 deltaTime，我們可以在計算速度的時候將它納入考慮：

```cpp
void processInput(GLFWwindow _window)
{
float cameraSpeed = 2.5f _ deltaTime;
[...]
}
```

Since we're using deltaTime the camera will now move at a constant speed of 2.5 units per second. Together with the previous section we should now have a much smoother and more consistent camera system for moving around the scene:

由於我們使用了 deltaTime，相機將以一個均衡的速度移動，其值為每秒 2.5 個單位。結合上一章，我們現在應該獲得了一個非常流暢的、非常穩定的相機系統，我們用它來環繞整個場景：

https://learnopengl.com/video/getting-started/camera_smooth.mp4

And now we have a camera that walks and looks equally fast on any system. Again, check the [source code](https://learnopengl.com/code_viewer_gh.php?code=src/1.getting_started/7.2.camera_keyboard_dt/camera_keyboard_dt.cpp) if you're stuck. We'll see the deltaTime value frequently return with anything movement related.

現在，我們的相機在任何系統上運行速度都是大概一樣的。還是老規矩，看一下源代碼，如果有困難的話。我們將看到凡涉及運動問題， deltaTime 也會常常出現。

## 環視（Look around）

Only using the keyboard keys to move around isn't that interesting. Especially since we can't turn around making the movement rather restricted. That's where the mouse comes in!

僅僅使用鍵盤來實現四處移動並不那麼有趣。特別是，我們無法轉向，這使移動非常受限。於是，鼠標的作用可以派上用場了！

To look around the scene we have to change the cameraFront vector based on the input of the mouse. However, changing the direction vector based on mouse rotations is a little complicated and requires some trigonometry. If you do not understand the trigonometry, don't worry, you can just skip to the code sections and paste them in your code; you can always come back later if you want to know more.

要實現場景內環視，我們必須修改向量 cameraFront，可以根據鼠標輸入進行。但基於鼠標的轉動來修改方向向量有點複雜，需要一點三角幾何知識。如果你不懂三角幾何，不要怕，你可以放心跳過閱讀其中的代碼部分，將它們複製到你的項目裡即可。你可以隨時回來閱讀，如果你想了解更多。

### 歐拉角 （Euler angles）

Euler angles are 3 values that can represent any rotation in 3D, defined by Leonhard Euler somewhere in the 1700s. There are 3 Euler angles: pitch, yaw and roll. The following image gives them a visual meaning:

歐拉角由三個數值組成，它可以表達 3D 場景下的任意旋轉。它由 Leonhard Euler 於 1700 年代定義。有 3 個歐拉角度：pitch、yaw 和 roll。下面這個圖給了你它們的視覺含義：

![camera_pitch_yaw_roll](https://learnopengl.com/img/getting-started/camera_pitch_yaw_roll.png)

The pitch is the angle that depicts how much we're looking up or down as seen in the first image. The second image shows the yaw value which represents the magnitude we're looking to the left or to the right. The roll represents how much we roll as mostly used in space-flight cameras. Each of the Euler angles are represented by a single value and with the combination of all 3 of them we can calculate any rotation vector in 3D.

pitch 表達的是我們在“上下”方向轉動的量，如上方第一張圖所示。第二張圖展示了 yaw 的值，它表達的是“左右”方向轉動的量。roll 意指繞相機鏡頭朝向轉動的量，它經常用於空間飛行相機。歐拉角的每個分量都代表一個角度，將它們三個組合起來，我們就可以計算 3D 空間中的任意旋轉向量。

For our camera system we only care about the yaw and pitch values so we won't discuss the roll value here. Given a pitch and a yaw value we can convert them into a 3D vector that represents a new direction vector. The process of converting yaw and pitch values to a direction vector requires a bit of trigonometry. and we start with a basic case:

對於我們的相機系統，我們只關心 yaw 和 pitch，因此我們無需討論 roll。給定 yaw 和 pitch，我們就可以將它們轉換為一個 3D 向量，它意指一個新的方向向量。將 yaw 和 pitch 轉為方向向量的過程需要一點三角幾何知識，我們以一個基礎的例子開始吧：

Let's start with a bit of a refresher and check the general right triangle case (with one side at a 90 degree angle):

讓我們先來稍微複習一下，並檢查一下一般的直角三角形情況（其中一邊是 90 度的角）。

![camera_triangle](https://learnopengl.com/img/getting-started/camera_triangle.png)

If we define the hypotenuse to be of length 1 we know from trigonometry (soh cah toa) that the adjacant side's length is ${\cos{x/h}=\cos{x/1}=\cos{x}}$ and that the opposing side's length is $\sin{y/h}=\sin{y/1}=\sin{y}$. This gives us some general formulas for retrieving the length in both the x and y sides on right triangles, depending on the given angle. Let's use this to calculate the components of the direction vector.

如果我們將斜邊定義為 1，我們由三角函數（soh cah toa）知道其鄰邊長度是 ${\cos{x/h}=\cos{x/1}=\cos{x}}$，爾其對邊長度是 $\sin{y/h}=\sin{y/1}=\sin{y}$。這給了我們一種通用公式，對於直角三角形情況，給定其中一個角度，可以由此得到 x 和 y 邊的長度。讓我們使用它計算出方向向量的分量：

Let's imagine this same triangle, but now looking at it from a top perspective with the adjacent and opposite sides being parallel to the scene's x and z axis (as if looking down the y-axis).

讓我們設想一個同樣的三角形，但是我們從正上方視角去觀察它，使它的鄰邊和對邊分別和場景的 x 和 z 軸平行（就像從 y 軸看過去）。

![camera_yaw](https://learnopengl.com/img/getting-started/camera_yaw.png)

If we visualize the yaw angle to be the counter-clockwise angle starting from the x side we can see that the length of the x side relates to cos(yaw). And similarly how the length of the z side relates to sin(yaw).

如果我們以逆時針方向，並從 x 軸開始，對 yaw 角進行可視化，我們會看到其三角形的 x 邊長度和 $\cos(yaw)$ 相關。類似，z 邊的長度和 $\sin(yaw)$ 相關。

If we take this knowledge and a given yaw value we can use it to create a camera direction vector:

那麼，使用這個知識，給定 yaw 值之後，我們可以用它來創建相機的方向向量：

```cpp
glm::vec3 direction;
direction.x = cos(glm::radians(yaw)); // Note that we convert the angle to radians first
direction.z = sin(glm::radians(yaw));
```

This solves how we can get a 3D direction vector from a yaw value, but pitch needs to be included as well. Let's now look at the y axis side as if we're sitting on the xz plane:

這解決了我們如何通過一個 yaw 值得到一個 3D 方向向量的問題，然而，pitch 也需要被考慮。讓我們現在看向 y 軸，就像我們坐在 xz 平面一樣：

![camera_pitch](https://learnopengl.com/img/getting-started/camera_pitch.png)

Similarly, from this triangle we can see that the direction's y component equals sin(pitch) so let's fill that in:

類似，由這個三角形，我們可以看到方向的 y 分量等於 $\sin(pitch)$，因此，讓我們將其寫入：

```cpp
direction.y = sin(glm::radians(pitch));
```

However, from the pitch triangle we can also see the xz sides are influenced by cos(pitch) so we need to make sure this is also part of the direction vector. With this included we get the final direction vector as translated from yaw and pitch Euler angles:

然而，由 pitch 三角形，我們也知道 xz 邊會被 $\cos(pitch)$ 影響，因此我們需要確保它也是方向向量的一部分。考慮這些之後，我們得到了最終的方向向量，它們由 yaw 和 pitch 歐拉角翻譯得來：

```cpp
direction.x = cos(glm::radians(yaw)) _ cos(glm::radians(pitch));
direction.y = sin(glm::radians(pitch));
direction.z = sin(glm::radians(yaw)) _ cos(glm::radians(pitch));
```

This gives us a formula to convert yaw and pitch values to a 3-dimensional direction vector that we can use for looking around.

這給了我們一個公式，由它，我們可以將 yaw 和 pitch 轉為一個 3D 方向向量，使用它，我們可以環視整個場景。

We've set up the scene world so everything's positioned in the direction of the negative z-axis. However, if we look at the x and z yaw triangle we see that a θ
of 0 results in the camera's direction vector to point towards the positive x-axis. To make sure the camera points towards the negative z-axis by default we can give the yaw a default value of a 90 degree clockwise rotation. Positive degrees rotate counter-clockwise so we set the default yaw value to:

我們已經將場景配置為，使全部物件置於 z 軸的負方向。然而，如果我們看看 x 和 z yaw 三角，我們知道 θ 和 0 會導致相機的指向 x 軸正方向。要使相機指向 z 軸負方向，我們可以將 yaw 的默認值設置為順時針 90 度旋轉。正值會導致逆時針旋轉，因此，我們將 yaw 的默認值設置為：

```cpp
yaw = -90.0f;
```

You've probably wondered by now: how do we set and modify these yaw and pitch values?

到此，你或許疑惑：我們該如何設置和修改 yaw 和 pitch 值呢？

### Mouse input

The yaw and pitch values are obtained from mouse (or controller/joystick) movement where horizontal mouse-movement affects the yaw and vertical mouse-movement affects the pitch. The idea is to store the last frame's mouse positions and calculate in the current frame how much the mouse values changed. The higher the horizontal or vertical difference, the more we update the pitch or yaw value and thus the more the camera should move.

First we will tell GLFW that it should hide the cursor and capture it. Capturing a cursor means that, once the application has focus, the mouse cursor stays within the center of the window (unless the application loses focus or quits). We can do this with one simple configuration call:

```cpp
glfwSetInputMode(window, GLFW_CURSOR, GLFW_CURSOR_DISABLED);
```

After this call, wherever we move the mouse it won't be visible and it should not leave the window. This is perfect for an FPS camera system.

To calculate the pitch and yaw values we need to tell GLFW to listen to mouse-movement events. We do this by creating a callback function with the following prototype:

```cpp
void mouse_callback(GLFWwindow* window, double xpos, double ypos);
```

Here xpos and ypos represent the current mouse positions. As soon as we register the callback function with GLFW each time the mouse moves, the `mouse_callback` function is called:

```cpp
glfwSetCursorPosCallback(window, mouse_callback);
```

When handling mouse input for a fly style camera there are several steps we have to take before we're able to fully calculate the camera's direction vector:

1. Calculate the mouse's offset since the last frame.
2. Add the offset values to the camera's yaw and pitch values.
3. Add some constraints to the minimum/maximum pitch values.
4. Calculate the direction vector.

The first step is to calculate the offset of the mouse since last frame. We first have to store the last mouse positions in the application, which we initialize to be in the center of the screen (screen size is 800 by 600) initially:

```cpp
float lastX = 400, lastY = 300;
```

Then in the mouse's callback function we calculate the offset movement between the last and current frame:

```cpp
float xoffset = xpos - lastX;
float yoffset = lastY - ypos; // reversed since y-coordinates range from bottom to top
lastX = xpos;
lastY = ypos;

const float sensitivity = 0.1f;
xoffset *= sensitivity;
yoffset *= sensitivity;
```

Note that we multiply the offset values by a sensitivity value. If we omit this multiplication the mouse movement would be way too strong; fiddle around with the sensitivity value to your liking.

Next we add the offset values to the globally declared pitch and yaw values:

```cpp
yaw   += xoffset;
pitch += yoffset;
```

In the third step we'd like to add some constraints to the camera so users won't be able to make weird camera movements (also causes a LookAt flip once direction vector is parallel to the world up direction). The pitch needs to be constrained in such a way that users won't be able to look higher than 89 degrees (at 90 degrees we get the LookAt flip) and also not below -89 degrees. This ensures the user will be able to look up to the sky or below to his feet but not further. The constraints work by replacing the Euler value with its constraint value whenever it breaches the constraint:

```cpp
if(pitch > 89.0f)
  pitch =  89.0f;
if(pitch < -89.0f)
  pitch = -89.0f;
```

Note that we set no constraint on the yaw value since we don't want to constrain the user in horizontal rotation. However, it's just as easy to add a constraint to the yaw as well if you feel like it.

The fourth and last step is to calculate the actual direction vector using the formula from the previous section:

```cpp
glm::vec3 direction;
direction.x = cos(glm::radians(yaw)) * cos(glm::radians(pitch));
direction.y = sin(glm::radians(pitch));
direction.z = sin(glm::radians(yaw)) * cos(glm::radians(pitch));
cameraFront = glm::normalize(direction);
```

This computed direction vector then contains all the rotations calculated from the mouse's movement. Since the cameraFront vector is already included in glm's lookAt function we're set to go.

If you'd now run the code you'll notice the camera makes a large sudden jump whenever the window first receives focus of your mouse cursor. The cause for this sudden jump is that as soon as your cursor enters the window the mouse callback function is called with an xpos and ypos position equal to the location your mouse entered the screen from. This is often a position that is significantly far away from the center of the screen, resulting in large offsets and thus a large movement jump. We can circumvent this issue by defining a global bool variable to check if this is the first time we receive mouse input. If it is the first time, we update the initial mouse positions to the new xpos and ypos values. The resulting mouse movements will then use the newly entered mouse's position coordinates to calculate the offsets:

```cpp
if (firstMouse) // initially set to true
{
    lastX = xpos;
    lastY = ypos;
    firstMouse = false;
}
```

The final code then becomes:

```cpp
void mouse_callback(GLFWwindow* window, double xpos, double ypos)
{
    if (firstMouse)
    {
        lastX = xpos;
        lastY = ypos;
        firstMouse = false;
    }

    float xoffset = xpos - lastX;
    float yoffset = lastY - ypos;
    lastX = xpos;
    lastY = ypos;

    float sensitivity = 0.1f;
    xoffset *= sensitivity;
    yoffset *= sensitivity;

    yaw   += xoffset;
    pitch += yoffset;

    if(pitch > 89.0f)
        pitch = 89.0f;
    if(pitch < -89.0f)
        pitch = -89.0f;

    glm::vec3 direction;
    direction.x = cos(glm::radians(yaw)) * cos(glm::radians(pitch));
    direction.y = sin(glm::radians(pitch));
    direction.z = sin(glm::radians(yaw)) * cos(glm::radians(pitch));
    cameraFront = glm::normalize(direction);
}
```

There we go! Give it a spin and you'll see that we can now freely move through our 3D scene!

## Zoom

As a little extra to the camera system we'll also implement a zooming interface. In the previous chapter we said the Field of view or fov largely defines how much we can see of the scene. When the field of view becomes smaller, the scene's projected space gets smaller. This smaller space is projected over the same NDC, giving the illusion of zooming in. To zoom in, we're going to use the mouse's scroll wheel. Similar to mouse movement and keyboard input we have a callback function for mouse scrolling:

```cpp
void scroll_callback(GLFWwindow* window, double xoffset, double yoffset)
{
    fov -= (float)yoffset;
    if (fov < 1.0f)
        fov = 1.0f;
    if (fov > 45.0f)
        fov = 45.0f;
}
```

When scrolling, the yoffset value tells us the amount we scrolled vertically. When the scroll_callback function is called we change the content of the globally declared fov variable. Since 45.0 is the default fov value we want to constrain the zoom level between 1.0 and 45.0.

We now have to upload the perspective projection matrix to the GPU each frame, but this time with the fov variable as its field of view:

```cpp
projection = glm::perspective(glm::radians(fov), 800.0f / 600.0f, 0.1f, 100.0f);
```

And lastly don't forget to register the scroll callback function:

```cpp
glfwSetScrollCallback(window, scroll_callback);
```

And there you have it. We implemented a simple camera system that allows for free movement in a 3D environment.

https://learnopengl.com/video/getting-started/camera_mouse.mp4

Feel free to experiment a little and if you're stuck compare your code with the [source code](https://learnopengl.com/code_viewer_gh.php?code=src/1.getting_started/7.3.camera_mouse_zoom/camera_mouse_zoom.cpp).

## Camera class

In the upcoming chapters we'll always use a camera to easily look around the scenes and see the results from all angles. However, since the camera code can take up a significant amount of space on each chapter we'll abstract its details a little and create our own camera object that does most of the work for us with some neat little extras. Unlike the Shader chapter we won't walk you through creating the camera class, but provide you with the (fully commented) source code if you want to know the inner workings.

Like the Shader object, we define the camera class entirely in a single header file. You can find the camera class [here](https://learnopengl.com/code_viewer_gh.php?code=includes/learnopengl/camera.h); you should be able to understand the code after this chapter. It is advised to at least check the class out once as an example on how you could create your own camera system.

{% include box.html color="red" content="
The camera system we introduced is a fly like camera that suits most purposes and works well with Euler angles, but be careful when creating different camera systems like an FPS camera, or a flight simulation camera. Each camera system has its own tricks and quirks so be sure to read up on them. For example, this fly camera doesn't allow for pitch values higher than or equal to 90 degrees and a static up vector of (0,1,0) doesn't work when we take roll values into account.
" %}

The updated version of the source code using the new camera object can be found [here](https://learnopengl.com/code_viewer_gh.php?code=src/1.getting_started/7.4.camera_class/camera_class.cpp).
