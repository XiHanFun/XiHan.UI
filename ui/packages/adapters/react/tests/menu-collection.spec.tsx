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
  it('标记位、文字、说明与快捷键按数据铺，未提供的那几个不铺对应部件', async () => {
    await mountCollection([
      { value: 'copy', label: '复制', indicator: '✓', description: '连同格式', shortcut: '⌘ C' },
      { value: 'paste', label: '粘贴' },
    ])
    expect(partNames()).toEqual([
      'trigger',
      'positioner',
      'content',
      'item',
      'item-indicator',
      'item-text',
      'item-description',
      'item-shortcut',
      // 什么都没写的那条只剩文字
      'item',
      'item-text',
    ])
    const shortcut = document.body.querySelector('[data-part="item-shortcut"]')!
    expect(shortcut.textContent).toBe('⌘ C')
    // 快捷键是纯装饰：可及名由条目文字承担
    expect(shortcut.getAttribute('aria-hidden')).toBe('true')
    expect(shortcut.getAttribute('data-xh-collection-slot')).toBe('shortcut')
  })

  it('renderItemPrefix 只接管行首那一格，说明与快捷键照旧由数据铺；它压过数据里的 indicator', async () => {
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
    await act(async () => root!.render(
      <XhMenuRoot
        collection={[{ value: 'copy', label: '复制', indicator: '✓', description: '连同格式', shortcut: '⌘ C' }]}
        trigger="操作"
        renderItemPrefix={node => <svg data-icon={node.value} />}
      />,
    ))
    expect(partNames()).toEqual([
      'trigger',
      'positioner',
      'content',
      'item',
      'item-indicator',
      'item-text',
      'item-description',
      'item-shortcut',
    ])
    expect(document.body.querySelector('[data-part="item-indicator"] svg')?.getAttribute('data-icon')).toBe('copy')
  })

  it('renderItemSuffix 落行尾那一格，排在快捷键之后', async () => {
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
    await act(async () => root!.render(
      <XhMenuRoot
        collection={[{ value: 'inbox', label: '收件箱', shortcut: '⌘ 1' }]}
        trigger="操作"
        renderItemSuffix={() => <span>12</span>}
      />,
    ))
    expect(partNames()).toEqual([
      'trigger',
      'positioner',
      'content',
      'item',
      'item-text',
      'item-shortcut',
      'item-suffix',
    ])
    const suffix = document.body.querySelector('[data-part="item-suffix"]')!
    expect(suffix.textContent).toBe('12')
    expect(suffix.getAttribute('data-xh-collection-slot')).toBe('suffix')
  })

  it('写了 renderItem 就整条交给作者：代铺的说明与快捷键都不再出现', async () => {
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
    await act(async () => root!.render(
      <XhMenuRoot
        collection={[{ value: 'copy', label: '复制', description: '连同格式', shortcut: '⌘ C' }]}
        trigger="操作"
        renderItem={node => <b>{node.label}</b>}
      />,
    ))
    expect(partNames()).toEqual(['trigger', 'positioner', 'content', 'item'])
    expect(document.body.querySelector('[data-part="item"]')?.innerHTML).toBe('<b>复制</b>')
  })

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
      'item-text',
      'item',
      'item-text',
      // 领头一个分组的那条，分隔线画在 group 外面
      'separator',
      'group',
      'group-label',
      'item',
      'item-text',
      'item',
      'item-text',
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
      'item-text',
      'group',
      'group-label',
      'item',
      'item-text',
      'item',
      'item-text',
    ])
  })

  it('同组内部写的分隔标记留在组里，不跑到 group 外面', async () => {
    await mountCollection([
      { value: 'compact', label: '紧凑', group: 'density', groupLabel: '行高' },
      { value: 'comfortable', label: '宽松', group: 'density', separatorBefore: true },
    ])
    const group = document.body.querySelector('[data-part="group"]')!
    expect(partNames(group)).toEqual(['group-label', 'item', 'item-text', 'separator', 'item', 'item-text'])
  })

  it('首条上的分隔标记不产出分隔线', async () => {
    await mountCollection([{ value: 'copy', label: '复制', separatorBefore: true }])
    expect(partNames()).toEqual(['trigger', 'positioner', 'content', 'item', 'item-text'])
  })
})
