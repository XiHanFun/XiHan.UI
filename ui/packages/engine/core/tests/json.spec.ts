// JSON 工具：普通对象判断、第一处非 JSON 值的 JSON Pointer（含转义、循环与共享引用）、深拷贝不共享引用、按值比较、
// 深冻结、按路径读写（结构共享、补齐中间层、错误码）、路径前缀与文字形式、变化路径。
import type { JsonObject, JsonValue } from '../src/json'
import { describe, expect, it } from 'vitest'
import {
  appendJsonPointer,
  changedJsonPaths,
  cloneJson,
  deepFreeze,
  findJsonViolation,
  formatJsonPath,
  getJsonAt,
  isJsonPathPrefix,
  isJsonValue,
  isPlainObject,
  jsonEquals,
  JsonPathError,
  setJsonAt,
} from '../src/json'

describe('isPlainObject', () => {
  it('只接受原型为 Object.prototype 或 null 的对象', () => {
    expect(isPlainObject({})).toBe(true)
    expect(isPlainObject(Object.create(null))).toBe(true)
    expect(isPlainObject([])).toBe(false)
    expect(isPlainObject(null)).toBe(false)
    expect(isPlainObject(new Date())).toBe(false)
    expect(isPlainObject(new Map())).toBe(false)
    expect(isPlainObject(Object.create({}))).toBe(false)
    expect(isPlainObject('x')).toBe(false)
  })
})

describe('findJsonViolation', () => {
  it('合法 JSON 返回 undefined', () => {
    expect(findJsonViolation({ a: [1, 'x', true, null, { b: -0.5 }] })).toBeUndefined()
    expect(findJsonViolation('text')).toBeUndefined()
    expect(findJsonViolation(Object.create(null))).toBeUndefined()
  })

  it('返回第一处非法值的 JSON Pointer，键名按规范转义', () => {
    expect(findJsonViolation({ a: [1, Number.NaN] })).toBe('/a/1')
    expect(findJsonViolation({ a: { b: undefined } })).toBe('/a/b')
    expect(findJsonViolation({ 'a/b': { '~c': () => 1 } })).toBe('/a~1b/~0c')
    expect(findJsonViolation({ when: new Date() })).toBe('/when')
    expect(findJsonViolation({ big: 1n, sym: Symbol('s') })).toBe('/big')
    expect(findJsonViolation(Infinity, '/x')).toBe('/x')
    expect(findJsonViolation(undefined)).toBe('')
  })

  it('循环引用视为非法，同一对象被多处引用不算循环', () => {
    const cyclic: Record<string, unknown> = { a: 1 }
    cyclic.self = cyclic
    expect(findJsonViolation(cyclic)).toBe('/self')
    const list: unknown[] = []
    list.push(list)
    expect(findJsonViolation(list)).toBe('/0')
    const shared = { v: 1 }
    expect(findJsonViolation({ a: shared, b: [shared, shared] })).toBeUndefined()
  })
})

describe('cloneJson', () => {
  it('深拷贝且不共享引用', () => {
    const source: JsonObject = { a: { b: [1, { c: 2 }] }, d: null }
    const copy = cloneJson(source)
    expect(copy).toEqual(source)
    expect(copy).not.toBe(source)
    expect(copy.a).not.toBe(source.a)
    expect(cloneJson('s')).toBe('s')
    expect(cloneJson(null)).toBe(null)
  })
})

describe('jsonEquals', () => {
  it('对象比较与键顺序无关', () => {
    expect(jsonEquals({ a: 1, b: [1, { c: 2 }] }, { b: [1, { c: 2 }], a: 1 })).toBe(true)
  })

  it('区分数组与对象、长度、缺失键与类型', () => {
    expect(jsonEquals([1], { 0: 1 })).toBe(false)
    expect(jsonEquals([1, 2], [1])).toBe(false)
    expect(jsonEquals({ a: 1 }, { b: 1 })).toBe(false)
    expect(jsonEquals({ a: 1 }, { a: 1, b: 2 })).toBe(false)
    expect(jsonEquals(null, {})).toBe(false)
    expect(jsonEquals(1, '1')).toBe(false)
    expect(jsonEquals(undefined, null)).toBe(false)
    expect(jsonEquals(undefined, undefined)).toBe(true)
  })
})

