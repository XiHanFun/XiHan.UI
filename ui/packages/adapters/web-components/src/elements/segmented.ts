import type { SegmentedItemProps, SegmentedNode, SegmentedSchema, SegmentedValueChangeDetails } from '@xihan-ui/headless'
import type { Direction, Orientation, Size, Tone } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import { isItemDisabled, ITEM_VALUE_ATTR } from '@xihan-ui/behavior'
import { connectSegmented, segmentedAnatomy, segmentedMachine, segmentedMeta } from '@xihan-ui/headless'
import { createDeclaredDisabled } from '../dom/declared-disabled'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 字符串属性统一走这个转换器：属性缺席即 undefined，缺省值的唯一事实源留在 connect。
// Lit 默认转换器会在属性被移除时把值落成 null，那样 value 就再也表达不了"非受控"。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }

// 布尔三态：缺席 = undefined（用 connect 的默认值），="false" = false，其余 = true。
// Lit 自带的 Boolean 转换器是 v !== null，缺省为真的 loop 会因此永远关不掉。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-segmented>` —— Light-DOM 行为宿主：作者写 root 与若干 item 角色节点，
 * 元素跑 segmented 机器并把 connect 产出打上去。段须是原生 `<button>`
 * （Enter/Space 的激活由平台负责），身份取写在段上的 value 属性，禁用由段自报 aria-disabled。
 *
 * 一排互斥选项就是单选组：root 是 radiogroup，每段 role=radio 并显式报 aria-checked。
 * indicator 是那块会滑动的选中标记，位置由机器量好写成内联样式里的四个私有槽；
 * 它绝对定位，必须写在段之前，靠文档序让段压在它上面。
 *
 * @customElement xh-segmented
 * @attr {string} value - 受控选中值；缺省该属性即非受控
 * @attr {string} default-value - 非受控的初始选中值
 * @attr {boolean} disabled - 整组禁用
 * @attr {boolean} read-only - 只读：选不动，方向键照常移焦点
 * @attr {boolean} invalid - 校验失败态
 * @attr {boolean} required - 必填
 * @attr {string} name - 表单字段名；给定后隐藏输入才带 name 并参与提交
 * @attr {'horizontal'|'vertical'} orientation - 视觉排布，默认 horizontal；方向键四个恒响应，与它无关
 * @attr {'ltr'|'rtl'} dir - 文字方向，只改写左右方向键语义与指示器的起始缘；不写即从 DOM 现读祖先链上的方向
 * @attr {boolean} loop - 方向键走到尽头回绕，默认开启
 * @attr {boolean} block - 撑满行宽，各段等分剩余空间
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @fires value-change - 选中值变化；detail 为 `{ value: string | null }`
 * @csspart root - role=radiogroup 的容器（承载键盘收口与 Tab 兜底位）
 * @csspart item - 一段，须是原生 `<button>` 并自带 value 属性标识身份
 * @csspart item-text - 段内文本
 * @csspart indicator - 会滑动的选中标记，对读屏隐藏；无选中项时收起
 * @csspart hidden-input - 表单影子输入（必须是原生 input），整组只需一份；给了 name 却没写它，就没有任何东西参与提交
 */
export class XhSegmentedElement extends XhElement {
  static override partContract = { anatomy: segmentedAnatomy, meta: segmentedMeta }

