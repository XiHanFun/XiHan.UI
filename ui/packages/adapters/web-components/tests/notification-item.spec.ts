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
    expect(item.getAttribute('data-tone')).toBe('info')
    expect(item.hasAttribute('data-loading')).toBe(false)
    expect(item.getAttribute('data-state')).toBe('visible')

    // 名字与说明必须真的指到那两个节点上，别是悬空的 IDREF
    expect(item.getAttribute('aria-labelledby')).toBe(part(el, 'item-title').id)
    expect(item.getAttribute('aria-describedby')).toBe(part(el, 'item-description').id)

    // 类型字形是装饰，读屏念标题就够了
    expect(part(el, 'item-indicator').getAttribute('aria-hidden')).toBe('true')
    expect(part(el, 'item-close-trigger').getAttribute('aria-label')).toBe('Close')
  })

  it('两颗钮带 Action Control 家族属性：操作钮 text outline sm，叉 icon ghost sm', async () => {
    const el = mount()
    await settle(el)

    const action = part(el, 'item-action-trigger')
    expect(action.getAttribute('data-xh-action-control')).toBe('')
    expect(action.getAttribute('data-xh-action-profile')).toBe('text')
    expect(action.getAttribute('data-xh-action-variant')).toBe('outline')
    expect(action.getAttribute('data-xh-action-display')).toBe('always')
    expect(action.getAttribute('data-xh-action-size')).toBe('sm')

    const close = part(el, 'item-close-trigger')
    expect(close.getAttribute('data-xh-action-control')).toBe('')
    expect(close.getAttribute('data-xh-action-profile')).toBe('icon')
    expect(close.getAttribute('data-xh-action-variant')).toBe('ghost')
    expect(close.getAttribute('data-xh-action-display')).toBe('always')
    expect(close.getAttribute('data-xh-action-size')).toBe('sm')
  })

  it('tone=danger 换成 alert + assertive', async () => {
    const el = mount('tone="danger"')
    await settle(el)

    const item = part(el, 'item')
    expect(item.getAttribute('role')).toBe('alert')
    expect(item.getAttribute('aria-live')).toBe('assertive')
    expect(item.getAttribute('data-tone')).toBe('danger')
  })

  it('loading 落到卡片上，语气位不受它影响；指示符靠祖先选择器换字形', async () => {
    const el = mount('loading tone="success"')
    await settle(el)

    const item = part(el, 'item')
    expect(item.hasAttribute('data-loading')).toBe(true)
    expect(item.getAttribute('data-tone')).toBe('success')
    expect(part(el, 'item-indicator').hasAttribute('data-loading')).toBe(false)
  })

  it('closable="false"：叉转原生 disabled 并收起', async () => {
    const el = mount('closable="false"')
    await settle(el)

    const close = part(el, 'item-close-trigger')
    expect(close.hasAttribute('disabled')).toBe(true)
    expect(close.hasAttribute('hidden')).toBe(true)
  })

  it('按压通道：关闭钮与操作钮 Space / Enter 与触屏按住投影 data-pressed，抬起、失焦或指针取消撤下', async () => {
    const el = mount()
    await settle(el)
    for (const name of ['item-close-trigger', 'item-action-trigger'] as const) {
      const target = part(el, name)
      expect(target.hasAttribute('data-pressed')).toBe(false)
      target.focus()
      target.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }))
      await settle(el)
      expect(target.hasAttribute('data-pressed')).toBe(true)
      target.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', bubbles: true, cancelable: true }))
      await settle(el)
      expect(target.hasAttribute('data-pressed')).toBe(false)
      target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }))
      await settle(el)
      expect(target.hasAttribute('data-pressed')).toBe(true)
      target.blur()
      await settle(el)
      expect(target.hasAttribute('data-pressed')).toBe(false)
      target.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'mouse', bubbles: true, cancelable: true }))
      await settle(el)
      expect(target.hasAttribute('data-pressed')).toBe(false)
      target.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'touch', bubbles: true, cancelable: true }))
      await settle(el)
      expect(target.hasAttribute('data-pressed')).toBe(true)
      target.dispatchEvent(new PointerEvent('pointercancel', { pointerType: 'touch', bubbles: true }))
      await settle(el)
      expect(target.hasAttribute('data-pressed')).toBe(false)
    }
  })

  it('按压通道：按住 Enter 关掉卡片，按压面随退场由机器收；closable="false" 的叉不进', async () => {
    const el = mount()
    await settle(el)
    const close = part(el, 'item-close-trigger')
    close.focus()
    close.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }))
    await settle(el)
    expect(close.hasAttribute('data-pressed')).toBe(true)
    close.click()
    await settle(el)
    // 这里没有退场动画可等：进入退场后随即收起；按压面在进入退场时已由机器收掉
    expect(part(el, 'item').getAttribute('data-state')).not.toBe('visible')
    expect(close.hasAttribute('data-pressed')).toBe(false)

    const locked = mount('closable="false"')
    await settle(locked)
    const lockedClose = part(locked, 'item-close-trigger')
    lockedClose.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }))
    lockedClose.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'touch', bubbles: true, cancelable: true }))
    await settle(locked)
    expect(lockedClose.hasAttribute('data-pressed')).toBe(false)
  })
})
