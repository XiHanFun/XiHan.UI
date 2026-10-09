// Card 的语义表面、统一节奏与部件布局依赖真实 CSS 计算值。
import type { ControlVariant } from '@xihan-ui/core'
import type { App, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhCardContent,
  XhCardDescription,
  XhCardFooter,
  XhCardHeader,
  XhCardRoot,
  XhCardTitle,
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
  delete document.documentElement.dataset.density
})

function card(variant?: ControlVariant, options: { description?: boolean } = {}): VNode {
  return h(XhCardRoot, { variant }, () => [
    h(XhCardHeader, null, () => [
      h(XhCardTitle, null, () => '卡片标题'),
      options.description === false ? null : h(XhCardDescription, null, () => '一行简短说明'),
    ]),
    h(XhCardContent, null, () => '卡片内容'),
    h(XhCardFooter, null, () => '页脚'),
  ])
}

async function mount(render: () => unknown): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ render })
  app.mount(host)
  await nextTick()
}

function tokenColor(name: string): string {
  const probe = document.createElement('span')
  probe.style.color = `var(${name})`
  document.body.append(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  return color
}

/** 字号 / 字重 / 投影令牌在根上解到的计算值。 */
function resolvedValue(root: HTMLElement, property: 'font-size' | 'font-weight' | 'box-shadow', token: string): string {
  const probe = document.createElement('span')
  probe.style.setProperty(property, `var(${token})`)
  root.append(probe)
  const value = getComputedStyle(probe).getPropertyValue(property)
  probe.remove()
  return value
}

function resolvedLength(root: HTMLElement, value: string): number {
  const probe = document.createElement('span')
  probe.style.cssText = `position:absolute;inline-size:${value}`
  root.append(probe)
  const resolved = probe.getBoundingClientRect().width
  probe.remove()
  return resolved
}

describe('卡片的 Hero 风格语义表面', () => {
  it('根不带内衬与段间距、取 surface 圆角；内衬落在各部件上', async () => {
    await mount(() => card())
    const root = host!.querySelector<HTMLElement>('[data-scope="card"][data-part="root"]')!
    const style = getComputedStyle(root)
    const content = root.querySelector<HTMLElement>('[data-part="content"]')!

    expect(root.dataset.variant).toBe('outline')
    expect(root.hasAttribute('data-size')).toBe(false)
    expect(root.hasAttribute('data-hoverable')).toBe(false)
    expect(root.hasAttribute('data-split')).toBe(false)
    expect(Number.parseFloat(style.paddingTop)).toBe(0)
    expect(Number.parseFloat(style.rowGap)).toBe(0)
    expect(Number.parseFloat(style.borderRadius)).toBe(resolvedLength(root, 'var(--xh-shape-surface)'))
    expect(style.overflow).toBe('visible')
    expect(getComputedStyle(content).flexDirection).toBe('column')
  })

  it('三档形态按根面三选一：outline 描边 + raised（缺省无影），subtle 淡底无影，ghost 不带底色和投影', async () => {
    const variants: ControlVariant[] = ['outline', 'subtle', 'ghost']
    await mount(() => h('div', null, variants.map(variant => card(variant))))
    const roots = [...host!.querySelectorAll<HTMLElement>('[data-scope="card"][data-part="root"]')]
    const backgrounds = roots.map(root => getComputedStyle(root).backgroundColor)

    expect(new Set(backgrounds.slice(0, 2)).size).toBe(2)
    // outline：边界由 --xh-border-default 描边承担，raised 落影只是抬起的加成
    expect(getComputedStyle(roots[0]!).borderTopColor).toBe(tokenColor('--xh-border-default'))
    expect(getComputedStyle(roots[0]!).boxShadow).toBe(resolvedValue(roots[0]!, 'box-shadow', '--xh-elevation-raised'))
    // subtle：淡底 + 透明占位边 + 无影（淡底与阴影互斥）
    expect(backgrounds[1]).toBe(tokenColor('--xh-bg-subtle'))
    expect(getComputedStyle(roots[1]!).borderTopColor).toBe('rgba(0, 0, 0, 0)')
    expect(getComputedStyle(roots[1]!).boxShadow).toBe('none')
    // ghost：三件都不画，占位边保住 1px 边位
    expect(backgrounds[2]).toBe('rgba(0, 0, 0, 0)')
    expect(getComputedStyle(roots[2]!).borderTopColor).toBe('rgba(0, 0, 0, 0)')
    expect(getComputedStyle(roots[2]!).boxShadow).toBe('none')
    expect(new Set(roots.map(root => getComputedStyle(root).borderTopWidth)).size).toBe(1)
  })

  it('头部条：一行标题时高 46px、横向内距 16px，底边一道 1px 内部分隔线；紧凑档 40px', async () => {
    await mount(() => card(undefined, { description: false }))
    const header = host!.querySelector<HTMLElement>('[data-scope="card"][data-part="header"]')!
    const style = getComputedStyle(header)
    expect(header.getBoundingClientRect().height).toBe(46)
    expect(style.paddingLeft).toBe('16px')
    expect(style.paddingRight).toBe('16px')
    expect(style.borderBottomWidth).toBe('1px')
    expect(style.borderBottomColor).toBe(tokenColor('--xh-border-subtle'))
    document.documentElement.dataset.density = 'compact'
    expect(header.getBoundingClientRect().height).toBe(40)
  })

  it('正文内距 16px（紧凑档纵向 12px、横向仍 16px）、14px 次级色；页脚与正文同起点，压在卡片底边上方 16px', async () => {
    await mount(() => card())
    const content = host!.querySelector<HTMLElement>('[data-scope="card"][data-part="content"]')!
    const footer = host!.querySelector<HTMLElement>('[data-scope="card"][data-part="footer"]')!
    const body = getComputedStyle(content)
    expect([body.paddingTop, body.paddingRight, body.paddingBottom, body.paddingLeft]).toEqual(['16px', '16px', '16px', '16px'])
    expect(body.fontSize).toBe('14px')
    expect(body.color).toBe(tokenColor('--xh-fg-muted'))
    const foot = getComputedStyle(footer)
    expect([foot.paddingTop, foot.paddingLeft, foot.paddingBottom]).toEqual(['0px', '16px', '16px'])
    document.documentElement.dataset.density = 'compact'
    const compact = getComputedStyle(content)
    expect([compact.paddingTop, compact.paddingRight, compact.paddingBottom, compact.paddingLeft]).toEqual(['12px', '16px', '12px', '16px'])
  })

  it('标题取区块标题的字号与字重、正文色；说明 13/fg-muted', async () => {
    await mount(() => card())
    const root = host!.querySelector<HTMLElement>('[data-scope="card"][data-part="root"]')!
    const title = root.querySelector<HTMLElement>('[data-part="title"]')!
    const description = root.querySelector<HTMLElement>('[data-part="description"]')!

    expect(getComputedStyle(title).fontWeight).toBe(resolvedValue(root, 'font-weight', '--xh-text-heading-3-weight'))
    expect(getComputedStyle(title).fontSize).toBe(resolvedValue(root, 'font-size', '--xh-text-heading-3-size'))
    expect(getComputedStyle(title).color).toBe(tokenColor('--xh-fg-default'))
    expect(Number.parseFloat(getComputedStyle(description).fontSize)).toBe(resolvedLength(root, 'var(--xh-text-secondary-size)'))
    expect(getComputedStyle(description).color).toBe(tokenColor('--xh-fg-muted'))
  })
})
