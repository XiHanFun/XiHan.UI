import type { FieldProps } from '../src/field/index'
import { createCounterIdGenerator, createScope, normalizeProps } from '@xihan-ui/core'
import { describe, expect, it } from 'vitest'
import { connectField } from '../src/field/index'

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
