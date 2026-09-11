import type { Cleanup, Direction, IdGenerator, Layer, Placement, PortalVisualBridge, PositionEnginePort, RuntimeConfig, Service, Size, Tone } from '@xihan-ui/core'
import type { MenuNode, MenuOpenChangeDetails, MenuSchema, MenuSelectDetails, MenuTranslations } from '@xihan-ui/headless'
import type { OverlayExit } from '../overlay-exit'
import type { MenuSubmenuChild, MenuSubmenuOwner, MenuSubmenuRegistration } from '../runtime/menu-submenu-owner'
import { createCounterIdGenerator, createPortalVisualBridge, createRuntimeConfig, createScope, isItemDisabled, ITEM_VALUE_ATTR } from '@xihan-ui/core'
import { connectMenu, createMenuTreeNode, menuAnatomy, menuMachine, menuMeta } from '@xihan-ui/headless'
import { createPositionEngine } from '@xihan-ui/position'
import { createDeclaredDisabled } from '../dom/declared-disabled'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { createOverlayExit } from '../overlay-exit'
import { MachineController } from '../runtime/machine-controller'
import { findMenuSubmenuOwner, setMenuSubmenuOwner } from '../runtime/menu-submenu-owner'
import { ScrollbarsController } from '../runtime/scrollbars-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : Number(v)) }
// 三态布尔：缺席=undefined（走缺省）、在场=true、显式写 "false"=false。
// 缺省为真的开关（方向键回绕）只有三态才关得掉。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

interface MenuPortalLease {
  readonly source: HTMLElement
  readonly positioner: HTMLElement
  readonly placeholder: Comment
  readonly shell: HTMLElement
  readonly bridge: PortalVisualBridge
}

/**
 * `<xh-menu>` —— Light-DOM 行为宿主：用户写 trigger/positioner/content/item/group/... 角色节点，
 * 元素跑 menu 机器并把 connect 产出打上去。浮层定位引擎在本元素里建好、经 refs 注入机器，
 * 锚点取 trigger、被定位的浮层取 positioner；机器只认端口，不认识具体引擎。
 * 条目身份取用户写在 item 上的 value 属性，禁用由部件自报（aria-disabled）。
 *
 * @customElement xh-menu
 * @attr {boolean} open - 受控开合；缺省该属性即非受控
 * @attr {boolean} default-open - 非受控初始为展开
 * @attr {string} placement - 首选放置位，默认 bottom-start；避让后的实际位写在 data-placement 上
 * @attr {number} offset - 浮层与锚点的间距（px）
 * @attr {boolean} loop - 方向键走到尽头回绕，默认 true；写 loop="false" 关掉
 * @attr {'ltr'|'rtl'} dir - 文字方向，默认 ltr
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @attr {boolean} typeahead - 首字符连打检索，默认开；写 typeahead="false" 关掉
 * @attr {boolean} disabled - 整张菜单禁用：触发器不再展开，条目全转 aria-disabled
 * @fires open-change - open 状态变化；detail 为 `{ open: boolean }`
 * @fires select - 条目被选中（菜单随之关闭）；detail 为 `{ value: string }`
 * @csspart trigger - 触发按钮（aria-haspopup/aria-expanded/aria-controls 所在），同时是定位锚点
 * @csspart positioner - 浮层定位容器，坐标由引擎写成内联样式
 * @csspart content - role=menu 容器（焦点域与消解层的根节点，键盘在此收口），收起时带 hidden
 * @csspart item - role=menuitem 条目，须自带 value 属性标识身份；禁用写 aria-disabled="true"
 * @csspart item-text - 条目里的文字载体，连打检索取它
 * @csspart item-indicator - 条目里的标记位，对读屏隐藏
 * @csspart item-description - 条目里的副文本
 * @csspart separator - 分隔线（role=separator，不入方向键导航）
 * @csspart group - role=group 分组容器，须自带 value 属性标识身份
 * @csspart group-label - 分组标题（本组 aria-labelledby 的目标）
 * @csspart arrow - 指向锚点的箭头（aria-hidden，data-placement 随实际放置位翻转）
 */
