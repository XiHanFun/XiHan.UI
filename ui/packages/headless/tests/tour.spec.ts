// @vitest-environment jsdom
import type { TourApi, TourSchema, TourStep } from '../src/tour'
import { normalizeProps } from '@xihan-ui/kernel'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
// 直接指向组件目录：包主入口的导出由接线一并补，测试不等它
import {
  clampTourStep,
  connectTour,
  currentTourStep,
  isTourLastStep,
  sameTourSpotlight,
  TOUR_DEFAULT_SPOTLIGHT_PADDING,
  tourMachine,
  tourSpotlightBox,
  tourStepCount,
} from '../src/tour'

type Props = TourSchema['props']
type Dict = Record<string, unknown>

const STEPS: TourStep[] = [
  { id: 'a', target: '#tour-a', title: '第一站', description: '这里是搜索框' },
  { id: 'b', target: '#tour-b', title: '第二站', description: '这里是列表', placement: 'right' },
  // 收尾页不锚定任何元素：浮层居中、不画高亮框
  { id: 'done', target: null, title: '结束', description: '你已经了解全部功能' },
]

const listeners = new WeakMap<HTMLElement, Map<string, EventListener>>()

/**
 * 最小 spread：与 WC 侧同一套翻译规则（on 之后全小写做事件名，style 对象逐条写内联，其余落属性）。
 * 有它才跑得到真实事件流——只比对 connect 的返回值就只能验静态属性，
 * 「量出来的高亮框写进内联 style」「窗口一变就重量」这类事实必须有活 DOM 才立得住。
 */
function spread(el: HTMLElement, props: Dict): void {
  for (const [key, raw] of Object.entries(props)) {
    if (key.length > 2 && key.startsWith('on') && key[2]! >= 'A' && key[2]! <= 'Z') {
      const type = key.slice(2).toLowerCase()
      const map = listeners.get(el) ?? new Map<string, EventListener>()
      listeners.set(el, map)
      const prev = map.get(type)
      if (prev)
        el.removeEventListener(type, prev)
      if (typeof raw === 'function') {
        el.addEventListener(type, raw as EventListener)
        map.set(type, raw as EventListener)
      }
      continue
    }
    if (key === 'style' && raw !== null && typeof raw === 'object') {
      Object.assign(el.style, raw as Record<string, string>)
      continue
    }
    if (raw === undefined || raw === null || raw === false) {
      el.removeAttribute(key)
      continue
    }
    el.setAttribute(key, raw === true ? '' : String(raw))
  }
}

/** 给节点钉一个假的盒子：jsdom 不排版，所有 rect 恒为 0。 */
function stubRect(el: HTMLElement, box: { x: number, y: number, width: number, height: number }): void {
  el.getBoundingClientRect = () => ({
    x: box.x,
    y: box.y,
    width: box.width,
    height: box.height,
    top: box.y,
    left: box.x,
    right: box.x + box.width,
    bottom: box.y + box.height,
    toJSON: () => ({}),
  }) as DOMRect
}

/** 纯逻辑服务：不挂任何 DOM 副作用，只验状态转移与回调。 */
function makeService(initial: Props = {}) {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>(initial)
  const service = createService(tourMachine, { props: () => props.get(), runtime })
  runtime.start()
  return {
    service,
    api: (): TourApi => connectTour(service, normalizeProps),
    setProps: (next: Props) => props.set({ ...props.get(), ...next }),
    stop: () => runtime.stop(),
  }
}

interface Harness {
  api: () => TourApi
  service: ReturnType<typeof createService<TourSchema>>
  content: HTMLElement
  spotlight: HTMLElement
  positioner: HTMLElement
  backdrop: HTMLElement
  prev: HTMLButtonElement
  next: HTMLButtonElement
  skip: HTMLButtonElement
  close: HTMLButtonElement
  arrow: HTMLElement
  progressText: HTMLElement
  targets: { a: HTMLElement, b: HTMLElement }
  setProps: (next: Props) => void
  stop: () => void
}

