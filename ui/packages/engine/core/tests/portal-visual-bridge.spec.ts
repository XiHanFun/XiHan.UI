// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest'
import { createPortalVisualBridge } from '../src/kernel/structure/portal-visual-bridge'

const AXES = ['data-theme', 'data-brand', 'data-density', 'data-contrast', 'data-motion', 'data-transparency', 'dir'] as const

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
  document.body.removeAttribute('style')
})

describe('portal 视觉环境桥', () => {
  it('七个视觉 DOM 轴逐项取最近显式声明，并桥接来源自定义属性', () => {
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
      'data-transparency': 'reduce',
      'dir': 'rtl',
    })
    expect(shell.getAttribute('data-transparency')).toBe('reduce')
    expect(shell.style.getPropertyValue('--business-color')).toBe('red')
    bridge.dispose()
  })

  it('来源未声明的轴与自定义属性留空，使实例壳继续继承业务显式目标', () => {
    const { source, shell } = fixture()
    const target = document.createElement('aside')
    target.setAttribute('data-theme', 'dark')
    shell.style.setProperty('--business-color', 'target')
    target.append(shell)
    source.style.color = 'red'
    document.body.append(target)
    const bridge = createPortalVisualBridge({ source, shell })
    expect(shell.hasAttribute('data-theme')).toBe(false)
    expect(shell.style.getPropertyValue('--business-color')).toBe('target')
    expect(shell.style.color).toBe('')
    bridge.dispose()
  })

  it('祖先改值、删除内层声明与来源换父后异步跟随', async () => {
    const { outer, inner, source, shell } = fixture()
    const other = document.createElement('section')
    other.setAttribute('data-theme', 'light')
    document.body.append(other)
    outer.setAttribute('data-theme', 'dark')
    inner.setAttribute('data-density', 'compact')
    outer.style.setProperty('--business-color', 'first')
    const bridge = createPortalVisualBridge({ source, shell })

    outer.setAttribute('data-theme', 'light')
    inner.removeAttribute('data-density')
    await settleMutations()
    expect(shell.getAttribute('data-theme')).toBe('light')
    expect(shell.hasAttribute('data-density')).toBe(false)
    expect(shell.style.getPropertyValue('--business-color')).toBe('first')

    outer.style.setProperty('--business-color', 'second')
    await settleMutations()
    expect(shell.style.getPropertyValue('--business-color')).toBe('second')

    other.append(source)
    await settleMutations()
    expect(shell.getAttribute('data-theme')).toBe('light')
    expect(shell.style.getPropertyValue('--business-color')).toBe('')
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

  it('dispose 幂等停止跟随，并精确还原接管前的壳属性与自定义属性', async () => {
    const { outer, source, shell } = fixture()
    outer.setAttribute('data-theme', 'dark')
    shell.setAttribute('data-theme', 'legacy')
    shell.setAttribute('dir', 'ltr')
    shell.style.setProperty('--business-color', 'legacy')
    outer.style.setProperty('--business-color', 'source')
    const bridge = createPortalVisualBridge({ source, shell })
    expect(shell.getAttribute('data-theme')).toBe('dark')
    expect(shell.hasAttribute('dir')).toBe(false)
    expect(shell.style.getPropertyValue('--business-color')).toBe('source')

    bridge.dispose()
    bridge.dispose()
    expect(shell.getAttribute('data-theme')).toBe('legacy')
    expect(shell.getAttribute('dir')).toBe('ltr')
    expect(shell.style.getPropertyValue('--business-color')).toBe('legacy')
    outer.setAttribute('data-theme', 'light')
    await settleMutations()
    expect(shell.getAttribute('data-theme')).toBe('legacy')
  })

  it('桥接样式表声明的自定义属性，不复制普通计算样式', () => {
    const style = document.createElement('style')
    style.textContent = '.portal-source { --business-color: rebeccapurple; color: red; }'
    document.head.append(style)
    const { source, shell } = fixture()
    source.className = 'portal-source'

    const bridge = createPortalVisualBridge({ source, shell })
    expect(shell.style.getPropertyValue('--business-color')).toBe('rebeccapurple')
    expect(shell.style.color).toBe('')
    bridge.dispose()
    style.remove()
  })

  it('壳从父节点就能继承到的自定义属性不复制，祖先链上的局部覆盖才复制', () => {
    // 壳挂在 body 下，body 上的声明对壳与来源同样可见，等同 :root 上的令牌
    document.body.style.setProperty('--xh-token', 'shared')
    document.body.style.setProperty('--business-color', 'base')
    const { outer, source, shell } = fixture()
    outer.style.setProperty('--business-color', 'override')

    const bridge = createPortalVisualBridge({ source, shell })
    expect(shell.style.getPropertyValue('--xh-token')).toBe('')
    expect(shell.style.getPropertyValue('--business-color')).toBe('override')
    expect(Array.from({ length: shell.style.length }, (_, index) => shell.style.item(index))).toEqual(['--business-color'])
    bridge.dispose()
    document.body.style.removeProperty('--xh-token')
    document.body.style.removeProperty('--business-color')
  })

  it('祖先撤销覆盖、与壳父节点重新一致后，壳上的投影也撤掉', async () => {
    document.body.style.setProperty('--business-color', 'base')
    const { outer, source, shell } = fixture()
    outer.style.setProperty('--business-color', 'override')
    const bridge = createPortalVisualBridge({ source, shell })
    expect(shell.style.getPropertyValue('--business-color')).toBe('override')

    outer.style.removeProperty('--business-color')
    await settleMutations()
    expect(shell.style.getPropertyValue('--business-color')).toBe('')
    expect(shell.style.length).toBe(0)
    bridge.dispose()
    document.body.style.removeProperty('--business-color')
  })

  it('来源的 data-state / aria-* 翻转、body 里插护栏与不含自定义属性的 inline 样式都不触发重同步', async () => {
    // 样式表改动本身不被观察：桥只会在被触发重同步时才读到新值，借此判定哪些变更触发了同步
    const style = document.createElement('style')
    style.textContent = '.portal-source { --business-color: first; } .tinted { --tint: 1; }'
    document.head.append(style)
    const { source, shell } = fixture()
    source.className = 'portal-source'
    const bridge = createPortalVisualBridge({ source, shell })
    expect(shell.style.getPropertyValue('--business-color')).toBe('first')

    style.textContent = '.portal-source { --business-color: second; } .tinted { --tint: 1; }'
    source.setAttribute('data-state', 'open')
    source.setAttribute('aria-expanded', 'true')
    source.setAttribute('aria-controls', 'content')
    source.textContent = '已选中'
    const guard = document.createElement('span')
    guard.dataset.xhFocusGuard = ''
    document.body.append(guard)
    document.body.style.overflow = 'hidden'
    await settleMutations()
    expect(shell.style.getPropertyValue('--business-color')).toBe('first')

    source.classList.add('tinted')
    await settleMutations()
    expect(shell.style.getPropertyValue('--business-color')).toBe('second')

    style.textContent = '.portal-source { --business-color: third; } .tinted { --tint: 1; }'
    document.body.style.setProperty('--other', '1')
    await settleMutations()
    expect(shell.style.getPropertyValue('--business-color')).toBe('third')

    bridge.dispose()
    style.remove()
    document.body.style.removeProperty('--other')
    document.body.style.overflow = ''
  })

  it('祖先上与自定义属性无关的 class 增删不触发重同步，页面级过渡类不再拖动链下每台桥', async () => {
    const style = document.createElement('style')
    style.textContent = '.portal-source { --business-color: first; }'
    document.head.append(style)
    const { outer, source, shell } = fixture()
    source.className = 'portal-source'
    const bridge = createPortalVisualBridge({ source, shell })
    expect(shell.style.getPropertyValue('--business-color')).toBe('first')

    style.textContent = '.portal-source { --business-color: second; }'
    for (const token of ['page-enter-from', 'page-enter-active', 'page-enter-to']) {
      outer.classList.add(token)
      await settleMutations()
      outer.classList.remove(token)
      await settleMutations()
    }
    expect(shell.style.getPropertyValue('--business-color')).toBe('first')

    outer.classList.add('portal-source')
    await settleMutations()
    expect(shell.style.getPropertyValue('--business-color')).toBe('second')

    bridge.dispose()
    style.remove()
  })

  it('样式表里出现 [class] 属性选择器时，class 变更一律照旧重算', async () => {
    const style = document.createElement('style')
    style.textContent = '.portal-source { --business-color: first; } [class~="opaque"] { --tint: 1; }'
    document.head.append(style)
    const { outer, source, shell } = fixture()
    source.className = 'portal-source'
    const bridge = createPortalVisualBridge({ source, shell })
    expect(shell.style.getPropertyValue('--business-color')).toBe('first')

    style.textContent = '.portal-source { --business-color: second; } [class~="opaque"] { --tint: 1; }'
    outer.classList.add('page-enter-active')
    await settleMutations()
    expect(shell.style.getPropertyValue('--business-color')).toBe('second')

    bridge.dispose()
    style.remove()
  })

  it('只由文档根与复制过去的轴属性选中的声明不投影，壳带着同样的属性自己解析', () => {
    // 令牌层就是这个形状：同一条规则既选文档根、又选桥会复制过去的轴属性，壳带着属性自己命中
    const style = document.createElement('style')
    style.textContent = ':where(:root), :where([data-density=\'compact\']) { --pad-2: 4px; }'
      + '.dense[data-density=\'compact\'] { --pad-3: 6px; }'
    document.head.append(style)
    const { source, shell } = fixture()
    source.setAttribute('data-density', 'compact')
    source.className = 'dense'

    const bridge = createPortalVisualBridge({ source, shell })
    expect(shell.getAttribute('data-density')).toBe('compact')
    expect(shell.style.getPropertyValue('--pad-2')).toBe('')
    expect(shell.style.getPropertyValue('--pad-3')).toBe('6px')

    bridge.dispose()
    style.remove()
  })

  it('--xh- 命名空间只投影根上有声明的令牌覆盖，组件槽与家族槽不跟着触发器进浮层', () => {
    // 令牌层把全部令牌声明在根上；皮肤写在组件 / 家族元素上的槽只是组件内部级联
    document.documentElement.style.setProperty('--xh-color-brand-500', 'blue')
    const { outer, inner, source, shell } = fixture()
    outer.style.setProperty('--xh-collection-bg-rest', 'gray')
    outer.style.setProperty('--xh-menu-item-h', '40px')
    outer.style.setProperty('--xh-_collection-bg', 'gray')
    inner.style.setProperty('--xh-color-brand-500', 'red')
    inner.style.setProperty('--business-color', 'green')

    const bridge = createPortalVisualBridge({ source, shell })
    expect(shell.style.getPropertyValue('--xh-collection-bg-rest')).toBe('')
    expect(shell.style.getPropertyValue('--xh-menu-item-h')).toBe('')
    expect(shell.style.getPropertyValue('--xh-_collection-bg')).toBe('')
    expect(shell.style.getPropertyValue('--xh-color-brand-500')).toBe('red')
    expect(shell.style.getPropertyValue('--business-color')).toBe('green')
    expect(Array.from({ length: shell.style.length }, (_, index) => shell.style.item(index)).sort())
      .toEqual(['--business-color', '--xh-color-brand-500'])
    bridge.dispose()
    document.documentElement.style.removeProperty('--xh-color-brand-500')
  })

  it('根上后来才声明的 --xh- 名字在下一次同步时开始投影，不靠跨同步的缓存', async () => {
    const { outer, source, shell } = fixture()
    outer.style.setProperty('--xh-color-brand-500', 'red')
    const bridge = createPortalVisualBridge({ source, shell })
    expect(shell.style.getPropertyValue('--xh-color-brand-500')).toBe('')

    document.documentElement.style.setProperty('--xh-color-brand-500', 'blue')
    bridge.sync()
    expect(shell.style.getPropertyValue('--xh-color-brand-500')).toBe('red')
    bridge.dispose()
    document.documentElement.style.removeProperty('--xh-color-brand-500')
  })

  it('语气经 data-tone 属性带到壳上，取最近显式声明并跟随变化', async () => {
    const { outer, inner, source, shell } = fixture()
    outer.setAttribute('data-tone', 'danger')
    const bridge = createPortalVisualBridge({ source, shell })
    expect(shell.getAttribute('data-tone')).toBe('danger')

    inner.setAttribute('data-tone', 'success')
    await settleMutations()
    expect(shell.getAttribute('data-tone')).toBe('success')

    inner.removeAttribute('data-tone')
    outer.removeAttribute('data-tone')
    await settleMutations()
    expect(shell.hasAttribute('data-tone')).toBe(false)
    bridge.dispose()
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
