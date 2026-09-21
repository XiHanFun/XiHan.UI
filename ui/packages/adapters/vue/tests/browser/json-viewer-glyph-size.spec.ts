// JSON 查看器自绘的状态字形——分支行首的展开方向 chevron——是指示符，不是控件内图标：
// 它与自己所在的把手盒同属 --xh-control-indicator-* 一族（§6.5），--xh-json-viewer-icon-size / --xh-icon-size
// 只管作者放进空态格里的图标。此前 chevron 读 root 按档下发的 --xh-icon-size（md 20px），而把手盒已是
// 指示符档 16px：20 的箭头装在 16 的钮里、两侧各溢出 2px；compact 下盒收到 14 时它仍是 20。
// 两档密度一起量：指示符档 comfortable 16 / compact 14，作者图标两档都恒 20。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhIcon, XhJsonViewerRoot } from '../../src'
import { pseudoBox } from './pseudo-box'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const value = {
  user: { name: 'XiHan', roles: ['admin', 'dev'] },
  meta: { version: 1 },
}

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  delete document.documentElement.dataset.density
  app = null
  host = null
})

function part(name: string, index = 0): HTMLElement {
  const element = host!.querySelectorAll<HTMLElement>(`[data-scope='json-viewer'][data-part='${name}']`)[index]
  if (!element)
    throw new Error(`缺少 json-viewer 部件：${name}[${index}]`)
  return element
}

function authorIcon(): ReturnType<typeof h> {
  return h(XhIcon, { label: '作者图标' }, { default: () => h('path', { d: 'M4 12h16' }) })
}

async function mount(density: 'comfortable' | 'compact'): Promise<void> {
  document.documentElement.dataset.density = density
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    // 第一棵：根与 user 分支展开、roles 与 meta 分支收起——chevron 转过 90° 与未转两态都量到；
    // 第二棵：没有可摊的行、只剩空态格，作者图标塞进空态槽——root 按档下发的 --xh-icon-size 只管它
    render: () => [
      h(XhJsonViewerRoot, { value, defaultExpandedValue: ['$', '$["user"]'] }),
      h(XhJsonViewerRoot, { value: undefined }, { empty: () => [authorIcon(), '暂无数据'] }),
    ],
  })
  app.mount(host)
  await nextTick()
}

function indicatorSize(): number {
  const value = Number.parseFloat(getComputedStyle(part('root')).getPropertyValue('--xh-control-indicator-size'))
  expect([14, 16]).toContain(value)
  return value
}

function describeGlyph(host: HTMLElement, pseudo: '::before' | '::after'): string {
  const style = getComputedStyle(host, pseudo)
  const rect = host.getBoundingClientRect()
  return `${host.dataset.part}[${host.dataset.state}]${pseudo} ${style.width}×${style.height} position=${style.position} 盒 ${rect.width}×${rect.height}`
}

/** 盒是两轴居中的容器：唯一的行内字形落在盒中心 */
function expectCenteredBox(box: HTMLElement): void {
  const style = getComputedStyle(box)
  expect(['flex', 'inline-flex', 'grid', 'inline-grid']).toContain(style.display)
  expect(style.alignItems).toBe('center')
  if (style.display.endsWith('grid'))
    expect(style.justifyItems).toBe('center')
  else
    expect(style.justifyContent).toBe('center')
}

describe.each(['comfortable', 'compact'] as const)('json 查看器自绘状态字形按指示符档取尺（%s）', (density) => {
  it('展开箭头把手的盒等于 --xh-control-indicator-size，转过 90° 的开态与收起态同一把尺', async () => {
    await mount(density)
    const indicator = indicatorSize()
    const open = part('branch-trigger', 1)
    const closed = part('branch-trigger', 2)
    expect(open.querySelector<HTMLElement>('[data-part=\'branch-indicator\']')!.dataset.state).toBe('open')
    expect(closed.querySelector<HTMLElement>('[data-part=\'branch-indicator\']')!.dataset.state).toBe('closed')
    for (const box of [open, closed]) {
      const observed = describeGlyph(box, '::before')
      expect(box.getBoundingClientRect().width, observed).toBe(indicator)
      expectCenteredBox(box)
    }
  })

  it('兜底 chevron 与把手盒同边长、边长等于 --xh-control-indicator-size，不读 root 按档下发的 --xh-icon-size', async () => {
    await mount(density)
    const indicator = indicatorSize()
    for (const trigger of [part('branch-trigger', 1), part('branch-trigger', 2)]) {
      const mark = trigger.querySelector<HTMLElement>('[data-scope=\'json-viewer\'][data-part=\'branch-indicator\']')!
      const chevron = pseudoBox(mark, '::before')
      const observed = describeGlyph(mark, '::before')
      expect(chevron.width, observed).toBe(indicator)
      expect(chevron.height, observed).toBe(indicator)
      // 字形装得进把手：不再比盒宽、也不比盒高
      expect(chevron.width, observed).toBeLessThanOrEqual(trigger.getBoundingClientRect().width)
      expect(chevron.height, observed).toBeLessThanOrEqual(trigger.getBoundingClientRect().height)
    }
  })

  it('作者塞进空态格里的图标仍按 --xh-icon-size（md 20px）取尺，不随指示符档变', async () => {
    await mount(density)
    const empty = part('empty', 1)
    expect(empty.hidden).toBe(false)
    expect(Number.parseFloat(getComputedStyle(empty).getPropertyValue('--xh-icon-size'))).toBe(20)
    const icons = [...host!.querySelectorAll<HTMLElement>('[data-scope=\'icon\'][data-part=\'root\']')]
    expect(icons.length).toBe(1)
    for (const svg of icons) {
      expect(svg.getBoundingClientRect().width).toBe(20)
      expect(svg.getBoundingClientRect().height).toBe(20)
    }
  })
})
