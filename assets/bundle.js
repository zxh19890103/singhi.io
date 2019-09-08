!function(){"use strict";function t(t,e){return t(e={exports:{}},e.exports),e.exports}var n=t(function(e){function n(t){return(n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function r(t){return"function"==typeof Symbol&&"symbol"===n(Symbol.iterator)?e.exports=r=function(t){return n(t)}:e.exports=r=function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":n(t)},r(t)}e.exports=r}),x=(n.typeof,function(t){var e=n(t);return null!=t&&("object"==e||"function"==e)}),L=window;function c(r,i,t){var a,c,o,u,s,l,f=0,h=!1,d=!1,e=!0,n=!i&&0!==i&&"function"==typeof L.requestAnimationFrame;if("function"!=typeof r)throw new TypeError("Expected a function");function p(t){var e=a,n=c;return a=c=void 0,f=t,u=r.apply(n,e)}function v(t,e){return n?(L.cancelAnimationFrame(s),L.requestAnimationFrame(t)):setTimeout(t,e)}function y(t){var e=t-l;return void 0===l||i<=e||e<0||d&&o<=t-f}function m(){var t=Date.now();if(y(t))return g(t);s=v(m,function(t){var e=t-f,n=i-(t-l);return d?Math.min(n,o-e):n}(t))}function g(t){return s=void 0,e&&a?p(t):(a=c=void 0,u)}function w(){for(var t=Date.now(),e=y(t),n=arguments.length,r=new Array(n),o=0;o<n;o++)r[o]=arguments[o];if(a=r,c=this,l=t,e){if(void 0===s)return function(t){return f=t,s=v(m,i),h?p(t):u}(l);if(d)return s=v(m,i),p(l)}return void 0===s&&(s=v(m,i)),u}return i=+i||0,x(t)&&(h=!!t.leading,o=(d="maxWait"in t)?Math.max(+t.maxWait||0,i):o,e="trailing"in t?!!t.trailing:e),w.cancel=function(){void 0!==s&&function(t){if(n)return L.cancelAnimationFrame(t);clearTimeout(t)}(s),a=l=c=s=void(f=0)},w.flush=function(){return void 0===s?u:g(Date.now())},w.pending=function(){return void 0!==s},w}var y=t(function(t){var e=function(i){var u,t=Object.prototype,s=t.hasOwnProperty,e="function"==typeof Symbol?Symbol:{},o=e.iterator||"@@iterator",n=e.asyncIterator||"@@asyncIterator",r=e.toStringTag||"@@toStringTag";function a(t,e,n,r){var o=e&&e.prototype instanceof c?e:c,i=Object.create(o.prototype),a=new C(r||[]);return i._invoke=function(i,a,c){var u=f;return function(t,e){if(u===d)throw new Error("Generator is already running");if(u===p){if("throw"===t)throw e;return j()}for(c.method=t,c.arg=e;;){var n=c.delegate;if(n){var r=_(n,c);if(r){if(r===v)continue;return r}}if("next"===c.method)c.sent=c._sent=c.arg;else if("throw"===c.method){if(u===f)throw u=p,c.arg;c.dispatchException(c.arg)}else"return"===c.method&&c.abrupt("return",c.arg);u=d;var o=l(i,a,c);if("normal"===o.type){if(u=c.done?p:h,o.arg===v)continue;return{value:o.arg,done:c.done}}"throw"===o.type&&(u=p,c.method="throw",c.arg=o.arg)}}}(t,n,a),i}function l(t,e,n){try{return{type:"normal",arg:t.call(e,n)}}catch(t){return{type:"throw",arg:t}}}i.wrap=a;var f="suspendedStart",h="suspendedYield",d="executing",p="completed",v={};function c(){}function y(){}function m(){}var g={};g[o]=function(){return this};var w=Object.getPrototypeOf,x=w&&w(w(N([])));x&&x!==t&&s.call(x,o)&&(g=x);var L=m.prototype=c.prototype=Object.create(g);function b(t){["next","throw","return"].forEach(function(e){t[e]=function(t){return this._invoke(e,t)}})}function E(u){var e;this._invoke=function(n,r){function t(){return new Promise(function(t,e){!function e(t,n,r,o){var i=l(u[t],u,n);if("throw"!==i.type){var a=i.arg,c=a.value;return c&&"object"==typeof c&&s.call(c,"__await")?Promise.resolve(c.__await).then(function(t){e("next",t,r,o)},function(t){e("throw",t,r,o)}):Promise.resolve(c).then(function(t){a.value=t,r(a)},function(t){return e("throw",t,r,o)})}o(i.arg)}(n,r,t,e)})}return e=e?e.then(t,t):t()}}function _(t,e){var n=t.iterator[e.method];if(n===u){if(e.delegate=null,"throw"===e.method){if(t.iterator.return&&(e.method="return",e.arg=u,_(t,e),"throw"===e.method))return v;e.method="throw",e.arg=new TypeError("The iterator does not provide a 'throw' method")}return v}var r=l(n,t.iterator,e.arg);if("throw"===r.type)return e.method="throw",e.arg=r.arg,e.delegate=null,v;var o=r.arg;return o?o.done?(e[t.resultName]=o.value,e.next=t.nextLoc,"return"!==e.method&&(e.method="next",e.arg=u),e.delegate=null,v):o:(e.method="throw",e.arg=new TypeError("iterator result is not an object"),e.delegate=null,v)}function k(t){var e={tryLoc:t[0]};1 in t&&(e.catchLoc=t[1]),2 in t&&(e.finallyLoc=t[2],e.afterLoc=t[3]),this.tryEntries.push(e)}function S(t){var e=t.completion||{};e.type="normal",delete e.arg,t.completion=e}function C(t){this.tryEntries=[{tryLoc:"root"}],t.forEach(k,this),this.reset(!0)}function N(e){if(e){var t=e[o];if(t)return t.call(e);if("function"==typeof e.next)return e;if(!isNaN(e.length)){var n=-1,r=function t(){for(;++n<e.length;)if(s.call(e,n))return t.value=e[n],t.done=!1,t;return t.value=u,t.done=!0,t};return r.next=r}}return{next:j}}function j(){return{value:u,done:!0}}return y.prototype=L.constructor=m,m.constructor=y,m[r]=y.displayName="GeneratorFunction",i.isGeneratorFunction=function(t){var e="function"==typeof t&&t.constructor;return!!e&&(e===y||"GeneratorFunction"===(e.displayName||e.name))},i.mark=function(t){return Object.setPrototypeOf?Object.setPrototypeOf(t,m):(t.__proto__=m,r in t||(t[r]="GeneratorFunction")),t.prototype=Object.create(L),t},i.awrap=function(t){return{__await:t}},b(E.prototype),E.prototype[n]=function(){return this},i.AsyncIterator=E,i.async=function(t,e,n,r){var o=new E(a(t,e,n,r));return i.isGeneratorFunction(e)?o:o.next().then(function(t){return t.done?t.value:o.next()})},b(L),L[r]="Generator",L[o]=function(){return this},L.toString=function(){return"[object Generator]"},i.keys=function(n){var r=[];for(var t in n)r.push(t);return r.reverse(),function t(){for(;r.length;){var e=r.pop();if(e in n)return t.value=e,t.done=!1,t}return t.done=!0,t}},i.values=N,C.prototype={constructor:C,reset:function(t){if(this.prev=0,this.next=0,this.sent=this._sent=u,this.done=!1,this.delegate=null,this.method="next",this.arg=u,this.tryEntries.forEach(S),!t)for(var e in this)"t"===e.charAt(0)&&s.call(this,e)&&!isNaN(+e.slice(1))&&(this[e]=u)},stop:function(){this.done=!0;var t=this.tryEntries[0].completion;if("throw"===t.type)throw t.arg;return this.rval},dispatchException:function(n){if(this.done)throw n;var r=this;function t(t,e){return i.type="throw",i.arg=n,r.next=t,e&&(r.method="next",r.arg=u),!!e}for(var e=this.tryEntries.length-1;0<=e;--e){var o=this.tryEntries[e],i=o.completion;if("root"===o.tryLoc)return t("end");if(o.tryLoc<=this.prev){var a=s.call(o,"catchLoc"),c=s.call(o,"finallyLoc");if(a&&c){if(this.prev<o.catchLoc)return t(o.catchLoc,!0);if(this.prev<o.finallyLoc)return t(o.finallyLoc)}else if(a){if(this.prev<o.catchLoc)return t(o.catchLoc,!0)}else{if(!c)throw new Error("try statement without catch or finally");if(this.prev<o.finallyLoc)return t(o.finallyLoc)}}}},abrupt:function(t,e){for(var n=this.tryEntries.length-1;0<=n;--n){var r=this.tryEntries[n];if(r.tryLoc<=this.prev&&s.call(r,"finallyLoc")&&this.prev<r.finallyLoc){var o=r;break}}o&&("break"===t||"continue"===t)&&o.tryLoc<=e&&e<=o.finallyLoc&&(o=null);var i=o?o.completion:{};return i.type=t,i.arg=e,o?(this.method="next",this.next=o.finallyLoc,v):this.complete(i)},complete:function(t,e){if("throw"===t.type)throw t.arg;return"break"===t.type||"continue"===t.type?this.next=t.arg:"return"===t.type?(this.rval=this.arg=t.arg,this.method="return",this.next="end"):"normal"===t.type&&e&&(this.next=e),v},finish:function(t){for(var e=this.tryEntries.length-1;0<=e;--e){var n=this.tryEntries[e];if(n.finallyLoc===t)return this.complete(n.completion,n.afterLoc),S(n),v}},catch:function(t){for(var e=this.tryEntries.length-1;0<=e;--e){var n=this.tryEntries[e];if(n.tryLoc===t){var r=n.completion;if("throw"===r.type){var o=r.arg;S(n)}return o}}throw new Error("illegal catch attempt")},delegateYield:function(t,e,n){return this.delegate={iterator:N(t),resultName:e,nextLoc:n},"next"===this.method&&(this.arg=u),v}},i}(t.exports);try{regeneratorRuntime=e}catch(t){Function("r","regeneratorRuntime = r")(e)}});function u(t,e,n,r,o,i,a){try{var c=t[i](a),u=c.value}catch(t){return void n(t)}c.done?e(u):Promise.resolve(u).then(r,o)}function m(){for(var t,e=arguments.length,n=new Array(e),r=0;r<e;r++)n[r]=arguments[r];(t=console).log.apply(t,["LOG:"].concat(n))}var r=function(c){return function(){var t=this,a=arguments;return new Promise(function(e,n){var r=c.apply(t,a);function o(t){u(r,e,n,o,i,"next",t)}function i(t){u(r,e,n,o,i,"throw",t)}o(void 0)})}},e=function(){var t=r(y.mark(function t(){var e,o,i,a,c,u,s,l,f,h,d,p,v;return y.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:if(v=function(t){if(t<=0)return"slideleft-in";var e="slideleft-in-withHeightDiff_".concat(t);if(e in s.aniClasses)return e;for(var n=document.createElement("style"),r=Math.random().toString(36).substr(2),o={top:0,left:0,opacity:1,toStyle:function(){return"{\n          top: ".concat(this.top,"px;\n          left: ").concat(this.left,"px;\n          opacity: ").concat(this.opacity,";\n        }\n        ").replace(/[\n\t\s]/g,"")}},i=[],a=h;a<100;a+=f)i.push("".concat(a,"% ").concat(o.toStyle())),0===o.top?o.top=-t:o.top=0;return o.opacity=0,i.push("100% ".concat(o.toStyle())),n.innerHTML="\n    @keyframes keyframes_".concat(r," {\n      ").concat(i.join("\n"),"\n    }\n    .").concat(e," {\n      top: 0;\n      left: 100%;\n      animation:\n        keyframes_").concat(r," ").concat(l,"s linear .5s 1 alternate forwards;\n      -webkit-animation:\n        keyframes_").concat(r," ").concat(l,"s linear .5s 1 alternate forwards\n    }\n    ").replace(/[\n\t]/g,""),document.head.appendChild(n),s.aniClasses[e]=1,e},p=function(e){return new Promise(function(i,t){var a=new Image;a.onload=function(){a.onload=null;var t=a.naturalHeight,e=a.naturalWidth,n=Math.floor(t*c/e),r=v(n-u),o=document.createElement("div");o.className="ad__img",o.classList.add(r),o.appendChild(a),i(o)},a.onerror=t,a.src=e})},window.fetch){t.next=4;break}return t.abrupt("return",m("Your broswer doesn't support this script."));case 4:return t.next=6,fetch("/assets/ad.json");case 6:return e=t.sent,t.next=9,e.json();case 9:o=t.sent,i=document.querySelector("#ref_adImgs"),(a=document.createElement("div")).className="ad__img-title",a.textContent="",a.addEventListener("click",function(){var t=s.i-1,e=o[t].detail;if(e){var n=document.createElement("a");n.href=e,n.target="_blank",n.click()}}),i.addEventListener("click",function(t){if(t.stopPropagation(),t.target instanceof Image){var e=s.i-1,n=o[e].src;showPhotoModal(n)}}),i.appendChild(a),i.querySelector(".ad__next").addEventListener("click",function(){s.requestNext=1,s.cur&&s.cur.classList.add("interrupt")}),c=i.clientWidth,u=i.clientHeight,s={i:0,requestNext:0,cur:null,aniClasses:{}},l=60,f=20,h=5,(d=function(){var t=r(y.mark(function t(){var e,n,r;return y.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:if(e=s.i,m("iter",e),e===o.length)return a.textContent="Play Over !",a.classList.add("ad__img-title--over"),t.abrupt("return");t.next=6;break;case 6:return a.textContent="loading...",a.style.color="#fff",a.classList.add("ad__img-title--loading"),n=o[e].src,t.next=12,p(n);case 12:(r=t.sent).addEventListener("animationend",function(t){var e=t.animationName;m("end",e),s.cur=null,i.removeChild(t.currentTarget),d()}),r.addEventListener("mouseenter",function(t){t.currentTarget.classList.add("paused")}),r.addEventListener("mouseleave",function(t){t.currentTarget.classList.remove("paused")}),i.appendChild(r),a.classList.remove("ad__img-title--loading"),a.textContent=o[e].title,a.style.color=o[e].tcolor||"#fff",s.i+=1,s.cur=r;case 22:case"end":return t.stop()}},t)}));return function(){return t.apply(this,arguments)}}())();case 25:case"end":return t.stop()}},t)}));return function(){return t.apply(this,arguments)}}();window.showPhotoModal=function(t){var e=document.createElement("div"),n=0;function r(){document.body.removeChild(e),document.querySelector("#page").classList.remove("blur"),window.removeEventListener("resize",a)}e.className="photo-modal",e.addEventListener("click",function(){s.style="width: 0; height: 0; opacity: .5;",n=1});var o,u=document.createElement("div");u.className="photo-modal__content",u.innerHTML="loading...",e.appendChild(u),e.appendChild(((o=document.createElement("a")).href="javascript:void(0);",o.target="_self",o.textContent="关闭",o.onclick=r,o.className="photo-modal__close",o)),document.body.appendChild(e),document.querySelector("#page").classList.add("blur");var s=new Image;function i(){var t=u.clientWidth-20-12,e=u.clientHeight-20-12,n=t*f/e>>0,r=s.naturalWidth,o=s.naturalHeight,i=r*f/o>>0,a=0,c=0;r<=t?o<=e?(a=r,c=o):a=l(i*(c=e)/f):o<=e?c=l((a=t)*f/i):i<n?a=l(i*(c=e)/f):c=l((a=t)*f/i),s.style="width: ".concat(a,"px; height: ").concat(c,"px;")}s.style="width: 0; height: 0;";var l=Math.round,f=1024,a=c(i,300);window.addEventListener("resize",a),s.addEventListener("transitionend",function(t){n&&(r(),n=0)}),s.onload=function(){u.innerHTML="",u.appendChild(s),i()},s.src=t},e()}();
