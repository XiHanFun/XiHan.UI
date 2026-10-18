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
    customColor: '自訂顏色',
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
    closePanel: label => `關閉「${label}」`,
    panelHelp: label => `「${label}」說明`,
  },
  'xh-designer-settings': {
    title: '設定',
    sections: '設定分區',
    locked: '由所在系統管理',
    general: '基本',
    theme: '主題',
    themeHint: '只作用於設計器，不影響頁面其餘部分。',
    themeFollow: '跟隨頁面',
    themeSystem: '跟隨系統',
    themeLight: '淺色',
    themeDark: '深色',
    brand: '主題色',
    brandHint: '設計器裡按鈕、選取與醒目提示的顏色。',
    toolbarDisplay: '工具列按鈕',
    toolbarDisplayHint: '工具列上的按鈕怎麼顯示。',
    toolbarDisplayIcon: '圖示',
    toolbarDisplayText: '文字',
    toolbarDisplayBoth: '圖示和文字',
    statusBar: '狀態列',
    statusBarHint: '在設計器底部顯示狀態列。',
    language: '語言',
    languageHint: '不選即跟隨頁面。',
  },
  'xh-designer-commands': {
    toolbar: '設計器操作',
    undo: '復原',
    redo: '重做',
    cut: '剪下',
    copy: '複製',
    paste: '貼上',
    duplicate: '建立副本',
    delete: '刪除',
    selectAll: '全選',
    alignLeft: '靠左對齊',
    alignCenter: '水平置中',
    alignRight: '靠右對齊',
    alignTop: '靠上對齊',
    alignMiddle: '垂直置中',
    alignBottom: '靠下對齊',
    distributeHorizontal: '水平均分',
    distributeVertical: '垂直均分',
    bringToFront: '移到最上層',
    bringForward: '上移一層',
    sendBackward: '下移一層',
    sendToBack: '移到最下層',
    zoomIn: '放大',
    zoomOut: '縮小',
    zoomToFit: '符合視窗大小',
    zoomToActual: '實際大小',
    design: '設計',
    preview: '預覽',
  },
}

/** 繁体中文。 */
export const designerShellZhTW: XhConfig = { translations }
