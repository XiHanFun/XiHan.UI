// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface Updatable extends HTMLElement { updateComplete: Promise<unknown> }

beforeEach(() => {
  document.body.innerHTML = ''
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: false, media: q, addEventListener: () => {}, removeEventListener: () => {} }))
})

async function settle(el: Updatable): Promise<void> {
  await el.updateComplete
  await el.updateComplete
  await new Promise(r => setTimeout(r, 0))
  await el.updateComplete
}

function mount(html: string): Updatable {
  const host = document.createElement('div')
  host.innerHTML = html
  document.body.appendChild(host)
  return host.firstElementChild as Updatable
}

const MARKUP = `
  <div data-xh-part="root">
    <span data-xh-part="label">套餐</span>
    <label data-xh-part="item" value="free"><input data-xh-part="hidden-input"><span data-xh-part="item-text">免费</span></label>
    <label data-xh-part="item" value="pro"><input data-xh-part="hidden-input"><span data-xh-part="item-text">专业</span></label>
    <label data-xh-part="item" value="max" aria-disabled="true"><input data-xh-part="hidden-input"><span data-xh-part="item-text">旗舰</span></label>
  </div>
`

function disabledFlags(el: HTMLElement): string[] {
  return [...el.querySelectorAll<HTMLElement>('[data-xh-part="item"]')].map(i => i.getAttribute('aria-disabled') ?? '(无)')
}

/**
 * 整组禁用期间 connect 会把每个条目都写成 aria-disabled="true"。
 * 解禁那一帧若现读 DOM，读到的是机器自己上一帧写回的值，不是作者的声明——
 * 于是整组条目永久锁死，再也解不开。
 *
 * 元素为此存了一份「进入禁用前的声明快照」，但挂载那一刻就整组禁用时压根没机会记快照，
 * 恰恰是这条路会退回现读。
 */
describe('整组禁用解禁后条目的禁用声明', () => {
  it('先正常挂载，禁用再解禁：只有作者声明为禁用的那个仍禁用', async () => {
    const el = mount(`<xh-radio-group default-value="free">${MARKUP}</xh-radio-group>`)
    await settle(el)
    expect(disabledFlags(el)).toEqual(['false', 'false', 'true'])

    el.toggleAttribute('disabled', true)
    await settle(el)
    expect(disabledFlags(el)).toEqual(['true', 'true', 'true'])

    el.toggleAttribute('disabled', false)
    await settle(el)
    expect(disabledFlags(el)).toEqual(['false', 'false', 'true'])
  })

  it('挂载那一刻就整组禁用，解禁后同样解得开', async () => {
    const el = mount(`<xh-radio-group default-value="free" disabled>${MARKUP}</xh-radio-group>`)
    await settle(el)
    expect(disabledFlags(el)).toEqual(['true', 'true', 'true'])

    el.toggleAttribute('disabled', false)
    await settle(el)
    // 作者只把第三个标成了禁用，前两个必须解开
    expect(disabledFlags(el)).toEqual(['false', 'false', 'true'])
  })

  it('解禁后前两个条目可聚焦、方向键走得动', async () => {
    const el = mount(`<xh-radio-group default-value="free" disabled>${MARKUP}</xh-radio-group>`)
    await settle(el)
    el.toggleAttribute('disabled', false)
    await settle(el)

    const items = [...el.querySelectorAll<HTMLElement>('[data-xh-part="item"]')]
    const stops = items.filter(i => i.getAttribute('tabindex') === '0')
    expect(stops.length, '解禁后组内应恰有一个 Tab 停靠点').toBe(1)
  })
})
