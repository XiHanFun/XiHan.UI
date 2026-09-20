// @vitest-environment jsdom
import type { Service } from '@xihan-ui/core'
import type {
  QuestionFlowApi,
  QuestionFlowQuestion,
  QuestionFlowSchema,
  QuestionFlowStatus,
} from '../src/question-flow'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
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
  it('四颗钮与选项行接 Action Control：翻页 icon/xs ghost、跳过 text ghost、提交 text solid、选项 row ghost；data-disabled 跟着 disabled 走', () => {
    const rig = mount()
    const prev = rig.api().getPrevTriggerProps() as Dict
    expect(prev).toMatchObject({ 'data-xh-action-control': '', 'data-xh-action-profile': 'icon', 'data-xh-action-variant': 'ghost', 'data-xh-action-display': 'always', 'data-xh-action-size': 'xs' })
    // 第一题：上一题按不动，下一题按得动
    expect(prev['data-disabled']).toBe('')
    const next = rig.api().getNextTriggerProps() as Dict
    expect(next).toMatchObject({ 'data-xh-action-profile': 'icon', 'data-xh-action-size': 'xs' })
    expect(next['data-disabled']).toBeUndefined()
    expect(rig.api().getSkipTriggerProps()).toMatchObject({ 'data-xh-action-control': '', 'data-xh-action-profile': 'text', 'data-xh-action-variant': 'ghost', 'data-xh-action-display': 'always', 'data-xh-action-size': 'md' })
    const submit = rig.api().getSubmitTriggerProps() as Dict
    expect(submit).toMatchObject({ 'data-xh-action-control': '', 'data-xh-action-profile': 'text', 'data-xh-action-variant': 'solid', 'data-xh-action-display': 'always', 'data-xh-action-size': 'md' })
    // 没答之前提交键按不动：家族禁用面认 data-disabled
    expect(submit['data-disabled']).toBe('')
    expect(rig.api().getItemProps({ questionId: 'a', value: 'a1' })).toMatchObject({ 'data-xh-action-control': '', 'data-xh-action-profile': 'row', 'data-xh-action-variant': 'ghost', 'data-xh-action-display': 'always', 'data-xh-action-size': 'md' })
    // 档位随 size 走；翻页钮是定尺的 xs 方格，不随 size
    const lg = mount({ size: 'lg' })
    expect((lg.api().getSubmitTriggerProps() as Dict)['data-xh-action-size']).toBe('lg')
    expect((lg.api().getItemProps({ questionId: 'a', value: 'a1' }) as Dict)['data-xh-action-size']).toBe('lg')
    expect((lg.api().getPrevTriggerProps() as Dict)['data-xh-action-size']).toBe('xs')
  })

  // 家族的深色 solid 规则只看触发器自身的 data-tone：不投的话暗色下实心面被改写成品牌色，
  // 与亮色下的语气色对不上。语气轴由连接层作真源投到钮上，与 Button 同构；ghost 形态的跳过钮不吃这条
  it('语气投在提交钮自己身上：与根同值，没打语气时不投；跳过钮不投', () => {
    const plain = mount()
    expect((plain.api().getRootProps() as Dict)['data-tone']).toBeUndefined()
    expect((plain.api().getSubmitTriggerProps() as Dict)['data-tone']).toBeUndefined()

    const warning = mount({ tone: 'warning' })
    expect((warning.api().getRootProps() as Dict)['data-tone']).toBe('warning')
    expect((warning.api().getSubmitTriggerProps() as Dict)['data-tone']).toBe('warning')
    expect((warning.api().getSkipTriggerProps() as Dict)['data-tone']).toBeUndefined()
  })

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

describe('connectQuestionFlow 投影', () => {
  it('variant 不写时根落 outline；写 subtle 如实落', () => {
    expect(mount().api().getRootProps()).toMatchObject({ 'data-variant': 'outline' })
    expect(mount({ variant: 'subtle' }).api().getRootProps()).toMatchObject({ 'data-variant': 'subtle' })
  })
})

// ══ 按压通道 ══

const key = (name: string): KeyboardEvent => ({ key: name, repeat: false, isComposing: false, keyCode: 0 } as KeyboardEvent)
const fire = (props: Dict, name: string, event: unknown): void => (props[name] as (e: unknown) => void)(event)

