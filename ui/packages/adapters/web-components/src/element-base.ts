/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 element base 相关实现。

import type { FieldControlWiring, StructureChild } from '@xihan-ui/headless'
import type { PartContract } from './dom/part-contract'
import type { Spreader } from './dom/spread'
import type { StructureSpec } from './dom/structure'
import type { FieldTarget } from './runtime/form-control-host'
import { GHOST_ATTR } from '@xihan-ui/core'
import { fieldGroupAttrs, fieldStateAttrs, withFieldDescription, withFieldLabel } from '@xihan-ui/headless'
import { onXhConfigChange, withXhConfig } from './config'
import { mergeAsChildProps } from './dom/as-child'
import { validatePartContract } from './dom/part-contract'
import { containsPart, discoverParts, PART_OWNER_ATTR } from './dom/parts'
import { createSpreader } from './dom/spread'
import { reportStackingTrap } from './dom/stacking-context'
import { createStructureState, hasSlotContent, slotAttrOf, syncStructure } from './dom/structure'
import { XhReactiveElement } from './reactive'

let instanceSeq = 0

/**
 * 元素的标准结构：作者没写结构时元素按它生成，规则见 dom/structure.ts 的 syncStructure。
 * build 按宿主当前状态算出 root 的子树（通常就是调 headless 的结构函数），taken 是作者已经写了的可接管部件；
 * 状态还算不出时返回 undefined，这一轮不动。
 */
export interface ElementStructure<H> extends StructureSpec {
  readonly build: (host: H, taken: ReadonlySet<string>) => readonly StructureChild[] | undefined
}

/**
 * 变动中是否真有角色节点进出。只认进出的元素自身是角色节点、或其子树中有角色节点：
 * 业务内容（图表、虚拟列表、面板中的业务 DOM）的增删与 part 集合无关，不应引发重新接线；
 * 更重要的是切断一条死循环：角色节点若本身是会在属性变化时改写自身子节点的自定义元素，
 * 宿主重新接线、写属性、该节点改子节点、再次命中观察器会形成环。
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
 * 角色节点上属于作者的声明（与状态机写入的状态分属两侧），改变即等于更换了一个条目，必须重新接线。
 * 只观察这几个而不是所有属性：wire() 每帧都向角色节点写 aria- 与 data-，全量观察等于自己触发自己。
 */
const AUTHORED_ATTRS = ['value', 'name', 'data-path', 'disabled', 'aria-disabled'] as const

function rewritesDeclaration(record: MutationRecord): boolean {
  if (record.type !== 'attributes' || !record.attributeName)
    return false
  const el = record.target as Element
  return containsPart(el) && (AUTHORED_ATTRS as readonly string[]).includes(record.attributeName)
}

/** 两份字段接线是否相同：字段每帧都下发，相同时不再排更新。 */
function sameWiring(a: FieldControlWiring | undefined, b: FieldControlWiring | undefined): boolean {
  if (!a || !b)
    return a === b
  return a.labelId === b.labelId && a.describedBy === b.describedBy && a.invalid === b.invalid
    && a.required === b.required && a.readOnly === b.readOnly
}

// Light-DOM 行为宿主基类：不渲染结构，发现用户写的 data-xh-part 角色节点并往上打属性/事件。
export abstract class XhElement extends XhReactiveElement {
  /** 子类声明所属组件的解剖与元数据，接线后据它校验作者写的角色节点。 */
  static partContract?: PartContract

  /** 库内表单控件声明：放进 `<xh-field>` 时字段接线并进哪几个部件。没声明的元素不接字段接线。 */
  static fieldTarget?: FieldTarget

  /** 标准结构声明；没声明的元素照旧由作者全写。 */
  static structure?: ElementStructure<never>

  /**
   * 结构里组合进来的库内元素：标签 → 元素类（类引用，打包时随宿主带上）。按需注册宿主时沿它递归注册。
   * 只登记真正生成了实例的元素；委派（把内嵌组件的部件摊在自己的 Light DOM 里接线）不在其列。
   */
  static dependencies?: Readonly<Record<string, CustomElementConstructor>>

  private readonly structureState = createStructureState()

  /** 作者有没有给标准结构的这个插槽写内容（宿主直接子节点上的 `slot="<name>"` / `slot="<name>:<key>"`）：结构函数的 slotted 照它答。 */
  protected slotted(name: string, key?: string): boolean {
    return hasSlotContent(this as unknown as HTMLElement, this.structureState, slotAttrOf({ name, key }))
  }

  private fieldWiring: FieldControlWiring | undefined

  /** `<xh-field>` 发现作用域内的库内控件后调用，undefined 收回；不是公开的业务写值入口。 */
  setFieldWiring(wiring: FieldControlWiring | undefined): void {
    if (sameWiring(this.fieldWiring, wiring))
      return
    this.fieldWiring = wiring
    this.requestUpdate()
  }

