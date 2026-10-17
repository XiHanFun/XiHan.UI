import type { FieldProps } from '../src/field/index'
import { createCounterIdGenerator, createScope, normalizeProps } from '@xihan-ui/core'
import { describe, expect, it } from 'vitest'
import { connectField, fieldControlWiring, fieldGroupAttrs, fieldStateAttrs, withFieldDescription, withFieldLabel } from '../src/field/index'

function api(props: FieldProps = {}) {
  const scope = createScope(null, createCounterIdGenerator())
  return connectField(props, scope, normalizeProps)
}

const rootProps = (props?: FieldProps) => api(props).getRootProps() as Record<string, unknown>
const labelProps = (props?: FieldProps) => api(props).getLabelProps() as Record<string, unknown>

describe('connectField 必填与无效落在标签上', () => {
  // 必填星号与无效字色由 label.css 公共层按标签自己的两位画，root 上那两位选不中 label
  it('required 时标签自己带 data-required：公共层的星号规则按它选中，不再回头看根', () => {
    expect(labelProps({ required: true })['data-required']).toBe('')
    expect(rootProps({ required: true })['data-required']).toBe('')
  })

  it('invalid 时标签自己带 data-invalid：无效字色按它亮', () => {
    expect(labelProps({ invalid: true })['data-invalid']).toBe('')
    expect(rootProps({ invalid: true })['data-invalid']).toBe('')
  })

  it('选填且有效时两位都不产出，皮肤的 [data-required] / [data-invalid] 才不会误命中', () => {
    expect(labelProps()['data-required']).toBeUndefined()
    expect(labelProps()['data-invalid']).toBeUndefined()
  })
})

describe('connectField 的 control 投影 Field Chrome 家族属性', () => {
  const controlProps = (props?: FieldProps) => api(props).getControlProps() as Record<string, unknown>

  it('control 自身就是视觉盒：投 chrome 标记，尺寸固定 md、形态固定 outline（Field 没有这两条轴）', () => {
    const control = controlProps()
    expect(control['data-xh-field-chrome']).toBe('')
    expect(control['data-xh-field-size']).toBe('md')
    expect(control['data-variant']).toBe('outline')
  })

  it('三态都落在 chrome 节点上，家族按它们换面', () => {
    const control = controlProps({ disabled: true, readOnly: true, invalid: true })
    expect(control['data-disabled']).toBe('')
    expect(control['data-readonly']).toBe('')
    expect(control['data-invalid']).toBe('')
    const rest = controlProps()
    expect(rest['data-disabled']).toBeUndefined()
    expect(rest['data-readonly']).toBeUndefined()
    expect(rest['data-invalid']).toBeUndefined()
  })

  it('control 不投 data-xh-field-input：它自己就是盒，没有盒内输入段', () => {
    expect(controlProps()['data-xh-field-input']).toBeUndefined()
  })
})

describe('字段交给库内控件的接线', () => {
  it('接线取自 connect 结果：标签 id、描述链与三态；invalid 时描述链带上错误文案', () => {
    const valid = fieldControlWiring(api())
    const field = api({ invalid: true, required: true, readOnly: true })
    const wiring = fieldControlWiring(field)
    expect(wiring).toEqual({
      labelId: field.labelId,
      describedBy: (field.getControlProps() as Record<string, unknown>)['aria-describedby'],
      invalid: true,
      required: true,
      readOnly: true,
    })
    expect(wiring.describedBy!.split(' ')).toHaveLength(2)
    expect(valid.describedBy!.split(' ')).toHaveLength(1)
  })

  it('状态接线与字段 control 上的同名四条一致，组类接线只有描述链', () => {
    const field = api({ invalid: true })
    const control = field.getControlProps() as Record<string, unknown>
    const wiring = fieldControlWiring(field)
    expect(fieldStateAttrs(wiring)).toEqual({
      'aria-describedby': control['aria-describedby'],
      'aria-invalid': control['aria-invalid'],
      'aria-required': control['aria-required'],
      'aria-readonly': control['aria-readonly'],
    })
    expect(fieldGroupAttrs(wiring)).toEqual({ 'aria-describedby': control['aria-describedby'] })
  })

  it('字段标签排在名字链最前，控件自己的部分跟在后面；自己没有或为空时只剩字段标签', () => {
    expect(withFieldLabel({ 'aria-labelledby': 'own value' }, 'label')['aria-labelledby']).toBe('label own value')
    expect(withFieldLabel({}, 'label')['aria-labelledby']).toBe('label')
    expect(withFieldLabel({ 'aria-labelledby': '' }, 'label')['aria-labelledby']).toBe('label')
  })

  it('没有字段标签时属性原样返回', () => {
    const props = { 'aria-labelledby': 'own' }
    expect(withFieldLabel(props, undefined)).toBe(props)
  })
})

