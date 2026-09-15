/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 select 相关实现。

import type { Cleanup, ControlVariant, Direction, IdGenerator, Layer, Placement, PositionEnginePort, RuntimeConfig, Service, Size, Tone } from '@xihan-ui/core'
import type { FormControlState, SelectItemProps, SelectNode, SelectOpenChangeDetails, SelectSchema, SelectTagMeta, SelectValueChangeDetails } from '@xihan-ui/headless'
import type { OverlayExit } from '../overlay-exit'
import { createCounterIdGenerator, createRuntimeConfig, createScope, isItemDisabled, ITEM_VALUE_ATTR } from '@xihan-ui/core'
import { connectSelect, resolveFormControlState, selectAnatomy, selectMachine, selectMeta, tagAnatomy } from '@xihan-ui/headless'
import { createPositionEngine } from '@xihan-ui/position'
import { createDeclaredDisabled } from '../dom/declared-disabled'
import { wcNormalize } from '../dom/normalize'
import { createOverlayExit } from '../overlay-exit'
import { MachineController } from '../runtime/machine-controller'
import { XhPortalHostElement } from '../runtime/portal-host'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : Number(v)) }
// 三态布尔：缺席=undefined（走缺省）、在场=true、显式写 "false"=false。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-select>`：Light-DOM 行为宿主：作者写 root / trigger / value-text / positioner / content / item / ...
 * 角色节点，元素运行 select 状态机并把 connect 产出接上。浮层定位引擎在本元素中创建、经 refs 注入状态机，
 * 锚点取 trigger、被定位的浮层取 positioner。
 * 条目身份取作者写在 item 上的 value 属性，禁用由部件声明（aria-disabled）。
 *
 * value-text 的显示文字、overflow-tag 的 +N 与表单影子 hidden-select 的选项由元素填入，作者只需提供空节点；
 * value-text / overflow-tag 中作者写了内容则由作者负责，元素不再改写。
 *
 * tag 与 overflow-tag 两个角色节点接线为库内 tag 的 root（DOM 上带 data-scope="tag"，使用 tag 的皮肤）：
 * 语气、尺寸与禁用从本元素传下，形态按控件的面派生（outline / ghost / 默认使用淡底标签，subtle 使用描边标签）。
 * 节点中只有文字时元素为它包一层 tag 的 label（截断落在该层），
 * 作者自行写了子节点则原样保留。item-delete-trigger 接线为所在标签那份 tag 的 close-trigger。
 *
 * @customElement xh-select
 * @attr {string} value - 受控选中值；未提供该属性即非受控。多选集合通过 property 设置，属性只能传入单值
 * @attr {string} default-value - 非受控初始选中值。多选集合通过 property 设置，属性只能传入单值
 * @attr {boolean} open - 受控开合；未提供该属性即非受控
 * @attr {boolean} default-open - 非受控初始为展开
 * @attr {boolean} disabled - 整个控件禁用：trigger 使用原生 disabled，表单影子不参与提交
 * @attr {boolean} read-only - 只读：浮层照常展开、条目照常浏览，但选中值不可修改、也不可清空
 * @attr {boolean} invalid - 校验错误态：trigger 标红并输出 aria-invalid
 * @attr {boolean} loading - 条目加载中：列表报告 aria-busy，显示在途占位、隐藏空态占位
 * @attr {number} max-tag-count - 多选标签最多显示的数量，其余折叠进 overflowCount 并合成 overflow-tag；默认 3
 * @attr {boolean} required - 原生表单校验：无选中值时提交被拦截；多选下的条件是至少选中一项
 * @attr {string} name - 表单字段名；提供后表单影子才带 name 并参与提交
 * @attr {string} placeholder - 无选中时 value-text 显示的占位文字
 * @attr {string} placement - 首选放置位，默认 bottom-start；避让后的实际位置写在 data-placement 上
 * @attr {number} offset - 浮层与锚点的间距（px）
 * @attr {boolean} loop - 方向键到达末尾回绕，默认 true；写 loop="false" 关闭
 * @attr {boolean} multiple - 多选：点击即在集合中增删该项，列表不收起；属性存在即开启，关闭需移除属性（不同于 loop，写 multiple="false" 仍为开启）
 * @attr {'ltr'|'rtl'} dir - 文字方向，默认 ltr
 * @attr {'outline'|'subtle'|'ghost'} variant - 视觉变体
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @fires value-change - 选中值变化；detail 为 `{ value: string[] }`
 * @fires open-change - open 状态变化；detail 为 `{ open: boolean }`
 * @csspart root - 组件根容器（承载 data-state / data-disabled，也是表单影子的定位基准）
 * @csspart label - 组标题（aria-labelledby 目标）
 * @csspart trigger - 触发按钮（aria-haspopup=listbox / aria-expanded / aria-controls 所在），同时是定位锚点，须是原生 button
 * @csspart value-text - 选中项文本的显示位；留空即由元素填入 displayText，作者写了内容则由作者负责
 * @csspart indicator - 展开指示符（aria-hidden，data-state 随开合）
 * @csspart control - 盒：触发器与清空按钮在其中并排，描边、底色、控件高度与聚焦环都绘制在它身上
 * @csspart clear-trigger - 清空按钮：盒中 trigger 的兄弟节点，不占 Tab 位；无法清空（无值 / 禁用 / 只读）时带 hidden，点击后焦点送回 trigger；可及名使用 translations.clearTrigger
 * @csspart tag-list - 触发器中的标签行：可见标签与 overflow-tag 放在其中；无选中时带 hidden，value-text 恢复显示占位文字
 * @csspart tag - 多选标签，须自带 value 属性标识选中值；接线为 tag 的 root（data-scope="tag"），语气、尺寸与禁用随本元素、形态按控件的面派生；放在触发器中即纯展示，放在外部配 item-delete-trigger 可删除
 * @csspart item-delete-trigger - 标签删除按钮，须放在 tag 中；接线为所在标签那份 tag 的 close-trigger（data-scope="tag"），禁用时保留位置、原生 disabled；点击移除所在标签的选中值，可及名使用 translations.deleteItem
 * @csspart overflow-tag - 折叠的标签合成的一个，同样接线为 tag 的 root，带 data-count：留空即由元素填入 +N（文字使用 translations.overflowTag），作者写了内容则由作者负责；没有折叠的标签时带 hidden
 * @csspart positioner - 浮层定位容器，坐标由引擎写为内联样式
 * @csspart content - 浮层外壳（焦点域与消解层的根节点，键盘在此收口），收起时带 hidden
 * @csspart list - role=listbox 本体，条目放在其中；滚动也在这一层
 * @csspart footer - 浮层底部的操作区，是 list 的兄弟；不进入列表框的拥有关系，方向键与连打检索也不识别它
 * @csspart empty - 空态占位，须放在 content 中作为 list 的兄弟；提供 collection 时由元素按条数收放，条目手写时由作者负责
 * @csspart loading - 在途占位，与空态占位同一位置，加载期间显示
 * @csspart group - role=group 分组容器，须自带 value 属性标识身份；条目挂在其中
 * @csspart group-label - 分组标题（本组 aria-labelledby 的目标），须放在 group 中
 * @csspart item - role=option 条目，须自带 value 属性标识身份；禁用写 aria-disabled="true"
 * @csspart item-text - 条目文本（连打检索与 value-text 的取字来源）
 * @csspart item-indicator - 条目选中标记（aria-hidden）
 * @csspart hidden-select - 表单影子，须是原生 select 空壳；选项由元素按当前值补齐（多选时开启原生 multiple），省略该节点即不参与表单
 */
