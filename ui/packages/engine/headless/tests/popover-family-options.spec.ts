// @vitest-environment jsdom
// 浮层一族补上的几根轴：Popover 的 initialFocus / restoreFocus / onExitComplete、四个组件的 lazyMount / unmountOnExit、
// 定位微调 crossOffset / flip / boundary 与 Popover 的虚拟锚点，以及 Tooltip / Popconfirm 的标准结构。
import type { Anchor, PositionEnginePort, PositionOptions } from '@xihan-ui/core'
import type { ExitLease } from '@xihan-ui/core/presence'
import type { HoverCardSchema, PopoverSchema, StructureChild, StructureNode, TooltipSchema } from '../src'
import { createRuntimeConfig, createService, normalizeProps } from '@xihan-ui/core'
import { createPresence } from '@xihan-ui/core/presence'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { connectHoverCard, connectPopconfirm, connectPopover, connectTooltip, hoverCardMachine, popoverMachine, tooltipMachine } from '../src'
import { popconfirmStructure } from '../src/popconfirm'
import { tooltipStructure } from '../src/tooltip'

const cleanup: Array<() => void> = []

afterEach(() => {
  for (const dispose of cleanup.splice(0).reverse()) dispose()
  vi.restoreAllMocks()
  document.body.innerHTML = ''
})

/** 等焦点域的落焦重试与定位的 flush：几轮宏任务足够 jsdom 里的 rAF 兜底跑完。 */
async function settle(): Promise<void> {
  for (let i = 0; i < 4; i += 1)
    await new Promise(resolve => setTimeout(resolve, 20))
}

function popoverFixture(initial: PopoverSchema['props'] = {}) {
  const trigger = document.createElement('button')
  trigger.textContent = '打开'
  const positioner = document.createElement('div')
  const content = document.createElement('div')
  content.tabIndex = -1
  const first = document.createElement('button')
  first.textContent = '第一颗'
  const field = document.createElement('input')
  field.dataset.role = 'name'
  content.append(first, field)
  positioner.append(content)
  document.body.append(trigger, positioner)

  const config = createRuntimeConfig()
  const presence = createPresence({ open: false, onRenderedChange: () => {} })
  const leases: ExitLease[] = []
  presence.onBeforeExit(() => leases.push(presence.claimExit('popover exit')))
  const completed: number[] = []
  const runtime = createVanillaRuntime()
  const props = runtime.signal<PopoverSchema['props']>({
    ...initial,
    onExitComplete: () => completed.push(config.layerRegistry.list().length),
  })
  const service = createService(popoverMachine, { runtime, props: props.get })
  service.refs.set('config', config)
  service.refs.set('registerLayer', () => config.layerRegistry.register({
    kind: 'popover',
    node: () => content,
    branches: () => [trigger, positioner],
    isModal: () => service.prop('modal') ?? false,
    surfaces: () => [],
  }))
  service.refs.set('presence', presence)
  service.refs.set('getAnchorEl', () => trigger)
  service.refs.set('getFloatingEl', () => positioner)
  service.refs.set('getContentEl', () => content)
  runtime.start()
  cleanup.push(() => presence.dispose(), () => runtime.stop())
  const open = (): void => {
    trigger.focus()
    service.send({ type: 'OPEN' })
    presence.update(true)
  }
  const close = (): void => {
    service.send({ type: 'CLOSE', src: 'esc' })
    presence.update(false)
  }
  return { completed, config, content, field, first, leases, open, close, presence, props, runtime, service, trigger }
}

describe('popover · onExitComplete', () => {
  it('退场播完、层释放之后才通知，释放那一刻层栈已经空了', async () => {
    const f = popoverFixture()
    f.open()
    await settle()
    f.close()
    expect(f.presence.rendered).toBe(true)
    expect(f.completed).toEqual([])
    f.leases[0]!.done()
    expect(f.completed).toEqual([0])
  })

  it('退场途中重开不通知旧的那一轮；卸载也不通知', async () => {
    const f = popoverFixture()
    f.open()
    await settle()
    f.close()
    f.open()
    f.leases[0]!.done()
    expect(f.completed).toEqual([])
    f.close()
    f.runtime.stop()
    f.leases[1]?.done()
    expect(f.completed).toEqual([])
  })
})

