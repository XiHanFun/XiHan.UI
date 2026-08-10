import type {
  ListboxSchema,
  ListboxValueChangeDetails,
  PopoverOpenChangeDetails,
  PopoverSchema,
  PopselectItemProps,
  PopselectNode,
} from '@xihan-ui/headless'
import type { Cleanup, Direction, IdGenerator, Layer, Placement, PositionEnginePort, RuntimeConfig } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import { ITEM_VALUE_ATTR } from '@xihan-ui/behavior'
import { connectPopselect, listboxMachine, popoverMachine, popselectAnatomy, popselectMeta } from '@xihan-ui/headless'
import { createCounterIdGenerator, createRuntimeConfig, createScope } from '@xihan-ui/kernel'
import { createPositionEngine } from '@xihan-ui/position'
import { createDeclaredDisabled } from '../dom/declared-disabled'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定
// （value 尤其：落成 null 就分不出「非受控」与「受控且当前无选中」）。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : Number(v)) }
// 三态布尔：缺席=undefined（走缺省）、在场=true、显式写 "false"=false。
// 缺省为真的开关（方向键回绕、连打检索、Esc 关闭）只有三态才关得掉。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-popselect>` —— Light-DOM 行为宿主：作者写 root/trigger/positioner/content/item 角色节点，
 * 元素同时跑两台机器——浮层开合、定位、消解层与焦点域归 popover，选中集合与焦点锚点归 listbox——
 * 再把 connectPopselect 的产出打到各角色节点上。定位引擎在本元素里建好、经 refs 注入 popover 机器，
 * 锚点取 trigger、被定位的浮层取 positioner。
 *
 * 条目身份取作者写在 item 上的 value 属性，禁用由条目自报 aria-disabled 或写进 collection。
 * 单选落值即收起浮层、焦点归还 trigger；多选保持展开继续挑。
 *
 * 选中值是集合：单选可以直接写 value="apple" 属性，多选只能走 property（`el.value = ['a','b']`），
 * 属性表达不了数组。
 *
 * @customElement xh-popselect
 * @attr {string} value - 受控选中值（单选简写）；缺省该属性即非受控，多选请用 property
 * @attr {string} default-value - 非受控初始选中值
 * @attr {boolean} multiple - 多选：落值即在集合里增删该项，浮层不收起
 * @attr {boolean} disabled - 整个控件禁用：trigger 用原生 disabled，键盘与点击都改不了选中值
 * @attr {boolean} loop - 方向键走到尽头回绕，默认 true；写 loop="false" 关掉
 * @attr {boolean} typeahead - 连打检索，默认开；写 typeahead="false" 关掉
 * @attr {'ltr'|'rtl'} dir - 文字方向，只改写左右方向键语义，默认 ltr
 * @attr {boolean} open - 受控开合；缺省该属性即非受控
 * @attr {boolean} default-open - 非受控初始为展开
 * @attr {string} placement - 首选放置位，默认 bottom；避让后的实际位写在 data-placement 上
 * @attr {number} offset - 浮层与锚点的间距（px）
 * @attr {boolean} close-on-escape - Esc 关闭，默认 true；写 close-on-escape="false" 关掉
 * @attr {boolean} close-on-interact-outside - 层外交互关闭，默认 true；写 "false" 关掉
 * @attr {'outline'|'subtle'|'ghost'} variant - 形态，决定触发器的描边与底色怎么用
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气，决定聚焦与选中强调用哪族颜色
 * @attr {'sm'|'md'|'lg'} size - 尺寸，决定触发器高度、内边距与字号档位
 * @fires value-change - 选中集合变化；detail 为 `{ value: string[] }`
 * @fires open-change - open 状态变化；detail 为 `{ open: boolean }`
 * @csspart root - 组件根容器，承载 data-state 与三个视觉轴，浮层从这里继承私有槽
 * @csspart trigger - 触发按钮（aria-haspopup=listbox/aria-expanded/aria-controls 所在），同时是定位锚点，须是原生 button
 * @csspart positioner - 浮层定位容器，坐标由引擎写成内联样式
 * @csspart content - role=listbox 容器（焦点域与消解层的根节点，键盘在此收口），收起时带 hidden
 * @csspart item - role=option 条目，须自带 value 属性标识身份；禁用写 aria-disabled="true"
 * @csspart item-text - 条目文本（连打检索的取字处）
 * @csspart item-indicator - 条目选中标记（aria-hidden）
 */
