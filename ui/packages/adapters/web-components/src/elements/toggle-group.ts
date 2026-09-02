import type { ToggleGroupItemProps, ToggleGroupNode, ToggleGroupSchema, ToggleGroupValueChangeDetails } from '@xihan-ui/headless'
import type { Direction, Orientation, Size, Tone } from '@xihan-ui/kernel'
import { isItemDisabled, ITEM_VALUE_ATTR } from '@xihan-ui/behavior'
import { connectToggleGroup, toggleGroupAnatomy, toggleGroupMachine, toggleGroupMeta } from '@xihan-ui/headless'
import { createDeclaredDisabled } from '../dom/declared-disabled'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 字符串属性统一走这个转换器：属性缺席即 undefined，缺省值的唯一事实源留在 connect。
// Lit 默认转换器会在属性被移除时把值落成 null，那样 value 就再也表达不了"非受控"。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }

// 布尔三态：缺席 = undefined（用 connect 的默认值），="false" = false，其余 = true。
// Lit 自带的 Boolean 转换器是 v !== null，缺省为真的 loop / roving-focus 会因此永远关不掉。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-toggle-group>` —— Light-DOM 行为宿主：作者写 root 与若干 item 角色节点，
 * 元素跑 toggle-group 机器并把 connect 产出打上去。条目须是原生 `<button>`
 * （Enter/Space 的激活由平台负责），身份取写在条目上的 value 属性，禁用由条目自报 aria-disabled。
 *
 * 单选（默认）与多选是两套 ARIA：单选 root=radiogroup、条目 role=radio + aria-checked；
 * 多选 root=group、条目保持原生按钮 + aria-pressed。
 *
 * 受控值的多选形态只能走 property（`el.value = ['a','b']`）：HTML 属性只装得下一个字符串。
 *
 * @customElement xh-toggle-group
 * @attr {string} value - 受控选中值（属性形式只表达单值）；缺省该属性即非受控
 * @attr {string} default-value - 非受控的初始选中值
 * @attr {boolean} multiple - 允许多项同时选中，默认关闭
 * @attr {boolean} disabled - 整组禁用
 * @attr {boolean} disallow-empty - 不许把值点空（最后一个选中项摘不掉）
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @attr {'horizontal'|'vertical'} orientation - 视觉排布，默认 horizontal；方向键四个恒响应，与它无关
 * @attr {'ltr'|'rtl'} dir - 文字方向，只改写左右方向键语义，默认 ltr
 * @attr {boolean} loop - 方向键走到尽头回绕，默认开启
 * @attr {boolean} roving-focus - roving tabindex，默认开启；关掉后每个条目各占一个 Tab 位
 * @fires value-change - 选中值变化；detail 为 `{ value: string | string[] | null }`（形态跟着 multiple 走）
 * @csspart root - role=radiogroup / group 的容器（承载键盘收口与 Tab 兜底位）
 * @csspart item - 开关按钮，须是原生 `<button>` 并自带 value 属性标识身份
 */
export class XhToggleGroupElement extends XhElement {
  static override partContract = { anatomy: toggleGroupAnatomy, meta: toggleGroupMeta }

