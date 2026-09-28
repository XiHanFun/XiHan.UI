// 多选级联把已选路径摆成一行标签，排在触发器里：与 Select 同一套呈现（maxTagCount、+N、列表动效）。
// 触发器是一行控件：标签越选越多，盒不许被撑高，标签不许冲出盒外；有选中时占位文字让位。
//
// 只有真实浏览器量得出来：盒高、标签的右缘与盒的右缘都是布局结果，动画是否在播也得真跑 CSS。
import type { CascaderApi } from '@xihan-ui/headless'
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import {
  XhCascaderControl,
  XhCascaderIndicator,
  XhCascaderOverflowTag,
  XhCascaderRoot,
  XhCascaderTag,
  XhCascaderTagList,
  XhCascaderTrigger,
  XhCascaderValueText,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

function teardown(): void {
  app?.unmount()
  host?.remove()
  app = null
  host = null
}

afterEach(() => teardown())

const COLLECTION = [
  {
    value: 'east',
    label: '华东',
    children: [
      { value: 'sh', label: '上海' },
      { value: 'hz', label: '杭州' },
      { value: 'nj', label: '南京' },
    ],
  },
  {
    value: 'south',
    label: '华南',
    children: [
      { value: 'gz', label: '广州' },
      { value: 'sz', label: '深圳' },
    ],
  },
]

async function settle(): Promise<void> {
  await nextTick()
  await new Promise(resolve => requestAnimationFrame(resolve))
  await nextTick()
}

async function mountCascader(picked: readonly string[][], width = 280): Promise<{ value: { value: string[][] } }> {
  host = document.createElement('div')
  host.style.inlineSize = `${width}px`
  document.body.append(host)
  const value = ref(picked.map(path => [...path]))
  app = createApp({
    render: () => h(XhCascaderRoot, {
      'collection': COLLECTION,
      'multiple': true,
      'placeholder': '请选择城市',
      'style': 'inline-size: 100%',
      'value': value.value,
      'onUpdate:value': (next: string[][]) => {
        value.value = next
      },
    }, {
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
    }),
  })
  app.mount(host)
  await settle()
  return { value }
}

function part(name: string): HTMLElement {
  const el = host?.querySelector<HTMLElement>(`[data-scope='cascader'][data-part='${name}']`)
  if (!el)
    throw new Error(`挂载树里没有 ${name}`)
  return el
}

const TAG_ROOT = `[data-scope='tag'][data-part='root']`

function tags(): HTMLElement[] {
  return [...part('tag-list').querySelectorAll<HTMLElement>(`:scope > ${TAG_ROOT}[data-value]:not([inert])`)]
}

function running(el: Element): string[] {
  return el.getAnimations().filter(a => a instanceof CSSAnimation).map(a => a.animationName)
}

const rect = (el: HTMLElement): DOMRect => el.getBoundingClientRect()

describe('多选级联：已选路径在触发器里排成标签', () => {
  it('无选中时标签行收起、占位文字露面；选中后标签露面、占位让位，文字是整条路径', async () => {
    await mountCascader([])
    expect(getComputedStyle(part('tag-list')).display).toBe('none')
    expect(getComputedStyle(part('value-text')).display).not.toBe('none')
    teardown()
    await mountCascader([['east', 'hz'], ['south', 'gz']])
    expect(tags().map(tag => tag.textContent)).toEqual(['华东 / 杭州', '华南 / 广州'])
    expect(getComputedStyle(part('value-text')).display).toBe('none')
  })

  it('盒高不随标签数变；3 枚之外折成 +N，标签与 +N 都不越出盒外', async () => {
    await mountCascader([])
    const empty = Math.round(rect(part('control')).height)
    teardown()
    await mountCascader([['east', 'sh'], ['east', 'hz'], ['east', 'nj'], ['south', 'gz'], ['south', 'sz']], 220)
    expect(Math.round(rect(part('control')).height)).toBe(empty)
    expect(tags()).toHaveLength(3)
    const overflow = part('tag-list').querySelector<HTMLElement>(`${TAG_ROOT}[data-count]`)!
    expect(overflow.textContent).toBe('+2')
    const control = rect(part('control'))
    for (const tag of [...tags(), overflow])
      expect(rect(tag).right).toBeLessThanOrEqual(control.right)
  })

  it('首帧就在的标签不播进场；之后新选中的一枚原地弹出', async () => {
    const { value } = await mountCascader([['east', 'sh']])
    for (const tag of tags())
      expect(running(tag)).toEqual([])
    value.value = [['east', 'sh'], ['south', 'gz']]
    await nextTick()
    await nextTick()
    expect(running(tags().at(-1)!)).toContain('xh-pop-in')
  })
})
