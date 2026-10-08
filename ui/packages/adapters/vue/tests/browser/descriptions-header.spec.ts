// 描述列表的头部：标题在行首、附加内容贴行尾，与列表隔一档间距；标题是 Surface 内标题（正文字号、半粗）。
// 排版只有真实浏览器量得出来。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhDescriptionsExtra,
  XhDescriptionsHeader,
  XhDescriptionsItem,
  XhDescriptionsLabel,
  XhDescriptionsRoot,
  XhDescriptionsTitle,
  XhDescriptionsValue,
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

function part(name: string): HTMLElement {
  const element = host!.querySelector<HTMLElement>(`[data-scope="descriptions"][data-part="${name}"]`)
  if (!element)
    throw new Error(`缺少 descriptions 部件：${name}`)
  return element
}

async function mount(dir: 'ltr' | 'rtl' = 'ltr'): Promise<void> {
  host = document.createElement('div')
  host.dir = dir
  host.style.inlineSize = '320px'
  document.body.append(host)
  app = createApp({
    render: () => h(XhDescriptionsRoot, { variant: 'outline' }, {
      header: () => [h(XhDescriptionsHeader, null, () => [
        h(XhDescriptionsTitle, { as: 'h3' }, () => '订单信息'),
        h(XhDescriptionsExtra, null, () => h('button', { type: 'button' }, '编辑')),
      ])],
      default: () => [h(XhDescriptionsItem, null, () => [
        h(XhDescriptionsLabel, null, () => '订单号'),
        h(XhDescriptionsValue, null, () => 'XH-0042'),
      ])],
    }),
  })
  app.mount(host)
  await nextTick()
}

describe('descriptions 头部排版', () => {
  it('标题在行首、附加内容贴行尾，头部与列表之间隔一档间距', async () => {
    await mount()
    const header = part('header').getBoundingClientRect()
    const title = part('title').getBoundingClientRect()
    const extra = part('extra').getBoundingClientRect()
    const list = part('root').getBoundingClientRect()
    expect(Math.round(title.left)).toBe(Math.round(header.left))
    expect(Math.round(extra.right)).toBe(Math.round(header.right))
    expect(list.top - header.bottom).toBeGreaterThan(0)
    // 标题的 h3 不带 UA 的外边距，字号字重取区块标题档（16 / 500），比取值大一号
    const style = getComputedStyle(part('title'))
    expect(style.marginBlockStart).toBe('0px')
    expect(style.fontWeight).toBe('500')
    expect(style.fontSize).toBe('16px')
    expect(Number.parseFloat(style.fontSize)).toBeGreaterThan(Number.parseFloat(getComputedStyle(part('value')).fontSize))
  })

  it('rtl 下附加内容贴到左侧的行尾', async () => {
    await mount('rtl')
    const header = part('header').getBoundingClientRect()
    const extra = part('extra').getBoundingClientRect()
    expect(Math.round(extra.left)).toBe(Math.round(header.left))
  })
})
