// 属性描述模型：判空、显示条件、给描述加路径前缀、分组、内建编辑方式的取值检查、按描述检查对象、写入缺省值与编辑器查找。
import type { JsonObject } from '@xihan-ui/core/json'
import type { PropertyControl, PropertyDescriptor } from '../src/properties'
import { describe, expect, it } from 'vitest'
import {
  applyDefaults,
  checkProperties,
  checkPropertyValue,
  evaluateCondition,
  groupProperties,
  isFilled,
  isPropertyVisible,
  nestProperties,
  resolvePropertyEditor,
} from '../src/properties'

describe('isFilled', () => {
  it('undefined、null、空串、空数组与空对象算未填', () => {
    for (const empty of [undefined, null, '', [], {}])
      expect(isFilled(empty)).toBe(false)
    for (const filled of [0, false, 'x', [0], { a: null }])
      expect(isFilled(filled)).toBe(true)
  })
})

describe('evaluateCondition / isPropertyVisible', () => {
  const target: JsonObject = { mode: 'Fallback', count: 2, rules: [], data: { tags: ['a'] } }

  it('equals、oneOf、filled 按路径取值，按 JSON 值比较', () => {
    expect(evaluateCondition({ path: ['mode'], equals: 'Fallback' }, target)).toBe(true)
    expect(evaluateCondition({ path: ['data'], equals: { tags: ['a'] } }, target)).toBe(true)
    expect(evaluateCondition({ path: ['count'], equals: '2' }, target)).toBe(false)
    expect(evaluateCondition({ path: ['count'], oneOf: [1, 2] }, target)).toBe(true)
    expect(evaluateCondition({ path: ['rules'], filled: true }, target)).toBe(false)
    expect(evaluateCondition({ path: ['data', 'tags', 0], equals: 'a' }, target)).toBe(true)
    expect(evaluateCondition({ path: ['missing'], filled: false }, undefined)).toBe(true)
  })

  it('all、any、not 组合，空 all 为真、空 any 为假', () => {
    expect(evaluateCondition({ all: [{ path: ['mode'], equals: 'Fallback' }, { path: ['count'], equals: 3 }] }, target)).toBe(false)
    expect(evaluateCondition({ any: [{ path: ['mode'], equals: 'x' }, { path: ['data', 'tags'], filled: true }] }, target)).toBe(true)
    expect(evaluateCondition({ not: { path: ['mode'], equals: 'Fallback' } }, target)).toBe(false)
    expect(evaluateCondition({ all: [] }, target)).toBe(true)
    expect(evaluateCondition({ any: [] }, target)).toBe(false)
  })

  it('没有显示条件时总是显示', () => {
    const fallback: PropertyDescriptor = { path: ['fallback'], control: { kind: 'json' }, visibleWhen: { path: ['mode'], equals: 'Fallback' } }
    expect(isPropertyVisible(fallback, target)).toBe(true)
    expect(isPropertyVisible(fallback, { mode: 'Fault' })).toBe(false)
    expect(isPropertyVisible({ path: ['x'], control: { kind: 'text' } }, undefined)).toBe(true)
  })
})

describe('nestProperties', () => {
  it('path 与显示条件里的 path 都接上前缀，组合条件逐层改写，其余字段原样保留', () => {
    type Extended = PropertyDescriptor & { readonly present: boolean }
    const descriptors: Extended[] = [
      { path: ['visible'], control: { kind: 'boolean' }, group: 'table', present: true },
      { path: ['height'], control: { kind: 'number', min: 0 }, present: false, visibleWhen: { all: [{ path: ['visible'], equals: true }, { not: { path: ['style'], filled: false } }, { any: [{ path: ['mode'], oneOf: ['a', 'b'] }] }] } },
    ]
    const nested = nestProperties(['header'], descriptors)
    expect(nested[0]).toEqual({ path: ['header', 'visible'], control: { kind: 'boolean' }, group: 'table', present: true })
    expect(nested[1]!.visibleWhen).toEqual({ all: [{ path: ['header', 'visible'], equals: true }, { not: { path: ['header', 'style'], filled: false } }, { any: [{ path: ['header', 'mode'], oneOf: ['a', 'b'] }] }] })
    expect(nested[1]!.present).toBe(false)
    expect(descriptors[0]!.path).toEqual(['visible'])
    const target = { header: { visible: true, style: { a: 1 }, mode: 'a' } }
    expect(isPropertyVisible(nested[1]!, target)).toBe(true)
  })
})

