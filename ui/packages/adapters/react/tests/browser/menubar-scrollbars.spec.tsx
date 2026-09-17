// 菜单栏每张菜单各配一套自绘条：条子挂在那张菜单已经 fixed 的 positioner 里、走浮层 4px 档。
import type { Root } from 'react-dom/client'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import {
  XhMenubarContent,
  XhMenubarItem,
  XhMenubarItemText,
  XhMenubarPositioner,
  XhMenubarRoot,
  XhMenubarTrigger,
} from '../../src'
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

async function settle(): Promise<void> {
  for (let i = 0; i < 4; i++)
    await inAct(async () => Promise.resolve())
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

afterEach(async () => {
  await inAct(() => root?.unmount())
  root = null
  host?.remove()
  host = null
  document.getElementById('xh-portal-root')?.remove()
})

function content(value: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope='menubar'][data-part='content'][data-value='${value}']`)!
}

describe('react menubar 自绘条', () => {
  it('条目超过限高时条子挂在开着那张菜单的 positioner 里、走 4px 档，滚动面藏原生条', async () => {
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
    await inAct(() => root!.render(
      <XhMenubarRoot defaultValue="file">
        <XhMenubarTrigger value="file">文件</XhMenubarTrigger>
        <XhMenubarPositioner value="file">
          <XhMenubarContent style={{ inlineSize: 200, maxBlockSize: 160 }}>
            {Array.from({ length: 40 }, (_, i) => (
              <XhMenubarItem key={i} value={`file-${i}`}>
                <XhMenubarItemText>{`条目 ${i}`}</XhMenubarItemText>
              </XhMenubarItem>
            ))}
          </XhMenubarContent>
        </XhMenubarPositioner>
        <XhMenubarTrigger value="edit">编辑</XhMenubarTrigger>
        <XhMenubarPositioner value="edit">
          <XhMenubarContent style={{ inlineSize: 200 }}>
            <XhMenubarItem value="copy"><XhMenubarItemText>复制</XhMenubarItemText></XhMenubarItem>
          </XhMenubarContent>
        </XhMenubarPositioner>
      </XhMenubarRoot>,
    ))
    await settle()

    const file = content('file')
    expect(file.scrollHeight).toBeGreaterThan(file.clientHeight)
    expect(file.hasAttribute('data-xh-scrollbar')).toBe(true)
    const positioner = file.parentElement!
    expect(positioner.getAttribute('data-part')).toBe('positioner')
    const bar = positioner.querySelector<HTMLElement>('[data-scope="scrollbar"][data-part="root"]')
    expect(bar).not.toBeNull()
    expect(bar!.getAttribute('data-size')).toBe('sm')
    expect(getComputedStyle(positioner).getPropertyValue('--xh-scrollbar-track-bg').trim()).toBe('transparent')
  })
})
