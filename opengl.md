---
layout: index
title: 专栏 -  学习 OpenGL
---

{% assign $i = 1 %}

<ul class="documents" style=" list-style-type: digital">
  {% for post in site.opengl %}
    <li class="documents__item cat-{{post.category}}">
      <div class="document {% if post.english %}english{% endif %}">
        <a class="document__link" href="{{ post.url }}" target="_self">
          <h3>{{$i}}. {{ post.title }}</h3>
        </a>
      </div>
    </li>
    {% assign $i = $i | plus: 1 %}
  {% endfor %}
</ul>
