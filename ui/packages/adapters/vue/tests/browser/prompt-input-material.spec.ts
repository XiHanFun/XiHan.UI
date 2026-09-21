import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp, userEvent } from 'vitest/browser'
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

function tokenColor(name: string): string {
  const probe = document.createElement('span')
  probe.style.color = `var(${name})`
  document.body.append(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  return color
}

describe('prompt-input 的字段描边外壳', () => {
  it.each(['light', 'dark'] as const)('%s：外壳走 Field Chrome 描边式（不填底 + border-control + 无影，无顶光无模糊），输入段透明', async (theme) => {
    document.documentElement.dataset.theme = theme
    mount()
    await settle()

    const root = part('root')
    const input = part('input') as HTMLTextAreaElement
    const rootStyle = getComputedStyle(root)
    const inputStyle = getComputedStyle(input)
    expect(root.getAttribute('data-xh-field-chrome')).toBe('')
    // 描边式不填底：露出宿主的面，边界只由描边承担
    expect(alpha(rootStyle.backgroundColor)).toBe(0)
    expect(rootStyle.backgroundImage).toBe('none')
    expect(rootStyle.borderTopWidth).toBe('1px')
    expect(rootStyle.borderTopColor).toBe(tokenColor('--xh-border-control'))
    expect(rootStyle.borderRadius).toBe('8px')
    expect(rootStyle.backdropFilter).toBe('none')
    expect(rootStyle.boxShadow).toBe('none')
    expect(input.getAttribute('data-xh-field-input')).toBe('')
    expect(alpha(inputStyle.backgroundColor)).toBe(0)
    expect(inputStyle.color).toBe(tokenColor('--xh-fg-default'))
    root.style.setProperty('--xh-prompt-input-input-radius', '12px')
    expect(getComputedStyle(input).borderTopLeftRadius).toBe('12px')

    input.focus()
    await settle()
    expect(root.matches(':focus-within')).toBe(true)
    expect(getComputedStyle(root).outlineStyle).toBe('solid')
    expect(getComputedStyle(root).borderTopColor).toBe(tokenColor('--xh-border-control-focus'))
    expect(inputStyle.outlineStyle).toBe('none')
  })

  it('发送钮是品牌实心的 Action Control：悬停换底、按下 0.97 缩放，输入为空转灰，生成中降为中性淡底的停止身份', async () => {
    mount()
    await settle()
    const trigger = part('submit-trigger') as HTMLButtonElement
    trigger.style.transition = 'none'
    expect(trigger.getAttribute('data-xh-action-control')).toBe('')
    expect(trigger.getAttribute('data-xh-action-variant')).toBe('solid')
    expect(getComputedStyle(trigger).backgroundColor).toBe(tokenBackground('--xh-bg-brand'))
    expect(getComputedStyle(trigger).color).toBe(tokenColor('--xh-fg-on-brand'))
    expect(getComputedStyle(trigger).height).toBe('36px')
    expect(getComputedStyle(trigger).borderRadius).toBe('4px')
    // 发送身份顶边一条内高光
    expect(getComputedStyle(trigger).boxShadow).not.toBe('none')
    await userEvent.hover(trigger)
    expect(getComputedStyle(trigger).backgroundColor).toBe(tokenBackground('--xh-bg-brand-hover'))
    trigger.dataset.pressed = ''
    expect(getComputedStyle(trigger).backgroundColor).toBe(tokenBackground('--xh-bg-brand-active'))
    expect(getComputedStyle(trigger).scale).toBe('0.97')
    delete trigger.dataset.pressed

    const input = part('input') as HTMLTextAreaElement
    input.focus()
    await userEvent.clear(input)
    await settle()
    expect(trigger.disabled).toBe(true)
    expect(trigger.hasAttribute('data-disabled')).toBe(true)
    expect(getComputedStyle(trigger).backgroundColor).toBe(tokenBackground('--xh-bg-muted'))
    expect(getComputedStyle(trigger).boxShadow).toBe('none')
  })

  it('生成中：停止身份是中性淡底，外框仍可打字、不压前景', async () => {
    host = document.createElement('div')
    document.body.append(host)
    app = createApp({
      render: () => h(XhPromptInputRoot, { loading: true, defaultValue: '生成中' }, () =>
        h(XhPromptInputControl, null, () => [
          h(XhPromptInputInput, { placeholder: '输入消息' }),
          h(XhPromptInputSubmitTrigger),
        ])),
    })
    app.mount(host)
    await settle()
    const trigger = part('submit-trigger')
    trigger.style.transition = 'none'
    // 上一条用例把指针停在了发送钮上：先挪开，读的才是静息面
    await userEvent.unhover(trigger)
    expect(trigger.getAttribute('data-mode')).toBe('stop')
    expect(trigger.getAttribute('data-xh-action-variant')).toBe('subtle')
    expect(getComputedStyle(trigger).backgroundColor).toBe(tokenBackground('--xh-bg-subtle'))
    expect(getComputedStyle(trigger).boxShadow).toBe('none')
    const root = part('root')
    expect(root.hasAttribute('data-loading')).toBe(true)
    expect(getComputedStyle(root).cursor).toBe('text')
    expect(getComputedStyle(part('input')).color).toBe(tokenColor('--xh-fg-default'))
  })

  it('高对比度保持实体描边面与整框焦点环', async () => {
    document.documentElement.dataset.contrast = 'more'
    mount()
    await settle()

    const root = part('root')
    const input = part('input') as HTMLTextAreaElement
    const style = getComputedStyle(root)
    expect(alpha(style.backgroundColor)).toBe(0)
    expect(style.backdropFilter).toBe('none')
    expect(style.borderTopWidth).toBe('1px')
    input.focus()
    await settle()
    expect(getComputedStyle(root).outlineStyle).toBe('solid')
  })

  it.each([
    ['减少透明度', { name: 'prefers-reduced-transparency', value: 'reduce' }, '(prefers-reduced-transparency: reduce)'],
    ['强制色', { name: 'forced-colors', value: 'active' }, '(forced-colors: active)'],
  ] as const)('%s：系统辅助模式保持描边面、无影无渐变，输入段仍透明', async (_, feature, query) => {
    await cdp().send('Emulation.setEmulatedMedia', { media: '', features: [feature] })
    expect(matchMedia(query).matches).toBe(true)
    mount()
    await settle()

    const root = part('root')
    const input = part('input')
    const style = getComputedStyle(root)
    // 强制色下底由系统 Canvas 顶上（不透明），减少透明度下仍是描边式的透明底
    expect(alpha(style.backgroundColor)).toBe(feature.name === 'forced-colors' ? 255 : 0)
    expect(style.backdropFilter).toBe('none')
    expect(style.boxShadow).toBe('none')
    expect(style.backgroundImage).toBe('none')
    expect(style.borderTopWidth).toBe('1px')
    expect(alpha(getComputedStyle(input).backgroundColor)).toBe(0)
  })

  it('打印：外壳保持描边面，无滤镜与投影', async () => {
    await cdp().send('Emulation.setEmulatedMedia', { media: 'print', features: [] })
    mount()
    await settle()

    const style = getComputedStyle(part('root'))
    expect(alpha(style.backgroundColor)).toBe(0)
    expect(style.backdropFilter).toBe('none')
    expect(style.boxShadow).toBe('none')
    expect(style.borderTopWidth).toBe('1px')
  })
})