  /**
   * 这份属性铺的是本元素声明的接线目标部件时，把字段接线并进去：部件自己的属性在后，同名以部件为准；
   * 描述链与名字链两边拼起来，字段的在前。
   */
  private withFieldWiring(props: Record<string, unknown>): Record<string, unknown> {
    const wiring = this.fieldWiring
    const ctor = this.constructor as typeof XhElement
    const target = ctor.fieldTarget
    if (!wiring || !target || !this.acceptsFieldWiring() || props['data-scope'] !== ctor.partContract?.anatomy.name)
      return props
    if (!target.parts.includes(props['data-part'] as string))
      return props
    const attrs = target.kind === 'state' ? fieldStateAttrs(wiring) : fieldGroupAttrs(wiring)
    return withFieldLabel(withFieldDescription({ ...attrs, ...props }, wiring.describedBy), wiring.labelId)
  }

  /** 声明的接线目标此刻是否承接字段接线；目标部件随状态失去角色时子类返回 false。 */
  protected acceptsFieldWiring(): boolean {
    return true
  }

  private readonly ownSpreader: Spreader = createSpreader()
  /**
   * 子类经它往角色节点上铺属性。节点若是嵌套组件当的部件（asChild）合进去的那个根节点，
   * 这份接线转交给那台组件，由它与自己的根属性合并后一次铺上——两台 spreader 不同时写一个节点。
   */
  protected readonly spreader: Spreader = {
    spread: (node, own) => {
      const props = this.withFieldWiring(own)
      const host = this.asChildHosts.get(node)
      if (host)
        host.acceptAsChild(this, props)
      else
        this.ownSpreader.spread(node, props)
    },
    release: (node) => {
      if (node instanceof XhElement && node !== this) {
        for (const [target, host] of this.asChildHosts) {
          if (host === node)
            this.asChildHosts.delete(target)
        }
        node.acceptAsChild(this, null)
        return
      }
      const host = this.asChildHosts.get(node)
      if (host) {
        this.asChildHosts.delete(node)
        host.acceptAsChild(this, null)
        return
      }
      this.ownSpreader.release(node)
    },
  }

  protected partMap: Map<string, HTMLElement[]> = new Map()
  private partObserver: MutationObserver | undefined
  private readonly instanceId = `${++instanceSeq}`

  protected override createRenderRoot(): HTMLElement | DocumentFragment {
    return this // Light DOM，不建 shadowRoot
  }

  // 取角色节点，命名避开 HTMLElement.part。
  protected getPart(name: string, index = 0): HTMLElement | null {
    const el = this.partMap.get(name)?.[index]
    return el ? this.resolvePart(el) : null
  }

  protected getParts(name: string): HTMLElement[] {
    const out: HTMLElement[] = []
    for (const el of this.partMap.get(name) ?? []) {
      const resolved = this.resolvePart(el)
      if (resolved)
        out.push(resolved)
    }
    return out
  }

  // —— asChild：作者把一台嵌套组件（如 <xh-button data-xh-part="trigger">）当作本宿主的部件 —— //

  /** 本元素被外层当部件时，外层接线合进哪个节点；缺省不接受，能当部件的组件（按钮）覆盖它。 */
  protected asChildTarget(): HTMLElement | null {
    return null
  }

  /** 外层交来的部件接线：外层 → 那份属性，铺 asChildTarget 时与自己的属性合并。 */
  private readonly asChildOwners = new Map<XhElement, Record<string, unknown>>()
  /** 外层来取时本元素还没发现根节点：等接线完再叫它们重新接一轮。 */
  private readonly asChildWaiting = new Set<XhElement>()
  /** 本宿主当部件用的嵌套组件：真正被写的那个节点 → 那台组件。 */
  private readonly asChildHosts = new Map<HTMLElement, XhElement>()

  /**
   * 部件表里记的是作者声明的节点；嵌套组件当的部件要换成它合并接线的那个根节点：
   * 定位锚点、焦点归还、点外部判定都落在真正可交互的节点上。还没升级或还没就绪时先当它不在，就绪后重新接线。
   */
  private resolvePart(el: HTMLElement): HTMLElement | null {
    if (!el.localName.startsWith('xh-') || el === this)
      return el
    if (!(el instanceof XhElement)) {
      void customElements.whenDefined(el.localName).then(() => this.requestUpdate())
      return null
    }
    const target = el.asChildTarget()
    if (!target) {
      el.asChildWaiting.add(this)
      return null
    }
    this.asChildHosts.set(target, el)
    return target
  }

