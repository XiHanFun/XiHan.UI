// @vitest-environment jsdom
//
// 每页条数控制器在 WC 侧同样是库里的 select。Light DOM 归作者，但下拉那一整套角色节点
// 归 select 的 scope 管、名字也会与分页自己的 item / positioner / content 撞名，
// 所以由元素自己建（与自绘滚动条同一条路），作者只写 page-size-select 那一格挂载点。
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
  <nav data-xh-part="root">
    <div data-xh-part="page-size-select"></div>
    <button data-xh-part="prev-trigger"></button>
    <button data-xh-part="item" value="1">1</button>
    <button data-xh-part="next-trigger"></button>
    <div data-xh-part="positioner"><div data-xh-part="content"></div></div>
  </nav>
`

function mount(props: Record<string, unknown> = {}): Updatable {
  const el = document.createElement('xh-pagination') as Updatable & Record<string, unknown>
  el.innerHTML = MARKUP
  el.setAttribute('count', '196')
  el.setAttribute('default-page-size', '20')
  for (const [key, value] of Object.entries(props))
    el[key] = value
  document.body.appendChild(el)
  return el
}

function selectPart(el: HTMLElement, part: string): HTMLElement {
  return el.querySelector<HTMLElement>(`[data-scope="select"][data-part="${part}"]`)!
}

function options(el: HTMLElement): HTMLElement[] {
  return [...el.querySelectorAll<HTMLElement>('[data-scope="select"][data-part="item"]')]
}

describe('每页条数控制器（Web Components 适配器）', () => {
  it('挂载点里由元素建出下拉那一套，不再要求作者写原生 select', async () => {
    const el = mount()
    await settle(el)

    const mountNode = el.querySelector<HTMLElement>('[data-xh-part="page-size-select"]')!
    expect(mountNode.getAttribute('data-scope')).toBe('pagination')
    expect(el.querySelector('select')).toBeNull()
    expect(mountNode.querySelector('[data-scope="select"][data-part="root"]')).not.toBeNull()
    expect(selectPart(el, 'trigger').tagName).toBe('BUTTON')
  })

  /** 打了就会被 discoverParts 收进 partMap，与分页自己的 item / content 撞名。 */
  it('自建节点不打 data-xh-part，分页的部件计数不受影响', async () => {
    const el = mount()
    await settle(el)

    expect(el.querySelectorAll('[data-xh-part="item"]')).toHaveLength(1)
    expect(el.querySelectorAll('[data-xh-part="content"]')).toHaveLength(1)
    for (const node of options(el))
      expect(node.hasAttribute('data-xh-part')).toBe(false)
  })

  it('档位来自 pageSizeOptions，档位文字取 translations.pageSizeOption', async () => {
    const el = mount({
      pageSizeOptions: [10, 20, 50],
      translations: { pageSizeOption: (size: number) => `${size} 条 / 页` },
    })
    await settle(el)

    expect(options(el).map(node => node.getAttribute('data-value'))).toEqual(['10', '20', '50'])
    expect(options(el).map(node => node.textContent)).toEqual(['10 条 / 页', '20 条 / 页', '50 条 / 页'])
    expect(selectPart(el, 'value-text').textContent).toBe('20 条 / 页')
  })

  it('可及名仍是 pageSizeSelect 那句', async () => {
    const el = mount({ translations: { pageSizeSelect: '每页条数' } })
    await settle(el)

    expect(selectPart(el, 'trigger').getAttribute('aria-label')).toBe('每页条数')
    expect(selectPart(el, 'trigger').hasAttribute('aria-labelledby')).toBe(false)
  })

  it('挑一档即换档，页码跟着换算并发出 page-size-change', async () => {
    const el = mount({ pageSizeOptions: [10, 20, 50] })
    await settle(el)
    const seen: unknown[] = []
    el.addEventListener('page-size-change', event => seen.push((event as CustomEvent).detail))

    selectPart(el, 'trigger').click()
    await settle(el)
    options(el).find(node => node.getAttribute('data-value') === '50')!.click()
    await settle(el)

    expect(seen).toEqual([{ pageSize: 50, page: 1 }])
    expect((el as unknown as { currentPageSize: number }).currentPageSize).toBe(50)
  })

  it('档位表变了只补差额，不把整串重建一遍', async () => {
    const el = mount({ pageSizeOptions: [10, 20, 50] })
    await settle(el)
    const kept = options(el).find(node => node.getAttribute('data-value') === '10')!

    ;(el as unknown as { pageSizeOptions: number[] }).pageSizeOptions = [10, 20]
    await settle(el)

    expect(options(el).map(node => node.getAttribute('data-value'))).toEqual(['10', '20'])
    expect(options(el)[0]).toBe(kept)
  })
})
