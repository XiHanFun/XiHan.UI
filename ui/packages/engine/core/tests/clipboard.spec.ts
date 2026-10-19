// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { writeToClipboard } from '../src/clipboard'
import { createCounterIdGenerator } from '../src/kernel/id-generator'
import { createScope } from '../src/kernel/scope'

/**
 * 装一个假的 navigator.clipboard。jsdom 默认没有这个对象，这就是「接口缺席」那条路的真实现场；
 * 成功路径要自己装上。返回值负责拆干净，免得漏给下一条用例。
 */
function installClipboard(writeText: (text: string) => Promise<void>): () => void {
  Object.defineProperty(window.navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
  })
  return () => {
    Reflect.deleteProperty(window.navigator, 'clipboard')
  }
}

const teardowns: Array<() => void> = []

afterEach(() => {
  while (teardowns.length) teardowns.pop()!()
})

describe('writeToClipboard', () => {
  it('给 window 或给 scope 都把文本原样交给 writeText', async () => {
    const writeText = vi.fn(async () => {})
    teardowns.push(installClipboard(writeText))
    await expect(writeToClipboard(window, '给窗口')).resolves.toBeUndefined()
    await expect(writeToClipboard(createScope(document.body, createCounterIdGenerator()), '给 scope')).resolves.toBeUndefined()
    expect(writeText.mock.calls).toEqual([['给窗口'], ['给 scope']])
  })

  it('接口缺席时给出一个拒绝，而不是抛同步异常', async () => {
    await expect(writeToClipboard(window, 'x')).rejects.toBeInstanceOf(Error)
  })

  it('writeText 同步抛、getWin 取不到窗口，都翻成拒绝：调用方只需处理「失败」一种形态', async () => {
    teardowns.push(installClipboard(() => {
      throw new Error('boom')
    }))
    await expect(writeToClipboard(window, 'x')).rejects.toThrow('boom')
    const detached = { getWin: (): Window => {
      throw new Error('no window')
    } }
    await expect(writeToClipboard(detached, 'x')).rejects.toThrow('no window')
  })
})
