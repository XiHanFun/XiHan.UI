import type {
  QuestionFlowAnswers,
  QuestionFlowApi,
  QuestionFlowNotes,
  QuestionFlowQuestion,
  QuestionFlowSchema,
  QuestionFlowStatus,
  QuestionFlowTranslations,
} from '@xihan-ui/headless'
import type { ControlVariant, Size, Tone } from '@xihan-ui/kernel'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { provideQuestionFlow, useQuestionFlowContext } from './context'
import { useQuestionFlow } from './use-question-flow'

type Props = QuestionFlowSchema['props']

/** 默认插槽的载荷：进度、当前题，以及各条动作入口。 */
export type QuestionFlowRootSlotProps = Pick<
  QuestionFlowApi,
  'status' | 'submitted' | 'index' | 'count' | 'current' | 'isFirst' | 'isLast' | 'canAdvance'
  | 'allowSkip' | 'counter' | 'announcement' | 'answers' | 'notes'
  | 'goTo' | 'next' | 'prev' | 'skip' | 'submit' | 'toggleOption' | 'setNote'
>

/** 逐项插槽的载荷。 */
export interface QuestionFlowOptionSlotProps {
  questionId: string
  value: string
  selected: boolean
}

export const XhQuestionFlowRoot = defineComponent({
  name: 'XhQuestionFlowRoot',
  // 全部 default: undefined，缺省值由机器与 connect 决定
  props: {
    questions: { type: Array as PropType<readonly QuestionFlowQuestion[]>, default: undefined },
    index: { type: Number, default: undefined },
    defaultIndex: { type: Number, default: undefined },
    answers: { type: Object as PropType<QuestionFlowAnswers>, default: undefined },
    defaultAnswers: { type: Object as PropType<QuestionFlowAnswers>, default: undefined },
    notes: { type: Object as PropType<QuestionFlowNotes>, default: undefined },
    defaultNotes: { type: Object as PropType<QuestionFlowNotes>, default: undefined },
    status: { type: String as PropType<QuestionFlowStatus>, default: undefined },
    defaultStatus: { type: String as PropType<QuestionFlowStatus>, default: undefined },
    autoAdvance: { type: Boolean, default: undefined },
    autoAdvanceDelay: { type: Number, default: undefined },
    allowSkip: { type: Boolean, default: undefined },
    loop: { type: Boolean, default: undefined },
    variant: { type: String as PropType<ControlVariant>, default: undefined },
    tone: { type: String as PropType<Tone>, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
    translations: { type: Object as PropType<Partial<QuestionFlowTranslations>>, default: undefined },
  },
  emits: {
    'index-change': (_details: PayloadOf<Props, 'onIndexChange'>) => true,
    'update:index': (_value: number) => true,
    'answers-change': (_details: PayloadOf<Props, 'onAnswersChange'>) => true,
    'update:answers': (_value: QuestionFlowAnswers) => true,
    'notes-change': (_details: PayloadOf<Props, 'onNotesChange'>) => true,
    'update:notes': (_value: QuestionFlowNotes) => true,
    'skip': (_details: PayloadOf<Props, 'onSkip'>) => true,
    'submit': (_details: PayloadOf<Props, 'onSubmit'>) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: QuestionFlowRootSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const ctx = useQuestionFlow(withXhConfig('question-flow', props) as Props, {
      onIndexChange: (details) => {
        emit('index-change', details)
        emit('update:index', details.index)
      },
      onAnswersChange: (details) => {
        emit('answers-change', details)
        emit('update:answers', details.answers)
      },
      onNotesChange: (details) => {
        emit('notes-change', details)
        emit('update:notes', details.notes)
      },
      onSkip: details => emit('skip', details),
      onSubmit: details => emit('submit', details),
    })
    provideQuestionFlow(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      status: ctx.api.value.status,
      submitted: ctx.api.value.submitted,
      index: ctx.api.value.index,
      count: ctx.api.value.count,
      current: ctx.api.value.current,
      isFirst: ctx.api.value.isFirst,
      isLast: ctx.api.value.isLast,
      canAdvance: ctx.api.value.canAdvance,
      allowSkip: ctx.api.value.allowSkip,
      counter: ctx.api.value.counter,
      announcement: ctx.api.value.announcement,
      answers: ctx.api.value.answers,
      notes: ctx.api.value.notes,
      goTo: ctx.api.value.goTo,
      next: ctx.api.value.next,
      prev: ctx.api.value.prev,
      skip: ctx.api.value.skip,
      submit: ctx.api.value.submit,
      toggleOption: ctx.api.value.toggleOption,
      setNote: ctx.api.value.setNote,
    }))
  },
})

/** 定高并裁切的那一格；高度由机器量好写进内联样式的私有槽。 */
export const XhQuestionFlowViewport = defineComponent({
  name: 'XhQuestionFlowViewport',
  setup(_, { slots }) {
    const ctx = useQuestionFlowContext()
    return () => h('div', ctx.api.value.getViewportProps() as Record<string, unknown>, slots.default?.())
  },
})

/** 纵向排布全部题目的轨道，同时是量测的参照系。 */
export const XhQuestionFlowTrack = defineComponent({
  name: 'XhQuestionFlowTrack',
  setup(_, { slots }) {
    const ctx = useQuestionFlowContext()
    return () => h(
      'div',
      { ...ctx.api.value.getTrackProps() as Record<string, unknown>, ref: ctx.trackRef },
      slots.default?.(),
    )
  },
})

