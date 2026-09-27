import type { CollectionVirtualizer, VirtualizerItemState } from '@xihan-ui/headless'
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'
import {
  XhListboxContent,
  XhListboxItem,
  XhListboxItemIndicator,
  XhListboxItemText,
  XhListboxRoot,
  XhVirtualizerContent,
  XhVirtualizerItem,
  XhVirtualizerRoot,
  XhVirtualizerViewport,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const collection = Array.from({ length: 1000 }, (_, index) => ({
  value: `item-${index + 1}`,
  label: `条目 ${index + 1}`,
}))

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

describe('collectionVirtualizer 正式接线', () => {
  it('只挂载窗口条目，End 仍跨完整 collection 并把焦点交给末项', async () => {
    host = document.createElement('div')
    document.body.appendChild(host)
    app = createApp({
      render: () => h(XhVirtualizerRoot, {
        count: collection.length,
        estimateSize: 36,
        overscan: 0,
        viewportTabIndex: -1,
      }, {
        default: ({ virtualItems, collectionVirtualizer }: { virtualItems: readonly VirtualizerItemState[], collectionVirtualizer: CollectionVirtualizer }) => h(XhListboxRoot, {
          collection,
          virtualizer: collectionVirtualizer,
        }, () => h(XhListboxContent, { style: { overflow: 'visible', maxBlockSize: 'none' } }, () => [
          h(XhVirtualizerViewport, { style: { blockSize: '144px' } }, () => h(XhVirtualizerContent, null, () =>
            virtualItems.map(item => h(XhVirtualizerItem, {
              key: item.key,
              value: item.index,
              style: { blockSize: '36px' },
            }, () => h(XhListboxItem, { value: collection[item.index]!.value }, () => [
              h(XhListboxItemText, null, () => collection[item.index]!.label),
              h(XhListboxItemIndicator),
            ]))))),
        ])),
      }),
    })
    app.mount(host)

    const options = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>('[data-scope="listbox"][data-part="item"]')]
    await expect.poll(() => options().length).toBeGreaterThan(0)
    expect(options().length).toBeLessThan(20)

    const content = document.querySelector<HTMLElement>('[data-scope="listbox"][data-part="content"]')!
    content.focus()
    await expect.poll(() => document.activeElement?.getAttribute('data-value')).toBe('item-1')
    document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true }))

    await expect.poll(() => document.activeElement?.getAttribute('data-value')).toBe('item-1000')
    const last = document.activeElement as HTMLElement
    expect(last.getAttribute('aria-posinset')).toBe('1000')
    expect(last.getAttribute('aria-setsize')).toBe('1000')
    expect(options().length).toBeLessThan(20)
    expect(document.querySelector<HTMLElement>('[data-scope="virtualizer"][data-part="viewport"]')!.scrollTop).toBeGreaterThan(0)
  })
})
