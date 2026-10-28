// Button 才开放的两档形态（设计真源 §5.2）：dashed 与 outline 同一套面、描边改虚线；
// link 不铺面、不画边，字取品牌前景，悬停与按下在换一档字色之外加下划线，禁用不画。
// 边型、下划线与悬停后的字色都要经完整级联，只在真实浏览器里量。
import type { App, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhButton } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null

afterEach(() => {
  app?.unmount()
  app = null
  document.body.innerHTML = ''
})

async function mount(render: () => VNode | VNode[]): Promise<void> {
  const host = document.createElement('div')
  document.body.append(host)
  app = createApp({ render })
  app.mount(host)
  await nextTick()
}

function byTestId(id: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[data-testid='${id}']`)
  if (!el)
    throw new Error(`缺少节点：${id}`)
  return el
}

function resolveColor(token: string): string {
  const probe = document.createElement('span')
  probe.style.color = `var(${token})`
  document.body.append(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  return color
}

describe('button 的 dashed 与 link 两档', () => {
  it('dashed：与 outline 同一副底、字与描边色，只把描边画成虚线', async () => {
    await mount(() => [
      h(XhButton, { 'data-testid': 'outline', 'variant': 'outline' }, () => '线框'),
      h(XhButton, { 'data-testid': 'dashed', 'variant': 'dashed' }, () => '虚线'),
    ])
    const outline = getComputedStyle(byTestId('outline'))
    const dashed = getComputedStyle(byTestId('dashed'))
    expect(outline.borderTopStyle).toBe('solid')
    expect(dashed.borderTopStyle).toBe('dashed')
    expect(dashed.borderTopColor).toBe(outline.borderTopColor)
    expect(dashed.backgroundColor).toBe(outline.backgroundColor)
    expect(dashed.color).toBe(outline.color)
    expect(dashed.height).toBe(outline.height)
  })

  it('link：不铺面、不画边，字取品牌前景；盒高与同排按钮一致', async () => {
    await mount(() => [
      h(XhButton, { 'data-testid': 'solid' }, () => '主要'),
      h(XhButton, { 'data-testid': 'link', 'variant': 'link' }, () => '链接'),
    ])
    const link = byTestId('link')
    const style = getComputedStyle(link)
    expect(style.backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(style.borderTopColor).toBe('rgba(0, 0, 0, 0)')
    expect(style.color).toBe(resolveColor('--xh-fg-brand'))
    expect(style.textDecorationLine).toBe('none')
    expect(style.height).toBe(getComputedStyle(byTestId('solid')).height)
    // link 不是彩色面，面内不成墨色域
    expect(link.hasAttribute('data-xh-ink-surface')).toBe(false)
  })

  it('link：悬停加下划线、字换深一档品牌色；禁用不画下划线', async () => {
    await mount(() => [
      h(XhButton, { 'data-testid': 'link', 'variant': 'link' }, () => '链接'),
      h(XhButton, { 'data-testid': 'disabled', 'variant': 'link', 'disabled': true }, () => '禁用'),
    ])
    const link = byTestId('link')
    link.style.transition = 'none'
    await userEvent.hover(link)
    const hovered = getComputedStyle(link)
    expect(hovered.textDecorationLine).toBe('underline')
    expect(hovered.color).toBe(resolveColor('--xh-fg-brand-strong'))
    const disabled = byTestId('disabled')
    disabled.style.pointerEvents = 'auto'
    await userEvent.hover(disabled, { force: true })
    expect(getComputedStyle(disabled).textDecorationLine).toBe('none')
    expect(getComputedStyle(disabled).color).toBe(resolveColor('--xh-fg-disabled'))
  })

  it('link 写了 tone 取语气前景', async () => {
    await mount(() => h(XhButton, { 'data-testid': 'danger', 'variant': 'link', 'tone': 'danger' }, () => '删除'))
    const danger = byTestId('danger')
    // 在按钮里放探针按同一份语气槽解出语气前景
    const probe = document.createElement('span')
    probe.style.color = 'var(--xh-_tone-fg)'
    danger.append(probe)
    const toneFg = getComputedStyle(probe).color
    probe.remove()
    expect(toneFg).not.toBe(resolveColor('--xh-fg-brand'))
    expect(getComputedStyle(danger).color).toBe(toneFg)
  })
})
