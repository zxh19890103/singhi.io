let __currentZoneFrame = { parent: null, zone: null }

class Zone {
  constructor(name = "no", host = null) {
    this.host = host
    this.name = name
  }
  run(fn) {
    __currentZoneFrame = { parent: __currentZoneFrame, zone: this }
    fn()
    __currentZoneFrame = __currentZoneFrame.parent
  }
  fork(name = "fork") {
    const child = new Zone(name, this)
    return child
  }
}

const root = new Zone("root")

__currentZoneFrame = { parent: __currentZoneFrame, zone: root }

Object.defineProperty(Zone, 'current', {
  get: () => {
    return __currentZoneFrame.zone
  }
})

const parent = Zone.current.fork("parent")
const child = parent.fork("child")

const sub = () => {
  console.log('in sub', Zone.current.name)
}

const task = () => {
  console.log('in task', Zone.current.name)
  setTimeout(() => {
    console.log('in setTimeout callback', Zone.current.name)
  }, 2000)
  child.run(sub)
}

parent.run(task)
