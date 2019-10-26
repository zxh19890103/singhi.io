const log = (...args) => {
  console.log('LOG:', ...args)
}

const adrun = async () => {
  if (!window.fetch) {
    return log(`Your broswer doesn't support this script.`)
  }

  const data = await fetch(`/assets/ad.json?v=${Date.now()}`)
  const srcset = await data.json()

  const imgList = document.querySelector('#ref_adImgs')
  const text = document.createElement('div')
  text.className = 'ad__img-title'
  text.textContent = ''
  text.addEventListener('click', () => {
    const i = obj.i - 1
    const { detail } = srcset[i]
    if (detail) {
      const anchor = document.createElement('a')
      anchor.href = detail
      anchor.target = '_blank'
      anchor.click()
    }
  })
  imgList.addEventListener('click', e => {
    e.stopPropagation()
    // console.log('000000', e.currentTarget)
    if (e.target instanceof Image) {
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

  const first = Number(localStorage.getItem("CURRENT_AD_INDEX"))
  const obj = {
    i: first,
    requestNext: 0,
    cur: null,
    aniClasses: {},
  }

  const ANIMATION_DURATION = 60
  const KEYFRAME_DURATION_PERCENT = 20
  const INITIAL_KEYFRAME_DURATION_PERCENT = 5

  const iterate = async () => {
    const i = obj.i
    log('iter', i)

    localStorage.setItem("CURRENT_AD_INDEX", i)

    if (i === srcset.length) {
      obj.i = 0
      iterate()
      // text.textContent = 'Play Over !'
      // text.classList.add('ad__img-title--over')
      return
    }

    text.textContent = 'loading...'
    text.style.color = '#fff'
    text.classList.add('ad__img-title--loading')

    const src = srcset[i].src
    const wrapper = await loadIMG(src)
    wrapper.addEventListener('animationend', e => {
      const aname = e.animationName
      log('end', aname)
      obj.cur = null
      imgList.removeChild(e.currentTarget)
      iterate()
    })
    wrapper.addEventListener('mouseenter', e => {
      e.currentTarget.classList.add('paused')
    })
    wrapper.addEventListener('mouseleave', e => {
      e.currentTarget.classList.remove('paused')
    })
    imgList.appendChild(wrapper)

    text.classList.remove('ad__img-title--loading')
    text.textContent = srcset[i].title
    text.style.color = srcset[i].tcolor || '#fff'

    obj.i += 1
    obj.cur = wrapper
  }

  function loadIMG(src) {
    return new Promise((done, error) => {
      const img = new Image()
      img.onload = () => {
        img.onload = null
        const { naturalHeight, naturalWidth } = img
        const imgH = Math.floor((naturalHeight * vW) / naturalWidth)
        const aniClass = generateKeyframes(imgH - vH)
        const wrapper = document.createElement('div')
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
    if (h <= 0) return 'slideleft-in'
    const className = `slideleft-in-withHeightDiff_${h}`
    if (className in obj.aniClasses) return className
    const styleTag = document.createElement('style')
    const r = Math.random()
      .toString(36)
      .substr(2)
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
      },
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

  iterate()
}

export { adrun }
