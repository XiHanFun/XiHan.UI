import type {
  QuestionFlowAnswers,
  QuestionFlowAnswersChangeDetails,
  QuestionFlowIndexChangeDetails,
  QuestionFlowNotes,
  QuestionFlowNotesChangeDetails,
  QuestionFlowOptionProps,
  QuestionFlowQuestion,
  QuestionFlowSchema,
  QuestionFlowSkipDetails,
  QuestionFlowStatus,
  QuestionFlowSubmitDetails,
  QuestionFlowTranslations,
} from '@xihan-ui/headless'
import type { ControlVariant, Size, Tone } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import { connectQuestionFlow, questionFlowAnatomy, questionFlowMachine, questionFlowMeta } from '@xihan-ui/headless'
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
 * `<xh-question-flow>` —— Light-DOM 行为宿主：一次一题的澄清问卷。
 *
 * 题目栈纵向排在 track 里，viewport 定高并裁切，当前题由量出来的位移推进视口。
 * 题与选项的身份写在作者自己的节点上（`question-id` 与 `option-value`），
 * **不用 value**——那是表单属性，写上去会与本组件无关的表单语义搅在一起。
 * 选项须是原生 `<button>`：指针激活由平台负责。
 *
 * @customElement xh-question-flow
 * @attr {number} index - 受控的当前题下标；缺省该属性即非受控
 * @attr {number} default-index - 非受控的初始下标，默认 0
 * @attr {string} status - 受控答题状态：answering / submitted
 * @attr {string} default-status - 非受控初值，默认 answering
 * @attr {boolean} auto-advance - 单选选中后自动走下一题，默认开；它只走下一题，末题上不会替人按发送
 * @attr {number} auto-advance-delay - 自动前进前等多久（毫秒），默认 480
 * @attr {boolean} allow-skip - 允许跳过，默认开；关掉后跳过键整颗收起
 * @attr {boolean} loop - 选项组内漫游走到尽头回绕，默认开启
 * @attr {'outline'|'subtle'|'ghost'} variant - 形态
 * @attr {'brand'|'neutral'|'success'|'warning'|'danger'|'info'} tone - 语气
 * @attr {'sm'|'md'|'lg'} size - 尺寸
 * @fires index-change - 当前题变化；detail 为 `{ index }`
 * @fires answers-change - 答案变化；detail 为 `{ answers }`
 * @fires notes-change - 自由文本变化；detail 为 `{ notes }`
 * @fires skip - 跳过一题；detail 为 `{ index, questionId }`
 * @fires submit - 交卷；detail 为 `{ answers, notes }`
 * @csspart root - 问卷本体，三个视觉轴都落在它上面
 * @csspart viewport - 定高并裁切的那一格
 * @csspart track - 纵向排布全部题目的轨道
 * @csspart question - 一题的整块，role=group；非当前题 aria-hidden 且 inert
 * @csspart prompt - 题干，同时是选项组的可访问名
 * @csspart option-group - 选项组，单选取 radiogroup、多选取 group
 * @csspart option - 一个选项，须是原生 `<button>` 并自带 option-value 属性标识身份
 * @csspart option-indicator - 记号，对读屏隐藏
 * @csspart option-label - 选项文字，排在选项内因而构成它的可及名
 * @csspart note - 这一题的自由文本，须是原生 `<input>`
 * @csspart footer - 排布步进与动作的页脚
 * @csspart prev-trigger - 上一题
 * @csspart counter - 给眼睛看的 N / M，对读屏隐藏
 * @csspart next-trigger - 下一题
 * @csspart skip-trigger - 跳过；allow-skip 关掉时整颗收起
 * @csspart submit-trigger - 继续 / 发送同一颗按钮
 * @csspart result - 交卷后才露出的结果条，对读屏隐藏
 * @csspart live-region - 进度播报的活区
 */
export class XhQuestionFlowElement extends XhElement {
  static override partContract = { anatomy: questionFlowAnatomy, meta: questionFlowMeta }

  // 描述符逐个写全，不用对象展开，CEM 分析器的 lit 插件读不了展开元素的名字
  static override properties = {
    index: { converter: NUMBER_CONVERTER },
    defaultIndex: { converter: NUMBER_CONVERTER, attribute: 'default-index' },
    status: { converter: STRING_CONVERTER },
    defaultStatus: { converter: STRING_CONVERTER, attribute: 'default-status' },
    autoAdvance: { converter: BOOLEAN_CONVERTER, attribute: 'auto-advance' },
    autoAdvanceDelay: { converter: NUMBER_CONVERTER, attribute: 'auto-advance-delay' },
    allowSkip: { converter: BOOLEAN_CONVERTER, attribute: 'allow-skip' },
    loop: { converter: BOOLEAN_CONVERTER },
    variant: { converter: STRING_CONVERTER },
    tone: { converter: STRING_CONVERTER },
    size: { converter: STRING_CONVERTER },
    // 数组与对象值走不了 HTML 属性，只作为 property 暴露
    questions: { attribute: false },
    answers: { attribute: false },
    defaultAnswers: { attribute: false },
    notes: { attribute: false },
    defaultNotes: { attribute: false },
    translations: { attribute: false },
  }

  declare index?: number
  declare defaultIndex?: number
  declare status?: QuestionFlowStatus
  declare defaultStatus?: QuestionFlowStatus
  declare autoAdvance?: boolean
  declare autoAdvanceDelay?: number
  declare allowSkip?: boolean
  declare loop?: boolean
  declare variant?: ControlVariant
  declare tone?: Tone
  declare size?: Size
  /** 题目数据；不给就一道题都没有。 */
  declare questions?: readonly QuestionFlowQuestion[]
  declare answers?: QuestionFlowAnswers
  declare defaultAnswers?: QuestionFlowAnswers
  declare notes?: QuestionFlowNotes
  declare defaultNotes?: QuestionFlowNotes
  declare translations?: Partial<QuestionFlowTranslations>

