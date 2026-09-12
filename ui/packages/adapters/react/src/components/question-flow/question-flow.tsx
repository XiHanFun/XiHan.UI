import type { ControlVariant, Size, Tone } from '@xihan-ui/core'
import type {
  QuestionFlowAnswers,
  QuestionFlowApi,
  QuestionFlowNotes,
  QuestionFlowQuestion,
  QuestionFlowSchema,
  QuestionFlowStatus,
  QuestionFlowTranslations,
} from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { renderSlot } from '../../runtime/slot-content'
import { QuestionFlowProvider, useQuestionFlowContext } from './context'
import { useQuestionFlow } from './use-question-flow'

type Props = QuestionFlowSchema['props']

/** 函数式 children 的载荷：进度、当前题，以及各条动作入口。 */
export type QuestionFlowRootSlotProps = Pick<
  QuestionFlowApi,
  'status' | 'submitted' | 'index' | 'count' | 'current' | 'isFirst' | 'isLast' | 'canAdvance'
  | 'allowSkip' | 'counter' | 'announcement' | 'answers' | 'notes'
  | 'goTo' | 'next' | 'prev' | 'skip' | 'submit' | 'toggleOption' | 'setNote'
>

/** 逐项 children 的载荷。 */
export interface QuestionFlowOptionSlotProps {
  questionId: string
  value: string
  selected: boolean
}

/** 根上自有的那些取值；onSubmit 与原生的同名事件含义不同，由这里接管。 */
type RootElementProps = Omit<ComponentPropsWithRef<'div'>, 'children' | 'onSubmit'>

export interface XhQuestionFlowRootProps extends RootElementProps {
  questions?: readonly QuestionFlowQuestion[]
  index?: number
  defaultIndex?: number
  answers?: QuestionFlowAnswers
  defaultAnswers?: QuestionFlowAnswers
  notes?: QuestionFlowNotes
  defaultNotes?: QuestionFlowNotes
  status?: QuestionFlowStatus
  defaultStatus?: QuestionFlowStatus
  /** 单选选中后自动走下一题。 */
  autoAdvance?: boolean
  /** 自动走下一题前等多久。 */
  autoAdvanceDelay?: number
  /** 允许跳过当前题，默认允许；关掉即整颗跳过钮收起。 */
  allowSkip?: boolean
  /** 选项组里方向键走到首尾是否回绕，默认 true。 */
  loop?: boolean
  variant?: ControlVariant
  tone?: Tone
  size?: Size
  translations?: Partial<QuestionFlowTranslations>
  onIndexChange?: Props['onIndexChange']
  onAnswersChange?: Props['onAnswersChange']
  onNotesChange?: Props['onNotesChange']
  onSkip?: Props['onSkip']
  onSubmit?: Props['onSubmit']
  children?: SlotChildren<QuestionFlowRootSlotProps>
}

