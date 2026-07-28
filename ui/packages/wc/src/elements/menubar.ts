import type { Cleanup, Direction, IdGenerator, Layer, Orientation, Placement, PositionEnginePort, RuntimeConfig } from '@xihan-ui/core'
import type { MenubarItemProps, MenubarSchema, MenubarSelectDetails, MenubarValueChangeDetails } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import { isItemDisabled, ITEM_VALUE_ATTR } from '@xihan-ui/behavior'
import { createCounterIdGenerator, createRuntimeConfig, createScope } from '@xihan-ui/core'
import { connectMenubar, menubarMachine } from '@xihan-ui/headless'
import { createFloatingUiPositionEngine } from '@xihan-ui/position-floating-ui'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席一律翻成 undefined：缺省值的唯一事实源留在机器与 connect 里。
// Lit 自带的转换器会把缺席落成 null / false，那样属性就再也表达不了"未指定"。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : Number(v)) }
// 三态布尔：缺席=undefined（走缺省）、在场=true、显式写 "false"=false。
// 缺省为真的开关（方向键回绕、连打检索）只有三态才关得掉。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * 读角色节点的禁用声明，顺手把作者写的原生 disabled 摘掉。
 *
 * 集合条目的禁用一律由 aria-disabled 表达：原生禁用的按钮不可聚焦、也收不到 click，
 * 「禁用项仍是方向键起点、仍挡得住点击」这两条在原生 disabled 下根本无从成立
 * （连点击都到不了处理器，挡住的是浏览器不是组件）。
 * 摘掉之后禁用态由 connect 产出的 aria-disabled 承接，下一轮接线照样读得到。
 */
function authorDisabled(el: HTMLElement): boolean {
  const disabled = isItemDisabled(el)
  if (el.hasAttribute('disabled'))
    el.removeAttribute('disabled')
  return disabled
}

/**
 * `<xh-menubar>` —— Light-DOM 行为宿主：作者写
 * root/trigger/positioner/content/item/item-text/item-indicator/separator/group/group-label 角色节点，
 * 元素跑 menubar 机器并把 connect 产出打上去。
 *
 * 与 `<xh-menu>` 的分野：这里是一排菜单，同时只展开一张。展开之后指针**掠过**别的 trigger
 * 就直接切换过去（不用点、也不等延时）；一个都没展开时掠过不打扰。
 * 整条菜单栏只有一个 Tab 位（roving tabindex），进来之后靠方向键在 trigger 之间走。
 *
 * 标签由作者写：trigger 必须是 `<button>`（不可聚焦的话"焦点归还 trigger"永远等不到）。
 * trigger / positioner / content 三者靠各自的 value 属性配对，同一项写同一个值。
 *
 * @customElement xh-menubar
 * @attr {string} value - 受控展开项；缺省该属性即非受控
 * @attr {string} default-value - 非受控的初始展开项
 * @attr {'horizontal'|'vertical'} orientation - 菜单栏排布轴，默认 horizontal；决定方向键在 trigger 之间走哪一对键
 * @attr {boolean} loop - 方向键走到尽头回绕，默认 true；写 loop="false" 关掉
 * @attr {'ltr'|'rtl'} dir - 文字方向，只影响水平轴上 ArrowLeft/ArrowRight 的前后语义
 * @attr {boolean} disabled - 整条菜单栏禁用
 * @attr {boolean} typeahead - 菜单内的连打检索，默认开；写 typeahead="false" 关掉
 * @attr {string} placement - 首选放置位，默认 bottom-start；避让后的实际位写在 data-placement 上
 * @attr {number} offset - 浮层与锚点的间距（px）
 * @fires value-change - 展开项变化；detail 为 `{ value: string | null }`
 * @fires select - 条目被选中（菜单随之收起）；detail 为 `{ menu: string, value: string }`
 * @csspart root - role=menubar 容器，承载 roving tabindex 的兜底 Tab 位与焦点离场
 * @csspart trigger - role=menuitem 的展开按钮，须自带 value 属性标识身份；禁用写 aria-disabled="true"
 * @csspart positioner - 浮层定位容器，须自带 value 与同项 trigger 配对；坐标由引擎写成内联样式
 * @csspart content - role=menu 容器，须自带 value 与同项 trigger 配对；收起时带 hidden
 * @csspart item - role=menuitem 条目，须自带 value 属性；禁用写 aria-disabled="true"
 * @csspart item-text - 条目文本（连打检索取的就是它），对读屏透明
 * @csspart item-indicator - 条目标记位（勾选符号/图标/快捷键提示），aria-hidden
 * @csspart separator - 分隔线（role=separator，不入方向键导航）
 * @csspart group - 一组条目（role=group），须自带 value 属性
 * @csspart group-label - 分组标题，靠 id 被同组 group 的 aria-labelledby 指着
 */
