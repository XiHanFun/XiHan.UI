import type { ListboxItemProps, ListboxNode, ListboxSchema, ListboxSelectionMode, ListboxValueChangeDetails } from '@xihan-ui/headless'
import type { Direction, Orientation } from '@xihan-ui/kernel'
import { isItemDisabled, ITEM_VALUE_ATTR } from '@xihan-ui/behavior'
import { connectListbox, listboxAnatomy, listboxMachine, listboxMeta } from '@xihan-ui/headless'
import { createDeclaredDisabled } from '../dom/declared-disabled'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
// （value 尤其：落成 null 就分不出"非受控"与"受控且当前无选中"）。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 三态布尔：缺席=undefined（走缺省）、在场=true、显式写 "false"=false。
// 缺省为真的开关（方向键回绕、连打检索）只有三态才关得掉——
// Lit 默认的 Boolean 转换器是 v !== null，写 loop="false" 照样是真。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-listbox>` —— Light-DOM 行为宿主：作者写 root/label/content 与若干 item 角色节点，
 * 元素跑 listbox 机器并把 connect 产出打上去。条目身份取自条目节点上的 value 属性，
 * 禁用由条目自报 aria-disabled（集合条目一律如此，原生 disabled 不可聚焦、也不派 click）。
 * 分组同样用 value 属性声明身份，分组标题的 id 由它派生。
 *
 * 导航与选中在事件那一刻按 data-scope+data-part 查活 DOM，依赖 connect 回写的 data-value，
 * 因此 wire 必须先于交互跑过（基类 updated 已保证）。
 *
 * 选中值是集合：单选可以直接写 value="apple" 属性，多选只能走 property（`el.value = ['a','b']`），
 * 属性表达不了数组。
 *
 * 条目的禁用也可以交给数据：`el.collection = [{ value, label, disabled }]`，此时条目部件只需自报 value。
 *
 * @customElement xh-listbox
 * @attr {string} value - 受控选中值（单选简写）；缺省该属性即非受控，多选请用 property
 * @attr {string} default-value - 非受控初始选中值
 * @attr {'single'|'multiple'|'extended'} selection-mode - 选择模式，默认 single
 * @attr {boolean} disabled - 整列禁用：条目全转 aria-disabled，键盘与点击都改不了选中值
 * @attr {boolean} loop - 方向键走到尽头回绕，默认 true；写 loop="false" 关掉
 * @attr {'ltr'|'rtl'} dir - 文字方向，只改写左右方向键语义，默认 ltr
 * @attr {'horizontal'|'vertical'} orientation - 方向键轴向，默认 vertical
 * @attr {boolean} typeahead - 连打检索，默认开；写 typeahead="false" 关掉
 * @fires value-change - 选中集合变化；detail 为 `{ value: string[] }`
 * @csspart root - 组件根容器（承载 data-orientation/data-disabled）
 * @csspart label - 列表标题（aria-labelledby 目标）
 * @csspart content - role=listbox 容器，键盘在此收口，也是 roving tabindex 的兜底位
 * @csspart item - role=option 条目，须自带 value 属性标识身份；禁用写 aria-disabled="true"
 * @csspart item-text - 条目文本（连打检索的取字处）
 * @csspart item-indicator - 条目选中标记（aria-hidden）
 * @csspart item-group - role=group 分组容器，须自带 value 属性标识身份
 * @csspart item-group-label - 分组标题（本组 aria-labelledby 的目标）
 */
export class XhListboxElement extends XhElement {
  static override partContract = { anatomy: listboxAnatomy, meta: listboxMeta }

