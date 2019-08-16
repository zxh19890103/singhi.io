- [About](/pages/about.md)
- [Javascript](/pages/javascript)
	- [How Closure Works](/pages/javascript/how-closure-works.md)
	- [Index](/pages/javascript/index.md)
- [Tech](/pages/tech)
	- [Index](/pages/tech/index.md)
	- [What Is Mac](/pages/tech/what-is-mac.md)


## categories

{% for category in site.categories %}
  <h3>{{ category[0] }}</h3>
  <ul>
    {% for post in category[1] %}
      <li><a href="{{ post.url }}">{{ post.title }}</a></li>
    {% endfor %}
  </ul>
{% endfor %}

## my posts

<ul>
  {% for post in site.posts %}
    <li>
      <a href="{{ post.url }}">{{ post.title }}</a>
    </li>
  {% endfor %}
</ul>