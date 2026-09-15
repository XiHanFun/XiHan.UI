// Card 的语义表面、统一节奏与部件布局依赖真实 CSS 计算值。
import type { CardVariant } from '@xihan-ui/headless'
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

function card(variant?: CardVariant): unknown {
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

    expect(root.dataset.variant).toBe('default')
    expect(root.hasAttribute('data-size')).toBe(false)
    expect(root.hasAttribute('data-hoverable')).toBe(false)
    expect(root.hasAttribute('data-split')).toBe(false)
    expect(Number.parseFloat(style.paddingTop)).toBe(resolvedLength(root, 'var(--xh-space-4)'))
    expect(Number.parseFloat(style.rowGap)).toBe(resolvedLength(root, 'var(--xh-space-3)'))
    expect(Number.parseFloat(style.borderRadius)).toBe(resolvedLength(root, 'var(--xh-shape-surface)'))
    expect(style.overflow).toBe('visible')
    expect(getComputedStyle(content).flexDirection).toBe('column')
  })

  it('四个层级有明确表面，transparent 不带底色和投影', async () => {
    const variants: CardVariant[] = ['default', 'secondary', 'tertiary', 'transparent']
    await mount(() => h('div', null, variants.map(variant => card(variant))))
    const roots = [...host!.querySelectorAll<HTMLElement>('[data-scope="card"][data-part="root"]')]
    const backgrounds = roots.map(root => getComputedStyle(root).backgroundColor)

    expect(new Set(backgrounds.slice(0, 3)).size).toBe(3)
    expect(backgrounds[3]).toBe('rgba(0, 0, 0, 0)')
    expect(getComputedStyle(roots[3]!).boxShadow).toBe('none')
  })
})
