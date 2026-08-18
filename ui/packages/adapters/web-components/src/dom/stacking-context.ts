// 层叠上下文诊断：浮层在 Light DOM 原地渲染，祖先只要建了层叠上下文，
// 浮层的层号就退化成那个上下文里的局部序号，会被上层兄弟盖住。
import { DIAGNOSTIC_CODES, getDiagnostics, reportDiagnostic } from '@xihan-ui/kernel'

/** 命中层叠上下文判据的那条属性。 */
export interface StackingCause {
  /** CSS 属性名。 */
  readonly property: string
  /** 该属性的计算值。 */
  readonly value: string
}

/** 困住浮层的那个祖先，与它命中的那条属性。 */
export interface StackingTrap {
  readonly ancestor: HTMLElement
  readonly cause: StackingCause
}

/** 初始值是 none 的一批：取任何别的值都建层叠上下文。 */
const NONE_INITIAL = [
  'transform',
  'translate',
  'rotate',
  'scale',
  'perspective',
  'filter',
  'backdrop-filter',
  'clip-path',
  'mask-image',
  'view-transition-name',
] as const

/** 建层叠上下文的那几档 contain；单独的 size 与 style 不算。 */
const CONTAIN = /\b(?:layout|paint|strict|content)\b/

/** container-type 只有带 size 的两档施加布局限制；normal 与 scroll-state 不算。 */
const CONTAINER_TYPE = /\bsize\b/

/** will-change 点到这些属性时，元素照样建层叠上下文。前缀能覆盖 transform-style、backdrop-filter、mask-image 等派生名。 */
const WILL_CHANGE = /\b(?:transform|translate|rotate|scale|perspective|filter|opacity|mix-blend-mode|isolation|clip-path|mask|contain|content-visibility|container-type|view-transition-name)\b/

const FLEX_OR_GRID = /^(?:inline-)?(?:flex|grid)$/

/** 未设置的属性在部分无头 DOM 实现里回空串而不是初始值，两者一并当没设。 */
function unset(value: string, initial: string): boolean {
  return value === '' || value === initial
}

/** 元素标识：标签名 + id + 前几个类名，够在页面里认出是哪一个。 */
export function describeElement(el: Element): string {
  const id = el.id ? `#${el.id}` : ''
  const names = Array.from(el.classList)
  const cls = names.length ? `.${names.slice(0, 3).join('.')}${names.length > 3 ? '…' : ''}` : ''
  return `${el.tagName.toLowerCase()}${id}${cls}`
}

/**
 * 这个元素建不建层叠上下文。命中即回那条属性与取值。
 * 判据与「抢走包含块」不同：position 本身与 z-index 在这里算数，而 container-type 收窄到带 size 的两档。
 */
export function stackingCauseOf(el: HTMLElement): StackingCause | null {
  const view = el.ownerDocument.defaultView
  if (!view)
    return null
  const style = view.getComputedStyle(el)
  const read = (property: string): string => style.getPropertyValue(property)
  const cause = (property: string): StackingCause => ({ property, value: read(property) })

  for (const property of NONE_INITIAL) {
    if (!unset(read(property), 'none'))
      return cause(property)
  }
  if (read('transform-style') === 'preserve-3d')
    return cause('transform-style')
  const opacity = Number.parseFloat(read('opacity'))
  if (Number.isFinite(opacity) && opacity < 1)
    return cause('opacity')
  if (!unset(read('mix-blend-mode'), 'normal'))
    return cause('mix-blend-mode')
  if (read('isolation') === 'isolate')
    return cause('isolation')
  if (CONTAIN.test(read('contain')))
    return cause('contain')
  if (/^(?:auto|hidden)$/.test(read('content-visibility')))
    return cause('content-visibility')
  if (CONTAINER_TYPE.test(read('container-type')))
    return cause('container-type')
  if (WILL_CHANGE.test(read('will-change')))
    return cause('will-change')

  const position = read('position')
  if (position === 'fixed' || position === 'sticky')
    return cause('position')
  if (unset(read('z-index'), 'auto'))
    return null
  if (position === 'relative' || position === 'absolute')
    return cause('z-index')
  // flex/grid 子项的 z-index 不必定位也生效
  const parent = el.parentElement
  if (parent && FLEX_OR_GRID.test(view.getComputedStyle(parent).display))
    return cause('z-index')
  return null
}

/**
 * 从浮层往上找第一个建层叠上下文的祖先，走到 body 为止。
 * 撞上外层浮层的 positioner 即止步：那一层由它自己的宿主去查。
 * body 与 documentElement 不算：页面内容与浮层同在其中，相对次序不受影响，
 * 而滚动锁本来就会给 body 写上 position: fixed。
 */
export function findStackingTrap(positioner: HTMLElement): StackingTrap | null {
  const doc = positioner.ownerDocument
  const stop = doc.body ?? doc.documentElement
  for (let node = positioner.parentElement; node && node !== stop; node = node.parentElement) {
    if (node.dataset.part === 'positioner')
      return null
    const cause = stackingCauseOf(node)
    if (cause)
      return { ancestor: node, cause }
  }
  return null
}

/**
 * 浮层展开后查一次祖先链，被层叠上下文困住就投诊断。
 * 通道静默时直接返回，不做扫描。
 */
export function reportStackingTrap(positioner: HTMLElement, scope: string | undefined, instanceId: string): void {
  if (getDiagnostics().getLevel() === 'silent')
    return
  const trap = findStackingTrap(positioner)
  if (!trap)
    return
  const where = describeElement(trap.ancestor)
  const { property, value } = trap.cause
  reportDiagnostic({
    code: DIAGNOSTIC_CODES.overlayStackingTrap,
    level: 'warn',
    message: `浮层的祖先 <${where}> 用 ${property}: ${value} 建了层叠上下文，浮层的层号只在它内部有效，会被上层兄弟盖住；去掉该祖先这条属性，或别把浮层放进这类容器`,
    scope,
    instanceId,
    part: 'positioner',
    node: trap.ancestor,
    detail: { ancestor: where, property, value },
  })
}
