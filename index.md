---
layout: page
---

<ul class="documents">
  {% for post in site.posts %}
    <li class="documents__item">
      <div class="document">
        <h3><a href="{{ post.url }}">{{ post.title }}</a></h3>
        <p>
        <time>{{ post.date | date: "%d,%b" }} • </time>
        {{ post.excerpt | strip_html | truncate: 140 }}
        </p>
      </div>
    </li>
  {% endfor %}
</ul>
