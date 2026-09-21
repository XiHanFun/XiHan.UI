// 步骤条自绘的状态字形——走过的步里皮肤画的兜底对号——是指示符，不是控件内图标：它与序号圆点同属
// --xh-control-indicator-* 一族（§6.5），root 上的 --xh-icon-size（桥自 --xh-steps-icon-size，sm 16px）只管
// 作者放进标题 / 说明里的图标。此前对号读 root 的 --xh-icon-size：comfortable 下恰好也是 16，compact 下
// 指示符收到 14 时它仍是 16。两档密度一起量：对号与作者塞进圆点里的 XhIcon 走指示符档 16 / 14，
// 作者放进标题里的图标两档都恒 16；圆点自己走 space / control-h 尺（md 32px），不随密度。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhIcon,
  XhStepsDescription,
  XhStepsIndicator,
  XhStepsItem,
  XhStepsList,
  XhStepsRoot,
  XhStepsSeparator,
  XhStepsTitle,
  XhStepsTrigger,
} from '../../src'
import { pseudoBox } from './pseudo-box'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

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
  const element = host!.querySelectorAll<HTMLElement>(`[data-scope='steps'][data-part='${name}']`)[index]
  if (!element)
    throw new Error(`缺少 steps 部件：${name}[${index}]`)
  return element
}

function authorIcon(label: string): ReturnType<typeof h> {
  return h(XhIcon, { label }, { default: () => h('path', { d: 'M4 12h16' }) })
}

async function mount(density: 'comfortable' | 'compact'): Promise<void> {
  document.documentElement.dataset.density = density
  host = document.createElement('div')
  host.style.inlineSize = '640px'
  document.body.append(host)
  app = createApp({
    // 第 0、1 步走过（value = 2）：第 0 步的圆点留空由皮肤画兜底对号，第 1 步的圆点里塞作者的 XhIcon；
    // 第 2 步是当前步，标题里再放一枚作者图标（仍按 root 的 sm 档）
    render: () => h(XhStepsRoot, { defaultValue: 2, count: 3 }, () => [
      h(XhStepsList, null, () => [0, 1, 2].map(index => h(XhStepsItem, { key: index, value: index }, () => [
        h(XhStepsTrigger, null, () => [
          h(XhStepsIndicator, null, index === 1 ? () => authorIcon('圆点图标') : undefined),
          h(XhStepsTitle, null, () => index === 2 ? [authorIcon('标题图标'), `步骤 ${index + 1}`] : `步骤 ${index + 1}`),
          h(XhStepsDescription, null, () => '步骤说明'),
        ]),
        h(XhStepsSeparator),
      ]))),
    ]),
  })
  app.mount(host)
  await nextTick()
}

function indicatorSize(): number {
  const value = Number.parseFloat(getComputedStyle(part('root')).getPropertyValue('--xh-control-indicator-size'))
  expect([14, 16]).toContain(value)
  return value
}

function describeGlyph(box: HTMLElement, pseudo: '::before' | '::after'): string {
  const style = getComputedStyle(box, pseudo)
  const rect = box.getBoundingClientRect()
  return `${box.dataset.part}${pseudo} ${style.width}×${style.height} position=${style.position} 盒 ${rect.width}×${rect.height}`
}

/** 圆点是两轴居中的 inline-flex 容器：唯一的行内字形落在圆心 */
function expectCenteredBox(box: HTMLElement): void {
  const style = getComputedStyle(box)
  expect(['flex', 'inline-flex']).toContain(style.display)
  expect(style.alignItems).toBe('center')
  expect(style.justifyContent).toBe('center')
}

describe.each(['comfortable', 'compact'] as const)('步骤条自绘状态字形按指示符档取尺（%s）', (density) => {
  it('走过的步没写内容时兜底对号等于 --xh-control-indicator-size，落在圆点里并居中', async () => {
    await mount(density)
    const indicator = indicatorSize()
    const dot = part('indicator', 0)
    expect(dot.getAttribute('data-state')).toBe('completed')
    expect(dot.childNodes.length, '空圆点才由皮肤画兜底的对号').toBe(0)
    expect(getComputedStyle(dot, '::before').maskImage, '兜底字形是勾').not.toBe('none')
    const check = pseudoBox(dot, '::before')
    const observed = describeGlyph(dot, '::before')
    expect(check.width, observed).toBe(indicator)
    expect(check.height, observed).toBe(indicator)
    // 圆点走 space-8（32px）的自家尺度，不随密度换档；对号落得进去
    const rect = dot.getBoundingClientRect()
    expect(rect.width, `圆点 ${rect.width}×${rect.height}`).toBe(32)
    expect(rect.height, `圆点 ${rect.width}×${rect.height}`).toBe(32)
    expect(check.width, observed).toBeLessThan(rect.width)
    expectCenteredBox(dot)
  })

  it('作者塞进圆点里的 XhIcon 与兜底对号同一把尺，随指示符档换档', async () => {
    await mount(density)
    const indicator = indicatorSize()
    const dot = part('indicator', 1)
    expect(dot.getAttribute('data-state')).toBe('completed')
    expect(Number.parseFloat(getComputedStyle(dot).getPropertyValue('--xh-icon-size'))).toBe(indicator)
    const svg = dot.querySelector<HTMLElement>('[data-scope=\'icon\'][data-part=\'root\']')!
    const rect = svg.getBoundingClientRect()
    expect(rect.width, `圆点图标 ${rect.width}×${rect.height}`).toBe(indicator)
    expect(rect.height, `圆点图标 ${rect.width}×${rect.height}`).toBe(indicator)
  })

  it('作者放进标题里的图标仍按 root 的 --xh-icon-size（sm 16px）取尺，不随指示符档变', async () => {
    await mount(density)
    expect(Number.parseFloat(getComputedStyle(part('root')).getPropertyValue('--xh-icon-size'))).toBe(16)
    const title = part('title', 2)
    const svg = title.querySelector<HTMLElement>('[data-scope=\'icon\'][data-part=\'root\']')!
    const rect = svg.getBoundingClientRect()
    expect(rect.width, `标题图标 ${rect.width}×${rect.height}`).toBe(16)
    expect(rect.height, `标题图标 ${rect.width}×${rect.height}`).toBe(16)
  })
})
