// Button 在途：指示部件不占排布、钮宽不变；环居中压在钮上，进入在途等一个 micro 才起淡，
// 标签同刻淡出留位；退出在途不等，环与标签按 micro 交叉淡回。静止时标签左侧不空一格。
// 判据是几何与计算样式，jsdom 不排版。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import { XhButton, XhButtonIndicator, XhButtonLabel } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

async function mount(): Promise<{ root: HTMLElement, label: HTMLElement, indicator: HTMLElement, loading: { value: boolean } }> {
  const loading = ref(false)
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhButton, { loading: loading.value }, () => [
      h(XhButtonIndicator),
      h(XhButtonLabel, null, () => '保存'),
    ]),
  })
  app.mount(host)
  await nextTick()
  const root = host.querySelector<HTMLElement>(`[data-scope='button'][data-part='root']`)!
  return {
    root,
    label: root.querySelector<HTMLElement>(`[data-part='label']`)!,
    indicator: root.querySelector<HTMLElement>(`[data-part='indicator']`)!,
    loading,
  }
}

function micro(on: Element): string {
  const probe = document.createElement('span')
  probe.style.transitionDuration = 'var(--xh-motion-duration-micro)'
  on.append(probe)
  const value = getComputedStyle(probe).transitionDuration
  probe.remove()
  return value
}

describe('button 在途', () => {
  it('静止时指示部件不占排布：标签贴着钮的内衬起排', async () => {
    const { root, label } = await mount()
    const padding = Number.parseFloat(getComputedStyle(root).paddingInlineStart)
    const border = Number.parseFloat(getComputedStyle(root).borderInlineStartWidth)
    expect(label.getBoundingClientRect().left - root.getBoundingClientRect().left).toBeCloseTo(padding + border, 0)
  })

  it('进入在途：钮宽不变，环居中、等一个 micro 才淡入，标签同刻淡出', async () => {
    const { root, label, indicator, loading } = await mount()
    const width = root.getBoundingClientRect().width
    loading.value = true
    await nextTick()
    expect(root.getBoundingClientRect().width).toBe(width)
    const ring = getComputedStyle(indicator, '::before')
    expect(ring.borderRadius).toBe('50%')
    expect(ring.transitionDelay).toBe(micro(root))
    expect(getComputedStyle(label).transitionDelay).toBe(micro(root))
    // 环在钮的正中
    const box = indicator.getBoundingClientRect()
    const rect = root.getBoundingClientRect()
    expect(box.left + box.width / 2).toBeCloseTo(rect.left + rect.width / 2, 0)
    expect(box.top + box.height / 2).toBeCloseTo(rect.top + rect.height / 2, 0)
    await expect.poll(() => getComputedStyle(indicator, '::before').opacity).toBe('1')
    await expect.poll(() => getComputedStyle(label).opacity).toBe('0')
  })

  it('退出在途不等：环与标签按 micro 交叉淡回', async () => {
    const { label, indicator, loading } = await mount()
    loading.value = true
    await nextTick()
    await expect.poll(() => getComputedStyle(label).opacity).toBe('0')
    loading.value = false
    await nextTick()
    expect(getComputedStyle(label).transitionDelay).toBe('0s')
    expect(getComputedStyle(indicator, '::before').transitionDelay).toBe('0s')
    await expect.poll(() => getComputedStyle(label).opacity).toBe('1')
    await expect.poll(() => getComputedStyle(indicator, '::before').opacity).toBe('0')
  })
})
