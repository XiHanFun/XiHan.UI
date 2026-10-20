// 条目图标在真实排版下的落位（React）：collection 给的 icon 铺进 item-icon，排在文字之前；勾选条目的勾（item-indicator）排在行尾，
// 与图标不叠、图标与普通条目左缘对齐；图标按集合条目下发的图标尺寸画出。工具条放不下时，收起的条目带着 itemIcons 里的图标进「更多」菜单。
import type { ReactNode } from 'react'
import type { Root } from 'react-dom/client'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { XhMenubarRoot, XhMenuRoot, XhToolbarItem, XhToolbarOverflowTrigger, XhToolbarRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const LINE = { name: 'line', viewBox: '0 0 24 24', nodes: [{ tag: 'path' as const, attrs: { d: 'M4 12h16' } }] }
const globals = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }

let root: Root | null = null
let host: HTMLElement | null = null

async function inAct(fn: () => void | Promise<void>): Promise<void> {
  const previous = globals.IS_REACT_ACT_ENVIRONMENT
  globals.IS_REACT_ACT_ENVIRONMENT = true
  try {
    await act(fn)
  }
  finally {
    globals.IS_REACT_ACT_ENVIRONMENT = previous
  }
}

afterEach(async () => {
  const park = document.querySelector<HTMLElement>('[data-test-park-pointer]')
  if (park)
    await userEvent.hover(park)
  await inAct(() => root?.unmount())
  root = null
  host?.remove()
  host = null
})

async function render(view: ReactNode): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  await inAct(() => root!.render(view))
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

/** 子菜单入口与普通条目的图标、文字左缘对齐，入口的图标画出了 svg。 */
function expectSubmenuEntryIcon(): void {
  const part = (value: string, name: string): HTMLElement => document.querySelector<HTMLElement>(`[data-part="item"][data-value="${value}"] [data-part="${name}"]`)!
  expect(part('panels', 'item-icon').querySelector('svg')!.getBoundingClientRect().width).toBeGreaterThan(8)
  expect(part('panels', 'item-icon').getBoundingClientRect().left).toBeCloseTo(part('zoom', 'item-icon').getBoundingClientRect().left, 0)
  expect(part('panels', 'item-text').getBoundingClientRect().left).toBeCloseTo(part('zoom', 'item-text').getBoundingClientRect().left, 0)
}

describe('菜单条目的图标（Chromium）', () => {
  it('图标排在文字之前；勾选条目的勾排在文字之后，图标与普通条目左缘对齐；两条的图标同尺寸且画出了 svg', async () => {
    await render(
      <XhMenuRoot
        label="格式"
        collection={[
          { value: 'open', label: '打开', icon: LINE },
          { value: 'bold', label: '粗体', kind: 'checkbox', icon: LINE },
          { value: 'plain', label: '纯文本' },
        ]}
      />,
    )
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
    await render(
      <XhMenuRoot
        label="编辑"
        collection={[{ value: 'copy', label: '复制' }, { value: 'remove', label: '删除', tone: 'danger' }]}
        renderItemPrefix={node => <svg data-prefix={node.value} viewBox="0 0 24 24" width="16" height="16"><path d="M4 12h16" stroke="currentColor" /></svg>}
      />,
    )
    await userEvent.click(document.querySelector<HTMLElement>('[data-scope="menu"][data-part="trigger"]')!)
    expectPrefixFollowsText()
  })

  it('按数据铺的菜单栏里，子菜单入口也画图标：与普通条目的图标、文字左缘对齐', async () => {
    await render(<XhMenubarRoot collection={[{ value: 'view', label: '视图', items: [{ value: 'zoom', label: '缩放', icon: LINE }, { value: 'panels', label: '面板', icon: LINE, children: [{ value: 'outline', label: '页面结构' }] }] }]} />)
    await inAct(() => document.querySelector<HTMLElement>('[data-scope="menubar"][data-part="trigger"][data-value="view"]')!.focus())
    await userEvent.keyboard('{ArrowDown}')
    await inAct(() => new Promise<void>(resolve => requestAnimationFrame(() => resolve())))
    expectSubmenuEntryIcon()
  })

  it('工具条放不下时，收起的条目带着 itemIcons 的图标进「更多」菜单', async () => {
    const labels = ['撤销', '重做', '剪切', '复制']
    await render(
      <div style={{ inlineSize: '130px' }}>
        <XhToolbarRoot aria-label="编辑" itemIcons={{ 剪切: LINE, 复制: LINE }}>
          {labels.map(label => (
            <XhToolbarItem key={label} value={label} type="button" style={{ inlineSize: '50px' }}>{label}</XhToolbarItem>
          ))}
          <XhToolbarOverflowTrigger />
        </XhToolbarRoot>
      </div>,
    )
    await userEvent.click(host!.querySelector<HTMLElement>('[data-scope="toolbar"][data-part="overflow-trigger"]')!)
    const icon = menuPart('剪切', 'item-icon')!
    const text = menuPart('剪切', 'item-text')!
    expect(icon.querySelector('svg')!.getBoundingClientRect().width).toBeGreaterThan(8)
    expect(icon.getBoundingClientRect().right).toBeLessThanOrEqual(text.getBoundingClientRect().left + 0.5)
    expect(icon.getAttribute('aria-hidden')).toBe('true')
  })
})
