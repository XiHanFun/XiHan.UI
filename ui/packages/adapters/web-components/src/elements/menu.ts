/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 menu 相关实现。

import type { Cleanup, Direction, IconRecord, IdGenerator, Layer, Placement, PositionEnginePort, RuntimeConfig, Service, Size, Tone } from '@xihan-ui/core'
import type { MenuAnyItemProps, MenuCheckboxValueChangeDetails, MenuItemSelectDetails, MenuNode, MenuOpenChangeDetails, MenuRadioValue, MenuRadioValueChangeDetails, MenuSchema, MenuTranslations } from '@xihan-ui/headless'
import type { ElementStructure } from '../element-base'
import type { OverlayExit } from '../overlay-exit'
import type { MenuSubmenuChild, MenuSubmenuOwner, MenuSubmenuRegistration } from '../runtime/menu-submenu-owner'
import { createCounterIdGenerator, createRuntimeConfig, createScope, ITEM_VALUE_ATTR } from '@xihan-ui/core'
import { connectMenu, createMenuTreeNode, menuAnatomy, menuMachine, menuMeta, menuStructure } from '@xihan-ui/headless'
import { createPositionEngine } from '@xihan-ui/position'
import { BOOLEAN_CONVERTER } from '../dom/converters'
import { createDisabledDeclarations } from '../dom/declared-disabled'
import { wcNormalize } from '../dom/normalize'
import { createOverlayExit } from '../overlay-exit'
import { MachineController } from '../runtime/machine-controller'
import { findMenuSubmenuOwner, setMenuSubmenuOwner } from '../runtime/menu-submenu-owner'
import { XhPortalHostElement } from '../runtime/portal-host'
import { ScrollbarsController } from '../runtime/scrollbars-controller'
import { XhIconElement } from './icon'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : Number(v)) }

/**
 * `<xh-menu>`：Light-DOM 行为宿主：作者写 trigger / positioner / content / item / group / ... 角色节点，
 * 元素运行 menu 状态机并把 connect 产出接上。浮层定位引擎在本元素中创建、经 refs 注入状态机，
 * 锚点取 trigger、被定位的浮层取 positioner；状态机只识别端口，不识别具体引擎。
 * 条目身份取作者写在 item 上的 value 属性，禁用由部件声明（aria-disabled）。
 *
 * 不写部件时元素按标准结构直接在自己里面生成：触发按钮（内容用宿主直接子节点 `slot="trigger"` 接管，没写时取 label），
 * 定位层里的 content 按 collection 铺条目、分组与分隔线；条目的整条、行首、行尾可用 `slot="item:<值>"`、
 * `slot="item-prefix:<值>"`、`slot="item-suffix:<值>"` 接管。带 children 的条目生成一个嵌套的 `<xh-menu submenu>`，
 * 它的触发条目写着 value、文字取 label，slot 接管只到根菜单这一层。
 *
 * @customElement xh-menu
 * @attr {boolean} open - 受控开合；未提供该属性即非受控
 * @attr {boolean} default-open - 非受控初始为展开
 * @attr {string} placement - 首选放置位，默认 bottom-start；避让后的实际位置写在 data-placement 上
 * @attr {number} offset - 浮层与锚点的间距（px）
 * @attr {boolean} loop - 方向键到达末尾回绕，默认 true；写 loop="false" 关闭
 * @attr {'ltr'|'rtl'} dir - 文字方向，默认 ltr
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @attr {boolean} typeahead - 首字符连打检索，默认开启；写 typeahead="false" 关闭
 * @attr {boolean} disabled - 整张菜单禁用：触发器不再展开，条目全部为 aria-disabled
 * @attr {string} label - 生成结构时的触发器文字：根菜单是按钮里的文字（没写 slot="trigger" 时），子菜单是触发条目的文字；手写部件时不使用它
 * @attr {string} value - 子菜单在父菜单里的条目身份：生成结构时写在触发条目上；手写部件时写在触发条目自己身上
 * @fires open-change - open 状态变化；detail 为 `{ open: boolean }`
 * @fires item-select - 条目被选中（菜单随之关闭）；detail 为 `{ value: string }`
 * @fires checkbox-value-change - checkbox 选中集合变化；detail 为 `{ value: string[] }`
 * @fires radio-value-change - RadioGroup 选中映射变化；detail 为 `{ value: Record<string, string> }`
 * @csspart trigger - 触发按钮（aria-haspopup / aria-expanded / aria-controls 所在）；没给 anchor 时同时是定位锚点
 * @csspart positioner - 浮层定位容器，坐标由引擎写为内联样式
 * @csspart content - role=menu 容器（焦点域与消解层的根节点，键盘在此收口），收起时带 hidden
 * @csspart item - role=menuitem 条目，须自带 value 属性标识身份；禁用写 aria-disabled="true"
 * @csspart item-text - 条目中的文字载体，连打检索取自它
 * @csspart item-indicator - 勾选与单选条目的对号，排在条目最后；aria-hidden
 * @csspart item-description - 条目中的副文本
 * @csspart item-icon - 条目文字之前的图标格（aria-hidden，读屏从条目文字取意）；按数据铺时里面是一枚 xh-icon，slot="item-prefix:<值>" 的内容也落这里
 * @csspart item-shortcut - 条目中的快捷键提示（aria-hidden，读屏从条目文字取意）
 * @csspart item-suffix - 条目行尾的作者内容（计数、徽标、次级图标）
 * @csspart separator - 分隔线（role=separator，不进入方向键导航）
 * @csspart group - role=group 分组容器，须自带 value 属性标识身份
 * @csspart group-label - 分组标题（本组 aria-labelledby 的目标）
 * @csspart arrow - 指向锚点的箭头（aria-hidden，data-placement 随实际放置位翻转）
 */
