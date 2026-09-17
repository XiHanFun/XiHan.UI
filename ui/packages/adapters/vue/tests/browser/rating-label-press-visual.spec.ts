import { afterEach, describe, expect, it } from 'vitest'
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

/** 评分的静态投影：标签 + 星带 + 分值。 */
function mount(attrs = '') {
  host = document.createElement('div')
  // 断言读的是终值：按压与释放的过渡时长归零
  host.style.setProperty('--xh-motion-duration-micro', '0ms')
  host.style.setProperty('--xh-motion-duration-press', '0ms')
  host.style.setProperty('--xh-motion-duration-release', '0ms')
  host.innerHTML = `
    <div data-scope="rating" data-part="root" ${attrs}>
      <span data-scope="rating" data-part="label" ${attrs}>满意度</span>
      <div data-scope="rating" data-part="control" ${attrs}>
        <span data-scope="rating" data-part="item" data-highlighted ${attrs}></span>
        <span data-scope="rating" data-part="item" ${attrs}></span>
      </div>
      <span data-scope="rating" data-part="value-text" ${attrs}>1 / 2</span>
    </div>`
  document.body.append(host)
  const part = (name: string) => host!.querySelector<HTMLElement>(`[data-part="${name}"]`)!
  return { root: part('root'), label: part('label'), control: part('control'), item: part('item'), valueText: part('value-text') }
}

describe('rating 字段标签、星形尺度与按压', () => {
  it('字段标签 14 / 500 / fg-default，贴控件 space-1', () => {
    const { root, label } = mount()
    const style = getComputedStyle(label)
    expect(style.fontSize).toBe('14px')
    expect(style.fontWeight).toBe('500')
    expect(style.color).toBe(resolvedToken('--xh-fg-default'))
    expect(getComputedStyle(root).rowGap).toBe('4px')
  })

  it('星按档取字形尺：md 20px，盒仍是 24px 正方', () => {
    const { item } = mount()
    const before = getComputedStyle(item, '::before')
    expect(before.width).toBe('20px')
    expect(before.height).toBe('20px')
    expect(item.getBoundingClientRect().width).toBe(24)
    expect(item.getBoundingClientRect().height).toBe(24)
  })

  it('按下 0.97 缩放并同时换到 200 档底，松手回到透明', () => {
    const { item } = mount()
    expect(getComputedStyle(item).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    item.setAttribute('data-pressed', '')
    expect(getComputedStyle(item).scale).toBe('0.97')
    expect(getComputedStyle(item).backgroundColor).toBe(resolvedToken('--xh-bg-subtle-hover'))
    item.removeAttribute('data-pressed')
    expect(getComputedStyle(item).scale).toBe('none')
    expect(getComputedStyle(item).backgroundColor).toBe('rgba(0, 0, 0, 0)')
  })

  it('禁用：标签换到 fg-subtle 而不压暗，星带整体压暗一次，按下不再换面', () => {
    const { label, control, item, valueText } = mount('data-disabled')
    expect(getComputedStyle(label).color).toBe(resolvedToken('--xh-fg-subtle'))
    expect(getComputedStyle(label).opacity).toBe('1')
    expect(getComputedStyle(valueText).color).toBe(resolvedToken('--xh-fg-subtle'))
    expect(getComputedStyle(control).opacity).toBe('0.5')
    item.setAttribute('data-pressed', '')
    expect(getComputedStyle(item).scale).toBe('none')
    expect(getComputedStyle(item).backgroundColor).toBe('rgba(0, 0, 0, 0)')
  })
})
