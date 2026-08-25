// 量一量：一枚标签一台状态机，到底贵不贵。
//
// 表格一页几十行、每行几个状态药丸，就是几百枚。徽标原先是零状态机的纯计算，
// 迁到 tag 后每枚都建一台——这是不是真的性能回归，得量了才知道，不能靠感觉。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhTagLabel, XhTagRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

const COUNT = 400

async function mountMany(render: (i: number) => unknown): Promise<number> {
  host = document.createElement('div')
  document.body.append(host)
  const t0 = performance.now()
  app = createApp({
    setup: () => () => Array.from({ length: COUNT }, (_, i) => render(i)),
  })
  app.mount(host)
  await nextTick()
  return performance.now() - t0
}

describe('标签的挂载开销', () => {
  it(`${COUNT} 枚标签 vs ${COUNT} 个等价的裸 span`, async () => {
    // 先跑一遍热身，把首次编译与皮肤解析摊掉
    await mountMany(i => h('span', { key: i }, String(i)))
    app?.unmount()
    host?.remove()

    const bare = await mountMany(i => h('span', { key: i }, String(i)))
    expect(host!.children).toHaveLength(COUNT)
    app?.unmount()
    host?.remove()

    const tags = await mountMany(i =>
      h(XhTagRoot, { key: i, variant: 'subtle', size: 'sm' }, () => [h(XhTagLabel, () => String(i))]),
    )
    expect(host!.children).toHaveLength(COUNT)

    // 只报数，不断言阈值：这条是用来看数的，阈值会随机器与负载漂
    console.warn(`\n[bench] 裸 span ${bare.toFixed(1)}ms · 标签 ${tags.toFixed(1)}ms · 每枚 ${((tags - bare) / COUNT).toFixed(3)}ms`)
    expect(tags).toBeGreaterThan(0)
  })
})
