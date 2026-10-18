// 条目图标在真实排版下的落位（Web Components）：collection 给的 icon 铺进 item-icon，里面是一枚自己生成结构的 xh-icon，
// 排在文字之前；勾选条目的勾在 item-indicator，两格并排不叠。工具条放不下时，收起的条目带着 itemIcons 里的图标进「更多」菜单。
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

const LINE = { name: 'line', viewBox: '0 0 24 24', nodes: [{ tag: 'path' as const, attrs: { d: 'M4 12h16' } }] }

interface Updatable extends HTMLElement {
  updateComplete: Promise<unknown>
}

async function settle(): Promise<void> {
  for (let round = 0; round < 5; round++) {
    await Promise.resolve()
    for (const element of document.querySelectorAll<Updatable>('xh-menu, xh-toolbar, xh-icon'))
      await element.updateComplete
  }
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

let box: HTMLElement | null = null

afterEach(async () => {
  const park = document.querySelector<HTMLElement>('[data-test-park-pointer]')
  if (park)
    await userEvent.hover(park)
  box?.remove()
  box = null
})

function menuPart(value: string, part: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-scope="menu"][data-part="item"][data-value="${value}"] [data-scope="menu"][data-part="${part}"]`)
}

describe('菜单条目的图标（Chromium）', () => {
  it('图标排在文字之前；勾选条目的勾与图标各占一格不重叠；两条的图标同尺寸且画出了 svg', async () => {
    box = document.createElement('div')
    const menu = document.createElement('xh-menu') as HTMLElement & { collection?: unknown, label?: string }
    menu.setAttribute('label', '格式')
    menu.collection = [
      { value: 'open', label: '打开', icon: LINE },
      { value: 'bold', label: '粗体', kind: 'checkbox', icon: LINE },
      { value: 'plain', label: '纯文本' },
    ]
    box.append(menu)
    document.body.append(box)
    await settle()
    await userEvent.click(menu.querySelector<HTMLElement>('[data-scope="menu"][data-part="trigger"]')!)
    await settle()
    const rect = (value: string, part: string): DOMRect => menuPart(value, part)!.getBoundingClientRect()
    expect(rect('open', 'item-icon').right).toBeLessThanOrEqual(rect('open', 'item-text').left + 0.5)
    expect(rect('bold', 'item-indicator').right).toBeLessThanOrEqual(rect('bold', 'item-icon').left + 0.5)
    expect(rect('bold', 'item-icon').right).toBeLessThanOrEqual(rect('bold', 'item-text').left + 0.5)
    const svgs = ['open', 'bold'].map(value => menuPart(value, 'item-icon')!.querySelector('svg')!.getBoundingClientRect())
    expect(svgs[0]!.width).toBeGreaterThan(8)
    expect(svgs[1]!.width).toBeCloseTo(svgs[0]!.width, 1)
    expect(menuPart('plain', 'item-icon')).toBeNull()
  })

  it('工具条放不下时，收起的条目带着 itemIcons 的图标进「更多」菜单', async () => {
    box = document.createElement('div')
    box.style.inlineSize = '130px'
    const items = ['撤销', '重做', '剪切', '复制'].map(label => `<button data-xh-part="item" type="button" value="${label}" style="inline-size: 50px">${label}</button>`).join('')
    box.innerHTML = `<xh-toolbar><div data-xh-part="root" aria-label="编辑">${items}<button data-xh-part="overflow-trigger"></button></div></xh-toolbar>`
    const toolbar = box.querySelector('xh-toolbar') as HTMLElement & { itemIcons?: unknown }
    toolbar.itemIcons = { 剪切: LINE, 复制: LINE }
    document.body.append(box)
    await settle()
    await userEvent.click(box.querySelector<HTMLElement>('[data-scope="toolbar"][data-part="overflow-trigger"]')!)
    await settle()
    const icon = menuPart('剪切', 'item-icon')!
    const text = menuPart('剪切', 'item-text')!
    expect(icon.querySelector('svg')!.getBoundingClientRect().width).toBeGreaterThan(8)
    expect(icon.getBoundingClientRect().right).toBeLessThanOrEqual(text.getBoundingClientRect().left + 0.5)
    expect(icon.getAttribute('aria-hidden')).toBe('true')
  })
})
