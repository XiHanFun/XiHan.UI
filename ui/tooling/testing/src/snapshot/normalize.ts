// 属性采集与归一化：抹掉适配器痕迹，把 IDREF 翻译成 part 引用。

/** 恒采集的结构/状态属性；元素上没写也记为 null。 */
const BASE_ATTRS = ['role', 'tabindex', 'type', 'disabled', 'readonly', 'inputmode', 'name', 'hidden', 'inert', 'popover', 'dir', 'for'] as const

/** IDREF 类属性：值是 id，翻译成 @part(...)。 */
const IDREF_ATTRS = new Set([
  'aria-labelledby',
  'aria-describedby',
  'aria-controls',
  'aria-owns',
  'aria-activedescendant',
  'aria-details',
  'aria-errormessage',
  'for',
])

/** 适配器噪音与结构标记（含 WC 的 data-xh-*）：不进快照。 */
const ADAPTER_NOISE = /^data-(?:v-[0-9a-f]{6,8}|server-rendered|defer-hydration|lit-|reactroot$|scope$|part$|xh-)/

function collectedNames(el: Element): string[] {
  const names = new Set<string>(BASE_ATTRS)
  for (const n of el.getAttributeNames()) {
    if (n === 'id' || n.startsWith('aria-'))
      names.add(n)
    else if (n.startsWith('data-') && !ADAPTER_NOISE.test(n))
      names.add(n)
  }
  return [...names].sort()
}

function resolveIdref(id: string, buckets: Map<string, HTMLElement[]>): string {
  for (const [part, els] of buckets) {
    const i = els.findIndex(el => el.id === id)
    if (i >= 0)
      return els.length === 1 ? `@part(${part})` : `@part(${part}[${i}])`
  }
  return `@extern(${id})`
}

function normalizeValue(name: string, raw: string | null, buckets: Map<string, HTMLElement[]>): string | null {
  if (raw == null)
    return null
  if (name === 'id')
    return '@self'
  if (!IDREF_ATTRS.has(name))
    return raw
  return raw.split(/\s+/).filter(Boolean).map(id => resolveIdref(id, buckets)).join(' ')
}

/** 采集单个元素的归一化属性表（键已排序）。 */
export function normalizeAttrs(el: HTMLElement, buckets: Map<string, HTMLElement[]>): Record<string, string | null> {
  const out: Record<string, string | null> = {}
  for (const name of collectedNames(el))
    out[name] = normalizeValue(name, el.getAttribute(name), buckets)
  return out
}
