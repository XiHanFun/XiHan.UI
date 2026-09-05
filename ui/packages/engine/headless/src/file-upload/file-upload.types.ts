import type { MachineSchema, PropTypes } from '@xihan-ui/core'

/** 被拒的缘由。 */
export type FileRejectReason
  /** 与 accept 声明的类型/扩展名都对不上。 */
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
  /** 字节数；给不出就不显示大小。 */
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
  /** 传完后服务端给的地址（upload 返回值带回）。 */
  url?: string
  /** status 为 error 时的失败原因。 */
  error?: unknown
}

/** upload 实现收到的一次传输任务。 */
export interface FileUploadRequest {
  file: File
  /** 汇报进度（0–100），进度条据此走。 */
  onProgress: (progress: number) => void
  /** 文件被删除或组件卸载时中止；实现应把它接给底层请求。 */
  signal: AbortSignal
}

export interface FileUploadResult {
  /** 传完后的访问地址，会记进该文件的传输快照。 */
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
  /** 本次收下的那些，不含原先就在列表里的。 */
  files: File[]
}

export interface FileUploadFileRejectDetails {
  files: FileUploadRejection[]
}

export interface FileUploadTranslations {
  /** 投放区的兜底可及名字：作者写了 label 部件时以 label 为准。 */
  dropzone: string
  /** 单条删除按钮的可及名字；只写一个"删除"读屏分不出删的是哪一条。 */
  deleteItem: (file: FileUploadFile) => string
  /** 清空按钮的可及名字。 */
  clearTrigger: string
}

/**
 * 条目自报家门：这一行显示的是哪个文件，由作者在部件上声明。
 * connect 因此是 (context/prop, 本条目声明) 的纯函数，不反查 DOM——
 * Vue 侧 connect 在 render 期求值（本帧 DOM 还不存在），WC 侧在 updated 后求值（DOM 已就位），
 * 连接期读 DOM 会让两个适配器的首帧快照分叉。
 */
export interface FileUploadItemProps {
  file: FileUploadFile
}

