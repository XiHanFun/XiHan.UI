// 颜色选择器的 lazyMount / unmountOnExit 要在真浏览器里验：打开前面板不在；
// Enter 展开那一帧面板才挂上，焦点照样进到面板里；退场动画得真播完才卸；inline 常驻形态不受影响。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick, ref } from 'vue'
import { XhColorPickerRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
})

function part(name: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-scope='color-picker'][data-part='${name}']`)
}

const areas = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>(`[data-scope='color-picker'][data-part='saturation-area']`)]

function mount(props: Record<string, unknown>): { open: ReturnType<typeof ref<boolean>> } {
  host = document.createElement('div')
  document.body.append(host)
  const open = ref(false)
  app = createApp({
    render: () => h(XhColorPickerRoot, {
      'label': '主题色',
      'defaultValue': '#3366ff',
      ...props,
      ...(props.inline ? {} : { 'open': open.value, 'onUpdate:open': (v: boolean) => { open.value = v } }),
    }),
  })
  app.mount(host)
  return { open }
}

describe('颜色选择器 lazyMount', () => {
  it('第一次展开前面板不在；Enter 展开后面板挂上、焦点进到面板里，收起后留着', async () => {
    const t = mount({ lazyMount: true })
    await nextTick()
    expect(part('content')).not.toBeNull()
    expect(areas()).toHaveLength(0)

    part('trigger')!.focus()
    await userEvent.keyboard('{Enter}')
    await expect.poll(() => part('content')!.contains(document.activeElement)).toBe(true)
    expect(areas()).toHaveLength(1)

    t.open.value = false
    await expect.poll(() => getComputedStyle(part('content')!).display).toBe('none')
    expect(areas()).toHaveLength(1)
  })

  it('inline 常驻形态：面板首屏就在', async () => {
    mount({ inline: true, lazyMount: true, unmountOnExit: true })
    await nextTick()
    expect(areas()).toHaveLength(1)
  })
})

describe('颜色选择器 unmountOnExit', () => {
  it('退场播完才撤面板，下次展开重新铺上', async () => {
    const t = mount({ unmountOnExit: true })
    t.open.value = true
    await expect.poll(() => areas().length).toBe(1)
    const first = areas()[0]
    await expect.poll(() => part('positioner')!.hasAttribute('data-positioned')).toBe(true)

    t.open.value = false
    await nextTick()
    // 退场正在播：面板还在
    expect(areas()[0]).toBe(first)
    await expect.poll(() => areas().length).toBe(0)
    expect(getComputedStyle(part('content')!).display).toBe('none')

    t.open.value = true
    await expect.poll(() => areas().length).toBe(1)
    expect(areas()[0]).not.toBe(first)
  })
})
