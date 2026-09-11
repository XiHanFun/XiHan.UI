import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhPromptInputControl,
  XhPromptInputInput,
  XhPromptInputRoot,
  XhPromptInputSubmitTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

async function settle(): Promise<void> {
  await nextTick()
  await new Promise(resolve => requestAnimationFrame(resolve))
  await nextTick()
}

function part(name: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope='prompt-input'][data-part='${name}']`)!
}

function mount(): void {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhPromptInputRoot, { defaultValue: '请总结这段内容' }, () =>
      h(XhPromptInputControl, null, () => [
        h(XhPromptInputInput, { placeholder: '输入消息' }),
        h(XhPromptInputSubmitTrigger, null, () => '发送'),
      ])),
  })
  app.mount(host)
}

function alpha(color: string): number {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1
  const context = canvas.getContext('2d')!
  context.fillStyle = color
  context.fillRect(0, 0, 1, 1)
  return context.getImageData(0, 0, 1, 1).data[3]!
}

function tokenBackground(name: string): string {
  const probe = document.createElement('span')
  probe.style.background = `var(${name})`
  document.body.append(probe)
  const background = getComputedStyle(probe).backgroundColor
  probe.remove()
  return background
}

afterEach(async () => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  document.body.innerHTML = ''
  delete document.documentElement.dataset.theme
  delete document.documentElement.dataset.contrast
  await cdp().send('Emulation.setEmulatedMedia', { media: '', features: [] })
})

describe('prompt-input 的 M3 浮动玻璃皮肤', () => {
  it.each(['light', 'dark'] as const)('%s：外壳消费完整玻璃配方，textarea 保持实体阅读底', async (theme) => {
    document.documentElement.dataset.theme = theme
    mount()
    await settle()

    const root = part('root')
    const input = part('input') as HTMLTextAreaElement
    const rootStyle = getComputedStyle(root)
    const inputStyle = getComputedStyle(input)
    expect(alpha(rootStyle.backgroundColor)).toBeCloseTo(255 * 0.76, 0)
    expect(rootStyle.backgroundImage).toContain('linear-gradient')
    expect(rootStyle.borderTopWidth).toBe('1px')
    expect(rootStyle.backdropFilter).toBe('blur(24px) saturate(1.12)')
    expect(rootStyle.boxShadow).not.toBe('none')
    expect(alpha(inputStyle.backgroundColor)).toBe(255)
    expect(inputStyle.backgroundColor).toBe(tokenBackground('--xh-material-glass-focus-surface'))
    expect(inputStyle.color).not.toBe('rgba(0, 0, 0, 0)')
    root.style.setProperty('--xh-prompt-input-input-radius', '12px')
    expect(getComputedStyle(input).borderTopLeftRadius).toBe('12px')

    input.focus()
    await settle()
    expect(root.matches(':focus-within')).toBe(true)
    expect(getComputedStyle(root).outlineStyle).toBe('solid')
    expect(inputStyle.outlineStyle).toBe('none')
  })

  it('高对比度将外壳实体化，同时保留整框焦点环', async () => {
    document.documentElement.dataset.contrast = 'more'
    mount()
    await settle()

    const root = part('root')
    const input = part('input') as HTMLTextAreaElement
    const style = getComputedStyle(root)
    expect(alpha(style.backgroundColor)).toBe(255)
    expect(style.backdropFilter).toBe('none')
    expect(style.boxShadow).toBe('none')
    expect(style.borderTopWidth).toBe('1px')
    input.focus()
    await settle()
    expect(getComputedStyle(root).outlineStyle).toBe('solid')
  })

  it.each([
    ['减少透明度', { name: 'prefers-reduced-transparency', value: 'reduce' }, '(prefers-reduced-transparency: reduce)'],
    ['强制色', { name: 'forced-colors', value: 'active' }, '(forced-colors: active)'],
  ] as const)('%s：系统辅助模式实体化玻璃配方', async (_, feature, query) => {
    await cdp().send('Emulation.setEmulatedMedia', { media: '', features: [feature] })
    expect(matchMedia(query).matches).toBe(true)
    mount()
    await settle()

    const root = part('root')
    const input = part('input')
    const style = getComputedStyle(root)
    expect(alpha(style.backgroundColor)).toBe(255)
    expect(style.backdropFilter).toBe('none')
    if (feature.name === 'forced-colors')
      expect(style.boxShadow).toBe('none')
    else
      expect(style.boxShadow).not.toBe('none')
    if (feature.name === 'forced-colors')
      expect(style.backgroundImage).toBe('none')
    expect(alpha(getComputedStyle(input).backgroundColor)).toBe(255)
  })

  it('打印：令牌关闭滤镜与投影，并让外壳使用实体底', async () => {
    await cdp().send('Emulation.setEmulatedMedia', { media: 'print', features: [] })
    mount()
    await settle()

    const style = getComputedStyle(part('root'))
    expect(alpha(style.backgroundColor)).toBe(255)
    expect(style.backdropFilter).toBe('none')
    expect(style.boxShadow).toBe('none')
    expect(style.borderTopWidth).toBe('1px')
  })
})