describe('popover · initialFocus / restoreFocus', () => {
  it('initialFocus 选择器命中时焦点落在它上面，不落在 Tab 序列的第一颗按钮', async () => {
    const f = popoverFixture({ initialFocus: '[data-role="name"]' })
    f.open()
    await settle()
    expect(document.activeElement).toBe(f.field)
  })

  it('选择器不匹配（或写错）时退回 Tab 序列，落在第一颗按钮', async () => {
    const miss = popoverFixture({ initialFocus: '[data-role="nope"]' })
    miss.open()
    await settle()
    expect(document.activeElement).toBe(miss.first)
    miss.runtime.stop()
    document.body.innerHTML = ''

    const broken = popoverFixture({ initialFocus: '[[' })
    broken.open()
    await settle()
    expect(document.activeElement).toBe(broken.first)
  })

  it('缺省收起时焦点归还给 trigger；restoreFocus 为 false 时不归还', async () => {
    const f = popoverFixture()
    f.open()
    await settle()
    expect(document.activeElement).toBe(f.first)
    f.close()
    expect(document.activeElement).toBe(f.trigger)
    f.leases[0]!.done()

    document.body.innerHTML = ''
    const off = popoverFixture({ restoreFocus: false })
    off.open()
    await settle()
    expect(document.activeElement).toBe(off.first)
    off.close()
    off.leases[0]!.done()
    await settle()
    expect(document.activeElement).not.toBe(off.trigger)
  })
})

describe('isContentMounted：lazyMount / unmountOnExit', () => {
  function popover(initial: PopoverSchema['props']) {
    const runtime = createVanillaRuntime()
    const props = runtime.signal<PopoverSchema['props']>(initial)
    const service = createService(popoverMachine, { runtime, props: props.get })
    runtime.start()
    cleanup.push(() => runtime.stop())
    return { service, api: () => connectPopover(service, normalizeProps) }
  }

  it('缺省两根轴都关着：没打开过、退场播完都照样挂着（不改变现有行为）', () => {
    const t = popover({})
    expect(t.api().isContentMounted(false)).toBe(true)
    t.service.send({ type: 'OPEN' })
    t.service.send({ type: 'CLOSE' })
    expect(t.api().isContentMounted(false)).toBe(true)
  })

  it('lazyMount：第一次打开前不挂，打开过之后一直挂着', () => {
    const t = popover({ lazyMount: true })
    expect(t.api().isContentMounted(false)).toBe(false)
    t.service.send({ type: 'OPEN' })
    expect(t.api().isContentMounted(true)).toBe(true)
    t.service.send({ type: 'CLOSE' })
    expect(t.api().isContentMounted(false)).toBe(true)
  })

  it('首帧即打开也算打开过', () => {
    const t = popover({ lazyMount: true, defaultOpen: true })
    expect(t.api().isContentMounted(true)).toBe(true)
  })

  it('unmountOnExit：退场闸门还开着（动画在播）照样挂着，闸门落下即卸', () => {
    const t = popover({ unmountOnExit: true })
    t.service.send({ type: 'OPEN' })
    t.service.send({ type: 'CLOSE' })
    expect(t.api().isContentMounted(true)).toBe(true)
    expect(t.api().isContentMounted(false)).toBe(false)
  })

  it('popconfirm 跑同一台机器，挂卸判定同一份', () => {
    const t = popover({ lazyMount: true })
    const api = () => connectPopconfirm(t.service, {}, normalizeProps)
    expect(api().isContentMounted(false)).toBe(false)
    t.service.send({ type: 'OPEN' })
    expect(api().isContentMounted(true)).toBe(true)
  })

  it('hover-card 与 tooltip：展开过才挂，退场播完按 unmountOnExit 卸', () => {
    const runtime = createVanillaRuntime()
    const card = createService(hoverCardMachine, { runtime, props: () => ({ lazyMount: true, unmountOnExit: true }) as HoverCardSchema['props'] })
    const tip = createService(tooltipMachine, { runtime, props: () => ({ lazyMount: true, unmountOnExit: true }) as TooltipSchema['props'] })
    runtime.start()
    cleanup.push(() => runtime.stop())
    expect(connectHoverCard(card, normalizeProps).isContentMounted(false)).toBe(false)
    expect(connectTooltip(tip, normalizeProps).isContentMounted(false)).toBe(false)
    card.send({ type: 'OPEN' })
    tip.send({ type: 'OPEN' })
    expect(connectHoverCard(card, normalizeProps).isContentMounted(true)).toBe(true)
    expect(connectTooltip(tip, normalizeProps).isContentMounted(true)).toBe(true)
    card.send({ type: 'CLOSE' })
    tip.send({ type: 'CLOSE' })
    expect(connectHoverCard(card, normalizeProps).isContentMounted(true)).toBe(true)
    expect(connectHoverCard(card, normalizeProps).isContentMounted(false)).toBe(false)
    expect(connectTooltip(tip, normalizeProps).isContentMounted(false)).toBe(false)
  })
})