  private readonly emit = (type: string, detail: unknown, bubbles = true): void => {
    this.dispatchEvent(new CustomEvent(type, { detail, bubbles, composed: bubbles }))
  }

  private readonly notifyIndex = (details: QuestionFlowIndexChangeDetails): void => this.emit('index-change', details)
  private readonly notifyAnswers = (details: QuestionFlowAnswersChangeDetails): void => this.emit('answers-change', details)
  private readonly notifyNotes = (details: QuestionFlowNotesChangeDetails): void => this.emit('notes-change', details)
  private readonly notifySkip = (details: QuestionFlowSkipDetails): void => this.emit('skip', details)
  // submit 与原生表单提交同名，故不冒泡，避免被祖先 <form> 当成自己的提交
  private readonly notifySubmit = (details: QuestionFlowSubmitDetails): void => this.emit('submit', details, false)

  private readonly ctrl = new MachineController<QuestionFlowSchema>(
    this,
    questionFlowMachine,
    () => ({
      questions: this.questions,
      index: this.index,
      defaultIndex: this.defaultIndex,
      answers: this.answers,
      defaultAnswers: this.defaultAnswers,
      notes: this.notes,
      defaultNotes: this.defaultNotes,
      status: this.status,
      defaultStatus: this.defaultStatus,
      autoAdvance: this.autoAdvance,
      autoAdvanceDelay: this.autoAdvanceDelay,
      allowSkip: this.allowSkip,
      loop: this.loop,
      variant: this.variant,
      tone: this.tone,
      size: this.size,
      translations: this.translations,
      onIndexChange: this.notifyIndex,
      onAnswersChange: this.notifyAnswers,
      onNotesChange: this.notifyNotes,
      onSkip: this.notifySkip,
      onSubmit: this.notifySubmit,
    }),
    { onBuilt: svc => this.injectRefs(svc) },
  )

  // onBuilt 在 ctrl 构造期就跑，service 由参数传入
  private injectRefs(svc: Service<QuestionFlowSchema>): void {
    svc.refs.set('getTrackEl', () => this.getPart('track'))
  }

  /** 一题的身份，取作者写在节点上的 question-id。 */
  private questionIdOf(el: HTMLElement): string {
    return el.getAttribute('question-id') ?? ''
  }

  /** 一个选项的自报家门，全部取自作者写在节点上的属性。 */
  private optionOf(el: HTMLElement): QuestionFlowOptionProps {
    return {
      questionId: this.questionIdOf(el),
      value: el.getAttribute('option-value') ?? '',
      // 属性没写就交给 questions 里的数据定夺，不能并成 false
      disabled: el.hasAttribute('option-disabled') ? true : undefined,
    }
  }

  /** 按子树过滤：getParts 收的是整个元素范围，要按所属节点归位。 */
  private partsIn(host: HTMLElement, name: string): HTMLElement[] {
    return this.getParts(name).filter(el => host.contains(el))
  }

  protected wire(): void {
    const api = connectQuestionFlow(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('viewport', api.getViewportProps() as Record<string, unknown>)
    put('track', api.getTrackProps() as Record<string, unknown>)
    put('footer', api.getFooterProps() as Record<string, unknown>)
    put('prev-trigger', api.getPrevTriggerProps() as Record<string, unknown>)
    put('next-trigger', api.getNextTriggerProps() as Record<string, unknown>)
    put('result', api.getResultProps() as Record<string, unknown>)

    const skip = this.getPart('skip-trigger')
    if (skip) {
      const props = api.getSkipTriggerProps() as Record<string, unknown>
      this.spreader.spread(skip, props)
      // 按本帧产出的 hidden 用内联 display 收起
      this.setPartHidden(skip, props.hidden === true)
    }

    put('submit-trigger', api.getSubmitTriggerProps() as Record<string, unknown>)

    const counter = this.getPart('counter')
    if (counter) {
      this.spreader.spread(counter, api.getCounterProps() as Record<string, unknown>)
      counter.textContent = api.counter
    }

    const live = this.getPart('live-region')
    if (live) {
      this.spreader.spread(live, api.getLiveRegionProps() as Record<string, unknown>)
      live.textContent = api.announcement
    }

    // 多实例 part 逐个打，题有几道打几道
    for (const question of this.getParts('question')) {
      const id = this.questionIdOf(question)
      this.spreader.spread(question, api.getQuestionProps({ id }) as Record<string, unknown>)
      for (const prompt of this.partsIn(question, 'prompt'))
        this.spreader.spread(prompt, api.getPromptProps({ id }) as Record<string, unknown>)
      for (const group of this.partsIn(question, 'option-group'))
        this.spreader.spread(group, api.getOptionGroupProps({ id }) as Record<string, unknown>)
      for (const note of this.partsIn(question, 'note'))
        this.spreader.spread(note, api.getNoteProps({ id }) as Record<string, unknown>)
      for (const option of this.partsIn(question, 'option')) {
        // 选项节点上可以只写 option-value，题的身份从它所属的那一题上取
        const item = { ...this.optionOf(option), questionId: id }
        this.spreader.spread(option, api.getOptionProps(item) as Record<string, unknown>)
        for (const indicator of this.partsIn(option, 'option-indicator'))
          this.spreader.spread(indicator, api.getOptionIndicatorProps(item) as Record<string, unknown>)
        for (const label of this.partsIn(option, 'option-label'))
          this.spreader.spread(label, api.getOptionLabelProps(item) as Record<string, unknown>)
      }
    }
  }
}
