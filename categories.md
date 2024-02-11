---
layout: page
title: 分类
---

{% for category in site.categories %}
  <h3 style="text-transform: uppercase;">{{ category[0] }}</h3>
  <ul>
    {% for post in category[1] %}
      <li><a href="{{ post.url }}">{{post.date | date: "%m/%d, %Y" }} &bull; {{ post.title }}</a></li>
    {% endfor %}
  </ul>
{% endfor %}