describe('isJsonValue / appendJsonPointer', () => {
  it('与 findJsonViolation 判定一致', () => {
    expect(isJsonValue({ a: [1, null] })).toBe(true)
    expect(isJsonValue({ a: Number.NaN })).toBe(false)
    expect(isJsonValue(undefined)).toBe(false)
  })

  it('片段里的 ~ 与 / 按规范转义', () => {
    expect(appendJsonPointer('', 'a/b')).toBe('/a~1b')
    expect(appendJsonPointer('/x', '~0')).toBe('/x/~00')
    expect(appendJsonPointer('/x', 3)).toBe('/x/3')
  })
})

describe('deepFreeze', () => {
  it('冻结整棵对象与数组并返回同一个值', () => {
    const value = { a: { b: [1, { c: 2 }] } }
    expect(deepFreeze(value)).toBe(value)
    expect(Object.isFrozen(value.a.b[1])).toBe(true)
    expect(deepFreeze('x')).toBe('x')
  })

  it('已冻结的对象不再进入', () => {
    const inner = { c: 1 }
    const outer = Object.freeze({ inner })
    deepFreeze({ outer })
    expect(Object.isFrozen(inner)).toBe(false)
  })
})

describe('getJsonAt', () => {
  const root: JsonValue = { 'lines': [{ price: 1 }], 'flag': false, 'a b': null }

  it('字符串段进对象自有键，数字段进数组下标', () => {
    expect(getJsonAt(root, ['lines', 0, 'price'])).toBe(1)
    expect(getJsonAt(root, ['flag'])).toBe(false)
    expect(getJsonAt(root, ['a b'])).toBe(null)
    expect(getJsonAt(root, [])).toBe(root)
  })

  it('路径不存在时为 undefined', () => {
    expect(getJsonAt(root, ['lines', 1])).toBeUndefined()
    expect(getJsonAt(root, ['lines', '0'])).toBeUndefined()
    expect(getJsonAt(root, ['flag', 'x'])).toBeUndefined()
    expect(getJsonAt(root, ['toString'])).toBeUndefined()
    expect(getJsonAt(undefined, ['a'])).toBeUndefined()
  })

  it('负数、小数与原型键不合法', () => {
    for (const path of [['lines', -1], ['lines', 0.5], ['__proto__'], ['prototype'], ['constructor']])
      expect(() => getJsonAt(root, path)).toThrow('invalid-path')
  })
})

