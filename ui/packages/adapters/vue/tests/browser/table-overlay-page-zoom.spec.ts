// 宿主在 html 或 body 上写 CSS zoom 做整页缩放时，v-for 出来的几张表里，表头 Tooltip 与单元格 HoverCard 都得贴着自己的触发器。
// 此前定位引擎没把浮层自己的有效 zoom 除掉：锚点的视口坐标已经乘过 zoom，写进 left/top 后渲染时又乘一次，
// 浮层落在「锚点坐标 × zoom」的地方，离页面原点越远偏得越多——第一张表的提示还挨着触发器，后面几张的就离开了、
// 甚至出了视口，看上去只有第一张表的悬停生效（Gitee IKPQ1Q）。偏移只有真实布局量得出来。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhClipboardCopyTrigger,
  XhClipboardRoot,
  XhHoverCardContent,
  XhHoverCardPositioner,
  XhHoverCardRoot,
  XhHoverCardTrigger,
  XhTableBody,
  XhTableCell,
  XhTableColumnHeader,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
  XhTooltipContent,
  XhTooltipPositioner,
  XhTooltipRoot,
  XhTooltipTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const TABLES = ['t1', 't2', 't3']
const columns = [{ id: 'name', label: '名称' }, { id: 'code', label: '编码' }]
// 每张表几行，后面两张表的触发器离页面原点足够远，偏移才大到离开触发器
const rows = Array.from({ length: 6 }, (_, i) => ({ id: `r${i}`, name: `名${i}`, code: `C-${i}` }))

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  document.documentElement.style.removeProperty('zoom')
  document.body.style.removeProperty('zoom')
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

const frame = (): Promise<unknown> => new Promise(resolve => requestAnimationFrame(resolve))

async function until(done: () => boolean, frames = 60): Promise<void> {
  for (let i = 0; i < frames && !done(); i++) await frame()
}

function byTestId(id: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[data-testid="${id}"]`)
  if (!el)
    throw new Error(`缺少 ${id}`)
  return el
}

function renderTable(t: string) {
  return h(XhTableRoot, { key: t, columns, rows }, {
    default: () => [
      h(XhTableHeader, null, {
        default: () => [h(XhTableRow, null, {
          default: () => columns.map(column => h(XhTableColumnHeader, { key: column.id, value: column.id }, {
            default: () => [h(XhTooltipRoot, { openDelay: 0, closeDelay: 0 }, {
              default: () => [
                h(XhTooltipTrigger, { 'data-testid': `tip-${t}-${column.id}` }, { default: () => column.label }),
                h(XhTooltipPositioner, null, { default: () => [h(XhTooltipContent, { 'data-testid': `tip-content-${t}-${column.id}` }, { default: () => `${t} ${column.label}` })] }),
              ],
            })],
          })),
        })],
      }),
      h(XhTableBody, null, {
        default: () => rows.map(row => h(XhTableRow, { key: row.id, value: row.id }, {
          default: () => columns.map(column => h(XhTableCell, { key: column.id, value: column.id }, {
            default: () => [h(XhHoverCardRoot, { openDelay: 0, closeDelay: 0 }, {
              default: () => [
                h(XhHoverCardTrigger, { 'data-testid': `card-${t}-${row.id}-${column.id}` }, {
                  default: () => [h(XhClipboardRoot, { value: row[column.id as 'name'] }, {
                    default: () => [row[column.id as 'name'], h(XhClipboardCopyTrigger, null, { default: () => '复制' })],
                  })],
                }),
                h(XhHoverCardPositioner, null, { default: () => [h(XhHoverCardContent, { 'data-testid': `card-content-${t}-${row.id}-${column.id}` }, { default: () => `${t} ${row.id}` })] }),
              ],
            })],
          })),
        })),
      }),
    ],
  })
}

async function mount(): Promise<void> {
  host = document.createElement('div')
  host.style.inlineSize = '480px'
  document.body.append(host)
  app = createApp({ render: () => TABLES.map(renderTable) })
  app.mount(host)
  await nextTick()
  await frame()
}

/** 悬停触发器，等浮层打开、进场播完，返回浮层与触发器之间那道缝（浮层在下方为正）。 */
async function gapAfterHover(trigger: string, content: string): Promise<number> {
  const anchor = byTestId(trigger)
  anchor.scrollIntoView({ block: 'center' })
  await frame()
  await userEvent.hover(anchor)
  const node = byTestId(content)
  await until(() => node.getAttribute('data-state') === 'open')
  expect(node.getAttribute('data-state'), `${content} 没有打开`).toBe('open')
  await Promise.all(node.getAnimations({ subtree: true }).map(a => a.finished.catch(() => undefined)))
  const a = anchor.getBoundingClientRect()
  const c = node.getBoundingClientRect()
  await userEvent.unhover(anchor)
  await userEvent.hover(document.body, { position: { x: 1, y: 1 } })
  await until(() => node.getAttribute('data-state') !== 'open')
  return c.top >= a.bottom ? c.top - a.bottom : c.bottom - a.top
}

describe('table 里的浮层：整页 CSS zoom', () => {
  for (const [where, zoom] of [['html', 0.8], ['html', 1.25], ['body', 0.8], ['body', 1.25]] as const) {
    it(`${where} 上写 zoom: ${zoom}，每张表的表头提示与单元格悬停卡片都贴着自己的触发器`, async () => {
      (where === 'html' ? document.documentElement : document.body).style.setProperty('zoom', String(zoom))
      await mount()
      for (const t of TABLES) {
        const tip = await gapAfterHover(`tip-${t}-name`, `tip-content-${t}-name`)
        const card = await gapAfterHover(`card-${t}-r0-name`, `card-content-${t}-r0-name`)
        // 缝的宽度是浮层的 offset 乘以 zoom，十来个像素；偏到离开触发器时差出上百像素
        expect(Math.abs(tip), `${t} 表头提示与触发器的距离`).toBeLessThan(24)
        expect(Math.abs(card), `${t} 单元格卡片与触发器的距离`).toBeLessThan(24)
      }
    })
  }
})
