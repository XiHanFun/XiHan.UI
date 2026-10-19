/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// @xihan-ui/designer-kit/properties —— 属性面板的描述模型：按 JSON 路径寻址的属性描述、内建编辑方式与取值检查、
// 显示条件、分组、缺省值，以及自定义编辑器接口与编辑器查找。

import type { JsonObject, JsonPath, JsonPrimitive, JsonValue } from '@xihan-ui/core/json'
import type { OptionViolation } from '@xihan-ui/core/options'
import type { FormatSpec } from '@xihan-ui/expression'
import type { FilterField, FilterParameter } from '@xihan-ui/viz'
import type { DataField, DataFieldKind } from './data-fields'
import type { SchemaIssue, SchemaIssueTarget } from './schema'
import { formatJsonPath, getJsonAt, isJsonPathText, isPlainObject, jsonEquals, setJsonAt } from '@xihan-ui/core/json'
import { findOptionViolation } from '@xihan-ui/core/options'
import { checkFormatSpec } from '@xihan-ui/expression'
import { isIsoText } from './iso-text'

/** 选择类编辑方式的一项。 */
export interface PropertyOption {
  /** 选中这一项时写入的值。 */
  readonly value: JsonPrimitive
  /** 显示的文字；不给时由产品按值决定怎么显示。 */
  readonly label?: string
}

/** swatch 的一项：选中时写入 value，格子画成 color（能解析的 CSS 颜色串），label 是读屏念的名字。 */
export interface PropertySwatchOption {
  readonly value: string
  readonly color: string
  readonly label?: string
}

/** number 与 sides 共用的数值约束：integer 只收整数，min / max 含端点，exclusiveMin 不含，step 与 unit 只给编辑器用。 */
export interface PropertyNumberConstraints {
  /** 只收整数。 */
  readonly integer?: boolean
  /** 下限，含端点。 */
  readonly min?: number
  /** 上限，含端点。 */
  readonly max?: number
  /** 下限，不含端点。 */
  readonly exclusiveMin?: number
  /** 编辑器的步进幅度；校验不看。 */
  readonly step?: number
  /** 编辑器里显示的单位；校验不看。 */
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
 * - text：字符串；multiline 为多行；secret 为密钥这类不该明文显示的文字，编辑器用密码框，与 multiline 不并用。
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
 * - swatch：options 里某一项的 value，编辑器画成一排色块；custom 为 true 时另可填任意颜色，取值是 # 开头的 3、4、6、8 位十六进制色。
 * - options：选项列表，每项是 { value, label?, disabled?, tone?, description? }（选择类组件的选项形状），
 *   按 @xihan-ui/core/options 的 findOptionViolation 严格检查：不许别的键，同一列表里 value 不重复；value 不能是空串。requireLabel 为 true 时每项都要有不为空的 label；
 *   allowDisabled 为 false 时选项没有禁用这回事：每项不能带 disabled，编辑器也不显示禁用那一列。
 *   valueType 是 value 的类型（缺省 string）：number 是有限数字，boolean 是 true / false，date 是 ISO 日期（如 2026-10-19），
 *   datetime 是带时刻的 ISO 日期时间（如 2026-10-19T08:30），都按 core/date 严格解析；编辑器按它换值格的控件，boolean 固定 true、false 两行。
 * - treeOptions：选项树（树选择、级联这类组件吃的形状），每项是 { value, label?, disabled?, tone?, description?, children?, hasChildren? }，
 *   value 是不为空的字符串，children 是下一层的选项，hasChildren 为 true 表示有子项但还没给出。按 findOptionViolation 严格检查，
 *   同一层里 value 不重复，最多 32 层；requireLabel 与 allowDisabled 同 options。
 */
export type PropertyControl
  = | { readonly kind: 'text', readonly multiline?: boolean, readonly placeholder?: string, readonly secret?: boolean }
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
    | { readonly kind: 'swatch', readonly options: readonly PropertySwatchOption[], readonly custom?: boolean }
    | { readonly kind: 'options', readonly requireLabel?: boolean, readonly allowDisabled?: boolean, readonly valueType?: PropertyOptionValueType }
    | { readonly kind: 'treeOptions', readonly requireLabel?: boolean, readonly allowDisabled?: boolean }

/** 内建编辑方式的种类。 */
export type PropertyControlKind = PropertyControl['kind']

/** options 里 value 的类型。 */
export type PropertyOptionValueType = 'string' | 'number' | 'boolean' | 'date' | 'datetime'

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
  /** 编辑方式：kind 定用哪种编辑器、按什么校验，其余字段是这种方式的选项（选项表、数值约束等）。 */
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
  /** 分组 id；没写分组的属性归 undefined 这一组。 */
  readonly group: string | undefined
  /** 这一组里此刻显示的属性，按描述的先后。 */
  readonly properties: readonly D[]
}

