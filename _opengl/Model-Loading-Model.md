---
layout: bookdetail
chapter: 十九
title: 模型載入 &bull; Model
category: tech
src: "https://learnopengl.com/Model-Loading/Model"
date: 2025-06-29
math: 1
book: opengl
image: "https://learnopengl.com/img/model_loading/model_diffuse.png"
order: 19
lang: zh
glcate: Model-Loading
gltopic: Model
permalink: /opengl/Model-Loading/Model
---

現在是時候動手使用 Assimp 並開始建立實際的載入和轉換程式碼了。本章的目標是建立另一個類別來完整表示一個模型，也就是說，一個包含多個網格（可能帶有多個紋理）的模型。一個包含木製陽台、塔樓，或許還有一個游泳池的房子，仍然可以作為單一模型載入。我們將透過 Assimp 載入模型，並將其轉換為我們在[上一章](/opengl/Model-Loading/Mesh)中建立的多個 `Mesh` 物件。

事不宜遲，我將為您呈現 `Model` 類別的結構：

```cpp
class Model
{
    public:
        Model(char *path)
        {
            loadModel(path);
        }
        void Draw(Shader &shader);
    private:
        // model data
        vector<Mesh> meshes;
        string directory;

        void loadModel(string path);
        void processNode(aiNode *node, const aiScene *scene);
        Mesh processMesh(aiMesh *mesh, const aiScene *scene);
        vector<Texture> loadMaterialTextures(aiMaterial *mat, aiTextureType type,
                                             string typeName);
};
```

`Model` 類別包含一個 `Mesh` 物件的向量，並要求我們在其建構函式中提供一個檔案位置。然後，它會透過在建構函式中呼叫的 `loadModel` 函數立即載入檔案。私有函數都旨在處理 Assimp 匯入程序的一部分，我們將在稍後介紹它們。我們還儲存了檔案路徑的目錄，這在以後載入紋理時會需要。

`Draw` 函數沒有什麼特別之處，它基本上遍歷每個網格以呼叫它們各自的 `Draw` 函數：

```cpp
void Draw(Shader &shader)
{
    for(unsigned int i = 0; i < meshes.size(); i++)
        meshes[i].Draw(shader);
}
```

## 將 3D 模型匯入 OpenGL

要匯入模型並將其轉換為我們自己的結構，我們首先需要包含 Assimp 的適當標頭：

```cpp
#include <assimp/Importer.hpp>
#include <assimp/scene.h>
#include <assimp/postprocess.h>
```

我們呼叫的第一個函數是 `loadModel`，它直接從建構函式中呼叫。在 `loadModel` 中，我們使用 Assimp 將模型載入到 Assimp 的資料結構中，稱為場景物件。您可能還記得模型載入系列的[第一章](/opengl/Model-Loading/Assimp)，這是 Assimp 資料介面的根物件。一旦我們有了場景物件，我們就可以從載入的模型中存取我們需要的所有資料。

Assimp 最棒的一點是，它巧妙地抽象化了載入所有不同檔案格式的所有技術細節，並且只需一行程式碼即可完成所有這些操作：

```cpp
Assimp::Importer importer;
const aiScene* scene = importer.ReadFile(path, aiProcess_Triangulate | aiProcess_FlipUVs);
```

```cpp
Assimp::Importer importer;
const aiScene *scene = importer.ReadFile(path, aiProcess_Triangulate | aiProcess_FlipUVs);
```

我們首先從 Assimp 的命名空間中宣告一個 `Importer` 物件，然後呼叫其 `ReadFile` 函數。該函數需要一個檔案路徑和一些**後處理**選項作為其第二個參數。Assimp 允許我們指定幾個選項，強制 Assimp 對匯入的資料執行額外的計算/操作。透過設定 `aiProcess_Triangulate`，我們告訴 Assimp，如果模型不（完全）由三角形組成，它應該首先將模型的所有原始形狀轉換為三角形。`aiProcess_FlipUVs` 在處理過程中必要時沿 y 軸翻轉紋理座標（您可能記得在[紋理](/opengl/Start/Textures)章節中，OpenGL 中的大多數影像都沿 y 軸翻轉；這個小小的後處理選項為我們解決了這個問題）。其他一些有用的選項是：

