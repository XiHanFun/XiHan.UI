import type {
  ComboboxInputBehavior,
  ComboboxInputEl,
  ComboboxInputHost,
  ComboboxInputValueChangeDetails,
  ComboboxItemProps,
  ComboboxNode,
  ComboboxOpenChangeDetails,
  ComboboxSchema,
  ComboboxValueChangeDetails,
} from '@xihan-ui/headless'
import type { Cleanup, ControlVariant, IdGenerator, Layer, Placement, PositionEnginePort, RuntimeConfig, Size, Tone } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import { isItemDisabled } from '@xihan-ui/behavior'
import { comboboxAnatomy, comboboxMachine, comboboxMeta, connectCombobox } from '@xihan-ui/headless'
import { createCounterIdGenerator, createRuntimeConfig, createScope } from '@xihan-ui/kernel'
import { createPositionEngine } from '@xihan-ui/position'
import { createDeclaredDisabled } from '../dom/declared-disabled'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : Number(v)) }
// 三态布尔：缺席=undefined（走缺省）、在场=true、显式写 "false"=false。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-combobox>` —— Light-DOM 行为宿主：作者写 root/label/control/input/trigger/positioner/content/item/...
 * 角色节点，元素跑 combobox 机器并把 connect 产出打上去。浮层定位引擎在本元素里建好、经 refs 注入机器，
 * 锚点取 control（浮层因此与整个输入行对齐），被定位的浮层取 positioner。
 *
 * 焦点自始至终在 input 上：候选不可聚焦、也不进 Tab 序列，高亮经 aria-activedescendant 报给读屏。
 *
 * 过滤不由本元素做：输入串变化时派发 input-value-change，作者据此增删 item 节点；
 * 元素每次接线完都会把当前候选条数与悬空高亮重新结算一遍，空态节点（empty）据此显形。
 *
 * @customElement xh-combobox
 * @attr {string} value - 受控选中值（单选简写）；缺省该属性即非受控，多选请用 property 传数组
 * @attr {string} default-value - 非受控初始选中值
 * @attr {string} input-value - 受控输入串；缺省该属性即非受控
 * @attr {string} default-input-value - 非受控初始输入串
 * @attr {boolean} open - 受控开合；缺省该属性即非受控
 * @attr {boolean} default-open - 非受控初始为展开
 * @attr {boolean} multiple - 多选：选中后列表不收起、输入串清空以便接着筛
 * @attr {boolean} disabled - 整个控件禁用：输入框与两个按钮都用原生 disabled
 * @attr {boolean} read-only - 只读：文字可选可复制，但展开、选中、清空一概不发生
 * @attr {boolean} invalid - 校验失败标注
 * @attr {boolean} loop - 方向键走到尽头回绕，默认 true；写 loop="false" 关掉
 * @attr {string} placeholder - 输入框占位文字
 * @attr {boolean} allow-custom-value - 允许提交候选列表里没有的值
 * @attr {boolean} open-on-click - 点输入框即展开，默认 false
 * @attr {'none'|'autohighlight'|'autocomplete'} input-behavior - 输入行为，默认 none
 * @attr {string} placement - 首选放置位，默认 bottom-start；避让后的实际位写在 data-placement 上
 * @attr {number} offset - 浮层与锚点的间距（px）
 * @attr {'outline'|'subtle'|'ghost'} variant - 视觉变体
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @fires value-change - 选中集合变化；detail 为 `{ value: string[] }`
 * @fires input-value-change - 输入串变化；detail 为 `{ inputValue: string }`，作者据此过滤候选
 * @fires open-change - open 状态变化；detail 为 `{ open: boolean }`
 * @csspart root - 组件根容器（承载 data-state/data-disabled/data-readonly/data-invalid）
 * @csspart label - 标题，须是原生 label（connect 给的 for 只在它身上生效）
 * @csspart control - 输入行容器，同时是浮层的定位锚点
 * @csspart input - 输入框，整个组合框唯一的 Tab 停靠点；写 input 时带 role=combobox，写 textarea 时保留它自带的 textbox 角色
 * @csspart trigger - 展开/收起按钮，须是原生 button；不占 Tab 位，可及名字由作者给
 * @csspart clear-trigger - 清空按钮，须是原生 button；不占 Tab 位且对读屏隐藏
 * @csspart positioner - 浮层定位容器，坐标由引擎写成内联样式
 * @csspart content - role=listbox 容器（消解层的根节点），收起时带 hidden
 * @csspart item - role=option 候选，须自带 value 属性标识身份；禁用写 aria-disabled="true"
 * @csspart item-text - 候选文本（选中后回填输入框的取字处）
 * @csspart item-indicator - 候选选中标记（aria-hidden）
 * @csspart item-group - role=group 分组容器，须自带 value 属性标识身份
 * @csspart item-group-label - 分组标题（本组 aria-labelledby 的目标）
 * @attr {string} name - 表单字段名；给了 hidden-input 才参与提交（多选按逗号拼成一串）
 * @csspart hidden-input - type=hidden 的表单出口，省略该节点即不参与表单
 * @csspart empty - 无匹配项提示；须放在 positioner 里当 content 的兄弟（列表内只允许 option 与 group）
 */
