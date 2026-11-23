// @vitest-environment jsdom
// 确认键恒为行主操作、选择归 Space：作者没传 onAction 时也一样，与 Vue / Web Components 同一行为
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { XhGridListRoot, XhGridListRow, XhGridListRowContent, XhGridListRowText } from '../src'

let host: HTMLElement | null = null
let root: ReturnType<typeof createRoot> | null = null

afterEach(async () => {
  await act(async () => root?.unmount())
  host?.remove()
  root = null
  host = null
})

function key(target: HTMLElement, value: string): void {
  target.dispatchEvent(new KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true }))
}

describe('gridList 的确认键（React）', () => {
  it('没传 onAction 时 Enter 也不改选择，Space 才选中', async () => {
    const onValueChange = vi.fn()
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
    await act(async () => root!.render(
      <XhGridListRoot aria-label="项目" collection={[{ value: 'a', label: 'Alpha' }]} onValueChange={onValueChange}>
        <XhGridListRow value="a">
          <XhGridListRowContent><XhGridListRowText>Alpha</XhGridListRowText></XhGridListRowContent>
        </XhGridListRow>
      </XhGridListRoot>,
    ))
    const row = host.querySelector<HTMLElement>(`[data-scope='grid-list'][data-part='row']`)!
    await act(async () => row.focus())
    await act(async () => key(row, 'Enter'))
    expect(onValueChange).not.toHaveBeenCalled()
    await act(async () => key(row, ' '))
    expect(onValueChange).toHaveBeenCalledWith({ value: ['a'] })
  })
})
