import { debounce } from "./debounce"

function showPhotoModal(src) {
  const _pvbg = document.createElement("div")
  let reuqestClose = 0b0
  _pvbg.className = "photo-modal"
  _pvbg.addEventListener('click', () => {
    img.style = `width: 0; height: 0; opacity: .5;`
    reuqestClose = 0b1
  })

  const x = () => {
    document.body.removeChild(_pvbg)
    document.querySelector("#page").classList.remove('blur')
    window.removeEventListener('resize', debouncedCorrectSize)
  }

  const _pv = document.createElement("div")
  _pv.className = "photo-modal__content"
  _pv.innerHTML = "loading..."
  _pvbg.appendChild(_pv)

  _pvbg.appendChild((function() {
    const a = document.createElement('a')
    a.href = "javascript:void(0);"
    a.target = "_self"
    a.textContent = '关闭'
    a.onclick = x
    a.className = 'photo-modal__close'
    return a
  }()))

  document.body.appendChild(_pvbg)
  document.querySelector("#page").classList.add('blur')

  const img = new Image()
  img.style = `width: 0; height: 0;`

  const r = Math.round
  const YLES = 1024

  const correctSize = () => {
    console.log('------')
    const xW = _pv.clientWidth - 20 - 12
    const xH = _pv.clientHeight - 20 - 12
    const xR = (xW * YLES / xH) >> 0
    const iW = img.naturalWidth
    const iH = img.naturalHeight
    const iR = (iW * YLES / iH) >> 0
    console.log(iW, iH, iR, xW, xH, xR)
    let vW = 0, vH = 0
    if (xW >= iW) {
      if (xH >= iH) {
        vW = iW
        vH = iH
        console.log('0')
      } else {
        vH = xH
        vW = r(iR * vH / YLES)
        console.log('1')
      }
    } else {
      if (xH >= iH) {
        vW = xW
        vH = r(vW * YLES / iR)
        console.log('2')
      } else {
        if (xR > iR) {
          vH = xH
          vW = r(iR * vH / YLES)
          console.log('3')
        } else {
          vW = xW
          vH = r(vW * YLES / iR)
          console.log('4')
        }
      }
    }
    img.style = `width: ${vW}px; height: ${vH}px;`
  }

  const debouncedCorrectSize = debounce(correctSize, 300)

  window.addEventListener('resize', debouncedCorrectSize)

  img.addEventListener('transitionend', (e) => {
    if (reuqestClose) {
      console.log('haha', e)
      x()
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

export {
  showPhotoModal
}
