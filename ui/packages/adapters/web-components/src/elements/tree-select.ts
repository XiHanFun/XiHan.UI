/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 tree select 相关实现。

import type { Cleanup, ControlVariant, Direction, IdGenerator, Layer, Placement, PositionEnginePort, RuntimeConfig, Service, Size, Tone } from '@xihan-ui/core'
import type {
  CollectionVirtualizer,
  FormControlState,
  TreeSelectApi,
  TreeSelectBranchLoadDetails,
  TreeSelectBranchLoadErrorDetails,
  TreeSelectBranchLoadSnapshot,
  TreeSelectBranchLoadStartDetails,
  TreeSelectExpandedValueChangeDetails,
  TreeSelectNode,
  TreeSelectNodeProps,
  TreeSelectOpenChangeDetails,
  TreeSelectSchema,
  TreeSelectTagMeta,
  TreeSelectValueChangeDetails,
} from '@xihan-ui/headless'
import type { OverlayExit } from '../overlay-exit'
import { createCounterIdGenerator, createRuntimeConfig, createScope, ITEM_VALUE_ATTR } from '@xihan-ui/core'
import { connectTreeSelect, resolveFormControlState, tagAnatomy, treeSelectAnatomy, treeSelectMachine, treeSelectMeta } from '@xihan-ui/headless'
import { createPositionEngine } from '@xihan-ui/position'
import { wcNormalize } from '../dom/normalize'
import { PART_ATTR } from '../dom/parts'
import { createRepeatedHiddenInputs } from '../dom/repeated-hidden-inputs'
import { createOverlayExit } from '../overlay-exit'
import { MachineController } from '../runtime/machine-controller'
import { XhPortalHostElement } from '../runtime/portal-host'
import { ScrollbarsController } from '../runtime/scrollbars-controller'

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
 * `<xh-tree-select>`：Light-DOM 行为宿主：作者写 root / trigger / positioner / content / tree
 * 与若干 item / branch 角色节点，元素运行 tree-select 状态机并把 connect 产出接上。
 * 浮层定位引擎在本元素中创建、经 refs 注入状态机，锚点取 trigger、被定位的浮层取 positioner；
 * 节点身份取节点上的 value 属性。
 *
 * 层级（aria-level / aria-posinset / aria-setsize）、禁用与显示文本都查询 `collection` 这份树数据，
 * 不从 DOM 反推，因此 collection 必须与标记同源。
 *
 * value-text 的显示文字由元素填入；作者在该节点中写了内容则由作者负责，元素不再改写。
 *
 * 树数据与展开 / 选中集合都是数组，只能通过 property 设置（`el.collection = [...]`）；
 * 单选的选中值可用 value 属性写为裸串。
 *
 * @customElement xh-tree-select
 * @attr {string} value - 受控选中值（单选简写）；未提供该属性即非受控，多选通过 property 传入数组
 * @attr {string} default-value - 非受控初始选中值
 * @attr {boolean} open - 受控开合；未提供该属性即非受控
 * @attr {boolean} default-open - 非受控初始为展开
 * @attr {boolean} multiple - 多选：选中后浮层不收起，焦点留在树中；已选项在触发器里排成标签
 * @attr {number} max-tag-count - 多选标签最多显示的数量，其余折叠进 overflowCount 并合成 overflow-tag；默认 3
 * @attr {boolean} searchable - 浮层内搜索：展开时焦点先落在 input 上，输入即按 filter 把树裁到只剩命中的那几枝；自定义匹配规则经 filter property 给
 * @attr {boolean} cascade - 多选下父子级联勾选（整枝传导 / 半选 / 禁用冻结），默认 false
 * @attr {string} checked-strategy - 级联下对外值的收敛策略：child（默认）/ parent / all
 * @attr {boolean} disabled - 整个控件禁用：trigger 使用原生 disabled，表单出口不参与提交
 * @attr {boolean} read-only - 只读：浮层照常展开、树照常浏览，但选中值不可修改、也不可清空
 * @attr {boolean} invalid - 校验失败标注
 * @attr {boolean} loading - 节点加载中：树报告 aria-busy，显示在途占位、隐藏空态占位
 * @attr {'outline'|'subtle'|'ghost'} variant - 形态：outline / subtle / ghost，默认 outline
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @attr {string} placeholder - 无选中时 value-text 显示的占位文字
 * @attr {string} placement - 首选放置位，默认 bottom-start；避让后的实际位置写在 data-placement 上
 * @attr {number} offset - 浮层与锚点的间距（px）
 * @attr {boolean} loop - 上下键到达首尾回绕，默认关闭；写 loop="true" 开启
 * @attr {'ltr'|'rtl'} dir - 文字方向，只对调左右方向键的展开 / 收起语义，默认 ltr
 * @attr {string} name - 表单字段名；每个选中值提交为一个同名字段
 * @attr {string} form - 显式关联的原生表单 ID，提交与 reset 使用同一所有者
 * @fires value-change - 选中集合变化；detail 为 `{ value: string[] }`
 * @fires expanded-value-change - 展开集合变化；detail 为 `{ value: string[] }`
 * @fires open-change - open 状态变化；detail 为 `{ open: boolean }`
 * @fires branch-load-start - 分支请求开始；detail 为 `{ value, node, reason }`
 * @fires branch-load - 分支请求成功；detail 为 `{ value, node, children }`
 * @fires branch-load-error - 分支请求失败；detail 为 `{ value, node, error }`
 * @csspart root - 组件根容器（承载 data-state / data-disabled / data-readonly / data-invalid）
 * @csspart label - 标题（aria-labelledby 目标）
 * @csspart control - 触发按钮与清空按钮的收纳容器：描边、底色与聚焦环都落在这一层
 * @csspart trigger - role=combobox 的触发按钮，同时是定位锚点，须是原生 button
 * @csspart value-text - 选中项文本的显示位；留空即由元素填入 displayText，作者写了内容则由作者负责
 * @csspart tag-list - 触发器中的标签行：可见标签与 overflow-tag 放在其中；无选中时带 hidden，value-text 恢复显示占位文字
 * @csspart tag - 多选标签，须自带 value 属性标识选中值；接线为 tag 的 root（data-scope="tag"），语气、尺寸与禁用随本元素、形态按控件的面派生；放在触发器中即纯展示，放在外部配 item-delete-trigger 可删除
 * @csspart item-delete-trigger - 标签删除按钮，须放在 tag 中；接线为所在标签那份 tag 的 close-trigger（data-scope="tag"），禁用时保留位置、原生 disabled；点击移除所在标签的选中值，可及名使用 translations.deleteItem
 * @csspart overflow-tag - 折叠的标签合成的一个，同样接线为 tag 的 root，带 data-count：留空即由元素填入 +N（文字使用 translations.overflowTag），作者写了内容则由作者负责；没有折叠的标签时带 hidden
 * @csspart indicator - 展开指示符（aria-hidden，data-state 随开合）
 * @csspart clear-trigger - 清空按钮，须是原生 button；不占 Tab 位，aria-label 取 translations.clearTrigger，无值时 hidden
 * @csspart positioner - 浮层定位容器，坐标由引擎写为内联样式
 * @csspart content - 浮层壳（焦点域与消解层的根节点，键盘在此收口），收起时带 hidden
 * @csspart input - 浮层内搜索框，须是原生 input，放在 content 中、tree 之前；没开 searchable 时带 hidden。搜索视图里不在命中那几枝上的节点由元素加 hidden 收起
 * @csspart tree - role=tree 容器，没有锚点时的 Tab 兜底位与落焦点
 * @csspart item - role=treeitem 叶子，须自带 value 属性标识身份
 * @csspart item-text - 叶子文本
 * @csspart item-description - 条目的第 2 行副文本
 * @csspart item-suffix - 条目行尾的作者内容（计数、徽标）
 * @csspart item-indicator - 叶子与分支共用的选中或半选标记（aria-hidden）
 * @csspart branch - role=treeitem 分支，须自带 value 属性；它包裹自己的 branch-content
 * @csspart branch-control - 分支可点击行（点击只改变选中值，展开归箭头与左右方向键）
 * @csspart branch-trigger - 展开箭头（aria-hidden 且不占 Tab 位，只切换展开态）
 * @csspart branch-indicator - 展开方向指示符（aria-hidden）
 * @csspart branch-text - 分支文本
 * @csspart branch-content - role=group 子层容器，收起时隐藏
 * @csspart branch-loading - 懒分支在途状态；标记缺席时由元素补齐
 * @csspart branch-error - 懒分支错误状态；标记缺席时由元素补齐
 * @csspart branch-retry-trigger - 懒分支失败后的重试按钮；标记缺席时由元素补齐
 * @csspart branch-empty - 懒分支成功返回空数组的状态；标记缺席时由元素补齐
 * @csspart empty - 整树空态；标记缺席时由元素补齐，collection 与手写节点均自动判定
 * @csspart loading - 在途占位，与空态占位同一位置，加载期间显示
 * @csspart footer - 浮层底部的操作区，写在 content 中、tree 的兄弟；不进入树的拥有关系，方向键与连打检索也无法到达
 * @csspart hidden-input - type=hidden 的表单出口，省略该节点即不参与表单
 */
