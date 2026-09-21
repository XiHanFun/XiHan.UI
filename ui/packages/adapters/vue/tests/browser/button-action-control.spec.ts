import type { App, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp, userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhButton, XhButtonGroup, XhButtonIndicator, XhButtonLabel, XhToggle } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

function mount(render: () => VNode, density: 'comfortable' | 'compact' = 'comfortable', dir: 'ltr' | 'rtl' = 'ltr'): void {
  document.documentElement.dataset.density = density
  host = document.createElement('div')
  host.dir = dir
  document.body.append(host)
  app = createApp({ setup: () => render })
  app.mount(host)
}

function action(): HTMLButtonElement {
  const element = host?.querySelector<HTMLButtonElement>('[data-xh-action-control]')
  if (!element)
    throw new Error('找不到 Action Control')
  return element
}

type Profile = 'text' | 'icon' | 'field-inset' | 'floating' | 'row' | 'disclosure-trigger'
type Variant = 'solid' | 'subtle' | 'outline' | 'ghost'

function rawAction(profile: Profile, size: 'xs' | 'sm' | 'md' | 'lg', parent: HTMLElement = host!): HTMLButtonElement {
  const element = document.createElement('button')
  element.textContent = profile === 'icon' || profile === 'field-inset' || profile === 'floating' ? '' : 'Action'
  element.setAttribute('data-xh-action-control', '')
  element.setAttribute('data-xh-action-profile', profile)
  element.setAttribute('data-xh-action-size', size)
  element.setAttribute('data-xh-action-display', 'always')
  parent.append(element)
  return element
}

/** 把语义令牌解析成与 getComputedStyle 同格式的颜色值，避免直接比对带 var() 链的自定义属性。 */
function resolveColor(token: string, scope: HTMLElement = host!): string {
  const probe = document.createElement('span')
  probe.style.backgroundColor = `var(${token})`
  scope.append(probe)
  const value = getComputedStyle(probe).backgroundColor
  probe.remove()
  return value
}

/** 令过渡即时完成：这里断言的是稳定态的颜色与几何，不是过渡中间帧。 */
function freezeMotion(): void {
  host!.style.setProperty('--xh-motion-duration-micro', '0ms')
  host!.style.setProperty('--xh-motion-duration-press', '0ms')
  host!.style.setProperty('--xh-motion-duration-release', '0ms')
}

async function press(element: HTMLElement): Promise<void> {
  const rect = element.getBoundingClientRect()
  await cdp().send('Input.dispatchMouseEvent', {
    type: 'mousePressed',
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
    button: 'left',
    buttons: 1,
    clickCount: 1,
  })
}

async function release(element: HTMLElement): Promise<void> {
  const rect = element.getBoundingClientRect()
  await cdp().send('Input.dispatchMouseEvent', {
    type: 'mouseReleased',
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
    button: 'left',
    buttons: 0,
    clickCount: 1,
  })
}

/** 键盘按下 / 抬起拆开派：按住的中间帧要真实的 keydown 才看得见。 */
async function keyDown(key: ' ' | 'Enter'): Promise<void> {
  await cdp().send('Input.dispatchKeyEvent', { type: 'keyDown', key: key === ' ' ? ' ' : 'Enter', code: key === ' ' ? 'Space' : 'Enter', windowsVirtualKeyCode: key === ' ' ? 32 : 13 })
}

async function keyUp(key: ' ' | 'Enter'): Promise<void> {
  await cdp().send('Input.dispatchKeyEvent', { type: 'keyUp', key: key === ' ' ? ' ' : 'Enter', code: key === ' ' ? 'Space' : 'Enter', windowsVirtualKeyCode: key === ' ' ? 32 : 13 })
}

afterEach(async () => {
  await cdp().send('Emulation.setTouchEmulationEnabled', { enabled: false })
  app?.unmount()
  app = null
  host?.remove()
  host = null
  delete document.documentElement.dataset.density
  delete document.documentElement.dataset.theme
  await userEvent.hover(document.querySelector<HTMLElement>('[data-test-park-pointer]')!)
})