- `aiProcess_GenNormals`：如果模型不包含法線向量，則為每個頂點建立法線向量。
- `aiProcess_SplitLargeMeshes`：將大型網格分割成較小的子網格，這在您的渲染有最大允許頂點數且只能處理較小網格時非常有用。
- `aiProcess_OptimizeMeshes`：透過嘗試將幾個網格連接成一個更大的網格來達到相反的效果，從而減少繪圖呼叫以進行最佳化。

Assimp 提供了一組很棒的後處理選項，您可以在[這裡](http://assimp.sourceforge.net/lib_html/postprocess_8h.html)找到所有這些選項。透過 Assimp 載入模型（如您所見）出奇地容易。艱鉅的工作是使用返回的場景物件將載入的資料轉換為 `Mesh` 物件陣列。

完整的 `loadModel` 函數列於此處：

```cpp
void loadModel(string path)
{
    Assimp::Importer import;
    const aiScene *scene = import.ReadFile(path, aiProcess_Triangulate | aiProcess_FlipUVs);

    if(!scene || scene->mFlags & AI_SCENE_FLAGS_INCOMPLETE || !scene->mRootNode)
    {
        cout << "ERROR::ASSIMP::" << import.GetErrorString() << endl;
        return;
    }
    directory = path.substr(0, path.find_last_of('/'));

    processNode(scene->mRootNode, scene);
}
```

載入模型後，我們會檢查場景和場景的根節點是否為空，並檢查其一個旗標以查看返回的資料是否不完整。如果滿足這些錯誤條件中的任何一個，我們就會報告從匯入器的 `GetErrorString` 函數中檢索到的錯誤並返回。我們還會檢索給定檔案路徑的目錄路徑。

如果沒有出錯，我們就會處理場景的所有節點。我們將第一個節點（根節點）傳遞給遞迴的 `processNode` 函數。因為每個節點（可能）包含一組子節點，所以我們想先處理當前節點，然後繼續處理節點的所有子節點等等。這符合遞迴結構，因此我們將定義一個遞迴函數。遞迴函數是一個執行某些處理並**遞迴**呼叫具有不同參數的相同函數，直到滿足特定條件的函數。在我們的案例中，當所有節點都已處理時，就滿足了**退出條件**。

您可能還記得 Assimp 的結構，每個節點都包含一組網格索引，每個索引都指向位於場景物件中的特定網格。因此，我們希望檢索這些網格索引，檢索每個網格，處理每個網格，然後對節點的每個子節點再次執行此操作。`processNode` 函數的內容如下所示：

```cpp
void processNode(aiNode *node, const aiScene *scene)
{
    // process all the node's meshes (if any)
    for(unsigned int i = 0; i < node->mNumMeshes; i++)
    {
        aiMesh *mesh = scene->mMeshes[node->mMeshes[i]];
        meshes.push_back(processMesh(mesh, scene));
    }
    // then do the same for each of its children
    for(unsigned int i = 0; i < node->mNumChildren; i++)
    {
        processNode(node->mChildren[i], scene);
    }
}
```

我們首先檢查節點的每個網格索引，並透過索引場景的 `mMeshes` 陣列來檢索相應的網格。然後將返回的網格傳遞給 `processMesh` 函數，該函數會返回一個 `Mesh` 物件，我們可以將其儲存在 `meshes` 列表/向量中。

一旦所有網格都處理完畢，我們就會遍歷節點的所有子節點，並為其每個子節點呼叫相同的 `processNode` 函數。一旦節點不再有任何子節點，遞迴就會停止。

{% include box.html content="

細心的讀者可能已經注意到，我們可以不用處理任何節點，而是直接遍歷場景中的所有網格，而無需執行所有這些複雜的索引操作。我們這樣做的原因是，使用節點的最初想法是它定義了網格之間的父子關係。透過遞迴地遍歷這些關係，我們可以定義某些網格作為其他網格的父網格。
這種系統的一個範例應用場景是當您想要平移汽車網格並確保其所有子網格（例如引擎網格、方向盤網格及其輪胎網格）也隨之平移時；使用父子關係可以輕鬆建立這樣的系統。

然而，目前我們還沒有使用這種系統，但通常建議堅持這種方法，以便在您需要對網格資料進行額外控制時使用。畢竟，這些節點般的關係是由建立模型的藝術家定義的。

" color="green" %}

下一步是將 Assimp 的資料處理到上一章節的 `Mesh` 類別中。

### Assimp 到 Mesh

將 `aiMesh` 物件轉換為我們自己的網格物件並不困難。我們所需要做的，就是存取網格的每個相關屬性並將它們儲存在我們自己的物件中。`processMesh` 函數的一般結構如下：

```cpp
Mesh processMesh(aiMesh *mesh, const aiScene *scene)
{
    vector<Vertex> vertices;
    vector<unsigned int> indices;
    vector<Texture> textures;

    for(unsigned int i = 0; i < mesh->mNumVertices; i++)
    {
        Vertex vertex;
        // process vertex positions, normals and texture coordinates
        [...]
        vertices.push_back(vertex);
    }
    // process indices
    [...]
    // process material
    if(mesh->mMaterialIndex >= 0)
    {
        [...]
    }

    return Mesh(vertices, indices, textures);
}
```

處理網格是一個分為 3 個部分的過程：檢索所有頂點資料、檢索網格的索引，最後檢索相關的材質資料。處理後的資料儲存在 `3` 個向量之一中，然後從這些向量中建立一個 `Mesh` 並返回給函數的呼叫者。

檢索頂點資料非常簡單：我們定義一個 `Vertex` 結構，在每次迴圈迭代後將其新增到 `vertices` 陣列中。我們迴圈的次數與網格中存在的頂點數（透過 `mesh->mNumVertices` 檢索）相同。在迭代中，我們希望用所有相關資料填充此結構。對於頂點位置，這如下所示：

```cpp
glm::vec3 vector;
vector.x = mesh->mVertices[i].x;
vector.y = mesh->mVertices[i].y;
vector.z = mesh->mVertices[i].z;
vertex.Position = vector;
```

請注意，我們定義了一個暫時的 `vec3` 用於轉換 Assimp 的資料。這是必要的，因為 Assimp 維護其自己的向量、矩陣、字串等資料類型，並且它們無法很好地轉換為 glm 的資料類型。

{% include box.html content="

Assimp 將其頂點位置陣列稱為 `mVertices`，這並不是最直觀的名稱。

" color="green" %}

現在，法線的處理程序應該不足為奇了：

```cpp
vector.x = mesh->mNormals[i].x;
vector.y = mesh->mNormals[i].y;
vector.z = mesh->mNormals[i].z;
vertex.Normal = vector;
```

紋理座標大致相同，但 Assimp 允許一個模型每個頂點最多有 8 組不同的紋理座標。我們不會使用 8 組，我們只關心第一組紋理座標。我們還需要檢查網格是否確實包含紋理座標（這可能不總是如此）：

```cpp
if(mesh->mTextureCoords[0]) // does the mesh contain texture coordinates?
{
    glm::vec2 vec;
    vec.x = mesh->mTextureCoords[0][i].x;
    vec.y = mesh->mTextureCoords[0][i].y;
    vertex.TexCoords = vec;
}
else
    vertex.TexCoords = glm::vec2(0.0f, 0.0f);
```

現在 `vertex` 結構已完全填入所需的頂點屬性，我們可以在迭代結束時將其推送到 `vertices` 向量的末端。這個過程對網格的每個頂點重複執行。

### Indices

Assimp 的介面將每個網格定義為具有一個面陣列，其中每個面代表一個單一圖元，在我們的情況下（由於 `aiProcess_Triangulate` 選項）始終是三角形。一個面包含我們需要按照其圖元的順序繪製的頂點索引。因此，如果我們遍歷所有面並將所有面的索引儲存在 `indices` 向量中，我們就完成了：

```cpp
for(unsigned int i = 0; i < mesh->mNumFaces; i++)
{
    aiFace face = mesh->mFaces[i];
    for(unsigned int j = 0; j < face.mNumIndices; j++)
        indices.push_back(face.mIndices[j]);
}
```

外層迴圈結束後，我們現在擁有一整套用於透過 `glDrawElements` 繪製網格的頂點和索引資料。然而，為了完成討論並為網格添加一些細節，我們也想處理網格的材質。

### 材質

與節點類似，網格只包含一個指向材質物件的索引。要檢索網格的材質，我們需要索引場景的 `mMaterials` 陣列。網格的材質索引設定在其 `mMaterialIndex` 屬性中，我們也可以查詢此屬性來檢查網格是否包含材質：

```cpp
if(mesh->mMaterialIndex >= 0)
{
    aiMaterial *material = scene->mMaterials[mesh->mMaterialIndex];
    vector<Texture> diffuseMaps = loadMaterialTextures(material,
                                        aiTextureType_DIFFUSE, "texture_diffuse");
    textures.insert(textures.end(), diffuseMaps.begin(), diffuseMaps.end());
    vector<Texture> specularMaps = loadMaterialTextures(material,
                                        aiTextureType_SPECULAR, "texture_specular");
    textures.insert(textures.end(), specularMaps.begin(), specularMaps.end());
}
```

我們首先從場景的 `mMaterials` 陣列中檢索 `aiMaterial` 物件。然後我們想要載入網格的漫反射和/或鏡面紋理。材質物件內部為每種紋理類型儲存一個紋理位置陣列。不同的紋理類型都以 `aiTextureType_` 作為前綴。我們使用一個名為 `loadMaterialTextures` 的輔助函數來從材質中檢索、載入和初始化紋理。該函數返回一個 `Texture` 結構向量，我們將其儲存在模型的 `textures` 向量末尾。

`loadMaterialTextures` 函數遍歷給定紋理類型的所有紋理位置，檢索紋理的檔案位置，然後載入並生成紋理，並將資訊儲存在 `Vertex` 結構中。它看起來像這樣：

```cpp
vector<Texture> loadMaterialTextures(aiMaterial *mat, aiTextureType type, string typeName)
{
    vector<Texture> textures;
    for(unsigned int i = 0; i < mat->GetTextureCount(type); i++)
    {
        aiString str;
        mat->GetTexture(type, i, &str);
        Texture texture;
        texture.id = TextureFromFile(str.C_Str(), directory);
        texture.type = typeName;
        texture.path = str;
        textures.push_back(texture);
    }
    return textures;
}
```

我們首先透過材質的 `GetTextureCount` 函數檢查儲存在材質中的紋理數量，該函數需要我們給定的其中一種紋理類型。我們透過 `GetTexture` 函數檢索每個紋理的檔案位置，該函數將結果儲存在 `aiString` 中。然後我們使用另一個名為 `TextureFromFile` 的輔助函數，該函數為我們載入紋理（使用 `stb_image.h`）並返回紋理的 ID。如果您不確定如何編寫此類函數，可以在最後查看其完整程式碼清單。

{% include box.html content="

請注意，我們假設模型檔案中的紋理檔案路徑是相對於實際模型物件的本地路徑，例如與模型本身的位置在同一目錄中。然後我們可以簡單地連接紋理位置字串和我們之前（在 `loadModel` 函數中）檢索到的目錄字串，以獲取完整的紋理路徑（這就是 `GetTexture` 函數也需要目錄字串的原因）。

網路上找到的一些模型使用紋理位置的絕對路徑，這在每台機器上都無法運作。在這種情況下，您可能需要手動編輯檔案以使用紋理的本地路徑（如果可能）。

" color="green" %}

這就是使用 Assimp 匯入模型的全部內容。

## 一項優化

我們還沒有完全完成，因為仍然有一項龐大（但並非完全必要）的優化我們希望實現。大多數場景會在多個網格上重複使用其紋理；再次以房子為例，其牆壁可能使用花崗岩紋理。這種紋理也可以應用於地板、天花板、樓梯、或許是桌子，甚至附近的小水井。載入紋理並不是一個廉價的操作，而在我們目前的實作中，即使完全相同的紋理可能已經載入過幾次，每個網格都會載入並生成一個新的紋理。這很快就會成為模型載入實作的瓶頸。

因此，我們將對模型程式碼進行一個小小的修改，將所有載入的紋理全域儲存起來。無論何時我們想要載入紋理，我們都會首先檢查它是否已經載入過。如果是，我們就使用該紋理並跳過整個載入程序，為我們節省大量的處理能力。為了能夠比較紋理，我們還需要儲存它們的路徑：

```cpp
struct Texture {
    unsigned int id;
    string type;
    string path;  // we store the path of the texture to compare with other textures
};
```

然後我們將所有已載入的紋理儲存在模型類別檔案頂部宣告的另一個向量中，作為私有變數：

```cpp
vector<Texture> textures_loaded;
```

在 `loadMaterialTextures` 函數中，我們想要將紋理路徑與 `textures_loaded` 向量中的所有紋理進行比較，看看當前紋理路徑是否與其中任何一個相同。如果是，我們就跳過紋理載入/生成部分，直接使用找到的紋理結構作為網格的紋理。更新後的函數如下所示：

```cpp
vector<Texture> loadMaterialTextures(aiMaterial *mat, aiTextureType type, string typeName)
{
    vector<Texture> textures;
    for(unsigned int i = 0; i < mat->GetTextureCount(type); i++)
    {
        aiString str;
        mat->GetTexture(type, i, &str);
        bool skip = false;
        for(unsigned int j = 0; j < textures_loaded.size(); j++)
        {
            if(std::strcmp(textures_loaded[j].path.data(), str.C_Str()) == 0)
            {
                textures.push_back(textures_loaded[j]);
                skip = true;
                break;
            }
        }
        if(!skip)
        {   // if texture hasn't been loaded already, load it
            Texture texture;
            texture.id = TextureFromFile(str.C_Str(), directory);
            texture.type = typeName;
            texture.path = str.C_Str();
            textures.push_back(texture);
            textures_loaded.push_back(texture); // add to loaded textures
        }
    }
    return textures;
}
```

{% include box.html content="

當使用除錯版本和/或 IDE 的除錯模式時，某些版本的 Assimp 載入模型可能會相當慢，因此如果您遇到載入時間緩慢的問題，務必也要用發布版本測試。

" color="red" %}

您可以在[此處](https://learnopengl.com/code_viewer_gh.php?code=includes/learnopengl/model.h)找到 `Model` 類別的完整原始碼。

## 不再有容器！

現在讓我們實際匯入一個由真正的藝術家，而非我這個創意天才所創造的模型，來試試我們的實作。因為我不想過度自誇，偶爾我會允許其他藝術家加入行列，這次我們將載入 Berk Gedik 製作的這款驚人的[生存吉他背包](https://sketchfab.com/3d-models/survival-guitar-backpack-low-poly-799f8c4511f84fab8c3f12887f7e6b36)。我已經稍微修改了材質和路徑，使其可以直接與我們設定的模型載入方式配合。該模型以 `.obj` 檔案格式匯出，並附帶一個 `.mtl` 檔案，該檔案連結到模型的漫射、鏡面和法線貼圖（我們稍後會介紹這些）。您可以在[此處](https://learnopengl.com/data/models/backpack.zip)下載本章調整後的模型。請注意，還有一些我們尚未使用的額外紋理類型，並且所有紋理和模型檔案都應該位於同一目錄中才能載入紋理。

{% include box.html content="

背包的修改版本使用本地相對紋理路徑，並將反照率 (albedo) 和金屬 (metallic) 紋理分別重新命名為漫反射 (diffuse) 和鏡面反射 (specular)。

" color="green" %}

現在，宣告一個 `Model` 物件並傳入模型檔案的位置。然後模型應該會自動載入，並且（如果沒有錯誤）在渲染循環中使用其 `Draw` 函數渲染物件，就這樣。不再需要緩衝區分配、屬性指標和渲染命令，只是一個簡單的單行程式碼。如果您建立一組簡單的著色器，其中片段著色器只輸出物件的漫反射紋理，結果看起來會有點像這樣：

![](https://learnopengl.com/img/model_loading/model_diffuse.png)

您可以在[這裡](https://learnopengl.com/code_viewer_gh.php?code=src/3.model_loading/1.model_loading/model_loading.cpp)找到完整的原始碼。請注意，如果尚未設定，我們會在載入模型之前告訴 `stb_image.h` 垂直翻轉紋理。否則，紋理看起來會一團糟。

我們還可以發揮更多創意，如我們從[光照](/opengl/Lighting/Light-casters)章節中學到的那樣，在渲染方程中引入點光源，並結合鏡面貼圖獲得驚人的效果：

![](https://learnopengl.com/img/model_loading/model_lighting.png)

即使我也不得不承認，這可能比我們目前使用的容器還要花俏一點。使用 Assimp，您可以載入網路上找到的大量模型。有相當多的資源網站提供免費 3D 模型供您下載，這些模型有多種檔案格式。請注意，有些模型仍然無法正確載入，紋理路徑無法運作，或者只是以連 Assimp 也無法讀取的格式匯出。

## 延伸閱讀

- [如何為 OpenGL 紋理 Wavefront (.obj) 模型](https://www.youtube.com/watch?v=4DQquG_o-Ac)：Matthew Early 製作的精彩影片指南，說明如何在 Blender 中設定 3D 模型，使其可以直接與目前的模型載入器配合使用（因為我們選擇的紋理設定並非總是開箱即用）。
