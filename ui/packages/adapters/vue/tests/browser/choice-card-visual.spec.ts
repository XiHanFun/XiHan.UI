// 选择卡片（RadioGroup / CheckboxGroup 的 card 形态）：卡面是描边卡、选中换品牌淡底，说明落在文案下方。
// 描边、圆角、底色与两行的排布只有真实浏览器量得出：jsdom 不排版、不解析层叠。
import type { App, Component } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhCheckboxGroupIndicator,
  XhCheckboxGroupItem,
  XhCheckboxGroupItemDescription,
  XhCheckboxGroupItemText,
  XhCheckboxGroupRoot,
  XhRadioGroupItem,
  XhRadioGroupItemDescription,
  XhRadioGroupItemText,
  XhRadioGroupRoot,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

interface Kit {
  root: Component
  item: Component
  text: Component
  description: Component
  /** 行首标记由条目自己装配时不写；复选框组的方框要作者写出来。 */
  indicator?: Component
  scope: string
  selected: Record<string, unknown>
}

const KITS: Kit[] = [
  { root: XhRadioGroupRoot, item: XhRadioGroupItem, text: XhRadioGroupItemText, description: XhRadioGroupItemDescription, scope: 'radio-group', selected: { defaultValue: 'basic' } },
  { root: XhCheckboxGroupRoot, item: XhCheckboxGroupItem, text: XhCheckboxGroupItemText, description: XhCheckboxGroupItemDescription, indicator: XhCheckboxGroupIndicator, scope: 'checkbox-group', selected: { defaultValue: ['basic'] } },
]

async function mount(kit: Kit, props: Record<string, unknown> = {}, width = 360): Promise<HTMLElement[]> {
  host = document.createElement('div')
  host.style.inlineSize = `${width}px`
  document.body.prepend(host)
  const card = (value: string, title: string, note: string) => h(kit.item, { value }, () => [
    ...(kit.indicator ? [h(kit.indicator)] : []),
    h(kit.text, null, () => title),
    h(kit.description, null, () => note),
  ])
  app = createApp({
    render: () => h(kit.root, { variant: 'card', ...kit.selected, ...props }, () => [
      card('basic', '基础版', '适合个人使用，含 10 GB 存储'),
      card('team', '团队版', '适合小团队协作，含 100 GB 存储'),
    ]),
  })
  app.mount(host)
  await nextTick()
  return [...host.querySelectorAll<HTMLElement>(`[data-scope='${kit.scope}'][data-part='item']`)]
}

/** 令牌在当前主题下解析成的颜色。 */
function tokenColor(name: string): string {
  const probe = document.createElement('span')
  probe.style.color = `var(${name})`
  document.body.append(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  return color
}

function part(item: HTMLElement, name: string): HTMLElement {
  return item.querySelector<HTMLElement>(`[data-part='${name}']`)!
}

describe.each(KITS)('$scope 的 card 形态（真实浏览器）', (kit) => {
  it('未选中是描边卡：控件边、surface 圆角、透明底、内衬 space-3 / space-4；卡片撑满一列', async () => {
    const [, team] = await mount(kit)
    const style = getComputedStyle(team!)
    expect(style.borderTopWidth).toBe('1px')
    expect(style.borderTopColor).toBe(tokenColor('--xh-border-control'))
    expect(style.borderTopLeftRadius).toBe('8px')
    expect(style.backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(style.paddingTop).toBe('12px')
    expect(style.paddingLeft).toBe('16px')
    expect(team!.getBoundingClientRect().width).toBeCloseTo(360, 0)
  })

  it('选中卡换品牌淡底、前景取 fg-on-brand-subtle，描边不换', async () => {
    const [basic] = await mount(kit)
    const style = getComputedStyle(basic!)
    expect(style.backgroundColor).toBe(tokenColor('--xh-bg-brand-subtle'))
    expect(style.color).toBe(tokenColor('--xh-fg-on-brand-subtle'))
    expect(style.borderTopColor).toBe(tokenColor('--xh-border-control'))
  })

  it('说明落在文案下方同一列：13px、fg-muted，行首标记与文案那一行对齐', async () => {
    const [, team] = await mount(kit)
    const title = part(team!, 'item-text').getBoundingClientRect()
    const note = part(team!, 'item-description')
    const noteRect = note.getBoundingClientRect()
    const indicator = part(team!, 'indicator').getBoundingClientRect()
    expect(noteRect.top).toBeGreaterThanOrEqual(title.bottom)
    expect(noteRect.left).toBeCloseTo(title.left, 0)
    expect(getComputedStyle(note).fontSize).toBe('13px')
    expect(getComputedStyle(note).color).toBe(tokenColor('--xh-fg-muted'))
    expect(indicator.top + indicator.height / 2).toBeCloseTo(title.top + title.height / 2, 0)
  })

  it('悬停未选中的卡走白底承载阶梯 100，不随语气染色', async () => {
    const [, team] = await mount(kit, { tone: 'success' })
    await userEvent.hover(team!)
    await expect.poll(() => getComputedStyle(team!).backgroundColor).toBe(tokenColor('--xh-bg-subtle'))
  })

  it('横排时两张卡等分一行、按内容等高；窄到放不下两张就折到下一行', async () => {
    const [basic, team] = await mount(kit, { orientation: 'horizontal' }, 480)
    const a = basic!.getBoundingClientRect()
    const b = team!.getBoundingClientRect()
    expect(a.width).toBeCloseTo(b.width, 0)
    expect(a.height).toBeCloseTo(b.height, 0)
    expect(b.left).toBeGreaterThan(a.right)

    app?.unmount()
    host?.remove()
    const [narrowA, narrowB] = await mount(kit, { orientation: 'horizontal' }, 320)
    expect(narrowB!.getBoundingClientRect().top).toBeGreaterThanOrEqual(narrowA!.getBoundingClientRect().bottom)
  })
})
