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
  XhDialogElement,
  XhDrawerElement,
  XhFieldArrayElement,
  XhFieldElement,
  XhFilterBuilderElement,
  XhFormatInputElement,
  XhIconElement,
  XhMenuElement,
  XhNumberFieldElement,
  XhPasswordInputElement,
  XhPopoverElement,
  XhSelectElement,
  XhSplitterElement,
  XhSwitchElement,
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
  defineXhElement('xh-accordion', XhAccordionElement)
}

/** 物料面板的搜索框、折叠分组、带下级的树与图标用到的元素。 */
export function definePaletteElements(): void {
  defineXhElement('xh-text-field', XhTextFieldElement)
  defineXhElement('xh-accordion', XhAccordionElement)
  defineXhElement('xh-tree', XhTreeElement)
  defineXhElement('xh-icon', XhIconElement)
}

/** 外框的分隔条、面板头的帮助与窄屏抽屉用到的元素。 */
export function defineFrameElements(): void {
  defineXhElement('xh-splitter', XhSplitterElement)
  defineXhElement('xh-drawer', XhDrawerElement)
  defineXhElement('xh-tooltip', XhTooltipElement)
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

/** 设置对话框：对话框、竖排的分区页与属性字段用到的元素。 */
export function defineSettingsElements(): void {
  defineXhElement('xh-dialog', XhDialogElement)
  defineXhElement('xh-tabs', XhTabsElement)
  definePropertyFieldElements()
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
