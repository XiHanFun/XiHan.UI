// @vitest-environment jsdom
//
// 自绘条的共享层：节点由库建、挂在作者写的壳上，作者一个字不用写。
// 这里钉住四件事：三层节点建在壳里且一个 data-xh-part 都不带（打了会被 discoverParts
// 收进 partMap，野节点告警与重接线环一并找上门）；壳不在场时安全早退，且此时滚动层
// 绝不能被打上标记（原生条被藏、自绘条又没来，那是一条滚动条都没有）、也不投诊断；
// 多轮更新只建一次；作者换掉壳时整套跟过去。
import { DIAGNOSTIC_CODES, onDiagnostic, setDiagnosticsDedupe } from '@xihan-ui/kernel'
import { beforeEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface Updatable extends HTMLElement { updateComplete: Promise<unknown> }

beforeEach(() => {
  document.body.innerHTML = ''
})

async function settle(el: Updatable): Promise<void> {
  await el.updateComplete
  await el.updateComplete
  await new Promise(r => setTimeout(r, 0))
  await el.updateComplete
  await el.updateComplete
}

const LIST = `
  <div data-xh-part="content">
    <div data-xh-part="item" value="apple"><span data-xh-part="item-text">苹果</span></div>
  </div>
`

const MARKUP = `
  <div data-xh-part="root">
    <div data-xh-part="control">
      <input data-xh-part="input" />
      <button data-xh-part="trigger"></button>
    </div>
    <div data-xh-part="positioner">${LIST}</div>
  </div>
`

/** 没写 positioner：滚动层在场、壳不在场，条子无处可挂。 */
const NO_SHELL = `
  <div data-xh-part="root">
    <div data-xh-part="control">
      <input data-xh-part="input" />
      <button data-xh-part="trigger"></button>
    </div>
    ${LIST}
  </div>
`

/** 浮层那一片整个没写：壳与滚动层都不在场。 */
const NO_OVERLAY = `
  <div data-xh-part="root">
    <div data-xh-part="control">
      <input data-xh-part="input" />
      <button data-xh-part="trigger"></button>
    </div>
  </div>
`

function mount(markup = MARKUP): Updatable {
  const el = document.createElement('xh-combobox') as Updatable
  el.innerHTML = markup
  el.setAttribute('default-open', '')
  document.body.appendChild(el)
  return el
}

function roots(el: HTMLElement): HTMLElement[] {
  return [...el.querySelectorAll<HTMLElement>('[data-scope="scrollbar"][data-part="root"]')]
}

function positioner(el: HTMLElement): HTMLElement {
  return el.querySelector<HTMLElement>('[data-xh-part="positioner"]')!
}

describe('条子挂在作者写的壳上', () => {
  it('三层节点建在 positioner 里，与 content 同级', async () => {
    const el = mount()
    await settle(el)

    expect(roots(el)).toHaveLength(1)
    const root = roots(el)[0]!
    expect(root.parentElement).toBe(positioner(el))
    expect(root.querySelector('[data-scope="scrollbar"][data-part="track"]')).not.toBeNull()
    expect(root.querySelector('[data-scope="scrollbar"][data-part="thumb"]')).not.toBeNull()
  })

  it('一个 data-xh-part 都不带', async () => {
    const el = mount()
    await settle(el)

    const nodes = [...el.querySelectorAll<HTMLElement>('[data-scope="scrollbar"]')]
    expect(nodes.length).toBeGreaterThan(0)
    for (const node of nodes)
      expect(node.hasAttribute('data-xh-part')).toBe(false)
  })

  it('滚动层带上标记，原生条交给皮肤藏掉', async () => {
    const el = mount()
    await settle(el)

    expect(el.querySelector('[data-xh-part="content"]')!.getAttribute('data-xh-scrollbar')).toBe('1')
  })

  it('多轮更新只建一次', async () => {
    const el = mount()
    await settle(el)
    el.setAttribute('placeholder', '筛选')
    await settle(el)
    el.setAttribute('size', 'lg')
    await settle(el)

    expect(roots(el)).toHaveLength(1)
  })

  it('按在条子上不会把浮层消解掉', async () => {
    const el = mount()
    await settle(el)

    const content = el.querySelector<HTMLElement>('[data-xh-part="content"]')!
    const track = el.querySelector<HTMLElement>('[data-scope="scrollbar"][data-part="track"]')!
    expect(content.getAttribute('data-state')).toBe('open')

    track.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, composed: true }))
    await settle(el)

    expect(content.getAttribute('data-state')).toBe('open')
  })

  it('作者换掉壳，整套跟过去', async () => {
    const el = mount()
    await settle(el)
    const before = positioner(el)

    const next = document.createElement('div')
    next.setAttribute('data-xh-part', 'positioner')
    next.innerHTML = LIST
    before.replaceWith(next)
    await settle(el)

    expect(roots(el)).toHaveLength(1)
    expect(roots(el)[0]!.parentElement).toBe(next)
  })
})

describe('标记里没有壳', () => {
  it('不建条子，也不给滚动层打标记', async () => {
    const el = mount(NO_SHELL)
    await settle(el)

    expect(roots(el)).toHaveLength(0)
    expect(el.querySelector('[data-xh-part="content"]')!.hasAttribute('data-xh-scrollbar')).toBe(false)
  })

  it('浮层那一片整个没写时，不替作者投一条「找不到滚动容器」', async () => {
    // 直接收诊断而不是盯 console：同一条诊断整个进程只打印一次，盯 console 会把这条判据变成恒真
    const codes: string[] = []
    setDiagnosticsDedupe(false)
    const off = onDiagnostic(record => void codes.push(record.code))
    try {
      const el = mount(NO_OVERLAY)
      await settle(el)

      // 条子的机器一跑起来就去解析滚动容器，壳都没有的树里那次解析注定落空；
      // 那条诊断留给「写了壳却没写滚动层」的真误用
      expect(codes).not.toContain(DIAGNOSTIC_CODES.scrollbarMissingScrollable)
    }
    finally {
      off()
      setDiagnosticsDedupe(true)
    }
  })
})
