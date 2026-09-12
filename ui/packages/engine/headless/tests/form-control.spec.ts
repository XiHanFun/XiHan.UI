import { describe, expect, it } from 'vitest'
import { resolveFormControlState } from '../src/form'

describe('表单控件状态继承', () => {
  it('实例值优先于最近的 Form 或 Field 状态', () => {
    expect(resolveFormControlState(
      { disabled: false, readOnly: false, required: false, invalid: false },
      { disabled: true, readOnly: true, required: true, invalid: true },
    )).toEqual({ disabled: false, readOnly: false, required: false, invalid: false })
  })

  it('实例没有声明时继承全部四条状态轴，最终缺省为 false', () => {
    expect(resolveFormControlState(
      { required: true },
      { disabled: true, readOnly: true, invalid: true },
    )).toEqual({ disabled: true, readOnly: true, required: true, invalid: true })
    expect(resolveFormControlState({}, undefined)).toEqual({
      disabled: false,
      readOnly: false,
      required: false,
      invalid: false,
    })
  })

  it('字段层逐轴优先于表单层，未声明的轴继续回落到表单层', () => {
    expect(resolveFormControlState(
      { required: false },
      { disabled: false, invalid: true },
      { disabled: true, readOnly: true, required: true, invalid: false },
    )).toEqual({
      disabled: false,
      readOnly: true,
      required: false,
      invalid: true,
    })
  })
})
