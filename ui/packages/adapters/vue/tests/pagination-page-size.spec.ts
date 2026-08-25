// @vitest-environment jsdom
// 每页条数从只读 prop 升成真状态。三件事要钉住：
// 一是向后兼容——只给 pageSize 仍然是受控，升级前后一字不差；
// 二是非受控——只给 defaultPageSize 时由组件自持；
// 三是换档时的页码换算：改档前第一条要仍留在页内，而不是被夹到别处。
import type { App } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import { XhPaginationRoot } from '../src'

let app: App | null = null

afterEach(() => {
  app?.unmount()
  app = null
  document.body.innerHTML = ''
})

interface Harness {
  api: () => {
    page: number
    pageSize: number
    pageSizeOptions: number[]
    totalPages: number
    setPageSize: (n: number) => void
    setPage: (n: number) => void
  }
}

function mount(props: Record<string, unknown>, listeners: Record<string, unknown> = {}): Harness {
  const host = document.createElement('div')
  document.body.append(host)
  let slot: Harness['api'] extends () => infer R ? R : never
  app = createApp({
    setup: () => () =>
      h(XhPaginationRoot, { ...props, ...listeners }, {
        default: (payload: never) => {
          slot = payload
          return []
        },
      }),
  })
  app.mount(host)
  return { api: () => slot }
}

async function tick(): Promise<void> {
  await nextTick()
  await nextTick()
}

describe('每页条数', () => {
  it('都不给时是 10，档位表是缺省那四档', () => {
    const h1 = mount({ count: 95 })
    expect(h1.api().pageSize).toBe(10)
    expect(h1.api().pageSizeOptions).toEqual([10, 20, 50, 100])
    expect(h1.api().totalPages).toBe(10)
  })

  it('只给 pageSize 仍是受控：组件不自改，只发意图', async () => {
    const onPageSizeChange = vi.fn()
    const harness = mount({ count: 95, pageSize: 20 }, { onPageSizeChange })
    expect(harness.api().pageSize).toBe(20)
    expect(harness.api().totalPages).toBe(5)

    harness.api().setPageSize(50)
    await tick()

    // 内部值一动不动，宿主没写回就还是 20
    expect(harness.api().pageSize).toBe(20)
    expect(onPageSizeChange).toHaveBeenCalledWith({ pageSize: 50, page: expect.any(Number) })
  })

  it('只给 defaultPageSize 时由组件自持', async () => {
    const harness = mount({ count: 95, defaultPageSize: 20 })
    expect(harness.api().pageSize).toBe(20)

    harness.api().setPageSize(50)
    await tick()
    expect(harness.api().pageSize).toBe(50)
    expect(harness.api().totalPages).toBe(2)
  })

  it('换档时改档前第一条仍留在页内，而不是被夹到别处', async () => {
    // 10 条一页看到第 5 页 = 第 41-50 条
    const harness = mount({ count: 95, defaultPageSize: 10, defaultPage: 5 })
    expect(harness.api().page).toBe(5)

    harness.api().setPageSize(50)
    await tick()

    // 夹取会给出第 2 页（第 51 条起），第 41 条就不见了；换算给出第 1 页（1-50 条）
    expect(harness.api().page).toBe(1)
    expect(harness.api().pageSize).toBe(50)
  })

  it('换算结果天然落在合法区间，不必再夹一次', async () => {
    // 10 条一页的第 10 页 = 第 91-95 条
    const harness = mount({ count: 95, defaultPageSize: 10, defaultPage: 10 })
    harness.api().setPageSize(20)
    await tick()

    // 第 91 条落在 20 条一页的第 5 页（81-95）
    expect(harness.api().page).toBe(5)
    expect(harness.api().totalPages).toBe(5)
  })

  it('换成同一档不发意图，也不动页码', async () => {
    const onPageSizeChange = vi.fn()
    const harness = mount({ count: 95, defaultPageSize: 10, defaultPage: 5 }, { onPageSizeChange })
    harness.api().setPageSize(10)
    await tick()

    expect(onPageSizeChange).not.toHaveBeenCalled()
    expect(harness.api().page).toBe(5)
  })

  it('档位表升序去重，每档至少 1', () => {
    const harness = mount({ count: 95, pageSizeOptions: [50, 10, 10, 0, -3, 20] })
    expect(harness.api().pageSizeOptions).toEqual([1, 10, 20, 50])
  })

  it('页码回调报出的每页条数是当下的档位，不是 prop 上那个', async () => {
    const onPageChange = vi.fn()
    const harness = mount({ count: 95, defaultPageSize: 10 }, { onPageChange })

    harness.api().setPageSize(20)
    await tick()
    onPageChange.mockClear()

    harness.api().setPage(3)
    await tick()
    expect(onPageChange).toHaveBeenCalledWith({ page: 3, pageSize: 20 })
  })
})
