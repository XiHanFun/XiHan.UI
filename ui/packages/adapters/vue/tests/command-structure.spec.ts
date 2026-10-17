// @vitest-environment jsdom
// 不写默认插槽时照 commandStructure 铺：触发按钮与页脚给了插槽才铺，空态取插槽或 empty 文字，条目文字可由 item 插槽接管。
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { h, nextTick } from 'vue'
import { XhCommandRoot } from '../src'

const COLLECTION = [
  { value: 'page-users', label: '用户管理', group: 'nav' },
  { value: 'action-export', label: '导出报表', shortcut: 'Ctrl+E' },
]
const GROUPS = [{ value: 'nav', label: '页面' }]

afterEach(() => {
  document.body.innerHTML = ''
})

function part(name: string): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>(`[data-scope="command"][data-part="${name}"]`))
}

describe('command 的标准结构', () => {
  it('给了 trigger、footer、item 插槽时铺出触发按钮与页脚，item 插槽只接管条目文字；空态取 empty 文字', async () => {
    mount(() => h(XhCommandRoot, { collection: COLLECTION, groups: GROUPS, empty: '没有这条命令', defaultOpen: true }, {
      trigger: () => '打开命令',
      footer: () => '↵ 执行',
      item: (node: { label: string }) => `${node.label}…`,
    }), { attachTo: document.body })
    await nextTick()

    expect(part('trigger')[0]!.textContent).toBe('打开命令')
    expect(part('footer')[0]!.textContent).toBe('↵ 执行')
    expect(part('empty')[0]!.textContent).toBe('没有这条命令')
    expect(part('item-text').map(text => text.textContent)).toEqual(['用户管理…', '导出报表…'])
    expect(part('item-shortcut')[0]!.textContent).toBe('Ctrl+E')
  })

  it('不给 trigger、footer 时不铺；empty 插槽压过 empty 文字', async () => {
    mount(() => h(XhCommandRoot, { collection: COLLECTION, groups: GROUPS, empty: '没有这条命令', defaultOpen: true }, {
      empty: () => h('em', '换个词试试'),
    }), { attachTo: document.body })
    await nextTick()

    expect(part('trigger')).toHaveLength(0)
    expect(part('footer')).toHaveLength(0)
    expect(part('empty')[0]!.innerHTML).toBe('<em>换个词试试</em>')
  })
})
