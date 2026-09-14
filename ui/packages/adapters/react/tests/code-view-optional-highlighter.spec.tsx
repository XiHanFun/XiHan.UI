// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'

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
