import type { ListboxNode } from '@xihan-ui/headless'
import type { ReactNode } from 'react'
import type { Root } from 'react-dom/client'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { XhListboxContent, XhListboxEmpty, XhListboxItem, XhListboxLabel, XhListboxLoading, XhListboxRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let root: Root | undefined
let host: HTMLElement | undefined
const globals = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }

async function inAct(action: () => void | Promise<void>): Promise<void> {
  const previous = globals.IS_REACT_ACT_ENVIRONMENT
  globals.IS_REACT_ACT_ENVIRONMENT = true
  try {
    await act(action)
  }
  finally {
    globals.IS_REACT_ACT_ENVIRONMENT = previous
  }
}

async function render(node: ReactNode): Promise<void> {
  if (!host) {
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
  }
  await inAct(() => root!.render(node))
}

function part(name: string): HTMLElement {
  const node = host?.querySelector<HTMLElement>(`[data-scope='listbox'][data-part='${name}']`)
  if (!node)
    throw new Error(`缺少列表部件 ${name}`)
  return node
}

afterEach(async () => {
  await inAct(() => root?.unmount())
  host?.remove()
  root = undefined
  host = undefined
})

it('默认空集合不画框，只有禁用候选时仍保留真实列表', async () => {
  await render(<XhListboxRoot collection={[]} loading label="候选" />)
  expect(part('content').getBoundingClientRect().height).toBe(0)
  expect(host?.querySelector('[data-part="empty"], [data-part="loading"]')).toBeNull()
  await render(<XhListboxRoot collection={[{ value: 'blocked', label: '不可选', disabled: true }]} label="候选" />)
  expect(part('content').getBoundingClientRect().height).toBeGreaterThan(0)
  expect(part('item').getAttribute('aria-disabled')).toBe('true')
})

it('作者空态与加载态互斥，恢复后的列表可用键盘选中', async () => {
  const tree = (collection: ListboxNode[], loading = false): ReactNode => (
    <XhListboxRoot collection={collection} loading={loading} selectionMode="multiple">
      <XhListboxLabel>候选</XhListboxLabel>
      <XhListboxContent>{collection.map(node => <XhListboxItem key={node.value} value={node.value}>{node.label}</XhListboxItem>)}</XhListboxContent>
      <XhListboxEmpty>没有匹配项</XhListboxEmpty>
      <XhListboxLoading>正在加载</XhListboxLoading>
    </XhListboxRoot>
  )
  await render(tree([]))
  expect(part('content').getBoundingClientRect().height).toBe(0)
  expect(part('empty').getBoundingClientRect().height).toBeGreaterThan(0)
  await render(tree([], true))
  expect(part('content').getBoundingClientRect().height).toBe(0)
  expect(part('empty').getBoundingClientRect().height).toBe(0)
  expect(part('loading').getBoundingClientRect().height).toBeGreaterThan(0)
  await render(tree([{ value: 'pear', label: '梨' }]))
  await inAct(() => part('content').focus())
  await inAct(() => userEvent.keyboard('{Enter}'))
  expect(part('item').getAttribute('aria-selected')).toBe('true')
})
