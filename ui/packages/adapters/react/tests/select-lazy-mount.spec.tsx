// @vitest-environment jsdom
// lazyMount：列表内容第一次展开时才挂载、之后常驻；打开前选中文字取自 collection。
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
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

const COLLECTION = [
  { value: 'apple', label: '苹果' },
  { value: 'banana', label: '香蕉' },
]

let root: ReturnType<typeof createRoot> | null = null

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
})

afterEach(() => {
  act(() => root?.unmount())
  root = null
  document.body.innerHTML = ''
})

async function mount(lazyMount?: boolean) {
  const host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => {
    root!.render(
      <XhSelectRoot collection={COLLECTION} defaultValue="apple" lazyMount={lazyMount}>
        <XhSelectControl><XhSelectTrigger><XhSelectValueText /></XhSelectTrigger></XhSelectControl>
        <XhSelectPositioner>
          <XhSelectContent>
            <XhSelectList>
              {COLLECTION.map(node => <XhSelectItem key={node.value} value={node.value}><XhSelectItemText>{node.label}</XhSelectItemText></XhSelectItem>)}
            </XhSelectList>
          </XhSelectContent>
        </XhSelectPositioner>
      </XhSelectRoot>,
    )
  })
  return {
    items: () => document.querySelectorAll('[data-scope="select"][data-part="item"]').length,
    valueText: () => document.querySelector('[data-scope="select"][data-part="value-text"]')!.textContent,
    toggle: async () => {
      await act(async () => {
        document.querySelector<HTMLElement>('[data-scope="select"][data-part="trigger"]')!.click()
      })
      await act(async () => {
        await new Promise(r => setTimeout(r, 0))
      })
    },
  }
}

describe('xhSelectRoot lazyMount', () => {
  it('缺省：收起态条目照常挂着', async () => {
    const m = await mount()
    expect(m.items()).toBe(2)
  })

  it('打开前不挂条目，选中文字取自 collection；第一次展开挂上，收起后留着', async () => {
    const m = await mount(true)
    expect(m.items()).toBe(0)
    expect(m.valueText()).toBe('苹果')
    await m.toggle()
    expect(m.items()).toBe(2)
    await m.toggle()
    expect(m.items()).toBe(2)
  })
})
