/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 question flow 类型契约。

import type { ControlVariant, MachineSchema, PropTypes, Size, Tone } from '@xihan-ui/core'

/** 答题中 / 已提交。 */
export type QuestionFlowStatus = 'answering' | 'submitted'

/** 题型：single 是互斥单选，multiple 是可多选。 */
export type QuestionFlowType = 'single' | 'multiple'

/** 一个可选项。 */
export interface QuestionFlowOption {
  value: string
  /** 展示文本；默认回退为 value。 */
  label?: string
  disabled?: boolean
}

/** 一道题。 */
export interface QuestionFlowQuestion {
  id: string
  /** 题干。它同时是选项组的可访问名；未提供时回退为 translations 的兜底文案。 */
  prompt?: string
  /** single = 互斥单选（radiogroup），multiple = 多选（group + checkbox）。默认 single。 */
  type?: QuestionFlowType
  options: readonly QuestionFlowOption[]
  /** 允许不作答直接进入下一题。 */
  optional?: boolean
}

/** 每题一份答案集合，键是题 id。 */
export type QuestionFlowAnswers = Readonly<Record<string, readonly string[]>>

/** 每题一份自由文本，键是题 id。 */
export type QuestionFlowNotes = Readonly<Record<string, string>>

/** 当前题测得的几何（px），offset 是它在轨道中的起始位移。 */
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
  /** 提交时的答案快照。 */
  answers: QuestionFlowAnswers
  /** 提交时的自由文本快照。 */
  notes: QuestionFlowNotes
}

/** 部件声明所属的题目。connect 据此产出属性，不反查 DOM。 */
export interface QuestionFlowQuestionProps {
  id: string
}

/** 选项声明的身份：所属题目与值；禁用可由数据代为声明。 */
export interface QuestionFlowItemProps {
  questionId: string
  value: string
  /** 逐条覆盖禁用；未提供时从 questions 查询。 */
  disabled?: boolean
}

/**
 * 按压通道按它记住正被按住的那一个：三颗步进 / 动作钮各一个键，选项按 `item:${value}` 记
 * （只有当前题的选项可按，换题即松开，键里不必再带题目 id）。
 */
export type QuestionFlowPressedKey = 'prev' | 'next' | 'skip' | 'submit' | `item:${string}`

/** 适配器在挂载前填入的 DOM 取值器。 */
export interface QuestionFlowRefs {
  /** 题目轨道：测量当前题几何时的查询容器与参照系。 */
  getTrackEl: () => HTMLElement | null
}

