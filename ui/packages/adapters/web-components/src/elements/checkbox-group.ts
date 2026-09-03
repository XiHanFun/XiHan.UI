import type { CheckboxGroupItemProps, CheckboxGroupNode, CheckboxGroupSchema, CheckboxGroupValueChangeDetails } from '@xihan-ui/headless'
import type { Orientation } from '@xihan-ui/kernel'
import { isItemDisabled } from '@xihan-ui/behavior'
import { checkboxGroupAnatomy, checkboxGroupMachine, checkboxGroupMeta, connectCheckboxGroup } from '@xihan-ui/headless'
import { createDeclaredDisabled } from '../dom/declared-disabled'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，以此区分受控与非受控。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }

// 三态布尔：缺席=undefined（走机器默认值）、="false"=false、其余为真。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

// 值集合走逗号分隔（value="a,b"）：空串是空集合，只有 null 才翻成 undefined。
// 条目值里不能带逗号，用 property 赋值则不受限。
const LIST_CONVERTER = {
  fromAttribute: (v: string | null) => (v === null ? undefined : v.split(',').map(s => s.trim()).filter(Boolean)),
}

/**
 * `<xh-checkbox-group>` —— Light-DOM 行为宿主：作者写 root/label 与若干 item 角色节点，
 * 每个 item 内自带 hidden-input/indicator/item-text，元素跑 checkbox-group 机器
 * 并把 connect 产出打上去。条目身份取自条目节点上的 value 属性。
 *
 * 不做 roving tabindex：组内每一项都是独立的 Tab 停靠点（禁用项也保留），容器自己不占位。
 *
 * @customElement xh-checkbox-group
 * @attr {string} value - 受控选中值，逗号分隔；缺省该属性即非受控
 * @attr {string} default-value - 非受控初始选中值，逗号分隔
 * @attr {string} item-values - 组内全部条目的值，逗号分隔；trigger 据此分辨全选与半选
 * @attr {boolean} disabled - 整组禁用
 * @attr {boolean} read-only - 只读：可聚焦可朗读，改不动
 * @attr {boolean} invalid - 校验失败标注
 * @attr {'horizontal'|'vertical'} orientation - 视觉排布，默认 vertical
 * @attr {string} name - 表单字段名；给定后隐藏输入才带 name 并参与提交
 * @fires value-change - 选中值变化；detail 为 `{ value: string[] }`
 * @csspart root - role=group 容器
 * @csspart label - 组标题（aria-labelledby 目标）
 * @csspart item - role=checkbox 条目，作者用 value 属性声明身份
 * @csspart indicator - 条目的视觉方框（对读屏隐藏）
 * @csspart item-text - 条目文本，条目的可及名来源
 * @csspart hidden-input - 条目的表单影子输入（必须是原生 input）
 * @csspart trigger - 全选/半选的父复选框，须写在 root 之内
 */
export class XhCheckboxGroupElement extends XhElement {
  static override partContract = { anatomy: checkboxGroupAnatomy, meta: checkboxGroupMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    // 数组只走 property，属性表达不了；给了它条目的文本与禁用即以数据为准
    collection: { attribute: false },
    value: { converter: LIST_CONVERTER },
    defaultValue: { converter: LIST_CONVERTER, attribute: 'default-value' },
    itemValues: { converter: LIST_CONVERTER, attribute: 'item-values' },
    disabled: { converter: BOOLEAN_CONVERTER },
    readOnly: { converter: BOOLEAN_CONVERTER, attribute: 'read-only' },
    invalid: { converter: BOOLEAN_CONVERTER },
    orientation: { converter: STRING_CONVERTER },
    name: { converter: STRING_CONVERTER },
  }

  declare collection?: CheckboxGroupNode[]
  declare value?: string[]
  declare defaultValue?: string[]
  declare itemValues?: string[]
  declare disabled?: boolean
  declare readOnly?: boolean
  declare invalid?: boolean
  declare orientation?: Orientation
  declare name?: string

  /** 条目自身 disabled 声明的快照，整组禁用期间 DOM 上的 aria-disabled 不可信。 */
  private readonly declaredDisabled = new WeakMap<HTMLElement, boolean>()
  /** 上一帧是否整组禁用；解禁当帧 DOM 上仍留着机器写回的 aria-disabled。 */
  private wasGroupDisabled = false

  private readonly notify = (details: CheckboxGroupValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<CheckboxGroupSchema>(this, checkboxGroupMachine, () => this.machineProps())

  private machineProps(): Partial<CheckboxGroupSchema['props']> {
    return {
      collection: this.collection,
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

  /** 作者声明的条目禁用，只认首见那一份；没写即 undefined，交给 collection 定夺 */
  private readonly declaredItemDisabled = createDeclaredDisabled()

  private itemProps(el: HTMLElement): CheckboxGroupItemProps {
    const value = el.getAttribute('value') ?? ''
    // 给了 collection 就以数据为事实源：现读会读到 connect 上一帧写回的 aria-disabled，
    // 「作者没写」表达不出 undefined，数据里的禁用就永远轮不到生效。
    if (this.collection)
      return { value, disabled: this.declaredItemDisabled(el) }
    const groupDisabled = !!this.disabled
    // 首次见到该条目时 DOM 上只有作者写的东西，此刻现读即真声明
    if (!this.declaredDisabled.has(el)) {
      const own = isItemDisabled(el)
      this.declaredDisabled.set(el, own)
      return { value, disabled: own }
    }
    // 本帧与上一帧都未整组禁用时，节点上的 aria-disabled 才等于作者声明
    if (!groupDisabled && !this.wasGroupDisabled) {
      const own = isItemDisabled(el)
      this.declaredDisabled.set(el, own)
      return { value, disabled: own }
    }
    // 整组禁用期间与解禁当帧只认快照
    return { value, disabled: this.declaredDisabled.get(el)! }
  }

  /** 取指定角色节点在 item 子树内的实例。 */
  private partsIn(item: HTMLElement, name: string): HTMLElement[] {
    return this.getParts(name).filter(el => item.contains(el))
  }

  // checked 单独落成 DOM property：spread 见到 false 只会 removeAttribute，关不掉选中态。
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
    // trigger 是多实例 part，逐个接线；root/label 只认头一个（label 的 id 是 aria-labelledby 的唯一目标）
    for (const el of this.getParts('select-all-trigger'))
      this.spreader.spread(el, api.getSelectAllTriggerProps() as Record<string, unknown>)

    for (const el of this.getParts('item')) {
      const item = this.itemProps(el)
      this.spreader.spread(el, api.getItemProps(item) as Record<string, unknown>)
      for (const input of this.partsIn(el, 'hidden-input'))
        this.spreadHiddenInput(input as HTMLInputElement, api.getHiddenInputProps(item) as Record<string, unknown>)
      for (const control of this.partsIn(el, 'indicator'))
        this.spreader.spread(control, api.getIndicatorProps(item) as Record<string, unknown>)
      for (const text of this.partsIn(el, 'item-text'))
        this.spreader.spread(text, api.getItemTextProps(item) as Record<string, unknown>)
    }

    this.wasGroupDisabled = !!this.disabled
  }
}
