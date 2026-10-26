/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 对话框的标准结构：触发器、遮罩、定位层，content 里依次是页头（标题与说明）、正文、页脚（取消与确定）与关闭钮。
// 「标题 + 说明 + 确定取消」这样最常见的一份不用再拼五六个部件：几个 props 或插槽给出内容，其余照这一份铺。
// Vue / React 不写默认插槽时的缺省树、Web Components 不写部件时元素生成的节点，都照这一份渲；
// Vue / React 的 content 部件自己装配遮罩与定位层，渲缺省树时经 withoutPanelShell 摘掉这两层。

import type { PanelStructureActions, PanelStructureOptions } from '../shared/panel-structure'
import type { StructureNode } from '../shared/structure'
import type { dialogAnatomy } from './dialog.anatomy'
import type { DialogTranslations } from './dialog.types'
import { DIALOG_EN_US } from '../locale/en-US'
import { panelStructure } from '../shared/panel-structure'
import { resolveTranslations } from '../shared/translations'

type DialogPart = (typeof dialogAnatomy)['parts'][number]

/** 结构会产出的部件；对话框没有 root，部件直接长在组件或元素里。 */
export const DIALOG_STRUCTURE_PARTS = [
  'trigger',
  'backdrop',
  'positioner',
  'content',
  'header',
  'title',
  'description',
  'body',
  'footer',
  'cancel-trigger',
  'confirm-trigger',
  'close-trigger',
] as const satisfies readonly DialogPart[]

/** anatomy 里不进标准结构的部件：拖动把手与语气徽记由作者手写结构时自己摆。 */
export const DIALOG_STRUCTURE_OMITS = [
  'drag-trigger',
  'indicator',
] as const satisfies readonly DialogPart[]

/** 页脚铺哪几颗钮：confirm 是取消 + 确定（缺省），alert 只有确定，none 不铺。 */
export type DialogStructureActions = PanelStructureActions

export interface DialogStructureOptions extends PanelStructureOptions {
  /** 确定、取消钮的缺省文字从这里取。 */
  translations?: Partial<DialogTranslations>
}

/** 对话框的标准结构：见 panelStructure。 */
export function dialogStructure(options: DialogStructureOptions = {}): StructureNode<(typeof DIALOG_STRUCTURE_PARTS)[number]>[] {
  return panelStructure(options, resolveTranslations(DIALOG_EN_US, options.translations))
}
