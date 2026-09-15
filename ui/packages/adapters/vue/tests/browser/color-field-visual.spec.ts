// ColorField 的视觉盒走 Field Chrome、色块走 Swatch 家族：色块坐在盒子里输入框前面、跟字段尺寸档走，
// 收不下的草稿把整个盒描成无效。盒高、色块几何与描边颜色只能在真实 Chromium 中验证。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhColorFieldClearTrigger,
  XhColorFieldControl,
  XhColorFieldInput,
  XhColorFieldLabel,
  XhColorFieldRoot,
  XhColorFieldSwatch,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

function part(name: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-scope='color-field'][data-part='${name}']`)
  if (!element)
    throw new Error(`找不到部件 ${name}`)
  return element
}

function resolvedToken(name: string): string {
  const probe = document.createElement('span')
  probe.style.cssText = `color: var(${name})`
  document.body.append(probe)
  const value = getComputedStyle(probe).color
  probe.remove()
  return value
}

async function mountField(props: Record<string, unknown> = {}): Promise<void> {
  host = document.createElement('div')
  host.style.cssText = 'padding: 24px'
  document.body.append(host)
  app = createApp({
    render: () => h(XhColorFieldRoot, { defaultValue: '#3b82f6', clearable: true, ...props }, () => [
      h(XhColorFieldLabel, null, () => '主题色'),
      h(XhColorFieldControl, { style: 'inline-size: 16rem' }, () => [
        h(XhColorFieldSwatch),
        h(XhColorFieldInput),
        h(XhColorFieldClearTrigger),
      ]),
    ]),
  })
  app.mount(host)
  await nextTick()
  // 盒的描边色带过渡，断言读的是终值不是插值
  part('control').style.transition = 'none'
}

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

describe('颜色字段的盒与色块', () => {
  it('盒是字段标准高，色块坐在盒里输入框前面、画当前色', async () => {
    await mountField()
    const control = part('control')
    const swatch = part('swatch')
    const input = part('input')
    expect(control.getBoundingClientRect().height).toBe(36)
    expect(swatch.getBoundingClientRect().width).toBe(20)
    expect(swatch.getBoundingClientRect().right).toBeLessThanOrEqual(input.getBoundingClientRect().left)
    // 色块垂直居中在盒里
    const c = control.getBoundingClientRect()
    const s = swatch.getBoundingClientRect()
    expect(s.top + s.height / 2).toBeCloseTo(c.top + c.height / 2, 0)
    expect(getComputedStyle(swatch).backgroundImage).toContain('rgb(59, 130, 246)')
  })

  it('收不下的草稿：整个盒描成无效色，色块保住上一个值', async () => {
    await mountField()
    const input = part('input') as HTMLInputElement
    await userEvent.click(input)
    await userEvent.clear(input)
    await userEvent.type(input, 'tomato')
    await userEvent.tab()
    await nextTick()
    expect(part('root').hasAttribute('data-invalid')).toBe(true)
    expect(getComputedStyle(part('control')).borderTopColor).toBe(resolvedToken('--xh-border-invalid'))
    expect(getComputedStyle(part('swatch')).backgroundImage).toContain('rgb(59, 130, 246)')
    expect(input.value).toBe('tomato')
  })

  it('输入与清空按钮聚焦时只由字段外壳画一圈', async () => {
    await mountField()
    const control = part('control')
    const input = part('input') as HTMLInputElement
    const clear = part('clear-trigger') as HTMLButtonElement

    await userEvent.click(input)
    expect(control.matches(':focus-within')).toBe(true)
    expect(getComputedStyle(control).outlineStyle).toBe('solid')
    expect(getComputedStyle(input).outlineStyle).toBe('none')

    await userEvent.tab()
    clear.focus()
    expect(document.activeElement).toBe(clear)
    expect(getComputedStyle(control).outlineStyle).toBe('solid')
    expect(getComputedStyle(clear).outlineStyle).toBe('none')
  })

  it('尺寸档同时换盒高与色块边长；清空后色块只剩棋盘格', async () => {
    await mountField({ size: 'lg' })
    expect(part('control').getBoundingClientRect().height).toBe(40)
    expect(part('swatch').getBoundingClientRect().width).toBe(24)
    await userEvent.click(part('input'))
    await userEvent.keyboard('{Escape}')
    await nextTick()
    expect(part('root').hasAttribute('data-empty')).toBe(true)
    const layers = getComputedStyle(part('swatch')).backgroundImage
    expect(layers.startsWith('linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0))')).toBe(true)
  })
})
