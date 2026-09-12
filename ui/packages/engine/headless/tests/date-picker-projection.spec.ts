import type { DatePickerApi } from '../src'
import { describe, expect, it } from 'vitest'
import { datePickerFieldAt, resolveDatePickerFieldIndex, resolveDatePickerPanelIndex } from '../src'

describe('date-picker 公开部件身份投影', () => {
  it('面板下标接受非负整数与数字字符串，缺席或非法值回到父面板', () => {
    expect(resolveDatePickerPanelIndex(2.9, 0)).toBe(2)
    expect(resolveDatePickerPanelIndex('3', 0)).toBe(3)
    expect(resolveDatePickerPanelIndex('', 4)).toBe(4)
    expect(resolveDatePickerPanelIndex(undefined, 4)).toBe(4)
    expect(resolveDatePickerPanelIndex(-1, 4)).toBe(4)
    expect(resolveDatePickerPanelIndex('invalid', 4)).toBe(4)
  })

  it('起止字段身份只把精确的 1 归到终点', () => {
    expect(resolveDatePickerFieldIndex(1)).toBe(1)
    expect(resolveDatePickerFieldIndex('1')).toBe(1)
    expect(resolveDatePickerFieldIndex(2)).toBe(0)
    expect(resolveDatePickerFieldIndex(undefined)).toBe(0)
  })

  it('字段选择保留非区间模式没有终点的 null', () => {
    const start = {} as DatePickerApi['field']
    const api = { field: start, fieldEnd: null } as DatePickerApi
    expect(datePickerFieldAt(api, 0)).toBe(start)
    expect(datePickerFieldAt(api, 1)).toBeNull()
  })
})