export class XhSelectElement extends XhPortalHostElement {
  /** 本实例的 Portal 容器；显式解析失败不回退配置默认。 */
  declare portalContainer?: () => Element | null

  // tag / overflow-tag 接的是 tag 的 root，item-delete-trigger 接的是 tag 的 close-trigger：三个作者名都归 tag 那套 scope 管，不在本元素的解剖里
  static override partContract = {
    anatomy: selectAnatomy,
    meta: selectMeta,
    delegates: [{ name: tagAnatomy.name, parts: ['tag', 'overflow-tag', 'item-delete-trigger'] }],
  }

  // dir 只占属性名、字段改叫 direction，避开 HTMLElement 原生 dir 访问器。
  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    // 数组只走 property，属性表达不了；给了它条目的文本与禁用即以数据为准
    collection: { attribute: false },
    value: { converter: STRING_CONVERTER },
    defaultValue: { converter: STRING_CONVERTER, attribute: 'default-value' },
    open: { converter: BOOLEAN_CONVERTER },
    defaultOpen: { type: Boolean, attribute: 'default-open' },
    disabled: { converter: BOOLEAN_CONVERTER },
    readOnly: { converter: BOOLEAN_CONVERTER, attribute: 'read-only' },
    invalid: { converter: BOOLEAN_CONVERTER },
    loading: { type: Boolean },
    required: { converter: BOOLEAN_CONVERTER },
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
  declare loading?: boolean
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
  /** 读屏文案（clearTrigger 等）；对象无法表达为属性，只作为 property 暴露。 */
  declare translations?: SelectSchema['props']['translations']
  declare maxTagCount?: number

