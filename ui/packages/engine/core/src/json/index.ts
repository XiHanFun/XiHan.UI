/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// @xihan-ui/core/json —— JSON 值的类型与纯函数：普通对象判断、合法性检查、深拷贝、按值比较、深冻结、
// 按路径读写、路径前缀、路径的文字形式与解析、JSON Pointer 片段与变化路径、带出错位置的 JSON 文本解析。零依赖。

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
const IDENTIFIER_AT = /[\p{ID_Start}$_][\p{ID_Continue}$]*/uy
const INDEX = /^(?:0|[1-9]\d*)$/

/**
 * 把路径写成便于阅读的文字，如 lines[1].price；以 $ 开头的标识符照写（$page），
 * 不是标识符的键写成 ["a b"]，空路径为空串。parseJsonPath 是它的逆运算。
 */
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
 * 把 formatJsonPath 写出的文字解析回路径，二者互逆：parseJsonPath(formatJsonPath(path)) 与 path 相同。
 * 文法：首段是标识符或方括号段，其后每段是「. 标识符」或方括号段；方括号里是不带前导零的非负整数（数组下标），
 * 或 JSON 字符串（对象键，如 ["a b"]、["1a"]）。标识符同 JavaScript（含中文与 $、_ 开头）。
 * 空串解析为空路径。文法不符、下标超出安全整数、出现 __proto__ / prototype / constructor 时抛 invalid-path。
 */
export function parseJsonPath(text: string): JsonPathSegment[] {
  const path = scanJsonPath(text)
  if (path === undefined)
    throw new JsonPathError('invalid-path', [])
  return path
}

/** 判断文字是不是合法的路径写法（与 parseJsonPath 同一文法），不抛异常；空串算合法（指根）。 */
export function isJsonPathText(text: string): boolean {
  return scanJsonPath(text) !== undefined
}

function scanJsonPath(text: string): JsonPathSegment[] | undefined {
  if (typeof text !== 'string')
    return undefined
  const path: JsonPathSegment[] = []
  let at = 0
  while (at < text.length) {
    const char = text[at]
    if (char === '[') {
      const close = text[at + 1] === '"' ? closingQuote(text, at + 2) : text.indexOf(']', at + 1)
      if (close < 0)
        return undefined
      if (text[at + 1] === '"') {
        if (text[close + 1] !== ']')
          return undefined
        let key: unknown
        try {
          key = JSON.parse(text.slice(at + 1, close + 1))
        }
        catch {
          return undefined
        }
        if (typeof key !== 'string' || PROTOTYPE_KEYS.includes(key))
          return undefined
        path.push(key)
        at = close + 2
      }
      else {
        const digits = text.slice(at + 1, close)
        const index = Number(digits)
        if (!INDEX.test(digits) || !Number.isSafeInteger(index))
          return undefined
        path.push(index)
        at = close + 1
      }
      continue
    }
    if (path.length > 0) {
      if (char !== '.')
        return undefined
      at++
    }
    IDENTIFIER_AT.lastIndex = at
    const match = IDENTIFIER_AT.exec(text)
    if (!match || PROTOTYPE_KEYS.includes(match[0]))
      return undefined
    path.push(match[0])
    at += match[0].length
  }
  return path
}

