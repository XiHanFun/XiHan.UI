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
