import type { App, Ref } from 'vue'
import { getLayerRegistry } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
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

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  document.body.innerHTML = ''
})

async function settle(): Promise<void> {
  await nextTick()
  await nextTick()
}

function mount(): { value: Ref<string | null>, showContent: Ref<boolean> } {
  const value = ref<string | null>('products')
  const showContent = ref(true)
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ setup: () => () => h(XhNavigationMenuRoot, { value: value.value }, {
    default: () => [
      h(XhNavigationMenuList, null, () => [
        h(XhNavigationMenuItem, null, () => h(XhNavigationMenuTrigger, { value: 'products' }, () => '产品')),
        h(XhNavigationMenuIndicator),
      ]),
      h(XhNavigationMenuViewport, null, () => showContent.value
        ? h(XhNavigationMenuContent, { value: 'products' }, () => h(XhNavigationMenuLink, { href: '#products' }, () => '产品入口'))
        : null),
    ],
  }) })
  app.mount(host)
  return { value, showContent }
}

describe('vue navigation-menu 的退出资源', () => {
  it('面板退场动画完成前保留 Layer，完成后才释放', async () => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes test-navigation-menu-exit { from { opacity: 1 } to { opacity: 0 } }
      [data-scope='navigation-menu'][data-part='content'][data-state='closed'] {
        animation: test-navigation-menu-exit 60s linear forwards;
      }
    `
    document.body.append(style)
    const { value } = mount()
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(1)

    value.value = null
    await settle()
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
    await new Promise(resolve => requestAnimationFrame(() => resolve(null)))
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(0)
    expect(content.style.display).toBe('none')
    expect(viewport.hidden).toBe(true)
  })

  it('退场中的活动面板卸载后立即释放 Layer', async () => {
    const { value, showContent } = mount()
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(1)
    value.value = null
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(1)
    showContent.value = false
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(0)
  })
})
