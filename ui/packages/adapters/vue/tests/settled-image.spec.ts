// @vitest-environment jsdom

import { describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhAvatarFallback, XhAvatarImage, XhAvatarRoot } from '../src'

/**
 * load / error 监听器要等节点挂上才生效，可图片有可能在那之前就已经就绪：
 * 注水接管服务端渲染出的 `<img>` 时，那一次 load 早在客户端代码跑起来之前就派发完了，
 * 没有任何人接得住。机器于是永远等不到 IMAGE.LOAD，状态卡死在 loading——
 * 图明明在手边，页面却一直显示首字母回退。
 *
 * jsdom 从不真的取图、也从不派发 load，正好就是这个形状：把 img 伪造成"已就绪"，
 * 若适配器没有挂载后的补报，状态就永远停在 loading。
 */

interface SettledImage {
  complete: boolean
  naturalWidth: number
  currentSrc: string
}

/** 把原型改成"取回成功"的样子：jsdom 里这三个属性都是只读的，只能在原型上盖。 */
function withSettledImages<T>(settled: SettledImage, run: () => Promise<T>): Promise<T> {
  const proto = window.HTMLImageElement.prototype
  const saved = (['complete', 'naturalWidth', 'currentSrc'] as const)
    .map(k => [k, Object.getOwnPropertyDescriptor(proto, k)] as const)
  for (const [k, v] of Object.entries(settled))
    Object.defineProperty(proto, k, { configurable: true, get: () => v })
  return run().finally(() => {
    for (const [k, d] of saved) {
      if (d)
        Object.defineProperty(proto, k, d)
      else
        Reflect.deleteProperty(proto, k)
    }
  })
}

const SRC = 'https://example.test/a.png'

async function mountAvatar(): Promise<{ root: HTMLElement, teardown: () => void }> {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp({
    render: () => h(XhAvatarRoot, { src: SRC }, () => [h(XhAvatarImage), h(XhAvatarFallback, () => 'XH')]),
  })
  app.mount(host)
  await nextTick()
  await nextTick()
  return {
    root: host.firstElementChild as HTMLElement,
    teardown: () => {
      app.unmount()
      host.remove()
    },
  }
}

describe('avatar 挂载前就已就绪的图片', () => {
  it('补报 IMAGE.LOAD：状态进 loaded，图显出、回退收起', async () => {
    await withSettledImages({ complete: true, naturalWidth: 64, currentSrc: SRC }, async () => {
      const { root, teardown } = await mountAvatar()
      try {
        const img = root.querySelector<HTMLElement>('[data-part="image"]')!
        const fallback = root.querySelector<HTMLElement>('[data-part="fallback"]')!
        expect(root.getAttribute('data-state')).toBe('loaded')
        expect(img.hasAttribute('hidden')).toBe(false)
        expect(fallback.hasAttribute('hidden')).toBe(true)
      }
      finally {
        teardown()
      }
    })
  })

  it('取回失败（naturalWidth 为 0）不冒认成功：仍留在 loading，显示回退', async () => {
    await withSettledImages({ complete: true, naturalWidth: 0, currentSrc: SRC }, async () => {
      const { root, teardown } = await mountAvatar()
      try {
        expect(root.getAttribute('data-state')).toBe('loading')
        expect(root.querySelector('[data-part="fallback"]')!.hasAttribute('hidden')).toBe(false)
      }
      finally {
        teardown()
      }
    })
  })

  it('换图那一瞬旧图仍 complete，currentSrc 对不上则不补报：不会把旧图当新图显出来', async () => {
    await withSettledImages({ complete: true, naturalWidth: 64, currentSrc: 'https://example.test/旧图.png' }, async () => {
      const { root, teardown } = await mountAvatar()
      try {
        expect(root.getAttribute('data-state')).toBe('loading')
      }
      finally {
        teardown()
      }
    })
  })
})
