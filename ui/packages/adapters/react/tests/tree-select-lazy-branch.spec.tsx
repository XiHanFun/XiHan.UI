// @vitest-environment jsdom
import type { Root } from 'react-dom/client'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, expect, it } from 'vitest'
import {
  XhTreeSelectContent,
  XhTreeSelectEmpty,
  XhTreeSelectItem,
  XhTreeSelectLoading,
  XhTreeSelectPositioner,
  XhTreeSelectRoot,
  XhTreeSelectTree,
  XhTreeSelectTrigger,
} from '../src'

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

let host: HTMLElement | null = null
let root: Root | null = null

afterEach(async () => {
  if (root)
    await act(async () => root!.unmount())
  host?.remove()
  document.body.innerHTML = ''
  root = null
  host = null
})

it('react 默认树把 hasChildren 渲染为 branch，并只消费 headless 的异步相位与有效树', async () => {
  let resolve: (nodes: { value: string, label: string }[]) => void = () => {}
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  await act(async () => root!.render(
    <XhTreeSelectRoot
      collection={[{ value: 'remote', label: '远程目录', hasChildren: true }]}
      loadChildren={() => new Promise((done) => { resolve = done })}
    />,
  ))

  const branch = document.querySelector<HTMLElement>('[data-scope="tree-select"][data-part="branch"]')!
  expect(branch).not.toBeNull()
  await act(async () => branch.querySelector<HTMLElement>('[data-part="branch-trigger"]')!.click())
  expect(branch.getAttribute('aria-busy')).toBe('true')

  await act(async () => {
    resolve([{ value: 'fetched', label: '已取回' }])
    await Promise.resolve()
  })
  expect([...document.querySelectorAll('[data-scope="tree-select"][data-part="item-text"]')].map(el => el.textContent)).toEqual(['已取回'])
  expect(branch.hasAttribute('data-loading')).toBe(false)
})

it('react collection 与手写节点共用 Headless 自动空态，节点增删不由适配器猜', async () => {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)

  await act(async () => root!.render(<XhTreeSelectRoot collection={[]} defaultOpen />))
  const collectionEmpty = document.querySelector<HTMLElement>('[data-xh-tree-select-auto-empty]')!
  expect(collectionEmpty.textContent).toBe('No data')
  expect(collectionEmpty.hidden).toBe(false)

  const renderManual = (withNode: boolean) => root!.render(
    <XhTreeSelectRoot defaultOpen>
      <XhTreeSelectTrigger>选择</XhTreeSelectTrigger>
      <XhTreeSelectPositioner>
        <XhTreeSelectContent>
          <XhTreeSelectTree>{withNode ? <XhTreeSelectItem value="manual">手写</XhTreeSelectItem> : null}</XhTreeSelectTree>
        </XhTreeSelectContent>
      </XhTreeSelectPositioner>
    </XhTreeSelectRoot>,
  )
  await act(async () => renderManual(false))
  expect(document.querySelector<HTMLElement>('[data-xh-tree-select-auto-empty]')!.hidden).toBe(false)
  await act(async () => renderManual(true))
  expect(document.querySelector<HTMLElement>('[data-xh-tree-select-auto-empty]')!.hidden).toBe(true)
  await act(async () => renderManual(false))
  expect(document.querySelector<HTMLElement>('[data-xh-tree-select-auto-empty]')!.hidden).toBe(false)
})

it('react 作者 Empty/Loading 在同次提交抑制自动节点，不产生重复 status', async () => {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  await act(async () => root!.render(
    <XhTreeSelectRoot defaultOpen>
      <XhTreeSelectTrigger>选择</XhTreeSelectTrigger>
      <XhTreeSelectPositioner>
        <XhTreeSelectContent>
          <XhTreeSelectTree />
          <XhTreeSelectEmpty>作者空态</XhTreeSelectEmpty>
          <XhTreeSelectLoading>作者加载</XhTreeSelectLoading>
        </XhTreeSelectContent>
      </XhTreeSelectPositioner>
    </XhTreeSelectRoot>,
  ))
  expect(document.querySelectorAll('[data-part="empty"]')).toHaveLength(1)
  expect(document.querySelectorAll('[data-part="loading"]')).toHaveLength(1)
  expect(document.querySelector('[data-xh-tree-select-auto-empty]')).toBeNull()
  expect(document.querySelector('[data-xh-tree-select-auto-loading]')).toBeNull()
})
