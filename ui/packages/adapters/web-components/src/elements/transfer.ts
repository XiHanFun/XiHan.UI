import type { Direction, Size, Tone } from '@xihan-ui/core'
import type {
  TransferFilter,
  TransferItem,
  TransferSchema,
  TransferSelectionChangeDetails,
  TransferSide,
  TransferTranslations,
  TransferValueChangeDetails,
} from '@xihan-ui/headless'
import { ITEM_VALUE_ATTR } from '@xihan-ui/core'
import { connectTransfer, transferAnatomy, transferFocusKey, transferMachine, transferMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 三态布尔：缺席=undefined（走缺省）、在场=true、显式写 "false"=false。
// 缺省为真的开关（方向键回绕）只有三态才关得掉——
// Lit 默认的 Boolean 转换器是 v !== null，写 loop="false" 照样是真。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

const SIDES: readonly TransferSide[] = ['source', 'target']

/**
 * 读条目节点上作者写的原生 disabled，顺手摘掉。
 *
 * 集合条目的禁用一律由 aria-disabled 表达（禁用声明的事实源是 collection，不是标记）：
 * 原生禁用的节点不可聚焦、也收不到 click，「禁用项仍是方向键起点、仍挡得住点击」
 * 这两条在原生 disabled 下根本无从成立。摘掉之后禁用态由 connect 写回的 aria-disabled 承接。
 */
function stripNativeDisabled(el: HTMLElement): void {
  if (el.hasAttribute('disabled'))
    el.removeAttribute('disabled')
}

/**
 * `<xh-transfer>` —— Light-DOM 行为宿主：作者写
 * root/source-panel/target-panel/panel-header/panel-title/panel-count/search/list/item/...
 * 角色节点，元素跑 transfer 机器并把 connect 产出打上去。
 *
 * 条目全集由 `collection` 属性（property）给出，它是标签与禁用的唯一事实源；
 * **两侧面板各挂一份全集**，不属于本侧、或被搜索筛掉的那一份由元素打上 hidden，
 * 节点不卸载。条目身份取节点上的 `value` 属性，归哪一侧则取它落在哪个面板里。
 *
 * 过滤由本元素做，不是作者做：搜索串住在机器里，作者最多给一个 `filter` 谓词。
 *
 * 导航与勾选在事件那一刻按 data-scope+data-part 查活 DOM，依赖 connect 回写的 data-value，
 * 因此 wire 必须先于交互跑过（基类 updated 已保证）。
 *
 * 集合类输入（collection / value / selection / filter）都表达不成属性，只能走 property：
 * `el.collection = [...]`、`el.value = ['a']`。
 *
 * @customElement xh-transfer
 * @attr {string} name - 原生表单字段名，目标侧每个值提交一个同名字段
 * @attr {string} form - 原生表单 ID，显式指定时覆盖祖先表单归属
 * @attr {boolean} searchable - 每侧带一个搜索框；关掉时搜索框仍在 DOM 里但带 hidden
 * @attr {boolean} disabled - 整个控件禁用：条目转 aria-disabled，按钮与搜索框用原生 disabled
 * @attr {boolean} read-only - 只读：两侧照常浏览与搜索，但勾选改不动、也搬不动
 * @attr {boolean} invalid - 校验失败标注
 * @attr {boolean} loading - 条目还在取：两侧列表报 aria-busy，在途占位顶上来、空态占位让位
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @attr {boolean} one-way - 只能往右不能往回：往回搬那条路封死，右侧也不再接受勾选
 * @attr {boolean} loop - 列表内方向键走到尽头回绕，默认 true；写 loop="false" 关掉
 * @attr {'ltr'|'rtl'} dir - 文字方向，决定列表内哪个横向方向键是"搬向对面"，默认 ltr
 * @fires value-change - 落在右侧的值变化；detail 为 `{ value: string[] }`
 * @fires selection-change - 勾选集合变化；detail 为 `{ value: string[] }`
 * @csspart root - 组件根容器（承载 data-disabled/data-one-way）
 * @csspart hidden-input - 宿主自动装配的重复字段出口，无需作者手写
 * @csspart source-panel - 左侧面板容器，其内的角色节点一律归左侧
 * @csspart target-panel - 右侧面板容器，其内的角色节点一律归右侧
 * @csspart panel-header - 面板头部容器（标题、计数、全选格的落脚处）
 * @csspart panel-title - 面板标题（本侧 list 与搜索框 aria-labelledby 的目标）
 * @csspart panel-count - 计数节点，只带 data-count / data-checked-count，文案由作者写
 * @csspart search - 本侧搜索框，须是原生 input；searchable 关掉时带 hidden
 * @csspart list - role=listbox 容器，键盘在此收口，也是 roving tabindex 的兜底位
 * @csspart empty - 空态占位，须放在面板里当 list 的兄弟；本侧没有可见条目时由元素放它出面
 * @csspart loading - 在途占位，与空态占位同一个位置，取数期间顶上来
 * @csspart group - role=group 分组容器，须自带 value 属性标识身份；条目挂在它里面，两侧各挂一份
 * @csspart group-label - 分组标题（本组 aria-labelledby 的目标），须放在 group 里
 * @csspart item - role=option 条目，须自带 value 属性标识身份；禁用写在 collection 里，不写在节点上
 * @csspart item-text - 条目文本
 * @csspart item-checkbox - 条目勾选标记（aria-hidden）；oneWay 下右侧的那一份带 hidden
 * @csspart select-all-trigger - 本侧全选格，须是原生 button；三态经 aria-checked 上报
 * @csspart to-target-trigger - 往右搬的按钮，须是原生 button；可及名字由 translations.toTarget 给
 * @csspart to-source-trigger - 往左搬的按钮，须是原生 button；oneWay 下恒为禁用；可及名字由 translations.toSource 给
 */
export class XhTransferElement extends XhElement {
  static override partContract = { anatomy: transferAnatomy, meta: transferMeta }

  // dir 只占属性名、字段改叫 direction：HTMLElement 原生 dir 是 string 访问器，
  // 同名声明既与基类类型冲突，也会盖掉原生反射。
  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    collection: { attribute: false },
    value: { attribute: false },
    defaultValue: { attribute: false },
    name: { converter: STRING_CONVERTER },
    form: { converter: STRING_CONVERTER },
    selection: { attribute: false },
    defaultSelection: { attribute: false },
    filter: { attribute: false },
    searchable: { type: Boolean },
    disabled: { type: Boolean },
    readOnly: { converter: BOOLEAN_CONVERTER, attribute: 'read-only' },
    invalid: { converter: BOOLEAN_CONVERTER },
    loading: { converter: BOOLEAN_CONVERTER },
    tone: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
    oneWay: { type: Boolean, attribute: 'one-way' },
    loop: { converter: BOOLEAN_CONVERTER },
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
    // 文案是对象，只走 property
    translations: { attribute: false },
  }

  declare collection?: TransferItem[]
  declare value?: string[]
  declare defaultValue?: string[]
  declare name?: string
  declare form?: string
  declare selection?: string[]
  declare defaultSelection?: string[]
  declare filter?: TransferFilter
  declare searchable?: boolean
  declare disabled?: boolean
  declare readOnly?: boolean
  declare invalid?: boolean
  declare loading?: boolean
  declare tone?: Tone
  declare size?: Size
  declare oneWay?: boolean
  declare loop?: boolean
  declare direction?: Direction
  declare translations?: Partial<TransferTranslations>

  private readonly formInputs: HTMLInputElement[] = []

  override disconnectedCallback(): void {
    for (const input of this.formInputs) {
      this.spreader.release(input)
      input.remove()
    }
    this.formInputs.length = 0
    super.disconnectedCallback()
  }

  private readonly notifyValue = (details: TransferValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifySelection = (details: TransferSelectionChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('selection-change', { detail: details, bubbles: true, composed: true }))
  }

  // transfer 机器无副作用、无 refs（两侧集合全部从 collection + value + 搜索串推导），
  // 不需要 config / 定位引擎，故 controller 只带 props。
  private readonly ctrl = new MachineController<TransferSchema>(this, transferMachine, () => this.machineProps())

  private machineProps(): Partial<TransferSchema['props']> {
    return {
      collection: this.collection,
      value: this.value,
      defaultValue: this.defaultValue,
      name: this.name,
      form: this.form,
      selection: this.selection,
      defaultSelection: this.defaultSelection,
      filter: this.filter,
      searchable: this.searchable ?? false,
      disabled: this.disabled ?? false,
      readOnly: this.readOnly,
      invalid: this.invalid,
      loading: this.loading,
      tone: this.tone,
      size: this.size,
      oneWay: this.oneWay ?? false,
      loop: this.loop,
      dir: this.direction,
      translations: this.translations,
      onValueChange: this.notifyValue,
      onSelectionChange: this.notifySelection,
    }
  }

  /**
   * 承载焦点的条目被移出 DOM 时浏览器不派 focusout，焦点锚点会停在一个已消失的值上：
   * 列表容器判自己"焦点在组内"退出 Tab 序列，又没有条目认领得了这个锚点，
   * 这一侧零个 Tab 停靠点，键盘用户再也进不来。这里替 DOM 把焦点离场如实上报。
   */
  protected override onPartsReleased(nodes: readonly HTMLElement[]): void {
    const { context, getStatus, send } = this.ctrl.service
    // 宿主断开时机器已停机，此刻无焦点可言（送事件还会在 dev 下抛）
    if (getStatus() !== 'Started')
      return
    for (const side of SIDES) {
      const focused = context.get(transferFocusKey(side))
      if (focused == null)
        continue
      // data-value 只写在 item 上，条目内的文本与勾选标记离场不会误判；
      // 再比一次 data-side，另一侧那份同值节点离场才不会把本侧的锚点清掉
      const gone = nodes.some(el =>
        el.getAttribute(ITEM_VALUE_ATTR) === focused && el.getAttribute('data-side') === side)
      if (gone)
        send({ type: 'LIST.BLUR', side })
    }
  }

  // 面板内的子部件：getParts 收的是整个元素范围，按子树过滤才归得对
  // （两侧共用同一套 part 名，不过滤就会把对面那份也算进来）。
  private partsIn(owner: HTMLElement, name: string): HTMLElement[] {
    return this.getParts(name).filter(el => owner.contains(el))
  }

  /**
   * 某一侧此刻看得见的条目（先分侧、再套本侧的搜索串），顺序恒为 collection 原序。
   * 作者据它自己渲染列表（分组、只渲可视区那一段都走这条）。机器尚未建起时给空数组。
   */
  visibleItems(side: TransferSide): readonly TransferItem[] {
    return this.ctrl.service ? connectTransfer(this.ctrl.service, wcNormalize).visibleItems(side) : []
  }

  protected wire(): void {
    const api = connectTransfer(this.ctrl.service, wcNormalize)

    // 原生出口由宿主管理，零值不产生空字符串字段；不带 data-xh-part 以免重复接管。
    while (this.formInputs.length > api.value.length) {
      const input = this.formInputs.pop()!
      this.spreader.release(input)
      input.remove()
    }
    for (let index = 0; index < api.value.length; index++) {
      const input = this.formInputs[index] ?? this.ownerDocument.createElement('input')
      this.formInputs[index] = input
      this.spreader.spread(input, api.getHiddenInputProps({ value: api.value[index]! }) as Record<string, unknown>)
      if (input.parentElement !== this)
        this.append(input)
    }

    const put = (el: HTMLElement | null, props: Record<string, unknown>): void => {
      if (el)
        this.spreader.spread(el, props)
    }
    put(this.getPart('root'), api.getRootProps() as Record<string, unknown>)
    put(this.getPart('to-target-trigger'), api.getToTargetTriggerProps() as Record<string, unknown>)
    put(this.getPart('to-source-trigger'), api.getToSourceTriggerProps() as Record<string, unknown>)

    for (const side of SIDES) {
      const panel = this.getPart(`${side}-panel`)
      if (!panel)
        continue
      const props = { side }
      this.spreader.spread(panel, api.getPanelProps(props) as Record<string, unknown>)
      for (const el of this.partsIn(panel, 'panel-header'))
        this.spreader.spread(el, api.getPanelHeaderProps(props) as Record<string, unknown>)
      for (const el of this.partsIn(panel, 'panel-title'))
        this.spreader.spread(el, api.getPanelTitleProps(props) as Record<string, unknown>)
      for (const el of this.partsIn(panel, 'panel-count'))
        this.spreader.spread(el, api.getPanelCountProps(props) as Record<string, unknown>)
      for (const el of this.partsIn(panel, 'select-all-trigger'))
        this.spreader.spread(el, api.getSelectAllTriggerProps(props) as Record<string, unknown>)

      // Light DOM 常驻，WC 自管可见性：作者层若给这些 part 声明了 display，
      // 会盖过 UA 的 [hidden]{display:none}，光靠 hidden 属性收不起来。
      // 收不收起的判据一律取 connect 的产出，不在这里重算一遍——重算就会分叉。
      for (const el of this.partsIn(panel, 'search')) {
        const search = api.getSearchProps(props) as Record<string, unknown>
        this.spreader.spread(el, search)
        this.setPartHidden(el, search.hidden === true)
      }

      for (const el of this.partsIn(panel, 'list'))
        this.spreader.spread(el, api.getListProps(props) as Record<string, unknown>)

      for (const el of this.partsIn(panel, 'empty')) {
        const empty = api.getEmptyProps(props) as Record<string, unknown>
        this.spreader.spread(el, empty)
        this.setPartHidden(el, empty.hidden === true)
      }

      for (const el of this.partsIn(panel, 'loading')) {
        const pending = api.getLoadingProps(props) as Record<string, unknown>
        this.spreader.spread(el, pending)
        this.setPartHidden(el, pending.hidden === true)
      }

      // 分组是多实例 part：身份取自己的 value 属性加上所在面板的 side，组内标题跟着同一份身份
      for (const el of this.partsIn(panel, 'group')) {
        const group = { value: el.getAttribute('value') ?? '', side }
        this.spreader.spread(el, api.getGroupProps(group) as Record<string, unknown>)
        for (const label of this.partsIn(el, 'group-label'))
          this.spreader.spread(label, api.getGroupLabelProps(group) as Record<string, unknown>)
      }

      // 条目是多实例 part，逐个打：身份取作者写的 value，归属取它落在哪个面板里
      for (const el of this.partsIn(panel, 'item')) {
        stripNativeDisabled(el)
        const item = { value: el.getAttribute('value') ?? '', side }
        const itemProps = api.getItemProps(item) as Record<string, unknown>
        this.spreader.spread(el, itemProps)
        this.setPartHidden(el, itemProps.hidden === true)
        // 条目内的文本与勾选标记跟着同一份声明走，样式层各处状态一致
        for (const text of this.partsIn(el, 'item-text'))
          this.spreader.spread(text, api.getItemTextProps(item) as Record<string, unknown>)
        for (const box of this.partsIn(el, 'item-checkbox')) {
          const boxProps = api.getItemCheckboxProps(item) as Record<string, unknown>
          this.spreader.spread(box, boxProps)
          this.setPartHidden(box, boxProps.hidden === true)
        }
      }
    }
  }
}
