!function(){"use strict";function t(t,e){return t(e={exports:{}},e.exports),e.exports}var n=t(function(e){function n(t){return"function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?e.exports=n=function(t){return typeof t}:e.exports=n=function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},n(t)}e.exports=n}),x=(n.typeof,function(t){var e=n(t);return null!=t&&("object"==e||"function"==e)}),L=window;function c(r,a,t){var c,u,o,s,l,f,h=0,d=!1,p=!1,e=!0,n=!a&&0!==a&&"function"==typeof L.requestAnimationFrame;if("function"!=typeof r)throw new TypeError("Expected a function");function m(t){var e=c,n=u;return c=u=void 0,h=t,s=r.apply(n,e)}function v(t,e){return n?(L.cancelAnimationFrame(l),L.requestAnimationFrame(t)):setTimeout(t,e)}function y(t){var e=t-f;return void 0===f||a<=e||e<0||p&&o<=t-h}function g(){var t,e,n,r=Date.now();if(y(r))return i(r);l=v(g,(e=(t=r)-h,n=a-(t-f),p?Math.min(n,o-e):n))}function i(t){return l=void 0,e&&c?m(t):(c=u=void 0,s)}function w(){for(var t,e=Date.now(),n=y(e),r=arguments.length,o=new Array(r),i=0;i<r;i++)o[i]=arguments[i];if(c=o,u=this,f=e,n){if(void 0===l)return h=t=f,l=v(g,a),d?m(t):s;if(p)return l=v(g,a),m(f)}return void 0===l&&(l=v(g,a)),s}return a=+a||0,x(t)&&(d=!!t.leading,p="maxWait"in t,o=p?Math.max(+t.maxWait||0,a):o,e="trailing"in t?!!t.trailing:e),w.cancel=function(){void 0!==l&&function(t){if(n)return L.cancelAnimationFrame(t);clearTimeout(t)}(l),c=f=u=l=void(h=0)},w.flush=function(){return void 0===l?s:i(Date.now())},w.pending=function(){return void 0!==l},w}var v=t(function(t){var e=function(a){var f,t=Object.prototype,l=t.hasOwnProperty,e="function"==typeof Symbol?Symbol:{},o=e.iterator||"@@iterator",n=e.asyncIterator||"@@asyncIterator",r=e.toStringTag||"@@toStringTag";function i(t,e,n){return Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}),t[e]}try{i({},"")}catch(t){i=function(t,e,n){return t[e]=n}}function c(t,e,n,r){var i,a,c,u,o=e&&e.prototype instanceof g?e:g,s=Object.create(o.prototype),l=new C(r||[]);return s._invoke=(i=t,a=n,c=l,u=d,function(t,e){if(u===m)throw new Error("Generator is already running");if(u===v){if("throw"===t)throw e;return j()}for(c.method=t,c.arg=e;;){var n=c.delegate;if(n){var r=function t(e,n){var r=e.iterator[n.method];if(r===f){if(n.delegate=null,"throw"===n.method){if(e.iterator.return&&(n.method="return",n.arg=f,t(e,n),"throw"===n.method))return y;n.method="throw",n.arg=new TypeError("The iterator does not provide a 'throw' method")}return y}var o=h(r,e.iterator,n.arg);if("throw"===o.type)return n.method="throw",n.arg=o.arg,n.delegate=null,y;var i=o.arg;return i?i.done?(n[e.resultName]=i.value,n.next=e.nextLoc,"return"!==n.method&&(n.method="next",n.arg=f),n.delegate=null,y):i:(n.method="throw",n.arg=new TypeError("iterator result is not an object"),n.delegate=null,y)}(n,c);if(r){if(r===y)continue;return r}}if("next"===c.method)c.sent=c._sent=c.arg;else if("throw"===c.method){if(u===d)throw u=v,c.arg;c.dispatchException(c.arg)}else"return"===c.method&&c.abrupt("return",c.arg);u=m;var o=h(i,a,c);if("normal"===o.type){if(u=c.done?v:p,o.arg===y)continue;return{value:o.arg,done:c.done}}"throw"===o.type&&(u=v,c.method="throw",c.arg=o.arg)}}),s}function h(t,e,n){try{return{type:"normal",arg:t.call(e,n)}}catch(t){return{type:"throw",arg:t}}}a.wrap=c;var d="suspendedStart",p="suspendedYield",m="executing",v="completed",y={};function g(){}function u(){}function s(){}var w={};w[o]=function(){return this};var x=Object.getPrototypeOf,L=x&&x(x(S([])));L&&L!==t&&l.call(L,o)&&(w=L);var E=s.prototype=g.prototype=Object.create(w);function b(t){["next","throw","return"].forEach(function(e){i(t,e,function(t){return this._invoke(e,t)})})}function _(u,s){var e;this._invoke=function(n,r){function t(){return new s(function(t,e){!function e(t,n,r,o){var i=h(u[t],u,n);if("throw"!==i.type){var a=i.arg,c=a.value;return c&&"object"==typeof c&&l.call(c,"__await")?s.resolve(c.__await).then(function(t){e("next",t,r,o)},function(t){e("throw",t,r,o)}):s.resolve(c).then(function(t){a.value=t,r(a)},function(t){return e("throw",t,r,o)})}o(i.arg)}(n,r,t,e)})}return e=e?e.then(t,t):t()}}function k(t){var e={tryLoc:t[0]};1 in t&&(e.catchLoc=t[1]),2 in t&&(e.finallyLoc=t[2],e.afterLoc=t[3]),this.tryEntries.push(e)}function N(t){var e=t.completion||{};e.type="normal",delete e.arg,t.completion=e}function C(t){this.tryEntries=[{tryLoc:"root"}],t.forEach(k,this),this.reset(!0)}function S(e){if(e){var t=e[o];if(t)return t.call(e);if("function"==typeof e.next)return e;if(!isNaN(e.length)){var n=-1,r=function t(){for(;++n<e.length;)if(l.call(e,n))return t.value=e[n],t.done=!1,t;return t.value=f,t.done=!0,t};return r.next=r}}return{next:j}}function j(){return{value:f,done:!0}}return((u.prototype=E.constructor=s).constructor=u).displayName=i(s,r,"GeneratorFunction"),a.isGeneratorFunction=function(t){var e="function"==typeof t&&t.constructor;return!!e&&(e===u||"GeneratorFunction"===(e.displayName||e.name))},a.mark=function(t){return Object.setPrototypeOf?Object.setPrototypeOf(t,s):(t.__proto__=s,i(t,r,"GeneratorFunction")),t.prototype=Object.create(E),t},a.awrap=function(t){return{__await:t}},b(_.prototype),_.prototype[n]=function(){return this},a.AsyncIterator=_,a.async=function(t,e,n,r,o){void 0===o&&(o=Promise);var i=new _(c(t,e,n,r),o);return a.isGeneratorFunction(e)?i:i.next().then(function(t){return t.done?t.value:i.next()})},b(E),i(E,r,"Generator"),E[o]=function(){return this},E.toString=function(){return"[object Generator]"},a.keys=function(n){var r=[];for(var t in n)r.push(t);return r.reverse(),function t(){for(;r.length;){var e=r.pop();if(e in n)return t.value=e,t.done=!1,t}return t.done=!0,t}},a.values=S,C.prototype={constructor:C,reset:function(t){if(this.prev=0,this.next=0,this.sent=this._sent=f,this.done=!1,this.delegate=null,this.method="next",this.arg=f,this.tryEntries.forEach(N),!t)for(var e in this)"t"===e.charAt(0)&&l.call(this,e)&&!isNaN(+e.slice(1))&&(this[e]=f)},stop:function(){this.done=!0;var t=this.tryEntries[0].completion;if("throw"===t.type)throw t.arg;return this.rval},dispatchException:function(n){if(this.done)throw n;var r=this;function t(t,e){return i.type="throw",i.arg=n,r.next=t,e&&(r.method="next",r.arg=f),!!e}for(var e=this.tryEntries.length-1;0<=e;--e){var o=this.tryEntries[e],i=o.completion;if("root"===o.tryLoc)return t("end");if(o.tryLoc<=this.prev){var a=l.call(o,"catchLoc"),c=l.call(o,"finallyLoc");if(a&&c){if(this.prev<o.catchLoc)return t(o.catchLoc,!0);if(this.prev<o.finallyLoc)return t(o.finallyLoc)}else if(a){if(this.prev<o.catchLoc)return t(o.catchLoc,!0)}else{if(!c)throw new Error("try statement without catch or finally");if(this.prev<o.finallyLoc)return t(o.finallyLoc)}}}},abrupt:function(t,e){for(var n=this.tryEntries.length-1;0<=n;--n){var r=this.tryEntries[n];if(r.tryLoc<=this.prev&&l.call(r,"finallyLoc")&&this.prev<r.finallyLoc){var o=r;break}}o&&("break"===t||"continue"===t)&&o.tryLoc<=e&&e<=o.finallyLoc&&(o=null);var i=o?o.completion:{};return i.type=t,i.arg=e,o?(this.method="next",this.next=o.finallyLoc,y):this.complete(i)},complete:function(t,e){if("throw"===t.type)throw t.arg;return"break"===t.type||"continue"===t.type?this.next=t.arg:"return"===t.type?(this.rval=this.arg=t.arg,this.method="return",this.next="end"):"normal"===t.type&&e&&(this.next=e),y},finish:function(t){for(var e=this.tryEntries.length-1;0<=e;--e){var n=this.tryEntries[e];if(n.finallyLoc===t)return this.complete(n.completion,n.afterLoc),N(n),y}},catch:function(t){for(var e=this.tryEntries.length-1;0<=e;--e){var n=this.tryEntries[e];if(n.tryLoc===t){var r,o=n.completion;return"throw"===o.type&&(r=o.arg,N(n)),r}}throw new Error("illegal catch attempt")},delegateYield:function(t,e,n){return this.delegate={iterator:S(t),resultName:e,nextLoc:n},"next"===this.method&&(this.arg=f),y}},a}(t.exports);try{regeneratorRuntime=e}catch(t){Function("r","regeneratorRuntime = r")(e)}});function u(t,e,n,r,o,i,a){try{var c=t[i](a),u=c.value}catch(t){return void n(t)}c.done?e(u):Promise.resolve(u).then(r,o)}function y(){for(var t,e=arguments.length,n=new Array(e),r=0;r<e;r++)n[r]=arguments[r];(t=console).log.apply(t,["LOG:"].concat(n))}var r=function(c){return function(){var t=this,a=arguments;return new Promise(function(e,n){var r=c.apply(t,a);function o(t){u(r,e,n,o,i,"next",t)}function i(t){u(r,e,n,o,i,"throw",t)}o(void 0)})}},e=function(){var t=r(v.mark(function t(){var o,i,a,c,u,s,e,l,f,h,d,p,m;return v.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:if(m=function(t){if(t<=0)return"slideleft-in";var e="slideleft-in-withHeightDiff_".concat(t);if(e in l.aniClasses)return e;for(var n=document.createElement("style"),r=Math.random().toString(36).substr(2),o={top:0,left:0,opacity:1,toStyle:function(){return"{\n          top: ".concat(this.top,"px;\n          left: ").concat(this.left,"px;\n          opacity: ").concat(this.opacity,";\n        }\n        ").replace(/[\n\t\s]/g,"")}},i=[],a=h;a<100;a+=f)i.push("".concat(a,"% ").concat(o.toStyle())),0===o.top?o.top=-t:o.top=0;return o.opacity=0,i.push("100% ".concat(o.toStyle())),n.innerHTML="\n    @keyframes keyframes_".concat(r," {\n      ").concat(i.join("\n"),"\n    }\n    .").concat(e," {\n      top: 0;\n      left: 100%;\n      animation:\n        keyframes_").concat(r," ").concat(.3*t,"s linear .5s 1 alternate forwards;\n      -webkit-animation:\n        keyframes_").concat(r," ").concat(.3*t,"s linear .5s 1 alternate forwards;\n    }\n    ").replace(/[\n\t]/g,""),document.head.appendChild(n),l.aniClasses[e]=1,e},p=function(e){return new Promise(function(i,t){var a=new Image;a.onload=function(){a.onload=null;var t=a.naturalHeight,e=a.naturalWidth,n=Math.floor(t*u/e),r=m(n-s),o=document.createElement("div");o.className="ad__img",o.classList.add(r),o.appendChild(a),i(o)},a.onerror=t,a.src=e})},window.fetch){t.next=4;break}return t.abrupt("return",y("Your broswer doesn't support this script."));case 4:return t.next=6,fetch("https://plants2019.oss-cn-shenzhen.aliyuncs.com/personalwebsite.plant/meta").then(function(t){return t.json()}).then(function(t){var e=t.pictures,o=t.key;return e.map(function(t){var e,n,r=t.text;return!r&&t.loc&&t.loc.t&&(n=(e=t.loc.t).streetNumber?e.streetNumber.street:"",r=e.province+e.city+e.district+e.township+n),r=r||"No words",{title:r+=" • "+new Date(t.date).toLocaleDateString(),src:"https://plants2019.oss-cn-shenzhen.aliyuncs.com/".concat(o,".plant/").concat(t.key,".jpg")}})});case 6:o=t.sent,i=o.length,a=document.querySelector("#ref_adImgs"),(c=document.createElement("div")).className="ad__img-title",c.textContent="",c.addEventListener("click",function(){var t=l.i-1,e=o[t].detail;e&&window.open(e,"_blank")}),a.addEventListener("click",function(t){var e,n;t.stopPropagation(),t.target instanceof Image&&(e=l.i-1,n=o[e].src,showPhotoModal(n))}),a.appendChild(c),a.querySelector(".ad__next").addEventListener("click",function(){l.requestNext=1,l.cur&&l.cur.classList.add("interrupt")}),u=a.clientWidth,s=a.clientHeight,e=Number(localStorage.getItem("CURRENT_AD_INDEX")),l={i:e,requestNext:0,cur:null,aniClasses:{}},f=33,h=5,(d=function(){var t=r(v.mark(function t(){var e,n,r;return v.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return l.i>=i&&(l.i=0),e=l.i,y("iter",e),localStorage.setItem("CURRENT_AD_INDEX",e),c.textContent="loading...",c.style.color="#456",c.classList.add("ad__img-title--loading"),n=o[e].src,t.next=10,p(n);case 10:(r=t.sent).addEventListener("animationend",function(t){var e=t.animationName;y("end",e),l.cur=null,a.removeChild(t.currentTarget),d()}),r.addEventListener("mouseenter",function(t){t.currentTarget.classList.add("paused")}),r.addEventListener("mouseleave",function(t){t.currentTarget.classList.remove("paused")}),a.appendChild(r),c.classList.remove("ad__img-title--loading"),c.textContent=o[e].title,c.style.color=o[e].tcolor||"#fff",l.i+=1,l.cur=r;case 20:case"end":return t.stop()}},t)}));return function(){return t.apply(this,arguments)}}())();case 23:case"end":return t.stop()}},t)}));return function(){return t.apply(this,arguments)}}(),o=-1<location.host.indexOf("china"),i=document.createElement("a");i.style="\n  position: fixed;\n  top: 0;\n  left: 0;\n  display: block;\n  width: 4em;\n  text-align: center;\n  font-size: 13px;\n  color: ".concat(o?"#035C97":"#E60118",";\n  text-decoration: underline;\n"),i.textContent=o?"境外站":"大陆站",i.href=(o?"https://zhangxinghai.cn":"https://china.zhangxinghai.cn")+location.pathname,document.body.appendChild(i),window.showPhotoModal=function(t){var e=document.createElement("div"),n=0;function r(){document.body.removeChild(e),document.querySelector("#page").classList.remove("blur"),window.removeEventListener("resize",a)}e.className="photo-modal",e.addEventListener("click",function(){s.style="width: 0; height: 0; opacity: .5;",n=1});var o,u=document.createElement("div");u.className="photo-modal__content",u.innerHTML="loading...",e.appendChild(u),e.appendChild(((o=document.createElement("a")).href="javascript:void(0);",o.target="_self",o.textContent="关闭",o.onclick=r,o.className="photo-modal__close",o)),document.body.appendChild(e),document.querySelector("#page").classList.add("blur");var s=new Image;function i(){var t=u.clientWidth-20-12,e=u.clientHeight-20-12,n=t*f/e>>0,r=s.naturalWidth,o=s.naturalHeight,i=r*f/o>>0,a=0,c=0;r<=t?o<=e?(a=r,c=o):a=l(i*(c=e)/f):!(o<=e)&&i<n?a=l(i*(c=e)/f):c=l((a=t)*f/i),s.style="width: ".concat(a,"px; height: ").concat(c,"px;")}s.style="width: 0; height: 0;";var l=Math.round,f=1024,a=c(i,300);window.addEventListener("resize",a),s.addEventListener("transitionend",function(t){n&&(r(),n=0)}),s.onload=function(){u.innerHTML="",u.appendChild(s),i()},s.src=t},e()}();
