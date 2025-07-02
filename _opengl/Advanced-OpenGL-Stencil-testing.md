---
layout: bookdetail
chapter: 二十一
title: 高級 OpenGL &bull; 模板測試
category: tech
src: "https://learnopengl.com/Advanced-OpenGL/Stencil-testing"
date: 2025-06-29
math: 1
book: opengl
image: "https://learnopengl.com/img/advanced/stencil_buffer.png"
order: 21
lang: zh
glcate: Advanced-OpenGL
gltopic: Stencil-testing
permalink: /opengl/Advanced-OpenGL/Stencil-testing
---

一旦片元著色器處理完畢片元，就會執行一個所謂的「模板測試」（stencil test），它和深度測試一樣，可以選擇丟棄片元。之後，剩餘的片元會傳遞給深度測試，OpenGL 可能會在那裡丟棄更多片元。模板測試是基於另一個名為「模板緩衝」（stencil buffer）的內容，我們可以在渲染期間更新這個緩衝區以實現有趣的視覺效果。

模板緩衝區（通常）每個「模板值」（stencil value）包含 `8` 個位元，這表示每個像素總共有 `256` 個不同的模板值。我們可以將這些模板值設定為我們喜歡的值，並且當特定片元具有某個模板值時，我們可以選擇丟棄或保留該片元。

