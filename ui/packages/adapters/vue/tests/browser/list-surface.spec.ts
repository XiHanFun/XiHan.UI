import { userEvent } from '@vitest/browser/context'
import { afterEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

/* 同一用例会挂两副列表（白底与淡底各一），逐副记下、用例结束一并清掉 */
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

function mount(variant: 'ghost' | 'outline' | 'subtle' = 'ghost', hoverable = false) {
  const host = document.createElement('div')
  hosts.push(host)
  host.innerHTML = `
    <ul data-scope="list" data-part="root" data-variant="${variant}"${hoverable ? ' data-hoverable' : ''} data-split>
      <li data-scope="list" data-part="item">
        <div data-scope="list" data-part="item-content">
          <div data-scope="list" data-part="item-title">周报</div>
          <div data-scope="list" data-part="item-description">每周五下班前提交</div>
        </div>
      </li>
      <li data-scope="list" data-part="item">
        <div data-scope="list" data-part="item-content">
          <div data-scope="list" data-part="item-title">月报</div>
        </div>
      </li>
    </ul>`
  document.body.append(host)
  const items = [...host.querySelectorAll<HTMLElement>('[data-part="item"]')]
  return {
    root: host.querySelector<HTMLElement>('[data-part="root"]')!,
    items,
    title: host.querySelector<HTMLElement>('[data-part="item-title"]')!,
    description: host.querySelector<HTMLElement>('[data-part="item-description"]')!,
  }
}

describe('list 根面', () => {
  it('outline 是 border-default 描边 + surface 底 + 无影的静态内容面', () => {
    const list = mount('outline')
    const style = getComputedStyle(list.root)

    expect(Number.parseFloat(style.borderTopWidth)).toBe(1)
    expect(style.borderTopColor).toBe(tokenColor('--xh-border-default'))
    expect(style.backgroundColor).toBe(tokenColor('--xh-bg-surface'))
    expect(style.boxShadow).toBe('none')
  })

  it('subtle 是淡底 + 透明边位 + 无影，与 outline 同一几何', () => {
    const list = mount('subtle')
    const style = getComputedStyle(list.root)

    expect(Number.parseFloat(style.borderTopWidth)).toBe(1)
    expect(style.borderTopColor).toBe('rgba(0, 0, 0, 0)')
    expect(style.backgroundColor).toBe(tokenColor('--xh-bg-subtle'))
    expect(style.boxShadow).toBe('none')
    expect(list.root.getBoundingClientRect().height).toBe(mount('outline').root.getBoundingClientRect().height)
  })

  it('ghost 不画壳，split 只在条目之间画一条 border-subtle 分隔线', () => {
    const list = mount()
    const style = getComputedStyle(list.root)

    expect(Number.parseFloat(style.borderTopWidth)).toBe(0)
    expect(style.backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(style.boxShadow).toBe('none')
    expect(Number.parseFloat(getComputedStyle(list.items[0]!).borderTopWidth)).toBe(0)
    expect(Number.parseFloat(getComputedStyle(list.items[1]!).borderTopWidth)).toBe(1)
    expect(getComputedStyle(list.items[1]!).borderTopColor).toBe(tokenColor('--xh-border-subtle'))
  })
})

describe('list 条目', () => {
  it('白底上的 hoverable 条目悬停换到 100，淡底档里抬到 200', async () => {
    const onCanvas = mount('outline', true).items[0]!
    await userEvent.hover(onCanvas)
    await expect.poll(() => getComputedStyle(onCanvas).backgroundColor).toBe(tokenColor('--xh-bg-subtle'))

    const onSubtle = mount('subtle', true).items[0]!
    await userEvent.hover(onSubtle)
    await expect.poll(() => getComputedStyle(onSubtle).backgroundColor).toBe(tokenColor('--xh-bg-subtle-hover'))
  })

  it('标题 500 字重、说明 13 / fg-muted', () => {
    const list = mount()
    const title = getComputedStyle(list.title)
    const description = getComputedStyle(list.description)

    expect(title.fontWeight).toBe('500')
    expect(title.color).toBe(tokenColor('--xh-fg-default'))
    expect(Number.parseFloat(description.fontSize)).toBe(13)
    expect(description.color).toBe(tokenColor('--xh-fg-muted'))
  })
})
