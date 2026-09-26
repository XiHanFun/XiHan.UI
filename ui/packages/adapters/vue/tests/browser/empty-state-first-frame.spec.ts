// 空状态的开幕只在出现时播。钉住三件事：页面加载完成之后挂上的逐段开幕；
// 服务端渲染后水合的随首屏就在、直接呈现，也不在水合时补播；首屏那一份收起再显出时照常开幕。
import type { App } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, createSSRApp, h, nextTick, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { XhEmptyStateDescription, XhEmptyStateIndicator, XhEmptyStateRoot, XhEmptyStateTitle } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null
let app: App | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  vi.restoreAllMocks()
})

const hidden = ref(false)

function emptyState() {
  return h(XhEmptyStateRoot, { hidden: hidden.value || undefined }, () => [
    h(XhEmptyStateIndicator, null, () => '∅'),
    h(XhEmptyStateTitle, null, () => '还没有项目'),
    h(XhEmptyStateDescription, null, () => '新建一个项目后会出现在这里。'),
  ])
}

function part(name: string): HTMLElement {
  return host!.querySelector<HTMLElement>(`[data-scope="empty-state"][data-part="${name}"]`)!
}

/** 等出现追踪接上（提交后的微任务）与一帧样式计算。 */
async function settle(): Promise<void> {
  await nextTick()
  await Promise.resolve()
  await nextTick()
  await new Promise(resolve => requestAnimationFrame(() => resolve(undefined)))
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
    hidden.value = false
    app = createApp({ render: emptyState })
    app.mount(mountHost())
    await settle()
    const title = part('title')
    expect(title.hasAttribute('data-instant')).toBe(false)
    expect(getComputedStyle(title).animationName).toBe('xh-rise-in')
    // 标题排在图标之后一个错开步长，这一帧还停在起帧附近
    expect(Number(getComputedStyle(title).opacity)).toBeLessThan(1)
  })

  it('服务端渲染后水合：随首屏就在，直接呈现，水合也不补播', async () => {
    hidden.value = false
    const html = await renderToString(createSSRApp({ render: emptyState }))
    expect(html).toContain('data-instant')
    mountHost().innerHTML = html
    const errors = vi.spyOn(console, 'error')
    const warnings = vi.spyOn(console, 'warn')
    app = createSSRApp({ render: emptyState })
    app.mount(host!)
    await settle()
    expect(errors).not.toHaveBeenCalled()
    expect(warnings).not.toHaveBeenCalled()
    for (const name of ['indicator', 'title', 'description']) {
      expect(part(name).hasAttribute('data-instant')).toBe(true)
      expect(getComputedStyle(part(name)).animationName).toBe('none')
      expect(getComputedStyle(part(name)).opacity).toBe('1')
    }
  })

  it('首屏那一份收起再显出：这一次是新出现的，照常开幕', async () => {
    hidden.value = false
    const html = await renderToString(createSSRApp({ render: emptyState }))
    mountHost().innerHTML = html
    app = createSSRApp({ render: emptyState })
    app.mount(host!)
    await settle()
    expect(getComputedStyle(part('title')).animationName).toBe('none')

    hidden.value = true
    await settle()
    // 收起那一刻盒尺寸归零，观察器在下一帧之前回调
    await settle()
    expect(part('title').hasAttribute('data-instant')).toBe(false)

    hidden.value = false
    await settle()
    expect(getComputedStyle(part('title')).animationName).toBe('xh-rise-in')
  })
})