export class XhPopselectElement extends XhElement {
  static override partContract = { anatomy: popselectAnatomy, meta: popselectMeta }

  // dir 只占属性名、字段改叫 direction：HTMLElement 原生 dir 是 string 访问器，
  // 同名声明既与基类类型冲突，也会盖掉原生反射。
  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    // 数组只走 property，属性表达不了；给了它条目的文本与禁用即以数据为准
    collection: { attribute: false },
    value: { converter: STRING_CONVERTER },
    defaultValue: { converter: STRING_CONVERTER, attribute: 'default-value' },
    multiple: { type: Boolean },
    disabled: { type: Boolean },
    loop: { converter: BOOLEAN_CONVERTER },
    typeahead: { converter: BOOLEAN_CONVERTER },
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
    open: { converter: BOOLEAN_CONVERTER },
    defaultOpen: { type: Boolean, attribute: 'default-open' },
    placement: { converter: STRING_CONVERTER },
    offset: { converter: NUMBER_CONVERTER },
    closeOnEscape: { converter: BOOLEAN_CONVERTER, attribute: 'close-on-escape' },
    closeOnInteractOutside: { converter: BOOLEAN_CONVERTER, attribute: 'close-on-interact-outside' },
    variant: { converter: STRING_CONVERTER },
    tone: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
  }

  declare collection?: PopselectNode[]
  declare value?: string | string[]
  declare defaultValue?: string | string[]
  declare multiple?: boolean
  declare disabled?: boolean
  declare loop?: boolean
  declare typeahead?: boolean
  declare direction?: Direction
  declare open?: boolean
  declare defaultOpen?: boolean
  declare placement?: Placement
  declare offset?: number
  declare closeOnEscape?: boolean
  declare closeOnInteractOutside?: boolean
  declare variant?: string
  declare tone?: string
  declare size?: string

  private readonly idGen: IdGenerator = createCounterIdGenerator()
  // 两台机器共用一个 scope：trigger 与 content 的 id 由它派生，aria-controls 才指得准
  private readonly popselectScope = createScope(null, this.idGen)
  private readonly positionEngine: PositionEnginePort = createPositionEngine()
  private config: RuntimeConfig | null = null

  private readonly notifyOpen = (details: PopoverOpenChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('open-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyValue = (details: ListboxValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly popoverCtrl = new MachineController<PopoverSchema>(
    this,
    popoverMachine,
    () => this.popoverProps(),
    { scope: this.popselectScope, onBuilt: svc => this.injectRefs(svc) },
  )

  // listbox 机器无副作用（连打缓冲住在它自己的 refs 里），不需要 config/layer/定位引擎
  private readonly listboxCtrl = new MachineController<ListboxSchema>(
    this,
    listboxMachine,
    () => this.listboxProps(),
    { scope: this.popselectScope },
  )

  /** 作者声明的条目禁用，只认首见那一份；没写即 undefined，交给 collection 定夺 */
  private readonly declaredDisabled = createDeclaredDisabled()

  private popoverProps(): Partial<PopoverSchema['props']> {
    return {
      open: this.open,
      defaultOpen: this.defaultOpen ?? false,
      placement: this.placement,
      offset: this.offset,
      closeOnEscape: this.closeOnEscape,
      closeOnInteractOutside: this.closeOnInteractOutside,
      // 弹出选择不陷焦点：Tab 走得出去，走出去即由消解层判定收起
      modal: false,
      onOpenChange: this.notifyOpen,
    }
  }

  private listboxProps(): Partial<ListboxSchema['props']> {
    return {
      collection: this.collection,
      value: this.value,
      defaultValue: this.defaultValue,
      multiple: this.multiple ?? false,
      disabled: this.disabled ?? false,
      loop: this.loop,
      typeahead: this.typeahead,
      dir: this.direction,
      onValueChange: this.notifyValue,
    }
  }

  private ensureConfig(): void {
    if (this.config)
      return
    this.config = createRuntimeConfig({ scope: this.popselectScope, idGenerator: this.idGen })
  }

  // 只交注册函数、不在连接期注册：层的入栈出栈跟着展开态走（popover 机器的 trackLayer 效应负责）。
  // 连接期就注册会让层与开合无关地常驻栈里，把同页其它层的 Escape 堵死。
  private readonly registerLayer = (): { layer: Layer, dispose: Cleanup } => {
    this.ensureConfig()
    return this.config!.layerRegistry.register({
      kind: 'popover',
      node: () => this.getPart('content'),
      // trigger 记为本层分支：点它算层内交互，开合交给 trigger 自己切换。
      // 否则同一次点击先被判为层外交互关一次、再被 click 打开一次，浮层等于关不掉。
      branches: () => [this.getPart('trigger')].filter(Boolean) as Element[],
      isModal: () => false,
      setModal: () => {},
      // 列表不带遮罩，没有「点它就该关本层」的表面
      surfaces: () => [],
    })
  }

  // service 由参数传入，不回头去读 this.popoverCtrl：机器重建时这个回调先于赋值跑。
  private injectRefs(svc: Service<PopoverSchema>): void {
    this.ensureConfig()
    svc.refs.set('config', this.config)
    svc.refs.set('registerLayer', this.registerLayer)
    svc.refs.set('position', this.positionEngine)
    svc.refs.set('getAnchorEl', () => this.getPart('trigger'))
    svc.refs.set('getFloatingEl', () => this.getPart('positioner'))
    svc.refs.set('getContentEl', () => this.getPart('content'))
  }

  /**
   * 角色节点提前发现一次：default-open 时 popover 机器在 hostConnected 当场进入 open，
   * 定位副作用同步取一次 trigger/positioner——而常规发现要等首次 updated，
   * 那一刻 partMap 还空着，引擎挂不上，浮层会停在容器左上角。
   */
  override connectedCallback(): void {
    this.refreshParts()
    super.connectedCallback()
  }

  /**
   * 承载焦点的条目被移出 DOM 时浏览器不派 focusout，焦点锚点会停在一个已消失的值上：
   * content 判自己「焦点在列表内」退出 Tab 序列，又没有条目认领得了这个锚点，
   * 整组零个 Tab 停靠点，键盘用户再也进不来。这里替 DOM 把焦点离场如实上报。
   */
  protected override onPartsReleased(nodes: readonly HTMLElement[]): void {
    const { context, getStatus, send } = this.listboxCtrl.service
    // 宿主断开时机器已停机，此刻无焦点可言（送事件还会在 dev 下抛）
    if (getStatus() !== 'Started')
      return
    const focusedValue = context.get('focusedValue')
    if (focusedValue == null)
      return
    // data-value 只写在 item 上，条目内的文本与标记离场不会误判
    if (nodes.some(el => el.getAttribute(ITEM_VALUE_ATTR) === focusedValue))
      send({ type: 'LIST.BLUR' })
  }

  /** 条目身份取作者写的 value，禁用取首见那一份声明（没写即交给 collection 定夺）。 */
  private itemProps(el: HTMLElement): PopselectItemProps {
    return { value: el.getAttribute('value') ?? '', disabled: this.declaredDisabled(el) }
  }

  // 条目内的子部件：getParts 收的是整个元素范围，按子树过滤才归得对。
  private partsIn(owner: HTMLElement, name: string): HTMLElement[] {
    return this.getParts(name).filter(el => owner.contains(el))
  }

  protected wire(): void {
    const api = connectPopselect({
      popover: this.popoverCtrl.service,
      listbox: this.listboxCtrl.service,
      props: { variant: this.variant, tone: this.tone, size: this.size },
    }, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('trigger', api.getTriggerProps() as Record<string, unknown>)
    // positioner 的 style 是对象（position/insetInlineStart/insetBlockStart），
    // spreader 见对象 style 会逐条写内联样式，直接 spread 即可
    put('positioner', api.getPositionerProps() as Record<string, unknown>)
    put('content', api.getContentProps() as Record<string, unknown>)

    // 条目是多实例 part，逐个打；条目内的文本与选中标记跟着同一份声明走，样式层各处状态一致
    for (const el of this.getParts('item')) {
      const item = this.itemProps(el)
      this.spreader.spread(el, api.getItemProps(item) as Record<string, unknown>)
      for (const text of this.partsIn(el, 'item-text'))
        this.spreader.spread(text, api.getItemTextProps(item) as Record<string, unknown>)
      for (const indicator of this.partsIn(el, 'item-indicator'))
        this.spreader.spread(indicator, api.getItemIndicatorProps(item) as Record<string, unknown>)
    }

    // Light DOM content 常驻，WC 自管可见性：皮肤给 content 设了 display:flex，
    // 那条声明会盖过 UA 的 [hidden]{display:none}，只有内联 style.display 压得住。
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
