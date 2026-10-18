// @vitest-environment jsdom
// @xihan-ui/code-highlight 是可选 peer：没装它，代码视图要渲成纯文本，不能报错。
import { describe, expect, it, vi } from 'vitest'
// 模块图在收集阶段先转换好。组件经 @xihan-ui/headless 的入口牵出近九百个模块，首次转换单跑约 10 秒，
// 全量并发冷启动时还要翻几倍；这段一次性的活儿放在用例里第一次 import，就整段算进第一条用例的时限。
// 收集阶段的 import 不计时（其余用例文件都是这样付掉的）；用例里 resetModules 之后再 import，只剩重新执行
import '@xihan-ui/code-highlight'
import '../src/elements/code-view'

interface Updatable extends HTMLElement { updateComplete: Promise<unknown> }

/** 自定义元素名一个注册表只认一次，每轮换一个。 */
let round = 0

/**
 * 按「装没装 @xihan-ui/code-highlight」重新取一份元素类，挂一块已闭合的 TypeScript 代码。
 * 作者写的角色节点只铺到 code 那一层，逐行结构由元素接管。
 */
async function render(installed: boolean, highlighter?: null): Promise<Updatable & { requested: ReturnType<typeof vi.fn> }> {
  const requested = vi.fn()
  // 两条路都显式登记：只在一边登记，另一边会捡到上一条用例留下的那份
  vi.doMock('@xihan-ui/code-highlight', () => {
    requested()
    if (!installed)
      throw new Error('Cannot find package \'@xihan-ui/code-highlight\'')
    return vi.importActual('@xihan-ui/code-highlight')
  })
  vi.resetModules()
  // 先把包捂热：真去磁盘取一趟要跨好几个 tick，元素那边的 import 就只剩一个微任务
  if (installed && highlighter !== null)
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
  if (highlighter === null)
    Object.assign(el, { highlighter: null })
  await el.updateComplete
  // 着色实现是异步到达的，等它落位再重渲一轮
  await new Promise(resolve => setTimeout(resolve, 0))
  await el.updateComplete
  return Object.assign(el, { requested })
}

/**
 * 每条用例都换一份「装没装」，resetModules 后把模块图重新执行一遍（转换已在收集阶段做完）：
 * 单跑每条约 0.2 秒，全量并发时约慢一个数量级。本机上限留百倍余量，CI 并发跑二十多个包、同一份活儿再慢一个数量级，按倍数放宽。
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

  it('显式 null 保持纯文本且不请求默认可选模块', async () => {
    const el = await render(true, null)
    expect(el.requested).not.toHaveBeenCalled()
    expect(el.querySelectorAll('[data-part="token"]')).toHaveLength(0)
  }, RELOAD_TIMEOUT)
})
