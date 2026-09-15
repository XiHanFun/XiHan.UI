/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 reasoning 相关实现。

import type { ControlVariant, IdGenerator, RuntimeConfig, Size, Tone } from '@xihan-ui/core'
import type { ReasoningProps, ReasoningTranslations, ToolCallOpenChangeDetails, ToolCallSchema } from '@xihan-ui/headless'
import type { OverlayExit } from '../overlay-exit'
import { createCounterIdGenerator, createRuntimeConfig, createScope } from '@xihan-ui/core'
import { connectReasoning, reasoningAnatomy, reasoningDuration, reasoningMeta, reasoningStatusText, toolCallMachine } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { createOverlayExit } from '../overlay-exit'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 给出
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 三态布尔：缺席为 undefined、"false" 为 false、其余为 true
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }
// 空串按缺席处理，避免 Number('') 落成 0
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }

/**
 * `<xh-reasoning>`：Light-DOM 行为宿主：把思考过程收进一个折叠区。
 * 自动开合整套复用 tool-call 的状态机，它不识别解剖、只识别是否运行中与四个叶态；
 * 全局文案另按 reasoning 分类获取，不经状态机名。
 *
 * @customElement xh-reasoning
 * @attr {boolean} streaming - 仍在思考：随它自动展开，完成后自动收起
 * @attr {number} start-time - 开始思考的毫秒时间戳
 * @attr {number} end-time - 思考结束的毫秒时间戳；流被中止时它会缺席
 * @attr {boolean} open - 受控开合，未提供该属性即非受控
 * @attr {boolean} default-open - 非受控初值
 * @attr {boolean} auto-disclosure - 随思考状态自动开合，默认开启；写 auto-disclosure="false" 关闭
 * @attr {boolean} disabled - 禁用折叠开关
 * @attr {'outline'|'subtle'|'ghost'} variant - 形态：描边 / 底色分区（默认档）/ 无壳内联
 * @attr {string} tone - 语气
 * @attr {string} size - 尺寸：sm / md / lg
 * @fires open-change - 开合变化；detail 为 `{ open: boolean, source: 'user' | 'auto' | 'api' }`
 * @csspart root - 外壳，承载 data-state / data-streaming / data-variant
 * @csspart trigger - 折叠开关，承载 aria-expanded / aria-controls
 * @csspart icon - 状态图形位，承载 data-streaming，对读屏隐藏
 * @csspart indicator - 纯装饰指示，对读屏隐藏
 * @csspart label - 折叠区的名字，排在开关内因而计入它的可访问名
 * @csspart duration - 思考时长，同上
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
    variant: { converter: STRING_CONVERTER },
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
  declare variant?: ControlVariant
  declare tone?: Tone
  declare size?: Size
  /** 折叠区的名字与两句时长文案。 */
  declare translations?: Partial<ReasoningTranslations>

  /** 由两个时刻计算的思考时长，任一缺席或顺序倒置时为 undefined。 */
  get durationMs(): number | undefined {
    const props = this.configured('reasoning', this.viewProps())
    return reasoningDuration(props.startTime, props.endTime)
  }

  /** 当前应显示的状态文案：作者将其写入 label 角色节点。 */
  get statusText(): string {
    const props = this.configured('reasoning', this.viewProps())
    return reasoningStatusText(
      !!props.streaming,
      reasoningDuration(props.startTime, props.endTime),
      props.translations,
    )
  }

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
      variant: this.variant,
      tone: this.tone,
      size: this.size,
      translations: this.translations,
    }
  }

  private exit: OverlayExit | null = null
  private readonly idGen: IdGenerator = createCounterIdGenerator()
  private readonly reasoningScope = createScope(null, this.idGen)
  private config: RuntimeConfig | null = null

  // 退场闸门要一份运行期配置来问减弱动效偏好；本组件不入层栈，所以只建这一样
  private ensureConfig(): void {
    if (this.config)
      return
    this.config = createRuntimeConfig({ scope: this.reasoningScope, idGenerator: this.idGen })
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
    put('icon', api.getIconProps() as Record<string, unknown>)
    put('indicator', api.getIndicatorProps() as Record<string, unknown>)
    put('label', api.getLabelProps() as Record<string, unknown>)
    put('duration', api.getDurationProps() as Record<string, unknown>)
    put('content', api.getContentProps() as Record<string, unknown>)

    // 收起跟着退场闸门走：皮肤刻意没给 content 补 [hidden]{display:none}（补了退场
    // 就一帧都播不出来），真正的收起在动画结束后落成内联 display
    const content = this.getPart('content')
    this.ensureConfig()
    this.exit ??= createOverlayExit({
      config: this.config!,
      open: api.open,
      onExitComplete: () => this.requestUpdate(),
    })
    this.exit.track(content)
    this.exit.update(api.open)
    if (content)
      this.setPartHidden(content, !this.exit.visible)
  }
}
