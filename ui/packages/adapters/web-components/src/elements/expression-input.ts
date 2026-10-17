/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 expression input 相关实现。

import type { Cleanup, ControlVariant, Direction, ExpressionCheck, ExpressionCompletionKind, ExpressionCompletionSource, IdGenerator, Layer, Placement, PositionEnginePort, RuntimeConfig, Service, Size, Tone } from '@xihan-ui/core'
import type { FunctionTable } from '@xihan-ui/expression'
import type {
  ExpressionInputApi,
  ExpressionInputAutoSize,
  ExpressionInputCompletionSelectDetails,
  ExpressionInputEl,
  ExpressionInputIssuesChangeDetails,
  ExpressionInputIssueView,
  ExpressionInputItem,
  ExpressionInputOpenChangeDetails,
  ExpressionInputSchema,
  ExpressionInputSegment,
  ExpressionInputTranslations,
  ExpressionInputValueChangeDetails,
  FormControlState,
} from '@xihan-ui/headless'
import type { ElementStructure } from '../element-base'
import type { OverlayExit } from '../overlay-exit'
import { createCounterIdGenerator, createRuntimeConfig, createScope } from '@xihan-ui/core'
import {
  connectExpressionInput,
  EXPRESSION_INPUT_STRUCTURE_TAKEOVER,
  expressionInputAnatomy,
  expressionInputMachine,
  expressionInputMeta,
  expressionInputStructure,
  resolveFormControlState,
} from '@xihan-ui/headless'
import { createPositionEngine } from '@xihan-ui/position'
import { wcNormalize } from '../dom/normalize'
import { createOverlayExit } from '../overlay-exit'
import { MachineController } from '../runtime/machine-controller'
import { XhPortalHostElement } from '../runtime/portal-host'
import { ScrollbarsController } from '../runtime/scrollbars-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }
// 三态布尔：缺席=undefined（走缺省）、在场=true、显式写 "false"=false。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/** 元素还没进文档时调命令式方法的报错。 */
function notConnected(method: string): Error {
  return new Error(`[xh] <xh-expression-input> 还没进文档，${method} 此时不可用`)
}

/**
 * `<xh-expression-input>`：表达式输入框。输入受限表达式，按检查函数即时报出问题，补全可引用的名字与函数。
 *
 * 结构由元素按标准结构生成：作者什么都不写、或只写 root 时，元素铺出字段外框、输入框、镜像层、补全浮层与问题列表；
 * 补全条目、镜像层的分段与问题行随数据增删。写了 label 属性才铺标题，放进 `<xh-field>` 时名字由字段给。
 *
 * 单行时输入框是 role=combobox，多行（multiline）时是 textarea，保持 textbox 角色、不写 aria-expanded；
 * 补全身份都经 aria-controls、aria-autocomplete 与 aria-activedescendant 上报，焦点始终在输入框上。
 *
 * @customElement xh-expression-input
 * @attr {string} value - 受控值；未提供该属性即非受控
 * @attr {string} default-value - 非受控初值
 * @attr {string} label - 标题文字；提供后元素铺 label 部件
 * @attr {boolean} multiline - 多行：输入框是 textarea，位置说明带行号，补全浮层锚在光标处
 * @attr {string} placeholder - 输入框占位文字
 * @attr {string} name - 表单字段名
 * @attr {boolean} disabled - 禁用
 * @attr {boolean} read-only - 只读：可聚焦、可复制，不能改值，补全不打开
 * @attr {boolean} required - 必填标注
 * @attr {boolean} invalid - 校验失败标注；与检查报出的 error 取或
 * @attr {number} check-delay - 输入后多久检查，单位毫秒，缺省 150；失焦时立即检查
 * @attr {boolean} loop - 方向键到达末尾回绕，默认 true；写 loop="false" 关闭
 * @attr {string} placement - 首选放置位，默认 bottom-start
 * @attr {number} offset - 浮层与锚点的间距（px）
 * @attr {'ltr'|'rtl'} dir - 文字方向，翻转浮层在行内轴上 start 与 end 的落点
 * @attr {'outline'|'subtle'|'ghost'} variant - 形态，默认 outline
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @fires value-change - 值变化；detail 为 `{ value: string }`
 * @fires issues-change - 检查结果变了；detail 为 `{ issues }`
 * @fires completion-select - 接受了一条补全；detail 为 `{ completion }`
 * @fires open-change - 补全开合；detail 为 `{ open: boolean }`
 * @csspart root - 组件根容器（承载 data-state、data-invalid 与三个视觉轴）
 * @csspart label - 标题；`for` 恒指向输入框
 * @csspart control - 字段视觉盒：描边与底色画在它上面
 * @csspart input - 输入框：单行 `<input>` 或多行 `<textarea>`
 * @csspart highlight - 叠在输入框下的镜像层，对读屏隐藏
 * @csspart highlight-segment - 镜像层里的一段；问题区间带 data-issue 与 data-severity，画成波浪下划线
 * @csspart positioner - 补全浮层的定位容器，坐标由引擎写为内联样式
 * @csspart content - role=listbox 的补全列表，收起时带 hidden
 * @csspart item - role=option 的一条补全
 * @csspart item-prefix - 条目种类小标（变量 / 函数），对读屏隐藏
 * @csspart item-text - 条目名字
 * @csspart item-suffix - 名字后面的提示：函数是签名，如 IF(条件, 真值[, 假值])
 * @csspart item-description - 条目的第 2 行说明
 * @csspart empty - 没有匹配的补全时显示的空态；与 content 同级
 * @csspart issues - 问题列表（role=status），没有问题时带 hidden
 * @csspart issue - 问题列表里的一行，如「第 3 列：未知的名字 amont」
 */
