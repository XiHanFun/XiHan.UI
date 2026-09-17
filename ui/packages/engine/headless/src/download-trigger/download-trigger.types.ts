/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 download trigger 类型契约。

import type { ActionVariant, MachineSchema, PropTypes, Size, Tone } from '@xihan-ui/core'

/**
 * 下载状态。
 *
 * preparing = 数据获取中：取数函数可以是异步的，点击后不能直接视为完成。
 */
export type DownloadTriggerStatus = 'idle' | 'preparing'

/** 可写入文件的内容形态：文本直接写入，二进制交由 Blob。 */
export type DownloadTriggerContent = Blob | string

/**
 * 作者侧的数据形态。
 *
 * 提供函数即按需取数：点击时才调用，可返回 Promise。
 * 数据量大或需要请求时使用函数形态，不在渲染期把整份内容保存在内存中。
 */
export type DownloadTriggerData
  = | DownloadTriggerContent
    | (() => DownloadTriggerContent | Promise<DownloadTriggerContent>)

export interface DownloadTriggerCompleteDetails {
  /** 本次实际写出的文件名，与 download 属性上的值相同。 */
  fileName: string
}

export interface DownloadTriggerErrorDetails {
  /** 失败原因：取数函数抛出或拒绝的原始值，data 缺席时是本组件合成的 Error。 */
  error: unknown
  /** 本次尝试写出的文件名。 */
  fileName: string
}

export interface DownloadTriggerSchema extends MachineSchema {
  props: {
    /** 要下载的内容：文本、Blob，或点击时才调用的取数函数（可返回 Promise）。 */
    data?: DownloadTriggerData
    /** 写出的文件名；未提供或空串时回退为内建默认名。 */
    fileName?: string
    /** 内容类型；提供后以它为准，Blob 自带的类型也按它重新包装。未提供时文本按纯文本处理。 */
    mimeType?: string
    /** 禁用：按钮不可聚焦、不可点击。 */
    disabled?: boolean
    /** 变体：solid / subtle / outline / ghost，默认 subtle（缺省中性淡底，solid 才品牌实心）。 */
    variant?: ActionVariant
    /** 颜色：brand / neutral / success / warning / danger / info。 */
    tone?: Tone
    /** 尺寸：sm / md / lg。 */
    size?: Size
    translations?: Partial<DownloadTriggerTranslations>
    /** 数据已交给浏览器时通知一次。此时只说明下载已发起，浏览器是否把文件写入磁盘组件无法感知。 */
    onDownloadComplete?: (details: DownloadTriggerCompleteDetails) => void
    /** 取数失败或无法创建下载时通知；此时状态已回到 idle。 */
    onDownloadError?: (details: DownloadTriggerErrorDetails) => void
  }
  context: {
    /** 正被按住：Space / Enter 或触屏手指按下到松开之间，投影 data-pressed。指针按住由 :active 表出。 */
    pressed: boolean
  }
  computed: Record<string, never>
  refs: Record<string, never>
  state: DownloadTriggerStatus
  event:
    /**
     * 用户点击了按钮，或作者调用 api.download()。
     * 禁用时被状态机的守卫拦截；preparing 期间不接受，同一次取数不会运行两遍。
     */
    | { type: 'DOWNLOAD.TRIGGER' }
    /**
     * 数据已获取并已交给浏览器，由 preparing 的副作用回送。
     * fileName 是发起时固定的值，不是兑现时的 prop：取数途中宿主修改了文件名，
     * 报出的必须仍是实际写出的值。
     */
    | { type: 'DOWNLOAD.SUCCESS', fileName: string }
    /** 取数失败或创建下载时抛错，由 preparing 的副作用回送，附带原始拒绝值。 */
    | { type: 'DOWNLOAD.ERROR', error: unknown, fileName: string }
    // 按压通道（shared/press）：Space / Enter 或触屏按住与松开
    | { type: 'PRESS.START' }
    | { type: 'PRESS.END' }
  tag: never
  guard: 'isDisabled' | 'canPress'
  action: 'invokeComplete' | 'invokeError' | 'startPress' | 'endPress' | 'releaseWhenInert'
  effect: 'runDownload'
}

export interface DownloadTriggerApi<T extends PropTypes = PropTypes> {
  status: DownloadTriggerStatus
  /** 数据获取中。按钮不因此禁用，只是期间再次点击不会重复发起。 */
  preparing: boolean
  disabled: boolean
  /** 本次将写出的文件名（prop 未提供时是内建默认名）。 */
  fileName: string
  /** 发起一次下载意图，与点击按钮走同一路径：禁用时不生效，取数在途时不重复发起。 */
  download: () => void
  getRootProps: () => T['button']
}

/** 读屏文案，默认英文。 */
export interface DownloadTriggerTranslations {
  /** 按钮的可及名。按钮内只有一个图标时，名字只能由这里提供。 */
  trigger: string
}
