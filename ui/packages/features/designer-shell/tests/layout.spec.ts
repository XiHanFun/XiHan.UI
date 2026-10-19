// 面板布局的纯函数：缺省布局、宿主的缺省、用户布局的合成与清洗、宿主管控的换算，以及几种改法。
import type { DesignerFrameRegion, DesignerLayout } from '../src'
import { describe, expect, it } from 'vitest'
import {
  defaultDesignerLayout,
  designerLayoutPolicy,
  designerPanelAbilities,
  designerPanelDock,
  resolveDesignerLayout,
  withDesignerDockSize,
  withDesignerPanelFloating,
  withDesignerPanelMinimized,
  withDesignerPanelMoved,
  withDesignerPanelShares,
  withDesignerPanelVisible,
} from '../src'

const regions: readonly DesignerFrameRegion[] = [
  { name: 'toolbar', position: 'top' },
  { name: 'palette', position: 'start', title: '物料' },
  { name: 'outline', position: 'start', title: '结构', defaultHidden: true },
  { name: 'canvas', position: 'center' },
  { name: 'properties', position: 'end', title: '属性' },
  { name: 'history', position: 'end', title: '历史', defaultHidden: true, floatable: false },
  { name: 'issues', position: 'bottom', title: '问题', closable: false },
  { name: 'fixed', position: 'bottom' },
  { name: 'minimap', position: 'overlay', anchor: 'bottom-end' },
  { name: 'status', position: 'status' },
]

describe('defaultDesignerLayout', () => {
  it('各面板按登记顺序停在登记的栏里，defaultHidden 的隐藏；顶栏、工具栏、画布、状态栏不是面板', () => {
    expect(defaultDesignerLayout(regions)).toEqual({
      version: 1,
      docks: { start: ['palette', 'outline'], end: ['properties', 'history'], bottom: ['issues', 'fixed'] },
      hidden: ['outline', 'history'],
      minimized: [],
      floating: {},
      sizes: {},
      collapsed: [],
    })
  })

  it('宿主的缺省写了的字段整项覆盖内置缺省，没列到的面板按登记的栏补在后面', () => {
    const layout = defaultDesignerLayout(regions, { version: 1, docks: { end: ['outline', 'properties'] }, hidden: ['minimap'] })
    expect(layout.docks).toEqual({ start: ['palette'], end: ['outline', 'properties', 'history'], bottom: ['issues', 'fixed'] })
    expect(layout.hidden).toEqual(['minimap'])
  })

  it('宿主藏掉的面板（policy hidden）不在布局里', () => {
    const layout = defaultDesignerLayout(regions, undefined, { panels: { properties: 'hidden', minimap: 'hidden' } })
    expect(layout.docks.end).toEqual(['history'])
    expect(resolveDesignerLayout(regions, { version: 1, hidden: ['minimap'] }, undefined, { panels: { minimap: 'hidden' } }).hidden).toEqual([])
  })
})

describe('resolveDesignerLayout', () => {
  it('用户布局写了的字段整项覆盖缺省；认不得的 id、不合法的值去掉，重复的只留第一次', () => {
    const layout = resolveDesignerLayout(regions, {
      version: 1,
      docks: { start: ['ghost', 'properties', 'palette', 'palette'], bottom: ['canvas'] },
      hidden: ['palette', 'ghost', 'issues', 'minimap'],
      minimized: ['properties', 'fixed', 'ghost'],
      floating: { properties: { x: 10, y: 20, width: 300, height: 200 }, history: { x: 0, y: 0, width: 100, height: 100 }, palette: { x: 0, y: 0, width: -1, height: 10 } },
      sizes: { start: 25, end: Number.NaN, bottom: -1, panels: { properties: 60, ghost: 40, palette: 0 } },
      collapsed: ['end', 'center' as never, 'end'],
    })
    expect(layout.docks).toEqual({ start: ['properties', 'palette', 'outline'], end: ['history'], bottom: ['issues', 'fixed'] })
    // issues 不能隐藏（closable: false）
    expect(layout.hidden).toEqual(['palette', 'minimap'])
    // 没有面板头的区（fixed）不能收起
    expect(layout.minimized).toEqual(['properties'])
    // history 不能浮出（floatable: false），宽为负的小窗不认
    expect(layout.floating).toEqual({ properties: { x: 10, y: 20, width: 300, height: 200 } })
    expect(layout.sizes).toEqual({ start: 25, panels: { properties: 60 } })
    expect(layout.collapsed).toEqual(['end'])
  })

  it('不能挪的面板（没有标题或 movable: false）只认缺省那一栏', () => {
    const layout = resolveDesignerLayout(
      [...regions.filter(region => region.name !== 'history'), { name: 'history', position: 'end', title: '历史', movable: false }],
      { version: 1, docks: { start: ['history', 'fixed', 'palette'] } },
    )
    expect(layout.docks).toEqual({ start: ['palette', 'outline'], end: ['history', 'properties'], bottom: ['fixed', 'issues'] })
  })

  it('版本不对或不是对象时按缺省布局', () => {
    const fallback = defaultDesignerLayout(regions)
    expect(resolveDesignerLayout(regions, { version: 2 } as unknown as DesignerLayout)).toEqual(fallback)
    expect(resolveDesignerLayout(regions, 'oops' as unknown as DesignerLayout)).toEqual(fallback)
  })

  it('用户布局没写的字段取宿主的缺省', () => {
    const layout = resolveDesignerLayout(regions, { version: 1, minimized: ['palette'] }, { version: 1, hidden: [] })
    expect([layout.hidden, layout.minimized]).toEqual([[], ['palette']])
  })
})

