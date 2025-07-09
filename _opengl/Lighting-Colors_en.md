---
layout: bookdetail
chapter: #11
title: Lighting &bull; Colors
category: tech
src: "https://learnopengl.com/Lighting/Colors"
date: 2025-06-30
math: 1
book: opengl
image: "https://learnopengl.com/img/lighting/light_reflection.png"
order: 11
lang: en
glcate: Lighting
gltopic: Colors
permalink: /opengl/en/Lighting/Colors
---

We briefly used and manipulated colors in the previous chapters, but never defined them properly. Here we'll discuss what colors are and start building the scene for the upcoming Lighting chapters. {% include play.html name="creating-a-window" %}

In the real world, colors can take any known color value with each object having its own color(s). In the digital world we need to map the (infinite) real colors to (limited) digital values and therefore not all real-world colors can be represented digitally. Colors are digitally represented using a `red`, `green` and `blue` component commonly abbreviated as `RGB`. Using different combinations of just those 3 values, within a range of `[0,1]`, we can represent almost any color there is. For example, to get a _coral_ color, we define a color vector as:

```cpp
glm::vec3 coral(1.0f, 0.5f, 0.31f);
```

The color of an object we see in real life is not the color it actually has, but is the color `reflected` from the object. The colors that aren't absorbed (rejected) by the object is the color we perceive of it. As an example, the light of the sun is perceived as a white light that is the combined sum of many different colors (as you can see in the image). If we would shine this white light on a blue toy, it would absorb all the white color's sub-colors except the blue color. Since the toy does not absorb the blue color part, it is reflected. This reflected light enters our eye, making it look like the toy has a blue color. The following image shows this for a coral colored toy where it reflects several colors with varying intensity:

