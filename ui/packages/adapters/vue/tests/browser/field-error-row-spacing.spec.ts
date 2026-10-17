// 错误文案收起时照样占住辅助行：表单里的字段无效与否，字段高度与相邻两项的间距都不变，控件到下一项之间至少隔着那一行。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import { XhFieldControl, XhFieldErrorText, XhFieldLabel, XhFieldRoot, XhFormRoot } from '../../src'
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

async function settle(): Promise<void> {
  await nextTick()
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
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

describe('字段错误文案的辅助行', () => {
  it('收起与显示两种状态下，字段高度与项距都不变，控件与下一项之间留着辅助行', async () => {
    const invalid = ref(false)
    host = document.createElement('div')
    host.style.inlineSize = '320px'
    document.body.append(host)
    const field = (bad: boolean) => h(XhFieldRoot, { invalid: bad }, () => [
      h(XhFieldLabel, () => '姓名'),
      h(XhFieldControl, () => h('input')),
      h(XhFieldErrorText, () => '必填'),
    ])
    app = createApp({ render: () => h(XhFormRoot, null, () => [field(invalid.value), field(false)]) })
    app.mount(host)
    await settle()

    const collapsed = measure()
    invalid.value = true
    await settle()
    const shown = measure()

    expect(Math.abs(shown.height - collapsed.height)).toBeLessThan(0.5)
    expect(Math.abs(shown.step - collapsed.step)).toBeLessThan(0.5)
    expect(collapsed.gap).toBeGreaterThanOrEqual(px('--xh-space-5') - 0.5)
  })
})
