// @vitest-environment jsdom
// 前缀列（序号 / 多选 / 展开）由库插在最前面并**占住列号**。
//
// 不占的话右侧所有列的 aria-colindex 会整体串位——而这正是使用者手工往 columns 里
// 塞假列的原因：不塞就串位，塞了每处都要自己维护，漏一处就错。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhTableBody,
  XhTableCell,
  XhTableColumnHeader,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
} from '../src'

let app: App | null = null

afterEach(() => {
  app?.unmount()
  app = null
  document.body.innerHTML = ''
})

const columns = [
  { id: 'name', label: '名称' },
  { id: 'owner', label: '负责人' },
]
const rows = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]

interface Slot {
  columns: Array<{ id: string, kind: string }>
  rowNumber: (id: string) => string
}

function mount(props: Record<string, unknown>): () => Slot {
  const host = document.createElement('div')
  document.body.append(host)
  let payload!: Slot
  app = createApp({
    setup: () => () =>
      h(XhTableRoot, { columns, rows, ...props }, {
        default: (p: Slot) => {
          payload = p
          return [
            h(XhTableHeader, null, () => [
              h(XhTableRow, { value: '__head__' }, () =>
                p.columns.map(c => h(XhTableColumnHeader, { key: c.id, value: c.id }, () => c.id))),
            ]),
            h(XhTableBody, null, () =>
              rows.map(row =>
                h(XhTableRow, { key: row.id, value: row.id }, () =>
                  p.columns.map(c =>
                    h(XhTableCell, { key: c.id, value: c.id, row: row.id }, () =>
                      c.kind === 'index' ? p.rowNumber(row.id) : row.id),
                  )),
              )),
          ]
        },
      }),
  })
  app.mount(host)
  return () => payload
}

function colIndexes(): Array<string | null> {
  return [...document.querySelectorAll<HTMLElement>('[data-scope="table"][data-part="column-header"]')]
    .map(el => el.getAttribute('aria-colindex'))
}

async function tick(): Promise<void> {
  await nextTick()
  await nextTick()
}

describe('前缀列', () => {
  it('不要前缀列时，生效列与作者给的一模一样', async () => {
    const slot = mount({})
    await tick()
    expect(slot().columns.map(c => c.id)).toEqual(['name', 'owner'])
    expect(slot().columns.every(c => c.kind === 'data')).toBe(true)
    expect(colIndexes()).toEqual(['1', '2'])
  })

  it('前缀列插在最前面并占住列号：数据列整体后移', async () => {
    const slot = mount({ prefixColumns: ['index', 'select'] })
    await tick()

    expect(slot().columns.map(c => c.kind)).toEqual(['index', 'select', 'data', 'data'])
    // 两列前缀占掉 1、2，作者的列从 3 起——不占的话它们仍是 1、2，右侧全串位
    expect(colIndexes()).toEqual(['1', '2', '3', '4'])
  })

  it('按给定顺序插，不是固定顺序', async () => {
    const slot = mount({ prefixColumns: ['select', 'index'] })
    await tick()
    expect(slot().columns.map(c => c.kind)).toEqual(['select', 'index', 'data', 'data'])
  })

  it('序号是分页全局序号：第二页不会又从 1 开始', async () => {
    const slot = mount({ prefixColumns: ['index'], page: 3, pageSize: 10 })
    await tick()
    expect([slot().rowNumber('a'), slot().rowNumber('b'), slot().rowNumber('c')])
      .toEqual(['21', '22', '23'])
  })

  it('不给 page/pageSize 时退回可见序', async () => {
    const slot = mount({ prefixColumns: ['index'] })
    await tick()
    expect([slot().rowNumber('a'), slot().rowNumber('c')]).toEqual(['1', '3'])
  })

  it('树形用大纲编号，不是分页序号', async () => {
    const slot = mount({
      prefixColumns: ['index'],
      page: 3,
      pageSize: 10,
      rows: [{ id: 'a' }, { id: 'a1', parentId: 'a' }, { id: 'b' }],
      defaultExpanded: ['a'],
    })
    await tick()
    // 页偏移只对平表的「第几条」有意义；大纲编号说的是层级位置
    expect([slot().rowNumber('a'), slot().rowNumber('a1'), slot().rowNumber('b')])
      .toEqual(['1', '1.1', '2'])
  })
})