  // dir 只占属性名、字段改叫 direction：HTMLElement 原生 dir 是 string 访问器，
  // 同名声明既与基类类型冲突，也会盖掉原生反射。别名保留原生行为，
  // 同时让 dir 进 observedAttributes——运行期改 dir 才会重跑 wire 换掉按键处理器。
  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    // 数组只走 property，属性表达不了；给了它条目的禁用即以数据为准
    collection: { attribute: false },
    value: { converter: STRING_CONVERTER },
    defaultValue: { converter: STRING_CONVERTER, attribute: 'default-value' },
    selectionMode: { converter: STRING_CONVERTER, attribute: 'selection-mode' },
    disabled: { type: Boolean },
    loop: { converter: BOOLEAN_CONVERTER },
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
    orientation: { converter: STRING_CONVERTER },
    typeahead: { converter: BOOLEAN_CONVERTER },
  }

  declare collection?: ListboxNode[]
  declare value?: string | string[]
  declare defaultValue?: string | string[]
  declare selectionMode?: ListboxSelectionMode
  declare disabled?: boolean
  declare loop?: boolean
  declare direction?: Direction
  declare orientation?: Orientation
  declare typeahead?: boolean

  // 整列禁用期间的条目自身声明快照。connect 每帧都把 aria-disabled 写回条目，整列禁用更是写满每一个，
  // 此时回读分不清「作者声明的」还是「自己上一帧写的」，解禁后条目就永远解不开。
  private readonly declaredDisabled = new WeakMap<HTMLElement, boolean>()
  /** 上一帧是否整列禁用：解禁当帧 DOM 上还留着机器写回的 aria-disabled，读不得。 */
  private wasListDisabled = false

  private readonly notify = (details: ListboxValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  // listbox 机器无副作用（连打缓冲住在 refs 里、由机器自己建），
  // 不需要 config/layer/定位引擎，故 controller 只带 props。
  private readonly ctrl = new MachineController<ListboxSchema>(this, listboxMachine, () => this.machineProps())

  private machineProps(): Partial<ListboxSchema['props']> {
    return {
      collection: this.collection,
      value: this.value,
      defaultValue: this.defaultValue,
      selectionMode: this.selectionMode,
      disabled: this.disabled ?? false,
      loop: this.loop,
      dir: this.direction,
      orientation: this.orientation,
      typeahead: this.typeahead,
      onValueChange: this.notify,
    }
  }

  /**
   * 承载焦点的条目被移出 DOM 时浏览器不派 focusout，焦点锚点会停在一个已消失的值上：
   * 容器判自己"焦点在列表内"退出 Tab 序列，又没有条目认领得了这个锚点，
   * 整组零个 Tab 停靠点，键盘用户再也进不来。这里替 DOM 把焦点离场如实上报。
   */
  protected override onPartsReleased(nodes: readonly HTMLElement[]): void {
    const { context, getStatus, send } = this.ctrl.service
    // 宿主断开时机器已停机，此刻无焦点可言（送事件还会在 dev 下抛）
    if (getStatus() !== 'Started')
      return
    const focusedValue = context.get('focusedValue')
    if (focusedValue == null)
      return
    // data-value 只写在 item 上，条目内的文本与标记离场不会误判；
    // 只有走的正是持有锚点的那个条目才报，否则删任一无关条目都会清掉方向键起点
    if (nodes.some(el => el.getAttribute(ITEM_VALUE_ATTR) === focusedValue))
      send({ type: 'LIST.BLUR' })
  }

  /** 作者声明的条目禁用，只认首见那一份；没写即 undefined，交给 collection 定夺 */
  private readonly declaredItemDisabled = createDeclaredDisabled()

  private itemProps(el: HTMLElement): ListboxItemProps {
    const value = el.getAttribute('value') ?? ''
    // 给了 collection 就以数据为事实源：现读会读到 connect 上一帧写回的 aria-disabled，
    // 「作者没写」表达不出 undefined，数据里的禁用就永远轮不到生效。
    if (this.collection)
      return { value, disabled: this.declaredItemDisabled(el) }
    const listDisabled = !!this.disabled
    // 只有「本帧与上一帧都没整列禁用」时，节点上的 aria-disabled 才等于作者声明：
    // 整列禁用那几帧 connect 把每个条目都写成了 true，解禁当帧 DOM 上还留着这些写回值，
    // 此刻现读会把机器自己的产物误当声明、条目再也解不开。
    // 头一回见到这个条目时，DOM 上还只有作者写的东西（本帧的写回尚未发生），
    // 此刻无论整列禁没禁用都记得下真声明。少了这一条，「挂载那刻就整列禁用」
    // 会一路没有快照，解禁时退回现读、读到机器自己写的 true，整列就此永久锁死。
    if (!this.declaredDisabled.has(el)) {
      const own = isItemDisabled(el)
      this.declaredDisabled.set(el, own)
      return { value, disabled: own }
    }
    if (!listDisabled && !this.wasListDisabled) {
      const own = isItemDisabled(el)
      this.declaredDisabled.set(el, own)
      return { value, disabled: own }
    }
    return { value, disabled: this.declaredDisabled.get(el)! }
  }

  // 条目/分组内的子部件：getParts 收的是整个元素范围，按子树过滤才归得对。
  private partsIn(owner: HTMLElement, name: string): HTMLElement[] {
    return this.getParts(name).filter(el => owner.contains(el))
  }

  protected wire(): void {
    const api = connectListbox(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('label', api.getLabelProps() as Record<string, unknown>)
    put('content', api.getContentProps() as Record<string, unknown>)

    for (const el of this.getParts('item-group')) {
      const group = { value: el.getAttribute('value') ?? '' }
      this.spreader.spread(el, api.getItemGroupProps(group) as Record<string, unknown>)
      for (const label of this.partsIn(el, 'item-group-label'))
        this.spreader.spread(label, api.getItemGroupLabelProps(group) as Record<string, unknown>)
    }

    // 条目是多实例 part，逐个打：身份取作者写的 value，禁用取部件自报的 aria-disabled
    for (const el of this.getParts('item')) {
      const item = this.itemProps(el)
      this.spreader.spread(el, api.getItemProps(item) as Record<string, unknown>)
      // 条目内的文本与选中标记跟着同一份声明走，样式层各处状态一致
      for (const text of this.partsIn(el, 'item-text'))
        this.spreader.spread(text, api.getItemTextProps(item) as Record<string, unknown>)
      for (const indicator of this.partsIn(el, 'item-indicator'))
        this.spreader.spread(indicator, api.getItemIndicatorProps(item) as Record<string, unknown>)
    }

    // 本帧的写回已落地，下一帧才知道 DOM 上的 aria-disabled 可不可信
    this.wasListDisabled = !!this.disabled
  }
}
