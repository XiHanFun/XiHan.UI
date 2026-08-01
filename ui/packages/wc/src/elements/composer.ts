import type {
  ComposerRunStatus,
  ComposerSchema,
  ComposerSubmitDetails,
  ComposerTranslations,
  ComposerValueChangeDetails,
} from '@xihan-ui/headless'
import { composerAnatomy, composerMachine, composerMeta, connectComposer } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，以此区分受控与非受控
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 三态布尔：缺席为 undefined、"false" 为 false、其余为 true
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-composer>` —— Light-DOM 行为宿主：跑 composer 机器，把 connect 产出打到作者写的
 * root/input/submit-trigger 三类角色节点上。input 须是原生 `<textarea>`，值经 property 写、
 * 禁用走原生 disabled。流式期间发送按钮原位变停止，只换 `data-mode` 与 `aria-label`。
 *
 * @customElement xh-composer
 * @attr {string} value - 受控值，缺省该属性即非受控
 * @attr {string} default-value - 非受控初值
 * @attr {boolean} disabled - 禁用，输入框带原生 disabled，发送与停止一并吃掉
 * @attr {'ready'|'streaming'} run-status - 宿主运行态，默认 ready；streaming 时发送按钮原位变停止
 * @attr {boolean} submit-on-enter - Enter 直接提交，默认 true；写 submit-on-enter="false" 关掉
 * @fires value-change - 值变化；detail 为 `{ value: string }`
 * @fires submit - 提交；detail 为 `{ value: string }`，清空发生在派发之后。
 *   与原生表单提交同名，故不冒泡，请直接在 `<xh-composer>` 元素上监听
 * @fires stop - 流式期间按下停止；无 detail
 * @csspart root - 承载 data-disabled / data-status 的容器
 * @csspart input - 输入框，须是原生 `<textarea>`
 * @csspart submit-trigger - 发送 / 停止按钮，皮肤按 data-mode 换图标
 */
export class XhComposerElement extends XhElement {
  static override partContract = { anatomy: composerAnatomy, meta: composerMeta }

  // 描述符逐个写全，不用对象展开，CEM 分析器的 lit 插件读不了展开元素的名字
  static override properties = {
    value: { converter: STRING_CONVERTER },
    defaultValue: { converter: STRING_CONVERTER, attribute: 'default-value' },
    disabled: { converter: BOOLEAN_CONVERTER },
    runStatus: { converter: STRING_CONVERTER, attribute: 'run-status' },
    submitOnEnter: { converter: BOOLEAN_CONVERTER, attribute: 'submit-on-enter' },
    // 对象值走不了 HTML 属性，只作为 property 暴露
    translations: { attribute: false },
  }

  declare value?: string
  declare defaultValue?: string
  declare disabled?: boolean
  declare runStatus?: ComposerRunStatus
  declare submitOnEnter?: boolean
  /** 输入框与发送/停止按钮的无障碍名，由 connect 写到节点上。 */
  declare translations?: Partial<ComposerTranslations>

  private readonly emit = (type: string, detail: unknown, bubbles = true): void => {
    this.dispatchEvent(new CustomEvent(type, { detail, bubbles, composed: bubbles }))
  }

  private readonly notifyValue = (details: ComposerValueChangeDetails): void => this.emit('value-change', details)
  // submit 与原生表单提交同名，故不冒泡，避免被祖先 <form> 当成自己的提交
  private readonly notifySubmit = (details: ComposerSubmitDetails): void => this.emit('submit', details, false)
  private readonly notifyStop = (): void => this.emit('stop', null)

  private readonly ctrl = new MachineController<ComposerSchema>(this, composerMachine, () => this.machineProps())

  private machineProps(): Partial<ComposerSchema['props']> {
    return {
      value: this.value,
      defaultValue: this.defaultValue,
      disabled: this.disabled,
      runStatus: this.runStatus,
      submitOnEnter: this.submitOnEnter,
      translations: this.translations,
      onValueChange: this.notifyValue,
      onSubmit: this.notifySubmit,
      onStop: this.notifyStop,
    }
  }

  protected wire(): void {
    const api = connectComposer(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('input', api.getInputProps() as Record<string, unknown>)
    put('submit-trigger', api.getSubmitTriggerProps() as Record<string, unknown>)
    // value 无需另行回写，spreader 已把它按 property 写入
  }
}
