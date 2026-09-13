/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 download trigger 模块的公共接口。

export { downloadTriggerAnatomy } from './download-trigger.anatomy'
export { connectDownloadTrigger } from './download-trigger.connect'
export { downloadTriggerKeyboard } from './download-trigger.keyboard'
export {
  DOWNLOAD_TRIGGER_FILE_NAME,
  DOWNLOAD_TRIGGER_MIME_TYPE,
  DOWNLOAD_TRIGGER_REVOKE_DELAY,
  downloadTriggerMachine,
  resolveDownloadData,
  resolveDownloadFileName,
  saveDownload,
  toDownloadBlob,
} from './download-trigger.machine'
export { downloadTriggerMeta } from './download-trigger.meta'
export type {
  DownloadTriggerApi,
  DownloadTriggerCompleteDetails,
  DownloadTriggerContent,
  DownloadTriggerData,
  DownloadTriggerErrorDetails,
  DownloadTriggerSchema,
  DownloadTriggerStatus,
  DownloadTriggerTranslations,
} from './download-trigger.types'
