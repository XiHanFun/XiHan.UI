import { afterEach, describe, expect, it } from 'vitest'
import { cdp } from 'vitest/browser'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

afterEach(async () => {
  host?.remove()
  host = null
  await cdp().send('Emulation.setEmulatedMedia', { media: '', features: [] })
})

/** 在宿主的主题下把令牌解析成最终颜色，断言不写死任何色值。 */
function resolve(token: string): string {
  const probe = document.createElement('span')
  probe.style.color = `var(${token})`
  host!.append(probe)
  const value = getComputedStyle(probe).color
  probe.remove()
  return value
}

/**
 * 一排可选标签的静态投影：第一枚选中，第二枚未选中；标签是 tag 的 root，格子里有本组件的选中标记与 tag 的摘除钮。
 *  标记故意写在文字之前：落位由皮肤决定，作者怎么摆都排到文字之后、摘除钮之前。
 */
function mount() {
  host = document.createElement('div')
  // 断言读的是终值：按压与释放的过渡时长归零
  host.style.setProperty('--xh-motion-duration-micro', '0ms')
  host.style.setProperty('--xh-motion-duration-press', '0ms')
  host.style.setProperty('--xh-motion-duration-release', '0ms')
  host.innerHTML = `
    <div data-scope="tag-group" data-part="root">
      <div data-scope="tag-group" data-part="list" role="grid">
        <span data-scope="tag" data-part="root" role="row" data-state="open" data-selectable data-selected aria-selected="true">
          <span data-scope="tag-group" data-part="cell" role="gridcell" data-selected>
            <span data-scope="tag-group" data-part="item-indicator" aria-hidden="true" data-selected></span>
            <span data-scope="tag" data-part="label">设计</span>
            <button data-scope="tag" data-part="close-trigger" type="button" aria-label="移除"></button>
          </span>
        </span>
        <span data-scope="tag" data-part="root" role="row" data-state="open" data-selectable aria-selected="false">
          <span data-scope="tag-group" data-part="cell" role="gridcell">
            <span data-scope="tag-group" data-part="item-indicator" aria-hidden="true" hidden></span>
            <span data-scope="tag" data-part="label">无障碍</span>
          </span>
        </span>
      </div>
    </div>`
  document.body.append(host)
  const items = [...host.querySelectorAll<HTMLElement>('[data-scope="tag"][data-part="root"]')]
  const indicators = [...host.querySelectorAll<HTMLElement>('[data-part="item-indicator"]')]
  return { items, indicators }
}

describe('tag-group 选中视觉', () => {
  it('选中的标签面、字与描边都不换，只多一枚品牌色对号；未选中的标记收起', () => {
    const { items, indicators } = mount()
    const selected = getComputedStyle(items[0]!)
    const rest = getComputedStyle(items[1]!)

    expect(selected.backgroundColor).toBe(rest.backgroundColor)
    expect(selected.color).toBe(rest.color)
    expect(selected.borderTopColor).toBe(rest.borderTopColor)

    expect(getComputedStyle(indicators[1]!).display).toBe('none')
    const mark = getComputedStyle(indicators[0]!, '::before')
    expect(mark.maskImage === 'none' && mark.webkitMaskImage === 'none').toBe(false)
    // 对号与标签的关闭字形同一把随文尺：1em
    expect(Number.parseFloat(mark.inlineSize)).toBe(Number.parseFloat(getComputedStyle(items[0]!).fontSize))
    // 与树选择的行尾对号同色：没写语气时取品牌前景
    expect(mark.backgroundColor).toBe(resolve('--xh-fg-brand'))
  })

  it('对号落在文字之后、摘除钮之前：对号在行尾，操作钮排在最后', () => {
    const { items, indicators } = mount()
    const label = items[0]!.querySelector<HTMLElement>('[data-part="label"]')!.getBoundingClientRect()
    const close = items[0]!.querySelector<HTMLElement>('[data-part="close-trigger"]')!.getBoundingClientRect()
    const mark = indicators[0]!.getBoundingClientRect()
    expect(mark.left).toBeGreaterThanOrEqual(label.right)
    expect(close.left).toBeGreaterThanOrEqual(mark.right)
  })

  it('按下同时缩放与换底：选中与未选中同为中性 200 档', () => {
    const { items } = mount()
    const restBg = getComputedStyle(items[1]!).backgroundColor
    items[1]!.setAttribute('data-pressed', '')
    items[0]!.setAttribute('data-pressed', '')
    const pressed = getComputedStyle(items[1]!)
    const selectedPressed = getComputedStyle(items[0]!)

    expect(pressed.backgroundColor).not.toBe(restBg)
    expect(pressed.scale).toBe('0.97')
    expect(selectedPressed.backgroundColor).toBe(pressed.backgroundColor)
    expect(selectedPressed.scale).toBe('0.97')
  })

  it('forced-colors：选中的标签与未选中的同为静息面，对号用系统高亮色画出', async () => {
    await cdp().send('Emulation.setEmulatedMedia', {
      media: '',
      features: [{ name: 'forced-colors', value: 'active' }],
    })
    const { items, indicators } = mount()
    const selected = getComputedStyle(items[0]!)
    expect(selected.backgroundColor).toBe(getComputedStyle(items[1]!).backgroundColor)
    expect(getComputedStyle(indicators[0]!, '::before').backgroundColor).not.toBe(selected.backgroundColor)
  })

  it('打印：对号是遮罩出来的一块底色，按原样印出，不随打印丢底色', async () => {
    await cdp().send('Emulation.setEmulatedMedia', { media: 'print', features: [] })
    const { indicators } = mount()
    expect(getComputedStyle(indicators[0]!).printColorAdjust).toBe('exact')
  })
})
