/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 4.x → 5.0。取自更新日志 v5.0.0 的「升级须知」：能机改的写成规则，其余列进 notes 与 manual。

import type { MigrationRules } from './types'

const MENU_FAMILY = ['menu', 'context-menu', 'menubar', 'command', 'mention']

export const V5: MigrationRules = {
  major: 5,
  imports: [
    {
      from: '@xihan-ui/headless',
      to: '@xihan-ui/core/color',
      names: {
        colorCss: true,
        colorHexToRgba: true,
        colorHslaToRgba: true,
        colorHsvaToRgba: true,
        colorNormalizeHsva: true,
        colorNormalizeRgba: true,
        colorOklchToRgba: true,
        colorParse: true,
        colorRgbaToHex: true,
        colorRgbaToHsla: true,
        colorRgbaToHsva: true,
        colorRgbaToOklch: true,
        colorSameColor: true,
        colorSameRgba: true,
        colorToString: true,
        ColorFormat: true,
        ColorHsla: true,
        ColorHsva: true,
        ColorOklch: true,
        ColorRgba: true,
      },
    },
    {
      from: '@xihan-ui/headless',
      to: '@xihan-ui/core/hotkey',
      names: {
        detectKbdPlatform: true,
        formatHotkey: true,
        matchesHotkey: true,
        resolveKbdPlatform: true,
        HotkeySegment: true,
        KbdPlatform: true,
        KbdResolvedPlatform: true,
      },
    },
    {
      from: '@xihan-ui/tokens',
      to: '@xihan-ui/core/color',
      names: {
        srgbToLinear: 'colorSrgbToLinear',
        linearToSrgb: 'colorLinearToSrgb',
        linearRgbToOklch: 'colorLinearRgbToOklch',
        oklchToLinearRgb: 'colorOklchToLinearRgb',
        parseColorToOklch: 'colorParseOklch',
        inSrgbGamut: 'colorInSrgbGamut',
        clampChroma: 'colorClampChroma',
        formatOklch: 'colorFormatOklch',
        Oklch: 'ColorOklch',
      },
    },
  ],
  identifiers: {
    HeatmapCellDetails: 'HeatmapDatumDetails',
    MenuSelectDetails: 'MenuItemSelectDetails',
    ContextMenuSelectDetails: 'ContextMenuItemSelectDetails',
    MenubarSelectDetails: 'MenubarItemSelectDetails',
    CommandSelectDetails: 'CommandItemSelectDetails',
    MentionSelectDetails: 'MentionItemSelectDetails',
  },
  props: [
    { components: ['tree'], from: 'multiple', to: 'selectionMode', booleanTo: 'multiple' },
    { components: ['table'], from: 'footer', to: 'footerRows', booleanTo: 1 },
    { components: ['dialog', 'drawer'], from: 'role', to: 'dialogRole', only: 'web-components' },
    { components: ['notification'], from: 'title', to: 'titleText', only: 'web-components' },
  ],
  events: [
    { components: ['heatmap'], from: 'cell-press', to: 'datum-press', distinctive: true },
    { components: ['heatmap'], from: 'cell-active', to: 'datum-active', distinctive: true },
    { components: MENU_FAMILY, from: 'select', to: 'item-select' },
    { components: ['popconfirm'], from: 'cancel', to: 'cancel-press' },
  ],
  manual: [
    { pattern: /\bbuildPeriodGrid\b[\s\S]{0,200}?\.cells\b/, message: '日历族的周、月、季度、年视图改为按行渲染：buildPeriodGrid 的 cells 改为 rows，自备格子列表用 calendarPeriodRows(periods, view) 切行' },
    { pattern: /\bgetFooterRowProps\(\s*\)/, message: '表格的 getFooterRowProps() 改为 getFooterRowProps({ level })，多行表尾每行写 level' },
    { pattern: /\b(?:getTitleEl|getDescriptionEl|setTitleEl|setDescriptionEl)\b/, message: 'HoverCard 删去了标题、说明的 refs：自写的标题、说明部件改为经 parts 报告在场' },
    { pattern: /\bopenSource\b/, message: 'Citation 的语言包删除了 openSource、source，覆盖过的直接去掉' },
  ],
  notes: [
    '菜单族的 item-indicator 只当对号、只在勾选与单选条目上出现；当图标用的改写 item-icon（ItemIcon）',
    'Web Components FileUpload 的条目改按 allFiles 对应（远程附件在前、本地文件在后），用了 remoteFiles 的改按 allFiles 铺行',
    '表单校验：只含空白的字符串与元素全为空的数组算空，min / max 对字符串改按字素计数',
    'React Card：XhCardRoot 的 title、content 改为卡片的标题与正文，不再作为原生属性写到根上',
    'Web Components 布尔属性改为三态：显式写 ="false" 为假，不写交给组件缺省',
    '缺省结构：根组件不写子内容时铺出整套部件；渲染成 <button> 的部件清掉了浏览器缺省样式',
    'ColorPicker 单选给空数组改为未选，要黑色的改写 [\'#000000\']',
    'headless 直接用状态机的：菜单族的 onSelect 改为 onItemSelect，Popconfirm 的 onCancel 改为 onCancelPress',
  ],
}