export interface QuestionFlowSchema extends MachineSchema {
  props: {
    questions?: readonly QuestionFlowQuestion[]
    /** 当前题下标。提供即受控：内部不再自行修改，只发 onIndexChange。 */
    index?: number
    defaultIndex?: number
    /** 答案表。提供即受控。 */
    answers?: QuestionFlowAnswers
    defaultAnswers?: QuestionFlowAnswers
    /** 自由文本表。提供即受控。 */
    notes?: QuestionFlowNotes
    defaultNotes?: QuestionFlowNotes
    /** 答题状态。提供即受控。 */
    status?: QuestionFlowStatus
    defaultStatus?: QuestionFlowStatus
    /**
     * 单选选中后自动进入下一题，默认开启。
     * 它只进入下一题，末题上不会替用户提交。
     */
    autoAdvance?: boolean
    /** 自动前进前等待的时长（毫秒），默认 480。非有限值或负数不启动计时器。 */
    autoAdvanceDelay?: number
    /** 允许跳过，默认开启。关闭后跳过按钮收起，SKIP 事件也不再生效。 */
    allowSkip?: boolean
    /** 选项组内漫游到达末尾是否回绕，默认 true。 */
    loop?: boolean
    /** 形态：outline 描边、subtle 底色分区、ghost 无壳内联。默认 outline。 */
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
    /** 当前题下标；读出的原值可能越界，使用前一律夹到题数范围内。 */
    index: number
    answers: QuestionFlowAnswers
    notes: QuestionFlowNotes
    /** 当前题测得的几何；无法测量时为 null。不受控、不对外通知。 */
    viewport: QuestionFlowViewport | null
    /** 等待自动前进的题目；没有待办时为 null。 */
    pendingAdvance: string | null
    /**
     * 按压通道：Space / Enter 或触屏按住的那一个部件，对应部件投影 data-pressed。
     * 抬起、失焦、指针取消，或按住途中换题 / 交卷 / 题目改写 / 跳过钮收起时清空。
     */
    pressed: QuestionFlowPressedKey | null
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
    /** 重新测量当前题的几何：尺寸观察器与使用者的 measure() 都发出它。 */
    | { type: 'VIEWPORT.MEASURE' }
    /** 自动前进到期。只声明在答题态上，迟到的定时事件落地即静默丢弃。 */
    | { type: 'after.autoAdvance' }
    // 受控回写：宿主改 status 后由 watch 派发，无条件跳转、不再通知
    | { type: 'CONTROLLED.ANSWERING' }
    | { type: 'CONTROLLED.SUBMITTED' }
    /**
     * 按压通道（shared/press）：某个部件被 Space / Enter 或触屏按住；只在答题态接。
     * disabled 是该部件自身的禁用事实（边界题的翻页钮、答不完整时的提交钮、禁用选项），由 connect 判定后随事件带入。
     */
    | { type: 'PRESS.START', key: QuestionFlowPressedKey, disabled?: boolean }
    /** 按住的部件抬起、失焦或指针取消；只松开 key 对应的那一个。 */
    | { type: 'PRESS.END', key: QuestionFlowPressedKey }
  tag: never
  guard: 'isStatusControlled' | 'canToggle' | 'canSkip' | 'isFirstQuestion' | 'isLastQuestion' | 'canPress'
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
    | 'startPress'
    | 'endPress'
    | 'releasePress'
    | 'releaseSkipWhenHidden'
  effect: 'trackAutoAdvance' | 'trackViewportSize'
}

export interface QuestionFlowApi<T extends PropTypes = PropTypes> {
  status: QuestionFlowStatus
  /** 已提交。 */
  submitted: boolean
  /** 夹到题数范围内的当前题下标。 */
  index: number
  /** 题数。 */
  count: number
  /** 当前题；没有题目时为 undefined。 */
  current: QuestionFlowQuestion | undefined
  isFirst: boolean
  isLast: boolean
  /** 当前题是否可以进入下一题：已选选项、已填自由文本，或该题本身可跳过。 */
  canAdvance: boolean
  allowSkip: boolean
  /** 视觉上的 N / M。它对读屏隐藏，进度由播报区朗读。 */
  counter: string
  /** 读屏朗读的语句：答题中朗读进度，提交后朗读结果。 */
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
  /** 重新测量当前题的几何。换题与题目增删都会自动重新测量，容器尺寸变化由尺寸观察器接管。 */
  measure: () => void
  getRootProps: () => T['element']
  getViewportProps: () => T['element']
  getTrackProps: () => T['element']
  getQuestionProps: (props: QuestionFlowQuestionProps) => T['element']
  getPromptProps: (props: QuestionFlowQuestionProps) => T['element']
  getGroupProps: (props: QuestionFlowQuestionProps) => T['element']
  getItemProps: (props: QuestionFlowItemProps) => T['button']
  getItemIndicatorProps: (props: QuestionFlowItemProps) => T['element']
  getItemTextProps: (props: QuestionFlowItemProps) => T['element']
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
  /** 题目区的可访问名；题干存在时由题干命名，该文案只在题干缺席时兜底。 */
  prompt: string
  /** 选项组的可访问名；同样只在题干缺席时兜底。 */
  options: string
  /** 自由文本字段的可访问名。 */
  note: string
  /** 自由文本字段的占位文字；未提供时不产出 placeholder。 */
  notePlaceholder: string
  /** 上一题按钮的可访问名。它通常只绘制一个箭头，因此该文案总会发出。 */
  prev: string
  /** 下一题按钮的可访问名，同样总会发出。 */
  next: string
  /** 跳过键的可访问名。未提供时不产出 aria-label：它一般带可见文字，覆盖反而更差。 */
  skip: string
  /** 不是末题时提交键的可访问名。未提供时不产出 aria-label：同跳过键，它带可见文字。 */
  continue: string
  /** 末题时同一个提交键的可访问名，同样未提供时不产出。 */
  send: string
  /** 进度播报，形如 `Question 2 of 3`。 */
  progress: (current: number, total: number) => string
  /** 提交后播报的语句。 */
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

/** 该题是否可以进入下一题：已选选项、已填自由文本，或它本身可跳过。 */
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
