---
layout: bookdetail
chapter: 二十三
title: 高級 OpenGL &bull; 面剔除
category: tech
src: "https://learnopengl.com/Advanced-OpenGL/Face-culling"
date: 2025-06-29
math: 1
book: opengl
image: "https://learnopengl.com/img/advanced/faceculling_windingorder.png"
order: 23
lang: zh
glcate: Advanced-OpenGL
gltopic: Face-culling
permalink: /opengl/Advanced-OpenGL/Face-culling
---

試著在腦海中想像一個 3D 立方體，並數數從任何方向最多能看到幾個面。如果你的想像力不夠豐富，你可能最終會得出最多 3 個面。你可以從任何位置和/或方向觀察一個立方體，但你永遠無法看到超過 3 個面。那麼，我們為什麼要浪費精力繪製那些我們甚至看不到的其他 3 個面呢？如果我們能以某種方式丟棄它們，我們將可以節省超過 50% 這個立方體總共的片元著色器運行次數！

{% include box.html content="

我們說「超過 50%」而不是 50%，因為從某些角度看，可能只有 2 個甚至 1 個面是可見的。在這種情況下，我們將節省**更多**的資源。

" color="green" %}

這是一個非常棒的主意，但我們需要解決一個問題：我們如何知道物體的一個面是否從觀看者的角度來看是不可見的？如果我們想像任何一個閉合形狀，它的每個面都有兩面。每一面要麼「面向」使用者，要麼將背面展示給使用者。如果我們只能渲染「面向」觀看者的面呢？

這正是「面剔除」（face culling）的作用。OpenGL 會檢查所有「面向」觀看者的「正面」，並渲染這些面，同時丟棄所有「背面」的面，為我們節省大量的片元著色器呼叫。我們確實需要告訴 OpenGL 我們使用的哪些面是正面，哪些面是背面。OpenGL 為此使用了一個巧妙的技巧，透過分析頂點資料的「環繞順序」（winding order）。

## 環繞順序

當我們定義一組三角形頂點時，我們會以特定的環繞順序定義它們，可以是「順時針」或「逆時針」。每個三角形由 3 個頂點組成，我們從三角形的中心看，以環繞順序指定這 3 個頂點。

![](https://learnopengl.com/img/advanced/faceculling_windingorder.png)

如圖所示，我們首先定義頂點 `1`，然後我們可以選擇下一個頂點是 `2` 或 `3`。這個選擇定義了這個三角形的環繞順序。以下程式碼說明了這一點：

```cpp
float vertices[] = {
    // clockwise
    vertices[0], // vertex 1
    vertices[1], // vertex 2
    vertices[2], // vertex 3
    // counter-clockwise
    vertices[0], // vertex 1
    vertices[2], // vertex 3
    vertices[1]  // vertex 2
};
```

每個由三個頂點構成的三角形圖元都包含一個環繞順序。OpenGL 在渲染圖元時會使用這些資訊來判斷三角形是「正面」還是「背面」三角形。預設情況下，以逆時針方向定義頂點的三角形會被視為正面三角形。

當你定義頂點順序時，你會想像對應的三角形正對著你，所以你指定的每個三角形都應該是逆時針方向，就像你正對著那個三角形一樣。以這種方式指定所有頂點的妙處在於，實際的環繞順序是在光柵化階段計算的，也就是在頂點著色器已經運行之後。然後，這些頂點會被視為從**觀看者的角度**來看。

觀看者正對著的所有三角形頂點確實都以我們指定的正確環繞順序排列，但立方體另一側的三角形頂點現在的渲染方式會使它們的環繞順序顛倒。結果是，我們正對著的三角形被視為正面三角形，而後面的三角形則被視為背面三角形。下圖顯示了這種效果：

![](https://learnopengl.com/img/advanced/faceculling_frontback.png)

在頂點資料中，我們以逆時針順序定義了兩個三角形（正面和背面三角形都為 1、2、3）。然而，從觀看者的方向看，如果我們以觀看者當前視角下的 1、2、3 順序繪製，則背面三角形會以順時針方向渲染。即使我們指定背面三角形是逆時針順序，它現在卻以順時針順序渲染。這正是我們想要「剔除」（捨棄）不可見面的地方！

## 面剔除

在本章開頭，我們提到 OpenGL 能夠捨棄以背面三角形方式渲染的三角形圖元。既然我們已經知道如何設定頂點的環繞順序，我們就可以開始使用 OpenGL 的「面剔除」選項，該選項預設是禁用的。

我們在前幾章中使用的立方體頂點資料並未考慮逆時針環繞順序，所以我更新了頂點資料以反映逆時針環繞順序，你可以從[這裡](https://learnopengl.com/code_viewer.php?code=advanced/faceculling_vertexdata)複製。嘗試視覺化這些頂點確實都是以逆時針順序為每個三角形定義的，這是一個很好的練習。

要啟用面剔除，我們只需啟用 OpenGL 的 `GL_CULL_FACE` 選項：

```cpp
glEnable(GL_CULL_FACE);
```

從此刻起，所有非正面的面都將被捨棄（試著飛進立方體內部，你會發現所有內部面確實都被捨棄了）。目前，如果 OpenGL 決定先渲染背面，我們在渲染片元上可以節省超過 50% 的效能（否則深度測試已經會將它們捨棄）。請注意，這只適用於像立方體這樣的封閉形狀。當我們繪製[上一章](/opengl/Advanced-OpenGL/Blending)中的草葉時，我們必須再次禁用面剔除，因為它們的正面**和**背面都應該是可見的。

OpenGL 也允許我們改變要剔除的面類型。如果我們想剔除正面而不是背面呢？我們可以使用 `glCullFace` 來定義這種行為：

```cpp
glCullFace(GL_FRONT);
```

`glCullFace` 函數有三個可能的選項：

- `GL_BACK`：只剔除背面。
- `GL_FRONT`：只剔除正面。
- `GL_FRONT_AND_BACK`：剔除正面和背面。

`glCullFace` 的初始值是 `GL_BACK`。我們也可以透過 `glFrontFace` 告訴 OpenGL，我們寧願將順時針面視為正面，而不是逆時針面：

```cpp
glFrontFace(GL_CCW);
```

預設值是 `GL_CCW`，代表逆時針順序，另一個選項是 `GL_CW`，（顯然）代表順時針順序。

作為一個簡單的測試，我們可以透過告訴 OpenGL 前面現在由順時針順序而不是逆時針順序決定來反轉環繞順序：

```cpp
glEnable(GL_CULL_FACE);
glCullFace(GL_BACK);
glFrontFace(GL_CW);
```

結果是只有背面被渲染：

![](https://learnopengl.com/img/advanced/faceculling_reverse.png)

請注意，你也可以透過使用預設的逆時針環繞順序剔除正面來達到相同的效果：

```cpp
glEnable(GL_CULL_FACE);
glCullFace(GL_FRONT);
```

如你所見，面剔除是一個極好的工具，只需極少的努力即可提高 OpenGL 應用程式的效能；特別是所有 3D 應用程式導出的模型都具有一致的環繞順序（預設為逆時針）。你確實必須追蹤哪些物件將從面剔除中受益，以及哪些物件根本不應該被剔除。
