// 设置对话框在真实 Chromium 与组件皮肤下：左边竖排分区、右边条目，换页时对话框不跳高；
// 主题写在设计器根上，搬到浮层根的对话框经视觉桥跟着变暗；设计器外面包一层局部 <xh-config> 时，搬到浮层根的
// 标题、字段与对话框自己的文案都取这一层的语言；没有 wc.* 诊断，axe 也没有违规。
import type { DiagnosticRecord } from '@xihan-ui/core'
import type { DesignerSettingsSection, XhDesignerSettingsElement } from '../../src'
import { onDiagnostic, resetDiagnostics, setDiagnosticsConsoleOutput, setDiagnosticsDedupe, setDiagnosticsLevel } from '@xihan-ui/core'
import { expectNoAxeViolations } from '@xihan-ui/testing/a11y'
import { BRAND_PRESET_COLORS, BRAND_PRESETS } from '@xihan-ui/tokens'
import { mergeXhConfig } from '@xihan-ui/web-components'
import { defineXhElement, XhConfigElement } from '@xihan-ui/web-components/define'
import { zhCN } from '@xihan-ui/web-components/locale'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createDesignerSettingsHost, defineDesignerShell } from '../../src'
import { designerShellZhCN } from '../../src/locale'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'
import '../../style.css'

defineDesignerShell()
defineXhElement('xh-config', XhConfigElement)

const flowSection: DesignerSettingsSection = {
  id: 'flow',
  label: '流程',
  order: 100,
  items: [
    { path: ['grid'], label: '网格', control: { kind: 'boolean' }, default: true, meta: { description: '画布上显示网格' } },
    { path: ['snap'], label: '吸附距离', control: { kind: 'number', min: 0, unit: 'px' }, default: 8 },
  ],
}

let root: HTMLElement | undefined

afterEach(() => {
  root?.remove()
  root = undefined
})

async function frames(count = 2): Promise<void> {
  for (let i = 0; i < count; i++)
    await new Promise(resolve => requestAnimationFrame(resolve))
}

/** 等进场与换页的动画播完：缩放与淡入会改量出来的高度与颜色。 */
async function settle(): Promise<void> {
  await frames()
  const finite = document.getAnimations().filter(animation => animation.effect?.getComputedTiming().endTime !== Infinity)
  await Promise.all(finite.map(animation => animation.finished.catch(() => {})))
  await frames()
}

async function mount(): Promise<XhDesignerSettingsElement> {
  root = document.createElement('div')
  const element = document.createElement('xh-designer-settings')
  element.general = { brands: [{ value: 'blue', color: '#1677ff' }] }
  element.sections = [flowSection]
  root.append(element)
  document.body.append(root)
  await element.updateComplete
  return element
}

function content(): HTMLElement {
  return document.querySelector<HTMLElement>('xh-dialog [data-part="content"], [data-scope="dialog"][data-part="content"]')!
}