/** 内建编辑方式的取值问题。 */
export type PropertyValueIssueCode
  = | 'invalid-type'
    | 'invalid-value'
    | 'out-of-range'
    | 'not-integer'
    | 'invalid-option'
    | 'invalid-color'
    | 'unknown-key'
    | 'required'
    | 'duplicate-value'

/** 取值里的一处问题：path 相对这个值，落在值本身时是 []。 */
export interface PropertyValueIssue {
  readonly code: PropertyValueIssueCode
  readonly path: JsonPath
}

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

/** findOptionViolation 的问题码换成取值问题码：缺了 value 或要求的 label 是 required，tone 不是色调名是 invalid-option，其余是类型不对。 */
function optionCode(found: OptionViolation, item: Readonly<Record<string, unknown>>): PropertyValueIssueCode {
  switch (found.code) {
    case 'unknown-key':
      return 'unknown-key'
    case 'duplicate-value':
      return 'duplicate-value'
    case 'invalid-value':
      return item.value === undefined ? 'required' : 'invalid-type'
    case 'invalid-label':
      return item.label === undefined ? 'required' : 'invalid-type'
    case 'invalid-tone':
      return typeof item.tone === 'string' ? 'invalid-option' : 'invalid-type'
    default:
      return 'invalid-type'
  }
}

/** 各值类型收哪些取值：date、datetime 这里只认字符串，写法另查。 */
const OPTION_VALUE_CHECKS: Readonly<Record<PropertyOptionValueType, (value: unknown) => boolean>> = {
  string: value => typeof value === 'string',
  number: value => typeof value === 'number' && Number.isFinite(value),
  boolean: value => typeof value === 'boolean',
  date: value => typeof value === 'string',
  datetime: value => typeof value === 'string',
}

/** JSON Pointer 的一段换回键名：~1 是 /，~0 是 ~。 */
function pointerToken(token: string): string {
  return token.replaceAll('~1', '/').replaceAll('~0', '~')
}

/** 选项列表与选项树里一项怎么查。 */
interface OptionRules {
  readonly requireLabel: boolean
  readonly allowDisabled: boolean
  readonly valueType: PropertyOptionValueType
  /** 选项树：多认 children 与 hasChildren 两个键，children 不在单项里查。 */
  readonly tree: boolean
}

/** 选项树的层数上限，顶层为第 1 层，与 findOptionViolation 的缺省一致。 */
const TREE_OPTION_MAX_DEPTH = 32

/**
 * 一项的第一处问题：不是对象，有别的键或某个键的取值不对（value 按 valueType 判类型），不许禁用时带了 disabled，
 * value 是空串，date / datetime 的写法不对，要求 label 时 label 为空，或 value 与同一列表里前面的项重复
 * （按值相等判，数字按数值）。问题落在 at 下这一项的那个键上，这一项不是对象时落在 at 上。
 */
function optionIssue(item: JsonValue, at: JsonPath, rules: OptionRules, seen: Set<JsonPrimitive>): PropertyValueIssue | undefined {
  if (!isPlainObject(item))
    return { code: 'invalid-type', path: at }
  const { children: _children, ...own } = item
  const found = findOptionViolation([rules.tree ? own : item], { strict: true, tree: rules.tree, requireLabel: rules.requireLabel, isValue: OPTION_VALUE_CHECKS[rules.valueType] })
  if (found !== undefined) {
    const key = found.pointer.split('/')[2]
    return { code: optionCode(found, item), path: key === undefined ? at : [...at, pointerToken(key)] }
  }
  if (!rules.allowDisabled && Object.hasOwn(item, 'disabled'))
    return { code: 'unknown-key', path: [...at, 'disabled'] }
  const option = item as { readonly value: JsonPrimitive, readonly label?: string }
  if (option.value === '')
    return { code: 'required', path: [...at, 'value'] }
  if ((rules.valueType === 'date' || rules.valueType === 'datetime') && !isIsoText(rules.valueType, option.value as string))
    return { code: 'invalid-value', path: [...at, 'value'] }
  if (rules.requireLabel && option.label === '')
    return { code: 'required', path: [...at, 'label'] }
  if (seen.has(option.value))
    return { code: 'duplicate-value', path: [...at, 'value'] }
  seen.add(option.value)
  return undefined
}

