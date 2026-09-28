/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 toolbar 相关实现。

import type { Cleanup, ControlVariant, Direction, IdGenerator, Layer, Orientation, RuntimeConfig, Service, Size } from '@xihan-ui/core'
import type { MenuAnyItemProps, MenuApi, MenuSchema, ToolbarItemProps, ToolbarSchema, ToolbarTranslations } from '@xihan-ui/headless'
import type { OverlayExit } from '../overlay-exit'
import { createCounterIdGenerator, createRuntimeConfig, createScope, isItemDisabled, ITEM_VALUE_ATTR } from '@xihan-ui/core'
import { connectMenu, connectToolbar, menuMachine, toolbarAnatomy, toolbarMachine, toolbarMeta, toolbarOverflowMenuProps } from '@xihan-ui/headless'
import { createPositionEngine } from '@xihan-ui/position'
import { mergeAsChildProps } from '../dom/as-child'
import { wcNormalize } from '../dom/normalize'
import { createOverlayExit } from '../overlay-exit'
import { MachineController } from '../runtime/machine-controller'
import { XhPortalHostElement } from '../runtime/portal-host'
import { ScrollbarsController } from '../runtime/scrollbars-controller'

// 字符串属性统一走这个转换器：属性缺席即 undefined，缺省值的唯一事实源留在 connect。
// Lit 默认转换器会在属性被移除时把值落成 null，那样就再也表达不了"未指定"。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }

// 布尔三态：缺席 = undefined（用 connect 的默认值），="false" = false，其余 = true。
// Lit 自带的 Boolean 转换器是 v !== null，缺省为真的 loop 会因此永远关不掉。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/** 「更多」菜单里的一条：条目节点、勾选项的标记位与文字载体。 */
interface OverflowEntry {
  item: HTMLElement
  indicator: HTMLElement | null
  text: HTMLElement
  /** 这一条之前的分隔线；没有时为 null。 */
  separator: HTMLElement | null
}

/** 「更多」菜单那一套节点。作者只写 overflow-trigger，这些由元素自己建。 */
interface OverflowMenuNodes {
  positioner: HTMLElement
  content: HTMLElement
  /** 按条目值索引：收纳变了只补差额，不整套重建。 */
  entries: Map<string, OverflowEntry>
}

/**
 * `<xh-toolbar>`：Light-DOM 行为宿主：作者写 root、若干 item，可选的 group、separator 与
 * 行尾的 overflow-trigger，元素运行 toolbar 状态机并把 connect 产出接上。
 *
 * 工具条只负责三件事：整条一个 Tab 位的方向键导航，role=toolbar / role=group /
 * role=separator 这套 ARIA，以及放不下时把条目按次序收进「更多」菜单。条目自身是按钮、
 * 切换按钮还是下拉触发器，各自的角色、按下态与点击行为一律归条目自身：元素不覆盖条目的 role，
 * 也不接管条目的 click。条目身份取写在条目上的 value 属性；禁用由条目声明 aria-disabled
 * （集合条目一律如此，原生 disabled 不可聚焦、无法作为方向键的起点）。
 * 位于 form 中的按钮式条目需自行写 type="button"，否则回车会直接提交表单。
 *
 * 「更多」菜单的定位层、列表与条目由元素自己建（与每页条数下拉、自绘滚动条同一条路）：
 * 作者只在 root 末尾写一颗 overflow-trigger。建出来的节点归 menu 的 scope，不写 data-xh-part。
 *
 * 导航在事件发生时按 data-scope + data-part 查询 DOM，依赖 connect 回写的 data-value，
 * 因此 wire 必须先于交互运行（基类 updated 已保证）。
 *
 * @customElement xh-toolbar
 * @attr {'horizontal'|'vertical'} orientation - 主轴，默认 horizontal；横向接管左右键、纵向接管上下键，另一轴放行给页面
 * @attr {'ltr'|'rtl'} dir - 文字方向，只改写水平主轴上左右方向键的语义，默认 ltr
 * @attr {boolean} loop - 方向键到达末尾回绕，默认开启；写 loop="false" 关闭
 * @attr {boolean} disabled - 整条禁用：条目全部为 aria-disabled，方向键不再接管，「更多」菜单打不开
 * @attr {'outline'|'subtle'|'ghost'} variant - 形态：ghost 只组织控件不画面，outline 为附着式工具面，subtle 为淡底；默认 ghost
 * @attr {'sm'|'md'|'lg'} size - 尺寸：只影响条目间距与整条内边距，条目自身的大小归条目
 * @csspart root - role=toolbar 的容器（键盘在此收口，也是 roving tabindex 的兜底位）
 * @csspart group - role=group 的小分组，放置一组相关控件
 * @csspart item - 工具条条目，须自带 value 属性标识身份；禁用写 aria-disabled="true"
 * @csspart separator - role=separator 分隔线，朝向恒与主轴垂直
 * @csspart overflow-trigger - 行尾的「更多」钮，写一个空 `<button>` 放在 root 末尾即可；放不下的条目收进它弹出的菜单，全部放得下时收着
 */
