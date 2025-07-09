---
layout: index
title: 來，一起學習 OpenGL
---

> 一點一點來，不要急功近利，因為那樣會適得其反，也不要被他人的口水搞亂內心和計畫，好不好？

{% assign posts = site.opengl | sort: 'order' %}

<ul class="documents" style=" list-style-type: digital">
  {% for post in posts %}
    <li
    class="documents__item cat-{{post.category}}"
    style="margin: 2.5rem 0.5rem;">
      <div class="document">
      {% if post.lang == 'en' %}
        <a class="document__link english" href="{{ post.url }}" target="_self">
          <h3 style="margin: 0.3em 0 0.6em 0" {% if post.slug %}id="{{ post.slug }}"{% endif %}>
          Chapter {{ post.order }}. {{ post.title }}
          </h3>
        </a>
        <p class="english" style="white-space: normal;overflow: auto; height: auto; color: #555; font-size: 1em">
        {{ post.excerpt | strip_html }}
        <a class="document__link" style="text-decoration: underline" href="{{ post.url }}" target="_self">
        Read it.
        </a>
        </p>
      {% else %}
      <a class="document__link" href="{{ post.url }}" target="_self">
          <h3 style="margin: 0.3em 0 0.6em 0">{{ post.chapter }}、{{ post.title }}</h3>
        </a>
        <p style="white-space: normal;overflow: auto; height: auto; color: #555; font-size: 1em">
        {{ post.excerpt | strip_html }}
        <a class="document__link" style="text-decoration: underline" href="{{ post.url }}" target="_self">
        閱讀
        </a>
        </p>
      {% endif %}
      </div>
    </li>
  {% endfor %}
</ul>