describe('groupProperties', () => {
  const descriptors: PropertyDescriptor[] = [
    { path: ['title'], control: { kind: 'text' }, group: 'basic' },
    { path: ['note'], control: { kind: 'text', multiline: true } },
    { path: ['form'], control: { kind: 'json' }, group: 'form' },
    { path: ['strategy'], control: { kind: 'select', options: [{ value: 'Fault' }, { value: 'Fallback' }] }, group: 'participants' },
    { path: ['fallback'], control: { kind: 'json' }, group: 'participants', visibleWhen: { path: ['strategy'], equals: 'Fallback' } },
    { path: ['extra'], control: { kind: 'text' }, group: 'advanced' },
  ]

  it('order 里的组在前，其余按出现先后，无组排最后；隐藏的属性与空组不出现', () => {
    const groups = groupProperties(descriptors, { strategy: 'Fault' }, ['participants', 'basic', 'missing'])
    expect(groups.map(group => [group.group, group.properties.map(item => item.path.join('.'))])).toEqual([
      ['participants', ['strategy']],
      ['basic', ['title']],
      ['form', ['form']],
      ['advanced', ['extra']],
      [undefined, ['note']],
    ])
    expect(groupProperties([descriptors[4]!], {})).toEqual([])
  })
})

describe('checkPropertyValue', () => {
  const cases: [PropertyControl, unknown, string | undefined][] = [
    [{ kind: 'text' }, 'a', undefined],
    [{ kind: 'text' }, 1, 'invalid-type'],
    [{ kind: 'number', min: 0, max: 10 }, 10, undefined],
    [{ kind: 'number', min: 0 }, -1, 'out-of-range'],
    [{ kind: 'number', exclusiveMin: 0 }, 0, 'out-of-range'],
    [{ kind: 'number', integer: true }, 1.5, 'not-integer'],
    [{ kind: 'number' }, '1', 'invalid-type'],
    [{ kind: 'boolean' }, false, undefined],
    [{ kind: 'boolean' }, 'true', 'invalid-type'],
    [{ kind: 'select', options: [{ value: 'a' }, { value: 1 }] }, 1, undefined],
    [{ kind: 'select', options: [{ value: 'a' }] }, 'b', 'invalid-option'],
    [{ kind: 'select', options: [{ value: 'a' }, { value: 'b' }], multiple: true }, ['a', 'b'], undefined],
    [{ kind: 'select', options: [{ value: 'a' }], multiple: true }, ['a', 'c'], 'invalid-option'],
    [{ kind: 'select', options: [{ value: 'a' }], multiple: true }, 'a', 'invalid-type'],
    [{ kind: 'select', options: [{ value: 'a' }], appearance: 'toggle' }, 'b', 'invalid-option'],
    [{ kind: 'tags' }, ['x', 'y'], undefined],
    [{ kind: 'tags' }, ['x', 1], 'invalid-type'],
    [{ kind: 'color' }, '#1a2B3c', undefined],
    [{ kind: 'color' }, '#abcd', undefined],
    [{ kind: 'color' }, 'transparent', undefined],
    [{ kind: 'color' }, 'red', 'invalid-color'],
    [{ kind: 'color' }, ' #fff', 'invalid-color'],
    [{ kind: 'color' }, '#12345', 'invalid-color'],
    [{ kind: 'json' }, { any: [1] }, undefined],
  ]
  it('内建编辑方式的取值约束', () => {
    for (const [control, value, code] of cases)
      expect(checkPropertyValue(control, value as never), JSON.stringify([control, value])).toBe(code)
  })
})

