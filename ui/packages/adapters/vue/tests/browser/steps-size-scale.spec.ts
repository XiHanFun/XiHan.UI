// 步骤条的尺寸档：序号圆点取状态圆那把尺 marker-size 的 sm / md / lg（比同档控件矮一档），随密度换档；
// 作者放进标题里的图标是控件内图标，按档取 glyph-size-sm / md / lg（16 / 20 / 24），不再三档都钉在 16。
// 两档密度、三个尺寸档一起量：圆点直径等于同档 marker-size，标题图标等于同档字形令牌。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhIcon,
  XhStepsIndicator,
  XhStepsItem,
  XhStepsList,
  XhStepsRoot,
  XhStepsTitle,
  XhStepsTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

type Size = 'sm' | 'md' | 'lg'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  delete document.documentElement.dataset.density
  app = null
  host = null
})

async function mount(density: 'comfortable' | 'compact', size: Size): Promise<void> {
  document.documentElement.dataset.density = density
  host = document.createElement('div')
  host.style.inlineSize = '640px'
  document.body.append(host)
  app = createApp({
    render: () => [
      h(XhStepsRoot, { defaultValue: 0, count: 2, size }, () => [
        h(XhStepsList, null, () => [0, 1].map(index => h(XhStepsItem, { key: index, value: index }, () => [
          h(XhStepsTrigger, null, () => [
            h(XhStepsIndicator, null, () => String(index + 1)),
            h(XhStepsTitle, null, () => [
              h(XhIcon, { label: '标题图标' }, { default: () => h('path', { d: 'M4 12h16' }) }),
              `步骤 ${index + 1}`,
            ]),
          ]),
        ]))),
      ]),
    ],
  })
  app.mount(host)
  await nextTick()
}

function part(scope: string, name: string): HTMLElement {
  const element = host!.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='${name}']`)
  if (!element)
    throw new Error(`缺少 ${scope} 部件：${name}`)
  return element
}

function tokenPx(name: string): number {
  const probe = document.createElement('span')
  probe.style.cssText = `display: block; inline-size: var(${name})`
  host!.append(probe)
  const value = probe.getBoundingClientRect().width
  probe.remove()
  return value
}

describe.each(['comfortable', 'compact'] as const)('步骤条的尺寸档（%s）', (density) => {
  it.each(['sm', 'md', 'lg'] as const)('%s 档的序号圆点取 marker-size，比同档控件矮一档', async (size) => {
    await mount(density, size)
    const dot = part('steps', 'indicator').getBoundingClientRect()
    const expected = tokenPx(`--xh-marker-size-${size}`)
    expect(dot.width, `圆点 ${dot.width}×${dot.height}`).toBe(expected)
    expect(dot.height, `圆点 ${dot.width}×${dot.height}`).toBe(expected)
    expect(dot.width).toBeLessThan(tokenPx(`--xh-control-h-${size}`))
  })

  it.each(['sm', 'md', 'lg'] as const)('%s 档标题里的作者图标按档取字形尺', async (size) => {
    await mount(density, size)
    const svg = part('steps', 'title').querySelector<HTMLElement>(`[data-scope='icon'][data-part='root']`)!
    const rect = svg.getBoundingClientRect()
    const expected = tokenPx(`--xh-glyph-size-${size}`)
    expect(rect.width, `标题图标 ${rect.width}×${rect.height}`).toBe(expected)
    expect(rect.height, `标题图标 ${rect.width}×${rect.height}`).toBe(expected)
  })
})
