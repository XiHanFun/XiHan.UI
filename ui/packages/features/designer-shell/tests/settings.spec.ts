// @vitest-environment jsdom

// 设置：模型（键、取值、分区合并与排序、宿主管控、内建「基础」分区）、设置对话框与宿主应用。
import type { JsonValue } from '@xihan-ui/core/json'
import type { DesignerCommand } from '@xihan-ui/designer-kit'
import type { DesignerDisplayControl, DesignerFrameEventMap, DesignerLayoutChangeReason, DesignerSettingEditor, DesignerSettings, DesignerSettingsEventMap, DesignerSettingsSection, ResolvedDesignerLayout, XhDesignerFrameElement, XhDesignerSettingsElement } from '../src'
import { DesignerExtensionError } from '@xihan-ui/designer-kit'
import { BRAND_PRESET_COLORS, BRAND_PRESETS } from '@xihan-ui/tokens'
import { setXhConfig } from '@xihan-ui/web-components'
import { defineXhElement, XhConfigElement } from '@xihan-ui/web-components/define'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  collectSettingsSections,
  createDesignerSettingsHost,
  defineDesignerShell,
  DESIGNER_COMMON_KEYS,
  DESIGNER_LANGUAGES,
  DESIGNER_SETTING_KEYS,
  DESIGNER_SHELL_VERSION,
  designerAboutSettings,
  designerGeneralSettings,
  designerHelpSettings,
  designerLanguageSettings,
  designerLayoutSettings,
  designerShortcutSettings,
  designerToolbarSettings,
  isDesignerDisplayControl,
  resolveSettings,
  settingKey,
  settingPolicy,
  settingValue,
  shortcutSettingsSource,
  sortSettingsSections,
  toolbarDisplayOf,
  toolbarSettingsSource,
  toolbarVisibleOf,
} from '../src'
import * as shell from '../src'
import { designerShellZhCN } from '../src/locale'
import { DESIGNER_SETTINGS_EN_US } from '../src/locale/en-US'

defineDesignerShell()
defineXhElement('xh-config', XhConfigElement)

afterEach(() => {
  document.body.innerHTML = ''
  setXhConfig({})
  localStorage.clear()
})

const english = DESIGNER_SETTINGS_EN_US

const flowSection: DesignerSettingsSection = {
  id: 'flow',
  label: '流程',
  order: 100,
  items: [
    { path: ['grid'], label: '网格', control: { kind: 'boolean' }, default: true, meta: { description: '画布上显示网格' } },
    { path: ['token'], label: '令牌', control: { kind: 'text', secret: true } },
  ],
}

function emit(target: Element, type: string, detail: unknown): void {
  target.dispatchEvent(new CustomEvent(type, { detail, bubbles: true }))
}

async function mount(setup: (element: XhDesignerSettingsElement) => void): Promise<XhDesignerSettingsElement> {
  const element = document.createElement('xh-designer-settings')
  setup(element)
  document.body.append(element)
  await element.updateComplete
  return element
}

