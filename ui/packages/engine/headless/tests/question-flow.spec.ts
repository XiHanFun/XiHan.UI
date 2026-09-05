// @vitest-environment jsdom
import type { Service } from '@xihan-ui/machine'
import type {
  QuestionFlowApi,
  QuestionFlowQuestion,
  QuestionFlowSchema,
  QuestionFlowStatus,
} from '../src/question-flow'
import { normalizeProps } from '@xihan-ui/kernel'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
// 直接从组件目录导入，不经包主入口
import { connectQuestionFlow, questionFlowMachine } from '../src/question-flow'

type Props = QuestionFlowSchema['props']
type Dict = Record<string, unknown>

const QUESTIONS: QuestionFlowQuestion[] = [
  { id: 'a', prompt: '第一题', type: 'single', options: [{ value: 'a1' }, { value: 'a2' }] },
  { id: 'b', prompt: '第二题', type: 'multiple', options: [{ value: 'b1' }, { value: 'b2' }] },
  { id: 'c', prompt: '第三题', type: 'single', options: [{ value: 'c1' }, { value: 'c2' }] },
]

interface Rig {
  service: Service<QuestionFlowSchema>
  api: () => QuestionFlowApi
  setProps: (next: Props) => void
  state: () => QuestionFlowStatus
  index: () => number
}

/** 把 props 挂在 signal 上，使 watch 里的 track 能收到运行期改动。 */
function mount(initial: Props = {}): Rig {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>({ questions: QUESTIONS, ...initial })
  const service = createService(questionFlowMachine, { props: () => props.get(), runtime })
  runtime.start()

  return {
    service,
    api: () => connectQuestionFlow(service, normalizeProps),
    setProps: next => props.set({ ...props.get(), ...next }),
    state: () => service.state.get(),
    index: () => service.context.get('index'),
  }
}

function click(props: Dict): void {
  (props.onClick as () => void)()
}

describe('question-flow：跳过', () => {
  it('派出跳过回调并翻到下一题', () => {
    const onSkip = vi.fn()
    const rig = mount({ onSkip })
    click(rig.api().getSkipTriggerProps() as Dict)
    expect(onSkip).toHaveBeenCalledWith({ index: 0, questionId: 'a' })
    expect(rig.api().index).toBe(1)
  })

  it('末题上跳过即交卷：最后一题也得有出口', () => {
    const onSkip = vi.fn()
    const onSubmit = vi.fn()
    const rig = mount({ defaultIndex: 2, onSkip, onSubmit })
    click(rig.api().getSkipTriggerProps() as Dict)
    expect(onSkip).toHaveBeenCalledWith({ index: 2, questionId: 'c' })
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(rig.state()).toBe('submitted')
  })

  it('关掉之后按钮收起，事件也不再生效', () => {
    const onSkip = vi.fn()
    const rig = mount({ allowSkip: false, onSkip })
    expect((rig.api().getSkipTriggerProps() as Dict).hidden).toBe(true)
    rig.service.send({ type: 'SKIP' })
    expect(onSkip).not.toHaveBeenCalled()
    expect(rig.api().index).toBe(0)
  })
})

