import type { App, Ref } from 'vue'
import { getLayerRegistry } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import {
  XhPopconfirmContent,
  XhPopconfirmPositioner,
  XhPopconfirmRoot,
  XhPopconfirmTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

async function settle(): Promise<void> {
  await nextTick()
  await nextTick()
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

async function mount(): Promise<Ref<boolean>> {
  const open = ref(true)
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhPopconfirmRoot, { open: open.value }, () => [
      h(XhPopconfirmTrigger, null, () => '删除'),
      h(XhPopconfirmPositioner, null, () => h(XhPopconfirmContent, null, () => '确定删除？')),
    ]),
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

describe('vue popconfirm 真实退场资源', () => {
  it('有限动画完成前保留 Layer，逻辑关闭立即失活，完成后释放', async () => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes test-popconfirm-exit { from { opacity: 1 } to { opacity: 0 } }
      [data-scope='popconfirm'][data-part='content'][data-state='closed'] {
        animation: test-popconfirm-exit 60s linear forwards;
      }
    `
    document.body.append(style)
    const open = await mount()
    expect(getLayerRegistry(document).list()).toHaveLength(1)

    open.value = false
    await settle()
    const content = document.querySelector<HTMLElement>("[data-scope='popconfirm'][data-part='content']")!
    expect(content.inert).toBe(true)
    expect(content.getAttribute('aria-hidden')).toBe('true')
    expect(getLayerRegistry(document).list()).toHaveLength(1)

    const animation = content.getAnimations().find(item => (item as CSSAnimation).animationName === 'test-popconfirm-exit')
    expect(animation).toBeDefined()
    animation!.finish()
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(0)
  })
})
