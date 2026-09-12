import type { App, Ref } from 'vue'
import { getLayerRegistry } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import {
  XhCascaderContent,
  XhCascaderControl,
  XhCascaderPositioner,
  XhCascaderRoot,
  XhCascaderTrigger,
  XhComboboxContent,
  XhComboboxControl,
  XhComboboxInput,
  XhComboboxPositioner,
  XhComboboxRoot,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

type Candidate = 'cascader' | 'combobox'

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
    render: () => kind === 'cascader'
      ? h(XhCascaderRoot, { open: open.value, collection: [] }, () => [
          h(XhCascaderControl, null, () => h(XhCascaderTrigger, null, () => '选择路径')),
          h(XhCascaderPositioner, null, () => h(XhCascaderContent)),
        ])
      : h(XhComboboxRoot, { open: open.value, collection: [] }, () => [
          h(XhComboboxControl, null, () => h(XhComboboxInput)),
          h(XhComboboxPositioner, null, () => h(XhComboboxContent)),
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

describe.each(['cascader', 'combobox'] as const)('vue %s 真实退场资源', (scope) => {
  it('有限动画完成前保留 Layer，逻辑关闭立即失活，完成后释放', async () => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes test-candidate-exit { from { opacity: 1 } to { opacity: 0 } }
      [data-scope='${scope}'][data-part='content'][data-state='closed'] {
        animation: test-candidate-exit 60s linear forwards;
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
    const animation = content.getAnimations().find(item => (item as CSSAnimation).animationName === 'test-candidate-exit')
    expect(animation).toBeDefined()

    animation!.finish()
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(0)
  })
})
