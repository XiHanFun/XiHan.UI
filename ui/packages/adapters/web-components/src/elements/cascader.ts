/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 cascader 相关实现。

import type { Cleanup, ControlVariant, Direction, IdGenerator, Layer, Placement, PositionEnginePort, RuntimeConfig, Service, Size, Tone } from '@xihan-ui/core'
import type {
  CascaderApi,
  CascaderBranchLoadDetails,
  CascaderBranchLoadErrorDetails,
  CascaderBranchLoadStartDetails,
  CascaderExpandTrigger,
  CascaderItemProps,
  CascaderNode,
  CascaderOpenChangeDetails,
  CascaderSchema,
  CascaderTagMeta,
  CascaderValue,
  CascaderValueChangeDetails,
  FormControlState,
} from '@xihan-ui/headless'
import type { OverlayExit } from '../overlay-exit'
import { createCounterIdGenerator, createRuntimeConfig, createScope, ITEM_VALUE_ATTR } from '@xihan-ui/core'
import { cascaderAnatomy, cascaderMachine, cascaderMeta, connectCascader, resolveFormControlState, tagAnatomy } from '@xihan-ui/headless'
import { createPositionEngine } from '@xihan-ui/position'
import { wcNormalize } from '../dom/normalize'
import { PART_ATTR } from '../dom/parts'
import { createOverlayExit } from '../overlay-exit'
import { MachineController } from '../runtime/machine-controller'
import { XhPortalHostElement } from '../runtime/portal-host'
import { ScrollbarsController } from '../runtime/scrollbars-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定；Lit 自带转换器会把缺席落成 null/false，表达不了"未指定"。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : Number(v)) }
// 三态布尔：缺席=undefined（走缺省）、在场=true、显式写 "false"=false。
// Lit 默认的 Boolean 转换器是 v !== null，写 loop="false" 照样是真，缺省为真的开关就关不掉。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/** 条目一系的归属容器：文本与勾选标记向上找最近的那个条目。 */
const ITEM_SELECTOR = '[data-xh-part="item"]'

