/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 breadcrumb 模块的公共接口。

export { breadcrumbAnatomy } from './breadcrumb.anatomy'
export { connectBreadcrumb } from './breadcrumb.connect'
export { breadcrumbKeyboard } from './breadcrumb.keyboard'
export { breadcrumbMachine } from './breadcrumb.machine'
export { breadcrumbMeta } from './breadcrumb.meta'
export { buildBreadcrumbItems, normalizeBreadcrumbNodes } from './breadcrumb.range'
export type { BreadcrumbApi, BreadcrumbItem, BreadcrumbLinkProps, BreadcrumbNode, BreadcrumbNodeMeta, BreadcrumbProps, BreadcrumbSchema, BreadcrumbTranslations } from './breadcrumb.types'
