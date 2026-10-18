/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 设计器零件的简体中文文案。

import type { XhConfig } from '@xihan-ui/web-components'
import type { DesignerShellLocaleTranslations } from './types'

const translations: DesignerShellLocaleTranslations = {
  'xh-designer-properties': {
    title: '属性',
    empty: '没有可编辑的属性',
    mixed: '多个值',
    invalidJson: '不是合法的 JSON',
    notInteger: '必须是整数',
    belowMinimum: min => `不能小于 ${min}`,
    aboveMaximum: max => `不能大于 ${max}`,
    notAboveMinimum: min => `必须大于 ${min}`,
    invalidDataField: '不是合法的字段路径',
    sidesLinked: '四边相同',
    sides: { all: '四边', top: '上', right: '右', bottom: '下', left: '左' },
    sidesIncomplete: '四边都要填写',
    customColor: '自定义颜色',
  },
  'xh-designer-issues': {
    title: '问题',
    empty: '没有问题',
    errors: count => `${count} 个错误`,
    warnings: count => `${count} 个警告`,
    severityError: '错误',
    severityWarning: '警告',
    filter: '按严重程度显示问题',
    noTarget: '整体',
  },
  'xh-designer-palette': {
    title: '物料',
    search: '搜索物料',
    noMatches: '没有匹配的物料',
    empty: '没有物料',
  },
  'xh-designer-ruler': {
    horizontalGuide: value => `横向参考线 ${value}`,
    verticalGuide: value => `竖向参考线 ${value}`,
  },
  'xh-designer-frame': {
    layout: '设计器布局',
    resize: label => `调整「${label}」的大小`,
  },
}

/** 简体中文。 */
export const designerShellZhCN: XhConfig = { translations }
