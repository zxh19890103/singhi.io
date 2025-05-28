---
layout: index
title: Blog
---

<ul class="documents" id="DocumentsIndex">
  {% for post in site.posts %}
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

<script>
  {
    const url = new URL(window.location.href);
    const filterValue = url.searchParams.get('filter');
    const documentsIndex = document.querySelector('#DocumentsIndex');
    if (filterValue === 'life') {
      documentsIndex.classList.add('hide-tech');
      } else {
      documentsIndex.classList.add('hide-journal');
    }
  }
</script>
