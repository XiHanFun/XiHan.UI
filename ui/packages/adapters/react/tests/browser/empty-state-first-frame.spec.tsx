// 空状态的开幕只在出现时播。钉住两件事：页面加载完成之后挂上的逐段开幕；
// 服务端渲染后水合的随首屏就在、直接呈现，水合结束后 React 按客户端快照再渲染那一轮也不补播。
import type { Root } from 'react-dom/client'
import { act } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { XhEmptyStateDescription, XhEmptyStateIndicator, XhEmptyStateRoot, XhEmptyStateTitle } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

// act 包住挂载与水合，React 才会把提交与效应在 act 结束前冲刷完
const actEnvironment = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
actEnvironment.IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLElement | null = null
let root: Root | null = null

afterEach(async () => {
  await act(async () => root?.unmount())
  root = null
  host?.remove()
  host = null
  vi.restoreAllMocks()
})

function EmptyState() {
  return (
    <XhEmptyStateRoot>
      <XhEmptyStateIndicator>∅</XhEmptyStateIndicator>
      <XhEmptyStateTitle>还没有项目</XhEmptyStateTitle>
      <XhEmptyStateDescription>新建一个项目后会出现在这里。</XhEmptyStateDescription>
    </XhEmptyStateRoot>
  )
}

function part(name: string): HTMLElement {
  return host!.querySelector<HTMLElement>(`[data-scope="empty-state"][data-part="${name}"]`)!
}

function frame(): Promise<void> {
  return new Promise(resolve => requestAnimationFrame(() => resolve()))
}

function mountHost(): HTMLElement {
  host = document.createElement('div')
  host.style.cssText = 'padding: 24px; inline-size: 480px'
  document.body.append(host)
  return host
}

describe('空状态的开幕', () => {
  it('页面加载完成之后挂上：data-instant 撤掉，标题按开幕关键帧起播', async () => {
    expect(document.readyState).toBe('complete')
    root = createRoot(mountHost())
    await act(async () => root!.render(<EmptyState />))
    await frame()
    const title = part('title')
    expect(title.hasAttribute('data-instant')).toBe(false)
    expect(getComputedStyle(title).animationName).toBe('xh-rise-in')
  })

  it('服务端渲染后水合：随首屏就在，直接呈现，水合后那一轮渲染也不补播', async () => {
    const html = renderToString(<EmptyState />)
    expect(html).toContain('data-instant')
    mountHost().innerHTML = html
    const errors = vi.spyOn(console, 'error')
    await act(async () => {
      root = hydrateRoot(host!, <EmptyState />)
    })
    await frame()
    await frame()
    // 水合不匹配会经 console.error 报出来
    expect(errors).not.toHaveBeenCalled()
    for (const name of ['indicator', 'title', 'description']) {
      expect(part(name).hasAttribute('data-instant')).toBe(true)
      expect(getComputedStyle(part(name)).animationName).toBe('none')
    }
  })
})