export class XhMenubarElement extends XhElement {
  // dir 只占属性名、字段改叫 direction：HTMLElement 原生 dir 是 string 访问器，
  // 同名响应式字段会与基类类型打架。属性仍进 observedAttributes，改 dir 照样触发重算。
  // 描述符逐个写全、不用对象展开：CEM 分析器的 lit 插件读不了展开元素的名字，会整个崩掉。
  static override properties = {
    value: { converter: STRING_CONVERTER },
    defaultValue: { converter: STRING_CONVERTER, attribute: 'default-value' },
    orientation: { converter: STRING_CONVERTER },
    loop: { converter: BOOLEAN_CONVERTER },
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
    disabled: { converter: BOOLEAN_CONVERTER },
    typeahead: { converter: BOOLEAN_CONVERTER },
    placement: { converter: STRING_CONVERTER },
    offset: { converter: NUMBER_CONVERTER },
  }

  declare value?: string
  declare defaultValue?: string
  declare orientation?: Orientation
  declare loop?: boolean
  declare direction?: Direction
  declare disabled?: boolean
  declare typeahead?: boolean
  declare placement?: Placement
  declare offset?: number

  private readonly idGen: IdGenerator = createCounterIdGenerator()
  // trigger 与 content 要按 value 逐对互指（aria-controls / aria-labelledby），
  // 那些 id 由 scope 派生，因此这里必须自己建一个
  private readonly barScope = createScope(null, this.idGen)
  private readonly positionEngine: PositionEnginePort = createFloatingUiPositionEngine()
  private config: RuntimeConfig | null = null

