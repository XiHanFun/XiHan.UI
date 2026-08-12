import type { SideNavExpandedChangeDetails, SideNavNode, SideNavNodeProps, SideNavSchema, SideNavTranslations, SideNavValueChangeDetails } from '@xihan-ui/headless'
import { connectSideNav, sideNavAnatomy, sideNavMachine, sideNavMeta } from '@xihan-ui/headless'
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
 * @attr {boolean} collapsed - 折叠成图标栏（内嵌展开整体收起、文字由皮肤藏掉）
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
 * @csspart branch-indicator - 展开方向指示符（aria-hidden）
 * @csspart branch-content - 内嵌子层容器，收起时隐藏
 * @csspart link - 去处链接，须自带 value 属性；选中输出 aria-current="page"
 */
export class XhSideNavElement extends XhElement {
  static override partContract = { anatomy: sideNavAnatomy, meta: sideNavMeta }

  // dir 只占属性名、字段改叫 direction：同名声明会盖掉 HTMLElement 原生反射。
  static override properties = {
    value: { converter: STRING_CONVERTER },
    defaultValue: { converter: STRING_CONVERTER, attribute: 'default-value' },
    accordion: { converter: BOOLEAN_CONVERTER },
    collapsed: { converter: BOOLEAN_CONVERTER },
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

  private readonly ctrl = new MachineController<SideNavSchema>(this, sideNavMachine, () => this.machineProps())

  private machineProps(): Partial<SideNavSchema['props']> {
    return {
      collection: this.collection,
      value: this.value,
      defaultValue: this.defaultValue,
      expandedValue: this.expandedValue,
      defaultExpandedValue: this.defaultExpandedValue,
      accordion: this.accordion,
      collapsed: this.collapsed,
      disabled: this.disabled,
      loop: this.loop,
      dir: this.direction,
      translations: this.translations,
      onValueChange: this.notifyValue,
      onExpandedChange: this.notifyExpanded,
    }
  }

  private nodeOf(el: HTMLElement, selector: string): SideNavNodeProps {
    const owner = el.closest<HTMLElement>(selector)
    const source = owner && owner !== this && this.contains(owner) ? owner : el
    return { value: source.getAttribute('value') ?? '' }
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
    putAll('branch-content', BRANCH_SELECTOR, node => api.getBranchContentProps(node))
    putAll('link', '[data-xh-part="link"]', node => api.getLinkProps(node))

    // Light DOM 子层常驻，WC 自管可见性：收起时隐藏 branch-content
    for (const el of this.getParts('branch-content'))
      this.setPartHidden(el, el.hasAttribute('hidden'))
  }
}
