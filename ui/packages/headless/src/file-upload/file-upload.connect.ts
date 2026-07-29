import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { FileUploadApi, FileUploadSchema } from './file-upload.types'
import { contains, dataAttr, isHTMLElement } from '@xihan-ui/core'
import { fileUploadAnatomy, fileUploadHiddenInputId } from './file-upload.anatomy'
import { acceptAttr, formatFileSize, normalizeMaxFiles } from './file-upload.machine'

const parts = fileUploadAnatomy.build()

/** 隐藏输入不能用 display:none：原生校验提示需要一个可定位的框。 */
const VISUALLY_HIDDEN = {
  position: 'absolute',
  inlineSize: '1px',
  blockSize: '1px',
  margin: '-1px',
  padding: '0',
  border: '0',
  overflow: 'hidden',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
}

/** 投放区内自带行为的节点。隐藏输入的 click 会冒上来，不拦下会闭成死循环。 */
const INTERACTIVE_SELECTOR = [
  parts.trigger.selector,
  parts['item-delete-trigger'].selector,
  parts['clear-trigger'].selector,
  parts['hidden-input'].selector,
].join(',')

/** 取 DataTransfer 里的文件，类数组摊成真数组。 */
function filesFromTransfer(transfer: DataTransfer | null): File[] {
  return transfer ? Array.from(transfer.files ?? []) : []
}

