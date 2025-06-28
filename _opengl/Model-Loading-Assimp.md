---
layout: bookdetail
chapter: 十七
title: Model-Loading &bull; Assimp
category: tech
src: "https://learnopengl.com/Model-Loading/Assimp"
date: 2025-06-28
math: 1
book: opengl
image: "https://learnopengl.com/img/model_loading/assimp_structure.png"
order: 17
lang: zh
permalink: /opengl/Model-Loading/Assimp
glcate: "Model-Loading"
gltopic: Assimp
---

到目前為止，我們在所有場景中都大量地使用我們的小容器朋友，但隨著時間的推移，即使是我們最好的朋友也會變得有點無聊。在大型圖形應用程式中，通常有很多複雜而有趣的模型，它們比靜態容器更賞心悅目。然而，與容器物件不同，我們無法真正手動定義複雜形狀（例如房屋、車輛或類人角色）的所有頂點、法線和紋理座標。我們想要的是將這些模型*匯入*到應用程式中；這些模型是由 3D 藝術家在 [Blender](http://www.blender.org/)、[3DS Max](http://www.autodesk.nl/products/3ds-max/overview) 或 [Maya](http://www.autodesk.com/products/autodesk-maya/overview) 等工具中精心設計的。

這些所謂的「3D 建模工具」允許藝術家創建複雜的形狀並透過稱為「UV 貼圖」的過程將紋理應用到它們。然後，這些工具會自動生成所有頂點座標、頂點法線和紋理座標，同時將它們匯出為我們可以使用的模型檔案格式。透過這種方式，藝術家擁有一個廣泛的工具包來創建高品質的模型，而無需過多關心技術細節。所有技術方面都隱藏在匯出的模型檔案中。然而，作為圖形程式設計師，我們**確實**需要關心這些技術細節。

我們的職責是解析這些匯出的模型檔案並提取所有相關資訊，以便我們可以將它們儲存為 OpenGL 理解的格式。一個常見的問題是有數十種不同的檔案格式，每種檔案格式都以其獨特的方式匯出模型資料。像 [Wavefront .obj](http://en.wikipedia.org/wiki/Wavefront_.obj_file) 這樣的模型格式只包含模型資料和少量材質資訊，例如模型顏色和漫反射/鏡面貼圖，而像基於 XML 的 [Collada 檔案格式](http://en.wikipedia.org/wiki/COLLADA) 這樣的模型格式則極其廣泛，包含模型、燈光、多種類型的材質、動畫資料、攝影機、完整的場景資訊等等。Wavefront 物件格式通常被認為是一種易於解析的模型格式。建議至少瀏覽一次 Wavefront 的 wiki 頁面，以了解此類檔案格式的資料結構。這應該能讓您對模型檔案格式的通用結構有一個基本的認識。

總而言之，有許多不同的檔案格式，它們之間通常不存在通用的結構。因此，如果我們想從這些檔案格式中匯入模型，我們就必須為我們想要匯入的每種檔案格式自行編寫一個匯入器。幸運的是，恰好有一個函式庫可以解決這個問題。

## 模型載入函式庫

一個非常流行的模型匯入函式庫叫做 [Assimp](http://assimp.org/)，它是 _Open Asset Import Library_ 的縮寫。Assimp 能夠匯入數十種不同的模型檔案格式（也可以匯出到某些格式），方法是將所有模型的資料載入到 Assimp 的通用資料結構中。一旦 Assimp 載入模型，我們就可以從 Assimp 的資料結構中檢索我們需要的所有資料。因為 Assimp 的資料結構保持不變，無論我們匯入的檔案格式類型如何，它都將我們從所有不同的檔案格式中抽象出來。

當透過 Assimp 匯入模型時，它會將整個模型載入到一個「場景」物件中，該物件包含匯入模型/場景的所有資料。然後，Assimp 擁有一系列節點，其中每個節點都包含指向儲存在場景物件中資料的索引，其中每個節點都可以擁有任意數量的子節點。Assimp 結構的（簡化）模型如下所示：

- 場景/模型的所有資料都包含在 Scene 物件中，例如所有材質和網格。它還包含對場景根節點的引用。
- 場景的根節點可能包含子節點（像所有其他節點一樣），並且可能擁有一組指向場景物件的 `mMeshes` 陣列中網格資料的索引。場景的 `mMeshes` 陣列包含實際的 Mesh 物件，節點中 `mMeshes` 陣列中的值只是場景網格陣列的索引。
- Mesh 物件本身包含渲染所需的所有相關資料，例如頂點位置、法線向量、紋理座標、面和物件的材質。
- 一個網格包含多個面。一個面代表物件的渲染圖元（三角形、正方形、點）。一個面包含形成圖元的頂點索引。因為頂點和索引是分開的，這使得我們很容易透過索引緩衝區進行渲染（參見[你好，三角形](https://learnopengl.com/Getting-started/Hello-Triangle)）。
- 最後，一個網格還連結到一個 Material 物件，該物件託管多個函數以檢索物件的材質屬性。考慮顏色和/或紋理貼圖（例如漫反射和鏡面貼圖）。

我們想要做的是：首先將物件載入到 Scene 物件中，遞歸地從每個節點中檢索相應的 Mesh 物件（我們遞歸地搜尋每個節點的子節點），並處理每個 Mesh 物件以檢索頂點資料、索引及其材質屬性。結果將是一個網格資料的集合，我們希望將其包含在一個單一的 `Model` 物件中。

{% include box.html content="**網格**
在建模工具包中建模物件時，藝術家通常不會用單一形狀創建整個模型。通常，每個模型都由幾個子模型/形狀組成。每個單一形狀都稱為「網格」。想想一個類人角色：藝術家通常將頭部、四肢、衣服和武器都建模為單獨的組件，所有這些網格的組合結果代表最終模型。單個網格是我們在 OpenGL 中繪製物件所需的最小表示（頂點資料、索引和材質屬性）。模型（通常）由多個網格組成。" color="green" %}

在[下一](https://learnopengl.com/Model-Loading/Mesh)章節中，我們將創建我們自己的 `Model` 和 `Mesh` 類，它們使用我們剛剛描述的結構載入和儲存匯入的模型。如果我們然後想要繪製模型，我們不會渲染整個模型，而是渲染模型組成的所有單個網格。但是，在我們開始匯入模型之前，我們首先需要將 Assimp 包含到我們的專案中。

## 建置 Assimp

您可以從 Assimp 的 [GitHub](https://github.com/assimp/assimp/blob/master/Build.md) 頁面下載並選擇相應的版本。本文撰寫時，使用的 Assimp 版本是 `3.1.1` 版。建議您自行編譯函式庫，因為它們預編譯的函式庫並非總是在所有系統上都能正常運作。如果您忘記如何透過 CMake 自行編譯函式庫，請查閱[創建視窗](/opengl/Start/Creating-a-window)章節。

在建置 Assimp 時可能會出現一些問題，因此我將在此處記錄它們及其解決方案，以防你們中的任何人遇到相同的錯誤：

- CMake 在擷取設定清單時不斷出現 DirectX 函式庫遺失的錯誤，訊息如下：
  ```cpp
  "Could not locate DirectX
  CMake Error at cmake-modules/FindPkgMacros.cmake:110 (message):
  Required library DirectX not found! Install the library (including dev packages)
  and try again. If the library is already installed, set the missing variables
  manually in cmake."
  ```
  解決方法是安裝 DirectX SDK，以防您之前沒有安裝它。您可以從[這裡](http://www.microsoft.com/en-us/download/details.aspx?id=6812)下載 SDK。
- 在安裝 DirectX SDK 時，可能會彈出錯誤碼 `s1023`。在這種情況下，您需要先解除安裝 C++ 可再發行套件，然後再安裝 SDK。

設定完成後，您可以生成一個解決方案檔案，打開它，然後編譯函式庫（無論是發布版本還是偵錯版本，隨您喜好）。請務必為 64 位元編譯，因為所有 LearnOpenGL 程式碼都是 64 位元。

預設設定將 Assimp 建置為動態函式庫，因此我們需要將生成的 DLL 檔案 `assimp.dll`（或帶有一些後綴）與應用程式的二進位檔案一起包含。您可以簡單地將 DLL 複製到應用程式可執行檔所在的相同資料夾中。

編譯生成的解決方案後，生成的函式庫和 DLL 檔案位於 `code/Debug` 或 `code/Release` 資料夾中。然後只需將 lib 和 DLL 移動到它們的適當位置，從您的解決方案中連結它們，並確保將 Assimp 的標頭檔複製到您的 `include` 目錄（標頭檔位於從 Assimp 下載的檔案中的 `include` 資料夾中）。

現在您應該已經編譯並將 Assimp 連結到您的應用程式了。如果您仍然收到任何未報告的錯誤，請隨時在評論中尋求幫助。
