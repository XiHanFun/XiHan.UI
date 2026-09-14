// @vitest-environment jsdom
// 每页条数控制器：装的是库里的 select。
//
// 库里已经有一个下拉在做这件事，分页不再自己造一个：档位、键盘、浮层与皮肤都跟着它走，
// 分页这一侧只留 page-size-select 那一格挂载点。
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

/** 分页那一侧的挂载点。 */
function mount$(): HTMLElement {
  return document.querySelector<HTMLElement>(
    '[data-scope="pagination"][data-part="page-size-select"]',
  )!
}

/** 内嵌下拉的角色节点，带的是 select 的 scope。 */
function selectPart(part: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope="select"][data-part="${part}"]`)!
}

function options(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>('[data-scope="select"][data-part="item"]')]
}

async function tick(): Promise<void> {
  await nextTick()
  await nextTick()
}

describe('每页条数控制器', () => {
  it('挂载点里装的是库里的下拉，不再是原生 select', async () => {
    mount({ count: 196, defaultPageSize: 20, pageSizeOptions: [10, 20, 50] })
    await tick()

    expect(mount$().tagName).toBe('DIV')
    expect(document.querySelector('select')).toBeNull()
    // 下拉的根就在挂载点里，select 那份皮肤因此选得中它
    expect(mount$().querySelector('[data-scope="select"][data-part="root"]')).not.toBeNull()
  })

  it('档位来自 pageSizeOptions，档位文字取 translations.pageSizeOption', async () => {
    mount({
      count: 196,
      defaultPageSize: 20,
      pageSizeOptions: [10, 20, 50],
      translations: { pageSizeOption: (size: number) => `${size} 条 / 页` },
    })
    await tick()

    expect(options().map(el => el.getAttribute('data-value'))).toEqual(['10', '20', '50'])
    expect(options().map(el => el.textContent)).toEqual(['10 条 / 页', '20 条 / 页', '50 条 / 页'])
  })

  it('可及名仍是 pageSizeSelect 那句，不会被当前档位顶掉', async () => {
    mount({ count: 196, defaultPageSize: 20 })
    await tick()

    const trigger = selectPart('trigger')
    expect(trigger.getAttribute('aria-label')).toBe('Items per page')
    // 名字不再指向「标签 + 当前值」：这里没有标签节点，只指当前值等于把值念成名字
    expect(trigger.hasAttribute('aria-labelledby')).toBe(false)
    expect(selectPart('list').getAttribute('aria-label')).toBe('Items per page')
  })

  it('键盘行为跟着下拉走：触发器是 combobox，展开与收起都有键可按', async () => {
    mount({ count: 196, defaultPageSize: 20 })
    await tick()

    const trigger = selectPart('trigger')
    expect(trigger.getAttribute('role')).toBe('combobox')
    expect(trigger.getAttribute('aria-haspopup')).toBe('listbox')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')

    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    await tick()
    expect(selectPart('trigger').getAttribute('aria-expanded')).toBe('true')
  })

  it('当前档位就是选中项', async () => {
    mount({ count: 196, defaultPageSize: 20, pageSizeOptions: [10, 20, 50] })
    await tick()

    const selected = options().filter(el => el.getAttribute('aria-selected') === 'true')
    expect(selected.map(el => el.getAttribute('data-value'))).toEqual(['20'])
    expect(selectPart('value-text').textContent).toBe('20 / page')
  })

  it('换档即改状态，页码跟着换算', async () => {
    // 10 条一页的第 5 页 = 第 41 条起
    const onPageSizeChange = vi.fn()
    mount(
      { count: 196, defaultPageSize: 10, pageSizeOptions: [10, 20, 50], defaultPage: 5 },
      { onPageSizeChange },
    )
    await tick()

    // 收起态的条目在 hidden 的列表里，先展开再挑
    selectPart('trigger').click()
    await tick()
    options().find(el => el.getAttribute('data-value') === '50')!.click()
    await tick()

    // 夹取会给第 2 页（第 51 条起），换算给第 1 页——第 41 条仍在页内
    expect(onPageSizeChange).toHaveBeenCalledWith({ pageSize: 50, page: 1 })
    expect(selectPart('value-text').textContent).toBe('50 / page')
  })

  it('受控时不自改，只发意图', async () => {
    const onPageSizeChange = vi.fn()
    mount({ count: 196, pageSize: 10, pageSizeOptions: [10, 20, 50] }, { onPageSizeChange })
    await tick()

    selectPart('trigger').click()
    await tick()
    options().find(el => el.getAttribute('data-value') === '20')!.click()
    await tick()

    expect(onPageSizeChange).toHaveBeenCalledWith({ pageSize: 20, page: expect.any(Number) })
    // 宿主没写回，内部值一动不动
    expect(selectPart('value-text').textContent).toBe('10 / page')
  })

  it('不给档位表时用缺省那四档', async () => {
    mount({ count: 196 })
    await tick()
    expect(options().map(el => el.getAttribute('data-value'))).toEqual(['10', '20', '50', '100'])
  })
})
