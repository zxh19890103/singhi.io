---
layout: index
title: 安全验证
---

请输入我的手机号码：

<form id="phone" action="/privates" onsubmit="doSecurityCheck(event)">
  <input style="border: none; outline: none; border-bottom: 1px solid #888;">
  <input type="submit" value="提交">
</form>

<script>
  function doSecurityCheck(e) {
    const input = e.target[0] || e.target.querySelector('input');
    const userInput = input.value;
    if (userInput !== '18742538743') {
      e.preventDefault();
      alert('Wrong!');
      return false;
    } else {
      return true;
    }
  }
</script>