export function XhQuestionFlowRoot({
  questions,
  index,
  defaultIndex,
  answers,
  defaultAnswers,
  notes,
  defaultNotes,
  status,
  defaultStatus,
  autoAdvance,
  autoAdvanceDelay,
  allowSkip,
  loop,
  variant,
  tone,
  size,
  translations,
  onIndexChange,
  onAnswersChange,
  onNotesChange,
  onSkip,
  onSubmit,
  children,
  ...rest
}: XhQuestionFlowRootProps): ReactNode {
  const ctx = useQuestionFlow(withXhConfig('question-flow', {
    questions,
    index,
    defaultIndex,
    answers,
    defaultAnswers,
    notes,
    defaultNotes,
    status,
    defaultStatus,
    autoAdvance,
    autoAdvanceDelay,
    allowSkip,
    loop,
    variant,
    tone,
    size,
    translations,
    onIndexChange,
    onAnswersChange,
    onNotesChange,
    onSkip,
    onSubmit,
  }) as Props)
  const { api } = ctx
  return (
    <QuestionFlowProvider value={ctx}>
      <div {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
        {renderSlot(children, {
          status: api.status,
          submitted: api.submitted,
          index: api.index,
          count: api.count,
          current: api.current,
          isFirst: api.isFirst,
          isLast: api.isLast,
          canAdvance: api.canAdvance,
          allowSkip: api.allowSkip,
          counter: api.counter,
          announcement: api.announcement,
          answers: api.answers,
          notes: api.notes,
          goTo: api.goTo,
          next: api.next,
          prev: api.prev,
          skip: api.skip,
          submit: api.submit,
          toggleOption: api.toggleOption,
          setNote: api.setNote,
        })}
      </div>
    </QuestionFlowProvider>
  )
}

XhQuestionFlowRoot.xhEvents = ['index-change', 'answers-change', 'notes-change', 'skip', 'submit'] as const

export interface XhQuestionFlowViewportProps extends ComponentPropsWithRef<'div'> {}
/** 定高并裁切的那一格；高度由机器量好写进内联样式的私有槽。 */
export function XhQuestionFlowViewport({ children, ...rest }: XhQuestionFlowViewportProps): ReactNode {
  const ctx = useQuestionFlowContext()
  return (
    <div {...mergeReactProps(ctx.api.getViewportProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhQuestionFlowTrackProps extends ComponentPropsWithRef<'div'> {}
/** 纵向排布全部题目的轨道，同时是量测的参照系。 */
export function XhQuestionFlowTrack({ children, ...rest }: XhQuestionFlowTrackProps): ReactNode {
  const ctx = useQuestionFlowContext()
  return (
    <div
      {...mergeReactProps(
        ctx.api.getTrackProps() as Record<string, unknown>,
        rest as Record<string, unknown>,
        { ref: (el: HTMLDivElement | null) => { ctx.trackRef.current = el } },
      )}
    >
      {children}
    </div>
  )
}

export interface XhQuestionFlowQuestionProps extends ComponentPropsWithRef<'div'> {
  questionId: string
}
export function XhQuestionFlowQuestion({ questionId, children, ...rest }: XhQuestionFlowQuestionProps): ReactNode {
  const ctx = useQuestionFlowContext()
  return (
    <div
      {...mergeReactProps(
        ctx.api.getQuestionProps({ id: questionId }) as Record<string, unknown>,
        rest as Record<string, unknown>,
      )}
    >
      {children}
    </div>
  )
}

export interface XhQuestionFlowPromptProps extends ComponentPropsWithRef<'p'> {
  questionId: string
}
export function XhQuestionFlowPrompt({ questionId, children, ...rest }: XhQuestionFlowPromptProps): ReactNode {
  const ctx = useQuestionFlowContext()
  return (
    <p
      {...mergeReactProps(
        ctx.api.getPromptProps({ id: questionId }) as Record<string, unknown>,
        rest as Record<string, unknown>,
      )}
    >
      {children}
    </p>
  )
}

export interface XhQuestionFlowGroupProps extends ComponentPropsWithRef<'div'> {
  questionId: string
}
export function XhQuestionFlowGroup({ questionId, children, ...rest }: XhQuestionFlowGroupProps): ReactNode {
  const ctx = useQuestionFlowContext()
  return (
    <div
      {...mergeReactProps(
        ctx.api.getGroupProps({ id: questionId }) as Record<string, unknown>,
        rest as Record<string, unknown>,
      )}
    >
      {children}
    </div>
  )
}

export interface XhQuestionFlowItemProps extends Omit<ComponentPropsWithRef<'button'>, 'children'> {
  questionId: string
  optionValue: string
  /** 缺省交给 connect 回 questions 里查，写死 false 会盖掉数据里的禁用。 */
  optionDisabled?: boolean
  children?: SlotChildren<QuestionFlowOptionSlotProps>
}
/** 用原生 button，指针激活由平台负责。 */
export function XhQuestionFlowItem({
  questionId,
  optionValue,
  optionDisabled,
  children,
  ...rest
}: XhQuestionFlowItemProps): ReactNode {
  const ctx = useQuestionFlowContext()
  const attrs = ctx.api.getItemProps({
    questionId,
    value: optionValue,
    disabled: optionDisabled,
  }) as Record<string, unknown>
  return (
    <button {...mergeReactProps(attrs, rest as Record<string, unknown>)}>
      {renderSlot(children, {
        questionId,
        value: optionValue,
        selected: ctx.api.isOptionSelected(questionId, optionValue),
      })}
    </button>
  )
}

export interface XhQuestionFlowItemIndicatorProps extends ComponentPropsWithRef<'span'> {
  questionId: string
  optionValue: string
}
export function XhQuestionFlowItemIndicator({
  questionId,
  optionValue,
  children,
  ...rest
}: XhQuestionFlowItemIndicatorProps): ReactNode {
  const ctx = useQuestionFlowContext()
  const attrs = ctx.api.getItemIndicatorProps({ questionId, value: optionValue }) as Record<string, unknown>
  return <span {...mergeReactProps(attrs, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhQuestionFlowItemTextProps extends ComponentPropsWithRef<'span'> {
  questionId: string
  optionValue: string
}
/** 排在选项之内，文本自然构成它的可及名。 */
export function XhQuestionFlowItemText({
  questionId,
  optionValue,
  children,
  ...rest
}: XhQuestionFlowItemTextProps): ReactNode {
  const ctx = useQuestionFlowContext()
  const attrs = ctx.api.getItemTextProps({ questionId, value: optionValue }) as Record<string, unknown>
  return <span {...mergeReactProps(attrs, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhQuestionFlowNoteProps extends Omit<ComponentPropsWithRef<'input'>, 'children' | 'value' | 'defaultValue' | 'type'> {
  questionId: string
}
/** 自闭合的输入格，内容由 value 给，不收 children。 */
export function XhQuestionFlowNote({ questionId, ...rest }: XhQuestionFlowNoteProps): ReactNode {
  const ctx = useQuestionFlowContext()
  return (
    <input
      {...mergeReactProps(
        ctx.api.getNoteProps({ id: questionId }) as Record<string, unknown>,
        rest as Record<string, unknown>,
      )}
    />
  )
}

export interface XhQuestionFlowFooterProps extends ComponentPropsWithRef<'div'> {}
export function XhQuestionFlowFooter({ children, ...rest }: XhQuestionFlowFooterProps): ReactNode {
  const ctx = useQuestionFlowContext()
  return (
    <div {...mergeReactProps(ctx.api.getFooterProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhQuestionFlowPrevTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhQuestionFlowPrevTrigger({ children, ...rest }: XhQuestionFlowPrevTriggerProps): ReactNode {
  const ctx = useQuestionFlowContext()
  return (
    <button {...mergeReactProps(ctx.api.getPrevTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </button>
  )
}

export interface XhQuestionFlowCounterProps extends ComponentPropsWithRef<'span'> {}
/** 不给内容时显示 N / M；这一格对读屏隐藏，进度由播报区念。 */
export function XhQuestionFlowCounter({ children, ...rest }: XhQuestionFlowCounterProps): ReactNode {
  const ctx = useQuestionFlowContext()
  return (
    <span {...mergeReactProps(ctx.api.getCounterProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children ?? ctx.api.counter}
    </span>
  )
}

export interface XhQuestionFlowNextTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhQuestionFlowNextTrigger({ children, ...rest }: XhQuestionFlowNextTriggerProps): ReactNode {
  const ctx = useQuestionFlowContext()
  return (
    <button {...mergeReactProps(ctx.api.getNextTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </button>
  )
}

export interface XhQuestionFlowSkipTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhQuestionFlowSkipTrigger({ children, ...rest }: XhQuestionFlowSkipTriggerProps): ReactNode {
  const ctx = useQuestionFlowContext()
  return (
    <button {...mergeReactProps(ctx.api.getSkipTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </button>
  )
}

export interface XhQuestionFlowSubmitTriggerProps extends ComponentPropsWithRef<'button'> {}
/** 一颗按钮两个身份：不是末题时继续，末题时发送，原位换 data-mode 与可访问名。 */
export function XhQuestionFlowSubmitTrigger({ children, ...rest }: XhQuestionFlowSubmitTriggerProps): ReactNode {
  const ctx = useQuestionFlowContext()
  return (
    <button {...mergeReactProps(ctx.api.getSubmitTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </button>
  )
}

export interface XhQuestionFlowResultProps extends ComponentPropsWithRef<'div'> {}
/** 交卷之后才露出；文字由播报区念，这一格对读屏隐藏。 */
export function XhQuestionFlowResult({ children, ...rest }: XhQuestionFlowResultProps): ReactNode {
  const ctx = useQuestionFlowContext()
  return (
    <div {...mergeReactProps(ctx.api.getResultProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhQuestionFlowLiveRegionProps extends ComponentPropsWithRef<'div'> {}
/** 不给内容时念进度，交卷后念结果。 */
export function XhQuestionFlowLiveRegion({ children, ...rest }: XhQuestionFlowLiveRegionProps): ReactNode {
  const ctx = useQuestionFlowContext()
  return (
    <div {...mergeReactProps(ctx.api.getLiveRegionProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children ?? ctx.api.announcement}
    </div>
  )
}
