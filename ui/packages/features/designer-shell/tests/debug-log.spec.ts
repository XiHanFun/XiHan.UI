// @vitest-environment jsdom

// 调试日志：两条开关只在开发者模式开着时生效；记日志的小工具按此刻的设置判断开没开，开着时在控制台按设计器名加前缀、
// 折叠成一组，关着时不碰控制台、不现取详情。
import type { DesignerSettings } from '../src'
import { describe, expect, it } from 'vitest'
import { createDesignerDebugLogger, debugLogOf, DESIGNER_SETTING_KEYS } from '../src'

function fakeConsole(): { readonly calls: unknown[][], readonly console: Pick<Console, 'groupCollapsed' | 'groupEnd' | 'log'> } {
  const calls: unknown[][] = []
  return {
    calls,
    console: {
      groupCollapsed: (...args: unknown[]) => void calls.push(['group', ...args]),
      groupEnd: () => void calls.push(['end']),
      log: (...args: unknown[]) => void calls.push(['log', ...args]),
    },
  }
}

describe('debugLogOf', () => {
  it('开发者模式与这一路的开关都开着才算开；关掉开发者模式，两路随即都停', () => {
    expect([DESIGNER_SETTING_KEYS.debugPagination, DESIGNER_SETTING_KEYS.debugRender]).toEqual(['general.debugPagination', 'general.debugRender'])
    const on: DesignerSettings = { 'general.developer': true, 'general.debugPagination': true, 'general.debugRender': false }
    expect([debugLogOf(on, 'pagination'), debugLogOf(on, 'render')]).toEqual([true, false])
    expect(debugLogOf({ ...on, 'general.developer': false }, 'pagination')).toBe(false)
    expect(debugLogOf(undefined, 'render')).toBe(false)
  })
})

describe('createDesignerDebugLogger', () => {
  it('关着时不碰控制台、不现取详情，measure 照样跑并返回结果，start 返回的结束函数什么都不做', () => {
    const { calls, console } = fakeConsole()
    let settings: DesignerSettings = { 'general.debugRender': true }
    const log = createDesignerDebugLogger({ name: 'xh-flow-designer', settings: () => settings, console })
    let fetched = 0
    log.log('render', '重画', () => void (fetched += 1))
    expect(log.measure('render', '布局', () => 42, () => void (fetched += 1))).toBe(42)
    log.start('render', '出图')(() => void (fetched += 1))
    expect([log.enabled('render'), calls, fetched]).toEqual([false, [], 0])
    settings = { 'general.developer': true, 'general.debugRender': true }
    expect(log.enabled('render')).toBe(true)
  })

  it('开着时：标题带设计器名与这一路，折叠成一组，详情现取一次；measure 与 start 记耗时', () => {
    const { calls, console } = fakeConsole()
    let time = 100
    const log = createDesignerDebugLogger({
      name: 'xh-print-designer',
      settings: () => ({ 'general.developer': true, 'general.debugPagination': true, 'general.debugRender': true }),
      console,
      now: () => time,
    })
    log.log('pagination', '第 2 页放不下，拆到第 3 页', () => ({ page: 2 }))
    expect(log.measure('render', '生成 DOM', () => {
      time += 12.34
      return 'done'
    })).toBe('done')
    const end = log.start('render', '出图')
    time += 5
    end(() => ({ pages: 3 }))
    expect(calls).toEqual([
      ['group', '[xh-print-designer] pagination · 第 2 页放不下，拆到第 3 页'],
      ['log', { page: 2 }],
      ['end'],
      ['group', '[xh-print-designer] render · 生成 DOM 12.3 ms'],
      ['end'],
      ['group', '[xh-print-designer] render · 出图 5.0 ms'],
      ['log', { pages: 3 }],
      ['end'],
    ])
  })
})
