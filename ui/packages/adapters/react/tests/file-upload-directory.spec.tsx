// @vitest-environment jsdom
// directory 要让隐藏输入真带上 webkitdirectory：React 不认这个属性名，交给它布尔 true 会被丢掉，只有字符串落得到 DOM 上。
import type { Root } from 'react-dom/client'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { XhFileUploadRoot } from '../src'

const globals = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
globals.IS_REACT_ACT_ENVIRONMENT = true

let root: Root | undefined
let host: HTMLElement | undefined

afterEach(() => {
  act(() => root?.unmount())
  host?.remove()
  root = undefined
  host = undefined
})

function hiddenInput(directory: boolean): HTMLInputElement {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  act(() => root!.render(<XhFileUploadRoot label="附件" directory={directory} />))
  return host.querySelector<HTMLInputElement>(`[data-scope='file-upload'][data-part='hidden-input']`)!
}

describe('xhFileUploadRoot directory', () => {
  it('开了 directory，隐藏输入带上 webkitdirectory', () => {
    expect(hiddenInput(true).hasAttribute('webkitdirectory')).toBe(true)
  })

  it('没开就不带', () => {
    expect(hiddenInput(false).hasAttribute('webkitdirectory')).toBe(false)
  })
})
