/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// <xh-designer-settings>：设计器的设置对话框。库内 xh-dialog 里放竖排的 xh-tabs，左边一个分区一页，右边逐条列出条目：
// 内建编辑方式用 createPropertyField 铺，别的种类交给 editors 里按种类登记的编辑器。改一条就写进 settings 并派发
// settings-change；宿主隐藏的条目不显示，锁定的只读、说明换成「由所在系统管理」。

import type { JsonValue } from '@xihan-ui/core/json'
import type { PropertyEditor, PropertyEditorContext, PropertyEditorInstance } from '@xihan-ui/designer-kit/properties'
import type { PropertyValues } from '@xihan-ui/web-components/authoring'
import type { PropertyField } from '../properties/field'
import type { FieldRow } from '../properties/field-row'
import type { DesignerSettingsTranslations } from '../translations'
import type { DesignerGeneralSettingsOptions, DesignerSettingItem, DesignerSettings, DesignerSettingsPolicy, DesignerSettingsSection } from './model'
import { createCounterIdGenerator } from '@xihan-ui/core'
import { BUILTIN_CONTROL_KINDS } from '@xihan-ui/designer-kit/properties'
import { BOOLEAN_CONVERTER, createAuthoredElement, createGeneratedElement, emitEvent, setText, XhConfigController, XhReactiveElement } from '@xihan-ui/web-components/authoring'
import { defineSettingsElements } from '../internal/ui-elements'
import { createPropertyField } from '../properties/field'
import { createFieldRow, placeAsGroup, refreshFieldRow } from '../properties/field-row'
import { designerGeneralSettings, settingKey, settingPolicy, settingValue, sortSettingsSections } from './model'

/** 设置对话框派发的事件。 */
export interface DesignerSettingsEventMap {
  /** 改了一条设置：settings 是改过之后的整份值，元素已经换成它。 */
  'settings-change': CustomEvent<{ key: string, value: JsonValue | undefined, settings: DesignerSettings }>
  /** 对话框要打开或关上（Esc、点遮罩、点关闭钮）：元素已经换成这个状态。 */
  'open-change': CustomEvent<{ open: boolean }>
}

/** 设置条目的自定义编辑器：被编辑的对象是整份设置。 */
export type DesignerSettingEditor = PropertyEditor<DesignerSettingItem, DesignerSettings>

const DEFAULT_TRANSLATIONS: DesignerSettingsTranslations = {
  title: 'Settings',
  sections: 'Settings sections',
  locked: 'Managed by the host application',
  general: 'General',
  theme: 'Theme',
  themeHint: 'Applies to this designer only, not the rest of the page.',
  themeFollow: 'Follow page',
  themeSystem: 'Follow system',
  themeLight: 'Light',
  themeDark: 'Dark',
  brand: 'Accent color',
  brandHint: 'The color of buttons, selection and highlights in this designer.',
  toolbarDisplay: 'Toolbar buttons',
  toolbarDisplayHint: 'How the buttons on the toolbar are shown.',
  toolbarDisplayIcon: 'Icons',
  toolbarDisplayText: 'Text',
  toolbarDisplayBoth: 'Icons and text',
  statusBar: 'Status bar',
  statusBarHint: 'Show the status bar at the bottom of the designer.',
  language: 'Language',
  languageHint: 'Leave empty to follow the page.',
}

const TAG = 'xh-designer-settings'
/** 设置对话框生成的结构都带这个 data-scope，样式只认它。 */
const SCOPE = 'designer-settings'
const STRING_CONVERTER = { fromAttribute: (value: string | null) => value ?? undefined }

interface Parts {
  readonly dialog: HTMLElement & { open?: boolean }
  readonly title: HTMLElement
  readonly tabs: HTMLElement & { value?: string }
  readonly list: HTMLElement
  readonly root: HTMLElement
}

/** 对话框里的一条：内建编辑方式是一行字段，自定义种类是一组控件的一行。 */
interface Row {
  readonly element: HTMLElement
  readonly update: (state: RowState) => void
  readonly destroy?: () => void
}

interface RowState {
  readonly value: JsonValue | undefined
  readonly label: string
  readonly hint: string | undefined
  readonly readonly: boolean
}

/** 一页：tab 触发钮与内容区。 */
interface Page {
  readonly trigger: HTMLElement
  readonly content: HTMLElement
}

export class XhDesignerSettingsElement extends XhReactiveElement {
  static override properties = {
    sections: { attribute: false },
    general: { attribute: false },
    settings: { attribute: false },
    policy: { attribute: false },
    editors: { attribute: false },
    open: { converter: BOOLEAN_CONVERTER },
    section: { converter: STRING_CONVERTER },
    translations: { attribute: false },
  }

