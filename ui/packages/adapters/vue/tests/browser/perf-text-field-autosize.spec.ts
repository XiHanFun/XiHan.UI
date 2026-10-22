// 多行文本框自动增高（Vue）：值、占位符、autoSize 配置与排字样式都没变的更新不重新量高，不强制排版；
// 值变了才量，量的时候一次排版读完，不读写交替。页面里先铺一大片节点，让每次强制排版的代价看得出来。
// 判据是 CDP 的排版次数（确定，不随机器快慢变）；耗时只打出来作参考。
import type { TextFieldSchema } from '@xihan-ui/headless'
import type { App } from 'vue'
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { cdp } from 'vitest/browser'
import { createApp, h, nextTick, reactive } from 'vue'
import { XhTextFieldControl, XhTextFieldInput, XhTextFieldRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const FIELDS = 20
const ROUNDS = 10

let app: App | null = null

beforeAll(async () => {
  await cdp().send('Performance.enable')
})

afterEach(() => {
  app?.unmount()
  app = null
  document.body.replaceChildren()
})

async function metrics(): Promise<Record<string, number>> {
  const { metrics } = await cdp().send('Performance.getMetrics') as { metrics: { name: string, value: number }[] }
  return Object.fromEntries(metrics.map(item => [item.name, item.value]))
}

function frame(): Promise<void> {
  return new Promise(resolve => requestAnimationFrame(() => resolve()))
}

/** 一大片带样式的节点：排版与样式重算的代价随它涨。 */
function backdrop(): HTMLElement {
  const grid = document.createElement('div')
  grid.style.cssText = 'display: grid; grid-template-columns: repeat(20, 1fr); gap: 2px'
  for (let i = 0; i < 3000; i++) {
    const cell = document.createElement('div')
    cell.style.cssText = 'padding: 2px; border: 1px solid #ccc; font-size: 12px'
    cell.textContent = `节点 ${i}`
    grid.append(cell)
  }
  return grid
}

interface Panel {
  state: { name: string, values: string[] }
  textareas: HTMLTextAreaElement[]
}

/** 属性面板式的一栏多行框：每轮更新都给每个框新的 name，autoSize 每次渲染都是新对象。 */
async function mountFields(autoSize: () => TextFieldSchema['props']['autoSize']): Promise<Panel> {
  document.body.append(backdrop())
  const host = document.createElement('div')
  host.style.inlineSize = '320px'
  document.body.append(host)
  const state = reactive({
    name: 'field',
    values: Array.from({ length: FIELDS }, (_, index) => `第一行\n第二行 ${index}`),
  })
  app = createApp({
    setup: () => () => h('div', null, state.values.map((value, index) =>
      h(XhTextFieldRoot, { key: index, value, name: `${state.name}-${index}`, autoSize: autoSize() }, () => [
        h(XhTextFieldControl, null, () => [h(XhTextFieldInput, { as: 'textarea' })]),
      ]))),
  })
  app.mount(host)
  await nextTick()
  await frame()
  await frame()
  return { state, textareas: [...host.querySelectorAll('textarea')] }
}

describe('vue 多行文本框自动增高的量高次数', () => {
  // 没给 maxRows 时上限取样式表：每次暂还作者的上限读一下计算值再放回，每框一次样式计算、不排版；
  // 计算样式在这一来一回里变过，下一帧补排一次，不随框数涨
  it.for([
    { label: 'maxRows', maxLayouts: 0, autoSize: () => ({ maxRows: 6 }) },
    { label: 'true', maxLayouts: 1, autoSize: () => true },
  ])('值与配置都没变的更新不强制排版（autoSize=$label）：一轮更新 20 个多行框，10 轮', async ({ label, autoSize, maxLayouts }, { annotate }) => {
    const { state, textareas } = await mountFields(autoSize)
    const heights = textareas.map(el => el.style.blockSize)
    expect(textareas).toHaveLength(FIELDS)
    expect(heights.every(height => height.endsWith('px'))).toBe(true)
    const before = await metrics()
    const start = performance.now()
    for (let round = 0; round < ROUNDS; round++) {
      state.name = `field-${round}`
      await nextTick()
    }
    const elapsed = performance.now() - start
    const after = await metrics()
    const layouts = after.LayoutCount! - before.LayoutCount!
    const recalcs = after.RecalcStyleCount! - before.RecalcStyleCount!
    await annotate(`BENCH autosize-noop vue autoSize=${label} layouts=${layouts} recalcs=${recalcs} ms=${elapsed.toFixed(1)} layoutMs=${((after.LayoutDuration! - before.LayoutDuration!) * 1000).toFixed(1)} styleMs=${((after.RecalcStyleDuration! - before.RecalcStyleDuration!) * 1000).toFixed(1)}`)
    expect(textareas[0]!.name).toBe(`field-${ROUNDS - 1}-0`)
    expect(textareas.map(el => el.style.blockSize)).toEqual(heights)
    expect(layouts).toBeLessThanOrEqual(maxLayouts)
  })

  it('值变了照样重新量高：加一行，高度跟着长', async () => {
    const { state, textareas } = await mountFields(() => ({ maxRows: 6 }))
    const height = Number.parseFloat(textareas[0]!.style.blockSize)
    state.values[0] = `${state.values[0]}\n第三行`
    await nextTick()
    expect(Number.parseFloat(textareas[0]!.style.blockSize)).toBeGreaterThan(height)
  })

  it('值变了量一次：每个框只排版一次，不读写交替', async ({ annotate }) => {
    const { state } = await mountFields(() => ({ maxRows: 6 }))
    const before = await metrics()
    const start = performance.now()
    state.values = state.values.map(value => `${value}\n再加一行`)
    await nextTick()
    const elapsed = performance.now() - start
    const after = await metrics()
    const layouts = after.LayoutCount! - before.LayoutCount!
    await annotate(`BENCH autosize-change vue layouts=${layouts} recalcs=${after.RecalcStyleCount! - before.RecalcStyleCount!} ms=${elapsed.toFixed(1)}`)
    // 等更新、取指标时可能赶上一帧，帧里把写下的高度排一次
    expect(layouts).toBeLessThanOrEqual(FIELDS + 1)
  })
})
