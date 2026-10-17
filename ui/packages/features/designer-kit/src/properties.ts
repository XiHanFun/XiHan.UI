/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// @xihan-ui/designer-kit/properties —— 属性面板的描述模型：按 JSON 路径寻址的属性描述、内建编辑方式与取值检查、
// 显示条件、分组、缺省值，以及自定义编辑器接口与编辑器查找。

import type { JsonObject, JsonPath, JsonPrimitive, JsonValue } from '@xihan-ui/core/json'
import type { FormatSpec } from '@xihan-ui/expression'
import type { FilterField, FilterParameter } from '@xihan-ui/viz'
import type { DataField, DataFieldKind } from './data-fields'
import type { SchemaIssue, SchemaIssueTarget } from './schema'
import { formatJsonPath, getJsonAt, isJsonPathText, isPlainObject, jsonEquals, setJsonAt } from '@xihan-ui/core/json'
import { checkFormatSpec } from '@xihan-ui/expression'

/** 选择类编辑方式的一项。 */
export interface PropertyOption {
  readonly value: JsonPrimitive
  readonly label?: string
}

/** number 与 sides 共用的数值约束：integer 只收整数，min / max 含端点，exclusiveMin 不含，step 与 unit 只给编辑器用。 */
export interface PropertyNumberConstraints {
  readonly integer?: boolean
  readonly min?: number
  readonly max?: number
  readonly exclusiveMin?: number
  readonly step?: number
  readonly unit?: string
}

/** sides 的四边，也是取值对象的四个键。 */
export const PROPERTY_SIDES = ['top', 'right', 'bottom', 'left'] as const

/** sides 的一边。 */
export type PropertySide = (typeof PROPERTY_SIDES)[number]

/** sides 的取值：四边各一个数字。 */
export type PropertySides = Readonly<Record<PropertySide, number>>

/**
 * 内建编辑方式与取值约束：
 * - text：字符串；multiline 为多行。
 * - number：有限数字，约束见 PropertyNumberConstraints。
 * - boolean：布尔。
 * - select：options 里某一项的 value；multiple 为这些 value 组成的数组。appearance 只给编辑器用：
 *   auto（缺省）由编辑器自己定，dropdown 总是下拉，toggle 总是切换按钮组。
 * - tags：字符串数组。
 * - color：transparent，或 # 开头的 3、4、6、8 位十六进制色。
 * - json：任意 JSON 值。
 * - dataField：绑定的数据字段，取值是字段路径的 formatJsonPath 写法，空串为没有绑定。字段树：描述里写了 fields 就用它，
 *   没写时用属性面板给的；kinds 是能选的字段种类（缺省全部），base 是相对路径的起点（从字段树根开始、只含键，
 *   同 listDataFields）。fields、kinds、base 只给编辑器用。
 * - sides：四边各一个数字的对象 { top, right, bottom, left }，每边都按 PropertyNumberConstraints 检查。
 * - format：@xihan-ui/expression 的格式说明，按 checkFormatSpec 检查；kinds 是允许的格式种类，缺省全部。
 * - filter：条件树（@xihan-ui/viz 的 FilterGroup）：每个组是 { logic: 'and' | 'or', conditions }，条件是 { field, operator }，
 *   只查这层形状，字段在不在、运算符合不合由各款自己的校验报。可筛选的字段：描述里写了 fields 就用它，没写时用属性面板
 *   给的 dataFields 按 listFilterFields 列出的 value 字段；parameters 是可引用的参数，maxDepth 限子组层数，ids 为 true 时
 *   新建的条件与组带 id。fields、parameters、maxDepth、ids 只给编辑器用。
 */
