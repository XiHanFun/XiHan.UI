/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 command 相关实现。

import type { Cleanup, Direction, IdGenerator, Layer, OverlayBackdropVariant, RuntimeConfig, Service, Size } from '@xihan-ui/core'
import type {
  CommandApi,
  CommandGroup,
  CommandGroupMeta,
  CommandInputValueChangeDetails,
  CommandItemProps,
  CommandItemSelectDetails,
  CommandNode,
  CommandNodeMeta,
  CommandOpenChangeDetails,
  CommandSchema,
} from '@xihan-ui/headless'
import type { ElementStructure } from '../element-base'
import type { OverlayExit } from '../overlay-exit'
import { createCounterIdGenerator, createRuntimeConfig, createScope } from '@xihan-ui/core'
import { commandAnatomy, commandMachine, commandMeta, commandStructure, connectCommand, resolveCommandGroups } from '@xihan-ui/headless'
import { resolveXhConfig } from '../config'
import { BOOLEAN_CONVERTER } from '../dom/converters'
import { createDisabledDeclarations } from '../dom/declared-disabled'
import { wcNormalize } from '../dom/normalize'
import { createOverlayExit } from '../overlay-exit'
import { MachineController } from '../runtime/machine-controller'
import { XhPortalHostElement } from '../runtime/portal-host'
import { ScrollbarsController } from '../runtime/scrollbars-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }

/**
 * `<xh-command>`：Light-DOM 行为宿主：作者写 trigger / backdrop / positioner / content / input / list / item / ...
 * 角色节点，元素运行 command 状态机并把 connect 产出接上。
 *
 * 过滤在库这一层完成：命令清单经 collection 传入，检索串变化时，不在结果中的条目与整组被筛空的分组
 * 由 connect 写上 hidden。作者只需把整份清单铺设为节点，不必自行增删。
 *
 * 焦点自始至终在 input 上：条目不可聚焦、也不进入 Tab 序列，锚点经 aria-activedescendant 报告给读屏。
 *
 * 不写部件时元素按标准结构直接在自己里面生成：触发按钮（宿主直接子节点 `slot="trigger"` 给了内容才生成）、遮罩，
 * 定位层里的面板依次是检索框、按整份 collection 铺的结果列表、空态与在途占位、页脚（`slot="footer"` 给了内容才生成）；
 * 空态内容用 `slot="empty"` 给出，条目文字、行首、行尾可用 `slot="item:<值>"`、`slot="item-prefix:<值>"`、`slot="item-suffix:<值>"` 给出。
 *
 * @customElement xh-command
 * @attr {boolean} open - 受控开合；未提供该属性即非受控
 * @attr {boolean} default-open - 非受控初始为展开
 * @attr {string} input-value - 受控检索串；未提供该属性即非受控
 * @attr {string} default-input-value - 非受控初始检索串
 * @attr {boolean} filter - 内置过滤，默认开启；写 filter="false" 即由调用方自行筛选
 * @attr {boolean} case-sensitive - 过滤区分大小写，默认不区分
 * @attr {boolean} close-on-select - 选中一条命令后收起面板，默认 true
 * @attr {boolean} modal - 模态（陷入焦点、锁定滚动、遮罩交互外关闭），默认 true
 * @attr {boolean} close-on-escape - Esc 关闭，默认 true
 * @attr {boolean} close-on-interact-outside - 点击面板外关闭，默认跟随 modal
 * @attr {boolean} restore-focus - 关闭后把焦点归还触发元素，默认 true
 * @attr {boolean} loop - 方向键到达末尾回绕，默认 true；写 loop="false" 关闭
 * @attr {boolean} loading - 命令加载中：列表报告 aria-busy，显示在途占位、隐藏空态占位
 * @attr {string} placeholder - 检索框占位文字
 * @attr {'ltr'|'rtl'} dir - 文字方向；浮层移到落点后无法继承作者子树上的方向，需要 RTL 时显式提供
 * @attr {'sm'|'md'|'lg'} size - 尺寸：影响面板宽度与条目的几何档位
 * @attr {'opaque'|'blur'|'transparent'} variant - 遮罩形态：只影响 backdrop 的底色与模糊
 * @fires open-change - open 状态变化；detail 为 `{ open: boolean, reason?: string }`
 * @fires input-value-change - 检索串变化；detail 为 `{ inputValue: string }`
 * @fires item-select - 选中一条命令；detail 为 `{ value: string, label: string }`
 * @csspart trigger - 打开面板的按钮，须是原生 button；焦点关闭后归还给它
 * @csspart backdrop - 遮罩层
 * @csspart positioner - 浮层定位容器，由皮肤的 inset 直接摆放
 * @csspart content - role=dialog 面板（焦点陷阱所在），收起时带 hidden
 * @csspart input - 检索框，面板中唯一的输入入口，带 role=combobox
 * @csspart list - role=listbox 结果容器
 * @csspart group - role=group 分组容器，须自带 value 属性标识身份；整组被筛空时带 hidden
 * @csspart group-label - 分组标题（本组 aria-labelledby 的目标）
 * @csspart item - role=option 命令，须自带 value 属性标识身份；不在结果中时带 hidden
 * @csspart item-text - 命令文本（选中时回传给宿主的取字来源）
 * @csspart item-prefix - 条目行首的作者内容（图标、色块、头像），对读屏隐藏
 * @csspart item-description - 条目的第 2 行副文本
 * @csspart item-shortcut - 命令行尾的快捷键提示（aria-hidden，读屏从命令文字取意）
 * @csspart item-suffix - 条目行尾的作者内容（计数、徽标）
 * @csspart empty - 没有剩余条目时的提示；须放在 content 中作为 list 的兄弟（列表内只允许 option 与 group）
 * @csspart loading - 在途占位，与空态占位同一位置，加载期间显示
 * @csspart footer - 面板底部提示条，内容由作者决定
 */