![](https://learnopengl.com/img/lighting/light_reflection.png)

You can see that the white sunlight is a collection of all the visible colors and the object absorbs a large portion of those colors. It only reflects those colors that represent the object's color and the combination of those is what we perceive (in this case a coral color).

{% include box.html content="
Technically it's a bit more complicated, but we'll get to that in the PBR chapters.
" color="green" %}

These rules of color reflection apply directly in graphics-land. When we define a light source in OpenGL we want to give this light source a color. In the previous paragraph we had a white color so we'll give the light source a white color as well. If we would then multiply the light source's color with an object's color value, the resulting color would be the reflected color of the object (and thus its perceived color). Let's revisit our toy (this time with a coral value) and see how we would calculate its perceived color in graphics-land. We get the resulting color vector by doing a component-wise multiplication between the light and object color vectors:

```cpp
glm::vec3 lightColor(1.0f, 1.0f, 1.0f);
glm::vec3 toyColor(1.0f, 0.5f, 0.31f);
glm::vec3 result = lightColor * toyColor; // = (1.0f, 0.5f, 0.31f);
```

We can see that the toy's color _absorbs_ a large portion of the white light, but reflects several red, green and blue values based on its own color value. This is a representation of how colors would work in real life. We can thus define an object's color as _the amount of each color component it reflects from a light source_. Now what would happen if we used a green light?

```cpp
glm::vec3 lightColor(0.0f, 1.0f, 0.0f);
glm::vec3 toyColor(1.0f, 0.5f, 0.31f);
glm::vec3 result = lightColor * toyColor; // = (0.0f, 0.5f, 0.0f);
```

As we can see, the toy has no red and blue light to absorb and/or reflect. The toy also absorbs half of the light's green value, but also reflects half of the light's green value. The toy's color we perceive would then be a dark-greenish color. We can see that if we use a green light, only the green color components can be reflected and thus perceived; no red and blue colors are perceived. As a result the coral object suddenly becomes a dark-greenish object. Let's try one more example with a dark olive-green light:

```cpp
glm::vec3 lightColor(0.33f, 0.42f, 0.18f);
glm::vec3 toyColor(1.0f, 0.5f, 0.31f);
glm::vec3 result = lightColor * toyColor; // = (0.33f, 0.21f, 0.06f);
```

As you can see, we can get interesting colors from objects using different light colors. It's not hard to get creative with colors.

But enough about colors, let's start building a scene where we can experiment in.

## A lighting scene

In the upcoming chapters we'll be creating interesting visuals by simulating real-world lighting making extensive use of colors. Since now we'll be using light sources we want to display them as visual objects in the scene and add at least one object to simulate the lighting from.

The first thing we need is an object to cast the light on and we'll use the infamous container cube from the previous chapters. We'll also be needing a light object to show where the light source is located in the 3D scene. For simplicity's sake we'll represent the light source with a cube as well (we already have the [vertex data](https://learnopengl.com/code_viewer.php?code=getting-started/cube_vertices_pos) right?).

So, filling a vertex buffer object, setting vertex attribute pointers and all that jazz should be familiar for you by now so we won't walk you through those steps. If you still have no idea what's going on with those I suggest you review the [previous chapters](https://learnopengl.com/Getting-started/Hello-Triangle), and work through the exercises if possible, before continuing.

So, the first thing we'll need is a vertex shader to draw the container. The vertex positions of the container remain the same (although we won't be needing texture coordinates this time) so the code should be nothing new. We'll be using a stripped down version of the vertex shader from the last chapters:

```cpp
#version 330 core
layout (location = 0) in vec3 aPos;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

void main()
{
    gl_Position = projection * view * model * vec4(aPos, 1.0);
}
```

Make sure to update the vertex data and attribute pointers to match the new vertex shader (if you want, you can actually keep the texture data and attribute pointers active; we're just not using them right now).

Because we're also going to render a light source cube, we want to generate a new VAO specifically for the light source. We could render the light source with the same VAO and then do a few light position transformations on the `model` matrix, but in the upcoming chapters we'll be changing the vertex data and attribute pointers of the container object quite often and we don't want these changes to propagate to the light source object (we only care about the light cube's vertex positions), so we'll create a new VAO:

```cpp
unsigned int lightVAO;
glGenVertexArrays(1, &lightVAO);
glBindVertexArray(lightVAO);
// we only need to bind to the VBO, the container's VBO's data already contains the data.
glBindBuffer(GL_ARRAY_BUFFER, VBO);
// set the vertex attribute
glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(float), (void*)0);
glEnableVertexAttribArray(0);
```

The code should be relatively straightforward. Now that we created both the container and the light source cube there is one thing left to define and that is the fragment shader for both the container and the light source:

```cpp
#version 330 core
out vec4 FragColor;

uniform vec3 objectColor;
uniform vec3 lightColor;

void main()
{
    FragColor = vec4(lightColor * objectColor, 1.0);
}
```

The fragment shader accepts both an object color and a light color from a uniform variable. Here we multiply the light's color with the object's (reflected) color like we discussed at the beginning of this chapter. Again, this shader should be easy to understand. Let's set the object's color to the last section's coral color with a white light:

```cpp
// don't forget to use the corresponding shader program first (to set the uniform)
lightingShader.use();
lightingShader.setVec3("objectColor", 1.0f, 0.5f, 0.31f);
lightingShader.setVec3("lightColor",  1.0f, 1.0f, 1.0f);
```

One thing left to note is that when we start to update these _lighting shaders_ in the next chapters, the light source cube would also be affected and this is not what we want. We don't want the light source object's color to be affected the lighting calculations, but rather keep the light source isolated from the rest. We want the light source to have a constant bright color, unaffected by other color changes (this makes it look like the light source cube really is the source of the light).

To accomplish this we need to create a second set of shaders that we'll use to draw the light source cube, thus being safe from any changes to the lighting shaders. The vertex shader is the same as the lighting vertex shader so you can simply copy the source code over. The fragment shader of the light source cube ensures the cube's color remains bright by defining a constant white color on the lamp:

```cpp
#version 330 core
out vec4 FragColor;

void main()
{
    FragColor = vec4(1.0); // set all 4 vector values to 1.0
}
```

When we want to render, we want to render the container object (or possibly many other objects) using the lighting shader we just defined, and when we want to draw the light source we use the light source's shaders. During the Lighting chapters we'll gradually be updating the lighting shaders to slowly achieve more realistic results.

The main purpose of the light source cube is to show where the light comes from. We usually define a light source's position somewhere in the scene, but this is simply a position that has no visual meaning. To show where the light source actually is we render a cube at the same location of the light source. We render this cube with the light source cube shader to make sure the cube always stays white, regardless of the light conditions of the scene.

So let's declare a global `vec3` variable that represents the light source's location in world-space coordinates:

```cpp
glm::vec3 lightPos(1.2f, 1.0f, 2.0f);
```

We then translate the light source cube to the light source's position and scale it down before rendering it:

```cpp
model = glm::mat4(1.0f);
model = glm::translate(model, lightPos);
model = glm::scale(model, glm::vec3(0.2f));
```

The resulting render code for the light source cube should then look something like this:

```cpp
lightCubeShader.use();
// set the model, view and projection matrix uniforms
[...]
// draw the light cube object
glBindVertexArray(lightCubeVAO);
glDrawArrays(GL_TRIANGLES, 0, 36);
```

Injecting all the code fragments at their appropriate locations would then result in a clean OpenGL application properly configured for experimenting with lighting. If everything compiles it should look like this:

![](https://learnopengl.com/img/lighting/colors_scene.png)

Not really much to look at right now, but I'll promise it'll get more interesting in the upcoming chapters.

If you have difficulties finding out where all the code snippets fit together in the application as a whole, check the source code [here](https://learnopengl.com/code_viewer_gh.php?code=src/2.lighting/1.colors/colors.cpp) and carefully work your way through the code/comments.

Now that we have a fair bit of knowledge about colors and created a basic scene for experimenting with lighting we can jump to the [next](https://learnopengl.com/Lighting/Basic-Lighting) chapter where the real magic begins.
