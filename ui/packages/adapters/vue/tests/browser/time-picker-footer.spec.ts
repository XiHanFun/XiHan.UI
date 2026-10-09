import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhTimePickerColumn,
  XhTimePickerConfirmTrigger,
  XhTimePickerContent,
  XhTimePickerControl,
  XhTimePickerFooter,
  XhTimePickerItem,
  XhTimePickerPositioner,
  XhTimePickerPreset,
  XhTimePickerPresetGroup,
  XhTimePickerRoot,
  XhTimePickerTagList,
  XhTimePickerTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

function part(name: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-scope='time-picker'][data-part='${name}']`)
  if (!element)
    throw new Error(`缺少时间选择部件：${name}`)
  return element
}

/** 在面板里按令牌解一次值，拿来与部件的计算样式比对。 */
function resolved(property: 'color' | 'font-size', value: string): string {
  const probe = document.createElement('span')
  probe.style.setProperty(property, value)
  part('content').append(probe)
  const out = getComputedStyle(probe).getPropertyValue(property)
  probe.remove()
  return out
}

/** 面板主体：快捷选项列与各时间列。 */
function body(): HTMLElement[] {
  return [...part('content').querySelectorAll<HTMLElement>(
    `:scope > [data-scope='time-picker']:is([data-part='preset-group'], [data-part='column'])`,
  )]
}

async function mount(options: { theme?: 'light' | 'dark', dir?: 'ltr' | 'rtl', multiple?: boolean, note?: boolean } = {}): Promise<void> {
  const { theme = 'light', dir = 'ltr', multiple = true, note = true } = options
  host = document.createElement('div')
  host.dataset.theme = theme
  host.dir = dir
  document.body.append(host)
  app = createApp({ render: () => h(XhTimePickerRoot, {
    dir,
    defaultOpen: true,
    defaultValue: multiple ? ['09:30'] : '09:30',
    selectionMode: multiple ? 'multiple' : 'single',
    presets: [{ value: '09:30', label: '上午九点半' }],
  }, () => [
    h(XhTimePickerControl, null, () => [
      h(XhTimePickerTagList),
      h(XhTimePickerTrigger),
    ]),
    h(XhTimePickerPositioner, null, () => h(XhTimePickerContent, null, () => [
      h(XhTimePickerPresetGroup, null, () => h(XhTimePickerPreset, { value: '09:30' })),
      ...(['hour', 'minute'] as const).map(unit => h(XhTimePickerColumn, { unit }, () =>
        Array.from({ length: unit === 'hour' ? 24 : 60 }, (_, index) => h(XhTimePickerItem, {
          value: String(index).padStart(2, '0'),
        }, () => String(index).padStart(2, '0'))))),
      h(XhTimePickerFooter, null, () => [
        ...(note ? [h('span', { 'data-testid': 'note' }, '北京时间')] : []),
        h(XhTimePickerConfirmTrigger, null, () => '添加'),
      ]),
    ])),
  ]) })
  app.mount(host)
  await nextTick()
  await nextTick()
  await expect.poll(() => part('content').getBoundingClientRect().width).toBeGreaterThan(0)
}

afterEach(async () => {
  await cdp().send('Emulation.setEmulatedMedia', { media: '', features: [] })
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

describe('时间选择浮层底栏', () => {
  it.each(['light', 'dark'] as const)('%s：底栏独占面板底部一整行，上沿一道实体面描边，上下 8 的内衬', async (theme) => {
    await mount({ theme })
    const content = part('content')
    const contentRect = content.getBoundingClientRect()
    const edge = Number.parseFloat(getComputedStyle(content).borderLeftWidth)
    const footer = part('footer')
    const rect = footer.getBoundingClientRect()
    // 通栏：贴着面板左右内沿，紧接在快捷选项列与各列下面
    expect(rect.left).toBeCloseTo(contentRect.left + edge, 1)
    expect(rect.right).toBeCloseTo(contentRect.right - edge, 1)
    expect(rect.top).toBeCloseTo(Math.max(...body().map(el => el.getBoundingClientRect().bottom)), 1)
    expect(rect.bottom).toBeCloseTo(contentRect.bottom - edge, 1)

    const style = getComputedStyle(footer)
    expect(style.borderTopStyle).toBe('solid')
    expect(style.borderTopWidth).toBe('1px')
    expect(style.borderTopColor).toBe(resolved('color', 'var(--xh-material-solid-border)'))
    // 上下 8 的内衬；行首行尾的 8 由首末子节点让出，见下面那条
    expect(style.paddingTop).toBe('8px')
    expect(style.paddingBottom).toBe('8px')
    // 作者的附注是次要信息：弱化的正文色、说明档字号
    expect(style.color).toBe(resolved('color', 'var(--xh-fg-muted)'))
    expect(style.fontSize).toBe(resolved('font-size', 'var(--xh-text-caption-size)'))
    // 底栏不是集合，不报角色、不占 Tab 位
    expect(footer.getAttribute('role')).toBeNull()
    expect(footer.hasAttribute('tabindex')).toBe(false)
  })

  it('底栏不参与撑宽：面板的宽仍由快捷选项列与各列定，底栏跟着铺满', async () => {
    await mount()
    const content = part('content')
    const edge = Number.parseFloat(getComputedStyle(content).borderRightWidth)
    const end = Math.max(...body().map(el => el.getBoundingClientRect().right))
    expect(content.getBoundingClientRect().right - edge).toBeCloseTo(end, 0)
    expect(part('footer').getBoundingClientRect().right).toBeCloseTo(end, 0)
  })

  it.each(['ltr', 'rtl'] as const)('%s：附注排在行首、「添加」落在行尾，各与底栏边让出 8，两者垂直居中', async (dir) => {
    await mount({ dir })
    const footer = part('footer').getBoundingClientRect()
    const confirm = part('confirm-trigger').getBoundingClientRect()
    const note = document.querySelector<HTMLElement>(`[data-testid='note']`)!.getBoundingClientRect()
    if (dir === 'ltr') {
      expect(note.left).toBeCloseTo(footer.left + 8, 1)
      expect(confirm.right).toBeCloseTo(footer.right - 8, 1)
    }
    else {
      expect(note.right).toBeCloseTo(footer.right - 8, 1)
      expect(confirm.left).toBeCloseTo(footer.left + 8, 1)
    }
    expect(confirm.top + confirm.height / 2).toBeCloseTo(footer.top + 1 + (footer.height - 1) / 2, 0)
    expect(note.top + note.height / 2).toBeCloseTo(footer.top + 1 + (footer.height - 1) / 2, 0)
  })

  it('单选时，只放了「添加」的底栏随它一并收起，不留空栏，各列照旧贴到面板底边', async () => {
    await mount({ multiple: false, note: false })
    expect(part('confirm-trigger').hidden).toBe(true)
    expect(getComputedStyle(part('footer')).display).toBe('none')
    const content = part('content')
    const edge = Number.parseFloat(getComputedStyle(content).borderBottomWidth)
    for (const el of body())
      expect(el.getBoundingClientRect().bottom).toBeCloseTo(content.getBoundingClientRect().bottom - edge, 1)
  })

  it('底栏里还有作者的别的内容时，「添加」收起后底栏仍在', async () => {
    await mount({ multiple: false })
    expect(part('confirm-trigger').hidden).toBe(true)
    expect(getComputedStyle(part('footer')).display).toBe('grid')
    expect(part('footer').getBoundingClientRect().height).toBeGreaterThan(0)
  })

  it('forced-colors：上沿分隔线照样画出、取系统前景色，「添加」仍在行尾', async () => {
    await cdp().send('Emulation.setEmulatedMedia', { media: '', features: [{ name: 'forced-colors', value: 'active' }] })
    expect(matchMedia('(forced-colors: active)').matches).toBe(true)
    await mount({ note: false })
    const footer = part('footer')
    const style = getComputedStyle(footer)
    expect(style.borderTopStyle).toBe('solid')
    expect(Number.parseFloat(style.borderTopWidth)).toBeGreaterThan(0)
    expect(style.borderTopColor).not.toBe(getComputedStyle(part('content')).backgroundColor)
    expect(part('confirm-trigger').getBoundingClientRect().right).toBeCloseTo(footer.getBoundingClientRect().right - 8, 1)
  })

  it('print：底栏随浮层一起不上纸', async () => {
    await mount({ note: false })
    await cdp().send('Emulation.setEmulatedMedia', { media: 'print' })
    expect(part('footer').getBoundingClientRect().height).toBe(0)
  })
})
