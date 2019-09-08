(function () {
  'use strict';

  // import isObject from './isObject.js'
  // import root from './.internal/root.js'

  /**
   * Creates a debounced function that delays invoking `func` until after `wait`
   * milliseconds have elapsed since the last time the debounced function was
   * invoked, or until the next browser frame is drawn. The debounced function
   * comes with a `cancel` method to cancel delayed `func` invocations and a
   * `flush` method to immediately invoke them. Provide `options` to indicate
   * whether `func` should be invoked on the leading and/or trailing edge of the
   * `wait` timeout. The `func` is invoked with the last arguments provided to the
   * debounced function. Subsequent calls to the debounced function return the
   * result of the last `func` invocation.
   *
   * **Note:** If `leading` and `trailing` options are `true`, `func` is
   * invoked on the trailing edge of the timeout only if the debounced function
   * is invoked more than once during the `wait` timeout.
   *
   * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
   * until the next tick, similar to `setTimeout` with a timeout of `0`.
   *
   * If `wait` is omitted in an environment with `requestAnimationFrame`, `func`
   * invocation will be deferred until the next frame is drawn (typically about
   * 16ms).
   *
   * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
   * for details over the differences between `debounce` and `throttle`.
   *
   * @since 0.1.0
   * @category Function
   * @param {Function} func The function to debounce.
   * @param {number} [wait=0]
   *  The number of milliseconds to delay; if omitted, `requestAnimationFrame` is
   *  used (if available).
   * @param {Object} [options={}] The options object.
   * @param {boolean} [options.leading=false]
   *  Specify invoking on the leading edge of the timeout.
   * @param {number} [options.maxWait]
   *  The maximum time `func` is allowed to be delayed before it's invoked.
   * @param {boolean} [options.trailing=true]
   *  Specify invoking on the trailing edge of the timeout.
   * @returns {Function} Returns the new debounced function.
   * @example
   *
   * // Avoid costly calculations while the window size is in flux.
   * jQuery(window).on('resize', debounce(calculateLayout, 150))
   *
   * // Invoke `sendMail` when clicked, debouncing subsequent calls.
   * jQuery(element).on('click', debounce(sendMail, 300, {
   *   'leading': true,
   *   'trailing': false
   * }))
   *
   * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
   * const debounced = debounce(batchLog, 250, { 'maxWait': 1000 })
   * const source = new EventSource('/stream')
   * jQuery(source).on('message', debounced)
   *
   * // Cancel the trailing debounced invocation.
   * jQuery(window).on('popstate', debounced.cancel)
   *
   * // Check for pending invocations.
   * const status = debounced.pending() ? "Pending..." : "Ready"
   */

  const isObject = (value) => {
    const type = typeof value;
    return value != null && (type == 'object' || type == 'function')
  };

  const root = window;

  function debounce(func, wait, options) {
    let lastArgs,
      lastThis,
      maxWait,
      result,
      timerId,
      lastCallTime;

    let lastInvokeTime = 0;
    let leading = false;
    let maxing = false;
    let trailing = true;

    // Bypass `requestAnimationFrame` by explicitly setting `wait=0`.
    const useRAF = (!wait && wait !== 0 && typeof root.requestAnimationFrame === 'function');

    if (typeof func !== 'function') {
      throw new TypeError('Expected a function')
    }
    wait = +wait || 0;
    if (isObject(options)) {
      leading = !!options.leading;
      maxing = 'maxWait' in options;
      maxWait = maxing ? Math.max(+options.maxWait || 0, wait) : maxWait;
      trailing = 'trailing' in options ? !!options.trailing : trailing;
    }

    function invokeFunc(time) {
      const args = lastArgs;
      const thisArg = lastThis;

      lastArgs = lastThis = undefined;
      lastInvokeTime = time;
      result = func.apply(thisArg, args);
      return result
    }

    function startTimer(pendingFunc, wait) {
      if (useRAF) {
        root.cancelAnimationFrame(timerId);
        return root.requestAnimationFrame(pendingFunc)
      }
      return setTimeout(pendingFunc, wait)
    }

    function cancelTimer(id) {
      if (useRAF) {
        return root.cancelAnimationFrame(id)
      }
      clearTimeout(id);
    }

    function leadingEdge(time) {
      // Reset any `maxWait` timer.
      lastInvokeTime = time;
      // Start the timer for the trailing edge.
      timerId = startTimer(timerExpired, wait);
      // Invoke the leading edge.
      return leading ? invokeFunc(time) : result
    }

    function remainingWait(time) {
      const timeSinceLastCall = time - lastCallTime;
      const timeSinceLastInvoke = time - lastInvokeTime;
      const timeWaiting = wait - timeSinceLastCall;

      return maxing
        ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
        : timeWaiting
    }

    function shouldInvoke(time) {
      const timeSinceLastCall = time - lastCallTime;
      const timeSinceLastInvoke = time - lastInvokeTime;

      // Either this is the first call, activity has stopped and we're at the
      // trailing edge, the system time has gone backwards and we're treating
      // it as the trailing edge, or we've hit the `maxWait` limit.
      return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
        (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait))
    }

    function timerExpired() {
      const time = Date.now();
      if (shouldInvoke(time)) {
        return trailingEdge(time)
      }
      // Restart the timer.
      timerId = startTimer(timerExpired, remainingWait(time));
    }

    function trailingEdge(time) {
      timerId = undefined;

      // Only invoke if we have `lastArgs` which means `func` has been
      // debounced at least once.
      if (trailing && lastArgs) {
        return invokeFunc(time)
      }
      lastArgs = lastThis = undefined;
      return result
    }

    function cancel() {
      if (timerId !== undefined) {
        cancelTimer(timerId);
      }
      lastInvokeTime = 0;
      lastArgs = lastCallTime = lastThis = timerId = undefined;
    }

    function flush() {
      return timerId === undefined ? result : trailingEdge(Date.now())
    }

    function pending() {
      return timerId !== undefined
    }

    function debounced(...args) {
      const time = Date.now();
      const isInvoking = shouldInvoke(time);

      lastArgs = args;
      lastThis = this;
      lastCallTime = time;

      if (isInvoking) {
        if (timerId === undefined) {
          return leadingEdge(lastCallTime)
        }
        if (maxing) {
          // Handle invocations in a tight loop.
          timerId = startTimer(timerExpired, wait);
          return invokeFunc(lastCallTime)
        }
      }
      if (timerId === undefined) {
        timerId = startTimer(timerExpired, wait);
      }
      return result
    }
    debounced.cancel = cancel;
    debounced.flush = flush;
    debounced.pending = pending;
    return debounced
  }

  function showPhotoModal$1(src) {
    const _pvbg = document.createElement("div");
    let reuqestClose = 0b0;
    _pvbg.className = "photo-modal";
    _pvbg.addEventListener('click', () => {
      img.style = `width: 0; height: 0; opacity: .5;`;
      reuqestClose = 0b1;
    });

    const x = () => {
      document.body.removeChild(_pvbg);
      document.querySelector("#page").classList.remove('blur');
      window.removeEventListener('resize', debouncedCorrectSize);
    };

    const _pv = document.createElement("div");
    _pv.className = "photo-modal__content";
    _pv.innerHTML = "loading...";
    _pvbg.appendChild(_pv);

    _pvbg.appendChild((function() {
      const a = document.createElement('a');
      a.href = "javascript:void(0);";
      a.target = "_self";
      a.textContent = '关闭';
      a.onclick = x;
      a.className = 'photo-modal__close';
      return a
    }()));

    document.body.appendChild(_pvbg);
    document.querySelector("#page").classList.add('blur');

    const img = new Image();
    img.style = `width: 0; height: 0;`;

    const r = Math.round;
    const YLES = 1024;

    const correctSize = () => {
      console.log('------');
      const xW = _pv.clientWidth - 20 - 12;
      const xH = _pv.clientHeight - 20 - 12;
      const xR = (xW * YLES / xH) >> 0;
      const iW = img.naturalWidth;
      const iH = img.naturalHeight;
      const iR = (iW * YLES / iH) >> 0;
      console.log(iW, iH, iR, xW, xH, xR);
      let vW = 0, vH = 0;
      if (xW >= iW) {
        if (xH >= iH) {
          vW = iW;
          vH = iH;
          console.log('0');
        } else {
          vH = xH;
          vW = r(iR * vH / YLES);
          console.log('1');
        }
      } else {
        if (xH >= iH) {
          vW = xW;
          vH = r(vW * YLES / iR);
          console.log('2');
        } else {
          if (xR > iR) {
            vH = xH;
            vW = r(iR * vH / YLES);
            console.log('3');
          } else {
            vW = xW;
            vH = r(vW * YLES / iR);
            console.log('4');
          }
        }
      }
      img.style = `width: ${vW}px; height: ${vH}px;`;
    };

    const debouncedCorrectSize = debounce(correctSize, 300);

    window.addEventListener('resize', debouncedCorrectSize);

    img.addEventListener('transitionend', (e) => {
      if (reuqestClose) {
        console.log('haha', e);
        x();
        reuqestClose = 0b0;
      }
    });

    img.onload = () => {
      _pv.innerHTML = "";
      _pv.appendChild(img);
      correctSize();
    };
    img.src = src;
  }

  const log = (...args) => {
    console.log("LOG:", ...args);
  };

  const adrun = async () => {

    if (!window.fetch) {
      return log(`Your broswer doesn't support this script.`)
    }

    const data = await fetch('/assets/ad.json');
    const srcset = await data.json();

    const imgList = document.querySelector('#ref_adImgs');
    const text = document.createElement("div");
    text.className = "ad__img-title";
    text.textContent = '';
    text.addEventListener('click', () => {
      const i = obj.i - 1;
      const { detail } = srcset[i];
      if (detail) {
        const anchor = document.createElement('a');
        anchor.href = detail;
        anchor.target = "_blank";
        anchor.click();
      }
    });
    imgList.addEventListener('click', (e) => {
      e.stopPropagation();
      // console.log('000000', e.currentTarget)
      if(e.target instanceof Image) {
        const i = obj.i - 1;
        const { src } = srcset[i];
        showPhotoModal(src);
      }
    });
    imgList.appendChild(text);

    imgList.querySelector('.ad__next').addEventListener('click', () => {
      obj.requestNext = 1;
      if (obj.cur) {
        obj.cur.classList.add('interrupt');
      }
    });

    const { clientWidth: vW, clientHeight: vH } = imgList;

    const obj = {
      i: 0,
      requestNext: 0,
      cur: null,
      aniClasses: {}
    };

    const ANIMATION_DURATION = 60;
    const KEYFRAME_DURATION_PERCENT = 20;
    const INITIAL_KEYFRAME_DURATION_PERCENT = 5;

    const iterate = async () => {
      const i = obj.i;
      log('iter', i);

      if (i === srcset.length) {
        text.textContent = "Play Over !";
        text.classList.add("ad__img-title--over");
        return
      }

      text.textContent = "loading...";
      text.style.color = "#fff";
      text.classList.add("ad__img-title--loading");

      const src = srcset[i].src;
      const wrapper = await loadIMG(src);
      wrapper.addEventListener("animationend", (e) => {
        const aname = e.animationName;
        log("end", aname);
        obj.cur = null;
        imgList.removeChild(e.currentTarget);
        iterate();
      });
      wrapper.addEventListener("mouseenter", e => {
        e.currentTarget.classList.add('paused');
      });
      wrapper.addEventListener("mouseleave", e => {
        e.currentTarget.classList.remove('paused');
      });
      imgList.appendChild(wrapper);

      text.classList.remove("ad__img-title--loading");
      text.textContent = srcset[i].title;
      text.style.color = srcset[i].tcolor || "#fff";

      obj.i += 1;
      obj.cur = wrapper;
    };

    function loadIMG(src) {
      return new Promise((done, error) => {
        const img = new Image();
        img.onload = () => {
          img.onload = null;
          const { naturalHeight, naturalWidth } = img;
          const imgH = Math.floor(naturalHeight * vW / naturalWidth);
          const aniClass = generateKeyframes(imgH - vH);
          const wrapper = document.createElement("div");
          wrapper.className = `ad__img`;
          wrapper.classList.add(aniClass);
          wrapper.appendChild(img);
          done(wrapper);
        };
        img.onerror = error;
        img.src = src;
      })
    }

    function generateKeyframes(h) {
      if (h <= 0) return "slideleft-in"
      const className = `slideleft-in-withHeightDiff_${h}`;
      if (className in obj.aniClasses) return className
      const styleTag = document.createElement("style");
      const r = Math.random().toString(36).substr(2);
      const styleState = {
        top: 0,
        left: 0,
        opacity: 1,
        toStyle() {
          return `{
          top: ${this.top}px;
          left: ${this.left}px;
          opacity: ${this.opacity};
        }
        `.replace(/[\n\t\s]/g, '')
        }
      };
      const frames = [];
      let time = INITIAL_KEYFRAME_DURATION_PERCENT;
      for (; time < 100; time += KEYFRAME_DURATION_PERCENT) {
        frames.push(`${time}% ${styleState.toStyle()}`);
        if (styleState.top === 0) styleState.top = -h;
        else styleState.top = 0;
      }

      styleState.opacity = 0;
      // the last frame
      frames.push(`100% ${styleState.toStyle()}`);

      styleTag.innerHTML = `
    @keyframes keyframes_${r} {
      ${frames.join('\n')}
    }
    .${className} {
      top: 0;
      left: 100%;
      animation:
        keyframes_${r} ${ANIMATION_DURATION}s linear .5s 1 alternate forwards;
      -webkit-animation:
        keyframes_${r} ${ANIMATION_DURATION}s linear .5s 1 alternate forwards
    }
    `.replace(/[\n\t]/g, '');
      document.head.appendChild(styleTag);
      obj.aniClasses[className] = 1;
      return className
    }

    iterate();
  };

  window.showPhotoModal = showPhotoModal$1;

  adrun();

}());
