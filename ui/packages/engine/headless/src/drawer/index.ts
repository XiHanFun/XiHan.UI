/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 drawer 模块的公共接口。

export { drawerAnatomy } from './drawer.anatomy'
export { connectDrawer, DRAWER_DEFAULT_SIDE } from './drawer.connect'
export { drawerKeyboard } from './drawer.keyboard'
export { drawerMachine } from './drawer.machine'
export { drawerMeta } from './drawer.meta'
export type { DrawerApi, DrawerOpenChangeDetails, DrawerRefs, DrawerSchema, DrawerSide, DrawerTranslations } from './drawer.types'