export type PropertyControl
  = | { readonly kind: 'text', readonly multiline?: boolean, readonly placeholder?: string }
    | ({ readonly kind: 'number' } & PropertyNumberConstraints)
    | { readonly kind: 'boolean' }
    | {
      readonly kind: 'select'
      readonly options: readonly PropertyOption[]
      readonly multiple?: boolean
      readonly appearance?: 'auto' | 'dropdown' | 'toggle'
    }
    | { readonly kind: 'tags' }
    | { readonly kind: 'color' }
    | { readonly kind: 'json' }
    | { readonly kind: 'dataField', readonly fields?: readonly DataField[], readonly kinds?: readonly DataFieldKind[], readonly base?: JsonPath }
    | ({ readonly kind: 'sides' } & PropertyNumberConstraints)
    | { readonly kind: 'format', readonly kinds?: readonly FormatSpec['kind'][] }
    | {
      readonly kind: 'filter'
      readonly fields?: readonly FilterField[]
      readonly parameters?: readonly FilterParameter[]
      readonly maxDepth?: number
      readonly ids?: boolean
    }

/** 内建编辑方式的种类。 */
export type PropertyControlKind = PropertyControl['kind']

/** 显示条件：path 与属性描述的 path 一样相对被编辑的对象，可用 all / any / not 组合。 */
export type PropertyCondition
  = | { readonly path: JsonPath, readonly equals: JsonValue }
    | { readonly path: JsonPath, readonly oneOf: readonly JsonValue[] }
    | { readonly path: JsonPath, readonly filled: boolean }
    | { readonly all: readonly PropertyCondition[] }
    | { readonly any: readonly PropertyCondition[] }
    | { readonly not: PropertyCondition }

/**
 * 一个可编辑属性。C 是编辑方式，产品可在内建之外扩展自己的种类：
 * `PropertyDescriptor<PropertyControl | { kind: 'stroke' }>`。
 */
export interface PropertyDescriptor<C extends { readonly kind: string } = PropertyControl> {
  /** 值相对被编辑对象（节点、元素、字段本身）的路径。 */
  readonly path: JsonPath
  readonly control: C
  /** 分组 id；分组的先后与文案由产品决定。 */
  readonly group?: string
  /** 标签；不给时由产品按 formatJsonPath(path) 去语言包里查。 */
  readonly label?: string
  /** 显示时必须填写，按 isFilled 判空。 */
  readonly required?: boolean
  /** 新建时写入的缺省值；不给就不写。 */
  readonly default?: JsonValue
  /** 显示条件；缺省总是显示。 */
  readonly visibleWhen?: PropertyCondition
  /** 产品自用，内核不解释。 */
  readonly meta?: JsonObject
}

/** 一组属性。 */
export interface PropertyGroup<D> {
  readonly group: string | undefined
  readonly properties: readonly D[]
}

/** 内建编辑方式的取值问题。 */
export type PropertyValueIssueCode = 'invalid-type' | 'invalid-value' | 'out-of-range' | 'not-integer' | 'invalid-option' | 'invalid-color' | 'unknown-key'

/** 判断值是否已填写：undefined、null、空串、空数组与空对象视为未填写。 */
export function isFilled(value: JsonValue | undefined): boolean {
  if (value === undefined || value === null || value === '')
    return false
  if (Array.isArray(value))
    return value.length > 0
  if (isPlainObject(value))
    return Object.keys(value).length > 0
  return true
}

/** 按被编辑的对象求值显示条件；equals 与 oneOf 按 JSON 值比较。 */
export function evaluateCondition(condition: PropertyCondition, target: JsonValue | undefined): boolean {
  if ('all' in condition)
    return condition.all.every(item => evaluateCondition(item, target))
  if ('any' in condition)
    return condition.any.some(item => evaluateCondition(item, target))
  if ('not' in condition)
    return !evaluateCondition(condition.not, target)
  const value = getJsonAt(target, condition.path)
  if ('equals' in condition)
    return jsonEquals(value, condition.equals)
  if ('oneOf' in condition)
    return condition.oneOf.some(candidate => jsonEquals(value, candidate))
  return isFilled(value) === condition.filled
}

function nestCondition(prefix: JsonPath, condition: PropertyCondition): PropertyCondition {
  if ('all' in condition)
    return { all: condition.all.map(item => nestCondition(prefix, item)) }
  if ('any' in condition)
    return { any: condition.any.map(item => nestCondition(prefix, item)) }
  if ('not' in condition)
    return { not: nestCondition(prefix, condition.not) }
  return { ...condition, path: [...prefix, ...condition.path] }
}

