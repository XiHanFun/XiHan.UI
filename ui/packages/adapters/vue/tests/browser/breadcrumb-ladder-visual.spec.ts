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

/** 面包屑的静态投影：末层是当前页。链接由连接层投影 Collection Item 的 nav 语境，当前页再投影 terminal，面与字由家族给。 */
function mount() {
  host = document.createElement('div')
  // 断言读的是终值：悬停、按压与释放的过渡时长归零
  host.style.setProperty('--xh-motion-duration-micro', '0ms')
  host.style.setProperty('--xh-motion-duration-press', '0ms')
  host.style.setProperty('--xh-motion-duration-release', '0ms')
  host.innerHTML = `
    <nav data-scope="breadcrumb" data-part="root">
      <ol data-scope="breadcrumb" data-part="list">
        <li data-scope="breadcrumb" data-part="item"><a data-scope="breadcrumb" data-part="link" data-xh-collection-item data-xh-collection-context="nav" data-xh-collection-size="md" href="#a">首页</a></li>
        <li data-scope="breadcrumb" data-part="separator" aria-hidden="true"></li>
        <li data-scope="breadcrumb" data-part="item"><a data-scope="breadcrumb" data-part="link" data-current aria-current="page" aria-disabled="true" data-xh-collection-item data-xh-collection-context="nav" data-xh-collection-size="md" data-xh-collection-terminal>订单</a></li>
      </ol>
    </nav>`
  document.body.append(host)
  return [...host.querySelectorAll<HTMLElement>('[data-part="link"]')]
}

describe('breadcrumb 链接阶梯与当前页', () => {
  it('白底承载的阶梯：hover 100 → pressed 200，只换面不缩放', async () => {
    const [link] = mount()
    expect(getComputedStyle(link!).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    await userEvent.hover(link!)
    expect(getComputedStyle(link!).backgroundColor).toBe(resolvedToken('--xh-bg-subtle'))
    link!.setAttribute('data-pressed', '')
    expect(getComputedStyle(link!).backgroundColor).toBe(resolvedToken('--xh-bg-subtle-hover'))
    expect(getComputedStyle(link!).scale).toBe('none')
  })

  it('当前页保留 fg-default + medium 字重与 default 光标，悬停与按下都不换面，也不落禁用面', async () => {
    const [, current] = mount()
    expect(getComputedStyle(current!).color).toBe(resolvedToken('--xh-fg-default'))
    expect(getComputedStyle(current!).fontWeight).toBe('500')
    expect(getComputedStyle(current!).cursor).toBe('default')
    // 它同时带 aria-disabled='true'：terminal 态要压过家族的禁用面，不能是 fg-disabled 或半透明
    expect(getComputedStyle(current!).opacity).toBe('1')
    await userEvent.hover(current!)
    current!.setAttribute('data-pressed', '')
    expect(getComputedStyle(current!).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(getComputedStyle(current!).color).toBe(resolvedToken('--xh-fg-default'))
  })
})
