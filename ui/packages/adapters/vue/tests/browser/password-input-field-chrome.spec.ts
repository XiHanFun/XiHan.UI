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
  it('三尺寸与 compact 同步缩放高度与间距，切换钮取 field-inset 档正方盒并带半高分隔', async () => {
    // 钮走 field-inset 档：sm 固定 24px，md / lg 取小一档的控件高
    const cases = [
      ['comfortable-sm', 'comfortable', 'sm', 32, 4, 24],
      ['comfortable-md', 'comfortable', 'md', 36, 8, 32],
      ['comfortable-lg', 'comfortable', 'lg', 40, 12, 36],
      ['compact-sm', 'compact', 'sm', 28, 4, 24],
      ['compact-md', 'compact', 'md', 32, 6, 28],
      ['compact-lg', 'compact', 'lg', 36, 8, 32],
    ] as const
    await mount(cases.map(([id, density, size]) => fieldNode(id, { density, size })))

    for (const [id, , , height, gap, action] of cases) {
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
      expect(Number.parseFloat(getComputedStyle(control).columnGap)).toBe(gap)
      expect(distance(prefix.getBoundingClientRect(), input.getBoundingClientRect())).toBeCloseTo(gap, 1)
      expect(distance(input.getBoundingClientRect(), suffix.getBoundingClientRect())).toBeCloseTo(gap, 1)
      expect(distance(caps.getBoundingClientRect(), trigger.getBoundingClientRect())).toBeCloseTo(gap, 1)
      // 分隔线画在钮的背景层：1px × 钮半高，贴在靠输入的那一侧（钮排在输入之后即逻辑起始侧）
      expect(separator.backgroundSize).toBe('1px 50%')
      expect(separator.backgroundPosition).toBe('0px 50%')
      expect(separator.backgroundRepeat).toBe('no-repeat')
      expect(getComputedStyle(trigger).borderRadius).toBe('4px')
    }
  })

  it('只读仍可揭示并保留双焦点位置；禁用态统一输入、按钮与 Caps Lock 墨色', async () => {
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
    expect(getComputedStyle(readonlyControl).outlineStyle).toBe('solid')
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

  it('forced-colors 保留动作分隔，禁用分隔改用系统禁用色', async () => {
    await cdp().send('Emulation.setEmulatedMedia', {
      media: '',
      features: [{ name: 'forced-colors', value: 'active' }],
    })
    await mount([fieldNode('enabled'), fieldNode('forced-disabled', { disabled: true })])
    const enabled = getComputedStyle(part('enabled', 'visibility-trigger'))
    const disabled = getComputedStyle(part('forced-disabled', 'visibility-trigger'))
    // 高对比档整层丢弃 background-image，分隔线由皮肤用系统色重画
    expect(enabled.backgroundImage).not.toBe('none')
    expect(disabled.backgroundImage).not.toBe('none')
    expect(enabled.backgroundSize).toBe('1px 50%')
    expect(enabled.backgroundImage).not.toBe(disabled.backgroundImage)
  })
})
