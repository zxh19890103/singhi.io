---
layout: page
title: 专栏 - 设计模式
---

<div class="article__title">设计模式 - TypeScript 版本</div>

{% include img.html src="https://zxh1989.oss-cn-qingdao.aliyuncs.com/personal-site/laptop-desk-computer-work-man-working-coffee-people-technology-internet-sitting-corporate-office-professional-business-modern-workstation-label-monitor-brand-product-design-eye-document-644378.jpg" %}

{% for doc in site.patterns %}
  <h2>
    <a href="{{ doc.url }}">
      {{ doc.title }}
    </a>
  </h2>
{% endfor %}
