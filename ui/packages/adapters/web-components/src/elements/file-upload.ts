import type { Scope } from '@xihan-ui/core'
import type {
  FileUploadApi,
  FileUploadCompleteDetails,
  FileUploadErrorDetails,
  FileUploadFileAcceptDetails,
  FileUploadFileRejectDetails,
  FileUploadFilesChangeDetails,
  FileUploadRemoteFile,
  FileUploadRemoteFilesChangeDetails,
  FileUploadSchema,
  FileUploadTranslations,
} from '@xihan-ui/headless'
import { createCounterIdGenerator, createScope } from '@xihan-ui/core'
import { connectFileUpload, fileUploadAnatomy, fileUploadMachine, fileUploadMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 空串也当缺席，避免 Number('') 落成 0
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }
// 三态布尔：缺席=undefined（走缺省）、在场=true、显式写 "false"=false。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/** 取作者写在条目上的 index，缺席或写坏了退回文档序。 */
function declaredIndex(el: HTMLElement, position: number): number {
  const raw = el.getAttribute('index')
  if (raw == null || raw.trim() === '')
    return position
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? Math.trunc(parsed) : position
}

/**
 * `<xh-file-upload>` —— Light-DOM 行为宿主：作者写 root/label/dropzone/trigger/hidden-input
 * 与列表若干角色节点，元素跑 file-upload 机器并把 connect 产出打上去。
 *
 * 投放区收 dragover/dragleave/drop，悬停期间带 data-dragging；点投放区、点 trigger、
 * 或在投放区上按 Enter/Space 都打开系统文件选择框（走隐藏输入的 click）。
 * 收进来的文件先过校验（类型/大小/数量），收下的进列表并派 file-accept，
 * 被拒的连同原因派 file-reject。
 *
 * 条目节点由作者按 `acceptedFiles` 渲染（听 files-change 重渲），元素不生成节点。
 * 条目按文档序对上列表里的文件，也可以自带 `index` 属性显式声明。
 * item-name 与 item-size-text 的文字由元素填（作者自己写了内容则不碰）。
 *
 * @customElement xh-file-upload
 * @attr {string} accept - 允许的类型，写法同原生 input：'image/*'、'.png'、精确 MIME，逗号分隔；数组形态请走 property
 * @attr {number} max-files - 最多留几个文件，默认 1
 * @attr {number} max-file-size - 单个文件的字节上限，默认不限
 * @attr {number} min-file-size - 单个文件的字节下限，默认 0
 * @attr {boolean} disabled - 禁用：投放区退出 Tab 序列，几个按钮带原生 disabled，增删改一律被守卫挡下
 * @attr {boolean} invalid - 校验失败标注
 * @attr {string} name - 表单字段名；给了隐藏输入才参与提交
 * @attr {boolean} allow-drop - 是否接受拖拽投放，默认 true；写 allow-drop="false" 关掉
 * @attr {boolean} directory - 选目录而不是选文件（隐藏输入带 webkitdirectory）
 * @attr {'user'|'environment'} capture - 移动端直接调用摄像头/麦克风采集
 * @attr {boolean} auto-upload - 收下即自动开传（须配 upload 实现），默认 true；写 auto-upload="false" 关掉
 * @fires files-change - 列表变化；detail 为 `{ files: File[] }`
 * @fires remote-files-change - 远程附件列表变化；detail 为 `{ files: FileUploadRemoteFile[] }`
 * @fires upload-complete - 单个文件传完；detail 为 `{ file, url? }`
 * @fires upload-error - 单个文件传败；detail 为 `{ file, error }`
 * @fires file-accept - 本次收下了哪些；detail 为 `{ files: File[] }`
 * @fires file-reject - 本次拒了哪些、各自为什么；detail 为 `{ files: { file, reasons }[] }`
 * @csspart root - 组件根容器，承载 data-dragging / data-disabled / data-invalid / data-empty
 * @csspart label - 标题；`for` 恒写向隐藏输入，故须是原生 `<label>` 才点得动
 * @csspart dropzone - role=button 的投放区，键盘入口也在这里
 * @csspart trigger - 打开文件选择框的按钮，建议放在投放区之外（按钮里再套按钮读屏只念外面那个）
 * @csspart hidden-input - type=file 的表单出口，视觉上藏起来
 * @csspart list - role=list 的列表容器，承载 data-empty
 * @csspart item - role=listitem 的一行，可自带 index 属性声明对应第几个文件
 * @csspart item-preview - 缩略图占位（aria-hidden），带 data-file-type 供皮肤挑图标
 * @csspart item-name - 文件名（元素代填）
 * @csspart item-size-text - 人读的文件大小（元素代填）
 * @csspart item-delete-trigger - 删掉这一条
 * @csspart clear-trigger - 清空整份列表；列表为空时打 data-empty，按钮照常在位可聚焦
 */
