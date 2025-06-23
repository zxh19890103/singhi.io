---
layout: index
title: 学习 OpenGL
---

> 一點一點來，不要急功近利，因為那樣會適得其反，也不要被他人的口水搞亂內心和計畫，好不好？

<ul class="documents" style=" list-style-type: digital">
  {% for post in site.opengl %}
    <li class="documents__item cat-{{post.category}}" style="margin: 1.5rem 0.5rem;">
      <div class="document {% if post.english %}english{% endif %}">
        <a class="document__link" href="{{ post.url }}" target="_self">
          <h3>{{ post.chapter }}、{{ post.title }}</h3>
        </a>
      </div>
    </li>
  {% endfor %}
</ul>