export interface FileUploadSchema extends MachineSchema {
  props: {
    /**
     * 允许的类型，写法与原生 input 的 accept 一致：
     * 'image/*' 这类通配、'.png' 这类扩展名、'application/pdf' 这类精确 MIME 都收，
     * 逗号分隔的整串或数组两种形态都行（属性只表达得了整串，数组要走 property）。
     */
    accept?: string | string[]
    /** 最多留几个文件，默认 1。给 Infinity 即不限。 */
    maxFiles?: number
    /** 单个文件的字节上限，默认不限。 */
    maxFileSize?: number
    /** 单个文件的字节下限，默认 0（挡住 0 字节的空文件可以设成 1）。 */
    minFileSize?: number
    disabled?: boolean
    /** 校验失败标注；只作用于样式与 data-invalid，不阻断收文件。 */
    invalid?: boolean
    /** 表单字段名；给了隐藏输入才参与提交。 */
    name?: string
    /** 已选文件。给定即受控：cell 直读 prop，写只发 onFilesChange 不落内部值。 */
    files?: File[]
    defaultFiles?: File[]
    /** 是否接受拖拽投放，默认 true。关掉后投放区不再拦默认行为，也不再出 data-dragging。 */
    allowDrop?: boolean
    /** 选目录而不是选文件（隐藏输入带 webkitdirectory）。 */
    directory?: boolean
    /** 移动端直接调用摄像头/麦克风采集。 */
    capture?: 'user' | 'environment'
    /**
     * 服务器已有附件（编辑表单回显）。给定即受控：cell 直读 prop，删改只发
     * onRemoteFilesChange 不落内部值。条目计入 maxFiles 总量，与本地文件一起渲染。
     */
    remoteFiles?: FileUploadRemoteFile[]
    defaultRemoteFiles?: FileUploadRemoteFile[]
    /**
     * 每个文件的传输实现。给了它组件才是上传器：收下的文件按 autoUpload 自动开传，
     * 进度、成败与返回地址都记进该文件的传输快照。不给则维持纯选择器。
     */
    upload?: (request: FileUploadRequest) => Promise<FileUploadResult | undefined | void> | FileUploadResult | undefined | void
    /** 收下即自动开传，默认 true；关掉后由 api.startUpload 逐个开。 */
    autoUpload?: boolean
    translations?: Partial<FileUploadTranslations>
    /** 列表变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 */
    onFilesChange?: (details: FileUploadFilesChangeDetails) => void
    /** 本次收下了哪些。受控与否都发——宿主要据此发起上传。 */
    onFileAccept?: (details: FileUploadFileAcceptDetails) => void
    /** 本次拒了哪些、各自为什么。 */
    onFileReject?: (details: FileUploadFileRejectDetails) => void
    /** 远程附件列表变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 */
    onRemoteFilesChange?: (details: FileUploadRemoteFilesChangeDetails) => void
    /** 单个文件传完（upload 的 Promise 兑现）。 */
    onUploadComplete?: (details: FileUploadCompleteDetails) => void
    /** 单个文件传败（upload 的 Promise 拒绝）；中止不算失败不发。 */
    onUploadError?: (details: FileUploadErrorDetails) => void
  }
  context: {
    /** 已收下的文件。受控（files 给定）时 cell 直读 prop。 */
    acceptedFiles: File[]
    /** 服务器已有附件。受控（remoteFiles 给定）时 cell 直读 prop。 */
    remoteFiles: FileUploadRemoteFile[]
    /** 各本地文件的传输快照，键是文件的内部 id。 */
    uploads: Record<string, FileUploadSnapshot>
  }
  computed: Record<string, never>
  refs: {
    /** File → 内部 id。文件对象是身份，WeakMap 不留住已删的。 */
    fileIds: WeakMap<File, string>
    /** 内部 id 流水号。放 refs 不放模块变量：同页两个组件各发各的号。 */
    fileSeq: { n: number }
    /** 传输中的中止句柄，键同 uploads。 */
    uploadControllers: Map<string, AbortController>
  }
  /** dragging = 有东西正悬在投放区上方，样式据此画高亮边框。 */
  state: 'idle' | 'dragging'
  event:
    /** 整份替换（外部 setFiles 走它），照样过校验。 */
    | { type: 'FILES.SET', files: File[] }
    /** 追加（选择框回来、拖拽投放都走它）。 */
    | { type: 'FILES.ADD', files: File[] }
    | { type: 'FILE.DELETE', file: File }
    | { type: 'FILES.CLEAR' }
    /** 打开系统文件选择框；DOM 操作在 action 里做。 */
    | { type: 'PICKER.OPEN' }
    | { type: 'DRAG.OVER' }
    | { type: 'DRAG.LEAVE' }
    | { type: 'DROP', files: File[] }
    /** 手动开传（autoUpload 关着）或失败后重试。 */
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
  /** 有东西正悬在投放区上方。 */
  dragging: boolean
  disabled: boolean
  invalid: boolean
  /** 一个文件都没有。清空按钮据此打 data-empty，空列表据此显示占位。 */
  empty: boolean
  /** 生效的数量上限（已按缺省与非法值归一）。 */
  maxFiles: number
  /** 字节数格式化成人读的形式，供作者渲染 item-size-text；远程附件没报大小时为空串。 */
  getFileSizeText: (file: FileUploadFile) => string
  /**
   * 该条目的传输快照：远程附件恒为 done；本地文件没配 upload 时为 null，
   * 配了而尚未开传为 idle。
   */
  uploadOf: (file: FileUploadFile) => FileUploadSnapshot | null
  /** 手动开传（autoUpload 关着时）或失败后重试；不在列表里与传输中的调了没效果。 */
  startUpload: (file: File) => void
  setFiles: (files: File[]) => void
  addFiles: (files: File[]) => void
  /** 本地文件按引用剔除（传输中会中止），远程附件按 id 剔除。 */
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
  getItemDeleteTriggerProps: (props: FileUploadItemProps) => T['button']
  getClearTriggerProps: () => T['button']
}
