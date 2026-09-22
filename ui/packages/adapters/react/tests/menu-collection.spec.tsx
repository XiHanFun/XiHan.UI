// @vitest-environment jsdom
//
// 只交 collection 时代铺的那棵树：分组段收进 group、段首的分隔线落在 group 外面。
// 与 Vue 侧的 menu-collection 同一组判据，两端产出同一棵 DOM。
import type { MenuNode } from '@xihan-ui/headless'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { XhMenuRoot } from '../src'

let host: HTMLElement | null = null
let root: ReturnType<typeof createRoot> | null = null

afterEach(async () => {
  await act(async () => root?.unmount())
  host?.remove()
  document.body.innerHTML = ''
  root = null
  host = null
})

async function mountCollection(collection: MenuNode[]): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  await act(async () => root!.render(<XhMenuRoot collection={collection} trigger="操作" />))
}

/** 部件名序列，按文档顺序；positioner 搬到了 portal 落点，所以从整篇文档取件。 */
function partNames(scope: ParentNode = document.body): (string | null)[] {
  return [...scope.querySelectorAll('[data-scope="menu"][data-part]')].map(el => el.getAttribute('data-part'))
}

describe('menu 的 collection', () => {
  it('相邻同 group 的条目收进同一个 group，标题取本组首个写了 groupLabel 的那条', async () => {
    await mountCollection([
      { value: 'compact', label: '紧凑', group: 'density', groupLabel: '行高' },
      { value: 'comfortable', label: '宽松', group: 'density' },
      { value: 'sidebar', label: '侧栏', group: 'panels', groupLabel: '面板', separatorBefore: true },
      { value: 'inspector', label: '属性面板', group: 'panels' },
    ])
    expect(partNames()).toEqual([
      'trigger',
      'positioner',
      'content',
      'group',
      'group-label',
      'item',
      'item',
      // 领头一个分组的那条，分隔线画在 group 外面
      'separator',
      'group',
      'group-label',
      'item',
      'item',
    ])
    const labelEls = [...document.body.querySelectorAll('[data-part="group-label"]')]
    expect(labelEls.map(el => el.textContent)).toEqual(['行高', '面板'])
    const groups = [...document.body.querySelectorAll('[data-part="group"]')]
    expect(groups.map(el => el.getAttribute('aria-labelledby'))).toEqual(labelEls.map(el => el.id))
  })

  it('没写 group 的条目直接落在 content 上，与分组段互不影响', async () => {
    await mountCollection([
      { value: 'undo', label: '撤销' },
      { value: 'compact', label: '紧凑', group: 'density', groupLabel: '行高' },
      { value: 'reset', label: '重置' },
    ])
    expect(partNames()).toEqual([
      'trigger',
      'positioner',
      'content',
      'item',
      'group',
      'group-label',
      'item',
      'item',
    ])
  })

  it('同组内部写的分隔标记留在组里，不跑到 group 外面', async () => {
    await mountCollection([
      { value: 'compact', label: '紧凑', group: 'density', groupLabel: '行高' },
      { value: 'comfortable', label: '宽松', group: 'density', separatorBefore: true },
    ])
    const group = document.body.querySelector('[data-part="group"]')!
    expect(partNames(group)).toEqual(['group-label', 'item', 'separator', 'item'])
  })

  it('首条上的分隔标记不产出分隔线', async () => {
    await mountCollection([{ value: 'copy', label: '复制', separatorBefore: true }])
    expect(partNames()).toEqual(['trigger', 'positioner', 'content', 'item'])
  })
})
