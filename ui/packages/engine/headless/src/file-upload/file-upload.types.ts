/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 file upload 类型契约。

import type { MachineSchema, PropTypes } from '@xihan-ui/core'

/** 被拒绝的原因。 */
export type FileRejectReason
  /** 与 accept 声明的类型 / 扩展名都不匹配。 */
  = | 'type'
  /** 超过 maxFileSize。 */
    | 'size-too-large'
  /** 小于 minFileSize。 */
    | 'size-too-small'
  /** 其余校验都通过，但超过 maxFiles。 */
    | 'too-many-files'

export interface FileUploadRejection {
  file: File
  /** 可能同时命中多条。 */
  reasons: FileRejectReason[]
}

/** 服务器上已有的附件：没有本地字节，只有元信息与访问地址。 */
export interface FileUploadRemoteFile {
  /** 稳定标识（通常是服务端主键），删除与去重都以它为准。 */
  id: string
  name: string
  /** 字节数；未提供时不显示大小。 */
  size?: number
  /** MIME 类型。 */
  type?: string
  url?: string
}

/** 列表条目：本地文件或服务器已有附件。 */
export type FileUploadFile = File | FileUploadRemoteFile

export type FileUploadStatus = 'idle' | 'uploading' | 'done' | 'error'

/** 单个文件的传输快照。远程附件恒为 done。 */
export interface FileUploadSnapshot {
  status: FileUploadStatus
  /** 0–100。 */
  progress: number
  /** 传输完成后服务端返回的地址（upload 返回值带回）。 */
  url?: string
  /** status 为 error 时的失败原因。 */
  error?: unknown
}

/** upload 实现收到的一次传输任务。 */
export interface FileUploadRequest {
  file: File
  /** 汇报进度（0–100），进度条据此更新。 */
  onProgress: (progress: number) => void
  /** 文件被删除或组件卸载时中止；实现应把它传递给底层请求。 */
  signal: AbortSignal
}

export interface FileUploadResult {
  /** 传输完成后的访问地址，记入该文件的传输快照。 */
  url?: string
}

export interface FileUploadCompleteDetails {
  file: File
  url?: string
}

export interface FileUploadErrorDetails {
  file: File
  error: unknown
}

export interface FileUploadRemoteFilesChangeDetails {
  /** 变化之后的完整列表，不是增量。 */
  files: FileUploadRemoteFile[]
}

export interface FileUploadValidationResult {
  accepted: File[]
  rejected: FileUploadRejection[]
}

export interface FileUploadFilesChangeDetails {
  /** 变化之后的完整列表，不是增量。 */
  files: File[]
}

export interface FileUploadFileAcceptDetails {
  /** 本次接受的文件，不含原先已在列表中的。 */
  files: File[]
}

export interface FileUploadFileRejectDetails {
  files: FileUploadRejection[]
}

export interface FileUploadTranslations {
  /** 投放区的兜底可及名：作者提供 label 部件时以 label 为准。 */
  dropzone: string
  /** 单条删除按钮的可及名；只写「删除」时读屏无法区分删除的是哪一条。 */
  deleteItem: (file: FileUploadFile) => string
  /** 清空按钮的可及名。 */
  clearTrigger: string
}

/**
 * 条目的声明：该行显示的是哪个文件，由作者在部件上声明。
 * connect 因此是 (context/prop, 本条目声明) 的纯函数，不反查 DOM：
 * Vue 侧 connect 在 render 期求值（本帧 DOM 尚不存在），WC 侧在 updated 后求值（DOM 已就位），
 * 连接期读取 DOM 会使两个适配器的首帧快照分叉。
 */
export interface FileUploadItemProps {
  file: FileUploadFile
}

