/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// <xh-designer-field-import>：导入字段对话框。库内 xh-dialog 里一排来源页签：内置的 JSON 样例与 JSON Schema 两页在前，
// 扩展登记的字段来源按 order 排在后面。当前页的内容经 designer-kit 的 field-inference 推断成字段树，铺成可勾选、可改
// 显示名、类型与内容的预览表；按「导入」派发 fields-import，字段已按勾选与替换 / 合并算好。对话框不改设计器的字段，
// 由设计器收到事件后自己换上。

import type { JsonPath, JsonTextErrorCode, JsonValue } from '@xihan-ui/core/json'
import type { DataField, DataFieldContent, DesignerFieldSource, DesignerFieldSourceContent, DesignerFieldSourcePage } from '@xihan-ui/designer-kit'
import type { FieldAnnotation, FieldInferenceOptions, FieldInferenceResult } from '@xihan-ui/designer-kit/field-inference'
import type { FilterValueType } from '@xihan-ui/viz'
import type { PropertyValues } from '@xihan-ui/web-components/authoring'
import type { DesignerFieldImportTranslations } from '../translations'
import { parseJsonText } from '@xihan-ui/core/json'
import { dataFieldsFromJsonSchema, inferDataFields, mergeDataFields } from '@xihan-ui/designer-kit/field-inference'
import { BOOLEAN_CONVERTER, createAuthoredElement, createGeneratedElement, emitEvent, setText, XhConfigController, XhReactiveElement } from '@xihan-ui/web-components/authoring'
import { defineFieldImportElements } from '../internal/ui-elements'
import { DESIGNER_FIELD_IMPORT_EN_US } from '../locale/en-US'

/** 用户按了「导入」：fields 已按勾选、显示名、类型、内容与替换 / 合并算好。 */
export interface DesignerFieldImportDetail {
  readonly fields: readonly DataField[]
  /** 现有字段为空时恒为 replace。 */
  readonly mode: 'replace' | 'merge'
  /** 内容来自哪一页：内置的 sample、json-schema，或字段来源的 id。 */
  readonly source: string
  /** 内容带样例、又勾了「同时作为示例数据」时是那份样例。 */
  readonly sample?: JsonValue
  /** 推断出的注解（说明、必填、候选值等），键是 formatJsonPath(字段路径)。 */
  readonly annotations: ReadonlyMap<string, FieldAnnotation>
}

/** 导入字段对话框派发的事件。 */
export interface DesignerFieldImportEventMap {
  /** 用户按了「导入」；对话框随即关上。 */
  'fields-import': CustomEvent<DesignerFieldImportDetail>
  /** 对话框要打开或关上（Esc、点遮罩、关闭钮、取消、导入）：元素已经换成这个状态。 */
  'open-change': CustomEvent<{ open: boolean }>
}

/** 内置两页的 id；扩展的字段来源不能用这两个 id。 */
export const DESIGNER_FIELD_IMPORT_SOURCES = {
  sample: 'sample',
  jsonSchema: 'json-schema',
} as const

const TAG = 'xh-designer-field-import'
/** 对话框生成的结构都带这个 data-scope，样式只认它。 */
const SCOPE = 'designer-field-import'
const STRING_CONVERTER = { fromAttribute: (value: string | null) => value ?? undefined }
/** 没写 order 的字段来源排在这里。 */
const DEFAULT_ORDER = 100
const VALUE_TYPES: readonly FilterValueType[] = ['string', 'number', 'boolean', 'date', 'datetime']

type DialogElement = HTMLElement & { open?: boolean }
type TabsElement = HTMLElement & { value?: string }
type TextFieldElement = HTMLElement & { value?: string, autoSize?: unknown }
type SelectElement = HTMLElement & { value?: string[], collection?: readonly { value: string, label?: string }[], disabled?: boolean }
type CheckboxElement = HTMLElement & { checked?: boolean | 'indeterminate', disabled?: boolean }
type ButtonElement = HTMLElement & { disabled?: boolean }
type RadioGroupElement = HTMLElement & { value?: string | null, collection?: readonly { value: string, label?: string }[] }
type UploadElement = HTMLElement & { clear?: () => void }

