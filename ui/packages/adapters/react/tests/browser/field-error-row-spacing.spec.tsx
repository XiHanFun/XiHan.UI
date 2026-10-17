// 错误文案收起时照样占住辅助行：表单里的字段无效与否，字段高度与相邻两项的间距都不变，控件到下一项之间至少隔着那一行。
import type { Root } from 'react-dom/client'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { XhFieldControl, XhFieldErrorText, XhFieldLabel, XhFieldRoot, XhFormRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let root: Root | null = null
let host: HTMLElement | null = null

afterEach(() => {
  act(() => root?.unmount())
  host?.remove()
  root = null
  host = null
})

async function settle(): Promise<void> {
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
  const [first, second] = roots.map(el => el.getBoundingClientRect())
  return { height: first!.height, step: second!.top - first!.top, gap: second!.top - input.bottom }
}

function Field({ invalid }: { invalid: boolean }) {
  return (
    <XhFieldRoot invalid={invalid}>
      <XhFieldLabel>姓名</XhFieldLabel>
      <XhFieldControl><input /></XhFieldControl>
      <XhFieldErrorText>必填</XhFieldErrorText>
    </XhFieldRoot>
  )
}

async function render(invalid: boolean): Promise<void> {
  await act(async () => {
    root!.render(
      <XhFormRoot>
        <Field invalid={invalid} />
        <Field invalid={false} />
      </XhFormRoot>,
    )
  })
  await settle()
}

describe('字段错误文案的辅助行', () => {
  it('收起与显示两种状态下，字段高度与项距都不变，控件与下一项之间留着辅助行', async () => {
    host = document.createElement('div')
    host.style.inlineSize = '320px'
    document.body.append(host)
    root = createRoot(host)

    await render(false)
    const collapsed = measure()
    await render(true)
    const shown = measure()

    expect(Math.abs(shown.height - collapsed.height)).toBeLessThan(0.5)
    expect(Math.abs(shown.step - collapsed.step)).toBeLessThan(0.5)
    expect(collapsed.gap).toBeGreaterThanOrEqual(px('--xh-space-5') - 0.5)
  })
})
