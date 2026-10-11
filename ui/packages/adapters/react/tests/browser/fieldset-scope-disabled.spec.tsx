// 字段集整组禁用压进子树：组内组件库的控件各自拿到 disabled，行为与禁用面一起到位；legend 里的开关不受本组禁用。
// 原生 fieldset[disabled] 够不着滑块拇指这类 div，也够不着各家族认的 data-disabled，只有真实浏览器看得出。
import type { Root } from 'react-dom/client'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import {
  XhButton,
  XhCheckbox,
  XhFieldsetLegend,
  XhFieldsetRoot,
  XhSliderControl,
  XhSliderRoot,
  XhSliderThumb,
  XhSliderTrack,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldRoot,
} from '../../src'
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
  for (let count = 0; count < 3; count++) {
    await act(async () => {
      await Promise.resolve()
    })
  }
  await new Promise(resolve => requestAnimationFrame(resolve))
}

async function render(disabled: boolean): Promise<void> {
  host ??= document.body.appendChild(document.createElement('div'))
  root ??= createRoot(host)
  act(() => root!.render(
    <XhFieldsetRoot disabled={disabled}>
      <XhFieldsetLegend><XhCheckbox data-test="legend-toggle">启用这一组</XhCheckbox></XhFieldsetLegend>
      <XhTextFieldRoot aria-label="公司名称"><XhTextFieldControl><XhTextFieldInput /></XhTextFieldControl></XhTextFieldRoot>
      <XhCheckbox data-test="inner-check">自动续费</XhCheckbox>
      <XhSliderRoot defaultValue={[40]} aria-label="音量">
        <XhSliderControl>
          <XhSliderTrack />
          <XhSliderThumb />
        </XhSliderControl>
      </XhSliderRoot>
      <XhButton>保存</XhButton>
    </XhFieldsetRoot>,
  ))
  await settle()
}

function scoped(scope: string, part: string): HTMLElement {
  const el = host!.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='${part}']`)
  if (!el)
    throw new Error(`找不到 ${scope}/${part}`)
  return el
}

describe('字段集整组禁用（React）', () => {
  it('组内控件投影禁用，滑块拇指抽掉 Tab 位、方向键改不了值；legend 里的开关不受影响', async () => {
    await render(true)
    expect(scoped('text-field', 'control').hasAttribute('data-disabled')).toBe(true)
    expect(scoped('button', 'root').hasAttribute('data-disabled')).toBe(true)
    expect(host!.querySelector(`[data-test='inner-check']`)!.hasAttribute('data-disabled')).toBe(true)
    expect(host!.querySelector(`[data-test='legend-toggle']`)!.hasAttribute('data-disabled')).toBe(false)
    const thumb = scoped('slider', 'thumb')
    expect(thumb.hasAttribute('tabindex')).toBe(false)
    thumb.focus()
    await userEvent.keyboard('{ArrowRight}')
    await settle()
    expect(thumb.getAttribute('aria-valuenow')).toBe('40')
  })

  it('整组解禁后组内控件一并恢复', async () => {
    await render(true)
    await render(false)
    expect(scoped('text-field', 'control').hasAttribute('data-disabled')).toBe(false)
    expect(scoped('button', 'root').hasAttribute('data-disabled')).toBe(false)
    expect(scoped('slider', 'thumb').getAttribute('tabindex')).toBe('0')
  })
})
