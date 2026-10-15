// @vitest-environment jsdom
//
// 工具条条目的禁用随 disabled 来回切换：条目禁用、解禁，整条禁用再解禁后各条目回到自己的声明。
// 与 Web Components 的同名用例对照：那一端曾把自己写回的 aria-disabled 当作者声明读回去，条目解不开。
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { XhToolbarItem, XhToolbarRoot } from '../src'

let host: HTMLElement | null = null
let root: ReturnType<typeof createRoot> | null = null

afterEach(async () => {
  await act(async () => {
    root?.unmount()
  })
  host?.remove()
  root = null
  host = null
})

function flags(): string[] {
  return [...document.querySelectorAll('[data-scope="toolbar"][data-part="item"]')].map(item => item.getAttribute('aria-disabled') ?? '(无)')
}

async function render(state: { undo: boolean, redo: boolean, toolbar: boolean }): Promise<void> {
  await act(async () => {
    root!.render(
      <XhToolbarRoot aria-label="编辑" disabled={state.toolbar}>
        <XhToolbarItem value="undo" disabled={state.undo}>撤销</XhToolbarItem>
        <XhToolbarItem value="redo" disabled={state.redo}>重做</XhToolbarItem>
      </XhToolbarRoot>,
    )
  })
}

describe('工具条条目的禁用随 disabled 切换', () => {
  it('条目禁用与解禁，整条禁用再解禁后回到各自的声明', async () => {
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
    ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

    await render({ undo: true, redo: false, toolbar: false })
    expect(flags()).toEqual(['true', 'false'])

    await render({ undo: false, redo: true, toolbar: false })
    expect(flags()).toEqual(['false', 'true'])

    await render({ undo: false, redo: true, toolbar: true })
    expect(flags()).toEqual(['true', 'true'])

    await render({ undo: false, redo: false, toolbar: false })
    expect(flags()).toEqual(['false', 'false'])
  })
})
