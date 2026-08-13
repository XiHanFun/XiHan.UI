// @vitest-environment jsdom
// 环形进度的几何走 DOM：圆心、半径、起笔角与两条弧的长度都由连接层算好写进标记，
// 皮肤只上色。判据按「画出来是什么样」写，不按实现写。
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'
import { XhProgress } from '../src'

let cleanup: Array<() => void> = []

afterEach(() => {
  for (const fn of cleanup) fn()
  cleanup = []
  document.body.innerHTML = ''
})

function mount(props: Record<string, unknown>, label?: string): HTMLElement {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp({
    setup: () => () => h(XhProgress, props, label == null ? undefined : { default: () => label }),
  })
  app.mount(host)
  cleanup.push(() => {
    app.unmount()
    host.remove()
  })
  return host
}

const part = (host: HTMLElement, name: string): HTMLElement => {
  const el = host.querySelector<HTMLElement>(`[data-scope="progress"][data-part="${name}"]`)
  if (!el)
    throw new Error(`找不到 ${name}`)
  return el
}

describe('环形进度', () => {
  it('画面是固定的 100×100，不进可及树；值与语义都留在 root 上', () => {
    const host = mount({ variant: 'circle', value: 50 })
    const canvas = part(host, 'canvas')
    expect(canvas.tagName.toLowerCase()).toBe('svg')
    expect(canvas.getAttribute('viewBox')).toBe('0 0 100 100')
    expect(canvas.getAttribute('aria-hidden')).toBe('true')
    expect(part(host, 'root').getAttribute('aria-valuenow')).toBe('50')
  })

  it('两条弧同圆心同半径，起笔转到 12 点；进度弧按比例往回缩', () => {
    const host = mount({ variant: 'circle', value: 50 })
    const track = part(host, 'track')
    const range = part(host, 'range')
    for (const el of [track, range]) {
      expect(el.tagName.toLowerCase()).toBe('circle')
      expect(el.getAttribute('r')).toBe('47')
      expect(el.getAttribute('transform')).toBe('rotate(-90 50 50)')
      expect(el.style.strokeDasharray).toBe('295.31 295.31')
    }
    // 半程：缩掉一半弧长
    expect(range.style.strokeDashoffset).toBe('147.655')
    expect(track.style.strokeDashoffset).toBe('')
  })

  it('满值一点不缩，零值缩掉整段并标记 data-empty', () => {
    expect(part(mount({ variant: 'circle', value: 100 }), 'range').style.strokeDashoffset).toBe('0')
    const zero = part(mount({ variant: 'circle', value: 0 }), 'range')
    expect(zero.style.strokeDashoffset).toBe('295.31')
    expect(zero.hasAttribute('data-empty')).toBe(true)
  })

  it('线宽改的是几何：半径跟着往里收，外沿仍贴着画面', () => {
    const host = mount({ variant: 'circle', value: 50, strokeWidth: 12 })
    expect(part(host, 'track').getAttribute('r')).toBe('44')
    expect(part(host, 'range').style.strokeWidth).toBe('12')
  })

  it('仪表盘：弧短一截给缺口留位，整个环转过去让缺口落在朝向那一侧', () => {
    const bottom = mount({ variant: 'dashboard', value: 50 })
    expect(part(bottom, 'track').style.strokeDasharray).toBe('233.787 295.31')
    expect(part(bottom, 'track').getAttribute('transform')).toBe('rotate(127.5 50 50)')

    const top = mount({ variant: 'dashboard', value: 50, gapPosition: 'top' })
    expect(part(top, 'track').getAttribute('transform')).toBe('rotate(-52.5 50 50)')
  })

  it('环心那一层只在作者写了内容时才有；线形不产出环的任何部件', () => {
    const bare = mount({ variant: 'circle', value: 50 })
    expect(bare.querySelector('[data-part="label"]')).toBeNull()

    const labelled = mount({ variant: 'circle', value: 50 }, '72%')
    expect(part(labelled, 'label').textContent).toBe('72%')

    const line = mount({ value: 50 })
    expect(line.querySelector('[data-part="canvas"]')).toBeNull()
    expect(part(line, 'range').style.inlineSize).toBe('50%')
    expect(part(line, 'range').getAttribute('r')).toBeNull()
  })

  it('线形的长度不取整：3/8 是 37.5% 而不是 38%', () => {
    expect(part(mount({ value: 3, max: 8 }), 'range').style.inlineSize).toBe('37.5%')
  })
})
