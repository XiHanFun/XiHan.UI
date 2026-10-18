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
    closePanel: label => `关闭「${label}」`,
    panelHelp: label => `「${label}」说明`,
  },
  'xh-designer-settings': {
    title: '设置',
    sections: '设置分区',
    locked: '由所在系统管理',
    general: '基础',
    theme: '主题',
    themeHint: '只作用于设计器，不影响页面其余部分。',
    themeFollow: '跟随页面',
    themeSystem: '跟随系统',
    themeLight: '亮色',
    themeDark: '暗色',
    brand: '主题色',
    brandHint: '设计器里按钮、选中与高亮的颜色。',
    statusBar: '状态栏',
    statusBarHint: '在设计器底部显示状态栏。',
    language: '语言',
    languageHint: '不选即跟随页面。',
  },
  'xh-designer-commands': {
    toolbar: '设计器操作',
    undo: '撤销',
    redo: '重做',
    cut: '剪切',
    copy: '复制',
    paste: '粘贴',
    duplicate: '创建副本',
    delete: '删除',
    selectAll: '全选',
    alignLeft: '左对齐',
    alignCenter: '水平居中',
    alignRight: '右对齐',
    alignTop: '顶端对齐',
    alignMiddle: '垂直居中',
    alignBottom: '底端对齐',
    distributeHorizontal: '水平等距分布',
    distributeVertical: '垂直等距分布',
    bringToFront: '置于顶层',
    bringForward: '上移一层',
    sendBackward: '下移一层',
    sendToBack: '置于底层',
    zoomIn: '放大',
    zoomOut: '缩小',
    zoomToFit: '适合窗口',
    zoomToActual: '实际大小',
    design: '设计',
    preview: '预览',
  },
}

/** 简体中文。 */
export const designerShellZhCN: XhConfig = { translations }
