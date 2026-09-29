// Cascader 的浮层按内容定宽：每一列取条目的自然宽度、以 --xh-overlay-menu-min-w 托底，不随字段盒拉伸；
// 长选项把列撑到条目的上限为止，余下的在条目里截断；面板随列数伸展。浮层锚在字段盒上，面板起始缘与盒对齐。
// 面板含多列，材质取 floating：不透景的实体面 + 描边 + 浮起投影。
//
// 判据全在布局与计算样式上：列宽要等皮肤排版、浮层落位之后才落定，jsdom 不排版。
import type { CascaderLevel, CascaderNode } from '@xihan-ui/headless'
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhCascaderColumn,
  XhCascaderContent,
  XhCascaderControl,
  XhCascaderInput,
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

/** 只有短选项：列宽全由下界决定。 */
const SHORT: CascaderNode[] = [
  { value: 'zj', label: '浙江', children: [{ value: 'hz', label: '杭州' }] },
  { value: 'js', label: '江苏', children: [{ value: 'nj', label: '南京' }] },
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

async function mount(options: { collection?: CascaderNode[], value?: string[][], searchable?: boolean } = {}): Promise<HTMLElement> {
  host = document.createElement('div')
  host.style.cssText = 'padding: 24px'
  document.body.append(host)
  app = createApp({
    render: () => h(XhCascaderRoot, {
      collection: options.collection ?? COLLECTION,
      open: true,
      searchable: options.searchable ?? false,
      ...(options.value ? { value: options.value } : {}),
    } as never, {
      default: ({ levels }: { levels: CascaderLevel[] }) => [
        h(XhCascaderControl, null, () => [
          h(XhCascaderTrigger, null, () => h(XhCascaderValueText)),
        ]),
        h(XhCascaderPositioner, null, () => [
          h(XhCascaderContent, null, () => [
            ...(options.searchable ? [h(XhCascaderInput, { placeholder: '搜索地区' })] : []),
            ...levels.map(level => h(XhCascaderColumn, { key: level.level, level: level.level }, () =>
              level.items.map(node => h(XhCascaderItem, { key: node.value, value: node.value }, () =>
                h(XhCascaderItemText, null, () => node.label))))),
          ]),
        ]),
      ],
    }),
  })
  app.mount(host)
  await nextTick()
  return settled()
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

/** 一支长度令牌在某个节点上解析出来的像素数。读 min-inline-size：它回的是计算值，不受探针自己排版的影响。 */
function px(on: HTMLElement, token: string): number {
  return Number.parseFloat(resolved(on, 'min-inline-size', `var(${token})`))
}

describe('级联选择的浮层宽度', () => {
  it('短选项的一级列取下界，不随字段盒拉伸', async () => {
    const content = await mount({ collection: SHORT })
    expect(column(0).getBoundingClientRect().width).toBeCloseTo(px(content, '--xh-overlay-menu-min-w'), 0)
    // 缺省宽的字段盒比下界宽，面板不跟着它拉宽
    expect(content.getBoundingClientRect().width).toBeLessThan(part('control').getBoundingClientRect().width)
  })

  it('长选项把一级列撑到条目上限为止，余下的在条目里截断', async () => {
    const content = await mount()
    const text = [...document.querySelectorAll<HTMLElement>(`[data-scope='cascader'][data-part='item-text']`)]
      .find(el => el.textContent === LONG)!
    const item = text.closest<HTMLElement>(`[data-part='item']`)!
    expect(item.getBoundingClientRect().width).toBeCloseTo(px(content, '--xh-overlay-max-w'), 0)
    expect(text.scrollWidth).toBeGreaterThan(text.clientWidth)
  })

  it('搜索框不参与定宽：面板仍由列撑出，搜索框铺满这一宽度', async () => {
    const content = await mount({ collection: SHORT, searchable: true })
    const input = part('input')
    // 原生输入框自带约 20 个字符的固有宽度，还有自己的内衬；两样都不许把面板撑得比列宽
    expect(content.clientWidth).toBeCloseTo(column(0).getBoundingClientRect().width, 0)
    expect(input.getBoundingClientRect().width).toBeCloseTo(content.clientWidth, 0)
  })

  it('浮层锚在字段盒上：面板起始缘与盒的起始缘对齐', async () => {
    const content = await mount({ collection: SHORT })
    expect(content.getBoundingClientRect().left).toBeCloseTo(part('control').getBoundingClientRect().left, 0)
  })

  it('后续列同样按自然宽度，面板随列数伸展', async () => {
    const content = await mount({ value: [['zj', 'hz', 'xh']] })
    const first = column(0).getBoundingClientRect().width
    const second = column(1).getBoundingClientRect().width
    // 「杭州 / 宁波」这一列只取下界，比装着长选项的一级列窄
    expect(second).toBeCloseTo(px(content, '--xh-overlay-menu-min-w'), 0)
    expect(second).toBeLessThan(first)
    // 面板随列数伸展；宽过可用区时收成可用宽度，溢出的列在面内横滚够得到
    expect(content.scrollWidth).toBeGreaterThan(first + second)
    expect(content.getBoundingClientRect().right).toBeLessThanOrEqual(document.documentElement.clientWidth)
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
