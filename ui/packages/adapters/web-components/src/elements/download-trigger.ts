import type { DownloadTriggerCompleteDetails, DownloadTriggerData, DownloadTriggerErrorDetails, DownloadTriggerSchema } from '@xihan-ui/headless'
import { connectDownloadTrigger, downloadTriggerAnatomy, downloadTriggerMachine, downloadTriggerMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 布尔三态：缺席 = undefined（用 connect 的默认值），="false" = false，其余 = true。
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-download-trigger>` —— Light-DOM 行为宿主，跑 download-trigger 机器并把 connect 产出打到 root 角色节点。
 *
 * 下载走临时地址加一次隐藏链接点击：点下去先进 preparing，数据交给浏览器后回 idle 并派
 * `download-complete`，取数失败同样回 idle 并派 `download-error`。
 *
 * Blob 与取数函数只能走 property（`el.data = blob`）：HTML 属性只装得下一个字符串。
 *
 * @customElement xh-download-trigger
 * @attr {string} data - 要下载的文本；Blob 与取数函数只能经 property 交进来
 * @attr {string} file-name - 写出的文件名；缺省或空串退回内建名 download
 * @attr {string} mime-type - 内容类型；给了它就以它为准，连 Blob 自带的类型也照它重包
 * @attr {boolean} disabled - 禁用，按钮不可聚焦也点不动
 * @fires download-complete - 数据已交给浏览器；detail 为 `{ fileName }`
 * @fires download-error - 取数失败或造不出下载；detail 为 `{ error, fileName }`，此刻状态已经回到 idle
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
  }

  // 属性只喂得进字符串，property 还能直接喂 Blob 与取数函数
  declare data?: DownloadTriggerData
  declare fileName?: string
  declare mimeType?: string
  declare disabled?: boolean

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
