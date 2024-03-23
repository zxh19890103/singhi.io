---
layout: index
title: 专栏 - 设计模式
---

<ul class="documents">
{% for doc in site.patterns %}
  <li class="documents__item">
    <div class="document">
      <h3>
        <a href="{{ doc.url }}" >
          {{ doc.title }}
        </a>
      </h3>
      {% if doc.short %}
      <p class="Aspergit">{{ doc.short }}...</p>
      {% endif %}
    </div>
  </li>
{% endfor %}
</ul>
