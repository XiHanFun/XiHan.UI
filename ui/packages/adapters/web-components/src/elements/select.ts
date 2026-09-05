import type { Cleanup, ControlVariant, Direction, IdGenerator, Layer, Placement, PositionEnginePort, RuntimeConfig, Service, Size, Tone } from '@xihan-ui/core'
import type { SelectItemProps, SelectNode, SelectOpenChangeDetails, SelectSchema, SelectTagMeta, SelectValueChangeDetails } from '@xihan-ui/headless'
import type { OverlayExit } from '../overlay-exit'
import { createCounterIdGenerator, createRuntimeConfig, createScope, isItemDisabled, ITEM_VALUE_ATTR } from '@xihan-ui/core'
import { connectSelect, selectAnatomy, selectMachine, selectMeta } from '@xihan-ui/headless'
import { createPositionEngine } from '@xihan-ui/position'
import { createDeclaredDisabled } from '../dom/declared-disabled'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { createOverlayExit } from '../overlay-exit'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : Number(v)) }
// 三态布尔：缺席=undefined（走缺省）、在场=true、显式写 "false"=false。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-select>` —— Light-DOM 行为宿主：用户写 root/trigger/value-text/positioner/content/item/...
 * 角色节点，元素跑 select 机器并把 connect 产出打上去。浮层定位引擎在本元素里建好、经 refs 注入机器，
 * 锚点取 trigger、被定位的浮层取 positioner。
 * 条目身份取用户写在 item 上的 value 属性，禁用由部件自报（aria-disabled）。
 *
 * value-text 的显示文字与表单影子 hidden-select 的选项由元素代填，作者只需给出空节点；
 * value-text 里作者写了内容就归作者，元素不再改写。
 *
 * @customElement xh-select
 * @attr {string} value - 受控选中值；缺省该属性即非受控。多选集合请写 property，属性只递得进单值
 * @attr {string} default-value - 非受控初始选中值。多选集合请写 property，属性只递得进单值
 * @attr {boolean} open - 受控开合；缺省该属性即非受控
 * @attr {boolean} default-open - 非受控初始为展开
 * @attr {boolean} disabled - 整个控件禁用：trigger 用原生 disabled，表单影子不参与提交
 * @attr {boolean} read-only - 只读：浮层照常展开、条目照常浏览，但选中值改不动、也清不掉
 * @attr {boolean} invalid - 校验错误态：trigger 标红并输出 aria-invalid
 * @attr {number} max-tag-count - 多选标签最多摆几个，其余折进 api 的 overflowCount；缺省全摆
 * @attr {boolean} required - 原生表单校验：无选中值时提交被拦下；多选下的门槛是至少选中一项
 * @attr {string} name - 表单字段名；给定后表单影子才带 name 并参与提交
 * @attr {string} placeholder - 无选中时 value-text 显示的占位文字
 * @attr {string} placement - 首选放置位，默认 bottom-start；避让后的实际位写在 data-placement 上
 * @attr {number} offset - 浮层与锚点的间距（px）
 * @attr {boolean} loop - 方向键走到尽头回绕，默认 true；写 loop="false" 关掉
 * @attr {boolean} multiple - 多选：点中即在集合里增删该项，列表不收起；存在即开，关掉要摘属性（不同于 loop，写 multiple="false" 仍是开）
 * @attr {'ltr'|'rtl'} dir - 文字方向，默认 ltr
 * @attr {'outline'|'subtle'|'ghost'} variant - 视觉变体
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @fires value-change - 选中值变化；detail 为 `{ value: string[] }`
 * @fires open-change - open 状态变化；detail 为 `{ open: boolean }`
 * @csspart root - 组件根容器（承载 data-state/data-disabled，也是表单影子的定位基准）
 * @csspart label - 组标题（aria-labelledby 目标）
 * @csspart trigger - 触发按钮（aria-haspopup=listbox/aria-expanded/aria-controls 所在），同时是定位锚点，须是原生 button
 * @csspart value-text - 选中项文本的显示位；留空即由元素填入 displayText，作者写了内容则归作者
 * @csspart indicator - 展开指示符（aria-hidden，data-state 随开合）
 * @csspart control - 盒：触发器与清空按钮在里面并排，描边、底色、控件高度与聚焦环都长在它上面
 * @csspart clear-trigger - 清空按钮：盒里 trigger 的兄弟节点，不占 Tab 位；清不了（无值 / 禁用 / 只读）时带 hidden，点完焦点送回 trigger；可及名走 translations.clearTrigger
 * @csspart tag - 多选标签，须自带 value 属性标识选中值；放触发器里是纯展示，放外面配 item-delete-trigger 可删
 * @csspart item-delete-trigger - 标签删除按钮，须放在 tag 里；点按摘掉所在标签的选中值，可及名走 translations.deleteItem
 * @csspart positioner - 浮层定位容器，坐标由引擎写成内联样式
 * @csspart content - 浮层外壳（焦点域与消解层的根节点，键盘在此收口），收起时带 hidden
 * @csspart list - role=listbox 本体，条目放在它里面；滚动也在这一层
 * @csspart footer - 浮层底部的操作区，是 list 的兄弟；不进列表框的拥有关系，方向键与连打检索也不认它
 * @csspart item - role=option 条目，须自带 value 属性标识身份；禁用写 aria-disabled="true"
 * @csspart item-text - 条目文本（连打检索与 value-text 的取字处）
 * @csspart item-indicator - 条目选中标记（aria-hidden）
 * @csspart hidden-select - 表单影子，须是原生 select 空壳；选项由元素按当前值补齐（多选时开原生 multiple），省略该节点即不参与表单
 */