function row(key: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-setting="${key}"]`)!
}

function triggers(): string[] {
  return [...document.querySelectorAll('xh-tabs [data-xh-part="list"] > button')].map(node => node.textContent ?? '')
}

describe('设置模型', () => {
  it('键是分区 id 加条目 path；没写的键取条目的缺省值', () => {
    const grid = flowSection.items[0]!
    expect(settingKey(flowSection, grid)).toBe('flow.grid')
    expect([settingValue(undefined, flowSection, grid), settingValue({ 'flow.grid': false }, flowSection, grid), settingValue({}, flowSection, flowSection.items[1]!)]).toEqual([true, false, undefined])
  })

  it('生效的设置：写了的键原样保留（分区里没有的也留着），没写的条目取缺省值，没有缺省值的不写', () => {
    expect(resolveSettings([flowSection], undefined)).toEqual({ 'flow.grid': true })
    expect(resolveSettings([flowSection], { 'flow.grid': false, 'flow.token': 'k', 'other.x': 1 })).toEqual({ 'flow.grid': false, 'flow.token': 'k', 'other.x': 1 })
    expect(resolveSettings([], { 'general.theme': 'dark' })).toEqual({ 'general.theme': 'dark' })
    // 内建分区要缺省值时把它们也传进来
    const general = designerGeneralSettings(DESIGNER_SETTINGS_EN_US)
    const toolbar = designerToolbarSettings(DESIGNER_SETTINGS_EN_US)
    expect(resolveSettings([general, toolbar, flowSection], {})).toMatchObject({ 'general.theme': 'follow', 'toolbar.display': 'icon', 'toolbar.visible': true, 'flow.grid': true })
  })

  it('合起各来源的分区：分区 id 重名或占用 general 时抛 DesignerExtensionError，名字空间是 settings-section', () => {
    expect(collectSettingsSections([{ id: 'flow', settings: [flowSection] }, { id: 'none' }]).map(section => section.id)).toEqual(['flow'])
    const duplicate = (): unknown => collectSettingsSections([{ id: 'a', settings: [flowSection] }, { id: 'b', settings: [flowSection] }])
    expect(duplicate).toThrow(DesignerExtensionError)
    expect(duplicate).toThrow(/settings-section/)
    expect(() => collectSettingsSections([{ id: 'x', settings: [{ id: 'general', label: 'G', items: [] }] }])).toThrow(/@xihan-ui\/designer-shell/)
    expect(() => collectSettingsSections([{ id: 'x', settings: [{ id: 'layout', label: 'L', items: [] }] }])).toThrow(/@xihan-ui\/designer-shell/)
    expect(() => collectSettingsSections([{ id: 'x', settings: [{ id: 'language', label: 'L', items: [] }] }])).toThrow(/@xihan-ui\/designer-shell/)
    expect(() => collectSettingsSections([{ id: 'x', settings: [{ id: 'toolbar', label: 'T', items: [] }] }])).toThrow(/@xihan-ui\/designer-shell/)
  })

  it('按 order 排，同值保持登记顺序；没写 order 当 0', () => {
    const sections = [
      { id: 'c', label: 'c', order: 200, items: [] },
      { id: 'a', label: 'a', order: 100, items: [] },
      { id: 'b', label: 'b', order: 100, items: [] },
      { id: 'z', label: 'z', items: [] },
    ]
    expect(sortSettingsSections(sections).map(section => section.id)).toEqual(['z', 'a', 'b', 'c'])
  })

  it('宿主管控：条目键优先，其次分区 id', () => {
    const grid = flowSection.items[0]!
    expect([
      settingPolicy(undefined, flowSection, grid),
      settingPolicy({ flow: 'locked' }, flowSection, grid),
      settingPolicy({ 'flow': 'locked', 'flow.grid': 'hidden' }, flowSection, grid),
    ]).toEqual([undefined, 'locked', 'hidden'])
  })

  it('「基础」分区：主题、主题色与状态栏，语言不在这里；主题色内置：跟随页面（缺省，不写值）、UI 的 8 个预设（带名字）、自定义颜色', () => {
    const keys = (section: DesignerSettingsSection): string[] => section.items.map(item => settingKey(section, item))
    const full = designerGeneralSettings(english)
    expect(keys(full)).toEqual([DESIGNER_SETTING_KEYS.theme, DESIGNER_SETTING_KEYS.brand, DESIGNER_SETTING_KEYS.statusBar, DESIGNER_SETTING_KEYS.developer])
    const names = [english.brandBlue, english.brandCyan, english.brandTeal, english.brandGreen, english.brandOrange, english.brandRed, english.brandPink, english.brandPurple]
    expect(full.items[1]!.control).toEqual({
      kind: 'swatch',
      options: BRAND_PRESETS.map((id, index) => ({ value: id, color: BRAND_PRESET_COLORS[id], label: names[index] })),
      custom: true,
      none: english.brandFollow,
    })
    expect([full.items[1]!.default, new Set(names).size]).toEqual([undefined, 8])
    const developer = full.items.find(item => settingKey(full, item) === DESIGNER_SETTING_KEYS.developer)!
    expect([developer.label, developer.control, developer.default, developer.meta?.description]).toEqual([english.developer, { kind: 'boolean' }, false, english.developerHint])
    expect([full.id, full.order, full.items[0]!.default, full.items[2]!.default]).toEqual(['general', 0, 'follow', true])
  })

  it('「语言」分区单独一页，排在「基础」之后：一条下拉，缺省跟随页面，再是跟随系统与外壳自带的全部语言（名字是本名）；「布局」「工具栏」顺次往后', () => {
    const section = designerLanguageSettings(english)
    expect([section.id, section.label, section.order, section.items.map(item => settingKey(section, item))]).toEqual(['language', english.language, 1, [DESIGNER_SETTING_KEYS.language]])
    const item = section.items[0]!
    expect([item.label, item.default, item.meta?.description]).toEqual([english.languageDisplay, 'follow', english.languageHint])
    expect(item.control).toEqual({
      kind: 'select',
      appearance: 'dropdown',
      options: [{ value: 'follow', label: english.languageFollow }, { value: 'system', label: english.languageSystem }, ...DESIGNER_LANGUAGES],
    })
    expect([designerLayoutSettings(english).order, designerToolbarSettings(english).order]).toEqual([2, 3])
  })

  it('「工具栏」分区：按钮显示方式与显示工具栏总有，给了 layout 才有按钮表；菜单栏常开，没有显示菜单栏这一条', () => {
    const keys = (section: DesignerSettingsSection): string[] => section.items.map(item => settingKey(section, item))
    const plain = designerToolbarSettings(english)
    expect([plain.id, plain.order, keys(plain)]).toEqual(['toolbar', 3, [DESIGNER_SETTING_KEYS.toolbarDisplay, DESIGNER_SETTING_KEYS.toolbarVisible]])
    expect([Object.values(DESIGNER_SETTING_KEYS).includes('toolbar.menubar' as never), 'menubarVisibleOf' in shell]).toEqual([false, false])
    expect([plain.items[0]!.default, plain.items[1]!.default]).toEqual(['icon', true])
    expect(plain.items[0]!.control).toMatchObject({ kind: 'select', appearance: 'toggle', options: [{ value: 'icon' }, { value: 'text' }, { value: 'both' }] })
    const full = designerToolbarSettings(english, { layout: true })
    expect([keys(full).at(-1), full.items.at(-1)!.control]).toEqual([DESIGNER_SETTING_KEYS.toolbarLayout, { kind: 'toolbarLayout' }])
  })

  it('toolbarDisplayOf 取工具栏按钮的显示方式，没写或不认识的值是 icon；toolbarVisibleOf 只有写了 false 才不显示', () => {
    expect([toolbarDisplayOf(undefined), toolbarDisplayOf({ 'toolbar.display': 'both' }), toolbarDisplayOf({ 'toolbar.display': 'text' }), toolbarDisplayOf({ 'toolbar.display': 'large' })]).toEqual(['icon', 'both', 'text', 'icon'])
    expect([toolbarVisibleOf(undefined), toolbarVisibleOf({ 'toolbar.visible': false }), toolbarVisibleOf({ 'toolbar.visible': 0 })]).toEqual([true, false, true])
  })
})

describe('<xh-designer-settings>', () => {
  it('左边一个分区一页，「基础」「工具栏」在前；条目按内建编辑方式铺成字段，说明取 meta.description', async () => {
    await mount((element) => {
      element.sections = [flowSection]
    })
    expect(triggers()).toEqual([english.general, english.language, english.toolbar, '流程'])
    expect(row('language.locale')).not.toBeNull()
    expect([row('toolbar.display') !== null, row('toolbar.visible') !== null, row('toolbar.layout')]).toEqual([true, true, null])
    expect(row('general.theme').querySelector('xh-toggle-group')).not.toBeNull()
    expect(row('flow.grid').querySelector('xh-switch')).not.toBeNull()
    expect(row('flow.grid').textContent).toContain('画布上显示网格')
    expect(row('flow.token').querySelector('xh-password-input')).not.toBeNull()
  })

  it('改一条：写进 settings、派发 settings-change；清空即删掉这个键，回到缺省值', async () => {
    const element = await mount((el) => {
      el.sections = [flowSection]
      el.settings = { 'flow.other': 1 }
    })
    const changes: { key: string, value: JsonValue | undefined, settings: DesignerSettings }[] = []
    element.addEventListener('settings-change', event => changes.push((event as DesignerSettingsEventMap['settings-change']).detail))
    emit(row('flow.grid').querySelector('xh-switch')!, 'checked-change', { checked: false })
    expect(changes.at(-1)).toEqual({ key: 'flow.grid', value: false, settings: { 'flow.other': 1, 'flow.grid': false } })
    expect(element.settings).toEqual({ 'flow.other': 1, 'flow.grid': false })
    emit(row('general.theme').querySelector('xh-toggle-group')!, 'value-change', { value: '3' })
    expect(element.settings).toEqual({ 'flow.other': 1, 'flow.grid': false, 'general.theme': 'dark' })
    emit(row('general.theme').querySelector('xh-toggle-group')!, 'value-change', { value: null })
    expect(changes.at(-1)!.value).toBeUndefined()
    expect(element.settings).toEqual({ 'flow.other': 1, 'flow.grid': false })
  })

  it('宿主管控：hidden 不显示（整页都藏了就没有这一页），locked 只读、说明换成锁定文案', async () => {
    const element = await mount((el) => {
      el.sections = [flowSection]
      el.policy = { 'general.theme': 'locked', 'flow': 'hidden' }
    })
    expect(triggers()).toEqual([english.general, english.language, english.toolbar])
    expect(row('flow.grid')).toBeNull()
    expect(row('general.theme').querySelector('xh-field')!.hasAttribute('read-only')).toBe(true)
    expect(row('general.theme').textContent).toContain(english.locked)
    const changes: unknown[] = []
    element.addEventListener('settings-change', event => changes.push((event as DesignerSettingsEventMap['settings-change']).detail))
    emit(row('general.theme').querySelector('xh-toggle-group')!, 'value-change', { value: '3' })
    expect(changes).toEqual([])
  })

  it('general、toolbar 为 false 时不要「基础」「工具栏」，「语言」经 policy 藏掉；没有可显示的分区时对话框只剩标题', async () => {
    await mount((el) => {
      el.general = false
      el.toolbar = false
      el.policy = { language: 'hidden' }
      el.sections = [flowSection]
    })
    expect(triggers()).toEqual(['流程'])
    document.querySelector('xh-designer-settings')!.sections = []
    await document.querySelector('xh-designer-settings')!.updateComplete
    expect(triggers()).toEqual([])
  })

  it('自定义种类用 editors 里按种类登记的编辑器，被编辑的对象是整份设置；没登记时只显示值', async () => {
    const seen: (JsonValue | undefined)[] = []
    const editor: DesignerSettingEditor = (context) => {
      const button = document.createElement('button')
      button.addEventListener('click', () => context.setValue('picked'))
      return { element: button, update: next => void seen.push(next.value) }
    }
    const custom: DesignerSettingsSection = {
      id: 'print',
      label: '打印',
      items: [
        { path: ['printer'], label: '打印机', control: { kind: 'printer-picker' }, default: 'A' },
        { path: ['raw'], label: '原样', control: { kind: 'unknown' }, default: { a: 1 } },
      ],
    }
    const element = await mount((el) => {
      el.general = false
      el.sections = [custom]
      el.editors = { 'printer-picker': editor }
    })
    expect(seen.at(-1)).toBe('A')
    expect(row('print.printer').getAttribute('role')).toBe('group')
    row('print.printer').querySelector('button')!.click()
    expect(element.settings).toEqual({ 'print.printer': 'picked' })
    await element.updateComplete
    expect(seen.at(-1)).toBe('picked')
    expect(row('print.raw').textContent).toContain('{"a":1}')
  })

  it('show(section) 打开对话框并切到那一页；对话框要关上时 open 跟着变并派发 open-change', async () => {
    const element = await mount((el) => {
      el.sections = [flowSection]
    })
    const dialog = element.querySelector<HTMLElement & { open?: boolean }>('xh-dialog')!
    expect(dialog.open).toBe(false)
    element.show('flow')
    await element.updateComplete
    expect([element.open, element.section, dialog.open]).toEqual([true, 'flow', true])
    // 打开后对话框的内容搬到了浮层根
    expect(element.querySelector('xh-tabs')).toBeNull()
    expect(document.querySelector<HTMLElement & { value?: string }>('xh-tabs')!.value).toBe('flow')
    const opens: boolean[] = []
    element.addEventListener('open-change', event => opens.push((event as DesignerSettingsEventMap['open-change']).detail.open))
    emit(dialog, 'open-change', { open: false })
    expect([element.open, opens]).toEqual([false, [false]])
  })

  it('页里控件冒泡上来的 value-change 不当作换页', async () => {
    const element = await mount((el) => {
      el.sections = [flowSection]
      el.section = 'flow'
    })
    emit(row('general.theme').querySelector('xh-toggle-group')!.parentElement!, 'value-change', { value: 'general' })
    expect(element.section).toBe('flow')
  })

  it('文案取所在位置的配置：标题与「基础」分区随语言，字段的文案在对话框搬到浮层根之后也是这一份', async () => {
    const scope = document.createElement('xh-config') as HTMLElement & { translations?: unknown }
    scope.translations = designerShellZhCN.translations
    document.body.append(scope)
    const element = document.createElement('xh-designer-settings')
    scope.append(element)
    await element.updateComplete
    const zh = designerShellZhCN.translations!['xh-designer-settings']!
    expect(element.querySelector('h2')!.textContent).toBe(zh.title)
    expect(triggers()).toEqual([zh.general, zh.language, zh.toolbar])
    element.show()
    await element.updateComplete
    expect(scope.contains(row('general.brand'))).toBe(false)
    // 搬过去之后再刷新一次：字段从浮层根往上找不到这层配置
    element.settings = { 'general.brand': '#ff0000' }
    await element.updateComplete
    expect(row('general.brand').textContent).toContain(zh.brand)
    const custom = row('general.brand').querySelector('xh-color-field')!
    expect(custom.getAttribute('aria-label')).toBe(designerShellZhCN.translations!['xh-designer-properties']!.customColor)
  })
})

describe('createDesignerSettingsHost', () => {
  function root(): HTMLElement {
    const element = document.createElement('div')
    document.body.append(element)
    return element
  }

  it('主题写成设计器根的 data-theme：跟随页面时还原成接手前的值，dispose 也还原', () => {
    const element = root()
    element.setAttribute('data-theme', 'light')
    const host = createDesignerSettingsHost({ root: element })
    host.apply({ 'general.theme': 'dark' })
    expect(element.getAttribute('data-theme')).toBe('dark')
    host.apply({})
    expect(element.getAttribute('data-theme')).toBe('light')
    host.apply({ 'general.theme': 'dark' })
    host.dispose()
    expect(element.getAttribute('data-theme')).toBe('light')
  })

  it('跟随系统：按 prefers-color-scheme 写，系统改了跟着改，换走后不再监听', () => {
    const listeners = new Set<() => void>()
    let dark = false
    vi.stubGlobal('matchMedia', (query: string) => ({
      get matches() {
        return query === '(prefers-color-scheme: dark)' && dark
      },
      addEventListener: (_type: string, fn: () => void) => listeners.add(fn),
      removeEventListener: (_type: string, fn: () => void) => listeners.delete(fn),
    }))
    try {
      const element = root()
      const host = createDesignerSettingsHost({ root: element })
      host.apply({ 'general.theme': 'system' })
      expect(element.getAttribute('data-theme')).toBe('light')
      dark = true
      for (const fn of listeners)
        fn()
      expect(element.getAttribute('data-theme')).toBe('dark')
      host.apply({ 'general.theme': 'light' })
      expect(listeners.size).toBe(0)
    }
    finally {
      vi.unstubAllGlobals()
    }
  })

  it('主题色内置：预设直接写 data-brand；别的颜色在根所在文档里注册成本设计器的品牌（一份 [data-brand] 取值块），换走或 dispose 时撤销', () => {
    const element = root()
    const blocks = (): HTMLStyleElement[] => [...document.head.querySelectorAll<HTMLStyleElement>('style[data-xh-brand^="xh-designer-brand-"]')]
    const host = createDesignerSettingsHost({ root: element })
    host.apply({ 'general.brand': 'teal' })
    expect([element.getAttribute('data-brand'), blocks().length]).toEqual(['teal', 0])
    host.apply({ 'general.brand': '#ff0000' })
    const id = element.getAttribute('data-brand')!
    expect(id).toMatch(/^xh-designer-brand-\d+$/)
    expect(blocks().map(block => block.getAttribute('data-xh-brand'))).toEqual([id])
    expect(blocks()[0]!.textContent).toContain(`[data-brand='${id}']`)
    host.apply({ 'general.brand': '#ff0000', 'general.theme': 'dark' })
    expect(blocks()).toHaveLength(1)
    host.apply({})
    expect([element.hasAttribute('data-brand'), blocks().length]).toEqual([false, 0])
    host.apply({ 'general.brand': '#00ff00' })
    host.dispose()
    expect([element.hasAttribute('data-brand'), blocks().length]).toEqual([false, 0])
  })

  it('主题跟随页面又选了主题色：根上照抄外层的 data-theme（外层没写是 light），外层改了跟着改，去掉主题色后还原', async () => {
    const page = document.createElement('div')
    document.body.append(page)
    const element = document.createElement('div')
    page.append(element)
    const host = createDesignerSettingsHost({ root: element })
    host.apply({})
    expect(element.hasAttribute('data-theme')).toBe(false)
    host.apply({ 'general.brand': 'green' })
    expect([element.getAttribute('data-theme'), element.getAttribute('data-brand')]).toEqual(['light', 'green'])
    page.setAttribute('data-theme', 'dark')
    await Promise.resolve()
    expect(element.getAttribute('data-theme')).toBe('dark')
    host.apply({ 'general.brand': 'green', 'general.theme': 'light' })
    expect(element.getAttribute('data-theme')).toBe('light')
    host.apply({})
    page.setAttribute('data-theme', 'light')
    await Promise.resolve()
    expect([element.hasAttribute('data-theme'), element.hasAttribute('data-brand')]).toEqual([false, false])
  })

  it('根上新写了主题时照抄外层的 data-contrast，外层改了跟着改；根上原本写了的保留，dispose 还原', async () => {
    document.documentElement.setAttribute('data-contrast', 'more')
    try {
      const element = root()
      const host = createDesignerSettingsHost({ root: element })
      host.apply({ 'general.theme': 'dark' })
      expect(element.getAttribute('data-contrast')).toBe('more')
      document.documentElement.setAttribute('data-contrast', 'default')
      await Promise.resolve()
      expect(element.getAttribute('data-contrast')).toBe('default')
      host.apply({})
      expect(element.hasAttribute('data-contrast')).toBe(false)
      host.dispose()
      const own = root()
      own.setAttribute('data-contrast', 'more')
      const second = createDesignerSettingsHost({ root: own })
      second.apply({ 'general.theme': 'dark' })
      expect(own.getAttribute('data-contrast')).toBe('more')
      second.dispose()
      expect([own.getAttribute('data-contrast'), own.hasAttribute('data-theme')]).toEqual(['more', false])
    }
    finally {
      document.documentElement.removeAttribute('data-contrast')
    }
  })

  it('主题色写的不是颜色（取不出品牌梯度）时不生效，按跟随页面处理', () => {
    const element = root()
    const host = createDesignerSettingsHost({ root: element })
    host.apply({ 'general.brand': 'not-a-color' })
    expect([element.hasAttribute('data-brand'), document.head.querySelector('style[data-xh-brand^="xh-designer-brand-"]')]).toEqual([false, null])
  })

  it('条目写了 enabledWhen：按此刻生效的设置（含缺省值）求值，不满足时只读、说明照旧；满足了照常可改', async () => {
    const gated: DesignerSettingsSection = {
      id: 'flow',
      label: '画布',
      order: 100,
      items: [
        { path: ['grid'], label: '网格', control: { kind: 'boolean' }, default: false },
        { path: ['gridSize'], label: '格距', control: { kind: 'number' }, enabledWhen: { path: ['flow.grid'], equals: true }, meta: { description: '网格打开时才能改' } },
      ],
    }
    const element = await mount((el) => {
      el.sections = [gated]
    })
    const field = (): Element => row('flow.gridSize').querySelector('xh-field')!
    expect([field().hasAttribute('read-only'), row('flow.gridSize').textContent!.includes('网格打开时才能改')]).toEqual([true, true])
    element.settings = { 'flow.grid': true }
    await element.updateComplete
    expect(field().hasAttribute('read-only')).toBe(false)
  })

  it('对话框里用到的 xh-* 元素都随 defineDesignerShell 按需注册了（含主题色那一行的「跟随页面」钮）', async () => {
    const element = await mount(() => {})
    const tags = new Set([...element.querySelectorAll('*')].map(node => node.localName).filter(name => name.startsWith('xh-')))
    expect([tags.has('xh-toggle'), [...tags].filter(name => customElements.get(name) === undefined)]).toEqual([true, []])
  })

  it('主题色那一行：「跟随页面」开关钮在色板前，没写值时按下；选了色以后按它删掉这个键、回到跟随页面', async () => {
    const element = await mount((el) => {
      el.settings = { 'general.brand': 'teal' }
    })
    const changes: unknown[] = []
    element.addEventListener('settings-change', event => changes.push((event as DesignerSettingsEventMap['settings-change']).detail.value))
    const follow = row('general.brand').querySelector<HTMLElement & { pressed?: boolean }>('xh-toggle')!
    expect([follow.textContent, follow.pressed]).toEqual([english.brandFollow, false])
    emit(follow, 'pressed-change', { pressed: true })
    expect([changes, element.settings]).toEqual([[undefined], {}])
    await element.updateComplete
    expect(follow.pressed).toBe(true)
    emit(follow, 'pressed-change', { pressed: false })
    expect([changes.length, follow.pressed]).toEqual([1, true])
  })

  it('存储：标了 secret 的条目不存；读出的不是对象时回调出错出口并给空对象', () => {
    const onStorageError = vi.fn()
    const host = createDesignerSettingsHost({ root: root(), storageKey: 'designer', onStorageError })
    host.save({ 'flow.grid': false, 'flow.token': 'abc' }, [flowSection])
    expect(JSON.parse(localStorage.getItem('designer')!)).toEqual({ 'flow.grid': false })
    expect(host.load()).toEqual({ 'flow.grid': false })
    localStorage.setItem('designer', '[1]')
    expect(host.load()).toEqual({})
    localStorage.setItem('designer', '{')
    expect(host.load()).toEqual({})
    expect(onStorageError.mock.calls.map(([detail]) => detail.operation)).toEqual(['read', 'read'])
  })

  it('不给存储键时不读写；给了存储键却没给出错出口时抛 TypeError', () => {
    const host = createDesignerSettingsHost({ root: root() })
    host.save({ a: 1 })
    expect([host.load(), localStorage.length]).toEqual([{}, 0])
    expect(() => createDesignerSettingsHost({ root: root(), storageKey: 'x' } as never)).toThrow(TypeError)
  })
})

describe('<xh-designer-settings> 的「布局」页', () => {
  type SwitchHost = HTMLElement & { checked?: boolean, disabled?: boolean }
  type SelectHost = HTMLElement & { value?: unknown, disabled?: boolean }
  let frame: XhDesignerFrameElement
  let seen: { layout: ResolvedDesignerLayout, reason: DesignerLayoutChangeReason }[]

  async function mountWithFrame(setup: (element: XhDesignerSettingsElement) => void = () => {}): Promise<XhDesignerSettingsElement> {
    frame = document.createElement('xh-designer-frame')
    frame.regions = [
      { name: 'toolbar', position: 'top' },
      { name: 'palette', position: 'start', title: '物料' },
      { name: 'canvas', position: 'center' },
      { name: 'properties', position: 'end', title: '属性' },
      { name: 'issues', position: 'bottom', title: '问题', minimizable: false },
      { name: 'minimap', position: 'overlay', title: '小地图' },
    ]
    seen = []
    frame.addEventListener('layout-change', event => seen.push((event as DesignerFrameEventMap['layout-change']).detail))
    document.body.append(frame)
    await frame.updateComplete
    return mount((element) => {
      element.frame = frame
      setup(element)
    })
  }

  function panelRow(name: string): HTMLElement {
    return document.querySelector<HTMLElement>(`[data-part="panel-row"][data-panel="${name}"]`)!
  }

  function control<T extends HTMLElement>(name: string, part: string): T {
    return panelRow(name).querySelector<T>(`[data-part="${part}"]`)!
  }

  async function refresh(element: XhDesignerSettingsElement): Promise<void> {
    element.settings = { 'layout.panels': frame.resolvedLayout as never }
    await element.updateComplete
  }

  it('给了 frame 才有「布局」页，排在「基础」后面；面板表按三栏的先后列出面板，画布浮动件排在最后、只有显示开关', async () => {
    await mount(() => {})
    expect(triggers()).toEqual([english.general, english.language, english.toolbar])
    document.body.innerHTML = ''
    await mountWithFrame(element => element.sections = [flowSection])
    expect(triggers()).toEqual([english.general, english.language, english.layout, english.toolbar, '流程'])
    expect(row('layout.panels').textContent).toContain(english.layoutPanelsHint)
    const table = document.querySelector<HTMLElement>('[data-part="panel-table"]')!
    expect([table.getAttribute('role'), table.getAttribute('aria-label')]).toEqual(['table', english.layoutPanels])
    expect(Array.from(table.querySelectorAll('[role="columnheader"]'), node => node.textContent)).toEqual(Object.values(english.layoutColumns))
    expect(Array.from(table.querySelectorAll('[data-part="panel-row"][data-panel]'), node => node.getAttribute('data-panel'))).toEqual(['palette', 'properties', 'issues', 'minimap'])
    expect(control('palette', 'panel-visible').getAttribute('aria-label')).toBe(english.layoutVisible('物料'))
    expect(control<SelectHost>('properties', 'panel-dock').value).toEqual(['end'])
    expect([control('minimap', 'panel-dock').hidden, control('minimap', 'panel-overlay').hidden, control('minimap', 'panel-overlay').textContent]).toEqual([true, false, english.layoutDocks.overlay])
    expect([control('minimap', 'panel-move-up').hidden, control('minimap', 'panel-minimized').hidden]).toEqual([true, true])
    expect(control<SwitchHost>('issues', 'panel-minimized').disabled).toBe(true)
  })

  it('显示开关、位置、上下移与收起改的是外框的布局：外框派发 layout-change，表跟着变', async () => {
    const element = await mountWithFrame()
    emit(control('palette', 'panel-visible'), 'checked-change', { checked: false })
    expect(seen.map(change => [change.reason, change.layout.hidden])).toEqual([['toggle', ['palette']]])
    expect(control<SwitchHost>('palette', 'panel-visible').checked).toBe(false)

    emit(control('properties', 'panel-dock'), 'value-change', { value: ['start'] })
    expect(seen.at(-1)!.reason).toBe('move')
    expect(seen.at(-1)!.layout.docks.start).toEqual(['palette', 'properties'])
    await refresh(element)
    expect(Array.from(document.querySelectorAll('[data-part="panel-row"][data-panel]'), node => node.getAttribute('data-panel'))).toEqual(['palette', 'properties', 'issues', 'minimap'])
    expect([control<SwitchHost>('palette', 'panel-move-up').disabled, control<SwitchHost>('properties', 'panel-move-down').disabled]).toEqual([true, true])

    control('properties', 'panel-move-up').querySelector('button')!.click()
    expect(seen.at(-1)!.layout.docks.start).toEqual(['properties', 'palette'])
    expect(Array.from(document.querySelectorAll('[data-part="panel-row"][data-panel]'), node => node.getAttribute('data-panel')).slice(0, 2)).toEqual(['properties', 'palette'])

    emit(control('properties', 'panel-minimized'), 'checked-change', { checked: true })
    expect([seen.at(-1)!.reason, seen.at(-1)!.layout.minimized]).toEqual(['minimize', ['properties']])

    emit(control('palette', 'panel-dock'), 'value-change', { value: ['float'] })
    expect([seen.at(-1)!.reason, Object.keys(seen.at(-1)!.layout.floating)]).toEqual(['float', ['palette']])
    expect(control<SelectHost>('palette', 'panel-dock').value).toEqual(['float'])
    expect(control<SwitchHost>('palette', 'panel-move-up').disabled).toBe(true)
    emit(control('palette', 'panel-dock'), 'value-change', { value: ['start'] })
    expect([seen.at(-1)!.reason, seen.at(-1)!.layout.floating]).toEqual(['dock', {}])
  })

  it('「恢复默认布局」回到宿主的缺省布局；这一页不写设置，设置由设计器从 layout-change 写', async () => {
    const element = await mountWithFrame()
    frame.defaultLayout = { version: 1, hidden: ['issues'] }
    frame.layout = { version: 1, docks: { start: ['palette', 'properties'] } }
    await frame.updateComplete
    await refresh(element)
    const changes: unknown[] = []
    element.addEventListener('settings-change', event => changes.push(event))
    seen = []
    const reset = document.querySelector<HTMLElement>('[data-part="layout-reset"]')!
    expect(reset.textContent).toBe(english.layoutReset)
    reset.querySelector('button')!.click()
    expect(seen.map(change => [change.reason, change.layout.hidden, change.layout.docks.end])).toEqual([['reset', ['issues'], ['properties']]])
    expect(changes).toEqual([])
  })

  it('宿主管控：layout.panels 锁定时表只读、说明换成锁定文案；藏掉时没有这一页；锁定一块面板只锁那一行', async () => {
    const element = await mountWithFrame(el => el.policy = { 'layout.panels': 'locked' })
    frame.layoutPolicy = { locked: true }
    await frame.updateComplete
    await refresh(element)
    expect(row('layout.panels').textContent).toContain(english.locked)
    expect([control<SwitchHost>('palette', 'panel-visible').disabled, control<SelectHost>('palette', 'panel-dock').disabled, (document.querySelector('[data-part="layout-reset"]') as SwitchHost).disabled]).toEqual([true, true, true])
    emit(control('palette', 'panel-visible'), 'checked-change', { checked: false })
    expect(seen).toEqual([])

    element.policy = { 'layout.panels': 'hidden' }
    await element.updateComplete
    expect(triggers()).toEqual([english.general, english.language, english.toolbar])

    element.policy = {}
    frame.layoutPolicy = { panels: { palette: 'locked' } }
    await frame.updateComplete
    await refresh(element)
    expect([control<SwitchHost>('palette', 'panel-visible').disabled, control<SwitchHost>('properties', 'panel-visible').disabled]).toEqual([true, false])
  })
})

describe('<xh-designer-settings> 的「工具栏」页', () => {
  type CheckboxHost = HTMLElement & { checked?: boolean | 'indeterminate', disabled?: boolean }
  const commands = new Map([
    ['undo', { id: 'undo', label: () => 'Undo', shortcut: ['Mod', 'Z'], run: () => {} }],
    ['redo', { id: 'redo', label: 'Redo', run: () => {} }],
    ['delete', { id: 'delete', label: 'Delete', run: () => {} }],
    ['zoom-in', { id: 'zoom-in', label: 'Zoom in', run: () => {} }],
  ])
  const source = toolbarSettingsSource([['undo', 'redo'], ['delete', 'zoom-in', 'missing']], commands, {})

  function groupsShown(): string[][] {
    return Array.from(document.querySelectorAll('[data-toolbar-group]'), group => Array.from(group.querySelectorAll('[data-toolbar-command]'), command => command.getAttribute('data-toolbar-command')!))
  }

  function commandToggle(id: string): CheckboxHost {
    return document.querySelector<CheckboxHost>(`[data-toolbar-command="${id}"] [data-part="toolbar-command-toggle"]`)!
  }

  function groupToggle(index: number): CheckboxHost {
    return document.querySelectorAll<CheckboxHost>('[data-part="toolbar-group-toggle"]')[index]!
  }

  it('toolbarSettingsSource 取命令的短文字、图标与快捷键，命令表里没有的跳过', () => {
    expect(source.commands.map(command => [command.id, command.label, command.shortcut])).toEqual([['undo', 'Undo', ['Mod', 'Z']], ['redo', 'Redo', undefined], ['delete', 'Delete', undefined], ['zoom-in', 'Zoom in', undefined]])
  })

  it('名字取命令的短文字：撤销这类文字随下一步变的命令写固定的短名，每编辑一步重算交来的数据不变，表不重铺', async () => {
    const dynamic = new Map<string, DesignerCommand<{ step: string }>>([
      ['undo', { id: 'undo', label: context => `Undo: ${context.step}`, shortLabel: 'Undo', shortcut: ['Mod', 'Z'], run: () => {} }],
      ['delete', { id: 'delete', label: 'Delete', run: () => {} }],
    ])
    const first = toolbarSettingsSource([['undo', 'delete']], dynamic, { step: 'move node' })
    const second = toolbarSettingsSource([['undo', 'delete']], dynamic, { step: 'rename' })
    expect(first.commands.map(command => command.label)).toEqual(['Undo', 'Delete'])
    expect(second).toEqual(first)
    const element = await mount(el => el.toolbar = first)
    const node = document.querySelector('[data-toolbar-command="undo"]')
    element.toolbar = second
    await element.updateComplete
    expect(document.querySelector('[data-toolbar-command="undo"]')).toBe(node)
    expect(commandToggle('undo').textContent).toBe('Undo')
  })

  it('给了 toolbar 才有按钮表：一组一块，组头写第几组，命令一行带名字与快捷键，按设置里的定制排', async () => {
    const element = await mount(el => el.toolbar = source)
    expect(groupsShown()).toEqual([['undo', 'redo'], ['delete', 'zoom-in']])
    expect(Array.from(document.querySelectorAll('[data-part="toolbar-group-toggle"]'), node => node.textContent)).toEqual([english.toolbarGroup(1), english.toolbarGroup(2)])
    const undo = document.querySelector('[data-toolbar-command="undo"]')!
    expect(undo.querySelector('[data-part="toolbar-command-toggle"]')!.textContent).toBe('Undo')
    expect(undo.querySelector('[data-part="toolbar-command-shortcut"]')!.textContent).not.toBe('')
    expect((document.querySelector('[data-part="toolbar-layout-reset"]') as CheckboxHost).disabled).toBe(true)
    element.settings = { 'toolbar.layout': { groups: [['zoom-in', 'undo'], ['redo', 'delete']], hidden: ['redo'] } }
    await element.updateComplete
    expect(groupsShown()).toEqual([['zoom-in', 'undo'], ['redo', 'delete']])
    expect([commandToggle('redo').checked, commandToggle('delete').checked, groupToggle(1).checked]).toEqual([false, true, 'indeterminate'])
  })

  it('勾掉一条写进 toolbar.layout 的 hidden；组头勾选框一次勾上或勾掉整组；「恢复默认」删掉这个键', async () => {
    const element = await mount(el => el.toolbar = source)
    const changes: { key: string, value: JsonValue | undefined }[] = []
    element.addEventListener('settings-change', event => changes.push((event as DesignerSettingsEventMap['settings-change']).detail))
    emit(commandToggle('redo'), 'checked-change', { checked: false })
    expect(changes.at(-1)).toEqual({ key: 'toolbar.layout', value: { groups: [['undo', 'redo'], ['delete', 'zoom-in']], hidden: ['redo'] }, settings: expect.anything() })
    expect(groupToggle(0).checked).toBe('indeterminate')
    await element.updateComplete
    emit(groupToggle(1), 'checked-change', { checked: false })
    expect(changes.at(-1)!.value).toEqual({ groups: [['undo', 'redo'], ['delete', 'zoom-in']], hidden: ['redo', 'delete', 'zoom-in'] })
    emit(groupToggle(0), 'checked-change', { checked: true })
    expect(changes.at(-1)!.value).toEqual({ groups: [['undo', 'redo'], ['delete', 'zoom-in']], hidden: ['delete', 'zoom-in'] })
    await element.updateComplete
    document.querySelector('[data-part="toolbar-layout-reset"] button')!.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(changes.at(-1)).toMatchObject({ key: 'toolbar.layout', value: undefined })
    await element.updateComplete
    expect([commandToggle('delete').checked, groupToggle(1).checked]).toEqual([true, true])
  })

  it('同一组里排序、跨组挪：按 sort 与 transfer 挪节点、写回 ids，整份写进 toolbar.layout', async () => {
    const element = await mount(el => el.toolbar = source)
    const changes: { value: JsonValue | undefined }[] = []
    element.addEventListener('settings-change', event => changes.push((event as DesignerSettingsEventMap['settings-change']).detail))
    const lists = document.querySelectorAll<HTMLElement & { ids?: string[] }>('[data-toolbar-group] xh-sortable')
    lists[0]!.dispatchEvent(new CustomEvent('sort', { detail: { from: 0, to: 1, id: 'undo', ids: ['redo', 'undo'] }, bubbles: true }))
    expect(groupsShown()).toEqual([['redo', 'undo'], ['delete', 'zoom-in']])
    expect(lists[0]!.ids).toEqual(['redo', 'undo'])
    expect(changes.at(-1)!.value).toEqual({ groups: [['redo', 'undo'], ['delete', 'zoom-in']] })
    const from = lists[0]!.getAttribute('list-id')!
    const to = lists[1]!.getAttribute('list-id')!
    lists[0]!.dispatchEvent(new CustomEvent('transfer', { detail: { id: 'undo', fromList: from, toList: to, from: 1, to: 0, fromIds: ['redo'], toIds: ['undo', 'delete', 'zoom-in'] }, bubbles: true }))
    expect(groupsShown()).toEqual([['redo'], ['undo', 'delete', 'zoom-in']])
    expect(changes.at(-1)!.value).toEqual({ groups: [['redo'], ['undo', 'delete', 'zoom-in']] })
    const outer = document.querySelector<HTMLElement & { ids?: string[] }>('[data-part="toolbar-layout"] > xh-sortable')!
    outer.dispatchEvent(new CustomEvent('sort', { detail: { from: 0, to: 1, id: outer.ids![0], ids: [outer.ids![1]!, outer.ids![0]!] }, bubbles: true }))
    expect(changes.at(-1)!.value).toEqual({ groups: [['undo', 'delete', 'zoom-in'], ['redo']] })
    // 自己写出去的值回来时不重铺
    const node = document.querySelector('[data-toolbar-command="undo"]')
    element.settings = { 'toolbar.layout': changes.at(-1)!.value! }
    await element.updateComplete
    expect(document.querySelector('[data-toolbar-command="undo"]')).toBe(node)
  })

  it('宿主管控：toolbar.layout 锁定时只读、说明换成锁定文案，藏掉时没有这张表；toolbar 为 false 时没有这一页', async () => {
    const element = await mount((el) => {
      el.toolbar = source
      el.policy = { 'toolbar.layout': 'locked' }
    })
    expect(row('toolbar.layout').textContent).toContain(english.locked)
    expect([commandToggle('undo').disabled, groupToggle(0).disabled]).toEqual([true, true])
    const changes: unknown[] = []
    element.addEventListener('settings-change', event => changes.push(event))
    emit(commandToggle('undo'), 'checked-change', { checked: false })
    expect(changes).toEqual([])
    element.policy = { 'toolbar.layout': 'hidden' }
    await element.updateComplete
    expect([row('toolbar.layout'), row('toolbar.display') !== null]).toEqual([null, true])
    element.toolbar = false
    await element.updateComplete
    expect(triggers()).toEqual([english.general, english.language])
  })
})

describe('帮助、快捷键与关于', () => {
  const commands = new Map([
    ['undo', { id: 'undo', label: 'Undo', shortcut: ['Mod', 'Z'], run: () => {} }],
    ['redo', { id: 'redo', label: 'Redo', shortcut: ['Mod', 'Shift', 'Z'], alternateShortcuts: [['Ctrl', 'Y']], run: () => {} }],
    ['auto-layout', { id: 'auto-layout', label: () => 'Auto layout', shortcut: ['Mod', 'L'], run: () => {} }],
    ['panels-toggle-all', { id: 'panels-toggle-all', label: 'Show or hide all panels', shortcut: ['Mod', 'B'], run: () => {} }],
    ['acme.run', { id: 'acme.run', label: 'Run', shortcut: ['Mod', 'R'], run: () => {} }],
    ['zoom-to-fit', { id: 'zoom-to-fit', label: 'Fit', run: () => {} }],
  ])

  it('shortcutSettingsSource：有快捷键的命令一行，内置归通用、共有的编辑命令归编辑、扩展的归扩展、其余归本设计器，本设计器末尾接各款给的按键', () => {
    const source = shortcutSettingsSource(commands, {}, { extensionCommands: ['acme.run'], keys: [{ label: 'Delete', keys: [['Backspace']] }] })
    expect(source.groups.map(group => [group.id, group.rows.map(row => row.label)])).toEqual([
      ['common', ['Show or hide all panels']],
      ['edit', ['Undo', 'Redo']],
      ['designer', ['Auto layout', 'Delete']],
      ['extensions', ['Run']],
    ])
    expect(source.groups[1]!.rows[1]!.keys).toEqual([['Mod', 'Shift', 'Z'], ['Ctrl', 'Y']])
  })

  it('快捷键页的名字也取短文字：撤销的文字随下一步变时，重算交来的数据不变，整页不重铺', async () => {
    const dynamic = new Map<string, DesignerCommand<{ step: string }>>([
      ['undo', { id: 'undo', label: context => `Undo: ${context.step}`, shortLabel: 'Undo', shortcut: ['Mod', 'Z'], run: () => {} }],
    ])
    const first = shortcutSettingsSource(dynamic, { step: 'move node' })
    const second = shortcutSettingsSource(dynamic, { step: 'rename' })
    expect(first.groups.flatMap(group => group.rows.map(row => row.label))).toEqual(['Undo'])
    expect(second).toEqual(first)
    const element = await mount(el => el.shortcuts = first)
    const table = row('shortcuts.table')
    element.shortcuts = second
    await element.updateComplete
    expect(row('shortcuts.table')).toBe(table)
  })

  it('commonKeys：各款换掉「通用」组末尾的那几行，可以去掉不适用的行、改写某一行的名字或另加一行；不给时照旧是 DESIGNER_COMMON_KEYS；内建以外的行不写名字时抛 TypeError', () => {
    const own = DESIGNER_COMMON_KEYS
      .filter(key => key.id !== 'pan')
      .map(key => key.id === 'nudgeLarge' ? { ...key, label: 'Resize the card by one cell' } : key)
    const source = shortcutSettingsSource(commands, {}, { commonKeys: [...own, { id: 'zoom', keys: [['Ctrl', 'Wheel']], label: 'Zoom at the pointer' }] })
    const rows = (shortcuts: DesignerSettingsSection): readonly { label: string, keys: readonly (readonly string[])[] }[] =>
      (shortcuts.items[0]!.control as Extract<DesignerDisplayControl, { kind: 'shortcutTable' }>).groups[0]!.rows
    expect(rows(designerShortcutSettings(english, source)).map(row => row.label)).toEqual([
      'Show or hide all panels',
      english.keyNudge,
      'Resize the card by one cell',
      english.keyMenubar,
      english.keySelectionToolbar,
      english.keyCancel,
      'Zoom at the pointer',
    ])
    expect(rows(designerShortcutSettings(english, source))[2]!.keys).toEqual(DESIGNER_COMMON_KEYS[1].keys)
    expect(DESIGNER_COMMON_KEYS.map(key => key.id)).toEqual(['nudge', 'nudgeLarge', 'pan', 'menubar', 'selectionToolbar', 'cancel'])
    expect(rows(designerShortcutSettings(english, source))[3]!.keys).toEqual([['F10']])
    expect('commonKeys' in shortcutSettingsSource(commands, {})).toBe(false)
    expect(rows(designerShortcutSettings(english, shortcutSettingsSource(commands, {}, { commonKeys: [] }))).map(row => row.label)).toEqual(['Show or hide all panels'])
    // @ts-expect-error 内建以外的行要写名字
    expect(() => shortcutSettingsSource(commands, {}, { commonKeys: [{ id: 'zoom', keys: [['Ctrl', 'Wheel']] }] })).toThrow(TypeError)
  })

  it('三页的分区：帮助是说明加几颗钮，快捷键的通用组补上四款都有的按键，关于写产品、版本、界面库版本、许可证与扩展的行；只显示的条目不进 resolveSettings', () => {
    const help = designerHelpSettings(english, { notes: ['一', '二'], actions: [{ command: 'start-tour', label: 'Start tour' }] })
    expect([help.id, help.order, help.items.map(item => [settingKey(help, item), item.control.kind])]).toEqual(['help', 900, [['help.guide', 'note'], ['help.startTour', 'action']]])
    expect(designerHelpSettings(english, {}).items).toEqual([])
    const shortcuts = designerShortcutSettings(english, shortcutSettingsSource(commands, {}))
    const table = shortcuts.items[0]!.control as Extract<DesignerDisplayControl, { kind: 'shortcutTable' }>
    expect([shortcuts.order, table.groups.map(group => group.label)]).toEqual([910, [english.shortcutsCommon, english.shortcutsEdit, english.shortcutsDesigner]])
    expect(table.groups[0]!.rows.map(row => row.label)).toEqual(['Show or hide all panels', english.keyNudge, english.keyNudgeLarge, english.keyPan, english.keyMenubar, english.keySelectionToolbar, english.keyCancel])
    expect(designerShortcutSettings(english, { groups: [] }).items[0]!.control).toMatchObject({ groups: [{ label: english.shortcutsCommon }] })
    const about = designerAboutSettings(english, { product: 'Flow', version: '1.0.0', license: 'MIT', rows: [{ label: 'Pro', value: '2.0.0' }] })
    expect([about.order, (about.items[0]!.control as Extract<DesignerDisplayControl, { kind: 'info' }>).rows]).toEqual([920, [
      { label: english.aboutProduct, value: 'Flow' },
      { label: english.aboutVersion, value: '1.0.0' },
      { label: english.aboutUi, value: DESIGNER_SHELL_VERSION },
      { label: english.aboutLicense, value: 'MIT' },
      { label: 'Pro', value: '2.0.0' },
    ]])
    expect(DESIGNER_SHELL_VERSION).toMatch(/^\d+\.\d+\.\d+/)
    expect(resolveSettings([help, shortcuts, about], {})).toEqual({})
    expect([isDesignerDisplayControl({ kind: 'note' }), isDesignerDisplayControl({ kind: 'boolean' })]).toEqual([true, false])
    for (const id of ['help', 'shortcuts', 'about'])
      expect(() => collectSettingsSections([{ id: 'x', settings: [{ id, label: id, items: [] }] }])).toThrow(/@xihan-ui\/designer-shell/)
  })

  it('对话框：给了 help、shortcuts、about 才有三页，排在最后；说明按段铺，钮点了派发 settings-command，快捷键铺成 xh-kbd，关于两列', async () => {
    const element = await mount((el) => {
      el.sections = [flowSection]
      el.help = { notes: ['Drag nodes.', 'Connect ports.'], actions: [{ command: 'start-tour', label: 'Start tour' }] }
      el.shortcuts = shortcutSettingsSource(commands, {})
      el.about = { product: 'Flow', version: '1.0.0', license: 'MIT' }
    })
    expect(triggers()).toEqual([english.general, english.language, english.toolbar, '流程', english.help, english.shortcuts, english.about])
    expect(Array.from(row('help.guide').querySelectorAll('[data-part="note-paragraph"]'), node => node.textContent)).toEqual(['Drag nodes.', 'Connect ports.'])
    expect(row('help.guide').querySelector('[data-part="display-label"]')!.textContent).toBe(english.helpGuide)
    const commandsRun: string[] = []
    element.addEventListener('settings-command', event => commandsRun.push((event as DesignerSettingsEventMap['settings-command']).detail.command))
    const action = row('help.startTour').querySelector<HTMLElement>('[data-part="action"]')!
    expect(action.textContent).toBe('Start tour')
    action.querySelector('button')!.click()
    expect(commandsRun).toEqual(['start-tour'])
    const kbds = row('shortcuts.table').querySelectorAll('xh-kbd')
    expect(kbds.length).toBeGreaterThan(5)
    expect(Array.from(row('shortcuts.table').querySelectorAll('[role="group"]'), node => node.getAttribute('aria-label'))).toEqual([english.shortcutsCommon, english.shortcutsEdit, english.shortcutsDesigner])
    expect(Array.from(row('about.rows').querySelectorAll('[data-part="info-label"]'), node => node.textContent)).toEqual([english.aboutProduct, english.aboutVersion, english.aboutUi, english.aboutLicense])
    element.policy = { help: 'locked', about: 'hidden' }
    await element.updateComplete
    const locked = row('help.startTour').querySelector<HTMLElement & { disabled?: boolean }>('[data-part="action"]')!
    expect(locked.disabled).toBe(true)
    locked.querySelector('button')!.click()
    expect(commandsRun).toEqual(['start-tour'])
    expect(triggers()).not.toContain(english.about)
  })
})
