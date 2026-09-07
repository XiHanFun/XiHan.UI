import type { ActionVariant, Size, Tone } from '@xihan-ui/core'
import type { DownloadTriggerApi, DownloadTriggerData, DownloadTriggerSchema, DownloadTriggerTranslations } from '@xihan-ui/headless'
import type { ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { withXhConfig } from '../../config/config'
import { renderSlot } from '../../runtime/slot-content'
import { useDownloadTrigger } from './use-download-trigger'

type DownloadTriggerProps = DownloadTriggerSchema['props']

/** 函数式 children 的载荷：下载状态与禁用、这次会写出的文件名，以及走一次下载的句柄。 */
export interface DownloadTriggerSlotProps extends Pick<
  DownloadTriggerApi,
  'status' | 'preparing' | 'disabled' | 'fileName' | 'download'
> {}

export interface XhDownloadTriggerProps {
  /** 文本与 Blob 是值形态，函数形态点了才调用。 */
  data?: DownloadTriggerData
  fileName?: string
  mimeType?: string
  disabled?: boolean
  variant?: ActionVariant
  tone?: Tone
  size?: Size
  translations?: Partial<DownloadTriggerTranslations>
  onDownloadComplete?: DownloadTriggerProps['onDownloadComplete']
  onDownloadError?: DownloadTriggerProps['onDownloadError']
  children?: SlotChildren<DownloadTriggerSlotProps>
}

/**
 * 触发一次浏览器下载的按钮。
 *
 * 函数式 children 拿得到 `{ status, preparing, disabled, fileName, download }`，
 * 取数在途时可以据 `preparing` 换掉按钮上的文字。
 */
export function XhDownloadTrigger({ children, ...props }: XhDownloadTriggerProps): ReactNode {
  const ctx = useDownloadTrigger(withXhConfig('download-trigger', props) as DownloadTriggerProps)
  // 用原生 button，激活交给平台
  return (
    <button {...ctx.api.getRootProps() as Record<string, unknown>}>
      {renderSlot(children, {
        status: ctx.api.status,
        preparing: ctx.api.preparing,
        disabled: ctx.api.disabled,
        fileName: ctx.api.fileName,
        download: ctx.api.download,
      })}
    </button>
  )
}

XhDownloadTrigger.xhEvents = ['download-complete', 'download-error'] as const