export interface FileUploadSchema extends MachineSchema {
  props: {
    /**
     * 允许的类型，写法与原生 input 的 accept 一致：
     * 接受 'image/*' 这类通配、'.png' 这类扩展名、'application/pdf' 这类精确 MIME，
     * 逗号分隔的整串或数组两种形态均可（属性只能表达整串，数组需通过 property）。
     */
    accept?: string | string[]
    /** 最多保留的文件数，默认 1。提供 Infinity 即不限。 */
    maxFiles?: number
    /** 单个文件的字节上限，默认不限。 */
    maxFileSize?: number
    /** 单个文件的字节下限，默认 0（拦截 0 字节的空文件可设为 1）。 */
    minFileSize?: number
    disabled?: boolean
    /** 校验失败标注；只作用于样式与 data-invalid，不阻断接收文件。 */
    invalid?: boolean
    /** 表单字段名；提供后隐藏输入才参与提交。 */
    name?: string
    /** 已选文件。提供即受控：cell 直读 prop，写入只发 onFilesChange 不落内部值。 */
    files?: File[]
    defaultFiles?: File[]
    /** 是否接受拖拽投放，默认 true。关闭后投放区不再拦截默认行为，也不再输出 data-dragging。 */
    allowDrop?: boolean
    /** 选择目录而不是文件（隐藏输入带 webkitdirectory）。 */
    directory?: boolean
    /** 移动端直接调用摄像头 / 麦克风采集。 */
    capture?: 'user' | 'environment'
    /**
     * 服务器已有附件（编辑表单回显）。提供即受控：cell 直读 prop，删改只发
     * onRemoteFilesChange 不落内部值。条目计入 maxFiles 总量，与本地文件一起渲染。
     */
    remoteFiles?: FileUploadRemoteFile[]
    defaultRemoteFiles?: FileUploadRemoteFile[]
    /**
     * 每个文件的传输实现。提供后组件才是上传器：接受的文件按 autoUpload 自动开始传输，
     * 进度、成败与返回地址都记入该文件的传输快照。未提供时保持纯选择器。
     */
    upload?: (request: FileUploadRequest) => Promise<FileUploadResult | undefined | void> | FileUploadResult | undefined | void
    /** 接受后即自动开始传输，默认 true；关闭后由 api.startUpload 逐个开始。 */
    autoUpload?: boolean
    translations?: Partial<FileUploadTranslations>
    /** 列表变化意图回调；受控时是唯一出口，非受控时随内部写入一并通知。 */
    onFilesChange?: (details: FileUploadFilesChangeDetails) => void
    /** 本次接受了哪些文件。受控与否都发出：宿主据此发起上传。 */
    onFileAccept?: (details: FileUploadFileAcceptDetails) => void
    /** 本次拒绝了哪些文件及各自的原因。 */
    onFileReject?: (details: FileUploadFileRejectDetails) => void
    /** 远程附件列表变化意图回调；受控时是唯一出口，非受控时随内部写入一并通知。 */
    onRemoteFilesChange?: (details: FileUploadRemoteFilesChangeDetails) => void
    /** 单个文件传输完成（upload 的 Promise 兑现）。 */
    onUploadComplete?: (details: FileUploadCompleteDetails) => void
    /** 单个文件传输失败（upload 的 Promise 拒绝）；中止不视为失败，不发出。 */
    onUploadError?: (details: FileUploadErrorDetails) => void
  }
  context: {
    /** 已接受的文件。受控（files 提供）时 cell 直读 prop。 */
    acceptedFiles: File[]
    /** 服务器已有附件。受控（remoteFiles 提供）时 cell 直读 prop。 */
    remoteFiles: FileUploadRemoteFile[]
    /** 各本地文件的传输快照，键是文件的内部 id。 */
    uploads: Record<string, FileUploadSnapshot>
  }
  computed: Record<string, never>
  refs: {
    /** File → 内部 id。文件对象是身份，WeakMap 不保留已删除的文件。 */
    fileIds: WeakMap<File, string>
    /** 内部 id 流水号。放在 refs 而不是模块变量：同页两个组件各自分配。 */
    fileSeq: { n: number }
    /** 传输中的中止句柄，键同 uploads。 */
    uploadControllers: Map<string, AbortController>
  }
  /** dragging = 有内容正悬停在投放区上方，样式据此绘制高亮边框。 */
  state: 'idle' | 'dragging'
  event:
    /** 整份替换（外部 setFiles 经过它），同样经过校验。 */
    | { type: 'FILES.SET', files: File[] }
    /** 追加（选择框返回、拖拽投放都经过它）。 */
    | { type: 'FILES.ADD', files: File[] }
    | { type: 'FILE.DELETE', file: File }
    | { type: 'FILES.CLEAR' }
    /** 打开系统文件选择框；DOM 操作在 action 中完成。 */
    | { type: 'PICKER.OPEN' }
    | { type: 'DRAG.OVER' }
    | { type: 'DRAG.LEAVE' }
    | { type: 'DROP', files: File[] }
    /** 手动开始传输（autoUpload 关闭时）或失败后重试。 */
    | { type: 'UPLOAD.START', file: File }
    | { type: 'REMOTE.DELETE', id: string }
    | { type: 'FORM.RESET' }
  tag: never
  guard: 'canChange' | 'canDrop'
  action: 'setFiles' | 'addFiles' | 'deleteFile' | 'clearFiles' | 'openFilePicker' | 'resetToDefault' | 'syncUploads' | 'startUpload' | 'deleteRemoteFile'
  effect: 'trackUploads'
}

