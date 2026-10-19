/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// @xihan-ui/designer-kit/field-inference —— 推断字段树：从一份 JSON 样例、从一份 JSON Schema 推断 DataField[]，
// 并把导入的字段并进现有字段。纯函数，不联网。

import type { JsonPath, JsonValue } from '@xihan-ui/core/json'
import type { FilterValueType } from '@xihan-ui/viz'
import type { DataField, DataFieldContent, DataFieldKind } from './data-fields'
import { formatJsonPath, isPlainObject } from '@xihan-ui/core/json'
import { isIsoText } from './iso-text'

/** 推断的选项。 */
export interface FieldInferenceOptions {
  /** 根是数组时，包住它的那个列表字段的名字，缺省 'items'。 */
  readonly rootName?: string
  /** 每个数组最多看几项，缺省 100；超出的不看，并记一条 sample-limit。 */
  readonly sampleLimit?: number
  /** 字段树最多几层，缺省 8；超出的对象不再展开，并记一条 depth-limit。 */
  readonly maxDepth?: number
  /** 识别 ISO 8601 的日期与日期时间文本，缺省 true。 */
  readonly detectDates?: boolean
  /** 把 data:image/… 与以图片扩展名结尾的 http(s) 地址标成 content: 'image'，缺省 false。 */
  readonly detectImages?: boolean
}

/**
 * 推断时值得告诉用户的情况：
 * - invalid-root：根是标量，或 Schema 的根不是 object / array；
 * - invalid-name：空键名，已跳过；
 * - mixed-type：同一路径见到几种标量类型（params.types），按文本；
 * - all-null：只见到 null，按文本；
 * - mixed-shape：同一路径既有对象又有标量或数组，取对象（没有对象时取数组）；
 * - empty-list：数组里没有可推断的项，列表没有子字段；
 * - scalar-list：标量数组，列表没有子字段，type 是元素类型；
 * - nested-list：数组的数组，只取外层，列表没有子字段；
 * - depth-limit：超出层数，这个对象不再展开；
 * - sample-limit：数组项超出上限（params.limit、params.count），后面的没看；
 * - unresolved-ref：外部或找不到的 $ref，按文本；
 * - circular-ref：循环引用，第二次出现时截断；
 * - union：oneOf / anyOf 合并了几支（params.count），全是对象时取并集，否则取第一支；
 * - dictionary：只有 additionalProperties / patternProperties 的对象，不展开；
 * - tuple：按位置给出元素的数组，取第一项。
 */
export type FieldInferenceNoteCode
  = | 'invalid-root'
    | 'invalid-name'
    | 'mixed-type'
    | 'all-null'
    | 'mixed-shape'
    | 'empty-list'
    | 'scalar-list'
    | 'nested-list'
    | 'depth-limit'
    | 'sample-limit'
    | 'unresolved-ref'
    | 'circular-ref'
    | 'union'
    | 'dictionary'
    | 'tuple'

/** 一条推断说明：文案由界面按 code 与 params 生成。 */
export interface FieldInferenceNote {
  readonly code: FieldInferenceNoteCode
  /** 字段名组成的路径，不含列表下标。 */
  readonly path: JsonPath
  readonly params?: Readonly<Record<string, JsonValue>>
}

/** DataField 放不下的信息，主要来自 JSON Schema。 */
export interface FieldAnnotation {
  readonly description?: string
  readonly required?: boolean
  readonly enum?: readonly JsonValue[]
  readonly default?: JsonValue
  /** 没有映射成字段类型的 format，如 email、uri。 */
  readonly format?: string
  readonly nullable?: boolean
}

/** 推断的结果。 */
export interface FieldInferenceResult {
  readonly fields: readonly DataField[]
  /** 按字段树的先后排列。 */
  readonly notes: readonly FieldInferenceNote[]
  /** 键是字段路径的 formatJsonPath 写法。 */
  readonly annotations: ReadonlyMap<string, FieldAnnotation>
}

/** mergeDataFields 里种类对不上的一处。 */
export interface DataFieldConflict {
  readonly path: JsonPath
  readonly current: DataField
  readonly incoming: DataField
}