  /** 外层交来（或撤回）一份部件接线，重新铺一轮把它合进去。 */
  private acceptAsChild(owner: XhElement, props: Record<string, unknown> | null): void {
    if (props)
      this.asChildOwners.set(owner, props)
    else if (!this.asChildOwners.delete(owner))
      return
    this.requestUpdate()
  }

  /** 子类铺 asChildTarget 时用它包一层：外层交来的接线按 asChild 规则合进自己的那份。 */
  protected withAsChild(own: Record<string, unknown>): Record<string, unknown> {
    let merged = own
    for (const props of this.asChildOwners.values())
      merged = mergeAsChildProps(props, merged)
    return merged
  }

  /**
   * 仍归本实例所有、但为脱离祖先层叠上下文而迁移到 Portal 的角色根。
   * 默认没有；返回的根必须与宿主属于同一 Document。
   */
  protected externalPartRoots(): readonly HTMLElement[] {
    return []
  }

  /** 接管前记下角色节点上作者写的内联 display。 */
  private readonly authorDisplay = new WeakMap<HTMLElement, string>()

  /**
   * 用内联 display 保证收起态：作者层若为该 part 声明了 display，会覆盖 UA 的 `[hidden]{display:none}`，
   * 仅靠 hidden 属性无法收起。展开时恢复作者原本的内联值而不是清为 ''：后者会把作者写在该节点上的
   * `style="display:grid"` 一并清除，且无法恢复。
   */
  protected setPartHidden(el: HTMLElement | null, hidden: boolean): void {
    if (!el)
      return
    if (!this.authorDisplay.has(el))
      this.authorDisplay.set(el, el.style.display)
    el.style.display = hidden ? 'none' : (this.authorDisplay.get(el) ?? '')
  }

  protected refreshParts(): void {
    const externalRoots = this.externalPartRoots()
    const ownerDocument = this.ownerDocument
    for (const root of externalRoots) {
      if (root.ownerDocument !== ownerDocument)
        throw new Error('[xh] Web Component 的 Portal 角色根必须与宿主属于同一 Document')
    }
    const next = discoverParts(this as unknown as HTMLElement, externalRoots)
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
    // 嵌套组件当的部件可能换了根节点：映射在接线时经 getPart 重新建立
    this.asChildHosts.clear()
    this.partMap = next
    this.syncPartObservers()
  }

  /**
   * 角色节点即将离开本宿主时的回调，交还前调用（节点上仍带着本状态机写入的标记）。
   * 承载焦点的节点被移除时浏览器不派发 focusout（Chrome 如此），状态机无法得知，需要焦点语义的子类在此如实上报。
   */
  protected onPartsReleased(_nodes: readonly HTMLElement[]): void {}

  override connectedCallback(): void {
    super.connectedCallback()
    this.observeParts()
    // 配置一变就重铺：文案、locale、尺寸档都可能从全局或某个 <xh-config> 进来
    this.stopConfigWatch ??= onXhConfigChange(() => this.requestUpdate(), this)
    // 重连（元素在 DOM 中被移动）时 controller 会重建机器，但重建前后状态相同、cell 不 bump 版本，
    // 于是不会自动排更新——wire 不再跑，角色节点上仍挂着指向已停机器的处理器（送事件会被静默丢弃，等于全是死的）。
    // 这里显式排一次；首帧与基类的初次更新合并，不多跑一帧
    this.requestUpdate()
  }

  private stopConfigWatch: (() => void) | undefined
  private hostNamingWatch: MutationObserver | undefined

  /**
   * 宿主上的 aria-label / aria-labelledby，空串按没写。头一回读时开始盯着这两条，改了就排一轮更新。
   * 宿主不是读屏念的那个节点：子类把它转给承担名字的部件。
   */
  protected readHostNaming(attr: 'aria-label' | 'aria-labelledby'): string | undefined {
    if (!this.hostNamingWatch && typeof MutationObserver !== 'undefined') {
      this.hostNamingWatch = new MutationObserver(() => this.requestUpdate())
      this.hostNamingWatch.observe(this, { attributes: true, attributeFilter: ['aria-label', 'aria-labelledby'] })
    }
    return this.getAttribute(attr) || undefined
  }

  /** 宿主上的 aria-label：表单控件当 ariaLabel 交给 headless，写到与字段标签同一个部件上。 */
  protected hostAriaLabel(): string | undefined {
    return this.readHostNaming('aria-label')
  }

