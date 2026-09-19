/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 pagination 模块的公共接口。

export { paginationAnatomy } from './pagination.anatomy'
export { connectPagination } from './pagination.connect'
export { paginationKeyboard } from './pagination.keyboard'
export {
  PAGINATION_PAGE_SIZE,
  PAGINATION_SIBLING_COUNT,
  paginationLabels,
  paginationMachine,
  paginationPageSizeSelectProps,
} from './pagination.machine'
export { paginationMeta } from './pagination.meta'
export {
  buildPageItems,
  buildPageSequence,
  clampPage,
  normalizeCount,
  normalizePageSize,
  pageRangeOf,
  pageSizeOptionsOf,
  totalPagesOf,
} from './pagination.range'
export type { PaginationEllipsisSide, PaginationEntryRange, PaginationPage, PaginationPageItem } from './pagination.range'
export type {
  PaginationApi,
  PaginationEllipsisTriggerProps,
  PaginationItemProps,
  PaginationPageChangeDetails,
  PaginationPageSizeChangeDetails,
  PaginationPressedKey,
  PaginationSchema,
  PaginationServices,
  PaginationTranslations,
} from './pagination.types'
