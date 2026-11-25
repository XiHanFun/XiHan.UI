// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { observeBreakpoint } from '../src/behavior/breakpoint'

const TOKENS: Record<string, string> = {
  '--xh-breakpoint-sm': '640px',
  '--xh-breakpoint-md': '768px',
  '--xh-breakpoint-lg': '1024px',
  '--xh-breakpoint-xl': '1280px',
}

interface FakeQuery {
  media: string
  min: number
  listeners: Set<() => void>
}

const cleanups: Array<() => void> = []

/** 一块可调宽度的假视口：媒体查询按 min-width 现算，改宽度时只通知结果变了的查询。 */
function viewport(initialWidth: number, tokens: Record<string, string> = TOKENS) {
  const win = window
  let width = initialWidth
  const queries: FakeQuery[] = []
  const matchMedia = vi.fn((media: string) => {
    const min = Number(/min-width:\s*(\d+)px/.exec(media)?.[1])
    const query: FakeQuery = { media, min, listeners: new Set() }
    queries.push(query)
    return {
      media,
      get matches() {
        return width >= min
      },
      addEventListener: (_type: string, listener: () => void) => query.listeners.add(listener),
      removeEventListener: (_type: string, listener: () => void) => query.listeners.delete(listener),
    } as unknown as MediaQueryList
  })
  vi.spyOn(win, 'getComputedStyle').mockImplementation(() => ({
    getPropertyValue: (name: string) => tokens[name] ?? '',
  }) as CSSStyleDeclaration)
  const descriptor = Object.getOwnPropertyDescriptor(win, 'matchMedia')
  Object.defineProperty(win, 'matchMedia', { configurable: true, value: matchMedia })
  cleanups.push(() => {
    if (descriptor)
      Object.defineProperty(win, 'matchMedia', descriptor)
    else
      Reflect.deleteProperty(win, 'matchMedia')
  })
  return {
    queries,
    resize(next: number) {
      const before = queries.map(q => width >= q.min)
      width = next
      queries.forEach((q, i) => {
        if (before[i] !== (width >= q.min))
          q.listeners.forEach(listener => listener())
      })
    },
  }
}

afterEach(() => {
  for (const dispose of cleanups.splice(0).reverse()) dispose()
  vi.restoreAllMocks()
})

describe('observeBreakpoint', () => {
  it('按断点令牌的宽度建立 min-width 查询，初值取最宽的命中档', () => {
    const v = viewport(900)
    const observer = observeBreakpoint()
    expect(v.queries.map(q => q.media)).toEqual([
      '(min-width: 640px)',
      '(min-width: 768px)',
      '(min-width: 1024px)',
      '(min-width: 1280px)',
    ])
    expect(observer.current).toBe('md')
    observer.dispose()
  })

  it('比最窄一档还窄时是 base', () => {
    viewport(320)
    expect(observeBreakpoint().current).toBe('base')
  })

  it('跨档时通知一次新档，同档内不通知，建立时不通知', () => {
    const v = viewport(700)
    const onChange = vi.fn()
    const observer = observeBreakpoint({ onChange })
    expect(onChange).not.toHaveBeenCalled()
    v.resize(1300)
    expect(observer.current).toBe('xl')
    v.resize(1290)
    v.resize(500)
    expect(onChange.mock.calls).toEqual([['xl'], ['base']])
    expect(observer.current).toBe('base')
  })

  it('释放后撤掉全部监听，晚到的通知不再写回', () => {
    const v = viewport(700)
    const onChange = vi.fn()
    const observer = observeBreakpoint({ onChange })
    const late = [...v.queries[2]!.listeners][0]!
    observer.dispose()
    expect(v.queries.every(q => q.listeners.size === 0)).toBe(true)
    v.resize(1100)
    late()
    expect(onChange).not.toHaveBeenCalled()
    expect(observer.current).toBe('sm')
  })

  it('缺断点令牌时明确报错，不猜缺省宽度', () => {
    viewport(900, { '--xh-breakpoint-sm': '640px' })
    expect(() => observeBreakpoint()).toThrow('--xh-breakpoint-md')
  })
})
