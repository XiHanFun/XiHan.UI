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

/** 静态夹具：轨道里一枚滑块与两段，滑块几何按连接层量出的内联样式给。 */
function mount(tone?: string): { root: HTMLElement, indicator: HTMLElement, checked: HTMLElement, idle: HTMLElement } {
  host = document.createElement('div')
  host.innerHTML = `
    <div data-scope="segmented" data-part="root" data-orientation="horizontal"${tone ? ` data-tone="${tone}"` : ''}>
      <span data-scope="segmented" data-part="indicator" style="--xh-_segmented-indicator-w:64px;--xh-_segmented-indicator-h:32px"></span>
      <button data-scope="segmented" data-part="item" data-state="checked">日</button>
      <button data-scope="segmented" data-part="item" data-state="unchecked">周</button>
    </div>`
  document.body.append(host)
  // 断言的是稳定态的颜色与几何，不是过渡中间帧
  host.style.setProperty('--xh-motion-duration-micro', '0ms')
  host.style.setProperty('--xh-motion-duration-press', '0ms')
  host.style.setProperty('--xh-motion-duration-release', '0ms')
  return {
    root: host.querySelector<HTMLElement>('[data-part="root"]')!,
    indicator: host.querySelector<HTMLElement>('[data-part="indicator"]')!,
    checked: host.querySelector<HTMLElement>('[data-part="item"][data-state="checked"]')!,
    idle: host.querySelector<HTMLElement>('[data-part="item"][data-state="unchecked"]')!,
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

describe('segmented 默认视觉', () => {
  it('轨道是淡底面：subtle 底 + 透明占位边 + 无影，滑块是白色抬起面：surface-raised 底 + border-default 描边 + raised 影', () => {
    const { root, indicator } = mount()
    const track = getComputedStyle(root)
    expect(track.backgroundColor).toBe(resolveColor('--xh-bg-subtle', root))
    expect(Number.parseFloat(track.borderTopWidth)).toBe(1)
    expect(track.borderTopColor).toBe('rgba(0, 0, 0, 0)')
    expect(track.boxShadow).toBe('none')

    const slider = getComputedStyle(indicator)
    expect(slider.backgroundColor).toBe(resolveColor('--xh-bg-surface-raised', root))
    expect(Number.parseFloat(slider.borderTopWidth)).toBe(1)
    expect(slider.borderTopColor).toBe(resolveColor('--xh-border-default', root))
    expect(slider.boxShadow).not.toBe('none')
    // 描边吃进盒里：滑块仍是连接层量出的那块矩形
    expect(indicator.offsetWidth).toBe(64)
    expect(indicator.offsetHeight).toBe(32)
  })

  it('语气档的滑块是实心语气面，描边与底同色', () => {
    const { root, indicator } = mount('success')
    const slider = getComputedStyle(indicator)
    expect(slider.backgroundColor).toBe(resolveColor('--xh-_tone', root))
    expect(slider.borderTopColor).toBe(slider.backgroundColor)
  })

  it('未选中段坐在淡底轨道里：悬停 200、按下 300，只换面不缩放；选中段按下不叠面', async () => {
    const { root, idle, checked } = mount()
    await userEvent.hover(idle)
    expect(getComputedStyle(idle).backgroundColor).toBe(resolveColor('--xh-bg-subtle-hover', root))
    await pressPointer(idle)
    expect(idle.matches(':active')).toBe(true)
    expect(getComputedStyle(idle).backgroundColor).toBe(resolveColor('--xh-bg-subtle-active', root))
    expect(getComputedStyle(idle).scale).toBe('none')
    await releasePointerAway()

    const rest = getComputedStyle(checked).backgroundColor
    await pressPointer(checked)
    expect(checked.matches(':active')).toBe(true)
    expect(getComputedStyle(checked).backgroundColor).toBe(rest)
    expect(getComputedStyle(checked).scale).toBe('none')
  })
})
