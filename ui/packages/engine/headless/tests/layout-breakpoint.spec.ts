// @vitest-environment jsdom
import type { LayoutSchema } from '../src/layout'
import { createCounterIdGenerator, createRuntimeConfig, createScope, createService } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { layoutMachine } from '../src/layout'

type Props = LayoutSchema['props']
const cleanups: Array<() => void> = []

function viewport(doc: Document = document) {
  const win = doc.defaultView! as Window & typeof globalThis
  const queries: Array<{ media: string, matches: boolean, listeners: Set<() => void>, addEventListener: ReturnType<typeof vi.fn>, removeEventListener: ReturnType<typeof vi.fn> }> = []
  const match = vi.fn((media: string) => {
    const listeners = new Set<() => void>()
    const query = {
      media,
      matches: media.includes('768px'),
      listeners,
      addEventListener: vi.fn((_type: string, listener: () => void) => listeners.add(listener)),
      removeEventListener: vi.fn((_type: string, listener: () => void) => listeners.delete(listener)),
    }
    queries.push(query)
    return query as unknown as MediaQueryList
  })
  vi.spyOn(win, 'getComputedStyle').mockImplementation(() => ({
    getPropertyValue: (name: string) => ({ '--xh-breakpoint-md': '768px', '--xh-breakpoint-lg': '1024px' })[name] ?? '',
  }) as CSSStyleDeclaration)
  const descriptor = Object.getOwnPropertyDescriptor(win, 'matchMedia')
  Object.defineProperty(win, 'matchMedia', { configurable: true, value: match })
  cleanups.push(() => {
    if (descriptor)
      Object.defineProperty(win, 'matchMedia', descriptor)
    else
      Reflect.deleteProperty(win, 'matchMedia')
  })
  return { queries, match, win }
}

function layout(initial: Props = {}, doc: Document = document) {
  const runtime = createVanillaRuntime()
  const props = runtime.signal(initial)
  const scope = createScope(doc.body, createCounterIdGenerator())
  const service = createService(layoutMachine, { runtime, scope, props: () => props.get() })
  service.refs.set('config', createRuntimeConfig({ scope }))
  cleanups.push(runtime.stop)
  return { service, start: runtime.start, stop: runtime.stop, set: (next: Props) => props.set({ ...props.get(), ...next }) }
}

afterEach(() => {
  for (const dispose of cleanups.splice(0).reverse()) dispose()
  vi.restoreAllMocks()
  document.body.innerHTML = ''
})