interface Parts {
  readonly dialog: DialogElement
  readonly title: HTMLElement
  readonly tabs: TabsElement
  readonly list: HTMLElement
  readonly root: HTMLElement
  readonly table: HTMLElement
  readonly headers: readonly HTMLElement[]
  readonly empty: HTMLElement
  readonly notes: HTMLElement
  readonly options: HTMLElement
  readonly mode: RadioGroupElement
  readonly sample: CheckboxElement
  readonly sampleText: HTMLElement
  readonly cancel: ButtonElement
  readonly cancelText: HTMLElement
  readonly submit: ButtonElement
  readonly submitText: HTMLElement
}

/** 页里出的错：解析失败、文件读不出，或字段来源自己给的话。文案按当时的语言现取。 */
type PageError
  = | { readonly kind: 'parse', readonly code: JsonTextErrorCode, readonly line: number, readonly column: number }
    | { readonly kind: 'read' }
    | { readonly kind: 'message', readonly text: string }

/** 预览表里一行的改动：勾没勾、显示名、类型与内容。 */
interface RowEdit {
  readonly include: boolean
  readonly label: string
  readonly type: FilterValueType
  readonly content: DataFieldContent
}

/** 一页的此刻：输入的文字、交来的内容、推断结果、出的错，以及用户在预览表里的改动（键是字段路径）。 */
interface PageState {
  text: string
  content: DesignerFieldSourceContent | undefined
  result: FieldInferenceResult | undefined
  error: PageError | undefined
  edits: Map<string, RowEdit>
}

/** 一页：页签触发钮与内容区；内置页带输入框，字段来源页切到时才建。 */
interface Page {
  readonly id: string
  readonly trigger: HTMLElement
  readonly content: HTMLElement
  readonly body: HTMLElement
  readonly error: HTMLElement
  readonly builtin: 'sample' | 'json-schema' | undefined
  readonly source: DesignerFieldSource | undefined
  readonly input: TextFieldElement | undefined
  readonly upload: UploadElement | undefined
  /** 读文件投放区里的文字。 */
  readonly readFile: HTMLElement | undefined
  readonly state: PageState
  mounted: { readonly controller: AbortController, readonly page: DesignerFieldSourcePage } | undefined
}

/** 字段树压平后的一行。 */
interface FlatField {
  readonly field: DataField
  readonly path: readonly string[]
  readonly key: string
  readonly depth: number
  readonly parent: string | undefined
}

interface PreviewRow {
  /** 这一行此刻对应的字段；内容换了、同一路径的字段变了时随之换上。 */
  item: FlatField
  readonly element: HTMLElement
  readonly include: CheckboxElement
  readonly name: HTMLElement
  readonly label: TextFieldElement
  readonly type: SelectElement
  readonly kind: HTMLElement
  readonly contentCell: HTMLElement
  readonly content: SelectElement
}

function emptyState(): PageState {
  return { text: '', content: undefined, result: undefined, error: undefined, edits: new Map() }
}

function pathKey(path: readonly string[]): string {
  return JSON.stringify(path)
}

/** 条目表变了才换上，不然每轮刷新都会重铺条目。 */
function setCollection(element: { collection?: readonly { value: string, label?: string }[] }, items: readonly { value: string, label: string }[]): void {
  if (JSON.stringify(element.collection ?? []) !== JSON.stringify(items))
    element.collection = items
}

function pathText(path: JsonPath): string {
  return path.map(String).join('.')
}

function flatten(fields: readonly DataField[], path: readonly string[] = [], parent?: string): FlatField[] {
  return fields.flatMap((field) => {
    const own = [...path, field.name]
    const key = pathKey(own)
    return [{ field, path: own, key, depth: path.length, parent }, ...flatten(field.children ?? [], own, key)]
  })
}

function defaultEdit(field: DataField): RowEdit {
  return { include: true, label: field.label ?? '', type: field.type ?? 'string', content: field.content ?? 'text' }
}

/** 按预览表的改动取出要导入的字段：没勾的连同下级去掉，值字段换上改过的类型与内容。 */
function pickFields(fields: readonly DataField[], edits: ReadonlyMap<string, RowEdit>, withContent: boolean, path: readonly string[] = []): DataField[] {
  return fields.flatMap((field): DataField[] => {
    const own = [...path, field.name]
    const edit = edits.get(pathKey(own)) ?? defaultEdit(field)
    if (!edit.include)
      return []
    const label = edit.label.trim()
    const base = { name: field.name, ...(label === '' ? {} : { label }) }
    if (field.kind === 'value') {
      const content = withContent ? edit.content : field.content ?? 'text'
      return [{ ...base, kind: 'value', type: edit.type, ...(content === 'text' ? {} : { content }) }]
    }
    const children = pickFields(field.children ?? [], edits, withContent, own)
    return [{ ...base, kind: field.kind, ...(field.type === undefined ? {} : { type: field.type }), ...(children.length > 0 ? { children } : {}) }]
  })
}

