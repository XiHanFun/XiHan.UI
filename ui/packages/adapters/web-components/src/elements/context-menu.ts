import type { Cleanup, Direction, IdGenerator, Layer, Placement, PositionEnginePort, RuntimeConfig, Service, Size, Tone } from '@xihan-ui/core'
import type { ContextMenuItemProps, ContextMenuNode, ContextMenuOpenChangeDetails, ContextMenuSchema, ContextMenuSelectDetails } from '@xihan-ui/headless'
import type { OverlayExit } from '../overlay-exit'
import { createCounterIdGenerator, createRuntimeConfig, createScope, isItemDisabled, ITEM_VALUE_ATTR } from '@xihan-ui/core'
import { connectContextMenu, contextMenuAnatomy, contextMenuMachine, contextMenuMeta } from '@xihan-ui/headless'
import { createPositionEngine } from '@xihan-ui/position'
import { createDeclaredDisabled } from '../dom/declared-disabled'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { createOverlayExit } from '../overlay-exit'
import { MachineController } from '../runtime/machine-controller'
import { ScrollbarsController } from '../runtime/scrollbars-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : Number(v)) }
// 三态布尔：缺席=undefined（走缺省）、在场=true、显式写 "false"=false。
// 缺省为真的开关（方向键回绕、连打检索）只有三态才关得掉。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-context-menu>` —— Light-DOM 行为宿主：作者写 root/trigger/positioner/content 与若干
 * item / group / separator 角色节点，元素跑 context-menu 机器并把 connect 产出打上去。
 *
 * 与 `<xh-menu>` 的差别只在入口与锚点：这里由触发区上的右键（触摸端长按 700ms、
 * 键盘 ContextMenu / Shift+F10）打开，浮层钉在光标坐标上——锚点是虚拟的一点，
 * 不是某个元素，因此没有 getAnchorEl。展开着再右键只挪坐标，不先关再开。
 *
 * 条目身份取作者写在 item 上的 value 属性，禁用由部件自报（aria-disabled）。
 *
 * @customElement xh-context-menu
 * @attr {boolean} open - 受控开合；缺省该属性即非受控
 * @attr {boolean} default-open - 非受控初始为展开
 * @attr {string} placement - 相对光标的首选放置位，默认 bottom-start；避让后的实际位写在 data-placement 上
 * @attr {number} offset - 浮层与光标的间距（px），默认 0
 * @attr {boolean} loop - 方向键走到尽头回绕，默认 true；写 loop="false" 关掉
 * @attr {boolean} typeahead - 连打检索，默认开；写 typeahead="false" 关掉
 * @attr {'ltr'|'rtl'} dir - 文字方向，默认 ltr
 * @attr {number} long-press-delay - 触摸端长按触发时长（ms），默认 700
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @fires open-change - open 状态变化；detail 为 `{ open: boolean }`
 * @fires select - 条目被选中（菜单随之关闭）；detail 为 `{ value: string }`
 * @csspart root - 组件根容器（承载 data-state）
 * @csspart trigger - 右键触发区（aria-haspopup/aria-controls 所在，自带 Tab 位供键盘开启）
 * @csspart positioner - 浮层定位容器，坐标由引擎写成内联样式
 * @csspart content - role=menu 容器（焦点域与消解层的根节点，键盘在此收口），收起时带 hidden
 * @csspart item - role=menuitem 条目，须自带 value 属性标识身份；禁用写 aria-disabled="true"
 * @csspart item-text - 条目文本（连打检索的取字处）
 * @csspart item-indicator - 条目标记位（勾选符号 / 图标 / 快捷键提示），aria-hidden
 * @csspart separator - 分隔线（role=separator，不入方向键导航）
 * @csspart group - role=group 分组容器，须自带 value 属性标识身份
 * @csspart group-label - 分组标题（本组 aria-labelledby 的目标）
 * @csspart arrow - 指向锚点的箭头（aria-hidden，data-placement 随实际放置位翻转）
 */
export class XhContextMenuElement extends XhElement {
  static override partContract = { anatomy: contextMenuAnatomy, meta: contextMenuMeta }