  /** 各款与扩展的设置分区，按 order 排；没有可显示条目的分区不出现。 */
  declare sections: readonly DesignerSettingsSection[] | undefined
  /** 内建「基础」分区的选项（主题色与语言两项要给了才有）；false 不要这一页。文案随对话框的语言。 */
  declare general: DesignerGeneralSettingsOptions | false | undefined
  /** 设置的值，键是「分区 id.条目 id」；没写的键取条目的缺省值。 */
  declare settings: DesignerSettings | undefined
  /** 宿主的管控：键是条目键或分区 id，hidden 不显示，locked 只读。 */
  declare policy: DesignerSettingsPolicy | undefined
  /** 内建编辑方式之外的条目按 control.kind 用这里的编辑器。 */
  declare editors: Readonly<Record<string, DesignerSettingEditor>> | undefined
  /** 对话框打开。 */
  declare open?: boolean
  /** 当前显示的分区 id；不写或不在可显示的分区里时显示第一个。 */
  declare section: string | undefined
  /** 元素自己的文案，压在全局配置之上。 */
  declare translations: Partial<DesignerSettingsTranslations> | undefined

  /** 注册设置对话框用到的库内元素。 */
  static defineDependencies(): void {
    defineSettingsElements()
  }

  readonly #config = new XhConfigController(this)
  readonly #ids = createCounterIdGenerator('xh-designer-settings')
  #parts: Parts | undefined
  readonly #pages = new Map<string, Page>()
  readonly #rows = new Map<string, Row>()
  #pagesKey = ''

  constructor() {
    super()
    this.open = false
  }

