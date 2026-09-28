import type { CollectionVirtualizer } from '@xihan-ui/headless'
import type { XhComboboxElement } from '../../src/elements/combobox'
import type { XhListboxElement } from '../../src/elements/listbox'
import type { XhTransferElement } from '../../src/elements/transfer'
import type { XhTreeSelectElement } from '../../src/elements/tree-select'
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
  document.getElementById('xh-portal-root')?.remove()
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

  it('transfer 自绘滚动条接管每侧 virtualizer viewport', async () => {
    const stage = document.createElement('div')
    stage.dataset.test = 'collection-virtualizer'
    stage.innerHTML = `
      <xh-transfer>
        <div data-xh-part="root">
          <div data-xh-part="source-panel"><div data-xh-part="list"><div id="transfer-virtual-viewport" style="block-size:100px;overflow:auto"><div style="block-size:1000px"></div></div></div></div>
          <button data-xh-part="to-target-trigger"></button>
          <div data-xh-part="target-panel"><div data-xh-part="list"></div></div>
        </div>
      </xh-transfer>
    `
    document.body.append(stage)
    const viewport = stage.querySelector<HTMLElement>('#transfer-virtual-viewport')!
    const transfer = stage.querySelector<XhTransferElement>('xh-transfer')!
    const bridge: CollectionVirtualizer = {
      count: 1,
      scrollToIndex: () => {},
      focusIndex: () => {},
      getRenderedItemRoots: () => [],
      getViewportElement: () => viewport,
    }
    transfer.collection = [{ value: 'one', label: '一' }]
    transfer.virtualizers = { source: bridge }
    transfer.requestUpdate()
    await expect.poll(() => viewport.hasAttribute('data-xh-scrollbar')).toBe(true)
    expect(getComputedStyle(viewport).scrollbarWidth).toBe('none')
  })

  it('transfer 虚拟化视口与竖向滚动条铺满列表内容区', async () => {
    const stage = document.createElement('div')
    stage.dataset.test = 'collection-virtualizer'
    stage.innerHTML = `
      <xh-transfer>
        <div data-xh-part="root" style="inline-size:640px">
          <div data-xh-part="source-panel">
            <div data-xh-part="panel-header"><span data-xh-part="panel-title">待选权限</span></div>
            <input data-xh-part="search">
            <div data-xh-part="list">
              <xh-virtualizer count="1000" estimate-size="36" viewport-tab-index="-1" style="display:contents">
                <div data-xh-part="root">
                  <div data-xh-part="viewport"><div data-xh-part="content"></div></div>
                </div>
              </xh-virtualizer>
            </div>
          </div>
          <button data-xh-part="to-target-trigger"></button>
          <button data-xh-part="to-source-trigger"></button>
          <div data-xh-part="target-panel"><div data-xh-part="list"></div></div>
        </div>
      </xh-transfer>
    `
    document.body.append(stage)

    const transfer = stage.querySelector<XhTransferElement>('xh-transfer')!
    const virtualizer = stage.querySelector<XhVirtualizerElement>('xh-virtualizer')!
    await expect.poll(() => virtualizer.collectionVirtualizer != null).toBe(true)
    transfer.collection = collection
    transfer.virtualizers = { source: virtualizer.collectionVirtualizer! }
    transfer.requestUpdate()

    const list = stage.querySelector<HTMLElement>('[data-scope="transfer"][data-part="list"][data-side="source"]')!
    const viewport = stage.querySelector<HTMLElement>('[data-scope="virtualizer"][data-part="viewport"]')!
    await expect.poll(() => list.hasAttribute('data-xh-virtualized')).toBe(true)
    await expect.poll(() => viewport.hasAttribute('data-xh-scrollbar')).toBe(true)

    const verticalBar = [...stage.querySelectorAll<HTMLElement>('[data-scope="scrollbar"][data-part="root"][data-orientation="vertical"]')]
      .find(bar => !bar.hasAttribute('data-native'))!
    const listRect = list.getBoundingClientRect()
    const viewportRect = viewport.getBoundingClientRect()
    const barRect = verticalBar.getBoundingClientRect()
    expect(viewportRect.height).toBeCloseTo(listRect.height, 1)
    expect(barRect.top).toBeCloseTo(listRect.top, 1)
    expect(barRect.bottom).toBeCloseTo(listRect.bottom, 1)
  })

  it('tree-select 跨 Light-DOM 宿主只挂窗口里的行，End 把焦点交给末行，自绘条接管视口', async () => {
    const stage = document.createElement('div')
    stage.dataset.test = 'collection-virtualizer'
    stage.innerHTML = `
      <xh-tree-select default-open>
        <div data-xh-part="root">
          <div data-xh-part="control"><button data-xh-part="trigger">选择</button></div>
          <div data-xh-part="positioner"><div data-xh-part="content">
            <div data-xh-part="tree" style="overflow: visible; max-block-size: none">
              <xh-virtualizer count="1000" estimate-size="36" overscan="0" viewport-tab-index="-1">
                <div data-xh-part="root"><div data-xh-part="viewport" style="block-size: 144px"><div data-xh-part="content"></div></div></div>
              </xh-virtualizer>
            </div>
          </div></div>
        </div>
      </xh-tree-select>
    `
    document.body.append(stage)
    const treeSelect = stage.querySelector<XhTreeSelectElement>('xh-tree-select')!
    const virtualizer = stage.querySelector<XhVirtualizerElement>('xh-virtualizer')!
    const content = virtualizer.querySelector<HTMLElement>('[data-xh-part="content"]')!
    treeSelect.collection = collection
    const render = (virtualItems: readonly { index: number, key: string | number }[]): void => {
      content.replaceChildren(...virtualItems.map((virtualItem) => {
        const shell = document.createElement('div')
        shell.dataset.xhPart = 'item'
        shell.setAttribute('value', String(virtualItem.index))
        shell.style.blockSize = '36px'
        const row = document.createElement('div')
        row.dataset.xhPart = 'item'
        row.dataset.xhPartOwner = 'tree-select'
        row.setAttribute('value', collection[virtualItem.index]!.value)
        const text = document.createElement('span')
        text.dataset.xhPart = 'item-text'
        text.textContent = collection[virtualItem.index]!.label
        row.append(text)
        shell.append(row)
        return shell
      }))
      virtualizer.requestUpdate()
      const bridge = virtualizer.collectionVirtualizer
      if (bridge) {
        treeSelect.virtualizer = bridge
        treeSelect.requestUpdate()
      }
    }
    virtualizer.addEventListener('range-change', event => render((event as CustomEvent).detail.virtualItems))
    await expect.poll(() => virtualizer.collectionVirtualizer != null).toBe(true)
    render(virtualizer.virtualItems)

    const rows = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>('[data-scope="tree-select"][data-part="item"]')]
    await expect.poll(() => rows().length).toBeGreaterThan(0)
    expect(rows().length).toBeLessThan(20)
    const tree = document.querySelector<HTMLElement>('[data-scope="tree-select"][data-part="tree"]')!
    tree.focus()
    tree.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true }))
    await expect.poll(() => document.activeElement?.getAttribute('data-value')).toBe('item-1000')
    await expect.poll(() => (document.activeElement as HTMLElement).getAttribute('aria-posinset')).toBe('1000')
    expect(rows().length).toBeLessThan(20)
    const viewport = virtualizer.querySelector<HTMLElement>('[data-scope="virtualizer"][data-part="viewport"]')!
    expect(viewport.scrollTop).toBeGreaterThan(0)
    await expect.poll(() => viewport.hasAttribute('data-xh-scrollbar')).toBe(true)
  })

  it('combobox 滚动后仍铺满 viewport，不留下半面空白', async () => {
    const stage = document.createElement('div')
    stage.dataset.test = 'collection-virtualizer'
    stage.innerHTML = `
      <xh-combobox open-on-click placeholder="搜索城市">
        <div data-xh-part="root">
          <label data-xh-part="label">城市</label>
          <div data-xh-part="control"><input data-xh-part="input"><button data-xh-part="trigger"></button></div>
          <div data-xh-part="positioner"><div data-xh-part="content" style="overflow:visible;max-block-size:none">
            <xh-virtualizer id="combobox-test-virtualizer" count="100" estimate-size="36" viewport-tab-index="-1">
              <div data-xh-part="root"><div data-xh-part="viewport" style="block-size:240px"><div data-xh-part="content"></div></div></div>
            </xh-virtualizer>
          </div><div data-xh-part="empty">无匹配城市</div></div>
        </div>
      </xh-combobox>
    `
    document.body.append(stage)
    const combobox = stage.querySelector<XhComboboxElement>('xh-combobox')!
    const virtualizer = stage.querySelector<XhVirtualizerElement>('xh-virtualizer')!
    const content = virtualizer.querySelector<HTMLElement>('[data-xh-part="content"]')!
    const cities = Array.from({ length: 100 }, (_, index) => ({ value: `city-${index + 1}`, label: `城市 ${index + 1}` }))
    combobox.collection = cities
    const render = (virtualItems: readonly { index: number, key: string | number }[]): void => {
      content.replaceChildren(...virtualItems.map((virtualItem) => {
        const shell = document.createElement('div')
        shell.dataset.xhPart = 'item'
        shell.setAttribute('value', String(virtualItem.index))
        shell.style.blockSize = '36px'
        const option = document.createElement('div')
        option.dataset.xhPart = 'item'
        option.dataset.xhPartOwner = 'combobox'
        option.setAttribute('value', cities[virtualItem.index]!.value)
        const text = document.createElement('span')
        text.dataset.xhPart = 'item-text'
        text.textContent = cities[virtualItem.index]!.label
        option.append(text)
        shell.append(option)
        return shell
      }))
      virtualizer.requestUpdate()
      const bridge = virtualizer.collectionVirtualizer
      if (bridge) {
        combobox.virtualizer = bridge
        combobox.requestUpdate()
      }
    }
    virtualizer.addEventListener('range-change', event => render((event as CustomEvent).detail.virtualItems))
    await expect.poll(() => virtualizer.collectionVirtualizer != null).toBe(true)
    render(virtualizer.virtualItems)
    const input = stage.querySelector<HTMLInputElement>('[data-xh-part="input"]')!
    input.click()
    const viewport = virtualizer.querySelector<HTMLElement>('[data-scope="virtualizer"][data-part="viewport"]')!
    await expect.poll(() => viewport.clientHeight).toBe(240)
    viewport.scrollTop = 828
    viewport.dispatchEvent(new Event('scroll'))
    const visibleItems = (): HTMLElement[] => {
      const bounds = viewport.getBoundingClientRect()
      return [...document.querySelectorAll<HTMLElement>('[data-scope="combobox"][data-part="item"]')]
        .filter((item) => {
          const rect = item.getBoundingClientRect()
          return rect.bottom > bounds.top && rect.top < bounds.bottom
        })
    }
    await expect.poll(() => visibleItems().length).toBeGreaterThanOrEqual(6)
    expect(visibleItems()[0]!.textContent).toBe('城市 24')
  })
})
