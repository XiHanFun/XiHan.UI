import type { Direction, Orientation } from '@xihan-ui/core'
import type { RadioGroupItemProps, RadioGroupSchema, RadioGroupValueChangeDetails } from '@xihan-ui/headless'
import { isItemDisabled, ITEM_VALUE_ATTR } from '@xihan-ui/behavior'
import { connectRadioGroup, radioGroupMachine } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

/**
 * `<xh-radio-group>` —— Light-DOM 行为宿主：用户写 root/label 与若干 item 角色节点，
 * 每个 item 内自带 hidden-input/indicator/item-text，元素跑 radio-group 机器并把 connect 产出打上去。
 * 条目身份取自条目节点上的 value 属性；导航与选中在事件那一刻按 data-scope+data-part 查活 DOM，
 * 依赖 connect 回写的 data-value，因此 wire 必须先于交互跑过（基类 updated 已保证）。
 *
 * @customElement xh-radio-group
 * @attr {string} value - 受控选中值；缺省该属性即非受控
 * @attr {string} default-value - 非受控初始选中值
 * @attr {boolean} disabled - 整组禁用
 * @attr {'horizontal'|'vertical'} orientation - 视觉排布，默认 vertical
 * @attr {'ltr'|'rtl'} dir - 文字方向，只改写左右方向键语义，默认 ltr
 * @attr {string} name - 表单字段名；给定后隐藏输入才带 name 并参与提交
 * @fires value-change - 选中值变化；detail 为 `{ value: string | null }`
 * @csspart root - role=radiogroup 容器（承载 roving tabindex 的兜底位）
 * @csspart label - 组标题（aria-labelledby 目标）
 * @csspart item - role=radio 条目，作者用 value 属性声明身份
 * @csspart item-text - 条目文本
 * @csspart indicator - 条目选中标记
 * @csspart hidden-input - 条目的表单影子输入（必须是原生 input）
 */
export class XhRadioGroupElement extends XhElement {
  // dir 占属性名、字段改叫 direction：HTMLElement 原生 dir 是 string 访问器，
  // 同名声明既与基类类型冲突，也会盖掉原生反射。别名保留原生行为，
  // 同时让 dir 进 observedAttributes——运行期改 dir 才会重跑 wire 换掉按键处理器。
  static override properties = {
    value: { converter: { fromAttribute: (v: string | null) => v ?? undefined } },
    defaultValue: { attribute: 'default-value' },
    disabled: { type: Boolean },
    orientation: {},
    direction: { attribute: 'dir' },
    name: {},
  }

  declare value?: string
  declare defaultValue?: string
  declare disabled?: boolean
  declare orientation?: Orientation
  declare direction?: Direction
  declare name?: string

  // 整组禁用期间的条目自身声明快照。connect 每帧都把 aria-disabled 写回条目，整组禁用更是写满每一个，
  // 此时回读分不清「作者声明的」还是「自己上一帧写的」，组解禁后条目就永远解不开。
  private readonly declaredDisabled = new WeakMap<HTMLElement, boolean>()
  /** 上一帧是否整组禁用：解禁当帧 DOM 上还留着机器写回的 aria-disabled，读不得。 */
  private wasGroupDisabled = false

  private readonly notify = (details: RadioGroupValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<RadioGroupSchema>(this, radioGroupMachine, () => this.machineProps())

  private machineProps(): Partial<RadioGroupSchema['props']> {
    return {
      value: this.value,
      defaultValue: this.defaultValue ?? null,
      disabled: this.disabled ?? false,
      orientation: this.orientation,
      dir: this.direction,
      name: this.name,
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
    // data-value 只写在 item 上，条目内的隐藏输入与标记离场不会误判；
    // 只有走的正是持有焦点的那个条目才报，否则删任一无关条目都会清掉方向键起点
    if (nodes.some(el => el.getAttribute(ITEM_VALUE_ATTR) === focusedValue))
      send({ type: 'GROUP.BLUR' })
  }

  private itemProps(el: HTMLElement): RadioGroupItemProps {
    const value = el.getAttribute('value') ?? ''
    const groupDisabled = !!this.disabled
    // 只有「本帧与上一帧都没整组禁用」时，节点上的 aria-disabled 才等于作者声明：
    // 整组禁用那几帧 connect 把每个条目都写成了 true，解禁当帧 DOM 上还留着这些写回值，
    // 此刻现读会把机器自己的产物误当声明、条目再也解不开。
    if (!groupDisabled && !this.wasGroupDisabled) {
      const own = isItemDisabled(el)
      this.declaredDisabled.set(el, own)
      return { value, disabled: own }
    }
    // 用进入禁用前的快照；没有快照（挂载时就整组禁用）才退回现读
    return { value, disabled: this.declaredDisabled.get(el) ?? isItemDisabled(el) }
  }

  // 条目内的子部件：getParts 收的是整个元素范围，按 item 子树过滤才归得对条目。
  private partsIn(item: HTMLElement, name: string): HTMLElement[] {
    return this.getParts(name).filter(el => item.contains(el))
  }

  // hidden-input 的 style 是对象、checked 只认 DOM property：前者经 spread 会写成
  // "[object Object]"，后者 spread 用 removeAttribute 关不掉（property 写过之后属性
  // 不再决定选中态），两者都绕开 spread 单独落。
  private spreadHiddenInput(input: HTMLInputElement, props: Record<string, unknown>): void {
    const { style, checked, ...attrs } = props
    this.spreader.spread(input, attrs)
    input.checked = checked === true
    Object.assign(input.style, style as Record<string, string> | undefined)
  }

  protected wire(): void {
    const api = connectRadioGroup(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('label', api.getLabelProps() as Record<string, unknown>)

    for (const el of this.getParts('item')) {
      const item = this.itemProps(el)
      this.spreader.spread(el, api.getItemProps(item) as Record<string, unknown>)
      for (const input of this.partsIn(el, 'hidden-input'))
        this.spreadHiddenInput(input as HTMLInputElement, api.getHiddenInputProps(item) as Record<string, unknown>)
      for (const indicator of this.partsIn(el, 'indicator'))
        this.spreader.spread(indicator, api.getIndicatorProps(item) as Record<string, unknown>)
      for (const text of this.partsIn(el, 'item-text'))
        this.spreader.spread(text, api.getItemTextProps(item) as Record<string, unknown>)
    }

    // 本帧的写回已落地，下一帧才知道 DOM 上的 aria-disabled 可不可信
    this.wasGroupDisabled = !!this.disabled
  }
}