  /** 打开对话框，给了分区 id 就显示那一页。 */
  show(section?: string): void {
    if (section !== undefined)
      this.section = section
    this.open = true
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    for (const row of this.#rows.values())
      row.destroy?.()
  }

  protected override update(changed: PropertyValues): void {
    super.update(changed)
    const parts = this.#ensureParts()
    const t = this.#config.translations<DesignerSettingsTranslations>(TAG, DEFAULT_TRANSLATIONS, this.translations)
    setText(parts.title, t.title)
    parts.list.setAttribute('aria-label', t.sections)
    const sections = this.#visibleSections(t)
    this.#syncPages(parts, sections)
    const active = sections.some(section => section.id === this.section) ? this.section! : sections[0]?.id
    if (active !== undefined && parts.tabs.value !== active)
      parts.tabs.value = active
    for (const section of sections) {
      for (const item of section.items) {
        const key = settingKey(section, item)
        const policy = settingPolicy(this.policy, section, item)
        if (policy === 'hidden')
          continue
        const description = item.meta?.description
        this.#rows.get(key)?.update({
          value: settingValue(this.settings, section, item),
          label: item.label ?? key,
          hint: policy === 'locked' ? t.locked : typeof description === 'string' ? description : undefined,
          readonly: policy === 'locked',
        })
      }
    }
    if (parts.dialog.open !== (this.open === true))
      parts.dialog.open = this.open === true
  }

  /** 「基础」与各分区排好序、去掉被隐藏的条目后还有条目的分区。 */
  #visibleSections(t: DesignerSettingsTranslations): DesignerSettingsSection[] {
    const own = this.general === false ? [] : [designerGeneralSettings(t, this.general)]
    return sortSettingsSections([...own, ...this.sections ?? []])
      .map(section => ({ ...section, items: section.items.filter(item => settingPolicy(this.policy, section, item) !== 'hidden') }))
      .filter(section => section.items.length > 0)
  }

  #ensureParts(): Parts {
    if (this.#parts?.dialog.parentElement === this)
      return this.#parts
    const doc = this.ownerDocument
    const title = createAuthoredElement(doc, 'h2', { 'data-xh-part': 'title' })
    const close = createAuthoredElement(doc, 'button', { 'data-xh-part': 'close-trigger', 'type': 'button' })
    const list = createAuthoredElement(doc, 'div', { 'data-xh-part': 'list' })
    const root = createAuthoredElement(doc, 'div', { 'data-xh-part': 'root' }, [list])
    const tabs: Parts['tabs'] = createAuthoredElement(doc, 'xh-tabs', { orientation: 'vertical', size: 'sm' }, [root])
    const dialog: Parts['dialog'] = createGeneratedElement(doc, 'xh-dialog', { size: 'lg' }, [
      createAuthoredElement(doc, 'div', { 'data-xh-part': 'backdrop' }),
      createAuthoredElement(doc, 'div', { 'data-xh-part': 'positioner' }, [
        createAuthoredElement(doc, 'div', { 'data-xh-part': 'content' }, [
          createAuthoredElement(doc, 'div', { 'data-xh-part': 'header' }, [title, close]),
          createAuthoredElement(doc, 'div', { 'data-xh-part': 'body' }, [
            createAuthoredElement(doc, 'div', { 'data-scope': SCOPE, 'data-part': 'pages' }, [tabs]),
          ]),
        ]),
      ]),
    ])
    // 页里的控件也派发这两个事件并冒泡上来，只认对话框与分区页自己的
    dialog.addEventListener('open-change', (event) => {
      if (event.target !== dialog)
        return
      event.stopPropagation()
      const { open } = (event as CustomEvent<{ open: boolean }>).detail
      if (open === (this.open === true))
        return
      this.open = open
      emitEvent(this, 'open-change', { open })
    })
    tabs.addEventListener('value-change', (event) => {
      if (event.target !== tabs)
        return
      event.stopPropagation()
      const { value } = (event as CustomEvent<{ value: string }>).detail
      tabs.value = value
      this.section = value
    })
    this.append(dialog)
    this.#parts = { dialog, title, tabs, list, root }
    return this.#parts
  }

  /** 分区或条目变了就重铺页与条目；只换值时只刷新。 */
  #syncPages(parts: Parts, sections: readonly DesignerSettingsSection[]): void {
    const key = JSON.stringify(sections.map(section => [section.id, section.label, section.items.map(item => [settingKey(section, item), item.control, item.required === true])]))
    if (key === this.#pagesKey) {
      for (const section of sections) {
        const page = this.#pages.get(section.id)
        if (page)
          setText(page.trigger, section.label)
      }
      return
    }
    this.#pagesKey = key
    for (const row of this.#rows.values())
      row.destroy?.()
    this.#rows.clear()
    this.#pages.clear()
    const doc = this.ownerDocument
    const triggers: HTMLElement[] = []
    const contents: HTMLElement[] = []
    for (const section of sections) {
      const trigger = createAuthoredElement(doc, 'button', { 'data-xh-part': 'trigger', 'type': 'button', 'value': section.id }, [section.label])
      const rows = section.items.map(item => this.#createRow(section, item))
      const content = createAuthoredElement(doc, 'div', { 'data-xh-part': 'content', 'value': section.id }, [
        createAuthoredElement(doc, 'div', { 'data-scope': SCOPE, 'data-part': 'items' }, rows.map(row => row.element)),
      ])
      triggers.push(trigger)
      contents.push(content)
      this.#pages.set(section.id, { trigger, content })
    }
    parts.list.replaceChildren(...triggers, createAuthoredElement(doc, 'div', { 'data-xh-part': 'indicator' }))
    parts.root.replaceChildren(parts.list, ...contents)
  }

  #createRow(section: DesignerSettingsSection, item: DesignerSettingItem): Row {
    const key = settingKey(section, item)
    const write = (value: JsonValue | undefined): void => this.#write(key, value)
    const label = item.label ?? key
    const row = (BUILTIN_CONTROL_KINDS as readonly string[]).includes(item.control.kind)
      ? this.#builtinRow(key, item, label, write)
      : this.#customRow(key, item, write)
    this.#rows.set(key, row)
    return row
  }

  #builtinRow(key: string, item: DesignerSettingItem, label: string, write: (value: JsonValue | undefined) => void): Row {
    const field: PropertyField = createPropertyField({
      ownerDocument: this.ownerDocument,
      control: item.control as Parameters<typeof createPropertyField>[0]['control'],
      label,
      required: item.required,
      setValue: write,
      commit: () => {},
    }, { value: undefined })
    field.element.setAttribute('data-setting', key)
    return { element: field.element, update: state => field.update(state) }
  }

  /** 自定义种类：用 editors 里登记的编辑器，按一组控件排；没登记时只显示值的 JSON。 */
  #customRow(key: string, item: DesignerSettingItem, write: (value: JsonValue | undefined) => void): Row {
    const doc = this.ownerDocument
    const row: FieldRow = createFieldRow(doc, this.#ids, { 'data-setting': key })
    const editor = this.editors?.[item.control.kind]
    let readonly = false
    let value: JsonValue | undefined
    const context = (): PropertyEditorContext<DesignerSettingItem, DesignerSettings> => ({
      value,
      descriptor: item,
      target: this.settings ?? {},
      readonly,
      setValue: (next) => {
        if (!readonly)
          write(next)
      },
      commit: () => {},
      issues: [],
    })
    const instance: PropertyEditorInstance<DesignerSettingItem, DesignerSettings> | undefined = editor?.(context())
    const body = instance?.element ?? createAuthoredElement(doc, 'span', { 'data-scope': SCOPE, 'data-part': 'unsupported' })
    placeAsGroup(row, body)
    return {
      element: row.element,
      update: (state) => {
        value = state.value
        readonly = state.readonly
        refreshFieldRow(row, { label: state.label, hint: state.hint, required: item.required === true, readonly })
        if (instance)
          instance.update?.(context())
        else
          setText(body, state.value === undefined ? '' : JSON.stringify(state.value))
      },
      destroy: instance?.destroy,
    }
  }

  /** 写一条设置：undefined 即删掉这个键（回到缺省值）。 */
  #write(key: string, value: JsonValue | undefined): void {
    const rest = Object.entries(this.settings ?? {}).filter(([name]) => name !== key)
    const next: DesignerSettings = Object.fromEntries(value === undefined ? rest : [...rest, [key, value]])
    this.settings = next
    emitEvent(this, 'settings-change', { key, value, settings: next })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'xh-designer-settings': XhDesignerSettingsElement
  }
}
