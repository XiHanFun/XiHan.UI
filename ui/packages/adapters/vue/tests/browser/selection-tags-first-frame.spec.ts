// 多选控件的标签行：挂载时就在的标签直接呈现，不播进场。
// 列表动效在提交后的微任务里才接上、才给首帧的标签打标记；这之间任何一次样式计算都不能让它们起播。
// 挂载后同步读计算样式就是那一次样式计算，只有真实浏览器跑得出关键帧。
import type { CascaderApi } from '@xihan-ui/headless'
import type { App, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'
import {
  XhCascaderControl,
  XhCascaderIndicator,
  XhCascaderOverflowTag,
  XhCascaderRoot,
  XhCascaderTag,
  XhCascaderTagList,
  XhCascaderTrigger,
  XhCascaderValueText,
  XhComboboxRoot,
  XhSelectRoot,
  XhTreeSelectRoot,
} from '../../src'
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

const CITIES = ['北京', '上海', '广州'].map(label => ({ value: label, label }))
const TREE = [
  {
    value: 'east',
    label: '华东',
    children: [
      { value: 'sh', label: '上海' },
      { value: 'hz', label: '杭州' },
    ],
  },
]

/** 挂上之后不等任何微任务，直接读标签行里每一枚标签此刻的动画名。 */
function mountAndRead(scope: string, render: () => VNode): string[] {
  host = document.createElement('div')
  host.style.inlineSize = '320px'
  document.body.append(host)
  app = createApp({ render })
  app.mount(host)
  const tags = [...host.querySelectorAll<HTMLElement>(`[data-scope='${scope}'][data-part='tag-list'] > [data-scope='tag'][data-part='root'][data-value]`)]
  expect(tags.length).toBeGreaterThan(0)
  return tags.map(tag => getComputedStyle(tag).animationName)
}

describe('标签行首帧的标签不播进场', () => {
  it('select', () => {
    const names = mountAndRead('select', () => h(XhSelectRoot, { collection: CITIES, multiple: true, defaultValue: ['北京', '上海'] }))
    expect(names).toEqual(['none', 'none'])
  })

  it('combobox', () => {
    const names = mountAndRead('combobox', () => h(XhComboboxRoot, { collection: CITIES, multiple: true, label: '城市', defaultValue: ['北京', '上海'] }))
    expect(names).toEqual(['none', 'none'])
  })

  it('tree-select', () => {
    const names = mountAndRead('tree-select', () => h(XhTreeSelectRoot, { collection: TREE, multiple: true, defaultValue: ['sh', 'hz'] }))
    expect(names).toEqual(['none', 'none'])
  })

  it('cascader', () => {
    const names = mountAndRead('cascader', () => h(XhCascaderRoot, { collection: TREE, multiple: true, defaultValue: [['east', 'sh'], ['east', 'hz']] }, {
      default: ({ tags }: Pick<CascaderApi, 'tags'>) => [
        h(XhCascaderControl, null, () => h(XhCascaderTrigger, null, () => [
          h(XhCascaderValueText),
          h(XhCascaderTagList, null, () => [
            ...tags.map(tag => h(XhCascaderTag, { key: tag.key, value: tag.key }, () => tag.label)),
            h(XhCascaderOverflowTag),
          ]),
          h(XhCascaderIndicator),
        ])),
      ],
    }))
    expect(names).toEqual(['none', 'none'])
  })
})
