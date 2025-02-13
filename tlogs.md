---
layout: book
title: Jouney
---

<ul>
  {% for jlog in  site.tlogs %}
    <li>
      <div>
        <h3>
          <a href="{{ jlog.url }}" target="_self">
            <span>{{ jlog.title }}</span>
          </a>
        </h3>
        <p>
        {{jlog.short}}
        </p>
      </div>
    </li>
  {% endfor %}
</ul>
