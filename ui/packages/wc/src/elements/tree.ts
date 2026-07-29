import type { Direction } from '@xihan-ui/core'
import type { TreeExpandedChangeDetails, TreeNode, TreeNodeProps, TreeSchema, TreeSelectionChangeDetails, TreeSelectionMode } from '@xihan-ui/headless'
import { ITEM_VALUE_ATTR } from '@xihan-ui/behavior'
import { connectTree, treeMachine } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 三态布尔：缺席=undefined（走缺省）、在场=true、显式写 "false"=false。
// 缺省为真的开关（点行展开、连打检索）只有三态才关得掉——
// Lit 默认的 Boolean 转换器是 v !== null，写 expand-on-click="false" 照样是真。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/** 叶子一系的归属容器。 */
const ITEM_SELECTOR = '[data-xh-part="item"]'
/** 分支一系的归属容器；嵌套分支各认最近的那个。 */
const BRANCH_SELECTOR = '[data-xh-part="branch"]'

/**
 * `<xh-tree>` —— Light-DOM 行为宿主：作者写 root/label/tree 与若干 item / branch 角色节点，
 * 元素跑 tree 机器并把 connect 产出打上去。节点身份取自节点上的 value 属性。
 *
 * 层级（aria-level / aria-posinset / aria-setsize）与禁用都不从 DOM 反推，而是查 `collection`
 * 这份树数据——它是元信息的唯一事实源，作者的标记只管长相，两个适配器也就不会各推各的。
 * 因此 collection 必须与标记同源：标记里有、collection 里没有的节点报不出层级，也进不了导航。
 *
 * 树数据与展开/选中集合都是数组，属性表达不了，只能走 property（`el.collection = [...]`）。
 *
 * @customElement xh-tree
 * @attr {'single'|'multiple'} selection-mode - 选择模式，默认 single
 * @attr {boolean} expand-on-click - 点分支行顺带展开/收起，默认开；写 expand-on-click="false" 关掉
 * @attr {boolean} disabled - 整棵树禁用：所有节点转 aria-disabled，键盘与点击都改不了展开与选中
 * @attr {boolean} loop - 上下键走到首尾回绕，默认关；写 loop="true" 打开
 * @attr {boolean} typeahead - 连打检索，默认开；写 typeahead="false" 关掉
 * @attr {'ltr'|'rtl'} dir - 文字方向，只对调左右方向键的展开/收起语义，默认 ltr
 * @fires expanded-change - 展开集合变化；detail 为 `{ value: string[] }`
 * @fires selection-change - 选中集合变化；detail 为 `{ value: string[] }`
 * @csspart root - 组件根容器
 * @csspart label - 树标题（aria-labelledby 目标）
 * @csspart tree - role=tree 容器，键盘在此收口，也是 roving tabindex 的兜底位
 * @csspart item - role=treeitem 叶子，须自带 value 属性标识身份
 * @csspart item-text - 叶子文本
 * @csspart item-indicator - 叶子选中标记（aria-hidden）
 * @csspart branch - role=treeitem 分支，须自带 value 属性；它裹着自己的 branch-content
 * @csspart branch-control - 分支可点行（选中 + 按 expand-on-click 切换展开）
 * @csspart branch-trigger - 展开箭头（aria-hidden 且不占 Tab 位，只切换展开态）
 * @csspart branch-indicator - 展开方向指示符（aria-hidden）
 * @csspart branch-text - 分支文本
 * @csspart branch-content - role=group 子层容器，收起时隐藏
 */
