/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 filter builder 相关实现。

import type { ControlVariant, Size } from '@xihan-ui/core'
import type { FilterBuilderApi, FilterBuilderCreateId, FilterBuilderSchema, FilterBuilderValueChangeDetails, FilterField, FilterGroup, FilterOperator, FilterParameter, FilterPath, FormControlState } from '@xihan-ui/headless'
import type { ElementStructure } from '../element-base'
import { connectFilterBuilder, filterBuilderAnatomy, filterBuilderMachine, filterBuilderMeta, filterBuilderStructure, filterBuilderTranslations, resolveFormControlState } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'
import { XhDateFieldElement } from './date-field'
import { XhNumberFieldElement } from './number-field'
import { XhSelectElement } from './select'
import { XhSwitchElement } from './switch'
import { XhTagsInputElement } from './tags-input'
import { XhTextFieldElement } from './text-field'
import { XhToggleGroupElement } from './toggle-group'

// 属性缺席翻成 undefined，以此区分受控与非受控。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }
// 三态布尔：缺席=undefined（用默认值）、="false"=false、其余=true。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/** 组里部件找所在的组、条件行里的部件找所在的条件，都按作者会写的角色属性向上找。 */
const GROUP_SELECTOR = '[data-xh-part="group"]'
const CONDITION_SELECTOR = '[data-xh-part="condition"]'

/** 组内部件：部件名与 api 上的 getter。 */
const GROUP_PARTS = [
  ['group-header', 'getGroupHeaderProps'],
  ['logic', 'getLogicProps'],
  ['group-delete-trigger', 'getGroupDeleteTriggerProps'],
  ['group-items', 'getGroupItemsProps'],
  ['group-footer', 'getGroupFooterProps'],
  ['add-condition-trigger', 'getAddConditionTriggerProps'],
  ['add-group-trigger', 'getAddGroupTriggerProps'],
] as const satisfies readonly (readonly [string, keyof FilterBuilderApi])[]

/** 条件行里的部件。 */
const CONDITION_PARTS = [
  ['condition-field', 'getConditionFieldProps'],
  ['condition-operator', 'getConditionOperatorProps'],
  ['condition-source', 'getConditionSourceProps'],
  ['condition-operand', 'getConditionOperandProps'],
  ['condition-ignore-case', 'getConditionIgnoreCaseProps'],
  ['condition-extra', 'getConditionExtraProps'],
  ['condition-delete-trigger', 'getConditionDeleteTriggerProps'],
  ['condition-error', 'getConditionErrorProps'],
] as const satisfies readonly (readonly [string, keyof FilterBuilderApi])[]

/** 元素还没进文档时调命令式方法的报错。 */
function notConnected(method: string): Error {
  return new Error(`[xh] <xh-filter-builder> 还没进文档，${method} 此时不可用`)
}

/**
 * `<xh-filter-builder>`：编辑一棵筛选条件树（`@xihan-ui/viz` 的 FilterGroup）。组里是条件与子组，
 * 组头切「全部满足 / 任一满足」，条件行是字段、运算符、操作数，有参数时还能切到参数引用。
 *
 * 不写部件（或只写 root）时元素按值生成整棵树：树的形状随值变，增删改都派发一棵新树。
 * 行里的下拉、输入框、日期框、标签输入、分段切换与开关都是库内元素的实例，结构由它们自己生成；按需注册本元素时连带注册它们。
 * 带 id 的条件行尾有扩展位：在宿主的直接子节点上写 `slot="condition-extra:<条件 id>"`，元素把它搬进那一行。
 * 值、字段与参数都是对象，只能经 property 赋值。
 *
 * @customElement xh-filter-builder
 * @prop {FilterGroup} value - 受控的条件树，未赋值即非受控
 * @prop {FilterGroup} defaultValue - 非受控初值
 * @prop {FilterField[]} fields - 可筛选的字段；条件的字段下拉按它的顺序
 * @prop {FilterParameter[]} parameters - 可引用的参数；不给或为空时不显示「值 / 参数」切换
 * @prop {FilterBuilderCreateId} createId - 新节点的 id；不给时新建的条件与组不带 id，也就没有扩展位
 * @prop {object} translations - 文案（只能通过 property 设置）
 * @attr {number} max-depth - 子组最多嵌套几层，缺省 2；0 表示不能加子组
 * @attr {boolean} ignore-case - 字符串运算符旁给不给「忽略大小写」开关；缺省 true，写 ignore-case="false" 关掉
 * @attr {boolean} disabled - 禁用：里面的控件都不可操作
 * @attr {boolean} read-only - 只读：里面的控件可聚焦、不可修改
 * @attr {boolean} invalid - 校验失败标注；有不完整的条件时也标
 * @attr {'outline'|'subtle'|'ghost'} variant - 形态，传给里面的控件
 * @attr {'sm'|'md'|'lg'} size - 尺寸，传给里面的控件
 * @fires value-change - 条件树变了；detail 为 `{ value: FilterGroup }`
 * @csspart root - role=group，承载 data-empty / data-invalid / data-disabled / data-readonly
 * @csspart label - 标题，可选；写了它根以它为名，放进 xh-field 时用字段的标题
 * @csspart group - 一个组，role=group，以逻辑为名；value 是节点身份，承载 data-depth / data-logic
 * @csspart group-header - 组头：逻辑切换与子组的删除钮
 * @csspart logic - 「全部满足 / 任一满足」切换的外包
 * @csspart group-delete-trigger - 删除子组的钮，根组没有
 * @csspart group-items - 组里的条件与子组
 * @csspart group-footer - 组尾：加条件与加条件组
 * @csspart add-condition-trigger - 在组里加一个条件
 * @csspart add-group-trigger - 在组里加一个子组；到 max-depth 时收起
 * @csspart condition - 一个条件，role=group，可及名「条件 n」；value 是节点身份，承载 data-invalid
 * @csspart condition-field - 字段下拉的外包
 * @csspart condition-operator - 运算符下拉的外包
 * @csspart condition-source - 「值 / 参数」切换的外包：有可用参数时才有
 * @csspart condition-operand - 操作数控件的外包；区间时是两个，夹着分隔文字
 * @csspart range-separator - 区间两端之间的文字
 * @csspart condition-ignore-case - 「忽略大小写」开关的外包
 * @csspart condition-extra - 行尾的扩展位，内容归宿主
 * @csspart condition-delete-trigger - 删除这个条件的钮
 * @csspart condition-error - 不完整的条件的行内说明，进条件的描述链
 * @csspart empty - 根组没有条件时的提示
 * @csspart live-region - 增删与挪动的播报
 */
