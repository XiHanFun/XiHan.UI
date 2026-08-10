import type {
  CascaderExpandTrigger,
  CascaderItemProps,
  CascaderNode,
  CascaderOpenChangeDetails,
  CascaderSchema,
  CascaderValue,
  CascaderValueChangeDetails,
} from '@xihan-ui/headless'
import type { Cleanup, Direction, IdGenerator, Layer, Placement, PositionEnginePort, RuntimeConfig } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import { ITEM_VALUE_ATTR } from '@xihan-ui/behavior'
import { cascaderAnatomy, cascaderMachine, cascaderMeta, connectCascader } from '@xihan-ui/headless'
import { createCounterIdGenerator, createRuntimeConfig, createScope } from '@xihan-ui/kernel'
import { createPositionEngine } from '@xihan-ui/position'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定；Lit 自带转换器会把缺席落成 null/false，表达不了"未指定"。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : Number(v)) }
// 三态布尔：缺席=undefined（走缺省）、在场=true、显式写 "false"=false。
// Lit 默认的 Boolean 转换器是 v !== null，写 loop="false" 照样是真，缺省为真的开关就关不掉。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/** 条目一系的归属容器：文本与勾选标记向上找最近的那个条目。 */
const ITEM_SELECTOR = '[data-xh-part="item"]'

/**
 * `<xh-cascader>` —— Light-DOM 行为宿主：作者写 root/trigger/positioner/content 与
 * 每一级一个 column、层内每个节点一个 item，元素跑 cascader 机器并把 connect 产出打上去。
 * 浮层定位引擎在本元素里建好、经 refs 注入机器，锚点取 trigger、被定位的浮层取 positioner；
 * 机器只认端口，不认识具体引擎。
 *
 * 标记是静态的：列按树的深度写满（第 L 列装第 L 层的全部节点），当下该露面的哪些
 * 由元素加 hidden 收口，作者节点一个都不卸载。可先取 `cascaderBuildLevels(collection)` 照着写。
 *
 * 所在列、整条路径、禁用与显示文本都查 `collection` 这份树数据，不从 DOM 反推。
 * collection 必须与标记同源且 value 全树唯一。
 *
 * value-text 的显示文字由元素代填；作者在该节点里写了内容就归作者，元素不再改写。
 *
 * 树数据与选中路径都是数组，只走 property（`el.collection = [...]`、
 * `el.value = ['zhejiang','hangzhou']`）。
 *
 * @customElement xh-cascader
 * @attr {boolean} open - 受控开合；缺省该属性即非受控
 * @attr {boolean} default-open - 非受控初始为展开
 * @attr {'click'|'hover'} expand-trigger - 子列由点还是悬停展开，默认 click
 * @attr {boolean} change-on-select - 中间层（分支）也能落值
 * @attr {boolean} multiple - 多选：选中后浮层不收起，焦点留在列里
 * @attr {boolean} disabled - 整个控件禁用：trigger 用原生 disabled，浮层展不开
 * @attr {boolean} read-only - 只读：浮层照常展开、列照常浏览，但选中值改不动、也清不掉
 * @attr {boolean} invalid - 校验失败标注
 * @attr {'outline'|'subtle'|'ghost'} variant - 视觉变体
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @attr {string} placeholder - 无选中时 value-text 显示的占位文字
 * @attr {string} separator - 路径回显的连接符，默认 " / "
 * @attr {string} placement - 首选放置位，默认 bottom-start；避让后的实际位写在 data-placement 上
 * @attr {number} offset - 浮层与锚点的间距（px）
 * @attr {boolean} loop - 列内上下键走到首尾回绕，默认开；写 loop="false" 关掉
 * @attr {'ltr'|'rtl'} dir - 文字方向，只对调左右方向键的进子列/回上一列语义，默认 ltr
 * @fires value-change - 选中路径集合变化；detail 为 `{ value: string[][] }`
 * @fires open-change - open 状态变化；detail 为 `{ open: boolean }`
 * @csspart root - 组件根容器（承载 data-state/data-disabled/data-readonly/data-invalid）
 * @csspart label - 标题（aria-labelledby 目标）
 * @csspart trigger - role=combobox 的触发按钮，同时是定位锚点，须是原生 button
 * @csspart value-text - 整条路径的显示位；留空即由元素填入，作者写了内容则归作者
 * @csspart indicator - 展开指示符（aria-hidden，data-state 随开合）
 * @csspart clear-trigger - 清空按钮，须是原生 button；不占 Tab 位且对读屏隐藏
 * @csspart positioner - 浮层定位容器，坐标由引擎写成内联样式
 * @csspart content - 浮层壳（焦点域与消解层的根节点），键盘在此收口，收起时带 hidden
 * @csspart column - role=listbox 的一列，须自带 level 属性标识它是第几列；砍掉时带 hidden
 * @csspart item - role=option 的条目，须自带 value 属性标识身份；不在当前列里时带 hidden
 * @csspart item-text - 条目文本
 * @csspart item-indicator - 条目选中标记（aria-hidden）
 */
