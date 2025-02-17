---
layout: index
title: 专栏 -  学习 OpenGL
---

<ul class="documents">
  {% for post in site.opengl %}
    <li class="documents__item cat-{{post.category}}">
      <div class="document {% if post.english %}english{% endif %}">
        <a class="document__link" href="{{ post.url }}" target="_self">
          <h3>
            {{ post.title }}
          </h3>
          <p>
            <time>{{ post.date | date: "%m/%d, %Y" }}</time>
          </p>
          {% if post.short %}
          <p><span> {{ post.short }}</span><span class="documents__item-3dots">&dot;&dot;&dot;</span></p>
          {% endif %}
        </a>
      </div>
    </li>
  {% endfor %}
</ul>
