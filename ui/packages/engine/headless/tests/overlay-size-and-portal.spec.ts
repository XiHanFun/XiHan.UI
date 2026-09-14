// @vitest-environment jsdom
// 锚定浮层的三件事：落定那一侧的可用高度要交到皮肤手上；条目集合类浮层还要拿到锚点宽度；
// side-nav 的弹出面板有独立定位层，坐标不再写在面板身上。
import type { ComboboxSchema } from '../src/combobox'
import type { SelectSchema } from '../src/select'
import type { SideNavSchema } from '../src/side-nav'
import type { TreeSelectSchema } from '../src/tree-select'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it } from 'vitest'
import { comboboxMachine, connectCombobox } from '../src/combobox'
import { connectHoverCard, hoverCardMachine } from '../src/hover-card'
import { connectSelect, selectMachine } from '../src/select'
import { connectSideNav, sideNavMachine } from '../src/side-nav'
import { connectTour, tourMachine } from '../src/tour'
import { connectTreeSelect, treeSelectMachine } from '../src/tree-select'

function select(props: Partial<SelectSchema['props']>) {
  const runtime = createVanillaRuntime()
  const service = createService(selectMachine, { props: () => props, runtime })
  runtime.start()
  return { service, api: () => connectSelect(service, normalizeProps) }
}

function combobox(props: Partial<ComboboxSchema['props']>) {
  const runtime = createVanillaRuntime()
  const service = createService(comboboxMachine, { props: () => props, runtime })
  runtime.start()
  return { service, api: () => connectCombobox(service, normalizeProps) }
}

function treeSelect(props: Partial<TreeSelectSchema['props']>) {
  const runtime = createVanillaRuntime()
  const service = createService(treeSelectMachine, { props: () => props, runtime })
  runtime.start()
  return { service, api: () => connectTreeSelect(service, normalizeProps) }
}

function hoverCard(props: Record<string, unknown>) {
  const runtime = createVanillaRuntime()
  const service = createService(hoverCardMachine, { props: () => props, runtime })
  runtime.start()
  return { service, api: () => connectHoverCard(service, normalizeProps) }
}

function sideNav(props: Partial<SideNavSchema['props']>) {
  const runtime = createVanillaRuntime()
  const service = createService(sideNavMachine, { props: () => props, runtime })
  runtime.start()
  return { service, api: () => connectSideNav(service, normalizeProps) }
}

describe('可用高度交到皮肤手上', () => {
  it('引擎给了 availableHeight 就写成私有槽', () => {
    const { service, api } = select({ defaultOpen: true })
    service.context.set('position', { x: 10, y: 20, placement: 'bottom-start', hidden: false, availableHeight: 240 })
    const style = (api().getPositionerProps() as Record<string, unknown>).style as Record<string, string>
    expect(style['--xh-_select-available-h']).toBe('240px')
  })

  it('引擎没算出来就留空，皮肤退回自己那档上限', () => {
    const { service, api } = select({ defaultOpen: true })
    service.context.set('position', { x: 0, y: 0, placement: 'bottom-start', hidden: false })
    const style = (api().getPositionerProps() as Record<string, unknown>).style as Record<string, string>
    expect(style['--xh-_select-available-h']).toBe('')
  })
})

describe('锚点宽度交到皮肤手上', () => {
  const positionerStyle = (props: Record<string, unknown>) =>
    (props as Record<string, unknown>).style as Record<string, string>

  it('select 把 anchorWidth 写成私有槽', () => {
    const { service, api } = select({ defaultOpen: true })
    service.context.set('position', { x: 10, y: 20, placement: 'bottom-start', hidden: false, anchorWidth: 320 })
    expect(positionerStyle(api().getPositionerProps())['--xh-_select-anchor-w']).toBe('320px')
  })

  it('combobox 把 anchorWidth 写成私有槽', () => {
    const { service, api } = combobox({ defaultOpen: true })
    service.context.set('position', { x: 0, y: 0, placement: 'bottom-start', hidden: false, anchorWidth: 280 })
    expect(positionerStyle(api().getPositionerProps())['--xh-_combobox-anchor-w']).toBe('280px')
  })

  it('tree-select 把 anchorWidth 写成私有槽', () => {
    const { service, api } = treeSelect({ defaultOpen: true })
    service.context.set('position', { x: 0, y: 0, placement: 'bottom-start', hidden: false, anchorWidth: 240 })
    expect(positionerStyle(api().getPositionerProps())['--xh-_tree-select-anchor-w']).toBe('240px')
  })

  it('引擎没算出来就留空，皮肤退回自己那档最小宽', () => {
    const { service, api } = select({ defaultOpen: true })
    service.context.set('position', { x: 0, y: 0, placement: 'bottom-start', hidden: false })
    expect(positionerStyle(api().getPositionerProps())['--xh-_select-anchor-w']).toBe('')
  })

  it('锚点宽度为 0 也照发，max() 取静态档', () => {
    const { service, api } = select({ defaultOpen: true })
    service.context.set('position', { x: 0, y: 0, placement: 'bottom-start', hidden: false, anchorWidth: 0 })
    expect(positionerStyle(api().getPositionerProps())['--xh-_select-anchor-w']).toBe('0px')
  })
})

