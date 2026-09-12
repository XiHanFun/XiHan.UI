// ButtonGroup 的段靠一像素共边连成一体：组内按压不能缩开接缝，组形态也不能盖过子段显式形态。
// 两条都依赖真实 :active、逻辑方向与完整 CSS 级联，只在 Chromium 中验证。
import type { App, VNode } from 'vue'
import { cdp, userEvent } from '@vitest/browser/context'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'
import { XhButton, XhButtonGroup, XhButtonGroupSeparator } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null
let pointer = { x: 1, y: 1 }
let pressed = false

function mount(render: () => VNode, dir: 'ltr' | 'rtl' = 'ltr'): void {
  host = document.createElement('div')
  host.dir = dir
  // shrink-to-fit 让 RTL 组也留在测试 frame 左侧；CDP 的主页面坐标不受测试 frame 右缘偏移干扰。
  host.style.display = 'inline-block'
  document.body.append(host)
  app = createApp({ setup: () => render })
  app.mount(host)
}

function buttons(): HTMLButtonElement[] {
  return [...host!.querySelectorAll<HTMLButtonElement>(`[data-scope='button'][data-part='root']`)]
}

async function press(el: HTMLElement): Promise<void> {
  await userEvent.hover(el)
  expect(el.matches(':hover'), '真实指针没有移到目标段').toBe(true)
  const rect = el.getBoundingClientRect()
  pointer = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
  expect(document.elementFromPoint(pointer.x, pointer.y), '按压坐标没有命中目标段').toBe(el)
  await cdp().send('Input.dispatchMouseEvent', {
    type: 'mousePressed',
    ...pointer,
    button: 'left',
    buttons: 1,
    clickCount: 1,
  })
  pressed = true
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

async function release(): Promise<void> {
  if (!pressed)
    return
  await cdp().send('Input.dispatchMouseEvent', {
    type: 'mouseReleased',
    ...pointer,
    button: 'left',
    buttons: 0,
    clickCount: 1,
  })
  pressed = false
}

function rectValues(el: HTMLElement): readonly number[] {
  const rect = el.getBoundingClientRect()
  return [rect.left, rect.top, rect.width, rect.height]
}

afterEach(async () => {
  await release()
  app?.unmount()
  app = null
  host?.remove()
  host = null
  await userEvent.hover(document.querySelector<HTMLElement>('[data-test-park-pointer]')!)
})

describe('按钮组共边按压', () => {
  it.each([
    { orientation: 'horizontal' as const, dir: 'ltr' as const },
    { orientation: 'horizontal' as const, dir: 'rtl' as const },
    { orientation: 'vertical' as const, dir: 'ltr' as const },
  ])('$orientation / $dir：中段按下时四边几何不动', async ({ orientation, dir }) => {
    mount(() => h(XhButtonGroup, { orientation, variant: 'outline' }, () => [
      h(XhButton, null, () => '前'),
      h(XhButton, null, () => '中'),
      h(XhButton, null, () => '后'),
    ]), dir)
    const middle = buttons()[1]!
    const before = rectValues(middle)

    await press(middle)
    expect(middle.matches(':active'), '真实主键没有把中段压进 :active').toBe(true)
    expect(getComputedStyle(middle).scale).toBe('none')
    const during = rectValues(middle)
    during.forEach((value, index) => expect(value).toBeCloseTo(before[index]!, 4))
  })

  it('组外按钮仍保留按压缩放，证明组内规则没有抹掉 Button 自己的反馈', async () => {
    mount(() => h('div', null, [
      h(XhButtonGroup, null, () => [h(XhButton, null, () => '组内')]),
      h(XhButton, null, () => '组外'),
    ]))
    const standalone = buttons()[1]!

    await press(standalone)
    expect(standalone.matches(':active')).toBe(true)
    expect(getComputedStyle(standalone).scale).not.toBe('none')
  })
})

describe('按钮组轮廓', () => {
  it('胶囊端点与半高分隔线保持连续轮廓', () => {
    mount(() => h(XhButtonGroup, { variant: 'solid' }, () => [
      h(XhButton, null, () => '日'),
      h(XhButtonGroupSeparator),
      h(XhButton, null, () => '周'),
      h(XhButtonGroupSeparator),
      h(XhButton, null, () => '月'),
    ]))

    const root = host!.querySelector<HTMLElement>(`[data-scope='button-group'][data-part='root']`)!
    const [first, middle, last] = buttons()
    const separators = [...root.querySelectorAll<HTMLElement>(`[data-part='separator']`)]
    const rootHeight = root.getBoundingClientRect().height

    expect(Number.parseFloat(getComputedStyle(first!).borderStartStartRadius)).toBeGreaterThanOrEqual(rootHeight / 2)
    expect(getComputedStyle(middle!).borderRadius).toBe('0px')
    expect(Number.parseFloat(getComputedStyle(last!).borderEndEndRadius)).toBeGreaterThanOrEqual(rootHeight / 2)
    expect(first!.getBoundingClientRect().right).toBeCloseTo(middle!.getBoundingClientRect().left, 4)
    expect(middle!.getBoundingClientRect().right).toBeCloseTo(last!.getBoundingClientRect().left, 4)
    for (const separator of separators) {
      const style = getComputedStyle(separator)
      expect(separator.getBoundingClientRect().height).toBeCloseTo(rootHeight / 2, 1)
      expect(style.marginInlineStart).toBe('-1px')
      expect(style.marginInlineEnd).toBe('0px')
    }
  })
})

describe('按钮组混合形态边界', () => {
  it('outline 只给未声明形态的直接段画边，各显式形态保留自己的边', () => {
    mount(() => h(XhButtonGroup, { variant: 'outline' }, () => [
      h(XhButton, null, () => '继承组'),
      h(XhButton, { variant: 'solid' }, () => '实心'),
      h(XhButton, { variant: 'subtle' }, () => '轻底'),
      h(XhButton, { variant: 'ghost' }, () => '幽灵'),
    ]))
    const [inherited, solid, subtle, ghost] = buttons().map(button => getComputedStyle(button).borderTopColor)

    expect(inherited).not.toBe('rgba(0, 0, 0, 0)')
    expect(solid).toBe('rgba(0, 0, 0, 0)')
    expect(subtle).not.toBe(inherited)
    expect(subtle).not.toBe('rgba(0, 0, 0, 0)')
    expect(ghost).toBe('rgba(0, 0, 0, 0)')
  })

  it('web components 一层行为宿主结构保持同样的描边与按压合同', async () => {
    host = document.createElement('div')
    host.innerHTML = `
      <div data-scope="button-group" data-part="root" data-orientation="horizontal" data-variant="outline">
        <xh-button><button data-scope="button" data-part="root" data-xh-action-control data-xh-action-profile="text" data-xh-action-size="md" data-xh-action-display="always">继承组</button></xh-button>
        <xh-button><button data-scope="button" data-part="root" data-xh-action-control data-xh-action-profile="text" data-xh-action-size="md" data-xh-action-display="always" data-variant="solid">实心</button></xh-button>
      </div>`
    document.body.append(host)
    const [inheritedButton, solidButton] = buttons()
    const inherited = getComputedStyle(inheritedButton!).borderTopColor
    const solid = getComputedStyle(solidButton!).borderTopColor

    expect(inherited).not.toBe('rgba(0, 0, 0, 0)')
    expect(solid).toBe('rgba(0, 0, 0, 0)')
    await press(inheritedButton!)
    expect(inheritedButton!.matches(':active')).toBe(true)
    expect(getComputedStyle(inheritedButton!).scale).toBe('none')
  })

  it('键盘焦点段仍抬层，整组禁用仍落成原生 disabled', async () => {
    mount(() => h('div', null, [
      h(XhButtonGroup, null, () => [h(XhButton, null, () => '可用一'), h(XhButton, null, () => '可用二')]),
      h(XhButtonGroup, { disabled: true }, () => [h(XhButton, null, () => '禁用')]),
    ]))
    const [first, , disabled] = buttons()

    await userEvent.tab()
    expect(document.activeElement).toBe(first)
    expect(getComputedStyle(first!).zIndex).toBe('1')
    expect(disabled!.disabled).toBe(true)
    expect(getComputedStyle(disabled!).scale).toBe('none')
  })
})
