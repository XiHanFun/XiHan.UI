import type { ControlVariant, PropTypes, Size, Tone } from '@xihan-ui/kernel'
import type { MachineSchema } from '@xihan-ui/machine'

/** 答题中 / 已提交。 */
export type QuestionFlowStatus = 'answering' | 'submitted'

/** 题型：single 是互斥单选，multiple 是可多选。 */
export type QuestionFlowType = 'single' | 'multiple'

/** 一个可选项。 */
export interface QuestionFlowOption {
  value: string
  /** 展示文本；缺省退回 value。 */
  label?: string
  disabled?: boolean
}

/** 一道题。 */
export interface QuestionFlowQuestion {
  id: string
  /** 题干。它同时是选项组的可访问名；不写就退到 translations 的兜底文案。 */
  prompt?: string
  /** single = 互斥单选（radiogroup），multiple = 多选（group + checkbox）。缺省 single。 */
  type?: QuestionFlowType
  options: readonly QuestionFlowOption[]
  /** 允许不作答就走下一题。 */
  optional?: boolean
}

/** 每题一份答案集合，键是题 id。 */
export type QuestionFlowAnswers = Readonly<Record<string, readonly string[]>>

/** 每题一份自由文本，键是题 id。 */
export type QuestionFlowNotes = Readonly<Record<string, string>>

/** 当前题量出来的几何（px），offset 是它在轨道里的起始位移。 */
export interface QuestionFlowViewport {
  blockSize: number
  offset: number
}

export interface QuestionFlowIndexChangeDetails {
  index: number
}

export interface QuestionFlowAnswersChangeDetails {
  answers: QuestionFlowAnswers
}

export interface QuestionFlowNotesChangeDetails {
  notes: QuestionFlowNotes
}

export interface QuestionFlowSkipDetails {
  index: number
  questionId: string
}

export interface QuestionFlowSubmitDetails {
  /** 提交那一刻的答案快照。 */
  answers: QuestionFlowAnswers
  /** 提交那一刻的自由文本快照。 */
  notes: QuestionFlowNotes
}

/** 部件自报它属于哪一题。connect 据此产出属性，不反查 DOM。 */
export interface QuestionFlowQuestionProps {
  id: string
}

/** 选项自报家门：属于哪一题、值是什么；禁用可由数据代为声明。 */
export interface QuestionFlowOptionProps {
  questionId: string
  value: string
  /** 逐条覆盖禁用；缺省时回 questions 里查。 */
  disabled?: boolean
}

/** 适配器在挂载前填入的 DOM 取值口。 */
export interface QuestionFlowRefs {
  /** 题目轨道：量当前题几何时的查询容器与参照系。 */
  getTrackEl: () => HTMLElement | null
}

export interface QuestionFlowSchema extends MachineSchema {
  props: {
    questions?: readonly QuestionFlowQuestion[]
    /** 当前题下标。给定即受控：内部不再自改，只发 onIndexChange。 */
    index?: number
    defaultIndex?: number
    /** 答案表。给定即受控。 */
    answers?: QuestionFlowAnswers
    defaultAnswers?: QuestionFlowAnswers
    /** 自由文本表。给定即受控。 */
    notes?: QuestionFlowNotes
    defaultNotes?: QuestionFlowNotes
    /** 答题状态。给定即受控。 */
    status?: QuestionFlowStatus
    defaultStatus?: QuestionFlowStatus
    /**
     * 单选选中后自动走下一题，默认开。
     * **它只走下一题，末题上不会替人按发送。**
     */
    autoAdvance?: boolean
    /** 自动前进前等多久（毫秒），默认 480。非有限值或负数不起计时器。 */
    autoAdvanceDelay?: number
    /** 允许跳过，默认开。关掉后跳过按钮收起，SKIP 事件也不再生效。 */
    allowSkip?: boolean
    /** 选项组内漫游走到尽头是否回绕，默认 true。 */
    loop?: boolean
    variant?: ControlVariant
    tone?: Tone
    size?: Size
    translations?: Partial<QuestionFlowTranslations>
    onIndexChange?: (details: QuestionFlowIndexChangeDetails) => void
    onAnswersChange?: (details: QuestionFlowAnswersChangeDetails) => void
    onNotesChange?: (details: QuestionFlowNotesChangeDetails) => void
    onSkip?: (details: QuestionFlowSkipDetails) => void
    onSubmit?: (details: QuestionFlowSubmitDetails) => void
  }
  context: {
    /** 当前题下标；读出来的原值可能越界，取用前一律夹到题数范围内。 */
    index: number
    answers: QuestionFlowAnswers
    notes: QuestionFlowNotes
    /** 当前题量出来的几何；量不到时为 null。不受控、不对外通知。 */
    viewport: QuestionFlowViewport | null
    /** 等着自动前进的那一题；没有待办时为 null。 */
    pendingAdvance: string | null
  }
  computed: Record<string, never>
  refs: QuestionFlowRefs
  state: QuestionFlowStatus
  event:
    | { type: 'OPTION.TOGGLE', questionId: string, value: string }
    | { type: 'NOTE.SET', questionId: string, value: string }
    | { type: 'GOTO', index: number }
    | { type: 'NEXT' }
    | { type: 'PREV' }
    | { type: 'SKIP' }
    | { type: 'SUBMIT' }
    /** 重量当前题的几何：尺寸观察器与使用者的 measure() 都发它。 */
    | { type: 'VIEWPORT.MEASURE' }
    /** 自动前进到点。只声明在答题态上，迟到的定时事件落地即静默丢弃。 */
    | { type: 'after.autoAdvance' }
    // 受控回写：宿主改 status 后由 watch 派发，无条件跳转、不再通知
    | { type: 'CONTROLLED.ANSWERING' }
    | { type: 'CONTROLLED.SUBMITTED' }
  tag: never
  guard: 'isStatusControlled' | 'canToggle' | 'canSkip' | 'isFirstQuestion' | 'isLastQuestion'
  action:
    | 'toggleOption'
    | 'setNote'
    | 'gotoIndex'
    | 'goNext'
    | 'goPrev'
    | 'disarmAdvance'
    | 'invokeSkip'
    | 'invokeSubmit'
    | 'advanceAfterSkip'
    | 'measureViewport'
    | 'syncStatus'
  effect: 'trackAutoAdvance' | 'trackViewportSize'
}