{% include box.html content="

每個視窗庫都需要為你設定一個模板緩衝區。GLFW 會自動執行此操作，因此我們不必告訴 GLFW 建立一個，但其他視窗庫可能預設不建立模板緩衝區，因此請務必查閱你的庫文件。

" color="green" %}

模板緩衝區的一個簡單範例如下（像素不按比例）：

![](https://learnopengl.com/img/advanced/stencil_buffer.png)

模板緩衝區首先用零清空，然後將一個開放的矩形 `1` 儲存在模板緩衝區中。場景的片元只會在該片元的模板值包含 `1` 的地方被渲染（其他片元則被丟棄）。

模板緩衝區操作允許我們在渲染片元的地方將模板緩衝區設定為特定值。透過在渲染時更改模板緩衝區的內容，我們正在「寫入」模板緩衝區。在相同（或後續）的幀中，我們可以「讀取」這些值來丟棄或通過某些片元。使用模板緩衝區時，你可以隨心所欲地發揮創意，但一般流程通常如下：

- 啟用模板緩衝區寫入。
- 渲染物件，更新模板緩衝區的內容。
- 禁用模板緩衝區寫入。
- 渲染（其他）物件，這次根據模板緩衝區的內容丟棄某些片元。

透過使用模板緩衝區，我們可以根據場景中其他已繪製物件的片元來丟棄某些片元。

你可以透過啟用 `GL_STENCIL_TEST` 來啟用模板測試。從那時起，所有渲染呼叫都將以某種方式影響模板緩衝區。

```cpp
glEnable(GL_STENCIL_TEST);
```

請注意，你還需要在每次迭代時清除模板緩衝區，就像清除顏色緩衝區和深度緩衝區一樣：

```cpp
glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT | GL_STENCIL_BUFFER_BIT);
```

此外，就像深度測試的 `glDepthMask` 函數一樣，模板緩衝區也有一個等效的函數。`glStencilMask` 函數允許我們設定一個位元遮罩，該遮罩會與即將寫入緩衝區的模板值進行 `AND` 運算。預設情況下，它被設定為所有 `1` 的位元遮罩，不影響輸出，但如果我們將其設定為 `0x00`，則寫入緩衝區的所有模板值都將變為 `0`。這相當於深度測試的 `glDepthMask(GL_FALSE)`：

```cpp
glStencilMask(0xFF); // each bit is written to the stencil buffer as is
glStencilMask(0x00); // each bit ends up as 0 in the stencil buffer (disabling writes)
```

大多數情況下，你只會使用 `0x00` 或 `0xFF` 作為模板遮罩，但知道可以設定自訂位元遮罩也是好的。

## 模板函數

與深度測試類似，我們可以控制模板測試何時通過或失敗，以及它如何影響模板緩衝區。我們可以使用兩個函數來配置模板測試：`glStencilFunc` 和 `glStencilOp`。

`glStencilFunc(GLenum func, GLint ref, GLuint mask)` 有三個參數：

- `func`：設定模板測試函數，該函數決定片元是通過還是被丟棄。此測試函數應用於儲存的模板值和 `glStencilFunc` 的 `ref` 值。可能的選項包括：`GL_NEVER`、`GL_LESS`、`GL_LEQUAL`、`GL_GREATER`、`GL_GEQUAL`、`GL_EQUAL`、`GL_NOTEQUAL` 和 `GL_ALWAYS`。這些的語義意義與深度緩衝區的函數類似。
- `ref`：指定模板測試的參考值。模板緩衝區的內容將與此值進行比較。
- `mask`：指定一個遮罩，在測試比較參考值和儲存的模板值之前，兩者都會與此遮罩進行 `AND` 運算。初始設定為所有 `1`。

因此，在我們一開始展示的簡單模板範例中，函數將設定為：

```cpp
glStencilFunc(GL_EQUAL, 1, 0xFF)
```

這告訴 OpenGL，每當片元的模板值等於 (`GL_EQUAL`) 參考值 `1` 時，該片元就會通過測試並被繪製，否則被丟棄。

但是 `glStencilFunc` 只描述了 OpenGL 應該根據模板緩衝區的內容通過或丟棄片元，而不是我們如何實際更新緩衝區。這就是 `glStencilOp` 的作用。

`glStencilOp(GLenum sfail, GLenum dpfail, GLenum dppass)` 包含三個選項，我們可以為每個選項指定要採取的動作：

- `sfail`：如果模板測試失敗時要採取的動作。
- `dpfail`：如果模板測試通過但深度測試失敗時要採取的動作。
- `dppass`：如果模板和深度測試都通過時要採取的動作。

然後，對於每個選項，你可以採取以下任何動作：

<div class="table">
<table>
  <tbody>
    <tr>
      <th>動作</th>
      <th>描述</th>
    </tr>
    <tr>
      <td><code>GL_KEEP</code></td>
      <td>保留目前儲存的模板值。</td>
    </tr>
    <tr>
      <td><code>GL_ZERO</code></td>
      <td>將模板值設定為 <code>0</code>。</td>
    </tr>
    <tr>
      <td><code>GL_REPLACE</code></td>
      <td>模板值將被替換為使用 <fun>glStencilFunc</fun> 設定的參考值。</td>
    </tr>
    <tr>
      <td><code>GL_INCR</code></td>
      <td>如果模板值小於最大值，則將其增加 <code>1</code>。</td>
    </tr>
    <tr>
      <td><code>GL_INCR_WRAP</code></td>
      <td>與 <var>GL_INCR</var> 相同，但一旦超過最大值，就會將其繞回 <code>0</code>。</td>
    </tr>
    <tr>
      <td><code>GL_DECR</code></td>
      <td>如果模板值大於最小值，則將其減少 <code>1</code>。</td>
    </tr>
    <tr>
      <td><code>GL_DECR_WRAP</code></td>
      <td>與 <var>GL_DECR</var> 相同，但如果最終小於 <code>0</code>，則會將其繞回最大值。</td>
    </tr>
    <tr>
      <td><code>GL_INVERT</code></td>
      <td>對目前模板緩衝區值執行位元反向操作。</td>
    </tr>
  </tbody>
</table>
</div>

預設情況下，`glStencilOp` 函數設定為 `(GL_KEEP, GL_KEEP, GL_KEEP)`，因此無論任何測試的結果如何，模板緩衝區都會保持其值。預設行為不會更新模板緩衝區，因此如果你想寫入模板緩衝區，你需要為任何選項指定至少一個不同的動作。

因此，透過使用 `glStencilFunc` 和 `glStencilOp`，我們可以精確地指定何時以及如何更新模板緩衝區，以及何時根據其內容通過或丟棄片元。

## 物件外框

如果你單憑前面幾節就完全理解模板測試的運作方式，那是不太可能的，所以我們將展示一個透過模板測試即可實現的特別有用的功能，稱為「物件外框」。

![](https://learnopengl.com/img/advanced/stencil_object_outlining.png)

物件外框的功能正如其名，它會為每個物件（或僅一個）在物件（組合）周圍建立一個小的彩色邊框。這是一個特別有用的效果，例如在策略遊戲中選取單位時，需要向使用者顯示哪些單位被選取了。物件外框的步驟如下：

1.  啟用模板寫入。
2.  在繪製（要描邊的）物件之前，將模板操作設定為 `GL_ALWAYS`，在物件片元渲染到的任何地方，用 `1` 更新模板緩衝區。
3.  渲染物件。
4.  禁用模板寫入和深度測試。
5.  將每個物件放大一點。
6.  使用不同的片元著色器，輸出單一（邊框）顏色。
7.  再次繪製物件，但僅在片元的模板值不等於 `1` 時才繪製。
8.  再次啟用深度測試並將模板函數恢復為 `GL_KEEP`。

這個過程會將模板緩衝區的內容為每個物件的片元設定為 `1`，當需要繪製邊框時，我們只在模板測試通過的地方繪製放大版的物件。我們有效地利用模板緩衝區丟棄了放大版中屬於原始物件片元的所有片元。

所以我們首先要建立一個非常基本的片元著色器，它輸出邊框顏色。我們只需設定一個硬編碼的顏色值，並將著色器命名為 `shaderSingleColor`：

```cpp
void main()
{
    FragColor = vec4(0.04, 0.28, 0.26, 1.0);
}
```

使用[上一章節](/opengl/Advanced-OpenGL/Depth-testing)的場景，我們將為兩個貨櫃添加物件外框，因此我們將地板排除在外。我們想先繪製地板，然後繪製兩個貨櫃（同時寫入模板緩衝區），然後繪製放大後的貨櫃（同時丟棄那些會覆蓋先前繪製的貨櫃片元的片段）。

我們首先需要啟用模板測試：

```cpp
glEnable(GL_STENCIL_TEST);
```

然後在每個畫格中，我們需要指定當任何模板測試成功或失敗時應採取的動作：

```cpp
glStencilOp(GL_KEEP, GL_KEEP, GL_REPLACE);
```

如果任何測試失敗，我們不做任何事情；我們只是保留模板緩衝區中當前儲存的值。但是，如果模板測試和深度測試都成功，我們希望用透過 `glStencilFunc` 設定的參考值替換儲存的模板值，該參考值我們稍後會設定為 `1`。

我們在畫格開始時將模板緩衝區清除為 `0`，對於容器，我們將每個繪製片元的模板緩衝區更新為 `1`：

```cpp
glStencilOp(GL_KEEP, GL_KEEP, GL_REPLACE);
glStencilFunc(GL_ALWAYS, 1, 0xFF); // all fragments should pass the stencil test
glStencilMask(0xFF); // enable writing to the stencil buffer
normalShader.use();
DrawTwoContainers();
```

透過使用 `GL_REPLACE` 作為模板操作函數，我們確保每個容器的片段都以 `1` 的模板值更新模板緩衝區。因為片段總是通過模板測試，所以無論我們在哪裡繪製它們，模板緩衝區都會用參考值更新。

現在模板緩衝區已經在繪製容器的地方用 `1` 更新了，我們將繪製放大後的容器，但這次使用適當的測試函數並禁用對模板緩衝區的寫入：

```cpp
glStencilFunc(GL_NOTEQUAL, 1, 0xFF);
glStencilMask(0x00); // disable writing to the stencil buffer
glDisable(GL_DEPTH_TEST);
shaderSingleColor.use();
DrawTwoScaledUpContainers();
```

我們將模板函數設定為 `GL_NOTEQUAL`，以確保我們只繪製不等於 `1` 的容器部分。這樣我們就只會繪製先前繪製容器外部的容器部分。請注意，我們也停用了深度測試，這樣放大後的容器（例如邊框）就不會被地板覆寫。完成後請務必重新啟用深度緩衝區。

我們場景的整體物件輪廓描邊流程大致如下：

```cpp
glEnable(GL_DEPTH_TEST);
glStencilOp(GL_KEEP, GL_KEEP, GL_REPLACE);

glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT | GL_STENCIL_BUFFER_BIT);

glStencilMask(0x00); // make sure we don't update the stencil buffer while drawing the floor
normalShader.use();
DrawFloor()

glStencilFunc(GL_ALWAYS, 1, 0xFF);
glStencilMask(0xFF);
DrawTwoContainers();

glStencilFunc(GL_NOTEQUAL, 1, 0xFF);
glStencilMask(0x00);
glDisable(GL_DEPTH_TEST);
shaderSingleColor.use();
DrawTwoScaledUpContainers();
glStencilMask(0xFF);
glStencilFunc(GL_ALWAYS, 1, 0xFF);
glEnable(GL_DEPTH_TEST);
```

只要你理解模板測試背後的總體概念，這應該不會太難理解。否則，請嘗試再次仔細閱讀前面的章節，並在看到一個使用範例後，試著完全理解每個函數的功能。

描邊演算法的結果如下：

![](https://learnopengl.com/img/advanced/stencil_scene_outlined.png)

檢視[這裡](https://learnopengl.com/code_viewer_gh.php?code=src/4.advanced_opengl/2.stencil_testing/stencil_testing.cpp)的原始碼，查看物件外框演算法的完整程式碼。

{% include box.html content="你可以看到兩個容器之間的邊框重疊，這通常是我們想要的效果（想像一下策略遊戲中我們想要選擇 10 個單位；合併邊框通常是首選）。如果你想要每個物件都有完整的邊框，你必須為每個物件清除模板緩衝區，並在深度緩衝區上發揮一點創意。" color="green" %}

你所看到的物件外框演算法常被用於遊戲中，以視覺化選定的物件（想像一下策略遊戲），像這樣的演算法可以很容易地在模型類別中實現。你可以在模型類別中設定一個布林標誌，以決定是否繪製邊框。如果你想發揮創意，甚至可以藉助高斯模糊等後製濾鏡，讓邊框看起來更自然。

模板測試還有許多其他用途（除了描繪物件之外），例如在後視鏡內繪製紋理，使其完美地符合鏡子形狀，或者使用稱為「陰影體積」（shadow volumes）的模板緩衝區技術渲染即時陰影。模板緩衝區為我們已然豐富的 OpenGL 工具包提供了另一個好用的工具。
