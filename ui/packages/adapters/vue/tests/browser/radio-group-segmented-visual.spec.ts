// radio-group 的 segmented 形态缺省视觉：字段同款的淡底描边轨道、品牌淡底的选中滑块、段的承载面阶梯、
// 段间分隔线，以及这一形态特有的收法（不画行首圆圈、组标题视觉隐藏、RTL 下滑块从右缘往左推）。
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
  delete document.documentElement.dataset.theme
})

interface Fixture {
  root: HTMLElement
  label: HTMLElement
  thumb: HTMLElement
  checked: HTMLElement
  idle: HTMLElement
  items: HTMLElement[]
}

/** 静态夹具：轨道里一个标题、一枚滑块与两段（more 时四段，选中第二段），滑块几何按连接层量出的内联样式给。 */
function mount(options: { tone?: string, dir?: string, more?: boolean } = {}): Fixture {
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
      </div>${options.more
        ? ['月', '年'].map(text => `
      <div data-scope="radio-group" class="xh-scope-radio-group" data-part="item" role="radio" data-state="unchecked" style="inline-size:64px">${text}</div>`).join('')
        : ''}
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
    items: [...host.querySelectorAll<HTMLElement>('[data-part="item"]')],
  }
}

/** 字重令牌在该元素上解到的值。 */
function resolveWeight(token: string, scope: HTMLElement): string {
  const probe = document.createElement('span')
  probe.style.fontWeight = `var(${token})`
  scope.append(probe)
  const value = getComputedStyle(probe).fontWeight
  probe.remove()
  return value
}

const canvas = document.createElement('canvas')
const context = canvas.getContext('2d', { willReadFrequently: true })!

/** 半透明色先压在底色上再取 sRGB 分量。 */
function rgb(color: string, under = '#fff'): [number, number, number] {
  context.clearRect(0, 0, 1, 1)
  context.fillStyle = under
  context.fillRect(0, 0, 1, 1)
  context.fillStyle = color
  context.fillRect(0, 0, 1, 1)
  const data = context.getImageData(0, 0, 1, 1).data
  return [data[0]!, data[1]!, data[2]!]
}

function contrast(text: string, face: string, page: string): number {
  const luminance = ([r, g, b]: readonly [number, number, number]): number => {
    const linear = (channel: number): number => {
      const value = channel / 255
      return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
    }
    return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b)
  }
  const [pr, pg, pb] = rgb(page)
  const ground = `rgb(${pr}, ${pg}, ${pb})`
  const [fr, fg, fb] = rgb(face, ground)
  const values = [luminance(rgb(text, ground)), luminance([fr, fg, fb])].sort((a, b) => b - a) as [number, number]
  return (values[0] + 0.05) / (values[1] + 0.05)
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

