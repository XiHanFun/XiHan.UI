/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 零件内部用到的库内元素：按需注册，不全量注册 @xihan-ui/web-components。重复注册同一个类不报错。

import {
  defineXhElement,
  XhAccordionElement,
  XhButtonElement,
  XhCheckboxElement,
  XhColorFieldElement,
  XhColorSwatchPickerElement,
  XhContextMenuElement,
  XhDateFieldElement,
  XhDialogElement,
  XhDrawerElement,
  XhFieldArrayElement,
  XhFieldElement,
  XhFilterBuilderElement,
  XhFloatingPanelElement,
  XhFormatInputElement,
  XhIconElement,
  XhListboxElement,
  XhMenuElement,
  XhNumberFieldElement,
  XhPasswordInputElement,
  XhPopoverElement,
  XhSelectElement,
  XhSplitterElement,
  XhSwitchElement,
  XhTableElement,
  XhTabsElement,
  XhTagElement,
  XhTagsInputElement,
  XhTextFieldElement,
  XhToggleGroupElement,
  XhToolbarElement,
  XhTooltipElement,
  XhTreeElement,
  XhTreeSelectElement,
} from '@xihan-ui/web-components/define'

/** 属性面板的字段与分组用到的元素。 */
export function definePropertyFieldElements(): void {
  defineXhElement('xh-field', XhFieldElement)
  defineXhElement('xh-text-field', XhTextFieldElement)
  defineXhElement('xh-number-field', XhNumberFieldElement)
  defineXhElement('xh-switch', XhSwitchElement)
  defineXhElement('xh-select', XhSelectElement)
  defineXhElement('xh-tag', XhTagElement)
  defineXhElement('xh-tags-input', XhTagsInputElement)
  defineXhElement('xh-color-field', XhColorFieldElement)
  defineXhElement('xh-color-swatch-picker', XhColorSwatchPickerElement)
  defineXhElement('xh-password-input', XhPasswordInputElement)
  defineXhElement('xh-toggle-group', XhToggleGroupElement)
  defineXhElement('xh-tree-select', XhTreeSelectElement)
  defineXhElement('xh-format-input', XhFormatInputElement)
  defineXhElement('xh-filter-builder', XhFilterBuilderElement)
  defineXhElement('xh-field-array', XhFieldArrayElement)
  defineXhElement('xh-checkbox', XhCheckboxElement)
  defineXhElement('xh-date-field', XhDateFieldElement)
  defineXhElement('xh-accordion', XhAccordionElement)
  defineXhElement('xh-table', XhTableElement)
  defineXhElement('xh-button', XhButtonElement)
}

/** 物料面板的搜索框、折叠分组、带下级的树与图标用到的元素。 */
export function definePaletteElements(): void {
  defineXhElement('xh-text-field', XhTextFieldElement)
  defineXhElement('xh-accordion', XhAccordionElement)
  defineXhElement('xh-tree', XhTreeElement)
  defineXhElement('xh-icon', XhIconElement)
}

/** 页面结构的搜索框、树与图标用到的元素。 */
export function defineOutlineElements(): void {
  defineXhElement('xh-text-field', XhTextFieldElement)
  defineXhElement('xh-tree', XhTreeElement)
  defineXhElement('xh-icon', XhIconElement)
}

/** 历史记录的列表与清空钮用到的元素。 */
export function defineHistoryElements(): void {
  defineXhElement('xh-listbox', XhListboxElement)
  defineXhElement('xh-button', XhButtonElement)
}

/** 外框的分隔条、面板头的帮助与「更多」菜单、窄屏抽屉与浮出的小窗用到的元素。 */
export function defineFrameElements(): void {
  defineXhElement('xh-splitter', XhSplitterElement)
  defineXhElement('xh-drawer', XhDrawerElement)
  defineXhElement('xh-tooltip', XhTooltipElement)
  defineXhElement('xh-menu', XhMenuElement)
  defineXhElement('xh-floating-panel', XhFloatingPanelElement)
  defineXhElement('xh-icon', XhIconElement)
}

/** 问题列表的过滤开关与来源标签用到的元素。 */
export function defineIssueListElements(): void {
  defineXhElement('xh-toggle-group', XhToggleGroupElement)
  defineXhElement('xh-tag', XhTagElement)
}

/** 状态栏上可点的状态项用到的按钮。 */
export function defineStatusElements(): void {
  defineXhElement('xh-button', XhButtonElement)
}

/** 设置对话框：对话框、竖排的分区页、属性字段与「布局」页面板的图标用到的元素。 */
export function defineSettingsElements(): void {
  defineXhElement('xh-dialog', XhDialogElement)
  defineXhElement('xh-tabs', XhTabsElement)
  defineXhElement('xh-icon', XhIconElement)
  definePropertyFieldElements()
}

/** 变换覆盖层的尺寸徽标用到的数字框。 */
export function defineTransformElements(): void {
  defineXhElement('xh-number-field', XhNumberFieldElement)
}

/** 命令工具栏与命令菜单用到的元素，弹层命令的弹层与菜单命令的菜单也在内。 */
export function defineCommandElements(): void {
  defineXhElement('xh-toolbar', XhToolbarElement)
  defineXhElement('xh-popover', XhPopoverElement)
  defineXhElement('xh-menu', XhMenuElement)
  defineXhElement('xh-context-menu', XhContextMenuElement)
  defineXhElement('xh-tooltip', XhTooltipElement)
  defineXhElement('xh-icon', XhIconElement)
}
