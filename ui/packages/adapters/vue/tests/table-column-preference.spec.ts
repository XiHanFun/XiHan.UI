// @vitest-environment jsdom
// 列偏好在组件上的表现：受控/非受控两态，以及四个写入口真的改到生效列。
//
// 库只管把偏好算进生效列，存到哪儿归使用者——存 localStorage、存后端、跟着用户
// 设置同步都是应用的事。这条界线正是「只给能力与接口、不做设置面板」的意思。
import type { App } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhTableRoot } from '../src'

let app: App | null = null

afterEach(() => {
  app?.unmount()
  app = null
  document.body.innerHTML = ''
})

const columns = [
  { id: 'name', label: '名称' },
  { id: 'owner', label: '负责人' },
  { id: 'status', label: '状态' },
]

interface Slot {
  columns: Array<{ id: string }>
  columnPreference: Record<string, unknown>
  setColumnHidden: (id: string, hidden: boolean) => void
  moveColumn: (id: string, to: number) => void
  setColumnWidth: (id: string, w: number | string) => void
  setColumnPreference: (next?: Record<string, unknown>) => void
}

function mount(props: Record<string, unknown> = {}, listeners: Record<string, unknown> = {}): () => Slot {
  const host = document.createElement('div')
  document.body.append(host)
  let payload!: Slot
  app = createApp({
    setup: () => () =>
      h(XhTableRoot, { columns, rows: [{ id: 'a' }], ...props, ...listeners }, {
        default: (p: Slot) => {
          payload = p
          return []
        },
      }),
  })
  app.mount(host)
  return () => payload
}

async function tick(): Promise<void> {
  await nextTick()
  await nextTick()
}

describe('列偏好', () => {
  it('不给就是作者给的原顺序', async () => {
    const slot = mount()
    await tick()
    expect(slot().columns.map(c => c.id)).toEqual(['name', 'owner', 'status'])
    expect(slot().columnPreference).toEqual({})
  })

  it('非受控：藏一列即生效', async () => {
    const slot = mount({ defaultColumnPreference: {} })
    await tick()

    slot().setColumnHidden('owner', true)
    await tick()
    expect(slot().columns.map(c => c.id)).toEqual(['name', 'status'])
    expect(slot().columnPreference.hidden).toEqual(['owner'])
  })

  it('挪列写出的是一份完整列序，不是只记挪动过的那几个', async () => {
    // 只记一部分的话，作者改了 columns 的原始顺序之后，两份顺序拼起来的结果
    // 依赖于合并算法的细节，谁也说不清最终是什么样
    const slot = mount()
    await tick()

    slot().moveColumn('status', 0)
    await tick()
    expect(slot().columnPreference.order).toEqual(['status', 'name', 'owner'])
    expect(slot().columns.map(c => c.id)).toEqual(['status', 'name', 'owner'])
  })

  it('改列宽落进偏好，也落进生效列', async () => {
    const slot = mount()
    await tick()

    slot().setColumnWidth('name', 240)
    await tick()
    expect(slot().columnPreference.widths).toEqual({ name: 240 })
    expect((slot().columns[0] as { width?: number }).width).toBe(240)
  })

  it('受控：不自改，只发意图', async () => {
    const onColumnPreferenceChange = vi.fn()
    const slot = mount({ columnPreference: { hidden: ['status'] } }, { onColumnPreferenceChange })
    await tick()
    expect(slot().columns.map(c => c.id)).toEqual(['name', 'owner'])

    slot().setColumnHidden('owner', true)
    await tick()
    // 宿主没写回，生效列一动不动
    expect(slot().columns.map(c => c.id)).toEqual(['name', 'owner'])
    expect(onColumnPreferenceChange).toHaveBeenCalledWith({
      value: { hidden: ['status', 'owner'] },
    })
  })

  it('整份换掉；不给即清空回原样', async () => {
    const slot = mount()
    await tick()

    slot().setColumnPreference({ hidden: ['name'], order: ['status'] })
    await tick()
    expect(slot().columns.map(c => c.id)).toEqual(['status', 'owner'])

    slot().setColumnPreference()
    await tick()
    expect(slot().columns.map(c => c.id)).toEqual(['name', 'owner', 'status'])
  })
})
