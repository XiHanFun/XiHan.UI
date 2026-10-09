import type { Size } from '@xihan-ui/core'
import type { App, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp, userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhPasswordInputCapsLockIndicator,
  XhPasswordInputControl,
  XhPasswordInputInput,
  XhPasswordInputRoot,
  XhPasswordInputVisibilityTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

interface FieldOptions {
  density?: 'comfortable' | 'compact'
  disabled?: boolean
  readOnly?: boolean
  size?: Size
  theme?: 'light' | 'dark'
  variant?: 'outline' | 'subtle' | 'ghost'
}

function fieldNode(id: string, options: FieldOptions = {}): VNode {
  return h('div', {
    'data-density': options.density ?? 'comfortable',
    'data-testid': id,
    'data-theme': options.theme ?? 'light',
  }, [
    h(XhPasswordInputRoot, {
      defaultValue: 'Secret42',
      disabled: options.disabled,
      readOnly: options.readOnly,
      size: options.size ?? 'md',
      variant: options.variant,
    }, () => [
      h(XhPasswordInputControl, null, () => [
        h('span', { 'data-testid': 'prefix' }, '前'),
        h(XhPasswordInputInput),
        h('span', { 'data-testid': 'suffix' }, '后'),
        h(XhPasswordInputCapsLockIndicator),
        h(XhPasswordInputVisibilityTrigger),
      ]),
    ]),
  ])
}

async function mount(nodes: VNode[]): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ render: () => h('div', { style: 'display:flex;flex-wrap:wrap;gap:24px' }, nodes) })
  app.mount(host)
  await nextTick()
}

