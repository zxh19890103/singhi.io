---
layout: index
title: 记录
---

<ul class="documents">
  {% for post in site.posts %}
    <li class="documents__item">
      <div class="document{% if post.english %} pure-english{% endif %}">
        <h3>
          <a href="{{ post.url }}" target="_self">
            <time>{{ post.date | date: "%D" }} </time>
            <span>{{ post.title }}</span>
          </a>
        </h3>
        {% if post.short %}
        <p>{{ post.short }}...</p>
        {% endif %}
      </div>
    </li>
  {% endfor %}
</ul>
