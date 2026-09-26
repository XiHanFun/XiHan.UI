// 液态档的双沿指示器：data-material="liquid" 下切换选中项，指示器的两条边各由一支弹簧推着走，
// 去向那一侧领先、另一侧跟随，途中被拉长、在另一个方向上压扁，停下收回到目标盒子。
// 钉住：液态档途中比目标长、压扁，最终落在目标上；标准档直接落到目标、不拉长；减弱动效下直接落定。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import { XhSegmentedRoot, XhTabsIndicator, XhTabsList, XhTabsRoot, XhTabsTrigger } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null
let app: App | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
})

const RANGES = [
  { value: 'day', label: '日' },
  { value: 'week', label: '周' },
  { value: 'month', label: '月' },
  { value: 'quarter', label: '季度' },
]

const frame = (): Promise<void> => new Promise(resolve => requestAnimationFrame(() => resolve()))

async function mount(attrs: Record<string, string>): Promise<{ value: ReturnType<typeof ref<string>>, indicator: () => HTMLElement }> {
  host = document.createElement('div')
  for (const [name, value] of Object.entries(attrs))
    host.setAttribute(name, value)
  document.body.append(host)
  const value = ref('day')
  app = createApp({
    render: () => h(XhSegmentedRoot, {
      'collection': RANGES,
      'value': value.value,
      'aria-label': '时间粒度',
      'onValueChange': ({ value: next }: { value: string }) => {
        value.value = next
      },
    }),
  })
  app.mount(host)
  await nextTick()
  await frame()
  await frame()
  return { value, indicator: () => host!.querySelector<HTMLElement>('[data-scope="segmented"][data-part="indicator"]')! }
}

/** 指示器这一刻画出来的宽度（连接层逐帧写的私有槽）与压扁比例。 */
function sample(indicator: HTMLElement): { width: number, squash: number, stretch: number } {
  const style = getComputedStyle(indicator)
  return {
    width: Number.parseFloat(indicator.style.getPropertyValue('--xh-_segmented-indicator-w')),
    squash: Number.parseFloat(style.scale.split(' ')[1] ?? '1'),
    stretch: Number.parseFloat(indicator.style.getPropertyValue('--xh-_segmented-indicator-stretch')),
  }
}

function targetWidth(value: string): number {
  const item = [...host!.querySelectorAll<HTMLElement>('[data-scope="segmented"][data-part="item"]')]
    .find(el => el.getAttribute('data-value') === value)!
  return item.offsetWidth
}

describe('液态档的双沿指示器', () => {
  it('从第一段跳到最后一段：途中比目标长、块向压扁，停下落在目标上', async () => {
    const { value, indicator } = await mount({ 'data-material': 'liquid' })
    value.value = 'quarter'
    const samples: Array<ReturnType<typeof sample>> = []
    for (let i = 0; i < 90; i++) {
      await frame()
      samples.push(sample(indicator()))
    }
    const target = targetWidth('quarter')
    expect(Math.max(...samples.map(s => s.width))).toBeGreaterThan(target * 1.5)
    expect(Math.max(...samples.map(s => s.stretch))).toBeGreaterThan(0.5)
    expect(Math.min(...samples.map(s => s.squash))).toBeLessThan(0.95)
    // 压扁不越过令牌给的下限
    expect(Math.min(...samples.map(s => s.squash))).toBeGreaterThanOrEqual(0.86 - 0.001)
    const last = samples.at(-1)!
    expect(last.width).toBeCloseTo(target, 0)
    expect(last.stretch).toBe(0)
    expect(last.squash).toBe(1)
  })

  it('标准档：指示器直接落到目标盒子，由过渡接手，不拉长', async () => {
    const { value, indicator } = await mount({})
    value.value = 'quarter'
    await nextTick()
    await frame()
    const now = sample(indicator())
    expect(now.width).toBe(targetWidth('quarter'))
    expect(now.stretch).toBe(0)
  })

  it('tabs 的 segment 档共用同一套：点另一个标签，指示器途中被拉长，停下落在那个标签上', async () => {
    host = document.createElement('div')
    host.setAttribute('data-material', 'liquid')
    document.body.append(host)
    app = createApp({
      render: () => h(XhTabsRoot, { defaultValue: 'a', variant: 'segment', style: 'inline-size: 480px' }, () => [
        h(XhTabsList, { 'aria-label': '视图' }, () => [
          h(XhTabsTrigger, { value: 'a' }, () => '概览'),
          h(XhTabsTrigger, { value: 'b' }, () => '分析'),
          h(XhTabsTrigger, { value: 'c' }, () => '报告与导出'),
          h(XhTabsIndicator),
        ]),
      ]),
    })
    app.mount(host)
    await nextTick()
    await frame()
    await frame()
    const indicator = host.querySelector<HTMLElement>('[data-scope="tabs"][data-part="indicator"]')!
    const last = host.querySelector<HTMLElement>('[data-scope="tabs"][data-part="trigger"][data-value="c"]')!
    last.click()
    const widths: number[] = []
    for (let i = 0; i < 90; i++) {
      await frame()
      widths.push(Number.parseFloat(indicator.style.getPropertyValue('--xh-_tabs-indicator-w')))
    }
    expect(Math.max(...widths)).toBeGreaterThan(last.offsetWidth * 1.3)
    expect(widths.at(-1)).toBeCloseTo(last.offsetWidth, 0)
    expect(indicator.style.getPropertyValue('--xh-_tabs-indicator-stretch')).toBe('0')
  })

  it('减弱动效：液态档下同样直接落定', async () => {
    const { value, indicator } = await mount({ 'data-material': 'liquid', 'data-motion': 'reduce' })
    value.value = 'quarter'
    await nextTick()
    await frame()
    const now = sample(indicator())
    expect(now.width).toBe(targetWidth('quarter'))
    expect(now.stretch).toBe(0)
  })
})
