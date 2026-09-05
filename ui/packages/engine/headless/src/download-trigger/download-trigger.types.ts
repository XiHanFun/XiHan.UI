import type { MachineSchema, PropTypes } from '@xihan-ui/core'

/**
 * 下载状态。
 *
 * preparing = 数据还在取：取数函数可以是异步的，点了不能直接算完成。
 */
export type DownloadTriggerStatus = 'idle' | 'preparing'

/** 能写进文件的内容形态：文本直接落盘，二进制交 Blob。 */
export type DownloadTriggerContent = Blob | string

/**
 * 作者那一侧的数据形态。
 *
 * 给函数即为按需取数：点下去才调用它，它可以返回 Promise。
 * 数据大或需要请求时用函数形态，别在渲染期就把整份内容备在内存里。
 */
export type DownloadTriggerData
  = | DownloadTriggerContent
    | (() => DownloadTriggerContent | Promise<DownloadTriggerContent>)

export interface DownloadTriggerCompleteDetails {
  /** 这一次实际写出的文件名，与 download 属性上的那一份是同一个值。 */
  fileName: string
}

export interface DownloadTriggerErrorDetails {
  /** 失败原因：取数函数抛出或拒绝的原始值，data 缺席时是本组件合成的 Error。 */
  error: unknown
  /** 这一次试图写出的文件名。 */
  fileName: string
}

export interface DownloadTriggerSchema extends MachineSchema {
  props: {
    /** 要下载的内容：文本、Blob，或点下去才调用的取数函数（可返回 Promise）。 */
    data?: DownloadTriggerData
    /** 写出的文件名；缺省或空串退回内建默认名。 */
    fileName?: string
    /** 内容类型；给了它就以它为准，连 Blob 自带的类型也照它重包一次。缺省时文本按纯文本处理。 */
    mimeType?: string
    /** 禁用：按钮不可聚焦、点不动。 */
    disabled?: boolean
    /** 数据已交给浏览器时通知一次。到这里只说明下载已经发起，浏览器把文件写没写到盘上组件看不见。 */
    onDownloadComplete?: (details: DownloadTriggerCompleteDetails) => void
    /** 取数失败或造不出下载时通知；此刻状态已经回到 idle。 */
    onDownloadError?: (details: DownloadTriggerErrorDetails) => void
  }
  context: Record<string, never>
  computed: Record<string, never>
  refs: Record<string, never>
  state: DownloadTriggerStatus
  event:
    /**
     * 用户点了按钮，或作者调 api.download()。
     * 禁用时被机器的守卫挡掉；preparing 期间不接，同一次取数不会跑两遍。
     */
    | { type: 'DOWNLOAD.TRIGGER' }
    /**
     * 数据已取到并已交给浏览器，由 preparing 的副作用回送。
     * fileName 是发起那一刻定死的那份，不是兑现时的 prop——取数途中宿主改了文件名，
     * 报出去的必须仍是实际写出的那一份。
     */
    | { type: 'DOWNLOAD.SUCCESS', fileName: string }
    /** 取数失败或造下载时抛错，由 preparing 的副作用回送，带上原始拒绝值。 */
    | { type: 'DOWNLOAD.ERROR', error: unknown, fileName: string }
  tag: never
  guard: 'isDisabled'
  action: 'invokeComplete' | 'invokeError'
  effect: 'runDownload'
}

export interface DownloadTriggerApi<T extends PropTypes = PropTypes> {
  status: DownloadTriggerStatus
  /** 数据还在取。按钮不因此变禁用，只是这段时间里再点不会重复发起。 */
  preparing: boolean
  disabled: boolean
  /** 这一次会写出的文件名（prop 缺省时是内建默认名）。 */
  fileName: string
  /** 走一次下载意图，与点按钮同一条路：禁用时不动，取数在途时不重复发起。 */
  download: () => void
  getRootProps: () => T['button']
}

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface DownloadTriggerTranslations {}
