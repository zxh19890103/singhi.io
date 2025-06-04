---
layout: bookdetail
chapter: 七
short: We learned that to add more detail to our objects we can use colors for each vertex to
title: 开始 &bull; 紋理
category: tech
src: https://learnopengl.com/Getting-started/Textures
date: 2025-06-03
editing: 1
---

We learned that to add more detail to our objects we can use colors for each vertex to create some interesting images. However, to get a fair bit of realism we'd have to have many vertices so we could specify a lot of colors. This takes up a considerable amount of extra overhead, since each model needs a lot more vertices and for each vertex a color attribute as well.

我們已經知道，要往我們的物件裡添加更多的細節，可以使用頂點顏色創造出一些有趣的圖案。然爾，要實現稍微逼真一點的效果，我們還必須要更多的頂點，如此，我們才能夠只能足夠量的顏色。這需要相當數量的額外開銷，這是因為每一個模型都需要多得多的頂點，並且每一個頂點都同時需要一個顏色屬性。

What artists and programmers generally prefer is to use a texture. A texture is a 2D image (even 1D and 3D textures exist) used to add detail to an object; think of a texture as a piece of paper with a nice brick image (for example) on it neatly folded over your 3D house so it looks like your house has a stone exterior. Because we can insert a lot of detail in a single image, we can give the illusion the object is extremely detailed without having to specify extra vertices.

藝術創作者以及程序員通常偏好的做法是使用紋理。紋理是一個 2D 圖片（甚至存在 1D 和 3D 紋理），它用於向物件添加更多的細節；將紋理想像為一張紙，紙上畫有一個漂亮的磚塊圖案（舉個例子），爾這張紙可以將你的 3D 房子完全包裹起來，如此看上去你的房子就有了一種石頭堆砌的感覺。我們可以向圖片加入大量的細節，物件因此就可以呈現出極致的細節，而無需提供額外的頂點信息。

