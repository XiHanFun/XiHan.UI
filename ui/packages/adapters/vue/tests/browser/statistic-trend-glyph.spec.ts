// 涨跌箭头的尺寸：皮肤画的兜底字形与作者塞进来的图标读同一把尺 --xh-icon-size，
// 缺省跟着前后缀那一档字走（sm 字形 16px），lg 档抬到 md 20px，作者槽 --xh-statistic-icon-size 仍能覆盖。
import { afterEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const hosts: HTMLElement[] = []

afterEach(() => {
  for (const host of hosts.splice(0))
    host.remove()
})

function mount(size?: 'sm' | 'md' | 'lg', style?: string) {
  const host = document.createElement('div')
  hosts.push(host)
  host.innerHTML = `
    <div data-scope="statistic" data-part="root"${size ? ` data-size="${size}"` : ''}${style ? ` style="${style}"` : ''}>
      <div data-scope="statistic" data-part="label">活跃用户</div>
      <span data-scope="statistic" data-part="value">1,024</span>
      <span data-scope="statistic" data-part="suffix">人</span>
      <span data-scope="statistic" data-part="trend" data-direction="up">12%</span>
    </div>`
  document.body.append(host)
  return {
    root: host.querySelector<HTMLElement>('[data-part="root"]')!,
    trend: host.querySelector<HTMLElement>('[data-part="trend"]')!,
  }
}

function arrowSize(trend: HTMLElement): number {
  return Number.parseFloat(getComputedStyle(trend, '::before').width)
}

describe('statistic 涨跌箭头', () => {
  it('缺省与 sm 档取 sm 字形 16px，lg 档抬到 md 20px', () => {
    expect(arrowSize(mount().trend)).toBe(16)
    expect(arrowSize(mount('sm').trend)).toBe(16)
    expect(arrowSize(mount('md').trend)).toBe(16)
    expect(arrowSize(mount('lg').trend)).toBe(20)
  })

  it('箭头与作者图标读同一把尺：根上的 --xh-icon-size 就是箭头的边长', () => {
    const { root, trend } = mount()
    const probe = document.createElement('span')
    probe.style.inlineSize = 'var(--xh-icon-size)'
    root.append(probe)
    expect(Number.parseFloat(getComputedStyle(probe).width)).toBe(arrowSize(trend))
  })

  it('作者槽 --xh-statistic-icon-size 覆盖箭头边长', () => {
    expect(arrowSize(mount(undefined, '--xh-statistic-icon-size: 12px').trend)).toBe(12)
  })
})