/**
 * `<xh-cascader>`：Light-DOM 行为宿主：作者写 root / trigger / positioner / content 与
 * 每一级一个 column、层内每个节点一个 item，元素运行 cascader 状态机并把 connect 产出接上。
 * 浮层定位引擎在本元素中创建、经 refs 注入状态机，锚点取 trigger、被定位的浮层取 positioner；
 * 状态机只识别端口，不识别具体引擎。
 *
 * 标记是静态的：列按树的深度写满（第 L 列放置第 L 层的全部节点），当前应显示的条目
 * 由元素加 hidden 收口，作者节点一个都不卸载。可先取 `cascaderBuildLevels(collection)` 按此编写。
 *
 * 所在列、整条路径、禁用与显示文本都查询 `collection` 这份树数据，不从 DOM 反推。
 * collection 必须与标记同源且 value 全树唯一。
 *
 * value-text 的显示文字由元素填入；作者在该节点中写了内容则由作者负责，元素不再改写。
 *
 * 树数据与选中路径都是数组，只能通过 property 设置（`el.collection = [...]`、
 * `el.value = ['zhejiang','hangzhou']`）。
 *
 * @customElement xh-cascader
 * @attr {string} name - 原生字段名，每条选中路径作为 JSON 字符串数组独立提交
 * @attr {string} form - 关联的原生表单 ID，指定后覆盖祖先归属
 * @attr {boolean} open - 受控开合；未提供该属性即非受控
 * @attr {boolean} default-open - 非受控初始为展开
 * @attr {'click'|'hover'} expand-trigger - 子列由点击还是悬停展开，默认 click
 * @attr {boolean} change-on-select - 中间层（分支）也可以落值
 * @attr {boolean} multiple - 多选：选中后浮层不收起，焦点留在列中；已选路径在触发器里排成标签
 * @attr {number} max-tag-count - 多选标签最多显示的数量，其余折叠进 overflowCount 并合成 overflow-tag；默认 3
 * @attr {boolean} searchable - 开启搜索：input 部件可用，输入后整条路径连缀过滤、候选替换列视图；自定义匹配规则经 filter property 给
 * @attr {boolean} cascade - 多选下父子级联勾选（整枝传导 / 半选 / 禁用冻结），默认 false
 * @attr {string} checked-strategy - 级联下对外值的收敛策略：child（默认）/ parent / all
 * @attr {boolean} disabled - 整个控件禁用：trigger 使用原生 disabled，浮层不可展开
 * @attr {boolean} read-only - 只读：浮层照常展开、列照常浏览，但选中值不可修改、也不可清空
 * @attr {boolean} invalid - 校验失败标注
 * @attr {boolean} loading - 候选加载中：浮层报告 aria-busy；当前视图无候选时显示在途占位
 * @attr {'outline'|'subtle'|'ghost'} variant - 形态：outline / subtle / ghost，默认 outline
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @attr {string} placeholder - 无选中时 value-text 显示的占位文字
 * @attr {string} separator - 路径回显的连接符，默认 " / "
 * @attr {string} placement - 首选放置位，默认 bottom-start；避让后的实际位置写在 data-placement 上
 * @attr {number} offset - 浮层与锚点的间距（px）
 * @attr {boolean} loop - 列内上下键到达首尾回绕，默认开启；写 loop="false" 关闭
 * @attr {'ltr'|'rtl'} dir - 文字方向，只对调左右方向键的进入子列 / 返回上一列语义，默认 ltr
 * @fires value-change - 选中路径集合变化；detail 为 `{ value: string[][] }`
 * @fires clear - 用户按清空钮（clear-trigger）清掉了值；先发值变化，再发它。程序化的 clear() 不发。
 * @fires open-change - open 状态变化；detail 为 `{ open: boolean }`
 * @fires branch-load-start - 懒分支请求开始；detail 为 `{ value, path, node, reason }`
 * @fires branch-load - 懒分支请求成功；detail 为 `{ value, path, node, children }`
 * @fires branch-load-error - 懒分支请求失败；detail 为 `{ value, path, node, error }`
 * @csspart root - 组件根容器（承载 data-state / data-disabled / data-readonly / data-invalid）
 * @csspart hidden-input - 宿主自动生成的逐路径原生表单出口，无需作者手写
 * @csspart label - 标题（aria-labelledby 目标）
 * @csspart control - 触发按钮与清空按钮的收纳容器：描边、底色与聚焦环都落在这一层
 * @csspart trigger - role=combobox 的触发按钮，同时是定位锚点，须是原生 button
 * @csspart value-text - 整条路径的显示位；留空即由元素填入，作者写了内容则由作者负责
 * @csspart tag-list - 触发器中的标签行：可见标签与 overflow-tag 放在其中；无选中时带 hidden，value-text 恢复显示占位文字
 * @csspart tag - 多选标签，须自带 value 属性写路径的比较键（tags 里的 key，即整条路径的 JSON 数组串）；接线为 tag 的 root（data-scope="tag"），语气、尺寸与禁用随本元素、形态按控件的面派生；放在触发器中即纯展示，放在外部配 item-delete-trigger 可删除
 * @csspart item-delete-trigger - 标签删除按钮，须放在 tag 中；接线为所在标签那份 tag 的 close-trigger（data-scope="tag"），禁用时保留位置、原生 disabled；点击移除所在标签的选中路径，可及名使用 translations.deleteItem
 * @csspart overflow-tag - 折叠的标签合成的一个，同样接线为 tag 的 root，带 data-count：留空即由元素填入 +N（文字使用 translations.overflowTag），作者写了内容则由作者负责；没有折叠的标签时带 hidden
 * @csspart indicator - 展开指示符（aria-hidden，data-state 随开合）
 * @csspart clear-trigger - 清空按钮，须是原生 button；不占 Tab 位，可及名取 translations.clearTrigger
 * @csspart positioner - 浮层定位容器，坐标由引擎写为内联样式
 * @csspart content - 浮层壳（焦点域与消解层的根节点），键盘在此收口，收起时带 hidden；根列没有条目时带 data-empty
 * @csspart input - 搜索框（content 顶部）；未开启 searchable 时带 hidden。上下键移动候选、Enter 选中、Escape 先清除输入
 * @csspart search-list - 候选列表容器；不在搜索视图时带 hidden，无候选时带 data-empty
 * @csspart search-item - 一条候选，须用 value 属性写整条路径的 JSON 数组串（如 value='["a","b"]'）；与输入不匹配的带 hidden
 * @csspart branch-loading - 懒分支那一列的在途提示；这一列属于懒分支时由元素在列末补齐并填入 translations.loading
 * @csspart branch-error - 懒分支那一列的失败提示；由元素在列末补齐并填入 translations.branchError
 * @csspart branch-retry-trigger - 懒分支取数失败后的重试按钮，不占 Tab 位；由元素在列末补齐并填入 translations.retry
 * @csspart loading - 在途占位，与空态占位同一位置；标记中未编写时由元素补充一个并填入 translations.loading，作者编写后由作者负责
 * @csspart empty - 空态占位：搜索无候选或 collection 为空时显示，其余时候带 hidden。标记中未编写时由元素在 content 末尾补充一个并填入默认文案；编写后使用作者的节点，文案也由作者负责
 * @csspart column - role=listbox 的一列，须自带 level 属性标识列序；被移除时带 hidden
 * @csspart group - role=group 分组容器，须自带 value 属性标识身份；条目挂在其中
 * @csspart group-label - 分组标题（本组 aria-labelledby 的目标），须放在 group 中
 * @csspart item - role=option 的条目，须自带 value 属性标识身份；不在当前列中时带 hidden
 * @csspart item-text - 条目文本
 * @csspart item-description - 条目的第 2 行副文本
 * @csspart item-suffix - 条目行尾的作者内容（计数、徽标）
 * @csspart item-indicator - 条目选中标记（aria-hidden）
 * @csspart footer - 浮层底部的操作区，写在 content 中与列并列，横跨全部列；不进入任何一列的拥有关系，方向键也无法到达
 */
