/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 抽屉的标准结构：与对话框同一份面板结构（shared/panel-structure），开了改尺时 content 末尾补一条改尺把手。
// Vue / React 不写默认插槽时的缺省树、Web Components 不写部件（或只写 root）时元素生成的节点，都照这一份渲；
// Vue / React 的 content 部件自己装配遮罩与定位层，渲缺省树时经 withoutPanelShell 摘掉这两层。

import type { PanelStructureActions, PanelStructureOptions } from '../shared/panel-structure'
import type { StructureNode } from '../shared/structure'
import type { drawerAnatomy } from './drawer.anatomy'
import type { DrawerTranslations } from './drawer.types'
import { DRAWER_EN_US } from '../locale/en-US'
import { panelStructure } from '../shared/panel-structure'
import { resolveTranslations } from '../shared/translations'

type DrawerPart = (typeof drawerAnatomy)['parts'][number]

/** 结构会产出的部件；root 由组件或元素自己给出，不在其列。 */
export const DRAWER_STRUCTURE_PARTS = [
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
  'resize-trigger',
] as const satisfies readonly DrawerPart[]

/** anatomy 里的部件都进标准结构。 */
export const DRAWER_STRUCTURE_OMITS = [] as const satisfies readonly DrawerPart[]

/** 页脚铺哪几颗钮：confirm 是取消 + 确定（缺省），alert 只有确定，none 不铺。 */
export type DrawerStructureActions = PanelStructureActions

export interface DrawerStructureOptions extends PanelStructureOptions {
  /** 开了改尺：content 末尾补一条改尺把手。 */
  resizable?: boolean
  /** 确定、取消钮的缺省文字从这里取。 */
  translations?: Partial<DrawerTranslations>
}

/** 抽屉在 root 里的标准结构：见 panelStructure；开了改尺时 content 末尾是改尺把手。 */
export function drawerStructure(options: DrawerStructureOptions = {}): StructureNode<(typeof DRAWER_STRUCTURE_PARTS)[number]>[] {
  const tail: StructureNode<'resize-trigger'>[] = options.resizable ? [{ key: 'resize-trigger', tag: 'div', part: 'resize-trigger' }] : []
  return panelStructure(options, resolveTranslations(DRAWER_EN_US, options.translations), tail)
}