function field(id: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-testid='${id}']`)
  if (!element)
    throw new Error(`找不到 ${id}`)
  return element
}

function part(id: string, name: string): HTMLElement {
  const element = field(id).querySelector<HTMLElement>(`[data-scope='password-input'][data-part='${name}']`)
  if (!element)
    throw new Error(`找不到 ${id}/${name}`)
  return element
}

function distance(first: DOMRect, second: DOMRect): number {
  return second.left - first.right
}

function resolveColor(element: Element, property: string): string {
  const probe = document.createElement('span')
  probe.style.setProperty('--value', getComputedStyle(element).getPropertyValue(property))
  probe.style.color = 'var(--value)'
  document.body.append(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  return color
}

afterEach(async () => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
  await cdp().send('Emulation.setEmulatedMedia', { media: '', features: [] })
})

describe('password-input Field Chrome 细节', () => {
  it('三尺寸与 compact 同步缩放高度与间距，切换钮按字段内钮尺寸表随档取正方盒，不再画分隔线', async () => {
    // 钮走字段内钮（field-inset）尺寸表：sm 取控件内动作档、md 取 --xh-control-h-sm、lg 取 --xh-control-h-md；
    // 字形 sm / md 取 --xh-control-indicator-sm、lg 取 --xh-control-indicator-md；字段高与间距随档
    const inset = {
      sm: ['--xh-control-action-size', '--xh-control-indicator-sm'],
      md: ['--xh-control-h-sm', '--xh-control-indicator-sm'],
      lg: ['--xh-control-h-md', '--xh-control-indicator-md'],
    } as const
    const cases = [
      ['comfortable-sm', 'comfortable', 'sm'],
      ['comfortable-md', 'comfortable', 'md'],
      ['comfortable-lg', 'comfortable', 'lg'],
      ['compact-sm', 'compact', 'sm'],
      ['compact-md', 'compact', 'md'],
      ['compact-lg', 'compact', 'lg'],
    ] as const
    await mount(cases.map(([id, density, size]) => fieldNode(id, { density, size })))
    const tokenPx = (within: HTMLElement, token: string): number => {
      const probe = document.createElement('span')
      probe.style.cssText = `position:absolute;inline-size:var(${token})`
      within.append(probe)
      const value = probe.getBoundingClientRect().width
      probe.remove()
      return value
    }

    for (const [id, , size] of cases) {
      const height = tokenPx(field(id), `--xh-control-h-${size}`)
      const gap = tokenPx(field(id), `--xh-control-gap-${size}`)
      const action = tokenPx(field(id), inset[size][0])
      const glyph = tokenPx(field(id), inset[size][1])
      const control = part(id, 'control')
      const input = part(id, 'input')
      const trigger = part(id, 'visibility-trigger')
      const caps = part(id, 'caps-lock-indicator')
      const prefix = field(id).querySelector<HTMLElement>(`[data-testid='prefix']`)!
      const suffix = field(id).querySelector<HTMLElement>(`[data-testid='suffix']`)!
      const separator = getComputedStyle(trigger)

      expect(control.getBoundingClientRect().height).toBe(height)
      expect(trigger.getBoundingClientRect().width).toBe(action)
      expect(trigger.getBoundingClientRect().height).toBe(action)
      expect(getComputedStyle(trigger, '::before').inlineSize).toBe(`${glyph}px`)
      expect(Number.parseFloat(getComputedStyle(control).columnGap)).toBe(gap)
      expect(distance(prefix.getBoundingClientRect(), input.getBoundingClientRect())).toBeCloseTo(gap, 1)
      expect(distance(input.getBoundingClientRect(), suffix.getBoundingClientRect())).toBeCloseTo(gap, 1)
      expect(distance(caps.getBoundingClientRect(), trigger.getBoundingClientRect())).toBeCloseTo(gap, 1)
      // 钮与输入之间不再画半高分隔线；圆角取 inset 档
      expect(separator.backgroundSize).not.toBe('1px 50%')
      expect(getComputedStyle(trigger).borderRadius).toBe(getComputedStyle(field(id)).getPropertyValue('--xh-shape-inset').trim())
    }
  })

  it('只读仍可揭示并保留双焦点位置（盒换聚焦描边、钮画自己的环）；禁用态统一输入、按钮与 Caps Lock 墨色', async () => {
    await mount([
      fieldNode('readonly', { readOnly: true, theme: 'dark' }),
      fieldNode('disabled', { disabled: true, theme: 'dark' }),
    ])
    const readonlyControl = part('readonly', 'control')
    const readonlyInput = part('readonly', 'input') as HTMLInputElement
    const readonlyTrigger = part('readonly', 'visibility-trigger') as HTMLButtonElement
    expect(readonlyInput.readOnly).toBe(true)
    expect(readonlyTrigger.disabled).toBe(false)

    await userEvent.keyboard('{Tab}')
    expect(document.activeElement).toBe(readonlyInput)
    // 盒聚焦不画环，由聚焦描边标出；钮自己占一个 Tab 位，落到钮上时钮画自己的环
    expect(getComputedStyle(readonlyControl).outlineStyle).toBe('none')
    expect(getComputedStyle(readonlyInput).outlineStyle).toBe('none')
    await userEvent.keyboard('{Tab}')
    expect(document.activeElement).toBe(readonlyTrigger)
    expect(getComputedStyle(readonlyTrigger).outlineStyle).toBe('solid')
    expect(getComputedStyle(readonlyTrigger).outlineOffset).toBe('-2px')

    const disabledInput = part('disabled', 'input') as HTMLInputElement
    const disabledTrigger = part('disabled', 'visibility-trigger') as HTMLButtonElement
    const disabledCaps = part('disabled', 'caps-lock-indicator')
    expect(disabledInput.disabled).toBe(true)
    expect(disabledTrigger.disabled).toBe(true)
    expect(getComputedStyle(disabledTrigger).cursor).toBe('not-allowed')
    expect(getComputedStyle(disabledCaps).color).toBe(getComputedStyle(disabledTrigger).color)
  })

  it('自动填充由家族用 canvas 实体底与默认前景重绘，三档形态与只读、禁用都盖得住平台底', async () => {
    await mount([
      fieldNode('outline'),
      fieldNode('subtle', { variant: 'subtle' }),
      fieldNode('readonly-fill', { readOnly: true }),
      fieldNode('disabled-fill', { disabled: true }),
      fieldNode('ghost', { variant: 'ghost' }),
    ])

    const canvas = resolveColor(part('outline', 'control'), '--xh-bg-canvas')
    const fg = resolveColor(part('outline', 'control'), '--xh-fg-default')
    expect(canvas).not.toBe('rgba(0, 0, 0, 0)')
    for (const id of ['outline', 'subtle', 'readonly-fill', 'disabled-fill', 'ghost']) {
      const input = part(id, 'input')
      expect(input.dataset.xhFieldInput).toBe('')
      expect(resolveColor(input, '--xh-field-autofill-bg')).toBe(canvas)
      expect(resolveColor(input, '--xh-field-autofill-fg')).toBe(fg)
    }
  })

  it('空切换钮使用内置眼睛字形并随明暗状态切换', async () => {
    await mount([fieldNode('glyph')])
    const trigger = part('glyph', 'visibility-trigger') as HTMLButtonElement
    const mask = (): string => {
      const style = getComputedStyle(trigger, '::before')
      return style.maskImage || style.webkitMaskImage || ''
    }
    const hiddenMask = mask()

    expect(trigger.textContent).toBe('')
    expect(hiddenMask).toContain('data:image/svg')
    await userEvent.click(trigger)
    await nextTick()
    expect(trigger.dataset.state).toBe('visible')
    expect(mask()).toContain('data:image/svg')
    expect(mask()).not.toBe(hiddenMask)
  })

  it('forced-colors：钮不再关强制换色、不画分隔线，键盘焦点环取系统高亮色', async () => {
    await cdp().send('Emulation.setEmulatedMedia', {
      media: '',
      features: [{ name: 'forced-colors', value: 'active' }],
    })
    await mount([fieldNode('enabled')])
    const trigger = part('enabled', 'visibility-trigger')
    const enabled = getComputedStyle(trigger)
    expect(enabled.forcedColorAdjust).toBe('auto')
    expect(enabled.backgroundSize).not.toBe('1px 50%')

    const probe = document.createElement('span')
    probe.style.cssText = 'color: Highlight'
    document.body.append(probe)
    const highlight = getComputedStyle(probe).color
    probe.remove()

    part('enabled', 'input').focus()
    await userEvent.keyboard('{Tab}')
    expect(document.activeElement).toBe(trigger)
    expect(trigger.matches(':focus-visible')).toBe(true)
    expect(enabled.outlineStyle).toBe('solid')
    expect(enabled.outlineColor).toBe(highlight)
  })
})
