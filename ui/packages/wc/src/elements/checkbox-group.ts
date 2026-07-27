import type { Orientation } from '@xihan-ui/core'
import type { CheckboxGroupItemProps, CheckboxGroupSchema, CheckboxGroupValueChangeDetails } from '@xihan-ui/headless'
import { isItemDisabled } from '@xihan-ui/behavior'
import { checkboxGroupMachine, connectCheckboxGroup } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined：受控与非受控的分界就在这个 undefined 上。
// Lit 自带的转换器会把缺席落成 null，那样 value="" 与"没写 value"就分不开了
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }

// 缺省为假的开关也用三态转换器：Lit 默认的 Boolean 转换器判据是 v !== null，
// disabled="false" 会被读成真。缺席 → undefined（交给机器的默认值），
// ="false" → false，其余一律真。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

// 值集合走逗号分隔：value="a,b"。空串是"明确的空集合"（受控且一个都没选），
// 与"没写这个属性"（非受控）不是一回事，所以只有 null 才翻成 undefined。
// 条目值里不能带逗号——这是本元素对属性写法的唯一约束，用 property 赋值则不受限。
const LIST_CONVERTER = {
  fromAttribute: (v: string | null) => (v === null ? undefined : v.split(',').map(s => s.trim()).filter(Boolean)),
}

/**
 * `<xh-checkbox-group>` —— Light-DOM 行为宿主：作者写 root/label 与若干 item 角色节点，
 * 每个 item 内自带 item-hidden-input/item-control/item-text，元素跑 checkbox-group 机器
 * 并把 connect 产出打上去。条目身份取自条目节点上的 value 属性。
 *
 * 与 `<xh-radio-group>` 的关键分歧：这里**不做 roving tabindex**。
 * 组内每一项都是独立的 Tab 停靠点（禁用项也保留），容器自己不占位——
 * 复选框各选各的，跳过任何一项都等于让键盘用户够不着它。
 *
 * @customElement xh-checkbox-group
 * @attr {string} value - 受控选中值，逗号分隔；缺省该属性即非受控
 * @attr {string} default-value - 非受控初始选中值，逗号分隔
 * @attr {string} item-values - 组内全部条目的值，逗号分隔；给了 trigger 才分得清"全选"与"半选"
 * @attr {boolean} disabled - 整组禁用
 * @attr {boolean} read-only - 只读：可聚焦可朗读，改不动
 * @attr {boolean} invalid - 校验失败标注
 * @attr {'horizontal'|'vertical'} orientation - 视觉排布，默认 vertical
 * @attr {string} name - 表单字段名；给定后隐藏输入才带 name 并参与提交
 * @fires value-change - 选中值变化；detail 为 `{ value: string[] }`
 * @csspart root - role=group 容器
 * @csspart label - 组标题（aria-labelledby 目标）
 * @csspart item - role=checkbox 条目，作者用 value 属性声明身份
 * @csspart item-control - 条目的视觉方框（对读屏隐藏）
 * @csspart item-text - 条目文本，条目的可及名来源
 * @csspart item-hidden-input - 条目的表单影子输入（必须是原生 input）
 * @csspart trigger - 全选/半选的父复选框，须写在 root 之内
 */
export class XhCheckboxGroupElement extends XhElement {
  // 描述符逐个写全、不用对象展开：CEM 分析器的 lit 插件读不了展开元素的名字，会整个崩掉。
  static override properties = {
    value: { converter: LIST_CONVERTER },
    defaultValue: { converter: LIST_CONVERTER, attribute: 'default-value' },
    itemValues: { converter: LIST_CONVERTER, attribute: 'item-values' },
    disabled: { converter: BOOLEAN_CONVERTER },
    readOnly: { converter: BOOLEAN_CONVERTER, attribute: 'read-only' },
    invalid: { converter: BOOLEAN_CONVERTER },
    orientation: { converter: STRING_CONVERTER },
    name: { converter: STRING_CONVERTER },
  }