describe('layout 动态断点', () => {
  it('添加、更换、移除断点后只保留当前查询，旧事件不能写回', () => {
    const v = viewport()
    const seen: boolean[] = []
    const l = layout({ siderPresentation: 'sheet', onSiderBreakpoint: d => seen.push(d.matched) })
    l.start()
    l.set({ siderBreakpoint: 'md' })
    expect(v.queries).toHaveLength(1)
    const old = v.queries[0]!
    const late = [...old.listeners][0]!
    l.set({ siderBreakpoint: 'lg' })
    expect(old.listeners.size).toBe(0)
    expect(l.service.context.get('siderNarrow')).toBe(true)
    expect(l.service.state.get()).toBe('collapsed')
    late()
    expect(seen).toEqual([true, false])
    l.set({ siderBreakpoint: undefined })
    expect(v.queries[1]!.listeners.size).toBe(0)
    expect(l.service.context.get('siderNarrow')).toBe(false)
    expect(l.service.state.get()).toBe('collapsed')
  })

  it('同档不重复绑定，inline 切到 sheet 立即应用当前断点且不重复报告', () => {
    const v = viewport()
    const notify = vi.fn()
    const l = layout({ siderBreakpoint: 'lg', onSiderBreakpoint: notify })
    l.start()
    expect(l.service.state.get()).toBe('expanded')
    l.set({ siderBreakpoint: 'lg' })
    l.set({ siderPresentation: 'sheet' })
    expect(v.match).toHaveBeenCalledTimes(1)
    expect(l.service.state.get()).toBe('collapsed')
    expect(notify).toHaveBeenCalledTimes(1)
  })

  it('受控侧栏换档只发意图，宿主写回才改变折叠态', () => {
    viewport()
    const change = vi.fn()
    const l = layout({ siderBreakpoint: 'md', siderPresentation: 'sheet', siderCollapsed: false, onSiderCollapsedChange: change })
    l.start()
    l.set({ siderBreakpoint: 'lg' })
    expect(change).toHaveBeenCalledWith({ collapsed: true })
    expect(l.service.state.get()).toBe('expanded')
    l.set({ siderCollapsed: true })
    expect(l.service.state.get()).toBe('collapsed')
  })

  it('断点回调同步换档时不提交旧档位的折叠意图', () => {
    const v = viewport()
    const changes: boolean[] = []
    const l = layout({ siderPresentation: 'sheet', siderCollapsed: false, onSiderCollapsedChange: d => changes.push(d.collapsed) })
    l.start()
    l.set({ onSiderBreakpoint: () => l.set({ siderBreakpoint: 'md' }), siderBreakpoint: 'lg' })
    expect(v.queries.map(q => q.listeners.size)).toEqual([0, 1])
    expect(l.service.context.get('siderNarrow')).toBe(false)
    expect(changes).toEqual([])
  })

  it('stop 后的旧查询回调不报告、不写 context', () => {
    const v = viewport()
    const notify = vi.fn()
    const l = layout({ siderBreakpoint: 'md', onSiderBreakpoint: notify })
    l.start()
    const q = v.queries[0]!
    const late = [...q.listeners][0]!
    l.stop()
    q.matches = false
    late()
    expect(notify).toHaveBeenCalledTimes(1)
    expect(l.service.context.get('siderNarrow')).toBe(false)
  })

  it('新档位缺少令牌时明确失败，释放旧查询，随后有效更新可重新绑定', () => {
    const v = viewport()
    const l = layout({ siderBreakpoint: 'md' })
    l.start()
    expect(() => l.set({ siderBreakpoint: 'xl' })).toThrow(/断点令牌/)
    expect(v.queries[0]!.listeners.size).toBe(0)
    l.set({ siderBreakpoint: 'lg' })
    expect(v.queries.at(-1)!.listeners.size).toBe(1)
  })

  it('iframe 的动态档位只读取所属 Window', () => {
    const frame = document.createElement('iframe')
    document.body.append(frame)
    cleanups.push(() => frame.remove())
    const v = viewport(frame.contentDocument!)
    const l = layout({ siderBreakpoint: 'md' }, frame.contentDocument!)
    l.start()
    l.set({ siderBreakpoint: 'lg' })
    expect(v.match.mock.calls.map(([q]) => q)).toEqual(['(min-width: 768px)', '(min-width: 1024px)'])
    expect(l.service.context.get('siderNarrow')).toBe(true)
  })

  it('新查询先注册后抛错时清理新旧监听，原错误向外报告', () => {
    const v = viewport()
    const l = layout({ siderBreakpoint: 'md' })
    l.start()
    const create = v.match.getMockImplementation()!
    const failure = new Error('监听登记失败')
    v.match.mockImplementation((media) => {
      const q = create(media)
      const record = v.queries.at(-1)!
      record.addEventListener.mockImplementation((_type, listener) => {
        record.listeners.add(listener)
        throw failure
      })
      return q
    })
    expect(() => l.set({ siderBreakpoint: 'lg' })).toThrow(failure)
    expect(v.queries.map(q => q.listeners.size)).toEqual([0, 0])
    v.match.mockImplementation(create)
    l.set({ siderBreakpoint: 'md' })
    expect(v.queries.at(-1)!.listeners.size).toBe(1)
  })

  it('旧查询释放抛错也会撤销新监听，迟到旧事件不再触发业务', () => {
    const v = viewport()
    const notify = vi.fn()
    const l = layout({ siderBreakpoint: 'md', onSiderBreakpoint: notify })
    l.start()
    const old = v.queries[0]!
    const late = [...old.listeners][0]!
    const failure = new Error('旧监听移除失败')
    old.removeEventListener.mockImplementation((_type, listener) => {
      old.listeners.delete(listener)
      throw failure
    })
    expect(() => l.set({ siderBreakpoint: 'lg' })).toThrow(failure)
    expect(v.queries.map(q => q.listeners.size)).toEqual([0, 0])
    late()
    expect(notify).toHaveBeenCalledTimes(1)
  })

  it('业务报告与查询清理同时失败时保留主异常和 cause', () => {
    const v = viewport()
    const l = layout()
    l.start()
    const primary = new Error('业务报告失败')
    const cleanup = new Error('监听清理失败')
    const create = v.match.getMockImplementation()!
    v.match.mockImplementation((media) => {
      const q = create(media)
      const record = v.queries.at(-1)!
      record.removeEventListener.mockImplementation((_type, listener) => {
        record.listeners.delete(listener)
        throw cleanup
      })
      return q
    })
    let caught: unknown
    try {
      l.set({ siderBreakpoint: 'md', onSiderBreakpoint: () => {
        throw primary
      } })
    }
    catch (error) {
      caught = error
    }
    expect(caught).toBeInstanceOf(AggregateError)
    expect((caught as AggregateError).errors).toEqual([primary, cleanup])
    expect((caught as AggregateError).cause).toBe(primary)
    expect(v.queries[0]!.listeners.size).toBe(0)
  })

  it('初始化回调停机时不会留下迟到取得的监听', () => {
    const v = viewport()
    const l = layout({ siderBreakpoint: 'lg', onSiderBreakpoint: () => l.stop() })
    l.start()
    expect(l.service.getStatus()).toBe('Stopped')
    expect(v.queries[0]!.listeners.size).toBe(0)
  })

  it('挂载前换档只建立最新查询，缺少 matchMedia 时明确失败', () => {
    const v = viewport()
    const l = layout({ siderBreakpoint: 'md' })
    l.set({ siderBreakpoint: 'lg' })
    l.start()
    expect(v.match).toHaveBeenCalledExactlyOnceWith('(min-width: 1024px)')
    Object.defineProperty(v.win, 'matchMedia', { configurable: true, value: undefined })
    expect(() => l.set({ siderBreakpoint: 'md' })).toThrow(/Window.matchMedia/)
    expect(v.queries[0]!.listeners.size).toBe(0)
  })
})