export class XhCommandElement extends XhPortalHostElement {
  /** 本实例的 Portal 容器；显式解析失败不回退配置默认。 */
  declare portalContainer?: () => Element | null

  static override partContract = { anatomy: commandAnatomy, meta: commandMeta }

  static override structure: ElementStructure<XhCommandElement> = {
    rootless: true,
    build: host => commandStructure(
      resolveCommandGroups(host.collection ?? [], host.groups ?? [], '', { filter: false, caseSensitive: false }),
      { slotted: (name, key) => host.slotted(name, key) },
    ),
  }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    // 数组只走 property，属性表达不了
    collection: { attribute: false },
    groups: { attribute: false },
    // 文案对象只走 property
    translations: { attribute: false },
    open: { converter: BOOLEAN_CONVERTER },
    defaultOpen: { converter: BOOLEAN_CONVERTER, attribute: 'default-open' },
    inputValue: { converter: STRING_CONVERTER, attribute: 'input-value' },
    defaultInputValue: { converter: STRING_CONVERTER, attribute: 'default-input-value' },
    filter: { converter: BOOLEAN_CONVERTER },
    caseSensitive: { converter: BOOLEAN_CONVERTER, attribute: 'case-sensitive' },
    closeOnSelect: { converter: BOOLEAN_CONVERTER, attribute: 'close-on-select' },
    modal: { converter: BOOLEAN_CONVERTER },
    closeOnEscape: { converter: BOOLEAN_CONVERTER, attribute: 'close-on-escape' },
    closeOnInteractOutside: { converter: BOOLEAN_CONVERTER, attribute: 'close-on-interact-outside' },
    restoreFocus: { converter: BOOLEAN_CONVERTER, attribute: 'restore-focus' },
    loop: { converter: BOOLEAN_CONVERTER },
    loading: { converter: BOOLEAN_CONVERTER },
    placeholder: { converter: STRING_CONVERTER },
    // dir 只占属性名、字段改叫 direction：HTMLElement 原生 dir 是 string 访问器，
    // 同名响应式字段会与基类类型打架。属性仍进 observedAttributes，改 dir 照样触发重算。
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
    size: { converter: STRING_CONVERTER },
    variant: { converter: STRING_CONVERTER },
  }

  declare collection?: CommandNode[]
  declare groups?: CommandGroup[]
  declare translations?: CommandSchema['props']['translations']
  declare open?: boolean
  declare defaultOpen?: boolean
  declare inputValue?: string
  declare defaultInputValue?: string
  declare filter?: boolean
  declare caseSensitive?: boolean
  declare closeOnSelect?: boolean
  declare modal?: boolean
  declare closeOnEscape?: boolean
  declare closeOnInteractOutside?: boolean
  declare restoreFocus?: boolean
  declare loop?: boolean
  declare loading?: boolean
  declare placeholder?: string
  declare direction?: Direction
  declare size?: Size
  declare variant?: OverlayBackdropVariant

  private readonly idGen: IdGenerator = createCounterIdGenerator()
  private readonly commandScope = createScope(() => this, this.idGen)
  private config: RuntimeConfig | null = null
  /** 退场闸门：收起从跟着 open 走改成跟着 presence 走，退场动画播完才真收。 */
  private exit: OverlayExit | null = null

  /** 结果列表的自绘条：与 list 同级挂在面板（content 已经 relative）里；模态浮层里的条子走 4px 档 */
  private readonly bars = new ScrollbarsController(this, {
    shell: () => this.getPart('content'),
    scrollable: () => this.getPart('list'),
    props: () => ({ size: 'sm' }),
  })

  private readonly portal = this.createPortalLeaseController({
    name: 'Command 视口',
    config: () => this.config,
    source: () => this,
    roots: () => {
      const positioner = this.getPart('positioner')
      const content = this.getPart('content')
      const surface = positioner ?? content
      const backdrop = (this.modal ?? true) ? this.getPart('backdrop') : null
      return [backdrop, surface].filter((node): node is HTMLElement => node != null)
    },
    onChange: () => this.requestUpdate(),
  })

  /** 条目的禁用声明：connect 每帧把 aria-disabled 写回条目，回读时跳过这些写回值，只认作者写的；没写为 undefined。 */
  private readonly declaredDisabled = createDisabledDeclarations()

  private readonly notifyOpen = (details: CommandOpenChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('open-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyInputValue = (details: CommandInputValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('input-value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyItemSelect = (details: CommandItemSelectDetails): void => {
    this.dispatchEvent(new CustomEvent('item-select', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<CommandSchema>(
    this,
    commandMachine,
    () => this.machineProps(),
    { scope: this.commandScope, onBuilt: svc => this.injectRefs(svc) },
  )

  /**
   * 取数口与命令共用的取法。状态机在进入文档（hostConnected）后才建立，
   * 而这些都是公开面，作者拿到元素后随时可能读取、调用：尚未进入文档时如实返回空值，不抛错。
   */
  private api(): CommandApi | null {
    const service = this.ctrl.service as Service<CommandSchema> | undefined
    return service ? connectCommand(service, wcNormalize) : null
  }

  /**
   * 面板当前是否展开（`open` 属性是受控入参，可能缺席；此处是结果）。
   * 状态机尚未建立时返回 false。
   */
  get expanded(): boolean {
    return this.api()?.open ?? false
  }

  /**
   * 当前的检索串（`input-value` 属性缺席时非受控的值保存在状态机中，只能从此处读取）。
   * 状态机尚未建立时返回空串。
   */
  get currentInputValue(): string {
    return this.api()?.inputValue ?? ''
  }

  /** 过滤归组之后当前应显示的命令，空组已剔除。状态机尚未建立时返回空数组。 */
  get groupResults(): readonly CommandGroupMeta[] {
    return this.api()?.groups ?? []
  }

  /** 分组视图摊平后的结果，次序即方向键的遍历次序。状态机尚未建立时返回空数组。 */
  get results(): readonly CommandNodeMeta[] {
    return this.api()?.results ?? []
  }

  /** 键盘锚点；收起或无结果时为 null。 */
  get highlightedValue(): string | null {
    return this.api()?.highlightedValue ?? null
  }

  /** 是否没有任何结果。状态机尚未建立时返回 false。 */
  get isEmpty(): boolean {
    return this.api()?.empty ?? false
  }

  /** 开合面板。受控（写了 `open` 属性）时只触发 open-change，开合由宿主写回。状态机尚未建立时为空操作。 */
  setOpen(next: boolean): void {
    this.api()?.setOpen(next)
  }

  /** 改写检索串。受控时语义同 setOpen。状态机尚未建立时为空操作。 */
  setInputValue(next: string): void {
    this.api()?.setInputValue(next)
  }

  /** 直接执行某条命令，等同于在该条目上按回车。禁用的条目不响应。状态机尚未建立时为空操作。 */
  select(value: string): void {
    this.api()?.select(value)
  }

  private machineProps(): Partial<CommandSchema['props']> {
    return {
      collection: this.collection,
      groups: this.groups,
      translations: this.translations,
      open: this.open,
      defaultOpen: this.defaultOpen ?? false,
      inputValue: this.inputValue,
      defaultInputValue: this.defaultInputValue,
      filter: this.filter,
      caseSensitive: this.caseSensitive ?? false,
      closeOnSelect: this.closeOnSelect,
      modal: this.modal,
      closeOnEscape: this.closeOnEscape,
      closeOnInteractOutside: this.closeOnInteractOutside,
      restoreFocus: this.restoreFocus,
      loop: this.loop,
      loading: this.loading ?? false,
      placeholder: this.placeholder,
      dir: this.direction,
      size: this.size,
      variant: this.variant,
      onOpenChange: this.notifyOpen,
      onInputValueChange: this.notifyInputValue,
      onItemSelect: this.notifyItemSelect,
    }
  }

  private ensureConfig(): void {
    if (this.config)
      return
    // scrollRoot 每次现读：全局配置、最近的 <xh-config> 与元素搬家都按打开当刻解析
    this.config = createRuntimeConfig({
      scope: this.commandScope,
      idGenerator: this.idGen,
      scrollRoot: () => {
        const scrollRoot = resolveXhConfig(this).scrollRoot
        return scrollRoot === undefined ? null : scrollRoot()
      },
    })
  }

  protected override externalPartRoots(): readonly HTMLElement[] {
    return this.portal.roots
  }

  // 只交注册函数，层的入栈出栈由机器的 trackOverlay 效应跟着展开态做。
  private readonly registerLayer = (): { layer: Layer, dispose: Cleanup } => {
    this.ensureConfig()
    return this.config!.layerRegistry.register({
      kind: 'modal',
      node: () => this.getPart('content'),
      branches: () => [],
      isModal: () => this.modal ?? true,
      surfaces: () => [this.getPart('backdrop')].filter(Boolean) as Element[],
    })
  }

  // onBuilt 在 ctrl 构造期就跑，service 由参数传入。
  private injectRefs(svc: Service<CommandSchema>): void {
    this.ensureConfig()
    this.exit ??= createOverlayExit({
      open: (this.open ?? this.defaultOpen) ?? false,
      onExitComplete: () => this.requestUpdate(),
    })
    svc.refs.set('config', this.config)
    svc.refs.set('registerLayer', this.registerLayer)
    svc.refs.set('presence', this.exit.presence)
    svc.refs.set('getContentEl', () => this.getPart('content'))
    svc.refs.set('getListEl', () => this.getPart('list'))
    svc.refs.set('getInputEl', () => this.getPart('input') as HTMLInputElement | null)
  }

  /**
   * 提前发现一次角色节点：default-open 时状态机在 hostConnected 当场就要把焦点送进检索框。
   */
  override connectedCallback(): void {
    this.refreshParts()
    super.connectedCallback()
  }

  /** 取 owner 子树内指定名字的角色节点。 */
  private partsIn(owner: HTMLElement, name: string): HTMLElement[] {
    return this.getParts(name).filter(el => owner.contains(el))
  }

  private visibilityList: HTMLElement | null = null

  protected override onPartsReleased(nodes: readonly HTMLElement[]): void {
    if (!this.visibilityList || !nodes.includes(this.visibilityList))
      return
    this.visibilityList = null
    if (this.ctrl.service.getStatus() === 'Started') {
      this.ctrl.service.refs.set('getListEl', () => null)
      this.ctrl.service.refs.get('syncListVisibility')?.()
    }
  }

  protected wire(): void {
    const list = this.getPart('list')
    if (list !== this.visibilityList) {
      this.visibilityList = list
      this.ctrl.service.refs.set('getListEl', () => list)
      this.ctrl.service.refs.get('syncListVisibility')?.()
    }
    const api = connectCommand(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('trigger', api.getTriggerProps())
    put('backdrop', api.getBackdropProps())
    put('positioner', api.getPositionerProps())
    put('content', api.getContentProps())
    put('input', api.getInputProps())
    put('list', api.getListProps())
    put('empty', api.getEmptyProps())
    put('loading', api.getLoadingProps())
    put('footer', api.getFooterProps())

    for (const el of this.getParts('group')) {
      const group = { value: el.getAttribute('value') ?? '' }
      this.spreader.spread(el, api.getGroupProps(group))
      for (const label of this.partsIn(el, 'group-label'))
        this.spreader.spread(label, api.getGroupLabelProps(group))
    }

    // 条目逐个打：身份取作者写的 value，禁用取作者在条目上的声明。
    // wire 跑在事件之前，按键时 data-scope/data-part/data-value 已在 DOM 上供指针交互现查
    for (const el of this.getParts('item')) {
      const item: CommandItemProps = {
        value: el.getAttribute('value') ?? '',
        disabled: this.collection ? this.declaredDisabled.read(el) : this.declaredDisabled.read(el) ?? false,
      }
      this.spreader.spread(el, api.getItemProps(item))
      this.declaredDisabled.commit(el)
      for (const text of this.partsIn(el, 'item-text'))
        this.spreader.spread(text, api.getItemTextProps(item))
      for (const description of this.partsIn(el, 'item-description'))
        this.spreader.spread(description, api.getItemDescriptionProps(item))
      for (const shortcut of this.partsIn(el, 'item-shortcut'))
        this.spreader.spread(shortcut, api.getItemShortcutProps(item))
      for (const prefix of this.partsIn(el, 'item-prefix'))
        this.spreader.spread(prefix, api.getItemPrefixProps(item))
      for (const suffix of this.partsIn(el, 'item-suffix'))
        this.spreader.spread(suffix, api.getItemSuffixProps(item))
    }

    // 节点常驻，用内联 display 收起（作者层的 display 声明会盖过 [hidden]）。
    // 退场动画播完之前先别收：presence 读 content 的 animationName 决定要不要多留一会儿。
    // 必须排在 put('content') 之后——data-state 得先落进 DOM，探测器才读得到退场那支动画
    this.ensureConfig()
    this.exit ??= createOverlayExit({
      open: api.open,
      onExitComplete: () => this.requestUpdate(),
    })
    this.exit.track(this.getPart('content'), this.getPart('backdrop'))
    this.exit.update(api.open)
    const visible = this.exit.visible
    const modal = this.modal ?? true
    this.portal.sync(visible)

    // 收起用内联 display，优先级高于样式表对 [hidden] 的覆盖
    this.setPartHidden(this.getPart('backdrop'), !visible || !modal)
    this.setPartHidden(this.getPart('positioner'), !visible)
    // positioner 不是必需部件，content 自己也要收起
    this.setPartHidden(this.getPart('content'), !visible)

    this.bars.wire()
  }

  override disconnectedCallback(): void {
    this.portal.dispose()
    super.disconnectedCallback()
    // 退场没播完就离场：立刻结清并把子树收起，否则作者的节点会带着已被撤掉的 data-state 留在页面上。
    // 只在机器已经收起时才强收——元素被移动（remove 后立刻 append）时展开态不该被打断
    this.exit?.dispose()
    this.exit = null
    if (this.ctrl.service.state.get() !== 'open')
      this.setPartHidden(this.getPart('content'), true)
    this.config = null // 重连时 ensureConfig 重建
  }
}
