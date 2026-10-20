// 条目图标在真实排版下的落位：collection 给的 icon 铺进 item-icon，排在文字之前；勾选条目的勾（item-indicator）排在行尾，
// 与图标不叠、图标与普通条目左缘对齐；图标按集合条目下发的图标尺寸画出。工具条放不下时，收起的条目带着 itemIcons 里的图标进「更多」菜单。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhMenuRoot, XhToolbarItem, XhToolbarOverflowTrigger, XhToolbarRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const LINE = { name: 'line', viewBox: '0 0 24 24', nodes: [{ tag: 'path' as const, attrs: { d: 'M4 12h16' } }] }

let app: App | null = null
let host: HTMLElement | null = null

afterEach(async () => {
  await userEvent.hover(document.querySelector<HTMLElement>('[data-test-park-pointer]')!)
  app?.unmount()
  app = null
  host?.remove()
  host = null
})

async function render(view: () => ReturnType<typeof h>): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ render: view })
  app.mount(host)
  await nextTick()
  await new Promise(resolve => requestAnimationFrame(resolve))
}

function menuPart(value: string, part: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-scope="menu"][data-part="item"][data-value="${value}"] [data-scope="menu"][data-part="${part}"]`)
}

/** item-prefix 给的图标落在 item-icon 里，颜色就是条目的字色；危险条目随字转红。 */
function expectPrefixFollowsText(): void {
  const colors = ['copy', 'remove'].map((value) => {
    const item = document.querySelector<HTMLElement>(`[data-scope="menu"][data-part="item"][data-value="${value}"]`)!
    const svg = item.querySelector<SVGElement>(`svg[data-prefix="${value}"]`)!
    expect(svg.parentElement!.getAttribute('data-part')).toBe('item-icon')
    expect(getComputedStyle(svg).color).toBe(getComputedStyle(item).color)
    return getComputedStyle(item).color
  })
  expect(colors[0]).not.toBe(colors[1])
}

describe('菜单条目的图标（Chromium）', () => {
  it('图标排在文字之前；勾选条目的勾排在文字之后，图标与普通条目左缘对齐；两条的图标同尺寸且画出了 svg', async () => {
    await render(() => h(XhMenuRoot, {
      label: '格式',
      collection: [
        { value: 'open', label: '打开', icon: LINE },
        { value: 'bold', label: '粗体', kind: 'checkbox', icon: LINE },
        { value: 'plain', label: '纯文本' },
      ],
    }))
    await userEvent.click(document.querySelector<HTMLElement>('[data-scope="menu"][data-part="trigger"]')!)
    const box = (value: string, part: string): DOMRect => menuPart(value, part)!.getBoundingClientRect()
    expect(box('open', 'item-icon').right).toBeLessThanOrEqual(box('open', 'item-text').left + 0.5)
    expect(box('bold', 'item-indicator').left).toBeGreaterThanOrEqual(box('bold', 'item-text').right - 0.5)
    expect(box('bold', 'item-icon').left).toBeCloseTo(box('open', 'item-icon').left, 0)
    expect(box('bold', 'item-icon').right).toBeLessThanOrEqual(box('bold', 'item-text').left + 0.5)
    const svgs = ['open', 'bold'].map(value => menuPart(value, 'item-icon')!.querySelector('svg')!.getBoundingClientRect())
    expect(svgs[0]!.width).toBeGreaterThan(8)
    expect(svgs[1]!.width).toBeCloseTo(svgs[0]!.width, 1)
    expect(menuPart('plain', 'item-icon')).toBeNull()
  })

  it('item-prefix 的图标落进 item-icon、随条目字色走：普通条目中性，危险条目跟着转红，不取对号的品牌色', async () => {
    await render(() => h(XhMenuRoot, { label: '编辑', collection: [{ value: 'copy', label: '复制' }, { value: 'remove', label: '删除', tone: 'danger' }] }, {
      'item-prefix': (node: { value: string }) => [h('svg', { 'data-prefix': node.value, 'viewBox': '0 0 24 24', 'width': '16', 'height': '16' }, [h('path', { d: 'M4 12h16', stroke: 'currentColor' })])],
    }))
    await userEvent.click(document.querySelector<HTMLElement>('[data-scope="menu"][data-part="trigger"]')!)
    expectPrefixFollowsText()
  })

  it('工具条放不下时，收起的条目带着 itemIcons 的图标进「更多」菜单', async () => {
    const labels = ['撤销', '重做', '剪切', '复制']
    await render(() => h('div', { style: { inlineSize: '130px' } }, [
      h(XhToolbarRoot, { 'aria-label': '编辑', 'itemIcons': { 剪切: LINE, 复制: LINE } }, () => [
        ...labels.map(label => h(XhToolbarItem, { value: label, type: 'button', style: { inlineSize: '50px' } }, () => label)),
        h(XhToolbarOverflowTrigger),
      ]),
    ]))
    await userEvent.click(host!.querySelector<HTMLElement>('[data-scope="toolbar"][data-part="overflow-trigger"]')!)
    const icon = menuPart('剪切', 'item-icon')!
    const text = menuPart('剪切', 'item-text')!
    expect(icon.querySelector('svg')!.getBoundingClientRect().width).toBeGreaterThan(8)
    expect(icon.getBoundingClientRect().right).toBeLessThanOrEqual(text.getBoundingClientRect().left + 0.5)
    expect(icon.getAttribute('aria-hidden')).toBe('true')
  })
})
