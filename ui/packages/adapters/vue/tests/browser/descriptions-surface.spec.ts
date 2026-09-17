import { afterEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

/* 同一用例会挂两副描述列表，逐副记下、用例结束一并清掉 */
const hosts: HTMLElement[] = []

afterEach(() => {
  for (const host of hosts.splice(0))
    host.remove()
})

function tokenColor(name: string): string {
  const probe = document.createElement('span')
  probe.style.color = `var(${name})`
  document.body.append(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  return color
}

function mount(variant: 'ghost' | 'outline' | 'subtle' = 'ghost', size?: 'sm' | 'md' | 'lg') {
  const host = document.createElement('div')
  hosts.push(host)
  host.innerHTML = `
    <dl data-scope="descriptions" data-part="root" data-variant="${variant}"${size ? ` data-size="${size}"` : ''}>
      <div data-scope="descriptions" data-part="item">
        <dt data-scope="descriptions" data-part="label">收货人</dt>
        <dd data-scope="descriptions" data-part="value">张三</dd>
      </div>
      <div data-scope="descriptions" data-part="item">
        <dt data-scope="descriptions" data-part="label">联系电话</dt>
        <dd data-scope="descriptions" data-part="value">138 0000 0000</dd>
      </div>
    </dl>`
  document.body.append(host)
  return {
    root: host.querySelector<HTMLElement>('[data-part="root"]')!,
    item: host.querySelector<HTMLElement>('[data-part="item"]')!,
    label: host.querySelector<HTMLElement>('[data-part="label"]')!,
    value: host.querySelector<HTMLElement>('[data-part="value"]')!,
  }
}

describe('descriptions 根面', () => {
  it('outline 是 border-default 描边 + surface 底 + 无影的静态内容面', () => {
    const list = mount('outline')
    const style = getComputedStyle(list.root)

    expect(Number.parseFloat(style.borderTopWidth)).toBe(1)
    expect(style.borderTopColor).toBe(tokenColor('--xh-border-default'))
    expect(style.backgroundColor).toBe(tokenColor('--xh-bg-surface'))
    expect(style.boxShadow).toBe('none')
  })

  it('subtle 是淡底 + 透明边位 + 无影，边位与 outline 同宽', () => {
    const list = mount('subtle')
    const style = getComputedStyle(list.root)

    expect(Number.parseFloat(style.borderTopWidth)).toBe(1)
    expect(style.borderTopColor).toBe('rgba(0, 0, 0, 0)')
    expect(style.backgroundColor).toBe(tokenColor('--xh-bg-subtle'))
    expect(style.boxShadow).toBe('none')
    expect(style.borderTopWidth).toBe(getComputedStyle(mount('outline').root).borderTopWidth)
  })

  it('ghost 不画壳', () => {
    const list = mount()
    const style = getComputedStyle(list.root)

    expect(Number.parseFloat(style.borderTopWidth)).toBe(0)
    expect(style.backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(style.boxShadow).toBe('none')
  })
})

describe('descriptions 排版', () => {
  it('标签是集合标题：14 / 500 / fg-muted，叠着排时与取值隔 space-2', () => {
    const list = mount()
    const label = getComputedStyle(list.label)

    expect(Number.parseFloat(label.fontSize)).toBe(14)
    expect(label.fontWeight).toBe('500')
    expect(label.color).toBe(tokenColor('--xh-fg-muted'))
    expect(getComputedStyle(list.value).color).toBe(tokenColor('--xh-fg-default'))
    expect(list.value.getBoundingClientRect().top - list.label.getBoundingClientRect().bottom).toBe(8)
  })

  it('标签与取值的间距不随尺寸档变', () => {
    for (const size of ['sm', 'lg'] as const) {
      const list = mount('ghost', size)
      expect(list.value.getBoundingClientRect().top - list.label.getBoundingClientRect().bottom, size).toBe(8)
    }
  })
})
