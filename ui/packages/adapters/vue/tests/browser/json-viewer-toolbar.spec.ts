// JSON 查看器的内建工具条：条是根的第一个孩子、钮排在条的末端；钮是 Action Control icon 档 ghost 面，
// 比视图低一档（md 视图的钮是 sm 档的正方盒），字形取 sm 档 16px；随形态出没的钮被 hidden 收起后不占位置。
// 换行开关打开后原文的长行折到下一行、不再横向溢出；复制成功后字形换成对钩并取成功色。
// 两档密度一起量：钮边长随 --xh-control-h-sm 走（comfortable 28 / compact 24）。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhJsonViewerRoot } from '../../src'
import { pseudoBox } from './pseudo-box'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const value = {
  traceId: '9ef5a8c3e1b44f0f',
  request: {
    url: '/api/workflow/definition/new-version?tenant=hangzhou-branch&operator=owner&reason=quarterly-review&note=a-very-long-query-string-that-cannot-fit',
  },
}

let app: App | null = null
let host: HTMLElement | null = null
let restoreClipboard: (() => void) | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  restoreClipboard?.()
  delete document.documentElement.dataset.density
  app = null
  host = null
  restoreClipboard = null
})

function part(name: string): HTMLElement {
  const element = host!.querySelector<HTMLElement>(`[data-scope='json-viewer'][data-part='${name}']`)
  if (!element)
    throw new Error(`缺少 json-viewer 部件：${name}`)
  return element
}

async function mount(density: 'comfortable' | 'compact'): Promise<void> {
  document.documentElement.dataset.density = density
  host = document.createElement('div')
  host.style.inlineSize = '360px'
  document.body.append(host)
  app = createApp({ render: () => h(XhJsonViewerRoot, { value, tools: true, defaultExpandedDepth: 2 }) })
  app.mount(host)
  await nextTick()
}

async function click(el: HTMLElement): Promise<void> {
  el.click()
  await nextTick()
}

function token(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

const TRIGGERS = ['expand-trigger', 'wrap-trigger', 'copy-trigger', 'view-trigger'] as const

describe.each(['comfortable', 'compact'] as const)('json 查看器内建工具条（%s）', (density) => {
  it('工具条是根的第一个孩子，钮靠条的末端排；条压在面的外头，与下面那块面之间留一档间距', async () => {
    await mount(density)
    const root = part('root')
    const toolbar = part('toolbar')
    expect(root.firstElementChild).toBe(toolbar)
    const style = getComputedStyle(toolbar)
    expect(style.display).toBe('flex')
    expect(style.justifyContent).toBe('flex-end')
    // 钮的末端贴着面的末端
    const tree = part('tree').getBoundingClientRect()
    const view = part('view-trigger').getBoundingClientRect()
    expect(Math.round(view.right)).toBe(Math.round(tree.right))
    expect(view.bottom).toBeLessThanOrEqual(tree.top)
  })

  it('看得见的钮是正方盒、边长等于 --xh-control-h-sm；字形 16px 且装得进钮里；hidden 的钮不占位置', async () => {
    await mount(density)
    const side = Number.parseFloat(token('--xh-control-h-sm'))
    expect([24, 28]).toContain(side)
    for (const name of TRIGGERS) {
      const el = part(name)
      const rect = el.getBoundingClientRect()
      if (name === 'wrap-trigger') {
        // 树档里换行开关收起来
        expect(el.hidden).toBe(true)
        expect(rect.width).toBe(0)
        continue
      }
      expect(rect.width, name).toBe(side)
      expect(rect.height, name).toBe(side)
      const glyph = pseudoBox(el, '::before')
      expect(glyph.width, name).toBe(16)
      expect(glyph.height, name).toBe(16)
      expect(getComputedStyle(el, '::before').maskImage, name).not.toBe('none')
    }
  })

  it('树 / 原文切换钮切到原文档：展开 / 收起钮收起，换行开关出现；切换钮换成「看树」的字形与名字，不画选中面', async () => {
    await mount(density)
    const view = part('view-trigger')
    const restBg = getComputedStyle(view).backgroundColor
    const sourceGlyph = getComputedStyle(view, '::before').maskImage
    await click(view)
    expect(part('root').dataset.view).toBe('text')
    expect(part('expand-trigger').getBoundingClientRect().width).toBe(0)
    expect(part('wrap-trigger').getBoundingClientRect().width).toBeGreaterThan(0)
    expect(view.getAttribute('aria-label')).toBe('Show tree')
    expect(view.hasAttribute('aria-pressed')).toBe(false)
    expect(getComputedStyle(view, '::before').maskImage).not.toBe(sourceGlyph)
    expect(getComputedStyle(view).backgroundColor).toBe(restBg)
  })

  it('展开 / 收起切换钮：字形与名字取这一下要做的事，按一下收回顶层、再按一下全部展开', async () => {
    // 演示数据只有两层，按两层展开已经全部摊开：钮一上来就是「收起全部」
    await mount(density)
    const expand = part('expand-trigger')
    expect(expand.dataset.state).toBe('open')
    expect(expand.getAttribute('aria-label')).toBe('Collapse all')
    const collapseGlyph = getComputedStyle(expand, '::before').maskImage
    await click(expand)
    expect(expand.dataset.state).toBe('closed')
    expect(expand.getAttribute('aria-label')).toBe('Expand all')
    expect(getComputedStyle(expand, '::before').maskImage).not.toBe(collapseGlyph)
    await click(expand)
    expect(expand.dataset.state).toBe('open')
    expect(getComputedStyle(expand, '::before').maskImage).toBe(collapseGlyph)
  })

  it('换行开关打开后原文的长行折到下一行，不再横向溢出', async () => {
    await mount(density)
    await click(part('view-trigger'))
    const text = part('text')
    expect(text.scrollWidth).toBeGreaterThan(text.clientWidth)
    await click(part('wrap-trigger'))
    expect(text.hasAttribute('data-wrap')).toBe(true)
    expect(getComputedStyle(text).whiteSpace).toBe('pre-wrap')
    expect(text.scrollWidth).toBeLessThanOrEqual(text.clientWidth)
  })

  it('复制成功：字形换成对钩、前景取成功色；播报区念出回执且视觉隐藏', async () => {
    const writes: string[] = []
    const original = Object.getOwnPropertyDescriptor(navigator, 'clipboard')
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async (text: string) => void writes.push(text) },
    })
    restoreClipboard = () => {
      if (original)
        Object.defineProperty(navigator, 'clipboard', original)
      else
        Reflect.deleteProperty(navigator, 'clipboard')
    }
    await mount(density)
    const copy = part('copy-trigger')
    const before = getComputedStyle(copy, '::before').maskImage
    copy.click()
    await new Promise(resolve => setTimeout(resolve, 0))
    await nextTick()

    expect(writes).toEqual([JSON.stringify(value, null, 2)])
    expect(copy.hasAttribute('data-copied')).toBe(true)
    expect(getComputedStyle(copy, '::before').maskImage).not.toBe(before)
    const success = document.createElement('span')
    success.style.color = 'var(--xh-fg-success)'
    document.body.append(success)
    // 前景按家族配方的 micro 时长过渡，等它落定再比
    await expect.poll(() => getComputedStyle(copy).color, { timeout: 2000 }).toBe(getComputedStyle(success).color)
    success.remove()

    const status = part('status')
    expect(status.textContent).toBe('Copied')
    const rect = status.getBoundingClientRect()
    expect(rect.width).toBeLessThanOrEqual(1)
    expect(rect.height).toBeLessThanOrEqual(1)
  })
})
