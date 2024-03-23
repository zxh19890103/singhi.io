---
layout: page
title: 分类
fullwidth: 1
---

<!-- make it grouped by year! -->
<div style="display: flex;">
{% for category in site.categories %}
<div style="flex:1">
  <h2 style="text-transform: uppercase;">
    <img style="width: 1em; height: 1em;border: 1px dotted var(--text-color-1); border-radius: 50%;" src="/assets/icons/{{category[0]}}.svg" />
    <span>{{ category[0] }}</span>
  </h2>
  <ul>
    {% for post in category[1] %}
      <li><a href="{{ post.url }}">{{post.date | date: "%m/%d, %Y" }} &bull; {{ post.title }}</a></li>
    {% endfor %}
  </ul>
</div>
{% endfor %}
</div>
