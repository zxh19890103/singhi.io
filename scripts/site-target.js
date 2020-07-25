const isChinaSite = location.host.indexOf('china') > -1
const a = document.createElement('a')
a.style = `
  position: fixed;
  top: 0;
  left: 0;
  display: block;
  width: 4em;
  text-align: center;
  font-size: 13px;
  color: ${isChinaSite ? "#035C97" : "#E60118"};
  text-decoration: underline;
`
a.textContent = isChinaSite ? "境外站" : "大陆站"
a.href = (isChinaSite ? "https://zhangxinghai.cn" : "https://china.zhangxinghai.cn") + location.pathname
document.body.appendChild(a)
