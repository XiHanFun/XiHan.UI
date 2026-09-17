import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'
import { XhToggle } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

function mount(props: Record<string, unknown> = {}): HTMLButtonElement {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ setup: () => () => h(XhToggle, props, () => '开关') })
  app.mount(host)
  const element = host.querySelector<HTMLButtonElement>(`[data-scope='toggle'][data-part='root']`)
  if (!element)
    throw new Error('找不到 toggle root')
  return element
}

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
})

/** 语义色令牌在该元素上解到的颜色。 */
function resolveColor(token: string, scope: HTMLElement): string {
  const probe = document.createElement('span')
  probe.style.backgroundColor = `var(${token})`
  scope.append(probe)
  const value = getComputedStyle(probe).backgroundColor
  probe.remove()
  return value
}

describe('切换按钮视觉', () => {
  it.each([
    // solid 未按下时投 ghost 档：未按下且禁用是透明底
    { label: '缺省 subtle', variant: undefined, offDisabledToken: '--xh-bg-subtle' },
    { label: 'solid', variant: 'solid', offDisabledToken: null },
  ])('$label：禁用后保留按下面——按下且禁用的底色与未按下且禁用不同，也不再是可用时的按下面', ({ variant, offDisabledToken }) => {
    document.documentElement.dataset.theme = 'light'
    const offDisabled = mount({ variant, disabled: true })
    const offDisabledBg = getComputedStyle(offDisabled).backgroundColor
    const offDisabledFg = getComputedStyle(offDisabled).color
    expect(offDisabled.getAttribute('data-disabled')).toBe('')
    expect(offDisabled.getAttribute('data-state')).toBe('off')
    expect(offDisabledBg).toBe(offDisabledToken ? resolveColor(offDisabledToken, offDisabled) : 'rgba(0, 0, 0, 0)')
    expect(offDisabledFg).toBe(resolveColor('--xh-fg-disabled', offDisabled))
    app!.unmount()
    host!.remove()

    const onEnabled = mount({ variant, defaultPressed: true })
    const onEnabledBg = getComputedStyle(onEnabled).backgroundColor
    expect(onEnabled.getAttribute('data-state')).toBe('on')
    app!.unmount()
    host!.remove()

    const onDisabled = mount({ variant, defaultPressed: true, disabled: true })
    expect(onDisabled.getAttribute('data-disabled')).toBe('')
    expect(onDisabled.getAttribute('data-state')).toBe('on')
    expect(onDisabled.getAttribute('aria-pressed')).toBe('true')
    const onDisabledBg = getComputedStyle(onDisabled).backgroundColor
    // 选中信息不能只剩 aria-pressed：底色掺一半中性面，与未按下的禁用面分得开，
    // 也不能退成矩阵 disabled 列那副中性面（bg-subtle / 透明）
    expect(onDisabledBg, '按下且禁用与未按下且禁用同面').not.toBe(offDisabledBg)
    expect(onDisabledBg, '按下且禁用退成中性禁用面').not.toBe(resolveColor('--xh-bg-subtle', onDisabled))
    expect(onDisabledBg, '按下且禁用退成透明').not.toBe('rgba(0, 0, 0, 0)')
    // 但也确实降级了：不是可用时的按下面
    expect(onDisabledBg, '按下且禁用没有降级').not.toBe(onEnabledBg)
    // 前景保留按下面自己的前景，不落 fg-disabled
    expect(getComputedStyle(onDisabled).color).not.toBe(offDisabledFg)
  })
})
