import type { Anatomy } from '@xihan-ui/core'
import type { ActiveElementRef, AdapterEvent, DomSnapshot, PartSnapshot } from '../conformance/types'
import { normalizeAttrs } from './normalize'

export interface CollectOptions {
  doc: Document
  component: string
  anatomy: Anatomy<string>
  events: readonly AdapterEvent[]
}

/** 从整个 document 采集某组件的归一化快照（portal 出去的内容也能拿到）。 */
export function collectDomSnapshot(opts: CollectOptions): DomSnapshot {
  const { doc, component, anatomy, events } = opts
  const partSet = new Set<string>(anatomy.parts)
  // 整文档查询：portal/teleport 出去的 part 不在挂载根内，必须从 document 找
  const nodes = [...doc.querySelectorAll<HTMLElement>(`[data-scope="${component}"][data-part]`)]

  const buckets = new Map<string, HTMLElement[]>()
  const stray: string[] = []
  for (const el of nodes) {
    const part = el.dataset.part
    if (part == null)
      continue
    if (!partSet.has(part)) {
      stray.push(part)
      continue
    }
    const arr = buckets.get(part)
    if (arr)
      arr.push(el)
    else
      buckets.set(part, [el])
  }

  const parts: Record<string, PartSnapshot[]> = {}
  const indexOf = new Map<HTMLElement, { part: string, index: number }>()
  for (const [part, els] of buckets) {
    parts[part] = els.map((el, i) => {
      indexOf.set(el, { part, index: i })
      return {
        attrs: normalizeAttrs(el, buckets),
        classNames: [...new Set(el.classList)].sort(),
      }
    })
  }

  return {
    parts,
    order: orderByDocument(nodes, indexOf, buckets),
    activeElement: resolveActiveElement(doc, indexOf),
    events,
    strayParts: [...new Set(stray)].sort(),
  }
}

function orderByDocument(
  nodes: readonly HTMLElement[],
  indexOf: Map<HTMLElement, { part: string, index: number }>,
  buckets: Map<string, HTMLElement[]>,
): string[] {
  const order: string[] = []
  for (const el of nodes) {
    const hit = indexOf.get(el)
    if (!hit)
      continue
    const single = (buckets.get(hit.part)?.length ?? 0) === 1
    order.push(single ? hit.part : `${hit.part}[${hit.index}]`)
  }
  return order
}

/** 焦点落点语义定死为：activeElement 最近的 part 祖先（含自身）。 */
function resolveActiveElement(
  doc: Document,
  indexOf: Map<HTMLElement, { part: string, index: number }>,
): ActiveElementRef | null {
  const ae = doc.activeElement as HTMLElement | null
  if (!ae || ae === doc.body)
    return null
  const host = ae.closest<HTMLElement>('[data-scope][data-part]')
  if (!host)
    return null
  const hit = indexOf.get(host)
  return hit ? { part: hit.part, index: hit.index, exact: host === ae } : null
}
