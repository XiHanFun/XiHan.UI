// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest'
import { createPortalVisualBridge } from '../src/kernel/structure/portal-visual-bridge'

const AXES = ['data-theme', 'data-brand', 'data-density', 'data-contrast', 'data-motion', 'dir'] as const

function fixture(doc: Document = document): { outer: HTMLElement, inner: HTMLElement, source: HTMLElement, shell: HTMLElement } {
  const outer = doc.createElement('section')
  const inner = doc.createElement('div')
  const source = doc.createElement('template')
  const shell = doc.createElement('div')
  inner.append(source)
  outer.append(inner)
  doc.body.append(outer, shell)
  return { outer, inner, source, shell }
}

async function settleMutations(): Promise<void> {
  await Promise.resolve()
  await Promise.resolve()
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('portal 视觉环境桥', () => {
  it('六个真实 DOM 轴逐项取最近显式声明，不复制计算样式或尚不存在的透明度轴', () => {
    const { outer, inner, source, shell } = fixture()
    outer.setAttribute('data-theme', 'dark')
    outer.setAttribute('data-brand', 'acme')
    outer.setAttribute('data-density', 'compact')
    outer.setAttribute('data-contrast', 'more')
    outer.setAttribute('data-motion', 'reduce')
    outer.setAttribute('dir', 'rtl')
    outer.setAttribute('data-transparency', 'reduce')
    outer.style.setProperty('--business-color', 'red')
    inner.setAttribute('data-density', 'comfortable')

    const bridge = createPortalVisualBridge({ source, shell })
    expect(Object.fromEntries(AXES.map(name => [name, shell.getAttribute(name)]))).toEqual({
      'data-theme': 'dark',
      'data-brand': 'acme',
      'data-density': 'comfortable',
      'data-contrast': 'more',
      'data-motion': 'reduce',
      'dir': 'rtl',
    })
    expect(shell.hasAttribute('data-transparency')).toBe(false)
    expect(shell.style.getPropertyValue('--business-color')).toBe('')
    bridge.dispose()
  })

  it('来源未声明的轴留空，使实例壳继续继承业务显式目标', () => {
    const { source, shell } = fixture()
    const target = document.createElement('aside')
    target.setAttribute('data-theme', 'dark')
    target.append(shell)
    document.body.append(target)
    const bridge = createPortalVisualBridge({ source, shell })
    expect(shell.hasAttribute('data-theme')).toBe(false)
    bridge.dispose()
  })

  it('祖先改值、删除内层声明与来源换父后异步跟随', async () => {
    const { outer, inner, source, shell } = fixture()
    const other = document.createElement('section')
    other.setAttribute('data-theme', 'light')
    document.body.append(other)
    outer.setAttribute('data-theme', 'dark')
    inner.setAttribute('data-density', 'compact')
    const bridge = createPortalVisualBridge({ source, shell })

    outer.setAttribute('data-theme', 'light')
    inner.removeAttribute('data-density')
    await settleMutations()
    expect(shell.getAttribute('data-theme')).toBe('light')
    expect(shell.hasAttribute('data-density')).toBe(false)

    other.append(source)
    await settleMutations()
    expect(shell.getAttribute('data-theme')).toBe('light')
    other.setAttribute('data-theme', 'dark')
    await settleMutations()
    expect(shell.getAttribute('data-theme')).toBe('dark')
    bridge.dispose()
  })

  it('穿过 ShadowRoot 读取 host 与外层，并跟随两层变化', async () => {
    const host = document.createElement('div')
    const outer = document.createElement('section')
    outer.setAttribute('data-theme', 'dark')
    host.setAttribute('data-density', 'compact')
    outer.append(host)
    document.body.append(outer)
    const shadow = host.attachShadow({ mode: 'open' })
    const source = document.createElement('template')
    const shell = document.createElement('div')
    shadow.append(source)
    document.body.append(shell)

    const bridge = createPortalVisualBridge({ source, shell })
    expect(shell.getAttribute('data-theme')).toBe('dark')
    expect(shell.getAttribute('data-density')).toBe('compact')

    host.setAttribute('data-density', 'comfortable')
    outer.setAttribute('data-theme', 'light')
    await settleMutations()
    expect(shell.getAttribute('data-theme')).toBe('light')
    expect(shell.getAttribute('data-density')).toBe('comfortable')
    bridge.dispose()
  })

  it('slotted 来源按扁平树先继承 slot 祖先，并在 slotchange 后切换观察链', async () => {
    const host = document.createElement('div')
    const shadow = host.attachShadow({ mode: 'open' })
    const dark = document.createElement('section')
    const light = document.createElement('section')
    dark.setAttribute('data-theme', 'dark')
    light.setAttribute('data-theme', 'light')
    const firstSlot = document.createElement('slot')
    const secondSlot = document.createElement('slot')
    firstSlot.name = 'first'
    secondSlot.name = 'second'
    dark.append(firstSlot)
    light.append(secondSlot)
    shadow.append(dark, light)

    const source = document.createElement('template')
    source.slot = 'first'
    const shell = document.createElement('div')
    host.append(source)
    document.body.append(host, shell)
    const bridge = createPortalVisualBridge({ source, shell })
    expect(source.assignedSlot).toBe(firstSlot)
    expect(shell.getAttribute('data-theme')).toBe('dark')

    source.slot = 'second'
    await settleMutations()
    expect(source.assignedSlot).toBe(secondSlot)
    expect(shell.getAttribute('data-theme')).toBe('light')

    light.setAttribute('data-theme', 'dark')
    await settleMutations()
    expect(shell.getAttribute('data-theme')).toBe('dark')
    bridge.dispose()
  })

  it('同一目标下两台实例各认自己的来源，更新互不串值', async () => {
    const first = fixture()
    const second = fixture()
    first.outer.setAttribute('data-theme', 'dark')
    second.outer.setAttribute('data-theme', 'light')
    const a = createPortalVisualBridge({ source: first.source, shell: first.shell })
    const b = createPortalVisualBridge({ source: second.source, shell: second.shell })

    expect(first.shell.getAttribute('data-theme')).toBe('dark')
    expect(second.shell.getAttribute('data-theme')).toBe('light')
    first.outer.setAttribute('data-theme', 'light')
    await settleMutations()
    expect(first.shell.getAttribute('data-theme')).toBe('light')
    expect(second.shell.getAttribute('data-theme')).toBe('light')
    a.dispose()
    b.dispose()
  })

  it('dispose 幂等停止跟随，并精确还原接管前的壳属性', async () => {
    const { outer, source, shell } = fixture()
    outer.setAttribute('data-theme', 'dark')
    shell.setAttribute('data-theme', 'legacy')
    shell.setAttribute('dir', 'ltr')
    const bridge = createPortalVisualBridge({ source, shell })
    expect(shell.getAttribute('data-theme')).toBe('dark')
    expect(shell.hasAttribute('dir')).toBe(false)

    bridge.dispose()
    bridge.dispose()
    expect(shell.getAttribute('data-theme')).toBe('legacy')
    expect(shell.getAttribute('dir')).toBe('ltr')
    outer.setAttribute('data-theme', 'light')
    await settleMutations()
    expect(shell.getAttribute('data-theme')).toBe('legacy')
  })

  it('拒绝跨 Document 来源与壳，不把主页面视觉环境写进 iframe', () => {
    const { source } = fixture()
    const other = document.implementation.createHTMLDocument('other')
    const shell = other.createElement('div')
    expect(() => createPortalVisualBridge({ source, shell }))
      .toThrow('[xh] Portal 的来源与实例壳必须属于同一 Document')
  })

  it('同属无活动 Window 的 Document 时明确拒绝，不回退 ambient window', () => {
    const other = document.implementation.createHTMLDocument('other')
    const source = other.createElement('template')
    const shell = other.createElement('div')
    other.body.append(source, shell)
    expect(() => createPortalVisualBridge({ source, shell }))
      .toThrow('[xh] Portal 视觉环境需要来源 Document 的 MutationObserver')
  })

  it('iframe 使用自身 Window 的 MutationObserver', async () => {
    const frame = document.createElement('iframe')
    document.body.append(frame)
    const doc = frame.contentDocument!
    const { outer, source, shell } = fixture(doc)
    outer.setAttribute('data-theme', 'dark')
    const bridge = createPortalVisualBridge({ source, shell })
    expect(shell.getAttribute('data-theme')).toBe('dark')
    outer.setAttribute('data-theme', 'light')
    await settleMutations()
    expect(shell.getAttribute('data-theme')).toBe('light')
    bridge.dispose()
    frame.remove()
  })
})
