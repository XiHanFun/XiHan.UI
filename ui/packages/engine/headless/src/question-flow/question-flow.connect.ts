import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type {
  QuestionFlowApi,
  QuestionFlowOptionProps,
  QuestionFlowQuestion,
  QuestionFlowSchema,
} from './question-flow.types'
import { focusItem, isItemDisabled, ITEM_VALUE_ATTR, itemValue, navigateItems, navIntentFromKey, queryItems } from '@xihan-ui/behavior'
import { dataAttr, isComposingEvent } from '@xihan-ui/kernel'
import { questionFlowAnatomy, questionFlowOptionQuery } from './question-flow.anatomy'
import { canAdvanceQuestion, clampQuestionIndex } from './question-flow.types'

const parts = questionFlowAnatomy.build()

// 选项集合只在事件处理器里查活 DOM，顺序即文档序
const OPTION_QUERY = questionFlowOptionQuery

export function connectQuestionFlow<T extends PropTypes>(
  service: Service<QuestionFlowSchema>,
  normalize: NormalizeProps<T>,
): QuestionFlowApi<T> {
  const { state, prop, send, context, scope } = service

  const status = state.get()
  const submitted = status === 'submitted'
  const questions = prop('questions') ?? []
  const count = questions.length
  const index = clampQuestionIndex(context.get('index'), count)
  const current = questions[index]
  const answers = context.get('answers')
  const notes = context.get('notes')
  const viewport = context.get('viewport')
  const translations = prop('translations')
  const allowSkip = prop('allowSkip') !== false
  const loop = prop('loop') ?? true
  const isFirst = index <= 0
  const isLast = index >= count - 1
  const canAdvance = !submitted && canAdvanceQuestion(current, answers, notes)

  const promptId = (id: string): string => scope.partId(questionFlowAnatomy.name, `prompt:${encodeURIComponent(id)}`)

  const questionOf = (id: string): QuestionFlowQuestion | undefined => questions.find(q => q.id === id)
  const typeOf = (id: string): 'single' | 'multiple' => questionOf(id)?.type ?? 'single'
  const answersOf = (id: string): readonly string[] => answers[id] ?? []
  const noteOf = (id: string): string => notes[id] ?? ''
  const isCurrent = (id: string): boolean => current?.id === id
  const isOptionSelected = (questionId: string, value: string): boolean => answersOf(questionId).includes(value)

  const optionDisabled = (item: QuestionFlowOptionProps): boolean => {
    if (submitted)
      return true
    const declared = item.disabled ?? questionOf(item.questionId)?.options.find(o => o.value === item.value)?.disabled
    return declared === true
  }

  /**
   * 漫游焦点的锚点：这一题里选中的头一项，一个都没选时首个未禁用项认领。
   * 只读 questions 与 answers，不查 DOM——connect 在渲染期求值，此刻 DOM 尚不存在。
   */
  const anchorOf = (questionId: string): string | undefined => {
    const options = questionOf(questionId)?.options ?? []
    const picked = options.find(o => isOptionSelected(questionId, o.value) && o.disabled !== true)
    return (picked ?? options.find(o => o.disabled !== true))?.value
  }

  /** 能往下走时按继续/发送两条路分派；走不动就什么都不做。 */
  const advance = (): void => {
    if (!canAdvance)
      return
    send(isLast ? { type: 'SUBMIT' } : { type: 'NEXT' })
  }

  const counter = `${count === 0 ? 0 : index + 1} / ${count}`
  const announcement = submitted
    ? (translations?.submitted ?? 'Answers sent')
    : (translations?.progress?.(index + 1, count) ?? `Question ${index + 1} of ${count}`)

  return {
    status,
    submitted,
    index,
    count,
    current,
    isFirst,
    isLast,
    canAdvance,
    allowSkip,
    counter,
    announcement,
    answers,
    notes,
    answersOf,
    noteOf,
    isOptionSelected,
    isCurrent,
    goTo: next => send({ type: 'GOTO', index: next }),
    next: () => send({ type: 'NEXT' }),
    prev: () => send({ type: 'PREV' }),
    skip: () => send({ type: 'SKIP' }),
    submit: () => send({ type: 'SUBMIT' }),
    toggleOption: (questionId, value) => send({ type: 'OPTION.TOGGLE', questionId, value }),
    setNote: (questionId, value) => send({ type: 'NOTE.SET', questionId, value }),
    measure: () => send({ type: 'VIEWPORT.MEASURE' }),

    // 不给 tabindex：内部按钮与选项都可聚焦，键盘收口在选项组上
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-state': status,
      'data-variant': prop('variant'),
      'data-tone': prop('tone'),
      'data-size': prop('size'),
    }),

    // 定高并裁切；高度由机器量好，铺成内联样式里的一个私有槽，皮肤照着摆
    getViewportProps: () => normalize.element({
      ...parts.viewport.attrs,
      style: viewport ? { '--xh-_question-flow-viewport-h': `${viewport.blockSize}px` } : undefined,
    }),

    // 纵向排布全部题目的轨道，靠位移把当前题推进视口
    getTrackProps: () => normalize.element({
      ...parts.track.attrs,
      style: viewport ? { '--xh-_question-flow-track-y': `${-viewport.offset}px` } : undefined,
    }),

    // 非当前题对读屏与 Tab 序都不可达：aria-hidden 与 inert 一起发，里面的可聚焦物另发 tabindex=-1
    getQuestionProps: (item) => {
      const active = isCurrent(item.id)
      const prompt = questionOf(item.id)?.prompt
      return normalize.element({
        'role': 'group',
        ...parts.question.attrs,
        'aria-labelledby': prompt ? promptId(item.id) : undefined,
        'aria-label': prompt ? undefined : (translations?.prompt ?? 'Question'),
        'aria-hidden': active ? undefined : true,
        'inert': active ? undefined : true,
        'data-current': dataAttr(active),
      })
    },

    // 题干：既念给读屏，也当选项组的可访问名
    getPromptProps: item => normalize.element({
      ...parts.prompt.attrs,
      id: promptId(item.id),
    }),

    // 单选取 radiogroup，多选取普通组；题干在场时由题干命名
    getOptionGroupProps: (item) => {
      const prompt = questionOf(item.id)?.prompt
      const single = typeOf(item.id) === 'single'
      return normalize.element({
        'role': single ? 'radiogroup' : 'group',
        ...parts['option-group'].attrs,
        'aria-labelledby': prompt ? promptId(item.id) : undefined,
        'aria-label': prompt ? undefined : (translations?.options ?? 'Options'),
        'data-select-mode': single ? 'single' : 'multiple',
        // 键盘全在组上收口：选项只管声明自己，一次冒泡一个处理器
        'onKeyDown': (event: KeyboardEvent) => {
          if (submitted || !isCurrent(item.id))
            return
          // 组合期间的按键属于候选词框，一律不接
          if (isComposingEvent(event))
            return
          const container = event.currentTarget as HTMLElement
          if (event.key === 'Enter') {
            event.preventDefault()
            // 按住不放会连发 keydown，一次按压只前进一次；键照样吞掉，只是不重复执行
            if (event.repeat)
              return
            advance()
            return
          }
          // 按键发生在选项上，事件目标即那一项，不必回头查焦点
          const origin = event.target as HTMLElement | null
          const from = itemValue(origin)
          if (event.key === ' ' || event.key === 'Spacebar') {
            // 焦点不在选项上、或停在禁用项上（用 aria-disabled 表达禁用，点一下就能停上去），
            // 都不认这个键；不认就不能吞掉它，Space 要放行给页面滚动
            if (from == null || origin == null || isItemDisabled(origin))
              return
            event.preventDefault()
            // 按住不放会连发 keydown，一次按压只切换一次；键照样吞掉，只是不重复执行
            if (event.repeat)
              return
            send({ type: 'OPTION.TOGGLE', questionId: item.id, value: from })
            return
          }
          // 四个方向键都搬焦点：选项是竖排，但横向键同样该走得动
          const intent = navIntentFromKey(event, { axis: 'both' })
          // 返回 null 表示该键不归导航管，此时绝不 preventDefault
          if (!intent)
            return
          event.preventDefault()
          const options = queryItems(container, OPTION_QUERY)
          const target = navigateItems(options, from ?? anchorOf(item.id) ?? null, intent, { loop })
          const next = itemValue(target)
          if (next == null)
            return
          focusItem(target)
          // 单选组里焦点跟着选中走；多选只移焦点，选不选由 Space 说了算
          if (single)
            send({ type: 'OPTION.TOGGLE', questionId: item.id, value: next })
        },
      })
    },

    // 集合条目一律 aria-disabled，不用原生 disabled：原生 disabled 不可聚焦，禁用项就当不成方向键的起点
    getOptionProps: (item) => {
      const single = typeOf(item.questionId) === 'single'
      const selected = isOptionSelected(item.questionId, item.value)
      const disabled = optionDisabled(item)
      const active = isCurrent(item.questionId)
      return normalize.button({
        ...parts.option.attrs,
        // 原生按钮落在 form 里少了 type 会变成 submit
        'type': 'button',
        'role': single ? 'radio' : 'checkbox',
        // 未选中也显式输出 false：省略会让读屏无从区分"未选中"与"不是选项"
        'aria-checked': selected ? 'true' : 'false',
        'aria-disabled': disabled ? 'true' : 'false',
        // 导航与选中都以此为条目身份
        [ITEM_VALUE_ATTR]: item.value,
        'data-state': selected ? 'checked' : 'unchecked',
        'data-select-mode': single ? 'single' : 'multiple',
        'data-disabled': dataAttr(disabled),
        // 非当前题里的选项一个 Tab 停靠点都不占；当前题里只有锚点那一项占
        'tabindex': active && anchorOf(item.questionId) === item.value ? 0 : -1,
        'onClick': () => {
          if (!disabled && active && !submitted)
            send({ type: 'OPTION.TOGGLE', questionId: item.questionId, value: item.value })
        },
      })
    },

    // 勾与点由皮肤画，纯装饰不进可访问名
    getOptionIndicatorProps: item => normalize.element({
      ...parts['option-indicator'].attrs,
      'aria-hidden': true,
      'data-state': isOptionSelected(item.questionId, item.value) ? 'checked' : 'unchecked',
      'data-select-mode': typeOf(item.questionId) === 'single' ? 'single' : 'multiple',
    }),

    // 排在选项之内，文本自然构成它的可及名
    getOptionLabelProps: item => normalize.element({
      ...parts['option-label'].attrs,
      'data-value': item.value,
      'data-state': isOptionSelected(item.questionId, item.value) ? 'checked' : 'unchecked',
    }),

    // 这一题的自由文本。它与选项一起算作"答过了"，交卷后跟着一起禁用
    getNoteProps: item => normalize.input({
      ...parts.note.attrs,
      'type': 'text',
      'value': noteOf(item.id),
      'aria-label': translations?.note ?? 'Other answer',
      'placeholder': translations?.notePlaceholder,
      'disabled': submitted || undefined,
      'tabindex': isCurrent(item.id) ? undefined : -1,
      'onInput': (event: Event) => {
        send({ type: 'NOTE.SET', questionId: item.id, value: (event.target as HTMLInputElement).value })
      },
      'onKeyDown': (event: KeyboardEvent) => {
        // 组合期间的 Enter 是在确认候选词，不前进也不 preventDefault
        if (isComposingEvent(event))
          return
        if (event.key !== 'Enter')
          return
        event.preventDefault()
        if (event.repeat)
          return
        advance()
      },
    }),

    // 只排布步进与动作，不承载语义
    getFooterProps: () => normalize.element({
      ...parts.footer.attrs,
    }),

    // 两颗翻页钮通常只画一枚箭头，名字无条件发：图标按钮没有可读文字，缺了它读屏念不出这是什么
    getPrevTriggerProps: () => normalize.button({
      ...parts['prev-trigger'].attrs,
      'type': 'button',
      'aria-label': translations?.prev ?? 'Previous question',
      'disabled': (isFirst || submitted) || undefined,
      'onClick': () => send({ type: 'PREV' }),
    }),

    // 给眼睛看的 N / M：逐题跳动的数字进活区会不停打断，进度由播报区一次说清
    getCounterProps: () => normalize.element({
      ...parts.counter.attrs,
      'aria-hidden': true,
    }),

    getNextTriggerProps: () => normalize.button({
      ...parts['next-trigger'].attrs,
      'type': 'button',
      'aria-label': translations?.next ?? 'Next question',
      'disabled': (isLast || submitted) || undefined,
      'onClick': () => send({ type: 'NEXT' }),
    }),

    // 关掉跳过就整颗收起：留一颗按不动的按钮，读屏仍会念到一条走不通的路
    getSkipTriggerProps: () => normalize.button({
      ...parts['skip-trigger'].attrs,
      'type': 'button',
      'aria-label': translations?.skip,
      'hidden': !allowSkip || undefined,
      'disabled': submitted || undefined,
      'onClick': () => send({ type: 'SKIP' }),
    }),

    // 同一颗按钮按是不是末题在继续与发送两种身份间切换。
    // 名字与跳过键同一口径：不给就不发。这颗按钮按惯例带可见文字，
    // 兜底的英文会把可见文字盖掉，语音控制照着看见的字念就点不动它
    getSubmitTriggerProps: () => normalize.button({
      ...parts['submit-trigger'].attrs,
      'type': 'button',
      'data-mode': isLast ? 'send' : 'continue',
      'aria-label': isLast ? translations?.send : translations?.continue,
      'disabled': !canAdvance || undefined,
      'onClick': advance,
    }),

    // 交卷之后才露出的那一格。文字由播报区念，这里只给眼睛看
    getResultProps: () => normalize.element({
      ...parts.result.attrs,
      'aria-hidden': true,
      'hidden': !submitted || undefined,
      'data-state': status,
    }),

    // 不写 role：本仓统一走两条 aria-*，role=status 是同一件事的简写
    getLiveRegionProps: () => normalize.element({
      ...parts['live-region'].attrs,
      'aria-live': 'polite',
      'aria-atomic': 'true',
    }),
  }
}
