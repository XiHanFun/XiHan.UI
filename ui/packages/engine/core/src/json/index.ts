/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// @xihan-ui/core/json —— JSON 值的类型与纯函数：普通对象判断、合法性检查、深拷贝、按值比较、深冻结、
// 按路径读写、路径前缀与文字形式、JSON Pointer 片段与变化路径。零依赖。

/** JSON 原始值。 */
export type JsonPrimitive = string | number | boolean | null

/** JSON 数组。 */
export type JsonArray = readonly JsonValue[]

/** JSON 对象。 */
export interface JsonObject {
  readonly [key: string]: JsonValue
}

/** 任意 JSON 值。 */
export type JsonValue = JsonPrimitive | JsonArray | JsonObject

/** 判断是否为原型为 Object.prototype 或 null 的普通对象（数组不算）。 */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value))
    return false
  const proto = Object.getPrototypeOf(value) as unknown
  return proto === Object.prototype || proto === null
}

/**
 * 查找值中第一处不是 JSON 的位置，返回其 JSON Pointer（以 pointer 为前缀）；整体合法时返回 undefined。
 * 非有限数字、undefined、函数、symbol、bigint、非普通对象与循环引用都视为非法；同一对象被多处引用不算循环。
 */
export function findJsonViolation(value: unknown, pointer = ''): string | undefined {
  return visit(value, pointer, new Set())
}

/** 判断是否为合法 JSON 值，判定与 findJsonViolation 相同。 */
export function isJsonValue(value: unknown): value is JsonValue {
  return findJsonViolation(value) === undefined
}

function visit(value: unknown, pointer: string, ancestors: Set<object>): string | undefined {
  if (value === null || typeof value === 'string' || typeof value === 'boolean')
    return undefined
  if (typeof value === 'number')
    return Number.isFinite(value) ? undefined : pointer
  if (Array.isArray(value)) {
    if (ancestors.has(value))
      return pointer
    ancestors.add(value)
    for (let index = 0; index < value.length; index++) {
      const found = visit(value[index], appendJsonPointer(pointer, index), ancestors)
      if (found !== undefined)
        return found
    }
    ancestors.delete(value)
    return undefined
  }
  if (isPlainObject(value)) {
    if (ancestors.has(value))
      return pointer
    ancestors.add(value)
    for (const key of Object.keys(value)) {
      const found = visit(value[key], appendJsonPointer(pointer, key), ancestors)
      if (found !== undefined)
        return found
    }
    ancestors.delete(value)
    return undefined
  }
  return pointer
}

/** 在 JSON Pointer 后追加一个片段，片段里的 ~ 与 / 按规范转义。 */
export function appendJsonPointer(pointer: string, token: string | number): string {
  return `${pointer}/${String(token).replace(/~/g, '~0').replace(/\//g, '~1')}`
}

/** 深拷贝 JSON 值，结果不与输入共享任何对象或数组。 */
export function cloneJson<T extends JsonValue>(value: T): T {
  if (value === null || typeof value !== 'object')
    return value
  if (Array.isArray(value))
    return value.map(item => cloneJson(item)) as unknown as T
  const result: Record<string, JsonValue> = {}
  for (const key of Object.keys(value))
    result[key] = cloneJson((value as JsonObject)[key] as JsonValue)
  return result as T
}

/** 深冻结对象与数组并返回同一个值；已冻结的对象视为整体已冻结，不再进入。 */
export function deepFreeze<T>(value: T): T {
  if (typeof value === 'object' && value !== null && !Object.isFrozen(value)) {
    Object.freeze(value)
    for (const key of Object.keys(value))
      deepFreeze((value as Record<string, unknown>)[key])
  }
  return value
}

/** 按值比较两个 JSON 值；对象比较与键顺序无关，数组与对象不相等，两个 undefined 相等。 */
export function jsonEquals(a: JsonValue | undefined, b: JsonValue | undefined): boolean {
  if (a === b)
    return true
  if (a === undefined || b === undefined || a === null || b === null)
    return false
  if (typeof a !== 'object' || typeof b !== 'object')
    return false
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length)
      return false
    return a.every((item, index) => jsonEquals(item, b[index]))
  }
  const objectA = a as JsonObject
  const objectB = b as JsonObject
  const keysA = Object.keys(objectA)
  if (keysA.length !== Object.keys(objectB).length)
    return false
  return keysA.every(key => Object.hasOwn(objectB, key) && jsonEquals(objectA[key], objectB[key]))
}

