import type { ReasoningProps, ReasoningTranslations, ToolCallOpenChangeDetails, ToolCallSchema } from '@xihan-ui/headless'
import type { Size, Tone } from '@xihan-ui/kernel'
import { connectReasoning, reasoningAnatomy, reasoningMeta, toolCallMachine } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 给出
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 三态布尔：缺席为 undefined、"false" 为 false、其余为 true
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }
// 空串按缺席处理，避免 Number('') 落成 0
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }

/**
 * `<xh-reasoning>` —— Light-DOM 行为宿主：把思考过程收进一个折叠区。
 * 自动开合整套复用 tool-call 的机器，它不认解剖、只认在不在跑与四个叶态；
 * 全局文案另按 reasoning 分桶取，不经机器名。
 *
 * @customElement xh-reasoning
 * @attr {boolean} streaming - 还在思考：跟着它自动展开，写完自动收起
 * @attr {number} start-time - 开始思考的毫秒时间戳
 * @attr {number} end-time - 思考结束的毫秒时间戳；流被中止时它会缺席
 * @attr {boolean} open - 受控开合，缺省该属性即非受控
 * @attr {boolean} default-open - 非受控初值
 * @attr {boolean} auto-disclosure - 跟着思考状态自动开合，默认开；写 auto-disclosure="false" 关掉
 * @attr {boolean} disabled - 禁用折叠开关
 * @attr {string} tone - 语气
 * @attr {string} size - 尺寸：sm / md / lg
 * @fires open-change - 开合变化；detail 为 `{ open: boolean, source: 'user' | 'auto' | 'api' }`
 * @csspart root - 外壳，承载 data-state / data-streaming
 * @csspart trigger - 折叠开关，承载 aria-expanded / aria-controls
 * @csspart indicator - 纯装饰指示，对读屏隐藏
 * @csspart label - 折叠区的名字，排在开关内因而计入它的可访问名
 * @csspart duration - 想了多久，同上
 * @csspart content - 思考正文，role=region 且由开关命名
 */
export class XhReasoningElement extends XhElement {
  static override partContract = { anatomy: reasoningAnatomy, meta: reasoningMeta }

  // 描述符逐个写全，不用对象展开，CEM 分析器的 lit 插件读不了展开元素的名字
  static override properties = {
    streaming: { converter: BOOLEAN_CONVERTER },
    startTime: { converter: NUMBER_CONVERTER, attribute: 'start-time' },
    endTime: { converter: NUMBER_CONVERTER, attribute: 'end-time' },
    open: { converter: BOOLEAN_CONVERTER },
    defaultOpen: { converter: BOOLEAN_CONVERTER, attribute: 'default-open' },
    autoDisclosure: { converter: BOOLEAN_CONVERTER, attribute: 'auto-disclosure' },
    disabled: { converter: BOOLEAN_CONVERTER },
    tone: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
    // 对象值走不了 HTML 属性，只作为 property 暴露
    translations: { attribute: false },
  }

  declare streaming?: boolean
  declare startTime?: number
  declare endTime?: number
  declare open?: boolean
  declare defaultOpen?: boolean
  declare autoDisclosure?: boolean
  declare disabled?: boolean
  declare tone?: Tone
  declare size?: Size
  /** 折叠区的名字与两句时长文案。 */
  declare translations?: Partial<ReasoningTranslations>

  private readonly notify = (details: ToolCallOpenChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('open-change', { detail: details, bubbles: true, composed: true }))
  }

  // configName 显式给 reasoning：机器叫 tool-call，不指定的话全局文案会取到那一格
  private readonly ctrl = new MachineController<ToolCallSchema>(
    this,
    toolCallMachine,
    () => ({
      running: this.streaming,
      open: this.open,
      defaultOpen: this.defaultOpen,
      autoDisclosure: this.autoDisclosure,
      disabled: this.disabled,
      onOpenChange: this.notify,
    }),
    { configName: 'reasoning' },
  )

  private viewProps(): ReasoningProps {
    return {
      streaming: this.streaming,
      startTime: this.startTime,
      endTime: this.endTime,
      tone: this.tone,
      size: this.size,
      translations: this.translations,
    }
  }

  protected wire(): void {
    const api = connectReasoning(this.ctrl.service, this.configured('reasoning', this.viewProps()), wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('trigger', api.getTriggerProps() as Record<string, unknown>)
    put('indicator', api.getIndicatorProps() as Record<string, unknown>)
    put('label', api.getLabelProps() as Record<string, unknown>)
    put('duration', api.getDurationProps() as Record<string, unknown>)
    put('content', api.getContentProps() as Record<string, unknown>)
  }
}
