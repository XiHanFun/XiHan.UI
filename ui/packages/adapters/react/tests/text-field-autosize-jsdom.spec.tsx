// @vitest-environment jsdom
// 没有排版的环境（jsdom）里渲染多行自动增高的文本框：挂载、输入、换配置都不抛错，也不改 textarea 的高度。
import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { XhTextFieldControl, XhTextFieldInput, XhTextFieldRoot } from '../src'

function View({ autoSize }: { autoSize: boolean | { minRows: number, maxRows: number } }) {
  return (
    <XhTextFieldRoot autoSize={autoSize}>
      <XhTextFieldControl>
        <XhTextFieldInput as="textarea" />
      </XhTextFieldControl>
    </XhTextFieldRoot>
  )
}

describe('多行自动增高在 jsdom 里安静跳过（React）', () => {
  it('挂载、输入与切换 autoSize 都不抛错，textarea 不写高度', () => {
    const { container, rerender, unmount } = render(<View autoSize />)
    const el = container.querySelector('textarea')!
    fireEvent.input(el, { target: { value: '第一行\n第二行\n第三行' } })
    rerender(<View autoSize={{ minRows: 2, maxRows: 4 }} />)
    rerender(<View autoSize={false} />)
    expect(el.style.blockSize).toBe('')
    expect(el.style.maxBlockSize).toBe('')
    expect(el.style.overflowY).toBe('')
    unmount()
  })
})