/** JSON 路径的一段：字符串只进入普通对象的自有键，数字只进入数组下标。 */
export type JsonPathSegment = string | number

/** JSON 路径；空路径指根。 */
export type JsonPath = readonly JsonPathSegment[]

/** 路径读写失败的原因。 */
export type JsonPathErrorCode = 'invalid-path' | 'path-not-found' | 'invalid-value'

/** 路径读写失败时抛出，message 即 code。 */
export class JsonPathError extends Error {
  readonly code: JsonPathErrorCode
  readonly path: JsonPath

  constructor(code: JsonPathErrorCode, path: JsonPath) {
    super(code)
    this.name = 'JsonPathError'
    this.code = code
    this.path = path
  }
}

/** setJsonAt 的选项。 */
export interface SetJsonOptions {
  /** 中间缺少的对象键按空对象补齐；缺省为 false，缺少时抛 path-not-found。缺少的那段之后不能再有数组下标。 */
  readonly createMissing?: boolean
}

/** setJsonAt 的结果：新根与写入前路径处的值（原先不存在时为 undefined）。 */
export interface SetJsonResult<T extends JsonValue> {
  readonly root: T
  readonly previous: JsonValue | undefined
}

const PROTOTYPE_KEYS: readonly string[] = ['__proto__', 'prototype', 'constructor']

function checkPath(path: JsonPath): void {
  if (!Array.isArray(path))
    throw new JsonPathError('invalid-path', path)
  for (const segment of path) {
    const valid = typeof segment === 'number'
      ? Number.isSafeInteger(segment) && segment >= 0
      : typeof segment === 'string' && !PROTOTYPE_KEYS.includes(segment)
    if (!valid)
      throw new JsonPathError('invalid-path', path)
  }
}

/** 取一段对应的子值；这一段在 node 上不存在时 found 为 false。 */
function childAt(node: JsonValue | undefined, segment: JsonPathSegment): { found: boolean, value: JsonValue | undefined } {
  if (typeof segment === 'number') {
    if (Array.isArray(node) && segment < node.length)
      return { found: true, value: (node as JsonArray)[segment] }
  }
  else if (isPlainObject(node) && Object.hasOwn(node, segment)) {
    return { found: true, value: (node as JsonObject)[segment] }
  }
  return { found: false, value: undefined }
}

/** 读取路径处的值；路径不存在时为 undefined，路径本身不合法（负数、小数、原型键）时抛 invalid-path。 */
export function getJsonAt(root: JsonValue | undefined, path: JsonPath): JsonValue | undefined {
  checkPath(path)
  let node = root
  for (const segment of path) {
    const next = childAt(node, segment)
    if (!next.found)
      return undefined
    node = next.value
  }
  return node
}

/**
 * 以不修改原值的方式在路径处写入 value，返回新根与原值；未改动的部分沿用原引用，写入的 value 不做拷贝。
 * value 为 undefined 时删除对象键；数组项只能按已有下标替换，删除与插入数组项不归这里。
 * 没有变化时返回传入的同一个根。路径为空或不合法抛 invalid-path，路径不存在抛 path-not-found，
 * value 不是 JSON 或想用 undefined 删除数组项抛 invalid-value。
 */
