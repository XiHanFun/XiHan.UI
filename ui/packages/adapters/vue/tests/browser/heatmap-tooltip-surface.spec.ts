// Heatmap 的详情条与 Tooltip 同一副反白气泡：非透明描边（§8.4 浮层不得只靠影分层）、
// frosted 紧凑档影、次级标注档 13px 字号。描边与影的计算值依赖真实级联，只在 Chromium 验证。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhHeatmapRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

function mountHeatmap(): void {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhHeatmapRoot, {
      startDate: '2026-01-05',
      endDate: '2026-01-18',
      value: [{ date: '2026-01-06', count: 3 }, { date: '2026-01-12', count: 9 }],
    }, {
      tooltip: (details: { count: number } | null) => [h('span', null, details ? `${details.count} 次` : '')],
    }),
  })
  app.mount(host)
}

async function settle(): Promise<void> {
  await nextTick()
  await new Promise<void>(resolve => setTimeout(resolve, 60))
}

function part(name: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-scope='heatmap'][data-part='${name}']`)
  if (!element)
    throw new Error(`找不到 heatmap/${name}`)
  return element
}

/** 把令牌解析成这台浏览器上的最终取值，用来与详情条的计算值对账。 */
function tokenValue(property: 'box-shadow' | 'color', token: string): string {
  const probe = document.createElement('span')
  probe.style.setProperty(property, `var(${token})`)
  document.body.append(probe)
  const value = getComputedStyle(probe).getPropertyValue(property)
  probe.remove()
  return value
}

afterEach(async () => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
  await userEvent.hover(document.querySelector<HTMLElement>('[data-test-park-pointer]')!)
})

describe('热力图的详情条', () => {
  it('悬停到一格后详情条现身，带一圈非透明描边、frosted 紧凑档影与 13px 字号', async () => {
    mountHeatmap()
    await settle()
    const cell = document.querySelector<HTMLElement>('[data-scope=\'heatmap\'][data-part=\'cell\'][data-value=\'2026-01-12\']')
    expect(cell).not.toBeNull()
    await userEvent.hover(cell!)
    await settle()

    const tooltip = part('tooltip')
    expect(tooltip.dataset.state).toBe('visible')
    const style = getComputedStyle(tooltip)
    // 任何浮层的 content 都得有非透明描边，不能只靠影分层（§8.4）
    expect(style.borderTopStyle).toBe('solid')
    expect(style.borderTopWidth).toBe('1px')
    expect(style.borderTopColor).not.toBe('rgba(0, 0, 0, 0)')
    expect(style.borderTopColor).not.toBe(style.backgroundColor)
    // 影走 frosted 紧凑档，与 Tooltip 的 content 同深；不再是锚定浮层的 floating 档
    expect(style.boxShadow).toBe(tokenValue('box-shadow', '--xh-material-frosted-compact-shadow'))
    expect(style.boxShadow).not.toBe(tokenValue('box-shadow', '--xh-elevation-floating'))
    // 字号与 Tooltip 缺省档同一把尺：次级标注档 13px
    expect(style.fontSize).toBe('13px')
  })
})
