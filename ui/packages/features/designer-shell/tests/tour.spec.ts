// @vitest-environment jsdom

// 新手引导：步骤的取值与合并、引导零件排出的各步（通用步骤与交进来的步骤按 order 排、目标面板隐藏就跳过）、
// 开始与收起时派发的 tour-end，以及内置命令 start-tour。
import type { DesignerFrameRegion, DesignerTourEventMap, DesignerTourStepView, XhDesignerFrameElement, XhDesignerTourElement } from '../src'
import { DesignerExtensionError } from '@xihan-ui/designer-kit'
import { setXhConfig } from '@xihan-ui/web-components'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { collectTourSteps, defineDesignerShell, DESIGNER_COMMANDS_EN_US, DESIGNER_TOUR_EN_US, designerShellCommands, resolveTourSteps, tourDoneOf } from '../src'
import { designerShellZhCN } from '../src/locale'

defineDesignerShell()

afterEach(() => {
  document.body.innerHTML = ''
  setXhConfig({})
})

const REGIONS: readonly DesignerFrameRegion[] = [
  { name: 'menubar', position: 'menubar' },
  { name: 'toolbar', position: 'top' },
  { name: 'palette', position: 'start', title: '物料' },
  { name: 'canvas', position: 'center' },
  { name: 'properties', position: 'end', title: '属性' },
  { name: 'issues', position: 'bottom', title: '问题' },
  { name: 'status', position: 'status' },
]

type TourHost = HTMLElement & { steps?: { id: string, target: (() => HTMLElement | null) | null }[], open?: boolean, value?: number }

async function mount(setup: (tour: XhDesignerTourElement, frame: XhDesignerFrameElement) => void = () => {}): Promise<{ tour: XhDesignerTourElement, frame: XhDesignerFrameElement, ends: DesignerTourEventMap['tour-end']['detail'][] }> {
  const designer = document.createElement('div')
  const frame = document.createElement('xh-designer-frame')
  frame.regions = REGIONS
  const toolbar = document.createElement('div')
  toolbar.slot = 'toolbar'
  const status = document.createElement('div')
  status.slot = 'status'
  status.textContent = '就绪'
  frame.append(toolbar, status)
  const tour = document.createElement('xh-designer-tour')
  tour.frame = frame
  designer.append(frame, tour)
  setup(tour, frame)
  document.body.append(designer)
  await frame.updateComplete
  await tour.updateComplete
  const ends: DesignerTourEventMap['tour-end']['detail'][] = []
  tour.addEventListener('tour-end', event => ends.push((event as DesignerTourEventMap['tour-end']).detail))
  return { tour, frame, ends }
}

function host(tour: XhDesignerTourElement): TourHost {
  return tour.querySelector<TourHost>('xh-tour')!
}

describe('引导的步骤', () => {
  it('resolveTourSteps 按上下文取文字、过一遍 when，顺序不变', () => {
    const steps = resolveTourSteps<{ readonly: boolean }>([
      { id: 'flow.edges', target: { panel: 'palette' }, title: c => (c.readonly ? '看连线' : '连线'), description: '从端口拖出', order: 110 },
      { id: 'flow.edit', title: '编辑', description: '改', when: c => !c.readonly },
    ], { readonly: true })
    expect(steps).toEqual([{ id: 'flow.edges', target: { panel: 'palette' }, title: '看连线', description: '从端口拖出', order: 110 }])
  })

  it('collectTourSteps 保持登记顺序；id 重名或用了 shell. 前缀时抛 DesignerExtensionError，名字空间 tour-step', () => {
    const step = { id: 'flow.edges', title: 'a', description: 'b' }
    expect(collectTourSteps([{ id: 'flow', tourSteps: [step] }, { id: 'none' }, { id: 'acme', tourSteps: [{ ...step, id: 'acme.intro' }] }]).map(item => item.id)).toEqual(['flow.edges', 'acme.intro'])
    const duplicate = (): unknown => collectTourSteps([{ id: 'flow', tourSteps: [step] }, { id: 'acme', tourSteps: [step] }])
    expect(duplicate).toThrow(DesignerExtensionError)
    expect(duplicate).toThrow(/tour-step/)
    expect(() => collectTourSteps([{ id: 'acme', tourSteps: [{ ...step, id: 'shell.welcome' }] }])).toThrow(/@xihan-ui\/designer-shell/)
  })

  it('tourDoneOf 只认设置里 help.tourDone 为 true', () => {
    expect([tourDoneOf(undefined), tourDoneOf({ 'help.tourDone': true }), tourDoneOf({ 'help.tourDone': 'yes' })]).toEqual([false, true, false])
  })
})

