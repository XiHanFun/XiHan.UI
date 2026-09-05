import type {
  QuestionFlowAnswers,
  QuestionFlowNotes,
  QuestionFlowQuestion,
  QuestionFlowSchema,
  QuestionFlowViewport,
} from './question-flow.types'
import { queryItems, setTimeoutEffect, setup } from '@xihan-ui/core'
import { toggleItemValue } from '../checkbox-group'
import { questionFlowQuestionQuery } from './question-flow.anatomy'
import { clampQuestionIndex } from './question-flow.types'

const { createMachine } = setup<QuestionFlowSchema>()

/** 单选选中后等多久自动走下一题。 */
const AUTO_ADVANCE_DELAY = 480

function questionsOf(questions: readonly QuestionFlowQuestion[] | undefined): readonly QuestionFlowQuestion[] {
  return questions ?? []
}

/**
 * questions 的指纹：题的身份、题型与选项决定轨道上排几块、每块多高，一变就得重量。
 * 取串而不是数组本身，作者每帧新建一个同内容的数组不该白惊动一次量测。
 * 层级间的分隔取制表符、换行与竖线，题干与选项文本里不会同时出现它们。
 */
function questionsKeyOf(questions: readonly QuestionFlowQuestion[] | undefined): string {
  return questionsOf(questions)
    .map(q => `${q.id}\t${q.type ?? ''}\t${q.prompt ?? ''}\t${q.options.map(o => o.value).join('|')}`)
    .join('\n')
}

/** 两份答案表是否一样。不给的话受控父组件写回一份等价对象就会多派一次回调。 */
function sameAnswers(a: QuestionFlowAnswers, b: QuestionFlowAnswers | undefined): boolean {
  if (b === undefined)
    return false
  const keys = Object.keys(a)
  if (keys.length !== Object.keys(b).length)
    return false
  return keys.every((key) => {
    const left = a[key]!
    const right = b[key]
    return Array.isArray(right) && left.length === right.length && left.every((v, i) => v === right[i])
  })
}

/** 两份自由文本表是否一样。 */
function sameNotes(a: QuestionFlowNotes, b: QuestionFlowNotes | undefined): boolean {
  if (b === undefined)
    return false
  const keys = Object.keys(a)
  return keys.length === Object.keys(b).length && keys.every(key => a[key] === b[key])
}

/** 两次量测是否一样。不给的话每次量测都是新对象，版本号会一直空转自增。 */
function sameViewport(a: QuestionFlowViewport | null, b: QuestionFlowViewport | null | undefined): boolean {
  if (a == null || b == null)
    return a === b
  return a.blockSize === b.blockSize && a.offset === b.offset
}

/** 复制一份答案表，去掉与调用方共享的引用。 */
function cloneAnswers(source: QuestionFlowAnswers | undefined): QuestionFlowAnswers {
  const out: Record<string, readonly string[]> = {}
  for (const [key, list] of Object.entries(source ?? {})) out[key] = [...list]
  return out
}

function cloneNotes(source: QuestionFlowNotes | undefined): QuestionFlowNotes {
  return { ...source }
}

/**
 * 状态只有答题中与已提交两个。当前题下标、答案、自由文本住在 context 的 cell 里，
 * 受控与非受控在 cell 收口；只有 status 是状态，所以只有它需要影子事件回写。
 *
 * 自动前进的计时器挂在 answering 上，重入即拆掉重挂：选中一项就重入一次，从整段延时重新计；
 * 手动翻页、跳过、提交都先把待办清掉再重入，计时器于是拆掉后不再挂起来。
 * 量测走根级效应，不随状态重入拆装。
 */
