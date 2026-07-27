import type { ClipboardCopyErrorDetails, ClipboardSchema, ClipboardStatusChangeDetails } from '@xihan-ui/headless'
import { clipboardMachine, connectClipboard } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席一律翻成 undefined：缺省值的唯一事实源留在机器与 connect 里。
// Lit 自带的转换器会把缺席落成 null，那样属性就再也表达不了"未指定"。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }

/**
 * `<xh-clipboard>` —— Light-DOM 行为宿主：作者写 root/label/control/input/trigger/indicator
 * 角色节点，元素跑 clipboard 机器并把 connect 产出打上去。
 *
 * 复制走 `navigator.clipboard.writeText`，它要求安全上下文（https / localhost）且可能被权限拒绝。
 * 写入在途期间状态是 copying，写成功才转 copied；失败一律回 idle 并派 `copy-error`，
 * 界面上绝不会留下"已复制"的假象。
 *
 * 两个 indicator 都常挂，各自用 `copied` 属性声明自己属于哪一侧，由宿主按状态互斥收起。
 * 这个声明只在接线时读一次，运行期改它不会重新接线——它描述的是这个节点是什么，
 * 与条目的 value 不同，正常写法下不会变。
 *
 * @customElement xh-clipboard
 * @attr {string} value - 要复制的文本；缺省即复制空串
 * @attr {number} timeout - 复制成功后指示器保持的毫秒数，默认 3000；<=0 表示不自动回落
 * @fires status-change - 状态变化；detail 为 `{ status: 'copying' | 'copied' | 'idle' }`
 * @fires copy-error - 写入失败；detail 为 `{ error, value }`，此刻状态已经回到 idle
 * @csspart root - 组件根容器（承载 data-state / data-copied）
 * @csspart label - 标题；`for` 恒写向 input，故须是原生 `<label>` 才点得动
 * @csspart control - 输入框与按钮的包裹层，只承载 data-state
 * @csspart input - 展示要复制文本的只读输入框，须是原生 `<input>`；聚焦即全选
 * @csspart trigger - 复制按钮，须是原生 `<button>`（Enter/Space 的激活归平台）
 * @csspart indicator - 状态标记；写 `copied` 属性的那个是成功侧，不写的是平时那侧
 */
export class XhClipboardElement extends XhElement {
  // 描述符逐个写全、不用对象展开：CEM 分析器的 lit 插件读不了展开元素的名字，会整个崩掉。
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

  // clipboard 机器不用定位与消解层：不需要 config/layer/refs/scope，controller 只带 props。
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
      // 收起只写 hidden 属性是不够的：作者层给这个 part 声明的任何一条 display
      // 都会盖过 UA 的 [hidden]{display:none}，只有内联 style.display 压得住
      this.setPartHidden(el, indicator.copied !== api.copied)
    }
  }
}