export class XhExpressionInputElement extends XhPortalHostElement {
  /** 本实例的 Portal 容器；显式解析失败不回退配置默认。 */
  declare portalContainer?: () => Element | null

  static override partContract = { anatomy: expressionInputAnatomy, meta: expressionInputMeta }

  static override fieldTarget = { parts: ['input'], kind: 'state' } as const

  /** 结构整棵随数据生成：作者什么都不写或只写 root。 */
  static override structure: ElementStructure<XhExpressionInputElement> = {
    takeover: EXPRESSION_INPUT_STRUCTURE_TAKEOVER,
    build: host => host.ctrl.service
      ? expressionInputStructure(connectExpressionInput(host.ctrl.service, wcNormalize), { label: host.label, multiline: host.multiline === true })
      : undefined,
  }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    // 函数、函数表与对象只走 property
    check: { attribute: false },
    completions: { attribute: false },
    functions: { attribute: false },
    autoSize: { attribute: false },
    translations: { attribute: false },
    value: { converter: STRING_CONVERTER },
    defaultValue: { converter: STRING_CONVERTER, attribute: 'default-value' },
    label: { converter: STRING_CONVERTER },
    multiline: { converter: BOOLEAN_CONVERTER },
    placeholder: { converter: STRING_CONVERTER },
    name: { converter: STRING_CONVERTER },
    disabled: { converter: BOOLEAN_CONVERTER },
    readOnly: { converter: BOOLEAN_CONVERTER, attribute: 'read-only' },
    required: { converter: BOOLEAN_CONVERTER },
    invalid: { converter: BOOLEAN_CONVERTER },
    checkDelay: { converter: NUMBER_CONVERTER, attribute: 'check-delay' },
    loop: { converter: BOOLEAN_CONVERTER },
    placement: { converter: STRING_CONVERTER },
    offset: { converter: NUMBER_CONVERTER },
    // dir 只占属性名、字段改叫 direction：HTMLElement 原生 dir 是 string 访问器
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
    variant: { converter: STRING_CONVERTER },
    tone: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
  }

  declare check?: ExpressionCheck
  declare completions?: ExpressionCompletionSource
  declare functions?: FunctionTable
  declare autoSize?: boolean | ExpressionInputAutoSize
  declare translations?: Partial<ExpressionInputTranslations>
  declare value?: string
  declare defaultValue?: string
  declare label?: string
  declare multiline?: boolean
  declare placeholder?: string
  declare name?: string
  declare disabled?: boolean
  declare readOnly?: boolean
  declare required?: boolean
  declare invalid?: boolean
  declare checkDelay?: number
  declare loop?: boolean
  declare placement?: Placement
  declare offset?: number
  declare direction?: Direction
  declare variant?: ControlVariant
  declare tone?: Tone
  declare size?: Size

  private readonly idGen: IdGenerator = createCounterIdGenerator()
  private readonly inputScope = createScope(() => this, this.idGen)
  private readonly positionEngine: PositionEnginePort = createPositionEngine()
  private config: RuntimeConfig | null = null
  private exit: OverlayExit | null = null
  private readonly portal = this.createAnchoredPortalController({
    name: 'ExpressionInput',
    config: () => this.config,
    source: () => this.getPart('input'),
    root: () => this.getPart('positioner'),
    onChange: () => this.requestUpdate(),
  })

  private readonly notifyValue = (details: ExpressionInputValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyIssues = (details: ExpressionInputIssuesChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('issues-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifySelect = (details: ExpressionInputCompletionSelectDetails): void => {
    this.dispatchEvent(new CustomEvent('completion-select', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyOpen = (details: ExpressionInputOpenChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('open-change', { detail: details, bubbles: true, composed: true }))
  }

  readonly ctrl = new MachineController<ExpressionInputSchema>(
    this,
    expressionInputMachine,
    () => this.machineProps(),
    { scope: this.inputScope, onBuilt: svc => this.injectRefs(svc) },
  )

  private readonly bars = new ScrollbarsController(this, {
    shell: () => this.getPart('positioner'),
    scrollable: () => this.getPart('content'),
    props: () => ({ size: 'sm' }),
  })

  private inheritedControl: FormControlState | undefined

  setFormControlState(state: FormControlState | undefined): void {
    this.inheritedControl = state
    this.requestUpdate()
  }

  private machineProps(): Partial<ExpressionInputSchema['props']> {
    const control = resolveFormControlState({
      disabled: this.disabled,
      readOnly: this.readOnly,
      required: this.required,
      invalid: this.invalid,
    }, this.inheritedControl)
    return {
      labelled: this.getPart('label') != null,
      ariaLabel: this.hostAriaLabel(),
      issuesRendered: this.getPart('issues') != null,
      label: this.label,
      multiline: this.multiline === true || this.getPart('input')?.tagName === 'TEXTAREA',
      value: this.value,
      defaultValue: this.defaultValue,
      check: this.check,
      completions: this.completions,
      functions: this.functions,
      placeholder: this.placeholder,
      name: this.name,
      disabled: control.disabled,
      readOnly: control.readOnly,
      required: control.required,
      invalid: control.invalid,
      autoSize: this.autoSize,
      checkDelay: this.checkDelay,
      loop: this.loop,
      placement: this.placement,
      offset: this.offset,
      dir: this.direction,
      translations: this.translations,
      variant: this.variant,
      tone: this.tone,
      size: this.size,
      onValueChange: this.notifyValue,
      onIssuesChange: this.notifyIssues,
      onCompletionSelect: this.notifySelect,
      onOpenChange: this.notifyOpen,
    }
  }

  private ensureConfig(): void {
    if (this.config)
      return
    this.config = createRuntimeConfig({ scope: this.inputScope, idGenerator: this.idGen })
  }

  protected override externalPartRoots(): readonly HTMLElement[] {
    return this.portal.roots
  }

  private readonly registerLayer = (): { layer: Layer, dispose: Cleanup } => {
    this.ensureConfig()
    return this.config!.layerRegistry.register({
      kind: 'popover',
      node: () => this.getPart('content'),
      branches: () => [this.getPart('input'), this.getPart('positioner')].filter(Boolean) as Element[],
      isModal: () => false,
      surfaces: () => [],
    })
  }

  private injectRefs(svc: Service<ExpressionInputSchema>): void {
    this.ensureConfig()
    this.exit ??= createOverlayExit({
      open: false,
      onExitComplete: () => this.requestUpdate(),
    })
    svc.refs.set('config', this.config)
    svc.refs.set('registerLayer', this.registerLayer)
    svc.refs.set('presence', this.exit.presence)
    svc.refs.set('position', this.positionEngine)
    svc.refs.set('getFloatingEl', () => this.getPart('positioner'))
    svc.refs.set('getInputEl', () => this.getPart('input') as ExpressionInputEl | null)
    svc.refs.set('getHighlightEl', () => this.getPart('highlight'))
  }

  /** 在光标处插入一段文本（替换选区），光标落在插入内容之后；例如宿主的「插入字段」按钮。 */
  insert(text: string): void {
    const api = this.api()
    if (!api)
      throw notConnected('insert')
    api.insert(text)
  }

  /** 让输入框获得焦点。 */
  override focus(options?: FocusOptions): void {
    (this.getPart('input') ?? this).focus(options)
  }

  // 状态机此刻的 api；元素还没进文档时为 null
  private api(): ExpressionInputApi | null {
    return this.ctrl.service ? connectExpressionInput(this.ctrl.service, wcNormalize) : null
  }

  /** 状态机此刻的值：受控时即作者给的 value，非受控时是输入框里的文字；状态机尚未建立时为空串。 */
  get currentValue(): string {
    return this.api()?.value ?? ''
  }

  /** 补全列表是否打开。 */
  get open(): boolean {
    return this.api()?.open ?? false
  }

  /** 光标处此刻的补全条目，按显示顺序排列。 */
  get items(): readonly ExpressionInputItem[] {
    return this.api()?.items ?? []
  }

  /** 最近一次检查报出的问题，带行列与说明文字；值改过、还没重新检查时为空数组。 */
  get issues(): readonly ExpressionInputIssueView[] {
    return this.api()?.issues ?? []
  }

  /** 镜像层的分段：问题区间单独成段，带问题序号与严重度。 */
  get segments(): readonly ExpressionInputSegment[] {
    return this.api()?.segments ?? []
  }

  /** 没有匹配的补全时显示的文字。 */
  get emptyText(): string {
    return this.api()?.emptyText ?? ''
  }

  /** 当前高亮的补全条目的键；没有高亮时为 null。 */
  get highlightedKey(): string | null {
    return this.api()?.highlightedKey ?? null
  }

  /** 条目种类的显示文字（变量 / 函数），随语言包。 */
  kindText(kind: ExpressionCompletionKind): string {
    const api = this.api()
    if (!api)
      throw notConnected('kindText')
    return api.kindText(kind)
  }

  /** 改写整段值；受控时只派 value-change，由宿主写回。 */
  setValue(value: string): void {
    const api = this.api()
    if (!api)
      throw notConnected('setValue')
    api.setValue(value)
  }

  /** 收起补全列表，值不变。 */
  close(): void {
    const api = this.api()
    if (!api)
      throw notConnected('close')
    api.close()
  }

  // 取 owner 子树内指定名字的角色节点。
  private partsIn(owner: HTMLElement, name: string): HTMLElement[] {
    return this.getParts(name).filter(el => owner.contains(el))
  }

  protected wire(): void {
    const api = connectExpressionInput(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }

    put('root', api.getRootProps() as Record<string, unknown>)
    put('label', api.getLabelProps() as Record<string, unknown>)
    put('control', api.getControlProps() as Record<string, unknown>)
    put('highlight', api.getHighlightProps() as Record<string, unknown>)
    put('empty', api.getEmptyProps() as Record<string, unknown>)
    put('issues', api.getIssuesProps() as Record<string, unknown>)

    const inputEl = this.getPart('input') as ExpressionInputEl | null
    const inputProps = api.getInputProps({ as: inputEl?.tagName === 'TEXTAREA' ? 'textarea' : 'input' }) as Record<string, unknown>
    // 值一样就别重写：给 value 重新赋值会把光标弹到末尾，补全就插不到中间去了
    if (inputEl && inputEl.value === inputProps.value)
      delete inputProps.value
    put('input', inputProps)

    put('positioner', api.getPositionerProps() as Record<string, unknown>)
    put('content', api.getContentProps() as Record<string, unknown>)

    // 生成的节点按身份属性找回自己那份数据：条目是 value（条目 key），分段与问题行是 index
    const itemOf = (el: HTMLElement): ExpressionInputItem | undefined => api.items.find(item => item.key === el.getAttribute('value'))
    for (const el of this.getParts('item')) {
      const item = itemOf(el)
      if (!item)
        continue
      this.spreader.spread(el, api.getItemProps({ item }) as Record<string, unknown>)
      for (const kind of this.partsIn(el, 'item-prefix'))
        this.spreader.spread(kind, api.getItemPrefixProps({ item }) as Record<string, unknown>)
      for (const label of this.partsIn(el, 'item-text'))
        this.spreader.spread(label, api.getItemTextProps({ item }) as Record<string, unknown>)
      for (const detail of this.partsIn(el, 'item-suffix'))
        this.spreader.spread(detail, api.getItemSuffixProps({ item }) as Record<string, unknown>)
      for (const description of this.partsIn(el, 'item-description'))
        this.spreader.spread(description, api.getItemDescriptionProps({ item }) as Record<string, unknown>)
    }
    for (const el of this.getParts('highlight-segment')) {
      const segment = api.segments[Number(el.getAttribute('index'))]
      if (segment)
        this.spreader.spread(el, api.getHighlightSegmentProps({ segment }) as Record<string, unknown>)
    }
    for (const el of this.getParts('issue')) {
      const issue = api.issues[Number(el.getAttribute('index'))]
      if (issue)
        this.spreader.spread(el, api.getIssueProps({ issue }) as Record<string, unknown>)
    }

    // 退场动画播完之前先别收：必须排在 put('content') 之后，data-state 得先落进 DOM
    this.ensureConfig()
    this.exit ??= createOverlayExit({
      open: api.open,
      onExitComplete: () => this.requestUpdate(),
    })
    this.exit.track(this.getPart('content'))
    this.exit.update(api.open)
    this.setPartHidden(this.getPart('content'), !this.exit.visible)

    this.bars.wire()
    this.portal.sync(this.exit.visible)
  }

  override disconnectedCallback(): void {
    this.portal.dispose()
    super.disconnectedCallback()
    this.exit?.dispose()
    this.exit = null
    if (this.ctrl.service.state.get() !== 'open')
      this.setPartHidden(this.getPart('content'), true)
    this.config = null
  }
}
