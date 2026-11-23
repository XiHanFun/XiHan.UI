// 树选择的候选面板是锚定浮层里的集合，行与 Select 的选项同高：两个下拉并排摆在一张表单里，
// 展开后一行高一行矮看得出来。只有真实浏览器量得出行盒的高。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhSelectRoot, XhTreeSelectRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const options = [{ value: 'a', label: '甲' }, { value: 'b', label: '乙' }]
const tree = [{ value: 'branch', label: '分支', children: [{ value: 'leaf', label: '叶子' }] }, { value: 'solo', label: '单独的叶子' }]

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  document.getElementById('xh-portal-root')?.replaceChildren()
  app = null
  host = null
})

async function mountBoth(size: 'sm' | 'md' | 'lg'): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => [
      h(XhSelectRoot, { collection: options, open: true, size }),
      h(XhTreeSelectRoot, { collection: tree, open: true, size, defaultExpandedValue: ['branch'] }),
    ],
  })
  app.mount(host)
  await nextTick()
  await nextTick()
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

function heightOf(selector: string): number {
  const el = document.querySelector<HTMLElement>(selector)
  if (!el)
    throw new Error(`找不到 ${selector}`)
  return el.getBoundingClientRect().height
}

describe('树选择的行与 Select 的选项同高', () => {
  for (const size of ['sm', 'md', 'lg'] as const) {
    it(`${size} 档：叶子行、分支行与 Select 的选项一样高`, async () => {
      await mountBoth(size)
      const option = heightOf('[data-scope="select"][data-part="item"]')
      expect(option).toBeGreaterThan(0)
      expect(heightOf('[data-scope="tree-select"][data-part="item"]')).toBeCloseTo(option, 0)
      expect(heightOf('[data-scope="tree-select"][data-part="branch-control"]')).toBeCloseTo(option, 0)
    })
  }
})
