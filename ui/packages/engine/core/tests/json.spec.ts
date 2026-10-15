// JSON 工具：普通对象判断、第一处非 JSON 值的 JSON Pointer（含转义、循环与共享引用）、深拷贝不共享引用、按值比较。
import type { JsonObject } from '../src/json'
import { describe, expect, it } from 'vitest'
import { cloneJson, findJsonViolation, isPlainObject, jsonEquals } from '../src/json'

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