/** 一整套活 DOM：root > (backdrop, spotlight, positioner > content > 文本与四个按钮)。 */
function mount(initial: Props = {}): Harness {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>({ steps: STEPS, ...initial })
  const service = createService(tourMachine, { props: () => props.get(), runtime })

  const doc = document
  const make = <K extends keyof HTMLElementTagNameMap>(tag: K): HTMLElementTagNameMap[K] => doc.createElement(tag)
  const root = make('div')
  const backdrop = make('div')
  const spotlight = make('div')
  const positioner = make('div')
  const content = make('div')
  const title = make('h2')
  const description = make('p')
  const progressText = make('span')
  const prev = make('button')
  const next = make('button')
  const skip = make('button')
  const close = make('button')
  const arrow = make('div')
  content.append(title, description, progressText, prev, next, skip, close, arrow)
  positioner.appendChild(content)
  root.append(backdrop, spotlight, positioner)

  // 引导目标住在组件之外——那正是引导要指的东西
  const targetA = make('div')
  targetA.id = 'tour-a'
  const targetB = make('div')
  targetB.id = 'tour-b'
  stubRect(targetA, { x: 100, y: 40, width: 200, height: 30 })
  stubRect(targetB, { x: 20, y: 300, width: 400, height: 120 })
  doc.body.append(targetA, targetB, root)

  service.refs.set('getContentEl', () => content)
  service.refs.set('getFloatingEl', () => positioner)

  const render = (): void => {
    const api = connectTour(service, normalizeProps)
    spread(root, api.getRootProps() as Dict)
    spread(backdrop, api.getBackdropProps() as Dict)
    spread(spotlight, api.getSpotlightProps() as Dict)
    spread(positioner, api.getPositionerProps() as Dict)
    spread(content, api.getContentProps() as Dict)
    spread(title, api.getTitleProps() as Dict)
    spread(description, api.getDescriptionProps() as Dict)
    spread(progressText, api.getProgressTextProps() as Dict)
    spread(prev, api.getPrevTriggerProps() as Dict)
    spread(next, api.getNextTriggerProps() as Dict)
    spread(skip, api.getSkipTriggerProps() as Dict)
    spread(close, api.getCloseTriggerProps() as Dict)
    spread(arrow, api.getArrowProps() as Dict)
    progressText.textContent = api.progressText
  }

  runtime.subscribe(render)
  runtime.start()
  render()

  return {
    api: () => connectTour(service, normalizeProps),
    service,
    content,
    spotlight,
    positioner,
    backdrop,
    prev,
    next,
    skip,
    close,
    arrow,
    progressText,
    targets: { a: targetA, b: targetB },
    setProps: (nextProps) => {
      props.set({ ...props.get(), ...nextProps })
      render()
    },
    stop: () => {
      runtime.stop()
      root.remove()
      targetA.remove()
      targetB.remove()
    },
  }
}

/** 等一拍微任务：量 DOM 与定位都推迟到宿主提交之后（machine 的 flush 即 queueMicrotask）。 */
async function settle(): Promise<void> {
  await Promise.resolve()
  await Promise.resolve()
}

function keydown(el: HTMLElement, key: string): KeyboardEvent {
  // 必须显式 cancelable：合成事件默认不可取消，在它身上 preventDefault 是空操作，
  // 「方向键不接管」这条断言会永远为真、什么都没测到
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
  el.dispatchEvent(event)
  return event
}

