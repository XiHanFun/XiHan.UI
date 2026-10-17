// 表达式输入框的镜像层与输入框逐字对齐（Vue）：问题区间那一段落在输入框里对应的字上。
// 判据全集在 Web Components 的同名用例里；这里核 Vue 的部件引用与镜像层效应接在同一结果上。
import type { ExpressionCheck } from '@xihan-ui/core'
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhExpressionInputRoot } from '../../src'
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

const checkAmont: ExpressionCheck = source => [...source.matchAll(/amont/g)].map(match => ({ start: match.index, end: match.index + 5, message: 'unknown' }))

async function frames(n = 2): Promise<void> {
  for (let i = 0; i < n; i++)
    await new Promise(resolve => requestAnimationFrame(resolve))
}

function part<T extends HTMLElement = HTMLElement>(name: string): T {
  return document.querySelector<T>(`[data-scope='expression-input'][data-part='${name}']`)!
}

function glyphLeft(input: HTMLInputElement, index: number): number {
  const style = getComputedStyle(input)
  const ctx = document.createElement('canvas').getContext('2d')!
  ctx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
  const rect = input.getBoundingClientRect()
  return rect.left + Number.parseFloat(style.borderLeftWidth) + Number.parseFloat(style.paddingLeft) + ctx.measureText(input.value.slice(0, index)).width - input.scrollLeft
}

describe('表达式输入框的镜像层（Vue）', () => {
  it('问题区间那一段落在输入框里对应的字上，镜像层不挡输入框', async () => {
    host = document.createElement('div')
    host.style.inlineSize = '320px'
    document.body.append(host)
    app = createApp({ render: () => h(XhExpressionInputRoot, { label: '公式', defaultValue: 'amount + amont', check: checkAmont }) })
    app.mount(host)
    await nextTick()
    await frames()
    const input = part<HTMLInputElement>('input')
    input.focus()
    input.blur()
    await nextTick()
    await frames()
    const mark = document.querySelector<HTMLElement>(`[data-scope='expression-input'][data-part='highlight-segment'][data-issue]`)!
    expect(mark.textContent).toBe('amont')
    expect(Math.abs(mark.getBoundingClientRect().left - glyphLeft(input, 9))).toBeLessThan(1.5)
    expect(getComputedStyle(part('highlight')).pointerEvents).toBe('none')
  })
})