describe('定位微调与虚拟锚点', () => {
  function recordingEngine() {
    const calls: Array<{ anchor: Anchor, options: PositionOptions }> = []
    const engine: PositionEnginePort = {
      attach(anchor, _floating, options) {
        calls.push({ anchor, options })
        return () => {}
      },
    }
    return { calls, engine }
  }

  function wire<S extends PopoverSchema | HoverCardSchema | TooltipSchema>(machine: typeof popoverMachine | typeof hoverCardMachine | typeof tooltipMachine, props: S['props']) {
    const { calls, engine } = recordingEngine()
    const trigger = document.createElement('button')
    const floating = document.createElement('div')
    document.body.append(trigger, floating)
    const runtime = createVanillaRuntime()
    const service = createService(machine as typeof popoverMachine, { runtime, props: () => props as PopoverSchema['props'] })
    service.refs.set('position', engine)
    service.refs.set('getAnchorEl', () => trigger)
    service.refs.set('getFloatingEl', () => floating)
    runtime.start()
    cleanup.push(() => runtime.stop())
    return { calls, trigger }
  }

  it('没写 crossOffset / flip / boundary 时不交给引擎，缺省留给引擎自己那一档', async () => {
    const t = wire(popoverMachine, { defaultOpen: true })
    await settle()
    expect(t.calls[0]!.options).not.toHaveProperty('crossOffset')
    expect(t.calls[0]!.options).not.toHaveProperty('flip')
    expect(t.calls[0]!.options).not.toHaveProperty('boundary')
  })

  it.each([
    ['popover', popoverMachine],
    ['hover-card', hoverCardMachine],
    ['tooltip', tooltipMachine],
  ] as const)('%s：crossOffset、flip 与 boundary 原样交给引擎', async (_name, machine) => {
    const boundary = document.createElement('section')
    document.body.append(boundary)
    const t = wire(machine, { defaultOpen: true, crossOffset: -6, flip: false, boundary })
    await settle()
    expect(t.calls[0]!.options.crossOffset).toBe(-6)
    expect(t.calls[0]!.options.flip).toBe(false)
    expect(t.calls[0]!.options.boundary).toBe(boundary)
  })

  it('popover 的虚拟锚点：定位锚在它上面，不往它身上写读屏属性，焦点归还给 trigger', async () => {
    const rect = { x: 120, y: 80, width: 0, height: 0 }
    const anchor = { getBoundingClientRect: () => rect }
    const f = popoverFixture({ anchor })
    const { calls, engine } = recordingEngine()
    f.service.refs.set('position', engine)
    f.open()
    await settle()
    expect(calls.at(-1)!.anchor).toBe(anchor)
    expect(Object.keys(anchor)).toEqual(['getBoundingClientRect'])
    f.close()
    expect(document.activeElement).toBe(f.trigger)
  })
})

describe('标准结构', () => {
  const flat = (nodes: readonly StructureChild[]): StructureNode[] => nodes.flatMap(node => ('part' in node ? [node, ...flat(node.children ?? [])] : []))
  const parts = (nodes: readonly StructureChild[]): string[] => flat(nodes).map(node => node.part)

  it('tooltip：触发器、定位层、content 里先是提示文字再是箭头', () => {
    const nodes = tooltipStructure({ triggerText: '保存', content: '写入草稿箱' })
    expect(parts(nodes)).toEqual(['trigger', 'positioner', 'content', 'text', 'arrow'])
    expect(flat(nodes).find(node => node.part === 'trigger')).toMatchObject({ tag: 'button', text: '保存' })
    expect(flat(nodes).find(node => node.part === 'text')).toMatchObject({ tag: 'span', text: '写入草稿箱' })
  })

  it('tooltip：插槽压过文字；委托模式下触发器是容器、不铺 text', () => {
    const slotted = tooltipStructure({ triggerText: '保存', content: '文字', slotted: name => name === 'content' || name === 'trigger' })
    expect(flat(slotted).find(node => node.part === 'text')?.slot).toEqual({ name: 'content' })
    expect(flat(slotted).find(node => node.part === 'trigger')?.slot).toEqual({ name: 'trigger' })
    const delegated = tooltipStructure({ content: '不用它', delegated: true })
    expect(parts(delegated)).toEqual(['trigger', 'positioner', 'content', 'arrow'])
    expect(delegated[0]).toMatchObject({ tag: 'div' })
  })

  it('popconfirm：标题、说明、取消在确认之前、箭头在末尾；两颗钮缺省取语言包', () => {
    const nodes = popconfirmStructure({ triggerText: '删除', title: '删除这条？', description: '不可恢复。' })
    expect(parts(nodes)).toEqual(['trigger', 'positioner', 'content', 'title', 'description', 'cancel-trigger', 'confirm-trigger', 'arrow'])
    expect(flat(nodes).find(node => node.part === 'cancel-trigger')?.text).toBe('Cancel')
    expect(flat(nodes).find(node => node.part === 'confirm-trigger')?.text).toBe('OK')
  })

  it('popconfirm：没给标题、说明就不铺；按钮文字以 confirmText / cancelText 优先，其次 translations', () => {
    const nodes = popconfirmStructure({ confirmText: '删除', translations: { cancel: '算了' } })
    expect(parts(nodes)).toEqual(['trigger', 'positioner', 'content', 'cancel-trigger', 'confirm-trigger', 'arrow'])
    expect(flat(nodes).find(node => node.part === 'cancel-trigger')?.text).toBe('算了')
    expect(flat(nodes).find(node => node.part === 'confirm-trigger')?.text).toBe('删除')
  })
})
