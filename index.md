---
layout: index
title: Blog for Tech
---

> 本就一個程序員出身，你叫我不寫代碼，去搞什麼流量、談判、間諜、燒烤、搞笑怪、銷售？

{% assign tutorials = site.posts | where_exp: "post", "post.category == 'tech'" %}

<ul class="documents" id="DocumentsIndex">
  {% for post in tutorials %}
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

