// Cascader 的一级列是列表型浮层：与字段盒等宽、长选项在条目里截断；后续列按自然宽度，面板随列数伸展。
// 浮层锚在字段盒上，面板起始缘与盒对齐。面板含多列，材质取 floating：不透景的实体面 + 描边 + 浮起投影。
//
// 判据全在布局与计算样式上：一级列宽度要等引擎量到锚点、写进槽、皮肤消费之后才落定，jsdom 不排版。
import type { CascaderLevel, CascaderNode } from '@xihan-ui/headless'
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhCascaderColumn,
  XhCascaderContent,
  XhCascaderControl,
  XhCascaderItem,
  XhCascaderItemText,
  XhCascaderPositioner,
  XhCascaderRoot,
  XhCascaderTrigger,
  XhCascaderValueText,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const LONG = '一条很长很长的一级选项文字，长到缺省宽的字段盒都装不下，只能在条目里截断'

const COLLECTION: CascaderNode[] = [
  {
    value: 'zj',
    label: '浙江',
    children: [
      { value: 'hz', label: '杭州', children: [{ value: 'xh', label: '西湖' }] },
      { value: 'nb', label: '宁波' },
    ],
  },
  { value: 'long', label: LONG },
  ...Array.from({ length: 12 }, (_, i) => ({ value: `p${i}`, label: `省份 ${i}` })),
]

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  document.getElementById('xh-portal-root')?.remove()
  app = null
  host = null
})

function part(name: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[data-scope='cascader'][data-part='${name}']`)
  if (!el)
    throw new Error(`找不到 cascader 的 ${name}`)
  return el
}

function column(level: number): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[data-scope='cascader'][data-part='column'][data-level='${level}']`)
  if (!el)
    throw new Error(`找不到第 ${level} 列`)
  return el
}

/** 等落位、进场播完、几何连续两帧不变。 */
async function settled(): Promise<HTMLElement> {
  const frame = (): Promise<void> => new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 0)))
  for (let i = 0; i < 120 && !document.querySelector(`[data-scope='cascader'][data-part='positioner'][data-positioned]`); i += 1)
    await frame()
  const portal = document.getElementById('xh-portal-root')
  if (portal)
    await Promise.all(portal.getAnimations({ subtree: true }).map(a => a.finished.catch(() => undefined)))
  const content = part('content')
  let previous = JSON.stringify(content.getBoundingClientRect())
  for (let i = 0; i < 60; i += 1) {
    await frame()
    const current = JSON.stringify(content.getBoundingClientRect())
    if (current === previous)
      return content
    previous = current
  }
  throw new Error('cascader 的几何一直没落定')
}

async function mount(options: { value?: string[][], style?: string } = {}): Promise<HTMLElement> {
  host = document.createElement('div')
  host.style.cssText = 'padding: 24px'
  document.body.append(host)
  app = createApp({
    render: () => h(XhCascaderRoot, {
      collection: COLLECTION,
      open: true,
      ...(options.value ? { value: options.value } : {}),
      style: options.style,
    } as never, {
      default: ({ levels }: { levels: CascaderLevel[] }) => [
        h(XhCascaderControl, null, () => [
          h(XhCascaderTrigger, null, () => h(XhCascaderValueText)),
        ]),
        h(XhCascaderPositioner, null, () => [
          h(XhCascaderContent, null, () => levels.map(level => h(XhCascaderColumn, { key: level.level, level: level.level }, () =>
            level.items.map(node => h(XhCascaderItem, { key: node.value, value: node.value }, () =>
              h(XhCascaderItemText, null, () => node.label)))))),
        ]),
      ],
    }),
  })
  app.mount(host)
  await nextTick()
  return settled()
}

function remPx(rem: number): number {
  return rem * Number.parseFloat(getComputedStyle(document.documentElement).fontSize)
}

function alphaOf(color: string): number {
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  const context = canvas.getContext('2d')!
  context.fillStyle = color
  context.fillRect(0, 0, 1, 1)
  return context.getImageData(0, 0, 1, 1).data[3]!
}

/** 读一支令牌在某个节点上解析出来的计算值。 */
function resolved(on: HTMLElement, property: string, value: string): string {
  const probe = document.createElement('span')
  probe.style.setProperty(property, value)
  on.append(probe)
  const out = getComputedStyle(probe).getPropertyValue(property)
  probe.remove()
  return out
}

describe('级联选择的浮层宽度', () => {
  it('一级列与字段盒等宽，长选项在条目里截断', async () => {
    const content = await mount()
    const control = part('control').getBoundingClientRect()
    // 只有一级列时整块面板恰好与字段盒齐宽，一级列铺满面板的描边之内
    expect(content.getBoundingClientRect().width).toBeCloseTo(control.width, 0)
    expect(column(0).getBoundingClientRect().width).toBeCloseTo(content.clientWidth, 0)
    const text = [...document.querySelectorAll<HTMLElement>(`[data-scope='cascader'][data-part='item-text']`)]
      .find(el => el.textContent === LONG)!
    expect(text.scrollWidth).toBeGreaterThan(text.clientWidth)
  })

  it('浮层锚在字段盒上：面板起始缘与盒的起始缘对齐', async () => {
    const content = await mount()
    expect(content.getBoundingClientRect().left).toBeCloseTo(part('control').getBoundingClientRect().left, 0)
  })

  it('后续列按自然宽度，面板随列数伸展', async () => {
    const content = await mount({ value: [['zj', 'hz', 'xh']] })
    const first = column(0).getBoundingClientRect().width
    const second = column(1).getBoundingClientRect().width
    const border = Number.parseFloat(getComputedStyle(content).borderLeftWidth) * 2
    // 列多了一级列也不变宽：仍是字段盒扣掉面板两侧描边
    expect(first).toBeCloseTo(part('control').getBoundingClientRect().width - border, 0)
    // 「杭州 / 宁波」这一列用不着字段盒那么宽
    expect(second).toBeLessThan(first)
    // 面板随列数伸展；宽过可用区时收成可用宽度，溢出的列在面内横滚够得到
    expect(content.scrollWidth).toBeGreaterThan(first + second)
    expect(content.getBoundingClientRect().right).toBeLessThanOrEqual(document.documentElement.clientWidth)
  })

  it('字段盒比下界还窄时面板取下界', async () => {
    const content = await mount({ style: 'inline-size: 6rem; min-inline-size: 0' })
    expect(part('control').getBoundingClientRect().width).toBeLessThan(remPx(10))
    expect(content.getBoundingClientRect().width).toBeCloseTo(remPx(10), 0)
  })
})

describe('级联选择的浮层材质', () => {
  it('多列面板取 floating：实体底、border-default 描边、浮起投影、不透景', async () => {
    const content = await mount()
    const style = getComputedStyle(content)
    expect(alphaOf(style.backgroundColor)).toBe(255)
    expect(style.backdropFilter).toBe('none')
    expect(style.borderTopColor).toBe(resolved(content, 'border-top-color', 'var(--xh-border-default)'))
    expect(style.boxShadow).toBe(resolved(content, 'box-shadow', 'var(--xh-elevation-floating)'))
  })

  it('列与列之间的分隔取实体面的内部分隔令牌', async () => {
    await mount({ value: [['zj', 'hz', 'xh']] })
    const second = column(1)
    expect(getComputedStyle(second).borderInlineStartColor)
      .toBe(resolved(second, 'border-inline-start-color', 'var(--xh-material-solid-separator)'))
  })
})
