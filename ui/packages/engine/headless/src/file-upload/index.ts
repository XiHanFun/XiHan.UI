/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 file upload 模块的公共接口。

export { fileUploadAnatomy, fileUploadHiddenInputId } from './file-upload.anatomy'
export { connectFileUpload } from './file-upload.connect'
export { fileUploadKeyboard } from './file-upload.keyboard'
export {
  acceptAttr,
  acceptsFile,
  FILE_UPLOAD_MAX_FILES,
  fileUploadMachine,
  formatFileSize,
  normalizeAccept,
  normalizeMaxConcurrentUploads,
  normalizeMaxFiles,
  sameFiles,
  sameRemoteFiles,
  validateFiles,
} from './file-upload.machine'
export type { FileValidationOptions } from './file-upload.machine'
export { fileUploadMeta } from './file-upload.meta'
export type {
  FileRejectReason,
  FileUploadApi,
  FileUploadCancelDetails,
  FileUploadCompleteDetails,
  FileUploadErrorDetails,
  FileUploadFile,
  FileUploadFileAcceptDetails,
  FileUploadFileRejectDetails,
  FileUploadFilesChangeDetails,
  FileUploadItemProps,
  FileUploadPressedKey,
  FileUploadRejectCode,
  FileUploadRejection,
  FileUploadRemoteFile,
  FileUploadRemoteFilesChangeDetails,
  FileUploadRequest,
  FileUploadResult,
  FileUploadSchema,
  FileUploadSnapshot,
  FileUploadStatus,
  FileUploadTranslations,
  FileUploadValidateContext,
  FileUploadValidationResult,
} from './file-upload.types'
