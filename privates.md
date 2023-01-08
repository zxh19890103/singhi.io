---
layout: index
title: 私人记录
---

<ul class="documents">
  {% for post in site.articles | sort_natural: "date" %}
    <li class="documents__item">
      <div class="document">
        <h3>
          <a href="{{ post.url }}" target="_self">
            <span>{{ post.title }}</span>
          </a>
        </h3>
        <p>
        {{ post.date | date: "%Y%m%d" }}
        {% if post.short %} <span>&bull;</span><span> {{ post.short }}</span><a href="{{ post.url }}" class="documents__item-3dots">&dot;&dot;&dot;</a> {% endif %}
        </p>
      </div>
    </li>
  {% endfor %}
</ul>
