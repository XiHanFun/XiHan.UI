// 层级图在真实布局里：矩形树图的子节点落在父节点里、名字不越出自己的节点；第一层满色、往下变浅，
// 名字与节点的对比度在亮暗两套主题下都够；真指针点分组的标题条下钻、点旭日图的空洞上钻。
// jsdom 量不出外接框与计算样式，只在 Chromium 验证。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp } from 'vitest/browser'
import { createApp, h, nextTick, reactive } from 'vue'
import { XhHierarchyChartRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

function mount(props: Record<string, unknown>): void {
  host = document.createElement('div')
  host.style.inlineSize = '640px'
  document.body.append(host)
  const state = reactive({ animated: false, ...props })
  app = createApp({ render: () => h(XhHierarchyChartRoot, state, { caption: () => '层级图' }) })
  app.mount(host)
}

async function settle(): Promise<void> {
  await nextTick()
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
  await nextTick()
}

function all(name: string): SVGGraphicsElement[] {
  return [...document.querySelectorAll<SVGGraphicsElement>(`[data-scope='hierarchy-chart'][data-part='${name}']`)]
}

function nodeNamed(label: string): SVGGraphicsElement {
  return all('node').find(n => n.getAttribute('aria-label')?.startsWith(`${label},`))!
}

/** CDP 的坐标是 CSS 像素乘页面缩放：先派一次移动量出比例。 */
async function mouseScale(): Promise<number> {
  const seen = new Promise<number>(resolve => document.addEventListener('pointermove', event => resolve(event.clientX / 20), { once: true }))
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 20, y: 20 })
  return seen
}

async function clickAt(x: number, y: number): Promise<void> {
  const scale = await mouseScale()
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: x / scale, y: y / scale })
  await settle()
  await cdp().send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, x: x / scale, y: y / scale })
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, x: x / scale, y: y / scale })
  await settle()
}

/** 计算样式里的颜色（可能是 oklab / color()）画到一个像素上读回 sRGB。 */
function rgb(color: string): [number, number, number] {
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  ctx.fillStyle = '#000'
  ctx.fillStyle = color
  ctx.fillRect(0, 0, 1, 1)
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
  return [r!, g!, b!]
}

function contrast(a: string, b: string): number {
  const lum = (c: string): number => {
    const [r, g, bl] = rgb(c).map((v) => {
      const s = v / 255
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
    })
    return 0.2126 * r! + 0.7152 * g! + 0.0722 * bl!
  }
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x)
  return (hi! + 0.05) / (lo! + 0.05)
}

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
  document.documentElement.removeAttribute('data-theme')
})

const TREE = {
  name: '全部',
  children: [
    { name: '研发', children: [{ name: '平台', value: 42 }, { name: '移动端', value: 26 }, { name: '数据', value: 18 }] },
    { name: '市场', children: [{ name: '品牌', value: 21 }, { name: '渠道', value: 16 }] },
    { name: '销售', children: [{ name: '华东', value: 24 }, { name: '华南', value: 18 }, { name: '华北', value: 15 }] },
  ],
}

// 八个分支、每个分支两个叶子：八个色槽的满色与浅色都要验到
const EIGHT = {
  name: '全部',
  children: Array.from({ length: 8 }, (_, i) => ({
    name: `分支${i + 1}`,
    children: [{ name: `甲${i + 1}`, value: 60 - i * 3 }, { name: `乙${i + 1}`, value: 40 - i * 2 }],
  })),
}