  private readonly idGen: IdGenerator = createCounterIdGenerator()
  private readonly selectScope = createScope(() => this, this.idGen)
  private readonly positionEngine: PositionEnginePort = createPositionEngine()
  private config: RuntimeConfig | null = null
  /** 退场闸门：收起从跟着 open 走改成跟着 presence 走，退场动画播完才真收。 */
  private exit: OverlayExit | null = null
  private readonly portal = this.createAnchoredPortalController({
    name: 'Select',
    config: () => this.config,
    source: () => this.getPart('trigger'),
    root: () => this.getPart('positioner'),
    onChange: () => this.requestUpdate(),
  })

  /** value-text / overflow-tag 的文字是否归元素填：首次见到该节点时定，之后不再回读（回读到的会是自己写的字）。 */
  private readonly ownsText = new WeakMap<HTMLElement, boolean>()
  /** 每枚标签里由元素补出来的那层 label。 */
  private readonly tagLabels = new WeakMap<HTMLElement, HTMLElement>()
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

  /** 作者声明的条目禁用，只认首次见到的值；提供 collection 时使用它，否则现读 */
  private readonly declaredDisabled = createDeclaredDisabled()
  private inheritedControl: FormControlState | undefined

  setFormControlState(state: FormControlState | undefined): void {
    this.inheritedControl = state
    this.requestUpdate()
  }

  private machineProps(): Partial<SelectSchema['props']> {
    const control = resolveFormControlState({
      disabled: this.disabled,
      readOnly: this.readOnly,
      invalid: this.invalid,
      required: this.required,
    }, this.inheritedControl)
    return {
      collection: this.collection,
      value: this.value,
      defaultValue: this.defaultValue ?? null,
      open: this.open,
      defaultOpen: this.defaultOpen ?? false,
      disabled: control.disabled,
      readOnly: control.readOnly,
      invalid: control.invalid,
      loading: this.loading ?? false,
      required: control.required,
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

  protected override externalPartRoots(): readonly HTMLElement[] {
    return this.portal.roots
  }

  /** 在状态机挂载前建立 Presence，确保 default-open 的行为资源与视觉退场共享同一租约。 */
  private ensureExit(open: boolean): OverlayExit {
    this.ensureConfig()
    this.exit ??= createOverlayExit({
      config: this.config!,
      open,
      onExitComplete: () => this.requestUpdate(),
    })
    return this.exit
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
      // 列表不带遮罩，无可点关闭的表面
      surfaces: () => [],
    })
  }

  // onBuilt 在 ctrl 构造期就跑，service 由参数传入。
  private injectRefs(svc: Service<SelectSchema>): void {
    this.ensureConfig()
    svc.refs.set('config', this.config)
    svc.refs.set('registerLayer', this.registerLayer)
    svc.refs.set('presence', this.ensureExit(svc.state.get() === 'open').presence)
    svc.refs.set('position', this.positionEngine)
    svc.refs.set('getAnchorEl', () => this.getPart('trigger'))
    svc.refs.set('getFloatingEl', () => this.getPart('positioner'))
    svc.refs.set('getContentEl', () => this.getPart('content'))
  }

  /**
   * 提前发现一次角色节点：状态机在 hostConnected 当场要按当前值到 content 中现查显示文本，
   * default-open 时还要同场选出高亮锚点。
   */
  override connectedCallback(): void {
    this.refreshParts()
    super.connectedCallback()
  }

