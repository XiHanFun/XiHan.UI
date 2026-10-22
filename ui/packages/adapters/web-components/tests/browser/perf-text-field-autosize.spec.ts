// 多行文本框自动增高：值、占位符、autoSize 配置与排字样式都没变的更新不重新量高，不强制排版；
// 值变了才量，量的时候一次排版读完，不读写交替。页面里先铺一大片节点，让每次强制排版的代价看得出来。
// 判据是 CDP 的排版次数（确定，不随机器快慢变）；耗时只打出来作参考。
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { cdp } from 'vitest/browser'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

interface TextFieldElement extends HTMLElement {
  value?: string
  name?: string
  multiline?: boolean
  autoSize?: boolean | { minRows?: number, maxRows?: number }
  updateComplete: Promise<boolean>
}

const FIELDS = 20
const ROUNDS = 10

beforeAll(async () => {
  await cdp().send('Performance.enable')
})

afterEach(() => {
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

async function mountFields(autoSize: TextFieldElement['autoSize'] = { maxRows: 6 }): Promise<TextFieldElement[]> {
  document.body.append(backdrop())
  const panel = document.createElement('div')
  panel.style.inlineSize = '320px'
  const fields = Array.from({ length: FIELDS }, (_, index) => {
    const el = document.createElement('xh-text-field') as TextFieldElement
    el.multiline = true
    el.autoSize = autoSize
    el.setAttribute('label', `说明 ${index}`)
    el.value = `第一行\n第二行 ${index}`
    panel.append(el)
    return el
  })
  document.body.append(panel)
  await Promise.all(fields.map(el => el.updateComplete))
  await frame()
  await frame()
  return fields
}

function textarea(el: HTMLElement): HTMLTextAreaElement {
  return el.querySelector('textarea')!
}

describe('wc 多行文本框自动增高的量高次数', () => {
  // 没给 maxRows 时上限取样式表：每次暂还作者的上限读一下计算值再放回，每框一次样式计算、不排版；
  // 计算样式在这一来一回里变过，下一帧补排一次，不随框数涨
  it.for([
    { label: 'maxRows', maxLayouts: 0, autoSize: { maxRows: 6 } },
    { label: 'true', maxLayouts: 1, autoSize: true },
  ])('值与配置都没变的更新不强制排版（autoSize=$label）：一轮更新 20 个多行框，10 轮', async ({ label, autoSize, maxLayouts }, { annotate }) => {
    const fields = await mountFields(autoSize)
    const heights = fields.map(el => textarea(el).style.blockSize)
    expect(heights.every(height => height.endsWith('px'))).toBe(true)
    const before = await metrics()
    const start = performance.now()
    for (let round = 0; round < ROUNDS; round++) {
      for (const el of fields)
        el.name = `field-${round}`
      await Promise.all(fields.map(el => el.updateComplete))
    }
    const elapsed = performance.now() - start
    const after = await metrics()
    const layouts = after.LayoutCount! - before.LayoutCount!
    const recalcs = after.RecalcStyleCount! - before.RecalcStyleCount!
    await annotate(`BENCH autosize-noop wc autoSize=${label} layouts=${layouts} recalcs=${recalcs} ms=${elapsed.toFixed(1)} layoutMs=${((after.LayoutDuration! - before.LayoutDuration!) * 1000).toFixed(1)} styleMs=${((after.RecalcStyleDuration! - before.RecalcStyleDuration!) * 1000).toFixed(1)}`)
    expect(textarea(fields[0]!).name).toBe(`field-${ROUNDS - 1}`)
    expect(fields.map(el => textarea(el).style.blockSize)).toEqual(heights)
    expect(layouts).toBeLessThanOrEqual(maxLayouts)
  })

  it('值变了照样重新量高：加一行，高度跟着长', async () => {
    const fields = await mountFields()
    const el = fields[0]!
    const height = Number.parseFloat(textarea(el).style.blockSize)
    el.value = `${el.value}\n第三行`
    await el.updateComplete
    expect(Number.parseFloat(textarea(el).style.blockSize)).toBeGreaterThan(height)
  })

  it('值变了量一次：每个框只排版一次，不读写交替', async ({ annotate }) => {
    const fields = await mountFields()
    const before = await metrics()
    const start = performance.now()
    for (const el of fields)
      el.value = `${el.value}\n再加一行`
    await Promise.all(fields.map(el => el.updateComplete))
    const elapsed = performance.now() - start
    const after = await metrics()
    const layouts = after.LayoutCount! - before.LayoutCount!
    await annotate(`BENCH autosize-change wc layouts=${layouts} recalcs=${after.RecalcStyleCount! - before.RecalcStyleCount!} ms=${elapsed.toFixed(1)}`)
    // 等更新、取指标时可能赶上一帧，帧里把写下的高度排一次
    expect(layouts).toBeLessThanOrEqual(FIELDS + 1)
  })
})
