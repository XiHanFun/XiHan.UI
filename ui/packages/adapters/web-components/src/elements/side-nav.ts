import type { SideNavExpandedChangeDetails, SideNavNode, SideNavNodeProps, SideNavSchema, SideNavTranslations, SideNavValueChangeDetails } from '@xihan-ui/headless'
import type { Cleanup, IdGenerator, Layer, PositionEnginePort, RuntimeConfig } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import { connectSideNav, sideNavAnatomy, sideNavMachine, sideNavMeta } from '@xihan-ui/headless'
import { createCounterIdGenerator, createRuntimeConfig, createScope } from '@xihan-ui/kernel'
import { createPositionEngine } from '@xihan-ui/position'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 三态布尔：缺席=undefined（走缺省）、在场=true、显式写 "false"=false。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/** 分支一系的归属容器；嵌套分支各认最近的那个。 */
const BRANCH_SELECTOR = '[data-xh-part="branch"]'
/** 分组一系的归属容器。 */
const GROUP_SELECTOR = '[data-xh-part="group"]'

/**
 * `<xh-side-nav>` —— Light-DOM 行为宿主：管理后台侧栏导航。
 * 作者写 root/list 与若干 branch / link 角色节点，元素跑 side-nav 机器并把 connect 产出打上去。
 * 节点身份取自节点上的 value 属性；href 与禁用查 `collection` 这份树数据。
 *
 * @customElement xh-side-nav
 * @attr {string} value - 受控选中的叶子；缺省该属性即非受控
 * @attr {string} default-value - 非受控初始选中
 * @attr {boolean} accordion - 同层手风琴：展开一枝收起同层其余，默认 false
 * @attr {boolean} collapsed - 折叠成图标栏（内嵌展开整体收起、文字由皮肤藏掉；顶层分支换装浮层弹出）
 * @attr {boolean} collapsed-popout - 折叠态下顶层分支是否弹出子级面板，默认 true
 * @attr {boolean} disabled - 整个侧栏禁用
 * @attr {boolean} loop - 上下键走到首尾回绕，默认关
 * @attr {'ltr'|'rtl'} dir - 文字方向，只对调左右方向键的展开/收起语义，默认 ltr
 * @fires value-change - 选中变化；detail 为 `{ value: string | null }`
 * @fires expanded-change - 展开集合变化；detail 为 `{ value: string[] }`
 * @csspart root - nav 地标根容器（aria-label 由 translations.root 给）
 * @csspart list - 顶层列表容器
 * @csspart group - role=group 分组，须自带 value 属性
 * @csspart group-label - 分组标题（aria-labelledby 目标）
 * @csspart branch - 分支行容器，须自带 value 属性；它裹着自己的 branch-content
 * @csspart branch-trigger - 展开/收起按钮（aria-expanded / aria-controls）
 * @csspart branch-text - 行文字载体，折叠成图标栏时隐藏
 * @csspart branch-indicator - 展开方向指示符（aria-hidden）
 * @csspart branch-content - 内嵌子层容器，收起时隐藏
 * @csspart link - 去处链接，须自带 value 属性；选中输出 aria-current="page"
 * @csspart link-text - 链接文字载体，折叠成图标栏时隐藏
 */
export class XhSideNavElement extends XhElement {
  static override partContract = { anatomy: sideNavAnatomy, meta: sideNavMeta }

  // dir 只占属性名、字段改叫 direction：同名声明会盖掉 HTMLElement 原生反射。
  static override properties = {
    value: { converter: STRING_CONVERTER },
    defaultValue: { converter: STRING_CONVERTER, attribute: 'default-value' },
    accordion: { converter: BOOLEAN_CONVERTER },
    collapsed: { converter: BOOLEAN_CONVERTER },
    collapsedPopout: { converter: BOOLEAN_CONVERTER, attribute: 'collapsed-popout' },
    disabled: { converter: BOOLEAN_CONVERTER },
    loop: { converter: BOOLEAN_CONVERTER },
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
    // 数组与对象进不了属性，只作为 property 暴露
    collection: { attribute: false },
    expandedValue: { attribute: false },
    defaultExpandedValue: { attribute: false },
    translations: { attribute: false },
  }

  declare value?: string
  declare defaultValue?: string
  declare accordion?: boolean
  declare collapsed?: boolean
  declare collapsedPopout?: boolean
  declare disabled?: boolean
  declare loop?: boolean
  declare direction?: SideNavSchema['props']['dir']
  /** 入口树，href/禁用/层级的唯一事实源，须与标记同源。 */
  declare collection?: SideNavNode[]
  declare expandedValue?: string[]
  declare defaultExpandedValue?: string[]
  declare translations?: Partial<SideNavTranslations>

