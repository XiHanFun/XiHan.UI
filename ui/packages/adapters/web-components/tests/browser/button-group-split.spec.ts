// 分体按钮：按钮组里一枚主按钮后接一个菜单，菜单的触发器是一枚按钮。两段连成一条：圆角只在外侧、相接处一条分隔线，
// 下拉钮跟着组的形态与尺寸，主题调了按压缩放时两段都不缩放。圆角与级联只在 Chromium 里可信。
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
  document.documentElement.style.removeProperty('--xh-motion-scale-press')
})

async function mount(variant: string): Promise<HTMLElement> {
  host = document.createElement('div')
  host.innerHTML = `
    <xh-button-group variant="${variant}" size="sm">
      <div data-xh-part="root">
        <xh-button><button data-xh-part="root">保存</button></xh-button>
        <xh-menu placement="bottom-end">
          <xh-button data-xh-part="trigger" icon-only><button data-xh-part="root" aria-label="更多保存方式">▾</button></xh-button>
          <div data-xh-part="positioner"><div data-xh-part="content"><div data-xh-part="item" value="save-as">另存为</div></div></div>
        </xh-menu>
      </div>
    </xh-button-group>`
  document.body.append(host)
  for (let i = 0; i < 3; i++)
    await new Promise(resolve => requestAnimationFrame(resolve))
  return host
}

function radii(el: HTMLElement): string[] {
  const cs = getComputedStyle(el)
  return [cs.borderStartStartRadius, cs.borderStartEndRadius, cs.borderEndEndRadius, cs.borderEndStartRadius]
}

describe('分体按钮', () => {
  it.each(['solid', 'subtle', 'outline'])('%s：两段连成一条，圆角只在外侧，相接处一条分隔线，下拉钮跟着组的形态与尺寸', async (variant) => {
    const box = await mount(variant)
    const [main, trigger] = [...box.querySelectorAll<HTMLElement>('[data-scope="button"][data-part="root"]')]
    expect(radii(main!).map(value => value === '0px')).toEqual([false, true, true, false])
    expect(radii(trigger!).map(value => value === '0px')).toEqual([true, false, false, true])
    expect(Math.round(trigger!.getBoundingClientRect().left)).toBe(Math.round(main!.getBoundingClientRect().right))
    expect(trigger!.getBoundingClientRect().height).toBe(main!.getBoundingClientRect().height)
    expect([trigger!.getAttribute('data-xh-action-variant'), trigger!.getAttribute('data-xh-action-size')]).toEqual([variant, 'sm'])
    const separator = box.querySelector<HTMLElement>('[data-xh-button-group-separator]')!
    expect(separator.nextElementSibling?.localName).toBe('xh-menu')
    expect(separator.getBoundingClientRect().width).toBeGreaterThan(0)
  })

  it('outline：下拉钮不再自己画一圈描边，外框由组统一画', async () => {
    const box = await mount('outline')
    const trigger = box.querySelector<HTMLElement>('[aria-label="更多保存方式"]')!
    expect(getComputedStyle(trigger).borderTopColor).toBe('rgba(0, 0, 0, 0)')
  })

  it('主题调了按压缩放：按下主按钮或下拉钮都不缩放，接缝不被撕开', async () => {
    document.documentElement.style.setProperty('--xh-motion-scale-press', '0.96')
    const box = await mount('outline')
    for (const el of box.querySelectorAll<HTMLElement>('[data-scope="button"][data-part="root"]')) {
      el.setAttribute('data-pressed', '')
      expect(getComputedStyle(el).scale, el.textContent ?? '').toBe('none')
      el.removeAttribute('data-pressed')
    }
  })
})
