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

/**
 * 部件 id 的构造式：`<组件>:<实例>:<部件>`（见各适配器的 IdGenerator.partId）。
 * 中段是宿主生成的实例标识，逐家不同——Vue 是 `v-0`，React 是 `_r_1_`。
 */
const SCOPED_ID = /^([a-z0-9-]+):.+:([a-z0-9-]+)$/

function resolveIdref(id: string, buckets: Map<string, HTMLElement[]>): string {
  for (const [part, els] of buckets) {
    const i = els.findIndex(el => el.id === id)
    if (i >= 0)
      return els.length === 1 ? `@part(${part})` : `@part(${part}[${i}])`
  }
  // 指向的节点此刻不在文档里（浮层收起时的 aria-controls 就是这样）。
  // 是部件 id 就把实例那一段抹掉：留着它，逐帧对拍比的是两家生成器的取名规则而不是行为。
  // 作者自己写的 id 不长这个形状，原样留着。
  const scoped = SCOPED_ID.exec(id)
  return scoped ? `@extern(${scoped[1]}:*:${scoped[2]})` : `@extern(${id})`
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

function isFormPathDeclaration(el: HTMLElement, name: string): boolean {
  return name === 'name'
    && el.dataset.scope === 'form'
    && (el.dataset.part === 'field-group' || el.dataset.part === 'error-summary-item')
}

/** 采集单个元素的归一化属性表（键已排序）。 */
export function normalizeAttrs(el: HTMLElement, buckets: Map<string, HTMLElement[]>): Record<string, string | null> {
  const out: Record<string, string | null> = {}
  for (const name of collectedNames(el)) {
    // WC 的 Light DOM 用原生 name 属性声明 FormPath，Vue/React 将同名 prop 消费掉、不落 DOM。
    // 两侧最终状态都由 data-name / data-form-path 表达；声明介质不参与跨适配器快照。
    const raw = isFormPathDeclaration(el, name) ? null : el.getAttribute(name)
    out[name] = normalizeValue(name, raw, buckets)
  }
  return out
}
