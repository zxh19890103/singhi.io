---
layout: bookdetail
chapter: "#1"
title: Introduction
category: tech
src: "https://learnopengl.com/Introduction"
date: 2025-06-30
math: false
book: opengl
image: "https://learnopengl.com/img/getting-started/vectors.png"
order: 1
lang: en
glcate: Introduction
gltopic: ""
permalink: /opengl/en/Introduction/
---

Since you came here you probably want to learn the inner workings of computer graphics and do all the stuff the cool kids do by yourself. Doing things by yourself is extremely fun and resourceful and gives you a great understanding of graphics programming. However, there are a few items that need to be taken into consideration before starting your journey.

## Prerequisites

Since OpenGL is a graphics API and not a platform of its own, it requires a language to operate in and the language of choice is C++. Therefore a decent knowledge of the C++ programming language is required for these chapters. However, I will try to explain most of the concepts used, including advanced C++ topics where required so it is not required to be an expert in C++, but you should be able to write more than just a **'Hello World'** program. If you don't have much experience with C++ I can recommend the free tutorials at [www.learncpp.com](http://www.learncpp.com/).

Also, we will be using some math (linear algebra, geometry, and trigonometry) along the way and I will try to explain all the required concepts of the math required. However, I'm not a mathematician by heart so even though my explanations may be easy to understand, they will most likely be incomplete. So where necessary I will provide pointers to good resources that explain the material in a more complete fashion. Don't be scared about the mathematical knowledge required before starting your journey into OpenGL; almost all the concepts can be understood with a basic mathematical background and I will try to keep the mathematics to a minimum where possible. Most of the functionality doesn't even require you to understand all the math as long as you know how to use it.

## Structure

LearnOpenGL is broken down into a number of general sections. Each section contains several chapters that each explain different concepts in large detail. Each of the chapters can be found at the menu to your left. The concepts are taught in a linear fashion (so it is advised to start from the top to the bottom, unless otherwise instructed) where each chapter explains the background theory and the practical aspects.

To make the concepts easier to follow, and give them some added structure, the book contains boxes, code blocks, color hints and function references.

### Boxes

{% include box.html color="green" content="
Green boxes encompasses some notes or useful features/hints about OpenGL or the subject at hand.
" %}

{% include box.html color="red" content="
Red boxes will contain warnings or other features you have to be extra careful with.
" %}

### Code

You will find plenty of small pieces of code in the website that are located in dark-gray boxes with syntax-highlighted code as you can see below:

```cpp
// This box contains code
```

Since these provide only snippets of code, wherever necessary I will provide a link to the entire source code required for a given subject.

### Color hints (applied later on)

Some words are displayed with a different color to make it extra clear these words portray a special meaning:

- <span style="color: green">Definition</span>: green words specify a definition i.e. an important aspect/name of something you're likely to hear more often.
- <span style="color: red">Program structure</span>: red words specify function names or class names.
- <span style="color: blue">Variables</span>: blue words specify variables including all OpenGL constants.

### OpenGL Function references (ignored)

A particularly well appreciated feature of LearnOpenGL is the ability to review most of OpenGL's functions wherever they show up in the content. Whenever a function is found in the content that is documented at the website, the function will show up with a slightly noticeable underline. You can hover the mouse over the function and after a small interval, a pop-up window will show relevant information about this function including a nice overview of what the function actually does. Hover your mouse over `glEnable` to see it in action.

Now that you got a bit of a feel of the structure of the site, hop over to the Getting Started section to start your journey in OpenGL!