/**
 * 把相对某个子对象的属性描述换成相对上级对象：path 与显示条件里的 path 都接在 prefix 之后，
 * 其余字段（含产品扩展的字段）原样保留。
 */
export function nestProperties<D extends PropertyDescriptor<{ readonly kind: string }>>(prefix: JsonPath, descriptors: readonly D[]): D[] {
  return descriptors.map(descriptor => ({
    ...descriptor,
    path: [...prefix, ...descriptor.path],
    ...(descriptor.visibleWhen === undefined ? {} : { visibleWhen: nestCondition(prefix, descriptor.visibleWhen) }),
  }))
}

/** 判断属性在当前对象上是否显示。 */
export function isPropertyVisible(descriptor: PropertyDescriptor<{ readonly kind: string }>, target: JsonValue | undefined): boolean {
  return descriptor.visibleWhen === undefined || evaluateCondition(descriptor.visibleWhen, target)
}

/**
 * 把当前显示的属性按分组排列：order 中列出的分组在前并按其顺序，其余分组按首次出现顺序，
 * 无分组的属性排最后；组内保持描述顺序，空组不出现。
 */
export function groupProperties<D extends PropertyDescriptor<{ readonly kind: string }>>(
  descriptors: readonly D[],
  target: JsonValue | undefined,
  order: readonly string[] = [],
): PropertyGroup<D>[] {
  const buckets = new Map<string | undefined, D[]>()
  for (const descriptor of descriptors) {
    if (!isPropertyVisible(descriptor, target))
      continue
    const bucket = buckets.get(descriptor.group)
    if (bucket)
      bucket.push(descriptor)
    else
      buckets.set(descriptor.group, [descriptor])
  }
  const named = [...buckets.keys()].filter((group): group is string => group !== undefined)
  const ordered = [...order.filter(group => buckets.has(group)), ...named.filter(group => !order.includes(group))]
  const result: PropertyGroup<D>[] = ordered.map(group => ({ group, properties: buckets.get(group)! }))
  const ungrouped = buckets.get(undefined)
  if (ungrouped)
    result.push({ group: undefined, properties: ungrouped })
  return result
}

const HEX_COLOR = /^#(?:[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i

/** 检查一个数字是否符合数值约束。 */
function checkNumber(constraints: PropertyNumberConstraints, value: JsonValue | undefined): PropertyValueIssueCode | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value))
    return 'invalid-type'
  if (constraints.integer && !Number.isInteger(value))
    return 'not-integer'
  if ((constraints.min !== undefined && value < constraints.min)
    || (constraints.max !== undefined && value > constraints.max)
    || (constraints.exclusiveMin !== undefined && value <= constraints.exclusiveMin)) {
    return 'out-of-range'
  }
  return undefined
}

/** 条件树这一层的形状：组有 logic 与 conditions，条件有 field 与 operator，子组同样检查。 */
function isFilterGroupShape(value: unknown): boolean {
  if (!isPlainObject(value) || (value.logic !== 'and' && value.logic !== 'or') || !Array.isArray(value.conditions))
    return false
  return value.conditions.every(node => isPlainObject(node) && ('conditions' in node
    ? isFilterGroupShape(node)
    : typeof node.field === 'string' && typeof node.operator === 'string'))
}

/**
 * 检查值是否符合内建编辑方式的约束；符合时为 undefined，否则给出问题码。
 * dataField 不是路径写法报 invalid-value；sides 多出四边以外的键报 unknown-key，缺边或某边不是数字报 invalid-type；
 * format 不是对象报 invalid-type，没过 checkFormatSpec 报 invalid-value；filter 不是对象报 invalid-type，条件树的形状不对报 invalid-value。
 */
