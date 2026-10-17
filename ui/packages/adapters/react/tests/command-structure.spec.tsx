// @vitest-environment jsdom
//
// 命令面板不写 children 时照标准结构铺：trigger、empty、footer 给了才归作者，renderItem 只接管条目文字。
import type { CommandGroup, CommandNode } from '@xihan-ui/headless'
import type { ReactNode } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { XhCommandRoot } from '../src'

let host: HTMLElement | null = null
let root: ReturnType<typeof createRoot> | null = null

afterEach(async () => {
  await act(async () => root?.unmount())
  host?.remove()
  document.body.innerHTML = ''
  root = null
  host = null
})

async function mount(node: ReactNode): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  await act(async () => root!.render(node))
}

function part(name: string): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>(`[data-scope="command"][data-part="${name}"]`))
}

const COLLECTION: CommandNode[] = [
  { value: 'page-users', label: '用户管理', group: 'nav' },
  { value: 'action-export', label: '导出报表', shortcut: 'Ctrl+E' },
]
const GROUPS: CommandGroup[] = [{ value: 'nav', label: '页面' }]

describe('command 的标准结构', () => {
  it('trigger、empty、footer 放进对应部件；renderItem 只接管条目文字', async () => {
    await mount(
      <XhCommandRoot
        collection={COLLECTION}
        groups={GROUPS}
        defaultOpen
        trigger="打开命令"
        empty={<em>没有这条命令</em>}
        footer="↵ 执行"
        renderItem={node => `${node.label}…`}
      />,
    )

    expect(part('trigger')[0]!.textContent).toBe('打开命令')
    expect(part('empty')[0]!.innerHTML).toBe('<em>没有这条命令</em>')
    expect(part('footer')[0]!.textContent).toBe('↵ 执行')
    expect(part('item-text').map(text => text.textContent)).toEqual(['用户管理…', '导出报表…'])
  })

  it('不给 trigger、footer 时不铺；展开时遮罩、定位层与面板都在', async () => {
    await mount(<XhCommandRoot collection={COLLECTION} groups={GROUPS} defaultOpen />)

    expect(part('trigger')).toHaveLength(0)
    expect(part('footer')).toHaveLength(0)
    expect([part('backdrop'), part('positioner'), part('content')].map(list => list.length)).toEqual([1, 1, 1])
  })
})
