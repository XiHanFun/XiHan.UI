// @vitest-environment jsdom
// 对话框全屏：判据与皮肤在别处，这里核 React 这一侧把 fullscreen 透传到了机器，标记落在定位层与面板上。
import type { Root } from 'react-dom/client'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { XhDialogContent, XhDialogRoot, XhDialogTitle } from '../src'

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

function part(name: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope="dialog"][data-part="${name}"]`)!
}

describe('xhDialog 的 fullscreen', () => {
  it('标记落在 positioner 与 content 上，开着拖动也不带拖动标记', async () => {
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
    await act(async () => root!.render(
      <XhDialogRoot open fullscreen draggable>
        <XhDialogContent>
          <XhDialogTitle>编辑报表</XhDialogTitle>
        </XhDialogContent>
      </XhDialogRoot>,
    ))

    expect(part('positioner').hasAttribute('data-fullscreen')).toBe(true)
    expect(part('content').hasAttribute('data-fullscreen')).toBe(true)
    expect(part('content').hasAttribute('data-draggable')).toBe(false)
  })
})