/** 一段颜色表达式（可引私有槽）在该元素上解到的颜色。 */
function resolveExpression(expression: string, scope: HTMLElement): string {
  const probe = document.createElement('span')
  probe.style.backgroundColor = expression
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
  it('轨道与字段同款：最浅一档淡底 + 1px 字段描边 + control 圆角 + 2px 内衬；滑块是选中段的品牌淡底，无边无影', () => {
    const { root, thumb } = mount()
    const track = getComputedStyle(root)
    expect(track.backgroundColor).toBe(resolveColor('--xh-bg-field', root))
    expect(Number.parseFloat(track.borderTopWidth)).toBe(1)
    expect(track.borderTopColor).toBe(resolveColor('--xh-border-control', root))
    expect(track.boxShadow).toBe('none')
    expect(track.borderTopLeftRadius).toBe(resolveLength('--xh-shape-control', root))
    expect(track.paddingTop).toBe(resolveLength('--xh-space-0_5', root))
    expect(track.columnGap).toBe('0px')

    const slider = getComputedStyle(thumb)
    expect(slider.backgroundColor).toBe(resolveColor('--xh-bg-segment-selected', root))
    expect(slider.borderTopColor).toBe('rgba(0, 0, 0, 0)')
    expect(slider.boxShadow).toBe('none')
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

  it('语气档的滑块取语气淡底，选中段的字取语气字色', () => {
    const { root, thumb, checked } = mount({ tone: 'success' })
    expect(getComputedStyle(thumb).backgroundColor).toBe(resolveColor('--xh-_tone-subtle', root))
    expect(getComputedStyle(checked).color).toBe(resolveColor('--xh-_tone-fg', root))
  })

  it('语气档的禁用选中段：滑块退到语气 8% 淡底、字退到语气字往承载面兑一半，不回落到品牌色', () => {
    const { root, thumb, checked } = mount({ tone: 'success' })
    checked.setAttribute('data-disabled', '')
    expect(getComputedStyle(thumb).backgroundColor).toBe(resolveExpression('color-mix(in oklab, var(--xh-_tone) 8%, var(--xh-bg-surface))', root))
    expect(getComputedStyle(checked).color).toBe(resolveExpression('color-mix(in oklab, var(--xh-_tone-fg) 50%, var(--xh-bg-surface))', root))
    expect(getComputedStyle(thumb).backgroundColor).not.toBe(resolveColor('--xh-bg-segment-selected-disabled', root))
  })

  it('深色下语气档的滑块与品牌档同口径：静息 20%、悬停 28%', async () => {
    document.documentElement.dataset.theme = 'dark'
    const { root, thumb, checked } = mount({ tone: 'success' })
    expect(getComputedStyle(thumb).backgroundColor).toBe(resolveColor('--xh-_tone-subtle-hover', root))
    await userEvent.hover(checked)
    expect(getComputedStyle(thumb).backgroundColor).toBe(resolveColor('--xh-_tone-subtle-active', root))
    await userEvent.unhover(checked)
  })

  it('选中段品牌字 + medium，未选中段次级字色 + 常规字重', () => {
    const { root, idle, checked } = mount()
    expect(getComputedStyle(checked).color).toBe(resolveColor('--xh-fg-segment-selected', root))
    expect(getComputedStyle(checked).fontWeight).toBe(resolveWeight('--xh-font-weight-medium', root))
    expect(getComputedStyle(idle).color).toBe(resolveColor('--xh-fg-muted', root))
    expect(getComputedStyle(idle).fontWeight).toBe(resolveWeight('--xh-text-label-weight', root))
  })

  it('选中段悬停时滑块升一档；禁用的选中段滑块退到 8% 淡底、字退到浅品牌色', async () => {
    const { root, thumb, checked } = mount()
    await userEvent.hover(checked)
    expect(getComputedStyle(thumb).backgroundColor).toBe(resolveColor('--xh-bg-segment-selected-hover', root))
    await userEvent.unhover(checked)
    checked.setAttribute('data-disabled', '')
    expect(getComputedStyle(thumb).backgroundColor).toBe(resolveColor('--xh-bg-segment-selected-disabled', root))
    expect(getComputedStyle(checked).color).toBe(resolveColor('--xh-fg-segment-selected-disabled', root))
  })

  it('选中段的字压在静息与悬停两档选中面上，亮暗两档都到 4.5:1；深色档选中面 20%、悬停 28%', () => {
    for (const theme of ['light', 'dark'] as const) {
      document.documentElement.dataset.theme = theme
      const { root, checked } = mount()
      const page = resolveColor('--xh-bg-surface', root)
      const text = getComputedStyle(checked).color
      for (const face of ['--xh-bg-segment-selected', '--xh-bg-segment-selected-hover'])
        expect(contrast(text, resolveColor(face, root), page), `${theme} ${face}`).toBeGreaterThanOrEqual(4.5)
      if (theme === 'dark') {
        expect(resolveColor('--xh-bg-segment-selected', root)).toBe(resolveColor('--xh-bg-brand-subtle-hover', root))
        expect(resolveColor('--xh-bg-segment-selected-hover', root)).toBe(resolveColor('--xh-bg-brand-subtle-active', root))
        expect(text).toBe(resolveColor('--xh-fg-brand-strong', root))
      }
      host!.remove()
    }
  })

  it('段间 1px 分隔线取装饰边色、长 14px，与选中段和悬停段相邻的那几道收起', async () => {
    const { root, items } = mount({ more: true })
    const [day, week, month, year] = items
    expect(getComputedStyle(day!, '::after').content).toBe('none')
    const line = getComputedStyle(year!, '::after')
    expect(line.backgroundColor).toBe(resolveColor('--xh-border-default', root))
    expect(line.width).toBe('1px')
    expect(line.height).toBe('14px')
    // 周是选中段：它自己那道与它后面月的那道收起
    expect(getComputedStyle(week!, '::after').backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(getComputedStyle(month!, '::after').backgroundColor).toBe('rgba(0, 0, 0, 0)')
    await userEvent.hover(month!)
    expect(getComputedStyle(year!, '::after').backgroundColor).toBe('rgba(0, 0, 0, 0)')
    await userEvent.unhover(month!)
  })

  it('未选中段坐在近白的轨道里：悬停 100、按下 200，只换面不缩放；选中段按下不叠面', async () => {
    const { root, idle, checked } = mount()
    await userEvent.hover(idle)
    expect(getComputedStyle(idle).backgroundColor).toBe(resolveColor('--xh-bg-subtle', root))
    await pressPointer(idle)
    expect(idle.matches(':active')).toBe(true)
    expect(getComputedStyle(idle).backgroundColor).toBe(resolveColor('--xh-bg-subtle-hover', root))
    expect(getComputedStyle(idle).scale).toBe('none')
    await releasePointerAway()

    const rest = getComputedStyle(checked).backgroundColor
    await pressPointer(checked)
    expect(checked.matches(':active')).toBe(true)
    expect(getComputedStyle(checked).backgroundColor).toBe(rest)
    expect(getComputedStyle(checked).scale).toBe('none')
  })
})
