// @vitest-environment jsdom

// 设置：模型（键、取值、分区合并与排序、宿主管控、内建「基础」分区）、设置对话框与宿主应用。
import type { JsonValue } from '@xihan-ui/core/json'
import type { DesignerSettingEditor, DesignerSettings, DesignerSettingsEventMap, DesignerSettingsSection, XhDesignerSettingsElement } from '../src'
import { DesignerExtensionError } from '@xihan-ui/designer-kit'
import { setXhConfig } from '@xihan-ui/web-components'
import { defineXhElement, XhConfigElement } from '@xihan-ui/web-components/define'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  collectSettingsSections,
  createDesignerSettingsHost,
  defineDesignerShell,
  DESIGNER_SETTING_KEYS,
  designerGeneralSettings,
  settingKey,
  settingPolicy,
  settingValue,
  sortSettingsSections,
} from '../src'
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

  it('合起各来源的分区：分区 id 重名或占用 general 时抛 DesignerExtensionError，名字空间是 settings-section', () => {
    expect(collectSettingsSections([{ id: 'flow', settings: [flowSection] }, { id: 'none' }]).map(section => section.id)).toEqual(['flow'])
    const duplicate = (): unknown => collectSettingsSections([{ id: 'a', settings: [flowSection] }, { id: 'b', settings: [flowSection] }])
    expect(duplicate).toThrow(DesignerExtensionError)
    expect(duplicate).toThrow(/settings-section/)
    expect(() => collectSettingsSections([{ id: 'x', settings: [{ id: 'general', label: 'G', items: [] }] }])).toThrow(/@xihan-ui\/designer-shell/)
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

  it('「基础」分区：主题与状态栏总有；主题色要给了预设或许自定义，语言要给了可选语言', () => {
    const keys = (section: DesignerSettingsSection): string[] => section.items.map(item => settingKey(section, item))
    expect(keys(designerGeneralSettings(english))).toEqual([DESIGNER_SETTING_KEYS.theme, DESIGNER_SETTING_KEYS.statusBar])
    const full = designerGeneralSettings(english, { brands: [{ value: 'blue', color: '#1677ff' }], customBrand: true, languages: [{ value: 'zh-CN', label: '简体中文' }] })
    expect(keys(full)).toEqual([DESIGNER_SETTING_KEYS.theme, DESIGNER_SETTING_KEYS.brand, DESIGNER_SETTING_KEYS.statusBar, DESIGNER_SETTING_KEYS.language])
    expect(full.items[1]!.control).toEqual({ kind: 'swatch', options: [{ value: 'blue', color: '#1677ff' }], custom: true })
    expect([full.id, full.order, full.items[0]!.default, full.items[2]!.default]).toEqual(['general', 0, 'follow', true])
  })
})

describe('<xh-designer-settings>', () => {
  it('左边一个分区一页，「基础」在前；条目按内建编辑方式铺成字段，说明取 meta.description', async () => {
    await mount((element) => {
      element.sections = [flowSection]
    })
    expect(triggers()).toEqual([english.general, '流程'])
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
    expect(triggers()).toEqual([english.general])
    expect(row('flow.grid')).toBeNull()
    expect(row('general.theme').querySelector('xh-field')!.hasAttribute('read-only')).toBe(true)
    expect(row('general.theme').textContent).toContain(english.locked)
    const changes: unknown[] = []
    element.addEventListener('settings-change', event => changes.push((event as DesignerSettingsEventMap['settings-change']).detail))
    emit(row('general.theme').querySelector('xh-toggle-group')!, 'value-change', { value: '3' })
    expect(changes).toEqual([])
  })

  it('general 为 false 时不要「基础」；没有可显示的分区时对话框只剩标题', async () => {
    await mount((el) => {
      el.general = false
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
    element.general = { brands: [{ value: 'blue', color: '#1677ff' }], customBrand: true }
    scope.append(element)
    await element.updateComplete
    const zh = designerShellZhCN.translations!['xh-designer-settings']!
    expect(element.querySelector('h2')!.textContent).toBe(zh.title)
    expect(triggers()).toEqual([zh.general])
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

  it('主题色：预设直接写 data-brand；别的颜色经 registerBrand 注册成本设计器的品牌，换走或 dispose 时撤销', () => {
    const element = root()
    const unregister = vi.fn()
    const registerBrand = vi.fn(() => unregister)
    const host = createDesignerSettingsHost({ root: element, brands: [{ value: 'blue', color: '#1677ff' }], registerBrand })
    host.apply({ 'general.brand': 'blue' })
    expect([element.getAttribute('data-brand'), registerBrand.mock.calls.length]).toEqual(['blue', 0])
    host.apply({ 'general.brand': '#ff0000' })
    const id = element.getAttribute('data-brand')!
    expect(id).toMatch(/^xh-designer-brand-\d+$/)
    expect(registerBrand).toHaveBeenCalledWith(id, '#ff0000')
    host.apply({ 'general.brand': '#ff0000', 'general.theme': 'dark' })
    expect(registerBrand).toHaveBeenCalledTimes(1)
    host.apply({})
    expect([element.hasAttribute('data-brand'), unregister.mock.calls.length]).toEqual([false, 1])
    host.apply({ 'general.brand': '#00ff00' })
    host.dispose()
    expect([element.hasAttribute('data-brand'), unregister.mock.calls.length]).toEqual([false, 2])
  })

  it('没给 registerBrand 时不是预设的主题色不生效', () => {
    const element = root()
    const host = createDesignerSettingsHost({ root: element, brands: [{ value: 'blue', color: '#1677ff' }] })
    host.apply({ 'general.brand': '#ff0000' })
    expect(element.hasAttribute('data-brand')).toBe(false)
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
