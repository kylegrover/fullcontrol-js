export type FCConstructor<T=any> = { new (...args:any[]): T; typeName?: string }

const registry = new Map<string, FCConstructor>()

export function register(cls: FCConstructor) {
  const name = (cls as any).typeName || cls.name
  if (!name) throw new Error('Cannot register class without name')
  registry.set(name, cls)
}

export function get_registered(name: string) { return registry.get(name) }
export function list_registered() { return [...registry.keys()] }
export function register_many(list: FCConstructor[]) { for (const c of list) register(c) }
