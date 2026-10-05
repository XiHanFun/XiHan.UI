// radio-group 的 segmented 形态缺省视觉：淡底轨道、白色抬起的滑块、段的承载面阶梯，
// 以及这一形态特有的收法（不画行首圆圈、组标题视觉隐藏、RTL 下滑块从右缘往左推）。
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
  thumb: HTMLElement
  checked: HTMLElement
  idle: HTMLElement
}

/** 静态夹具：轨道里一个标题、一枚滑块与两段，滑块几何按连接层量出的内联样式给。 */
function mount(options: { tone?: string, dir?: string } = {}): Fixture {
  host = document.createElement('div')
  if (options.dir)
    host.setAttribute('dir', options.dir)
  host.innerHTML = `
    <div data-scope="radio-group" class="xh-scope-radio-group" data-part="root" data-variant="segmented" data-orientation="horizontal" role="radiogroup"${options.tone ? ` data-tone="${options.tone}"` : ''}>
      <span data-scope="radio-group" class="xh-scope-radio-group" data-part="label">视图</span>
      <span data-scope="radio-group" class="xh-scope-radio-group" data-part="thumb" style="--xh-_radio-group-thumb-x:64px;--xh-_radio-group-thumb-w:64px;--xh-_radio-group-thumb-h:28px"></span>
      <div data-scope="radio-group" class="xh-scope-radio-group" data-part="item" role="radio" data-state="unchecked" style="inline-size:64px">
        <span data-scope="radio-group" class="xh-scope-radio-group" data-part="indicator" data-state="unchecked"></span>日
      </div>
      <div data-scope="radio-group" class="xh-scope-radio-group" data-part="item" role="radio" data-state="checked" style="inline-size:64px">
        <span data-scope="radio-group" class="xh-scope-radio-group" data-part="indicator" data-state="checked"></span>周
      </div>
    </div>`
  document.body.append(host)
  // 断言的是稳定态的颜色与几何，不是过渡中间帧
  host.style.setProperty('--xh-motion-duration-micro', '0ms')
  host.style.setProperty('--xh-motion-duration-press', '0ms')
  host.style.setProperty('--xh-motion-duration-release', '0ms')
  host.style.setProperty('--xh-motion-duration-move', '0ms')
  return {
    root: host.querySelector<HTMLElement>('[data-part="root"]')!,
    label: host.querySelector<HTMLElement>('[data-part="label"]')!,
    thumb: host.querySelector<HTMLElement>('[data-part="thumb"]')!,
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

/** 长度令牌在该元素上解到的像素值（按圆角量）。 */
function resolveLength(token: string, scope: HTMLElement): string {
  const probe = document.createElement('span')
  probe.style.borderTopLeftRadius = `var(${token})`
  scope.append(probe)
  const value = getComputedStyle(probe).borderTopLeftRadius
  probe.remove()
  return value
}

describe('radio-group segmented 形态的缺省视觉', () => {
  it('轨道是淡底面：subtle 底 + 透明占位边 + 无影 + surface 圆角；滑块是白色抬起面：surface-raised 底 + border-default 描边 + raised 影', () => {
    const { root, thumb } = mount()
    const track = getComputedStyle(root)
    expect(track.backgroundColor).toBe(resolveColor('--xh-bg-subtle', root))
    expect(Number.parseFloat(track.borderTopWidth)).toBe(1)
    expect(track.borderTopColor).toBe('rgba(0, 0, 0, 0)')
    expect(track.boxShadow).toBe('none')
    expect(track.borderTopLeftRadius).toBe(resolveLength('--xh-shape-surface', root))
    expect(track.columnGap).toBe('0px')

    const slider = getComputedStyle(thumb)
    expect(slider.backgroundColor).toBe(resolveColor('--xh-bg-surface-raised', root))
    expect(Number.parseFloat(slider.borderTopWidth)).toBe(1)
    expect(slider.borderTopColor).toBe(resolveColor('--xh-border-default', root))
    expect(slider.boxShadow).not.toBe('none')
    // 描边吃进盒里：滑块仍是连接层量出的那块矩形
    expect(thumb.offsetWidth).toBe(64)
    expect(thumb.offsetHeight).toBe(28)
  })

  it('滑块按起始缘落位：ltr 从左缘往右推，rtl 乘上方向符号从右缘往左推，两种方向都罩住选中段', () => {
    for (const dir of ['ltr', 'rtl']) {
      const { root, thumb, checked } = mount({ dir })
      // 起始缘按书写方向量：与连接层同一个算法，rtl 从内衬盒右缘往左量
      const start = dir === 'rtl' ? root.clientWidth - checked.offsetLeft - checked.offsetWidth : checked.offsetLeft
      thumb.style.setProperty('--xh-_radio-group-thumb-x', `${start}px`)
      const box = thumb.getBoundingClientRect()
      const target = checked.getBoundingClientRect()
      expect(box.left, dir).toBeCloseTo(target.left, 0)
      expect(box.width, dir).toBeCloseTo(target.width, 0)
      host!.remove()
    }
  })

  it('这一形态不画行首圆圈，组标题视觉隐藏：不占版面、仍在无障碍树里', () => {
    const { label, root } = mount()
    for (const circle of root.querySelectorAll<HTMLElement>('[data-part="indicator"]'))
      expect(getComputedStyle(circle).display).toBe('none')
    const style = getComputedStyle(label)
    expect(style.display).not.toBe('none')
    expect(style.position).toBe('absolute')
    expect(label.getBoundingClientRect().width).toBeLessThanOrEqual(1)
  })

  it('语气档的滑块是实心语气面，描边与底同色', () => {
    const { root, thumb } = mount({ tone: 'success' })
    const slider = getComputedStyle(thumb)
    expect(slider.backgroundColor).toBe(resolveColor('--xh-_tone', root))
    expect(slider.borderTopColor).toBe(slider.backgroundColor)
  })

  it('未选中段坐在淡底轨道里：悬停 200、按下 300，只换面不缩放；选中段按下不叠面', async () => {
    const { root, idle, checked } = mount()
    expect(getComputedStyle(idle).color).toBe(resolveColor('--xh-fg-muted', root))
    expect(getComputedStyle(checked).color).toBe(resolveColor('--xh-fg-default', root))
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
