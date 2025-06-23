---
layout: index
title: Blog for Life
---

> 這裡紀錄了我的一些亂七八糟的心裡話，沒辦法，拙於口舌，只好操之以墨；實非騷者，純胡言亂語！

{% assign articles = site.posts | where_exp: "post", "post.category != 'tech'" %}

<ul class="documents" id="DocumentsIndex">
  {% for post in articles %}
    <li class="documents__item cat-{{post.category}}">
      <div class="document {% if post.english %}english{% endif %}">
        <a class="document__link" href="{{ post.url }}" target="_self">
          <h3>
            {{ post.title }}
          </h3>
          <p>
            <time>{{ post.date | date: "%B %d, %Y" }}</time>
          </p>
          {% if post.short %}
          <p><span> {{ post.short }}</span><span class="documents__item-3dots">&dot;&dot;&dot;</span></p>
          {% endif %}
        </a>
      </div>
    </li>
  {% endfor %}
</ul>
