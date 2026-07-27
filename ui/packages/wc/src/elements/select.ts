import type { Cleanup, Direction, IdGenerator, Layer, Placement, PositionEnginePort, RuntimeConfig } from '@xihan-ui/core'
import type { SelectItemProps, SelectOpenChangeDetails, SelectSchema, SelectValueChangeDetails } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import { isItemDisabled, ITEM_VALUE_ATTR } from '@xihan-ui/behavior'
import { createCounterIdGenerator, createRuntimeConfig, createScope } from '@xihan-ui/core'
import { connectSelect, selectMachine } from '@xihan-ui/headless'
import { createFloatingUiPositionEngine } from '@xihan-ui/position-floating-ui'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席一律翻成 undefined：缺省值的唯一事实源留在机器与 connect 里。
// Lit 自带的转换器会把缺席落成 null / false，那样属性就再也表达不了"未指定"
// （value 尤其：落成 null 就分不出"非受控"与"受控且当前无选中"）。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : Number(v)) }
// 三态布尔：缺席=undefined（走缺省）、在场=true、显式写 "false"=false。
// 缺省为真的开关（方向键回绕）只有三态才关得掉。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-select>` —— Light-DOM 行为宿主：用户写 root/trigger/value-text/positioner/content/item/...
 * 角色节点，元素跑 select 机器并把 connect 产出打上去。浮层定位引擎在本元素里建好、经 refs 注入机器，
 * 锚点取 trigger、被定位的浮层取 positioner；机器只认端口，不认识具体引擎。
 * 条目身份取用户写在 item 上的 value 属性，禁用由部件自报（aria-disabled）。
 *
 * 两处内容由元素代填，作者只需给出空节点：value-text 的显示文字（选中项的文本住在列表里，
 * 作者写不出来）与表单影子 hidden-select 的选项。value-text 里作者写了内容就归作者，元素不再改写。
 *
 * @customElement xh-select
 * @attr {string} value - 受控选中值；缺省该属性即非受控
 * @attr {string} default-value - 非受控初始选中值
 * @attr {boolean} open - 受控开合；缺省该属性即非受控
 * @attr {boolean} default-open - 非受控初始为展开
 * @attr {boolean} disabled - 整个控件禁用：trigger 用原生 disabled，表单影子不参与提交
 * @attr {boolean} required - 原生表单校验：无选中值时提交被拦下
 * @attr {string} name - 表单字段名；给定后表单影子才带 name 并参与提交
 * @attr {string} placeholder - 无选中时 value-text 显示的占位文字
 * @attr {string} placement - 首选放置位，默认 bottom-start；避让后的实际位写在 data-placement 上
 * @attr {number} offset - 浮层与锚点的间距（px）
 * @attr {boolean} loop - 方向键走到尽头回绕，默认 true；写 loop="false" 关掉
 * @attr {'ltr'|'rtl'} dir - 文字方向，默认 ltr
 * @fires value-change - 选中值变化；detail 为 `{ value: string | null }`
 * @fires open-change - open 状态变化；detail 为 `{ open: boolean }`
 * @csspart root - 组件根容器（承载 data-state/data-disabled，也是表单影子的定位基准）
 * @csspart label - 组标题（aria-labelledby 目标）
 * @csspart trigger - 触发按钮（aria-haspopup=listbox/aria-expanded/aria-controls 所在），同时是定位锚点，须是原生 button
 * @csspart value-text - 选中项文本的显示位；留空即由元素填入 displayText，作者写了内容则归作者
 * @csspart indicator - 展开指示符（aria-hidden，data-state 随开合）
 * @csspart positioner - 浮层定位容器，坐标由引擎写成内联样式
 * @csspart content - role=listbox 容器（焦点域与消解层的根节点，键盘在此收口），收起时带 hidden
 * @csspart item - role=option 条目，须自带 value 属性标识身份；禁用写 aria-disabled="true"
 * @csspart item-text - 条目文本（连打检索与 value-text 的取字处）
 * @csspart item-indicator - 条目选中标记（aria-hidden）
 * @csspart hidden-select - 表单影子，须是原生 select 空壳；选项由元素按当前值补齐，省略该节点即不参与表单
 */
export class XhSelectElement extends XhElement {
  // dir 只占属性名、字段改叫 direction：HTMLElement 原生 dir 是 string 访问器，
  // 同名响应式字段会与基类类型打架。属性仍进 observedAttributes，改 dir 照样触发重算。
  // 描述符逐个写全、不用对象展开：CEM 分析器的 lit 插件读不了展开元素的名字，会整个崩掉。
  static override properties = {
    value: { converter: STRING_CONVERTER },
    defaultValue: { converter: STRING_CONVERTER, attribute: 'default-value' },
    open: { converter: BOOLEAN_CONVERTER },
    defaultOpen: { type: Boolean, attribute: 'default-open' },
    disabled: { type: Boolean },
    required: { type: Boolean },
    name: { converter: STRING_CONVERTER },
    placeholder: { converter: STRING_CONVERTER },
    placement: { converter: STRING_CONVERTER },
    offset: { converter: NUMBER_CONVERTER },
    loop: { converter: BOOLEAN_CONVERTER },
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
  }

