import type { FileUploadApi, FileUploadFile, FileUploadItemProps, FileUploadRemoteFile, FileUploadSchema, FileUploadTranslations } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { computed, defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { mergeIntoChild } from '../../runtime/as-child'
import { provideFileUpload, provideFileUploadItem, useFileUploadContext, useFileUploadItemContext } from './context'
import { useFileUpload } from './use-file-upload'

type FileUploadProps = FileUploadSchema['props']

/** 默认插槽的载荷：文件清单与传输快照、投放区与数量状态，与增删清空、开传、拉起选择器等命令。 */
export type FileUploadRootSlotProps = Pick<
  FileUploadApi,
  | 'acceptedFiles'
  | 'remoteFiles'
  | 'allFiles'
  | 'uploadOf'
  | 'startUpload'
  | 'dragging'
  | 'empty'
  | 'disabled'
  | 'maxFiles'
  | 'getFileSizeText'
  | 'setFiles'
  | 'addFiles'
  | 'deleteFile'
  | 'clear'
  | 'openFilePicker'
>

export const XhFileUploadRoot = defineComponent({
  name: 'XhFileUploadRoot',
  // 有 connect 与机器兜底的 prop 一律 default: undefined
  props: {
    // default: undefined 表示非受控
    files: { type: Array as PropType<File[]>, default: undefined },
    defaultFiles: { type: Array as PropType<File[]>, default: undefined },
    remoteFiles: { type: Array as PropType<FileUploadRemoteFile[]>, default: undefined },
    defaultRemoteFiles: { type: Array as PropType<FileUploadRemoteFile[]>, default: undefined },
    upload: { type: Function as PropType<FileUploadProps['upload']>, default: undefined },
    autoUpload: { type: Boolean, default: undefined },
    accept: { type: [String, Array] as PropType<string | string[]>, default: undefined },
    maxFiles: { type: Number, default: undefined },
    maxFileSize: { type: Number, default: undefined },
    minFileSize: { type: Number, default: undefined },
    disabled: Boolean,
    invalid: Boolean,
    name: { type: String, default: undefined },
    allowDrop: { type: Boolean, default: undefined },
    directory: Boolean,
    capture: { type: String as PropType<'user' | 'environment'>, default: undefined },
    translations: { type: Object as PropType<Partial<FileUploadTranslations>>, default: undefined },
  },
  // files-change 携带 { files }，update:files 携带裸数组；file-accept / file-reject 逐个文件报告
  emits: {
    'files-change': (_details: PayloadOf<FileUploadProps, 'onFilesChange'>) => true,
    'update:files': (_files: PayloadOf<FileUploadProps, 'onFilesChange'>['files']) => true,
    'file-accept': (_details: PayloadOf<FileUploadProps, 'onFileAccept'>) => true,
    'file-reject': (_details: PayloadOf<FileUploadProps, 'onFileReject'>) => true,
    'remote-files-change': (_details: PayloadOf<FileUploadProps, 'onRemoteFilesChange'>) => true,
    'update:remoteFiles': (_files: PayloadOf<FileUploadProps, 'onRemoteFilesChange'>['files']) => true,
    'upload-complete': (_details: PayloadOf<FileUploadProps, 'onUploadComplete'>) => true,
    'upload-error': (_details: PayloadOf<FileUploadProps, 'onUploadError'>) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: FileUploadRootSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const onFilesChange: FileUploadProps['onFilesChange'] = (details) => {
      emit('files-change', details)
      emit('update:files', details.files)
    }
    const onFileAccept: FileUploadProps['onFileAccept'] = details => emit('file-accept', details)
    const onFileReject: FileUploadProps['onFileReject'] = details => emit('file-reject', details)
    const onRemoteFilesChange: FileUploadProps['onRemoteFilesChange'] = (details) => {
      emit('remote-files-change', details)
      emit('update:remoteFiles', details.files)
    }
    const onUploadComplete: FileUploadProps['onUploadComplete'] = details => emit('upload-complete', details)
    const onUploadError: FileUploadProps['onUploadError'] = details => emit('upload-error', details)
    const ctx = useFileUpload(withXhConfig('file-upload', props) as FileUploadProps, { onFilesChange, onFileAccept, onFileReject, onRemoteFilesChange, onUploadComplete, onUploadError })
    provideFileUpload(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      acceptedFiles: ctx.api.value.acceptedFiles,
      remoteFiles: ctx.api.value.remoteFiles,
      allFiles: ctx.api.value.allFiles,
      uploadOf: ctx.api.value.uploadOf,
      startUpload: ctx.api.value.startUpload,
      dragging: ctx.api.value.dragging,
      empty: ctx.api.value.empty,
      disabled: ctx.api.value.disabled,
      maxFiles: ctx.api.value.maxFiles,
      getFileSizeText: ctx.api.value.getFileSizeText,
      setFiles: ctx.api.value.setFiles,
      addFiles: ctx.api.value.addFiles,
      deleteFile: ctx.api.value.deleteFile,
      clear: ctx.api.value.clear,
      openFilePicker: ctx.api.value.openFilePicker,
    }))
  },
})

