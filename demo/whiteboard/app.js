const app = () => {

  const canvasElement = document.createElement('canvas')
  const context2d = canvasElement.getContext('2d')
  const dpr = window.devicePixelRatio

  const STATE = {
    idle: 1,
    startDrawing: 10,
    startErasing: 20,
    drawing: 30,
    stopDrawing: 40,
  }

  const mount = () => {
    const doc = document.documentElement
    canvasElement.style.cssText = `width: 100%; height: 100%`
    canvasElement.width = doc.clientWidth * dpr
    canvasElement.height = doc.clientHeight * dpr
    doc.querySelector('#app').appendChild(canvasElement)
  }

  const createControl = (label, action) => {
    const control = document.createElement('a')
    control.href = 'javascript:void(0);'
    control.textContent = label
    control.className = 'control'
    control.addEventListener('click', action)
    return control
  }

  const controls = () => {
    const div = document.createElement('div')
    div.className = 'controls'
    div.append(
      createControl('clean', () => {
        context2d.clearRect(0, 0, canvasElement.width, canvasElement.height)
      }),
      createControl('x', (e) => {
        // const element = e.target
        // document.body.className = 'erasing'
      }),
    )
    document.body.appendChild(div)
  }

  let state = STATE.idle
  let setStateCallback = null
  const setState = (stateValue, callback) => {
    state = stateValue
    setStateCallback = callback
    queueMicrotask(() => {
      setStateCallback && setStateCallback()
      setStateCallback = null
    })
  }

  const events = () => {
    context2d.scale(1 / dpr, 1 / dpr)

    context2d.fillStyle = '#000'

    canvasElement.addEventListener('click', (e) => {
      if (state === STATE.drawing) {
        setState(STATE.stopDrawing, () => {
          document.body.className = ''
        })
      } else if (state === STATE.idle) {
        setState(STATE.startDrawing, () => {
          document.body.className = 'drawing'
        })
      } else {
        //
      }
    })

    canvasElement.addEventListener('mousemove', e => {

      const x = e.clientX * dpr
      const y = e.clientY * dpr

      switch (state) {
        case STATE.idle: {
          break
        }
        case STATE.startDrawing: {
          context2d.beginPath()
          context2d.moveTo(x, y)

          state = STATE.drawing
          break
        }
        case STATE.drawing: {
          context2d.lineTo(x, y)
          context2d.stroke()
          break
        }
        case STATE.stopDrawing: {
          state = STATE.idle
          break
        }
        case STATE.startErasing: {
          break
        }
      }
    })
  }

  return {
    run() {
      events()
      mount()
      controls()
    }
  }
}

app().run()