export const questionFlowMachine = createMachine({
  name: 'question-flow',
  context: ({ prop, cell }) => ({
    index: cell<number>(() => ({
      value: prop('index'),
      defaultValue: prop('defaultIndex') ?? 0,
      onChange: index => prop('onIndexChange')?.({ index }),
    })),
    answers: cell<QuestionFlowAnswers>(() => ({
      value: prop('answers'),
      defaultValue: cloneAnswers(prop('defaultAnswers')),
      isEqual: sameAnswers,
      onChange: answers => prop('onAnswersChange')?.({ answers }),
    })),
    notes: cell<QuestionFlowNotes>(() => ({
      value: prop('notes'),
      defaultValue: cloneNotes(prop('defaultNotes')),
      isEqual: sameNotes,
      onChange: notes => prop('onNotesChange')?.({ notes }),
    })),
    // 量测结果不受控、不对外通知
    viewport: cell<QuestionFlowViewport | null>(() => ({ defaultValue: null, isEqual: sameViewport })),
    pendingAdvance: cell<string | null>(() => ({ defaultValue: null })),
  }),
  refs: () => ({
    getTrackEl: () => null,
  }),
  initialState: ({ prop }) => prop('status') ?? prop('defaultStatus') ?? 'answering',
  // 挂载即量一次当前题
  entry: ['measureViewport'],
  effects: ['trackViewportSize'],
  watch: ({ track, prop, context, action }) => {
    track([() => prop('status')], () => action(['syncStatus']))
    // 换题就把轨道挪过去、把视口高度换成新那一题的
    track([context.dep('index')], () => action(['measureViewport']))
    // 题目增删改写同样要重量：轨道里排的块变了，容器尺寸却可能一动不动
    track([() => questionsKeyOf(prop('questions'))], () => action(['measureViewport']))
  },
  on: {
    'VIEWPORT.MEASURE': { actions: ['measureViewport'] },
    // 受控回写，只跳转不通知
    'CONTROLLED.ANSWERING': { target: 'answering' },
    'CONTROLLED.SUBMITTED': { target: 'submitted' },
  },
  states: {
    answering: {
      effects: ['trackAutoAdvance'],
      on: {
        // 重入即重挂计时器：连着改主意时，每一次都从整段延时重新计
        'OPTION.TOGGLE': [{ guard: 'canToggle', target: 'answering', reenter: true, actions: ['toggleOption'] }],
        'NOTE.SET': { actions: ['setNote'] },
        'GOTO': { target: 'answering', reenter: true, actions: ['disarmAdvance', 'gotoIndex'] },
        // 末题上没有下一题：只把待办清掉，不动状态
        'NEXT': [
          { guard: 'isLastQuestion', actions: ['disarmAdvance'] },
          { target: 'answering', reenter: true, actions: ['disarmAdvance', 'goNext'] },
        ],
        'PREV': [
          { guard: 'isFirstQuestion', actions: ['disarmAdvance'] },
          { target: 'answering', reenter: true, actions: ['disarmAdvance', 'goPrev'] },
        ],
        'SKIP': [{ guard: 'canSkip', actions: ['invokeSkip', 'advanceAfterSkip'] }],
        'SUBMIT': [
          { guard: 'isStatusControlled', actions: ['disarmAdvance', 'invokeSubmit'] },
          { target: 'submitted', actions: ['disarmAdvance', 'invokeSubmit'] },
        ],
        // 自动前进只走下一题：末题上停住，不替人按发送
        'after.autoAdvance': [
          { guard: 'isLastQuestion', actions: ['disarmAdvance'] },
          { target: 'answering', reenter: true, actions: ['disarmAdvance', 'goNext'] },
        ],
      },
    },
    submitted: {},
  },
  implementations: {
    guards: {
      isStatusControlled: ({ prop }) => prop('status') !== undefined,
      canSkip: ({ prop }) => prop('allowSkip') !== false,
      isFirstQuestion: ({ prop, context }) =>
        clampQuestionIndex(context.get('index'), questionsOf(prop('questions')).length) <= 0,
      isLastQuestion: ({ prop, context }) => {
        const count = questionsOf(prop('questions')).length
        return clampQuestionIndex(context.get('index'), count) >= count - 1
      },
      // 选项禁用由 connect 挡在指针与按键那一侧，这里只挡"这一题不在场"
      canToggle: ({ prop, event }) => {
        const e = event.current()
        return e.type === 'OPTION.TOGGLE' && questionsOf(prop('questions')).some(q => q.id === e.questionId)
      },
    },
    actions: {
      toggleOption: ({ prop, context, event }) => {
        const e = event.current()
        if (e.type !== 'OPTION.TOGGLE')
          return
        const question = questionsOf(prop('questions')).find(q => q.id === e.questionId)
        if (!question)
          return
        const single = (question.type ?? 'single') === 'single'
        const picked = context.get('answers')[e.questionId] ?? []
        // 单选点已选中的那一项不取消：原生单选钮就是这样，取消会让"选了什么"变成三态
        const next = single ? [e.value] : toggleItemValue(picked, e.value)
        context.set('answers', { ...context.get('answers'), [e.questionId]: next })
        // 只有单选落定才排自动前进；多选要等人点继续
        const armed = single && prop('autoAdvance') !== false
        context.set('pendingAdvance', armed ? e.questionId : null)
      },
      setNote: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'NOTE.SET')
          context.set('notes', { ...context.get('notes'), [e.questionId]: e.value })
      },
      gotoIndex: ({ prop, context, event }) => {
        const e = event.current()
        if (e.type === 'GOTO')
          context.set('index', clampQuestionIndex(e.index, questionsOf(prop('questions')).length))
      },
      goNext: ({ prop, context }) => {
        const count = questionsOf(prop('questions')).length
        context.set('index', clampQuestionIndex(clampQuestionIndex(context.get('index'), count) + 1, count))
      },
      goPrev: ({ prop, context }) => {
        const count = questionsOf(prop('questions')).length
        context.set('index', clampQuestionIndex(clampQuestionIndex(context.get('index'), count) - 1, count))
      },
      disarmAdvance: ({ context }) => context.set('pendingAdvance', null),
      invokeSkip: ({ prop, context }) => {
        const list = questionsOf(prop('questions'))
        const index = clampQuestionIndex(context.get('index'), list.length)
        const question = list[index]
        prop('onSkip')?.({ index, questionId: question?.id ?? '' })
      },
      // 跳过之后走的是继续那条路：不是末题就翻一题，末题就交卷，两条路各自的受控收口照旧
      advanceAfterSkip: ({ prop, context, send }) => {
        const count = questionsOf(prop('questions')).length
        const last = clampQuestionIndex(context.get('index'), count) >= count - 1
        send(last ? { type: 'SUBMIT' } : { type: 'NEXT' })
      },
      invokeSubmit: ({ prop, context }) => {
        prop('onSubmit')?.({
          answers: cloneAnswers(context.get('answers')),
          notes: cloneNotes(context.get('notes')),
        })
      },
      /**
       * 量当前题。必须量两遍：同步那遍照顾"题目早就在 DOM 里"的常规情形，
       * 推迟那遍照顾首帧（挂载当刻轨道还没进 DOM，WC 侧的身份标记更要等首次 wire 才写上）。
       * cell 带 isEqual，量到同一结果不会多推更新。
       */
      measureViewport: ({ refs, prop, context, flush }) => {
        const run = (): void => {
          const track = refs.get('getTrackEl')()
          if (!track) {
            context.set('viewport', null)
            return
          }
          const items = queryItems(track, questionFlowQuestionQuery)
          const el = items[clampQuestionIndex(context.get('index'), questionsOf(prop('questions')).length)]
          if (!el) {
            context.set('viewport', null)
            return
          }
          // 位移按两只盒子的差算：轨道整体被推上去时两者一起动，量出来的仍是题在轨道里的原位
          const trackRect = track.getBoundingClientRect()
          const rect = el.getBoundingClientRect()
          context.set('viewport', { blockSize: rect.height, offset: rect.top - trackRect.top })
        }
        run()
        flush(run)
      },
      // 只在受控（status 有值）时回写
      syncStatus: ({ prop, send }) => {
        const status = prop('status')
        if (status === undefined)
          return
        send(status === 'submitted' ? { type: 'CONTROLLED.SUBMITTED' } : { type: 'CONTROLLED.ANSWERING' })
      },
    },
    effects: {
      /** 没有待办就一个计时器都不起；延时非有限或为负同样不起，停在原题。 */
      trackAutoAdvance: ({ prop, context, send }) => {
        if (context.get('pendingAdvance') == null)
          return undefined
        const delay = prop('autoAdvanceDelay') ?? AUTO_ADVANCE_DELAY
        if (!Number.isFinite(delay) || delay < 0)
          return undefined
        return setTimeoutEffect(() => send({ type: 'after.autoAdvance' }), delay)
      },
      /** 轨道尺寸一变（容器变窄把题干折了行、字体加载完）就重量当前题。 */
      trackViewportSize: ({ refs, scope, send, flush }) => {
        let disposed = false
        let stop: (() => void) | undefined

        // 推迟一拍再挂，等轨道就位
        flush(() => {
          if (disposed)
            return
          const track = refs.get('getTrackEl')()
          if (!track)
            return
          // 无布局环境没有 ResizeObserver：不再跟随尺寸变化，换题与显式 measure() 仍会重量
          const win = scope.getWin()
          const observer = typeof win.ResizeObserver === 'function'
            ? new win.ResizeObserver(() => send({ type: 'VIEWPORT.MEASURE' }))
            : null
          observer?.observe(track)
          stop = () => observer?.disconnect()
        })

        return () => {
          disposed = true
          stop?.()
        }
      },
    },
  },
})
