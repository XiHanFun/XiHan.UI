/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 dialog 模块的公共接口。

export { createDialogServiceController } from './dialog-service.controller'
export { dialogServiceBadgeTone } from './dialog-service.controller'
export type { DialogServiceActionError, DialogServiceBadge, DialogServiceController, DialogServiceControllerOptions, DialogServiceControllerSpec, DialogServiceControllerState, DialogServiceRequest } from './dialog-service.controller'
export { dialogAnatomy } from './dialog.anatomy'
export { connectDialog } from './dialog.connect'
export { dialogKeyboard } from './dialog.keyboard'
export { dialogMachine } from './dialog.machine'
export { dialogMeta } from './dialog.meta'
export type { DialogApi, DialogOpenChangeDetails, DialogRefs, DialogSchema, DialogTranslations } from './dialog.types'
