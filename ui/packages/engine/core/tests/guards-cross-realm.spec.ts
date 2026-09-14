// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createCounterIdGenerator,
  createScope,
  isDocument,
  isElement,
  isHTMLElement,
  isShadowRoot,
  isWindow,
} from '../src/kernel'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('跨窗口 dom 类型守卫', () => {
  it('识别 iframe 自己的 document、window、html/svg 元素与 shadow root', () => {
    const frame = document.createElement('iframe')
    document.body.appendChild(frame)
    const frameWindow = frame.contentWindow!
    const frameDocument = frame.contentDocument!
    const html = frameDocument.createElement('div')
    const svg = frameDocument.createElementNS('http://www.w3.org/2000/svg', 'svg')
    const host = frameDocument.createElement('div')
    frameDocument.body.appendChild(host)
    const shadow = host.attachShadow({ mode: 'open' })

    const frameGlobals = frameWindow as Window & typeof globalThis
    expect(frameGlobals.Document).not.toBe(Document)
    expect(frameGlobals.HTMLElement).not.toBe(HTMLElement)
    expect(frameGlobals.ShadowRoot).not.toBe(ShadowRoot)
    expect(isDocument(frameDocument)).toBe(true)
    expect(isWindow(frameWindow)).toBe(true)
    expect(isElement(html)).toBe(true)
    expect(isElement(svg)).toBe(true)
    expect(isHTMLElement(html)).toBe(true)
    expect(isHTMLElement(svg)).toBe(false)
    expect(isShadowRoot(shadow)).toBe(true)
  })

  it('识别没有 defaultView 的跨窗口离线 document 与元素', () => {
    const frame = document.createElement('iframe')
    document.body.appendChild(frame)
    const detached = frame.contentDocument!.implementation.createHTMLDocument('离线')
    const html = detached.createElement('div')
    const svg = detached.createElementNS('http://www.w3.org/2000/svg', 'svg')

    expect(detached.defaultView).toBeNull()
    expect(isDocument(detached)).toBe(true)
    expect(isElement(html)).toBe(true)
    expect(isElement(svg)).toBe(true)
    expect(isHTMLElement(html)).toBe(true)
    expect(isHTMLElement(svg)).toBe(false)
    expect(isDocument(document.implementation.createDocument(null, '', null))).toBe(true)
  })

  it('detached iframe 元素与普通 DocumentFragment 不会让 scope 回落到主文档', () => {
    const frame = document.createElement('iframe')
    document.body.appendChild(frame)
    const frameDocument = frame.contentDocument!
    const detached = frameDocument.createElement('div')
    const fragment = frameDocument.createDocumentFragment()
    const inFragment = frameDocument.createElement('span')
    fragment.appendChild(inFragment)

    expect(createScope(detached, createCounterIdGenerator()).getDoc()).toBe(frameDocument)
    expect(createScope(inFragment, createCounterIdGenerator()).getDoc()).toBe(frameDocument)
    expect(isShadowRoot(fragment)).toBe(false)
  })

  it('节点被 adopt 到另一文档后仍按真实 DOM 身份识别', () => {
    const frame = document.createElement('iframe')
    document.body.appendChild(frame)
    const foreign = frame.contentDocument!.createElement('div')
    const adopted = document.adoptNode(foreign)

    expect(adopted.ownerDocument).toBe(document)
    expect(isElement(adopted)).toBe(true)
    expect(isHTMLElement(adopted)).toBe(true)
  })

  it('createScope 沿 iframe 节点解析所属 root、document 与 window', () => {
    const frame = document.createElement('iframe')
    document.body.appendChild(frame)
    const frameWindow = frame.contentWindow!
    const frameDocument = frame.contentDocument!
    const inner = frameDocument.createElement('div')
    frameDocument.body.appendChild(inner)

    const scope = createScope(inner, createCounterIdGenerator())
    expect(scope.getRootNode()).toBe(frameDocument)
    expect(scope.getDoc()).toBe(frameDocument)
    expect(scope.getWin()).toBe(frameWindow)
  })

  it('createScope 沿 iframe 内的 shadow 节点解析所属 shadow root', () => {
    const frame = document.createElement('iframe')
    document.body.appendChild(frame)
    const frameDocument = frame.contentDocument!
    const host = frameDocument.createElement('div')
    frameDocument.body.appendChild(host)
    const shadow = host.attachShadow({ mode: 'open' })
    const inner = frameDocument.createElement('span')
    shadow.appendChild(inner)

    const scope = createScope(inner, createCounterIdGenerator())
    expect(scope.getRootNode()).toBe(shadow)
    expect(scope.getDoc()).toBe(frameDocument)
    expect(scope.isShadow()).toBe(true)
  })

  it('拒绝只有相似字段的普通对象', () => {
    const fakeWindow: Record<string, unknown> = {}
    fakeWindow.window = fakeWindow
    fakeWindow.document = document
    const fakeDocument = { nodeType: 9, createElement: () => ({}), documentElement: {} }
    const fakeElement = {
      nodeType: 1,
      ownerDocument: document,
      namespaceURI: 'http://www.w3.org/1999/xhtml',
      getAttribute: () => null,
      matches: () => false,
      style: {},
    }
    const fakeShadow = { nodeType: 11, mode: 'open', host: fakeElement, ownerDocument: document }

    expect(isWindow(fakeWindow)).toBe(false)
    expect(isDocument(fakeDocument)).toBe(false)
    expect(isElement(fakeElement)).toBe(false)
    expect(isHTMLElement(fakeElement)).toBe(false)
    expect(isShadowRoot(fakeShadow)).toBe(false)
    expect(isDocument(Object.create(Document.prototype))).toBe(false)
    expect(isElement(Object.create(Element.prototype))).toBe(false)
    expect(isHTMLElement(Object.create(HTMLElement.prototype))).toBe(false)
    expect(isShadowRoot(Object.create(ShadowRoot.prototype))).toBe(false)
    expect(isDocument({ [Symbol.toStringTag]: 'Document' })).toBe(false)
  })

  it('属性读取会抛错的代理只返回 false', () => {
    const hostile = new Proxy({}, {
      get: () => {
        throw new Error('禁止读取')
      },
      getPrototypeOf: () => {
        throw new Error('禁止读取原型')
      },
    })

    for (const guard of [isDocument, isWindow, isShadowRoot, isHTMLElement, isElement])
      expect(() => guard(hostile)).not.toThrow()
    expect([isDocument, isWindow, isShadowRoot, isHTMLElement, isElement].some(guard => guard(hostile))).toBe(false)

    const revoked = Proxy.revocable({}, {})
    revoked.revoke()
    for (const guard of [isDocument, isWindow, isShadowRoot, isHTMLElement, isElement])
      expect(() => guard(revoked.proxy)).not.toThrow()
  })

  it('没有全局 DOM 构造器时返回 false，不产生 ReferenceError', () => {
    const element = document.createElement('div')
    vi.stubGlobal('Node', undefined)
    try {
      expect(isDocument(document)).toBe(false)
      expect(isWindow(window)).toBe(false)
      expect(isElement(element)).toBe(false)
      expect(isHTMLElement(element)).toBe(false)
      expect(isShadowRoot(document.createElement('div').attachShadow({ mode: 'open' }))).toBe(false)
    }
    finally {
      vi.unstubAllGlobals()
    }
  })

  it('顶层 DOM 构造器缺失时仍用节点所属 iframe realm 完成品牌检查', () => {
    const frame = document.createElement('iframe')
    document.body.appendChild(frame)
    const frameWindow = frame.contentWindow!
    const frameDocument = frame.contentDocument!
    const element = frameDocument.createElement('div')
    const shadow = element.attachShadow({ mode: 'open' })

    vi.stubGlobal('Node', undefined)
    vi.stubGlobal('Document', undefined)
    vi.stubGlobal('Window', undefined)
    vi.stubGlobal('Element', undefined)
    vi.stubGlobal('HTMLElement', undefined)
    vi.stubGlobal('ShadowRoot', undefined)
    try {
      expect(isDocument(frameDocument)).toBe(true)
      expect(isWindow(frameWindow)).toBe(true)
      expect(isElement(element)).toBe(true)
      expect(isHTMLElement(element)).toBe(true)
      expect(isShadowRoot(shadow)).toBe(true)
      const scope = createScope(element, createCounterIdGenerator())
      expect(scope.getDoc()).toBe(frameDocument)
      expect(scope.getWin()).toBe(frameWindow)
    }
    finally {
      vi.unstubAllGlobals()
    }
  })
})
