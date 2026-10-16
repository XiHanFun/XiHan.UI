// 危险色文字（字段错误文案等）在所有表面底色上都要达到 WCAG AA 正文的 4.5:1：浅色、深色、两档高对比各算一遍。
// 底色按真实渲染从元素一路往上把半透明的表面叠出来，文字色与底色都经 canvas 读回 sRGB，再算对比度。
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

const ctx = (() => {
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  return canvas.getContext('2d', { willReadFrequently: true })!
})()

/** 任意 CSS 颜色读成 sRGB 0–255 加 alpha 0–1。 */
function rgba(color: string): [number, number, number, number] {
  ctx.clearRect(0, 0, 1, 1)
  ctx.fillStyle = '#000'
  ctx.fillStyle = color
  ctx.fillRect(0, 0, 1, 1)
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data
  return [r!, g!, b!, a! / 255]
}

/** 从元素往上把各层背景叠起来：浏览器按 sRGB 编码值做 alpha 混合。 */
function effectiveBackground(el: Element): [number, number, number] {
  const layers: [number, number, number, number][] = []
  for (let node: Element | null = el; node; node = node.parentElement) {
    const bg = rgba(getComputedStyle(node).backgroundColor)
    if (bg[3] > 0)
      layers.push(bg)
    if (bg[3] >= 1)
      break
  }
  let out: [number, number, number] = [255, 255, 255]
  for (const [r, g, b, a] of layers.reverse())
    out = [r * a + out[0] * (1 - a), g * a + out[1] * (1 - a), b * a + out[2] * (1 - a)]
  return out
}

function luminance([r, g, b]: [number, number, number]): number {
  const lin = (c: number) => {
    const s = c / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

function ratio(fg: [number, number, number], bg: [number, number, number]): number {
  const a = luminance(fg)
  const b = luminance(bg)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}

/** 一块表面：style 给底色，里面放一行危险色文字与一行悬停色文字。 */
function surface(name: string, background: string, inner = ''): string {
  return `<div data-surface="${name}" style="background: ${background}; padding: 4px">
    <span data-text="danger" style="color: var(--xh-fg-danger)">错误</span>
    <span data-text="danger-hover" style="color: var(--xh-fg-danger-hover)">悬停</span>${inner}
  </div>`
}

const SURFACES = [
  surface('canvas', 'var(--xh-bg-canvas)'),
  surface('surface', 'var(--xh-bg-surface)'),
  surface('surface-raised', 'var(--xh-bg-surface-raised)'),
  surface('subtle', 'var(--xh-bg-subtle)'),
  surface('muted', 'var(--xh-bg-muted)'),
  surface('field', 'var(--xh-bg-field)'),
  `<div style="background: var(--xh-bg-surface)">${`<div style="background: var(--xh-bg-subtle)">${surface('muted 叠在 subtle 上', 'var(--xh-bg-muted)')}</div>`}</div>`,
].join('')

const FIELD_IN_COLLAPSIBLE = `
  <xh-collapsible default-open>
    <div data-xh-part="root">
      <button data-xh-part="trigger">分组<span data-xh-part="indicator"></span></button>
      <div data-xh-part="content" data-surface="折叠面板内容区">
        <xh-field invalid>
          <div data-xh-part="root">
            <label data-xh-part="label">部门</label>
            <input data-xh-part="control">
            <p data-xh-part="error-text" data-text="field-error">必填</p>
          </div>
        </xh-field>
      </div>
    </div>
  </xh-collapsible>`

const MODES: ReadonlyArray<readonly [label: string, attrs: string]> = [
  ['浅色', 'data-theme="light"'],
  ['深色', 'data-theme="dark"'],
  ['浅色 · 高对比', 'data-theme="light" data-contrast="more"'],
  ['深色 · 高对比', 'data-theme="dark" data-contrast="more"'],
]

describe('危险色文字在各表面上的对比度', () => {
  it.each(MODES)('%s：每块表面上的错误文案与悬停色都 ≥ 4.5:1', async (_label, attrs) => {
    host = document.createElement('div')
    host.innerHTML = `<div ${attrs} style="background: var(--xh-bg-canvas); padding: 8px">${SURFACES}${FIELD_IN_COLLAPSIBLE}</div>`
    document.body.append(host)
    await new Promise(resolve => requestAnimationFrame(resolve))
    await new Promise(resolve => requestAnimationFrame(resolve))

    const failures: string[] = []
    const texts = [...host.querySelectorAll('[data-text]')]
    expect(texts.length).toBeGreaterThan(10)
    for (const text of texts) {
      const fg = rgba(getComputedStyle(text).color)
      const bg = effectiveBackground(text)
      const r = ratio([fg[0], fg[1], fg[2]], bg)
      if (r < 4.5) {
        const where = text.closest('[data-surface]')?.getAttribute('data-surface') ?? '?'
        failures.push(`${where} / ${text.getAttribute('data-text')}：${r.toFixed(2)}`)
      }
    }
    expect(failures).toEqual([])
  })
})
