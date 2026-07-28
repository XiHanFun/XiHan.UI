import type { Cleanup, Direction, IdGenerator, Layer, Placement, PositionEnginePort, RuntimeConfig } from '@xihan-ui/core'
import type {
  CascaderExpandTrigger,
  CascaderItemProps,
  CascaderNode,
  CascaderOpenChangeDetails,
  CascaderSchema,
  CascaderValue,
  CascaderValueChangeDetails,
} from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import { ITEM_VALUE_ATTR } from '@xihan-ui/behavior'
import { createCounterIdGenerator, createRuntimeConfig, createScope } from '@xihan-ui/core'
import { cascaderMachine, connectCascader } from '@xihan-ui/headless'
import { createFloatingUiPositionEngine } from '@xihan-ui/position-floating-ui'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席一律翻成 undefined：缺省值的唯一事实源留在机器与 connect 里。
// Lit 自带的转换器会把缺席落成 null / false，那样属性就再也表达不了"未指定"。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : Number(v)) }
// 三态布尔：缺席=undefined（走缺省）、在场=true、显式写 "false"=false。
// 缺省为真的开关（列内方向键回绕）只有三态才关得掉——
// Lit 默认的 Boolean 转换器是 v !== null，写 loop="false" 照样是真。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/** 条目一系的归属容器：文本与勾选标记向上找最近的那个条目。 */
const ITEM_SELECTOR = '[data-xh-part="item"]'

