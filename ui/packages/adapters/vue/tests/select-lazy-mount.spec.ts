// @vitest-environment jsdom

import { onDiagnostic, resetDiagnostics, setDiagnosticsConsoleOutput, setDiagnosticsLevel } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhSelectContent,
  XhSelectControl,
  XhSelectItem,
  XhSelectItemText,
  XhSelectList,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTrigger,
  XhSelectValueText,
} from '../src'

// lazyMount：列表内容第一次展开时才挂载、之后常驻；打开前选中文字取自 collection，滚动条不报「找不到容器」。

const COLLECTION = [
  { value: 'apple', label: '苹果' },
  { value: 'banana', label: '香蕉' },
]

async function tick(): Promise<void> {
  await nextTick()
  await nextTick()
  await new Promise(r => setTimeout(r, 0))
  await nextTick()
}

let unmount: (() => void) | undefined
afterEach(() => {
  unmount?.()
  unmount = undefined
  document.body.innerHTML = ''
  resetDiagnostics()
})

function mount(lazyMount?: boolean) {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp({
    setup: () => () => h(XhSelectRoot, { collection: COLLECTION, defaultValue: 'apple', lazyMount }, () => [
      h(XhSelectControl, null, () => h(XhSelectTrigger, null, () => h(XhSelectValueText))),
      h(XhSelectPositioner, null, () => h(XhSelectContent, null, () => h(XhSelectList, null, () =>
        COLLECTION.map(node => h(XhSelectItem, { key: node.value, value: node.value }, () => h(XhSelectItemText, null, () => node.label)))))),
    ]),
  })
  app.mount(host)
  unmount = () => app.unmount()
  return {
    items: () => document.querySelectorAll('[data-scope="select"][data-part="item"]').length,
    trigger: () => document.querySelector<HTMLElement>('[data-scope="select"][data-part="trigger"]')!,
    valueText: () => document.querySelector('[data-scope="select"][data-part="value-text"]')!.textContent,
  }
}

describe('xhSelectRoot lazyMount', () => {
  it('缺省：收起态条目照常挂着', async () => {
    const m = mount()
    await tick()
    expect(m.items()).toBe(2)
  })

  it('打开前不挂条目，选中文字取自 collection；第一次展开挂上，收起后留着', async () => {
    setDiagnosticsLevel('warn')
    setDiagnosticsConsoleOutput(false)
    const seen: string[] = []
    const stop = onDiagnostic(d => seen.push(d.code))
    const m = mount(true)
    await tick()
    expect(m.items()).toBe(0)
    expect(m.valueText()).toBe('苹果')
    m.trigger().click()
    await tick()
    expect(m.items()).toBe(2)
    m.trigger().click()
    await tick()
    expect(m.items()).toBe(2)
    stop()
    expect(seen.filter(code => code.includes('scrollbar'))).toEqual([])
  })
})
