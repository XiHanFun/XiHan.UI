import type { App, Ref } from 'vue'
import { getLayerRegistry } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import {
  XhCommandContent,
  XhCommandInput,
  XhCommandList,
  XhCommandRoot,
  XhTooltipContent,
  XhTooltipPositioner,
  XhTooltipRoot,
  XhTooltipTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

type Candidate = 'command' | 'tooltip'
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
    render: () => kind === 'command'
      ? h(XhCommandRoot, { open: open.value, modal: true }, () =>
          h(XhCommandContent, null, () => [h(XhCommandInput), h(XhCommandList)]))
      : h(XhTooltipRoot, { open: open.value }, () => [
          h(XhTooltipTrigger, null, () => '说明'),
          h(XhTooltipPositioner, null, () => h(XhTooltipContent, null, () => '提示内容')),
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

describe.each(['command', 'tooltip'] as const)('vue %s 真实退场资源', (scope) => {
  it('有限动画全部完成前保留 Layer，逻辑关闭立即失活，完成后释放', async () => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes test-command-tooltip-exit { from { opacity: 1 } to { opacity: 0 } }
      [data-scope='${scope}'][data-part='content'][data-state='closed'],
      [data-scope='${scope}'][data-part='backdrop'][data-state='closed'] {
        animation: test-command-tooltip-exit 60s linear forwards;
      }
    `
    document.body.append(style)
    const outside = document.createElement('button')
    document.body.append(outside)
    const open = await mount(scope)
    expect(getLayerRegistry(document).list()).toHaveLength(1)

    open.value = false
    await settle()
    const content = document.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='content']`)!
    expect(content.inert).toBe(true)
    expect(content.getAttribute('aria-hidden')).toBe('true')
    expect(getLayerRegistry(document).list()).toHaveLength(1)
    if (scope === 'command') {
      expect(document.body.style.overflow).toBe('hidden')
      expect(outside.inert).toBe(true)
    }
    const animations = [
      content,
      document.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='backdrop']`),
    ]
      .flatMap(node => node?.getAnimations() ?? [])
      .filter(animation => (animation as CSSAnimation).animationName === 'test-command-tooltip-exit')
    expect(animations).toHaveLength(scope === 'command' ? 2 : 1)

    animations[0]!.finish()
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(scope === 'command' ? 1 : 0)
    if (scope === 'command') {
      expect(document.body.style.overflow).toBe('hidden')
      expect(outside.inert).toBe(true)
      animations[1]!.finish()
      await settle()
      expect(getLayerRegistry(document).list()).toHaveLength(0)
      expect(document.body.style.overflow).not.toBe('hidden')
      expect(outside.inert).toBe(false)
    }
  })
})