afterEach(() => {
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

describe('tour 纯函数', () => {
  it('tourStepCount 只认数组，其余一律 0', () => {
    expect(tourStepCount(STEPS)).toBe(3)
    expect(tourStepCount(undefined)).toBe(0)
    expect(tourStepCount([])).toBe(0)
  })

  it('clampTourStep 夹进 [0, count - 1]，脏值落回 0', () => {
    expect(clampTourStep(-3, 3)).toBe(0)
    expect(clampTourStep(1, 3)).toBe(1)
    // 上界是 count - 1：引导没有"走完还停在这儿"的空位
    expect(clampTourStep(9, 3)).toBe(2)
    expect(clampTourStep(1.7, 3)).toBe(1)
    expect(clampTourStep(Number.NaN, 3)).toBe(0)
    expect(clampTourStep(undefined, 3)).toBe(0)
    // 空清单没有任何合法步序
    expect(clampTourStep(5, 0)).toBe(0)
  })

  it('isTourLastStep：末步与空清单都算走到头', () => {
    expect(isTourLastStep(0, 3)).toBe(false)
    expect(isTourLastStep(2, 3)).toBe(true)
    expect(isTourLastStep(0, 0)).toBe(true)
  })

  it('currentTourStep 越界回 null', () => {
    expect(currentTourStep(STEPS, 1)?.id).toBe('b')
    expect(currentTourStep(STEPS, 7)).toBeNull()
    expect(currentTourStep(undefined, 0)).toBeNull()
  })

  it('tourSpotlightBox 四周外扩留白，脏留白落回缺省', () => {
    const rect = { x: 100, y: 40, width: 200, height: 30 }
    expect(tourSpotlightBox(rect, 10)).toEqual({ x: 90, y: 30, width: 220, height: 50 })
    // 0 是合法留白（框正好贴着目标），不能被当成"没给"落回缺省
    expect(tourSpotlightBox(rect, 0)).toEqual({ x: 100, y: 40, width: 200, height: 30 })
    // 负数会把框缩进目标里去，收成 0
    expect(tourSpotlightBox(rect, -5)).toEqual({ x: 100, y: 40, width: 200, height: 30 })
    expect(tourSpotlightBox(rect, undefined)).toEqual({
      x: 100 - TOUR_DEFAULT_SPOTLIGHT_PADDING,
      y: 40 - TOUR_DEFAULT_SPOTLIGHT_PADDING,
      width: 200 + TOUR_DEFAULT_SPOTLIGHT_PADDING * 2,
      height: 30 + TOUR_DEFAULT_SPOTLIGHT_PADDING * 2,
    })
    expect(tourSpotlightBox(rect, Number.NaN).width).toBe(200 + TOUR_DEFAULT_SPOTLIGHT_PADDING * 2)
  })

  it('sameTourSpotlight 按值比，null 与 null 相等', () => {
    const box = { x: 1, y: 2, width: 3, height: 4 }
    expect(sameTourSpotlight(box, { ...box })).toBe(true)
    expect(sameTourSpotlight(box, { ...box, width: 5 })).toBe(false)
    expect(sameTourSpotlight(null, null)).toBe(true)
    expect(sameTourSpotlight(box, null)).toBe(false)
    // 旧值为 undefined = 还没写过，与"没有高亮框"是同一件事
    expect(sameTourSpotlight(null, undefined)).toBe(true)
    expect(sameTourSpotlight(box, undefined)).toBe(false)
  })
})

describe('tourMachine 开合与走步', () => {
  it('默认 closed，defaultOpen 决定初态', () => {
    expect(makeService({ steps: STEPS }).service.state.get()).toBe('closed')
    expect(makeService({ steps: STEPS, defaultOpen: true }).service.state.get()).toBe('open')
  })

  it('oPEN / CLOSE 转移并通知', () => {
    const onOpenChange = vi.fn()
    const t = makeService({ steps: STEPS, onOpenChange })
    t.service.send({ type: 'OPEN' })
    expect(t.service.state.get()).toBe('open')
    expect(onOpenChange).toHaveBeenLastCalledWith({ open: true })
    t.service.send({ type: 'CLOSE' })
    expect(t.service.state.get()).toBe('closed')
    expect(onOpenChange).toHaveBeenLastCalledWith({ open: false })
  })

  it('sTEP.NEXT / STEP.PREV 走步并夹在两端', () => {
    const onStepChange = vi.fn()
    const t = makeService({ steps: STEPS, defaultOpen: true, onStepChange })
    expect(t.api().step).toBe(0)
    // 首步再退一步仍是首步，且不该通知（值没变）
    t.service.send({ type: 'STEP.PREV' })
    expect(t.api().step).toBe(0)
    expect(onStepChange).not.toHaveBeenCalled()

    t.service.send({ type: 'STEP.NEXT' })
    expect(t.api().step).toBe(1)
    expect(onStepChange).toHaveBeenLastCalledWith({ step: 1 })
    t.service.send({ type: 'STEP.PREV' })
    expect(t.api().step).toBe(0)
  })

  it('sTEP.SET 越界被夹住', () => {
    const t = makeService({ steps: STEPS, defaultOpen: true })
    t.api().setStep(99)
    expect(t.api().step).toBe(2)
    t.api().setStep(-4)
    expect(t.api().step).toBe(0)
  })

  it('末步再走一步 = 完成：先发 onComplete 再关闭', () => {
    const onComplete = vi.fn()
    const onOpenChange = vi.fn()
    const onStepChange = vi.fn()
    const t = makeService({ steps: STEPS, defaultOpen: true, defaultStep: 2, onComplete, onOpenChange, onStepChange })
    t.service.send({ type: 'STEP.NEXT' })
    expect(onComplete).toHaveBeenCalledWith({ step: 2 })
    expect(onOpenChange).toHaveBeenCalledWith({ open: false })
    expect(t.service.state.get()).toBe('closed')
    // 完成不是"又走了一步"：步序停在末步，不该多发一次 onStepChange
    expect(onStepChange).not.toHaveBeenCalled()
    expect(t.api().step).toBe(2)
  })

  it('sKIP：先发 onSkip 再关闭，带上停在的那一步', () => {
    const onSkip = vi.fn()
    const onOpenChange = vi.fn()
    const t = makeService({ steps: STEPS, defaultOpen: true, defaultStep: 1, onSkip, onOpenChange })
    t.api().skip()
    expect(onSkip).toHaveBeenCalledWith({ step: 1 })
    expect(onOpenChange).toHaveBeenCalledWith({ open: false })
    expect(t.service.state.get()).toBe('closed')
  })

  it('空清单：一开就算走到头，下一步直接完成', () => {
    const onComplete = vi.fn()
    const t = makeService({ steps: [], defaultOpen: true, onComplete })
    expect(t.api().lastStep).toBe(true)
    t.service.send({ type: 'STEP.NEXT' })
    expect(onComplete).toHaveBeenCalledWith({ step: 0 })
    expect(t.service.state.get()).toBe('closed')
  })

  it('收起态收不到走步事件：CLOSE 之后 STEP.NEXT 不改步序', () => {
    const t = makeService({ steps: STEPS, defaultOpen: true })
    t.service.send({ type: 'CLOSE' })
    t.service.send({ type: 'STEP.NEXT' })
    expect(t.api().step).toBe(0)
  })
})

describe('tourMachine 受控', () => {
  it('受控 open：事件只发意图，宿主写回才转移', () => {
    const onOpenChange = vi.fn()
    const t = makeService({ steps: STEPS, open: false, onOpenChange })
    t.service.send({ type: 'OPEN' })
    expect(onOpenChange).toHaveBeenCalledWith({ open: true })
    expect(t.service.state.get()).toBe('closed')
    t.setProps({ open: true })
    expect(t.service.state.get()).toBe('open')
  })

  it('受控 open 下末步完成：onComplete 与 onOpenChange 照发，状态不自改', () => {
    const onComplete = vi.fn()
    const onOpenChange = vi.fn()
    const t = makeService({ steps: STEPS, open: true, step: 2, onComplete, onOpenChange })
    t.service.send({ type: 'STEP.NEXT' })
    expect(onComplete).toHaveBeenCalledWith({ step: 2 })
    expect(onOpenChange).toHaveBeenCalledWith({ open: false })
    expect(t.service.state.get()).toBe('open')
    t.setProps({ open: false })
    expect(t.service.state.get()).toBe('closed')
  })

  it('受控 open 下 SKIP：同样只发意图', () => {
    const onSkip = vi.fn()
    const t = makeService({ steps: STEPS, open: true, onSkip })
    t.service.send({ type: 'SKIP' })
    expect(onSkip).toHaveBeenCalledWith({ step: 0 })
    expect(t.service.state.get()).toBe('open')
  })

  it('受控 step：走步只发 onStepChange，内部值不动', () => {
    const onStepChange = vi.fn()
    const t = makeService({ steps: STEPS, defaultOpen: true, step: 0, onStepChange })
    t.service.send({ type: 'STEP.NEXT' })
    expect(onStepChange).toHaveBeenCalledWith({ step: 1 })
    expect(t.api().step).toBe(0)
    t.setProps({ step: 1 })
    expect(t.api().step).toBe(1)
  })

  it('open 变回 undefined = 转非受控，不强制关闭', () => {
    const t = makeService({ steps: STEPS, open: true })
    expect(t.service.state.get()).toBe('open')
    t.setProps({ open: undefined })
    expect(t.service.state.get()).toBe('open')
  })
})

describe('connectTour 输出', () => {
  it('content 的 role / aria-modal / 互指 id / hidden', () => {
    const t = makeService({ steps: STEPS })
    const closed = t.api().getContentProps() as Dict
    expect(closed.role).toBe('dialog')
    expect(closed['aria-modal']).toBe('true')
    expect(closed.tabindex).toBe(-1)
    expect(closed['data-state']).toBe('closed')
    expect(closed.hidden).toBe(true)
    expect(closed['aria-labelledby']).toBe((t.api().getTitleProps() as Dict).id)
    expect(closed['aria-describedby']).toBe((t.api().getDescriptionProps() as Dict).id)

    t.service.send({ type: 'OPEN' })
    const open = t.api().getContentProps() as Dict
    expect(open['data-state']).toBe('open')
    expect(open.hidden).toBeUndefined()
  })

  it('锚定步：positioner data-position=anchored，高亮框与箭头显形', () => {
    const t = makeService({ steps: STEPS, defaultOpen: true })
    expect((t.api().getPositionerProps() as Dict)['data-position']).toBe('anchored')
    expect((t.api().getSpotlightProps() as Dict).hidden).toBeUndefined()
    expect((t.api().getArrowProps() as Dict).hidden).toBeUndefined()
    expect(t.api().anchored).toBe(true)
  })

  it('target 为 null 的步：居中、不画高亮框、不出箭头', () => {
    const t = makeService({ steps: STEPS, defaultOpen: true, defaultStep: 2 })
    expect(t.api().anchored).toBe(false)
    expect((t.api().getPositionerProps() as Dict)['data-position']).toBe('center')
    expect((t.api().getSpotlightProps() as Dict).hidden).toBe(true)
    expect((t.api().getArrowProps() as Dict).hidden).toBe(true)
  })

  it('单步 placement 覆盖整份引导的 placement', () => {
    const t = makeService({ steps: STEPS, defaultOpen: true, placement: 'top' })
    expect((t.api().getContentProps() as Dict)['data-placement']).toBe('top')
    t.api().setStep(1)
    expect((t.api().getContentProps() as Dict)['data-placement']).toBe('right')
  })

  it('progress-text 报第几步共几步，可整段替换文案', () => {
    const t = makeService({ steps: STEPS, defaultOpen: true })
    expect(t.api().progressText).toBe('Step 1 of 3')
    t.api().setStep(2)
    expect(t.api().progressText).toBe('Step 3 of 3')
    expect((t.api().getProgressTextProps() as Dict)['aria-live']).toBe('polite')

    const zh = makeService({
      steps: STEPS,
      defaultOpen: true,
      defaultStep: 1,
      translations: { progress: (m, n) => `第 ${m} 步，共 ${n} 步` },
    })
    expect(zh.api().progressText).toBe('第 2 步，共 3 步')
  })

  it('空清单：序号写 0，root 打 data-empty', () => {
    const t = makeService({ steps: [], defaultOpen: true })
    expect(t.api().progressText).toBe('Step 0 of 0')
    expect((t.api().getRootProps() as Dict)['data-empty']).toBe('')
  })

  it('上一步在首步用原生 disabled；下一步在末步打 data-last', () => {
    const t = makeService({ steps: STEPS, defaultOpen: true })
    expect((t.api().getPrevTriggerProps() as Dict).disabled).toBe(true)
    expect((t.api().getNextTriggerProps() as Dict)['data-last']).toBeUndefined()
    t.api().setStep(2)
    expect((t.api().getPrevTriggerProps() as Dict).disabled).toBeUndefined()
    expect((t.api().getNextTriggerProps() as Dict)['data-last']).toBe('')
  })

  it('backdrop 由 showBackdrop 决定收放，恒 aria-hidden', () => {
    const on = makeService({ steps: STEPS, defaultOpen: true })
    expect((on.api().getBackdropProps() as Dict).hidden).toBeUndefined()
    expect((on.api().getBackdropProps() as Dict)['aria-hidden']).toBe('true')
    const off = makeService({ steps: STEPS, defaultOpen: true, showBackdrop: false })
    expect((off.api().getBackdropProps() as Dict).hidden).toBe(true)
  })

  it('close-trigger 的名字取 translations', () => {
    const t = makeService({ steps: STEPS, translations: { close: '关闭引导' } })
    expect((t.api().getCloseTriggerProps() as Dict)['aria-label']).toBe('关闭引导')
  })

  it('清单被改短：步序与当前步一并夹回可用范围', () => {
    const t = makeService({ steps: STEPS, defaultOpen: true, defaultStep: 2 })
    expect(t.api().currentStep?.id).toBe('done')
    t.setProps({ steps: STEPS.slice(0, 2) })
    expect(t.api().step).toBe(1)
    expect(t.api().currentStep?.id).toBe('b')
  })
})

describe('tour 活 DOM：高亮框与键盘', () => {
  it('展开即按目标矩形算出高亮框写进内联 style', async () => {
    const t = mount({ defaultOpen: true })
    await settle()
    // 目标 rect 是 (100,40,200,30)，缺省留白 8
    expect(t.spotlight.style.insetInlineStart).toBe('92px')
    expect(t.spotlight.style.insetBlockStart).toBe('32px')
    expect(t.spotlight.style.inlineSize).toBe('216px')
    expect(t.spotlight.style.blockSize).toBe('46px')
    expect(t.spotlight.hasAttribute('hidden')).toBe(false)
    t.stop()
  })

  it('换步重量：高亮框跟到新目标上', async () => {
    const t = mount({ defaultOpen: true, spotlightPadding: 0 })
    await settle()
    expect(t.spotlight.style.inlineSize).toBe('200px')
    t.api().goToNextStep()
    await settle()
    expect(t.spotlight.style.insetInlineStart).toBe('20px')
    expect(t.spotlight.style.insetBlockStart).toBe('300px')
    expect(t.spotlight.style.inlineSize).toBe('400px')
    t.stop()
  })

  it('走到居中步：高亮框收起、positioner 让位给样式表', async () => {
    const t = mount({ defaultOpen: true })
    await settle()
    t.api().setStep(2)
    await settle()
    expect(t.spotlight.hasAttribute('hidden')).toBe(true)
    expect(t.positioner.getAttribute('data-position')).toBe('center')
    // 上一步留下的内联坐标必须被撤掉，否则居中步会停在上一步的位置上
    expect(t.positioner.style.insetInlineStart).toBe('')
    expect(t.service.context.get('spotlight')).toBeNull()
    t.stop()
  })

  it('窗口尺寸变化重量高亮框', async () => {
    const t = mount({ defaultOpen: true, spotlightPadding: 0 })
    await settle()
    expect(t.spotlight.style.inlineSize).toBe('200px')
    stubRect(t.targets.a, { x: 0, y: 0, width: 640, height: 48 })
    window.dispatchEvent(new Event('resize'))
    await settle()
    expect(t.spotlight.style.inlineSize).toBe('640px')
    expect(t.spotlight.style.blockSize).toBe('48px')
    t.stop()
  })

  it('收起时把 resize 监听器解绑', async () => {
    const add = vi.spyOn(window, 'addEventListener')
    const remove = vi.spyOn(window, 'removeEventListener')
    const t = mount()
    t.api().setOpen(true)
    await settle()
    const added = add.mock.calls.filter(c => c[0] === 'resize')
    expect(added).toHaveLength(1)

    t.api().setOpen(false)
    const removed = remove.mock.calls.filter(c => c[0] === 'resize')
    expect(removed).toHaveLength(1)
    // 解绑的必须是当初挂上去的那一个，否则监听器会一直堆在 window 上
    expect(removed[0]![1]).toBe(added[0]![1])
    t.stop()
  })

  it('收起后几何清空，不留上一轮的框', async () => {
    const t = mount({ defaultOpen: true })
    await settle()
    expect(t.service.context.get('spotlight')).not.toBeNull()
    t.api().skip()
    await settle()
    expect(t.service.context.get('spotlight')).toBeNull()
    expect(t.spotlight.hasAttribute('hidden')).toBe(true)
    t.stop()
  })

  it('enter / Space 落在 content 上时走下一步', async () => {
    const t = mount({ defaultOpen: true })
    await settle()
    const enter = keydown(t.content, 'Enter')
    expect(enter.defaultPrevented).toBe(true)
    expect(t.api().step).toBe(1)
    keydown(t.content, ' ')
    expect(t.api().step).toBe(2)
    t.stop()
  })

  it('enter 落在按钮上时不接管：平台的激活行为说了算', async () => {
    const t = mount({ defaultOpen: true })
    await settle()
    // 按键冒泡到 content，但目标是"上一步"按钮——接管的话按下上一步反而前进一步
    const event = keydown(t.prev, 'Enter')
    expect(event.defaultPrevented).toBe(false)
    expect(t.api().step).toBe(0)
    t.stop()
  })

  it('方向键一概不接管', async () => {
    const t = mount({ defaultOpen: true })
    await settle()
    for (const key of ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight']) {
      const event = keydown(t.content, key)
      expect(event.defaultPrevented).toBe(false)
    }
    expect(t.api().step).toBe(0)
    t.stop()
  })

  it('收起态的 content 不接键盘', async () => {
    const t = mount()
    const event = keydown(t.content, 'Enter')
    expect(event.defaultPrevented).toBe(false)
    expect(t.api().step).toBe(0)
    t.stop()
  })

  it('四个按钮各走各的出口', async () => {
    const onSkip = vi.fn()
    const onComplete = vi.fn()
    const onOpenChange = vi.fn()
    const t = mount({ defaultOpen: true, onSkip, onComplete, onOpenChange })
    await settle()
    t.next.click()
    expect(t.api().step).toBe(1)
    t.prev.click()
    expect(t.api().step).toBe(0)
    t.skip.click()
    expect(onSkip).toHaveBeenCalledWith({ step: 0 })
    expect(t.api().open).toBe(false)

    const t2 = mount({ defaultOpen: true, defaultStep: 2, onComplete })
    await settle()
    t2.next.click()
    expect(onComplete).toHaveBeenCalledWith({ step: 2 })
    expect(t2.api().open).toBe(false)

    const t3 = mount({ defaultOpen: true, onOpenChange })
    await settle()
    t3.close.click()
    expect(t3.api().open).toBe(false)
    // 关闭按钮不是"放弃"：onSkip 不该被它触发
    expect(onSkip).toHaveBeenCalledTimes(1)
    t.stop()
    t2.stop()
    t3.stop()
  })

  it('首步的上一步按钮带原生 disabled，点它没有任何反应', async () => {
    const t = mount({ defaultOpen: true })
    await settle()
    expect(t.prev.disabled).toBe(true)
    t.next.click()
    expect(t.prev.disabled).toBe(false)
    t.stop()
  })
})