/** 选项列表里按先后的第一处问题，见 optionIssue。 */
function optionsIssue(control: Extract<PropertyControl, { kind: 'options' }>, value: JsonValue): PropertyValueIssue | undefined {
  if (!Array.isArray(value))
    return { code: 'invalid-type', path: [] }
  const rules: OptionRules = { requireLabel: control.requireLabel === true, allowDisabled: control.allowDisabled !== false, valueType: control.valueType ?? 'string', tree: false }
  const seen = new Set<JsonPrimitive>()
  for (const [index, item] of value.entries()) {
    const found = optionIssue(item, [index], rules, seen)
    if (found !== undefined)
      return found
  }
  return undefined
}

/**
 * 选项树里按先序的第一处问题：一项先查自己（见 optionIssue，重复按同一层判），再查它的 children。
 * children 或整棵树不是数组报 invalid-type，层数超过 32 报 invalid-value，落在那一层的列表上。
 */
function treeOptionsIssue(list: JsonValue, at: JsonPath, rules: OptionRules, depth: number): PropertyValueIssue | undefined {
  if (!Array.isArray(list))
    return { code: 'invalid-type', path: at }
  if (depth > TREE_OPTION_MAX_DEPTH)
    return { code: 'invalid-value', path: at }
  const seen = new Set<JsonPrimitive>()
  for (const [index, item] of list.entries()) {
    const found = optionIssue(item, [...at, index], rules, seen)
      ?? ((item as JsonObject).children === undefined ? undefined : treeOptionsIssue((item as JsonObject).children!, [...at, index, 'children'], rules, depth + 1))
    if (found !== undefined)
      return found
  }
  return undefined
}

/**
 * 找出值里第一处不符合内建编辑方式约束的地方；符合时为 undefined。问题落在值本身时 path 是 []，
 * options 的问题落在那一项的那个键上（如 [2, "value"]），treeOptions 的落在那一层那一项的那个键上（如 [0, "children", 2, "value"]）。
 * 各种类的问题码见 checkPropertyValue。
 */
export function findPropertyValueIssue(control: PropertyControl, value: JsonValue): PropertyValueIssue | undefined {
  if (control.kind === 'options')
    return optionsIssue(control, value)
  if (control.kind === 'treeOptions')
    return treeOptionsIssue(value, [], { requireLabel: control.requireLabel === true, allowDisabled: control.allowDisabled !== false, valueType: 'string', tree: true }, 1)
  const code = valueCode(control, value)
  return code === undefined ? undefined : { code, path: [] }
}

/**
 * 检查值是否符合内建编辑方式的约束；符合时为 undefined，否则给出问题码。
 * dataField 不是路径写法报 invalid-value；sides 多出四边以外的键报 unknown-key，缺边或某边不是数字报 invalid-type；
 * format 不是对象报 invalid-type，没过 checkFormatSpec 报 invalid-value；filter 不是对象报 invalid-type，条件树的形状不对报 invalid-value；
 * swatch 不是字符串报 invalid-type，既不是选项也不是允许的自定义颜色报 invalid-option；
 * options 不是数组或某项、某个键的类型不对（value 按 valueType 判）报 invalid-type，date / datetime 写法不对报 invalid-value，有别的键（allowDisabled 为 false 时含 disabled）报 unknown-key，tone 不是色调名报 invalid-option，
 * value 为空或缺了要求的 label 报 required，value 重复报 duplicate-value；treeOptions 同 options（value 只收字符串，重复按同一层判），
 * children 不是数组也报 invalid-type，hasChildren 不是布尔报 invalid-type，超过 32 层报 invalid-value。问题落在值里哪一处用 findPropertyValueIssue。
 */
