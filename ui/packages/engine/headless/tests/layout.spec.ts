// @vitest-environment jsdom
// 覆盖档要真 DOM：断点跟随读的是文档元素上的断点令牌，Escape 挂在 document 上。
import type { LayoutSchema, LayoutSiderCollapsedChangeDetails } from '../src/layout'
import { createService, getLayerRegistry, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it } from 'vitest'
import { connectLayout, layoutMachine } from '../src/layout'
// 档位解析是机器与连接层共用的内部函数，不进公开面：直接指到文件
import { resolveSiderPresentation } from '../src/layout/layout.machine'

type Props = LayoutSchema['props']

/** props 走 signal：改 prop 要真的惊动 watch。 */
function makeLayout(initial: Props = {}) {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>(initial)
  const service = createService(layoutMachine, { props: () => props.get(), runtime })
  runtime.start()
  return {
    state: () => service.state.get(),
    setProps: (next: Props) => props.set({ ...props.get(), ...next }),
    api: () => connectLayout(service, normalizeProps),
    stop: () => runtime.stop(),
  }
}

/** 把某个角色节点上的 onClick 直接调掉：node 环境里没有 MouseEvent。 */
function press(props: Record<string, unknown>): void {
  (props.onClick as () => void)()
}

/** 装一个只认 min-width 的媒体查询表，返回改窗宽的手柄。 */
function stubViewport(width: number) {
  const listeners = new Set<() => void>()
  let current = width
  const original = window.matchMedia
  window.matchMedia = ((query: string) => {
    const min = Number(/(\d+)px/.exec(query)?.[1] ?? 0)
    return {
      get matches() {
        return current >= min
      },
      addEventListener: (_: string, fn: () => void) => {
        listeners.add(fn)
      },
      removeEventListener: (_: string, fn: () => void) => {
        listeners.delete(fn)
      },
    }
  }) as unknown as typeof window.matchMedia
  return {
    resize(next: number) {
      current = next
      for (const fn of [...listeners]) fn()
    },
    restore() {
      window.matchMedia = original
      listeners.clear()
    },
  }
}

/** 断点令牌由令牌样式表给；测试里直接写在文档元素上。 */
function stubBreakpointToken(tier: string, value: string) {
  const original = window.getComputedStyle
  window.getComputedStyle = ((el: Element, pseudo?: string | null) => {
    const real = original.call(window, el, pseudo ?? undefined)
    if (el !== document.documentElement)
      return real
    return { getPropertyValue: (name: string) => (name === `--xh-breakpoint-${tier}` ? value : '') } as CSSStyleDeclaration
  }) as typeof window.getComputedStyle
  return () => {
    window.getComputedStyle = original
  }
}

function escape(): void {
  document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
}

const cleanups: (() => void)[] = []

afterEach(() => {
  while (cleanups.length) cleanups.pop()!()
})

describe('resolveSiderPresentation', () => {
  it('不写档位恒是占位档；写了断点时覆盖档只在未达档时成立', () => {
    expect(resolveSiderPresentation(undefined, undefined, false)).toBe('inline')
    expect(resolveSiderPresentation('inline', undefined, true)).toBe('inline')
    // 没写断点：覆盖档一直成立
    expect(resolveSiderPresentation('sheet', undefined, false)).toBe('sheet')
    // 写了断点：宽屏退回占位档，窄屏才覆盖
    expect(resolveSiderPresentation('sheet', 'md', false)).toBe('inline')
    expect(resolveSiderPresentation('sheet', 'md', true)).toBe('sheet')
  })
})

describe('layout 覆盖档的属性', () => {
  it('占位档：两处都落 inline，遮罩带 hidden', () => {
    const l = makeLayout()
    cleanups.push(l.stop)
    const api = l.api()
    expect(api.siderPresentation).toBe('inline')
    expect(api.getRootProps()['data-sider-presentation']).toBe('inline')
    expect(api.getSiderProps()['data-presentation']).toBe('inline')
    expect(api.getSiderBackdropProps().hidden).toBe(true)
  })

  it('覆盖档：两处都落 sheet，遮罩露出来且不进无障碍树', () => {
    const l = makeLayout({ siderPresentation: 'sheet' })
    cleanups.push(l.stop)
    const api = l.api()
    expect(api.siderPresentation).toBe('sheet')
    expect(api.getRootProps()['data-sider-presentation']).toBe('sheet')
    expect(api.getSiderProps()['data-presentation']).toBe('sheet')
    expect(api.getSiderBackdropProps().hidden).toBeUndefined()
    expect(api.getSiderBackdropProps()['aria-hidden']).toBe(true)
  })

  it('覆盖档的面板恒取展开宽：收起只是推出画外，不换宽度', () => {
    const l = makeLayout({ siderPresentation: 'sheet', siderWidth: '18rem', siderCollapsedWidth: '4rem' })
    cleanups.push(l.stop)
    expect((l.api().getSiderProps().style as Record<string, string>).inlineSize).toBe('18rem')

    press(l.api().getSiderTriggerProps() as Record<string, unknown>)
    expect(l.state()).toBe('collapsed')
    expect((l.api().getSiderProps().style as Record<string, string>).inlineSize).toBe('18rem')
  })

  it('占位档收起时照旧换到折叠那一档宽', () => {
    const l = makeLayout({ siderWidth: '18rem', siderCollapsedWidth: '4rem', defaultSiderCollapsed: true })
    cleanups.push(l.stop)
    expect((l.api().getSiderProps().style as Record<string, string>).inlineSize).toBe('4rem')
  })
})