export function connectFileUpload<T extends PropTypes>(
  service: Service<FileUploadSchema>,
  normalize: NormalizeProps<T>,
): FileUploadApi<T> {
  const { state, context, prop, send, scope } = service
  const acceptedFiles = context.get('acceptedFiles')
  const dragging = state.get() === 'dragging'
  const disabled = !!prop('disabled')
  const invalid = !!prop('invalid')
  const allowDrop = prop('allowDrop') ?? true
  const canDrop = allowDrop && !disabled
  const maxFiles = normalizeMaxFiles(prop('maxFiles'))
  const empty = acceptedFiles.length === 0
  const ids = scope.ids('file-upload', 'label', 'dropzone')
  const hiddenInputId = fileUploadHiddenInputId(scope)

  const translations = prop('translations')
  const label = {
    dropzone: translations?.dropzone ?? 'Drop files here',
    deleteFile: translations?.deleteFile ?? ((file: File) => `Delete ${file.name}`),
    clearFiles: translations?.clearFiles ?? 'Clear all files',
  }

  /** 判断点击是否落在区内自带行为的节点上。只在事件回调里调用，渲染期不得调用。 */
  const fromInteractivePart = (target: EventTarget | null): boolean =>
    isHTMLElement(target) && target.closest(INTERACTIVE_SELECTOR) != null

  return {
    acceptedFiles,
    dragging,
    disabled,
    invalid,
    empty,
    maxFiles,
    getFileSizeText: file => formatFileSize(file.size),
    setFiles: files => send({ type: 'FILES.SET', files }),
    addFiles: files => send({ type: 'FILES.ADD', files }),
    deleteFile: file => send({ type: 'FILE.DELETE', file }),
    clearFiles: () => send({ type: 'FILES.CLEAR' }),
    openFilePicker: () => send({ type: 'PICKER.OPEN' }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-dragging': dataAttr(dragging),
      'data-disabled': dataAttr(disabled),
      'data-invalid': dataAttr(invalid),
      'data-empty': dataAttr(empty),
    }),

    getLabelProps: () => normalize.label({
      ...parts.label.attrs,
      // for 指向隐藏输入，此部件必须是真的 <label>，别的标签点不动
      'id': ids.label,
      'for': hiddenInputId,
      'data-disabled': dataAttr(disabled),
    }),

    /** 投放区兼作打开选择框的按钮，故报 role=button；trigger 宜放在投放区之外。 */
    getDropzoneProps: () => normalize.element({
      ...parts.dropzone.attrs,
      'id': ids.dropzone,
      'role': 'button',
      // 优先取作者写的 label；未写时是悬空 IDREF，按 accname 规则跳过并退回兜底文案
      'aria-labelledby': ids.label,
      'aria-label': label.dropzone,
      // div 上原生 disabled 不生效，显式写 aria-disabled 并退出 Tab 序列
      'aria-disabled': disabled ? 'true' : 'false',
      'tabindex': disabled ? -1 : 0,
      'data-dragging': dataAttr(dragging),
      'data-disabled': dataAttr(disabled),
      'data-invalid': dataAttr(invalid),
      'onClick': (event: MouseEvent) => {
        if (disabled)
          return
        if (fromInteractivePart(event.target))
          return
        send({ type: 'PICKER.OPEN' })
      },
      'onKeyDown': (event: KeyboardEvent) => {
        if (disabled)
          return
        if (event.key !== 'Enter' && event.key !== ' ')
          return
        // div 不会被浏览器合成点击，且空格会滚动页面，两者都要自己接管
        event.preventDefault()
        send({ type: 'PICKER.OPEN' })
      },
      'onDragOver': (event: DragEvent) => {
        if (!canDrop)
          return
        // 不拦下默认行为浏览器不会派 drop
        event.preventDefault()
        send({ type: 'DRAG.OVER' })
      },
      'onDragLeave': (event: DragEvent) => {
        if (!canDrop)
          return
        // 子节点之间移动同样会派 dragleave，判据是去处还在不在区内
        if (contains(event.currentTarget as HTMLElement, event.relatedTarget as Node | null))
          return
        send({ type: 'DRAG.LEAVE' })
      },
      'onDrop': (event: DragEvent) => {
        if (!canDrop)
          return
        // 不拦下浏览器会直接打开该文件并顶掉当前页
        event.preventDefault()
        send({ type: 'DROP', files: filesFromTransfer(event.dataTransfer) })
      },
    }),

    // 单体控件用原生 disabled；编程调用由机器上的 canChange 守卫兜底
    getTriggerProps: () => normalize.button({
      ...parts.trigger.attrs,
      'type': 'button',
      'disabled': disabled || undefined,
      'data-disabled': dataAttr(disabled),
      'onClick': () => send({ type: 'PICKER.OPEN' }),
    }),

    getHiddenInputProps: () => normalize.input({
      ...parts['hidden-input'].attrs,
      // id 是机器打开选择框时找回本节点的依据
      id: hiddenInputId,
      type: 'file',
      // name 缺省即不产出该属性，此时不参与表单提交
      name: prop('name'),
      accept: acceptAttr(prop('accept')),
      // 是否多选由数量上限决定
      multiple: maxFiles > 1 || undefined,
      webkitdirectory: prop('directory') || undefined,
      capture: prop('capture'),
      disabled: disabled || undefined,
      // 隐藏输入不占 Tab 位，键盘入口是投放区与 trigger
      tabindex: -1,
      style: VISUALLY_HIDDEN,
      onClick: (event: MouseEvent) => {
        // 打开选择框调的就是本节点 click()，冒到投放区会被当成再次打开
        event.stopPropagation()
      },
      onChange: (event: Event) => {
        const el = event.currentTarget as HTMLInputElement
        send({ type: 'FILES.ADD', files: Array.from(el.files ?? []) })
        // 拨回空串：不清掉的话再选同一个文件，浏览器认为"值没变"，change 不会再来一次。
        // 先比一次是因为空值再赋空值毫无意义，而文件输入的 value 只接受空串
        if (el.value !== '')
          el.value = ''
      },
    }),

    getItemGroupProps: () => normalize.element({
      ...parts['item-group'].attrs,
      // 报列表语义，读屏据此播报项数
      'role': 'list',
      'data-empty': dataAttr(empty),
      'data-disabled': dataAttr(disabled),
    }),

    // 文件名与字节数照原样挂成属性：一致性套件只比得了属性，
    // 文本由适配器填（Vue 走插槽兜底、WC 写 textContent），属性是"这一行绑的是哪个文件"的凭据
    getItemProps: ({ file }) => normalize.element({
      ...parts.item.attrs,
      'role': 'listitem',
      'data-file-name': file.name,
      'data-file-size': String(file.size),
      'data-disabled': dataAttr(disabled),
    }),

    getItemNameProps: ({ file }) => normalize.element({
      ...parts['item-name'].attrs,
      // 长文件名会被收成省略号，title 提供全名
      'title': file.name,
      'data-disabled': dataAttr(disabled),
    }),

    getItemSizeTextProps: ({ file }) => normalize.element({
      ...parts['item-size-text'].attrs,
      'data-file-size': String(file.size),
      'data-disabled': dataAttr(disabled),
    }),

    getItemPreviewProps: ({ file }) => normalize.element({
      ...parts['item-preview'].attrs,
      // 纯装饰，对读屏隐藏
      'aria-hidden': 'true',
      // 系统给不出 MIME 时写 unknown，留空串会让未知类型与属性没写在选择器里分不开
      'data-file-type': file.type || 'unknown',
      'data-disabled': dataAttr(disabled),
    }),

    getItemDeleteTriggerProps: ({ file }) => normalize.button({
      ...parts['item-delete-trigger'].attrs,
      'type': 'button',
      // 名字带上文件名，否则多条删除按钮的可访问名完全相同
      'aria-label': label.deleteFile(file),
      'disabled': disabled || undefined,
      'data-disabled': dataAttr(disabled),
      'onClick': () => send({ type: 'FILE.DELETE', file }),
    }),

    getClearTriggerProps: () => normalize.button({
      ...parts['clear-trigger'].attrs,
      'type': 'button',
      'aria-label': label.clearFiles,
      // 无文件时禁用，单体控件用原生 disabled
      'disabled': disabled || empty || undefined,
      'data-disabled': dataAttr(disabled || empty),
      'onClick': () => send({ type: 'FILES.CLEAR' }),
    }),
  }
}
