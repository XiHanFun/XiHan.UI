// 字段集整组禁用压进子树：xh-fieldset 是作用域，组内组件库的控件经配置解析拿到 disabled，
// 行为与禁用面一起到位；legend 里的节点不吃本组这一层（原生语义）。整组解禁时子树重新接线一并恢复。
// 原生 fieldset[disabled] 够不着滑块拇指这类 div，也够不着各家族认的 data-disabled，只有真实浏览器看得出。
import type { XhFieldsetElement } from '../../src/elements/fieldset'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

async function settle(): Promise<void> {
  await Promise.resolve()
  await new Promise(resolve => requestAnimationFrame(resolve))
  await new Promise(resolve => requestAnimationFrame(resolve))
  await Promise.resolve()
}

async function mount(): Promise<XhFieldsetElement> {
  host = document.createElement('div')
  host.innerHTML = `
    <xh-fieldset disabled>
      <fieldset data-xh-part="root" style="inline-size: 420px">
        <legend data-xh-part="legend">
          <xh-checkbox id="legend-toggle">
            <label data-xh-part="label">
              <button data-xh-part="root"><span data-xh-part="indicator"></span></button>
              <span data-xh-part="text">启用这一组</span>
            </label>
          </xh-checkbox>
        </legend>
        <xh-text-field aria-label="公司名称">
          <div data-xh-part="root"><div data-xh-part="control"><input data-xh-part="input" /></div></div>
        </xh-text-field>
        <xh-checkbox id="inner-check">
          <label data-xh-part="label">
            <button data-xh-part="root"><span data-xh-part="indicator"></span></button>
            <span data-xh-part="text">自动续费</span>
          </label>
        </xh-checkbox>
        <xh-slider id="volume" default-value="40" min="0" max="100" step="1">
          <div data-xh-part="root">
            <div data-xh-part="control">
              <div data-xh-part="track"><div data-xh-part="range"></div></div>
              <div data-xh-part="thumb" aria-label="音量"></div>
            </div>
          </div>
        </xh-slider>
        <xh-button><button data-xh-part="root">保存</button></xh-button>
      </fieldset>
    </xh-fieldset>`
  document.body.append(host)
  await settle()
  return host.querySelector<XhFieldsetElement>('xh-fieldset')!
}

function scoped(scope: string, part: string, within: ParentNode = host!): HTMLElement {
  const el = within.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='${part}']`)
  if (!el)
    throw new Error(`找不到 ${scope}/${part}`)
  return el
}

describe('xh-fieldset 整组禁用', () => {
  it('组内组件库的控件都投影禁用；legend 里的开关不受本组禁用', async () => {
    await mount()
    expect(scoped('text-field', 'control').hasAttribute('data-disabled')).toBe(true)
    expect(scoped('slider', 'root').hasAttribute('data-disabled')).toBe(true)
    expect(scoped('button', 'root').hasAttribute('data-disabled')).toBe(true)
    expect(scoped('checkbox', 'root', host!.querySelector('#inner-check')!).hasAttribute('data-disabled')).toBe(true)
    expect(scoped('checkbox', 'root', host!.querySelector('#legend-toggle')!).hasAttribute('data-disabled')).toBe(false)
  })

  it('滑块拇指同样禁用：抽掉 Tab 位，方向键改不了值', async () => {
    await mount()
    const thumb = scoped('slider', 'thumb')
    expect(thumb.getAttribute('aria-disabled')).toBe('true')
    expect(thumb.hasAttribute('tabindex')).toBe(false)
    expect(thumb.getAttribute('aria-valuenow')).toBe('40')
    thumb.focus()
    await userEvent.keyboard('{ArrowRight}')
    await settle()
    expect(thumb.getAttribute('aria-valuenow')).toBe('40')
  })

  it('整组解禁后子树重新接线，组内控件一并恢复', async () => {
    const fieldset = await mount()
    fieldset.disabled = false
    await settle()
    expect(scoped('text-field', 'control').hasAttribute('data-disabled')).toBe(false)
    expect(scoped('button', 'root').hasAttribute('data-disabled')).toBe(false)
    expect(scoped('slider', 'thumb').getAttribute('tabindex')).toBe('0')
  })
})
