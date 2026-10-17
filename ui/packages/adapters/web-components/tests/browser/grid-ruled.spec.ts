// 栅格的格线：外框四边与格与格之间恰好一道线宽，每道线只归一格画，跨行跨列的格子里不出线；
// 画格线时间距档位不生效、格子铺满所在格；RTL 镜像，强制色下线仍在，不写 ruled 时没有线。
import type { GridProps } from '@xihan-ui/headless'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp } from 'vitest/browser'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

interface Cell { text: string, span?: number, rowSpan?: number }

/** 一张四列的申请单：第二行事由跨三列，附件跨两行、右边两格各跨三列。 */
const CELLS: Cell[] = [
  { text: '申请人' },
  { text: '王小明' },
  { text: '部门' },
  { text: '研发部' },
  { text: '事由' },
  { text: '参加前端技术大会，往返两天', span: 3 },
  { text: '附件', rowSpan: 2 },
  { text: '会议邀请函.pdf', span: 3 },
  { text: '行程单.pdf', span: 3 },
]

defineXhElements()

let host: HTMLElement | null = null

async function cleanup(): Promise<void> {
  host?.remove()
  host = null
}

const ATTRS: Record<string, string> = { ruled: 'ruled', gap: 'gap', align: 'align', justifyItems: 'justify-items' }

async function mount(props: Partial<GridProps>, dir?: 'rtl'): Promise<HTMLElement> {
  host = document.createElement('div')
  host.style.inlineSize = '640px'
  if (dir)
    host.dir = dir
  const grid = document.createElement('xh-grid')
  grid.setAttribute('cols', '4')
  for (const [key, value] of Object.entries(props))
    grid.setAttribute(ATTRS[key]!, value === true ? '' : String(value))
  const root = document.createElement('div')
  root.dataset.xhPart = 'root'
  for (const cell of CELLS) {
    const item = document.createElement('div')
    item.dataset.xhPart = 'item'
    if (cell.span)
      item.setAttribute('span', String(cell.span))
    if (cell.rowSpan)
      item.setAttribute('row-span', String(cell.rowSpan))
    item.textContent = cell.text
    root.append(item)
  }
  grid.append(root)
  host.append(grid)
  document.body.append(host)
  await Promise.resolve()
  await new Promise(resolve => requestAnimationFrame(resolve))
  return host.querySelector<HTMLElement>('[data-scope="grid"][data-part="root"]')!
}

afterEach(async () => {
  await cleanup()
  await cdp().send('Emulation.setEmulatedMedia', { media: '', features: [] })
})

/** --xh-stroke-thin 解出来的像素宽。 */
function strokeThin(): number {
  const probe = document.createElement('div')
  probe.style.borderTop = 'var(--xh-stroke-thin) solid'
  document.body.append(probe)
  const width = Number.parseFloat(getComputedStyle(probe).borderTopWidth)
  probe.remove()
  return width
}

function alpha(color: string): number {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1
  const context = canvas.getContext('2d')!
  context.fillStyle = color
  context.fillRect(0, 0, 1, 1)
  return context.getImageData(0, 0, 1, 1).data[3]!
}

function items(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>('[data-scope="grid"][data-part="item"]')]
}

function width(el: HTMLElement, side: 'Top' | 'Right' | 'Bottom' | 'Left'): number {
  return Number.parseFloat(getComputedStyle(el)[`border${side}Width`])
}

describe('栅格格线', () => {
  it('ruled：外框四边各一道线宽，间距档位不生效，根按 clip 裁掉探出外框的线', async () => {
    const root = await mount({ ruled: true, gap: 'md' })
    const line = strokeThin()
    const style = getComputedStyle(root)
    for (const side of ['Top', 'Right', 'Bottom', 'Left'] as const) {
      expect(width(root, side)).toBe(line)
      expect(style[`border${side}Style`]).toBe('solid')
    }
    expect(style.rowGap).toBe(`${line}px`)
    expect(style.columnGap).toBe(`${line}px`)
    expect(style.overflowX).toBe('clip')
    expect(style.overflowY).toBe('clip')
  })

  it('相邻格子之间恰好一道线：每格只画行尾与下方，边与边首尾相接，跨行跨列的格子按自己的盒子画', async () => {
    const root = await mount({ ruled: true })
    const line = strokeThin()
    const cells = items(root)
    for (const cell of cells) {
      expect(width(cell, 'Top')).toBe(0)
      expect(width(cell, 'Left')).toBe(0)
      expect(width(cell, 'Right')).toBe(line)
      expect(width(cell, 'Bottom')).toBe(line)
    }
    const r = cells.map(cell => cell.getBoundingClientRect())
    const box = root.getBoundingClientRect()
    // 同一行左右相邻：左格的行尾线正好填满中间那道间隙
    expect(r[1]!.left).toBeCloseTo(r[0]!.right, 1)
    expect(r[5]!.left).toBeCloseTo(r[4]!.right, 1)
    // 上下相邻：上格的下方线正好填满中间那道间隙
    expect(r[4]!.top).toBeCloseTo(r[0]!.bottom, 1)
    expect(r[6]!.top).toBeCloseTo(r[4]!.bottom, 1)
    // 跨两行的附件与右边两格上下对齐，中间没有它自己的线
    expect(r[6]!.top).toBeCloseTo(r[7]!.top, 1)
    expect(r[6]!.bottom).toBeCloseTo(r[8]!.bottom, 1)
    expect(r[8]!.top).toBeCloseTo(r[7]!.bottom, 1)
    // 最后一列与最后一行的线探进外框底下，与外框外缘齐平，由根裁掉
    expect(r[3]!.right).toBeCloseTo(box.right, 1)
    expect(r[8]!.bottom).toBeCloseTo(box.bottom, 1)
  })

  it('align 写了 start 时格子照样铺满所在格，线够得着间隙', async () => {
    const root = await mount({ ruled: true, align: 'start', justifyItems: 'start' })
    const r = items(root).map(cell => cell.getBoundingClientRect())
    expect(r[4]!.top).toBeCloseTo(r[0]!.bottom, 1)
    expect(r[1]!.left).toBeCloseTo(r[0]!.right, 1)
  })

  it('rTL 下行尾线落到左边', async () => {
    const root = await mount({ ruled: true }, 'rtl')
    const line = strokeThin()
    const first = items(root)[0]!
    expect(width(first, 'Left')).toBe(line)
    expect(width(first, 'Right')).toBe(0)
    const r = items(root).map(cell => cell.getBoundingClientRect())
    expect(r[1]!.right).toBeCloseTo(r[0]!.left, 1)
  })

  it('强制色下外框与格线仍在，颜色不透明', async () => {
    await cdp().send('Emulation.setEmulatedMedia', { features: [{ name: 'forced-colors', value: 'active' }] })
    const root = await mount({ ruled: true })
    const line = strokeThin()
    const cell = items(root)[0]!
    expect(width(root, 'Top')).toBe(line)
    expect(width(cell, 'Bottom')).toBe(line)
    expect(alpha(getComputedStyle(root).borderTopColor)).toBe(255)
    expect(alpha(getComputedStyle(cell).borderBottomColor)).toBe(255)
  })

  it('不写 ruled 时没有外框与格线，间距照档位走', async () => {
    const root = await mount({ gap: 'md' })
    expect(width(root, 'Top')).toBe(0)
    for (const cell of items(root)) {
      expect(width(cell, 'Right')).toBe(0)
      expect(width(cell, 'Bottom')).toBe(0)
    }
    expect(Number.parseFloat(getComputedStyle(root).rowGap)).toBeGreaterThan(strokeThin())
  })
})
