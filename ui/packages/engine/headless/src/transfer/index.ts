/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 transfer 模块的公共接口。

export { transferAnatomy, transferItemQuery } from './transfer.anatomy'
export { connectTransfer } from './transfer.connect'
export { transferKeyboard } from './transfer.keyboard'
export { transferFocusKey, transferMachine, transferOppositeSide, transferPageKey, transferQueryKey } from './transfer.machine'
export { transferMeta } from './transfer.meta'
export {
  transferCheckedValues,
  transferCheckState,
  transferClampPage,
  transferIsCheckable,
  transferMatchesQuery,
  transferMove,
  transferOperableValues,
  transferPageCount,
  transferPageItems,
  transferPageSize,
  transferSideOf,
  transferToggleAll,
  transferToggleValue,
  transferVisibleItems,
} from './transfer.sets'
export type { TransferMoveInput, TransferMoveResult } from './transfer.sets'
export type { TransferApi, TransferCheckState, TransferFilter, TransferGroupProps, TransferItem, TransferItemProps, TransferPanelProps, TransferPressedKey, TransferSchema, TransferSelectionChangeDetails, TransferSide, TransferTranslations, TransferValueChangeDetails } from './transfer.types'