export interface FileUploadApi<T extends PropTypes = PropTypes> {
  acceptedFiles: File[]
  /** 服务器已有附件。 */
  remoteFiles: FileUploadRemoteFile[]
  /** 渲染顺序的完整列表：远程在前、本地在后。 */
  allFiles: FileUploadFile[]
  /** 有内容正悬停在投放区上方。 */
  dragging: boolean
  disabled: boolean
  invalid: boolean
  /** 没有任何文件。清空按钮据此写 data-empty，空列表据此显示占位。 */
  empty: boolean
  /** 生效的数量上限（已按默认值与非法值归一）。 */
  maxFiles: number
  /** 字节数格式化为可读形式，供作者渲染 item-size-text；远程附件未报大小时为空串。 */
  getFileSizeText: (file: FileUploadFile) => string
  /**
   * 该条目的传输快照：远程附件恒为 done；本地文件未配置 upload 时为 null，
   * 已配置而尚未开始传输时为 idle。
   */
  uploadOf: (file: FileUploadFile) => FileUploadSnapshot | null
  /** 手动开始传输（autoUpload 关闭时）或失败后重试；不在列表中或传输中的文件调用无效。 */
  startUpload: (file: File) => void
  setFiles: (files: File[]) => void
  addFiles: (files: File[]) => void
  /** 本地文件按引用移除（传输中会中止），远程附件按 id 移除。 */
  deleteFile: (file: FileUploadFile) => void
  /** 清空整份列表（本地与远程一起）。 */
  clear: () => void
  openFilePicker: () => void
  getRootProps: () => T['element']
  getLabelProps: () => T['label']
  getDropzoneProps: () => T['element']
  getTriggerProps: () => T['button']
  getHiddenInputProps: () => T['input']
  getListProps: () => T['element']
  getItemProps: (props: FileUploadItemProps) => T['element']
  getItemNameProps: (props: FileUploadItemProps) => T['element']
  getItemSizeTextProps: (props: FileUploadItemProps) => T['element']
  getItemPreviewProps: (props: FileUploadItemProps) => T['element']
  /** 该条目的传输进度条，纯装饰；进度比例写在私有槽上供皮肤计算宽度。 */
  getItemProgressProps: (props: FileUploadItemProps) => T['element']
  getItemDeleteTriggerProps: (props: FileUploadItemProps) => T['button']
  getClearTriggerProps: () => T['button']
}
