import { cdp, userEvent } from '@vitest/browser/context'
import { afterEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

afterEach(async () => {
  // 按住途中断言完就松开，指针停在空白处，下一用例的悬停从干净状态起
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 0, y: 0, button: 'left', buttons: 0, clickCount: 1 })
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 0, y: 0 })
  host?.remove()
  host = null
})

/** 令过渡即时完成：这里断言的是稳定态的颜色与几何，不是过渡中间帧。 */
function freezeMotion(): void {
  host!.style.setProperty('--xh-motion-duration-micro', '0ms')
  host!.style.setProperty('--xh-motion-duration-press', '0ms')
  host!.style.setProperty('--xh-motion-duration-release', '0ms')
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

async function press(element: HTMLElement): Promise<void> {
  const rect = element.getBoundingClientRect()
  await cdp().send('Input.dispatchMouseEvent', { type: 'mousePressed', x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, button: 'left', buttons: 1, clickCount: 1 })
}

function mount(variant?: 'card' | 'line' | 'segment'): { list: HTMLElement, active: HTMLElement, inactive: HTMLElement, indicator: HTMLElement } {
  host = document.createElement('div')
  host.innerHTML = `
    <div data-scope="tabs" data-part="root" data-orientation="horizontal"${variant ? ` data-variant="${variant}"` : ''}>
      <div data-scope="tabs" data-part="list">
        <button data-scope="tabs" data-part="trigger" data-state="active">概览</button>
        <button data-scope="tabs" data-part="trigger" data-state="inactive">分析</button>
        <span data-scope="tabs" data-part="indicator" data-orientation="horizontal" style="inset-inline-start:0;inline-size:40px"></span>
      </div>
    </div>`
  document.body.append(host)
  return {
    list: host.querySelector<HTMLElement>('[data-part="list"]')!,
    active: host.querySelector<HTMLElement>('[data-part="trigger"][data-state="active"]')!,
    inactive: host.querySelector<HTMLElement>('[data-part="trigger"][data-state="inactive"]')!,
    indicator: host.querySelector<HTMLElement>('[data-part="indicator"]')!,
  }
}

function paint(el: HTMLElement, property: string): string {
  return getComputedStyle(el).getPropertyValue(property)
}

/** 语义形状令牌在该元素上解到的像素值。 */
function shapePx(element: HTMLElement, token: string): number {
  const probe = document.createElement('div')
  probe.style.borderTopLeftRadius = `var(${token})`
  element.append(probe)
  const value = Number.parseFloat(getComputedStyle(probe).borderTopLeftRadius)
  probe.remove()
  return value
}

describe('tabs 默认视觉', () => {
  it('不写变体与显式 line 画成同一套：透明标签带，选中项只靠文字与指示条', () => {
    const plain = mount()
    const plainPaint = {
      listBackground: paint(plain.list, 'background-color'),
      listPadding: paint(plain.list, 'padding-inline-start'),
      activeBackground: paint(plain.active, 'background-color'),
      activeShadow: paint(plain.active, 'box-shadow'),
      activeColor: paint(plain.active, 'color'),
      indicatorDisplay: paint(plain.indicator, 'display'),
    }

    const line = mount('line')
    expect({
      listBackground: paint(line.list, 'background-color'),
      listPadding: paint(line.list, 'padding-inline-start'),
      activeBackground: paint(line.active, 'background-color'),
      activeShadow: paint(line.active, 'box-shadow'),
      activeColor: paint(line.active, 'color'),
      indicatorDisplay: paint(line.indicator, 'display'),
    }).toEqual(plainPaint)
    expect(plainPaint.listBackground).toBe('rgba(0, 0, 0, 0)')
    expect(Number.parseFloat(plainPaint.listPadding)).toBe(0)
    expect(plainPaint.activeBackground).toBe('rgba(0, 0, 0, 0)')
    expect(plainPaint.activeShadow).toBe('none')
    expect(plainPaint.activeColor).not.toBe(paint(plain.inactive, 'color'))
    expect(plainPaint.indicatorDisplay).not.toBe('none')
    expect(plain.active.offsetWidth).toBe(plain.inactive.offsetWidth)
  })

  it('segment 使用浅色标签带承载浮起的选中面，并收掉指示条', () => {
    const segment = mount('segment')
    const segmentPaint = {
      listBackground: paint(segment.list, 'background-color'),
      listPadding: paint(segment.list, 'padding-inline-start'),
      activeBackground: paint(segment.active, 'background-color'),
      activeShadow: paint(segment.active, 'box-shadow'),
    }
    expect(segmentPaint.listBackground).not.toBe('rgba(0, 0, 0, 0)')
    expect(Number.parseFloat(segmentPaint.listPadding)).toBeGreaterThan(0)
    expect(segmentPaint.activeBackground).not.toBe('rgba(0, 0, 0, 0)')
    expect(segmentPaint.activeShadow).not.toBe('none')
    expect(paint(segment.indicator, 'display')).toBe('none')
    // 标签带是 surface 面，标签本体是 control；内层圆角不超过外层圆角减去衬距
    const listRadius = Number.parseFloat(getComputedStyle(segment.list).borderRadius)
    const triggerRadius = Number.parseFloat(getComputedStyle(segment.active).borderRadius)
    expect(listRadius).toBe(shapePx(segment.list, '--xh-shape-surface'))
    expect(triggerRadius).toBe(shapePx(segment.list, '--xh-shape-control'))
    expect(triggerRadius).toBeLessThanOrEqual(listRadius - Number.parseFloat(segmentPaint.listPadding))
    expect(segment.active.offsetWidth).toBe(segment.inactive.offsetWidth)
  })

  it('line 保持透明标签带，仅用文字与内侧指示条表达交互', async () => {
    const line = mount('line')
    const style = getComputedStyle(line.list)
    const restColor = getComputedStyle(line.inactive).color

    expect(style.backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(Number.parseFloat(style.paddingInlineStart)).toBe(0)
    expect(Number.parseFloat(style.borderBottomWidth)).toBe(0)
    expect(getComputedStyle(line.active).boxShadow).toBe('none')
    expect(getComputedStyle(line.active).color).not.toBe(restColor)
    expect(getComputedStyle(line.indicator).bottom).toBe('0px')

    await userEvent.hover(line.inactive)
    expect(getComputedStyle(line.inactive).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(getComputedStyle(line.inactive).color).not.toBe(restColor)
  })

  it('card 只保留选中标签的卡片面', () => {
    const card = mount('card')
    const listStyle = getComputedStyle(card.list)
    const activeStyle = getComputedStyle(card.active)

    expect(listStyle.backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(Number.parseFloat(listStyle.paddingInlineStart)).toBe(0)
    expect(Number.parseFloat(activeStyle.borderTopWidth)).toBeGreaterThan(0)
    expect(activeStyle.backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
  })

  it('segment 的选中标签是白色抬起面：surface-raised 底 + border-default 描边 + raised 影，标签带带透明占位边', () => {
    const segment = mount('segment')
    const active = getComputedStyle(segment.active)
    expect(active.backgroundColor).toBe(resolveColor('--xh-bg-surface-raised', segment.list))
    expect(active.borderTopColor).toBe(resolveColor('--xh-border-default', segment.list))
    expect(Number.parseFloat(active.borderTopWidth)).toBe(1)
    expect(active.boxShadow).not.toBe('none')
    const list = getComputedStyle(segment.list)
    expect(Number.parseFloat(list.borderTopWidth)).toBe(1)
    expect(list.borderTopColor).toBe('rgba(0, 0, 0, 0)')
    expect(list.boxShadow).toBe('none')
    // 未选中标签坐在淡底轨道里：悬停 200
    expect(getComputedStyle(segment.inactive).borderTopColor).toBe('rgba(0, 0, 0, 0)')
  })

  it('按下只换面不缩放：line 换前景，card 换到 200，segment 换到 300，选中标签不叠按下面', async () => {
    const line = mount('line')
    freezeMotion()
    const lineRest = getComputedStyle(line.inactive).color
    await userEvent.hover(line.inactive)
    const lineHover = getComputedStyle(line.inactive).color
    expect(lineHover).not.toBe(lineRest)
    await press(line.inactive)
    expect(line.inactive.matches(':active')).toBe(true)
    expect(getComputedStyle(line.inactive).scale).toBe('none')
    expect(getComputedStyle(line.inactive).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(getComputedStyle(line.inactive).color).not.toBe(lineHover)
    expect(getComputedStyle(line.inactive).color).toBe(getComputedStyle(line.active).color)
    host!.remove()

    const card = mount('card')
    freezeMotion()
    await userEvent.hover(card.inactive)
    expect(getComputedStyle(card.inactive).backgroundColor).toBe(resolveColor('--xh-bg-subtle', card.list))
    await press(card.inactive)
    expect(getComputedStyle(card.inactive).backgroundColor).toBe(resolveColor('--xh-bg-subtle-hover', card.list))
    expect(getComputedStyle(card.inactive).scale).toBe('none')
    host!.remove()

    const segment = mount('segment')
    freezeMotion()
    await userEvent.hover(segment.inactive)
    expect(getComputedStyle(segment.inactive).backgroundColor).toBe(resolveColor('--xh-bg-subtle-hover', segment.list))
    await press(segment.inactive)
    expect(getComputedStyle(segment.inactive).backgroundColor).toBe(resolveColor('--xh-bg-subtle-active', segment.list))
    expect(getComputedStyle(segment.inactive).scale).toBe('none')
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 0, y: 0, button: 'left', buttons: 0, clickCount: 1 })
    const raised = getComputedStyle(segment.active).backgroundColor
    await press(segment.active)
    expect(segment.active.matches(':active')).toBe(true)
    expect(getComputedStyle(segment.active).backgroundColor).toBe(raised)
    expect(getComputedStyle(segment.active).scale).toBe('none')
  })
})