export class XhComboboxElement extends XhElement {
  static override partContract = { anatomy: comboboxAnatomy, meta: comboboxMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    // 数组只走 property，属性表达不了；给了它候选的文本与禁用即以数据为准
    collection: { attribute: false },
    name: { converter: STRING_CONVERTER },
    value: { converter: STRING_CONVERTER },
    defaultValue: { converter: STRING_CONVERTER, attribute: 'default-value' },
    inputValue: { converter: STRING_CONVERTER, attribute: 'input-value' },
    defaultInputValue: { converter: STRING_CONVERTER, attribute: 'default-input-value' },
    open: { converter: BOOLEAN_CONVERTER },
    defaultOpen: { type: Boolean, attribute: 'default-open' },
    multiple: { type: Boolean },
    disabled: { type: Boolean },
    readOnly: { converter: BOOLEAN_CONVERTER, attribute: 'read-only' },
    invalid: { converter: BOOLEAN_CONVERTER },
    loop: { converter: BOOLEAN_CONVERTER },
    placeholder: { converter: STRING_CONVERTER },
    allowCustomValue: { type: Boolean, attribute: 'allow-custom-value' },
    openOnClick: { type: Boolean, attribute: 'open-on-click' },
    inputBehavior: { converter: STRING_CONVERTER, attribute: 'input-behavior' },
    placement: { converter: STRING_CONVERTER },
    offset: { converter: NUMBER_CONVERTER },
    variant: { converter: STRING_CONVERTER },
    tone: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
  }

  declare collection?: ComboboxNode[]
  declare value?: string | string[]
  declare defaultValue?: string | string[]
  declare inputValue?: string
  declare defaultInputValue?: string
  declare open?: boolean
  declare defaultOpen?: boolean
  declare multiple?: boolean
  declare disabled?: boolean
  declare readOnly?: boolean
  declare invalid?: boolean
  declare loop?: boolean
  declare name?: string
  declare placeholder?: string
  declare allowCustomValue?: boolean
  declare openOnClick?: boolean
  declare inputBehavior?: ComboboxInputBehavior
  declare placement?: Placement
  declare offset?: number
  declare variant?: ControlVariant
  declare tone?: Tone
  declare size?: Size

  private readonly idGen: IdGenerator = createCounterIdGenerator()
  private readonly comboboxScope = createScope(null, this.idGen)
  private readonly positionEngine: PositionEnginePort = createPositionEngine()
  private config: RuntimeConfig | null = null

