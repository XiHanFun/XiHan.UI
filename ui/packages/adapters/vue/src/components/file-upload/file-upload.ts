/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 file upload 相关实现。

import type { FileUploadApi, FileUploadFile, FileUploadItemProps, FileUploadRemoteFile, FileUploadSchema, FileUploadTranslations } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { fileUploadStructure } from '@xihan-ui/headless'
import { computed, defineComponent, h, onUnmounted } from 'vue'
import { withXhConfig } from '../../config/config'
import { mergeIntoChild } from '../../runtime/as-child'
import { mergePartProps } from '../../runtime/merge-props'
import { renderStructure } from '../../runtime/structure'
import { withHandlers } from '../../runtime/with-handlers'
import { useFieldGroupWiring, useFieldLabelWiring } from '../field/use-field-control'
import { useFormControlProps } from '../form/use-form-control'
import { provideFileUpload, provideFileUploadItem, useFileUploadContext, useFileUploadItemContext } from './context'
import { useFileUpload } from './use-file-upload'

type FileUploadProps = FileUploadSchema['props']

/** 默认插槽的载荷：文件清单与传输快照、投放区与数量状态，以及增删清空、开始上传、拉起选择器等命令。 */
export type FileUploadRootSlotProps = Pick<
  FileUploadApi,
  | 'acceptedFiles'
  | 'remoteFiles'
  | 'allFiles'
  | 'uploadOf'
  | 'startUpload'
  | 'cancelUpload'
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
  // 有 connect 与机器兜底的 prop：普通类型省略 default，Boolean 显式保留 undefined
  props: {
    /** 不显示出来的名字，写成 aria-label 落在与字段标签同一个部件上；放进字段或渲染了 label 部件时以它们为准。 */
    ariaLabel: { type: String },
    // 缺席值 undefined 表示非受控
    files: { type: Array as PropType<File[]> },
    defaultFiles: { type: Array as PropType<File[]> },
    remoteFiles: { type: Array as PropType<FileUploadRemoteFile[]> },
    defaultRemoteFiles: { type: Array as PropType<FileUploadRemoteFile[]> },
    upload: { type: Function as PropType<FileUploadProps['upload']> },
    autoUpload: { type: Boolean, default: undefined },
    accept: { type: [String, Array] as PropType<string | string[]> },
    maxFiles: { type: Number },
    maxFileSize: { type: Number },
    minFileSize: { type: Number },
    disabled: { type: Boolean, default: undefined },
    invalid: { type: Boolean, default: undefined },
    readOnly: { type: Boolean, default: undefined },
    required: { type: Boolean, default: undefined },
    name: { type: String },
    allowDrop: { type: Boolean, default: undefined },
    allowPaste: { type: Boolean, default: undefined },
    validate: { type: Function as PropType<FileUploadProps['validate']> },
    maxConcurrentUploads: { type: Number },
    directory: Boolean,
    capture: { type: String as PropType<'user' | 'environment'> },
    translations: { type: Object as PropType<Partial<FileUploadTranslations>> },
    /** 标题文字。不写默认插槽时铺 label 部件；需要放置其他内容时改用 label 插槽。 */
    label: { type: String },
    /** 不写默认插槽时列表之后带清空整份列表的按钮；写了默认插槽时放 clear-trigger 部件即可清空。 */
    clearable: Boolean,
  },
  // files-change 携带 { files }，update:files 携带裸数组；file-accept / file-reject 逐个文件报告
  emits: {
    'clear': () => true,
    'files-change': (_details: PayloadOf<FileUploadProps, 'onFilesChange'>) => true,
    'update:files': (_files: PayloadOf<FileUploadProps, 'onFilesChange'>['files']) => true,
    'file-accept': (_details: PayloadOf<FileUploadProps, 'onFileAccept'>) => true,
    'file-reject': (_details: PayloadOf<FileUploadProps, 'onFileReject'>) => true,
    'remote-files-change': (_details: PayloadOf<FileUploadProps, 'onRemoteFilesChange'>) => true,
    'update:remoteFiles': (_files: PayloadOf<FileUploadProps, 'onRemoteFilesChange'>['files']) => true,
    'upload-complete': (_details: PayloadOf<FileUploadProps, 'onUploadComplete'>) => true,
    'upload-error': (_details: PayloadOf<FileUploadProps, 'onUploadError'>) => true,
    'upload-cancel': (_details: PayloadOf<FileUploadProps, 'onUploadCancel'>) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: FileUploadRootSlotProps) => VNode[]
    label?: () => VNode[]
    /** 不写默认插槽时投放区里的内容；未写时取 translations.dropzone。 */
    dropzone?: () => VNode[]
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
    const onUploadCancel: FileUploadProps['onUploadCancel'] = details => emit('upload-cancel', details)
    const ctx = useFileUpload(withHandlers(withXhConfig('file-upload', useFormControlProps(props)), { onClear: () => emit('clear') }) as FileUploadProps, { onFilesChange, onFileAccept, onFileReject, onRemoteFilesChange, onUploadComplete, onUploadError, onUploadCancel })
    provideFileUpload(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, !slots.default
      ? renderDefaultStructure(ctx.api.value, { label: props.label, clearable: props.clearable }, { label: slots.label, dropzone: slots.dropzone })
      : slots.default({
          acceptedFiles: ctx.api.value.acceptedFiles,
          remoteFiles: ctx.api.value.remoteFiles,
          allFiles: ctx.api.value.allFiles,
          uploadOf: ctx.api.value.uploadOf,
          startUpload: ctx.api.value.startUpload,
          cancelUpload: ctx.api.value.cancelUpload,
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
    // 渲出来就登记，在 setup 里同步做：排在输入之前时首帧与服务端直出就带上名字
    ctx.labelCount.value++
    onUnmounted(() => {
      ctx.labelCount.value--
    })
    // 用原生 label，getLabelProps 的 for 指向隐藏输入
    return () => h('label', ctx.api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhFileUploadDropzone = defineComponent({
  name: 'XhFileUploadDropzone',
  setup(_, { slots }) {
    // 放进字段时字段的标签并进名字链、说明与错误文案进描述链；投放区是按钮，只取描述链，aria-invalid 由组件自己投影
    const fieldWiring = useFieldGroupWiring()
    const fieldLabel = useFieldLabelWiring()
    const ctx = useFileUploadContext()
    return () => h('div', fieldLabel.value({ ...fieldWiring.value, ...ctx.api.value.getDropzoneProps() as Record<string, unknown> }), slots.default?.())
  },
})

export const XhFileUploadTrigger = defineComponent({
  name: 'XhFileUploadTrigger',
  // 直通属性自己合：Vue 默认把作者的处理器排在部件的后面，这里改成作者先跑
  inheritAttrs: false,
  props: {
    /** 借用作者的子节点作为触发器，不再渲染自己的包裹元素；子节点须恰好一个。 */
    asChild: Boolean,
  },
  setup(props, { slots, attrs }) {
    const ctx = useFileUploadContext()
    return () => {
      const part = mergePartProps(ctx.api.value.getTriggerProps() as Record<string, unknown>, attrs)
      const children = slots.default?.()
      // asChild：把触发器属性合到作者的节点上，不再自己渲染包裹元素
      if (props.asChild) {
        const merged = mergeIntoChild(children, part, 'file-upload')
        if (merged)
          return merged
      }
      return h('button', part, children)
    }
  },
})

export const XhFileUploadHiddenInput = defineComponent({
  name: 'XhFileUploadHiddenInput',
  setup() {
    // 隐藏输入也并进字段的标签：原生表单控件没有名字会被判为未标注
    const fieldLabel = useFieldLabelWiring()
    const ctx = useFileUploadContext()
    return () => h('input', fieldLabel.value(ctx.api.value.getHiddenInputProps() as Record<string, unknown>))
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
    /** 该行显示哪个文件（本地或远程附件）。 */
    file: { type: Object as PropType<FileUploadFile> },
    /** 改用下标从 allFiles（远程在前、本地在后）中取文件，兼收字符串以支持模板中写 index="0"。 */
    index: { type: [Number, String] as PropType<number | string> },
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

export const XhFileUploadItemProgress = defineComponent({
  name: 'XhFileUploadItemProgress',
  setup(_, { slots }) {
    const ctx = useFileUploadContext()
    const { item } = useFileUploadItemContext()
    return () => h('div', ctx.api.value.getItemProgressProps(item.value) as Record<string, unknown>, slots.default?.())
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

/** 标准结构里各部件对应的组件。 */
const FILE_UPLOAD_PARTS = {
  'label': XhFileUploadLabel,
  'dropzone': XhFileUploadDropzone,
  'hidden-input': XhFileUploadHiddenInput,
  'list': XhFileUploadList,
  'item': XhFileUploadItem,
  'item-preview': XhFileUploadItemPreview,
  'item-name': XhFileUploadItemName,
  'item-size-text': XhFileUploadItemSizeText,
  'item-progress': XhFileUploadItemProgress,
  'item-delete-trigger': XhFileUploadItemDeleteTrigger,
  'clear-trigger': XhFileUploadClearTrigger,
}

interface FileUploadStructureSlots {
  label?: () => VNode[]
  dropzone?: () => VNode[]
}

/**
 * 未写默认插槽时铺开的整套结构，作者只提供数据：照 headless 的 fileUploadStructure 渲，
 * 与 Web Components 不写部件时元素生成的节点出自同一份。标题与投放区的内容由对应插槽接管。
 */
function renderDefaultStructure(api: FileUploadApi, options: { label?: string, clearable: boolean }, authored: FileUploadStructureSlots): VNode[] {
  const nodes = fileUploadStructure(api, { ...options, slotted: name => authored[name as keyof FileUploadStructureSlots] != null })
  return renderStructure(nodes, FILE_UPLOAD_PARTS, (node) => {
    switch (node.slot?.name) {
      case 'label':
        return authored.label?.()
      case 'dropzone':
        return authored.dropzone?.()
      default:
        return undefined
    }
  })
}
