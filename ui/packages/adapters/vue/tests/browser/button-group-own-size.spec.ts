// ButtonGroup 里段自己写的 size 压过组的 size：属性层早已是段优先（button-group-axes 只核 data-size），
// 几何却由组写成私有槽、排在段的尺寸档之前——组写 lg、段写 sm，data-size 是 sm，量出来仍是 lg 的高度与内衬。
// 高度、内衬、字号要经完整级联才算得出来，只在真实浏览器里量。
import type { App, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhButton, XhButtonGroup } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

async function mount(render: () => VNode): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ render })
  app.mount(host)
  await nextTick()
}

function px(token: string): number {
  const probe = document.createElement('span')
  probe.style.setProperty('inline-size', `var(${token})`)
  host!.append(probe)
  const out = Number.parseFloat(getComputedStyle(probe).inlineSize)
  probe.remove()
  return out
}

function segment(name: string): HTMLElement {
  const button = [...host!.querySelectorAll<HTMLElement>(`[data-scope='button'][data-part='root']`)].find(el => el.textContent === name)
  if (!button)
    throw new Error(`缺少按钮：${name}`)
  return button
}

function geometry(button: HTMLElement): { height: number, paddingInline: number, fontSize: number } {
  const style = getComputedStyle(button)
  return {
    height: button.getBoundingClientRect().height,
    paddingInline: Number.parseFloat(style.paddingInlineStart),
    fontSize: Number.parseFloat(style.fontSize),
  }
}

describe('buttonGroup 里段自写的 size 优先', () => {
  it('组写 lg、段写 sm：段量出来是 sm 的高度与字号，内衬取成组的 sm 档', async () => {
    await mount(() => h(XhButtonGroup, { 'size': 'lg', 'aria-label': '组' }, () => [
      h(XhButton, null, () => '随组'),
      h(XhButton, { size: 'sm' }, () => '自写'),
    ]))
    expect(segment('自写').getAttribute('data-size')).toBe('sm')
    expect(geometry(segment('自写'))).toEqual({
      height: px('--xh-control-h-sm'),
      paddingInline: px('--xh-control-px-sm'),
      fontSize: px('--xh-control-font-sm'),
    })
  })

  it('段没写 size 时照旧随组：高度、字号与成组的紧凑内衬都是组的那一档', async () => {
    await mount(() => h(XhButtonGroup, { 'size': 'lg', 'aria-label': '组' }, () => [
      h(XhButton, null, () => '随组'),
      h(XhButton, { size: 'sm' }, () => '自写'),
    ]))
    expect(geometry(segment('随组'))).toEqual({
      height: px('--xh-control-h-lg'),
      paddingInline: px('--xh-control-px-lg'),
      fontSize: px('--xh-control-font-lg'),
    })
  })

  it('不在组里时成组的内衬不生效：同一档的独立按钮内衬比成组的段宽', async () => {
    await mount(() => h('div', null, [
      h(XhButton, { size: 'sm' }, () => '独立'),
      h(XhButtonGroup, { 'size': 'sm', 'aria-label': '组' }, () => [h(XhButton, null, () => '成组')]),
    ]))
    const alone = geometry(segment('独立'))
    const grouped = geometry(segment('成组'))
    expect(alone.height).toBe(grouped.height)
    expect(grouped.paddingInline).toBe(px('--xh-control-px-sm'))
    expect(alone.paddingInline).toBeGreaterThan(grouped.paddingInline)
  })
})
