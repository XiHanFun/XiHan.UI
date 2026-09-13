/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 select 模块的公共接口。

export { selectAnatomy, selectItemQuery, selectItemText } from './select.anatomy'
export { connectSelect } from './select.connect'
export { selectKeyboard } from './select.keyboard'
export { SELECT_DEFAULT_MAX_TAG_COUNT, SELECT_DEFAULT_PLACEMENT, selectMachine } from './select.machine'
export { selectMeta } from './select.meta'
export type { SelectApi, SelectFocusIntent, SelectGroupProps, SelectItemProps, SelectNode, SelectNodeMeta, SelectOpenChangeDetails, SelectRefs, SelectSchema, SelectTagMeta, SelectTagProps, SelectTranslations, SelectValueChangeDetails } from './select.types'
