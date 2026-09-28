// @vitest-environment jsdom
// 文件名部件留空：显示 filename 属性的值，与另两端同一条规则。pre 的可访问名指向这个节点，它空着读屏就读空。
import { afterEach, describe, expect, it } from 'vitest'
import { XhCodeViewElement } from '../src/elements/code-view'

interface Updatable extends HTMLElement { updateComplete: Promise<unknown>, filename?: string }

if (!customElements.get('xh-code-view'))
  customElements.define('xh-code-view', XhCodeViewElement)

afterEach(() => {
  document.body.replaceChildren()
})

async function render(inner: string): Promise<Updatable> {
  const host = document.createElement('div')
  host.innerHTML = `<xh-code-view code="a" filename="store.ts"><div data-xh-part="root"><div data-xh-part="header">${inner}</div>`
    + '<pre data-xh-part="pre"><code data-xh-part="code"></code></pre></div></xh-code-view>'
  document.body.appendChild(host)
  const el = host.firstElementChild as Updatable
  Object.assign(el, { highlighter: null })
  await el.updateComplete
  return el
}

describe('code-view 文件名', () => {
  it('部件留空时写上 filename，改了属性跟着变，pre 的可访问名念得出来', async () => {
    const el = await render('<span data-xh-part="filename"></span>')
    const node = el.querySelector<HTMLElement>('[data-part="filename"]')!
    expect(node.textContent).toBe('store.ts')
    expect(el.querySelector('[data-part="pre"]')!.getAttribute('aria-labelledby')).toBe(node.id)
    el.filename = 'queue.ts'
    await el.updateComplete
    expect(node.textContent).toBe('queue.ts')
  })

  it('作者自己写了内容就不碰', async () => {
    const el = await render('<span data-xh-part="filename">src/store.ts</span>')
    expect(el.querySelector('[data-part="filename"]')!.textContent).toBe('src/store.ts')
  })
})
