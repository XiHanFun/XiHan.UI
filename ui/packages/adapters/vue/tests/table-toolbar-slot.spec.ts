// @vitest-environment jsdom
// 工具条与列设置区摆在 root 之外：root 是 role=grid，它的子节点只能是 row 与 rowgroup。
// Vue 侧因此另开一个 toolbar 插槽——写在默认插槽里的东西全都渲进 root。
import { describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'
import {
  XhTableColumnList,
  XhTableColumnVisibilityTrigger,
  XhTableRoot,
  XhTableToolbar,
} from '../src'

const ROWS = [{ id: 'a' }]
const COLUMNS = [
  { id: 'n', label: '名称' },
  { id: 'o', label: '负责人' },
]

interface Slot {
  columns: Array<{ id: string }>
  columnSettings: Array<{ id: string, label?: string, hidden: boolean, toggleable: boolean }>
  setColumnSticky: (id: string, sticky: boolean | 'start' | 'end') => void
}

function mount(props: Record<string, unknown> = {}) {
  const host = document.createElement('div')
  document.body.append(host)
  let payload!: Slot
  const app = createApp({
    render: () => h(XhTableRoot, { rows: ROWS, columns: COLUMNS, ...props }, {
      toolbar: (p: Slot) => {
        payload = p
        return [
          h(XhTableToolbar, null, () => [
            h(XhTableColumnList, null, () => p.columnSettings.map(col =>
              h(XhTableColumnVisibilityTrigger, { key: col.id, value: col.id }),
            )),
          ]),
        ]
      },
      default: () => [],
    }),
  })
  app.mount(host)
  const q = (part: string): HTMLElement | null => host.querySelector(`[data-part="${part}"]`)
  return {
    host,
    q,
    slot: () => payload,
    triggers: () => [...host.querySelectorAll<HTMLElement>('[data-part="column-visibility-trigger"]')],
    done: () => {
      app.unmount()
      host.remove()
    },
  }
}

describe('工具条插槽', () => {
  it('渲成 root 的兄弟排在表前，不落进 role=grid 里面', () => {
    const m = mount()
    const toolbar = m.q('toolbar')!
    const root = m.q('root')!
    expect(toolbar).toBeTruthy()
    expect(root.contains(toolbar)).toBe(false)
    expect(toolbar.compareDocumentPosition(root) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    m.done()
  })

  it('不写这个插槽就一个节点都不渲：老用法不受影响', () => {
    const host = document.createElement('div')
    document.body.append(host)
    const app = createApp({ render: () => h(XhTableRoot, { rows: ROWS, columns: COLUMNS }, () => []) })
    app.mount(host)
    expect(host.querySelector('[data-part="toolbar"]')).toBeNull()
    app.unmount()
    host.remove()
  })

  it('载荷与默认插槽同一份，列设置里藏起来的列也在', () => {
    const m = mount({ defaultColumnPreference: { hidden: ['o'] } })
    expect(m.slot().columns.map(c => c.id)).toEqual(['n'])
    expect(m.slot().columnSettings.map(c => c.id)).toEqual(['n', 'o'])
    expect(typeof m.slot().setColumnSticky).toBe('function')
    m.done()
  })
})

describe('列设置区里的显隐把手', () => {
  it('列身份由自己的 value 声明——设置区里没有列标题可跟', () => {
    const m = mount()
    expect(m.q('column-list')!.getAttribute('role')).toBe('group')
    expect(m.triggers().map(el => el.getAttribute('data-value'))).toEqual(['n', 'o'])
    m.done()
  })

  it('点一下把那一列从生效列里摘掉，设置区里它还在', async () => {
    const m = mount()
    m.triggers()[1]!.click()
    await Promise.resolve()
    expect(m.slot().columns.map(c => c.id)).toEqual(['n'])
    expect(m.slot().columnSettings.map(c => c.hidden)).toEqual([false, true])
    m.done()
  })
})