  // dir 占属性名、字段改叫 direction：HTMLElement 原生 dir 是 string 访问器，
  // 同名声明既与基类类型冲突，也会盖掉原生反射。别名保留原生行为，
  // 同时让 dir 进 observedAttributes——运行期改 dir 才会重跑 wire 换掉按键处理器。
  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    // 数组只走 property，属性表达不了；给了它段的文本与禁用即以数据为准
    collection: { attribute: false },
    value: { converter: STRING_CONVERTER },
    defaultValue: { converter: STRING_CONVERTER, attribute: 'default-value' },
    disabled: { converter: BOOLEAN_CONVERTER },
    readOnly: { converter: BOOLEAN_CONVERTER, attribute: 'read-only' },
    invalid: { converter: BOOLEAN_CONVERTER },
    required: { converter: BOOLEAN_CONVERTER },
    name: { converter: STRING_CONVERTER },
    orientation: { converter: STRING_CONVERTER },
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
    loop: { converter: BOOLEAN_CONVERTER },
    block: { converter: BOOLEAN_CONVERTER },
    tone: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
  }

  declare collection?: SegmentedNode[]
  declare value?: string
  declare defaultValue?: string
  declare disabled?: boolean
  declare readOnly?: boolean
  declare invalid?: boolean
  declare required?: boolean
  declare name?: string
  declare orientation?: Orientation
  declare direction?: Direction
  declare loop?: boolean
  declare block?: boolean
  declare tone?: Tone
  declare size?: Size

  // 整组禁用期间的段自身声明快照。connect 每帧都把 aria-disabled 写回段，整组禁用更是写满每一个，
  // 此时回读分不清「作者声明的」还是「自己上一帧写的」，组解禁后段就永远解不开。
  private readonly declaredDisabled = new WeakMap<HTMLElement, boolean>()
  /** 上一帧是否整组禁用：解禁当帧 DOM 上还留着机器写回的 aria-disabled，读不得。 */
  private wasGroupDisabled = false

  private readonly notify = (details: SegmentedValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<SegmentedSchema>(
    this,
    segmentedMachine,
    () => this.machineProps(),
    { onBuilt: svc => this.injectRefs(svc) },
  )

  private machineProps(): Partial<SegmentedSchema['props']> {
    return {
      collection: this.collection,
      value: this.value,
      defaultValue: this.defaultValue,
      // 布尔一律原样透传：属性不在即 undefined，把缺省交回 connect
      disabled: this.disabled,
      readOnly: this.readOnly,
      invalid: this.invalid,
      required: this.required,
      name: this.name,
      orientation: this.orientation,
      dir: this.direction,
      loop: this.loop,
      block: this.block,
      tone: this.tone,
      size: this.size,
      onValueChange: this.notify,
    }
  }

  // onBuilt 在 ctrl 构造期就跑，service 由参数传入
  private injectRefs(svc: Service<SegmentedSchema>): void {
    svc.refs.set('getRootEl', () => this.getPart('root'))
  }

  /**
   * 承载焦点的段被移出 DOM 时浏览器不派 focusout，焦点锚点会停在一个已消失的值上：
   * 容器判自己"焦点在组内"退出 Tab 序列，又没有段认领得了这个锚点，
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
    // data-value 只写在段上：只有持有焦点的那一段离场才上报
    if (nodes.some(el => el.getAttribute(ITEM_VALUE_ATTR) === focusedValue))
      send({ type: 'GROUP.BLUR' })
  }

  /** 作者声明的段禁用，只认首见那一份；没写即 undefined，交给 collection 定夺 */
  private readonly declaredItemDisabled = createDeclaredDisabled()

  private itemProps(el: HTMLElement): SegmentedItemProps {
    const value = el.getAttribute('value') ?? ''
    // 给了 collection 就以数据为事实源：现读会读到 connect 上一帧写回的 aria-disabled，
    // 「作者没写」表达不出 undefined，数据里的禁用就永远轮不到生效。
    if (this.collection)
      return { value, disabled: this.declaredItemDisabled(el) }
    // 头一回见到这一段：本帧的写回尚未发生，DOM 上还只有作者声明，此刻无论禁没禁用都要记下快照
    if (!this.declaredDisabled.has(el)) {
      const own = isItemDisabled(el)
      this.declaredDisabled.set(el, own)
      return { value, disabled: own }
    }
    // 只有本帧与上一帧都没整组禁用时，节点上的 aria-disabled 才等于作者声明
    if (!this.disabled && !this.wasGroupDisabled) {
      const own = isItemDisabled(el)
      this.declaredDisabled.set(el, own)
      return { value, disabled: own }
    }
    // 整组禁用那几帧（以及解禁当帧）DOM 上留着机器的写回值，只认快照
    return { value, disabled: this.declaredDisabled.get(el)! }
  }

  // 段内的子部件：getParts 收的是整个元素范围，按段的子树过滤才归得对
  private partsIn(item: HTMLElement, name: string): HTMLElement[] {
    return this.getParts(name).filter(el => item.contains(el))
  }

  protected wire(): void {
    const api = connectSegmented(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('hidden-input', api.getHiddenInputProps() as Record<string, unknown>)

    // 段是多实例 part，逐个打：身份取作者写的 value，禁用取段自报的 aria-disabled。
    // 打上去的 data-scope/data-part/data-value 正是键盘导航在事件那一刻查 DOM 的依据，
    // 所以 wire 必须先于事件跑过——updated() 已保证。
    for (const el of this.getParts('item')) {
      const item = this.itemProps(el)
      this.spreader.spread(el, api.getItemProps(item) as Record<string, unknown>)
      for (const text of this.partsIn(el, 'item-text'))
        this.spreader.spread(text, api.getItemTextProps(item) as Record<string, unknown>)
    }

    const indicator = this.getPart('indicator')
    if (indicator) {
      const props = api.getIndicatorProps() as Record<string, unknown>
      this.spreader.spread(indicator, props)
      // 按本帧产出的 hidden 用内联 display 收起
      this.setPartHidden(indicator, props.hidden === true)
    }

    // 本帧的写回已落地，下一帧才知道 DOM 上的 aria-disabled 可不可信
    this.wasGroupDisabled = !!this.disabled
  }
}
