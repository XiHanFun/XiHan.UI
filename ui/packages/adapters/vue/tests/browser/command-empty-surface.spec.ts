import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhCommandRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

function part(name: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-scope='command'][data-part='${name}']`)
  if (!element)
    throw new Error(`找不到命令面板 ${name}`)
  return element
}

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

async function mount(options: { empty?: string, loading?: boolean, disabled?: boolean } = {}): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ render: () => h(XhCommandRoot, {
    defaultOpen: true,
    modal: false,
    collection: [{ value: 'open', label: '打开文档', disabled: options.disabled }],
    empty: options.empty,
    loading: options.loading,
  }) })
  app.mount(host)
  await nextTick()
  await nextTick()
}

describe('命令面板无候选不保留空白列表', () => {
  it('筛空仅保留提示，恢复候选后仍可键盘定位，焦点始终在输入框', async () => {
    await mount({ empty: '没有匹配命令' })
    const input = part('input') as HTMLInputElement
    await userEvent.fill(input, '无匹配内容')
    await nextTick()
    expect(part('list').getBoundingClientRect().height).toBe(0)
    expect(part('empty').getBoundingClientRect().height).toBeGreaterThan(0)
    expect(part('empty').textContent).toBe('没有匹配命令')
    expect(document.activeElement).toBe(input)
    await userEvent.fill(input, '')
    await nextTick()
    expect(part('list').getBoundingClientRect().height).toBeGreaterThan(0)
    await userEvent.keyboard('{ArrowDown}')
    await nextTick()
    expect(part('item').getAttribute('aria-selected')).toBe('true')
    expect(input.getAttribute('aria-activedescendant')).toBe(part('item').id)
  })

  it('未给状态文案时不生成纯空白，disabled候选仍保留', async () => {
    await mount({ loading: true, disabled: true })
    expect(part('list').getBoundingClientRect().height).toBeGreaterThan(0)
    expect(part('loading').getBoundingClientRect().height).toBe(0)
    await userEvent.fill(part('input'), '无匹配内容')
    await nextTick()
    expect(part('list').getBoundingClientRect().height).toBe(0)
    expect(part('empty').getBoundingClientRect().height).toBe(0)
    expect(part('input').getBoundingClientRect().height).toBeGreaterThan(0)
  })
})