export class XhTreeSelectElement extends XhPortalHostElement {
  /** 本实例的 Portal 容器；显式解析失败不回退配置默认。 */
  declare portalContainer?: () => Element | null

  // tag / overflow-tag 接的是 tag 的 root，item-delete-trigger 接的是 tag 的 close-trigger：三个作者名都归 tag 那套 scope 管，不在本元素的解剖里
  static override partContract = {
    anatomy: treeSelectAnatomy,
    meta: treeSelectMeta,
    delegates: [{ name: tagAnatomy.name, parts: ['tag', 'overflow-tag', 'item-delete-trigger'] }],
  }

  // dir 只占属性名、字段改叫 direction，避开 HTMLElement 原生 dir 访问器。
  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    collection: { attribute: false },
    virtualizer: { attribute: false },
    value: { converter: STRING_CONVERTER },
    defaultValue: { converter: STRING_CONVERTER, attribute: 'default-value' },
    expandedValue: { attribute: false },
    defaultExpandedValue: { attribute: false },
    open: { converter: BOOLEAN_CONVERTER },
    defaultOpen: { type: Boolean, attribute: 'default-open' },
    multiple: { type: Boolean },
    maxTagCount: { converter: NUMBER_CONVERTER, attribute: 'max-tag-count' },
    searchable: { type: Boolean },
    // 函数只走 property，属性表达不了
    filter: { attribute: false },
    cascade: { type: Boolean },
    checkedStrategy: { converter: STRING_CONVERTER, attribute: 'checked-strategy' },
    disabled: { converter: BOOLEAN_CONVERTER },
    readOnly: { converter: BOOLEAN_CONVERTER, attribute: 'read-only' },
    invalid: { converter: BOOLEAN_CONVERTER },
    loading: { converter: BOOLEAN_CONVERTER },
    loadChildren: { attribute: false },
    variant: { converter: STRING_CONVERTER },
    tone: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
    placeholder: { converter: STRING_CONVERTER },
    translations: { attribute: false },
    placement: { converter: STRING_CONVERTER },
    offset: { converter: NUMBER_CONVERTER },
    loop: { converter: BOOLEAN_CONVERTER },
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
    name: { converter: STRING_CONVERTER },
    form: { converter: STRING_CONVERTER },
  }

  declare collection?: TreeSelectNode[]
  /** 完整 collection 与 Virtualizer 的焦点桥；count 必须等于当前 visibleNodes.length。只能作为 property 设置。 */
  declare virtualizer?: CollectionVirtualizer
  /** 懒分支的取数函数；只能作为 property 设置。 */
  declare loadChildren?: TreeSelectSchema['props']['loadChildren']
  declare value?: string | string[]
  declare defaultValue?: string | string[]
  declare expandedValue?: string[]
  declare defaultExpandedValue?: string[]
  declare open?: boolean
  declare defaultOpen?: boolean
  declare multiple?: boolean
  declare maxTagCount?: number
  declare searchable?: boolean
  /** 自定义匹配规则；缺省为标签大小写不敏感包含。 */
  declare filter?: TreeSelectSchema['props']['filter']
  declare cascade?: boolean
  declare checkedStrategy?: TreeSelectSchema['props']['checkedStrategy']
  declare disabled?: boolean
  declare readOnly?: boolean
  declare invalid?: boolean
  declare loading?: boolean
  declare variant?: ControlVariant
  declare tone?: Tone
  declare size?: Size
  declare placeholder?: string
  /** 读屏文案（树容器的兜底名称）；对象无法表达为属性，只作为 property 暴露。 */
  declare translations?: TreeSelectSchema['props']['translations']
  declare placement?: Placement
  declare offset?: number
  declare loop?: boolean
  declare direction?: Direction
  declare name?: string
  declare form?: string

  private readonly idGen: IdGenerator = createCounterIdGenerator()
  private readonly treeSelectScope = createScope(() => this, this.idGen)
  private readonly positionEngine: PositionEnginePort = createPositionEngine()
  private config: RuntimeConfig | null = null
  /** 退场闸门：收起从跟着 open 走改成跟着 presence 走，退场动画播完才真收。 */
  private exit: OverlayExit | null = null
  private readonly portal = this.createAnchoredPortalController({
    name: 'TreeSelect',
    config: () => this.config,
    source: () => this.getPart('trigger'),
    root: () => this.getPart('positioner'),
    onChange: () => this.requestUpdate(),
  })

  /** value-text 是否归元素填：首次见到该节点时定，之后不再回读（回读到的会是自己写的字）。 */
  private readonly ownsValueText = new WeakMap<HTMLElement, boolean>()
  /** 每枚标签里由元素补出来的那层 label。 */
  private readonly tagLabels = new WeakMap<HTMLElement, HTMLElement>()
  private readonly ownsFeedbackText = new WeakMap<HTMLElement, boolean>()
  private readonly generatedFeedback = new WeakSet<HTMLElement>()
  private renderedNodeCount = -1

  private readonly hiddenInputs = createRepeatedHiddenInputs(this.spreader)

  private readonly notifyValue = (details: TreeSelectValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyExpanded = (details: TreeSelectExpandedValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('expanded-value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyOpen = (details: TreeSelectOpenChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('open-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyBranchLoadStart = (details: TreeSelectBranchLoadStartDetails): void => {
    this.dispatchEvent(new CustomEvent('branch-load-start', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyBranchLoad = (details: TreeSelectBranchLoadDetails): void => {
    this.dispatchEvent(new CustomEvent('branch-load', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyBranchLoadError = (details: TreeSelectBranchLoadErrorDetails): void => {
    this.dispatchEvent(new CustomEvent('branch-load-error', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<TreeSelectSchema>(
    this,
    treeSelectMachine,
    () => this.machineProps(),
    { scope: this.treeSelectScope, onBuilt: svc => this.injectRefs(svc) },
  )

  private api(): TreeSelectApi | null {
    const service = this.ctrl.service as Service<TreeSelectSchema> | undefined
    return service ? connectTreeSelect(service, wcNormalize) : null
  }

  /** 当前整树是否为空；状态机尚未建立时为 false。 */
  get isEmpty(): boolean {
    return this.api()?.empty ?? false
  }

  /** 当前是否显示整树加载态；与作者传入的 loading 属性分开。 */
  get currentLoading(): boolean {
    return this.api()?.loading ?? false
  }

  /**
   * 应显示的标签（值 + 显示文本），已按 max-tag-count 截断，与选中先后同序。
   * 作者据此渲染 tag 部件。状态机尚未建立时返回空数组。
   */
  get tags(): TreeSelectTagMeta[] {
    return this.api()?.tags ?? []
  }

  /** 被 max-tag-count 折叠的标签数；+N 标签由元素填入 overflow-tag，此处仅供作者读取。状态机尚未建立时为 0。 */
  get overflowCount(): number {
    return this.api()?.overflowCount ?? 0
  }

  /** overflow-tag 显示的文字（由 translations.overflowTag 计算）；没有折叠的标签或状态机尚未建立时为空串。 */
  get overflowText(): string {
    return this.api()?.overflowText ?? ''
  }

  /** 正处于搜索视图（开启 searchable 且检索词非空）；状态机尚未建立时为 false。 */
  get searching(): boolean {
    return this.api()?.searching ?? false
  }

  /** 搜索框中的原始串；状态机尚未建立时为空串。 */
  get inputValue(): string {
    return this.api()?.inputValue ?? ''
  }

  /** 改写检索词，与在搜索框里输入同一语义；状态机尚未建立时不做任何事。 */
  setInputValue(next: string): void {
    this.api()?.setInputValue(next)
  }

  /** 移除一个选中值，其余保持选中先后；状态机尚未建立时不做任何事。 */
  deselect(value: string): void {
    this.api()?.deselect(value)
  }

  /**
   * 标签里只有文字时替它包一层 tag 的 label：截断规则挂在 label 上。作者自己写了子节点就原样放行，
   * 返回 null。补出来的那层不打 data-xh-part，不进角色节点表。
   */
  private ensureTagLabel(tag: HTMLElement): HTMLElement | null {
    const existing = this.tagLabels.get(tag)
    if (existing && existing.parentNode === tag)
      return existing
    if (tag.children.length > 0)
      return null
    const label = this.ownerDocument.createElement('span')
    label.append(...Array.from(tag.childNodes))
    tag.append(label)
    this.tagLabels.set(tag, label)
    return label
  }

  /**
   * 树的自绘滚动条：与 content 同级挂在已经 fixed 的 positioner 上。
   * 两条轴都排布：深层节点依靠缩进向行末推，横向溢出与纵向一样是常态；
   * 横条的正负按排版方向计算，而组件不读取计算样式，把作者写的显式值交过去。
   */
  private readonly bars = new ScrollbarsController(this, {
    shell: () => this.getPart('positioner'),
    // 虚拟窗口的滚动层是 Virtualizer 的视口，条子跟着它走
    scrollable: () => this.virtualizer?.getViewportElement() ?? this.getPart('tree'),
    axes: ['vertical', 'horizontal'],
    // 条子走浮层 4px 档
    props: () => ({ dir: this.direction, size: 'sm' }),
  })

  private inheritedControl: FormControlState | undefined

  setFormControlState(state: FormControlState | undefined): void {
    this.inheritedControl = state
    this.requestUpdate()
  }

  /** 读取一个懒分支的 Headless 异步相位；非懒分支返回 null。 */
  branchLoadState(value: string): TreeSelectBranchLoadSnapshot | null {
    return connectTreeSelect(this.ctrl.service, wcNormalize).branchLoadState(value)
  }

  /** 显式重试失败分支；实际请求身份与竞态仍由 Headless 管理。 */
  retryBranch(value: string): void {
    connectTreeSelect(this.ctrl.service, wcNormalize).retryBranch(value)
  }

  private machineProps(): Partial<TreeSelectSchema['props']> {
    const control = resolveFormControlState({
      disabled: this.disabled,
      readOnly: this.readOnly,
      invalid: this.invalid,
    }, this.inheritedControl)
    return {
      collection: this.collection,
      virtualizer: this.virtualizer,
      loadChildren: this.loadChildren,
      value: this.value,
      defaultValue: this.defaultValue,
      expandedValue: this.expandedValue,
      // 不补 []，缺省由机器兜
      defaultExpandedValue: this.defaultExpandedValue,
      open: this.open,
      defaultOpen: this.defaultOpen ?? false,
      multiple: this.multiple ?? false,
      maxTagCount: this.maxTagCount,
      searchable: this.searchable ?? false,
      filter: this.filter,
      cascade: this.cascade,
      checkedStrategy: this.checkedStrategy,
      disabled: control.disabled,
      readOnly: control.readOnly,
      invalid: control.invalid,
      loading: this.loading ?? false,
      variant: this.variant,
      tone: this.tone,
      size: this.size,
      placeholder: this.placeholder,
      translations: this.translations,
      placement: this.placement,
      offset: this.offset,
      loop: this.loop,
      dir: this.direction,
      name: this.name,
      form: this.form,
      onValueChange: this.notifyValue,
      onExpandedValueChange: this.notifyExpanded,
      onOpenChange: this.notifyOpen,
      onBranchLoadStart: this.notifyBranchLoadStart,
      onBranchLoad: this.notifyBranchLoad,
      onBranchLoadError: this.notifyBranchLoadError,
    }
  }

  private ensureConfig(): void {
    if (this.config)
      return
    this.config = createRuntimeConfig({ scope: this.treeSelectScope, idGenerator: this.idGen })
  }

  protected override externalPartRoots(): readonly HTMLElement[] {
    // 虚拟窗口里的节点住在 xh-virtualizer 的条目外壳里，嵌套元素的边界挡住了常规的角色扫描
    return [...this.portal.roots, ...(this.virtualizer?.getRenderedItemRoots() ?? [])]
  }

  // 只交注册函数、不在连接期注册：层的入栈出栈跟着展开态走（机器的 trackLayer 效应负责）。
  private readonly registerLayer = (): { layer: Layer, dispose: Cleanup } => {
    this.ensureConfig()
    return this.config!.layerRegistry.register({
      kind: 'popover',
      node: () => this.getPart('content'),
      // trigger 记为本层分支：点它算层内交互，开合交给 trigger 自己切换。
      // 浮层壳一并记上：content 之外还浮着自绘滚动条，按住它拖动不该把浮层消解掉
      branches: () => [this.getPart('trigger'), this.getPart('positioner')].filter(Boolean) as Element[],
      isModal: () => false,
      // 浮层不带遮罩，无可点关闭的表面
      surfaces: () => [],
    })
  }

  // onBuilt 在 ctrl 构造期就跑，service 由参数传入。
  private injectRefs(svc: Service<TreeSelectSchema>): void {
    this.ensureConfig()
    this.exit ??= createOverlayExit({
      open: (this.open ?? this.defaultOpen) ?? false,
      onExitComplete: () => this.requestUpdate(),
    })
    svc.refs.set('config', this.config)
    svc.refs.set('registerLayer', this.registerLayer)
    svc.refs.set('presence', this.exit.presence)
    svc.refs.set('position', this.positionEngine)
    // 锚点是字段盒：列表面板与盒子同宽、左缘对齐；作者没写 control 时退回触发器
    svc.refs.set('getAnchorEl', () => this.getPart('control') ?? this.getPart('trigger'))
    svc.refs.set('getTriggerEl', () => this.getPart('trigger'))
    svc.refs.set('getFloatingEl', () => this.getPart('positioner'))
    svc.refs.set('getContentEl', () => this.getPart('content'))
  }

  /** 提前发现一次角色节点：default-open 时状态机在 hostConnected 当场要到 content 中选择焦点锚点。 */
  override connectedCallback(): void {
    this.refreshParts()
    super.connectedCallback()
  }

  /**
   * 承载焦点的节点被移出 DOM 时上报 NODE.LOST，让状态机按当前数据重新选择锚点。
   * 判据是焦点已不在浮层内且离场的正是持有锚点的节点。
   */
  protected override onPartsReleased(nodes: readonly HTMLElement[]): void {
    this.hiddenInputs.release(nodes)
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
    const source = owner && owner !== this ? owner : el
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

  private fillFeedbackText(el: HTMLElement, text: string): void {
    let owned = this.ownsFeedbackText.get(el)
    if (owned === undefined) {
      owned = (el.textContent ?? '').trim() === ''
      this.ownsFeedbackText.set(el, owned)
    }
    if (owned && el.textContent !== text)
      el.textContent = text
  }

  /** 作者部件优先；缺席时在指定容器末尾补一个默认反馈节点。 */
  private ensureFeedback(parent: HTMLElement | null, name: string, tag = 'div'): HTMLElement | null {
    if (!parent)
      return null
    const candidates = [...parent.querySelectorAll<HTMLElement>(`[${PART_ATTR}="${name}"]`)]
      .filter(el => !name.startsWith('branch-') || el.closest(BRANCH_SELECTOR) === parent)
    const authored = candidates.find(el => !this.generatedFeedback.has(el))
    if (authored) {
      for (const generated of candidates) {
        if (this.generatedFeedback.has(generated))
          generated.remove()
      }
      return authored
    }
    if (candidates[0])
      return candidates[0]
    const el = this.ownerDocument.createElement(tag)
    el.setAttribute(PART_ATTR, name)
    this.generatedFeedback.add(el)
    parent.append(el)
    return el
  }

  protected wire(): void {
    const nodes = [...this.getParts('branch'), ...this.getParts('item')]
    if (nodes.length !== this.renderedNodeCount) {
      this.renderedNodeCount = nodes.length
      this.ctrl.service.send({
        type: 'NODES.SYNC',
        values: nodes.map(el => this.nodeOf(el, `${BRANCH_SELECTOR}, ${ITEM_SELECTOR}`).value),
      })
    }
    const api = connectTreeSelect(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('label', api.getLabelProps() as Record<string, unknown>)
    put('control', api.getControlProps() as Record<string, unknown>)
    put('trigger', api.getTriggerProps() as Record<string, unknown>)
    put('tag-list', api.getTagListProps() as Record<string, unknown>)
    // 标签是多实例 part，接的是 tag 的 root：身份取自己的 value 属性；只有文字的补一层 label
    const tagLabelProps = api.getTagLabelProps() as Record<string, unknown>
    for (const el of this.getParts('tag')) {
      this.spreader.spread(el, api.getTagProps({ value: el.getAttribute('value') ?? '' }) as Record<string, unknown>)
      const label = this.ensureTagLabel(el)
      if (label)
        this.spreader.spread(label, tagLabelProps)
    }
    // 删除钮是所在标签那份 tag 的 close-trigger：身份取所在 tag 的 value 属性
    for (const el of this.getParts('item-delete-trigger')) {
      const owner = el.closest<HTMLElement>('[data-xh-part="tag"]')
      this.spreader.spread(el, api.getItemDeleteTriggerProps({ value: owner?.getAttribute('value') ?? '' }) as Record<string, unknown>)
    }
    // +N 那一枚：属性先落，文字填进 label；作者写了子节点就归作者
    const overflowTag = this.getPart('overflow-tag')
    if (overflowTag) {
      this.spreader.spread(overflowTag, api.getOverflowTagProps() as Record<string, unknown>)
      const label = this.ensureTagLabel(overflowTag)
      if (label) {
        this.spreader.spread(label, tagLabelProps)
        this.fillFeedbackText(label, api.overflowText)
      }
    }
    put('indicator', api.getIndicatorProps() as Record<string, unknown>)
    put('clear-trigger', api.getClearTriggerProps() as Record<string, unknown>)
    // positioner 的 style 是对象，spreader 会逐条写成内联样式
    put('positioner', api.getPositionerProps() as Record<string, unknown>)
    put('content', api.getContentProps() as Record<string, unknown>)
    put('input', api.getInputProps() as Record<string, unknown>)
    put('tree', api.getTreeProps() as Record<string, unknown>)
    put('footer', api.getFooterProps() as Record<string, unknown>)
    const empty = this.ensureFeedback(this.getPart('content'), 'empty')
    if (empty) {
      this.spreader.spread(empty, api.getEmptyProps() as Record<string, unknown>)
      // 搜索视图里的空是「没有匹配」，与整棵树没有节点分开说
      this.fillFeedbackText(empty, api.searching ? api.translations.noMatch : api.translations.empty)
    }
    const loading = this.ensureFeedback(this.getPart('content'), 'loading')
    if (loading) {
      this.spreader.spread(loading, api.getLoadingProps() as Record<string, unknown>)
      this.fillFeedbackText(loading, api.translations.loading)
    }
    // 表单出口可缺省
    this.hiddenInputs.sync(this.getPart('hidden-input'), api.value.map(value =>
      api.getHiddenInputProps({ value }) as Record<string, unknown>))

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
    putAll('item', ITEM_SELECTOR, node => api.getItemProps(node))
    putAll('item-description', ITEM_SELECTOR, node => api.getItemDescriptionProps(node))
    putAll('item', ITEM_SELECTOR, node => api.getItemProps(node))
    putAll('item-suffix', ITEM_SELECTOR, node => api.getItemSuffixProps(node))
    putAll('item-indicator', `${ITEM_SELECTOR}, ${BRANCH_SELECTOR}`, node => api.getItemIndicatorProps(node))
    putAll('branch', BRANCH_SELECTOR, node => api.getBranchProps(node))
    putAll('branch-control', BRANCH_SELECTOR, node => api.getBranchControlProps(node))
    putAll('branch-trigger', BRANCH_SELECTOR, node => api.getBranchTriggerProps(node))
    putAll('branch-indicator', BRANCH_SELECTOR, node => api.getBranchIndicatorProps(node))
    putAll('branch-text', BRANCH_SELECTOR, node => api.getBranchTextProps(node))
    putAll('branch-content', BRANCH_SELECTOR, node => api.getBranchContentProps(node))
    for (const branch of this.getParts('branch')) {
      const node = this.nodeOf(branch, BRANCH_SELECTOR)
      if (api.branchLoadState(node.value) == null)
        continue
      const feedback = [
        ['branch-loading', 'div', api.getBranchLoadingProps(node), api.translations.loading],
        ['branch-error', 'div', api.getBranchErrorProps(node), api.translations.branchError],
        ['branch-retry-trigger', 'button', api.getBranchRetryTriggerProps(node), api.translations.retry],
        ['branch-empty', 'div', api.getBranchEmptyProps(node), api.translations.branchEmpty],
      ] as const
      for (const [name, tag, props, text] of feedback) {
        const el = this.ensureFeedback(branch, name, tag)
        if (!el)
          continue
        this.spreader.spread(el, props as Record<string, unknown>)
        this.fillFeedbackText(el, text)
      }
    }

    // 节点常驻，用内联 display 收起（作者层的 display 声明会盖过 [hidden]）
    // 退场动画播完之前先别收：presence 读 content 的 animationName 决定要不要多留一会儿。
    // 必须排在 put('content') 之后——data-state 得先落进 DOM，探测器才读得到退场那支动画
    this.ensureConfig()
    this.exit ??= createOverlayExit({
      open: api.open,
      onExitComplete: () => this.requestUpdate(),
    })
    this.exit.track(this.getPart('content'))
    this.exit.update(api.open)
    this.setPartHidden(this.getPart('content'), !this.exit.visible)
    for (const el of this.getParts('branch-content'))
      this.setPartHidden(el, !api.isExpanded(this.nodeOf(el, BRANCH_SELECTOR).value))

    this.bars.wire()
    this.portal.sync(this.exit.visible)
  }

  override disconnectedCallback(): void {
    this.portal.dispose()
    super.disconnectedCallback()
    // 退场没播完就离场：立刻结清并收起，否则作者的节点会带着已被撤掉的 data-state 留在页面上
    this.exit?.dispose()
    this.exit = null
    if (this.ctrl.service.state.get() !== 'open')
      this.setPartHidden(this.getPart('content'), true)
    // 层随机器停机一并撤掉，此处不再管
    this.config = null // 重连时 ensureConfig 重建
    this.renderedNodeCount = -1
  }
}