describe('side-nav 弹出面板的定位层', () => {
  const collection = [
    { value: 'docs', label: 'Docs', children: [{ value: 'guide', label: 'Guide' }] },
    { value: 'blog', label: 'Blog' },
  ]

  it('折叠态下顶层分支报成弹出面板', () => {
    const { api } = sideNav({ collection, collapsed: true })
    expect(api().isPopoutPanel('docs')).toBe(true)
    // 叶子不是面板，作者不该给它渲染定位层
    expect(api().isPopoutPanel('guide')).toBe(false)
  })

  it('展开态下没有弹出面板，一切都是平铺子层', () => {
    const { api } = sideNav({ collection, collapsed: false })
    expect(api().isPopoutPanel('docs')).toBe(false)
  })

  it('坐标落在定位层上，面板自己不再写 fixed', () => {
    const { service, api } = sideNav({ collection, collapsed: true })
    service.send({ type: 'POPOUT.OPEN', value: 'docs', focus: 'none' })
    service.context.set('popoutPlacements', { docs: { x: 56, y: 12, placement: 'right-start', hidden: false } })

    const positioner = api().getPopoutPositionerProps({ value: 'docs' }) as Record<string, unknown>
    const style = positioner.style as Record<string, string>
    expect(style.position).toBe('fixed')
    expect(style.left).toBe('56px')
    expect(style.top).toBe('12px')

    const panel = api().getBranchContentProps({ value: 'docs' }) as Record<string, unknown>
    expect(panel.style).toBeUndefined()
    // 面板与定位层同时收起，读屏与只查面板的作者看到的是同一个事实
    expect(panel.hidden).toBeUndefined()
    expect(positioner.hidden).toBeUndefined()
  })

  it('可用高度写成私有槽，交给面板限高', () => {
    const { service, api } = sideNav({ collection, collapsed: true })
    service.send({ type: 'POPOUT.OPEN', value: 'docs', focus: 'none' })
    service.context.set('popoutPlacements', { docs: { x: 56, y: 12, placement: 'right-start', hidden: false, availableHeight: 320 } })
    const style = (api().getPopoutPositionerProps({ value: 'docs' }) as Record<string, unknown>).style as Record<string, string>
    expect(style['--xh-_side-nav-available-h']).toBe('320px')
  })

  it('贴边时引擎回报 0，当作没算出来——写进 min() 会把面板压成零高', () => {
    const { service, api } = sideNav({ collection, collapsed: true })
    service.send({ type: 'POPOUT.OPEN', value: 'docs', focus: 'none' })
    service.context.set('popoutPlacements', { docs: { x: 56, y: 12, placement: 'right-start', hidden: false, availableHeight: 0 } })
    const style = (api().getPopoutPositionerProps({ value: 'docs' }) as Record<string, unknown>).style as Record<string, string>
    expect(style['--xh-_side-nav-available-h']).toBe('')
  })

  it('小到放不下几个条目也退回皮肤那档，不给一条缝', () => {
    const { service, api } = sideNav({ collection, collapsed: true })
    service.send({ type: 'POPOUT.OPEN', value: 'docs', focus: 'none' })
    service.context.set('popoutPlacements', { docs: { x: 56, y: 12, placement: 'right-start', hidden: false, availableHeight: 40 } })
    const style = (api().getPopoutPositionerProps({ value: 'docs' }) as Record<string, unknown>).style as Record<string, string>
    expect(style['--xh-_side-nav-available-h']).toBe('')
  })

  it('收起时把高度槽一并清掉，折叠开关来回切不残留限高', () => {
    const { api } = sideNav({ collection, collapsed: true })
    const style = (api().getPopoutPositionerProps({ value: 'docs' }) as Record<string, unknown>).style as Record<string, string>
    expect(style['--xh-_side-nav-available-h']).toBe('')
  })
  it('收起时定位层逐属性清坐标，不残留 fixed', () => {
    const { api } = sideNav({ collection, collapsed: true })
    const positioner = api().getPopoutPositionerProps({ value: 'docs' }) as Record<string, unknown>
    expect((positioner.style as Record<string, string>).position).toBe('')
    expect(positioner.hidden).toBe(true)
    expect((api().getBranchContentProps({ value: 'docs' }) as Record<string, unknown>).hidden).toBe(true)
  })
})

