// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest'
import { createApp, defineComponent, h, nextTick } from 'vue'
import {
  provideXhConfig,
  XhCascaderContent,
  XhCascaderPositioner,
  XhCascaderRoot,
  XhColorPickerContent,
  XhColorPickerPositioner,
  XhColorPickerRoot,
  XhComboboxContent,
  XhComboboxPositioner,
  XhComboboxRoot,
  XhDatePickerContent,
  XhDatePickerPositioner,
  XhDatePickerRoot,
  XhMentionContent,
  XhMentionPositioner,
  XhMentionRoot,
  XhSelectContent,
  XhSelectPositioner,
  XhSelectRoot,
  XhTimePickerContent,
  XhTimePickerPositioner,
  XhTimePickerRoot,
  XhTreeSelectContent,
  XhTreeSelectPositioner,
  XhTreeSelectRoot,
} from '../src'

let unmount: (() => void) | undefined

afterEach(() => {
  unmount?.()
  unmount = undefined
  document.body.innerHTML = ''
})

const CASES = [
  ['cascader', XhCascaderRoot, XhCascaderPositioner, XhCascaderContent],
  ['color-picker', XhColorPickerRoot, XhColorPickerPositioner, XhColorPickerContent],
  ['combobox', XhComboboxRoot, XhComboboxPositioner, XhComboboxContent],
  ['date-picker', XhDatePickerRoot, XhDatePickerPositioner, XhDatePickerContent],
  ['mention', XhMentionRoot, XhMentionPositioner, XhMentionContent],
  ['select', XhSelectRoot, XhSelectPositioner, XhSelectContent],
  ['time-picker', XhTimePickerRoot, XhTimePickerPositioner, XhTimePickerContent],
  ['tree-select', XhTreeSelectRoot, XhTreeSelectPositioner, XhTreeSelectContent],
] as const

describe.each(CASES)('vue %s 实例 Portal 容器', (scope, Root, Positioner, Content) => {
  it('实例容器优先于应用级容器', async () => {
    const configured = document.createElement('div')
    const instance = document.createElement('div')
    document.body.append(configured, instance)
    const host = document.createElement('div')
    document.body.append(host)
    const app = createApp(defineComponent({
      setup() {
        provideXhConfig({ portalContainer: () => configured })
        return () => h(Root as never, { open: true }, () => [
          h(Positioner as never, { container: instance }, () => h(Content as never)),
        ])
      },
    }))
    app.mount(host)
    unmount = () => app.unmount()
    await nextTick()
    await nextTick()

    const positioner = document.querySelector<HTMLElement>(`[data-scope="${scope}"][data-part="positioner"]`)!
    expect(instance.contains(positioner)).toBe(true)
    expect(configured.contains(positioner)).toBe(false)
  })
})