describe('layout 覆盖档的消解', () => {
  it('点遮罩收起侧栏，并通知一次', () => {
    const seen: LayoutSiderCollapsedChangeDetails[] = []
    const l = makeLayout({ siderPresentation: 'sheet', onSiderCollapsedChange: d => seen.push(d) })
    cleanups.push(l.stop)

    press(l.api().getSiderBackdropProps() as Record<string, unknown>)
    expect(l.state()).toBe('collapsed')
    expect(seen).toEqual([{ collapsed: true }])

    // 已经收起了再点遮罩：不重复通知
    press(l.api().getSiderBackdropProps() as Record<string, unknown>)
    expect(seen).toHaveLength(1)
  })

  it('覆盖档按 Escape 收起；占位档下 Escape 与侧栏无关', () => {
    const sheet = makeLayout({ siderPresentation: 'sheet' })
    cleanups.push(sheet.stop)
    escape()
    expect(sheet.state()).toBe('collapsed')

    const inline = makeLayout()
    cleanups.push(inline.stop)
    escape()
    expect(inline.state()).toBe('expanded')
  })

  it('层栈上有浮层时 Escape 归浮层：侧栏不跟着一起收', () => {
    const l = makeLayout({ siderPresentation: 'sheet' })
    cleanups.push(l.stop)

    const node = document.createElement('div')
    document.body.append(node)
    const { dispose } = getLayerRegistry(document).register({
      kind: 'modal',
      node: () => node,
      branches: () => [],
      isModal: () => true,
      setModal: () => {},
      surfaces: () => [],
    })
    cleanups.push(() => {
      dispose()
      node.remove()
    })

    escape()
    expect(l.state()).toBe('expanded')

    // 浮层退栈后这一键才轮到侧栏
    dispose()
    escape()
    expect(l.state()).toBe('collapsed')
  })

  it('收起之后 Escape 不再往下发：收起态没有可收的东西', () => {
    const seen: LayoutSiderCollapsedChangeDetails[] = []
    const l = makeLayout({ siderPresentation: 'sheet', onSiderCollapsedChange: d => seen.push(d) })
    cleanups.push(l.stop)
    escape()
    escape()
    expect(seen).toEqual([{ collapsed: true }])
  })
})

describe('layout 断点与覆盖档', () => {
  it('宽屏退回占位档，窄屏进覆盖档并顺手收起；回宽屏再展开', () => {
    const viewport = stubViewport(1024)
    cleanups.push(viewport.restore)
    cleanups.push(stubBreakpointToken('md', '768px'))

    const seen: LayoutSiderCollapsedChangeDetails[] = []
    const l = makeLayout({
      siderPresentation: 'sheet',
      siderBreakpoint: 'md',
      onSiderCollapsedChange: d => seen.push(d),
    })
    cleanups.push(l.stop)

    // 宽屏：档位退回占位档，侧栏照旧展开着占一列
    expect(l.api().siderPresentation).toBe('inline')
    expect(l.state()).toBe('expanded')
    expect(seen).toEqual([])

    viewport.resize(375)
    expect(l.api().siderPresentation).toBe('sheet')
    expect(l.state()).toBe('collapsed')
    expect(seen).toEqual([{ collapsed: true }])

    viewport.resize(1024)
    expect(l.api().siderPresentation).toBe('inline')
    expect(l.state()).toBe('expanded')
    expect(seen).toEqual([{ collapsed: true }, { collapsed: false }])
  })

  it('只写断点不写覆盖档：跨档只发 onSiderBreakpoint，折叠态一动不动', () => {
    const viewport = stubViewport(1024)
    cleanups.push(viewport.restore)
    cleanups.push(stubBreakpointToken('md', '768px'))

    const matched: boolean[] = []
    const collapsed: LayoutSiderCollapsedChangeDetails[] = []
    const l = makeLayout({
      siderBreakpoint: 'md',
      onSiderBreakpoint: d => matched.push(d.matched),
      onSiderCollapsedChange: d => collapsed.push(d),
    })
    cleanups.push(l.stop)

    viewport.resize(375)
    expect(matched).toEqual([true, false])
    expect(collapsed).toEqual([])
    expect(l.state()).toBe('expanded')
    expect(l.api().siderPresentation).toBe('inline')
  })
})