describe('checkProperties', () => {
  type Control = PropertyControl | { readonly kind: 'assignees' }
  const descriptors: PropertyDescriptor<Control>[] = [
    { path: ['label'], control: { kind: 'text' }, required: true },
    { path: ['data', 'count'], control: { kind: 'number', integer: true } },
    { path: ['data', 'rules'], control: { kind: 'assignees' }, required: true },
    { path: ['data', 'fallback'], control: { kind: 'assignees' }, required: true, visibleWhen: { path: ['data', 'mode'], equals: 'Fallback' } },
  ]

  it('只看显示中的属性：必填未填报 required，内建取值不合法报对应码，产品的编辑方式交给 checkCustom', () => {
    const target: JsonObject = { label: '', data: { count: 1.5, rules: [{ kind: 'x' }], mode: 'Fault' } }
    const issues = checkProperties(descriptors, target, {
      path: ['nodes', 3],
      target: { kind: 'node', id: 'approve' },
      checkCustom: (_, value) => (Array.isArray(value) && value.every(item => typeof item === 'object' && item !== null && 'id' in item) ? undefined : 'invalid-value'),
    })
    expect(issues).toEqual([
      { code: 'required', path: ['nodes', 3, 'label'], target: { kind: 'node', id: 'approve' } },
      { code: 'not-integer', path: ['nodes', 3, 'data', 'count'], target: { kind: 'node', id: 'approve' } },
      { code: 'invalid-value', path: ['nodes', 3, 'data', 'rules'], target: { kind: 'node', id: 'approve' } },
    ])
  })

  it('没有 checkCustom 时不检查产品编辑方式的取值；缺省路径为空', () => {
    expect(checkProperties(descriptors, { label: 'a', data: { rules: 1, mode: 'Fallback' } })).toEqual([
      { code: 'required', path: ['data', 'fallback'] },
    ])
  })
})

describe('applyDefaults', () => {
  it('只写入还没有值的路径，补齐中间层；没有可写的返回同一对象', () => {
    const descriptors: PropertyDescriptor[] = [
      { path: ['data', 'mode'], control: { kind: 'text' }, default: 'Any' },
      { path: ['label'], control: { kind: 'text' }, default: '审批' },
      { path: ['data', 'count'], control: { kind: 'number' } },
    ]
    expect(applyDefaults({ label: '已有' }, descriptors)).toEqual({ label: '已有', data: { mode: 'Any' } })
    const full: JsonObject = { label: 'x', data: { mode: 'All' } }
    expect(applyDefaults(full, descriptors)).toBe(full)
  })
})

describe('resolvePropertyEditor', () => {
  const table = {
    byControl: { text: 'text-editor', json: 'json-editor' },
    byPath: { 'data.rules': 'rules-editor' },
    byTarget: { UserTask: { 'data.rules': 'assignee-editor' } },
  }

  it('对象种类 + 路径 → 路径 → 编辑方式，依次查找', () => {
    const rules: PropertyDescriptor = { path: ['data', 'rules'], control: { kind: 'json' } }
    expect(resolvePropertyEditor(table, 'UserTask', rules)).toBe('assignee-editor')
    expect(resolvePropertyEditor(table, 'Http', rules)).toBe('rules-editor')
    expect(resolvePropertyEditor(table, 'Http', { path: ['label'], control: { kind: 'text' } })).toBe('text-editor')
    expect(resolvePropertyEditor(table, 'Http', { path: ['on'], control: { kind: 'boolean' } })).toBeUndefined()
    expect(resolvePropertyEditor(table, 'toString', { path: ['constructor', 'x'], control: { kind: 'tags' } })).toBeUndefined()
  })
})