export class XhSelectElement extends XhElement {
  static override partContract = { anatomy: selectAnatomy, meta: selectMeta }

  // dir 只占属性名、字段改叫 direction，避开 HTMLElement 原生 dir 访问器。
  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    // 数组只走 property，属性表达不了；给了它条目的文本与禁用即以数据为准
    collection: { attribute: false },
    value: { converter: STRING_CONVERTER },
    defaultValue: { converter: STRING_CONVERTER, attribute: 'default-value' },
    open: { converter: BOOLEAN_CONVERTER },
    defaultOpen: { type: Boolean, attribute: 'default-open' },
    disabled: { type: Boolean },
    readOnly: { converter: BOOLEAN_CONVERTER, attribute: 'read-only' },
    invalid: { type: Boolean },
    required: { type: Boolean },
    name: { converter: STRING_CONVERTER },
    placeholder: { converter: STRING_CONVERTER },
    placement: { converter: STRING_CONVERTER },
    offset: { converter: NUMBER_CONVERTER },
    loop: { converter: BOOLEAN_CONVERTER },
    multiple: { type: Boolean },
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
    variant: { converter: STRING_CONVERTER },
    tone: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
    translations: { attribute: false },
    maxTagCount: { converter: NUMBER_CONVERTER, attribute: 'max-tag-count' },
  }

  // 属性只递得进单值，多选集合走 property
  declare collection?: SelectNode[]
  declare value?: string | string[]
  declare defaultValue?: string | string[]
  declare open?: boolean
  declare defaultOpen?: boolean
  declare disabled?: boolean
  declare readOnly?: boolean
  declare invalid?: boolean
  declare required?: boolean
  declare name?: string
  declare placeholder?: string
  declare placement?: Placement
  declare offset?: number
  declare loop?: boolean
  declare multiple?: boolean
  declare direction?: Direction
  declare variant?: ControlVariant
  declare tone?: Tone
  declare size?: Size
  /** 读屏文案（clearTrigger 等）；对象进不了属性，只作为 property 暴露。 */
  declare translations?: SelectSchema['props']['translations']
  declare maxTagCount?: number

  private readonly idGen: IdGenerator = createCounterIdGenerator()
  private readonly selectScope = createScope(null, this.idGen)
  private readonly positionEngine: PositionEnginePort = createPositionEngine()
  private config: RuntimeConfig | null = null
  /** 退场闸门：收起从跟着 open 走改成跟着 presence 走，退场动画播完才真收。 */
  private exit: OverlayExit | null = null

  /** value-text 是否归元素填：首次见到该节点时定，之后不再回读（回读到的会是自己写的字）。 */
  private readonly ownsValueText = new WeakMap<HTMLElement, boolean>()
  /** 表单影子当前这批选项对应的值与文字，同一份不重建。 */
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

  /** 作者声明的条目禁用，只认首见那一份；给了 collection 时用它，否则现读 */
  private readonly declaredDisabled = createDeclaredDisabled()

  private machineProps(): Partial<SelectSchema['props']> {
    return {
      collection: this.collection,
      value: this.value,
      defaultValue: this.defaultValue ?? null,
      open: this.open,
      defaultOpen: this.defaultOpen ?? false,
      disabled: this.disabled ?? false,
      readOnly: this.readOnly ?? false,
      invalid: this.invalid ?? false,
      required: this.required ?? false,
      name: this.name,
      placeholder: this.placeholder,
      placement: this.placement,
      offset: this.offset,
      loop: this.loop,
      multiple: this.multiple ?? false,
      dir: this.direction,
      variant: this.variant,
      tone: this.tone,
      size: this.size,
      translations: this.translations,
      maxTagCount: this.maxTagCount,
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
  private readonly registerLayer = (): { layer: Layer, dispose: Cleanup } => {
    this.ensureConfig()
    return this.config!.layerRegistry.register({
      kind: 'popover',
      node: () => this.getPart('content'),
      // trigger 记为本层分支：点它算层内交互，开合交给 trigger 自己切换。
      branches: () => [this.getPart('trigger')].filter(Boolean) as Element[],
      isModal: () => false,
      setModal: () => {},
      // 列表不带遮罩，无可点关闭的表面
      surfaces: () => [],
    })
  }

  // onBuilt 在 ctrl 构造期就跑，service 由参数传入。
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
   * 提前发现一次角色节点：机器在 hostConnected 当场要按当前值去 content 里现查显示文本，
   * default-open 时还要同场挑出高亮锚点。
   */
  override connectedCallback(): void {
    this.refreshParts()
    super.connectedCallback()
  }

  /**
   * 承载焦点的条目被移出 DOM 时上报 ITEM.LOST，让机器按当前数据重挑高亮锚点。
   * 判据是「焦点已不在列表内」且离场的正是持有锚点的那个条目。
   */
  protected override onPartsReleased(nodes: readonly HTMLElement[]): void {
    const { context, getStatus, scope, send } = this.ctrl.service
    // 机器已停机则跳过
    if (getStatus() !== 'Started')
      return
    // 收起态无高亮锚点
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

  // 取 item 子树内指定名字的角色节点。
  private partsIn(item: HTMLElement, name: string): HTMLElement[] {
    return this.getParts(name).filter(el => item.contains(el))
  }

  /** 填入选中项显示文字；首次见到该节点时若已有内容则归作者，之后不再改写。 */
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
   * 给表单影子补齐选项：空串选项是无选中时的落点，每个选中值一个 selected 选项。
   * 必须晚于属性写入：multiple 还没落到元素上时，单选 select 每收下一个 selected 选项
   * 就会跑一次原生「ask for a reset」，把前面的选中全撤掉。
   */
  private syncHiddenOptions(el: HTMLElement, values: string[], texts: string[], multiple: boolean): void {
    // 键要能无歧义还原这一批选项：值里带分隔符时拼接式键会碰撞，选项就不会重建。
    // multiple 也算进键里，否则运行期翻转多选而值不变时选项不重建，选中态会停在旧模式上。
    const key = JSON.stringify([values, texts, multiple])
    if (this.hiddenOptionKey.get(el) === key)
      return
    this.hiddenOptionKey.set(el, key)
    el.textContent = ''
    const blank = this.ownerDocument.createElement('option')
    blank.value = ''
    el.appendChild(blank)
    // 选中态一律靠选项的 selected 表达，多选下 select.value 表达不了集合
    for (const [i, v] of values.entries()) {
      const option = this.ownerDocument.createElement('option')
      option.value = v
      option.textContent = texts[i] ?? v
      option.selected = true
      el.appendChild(option)
    }
  }

  /**
   * 该摆出来的标签（值 + 显示文本），已按 max-tag-count 截断，与选中先后同序。
   * 作者据它渲染 tag 部件。机器尚未建起时给空数组。
   */
  get tags(): SelectTagMeta[] {
    return this.ctrl.service ? connectSelect(this.ctrl.service, wcNormalize).tags : []
  }

  /** 被 max-tag-count 折起来的标签数，作者据它渲染 +N。机器尚未建起时为 0。 */
  get overflowCount(): number {
    return this.ctrl.service ? connectSelect(this.ctrl.service, wcNormalize).overflowCount : 0
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
    put('control', api.getControlProps() as Record<string, unknown>)
    put('trigger', api.getTriggerProps() as Record<string, unknown>)
    put('indicator', api.getIndicatorProps() as Record<string, unknown>)
    put('clear-trigger', api.getClearTriggerProps() as Record<string, unknown>)

    // 标签是多实例 part：身份取自己（或所在 tag）的 value 属性
    for (const el of this.getParts('tag'))
      this.spreader.spread(el, api.getTagProps({ value: el.getAttribute('value') ?? '' }) as Record<string, unknown>)
    for (const el of this.getParts('item-delete-trigger')) {
      const owner = el.closest<HTMLElement>('[data-xh-part="tag"]')
      this.spreader.spread(el, api.getItemDeleteTriggerProps({ value: owner?.getAttribute('value') ?? '' }) as Record<string, unknown>)
    }
    // positioner 的 style 是对象，spreader 会逐条写成内联样式
    put('positioner', api.getPositionerProps() as Record<string, unknown>)
    put('content', api.getContentProps() as Record<string, unknown>)
    put('list', api.getListProps() as Record<string, unknown>)
    put('footer', api.getFooterProps() as Record<string, unknown>)

    // 属性先落，再填显示文字
    const valueText = this.getPart('value-text')
    if (valueText) {
      this.spreader.spread(valueText, api.getValueTextProps() as Record<string, unknown>)
      this.fillValueText(valueText, api.displayText)
    }

    // 表单影子可缺省
    const hiddenSelect = this.getPart('hidden-select')
    if (hiddenSelect) {
      this.spreader.spread(hiddenSelect, api.getHiddenSelectProps() as Record<string, unknown>)
      this.syncHiddenOptions(hiddenSelect, api.value, api.valueText, api.multiple)
    }

    // 条目逐个打：身份取作者写的 value，禁用取部件自报的 aria-disabled。
    // wire 跑在事件之前，按键时 data-scope/data-part/data-value 已在 DOM 上供方向键与连打检索现查。
    for (const el of this.getParts('item')) {
      const item: SelectItemProps = {
        value: el.getAttribute('value') ?? '',
        disabled: this.collection ? this.declaredDisabled(el) : isItemDisabled(el),
      }
      this.spreader.spread(el, api.getItemProps(item) as Record<string, unknown>)
      // 条目内的文本与选中标记跟着同一份声明走
      for (const text of this.partsIn(el, 'item-text'))
        this.spreader.spread(text, api.getItemTextProps(item) as Record<string, unknown>)
      for (const indicator of this.partsIn(el, 'item-indicator'))
        this.spreader.spread(indicator, api.getItemIndicatorProps(item) as Record<string, unknown>)
    }

    // content 常驻，用内联 display 收起（作者层的 display 声明会盖过 [hidden]）
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
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    // 退场没播完就离场：立刻结清并收起，否则作者的节点会带着已被撤掉的 data-state 留在页面上
    this.exit?.dispose()
    this.exit = null
    if (this.ctrl.service.state.get() !== 'open')
      this.setPartHidden(this.getPart('content'), true)
    // 层随机器停机一并撤掉，此处不再管
    this.config = null // 重连时 ensureConfig 重建
  }
}