export function checkPropertyValue(control: PropertyControl, value: JsonValue): PropertyValueIssueCode | undefined {
  return findPropertyValueIssue(control, value)?.code
}

function valueCode(control: Exclude<PropertyControl, { kind: 'options' | 'treeOptions' }>, value: JsonValue): PropertyValueIssueCode | undefined {
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
    case 'swatch':
      if (typeof value !== 'string')
        return 'invalid-type'
      return control.options.some(option => option.value === value) || (control.custom === true && HEX_COLOR.test(value)) ? undefined : 'invalid-option'
  }
}

/** 内建编辑方式的种类名；登记的新编辑方式不能与它们重名。 */
export const BUILTIN_CONTROL_KINDS: readonly PropertyControlKind[] = ['text', 'number', 'boolean', 'select', 'tags', 'color', 'json', 'dataField', 'sides', 'format', 'filter', 'swatch', 'options', 'treeOptions']

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
 * 已填的值不符合内建编辑方式报对应问题码（路径落在值里那一处，见 findPropertyValueIssue），登记的编辑方式交给它的 check；
 * 既不是内建也没登记的编辑方式报 unknown-control。
 */
export function checkProperties<C extends { readonly kind: string } = PropertyControl>(
  descriptors: readonly PropertyDescriptor<C>[],
  target: JsonValue | undefined,
  options: CheckPropertiesOptions = {},
): SchemaIssue[] {
  const base = options.path ?? []
  const issues: SchemaIssue[] = []
  const push = (code: string, descriptor: PropertyDescriptor<C>, inner: JsonPath = []): void => {
    issues.push({ code, path: [...base, ...descriptor.path, ...inner], ...(options.target ? { target: options.target } : {}) })
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
    if ((BUILTIN_CONTROL_KINDS as readonly string[]).includes(kind)) {
      const issue = findPropertyValueIssue(descriptor.control as unknown as PropertyControl, value!)
      if (issue !== undefined)
        push(issue.code, descriptor, issue.path)
      continue
    }
    const code = Object.hasOwn(controls, kind) ? controls[kind]!.check?.(value!, descriptor.control) : 'unknown-control'
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

/** 落在一个属性里的问题：path 相对这个属性，恰好落在属性上的是 []。 */
export interface PropertyIssue {
  readonly path: JsonPath
  /** 显示给用户的文字，由设计器换好。 */
  readonly message: string
}

/** 交给自定义编辑器的上下文；D 是属性描述，T 是被编辑的对象（如节点、元素、字段）。 */
export interface PropertyEditorContext<D = unknown, T = unknown> {
  /** 属性的当前值，未设置时为 undefined。 */
  readonly value: JsonValue | undefined
  /** 正在编辑的这个属性的描述。 */
  readonly descriptor: D
  /** 被编辑的对象。 */
  readonly target: T
  /** 只读：编辑器只显示，不写值。 */
  readonly readonly: boolean
  /** 写入新值，undefined 表示清除；连续输入由设计器并为一步撤销。 */
  readonly setValue: (value: JsonValue | undefined) => void
  /** 一次编辑结束（如失焦）：此后的写入另起一步撤销。 */
  readonly commit: () => void
  /**
   * 落在这个属性及其里层的问题，按路径排、同一路径只留一条，没有时是空数组。
   * 复合编辑器（选项表、四边、列配置）据此把里层的问题标到对应的子项上。
   */
  readonly issues: readonly PropertyIssue[]
}

/** 编辑器实例：设计器把 element 放进属性面板，值或只读状态变化时调用 update，移除前调用 destroy。 */
export interface PropertyEditorInstance<D = unknown, T = unknown> {
  /** 编辑器的根元素，设计器把它放进属性面板。 */
  readonly element: HTMLElement
  /** 值、只读状态或被编辑的对象变了时调用。 */
  readonly update?: (context: PropertyEditorContext<D, T>) => void
  /** 从属性面板撤掉前调用。 */
  readonly destroy?: () => void
  /** 编辑器自己把里层的问题标到子项上：只有里层问题时，设计器不在这一行下面重复显示它们。 */
  readonly nestedIssues?: boolean
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
