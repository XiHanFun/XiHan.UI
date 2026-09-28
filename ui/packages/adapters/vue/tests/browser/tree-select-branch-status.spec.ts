// TreeSelect 分支首次展开取子项的三种占位：落在子层的位置，与整树占位同一副样子。
// 在途 = 加载环 + 文案；失败 = 警示字形 + 说明，另有重试钮；文字取材质的次要文字、字号随档。
// 判据是伪元素、计算样式与几何，jsdom 不给这些。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhTreeSelectRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  document.getElementById('xh-portal-root')?.remove()
  app = null
  host = null
})

async function mount(loadChildren: () => Promise<never[]>): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhTreeSelectRoot, {
      collection: [{ value: 'lazy', label: '按需加载', hasChildren: true }],
      open: true,
      expandedValue: ['lazy'],
      loadChildren,
    }),
  })
  app.mount(host)
  await nextTick()
  await nextTick()
}

function part(name: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[data-scope='tree-select'][data-part='${name}']`)
  if (!el)
    throw new Error(`找不到 tree-select/${name}`)
  return el
}

function resolved(on: HTMLElement, property: string, value: string): string {
  const probe = document.createElement('span')
  probe.style.setProperty(property, value)
  on.append(probe)
  const out = getComputedStyle(probe).getPropertyValue(property)
  probe.remove()
  return out
}

describe('tree-select 分支取子项的占位', () => {
  it('在途：子层的位置一枚加载环 + 文案，文字取材质的次要文字、字号随档', async () => {
    await mount(() => new Promise<never[]>(() => {}))
    await expect.poll(() => part('branch-loading').hidden).toBe(false)
    const loading = part('branch-loading')
    const ring = getComputedStyle(loading, '::before')
    expect(ring.animationName).toBe('xh-spin')
    expect(ring.animationPlayState).toBe('running')
    expect(ring.borderRadius).toBe('50%')
    const style = getComputedStyle(loading)
    expect(style.display).toBe('flex')
    expect(style.color).toBe(resolved(loading, 'color', 'var(--xh-material-frosted-fg-muted)'))
    expect(style.fontSize).toBe(resolved(loading, 'font-size', 'var(--xh-control-font-md)'))
    // 与子层同一缩进：文字起点比分支那一行更靠里
    const row = part('branch-control').getBoundingClientRect()
    expect(loading.getBoundingClientRect().left + Number.parseFloat(style.paddingLeft)).toBeGreaterThan(row.left + Number.parseFloat(getComputedStyle(part('branch-control')).paddingLeft))
  })

  it('失败：一枚取危险色的警示字形 + 说明，重试钮在它下面', async () => {
    await mount(() => Promise.reject(new Error('网络断了')))
    await expect.poll(() => part('branch-error').hidden).toBe(false)
    const error = part('branch-error')
    const glyph = getComputedStyle(error, '::before')
    expect(glyph.maskImage).not.toBe('none')
    expect(glyph.backgroundColor).toBe(resolved(error, 'color', 'var(--xh-fg-danger)'))
    const retry = part('branch-retry-trigger')
    expect(retry.hidden).toBe(false)
    expect(retry.getBoundingClientRect().top).toBeGreaterThanOrEqual(error.getBoundingClientRect().bottom - 1)
    expect(getComputedStyle(retry).color).toBe(resolved(retry, 'color', 'var(--xh-fg-brand)'))
  })
})
