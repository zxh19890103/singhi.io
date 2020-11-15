!function(){"use strict";function t(t,e){return t(e={exports:{}},e.exports),e.exports}var n=t(function(e){function n(t){return"function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?e.exports=n=function(t){return typeof t}:e.exports=n=function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},n(t)}e.exports=n}),x=(n.typeof,function(t){var e=n(t);return null!=t&&("object"==e||"function"==e)}),b=window;function E(r,i,t){var a,c,n,u,l,s,f=0,h=!1,d=!1,e=!0,o=!i&&0!==i&&"function"==typeof b.requestAnimationFrame;if("function"!=typeof r)throw new TypeError("Expected a function");function p(t){var e=a,n=c;return a=c=void 0,f=t,u=r.apply(n,e)}function y(t,e){return o?(b.cancelAnimationFrame(l),b.requestAnimationFrame(t)):setTimeout(t,e)}function v(t){var e=t-s;return void 0===s||i<=e||e<0||d&&n<=t-f}function m(){var t,e=Date.now();if(v(e))return g(e);l=y(m,(e=(t=e)-f,t=i-(t-s),d?Math.min(t,n-e):t))}function g(t){return l=void 0,e&&a?p(t):(a=c=void 0,u)}function w(){for(var t=Date.now(),e=v(t),n=arguments.length,r=new Array(n),o=0;o<n;o++)r[o]=arguments[o];if(a=r,c=this,s=t,e){if(void 0===l)return f=e=s,l=y(m,i),h?p(e):u;if(d)return l=y(m,i),p(s)}return void 0===l&&(l=y(m,i)),u}return i=+i||0,x(t)&&(h=!!t.leading,d="maxWait"in t,n=d?Math.max(+t.maxWait||0,i):n,e="trailing"in t?!!t.trailing:e),w.cancel=function(){void 0!==l&&function(t){if(o)return b.cancelAnimationFrame(t);clearTimeout(t)}(l),a=s=c=l=void(f=0)},w.flush=function(){return void 0===l?u:g(Date.now())},w.pending=function(){return void 0!==l},w}var r=function(t){if(Array.isArray(t))return t};var o=function(t,e){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(t)){var n=[],r=!0,o=!1,i=void 0;try{for(var a,c=t[Symbol.iterator]();!(r=(a=c.next()).done)&&(n.push(a.value),!e||n.length!==e);r=!0);}catch(t){o=!0,i=t}finally{try{r||null==c.return||c.return()}finally{if(o)throw i}}return n}};var i=function(t,e){(null==e||e>t.length)&&(e=t.length);for(var n=0,r=new Array(e);n<e;n++)r[n]=t[n];return r};var a=function(t,e){if(t){if("string"==typeof t)return i(t,e);var n=Object.prototype.toString.call(t).slice(8,-1);return"Object"===n&&t.constructor&&(n=t.constructor.name),"Map"===n||"Set"===n?Array.from(t):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?i(t,e):void 0}};var c=function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")};var _=function(t,e){return r(t)||o(t,e)||a(t,e)||c()},S=t(function(t){var e=function(a){var u,t=Object.prototype,l=t.hasOwnProperty,e="function"==typeof Symbol?Symbol:{},r=e.iterator||"@@iterator",n=e.asyncIterator||"@@asyncIterator",o=e.toStringTag||"@@toStringTag";function i(t,e,n){return Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}),t[e]}try{i({},"")}catch(t){i=function(t,e,n){return t[e]=n}}function c(t,e,n,r){var o,i,a,c,e=e&&e.prototype instanceof v?e:v,e=Object.create(e.prototype),r=new S(r||[]);return e._invoke=(o=t,i=n,a=r,c=f,function(t,e){if(c===d)throw new Error("Generator is already running");if(c===p){if("throw"===t)throw e;return C()}for(a.method=t,a.arg=e;;){var n=a.delegate;if(n){var r=function t(e,n){var r=e.iterator[n.method];if(r===u){if(n.delegate=null,"throw"===n.method){if(e.iterator.return&&(n.method="return",n.arg=u,t(e,n),"throw"===n.method))return y;n.method="throw",n.arg=new TypeError("The iterator does not provide a 'throw' method")}return y}r=s(r,e.iterator,n.arg);if("throw"===r.type)return n.method="throw",n.arg=r.arg,n.delegate=null,y;var r=r.arg;if(!r)return n.method="throw",n.arg=new TypeError("iterator result is not an object"),n.delegate=null,y;{if(!r.done)return r;n[e.resultName]=r.value,n.next=e.nextLoc,"return"!==n.method&&(n.method="next",n.arg=u)}n.delegate=null;return y}(n,a);if(r){if(r===y)continue;return r}}if("next"===a.method)a.sent=a._sent=a.arg;else if("throw"===a.method){if(c===f)throw c=p,a.arg;a.dispatchException(a.arg)}else"return"===a.method&&a.abrupt("return",a.arg);c=d;r=s(o,i,a);if("normal"===r.type){if(c=a.done?p:h,r.arg!==y)return{value:r.arg,done:a.done}}else"throw"===r.type&&(c=p,a.method="throw",a.arg=r.arg)}}),e}function s(t,e,n){try{return{type:"normal",arg:t.call(e,n)}}catch(t){return{type:"throw",arg:t}}}a.wrap=c;var f="suspendedStart",h="suspendedYield",d="executing",p="completed",y={};function v(){}function m(){}function g(){}var w={};w[r]=function(){return this};e=Object.getPrototypeOf,e=e&&e(e(k([])));e&&e!==t&&l.call(e,r)&&(w=e);var x=g.prototype=v.prototype=Object.create(w);function b(t){["next","throw","return"].forEach(function(e){i(t,e,function(t){return this._invoke(e,t)})})}function L(a,c){var e;this._invoke=function(n,r){function t(){return new c(function(t,e){!function e(t,n,r,o){t=s(a[t],a,n);if("throw"!==t.type){var i=t.arg,n=i.value;return n&&"object"==typeof n&&l.call(n,"__await")?c.resolve(n.__await).then(function(t){e("next",t,r,o)},function(t){e("throw",t,r,o)}):c.resolve(n).then(function(t){i.value=t,r(i)},function(t){return e("throw",t,r,o)})}o(t.arg)}(n,r,t,e)})}return e=e?e.then(t,t):t()}}function E(t){var e={tryLoc:t[0]};1 in t&&(e.catchLoc=t[1]),2 in t&&(e.finallyLoc=t[2],e.afterLoc=t[3]),this.tryEntries.push(e)}function _(t){var e=t.completion||{};e.type="normal",delete e.arg,t.completion=e}function S(t){this.tryEntries=[{tryLoc:"root"}],t.forEach(E,this),this.reset(!0)}function k(e){if(e){var t=e[r];if(t)return t.call(e);if("function"==typeof e.next)return e;if(!isNaN(e.length)){var n=-1,t=function t(){for(;++n<e.length;)if(l.call(e,n))return t.value=e[n],t.done=!1,t;return t.value=u,t.done=!0,t};return t.next=t}}return{next:C}}function C(){return{value:u,done:!0}}return((m.prototype=x.constructor=g).constructor=m).displayName=i(g,o,"GeneratorFunction"),a.isGeneratorFunction=function(t){t="function"==typeof t&&t.constructor;return!!t&&(t===m||"GeneratorFunction"===(t.displayName||t.name))},a.mark=function(t){return Object.setPrototypeOf?Object.setPrototypeOf(t,g):(t.__proto__=g,i(t,o,"GeneratorFunction")),t.prototype=Object.create(x),t},a.awrap=function(t){return{__await:t}},b(L.prototype),L.prototype[n]=function(){return this},a.AsyncIterator=L,a.async=function(t,e,n,r,o){void 0===o&&(o=Promise);var i=new L(c(t,e,n,r),o);return a.isGeneratorFunction(e)?i:i.next().then(function(t){return t.done?t.value:i.next()})},b(x),i(x,o,"Generator"),x[r]=function(){return this},x.toString=function(){return"[object Generator]"},a.keys=function(n){var t,r=[];for(t in n)r.push(t);return r.reverse(),function t(){for(;r.length;){var e=r.pop();if(e in n)return t.value=e,t.done=!1,t}return t.done=!0,t}},a.values=k,S.prototype={constructor:S,reset:function(t){if(this.prev=0,this.next=0,this.sent=this._sent=u,this.done=!1,this.delegate=null,this.method="next",this.arg=u,this.tryEntries.forEach(_),!t)for(var e in this)"t"===e.charAt(0)&&l.call(this,e)&&!isNaN(+e.slice(1))&&(this[e]=u)},stop:function(){this.done=!0;var t=this.tryEntries[0].completion;if("throw"===t.type)throw t.arg;return this.rval},dispatchException:function(n){if(this.done)throw n;var r=this;function t(t,e){return i.type="throw",i.arg=n,r.next=t,e&&(r.method="next",r.arg=u),!!e}for(var e=this.tryEntries.length-1;0<=e;--e){var o=this.tryEntries[e],i=o.completion;if("root"===o.tryLoc)return t("end");if(o.tryLoc<=this.prev){var a=l.call(o,"catchLoc"),c=l.call(o,"finallyLoc");if(a&&c){if(this.prev<o.catchLoc)return t(o.catchLoc,!0);if(this.prev<o.finallyLoc)return t(o.finallyLoc)}else if(a){if(this.prev<o.catchLoc)return t(o.catchLoc,!0)}else{if(!c)throw new Error("try statement without catch or finally");if(this.prev<o.finallyLoc)return t(o.finallyLoc)}}}},abrupt:function(t,e){for(var n=this.tryEntries.length-1;0<=n;--n){var r=this.tryEntries[n];if(r.tryLoc<=this.prev&&l.call(r,"finallyLoc")&&this.prev<r.finallyLoc){var o=r;break}}o&&("break"===t||"continue"===t)&&o.tryLoc<=e&&e<=o.finallyLoc&&(o=null);var i=o?o.completion:{};return i.type=t,i.arg=e,o?(this.method="next",this.next=o.finallyLoc,y):this.complete(i)},complete:function(t,e){if("throw"===t.type)throw t.arg;return"break"===t.type||"continue"===t.type?this.next=t.arg:"return"===t.type?(this.rval=this.arg=t.arg,this.method="return",this.next="end"):"normal"===t.type&&e&&(this.next=e),y},finish:function(t){for(var e=this.tryEntries.length-1;0<=e;--e){var n=this.tryEntries[e];if(n.finallyLoc===t)return this.complete(n.completion,n.afterLoc),_(n),y}},catch:function(t){for(var e=this.tryEntries.length-1;0<=e;--e){var n=this.tryEntries[e];if(n.tryLoc===t){var r,o=n.completion;return"throw"===o.type&&(r=o.arg,_(n)),r}}throw new Error("illegal catch attempt")},delegateYield:function(t,e,n){return this.delegate={iterator:k(t),resultName:e,nextLoc:n},"next"===this.method&&(this.arg=u),y}},a}(t.exports);try{regeneratorRuntime=e}catch(t){Function("r","regeneratorRuntime = r")(e)}});function u(t,e,n,r,o,i,a){try{var c=t[i](a),u=c.value}catch(t){return void n(t)}c.done?e(u):Promise.resolve(u).then(r,o)}var p=function(c){return function(){var t=this,a=arguments;return new Promise(function(e,n){var r=c.apply(t,a);function o(t){u(r,e,n,o,i,"next",t)}function i(t){u(r,e,n,o,i,"throw",t)}o(void 0)})}};function k(t,e){var n;if("undefined"==typeof Symbol||null==t[Symbol.iterator]){if(Array.isArray(t)||(n=function(t,e){if(!t)return;if("string"==typeof t)return l(t,e);var n=Object.prototype.toString.call(t).slice(8,-1);"Object"===n&&t.constructor&&(n=t.constructor.name);if("Map"===n||"Set"===n)return Array.from(t);if("Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return l(t,e)}(t))||e&&t&&"number"==typeof t.length){n&&(t=n);var r=0,e=function(){};return{s:e,n:function(){return r>=t.length?{done:!0}:{done:!1,value:t[r++]}},e:function(t){throw t},f:e}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var o,i=!0,a=!1;return{s:function(){n=t[Symbol.iterator]()},n:function(){var t=n.next();return i=t.done,t},e:function(t){a=!0,o=t},f:function(){try{i||null==n.return||n.return()}finally{if(a)throw o}}}}function l(t,e){(null==e||e>t.length)&&(e=t.length);for(var n=0,r=new Array(e);n<e;n++)r[n]=t[n];return r}function y(){for(var t,e=arguments.length,n=new Array(e),r=0;r<e;r++)n[r]=arguments[r];(t=console).log.apply(t,["LOG:"].concat(n))}var e=function(){var t=p(S.mark(function t(){var r,o,i,a,b,c,u,e,L,l,s,f,h,d,n;return S.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:if(n=function(){var y=r.map(function(t){var e=t.title,t=t.src;return{title:e,src:"".concat(t,"?x-oss-process=style/s72")}}),t=document.querySelector("#ref_adImgs"),e=t.clientWidth-26,n=t.clientHeight,v=e*devicePixelRatio,m=n*devicePixelRatio,g=document.createElement("canvas"),w=g.getContext("2d");g.width=v,g.height=m,g.style="position: absolute; top: 0; left: 0; width: ".concat(e,"px; height: ").concat(n,"px;"),t.appendChild(g),i.querySelector(".ad__index").addEventListener("click",function(){g.style.zIndex=1-g.style.zIndex});function x(t,e,n,r,o){return o*(0^e/r)+(0^t/n)}(function(){var t=p(S.mark(function t(){var o,i,a,c,u,l,s,f,h,d,p;return S.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:e=r=n=e=void 0,e=y.length,n=Math.ceil(e/2),r=Math.ceil(m/2),e=Math.ceil(v/n),d=[n,2,e,r,e/devicePixelRatio,r/devicePixelRatio],p=_(d,6),o=p[0],p[1],i=p[2],a=p[3],c=p[4],u=p[5],g.onclick=function(t){L.i=x(t.offsetX,t.offsetY,c,u,o),g.style.zIndex=0,b()},l=-1,g.onmousemove=E(function(t){t=x(t.offsetX,t.offsetY,c,u,o);t!==l&&void 0!==y[t]&&(g.title=y[t].title,l=t)},500),f=s=0,h=new Image(i,a),d=k(y),t.prev=8,d.s();case 10:if((p=d.n()).done){t.next=21;break}return p=p.value,h.src=p.src,p=new Promise(function(t,e){h.onload=t,h.onerror=e}),t.next=16,p;case 16:v<=s&&(s=0,f+=a),w.drawImage(h,s,f,i,a),s+=i;case 19:t.next=10;break;case 21:t.next=26;break;case 23:t.prev=23,t.t0=t.catch(8),d.e(t.t0);case 26:return t.prev=26,d.f(),t.finish(26);case 29:case"end":return t.stop()}var e,n,r},t,null,[[8,23,26,29]])}));return function(){return t.apply(this,arguments)}})()()},d=function(t){if(t<=0)return"slideleft-in";var e="slideleft-in-withHeightDiff_".concat(t);if(e in L.aniClasses)return e;for(var n=document.createElement("style"),r=Math.random().toString(36).substr(2),o={top:0,left:0,opacity:1,toStyle:function(){return"{\n          top: ".concat(this.top,"px;\n          left: ").concat(this.left,"px;\n          opacity: ").concat(this.opacity,";\n        }\n        ").replace(/[\n\t\s]/g,"")}},i=[],a=s;a<100;a+=l)i.push("".concat(a,"% ").concat(o.toStyle())),0===o.top?o.top=-t:o.top=0;return o.opacity=0,i.push("100% ".concat(o.toStyle())),n.innerHTML="\n    @keyframes keyframes_".concat(r," {\n      ").concat(i.join("\n"),"\n    }\n    .").concat(e," {\n      top: 0;\n      left: 100%;\n      animation:\n        keyframes_").concat(r," ").concat(.3*t,"s linear .5s 1 alternate forwards;\n      -webkit-animation:\n        keyframes_").concat(r," ").concat(.3*t,"s linear .5s 1 alternate forwards;\n    }\n    ").replace(/[\n\t]/g,""),document.head.appendChild(n),L.aniClasses[e]=1,e},h=function(e){return new Promise(function(n,t){var r=new Image;r.onload=function(){r.onload=null;var t=r.naturalHeight,e=r.naturalWidth,t=Math.floor(t*c/e),e=d(t-u),t=document.createElement("div");t.className="ad__img",t.classList.add(e),t.appendChild(r),n(t)},r.onerror=t,r.src=e})},b=function(){L.requestNext=1,L.cur&&L.cur.classList.add("interrupt")},window.fetch){t.next=6;break}return t.abrupt("return",y("Your broswer doesn't support this script."));case 6:return t.next=8,fetch("https://plants2019.oss-cn-shenzhen.aliyuncs.com/personalwebsite.plant/meta").then(function(t){return t.json()}).then(function(t){var e=t.pictures,o=t.key;return e.map(function(t){var e,n,r=t.text;return!r&&t.loc&&t.loc.t&&(n=(e=t.loc.t).streetNumber?e.streetNumber.street:"",r=e.province+e.city+e.district+e.township+n),r=r||"No words",{title:r+=" • "+new Date(t.date).toLocaleDateString(),src:"https://plants2019.oss-cn-shenzhen.aliyuncs.com/".concat(o,".plant/").concat(t.key,".jpg")}})});case 8:r=t.sent,o=r.length,i=document.querySelector("#ref_adImgs"),(a=document.createElement("div")).className="ad__img-title",a.textContent="",a.addEventListener("click",function(){var t=L.i-1,t=r[t].detail;t&&window.open(t,"_blank")}),i.addEventListener("click",function(t){t.stopPropagation(),t.target instanceof Image&&(t=L.i-1,t=r[t].src,showPhotoModal(t))}),i.appendChild(a),i.querySelector(".ad__next").addEventListener("click",b),c=i.clientWidth,u=i.clientHeight,e=Number(localStorage.getItem("CURRENT_AD_INDEX")),L={i:e,requestNext:0,cur:null,aniClasses:{}},l=33,s=5,f=function(){var t=p(S.mark(function t(){var e,n;return S.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return L.i>=o&&(L.i=0),e=L.i,y("iter",e),localStorage.setItem("CURRENT_AD_INDEX",e),a.textContent="loading...",a.style.color="#456",a.classList.add("ad__img-title--loading"),n=r[e].src,t.next=10,h(n);case 10:(n=t.sent).addEventListener("animationend",function(t){var e=t.animationName;y("end",e),L.cur=null,i.removeChild(t.currentTarget),f()}),n.addEventListener("mouseenter",function(t){t.currentTarget.classList.add("paused")}),n.addEventListener("mouseleave",function(t){t.currentTarget.classList.remove("paused")}),i.appendChild(n),a.classList.remove("ad__img-title--loading"),a.textContent=r[e].title,a.style.color=r[e].tcolor||"#fff",L.i+=1,L.cur=n;case 20:case"end":return t.stop()}},t)}));return function(){return t.apply(this,arguments)}}(),n(),f();case 26:case"end":return t.stop()}},t)}));return function(){return t.apply(this,arguments)}}(),s=-1<location.host.indexOf("china"),f=document.createElement("a");f.style="\n  position: fixed;\n  top: 0;\n  left: 0;\n  display: block;\n  width: 4em;\n  text-align: center;\n  font-size: 13px;\n  color: ".concat(s?"#035C97":"#E60118",";\n  text-decoration: underline;\n"),f.textContent=s?"境外站":"大陆站",f.href=(s?"https://zhangxinghai.cn":"https://china.zhangxinghai.cn")+location.pathname,document.body.appendChild(f),window.showPhotoModal=function(t){var e=document.createElement("div"),n=0;function r(){document.body.removeChild(e),document.querySelector("#page").classList.remove("blur"),window.removeEventListener("resize",a)}e.className="photo-modal",e.addEventListener("click",function(){l.style="width: 0; height: 0; opacity: .5;",n=1});var o,u=document.createElement("div");u.className="photo-modal__content",u.innerHTML="loading...",e.appendChild(u),e.appendChild(((o=document.createElement("a")).href="javascript:void(0);",o.target="_self",o.textContent="关闭",o.onclick=r,o.className="photo-modal__close",o)),document.body.appendChild(e),document.querySelector("#page").classList.add("blur");var l=new Image;function i(){var t=u.clientWidth-20-12,e=u.clientHeight-20-12,n=t*f/e>>0,r=l.naturalWidth,o=l.naturalHeight,i=r*f/o>>0,a=0,c=0;r<=t?o<=e?(a=r,c=o):a=s(i*(c=e)/f):!(o<=e)&&i<n?a=s(i*(c=e)/f):c=s((a=t)*f/i),l.style="width: ".concat(a,"px; height: ").concat(c,"px;")}l.style="width: 0; height: 0;";var s=Math.round,f=1024,a=E(i,300);window.addEventListener("resize",a),l.addEventListener("transitionend",function(t){n&&(r(),n=0)}),l.onload=function(){u.innerHTML="",u.appendChild(l),i()},l.src=t},e()}();
