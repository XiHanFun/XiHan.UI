// 结构校验：问题的严重程度与 withSeverity、问题收集器，以及各读取器在类型、必填、未知键、范围、选项、JSON 与键重复上的问题码。
import type { CommonIssueCode, SchemaIssue } from '../src/schema'
import { describe, expect, it } from 'vitest'
import {
  checkUniqueKeys,
  createIssueSink,
  hasErrors,
  issueSeverity,
  readArray,
  readBoolean,
  readJson,
  readNumber,
  readObject,
  readOneOf,
  readString,
  withSeverity,
} from '../src/schema'

describe('严重程度', () => {
  it('没写时为 error', () => {
    expect(issueSeverity({ code: 'x', path: [] })).toBe('error')
    expect(hasErrors([{ code: 'x', path: [], severity: 'warning' }])).toBe(false)
    expect(hasErrors([{ code: 'x', path: [], severity: 'warning' }, { code: 'y', path: [] }])).toBe(true)
  })

  it('overrides 优先，其次问题自己写的，再次 table；off 的去掉', () => {
    type Code = 'node.isolated' | 'node.unreachable' | 'edge.dangling' | 'type.max-count'
    const issues: SchemaIssue<Code>[] = [
      { code: 'node.isolated', path: ['nodes', 0] },
      { code: 'node.unreachable', path: ['nodes', 1], severity: 'error' },
      { code: 'edge.dangling', path: ['edges', 0] },
      { code: 'type.max-count', path: [] },
    ]
    const table = { 'node.isolated': 'warning', 'node.unreachable': 'warning' } as const
    expect(withSeverity(issues, table, { 'type.max-count': 'off' })).toEqual([
      { code: 'node.isolated', path: ['nodes', 0], severity: 'warning' },
      { code: 'node.unreachable', path: ['nodes', 1], severity: 'error' },
      { code: 'edge.dangling', path: ['edges', 0], severity: 'error' },
    ])
    expect(withSeverity(issues, table, { 'node.unreachable': 'warning' })[1]!.severity).toBe('warning')
  })
})

describe('createIssueSink', () => {
  it('收集问题，路径另存一份；缺省 target 写进没有自带 target 的问题', () => {
    const sink = createIssueSink<CommonIssueCode | 'node.unreachable'>({ target: { kind: 'node', id: 'a' } })
    const path: (string | number)[] = ['nodes', 0]
    sink.report('required', path)
    path.push('mutated')
    sink.report('node.unreachable', ['nodes', 1], { target: { kind: 'node', id: 'b' }, severity: 'warning', params: { from: ['start'] } })
    expect(sink.issues).toEqual([
      { code: 'required', path: ['nodes', 0], target: { kind: 'node', id: 'a' } },
      { code: 'node.unreachable', path: ['nodes', 1], target: { kind: 'node', id: 'b' }, severity: 'warning', params: { from: ['start'] } },
    ])
  })
})

describe('读取器', () => {
  it('readObject：类型、必填与未知键；undefined 视为缺省', () => {
    const sink = createIssueSink()
    const node = { id: 'a', type: undefined, extra: 1 }
    expect(readObject(sink, node, ['nodes', 0], { required: ['id', 'type', 'x'], allowed: ['id', 'type', 'x'] })).toBe(node)
    expect(readObject(sink, [], ['data'])).toBeUndefined()
    expect(readObject(sink, undefined, ['skip'], { required: ['a'] })).toBeUndefined()
    expect(sink.issues).toEqual([
      { code: 'unknown-key', path: ['nodes', 0, 'extra'] },
      { code: 'required', path: ['nodes', 0, 'type'] },
      { code: 'required', path: ['nodes', 0, 'x'] },
      { code: 'invalid-type', path: ['data'], params: { expected: 'object' } },
    ])
  })

  it('readArray、readString、readBoolean', () => {
    const sink = createIssueSink()
    expect(readArray(sink, [1], ['a'])).toEqual([1])
    expect(readArray(sink, {}, ['b'])).toBeUndefined()
    expect(readString(sink, '', ['c'])).toBe('')
    expect(readString(sink, '', ['d'], { nonEmpty: true })).toBeUndefined()
    expect(readString(sink, 1, ['e'])).toBeUndefined()
    expect(readBoolean(sink, true, ['f'])).toBe(true)
    expect(readBoolean(sink, 0, ['g'])).toBeUndefined()
    expect(sink.issues.map(issue => [issue.code, issue.path[0], issue.params?.expected])).toEqual([
      ['invalid-type', 'b', 'array'],
      ['empty', 'd', undefined],
      ['invalid-type', 'e', 'string'],
      ['invalid-type', 'g', 'boolean'],
    ])
  })

  it('readNumber：有限数字、整数与范围，越界时参数带上界限', () => {
    const sink = createIssueSink()
    expect(readNumber(sink, 3, ['a'], { integer: true, min: 0, max: 3 })).toBe(3)
    expect(readNumber(sink, Number.NaN, ['b'])).toBeUndefined()
    expect(readNumber(sink, 1.5, ['c'], { integer: true })).toBeUndefined()
    expect(readNumber(sink, 0, ['d'], { exclusiveMin: 0, max: 9 })).toBeUndefined()
    expect(sink.issues).toEqual([
      { code: 'invalid-type', path: ['b'], params: { expected: 'number' } },
      { code: 'not-integer', path: ['c'] },
      { code: 'out-of-range', path: ['d'], params: { max: 9, exclusiveMin: 0 } },
    ])
  })

  it('readOneOf 与 readJson', () => {
    const sink = createIssueSink()
    expect(readOneOf(sink, 'TB', ['direction'], ['TB', 'LR'] as const)).toBe('TB')
    expect(readOneOf(sink, 'XX', ['direction'], ['TB', 'LR'])).toBeUndefined()
    expect(readJson(sink, { a: [1] }, ['data'])).toEqual({ a: [1] })
    expect(readJson(sink, { a: [1, Number.NaN] }, ['data'])).toBeUndefined()
    expect(sink.issues).toEqual([
      { code: 'invalid-option', path: ['direction'], params: { choices: ['TB', 'LR'] } },
      { code: 'invalid-value', path: ['data'], params: { pointer: '/a/1' } },
    ])
  })

  it('checkUniqueKeys：第二次及以后出现的键报问题，没有键的项不参与', () => {
    const sink = createIssueSink()
    const items = [{ id: 'a' }, { id: 'b' }, {}, { id: 'a' }, { id: 'a' }]
    expect(checkUniqueKeys(sink, items, ['nodes'], item => (item as { id?: string }).id, 'duplicate-id')).toBe(false)
    expect(checkUniqueKeys(sink, [{ id: 'x' }], ['edges'], item => item.id)).toBe(true)
    expect(sink.issues).toEqual([
      { code: 'duplicate-id', path: ['nodes', 3], params: { key: 'a' } },
      { code: 'duplicate-id', path: ['nodes', 4], params: { key: 'a' } },
    ])
  })
})
