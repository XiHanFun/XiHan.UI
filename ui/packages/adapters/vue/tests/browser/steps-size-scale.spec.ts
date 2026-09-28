// 步骤条的尺寸档与同类对象同一把尺：序号圆点和 Avatar 一样取 control-h 的 sm / md / lg，随密度换档；
// 作者放进标题里的图标是控件内图标，按档取 glyph-size-sm / md / lg（16 / 20 / 24），不再三档都钉在 16。
// 两档密度、三个尺寸档一起量：圆点与同档 Avatar 的直径逐一相等，标题图标等于同档字形令牌。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhAvatarFallback,
  XhAvatarRoot,
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
      h(XhAvatarRoot, { size }, () => h(XhAvatarFallback, null, () => '甲')),
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
  it.each(['sm', 'md', 'lg'] as const)('%s 档的序号圆点与同档 Avatar 同径，都取 control-h', async (size) => {
    await mount(density, size)
    const dot = part('steps', 'indicator').getBoundingClientRect()
    const avatar = part('avatar', 'root').getBoundingClientRect()
    const expected = tokenPx(`--xh-control-h-${size}`)
    expect(dot.width, `圆点 ${dot.width}×${dot.height}`).toBe(expected)
    expect(dot.height, `圆点 ${dot.width}×${dot.height}`).toBe(expected)
    expect(dot.width, `Avatar ${avatar.width}`).toBe(avatar.width)
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
