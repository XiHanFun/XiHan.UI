import type { ReactNode } from 'react'
import type { Root } from 'react-dom/client'
import { getLayerRegistry } from '@xihan-ui/core'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import {
  XhNavigationMenuContent,
  XhNavigationMenuIndicator,
  XhNavigationMenuItem,
  XhNavigationMenuLink,
  XhNavigationMenuList,
  XhNavigationMenuRoot,
  XhNavigationMenuTrigger,
  XhNavigationMenuViewport,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let root: Root | null = null
let host: HTMLElement | null = null

const globals = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }

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
  for (let index = 0; index < 4; index++) {
    await inAct(async () => {
      await Promise.resolve()
    })
  }
}

async function mount(render: (value: string | null, showContent: boolean) => ReactNode): Promise<(value: string | null, showContent?: boolean) => Promise<void>> {
  host = document.createElement('div')
  document.body.append(host)
  const created = createRoot(host)
  root = created
  const setValue = async (value: string | null, showContent = true): Promise<void> => {
    await inAct(() => {
      created.render(render(value, showContent))
    })
    await settle()
  }
  await setValue('products')
  return setValue
}

afterEach(async () => {
  if (root) {
    const current = root
    await inAct(() => {
      current.unmount()
    })
  }
  root = null
  host?.remove()
  host = null
  document.body.innerHTML = ''
})

describe('react navigation-menu 的退出资源', () => {
  it('面板退场动画完成前保留 Layer，完成后才释放', async () => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes test-navigation-menu-exit { from { opacity: 1 } to { opacity: 0 } }
      [data-scope='navigation-menu'][data-part='content'][data-state='closed'] {
        animation: test-navigation-menu-exit 60s linear forwards;
      }
    `
    document.body.append(style)
    const setValue = await mount((value, showContent) => (
      <XhNavigationMenuRoot value={value}>
        <XhNavigationMenuList>
          <XhNavigationMenuItem>
            <XhNavigationMenuTrigger value="products">产品</XhNavigationMenuTrigger>
          </XhNavigationMenuItem>
          <XhNavigationMenuIndicator />
        </XhNavigationMenuList>
        <XhNavigationMenuViewport>
          {showContent && (
            <XhNavigationMenuContent value="products"><XhNavigationMenuLink href="#products">产品入口</XhNavigationMenuLink></XhNavigationMenuContent>
          )}
        </XhNavigationMenuViewport>
      </XhNavigationMenuRoot>
    ))
    expect(getLayerRegistry(document).list()).toHaveLength(1)

    await setValue(null)
    const content = document.querySelector<HTMLElement>('[data-scope="navigation-menu"][data-part="content"]')!
    const viewport = document.querySelector<HTMLElement>('[data-scope="navigation-menu"][data-part="viewport"]')!
    const link = content.querySelector<HTMLAnchorElement>('[data-part="link"]')!
    expect(getComputedStyle(content).display).not.toBe('none')
    expect(getComputedStyle(viewport).display).not.toBe('none')
    expect(content.inert).toBe(true)
    expect(content.getAttribute('aria-hidden')).toBe('true')
    link.focus()
    expect(document.activeElement).not.toBe(link)
    const animations = content.getAnimations().filter(animation => Number.isFinite(animation.effect?.getComputedTiming().endTime))
    expect(animations).toHaveLength(1)
    expect(getLayerRegistry(document).list()).toHaveLength(1)

    animations[0]!.finish()
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(0)
    expect(content.style.display).toBe('none')
    expect(viewport.hidden).toBe(true)
  })

  it('退场中的活动面板卸载后立即释放 Layer', async () => {
    const setValue = await mount((value, showContent) => (
      <XhNavigationMenuRoot value={value}>
        <XhNavigationMenuList>
          <XhNavigationMenuItem><XhNavigationMenuTrigger value="products">产品</XhNavigationMenuTrigger></XhNavigationMenuItem>
        </XhNavigationMenuList>
        <XhNavigationMenuViewport>
          {showContent && <XhNavigationMenuContent value="products">产品入口</XhNavigationMenuContent>}
        </XhNavigationMenuViewport>
      </XhNavigationMenuRoot>
    ))
    expect(getLayerRegistry(document).list()).toHaveLength(1)
    await setValue(null)
    expect(getLayerRegistry(document).list()).toHaveLength(1)
    await setValue(null, false)
    expect(getLayerRegistry(document).list()).toHaveLength(0)
  })
})
