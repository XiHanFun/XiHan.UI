import type {
  MentionInputEl,
  MentionInputHost,
  MentionItemProps,
  MentionNode,
  MentionOpenChangeDetails,
  MentionQueryChangeDetails,
  MentionSchema,
  MentionSelectDetails,
  MentionTranslations,
  MentionValueChangeDetails,
} from '@xihan-ui/headless'
import type { Cleanup, ControlVariant, IdGenerator, Layer, Placement, PositionEnginePort, RuntimeConfig, Size, Tone } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { OverlayExit } from '../overlay-exit'
import { connectMention, mentionAnatomy, mentionMachine, mentionMeta } from '@xihan-ui/headless'
import { createCounterIdGenerator, createRuntimeConfig, createScope } from '@xihan-ui/kernel'
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
 * `<xh-mention>` —— Light-DOM 行为宿主：作者写 root/input/positioner/content/item 角色节点，
 * 元素跑 mention 机器并把 connect 产出打上去。浮层定位引擎在本元素里建好、经 refs 注入机器，
 * 锚点就是输入框本身（浮层贴着整个输入框，不跟着光标走）。
 *
 * 与组合框的分水岭有两条。其一，浮层由「光标处的前缀字符」开合：前缀必须紧跟在行首或空白之后，
 * 邮箱地址里的 @ 因此不会误触发；前缀到光标之间那段就是查询串。其二，选中候选不是替换整个值，
 * 而是把那段查询串换成候选文本、前后文一字不动，光标随后落在插入内容之后。
 *
 * input 部件写成 textarea（缺省）时保留它自带的 textbox 角色：ARIA in HTML 只允许 textarea
 * 取 textbox，而 aria-expanded 不在 textbox 的支持属性里，两者一并让位；
 * 「有候选浮层」改由 aria-haspopup、aria-controls、aria-autocomplete 与 aria-activedescendant 表达。
 * 写成 input 时才补上 role=combobox 与 aria-expanded。
 *
 * 过滤不由本元素做：查询串变化时派发 query-change，作者据此增删 item 节点。
 *
 * @customElement xh-mention
 * @attr {string} prefix - 开候选的前缀字符，默认 '@'；多种前缀并存请用 property 传数组
 * @attr {string} value - 受控正文；缺省该属性即非受控
 * @attr {string} default-value - 非受控初始正文
 * @attr {boolean} disabled - 整个控件禁用：输入框用原生 disabled，候选一概不开
 * @attr {string} placeholder - 输入框占位文字；不写就保留作者标在 input 部件上的那份
 * @attr {boolean} loop - 方向键走到尽头回绕，默认 true；写 loop="false" 关掉
 * @attr {string} placement - 首选放置位，默认 bottom-start；避让后的实际位写在 data-placement 上
 * @attr {number} offset - 浮层与输入框的间距（px）
 * @attr {'outline'|'subtle'|'ghost'} variant - 视觉变体
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @fires value-change - 正文变化；detail 为 `{ value: string }`
 * @fires query-change - 查询串变化；detail 为 `{ query, prefix }`，作者据此过滤候选；收起时报 null
 * @fires select - 候选被插进正文；detail 为 `{ value, label, prefix }`
 * @fires open-change - 浮层开合；detail 为 `{ open: boolean }`
 * @csspart root - 组件根容器（承载 data-state/data-disabled 与三个视觉轴）
 * @csspart input - 输入框，写 textarea（推荐）或 input；可及名字由作者自己给
 * @csspart positioner - 浮层定位容器，坐标由引擎写成内联样式
 * @csspart content - role=listbox 容器（消解层的根节点），收起时带 hidden
 * @csspart item - role=option 候选，须自带 value 属性标识身份；禁用写 aria-disabled="true"
 * @csspart item-text - 候选文本，也是插回正文的取字处
 */
export class XhMentionElement extends XhElement {
  static override partContract = { anatomy: mentionAnatomy, meta: mentionMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    // 数组只走 property，属性表达不了；给了 collection 候选的文本与禁用即以数据为准
    collection: { attribute: false },
    translations: { attribute: false },
    // prefix 撞 Element 的原生只读属性（命名空间前缀），字段改名，属性名不变
    triggerPrefix: { converter: STRING_CONVERTER, attribute: 'prefix' },
    value: { converter: STRING_CONVERTER },
    defaultValue: { converter: STRING_CONVERTER, attribute: 'default-value' },
    disabled: { type: Boolean },
    placeholder: { converter: STRING_CONVERTER },
    loop: { converter: BOOLEAN_CONVERTER },
    placement: { converter: STRING_CONVERTER },
    offset: { converter: NUMBER_CONVERTER },
    variant: { converter: STRING_CONVERTER },
    tone: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
  }

  declare collection?: MentionNode[]
  declare translations?: MentionTranslations
  declare triggerPrefix?: string | string[]
  declare value?: string
  declare defaultValue?: string
  declare disabled?: boolean
  declare placeholder?: string
  declare loop?: boolean
  declare placement?: Placement
  declare offset?: number
  declare variant?: ControlVariant
  declare tone?: Tone
  declare size?: Size

  private readonly idGen: IdGenerator = createCounterIdGenerator()
  private readonly mentionScope = createScope(null, this.idGen)
  private readonly positionEngine: PositionEnginePort = createPositionEngine()
  private config: RuntimeConfig | null = null
  /** 退场闸门：收起从跟着 open 走改成跟着 presence 走，退场动画播完才真收。 */
  private exit: OverlayExit | null = null