export class XhFilterBuilderElement extends XhElement {
  static override partContract = { anatomy: filterBuilderAnatomy, meta: filterBuilderMeta }

  static override fieldTarget = { parts: ['root'], kind: 'group' } as const

  static override dependencies = {
    'xh-date-field': XhDateFieldElement,
    'xh-number-field': XhNumberFieldElement,
    'xh-select': XhSelectElement,
    'xh-switch': XhSwitchElement,
    'xh-tags-input': XhTagsInputElement,
    'xh-text-field': XhTextFieldElement,
    'xh-toggle-group': XhToggleGroupElement,
  }

  static override structure: ElementStructure<XhFilterBuilderElement> = {
    build: (host) => {
      if (!host.ctrl.service)
        return undefined
      return filterBuilderStructure(connectFilterBuilder(host.ctrl.service, wcNormalize), filterBuilderTranslations(host.ctrl.service.prop), {
        slotted: (name, key) => host.slotted(name, key),
      })
    },
  }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    value: { attribute: false },
    defaultValue: { attribute: false },
    fields: { attribute: false },
    parameters: { attribute: false },
    createId: { attribute: false },
    maxDepth: { converter: NUMBER_CONVERTER, attribute: 'max-depth' },
    ignoreCase: { converter: BOOLEAN_CONVERTER, attribute: 'ignore-case' },
    disabled: { converter: BOOLEAN_CONVERTER },
    readOnly: { converter: BOOLEAN_CONVERTER, attribute: 'read-only' },
    invalid: { converter: BOOLEAN_CONVERTER },
    variant: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
    translations: { attribute: false },
  }

  declare value?: FilterGroup
  declare defaultValue?: FilterGroup
  declare fields?: readonly FilterField[]
  declare parameters?: readonly FilterParameter[]
  declare createId?: FilterBuilderCreateId
  declare maxDepth?: number
  declare ignoreCase?: boolean
  declare disabled?: boolean
  declare readOnly?: boolean
  declare invalid?: boolean
  declare variant?: ControlVariant
  declare size?: Size
  declare translations?: FilterBuilderSchema['props']['translations']

  private readonly notify = (details: FilterBuilderValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<FilterBuilderSchema>(this, filterBuilderMachine, () => this.machineProps())
  private inheritedControl: FormControlState | undefined

  /** 最近的 Field 或 Form 只交状态；条件编辑器消费禁用、只读与无效三轴，再经组合节点交给里面的控件。 */
  setFormControlState(state: FormControlState | undefined): void {
    this.inheritedControl = state
    this.requestUpdate()
  }

  private machineProps(): Partial<FilterBuilderSchema['props']> {
    const control = resolveFormControlState({
      disabled: this.disabled,
      readOnly: this.readOnly,
      invalid: this.invalid,
    }, this.inheritedControl)
    return {
      labelled: this.getPart('label') != null,
      ariaLabel: this.hostAriaLabel(),
      value: this.value,
      defaultValue: this.defaultValue,
      fields: this.fields,
      parameters: this.parameters,
      createId: this.createId,
      maxDepth: this.maxDepth,
      ignoreCase: this.ignoreCase,
      disabled: control.disabled,
      readOnly: control.readOnly,
      invalid: control.invalid,
      variant: this.variant,
      size: this.size,
      translations: this.translations,
      onValueChange: this.notify,
    }
  }

  // 状态机此刻的 api；元素还没进文档时为 null
  private api(): FilterBuilderApi | null {
    return this.ctrl.service ? connectFilterBuilder(this.ctrl.service, wcNormalize) : null
  }

  /** 此刻的条件树；状态机尚未建立时取 value 或 defaultValue。 */
  get currentValue(): FilterGroup | null {
    const api = this.api()
    return api ? api.value : (this.value ?? this.defaultValue ?? null)
  }

  /** 整棵树的视图，根组在最外层；状态机尚未建立时为 null。 */
  get tree(): FilterBuilderApi['tree'] | null {
    return this.api()?.tree ?? null
  }

  /** 按文档序排的全部条件。 */
  get conditions(): FilterBuilderApi['conditions'] {
    return this.api()?.conditions ?? []
  }

  /** 有没有不完整的条件。 */
  get hasIssues(): boolean {
    return this.api()?.hasIssues ?? false
  }

  /** 有没有可引用的参数。 */
  get hasParameters(): boolean {
    return this.api()?.hasParameters ?? false
  }

  /** 读屏此刻播报的说明。 */
  get announcement(): string {
    return this.api()?.announcement ?? ''
  }

  /** 改组的逻辑。 */
  setLogic(path: FilterPath, logic: FilterGroup['logic']): void {
    const api = this.api()
    if (!api)
      throw notConnected('setLogic')
    api.setLogic(path, logic)
  }

  /** 在组里加一个条件。 */
  addCondition(groupPath: FilterPath): void {
    const api = this.api()
    if (!api)
      throw notConnected('addCondition')
    api.addCondition(groupPath)
  }

  /** 在组里加一个子组。 */
  addGroup(groupPath: FilterPath): void {
    const api = this.api()
    if (!api)
      throw notConnected('addGroup')
    api.addGroup(groupPath)
  }

  /** 删除一个条件或子组。 */
  removeNode(path: FilterPath): void {
    const api = this.api()
    if (!api)
      throw notConnected('removeNode')
    api.remove(path)
  }

  /** 在同组里挪一个条件或子组，delta 是挪几位。 */
  move(path: FilterPath, delta: number): void {
    const api = this.api()
    if (!api)
      throw notConnected('move')
    api.move(path, delta)
  }

  /** 换条件的字段。 */
  setField(path: FilterPath, field: string): void {
    const api = this.api()
    if (!api)
      throw notConnected('setField')
    api.setField(path, field)
  }

  /** 换条件的运算符。 */
  setOperator(path: FilterPath, operator: FilterOperator): void {
    const api = this.api()
    if (!api)
      throw notConnected('setOperator')
    api.setOperator(path, operator)
  }

  /** 改条件的操作数。 */
  setOperand(path: FilterPath, value: unknown): void {
    const api = this.api()
    if (!api)
      throw notConnected('setOperand')
    api.setOperand(path, value)
  }

  /** 切操作数的来源：字面值或参数引用。 */
  setSource(path: FilterPath, source: Parameters<FilterBuilderApi['setSource']>[1]): void {
    const api = this.api()
    if (!api)
      throw notConnected('setSource')
    api.setSource(path, source)
  }

  /** 开关忽略大小写。 */
  setIgnoreCase(path: FilterPath, value: boolean): void {
    const api = this.api()
    if (!api)
      throw notConnected('setIgnoreCase')
    api.setIgnoreCase(path, value)
  }

  /** 部件所属的组或条件的路径：向上找本宿主内最近的那一个，按它的 value 查路径。 */
  private ownerPath(el: HTMLElement, selector: string, api: FilterBuilderApi): FilterPath | undefined {
    const owner = el.closest<HTMLElement>(selector)
    const key = owner && this.contains(owner) ? owner.getAttribute('value') : null
    return key === null ? undefined : api.nodePath(key)
  }

  protected wire(): void {
    const api = connectFilterBuilder(this.ctrl.service, wcNormalize)
    const put = (el: HTMLElement | null, props: unknown): void => {
      if (el)
        this.spreader.spread(el, props as Record<string, unknown>)
    }
    put(this.getPart('root'), api.getRootProps())
    put(this.getPart('label'), api.getLabelProps())
    for (const el of this.getParts('group')) {
      const path = this.ownerPath(el, GROUP_SELECTOR, api)
      if (path)
        put(el, api.getGroupProps(path))
    }
    for (const [part, getter] of GROUP_PARTS) {
      for (const el of this.getParts(part)) {
        const path = this.ownerPath(el, GROUP_SELECTOR, api)
        if (path)
          put(el, api[getter](path))
      }
    }
    for (const el of this.getParts('condition')) {
      const path = this.ownerPath(el, CONDITION_SELECTOR, api)
      if (path)
        put(el, api.getConditionProps(path))
    }
    for (const [part, getter] of CONDITION_PARTS) {
      for (const el of this.getParts(part)) {
        const path = this.ownerPath(el, CONDITION_SELECTOR, api)
        if (path)
          put(el, api[getter](path))
      }
    }
    for (const el of this.getParts('range-separator'))
      put(el, api.getRangeSeparatorProps())
    put(this.getPart('empty'), api.getEmptyProps())
    put(this.getPart('live-region'), api.getLiveRegionProps())
  }
}
