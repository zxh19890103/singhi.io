---
layout: page
title: 博客
---

<ul class="documents">
  {% for post in site.posts %}
    <li class="documents__item">
      <div class="document">
        <h3>
          <a href="{{ post.url }}" target="_blank">
            <time>{{ post.date | date: "%D" }} </time>
            {{ post.title }}
          </a>
        </h3>
        <p>{{ post.short }}...</p>
      </div>
    </li>
  {% endfor %}
</ul>
