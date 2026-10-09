// 字段里的已选标签（标签行家族的 Select / Combobox / Cascader / TreeSelect / 各类 Picker，以及 TagsInput）：
// 字段没聚焦时盒铺着字段淡底，标签换白底 + 缺省描边一枚枚立出来，叉悬停 / 按下走白底阶梯；
// 聚焦后盒换成白色承载面，标签回到自己的淡底。有标签时盒的起始内衬收到 --xh-space-1，标签之间隔 --xh-space-1，
// lg 档字段里的标签字号钉在说明档。判据是计算样式与几何，jsdom 不算级联也不排版。
import type { App, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhSelectRoot,
  XhTagsInputControl,
  XhTagsInputInput,
  XhTagsInputItem,
  XhTagsInputItemDeleteTrigger,
  XhTagsInputItemPreview,
  XhTagsInputItemText,
  XhTagsInputRoot,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(async () => {
  await userEvent.hover(document.querySelector<HTMLElement>('[data-test-park-pointer]')!)
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

async function mount(render: () => VNode): Promise<void> {
  host = document.createElement('div')
  host.style.cssText = 'inline-size: 360px; padding: 24px'
  document.body.append(host)
  app = createApp({ render })
  app.mount(host)
  await nextTick()
  await nextTick()
}

function resolve(value: string, property = 'background-color'): string {
  const probe = document.createElement('span')
  probe.style.setProperty(property, value)
  host!.append(probe)
  const out = getComputedStyle(probe).getPropertyValue(property)
  probe.remove()
  return out
}

function px(token: string): number {
  return Number.parseFloat(resolve(`var(${token})`, 'inline-size'))
}

const CITIES = ['北京', '上海', '广州'].map(label => ({ value: label, label }))

const HOSTS: Array<[string, (props?: Record<string, unknown>) => VNode, string]> = [
  ['select', props => h(XhSelectRoot, { collection: CITIES, multiple: true, defaultValue: ['北京', '上海'], ...props }), `[data-scope='select'][data-part='tag-list'] > [data-scope='tag'][data-part='root']`],
  ['tags-input', props => h(XhTagsInputRoot, { defaultValue: ['北京', '上海'], ...props }, {
    default: (bag: { value: string[] }) => h(XhTagsInputControl, null, () => [
      ...bag.value.map(t => h(XhTagsInputItem, { key: t, value: t }, () => h(XhTagsInputItemPreview, null, () => [
        h(XhTagsInputItemText, null, () => t),
        h(XhTagsInputItemDeleteTrigger),
      ]))),
      h(XhTagsInputInput, { 'aria-label': '城市' }),
    ]),
  }), `[data-scope='tags-input'][data-part='item'] > [data-scope='tag'][data-part='root']`],
]

function control(scope: string): HTMLElement {
  return host!.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='control']`)!
}

function tags(selector: string): HTMLElement[] {
  return [...host!.querySelectorAll<HTMLElement>(selector)].filter(el => el.dataset.state !== 'closed')
}

function focusInside(scope: string): void {
  control(scope).querySelector<HTMLElement>('input, button[aria-haspopup], [role="combobox"]')!.focus()
}

describe('字段里的已选标签按盒的承载面换面', () => {
  it.each(HOSTS)('%s：没聚焦时标签白底 + 缺省描边，聚焦后回到淡底', async (scope, render, selector) => {
    await mount(() => render())
    const tag = tags(selector)[0]!
    expect(getComputedStyle(tag).backgroundColor).toBe(resolve('var(--xh-bg-surface)'))
    expect(getComputedStyle(tag).borderTopColor).toBe(resolve('var(--xh-border-default)', 'color'))

    focusInside(scope)
    expect(control(scope).matches(':focus-within')).toBe(true)
    await expect.poll(() => getComputedStyle(tag).backgroundColor).toBe(resolve('var(--xh-bg-subtle)'))
  })

  // Select 的缺省结构不渲染叉，只在 TagsInput 上量
  it.each(HOSTS.filter(([scope]) => scope === 'tags-input'))('%s：没聚焦时叉悬停取 --xh-bg-subtle', async (_scope, render, selector) => {
    await mount(() => render())
    const close = tags(selector)[0]!.querySelector<HTMLElement>(`[data-scope='tag'][data-part='close-trigger']`)!
    await userEvent.hover(close)
    await expect.poll(() => getComputedStyle(close).backgroundColor).toBe(resolve('var(--xh-bg-subtle)'))
  })

  it.each(HOSTS)('%s：禁用的盒里标签不换白底，照禁用档置灰', async (_scope, render, selector) => {
    await mount(() => render({ disabled: true }))
    expect(getComputedStyle(tags(selector)[0]!).backgroundColor).not.toBe(resolve('var(--xh-bg-surface)'))
  })
})

describe('字段里的标签排法', () => {
  it.each(HOSTS)('%s：有标签时盒的起始内衬收到 --xh-space-1，标签之间隔 --xh-space-1', async (scope, render, selector) => {
    await mount(() => render())
    const box = control(scope)
    const [first, second] = tags(selector)
    expect(getComputedStyle(box).paddingInlineStart).toBe(`${px('--xh-space-1')}px`)
    const border = Number.parseFloat(getComputedStyle(box).borderInlineStartWidth)
    expect(Math.round(first!.getBoundingClientRect().left - box.getBoundingClientRect().left - border)).toBe(px('--xh-space-1'))
    expect(Math.round(second!.getBoundingClientRect().left - first!.getBoundingClientRect().right)).toBe(px('--xh-space-1'))
  })

  it.each(HOSTS)('%s：lg 档字段里的标签字号钉在说明档', async (_scope, render, selector) => {
    await mount(() => render({ size: 'lg' }))
    expect(getComputedStyle(tags(selector)[0]!).fontSize).toBe(resolve('var(--xh-text-caption-size)', 'font-size'))
  })
})