  declare value?: string[]
  declare defaultValue?: string[]
  declare itemValues?: string[]
  declare disabled?: boolean
  declare readOnly?: boolean
  declare invalid?: boolean
  declare orientation?: Orientation
  declare name?: string

  // 整组禁用期间的条目自身声明快照。connect 每帧都把 aria-disabled 写回条目，整组禁用更是写满每一个，
  // 此时回读分不清「作者声明的」还是「自己上一帧写的」，组解禁后条目就永远解不开。
  private readonly declaredDisabled = new WeakMap<HTMLElement, boolean>()
  /** 上一帧是否整组禁用：解禁当帧 DOM 上还留着机器写回的 aria-disabled，读不得。 */
  private wasGroupDisabled = false

  private readonly notify = (details: CheckboxGroupValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<CheckboxGroupSchema>(this, checkboxGroupMachine, () => this.machineProps())

  private machineProps(): Partial<CheckboxGroupSchema['props']> {
    return {
      value: this.value,
      defaultValue: this.defaultValue,
      itemValues: this.itemValues,
      disabled: this.disabled ?? false,
      readOnly: this.readOnly ?? false,
      invalid: this.invalid ?? false,
      orientation: this.orientation,
      name: this.name,
      onValueChange: this.notify,
    }
  }

  private itemProps(el: HTMLElement): CheckboxGroupItemProps {
    const value = el.getAttribute('value') ?? ''
    const groupDisabled = !!this.disabled
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
    if (!groupDisabled && !this.wasGroupDisabled) {
      const own = isItemDisabled(el)
      this.declaredDisabled.set(el, own)
      return { value, disabled: own }
    }
    // 整组禁用那几帧（以及解禁当帧）DOM 上留着机器的写回值，只认快照
    return { value, disabled: this.declaredDisabled.get(el)! }
  }

  // 条目内的子部件：getParts 收的是整个元素范围，按 item 子树过滤才归得对条目。
  private partsIn(item: HTMLElement, name: string): HTMLElement[] {
    return this.getParts(name).filter(el => item.contains(el))
  }

  // checked 只认 DOM property：spread 见到 false 会走 removeAttribute，而属性早已不决定
  // 选中态（property 写过之后就脱钩了），于是"取消勾选"在 DOM 上根本不生效。单独落它。
  private spreadHiddenInput(input: HTMLInputElement, props: Record<string, unknown>): void {
    const { checked, ...rest } = props
    this.spreader.spread(input, rest)
    input.checked = checked === true
  }

  protected wire(): void {
    const api = connectCheckboxGroup(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('label', api.getLabelProps() as Record<string, unknown>)
    // trigger 逐个接线而不是只认头一个：Vue 侧每个 XhCheckboxGroupTrigger 都拿得到属性，
    // 这边只喂第一个的话，写了两个全选框的页面在两个适配器上就不是同一个东西了。
    // root/label 不这么做——label 的 id 是 aria-labelledby 的唯一目标，多份只会撞 id
    for (const el of this.getParts('trigger'))
      this.spreader.spread(el, api.getTriggerProps() as Record<string, unknown>)

    for (const el of this.getParts('item')) {
      const item = this.itemProps(el)
      this.spreader.spread(el, api.getItemProps(item) as Record<string, unknown>)
      for (const input of this.partsIn(el, 'item-hidden-input'))
        this.spreadHiddenInput(input as HTMLInputElement, api.getItemHiddenInputProps(item) as Record<string, unknown>)
      for (const control of this.partsIn(el, 'item-control'))
        this.spreader.spread(control, api.getItemControlProps(item) as Record<string, unknown>)
      for (const text of this.partsIn(el, 'item-text'))
        this.spreader.spread(text, api.getItemTextProps(item) as Record<string, unknown>)
    }

    // 本帧的写回已落地，下一帧才知道 DOM 上的 aria-disabled 可不可信
    this.wasGroupDisabled = !!this.disabled
  }
}
