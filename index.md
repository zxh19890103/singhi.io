---
layout: page
title: 记录
---

<blockquote style="font-size: 1.2rem">
<p>
这些内容写出来，完全发自内心，以作反思之用。内容大概分作两类，其一记录，其一技术。夫记录者，记录本人——一个活着的、四肢健全的、容貌无怪异的、思想大体正常的人——的心路历程。前所立“我之世界”一册业已删去，不复维护，而其意仍在。
</p>
<p>
我知生活之非理所当然，事事均需付出；亦非简单轻松，美好自在的时刻总归稀少，生老病死总是要缠绕左右，你我无以改变之！改变自己的想法、认知、态度才是生活得以顺利进展的办法。
</p>
<p>
荣誉、成就、财富是千万人追求的目标。然而如今世道，以人口之繁多、政治之腐朽、传统之毁灭、经济之飞腾、资源之枯竭、欲望之膨胀，欲达此志何其难也。故而简化思想、收缩欲望、窥探内在、发现真理，以求简单渡过一生，若终能成一小心愿，可了然也。
</p>
</blockquote>

<ul class="documents">
  {% for post in site.posts %}
    <li class="documents__item">
      <div class="document{% if post.english %} pure-english{% endif %}">
        <h3>
          <a href="{{ post.url }}" target="_self">
            <time>{{ post.date | date: "%D" }} </time>
            <span>{{ post.title }}</span>
          </a>
        </h3>
        {% if post.short %}
        <p>{{ post.short }}...</p>
        {% endif %}
      </div>
    </li>
  {% endfor %}
</ul>
