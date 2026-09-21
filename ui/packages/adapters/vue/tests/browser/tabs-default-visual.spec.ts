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

function mount(variant?: 'card' | 'line' | 'segment'): { list: HTMLElement, active: HTMLElement, inactive: HTMLElement, indicator: HTMLElement } {
  host = document.createElement('div')
  // line 档（含不写变体）的页签由连接层投影 Collection Item 的 nav 语境，选中项另投 data-current；
  // card / segment 不归族，只带 activation 族的 data-state
  const family = variant == null || variant === 'line' ? ' data-xh-collection-item data-xh-collection-context="nav" data-xh-collection-size="md"' : ''
  host.innerHTML = `
    <div data-scope="tabs" data-part="root" data-orientation="horizontal"${variant ? ` data-variant="${variant}"` : ''}>
      <div data-scope="tabs" data-part="list">
        <button data-scope="tabs" data-part="trigger" data-state="active" data-current${family}>概览</button>
        <button data-scope="tabs" data-part="trigger" data-state="inactive"${family}>分析</button>
        <span data-scope="tabs" data-part="indicator" data-orientation="horizontal"${variant ? ` data-variant="${variant}"` : ' data-variant="line"'} style="--xh-_tabs-indicator-x:0;--xh-_tabs-indicator-y:0;--xh-_tabs-indicator-w:40px;--xh-_tabs-indicator-h:36px"></span>
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

  it('segment 使用浅色标签带承载浮起的选中面：放了 indicator 部件时面长在部件上跟着滑，选中标签自己透空', () => {
    const segment = mount('segment')
    const segmentPaint = {
      listBackground: paint(segment.list, 'background-color'),
      listPadding: paint(segment.list, 'padding-inline-start'),
      indicatorBackground: paint(segment.indicator, 'background-color'),
      indicatorShadow: paint(segment.indicator, 'box-shadow'),
    }
    expect(segmentPaint.listBackground).not.toBe('rgba(0, 0, 0, 0)')
    expect(Number.parseFloat(segmentPaint.listPadding)).toBeGreaterThan(0)
    expect(paint(segment.indicator, 'display')).not.toBe('none')
    expect(segmentPaint.indicatorBackground).not.toBe('rgba(0, 0, 0, 0)')
    expect(segmentPaint.indicatorShadow).not.toBe('none')
    // 部件按机器写的四支私有槽落位；面搬走后选中标签透空、不再叠一层
    expect(getComputedStyle(segment.indicator).position).toBe('absolute')
    expect(getComputedStyle(segment.indicator).width).toBe('40px')
    expect(getComputedStyle(segment.indicator).height).toBe('36px')
    expect(paint(segment.active, 'background-color')).toBe('rgba(0, 0, 0, 0)')
    expect(paint(segment.active, 'box-shadow')).toBe('none')
    // 标签带是 surface 面，标签本体与滑块都是 control；内层圆角不超过外层圆角减去衬距
    const listRadius = Number.parseFloat(getComputedStyle(segment.list).borderRadius)
    const triggerRadius = Number.parseFloat(getComputedStyle(segment.active).borderRadius)
    expect(listRadius).toBe(shapePx(segment.list, '--xh-shape-surface'))
    expect(triggerRadius).toBe(shapePx(segment.list, '--xh-shape-control'))
    expect(Number.parseFloat(getComputedStyle(segment.indicator).borderRadius)).toBe(triggerRadius)
    expect(triggerRadius).toBeLessThanOrEqual(listRadius - Number.parseFloat(segmentPaint.listPadding))
    expect(segment.active.offsetWidth).toBe(segment.inactive.offsetWidth)
  })

  it('line 保持透明标签带：当前页透明面 + 品牌深字 + medium，未选中 muted + regular，悬停走白底承载 100 + default 字', async () => {
    const line = mount('line')
    freezeMotion()
    const style = getComputedStyle(line.list)

    expect(style.backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(Number.parseFloat(style.paddingInlineStart)).toBe(0)
    expect(Number.parseFloat(style.borderBottomWidth)).toBe(0)
    expect(getComputedStyle(line.indicator).bottom).toBe('0px')
    // 当前页（§7.3 导航当前页，Collection Item nav 语境）：透明面 + --xh-fg-brand-strong + medium
    const active = getComputedStyle(line.active)
    expect(active.boxShadow).toBe('none')
    expect(active.backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(active.color).toBe(resolveColor('--xh-fg-brand-strong', line.list))
    expect(active.fontWeight).toBe('500')
    // 未选中：muted + regular（与 Anchor / Breadcrumb / Menubar 同一档静息）
    const rest = getComputedStyle(line.inactive)
    expect(rest.color).toBe(resolveColor('--xh-fg-muted', line.list))
    expect(rest.fontWeight).toBe('400')
    expect(rest.cursor).toBe('pointer')

    // 悬停：白底承载 hover 100（§7.2）+ default 字，不再只换前景
    await userEvent.hover(line.inactive)
    expect(getComputedStyle(line.inactive).backgroundColor).toBe(resolveColor('--xh-bg-subtle', line.list))
    expect(getComputedStyle(line.inactive).color).toBe(resolveColor('--xh-fg-default', line.list))
    // 当前页叠悬停：保留品牌深字，面走 100（§9.3）
    await userEvent.hover(line.active)
    expect(getComputedStyle(line.active).backgroundColor).toBe(resolveColor('--xh-bg-subtle', line.list))
    expect(getComputedStyle(line.active).color).toBe(resolveColor('--xh-fg-brand-strong', line.list))
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

  it('segment 的白色抬起面三件：surface-raised 底 + border-default 描边 + raised 影，放了部件长在部件上、没放长在选中标签上；标签带带透明占位边', () => {
    const segment = mount('segment')
    const slider = getComputedStyle(segment.indicator)
    expect(slider.backgroundColor).toBe(resolveColor('--xh-bg-surface-raised', segment.list))
    expect(slider.borderTopColor).toBe(resolveColor('--xh-border-default', segment.list))
    expect(Number.parseFloat(slider.borderTopWidth)).toBe(1)
    expect(slider.boxShadow).not.toBe('none')
    // 作者没放 indicator 部件：面回到选中标签自己身上（面的过渡归零，读到的才是终值）
    freezeMotion()
    segment.indicator.remove()
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

  it('按下只换面不缩放：line 经家族换到 200，card 换到 200，segment 换到 300，选中标签不叠按下面', async () => {
    const line = mount('line')
    freezeMotion()
    await userEvent.hover(line.inactive)
    expect(getComputedStyle(line.inactive).backgroundColor).toBe(resolveColor('--xh-bg-subtle', line.list))
    await pressPointer(line.inactive)
    expect(line.inactive.matches(':active')).toBe(true)
    expect(getComputedStyle(line.inactive).scale).toBe('none')
    expect(getComputedStyle(line.inactive).backgroundColor).toBe(resolveColor('--xh-bg-subtle-hover', line.list))
    expect(getComputedStyle(line.inactive).color).toBe(resolveColor('--xh-fg-default', line.list))
    host!.remove()

    const card = mount('card')
    freezeMotion()
    await userEvent.hover(card.inactive)
    expect(getComputedStyle(card.inactive).backgroundColor).toBe(resolveColor('--xh-bg-subtle', card.list))
    await pressPointer(card.inactive)
    expect(getComputedStyle(card.inactive).backgroundColor).toBe(resolveColor('--xh-bg-subtle-hover', card.list))
    expect(getComputedStyle(card.inactive).scale).toBe('none')
    host!.remove()

    const segment = mount('segment')
    freezeMotion()
    await userEvent.hover(segment.inactive)
    expect(getComputedStyle(segment.inactive).backgroundColor).toBe(resolveColor('--xh-bg-subtle-hover', segment.list))
    await pressPointer(segment.inactive)
    expect(getComputedStyle(segment.inactive).backgroundColor).toBe(resolveColor('--xh-bg-subtle-active', segment.list))
    expect(getComputedStyle(segment.inactive).scale).toBe('none')
    await releasePointerAway()
    const raised = getComputedStyle(segment.active).backgroundColor
    await pressPointer(segment.active)
    expect(segment.active.matches(':active')).toBe(true)
    expect(getComputedStyle(segment.active).backgroundColor).toBe(raised)
    expect(getComputedStyle(segment.active).scale).toBe('none')
  })
})
