import type { Direction, Orientation, Service, Size, Tone } from '@xihan-ui/core'
import type { TagGroupApi, TagGroupItemDeleteDetails, TagGroupItemProps, TagGroupNode, TagGroupSchema, TagGroupSelectionMode, TagGroupTranslations, TagGroupValueChangeDetails, TagVariant } from '@xihan-ui/headless'
import { isItemDisabled, ITEM_VALUE_ATTR } from '@xihan-ui/core'
import { connectTagGroup, tagGroupAnatomy, tagGroupMachine, tagGroupMeta } from '@xihan-ui/headless'
import { createDeclaredDisabled } from '../dom/declared-disabled'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定
// （value 尤其：落成 null 就分不出「非受控」与「受控且当前无选中」）。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 三态布尔：缺席=undefined（走缺省）、在场=true、显式写 "false"=false。
// 缺省为真的开关（方向键回绕、连打检索）只有三态才关得掉
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-tag-group>` —— Light-DOM 行为宿主：作者写 root/label/list 与若干 item（内含 cell）角色节点，
 * 元素跑 tag-group 机器并把 connect 产出打上去。条目身份取自条目节点上的 value 属性，
 * 禁用由条目自报 aria-disabled，可摘由条目自报 deletable 属性。
 *
 * 整组只占一个 Tab 停靠点：组内走方向键，摘除走 Delete / Backspace，
 * 每枚标签的摘除钮一律 tabindex=-1。
 *
 * 条目的去留归宿主：item-delete 只报「用户要摘这一枚」，作者收到后自己把节点摘掉。
 *
 * 选中值是集合：单选可以直接写 value="a" 属性，多选只能走 property（`el.value = ['a','b']`），
 * 属性表达不了数组。
 *
 * @customElement xh-tag-group
 * @attr {string} value - 受控选中值（单选简写）；缺省该属性即非受控，多选请用 property
 * @attr {string} default-value - 非受控初始选中值
 * @attr {'none'|'single'|'multiple'} selection-mode - 选择模式，默认 none
 * @attr {boolean} deletable - 给出摘除钮，默认关；条目上写 deletable 可逐枚覆盖
 * @attr {boolean} disabled - 整组禁用：改不了选中值，也摘不掉任何一枚
 * @attr {boolean} read-only - 只读：可聚焦、可导航，但改不动
 * @attr {boolean} loop - 方向键走到尽头回绕，默认 true；写 loop="false" 关掉
 * @attr {'ltr'|'rtl'} dir - 文字方向，只改写左右方向键语义，默认 ltr
 * @attr {'horizontal'|'vertical'} orientation - 方向键轴向，默认 horizontal
 * @attr {boolean} typeahead - 连打检索，默认开；写 typeahead="false" 关掉
 * @attr {'solid'|'subtle'|'outline'} variant - 视觉变体，沿继承流下发给每一枚标签
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @fires value-change - 选中集合变化；detail 为 `{ value: string[] }`
 * @fires item-delete - 用户要摘掉某一枚；detail 为 `{ value: string }`
 * @csspart root - 组件根容器（承载三视觉轴与 data-orientation/data-disabled）
 * @csspart label - 组标题（aria-labelledby 目标）
 * @csspart list - role=grid 容器，键盘在此收口，也是 roving tabindex 的兜底位
 * @csspart item - role=row 标签，须自带 value 属性标识身份；禁用写 aria-disabled="true"
 * @csspart cell - role=gridcell，标签里那一格，文字与摘除钮都写在它之内
 * @csspart item-text - 标签文字（连打检索的取字处）
 * @csspart item-delete-trigger - 摘除钮，不占 Tab 位
 */
export class XhTagGroupElement extends XhElement {
  static override partContract = { anatomy: tagGroupAnatomy, meta: tagGroupMeta }

  // dir 只占属性名、字段改叫 direction：HTMLElement 原生 dir 是 string 访问器，
  // 同名声明既与基类类型冲突，也会盖掉原生反射。
  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    // 数组只走 property，属性表达不了；给了它条目的禁用与可摘即以数据为准
    collection: { attribute: false },
    translations: { attribute: false },
    value: { converter: STRING_CONVERTER },
    defaultValue: { converter: STRING_CONVERTER, attribute: 'default-value' },
    selectionMode: { converter: STRING_CONVERTER, attribute: 'selection-mode' },
    deletable: { type: Boolean },
    disabled: { type: Boolean },
    readOnly: { type: Boolean, attribute: 'read-only' },
    loop: { converter: BOOLEAN_CONVERTER },
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
    orientation: { converter: STRING_CONVERTER },
    typeahead: { converter: BOOLEAN_CONVERTER },
    variant: { converter: STRING_CONVERTER },
    tone: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
  }

  declare collection?: TagGroupNode[]
  declare translations?: Partial<TagGroupTranslations>
  declare value?: string | string[]
  declare defaultValue?: string | string[]
  declare selectionMode?: TagGroupSelectionMode
  declare deletable?: boolean
  declare disabled?: boolean
  declare readOnly?: boolean
  declare loop?: boolean
  declare direction?: Direction
  declare orientation?: Orientation
  declare typeahead?: boolean
  declare variant?: TagVariant
  declare tone?: Tone
  declare size?: Size

  // 整组禁用期间的条目自身声明快照。connect 每帧都把 aria-disabled 写回条目，整组禁用更是写满每一个，
  // 此时回读分不清「作者声明的」还是「自己上一帧写的」，解禁后条目就永远解不开。
  private readonly declaredDisabled = new WeakMap<HTMLElement, boolean>()
  /** 上一帧是否整组禁用：解禁当帧 DOM 上还留着机器写回的 aria-disabled，读不得。 */
  private wasGroupDisabled = false

  private readonly notify = (details: TagGroupValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyDelete = (details: TagGroupItemDeleteDetails): void => {
    this.dispatchEvent(new CustomEvent('item-delete', { detail: details, bubbles: true, composed: true }))
  }

  // tag-group 机器无副作用（连打缓冲住在 refs 里、由机器自己建），
  // 不需要 config/layer/定位引擎，故 controller 只带 props。
  private readonly ctrl = new MachineController<TagGroupSchema>(this, tagGroupMachine, () => this.machineProps())

  private machineProps(): Partial<TagGroupSchema['props']> {
    return {
      collection: this.collection,
      translations: this.translations,
      value: this.value,
      defaultValue: this.defaultValue,
      selectionMode: this.selectionMode,
      deletable: this.deletable ?? false,
      disabled: this.disabled ?? false,
      readOnly: this.readOnly ?? false,
      loop: this.loop,
      dir: this.direction,
      orientation: this.orientation,
      typeahead: this.typeahead,
      variant: this.variant,
      tone: this.tone,
      size: this.size,
      onValueChange: this.notify,
      onItemDelete: this.notifyDelete,
    }
  }

  /**
   * 承载焦点的标签被移出 DOM 时浏览器不派 focusout，焦点锚点会停在一个已消失的值上：
   * 容器判自己「焦点在组内」退出 Tab 序列，又没有条目认领得了这个锚点，
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
    // data-value 只写在 item 上，标签内的文字与摘除钮离场不会误判；
    // 只有走的正是持有锚点的那一枚才报，否则摘任一无关标签都会清掉方向键起点
    if (nodes.some(el => el.getAttribute(ITEM_VALUE_ATTR) === focusedValue))
      send({ type: 'LIST.BLUR' })
  }

  /** 作者声明的条目禁用，只认首见那一份；没写即 undefined，交给 collection 定夺 */
  private readonly declaredItemDisabled = createDeclaredDisabled()

  /**
   * 作者声明的可摘：条目上写了 deletable 属性即为真，写 deletable="false" 即为假，
   * 没写返回 undefined 交给 collection 与整组定夺。
   * connect 写回的是 data-deletable，与这个属性名分开，回读不会读到自己上一帧的产物。
   */
  private declaredDeletable(el: HTMLElement): boolean | undefined {
    const raw = el.getAttribute('deletable')
    return raw == null ? undefined : raw !== 'false'
  }

  private itemProps(el: HTMLElement): TagGroupItemProps {
    const value = el.getAttribute('value') ?? ''
    const deletable = this.declaredDeletable(el)
    // 给了 collection 就以数据为事实源：现读会读到 connect 上一帧写回的 aria-disabled，
    // 「作者没写」表达不出 undefined，数据里的禁用就永远轮不到生效。
    if (this.collection)
      return { value, disabled: this.declaredItemDisabled(el), deletable }
    const groupDisabled = !!this.disabled
    // 只有「本帧与上一帧都没整组禁用」时，节点上的 aria-disabled 才等于作者声明：
    // 整组禁用那几帧 connect 把每个条目都写成了 true，解禁当帧 DOM 上还留着这些写回值，
    // 此刻现读会把机器自己的产物误当声明、条目再也解不开。
    // 头一回见到这个条目时，DOM 上还只有作者写的东西（本帧的写回尚未发生），
    // 此刻无论整组禁没禁用都记得下真声明。
    if (!this.declaredDisabled.has(el)) {
      const own = isItemDisabled(el)
      this.declaredDisabled.set(el, own)
      return { value, disabled: own, deletable }
    }
    if (!groupDisabled && !this.wasGroupDisabled) {
      const own = isItemDisabled(el)
      this.declaredDisabled.set(el, own)
      return { value, disabled: own, deletable }
    }
    return { value, disabled: this.declaredDisabled.get(el)!, deletable }
  }

  // 条目内的子部件：getParts 收的是整个元素范围，按子树过滤才归得对。
  private partsIn(owner: HTMLElement, name: string): HTMLElement[] {
    return this.getParts(name).filter(el => owner.contains(el))
  }

  /**
   * 取数口与命令共用的取法。机器要到进文档才建，
   * 而这些都是公开面，作者拿到元素随时可能读、可能调——还没进文档时如实给空，不抛错。
   */
  private api(): TagGroupApi | null {
    const service = this.ctrl.service as Service<TagGroupSchema> | undefined
    return service ? connectTagGroup(service, wcNormalize) : null
  }

  /**
   * 此刻选中的那几枚（`value` 属性是受控入参，可能缺席，这里是结果）。
   * 机器尚未建起时给空数组。
   */
  get selectedValues(): string[] {
    return this.api()?.value ?? []
  }

  /** 生效的选择模式（`selection-mode` 属性缺席时的缺省档只有这里读得到）。 */
  get currentSelectionMode(): TagGroupSelectionMode {
    return this.api()?.selectionMode ?? 'none'
  }

  /** 焦点锚点；焦点不在组内时为 null。 */
  get focusedValue(): string | null {
    return this.api()?.focusedValue ?? null
  }

  /** 这一枚选中没有。机器尚未建起时一律给假。 */
  isSelected(value: string): boolean {
    return this.api()?.isSelected(value) ?? false
  }

  /** 整体改写选中集合。受控时只发 value-change，值归宿主写回。机器尚未建起时不动。 */
  setValue(next: string[]): void {
    this.api()?.setValue(next)
  }

  /** 只留这一枚；加选用 toggle。机器尚未建起时不动。 */
  select(value: string): void {
    this.api()?.select(value)
  }

  /** 切换这一枚的选中态。机器尚未建起时不动。 */
  toggle(value: string): void {
    this.api()?.toggle(value)
  }

  /** 摘掉一枚：从选中集合里去掉并派 item-delete，不搬焦点。机器尚未建起时不动。 */
  deleteItem(value: string): void {
    this.api()?.deleteItem(value)
  }

  protected wire(): void {
    const api = connectTagGroup(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('label', api.getLabelProps() as Record<string, unknown>)
    put('list', api.getListProps() as Record<string, unknown>)

    // 条目是多实例 part，逐个打：身份取作者写的 value，禁用取部件自报的 aria-disabled
    for (const el of this.getParts('item')) {
      const item = this.itemProps(el)
      this.spreader.spread(el, api.getItemProps(item) as Record<string, unknown>)
      // 标签内的那一格、文字与摘除钮跟着同一份声明走，样式层各处状态一致
      for (const cell of this.partsIn(el, 'cell'))
        this.spreader.spread(cell, api.getCellProps(item) as Record<string, unknown>)
      for (const text of this.partsIn(el, 'item-text'))
        this.spreader.spread(text, api.getItemTextProps(item) as Record<string, unknown>)
      for (const trigger of this.partsIn(el, 'item-delete-trigger'))
        this.spreader.spread(trigger, api.getItemDeleteTriggerProps(item) as Record<string, unknown>)
    }

    // 本帧的写回已落地，下一帧才知道 DOM 上的 aria-disabled 可不可信
    this.wasGroupDisabled = !!this.disabled
  }
}
