---
layout: index
title: 歷史故事
---

> 歷史故事，也是事故，收集在此，供好者閱讀！

<ul class="documents" style=" list-style-type: digital">
  {% for post in site.historydefined %}
    <li class="documents__item cat-{{post.category}}">
      <div class="document {% if post.english %}english{% endif %}">
        <a class="document__link" href="{{ post.url }}" target="_self">
          <h3 style="margin: 0.3em 0 0.6em 0">
          {%if post.local%}
          <span style="color: #ef1dfd">[local]</span>
          {%endif%}
          {{ post.title }}
          </h3>
        </a>
        <p style="white-space: normal;overflow: auto; height: auto; color: #555; font-size: 1em">
        {{ post.excerpt | strip_html }}
        <a class="document__link" style="text-decoration: underline" href="{{ post.url }}" target="_self">
        READ It!
        </a>
        </p>
      </div>
    </li>
  {% endfor %}
</ul>