function inferContent(content: DesignerFieldSourceContent, options: FieldInferenceOptions): FieldInferenceResult {
  if (content.kind === 'sample')
    return inferDataFields(content.value, options)
  if (content.kind === 'json-schema') {
    return dataFieldsFromJsonSchema(content.value, {
      ...(options.rootName === undefined ? {} : { rootName: options.rootName }),
      ...(options.maxDepth === undefined ? {} : { maxDepth: options.maxDepth }),
    })
  }
  return { fields: content.fields, notes: [], annotations: new Map() }
}

function sampleOf(content: DesignerFieldSourceContent | undefined): JsonValue | undefined {
  return content?.kind === 'sample' ? content.value : content?.kind === 'fields' ? content.sample : undefined
}

export class XhDesignerFieldImportElement extends XhReactiveElement {
  static override properties = {
    sources: { attribute: false },
    fields: { attribute: false },
    contents: { attribute: false },
    inference: { attribute: false },
    offerSample: { converter: BOOLEAN_CONVERTER, attribute: 'offer-sample' },
    open: { converter: BOOLEAN_CONVERTER },
    source: { converter: STRING_CONVERTER },
    translations: { attribute: false },
  }

  /** 扩展登记的字段来源，按 order 排在内置两页之后。 */
  declare sources: readonly DesignerFieldSource[] | undefined
  /** 设计器现有的字段：不为空时出「合并 / 替换」，合并时预先标出种类不同的字段。 */
  declare fields: readonly DataField[] | undefined
  /** 给了才有「内容」列，值字段的内容种类只能在这几种里选。 */
  declare contents: readonly DataFieldContent[] | undefined
  /** 推断选项，交给 designer-kit 的 inferDataFields；JSON Schema 只用其中的 rootName 与 maxDepth。 */
  declare inference: FieldInferenceOptions | undefined
  /** 内容带样例时出「同时作为示例数据」，缺省勾上。 */
  declare offerSample?: boolean
  /** 对话框打开；每次打开都从空白开始。 */
  declare open?: boolean
  /** 当前显示的页：sample、json-schema 或字段来源的 id；不写或找不到时显示第一页。 */
  declare source: string | undefined
  /** 元素自己的文案，压在全局配置之上。 */
  declare translations: Partial<DesignerFieldImportTranslations> | undefined

  /** 注册导入对话框用到的库内元素。 */
  static defineDependencies(): void {
    defineFieldImportElements()
  }

  readonly #config = new XhConfigController(this)
  #parts: Parts | undefined
  #pages = new Map<string, Page>()
  #pagesKey = ''
  readonly #rows = new Map<string, PreviewRow>()
  /** 预览表此刻铺的是哪一页；换了页整表重铺。 */
  #rowsPage: string | undefined
  #wasOpen = false
  #mode: 'merge' | 'replace' = 'merge'
  #useSample = true

  constructor() {
    super()
    this.open = false
    this.offerSample = false
  }

