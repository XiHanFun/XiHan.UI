// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { createCounterIdGenerator } from '../src/kernel/id-generator'
import { createScope, getActiveElementDeep } from '../src/kernel/scope'

afterEach(() => {
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})

describe('id 生成', () => {
  // 计数器在模块级而非生成器级：调用点大多每个组件实例新建一个生成器，
  // 若计数随生成器走，各实例的首个 scopeId 全是同一个，DOM id 撞车会让 aria 引用串到别的实例
  it('两个生成器产出的 scopeId 互不相同', () => {
    const a = createCounterIdGenerator().scopeId()
    const b = createCounterIdGenerator().scopeId()
    expect(a).not.toBe(b)
  })

  it('同一个生成器连续取也不重复', () => {
    const gen = createCounterIdGenerator()
    expect(gen.scopeId()).not.toBe(gen.scopeId())
  })

  it('前缀可换', () => {
    expect(createCounterIdGenerator('zz').scopeId()).toMatch(/^zz-\d+$/)
  })

  it('partId 格式是 组件:scope:部件', () => {
    expect(createCounterIdGenerator().partId('dialog', 'xh-1', 'content')).toBe('dialog:xh-1:content')
  })
})

describe('scope 的 id 派生', () => {
  it('同一个 scope 里各部件 id 各不相同、且都带同一个 scope id', () => {
    const scope = createScope(null, createCounterIdGenerator())
    const ids = scope.ids('dialog', 'title', 'content')
    expect(ids.title).not.toBe(ids.content)
    expect(ids.title).toBe(scope.partId('dialog', 'title'))
    expect(ids.title).toContain(scope.id)
  })

  it('两个 scope 的同名部件 id 不撞车', () => {
    const gen = createCounterIdGenerator()
    const a = createScope(null, gen)
    const b = createScope(null, gen)
    expect(a.partId('dialog', 'content')).not.toBe(b.partId('dialog', 'content'))
  })
})

