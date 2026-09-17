import { userEvent } from '@vitest/browser/context'
import { afterEach, describe, expect, it } from 'vitest'
import { pressPointer, releasePointerAway } from './pointer-press'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

afterEach(async () => {
  // 按住途中断言完就在停靠点松开，下一用例的悬停从干净状态起
  await releasePointerAway()
  host?.remove()
  host = null
})

interface Fixture {
  root: HTMLElement
  label: HTMLElement
  items: HTMLElement[]
  indicators: HTMLElement[]
}

/** 静态夹具：标题 + 两条条目（首条选中），条目内是圆圈与文字。 */
function mount(attrs = ''): Fixture {
  host = document.createElement('div')
  host.innerHTML = `
    <div data-scope="radio-group" data-part="root" data-orientation="vertical"${attrs}>
      <span data-scope="radio-group" data-part="label">套餐</span>
      <div data-scope="radio-group" data-part="item">
        <span data-scope="radio-group" data-part="indicator" data-state="checked"></span>
        <span data-scope="radio-group" data-part="item-text">免费版</span>
      </div>
      <div data-scope="radio-group" data-part="item">
        <span data-scope="radio-group" data-part="indicator" data-state="unchecked"></span>
        <span data-scope="radio-group" data-part="item-text">专业版</span>
      </div>
    </div>`
  document.body.append(host)
  // 断言的是稳定态的颜色与几何，不是过渡中间帧
  host.style.setProperty('--xh-motion-duration-micro', '0ms')
  host.style.setProperty('--xh-motion-duration-press', '0ms')
  host.style.setProperty('--xh-motion-duration-release', '0ms')
  return {
    root: host.querySelector<HTMLElement>('[data-part="root"]')!,
    label: host.querySelector<HTMLElement>('[data-part="label"]')!,
    items: [...host.querySelectorAll<HTMLElement>('[data-part="item"]')],
    indicators: [...host.querySelectorAll<HTMLElement>('[data-part="indicator"]')],
  }
}

/** 语义色令牌在该元素上解到的颜色。 */
function resolveColor(token: string, scope: HTMLElement): string {
  const probe = document.createElement('span')
  probe.style.backgroundColor = `var(${token})`
  scope.append(probe)
  const value = getComputedStyle(probe).backgroundColor
  probe.remove()
  return value
}

/** 尺寸令牌在该元素上解到的像素值。 */
function resolvePx(token: string, scope: HTMLElement): number {
  const probe = document.createElement('div')
  probe.style.inlineSize = `var(${token})`
  scope.append(probe)
  const value = Number.parseFloat(getComputedStyle(probe).inlineSize)
  probe.remove()
  return value
}

describe('radio-group 默认视觉', () => {
  it('集合标题 14 / 500 / fg-muted，字号不随档；标题到集合与条目之间都是 space-2', () => {
    const { root, label, items } = mount(' data-size="lg"')
    const style = getComputedStyle(label)
    expect(Number.parseFloat(style.fontSize)).toBe(resolvePx('--xh-text-label-size', root))
    expect(style.fontWeight).toBe('500')
    expect(style.color).toBe(resolveColor('--xh-fg-muted', root))
    // lg 档的条目文字随档，标题不随
    expect(Number.parseFloat(getComputedStyle(items[0]!).fontSize)).toBe(resolvePx('--xh-control-font-lg', root))
    const gap = resolvePx('--xh-space-2', root)
    expect(items[0]!.getBoundingClientRect().top - label.getBoundingClientRect().bottom).toBeCloseTo(gap, 1)
    expect(items[1]!.getBoundingClientRect().top - items[0]!.getBoundingClientRect().bottom).toBeCloseTo(gap, 1)
  })

  it('整组禁用时标题落到 fg-subtle', () => {
    const { root, label } = mount(' data-disabled=""')
    expect(getComputedStyle(label).color).toBe(resolveColor('--xh-fg-subtle', root))
  })

  it('整行是命中区，回执落在圆圈上：悬停升描边、按下换到 200 档中性面，圆圈几何不动；选中圈保住品牌描边', async () => {
    const { root, items, indicators } = mount()
    const [checked, idle] = indicators as [HTMLElement, HTMLElement]
    const restBorder = getComputedStyle(idle).borderTopColor
    const size = idle.getBoundingClientRect()

    await userEvent.hover(items[1]!)
    expect(getComputedStyle(idle).borderTopColor).toBe(resolveColor('--xh-border-control-hover', root))
    expect(getComputedStyle(idle).borderTopColor).not.toBe(restBorder)
    await pressPointer(items[1]!)
    expect(items[1]!.matches(':active')).toBe(true)
    expect(getComputedStyle(idle).backgroundColor).toBe(resolveColor('--xh-bg-subtle-hover', root))
    expect(getComputedStyle(idle).scale).toBe('none')
    expect(getComputedStyle(items[1]!).scale).toBe('none')
    expect(idle.getBoundingClientRect().width).toBe(size.width)
    await releasePointerAway()

    const checkedBorder = getComputedStyle(checked).borderTopColor
    await userEvent.hover(items[0]!)
    expect(getComputedStyle(checked).borderTopColor).toBe(checkedBorder)
    await pressPointer(items[0]!)
    expect(getComputedStyle(checked).backgroundColor).toBe(resolveColor('--xh-bg-subtle-hover', root))
    expect(getComputedStyle(checked).borderTopColor).toBe(checkedBorder)
  })
})
