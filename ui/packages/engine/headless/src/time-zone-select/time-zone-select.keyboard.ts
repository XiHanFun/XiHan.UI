/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 键盘交互完整复用 Combobox；本组合根不再声明第二套按键。

import type { KeyboardTable } from '../spec/types'

export const timeZoneSelectKeyboard: KeyboardTable = {
  component: 'time-zone-select',
  source: 'https://www.w3.org/WAI/ARIA/apg/patterns/combobox/#keyboardinteraction',
  rows: [],
}
