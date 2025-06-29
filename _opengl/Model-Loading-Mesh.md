---
layout: bookdetail
chapter: 十八
title: 模型載入 &bull; Mesh
category: tech
src: "https://learnopengl.com/Model-Loading/Mesh"
date: 2025-06-29
math: 1
book: opengl
image: "https://learnopengl.com/img/404.png"
order: 18
lang: zh
glcate: Model-Loading
gltopic: Mesh
permalink: /opengl/Model-Loading/Mesh
---

使用 Assimp，我們可以將許多不同的模型載入應用程式，但一旦載入，它們都儲存在 Assimp 的資料結構中。我們最終想要的是將這些資料轉換為 OpenGL 可以理解的格式，以便我們可以彩現物件。我們從前一章了解到網格代表一個可繪製的實體，所以讓我們從定義我們自己的網格類別開始。

讓我們回顧一下目前所學的知識，思考網格應具備哪些最基本的資料。網格至少需要一組頂點，其中每個頂點包含一個位置向量、一個法線向量和一個紋理座標向量。網格還應包含用於索引繪製的索引，以及以紋理（漫射/鏡面貼圖）形式存在的材質資料。

現在我們設定了網格類別的最低要求，我們可以在 OpenGL 中定義一個頂點：

```cpp
struct Vertex {
    glm::vec3 Position;
    glm::vec3 Normal;
    glm::vec2 TexCoords;
};
```

我們將每個所需的頂點屬性儲存在一個名為 `Vertex` 的結構中。除了 `Vertex` 結構，我們還希望將紋理資料組織在一個 `Texture` 結構中：

```cpp
struct Texture {
    unsigned int id;
    string type;
};
```

我們儲存紋理的 ID 及其類型，例如漫射或鏡面紋理。

了解頂點和紋理的實際表示方式後，我們就可以開始定義網格類別的結構：

```cpp
class Mesh {
    public:
        // mesh data
        vector<Vertex>       vertices;
        vector<unsigned int> indices;
        vector<Texture>      textures;

        Mesh(vector<Vertex> vertices, vector<unsigned int> indices, vector<Texture> textures);
        void Draw(Shader &shader);
    private:
        //  render data
        unsigned int VAO, VBO, EBO;

        void setupMesh();
};
```

如你所見，這個類別並不複雜。在建構函式中，我們為網格提供了所有必要的資料，我們在 `setupMesh` 函數中初始化緩衝區，最後透過 `Draw` 函數繪製網格。請注意，我們將著色器傳遞給 `Draw` 函數；透過將著色器傳遞給網格，我們可以在繪製之前設定多個 uniform（例如將取樣器連結到紋理單元）。

建構函式的函數內容非常簡單。我們只需將類別的公共變數與建構函式的相應引數變數進行設定。我們還在建構函式中呼叫了 `setupMesh` 函數：

```cpp
Mesh(vector<Vertex> vertices, vector<unsigned int> indices, vector<Texture> textures)
{
    this->vertices = vertices;
    this->indices = indices;
    this->textures = textures;

    setupMesh();
}
```

這裡沒有什麼特別的。現在讓我們直接深入研究 `setupMesh` 函數。

## 初始化

由於建構函式的緣故，我們現在擁有大量的網格資料列表，可以用於彩現。我們確實需要設定適當的緩衝區，並透過頂點屬性指標指定頂點著色器佈局。到現在為止，你應該對這些概念沒有問題，但這次我們透過引入結構中的頂點資料使其變得更複雜一些：

```cpp
void setupMesh()
{
    glGenVertexArrays(1, &VAO);
    glGenBuffers(1, &VBO);
    glGenBuffers(1, &EBO);

    glBindVertexArray(VAO);
    glBindBuffer(GL_ARRAY_BUFFER, VBO);

    glBufferData(GL_ARRAY_BUFFER, vertices.size() * sizeof(Vertex), &vertices[0], GL_STATIC_DRAW);

    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, EBO);
    glBufferData(GL_ELEMENT_ARRAY_BUFFER, indices.size() * sizeof(unsigned int),
                 &indices[0], GL_STATIC_DRAW);

    // vertex positions
    glEnableVertexAttribArray(0);
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, sizeof(Vertex), (void*)0);
    // vertex normals
    glEnableVertexAttribArray(1);
    glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, sizeof(Vertex), (void*)offsetof(Vertex, Normal));
    // vertex texture coords
    glEnableVertexAttribArray(2);
    glVertexAttribPointer(2, 2, GL_FLOAT, GL_FALSE, sizeof(Vertex), (void*)offsetof(Vertex, TexCoords));

    glBindVertexArray(0);
}
```

程式碼與你預期的沒有太大不同，但藉助 `Vertex` 結構，使用了幾個小技巧。

結構在 C++ 中有一個很棒的特性，就是它們的記憶體佈局是連續的。也就是說，如果我們將一個結構表示為一個資料陣列，它只會包含結構的變數以連續順序排列，這直接轉換為我們希望用於陣列緩衝區的浮點（實際上是位元組）陣列。例如，如果我們有一個填充的 `Vertex` 結構，其記憶體佈局將等於：

```cpp
Vertex vertex;
vertex.Position  = glm::vec3(0.2f, 0.4f, 0.6f);
vertex.Normal    = glm::vec3(0.0f, 1.0f, 0.0f);
vertex.TexCoords = glm::vec2(1.0f, 0.0f);
// = [0.2f, 0.4f, 0.6f, 0.0f, 1.0f, 0.0f, 1.0f, 0.0f];
```

