// @vitest-environment jsdom
//
// tabs 的新增钮、逐条的可关闭与图标、标签带落位与平分：新增钮只发意图、不挪焦点；条目上的 closable 压过整组；
// placement / fullWidth 只是 root 上的版面事实，不改结构；标准结构按条目铺图标、关闭钮与新增钮。
import type { IconRecord } from '@xihan-ui/core'
import type { TabsSchema } from '../src/tabs'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it, vi } from 'vitest'
import { connectTabs, tabsAnatomy, tabsKeyboard, tabsMachine, tabsOverflowMenuProps, tabsStructure } from '../src/tabs'

type Dict = Record<string, unknown>
type Props = TabsSchema['props']

const STAR: IconRecord = { name: 'star', viewBox: '0 0 24 24', nodes: [{ tag: 'path', attrs: { d: 'M12 3l3 6 6 1-4.5 4 1 6-5.5-3-5.5 3 1-6L3 10l6-1z' } }] }

const COLLECTION = [
  { value: 'home', label: '首页', closable: false },
  { value: 'docs', label: '文档', icon: STAR },
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

function call(props: Dict, name: string, event: unknown = {}): void {
  (props[name] as (e: unknown) => void)(event)
}

function deleteKey(t: ReturnType<typeof makeTabs>, value: string): void {
  t.service.send({ type: 'TRIGGER.FOCUS', value })
  const list = document.createElement('div')
  call(t.api().getListProps() as Dict, 'onKeydown', { key: 'Delete', currentTarget: list, target: list, preventDefault: () => {} })
}

describe('标签页 · 新增钮', () => {
  it('是解剖里的独立部件，排在「更多」钮之后', () => {
    const names = tabsAnatomy.parts
    expect(names.indexOf('add-trigger')).toBe(names.indexOf('overflow-trigger') + 1)
  })

  it('addable 关闭时收起', () => {
    const add = makeTabs().api().getAddTriggerProps() as Dict
    expect(add.hidden).toBe(true)
  })

  it('自占一个 Tab 位、有可及名，接 Action Control icon 档 ghost 面，档位随 size', () => {
    const add = makeTabs({ addable: true, size: 'lg' }).api().getAddTriggerProps() as Dict
    expect(add.hidden).toBeUndefined()
    expect(add.type).toBe('button')
    // 不写 tabindex、不对读屏隐藏：它是键盘走得到的一站
    expect(add.tabIndex).toBeUndefined()
    expect(add['aria-hidden']).toBeUndefined()
    expect(add['aria-label']).toBe('Add tab')
    expect(add['data-orientation']).toBe('horizontal')
    expect(add['data-xh-action-control']).toBe('')
    expect(add['data-xh-action-profile']).toBe('icon')
    expect(add['data-xh-action-variant']).toBe('ghost')
    expect(add['data-xh-action-size']).toBe('lg')
  })

  it('可及名随 translations.addTrigger 换', () => {
    const add = makeTabs({ addable: true, translations: { addTrigger: '新建标签页' } }).api().getAddTriggerProps() as Dict
    expect(add['aria-label']).toBe('新建标签页')
  })

  it('点按发 onTabAdd，库不改标签序与选中', () => {
    const onTabAdd = vi.fn()
    const t = makeTabs({ addable: true, defaultValue: 'docs', onTabAdd })
    call(t.api().getAddTriggerProps() as Dict, 'onClick')
    expect(onTabAdd).toHaveBeenCalledTimes(1)
    expect(onTabAdd).toHaveBeenCalledWith()
    expect(t.api().value).toBe('docs')
    expect(t.api().collection.map(n => n.value)).toEqual(['home', 'docs', 'logs'])
  })

  it('addable 关闭时点按也不发', () => {
    const onTabAdd = vi.fn()
    const t = makeTabs({ onTabAdd })
    call(t.api().getAddTriggerProps() as Dict, 'onClick')
    expect(onTabAdd).not.toHaveBeenCalled()
  })

  it('写回新标签为选中值后，新标签接过整组的 Tab 停靠点（焦点在组外时锚点落在选中项上）', () => {
    const t = makeTabs({ addable: true, value: 'home' })
    t.setProps({ collection: [...COLLECTION, { value: 'new', label: '新标签' }], value: 'new' })
    const fresh = t.api().getTriggerProps({ value: 'new' }) as Dict
    const home = t.api().getTriggerProps({ value: 'home' }) as Dict
    expect(fresh.tabindex).toBe(0)
    expect(fresh['aria-selected']).toBe('true')
    expect(home.tabindex).toBe(-1)
  })

  it('space / Enter 按住与触屏按下投影 data-pressed，抬起、失焦撤下；与标签的按压各记各的', () => {
    const t = makeTabs({ addable: true })
    call(t.api().getAddTriggerProps() as Dict, 'onKeyDown', { key: ' ', repeat: false, isComposing: false })
    expect((t.api().getAddTriggerProps() as Dict)['data-pressed']).toBe('')
    expect((t.api().getTriggerProps({ value: 'home' }) as Dict)['data-pressed']).toBeUndefined()
    call(t.api().getAddTriggerProps() as Dict, 'onKeyUp', { key: ' ' })
    expect((t.api().getAddTriggerProps() as Dict)['data-pressed']).toBeUndefined()

    call(t.api().getAddTriggerProps() as Dict, 'onKeyDown', { key: 'Enter', repeat: false, isComposing: false })
    call(t.api().getAddTriggerProps() as Dict, 'onBlur')
    expect((t.api().getAddTriggerProps() as Dict)['data-pressed']).toBeUndefined()
  })

  it('键盘表登记了新增钮的 Tab 位、激活与按压三行', () => {
    const ids = tabsKeyboard.rows.map(row => row.id)
    expect(ids).toEqual(expect.arrayContaining(['tabs.kbd.add-stop', 'tabs.kbd.add', 'tabs.kbd.add-press']))
  })
})

describe('标签页 · 逐条的可关闭', () => {
  it('条目元信息照抄条目自己的 closable 与 icon，没写为 null', () => {
    const meta = makeTabs().api().collection
    expect(meta.map(n => n.closable)).toEqual([false, null, null])
    expect(meta.map(n => n.icon)).toEqual([null, STAR, null])
  })

  it('整组可关时，条目写 closable: false 的那一条收起关闭钮、Delete 不发、标签不报可关', () => {
    const onTabClose = vi.fn()
    const t = makeTabs({ closable: true, onTabClose })
    expect((t.api().getCloseTriggerProps({ value: 'home' }) as Dict).hidden).toBe(true)
    expect((t.api().getCloseTriggerProps({ value: 'docs' }) as Dict).hidden).toBeUndefined()
    expect((t.api().getTriggerProps({ value: 'home' }) as Dict)['data-closable']).toBeUndefined()
    expect((t.api().getTriggerProps({ value: 'docs' }) as Dict)['data-closable']).toBe('')

    call(t.api().getCloseTriggerProps({ value: 'home' }) as Dict, 'onClick')
    deleteKey(t, 'home')
    expect(onTabClose).not.toHaveBeenCalled()

    deleteKey(t, 'logs')
    expect(onTabClose).toHaveBeenCalledWith({ value: 'logs', values: ['home', 'docs'] })
  })

  it('整组不可关时，条目写 closable: true 的那一条单独放开', () => {
    const onTabClose = vi.fn()
    const t = makeTabs({
      collection: [{ value: 'a' }, { value: 'b', closable: true }],
      onTabClose,
    })
    expect((t.api().getCloseTriggerProps({ value: 'a' }) as Dict).hidden).toBe(true)
    expect((t.api().getCloseTriggerProps({ value: 'b' }) as Dict).hidden).toBeUndefined()
    deleteKey(t, 'a')
    expect(onTabClose).not.toHaveBeenCalled()
    call(t.api().getCloseTriggerProps({ value: 'b' }) as Dict, 'onClick')
    expect(onTabClose).toHaveBeenCalledWith({ value: 'b', values: ['a'] })
  })

  it('不给 collection 时只有整组那一档', () => {
    const t = makeTabs({ collection: undefined, closable: true })
    expect((t.api().getCloseTriggerProps({ value: 'x' }) as Dict).hidden).toBeUndefined()
  })
})

describe('标签页 · 落位与平分', () => {
  it('缺省 start、不平分：root 上显式落 data-placement，指示条同样带着', () => {
    const t = makeTabs()
    const root = t.api().getRootProps() as Dict
    expect(root['data-placement']).toBe('start')
    expect(root['data-full-width']).toBeUndefined()
    expect((t.api().getIndicatorProps() as Dict)['data-placement']).toBe('start')
  })

  it('placement: end 与 fullWidth 照实投影，方向键轴向仍归 orientation', () => {
    const t = makeTabs({ placement: 'end', fullWidth: true, orientation: 'vertical' })
    const root = t.api().getRootProps() as Dict
    expect(root['data-placement']).toBe('end')
    expect(root['data-full-width']).toBe('')
    expect(root['data-orientation']).toBe('vertical')
    expect((t.api().getListProps() as Dict)['aria-orientation']).toBe('vertical')
    expect((t.api().getIndicatorProps() as Dict)['data-placement']).toBe('end')
  })
})

describe('标签页 · 标准结构', () => {
  it('给了图标的标签：图标在前、文字在后；没给的只有文字', () => {
    const [list] = tabsStructure(makeTabs().api())
    const docs = list!.children!.find(node => node.key === 'trigger:docs') as unknown as Dict
    expect(docs.text).toBeUndefined()
    expect(docs.children).toEqual([
      { key: 'glyph', instance: 'icon', props: { icon: STAR } },
      { key: 'label', literal: '文档' },
    ])
    const home = list!.children!.find(node => node.key === 'trigger:home') as unknown as Dict
    expect(home.text).toBe('首页')
    expect(home.children).toBeUndefined()
  })

  it('关闭钮按条目铺：条目写了的以条目为准，没写随整组', () => {
    const keys = (closable: boolean): string[] =>
      (tabsStructure(makeTabs().api(), { closable })[0]!.children ?? []).map(node => node.key)
    expect(keys(true)).toEqual(['trigger:home', 'trigger:docs', 'close-trigger:docs', 'trigger:logs', 'close-trigger:logs'])
    expect(keys(false)).toEqual(['trigger:home', 'trigger:docs', 'trigger:logs'])
  })

  it('addable 时新增钮排在标签带之后、面板之前；缺省不铺', () => {
    const api = makeTabs().api()
    expect(tabsStructure(api, { addable: true }).map(node => node.key))
      .toEqual(['list', 'add-trigger', 'content:home', 'content:docs', 'content:logs'])
    expect(tabsStructure(api).map(node => node.key))
      .toEqual(['list', 'content:home', 'content:docs', 'content:logs'])
  })
})

describe('标签页 · 「更多」下拉里的图标', () => {
  it('数据里给了图标的标签，下拉里那一项同样带上它', () => {
    const t = makeTabs()
    t.service.context.set('overflowItems', [
      { value: 'docs', label: '文档', disabled: false },
      { value: 'logs', label: '日志', disabled: false },
    ])
    const menu = tabsOverflowMenuProps(t.service)
    expect(menu.collection?.map(node => node.icon)).toEqual([STAR, undefined])
  })
})