export class XhTreeElement extends XhElement {
  // dir 只占属性名、字段改叫 direction：HTMLElement 原生 dir 是 string 访问器，
  // 同名声明既与基类类型冲突，也会盖掉原生反射。别名保留原生行为，
  // 同时让 dir 进 observedAttributes——运行期改 dir 才会重跑 wire 换掉按键处理器。
  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    collection: { attribute: false },
    expandedValue: { attribute: false },
    defaultExpandedValue: { attribute: false },
    selectedValue: { attribute: false },
    defaultSelectedValue: { attribute: false },
    selectionMode: { converter: STRING_CONVERTER, attribute: 'selection-mode' },
    expandOnClick: { converter: BOOLEAN_CONVERTER, attribute: 'expand-on-click' },
    disabled: { type: Boolean },
    loop: { converter: BOOLEAN_CONVERTER },
    typeahead: { converter: BOOLEAN_CONVERTER },
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
  }

  declare collection?: TreeNode[]
  declare expandedValue?: string[]
  declare defaultExpandedValue?: string[]
  declare selectedValue?: string[]
  declare defaultSelectedValue?: string[]
  declare selectionMode?: TreeSelectionMode
  declare expandOnClick?: boolean
  declare disabled?: boolean
  declare loop?: boolean
  declare typeahead?: boolean
  declare direction?: Direction

  private readonly notifyExpanded = (details: TreeExpandedChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('expanded-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifySelection = (details: TreeSelectionChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('selection-change', { detail: details, bubbles: true, composed: true }))
  }

  // tree 机器无副作用（连打缓冲住在 refs 里、由机器自己建），
  // 不需要 config/layer/定位引擎，故 controller 只带 props。
  private readonly ctrl = new MachineController<TreeSchema>(this, treeMachine, () => this.machineProps())

  private machineProps(): Partial<TreeSchema['props']> {
    return {
      collection: this.collection,
      expandedValue: this.expandedValue,
      // 机器自己兜 undefined，这里不补 []：props 每次读都新建数组会造成无谓的引用变动
      defaultExpandedValue: this.defaultExpandedValue,
      selectedValue: this.selectedValue,
      defaultSelectedValue: this.defaultSelectedValue,
      selectionMode: this.selectionMode,
      expandOnClick: this.expandOnClick,
      disabled: this.disabled ?? false,
      loop: this.loop,
      typeahead: this.typeahead,
      dir: this.direction,
      onExpandedChange: this.notifyExpanded,
      onSelectionChange: this.notifySelection,
    }
  }

  /**
   * 承载焦点的节点被移出 DOM 时浏览器不派 focusout，焦点锚点会停在一个已消失的值上：
   * 容器判自己"焦点在树内"退出 Tab 序列，又没有节点认领得了这个锚点，
   * 整棵树零个 Tab 停靠点，键盘用户再也进不来。这里替 DOM 把焦点离场如实上报。
   */
  protected override onPartsReleased(nodes: readonly HTMLElement[]): void {
    const { context, getStatus, send } = this.ctrl.service
    // 宿主断开时机器已停机，此刻无焦点可言（送事件还会在 dev 下抛）
    if (getStatus() !== 'Started')
      return
    const focusedValue = context.get('focusedValue')
    if (focusedValue == null)
      return
    // data-value 只写在 item 与 branch 上，行内的文本与标记离场不会误判；
    // 只有走的正是持有锚点的那个节点才报，否则删任一无关节点都会清掉方向键起点
    if (nodes.some(el => el.getAttribute(ITEM_VALUE_ATTR) === focusedValue))
      send({ type: 'TREE.BLUR' })
  }

  /**
   * 取角色节点所属的节点身份：value 写在 item / branch 上，行内的文本、标记、箭头与子层容器
   * 向上找最近的那个（item / branch 自身 closest 命中的就是它自己）。
   * 没有包裹层时退回读节点自身，扁平写法也能用。
   * 越出本宿主的容器不算数——嵌套 xh-tree 的内层节点不会认外层的分支。
   */
  private nodeOf(el: HTMLElement, selector: string): TreeNodeProps {
    const owner = el.closest<HTMLElement>(selector)
    const source = owner && owner !== this && this.contains(owner) ? owner : el
    return { value: source.getAttribute('value') ?? '' }
  }

  protected wire(): void {
    const api = connectTree(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('label', api.getLabelProps() as Record<string, unknown>)
    put('tree', api.getTreeProps() as Record<string, unknown>)

    // 集合类 part 逐个 spread：身份由节点自报，不依赖下标，节点增删无需记账。
    // wire 跑在事件之前（element-base 的 updated），因此按键那一刻 data-scope/data-part/data-value
    // 已经在 DOM 上，连接层查得到本棵树的节点集合。
    const putAll = (name: string, selector: string, get: (node: TreeNodeProps) => unknown): void => {
      for (const el of this.getParts(name))
        this.spreader.spread(el, get(this.nodeOf(el, selector)) as Record<string, unknown>)
    }
    putAll('item', ITEM_SELECTOR, node => api.getItemProps(node))
    putAll('item-text', ITEM_SELECTOR, node => api.getItemTextProps(node))
    putAll('item-indicator', ITEM_SELECTOR, node => api.getItemIndicatorProps(node))
    putAll('branch', BRANCH_SELECTOR, node => api.getBranchProps(node))
    putAll('branch-control', BRANCH_SELECTOR, node => api.getBranchControlProps(node))
    putAll('branch-trigger', BRANCH_SELECTOR, node => api.getBranchTriggerProps(node))
    putAll('branch-indicator', BRANCH_SELECTOR, node => api.getBranchIndicatorProps(node))
    putAll('branch-text', BRANCH_SELECTOR, node => api.getBranchTextProps(node))
    putAll('branch-content', BRANCH_SELECTOR, node => api.getBranchContentProps(node))

    // Light DOM 子层常驻，WC 自管可见性：收起时隐藏 branch-content。
    // connect 已置 hidden，但 styled 给 [data-part=branch-content] 设了 display，
    // 会盖过 UA 的 [hidden]{display:none}；内联 style.display 优先级更高，压得住。
    for (const el of this.getParts('branch-content'))
      this.setPartHidden(el, !api.isExpanded(this.nodeOf(el, BRANCH_SELECTOR).value))
  }
}
