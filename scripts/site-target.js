const isChinaSite = location.host.indexOf('china') > -1
const a = document.createElement('a')
a.className = "hidden-if-mobi";
a.style = `
  position: fixed;
  top: 12px;
  right: 1rem;
  text-decoration: none;
`
a.innerHTML = isChinaSite ? "<i class='iconfont icon-china'></i>" : "<i class='iconfont icon-global'></i>"
a.href = (isChinaSite ? "https://zhangxinghai.cn" : "https://china.zhangxinghai.cn") + location.pathname
document.body.appendChild(a)