describe('设置对话框', () => {
  it('左边竖排分区、右边条目；换页时对话框高度不变；点分区切页', async () => {
    const element = await mount()
    element.show()
    await element.updateComplete
    await settle()
    const list = document.querySelector<HTMLElement>('xh-tabs [data-xh-part="list"]')!.getBoundingClientRect()
    const items = document.querySelector<HTMLElement>('[data-scope="designer-settings"][data-part="items"]')!.getBoundingClientRect()
    expect(list.right).toBeLessThanOrEqual(items.left + 1)
    const before = content().getBoundingClientRect().height
    await userEvent.click(document.querySelector<HTMLElement>('xh-tabs [data-xh-part="list"] > button[value="flow"]')!)
    await element.updateComplete
    await settle()
    expect(element.section).toBe('flow')
    const grid = document.querySelector<HTMLElement>('[data-setting="flow.grid"]')!
    expect(grid.getBoundingClientRect().width).toBeGreaterThan(0)
    expect(Math.abs(content().getBoundingClientRect().height - before)).toBeLessThanOrEqual(1)
  })

  it('主题写在设计器根上：对话框搬到浮层根后经视觉桥跟着变暗', async () => {
    const element = await mount()
    const host = createDesignerSettingsHost({ root: root! })
    element.show()
    await element.updateComplete
    await settle()
    const light = getComputedStyle(content()).backgroundColor
    host.apply({ 'general.theme': 'dark' })
    await settle()
    expect(root!.contains(content())).toBe(false)
    expect(getComputedStyle(content()).backgroundColor).not.toBe(light)
    host.dispose()
  })

  const presetCases = (['light', 'dark'] as const).flatMap(theme => BRAND_PRESETS.map(preset => [theme, preset] as const))

  it.each(presetCases)('宿主是 %s，主题跟随页面、选预设 %s：设计器里的品牌令牌换成那一档，外面的不变', async (theme, preset) => {
    const page = document.createElement('div')
    page.setAttribute('data-theme', theme)
    root = document.createElement('div')
    page.append(root)
    document.body.append(page)
    const tokenColor = (scope: Element, token: string): string => {
      const probe = document.createElement('span')
      probe.style.setProperty('color', `var(${token})`)
      scope.append(probe)
      const value = getComputedStyle(probe).color
      probe.remove()
      return value
    }
    const literal = (color: string): string => {
      const probe = document.createElement('span')
      probe.style.setProperty('color', color)
      document.body.append(probe)
      const value = getComputedStyle(probe).color
      probe.remove()
      return value
    }
    const before = tokenColor(root, '--xh-bg-brand')
    const brands = BRAND_PRESETS.map(id => ({ value: id, color: BRAND_PRESET_COLORS[id] }))
    const host = createDesignerSettingsHost({ root, brands })
    host.apply({ 'general.brand': preset })
    expect(root.getAttribute('data-theme')).toBe(theme)
    expect(tokenColor(root, '--xh-color-brand-600')).toBe(literal(BRAND_PRESET_COLORS[preset]))
    expect(tokenColor(root, '--xh-bg-brand')).not.toBe(before)
    expect(tokenColor(root, '--xh-bg-brand')).toBe(tokenColor(root, theme === 'light' ? '--xh-color-brand-600' : '--xh-color-brand-500'))
    expect(tokenColor(page, '--xh-bg-brand')).toBe(before)
    host.dispose()
    expect(tokenColor(root, '--xh-bg-brand')).toBe(before)
    page.remove()
  })

  it('设计器外面包一层局部 <xh-config>：对话框搬到浮层根以后，标题、字段与关闭钮的文案都取这一层的语言', async () => {
    const scope = document.createElement('xh-config') as HTMLElement & { translations?: unknown }
    scope.translations = mergeXhConfig(zhCN, designerShellZhCN).translations
    root = scope
    const element = document.createElement('xh-designer-settings')
    element.general = { brands: [{ value: 'blue', color: '#1677ff' }], customBrand: true }
    element.sections = [flowSection]
    scope.append(element)
    document.body.append(scope)
    element.show()
    await element.updateComplete
    await settle()
    const dialog = content()
    // 内容确实搬离了设计器所在的位置
    expect(scope.contains(dialog)).toBe(false)
    const brand = dialog.querySelector<HTMLElement>('[data-setting="general.brand"]')!
    const names = Array.from(brand.querySelectorAll('[aria-label]'), node => node.getAttribute('aria-label'))
    const close = dialog.querySelector<HTMLElement>('[data-xh-part="close-trigger"], [data-part="close-trigger"]')!
    expect([dialog.querySelector('[data-xh-part="title"], [data-part="title"]')!.textContent, names.includes('自定义颜色'), close.getAttribute('aria-label')])
      .toEqual(['设置', true, '关闭'])
  })

  it('打开时没有 wc.* 诊断，axe 也没有违规', async () => {
    const records: DiagnosticRecord[] = []
    resetDiagnostics()
    setDiagnosticsLevel('warn')
    setDiagnosticsDedupe(false)
    setDiagnosticsConsoleOutput(false)
    const off = onDiagnostic(record => void records.push(record))
    try {
      const element = await mount()
      element.show()
      await element.updateComplete
      await settle()
      expect(records.filter(record => record.code.startsWith('wc.')).map(record => record.code)).toEqual([])
      await expectNoAxeViolations(content())
    }
    finally {
      off()
      resetDiagnostics()
    }
  })
})
