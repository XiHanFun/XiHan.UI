import { afterEach, describe, expect, it } from 'vitest'
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
    <div data-scope="slider" data-part="root" data-orientation="horizontal" ${attrs}>
      <label data-scope="slider" data-part="label" ${attrs}>音量</label>
      <div data-scope="slider" data-part="control" data-orientation="horizontal" ${attrs}>
        <div data-scope="slider" data-part="track" data-orientation="horizontal" ${attrs}>
          <div data-scope="slider" data-part="range" data-orientation="horizontal" style="inset-inline-start:0%;inline-size:40%" ${attrs}></div>
        </div>
        <div data-scope="slider" data-part="tick-group" ${attrs}>
          <span data-scope="slider" data-part="tick" data-passed style="inset-inline-start:20%"></span>
          <span data-scope="slider" data-part="tick" style="inset-inline-start:80%"></span>
        </div>
        <div data-scope="slider" data-part="thumb" data-orientation="horizontal" role="slider" tabindex="0" style="inset-inline-start:40%" ${attrs}></div>
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

describe('slider 字段标签、拇指描边与禁用面', () => {
  it('字段标签 14 / 500 / fg-default，贴控件 space-1', () => {
    const { root, label } = mount()
    const style = getComputedStyle(label)
    expect(style.fontSize).toBe('14px')
    expect(style.fontWeight).toBe('500')
    expect(style.color).toBe(resolvedToken('--xh-fg-default'))
    expect(getComputedStyle(root).rowGap).toBe('4px')
  })

  it('拇指是 raised 面：品牌实心 + border-default 描边 + raised 影；刻度点取 circle', () => {
    const { thumb, ticks } = mount()
    const style = getComputedStyle(thumb)
    expect(style.borderTopColor).toBe(resolvedToken('--xh-border-default-opaque'))
    expect(style.borderTopWidth).toBe('2px')
    expect(style.backgroundColor).toBe(resolvedToken('--xh-bg-brand', 'background-color'))
    expect(style.boxShadow).not.toBe('none')
    expect(getComputedStyle(ticks[0]!).borderTopLeftRadius).toBe('50%')
  })

  it('禁用：不整体压暗，轨道退 100 档、区间与已过刻度换禁用前景、拇指白面无影、标签 fg-subtle', () => {
    const { root, label, track, range, thumb, ticks } = mount('data-disabled')
    expect(getComputedStyle(root).opacity).toBe('1')
    expect(getComputedStyle(label).color).toBe(resolvedToken('--xh-fg-subtle'))
    expect(getComputedStyle(track).backgroundColor).toBe(resolvedToken('--xh-bg-subtle', 'background-color'))
    expect(getComputedStyle(range).backgroundColor).toBe(resolvedToken('--xh-fg-disabled', 'background-color'))
    const thumbStyle = getComputedStyle(thumb)
    expect(thumbStyle.backgroundColor).toBe(resolvedToken('--xh-bg-surface', 'background-color'))
    expect(thumbStyle.borderTopColor).toBe(resolvedToken('--xh-border-default-opaque'))
    expect(thumbStyle.boxShadow).toBe('none')
    expect(thumbStyle.cursor).toBe('not-allowed')
    expect(getComputedStyle(ticks[0]!).backgroundColor).toBe(resolvedToken('--xh-fg-disabled', 'background-color'))
    expect(getComputedStyle(ticks[1]!).backgroundColor).toBe(resolvedToken('--xh-border-default', 'background-color'))
  })
})
