import type { App, Ref } from 'vue'
import { getLayerRegistry } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import {
  XhColorPickerContent,
  XhColorPickerControl,
  XhColorPickerPositioner,
  XhColorPickerRoot,
  XhColorPickerTrigger,
  XhHoverCardContent,
  XhHoverCardPositioner,
  XhHoverCardRoot,
  XhHoverCardTitle,
  XhHoverCardTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

type Candidate = 'color-picker' | 'hover-card'

let app: App | null = null
let host: HTMLElement | null = null

async function settle(): Promise<void> {
  await nextTick()
  await nextTick()
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

async function mount(kind: Candidate): Promise<Ref<boolean>> {
  const open = ref(true)
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => kind === 'color-picker'
      ? h(XhColorPickerRoot, { open: open.value, defaultValue: '#ff0000' }, () => [
          h(XhColorPickerControl, null, () => h(XhColorPickerTrigger, null, () => '选择颜色')),
          h(XhColorPickerPositioner, null, () => h(XhColorPickerContent)),
        ])
      : h(XhHoverCardRoot, { open: open.value }, () => [
          h(XhHoverCardTrigger, null, () => '资料'),
          h(XhHoverCardPositioner, null, () => h(XhHoverCardContent, null, () => h(XhHoverCardTitle, null, () => '标题'))),
        ]),
  })
  app.mount(host)
  await settle()
  return open
}

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  document.body.innerHTML = ''
})

describe.each(['color-picker', 'hover-card'] as const)('vue %s 真实退场资源', (scope) => {
  it('有限动画完成前保留 Layer，逻辑关闭立即失活，完成后释放', async () => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes test-color-hover-exit { from { opacity: 1 } to { opacity: 0 } }
      [data-scope='${scope}'][data-part='content'][data-state='closed'] {
        animation: test-color-hover-exit 60s linear forwards;
      }
    `
    document.body.append(style)
    const open = await mount(scope)
    expect(getLayerRegistry(document).list()).toHaveLength(1)

    open.value = false
    await settle()
    const content = document.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='content']`)!
    expect(content.inert).toBe(true)
    expect(content.getAttribute('aria-hidden')).toBe('true')
    expect(getLayerRegistry(document).list()).toHaveLength(1)
    const animation = content.getAnimations().find(item => (item as CSSAnimation).animationName === 'test-color-hover-exit')
    expect(animation).toBeDefined()

    animation!.finish()
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(0)
  })
})
