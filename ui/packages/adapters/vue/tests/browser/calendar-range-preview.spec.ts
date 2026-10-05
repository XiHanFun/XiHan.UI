// 区间日历挑到一半的预览：还没落定的那一段不能与已选中的区间同一副长相（品牌淡底专属选中 / 当前），
// 预览铺中性淡底；落定那一下轨道从中性淡底淡变到品牌淡底。计算样式与伪元素上的过渡只有真实浏览器量得出。
import { afterEach, describe, expect, it } from 'vitest'
import { cdp } from 'vitest/browser'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

afterEach(async () => {
  await cdp().send('Emulation.setEmulatedMedia', { media: '', features: [] })
  host?.remove()
  host = null
})

/** 一行三格：起点、中段、终点，都落在区间里；preview 为真时整段处在挑到一半的预览里。 */
function mountRow(preview: boolean): HTMLElement[] {
  host = document.createElement('div')
  const flag = preview ? ' data-range-preview' : ''
  const cell = (edge: string): string =>
    `<div data-scope="calendar-range-picker" class="xh-scope-calendar-range-picker" data-part="cell" data-in-range${flag}${edge}>
      <button data-scope="calendar-range-picker" class="xh-scope-calendar-range-picker" data-part="cell-trigger" data-in-range${flag}${edge}>1</button>
    </div>`
  host.innerHTML = `
    <div data-scope="calendar-range-picker" class="xh-scope-calendar-range-picker" data-part="root">
      <div data-scope="calendar-range-picker" class="xh-scope-calendar-range-picker" data-part="grid" data-view="day">
        <div data-scope="calendar-range-picker" class="xh-scope-calendar-range-picker" data-part="week-row">
          ${cell(' data-range-start')}${cell('')}${cell(' data-range-end')}
        </div>
      </div>
    </div>`
  document.body.append(host)
  return [...host.querySelectorAll<HTMLElement>('[data-part="cell"]')]
}

function resolved(token: string): string {
  const probe = document.createElement('span')
  probe.style.setProperty('background-color', `var(${token})`)
  host!.append(probe)
  const value = getComputedStyle(probe).backgroundColor
  probe.remove()
  return value
}

function trackBg(cell: HTMLElement): string {
  return getComputedStyle(cell, '::before').backgroundColor
}

describe('calendar-range-picker 区间预览', () => {
  it('挑到一半的预览铺中性淡底，已落定的区间才铺品牌淡底', () => {
    const [, middle] = mountRow(true)
    const preview = trackBg(middle!)
    expect(preview).toBe(resolved('--xh-bg-subtle'))
    expect(preview).not.toBe(resolved('--xh-bg-brand-subtle'))
    host!.remove()

    const [, committed] = mountRow(false)
    expect(trackBg(committed!)).toBe(resolved('--xh-bg-brand-subtle'))
  })

  it('落定那一下轨道按 micro 从中性淡底淡变到品牌淡底', () => {
    const cells = mountRow(true)
    const middle = cells[1]!
    void trackBg(middle)
    for (const el of host!.querySelectorAll('[data-range-preview]'))
      el.removeAttribute('data-range-preview')
    void trackBg(middle)
    const transition = middle.getAnimations({ subtree: true })
      .find(animation => animation instanceof CSSTransition && animation.transitionProperty === 'background-color')
    const micro = Number.parseFloat(getComputedStyle(host!).getPropertyValue('--xh-motion-duration-micro'))
    expect(transition).toBeDefined()
    expect(Number(transition!.effect?.getComputedTiming().duration)).toBe(micro)
  })

  it('强制色下底色被抹平，预览那一段在轨道上下沿画虚线，落定的区间不画', async () => {
    await cdp().send('Emulation.setEmulatedMedia', { media: '', features: [{ name: 'forced-colors', value: 'active' }] })
    const [, preview] = mountRow(true)
    expect(getComputedStyle(preview!, '::before').borderTopStyle).toBe('dashed')
    expect(getComputedStyle(preview!, '::before').borderBottomStyle).toBe('dashed')
    host!.remove()

    const [, committed] = mountRow(false)
    expect(getComputedStyle(committed!, '::before').borderTopStyle).toBe('none')
  })
})
