import type { MenubarItemProps, MenubarNode, MenubarSchema, MenubarSelectDetails, MenubarValueChangeDetails } from '@xihan-ui/headless'
import type { Cleanup, Direction, IdGenerator, Layer, Orientation, Placement, PositionEnginePort, RuntimeConfig } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import { isItemDisabled, ITEM_VALUE_ATTR } from '@xihan-ui/behavior'
import { connectMenubar, menubarAnatomy, menubarMachine, menubarMeta } from '@xihan-ui/headless'
import { createCounterIdGenerator, createRuntimeConfig, createScope } from '@xihan-ui/kernel'
import { createPositionEngine } from '@xihan-ui/position'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : Number(v)) }
// 三态布尔：缺席=undefined（走缺省）、在场=true、显式写 "false"=false。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/** 读角色节点的禁用声明，并摘掉作者写的原生 disabled，禁用态归一到 aria-disabled。 */
function authorDisabled(el: HTMLElement): boolean {
  const disabled = isItemDisabled(el)
  if (el.hasAttribute('disabled'))
    el.removeAttribute('disabled')
  return disabled
}

/**
 * `<xh-menubar>` —— Light-DOM 行为宿主：作者写
 * root/trigger/positioner/content/item/item-text/item-indicator/separator/group/group-label 角色节点，
 * 元素跑 menubar 机器并把 connect 产出打上去。
 *
 * 一排菜单同时只展开一张：已展开时指针掠过别的 trigger 直接切过去，未展开时掠过不响应。
 * 整条菜单栏只有一个 Tab 位（roving tabindex），进来之后靠方向键在 trigger 之间走。
 *
 * 标签由作者写：trigger 必须是 `<button>`。
 * trigger / positioner / content 三者靠各自的 value 属性配对，同一项写同一个值。
 *
 * @customElement xh-menubar
 * @attr {string} value - 受控展开项；缺省该属性即非受控
 * @attr {string} default-value - 非受控的初始展开项
 * @attr {'horizontal'|'vertical'} orientation - 菜单栏排布轴，默认 horizontal；决定方向键在 trigger 之间走哪一对键
 * @attr {boolean} loop - 方向键走到尽头回绕，默认 true；写 loop="false" 关掉
 * @attr {'ltr'|'rtl'} dir - 文字方向，只影响水平轴上 ArrowLeft/ArrowRight 的前后语义
 * @attr {boolean} disabled - 整条菜单栏禁用
 * @attr {boolean} typeahead - 菜单内的连打检索，默认开；写 typeahead="false" 关掉
 * @attr {string} placement - 首选放置位，默认 bottom-start；避让后的实际位写在 data-placement 上
 * @attr {number} offset - 浮层与锚点的间距（px）
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @fires value-change - 展开项变化；detail 为 `{ value: string | null }`
 * @fires select - 条目被选中（菜单随之收起）；detail 为 `{ menu: string, value: string }`
 * @csspart root - role=menubar 容器，承载 roving tabindex 的兜底 Tab 位与焦点离场
 * @csspart trigger - role=menuitem 的展开按钮，须自带 value 属性标识身份；禁用写 aria-disabled="true"
 * @csspart positioner - 浮层定位容器，须自带 value 与同项 trigger 配对；坐标由引擎写成内联样式
 * @csspart content - role=menu 容器，须自带 value 与同项 trigger 配对；收起时带 hidden
 * @csspart item - role=menuitem 条目，须自带 value 属性；禁用写 aria-disabled="true"
 * @csspart item-text - 条目文本（连打检索取的就是它），对读屏透明
 * @csspart item-indicator - 条目标记位（勾选符号/图标/快捷键提示），aria-hidden
 * @csspart separator - 分隔线（role=separator，不入方向键导航）
 * @csspart group - 一组条目（role=group），须自带 value 属性
 * @csspart group-label - 分组标题，靠 id 被同组 group 的 aria-labelledby 指着
 */
