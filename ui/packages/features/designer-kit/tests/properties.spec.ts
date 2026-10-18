// 属性描述模型：判空、显示条件、给描述加路径前缀、分组、内建编辑方式的取值检查、按描述检查对象、写入缺省值与编辑器查找。
import type { JsonObject, JsonValue } from '@xihan-ui/core/json'
import type { PropertyControl, PropertyDescriptor } from '../src/properties'
import { describe, expect, it } from 'vitest'
import {
  applyDefaults,
  checkProperties,
  checkPropertyValue,
  evaluateCondition,
  findPropertyValueIssue,
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
    [{ kind: 'dataField' }, 'customer.name', undefined],
    [{ kind: 'dataField', kinds: ['list'], base: ['order'] }, 'items', undefined],
    [{ kind: 'dataField' }, '', undefined],
    [{ kind: 'dataField' }, 'a..b', 'invalid-value'],
    [{ kind: 'dataField' }, ['customer'], 'invalid-type'],
    [{ kind: 'sides', min: 0 }, { top: 1, right: 2, bottom: 0, left: 4 }, undefined],
    [{ kind: 'sides', min: 0 }, { top: 1, right: -2, bottom: 0, left: 4 }, 'out-of-range'],
    [{ kind: 'sides', integer: true }, { top: 1, right: 1.5, bottom: 1, left: 1 }, 'not-integer'],
    [{ kind: 'sides' }, { top: 1, right: 1, bottom: 1 }, 'invalid-type'],
    [{ kind: 'sides' }, { top: 1, right: 1, bottom: 1, left: '1' }, 'invalid-type'],
    [{ kind: 'sides' }, { top: 1, right: 1, bottom: 1, left: 1, all: 1 }, 'unknown-key'],
    [{ kind: 'sides' }, [1, 1, 1, 1], 'invalid-type'],
    [{ kind: 'format' }, { kind: 'number', decimals: 2 }, undefined],
    [{ kind: 'format' }, { kind: 'date', pattern: 'YYYY-MM-DD' }, undefined],
    [{ kind: 'format', kinds: ['number', 'percent'] }, { kind: 'date', pattern: 'YYYY-MM-DD' }, 'invalid-value'],
    [{ kind: 'format' }, { kind: 'number', decimals: -1 }, 'invalid-value'],
    [{ kind: 'format' }, { kind: 'number', scale: 2 }, 'invalid-value'],
    [{ kind: 'format' }, 'number', 'invalid-type'],
    [{ kind: 'filter' }, { logic: 'and', conditions: [] }, undefined],
    [{ kind: 'filter' }, { logic: 'or', conditions: [{ field: 'a', operator: 'eq', value: 1 }, { logic: 'and', conditions: [{ field: 'b', operator: 'isEmpty' }] }] }, undefined],
    [{ kind: 'filter' }, { logic: 'xor', conditions: [] }, 'invalid-value'],
    [{ kind: 'filter' }, { logic: 'and', conditions: [{ field: 'a' }] }, 'invalid-value'],
    [{ kind: 'filter' }, { logic: 'and', conditions: [{ logic: 'or', conditions: 'x' }] }, 'invalid-value'],
    [{ kind: 'filter' }, [], 'invalid-type'],
    [{ kind: 'text', secret: true }, 'k3y', undefined],
    [{ kind: 'text', secret: true }, 1, 'invalid-type'],
    [{ kind: 'swatch', options: [{ value: 'ocean', color: '#2563eb' }, { value: 'forest', color: '#16a34a' }] }, 'forest', undefined],
    [{ kind: 'swatch', options: [{ value: 'ocean', color: '#2563eb' }] }, '#2563eb', 'invalid-option'],
    [{ kind: 'swatch', options: [{ value: 'ocean', color: '#2563eb' }], custom: true }, '#ff8800', undefined],
    [{ kind: 'swatch', options: [{ value: 'ocean', color: '#2563eb' }], custom: true }, 'orange', 'invalid-option'],
    [{ kind: 'swatch', options: [] }, 1, 'invalid-type'],
    [{ kind: 'options' }, [{ value: 'a', label: '甲', disabled: true, tone: 'danger', description: '说明' }, { value: 'b' }], undefined],
    [{ kind: 'options' }, [], undefined],
    [{ kind: 'options' }, { value: 'a' }, 'invalid-type'],
    [{ kind: 'options' }, [{ value: 'a' }, { value: 'a' }], 'duplicate-value'],
    [{ kind: 'options' }, [{ value: '' }], 'required'],
    [{ kind: 'options' }, [{ label: '甲' }], 'required'],
    [{ kind: 'options', requireLabel: true }, [{ value: 'a' }], 'required'],
    [{ kind: 'options', requireLabel: true }, [{ value: 'a', label: '' }], 'required'],
    [{ kind: 'options' }, [{ value: 'a', label: 1 }], 'invalid-type'],
    [{ kind: 'options' }, [{ value: 'a', tone: 'pink' }], 'invalid-option'],
    [{ kind: 'options' }, [{ value: 'a', children: [] }], 'unknown-key'],
    [{ kind: 'options' }, ['a'], 'invalid-type'],
    [{ kind: 'options', allowDisabled: false }, [{ value: 'a', label: '甲' }], undefined],
    [{ kind: 'options', allowDisabled: false }, [{ value: 'a', disabled: false }], 'unknown-key'],
  ]
  it('内建编辑方式的取值约束', () => {
    for (const [control, value, code] of cases)
      expect(checkPropertyValue(control, value as never), JSON.stringify([control, value])).toBe(code)
  })
})

