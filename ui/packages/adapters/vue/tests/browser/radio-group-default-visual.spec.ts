import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
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

  const FAMILY = {
    'data-xh-action-control': '',
    'data-xh-action-profile': 'row',
    'data-xh-action-variant': 'ghost',
    'data-xh-action-display': 'always',
    'data-xh-action-size': 'xs',
  }

  /** 静态夹具的条目补上连接层投影的五个家族属性。 */
  function project(items: HTMLElement[]): void {
    for (const item of items) {
      for (const [name, value] of Object.entries(FAMILY))
        item.setAttribute(name, value)
    }
  }

  it('整行接 row 档：悬停行面 100 + 圆圈描边升档，按下行面 200 + 圆圈 300 不缩放；xs 是 24px 命中地板', async () => {
    const { root, items, indicators } = mount()
    project(items)
    const idle = indicators[1]!
    const restBorder = getComputedStyle(idle).borderTopColor
    const restBg = getComputedStyle(idle).backgroundColor
    const size = idle.getBoundingClientRect()
    expect(items[1]!.getBoundingClientRect().height).toBe(24)
    expect(getComputedStyle(items[1]!).backgroundColor).toBe('rgba(0, 0, 0, 0)')

    await userEvent.hover(items[1]!)
    // 行自己坐画布：hover 100；圆圈只升描边，底不动
    expect(getComputedStyle(items[1]!).backgroundColor).toBe(resolveColor('--xh-bg-subtle', root))
    expect(getComputedStyle(idle).borderTopColor).toBe(resolveColor('--xh-border-control-hover', root))
    expect(getComputedStyle(idle).borderTopColor).not.toBe(restBorder)
    expect(getComputedStyle(idle).backgroundColor).toBe(restBg)
    await pressPointer(items[1]!)
    expect(items[1]!.matches(':active')).toBe(true)
    // 行按下 200，坐在行面上的圆圈读宿主 host 槽到 300；两者都不缩放
    expect(getComputedStyle(items[1]!).backgroundColor).toBe(resolveColor('--xh-bg-subtle-hover', root))
    expect(getComputedStyle(idle).backgroundColor).toBe(resolveColor('--xh-bg-subtle-active', root))
    expect(getComputedStyle(idle).scale).toBe('none')
    expect(getComputedStyle(items[1]!).scale).toBe('none')
    expect(idle.getBoundingClientRect().width).toBe(size.width)
  })

  it('选中圈保住品牌描边，按下圆圈 300、圆点换到 active 档', async () => {
    const { root, items, indicators } = mount()
    project(items)
    const checked = indicators[0]!
    const checkedBorder = getComputedStyle(checked).borderTopColor
    expect(checkedBorder).toBe(resolveColor('--xh-bg-brand', root))
    expect(getComputedStyle(checked, '::before').backgroundColor).toBe(resolveColor('--xh-bg-brand', root))
    await userEvent.hover(items[0]!)
    expect(getComputedStyle(checked).borderTopColor).toBe(checkedBorder)
    await pressPointer(items[0]!)
    expect(getComputedStyle(checked).backgroundColor).toBe(resolveColor('--xh-bg-subtle-active', root))
    expect(getComputedStyle(checked).borderTopColor).toBe(checkedBorder)
    expect(getComputedStyle(checked, '::before').backgroundColor).toBe(resolveColor('--xh-bg-brand-active', root))
  })

  it('只读：整行不换面、手型 default，圆圈描边不升档、底不换', async () => {
    const { items, indicators } = mount(' data-readonly=')
    project(items)
    for (const item of items)
      item.setAttribute('data-readonly', '')
    const idle = indicators[1]!
    const restBorder = getComputedStyle(idle).borderTopColor
    await userEvent.hover(items[1]!)
    expect(getComputedStyle(items[1]!).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(getComputedStyle(items[1]!).cursor).toBe('default')
    expect(getComputedStyle(idle).borderTopColor).toBe(restBorder)
    await pressPointer(items[1]!)
    expect(getComputedStyle(items[1]!).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(getComputedStyle(idle).backgroundColor).toBe('rgba(0, 0, 0, 0)')
  })

  it('禁用：圆圈 border-default + bg-subtle、圆点 fg-disabled，整行 not-allowed 且不换面', async () => {
    const { root, items, indicators } = mount(' data-disabled=')
    project(items)
    for (const item of items)
      item.setAttribute('data-disabled', '')
    const [checked, idle] = indicators as [HTMLElement, HTMLElement]
    expect(getComputedStyle(idle).borderTopColor).toBe(resolveColor('--xh-border-default', root))
    expect(getComputedStyle(idle).backgroundColor).toBe(resolveColor('--xh-bg-subtle', root))
    expect(getComputedStyle(checked, '::before').backgroundColor).toBe(resolveColor('--xh-fg-disabled', root))
    expect(getComputedStyle(items[1]!).cursor).toBe('not-allowed')
    await userEvent.hover(items[1]!)
    expect(getComputedStyle(items[1]!).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    await pressPointer(items[1]!)
    expect(getComputedStyle(idle).backgroundColor).toBe(resolveColor('--xh-bg-subtle', root))
  })
})
