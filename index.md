---
layout: page
title: 博客
---

<ul class="documents">
  {% for post in site.posts %}
    <li class="documents__item">
      <div class="document">
        <h3><a href="{{ post.url }}">{{ post.title }}</a></h3>
        <p>
        <time>{{ post.date | date: "%d,%b %y" }} <span style="color: #aaa;">•</span></time>
        {% if post.short %}
          {{ post.short }}...
        {% else %}
          {{ post.excerpt | strip_html | truncate: 140 }}
        {% endif %}
        </p>
      </div>
    </li>
  {% endfor %}
</ul>
