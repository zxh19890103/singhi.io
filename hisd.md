---
layout: index
title: 歷史故事
---

> 歷史故事，也是事故，收集在此，供好者閱讀！

<ul class="documents" style=" list-style-type: digital">
  {% for post in site.historydefined %}
    <li class="documents__item cat-{{post.category}}">
      <div class="document">
        <a class="document__link" href="{{ post.url }}" target="_self">
          <h3>{{ post.title }}</h3>
        </a>
      </div>
    </li>
  {% endfor %}
</ul>
