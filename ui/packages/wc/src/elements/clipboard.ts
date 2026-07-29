import type { ClipboardCopyErrorDetails, ClipboardSchema, ClipboardStatusChangeDetails } from '@xihan-ui/headless'
import { clipboardMachine, connectClipboard } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 决定。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }

/**
 * `<xh-clipboard>` —— Light-DOM 行为宿主，跑 clipboard 机器并把 connect 产出打到角色节点上。
 *
 * 复制走 `navigator.clipboard.writeText`（要求安全上下文）：在途为 copying，成功转 copied，
 * 失败回 idle 并派 `copy-error`。
 *
 * 两个 indicator 都常挂，各自用 `copied` 属性声明属于哪一侧，由宿主按状态互斥收起。
 *
 * @customElement xh-clipboard
 * @attr {string} value - 要复制的文本；缺省即复制空串
 * @attr {number} timeout - 复制成功后指示器保持的毫秒数，默认 3000；<=0 表示不自动回落
 * @fires status-change - 状态变化；detail 为 `{ status: 'copying' | 'copied' | 'idle' }`
 * @fires copy-error - 写入失败；detail 为 `{ error, value }`，此刻状态已经回到 idle
 * @csspart root - 组件根容器（承载 data-state / data-copied）
 * @csspart label - 标题，须是原生 `<label>`；`for` 恒写向 input
 * @csspart control - 输入框与按钮的包裹层，只承载 data-state
 * @csspart input - 展示要复制文本的只读输入框，须是原生 `<input>`；聚焦即全选
 * @csspart trigger - 复制按钮，须是原生 `<button>`
 * @csspart indicator - 状态标记；写 `copied` 属性的那个是成功侧，不写的是平时那侧
 */
export class XhClipboardElement extends XhElement {
  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    value: { converter: STRING_CONVERTER },
    timeout: { converter: NUMBER_CONVERTER },
  }

  declare value?: string
  declare timeout?: number

  private readonly notifyStatus = (details: ClipboardStatusChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('status-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly notifyError = (details: ClipboardCopyErrorDetails): void => {
    this.dispatchEvent(new CustomEvent('copy-error', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<ClipboardSchema>(this, clipboardMachine, () => this.machineProps())

  private machineProps(): Partial<ClipboardSchema['props']> {
    return {
      value: this.value,
      timeout: this.timeout,
      onStatusChange: this.notifyStatus,
      onCopyError: this.notifyError,
    }
  }

  protected wire(): void {
    const api = connectClipboard(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('label', api.getLabelProps() as Record<string, unknown>)
    put('control', api.getControlProps() as Record<string, unknown>)
    put('input', api.getInputProps() as Record<string, unknown>)
    put('trigger', api.getTriggerProps() as Record<string, unknown>)

    // 指示器是多实例 part，逐个打：身份取作者写的 copied 属性
    for (const el of this.getParts('indicator')) {
      const indicator = { copied: el.hasAttribute('copied') }
      this.spreader.spread(el, api.getIndicatorProps(indicator) as Record<string, unknown>)
      // 用内联 display 收起非当前侧
      this.setPartHidden(el, indicator.copied !== api.copied)
    }
  }
}