describe('question-flow：按压通道，Space / Enter 与触屏按住投影 data-pressed', () => {
  it('四颗钮：keydown 在场、keyup 撤下；触屏按下在场、抬起 / 取消撤下；失焦撤下；鼠标按下不走这一路；题号与状态不动', () => {
    const rig = mount({ defaultIndex: 1, defaultAnswers: { b: ['b1'] } })
    const buttons: Record<string, () => Dict> = {
      prev: () => rig.api().getPrevTriggerProps() as Dict,
      next: () => rig.api().getNextTriggerProps() as Dict,
      skip: () => rig.api().getSkipTriggerProps() as Dict,
      submit: () => rig.api().getSubmitTriggerProps() as Dict,
    }
    for (const trigger of Object.values(buttons)) {
      expect(trigger().disabled).toBeUndefined()
      expect(trigger()['data-pressed']).toBeUndefined()
      fire(trigger(), 'onKeyDown', key(' '))
      expect(trigger()['data-pressed']).toBe('')
      fire(trigger(), 'onKeyUp', key(' '))
      expect(trigger()['data-pressed']).toBeUndefined()
      fire(trigger(), 'onKeyDown', key('Enter'))
      expect(trigger()['data-pressed']).toBe('')
      fire(trigger(), 'onBlur', {})
      expect(trigger()['data-pressed']).toBeUndefined()
      fire(trigger(), 'onPointerDown', { pointerType: 'touch' })
      expect(trigger()['data-pressed']).toBe('')
      fire(trigger(), 'onPointerCancel', {})
      expect(trigger()['data-pressed']).toBeUndefined()
      fire(trigger(), 'onPointerDown', { pointerType: 'touch' })
      expect(trigger()['data-pressed']).toBe('')
      fire(trigger(), 'onPointerUp', {})
      expect(trigger()['data-pressed']).toBeUndefined()
      fire(trigger(), 'onPointerDown', { pointerType: 'mouse' })
      expect(trigger()['data-pressed']).toBeUndefined()
    }
    expect(rig.index()).toBe(1)
    expect(rig.state()).toBe('answering')
  })

  it('按部件键记住按住的那一个：按住上一题时下一题不投影，另一颗的 keyup 不把它松开', () => {
    const rig = mount({ defaultIndex: 1 })
    const prev = (): Dict => rig.api().getPrevTriggerProps() as Dict
    const next = (): Dict => rig.api().getNextTriggerProps() as Dict
    fire(prev(), 'onKeyDown', key('Enter'))
    expect(prev()['data-pressed']).toBe('')
    expect(next()['data-pressed']).toBeUndefined()
    fire(next(), 'onKeyUp', key('Enter'))
    expect(prev()['data-pressed']).toBe('')
    fire(prev(), 'onKeyUp', key('Enter'))
    expect(prev()['data-pressed']).toBeUndefined()
  })

  it('选项：Space 与触屏按住投影，Enter 不是选项的激活键不进；按 item:value 记且与选中互相独立', () => {
    const rig = mount()
    const item = (value: string): Dict => rig.api().getItemProps({ questionId: 'a', value }) as Dict
    fire(item('a1'), 'onKeyDown', key('Enter'))
    expect(item('a1')['data-pressed']).toBeUndefined()
    fire(item('a1'), 'onKeyDown', key(' '))
    expect(item('a1')['data-pressed']).toBe('')
    expect(item('a2')['data-pressed']).toBeUndefined()
    // 切换在组上收口：这里模拟组把它选中，按压面不随选中丢
    click(item('a1'))
    expect(item('a1')['aria-checked']).toBe('true')
    expect(item('a1')['data-pressed']).toBe('')
    fire(item('a1'), 'onKeyUp', key(' '))
    expect(item('a1')['data-pressed']).toBeUndefined()
    fire(item('a2'), 'onPointerDown', { pointerType: 'touch' })
    expect(item('a2')['data-pressed']).toBe('')
    fire(item('a2'), 'onPointerUp', {})
    expect(item('a2')['data-pressed']).toBeUndefined()
  })

  it('边界与禁用不进：首题的上一题、末题的下一题、答不完整的提交、禁用选项、非当前题的选项、关掉的跳过', () => {
    const first = mount({ questions: [
      { id: 'a', type: 'single', options: [{ value: 'a1' }, { value: 'a2', disabled: true }] },
      { id: 'b', type: 'single', options: [{ value: 'b1' }] },
    ], allowSkip: false })
    const touch = (props: Dict): void => {
      fire(props, 'onKeyDown', key(' '))
      fire(props, 'onPointerDown', { pointerType: 'touch' })
    }
    touch(first.api().getPrevTriggerProps() as Dict)
    expect((first.api().getPrevTriggerProps() as Dict)['data-pressed']).toBeUndefined()
    touch(first.api().getSubmitTriggerProps() as Dict)
    expect((first.api().getSubmitTriggerProps() as Dict)['data-pressed']).toBeUndefined()
    touch(first.api().getSkipTriggerProps() as Dict)
    expect((first.api().getSkipTriggerProps() as Dict)['data-pressed']).toBeUndefined()
    touch(first.api().getItemProps({ questionId: 'a', value: 'a2' }) as Dict)
    expect((first.api().getItemProps({ questionId: 'a', value: 'a2' }) as Dict)['data-pressed']).toBeUndefined()
    touch(first.api().getItemProps({ questionId: 'b', value: 'b1' }) as Dict)
    expect((first.api().getItemProps({ questionId: 'b', value: 'b1' }) as Dict)['data-pressed']).toBeUndefined()
    // 未禁用的那一项照进
    touch(first.api().getItemProps({ questionId: 'a', value: 'a1' }) as Dict)
    expect((first.api().getItemProps({ questionId: 'a', value: 'a1' }) as Dict)['data-pressed']).toBe('')

    const last = mount({ defaultIndex: 2 })
    touch(last.api().getNextTriggerProps() as Dict)
    expect((last.api().getNextTriggerProps() as Dict)['data-pressed']).toBeUndefined()
  })

  it('按住途中换题：Enter 在 keydown 即前进，被按住的选项转 inert、翻页钮可能到边界，一并松开；换题后照常可按', () => {
    const rig = mount({ defaultAnswers: { a: ['a1'] } })
    const submit = (): Dict => rig.api().getSubmitTriggerProps() as Dict
    fire(submit(), 'onKeyDown', key('Enter'))
    expect(submit()['data-pressed']).toBe('')
    click(submit())
    expect(rig.index()).toBe(1)
    expect(submit()['data-pressed']).toBeUndefined()
    // 迟到的 keyup 不把新题上的按钮压下去
    fire(submit(), 'onKeyUp', key('Enter'))
    expect(submit()['data-pressed']).toBeUndefined()

    const item = (): Dict => rig.api().getItemProps({ questionId: 'b', value: 'b1' }) as Dict
    fire(item(), 'onPointerDown', { pointerType: 'touch' })
    expect(item()['data-pressed']).toBe('')
    rig.api().prev()
    expect(rig.index()).toBe(0)
    expect(item()['data-pressed']).toBeUndefined()

    const next = (): Dict => rig.api().getNextTriggerProps() as Dict
    fire(next(), 'onKeyDown', key(' '))
    expect(next()['data-pressed']).toBe('')
    fire(next(), 'onKeyUp', key(' '))
    expect(next()['data-pressed']).toBeUndefined()
  })

  it('按住途中选中一项：Space 在 keydown 即切换、答题态重入，按压面不丢；自动前进换题时才松开', () => {
    vi.useFakeTimers()
    try {
      const rig = mount({ autoAdvanceDelay: 100 })
      const item = (): Dict => rig.api().getItemProps({ questionId: 'a', value: 'a1' }) as Dict
      fire(item(), 'onKeyDown', key(' '))
      rig.api().toggleOption('a', 'a1')
      expect(item()['aria-checked']).toBe('true')
      expect(item()['data-pressed']).toBe('')
      vi.advanceTimersByTime(100)
      expect(rig.index()).toBe(1)
      expect(item()['data-pressed']).toBeUndefined()
    }
    finally {
      vi.useRealTimers()
    }
  })

  it('按住途中交卷、题目改写或关掉跳过：被按住的那一个不会再来 keyup，按压面由机器收', () => {
    const rig = mount({ defaultIndex: 2, defaultAnswers: { c: ['c1'] } })
    const submit = (): Dict => rig.api().getSubmitTriggerProps() as Dict
    fire(submit(), 'onKeyDown', key('Enter'))
    expect(submit()['data-pressed']).toBe('')
    click(submit())
    expect(rig.state()).toBe('submitted')
    expect(submit()['data-pressed']).toBeUndefined()
    // 交卷后一律不进
    fire(submit(), 'onPointerDown', { pointerType: 'touch' })
    expect(submit()['data-pressed']).toBeUndefined()

    const rewritten = mount()
    const item = (): Dict => rewritten.api().getItemProps({ questionId: 'a', value: 'a1' }) as Dict
    fire(item(), 'onPointerDown', { pointerType: 'touch' })
    expect(item()['data-pressed']).toBe('')
    rewritten.setProps({ questions: [{ id: 'a', type: 'single', options: [{ value: 'a3' }] }] })
    expect(item()['data-pressed']).toBeUndefined()

    const skipping = mount()
    const skip = (): Dict => skipping.api().getSkipTriggerProps() as Dict
    fire(skip(), 'onKeyDown', key(' '))
    expect(skip()['data-pressed']).toBe('')
    skipping.setProps({ allowSkip: false })
    expect(skip().hidden).toBe(true)
    expect(skip()['data-pressed']).toBeUndefined()
  })
})
