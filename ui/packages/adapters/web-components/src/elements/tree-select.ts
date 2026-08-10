import type {
  TreeNode,
  TreeSelectExpandedChangeDetails,
  TreeSelectNodeProps,
  TreeSelectOpenChangeDetails,
  TreeSelectSchema,
  TreeSelectValueChangeDetails,
} from '@xihan-ui/headless'
import type { Cleanup, ControlVariant, Direction, IdGenerator, Layer, Placement, PositionEnginePort, RuntimeConfig, Size, Tone } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import { ITEM_VALUE_ATTR } from '@xihan-ui/behavior'
import { connectTreeSelect, treeSelectAnatomy, treeSelectMachine, treeSelectMeta } from '@xihan-ui/headless'
import { createCounterIdGenerator, createRuntimeConfig, createScope } from '@xihan-ui/kernel'
import { createPositionEngine } from '@xihan-ui/position'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定；Lit 自带转换器把缺席落成 null/false，
// value 落成 null 就分不出"非受控"与"受控且当前无选中"。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : Number(v)) }
// 三态布尔：缺席=undefined（走缺省）、在场=true、显式写 "false"=false。
// Lit 默认的 Boolean 转换器是 v !== null，写 loop="false" 照样是真。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/** 叶子一系的归属容器。 */
const ITEM_SELECTOR = '[data-xh-part="item"]'
/** 分支一系的归属容器；嵌套分支各认最近的那个。 */
const BRANCH_SELECTOR = '[data-xh-part="branch"]'

/**
 * `<xh-tree-select>` —— Light-DOM 行为宿主：作者写 root/trigger/positioner/content/tree
 * 与若干 item / branch 角色节点，元素跑 tree-select 机器并把 connect 产出打上去。
 * 浮层定位引擎在本元素里建好、经 refs 注入机器，锚点取 trigger、被定位的浮层取 positioner；
 * 节点身份取节点上的 value 属性。
 *
 * 层级（aria-level / aria-posinset / aria-setsize）、禁用与显示文本都查 `collection` 这份树数据，
 * 不从 DOM 反推，故 collection 必须与标记同源。
 *
 * value-text 的显示文字由元素代填；作者在该节点里写了内容就归作者，元素不再改写。
 *
 * 树数据与展开/选中集合都是数组，只走 property（`el.collection = [...]`）；
 * 单选的选中值可用 value 属性写成裸串。
 *
 * @customElement xh-tree-select
 * @attr {string} value - 受控选中值（单选简写）；缺省该属性即非受控，多选请用 property 传数组
 * @attr {string} default-value - 非受控初始选中值
 * @attr {boolean} open - 受控开合；缺省该属性即非受控
 * @attr {boolean} default-open - 非受控初始为展开
 * @attr {boolean} multiple - 多选：选中后浮层不收起，焦点留在树里
 * @attr {boolean} disabled - 整个控件禁用：trigger 用原生 disabled，表单出口不参与提交
 * @attr {boolean} read-only - 只读：浮层照常展开、树照常浏览，但选中值改不动、也清不掉
 * @attr {boolean} invalid - 校验失败标注
 * @attr {'outline'|'subtle'|'ghost'} variant - 视觉变体
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @attr {string} placeholder - 无选中时 value-text 显示的占位文字
 * @attr {string} placement - 首选放置位，默认 bottom-start；避让后的实际位写在 data-placement 上
 * @attr {number} offset - 浮层与锚点的间距（px）
 * @attr {boolean} loop - 上下键走到首尾回绕，默认关；写 loop="true" 打开
 * @attr {'ltr'|'rtl'} dir - 文字方向，只对调左右方向键的展开/收起语义，默认 ltr
 * @attr {string} name - 表单字段名；给了 hidden-input 才参与提交（多选按逗号拼成一串）
 * @fires value-change - 选中集合变化；detail 为 `{ value: string[] }`
 * @fires expanded-change - 展开集合变化；detail 为 `{ value: string[] }`
 * @fires open-change - open 状态变化；detail 为 `{ open: boolean }`
 * @csspart root - 组件根容器（承载 data-state/data-disabled/data-readonly/data-invalid）
 * @csspart label - 标题（aria-labelledby 目标）
 * @csspart trigger - role=combobox 的触发按钮，同时是定位锚点，须是原生 button
 * @csspart value-text - 选中项文本的显示位；留空即由元素填入 displayText，作者写了内容则归作者
 * @csspart indicator - 展开指示符（aria-hidden，data-state 随开合）
 * @csspart clear-trigger - 清空按钮，须是原生 button；不占 Tab 位且对读屏隐藏
 * @csspart positioner - 浮层定位容器，坐标由引擎写成内联样式
 * @csspart content - 浮层壳（焦点域与消解层的根节点），收起时带 hidden
 * @csspart tree - role=tree 容器，键盘在此收口，也是没有锚点时的 Tab 兜底位
 * @csspart item - role=treeitem 叶子，须自带 value 属性标识身份
 * @csspart item-text - 叶子文本
 * @csspart item-indicator - 叶子选中标记（aria-hidden）
 * @csspart branch - role=treeitem 分支，须自带 value 属性；它裹着自己的 branch-content
 * @csspart branch-control - 分支可点行（点它只改选中值，展开归箭头与左右方向键）
 * @csspart branch-trigger - 展开箭头（aria-hidden 且不占 Tab 位，只切换展开态）
 * @csspart branch-indicator - 展开方向指示符（aria-hidden）
 * @csspart branch-text - 分支文本
 * @csspart branch-content - role=group 子层容器，收起时隐藏
 * @csspart hidden-input - type=hidden 的表单出口，省略该节点即不参与表单
 */