describe('字段描述链与控件自己的拼接', () => {
  it('字段的排在前面，控件自己的跟在后面，重复的只留一份', () => {
    expect(withFieldDescription({ 'aria-describedby': 'caps' }, 'hint error')['aria-describedby']).toBe('hint error caps')
    expect(withFieldDescription({ 'aria-describedby': 'hint caps' }, 'hint')['aria-describedby']).toBe('hint caps')
  })

  it('控件自己给 undefined 时不顶掉字段的；字段没有描述链时原样返回', () => {
    expect(withFieldDescription({ 'aria-describedby': undefined }, 'hint')['aria-describedby']).toBe('hint')
    const props = { 'aria-describedby': 'caps' }
    expect(withFieldDescription(props, undefined)).toBe(props)
  })
})

describe('名字链与描述链只收在场的部件', () => {
  const control = (props: FieldProps) => api(props).getControlProps() as Record<string, unknown>

  it('省略 parts 时按都在场处理，与服务端直出、挂载前一致', () => {
    const field = api({ invalid: true })
    const props = field.getControlProps() as Record<string, unknown>
    expect(props['aria-labelledby']).toBe(field.labelId)
    expect((props['aria-describedby'] as string).split(' ')).toHaveLength(2)
  })

  it('标签与说明都不在场时，两条链都不写', () => {
    const props = control({ parts: { label: false, description: false, errorText: true } })
    expect(props['aria-labelledby']).toBeUndefined()
    expect(props['aria-describedby']).toBeUndefined()
  })

  it('没有说明但 invalid 时只引用错误文案；错误文案也不在场时不写', () => {
    const field = api({ invalid: true, parts: { label: true, description: false, errorText: true } })
    const errorId = (field.getErrorTextProps() as Record<string, unknown>).id
    expect((field.getControlProps() as Record<string, unknown>)['aria-describedby']).toBe(errorId)
    expect(control({ invalid: true, parts: { description: false, errorText: false } })['aria-describedby']).toBeUndefined()
  })

  it('接线跟着走：没有标签时 labelId 为 undefined，没有任何描述时状态接线不写 aria-describedby', () => {
    const wiring = fieldControlWiring(api({ parts: { label: false, description: false } }))
    expect(wiring.labelId).toBeUndefined()
    expect(wiring.describedBy).toBeUndefined()
    expect(fieldStateAttrs(wiring)['aria-describedby']).toBeUndefined()
    expect(fieldGroupAttrs(wiring)['aria-describedby']).toBeUndefined()
    expect(withFieldLabel({ 'aria-labelledby': 'own' }, wiring.labelId)['aria-labelledby']).toBe('own')
  })
})

describe('库内控件直接放进字段：标签不写 for', () => {
  it('control 不在场时不写 for；省略 parts 时照旧指向 controlId', () => {
    expect(labelProps({ parts: { control: false } }).for).toBeUndefined()
    expect(labelProps({ controlId: 'amount' }).for).toBe('amount')
  })
})
