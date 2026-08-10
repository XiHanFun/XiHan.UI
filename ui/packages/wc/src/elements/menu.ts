import type { Cleanup, Direction, IdGenerator, Layer, Placement, PositionEnginePort, RuntimeConfig } from '@xihan-ui/core'
import type { MenuNode, MenuOpenChangeDetails, MenuSchema, MenuSelectDetails } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import { isItemDisabled, ITEM_VALUE_ATTR } from '@xihan-ui/behavior'
import { createCounterIdGenerator, createRuntimeConfig, createScope } from '@xihan-ui/core'
import { connectMenu, menuAnatomy, menuMachine, menuMeta } from '@xihan-ui/headless'
import { createPositionEngine } from '@xihan-ui/position'
import { createDeclaredDisabled } from '../dom/declared-disabled'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : Number(v)) }
// 三态布尔：缺席=undefined（走缺省）、在场=true、显式写 "false"=false。
// 缺省为真的开关（方向键回绕）只有三态才关得掉。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-menu>` —— Light-DOM 行为宿主：用户写 trigger/positioner/content/item/... 角色节点，
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
 * @fires open-change - open 状态变化；detail 为 `{ open: boolean }`
 * @fires select - 条目被选中（菜单随之关闭）；detail 为 `{ value: string }`
 * @csspart trigger - 触发按钮（aria-haspopup/aria-expanded/aria-controls 所在），同时是定位锚点
 * @csspart positioner - 浮层定位容器，坐标由引擎写成内联样式
 * @csspart content - role=menu 容器（焦点域与消解层的根节点，键盘在此收口），收起时带 hidden
 * @csspart item - role=menuitem 条目，须自带 value 属性标识身份；禁用写 aria-disabled="true"
 * @csspart separator - 分隔线（role=separator，不入方向键导航）
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
  }

  declare collection?: MenuNode[]
  declare open?: boolean
  declare defaultOpen?: boolean
  declare placement?: Placement
  declare offset?: number
  declare loop?: boolean
  declare direction?: Direction
  declare tone?: string
  declare size?: string

  private readonly idGen: IdGenerator = createCounterIdGenerator()
  private readonly menuScope = createScope(null, this.idGen)
  private readonly positionEngine: PositionEnginePort = createPositionEngine()
  private config: RuntimeConfig | null = null

  private readonly notifyOpen = (details: MenuOpenChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('open-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifySelect = (details: MenuSelectDetails): void => {
    this.dispatchEvent(new CustomEvent('select', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<MenuSchema>(
    this,
    menuMachine,
    () => this.machineProps(),
    { scope: this.menuScope, onBuilt: svc => this.injectRefs(svc) },
  )

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
      // trigger 记为本层分支：点它算层内交互，开合交给 trigger 自己切换。
      // 否则同一次点击先被判为层外交互关一次、再被 click 打开一次，菜单等于关不掉。
      branches: () => [this.getPart('trigger')].filter(Boolean) as Element[],
      isModal: () => false,
      setModal: () => {},
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
    // data-value 只写在 item 上，separator 与 arrow 离场不会误判
    if (nodes.some(el => el.getAttribute(ITEM_VALUE_ATTR) === focusedValue))
      send({ type: 'ITEM.LOST' })
  }

  protected wire(): void {
    const api = connectMenu(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('trigger', api.getTriggerProps() as Record<string, unknown>)
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

    // 分隔线也是多实例 part，但不带身份、不入导航，属性对每个都一样
    for (const el of this.getParts('separator'))
      this.spreader.spread(el, api.getSeparatorProps() as Record<string, unknown>)

    // Light DOM content 常驻，WC 自管可见性。读 styled/styles/menu.css 的结论：
    // content 是 display:flex，positioner 只声明 position/z-index/pointer-events、没有 display，
    // connect 也不给 positioner 发 hidden——所以只兜 content 这一处。
    // 该文件自己带了 [data-part=content][hidden]{display:none} 压住那条 flex，
    // 但宿主不能指望作者装了这份样式：换别家样式给 content 设 display 就又盖过 UA 的
    // [hidden]{display:none}，只有内联 style.display 压得住。展开时置空串即撤掉内联声明。
    const content = this.getPart('content')
    if (content)
      this.setPartHidden(content, !api.open)
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    // 层由展开态的效应自己入栈出栈，断开时机器停机会一并撤掉，这里无需再管
    this.config = null // 重连时 ensureConfig 重建
  }
}