describe('hover-card 的可用高度', () => {
  it('引擎给了就写成私有槽——机器没开 size 通道时这里恒空，皮肤的 min() 会变成死代码', () => {
    const { service, api } = hoverCard({ defaultOpen: true })
    service.context.set('position', { x: 10, y: 20, placement: 'bottom', hidden: false, availableHeight: 300 })
    const style = (api().getPositionerProps() as Record<string, unknown>).style as Record<string, string>
    expect(style['--xh-_hover-card-available-h']).toBe('300px')
  })

  it('贴边归零当作没算出来', () => {
    const { service, api } = hoverCard({ defaultOpen: true })
    service.context.set('position', { x: 0, y: 0, placement: 'bottom', hidden: false, availableHeight: 0 })
    const style = (api().getPositionerProps() as Record<string, unknown>).style as Record<string, string>
    expect(style['--xh-_hover-card-available-h']).toBe('')
  })
})

describe('引导气泡的可用高度', () => {
  const steps = [
    { id: 'a', target: 'body', title: '第一步', description: '正文' },
    { id: 'b', title: '居中步', description: '没有锚点' },
  ]

  function tour(index: number) {
    const runtime = createVanillaRuntime()
    const service = createService(tourMachine, {
      props: () => ({ steps, defaultValue: index, defaultOpen: true }),
      runtime,
    })
    runtime.start()
    return { service, api: () => connectTour(service, normalizeProps) }
  }

  it('锚定步把可用高度写成私有槽', () => {
    const { service, api } = tour(0)
    service.context.set('position', { x: 10, y: 20, placement: 'bottom', hidden: false, availableHeight: 400 })
    const style = (api().getPositionerProps() as Record<string, unknown>).style as Record<string, string>
    expect(style['--xh-_tour-available-h']).toBe('400px')
  })

  it('居中步没有引擎结果，发空串把上一步的高度撤掉', () => {
    const { service, api } = tour(1)
    service.context.set('position', { x: 10, y: 20, placement: 'bottom', hidden: false, availableHeight: 400 })
    const style = (api().getPositionerProps() as Record<string, unknown>).style as Record<string, string>
    expect(style['--xh-_tour-available-h']).toBe('')
  })

  it('只够放下骨架、放不下正文时也退回静态档', () => {
    const { service, api } = tour(0)
    service.context.set('position', { x: 0, y: 0, placement: 'bottom', hidden: false, availableHeight: 120 })
    const style = (api().getPositionerProps() as Record<string, unknown>).style as Record<string, string>
    expect(style['--xh-_tour-available-h']).toBe('')
  })

  it('贴边归零当作没算出来', () => {
    const { service, api } = tour(0)
    service.context.set('position', { x: 0, y: 0, placement: 'bottom', hidden: false, availableHeight: 0 })
    const style = (api().getPositionerProps() as Record<string, unknown>).style as Record<string, string>
    expect(style['--xh-_tour-available-h']).toBe('')
  })
})

describe('side-nav 换枝不闪旧位置', () => {
  const collection = [
    { value: 'docs', label: 'Docs', children: [{ value: 'guide', label: 'Guide' }] },
    { value: 'blog', label: 'Blog', children: [{ value: 'news', label: 'News' }] },
  ]

  it('换枝时新面板藏到拿到新坐标为止，旧面板的坐标留着播退场', () => {
    const { service, api } = sideNav({ collection, collapsed: true })
    service.send({ type: 'POPOUT.OPEN', value: 'docs', focus: 'none' })
    service.context.set('popoutPlacements', { docs: { x: 56, y: 12, placement: 'right-start', hidden: false } })

    service.send({ type: 'POPOUT.OPEN', value: 'blog', focus: 'none' })
    const positioner = api().getPopoutPositionerProps({ value: 'blog' }) as Record<string, unknown>
    // 坐标已作废：落位信号撤掉，皮肤基线据此藏着——否则它会在 docs 那一枝的位置画一帧
    expect(positioner['data-positioned']).toBeUndefined()
    // 旧枝名下的账不动：它收起中，靠这份坐标留在原地播完退场
    const previous = api().getPopoutPositionerProps({ value: 'docs' }) as Record<string, unknown>
    expect(previous['data-state']).toBe('closed')
    expect(previous['data-positioned']).toBe('')
    expect((previous.style as Record<string, string>).left).toBe('56px')
    // 连接层给的 hidden 仍跟着展开态走，押后到退场结束是适配器闸门的事
    expect(previous.hidden).toBe(true)
  })

  it('重开同一枝不作废——坐标还是它自己的', () => {
    const { service, api } = sideNav({ collection, collapsed: true })
    service.send({ type: 'POPOUT.OPEN', value: 'docs', focus: 'none' })
    service.context.set('popoutPlacements', { docs: { x: 56, y: 12, placement: 'right-start', hidden: false } })
    service.send({ type: 'POPOUT.OPEN', value: 'docs', focus: 'none' })
    const positioner = api().getPopoutPositionerProps({ value: 'docs' }) as Record<string, unknown>
    expect(positioner['data-positioned']).toBe('')
  })
})
