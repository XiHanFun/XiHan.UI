import { afterEach, describe, expect, it } from 'vitest'
import { tokenLength } from './design-token'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

function resolvedToken(name: string, prop: 'color' | 'background-color' = 'color'): string {
  const probe = document.createElement('span')
  probe.style.cssText = `${prop}: var(${name})`
  document.body.append(probe)
  const value = getComputedStyle(probe)[prop === 'color' ? 'color' : 'backgroundColor']
  probe.remove()
  return value
}

/** 滑块的静态投影：标签 + 轨道 / 区间 / 拇指 + 一颗刻度。 */
function mount(attrs = '') {
  host = document.createElement('div')
  host.style.cssText = 'inline-size: 240px; padding: 24px'
  host.innerHTML = `
    <div data-scope="slider" class="xh-scope-slider" data-part="root" data-orientation="horizontal" ${attrs}>
      <label data-scope="slider" class="xh-scope-slider" data-part="label" ${attrs}>音量</label>
      <div data-scope="slider" class="xh-scope-slider" data-part="control" data-orientation="horizontal" ${attrs}>
        <div data-scope="slider" class="xh-scope-slider" data-part="track" data-orientation="horizontal" ${attrs}>
          <div data-scope="slider" class="xh-scope-slider" data-part="range" data-orientation="horizontal" style="inset-inline-start:0%;inline-size:40%" ${attrs}></div>
        </div>
        <div data-scope="slider" class="xh-scope-slider" data-part="tick-group" ${attrs}>
          <span data-scope="slider" class="xh-scope-slider" data-part="tick" data-passed style="inset-inline-start:20%"></span>
          <span data-scope="slider" class="xh-scope-slider" data-part="tick" style="inset-inline-start:80%"></span>
        </div>
        <div data-scope="slider" class="xh-scope-slider" data-part="thumb" data-orientation="horizontal" role="slider" tabindex="0" style="inset-inline-start:40%" ${attrs}></div>
      </div>
    </div>`
  document.body.append(host)
  const part = (name: string) => host!.querySelector<HTMLElement>(`[data-part="${name}"]`)!
  return {
    root: part('root'),
    label: part('label'),
    track: part('track'),
    range: part('range'),
    thumb: part('thumb'),
    ticks: [...host.querySelectorAll<HTMLElement>('[data-part="tick"]')],
  }
}

describe('slider 字段标签、轨道、拇指与禁用面', () => {
  it('字段标签取标签字号与字重、fg-muted，与控件隔 space-2（根的 gap 4 + 标签补白 4）', () => {
    const { root, label } = mount()
    const style = getComputedStyle(label)
    expect(style.fontSize).toBe('14px')
    const weight = document.createElement('span')
    weight.style.fontWeight = 'var(--xh-text-label-weight)'
    document.body.append(weight)
    expect(style.fontWeight).toBe(getComputedStyle(weight).fontWeight)
    weight.remove()
    expect(style.color).toBe(resolvedToken('--xh-fg-muted'))
    expect(getComputedStyle(root).rowGap).toBe('4px')
    expect(style.marginBlockEnd).toBe('4px')
  })

  it('轨道 2px、取 fill-3 级中性填充，两端全圆；已选区间品牌色', () => {
    const { track, range } = mount()
    const style = getComputedStyle(track)
    expect(track.getBoundingClientRect().height).toBe(2)
    expect(style.backgroundColor).toBe(resolvedToken('--xh-bg-subtle-hover', 'background-color'))
    expect(style.borderTopLeftRadius).toBe('9999px')
    expect(getComputedStyle(range).backgroundColor).toBe(resolvedToken('--xh-bg-brand', 'background-color'))
  })

  it('拇指 12px 圆：白底 + 2px 品牌描边，静止不投影', () => {
    const { thumb } = mount()
    const style = getComputedStyle(thumb)
    expect(thumb.getBoundingClientRect().width).toBe(12)
    expect(thumb.getBoundingClientRect().height).toBe(12)
    expect(style.borderTopLeftRadius).toBe('50%')
    expect(style.borderTopWidth).toBe('2px')
    expect(style.borderTopColor).toBe(resolvedToken('--xh-bg-brand'))
    expect(style.backgroundColor).toBe(resolvedToken('--xh-bg-surface', 'background-color'))
    expect(style.boxShadow).toBe('none')
  })

  it.each(['sm', 'md', 'lg'] as const)('%s 档拇指直径取轨道拇指的同档令牌', (tier) => {
    // md 是缺省档：不写 data-size
    const { thumb } = mount(tier === 'md' ? '' : `data-size="${tier}"`)
    expect(thumb.getBoundingClientRect().width).toBe(tokenLength(`--xh-track-thumb-size-${tier}`))
    expect(thumb.getBoundingClientRect().height).toBe(tokenLength(`--xh-track-thumb-size-${tier}`))
  })

  it('拖动中的拇指放大一档并抬起', () => {
    const { thumb } = mount()
    thumb.style.setProperty('--xh-motion-duration-nudge', '0ms')
    thumb.setAttribute('data-dragging', '')
    const style = getComputedStyle(thumb)
    expect(Number(style.scale)).toBeGreaterThan(1)
    expect(style.boxShadow).not.toBe('none')
  })

  it('刻度点 8px 圆：白底 + 2px 描边，没过的取轨道色、走过的取品牌色', () => {
    const { ticks } = mount()
    const [passed, ahead] = ticks.map(tick => getComputedStyle(tick))
    expect(ticks[1]!.getBoundingClientRect().width).toBe(8)
    expect(ahead!.borderTopLeftRadius).toBe('50%')
    expect(ahead!.borderTopWidth).toBe('2px')
    expect(ahead!.backgroundColor).toBe(resolvedToken('--xh-bg-surface', 'background-color'))
    expect(ahead!.borderTopColor).toBe(resolvedToken('--xh-bg-subtle-hover'))
    expect(passed!.backgroundColor).toBe(resolvedToken('--xh-bg-surface', 'background-color'))
    expect(passed!.borderTopColor).toBe(resolvedToken('--xh-bg-brand'))
  })

  it('禁用：不整体压暗，轨道退 fill-2、区间与拇指描边退 fill-3、拇指白面无影、标签不另变色', () => {
    const { root, label, track, range, thumb, ticks } = mount('data-disabled')
    expect(getComputedStyle(root).opacity).toBe('1')
    expect(getComputedStyle(label).color).toBe(resolvedToken('--xh-fg-muted'))
    expect(getComputedStyle(track).backgroundColor).toBe(resolvedToken('--xh-bg-subtle', 'background-color'))
    expect(getComputedStyle(range).backgroundColor).toBe(resolvedToken('--xh-bg-subtle-hover-opaque', 'background-color'))
    const thumbStyle = getComputedStyle(thumb)
    expect(thumbStyle.backgroundColor).toBe(resolvedToken('--xh-bg-surface', 'background-color'))
    expect(thumbStyle.borderTopColor).toBe(resolvedToken('--xh-bg-subtle-hover-opaque'))
    expect(thumbStyle.boxShadow).toBe('none')
    expect(thumbStyle.cursor).toBe('not-allowed')
    expect(getComputedStyle(ticks[0]!).borderTopColor).toBe(resolvedToken('--xh-bg-subtle-hover-opaque'))
    expect(getComputedStyle(ticks[1]!).borderTopColor).toBe(resolvedToken('--xh-bg-subtle'))
  })
})
