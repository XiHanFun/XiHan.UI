// Card 的语义表面、统一节奏与部件布局依赖真实 CSS 计算值。
import type { ControlVariant } from '@xihan-ui/core'
import type { App } from 'vue'
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
})

function card(variant?: ControlVariant): unknown {
  return h(XhCardRoot, { variant }, () => [
    h(XhCardHeader, null, () => [
      h(XhCardTitle, null, () => '卡片标题'),
      h(XhCardDescription, null, () => '一行简短说明'),
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

function resolvedLength(root: HTMLElement, value: string): number {
  const probe = document.createElement('span')
  probe.style.cssText = `position:absolute;inline-size:${value}`
  root.append(probe)
  const resolved = probe.getBoundingClientRect().width
  probe.remove()
  return resolved
}

describe('卡片的 Hero 风格语义表面', () => {
  it('默认使用统一内边距、段间距与高层圆角', async () => {
    await mount(() => card())
    const root = host!.querySelector<HTMLElement>('[data-scope="card"][data-part="root"]')!
    const style = getComputedStyle(root)
    const content = root.querySelector<HTMLElement>('[data-part="content"]')!

    expect(root.dataset.variant).toBe('outline')
    expect(root.hasAttribute('data-size')).toBe(false)
    expect(root.hasAttribute('data-hoverable')).toBe(false)
    expect(root.hasAttribute('data-split')).toBe(false)
    expect(Number.parseFloat(style.paddingTop)).toBe(resolvedLength(root, 'var(--xh-surface-pad-lg)'))
    expect(Number.parseFloat(style.rowGap)).toBe(resolvedLength(root, 'var(--xh-space-3)'))
    expect(Number.parseFloat(style.borderRadius)).toBe(resolvedLength(root, 'var(--xh-shape-surface)'))
    expect(style.overflow).toBe('visible')
    expect(getComputedStyle(content).flexDirection).toBe('column')
  })

  it('三档形态按根面三选一：outline 描边 + raised，subtle 淡底无影，ghost 不带底色和投影', async () => {
    const variants: ControlVariant[] = ['outline', 'subtle', 'ghost']
    await mount(() => h('div', null, variants.map(variant => card(variant))))
    const roots = [...host!.querySelectorAll<HTMLElement>('[data-scope="card"][data-part="root"]')]
    const backgrounds = roots.map(root => getComputedStyle(root).backgroundColor)

    expect(new Set(backgrounds.slice(0, 2)).size).toBe(2)
    // outline：边界由 --xh-border-default 描边承担，raised 落影只是抬起的加成
    expect(getComputedStyle(roots[0]!).borderTopColor).toBe(tokenColor('--xh-border-default'))
    expect(getComputedStyle(roots[0]!).boxShadow).not.toBe('none')
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

  it('标题与说明按 Surface 排版档：标题 14/600，说明 13/fg-muted', async () => {
    await mount(() => card())
    const root = host!.querySelector<HTMLElement>('[data-scope="card"][data-part="root"]')!
    const title = root.querySelector<HTMLElement>('[data-part="title"]')!
    const description = root.querySelector<HTMLElement>('[data-part="description"]')!

    expect(getComputedStyle(title).fontWeight).toBe('600')
    expect(Number.parseFloat(getComputedStyle(title).fontSize)).toBe(resolvedLength(root, 'var(--xh-text-label-size)'))
    expect(Number.parseFloat(getComputedStyle(description).fontSize)).toBe(resolvedLength(root, 'var(--xh-text-secondary-size)'))
    expect(getComputedStyle(description).color).toBe(tokenColor('--xh-fg-muted'))
  })
})
