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
  XhDatePickerCalendar,
  XhDatePickerContent,
  XhDatePickerControl,
  XhDatePickerPositioner,
  XhDatePickerRoot,
  XhMentionContent,
  XhMentionInput,
  XhMentionPositioner,
  XhMentionRoot,
  XhTimePickerContent,
  XhTimePickerControl,
  XhTimePickerPositioner,
  XhTimePickerRoot,
  XhTimePickerTrigger,
  XhTreeSelectContent,
  XhTreeSelectControl,
  XhTreeSelectPositioner,
  XhTreeSelectRoot,
  XhTreeSelectTree,
  XhTreeSelectTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

type Candidate = 'cascader' | 'combobox' | 'date-picker' | 'time-picker' | 'tree-select'

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
    render: () => {
      if (kind === 'cascader') {
        return h(XhCascaderRoot, { open: open.value, collection: [] }, () => [
          h(XhCascaderControl, null, () => h(XhCascaderTrigger, null, () => '选择路径')),
          h(XhCascaderPositioner, null, () => h(XhCascaderContent)),
        ])
      }
      if (kind === 'date-picker') {
        return h(XhDatePickerRoot, { open: open.value }, () => [
          h(XhDatePickerControl),
          h(XhDatePickerPositioner, null, () => h(XhDatePickerContent, null, () => h(XhDatePickerCalendar))),
        ])
      }
      if (kind === 'time-picker') {
        return h(XhTimePickerRoot, { open: open.value, defaultValue: '09:30' }, () => [
          h(XhTimePickerControl, null, () => h(XhTimePickerTrigger, null, () => '选择时间')),
          h(XhTimePickerPositioner, null, () => h(XhTimePickerContent)),
        ])
      }
      if (kind === 'tree-select') {
        return h(XhTreeSelectRoot, { open: open.value, collection: [] }, () => [
          h(XhTreeSelectControl, null, () => h(XhTreeSelectTrigger, null, () => '选择节点')),
          h(XhTreeSelectPositioner, null, () => h(XhTreeSelectContent, null, () => h(XhTreeSelectTree))),
        ])
      }
      return h(XhComboboxRoot, { open: open.value, collection: [] }, () => [
        h(XhComboboxControl, null, () => h(XhComboboxInput)),
        h(XhComboboxPositioner, null, () => h(XhComboboxContent)),
      ])
    },
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

describe.each(['cascader', 'combobox', 'date-picker', 'time-picker', 'tree-select'] as const)('vue %s 真实退场资源', (scope) => {
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

describe('vue mention 真实退场资源', () => {
  it('有限动画完成前保留 Layer，逻辑关闭立即失活，完成后释放', async () => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes test-mention-exit { from { opacity: 1 } to { opacity: 0 } }
      [data-scope='mention'][data-part='content'][data-state='closed'] {
        animation: test-mention-exit 60s linear forwards;
      }
    `
    document.body.append(style)
    host = document.createElement('div')
    document.body.append(host)
    app = createApp({
      render: () => h(XhMentionRoot, null, () => [
        h(XhMentionInput),
        h(XhMentionPositioner, null, () => h(XhMentionContent)),
      ]),
    })
    app.mount(host)
    await settle()
    const input = document.querySelector<HTMLInputElement>(`[data-scope='mention'][data-part='input']`)!
    input.value = '@a'
    input.setSelectionRange(2, 2)
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(1)

    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    await settle()
    const content = document.querySelector<HTMLElement>(`[data-scope='mention'][data-part='content']`)!
    expect(content.inert).toBe(true)
    expect(content.getAttribute('aria-hidden')).toBe('true')
    expect(getLayerRegistry(document).list()).toHaveLength(1)
    const animation = content.getAnimations().find(item => (item as CSSAnimation).animationName === 'test-mention-exit')
    expect(animation).toBeDefined()

    animation!.finish()
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(0)
  })
})