export interface QuestionFlowApi<T extends PropTypes = PropTypes> {
  status: QuestionFlowStatus
  /** 已经交卷了。 */
  submitted: boolean
  /** 夹到题数范围内的当前题下标。 */
  index: number
  /** 题数。 */
  count: number
  /** 当前题；一道题都没有时为 undefined。 */
  current: QuestionFlowQuestion | undefined
  isFirst: boolean
  isLast: boolean
  /** 当前题答得能往下走了吗：选了选项、写了自由文本，或这题本就可跳过。 */
  canAdvance: boolean
  allowSkip: boolean
  /** 给眼睛看的 N / M。它对读屏隐藏，进度由播报区念。 */
  counter: string
  /** 念给读屏的那一句：答题中念进度，交卷后念结果。 */
  announcement: string
  answers: QuestionFlowAnswers
  notes: QuestionFlowNotes
  answersOf: (questionId: string) => readonly string[]
  noteOf: (questionId: string) => string
  isOptionSelected: (questionId: string, value: string) => boolean
  isCurrent: (questionId: string) => boolean
  goTo: (index: number) => void
  next: () => void
  prev: () => void
  skip: () => void
  submit: () => void
  toggleOption: (questionId: string, value: string) => void
  setNote: (questionId: string, value: string) => void
  /** 重量一遍当前题的几何。换题与题目增删都会自动重量，容器尺寸变化由尺寸观察器接住。 */
  measure: () => void
  getRootProps: () => T['element']
  getViewportProps: () => T['element']
  getTrackProps: () => T['element']
  getQuestionProps: (props: QuestionFlowQuestionProps) => T['element']
  getPromptProps: (props: QuestionFlowQuestionProps) => T['element']
  getOptionGroupProps: (props: QuestionFlowQuestionProps) => T['element']
  getOptionProps: (props: QuestionFlowOptionProps) => T['button']
  getOptionIndicatorProps: (props: QuestionFlowOptionProps) => T['element']
  getOptionLabelProps: (props: QuestionFlowOptionProps) => T['element']
  getNoteProps: (props: QuestionFlowQuestionProps) => T['input']
  getFooterProps: () => T['element']
  getPrevTriggerProps: () => T['button']
  getCounterProps: () => T['element']
  getNextTriggerProps: () => T['button']
  getSkipTriggerProps: () => T['button']
  getSubmitTriggerProps: () => T['button']
  getResultProps: () => T['element']
  getLiveRegionProps: () => T['element']
}

export interface QuestionFlowTranslations {
  /** 题目区的可访问名；题干在场时由题干命名，这一句只在题干缺席时兜底。 */
  prompt: string
  /** 选项组的可访问名；同样只在题干缺席时兜底。 */
  options: string
  /** 自由文本那一格的可访问名。 */
  note: string
  /** 自由文本那一格的占位文字；不给就不产出 placeholder。 */
  notePlaceholder: string
  /** 上一题那颗按钮的可访问名。它通常只画一枚箭头，所以这一句**总会发出去**。 */
  prev: string
  /** 下一题那颗按钮的可访问名，同样总会发出去。 */
  next: string
  /** 跳过键的可访问名。**不给就不产出 aria-label**——它一般带可见文字，盖掉反而更糟。 */
  skip: string
  /** 不是末题时提交键的可访问名。**不给就不产出 aria-label**——同跳过键，它带可见文字。 */
  continue: string
  /** 末题时同一颗提交键的可访问名，同样不给就不产出。 */
  send: string
  /** 进度播报，形如 `Question 2 of 3`。 */
  progress: (current: number, total: number) => string
  /** 交卷后播报的那一句。 */
  submitted: string
}

/** 把下标夹进 [0, count)；题数为零时恒取 0。 */
export function clampQuestionIndex(index: number, count: number): number {
  if (count <= 0)
    return 0
  if (!Number.isFinite(index))
    return 0
  return Math.min(Math.max(Math.trunc(index), 0), count - 1)
}

/** 这一题答得能往下走了吗：选了选项、写了自由文本，或它本就可跳过。 */
export function canAdvanceQuestion(
  question: QuestionFlowQuestion | undefined,
  answers: QuestionFlowAnswers,
  notes: QuestionFlowNotes,
): boolean {
  if (!question)
    return true
  if (question.optional === true)
    return true
  if ((answers[question.id]?.length ?? 0) > 0)
    return true
  return (notes[question.id] ?? '').trim() !== ''
}
