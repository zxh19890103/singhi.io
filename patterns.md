---
layout: page
title: 专栏 - 设计模式
---

<ul class="documents cardstyle">
{% for doc in site.patterns %}
  <li class="documents__item">
    <div class="document">
      <h3>
        <a href="{{ doc.url }}" target="_blank">
          {{ doc.title }}
        </a>
      </h3>
      <p class="Aspergit">{{ doc.short }}...</p>    
    </div>
  </li>
{% endfor %}
</ul>
