import { afterEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

function tokenColor(name: string): string {
  const probe = document.createElement('span')
  probe.style.color = `var(${name})`
  document.body.append(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  return color
}

function mount() {
  host = document.createElement('div')
  host.innerHTML = `
    <div data-scope="statistic" class="xh-scope-statistic" data-part="root">
      <span data-scope="statistic" class="xh-scope-statistic" data-part="label">本月营收</span>
      <span data-scope="statistic" class="xh-scope-statistic" data-part="prefix">¥</span>
      <span data-scope="statistic" class="xh-scope-statistic" data-part="value">128,600</span>
      <span data-scope="statistic" class="xh-scope-statistic" data-part="suffix">元</span>
    </div>`
  document.body.append(host)
  const part = (name: string) => host!.querySelector<HTMLElement>(`[data-part="${name}"]`)!
  return { label: part('label'), prefix: part('prefix'), value: part('value'), suffix: part('suffix') }
}

describe('statistic 排版', () => {
  it('标签 14px 弱一档前景，与数值隔 8px；数值 24px / 500', () => {
    const statistic = mount()
    const label = getComputedStyle(statistic.label)
    const value = getComputedStyle(statistic.value)

    expect(label.fontSize).toBe('14px')
    expect(label.color).toBe(tokenColor('--xh-fg-muted'))
    expect(statistic.value.getBoundingClientRect().top - statistic.label.getBoundingClientRect().bottom).toBeCloseTo(8, 0)
    expect(value.fontSize).toBe('24px')
    expect(value.fontWeight).toBe('500')
  })

  it('前后缀小一档，颜色与字重同数值', () => {
    const statistic = mount()
    const value = getComputedStyle(statistic.value)

    for (const affix of [statistic.prefix, statistic.suffix]) {
      const style = getComputedStyle(affix)
      expect(style.fontSize).toBe('14px')
      expect(style.color).toBe(value.color)
      expect(style.fontWeight).toBe(value.fontWeight)
    }
  })
})