export const XhFileUploadLabel = defineComponent({
  name: 'XhFileUploadLabel',
  setup(_, { slots }) {
    const ctx = useFileUploadContext()
    // 用原生 label，getLabelProps 的 for 指向隐藏输入
    return () => h('label', ctx.api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhFileUploadDropzone = defineComponent({
  name: 'XhFileUploadDropzone',
  setup(_, { slots }) {
    const ctx = useFileUploadContext()
    return () => h('div', ctx.api.value.getDropzoneProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhFileUploadTrigger = defineComponent({
  name: 'XhFileUploadTrigger',
  props: {
    /** 借用作者的子节点当触发器，不再渲染自己的包裹元素；子节点须恰好一个。 */
    asChild: Boolean,
  },
  setup(props, { slots }) {
    const ctx = useFileUploadContext()
    return () => {
      const attrs = ctx.api.value.getTriggerProps() as Record<string, unknown>
      const children = slots.default?.()
      // asChild：把触发器属性合到作者的节点上，不再自己渲染包裹元素
      if (props.asChild) {
        const merged = mergeIntoChild(children, attrs, 'file-upload')
        if (merged)
          return merged
      }
      return h('button', attrs, children)
    }
  },
})

export const XhFileUploadHiddenInput = defineComponent({
  name: 'XhFileUploadHiddenInput',
  setup() {
    const ctx = useFileUploadContext()
    return () => h('input', ctx.api.value.getHiddenInputProps() as Record<string, unknown>)
  },
})

export const XhFileUploadList = defineComponent({
  name: 'XhFileUploadList',
  setup(_, { slots }) {
    const ctx = useFileUploadContext()
    return () => h('div', ctx.api.value.getListProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhFileUploadItem = defineComponent({
  name: 'XhFileUploadItem',
  props: {
    /** 这一行显示哪个文件（本地或远程附件）。 */
    file: { type: Object as PropType<FileUploadFile>, default: undefined },
    /** 改用下标从 allFiles（远程在前、本地在后）里取文件，兼收字符串以支持模板里写 index="0"。 */
    index: { type: [Number, String] as PropType<number | string>, default: undefined },
  },
  setup(props, { slots }) {
    const ctx = useFileUploadContext()
    const file = computed<FileUploadFile | undefined>(() => {
      if (props.file)
        return props.file
      if (props.index == null)
        return undefined
      return ctx.api.value.allFiles[Math.trunc(Number(props.index))]
    })
    // 条目上下文，子部件从中取文件
    const item = computed<FileUploadItemProps>(() => ({ file: file.value as FileUploadFile }))
    provideFileUploadItem({ item })
    return () => {
      // 下标指向的文件不存在时只渲染空壳，不打组件属性也不渲染子部件
      if (!file.value)
        return h('div')
      return h('div', ctx.api.value.getItemProps(item.value) as Record<string, unknown>, slots.default?.())
    }
  },
})

export const XhFileUploadItemName = defineComponent({
  name: 'XhFileUploadItemName',
  setup(_, { slots }) {
    const ctx = useFileUploadContext()
    const { item } = useFileUploadItemContext()
    // 有插槽用插槽，否则显示文件名
    return () => h(
      'span',
      ctx.api.value.getItemNameProps(item.value) as Record<string, unknown>,
      slots.default?.() ?? item.value.file.name,
    )
  },
})

export const XhFileUploadItemSizeText = defineComponent({
  name: 'XhFileUploadItemSizeText',
  setup(_, { slots }) {
    const ctx = useFileUploadContext()
    const { item } = useFileUploadItemContext()
    // 有插槽用插槽，否则显示格式化后的文件大小
    return () => h(
      'span',
      ctx.api.value.getItemSizeTextProps(item.value) as Record<string, unknown>,
      slots.default?.() ?? ctx.api.value.getFileSizeText(item.value.file),
    )
  },
})

export const XhFileUploadItemPreview = defineComponent({
  name: 'XhFileUploadItemPreview',
  setup(_, { slots }) {
    const ctx = useFileUploadContext()
    const { item } = useFileUploadItemContext()
    return () => h('div', ctx.api.value.getItemPreviewProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhFileUploadItemDeleteTrigger = defineComponent({
  name: 'XhFileUploadItemDeleteTrigger',
  setup(_, { slots }) {
    const ctx = useFileUploadContext()
    const { item } = useFileUploadItemContext()
    return () => h(
      'button',
      ctx.api.value.getItemDeleteTriggerProps(item.value) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})

export const XhFileUploadClearTrigger = defineComponent({
  name: 'XhFileUploadClearTrigger',
  setup(_, { slots }) {
    const ctx = useFileUploadContext()
    return () => h('button', ctx.api.value.getClearTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})