describe('question-flow：自动前进', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('单选选中后走下一题，连着改主意从整段延时重新计', () => {
    vi.useFakeTimers()
    const rig = mount({ autoAdvanceDelay: 100 })
    rig.service.send({ type: 'OPTION.TOGGLE', questionId: 'a', value: 'a1' })
    vi.advanceTimersByTime(80)
    expect(rig.api().index).toBe(0)
    // 又改了一次主意：计时器拆掉重挂，剩下的 20ms 不算数
    rig.service.send({ type: 'OPTION.TOGGLE', questionId: 'a', value: 'a2' })
    vi.advanceTimersByTime(80)
    expect(rig.api().index).toBe(0)
    vi.advanceTimersByTime(20)
    expect(rig.api().index).toBe(1)
  })

  it('末题上停住，不替人按发送', () => {
    vi.useFakeTimers()
    const onSubmit = vi.fn()
    const rig = mount({ defaultIndex: 2, autoAdvanceDelay: 100, onSubmit })
    rig.service.send({ type: 'OPTION.TOGGLE', questionId: 'c', value: 'c1' })
    vi.advanceTimersByTime(500)
    expect(onSubmit).not.toHaveBeenCalled()
    expect(rig.state()).toBe('answering')
  })

  it('多选不排计时器，等人点继续', () => {
    vi.useFakeTimers()
    const rig = mount({ defaultIndex: 1, autoAdvanceDelay: 100 })
    rig.service.send({ type: 'OPTION.TOGGLE', questionId: 'b', value: 'b1' })
    vi.advanceTimersByTime(500)
    expect(rig.api().index).toBe(1)
  })

  it('延时非有限或为负一个计时器都不起', () => {
    vi.useFakeTimers()
    for (const autoAdvanceDelay of [Number.NaN, Number.POSITIVE_INFINITY, -1]) {
      const rig = mount({ autoAdvanceDelay })
      rig.service.send({ type: 'OPTION.TOGGLE', questionId: 'a', value: 'a1' })
      vi.advanceTimersByTime(1000)
      expect(rig.api().index).toBe(0)
    }
  })

  it('手动翻页会把待办清掉：翻回来不会再被推走', () => {
    vi.useFakeTimers()
    const rig = mount({ autoAdvanceDelay: 100 })
    rig.service.send({ type: 'OPTION.TOGGLE', questionId: 'a', value: 'a1' })
    rig.service.send({ type: 'NEXT' })
    expect(rig.api().index).toBe(1)
    rig.service.send({ type: 'PREV' })
    vi.advanceTimersByTime(500)
    expect(rig.api().index).toBe(0)
  })
})

describe('question-flow：下标与答案', () => {
  it('越界的下标一律夹回题数范围内', () => {
    expect(mount({ defaultIndex: -5 }).api().index).toBe(0)
    expect(mount({ defaultIndex: 99 }).api().index).toBe(2)
    expect(mount({ questions: [], defaultIndex: 3 }).api().count).toBe(0)
  })

  it('单选点已选中的那一项不取消', () => {
    const rig = mount({ autoAdvance: false })
    rig.service.send({ type: 'OPTION.TOGGLE', questionId: 'a', value: 'a1' })
    rig.service.send({ type: 'OPTION.TOGGLE', questionId: 'a', value: 'a1' })
    expect(rig.api().answersOf('a')).toEqual(['a1'])
  })

  it('多选逐项翻面，各题的答案互不干扰', () => {
    const rig = mount({ defaultIndex: 1 })
    rig.service.send({ type: 'OPTION.TOGGLE', questionId: 'b', value: 'b1' })
    rig.service.send({ type: 'OPTION.TOGGLE', questionId: 'b', value: 'b2' })
    rig.service.send({ type: 'OPTION.TOGGLE', questionId: 'b', value: 'b1' })
    expect(rig.api().answersOf('b')).toEqual(['b2'])
    expect(rig.api().answersOf('a')).toEqual([])
  })

  it('写了自由文本就算答过这一题', () => {
    const rig = mount()
    expect(rig.api().canAdvance).toBe(false)
    rig.service.send({ type: 'NOTE.SET', questionId: 'a', value: '  ' })
    expect(rig.api().canAdvance).toBe(false)
    rig.service.send({ type: 'NOTE.SET', questionId: 'a', value: '都不是' })
    expect(rig.api().canAdvance).toBe(true)
  })

  it('可跳过的题不答也走得下去', () => {
    const rig = mount({
      questions: [{ id: 'a', type: 'single', optional: true, options: [{ value: 'a1' }] }],
    })
    expect(rig.api().canAdvance).toBe(true)
  })
})

describe('question-flow：受控答题态', () => {
  it('给了 status 就只发意图，宿主写回之后才落定', () => {
    const onSubmit = vi.fn()
    const rig = mount({ status: 'answering', defaultIndex: 2, onSubmit })
    rig.service.send({ type: 'SUBMIT' })
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(rig.state()).toBe('answering')
    rig.setProps({ status: 'submitted' })
    expect(rig.state()).toBe('submitted')
  })

  it('交卷载荷是答案与自由文本的快照，事后改动不再回灌', () => {
    const onSubmit = vi.fn()
    const rig = mount({ defaultIndex: 2, onSubmit })
    rig.service.send({ type: 'OPTION.TOGGLE', questionId: 'c', value: 'c1' })
    rig.service.send({ type: 'NOTE.SET', questionId: 'c', value: '再加一句' })
    rig.service.send({ type: 'SUBMIT' })
    expect(onSubmit).toHaveBeenCalledWith({ answers: { c: ['c1'] }, notes: { c: '再加一句' } })
    const payload = onSubmit.mock.calls[0]![0]
    rig.service.send({ type: 'CONTROLLED.ANSWERING' })
    rig.service.send({ type: 'NOTE.SET', questionId: 'c', value: '改过了' })
    expect(payload.notes).toEqual({ c: '再加一句' })
  })
})

