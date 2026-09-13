/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 approval 模块的公共接口。

export { approvalAnatomy } from './approval.anatomy'
export { connectApproval } from './approval.connect'
export { approvalKeyboard } from './approval.keyboard'
export { approvalMachine } from './approval.machine'
export { approvalMeta } from './approval.meta'
export { APPROVAL_DENY_SELECTOR, canApproveScopes } from './approval.types'
export type {
  ApprovalApi,
  ApprovalDecisionDetails,
  ApprovalNoteChangeDetails,
  ApprovalSchema,
  ApprovalScope,
  ApprovalScopesChangeDetails,
  ApprovalStatus,
  ApprovalTranslations,
} from './approval.types'