  private readonly notifyValue = (details: MenubarValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifySelect = (details: MenubarSelectDetails): void => {
    this.dispatchEvent(new CustomEvent('select', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<MenubarSchema>(
    this,
    menubarMachine,
    () => this.machineProps(),
    { scope: this.barScope, onBuilt: svc => this.injectRefs(svc) },
  )

  private machineProps(): Partial<MenubarSchema['props']> {
    return {
      value: this.value,
      defaultValue: this.defaultValue,
      orientation: this.orientation,
      // 布尔属性缺席即 undefined，把缺省交回 connect（回绕与连打默认开）
      loop: this.loop,
      dir: this.direction,
      disabled: this.disabled,
      typeahead: this.typeahead,
      placement: this.placement,
      offset: this.offset,
      onValueChange: this.notifyValue,
      onSelect: this.notifySelect,
    }
  }

  /** 按作者写的 value 取某一项的角色节点；菜单栏同时只展开一张，浮层三件套都靠它解析。 */
  private partFor(name: string, value: string | null): HTMLElement | null {
    if (value == null)
      return null
    return this.getParts(name).find(el => el.getAttribute('value') === value) ?? null
  }

  private openValue(): string | null {
    return this.ctrl.service.context.get('value') ?? null
  }

  private ensureConfig(): void {
    if (this.config)
      return
    this.config = createRuntimeConfig({ scope: this.barScope, idGenerator: this.idGen })
  }

  // 只交注册函数、不在连接期注册：层的入栈出栈跟着"有没有菜单展开"走（机器的 trackLayer 效应负责）。
  // 连接期就注册会让层与开合无关地常驻栈里，把同页其它层的 Escape 堵死。
  private readonly registerLayer = (): { layer: Layer, dispose: Cleanup } => {
    this.ensureConfig()
    return this.config!.layerRegistry.register({
      kind: 'popover',
      node: () => this.partFor('content', this.openValue()),
      // 整条菜单栏记为本层分支：点 trigger、在 trigger 之间走、掠过换菜单都是层内交互，
      // 开合归菜单栏自己切换。交给消解层判的话，一次点击会先被判成层外交互关一次、
      // 再被 click 打开一次，菜单等于关不掉。
      branches: () => [this.getPart('root')].filter(Boolean) as Element[],
      isModal: () => false,
      setModal: () => {},
      // 菜单不带遮罩，没有"点它就该关本层"的表面
      surfaces: () => [],
    })
  }

  // onBuilt 在 ctrl 构造期就跑（此刻 this.ctrl 尚未赋值），故 service 由参数传入。
  private injectRefs(svc: Service<MenubarSchema>): void {
    this.ensureConfig()
    svc.refs.set('config', this.config)
    svc.refs.set('registerLayer', this.registerLayer)
    svc.refs.set('position', this.positionEngine)
    svc.refs.set('getAnchorEl', () => this.partFor('trigger', this.openValue()))
    svc.refs.set('getFloatingEl', () => this.partFor('positioner', this.openValue()))
    svc.refs.set('getContentEl', () => this.partFor('content', this.openValue()))
    svc.refs.set('getRootEl', () => this.getPart('root'))
  }

  /**
   * 角色节点提前发现一次：default-value 时机器在 hostConnected 当场进入展开态，
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
    const focusedItem = context.get('focusedItem')
    if (focusedItem == null)
      return
    // 只认 item：trigger 与 content 也带 data-value，按部件名过滤才不会误判
    if (nodes.some(el => el.dataset.xhPart === 'item' && el.getAttribute(ITEM_VALUE_ATTR) === focusedItem))
      send({ type: 'ITEM.LOST' })
  }

  // 条目/分组内的子部件：getParts 收的是整个元素范围，按子树过滤才归得对。
  private partsIn(owner: HTMLElement, name: string): HTMLElement[] {
    return this.getParts(name).filter(el => owner.contains(el))
  }

  protected wire(): void {
    const api = connectMenubar(this.ctrl.service, wcNormalize)

    const root = this.getPart('root')
    if (root)
      this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)

    // trigger 是多实例 part，逐个打：身份取作者写的 value，禁用经 authorDisabled 归一到 aria-disabled。
    // 打上去的 data-scope/data-part/data-value 正是方向键在事件那一刻查 DOM 的依据，
    // 所以 wire 必须先于事件跑过——updated() 已保证。
    for (const el of this.getParts('trigger')) {
      const props = api.getTriggerProps({
        value: el.getAttribute('value') ?? '',
        disabled: authorDisabled(el),
      })
      this.spreader.spread(el, props as Record<string, unknown>)
    }

    // positioner 的 style 是对象（position/insetInlineStart/insetBlockStart），
    // spreader 见对象 style 会逐条写内联样式，直接 spread 即可。
    for (const el of this.getParts('positioner'))
      this.spreader.spread(el, api.getPositionerProps({ value: el.getAttribute('value') ?? '' }) as Record<string, unknown>)

    // 菜单常挂，未展开的由 connect 输出 hidden；styled 给 content 设了 display，
    // 那条声明会盖过 UA 的 [hidden]{display:none}，得用内联 style.display 压住。
    // 判据直接取 connect 这一帧的产出，不另起一套：两边各判一次迟早会说岔。
    for (const el of this.getParts('content')) {
      const props = api.getContentProps({ value: el.getAttribute('value') ?? '' }) as Record<string, unknown>
      this.spreader.spread(el, props)
      this.setPartHidden(el, props.hidden === true)
    }

    for (const el of this.getParts('group')) {
      const group = { value: el.getAttribute('value') ?? '' }
      this.spreader.spread(el, api.getGroupProps(group) as Record<string, unknown>)
      for (const label of this.partsIn(el, 'group-label'))
        this.spreader.spread(label, api.getGroupLabelProps(group) as Record<string, unknown>)
    }

    for (const el of this.getParts('item')) {
      const item: MenubarItemProps = {
        value: el.getAttribute('value') ?? '',
        disabled: authorDisabled(el),
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
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    // 层由展开态的效应自己入栈出栈，断开时机器停机会一并撤掉，这里无需再管
    this.config = null // 重连时 ensureConfig 重建
  }
}
