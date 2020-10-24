---
layout: page
title: 我的世界
---

<div class="article__title">我的世界（认识自己）</div>

<blockquote>
  <p>
    The unexamined life is not worth living.
  </p>
  <p style="text-align: right;">
    -- Socrates
  </p>
</blockquote>

<ul class="documents">
{% for doc in site.myworld %}
  <li class="documents__item">
    <div class="document">
      <h3>
        <a href="{{ doc.url }}">
          {{ doc.date | date: "%b %d" }} - {{ doc.title }}
        </a>
      </h3>
      <p>{{ doc.short }}...</p>
    </div>
  </li>
{% endfor %}
</ul>