export class XhTreeSelectElement extends XhElement {
  static override partContract = { anatomy: treeSelectAnatomy, meta: treeSelectMeta }

  // dir 只占属性名、字段改叫 direction，避开 HTMLElement 原生 dir 访问器。
  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    collection: { attribute: false },
    value: { converter: STRING_CONVERTER },
    defaultValue: { converter: STRING_CONVERTER, attribute: 'default-value' },
    expandedValue: { attribute: false },
    defaultExpandedValue: { attribute: false },
    open: { converter: BOOLEAN_CONVERTER },
    defaultOpen: { type: Boolean, attribute: 'default-open' },
    multiple: { type: Boolean },
    disabled: { type: Boolean },
    readOnly: { converter: BOOLEAN_CONVERTER, attribute: 'read-only' },
    invalid: { converter: BOOLEAN_CONVERTER },
    variant: { converter: STRING_CONVERTER },
    tone: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
    placeholder: { converter: STRING_CONVERTER },
    placement: { converter: STRING_CONVERTER },
    offset: { converter: NUMBER_CONVERTER },
    loop: { converter: BOOLEAN_CONVERTER },
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
    name: { converter: STRING_CONVERTER },
  }

  declare collection?: TreeNode[]
  declare value?: string | string[]
  declare defaultValue?: string | string[]
  declare expandedValue?: string[]
  declare defaultExpandedValue?: string[]
  declare open?: boolean
  declare defaultOpen?: boolean
  declare multiple?: boolean
  declare disabled?: boolean
  declare readOnly?: boolean
  declare invalid?: boolean
  declare variant?: ControlVariant
  declare tone?: Tone
  declare size?: Size
  declare placeholder?: string
  declare placement?: Placement
  declare offset?: number
  declare loop?: boolean
  declare direction?: Direction
  declare name?: string

  private readonly idGen: IdGenerator = createCounterIdGenerator()
  private readonly treeSelectScope = createScope(null, this.idGen)
  private readonly positionEngine: PositionEnginePort = createPositionEngine()
  private config: RuntimeConfig | null = null

  /** value-text 是否归元素填：首次见到该节点时定，之后不再回读（回读到的会是自己写的字）。 */
  private readonly ownsValueText = new WeakMap<HTMLElement, boolean>()

  private readonly notifyValue = (details: TreeSelectValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyExpanded = (details: TreeSelectExpandedChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('expanded-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyOpen = (details: TreeSelectOpenChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('open-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<TreeSelectSchema>(
    this,
    treeSelectMachine,
    () => this.machineProps(),
    { scope: this.treeSelectScope, onBuilt: svc => this.injectRefs(svc) },
  )

  private machineProps(): Partial<TreeSelectSchema['props']> {
    return {
      collection: this.collection,
      value: this.value,
      defaultValue: this.defaultValue,
      expandedValue: this.expandedValue,
      // 不补 []，缺省由机器兜
      defaultExpandedValue: this.defaultExpandedValue,
      open: this.open,
      defaultOpen: this.defaultOpen ?? false,
      multiple: this.multiple ?? false,
      disabled: this.disabled ?? false,
      readOnly: this.readOnly ?? false,
      invalid: this.invalid ?? false,
      variant: this.variant,
      tone: this.tone,
      size: this.size,
      placeholder: this.placeholder,
      placement: this.placement,
      offset: this.offset,
      loop: this.loop,
      dir: this.direction,
      name: this.name,
      onValueChange: this.notifyValue,
      onExpandedChange: this.notifyExpanded,
      onOpenChange: this.notifyOpen,
    }
  }

  private ensureConfig(): void {
    if (this.config)
      return
    this.config = createRuntimeConfig({ scope: this.treeSelectScope, idGenerator: this.idGen })
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
  private injectRefs(svc: Service<TreeSelectSchema>): void {
    this.ensureConfig()
    svc.refs.set('config', this.config)
    svc.refs.set('registerLayer', this.registerLayer)
    svc.refs.set('position', this.positionEngine)
    svc.refs.set('getAnchorEl', () => this.getPart('trigger'))
    svc.refs.set('getFloatingEl', () => this.getPart('positioner'))
    svc.refs.set('getContentEl', () => this.getPart('content'))
  }

  /** 提前发现一次角色节点：default-open 时机器在 hostConnected 当场要去 content 里挑焦点锚点。 */
  override connectedCallback(): void {
    this.refreshParts()
    super.connectedCallback()
  }

  /**
   * 承载焦点的节点被移出 DOM 时上报 NODE.LOST，让机器按当前数据重挑锚点。
   * 判据是「焦点已不在浮层内」且离场的正是持有锚点的那个节点。
   */
  protected override onPartsReleased(nodes: readonly HTMLElement[]): void {
    const { context, getStatus, scope, send } = this.ctrl.service
    // 机器已停机则跳过
    if (getStatus() !== 'Started')
      return
    // 收起态无焦点锚点
    const focusedValue = context.get('focusedValue')
    if (focusedValue == null)
      return
    const content = this.getPart('content')
    const active = scope.getActiveElement()
    if (content && active && content.contains(active))
      return
    // data-value 只写在 item 与 branch 上，行内的文本与标记离场不会误判
    if (nodes.some(el => el.getAttribute(ITEM_VALUE_ATTR) === focusedValue))
      send({ type: 'NODE.LOST' })
  }

  /**
   * 取角色节点所属的节点身份：value 写在 item / branch 上，行内的文本、标记、箭头与子层容器
   * 向上找本宿主内最近的那个，没有则读节点自身。
   */
  private nodeOf(el: HTMLElement, selector: string): TreeSelectNodeProps {
    const owner = el.closest<HTMLElement>(selector)
    const source = owner && owner !== this && this.contains(owner) ? owner : el
    return { value: source.getAttribute('value') ?? '' }
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

  protected wire(): void {
    const api = connectTreeSelect(this.ctrl.service, wcNormalize)

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
    put('tree', api.getTreeProps() as Record<string, unknown>)
    // 表单出口可缺省
    put('hidden-input', api.getHiddenInputProps() as Record<string, unknown>)

    // 属性先落，再填显示文字
    const valueText = this.getPart('value-text')
    if (valueText) {
      this.spreader.spread(valueText, api.getValueTextProps() as Record<string, unknown>)
      this.fillValueText(valueText, api.displayText)
    }

    // 集合类 part 逐个 spread，身份由节点自报，不依赖下标。
    // wire 跑在事件之前，按键时 data-scope/data-part/data-value 已在 DOM 上供连接层现查。
    const putAll = (name: string, selector: string, get: (node: TreeSelectNodeProps) => unknown): void => {
      for (const el of this.getParts(name))
        this.spreader.spread(el, get(this.nodeOf(el, selector)) as Record<string, unknown>)
    }
    putAll('item', ITEM_SELECTOR, node => api.getItemProps(node))
    putAll('item-text', ITEM_SELECTOR, node => api.getItemTextProps(node))
    putAll('item-indicator', ITEM_SELECTOR, node => api.getItemIndicatorProps(node))
    putAll('branch', BRANCH_SELECTOR, node => api.getBranchProps(node))
    putAll('branch-control', BRANCH_SELECTOR, node => api.getBranchControlProps(node))
    putAll('branch-trigger', BRANCH_SELECTOR, node => api.getBranchTriggerProps(node))
    putAll('branch-indicator', BRANCH_SELECTOR, node => api.getBranchIndicatorProps(node))
    putAll('branch-text', BRANCH_SELECTOR, node => api.getBranchTextProps(node))
    putAll('branch-content', BRANCH_SELECTOR, node => api.getBranchContentProps(node))

    // 节点常驻，用内联 display 收起（作者层的 display 声明会盖过 [hidden]）
    this.setPartHidden(this.getPart('content'), !api.open)
    for (const el of this.getParts('branch-content'))
      this.setPartHidden(el, !api.isExpanded(this.nodeOf(el, BRANCH_SELECTOR).value))
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    // 层随机器停机一并撤掉，此处不再管
    this.config = null // 重连时 ensureConfig 重建
  }
}
