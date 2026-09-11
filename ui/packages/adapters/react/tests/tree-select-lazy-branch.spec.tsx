// @vitest-environment jsdom
import type { Root } from 'react-dom/client'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, expect, it } from 'vitest'
import { XhTreeSelectRoot } from '../src'

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