  /**
   * 承载焦点的条目被移出 DOM 时上报 ITEM.LOST，让状态机按当前数据重新选择高亮锚点。
   * 判据是焦点已不在列表内且离场的正是持有锚点的条目。
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

  /** 填入元素代管的文字（value-text 的显示文字、overflow-tag 的 +N）；首次见到该节点时若已有内容则归作者，之后不再改写。 */
  private fillText(el: HTMLElement, text: string): void {
    let owned = this.ownsText.get(el)
    if (owned === undefined) {
      owned = (el.textContent ?? '').trim() === ''
      this.ownsText.set(el, owned)
    }
    if (!owned || el.textContent === text)
      return
    el.textContent = text
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
   * 应显示的标签（值 + 显示文本），已按 max-tag-count 截断，与选中先后同序。
   * 作者据此渲染 tag 部件。状态机尚未建立时返回空数组。
   */
  get tags(): SelectTagMeta[] {
    return this.ctrl.service ? connectSelect(this.ctrl.service, wcNormalize).tags : []
  }

  /** 被 max-tag-count 折叠的标签数；+N 标签由元素填入 overflow-tag，此处仅供作者读取。状态机尚未建立时为 0。 */
  get overflowCount(): number {
    return this.ctrl.service ? connectSelect(this.ctrl.service, wcNormalize).overflowCount : 0
  }

  /** overflow-tag 显示的文字（由 translations.overflowTag 计算）；没有折叠的标签或状态机尚未建立时为空串。 */
  get overflowText(): string {
    return this.ctrl.service ? connectSelect(this.ctrl.service, wcNormalize).overflowText : ''
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

    put('tag-list', api.getTagListProps() as Record<string, unknown>)
    // 标签是多实例 part，接的是 tag 的 root：身份取自己（或所在 tag）的 value 属性；只有文字的补一层 label
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
        this.fillText(label, api.overflowText)
      }
    }
    // positioner 的 style 是对象，spreader 会逐条写成内联样式
    put('positioner', api.getPositionerProps() as Record<string, unknown>)
    put('content', api.getContentProps() as Record<string, unknown>)
    put('list', api.getListProps() as Record<string, unknown>)
    put('footer', api.getFooterProps() as Record<string, unknown>)
    put('empty', api.getEmptyProps() as Record<string, unknown>)
    put('loading', api.getLoadingProps() as Record<string, unknown>)

    // 分组是多实例 part：身份取自己的 value 属性，组内标题跟着同一份身份
    for (const el of this.getParts('group')) {
      const group = { value: el.getAttribute('value') ?? '' }
      this.spreader.spread(el, api.getGroupProps(group) as Record<string, unknown>)
      for (const label of this.partsIn(el, 'group-label'))
        this.spreader.spread(label, api.getGroupLabelProps(group) as Record<string, unknown>)
    }

    // 属性先落，再填显示文字
    const valueText = this.getPart('value-text')
    if (valueText) {
      this.spreader.spread(valueText, api.getValueTextProps() as Record<string, unknown>)
      this.fillText(valueText, api.displayText)
    }

    // 表单影子可缺省
    const hiddenSelect = this.getPart('hidden-select')
    if (hiddenSelect) {
      this.spreader.spread(hiddenSelect, api.getHiddenSelectProps() as Record<string, unknown>)
      this.syncHiddenOptions(hiddenSelect, api.value, api.valueText, api.multiple)
    }

    // 条目逐个打：身份取作者写的 value，禁用取部件自报的 aria-disabled。
    // wire 跑在事件之前，按键时 data-scope/data-part/data-value 已在 DOM 上供方向键与连打检索现查。
    const items = this.getParts('item')
    for (const el of items) {
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
    // 退场动画播完之前先别收：presence 读 content 的 animationName 决定要不要多留一会儿。
    // 必须排在 put('content') 之后——data-state 得先落进 DOM，探测器才读得到退场那支动画
    const exit = this.ensureExit(api.open)
    exit.track(content)
    exit.update(api.open)
    this.setPartHidden(content, !exit.visible)
    this.portal.sync(exit.visible)

    // 首次键盘展开时，旧帧的 content 仍带 inert，connect 当场 focus 会被浏览器拒绝。
    // 开态属性与 Portal 都落定后，仅在焦点尚未进入浮层时补到已高亮项；正常行间移动不抢焦点。
    if (api.open && content && !content.contains(content.ownerDocument.activeElement))
      items.find(item => item.hasAttribute('data-highlighted'))?.focus()
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
  }
}
