// 粗指针下开关的热区：根接 Action Control text 档，家族用根的 ::after 把命中区扩到 44px 高、
// 铺满根宽、绝对定位在根中心；皮肤在细指针下拿同一个 ::after 往外扩 4px（inset 负值）。
// 两套几何叠在一个伪元素上：皮肤的 inset 特指度高、盖掉家族的 50% 起点，家族的 100% 尺寸与
// -50% 平移却照旧生效——盒被平移到以左上角为中心，开关右半边落在热区之外。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhSwitch } from '../../src'
import { coarsePointer, finePointer, pseudoBox } from './pseudo-box'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(async () => {
  await finePointer()
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

async function mount(): Promise<HTMLElement> {
  host = document.createElement('div')
  host.style.cssText = 'padding: 80px'
  document.body.append(host)
  app = createApp({ render: () => h(XhSwitch, { 'data-testid': 'switch' }) })
  app.mount(host)
  await nextTick()
  const root = host.querySelector<HTMLElement>('[data-testid=\'switch\'][data-part=\'root\']')
  if (!root)
    throw new Error('缺少 switch 根')
  return root
}

describe('粗指针下的开关热区', () => {
  it('热区不小于 44×44，且与开关本体同心', async () => {
    await coarsePointer()
    const root = await mount()
    expect(root.getAttribute('data-xh-action-profile')).toBe('text')
    const rect = root.getBoundingClientRect()
    const box = pseudoBox(root, '::after')
    const observed = `::after ${JSON.stringify(box)} root ${JSON.stringify(rect)}`
    expect(box.width, observed).toBeGreaterThanOrEqual(44)
    expect(box.height, observed).toBeGreaterThanOrEqual(44)
    expect(Math.abs(box.centerX - (rect.left + rect.width / 2)), observed).toBeLessThanOrEqual(1)
    expect(Math.abs(box.centerY - (rect.top + rect.height / 2)), observed).toBeLessThanOrEqual(1)
  })

  it('细指针下仍是往外扩 4px 的命中区', async () => {
    const root = await mount()
    const rect = root.getBoundingClientRect()
    const box = pseudoBox(root, '::after')
    expect(box.width).toBe(rect.width + 8)
    expect(box.height).toBe(rect.height + 8)
    expect(box.x).toBe(rect.left - 4)
    expect(box.y).toBe(rect.top - 4)
  })
})