export class XhFileUploadElement extends XhElement {
  static override partContract = { anatomy: fileUploadAnatomy, meta: fileUploadMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    // 文件与文案是对象，只走 property；files 给了即受控，内部写入只发 files-change
    files: { attribute: false },
    defaultFiles: { attribute: false },
    remoteFiles: { attribute: false },
    defaultRemoteFiles: { attribute: false },
    upload: { attribute: false },
    autoUpload: { converter: BOOLEAN_CONVERTER, attribute: 'auto-upload' },
    accept: { converter: STRING_CONVERTER },
    maxFiles: { converter: NUMBER_CONVERTER, attribute: 'max-files' },
    maxFileSize: { converter: NUMBER_CONVERTER, attribute: 'max-file-size' },
    minFileSize: { converter: NUMBER_CONVERTER, attribute: 'min-file-size' },
    disabled: { type: Boolean },
    invalid: { type: Boolean },
    name: { converter: STRING_CONVERTER },
    allowDrop: { converter: BOOLEAN_CONVERTER, attribute: 'allow-drop' },
    directory: { type: Boolean },
    capture: { converter: STRING_CONVERTER },
    translations: { attribute: false },
  }

  declare files?: File[]
  declare defaultFiles?: File[]
  declare remoteFiles?: FileUploadRemoteFile[]
  declare defaultRemoteFiles?: FileUploadRemoteFile[]
  declare upload?: FileUploadSchema['props']['upload']
  declare autoUpload?: boolean
  declare accept?: string | string[]
  declare maxFiles?: number
  declare maxFileSize?: number
  declare minFileSize?: number
  declare disabled?: boolean
  declare invalid?: boolean
  declare name?: string
  declare allowDrop?: boolean
  declare directory?: boolean
  declare capture?: 'user' | 'environment'
  declare translations?: Partial<FileUploadTranslations>

  // scope 绑在本元素上：打开选择框要在 scope 的 root 里按 id 找回隐藏输入
  private readonly uploadScope: Scope = createScope(this, createCounterIdGenerator())

