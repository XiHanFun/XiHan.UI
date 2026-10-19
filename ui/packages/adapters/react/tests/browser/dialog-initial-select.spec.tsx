// 对话框打开时把焦点交给第一个可聚焦元素：单行文本框全选里面的内容，多行的 textarea 只落焦、不全选。
import type { Root } from 'react-dom/client'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { XhDialogContent, XhDialogRoot, XhDialogTitle } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let root: Root | null = null

afterEach(() => {
  act(() => root?.unmount())
  root = null
  document.body.innerHTML = ''
})

async function settle(): Promise<void> {
  for (let count = 0; count < 3; count++) {
    await act(async () => {
      await Promise.resolve()
    })
  }
  // 等宿主提交与落焦：两帧
  await new Promise(resolve => requestAnimationFrame(resolve))
  await new Promise(resolve => requestAnimationFrame(resolve))
}

async function mount(first: 'textarea' | 'input'): Promise<void> {
  const host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  await act(async () => {
    root!.render(
      <XhDialogRoot open>
        <XhDialogContent>
          <XhDialogTitle>编辑</XhDialogTitle>
          {first === 'textarea' ? <textarea defaultValue={'第一行\n第二行'} /> : <input type="text" defaultValue="张三" />}
          <button type="button">保存</button>
        </XhDialogContent>
      </XhDialogRoot>,
    )
  })
}

/** 焦点所在的文本框是不是整段选中。 */
function fullySelected(): boolean {
  const el = document.activeElement as HTMLInputElement | HTMLTextAreaElement
  return el.selectionStart === 0 && el.selectionEnd === el.value.length
}

describe('对话框打开时的落焦与全选', () => {
  it('第一个可聚焦元素是 textarea：焦点落上去，不全选', async () => {
    await mount('textarea')
    await settle()
    expect(document.activeElement?.localName).toBe('textarea')
    expect(fullySelected()).toBe(false)
  })

  it('第一个可聚焦元素是单行文本框：焦点落上去并全选', async () => {
    await mount('input')
    await settle()
    expect(document.activeElement?.localName).toBe('input')
    expect(fullySelected()).toBe(true)
  })
})
