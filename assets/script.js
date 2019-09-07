
// ad
;(async function(window) {

  if(!window.fetch) throw new Error("Your broswer doesn't support this script.")

  const log = (...args) => {
    console.log("LOG:", ...args)
  }

  const data = await fetch('/assets/ad.json')
  const srcset = await data.json()
  // console.log(d)
  // const srcset = window.__SRCSET__ || []

  const imgList = document.querySelector('#ref_adImgs')
  const text = document.createElement("div")
  text.className = "ad__img-title"
  text.textContent = ''
  text.addEventListener('click', () => {
    const i = obj.i - 1
    const { detail } = srcset[i]
    if (detail) {
      const anchor = document.createElement('a')
      anchor.href = detail
      anchor.target = "_blank"
      anchor.click()
    }
  })
  imgList.addEventListener('click', (e) => {
    e.stopPropagation()
    // console.log('000000', e.currentTarget)
    if(e.target instanceof Image) {
      const i = obj.i - 1
      const { src } = srcset[i]
      showPhotoModal(src)
    }
  })
  imgList.appendChild(text)

  imgList.querySelector('.ad__next').addEventListener('click', () => {
    obj.requestNext = 1
    if (obj.cur) {
      obj.cur.classList.add('interrupt')
    }
  })

  const { clientWidth: vW, clientHeight: vH } = imgList

  const obj = {
    i: 0,
    requestNext: 0,
    cur: null,
    aniClasses: {}
  }

  const ANIMATION_DURATION = 60
  const KEYFRAME_DURATION_PERCENT = 20
  const INITIAL_KEYFRAME_DURATION_PERCENT = 5

  const iterate = async () => {
    const i = obj.i
    log('iter', i)

    if (i === srcset.length) {
      text.textContent = "Play Over !"
      text.classList.add("ad__img-title--over")
      return
    }

    text.textContent = "loading..."
    text.style.color = "#fff"
    text.classList.add("ad__img-title--loading")

    const src = srcset[i].src
    const wrapper = await loadIMG(src)
    wrapper.addEventListener("animationend", (e) => {
      const aname = e.animationName
      log("end", aname)
      obj.cur = null
      imgList.removeChild(e.currentTarget)
      iterate()
    })
    wrapper.addEventListener("mouseenter", e => {
      e.currentTarget.classList.add('paused')
    })
    wrapper.addEventListener("mouseleave", e => {
      e.currentTarget.classList.remove('paused')
    })
    imgList.appendChild(wrapper)

    text.classList.remove("ad__img-title--loading")
    text.textContent = srcset[i].title
    text.style.color = srcset[i].tcolor || "#fff"

    obj.i += 1
    obj.cur = wrapper
  }

  iterate()

  function loadIMG(src) {
    return new Promise((done, error) => {
      const img = new Image()
      img.onload = () => {
        img.onload = null
        const { naturalHeight, naturalWidth } = img
        const imgH = Math.floor(naturalHeight * vW / naturalWidth)
        const aniClass = generateKeyframes(imgH - vH)
        const wrapper = document.createElement("div")
        wrapper.className = `ad__img`
        wrapper.classList.add(aniClass)
        wrapper.appendChild(img)
        done(wrapper)
      }
      img.onerror = error
      img.src = src
    })
  }

  function generateKeyframes(h) {
    if (h <= 0) return "slideleft-in"
    const className = `slideleft-in-withHeightDiff_${h}`
    if (className in obj.aniClasses) return className
    const styleTag = document.createElement("style")
    const r = Math.random().toString(36).substr(2)
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
    }
    const frames = []
    let time = INITIAL_KEYFRAME_DURATION_PERCENT
    for (; time < 100; time += KEYFRAME_DURATION_PERCENT) {
      frames.push(`${time}% ${styleState.toStyle()}`)
      if (styleState.top === 0) styleState.top = -h
      else styleState.top = 0
    }

    styleState.opacity = 0
    // the last frame
    frames.push(`100% ${styleState.toStyle()}`)

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
    `.replace(/[\n\t]/g, '')
    document.head.appendChild(styleTag)
    obj.aniClasses[className] = 1
    return className
  }
}(window));


function showPhotoModal(src) {
  const _pvbg = document.createElement("div")
  let reuqestClose = 0b0
  _pvbg.className = "photo-modal"
  _pvbg.addEventListener('click', () => {
    img.style = `width: 0; height: 0; opacity: .5;`
    reuqestClose = 0b1
  })

  const _pv = document.createElement("div")
  _pv.className = "photo-modal__content"
  _pv.innerHTML = "loading..."
  _pvbg.appendChild(_pv)

  document.body.appendChild(_pvbg)
  document.querySelector("#page").classList.add('blur')

  const img = new Image()
  img.style = `width: 0; height: 0;`

  const correctSize = () => {
    console.log('------')
    const xW = _pv.clientWidth - 20 - 12
    const xH = _pv.clientHeight - 20 - 12
    const xR = Math.floor(xW / xH)
    const iW = img.naturalWidth
    const iH = img.naturalHeight
    console.log(iW, iH)
    const iR = Math.floor(iW / iH)
    let vW = 0, vH = 0
    if (xW >= iW && xH >= iH) {
      vW =  iW
      vH = iH
    } else if (xW < iW && xH >= iH) {
      vW = xW
      vH = Math.floor(vW / iR)
    } else if (xW < iW && xH < iH) {
      if (xR > iR) {
        vH = xH
        vW = iR * vH
      } else {
        vW = xW
        vH = Math.floor(vW / iR)
      }
    } else if (xW >= iW && xH < iH) {
      vH = xH
      vW = iR * vH
    }
    img.style = `width: ${vW}px; height: ${vH}px;`
  }

  window.addEventListener('resize', correctSize)

  img.addEventListener('transitionend', (e) => {
    if (reuqestClose) {
      console.log('haha', e)
      document.body.removeChild(_pvbg)
      document.querySelector("#page").classList.remove('blur')
      window.removeEventListener('resize', correctSize)
      reuqestClose = 0b0
    }
  })

  img.onload = () => {
    _pv.innerHTML = ""
    _pv.appendChild(img)
    correctSize()
  }
  img.src = src
}
