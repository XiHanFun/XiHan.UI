import type { XhListboxElement } from '../../src/elements/listbox'
import type { XhVirtualizerElement } from '../../src/elements/virtualizer'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

const collection = Array.from({ length: 1000 }, (_, index) => ({ value: `item-${index + 1}`, label: `条目 ${index + 1}` }))

afterEach(() => {
  document.body.querySelectorAll('[data-test="collection-virtualizer"]')
    .forEach(node => node.remove())
})

describe('collectionVirtualizer 正式接线', () => {
  it('web Components 跨 Light-DOM 宿主只挂窗口条目，并把 End 焦点交给末项', async () => {
    const stage = document.createElement('div')
    stage.dataset.test = 'collection-virtualizer'
    stage.innerHTML = `
      <xh-listbox>
        <div data-xh-part="root">
          <span data-xh-part="label">长列表</span>
          <div data-xh-part="content" style="overflow: visible; max-block-size: none">
            <xh-virtualizer count="1000" estimate-size="36" overscan="0" viewport-tab-index="-1">
              <div data-xh-part="root">
                <div data-xh-part="viewport" style="block-size: 144px">
                  <div data-xh-part="content"></div>
                </div>
              </div>
            </xh-virtualizer>
          </div>
        </div>
      </xh-listbox>
    `
    document.body.append(stage)
    const listbox = stage.querySelector<XhListboxElement>('xh-listbox')!
    const virtualizer = stage.querySelector<XhVirtualizerElement>('xh-virtualizer')!
    const content = virtualizer.querySelector<HTMLElement>('[data-xh-part="content"]')!
    listbox.collection = collection

    const render = (virtualItems: readonly { index: number, key: string | number }[]): void => {
      content.replaceChildren(...virtualItems.map((virtualItem) => {
        const shell = document.createElement('div')
        shell.dataset.xhPart = 'item'
        shell.setAttribute('value', String(virtualItem.index))
        shell.style.blockSize = '36px'
        const option = document.createElement('div')
        option.dataset.xhPart = 'item'
        option.dataset.xhPartOwner = 'listbox'
        option.setAttribute('value', collection[virtualItem.index]!.value)
        const text = document.createElement('span')
        text.dataset.xhPart = 'item-text'
        text.textContent = collection[virtualItem.index]!.label
        const indicator = document.createElement('span')
        indicator.dataset.xhPart = 'item-indicator'
        option.append(text, indicator)
        shell.append(option)
        return shell
      }))
      virtualizer.requestUpdate()
      const bridge = virtualizer.collectionVirtualizer
      if (bridge) {
        listbox.virtualizer = bridge
        listbox.requestUpdate()
      }
    }
    virtualizer.addEventListener('range-change', event => render((event as CustomEvent).detail.virtualItems))
    await expect.poll(() => virtualizer.collectionVirtualizer != null).toBe(true)
    render(virtualizer.virtualItems)

    const options = (): HTMLElement[] => [...stage.querySelectorAll<HTMLElement>('[data-scope="listbox"][data-part="item"]')]
    await expect.poll(() => options().length).toBeGreaterThan(0)
    expect(options().length).toBeLessThan(20)
    const list = stage.querySelector<HTMLElement>('[data-scope="listbox"][data-part="content"]')!
    list.focus()
    await expect.poll(() => document.activeElement?.getAttribute('data-value')).toBe('item-1')
    document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true }))
    await expect.poll(() => document.activeElement?.getAttribute('data-value')).toBe('item-1000')
    await expect.poll(() => (document.activeElement as HTMLElement).getAttribute('aria-posinset')).toBe('1000')
    expect(options().length).toBeLessThan(20)
  })
})