/** 从 from 起找 JSON 字符串的收尾引号，跳过反斜杠转义；找不到时为 -1。 */
function closingQuote(text: string, from: number): number {
  for (let i = from; i < text.length; i++) {
    if (text[i] === '\\')
      i++
    else if (text[i] === '"')
      return i
  }
  return -1
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

/**
 * JSON 文本解析失败的原因：
 * - unexpected-end：文本在一个值写完之前就结束了（含空文本）；
 * - unexpected-token：这里出现了不该出现的字符（含末尾逗号、注释、单引号、值后面多出的内容）；
 * - invalid-string：字符串里有未转义的控制字符，或转义写法不对；
 * - invalid-number：数字写法不对（前导零、小数点或指数后面没有数字）。
 */
export type JsonTextErrorCode = 'unexpected-end' | 'unexpected-token' | 'invalid-string' | 'invalid-number'

/** parseJsonText 的结果：成功时是解析出的值，失败时是原因码与出错处。 */
export type JsonTextResult
  = | { readonly ok: true, readonly value: JsonValue }
    | {
      readonly ok: false
      readonly code: JsonTextErrorCode
      /** 出错处在文本里的下标，按 UTF-16 码元计。 */
      readonly offset: number
      /** 出错处的行号，从 1 起；\r\n、\n、\r 各算一次换行。 */
      readonly line: number
      /** 出错处的列号，从 1 起，按 UTF-16 码元计。 */
      readonly column: number
    }

/**
 * 按 RFC 8259 严格解析 JSON 文本，失败时给出原因码与出错处，不抛异常。
 * 接受的文本与 JSON.parse 完全相同：不认注释、末尾逗号、单引号、NaN 与开头的 BOM；__proto__ 键照样落成自有属性。
 */
export function parseJsonText(text: string): JsonTextResult {
  try {
    return { ok: true, value: JSON.parse(text) as JsonValue }
  }
  catch (error) {
    const failure = scanJsonText(text)
    if (failure === undefined)
      throw error
    const { line, column } = textPosition(text, failure.offset)
    return { ok: false, code: failure.code, offset: failure.offset, line, column }
  }
}

/** locateJsonPath 找到的值：在文本里的起止，与起点的行列。 */
export interface JsonTextLocation {
  /** 值的第一个字符的下标，按 UTF-16 码元计。 */
  readonly start: number
  /** 值的最后一个字符之后的下标。 */
  readonly end: number
  /** 起点的行号，从 1 起；换行的算法同 parseJsonText。 */
  readonly line: number
  /** 起点的列号，从 1 起，按 UTF-16 码元计。 */
  readonly column: number
}

/**
 * 在 JSON 文本里找路径指向的值，给出它的起止与起点的行列，供编辑框把光标移过去。路径同 getJsonAt：对象键与数组下标，
 * 空路径指整个值。文本不是合法 JSON、路径走不通（键不存在、下标越界、往原始值里走）时为 undefined。
 * 对象里键重复时取最后一个，与 JSON.parse 一致。
 */
export function locateJsonPath(text: string, path: JsonPath): JsonTextLocation | undefined {
  if (!parseJsonText(text).ok)
    return undefined
  let start = skipJsonSpace(text, 0)
  for (const segment of path) {
    const next = typeof segment === 'number' ? jsonItemStart(text, start, segment) : jsonMemberStart(text, start, segment)
    if (next === undefined)
      return undefined
    start = next
  }
  return { start, end: skipJsonValue(text, start), ...textPosition(text, start) }
}

interface JsonTextFailure {
  readonly code: JsonTextErrorCode
  readonly offset: number
}

const CHAR_TAB = 0x09
const CHAR_LF = 0x0A
const CHAR_CR = 0x0D
const CHAR_SPACE = 0x20
const CHAR_QUOTE = 0x22
const CHAR_COMMA = 0x2C
const CHAR_MINUS = 0x2D
const CHAR_DOT = 0x2E
const CHAR_ZERO = 0x30
const CHAR_NINE = 0x39
const CHAR_COLON = 0x3A
const CHAR_BRACKET_OPEN = 0x5B
const CHAR_BACKSLASH = 0x5C
const CHAR_BRACKET_CLOSE = 0x5D
const CHAR_BRACE_OPEN = 0x7B
const CHAR_BRACE_CLOSE = 0x7D
const SIMPLE_ESCAPES = '"\\/bfnrt'
const LITERALS = ['true', 'false', 'null']

function isDigit(char: number): boolean {
  return char >= CHAR_ZERO && char <= CHAR_NINE
}

function isHexDigit(char: number): boolean {
  return isDigit(char) || (char >= 0x41 && char <= 0x46) || (char >= 0x61 && char <= 0x66)
}

/** 从头扫一遍 JSON 文本，返回第一处不合文法的地方；文本合法时为 undefined。用显式的栈，不递归。 */
function scanJsonText(text: string): JsonTextFailure | undefined {
  const length = text.length
  const closers: number[] = []
  let at = 0
  const fail = (code: JsonTextErrorCode, offset = at): JsonTextFailure => ({ code, offset })
  const endOr = (code: JsonTextErrorCode): JsonTextFailure => fail(at >= length ? 'unexpected-end' : code)
  const skipSpace = (): void => {
    while (at < length) {
      const char = text.charCodeAt(at)
      if (char !== CHAR_SPACE && char !== CHAR_TAB && char !== CHAR_LF && char !== CHAR_CR)
        return
      at++
    }
  }
  const scanString = (): JsonTextFailure | undefined => {
    at++
    while (at < length) {
      const char = text.charCodeAt(at)
      if (char === CHAR_QUOTE) {
        at++
        return undefined
      }
      if (char < CHAR_SPACE)
        return fail('invalid-string')
      if (char === CHAR_BACKSLASH) {
        at++
        if (at >= length)
          return fail('unexpected-end')
        if (text[at] === 'u') {
          for (let digit = 1; digit <= 4; digit++) {
            if (at + digit >= length)
              return fail('unexpected-end', length)
            if (!isHexDigit(text.charCodeAt(at + digit)))
              return fail('invalid-string', at + digit)
          }
          at += 5
          continue
        }
        if (!SIMPLE_ESCAPES.includes(text[at]!))
          return fail('invalid-string')
      }
      at++
    }
    return fail('unexpected-end')
  }
  const scanDigits = (): JsonTextFailure | undefined => {
    if (!isDigit(text.charCodeAt(at)))
      return endOr('invalid-number')
    while (isDigit(text.charCodeAt(at)))
      at++
    return undefined
  }
  const scanNumber = (): JsonTextFailure | undefined => {
    if (text.charCodeAt(at) === CHAR_MINUS)
      at++
    if (text.charCodeAt(at) === CHAR_ZERO) {
      at++
      if (isDigit(text.charCodeAt(at)))
        return fail('invalid-number')
    }
    else {
      const failure = scanDigits()
      if (failure !== undefined)
        return failure
    }
    if (text.charCodeAt(at) === CHAR_DOT) {
      at++
      const failure = scanDigits()
      if (failure !== undefined)
        return failure
    }
    if (text[at] === 'e' || text[at] === 'E') {
      at++
      if (text[at] === '+' || text[at] === '-')
        at++
      return scanDigits()
    }
    return undefined
  }
  const scanLiteral = (): JsonTextFailure | undefined => {
    const literal = LITERALS.find(word => word[0] === text[at])
    if (literal === undefined)
      return fail('unexpected-token')
    for (let index = 1; index < literal.length; index++) {
      if (at + index >= length)
        return fail('unexpected-end', length)
      if (text[at + index] !== literal[index])
        return fail('unexpected-token', at + index)
    }
    at += literal.length
    return undefined
  }
  /** 对象里的「键 :」，停在冒号后面。 */
  const scanKey = (): JsonTextFailure | undefined => {
    skipSpace()
    if (text.charCodeAt(at) !== CHAR_QUOTE)
      return endOr('unexpected-token')
    const failure = scanString()
    if (failure !== undefined)
      return failure
    skipSpace()
    if (text.charCodeAt(at) !== CHAR_COLON)
      return endOr('unexpected-token')
    at++
    return undefined
  }

  for (;;) {
    skipSpace()
    if (at >= length)
      return fail('unexpected-end')
    const char = text.charCodeAt(at)
    let failure: JsonTextFailure | undefined
    if (char === CHAR_BRACE_OPEN || char === CHAR_BRACKET_OPEN) {
      const closer = char === CHAR_BRACE_OPEN ? CHAR_BRACE_CLOSE : CHAR_BRACKET_CLOSE
      at++
      skipSpace()
      if (text.charCodeAt(at) !== closer) {
        closers.push(closer)
        failure = closer === CHAR_BRACE_CLOSE ? scanKey() : undefined
        if (failure !== undefined)
          return failure
        continue
      }
      at++
    }
    else if (char === CHAR_QUOTE) {
      failure = scanString()
    }
    else if (char === CHAR_MINUS || isDigit(char)) {
      failure = scanNumber()
    }
    else {
      failure = scanLiteral()
    }
    if (failure !== undefined)
      return failure
    // 一个值写完：在容器里就接逗号或闭合，不在容器里文本就该结束
    for (;;) {
      skipSpace()
      const closer = closers.at(-1)
      if (closer === undefined)
        return at < length ? fail('unexpected-token') : undefined
      if (at >= length)
        return fail('unexpected-end')
      const next = text.charCodeAt(at)
      if (next === CHAR_COMMA) {
        at++
        if (closer === CHAR_BRACE_CLOSE) {
          failure = scanKey()
          if (failure !== undefined)
            return failure
        }
        break
      }
      if (next !== closer)
        return fail('unexpected-token')
      at++
      closers.pop()
    }
  }
}

/** 下标所在的行与列，都从 1 起；\r\n 算一次换行。 */
function textPosition(text: string, offset: number): { readonly line: number, readonly column: number } {
  let line = 1
  let lineStart = 0
  for (let index = 0; index < offset; index++) {
    const char = text.charCodeAt(index)
    if (char === CHAR_LF || (char === CHAR_CR && text.charCodeAt(index + 1) !== CHAR_LF)) {
      line++
      lineStart = index + 1
    }
  }
  return { line, column: offset - lineStart + 1 }
}

// 下面几个只走已经确认合法的 JSON 文本，不再查文法

function skipJsonSpace(text: string, at: number): number {
  while (at < text.length) {
    const char = text.charCodeAt(at)
    if (char !== CHAR_SPACE && char !== CHAR_TAB && char !== CHAR_LF && char !== CHAR_CR)
      break
    at++
  }
  return at
}

/** 从开头的引号走到收尾引号之后。 */
function skipJsonString(text: string, at: number): number {
  for (let index = at + 1; index < text.length; index++) {
    const char = text.charCodeAt(index)
    if (char === CHAR_BACKSLASH)
      index++
    else if (char === CHAR_QUOTE)
      return index + 1
  }
  return text.length
}

/** 从值的第一个字符走到值之后：字符串、对象与数组按括号配对（跳过字符串里的括号），数字与字面量走到分隔处。 */
function skipJsonValue(text: string, at: number): number {
  const char = text.charCodeAt(at)
  if (char === CHAR_QUOTE)
    return skipJsonString(text, at)
  if (char === CHAR_BRACE_OPEN || char === CHAR_BRACKET_OPEN) {
    let depth = 0
    for (let index = at; index < text.length; index++) {
      const next = text.charCodeAt(index)
      if (next === CHAR_QUOTE) {
        index = skipJsonString(text, index) - 1
      }
      else if (next === CHAR_BRACE_OPEN || next === CHAR_BRACKET_OPEN) {
        depth++
      }
      else if (next === CHAR_BRACE_CLOSE || next === CHAR_BRACKET_CLOSE) {
        depth--
        if (depth === 0)
          return index + 1
      }
    }
    return text.length
  }
  let index = at
  while (index < text.length) {
    const next = text.charCodeAt(index)
    if (next === CHAR_COMMA || next === CHAR_BRACE_CLOSE || next === CHAR_BRACKET_CLOSE || next === CHAR_SPACE || next === CHAR_TAB || next === CHAR_LF || next === CHAR_CR)
      break
    index++
  }
  return index
}

/** at 处是对象时，键为 key 的成员的值从哪里起；重复的键取最后一个。 */
function jsonMemberStart(text: string, at: number, key: string): number | undefined {
  if (text.charCodeAt(at) !== CHAR_BRACE_OPEN)
    return undefined
  let found: number | undefined
  let index = skipJsonSpace(text, at + 1)
  while (text.charCodeAt(index) === CHAR_QUOTE) {
    const keyEnd = skipJsonString(text, index)
    const name = JSON.parse(text.slice(index, keyEnd)) as string
    const valueStart = skipJsonSpace(text, skipJsonSpace(text, keyEnd) + 1)
    if (name === key)
      found = valueStart
    index = skipJsonSpace(text, skipJsonValue(text, valueStart))
    if (text.charCodeAt(index) !== CHAR_COMMA)
      break
    index = skipJsonSpace(text, index + 1)
  }
  return found
}

/** at 处是数组时，第 position 项从哪里起。 */
function jsonItemStart(text: string, at: number, position: number): number | undefined {
  if (text.charCodeAt(at) !== CHAR_BRACKET_OPEN)
    return undefined
  let index = skipJsonSpace(text, at + 1)
  for (let item = 0; text.charCodeAt(index) !== CHAR_BRACKET_CLOSE; item++) {
    if (item === position)
      return index
    index = skipJsonSpace(text, skipJsonValue(text, index))
    if (text.charCodeAt(index) !== CHAR_COMMA)
      return undefined
    index = skipJsonSpace(text, index + 1)
  }
  return undefined
}
