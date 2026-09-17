import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

function resolvedToken(name: string): string {
  const probe = document.createElement('span')
  probe.style.cssText = `color: var(${name})`
  document.body.append(probe)
  const value = getComputedStyle(probe).color
  probe.remove()
  return value
}

/** 目录的静态投影：第一节是当前节。 */
function mount() {
  host = document.createElement('div')
  // 断言读的是终值：悬停、按压与释放的过渡时长归零
  host.style.setProperty('--xh-motion-duration-micro', '0ms')
  host.style.setProperty('--xh-motion-duration-press', '0ms')
  host.style.setProperty('--xh-motion-duration-release', '0ms')
  host.innerHTML = `
    <nav data-scope="anchor" data-part="root">
      <ul data-scope="anchor" data-part="list">
        <li data-scope="anchor" data-part="item"><a data-scope="anchor" data-part="link" data-current href="#a">概述</a></li>
        <li data-scope="anchor" data-part="item"><a data-scope="anchor" data-part="link" href="#b">用法</a></li>
      </ul>
    </nav>`
  document.body.append(host)
  return [...host.querySelectorAll<HTMLElement>('[data-part="link"]')]
}

describe('anchor 导航当前页与阶梯', () => {
  it('当前节字色 brand-strong + medium 字重，其余节 fg-muted', () => {
    const [current, rest] = mount()
    expect(getComputedStyle(current!).color).toBe(resolvedToken('--xh-fg-brand-strong'))
    expect(getComputedStyle(current!).fontWeight).toBe('500')
    expect(getComputedStyle(rest!).color).toBe(resolvedToken('--xh-fg-muted'))
  })

  it('白底承载的阶梯：hover 100 → pressed 200，只换面不缩放', async () => {
    const [, link] = mount()
    expect(getComputedStyle(link!).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    await userEvent.hover(link!)
    expect(getComputedStyle(link!).backgroundColor).toBe(resolvedToken('--xh-bg-subtle'))
    link!.setAttribute('data-pressed', '')
    expect(getComputedStyle(link!).backgroundColor).toBe(resolvedToken('--xh-bg-subtle-hover'))
    expect(getComputedStyle(link!).scale).toBe('none')
  })
})