  // dir 只占属性名、字段改叫 direction：HTMLElement 原生 dir 是 string 访问器，
  // 同名响应式字段会与基类类型打架。属性仍进 observedAttributes，改 dir 照样触发重算。
  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    // 数组只走 property，属性表达不了；给了它条目的禁用即以数据为准
    collection: { attribute: false },
    open: { converter: BOOLEAN_CONVERTER },
    defaultOpen: { type: Boolean, attribute: 'default-open' },
    placement: { converter: STRING_CONVERTER },
    offset: { converter: NUMBER_CONVERTER },
    loop: { converter: BOOLEAN_CONVERTER },
    typeahead: { converter: BOOLEAN_CONVERTER },
    translations: { attribute: false },
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
    longPressDelay: { converter: NUMBER_CONVERTER, attribute: 'long-press-delay' },
    tone: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
  }

  declare collection?: ContextMenuNode[]
  declare open?: boolean
  declare defaultOpen?: boolean
  declare placement?: Placement
  declare offset?: number
  declare loop?: boolean
  declare typeahead?: boolean
  /** 读屏文案（菜单名字）；对象进不了属性，只作为 property 暴露。 */
  declare translations?: ContextMenuSchema['props']['translations']
  declare direction?: Direction
  declare longPressDelay?: number
  declare tone?: Tone
  declare size?: Size

  private readonly idGen: IdGenerator = createCounterIdGenerator()
  private readonly menuScope = createScope(null, this.idGen)
  private readonly positionEngine: PositionEnginePort = createPositionEngine()
  private config: RuntimeConfig | null = null
  /** 退场闸门：收起从跟着 open 走改成跟着 presence 走，退场动画播完才真收。 */
  private exit: OverlayExit | null = null

  private readonly notifyOpen = (details: ContextMenuOpenChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('open-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifySelect = (details: ContextMenuSelectDetails): void => {
    this.dispatchEvent(new CustomEvent('select', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<ContextMenuSchema>(
    this,
    contextMenuMachine,
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

  private machineProps(): Partial<ContextMenuSchema['props']> {
    return {
      collection: this.collection,
      open: this.open,
      defaultOpen: this.defaultOpen ?? false,
      placement: this.placement,
      offset: this.offset,
      loop: this.loop,
      typeahead: this.typeahead,
      translations: this.translations,
      dir: this.direction,
      longPressDelay: this.longPressDelay,
      tone: this.tone,
      size: this.size,
      onOpenChange: this.notifyOpen,
      onSelect: this.notifySelect,
    }
  }

  private ensureConfig(): void {
    if (this.config)
      return
    this.config = createRuntimeConfig({ scope: this.menuScope, idGenerator: this.idGen })
  }

  // 只交注册函数、不在连接期注册：层的入栈出栈跟着展开态走（机器的 trackLayer 效应负责）。
  // 连接期就注册会让层与开合无关地常驻栈里，把同页其它层的 Escape 堵死。
  private readonly registerLayer = (): { layer: Layer, dispose: Cleanup } => {
    this.ensureConfig()
    return this.config!.layerRegistry.register({
      kind: 'popover',
      node: () => this.getPart('content'),
      // 触发区记为本层分支：展开着再右键要能就地换坐标，先被判成层外交互关一次就白闪了。
      // 代价是"左键点在触发区内也该关"落不到消解层头上，那条由 connect 在 pointerdown 上自己收口。
      // 浮层壳一并记上：条目列表之外还浮着自绘滚动条，按住它拖动不该把菜单消解掉
      branches: () => [this.getPart('trigger'), this.getPart('positioner')].filter(Boolean) as Element[],
      isModal: () => false,
      setModal: () => {},
      // 右键菜单不带遮罩，没有"点它就该关本层"的表面
      surfaces: () => [],
    })
  }

  // onBuilt 在 ctrl 构造期就跑（此刻 this.ctrl 尚未赋值），故 service 由参数传入。
  private injectRefs(svc: Service<ContextMenuSchema>): void {
    this.ensureConfig()
    svc.refs.set('config', this.config)
    svc.refs.set('registerLayer', this.registerLayer)
    svc.refs.set('position', this.positionEngine)
    svc.refs.set('getFloatingEl', () => this.getPart('positioner'))
    // 触发区兼作两用：收起时焦点归还它，没有光标坐标时它的起始角就是锚点
    svc.refs.set('getTriggerEl', () => this.getPart('trigger'))
    svc.refs.set('getContentEl', () => this.getPart('content'))
  }

  /**
   * 角色节点提前发现一次：default-open 时机器在 hostConnected 当场进入展开态，
   * 进入那一刻的 entry 同步查 content 里的条目挑焦点锚点——而常规发现要等首次 updated，
   * 那一刻 partMap 还空着，锚点会留空，于是没有条目认领 tabindex=0，键盘进不去菜单。
   * 定位是 flush 推迟的（那时 partMap 已就位），这里只为锚点补上时机。
   */
  override connectedCallback(): void {
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
    // data-value 只写在 item 上，分隔线与条目内的文本离场不会误判
    if (nodes.some(el => el.getAttribute(ITEM_VALUE_ATTR) === focusedValue))
      send({ type: 'ITEM.LOST' })
  }

  // 条目/分组内的子部件：getParts 收的是整个元素范围，按子树过滤才归得对。
  private partsIn(owner: HTMLElement, name: string): HTMLElement[] {
    return this.getParts(name).filter(el => owner.contains(el))
  }

  protected wire(): void {
    const api = connectContextMenu(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('trigger', api.getTriggerProps() as Record<string, unknown>)
    // positioner 的 style 是对象（position/insetInlineStart/insetBlockStart），
    // spreader 见对象 style 会逐条写内联样式，直接 spread 即可。
    put('positioner', api.getPositionerProps() as Record<string, unknown>)
    put('content', api.getContentProps() as Record<string, unknown>)
    put('arrow', api.getArrowProps() as Record<string, unknown>)

    for (const el of this.getParts('group')) {
      const group = { value: el.getAttribute('value') ?? '' }
      this.spreader.spread(el, api.getGroupProps(group) as Record<string, unknown>)
      for (const label of this.partsIn(el, 'group-label'))
        this.spreader.spread(label, api.getGroupLabelProps(group) as Record<string, unknown>)
    }

    // 条目是多实例 part，逐个打：身份取作者写的 value，禁用取部件自报的 aria-disabled
    // （集合条目一律 aria-disabled，原生 disabled 不可聚焦、也不派 click）。
    // 打上去的 data-scope/data-part/data-value 正是方向键与连打检索在事件那一刻查 DOM 的依据，
    // 所以 wire 必须先于事件跑过——updated() 已保证。
    for (const el of this.getParts('item')) {
      const item: ContextMenuItemProps = {
        value: el.getAttribute('value') ?? '',
        disabled: this.collection ? this.declaredDisabled(el) : isItemDisabled(el),
      }
      this.spreader.spread(el, api.getItemProps(item) as Record<string, unknown>)
      // 条目内的文本与标记位跟着同一份声明走，样式层各处状态一致
      for (const text of this.partsIn(el, 'item-text'))
        this.spreader.spread(text, api.getItemTextProps(item) as Record<string, unknown>)
      for (const indicator of this.partsIn(el, 'item-indicator'))
        this.spreader.spread(indicator, api.getItemIndicatorProps(item) as Record<string, unknown>)
    }

    // 分隔线也是多实例 part，但不带身份、不入导航，属性对每个都一样
    for (const el of this.getParts('separator'))
      this.spreader.spread(el, api.getSeparatorProps() as Record<string, unknown>)

    // Light DOM content 常驻，WC 自管可见性：作者层给 content 设了 display（本仓样式是 flex）
    // 就会盖过 UA 的 [hidden]{display:none}，只有内联 style.display 压得住。
    // 展开时还回作者原本写的内联值，不把他自己的 style="display:grid" 抹掉。
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

    this.bars.wire()
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    // 退场没播完就离场：立刻结清并收起，否则作者的节点会带着已被撤掉的 data-state 留在页面上
    this.exit?.dispose()
    this.exit = null
    if (this.ctrl.service.state.get() !== 'open')
      this.setPartHidden(this.getPart('content'), true)
    // 层由展开态的效应自己入栈出栈，断开时机器停机会一并撤掉，这里无需再管
    this.config = null // 重连时 ensureConfig 重建
  }
}
