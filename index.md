---
layout: index
title: 记录
---

<ul class="documents">
  {% for post in site.articles %}
    <li class="documents__item">
      <div class="document{% if post.english %} pure-english{% endif %}">
        <h3>
          <a href="{{ post.url }}" target="_self">
            <span>{{ post.title }}</span>
          </a>
        </h3>
        <p>
        <time class="pure-english">{{ post.date | date: "%m/%d, %Y" }}</time>
        {% if post.short %} <span style="color: #EFEFEF">&bull;</span><span> {{ post.short }}</span><a href="{{ post.url }}" style="position: relative;top: 9px;left: 6px;font-size: 1.4rem;">&dot;&dot;&dot;</a> {% endif %}
        </p>
      </div>
    </li>
  {% endfor %}
</ul>