  /**
   * 把沿祖先链解析到的全局配置合入这份 props：translations 按组件名分桶合并，
   * locale 与 size 在元素上未提供时取配置中的值。不运行状态机的元素在 wire() 中用它包一层。
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
    this.hostNamingWatch?.disconnect()
    this.hostNamingWatch = undefined
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
      const hit = records.some(r => ((touchesParts(r) || rewritesDeclaration(r)) && (this.ownsSubtree(r.target) || this.claimsMoved(r))) || this.addsSlotContent(r))
      if (hit)
        this.requestUpdate()
    })
    this.syncPartObservers()
  }

  private syncPartObservers(): void {
    const observer = this.partObserver
    if (!observer)
      return
    observer.disconnect()
    const observe = (root: Node): void => observer.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [...AUTHORED_ATTRS],
    })
    observe(this)
    for (const root of this.externalPartRoots())
      observe(root)
  }

  /**
   * 进出的节点里有没有显式声明归本宿主的角色子树：它们常被挂进嵌套 xh-* 的内容里（流式正文里的引用角标），
   * 变动的目标是嵌套宿主里的节点，按目标判会漏掉。
   */
  private claimsMoved(record: MutationRecord): boolean {
    const owner = this.localName.replace(/^xh-/, '')
    const selector = `[${PART_OWNER_ATTR}="${owner}"]`
    const claimed = (el: Element): boolean => el.parentElement?.closest(this.localName) === this
    for (const node of [...Array.from(record.addedNodes), ...Array.from(record.removedNodes)]) {
      if (node.nodeType !== 1)
        continue
      const el = node as Element
      if (el.matches(selector) && (claimed(el) || !el.isConnected))
        return true
      if (Array.from(el.querySelectorAll(selector)).some(inner => claimed(inner) || !inner.isConnected))
        return true
    }
    return false
  }

  /** 有标准结构的宿主新收到写了 slot 的直接子节点：要搬进结构里对应的部件。 */
  private addsSlotContent(record: MutationRecord): boolean {
    if (record.target !== this || !(this.constructor as typeof XhElement).structure)
      return false
    return Array.from(record.addedNodes).some(node => node.nodeType === 1 && (node as Element).hasAttribute('slot'))
  }

  /** 目标是否归本宿主管：嵌套 xh-* 子树归内层元素自己管，外层不替它重跑 wire（discoverParts 本来也跳过它们）。 */
  private ownsSubtree(target: Node): boolean {
    for (const root of this.externalPartRoots()) {
      if (target !== root && !root.contains(target))
        continue
      for (let node: Node | null = target; node; node = node.parentNode) {
        if (node === root)
          return true
        const tag = (node as Element).tagName
        if (typeof tag === 'string' && tag.toLowerCase().startsWith('xh-'))
          break
      }
    }
    const owner = this.localName.replace(/^xh-/, '')
    for (let node: Node | null = target; node; node = node.parentNode) {
      if (node === this)
        return true
      const el = node as Element
      // 嵌套宿主里显式声明归本宿主的角色子树（discoverParts 认领的那些），且离它最近的同类宿主就是本宿主
      if (typeof el.getAttribute === 'function' && el.getAttribute(PART_OWNER_ATTR) === owner)
        return el.parentElement?.closest(this.localName) === this
      const tag = el.tagName
      if (typeof tag === 'string' && tag.toLowerCase().startsWith('xh-'))
        return false
    }
    return false
  }

  protected override updated(changed: Map<PropertyKey, unknown>): void {
    super.updated(changed)
    // 断开的宿主机器已停机，再接线只会把指向死机器的监听器挂回去、覆盖已接管这些节点的存活宿主；
    // 重连时 connectedCallback 会排一轮补上。列表离场替身里克隆出来的实例同样不接线：重建结构会把克隆时带过来的值写回空
    if (!this.isConnected || this.closest(`[${GHOST_ATTR}]`))
      return
    const ctor = this.constructor as typeof XhElement
    const contract = ctor.partContract
    // 观察器与生成结构、wire() 写的是同一批节点，不圈出本区间会自己触发自己；观察器回调是微任务，故圈到微任务排空为止。
    this.wiring = true
    try {
      // 排在部件发现之前：生成的节点这一轮就能被发现、接线，必备部件的校验也认得出它们
      const structure = ctor.structure
      if (structure)
        syncStructure(this as unknown as HTMLElement, structure, taken => structure.build(this as never, taken), this.structureState)
      this.refreshParts()
      if (contract)
        validatePartContract(contract, this.partMap, this as unknown as HTMLElement, this.instanceId)
      this.wire()
    }
    finally {
      queueMicrotask(() => {
        this.wiring = false
      })
    }
    // 排在 wire() 之后：data-state 得先落进 DOM，才认得出浮层这一帧是不是展开的
    this.checkStackingTrap(contract?.anatomy.name)
    // 本元素当部件、外层先来取过时：根节点就绪了，叫外层重新接线
    if (this.asChildWaiting.size && this.asChildTarget()) {
      const owners = [...this.asChildWaiting]
      this.asChildWaiting.clear()
      for (const owner of owners) owner.requestUpdate()
    }
  }

  /** 子类实现：把 connect 产出接到角色节点上。 */
  protected abstract wire(): void
}