describe('scope 的宿主解析', () => {
  it('空锚点在无全局 Document 时给出稳定错误', () => {
    vi.stubGlobal('document', undefined)
    vi.stubGlobal('window', undefined)
    const scope = createScope(null, createCounterIdGenerator())

    expect(() => scope.getDoc()).toThrow('[xh] Scope 没有锚点，且宿主未提供有效的全局 Document')
    expect(() => scope.getWin()).toThrow('[xh] Scope 没有锚点，且宿主未提供有效的全局 Document')
  })

  it('离线 Document 不借用主窗口', () => {
    const offline = document.implementation.createHTMLDocument('offline')
    const node = offline.createElement('div')
    const scope = createScope(node, createCounterIdGenerator())

    expect(scope.getDoc()).toBe(offline)
    expect(() => scope.getWin()).toThrow('[xh] Scope 的 Document 没有活动 Window')
  })

  it('全部 DOM globals 缺失时仍从显式锚点识别离线 Document', () => {
    const offline = document.implementation.createHTMLDocument('offline-without-globals')
    const node = offline.createElement('div')
    offline.body.appendChild(node)
    const scope = createScope(node, createCounterIdGenerator())
    vi.stubGlobal('document', undefined)
    vi.stubGlobal('window', undefined)
    vi.stubGlobal('Node', undefined)
    vi.stubGlobal('Document', undefined)
    vi.stubGlobal('Window', undefined)
    vi.stubGlobal('Element', undefined)
    vi.stubGlobal('HTMLElement', undefined)
    vi.stubGlobal('ShadowRoot', undefined)

    expect(scope.getDoc()).toBe(offline)
    expect(() => scope.getWin()).toThrow('[xh] Scope 的 Document 没有活动 Window')
  })

  it('节点为空时回退到全局 document', () => {
    const scope = createScope(null, createCounterIdGenerator())
    expect(scope.getDoc()).toBe(document)
    expect(scope.isShadow()).toBe(false)
  })

  it('动态锚点未就绪时明确失败，不借 ambient document；id 派生仍保持稳定', () => {
    const anchor: Element | null = null
    const scope = createScope(() => anchor, createCounterIdGenerator())
    const id = scope.id
    const partId = scope.partId('date-picker', 'content')

    expect(() => scope.getRootNode()).toThrow('[xh] Scope 的动态锚点尚未就绪')
    expect(() => scope.getDoc()).toThrow('[xh] Scope 的动态锚点尚未就绪')
    expect(() => scope.getWin()).toThrow('[xh] Scope 的动态锚点尚未就绪')
    expect(() => scope.getById('target')).toThrow('[xh] Scope 的动态锚点尚未就绪')
    expect(scope.id).toBe(id)
    expect(scope.partId('date-picker', 'content')).toBe(partId)
  })

  it('动态锚点返回非 Element 时明确拒绝，不把相似对象或 Document 当宿主', () => {
    const documentSource = (() => document) as unknown as () => Element
    const objectSource = (() => ({ ownerDocument: document })) as unknown as () => Element

    expect(() => createScope(documentSource, createCounterIdGenerator()).getDoc())
      .toThrow('[xh] Scope 的动态锚点必须返回 Element')
    expect(() => createScope(objectSource, createCounterIdGenerator()).getDoc())
      .toThrow('[xh] Scope 的动态锚点必须返回 Element')
  })

  it('动态锚点就位后逐次读取真实 Document、Window、root、查询与计算样式', () => {
    const mainTarget = document.createElement('div')
    mainTarget.id = 'target'
    document.body.appendChild(mainTarget)

    const frame = document.createElement('iframe')
    document.body.appendChild(frame)
    const frameDocument = frame.contentDocument!
    const frameWindow = frame.contentWindow!
    const host = frameDocument.createElement('div')
    frameDocument.body.appendChild(host)
    const shadow = host.attachShadow({ mode: 'open' })
    const frameTarget = frameDocument.createElement('button')
    frameTarget.id = 'target'
    frameTarget.style.color = 'rgb(12, 34, 56)'
    shadow.appendChild(frameTarget)

    let anchor: Element | null = mainTarget
    const scope = createScope(() => anchor, createCounterIdGenerator())
    const id = scope.id

    expect(scope.getRootNode()).toBe(document)
    expect(scope.getDoc()).toBe(document)
    expect(scope.getWin()).toBe(window)
    expect(scope.getById('target')).toBe(mainTarget)

    anchor = frameTarget
    frameTarget.focus()
    expect(scope.getRootNode()).toBe(shadow)
    expect(scope.getDoc()).toBe(frameDocument)
    expect(scope.getWin()).toBe(frameWindow)
    expect(scope.getById('target')).toBe(frameTarget)
    expect(scope.getActiveElement()).toBe(frameTarget)
    expect(scope.getComputedStyle(frameTarget).color).toBe('rgb(12, 34, 56)')
    expect(scope.isShadow()).toBe(true)
    expect(scope.id).toBe(id)

    anchor = null
    expect(() => scope.getDoc()).toThrow('[xh] Scope 的动态锚点尚未就绪')
  })

  it('动态锚点被 adopt 后不缓存旧 realm，立即按新的 ownerDocument 解析', () => {
    const frame = document.createElement('iframe')
    document.body.appendChild(frame)
    const frameDocument = frame.contentDocument!
    const moving = frameDocument.createElement('div')
    moving.id = 'moving'
    frameDocument.body.appendChild(moving)

    const scope = createScope(() => moving, createCounterIdGenerator())
    expect(scope.getDoc()).toBe(frameDocument)
    expect(scope.getWin()).toBe(frame.contentWindow)
    expect(scope.getById('moving')).toBe(moving)

    document.adoptNode(moving)
    document.body.appendChild(moving)
    expect(scope.getRootNode()).toBe(document)
    expect(scope.getDoc()).toBe(document)
    expect(scope.getWin()).toBe(window)
    expect(scope.getById('moving')).toBe(moving)
  })

  it('节点在 shadow root 里时认 shadow root', () => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const shadow = host.attachShadow({ mode: 'open' })
    const inner = document.createElement('div')
    shadow.appendChild(inner)

    const scope = createScope(inner, createCounterIdGenerator())
    expect(scope.isShadow()).toBe(true)
    expect(scope.getRootNode()).toBe(shadow)
    expect(scope.getDoc()).toBe(document)
  })

  it('getById 在自己的 root 里找，找不到外面的', () => {
    const outside = document.createElement('div')
    outside.id = 'outside'
    document.body.appendChild(outside)

    const host = document.createElement('div')
    document.body.appendChild(host)
    const shadow = host.attachShadow({ mode: 'open' })
    const inner = document.createElement('div')
    inner.id = 'inner'
    shadow.appendChild(inner)

    const scope = createScope(inner, createCounterIdGenerator())
    expect(scope.getById('inner')).toBe(inner)
    expect(scope.getById('outside')).toBeNull()
  })

  // id 会被拼进选择器，含特殊字符时不转义会直接把查询打崩
  it('id 里的特殊字符不会打崩查询', () => {
    const el = document.createElement('div')
    el.id = 'a:b.c'
    document.body.appendChild(el)
    const scope = createScope(null, createCounterIdGenerator())
    expect(() => scope.getById('a:b.c')).not.toThrow()
    expect(scope.getById('a:b.c')).toBe(el)
  })
})

describe('getActiveElementDeep', () => {
  it('返回带焦点能力的 svg 元素', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('tabindex', '0')
    document.body.appendChild(svg)
    svg.focus()

    expect(getActiveElementDeep(document)).toBe(svg)
    expect(createScope(svg, createCounterIdGenerator()).getActiveElement()).toBe(svg)
  })

  it('没有 shadow 时就是 document.activeElement', () => {
    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()
    expect(getActiveElementDeep(document)).toBe(input)
  })

  it('穿透 shadow root 找到真正聚焦的那个', () => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const shadow = host.attachShadow({ mode: 'open' })
    const input = document.createElement('input')
    shadow.appendChild(input)
    input.focus()

    expect(document.activeElement).toBe(host)
    expect(getActiveElementDeep(document)).toBe(input)
  })

  it('嵌套多层 shadow 也能挖到底', () => {
    const outer = document.createElement('div')
    document.body.appendChild(outer)
    const outerShadow = outer.attachShadow({ mode: 'open' })
    const inner = document.createElement('div')
    outerShadow.appendChild(inner)
    const innerShadow = inner.attachShadow({ mode: 'open' })
    const input = document.createElement('input')
    innerShadow.appendChild(input)
    input.focus()

    expect(getActiveElementDeep(document)).toBe(input)
  })

  it('scope.getActiveElement 从自己的 root 起算', () => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const shadow = host.attachShadow({ mode: 'open' })
    const input = document.createElement('input')
    shadow.appendChild(input)
    input.focus()

    const scope = createScope(input, createCounterIdGenerator())
    expect(scope.getActiveElement()).toBe(input)
  })
})