describe('setJsonAt', () => {
  it('返回新根与原值，未改动的分支沿用原引用', () => {
    const root: JsonObject = { a: { b: 1 }, keep: { k: true }, list: [{ x: 1 }, { y: 2 }] }
    const result = setJsonAt(root, ['a', 'b'], 2)
    expect(result).toEqual({ root: { a: { b: 2 }, keep: { k: true }, list: [{ x: 1 }, { y: 2 }] }, previous: 1 })
    expect(result.root.keep).toBe(root.keep)
    expect(root).toEqual({ a: { b: 1 }, keep: { k: true }, list: [{ x: 1 }, { y: 2 }] })

    const replaced = setJsonAt(root, ['list', 1, 'y'], 3)
    expect((replaced.root.list as JsonObject[])[0]).toBe((root.list as JsonObject[])[0])
    expect(setJsonAt(root, ['list', 0], 'x')).toEqual({ root: { ...root, list: ['x', { y: 2 }] }, previous: { x: 1 } })
  })

  it('没有变化时返回同一个根', () => {
    const root: JsonObject = { a: { b: [1] } }
    expect(setJsonAt(root, ['a', 'b'], [1]).root).toBe(root)
    expect(setJsonAt(root, ['missing'], undefined)).toEqual({ root, previous: undefined })
    expect(setJsonAt(root, ['x', 'y'], undefined, { createMissing: true }).root).toBe(root)
  })

  it('undefined 删除对象键，不能删除数组项', () => {
    expect(setJsonAt({ a: 1, b: 2 }, ['a'], undefined)).toEqual({ root: { b: 2 }, previous: 1 })
    expect(() => setJsonAt({ a: [1] }, ['a', 0], undefined)).toThrow('invalid-value')
  })

  it('缺少中间层时报错，显式要求时按空对象补齐', () => {
    expect(() => setJsonAt({}, ['a', 'b'], 1)).toThrow('path-not-found')
    expect(setJsonAt({ k: 0 }, ['a', 'b', 'c'], 1, { createMissing: true })).toEqual({ root: { k: 0, a: { b: { c: 1 } } }, previous: undefined })
    expect(() => setJsonAt({}, ['a', 0], 1, { createMissing: true })).toThrow('path-not-found')
    expect(() => setJsonAt({}, ['a', 0, 'b'], 1, { createMissing: true })).toThrow('path-not-found')
    expect(() => setJsonAt({ a: 1 }, ['a', 'b'], 1, { createMissing: true })).toThrow('path-not-found')
  })

  it('路径与值的错误码', () => {
    expect(() => setJsonAt({}, [], 1)).toThrow('invalid-path')
    expect(() => setJsonAt({}, ['__proto__'], 1)).toThrow('invalid-path')
    expect(() => setJsonAt({ a: [1] }, ['a', 1], 2)).toThrow('path-not-found')
    expect(() => setJsonAt({ a: [1] }, ['a', 'x'], 2)).toThrow('path-not-found')
    expect(() => setJsonAt({ a: {} }, ['a', 0], 2)).toThrow('path-not-found')
    expect(() => setJsonAt({}, ['a'], Number.NaN)).toThrow('invalid-value')
    let thrown: unknown
    try {
      setJsonAt({}, ['a', 'b'], 1)
    }
    catch (error) {
      thrown = error
    }
    expect(thrown).toBeInstanceOf(JsonPathError)
    expect(thrown).toMatchObject({ name: 'JsonPathError', code: 'path-not-found', path: ['a', 'b'], message: 'path-not-found' })
  })
})

describe('isJsonPathPrefix / formatJsonPath', () => {
  it('前缀含相等，段的类型也要一致', () => {
    expect(isJsonPathPrefix(['a', 0, 'b'], ['a', 0])).toBe(true)
    expect(isJsonPathPrefix(['a', 0], ['a', 0])).toBe(true)
    expect(isJsonPathPrefix(['a', 0], [])).toBe(true)
    expect(isJsonPathPrefix(['a', 0], ['a', '0'])).toBe(false)
    expect(isJsonPathPrefix(['a'], ['a', 0])).toBe(false)
  })

  it('标识符键用点，下标与其它键用方括号', () => {
    expect(formatJsonPath(['lines', 1, 'price'])).toBe('lines[1].price')
    expect(formatJsonPath([0, '字段', 'a b', '$x'])).toBe('[0].字段["a b"].$x')
    expect(formatJsonPath(['1a', 'b'])).toBe('["1a"].b')
    expect(formatJsonPath([])).toBe('')
  })
})

describe('changedJsonPaths', () => {
  it('对象逐键、等长数组逐项比较，长度变了的数组整体报出', () => {
    const before: JsonValue = { a: 1, b: { c: [1, 2], d: [1] }, e: 'x' }
    const after: JsonValue = { a: 1, b: { c: [1, 3], d: [1, 2] }, f: true }
    expect(changedJsonPaths(before, after)).toEqual([['b', 'c', 1], ['b', 'd'], ['e'], ['f']])
  })

  it('相等时为空，根上类型不同时报空路径', () => {
    expect(changedJsonPaths({ a: [1] }, { a: [1] })).toEqual([])
    expect(changedJsonPaths({ a: 1 }, [1])).toEqual([[]])
    expect(changedJsonPaths(undefined, 1)).toEqual([[]])
  })

  it('只比较自有键', () => {
    expect(changedJsonPaths({ constructor: 1 }, {})).toEqual([['constructor']])
    expect(changedJsonPaths({}, { toString: 'x' })).toEqual([['toString']])
  })
})
