// @vitest-environment jsdom
// @xihan-ui/code-highlight 是可选 peer：没装它，代码视图要渲成纯文本，不能报错。
import { describe, expect, it, vi } from 'vitest'

interface Updatable extends HTMLElement { updateComplete: Promise<unknown> }

/** 自定义元素名一个注册表只认一次，每轮换一个。 */
let round = 0

/**
 * 按「装没装 @xihan-ui/code-highlight」重新取一份元素类，挂一块已闭合的 TypeScript 代码。
 * 作者写的角色节点只铺到 code 那一层，逐行结构由元素接管。
 */
async function render(installed: boolean): Promise<Updatable> {
  // 两条路都显式登记：只在一边登记，另一边会捡到上一条用例留下的那份
  vi.doMock('@xihan-ui/code-highlight', () => {
    if (!installed)
      throw new Error('Cannot find package \'@xihan-ui/code-highlight\'')
    return vi.importActual('@xihan-ui/code-highlight')
  })
  vi.resetModules()
  // 先把包捂热：真去磁盘取一趟要跨好几个 tick，元素那边的 import 就只剩一个微任务
  if (installed)
    await import('@xihan-ui/code-highlight')
  const { XhCodeViewElement } = await import('../src/elements/code-view')

  const tag = `xh-code-view-probe-${round++}`
  customElements.define(tag, XhCodeViewElement)
  const host = document.createElement('div')
  host.innerHTML = `<${tag} code="const a = 1" code-lang="ts" complete>`
    + '<pre data-xh-part="pre"><code data-xh-part="code"></code></pre>'
    + `</${tag}>`
  document.body.appendChild(host)

  const el = host.firstElementChild as Updatable
  await el.updateComplete
  // 着色实现是异步到达的，等它落位再重渲一轮
  await new Promise(resolve => setTimeout(resolve, 0))
  await el.updateComplete
  return el
}

/**
 * 每条用例都要换一份「装没装」再把模块图重新执行一遍，比一般用例慢得多。
 * CI 上并发跑二十多个包，同一份活儿慢一个数量级，上限按倍数放宽。
 */
const RELOAD_TIMEOUT = process.env.CI ? 120_000 : 20_000

describe('可选的着色实现', () => {
  it('没装就退回纯文本：一个记号都不铺，代码原文照旧', async () => {
    const el = await render(false)
    expect(el.querySelectorAll('[data-part="token"]')).toHaveLength(0)
    expect(el.textContent).toContain('const a = 1')
  }, RELOAD_TIMEOUT)

  it('装了就自动着色，不用手写 highlighter', async () => {
    const el = await render(true)
    const tokens = [...el.querySelectorAll('[data-part="token"]')]
    expect(tokens.length).toBeGreaterThan(0)
    // 记号拼回去与原文逐字相等，一个空格都不许丢
    expect(tokens.map(token => token.textContent).join('')).toBe('const a = 1')
    expect(tokens[0]!.getAttribute('data-kind')).toBe('keyword')
  }, RELOAD_TIMEOUT)
})
