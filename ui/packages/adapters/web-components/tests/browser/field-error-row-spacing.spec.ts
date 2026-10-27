// 错误文案收起时照样占住辅助行：表单里的字段无效与否，字段高度与相邻两项的间距都不变，控件到下一项之间至少隔着那一行。
// 收起靠 hidden 属性：皮肤的占位规则认的是 [hidden]，内联 display 会把那一行一并压没。
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

afterEach(() => {
  document.body.innerHTML = ''
})

async function settle(): Promise<void> {
  for (let i = 0; i < 2; i++) {
    await Promise.resolve()
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  }
}

/** 一个语义尺寸令牌解出来的像素。 */
function px(token: string): number {
  const probe = document.createElement('div')
  probe.style.blockSize = `var(${token})`
  document.body.append(probe)
  const value = probe.getBoundingClientRect().height
  probe.remove()
  return value
}

function measure(): { height: number, step: number, gap: number } {
  const roots = [...document.querySelectorAll<HTMLElement>('[data-scope="field"][data-part="root"]')]
  const input = roots[0]!.querySelector('input')!.getBoundingClientRect()
  const [first, second] = roots.map(root => root.getBoundingClientRect())
  return { height: first!.height, step: second!.top - first!.top, gap: second!.top - input.bottom }
}

const FIELD = `
  <xh-field>
    <div data-xh-part="root">
      <label data-xh-part="label">姓名</label>
      <input data-xh-part="control">
      <p data-xh-part="error-text">必填</p>
    </div>
  </xh-field>`

describe('字段错误文案的辅助行', () => {
  it('收起与显示两种状态下，字段高度与项距都不变，控件与下一项之间留着辅助行', async () => {
    document.body.innerHTML = `<div style="inline-size: 320px"><xh-form><form data-xh-part="root">${FIELD}${FIELD}</form></xh-form></div>`
    await settle()
    const collapsed = measure()
    expect(document.querySelector('[data-scope="field"][data-part="error-text"]')!.hasAttribute('hidden')).toBe(true)

    document.querySelector('xh-field')!.setAttribute('invalid', '')
    await settle()
    const shown = measure()

    expect(Math.abs(shown.height - collapsed.height)).toBeLessThan(0.5)
    expect(Math.abs(shown.step - collapsed.step)).toBeLessThan(0.5)
    expect(collapsed.gap).toBeGreaterThanOrEqual(px('--xh-space-5') - 0.5)
  })

  it('宿主把带 hidden 的节点强制收成 display: none 时，辅助行照样留着', async () => {
    // Tailwind v4 的 preflight、VitePress 默认主题都带这一条：收起的错误文案生成不了盒，那一行由字段根自己留
    const reset = document.createElement('style')
    reset.textContent = '[hidden]:where(:not([hidden="until-found"])) { display: none !important; }'
    document.head.append(reset)
    try {
      document.body.innerHTML = `<div style="inline-size: 320px"><xh-form><form data-xh-part="root">${FIELD}${FIELD}</form></xh-form></div>`
      await settle()
      const collapsed = measure()
      expect(getComputedStyle(document.querySelector('[data-scope="field"][data-part="error-text"]')!).display).toBe('none')

      document.querySelector('xh-field')!.setAttribute('invalid', '')
      await settle()
      const shown = measure()

      expect(Math.abs(shown.height - collapsed.height)).toBeLessThan(0.5)
      expect(Math.abs(collapsed.gap - px('--xh-space-5'))).toBeLessThan(0.5)
    }
    finally {
      reset.remove()
    }
  })
})
