// @vitest-environment jsdom
// 表格的可访问名：作者写了头部就指向头部；没写头部直接用路径，不指向不存在的 id。
import { computeTextDiff } from '@xihan-ui/headless'
import { afterEach, describe, expect, it } from 'vitest'
import { XhDiffViewElement } from '../src/elements/diff-view'

interface Updatable extends HTMLElement { updateComplete: Promise<unknown> }

if (!customElements.get('xh-diff-view'))
  customElements.define('xh-diff-view', XhDiffViewElement)

afterEach(() => {
  document.body.replaceChildren()
})

async function render(header: string): Promise<Updatable> {
  const host = document.createElement('div')
  host.innerHTML = `<xh-diff-view><div data-xh-part="root">${header}`
    + '<div data-xh-part="viewport"><div data-xh-part="body"></div></div></div></xh-diff-view>'
  document.body.appendChild(host)
  const el = host.firstElementChild as Updatable
  Object.assign(el, { model: { ...computeTextDiff('a', 'b'), newPath: 'src/a.ts' } })
  await el.updateComplete
  return el
}

describe('diff-view 表格的可访问名', () => {
  it('写了头部：aria-labelledby 指向头部', async () => {
    const el = await render('<div data-xh-part="header">src/a.ts</div>')
    const body = el.querySelector('[data-part="body"]')!
    expect(body.getAttribute('aria-labelledby')).toBe(el.querySelector('[data-part="header"]')!.id)
    expect(body.hasAttribute('aria-label')).toBe(false)
  })

  it('没写头部：直接用路径作名字，不留悬空的 aria-labelledby', async () => {
    const el = await render('')
    const body = el.querySelector('[data-part="body"]')!
    expect(body.hasAttribute('aria-labelledby')).toBe(false)
    expect(body.getAttribute('aria-label')).toBe('src/a.ts')
  })
})
