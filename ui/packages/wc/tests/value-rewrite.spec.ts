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

/**
 * 作者可以原地改写角色节点上的 value——一批列表数据换成另一批、节点被复用，
 * 在 WC 这边就是一句 setAttribute('value', ...)。
 *
 * 宿主此前只观察 childList，于是这种改写不会重新接线：节点上留着上一轮写的
 * aria-selected="true" 与 tabindex="0"，而它自称的 value 已经变了——
 * DOM 从此说谎，读屏念出的选中项并不是真的选中项。
 */
describe('原地改写角色节点上的 value', () => {
  it('xh-tabs：value 换了一批之后，没有节点再冒充选中项', async () => {
    const el = mount(`
      <xh-tabs default-value="a">
        <div data-xh-part="list">
          <button data-xh-part="trigger" value="a">甲</button>
          <button data-xh-part="trigger" value="b">乙</button>
        </div>
        <div data-xh-part="content" value="a">A</div>
        <div data-xh-part="content" value="b">B</div>
      </xh-tabs>
    `)
    await settle(el)

    const triggers = [...el.querySelectorAll<HTMLElement>('[data-xh-part="trigger"]')]
    expect(triggers[0]!.getAttribute('aria-selected')).toBe('true')

    triggers[0]!.setAttribute('value', 'x')
    triggers[1]!.setAttribute('value', 'y')
    await settle(el)

    // 选中值仍是 'a'，而现在没有条目自称 'a'：谁都不该再挂着 aria-selected="true"
    expect(triggers.map(t => t.getAttribute('aria-selected'))).toEqual(['false', 'false'])
    // data-value 也得跟上作者改后的声明，否则集合查询按旧值去找
    expect(triggers.map(t => t.getAttribute('data-value'))).toEqual(['x', 'y'])
  })

  it('xh-tabs：把选中值改到某个条目上，它当场成为选中项', async () => {
    const el = mount(`
      <xh-tabs default-value="a">
        <div data-xh-part="list">
          <button data-xh-part="trigger" value="a">甲</button>
          <button data-xh-part="trigger" value="b">乙</button>
        </div>
        <div data-xh-part="content" value="a">A</div>
        <div data-xh-part="content" value="b">B</div>
      </xh-tabs>
    `)
    await settle(el)
    const triggers = [...el.querySelectorAll<HTMLElement>('[data-xh-part="trigger"]')]

    // 第一个改名让位，第二个改成选中值
    triggers[0]!.setAttribute('value', 'z')
    triggers[1]!.setAttribute('value', 'a')
    await settle(el)

    expect(triggers.map(t => t.getAttribute('aria-selected'))).toEqual(['false', 'true'])
    expect(triggers[1]!.getAttribute('tabindex')).toBe('0')
  })

  it('改写 disabled 声明当场生效，不必等增删节点', async () => {
    const el = mount(`
      <xh-tabs default-value="a">
        <div data-xh-part="list">
          <button data-xh-part="trigger" value="a">甲</button>
          <button data-xh-part="trigger" value="b">乙</button>
        </div>
        <div data-xh-part="content" value="a">A</div>
        <div data-xh-part="content" value="b">B</div>
      </xh-tabs>
    `)
    await settle(el)
    const triggers = [...el.querySelectorAll<HTMLElement>('[data-xh-part="trigger"]')]
    expect(triggers[1]!.getAttribute('aria-disabled')).toBe('false')

    triggers[1]!.setAttribute('aria-disabled', 'true')
    await settle(el)
    expect(triggers[1]!.getAttribute('data-disabled')).toBe('')
  })

  it('写属性不会把自己再排一轮更新（观察器不自触发）', async () => {
    const el = mount(`
      <xh-tabs default-value="a">
        <div data-xh-part="list">
          <button data-xh-part="trigger" value="a">甲</button>
        </div>
        <div data-xh-part="content" value="a">A</div>
      </xh-tabs>
    `)
    await settle(el)

    // 自触发会让 wire() 一轮接一轮地写属性。数一段静默期里的属性变动：
    // 不自触发的话没人再动 DOM，这里应当是 0
    let writes = 0
    const spy = new MutationObserver((records) => {
      writes += records.length
    })
    spy.observe(el, { attributes: true, subtree: true })
    await new Promise(r => setTimeout(r, 60))
    spy.disconnect()
    expect(writes).toBe(0)
  })
})

/**
 * 机器自己写的属性里，有几个正好落在"作者声明"这张观察名单上
 * （单体控件与数字框的加减按钮会被打上原生 disabled，集合条目会被打上 aria-disabled）。
 * 没有护栏的话，wire() 写完这一下会立刻把自己再排一轮：
 * 第二轮写的值与第一轮相同、不再产生变动记录，所以看结果是对的——
 * 只是每次状态变化都白跑一轮接线。
 */
describe('wire() 写属性不把自己再排一轮', () => {
  it('数字框贴到 max、加号按钮转 disabled 时只接线一轮', async () => {
    const Klass = customElements.get('xh-number-field') as unknown as {
      prototype: { wire: () => void }
    }
    const original = Klass.prototype.wire
    let passes = 0
    Klass.prototype.wire = function patched(this: unknown) {
      passes++
      return original.call(this)
    }

    try {
      const el = mount(`
        <xh-number-field default-value="9" min="0" max="10">
          <div data-xh-part="root">
            <label data-xh-part="label">数量</label>
            <input data-xh-part="input">
            <button data-xh-part="decrement-trigger">−</button>
            <button data-xh-part="increment-trigger">+</button>
          </div>
        </xh-number-field>
      `)
      await settle(el)

      const input = el.querySelector<HTMLElement>('[data-xh-part="input"]')!
      const inc = el.querySelector<HTMLElement>('[data-xh-part="increment-trigger"]')!
      expect(inc.hasAttribute('disabled')).toBe(false)

      passes = 0
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }))
      await settle(el)

      // 值到 10，加号该转 disabled——这一下是机器写的，不该被当成作者改了声明
      expect(inc.hasAttribute('disabled')).toBe(true)
      expect(passes).toBe(1)
    }
    finally {
      Klass.prototype.wire = original
    }
  })
})