  private readonly notifyValue = (details: MentionValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyQuery = (details: MentionQueryChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('query-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifySelect = (details: MentionSelectDetails): void => {
    this.dispatchEvent(new CustomEvent('select', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyOpen = (details: MentionOpenChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('open-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<MentionSchema>(
    this,
    mentionMachine,
    () => this.machineProps(),
    { scope: this.mentionScope, onBuilt: svc => this.injectRefs(svc) },
  )

  /** 作者声明的条目禁用，只认首见那一份；给了 collection 时用它，否则现读 */
  private readonly declaredDisabled = createDeclaredDisabled()

  private machineProps(): Partial<MentionSchema['props']> {
    return {
      prefix: this.triggerPrefix,
      collection: this.collection,
      value: this.value,
      defaultValue: this.defaultValue,
      disabled: this.disabled ?? false,
      placeholder: this.placeholder,
      loop: this.loop,
      placement: this.placement,
      offset: this.offset,
      translations: this.translations,
      variant: this.variant,
      tone: this.tone,
      size: this.size,
      onValueChange: this.notifyValue,
      onQueryChange: this.notifyQuery,
      onSelect: this.notifySelect,
      onOpenChange: this.notifyOpen,
    }
  }

  private ensureConfig(): void {
    if (this.config)
      return
    this.config = createRuntimeConfig({ scope: this.mentionScope, idGenerator: this.idGen })
  }

  // 只交注册函数、不在连接期注册：层的入栈出栈跟着展开态走（机器的 trackLayer 效应负责）。
  private readonly registerLayer = (): { layer: Layer, dispose: Cleanup } => {
    this.ensureConfig()
    return this.config!.layerRegistry.register({
      kind: 'popover',
      node: () => this.getPart('content'),
      // 输入框记为本层分支：在正文里打字、点击都算层内交互，不该把浮层点没
      branches: () => [this.getPart('input')].filter(Boolean) as Element[],
      isModal: () => false,
      setModal: () => {},
      // 浮层不带遮罩，无可点关闭的表面
      surfaces: () => [],
    })
  }

  // onBuilt 在 ctrl 构造期就跑，service 由参数传入。
  private injectRefs(svc: Service<MentionSchema>): void {
    this.ensureConfig()
    svc.refs.set('config', this.config)
    svc.refs.set('registerLayer', this.registerLayer)
    svc.refs.set('position', this.positionEngine)
    svc.refs.set('getFloatingEl', () => this.getPart('positioner'))
    svc.refs.set('getContentEl', () => this.getPart('content'))
    svc.refs.set('getInputEl', () => this.getPart('input') as MentionInputEl | null)
  }

  /** 提前发现一次角色节点：机器挂载当场就要读得到输入框与候选容器。 */
  override connectedCallback(): void {
    this.refreshParts()
    super.connectedCallback()
  }

  // 取 owner 子树内指定名字的角色节点。
  private partsIn(owner: HTMLElement, name: string): HTMLElement[] {
    return this.getParts(name).filter(el => owner.contains(el))
  }

  protected wire(): void {
    const api = connectMention(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }

    put('root', api.getRootProps() as Record<string, unknown>)

    // 宿主标签直接读作者写的标记：作者摆的是 textarea 还是 input，DOM 已经说明白了
    const inputEl = this.getPart('input') as MentionInputEl | null
    const inputHost: MentionInputHost = inputEl?.tagName === 'INPUT' ? 'input' : 'textarea'
    const inputProps = api.getInputProps({ as: inputHost }) as Record<string, unknown>
    // 值一样就别重写：给 value 重新赋值会把光标弹到末尾，正文中间的提及就插不进去了
    if (inputEl && inputEl.value === inputProps.value)
      delete inputProps.value
    put('input', inputProps)

    // positioner 的 style 是对象，spreader 会逐条写成内联样式
    put('positioner', api.getPositionerProps() as Record<string, unknown>)
    put('content', api.getContentProps() as Record<string, unknown>)

    // 候选逐个打：身份取作者写的 value，禁用取部件自报的 aria-disabled。
    // wire 跑在事件之前，按键时 data-scope/data-part/data-value 已在 DOM 上供方向键现查。
    for (const el of this.getParts('item')) {
      const item: MentionItemProps = {
        value: el.getAttribute('value') ?? '',
        disabled: this.declaredDisabled(el),
      }
      this.spreader.spread(el, api.getItemProps(item) as Record<string, unknown>)
      for (const text of this.partsIn(el, 'item-text'))
        this.spreader.spread(text, api.getItemTextProps(item) as Record<string, unknown>)
    }

    // 节点常驻，用内联 display 收起（作者层的 display 声明会盖过 [hidden]）
    // 退场动画播完之前先别收：presence 读 content 的 animationName 决定要不要多留一会儿。
    // 必须排在 put('content') 之后——data-state 得先落进 DOM，探测器才读得到退场那支动画
    this.ensureConfig()
    this.exit ??= createOverlayExit({
      config: this.config!,
      open: api.open,
      onExitComplete: () => this.requestUpdate(),
    })
    this.exit.track(this.getPart('content'))
    this.exit.update(api.open)
    this.setPartHidden(this.getPart('content'), !this.exit.visible)

    // 每次接线完上报一次候选集合，让机器重算候选条数与悬空高亮
    if (this.ctrl.service.getStatus() === 'Started')
      this.ctrl.service.send({ type: 'ITEMS.SYNC' })
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
