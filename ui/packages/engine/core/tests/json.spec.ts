// JSON 工具：普通对象判断、第一处非 JSON 值的 JSON Pointer（含转义、循环与共享引用）、深拷贝不共享引用、按值比较、
// 深冻结、按路径读写（结构共享、补齐中间层、错误码）、路径前缀、路径的文字形式与解析（往返、非法文本、原型段）、变化路径、
// 带出错位置的 JSON 文本解析、按路径在 JSON 文本里找值的位置。
import type { JsonObject, JsonPathSegment, JsonValue } from '../src/json'
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
  isJsonPathText,
  isJsonValue,
  isPlainObject,
  jsonEquals,
  JsonPathError,
  locateJsonPath,
  parseJsonPath,
  parseJsonText,
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

describe('parseJsonPath / isJsonPathText', () => {
  it('解析标识符、下标与方括号里的 JSON 字符串键', () => {
    expect(parseJsonPath('order.items[0].name')).toEqual(['order', 'items', 0, 'name'])
    expect(parseJsonPath('[0].字段["a b"].$x')).toEqual([0, '字段', 'a b', '$x'])
    expect(parseJsonPath('["1a"].b')).toEqual(['1a', 'b'])
    expect(parseJsonPath('$page')).toEqual(['$page'])
    expect(parseJsonPath('$row.amount')).toEqual(['$row', 'amount'])
    expect(parseJsonPath('a["x\\"]y"]["\\u0041"]')).toEqual(['a', 'x"]y', 'A'])
    expect(parseJsonPath('[""]')).toEqual([''])
    expect(parseJsonPath('')).toEqual([])
  })

  it('$ 开头的标识符原样写出，与解析互逆', () => {
    expect(formatJsonPath(['$page'])).toBe('$page')
    expect(formatJsonPath(['$row', 'amount', 0])).toBe('$row.amount[0]')
    expect(parseJsonPath(formatJsonPath(['$row', 'amount', 0]))).toEqual(['$row', 'amount', 0])
  })

  it('任意路径写出后再解析得到原路径', () => {
    let seed = 7
    const random = (): number => {
      seed = (seed * 1103515245 + 12345) % 2147483648
      return seed / 2147483648
    }
    const keys = ['a', 'items', '字段', '$page', '_x', 'a b', '1a', '', 'x.y', '[0]', 'q"uote', 'back\\slash', '😀', 'line\nbreak', 'é']
    for (let run = 0; run < 500; run++) {
      const path: JsonPathSegment[] = Array.from({ length: Math.floor(random() * 6) }, () =>
        random() < 0.3 ? Math.floor(random() * 1000) : keys[Math.floor(random() * keys.length)]!)
      expect(parseJsonPath(formatJsonPath(path))).toEqual(path)
    }
  })

  it('文本不合法时抛 invalid-path', () => {
    const bad = ['.a', 'a.', 'a..b', 'a b', 'a-b', '1a', '[01]', '[-1]', '[1.5]', '[ 0]', '[]', '[0', '[0]a', 'a[', '["a"', '["a"]]', '["a"x]', '[\'a\']', '[9007199254740992]', 'a[0]b', '[a]']
    for (const text of bad) {
      expect(() => parseJsonPath(text), text).toThrow('invalid-path')
      expect(isJsonPathText(text), text).toBe(false)
    }
    let thrown: unknown
    try {
      parseJsonPath('a.')
    }
    catch (error) {
      thrown = error
    }
    expect(thrown).toBeInstanceOf(JsonPathError)
  })

  it('原型段一律拒绝，写成标识符或方括号都一样', () => {
    for (const text of ['__proto__', 'a.__proto__', 'prototype', 'a.constructor', '["__proto__"]', 'a["constructor"]'])
      expect(isJsonPathText(text), text).toBe(false)
  })

  it('格式检查不抛异常', () => {
    expect(isJsonPathText('order.items[0].name')).toBe(true)
    expect(isJsonPathText('')).toBe(true)
    expect(isJsonPathText('a..b')).toBe(false)
    expect(isJsonPathText(1 as unknown as string)).toBe(false)
  })
})