/**
 * `<xh-cascader>` —— Light-DOM 行为宿主：作者写 root/trigger/positioner/content 与
 * 每一级一个 column、层内每个节点一个 item，元素跑 cascader 机器并把 connect 产出打上去。
 * 浮层定位引擎在本元素里建好、经 refs 注入机器，锚点取 trigger、被定位的浮层取 positioner；
 * 机器只认端口，不认识具体引擎。
 *
 * **标记是静态的**：列按树的深度写满（第 L 列装第 L 层的全部节点），当下该露面的是哪些
 * 由元素加 hidden 收口，作者节点一个都不卸载。要照着写可以先取 `cascaderBuildLevels(collection)`。
 *
 * 所在列、整条路径、禁用与显示文本都不从 DOM 反推，而是查 `collection` 这份树数据——
 * 它是元信息的唯一事实源，作者的标记只管长相，两个适配器也就不会各推各的。
 * 因此 collection 必须与标记同源，且 value 全树唯一：标记里有、collection 里没有的条目
 * 报不出所在列，也进不了导航。
 *
 * value-text 的显示文字由元素代填（整条路径的名字住在树数据里，作者写不出来）；
 * 作者在那个节点里写了内容就归作者，元素不再改写。
 *
 * 树数据与选中路径都是数组，属性表达不了，只能走 property（`el.collection = [...]`、
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
  // dir 只占属性名、字段改叫 direction：HTMLElement 原生 dir 是 string 访问器，
  // 同名声明既与基类类型冲突，也会盖掉原生反射。别名保留原生行为，
  // 同时让 dir 进 observedAttributes——运行期改 dir 才会重跑 wire 换掉按键处理器。
  // 描述符逐个写全、不用对象展开：CEM 分析器的 lit 插件读不了展开元素的名字，会整个崩掉。
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
  declare placeholder?: string
  declare separator?: string
  declare placement?: Placement
  declare offset?: number
  declare loop?: boolean
  declare direction?: Direction

  private readonly idGen: IdGenerator = createCounterIdGenerator()
  private readonly cascaderScope = createScope(null, this.idGen)
  private readonly positionEngine: PositionEnginePort = createFloatingUiPositionEngine()
  private config: RuntimeConfig | null = null

  /** value-text 是否归元素填：首次见到该节点时定，之后不再回读（读到的会是自己写的字）。 */
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
      // 浮层不带遮罩，没有"点它就该关本层"的表面
      surfaces: () => [],
    })
  }

  // onBuilt 在 ctrl 构造期就跑（此刻 this.ctrl 尚未赋值），故 service 由参数传入。
  private injectRefs(svc: Service<CascaderSchema>): void {
    this.ensureConfig()
    svc.refs.set('config', this.config)
    svc.refs.set('registerLayer', this.registerLayer)
    svc.refs.set('position', this.positionEngine)
    svc.refs.set('getAnchorEl', () => this.getPart('trigger'))
    svc.refs.set('getFloatingEl', () => this.getPart('positioner'))
    svc.refs.set('getContentEl', () => this.getPart('content'))
  }

  /**
   * 角色节点提前发现一次：default-open 时机器在 hostConnected 当场跑进入展开态的动作，
   * 焦点域随后要按锚点条目去 content 里现查元素。而常规发现要等首次 updated，
   * 那一刻 partMap 还空着，content 取不到。
   */
  override connectedCallback(): void {
    this.refreshParts()
    super.connectedCallback()
  }

  /**
   * 承载焦点的条目被移出 DOM 时浏览器不派 focusout，焦点锚点会停在一个已消失的条目上：
   * 没有条目认领 tabindex=0、方向键也失去起点。这里替 DOM 把焦点离场如实上报，
   * 机器就地按当前数据重挑锚点。
   *
   * 判据是焦点确实跟着这个节点走了。节点此刻已不在文档里，activeElement 不可能还等于它
   * （浏览器把焦点退还给了 body），于是改判等价事实"焦点已不在浮层内"，
   * 再要求离场的正是持有锚点的那个条目——只按值比对，会把"焦点在别处时删掉同值条目"也算成离场。
   */
  protected override onPartsReleased(nodes: readonly HTMLElement[]): void {
    const { context, getStatus, scope, send } = this.ctrl.service
    // 宿主断开时机器已停机，此刻无焦点可言（送事件还会在 dev 下抛）
    if (getStatus() !== 'Started')
      return
    // 收起态无锚点：条目连同 content 一起 hidden，本就不承载焦点
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
   * 取角色节点所属的条目身份：value 写在 item 上，行内的文本与勾选标记向上找最近的那个
   * （item 自身 closest 命中的就是它自己）。没有包裹层时退回读节点自身，扁平写法也能用。
   * 越出本宿主的容器不算数——嵌套 xh-cascader 的内层条目不会认外层的条目。
   */
  private itemOf(el: HTMLElement): CascaderItemProps {
    const owner = el.closest<HTMLElement>(ITEM_SELECTOR)
    const source = owner && owner !== this && this.contains(owner) ? owner : el
    return { value: source.getAttribute('value') ?? '' }
  }

  /**
   * 列自报的层号；没写或写歪了就按它在 column 序列里的位置兜底——
   * 列本来就是从左到右一层一列，文档序即层号。
   */
  private levelOf(el: HTMLElement, position: number): number {
    const raw = Number(el.getAttribute('level'))
    return Number.isFinite(raw) && raw >= 0 ? Math.trunc(raw) : position
  }

  /**
   * 摘掉作者写在条目上的原生 disabled。
   *
   * 集合条目的禁用一律由 collection 说了算、由 aria-disabled 表达：原生禁用的元素不可聚焦、
   * 也收不到 click，「禁用条目仍是方向键起点、仍挡得住点击」这两条在原生 disabled 下根本
   * 无从成立（连点击都到不了处理器，挡住的是浏览器不是组件）。不摘掉，Vue 与 WC 就分叉了。
   */
  private stripNativeDisabled(el: HTMLElement): void {
    if (el.hasAttribute('disabled'))
      el.removeAttribute('disabled')
  }

  /**
   * 整条路径的文字只有树数据里才有，作者在 trigger 上写不出来，由元素填。
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

    // 集合类 part 逐个 spread：身份由节点自报，不依赖下标，条目增删无需记账。
    // wire 跑在事件之前（element-base 的 updated），因此按键那一刻 data-scope/data-part/data-value
    // 已经在 DOM 上，连接层查得到本份级联的条目集合。
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

    // Light DOM 常驻，WC 自管可见性：作者层若给这几个 part 声明了 display，
    // 会盖过 UA 的 [hidden]{display:none}，光靠 hidden 属性收不起来。
    // 本包的样式自带 [hidden]{display:none} 压得住，但宿主不能指望作者装了这份样式。
    this.setPartHidden(this.getPart('content'), !api.open)
    this.getParts('column').forEach((el, position) => {
      this.setPartHidden(el, this.levelOf(el, position) >= api.columns.length)
    })
    for (const el of this.getParts('item'))
      this.setPartHidden(el, !api.isVisible(this.itemOf(el).value))
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    // 层由展开态的效应自己入栈出栈，断开时机器停机会一并撤掉，这里无需再管
    this.config = null // 重连时 ensureConfig 重建
  }
}
