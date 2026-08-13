// @vitest-environment jsdom
//
// 空态占位在 Vue 侧由 Content 内部无条件渲染，作者一个字都不用写。
// WC 是 Light DOM、解剖归作者，两端因此曾经分叉：同一份标记在 Vue 上有 empty、在 WC 上没有，
// 逐帧比对整套红。这里钉住 WC 侧的补节点行为，以及「作者写了就不抢」这条边界。
import type { CascaderNode } from '@xihan-ui/headless'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface Updatable extends HTMLElement { updateComplete: Promise<unknown> }

beforeEach(() => {
  document.body.innerHTML = ''
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: false, media: q, addEventListener: () => {}, removeEventListener: () => {} }))
})

async function settle(el: Updatable): Promise<void> {
  await el.updateComplete
  await el.updateComplete
  await new Promise(r => setTimeout(r, 0))
  await el.updateComplete
}

const COLLECTION: CascaderNode[] = [
  { value: 'zhejiang', label: 'Zhejiang', children: [{ value: 'hangzhou', label: 'Hangzhou' }] },
]

/** 不含 empty 的标记：这一份就是分叉发生的形状。 */
const MARKUP = `
  <div data-xh-part="root">
    <span data-xh-part="label">归属地</span>
    <button data-xh-part="trigger">
      <span data-xh-part="value-text"></span>
      <span data-xh-part="indicator"></span>
    </button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="column" level="0">
          <div data-xh-part="item" value='["zhejiang"]'><span data-xh-part="item-text">Zhejiang</span></div>
        </div>
      </div>
    </div>
  </div>
`

interface MountOptions {
  collection?: CascaderNode[]
  translations?: Record<string, string>
  markup?: string
}

function mount(options: MountOptions = {}): Updatable {
  const el = document.createElement('xh-cascader') as Updatable & {
    collection?: CascaderNode[]
    translations?: Record<string, string>
  }
  el.innerHTML = options.markup ?? MARKUP
  el.collection = options.collection ?? COLLECTION
  if (options.translations)
    el.translations = options.translations
  document.body.appendChild(el)
  return el
}

function empties(el: HTMLElement): HTMLElement[] {
  return Array.from(el.querySelectorAll<HTMLElement>('[data-xh-part="empty"]'))
}

function empty(el: HTMLElement): HTMLElement {
  return empties(el)[0]!
}

describe('标记里没写空态占位', () => {
  it('元素补一个出来，挂在 content 末尾并带上解剖标记', async () => {
    const el = mount()
    await settle(el)

    expect(empties(el)).toHaveLength(1)
    const node = empty(el)
    expect(node.parentElement?.getAttribute('data-xh-part')).toBe('content')
    expect(node.parentElement?.lastElementChild).toBe(node)
    expect(node.getAttribute('data-scope')).toBe('cascader')
    expect(node.getAttribute('data-part')).toBe('empty')
  })

  it('有数据时收着', async () => {
    const el = mount()
    await settle(el)

    expect(empty(el).hasAttribute('hidden')).toBe(true)
  })

  it('collection 为空时露面并填缺省文案', async () => {
    const el = mount({ collection: [] })
    await settle(el)

    expect(empty(el).hasAttribute('hidden')).toBe(false)
    expect(empty(el).textContent).toBe('No data')
  })

  it('translations 覆盖缺省文案', async () => {
    const el = mount({ collection: [], translations: { empty: '暂无数据' } })
    await settle(el)

    expect(empty(el).textContent).toBe('暂无数据')
  })

  /** 每一轮更新都补一个的话，DOM 里会攒出一串占位，两端的部件计数也就再也对不齐。 */
  it('多轮更新只补一次', async () => {
    const el = mount() as Updatable & { collection?: CascaderNode[] }
    await settle(el)
    el.collection = []
    await settle(el)
    el.collection = COLLECTION
    await settle(el)

    expect(empties(el)).toHaveLength(1)
  })
})

describe('作者自己写了空态占位', () => {
  const AUTHORED = MARKUP.replace(
    '</div>\n    </div>\n  </div>',
    '</div>\n        <div data-xh-part="empty">自己的空态</div>\n      </div>\n    </div>\n  </div>',
  )

  it('用作者那份，不另建', async () => {
    const el = mount({ collection: [], markup: AUTHORED })
    await settle(el)

    expect(empties(el)).toHaveLength(1)
    expect(empty(el).textContent).toBe('自己的空态')
  })

  it('作者的文案不被缺省文案盖掉，露不露面照旧归连接层', async () => {
    const el = mount({ collection: [], markup: AUTHORED })
    await settle(el)

    expect(empty(el).textContent).toBe('自己的空态')
    expect(empty(el).hasAttribute('hidden')).toBe(false)
  })
})