describe('question-flow：连接层', () => {
  it('提交键在末题上换身份：data-mode 与可访问名一起翻面', () => {
    const rig = mount({
      defaultAnswers: { a: ['a1'], c: ['c1'] },
      translations: { continue: '继续', send: '发送' },
    })
    const first = rig.api().getSubmitTriggerProps() as Dict
    expect(first['data-mode']).toBe('continue')
    expect(first['aria-label']).toBe('继续')
    rig.service.send({ type: 'GOTO', index: 2 })
    const last = rig.api().getSubmitTriggerProps() as Dict
    expect(last['data-mode']).toBe('send')
    expect(last['aria-label']).toBe('发送')
  })

  // 提交键与跳过键都带可见文字。发一句写死的英文名会盖掉那行字，
  // 语音控制照着屏幕上看见的词说「点击 继续」就再也点不动它。
  it('没给文案时提交键与跳过键都不发 aria-label，可见文字自己当名字', () => {
    const rig = mount({ defaultAnswers: { a: ['a1'], c: ['c1'] } })
    expect((rig.api().getSubmitTriggerProps() as Dict)['aria-label']).toBeUndefined()
    expect((rig.api().getSkipTriggerProps() as Dict)['aria-label']).toBeUndefined()
    rig.service.send({ type: 'GOTO', index: 2 })
    expect((rig.api().getSubmitTriggerProps() as Dict)['aria-label']).toBeUndefined()
  })

  it('非当前题对读屏与 Tab 序都不可达', () => {
    const rig = mount()
    const current = rig.api().getQuestionProps({ id: 'a' }) as Dict
    const other = rig.api().getQuestionProps({ id: 'b' }) as Dict
    expect(current['aria-hidden']).toBeUndefined()
    expect(current.inert).toBeUndefined()
    expect(current['data-current']).toBe('')
    expect(other['aria-hidden']).toBe(true)
    expect(other.inert).toBe(true)
    expect((rig.api().getItemProps({ questionId: 'b', value: 'b1' }) as Dict).tabindex).toBe(-1)
  })

  it('漫游焦点的锚点：选中项认领，一个都没选时首个可停留项认领', () => {
    const rig = mount({
      questions: [{ id: 'a', type: 'single', options: [{ value: 'a1', disabled: true }, { value: 'a2' }, { value: 'a3' }] }],
    })
    const tabindexOf = (value: string): unknown =>
      (rig.api().getItemProps({ questionId: 'a', value }) as Dict).tabindex
    expect(tabindexOf('a1')).toBe(-1)
    expect(tabindexOf('a2')).toBe(0)
    rig.service.send({ type: 'OPTION.TOGGLE', questionId: 'a', value: 'a3' })
    expect(tabindexOf('a3')).toBe(0)
    expect(tabindexOf('a2')).toBe(-1)
  })

  it('播报区念进度，交卷后念结果；计数那格只给眼睛看', () => {
    const rig = mount({ defaultIndex: 1, defaultAnswers: { b: ['b1'] } })
    expect(rig.api().announcement).toBe('Question 2 of 3')
    expect(rig.api().counter).toBe('2 / 3')
    expect((rig.api().getCounterProps() as Dict)['aria-hidden']).toBe(true)
    rig.service.send({ type: 'SUBMIT' })
    expect(rig.api().announcement).toBe('Answers sent')
  })

  it('题干在场时由题干命名选项组，缺席时退到兜底文案', () => {
    const rig = mount({
      questions: [{ id: 'a', prompt: '有题干', type: 'single', options: [{ value: 'a1' }] }, { id: 'b', type: 'single', options: [{ value: 'b1' }] }],
    })
    const named = rig.api().getGroupProps({ id: 'a' }) as Dict
    const fallback = rig.api().getGroupProps({ id: 'b' }) as Dict
    expect(named['aria-labelledby']).toBeTruthy()
    expect(named['aria-label']).toBeUndefined()
    expect(fallback['aria-labelledby']).toBeUndefined()
    expect(fallback['aria-label']).toBe('Options')
  })
})