  /** 打开对话框，给了页 id 就显示那一页。 */
  show(source?: string): void {
    if (source !== undefined)
      this.source = source
    this.open = true
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    for (const page of this.#pages.values())
      this.#unmount(page)
  }

  protected override update(changed: PropertyValues): void {
    super.update(changed)
    const parts = this.#ensureParts()
    const t = this.#config.translations<DesignerFieldImportTranslations>(TAG, DESIGNER_FIELD_IMPORT_EN_US, this.translations)
    const open = this.open === true
    if (open !== this.#wasOpen)
      this.#reset()
    const pages = this.#syncPages(parts)
    const active = pages.find(page => page.id === this.source) ?? pages[0]!
    if (parts.tabs.value !== active.id)
      parts.tabs.value = active.id
    for (const page of pages) {
      if (page !== active || !open)
        this.#unmount(page)
    }
    if (open)
      this.#mount(active)
    if (changed.has('inference')) {
      for (const page of pages)
        page.state.result = page.state.content === undefined ? undefined : inferContent(page.state.content, this.inference ?? {})
    }
    setText(parts.title, t.title)
    parts.list.setAttribute('aria-label', t.sources)
    for (const page of pages)
      this.#paintPage(page, t)
    this.#paintPreview(parts, active, t)
    this.#wasOpen = open
    if (parts.dialog.open !== open)
      parts.dialog.open = open
  }

  #ensureParts(): Parts {
    if (this.#parts?.dialog.parentElement === this)
      return this.#parts
    const doc = this.ownerDocument
    const part = (tag: string, name: string, children: (Node | string)[] = [], attributes: Record<string, string> = {}): HTMLElement =>
      createAuthoredElement(doc, tag, { 'data-scope': SCOPE, 'data-part': name, ...attributes }, children)
    const title = createAuthoredElement(doc, 'h2', { 'data-xh-part': 'title' })
    const close = createAuthoredElement(doc, 'button', { 'data-xh-part': 'close-trigger', 'type': 'button' })
    const list = createAuthoredElement(doc, 'div', { 'data-xh-part': 'list' })
    const root = createAuthoredElement(doc, 'div', { 'data-xh-part': 'root' }, [list])
    const tabs: TabsElement = createAuthoredElement(doc, 'xh-tabs', { size: 'sm' }, [root])
    const headers = (['name', 'label', 'type', 'content'] as const).map(column => part('div', 'column', [], { 'role': 'columnheader', 'data-column': column }))
    const head = part('div', 'row', headers, { 'role': 'row', 'data-head': '' })
    const table = part('div', 'preview', [head], { role: 'table' })
    const empty = part('div', 'empty')
    const notes = part('div', 'notes', [], { role: 'list' })
    const mode: RadioGroupElement = createAuthoredElement(doc, 'xh-radio-group', { 'size': 'sm', 'orientation': 'horizontal', 'data-scope': SCOPE, 'data-part': 'mode' })
    const sampleText = createAuthoredElement(doc, 'span', { 'data-xh-part': 'text' })
    const sample: CheckboxElement = createAuthoredElement(doc, 'xh-checkbox', { 'size': 'sm', 'data-scope': SCOPE, 'data-part': 'sample' }, [
      createAuthoredElement(doc, 'label', { 'data-xh-part': 'label' }, [
        createAuthoredElement(doc, 'button', { 'data-xh-part': 'root', 'type': 'button' }, [createAuthoredElement(doc, 'span', { 'data-xh-part': 'indicator' })]),
        sampleText,
      ]),
    ])
    const options = part('div', 'options', [mode, sample])
    const cancelText = createAuthoredElement(doc, 'span', {})
    const cancel: ButtonElement = createAuthoredElement(doc, 'xh-button', { 'variant': 'ghost', 'data-scope': SCOPE, 'data-part': 'cancel' }, [
      createAuthoredElement(doc, 'button', { 'data-xh-part': 'root', 'type': 'button' }, [cancelText]),
    ])
    const submitText = createAuthoredElement(doc, 'span', {})
    const submit: ButtonElement = createAuthoredElement(doc, 'xh-button', { 'variant': 'solid', 'data-scope': SCOPE, 'data-part': 'import' }, [
      createAuthoredElement(doc, 'button', { 'data-xh-part': 'root', 'type': 'button' }, [submitText]),
    ])
    const dialog: DialogElement = createGeneratedElement(doc, 'xh-dialog', { size: 'lg' }, [
      createAuthoredElement(doc, 'div', { 'data-xh-part': 'backdrop' }),
      createAuthoredElement(doc, 'div', { 'data-xh-part': 'positioner' }, [
        createAuthoredElement(doc, 'div', { 'data-xh-part': 'content' }, [
          createAuthoredElement(doc, 'div', { 'data-xh-part': 'header' }, [title, close]),
          createAuthoredElement(doc, 'div', { 'data-xh-part': 'body' }, [
            part('div', 'sources', [tabs]),
            table,
            empty,
            notes,
            options,
          ]),
          createAuthoredElement(doc, 'div', { 'data-xh-part': 'footer' }, [cancel, submit]),
        ]),
      ]),
    ])
    // 页里的控件也派发这几个事件并冒泡上来，只认对话框、页签与本对话框自己的控件
    dialog.addEventListener('open-change', (event) => {
      if (event.target !== dialog)
        return
      event.stopPropagation()
      const { open } = (event as CustomEvent<{ open: boolean }>).detail
      if (open !== (this.open === true))
        this.#setOpen(open)
    })
    tabs.addEventListener('value-change', (event) => {
      if (event.target !== tabs)
        return
      event.stopPropagation()
      const { value } = (event as CustomEvent<{ value: string }>).detail
      tabs.value = value
      this.source = value
    })
    mode.addEventListener('value-change', (event) => {
      event.stopPropagation()
      const { value } = (event as CustomEvent<{ value: string | null }>).detail
      this.#mode = value === 'replace' ? 'replace' : 'merge'
      mode.value = this.#mode
      this.requestUpdate()
    })
    sample.addEventListener('checked-change', (event) => {
      event.stopPropagation()
      this.#useSample = (event as CustomEvent<{ checked: boolean | 'indeterminate' }>).detail.checked === true
      sample.checked = this.#useSample
    })
    cancel.addEventListener('click', () => this.#setOpen(false))
    submit.addEventListener('click', () => this.#submit())
    this.append(dialog)
    this.#parts = { dialog, title, tabs, list, root, table, headers, empty, notes, options, mode, sample, sampleText, cancel, cancelText, submit, submitText }
    return this.#parts
  }

  #setOpen(open: boolean): void {
    if (!open)
      this.#reset()
    this.open = open
    emitEvent(this, 'open-change', { open })
  }

  /** 打开与关上时回到空白：清掉各页的文字、内容与改动，替换 / 合并与示例数据回到缺省。 */
  #reset(): void {
    for (const page of this.#pages.values()) {
      this.#unmount(page)
      Object.assign(page.state, emptyState())
      if (page.input)
        page.input.value = ''
    }
    this.#mode = 'merge'
    this.#useSample = true
  }

  /** 内置两页在前，字段来源按 order 排在后面；页的先后或字段来源换了就重铺页签，页名在 #paintPage 里写。 */
  #syncPages(parts: Parts): Page[] {
    const builtin = [DESIGNER_FIELD_IMPORT_SOURCES.sample, DESIGNER_FIELD_IMPORT_SOURCES.jsonSchema] as const
    for (const source of this.sources ?? []) {
      if ((builtin as readonly string[]).includes(source.id))
        throw new TypeError(`[xh] 字段来源 ${source.id} 与导入对话框内置的页重名`)
    }
    const extra = [...(this.sources ?? [])].sort((a, b) => (a.order ?? DEFAULT_ORDER) - (b.order ?? DEFAULT_ORDER))
    const wanted: { readonly id: string, readonly source: DesignerFieldSource | undefined }[] = [
      { id: builtin[0], source: undefined },
      { id: builtin[1], source: undefined },
      ...extra.map(source => ({ id: source.id, source })),
    ]
    const key = JSON.stringify(wanted.map(item => item.id))
    if (key !== this.#pagesKey || wanted.some(item => this.#pages.get(item.id)?.source !== item.source)) {
      this.#pagesKey = key
      const next = new Map<string, Page>()
      for (const item of wanted) {
        const previous = this.#pages.get(item.id)
        if (previous && previous.source === item.source) {
          next.set(item.id, previous)
          continue
        }
        if (previous)
          this.#unmount(previous)
        next.set(item.id, this.#createPage(item.id, item.source))
      }
      for (const [id, page] of this.#pages) {
        if (!next.has(id))
          this.#unmount(page)
      }
      this.#pages = next
      const pages = [...next.values()]
      parts.list.replaceChildren(...pages.map(page => page.trigger), createAuthoredElement(this.ownerDocument, 'div', { 'data-xh-part': 'indicator' }))
      parts.root.replaceChildren(parts.list, ...pages.map(page => page.content))
    }
    return [...this.#pages.values()]
  }

  #createPage(id: string, source: DesignerFieldSource | undefined): Page {
    const doc = this.ownerDocument
    const builtin = source === undefined ? id as 'sample' | 'json-schema' : undefined
    const trigger = createAuthoredElement(doc, 'button', { 'data-xh-part': 'trigger', 'type': 'button', 'value': id })
    const error = createAuthoredElement(doc, 'div', { 'data-scope': SCOPE, 'data-part': 'error', 'role': 'alert' })
    let input: TextFieldElement | undefined
    let upload: UploadElement | undefined
    let readFile: HTMLElement | undefined
    const children: HTMLElement[] = []
    if (builtin !== undefined) {
      input = createAuthoredElement(doc, 'xh-text-field', { 'size': 'sm', 'data-scope': SCOPE, 'data-part': 'input' }, [
        createAuthoredElement(doc, 'div', { 'data-xh-part': 'root' }, [
          createAuthoredElement(doc, 'div', { 'data-xh-part': 'control' }, [createAuthoredElement(doc, 'textarea', { 'data-xh-part': 'input', 'spellcheck': 'false' })]),
        ]),
      ])
      input.autoSize = { minRows: 6, maxRows: 12 }
      readFile = createAuthoredElement(doc, 'span', { slot: 'dropzone' })
      upload = createAuthoredElement(doc, 'xh-file-upload', { 'size': 'sm', 'accept': '.json,application/json', 'data-scope': SCOPE, 'data-part': 'file' }, [readFile])
      children.push(input, upload)
    }
    const body = createAuthoredElement(doc, 'div', { 'data-scope': SCOPE, 'data-part': 'source' }, children)
    const content = createAuthoredElement(doc, 'div', { 'data-xh-part': 'content', 'value': id }, [body, error])
    const page: Page = { id, trigger, content, body, error, builtin, source, input, upload, readFile, state: emptyState(), mounted: undefined }
    input?.addEventListener('value-change', (event) => {
      event.stopPropagation()
      const { value } = (event as CustomEvent<{ value: string }>).detail
      input.value = value
      this.#readText(page, value)
    })
    upload?.addEventListener('file-accept', (event) => {
      event.stopPropagation()
      const file = (event as CustomEvent<{ files: readonly File[] }>).detail.files[0]
      upload.clear?.()
      if (file !== undefined)
        void this.#readFile(page, file)
    })
    return page
  }

  /** 切到字段来源页时建一份，交给它中止信号与回交内容的两个函数。 */
  #mount(page: Page): void {
    if (page.source === undefined || page.mounted !== undefined)
      return
    const controller = new AbortController()
    const { signal } = controller
    const instance = page.source.create({
      document: this.ownerDocument,
      signal,
      provide: (content) => {
        if (signal.aborted)
          return
        this.#setContent(page, content, undefined)
      },
      fail: (message) => {
        if (signal.aborted)
          return
        this.#setContent(page, undefined, { kind: 'message', text: message })
      },
    })
    page.mounted = { controller, page: instance }
    page.body.replaceChildren(instance.element)
  }

  /** 切走字段来源页或对话框关上：中止、销毁，它交来的内容一并清掉。 */
  #unmount(page: Page): void {
    const mounted = page.mounted
    if (mounted === undefined)
      return
    page.mounted = undefined
    mounted.controller.abort()
    mounted.page.destroy?.()
    mounted.page.element.remove()
    Object.assign(page.state, emptyState())
  }

