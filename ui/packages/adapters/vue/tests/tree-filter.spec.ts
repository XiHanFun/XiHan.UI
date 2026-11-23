// @vitest-environment jsdom
// 树的关键词过滤：裁剪与搜索视图在 Headless，这里核 Vue 这一侧的接线——filterText 透传、标准结构跟着裁、载荷里的 searching。
import type { TreeRootSlotProps } from '../src'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import { XhTreeRoot } from '../src'

async function tick(): Promise<void> {
  await nextTick()
  await nextTick()
  await new Promise(r => setTimeout(r, 0))
  await nextTick()
}

let cleanup: Array<() => void> = []

afterEach(() => {
  for (const fn of cleanup) fn()
  cleanup = []
  document.body.innerHTML = ''
})

const COLLECTION = [
  { value: 'src', label: 'Source', children: [{ value: 'index', label: 'Index' }, { value: 'utils', label: 'Utils' }] },
  { value: 'docs', label: 'Docs', children: [{ value: 'guide', label: 'Guide' }] },
  { value: 'license', label: 'License' },
]

const NODES = '[data-scope="tree"]:is([data-part="branch"], [data-part="item"])'
const DOCS = '[data-scope="tree"][data-part="branch"][data-value="docs"]'

function mount(render: () => ReturnType<typeof h>): void {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp({ setup: () => render })
  app.mount(host)
  cleanup.push(() => app.unmount())
}

/** 此刻铺出来的节点值，按文档次序。 */
function nodes(): string[] {
  return [...document.querySelectorAll<HTMLElement>(NODES)].map(el => el.getAttribute('data-value')!)
}

describe('xhTree 的 filterText', () => {
  it('标准结构跟着检索词裁：只铺命中的那几枝，祖先展开；清空即铺回整棵', async () => {
    const keyword = ref('')
    mount(() => h(XhTreeRoot, { collection: COLLECTION, filterText: keyword.value }))
    await tick()
    expect(nodes()).toEqual(['src', 'index', 'utils', 'docs', 'guide', 'license'])

    keyword.value = 'guide'
    await tick()
    expect(nodes()).toEqual(['docs', 'guide'])
    expect(document.querySelector(DOCS)!.getAttribute('aria-expanded')).toBe('true')

    keyword.value = ''
    await tick()
    expect(nodes()).toEqual(['src', 'index', 'utils', 'docs', 'guide', 'license'])
    expect(document.querySelector(DOCS)!.getAttribute('aria-expanded')).toBe('false')
  })

  it('默认插槽的载荷带 searching', async () => {
    let scope!: TreeRootSlotProps
    mount(() => h(XhTreeRoot, { collection: COLLECTION, filterText: 'utils' }, {
      default: (payload: TreeRootSlotProps) => {
        scope = payload
        return null
      },
    }))
    await tick()
    expect(scope.searching).toBe(true)
    expect(scope.visibleNodes.map(node => node.value)).toEqual(['src', 'utils'])
  })
})
