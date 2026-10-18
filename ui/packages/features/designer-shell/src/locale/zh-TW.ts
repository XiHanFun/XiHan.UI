/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 设计器零件的繁体中文文案。

import type { XhConfig } from '@xihan-ui/web-components'
import type { DesignerShellLocaleTranslations } from './types'

const translations: DesignerShellLocaleTranslations = {
  'xh-designer-properties': {
    title: '屬性',
    empty: '沒有可編輯的屬性',
    mixed: '多個值',
    invalidJson: '不是有效的 JSON',
    notInteger: '必須是整數',
    belowMinimum: min => `不能小於 ${min}`,
    aboveMaximum: max => `不能大於 ${max}`,
    notAboveMinimum: min => `必須大於 ${min}`,
    invalidDataField: '不是有效的欄位路徑',
    sidesLinked: '四邊相同',
    sides: { all: '四邊', top: '上', right: '右', bottom: '下', left: '左' },
    sidesIncomplete: '四邊都要填寫',
  },
  'xh-designer-issues': {
    title: '問題',
    empty: '沒有問題',
    errors: count => `${count} 個錯誤`,
    warnings: count => `${count} 個警告`,
    severityError: '錯誤',
    severityWarning: '警告',
    filter: '依嚴重程度顯示問題',
    noTarget: '整體',
  },
  'xh-designer-palette': {
    title: '元件',
    search: '搜尋元件',
    noMatches: '沒有符合的元件',
    empty: '沒有元件',
  },
  'xh-designer-ruler': {
    horizontalGuide: value => `水平參考線 ${value}`,
    verticalGuide: value => `垂直參考線 ${value}`,
  },
  'xh-designer-frame': {
    layout: '設計器版面配置',
    resize: label => `調整「${label}」的大小`,
  },
}

/** 繁体中文。 */
export const designerShellZhTW: XhConfig = { translations }
