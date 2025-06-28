---
layout: bookdetail
chapter: 十六
title: 光 &bull; 多重光源
category: tech
src: "https://learnopengl.com/Lighting/Multiple-lights"
date: 2025-06-28
math: 1
book: opengl
image: "https://learnopengl.com/img/lighting/multiple_lights_combined.png"
order: 16
permalink: /opengl/Lighting/Multiple-lights
glcate: Lighting
gltopic: Multiple-lights
---

承前章所學，吾人已悉 OpenGL 中之光照堂奧，舉凡 Phong 著色、材質、光照貼圖暨各類光源，皆已詳盡闡述。本章之旨，乃融會貫通前所學，以六光源齊發，營造一臻於完善之光照場景。吾人將模擬日暉，作定向光源；佐以四點光源，散佈於場景之中；復增一聚光燈，以擬手電之效。

欲於場景中運用多重光源，吾人宜將光照計算封裝於 GLSL 之「函式」（`functions`）之中。蓋因光源種類繁多，各需殊異之運算，若悉數羅列於「主函式」（`main` function）之內，程式碼恐將迅速趨於繁蕪，難以索解。

GLSL 中之函式，與 C 語言之函式無異，俱有函式名、回傳型別，且若函式未先於主函式之前宣告，則需於程式碼檔案之頂端宣告其原型。吾人將為每種光源，即定向光、點光源、聚光燈，各別創建函式。

當場景中運用多重光源之際，其常規做法如下：吾人設一單一顏色向量，以表片段之輸出色彩。每逢一光源，其對片段之貢獻，便疊加至此輸出顏色向量之上。是以，場景中之每一光源，皆將計算其個別之影響，並將其貢獻予最終之輸出色彩。其總體架構，約莫如下所示：

```cpp
out vec4 FragColor;

void main()
{
  // define an output color value
  vec3 output = vec3(0.0);
  // add the directional light's contribution to the output
  output += someFunctionToCalculateDirectionalLight();
  // do the same for all point lights
  for(int i = 0; i < nr_of_point_lights; i++)
  	output += someFunctionToCalculatePointLight();
  // and add others lights as well (like spotlights)
  output += someFunctionToCalculateSpotLight();

  FragColor = vec4(output, 1.0);
}
```

其實際程式碼或因實作而異，然其總體架構仍舊不變。吾人定義若干函式，各司其職，計算每光源之影響，並將所得之色彩增益至輸出色彩向量。舉例而言，若兩光源鄰近某片段，則其綜合貢獻將使該片段較單一光源照耀之下更為明亮。

## 定向光源

吾人欲於片段著色器中定義一函式，以計算定向光源對應片段之貢獻：此函式將接收若干參數，並回傳所計算之定向光照色彩。

首先，吾人需設定定向光源所需之最低變數。吾人可將此等變數儲存於名為 `DirLight` 之結構中，並將其定義為統一變數（uniform）。此結構之變數，應已於[前章]({{ post.previous.url }})所示，想必諸君已然稔熟：

```cpp
struct DirLight {
    vec3 direction;

    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};
uniform DirLight dirLight;
```

吾人可將此定向光源（dirLight）統一變數，傳遞予具備以下原型之函式：

```cpp
vec3 CalcDirLight(DirLight light, vec3 normal, vec3 viewDir);
```

{% include box.html content="正如C語言與C++之慣例，當吾人欲呼叫一函式（此處為`main`函式內部），該函式務必於呼叫者之行數之前定義。然在此情境下，吾人更傾向於將函式定義於`main`函式之後，故此項要求便不復存在。是以，吾人當於`main`函式之上方，宣告函式之原型，一如C語言之作法。" color="green" %}

足見此函式需一 DirLight 結構，並輔以計算所需之另兩個向量。若閣下已圓滿完成前一章節，則此函式之內容應不足為奇：

```cpp
vec3 CalcDirLight(DirLight light, vec3 normal, vec3 viewDir)
{
    vec3 lightDir = normalize(-light.direction);
    // diffuse shading
    float diff = max(dot(normal, lightDir), 0.0);
    // specular shading
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
    // combine results
    vec3 ambient  = light.ambient  * vec3(texture(material.diffuse, TexCoords));
    vec3 diffuse  = light.diffuse  * diff * vec3(texture(material.diffuse, TexCoords));
    vec3 specular = light.specular * spec * vec3(texture(material.specular, TexCoords));
    return (ambient + diffuse + specular);
}
```

吾人基本上複製了前章之程式碼，並運用函式參數所賦予之向量，以計算定向光之貢獻向量。隨後，將所生之環境光、漫射光與鏡面反射光貢獻，彙總為單一色彩向量而回傳。

## 點光源（Point light）

吾人亦欲比照定向光源之例，定義一函式，以計算點光源對特定片段之貢獻，並納入其衰減效應。誠如定向光源，吾人將定義一結構，詳列點光源所需之諸般變數：

```cpp
struct PointLight {
    vec3 position;

    float constant;
    float linear;
    float quadratic;

    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};
#define NR_POINT_LIGHTS 4
uniform PointLight pointLights[NR_POINT_LIGHTS];
```

可見吾人於 GLSL 中運用預處理指令，以定義場景中所需點光源之數量。繼而，吾人運用此`NR_POINT_LIGHTS`常數，創建一`PointLight`結構陣列。GLSL 中之陣列，一如 C 語言之陣列，可藉由方括號創建。當前吾人有四個`PointLight`結構待以數據填充。

此點光源函式之原型如下：

