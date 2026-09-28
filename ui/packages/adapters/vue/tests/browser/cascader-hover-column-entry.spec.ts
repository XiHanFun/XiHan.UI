// expandTrigger='hover'：指针扫过同一列的父项时，子列换一批内容，不重播列的进场（淡入 + 错开）；
// 只有子列头一次出现（此前收着）时才播。
import type { CascaderLevel } from '@xihan-ui/headless'
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhCascaderColumn,
  XhCascaderContent,
  XhCascaderControl,
  XhCascaderItem,
  XhCascaderItemText,
  XhCascaderPositioner,
  XhCascaderRoot,
  XhCascaderTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const COLLECTION = [
  { value: 'fruit', label: '水果', children: [{ value: 'apple', label: '苹果' }, { value: 'pear', label: '梨' }] },
  { value: 'veg', label: '蔬菜', children: [{ value: 'carrot', label: '胡萝卜' }, { value: 'potato', label: '土豆' }] },
  { value: 'rice', label: '大米' },
]

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  document.getElementById('xh-portal-root')?.remove()
  app = null
  host = null
})

async function frame(): Promise<void> {
  await nextTick()
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

async function mount(): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhCascaderRoot, { collection: COLLECTION, open: true, expandTrigger: 'hover' }, {
      default: ({ levels }: { levels: CascaderLevel[] }) => [
        h(XhCascaderControl, null, () => [h(XhCascaderTrigger, null, () => '选择')]),
        h(XhCascaderPositioner, null, () => [
          h(XhCascaderContent, { style: { inlineSize: '440px' } }, () =>
            levels.map(level => h(XhCascaderColumn, { key: level.level, level: level.level }, () =>
              level.items.map(node => h(XhCascaderItem, { key: node.value, value: node.value }, () =>
                h(XhCascaderItemText, null, () => node.label)))))),
        ]),
      ],
    }),
  })
  app.mount(host)
  await frame()
  for (const animation of document.getAnimations())
    animation.finish()
}

function item(value: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[data-scope='cascader'][data-part='item'][data-value='${value}']`)
  if (!el)
    throw new Error(`找不到 cascader/item ${value}`)
  return el
}

/** 条目身上正在播的列进场关键帧 */
function entering(value: string): boolean {
  return item(value).getAnimations().some(animation => (animation as CSSAnimation).animationName === 'xh-fade-in')
}

describe('cascader 悬停展开', () => {
  it('子列头一次出现时播进场，扫到同列另一个父项时换内容不重播', async () => {
    await mount()
    await userEvent.hover(item('fruit'))
    await frame()
    expect(entering('apple')).toBe(true)
    for (const animation of document.getAnimations())
      animation.finish()

    await userEvent.hover(item('veg'))
    await frame()
    expect(item('carrot').hidden).toBe(false)
    expect(entering('carrot')).toBe(false)
    expect(entering('potato')).toBe(false)

    // 扫到叶子：子列收起；再扫回父项，子列重新出现，照常播进场
    await userEvent.hover(item('rice'))
    await frame()
    await userEvent.hover(item('fruit'))
    await frame()
    expect(entering('apple')).toBe(true)
  })
})
