// 预设品牌：主题边界上写 data-brand='<预设>' 即换一套品牌原语，品牌语义令牌在同一个元素上跟着换；
// 写在不带 data-theme 的子树上只换原语；registerBrand 注入的同名取值块压过预设。
// 取值落在令牌层的层叠与 var() 解析上，jsdom 不解析这些，只在 Chromium 验证。
import { BRAND_PRESETS, registerBrand } from '@xihan-ui/tokens'
import { afterEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'

const hosts: HTMLElement[] = []
const cleanups: Array<() => void> = []

/** 挂一个带属性的块；parent 缺省是 body。 */
function mount(attrs: Record<string, string>, parent: HTMLElement = document.body): HTMLElement {
  const node = document.createElement('div')
  for (const [name, value] of Object.entries(attrs))
    node.setAttribute(name, value)
  parent.append(node)
  hosts.push(node)
  return node
}

/** 在 scope 里把一支令牌解析成计算后的颜色。 */
function tokenColor(scope: Element, token: string): string {
  const probe = document.createElement('span')
  probe.style.setProperty('color', `var(${token})`)
  scope.append(probe)
  const value = getComputedStyle(probe).color
  probe.remove()
  return value
}

afterEach(() => {
  for (const host of hosts.splice(0))
    host.remove()
  for (const cleanup of cleanups.splice(0))
    cleanup()
})

describe('预设品牌', () => {
  it.each(BRAND_PRESETS)('%s：浅色边界上换掉品牌原语，实心品牌底与品牌字色取这一档的 600', (preset) => {
    const base = mount({ 'data-theme': 'light' })
    const scope = mount({ 'data-theme': 'light', 'data-brand': preset })
    const step600 = tokenColor(scope, '--xh-color-brand-600')
    expect(step600).not.toBe(tokenColor(base, '--xh-color-brand-600'))
    expect(tokenColor(scope, '--xh-bg-brand')).toBe(step600)
    expect(tokenColor(scope, '--xh-fg-brand')).toBe(step600)
    expect(tokenColor(scope, '--xh-bg-brand')).not.toBe(tokenColor(base, '--xh-bg-brand'))
  })

  it.each(BRAND_PRESETS)('%s：深色边界上实心品牌底取 500、品牌字色取 400', (preset) => {
    const scope = mount({ 'data-theme': 'dark', 'data-brand': preset })
    expect(tokenColor(scope, '--xh-bg-brand')).toBe(tokenColor(scope, '--xh-color-brand-500'))
    expect(tokenColor(scope, '--xh-fg-brand')).toBe(tokenColor(scope, '--xh-color-brand-400'))
    expect(tokenColor(scope, '--xh-color-brand-500')).not.toBe(tokenColor(mount({ 'data-theme': 'dark' }), '--xh-color-brand-500'))
  })

  it('data-brand 写在不带 data-theme 的子树上：原语换了，语义令牌仍是外层边界算好的那一份', () => {
    const boundary = mount({ 'data-theme': 'light' })
    const subtree = mount({ 'data-brand': 'green' }, boundary)
    expect(tokenColor(subtree, '--xh-color-brand-600')).not.toBe(tokenColor(boundary, '--xh-color-brand-600'))
    expect(tokenColor(subtree, '--xh-bg-brand')).toBe(tokenColor(boundary, '--xh-bg-brand'))
  })

  it('registerBrand 用了预设的 id 时，注入的取值块压过预设', () => {
    const scope = mount({ 'data-theme': 'light', 'data-brand': 'green' })
    const preset = tokenColor(scope, '--xh-color-brand-600')
    cleanups.push(registerBrand('green', '#e11d48'))
    const registered = tokenColor(scope, '--xh-color-brand-600')
    expect(registered).not.toBe(preset)
    expect(tokenColor(scope, '--xh-bg-brand')).toBe(registered)
    cleanups.splice(0).forEach(cleanup => cleanup())
    expect(tokenColor(scope, '--xh-color-brand-600')).toBe(preset)
  })
})
