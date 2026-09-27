// @vitest-environment jsdom
//
// tabs 的关闭钮与面板内容的挂载时机：close-trigger 与 Delete / Backspace 发同一个关闭意图；
// lazyMount / unmountOnExit 只管面板里的内容，面板节点本身常在。
import type { TabsSchema } from '../src/tabs'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it, vi } from 'vitest'
import { connectTabs, tabsAnatomy, tabsMachine } from '../src/tabs'

type Dict = Record<string, unknown>
type Props = TabsSchema['props']

const COLLECTION = [
  { value: 'overview', label: '概览' },
  { value: 'api', label: 'API', disabled: true },
  { value: 'logs', label: '日志' },
]

function makeTabs(initial: Partial<Props> = {}) {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>({ collection: COLLECTION, ...initial } as Props)
  const service = createService(tabsMachine, { runtime, props: () => props.get() })
  runtime.start()
  return {
    service,
    api: () => connectTabs(service, normalizeProps),
    setProps: (next: Partial<Props>) => props.set(prev => ({ ...prev, ...next })),
  }
}

function click(props: Dict): void {
  (props.onClick as () => void)()
}

describe('标签页 · 关闭钮', () => {
  it('是解剖里的独立部件，排在 trigger 之后', () => {
    const names = tabsAnatomy.parts
    expect(names).toContain('close-trigger')
    expect(names.indexOf('close-trigger')).toBe(names.indexOf('trigger') + 1)
  })

  it('closable 关闭时整枚收起', () => {
    const close = makeTabs().api().getCloseTriggerProps({ value: 'overview' }) as Dict
    expect(close.hidden).toBe(true)
  })

  it('鼠标与触屏专用：对读屏隐藏、不占 Tab 位，接 Action Control icon 档 ghost 面 xs 档', () => {
    const close = makeTabs({ closable: true }).api().getCloseTriggerProps({ value: 'overview' }) as Dict
    expect(close.hidden).toBeUndefined()
    expect(close.type).toBe('button')
    expect(close['aria-hidden']).toBe(true)
    expect(close.tabIndex).toBe(-1)
    expect(close['data-xh-action-control']).toBe('')
    expect(close['data-xh-action-profile']).toBe('icon')
    expect(close['data-xh-action-variant']).toBe('ghost')
    expect(close['data-xh-action-size']).toBe('xs')
  })

  it('点按发 onTabClose，带上被关的标签与剩余标签序；库不改标签序', () => {
    const onTabClose = vi.fn()
    const t = makeTabs({ closable: true, defaultValue: 'overview', onTabClose })
    click(t.api().getCloseTriggerProps({ value: 'logs' }) as Dict)
    expect(onTabClose).toHaveBeenCalledTimes(1)
    expect(onTabClose).toHaveBeenCalledWith({ value: 'logs', values: ['overview', 'api'] })
    // 选中不动：关掉的是不是选中标签、选中改到哪一个都由数据源决定
    expect(t.api().value).toBe('overview')
    expect(t.api().collection.map(n => n.value)).toEqual(['overview', 'api', 'logs'])
  })

  it('所属标签禁用时钮留在原地但按不动', () => {
    const onTabClose = vi.fn()
    const t = makeTabs({ closable: true, onTabClose })
    const close = t.api().getCloseTriggerProps({ value: 'api' }) as Dict
    expect(close.hidden).toBeUndefined()
    expect(close.disabled).toBe(true)
    expect(close['data-disabled']).toBe('')
    click(close)
    expect(onTabClose).not.toHaveBeenCalled()
  })

  it('部件上声明的禁用压过 collection', () => {
    const onTabClose = vi.fn()
    const t = makeTabs({ closable: true, onTabClose })
    const close = t.api().getCloseTriggerProps({ value: 'overview', disabled: true }) as Dict
    expect(close.disabled).toBe(true)
    click(close)
    expect(onTabClose).not.toHaveBeenCalled()
  })

  it('closable 关闭时点按也不发', () => {
    const onTabClose = vi.fn()
    const t = makeTabs({ onTabClose })
    click(t.api().getCloseTriggerProps({ value: 'logs' }) as Dict)
    expect(onTabClose).not.toHaveBeenCalled()
  })

  it('焦点在标签上按 Delete 与点关闭钮发同一个意图', () => {
    const onTabClose = vi.fn()
    const t = makeTabs({ closable: true, onTabClose })
    t.service.send({ type: 'TRIGGER.FOCUS', value: 'logs' })
    const preventDefault = vi.fn()
    const list = document.createElement('div')
    ;((t.api().getListProps() as Dict).onKeydown as (e: KeyboardEvent) => void)({
      key: 'Delete',
      currentTarget: list,
      target: list,
      preventDefault,
    } as unknown as KeyboardEvent)
    expect(preventDefault).toHaveBeenCalled()
    expect(onTabClose).toHaveBeenCalledWith({ value: 'logs', values: ['overview', 'api'] })
  })
})

describe('标签页 · 面板内容的挂载时机', () => {
  it('缺省全部面板都渲染内容', () => {
    const t = makeTabs({ defaultValue: 'overview' })
    expect(COLLECTION.map(n => t.api().isContentMounted(n.value))).toEqual([true, true, true])
  })

  it('lazyMount：没被选中过的面板不渲染，选中过的一直留着', () => {
    const t = makeTabs({ defaultValue: 'overview', lazyMount: true })
    expect(t.api().isContentMounted('overview')).toBe(true)
    expect(t.api().isContentMounted('logs')).toBe(false)

    t.api().setValue('logs')
    expect(t.api().isContentMounted('logs')).toBe(true)
    // 被选走的首个面板仍渲染：它被选中过
    expect(t.api().isContentMounted('overview')).toBe(true)
  })

  it('unmountOnExit：被选走的面板卸掉内容，从没选中过的照常渲染', () => {
    const t = makeTabs({ defaultValue: 'overview', unmountOnExit: true })
    expect(t.api().isContentMounted('logs')).toBe(true)

    t.api().setValue('logs')
    expect(t.api().isContentMounted('overview')).toBe(false)
    expect(t.api().isContentMounted('logs')).toBe(true)
  })

  it('两者同开：只有选中面板有内容', () => {
    const t = makeTabs({ defaultValue: 'overview', lazyMount: true, unmountOnExit: true })
    expect(COLLECTION.map(n => t.api().isContentMounted(n.value))).toEqual([true, false, false])
    t.api().setValue('logs')
    expect(COLLECTION.map(n => t.api().isContentMounted(n.value))).toEqual([false, false, true])
  })

  it('受控值由外面换过去也算被选中过', () => {
    const t = makeTabs({ value: 'overview', lazyMount: true })
    expect(t.api().isContentMounted('logs')).toBe(false)
    t.setProps({ value: 'logs' })
    t.setProps({ value: 'overview' })
    expect(t.api().isContentMounted('logs')).toBe(true)
  })

  it('无选中时 lazyMount 下一个面板都不渲染', () => {
    const t = makeTabs({ lazyMount: true })
    expect(COLLECTION.map(n => t.api().isContentMounted(n.value))).toEqual([false, false, false])
  })

  it('面板节点本身常在：内容不渲染时 content 部件照样产出，aria-controls 指得到它', () => {
    const t = makeTabs({ defaultValue: 'overview', lazyMount: true })
    const content = t.api().getContentProps({ value: 'logs' }) as Dict
    const trigger = t.api().getTriggerProps({ value: 'logs' }) as Dict
    expect(content.role).toBe('tabpanel')
    expect(content.hidden).toBe(true)
    expect(trigger['aria-controls']).toBe(content.id)
  })
})
