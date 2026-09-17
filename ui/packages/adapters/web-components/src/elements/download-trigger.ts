/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 download trigger 相关实现。

import type { ActionVariant, Size, Tone } from '@xihan-ui/core'
import type { DownloadTriggerCompleteDetails, DownloadTriggerData, DownloadTriggerErrorDetails, DownloadTriggerSchema, DownloadTriggerTranslations } from '@xihan-ui/headless'
import { connectDownloadTrigger, downloadTriggerAnatomy, downloadTriggerMachine, downloadTriggerMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 布尔三态：缺席 = undefined（用 connect 的默认值），="false" = false，其余 = true。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-download-trigger>`：Light-DOM 行为宿主，运行 download-trigger 状态机并把 connect 产出接到 root 角色节点。
 *
 * 下载经临时地址加一次隐藏链接点击：点击后先进入 preparing，数据交给浏览器后回到 idle 并派发
 * `download-complete`，取数失败同样回到 idle 并派发 `download-error`。
 *
 * Blob 与取数函数只能通过 property 设置（`el.data = blob`）：HTML 属性只能承载一个字符串。
 *
 * @customElement xh-download-trigger
 * @attr {string} data - 要下载的文本；Blob 与取数函数只能经 property 传入
 * @attr {string} file-name - 写出的文件名；未提供或空串时回退为内建名 download
 * @attr {string} mime-type - 内容类型；提供后以它为准，Blob 自带的类型也按它重新包装
 * @attr {boolean} disabled - 禁用，按钮不可聚焦也不可点击
 * @attr {'solid'|'subtle'|'outline'|'ghost'} variant - 变体，默认 subtle（solid 才品牌实心）
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 颜色
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @fires download-complete - 数据已交给浏览器；detail 为 `{ fileName }`
 * @fires download-error - 取数失败或无法创建下载；detail 为 `{ error, fileName }`，此时状态已回到 idle
 * @csspart root - 触发下载的按钮，须是原生 `<button>`（承载 data-state / aria-busy）
 */
export class XhDownloadTriggerElement extends XhElement {
  static override partContract = { anatomy: downloadTriggerAnatomy, meta: downloadTriggerMeta }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    data: { converter: STRING_CONVERTER },
    fileName: { converter: STRING_CONVERTER, attribute: 'file-name' },
    mimeType: { converter: STRING_CONVERTER, attribute: 'mime-type' },
    disabled: { converter: BOOLEAN_CONVERTER },
    variant: { converter: STRING_CONVERTER },
    tone: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
    // 文案是对象，只走 property
    translations: { attribute: false },
  }

  // 属性只喂得进字符串，property 还能直接喂 Blob 与取数函数
  declare data?: DownloadTriggerData
  declare fileName?: string
  declare mimeType?: string
  declare disabled?: boolean
  declare variant?: ActionVariant
  declare tone?: Tone
  declare size?: Size
  declare translations?: Partial<DownloadTriggerTranslations>

  private readonly notifyComplete = (details: DownloadTriggerCompleteDetails): void => {
    this.dispatchEvent(new CustomEvent('download-complete', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyError = (details: DownloadTriggerErrorDetails): void => {
    this.dispatchEvent(new CustomEvent('download-error', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<DownloadTriggerSchema>(this, downloadTriggerMachine, () => this.machineProps())

  private machineProps(): Partial<DownloadTriggerSchema['props']> {
    return {
      data: this.data,
      fileName: this.fileName,
      mimeType: this.mimeType,
      disabled: this.disabled,
      variant: this.variant,
      tone: this.tone,
      size: this.size,
      translations: this.translations,
      onDownloadComplete: this.notifyComplete,
      onDownloadError: this.notifyError,
    }
  }

  protected wire(): void {
    const api = connectDownloadTrigger(this.ctrl.service, wcNormalize)
    const root = this.getPart('root')
    if (root)
      this.spreader.spread(root, api.getRootProps() as Record<string, unknown>)
  }
}
