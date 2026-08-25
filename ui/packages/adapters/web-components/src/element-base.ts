import type { PartContract } from './dom/part-contract'
import type { Spreader } from './dom/spread'
import { onXhConfigChange, withXhConfig } from './config'
import { validatePartContract } from './dom/part-contract'
import { containsPart, discoverParts } from './dom/parts'
import { createSpreader } from './dom/spread'
import { reportStackingTrap } from './dom/stacking-context'
import { XhReactiveElement } from './reactive'

let instanceSeq = 0

/**
 * 变动里是否真有角色节点进出。只认"进出的元素自身是角色节点、或其子树里有角色节点"：
 * 业务内容（图表、虚拟列表、面板里的业务 DOM）的增删与 part 集合无关，不该引发重新接线；
 * 更要紧的是断掉一条死循环——角色节点若本身是会在属性变化时改写自身子节点的自定义元素，
 * "宿主重新接线 → 写属性 → 该节点改子节点 → 又命中观察器" 会闭成环。
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

/**
 * 角色节点上属于作者的"声明"（与机器写上去的"状态"分属两侧），改了就等于换了一个条目，必须重新接线。
 * 只盯这几个而不是所有属性：wire() 每帧都往角色节点写 aria- 与 data-，全量观察等于自己触发自己。
 */
const AUTHORED_ATTRS = ['value', 'disabled', 'aria-disabled'] as const

function rewritesDeclaration(record: MutationRecord): boolean {
  if (record.type !== 'attributes' || !record.attributeName)
    return false
  const el = record.target as Element
  return containsPart(el) && (AUTHORED_ATTRS as readonly string[]).includes(record.attributeName)
}

// Light-DOM 行为宿主基类：不渲染结构，发现用户写的 data-xh-part 角色节点并往上打属性/事件。
export abstract class XhElement extends XhReactiveElement {
  /** 子类声明所属组件的解剖与元数据，接线后据它校验作者写的角色节点。 */
  static partContract?: PartContract

  protected readonly spreader: Spreader = createSpreader()
  protected partMap: Map<string, HTMLElement[]> = new Map()
  private partObserver: MutationObserver | undefined
  private readonly instanceId = `${++instanceSeq}`

  protected override createRenderRoot(): HTMLElement | DocumentFragment {
    return this // Light DOM，不建 shadowRoot
  }

  // 取角色节点，命名避开 HTMLElement.part。
  protected getPart(name: string, index = 0): HTMLElement | null {
    return this.partMap.get(name)?.[index] ?? null
  }

  protected getParts(name: string): HTMLElement[] {
    return this.partMap.get(name) ?? []
  }

  /** 接管前记下角色节点上作者写的内联 display。 */
  private readonly authorDisplay = new WeakMap<HTMLElement, string>()

  /**
   * 用内联 display 兜住收起态：作者层若给这个 part 声明了 display，会盖过 UA 的 `[hidden]{display:none}`，
   * 光靠 hidden 属性收不起来。展开时还回作者原本的内联值而不是清成 ''——后者会把作者写在该节点上的
   * `style="display:grid"` 一并抹掉，且再也回不来。
   */
  protected setPartHidden(el: HTMLElement | null, hidden: boolean): void {
    if (!el)
      return
    if (!this.authorDisplay.has(el))
      this.authorDisplay.set(el, el.style.display)
    el.style.display = hidden ? 'none' : (this.authorDisplay.get(el) ?? '')
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
    // 先知会子类再交还：release 会撤掉本机器写过的属性，身份标记（data-value 等）一并消失，之后就认不出离场的是哪个条目
    if (gone.length)
      this.onPartsReleased(gone)
    // 离开本宿主的角色节点必须交还：否则它带着本机器的属性与监听器走，被挪进另一台同类元素后
    // 会同时挂上两台机器的处理器（一次点击驱动两台）；单纯被移除的节点也仍能派事件、改本组状态
    for (const el of gone) this.spreader.release(el)
    this.partMap = next
  }

  /**
   * 角色节点即将离开本宿主时的回调，交还前调用（节点上还带着本机器写的标记）。
   * 承载焦点的节点被移除时浏览器不派 focusout（Chrome 如此），机器读不到这件事，需要焦点语义的子类在此如实上报。
   */
  protected onPartsReleased(_nodes: readonly HTMLElement[]): void {}

  override connectedCallback(): void {
    super.connectedCallback()
    this.observeParts()
    // 配置一变就重铺：文案、locale、尺寸档都可能从全局或某个 <xh-config> 进来
    this.stopConfigWatch ??= onXhConfigChange(() => this.requestUpdate())
    // 重连（元素在 DOM 中被移动）时 controller 会重建机器，但重建前后状态相同、cell 不 bump 版本，
    // 于是不会自动排更新——wire 不再跑，角色节点上仍挂着指向已停机器的处理器（送事件会被静默丢弃，等于全是死的）。
    // 这里显式排一次；首帧与基类的初次更新合并，不多跑一帧
    this.requestUpdate()
  }