describe('findPropertyValueIssue', () => {
  it('选项列表的问题落在那一项的那个键上，按项的先后报第一处', () => {
    const options: JsonValue = [{ value: 'a', label: '甲' }, { value: 'b' }, { value: 'a', label: '丙', note: 'x' }]
    expect(findPropertyValueIssue({ kind: 'options' }, options)).toEqual({ code: 'unknown-key', path: [2, 'note'] })
    expect(findPropertyValueIssue({ kind: 'options', requireLabel: true }, options)).toEqual({ code: 'required', path: [1, 'label'] })
    expect(findPropertyValueIssue({ kind: 'options' }, [{ value: 'a' }, { value: 'b' }, { value: 'a' }])).toEqual({ code: 'duplicate-value', path: [2, 'value'] })
    expect(findPropertyValueIssue({ kind: 'options' }, [{ value: 'a' }, 'b'])).toEqual({ code: 'invalid-type', path: [1] })
    expect(findPropertyValueIssue({ kind: 'options' }, [{ 'value': 'a', 'x/y': 1 }])).toEqual({ code: 'unknown-key', path: [0, 'x/y'] })
    expect(findPropertyValueIssue({ kind: 'options' }, 'a')).toEqual({ code: 'invalid-type', path: [] })
    expect(findPropertyValueIssue({ kind: 'options' }, [{ value: 'a' }])).toBeUndefined()
    expect(findPropertyValueIssue({ kind: 'options', allowDisabled: false }, [{ value: 'a' }, { value: 'b', disabled: true }])).toEqual({ code: 'unknown-key', path: [1, 'disabled'] })
  })

  it('别的编辑方式的问题落在值本身', () => {
    expect(findPropertyValueIssue({ kind: 'number', max: 1 }, 2)).toEqual({ code: 'out-of-range', path: [] })
    expect(findPropertyValueIssue({ kind: 'text' }, 'a')).toBeUndefined()
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

  it('只看显示中的属性：必填未填报 required，内建取值不合法报对应码，登记的编辑方式交给它的 check', () => {
    const target: JsonObject = { label: '', data: { count: 1.5, rules: [{ kind: 'x' }], mode: 'Fault' } }
    const issues = checkProperties(descriptors, target, {
      path: ['nodes', 3],
      target: { kind: 'node', id: 'approve' },
      controls: {
        assignees: { check: value => (Array.isArray(value) && value.every(item => typeof item === 'object' && item !== null && 'id' in item) ? undefined : 'invalid-value') },
      },
    })
    expect(issues).toEqual([
      { code: 'required', path: ['nodes', 3, 'label'], target: { kind: 'node', id: 'approve' } },
      { code: 'not-integer', path: ['nodes', 3, 'data', 'count'], target: { kind: 'node', id: 'approve' } },
      { code: 'invalid-value', path: ['nodes', 3, 'data', 'rules'], target: { kind: 'node', id: 'approve' } },
    ])
  })

  it('登记了却没给 check 的编辑方式不检查取值；缺省路径为空', () => {
    expect(checkProperties(descriptors, { label: 'a', data: { rules: 1, mode: 'Fallback' } }, { controls: { assignees: {} } })).toEqual([
      { code: 'required', path: ['data', 'fallback'] },
    ])
  })

  it('选项列表的问题路径接到属性路径之后，落在那一项的那个键上', () => {
    const options: PropertyDescriptor[] = [{ path: ['data', 'options'], control: { kind: 'options' } }]
    const target: JsonObject = { data: { options: [{ value: 'a' }, { value: 'b' }, { value: '' }] } }
    expect(checkProperties(options, target, { path: ['children', 0] })).toEqual([
      { code: 'required', path: ['children', 0, 'data', 'options', 2, 'value'] },
    ])
  })

  it('既不是内建、也没登记的编辑方式报 unknown-control，不静默跳过', () => {
    expect(checkProperties(descriptors, { label: 'a', data: { rules: [{ id: 'u1' }] } })).toEqual([
      { code: 'unknown-control', path: ['data', 'rules'] },
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
