import type { Spreader } from './dom/spread'
import { ReactiveElement } from '@lit/reactive-element'
import { containsPart, discoverParts } from './dom/parts'
import { createSpreader } from './dom/spread'

/**
 * 变动里是否真有角色节点进出。只认"进出的元素自身是角色节点、或其子树里有角色节点"：
 * - 业务内容（图表、虚拟列表、面板里的业务 DOM）的增删与 part 集合无关，不该引发重新接线；
 * - 更要紧的是断掉一条回路：角色节点若本身是会在属性变化时改写自身子节点的自定义元素，
 *   "宿主重新接线 → 写属性 → 该节点改子节点 → 又命中观察器"会闭成死循环。
 *
 * 空壳容器先插入、随后才填入角色节点的情形不会漏：填入那一刻是另一条 childList 变动，
 * 那条记录里的新增节点自带角色标记，照样命中。
 */
function touchesParts(record: MutationRecord): boolean {
  for (const list of [record.addedNodes, record.removedNodes]) {
    for (const node of Array.from(list)) {
      if (node.nodeType === 1 && containsPart(node as Element))
        return true
    }
  }
  return false
}

// Light-DOM 行为宿主基类：不渲染结构，发现用户写的 data-xh-part 角色节点并往上打属性/事件。
export abstract class XhElement extends ReactiveElement {
  protected readonly spreader: Spreader = createSpreader()
  protected partMap: Map<string, HTMLElement[]> = new Map()
  private partObserver: MutationObserver | undefined

  protected override createRenderRoot(): HTMLElement | DocumentFragment {
    return this // Light DOM，不建 shadowRoot
  }

  // 命名避开 HTMLElement.part（shadow part 属性），改用 getPart/getParts。
  protected getPart(name: string, index = 0): HTMLElement | null {
    return this.partMap.get(name)?.[index] ?? null
  }

  protected getParts(name: string): HTMLElement[] {
    return this.partMap.get(name) ?? []
  }

  protected refreshParts(): void {
    const next = discoverParts(this as unknown as HTMLElement)
    const live = new Set<HTMLElement>()
    for (const els of next.values()) {
      for (const el of els) live.add(el)
    }
    const gone: HTMLElement[] = []
    for (const els of this.partMap.values()) {
      for (const el of els) {
        if (!live.has(el))
          gone.push(el)
      }
    }
    // 先知会子类再交还：release 会撤掉本机器写过的属性，身份标记（data-value 等）
    // 一并消失，之后就认不出离场的是哪个条目了。
    if (gone.length)
      this.onPartsReleased(gone)
    // 离开本宿主的角色节点要交还：否则它带着本机器的属性与监听器走，
    // 被挪进另一台同类元素后会同时挂上两台机器的处理器（一次点击驱动两台）；
    // 单纯被移除的节点也仍能派事件、改本组状态。
    for (const el of gone) this.spreader.release(el)
    this.partMap = next
  }

  /**
   * 角色节点即将离开本宿主时的回调，交还前调用（节点上还带着本机器写的标记）。
   * 焦点是 DOM 事实：承载焦点的节点被移除时浏览器不派 focusout（Chrome 如此），
   * 机器读不到这件事，需要焦点语义的子类在此如实上报。
   */
  protected onPartsReleased(_nodes: readonly HTMLElement[]): void {}

  override connectedCallback(): void {
    super.connectedCallback()
    this.observeParts()
    // 重连（元素在 DOM 中被移动）时 controller 会重建机器，但重建后的状态与重建前相同，
    // cell 不 bump 版本，于是不会自动排更新——wire 不再跑，角色节点上仍挂着指向
    // 已停机器的处理器（送事件在 dev 下抛 SEND_AFTER_STOP、生产下被静默吞掉）。
    // 这里显式排一次更新把处理器换成新机器的；首帧与 Lit 自己的初次更新合并，不多跑一帧。
    this.requestUpdate()
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    this.partObserver?.disconnect()
    this.partObserver = undefined
  }

  /**
   * 作者在运行期往 Light DOM 增删角色节点后重新接线。
   * Vue 侧条目是组件，增删即带全套 props 渲染；WC 侧不看着点就会留下"死条目"——
   * 没有 data-scope/data-part/data-value 与事件处理器，集合查询也看不见它。
   *
   * **只观察 childList**：wire() 会往角色节点写属性，一并观察 attributes 就会自触发成死循环。
   */
  private observeParts(): void {
    if (this.partObserver)
      return
    this.partObserver = new MutationObserver((records) => {
      if (records.some(r => touchesParts(r) && this.ownsSubtree(r.target)))
        this.requestUpdate()
    })
    this.partObserver.observe(this, { childList: true, subtree: true })
  }

  /** 嵌套 xh-* 子树归内层元素自己管，外层不替它重跑 wire（discoverParts 本来也跳过它们）。 */
  private ownsSubtree(target: Node): boolean {
    for (let node: Node | null = target; node; node = node.parentNode) {
      if (node === this)
        return true
      const tag = (node as Element).tagName
      if (typeof tag === 'string' && tag.toLowerCase().startsWith('xh-'))
        return false
    }
    return false
  }

  protected override updated(changed: Map<PropertyKey, unknown>): void {
    super.updated(changed)
    this.refreshParts()
    this.wire()
  }

  /** 子类实现：把 connect 产出打到角色节点上。 */
  protected abstract wire(): void
}