export class XhCascaderElement extends XhPortalHostElement {
  /** 本实例的 Portal 容器；显式解析失败不回退配置默认。 */
  declare portalContainer?: () => Element | null

  // tag / overflow-tag 接的是 tag 的 root，item-delete-trigger 接的是 tag 的 close-trigger：三个作者名都归 tag 那套 scope 管，不在本元素的解剖里
  static override partContract = {
    anatomy: cascaderAnatomy,
    meta: cascaderMeta,
    delegates: [{ name: tagAnatomy.name, parts: ['tag', 'overflow-tag', 'item-delete-trigger'] }],
  }

  // dir 只占属性名、字段改叫 direction，避开 HTMLElement 原生 dir 访问器。
  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    collection: { attribute: false },
    // 函数只走 property，属性表达不了
    loadChildren: { attribute: false },
    value: { attribute: false },
    defaultValue: { attribute: false },
    name: { converter: STRING_CONVERTER },
    form: { converter: STRING_CONVERTER },
    open: { converter: BOOLEAN_CONVERTER },
    defaultOpen: { type: Boolean, attribute: 'default-open' },
    expandTrigger: { converter: STRING_CONVERTER, attribute: 'expand-trigger' },
    changeOnSelect: { converter: BOOLEAN_CONVERTER, attribute: 'change-on-select' },
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
    variant: { converter: STRING_CONVERTER },
    tone: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
    placeholder: { converter: STRING_CONVERTER },
    separator: { converter: STRING_CONVERTER },
    translations: { attribute: false },
    placement: { converter: STRING_CONVERTER },
    offset: { converter: NUMBER_CONVERTER },
    loop: { converter: BOOLEAN_CONVERTER },
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
  }

  declare collection?: CascaderNode[]
  /** 取回懒分支（hasChildren 且没给 children）的直接子项；展开路径走到它时自动调用。只能作为 property 设置。 */
  declare loadChildren?: CascaderSchema['props']['loadChildren']
  declare value?: CascaderValue
  declare defaultValue?: CascaderValue
  declare name?: string
  declare form?: string
  declare open?: boolean
  declare defaultOpen?: boolean
  declare expandTrigger?: CascaderExpandTrigger
  declare changeOnSelect?: boolean
  declare multiple?: boolean
  declare maxTagCount?: number
  declare searchable?: boolean
  /** 自定义搜索匹配；缺省为整条路径的显示名连缀后大小写不敏感包含。 */
  declare filter?: CascaderSchema['props']['filter']
  declare cascade?: boolean
  declare checkedStrategy?: CascaderSchema['props']['checkedStrategy']
  declare disabled?: boolean
  declare readOnly?: boolean
  declare invalid?: boolean
  declare loading?: boolean
  declare variant?: ControlVariant
  declare tone?: Tone
  declare size?: Size
  declare placeholder?: string
  declare separator?: string
  declare placement?: Placement
  declare offset?: number
  declare loop?: boolean
  declare direction?: Direction
  declare translations?: CascaderSchema['props']['translations']

  private readonly formInputs: HTMLInputElement[] = []

  private readonly idGen: IdGenerator = createCounterIdGenerator()
  private readonly cascaderScope = createScope(() => this, this.idGen)
  private readonly positionEngine: PositionEnginePort = createPositionEngine()
  private config: RuntimeConfig | null = null
  /** 退场闸门：收起从跟着 open 走改成跟着 presence 走，退场动画播完才真收。 */
  private exit: OverlayExit | null = null
  private readonly portal = this.createAnchoredPortalController({
    name: 'Cascader',
    config: () => this.config,
    source: () => this.getPart('trigger'),
    root: () => this.getPart('positioner'),
    onChange: () => this.requestUpdate(),
  })

  /** value-text 是否归元素填：首次见到该节点时定，之后不再回读（回读到的会是自己写的字）。 */
  private readonly ownsValueText = new WeakMap<HTMLElement, boolean>()

  /** 空态占位的文案是否归元素填，判定同 ownsValueText。 */
  private readonly ownsEmptyText = new WeakMap<HTMLElement, boolean>()

  /** 在途占位的文案是否归元素填，判定同 ownsValueText。 */
  private readonly ownsLoadingText = new WeakMap<HTMLElement, boolean>()

  /** 元素自己补出的 Loading；作者运行期加入正式部件时用它精确撤掉自动节点。 */
  private readonly generatedLoading = new WeakSet<HTMLElement>()

  /** 每枚标签里由元素补出来的那层 label。 */
  private readonly tagLabels = new WeakMap<HTMLElement, HTMLElement>()

  /** +N 标签的文字是否归元素填，判定同 ownsValueText。 */
  private readonly ownsOverflowText = new WeakMap<HTMLElement, boolean>()

  private api(): CascaderApi | null {
    const service = this.ctrl?.service as Service<CascaderSchema> | undefined
    return service ? connectCascader(service, wcNormalize) : null
  }

  /**
   * 应显示的标签（整条路径、比较键与显示文本），已按 max-tag-count 截断，与选中先后同序。
   * 作者据此渲染 tag 部件，value 属性写 key。状态机尚未建立时返回空数组。
   */
  get tags(): CascaderTagMeta[] {
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

  /** 移除一条选中路径，其余保持选中先后；状态机尚未建立时不做任何事。 */
  deselect(path: readonly string[]): void {
    this.api()?.deselect(path)
  }

  /** 从角色节点的 value 属性读整条路径（JSON 数组串，与 cascaderPathKey 同构）；读不出按空路径算。 */
  private pathOf(el: HTMLElement | null): string[] {
    const raw = el?.getAttribute('value') ?? '[]'
    try {
      const parsed: unknown = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed.map(String) : []
    }
    catch {
      return []
    }
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

  /** 按清空钮清掉了值：先派发值变化，再派发它；程序化的 clear() 不派发。 */
  private readonly notifyClear = (): void => {
    this.dispatchEvent(new CustomEvent('clear', { bubbles: true, composed: true }))
  }

  private readonly notifyValue = (details: CascaderValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyBranchLoadStart = (details: CascaderBranchLoadStartDetails): void => {
    this.dispatchEvent(new CustomEvent('branch-load-start', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyBranchLoad = (details: CascaderBranchLoadDetails): void => {
    this.dispatchEvent(new CustomEvent('branch-load', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyBranchLoadError = (details: CascaderBranchLoadErrorDetails): void => {
    this.dispatchEvent(new CustomEvent('branch-load-error', { detail: details, bubbles: true, composed: true }))
  }

  /** 元素在懒分支那一列里补出来的三块状态节点。 */
  private readonly generatedBranchFeedback = new WeakSet<HTMLElement>()

  /** 列里取一块状态节点：只认这一列自己的直接子节点，没有就在列末补一个。 */
  private ensureColumnFeedback(column: HTMLElement, name: string, tag: string): HTMLElement {
    const existing = [...column.children].find(el => el.getAttribute(PART_ATTR) === name) as HTMLElement | undefined
    if (existing)
      return existing
    const el = this.ownerDocument.createElement(tag)
    el.setAttribute(PART_ATTR, name)
    this.generatedBranchFeedback.add(el)
    column.append(el)
    return el
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

  /**
   * 列区的自绘滚动条：与 content 同级挂在已经 fixed 的 positioner 上。
   * 只排布横向：列多到放不下时整体横向滚动，纵向溢出归每一列自身；
   * 横条的正负按排版方向计算，而组件不读取计算样式，把作者写的显式值交过去。
   */
  private readonly bars = new ScrollbarsController(this, {
    shell: () => this.getPart('positioner'),
    scrollable: () => this.getPart('content'),
    axes: ['horizontal'],
    // 条子走浮层 4px 档
    props: () => ({ dir: this.direction, size: 'sm' }),
  })

  /**
   * 每一列自己的竖条：列并排住在 content 里，条子贴在各列的盒子上、紧跟在那一列后面，
   * 按此刻在场的列逐列建一套，列离场即拆。搜索列表与列互斥，同样贴自己的盒子。
   */
  private readonly columnBars = new ScrollbarsController(this, {
    shell: () => this.getPart('content'),
    scrollables: () => this.getParts('column'),
    anchor: 'layer',
    props: () => ({ dir: this.direction, size: 'sm' }),
  })

  private readonly searchBars = new ScrollbarsController(this, {
    shell: () => this.getPart('content'),
    scrollable: () => this.getPart('search-list'),
    anchor: 'layer',
    props: () => ({ dir: this.direction, size: 'sm' }),
  })

  private inheritedControl: FormControlState | undefined

  setFormControlState(state: FormControlState | undefined): void {
    this.inheritedControl = state
    this.requestUpdate()
  }

  private machineProps(): Partial<CascaderSchema['props']> {
    const control = resolveFormControlState({
      disabled: this.disabled,
      readOnly: this.readOnly,
      invalid: this.invalid,
    }, this.inheritedControl)
    return {
      collection: this.collection,
      loadChildren: this.loadChildren,
      value: this.value,
      defaultValue: this.defaultValue,
      name: this.name,
      form: this.form,
      open: this.open,
      defaultOpen: this.defaultOpen ?? false,
      expandTrigger: this.expandTrigger,
      changeOnSelect: this.changeOnSelect ?? false,
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
      separator: this.separator,
      placement: this.placement,
      offset: this.offset,
      loop: this.loop,
      dir: this.direction,
      translations: this.translations,
      onValueChange: this.notifyValue,
      onClear: this.notifyClear,
      onOpenChange: this.notifyOpen,
      onBranchLoadStart: this.notifyBranchLoadStart,
      onBranchLoad: this.notifyBranchLoad,
      onBranchLoadError: this.notifyBranchLoadError,
    }
  }

  private ensureConfig(): void {
    if (this.config)
      return
    this.config = createRuntimeConfig({ scope: this.cascaderScope, idGenerator: this.idGen })
  }

  protected override externalPartRoots(): readonly HTMLElement[] {
    return this.portal.roots
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
  private injectRefs(svc: Service<CascaderSchema>): void {
    this.ensureConfig()
    this.exit ??= createOverlayExit({
      open: (this.open ?? this.defaultOpen) ?? false,
      onExitComplete: () => this.requestUpdate(),
    })
    svc.refs.set('config', this.config)
    svc.refs.set('registerLayer', this.registerLayer)
    svc.refs.set('presence', this.exit.presence)
    svc.refs.set('position', this.positionEngine)
    // 锚点是字段盒：面板起始缘与盒对齐；作者没写 control 时退回触发器
    svc.refs.set('getAnchorEl', () => this.getPart('control') ?? this.getPart('trigger'))
    svc.refs.set('getTriggerEl', () => this.getPart('trigger'))
    svc.refs.set('getFloatingEl', () => this.getPart('positioner'))
    svc.refs.set('getContentEl', () => this.getPart('content'))
  }

  /** 提前发现一次角色节点，使 default-open 时状态机在 hostConnected 中就能取到 content。 */
  override connectedCallback(): void {
    this.refreshParts()
    super.connectedCallback()
  }

  /**
   * 承载焦点的条目被移出 DOM 时上报 ITEM.LOST，让状态机按当前数据重新选择锚点。
   * 判据是焦点已不在浮层内且离场的正是持有锚点的条目。
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

  /** 某个容器内的同名角色节点：getParts 收的是整个元素范围，按子树过滤才归得对身份。 */
  private partsIn(owner: HTMLElement, name: string): HTMLElement[] {
    return this.getParts(name).filter(el => owner.contains(el))
  }

  /**
   * 取角色节点所属的条目身份：value 写在 item 上，行内文本与勾选标记向上找本宿主内最近的 item，
   * 没有则读节点自身。
   */
  private itemOf(el: HTMLElement): CascaderItemProps {
    const owner = el.closest<HTMLElement>(ITEM_SELECTOR)
    const source = owner && owner !== this ? owner : el
    return { value: source.getAttribute('value') ?? '' }
  }

  /** 列声明的层号，未写或写错时按它在 column 序列中的位置兜底。 */
  private levelOf(el: HTMLElement, position: number): number {
    const raw = Number(el.getAttribute('level'))
    return Number.isFinite(raw) && raw >= 0 ? Math.trunc(raw) : position
  }

  /** 摘掉作者写在条目上的原生 disabled，条目禁用一律由 collection 决定并以 aria-disabled 表达。 */
  private stripNativeDisabled(el: HTMLElement): void {
    if (el.hasAttribute('disabled'))
      el.removeAttribute('disabled')
  }

  /** 把文字填进角色节点；首次见到该节点时若已有内容则判为归作者，之后一概不碰。 */
  private fillOwnedText(owns: WeakMap<HTMLElement, boolean>, el: HTMLElement, text: string): void {
    let owned = owns.get(el)
    if (owned === undefined) {
      owned = (el.textContent ?? '').trim() === ''
      owns.set(el, owned)
    }
    if (!owned || el.textContent === text)
      return
    el.textContent = text
  }

  /**
   * 取空态占位；标记里没写就在 content 末尾补一个，位置与 Vue 侧一致。
   * 作者写了就用作者那份，只接线不新建。补出来的节点下一轮由 discoverParts 收进 partMap。
   */
  private ensureEmpty(): HTMLElement | null {
    const existing = this.getPart('empty')
    if (existing)
      return existing
    const content = this.getPart('content')
    if (!content)
      return null
    const el = this.ownerDocument.createElement('div')
    el.setAttribute(PART_ATTR, 'empty')
    content.append(el)
    return el
  }

  /**
   * 取在途占位；作者未写时补一个。作者运行期加入自己的 Loading 时移除自动节点，
   * 始终只保留一个状态部件，不依靠文案内容推测所有权。
   */
  private ensureLoading(): HTMLElement | null {
    const loadings = this.getParts('loading')
    const authored = loadings.find(el => !this.generatedLoading.has(el))
    if (authored) {
      for (const generated of loadings) {
        if (this.generatedLoading.has(generated))
          generated.remove()
      }
      return authored
    }
    if (loadings[0])
      return loadings[0]
    const content = this.getPart('content')
    if (!content)
      return null
    const el = this.ownerDocument.createElement('div')
    el.setAttribute(PART_ATTR, 'loading')
    el.setAttribute('data-xh-cascader-auto-loading', '')
    this.generatedLoading.add(el)
    content.append(el)
    return el
  }

  /**
   * 表单出口的落点：出口住在 root 里（与 Vue / React 相同），插在 positioner（或它搬迁期间的
   * 占位节点）所在的那个 root 直系子节点之前。positioner 缺席或不在 root 里时为 null，出口退到 root 末尾。
   */
  private hiddenInputAnchor(parent: HTMLElement): ChildNode | null {
    let node: Node | null = this.portal.home()
    while (node && node.parentNode !== parent)
      node = node.parentNode
    return node as ChildNode | null
  }

  protected wire(): void {
    const api = connectCascader(this.ctrl.service, wcNormalize)

    // 每条完整路径一个原生字段，空集合没有空字段；自动节点不进入作者部件发现。
    while (this.formInputs.length > api.value.length) {
      const input = this.formInputs.pop()!
      this.spreader.release(input)
      input.remove()
    }
    // 出口连成一段住在 root 里、排在 positioner 的作者位置之前，文档序与 Vue / React 一致：那两端把
    // 出口渲在根末尾、浮层经 Portal 搬到落点，出口始终在浮层前面；Light DOM 的浮层收起时回到作者
    // 原位，出口若追加在末尾就排到了它后面。搬迁中以租约留在原位的占位节点为落点。
    const parent = this.getPart('root') ?? this
    const anchor = this.hiddenInputAnchor(parent)
    for (let index = 0; index < api.value.length; index++) {
      const input = this.formInputs[index] ?? this.ownerDocument.createElement('input')
      this.formInputs[index] = input
      this.spreader.spread(input, api.getHiddenInputProps({ path: api.value[index]! }) as Record<string, unknown>)
      const previous = this.formInputs[index - 1]
      if (previous) {
        if (previous.nextSibling !== input)
          previous.after(input)
      }
      else if (anchor) {
        if (input.nextSibling !== anchor)
          anchor.before(input)
      }
      else if (input.parentElement !== parent) {
        parent.append(input)
      }
    }

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
    // 标签是多实例 part，接的是 tag 的 root：身份取自己的 value 属性（路径的比较键）；只有文字的补一层 label
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
        this.fillOwnedText(this.ownsOverflowText, label, api.overflowText)
      }
    }
    put('indicator', api.getIndicatorProps() as Record<string, unknown>)
    put('clear-trigger', api.getClearTriggerProps() as Record<string, unknown>)
    // positioner 的 style 是对象，spreader 会逐条写成内联样式
    put('positioner', api.getPositionerProps() as Record<string, unknown>)
    put('content', api.getContentProps() as Record<string, unknown>)
    put('input', api.getInputProps() as Record<string, unknown>)
    put('search-list', api.getSearchListProps() as Record<string, unknown>)
    put('footer', api.getFooterProps() as Record<string, unknown>)

    // 空态占位标记里没写就补一个：露不露面归连接层，文案按当前视图取无匹配或无数据
    const empty = this.ensureEmpty()
    if (empty) {
      this.spreader.spread(empty, api.getEmptyProps() as Record<string, unknown>)
      this.fillOwnedText(this.ownsEmptyText, empty, api.searching ? api.translations.noMatch : api.translations.empty)
    }

    // Content 与 Vue / React 一样完整装配两种状态；作者写了 Loading 时只接线并保留作者文案。
    const loading = this.ensureLoading()
    if (loading) {
      this.spreader.spread(loading, api.getLoadingProps() as Record<string, unknown>)
      this.fillOwnedText(this.ownsLoadingText, loading, api.translations.loading)
    }

    // 候选是多实例 part：身份用 value 属性自报整条路径（JSON 数组串，与 cascaderPathKey 同构）
    for (const el of this.getParts('search-item'))
      this.spreader.spread(el, api.getSearchItemProps({ path: this.pathOf(el) }) as Record<string, unknown>)

    // 属性先落，显示文字随后
    const valueText = this.getPart('value-text')
    if (valueText) {
      this.spreader.spread(valueText, api.getValueTextProps() as Record<string, unknown>)
      this.fillOwnedText(this.ownsValueText, valueText, api.displayText)
    }

    // 集合类 part 逐个 spread，身份由节点自报，不依赖下标。
    // wire 跑在事件之前，按键时 data-scope/data-part/data-value 已在 DOM 上供连接层现查。
    this.getParts('column').forEach((el, position) => {
      const level = this.levelOf(el, position)
      this.spreader.spread(el, api.getColumnProps({ level }) as Record<string, unknown>)
      // 这一列属于懒分支：列末补上在途、失败与重试三块，露哪一块归连接层；补过的留着，换了父条目照样由连接层收起
      const hasFeedback = [...el.children].some(child => this.generatedBranchFeedback.has(child as HTMLElement))
      if (api.columnLoadState(level) == null && !hasFeedback)
        return
      const feedback = [
        ['branch-loading', 'div', api.getBranchLoadingProps({ level }), api.translations.loading],
        ['branch-error', 'div', api.getBranchErrorProps({ level }), api.translations.branchError],
        ['branch-retry-trigger', 'button', api.getBranchRetryTriggerProps({ level }), api.translations.retry],
      ] as const
      for (const [name, tag, props, text] of feedback) {
        const node = this.ensureColumnFeedback(el, name, tag)
        this.spreader.spread(node, props as Record<string, unknown>)
        if (node.textContent !== text)
          node.textContent = text
      }
    })
    // 分组是多实例 part：身份取自己的 value 属性，组内标题跟着同一份身份
    for (const el of this.getParts('group')) {
      const group = { value: el.getAttribute('value') ?? '' }
      this.spreader.spread(el, api.getGroupProps(group) as Record<string, unknown>)
      for (const label of this.partsIn(el, 'group-label'))
        this.spreader.spread(label, api.getGroupLabelProps(group) as Record<string, unknown>)
    }
    for (const el of this.getParts('item')) {
      this.stripNativeDisabled(el)
      this.spreader.spread(el, api.getItemProps(this.itemOf(el)) as Record<string, unknown>)
    }
    for (const el of this.getParts('item-text'))
      this.spreader.spread(el, api.getItemTextProps(this.itemOf(el)) as Record<string, unknown>)
    for (const el of this.getParts('item-description'))
      this.spreader.spread(el, api.getItemDescriptionProps(this.itemOf(el)) as Record<string, unknown>)
    for (const el of this.getParts('item-suffix'))
      this.spreader.spread(el, api.getItemSuffixProps(this.itemOf(el)) as Record<string, unknown>)
    for (const el of this.getParts('item-indicator'))
      this.spreader.spread(el, api.getItemIndicatorProps(this.itemOf(el)) as Record<string, unknown>)

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
    this.getParts('column').forEach((el, position) => {
      this.setPartHidden(el, this.levelOf(el, position) >= api.columns.length)
    })
    for (const el of this.getParts('item'))
      this.setPartHidden(el, !api.isVisible(this.itemOf(el).value))

    this.bars.wire()
    this.columnBars.wire()
    this.searchBars.wire()
    this.portal.sync(this.exit.visible)
  }

  override disconnectedCallback(): void {
    this.portal.dispose()
    for (const input of this.formInputs) {
      this.spreader.release(input)
      input.remove()
    }
    this.formInputs.length = 0
    super.disconnectedCallback()
    // 退场没播完就离场：立刻结清并收起，否则作者的节点会带着已被撤掉的 data-state 留在页面上
    this.exit?.dispose()
    this.exit = null
    if (this.ctrl.service.state.get() !== 'open')
      this.setPartHidden(this.getPart('content'), true)
    this.config = null // 重连时 ensureConfig 重建
  }
}
