/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 navigation menu 模块的公共接口。

export { navigationMenuAnatomy, navigationMenuTriggerQuery } from './navigation-menu.anatomy'
export { connectNavigationMenu } from './navigation-menu.connect'
export { navigationMenuKeyboard } from './navigation-menu.keyboard'
export { NAVIGATION_MENU_DELAY, NAVIGATION_MENU_SKIP_DELAY, navigationMenuMachine } from './navigation-menu.machine'
export { navigationMenuMeta } from './navigation-menu.meta'
export type {
  NavigationMenuApi,
  NavigationMenuContentProps,
  NavigationMenuIndicatorRect,
  NavigationMenuLinkProps,
  NavigationMenuNode,
  NavigationMenuNodeMeta,
  NavigationMenuPressedPart,
  NavigationMenuRefs,
  NavigationMenuSchema,
  NavigationMenuTranslations,
  NavigationMenuTriggerProps,
  NavigationMenuValueChangeDetails,
} from './navigation-menu.types'
