import type { FileUploadItemProps, FileUploadSchema, FileUploadTranslations } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { computed, defineComponent, h } from 'vue'
import { provideFileUpload, provideFileUploadItem, useFileUploadContext, useFileUploadItemContext } from './context'
import { useFileUpload } from './use-file-upload'

type FileUploadProps = FileUploadSchema['props']

export const XhFileUploadRoot = defineComponent({
  name: 'XhFileUploadRoot',
  // 缺省值的唯一事实源在 connect 与机器 —— 凡是那边有兜底的一律 default: undefined。
  // allowDrop 尤其：裸 Boolean 声明会把缺省压成 false，拖拽就默默关掉了
  props: {
    // 文件列表是数组：给 default: undefined 才表达得了"非受控"，
    // 落成空数组会被当作"受控且当前一个文件都没有"，用户从此再也选不进去
    files: { type: Array as PropType<File[]>, default: undefined },
    defaultFiles: { type: Array as PropType<File[]>, default: undefined },
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
  // files-change 携带 { files }；update:files 携带裸数组，支持 v-model:files。
  // file-accept / file-reject 是另外两条线：宿主据此发起上传、或提示用户为什么没收下
  emits: ['files-change', 'update:files', 'file-accept', 'file-reject'],
  setup(props, { slots, emit }) {
    const onFilesChange: FileUploadProps['onFilesChange'] = (details) => {
      emit('files-change', details)
      emit('update:files', details.files)
    }
    const onFileAccept: FileUploadProps['onFileAccept'] = details => emit('file-accept', details)
    const onFileReject: FileUploadProps['onFileReject'] = details => emit('file-reject', details)
    const ctx = useFileUpload(props as FileUploadProps, { onFilesChange, onFileAccept, onFileReject })
    provideFileUpload(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      acceptedFiles: ctx.api.value.acceptedFiles,
      dragging: ctx.api.value.dragging,
      empty: ctx.api.value.empty,
      disabled: ctx.api.value.disabled,
      maxFiles: ctx.api.value.maxFiles,
      getFileSizeText: ctx.api.value.getFileSizeText,
      setFiles: ctx.api.value.setFiles,
      addFiles: ctx.api.value.addFiles,
      deleteFile: ctx.api.value.deleteFile,
      clearFiles: ctx.api.value.clearFiles,
      openFilePicker: ctx.api.value.openFilePicker,
    }))
  },
})

export const XhFileUploadLabel = defineComponent({
  name: 'XhFileUploadLabel',
  setup(_, { slots }) {
    const ctx = useFileUploadContext()
    // 必须是原生 label：getLabelProps 的 for 恒写向隐藏输入，别的标签点不开选择框
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
  setup(_, { slots }) {
    const ctx = useFileUploadContext()
    return () => h('button', ctx.api.value.getTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhFileUploadHiddenInput = defineComponent({
  name: 'XhFileUploadHiddenInput',
  setup() {
    const ctx = useFileUploadContext()
    return () => h('input', ctx.api.value.getHiddenInputProps() as Record<string, unknown>)
  },
})

export const XhFileUploadItemGroup = defineComponent({
  name: 'XhFileUploadItemGroup',
  setup(_, { slots }) {
    const ctx = useFileUploadContext()
    return () => h('div', ctx.api.value.getItemGroupProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhFileUploadItem = defineComponent({
  name: 'XhFileUploadItem',
  props: {
    /** 这一行显示哪个文件。v-for 遍历 acceptedFiles 时直接把元素传进来即可。 */
    file: { type: Object as PropType<File>, default: undefined },
    /**
     * 也可以只声明下标，由列表里取（与 WC 侧条目上的 index 属性同义）。
     * 固定几个上传位、位置与文件一一对应的界面用这个写法更顺手。
     * 也收字符串：模板里写 index="0"（不带冒号）拿到的就是字符串。
     */
    index: { type: [Number, String] as PropType<number | string>, default: undefined },
  },
  setup(props, { slots }) {
    const ctx = useFileUploadContext()
    const file = computed<File | undefined>(() => {
      if (props.file)
        return props.file
      if (props.index == null)
        return undefined
      return ctx.api.value.acceptedFiles[Math.trunc(Number(props.index))]
    })
    // file 恒有值时才建条目上下文；子部件全靠它拿文件，没有文件就没什么可描述的
    const item = computed<FileUploadItemProps>(() => ({ file: file.value as File }))
    provideFileUploadItem({ item })
    return () => {
      // 下标指向一个还不存在的文件（列表比位子短）：留一个空壳，不打任何组件属性，
      // 子部件也不渲染——照 file 是 undefined 往下走会当场炸在 file.name 上
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
    // 作者写了插槽就听作者的（要加图标、要截断中段），否则显示文件名
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
    // 字节数格式化成人读的形式；作者要换单位或换语言就自己写插槽
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
