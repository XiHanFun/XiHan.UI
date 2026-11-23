// @vitest-environment jsdom
// 默认全部展开与全部展开 / 收起：判据在 Headless，这里核 Vue 这一侧的接线——prop 透传、数据晚到、插槽载荷里的两个动作。
import type { TreeRootSlotProps } from '../src'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import { XhTreeRoot, XhTreeSelectRoot } from '../src'

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
  { value: 'src', label: '源码', children: [{ value: 'utils', label: '工具', children: [{ value: 'dom', label: 'dom' }] }] },
  { value: 'docs', label: '文档', children: [{ value: 'guide', label: '指南' }] },
  { value: 'license', label: '许可' },
]

function mount(render: () => ReturnType<typeof h>): void {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp({ setup: () => render })
  app.mount(host)
  cleanup.push(() => app.unmount())
}

/** 各分支此刻的展开态，按文档次序。 */
function expanded(scope: string): Array<[string, string | null]> {
  return [...document.querySelectorAll<HTMLElement>(`[data-scope="${scope}"][data-part="branch"]`)]
    .map(el => [el.getAttribute('data-value')!, el.getAttribute('aria-expanded')])
}

describe('xhTree 的全部展开', () => {
  it('defaultExpandAll：挂上即逐层展开，不发变更事件', async () => {
    const onChange = vi.fn()
    mount(() => h(XhTreeRoot, { collection: COLLECTION, defaultExpandAll: true, onExpandedValueChange: onChange }))
    await tick()

    expect(expanded('tree')).toEqual([['src', 'true'], ['utils', 'true'], ['docs', 'true']])
    expect(onChange).not.toHaveBeenCalled()
  })

  it('数据晚到：collection 先是空的，换上数据后才展开，并发一次变更事件', async () => {
    const data = ref<typeof COLLECTION>([])
    const onChange = vi.fn()
    mount(() => h(XhTreeRoot, { collection: data.value, defaultExpandAll: true, onExpandedValueChange: onChange }))
    await tick()
    expect(expanded('tree')).toEqual([])

    data.value = COLLECTION
    await tick()
    expect(expanded('tree')).toEqual([['src', 'true'], ['utils', 'true'], ['docs', 'true']])
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith({ value: ['src', 'utils', 'docs'] })
  })

  it('默认插槽的载荷带 expandAll / collapseAll', async () => {
    let scope!: TreeRootSlotProps
    mount(() => h(XhTreeRoot, { collection: COLLECTION }, {
      default: (payload: TreeRootSlotProps) => {
        scope = payload
        return null
      },
    }))
    await tick()
    expect(scope.expandedValue).toEqual([])

    scope.expandAll()
    await tick()
    expect(scope.expandedValue).toEqual(['src', 'utils', 'docs'])

    scope.collapseAll()
    await tick()
    expect(scope.expandedValue).toEqual([])
  })
})

describe('xhTreeSelect 的全部展开', () => {
  it('defaultExpandAll：浮层一开，树里的分支都是展开的', async () => {
    mount(() => h(XhTreeSelectRoot, { collection: COLLECTION, defaultExpandAll: true, defaultOpen: true }))
    await tick()

    expect(expanded('tree-select')).toEqual([['src', 'true'], ['utils', 'true'], ['docs', 'true']])
  })
})
