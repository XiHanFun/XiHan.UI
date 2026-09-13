/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 side nav 模块的公共接口。

export { sideNavAnatomy, sideNavLinkQuery, sideNavTriggerQuery } from './side-nav.anatomy'
export { connectSideNav } from './side-nav.connect'
export { sideNavKeyboard } from './side-nav.keyboard'
export { accordionSiblings, sideNavMachine } from './side-nav.machine'
export { sideNavMeta } from './side-nav.meta'
export type {
  SideNavApi,
  SideNavExpandedValueChangeDetails,
  SideNavNode,
  SideNavNodeProps,
  SideNavSchema,
  SideNavTranslations,
  SideNavValueChangeDetails,
} from './side-nav.types'
