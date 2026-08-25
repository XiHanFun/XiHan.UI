// @vitest-environment jsdom
//
// 卡片是另一个自定义元素（<xh-notification-item>），一致性夹具只挂一个宿主，
// 塞不进那棵树——所以卡片这一帧只能在这里守。
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
}

const MARKUP = `
  <div data-xh-part="item">
    <span data-xh-part="item-indicator"></span>
    <div data-xh-part="item-title">有新的审批</div>
    <div data-xh-part="item-description">张三提交了一份请假单</div>
    <button data-xh-part="item-action-trigger">查看</button>
    <button data-xh-part="item-close-trigger"></button>
  </div>
`

function mount(attrs = ''): Updatable {
  const host = document.createElement('div')
  host.innerHTML = `<xh-notification-item duration="0"${attrs ? ` ${attrs}` : ''}>${MARKUP}</xh-notification-item>`
  document.body.appendChild(host)
  return host.firstElementChild as Updatable
}

function part(el: Element, name: string): HTMLElement {
  return el.querySelector<HTMLElement>(`[data-xh-part="${name}"]`)!
}

describe('xh-notification-item 的角色节点', () => {
  it('五个部件都接上线，名字与说明各指其位', async () => {
    const el = mount()
    await settle(el)

    const item = part(el, 'item')
    expect(item.getAttribute('data-scope')).toBe('notification')
    expect(item.getAttribute('role')).toBe('status')
    expect(item.getAttribute('aria-live')).toBe('polite')
    expect(item.getAttribute('aria-atomic')).toBe('true')
    expect(item.getAttribute('data-type')).toBe('info')
    expect(item.getAttribute('data-tone')).toBe('info')
    expect(item.getAttribute('data-state')).toBe('visible')

    // 名字与说明必须真的指到那两个节点上，别是悬空的 IDREF
    expect(item.getAttribute('aria-labelledby')).toBe(part(el, 'item-title').id)
    expect(item.getAttribute('aria-describedby')).toBe(part(el, 'item-description').id)

    // 类型字形是装饰，读屏念标题就够了
    expect(part(el, 'item-indicator').getAttribute('aria-hidden')).toBe('true')
    expect(part(el, 'item-close-trigger').getAttribute('aria-label')).toBe('Close')
  })

  it('type=error 换成 alert + assertive，语气落 danger', async () => {
    const el = mount('type="error"')
    await settle(el)

    const item = part(el, 'item')
    expect(item.getAttribute('role')).toBe('alert')
    expect(item.getAttribute('aria-live')).toBe('assertive')
    // 词汇表里没有 error 这个语气，出错走 danger
    expect(item.getAttribute('data-tone')).toBe('danger')
  })

  it('closable="false"：叉转原生 disabled 并收起', async () => {
    const el = mount('closable="false"')
    await settle(el)

    const close = part(el, 'item-close-trigger')
    expect(close.hasAttribute('disabled')).toBe(true)
    expect(close.hasAttribute('hidden')).toBe(true)
  })
})
