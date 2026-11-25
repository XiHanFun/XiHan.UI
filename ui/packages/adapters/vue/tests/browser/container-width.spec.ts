// Container 的版心宽度：各档的最大宽度与断点令牌同宽、在所在的行里居中，左右内衬随视口在 sm 断点换档。
// 最大宽度、居中与媒体查询只有真实浏览器量得出。
import type { ContainerMaxWidth } from '@xihan-ui/headless'
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhContainer } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null
let originalViewport: { width: number, height: number } | null = null

afterEach(async () => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
  if (originalViewport)
    await page.viewport(originalViewport.width, originalViewport.height)
  originalViewport = null
})

/** 令牌的像素值：断点与间距都以 px 声明在根上。 */
function token(name: string): number {
  return Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name))
}

/** 把测试文档切到给定宽度，等排版跟上。 */
async function resize(width: number): Promise<void> {
  originalViewport ??= { width: innerWidth, height: innerHeight }
  await page.viewport(width, 600)
  for (let i = 0; document.documentElement.clientWidth !== width; i += 1) {
    if (i >= 60)
      throw new Error(`视口没有切到 ${width}px（现在是 ${document.documentElement.clientWidth}px）`)
    await new Promise(resolve => requestAnimationFrame(resolve))
  }
}

/** 在给定宽度的视口里挂一个版心，返回它的根与所在的行。 */
async function mountAt(width: number, props: Record<string, unknown> = {}): Promise<{ root: HTMLElement, row: HTMLElement }> {
  app?.unmount()
  host?.remove()
  await resize(width)
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ render: () => h(XhContainer, props, () => [h('p', '正文')]) })
  app.mount(host)
  await nextTick()
  return { root: host.querySelector<HTMLElement>('[data-scope="container"][data-part="root"]')!, row: host }
}

describe('container 版心（Chromium）', () => {
  it.each<[ContainerMaxWidth, string]>([
    ['sm', '--xh-breakpoint-sm'],
    ['md', '--xh-breakpoint-md'],
    ['lg', '--xh-breakpoint-lg'],
    ['xl', '--xh-breakpoint-xl'],
  ])('宽视口下 %s 档与断点同宽（含内衬），在所在的行里居中', async (maxWidth, breakpoint) => {
    const { root, row } = await mountAt(1440, { maxWidth })
    const box = root.getBoundingClientRect()
    const line = row.getBoundingClientRect()
    expect(box.width).toBeCloseTo(token(breakpoint), 1)
    expect(box.left - line.left).toBeCloseTo(line.right - box.right, 1)
  })

  it('缺省档是 lg', async () => {
    const { root } = await mountAt(1440)
    expect(root.dataset.maxWidth).toBe('lg')
    expect(root.getBoundingClientRect().width).toBeCloseTo(token('--xh-breakpoint-lg'), 1)
  })

  it('full 不限宽：铺满所在的行', async () => {
    const { root, row } = await mountAt(1440, { maxWidth: 'full' })
    expect(root.getBoundingClientRect().width).toBeCloseTo(row.getBoundingClientRect().width, 1)
  })

  it('行比档位窄时铺满所在的行，不撑出视口', async () => {
    const { root, row } = await mountAt(375, { maxWidth: 'xl' })
    expect(root.getBoundingClientRect().width).toBeCloseTo(row.getBoundingClientRect().width, 1)
    expect(document.documentElement.scrollWidth).toBe(document.documentElement.clientWidth)
  })

  it('左右内衬在 sm 断点换档：低于断点一档 16px，断点上 24px，两侧相等', async () => {
    const narrow = await mountAt(token('--xh-breakpoint-sm') - 1)
    const narrowStyle = getComputedStyle(narrow.root)
    expect(Number.parseFloat(narrowStyle.paddingInlineStart)).toBe(token('--xh-space-4'))
    expect(narrowStyle.paddingInlineEnd).toBe(narrowStyle.paddingInlineStart)

    const wide = await mountAt(token('--xh-breakpoint-sm'))
    const wideStyle = getComputedStyle(wide.root)
    expect(Number.parseFloat(wideStyle.paddingInlineStart)).toBe(token('--xh-space-6'))
    expect(wideStyle.paddingInlineEnd).toBe(wideStyle.paddingInlineStart)
  })

  it('公开槽盖过档位与视口档', async () => {
    const { root } = await mountAt(1440, {
      maxWidth: 'xl',
      style: '--xh-container-max-w: 30rem; --xh-container-px: 0px',
    })
    expect(root.getBoundingClientRect().width).toBeCloseTo(480, 1)
    expect(getComputedStyle(root).paddingInlineStart).toBe('0px')
  })

  it('放进横排的弹性容器时仍铺满那一行再限宽，不收成内容宽', async () => {
    await resize(1440)
    host = document.createElement('div')
    host.style.display = 'flex'
    document.body.append(host)
    app = createApp({ render: () => h(XhContainer, { maxWidth: 'sm' }, () => [h('span', '短')]) })
    app.mount(host)
    await nextTick()
    const root = host.querySelector<HTMLElement>('[data-scope="container"][data-part="root"]')!
    expect(root.getBoundingClientRect().width).toBeCloseTo(token('--xh-breakpoint-sm'), 1)
  })

  it('hidden 收起：皮肤声明的 display 不压过 hidden', async () => {
    const { root } = await mountAt(1440, { hidden: true })
    expect(getComputedStyle(root).display).toBe('none')
  })
})