export class XhCascaderElement extends XhElement {
  static override partContract = { anatomy: cascaderAnatomy, meta: cascaderMeta }

  // dir 只占属性名、字段改叫 direction，避开 HTMLElement 原生 dir 访问器。
  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    collection: { attribute: false },
    value: { attribute: false },
    defaultValue: { attribute: false },
    open: { converter: BOOLEAN_CONVERTER },
    defaultOpen: { type: Boolean, attribute: 'default-open' },
    expandTrigger: { converter: STRING_CONVERTER, attribute: 'expand-trigger' },
    changeOnSelect: { converter: BOOLEAN_CONVERTER, attribute: 'change-on-select' },
    multiple: { type: Boolean },
    disabled: { type: Boolean },
    readOnly: { converter: BOOLEAN_CONVERTER, attribute: 'read-only' },
    invalid: { converter: BOOLEAN_CONVERTER },
    variant: { converter: STRING_CONVERTER },
    tone: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
    placeholder: { converter: STRING_CONVERTER },
    separator: { converter: STRING_CONVERTER },
    placement: { converter: STRING_CONVERTER },
    offset: { converter: NUMBER_CONVERTER },
    loop: { converter: BOOLEAN_CONVERTER },
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
  }

  declare collection?: CascaderNode[]
  declare value?: CascaderValue
  declare defaultValue?: CascaderValue
  declare open?: boolean
  declare defaultOpen?: boolean
  declare expandTrigger?: CascaderExpandTrigger
  declare changeOnSelect?: boolean
  declare multiple?: boolean
  declare disabled?: boolean
  declare readOnly?: boolean
  declare invalid?: boolean
  declare variant?: string
  declare tone?: string
  declare size?: string
  declare placeholder?: string
  declare separator?: string
  declare placement?: Placement
  declare offset?: number
  declare loop?: boolean
  declare direction?: Direction

  private readonly idGen: IdGenerator = createCounterIdGenerator()
  private readonly cascaderScope = createScope(null, this.idGen)
  private readonly positionEngine: PositionEnginePort = createPositionEngine()
  private config: RuntimeConfig | null = null

  /** value-text 是否归元素填：首次见到该节点时定，之后不再回读（回读到的会是自己写的字）。 */
  private readonly ownsValueText = new WeakMap<HTMLElement, boolean>()

  private readonly notifyValue = (details: CascaderValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyOpen = (details: CascaderOpenChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('open-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<CascaderSchema>(
    this,
    cascaderMachine,
    () => this.machineProps(),
    { scope: this.cascaderScope, onBuilt: svc => this.injectRefs(svc) },
  )

  private machineProps(): Partial<CascaderSchema['props']> {
    return {
      collection: this.collection,
      value: this.value,
      defaultValue: this.defaultValue,
      open: this.open,
      defaultOpen: this.defaultOpen ?? false,
      expandTrigger: this.expandTrigger,
      changeOnSelect: this.changeOnSelect ?? false,
      multiple: this.multiple ?? false,
      disabled: this.disabled ?? false,
      readOnly: this.readOnly ?? false,
      invalid: this.invalid ?? false,
      variant: this.variant,
      tone: this.tone,
      size: this.size,
      placeholder: this.placeholder,
      separator: this.separator,
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
    this.config = createRuntimeConfig({ scope: this.cascaderScope, idGenerator: this.idGen })
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
      // 浮层不带遮罩，无可点关闭的表面
      surfaces: () => [],
    })
  }

  // onBuilt 在 ctrl 构造期就跑，service 由参数传入。
  private injectRefs(svc: Service<CascaderSchema>): void {
    this.ensureConfig()
    svc.refs.set('config', this.config)
    svc.refs.set('registerLayer', this.registerLayer)
    svc.refs.set('position', this.positionEngine)
    svc.refs.set('getAnchorEl', () => this.getPart('trigger'))
    svc.refs.set('getFloatingEl', () => this.getPart('positioner'))
    svc.refs.set('getContentEl', () => this.getPart('content'))
  }

  /** 提前发现一次角色节点，让 default-open 时机器在 hostConnected 里就取得到 content。 */
  override connectedCallback(): void {
    this.refreshParts()
    super.connectedCallback()
  }

  /**
   * 承载焦点的条目被移出 DOM 时上报 ITEM.LOST，让机器按当前数据重挑锚点。
   * 判据是「焦点已不在浮层内」且离场的正是持有锚点的那个条目。
   */
  protected override onPartsReleased(nodes: readonly HTMLElement[]): void {
    const { context, getStatus, scope, send } = this.ctrl.service
    // 宿主断开时机器已停机
    if (getStatus() !== 'Started')
      return
    // 收起态无锚点
    const focusedPath = context.get('focusedPath')
    const focusedValue = focusedPath?.[focusedPath.length - 1]
    if (focusedValue == null)
      return
    const content = this.getPart('content')
    const active = scope.getActiveElement()
    if (content && active && content.contains(active))
      return
    // data-value 只写在 item 上，列内的文本与标记离场不会误判
    if (nodes.some(el => el.getAttribute(ITEM_VALUE_ATTR) === focusedValue))
      send({ type: 'ITEM.LOST' })
  }

  /**
   * 取角色节点所属的条目身份：value 写在 item 上，行内文本与勾选标记向上找本宿主内最近的 item，
   * 没有则读节点自身。
   */
  private itemOf(el: HTMLElement): CascaderItemProps {
    const owner = el.closest<HTMLElement>(ITEM_SELECTOR)
    const source = owner && owner !== this && this.contains(owner) ? owner : el
    return { value: source.getAttribute('value') ?? '' }
  }

  /** 列自报的层号，没写或写歪了按它在 column 序列里的位置兜底。 */
  private levelOf(el: HTMLElement, position: number): number {
    const raw = Number(el.getAttribute('level'))
    return Number.isFinite(raw) && raw >= 0 ? Math.trunc(raw) : position
  }

  /** 摘掉作者写在条目上的原生 disabled，条目禁用一律由 collection 决定并以 aria-disabled 表达。 */
  private stripNativeDisabled(el: HTMLElement): void {
    if (el.hasAttribute('disabled'))
      el.removeAttribute('disabled')
  }

  /** 把整条路径的文字填进 value-text；首次见到该节点时若已有内容则判为归作者，之后一概不碰。 */
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

  protected wire(): void {
    const api = connectCascader(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('label', api.getLabelProps() as Record<string, unknown>)
    put('trigger', api.getTriggerProps() as Record<string, unknown>)
    put('indicator', api.getIndicatorProps() as Record<string, unknown>)
    put('clear-trigger', api.getClearTriggerProps() as Record<string, unknown>)
    // positioner 的 style 是对象，spreader 会逐条写成内联样式
    put('positioner', api.getPositionerProps() as Record<string, unknown>)
    put('content', api.getContentProps() as Record<string, unknown>)

    // 属性先落，显示文字随后
    const valueText = this.getPart('value-text')
    if (valueText) {
      this.spreader.spread(valueText, api.getValueTextProps() as Record<string, unknown>)
      this.fillValueText(valueText, api.displayText)
    }

    // 集合类 part 逐个 spread，身份由节点自报，不依赖下标。
    // wire 跑在事件之前，按键时 data-scope/data-part/data-value 已在 DOM 上供连接层现查。
    this.getParts('column').forEach((el, position) => {
      this.spreader.spread(el, api.getColumnProps({ level: this.levelOf(el, position) }) as Record<string, unknown>)
    })
    for (const el of this.getParts('item')) {
      this.stripNativeDisabled(el)
      this.spreader.spread(el, api.getItemProps(this.itemOf(el)) as Record<string, unknown>)
    }
    for (const el of this.getParts('item-text'))
      this.spreader.spread(el, api.getItemTextProps(this.itemOf(el)) as Record<string, unknown>)
    for (const el of this.getParts('item-indicator'))
      this.spreader.spread(el, api.getItemIndicatorProps(this.itemOf(el)) as Record<string, unknown>)

    // 节点常驻，用内联 display 收起（作者层的 display 声明会盖过 [hidden]）
    this.setPartHidden(this.getPart('content'), !api.open)
    this.getParts('column').forEach((el, position) => {
      this.setPartHidden(el, this.levelOf(el, position) >= api.columns.length)
    })
    for (const el of this.getParts('item'))
      this.setPartHidden(el, !api.isVisible(this.itemOf(el).value))
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    this.config = null // 重连时 ensureConfig 重建
  }
}
