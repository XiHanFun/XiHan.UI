// 详情条往哪一缘长是量出来的：格子的落点、条的宽、容器的可视宽都要真布局才有值，
// jsdom 不做布局，那边这条永远是绿的。
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

/** 一整年在这个宽度里远放不下，一行格子横跨整个可视区，两侧空间的大小关系一路翻过去。 */
const ROOT_W = 300
/** 格子与留白都钉死：格子因此落在 36 + 14k 上，其中一格正好压在两条判据分岔的那几个像素里。 */
const CELL = 10
const GAP = 4
const GUTTER = 32

let host: HTMLElement | null = null

beforeAll(() => {
  defineXhElements()
})

afterEach(() => {
  host?.remove()
  host = null
})

interface Mounted {
  heatmap: HTMLElement & { value: unknown, translations: unknown, grid: any, updateComplete: Promise<unknown> }
  root: HTMLElement
  tip: HTMLElement
  cells: HTMLElement[]
}

/** 一段够长的详情文案，条因此宽过容器的一半。 */
function readout(details: { date: string, count: number, level: number } | null): string {
  return details ? `${details.date}：${details.count} 次（第 ${details.level} 档）` : ''
}

function part(tag: string, name: string, value?: string, text?: string): HTMLElement {
  const el = document.createElement(tag)
  el.dataset.xhPart = name
  if (value !== undefined)
    el.setAttribute('value', value)
  if (text !== undefined)
    el.textContent = text
  return el
}

/** 一张定宽的日历热力图，网格照 grid 铺，详情条挂在末尾。 */
async function mount(): Promise<Mounted> {
  host = document.createElement('div')
  const style = [
    `inline-size: ${ROOT_W}px`,
    `--xh-heatmap-cell-size: ${CELL}px`,
    `--xh-_heatmap-gap: ${GAP}px`,
    `--xh-heatmap-gutter: ${GUTTER}px`,
  ].join('; ')
  host.innerHTML = `
    <xh-heatmap start-date="2024-01-01" end-date="2024-03-31">
      <div data-xh-part="root" style="${style}">
        <div data-xh-part="tooltip"></div>
      </div>
    </xh-heatmap>
  `
  document.body.append(host)
  const heatmap = host.querySelector('xh-heatmap') as Mounted['heatmap']
  const root = host.querySelector<HTMLElement>('[data-xh-part="root"]')!
  const tip = host.querySelector<HTMLElement>('[data-xh-part="tooltip"]')!
  heatmap.translations = { cellLabel: readout }
  heatmap.value = []

  const grid = heatmap.grid
  const gridEl = part('div', 'grid')
  for (const row of grid.rows) {
    const line = part('div', 'row', String(row.weekDay))
    // 行首那一列钉住的星期名：格子因此从 gutter + gap 起排
    line.append(part('span', 'week-day-label', String(row.weekDay), grid.weekDays[row.weekDay].label))
    for (const day of row.cells) line.append(part('div', 'cell', day.date))
    gridEl.append(line)
  }
  root.insertBefore(gridEl, tip)
  heatmap.addEventListener('cell-active', (event) => {
    tip.textContent = readout((event as CustomEvent).detail)
  })
  await heatmap.updateComplete

  return { heatmap, root, tip, cells: [...root.querySelectorAll<HTMLElement>('[data-xh-part="cell"]')] }
}

/**
 * 指针从上一格挪到这一格：两个事件同一批派发，与真实指针移动的次序一致
 * （中间不留定稿的机会，条因此还挂在上一格的位置上）。
 */
async function moveTo(heatmap: Mounted['heatmap'], from: HTMLElement | null, to: HTMLElement): Promise<void> {
  from?.dispatchEvent(new PointerEvent('pointerleave'))
  to.dispatchEvent(new PointerEvent('pointerenter'))
  await heatmap.updateComplete
}

describe('热力图详情条的翻转', () => {
  it('逐格悬停过去，条始终长在两侧空间大的那一边', async () => {
    const { heatmap, root, tip, cells } = await mount()
    // 第一行的 13 个周列在 300px 里放不下，从行首走到行尾正好把两档都走一遍
    const row = cells.slice(0, 13)
    expect(row.length).toBe(13)

    const seen = new Set<string>()
    const log: string[] = []
    const bad: string[] = []
    for (let i = 0; i < row.length; i++) {
      const cell = row[i]!
      await moveTo(heatmap, row[i - 1] ?? null, cell)
      const rootRect = root.getBoundingClientRect()
      const cellRect = cell.getBoundingClientRect()
      const tipRect = tip.getBoundingClientRect()
      const anchor = tip.getAttribute('data-inline-anchor') ?? 'start'
      seen.add(anchor)
      // 两侧各有多少地方摆条：末缘之前把格子自己那一格算进来，起始缘之后到容器末缘
      const before = cellRect.right - rootRect.left
      const after = rootRect.right - cellRect.left
      const line = `#${i} ${anchor} before=${before.toFixed(1)} after=${after.toFixed(1)} tipW=${tipRect.width.toFixed(1)} 越出=${Math.max(0, tipRect.right - rootRect.right, rootRect.left - tipRect.left).toFixed(1)}`
      log.push(line)
      // 挑错边就会白白多裁掉一截
      if (anchor === (before > after ? 'start' : 'end'))
        bad.push(line)
      // 条摆得进空间大的那一侧时，一点都不许越出去
      if (tipRect.width <= Math.max(before, after)
        && (tipRect.right > rootRect.right + 0.5 || tipRect.left < rootRect.left - 0.5)) {
        bad.push(line)
      }
    }
    expect(bad, log.join('\n')).toEqual([])
    // 两档都走到过：全程一档说明这条用例没有量到该量的东西
    expect([...seen].sort()).toEqual(['end', 'start'])
  })
})
