// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhTransferRoot, XhTransferSourcePanel, XhTransferTargetPanel } from '../src'

/**
 * 面板插槽递出来的是「这一侧当下看得见的条目」，与数据入口 collection 是两回事：
 * 入口是整份全集，插槽这份已经分过侧、过过搜索。
 *
 * 这两个名字曾被一次批量改名混为一谈——插槽变量跟着入口改成了 collection，
 * 所有 `v-slot="{ items }"` 的用法当场取到 undefined。TS 看不见插槽变量名，
 * 唯一会红的地方是运行期，所以判据只能落在这里。
 */

const ITEMS = [
  { value: 'a', label: '甲' },
  { value: 'b', label: '乙' },
  { value: 'c', label: '丙' },
]

afterEach(() => {
  document.body.innerHTML = ''
})

function mount(): { host: HTMLElement, 源: Record<string, unknown>, 目标: Record<string, unknown>, unmount: () => void } {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const seen: Record<string, Record<string, unknown>> = {}
  const app = createApp({
    setup: () => () =>
      h(XhTransferRoot, { collection: ITEMS, defaultValue: ['c'] }, {
        default: () => [
          h(XhTransferSourcePanel, null, {
            default: (props: Record<string, unknown>) => {
              seen.source = props
              return []
            },
          }),
          h(XhTransferTargetPanel, null, {
            default: (props: Record<string, unknown>) => {
              seen.target = props
              return []
            },
          }),
        ],
      }),
  })
  app.mount(host)
  return { host, 源: seen.source!, 目标: seen.target!, unmount: () => app.unmount() }
}

describe('面板插槽的变量', () => {
  it('递出 items（本侧可见条目），不是 collection', async () => {
    const m = mount()
    try {
      await nextTick()
      expect(Object.keys(m.源).sort()).toEqual(['checkState', 'items', 'query', 'side'])
      expect(m.源.collection).toBeUndefined()
    }
    finally {
      m.unmount()
    }
  })

  it('两侧各拿各的：默认值落在右侧，源侧就少了那一条', async () => {
    const m = mount()
    try {
      await nextTick()
      const 源值 = (m.源.items as { value: string }[]).map(x => x.value)
      const 目标值 = (m.目标.items as { value: string }[]).map(x => x.value)
      expect(源值).toEqual(['a', 'b'])
      expect(目标值).toEqual(['c'])
    }
    finally {
      m.unmount()
    }
  })
})