  #readText(page: Page, text: string): void {
    page.state.text = text
    if (text.trim() === '') {
      this.#setContent(page, undefined, undefined)
      return
    }
    const parsed = parseJsonText(text)
    if (!parsed.ok) {
      this.#setContent(page, undefined, { kind: 'parse', code: parsed.code, line: parsed.line, column: parsed.column })
      return
    }
    this.#setContent(page, page.builtin === 'json-schema' ? { kind: 'json-schema', value: parsed.value } : { kind: 'sample', value: parsed.value }, undefined)
  }

  async #readFile(page: Page, file: Blob): Promise<void> {
    let text: string
    try {
      text = await file.text()
    }
    catch {
      this.#setContent(page, undefined, { kind: 'read' })
      return
    }
    if (page.input)
      page.input.value = text
    this.#readText(page, text)
  }

  /** 换上一页的内容：推断出字段，用户已改过、路径仍在的行保留改动。 */
  #setContent(page: Page, content: DesignerFieldSourceContent | undefined, error: PageError | undefined): void {
    page.state.content = content
    page.state.error = error
    page.state.result = content === undefined ? undefined : inferContent(content, this.inference ?? {})
    this.requestUpdate()
  }

  #paintPage(page: Page, t: DesignerFieldImportTranslations): void {
    setText(page.trigger, page.builtin === 'sample' ? t.sample : page.builtin === 'json-schema' ? t.schema : page.source?.label ?? page.id)
    if (page.input)
      page.input.setAttribute('aria-label', page.builtin === 'json-schema' ? t.schemaInput : t.sampleInput)
    if (page.readFile)
      setText(page.readFile, t.readFile)
    const error = page.state.error
    setText(page.error, error === undefined
      ? ''
      : error.kind === 'parse'
        ? t.parseError(error.line, error.column, t.parseErrors[error.code])
        : error.kind === 'read' ? t.readFileFailed : error.text)
    page.error.hidden = error === undefined
  }

  #paintPreview(parts: Parts, page: Page, t: DesignerFieldImportTranslations): void {
    const result = page.state.result
    const withContent = (this.contents?.length ?? 0) > 0
    const flat = flatten(result?.fields ?? [])
    const columns: Record<string, string> = t.columns
    for (const header of parts.headers) {
      const column = header.getAttribute('data-column')!
      setText(header, columns[column]!)
      header.hidden = column === 'content' && !withContent
    }
    parts.table.setAttribute('aria-label', t.preview)
    parts.table.hidden = flat.length === 0
    setText(parts.empty, t.empty)
    parts.empty.hidden = flat.length > 0 || page.state.error !== undefined
    this.#renderRows(parts, page, flat, withContent, t)

    const picked = pickFields(result?.fields ?? [], page.state.edits, withContent)
    const existing = this.fields ?? []
    const merging = existing.length > 0 && this.#mode === 'merge'
    const conflicts = merging && picked.length > 0 ? mergeDataFields(existing, picked).conflicts : []
    const lines = [
      ...(result?.notes ?? []).map((note) => {
        const text = note.code === 'sample-limit' ? t.notes['sample-limit'](Number(note.params?.limit ?? 0)) : t.notes[note.code]
        return note.path.length === 0 ? text : t.noteAt(pathText(note.path), text)
      }),
      ...conflicts.map(conflict => t.conflict(pathText(conflict.path))),
    ]
    parts.notes.replaceChildren(...lines.map(line => createAuthoredElement(this.ownerDocument, 'div', { 'role': 'listitem', 'data-scope': SCOPE, 'data-part': 'note' }, [line])))
    parts.notes.hidden = lines.length === 0

    parts.mode.hidden = existing.length === 0
    parts.mode.setAttribute('aria-label', t.mode)
    setCollection(parts.mode, [{ value: 'merge', label: t.merge }, { value: 'replace', label: t.replace }])
    parts.mode.value = this.#mode
    const sample = sampleOf(page.state.content)
    parts.sample.hidden = this.offerSample !== true || sample === undefined
    setText(parts.sampleText, t.useSample)
    parts.sample.checked = this.#useSample
    parts.options.hidden = parts.mode.hidden && parts.sample.hidden
    setText(parts.cancelText, t.cancel)
    setText(parts.submitText, t.import)
    parts.submit.disabled = picked.length === 0
  }

  /** 按字段路径复用行：只改文字与状态，增删进出的那几行。 */
  #renderRows(parts: Parts, page: Page, flat: readonly FlatField[], withContent: boolean, t: DesignerFieldImportTranslations): void {
    if (this.#rowsPage !== page.id) {
      this.#rowsPage = page.id
      for (const row of this.#rows.values())
        row.element.remove()
      this.#rows.clear()
    }
    const edits = page.state.edits
    const editOf = (item: FlatField): RowEdit => edits.get(item.key) ?? defaultEdit(item.field)
    const included = new Map<string, boolean>()
    const wanted = new Set(flat.map(item => item.key))
    for (const [key, row] of this.#rows) {
      if (!wanted.has(key)) {
        row.element.remove()
        this.#rows.delete(key)
      }
    }
    let previous: Element = parts.table.firstElementChild!
    for (const item of flat) {
      const edit = editOf(item)
      const reachable = item.parent === undefined || included.get(item.parent) === true
      included.set(item.key, reachable && edit.include)
      let row = this.#rows.get(item.key)
      if (!row) {
        row = this.#createRow(page, item)
        this.#rows.set(item.key, row)
      }
      row.item = item
      const path = item.path.join('.')
      row.element.style.setProperty('--xh-_designer-field-depth', String(item.depth))
      setText(row.name, item.field.name)
      row.include.setAttribute('aria-label', t.include(path))
      row.include.checked = edit.include
      row.include.disabled = !reachable
      row.label.setAttribute('aria-label', t.labelOf(path))
      row.label.setAttribute('placeholder', item.field.name)
      if (row.label.value !== edit.label)
        row.label.value = edit.label
      row.label.toggleAttribute('disabled', !reachable || !edit.include)
      const value = item.field.kind === 'value'
      row.type.hidden = !value
      row.kind.hidden = value
      setText(row.kind, item.field.kind === 'list' ? t.kinds.list : t.kinds.object)
      row.type.setAttribute('aria-label', t.typeOf(path))
      setCollection(row.type, VALUE_TYPES.map(type => ({ value: type, label: t.types[type] })))
      if (row.type.value?.[0] !== edit.type)
        row.type.value = [edit.type]
      row.type.disabled = !reachable || !edit.include
      row.contentCell.hidden = !withContent
      row.content.hidden = !value
      row.content.setAttribute('aria-label', t.contentOf(path))
      setCollection(row.content, (this.contents ?? []).map(content => ({ value: content, label: t.contents[content] })))
      if (row.content.value?.[0] !== edit.content)
        row.content.value = [edit.content]
      row.content.disabled = !reachable || !edit.include
      if (previous.nextElementSibling !== row.element)
        previous.after(row.element)
      previous = row.element
    }
  }

  #createRow(page: Page, item: FlatField): PreviewRow {
    const doc = this.ownerDocument
    const cell = (children: Node[], part?: string): HTMLElement => createAuthoredElement(doc, 'div', { 'role': 'cell', 'data-scope': SCOPE, ...(part ? { 'data-part': part } : {}) }, children)
    const { key } = item
    const edit = (change: Partial<RowEdit>): void => {
      const field = this.#rows.get(key)?.item.field ?? item.field
      const edits = page.state.edits
      edits.set(key, { ...(edits.get(key) ?? defaultEdit(field)), ...change })
      this.requestUpdate()
    }
    const include: CheckboxElement = createAuthoredElement(doc, 'xh-checkbox', { 'size': 'sm', 'data-scope': SCOPE, 'data-part': 'include' })
    include.addEventListener('checked-change', (event) => {
      event.stopPropagation()
      edit({ include: (event as CustomEvent<{ checked: boolean | 'indeterminate' }>).detail.checked === true })
    })
    const name = createAuthoredElement(doc, 'span', { 'data-scope': SCOPE, 'data-part': 'name' })
    const label: TextFieldElement = createAuthoredElement(doc, 'xh-text-field', { 'size': 'sm', 'data-scope': SCOPE, 'data-part': 'label' })
    label.addEventListener('value-change', (event) => {
      event.stopPropagation()
      const { value } = (event as CustomEvent<{ value: string }>).detail
      label.value = value
      edit({ label: value })
    })
    const select = (part: string, onChange: (value: string) => void): SelectElement => {
      const element: SelectElement = createAuthoredElement(doc, 'xh-select', { 'size': 'sm', 'data-scope': SCOPE, 'data-part': part })
      element.addEventListener('value-change', (event) => {
        event.stopPropagation()
        const next = (event as CustomEvent<{ value: string[] }>).detail.value[0]
        if (next === undefined)
          return
        element.value = [next]
        onChange(next)
      })
      return element
    }
    const type = select('type', value => edit({ type: value as FilterValueType }))
    const kind = createAuthoredElement(doc, 'span', { 'data-scope': SCOPE, 'data-part': 'kind' })
    const content = select('content', value => edit({ content: value as DataFieldContent }))
    const contentCell = cell([content])
    const element = createAuthoredElement(doc, 'div', { 'role': 'row', 'data-scope': SCOPE, 'data-part': 'row' }, [
      cell([include, name], 'field'),
      cell([label]),
      cell([type, kind]),
      contentCell,
    ])
    return { item, element, include, name, label, type, kind, contentCell, content }
  }

  #submit(): void {
    const page = this.#pages.get(this.#parts?.tabs.value ?? '')
    const result = page?.state.result
    if (!page || !result)
      return
    const withContent = (this.contents?.length ?? 0) > 0
    const picked = pickFields(result.fields, page.state.edits, withContent)
    if (picked.length === 0)
      return
    const existing = this.fields ?? []
    const mode = existing.length > 0 ? this.#mode : 'replace'
    const sample = sampleOf(page.state.content)
    const detail: DesignerFieldImportDetail = {
      fields: mode === 'merge' ? mergeDataFields(existing, picked).fields : picked,
      mode,
      source: page.id,
      ...(this.offerSample === true && this.#useSample && sample !== undefined ? { sample } : {}),
      annotations: result.annotations,
    }
    emitEvent(this, 'fields-import', detail)
    this.#setOpen(false)
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'xh-designer-field-import': XhDesignerFieldImportElement
  }
}