  // dir 占属性名、字段改叫 direction：HTMLElement 原生 dir 是 string 访问器，
  // 同名声明既与基类类型冲突，也会盖掉原生反射。别名保留原生行为，
  // 同时让 dir 进 observedAttributes——运行期改 dir 才会重跑 wire 换掉按键处理器。
  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    // 数组只走 property，属性表达不了；给了它条目的文本与禁用即以数据为准
    collection: { attribute: false },
    value: { converter: STRING_CONVERTER },
    defaultValue: { converter: STRING_CONVERTER, attribute: 'default-value' },
    multiple: { converter: BOOLEAN_CONVERTER },
    disabled: { converter: BOOLEAN_CONVERTER },
    disallowEmpty: { converter: BOOLEAN_CONVERTER, attribute: 'disallow-empty' },
    tone: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
    orientation: { converter: STRING_CONVERTER },
    direction: { converter: STRING_CONVERTER, attribute: 'dir' },
    loop: { converter: BOOLEAN_CONVERTER },
    rovingFocus: { converter: BOOLEAN_CONVERTER, attribute: 'roving-focus' },
  }

  // 属性只喂得进字符串，property 还能直接喂数组（多选受控走这一路）
  declare collection?: ToggleGroupNode[]
  declare value?: string | string[]
  declare defaultValue?: string | string[]
  declare multiple?: boolean
  declare disabled?: boolean
  declare disallowEmpty?: boolean
  declare tone?: Tone
  declare size?: Size
  declare orientation?: Orientation
  declare direction?: Direction
  declare loop?: boolean
  declare rovingFocus?: boolean

  // 整组禁用期间的条目自身声明快照。connect 每帧都把 aria-disabled 写回条目，整组禁用更是写满每一个，
  // 此时回读分不清「作者声明的」还是「自己上一帧写的」，组解禁后条目就永远解不开。
  private readonly declaredDisabled = new WeakMap<HTMLElement, boolean>()
  /** 上一帧是否整组禁用：解禁当帧 DOM 上还留着机器写回的 aria-disabled，读不得。 */
  private wasGroupDisabled = false

  private readonly notify = (details: ToggleGroupValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  // toggle-group 机器无副作用：不需要 config/layer/refs，controller 只带 props。
  private readonly ctrl = new MachineController<ToggleGroupSchema>(this, toggleGroupMachine, () => this.machineProps())

  private machineProps(): Partial<ToggleGroupSchema['props']> {
    return {
      collection: this.collection,
      value: this.value,
      defaultValue: this.defaultValue,
      // 布尔一律原样透传：属性不在即 undefined，把缺省交回 connect
      // （multiple / disabled / disallowEmpty 默认关，loop / rovingFocus 默认开）
      multiple: this.multiple,
      disabled: this.disabled,
      disallowEmpty: this.disallowEmpty,
      tone: this.tone,
      size: this.size,
      orientation: this.orientation,
      dir: this.direction,
      loop: this.loop,
      rovingFocus: this.rovingFocus,
      onValueChange: this.notify,
    }
  }

  /**
   * 承载焦点的条目被移出 DOM 时浏览器不派 focusout，焦点锚点会停在一个已消失的值上：
   * 容器判自己"焦点在组内"退出 Tab 序列，又没有条目认领得了这个锚点，
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
    // 只有走的正是持有焦点的那个条目才报，否则删任一无关条目都会清掉方向键起点
    if (nodes.some(el => el.getAttribute(ITEM_VALUE_ATTR) === focusedValue))
      send({ type: 'GROUP.BLUR' })
  }

  /** 作者声明的条目禁用，只认首见那一份；没写即 undefined，交给 collection 定夺 */
  private readonly declaredItemDisabled = createDeclaredDisabled()

  private itemProps(el: HTMLElement): ToggleGroupItemProps {
    const value = el.getAttribute('value') ?? ''
    // 给了 collection 就以数据为事实源：现读会读到 connect 上一帧写回的 aria-disabled，
    // 「作者没写」表达不出 undefined，数据里的禁用就永远轮不到生效。
    if (this.collection)
      return { value, disabled: this.declaredItemDisabled(el) }
    // 只有「本帧与上一帧都没整组禁用」时，节点上的 aria-disabled 才等于作者声明：
    // 整组禁用那几帧 connect 把每个条目都写成了 true，解禁当帧 DOM 上还留着这些写回值，
    // 此刻现读会把机器自己的产物误当声明、条目再也解不开。
    // 头一回见到这个条目时，DOM 上还只有作者写的东西（本帧的写回尚未发生），
    // 此刻无论整组禁没禁用都记得下真声明。少了这一条，「挂载那刻就整组禁用」
    // 会一路没有快照，解禁时退回现读、读到机器自己写的 true，整组就此永久锁死。
    if (!this.declaredDisabled.has(el)) {
      const own = isItemDisabled(el)
      this.declaredDisabled.set(el, own)
      return { value, disabled: own }
    }
    if (!this.disabled && !this.wasGroupDisabled) {
      const own = isItemDisabled(el)
      this.declaredDisabled.set(el, own)
      return { value, disabled: own }
    }
    // 整组禁用那几帧（以及解禁当帧）DOM 上留着机器的写回值，只认快照
    return { value, disabled: this.declaredDisabled.get(el)! }
  }

  protected wire(): void {
    const api = connectToggleGroup(this.ctrl.service, wcNormalize)

    const root = this.getPart('root')
    if (root)
      this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)

    // 条目是多实例 part，逐个打：身份取作者写的 value，禁用取部件自报的 aria-disabled。
    // 打上去的 data-scope/data-part/data-value 正是键盘导航在事件那一刻查 DOM 的依据，
    // 所以 wire 必须先于事件跑过——updated() 已保证。
    for (const el of this.getParts('item'))
      this.spreader.spread(el, api.getItemProps(this.itemProps(el)) as Record<string, unknown>)

    // 本帧的写回已落地，下一帧才知道 DOM 上的 aria-disabled 可不可信
    this.wasGroupDisabled = !!this.disabled
  }
}
