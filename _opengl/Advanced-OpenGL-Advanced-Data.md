---
layout: bookdetail
chapter: 二十六
title: 高級 OpenGL &bull; Advanced-Data
category: tech
src: "https://learnopengl.com/Advanced-OpenGL/Advanced-Data"
date: 2025-06-30
math: 1
book: opengl
image: "https://learnopengl.com/img/404.png"
order: 26
lang: zh
glcate: Advanced-OpenGL
gltopic: Advanced-Data
permalink: /opengl/Advanced-OpenGL/Advanced-Data
---

在大多數的章節中，我們已經大量地使用 OpenGL 的緩衝區（buffer）來在 GPU 上儲存資料。本章我們將簡要討論幾種管理緩衝區的替代方法。

OpenGL 中的緩衝區，其核心就是一個管理特定 GPU 記憶體區塊的物件，僅此而已。我們透過將緩衝區綁定到特定的 `緩衝區目標（buffer target）` 來賦予它意義。一個緩衝區只有當我們將它綁定到 `GL_ARRAY_BUFFER` 時，它才是一個頂點陣列緩衝區，但我們也可以輕易地將它綁定到 `GL_ELEMENT_ARRAY_BUFFER`。OpenGL 會在內部為每個目標儲存一個緩衝區的參考，並根據目標以不同的方式處理該緩衝區。

到目前為止，我們一直透過呼叫 `glBufferData` 來填充緩衝區的記憶體，該函數會分配一塊 GPU 記憶體並將資料放入其中。如果我們將 `NULL` 作為其資料參數傳遞，該函數將只分配記憶體而不填充它。這在我們想先「預留」特定數量的記憶體，然後稍後再回過頭來處理這個緩衝區時很有用。

除了使用一個函數呼叫來填充整個緩衝區之外，我們還可以透過呼叫 `glBufferSubData` 來填充緩衝區的特定區域。這個函數需要一個緩衝區目標、一個偏移量、資料的大小和實際資料作為其參數。這個函數的新穎之處在於，我們現在可以給出一個偏移量，指定我們想從「哪裡」開始填充緩衝區。這允許我們只插入/更新緩衝區記憶體的某些部分。請注意，緩衝區應該有足夠的已分配記憶體，因此在對緩衝區呼叫 `glBufferSubData` 之前，必須先呼叫 `glBufferData`。

```cpp
glBufferSubData(GL_ARRAY_BUFFER, 24, sizeof(data), &data); // Range: [24, 24 + sizeof(data)]
```

另一種將資料放入緩衝區的方法是請求一個指向緩衝區記憶體的指標，然後自己直接在記憶體中複製資料。透過呼叫 `glMapBuffer`，OpenGL 會回傳一個指向目前綁定緩衝區記憶體的指標，供我們操作：

```cpp
float data[] = {
  0.5f, 1.0f, -0.35f
  [...]
};
glBindBuffer(GL_ARRAY_BUFFER, buffer);
// get pointer
void *ptr = glMapBuffer(GL_ARRAY_BUFFER, GL_WRITE_ONLY);
// now copy data into memory
memcpy(ptr, data, sizeof(data));
// make sure to tell OpenGL we're done with the pointer
glUnmapBuffer(GL_ARRAY_BUFFER);
```

透過 `glUnmapBuffer` 告知 OpenGL 我們已經完成指標操作，OpenGL 就會知道你已經完成了。透過解除映射（unmapping），該指標會變得無效，如果 OpenGL 能夠成功地將你的資料映射到緩衝區，該函數會回傳 `GL_TRUE`。

使用 `glMapBuffer` 對於直接將資料映射到緩衝區非常有用，而無需先將其儲存在臨時記憶體中。想像一下直接從檔案讀取資料並將其複製到緩衝區的記憶體中。

## 批次處理頂點屬性

使用 `glVertexAttribPointer`，我們能夠指定頂點陣列緩衝區內容的屬性佈局。在頂點陣列緩衝區中，我們「交錯」（interleaved）了屬性；也就是說，我們為每個頂點將位置、法線和/或紋理座標在記憶體中彼此相鄰放置。現在我們對緩衝區有了更多了解，我們可以採取不同的方法。

我們還可以做的是，將所有向量資料按屬性類型批次處理成大的區塊，而不是交錯它們。與交錯的佈局 `123123123123` 相比，我們採用批次處理的方法 `111122223333`。

從檔案載入頂點資料時，你通常會取得一個位置陣列、一個法線陣列和/或一個紋理座標陣列。將這些陣列組合成一個大的交錯資料陣列可能需要一些努力。此時，採用批次處理的方法是一種更簡單的解決方案，我們可以輕鬆地使用 `glBufferSubData` 來實現：

