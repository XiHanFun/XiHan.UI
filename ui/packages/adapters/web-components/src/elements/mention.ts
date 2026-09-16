/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 mention 相关实现。

import type { Cleanup, ControlVariant, Direction, IdGenerator, Layer, Placement, PositionEnginePort, RuntimeConfig, Service, Size, Tone } from '@xihan-ui/core'
import type {
  FormControlState,
  MentionInputEl,
  MentionItemProps,
  MentionNode,
  MentionOpenChangeDetails,
  MentionQueryChangeDetails,
  MentionSchema,
  MentionSelectDetails,
  MentionTranslations,
  MentionValueChangeDetails,
} from '@xihan-ui/headless'
import type { OverlayExit } from '../overlay-exit'
import { createCounterIdGenerator, createRuntimeConfig, createScope } from '@xihan-ui/core'
import { connectMention, mentionAnatomy, mentionMachine, mentionMeta, resolveFormControlState } from '@xihan-ui/headless'
import { createPositionEngine } from '@xihan-ui/position'
import { createDeclaredDisabled } from '../dom/declared-disabled'
import { wcNormalize } from '../dom/normalize'
import { createOverlayExit } from '../overlay-exit'
import { MachineController } from '../runtime/machine-controller'
import { XhPortalHostElement } from '../runtime/portal-host'
import { ScrollbarsController } from '../runtime/scrollbars-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : Number(v)) }
// 三态布尔：缺席=undefined（走缺省）、在场=true、显式写 "false"=false。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-mention>`：Light-DOM 行为宿主：作者写 root / input / positioner / content / item 角色节点，
 * 元素运行 mention 状态机并把 connect 产出接上。浮层定位引擎在本元素中创建、经 refs 注入状态机，
 * 锚点即输入框本身（浮层贴近整个输入框，不跟随光标）。
 *
 * 与组合框的差别有两条。其一，浮层由光标处的前缀字符开合：前缀必须紧跟在行首或空白之后，
 * 邮箱地址中的 @ 因此不会误触发；前缀到光标之间的片段即查询串。其二，选中候选不是替换整个值，
 * 而是把该段查询串替换为候选文本、前后文不变，光标随后落在插入内容之后。
 *
 * input 部件是单行 `<input>`，元素在其上写 role=combobox 与 aria-expanded；
 * 候选身份经 aria-controls、aria-autocomplete 与 aria-activedescendant 上报。
 *
 * 过滤不由本元素完成：查询串变化时派发 query-change，作者据此增删 item 节点。
 *
 * @customElement xh-mention
 * @attr {string} trigger-prefix - 打开候选的前缀字符，默认 '@'；多种前缀并存时通过 property 传入数组
 * @attr {string} value - 受控正文；未提供该属性即非受控
 * @attr {string} default-value - 非受控初始正文
 * @attr {boolean} disabled - 整个控件禁用：输入框使用原生 disabled，候选一概不打开
 * @attr {boolean} loading - 候选加载中：候选面板报告 aria-busy，显示在途占位、隐藏空态占位
 * @attr {boolean} read-only - 只读：仍可聚焦与复制，不可写入，候选也不打开
 * @attr {boolean} invalid - 校验失败标注
 * @attr {string} placeholder - 输入框占位文字；未提供时保留作者标注在 input 部件上的值
 * @attr {string} name - 表单字段名；提供后输入框才带 name，整段正文随表单一并提交
 * @attr {boolean} loop - 方向键到达末尾回绕，默认 true；写 loop="false" 关闭
 * @attr {string} placement - 首选放置位，默认 bottom-start；避让后的实际位置写在 data-placement 上
 * @attr {number} offset - 浮层与输入框的间距（px）
 * @attr {'ltr'|'rtl'} dir - 文字方向，翻转浮层在行内轴上 start 与 end 的落点；只在显式提供时才写到定位层上
 * @attr {'outline'|'subtle'|'ghost'} variant - 形态：outline / subtle / ghost，默认 outline
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @fires value-change - 正文变化；detail 为 `{ value: string }`
 * @fires query-change - 查询串变化；detail 为 `{ query, prefix }`，作者据此过滤候选；收起时报告 null
 * @fires select - 候选被插入正文；detail 为 `{ value, label, prefix }`
 * @fires open-change - 浮层开合；detail 为 `{ open: boolean }`
 * @csspart root - 组件根容器（承载 data-state / data-disabled 与三个视觉轴）
 * @csspart label - 标题；`for` 恒指向输入框，因此须是原生 `<label>` 才可点击
 * @csspart input - 单行输入框，须写为 `<input>`；未提供 translations.input 时名字取自 label 部件
 * @csspart positioner - 浮层定位容器，坐标由引擎写为内联样式
 * @csspart content - role=listbox 容器（消解层的根节点），收起时带 hidden
 * @csspart empty - 没有任何候选时显示的空态；须与 content 同级（listbox 内只允许放置 option）
 * @csspart loading - 在途占位，与空态占位同一位置，加载期间显示
 * @csspart item - role=option 候选，须自带 value 属性标识身份；禁用写 aria-disabled="true"
 * @csspart item-text - 候选文本，也是插回正文的取字来源
 */
export class XhMentionElement extends XhPortalHostElement {
  /** 本实例的 Portal 容器；显式解析失败不回退配置默认。 */
  declare portalContainer?: () => Element | null

