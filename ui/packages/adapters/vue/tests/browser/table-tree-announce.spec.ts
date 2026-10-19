// 树形表换位后表格自带的 live region 说放进了哪一层，位次与总数按那一层的兄弟行算：
// 改层级（Alt + 右键缩进）、层内换位（Alt + 上键）、移到根层（Alt + 左键）三种，真实键盘逐个按。
// 收件箱下面挂报价单、周报，归档是另一个根行；收件箱展开着。
import type { TableRowDef, TableRowMoveDetails } from '@xihan-ui/headless'
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, ref } from 'vue'
import { XhTableBody, XhTableCell, XhTableRoot, XhTableRow } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

const TREE: TableRowDef[] = [
  { id: 'inbox', expandable: true },
  { id: 'quote', parentId: 'inbox' },
  { id: 'weekly', parentId: 'inbox' },
  { id: 'archive', expandable: true },
]

function frames(count = 2): Promise<void> {
  return new Promise<void>((resolve) => {
    const step = (left: number): void => {
      if (left === 0)
        resolve()
      else requestAnimationFrame(() => step(left - 1))
    }
    step(count)
  })
}

async function mount(): Promise<void> {
  host = document.createElement('div')
  host.style.inlineSize = '360px'
  document.body.append(host)
  const rows = ref<TableRowDef[]>(TREE)
  app = createApp({
    render: () => h('div', [
      h('button', { 'type': 'button', 'data-test-start': '' }, '起点'),
      h(XhTableRoot, {
        'columns': [{ id: 'name', label: '名称' }],
        'rows': rows.value,
        'rowReorderable': true,
        'defaultExpandedValue': ['inbox'],
        'aria-label': '文件夹',
        'onRowMove': (details: TableRowMoveDetails) => {
          const byId = new Map(rows.value.map(row => [row.id, row]))
          rows.value = details.ids.map(id => (id === details.id ? { ...byId.get(id)!, parentId: details.parent ?? undefined } : byId.get(id)!))
        },
      }, () => h(XhTableBody, null, () => rows.value.map(row => h(XhTableRow, { key: row.id, value: row.id }, () => h(XhTableCell, { value: 'name' }, () => row.id))))),
    ]),
  })
  app.mount(host)
  await frames()
}

async function moveBy(downs: number, key: string): Promise<string> {
  host!.querySelector<HTMLElement>('[data-test-start]')!.focus()
  await userEvent.tab()
  for (let i = 0; i < downs; i++)
    await userEvent.keyboard('{ArrowDown}')
  await userEvent.keyboard(`{Alt>}{${key}}{/Alt}`)
  await frames(3)
  return host!.querySelector('[data-scope="table"][data-part="live-region"]')!.textContent ?? ''
}

describe('树形表换位播报（Vue）', () => {
  it('改层级：Alt + 右键把周报缩进到报价单下面', async () => {
    await mount()
    expect(await moveBy(2, 'ArrowRight')).toBe('Moved weekly into quote, position 1 of 1.')
  })

  it('层内换位：Alt + 上键在收件箱里往前挪一位，总数是收件箱里的兄弟行', async () => {
    await mount()
    expect(await moveBy(2, 'ArrowUp')).toBe('Moved weekly into inbox, position 1 of 2.')
  })

  it('移到根层：Alt + 左键把报价单退到收件箱后面', async () => {
    await mount()
    expect(await moveBy(1, 'ArrowLeft')).toBe('Moved quote into the top level, position 2 of 3.')
  })
})
