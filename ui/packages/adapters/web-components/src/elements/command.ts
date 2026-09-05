import type { Cleanup, Direction, IdGenerator, Layer, OverlayBackdropVariant, RuntimeConfig, Service, Size } from '@xihan-ui/core'
import type {
  CommandApi,
  CommandGroup,
  CommandGroupMeta,
  CommandInputValueChangeDetails,
  CommandItemProps,
  CommandNode,
  CommandNodeMeta,
  CommandOpenChangeDetails,
  CommandSchema,
  CommandSelectDetails,
} from '@xihan-ui/headless'
import type { OverlayExit } from '../overlay-exit'
import { createCounterIdGenerator, createRuntimeConfig, createScope, isItemDisabled } from '@xihan-ui/core'
import { commandAnatomy, commandMachine, commandMeta, connectCommand } from '@xihan-ui/headless'
import { createDeclaredDisabled } from '../dom/declared-disabled'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { createOverlayExit } from '../overlay-exit'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 三态布尔：缺席=undefined（走缺省）、在场=true、显式写 "false"=false。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-command>` —— Light-DOM 行为宿主：作者写 trigger/backdrop/positioner/content/input/list/item/...
 * 角色节点，元素跑 command 机器并把 connect 产出打上去。
 *
 * 过滤在库这一层做：命令清单经 collection 交进来，检索串一变，不在结果里的条目与整组空掉的分组
 * 由 connect 打上 hidden。作者只管把整份清单铺成节点，不必自己增删。
 *
 * 焦点自始至终在 input 上：条目不可聚焦、也不进 Tab 序列，锚点经 aria-activedescendant 报给读屏。
 *
 * @customElement xh-command
 * @attr {boolean} open - 受控开合；缺省该属性即非受控
 * @attr {boolean} default-open - 非受控初始为展开
 * @attr {string} input-value - 受控检索串；缺省该属性即非受控
 * @attr {string} default-input-value - 非受控初始检索串
 * @attr {boolean} filter - 内置过滤，默认开；写 filter="false" 即由调用方自己筛
 * @attr {boolean} case-sensitive - 过滤区分大小写，默认不区分
 * @attr {boolean} close-on-select - 选中一条命令后收起面板，默认 true
 * @attr {boolean} modal - 模态（陷焦点、锁滚动、遮罩交互外关闭），默认 true
 * @attr {boolean} close-on-escape - Esc 关闭，默认 true
 * @attr {boolean} close-on-interact-outside - 点面板外关闭，默认跟随 modal
 * @attr {boolean} restore-focus - 关闭后把焦点归还触发元素，默认 true
 * @attr {boolean} loop - 方向键走到尽头回绕，默认 true；写 loop="false" 关掉
 * @attr {boolean} loading - 命令还在取：列表报 aria-busy，在途占位顶上来、空态占位让位
 * @attr {string} placeholder - 检索框占位文字
 * @attr {'ltr'|'rtl'} dir - 文字方向；浮层搬到落点后继承不到作者子树上的方向，要 RTL 就显式给
 * @attr {'sm'|'md'|'lg'} size - 尺寸：换面板宽度与条目的几何档位
 * @attr {'opaque'|'blur'|'transparent'} variant - 遮罩形态：只换 backdrop 的底色与模糊
 * @fires open-change - open 状态变化；detail 为 `{ open: boolean, reason?: string }`
 * @fires input-value-change - 检索串变化；detail 为 `{ inputValue: string }`
 * @fires select - 选中一条命令；detail 为 `{ value: string, label: string }`
 * @csspart trigger - 打开面板的按钮，须是原生 button；焦点关闭后归还给它
 * @csspart backdrop - 遮罩层
 * @csspart positioner - 浮层定位容器，由皮肤的 inset 直接摆
 * @csspart content - role=dialog 面板（焦点陷阱所在），收起时带 hidden
 * @csspart input - 检索框，面板里唯一的打字入口，带 role=combobox
 * @csspart list - role=listbox 结果容器
 * @csspart group - role=group 分组容器，须自带 value 属性标识身份；整组被筛空时带 hidden
 * @csspart group-label - 分组标题（本组 aria-labelledby 的目标）
 * @csspart item - role=option 命令，须自带 value 属性标识身份；不在结果里时带 hidden
 * @csspart item-text - 命令文本（选中时回传给宿主的取字处）
 * @csspart empty - 一条都没剩下时的提示；须放在 content 里当 list 的兄弟（列表内只允许 option 与 group）
 * @csspart loading - 在途占位，与空态占位同一个位置，取数期间顶上来
 * @csspart footer - 面板底部提示条，作者放什么由作者定
 */
export class XhCommandElement extends XhElement {
  static override partContract = { anatomy: commandAnatomy, meta: commandMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    // 数组只走 property，属性表达不了
    collection: { attribute: false },
    groups: { attribute: false },
    // 文案对象只走 property
    translations: { attribute: false },
    open: { converter: BOOLEAN_CONVERTER },
    defaultOpen: { type: Boolean, attribute: 'default-open' },
    inputValue: { converter: STRING_CONVERTER, attribute: 'input-value' },
    defaultInputValue: { converter: STRING_CONVERTER, attribute: 'default-input-value' },
    filter: { converter: BOOLEAN_CONVERTER },
    caseSensitive: { type: Boolean, attribute: 'case-sensitive' },
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
  private readonly commandScope = createScope(null, this.idGen)
  private config: RuntimeConfig | null = null
  /** 退场闸门：收起从跟着 open 走改成跟着 presence 走，退场动画播完才真收。 */
  private exit: OverlayExit | null = null

  /** 作者声明的条目禁用，只认首见那一份；给了 collection 时用它，否则现读 */
  private readonly declaredDisabled = createDeclaredDisabled()

  private readonly notifyOpen = (details: CommandOpenChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('open-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyInputValue = (details: CommandInputValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('input-value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifySelect = (details: CommandSelectDetails): void => {
    this.dispatchEvent(new CustomEvent('select', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<CommandSchema>(
    this,
    commandMachine,
    () => this.machineProps(),
    { scope: this.commandScope, onBuilt: svc => this.injectRefs(svc) },
  )

  /**
   * 取数口与命令共用的取法。机器要到进文档（hostConnected）才建，
   * 而这些都是公开面，作者拿到元素随时可能读、可能调——还没进文档时如实给空，不抛错。
   */
  private api(): CommandApi | null {
    const service = this.ctrl.service as Service<CommandSchema> | undefined
    return service ? connectCommand(service, wcNormalize) : null
  }

  /**
   * 面板此刻开着没有（`open` 属性是受控入参，可能缺席；这里是结果）。
   * 机器尚未建起时给 false。
   */
  get expanded(): boolean {
    return this.api()?.open ?? false
  }

  /**
   * 此刻的检索串（`input-value` 属性缺席时非受控的那份住在机器里，只有这里读得到）。
   * 机器尚未建起时给空串。
   */
  get currentInputValue(): string {
    return this.api()?.inputValue ?? ''
  }

  /** 过滤归组之后此刻该显示的命令，空组已经丢掉。机器尚未建起时给空数组。 */
  get groupResults(): readonly CommandGroupMeta[] {
    return this.api()?.groups ?? []
  }

  /** 上面那份分组视图摊平的结果，次序即方向键走的次序。机器尚未建起时给空数组。 */
  get results(): readonly CommandNodeMeta[] {
    return this.api()?.results ?? []
  }

  /** 键盘锚点；收起或一条都没剩下时为 null。 */
  get highlightedValue(): string | null {
    return this.api()?.highlightedValue ?? null
  }

  /** 一条都没剩下。机器尚未建起时给 false。 */
  get isEmpty(): boolean {
    return this.api()?.empty ?? false
  }

  /** 开合面板。受控（写了 `open` 属性）时只发 open-change，开合归宿主写回。机器尚未建起时不动。 */
  setOpen(next: boolean): void {
    this.api()?.setOpen(next)
  }

  /** 改写检索串。受控时语义同 setOpen。机器尚未建起时不动。 */
  setInputValue(next: string): void {
    this.api()?.setInputValue(next)
  }

  /** 直接执行某条命令，等同于在它上面按回车。禁用的那条不认。机器尚未建起时不动。 */
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
      onSelect: this.notifySelect,
    }
  }

  private ensureConfig(): void {
    if (this.config)
      return
    // scrollRoot 交给运行期配置自行探测；面板锁的是页面主滚动层
    this.config = createRuntimeConfig({ scope: this.commandScope, idGenerator: this.idGen })
  }

  // 只交注册函数，层的入栈出栈由机器的 trackOverlay 效应跟着展开态做。
  private readonly registerLayer = (): { layer: Layer, dispose: Cleanup } => {
    this.ensureConfig()
    return this.config!.layerRegistry.register({
      kind: 'modal',
      node: () => this.getPart('content'),
      branches: () => [],
      isModal: () => this.modal ?? true,
      setModal: () => {},
      surfaces: () => [this.getPart('backdrop')].filter(Boolean) as Element[],
    })
  }

  // onBuilt 在 ctrl 构造期就跑，service 由参数传入。
  private injectRefs(svc: Service<CommandSchema>): void {
    this.ensureConfig()
    svc.refs.set('config', this.config)
    svc.refs.set('registerLayer', this.registerLayer)
    svc.refs.set('presence', null)
    svc.refs.set('getContentEl', () => this.getPart('content'))
    svc.refs.set('getListEl', () => this.getPart('list'))
    svc.refs.set('getInputEl', () => this.getPart('input') as HTMLInputElement | null)
  }

  /**
   * 提前发现一次角色节点：default-open 时机器在 hostConnected 当场就要把焦点送进检索框。
   */
  override connectedCallback(): void {
    this.refreshParts()
    super.connectedCallback()
  }

  /** 取 owner 子树内指定名字的角色节点。 */
  private partsIn(owner: HTMLElement, name: string): HTMLElement[] {
    return this.getParts(name).filter(el => owner.contains(el))
  }

  protected wire(): void {
    const api = connectCommand(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('trigger', api.getTriggerProps() as Record<string, unknown>)
    put('backdrop', api.getBackdropProps() as Record<string, unknown>)
    put('positioner', api.getPositionerProps() as Record<string, unknown>)
    put('content', api.getContentProps() as Record<string, unknown>)
    put('input', api.getInputProps() as Record<string, unknown>)
    put('list', api.getListProps() as Record<string, unknown>)
    put('empty', api.getEmptyProps() as Record<string, unknown>)
    put('loading', api.getLoadingProps() as Record<string, unknown>)
    put('footer', api.getFooterProps() as Record<string, unknown>)

    for (const el of this.getParts('group')) {
      const group = { value: el.getAttribute('value') ?? '' }
      this.spreader.spread(el, api.getGroupProps(group) as Record<string, unknown>)
      for (const label of this.partsIn(el, 'group-label'))
        this.spreader.spread(label, api.getGroupLabelProps(group) as Record<string, unknown>)
    }

    // 条目逐个打：身份取作者写的 value，禁用取部件自报的 aria-disabled。
    // wire 跑在事件之前，按键时 data-scope/data-part/data-value 已在 DOM 上供指针交互现查
    for (const el of this.getParts('item')) {
      const item: CommandItemProps = {
        value: el.getAttribute('value') ?? '',
        disabled: this.collection ? this.declaredDisabled(el) : isItemDisabled(el),
      }
      this.spreader.spread(el, api.getItemProps(item) as Record<string, unknown>)
      for (const text of this.partsIn(el, 'item-text'))
        this.spreader.spread(text, api.getItemTextProps(item) as Record<string, unknown>)
    }

    // 节点常驻，用内联 display 收起（作者层的 display 声明会盖过 [hidden]）。
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
    const visible = this.exit.visible

    // 收起用内联 display，优先级高于样式表对 [hidden] 的覆盖
    this.setPartHidden(this.getPart('backdrop'), !visible)
    this.setPartHidden(this.getPart('positioner'), !visible)
    // positioner 不是必需部件，content 自己也要收起
    this.setPartHidden(this.getPart('content'), !visible)
  }

  override disconnectedCallback(): void {
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
