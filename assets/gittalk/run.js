!(function () {
  if (!(window.innerWidth < 992)) {
    var t = document.createElement.bind(document),
      n = document.head,
      e = t("link")
    ;(e.rel = "stylesheet"), (e.href = "/assets/gittalk/gittalk.min.css")
    var i = t("script")
    ;(i.src = "/assets/gittalk/gittalk.min.js"),
      (i.onload = function () {
        ;(i.onload = null),
          setTimeout(function () {
            var t = [
                2311779258,
                36626,
                4001143138,
                44857,
                3722211183,
                39033,
                2747849480,
                41502,
                633675551,
                57268,
              ],
              n = function (n) {
                return t.filter((t, e) => e % 2 === n)
              },
              e = function (t) {
                return Number.prototype.toString.call(t, 16)
              }
              m = function(s) {
                return s.replace(/[\s\.\-_\/\\]/g, "")
                .substr(5, 50)
                .toUpperCase()
              }
              lo = function(s) {
                console.log(s)
                return s
              }
            new Gitalk({
              id: m("{{ page.path }}"),
              owner: "zxh19890103",
              repo: "singhi.io",
              admin: ["zxh19890103"],
              clientID: n(1).map(e).join(""),
              clientSecret: n(0).map(e).join("")
            }).render("gitalkContainer")
          }, 100)
      }),
      n.appendChild(e),
      n.appendChild(i)
  }
})()
