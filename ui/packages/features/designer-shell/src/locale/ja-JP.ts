/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 设计器零件的日语文案。

import type { XhConfig } from '@xihan-ui/web-components'
import type { DesignerShellLocaleTranslations } from './types'

const translations: DesignerShellLocaleTranslations = {
  'xh-designer-properties': {
    title: 'プロパティ',
    empty: '編集できるプロパティがありません',
    mixed: '複数の値',
    invalidJson: '有効な JSON ではありません',
    notInteger: '整数で入力してください',
    belowMinimum: min => `${min} 以上で入力してください`,
    aboveMaximum: max => `${max} 以下で入力してください`,
    notAboveMinimum: min => `${min} より大きい値を入力してください`,
    invalidDataField: '有効なフィールドパスではありません',
    sidesLinked: '4 辺とも同じ',
    sides: { all: '4 辺', top: '上', right: '右', bottom: '下', left: '左' },
    sidesIncomplete: '4 辺すべてを入力してください',
    customColor: 'カスタムカラー',
  },
  'xh-designer-issues': {
    title: '問題',
    empty: '問題はありません',
    errors: count => `エラー ${count} 件`,
    warnings: count => `警告 ${count} 件`,
    severityError: 'エラー',
    severityWarning: '警告',
    filter: '重要度で問題を絞り込み',
    noTarget: '全体',
  },
  'xh-designer-palette': {
    title: '要素',
    search: '要素を検索',
    noMatches: '一致する要素がありません',
    empty: '要素がありません',
  },
  'xh-designer-ruler': {
    horizontalGuide: value => `水平ガイド ${value}`,
    verticalGuide: value => `垂直ガイド ${value}`,
  },
  'xh-designer-frame': {
    layout: 'デザイナーのレイアウト',
    resize: label => `「${label}」のサイズを変更`,
  },
}

/** 日语。 */
export const designerShellJaJP: XhConfig = { translations }
