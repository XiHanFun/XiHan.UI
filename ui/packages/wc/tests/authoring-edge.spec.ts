// @vitest-environment jsdom

import { describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface Updatable extends HTMLElement { updateComplete: Promise<unknown> }

async function settle(el: Updatable): Promise<void> {
  await el.updateComplete
  await el.updateComplete
}

function mount(html: string): Updatable {
  const host = document.createElement('div')
  host.innerHTML = html
  document.body.appendChild(host)
  return host.firstElementChild as Updatable
}

// 作者层只要给 content 声明 display，就会盖过 UA 的 [hidden]{display:none}，
// 收起态的浮层会永久留在页面上。宿主不能指望作者装了本仓的样式表，得自己兜底。
describe('浮层收起态不依赖样式表', () => {
  it('作者给 tooltip content 设了 display 也仍然收得起', async () => {
    const style = document.createElement('style')
    style.textContent = '[data-xh-part="content"]{display:flex}'
    document.head.appendChild(style)

    const el = mount(`
      <xh-tooltip>
        <button data-xh-part="trigger">悬停</button>
        <div data-xh-part="positioner"><div data-xh-part="content">提示</div></div>
      </xh-tooltip>`)
    await settle(el)

    const content = el.querySelector<HTMLElement>('[data-xh-part="content"]')!
    expect(content.hasAttribute('hidden')).toBe(true)
    expect(getComputedStyle(content).display).toBe('none')

    style.remove()
    el.parentElement?.remove()
  })

  // 宿主接管 display 是为了兜住收起态，不该顺手抹掉作者写在同一节点上的内联 display。
  it('接管收起态不会吃掉作者写在该节点上的内联 display', async () => {
    const el = mount(`
      <xh-popover>
        <button data-xh-part="trigger">开</button>
        <div data-xh-part="positioner">
          <div data-xh-part="content" style="display: grid; gap: 4px;">内容</div>
        </div>
      </xh-popover>`)
    await settle(el)

    const content = el.querySelector<HTMLElement>('[data-xh-part="content"]')!
    // 收起态由宿主接管
    expect(content.style.display).toBe('none')

    el.querySelector<HTMLElement>('[data-xh-part="trigger"]')!.click()
    await settle(el)
    // 展开后还回作者原本写的值，而不是清成空
    expect(content.style.display).toBe('grid')
    expect(content.style.gap).toBe('4px')

    el.parentElement?.remove()
  })
})

// connect 每帧把 aria-disabled 写回条目，整组禁用更是写满每一个。
// 宿主若无脑回读，就分不清「作者声明的」与「自己上一帧写的」。
describe('radio-group 条目禁用声明的读取', () => {
  const markup = `
    <xh-radio-group name="g">
      <div data-xh-part="root">
        <span data-xh-part="label">组</span>
        <label data-xh-part="item" value="a"><span data-xh-part="item-text">A</span></label>
        <label data-xh-part="item" value="b"><span data-xh-part="item-text">B</span></label>
      </div>
    </xh-radio-group>`

  it('整组禁用再解禁，条目恢复可用（不被自己写回的 aria-disabled 永久锁死）', async () => {
    const el = mount(markup)
    await settle(el)
    const items = () => [...el.querySelectorAll<HTMLElement>('[data-xh-part="item"]')]
    expect(items().map(i => i.getAttribute('aria-disabled'))).toEqual(['false', 'false'])

    el.setAttribute('disabled', '')
    await settle(el)
    expect(items().map(i => i.getAttribute('aria-disabled'))).toEqual(['true', 'true'])

    el.removeAttribute('disabled')
    await settle(el)
    expect(items().map(i => i.getAttribute('aria-disabled'))).toEqual(['false', 'false'])

    el.parentElement?.remove()
  })

  it('运行期改条目自身的 aria-disabled 立刻生效（整组未禁用时现读）', async () => {
    const el = mount(markup)
    await settle(el)
    const b = el.querySelectorAll<HTMLElement>('[data-xh-part="item"]')[1]!

    b.setAttribute('aria-disabled', 'true')
    // 属性变动不触发重接线，用一次宿主属性变化推一帧
    el.setAttribute('orientation', 'horizontal')
    await settle(el)
    expect(b.getAttribute('aria-disabled')).toBe('true')
    expect(b.getAttribute('data-disabled')).toBe('')

    b.setAttribute('aria-disabled', 'false')
    el.setAttribute('orientation', 'vertical')
    await settle(el)
    // 撤销声明后要能解开——旧实现把首次读到的值永久记住，这里会一直是 true
    expect(b.getAttribute('aria-disabled')).toBe('false')
    expect(b.getAttribute('data-disabled')).toBeNull()

    el.parentElement?.remove()
  })
})
