// 取色器的常驻形态与最近使用色：取色面直接铺在页面里时是静态内容面，不抢焦点、不播浮层进场；
// 焦点离开取色面即一轮取色结束，最近使用色的格子跟着出现。计算样式与真实的焦点移动只能在 Chromium 里看。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhColorPickerAreaThumb,
  XhColorPickerContent,
  XhColorPickerHueSlider,
  XhColorPickerLabel,
  XhColorPickerRecentSwatchPicker,
  XhColorPickerRoot,
  XhColorPickerSaturationArea,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const SCOPE = `[data-scope='color-picker']`

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

async function mount(): Promise<{ root: HTMLElement, content: HTMLElement, thumb: HTMLElement, recent: HTMLElement, after: HTMLButtonElement }> {
  host = document.createElement('div')
  document.body.prepend(host)
  app = createApp({
    render: () => [
      h(XhColorPickerRoot, { inline: true, defaultValue: '#3b82f6' }, () => [
        h(XhColorPickerLabel, null, () => '主题色'),
        h(XhColorPickerContent, null, () => [
          h(XhColorPickerSaturationArea, null, () => [h(XhColorPickerAreaThumb)]),
          h(XhColorPickerHueSlider),
          h(XhColorPickerRecentSwatchPicker),
        ]),
      ]),
      h('button', { type: 'button' }, '之后'),
    ],
  })
  app.mount(host)
  await nextTick()
  await new Promise(resolve => requestAnimationFrame(resolve))
  return {
    root: host.querySelector<HTMLElement>(`${SCOPE}[data-part='root']`)!,
    content: host.querySelector<HTMLElement>(`${SCOPE}[data-part='content']`)!,
    thumb: host.querySelector<HTMLElement>(`${SCOPE}[data-part='area-thumb']`)!,
    recent: host.querySelector<HTMLElement>(`${SCOPE}[data-part='recent-swatch-picker']`)!,
    after: host.querySelector<HTMLButtonElement>('button')!,
  }
}

function tokenPx(name: string): string {
  const probe = document.createElement('div')
  probe.style.borderRadius = `var(${name})`
  document.body.append(probe)
  const value = getComputedStyle(probe).borderTopLeftRadius
  probe.remove()
  return value
}

describe('color-picker 常驻形态（Chromium）', () => {
  it('取色面是静态内容面：surface 圆角、不落影、不播浮层进场，挂载时不抢焦点', async () => {
    const { root, content } = await mount()
    const style = getComputedStyle(content)
    expect(content.getBoundingClientRect().height).toBeGreaterThan(0)
    expect(style.borderTopLeftRadius).toBe(tokenPx('--xh-shape-surface'))
    expect(style.boxShadow).toBe('none')
    expect(style.animationName).toBe('none')
    expect(content.getAttribute('role')).toBe('group')
    expect(content.contains(document.activeElement)).toBe(false)
    // 根跟着取色面走，不再取字段缺省宽
    expect(Math.round(root.getBoundingClientRect().width)).toBe(Math.round(content.getBoundingClientRect().width))
  })

  it('键盘改色后焦点离开取色面，最近使用色的格子出现', async () => {
    const { thumb, recent, after } = await mount()
    expect(recent.hidden).toBe(true)
    thumb.focus()
    await userEvent.keyboard('{ArrowDown}{ArrowDown}')
    await nextTick()
    expect(recent.hidden).toBe(true)
    after.focus()
    await nextTick()
    expect(recent.hidden).toBe(false)
    expect(recent.querySelectorAll(`[data-scope='color-swatch-picker'][data-part='item']`)).toHaveLength(1)
    expect(getComputedStyle(recent).display).not.toBe('none')
  })
})