describe('action Control 四 profile', () => {
  it.each([
    { density: 'comfortable' as const, expected: { 'text': [24, 32, 36, 40], 'icon': [24, 32, 36, 40], 'field-inset': [24, 24, 32, 36], 'floating': [32, 40, 48, 56] } },
    { density: 'compact' as const, expected: { 'text': [24, 28, 32, 36], 'icon': [24, 28, 32, 36], 'field-inset': [24, 24, 28, 32], 'floating': [28, 36, 44, 52] } },
  ])('$density：四 profile × xs/sm/md/lg 的视觉盒由同一配方解析', ({ density, expected }) => {
    mount(() => h('div'), density)
    const sizes = ['xs', 'sm', 'md', 'lg'] as const
    const profiles = ['text', 'icon', 'field-inset', 'floating'] as const
    for (const profile of profiles) {
      sizes.forEach((size, index) => {
        const element = rawAction(profile, size)
        const rect = element.getBoundingClientRect()
        expect(rect.height, `${profile}/${size}`).toBe(expected[profile][index])
        if (profile === 'text')
          expect(rect.width, `${profile}/${size} 文字动作不低于视觉尺寸`).toBeGreaterThanOrEqual(rect.height)
        else
          expect(rect.width, `${profile}/${size} 应为正方视觉盒`).toBe(rect.height)
      })
    }
  })

  it.each([
    { density: 'comfortable' as const, minimum: [24, 32, 36, 40] },
    { density: 'compact' as const, minimum: [24, 28, 32, 36] },
  ])('$density：row / disclosure-trigger 铺满容器宽度，高度不低于视觉尺寸', ({ density, minimum }) => {
    mount(() => h('div'), density)
    const container = document.createElement('div')
    container.style.inlineSize = '320px'
    host!.append(container)
    const sizes = ['xs', 'sm', 'md', 'lg'] as const
    for (const profile of ['row', 'disclosure-trigger'] as const) {
      sizes.forEach((size, index) => {
        const element = rawAction(profile, size, container)
        const rect = element.getBoundingClientRect()
        expect(rect.width, `${profile}/${size} 宽度由容器给`).toBe(320)
        expect(rect.height, `${profile}/${size} 高度不低于视觉尺寸`).toBeGreaterThanOrEqual(minimum[index]!)
        expect(getComputedStyle(element).display).toBe('flex')
      })
    }
  })

  it('rTL 沿逻辑行内轴排列，DOM 顺序和可访问顺序不倒置', () => {
    mount(() => h(XhButton, null, () => [
      h('span', { 'data-test-prefix': '' }, 'P'),
      h(XhButtonLabel, null, () => 'Label'),
    ]), 'comfortable', 'rtl')
    const prefix = host!.querySelector<HTMLElement>('[data-test-prefix]')!
    const label = host!.querySelector<HTMLElement>('[data-scope=\'button\'][data-part=\'label\']')!
    expect(prefix.getBoundingClientRect().left).toBeGreaterThan(label.getBoundingClientRect().left)
    expect(action().style.length).toBe(0)
  })
})