/** mergeDataFields 的结果。 */
export interface DataFieldMergeResult {
  readonly fields: readonly DataField[]
  readonly conflicts: readonly DataFieldConflict[]
}

const DEFAULT_ROOT_NAME = 'items'
const DEFAULT_SAMPLE_LIMIT = 100
const DEFAULT_MAX_DEPTH = 8
const IMAGE_TEXT = /^(?:data:image\/|https?:\/\/\S+\.(?:png|jpe?g|gif|webp|svg|bmp|avif)(?:[?#]\S*)?$)/i
const ZONE_SUFFIX = /(?:z|[+-]\d{2}:?\d{2})$/i

type ScalarKind = 'string' | 'number' | 'boolean'

interface Collector {
  readonly notes: FieldInferenceNote[]
  readonly annotations: Map<string, FieldAnnotation>
}

function note(collector: Collector, code: FieldInferenceNoteCode, path: JsonPath, params?: Readonly<Record<string, JsonValue>>): void {
  collector.notes.push(params === undefined ? { code, path } : { code, path, params })
}

function annotate(collector: Collector, path: JsonPath, annotation: FieldAnnotation): void {
  if (Object.keys(annotation).length === 0)
    return
  const key = formatJsonPath(path)
  collector.annotations.set(key, { ...collector.annotations.get(key), ...annotation })
}

function field(name: string, kind: DataFieldKind, extra: { readonly label?: string, readonly type?: FilterValueType, readonly content?: DataFieldContent, readonly children?: readonly DataField[] } = {}): DataField {
  return {
    name,
    ...(extra.label === undefined ? {} : { label: extra.label }),
    kind,
    ...(extra.type === undefined ? {} : { type: extra.type }),
    ...(extra.content === undefined ? {} : { content: extra.content }),
    ...(extra.children === undefined ? {} : { children: extra.children }),
  }
}

function result(fields: readonly DataField[], collector: Collector): FieldInferenceResult {
  return { fields, notes: collector.notes, annotations: collector.annotations }
}

// —— 从 JSON 样例推断 ——

/** 同一路径上见到的全部取值的汇总。 */
interface SampleShape {
  readonly scalars: Set<ScalarKind>
  /** 见到的字符串是否全都是日期、全都是日期或日期时间、至少一个日期时间、全都是图片地址。 */
  allDates: boolean
  allTemporal: boolean
  anyDateTime: boolean
  allImages: boolean
  sawNull: boolean
  /** 见到过对象：键按首次出现的顺序。 */
  object: Map<string, SampleShape> | undefined
  /** 见到过数组：元素的汇总。 */
  list: SampleShape | undefined
  /** 对象超出层数，没有展开。 */
  truncated: boolean
  /** 见到的最长数组的长度，超出上限时记下。 */
  overflow: number
}

function sampleShape(): SampleShape {
  return { scalars: new Set(), allDates: true, allTemporal: true, anyDateTime: false, allImages: true, sawNull: false, object: undefined, list: undefined, truncated: false, overflow: 0 }
}

interface SampleSettings {
  readonly sampleLimit: number
  readonly maxDepth: number
  readonly detectDates: boolean
  readonly detectImages: boolean
}

function observeText(shape: SampleShape, text: string, settings: SampleSettings): void {
  if (settings.detectDates) {
    const date = isIsoText('date', text)
    const dateTime = !date && isIsoText('datetime', text.replace(ZONE_SUFFIX, ''))
    shape.allDates &&= date
    shape.allTemporal &&= date || dateTime
    shape.anyDateTime ||= dateTime
  }
  if (settings.detectImages)
    shape.allImages &&= IMAGE_TEXT.test(text)
}

/** 把一个取值并进它所在路径的汇总；depth 是这条路径的段数。 */
function observe(shape: SampleShape, value: JsonValue, depth: number, settings: SampleSettings): void {
  if (value === null) {
    shape.sawNull = true
  }
  else if (Array.isArray(value)) {
    shape.list ??= sampleShape()
    if (value.length > settings.sampleLimit)
      shape.overflow = Math.max(shape.overflow, value.length)
    for (const item of value.slice(0, settings.sampleLimit))
      observe(shape.list, item, depth, settings)
  }
  else if (typeof value === 'object') {
    shape.object ??= new Map()
    if (depth + 1 > settings.maxDepth) {
      shape.truncated = true
      return
    }
    for (const [key, child] of Object.entries(value)) {
      let childShape = shape.object.get(key)
      if (childShape === undefined) {
        childShape = sampleShape()
        shape.object.set(key, childShape)
      }
      observe(childShape, child, depth + 1, settings)
    }
  }
  else {
    const kind = typeof value as ScalarKind
    shape.scalars.add(kind)
    if (kind === 'string')
      observeText(shape, value as string, settings)
  }
}

/** 标量汇总的字段类型与内容；几种标量混在一起时按文本并记 mixed-type。 */
function scalarTypeOf(shape: SampleShape, path: JsonPath, settings: SampleSettings, collector: Collector): { readonly type: FilterValueType, readonly content?: DataFieldContent } {
  if (shape.scalars.size > 1) {
    note(collector, 'mixed-type', path, { types: [...shape.scalars].sort() })
    return { type: 'string' }
  }
  const [kind] = shape.scalars
  if (kind !== 'string')
    return { type: kind! }
  const content: DataFieldContent | undefined = settings.detectImages && shape.allImages ? 'image' : undefined
  const type: FilterValueType = !settings.detectDates ? 'string' : shape.allDates ? 'date' : shape.allTemporal && shape.anyDateTime ? 'datetime' : 'string'
  return content === undefined ? { type } : { type, content }
}

function sampleChildren(object: Map<string, SampleShape>, path: JsonPath, settings: SampleSettings, collector: Collector): DataField[] {
  const children: DataField[] = []
  for (const [name, shape] of object) {
    if (name === '') {
      note(collector, 'invalid-name', [...path, name])
      continue
    }
    children.push(sampleField(name, shape, [...path, name], settings, collector))
  }
  return children
}

function sampleField(name: string, shape: SampleShape, path: JsonPath, settings: SampleSettings, collector: Collector): DataField {
  const hasScalar = shape.scalars.size > 0
  if (shape.sawNull && hasScalar)
    annotate(collector, path, { nullable: true })
  if (shape.object !== undefined) {
    if (hasScalar || shape.list !== undefined)
      note(collector, 'mixed-shape', path)
    if (shape.truncated) {
      note(collector, 'depth-limit', path)
      return field(name, 'object')
    }
    return field(name, 'object', { children: sampleChildren(shape.object, path, settings, collector) })
  }
  if (shape.list !== undefined) {
    if (hasScalar)
      note(collector, 'mixed-shape', path)
    if (shape.overflow > 0)
      note(collector, 'sample-limit', path, { limit: settings.sampleLimit, count: shape.overflow })
    const element = shape.list
    if (element.object !== undefined) {
      if (element.scalars.size > 0 || element.list !== undefined)
        note(collector, 'mixed-shape', path)
      if (element.truncated) {
        note(collector, 'depth-limit', path)
        return field(name, 'list')
      }
      return field(name, 'list', { children: sampleChildren(element.object, path, settings, collector) })
    }
    if (element.list !== undefined) {
      note(collector, 'nested-list', path)
      return field(name, 'list')
    }
    if (element.scalars.size > 0) {
      note(collector, 'scalar-list', path)
      return field(name, 'list', scalarTypeOf(element, path, settings, collector))
    }
    note(collector, 'empty-list', path)
    return field(name, 'list')
  }
  if (hasScalar)
    return field(name, 'value', scalarTypeOf(shape, path, settings, collector))
  note(collector, 'all-null', path)
  annotate(collector, path, { nullable: true })
  return field(name, 'value', { type: 'string' })
}

/**
 * 从一份 JSON 样例推断字段树：对象 → object，对象数组 → list（子字段取各项键的并集），标量 → value 并带类型，
 * 标量数组 → 没有子字段的 list。根是对象时结果是它的键；根是数组时包成一个名为 rootName 的列表字段；根是标量时报 invalid-root。
 * 不推断显示名。传入的样例不会被改动。
 */
export function inferDataFields(sample: JsonValue, options: FieldInferenceOptions = {}): FieldInferenceResult {
  const collector: Collector = { notes: [], annotations: new Map() }
  const settings: SampleSettings = {
    sampleLimit: options.sampleLimit ?? DEFAULT_SAMPLE_LIMIT,
    maxDepth: options.maxDepth ?? DEFAULT_MAX_DEPTH,
    detectDates: options.detectDates ?? true,
    detectImages: options.detectImages ?? false,
  }
  const root = Array.isArray(sample) ? { [options.rootName ?? DEFAULT_ROOT_NAME]: sample } : sample
  if (!isPlainObject(root)) {
    note(collector, 'invalid-root', [])
    return result([], collector)
  }
  const shape = sampleShape()
  observe(shape, root as JsonValue, 0, settings)
  return result(sampleChildren(shape.object!, [], settings, collector), collector)
}

// —— 从 JSON Schema 推断 ——

type SchemaNode = Readonly<Record<string, unknown>>

interface SchemaContext {
  readonly root: SchemaNode
  readonly maxDepth: number
  readonly collector: Collector
}

/** JSON Pointer 的一段：先按 URI 片段解码，再还原 ~1 与 ~0；写法不合法时为 undefined。 */
function decodePointerToken(token: string): string | undefined {
  let text: string
  try {
    text = decodeURIComponent(token)
  }
  catch {
    return undefined
  }
  return text.replaceAll('~1', '/').replaceAll('~0', '~')
}

/** 本文档内的 JSON Pointer 引用（# 或 #/…）指向的节点；外部引用、找不到时为 undefined。 */
function resolvePointer(root: SchemaNode, ref: string): unknown {
  if (ref === '#')
    return root
  if (!ref.startsWith('#/'))
    return undefined
  let node: unknown = root
  for (const token of ref.slice(2).split('/')) {
    const key = decodePointerToken(token)
    if (key === undefined)
      return undefined
    if (!isPlainObject(node) && !Array.isArray(node))
      return undefined
    if (!Object.hasOwn(node as object, key))
      return undefined
    node = (node as Record<string, unknown>)[key]
  }
  return node
}

/** 一个节点展开引用、allOf 与只差 null 的 oneOf / anyOf 之后的样子。 */
interface ResolvedSchema {
  readonly node: SchemaNode
  readonly nullable: boolean
  /** 这条路径上已经展开过的引用，用来查循环。 */
  readonly refs: readonly string[]
  readonly failed?: 'unresolved-ref' | 'circular-ref'
}

function asNode(value: unknown): SchemaNode {
  return isPlainObject(value) ? value as SchemaNode : {}
}

function withoutKeys(node: SchemaNode, keys: readonly string[]): SchemaNode {
  return Object.fromEntries(Object.entries(node).filter(([key]) => !keys.includes(key)))
}

function mergeProperties(target: Record<string, unknown>, source: SchemaNode, override: boolean): void {
  const properties = asNode(source.properties)
  const merged = { ...asNode(target.properties) } as Record<string, unknown>
  for (const [key, value] of Object.entries(properties)) {
    if (override || !Object.hasOwn(merged, key))
      merged[key] = value
  }
  target.properties = merged
  if (Array.isArray(source.required))
    target.required = [...new Set([...(Array.isArray(target.required) ? target.required as unknown[] : []), ...source.required as unknown[]])]
}

function isObjectSchema(node: SchemaNode): boolean {
  return node.type === 'object' || (node.type === undefined && isPlainObject(node.properties))
}

function isNullSchema(node: SchemaNode): boolean {
  return node.type === 'null'
}

function resolveSchema(value: unknown, refs: readonly string[], context: SchemaContext, path: JsonPath): ResolvedSchema {
  let node = asNode(value)
  let nullable = false
  let chain = refs
  for (;;) {
    if (typeof node.$ref === 'string') {
      const ref = node.$ref
      if (chain.includes(ref))
        return { node: {}, nullable, refs: chain, failed: 'circular-ref' }
      const target = resolvePointer(context.root, ref)
      if (!isPlainObject(target))
        return { node: {}, nullable, refs: chain, failed: 'unresolved-ref' }
      chain = [...chain, ref]
      node = { ...target as SchemaNode, ...withoutKeys(node, ['$ref']) }
      continue
    }
    if (Array.isArray(node.allOf)) {
      const merged: Record<string, unknown> = { ...withoutKeys(node, ['allOf']) }
      for (const part of node.allOf) {
        const resolved = resolveSchema(part, chain, context, path)
        nullable ||= resolved.nullable
        for (const [key, item] of Object.entries(resolved.node)) {
          if (key === 'properties' || key === 'required')
            continue
          if (!Object.hasOwn(merged, key))
            merged[key] = item
        }
        mergeProperties(merged, resolved.node, true)
      }
      if (Object.keys(asNode(merged.properties)).length === 0)
        delete merged.properties
      node = merged
      continue
    }
    const variants = Array.isArray(node.oneOf) ? node.oneOf : Array.isArray(node.anyOf) ? node.anyOf : undefined
    if (variants !== undefined) {
      const resolved = variants.map(variant => resolveSchema(variant, chain, context, path))
      const kept = resolved.filter(variant => !isNullSchema(variant.node))
      nullable ||= kept.length < resolved.length || kept.some(variant => variant.nullable)
      const rest = withoutKeys(node, ['oneOf', 'anyOf'])
      if (kept.length === 0) {
        node = { ...rest, type: 'null' }
        continue
      }
      if (kept.length === 1) {
        if (kept[0]!.failed !== undefined)
          return { ...kept[0]!, nullable }
        node = { ...kept[0]!.node, ...rest }
        continue
      }
      note(context.collector, 'union', path, { count: kept.length })
      if (kept.every(variant => isObjectSchema(variant.node))) {
        const merged: Record<string, unknown> = { ...rest, type: 'object' }
        for (const variant of kept)
          mergeProperties(merged, variant.node, false)
        node = merged
      }
      else {
        if (kept[0]!.failed !== undefined)
          return { ...kept[0]!, nullable }
        node = { ...kept[0]!.node, ...rest }
      }
      continue
    }
    return { node, nullable, refs: chain }
  }
}

/** 节点的类型：type 数组去掉 null，只剩一种时取它；没写 type 时按 properties、items、enum / const 推。 */
function schemaType(node: SchemaNode): { readonly type: string | undefined, readonly nullable: boolean, readonly mixed?: readonly string[] } {
  if (typeof node.type === 'string')
    return { type: node.type, nullable: false }
  if (Array.isArray(node.type)) {
    const types = (node.type as unknown[]).filter((item): item is string => typeof item === 'string' && item !== 'null')
    const nullable = types.length < node.type.length
    if (types.length === 1)
      return { type: types[0], nullable }
    return types.length === 0 ? { type: 'null', nullable } : { type: undefined, nullable, mixed: [...new Set(types)].sort() }
  }
  if (isPlainObject(node.properties) || node.additionalProperties !== undefined || node.patternProperties !== undefined)
    return { type: 'object', nullable: false }
  if (node.items !== undefined || node.prefixItems !== undefined)
    return { type: 'array', nullable: false }
  const values = Array.isArray(node.enum) ? node.enum as unknown[] : Object.hasOwn(node, 'const') ? [node.const] : undefined
  if (values !== undefined) {
    const kinds = [...new Set(values.filter(item => item !== null).map(item => typeof item === 'number' ? 'number' : typeof item === 'boolean' ? 'boolean' : 'string'))]
    return kinds.length === 1 ? { type: kinds[0], nullable: values.includes(null) } : { type: undefined, nullable: values.includes(null), mixed: kinds.sort() }
  }
  return { type: undefined, nullable: false, mixed: [] }
}

function schemaAnnotation(node: SchemaNode, nullable: boolean, required: boolean): FieldAnnotation {
  const values = Array.isArray(node.enum) ? node.enum as JsonValue[] : Object.hasOwn(node, 'const') ? [node.const as JsonValue] : undefined
  const format = typeof node.format === 'string' && node.format !== 'date' && node.format !== 'date-time' ? node.format : undefined
  return {
    ...(typeof node.description === 'string' ? { description: node.description } : {}),
    ...(required ? { required: true } : {}),
    ...(values === undefined ? {} : { enum: values }),
    ...(Object.hasOwn(node, 'default') ? { default: node.default as JsonValue } : {}),
    ...(format === undefined ? {} : { format }),
    ...(nullable ? { nullable: true } : {}),
  }
}

/** 标量节点的字段类型与内容。 */
function scalarOf(node: SchemaNode, type: string): { readonly type: FilterValueType, readonly content?: DataFieldContent } {
  if (type === 'integer' || type === 'number')
    return { type: 'number' }
  if (type === 'boolean')
    return { type: 'boolean' }
  const fieldType: FilterValueType = node.format === 'date' ? 'date' : node.format === 'date-time' ? 'datetime' : 'string'
  return typeof node.contentMediaType === 'string' && /^image\//i.test(node.contentMediaType) ? { type: fieldType, content: 'image' } : { type: fieldType }
}

function schemaChildren(node: SchemaNode, refs: readonly string[], path: JsonPath, context: SchemaContext): DataField[] {
  const required = new Set(Array.isArray(node.required) ? node.required as unknown[] : [])
  const children: DataField[] = []
  for (const [name, child] of Object.entries(asNode(node.properties))) {
    if (name === '') {
      note(context.collector, 'invalid-name', [...path, name])
      continue
    }
    children.push(schemaField(name, child, refs, [...path, name], required.has(name), context))
  }
  return children
}

/** 对象节点的字段：超出层数或只是字典时不展开。 */
function objectField(name: string, node: SchemaNode, refs: readonly string[], path: JsonPath, kind: 'object' | 'list', context: SchemaContext): DataField {
  const label = typeof node.title === 'string' && kind === 'object' ? node.title : undefined
  if (!isPlainObject(node.properties) && (node.additionalProperties !== undefined || node.patternProperties !== undefined)) {
    note(context.collector, 'dictionary', path)
    return field(name, kind, { label })
  }
  if (path.length + 1 > context.maxDepth) {
    note(context.collector, 'depth-limit', path)
    return field(name, kind, { label })
  }
  return field(name, kind, { label, children: schemaChildren(node, refs, path, context) })
}

function listField(name: string, node: SchemaNode, refs: readonly string[], path: JsonPath, label: string | undefined, context: SchemaContext): DataField {
  let items: unknown = node.items
  if (Array.isArray(node.prefixItems) || Array.isArray(node.items)) {
    note(context.collector, 'tuple', path)
    items = Array.isArray(node.prefixItems) ? node.prefixItems[0] : (node.items as unknown[])[0]
  }
  if (items === undefined || items === true) {
    note(context.collector, 'empty-list', path)
    return field(name, 'list', { label })
  }
  const element = resolveSchema(items, refs, context, path)
  if (element.failed !== undefined) {
    note(context.collector, element.failed, path)
    return field(name, 'list', { label })
  }
  const { type, mixed } = schemaType(element.node)
  if (type === 'object') {
    const list = objectField(name, element.node, element.refs, path, 'list', context)
    return label === undefined ? list : { ...list, label }
  }
  if (type === 'array') {
    note(context.collector, 'nested-list', path)
    return field(name, 'list', { label })
  }
  note(context.collector, 'scalar-list', path)
  if (mixed !== undefined) {
    note(context.collector, 'mixed-type', path, { types: [...mixed] })
    return field(name, 'list', { label, type: 'string' })
  }
  return field(name, 'list', { label, ...scalarOf(element.node, type ?? 'string') })
}

function schemaField(name: string, value: unknown, refs: readonly string[], path: JsonPath, required: boolean, context: SchemaContext): DataField {
  const outer = asNode(value)
  const resolved = resolveSchema(value, refs, context, path)
  const node = resolved.node
  const label = typeof outer.title === 'string' ? outer.title : typeof node.title === 'string' ? node.title : undefined
  if (resolved.failed !== undefined) {
    note(context.collector, resolved.failed, path)
    annotate(context.collector, path, schemaAnnotation(outer, resolved.nullable, required))
    return field(name, 'value', { label, type: 'string' })
  }
  const { type, nullable, mixed } = schemaType(node)
  annotate(context.collector, path, schemaAnnotation(node, resolved.nullable || nullable || type === 'null', required))
  if (type === 'object') {
    const object = objectField(name, node, resolved.refs, path, 'object', context)
    return label === undefined || object.label !== undefined ? object : { ...object, label }
  }
  if (type === 'array')
    return listField(name, node, resolved.refs, path, label, context)
  if (type === 'null') {
    note(context.collector, 'all-null', path)
    return field(name, 'value', { label, type: 'string' })
  }
  if (mixed !== undefined) {
    note(context.collector, 'mixed-type', path, { types: [...mixed] })
    return field(name, 'value', { label, type: 'string' })
  }
  return field(name, 'value', { label, ...scalarOf(node, type!) })
}

/**
 * 从一份 JSON Schema（draft 2020-12 / draft-07 的常用子集）推断字段树：properties → 子字段，array 的 items → 列表，
 * format date / date-time → 日期 / 日期时间，contentMediaType image/* → 图片内容，title → 显示名；
 * description、required、enum / const、default、其余 format 与可空进 annotations。
 * 只解析本文档内的 $ref（# 或 #/…），不联网。根是 object 时结果是它的 properties；根是 array 时包成一个名为 rootName 的列表字段。
 */
export function dataFieldsFromJsonSchema(schema: JsonValue, options: Pick<FieldInferenceOptions, 'rootName' | 'maxDepth'> = {}): FieldInferenceResult {
  const collector: Collector = { notes: [], annotations: new Map() }
  if (!isPlainObject(schema)) {
    note(collector, 'invalid-root', [])
    return result([], collector)
  }
  const context: SchemaContext = { root: schema as SchemaNode, maxDepth: options.maxDepth ?? DEFAULT_MAX_DEPTH, collector }
  const resolved = resolveSchema(schema, [], context, [])
  const { type } = resolved.failed === undefined ? schemaType(resolved.node) : { type: undefined }
  if (type === 'object')
    return result(schemaChildren(resolved.node, resolved.refs, [], context), collector)
  if (type === 'array') {
    const name = options.rootName ?? DEFAULT_ROOT_NAME
    return result([listField(name, resolved.node, resolved.refs, [name], undefined, context)], collector)
  }
  note(collector, 'invalid-root', [])
  return result([], collector)
}

// —— 合并 ——

function mergeLevel(current: readonly DataField[], incoming: readonly DataField[], path: JsonPath, conflicts: DataFieldConflict[]): DataField[] {
  const byName = new Map(incoming.map(item => [item.name, item]))
  const merged = current.map((existing) => {
    const other = byName.get(existing.name)
    if (other === undefined)
      return existing
    byName.delete(existing.name)
    if (other.kind !== existing.kind) {
      conflicts.push({ path: [...path, existing.name], current: existing, incoming: other })
      return existing
    }
    const children = existing.kind === 'value' ? undefined : mergeLevel(existing.children ?? [], other.children ?? [], [...path, existing.name], conflicts)
    return field(existing.name, existing.kind, {
      label: existing.label ?? other.label,
      type: existing.type ?? other.type,
      content: existing.content ?? other.content,
      children: children === undefined || (children.length === 0 && existing.children === undefined && other.children === undefined) ? undefined : children,
    })
  })
  return [...merged, ...byName.values()]
}

/**
 * 把导入的字段并进现有字段：同级按 name 对齐，现有的显示名、类型与内容优先，缺的取导入的；
 * 导入里新出现的字段追加在同级末尾；种类不同的保留现有的，记进 conflicts。两边都不会被改动。
 */
export function mergeDataFields(current: readonly DataField[], incoming: readonly DataField[]): DataFieldMergeResult {
  const conflicts: DataFieldConflict[] = []
  const fields = mergeLevel(current, incoming, [], conflicts)
  return { fields, conflicts }
}