describe('层级图', () => {
  it('矩形树图：子节点落在父节点里，名字不越出自己的节点，分组标题写在顶部的标题条里', async () => {
    mount({ data: TREE })
    await settle()
    const group = nodeNamed('研发').getBoundingClientRect()
    for (const name of ['平台', '移动端', '数据']) {
      const child = nodeNamed(name).getBoundingClientRect()
      expect(child.left).toBeGreaterThanOrEqual(group.left - 0.5)
      expect(child.right).toBeLessThanOrEqual(group.right + 0.5)
      expect(child.bottom).toBeLessThanOrEqual(group.bottom + 0.5)
    }
    const header = all('group-header').find(t => t.textContent === '研发')!.getBoundingClientRect()
    const firstChildTop = Math.min(...['平台', '移动端', '数据'].map(n => nodeNamed(n).getBoundingClientRect().top))
    expect(header.top).toBeGreaterThanOrEqual(group.top - 0.5)
    expect(header.bottom).toBeLessThanOrEqual(firstChildTop + 0.5)
    const labels = all('node-label')
    expect(labels.length).toBeGreaterThan(0)
    for (const label of labels) {
      const box = label.getBoundingClientRect()
      const node = nodeNamed(label.textContent!).getBoundingClientRect()
      expect(box.left).toBeGreaterThanOrEqual(node.left - 0.5)
      expect(box.right).toBeLessThanOrEqual(node.right + 0.5)
      expect(box.top).toBeGreaterThanOrEqual(node.top - 0.5)
      expect(box.bottom).toBeLessThanOrEqual(node.bottom + 0.5)
    }
  })

  for (const theme of ['light', 'dark'] as const) {
    it(`${theme}：第一层满色、第二层变浅；名字与节点的对比度不低于 4.5:1`, async () => {
      if (theme === 'dark')
        document.documentElement.setAttribute('data-theme', 'dark')
      mount({ data: EIGHT, layout: 'icicle' })
      await settle()
      for (let i = 1; i <= 8; i++) {
        const top = nodeNamed(`分支${i}`)
        const leaf = nodeNamed(`甲${i}`)
        expect(getComputedStyle(top).fill).not.toBe(getComputedStyle(leaf).fill)
      }
      const labels = all('node-label')
      expect(labels.length).toBeGreaterThanOrEqual(8)
      for (const label of labels) {
        const node = nodeNamed(label.textContent!)
        const ratio = contrast(getComputedStyle(label).fill, getComputedStyle(node).fill)
        expect(ratio, `${label.textContent} 的名字对比度`).toBeGreaterThanOrEqual(4.5)
      }
    })
  }

  it('按值着色：色阶两段上的名字与节点的对比度不低于 4.5:1', async () => {
    mount({ data: EIGHT, layout: 'icicle', colorBy: 'value', depth: 1 })
    await settle()
    const labels = all('node-label')
    expect(labels.length).toBeGreaterThanOrEqual(4)
    for (const label of labels) {
      const node = nodeNamed(label.textContent!)
      expect(contrast(getComputedStyle(label).fill, getComputedStyle(node).fill), label.textContent!).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('真指针点分组的标题条下钻：路径出现、看得见的换成它的子节点；点路径的第一项回到最顶层', async () => {
    mount({ data: TREE })
    await settle()
    const path = document.querySelector<HTMLElement>(`[data-scope='hierarchy-chart'][data-part='path']`)!
    expect(path.hidden).toBe(true)
    const group = nodeNamed('研发').getBoundingClientRect()
    await clickAt(group.left + 8, group.top + 6)
    expect(path.hidden).toBe(false)
    expect(all('node').map(n => n.getAttribute('aria-label')!.split(',')[0])).toEqual(['平台', '移动端', '数据'])
    const [top] = all('path-item') as unknown as HTMLElement[]
    const box = top!.getBoundingClientRect()
    await clickAt(box.left + box.width / 2, box.top + box.height / 2)
    expect(path.hidden).toBe(true)
    expect(all('node')).toHaveLength(11)
  })

  it('旭日图：点中间的空洞上钻一层', async () => {
    mount({ data: TREE, layout: 'sunburst', defaultRootKey: '销售' })
    await settle()
    expect(all('node')).toHaveLength(3)
    const plot = document.querySelector<SVGSVGElement>(`[data-scope='hierarchy-chart'][data-part='plot']`)!.getBoundingClientRect()
    await clickAt(plot.left + plot.width / 2, plot.top + plot.height / 2)
    expect(all('node')).toHaveLength(11)
  })
})
