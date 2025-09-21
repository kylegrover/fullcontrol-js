// Lightweight analogue of Python BaseModelPlus (pydantic)
export interface InitObject<T> { [key: string]: any }

export abstract class BaseModelPlus {
  // Accept partial init object; assign only known keys if enforceKeys provided
  constructor(init?: InitObject<any>, enforceKeys?: readonly string[]) {
    if (init) {
      for (const k of Object.keys(init)) {
        if (!enforceKeys || enforceKeys.includes(k)) {
          (this as any)[k] = init[k]
        } else {
          // mimic Python strictness with an error
          throw new Error(`attribute "${k}" not allowed for class ${this.constructor.name}`)
        }
      }
    }
  }

  updateFrom(source: any) {
    if (!source) return
    for (const [k, v] of Object.entries(source)) {
      if (v !== undefined && Object.prototype.hasOwnProperty.call(this, k)) {
        ;(this as any)[k] = v
      }
    }
  }

  copy<T extends this>(): T {
    const clone = Object.create(this.constructor.prototype)
    for (const [k, v] of Object.entries(this)) (clone as any)[k] = structuredClone(v)
    return clone
  }
}
