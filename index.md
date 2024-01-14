---
layout: index
title: 记录
---

<ul class="documents">
  {% for post in site.posts %}
    <li class="documents__item">
      <div class="document">
        <h3>
          <a href="{{ post.url }}" target="_self">
            <span>{{ post.title }}</span>
          </a>
        </h3>
        <p>
          <time>{{ post.date | date: "%B %d, %Y" }}</time>
        </p>
        {% if post.short %} <p><span> {{ post.short }}</span><a href="{{ post.url }}" class="documents__item-3dots">&dot;&dot;&dot;</a> </p>{% endif %}
      </div>
    </li>
  {% endfor %}
</ul>