  private stopConfigWatch: (() => void) | undefined

  /**
   * 把沿祖先链解析到的全局配置并进这份 props：translations 按组件名分桶合并，
   * locale 与 size 在元素上没给时取配置里的。不跑机器的元素在 wire() 里用它包一层。
   */
  protected configured<T extends object>(component: string, props: T): T {
    return withXhConfig(component, props, this)
  }

  /** 已排了断开后的交还，还没跑到。 */
  private releaseScheduled = false

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    this.stopConfigWatch?.()
    this.stopConfigWatch = undefined
    this.partObserver?.disconnect()
    this.partObserver = undefined
    this.scheduleRelease()
  }

  /**
   * 排一次断开后的交还，到微任务里再按 isConnected 决定跑不跑。
   * 元素被移动（remove 后同步 append 到别处）走的也是 disconnect，延到微任务才分得清移动与真离场。
   */
  private scheduleRelease(): void {
    if (this.releaseScheduled)
      return
    this.releaseScheduled = true
    queueMicrotask(() => {
      this.releaseScheduled = false
      if (!this.isConnected)
        this.releaseAllParts()
    })
  }

  /**
   * 交还全部角色节点并清空 partMap，重连时由 refreshParts 重新发现。
   * 宿主离场后没有观察器再触发更新，refreshParts 那条交还路径够不着，没摘的监听器会经节点钉住整台宿主。
   */
  private releaseAllParts(): void {
    const gone: HTMLElement[] = []
    for (const els of this.partMap.values()) gone.push(...els)
    if (!gone.length)
      return
    this.onPartsReleased(gone)
    for (const el of gone) this.spreader.release(el)
    this.partMap = new Map()
  }

  /** 层叠上下文那条诊断已经查过。 */
  private stackingChecked = false

  /**
   * 浮层首次展开后查一次祖先链有没有建层叠上下文，命中即投诊断。
   * 每个实例只查一次，重定位与后续展开不再重复。
   */
  private checkStackingTrap(scope: string | undefined): void {
    if (this.stackingChecked)
      return
    const positioner = this.getParts('positioner').find(el => el.dataset.state === 'open')
    if (!positioner)
      return
    this.stackingChecked = true
    reportStackingTrap(positioner, scope, this.instanceId)
  }

  /** 标记 wire() 正在写属性。 */
  private wiring = false

  /**
   * 作者在运行期改动 Light DOM 后重新接线，两类改动都要接住：增删角色节点（漏掉会留下没有
   * data-scope/data-part 与处理器的"死条目"）；原地改写节点上的声明（列表换数据复用节点时就是这形状，
   * 漏掉会留着上一轮写的 aria-selected="true"，而它自称的 value 已经变了，读屏念出的选中项就不是真的选中项）。
   */
  private observeParts(): void {
    if (this.partObserver)
      return
    this.partObserver = new MutationObserver((records) => {
      if (this.wiring)
        return
      const hit = records.some(r => (touchesParts(r) || rewritesDeclaration(r)) && this.ownsSubtree(r.target))
      if (hit)
        this.requestUpdate()
    })
    this.partObserver.observe(this, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [...AUTHORED_ATTRS],
    })
  }

  /** 目标是否归本宿主管：嵌套 xh-* 子树归内层元素自己管，外层不替它重跑 wire（discoverParts 本来也跳过它们）。 */
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
    // 断开的宿主机器已停机，再接线只会把指向死机器的监听器挂回去、覆盖已接管这些节点的存活宿主；
    // 重连时 connectedCallback 会排一轮补上
    if (!this.isConnected)
      return
    this.refreshParts()
    const contract = (this.constructor as typeof XhElement).partContract
    if (contract)
      validatePartContract(contract, this.partMap, this as unknown as HTMLElement, this.instanceId)
    // 观察器与 wire() 写的是同一批节点，不圈出本区间会自己触发自己；观察器回调是微任务，故圈到微任务排空为止。
    this.wiring = true
    try {
      this.wire()
    }
    finally {
      queueMicrotask(() => {
        this.wiring = false
      })
    }
    // 排在 wire() 之后：data-state 得先落进 DOM，才认得出浮层这一帧是不是展开的
    this.checkStackingTrap(contract?.anatomy.name)
  }

  /** 子类实现：把 connect 产出打到角色节点上。 */
  protected abstract wire(): void
}
