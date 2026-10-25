/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 1.x → 2.0。取自更新日志 v2.0.0 的「升级须知」：三个底层包并入 core，八个组件改名，部件、属性与事件改名。
// 组件改名只写名字片段，逐个导出名、元素名与覆盖槽的对照由生成脚本按两版公开面展开并核对。

import type { MigrationRules } from './types'

const EXPANDED_VALUE = ['json-viewer', 'side-nav', 'table', 'tree', 'tree-select']

export const V2: MigrationRules = {
  major: 2,
  modules: {
    '@xihan-ui/kernel/metadata': '@xihan-ui/core/metadata',
    '@xihan-ui/kernel/skin-check': '@xihan-ui/core/skin-check',
    '@xihan-ui/kernel/vite': '@xihan-ui/core/vite',
    '@xihan-ui/machine/vanilla': '@xihan-ui/core/vanilla',
    '@xihan-ui/behavior/presence': '@xihan-ui/core/presence',
    '@xihan-ui/kernel': '@xihan-ui/core',
    '@xihan-ui/machine': '@xihan-ui/core',
    '@xihan-ui/behavior': '@xihan-ui/core',
  },
  components: {
    Ellipsis: 'Truncate',
    DynamicInput: 'FieldArray',
    Time: 'Timestamp',
    QrCode: 'MatrixCode',
    Calendar: 'CalendarPicker',
    Result: 'EmptyState',
    Space: 'Flex',
    Countdown: 'Timer',
  },
  props: [
    { components: ['password-input'], from: 'visible', to: 'revealed' },
    { components: ['password-input'], from: 'defaultVisible', to: 'defaultRevealed' },
    { components: ['resizable', 'floating-panel'], from: 'size', to: 'dimensions' },
    { components: ['resizable', 'floating-panel'], from: 'defaultSize', to: 'defaultDimensions' },
    { components: ['floating-panel'], from: 'stage', to: 'windowState' },
    { components: ['floating-panel'], from: 'defaultStage', to: 'defaultWindowState' },
    { components: ['table'], from: 'expanded', to: 'expandedValue' },
    { components: ['table'], from: 'defaultExpanded', to: 'defaultExpandedValue' },
    { components: ['steps', 'tour'], from: 'step', to: 'value' },
    { components: ['steps', 'tour'], from: 'defaultStep', to: 'defaultValue' },
    { components: ['mention'], from: 'prefix', to: 'triggerPrefix' },
    { components: ['image-viewer'], from: 'items', to: 'collection' },
    { components: ['toast'], from: 'type', to: 'tone' },
    { components: ['listbox'], from: 'multiple', to: 'selectionMode', booleanTo: 'multiple' },
  ],
  events: [
    { components: ['password-input'], from: 'visibility-change', to: 'revealed-change', distinctive: true },
    { components: ['back-top'], from: 'visible-change', to: 'visibility-change', distinctive: true },
    { components: ['resizable', 'floating-panel'], from: 'size-change', to: 'dimensions-change', distinctive: true },
    { components: ['resizable'], from: 'size-change-end', to: 'dimensions-change-end', distinctive: true },
    { components: ['floating-panel'], from: 'stage-change', to: 'window-state-change', distinctive: true },
    { components: EXPANDED_VALUE, from: 'expanded-change', to: 'expanded-value-change', distinctive: true },
    { components: ['steps', 'tour'], from: 'step-change', to: 'value-change' },
    { components: ['number-animation'], from: 'finish', to: 'complete' },
    { components: ['virtualizer'], from: 'change', to: 'range-change' },
  ],
  parts: [
    { components: ['alert', 'empty-state'], from: 'icon', to: 'indicator' },
    { components: ['avatar-group'], from: 'overflow', to: 'overflow-item' },
    { components: ['checkbox-group'], from: 'trigger', to: 'select-all-trigger' },
    { components: ['clipboard'], from: 'trigger', to: 'copy-trigger' },
    { components: ['combobox', 'listbox'], from: 'item-group', to: 'group' },
    { components: ['combobox', 'listbox'], from: 'item-group-label', to: 'group-label' },
    { components: ['date-picker', 'time-picker'], from: 'presets', to: 'preset-group' },
    { components: ['fieldset'], from: 'helper-text', to: 'description' },
    { components: ['file-upload'], from: 'item-group', to: 'list' },
    { components: ['floating-panel'], from: 'stage-trigger', to: 'window-state-trigger' },
    { components: ['heatmap'], from: 'week-day-label', to: 'week-day' },
    { components: ['page-header'], from: 'subtitle', to: 'description' },
    { components: ['pagination'], from: 'ellipsis', to: 'ellipsis-trigger' },
    { components: ['signature-pad'], from: 'segment', to: 'path' },
    { components: ['skeleton'], from: 'bone', to: 'item' },
    { components: ['slider'], from: 'mark', to: 'tick' },
    { components: ['slider'], from: 'mark-label', to: 'tick-label' },
    { components: ['slider'], from: 'marks', to: 'tick-group' },
    { components: ['sortable'], from: 'item-handle', to: 'item-drag-trigger' },
    { components: ['table'], from: 'loading-state', to: 'loading' },
    { components: ['timer'], from: 'area', to: 'display' },
    { components: ['card'], from: 'body', to: 'content' },
  ],
  dataAttributes: {
    'data-affixed': 'data-fixed',
    'data-stage': 'data-window-state',
    'data-target-stage': 'data-target-window-state',
  },
  manual: [
    { pattern: /\bdata-borderless\b/, message: 'data-borderless 删除，改认 data-bordered，取值反转' },
    { pattern: /\bdata-type\b/, message: 'data-type 拆分为 data-value-type、data-severity、data-select-mode、data-reveal-mode、data-format，按组件改认' },
    { pattern: /\bdata-(?:phase|status)\b/, message: 'data-phase 与六个组件的生命周期 data-status 并入 data-state' },
    { pattern: /\b(?:XhThread|XhComposer|XhCodeBlock)\w*|<xh-(?:thread|composer|code-block)\b/, message: 'thread、composer、code-block 删除，分别改用 message-feed（配合 log）、prompt-input、code-view' },
    { pattern: /\bXhPopselect\w*|<xh-popselect\b/, message: 'popselect 退役：随表单提交的场景改用 select，仅切换视图参数的场景改用 popover 组合 listbox' },
    { pattern: /\bXhSpace\b|<xh-space\b/, message: 'space 并入 flex：XhSpace 未写 gap 时缺省有间距，XhFlex 缺省为 0，迁移后显式写 gap="md"' },
    { pattern: /\bXhResult\w*|<xh-result\b/, message: 'result 并入 empty-state：live 缺省为 polite、缺省尺寸小一号，保持原样写 live="off" 与 size="lg"' },
    { pattern: /(?:\bXhFlex|<xh-flex\b)[^>]*\s:?direction=/, message: 'flex 的 direction 别名删除，只保留 orientation' },
    { pattern: /(?:\bXh(?:Descriptions|List|Layout|PageHeader)|<xh-(?:descriptions|list|layout|page-header)\b)[^>]*\s:?bordered\b|(?:\bXhTable|<xh-table\b)[^>]*\s:?borderless\b/, message: 'descriptions、list、layout、page-header 的 bordered 与 table 的 borderless 改为 variant 形态轴' },
    { pattern: /\b(?:XhConfig|xhConfig)\b[\s\S]{1,80}\bmotion\b/, message: 'XhConfig.motion 的隐式全局覆盖移除，视觉环境统一由 createVisualEnvironmentController 管理' },
    { pattern: /\bXhFormFieldGroup\b[^>]*\b:?value=/, message: 'XhFormFieldGroup 的 value 改名为 name（表单字段标识统一为 FormPath）' },
  ],
  notes: [
    '@xihan-ui/kernel、machine、behavior 合并为 @xihan-ui/core，旧包不再发布：导入路径已改，package.json 里的依赖换成 @xihan-ui/core',
    '@xihan-ui/code-highlight 改为可选 peer 依赖，用代码着色的项目自行安装',
    'select、tags-input、tag-group 的标签统一改用 tag 组件渲染：item-delete-trigger、item-preview、item-text 对应 tag 的 root / label / close-trigger',
    '部件上同名事件处理器统一为使用者的先执行；pin-input 按顺序录入；combobox 等的原生表单提交改为每个值一个同名隐藏字段',
    '读屏文案只接受函数；kbd 的单键与组合键统一为 keys 数组；grid 的 cols / span / offset 增加取值范围校验',
  ],
}