  private readonly notifyValue = (details: SideNavValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyExpanded = (details: SideNavExpandedChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('expanded-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly idGen: IdGenerator = createCounterIdGenerator()
  private readonly navScope = createScope(null, this.idGen)
  private readonly positionEngine: PositionEnginePort = createPositionEngine()
  private config: RuntimeConfig | null = null

  private readonly ctrl = new MachineController<SideNavSchema>(
    this,
    sideNavMachine,
    () => this.machineProps(),
    { scope: this.navScope, onBuilt: svc => this.injectRefs(svc) },
  )

  private machineProps(): Partial<SideNavSchema['props']> {
    return {
      collection: this.collection,
      value: this.value,
      defaultValue: this.defaultValue,
      expandedValue: this.expandedValue,
      defaultExpandedValue: this.defaultExpandedValue,
      accordion: this.accordion,
      collapsed: this.collapsed,
      collapsedPopout: this.collapsedPopout,
      disabled: this.disabled,
      loop: this.loop,
      dir: this.direction,
      translations: this.translations,
      onValueChange: this.notifyValue,
      onExpandedChange: this.notifyExpanded,
    }
  }

  private ensureConfig(): void {
    if (this.config)
      return
    this.config = createRuntimeConfig({ scope: this.navScope, idGenerator: this.idGen })
  }

  /** 当前弹出分支名下的角色节点：按归属分支的 value 现查。 */
  private findPopoutPart(svc: Service<SideNavSchema>, name: string): HTMLElement | null {
    const v = svc.context.get('popoutValue')
    if (v == null)
      return null
    for (const el of this.getParts(name)) {
      if (this.nodeOf(el, BRANCH_SELECTOR).value === v)
        return el
    }
    return null
  }

  // 只交注册函数、不在连接期注册：层的入栈出栈跟着弹出态走（机器的 trackPopoutLayer 效应负责）
  private readonly registerLayer = (): { layer: Layer, dispose: Cleanup } => {
    this.ensureConfig()
    const svc = this.ctrl.service
    return this.config!.layerRegistry.register({
      kind: 'popover',
      node: () => this.findPopoutPart(svc, 'branch-content'),
      // 触发按钮记为本层分支，点它算层内交互
      branches: () => [this.findPopoutPart(svc, 'branch-trigger')].filter(Boolean) as Element[],
      isModal: () => false,
      setModal: () => {},
      surfaces: () => [],
    })
  }

  // onBuilt 在机器构建那一刻回调，service 由参数传入
  private injectRefs(svc: Service<SideNavSchema>): void {
    this.ensureConfig()
    svc.refs.set('config', this.config)
    svc.refs.set('registerLayer', this.registerLayer)
    svc.refs.set('position', this.positionEngine)
    svc.refs.set('getPopoutAnchorEl', () => this.findPopoutPart(svc, 'branch-trigger'))
    svc.refs.set('getPopoutContentEl', () => this.findPopoutPart(svc, 'branch-content'))
  }

  private nodeOf(el: HTMLElement, selector: string): SideNavNodeProps {
    const owner = el.closest<HTMLElement>(selector)
    const source = owner && owner !== this && this.contains(owner) ? owner : el
    return { value: source.getAttribute('value') ?? '' }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    // 层由弹出态的效应自己入栈出栈，断开时机器停机会一并撤掉，这里无需再管
    this.config = null // 重连时 ensureConfig 重建
  }

  protected wire(): void {
    const api = connectSideNav(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('list', api.getListProps() as Record<string, unknown>)

    // 集合类 part 逐个 spread：身份由节点自报，不依赖下标，节点增删无需记账
    const putAll = (name: string, selector: string, get: (node: SideNavNodeProps) => unknown): void => {
      for (const el of this.getParts(name))
        this.spreader.spread(el, get(this.nodeOf(el, selector)) as Record<string, unknown>)
    }
    putAll('group', GROUP_SELECTOR, node => api.getGroupProps(node))
    putAll('group-label', GROUP_SELECTOR, node => api.getGroupLabelProps(node))
    putAll('branch', BRANCH_SELECTOR, node => api.getBranchProps(node))
    putAll('branch-trigger', BRANCH_SELECTOR, node => api.getBranchTriggerProps(node))
    putAll('branch-indicator', BRANCH_SELECTOR, node => api.getBranchIndicatorProps(node))
    for (const el of this.getParts('branch-text'))
      this.spreader.spread(el, api.getBranchTextProps() as Record<string, unknown>)
    for (const el of this.getParts('link-text'))
      this.spreader.spread(el, api.getLinkTextProps() as Record<string, unknown>)
    putAll('branch-content', BRANCH_SELECTOR, node => api.getBranchContentProps(node))
    putAll('link', '[data-xh-part="link"]', node => api.getLinkProps(node))

    // Light DOM 子层常驻，WC 自管可见性：收起时隐藏 branch-content
    for (const el of this.getParts('branch-content'))
      this.setPartHidden(el, el.hasAttribute('hidden'))
  }
}
