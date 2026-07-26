import type { Direction, Orientation } from '@xihan-ui/core'
import type { RadioGroupItemProps, RadioGroupSchema, RadioGroupValueChangeDetails } from '@xihan-ui/headless'
import { isItemDisabled } from '@xihan-ui/behavior'
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

  // 条目的禁用声明只在首次见到该节点时读一次并记住：connect 每帧都会把 aria-disabled 写回条目
  // （整组 disabled 更是写满每个条目），再回读就分不清是作者声明还是自己上一帧的产物，
  // 组解禁后条目会永远解不开。
  private readonly declaredDisabled = new WeakMap<HTMLElement, boolean>()

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

  private itemProps(el: HTMLElement): RadioGroupItemProps {
    let disabled = this.declaredDisabled.get(el)
    if (disabled === undefined) {
      disabled = isItemDisabled(el)
      this.declaredDisabled.set(el, disabled)
    }
    return { value: el.getAttribute('value') ?? '', disabled }
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
  }
}