  private readonly notifyValue = (details: ComboboxValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyInputValue = (details: ComboboxInputValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('input-value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyOpen = (details: ComboboxOpenChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('open-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<ComboboxSchema>(
    this,
    comboboxMachine,
    () => this.machineProps(),
    { scope: this.comboboxScope, onBuilt: svc => this.injectRefs(svc) },
  )

  /** 作者声明的条目禁用，只认首见那一份；给了 collection 时用它，否则现读 */
  private readonly declaredDisabled = createDeclaredDisabled()

  private machineProps(): Partial<ComboboxSchema['props']> {
    return {
      collection: this.collection,
      value: this.value,
      defaultValue: this.defaultValue,
      inputValue: this.inputValue,
      defaultInputValue: this.defaultInputValue,
      open: this.open,
      defaultOpen: this.defaultOpen ?? false,
      multiple: this.multiple ?? false,
      disabled: this.disabled ?? false,
      readOnly: this.readOnly ?? false,
      invalid: this.invalid ?? false,
      loop: this.loop,
      name: this.name,
      placeholder: this.placeholder,
      allowCustomValue: this.allowCustomValue ?? false,
      openOnClick: this.openOnClick ?? false,
      inputBehavior: this.inputBehavior,
      placement: this.placement,
      offset: this.offset,
      variant: this.variant,
      tone: this.tone,
      size: this.size,
      onValueChange: this.notifyValue,
      onInputValueChange: this.notifyInputValue,
      onOpenChange: this.notifyOpen,
    }
  }

  private ensureConfig(): void {
    if (this.config)
      return
    this.config = createRuntimeConfig({ scope: this.comboboxScope, idGenerator: this.idGen })
  }

  // 只交注册函数、不在连接期注册：层的入栈出栈跟着展开态走（机器的 trackLayer 效应负责）。
  private readonly registerLayer = (): { layer: Layer, dispose: Cleanup } => {
    this.ensureConfig()
    return this.config!.layerRegistry.register({
      kind: 'popover',
      node: () => this.getPart('content'),
      // 整个输入行记为本层分支：点输入框或触发按钮算层内交互，开合交给它们自己切换。
      branches: () => [this.getPart('control')].filter(Boolean) as Element[],
      isModal: () => false,
      setModal: () => {},
      // 列表不带遮罩，无可点关闭的表面
      surfaces: () => [],
    })
  }

  // onBuilt 在 ctrl 构造期就跑，service 由参数传入。
  private injectRefs(svc: Service<ComboboxSchema>): void {
    this.ensureConfig()
    svc.refs.set('config', this.config)
    svc.refs.set('registerLayer', this.registerLayer)
    svc.refs.set('position', this.positionEngine)
    svc.refs.set('getAnchorEl', () => this.getPart('control'))
    svc.refs.set('getFloatingEl', () => this.getPart('positioner'))
    svc.refs.set('getContentEl', () => this.getPart('content'))
    svc.refs.set('getInputEl', () => this.getPart('input') as ComboboxInputEl | null)
  }

  /**
   * 提前发现一次角色节点：机器在 hostConnected 当场要按选中值去 content 里现查显示文本并回填输入框，
   * default-open 时还要同场挑出高亮。
   */
  override connectedCallback(): void {
    this.refreshParts()
    super.connectedCallback()
  }

  // 取 owner 子树内指定名字的角色节点。
  private partsIn(owner: HTMLElement, name: string): HTMLElement[] {
    return this.getParts(name).filter(el => owner.contains(el))
  }

  protected wire(): void {
    const api = connectCombobox(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('label', api.getLabelProps() as Record<string, unknown>)
    put('control', api.getControlProps() as Record<string, unknown>)
    // 宿主标签直接读作者写的标记：作者摆的是 input 还是 textarea，DOM 已经说明白了
    const inputHost: ComboboxInputHost = this.getPart('input')?.tagName === 'TEXTAREA' ? 'textarea' : 'input'
    put('input', api.getInputProps({ as: inputHost }) as Record<string, unknown>)
    put('trigger', api.getTriggerProps() as Record<string, unknown>)
    put('clear-trigger', api.getClearTriggerProps() as Record<string, unknown>)
    // positioner 的 style 是对象，spreader 会逐条写成内联样式
    put('positioner', api.getPositionerProps() as Record<string, unknown>)
    put('content', api.getContentProps() as Record<string, unknown>)
    put('empty', api.getEmptyProps() as Record<string, unknown>)
    put('hidden-input', api.getHiddenInputProps() as Record<string, unknown>)

    for (const el of this.getParts('item-group')) {
      const group = { value: el.getAttribute('value') ?? '' }
      this.spreader.spread(el, api.getItemGroupProps(group) as Record<string, unknown>)
      for (const label of this.partsIn(el, 'item-group-label'))
        this.spreader.spread(label, api.getItemGroupLabelProps(group) as Record<string, unknown>)
    }

    // 候选逐个打：身份取作者写的 value，禁用取部件自报的 aria-disabled。
    // 这里回读 aria-disabled 是安全的（整控件禁用不向下传导到候选，写回的就是作者那份声明）。
    // wire 跑在事件之前，按键时 data-scope/data-part/data-value 已在 DOM 上供方向键现查。
    for (const el of this.getParts('item')) {
      const item: ComboboxItemProps = {
        value: el.getAttribute('value') ?? '',
        disabled: this.collection ? this.declaredDisabled(el) : isItemDisabled(el),
      }
      this.spreader.spread(el, api.getItemProps(item) as Record<string, unknown>)
      for (const text of this.partsIn(el, 'item-text'))
        this.spreader.spread(text, api.getItemTextProps(item) as Record<string, unknown>)
      for (const indicator of this.partsIn(el, 'item-indicator'))
        this.spreader.spread(indicator, api.getItemIndicatorProps(item) as Record<string, unknown>)
    }

    // 节点常驻，用内联 display 收起（作者层的 display 声明会盖过 [hidden]）
    this.setPartHidden(this.getPart('content'), !api.open)
    this.setPartHidden(this.getPart('empty'), !api.empty)

    // 每次接线完上报一次候选集合，让机器重算候选条数与悬空高亮
    if (this.ctrl.service.getStatus() === 'Started')
      this.ctrl.service.send({ type: 'ITEMS.SYNC' })
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    // 层随机器停机一并撤掉，此处不再管
    this.config = null // 重连时 ensureConfig 重建
  }
}