export class XhToolbarElement extends XhPortalHostElement {
  /** 本实例的 Portal 容器；显式解析失败不回退配置默认。 */
  declare portalContainer?: () => Element | null

  static override partContract = { anatomy: toolbarAnatomy, meta: toolbarMeta }

  // dir 占属性名、字段改叫 direction：HTMLElement 原生 dir 是 string 访问器，
  // 同名声明既与基类类型冲突，也会盖掉原生反射。别名保留原生行为，
  // 同时让 dir 进 observedAttributes——运行期改 dir 才会重跑 wire 换掉按键处理器。
  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    orientation: { converter: STRING_CONVERTER },
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
    loop: { converter: BOOLEAN_CONVERTER },
    disabled: { converter: BOOLEAN_CONVERTER },
    variant: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
    // 文案是对象，走不了属性；只作为 property 暴露，与 Vue 侧的 translations prop 对齐
    translations: { attribute: false },
  }

  declare orientation?: Orientation
  declare direction?: Direction
  declare loop?: boolean
  declare disabled?: boolean
  declare variant?: ControlVariant
  declare size?: Size
  declare translations?: Partial<ToolbarTranslations>

  // 整条禁用期间的条目自身声明快照。connect 每帧都把 aria-disabled 写回条目，整条禁用更是写满每一个，
  // 此时回读分不清「作者声明的」还是「自己上一帧写的」，解禁后条目就永远解不开。
  private readonly declaredDisabled = new WeakMap<HTMLElement, boolean>()
  /** 上一帧是否整条禁用：解禁当帧 DOM 上仍保留着状态机写回的 aria-disabled，不可读取。 */
  private wasToolbarDisabled = false

  private readonly idGen: IdGenerator = createCounterIdGenerator()
  /** 「更多」菜单的 id 由它派生：触发器与列表靠 aria-controls / aria-labelledby 互相认领。 */
  private readonly menuScope = createScope(this, this.idGen)
  private config: RuntimeConfig | null = null

  private readonly ctrl = new MachineController<ToolbarSchema>(this, toolbarMachine, () => this.machineProps(), {
    // 收纳量测在机器的挂载效应里跑，root 的取值口要赶在那之前交出去
    onBuilt: svc => svc.refs.set('getRootEl', () => this.getPart('root')),
  })

  /** 「更多」菜单：一台 menu 机器，props 从工具条的机器现读，故必须排在 ctrl 之后建。 */
  private readonly menuCtrl = new MachineController<MenuSchema>(
    this,
    menuMachine,
    () => toolbarOverflowMenuProps(this.ctrl.service as Service<ToolbarSchema>),
    { scope: this.menuScope, onBuilt: svc => this.injectMenuRefs(svc) },
  )

  /** 「更多」菜单那一套节点；overflow-trigger 缺席时不建。 */
  private menuNodes: OverflowMenuNodes | null = null
  /** 退场闸门：收起从跟着展开态走改成跟着 presence 走，退场动画播完才真收。 */
  private menuExit: OverlayExit | null = null
  private readonly menuPortal = this.createAnchoredPortalController({
    name: 'Toolbar overflow menu',
    config: () => this.config,
    source: () => this.getPart('overflow-trigger'),
    root: () => this.menuNodes?.positioner ?? null,
    onChange: () => this.requestUpdate(),
  })

  /** 条目列表的自绘条：与 content 同级挂在已经 fixed 的 positioner 上；浮层里的条子走 4px 档 */
  private readonly bars = new ScrollbarsController(this, {
    shell: () => this.menuNodes?.positioner ?? null,
    scrollable: () => this.menuNodes?.content ?? null,
    props: () => ({ size: 'sm' }),
  })

  private machineProps(): Partial<ToolbarSchema['props']> {
    return {
      orientation: this.orientation,
      dir: this.direction,
      // 布尔一律原样透传：属性不在即 undefined，把缺省交回 connect（loop 默认开、disabled 默认关）
      loop: this.loop,
      disabled: this.disabled,
      variant: this.variant,
      size: this.size,
      translations: this.translations,
    }
  }

  private ensureConfig(): void {
    if (this.config)
      return
    this.config = createRuntimeConfig({ scope: this.menuScope, idGenerator: this.idGen })
  }

  private ensureMenuExit(open: boolean): OverlayExit {
    this.ensureConfig()
    this.menuExit ??= createOverlayExit({
      open,
      onExitComplete: () => this.requestUpdate(),
    })
    return this.menuExit
  }

  // 只交注册函数、不在连接期注册：层的入栈出栈跟着展开态走（机器的 trackLayer 效应负责）。
  // 连接期就注册会让层与开合无关地常驻栈里，把同页其它层的 Escape 堵死。
  private readonly registerMenuLayer = (): { layer: Layer, dispose: Cleanup } => {
    this.ensureConfig()
    return this.config!.layerRegistry.register({
      kind: 'popover',
      node: () => this.menuNodes?.content ?? null,
      // 「更多」钮记为本层分支：点它算层内交互，开合交给它自己切换；
      // 浮层壳一并记上：条目列表之外还浮着自绘滚动条，按住它拖动不该把菜单消解掉
      branches: () => [this.getPart('overflow-trigger'), this.menuNodes?.positioner].filter(Boolean) as Element[],
      isModal: () => false,
      surfaces: () => [],
    })
  }

  // onBuilt 在 ctrl 构造期就跑（此刻 this.menuCtrl 尚未赋值），故 service 由参数传入。
  // 每次(重)建机器后都要重注：refs 属于机器实例，重连时的新机器不会继承旧的。
  private injectMenuRefs(svc: Service<MenuSchema>): void {
    this.ensureConfig()
    svc.refs.set('config', this.config)
    svc.refs.set('registerLayer', this.registerMenuLayer)
    svc.refs.set('presence', this.ensureMenuExit(svc.state.get() === 'open').presence)
    svc.refs.set('position', createPositionEngine())
    svc.refs.set('getAnchorEl', () => this.getPart('overflow-trigger'))
    svc.refs.set('getFloatingEl', () => this.menuNodes?.positioner ?? null)
    svc.refs.set('getContentEl', () => this.menuNodes?.content ?? null)
  }

  /**
   * 承载焦点的条目被移出 DOM 时浏览器不派 focusout，焦点锚点会停在一个已消失的值上：
   * 容器判自己"焦点在条内"退出 Tab 序列，又没有条目认领得了这个锚点，
   * 整条零个 Tab 停靠点，键盘用户再也进不来。这里替 DOM 把焦点离场如实上报。
   */
  protected override onPartsReleased(nodes: readonly HTMLElement[]): void {
    const { context, getStatus, send } = this.ctrl.service
    // 宿主断开时机器已停机，此刻无焦点可言（送事件还会在 dev 下抛）
    if (getStatus() !== 'Started')
      return
    // 拿着锚点的「更多」钮走了，同样没人认领 Tab 位
    if (context.get('overflowTriggerFocused') && nodes.some(el => el.getAttribute('data-part') === 'overflow-trigger')) {
      send({ type: 'TOOLBAR.BLUR' })
      return
    }
    const focusedValue = context.get('focusedValue')
    if (focusedValue == null)
      return
    // data-value 只写在 item 上，分组与分隔线离场不会误判；
    // 只有走的正是持有锚点的那个条目才报，否则删任一无关条目都会清掉方向键起点
    if (nodes.some(el => el.getAttribute(ITEM_VALUE_ATTR) === focusedValue))
      send({ type: 'TOOLBAR.BLUR' })
  }

  private itemProps(el: HTMLElement): ToolbarItemProps {
    const value = el.getAttribute('value') ?? ''
    // 只有「本帧与上一帧都没整条禁用」时，节点上的 aria-disabled 才等于作者声明：
    // 整条禁用那几帧 connect 把每个条目都写成了 true，解禁当帧 DOM 上还留着这些写回值，
    // 此刻现读会把机器自己的产物误当声明、条目再也解不开。
    // 头一回见到这个条目时，DOM 上还只有作者写的东西（本帧的写回尚未发生），
    // 此刻无论整条禁没禁用都记得下真声明。少了这一条，「挂载那刻就整条禁用」
    // 会一路没有快照，解禁时退回现读、读到机器自己写的 true，整条就此永久锁死。
    if (!this.declaredDisabled.has(el)) {
      const own = isItemDisabled(el)
      this.declaredDisabled.set(el, own)
      return { value, disabled: own }
    }
    if (!this.disabled && !this.wasToolbarDisabled) {
      const own = isItemDisabled(el)
      this.declaredDisabled.set(el, own)
      return { value, disabled: own }
    }
    // 整条禁用那几帧（以及解禁当帧）DOM 上留着机器的写回值，只认快照
    return { value, disabled: this.declaredDisabled.get(el)! }
  }

  protected wire(): void {
    const api = connectToolbar(this.ctrl.service, wcNormalize)

    const root = this.getPart('root')
    if (root)
      this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)

    // 分组与分隔线都是多实例 part，且属性与身份无关，逐个打同一份产出即可
    for (const el of this.getParts('group'))
      this.spreader.spread(el, api.getGroupProps() as Record<string, unknown>)
    for (const el of this.getParts('separator'))
      this.spreader.spread(el, api.getSeparatorProps() as Record<string, unknown>)

    // 条目逐个打：身份取作者写的 value，禁用取部件自报的 aria-disabled。
    // 打上去的 data-scope/data-part/data-value 正是方向键在事件那一刻查 DOM 的依据，
    // 所以 wire 必须先于事件跑过——updated() 已保证。
    for (const el of this.getParts('item'))
      this.spreader.spread(el, api.getItemProps(this.itemProps(el)) as Record<string, unknown>)

    // 本帧的写回已落地，下一帧才知道 DOM 上的 aria-disabled 可不可信
    this.wasToolbarDisabled = !!this.disabled

    this.wireOverflowMenu(api.getOverflowTriggerProps() as Record<string, unknown>)
  }

  /**
   * 「更多」钮与它弹出的菜单。钮是作者写的工具条部件，菜单的开合接线按 asChild 的规则合进它的属性
   * （菜单的解剖标记让位、工具条的处理器先跑），与 Vue / React 落到节点上的一模一样；
   * 菜单的定位层、列表与条目由元素自己建。
   */
  private wireOverflowMenu(triggerProps: Record<string, unknown>): void {
    const trigger = this.getPart('overflow-trigger')
    if (!trigger) {
      this.releaseMenuNodes()
      return
    }
    const menu = connectMenu(this.menuCtrl.service as Service<MenuSchema>, wcNormalize)
    this.spreader.spread(trigger, mergeAsChildProps(menu.getTriggerProps() as Record<string, unknown>, triggerProps))

    const nodes = this.ensureMenuNodes()
    this.spreader.spread(nodes.positioner, menu.getPositionerProps() as Record<string, unknown>)
    this.spreader.spread(nodes.content, menu.getContentProps() as Record<string, unknown>)
    this.wireMenuEntries(menu, nodes)

    // Light DOM 的 content 常驻，可见性由宿主自管：皮肤给 content 设了 display，会盖过 UA 的
    // [hidden]{display:none}。必须排在 content 的属性之后——data-state 得先落进 DOM，探测器才读得到退场那支动画
    const exit = this.ensureMenuExit(menu.open)
    exit.track(nodes.content)
    exit.update(menu.open)
    // 直接写而不走 setPartHidden：那条路是为作者写的角色节点留的，要护住作者自己的内联
    // display；这层是元素建的，没有作者的那一份
    nodes.content.style.display = exit.visible ? '' : 'none'

    this.bars.wire()
    this.menuPortal.sync(exit.visible)
  }

  /** 定位层与列表：建一次，挂在宿主里 root 之后；展开时由 Portal 搬到落点。 */
  private ensureMenuNodes(): OverflowMenuNodes {
    const current = this.menuNodes
    if (current?.positioner.isConnected)
      return current
    if (current)
      this.releaseMenuNodes()
    const doc = this.ownerDocument
    const positioner = doc.createElement('div')
    const content = doc.createElement('div')
    positioner.append(content)
    // 定位层是 fixed，坐标由引擎给，摆在哪一层都不影响落位；放在 root 外，不进工具条的排布与收纳量测
    this.append(positioner)
    this.menuNodes = { positioner, content, entries: new Map() }
    return this.menuNodes
  }

  /** 按菜单的条目元信息铺条目：已有的复用、缺的新建、多的移除，次序与收纳一致。 */
  private wireMenuEntries(menu: MenuApi, nodes: OverflowMenuNodes): void {
    const doc = this.ownerDocument
    const alive = new Set<string>()
    let cursor: ChildNode | null = nodes.content.firstChild
    const place = (node: HTMLElement): void => {
      if (node === cursor)
        cursor = node.nextSibling
      else
        nodes.content.insertBefore(node, cursor)
    }
    menu.collection.forEach((meta, index) => {
      alive.add(meta.value)
      let entry = nodes.entries.get(meta.value)
      const wantsIndicator = meta.kind !== 'item'
      if (!entry || (entry.indicator != null) !== wantsIndicator) {
        if (entry)
          this.removeEntry(entry)
        const item = doc.createElement('div')
        const indicator = wantsIndicator ? doc.createElement('span') : null
        const text = doc.createElement('span')
        if (indicator)
          item.append(indicator)
        item.append(text)
        entry = { item, indicator, text, separator: null }
        nodes.entries.set(meta.value, entry)
      }
      // 首条上的分隔线标记不产出分隔线：菜单开头不留一道空隔
      const wantsSeparator = index > 0 && meta.separatorBefore
      if (wantsSeparator && !entry.separator)
        entry.separator = doc.createElement('div')
      if (!wantsSeparator && entry.separator) {
        this.spreader.release(entry.separator)
        entry.separator.remove()
        entry.separator = null
      }
      if (entry.separator) {
        this.spreader.spread(entry.separator, menu.getSeparatorProps() as Record<string, unknown>)
        place(entry.separator)
      }
      // 禁用与选完收起都由 collection 定案，条目只报身份
      const declaration: MenuAnyItemProps = meta.kind === 'checkbox'
        ? { value: meta.value, kind: 'checkbox' }
        : { value: meta.value, kind: 'item' }
      const itemProps = declaration.kind === 'checkbox' ? menu.getCheckboxItemProps(declaration) : menu.getItemProps(declaration)
      this.spreader.spread(entry.item, itemProps as Record<string, unknown>)
      if (entry.indicator)
        this.spreader.spread(entry.indicator, menu.getItemIndicatorProps(declaration) as Record<string, unknown>)
      this.spreader.spread(entry.text, menu.getItemTextProps(declaration) as Record<string, unknown>)
      if (entry.text.textContent !== meta.label)
        entry.text.textContent = meta.label
      place(entry.item)
    })
    for (const [value, entry] of nodes.entries) {
      if (alive.has(value))
        continue
      // 焦点正在这一条上：它一走，菜单得就地另挑锚点，否则整张菜单没有 Tab 停靠点
      const svc = this.menuCtrl.service as Service<MenuSchema>
      if (svc.getStatus() === 'Started' && svc.context.get('focusedValue') === value)
        svc.send({ type: 'ITEM.LOST' })
      this.removeEntry(entry)
      nodes.entries.delete(value)
    }
  }

  private removeEntry(entry: OverflowEntry): void {
    for (const node of [entry.separator, entry.item, entry.indicator, entry.text]) {
      if (node)
        this.spreader.release(node)
    }
    entry.separator?.remove()
    entry.item.remove()
  }

  private releaseMenuNodes(): void {
    const nodes = this.menuNodes
    if (!nodes)
      return
    this.menuPortal.dispose()
    for (const entry of nodes.entries.values())
      this.removeEntry(entry)
    this.spreader.release(nodes.positioner)
    this.spreader.release(nodes.content)
    nodes.positioner.remove()
    this.menuNodes = null
  }

  override disconnectedCallback(): void {
    this.menuPortal.dispose()
    super.disconnectedCallback()
    // 退场没播完就离场：立刻结清并收起
    this.menuExit?.dispose()
    this.menuExit = null
    this.releaseMenuNodes()
    // 层由展开态的效应自己入栈出栈，断开时机器停机会一并撤掉，这里无需再管
    this.config = null // 重连时 ensureConfig 重建
  }
}
