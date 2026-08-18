// Portal 落点：body 末尾的单一浮层容器，自身不写样式，不建层叠上下文与包含块。
import { PORTAL_ROOT_ID } from '../constants'
import { createPerDocumentRegistry } from './per-document-registry'

interface PortalRootSlot {
  current: HTMLElement | null
}

const registry = createPerDocumentRegistry<PortalRootSlot>(() => ({ current: null }))

/** 取文档里现成的落点，没有就新建一个挂到 body 末尾。 */
function resolvePortalRoot(doc: Document): HTMLElement {
  const existing = doc.getElementById(PORTAL_ROOT_ID)
  if (existing)
    return existing
  const el = doc.createElement('div')
  el.id = PORTAL_ROOT_ID
  doc.body.appendChild(el)
  return el
}

/** 取该 document 的 portal 落点；缓存的节点已脱离文档时重建。 */
export function ensurePortalRoot(doc: Document): HTMLElement {
  const slot = registry.get(doc)
  let root = slot.current
  if (!root || !root.isConnected) {
    root = resolvePortalRoot(doc)
    slot.current = root
  }
  return root
}
