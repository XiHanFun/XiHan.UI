import { afterEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

/* 同一用例会挂两副页头（贴底与 split 各一），逐副记下、用例结束一并清掉 */
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

function mount(variant?: 'ghost' | 'outline' | 'subtle', split = false) {
  const host = document.createElement('div')
  hosts.push(host)
  host.innerHTML = `
    <header data-scope="page-header" data-part="root"${variant ? ` data-variant="${variant}"` : ''}${split ? ' data-split' : ''}>
      <h1 data-scope="page-header" data-part="title">订单详情</h1>
      <p data-scope="page-header" data-part="description">查看这笔订单的收货与付款信息</p>
    </header>`
  document.body.append(host)
  return {
    root: host.querySelector<HTMLElement>('[data-part="root"]')!,
    title: host.querySelector<HTMLElement>('[data-part="title"]')!,
    description: host.querySelector<HTMLElement>('[data-part="description"]')!,
  }
}

describe('page-header 根面', () => {
  it('outline 是 border-default 描边 + surface 底 + 无影的静态内容面', () => {
    const header = mount('outline')
    const style = getComputedStyle(header.root)

    expect(Number.parseFloat(style.borderTopWidth)).toBe(1)
    expect(style.borderTopColor).toBe(tokenColor('--xh-border-default'))
    expect(style.backgroundColor).toBe(tokenColor('--xh-bg-surface'))
    expect(style.boxShadow).toBe('none')
  })

  it('subtle 是淡底 + 透明边位 + 无影，与 outline 同一几何', () => {
    const header = mount('subtle')
    const style = getComputedStyle(header.root)

    expect(Number.parseFloat(style.borderTopWidth)).toBe(1)
    expect(style.borderTopColor).toBe('rgba(0, 0, 0, 0)')
    expect(style.backgroundColor).toBe(tokenColor('--xh-bg-subtle'))
    expect(style.boxShadow).toBe('none')
  })

  it('贴底的 ghost 不画面；split 只在底下画一条 border-subtle 分隔线', () => {
    const plain = mount()
    expect(Number.parseFloat(getComputedStyle(plain.root).borderBottomWidth)).toBe(0)
    expect(getComputedStyle(plain.root).backgroundColor).toBe('rgba(0, 0, 0, 0)')

    const split = mount('ghost', true)
    const style = getComputedStyle(split.root)
    expect(Number.parseFloat(style.borderTopWidth)).toBe(0)
    expect(Number.parseFloat(style.borderBottomWidth)).toBe(1)
    expect(style.borderBottomColor).toBe(tokenColor('--xh-border-subtle'))
  })

  it('标题走 heading-3 档字号与字重，说明是 13/fg-muted', () => {
    const header = mount()
    const title = getComputedStyle(header.title)
    const description = getComputedStyle(header.description)

    expect(title.fontWeight).toBe('600')
    expect(Number.parseFloat(title.fontSize)).toBeGreaterThan(Number.parseFloat(description.fontSize))
    expect(description.color).toBe(tokenColor('--xh-fg-muted'))
  })
})