describe('parseJsonText', () => {
  it('合法文本与 JSON.parse 的结果相同', () => {
    const texts = [
      '{"no":"SO-001","items":[{"qty":2,"price":-1.5e2}],"ok":true,"note":null}',
      ' [ 1 , 2.5 , -0 , 1E+3 , 0.001 ] ',
      '"\\u4e2d\\n\\"\\\\\\/\\b\\f\\r\\t"',
      '\r\n\t{}\n',
      '0',
      'false',
    ]
    for (const text of texts)
      expect(parseJsonText(text), text).toEqual({ ok: true, value: JSON.parse(text) as JsonValue })
  })

  it('__proto__ 键照 JSON.parse 落成自有属性，不改原型', () => {
    const result = parseJsonText('{"__proto__":{"x":1}}')
    expect(result.ok).toBe(true)
    const value = (result as { readonly value: Record<string, unknown> }).value
    expect(Object.getPrototypeOf(value)).toBe(Object.prototype)
    expect(Object.hasOwn(value, '__proto__')).toBe(true)
    expect(isJsonValue(value)).toBe(true)
  })

  it('失败时给出原因码与出错处的下标、行与列', () => {
    const cases: Array<[string, string, number, number, number]> = [
      ['', 'unexpected-end', 0, 1, 1],
      ['   ', 'unexpected-end', 3, 1, 4],
      ['{"a":1,}', 'unexpected-token', 7, 1, 8],
      ['[1,]', 'unexpected-token', 3, 1, 4],
      ['[1,2', 'unexpected-end', 4, 1, 5],
      ['{"a" 1}', 'unexpected-token', 5, 1, 6],
      ['{a:1}', 'unexpected-token', 1, 1, 2],
      ['{"a":1 "b":2}', 'unexpected-token', 7, 1, 8],
      ['{} x', 'unexpected-token', 3, 1, 4],
      ['"a\tb"', 'invalid-string', 2, 1, 3],
      ['"\\x"', 'invalid-string', 2, 1, 3],
      ['"\\u12g4"', 'invalid-string', 5, 1, 6],
      ['"\\u12', 'unexpected-end', 5, 1, 6],
      ['"abc', 'unexpected-end', 4, 1, 5],
      ['01', 'invalid-number', 1, 1, 2],
      ['-', 'unexpected-end', 1, 1, 2],
      ['-a', 'invalid-number', 1, 1, 2],
      ['1.', 'unexpected-end', 2, 1, 3],
      ['1.e3', 'invalid-number', 2, 1, 3],
      ['1e', 'unexpected-end', 2, 1, 3],
      ['1e+x', 'invalid-number', 3, 1, 4],
      ['.5', 'unexpected-token', 0, 1, 1],
      ['tru', 'unexpected-end', 3, 1, 4],
      ['trux', 'unexpected-token', 3, 1, 4],
      ['NaN', 'unexpected-token', 0, 1, 1],
      ['// 注释\n{}', 'unexpected-token', 0, 1, 1],
      ['{\'a\':1}', 'unexpected-token', 1, 1, 2],
      ['﻿{}', 'unexpected-token', 0, 1, 1],
      ['{\n  "a": 1,\n  "b": }', 'unexpected-token', 19, 3, 8],
      ['[\r\n1,\r\n]', 'unexpected-token', 7, 3, 1],
      ['[\r1,\r]', 'unexpected-token', 5, 3, 1],
    ]
    for (const [text, code, offset, line, column] of cases)
      expect(parseJsonText(text), JSON.stringify(text)).toEqual({ ok: false, code, offset, line, column })
  })

  it('逐个删去或改写一个字符：成败与 JSON.parse 一致', () => {
    const sample = '{"no":"SO-1","n":-12.5e-3,"t":true,"f":false,"z":null,"a":[1,{"b":"\\u00e9\\n"}],"e":{}}'
    const replacements = ['', ' ', '"', ',', ':', '[', ']', '{', '}', '0', '-', '.', 'e', 'x', '\\', '\n']
    let checked = 0
    for (let index = 0; index < sample.length; index++) {
      for (const replacement of replacements) {
        const text = sample.slice(0, index) + replacement + sample.slice(index + 1)
        let native = true
        try {
          JSON.parse(text)
        }
        catch {
          native = false
        }
        expect(parseJsonText(text).ok, JSON.stringify(text)).toBe(native)
        checked++
      }
    }
    expect(checked).toBe(sample.length * replacements.length)
  })
})

describe('locateJsonPath', () => {
  const value: JsonValue = {
    'title': 'Order',
    'nodes': [
      { id: 'a', label: 'Start', tags: ['x', '[{"}]'] },
      { id: 'b', label: 'B', size: { w: -1.5e2, h: 0 }, on: true, off: null },
    ],
    'a"b': { é: [[], {}] },
  }
  const paths: JsonPathSegment[][] = []
  const collect = (node: JsonValue, path: JsonPathSegment[]): void => {
    paths.push(path)
    if (Array.isArray(node))
      node.forEach((item, index) => collect(item, [...path, index]))
    else if (isPlainObject(node))
      Object.entries(node as JsonObject).forEach(([key, item]) => collect(item, [...path, key]))
  }
  collect(value, [])

  it('紧凑与缩进两种写法里，每条路径找出的那段文字解析回来都是该处的值', () => {
    for (const text of [JSON.stringify(value), JSON.stringify(value, null, 2), JSON.stringify(value, null, '\t').replaceAll('\n', '\r\n')]) {
      for (const path of paths) {
        const found = locateJsonPath(text, path)!
        expect(JSON.parse(text.slice(found.start, found.end)), JSON.stringify(path)).toEqual(getJsonAt(value, path))
      }
    }
  })

  it('给出起点的行与列；空路径是去掉首尾空白后的整个值', () => {
    const text = JSON.stringify(value, null, 2)
    expect(locateJsonPath(text, ['nodes', 1, 'label'])).toEqual({ start: text.indexOf('"B"'), end: text.indexOf('"B"') + 3, line: 14, column: 16 })
    expect(locateJsonPath(`\n  ${text}\n`, [])).toMatchObject({ start: 3, end: text.length + 3, line: 2, column: 3 })
    expect(locateJsonPath('{\r\n"a":\r\n  1}', ['a'])).toEqual({ start: 11, end: 12, line: 3, column: 3 })
  })

  it('键按转义后的文字比较；重复的键取最后一个，与 JSON.parse 一致', () => {
    const text = '{"k":1,"\\u006b":2,"k":{"x":3}}'
    expect(text.slice(locateJsonPath(text, ['k'])!.start)).toBe('{"x":3}}')
    expect(locateJsonPath(text, ['k', 'x'])).toMatchObject({ start: text.length - 3, end: text.length - 2 })
  })

  it('路径走不通或文本不合法时为 undefined', () => {
    const text = JSON.stringify(value)
    expect([
      locateJsonPath(text, ['missing']),
      locateJsonPath(text, ['nodes', 2]),
      locateJsonPath(text, ['nodes', -1]),
      locateJsonPath(text, ['nodes', 'length']),
      locateJsonPath(text, ['title', 0]),
      locateJsonPath(text, ['nodes', 0, 'id', 'x']),
      locateJsonPath('[]', [0]),
      locateJsonPath('{"a":1,}', ['a']),
      locateJsonPath('', []),
    ]).toEqual(Array.from({ length: 9 }).fill(undefined))
  })
})
