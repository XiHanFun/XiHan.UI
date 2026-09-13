/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 context menu 模块的公共接口。

export { contextMenuAnatomy, contextMenuItemQuery, contextMenuItemText } from './context-menu.anatomy'
export { connectContextMenu } from './context-menu.connect'
export { contextMenuKeyboard } from './context-menu.keyboard'
export {
  CONTEXT_MENU_DEFAULT_OFFSET,
  CONTEXT_MENU_DEFAULT_PLACEMENT,
  CONTEXT_MENU_LONG_PRESS_DELAY,
  CONTEXT_MENU_MOVE_TOLERANCE,
  contextMenuMachine,
} from './context-menu.machine'
export { contextMenuMeta } from './context-menu.meta'
export type {
  ContextMenuApi,
  ContextMenuFocusIntent,
  ContextMenuGroupProps,
  ContextMenuItemProps,
  ContextMenuNode,
  ContextMenuNodeMeta,
  ContextMenuOpenChangeDetails,
  ContextMenuPoint,
  ContextMenuRefs,
  ContextMenuSchema,
  ContextMenuSelectDetails,
  ContextMenuTranslations,
} from './context-menu.types'
