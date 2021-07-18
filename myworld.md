---
layout: page
title: 我的世界（认识自己）
---

<blockquote>
  <p>
    The unexamined life is not worth living.
       <em style="float: right;"> -- by Socrates</em>
  </p>
</blockquote>

<ul class="documents">
{% for doc in site.myworld %}
  <li class="documents__item">
    <div class="document">
      <h3>
        <a href="{{ doc.url }}" target="_blank">
          <time>{{ doc.date | date: "%D" }} </time>
          {{ doc.title }}
        </a>
      </h3>
      <p>{{ doc.short }}...</p>
    </div>
  </li>
{% endfor %}
</ul>
