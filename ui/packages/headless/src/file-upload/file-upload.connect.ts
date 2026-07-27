import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { FileUploadApi, FileUploadSchema } from './file-upload.types'
import { contains, dataAttr, isHTMLElement } from '@xihan-ui/core'
import { fileUploadAnatomy, fileUploadHiddenInputId } from './file-upload.anatomy'
import { acceptAttr, formatFileSize, normalizeMaxFiles } from './file-upload.machine'

const parts = fileUploadAnatomy.build()

/**
 * 隐藏输入不能 display:none：那样它退出布局，原生表单校验的气泡就没有可指的锚点，
 * 浏览器只好静默拒绝提交。视觉上藏起来、布局上留一格，是这类表单影子的通行写法。
 */
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

/**
 * 投放区里那些"自己有活儿要干"的节点。点它们时投放区不该再把这一下当成"请打开选择框"：
 * 隐藏输入的 click 也会冒上来，不拦下就闭成 click → 打开 → click 的死循环。
 */
const INTERACTIVE_SELECTOR = [
  parts.trigger.selector,
  parts['item-delete-trigger'].selector,
  parts['clear-trigger'].selector,
  parts['hidden-input'].selector,
].join(',')

/** DataTransfer 里的文件。列表是类数组，摊成真数组免得下游对着一个活对象做判断。 */
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

  /** 点到的是不是区内那些各有各的活儿的按钮。事件那一刻现查活 DOM，渲染期不调用。 */
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
      // for 指向隐藏输入：点标题即打开系统文件选择框，这是原生就有的联动，
      // 因此这个部件必须落在真的 `<label>` 上，别的标签点不动
      'id': ids.label,
      'for': hiddenInputId,
      'data-disabled': dataAttr(disabled),
    }),

    /**
     * 投放区既是拖拽落点也是一个大按钮（点一下、或按 Enter/Space 都打开选择框），
     * 因此报 role=button。作者最好把 trigger 放在投放区之外：按钮里再套按钮，
     * 读屏只会念出外面那一个。
     */
    getDropzoneProps: () => normalize.element({
      ...parts.dropzone.attrs,
      'id': ids.dropzone,
      'role': 'button',
      // 名字优先取作者写的 label（accname 里 aria-labelledby 优先级最高）；
      // 没写 label 时那是一个悬空 IDREF，按 accname 规则跳过，退回下面这句兜底文案
      'aria-labelledby': ids.label,
      'aria-label': label.dropzone,
      // div 上没有原生 disabled 可用，只能显式说；禁用时退出 Tab 序列（仍可编程聚焦）
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
        // 投放区是 div，浏览器不会替它把 Enter/Space 合成成一次点击；
        // 空格还会顺手把页面滚一屏，两条都得自己接管
        event.preventDefault()
        send({ type: 'PICKER.OPEN' })
      },
      'onDragOver': (event: DragEvent) => {
        if (!canDrop)
          return
        // 不拦下默认行为浏览器压根不会派 drop：这一句是拖拽能用的前提，不是可选优化
        event.preventDefault()
        send({ type: 'DRAG.OVER' })
      },
      'onDragLeave': (event: DragEvent) => {
        if (!canDrop)
          return
        // 指针从区内一个子节点挪到另一个子节点时浏览器照样派 dragleave；
        // 判据是"去处还在不在区内"，无条件认账会让高亮边框一路闪
        if (contains(event.currentTarget as HTMLElement, event.relatedTarget as Node | null))
          return
        send({ type: 'DRAG.LEAVE' })
      },
      'onDrop': (event: DragEvent) => {
        if (!canDrop)
          return
        // 不拦下浏览器会直接打开这个文件，当前页连同没提交的表单一起被顶掉
        event.preventDefault()
        send({ type: 'DROP', files: filesFromTransfer(event.dataTransfer) })
      },
    }),

    // 单体控件用原生 disabled（与集合条目的 aria-disabled 相反）：禁用的按钮不该能聚焦。
    // 这里不再判一次 disabled——原生 disabled 的按钮连 click 都派不出来，
    // 真正兜底的是机器上的 canChange 守卫（编程调用也拦得住）
    getTriggerProps: () => normalize.button({
      ...parts.trigger.attrs,
      'type': 'button',
      'disabled': disabled || undefined,
      'data-disabled': dataAttr(disabled),
      'onClick': () => send({ type: 'PICKER.OPEN' }),
    }),

    getHiddenInputProps: () => normalize.input({
      ...parts['hidden-input'].attrs,
      // id 是机器打开选择框时找回本节点的唯一线索
      id: hiddenInputId,
      type: 'file',
      // name 缺省即不产出该属性，此时这份输入不参与提交
      name: prop('name'),
      accept: acceptAttr(prop('accept')),
      // 系统选择框能不能多选由数量上限说了算，作者不必再单独写一个 multiple
      multiple: maxFiles > 1 || undefined,
      webkitdirectory: prop('directory') || undefined,
      capture: prop('capture'),
      disabled: disabled || undefined,
      // 藏起来的输入不该占 Tab 位：键盘入口是投放区与 trigger
      tabindex: -1,
      style: VISUALLY_HIDDEN,
      onClick: (event: MouseEvent) => {
        // 打开选择框走的就是本节点的 click()，让它冒到投放区会被当成又一次"请打开"
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
      // 已选文件是一份清单，读屏据此播报"列表，共 N 项"
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
      // 长文件名会被样式收成省略号，悬停时得能看到全名
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
      // 纯装饰：文件名与大小就在旁边，读屏再念一遍缩略图只是噪音
      'aria-hidden': 'true',
      // 皮肤按前缀挑图标（[data-file-type^='image/']）；系统给不出 MIME 时是 unknown，
      // 留空串会让"未知类型"与"属性没写"在选择器里分不开
      'data-file-type': file.type || 'unknown',
      'data-disabled': dataAttr(disabled),
    }),

    getItemDeleteTriggerProps: ({ file }) => normalize.button({
      ...parts['item-delete-trigger'].attrs,
      'type': 'button',
      // 每条的删除按钮长得一模一样，不带上文件名读屏念出来是一串"删除、删除、删除"
      'aria-label': label.deleteFile(file),
      'disabled': disabled || undefined,
      'data-disabled': dataAttr(disabled),
      'onClick': () => send({ type: 'FILE.DELETE', file }),
    }),

    getClearTriggerProps: () => normalize.button({
      ...parts['clear-trigger'].attrs,
      'type': 'button',
      'aria-label': label.clearFiles,
      // 一个文件都没有时没什么可清：单体控件用原生 disabled，一并退出 Tab 序列
      'disabled': disabled || empty || undefined,
      'data-disabled': dataAttr(disabled || empty),
      'onClick': () => send({ type: 'FILES.CLEAR' }),
    }),
  }
}
