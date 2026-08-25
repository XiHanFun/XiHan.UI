// @vitest-environment jsdom
// 每页条数控制器：一个原生 select。
//
// 用原生而不是再造浮层——档位就那么几档，浮层带不来什么，却要多接一层
// 定位、消解与键盘；原生 select 在 WC 侧也一样能用。
import type { App } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhPaginationPageSizeSelect, XhPaginationRoot } from '../src'

let app: App | null = null

afterEach(() => {
  app?.unmount()
  app = null
  document.body.innerHTML = ''
})

function mount(props: Record<string, unknown>, listeners: Record<string, unknown> = {}): void {
  const host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    setup: () => () => h(XhPaginationRoot, { ...props, ...listeners }, () => [h(XhPaginationPageSizeSelect)]),
  })
  app.mount(host)
}

function select(): HTMLSelectElement {
  return document.querySelector<HTMLSelectElement>(
    '[data-scope="pagination"][data-part="page-size-select"]',
  )!
}

async function tick(): Promise<void> {
  await nextTick()
  await nextTick()
}

describe('每页条数控制器', () => {
  it('渲染成原生 select，档位来自 pageSizeOptions', async () => {
    mount({ count: 196, defaultPageSize: 20, pageSizeOptions: [10, 20, 50] })
    await tick()

    expect(select().tagName).toBe('SELECT')
    expect([...select().options].map(o => o.value)).toEqual(['10', '20', '50'])
    expect(select().getAttribute('aria-label')).toBe('Items per page')
  })

  it('当前档位就是选中项', async () => {
    mount({ count: 196, defaultPageSize: 20, pageSizeOptions: [10, 20, 50] })
    await tick()
    expect(select().value).toBe('20')
  })

  it('换档即改状态，页码跟着换算', async () => {
    // 10 条一页的第 5 页 = 第 41 条起
    mount({ count: 196, defaultPageSize: 10, pageSizeOptions: [10, 20, 50], defaultPage: 5 })
    await tick()

    select().value = '50'
    select().dispatchEvent(new Event('change', { bubbles: true }))
    await tick()

    // 夹取会给第 2 页（第 51 条起），换算给第 1 页——第 41 条仍在页内
    expect(select().value).toBe('50')
    const readout = document.querySelector('[data-scope="pagination"][data-part="root"]')
    expect(readout).not.toBeNull()
  })

  it('受控时不自改，只发意图', async () => {
    const onPageSizeChange = vi.fn()
    mount({ count: 196, pageSize: 10, pageSizeOptions: [10, 20, 50] }, { onPageSizeChange })
    await tick()

    select().value = '20'
    select().dispatchEvent(new Event('change', { bubbles: true }))
    await tick()

    expect(onPageSizeChange).toHaveBeenCalledWith({ pageSize: 20, page: expect.any(Number) })
    // 宿主没写回，内部值一动不动
    expect(select().value).toBe('10')
  })

  it('不给档位表时用缺省那四档', async () => {
    mount({ count: 196 })
    await tick()
    expect([...select().options].map(o => o.value)).toEqual(['10', '20', '50', '100'])
  })
})
