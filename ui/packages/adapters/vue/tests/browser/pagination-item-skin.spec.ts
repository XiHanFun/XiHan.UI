// 四类格子接 Action Control 的 text 档（ghost 形态）：坐在画布上悬停 100 档、按下 200 档并缩放（§7.2 / §9.1）；
// 当前页是格状当前（§7.3）：实心品牌面 + 配对前景、不加粗，按下压到 active 档；省略位三态都压淡字色；
// 首页的上一页由家族按 data-disabled 画置灰前景；摊开的页码面板是浮层滚动面，滚动链 contain（§6.6）。
import type { App } from 'vue'
import { userEvent } from '@vitest/browser/context'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhPaginationContent,
  XhPaginationEllipsisTrigger,
  XhPaginationItem,
  XhPaginationNextTrigger,
  XhPaginationPositioner,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
} from '../../src'
import { pressPointer, releasePointerAway } from './pointer-press'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(async () => {
  await releasePointerAway()
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

async function mount(page = 1): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  // 断言的是稳定态的颜色与几何，不是过渡中间帧
  host.style.setProperty('--xh-motion-duration-micro', '0ms')
  host.style.setProperty('--xh-motion-duration-press', '0ms')
  host.style.setProperty('--xh-motion-duration-release', '0ms')
  app = createApp({
    setup: () => () => h(XhPaginationRoot, { count: 500, pageSize: 10, defaultPage: page }, {
      default: ({ pageItems }: { pageItems: Array<Record<string, unknown>> }) => [
        h(XhPaginationPrevTrigger),
        ...pageItems.map((item, i) =>
          item.type === 'ellipsis'
            ? h(XhPaginationEllipsisTrigger, { key: `e${i}`, side: item.side as 'start' | 'end' })
            : h(XhPaginationItem, { key: `p${i}`, value: item.value as number }, () => String(item.value)),
        ),
        h(XhPaginationNextTrigger),
        h(XhPaginationPositioner, null, () => h(XhPaginationContent, null, () => [])),
      ],
    }),
  })
  app.mount(host)
  await nextTick()
  await nextTick()
}

function part(name: string, extra = ''): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[data-scope='pagination'][data-part='${name}']${extra}`)
  if (!el)
    throw new Error(`挂载树里没有 pagination.${name}${extra}`)
  return el
}

/** 语义色令牌在该元素上解到的颜色。 */
function resolveColor(token: string, scope: HTMLElement): string {
  const probe = document.createElement('span')
  probe.style.backgroundColor = `var(${token})`
  scope.append(probe)
  const value = getComputedStyle(probe).backgroundColor
  probe.remove()
  return value
}

describe('pagination 格子的皮肤', () => {
  it('非当前页码悬停 100 档、按下 200 档并缩放；首页的上一页置灰', async () => {
    await mount(1)
    const root = part('root')
    const item = part('item', ':not([data-current])')
    expect(getComputedStyle(item).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    await userEvent.hover(item)
    expect(getComputedStyle(item).backgroundColor).toBe(resolveColor('--xh-bg-subtle', root))
    await pressPointer(item)
    expect(item.matches(':active')).toBe(true)
    expect(getComputedStyle(item).backgroundColor).toBe(resolveColor('--xh-bg-subtle-hover', root))
    expect(getComputedStyle(item).scale).toBe('0.97')
    await releasePointerAway()

    const prev = part('prev-trigger')
    expect(prev.hasAttribute('data-disabled')).toBe(true)
    expect(getComputedStyle(prev).color).toBe(resolveColor('--xh-fg-disabled', root))
    expect(getComputedStyle(prev).cursor).toBe('not-allowed')
  })

  it('当前页实心品牌面 + 配对前景、不加粗，按下压到 active 档', async () => {
    await mount(3)
    const root = part('root')
    const current = part('item', '[data-current]')
    const rest = getComputedStyle(part('item', ':not([data-current])'))
    const style = getComputedStyle(current)
    expect(style.backgroundColor).toBe(resolveColor('--xh-bg-brand', root))
    expect(style.color).toBe(resolveColor('--xh-fg-on-brand', root))
    expect(style.fontWeight).toBe(rest.fontWeight)
    expect(current.getBoundingClientRect().height).toBe(part('item', ':not([data-current])').getBoundingClientRect().height)
    await userEvent.hover(current)
    expect(getComputedStyle(current).backgroundColor).toBe(resolveColor('--xh-bg-brand-hover', root))
    await pressPointer(current)
    expect(getComputedStyle(current).backgroundColor).toBe(resolveColor('--xh-bg-brand-active', root))
    expect(getComputedStyle(current).scale).toBe('0.97')
  })

  it('省略位三态都压淡字色，悬停与页码走同一条阶梯', async () => {
    await mount(1)
    const root = part('root')
    const ellipsis = part('ellipsis-trigger')
    expect(getComputedStyle(ellipsis).color).toBe(resolveColor('--xh-fg-subtle', root))
    await userEvent.hover(ellipsis)
    expect(getComputedStyle(ellipsis).color).toBe(resolveColor('--xh-fg-subtle', root))
    expect(getComputedStyle(ellipsis).backgroundColor).toBe(resolveColor('--xh-bg-subtle', root))
  })

  it('摊开的页码面板滚动链 contain', async () => {
    await mount(1)
    expect(getComputedStyle(part('content')).overscrollBehaviorY).toBe('contain')
  })
})