describe('action Control 状态与命中区', () => {
  it('浅色主按钮在 hover 与 pressed 状态保持浅色前景', async () => {
    document.documentElement.dataset.theme = 'light'
    mount(() => h(XhButton, null, () => '按钮'))
    const button = action()
    const expected = getComputedStyle(document.documentElement).getPropertyValue('--xh-fg-on-brand').trim()

    expect(getComputedStyle(button).color).toBe(expected)
    await userEvent.hover(button)
    expect(getComputedStyle(button).color).toBe(expected)

    await press(button)
    expect(button.matches(':active')).toBe(true)
    expect(getComputedStyle(button).color).toBe(expected)
    await release(button)
  })

  it('形态矩阵由 data-xh-action-variant 选择，无属性等价 subtle', () => {
    document.documentElement.dataset.theme = 'light'
    mount(() => h('div'))
    const variants: Variant[] = ['solid', 'subtle', 'outline', 'ghost']
    const elements = Object.fromEntries(variants.map((variant) => {
      const element = rawAction('text', 'md')
      element.setAttribute('data-xh-action-variant', variant)
      return [variant, element]
    })) as Record<Variant, HTMLButtonElement>
    const bare = rawAction('text', 'md')

    expect(getComputedStyle(elements.solid).backgroundColor).toBe(resolveColor('--xh-bg-brand'))
    expect(getComputedStyle(elements.solid).color).toBe(resolveColor('--xh-fg-on-brand'))
    expect(getComputedStyle(elements.subtle).backgroundColor).toBe(resolveColor('--xh-bg-subtle'))
    expect(getComputedStyle(elements.outline).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(getComputedStyle(elements.outline).borderTopColor).toBe(resolveColor('--xh-border-control'))
    expect(getComputedStyle(elements.ghost).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(getComputedStyle(elements.ghost).borderTopColor).toBe('rgba(0, 0, 0, 0)')

    const bareStyle = getComputedStyle(bare)
    const subtleStyle = getComputedStyle(elements.subtle)
    for (const property of ['backgroundColor', 'color', 'borderTopColor'] as const)
      expect(bareStyle[property], `无属性 ${property} 应与 subtle 一致`).toBe(subtleStyle[property])
  })

  it('ghost 悬停与按下按承载面取阶梯：画布 100 → 200，容器下发淡底 200 → 300', async () => {
    document.documentElement.dataset.theme = 'light'
    mount(() => h('div'))
    freezeMotion()
    const canvas = document.createElement('div')
    const tinted = document.createElement('div')
    tinted.style.setProperty('--xh-action-host-bg-hover', 'var(--xh-bg-subtle-hover)')
    tinted.style.setProperty('--xh-action-host-bg-pressed', 'var(--xh-bg-subtle-active)')
    host!.append(canvas, tinted)
    const onCanvas = rawAction('text', 'md', canvas)
    const onTinted = rawAction('text', 'md', tinted)
    for (const element of [onCanvas, onTinted])
      element.setAttribute('data-xh-action-variant', 'ghost')

    expect(getComputedStyle(onCanvas).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    await userEvent.hover(onCanvas)
    expect(getComputedStyle(onCanvas).backgroundColor).toBe(resolveColor('--xh-bg-subtle'))
    await press(onCanvas)
    expect(onCanvas.matches(':active')).toBe(true)
    expect(getComputedStyle(onCanvas).backgroundColor).toBe(resolveColor('--xh-bg-subtle-hover'))
    expect(getComputedStyle(onCanvas).scale).toBe('0.97')
    await release(onCanvas)

    await userEvent.hover(onTinted)
    expect(getComputedStyle(onTinted).backgroundColor).toBe(resolveColor('--xh-bg-subtle-hover'))
    await press(onTinted)
    expect(getComputedStyle(onTinted).backgroundColor).toBe(resolveColor('--xh-bg-subtle-active'))
    await release(onTinted)
  })

  it.each([
    { label: 'XhButton', render: () => h(XhButton, { variant: 'ghost' }, () => '按钮') },
    { label: 'XhToggle', render: () => h(XhToggle, { variant: 'ghost' }, () => '开关') },
  ])('$label：键盘 Space / Enter 按住投影 data-pressed，解出与指针 :active 同一副按压面（scale 0.97、pressed 底）', async ({ render }) => {
    document.documentElement.dataset.theme = 'light'
    mount(render)
    freezeMotion()
    const element = action()
    const restBg = getComputedStyle(element).backgroundColor
    const isOn = (): boolean => element.getAttribute('aria-pressed') === 'true'
    // 指针按住那一副面是基准：键盘按住要解出同样的底与缩放。松开指针即一次 click，
    // 开关会翻面，所以 off / on 两个状态各取一次基准（按钮没有状态，两次同值）
    const pointerPressedBg = async (): Promise<string> => {
      await press(element)
      expect(element.matches(':active')).toBe(true)
      const bg = getComputedStyle(element).backgroundColor
      await release(element)
      await userEvent.hover(document.querySelector<HTMLElement>('[data-test-park-pointer]')!)
      await nextTick()
      return bg
    }
    const offPressedBg = await pointerPressedBg()
    expect(offPressedBg).not.toBe(restBg)
    const onPressedBg = isOn() ? await pointerPressedBg() : offPressedBg
    expect(isOn()).toBe(false)

    element.focus()
    expect(element.matches(':focus')).toBe(true)
    expect(element.hasAttribute('data-pressed')).toBe(false)
    expect(getComputedStyle(element).scale).toBe('none')

    // Chromium 会给 Space 按住的按钮打 :active，Enter 则不会：两条都要走到同一副面。
    // 原生激活时机不同：Space 抬起才 click（按住期间仍是 off），Enter 按下即 click（按住期间已翻到 on）
    for (const key of [' ', 'Enter'] as const) {
      await keyDown(key)
      await nextTick()
      expect(element.hasAttribute('data-pressed'), `${JSON.stringify(key)} 按住`).toBe(true)
      if (key === 'Enter')
        expect(element.matches(':active'), 'Enter 按住没有 :active，这一副面只能来自 data-pressed').toBe(false)
      expect(getComputedStyle(element).scale, `${JSON.stringify(key)} 按住的缩放`).toBe('0.97')
      expect(getComputedStyle(element).backgroundColor, `${JSON.stringify(key)} 按住的底`).toBe(isOn() ? onPressedBg : offPressedBg)

      await keyUp(key)
      await nextTick()
      expect(element.hasAttribute('data-pressed'), `${JSON.stringify(key)} 抬起`).toBe(false)
      expect(getComputedStyle(element).scale, `${JSON.stringify(key)} 抬起的缩放`).toBe('none')
      // 这一次激活把开关翻到 on：翻回去，下一个键从 off 起
      if (isOn()) {
        element.click()
        await nextTick()
      }
    }
  })

  it('键盘按住途中失焦即撤下按压面', async () => {
    mount(() => h(XhButton, { variant: 'ghost' }, () => '按钮'))
    freezeMotion()
    const element = action()
    element.focus()
    await keyDown('Enter')
    await nextTick()
    expect(element.hasAttribute('data-pressed')).toBe(true)
    element.blur()
    await nextTick()
    expect(element.hasAttribute('data-pressed')).toBe(false)
    expect(getComputedStyle(element).scale).toBe('none')
    await keyUp('Enter')
  })

  it('row 与 disclosure-trigger 按下只换面不缩放', async () => {
    document.documentElement.dataset.theme = 'light'
    mount(() => h('div'))
    freezeMotion()
    const container = document.createElement('div')
    container.style.inlineSize = '320px'
    host!.append(container)
    for (const profile of ['row', 'disclosure-trigger'] as const) {
      const element = rawAction(profile, 'md', container)
      element.setAttribute('data-xh-action-variant', 'ghost')
      const before = element.getBoundingClientRect()
      await press(element)
      expect(element.matches(':active'), `${profile} 没进入 :active`).toBe(true)
      expect(getComputedStyle(element).scale, `${profile} 按下不缩放`).toBe('none')
      expect(getComputedStyle(element).backgroundColor, `${profile} 按下换到 pressed 面`).toBe(resolveColor('--xh-bg-subtle-hover'))
      const during = element.getBoundingClientRect()
      expect(during.width).toBeCloseTo(before.width, 4)
      expect(during.height).toBeCloseTo(before.height, 4)
      await release(element)
    }
  })

  it('未映射品牌、描边或海拔时保持平面中性底', async () => {
    mount(() => h('div'))
    const ready = rawAction('icon', 'sm')
    const rest = getComputedStyle(ready)
    const restBg = rest.backgroundColor

    expect(rest.borderTopColor).toBe('rgba(0, 0, 0, 0)')
    expect(rest.boxShadow).toBe('none')
    expect(rest.getPropertyValue('--xh-_action-current-highlight').trim()).toBe('transparent')

    await userEvent.hover(ready)
    const hovered = getComputedStyle(ready)
    expect(hovered.backgroundColor).not.toBe(restBg)
    expect(hovered.borderTopColor).toBe('rgba(0, 0, 0, 0)')
    expect(hovered.boxShadow).toBe('none')
  })

  it('rest/hover/pressed/focus-visible/disabled/loading 使用共享状态且 loading 不整体淡化', async () => {
    mount(() => h('div', null, [
      h(XhButton, { variant: 'subtle' }, () => h(XhButtonLabel, null, () => 'Ready')),
      h(XhButton, { disabled: true }, () => 'Disabled'),
      h(XhButton, { loading: true }, () => [h(XhButtonIndicator), h(XhButtonLabel, null, () => 'Loading')]),
    ]))
    const [ready, disabled, loading] = [...host!.querySelectorAll<HTMLButtonElement>('[data-xh-action-control]')]
    const restBg = getComputedStyle(ready!).backgroundColor
    await userEvent.hover(ready!)
    expect(getComputedStyle(ready!).backgroundColor).not.toBe(restBg)
    await userEvent.tab()
    expect(ready!.matches(':focus-visible')).toBe(true)
    expect(getComputedStyle(ready!).outlineStyle).toBe('solid')
    expect(getComputedStyle(disabled!).cursor).toBe('not-allowed')
    // 禁用同时降级前景与表面，不靠 opacity
    expect(getComputedStyle(disabled!).opacity).toBe('1')
    expect(getComputedStyle(disabled!).color).not.toBe(getComputedStyle(ready!).color)
    expect(getComputedStyle(loading!).cursor).toBe('progress')
    expect(getComputedStyle(loading!).opacity).toBe('1')
  })

  it('粗指针下 text 只扩块轴，icon 才扩双轴；短 ButtonGroup 保持连续布局', async () => {
    await cdp().send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 })
    mount(() => h(XhButtonGroup, null, () => [
      h(XhButton, null, () => 'A'),
      h(XhButton, null, () => 'B'),
      h(XhButton, { 'iconOnly': true, 'aria-label': '更多' }),
    ]))
    await nextTick()
    expect(matchMedia('(pointer: coarse)').matches).toBe(true)
    const [first, second, icon] = [...host!.querySelectorAll<HTMLButtonElement>('[data-xh-action-control]')]
    const firstTarget = getComputedStyle(first!, '::after')
    const iconTarget = getComputedStyle(icon!, '::after')
    expect(Number.parseFloat(firstTarget.minBlockSize)).toBeGreaterThanOrEqual(44)
    expect(Number.parseFloat(firstTarget.minInlineSize) || 0).toBe(0)
    expect(Number.parseFloat(iconTarget.minBlockSize)).toBeGreaterThanOrEqual(44)
    expect(Number.parseFloat(iconTarget.minInlineSize)).toBeGreaterThanOrEqual(44)
    expect(first!.getBoundingClientRect().right).toBeCloseTo(second!.getBoundingClientRect().left, 1)
  })

  it('未命名空间的业务 data-action-control 不会被家族皮肤命中', () => {
    mount(() => h('div'))
    const business = document.createElement('span')
    business.dataset.actionControl = 'business'
    host!.append(business)
    expect(getComputedStyle(business).display).not.toBe('inline-flex')
    expect(getComputedStyle(business).backgroundImage).toBe('none')
  })

  it('深色主题的品牌实心按钮保持深品牌面与浅色文字', () => {
    document.documentElement.dataset.theme = 'dark'
    mount(() => h('div', null, [
      h(XhButton, { variant: 'solid' }, () => '主要'),
      h(XhButtonGroup, { variant: 'solid' }, () => [
        h(XhButton, null, () => '照片'),
        h(XhButton, null, () => '视频'),
      ]),
    ]))

    const [standalone, grouped] = [...host!.querySelectorAll<HTMLButtonElement>('[data-xh-action-control]')]
    const tokens = getComputedStyle(document.documentElement)
    for (const button of [standalone, grouped]) {
      const style = getComputedStyle(button!)
      expect(style.backgroundColor).toBe(tokens.getPropertyValue('--xh-color-brand-600').trim())
      expect(style.color).toBe(tokens.getPropertyValue('--xh-color-neutral-0').trim())
    }
  })
})
