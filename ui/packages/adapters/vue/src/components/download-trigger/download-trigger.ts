import type { DownloadTriggerApi, DownloadTriggerData, DownloadTriggerSchema } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h } from 'vue'
import { useDownloadTrigger } from './use-download-trigger'

type DownloadTriggerProps = DownloadTriggerSchema['props']

/** 默认插槽的载荷：下载状态与禁用、这次会写出的文件名，以及走一次下载的句柄。 */
export type DownloadTriggerSlotProps = Pick<
  DownloadTriggerApi,
  'status' | 'preparing' | 'disabled' | 'fileName' | 'download'
>

/**
 * 触发一次浏览器下载的按钮。
 *
 * 默认插槽拿得到 `{ status, preparing, disabled, fileName, download }`，
 * 取数在途时可以据 `preparing` 换掉按钮上的文字。
 */
export const XhDownloadTrigger = defineComponent({
  name: 'XhDownloadTrigger',
  // 缺省值由机器与 connect 给出，这里一律 default: undefined
  props: {
    // 文本与 Blob 是值形态，函数形态点了才调用
    data: { type: [String, Function, Object] as PropType<DownloadTriggerData>, default: undefined },
    fileName: { type: String, default: undefined },
    mimeType: { type: String, default: undefined },
    disabled: { type: Boolean, default: undefined },
  },
  // download-complete 携带 { fileName }；download-error 携带 { error, fileName }
  emits: {
    'download-complete': (_details: PayloadOf<DownloadTriggerProps, 'onDownloadComplete'>) => true,
    'download-error': (_details: PayloadOf<DownloadTriggerProps, 'onDownloadError'>) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: DownloadTriggerSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const ctx = useDownloadTrigger(props as DownloadTriggerProps, {
      onDownloadComplete: details => emit('download-complete', details),
      onDownloadError: details => emit('download-error', details),
    })
    // 用原生 button，激活交给平台
    return () => h('button', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      status: ctx.api.value.status,
      preparing: ctx.api.value.preparing,
      disabled: ctx.api.value.disabled,
      fileName: ctx.api.value.fileName,
      download: ctx.api.value.download,
    }))
  },
})