export function setJsonAt<T extends JsonValue>(root: T, path: JsonPath, value: JsonValue | undefined, options: SetJsonOptions = {}): SetJsonResult<T> {
  checkPath(path)
  if (path.length === 0)
    throw new JsonPathError('invalid-path', path)
  if (value !== undefined && findJsonViolation(value) !== undefined)
    throw new JsonPathError('invalid-value', path)

  const chain: (JsonValue | undefined)[] = [root]
  let missingFrom: number | undefined
  for (let depth = 0; depth < path.length - 1; depth++) {
    const segment = path[depth]!
    if (missingFrom !== undefined) {
      if (typeof segment === 'number')
        throw new JsonPathError('path-not-found', path)
      chain.push(undefined)
      continue
    }
    const next = childAt(chain[depth], segment)
    if (next.found) {
      chain.push(next.value)
      continue
    }
    if (!options.createMissing || typeof segment === 'number' || !isPlainObject(chain[depth]))
      throw new JsonPathError('path-not-found', path)
    missingFrom = depth
    chain.push(undefined)
  }

  const last = path[path.length - 1]!
  const parent = chain[chain.length - 1]
  let previous: JsonValue | undefined
  if (missingFrom !== undefined) {
    if (typeof last === 'number')
      throw new JsonPathError('path-not-found', path)
    if (value === undefined)
      return { root, previous: undefined }
  }
  else if (typeof last === 'number') {
    if (!Array.isArray(parent) || last >= parent.length)
      throw new JsonPathError('path-not-found', path)
    if (value === undefined)
      throw new JsonPathError('invalid-value', path)
    previous = (parent as JsonArray)[last]
    if (jsonEquals(previous, value))
      return { root, previous }
  }
  else {
    if (!isPlainObject(parent))
      throw new JsonPathError('path-not-found', path)
    const existed = Object.hasOwn(parent, last)
    previous = existed ? (parent as JsonObject)[last] : undefined
    if (existed ? value !== undefined && jsonEquals(previous, value) : value === undefined)
      return { root, previous }
  }

  let child: JsonValue | undefined = value
  for (let depth = path.length - 1; depth >= 0; depth--) {
    const segment = path[depth]!
    const node = chain[depth]
    if (typeof segment === 'number') {
      const copy = (node as JsonArray).slice()
      copy[segment] = child!
      child = copy
      continue
    }
    const copy: Record<string, JsonValue> = { ...(node as JsonObject | undefined) }
    if (child === undefined)
      delete copy[segment]
    else
      copy[segment] = child
    child = copy
  }
  return { root: child as T, previous }
}

/** 判断 prefix 是否为 path 的前缀（含相等）。 */
export function isJsonPathPrefix(path: JsonPath, prefix: JsonPath): boolean {
  return prefix.length <= path.length && prefix.every((segment, index) => path[index] === segment)
}

const IDENTIFIER = /^[\p{ID_Start}$_][\p{ID_Continue}$]*$/u

/** 把路径写成便于阅读的文字，如 lines[1].price；不是标识符的键写成 ["a b"]，空路径为空串。 */
export function formatJsonPath(path: JsonPath): string {
  let text = ''
  for (const segment of path) {
    if (typeof segment === 'number')
      text += `[${segment}]`
    else if (IDENTIFIER.test(segment))
      text += text === '' ? segment : `.${segment}`
    else
      text += `[${JSON.stringify(segment)}]`
  }
  return text
}

/**
 * 列出两个 JSON 值之间发生变化的最小路径集合：对象逐个自有键比较，等长数组逐项比较，
 * 其余不同（类型不同、长度变了的数组、原始值不同、一侧缺失）在该处整体报出；相等时为空数组。
 */
export function changedJsonPaths(before: JsonValue | undefined, after: JsonValue | undefined): JsonPath[] {
  const out: JsonPath[] = []
  collectChanges(before, after, [], out)
  return out
}

function collectChanges(before: JsonValue | undefined, after: JsonValue | undefined, path: JsonPathSegment[], out: JsonPath[]): void {
  if (jsonEquals(before, after))
    return
  if (isPlainObject(before) && isPlainObject(after)) {
    const a = before as JsonObject
    const b = after as JsonObject
    for (const key of new Set([...Object.keys(a), ...Object.keys(b)]))
      collectChanges(Object.hasOwn(a, key) ? a[key] : undefined, Object.hasOwn(b, key) ? b[key] : undefined, [...path, key], out)
    return
  }
  if (Array.isArray(before) && Array.isArray(after) && before.length === after.length) {
    before.forEach((item, index) => collectChanges(item, after[index], [...path, index], out))
    return
  }
  out.push(path)
}