  declare value?: string
  declare defaultValue?: string
  declare open?: boolean
  declare defaultOpen?: boolean
  declare disabled?: boolean
  declare required?: boolean
  declare name?: string
  declare placeholder?: string
  declare placement?: Placement
  declare offset?: number
  declare loop?: boolean
  declare direction?: Direction

  private readonly idGen: IdGenerator = createCounterIdGenerator()
  private readonly selectScope = createScope(null, this.idGen)
  private readonly positionEngine: PositionEnginePort = createFloatingUiPositionEngine()
  private config: RuntimeConfig | null = null

  /** value-text 是否归元素填：首次见到该节点时定，之后不再回读（读到的会是自己写的字）。 */
  private readonly ownsValueText = new WeakMap<HTMLElement, boolean>()
  /** 表单影子当前这批选项对应的值与文字，同一份不重建，免得每帧空转拆装 DOM。 */
  private readonly hiddenOptionKey = new WeakMap<HTMLElement, string>()

  private readonly notifyValue = (details: SelectValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyOpen = (details: SelectOpenChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('open-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<SelectSchema>(
    this,
    selectMachine,
    () => this.machineProps(),
    { scope: this.selectScope, onBuilt: svc => this.injectRefs(svc) },
  )

  private machineProps(): Partial<SelectSchema['props']> {
    return {
      value: this.value,
      defaultValue: this.defaultValue ?? null,
      open: this.open,
      defaultOpen: this.defaultOpen ?? false,
      disabled: this.disabled ?? false,
      required: this.required ?? false,
      name: this.name,
      placeholder: this.placeholder,
      placement: this.placement,
      offset: this.offset,
      loop: this.loop,
      dir: this.direction,
      onValueChange: this.notifyValue,
      onOpenChange: this.notifyOpen,
    }
  }

  private ensureConfig(): void {
    if (this.config)
      return
    this.config = createRuntimeConfig({ scope: this.selectScope, idGenerator: this.idGen })
  }

  // 只交注册函数、不在连接期注册：层的入栈出栈跟着展开态走（机器的 trackLayer 效应负责）。
  // 连接期就注册会让层与开合无关地常驻栈里，把同页其它层的 Escape 堵死。
  private readonly registerLayer = (): { layer: Layer, dispose: Cleanup } => {
    this.ensureConfig()
    return this.config!.layerRegistry.register({
      kind: 'popover',
      node: () => this.getPart('content'),
      // trigger 记为本层分支：点它算层内交互，开合交给 trigger 自己切换。
      // 否则同一次点击先被判为层外交互关一次、再被 click 打开一次，列表等于关不掉。
      branches: () => [this.getPart('trigger')].filter(Boolean) as Element[],
      isModal: () => false,
      setModal: () => {},
      // 列表不带遮罩，没有"点它就该关本层"的表面
      surfaces: () => [],
    })
  }

  // onBuilt 在 ctrl 构造期就跑（此刻 this.ctrl 尚未赋值），故 service 由参数传入。
  private injectRefs(svc: Service<SelectSchema>): void {
    this.ensureConfig()
    svc.refs.set('config', this.config)
    svc.refs.set('registerLayer', this.registerLayer)
    svc.refs.set('position', this.positionEngine)
    svc.refs.set('getAnchorEl', () => this.getPart('trigger'))
    svc.refs.set('getFloatingEl', () => this.getPart('positioner'))
    svc.refs.set('getContentEl', () => this.getPart('content'))
  }

  /**
   * 角色节点提前发现一次：机器在 hostConnected 当场跑挂载动作，要按当前值去 content 里
   * 现查显示文本；default-open 时还要同场挑出高亮锚点。而常规发现要等首次 updated，
   * 那一刻 partMap 还空着，content 取不到。定位是 flush 推迟的（那时 partMap 已就位），
   * 这里只为这两件事补上时机。
   */
  override connectedCallback(): void {
    this.refreshParts()
    super.connectedCallback()
  }

  /**
   * 承载焦点的条目被移出 DOM 时浏览器不派 focusout，高亮锚点会停在一个已消失的值上：
   * 没有条目认领 tabindex=0、方向键也失去起点。这里替 DOM 把焦点离场如实上报，
   * 机器就地按当前活条目重挑锚点。
   *
   * 判据是焦点确实跟着这个节点走了。节点此刻已不在文档里，activeElement 不可能还等于它
   * （浏览器把焦点退还给了 body），于是改判等价事实"焦点已不在列表内"，
   * 再要求离场的正是持有锚点的那个条目——只按值比对，会把"焦点在别处时删掉同值条目"也算成离场。
   */
  protected override onPartsReleased(nodes: readonly HTMLElement[]): void {
    const { context, getStatus, scope, send } = this.ctrl.service
    // 宿主断开时机器已停机，此刻无焦点可言（送事件还会在 dev 下抛）
    if (getStatus() !== 'Started')
      return
    // 收起态无锚点：条目连同 content 一起 hidden，本就不承载焦点
    const highlighted = context.get('highlightedValue')
    if (highlighted == null)
      return
    const content = this.getPart('content')
    const active = scope.getActiveElement()
    if (content && active && content.contains(active))
      return
    // data-value 只写在 item 上，item-text / item-indicator 离场不会误判
    if (nodes.some(el => el.getAttribute(ITEM_VALUE_ATTR) === highlighted))
      send({ type: 'ITEM.LOST' })
  }

  // 条目内的子部件：getParts 收的是整个元素范围，按 item 子树过滤才归得对条目。
  private partsIn(item: HTMLElement, name: string): HTMLElement[] {
    return this.getParts(name).filter(el => item.contains(el))
  }

  /**
   * 选中项的文字只有列表里才有，作者在 trigger 上写不出来，由元素填。
   * 作者若自己写了内容（自定义渲染），首次见到时就定为归作者，之后一概不碰——
   * 每帧回读分不清"作者写的"还是"上一帧自己写的"，一旦写过就再也让不回去。
   */
  private fillValueText(el: HTMLElement, text: string): void {
    let owned = this.ownsValueText.get(el)
    if (owned === undefined) {
      owned = (el.textContent ?? '').trim() === ''
      this.ownsValueText.set(el, owned)
    }
    if (!owned || el.textContent === text)
      return
    el.textContent = text
  }

  /**
   * 表单影子的选项由元素补齐（作者只写空壳 select）：
   * 空串选项是无选中时的落点，required 才判得出"没选"；另一个承载当前值。
   * 必须先于属性写入落地——spread 把 value 当 DOM property 写，目标 option 不在时赋值会被丢掉。
   */
  private syncHiddenOptions(el: HTMLElement, value: string | null, text: string): void {
    const key = value == null ? '' : `${value}\n${text}`
    if (this.hiddenOptionKey.get(el) === key)
      return
    this.hiddenOptionKey.set(el, key)
    el.textContent = ''
    const blank = this.ownerDocument.createElement('option')
    blank.value = ''
    el.appendChild(blank)
    if (value == null)
      return
    const option = this.ownerDocument.createElement('option')
    option.value = value
    option.textContent = text
    el.appendChild(option)
  }

  protected wire(): void {
    const api = connectSelect(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('label', api.getLabelProps() as Record<string, unknown>)
    put('trigger', api.getTriggerProps() as Record<string, unknown>)
    put('indicator', api.getIndicatorProps() as Record<string, unknown>)
    // positioner 的 style 是对象（position/insetInlineStart/insetBlockStart），
    // spreader 见对象 style 会逐条写内联样式，直接 spread 即可。
    put('positioner', api.getPositionerProps() as Record<string, unknown>)
    put('content', api.getContentProps() as Record<string, unknown>)

    // 属性与文字打在同一个节点上：属性先落，显示文字随后（作者写了内容则不填）
    const valueText = this.getPart('value-text')
    if (valueText) {
      this.spreader.spread(valueText, api.getValueTextProps() as Record<string, unknown>)
      this.fillValueText(valueText, api.displayText)
    }

    // 表单影子可缺省：不写这个节点就是不参与表单提交
    const hiddenSelect = this.getPart('hidden-select')
    if (hiddenSelect) {
      this.syncHiddenOptions(hiddenSelect, api.value, api.valueText ?? api.value ?? '')
      this.spreader.spread(hiddenSelect, api.getHiddenSelectProps() as Record<string, unknown>)
    }

    // 条目是多实例 part，逐个打：身份取作者写的 value，禁用取部件自报的 aria-disabled
    // （集合条目一律 aria-disabled，原生 disabled 不可聚焦、也不派 click）。
    // 打上去的 data-scope/data-part/data-value 正是方向键与连打检索在事件那一刻查 DOM 的依据，
    // 所以 wire 必须先于事件跑过——updated() 已保证。
    for (const el of this.getParts('item')) {
      const item: SelectItemProps = {
        value: el.getAttribute('value') ?? '',
        disabled: isItemDisabled(el),
      }
      this.spreader.spread(el, api.getItemProps(item) as Record<string, unknown>)
      // 条目内的文本与选中标记跟着同一份声明走，样式层各处状态一致
      for (const text of this.partsIn(el, 'item-text'))
        this.spreader.spread(text, api.getItemTextProps(item) as Record<string, unknown>)
      for (const indicator of this.partsIn(el, 'item-indicator'))
        this.spreader.spread(indicator, api.getItemIndicatorProps(item) as Record<string, unknown>)
    }

    // Light DOM content 常驻，WC 自管可见性。读 styled/styles/select.css 的结论：
    // content 是 display:flex，positioner 只声明 position/z-index/pointer-events、没有 display，
    // connect 也不给 positioner 发 hidden——所以只兜 content 这一处。
    // 该文件自己带了 [data-part=content][hidden]{display:none} 压住那条 flex，
    // 但宿主不能指望作者装了这份样式：换别家样式给 content 设 display 就又盖过 UA 的
    // [hidden]{display:none}，只有内联 style.display 压得住。
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
