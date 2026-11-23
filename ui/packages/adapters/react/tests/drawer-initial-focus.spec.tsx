// 抽屉跑的是对话框那一份机器，initialFocus 机器早就认；这里核它在抽屉上有入口可写。
import { act, cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { XhDrawerContent, XhDrawerRoot, XhDrawerTitle } from '../src'

const settle = (): Promise<void> => new Promise(resolve => setTimeout(resolve, 0))

async function mountDrawer(initialFocus?: string): Promise<void> {
  render(
    <XhDrawerRoot defaultOpen initialFocus={initialFocus}>
      <XhDrawerContent>
        <XhDrawerTitle>筛选条件</XhDrawerTitle>
        <input data-testid="keyword" />
        <button data-testid="apply">应用</button>
      </XhDrawerContent>
    </XhDrawerRoot>,
  )
  await act(settle)
  await act(settle)
}

/** 面板在 Portal 里，上一条用例的节点可能还没撤干净：按焦点所在元素自己的标识认，不按文档里第一个同名节点认。 */
function focusedTestId(): string | undefined {
  return (document.activeElement as HTMLElement | null)?.dataset.testid
}

afterEach(async () => {
  cleanup()
  await act(settle)
})

describe('drawer 的 initialFocus', () => {
  it('不给时焦点落在内容里第一个可聚焦的控件上', async () => {
    await mountDrawer()
    expect(focusedTestId()).toBe('keyword')
  })

  it('给了选择器就落在匹配的元素上', async () => {
    await mountDrawer('[data-testid="apply"]')
    expect(focusedTestId()).toBe('apply')
  })
})