  private readonly notifyChange = (details: FileUploadFilesChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('files-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyAccept = (details: FileUploadFileAcceptDetails): void => {
    this.dispatchEvent(new CustomEvent('file-accept', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyReject = (details: FileUploadFileRejectDetails): void => {
    this.dispatchEvent(new CustomEvent('file-reject', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyRemoteChange = (details: FileUploadRemoteFilesChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('remote-files-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyUploadComplete = (details: FileUploadCompleteDetails): void => {
    this.dispatchEvent(new CustomEvent('upload-complete', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyUploadError = (details: FileUploadErrorDetails): void => {
    this.dispatchEvent(new CustomEvent('upload-error', { detail: details, bubbles: true, composed: true }))
  }

  // file-upload 机器无常驻副作用，controller 只带 props 与 scope。
  private readonly ctrl = new MachineController<FileUploadSchema>(
    this,
    fileUploadMachine,
    () => this.machineProps(),
    { scope: this.uploadScope },
  )

  private machineProps(): Partial<FileUploadSchema['props']> {
    return {
      files: this.files,
      defaultFiles: this.defaultFiles,
      remoteFiles: this.remoteFiles,
      defaultRemoteFiles: this.defaultRemoteFiles,
      upload: this.upload,
      autoUpload: this.autoUpload,
      accept: this.accept,
      maxFiles: this.maxFiles,
      maxFileSize: this.maxFileSize,
      minFileSize: this.minFileSize,
      disabled: this.disabled ?? false,
      invalid: this.invalid ?? false,
      name: this.name,
      allowDrop: this.allowDrop,
      directory: this.directory ?? false,
      capture: this.capture,
      translations: this.translations,
      onFilesChange: this.notifyChange,
      onRemoteFilesChange: this.notifyRemoteChange,
      onUploadComplete: this.notifyUploadComplete,
      onUploadError: this.notifyUploadError,
      onFileAccept: this.notifyAccept,
      onFileReject: this.notifyReject,
    }
  }

  /** 命令式入口共用的取法；机器要到进文档（hostConnected）才建，未建则抛。 */
  private commands(): FileUploadApi {
    if (!this.ctrl.service)
      throw new Error('[xh] <xh-file-upload> 还没进文档，命令式接口此时不可用')
    return connectFileUpload(this.ctrl.service, wcNormalize)
  }

  /** 当前已收下的文件；作者据此渲染条目节点。 */
  get acceptedFiles(): File[] {
    return this.commands().acceptedFiles
  }

  /** 打开系统文件选择框（等价于点投放区或 trigger）。 */
  openFilePicker(): void {
    this.commands().openFilePicker()
  }

  /** 整份替换，照样过校验。 */
  setFiles(files: File[]): void {
    this.commands().setFiles(files)
  }

  /** 追加，照样过校验。 */
  addFiles(files: File[]): void {
    this.commands().addFiles(files)
  }

  /** 按引用剔除某一个。 */
  deleteFile(file: File): void {
    this.commands().deleteFile(file)
  }

  /** 清空整份列表（本地与远程一起）。 */
  clear(): void {
    this.commands().clear()
  }

  /** 文本是否归元素填：节点非空即判为作者自定义渲染。首次见到时定死，之后不再回读——回读分不出内容是作者写的还是上一帧自己写的。 */
  private readonly ownsText = new WeakMap<HTMLElement, boolean>()

  private fillText(el: HTMLElement, text: string): void {
    let owned = this.ownsText.get(el)
    if (owned === undefined) {
      owned = (el.textContent ?? '').trim() === ''
      this.ownsText.set(el, owned)
    }
    if (!owned || el.textContent === text)
      return
    el.textContent = text
  }

  /** 取 owner 子树内指定名字的角色节点。 */
  private partsIn(owner: HTMLElement, name: string): HTMLElement[] {
    return this.getParts(name).filter(el => owner.contains(el))
  }

  /** 条目内的子部件名，交还与逐个打属性都按这一份走。 */
  private static readonly ITEM_PARTS = ['item-preview', 'item-name', 'item-size-text', 'item-delete-trigger'] as const

  /** 位子比文件多时整条交还：撤掉上一帧写的属性与处理器，代填的文字一并抹掉。 */
  private releaseItem(el: HTMLElement): void {
    this.spreader.release(el)
    for (const name of XhFileUploadElement.ITEM_PARTS) {
      for (const child of this.partsIn(el, name)) {
        this.spreader.release(child)
        if (this.ownsText.get(child))
          child.textContent = ''
      }
    }
    // 交还只摘属性与监听器，作者的 <button> 还在，仍占 Tab 位却已经按不动、
    // 连 aria-label 都撤回了（图标按钮就此没有可访问名）。空位整条收起来。
    this.setPartHidden(el, true)
  }

  protected wire(): void {
    const api = connectFileUpload(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('label', api.getLabelProps() as Record<string, unknown>)
    put('dropzone', api.getDropzoneProps() as Record<string, unknown>)
    put('trigger', api.getTriggerProps() as Record<string, unknown>)
    put('hidden-input', api.getHiddenInputProps() as Record<string, unknown>)
    put('list', api.getListProps() as Record<string, unknown>)
    put('clear-trigger', api.getClearTriggerProps() as Record<string, unknown>)

    // 条目逐个打，身份取列表里对应位置的那个文件
    const files = api.acceptedFiles
    this.getParts('item').forEach((el, position) => {
      const file = files[declaredIndex(el, position)]
      if (!file) {
        this.releaseItem(el)
        return
      }
      const item = { file }
      this.setPartHidden(el, false)
      this.spreader.spread(el, api.getItemProps(item) as Record<string, unknown>)
      for (const preview of this.partsIn(el, 'item-preview'))
        this.spreader.spread(preview, api.getItemPreviewProps(item) as Record<string, unknown>)
      for (const name of this.partsIn(el, 'item-name')) {
        this.spreader.spread(name, api.getItemNameProps(item) as Record<string, unknown>)
        this.fillText(name, file.name)
      }
      for (const size of this.partsIn(el, 'item-size-text')) {
        this.spreader.spread(size, api.getItemSizeTextProps(item) as Record<string, unknown>)
        this.fillText(size, api.getFileSizeText(file))
      }
      for (const del of this.partsIn(el, 'item-delete-trigger'))
        this.spreader.spread(del, api.getItemDeleteTriggerProps(item) as Record<string, unknown>)
    })
  }
}
