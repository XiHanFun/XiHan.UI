/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 验证 date picker projection 相关行为。

import { describe, expect, it } from 'vitest'
import { resolveDatePickerPanelIndex } from '../src'

describe('date-picker 公开部件身份投影', () => {
  it('面板下标接受非负整数与数字字符串，缺席或非法值回到父面板', () => {
    expect(resolveDatePickerPanelIndex(2.9, 0)).toBe(2)
    expect(resolveDatePickerPanelIndex('3', 0)).toBe(3)
    expect(resolveDatePickerPanelIndex('', 4)).toBe(4)
    expect(resolveDatePickerPanelIndex(undefined, 4)).toBe(4)
    expect(resolveDatePickerPanelIndex(-1, 4)).toBe(4)
    expect(resolveDatePickerPanelIndex('invalid', 4)).toBe(4)
  })
})
