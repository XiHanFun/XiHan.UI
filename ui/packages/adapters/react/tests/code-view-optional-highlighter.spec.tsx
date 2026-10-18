// @vitest-environment jsdom
// @xihan-ui/code-highlight 是可选 peer：没装它，代码视图要渲成纯文本，不能报错。
import { describe, expect, it, vi } from 'vitest'
// 模块图在收集阶段先转换好。组件经 @xihan-ui/headless 的入口牵出近九百个模块，首次转换单跑约 10 秒，
// 全量并发冷启动时还要翻几倍；这段一次性的活儿放在用例里第一次 import，就整段算进第一条用例的时限。
// 收集阶段的 import 不计时（其余用例文件都是这样付掉的）；用例里 resetModules 之后再 import，只剩重新执行
import '@testing-library/react'
import '@xihan-ui/code-highlight'
import 'react'
import '../src/components/code-view/code-view'

async function loadCodeView(installed: boolean, warm = installed) {
  const requested = vi.fn()
  vi.doMock('@xihan-ui/code-highlight', () => {
    requested()
    if (!installed)
      throw new Error('Cannot find package \'@xihan-ui/code-highlight\'')
    return vi.importActual('@xihan-ui/code-highlight')
  })
  vi.resetModules()
  if (warm)
    await import('@xihan-ui/code-highlight')
  return { ...await import('../src/components/code-view/code-view'), requested }
}

async function renderCodeView(installed: boolean) {
  const components = await loadCodeView(installed)
  const [{ act, render }, React] = await Promise.all([
    import('@testing-library/react'),
    import('react'),
  ])
  const { XhCodeViewRoot, XhCodeViewPre, XhCodeViewCode } = components
  const view = render(React.createElement(
    XhCodeViewRoot,
    { code: 'const a = 1', lang: 'ts', complete: true },
    React.createElement(XhCodeViewPre, null, React.createElement(XhCodeViewCode)),
  ))
  await act(async () => {
    await Promise.resolve()
    await Promise.resolve()
  })
  return view
}

/**
 * 每条用例都换一份「装没装」，resetModules 后把模块图重新执行一遍（转换已在收集阶段做完）：
 * 单跑每条约 0.2 秒，全量并发时约慢一个数量级。本机上限留百倍余量，CI 并发跑二十多个包、同一份活儿再慢一个数量级，按倍数放宽。
 */
const RELOAD_TIMEOUT = process.env.CI ? 120_000 : 20_000

describe('可选的着色实现', () => {
  it('没装就退回纯文本：一个记号都不铺，代码原文照旧', async () => {
    const view = await renderCodeView(false)
    expect(view.container.querySelectorAll('[data-part="token"]')).toHaveLength(0)
    expect(view.container.textContent).toContain('const a = 1')
    view.unmount()
  }, RELOAD_TIMEOUT)

  it('装了就自动着色，不用手写 highlighter', async () => {
    const view = await renderCodeView(true)
    await vi.waitFor(() => expect(view.container.querySelectorAll('[data-part="token"]').length).toBeGreaterThan(0))
    const tokens = [...view.container.querySelectorAll('[data-part="token"]')]
    expect(tokens.map(token => token.textContent).join('')).toBe('const a = 1')
    expect(tokens[0]!.getAttribute('data-kind')).toBe('keyword')
    view.unmount()
  }, RELOAD_TIMEOUT)

  it('显式 null 保持纯文本且不请求默认可选模块', async () => {
    const components = await loadCodeView(true, false)
    const [{ render }, React] = await Promise.all([
      import('@testing-library/react'),
      import('react'),
    ])
    const { XhCodeViewRoot, XhCodeViewPre, XhCodeViewCode, requested } = components
    const view = render(React.createElement(
      XhCodeViewRoot,
      { code: 'const a = 1', lang: 'ts', complete: true, highlighter: null },
      React.createElement(XhCodeViewPre, null, React.createElement(XhCodeViewCode)),
    ))
    await Promise.resolve()
    expect(requested).not.toHaveBeenCalled()
    expect(view.container.querySelectorAll('[data-part="token"]')).toHaveLength(0)
    view.unmount()
  }, RELOAD_TIMEOUT)
})
