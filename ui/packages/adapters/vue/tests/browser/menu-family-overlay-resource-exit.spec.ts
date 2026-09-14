import type { App, Ref } from 'vue'
import { getLayerRegistry } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import {
  XhContextMenuContent,
  XhContextMenuPositioner,
  XhContextMenuRoot,
  XhContextMenuTrigger,
  XhMenubarContent,
  XhMenubarPositioner,
  XhMenubarRoot,
  XhMenubarTrigger,
  XhMenuContent,
  XhMenuPositioner,
  XhMenuRoot,
  XhMenuTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

type Family = 'context-menu' | 'menu' | 'menubar'

let app: App | null = null
let host: HTMLElement | null = null

async function settle(): Promise<void> {
  await nextTick()
  await nextTick()
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

async function mount(family: Family): Promise<Ref<boolean>> {
  const open = ref(true)
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => {
      if (family === 'context-menu') {
        return h(XhContextMenuRoot, { open: open.value }, () => [
          h(XhContextMenuTrigger, null, () => '区域'),
          h(XhContextMenuPositioner, null, () => h(XhContextMenuContent)),
        ])
      }
      if (family === 'menubar') {
        return h(XhMenubarRoot, { value: open.value ? 'file' : null }, () => [
          h(XhMenubarTrigger, { value: 'file' }, () => '文件'),
          h(XhMenubarPositioner, { value: 'file' }, () => h(XhMenubarContent, { value: 'file' })),
        ])
      }
      return h(XhMenuRoot, { open: open.value }, () => [
        h(XhMenuTrigger, null, () => '菜单'),
        h(XhMenuPositioner, null, () => h(XhMenuContent)),
      ])
    },
  })
  app.mount(host)
  await settle()
  return open
}

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  document.body.innerHTML = ''
})

describe.each(['context-menu', 'menu', 'menubar'] as const)('vue %s 真实退场资源', (scope) => {
  it('退场完成前保留 Layer，重开取消旧退出，最终完成后释放', async () => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes test-menu-family-exit { from { opacity: 1 } to { opacity: 0 } }
      [data-scope='${scope}'][data-part='content'][data-state='closed'] {
        animation: test-menu-family-exit 60s linear forwards;
      }
    `
    document.body.append(style)
    const open = await mount(scope)
    const original = getLayerRegistry(document).list()[0]
    expect(original).toBeDefined()

    open.value = false
    await settle()
    const content = document.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='content']`)!
    expect(content.inert).toBe(true)
    expect(content.getAttribute('aria-hidden')).toBe('true')
    const firstExit = content.getAnimations().find(item => (item as CSSAnimation).animationName === 'test-menu-family-exit')
    expect(firstExit).toBeDefined()
    expect(getLayerRegistry(document).list()).toEqual([original])

    open.value = true
    await settle()
    expect(getLayerRegistry(document).list()).toEqual([original])
    firstExit!.cancel()
    open.value = false
    await settle()
    const finalExit = content.getAnimations().find(item => (item as CSSAnimation).animationName === 'test-menu-family-exit')
    expect(finalExit).toBeDefined()
    finalExit!.finish()
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(0)
  })
})