由於這個有用的特性，我們可以將指向大量 `Vertex` 結構列表的指標直接作為緩衝區的資料傳遞，並且它們完美地轉換為 `glBufferData` 所期望的引數：

```cpp
glBufferData(GL_ARRAY_BUFFER, vertices.size() * sizeof(Vertex), &vertices[0], GL_STATIC_DRAW);
```

當然，`sizeof` 運算子也可以用於結構以獲取適當的位元組大小。這應該是 `32` 位元組（`8` 個浮點數 \* `4` 個位元組）。

結構的另一個巨大用途是一個預處理器指令，稱為 `offsetof(s,m)`，它將一個結構作為其第一個引數，並將結構的變數名稱作為其第二個引數。該宏返回該變數從結構開頭的位元組偏移量。這非常適合定義 `glVertexAttribPointer` 函數的偏移參數：

```cpp
glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, sizeof(Vertex), (void*)offsetof(Vertex, Normal));
```

現在使用 `offsetof` 宏定義了偏移量，在這種情況下，它將法線向量的位元組偏移量設定為結構中法線屬性的位元組偏移量，即 `3` 個浮點數，因此為 `12` 個位元組。

這樣使用結構不僅可以使我們的程式碼更具可讀性，還可以讓我們輕鬆地擴展結構。如果我們想要另一個頂點屬性，我們可以簡單地將它添加到結構中，由於其靈活的特性，彩現程式碼不會崩潰。

## 渲染（彩現）

我們需要為 `Mesh` 類別定義的最後一個函數是它的 `Draw` 函數。在彩現網格之前，我們首先要綁定適當的紋理，然後再呼叫 `glDrawElements`。然而，這有些困難，因為我們一開始並不知道網格有多少（如果有的話）紋理以及它們可能具有什麼類型。那麼我們如何在著色器中設定紋理單元和取樣器呢？

為了解決這個問題，我們將採用某種命名慣例：每個漫射紋理都命名為 `texture_diffuseN`，每個鏡面紋理都應命名為 `texture_specularN`，其中 `N` 是從 `1` 到允許的最大紋理取樣器數量之間的任何數字。假設一個特定的網格有 3 個漫射紋理和 2 個鏡面紋理，它們的紋理取樣器應稱為：

```cpp
uniform sampler2D texture_diffuse1;
uniform sampler2D texture_diffuse2;
uniform sampler2D texture_diffuse3;
uniform sampler2D texture_specular1;
uniform sampler2D texture_specular2;
```

透過此慣例，我們可以在著色器中定義任意數量的紋理取樣器（最多達到 OpenGL 的最大值），如果網格確實包含（如此多的）紋理，我們就知道它們的名稱是什麼。透過此慣例，我們可以在單個網格上處理任意數量的紋理，並且著色器開發人員可以透過定義適當的取樣器自由使用其中任意數量。

{% include box.html content="

有許多解決此類問題的方法，如果你不喜歡這種特定的解決方案，則由你發揮創意並提出自己的方法。

" color="green" %}

產生的繪製程式碼變為：

```cpp
void Draw(Shader &shader)
{
    unsigned int diffuseNr = 1;
    unsigned int specularNr = 1;
    for(unsigned int i = 0; i < textures.size(); i++)
    {
        glActiveTexture(GL_TEXTURE0 + i); // activate proper texture unit before binding
        // retrieve texture number (the N in diffuse_textureN)
        string number;
        string name = textures[i].type;
        if(name == "texture_diffuse")
            number = std::to_string(diffuseNr++);
        else if(name == "texture_specular")
            number = std::to_string(specularNr++);

        shader.setInt(("material." + name + number).c_str(), i);
        glBindTexture(GL_TEXTURE_2D, textures[i].id);
    }
    glActiveTexture(GL_TEXTURE0);

    // draw mesh
    glBindVertexArray(VAO);
    glDrawElements(GL_TRIANGLES, indices.size(), GL_UNSIGNED_INT, 0);
    glBindVertexArray(0);
}
```

我們首先計算每個紋理類型的 N 元件，並將其連接到紋理的類型字串以獲得適當的 uniform 名稱。然後我們找到適當的取樣器，給它位置值以與當前活動的紋理單元對應，並綁定紋理。這也是我們在 `Draw` 函數中需要著色器的原因。

我們還在結果 uniform 名稱中添加了 `"material."`，因為我們通常將紋理儲存在材質結構中（這可能因實現而異）。

{% include box.html content="

請注意，我們在將漫射和鏡面計數器轉換為 `string` 時遞增它們。在 C++ 中，遞增呼叫：`variable++` 返回變數本身，然後遞增變數，而 `++variable` 首先遞增變數，然後返回它。在我們的例子中，傳遞給 `std::string` 的值是原始計數器值。之後，該值遞增以進行下一輪。

" color="green" %}

你可以在[這裡](https://learnopengl.com/code_viewer_gh.php?code=includes/learnopengl/mesh.h)找到 `Mesh` 類別的完整原始碼。

我們剛剛定義的 `Mesh` 類別是我們在早期章節中討論的許多主題的抽象。在[下一章](/opengl/Model-Loading/Model)中，我們將建立一個作為多個網格物件容器的模型，並實現 Assimp 的載入介面。
