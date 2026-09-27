// @vitest-environment jsdom

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

const VALUES = ['one', 'two', 'three'] as const

/** 面板内容写在面板里的 <template> 中：元素按挂载时机把它克隆进来或撤走。 */
function mount(attrs: string): Updatable {
  const host = document.createElement('div')
  host.innerHTML = `
    <xh-tabs default-value="one" ${attrs}>
      <div data-xh-part="root">
        <div data-xh-part="list">
          ${VALUES.map(v => `<button data-xh-part="trigger" value="${v}">${v}</button>`).join('')}
        </div>
        ${VALUES.map(v => `<div data-xh-part="content" value="${v}"><template><span data-testid="panel-${v}">${v}</span></template></div>`).join('')}
      </div>
    </xh-tabs>`
  document.body.appendChild(host)
  return host.querySelector('xh-tabs') as Updatable
}

function rendered(el: HTMLElement): string[] {
  return VALUES.filter(v => el.querySelector(`[data-testid="panel-${v}"]`))
}

async function clickTrigger(el: Updatable, index: number): Promise<void> {
  el.querySelectorAll<HTMLElement>('[data-xh-part="trigger"]')[index]!.click()
  await settle(el)
}

describe('xh-tabs 面板内容的挂载时机', () => {
  it('缺省把三块面板的模板都克隆进来', async () => {
    const el = mount('')
    await settle(el)
    expect(rendered(el)).toEqual(['one', 'two', 'three'])
  })

  it('lazy-mount：第一次选中才克隆，之后一直留着；模板本身留在原处', async () => {
    const el = mount('lazy-mount')
    await settle(el)
    expect(rendered(el)).toEqual(['one'])
    await clickTrigger(el, 2)
    expect(rendered(el)).toEqual(['one', 'three'])
    expect(el.querySelectorAll('template')).toHaveLength(3)
  })

  it('lazy-mount + unmount-on-exit：只有选中面板有内容，选回来重新克隆一份', async () => {
    const el = mount('lazy-mount unmount-on-exit')
    await settle(el)
    await clickTrigger(el, 1)
    expect(rendered(el)).toEqual(['two'])
    await clickTrigger(el, 0)
    expect(rendered(el)).toEqual(['one'])
    expect(el.querySelectorAll('[data-testid="panel-one"]')).toHaveLength(1)
  })
})

describe('xh-tabs 关闭钮', () => {
  it('关闭钮自报 value，点它发 tab-close；closable 关闭时收起', async () => {
    const host = document.createElement('div')
    host.innerHTML = `
      <xh-tabs default-value="one">
        <div data-xh-part="root">
          <div data-xh-part="list">
            <button data-xh-part="trigger" value="one">one</button>
            <button data-xh-part="close-trigger" value="one"></button>
            <button data-xh-part="trigger" value="two">two</button>
            <button data-xh-part="close-trigger" value="two"></button>
          </div>
          <div data-xh-part="content" value="one">one</div>
          <div data-xh-part="content" value="two">two</div>
        </div>
      </xh-tabs>`
    document.body.appendChild(host)
    const el = host.querySelector('xh-tabs') as Updatable & { collection?: unknown, closable?: boolean }
    await settle(el)
    const close = el.querySelectorAll<HTMLElement>('[data-xh-part="close-trigger"]')
    expect(close[0]!.hasAttribute('hidden')).toBe(true)

    el.collection = [{ value: 'one' }, { value: 'two' }]
    el.closable = true
    await settle(el)
    expect(close[0]!.hasAttribute('hidden')).toBe(false)
    const events: unknown[] = []
    el.addEventListener('tab-close', e => events.push((e as CustomEvent).detail))
    close[1]!.click()
    expect(events).toEqual([{ value: 'two', values: ['one'] }])
  })
})