export function checkPropertyValue(control: PropertyControl, value: JsonValue): PropertyValueIssueCode | undefined {
  switch (control.kind) {
    case 'text':
      return typeof value === 'string' ? undefined : 'invalid-type'
    case 'number':
      return checkNumber(control, value)
    case 'boolean':
      return typeof value === 'boolean' ? undefined : 'invalid-type'
    case 'select': {
      const allowed = (item: JsonValue): boolean => control.options.some(option => option.value === item)
      if (control.multiple) {
        if (!Array.isArray(value))
          return 'invalid-type'
        return value.every(allowed) ? undefined : 'invalid-option'
      }
      return allowed(value) ? undefined : 'invalid-option'
    }
    case 'tags':
      return Array.isArray(value) && value.every(item => typeof item === 'string') ? undefined : 'invalid-type'
    case 'color':
      if (typeof value !== 'string')
        return 'invalid-type'
      return value === 'transparent' || HEX_COLOR.test(value) ? undefined : 'invalid-color'
    case 'json':
      return undefined
    case 'dataField':
      if (typeof value !== 'string')
        return 'invalid-type'
      return value === '' || isJsonPathText(value) ? undefined : 'invalid-value'
    case 'sides': {
      if (!isPlainObject(value))
        return 'invalid-type'
      if (Object.keys(value).some(key => !(PROPERTY_SIDES as readonly string[]).includes(key)))
        return 'unknown-key'
      for (const side of PROPERTY_SIDES) {
        const code = checkNumber(control, value[side])
        if (code !== undefined)
          return code
      }
      return undefined
    }
    case 'format':
      if (!isPlainObject(value))
        return 'invalid-type'
      return checkFormatSpec(value, control.kinds === undefined ? {} : { kinds: control.kinds }).length === 0 ? undefined : 'invalid-value'
    case 'filter':
      if (!isPlainObject(value))
        return 'invalid-type'
      return isFilterGroupShape(value) ? undefined : 'invalid-value'
  }
}

/** 内建编辑方式的种类名；登记的新编辑方式不能与它们重名。 */
export const BUILTIN_CONTROL_KINDS: readonly PropertyControlKind[] = ['text', 'number', 'boolean', 'select', 'tags', 'color', 'json', 'dataField', 'sides', 'format', 'filter']

/** 新的编辑方式：属性描述里 control.kind 等于登记的键时，checkProperties 用它校验取值。 */
export interface ControlKind {
  /** 检查已填写的取值；没问题返回 undefined，否则给出问题码。不给即不检查取值。 */
  readonly check?: (value: JsonValue, control: { readonly kind: string }) => string | undefined
}

/** checkProperties 的选项。 */
export interface CheckPropertiesOptions {
  /** 被编辑对象在文档里的路径，问题路径以它为前缀；缺省为空路径。 */
  readonly path?: JsonPath
  /** 问题落在的对象，原样写进每条问题。 */
  readonly target?: SchemaIssueTarget
  /** 内建之外登记的编辑方式，键是 control.kind（如设计器扩展合并出的那张表）。 */
  readonly controls?: Readonly<Record<string, ControlKind>>
}

/**
 * 按描述检查被编辑的对象，只看当前显示的属性：必填却未填报 required，
 * 已填的值不符合内建编辑方式报对应问题码，登记的编辑方式交给它的 check；
 * 既不是内建也没登记的编辑方式报 unknown-control。
 */
export function checkProperties<C extends { readonly kind: string } = PropertyControl>(
  descriptors: readonly PropertyDescriptor<C>[],
  target: JsonValue | undefined,
  options: CheckPropertiesOptions = {},
): SchemaIssue[] {
  const base = options.path ?? []
  const issues: SchemaIssue[] = []
  const push = (code: string, descriptor: PropertyDescriptor<C>): void => {
    issues.push({ code, path: [...base, ...descriptor.path], ...(options.target ? { target: options.target } : {}) })
  }
  for (const descriptor of descriptors) {
    if (!isPropertyVisible(descriptor, target))
      continue
    const value = getJsonAt(target, descriptor.path)
    if (!isFilled(value)) {
      if (descriptor.required)
        push('required', descriptor)
      if (value === undefined)
        continue
    }
    const kind = descriptor.control.kind
    const controls = options.controls ?? {}
    const code = (BUILTIN_CONTROL_KINDS as readonly string[]).includes(kind)
      ? checkPropertyValue(descriptor.control as unknown as PropertyControl, value!)
      : Object.hasOwn(controls, kind)
        ? controls[kind]!.check?.(value!, descriptor.control)
        : 'unknown-control'
    if (code !== undefined)
      push(code, descriptor)
  }
  return issues
}

