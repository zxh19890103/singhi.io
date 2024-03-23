const DANGEROUS_FIELDS = "__version,__event,isClearing,eventQ,listeners"

export type ChangableObjectEventType<E = never> =
  | "datachanged"
  | "selected"
  | "unselected"
  | "init"
  | E

export class ChangableObjectEvent {
  readonly type: string
  readonly payload: any
  readonly target: IChangableObject
  constructor(type: string, payload: any, target: any) {
    this.type = type
    this.payload = payload
    this.target = target
  }
}

export type ChangeableObjectEventHandler = (e: ChangableObjectEvent) => void

export abstract class ChangableObject<E extends string = never>
  implements IChangableObject
{
  id: string = ZERO_ID
  /**
   * @readonly
   */
  $listeners: Record<string, ChangeableObjectEventHandler[]> = {}
  /**
   * 内部维护的字段，可以访问到该数据所在集合
   * @readonly
   */
  public $set: IChangableObject = null

  /**
   * 用于事件限流
   * unit: 1/s
   */
  readonly notificationRate: number
  private lastEventOccurredAt: number
  private notifyingIsDisabled = false

  /**
   * 禁用通知
   */
  disableNotifying() {
    this.notifyingIsDisabled = true
  }

  /**
   * 开启通知
   */
  enableNotifying() {
    this.notifyingIsDisabled = false
  }

  copy(d: Record<string, unknown>, ...excludes: string[]) {
    // no private fields
    const keys = Object.keys(this)
    for (const key of keys) {
      if (
        DANGEROUS_FIELDS.indexOf(key) > -1 ||
        excludes.includes(key) ||
        d[key] === undefined
      ) {
        continue
      }
      this[key] = d[key]
    }
  }

  _notify(type: string, payload?: any) {
    if (notifyingIsDisabled || this.notifyingIsDisabled) return
    const now = performance.now()
    if (
      this.notificationRate > 0 &&
      now - this.lastEventOccurredAt < this.notificationRate
    )
      return
    pushEvent(new ChangableObjectEvent(type, payload, this))
    this.lastEventOccurredAt = now

    if (this.$set) {
      this.$set.notify(`item:${type}`, this)
    }
  }

  _on(type: string, listener: ChangeableObjectEventHandler) {
    const listeners = this.$listeners[type] || (this.$listeners[type] = [])
    if (listeners.indexOf(listener) > -1) return this
    listeners.push(listener)
    return this
  }

  listens(types: string, listener: ChangeableObjectEventHandler) {
    const typeArr = L.Util.splitWords(types)
    if (typeArr.length === 0) return
    for (const type of typeArr) {
      this._on(type, listener)
    }
  }

  unlistens(types: string, listener?: ChangeableObjectEventHandler) {
    const typeArr = L.Util.splitWords(types)
    if (typeArr.length === 0) return
    for (const type of typeArr) {
      this._off(type, listener)
    }
  }

  _off(type: string, listener?: ChangeableObjectEventHandler) {
    if (!this.$listeners[type]) return
    if (listener === undefined) {
      this.$listeners[type] = undefined
    }
    const items = this.$listeners[type]
    const index = items.findIndex((x) => x === listener)
    if (index === -1) return
    items.splice(index, 1)
    return this
  }

  _once(type: string, listener: ChangeableObjectEventHandler) {
    const wrap = (e: ChangableObjectEvent) => {
      this._off(type, wrap)
      listener(e)
    }
    this._on(type, wrap)
    return this
  }

  abstract update(d: any): void
  abstract init(d: any): this
}

export interface ChangableObject<E extends string = never> {
  on(
    type: ChangableObjectEventType<E>,
    listener: ChangeableObjectEventHandler,
  ): ChangableObject<E>
  off(
    type: ChangableObjectEventType<E>,
    listener?: ChangeableObjectEventHandler,
  ): ChangableObject<E>
  once(
    type: ChangableObjectEventType<E>,
    listener: ChangeableObjectEventHandler,
  ): ChangableObject<E>
  notify(type: ChangableObjectEventType<E>, payload?: any): void
}

export interface IChangableObject {
  id: string
  $set: IChangableObject
  $listeners: Record<string, ChangeableObjectEventHandler[]>
  update(d: any): void
  init(d: any): unknown
  notify(e: string, payload?: any): void
  on(type: string, listener: (...args: any[]) => void): void
  off(type: string, listener?: (...args: any[]) => void): void
  once(type: string, listener: (...args: any[]) => void): void
  onAdded?(context?: IChangableObject): void
  onRemoved?(context?: IChangableObject): void
}
