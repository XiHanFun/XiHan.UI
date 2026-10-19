import { describe, expect, it } from 'vitest'
import { findOptionViolation } from '../src/options'

describe('选项结构校验', () => {
  it('合法的选项列表没有问题，label 等都可省略', () => {
    expect(findOptionViolation([
      { value: 'a' },
      { value: 'b', label: '乙', disabled: true, tone: 'danger', description: '说明' },
    ])).toBeUndefined()
    expect(findOptionViolation([])).toBeUndefined()
  })

  it('不是数组、元素不是普通对象、value 不是字符串', () => {
    expect(findOptionViolation({})).toEqual({ pointer: '', code: 'not-array' })
    expect(findOptionViolation([{ value: 'a' }, 'b'])).toEqual({ pointer: '/1', code: 'not-object' })
    expect(findOptionViolation([{ label: 'x' }])).toEqual({ pointer: '/0/value', code: 'invalid-value' })
    expect(findOptionViolation([{ value: 1 }])).toEqual({ pointer: '/0/value', code: 'invalid-value' })
  })

  it('各个可选键的类型与语气取值', () => {
    expect(findOptionViolation([{ value: 'a', label: 1 }])?.code).toBe('invalid-label')
    expect(findOptionViolation([{ value: 'a', disabled: 'yes' }])?.code).toBe('invalid-disabled')
    expect(findOptionViolation([{ value: 'a', description: 1 }])?.code).toBe('invalid-description')
    expect(findOptionViolation([{ value: 'a', tone: 'red' }])).toEqual({ pointer: '/0/tone', code: 'invalid-tone' })
  })

  it('要求 label 时缺 label 报 invalid-label', () => {
    expect(findOptionViolation([{ value: 'a' }], { requireLabel: true })).toEqual({ pointer: '/0/label', code: 'invalid-label' })
    expect(findOptionViolation([{ value: 'a', label: '' }], { requireLabel: true })).toBeUndefined()
  })

  it('严格模式下多余的键报 unknown-key，非树形时 children 也算多余', () => {
    expect(findOptionViolation([{ value: 'a', icon: 'x' }])).toBeUndefined()
    expect(findOptionViolation([{ value: 'a', icon: 'x' }], { strict: true })).toEqual({ pointer: '/0/icon', code: 'unknown-key' })
    expect(findOptionViolation([{ value: 'a', children: [] }], { strict: true })).toEqual({ pointer: '/0/children', code: 'unknown-key' })
    expect(findOptionViolation([{ value: 'a', children: [], hasChildren: false }], { strict: true, tree: true })).toBeUndefined()
  })

  it('value 默认同一层不得重复，unique: tree 时整棵树不得重复', () => {
    const items = [{ value: 'a', children: [{ value: 'a' }] }, { value: 'b' }]
    expect(findOptionViolation(items, { tree: true })).toBeUndefined()
    expect(findOptionViolation(items, { tree: true, unique: 'tree' })).toEqual({ pointer: '/0/children/0/value', code: 'duplicate-value' })
    expect(findOptionViolation([{ value: 'a' }, { value: 'a' }])).toEqual({ pointer: '/1/value', code: 'duplicate-value' })
  })

  it('树形：children 必须是数组，hasChildren 必须是布尔，层数有上限', () => {
    expect(findOptionViolation([{ value: 'a', children: {} }], { tree: true })).toEqual({ pointer: '/0/children', code: 'not-array' })
    expect(findOptionViolation([{ value: 'a', hasChildren: 1 }], { tree: true })).toEqual({ pointer: '/0/hasChildren', code: 'invalid-has-children' })
    const deep = { value: 'x', children: [{ value: 'y', children: [{ value: 'z' }] }] }
    expect(findOptionViolation([deep], { tree: true, maxDepth: 3 })).toBeUndefined()
    expect(findOptionViolation([deep], { tree: true, maxDepth: 2 })).toEqual({ pointer: '/0/children/0/children', code: 'too-deep' })
  })

  it('键名里的 ~ 与 / 按 JSON Pointer 转义', () => {
    expect(findOptionViolation([{ 'value': 'a', 'a/b~c': 1 }], { strict: true })).toEqual({ pointer: '/0/a~1b~0c', code: 'unknown-key' })
  })

  it('isValue 放宽 value 的取值：数字、布尔这类选项列表按它判，重复按 Object.is 判', () => {
    const isNumber = (value: unknown): boolean => typeof value === 'number' && Number.isFinite(value)
    expect(findOptionViolation([{ value: 1 }, { value: 2 }], { isValue: isNumber })).toBeUndefined()
    expect(findOptionViolation([{ value: 1 }, { value: '2' }], { isValue: isNumber })).toEqual({ pointer: '/1/value', code: 'invalid-value' })
    expect(findOptionViolation([{ value: 1 }, { value: 1 }], { isValue: isNumber })).toEqual({ pointer: '/1/value', code: 'duplicate-value' })
    expect(findOptionViolation([{ value: 1 }])).toEqual({ pointer: '/0/value', code: 'invalid-value' })
  })
})
