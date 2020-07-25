const isChinaSite = location.host.indexOf('china') > -1
const a = document.createElement('a')
a.style = `
  position: fixed;
  top: 0;
  left: 0;
  display: block;
  width: 4em;
  height: 1.4em;
  line-height: 1.4em;
  text-align: center;
  font-size: 14px;
  color: #FFF;
  background-color: ${isChinaSite ? "#035C97" : "#E60118"}
`
a.textContent = isChinaSite ? "境外站" : "大陆站"
document.body.appendChild(a)