describe('<xh-designer-tour>', () => {
  it('通用步骤与交进来的步骤按 order 排；目标面板隐藏、区不在外框里、命令没有按钮的那一步跳过', async () => {
    const product: DesignerTourStepView[] = [{ id: 'flow.edges', target: { panel: 'palette', part: 'tree' }, title: '连线', description: '拖出连线', order: 25 }, { id: 'flow.end', title: '结束', description: '好了', order: 100 }]
    const { tour, frame } = await mount((element) => {
      element.steps = product
    })
    // 工具栏上没有设置命令的按钮，shell.settings 跳过
    expect(tour.plannedSteps().map(step => step.id)).toEqual(['shell.welcome', 'shell.toolbar', 'shell.palette', 'flow.edges', 'shell.canvas', 'shell.properties', 'shell.issues', 'shell.status', 'flow.end'])
    frame.layout = { version: 1, hidden: ['issues', 'palette'] }
    await frame.updateComplete
    expect(tour.plannedSteps().map(step => step.id)).toEqual(['shell.welcome', 'shell.toolbar', 'shell.canvas', 'shell.properties', 'shell.status', 'flow.end'])
    tour.builtin = false
    expect(tour.plannedSteps().map(step => step.id)).toEqual(['flow.end'])
  })

  it('菜单栏显示着时才有 shell.settings，目标是菜单栏区', async () => {
    expect((await mount()).tour.plannedSteps().at(-1)!.id).toBe('shell.status')
    document.body.replaceChildren()
    const { tour } = await mount((_, frame) => {
      const menubar = document.createElement('div')
      menubar.slot = 'menubar'
      menubar.textContent = '文件'
      frame.append(menubar)
    })
    await tour.frame!.updateComplete
    expect(tour.plannedSteps().at(-1)!.id).toBe('shell.settings')
    expect(tour.start()).toBe(true)
    expect(host(tour).steps!.at(-1)!.target!()).toBe(tour.frame!.querySelector('[data-part="region"][data-region="menubar"]'))
  })

  it('目标是命令的步骤：工具栏上有它的按钮时才走；按钮收进「更多」时目标是「更多」钮', async () => {
    const { tour } = await mount((element, frame) => {
      element.steps = [{ id: 'acme.save', target: { command: 'save' }, order: 950, title: '保存', description: '保存模板' }]
      const toolbar = frame.querySelector('[slot="toolbar"]')!
      toolbar.innerHTML = '<xh-toolbar><div data-xh-part="root"><button value="save">保存</button><button data-xh-part="overflow-trigger"></button></div></xh-toolbar>'
    })
    expect(tour.plannedSteps().at(-1)!.id).toBe('acme.save')
    expect(tour.start()).toBe(true)
    const steps = host(tour).steps!
    const button = tour.frame!.querySelector<HTMLButtonElement>('button[value="save"]')!
    expect(steps.at(-1)!.target!()).toBe(button)
    button.hidden = true
    expect(steps.at(-1)!.target!()?.matches('[data-xh-part="overflow-trigger"], [data-part="overflow-trigger"]')).toBe(true)
  })

  it('start() 从第一步开始：把各步交给 xh-tour（目标是现取的函数），按步数铺圆点，钮上写文案；没有能走的步骤返回 false', async () => {
    const { tour, frame } = await mount()
    expect(tour.running).toBe(false)
    expect(tour.start()).toBe(true)
    const inner = host(tour)
    expect([inner.open, inner.value, tour.running]).toEqual([true, 0, true])
    const steps = inner.steps!
    expect(steps[0]!.target).toBeNull()
    expect(steps.find(step => step.id === 'shell.palette')!.target!()).toBe(frame.querySelector('[data-part="region"][data-region="palette"]'))
    expect(steps.find(step => step.id === 'shell.canvas')!.target!()).toBe(frame.querySelector('[data-part="region"][data-region="canvas"]'))
    expect(tour.querySelectorAll('[data-xh-part="progress-dot"], [data-part="progress-dot"]')).toHaveLength(steps.length)
    expect(['prev-trigger', 'next-trigger', 'skip-trigger'].map(part => tour.querySelector(`[data-xh-part="${part}"], [data-part="${part}"]`)!.textContent)).toEqual([DESIGNER_TOUR_EN_US.prev, DESIGNER_TOUR_EN_US.next, DESIGNER_TOUR_EN_US.skip])
    tour.builtin = false
    tour.steps = []
    expect(tour.start()).toBe(false)
  })

  it('换到一步之前让外框亮出目标面板；最后一步时下一步钮写「完成」', async () => {
    const { tour, frame } = await mount()
    const reveal = vi.spyOn(frame, 'revealPanel')
    tour.start()
    const inner = host(tour)
    const index = inner.steps!.findIndex(step => step.id === 'shell.properties')
    inner.dispatchEvent(new CustomEvent('value-change', { detail: { value: index }, bubbles: true }))
    await tour.updateComplete
    expect(reveal).toHaveBeenLastCalledWith('properties')
    expect(inner.value).toBe(index)
    inner.dispatchEvent(new CustomEvent('value-change', { detail: { value: inner.steps!.length - 1 }, bubbles: true }))
    expect(document.querySelector('[data-xh-part="next-trigger"], [data-part="next-trigger"]')!.textContent).toBe(DESIGNER_TOUR_EN_US.finish)
  })

  it('收起时派发 tour-end：走完是 complete，跳过是 skip，关闭或 stop() 是 close；step 是收起时那一步', async () => {
    const { tour, ends } = await mount()
    const inner = host(tour)
    tour.start()
    inner.dispatchEvent(new CustomEvent('complete', { detail: { step: 0 }, bubbles: true }))
    inner.dispatchEvent(new CustomEvent('open-change', { detail: { open: false }, bubbles: true }))
    tour.start()
    inner.dispatchEvent(new CustomEvent('value-change', { detail: { value: 2 }, bubbles: true }))
    inner.dispatchEvent(new CustomEvent('skip', { detail: { step: 2 }, bubbles: true }))
    inner.dispatchEvent(new CustomEvent('open-change', { detail: { open: false }, bubbles: true }))
    tour.start()
    tour.stop()
    expect(ends).toEqual([{ reason: 'complete', step: 'shell.welcome' }, { reason: 'skip', step: 'shell.palette' }, { reason: 'close', step: 'shell.welcome' }])
    expect([inner.open, tour.running]).toEqual([false, false])
  })

  it('文案取全局配置里 xh-designer-tour 那一桶', async () => {
    setXhConfig({ translations: designerShellZhCN.translations })
    const { tour } = await mount()
    tour.start()
    await tour.updateComplete
    const zh = designerShellZhCN.translations!['xh-designer-tour']!
    expect(host(tour).steps!.map(step => (step as unknown as { title: string }).title).slice(0, 2)).toEqual([zh.welcomeTitle, zh.toolbarTitle])
    expect(document.querySelector('[data-xh-part="skip-trigger"], [data-part="skip-trigger"]')!.textContent).toBe(zh.skip)
  })
})

describe('内置命令 start-tour', () => {
  it('给了 startTour 才有：文字取共用一桶的 startTour，不上工具栏，执行即开始引导', () => {
    const startTour = vi.fn()
    const commands = designerShellCommands({ translations: () => DESIGNER_COMMANDS_EN_US, startTour })
    const command = commands.find(item => item.id === 'start-tour')!
    expect([typeof command.label === 'function' ? command.label({}) : command.label, command.placement]).toEqual([DESIGNER_COMMANDS_EN_US.startTour, ['menubar:help']])
    command.run!({})
    expect(startTour).toHaveBeenCalledTimes(1)
    expect(designerShellCommands({ translations: () => DESIGNER_COMMANDS_EN_US }).some(item => item.id === 'start-tour')).toBe(false)
  })
})