export class XhMenubarElement extends XhElement {
  static override partContract = { anatomy: menubarAnatomy, meta: menubarMeta }

  // dir 只占属性名、字段改叫 direction，避开 HTMLElement 原生 dir 访问器。
  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    // 数组只走 property，属性表达不了；给了它入口与条目的文本与禁用即以数据为准
    collection: { attribute: false },
    value: { converter: STRING_CONVERTER },
    defaultValue: { converter: STRING_CONVERTER, attribute: 'default-value' },
    orientation: { converter: STRING_CONVERTER },
    loop: { converter: BOOLEAN_CONVERTER },
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
    disabled: { converter: BOOLEAN_CONVERTER },
    typeahead: { converter: BOOLEAN_CONVERTER },
    placement: { converter: STRING_CONVERTER },
    offset: { converter: NUMBER_CONVERTER },
    tone: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
  }

  declare collection?: MenubarNode[]
  declare value?: string
  declare defaultValue?: string
  declare orientation?: Orientation
  declare loop?: boolean
  declare direction?: Direction
  declare disabled?: boolean
  declare typeahead?: boolean
  declare placement?: Placement
  declare offset?: number
  declare tone?: string
  declare size?: string

  private readonly idGen: IdGenerator = createCounterIdGenerator()
  // trigger 与 content 按 value 逐对互指的 id 由 scope 派生
  private readonly barScope = createScope(null, this.idGen)
  private readonly positionEngine: PositionEnginePort = createPositionEngine()
  private config: RuntimeConfig | null = null

  private readonly notifyValue = (details: MenubarValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifySelect = (details: MenubarSelectDetails): void => {
    this.dispatchEvent(new CustomEvent('select', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<MenubarSchema>(
    this,
    menubarMachine,
    () => this.machineProps(),
    { scope: this.barScope, onBuilt: svc => this.injectRefs(svc) },
  )

  private machineProps(): Partial<MenubarSchema['props']> {
    return {
      collection: this.collection,
      value: this.value,
      defaultValue: this.defaultValue,
      orientation: this.orientation,
      // 布尔缺席即 undefined，缺省交回 connect
      loop: this.loop,
      dir: this.direction,
      disabled: this.disabled,
      typeahead: this.typeahead,
      placement: this.placement,
      offset: this.offset,
      tone: this.tone,
      size: this.size,
      onValueChange: this.notifyValue,
      onSelect: this.notifySelect,
    }
  }

  /** 按作者写的 value 取某一项的角色节点。 */
  private partFor(name: string, value: string | null): HTMLElement | null {
    if (value == null)
      return null
    return this.getParts(name).find(el => el.getAttribute('value') === value) ?? null
  }

  private openValue(): string | null {
    return this.ctrl.service.context.get('value') ?? null
  }

  private ensureConfig(): void {
    if (this.config)
      return
    this.config = createRuntimeConfig({ scope: this.barScope, idGenerator: this.idGen })
  }

  // 只交注册函数、不在连接期注册：层的入栈出栈跟着展开态走（机器的 trackLayer 效应负责）。
  private readonly registerLayer = (): { layer: Layer, dispose: Cleanup } => {
    this.ensureConfig()
    return this.config!.layerRegistry.register({
      kind: 'popover',
      node: () => this.partFor('content', this.openValue()),
      // 整条菜单栏记为本层分支：点 trigger、在 trigger 之间走、掠过换菜单都算层内交互，
      // 开合归菜单栏自己切换。
      branches: () => [this.getPart('root')].filter(Boolean) as Element[],
      isModal: () => false,
      setModal: () => {},
      // 菜单不带遮罩，无可点关闭的表面
      surfaces: () => [],
    })
  }

  // onBuilt 在 ctrl 构造期就跑，service 由参数传入。
  private injectRefs(svc: Service<MenubarSchema>): void {
    this.ensureConfig()
    svc.refs.set('config', this.config)
    svc.refs.set('registerLayer', this.registerLayer)
    svc.refs.set('position', this.positionEngine)
    svc.refs.set('getAnchorEl', () => this.partFor('trigger', this.openValue()))
    svc.refs.set('getFloatingEl', () => this.partFor('positioner', this.openValue()))
    svc.refs.set('getContentEl', () => this.partFor('content', this.openValue()))
    svc.refs.set('getRootEl', () => this.getPart('root'))
  }

  /** 提前发现一次角色节点：default-value 时机器在 hostConnected 当场要去 content 里挑焦点锚点。 */
  override connectedCallback(): void {
    this.refreshParts()
    super.connectedCallback()
  }

  /** 承载焦点的条目被移出 DOM 时上报 ITEM.LOST，让机器按当前数据重挑焦点锚点。 */
  protected override onPartsReleased(nodes: readonly HTMLElement[]): void {
    const { context, getStatus, send } = this.ctrl.service
    // 机器已停机则跳过
    if (getStatus() !== 'Started')
      return
    const focusedItem = context.get('focusedItem')
    if (focusedItem == null)
      return
    // 只认 item，trigger 与 content 也带 data-value
    if (nodes.some(el => el.dataset.xhPart === 'item' && el.getAttribute(ITEM_VALUE_ATTR) === focusedItem))
      send({ type: 'ITEM.LOST' })
  }

  // 取 owner 子树内指定名字的角色节点。
  private partsIn(owner: HTMLElement, name: string): HTMLElement[] {
    return this.getParts(name).filter(el => owner.contains(el))
  }

  protected wire(): void {
    const api = connectMenubar(this.ctrl.service, wcNormalize)

    const root = this.getPart('root')
    if (root)
      this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)

    // trigger 逐个打：身份取作者写的 value，禁用经 authorDisabled 归一到 aria-disabled。
    // wire 跑在事件之前，按键时 data-scope/data-part/data-value 已在 DOM 上供方向键现查。
    for (const el of this.getParts('trigger')) {
      const props = api.getTriggerProps({
        value: el.getAttribute('value') ?? '',
        disabled: authorDisabled(el),
      })
      this.spreader.spread(el, props as Record<string, unknown>)
    }

    // positioner 的 style 是对象，spreader 会逐条写成内联样式
    for (const el of this.getParts('positioner'))
      this.spreader.spread(el, api.getPositionerProps({ value: el.getAttribute('value') ?? '' }) as Record<string, unknown>)

    // 菜单常挂，按本帧产出的 hidden 用内联 display 收起
    for (const el of this.getParts('content')) {
      const props = api.getContentProps({ value: el.getAttribute('value') ?? '' }) as Record<string, unknown>
      this.spreader.spread(el, props)
      this.setPartHidden(el, props.hidden === true)
    }

    for (const el of this.getParts('group')) {
      const group = { value: el.getAttribute('value') ?? '' }
      this.spreader.spread(el, api.getGroupProps(group) as Record<string, unknown>)
      for (const label of this.partsIn(el, 'group-label'))
        this.spreader.spread(label, api.getGroupLabelProps(group) as Record<string, unknown>)
    }

    for (const el of this.getParts('item')) {
      const item: MenubarItemProps = {
        value: el.getAttribute('value') ?? '',
        disabled: authorDisabled(el),
      }
      this.spreader.spread(el, api.getItemProps(item) as Record<string, unknown>)
      // 条目内的文本与标记位跟着同一份声明走
      for (const text of this.partsIn(el, 'item-text'))
        this.spreader.spread(text, api.getItemTextProps(item) as Record<string, unknown>)
      for (const indicator of this.partsIn(el, 'item-indicator'))
        this.spreader.spread(indicator, api.getItemIndicatorProps(item) as Record<string, unknown>)
    }

    // 分隔线不带身份，属性对每个都一样
    for (const el of this.getParts('separator'))
      this.spreader.spread(el, api.getSeparatorProps() as Record<string, unknown>)
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    // 层随机器停机一并撤掉，此处不再管
    this.config = null // 重连时 ensureConfig 重建
  }
}