{% include box.html color="green" content="
Next to images, textures can also be used to store a large collection of arbitrary data to send to the shaders, but we'll leave that for a different topic.

除了用於圖像，紋理也可以用於存儲大量任意數據集合，並發送給著色器，我們將其放到另一個不同的主題去討論。

" %}

Below you'll see a texture image of a [brick wall](https://learnopengl.com/img/textures/wall.jpg) mapped to the triangle from the previous chapter.

以下你可以看到一張畫有磚塊的圖片紋理，它被映射到上一章我們繪製的三角形上。

{% include img.html src="https://learnopengl.com/img/getting-started/textures.png" %}

In order to map a texture to the triangle we need to tell each vertex of the triangle which part of the texture it corresponds to. Each vertex should thus have a texture coordinate associated with them that specifies what part of the texture image to sample from. Fragment interpolation then does the rest for the other fragments.

为了将纹理映射到三角形上，我们需要明确每一个三角形的顶点对应纹理的哪个部分。因此，每一个顶点都应该具备一个纹理坐标，它指明了该从纹理的哪个部分采样。接着，片段插值可以对其它片段进行处理。

Texture coordinates range from 0 to 1 in the x and y axis (remember that we use 2D texture images). Retrieving the texture color using texture coordinates is called sampling. Texture coordinates start at (0,0) for the lower left corner of a texture image to (1,1) for the upper right corner of a texture image. The following image shows how we map texture coordinates to the triangle:

纹理坐标在 x 和 y 两个轴的取值在 0 到 1 之间（记住，我们使用 2D 纹理图）。从纹理坐标获取纹理色值的操作称为取样。紋理座標開始於左下角 (0,0) 到右上角 (1,1)。下面這張圖展示了我們如何將紋理座標對應到三角形上。

{% include img.html src="https://learnopengl.com/img/getting-started/tex_coords.png" %}

We specify 3 texture coordinate points for the triangle. We want the bottom-left side of the triangle to correspond with the bottom-left side of the texture so we use the (0,0) texture coordinate for the triangle's bottom-left vertex. The same applies to the bottom-right side with a (1,0) texture coordinate. The top of the triangle should correspond with the top-center of the texture image so we take (0.5,1.0) as its texture coordinate. We only have to pass 3 texture coordinates to the vertex shader, which then passes those to the fragment shader that neatly interpolates all the texture coordinates for each fragment.

我們為三角形配置了 3 個紋理座標。我們希望三角形的左下角對應紋理圖的左下角，因此我們對三角形的左下角頂點使用紋理座標 (0,0) 。紋理右下角情況類似。三角形的頂部應給對應紋理圖的頂部中心位置，我們取 (0.5,1.0) 作為紋理座標。我們只向頂點著色器傳入了 3 個紋理座標，它們將會被傳入到片段著色器，並且整齊地將紋理座標插入每一個片段。

The resulting texture coordinates would then look like this:

最終，紋理座標看起來將是這樣：

```c

float texCoords[] = {
    0.0f, 0.0f,  // lower-left corner
    1.0f, 0.0f,  // lower-right corner
    0.5f, 1.0f   // top-center corner
};
```

Texture sampling has a loose interpretation and can be done in many different ways. It is thus our job to tell OpenGL how it should sample its textures.

紋理取樣並無嚴格說法，它可以有很多種不同的方式來進行。因此我們需要明確告訴 OpenGL 應該如何對紋理取樣。

## Texture Wrapping

Texture coordinates usually range from (0,0) to (1,1) but what happens if we specify coordinates outside this range? The default behavior of OpenGL is to repeat the texture images (we basically ignore the integer part of the floating point texture coordinate), but there are more options OpenGL offers:

紋理座標通常從 (0,0) 到 (1,1)，但如果我們指定的座標超出範圍了呢？OpenGL 默認的做法是重複紋理圖（我們基本上忽略），但提供了更多的選項：

- *GL_REPEAT*: The default behavior for textures. Repeats the texture image.
- *GL_REPEAT*: 默認行為，重複紋理圖

- *GL_MIRRORED_REPEAT*: Same as GL_REPEAT but mirrors the image with each repeat.
- *GL_MIRRORED_REPEAT*: 與 GL_REPEAT 一樣，不過每次重複會取圖案的鏡像

- *GL_CLAMP_TO_EDGE*: Clamps the coordinates between 0 and 1. The result is that higher coordinates become clamped to the edge, resulting in a stretched edge pattern.
- *GL_CLAMP_TO_EDGE*: 將紋理座標限制到 0 到 1。結果是超出的座標會被放置到圖案邊緣，進而呈現一種邊緣拉伸效果。

- *GL_CLAMP_TO_BORDER*: Coordinates outside the range are now given a user-specified border color.
- *GL_CLAMP_TO_BORDER*: 對於範圍之外的座標，容許用戶自定義邊緣顏色。

Each of the options have a different visual output when using texture coordinates outside the default range. Let's see what these look like on a sample texture image (original image by Hólger Rezende):

當使用紋理座標超出範圍，這些選項各自有不同的視覺輸出。它們都會出現什麼樣的效果呢？ 我們拿一張采樣紋理圖為例進行演示，讓我們來看看：（原圖由 Hólger Rezende 提供）

{% include img.html src="https://learnopengl.com/img/getting-started/texture_wrapping.png" %}

Each of the aforementioned options can be set per coordinate axis (s, t (and r if you're using 3D textures) equivalent to x,y,z) with the glTexParameter\* function:

之前提及的那些選項中的每一個，都可以使用函數 glTexParameter\* 針對每個軸線進行設置（s、t，如果是 3D 紋理需要 r，這和 x、y、z 等同）。

```c
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_MIRRORED_REPEAT);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_MIRRORED_REPEAT);
```

The first argument specifies the texture target; we're working with 2D textures so the texture target is GL_TEXTURE_2D. The second argument requires us to tell what option we want to set and for which texture axis; we want to configure it for both the S and T axis. The last argument requires us to pass in the texture wrapping mode we'd like and in this case OpenGL will set its texture wrapping option on the currently active texture with GL_MIRRORED_REPEAT.

第一個參數指明了紋理目標；我們處理的是 2D 紋理，因此紋理目標是 GL_TEXTURE_2D。第二個參數需要我們明確我們要設置的選項是什麼，以及針對的軸線是什麼。我們希望配置 S 和 T 軸。最後一個參數需要我們傳入紋理 wrapping mode，這裡 OpenGL 將會對當前激活的紋理設置 wrapping mode 為 GL_MIRRORED_REPEAT。

If we choose the GL_CLAMP_TO_BORDER option we should also specify a border color. This is done using the fv equivalent of the glTexParameter function with GL_TEXTURE_BORDER_COLOR as its option where we pass in a float array of the border's color value:

如果我們選擇 GL_CLAMP_TO_BORDER，我們需要給定邊框顏色。這是通過使用與 glTexParameter 函數等效的 fv 變體來實現的，設置 GL_TEXTURE_BORDER_COLOR 作為選項，並傳入一個包含邊界顏色值的浮點數組：

```c
float borderColor[] = { 1.0f, 1.0f, 0.0f, 1.0f };
glTexParameterfv(GL_TEXTURE_2D, GL_TEXTURE_BORDER_COLOR, borderColor);
```

## Texture Filtering

Texture coordinates do not depend on resolution but can be any floating point value, thus OpenGL has to figure out which texture pixel (also known as a texel ) to map the texture coordinate to. This becomes especially important if you have a very large object and a low resolution texture. You probably guessed by now that OpenGL has options for this texture filtering as well. There are several options available but for now we'll discuss the most important options: GL_NEAREST and GL_LINEAR.

紋理座標無關分辨率，但是可以是任意浮點數，因此 OpenGL 必須找到對應到紋理座標的紋理像素（也被稱為紋素）。如果你有一個非常大的物件和一個非常地分辨率的紋理，這會變得非常的重要。你現在或許可以猜到，OpenGL 也為 texture filtering 提供了配置項。存在若干選項，但是我麼將探討其中最重要的兩個：GL_NEAREST 和 GL_LINEAR。

GL_NEAREST (also known as nearest neighbor or point filtering) is the default texture filtering method of OpenGL. When set to GL_NEAREST, OpenGL selects the texel that center is closest to the texture coordinate. Below you can see 4 pixels where the cross represents the exact texture coordinate. The upper-left texel has its center closest to the texture coordinate and is therefore chosen as the sampled color:

GL_NEAREST （也被稱為`最近鄰居`或著`點過濾`）是默認選項。當 texture filtering 被設置為 GL_NEAREST 的時候，OpenGL 會選擇最靠近紋理座標中心的紋素。以下，你可以看到 4 個像素，其中的 “+” 代表準確的紋理座標。左上角紋素的中心最靠近紋理座標，因此選擇它作為采樣顏色：

{% include img.html src="https://learnopengl.com/img/getting-started/filter_nearest.png" %}

GL_LINEAR (also known as (bi)linear filtering) takes an interpolated value from the texture coordinate's neighboring texels, approximating a color between the texels. The smaller the distance from the texture coordinate to a texel's center, the more that texel's color contributes to the sampled color. Below we can see that a mixed color of the neighboring pixels is returned:

GL_LINEAR（也被稱為線性過濾）通過與當前紋理座標相鄰的紋素，使用插值計算，估算紋素之間的顏色值。紋理座標到紋素中心距離越短，紋素對采樣色的貢獻就越多。以下，我們可以看到由鄰居像素混合計算得的顏色：

{% include img.html src="https://learnopengl.com/img/getting-started/filter_linear.png" %}

But what is the visual effect of such a texture filtering method? Let's see how these methods work when using a texture with a low resolution on a large object (texture is therefore scaled upwards and individual texels are noticeable):

然爾，這些 texture filtering 處理的視覺效果是什麼呢？讓我們將一個低分辨率紋理應用到一個超級大的物件，來看看這些處理方法的工作邏輯（紋理因此被放大了，並且個體紋素變得肉眼可見）。

{% include img.html src="https://learnopengl.com/img/getting-started/texture_filtering.png" %}

GL_NEAREST results in blocked patterns where we can clearly see the pixels that form the texture while GL_LINEAR produces a smoother pattern where the individual pixels are less visible. GL_LINEAR produces a more realistic output, but some developers prefer a more 8-bit look and as a result pick the GL_NEAREST option.

GL_NEAREST 產生了塊狀圖案，我們可以清楚看到其中從紋理抓取出來的像素；爾 GL_LINEAR 產生的是一種平滑的圖案，我們很難注意到單個的像素。GL_LINEAR 的效果更為逼真，然爾有些開發者更喜歡 由 GL_NEAREST 選項生成的 8-bit 風格。

Texture filtering can be set for magnifying and minifying operations (when scaling up or downwards) so you could for example use nearest neighbor filtering when textures are scaled downwards and linear filtering for upscaled textures. We thus have to specify the filtering method for both options via glTexParameter\*. The code should look similar to setting the wrapping method:

紋理 filtering 考慮到了紋理圖片的放大和縮小操作，這樣你可以在紋理被縮小的時候使用 nearest ，被放大的時候使用 linear。因此我們必須為兩個情況明確其 filtering 方法，這裡使用到的函數是 glTexParameter\*。代碼看上去和設置 wrapping 差不多：

```c
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
```

### Mipmaps

Imagine we had a large room with thousands of objects, each with an attached texture. There will be objects far away that have the same high resolution texture attached as the objects close to the viewer. Since the objects are far away and probably only produce a few fragments, OpenGL has difficulties retrieving the right color value for its fragment from the high resolution texture, since it has to pick a texture color for a fragment that spans a large part of the texture. This will produce visible artifacts on small objects, not to mention the waste of memory bandwidth using high resolution textures on small objects.

想像一下，我們有了一個很大的房間，裡頭有幾千個物件，每一個都使用了紋理。那麼，有些物件會離鏡頭非常遙遠，但是紋理的分辨率卻和近處的物件所使用的紋理一樣。由於物件遠離鏡頭，它們可能只需幾個片段，OpenGL 對於如何從高分辨率的紋理為這些片段提取正確的顏色感到有些困難，這是因為，物件的片段跨越的紋理範圍非常大，OpenGL 需要從這樣一個大的範圍選擇一個紋理顏色。對於視覺上很小的物件，這會產生可見的瑕疵，且不提對它們使用高分辨率紋理文件所浪費的內存帶寬。

To solve this issue OpenGL uses a concept called mipmaps that is basically a collection of texture images where each subsequent texture is twice as small compared to the previous one. The idea behind mipmaps should be easy to understand: after a certain distance threshold from the viewer, OpenGL will use a different mipmap texture that best suits the distance to the object. Because the object is far away, the smaller resolution will not be noticeable to the user. OpenGL is then able to sample the correct texels, and there's less cache memory involved when sampling that part of the mipmaps. Let's take a closer look at what a mipmapped texture looks like:

要解決這個問題，OpenGL 使用了 mipmaps 這個概念，基本上，它是是多個紋理的集合，其中第 n+1 個紋理是第 n 個的**一半**。mipmaps 背後的原理很好理解：物件到鏡頭的距離超過一個闕值，OpenGL 就會使用一個不同的 mipmap 紋理，此紋理更好地適應物件的距離。因為物件很遠，較小分辨率對於用戶並不會注意到。這樣 OpenGL 也可以獲取到正確的紋素，並且在對此 mipmap 是 采樣的時候也會涉及較少的內存緩存。讓我們來看看 mipmap 之後的紋理長什麼樣子：

{% include img.html src="https://learnopengl.com/img/getting-started/mipmaps.png" %}

Creating a collection of mipmapped textures for each texture image is cumbersome to do manually, but luckily OpenGL is able to do all the work for us with a single call to glGenerateMipmap after we've created a texture.

人工為每一個紋理圖案創建 mipmapped 紋理集合有些繁瑣，但是幸運的是 OpenGL 可以為我們處理所有的這些工作，只需在創建好紋理對象之後調用一個函數 glGenerateMipmap 即可。

When switching between mipmaps levels during rendering OpenGL may show some artifacts like sharp edges visible between the two mipmap layers. Just like normal texture filtering, it is also possible to filter between mipmap levels using NEAREST and LINEAR filtering for switching between mipmap levels. To specify the filtering method between mipmap levels we can replace the original filtering methods with one of the following four options:

當在渲染過程中切換不同 mipmap 層級時，OpenGL 可能會顯示一些偽影，例如在兩個 mipmap 層之間出現明顯的銳利邊緣。就像普通的紋理過濾一樣，也可以在 mipmap 層級之間進行過濾，使用 NEAREST 或 LINEAR 過濾方式來切換 mipmap 層級。為了指定 mipmap 層級之間的過濾方法，我們可以將原始過濾方法替換為以下四種選項之一：

- _GL_NEAREST_MIPMAP_NEAREST_: takes the nearest mipmap to match the pixel size and uses nearest neighbor interpolation for texture sampling.
- _GL_LINEAR_MIPMAP_NEAREST_: takes the nearest mipmap level and samples that level using linear interpolation.
- _GL_NEAREST_MIPMAP_LINEAR_: linearly interpolates between the two mipmaps that most closely match the size of a pixel and samples the interpolated level via nearest neighbor interpolation.
- _GL_LINEAR_MIPMAP_LINEAR_: linearly interpolates between the two closest mipmaps and samples the interpolated level via linear interpolation.

- GL_NEAREST_MIPMAP_NEAREST：選擇最接近的 mipmap 層級，使用最近點採樣，可能導致塊狀或銳利邊緣（類似你提到的“blocked patterns”）。
- GL_NEAREST_MIPMAP_LINEAR：選擇最接近的 mipmap 層級，使用線性插值，稍平滑。
- GL_LINEAR_MIPMAP_NEAREST：在最接近的 mipmap 層級上使用線性採樣，但層級間不插值。
- GL_LINEAR_MIPMAP_LINEAR：在 mipmap 層級間進行線性插值（三線性過濾），最平滑，減少偽影（如“銳利邊緣”）。

Just like texture filtering we can set the filtering method to one of the 4 aforementioned methods using glTexParameteri:

就像紋理過濾一樣，我們可以使用 glTexParameteri 將過濾方法設置為前述四種方法之一：

```c
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR_MIPMAP_LINEAR);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
```

A common mistake is to set one of the mipmap filtering options as the magnification filter. This doesn't have any effect since mipmaps are primarily used for when textures get downscaled: texture magnification doesn't use mipmaps and giving it a mipmap filtering option will generate an OpenGL GL_INVALID_ENUM error code.

一個常見的錯誤是將 mipmap 過濾方法設置到 mag filter 上。mipmaps 本就是用於當紋理縮小的情況，對其使用 mag filter 不會有效果。紋理 magnification 不會使用 mipmaps，如果對這項配置設置了一個 mipmap filtering 方法，OpenGL 將會拋出 GL_INVALID_ENUM 錯誤。

## Loading and creating textures

The first thing we need to do to actually use textures is to load them into our application. Texture images can be stored in dozens of file formats, each with their own structure and ordering of data, so how do we get those images in our application? One solution would be to choose a file format we'd like to use, say .PNG and write our own image loader to convert the image format into a large array of bytes. While it's not very hard to write your own image loader, it's still cumbersome and what if you want to support more file formats? You'd then have to write an image loader for each format you want to support.

實際上首要的事情是將紋理家在入我們的應用。紋理圖案可以被存儲以十多種格式，每一種擁有自己的數據結構以及排序，那麼我們如何在我們的應用中拿到那些圖片呢？方案之一是選擇一種我們喜歡的格式，比如 .png，編寫圖片加載器並將其轉換為大型字節數組。你不難編寫出你自己的圖片加載器，但是要支持更多文件格式或許並不簡單吧？這樣，你必須為任何一你需要的格式寫一個圖片加載器。

Another solution, and probably a good one, is to use an image-loading library that supports several popular formats and does all the hard work for us. A library like stb_image.h.

另一個方案，或許不錯，就是使用圖片加載工具庫，它要能夠支持機種流行格式以及幫助我們處理了全部困難的部分。其中一個是 `stb_image.h`：

### stb_image.h

stb_image.h is a very popular single header image loading library by [Sean Barrett](https://github.com/nothings) that is able to load most popular file formats and is easy to integrate in your project(s). stb_image.h can be downloaded from [here](https://github.com/nothings/stb/blob/master/stb_image.h). Simply download the single header file, add it to your project as stb_image.h, and create an additional C++ file with the following code:

stb_image.h 是一個非常流行的圖片加載庫，作者是 Sean Barrett，它能夠加載大部分流行的文件格式，也非常容易集成到你的項目當中。stb_image.h 可以從這裡下載。將這個頭文件下載下來，以 stb_image.h 文件添加到你的項目當中，並創建一個額外的 c++ 文件，代碼如下：

```c
#define STB_IMAGE_IMPLEMENTATION
#include "stb_image.h"
```

By defining STB_IMAGE_IMPLEMENTATION the preprocessor modifies the header file such that it only contains the relevant definition source code, effectively turning the header file into a .cpp file, and that's about it. Now simply include stb_image.h somewhere in your program and compile.

通過定義 STB_IMAGE_IMPLEMENTATION，預處理器會修改頭文件，使其僅包含相關的定義源代碼，實際上將頭文件轉化為一個 .cpp 文件，僅此而已。現在，只需在你的程式中某處包含 stb_image.h 並進行編譯即可。

For the following texture sections we're going to use an image of a [wooden container](https://learnopengl.com/img/textures/container.jpg). To load an image using stb_image.h we use its stbi_load function:

對於以下紋理部分，我們將使用 [wooden container] 的一張圖片。要使用 stb_image.h  加載這張圖片，我們使用其中的 stbi_load 函數：

```c
int width, height, nrChannels;
unsigned char *data = stbi_load("container.jpg", &width, &height, &nrChannels, 0);
```

The function first takes as input the location of an image file. It then expects you to give three ints as its second, third and fourth argument that stb_image.h will fill with the resulting image's width, height and number of color channels. We need the image's width and height for generating textures later on.

函數首先將圖片文件的位置作為輸入。然後，期望你給它 3 個整數，分別是第二、第三和第四個參數，它們將用於填充加載圖片的寬、高以及顏色通道的個數。我們會在稍後生成紋理的時候使用到寬和高。

### Generating a texture

Like any of the previous objects in OpenGL, textures are referenced with an ID; let's create one:

```c
unsigned int texture;
glGenTextures(1, &texture);
```

The glGenTextures function first takes as input how many textures we want to generate and stores them in a unsigned int array given as its second argument (in our case just a single unsigned int). Just like other objects we need to bind it so any subsequent texture commands will configure the currently bound texture:

```c
glBindTexture(GL_TEXTURE_2D, texture);
```

Now that the texture is bound, we can start generating a texture using the previously loaded image data. Textures are generated with glTexImage2D:

```c
glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB, width, height, 0, GL_RGB, GL_UNSIGNED_BYTE, data);
glGenerateMipmap(GL_TEXTURE_2D);
```

This is a large function with quite a few parameters so we'll walk through them step-by-step:

- The first argument specifies the texture target; setting this to GL_TEXTURE_2D means this operation will generate a texture on the currently bound texture object at the same target (so any textures bound to targets GL_TEXTURE_1D or GL_TEXTURE_3D will not be affected).
- The second argument specifies the mipmap level for which we want to create a texture for if you want to set each mipmap level manually, but we'll leave it at the base level which is 0.
- The third argument tells OpenGL in what kind of format we want to store the texture. Our image has only RGB values so we'll store the texture with RGB values as well.
- The 4th and 5th argument sets the width and height of the resulting texture. We stored those earlier when loading the image so we'll use the corresponding variables.
- The next argument should always be 0 (some legacy stuff).
- The 7th and 8th argument specify the format and datatype of the source image. We loaded the image with RGB values and stored them as chars (bytes) so we'll pass in the corresponding values.
- The last argument is the actual image data.

Once glTexImage2D is called, the currently bound texture object now has the texture image attached to it. However, currently it only has the base-level of the texture image loaded and if we want to use mipmaps we have to specify all the different images manually (by continually incrementing the second argument) or, we could call glGenerateMipmap after generating the texture. This will automatically generate all the required mipmaps for the currently bound texture.

After we're done generating the texture and its corresponding mipmaps, it is good practice to free the image memory:

```c
stbi_image_free(data);
```

The whole process of generating a texture thus looks something like this:

```c
unsigned int texture;
glGenTextures(1, &texture);
glBindTexture(GL_TEXTURE_2D, texture);
// set the texture wrapping/filtering options (on the currently bound texture object)
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_REPEAT);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_REPEAT);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR_MIPMAP_LINEAR);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
// load and generate the texture
int width, height, nrChannels;
unsigned char *data = stbi_load("container.jpg", &width, &height, &nrChannels, 0);
if (data)
{
    glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB, width, height, 0, GL_RGB, GL_UNSIGNED_BYTE, data);
    glGenerateMipmap(GL_TEXTURE_2D);
}
else
{
    std::cout << "Failed to load texture" << std::endl;
}
stbi_image_free(data);
```

### Applying textures

For the upcoming sections we will use the rectangle shape drawn with glDrawElements from the final part of the Hello Triangle chapter. We need to inform OpenGL how to sample the texture so we'll have to update the vertex data with the texture coordinates:

```c
float vertices[] = {
    // positions          // colors           // texture coords
     0.5f,  0.5f, 0.0f,   1.0f, 0.0f, 0.0f,   1.0f, 1.0f,   // top right
     0.5f, -0.5f, 0.0f,   0.0f, 1.0f, 0.0f,   1.0f, 0.0f,   // bottom right
    -0.5f, -0.5f, 0.0f,   0.0f, 0.0f, 1.0f,   0.0f, 0.0f,   // bottom left
    -0.5f,  0.5f, 0.0f,   1.0f, 1.0f, 0.0f,   0.0f, 1.0f    // top left
};
```

Since we've added an extra vertex attribute we again have to notify OpenGL of the new vertex format:

{% include img.html src="https://learnopengl.com/img/getting-started/vertex_attribute_pointer_interleaved_textures.png" %}

```c
glVertexAttribPointer(2, 2, GL_FLOAT, GL_FALSE, 8 * sizeof(float), (void*)(6 * sizeof(float)));
glEnableVertexAttribArray(2);
```

Note that we have to adjust the stride parameter of the previous two vertex attributes to 8 \* sizeof(float) as well.

Next we need to alter the vertex shader to accept the texture coordinates as a vertex attribute and then forward the coordinates to the fragment shader:

```c
#version 330 core
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec3 aColor;
layout (location = 2) in vec2 aTexCoord;

out vec3 ourColor;
out vec2 TexCoord;

void main()
{
    gl_Position = vec4(aPos, 1.0);
    ourColor = aColor;
    TexCoord = aTexCoord;
}
```

The fragment shader should then accept the TexCoord output variable as an input variable.

The fragment shader should also have access to the texture object, but how do we pass the texture object to the fragment shader? GLSL has a built-in data-type for texture objects called a sampler that takes as a postfix the texture type we want e.g. sampler1D, sampler3D or in our case sampler2D. We can then add a texture to the fragment shader by simply declaring a uniform sampler2D that we later assign our texture to.

```c
#version 330 core
out vec4 FragColor;

in vec3 ourColor;
in vec2 TexCoord;

uniform sampler2D ourTexture;

void main()
{
    FragColor = texture(ourTexture, TexCoord);
}
```

To sample the color of a texture we use GLSL's built-in texture function that takes as its first argument a texture sampler and as its second argument the corresponding texture coordinates. The texture function then samples the corresponding color value using the texture parameters we set earlier. The output of this fragment shader is then the (filtered) color of the texture at the (interpolated) texture coordinate.

All that's left to do now is to bind the texture before calling glDrawElements and it will then automatically assign the texture to the fragment shader's sampler:

```c
glBindTexture(GL_TEXTURE_2D, texture);
glBindVertexArray(VAO);
glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_INT, 0);
```

If you did everything right you should see the following image:

{% include img.html src="https://learnopengl.com/img/getting-started/textures2.png" %}

If your rectangle is completely white or black you probably made an error along the way. Check your shader logs and try to compare your code with the application's [source code](https://learnopengl.com/code_viewer_gh.php?code=src/1.getting_started/4.1.textures/textures.cpp).

{% include box.html color="red" content="
If your texture code doesn't work or shows up as completely black, continue reading and work your way to the last example that should work. On some drivers it is required to assign a texture unit to each sampler uniform, which is something we'll discuss further in this chapter.
" %}

To get a little funky we can also mix the resulting texture color with the vertex colors. We simply multiply the resulting texture color with the vertex color in the fragment shader to mix both colors:

```c
FragColor = texture(ourTexture, TexCoord) * vec4(ourColor, 1.0);
```

The result should be a mixture of the vertex's color and the texture's color:

{% include img.html src="https://learnopengl.com/img/getting-started/textures_funky.png" %}

I guess you could say our container likes to disco.

### Texture Units

You probably wondered why the sampler2D variable is a uniform if we didn't even assign it some value with glUniform. Using glUniform1i we can actually assign a location value to the texture sampler so we can set multiple textures at once in a fragment shader. This location of a texture is more commonly known as a texture unit. The default texture unit for a texture is 0 which is the default active texture unit so we didn't need to assign a location in the previous section; note that not all graphics drivers assign a default texture unit so the previous section may not have rendered for you.

The main purpose of texture units is to allow us to use more than 1 texture in our shaders. By assigning texture units to the samplers, we can bind to multiple textures at once as long as we activate the corresponding texture unit first. Just like glBindTexture we can activate texture units using glActiveTexture passing in the texture unit we'd like to use:

```c
glActiveTexture(GL_TEXTURE0); // activate the texture unit first before binding texture
glBindTexture(GL_TEXTURE_2D, texture);
```

After activating a texture unit, a subsequent glBindTexture call will bind that texture to the currently active texture unit. Texture unit GL_TEXTURE0 is always by default activated, so we didn't have to activate any texture units in the previous example when using glBindTexture.

{% include box.html color="green" content="
OpenGL should have a at least a minimum of 16 texture units for you to use which you can activate using GL_TEXTURE0 to GL_TEXTURE15. They are defined in order so we could also get GL_TEXTURE8 via GL_TEXTURE0 + 8 for example, which is useful when we'd have to loop over several texture units.
" %}

We still however need to edit the fragment shader to accept another sampler. This should be relatively straightforward now:

```c
#version 330 core
...

uniform sampler2D texture1;
uniform sampler2D texture2;

void main()
{
    FragColor = mix(texture(texture1, TexCoord), texture(texture2, TexCoord), 0.2);
}
```

The final output color is now the combination of two texture lookups. GLSL's built-in mix function takes two values as input and linearly interpolates between them based on its third argument. If the third value is 0.0 it returns the first input; if it's 1.0 it returns the second input value. A value of 0.2 will return 80% of the first input color and 20% of the second input color, resulting in a mixture of both our textures.

We now want to load and create another texture; you should be familiar with the steps now. Make sure to create another texture object, load the image and generate the final texture using glTexImage2D. For the second texture we'll use an image of your [facial expression while learning OpenGL](https://learnopengl.com/img/textures/awesomeface.png):

```c

unsigned char *data = stbi_load("awesomeface.png", &width, &height, &nrChannels, 0);
if (data)
{
    glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB, width, height, 0, GL_RGBA, GL_UNSIGNED_BYTE, data);
    glGenerateMipmap(GL_TEXTURE_2D);
}
```

Note that we now load a .png image that includes an alpha (transparency) channel. This means we now need to specify that the image data contains an alpha channel as well by using GL_RGBA; otherwise OpenGL will incorrectly interpret the image data.

To use the second texture (and the first texture) we'd have to change the rendering procedure a bit by binding both textures to the corresponding texture unit:

```c
glActiveTexture(GL_TEXTURE0);
glBindTexture(GL_TEXTURE_2D, texture1);
glActiveTexture(GL_TEXTURE1);
glBindTexture(GL_TEXTURE_2D, texture2);

glBindVertexArray(VAO);
glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_INT, 0);
```

We also have to tell OpenGL to which texture unit each shader sampler belongs to by setting each sampler using glUniform1i. We only have to set this once, so we can do this before we enter the render loop:

```c
ourShader.use(); // don't forget to activate the shader before setting uniforms!
glUniform1i(glGetUniformLocation(ourShader.ID, "texture1"), 0); // set it manually
ourShader.setInt("texture2", 1); // or with shader class

while(...)
{
    [...]
}
```

By setting the samplers via glUniform1i we make sure each uniform sampler corresponds to the proper texture unit. You should get the following result:

{% include img.html src="https://learnopengl.com/img/getting-started/textures_combined.png" %}

You probably noticed that the texture is flipped upside-down! This happens because OpenGL expects the 0.0 coordinate on the y-axis to be on the bottom side of the image, but images usually have 0.0 at the top of the y-axis. Luckily for us, stb_image.h can flip the y-axis during image loading by adding the following statement before loading any image:

```c
stbi_set_flip_vertically_on_load(true);
```

After telling stb_image.h to flip the y-axis when loading images you should get the following result:

{% include img.html src="https://learnopengl.com/img/getting-started/textures_combined2.png" %}

If you see one happy container, you did things right. You can compare it with the [source code](https://learnopengl.com/code_viewer_gh.php?code=src/1.getting_started/4.2.textures_combined/textures_combined.cpp).