export const XhQuestionFlowQuestion = defineComponent({
  name: 'XhQuestionFlowQuestion',
  props: {
    questionId: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useQuestionFlowContext()
    return () => h(
      'div',
      ctx.api.value.getQuestionProps({ id: props.questionId }) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})

export const XhQuestionFlowPrompt = defineComponent({
  name: 'XhQuestionFlowPrompt',
  props: {
    questionId: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useQuestionFlowContext()
    return () => h(
      'p',
      ctx.api.value.getPromptProps({ id: props.questionId }) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})

export const XhQuestionFlowOptionGroup = defineComponent({
  name: 'XhQuestionFlowOptionGroup',
  props: {
    questionId: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useQuestionFlowContext()
    return () => h(
      'div',
      ctx.api.value.getOptionGroupProps({ id: props.questionId }) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})

export const XhQuestionFlowOption = defineComponent({
  name: 'XhQuestionFlowOption',
  props: {
    questionId: { type: String, required: true },
    optionValue: { type: String, required: true },
    // 缺省交给 connect 回 questions 里查，写死 false 会盖掉数据里的禁用
    optionDisabled: { type: Boolean, default: undefined },
  },
  slots: Object as SlotsType<{
    default?: (props: QuestionFlowOptionSlotProps) => VNode[]
  }>,
  setup(props, { slots }) {
    const ctx = useQuestionFlowContext()
    // 用原生 button，指针激活由平台负责
    return () => h(
      'button',
      ctx.api.value.getOptionProps({
        questionId: props.questionId,
        value: props.optionValue,
        disabled: props.optionDisabled,
      }) as Record<string, unknown>,
      slots.default?.({
        questionId: props.questionId,
        value: props.optionValue,
        selected: ctx.api.value.isOptionSelected(props.questionId, props.optionValue),
      }),
    )
  },
})

export const XhQuestionFlowOptionIndicator = defineComponent({
  name: 'XhQuestionFlowOptionIndicator',
  props: {
    questionId: { type: String, required: true },
    optionValue: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useQuestionFlowContext()
    return () => h(
      'span',
      ctx.api.value.getOptionIndicatorProps({
        questionId: props.questionId,
        value: props.optionValue,
      }) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})

export const XhQuestionFlowOptionLabel = defineComponent({
  name: 'XhQuestionFlowOptionLabel',
  props: {
    questionId: { type: String, required: true },
    optionValue: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useQuestionFlowContext()
    // 排在选项之内，文本自然构成它的可及名
    return () => h(
      'span',
      ctx.api.value.getOptionLabelProps({
        questionId: props.questionId,
        value: props.optionValue,
      }) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})

export const XhQuestionFlowNote = defineComponent({
  name: 'XhQuestionFlowNote',
  props: {
    questionId: { type: String, required: true },
  },
  setup(props) {
    const ctx = useQuestionFlowContext()
    // 自闭合的输入格，内容由 value 给，不收插槽
    return () => h('input', ctx.api.value.getNoteProps({ id: props.questionId }) as Record<string, unknown>)
  },
})

export const XhQuestionFlowFooter = defineComponent({
  name: 'XhQuestionFlowFooter',
  setup(_, { slots }) {
    const ctx = useQuestionFlowContext()
    return () => h('div', ctx.api.value.getFooterProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhQuestionFlowPrevTrigger = defineComponent({
  name: 'XhQuestionFlowPrevTrigger',
  setup(_, { slots }) {
    const ctx = useQuestionFlowContext()
    return () => h('button', ctx.api.value.getPrevTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhQuestionFlowCounter = defineComponent({
  name: 'XhQuestionFlowCounter',
  setup(_, { slots }) {
    const ctx = useQuestionFlowContext()
    // 不给内容时显示 N / M；这一格对读屏隐藏，进度由播报区念
    return () => h(
      'span',
      ctx.api.value.getCounterProps() as Record<string, unknown>,
      slots.default?.() ?? ctx.api.value.counter,
    )
  },
})

export const XhQuestionFlowNextTrigger = defineComponent({
  name: 'XhQuestionFlowNextTrigger',
  setup(_, { slots }) {
    const ctx = useQuestionFlowContext()
    return () => h('button', ctx.api.value.getNextTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhQuestionFlowSkipTrigger = defineComponent({
  name: 'XhQuestionFlowSkipTrigger',
  setup(_, { slots }) {
    const ctx = useQuestionFlowContext()
    return () => h('button', ctx.api.value.getSkipTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhQuestionFlowSubmitTrigger = defineComponent({
  name: 'XhQuestionFlowSubmitTrigger',
  setup(_, { slots }) {
    const ctx = useQuestionFlowContext()
    // 一颗按钮两个身份：不是末题时继续，末题时发送，原位换 data-mode 与可访问名
    return () => h('button', ctx.api.value.getSubmitTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhQuestionFlowResult = defineComponent({
  name: 'XhQuestionFlowResult',
  setup(_, { slots }) {
    const ctx = useQuestionFlowContext()
    // 交卷之后才露出；文字由播报区念，这一格对读屏隐藏
    return () => h('div', ctx.api.value.getResultProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhQuestionFlowAnnouncement = defineComponent({
  name: 'XhQuestionFlowAnnouncement',
  setup(_, { slots }) {
    const ctx = useQuestionFlowContext()
    // 不给内容时念进度，交卷后念结果
    return () => h(
      'div',
      ctx.api.value.getAnnouncementProps() as Record<string, unknown>,
      slots.default?.() ?? ctx.api.value.announcement,
    )
  },
})