describe('designerLayoutPolicy', () => {
  it('layout.panels 或 layout 分区被藏或锁时整份锁定；layout.panels.<id> 管一块面板；别的键不管', () => {
    expect(designerLayoutPolicy(undefined)).toEqual({})
    expect(designerLayoutPolicy({ 'general.theme': 'locked' })).toEqual({})
    expect(designerLayoutPolicy({ 'layout.panels': 'hidden' })).toEqual({ locked: true })
    expect(designerLayoutPolicy({ 'layout': 'locked', 'layout.panels.issues': 'hidden', 'layout.panels.palette': 'locked' })).toEqual({ locked: true, panels: { issues: 'hidden', palette: 'locked' } })
  })

  it('能做的事：锁定的面板与整份锁定时都不能隐藏、挪、浮出、收起；没有标题的区只能隐藏', () => {
    const palette = regions.find(region => region.name === 'palette')!
    expect(designerPanelAbilities(palette)).toEqual({ closable: true, movable: true, floatable: true, minimizable: true })
    expect(designerPanelAbilities(palette, { panels: { palette: 'locked' } })).toEqual({ closable: false, movable: false, floatable: false, minimizable: false })
    expect(designerPanelAbilities(palette, { locked: true })).toEqual({ closable: false, movable: false, floatable: false, minimizable: false })
    expect(designerPanelAbilities(regions.find(region => region.name === 'fixed')!)).toEqual({ closable: true, movable: false, floatable: false, minimizable: false })
  })
})

describe('改布局的纯函数', () => {
  const base = defaultDesignerLayout(regions)

  it('显示与隐藏', () => {
    expect(withDesignerPanelVisible(base, 'outline', true).hidden).toEqual(['history'])
    expect(withDesignerPanelVisible(base, 'palette', false).hidden).toEqual(['outline', 'history', 'palette'])
  })

  it('挪到别的栏的第几位：浮着的一并吸回，它的份额去掉', () => {
    const floating = withDesignerPanelShares(withDesignerPanelFloating(base, 'palette', { x: 0, y: 0, width: 200, height: 100 }), { palette: 40, outline: 60 })
    const moved = withDesignerPanelMoved(floating, 'palette', 'end', 1)
    expect(moved.docks).toEqual({ start: ['outline'], end: ['properties', 'palette', 'history'], bottom: ['issues', 'fixed'] })
    expect([moved.floating, moved.sizes]).toEqual([{}, { panels: { outline: 60 } }])
    expect(designerPanelDock(moved, 'palette')).toBe('end')
    expect(withDesignerPanelMoved(base, 'issues', 'bottom', 99).docks.bottom).toEqual(['fixed', 'issues'])
  })

  it('收成标题条、浮出与吸回', () => {
    expect(withDesignerPanelMinimized(base, 'palette', true).minimized).toEqual(['palette'])
    const floated = withDesignerPanelFloating(withDesignerPanelVisible(base, 'outline', false), 'outline', { x: 1, y: 2, width: 3, height: 4 })
    expect([floated.hidden, floated.floating]).toEqual([['history'], { outline: { x: 1, y: 2, width: 3, height: 4 } }])
    expect(withDesignerPanelFloating(floated, 'outline', undefined).floating).toEqual({})
  })

  it('一栏的大小与收起：收起时保留收起前的大小', () => {
    const sized = withDesignerDockSize(base, 'end', 30, false)
    const collapsed = withDesignerDockSize(sized, 'end', undefined, true)
    expect([collapsed.sizes, collapsed.collapsed]).toEqual([{ end: 30 }, ['end']])
    expect(withDesignerDockSize(collapsed, 'end', undefined, false).collapsed).toEqual([])
  })
})
