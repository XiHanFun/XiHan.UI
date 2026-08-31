import type {
  PromptInputSchema,
  PromptInputSubmitDetails,
  PromptInputSubmitKey,
  PromptInputTranslations,
  PromptInputValueChangeDetails,
} from '@xihan-ui/headless'
import type { ControlVariant, Size, Tone } from '@xihan-ui/kernel'
import { connectPromptInput, promptInputAnatomy, promptInputMachine, promptInputMeta } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，以此区分受控与非受控
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 三态布尔：缺席为 undefined、"false" 为 false、其余为 true
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-prompt-input>` —— Light-DOM 行为宿主：跑 prompt-input 机器，把 connect 产出打到作者写的
 * root/input/submit-trigger 三类角色节点上，另有可选的 input-row。input 须是原生 `<textarea>`，
 * 值经 property 写、禁用走原生 disabled。生成期间发送按钮原位变停止，只换 `data-mode` 与 `aria-label`。
 *
 * @customElement xh-prompt-input
 * @attr {string} value - 受控值，缺省该属性即非受控
 * @attr {string} default-value - 非受控初值
 * @attr {boolean} disabled - 禁用，输入框带原生 disabled，提交与停止一并吃掉
 * @attr {boolean} busy - 正在生成：发送按钮原位变停止，提交路径全部挡下
 * @attr {'enter'|'mod-enter'} submit-key - 按哪一档提交，默认 enter
 * @attr {boolean} allow-empty-submit - 允许空值提交，默认关；有附件时置真
 * @attr {boolean} clear-on-submit - 提交后清空，默认开；写 clear-on-submit="false" 关掉
 * @attr {string} variant - 形态：outline / subtle / ghost
 * @attr {string} tone - 语气
 * @attr {string} size - 尺寸：sm / md / lg
 * @fires value-change - 值变化；detail 为 `{ value: string }`
 * @fires submit - 提交；detail 为 `{ value: string }`，清空发生在派发之后。
 *   与原生表单提交同名，故不冒泡，请直接在 `<xh-prompt-input>` 元素上监听
 * @fires stop - 生成期间按下停止；无 detail
 * @csspart root - 承载 data-disabled / data-busy 与三视觉轴的容器
 * @csspart input-row - 可选的输入行：写了它，root 翻成竖排，输入框与按钮收进这一行
 * @csspart input - 输入框，须是原生 `<textarea>`
 * @csspart submit-trigger - 发送 / 停止按钮，留空时皮肤按 data-mode 画上箭头或停止方块
 */
export class XhPromptInputElement extends XhElement {
  static override partContract = { anatomy: promptInputAnatomy, meta: promptInputMeta }

  // 描述符逐个写全，不用对象展开，CEM 分析器的 lit 插件读不了展开元素的名字
  static override properties = {
    value: { converter: STRING_CONVERTER },
    defaultValue: { converter: STRING_CONVERTER, attribute: 'default-value' },
    disabled: { converter: BOOLEAN_CONVERTER },
    busy: { converter: BOOLEAN_CONVERTER },
    submitKey: { converter: STRING_CONVERTER, attribute: 'submit-key' },
    allowEmptySubmit: { converter: BOOLEAN_CONVERTER, attribute: 'allow-empty-submit' },
    clearOnSubmit: { converter: BOOLEAN_CONVERTER, attribute: 'clear-on-submit' },
    variant: { converter: STRING_CONVERTER },
    tone: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
    // 对象值走不了 HTML 属性，只作为 property 暴露
    translations: { attribute: false },
  }

  declare value?: string
  declare defaultValue?: string
  declare disabled?: boolean
  declare busy?: boolean
  declare submitKey?: PromptInputSubmitKey
  declare allowEmptySubmit?: boolean
  declare clearOnSubmit?: boolean
  declare variant?: ControlVariant
  declare tone?: Tone
  declare size?: Size
  /** 发送与停止按钮的无障碍名；给了 input 才会写输入框的 aria-label。 */
  declare translations?: Partial<PromptInputTranslations>

  private readonly emit = (type: string, detail: unknown, bubbles = true): void => {
    this.dispatchEvent(new CustomEvent(type, { detail, bubbles, composed: bubbles }))
  }

  private readonly notifyValue = (details: PromptInputValueChangeDetails): void => this.emit('value-change', details)
  // submit 与原生表单提交同名，故不冒泡，避免被祖先 <form> 当成自己的提交
  private readonly notifySubmit = (details: PromptInputSubmitDetails): void => this.emit('submit', details, false)
  private readonly notifyStop = (): void => this.emit('stop', null)

  private readonly ctrl = new MachineController<PromptInputSchema>(this, promptInputMachine, () => this.machineProps())

  private machineProps(): Partial<PromptInputSchema['props']> {
    return {
      value: this.value,
      defaultValue: this.defaultValue,
      disabled: this.disabled,
      busy: this.busy,
      submitKey: this.submitKey,
      allowEmptySubmit: this.allowEmptySubmit,
      clearOnSubmit: this.clearOnSubmit,
      variant: this.variant,
      tone: this.tone,
      size: this.size,
      translations: this.translations,
      onValueChange: this.notifyValue,
      onSubmit: this.notifySubmit,
      onStop: this.notifyStop,
    }
  }

  protected wire(): void {
    const api = connectPromptInput(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('input-row', api.getInputRowProps() as Record<string, unknown>)
    put('input', api.getInputProps() as Record<string, unknown>)
    put('submit-trigger', api.getSubmitTriggerProps() as Record<string, unknown>)
    // value 无需另行回写，spreader 已把它按 property 写入
  }
}