export class XhMenuElement extends XhElement {
  static override partContract = { anatomy: menuAnatomy, meta: menuMeta }

  // dir 只占属性名、字段改叫 direction：HTMLElement 原生 dir 是 string 访问器，
  // 同名响应式字段会与基类类型打架。属性仍进 observedAttributes，改 dir 照样触发重算。
  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    // 数组只走 property，属性表达不了；给了它条目的文本与禁用即以数据为准
    collection: { attribute: false },
    open: { converter: BOOLEAN_CONVERTER },
    defaultOpen: { type: Boolean, attribute: 'default-open' },
    placement: { converter: STRING_CONVERTER },
    offset: { converter: NUMBER_CONVERTER },
    loop: { converter: BOOLEAN_CONVERTER },
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
    tone: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
    typeahead: { converter: BOOLEAN_CONVERTER },
    disabled: { converter: BOOLEAN_CONVERTER },
    // 文案是对象，只走 property
    translations: { attribute: false },
    submenu: { converter: BOOLEAN_CONVERTER },
    openOnHover: { converter: BOOLEAN_CONVERTER, attribute: 'open-on-hover' },
    hoverOpenDelay: { converter: NUMBER_CONVERTER, attribute: 'hover-open-delay' },
    hoverCloseDelay: { converter: NUMBER_CONVERTER, attribute: 'hover-close-delay' },
  }

  declare collection?: MenuNode[]
  declare open?: boolean
  declare defaultOpen?: boolean
  declare placement?: Placement
  declare offset?: number
  declare loop?: boolean
  declare direction?: Direction
  declare tone?: Tone
  declare size?: Size
  declare typeahead?: boolean
  declare disabled?: boolean
  declare translations?: Partial<MenuTranslations>
  declare submenu?: boolean
  declare openOnHover?: boolean
  declare hoverOpenDelay?: number
  declare hoverCloseDelay?: number

  private readonly idGen: IdGenerator = createCounterIdGenerator()
  private readonly menuScope = createScope(this, this.idGen)
  private readonly positionEngine: PositionEnginePort = createPositionEngine()
  private config: RuntimeConfig | null = null
  /** 直属子菜单触发条目由父机补齐 item 身份；这里只保留 WC 的属性铺设桥。 */
  private readonly submenuBridges = new Map<HTMLElement, MenuSubmenuChild>()
  private parentTriggerOwner: MenuSubmenuOwner | null = null
  private parentTrigger: HTMLElement | null = null
  private parentRegistration: MenuSubmenuRegistration | null = null
  private portal: MenuPortalLease | null = null

  private readonly menuTree = createMenuTreeNode({
    getPositioner: () => this.getPart('positioner'),
    isOpen: () => this.ctrl.service.state.get() === 'open',
    close: () => this.ctrl.service.send({ type: 'CLOSE' }),
    isRoot: () => !this.submenu,
    onRootSelect: details => this.dispatchSelect(details),
  })

  private readonly submenuOwner: MenuSubmenuOwner = {
    tree: this.menuTree,
    registerSubmenu: child => this.registerSubmenu(child),
  }

  /** 退场闸门：收起从跟着 open 走改成跟着 presence 走，退场动画播完才真收。 */
  private exit: OverlayExit | null = null

  private readonly notifyOpen = (details: MenuOpenChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('open-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifySelect = (details: MenuSelectDetails): void => {
    this.menuTree.select(details)
  }

  private readonly dispatchSelect = (details: MenuSelectDetails): void => {
    this.dispatchEvent(new CustomEvent('select', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<MenuSchema>(
    this,
    menuMachine,
    () => this.machineProps(),
    { scope: this.menuScope, onBuilt: svc => this.injectRefs(svc) },
  )

  /** 条目列表的自绘条：与 content 同级挂在已经 fixed 的 positioner 上 */
  private readonly bars = new ScrollbarsController(this, {
    shell: () => this.getPart('positioner'),
    scrollable: () => this.getPart('content'),
  })

  /** 作者声明的条目禁用，只认首见那一份；给了 collection 时用它，否则现读 */
  private readonly declaredDisabled = createDeclaredDisabled()

  private machineProps(): Partial<MenuSchema['props']> {
    return {
      collection: this.collection,
      open: this.open,
      defaultOpen: this.defaultOpen ?? false,
      placement: this.placement,
      offset: this.offset,
      loop: this.loop,
      dir: this.direction,
      tone: this.tone,
      size: this.size,
      typeahead: this.typeahead,
      disabled: this.disabled,
      translations: this.translations,
      submenu: this.submenu,
      openOnHover: this.openOnHover,
      hoverOpenDelay: this.hoverOpenDelay,
      hoverCloseDelay: this.hoverCloseDelay,
      onOpenChange: this.notifyOpen,
      onSelect: this.notifySelect,
    }
  }

  private ensureConfig(): void {
    if (this.config)
      return
    this.config = createRuntimeConfig({ scope: this.menuScope, idGenerator: this.idGen })
  }

  private wireSubmenuChild(child: MenuSubmenuChild): void {
    const api = connectMenu(this.ctrl.service, wcNormalize)
    this.spreader.spread(child.trigger, api.getItemProps({
      value: child.trigger.getAttribute('value') ?? '',
      disabled: child.getDisabled(),
    }) as Record<string, unknown>)
  }

  private registerSubmenu(child: MenuSubmenuChild): MenuSubmenuRegistration {
    if (this.submenuBridges.has(child.trigger))
      throw new Error('[xh] 同一父菜单的同一子菜单 trigger 只能登记一次')
    const releaseTree = this.menuTree.registerChild(child.tree)
    this.submenuBridges.set(child.trigger, child)
    try {
      this.wireSubmenuChild(child)
    }
    catch (error) {
      this.submenuBridges.delete(child.trigger)
      releaseTree()
      throw error
    }
    this.requestUpdate()
    let active = true
    const assertCurrent = (): void => {
      if (!active || this.submenuBridges.get(child.trigger) !== child)
        throw new Error('[xh] Menu 子菜单逻辑所有权已经释放')
    }
    return {
      sync: () => {
        assertCurrent()
        this.wireSubmenuChild(child)
      },
      dispose: () => {
        if (!active)
          return
        active = false
        releaseTree()
        if (this.submenuBridges.get(child.trigger) !== child)
          return
        this.submenuBridges.delete(child.trigger)
        this.spreader.release(child.trigger)
        this.requestUpdate()
      },
    }
  }

  private syncParentTrigger(trigger: HTMLElement | null): void {
    const owner = this.submenu && trigger ? findMenuSubmenuOwner(this) : null
    if (owner === this.parentTriggerOwner && trigger === this.parentTrigger)
      return
    this.parentRegistration?.dispose()
    this.parentRegistration = null
    this.parentTriggerOwner = owner
    this.parentTrigger = trigger
    if (owner && trigger) {
      this.parentRegistration = owner.registerSubmenu({
        trigger,
        tree: this.menuTree,
        getDisabled: () => this.disabled,
      })
    }
  }

  protected override externalPartRoots(): readonly HTMLElement[] {
    return this.portal ? [this.portal.positioner] : []
  }

  private mountPositionerPortal(positioner: HTMLElement, source: HTMLElement): void {
    if (this.portal?.positioner === positioner) {
      if (this.portal.source === source)
        return
      this.restorePositionerPortal()
    }
    if (this.portal)
      throw new Error('[xh] Menu 子菜单的 Portal positioner 在单次展开期不得换代')
    if (positioner.ownerDocument !== source.ownerDocument || positioner.ownerDocument !== this.ownerDocument)
      throw new Error('[xh] Menu 子菜单的 Portal 来源、positioner 与宿主必须属于同一 Document')
    const parent = positioner.parentNode
    if (!parent)
      throw new Error('[xh] Menu 子菜单的 positioner 必须先挂入作者结构再搬到 Portal')
    this.ensureConfig()
    const target = this.config!.portalContainer()
    if (!target)
      throw new Error('[xh] Menu 子菜单需要显式可用的 Portal 容器')
    if (target.ownerDocument !== this.ownerDocument || !target.isConnected)
      throw new Error('[xh] Menu 子菜单的 Portal 容器必须连接在同一 Document')

    const placeholder = this.ownerDocument.createComment('xh-menu-positioner')
    const shell = this.ownerDocument.createElement('div')
    shell.dataset.xhPortalShell = ''
    shell.style.display = 'contents'
    setMenuSubmenuOwner(shell, this.submenuOwner)
    parent.insertBefore(placeholder, positioner)
    let bridge: PortalVisualBridge | null = null
    try {
      target.appendChild(shell)
      bridge = createPortalVisualBridge({ source, shell })
      // 先公布所有权，再移动：嵌套自定义元素重连时可沿 Portal 壳找回逻辑父级。
      this.portal = { source, positioner, placeholder, shell, bridge }
      shell.appendChild(positioner)
      this.requestUpdate()
    }
    catch (error) {
      this.portal = null
      const cleanupErrors: unknown[] = []
      try {
        bridge?.dispose()
      }
      catch (cleanupError) {
        cleanupErrors.push(cleanupError)
      }
      try {
        if (placeholder.parentNode)
          placeholder.replaceWith(positioner)
      }
      catch (cleanupError) {
        cleanupErrors.push(cleanupError)
      }
      try {
        setMenuSubmenuOwner(shell, null)
        shell.remove()
      }
      catch (cleanupError) {
        cleanupErrors.push(cleanupError)
      }
      if (cleanupErrors.length)
        throw new AggregateError([error, ...cleanupErrors], '[xh] Menu 子菜单 Portal 初始化与回滚同时失败', { cause: error })
      throw error
    }
  }

  private restorePositionerPortal(): void {
    const portal = this.portal
    if (!portal)
      return
    this.portal = null
    const errors: unknown[] = []
    try {
      portal.bridge.dispose()
    }
    catch (error) {
      errors.push(error)
    }
    try {
      if (!portal.placeholder.parentNode)
        throw new Error('[xh] Menu 子菜单的 Portal 占位节点已被移除，无法恢复作者结构')
      portal.placeholder.replaceWith(portal.positioner)
    }
    catch (error) {
      errors.push(error)
    }
    try {
      setMenuSubmenuOwner(portal.shell, null)
      portal.shell.remove()
    }
    catch (error) {
      errors.push(error)
    }
    if (this.isConnected)
      this.requestUpdate()
    if (errors.length === 1)
      throw errors[0]
    if (errors.length > 1)
      throw new AggregateError(errors, '[xh] Menu 子菜单 Portal 恢复出现多个异常', { cause: errors[0] })
  }

  // 只交注册函数、不在连接期注册：层的入栈出栈跟着展开态走（机器的 trackLayer 效应负责）。
  // 连接期就注册会让层与开合无关地常驻栈里，把同页其它层的 Escape 堵死。
  private readonly registerLayer = (): { layer: Layer, dispose: Cleanup } => {
    this.ensureConfig()
    return this.config!.layerRegistry.register({
      kind: 'popover',
      node: () => this.getPart('content'),
      // trigger 记为本层分支：点它算层内交互，开合交给 trigger 自己切换。
      // 否则同一次点击先被判为层外交互关一次、再被 click 打开一次，菜单等于关不掉。
      // 浮层壳一并记上：条目列表之外还浮着自绘滚动条，按住它拖动不该把菜单消解掉
      branches: () => [this.getPart('trigger'), this.getPart('positioner')].filter(Boolean) as Element[],
      isModal: () => false,
      // 菜单不带遮罩，没有"点它就该关本层"的表面
      surfaces: () => [],
    })
  }

  // onBuilt 在 ctrl 构造期就跑（此刻 this.ctrl 尚未赋值），故 service 由参数传入。
  private injectRefs(svc: Service<MenuSchema>): void {
    this.ensureConfig()
    svc.refs.set('config', this.config)
    svc.refs.set('registerLayer', this.registerLayer)
    svc.refs.set('position', this.positionEngine)
    svc.refs.set('getAnchorEl', () => this.getPart('trigger'))
    svc.refs.set('getFloatingEl', () => this.getPart('positioner'))
    svc.refs.set('getContentEl', () => this.getPart('content'))
    svc.refs.set('getHoverBranches', this.menuTree.getHoverBranches)
  }

  /**
   * 角色节点提前发现一次：default-open 时机器在 hostConnected 当场进入展开态，
   * 进入那一刻的 entry 同步查 content 里的条目挑焦点锚点——而常规发现要等首次 updated，
   * 那一刻 partMap 还空着，锚点会留空，于是没有条目认领 tabindex=0，键盘进不去菜单。
   * 定位是 flush 推迟的（那时 partMap 已就位），这里只为锚点补上时机。
   */
  override connectedCallback(): void {
    setMenuSubmenuOwner(this, this.submenuOwner)
    this.refreshParts()
    super.connectedCallback()
  }

  /**
   * 承载焦点的条目被移出 DOM 时浏览器不派 focusout，锚点会停在一个已消失的值上：
   * 没有条目认领 tabindex=0、方向键也失去起点。这里替 DOM 把焦点离场如实上报，
   * 机器就地按当前活条目重挑锚点。
   */
  protected override onPartsReleased(nodes: readonly HTMLElement[]): void {
    const { context, getStatus, send } = this.ctrl.service
    // 宿主断开时机器已停机，此刻无焦点可言（送事件还会在 dev 下抛）
    if (getStatus() !== 'Started')
      return
    const focusedValue = context.get('focusedValue')
    if (focusedValue == null)
      return
    // data-value 只写在 item 上，separator 与 arrow 离场不会误判
    if (nodes.some(el => el.getAttribute(ITEM_VALUE_ATTR) === focusedValue))
      send({ type: 'ITEM.LOST' })
  }

  /** 落在某个角色节点子树里的同名部件。 */
  private partsIn(owner: HTMLElement, name: string): HTMLElement[] {
    return this.getParts(name).filter(el => owner.contains(el))
  }

  protected wire(): void {
    const api = connectMenu(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    // 子菜单形态的触发器是父菜单里的一条 item（双重身份），身份取节点自报的 value
    const triggerEl = this.getPart('trigger')
    this.syncParentTrigger(triggerEl)
    const positionerEl = this.getPart('positioner')
    if (!this.submenu && this.portal)
      this.restorePositionerPortal()
    if (this.submenu && api.open) {
      if (!triggerEl || !positionerEl)
        throw new Error('[xh] 展开的 Menu 子菜单必须同时具备 trigger 与 positioner')
      this.mountPositionerPortal(positionerEl, triggerEl)
    }
    if (this.submenu && triggerEl) {
      this.spreader.spread(triggerEl, api.getSubmenuTriggerProps({ value: triggerEl.getAttribute('value') ?? '' }) as Record<string, unknown>)
    }
    else {
      put('trigger', api.getTriggerProps() as Record<string, unknown>)
    }
    // positioner 的 style 是对象（position/insetInlineStart/insetBlockStart），
    // spreader 见对象 style 会逐条写内联样式，直接 spread 即可。
    put('positioner', api.getPositionerProps() as Record<string, unknown>)
    put('content', api.getContentProps() as Record<string, unknown>)
    put('arrow', api.getArrowProps() as Record<string, unknown>)

    // 条目是多实例 part，逐个打：身份取作者写的 value，禁用取部件自报的 aria-disabled
    // （集合条目一律 aria-disabled，原生 disabled 不可聚焦、也不派 click）。
    // 打上去的 data-scope/data-part/data-value 正是方向键在事件那一刻查 DOM 的依据，
    // 所以 wire 必须先于事件跑过——updated() 已保证。
    for (const el of this.getParts('item')) {
      const props = api.getItemProps({
        value: el.getAttribute('value') ?? '',
        disabled: this.collection ? this.declaredDisabled(el) : isItemDisabled(el),
      })
      this.spreader.spread(el, props as Record<string, unknown>)
    }
    for (const child of this.submenuBridges.values())
      this.wireSubmenuChild(child)
    this.parentRegistration?.sync()

    // 条目子部件的身份取所属条目自报的 value，与条目本身同一份声明
    const ownerItem = (el: HTMLElement): { value: string, disabled?: boolean } => {
      const owner = this.getParts('item').find(item => item.contains(el))
      return {
        value: owner?.getAttribute('value') ?? '',
        disabled: owner ? (this.collection ? this.declaredDisabled(owner) : isItemDisabled(owner)) : undefined,
      }
    }
    for (const el of this.getParts('item-text'))
      this.spreader.spread(el, api.getItemTextProps(ownerItem(el)) as Record<string, unknown>)
    for (const el of this.getParts('item-indicator'))
      this.spreader.spread(el, api.getItemIndicatorProps(ownerItem(el)) as Record<string, unknown>)
    for (const el of this.getParts('item-description'))
      this.spreader.spread(el, api.getItemDescriptionProps(ownerItem(el)) as Record<string, unknown>)

    // 分隔线也是多实例 part，但不带身份、不入导航，属性对每个都一样
    for (const el of this.getParts('separator'))
      this.spreader.spread(el, api.getSeparatorProps() as Record<string, unknown>)

    // 分组与它的标题靠同一个 value 互相认领，标题的 id 由 connect 据此派生
    for (const el of this.getParts('group')) {
      const group = { value: el.getAttribute('value') ?? '' }
      this.spreader.spread(el, api.getGroupProps(group) as Record<string, unknown>)
      for (const label of this.partsIn(el, 'group-label'))
        this.spreader.spread(label, api.getGroupLabelProps(group) as Record<string, unknown>)
    }

    // Light DOM content 常驻，WC 自管可见性。读 styles/css/menu.css 的结论：
    // content 是 display:flex，positioner 只声明 position/z-index/pointer-events、没有 display，
    // connect 也不给 positioner 发 hidden——所以只兜 content 这一处。
    // 该文件自己带了 [data-part=content][hidden]{display:none} 压住那条 flex，
    // 但宿主不能指望作者装了这份样式：换别家样式给 content 设 display 就又盖过 UA 的
    // [hidden]{display:none}，只有内联 style.display 压得住。展开时置空串即撤掉内联声明。
    const content = this.getPart('content')
    if (content)
      // 退场动画播完之前先别收：presence 读 content 的 animationName 决定要不要多留一会儿。
      // 必须排在 put('content') 之后——data-state 得先落进 DOM，探测器才读得到退场那支动画
      this.ensureConfig()
    this.exit ??= createOverlayExit({
      config: this.config!,
      open: api.open,
      onExitComplete: () => this.requestUpdate(),
    })
    this.exit.track(content)
    this.exit.update(api.open)
    this.setPartHidden(content, !this.exit.visible)
    if (this.portal && !this.exit.visible)
      this.restorePositionerPortal()

    this.bars.wire()
  }

  override disconnectedCallback(): void {
    setMenuSubmenuOwner(this, null)
    this.syncParentTrigger(null)
    super.disconnectedCallback()
    // 退场没播完就离场：立刻结清并收起，否则作者的节点会带着已被撤掉的 data-state 留在页面上
    this.exit?.dispose()
    this.exit = null
    this.restorePositionerPortal()
    if (this.ctrl.service.state.get() !== 'open')
      this.setPartHidden(this.getPart('content'), true)
    // 层由展开态的效应自己入栈出栈，断开时机器停机会一并撤掉，这里无需再管
    this.config = null // 重连时 ensureConfig 重建
  }
}
