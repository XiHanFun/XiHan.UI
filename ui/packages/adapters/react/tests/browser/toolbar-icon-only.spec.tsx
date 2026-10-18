// 工具条只放图标的条目（React）：声明 iconOnly 时按方钮画，宽等于高，三种尺寸都一样；
// 图标加文字、只有文字的条目照旧按文字档排。宽高只有真实排版量得出来。
import type { Size } from '@xihan-ui/core'
import type { Root } from 'react-dom/client'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { XhToolbarGroup, XhToolbarItem, XhToolbarRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const globals = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }

let root: Root | null = null
let host: HTMLElement | null = null

async function inAct(fn: () => void | Promise<void>): Promise<void> {
  const previous = globals.IS_REACT_ACT_ENVIRONMENT
  globals.IS_REACT_ACT_ENVIRONMENT = true
  try {
    await act(fn)
  }
  finally {
    globals.IS_REACT_ACT_ENVIRONMENT = previous
  }
}

afterEach(async () => {
  await inAct(() => root?.unmount())
  root = null
  host?.remove()
  host = null
})

function Icon() {
  return <span aria-hidden="true" style={{ display: 'inline-block', inlineSize: '16px', blockSize: '16px', background: 'currentColor' }} />
}

function Bar({ size, copyIconOnly }: { size: Size, copyIconOnly: boolean }) {
  return (
    <XhToolbarRoot aria-label="编辑" size={size}>
      <XhToolbarItem value="bold" type="button" aria-label="加粗" iconOnly><Icon /></XhToolbarItem>
      <XhToolbarItem value="copy" type="button" aria-label={copyIconOnly ? '复制' : undefined} iconOnly={copyIconOnly}>
        <Icon />
        {copyIconOnly ? null : '复制'}
      </XhToolbarItem>
      <XhToolbarItem value="paste" type="button">粘贴</XhToolbarItem>
      <XhToolbarGroup>
        <XhToolbarItem value="left" type="button" aria-label="左对齐" iconOnly><Icon /></XhToolbarItem>
        <XhToolbarItem value="right" type="button" aria-label="右对齐" iconOnly><Icon /></XhToolbarItem>
      </XhToolbarGroup>
    </XhToolbarRoot>
  )
}

async function mount(size: Size, copyIconOnly = false): Promise<(next: boolean) => Promise<void>> {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  await inAct(() => root!.render(<Bar size={size} copyIconOnly={copyIconOnly} />))
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  return next => inAct(() => root!.render(<Bar size={size} copyIconOnly={next} />))
}

function item(value: string): HTMLElement {
  return host!.querySelector<HTMLElement>(`[data-scope="toolbar"][data-part="item"][data-value="${value}"]`)!
}

function box(el: HTMLElement): { width: number, height: number } {
  const rect = el.getBoundingClientRect()
  return { width: rect.width, height: rect.height }
}

describe('react toolbar 只放图标的条目', () => {
  for (const size of ['sm', 'md', 'lg'] as const) {
    it(`${size} 档：声明 iconOnly 的条目宽等于高、与文字条目同高，组内的也一样；图标加文字、只有文字的条目不受影响`, async () => {
      await mount(size)
      const text = box(item('paste'))
      for (const value of ['bold', 'left', 'right']) {
        const el = item(value)
        const { width, height } = box(el)
        expect(el.getAttribute('data-xh-action-profile')).toBe('icon')
        expect(el.hasAttribute('data-icon-only')).toBe(true)
        expect(Math.abs(width - height)).toBeLessThan(0.5)
        expect(Math.abs(height - text.height)).toBeLessThan(0.5)
      }
      for (const value of ['copy', 'paste']) {
        const el = item(value)
        const { width, height } = box(el)
        expect(el.getAttribute('data-xh-action-profile')).toBe('text')
        expect(el.hasAttribute('data-icon-only')).toBe(false)
        expect(Number.parseFloat(getComputedStyle(el).paddingInlineStart)).toBeGreaterThan(0)
        expect(width).toBeGreaterThan(height)
      }
    })
  }

  it('iconOnly 换了：条目随之换成方钮或换回文字档', async () => {
    const rerender = await mount('md')
    await rerender(true)
    const el = item('copy')
    expect(el.getAttribute('data-xh-action-profile')).toBe('icon')
    expect(Math.abs(box(el).width - box(el).height)).toBeLessThan(0.5)
    await rerender(false)
    expect(el.getAttribute('data-xh-action-profile')).toBe('text')
    expect(box(el).width).toBeGreaterThan(box(el).height)
  })

  it('竖排：只放图标的条目随列宽拉伸，与列里较宽的文字条目一样宽、同高；整列只放图标时是方钮', async () => {
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
    await inAct(() => root!.render(
      <div>
        <div style={{ inlineSize: 'max-content' }}>
          <XhToolbarRoot aria-label="翻页" orientation="vertical">
            <XhToolbarItem value="previous" type="button" aria-label="上一页" iconOnly><Icon /></XhToolbarItem>
            <XhToolbarItem value="page" type="button">第 1 页，共 3 页</XhToolbarItem>
          </XhToolbarRoot>
        </div>
        <div style={{ inlineSize: 'max-content' }}>
          <XhToolbarRoot aria-label="缩放" orientation="vertical">
            <XhToolbarItem value="zoom-in" type="button" aria-label="放大" iconOnly><Icon /></XhToolbarItem>
            <XhToolbarItem value="zoom-out" type="button" aria-label="缩小" iconOnly><Icon /></XhToolbarItem>
          </XhToolbarRoot>
        </div>
      </div>,
    ))
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
    const icon = box(item('previous'))
    const text = box(item('page'))
    expect(Math.abs(icon.width - text.width)).toBeLessThan(0.5)
    expect(Math.abs(icon.height - text.height)).toBeLessThan(0.5)
    expect(icon.width).toBeGreaterThan(icon.height)
    for (const value of ['zoom-in', 'zoom-out']) {
      const { width, height } = box(item(value))
      expect(Math.abs(width - height)).toBeLessThan(0.5)
    }
  })
})