export class XhMenuElement extends XhPortalHostElement {
  /** 本实例的 Portal 容器；显式解析失败不回退配置默认。 */
  declare portalContainer?: () => Element | null

  // 子菜单形态的 trigger 接线后是父菜单里的一条 item（双重身份，见 wire 与 Headless 的 getSubmenuTriggerProps）
  static override partContract = { anatomy: menuAnatomy, meta: menuMeta, rewired: { trigger: ['item'] } }

  /** 结构里带 children 的条目生成嵌套的子菜单。 */
  static override dependencies = { 'xh-menu': XhMenuElement, 'xh-icon': XhIconElement }

  static override structure: ElementStructure<XhMenuElement> = {
    rootless: true,
    build: host => host.ctrl.service
      ? menuStructure(connectMenu(host.ctrl.service, wcNormalize), {
          submenu: host.submenu ?? false,
          anchored: host.anchor !== undefined,
          ...(host.value === undefined ? {} : { value: host.value }),
          ...(host.label === undefined ? {} : { label: host.label }),
          ...(host.icon == null ? {} : { icon: host.icon }),
          slotted: (name, key) => host.slotted(name, key),
        })
      : undefined,
  }

  // dir 只占属性名、字段改叫 direction：HTMLElement 原生 dir 是 string 访问器，
  // 同名响应式字段会与基类类型打架。属性仍进 observedAttributes，改 dir 照样触发重算。
  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    // 数组只走 property，属性表达不了；给了它条目的文本与禁用即以数据为准
    collection: { attribute: false },
    checkboxValue: { attribute: false },
    defaultCheckboxValue: { attribute: false },
    radioValue: { attribute: false },
    defaultRadioValue: { attribute: false },
    open: { converter: BOOLEAN_CONVERTER },
    defaultOpen: { converter: BOOLEAN_CONVERTER, attribute: 'default-open' },
    // 元素只走 property
    anchor: { attribute: false },
    placement: { converter: STRING_CONVERTER },
    offset: { converter: NUMBER_CONVERTER },
    loop: { converter: BOOLEAN_CONVERTER },
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
    tone: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
    typeahead: { converter: BOOLEAN_CONVERTER },
    disabled: { converter: BOOLEAN_CONVERTER },
    // 文案是对象，只走 property
    translations: { attribute: false },
    submenu: { converter: BOOLEAN_CONVERTER },
    label: { converter: STRING_CONVERTER },
    // 图标记录是对象，只走 property
    icon: { attribute: false },
    value: { converter: STRING_CONVERTER },
    openOnHover: { converter: BOOLEAN_CONVERTER, attribute: 'open-on-hover' },
    hoverOpenDelay: { converter: NUMBER_CONVERTER, attribute: 'hover-open-delay' },
    hoverCloseDelay: { converter: NUMBER_CONVERTER, attribute: 'hover-close-delay' },
    fitAvailableHeight: { converter: BOOLEAN_CONVERTER, attribute: 'fit-available-height' },
  }

  declare collection?: MenuNode[]
  declare checkboxValue?: string[]
  declare defaultCheckboxValue?: string[]
  declare radioValue?: MenuRadioValue
  declare defaultRadioValue?: MenuRadioValue
  declare open?: boolean
  declare defaultOpen?: boolean
  /**
   * 外部锚点：给了就锚在它上面、收起时焦点归还到它，不再取 trigger；用于由别处的按钮受控打开菜单，生成结构时不再铺触发按钮。
   * 展开期间它带 aria-haspopup、aria-expanded、aria-controls，收起或换锚点时还原；点它算层内交互。
   * 没有触发器替菜单命名，名字写在 translations.content 上。只用于根菜单，只作为 property 暴露。
   */
  declare anchor?: HTMLElement | null
  declare placement?: Placement
  declare offset?: number
  declare loop?: boolean
  declare direction?: Direction
  declare tone?: Tone
  declare size?: Size
  declare typeahead?: boolean
  declare disabled?: boolean
  declare translations?: Partial<MenuTranslations>
  declare submenu?: boolean
  declare label?: string
  /** 子菜单形态：触发条目的图标，铺进条目文字之前的 item-icon；按数据铺时由父层的那一条带来。只作为 property 暴露。 */
  declare icon?: IconRecord | null
  declare value?: string
  declare openOnHover?: boolean
  declare hoverOpenDelay?: number
  declare hoverCloseDelay?: number
  /** 内容只按可用高度封顶，不叠 20rem 的固定上限；子菜单没写时跟着所属的菜单或菜单栏（菜单栏的子菜单为真）。 */
  declare fitAvailableHeight?: boolean

  /** 当前 checkbox 选中集合；非受控值从状态机读取。 */
  get currentCheckboxValue(): string[] {
    return this.ctrl.service ? [...connectMenu(this.ctrl.service, wcNormalize).checkboxValue] : []
  }

  /** 当前各 RadioGroup 的选中项；非受控值从状态机读取。 */
  get currentRadioValue(): MenuRadioValue {
    return this.ctrl.service ? { ...connectMenu(this.ctrl.service, wcNormalize).radioValue } : {}
  }

  setCheckboxValue(next: string[]): void {
    if (this.ctrl.service)
      connectMenu(this.ctrl.service, wcNormalize).setCheckboxValue(next)
  }

  setRadioValue(next: MenuRadioValue): void {
    if (this.ctrl.service)
      connectMenu(this.ctrl.service, wcNormalize).setRadioValue(next)
  }

  private readonly idGen: IdGenerator = createCounterIdGenerator()
  private readonly menuScope = createScope(this, this.idGen)
  private readonly positionEngine: PositionEnginePort = createPositionEngine()
  private config: RuntimeConfig | null = null
  /** 直属子菜单触发条目由父机补齐 item 身份；这里只保留 WC 的属性铺设桥。 */
  private readonly submenuBridges = new Map<HTMLElement, MenuSubmenuChild>()
  private parentTriggerOwner: MenuSubmenuOwner | null = null
  private parentTrigger: HTMLElement | null = null
  private parentRegistration: MenuSubmenuRegistration | null = null

  private readonly menuTree = createMenuTreeNode({
    getPositioner: () => this.getPart('positioner'),
    isOpen: () => this.ctrl.service.state.get() === 'open',
    close: () => this.ctrl.service.send({ type: 'CLOSE' }),
    isRoot: () => !this.submenu,
    onRootSelect: details => this.dispatchSelect(details),
  })

  private readonly submenuOwner: MenuSubmenuOwner = {
    tree: this.menuTree,
    registerSubmenu: child => this.registerSubmenu(child),
    fitAvailableHeight: () => this.ctrl.service.prop('fitAvailableHeight'),
  }

  private readonly portal = this.createAnchoredPortalController({
    name: 'Menu',
    config: () => this.config,
    // 视觉环境取自作者树：写了 anchor（哪怕暂时是 null）取宿主自己，否则取 trigger
    source: () => (this.anchor !== undefined ? this : this.getPart('trigger')),
    root: () => this.getPart('positioner'),
    onShellReady: (shell) => {
      // 先公布所有权，再移动：嵌套子菜单重连时沿 Portal 壳找回逻辑父级。
      setMenuSubmenuOwner(shell, this.submenuOwner)
      return () => setMenuSubmenuOwner(shell, null)
    },
    onChange: () => this.requestUpdate(),
  })

  /** 退场闸门：收起从跟着 open 走改成跟着 presence 走，退场动画播完才真收。 */
  private exit: OverlayExit | null = null

  private readonly notifyOpen = (details: MenuOpenChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('open-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyItemSelect = (details: MenuItemSelectDetails): void => {
    this.menuTree.select(details)
  }

  private readonly dispatchSelect = (details: MenuItemSelectDetails): void => {
    this.dispatchEvent(new CustomEvent('item-select', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyCheckboxValue = (details: MenuCheckboxValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('checkbox-value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyRadioValue = (details: MenuRadioValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('radio-value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<MenuSchema>(
    this,
    menuMachine,
    () => this.machineProps(),
    { scope: this.menuScope, onBuilt: svc => this.injectRefs(svc) },
  )

  /** 条目列表的自绘条：与 content 同级挂在已经 fixed 的 positioner 上；浮层里的条子走 4px 档 */
  private readonly bars = new ScrollbarsController(this, {
    shell: () => this.getPart('positioner'),
    scrollable: () => this.getPart('content'),
    props: () => ({ size: 'sm' }),
  })

  /** 条目的禁用声明：connect 每帧把 aria-disabled 写回条目，回读时跳过这些写回值，只认作者写的；没写为 undefined。 */
  private readonly declaredDisabled = createDisabledDeclarations()

  private machineProps(): Partial<MenuSchema['props']> {
    return {
      collection: this.collection,
      checkboxValue: this.checkboxValue,
      defaultCheckboxValue: this.defaultCheckboxValue,
      radioValue: this.radioValue,
      defaultRadioValue: this.defaultRadioValue,
      open: this.open,
      defaultOpen: this.defaultOpen ?? false,
      anchor: this.anchor,
      placement: this.placement,
      offset: this.offset,
      loop: this.loop,
      dir: this.direction,
      tone: this.tone,
      size: this.size,
      typeahead: this.typeahead,
      disabled: this.disabled,
      translations: this.translations,
      submenu: this.submenu,
      openOnHover: this.openOnHover,
      hoverOpenDelay: this.hoverOpenDelay,
      hoverCloseDelay: this.hoverCloseDelay,
      fitAvailableHeight: this.fitAvailableHeight ?? this.parentTriggerOwner?.fitAvailableHeight?.(),
      onOpenChange: this.notifyOpen,
      onItemSelect: this.notifyItemSelect,
      onCheckboxValueChange: this.notifyCheckboxValue,
      onRadioValueChange: this.notifyRadioValue,
    }
  }

  private ensureConfig(): void {
    if (this.config)
      return
    this.config = createRuntimeConfig({ scope: this.menuScope, idGenerator: this.idGen })
  }

  private wireSubmenuChild(child: MenuSubmenuChild): void {
    const api = connectMenu(this.ctrl.service, wcNormalize)
    this.spreader.spread(child.trigger, api.getItemProps({
      value: child.trigger.getAttribute('value') ?? '',
      disabled: child.getDisabled(),
    }))
  }

  private registerSubmenu(child: MenuSubmenuChild): MenuSubmenuRegistration {
    if (this.submenuBridges.has(child.trigger))
      throw new Error('[xh] 同一父菜单的同一子菜单 trigger 只能登记一次')
    const releaseTree = this.menuTree.registerChild(child.tree)
    this.submenuBridges.set(child.trigger, child)
    try {
      this.wireSubmenuChild(child)
    }
    catch (error) {
      this.submenuBridges.delete(child.trigger)
      releaseTree()
      throw error
    }
    this.requestUpdate()
    let active = true
    const assertCurrent = (): void => {
      if (!active || this.submenuBridges.get(child.trigger) !== child)
        throw new Error('[xh] Menu 子菜单逻辑所有权已经释放')
    }
    return {
      sync: () => {
        assertCurrent()
        this.wireSubmenuChild(child)
      },
      dispose: () => {
        if (!active)
          return
        active = false
        releaseTree()
        if (this.submenuBridges.get(child.trigger) !== child)
          return
        this.submenuBridges.delete(child.trigger)
        this.spreader.release(child.trigger)
        this.requestUpdate()
      },
    }
  }

  private syncParentTrigger(trigger: HTMLElement | null): void {
    const owner = this.submenu && trigger ? findMenuSubmenuOwner(this) : null
    if (owner === this.parentTriggerOwner && trigger === this.parentTrigger)
      return
    this.parentRegistration?.dispose()
    this.parentRegistration = null
    this.parentTriggerOwner = owner
    this.parentTrigger = trigger
    // 上一层换了：子机器的 props 里有跟着上一层走的项，重铺一次
    this.requestUpdate()
    if (owner && trigger) {
      this.parentRegistration = owner.registerSubmenu({
        trigger,
        tree: this.menuTree,
        getDisabled: () => this.disabled,
      })
    }
  }

  protected override externalPartRoots(): readonly HTMLElement[] {
    return this.portal.roots
  }

  // 只交注册函数、不在连接期注册：层的入栈出栈跟着展开态走（机器的 trackLayer 效应负责）。
  // 连接期就注册会让层与开合无关地常驻栈里，把同页其它层的 Escape 堵死。
  private readonly registerLayer = (): { layer: Layer, dispose: Cleanup } => {
    this.ensureConfig()
    return this.config!.layerRegistry.register({
      kind: 'popover',
      node: () => this.getPart('content'),
      // trigger 记为本层分支：点它算层内交互，开合交给 trigger 自己切换。
      // 否则同一次点击先被判为层外交互关一次、再被 click 打开一次，菜单等于关不掉。
      // 浮层壳一并记上：条目列表之外还浮着自绘滚动条，按住它拖动不该把菜单消解掉
      branches: () => [this.getPart('trigger'), this.anchor, this.getPart('positioner')].filter(Boolean) as Element[],
      isModal: () => false,
      // 菜单不带遮罩，没有"点它就该关本层"的表面
      surfaces: () => [],
    })
  }

  // onBuilt 在 ctrl 构造期就跑（此刻 this.ctrl 尚未赋值），故 service 由参数传入。
  private injectRefs(svc: Service<MenuSchema>): void {
    this.ensureConfig()
    this.exit ??= createOverlayExit({
      open: (this.open ?? this.defaultOpen) ?? false,
      onExitComplete: () => this.requestUpdate(),
    })
    svc.refs.set('config', this.config)
    svc.refs.set('registerLayer', this.registerLayer)
    svc.refs.set('presence', this.exit.presence)
    svc.refs.set('position', this.positionEngine)
    svc.refs.set('getAnchorEl', () => this.getPart('trigger'))
    svc.refs.set('getFloatingEl', () => this.getPart('positioner'))
    svc.refs.set('getContentEl', () => this.getPart('content'))
    svc.refs.set('getHoverBranches', this.menuTree.getHoverBranches)
  }

  /**
   * 角色节点提前发现一次：default-open 时状态机在 hostConnected 当场进入展开态，
   * 进入时的 entry 同步查询 content 中的条目选择焦点锚点：而常规发现要等首次 updated，
   * 此时 partMap 仍为空，锚点会留空，于是没有条目认领 tabindex=0，键盘无法进入菜单。
   * 定位由 flush 推迟（届时 partMap 已就位），这里只为锚点补上时机。
   */
  override connectedCallback(): void {
    setMenuSubmenuOwner(this, this.submenuOwner)
    this.refreshParts()
    super.connectedCallback()
  }

  /**
   * 承载焦点的条目被移出 DOM 时浏览器不派发 focusout，锚点会停在一个已消失的值上：
   * 没有条目认领 tabindex=0、方向键也失去起点。这里替 DOM 把焦点离场如实上报，
   * 状态机就地按当前活动条目重新选择锚点。
   */
  protected override onPartsReleased(nodes: readonly HTMLElement[]): void {
    const { context, getStatus, send } = this.ctrl.service
    // 宿主断开时机器已停机，此刻无焦点可言（送事件还会在 dev 下抛）
    if (getStatus() !== 'Started')
      return
    const focusedValue = context.get('focusedValue')
    if (focusedValue == null)
      return
    // data-value 只写在 item 上，separator 与 arrow 离场不会误判
    if (nodes.some(el => el.getAttribute(ITEM_VALUE_ATTR) === focusedValue))
      send({ type: 'ITEM.LOST' })
  }

  /** 落在某个角色节点子树里的同名部件。 */
  private partsIn(owner: HTMLElement, name: string): HTMLElement[] {
    return this.getParts(name).filter(el => owner.contains(el))
  }

  protected wire(): void {
    const api = connectMenu(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    // 子菜单形态的触发器是父菜单里的一条 item（双重身份），身份取节点自报的 value
    const triggerEl = this.getPart('trigger')
    this.syncParentTrigger(triggerEl)
    const positionerEl = this.getPart('positioner')
    // 锚点可以是 trigger 也可以是 anchor，两者都缺由 headless 在定位时报诊断；positioner 缺了浮层无处可放
    if (api.open && !positionerEl)
      throw new Error('[xh] 展开的 Menu 必须具备 positioner')
    if (this.submenu && triggerEl) {
      this.spreader.spread(triggerEl, api.getSubmenuTriggerProps({ value: triggerEl.getAttribute('value') ?? '' }))
    }
    else {
      put('trigger', api.getTriggerProps())
    }
    // positioner 的 style 是对象（position/insetInlineStart/insetBlockStart），
    // spreader 见对象 style 会逐条写内联样式，直接 spread 即可。
    put('positioner', api.getPositionerProps())
    put('content', api.getContentProps())
    put('arrow', api.getArrowProps())

    const itemDeclaration = (el: HTMLElement): MenuAnyItemProps => {
      const value = el.getAttribute('value') ?? ''
      const meta = api.collection.find(node => node.value === value)
      const kind = (meta?.kind ?? el.getAttribute('kind') ?? 'item') as MenuAnyItemProps['kind']
      const closeAttr = el.getAttribute('close-on-select')
      const closeOnSelect = meta?.closeOnSelect ?? (closeAttr == null ? undefined : closeAttr !== 'false')
      const disabled = this.collection ? this.declaredDisabled.read(el) : this.declaredDisabled.read(el) ?? false
      if (kind === 'radio') {
        const group = meta?.group ?? el.closest<HTMLElement>('[data-xh-part="group"]')?.getAttribute('value') ?? ''
        return { value, disabled, closeOnSelect, kind, group }
      }
      return { value, disabled, closeOnSelect, kind }
    }

    // 条目是多实例 part，逐个打：身份取作者写的 value，禁用取作者在条目上的声明
    // （集合条目一律 aria-disabled，原生 disabled 不可聚焦、也不派 click）。
    // 打上去的 data-scope/data-part/data-value 正是方向键在事件那一刻查 DOM 的依据，
    // 所以 wire 必须先于事件跑过——updated() 已保证。
    for (const el of this.getParts('item')) {
      const declaration = itemDeclaration(el)
      const props = declaration.kind === 'checkbox'
        ? api.getCheckboxItemProps(declaration)
        : declaration.kind === 'radio'
          ? api.getRadioItemProps(declaration)
          : api.getItemProps(declaration)
      this.spreader.spread(el, props)
      this.declaredDisabled.commit(el)
    }
    for (const child of this.submenuBridges.values())
      this.wireSubmenuChild(child)
    this.parentRegistration?.sync()

    // 条目子部件的身份取所属条目自报的 value，与条目本身同一份声明
    // 子菜单形态的触发条目也是一条：它里面的图标与文字部件归本机器，身份就是这一条
    const ownerItem = (el: HTMLElement): MenuAnyItemProps => {
      const owner = this.getParts('item').find(item => item.contains(el))
      if (owner)
        return itemDeclaration(owner)
      if (triggerEl?.contains(el))
        return { value: this.value ?? triggerEl.getAttribute('value') ?? '', kind: 'item', disabled: this.disabled }
      return { value: '', kind: 'item' }
    }
    for (const el of this.getParts('item-icon'))
      this.spreader.spread(el, api.getItemIconProps(ownerItem(el)))
    for (const el of this.getParts('item-text'))
      this.spreader.spread(el, api.getItemTextProps(ownerItem(el)))
    for (const el of this.getParts('item-indicator'))
      this.spreader.spread(el, api.getItemIndicatorProps(ownerItem(el)))
    for (const el of this.getParts('item-description'))
      this.spreader.spread(el, api.getItemDescriptionProps(ownerItem(el)))
    for (const el of this.getParts('item-shortcut'))
      this.spreader.spread(el, api.getItemShortcutProps(ownerItem(el)))
    for (const el of this.getParts('item-suffix'))
      this.spreader.spread(el, api.getItemSuffixProps(ownerItem(el)))

    // 分隔线也是多实例 part，但不带身份、不入导航，属性对每个都一样
    for (const el of this.getParts('separator'))
      this.spreader.spread(el, api.getSeparatorProps())

    // 分组与它的标题靠同一个 value 互相认领，标题的 id 由 connect 据此派生
    for (const el of this.getParts('group')) {
      const group = { value: el.getAttribute('value') ?? '' }
      const isRadio = el.getAttribute('kind') === 'radio'
        || api.collection.some(node => node.kind === 'radio' && node.group === group.value)
      this.spreader.spread(el, (isRadio ? api.getRadioGroupProps(group) : api.getGroupProps(group)))
      for (const label of this.partsIn(el, 'group-label'))
        this.spreader.spread(label, api.getGroupLabelProps(group))
    }

    // Light DOM content 常驻，WC 自管可见性。读 styles/css/menu.css 的结论：
    // content 是 display:flex，positioner 只声明 position/z-index/pointer-events、没有 display，
    // connect 也不给 positioner 发 hidden——所以只兜 content 这一处。
    // 该文件自己带了 [data-part=content][hidden]{display:none} 压住那条 flex，
    // 但宿主不能指望作者装了这份样式：换别家样式给 content 设 display 就又盖过 UA 的
    // [hidden]{display:none}，只有内联 style.display 压得住。展开时置空串即撤掉内联声明。
    const content = this.getPart('content')
    if (content)
      // 退场动画播完之前先别收：presence 读 content 的 animationName 决定要不要多留一会儿。
      // 必须排在 put('content') 之后——data-state 得先落进 DOM，探测器才读得到退场那支动画
      this.ensureConfig()
    this.exit ??= createOverlayExit({
      open: api.open,
      onExitComplete: () => this.requestUpdate(),
    })
    this.exit.track(content)
    this.exit.update(api.open)
    this.setPartHidden(content, !this.exit.visible)

    this.bars.wire()
    this.portal.sync(this.exit.visible)
  }

  override disconnectedCallback(): void {
    setMenuSubmenuOwner(this, null)
    this.syncParentTrigger(null)
    this.portal.dispose()
    super.disconnectedCallback()
    // 退场没播完就离场：立刻结清并收起，否则作者的节点会带着已被撤掉的 data-state 留在页面上
    this.exit?.dispose()
    this.exit = null
    if (this.ctrl.service.state.get() !== 'open')
      this.setPartHidden(this.getPart('content'), true)
    // 层由展开态的效应自己入栈出栈，断开时机器停机会一并撤掉，这里无需再管
    this.config = null // 重连时 ensureConfig 重建
  }
}