```cpp
float positions[] = { ... };
float normals[] = { ... };
float tex[] = { ... };
// fill buffer
glBufferSubData(GL_ARRAY_BUFFER, 0, sizeof(positions), &positions);
glBufferSubData(GL_ARRAY_BUFFER, sizeof(positions), sizeof(normals), &normals);
glBufferSubData(GL_ARRAY_BUFFER, sizeof(positions) + sizeof(normals), sizeof(tex), &tex);
```

透過這種方式，我們可以將屬性陣列直接作為一個整體傳輸到緩衝區，而無需先對它們進行處理。我們也可以將它們組合成一個大陣列，然後直接使用 `glBufferData` 填充緩衝區，但使用 `glBufferSubData` 非常適合像這樣的任務。

我們還必須更新**頂點屬性指標**（vertex attribute pointers）以反映這些變更：

```cpp
glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(float), 0);
glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(float), (void*)(sizeof(positions)));
glVertexAttribPointer(
  2, 2, GL_FLOAT, GL_FALSE, 2 * sizeof(float), (void*)(sizeof(positions) + sizeof(normals)));
```

請注意，`stride` 參數等於頂點屬性的大小，因為下一個頂點屬性向量可以直接在其 3（或 2）個分量之後找到。

這為我們提供了另一種設置和指定頂點屬性的方法。使用任何一種方法都是可行的，這主要是一種更有條理的設置頂點屬性的方式。然而，交錯（interleaved）方法仍然是推薦的方法，因為每個頂點著色器執行所需的頂點屬性在記憶體中會緊密對齊。

## 複製緩衝區

一旦你的緩衝區填滿了資料，你可能會想將這些資料與其他緩衝區共享，或者將緩衝區的內容複製到另一個緩衝區。函數 `glCopyBufferSubData` 允許我們相對輕鬆地將資料從一個緩衝區複製到另一個緩衝區。該函數的原型如下：

```cpp
void glCopyBufferSubData(GLenum readtarget, GLenum writetarget, GLintptr readoffset,
                         GLintptr writeoffset, GLsizeiptr size);
```

`readtarget` 和 `writetarget` 參數預期我們提供要從中複製和複製到的緩衝區目標。例如，我們可以透過分別指定 `VERTEX_ARRAY_BUFFER` 和 `VERTEX_ELEMENT_ARRAY_BUFFER` 作為讀取和寫入目標，將資料從 `VERTEX_ARRAY_BUFFER` 緩衝區複製到 `VERTEX_ELEMENT_ARRAY_BUFFER` 緩衝區。目前綁定到這些緩衝區目標的緩衝區將會受到影響。

但是，如果我們想讀取和寫入兩個都是頂點陣列緩衝區的不同緩衝區怎麼辦？我們不能同時將兩個緩衝區綁定到相同的緩衝區目標。為此，也僅僅為此，OpenGL 提供了兩個額外的緩衝區目標，稱為 `GL_COPY_READ_BUFFER` 和 `GL_COPY_WRITE_BUFFER`。然後我們將選擇的緩衝區綁定到這些新的緩衝區目標，並將這些目標設置為 `readtarget` 和 `writetarget` 參數。

`glCopyBufferSubData` 然後會從給定的 `readoffset` 讀取給定 `size` 的資料，並將其寫入 `writetarget` 緩衝區的 `writeoffset` 處。下面顯示了複製兩個頂點陣列緩衝區內容的範例：

```cpp
glBindBuffer(GL_COPY_READ_BUFFER, vbo1);
glBindBuffer(GL_COPY_WRITE_BUFFER, vbo2);
glCopyBufferSubData(GL_COPY_READ_BUFFER, GL_COPY_WRITE_BUFFER, 0, 0, 8 * sizeof(float));
```

我們也可以只將 `writetarget` 緩衝區綁定到其中一種新的緩衝區目標類型來完成這項操作：

```cpp
float vertexData[] = { ... };
glBindBuffer(GL_ARRAY_BUFFER, vbo1);
glBindBuffer(GL_COPY_WRITE_BUFFER, vbo2);
glCopyBufferSubData(GL_ARRAY_BUFFER, GL_COPY_WRITE_BUFFER, 0, 0, 8 * sizeof(float));
```

有了這些操作緩衝區的額外知識，我們就能以更有趣的方式運用它們。你越深入學習 OpenGL，這些新的緩衝區方法就越發實用。在[下一個](/opengl/Advanced-OpenGL/Advanced-GLSL)章節中，我們將討論**統一緩衝區物件**（`uniform buffer objects`），屆時會大量使用 `glBufferSubData`。