  static override partContract = { anatomy: mentionAnatomy, meta: mentionMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    // 数组只走 property，属性表达不了；给了 collection 候选的文本与禁用即以数据为准
    collection: { attribute: false },
    translations: { attribute: false },
    // prefix 撞 Element 的原生只读属性（命名空间前缀），属性名与字段名一并加 trigger- 前缀
    triggerPrefix: { converter: STRING_CONVERTER, attribute: 'trigger-prefix' },
    value: { converter: STRING_CONVERTER },
    defaultValue: { converter: STRING_CONVERTER, attribute: 'default-value' },
    disabled: { converter: BOOLEAN_CONVERTER },
    loading: { type: Boolean },
    readOnly: { converter: BOOLEAN_CONVERTER, attribute: 'read-only' },
    invalid: { converter: BOOLEAN_CONVERTER },
    placeholder: { converter: STRING_CONVERTER },
    name: { converter: STRING_CONVERTER },
    loop: { converter: BOOLEAN_CONVERTER },
    placement: { converter: STRING_CONVERTER },
    offset: { converter: NUMBER_CONVERTER },
    // dir 只占属性名、字段改叫 direction：HTMLElement 原生 dir 是 string 访问器，
    // 同名响应式字段会与基类类型打架。属性仍进 observedAttributes，改 dir 照样触发重算。
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
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
  declare loading?: boolean
  declare readOnly?: boolean
  declare invalid?: boolean
  declare placeholder?: string
  declare name?: string
  declare loop?: boolean
  declare placement?: Placement
  declare offset?: number
  declare direction?: Direction
  declare variant?: ControlVariant
  declare tone?: Tone
  declare size?: Size

  private readonly idGen: IdGenerator = createCounterIdGenerator()
  private readonly mentionScope = createScope(() => this, this.idGen)
  private readonly positionEngine: PositionEnginePort = createPositionEngine()
  private config: RuntimeConfig | null = null
  /** 退场闸门：收起从跟着 open 走改成跟着 presence 走，退场动画播完才真收。 */
  private exit: OverlayExit | null = null
  private readonly portal = this.createAnchoredPortalController({
    name: 'Mention',
    config: () => this.config,
    source: () => this.getPart('input'),
    root: () => this.getPart('positioner'),
    onChange: () => this.requestUpdate(),
  })

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

  /** 候选列表的自绘条：与 content 同级挂在已经 fixed 的 positioner 上，条子走浮层 4px 档 */
  private readonly bars = new ScrollbarsController(this, {
    shell: () => this.getPart('positioner'),
    scrollable: () => this.getPart('content'),
    props: () => ({ size: 'sm' }),
  })

  /** 作者声明的条目禁用，只认首次见到的值；提供 collection 时使用它，否则现读 */
  private readonly declaredDisabled = createDeclaredDisabled()
  private inheritedControl: FormControlState | undefined

  setFormControlState(state: FormControlState | undefined): void {
    this.inheritedControl = state
    this.requestUpdate()
  }

  private machineProps(): Partial<MentionSchema['props']> {
    const control = resolveFormControlState({
      disabled: this.disabled,
      readOnly: this.readOnly,
      invalid: this.invalid,
    }, this.inheritedControl)
    return {
      triggerPrefix: this.triggerPrefix,
      collection: this.collection,
      value: this.value,
      defaultValue: this.defaultValue,
      disabled: control.disabled,
      loading: this.loading ?? false,
      readOnly: control.readOnly,
      invalid: control.invalid,
      placeholder: this.placeholder,
      name: this.name,
      loop: this.loop,
      placement: this.placement,
      offset: this.offset,
      dir: this.direction,
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

  protected override externalPartRoots(): readonly HTMLElement[] {
    return this.portal.roots
  }

  // 只交注册函数、不在连接期注册：层的入栈出栈跟着展开态走（机器的 trackLayer 效应负责）。
  private readonly registerLayer = (): { layer: Layer, dispose: Cleanup } => {
    this.ensureConfig()
    return this.config!.layerRegistry.register({
      kind: 'popover',
      node: () => this.getPart('content'),
      // 输入框记为本层分支：在正文里打字、点击都算层内交互，不该把浮层点没。
      // 浮层壳一并记上：候选列表之外还浮着自绘滚动条，按住它拖动不该把列表消解掉
      branches: () => [this.getPart('input'), this.getPart('positioner')].filter(Boolean) as Element[],
      isModal: () => false,
      // 浮层不带遮罩，无可点关闭的表面
      surfaces: () => [],
    })
  }

  // onBuilt 在 ctrl 构造期就跑，service 由参数传入。
  private injectRefs(svc: Service<MentionSchema>): void {
    this.ensureConfig()
    this.exit ??= createOverlayExit({
      config: this.config!,
      open: false,
      onExitComplete: () => this.requestUpdate(),
    })
    svc.refs.set('config', this.config)
    svc.refs.set('registerLayer', this.registerLayer)
    svc.refs.set('presence', this.exit.presence)
    svc.refs.set('position', this.positionEngine)
    svc.refs.set('getFloatingEl', () => this.getPart('positioner'))
    svc.refs.set('getContentEl', () => this.getPart('content'))
    svc.refs.set('getInputEl', () => this.getPart('input') as MentionInputEl | null)
  }

  /** 提前发现一次角色节点：状态机挂载当场就要读取到输入框与候选容器。 */
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
    put('label', api.getLabelProps() as Record<string, unknown>)
    put('empty', api.getEmptyProps() as Record<string, unknown>)
    put('loading', api.getLoadingProps() as Record<string, unknown>)

    const inputEl = this.getPart('input') as MentionInputEl | null
    const inputProps = api.getInputProps() as Record<string, unknown>
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
  }
}
