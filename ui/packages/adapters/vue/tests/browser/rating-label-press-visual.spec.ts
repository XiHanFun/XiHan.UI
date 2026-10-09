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

/** 星接 Action Control icon 档，连接层投影的家族属性在静态夹具里照抄 */
const STAR = 'data-xh-action-control data-xh-action-profile="icon" data-xh-action-variant="ghost" data-xh-action-display="always" data-xh-action-size="xs"'

/** 评分的静态投影：标签 + 星带 + 分值。 */
function mount(attrs = '', rootAttrs = '') {
  host = document.createElement('div')
  // 断言读的是终值：按压与释放的过渡时长归零
  host.style.setProperty('--xh-motion-duration-micro', '0ms')
  host.style.setProperty('--xh-motion-duration-press', '0ms')
  host.style.setProperty('--xh-motion-duration-release', '0ms')
  host.innerHTML = `
    <div data-scope="rating" class="xh-scope-rating" data-part="root" ${attrs} ${rootAttrs}>
      <span data-scope="rating" class="xh-scope-rating" data-part="label" ${attrs}>满意度</span>
      <div data-scope="rating" class="xh-scope-rating" data-part="control" ${attrs}>
        <span data-scope="rating" class="xh-scope-rating" data-part="item" data-highlighted ${STAR} ${attrs}></span>
        <span data-scope="rating" class="xh-scope-rating" data-part="item" ${STAR} ${attrs}></span>
      </div>
      <span data-scope="rating" class="xh-scope-rating" data-part="value-text" ${attrs}>1 / 2</span>
    </div>`
  document.body.append(host)
  const part = (name: string) => host!.querySelector<HTMLElement>(`[data-part="${name}"]`)!
  return { root: part('root'), label: part('label'), control: part('control'), item: part('item'), valueText: part('value-text') }
}

describe('rating 字段标签、星形尺度与按压', () => {
  it('字段标签 14 / 400 / fg-muted，与控件隔 space-2（根的 gap 4 + 标签补白 4）', () => {
    const { root, label } = mount()
    const style = getComputedStyle(label)
    expect(style.fontSize).toBe('14px')
    expect(style.fontWeight).toBe('400')
    expect(style.color).toBe(resolvedToken('--xh-fg-muted'))
    expect(getComputedStyle(root).rowGap).toBe('4px')
    expect(style.marginBlockEnd).toBe('4px')
  })

  it.each([
    ['sm', 20, 24],
    ['', 24, 28],
    ['lg', 32, 36],
  ] as const)('星按档取字形尺 %s：星 %ipx，盒比星大一圈取 %ipx 正方', (size, star, box) => {
    const { item } = mount('', size ? `data-size="${size}"` : '')
    const before = getComputedStyle(item, '::before')
    expect(before.width).toBe(`${star}px`)
    expect(before.height).toBe(`${star}px`)
    expect(item.getBoundingClientRect().width).toBe(box)
    expect(item.getBoundingClientRect().height).toBe(box)
  })

  it('悬停与键盘聚焦把星放大到 1.2 强调；按下保持放大并换到 200 档底，松手回到透明；点亮色在按下时保持', async () => {
    const { item } = mount()
    expect(getComputedStyle(item).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(getComputedStyle(item).transitionProperty.split(', ')).toContain('scale')
    const lit = getComputedStyle(item).color
    expect(lit).not.toBe(resolvedToken('--xh-fg-subtle'))
    await userEvent.hover(item)
    expect(getComputedStyle(item).scale).toBe('1.2')
    expect(getComputedStyle(item).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    item.setAttribute('data-pressed', '')
    expect(getComputedStyle(item).color).toBe(lit)
    expect(getComputedStyle(item).scale).toBe('1.2')
    expect(getComputedStyle(item).backgroundColor).toBe(resolvedToken('--xh-bg-subtle-hover'))
    item.removeAttribute('data-pressed')
    await userEvent.unhover(item)
    expect(getComputedStyle(item).scale).toBe('none')
    expect(getComputedStyle(item).backgroundColor).toBe('rgba(0, 0, 0, 0)')

    item.tabIndex = 0
    await userEvent.keyboard('{Tab}')
    item.focus()
    expect(item.matches(':focus-visible')).toBe(true)
    expect(getComputedStyle(item).scale).toBe('1.2')
  })

  it('减弱动效：悬停不放大，只留点亮换色', async () => {
    const { item } = mount()
    host!.dataset.motion = 'reduce'
    await userEvent.hover(item)
    expect(getComputedStyle(item).scale).toBe('1')
    await userEvent.unhover(item)
  })

  it('禁用：标签不另变色、不压暗，星带整体压暗一次，按下不再换面', () => {
    const { label, control, item, valueText } = mount('data-disabled')
    expect(getComputedStyle(label).color).toBe(resolvedToken('--xh-fg-muted'))
    expect(getComputedStyle(label).opacity).toBe('1')
    expect(getComputedStyle(valueText).color).toBe(resolvedToken('--xh-fg-subtle'))
    expect(getComputedStyle(control).opacity).toBe('0.5')
    item.setAttribute('data-pressed', '')
    expect(getComputedStyle(item).scale).toBe('none')
    expect(getComputedStyle(item).backgroundColor).toBe('rgba(0, 0, 0, 0)')
  })

  it('只读：手型收回，悬停与按下都不缩放不换底；星形本身不被家族的粗指针热区撑大', async () => {
    const { item } = mount('data-readonly')
    expect(getComputedStyle(item).cursor).toBe('default')
    await userEvent.hover(item)
    expect(getComputedStyle(item).scale).toBe('none')
    item.setAttribute('data-pressed', '')
    expect(getComputedStyle(item).scale).toBe('none')
    expect(getComputedStyle(item).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    await userEvent.unhover(item)
    const after = getComputedStyle(item, '::after')
    expect(after.width).toBe('24px')
    expect(after.minWidth).toBe('0px')
  })
})
