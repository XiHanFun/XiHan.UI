// 自定义元素注册表：幂等 + fail-closed，且惰性——无 DOM 环境（Node）直接跳过，不崩。
const REGISTRY_KEY = '__XIHAN_UI_WC__'

interface Entry {
  version: string
  ctor: CustomElementConstructor
}

function registry(): Map<string, Entry> {
  const g = globalThis as Record<string, unknown>
  return (g[REGISTRY_KEY] ??= new Map<string, Entry>()) as Map<string, Entry>
}

export function defineElement(tag: string, ctor: CustomElementConstructor, version: string): void {
  // 无 customElements（DOM-less Node）：静默跳过，主入口 import 才能不崩
  if (typeof customElements === 'undefined')
    return
  const reg = registry()
  const prev = reg.get(tag)
  if (prev) {
    if (prev.version === version)
      return
    throw new Error(`[xihan-ui] ${tag} 已注册版本 ${prev.version}，拒绝以 ${version} 重复注册`)
  }
  if (customElements.get(tag))
    throw new Error(`[xihan-ui] 标签 ${tag} 已被非 XiHan.UI 代码占用`)
  reg.set(tag, { version, ctor })
  customElements.define(tag, ctor)
}
