---
layout: bookdetail
chapter: "#14"
title: Lighting &bull; Lighting-maps
category: tech
src: "https://learnopengl.com/Lighting/Lighting-maps"
date: 2025-06-30
math: 1
book: opengl
image: "https://learnopengl.com/img/textures/container2.png"
order: 14
lang: en
glcate: Lighting
gltopic: Lighting-maps
permalink: /opengl/en/Lighting/Lighting-maps
---

In the [previous](https://learnopengl.com/Lighting/Materials) chapter we discussed the possibility of each object having a unique material of its own that reacts differently to light. This is great for giving each object a unique look in comparison to other objects, but still doesn't offer much flexibility on the visual output of an object.

In the previous chapter we defined a material for an entire object as a whole. Objects in the real world however usually do not consist of a single material, but of several materials. Think of a car: its exterior consists of a shiny fabric, it has windows that partly reflect the surrounding environment, its tires are all but shiny so they don't have specular highlights and it has rims that are super shiny (if you actually washed your car alright). The car also has diffuse and ambient colors that are not the same for the entire object; a car displays many different ambient/diffuse colors. All by all, such an object has different material properties for each of its different parts.

So the material system in the previous chapter isn't sufficient for all but the simplest models so we need to extend the system by introducing _diffuse_ and _specular_ maps. These allow us to influence the diffuse (and indirectly the ambient component since they should be the same anyways) and the specular component of an object with much more precision.

## Diffuse maps

What we want is some way to set the diffuse colors of an object for each individual fragment. Some sort of system where we can retrieve a color value based on the fragment's position on the object?

This should probably all sound familiar and we've been using such a system for a while now. This sounds just like _textures_ we've extensively discussed in one of the [earlier](https://learnopengl.com/Getting-started/Textures) chapters and it basically is just that: a texture. We're just using a different name for the same underlying principle: using an image wrapped around an object that we can index for unique color values per fragment. In lit scenes this is usually called a `diffuse map` (this is generally how 3D artists call them before PBR) since a texture image represents all of the object's diffuse colors.

To demonstrate diffuse maps we're going to use the [following image](https://learnopengl.com/img/textures/container2.png) of a wooden container with a steel border:

![](https://learnopengl.com/img/textures/container2.png)

Using a diffuse map in shaders is exactly like we showed in the texture chapter. This time however we store the texture as a `sampler2D` inside the `Material` struct. We replace the earlier defined `vec3` diffuse color vector with the diffuse map.

{% include box.html content="
Keep in mind that `sampler2D` is a so called `opaque type` which means we can't instantiate these types, but only define them as uniforms. If the struct would be instantiated other than as a uniform (like a function parameter) GLSL could throw strange errors; the same thus applies to any struct holding such opaque types.
" color="red" %}

We also remove the ambient material color vector since the ambient color is equal to the diffuse color anyways now that we control ambient with the light. So there's no need to store it separately:

```cpp
struct Material {
    sampler2D diffuse;
    vec3      specular;
    float     shininess;
};
...
in vec2 TexCoords;
```

{% include box.html content="
If you're a bit stubborn and still want to set the ambient colors to a different value (other than the diffuse value) you can keep the ambient `vec3`, but then the ambient colors would still remain the same for the entire object. To get different ambient values for each fragment you'd have to use another texture for ambient values alone.
" color="green" %}

Note that we are going to need texture coordinates again in the fragment shader, so we declared an extra input variable. Then we simply sample from the texture to retrieve the fragment's diffuse color value:

```cpp
vec3 diffuse = light.diffuse * diff * vec3(texture(material.diffuse, TexCoords));
```

Also, don't forget to set the ambient material's color equal to the diffuse material's color as well:

```cpp
vec3 ambient = light.ambient * vec3(texture(material.diffuse, TexCoords));
```

And that's all it takes to use a diffuse map. As you can see it is nothing new, but it does provide a dramatic increase in visual quality. To get it working we do need to update the vertex data with texture coordinates, transfer them as vertex attributes to the fragment shader, load the texture, and bind the texture to the appropriate texture unit.

The updated vertex data can be found [here](https://learnopengl.com/code_viewer.php?code=lighting/vertex_data_textures). The vertex data now includes vertex positions, normal vectors, and texture coordinates for each of the cube's vertices. Let's update the vertex shader to accept texture coordinates as a vertex attribute and forward them to the fragment shader:

```cpp
#version 330 core
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec3 aNormal;
layout (location = 2) in vec2 aTexCoords;
...
out vec2 TexCoords;

void main()
{
    ...
    TexCoords = aTexCoords;
}
```

Be sure to update the vertex attribute pointers of both VAOs to match the new vertex data and load the container image as a texture. Before rendering the cube we want to assign the right texture unit to the `material.diffuse` uniform sampler and bind the container texture to this texture unit:

```cpp
lightingShader.setInt("material.diffuse", 0);
...
glActiveTexture(GL_TEXTURE0);
glBindTexture(GL_TEXTURE_2D, diffuseMap);
```

Now using a diffuse map we get an enormous boost in detail again and this time the container really starts to shine (quite literally). Your container now probably looks something like this:

![](https://learnopengl.com/img/lighting/materials_diffuse_map.png)

You can find the full source code of the application [here](https://learnopengl.com/code_viewer_gh.php?code=src/2.lighting/4.1.lighting_maps_diffuse_map/lighting_maps_diffuse.cpp).

## Specular maps

You probably noticed that the specular highlight looks a bit odd since the object is a container that mostly consists of wood and wood doesn't have specular highlights like that. We can fix this by setting the specular material of the object to `vec3(0.0)` but that would mean that the steel borders of the container would stop showing specular highlights as well and steel **should** show specular highlights. We would like to control what parts of the object should show a specular highlight with varying intensity. This is a problem that sounds familiar. Coincidence? I think not.

We can also use a texture map just for specular highlights. This means we need to generate a black and white (or colors if you feel like it) texture that defines the specular intensities of each part of the object. An example of a [specular map](https://learnopengl.com/img/textures/container2_specular.png) is the following image:

![](https://learnopengl.com/img/textures/container2_specular.png)

The intensity of the specular highlight comes from the brightness of each pixel in the image. Each pixel of the specular map can be displayed as a color vector where black represents the color vector `vec3(0.0)` and gray the color vector `vec3(0.5)` for example. In the fragment shader we then sample the corresponding color value and multiply this value with the light's specular intensity. The more 'white' a pixel is, the higher the result of the multiplication and thus the brighter the specular component of an object becomes.

Because the container mostly consists of wood, and wood as a material should have no specular highlights, the entire wooden section of the diffuse texture was converted to black: black sections do not have any specular highlight. The steel border of the container has varying specular intensities with the steel itself being relatively susceptible to specular highlights while the cracks are not.

{% include box.html content="
Technically wood also has specular highlights although with a much lower shininess value (more light scattering) and less impact, but for learning purposes we can just pretend wood doesn't have any reaction to specular light.
" color="green" %}

Using tools like _Photoshop_ or _Gimp_ it is relatively easy to transform a diffuse texture to a specular image like this by cutting out some parts, transforming it to black and white and increasing the brightness/contrast.

### Sampling specular maps

A specular map is just like any other texture so the code is similar to the diffuse map code. Make sure to properly load the image and generate a texture object. Since we're using another texture sampler in the same fragment shader we have to use a different texture unit (see [Textures](https://learnopengl.com/Getting-started/Textures)) for the specular map so let's bind it to the appropriate texture unit before rendering:

```cpp
lightingShader.setInt("material.specular", 1);
...
glActiveTexture(GL_TEXTURE1);
glBindTexture(GL_TEXTURE_2D, specularMap);
```

Then update the material properties of the fragment shader to accept a `sampler2D` as its specular component instead of a `vec3`:

```cpp
struct Material {
    sampler2D diffuse;
    sampler2D specular;
    float     shininess;
};
```

And lastly we want to sample the specular map to retrieve the fragment's corresponding specular intensity:

```cpp
vec3 ambient  = light.ambient  * vec3(texture(material.diffuse, TexCoords));
vec3 diffuse  = light.diffuse  * diff * vec3(texture(material.diffuse, TexCoords));
vec3 specular = light.specular * spec * vec3(texture(material.specular, TexCoords));
FragColor = vec4(ambient + diffuse + specular, 1.0);
```

By using a specular map we can specify with enormous detail what parts of an object have _shiny_ properties and we can even control the corresponding intensity. Specular maps give us an added layer of control over lighting on top of the diffuse map.

{% include box.html content="
If you don't want to be too mainstream you could also use actual colors in the specular map to not only set the specular intensity of each fragment, but also the color of the specular highlight. Realistically however, the color of the specular highlight is mostly determined by the light source itself so it wouldn't generate realistic visuals (that's why the images are usually black and white: we only care about the intensity).
" color="green" %}

If you would now run the application you can clearly see that the container's material now closely resembles that of an actual wooden container with steel frames:

![](https://learnopengl.com/img/lighting/materials_specular_map.png)

You can find the full source code of the application [here](https://learnopengl.com/code_viewer_gh.php?code=src/2.lighting/4.2.lighting_maps_specular_map/lighting_maps_specular.cpp).

Using diffuse and specular maps we can really add an enormous amount of detail into relatively simple objects. We can even add more detail into the objects using other texture maps like `normal/bump maps` and/or `reflection maps`, but that is something we'll reserve for later chapters. Show your container to all your friends and family and be content with the fact that our container can one day become even prettier than it already is!
