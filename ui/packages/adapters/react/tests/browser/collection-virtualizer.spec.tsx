import type { Root } from 'react-dom/client'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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

const collection = Array.from({ length: 1000 }, (_, index) => ({ value: `item-${index + 1}`, label: `条目 ${index + 1}` }))
let root: Root | null = null
let host: HTMLElement | null = null

beforeEach(() => vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true))
afterEach(() => {
  act(() => root?.unmount())
  root = null
  host?.remove()
  host = null
  vi.unstubAllGlobals()
})

describe('collectionVirtualizer 正式接线', () => {
  it('react 只挂窗口条目，End 仍把焦点交给完整集合末项', async () => {
    host = document.createElement('div')
    document.body.appendChild(host)
    root = createRoot(host)
    await act(async () => root!.render(
      <XhVirtualizerRoot count={collection.length} estimateSize={36} overscan={0} viewportTabIndex={-1}>
        {({ virtualItems, collectionVirtualizer }) => (
          <XhListboxRoot collection={collection} virtualizer={collectionVirtualizer}>
            <XhListboxContent style={{ overflow: 'visible', maxBlockSize: 'none' }}>
              <XhVirtualizerViewport style={{ blockSize: 144 }}>
                <XhVirtualizerContent>
                  {virtualItems.map(item => (
                    <XhVirtualizerItem key={item.key} value={item.index} style={{ blockSize: 36 }}>
                      <XhListboxItem value={collection[item.index]!.value}>
                        <XhListboxItemText>{collection[item.index]!.label}</XhListboxItemText>
                        <XhListboxItemIndicator />
                      </XhListboxItem>
                    </XhVirtualizerItem>
                  ))}
                </XhVirtualizerContent>
              </XhVirtualizerViewport>
            </XhListboxContent>
          </XhListboxRoot>
        )}
      </XhVirtualizerRoot>,
    ))

    const options = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>('[data-scope="listbox"][data-part="item"]')]
    await expect.poll(() => options().length).toBeGreaterThan(0)
    expect(options().length).toBeLessThan(20)
    const content = document.querySelector<HTMLElement>('[data-scope="listbox"][data-part="content"]')!
    act(() => content.focus())
    await expect.poll(() => document.activeElement?.getAttribute('data-value')).toBe('item-1')
    await act(async () => document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true })))
    await expect.poll(() => document.activeElement?.getAttribute('data-value')).toBe('item-1000')
    expect((document.activeElement as HTMLElement).getAttribute('aria-posinset')).toBe('1000')
    expect(options().length).toBeLessThan(20)
  })
})