```cpp
vec3 CalcPointLight(PointLight light, vec3 normal, vec3 fragPos, vec3 viewDir);
```

此函式將其所需之所有數據作為引數，並回傳一 `vec3` 型別，以表示此特定點光源對片段之色彩貢獻。同樣地，透過巧妙之複製貼上，可得以下函式：

```cpp
vec3 CalcPointLight(PointLight light, vec3 normal, vec3 fragPos, vec3 viewDir)
{
    vec3 lightDir = normalize(light.position - fragPos);
    // diffuse shading
    float diff = max(dot(normal, lightDir), 0.0);
    // specular shading
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
    // attenuation
    float distance    = length(light.position - fragPos);
    float attenuation = 1.0 / (light.constant + light.linear * distance +
  			     light.quadratic * (distance * distance));
    // combine results
    vec3 ambient  = light.ambient  * vec3(texture(material.diffuse, TexCoords));
    vec3 diffuse  = light.diffuse  * diff * vec3(texture(material.diffuse, TexCoords));
    vec3 specular = light.specular * spec * vec3(texture(material.specular, TexCoords));
    ambient  *= attenuation;
    diffuse  *= attenuation;
    specular *= attenuation;
    return (ambient + diffuse + specular);
}
```

將此功能抽象化為函式，其優點在於吾人可輕易計算多個點光源之照明，而無需重複程式碼。在`main`函式中，吾人僅需創建一迴圈，遍歷點光源陣列，並為每個點光源呼叫`CalcPointLight`函式。

## 總體匯集

如今吾人已為定向光源與點光源各自定義函式，可將其彙集於`main`函式之中。

```cpp
void main()
{
    // properties
    vec3 norm = normalize(Normal);
    vec3 viewDir = normalize(viewPos - FragPos);

    // phase 1: Directional lighting
    vec3 result = CalcDirLight(dirLight, norm, viewDir);
    // phase 2: Point lights
    for(int i = 0; i < NR_POINT_LIGHTS; i++)
        result += CalcPointLight(pointLights[i], norm, FragPos, viewDir);
    // phase 3: Spot light
    //result += CalcSpotLight(spotLight, norm, FragPos, viewDir);

    FragColor = vec4(result, 1.0);
}
```

每種光源皆將其貢獻增益於最終輸出色彩，直至所有光源處理完畢。所得色彩即包含場景中所有光源之綜合影響。吾人將`CalcSpotLight`函式之定義留作讀者之練習。

{% include box.html content="此方法在各類光源函式中存在諸多重複計算（例如，計算反射向量、漫反射和鏡面反射項，以及採樣材質紋理），故仍有優化空間。" color="green" %}

設定定向光源結構之統一變數應不甚陌生，然閣下或將疑惑如何設定點光源之統一變數，蓋因點光源之統一變數實乃`PointLight`結構之陣列。此乃吾人此前未曾論及者。

幸運者，此並非過於複雜。設定結構陣列之統一變數，一如設定單一結構之統一變數，惟此次吾人亦需於查詢統一變數位置時，定義適當之索引：

```cpp
lightingShader.setFloat("pointLights[0].constant", 1.0f);
```

此處吾人索引`pointLights`陣列中之首個`PointLight`結構，並於內部檢索其`constant`變數之位置，並將其設為`1.0`。

莫忘吾人亦需為四個點光源各自定義位置向量，故將其散佈於場景之中。吾人將定義另一`glm::vec3`陣列，其中包含點光源之位置：

```cpp
glm::vec3 pointLightPositions[] = {
    glm::vec3( 0.7f,  0.2f,  2.0f),
    glm::vec3( 2.3f, -3.3f, -4.0f),
    glm::vec3(-4.0f,  2.0f, -12.0f),
    glm::vec3( 0.0f,  0.0f, -3.0f)
};
```

隨後，吾人索引`pointLights`陣列中對應之`PointLight`結構，並將其`position`屬性設為吾人方才定義之位置之一。此外，務必繪製四個光源立方體而非僅一個。只需為每個光源物體創建不同之模型矩陣，一如吾人處理容器之法。

若閣下亦使用手電筒，所有組合光源之結果約莫如下所示：

![](https://learnopengl.com/img/lighting/multiple_lights_combined.png)

誠如所見，天空中似有某種全域光（如太陽），場景中散佈著四個光源，且從玩家視角可見手電筒之光。此景豈不甚為雅觀？

閣下可於此處尋得最終應用程式之完整原始碼：[https://learnopengl.com/code_viewer_gh.php?code=src/2.lighting/6.multiple_lights/multiple_lights.cpp](https://learnopengl.com/code_viewer_gh.php?code=src/2.lighting/6.multiple_lights/multiple_lights.cpp)。

此圖所示之所有光源皆設定為吾人於前章所用之預設光照屬性，然若閣下調整此等數值，或可獲致頗為有趣之結果。藝術家與關卡設計師通常於大型編輯器中調整所有此等光照變數，以確保光照與環境相符。運用吾人簡樸之環境，閣下僅需調整光源屬性，便可創造出一些頗為引人入勝之視覺效果：

![](https://learnopengl.com/img/lighting/multiple_lights_atmospheres.png)

吾人亦更改了清屏顏色，以更好地反映光照效果。閣下可見，僅僅調整部分光照參數，便可創造出截然不同之氛圍。

至此，閣下應已對 OpenGL 中之光照有相當深入之理解。憑藉迄今所學，吾人已能創建引人入勝且視覺豐富之環境與氛圍。請嘗試調整所有不同之數值，以創建閣下專屬之氛圍。
