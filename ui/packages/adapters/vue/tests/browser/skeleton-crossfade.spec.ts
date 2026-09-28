// 骨架屏到真实内容的交叉淡变：刚加载完的骨架让出版面、原地盖在内容之上淡出；挂载时就已加载完的直接收起。
// 版面让位、盖住的位置与淡出的生命周期只有真实浏览器量得出。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import { XhSkeletonItem, XhSkeletonRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
})

async function mount(initial: boolean, layout: 'block' | 'grid' = 'grid'): Promise<{ loading: { value: boolean } }> {
  const loading = ref(initial)
  host = document.createElement('div')
  host.style.cssText = layout === 'grid' ? 'display: grid; gap: 12px; justify-items: start; inline-size: 400px' : 'inline-size: 400px'
  document.body.append(host)
  app = createApp({
    render: () => [
      h('button', { type: 'button' }, '刷新'),
      h(XhSkeletonRoot, { loading: loading.value, style: 'inline-size: 260px' }, () => [h(XhSkeletonItem), h(XhSkeletonItem), h(XhSkeletonItem)]),
      loading.value ? null : h('p', { 'data-testid': 'content', 'style': 'margin: 0; block-size: 60px' }, '真内容'),
    ],
  })
  app.mount(host)
  await nextTick()
  return { loading }
}

function root(): HTMLElement {
  return host!.querySelector<HTMLElement>('[data-scope="skeleton"][data-part="root"]')!
}

function content(): HTMLElement {
  return host!.querySelector<HTMLElement>('[data-testid="content"]')!
}

describe('骨架屏交叉淡变', () => {
  it('挂载时就已加载完：骨架直接收起，不播淡出', async () => {
    await mount(false)
    expect(root().hidden).toBe(true)
    expect(root().getAnimations()).toHaveLength(0)
  })

  it.each(['grid', 'block'] as const)('%s 布局里刚加载完：骨架让出版面、原地盖在内容之上淡出，播完才收起', async (layout) => {
    const { loading } = await mount(true, layout)
    const before = root().getBoundingClientRect()

    loading.value = false
    // 下一帧绘制之前：骨架已让出版面
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
    const skeleton = root()
    expect(skeleton.hidden).toBe(false)
    expect(getComputedStyle(skeleton).animationName).toBe('xh-fade-out')
    // 让出版面：内容落在骨架原来的位置上，骨架原地不动、尺寸不变
    const after = skeleton.getBoundingClientRect()
    expect([after.left, after.top, after.width, after.height]).toEqual([before.left, before.top, before.width, before.height])
    expect(content().getBoundingClientRect().top).toBe(before.top)

    await Promise.all(skeleton.getAnimations().map(animation => animation.finished))
    await expect.poll(() => skeleton.hidden).toBe(true)
    // 收起之后还原：作者自己写的内联宽度留着，抬出文档流的那几条撤掉
    await expect.poll(() => skeleton.style.position).toBe('')
    expect(skeleton.style.translate).toBe('')
    expect(skeleton.style.width).toBe('')
    expect(skeleton.style.inlineSize).toBe('260px')
  })

  it('淡出途中又开始加载：骨架回到版面里照常占位', async () => {
    const { loading } = await mount(true)
    const before = root().getBoundingClientRect()
    loading.value = false
    await nextTick()
    loading.value = true
    await nextTick()
    await nextTick()
    expect(root().hidden).toBe(false)
    expect(getComputedStyle(root()).position).toBe('static')
    const after = root().getBoundingClientRect()
    expect([after.top, after.height]).toEqual([before.top, before.height])
  })
})
