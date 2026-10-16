/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 零件内部用到的库内元素：按需注册，不全量注册 @xihan-ui/web-components。重复注册同一个类不报错。

import {
  defineXhElement,
  XhAccordionElement,
  XhColorFieldElement,
  XhFieldElement,
  XhNumberFieldElement,
  XhSelectElement,
  XhSwitchElement,
  XhTagElement,
  XhTagsInputElement,
  XhTextFieldElement,
  XhToggleGroupElement,
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
  defineXhElement('xh-toggle-group', XhToggleGroupElement)
  defineXhElement('xh-accordion', XhAccordionElement)
}

/** 问题列表的过滤开关与来源标签用到的元素。 */
export function defineIssueListElements(): void {
  defineXhElement('xh-toggle-group', XhToggleGroupElement)
  defineXhElement('xh-tag', XhTagElement)
}