/** 把描述里的缺省值写进对象：路径处没有值的才写，中间缺少的对象键补成空对象；没有可写的返回同一个对象。 */
export function applyDefaults<T extends JsonValue>(target: T, descriptors: readonly PropertyDescriptor<{ readonly kind: string }>[]): T {
  let result = target
  for (const descriptor of descriptors) {
    if (descriptor.default !== undefined && getJsonAt(result, descriptor.path) === undefined)
      result = setJsonAt(result, descriptor.path, descriptor.default, { createMissing: true }).root
  }
  return result
}

/** 交给自定义编辑器的上下文；D 是属性描述，T 是被编辑的对象（如节点、元素、字段）。 */
export interface PropertyEditorContext<D = unknown, T = unknown> {
  /** 属性的当前值，未设置时为 undefined。 */
  readonly value: JsonValue | undefined
  readonly descriptor: D
  readonly target: T
  readonly readonly: boolean
  /** 写入新值，undefined 表示清除；连续输入由设计器并为一步撤销。 */
  readonly setValue: (value: JsonValue | undefined) => void
  /** 一次编辑结束（如失焦）：此后的写入另起一步撤销。 */
  readonly commit: () => void
}

/** 编辑器实例：设计器把 element 放进属性面板，值或只读状态变化时调用 update，移除前调用 destroy。 */
export interface PropertyEditorInstance<D = unknown, T = unknown> {
  readonly element: HTMLElement
  readonly update?: (context: PropertyEditorContext<D, T>) => void
  readonly destroy?: () => void
}

/** 自定义属性编辑器：按上下文创建一个编辑器实例。 */
export type PropertyEditor<D = unknown, T = unknown> = (context: PropertyEditorContext<D, T>) => PropertyEditorInstance<D, T>

/** 编辑器查找表；E 可以是 PropertyEditor，也可以是编辑器 id。路径键用 formatJsonPath 的写法。 */
export interface PropertyEditorTable<E> {
  /** 按编辑方式的种类。 */
  readonly byControl: Readonly<Record<string, E>>
  /** 按属性路径，对所有对象种类生效。 */
  readonly byPath?: Readonly<Record<string, E>>
  /** 按对象种类与属性路径，只对该种类生效。 */
  readonly byTarget?: Readonly<Record<string, Readonly<Record<string, E>>>>
}

/** 编辑器表的一层：三张表都可以缺，按层叠起来用。 */
export type PropertyEditorLayer<E> = Partial<PropertyEditorTable<E>>

/** 把几层编辑器表叠成一张：按顺序逐键合并，后面的压前面的；undefined 的层跳过。 */
export function mergePropertyEditorTables<E>(layers: readonly (PropertyEditorLayer<E> | undefined)[]): PropertyEditorTable<E> {
  const byControl: Record<string, E> = {}
  const byPath: Record<string, E> = {}
  const byTarget: Record<string, Record<string, E>> = {}
  for (const layer of layers) {
    if (!layer)
      continue
    Object.assign(byControl, layer.byControl)
    Object.assign(byPath, layer.byPath)
    for (const [kind, table] of Object.entries(layer.byTarget ?? {}))
      byTarget[kind] = { ...byTarget[kind], ...table }
  }
  return { byControl, byPath, byTarget }
}

/** 查出某种对象的某个属性用哪个编辑器：对象种类 + 路径 → 路径 → 编辑方式；都没有时为 undefined。 */
export function resolvePropertyEditor<E>(
  table: PropertyEditorTable<E>,
  targetKind: string,
  descriptor: PropertyDescriptor<{ readonly kind: string }>,
): E | undefined {
  const key = formatJsonPath(descriptor.path)
  const own = <V>(record: Readonly<Record<string, V>> | undefined, name: string): V | undefined =>
    record !== undefined && Object.hasOwn(record, name) ? record[name] : undefined
  return own(own(table.byTarget, targetKind), key) ?? own(table.byPath, key) ?? own(table.byControl, descriptor.control.kind)
}
