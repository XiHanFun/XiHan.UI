/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// <xh-designer-json-editor>：编辑整份模板的 JSON 对话框。库内 xh-dialog 里一个等宽字体的多行编辑框，下面是解析失败的说明与
// 问题列表（xh-designer-issues），底边是格式化、复制、取消与应用。每改一次都重新解析、交给设计器校验；解析失败或有错误级
// 问题时「应用」不可用。点问题列表的一条，光标跳到那个路径在文字里的位置；路径在文字里没有时退到最近的上级。按「应用」派发
// json-apply，由设计器换上新文档（四款作为一步进撤销栈）。

import type { JsonPath, JsonTextResult, JsonValue } from '@xihan-ui/core/json'
import type { SchemaIssue } from '@xihan-ui/designer-kit/schema'
import type { PropertyValues } from '@xihan-ui/web-components/authoring'
import type { DesignerIssueItem } from '../issues/issues-element'
import type { DesignerJsonEditorTranslations } from '../translations'
import { writeToClipboard } from '@xihan-ui/core/clipboard'
import { jsonEquals, locateJsonPath, parseJsonText } from '@xihan-ui/core/json'
import { issueSeverity } from '@xihan-ui/designer-kit/schema'
import { BOOLEAN_CONVERTER, createAuthoredElement, createGeneratedElement, emitEvent, registerElement, setText, XhConfigController, XhReactiveElement } from '@xihan-ui/web-components/authoring'
import { defineJsonEditorElements } from '../internal/ui-elements'
import { XhDesignerIssuesElement } from '../issues/issues-element'
import { DESIGNER_JSON_EDITOR_EN_US } from '../locale/en-US'

/** 校验编辑框里的 JSON：返回问题列表的条目（问题与换好的文字）。各款先走读入迁移、再走 core 的校验，与粘贴整份模板同一套。 */
export type DesignerJsonValidator = (value: JsonValue) => readonly DesignerIssueItem[]

/** JSON 编辑框派发的事件。 */
export interface DesignerJsonEditorEventMap {
  /** 用户按了「应用」：文字解析得了、没有错误级问题、与打开时的值不同；对话框随即关上。 */
  'json-apply': CustomEvent<{ value: JsonValue }>
  /** 对话框要打开或关上（Esc、点遮罩、关闭钮、取消、应用）：元素已经换成这个状态。 */
  'open-change': CustomEvent<{ open: boolean }>
}

const TAG = 'xh-designer-json-editor'
/** 对话框生成的结构都带这个 data-scope，样式只认它。 */
const SCOPE = 'designer-json-editor'
/** 缩进两格。 */
const INDENT = 2

type DialogElement = HTMLElement & { open?: boolean }
type TextFieldElement = HTMLElement & { value?: string, readOnly?: boolean, invalid?: boolean }
type ButtonElement = HTMLElement & { disabled?: boolean }

interface Parts {
  readonly dialog: DialogElement
  readonly title: HTMLElement
  readonly input: TextFieldElement
  readonly area: HTMLTextAreaElement
  readonly error: HTMLElement
  readonly errorText: HTMLElement
  readonly goTo: ButtonElement
  readonly goToText: HTMLElement
  readonly issues: XhDesignerIssuesElement
  readonly format: ButtonElement
  readonly formatText: HTMLElement
  readonly copy: ButtonElement
  readonly copyText: HTMLElement
  readonly status: HTMLElement
  readonly cancel: ButtonElement
  readonly cancelText: HTMLElement
  readonly apply: ButtonElement
  readonly applyText: HTMLElement
}

function format(value: JsonValue): string {
  return JSON.stringify(value, null, INDENT)
}

export class XhDesignerJsonEditorElement extends XhReactiveElement {
  static override properties = {
    value: { attribute: false },
    validate: { attribute: false },
    readonly: { converter: BOOLEAN_CONVERTER },
    open: { converter: BOOLEAN_CONVERTER },
    translations: { attribute: false },
  }

  /** 打开时编辑框里的 JSON（设计器此刻的整份文档）；每次打开都从它重新写起。 */
  declare value: JsonValue | undefined
  /** 校验；不给时只查能不能解析。 */
  declare validate: DesignerJsonValidator | undefined
  /** 只读：能看、能格式化、能复制，不能改、不能应用。 */
  declare readonly?: boolean
  /** 对话框打开。 */
  declare open?: boolean
  /** 元素自己的文案，压在全局配置之上。 */
  declare translations: Partial<DesignerJsonEditorTranslations> | undefined

  /** 注册 JSON 编辑框用到的库内元素与问题列表。 */
  static defineDependencies(): void {
    defineJsonEditorElements()
    XhDesignerIssuesElement.defineDependencies()
    registerElement('xh-designer-issues', XhDesignerIssuesElement)
  }

  readonly #config = new XhConfigController(this)
  #parts: Parts | undefined
  #wasOpen = false
  #text = ''
  #parsed: JsonTextResult = { ok: true, value: null }
  #items: readonly DesignerIssueItem[] = []
  /** 刚打开、编辑框还没获焦。 */
  #caretPending = false
  /** 复制之后钮旁那一句；再改文字时清掉。 */
  #copied: 'done' | 'failed' | undefined

  constructor() {
    super()
    this.readonly = false
    this.open = false
  }

  /** 打开对话框。 */
  show(): void {
    this.open = true
  }

  protected override update(changed: PropertyValues): void {
    super.update(changed)
    const parts = this.#ensureParts()
    const t = this.#config.translations<DesignerJsonEditorTranslations>(TAG, DESIGNER_JSON_EDITOR_EN_US, this.translations)
    const open = this.open === true
    if (open && !this.#wasOpen) {
      this.#setText(format(this.value ?? null))
      this.#caretPending = true
    }
    else if (changed.has('validate')) {
      this.#check()
    }
    this.#wasOpen = open
    const readonly = this.readonly === true
    const parsed = this.#parsed
    setText(parts.title, t.title)
    parts.input.setAttribute('aria-label', t.input)
    parts.input.readOnly = readonly
    parts.input.invalid = !parsed.ok
    setText(parts.errorText, parsed.ok ? '' : t.parseError(parsed.line, parsed.column, t.parseErrors[parsed.code]))
    setText(parts.goToText, t.goToError)
    parts.error.hidden = parsed.ok
    parts.issues.items = this.#items
    parts.issues.setAttribute('aria-label', t.issues)
    parts.issues.hidden = this.#items.length === 0
    setText(parts.formatText, t.format)
    parts.format.disabled = !parsed.ok || format(parsed.value) === this.#text
    setText(parts.copyText, t.copy)
    setText(parts.status, this.#copied === 'done' ? t.copied : this.#copied === 'failed' ? t.copyFailed : '')
    setText(parts.cancelText, t.cancel)
    setText(parts.applyText, t.apply)
    parts.apply.hidden = readonly
    parts.apply.disabled = !this.#applicable()
    if (parts.dialog.open !== open)
      parts.dialog.open = open
  }

  #ensureParts(): Parts {
    if (this.#parts?.dialog.parentElement === this)
      return this.#parts
    const doc = this.ownerDocument
    const part = (tag: string, name: string, children: (Node | string)[] = [], attributes: Record<string, string> = {}): HTMLElement =>
      createAuthoredElement(doc, tag, { 'data-scope': SCOPE, 'data-part': name, ...attributes }, children)
    const button = (name: string, variant: string): { host: ButtonElement, text: HTMLElement } => {
      const text = createAuthoredElement(doc, 'span', {})
      const host: ButtonElement = createAuthoredElement(doc, 'xh-button', { 'variant': variant, 'data-scope': SCOPE, 'data-part': name }, [
        createAuthoredElement(doc, 'button', { 'data-xh-part': 'root', 'type': 'button' }, [text]),
      ])
      return { host, text }
    }
    const title = createAuthoredElement(doc, 'h2', { 'data-xh-part': 'title' })
    const close = createAuthoredElement(doc, 'button', { 'data-xh-part': 'close-trigger', 'type': 'button' })
    const area = createAuthoredElement(doc, 'textarea', { 'data-xh-part': 'input', 'spellcheck': 'false', 'autocapitalize': 'off', 'autocomplete': 'off', 'wrap': 'off' }) as HTMLTextAreaElement
    const input: TextFieldElement = createAuthoredElement(doc, 'xh-text-field', { 'data-scope': SCOPE, 'data-part': 'input' }, [
      createAuthoredElement(doc, 'div', { 'data-xh-part': 'root' }, [
        createAuthoredElement(doc, 'div', { 'data-xh-part': 'control' }, [area]),
      ]),
    ])
    const errorText = createAuthoredElement(doc, 'span', {})
    const goTo = button('go-to-error', 'ghost')
    goTo.host.setAttribute('size', 'sm')
    const error = part('div', 'error', [errorText, goTo.host])
    const issues = createAuthoredElement(doc, 'xh-designer-issues', { 'headless': '', 'activate': 'path', 'data-scope': SCOPE, 'data-part': 'issues' }) as XhDesignerIssuesElement
    const formatButton = button('format', 'outline')
    const copy = button('copy', 'outline')
    const status = part('span', 'status', [], { role: 'status' })
    const cancel = button('cancel', 'ghost')
    const apply = button('apply', 'solid')
    const dialog: DialogElement = createGeneratedElement(doc, 'xh-dialog', { size: 'lg' }, [
      createAuthoredElement(doc, 'div', { 'data-xh-part': 'backdrop' }),
      createAuthoredElement(doc, 'div', { 'data-xh-part': 'positioner' }, [
        createAuthoredElement(doc, 'div', { 'data-xh-part': 'content' }, [
          createAuthoredElement(doc, 'div', { 'data-xh-part': 'header' }, [title, close]),
          createAuthoredElement(doc, 'div', { 'data-xh-part': 'body' }, [input, error, issues]),
          createAuthoredElement(doc, 'div', { 'data-xh-part': 'footer' }, [
            part('div', 'actions', [
              part('div', 'tools', [formatButton.host, copy.host, status]),
              part('div', 'confirm', [cancel.host, apply.host]),
            ]),
          ]),
        ]),
      ]),
    ])
    // 打开后第一次获焦把光标放回开头、滚到顶：写进文字后光标落在末尾，整段被选中时一敲键就没了；用户自己点进中间的不动
    area.addEventListener('focus', () => {
      if (!this.#caretPending)
        return
      this.#caretPending = false
      queueMicrotask(() => {
        const length = area.value.length
        const atEnd = area.selectionStart === length && area.selectionEnd === length
        const whole = area.selectionStart === 0 && area.selectionEnd === length
        if (length > 0 && (atEnd || whole)) {
          area.setSelectionRange(0, 0)
          area.scrollTop = 0
        }
      })
    })
    // 里面的控件也派发 open-change、value-change 并冒泡上来，只认对话框与编辑框自己的
    dialog.addEventListener('open-change', (event) => {
      if (event.target !== dialog)
        return
      event.stopPropagation()
      const { open } = (event as CustomEvent<{ open: boolean }>).detail
      if (open !== (this.open === true))
        this.#setOpen(open)
    })
    input.addEventListener('value-change', (event) => {
      if (event.target !== input)
        return
      event.stopPropagation()
      if (this.readonly === true)
        return
      this.#setText((event as CustomEvent<{ value: string }>).detail.value)
      this.requestUpdate()
    })
    issues.addEventListener('issue-activate', (event) => {
      event.stopPropagation()
      this.#reveal((event as CustomEvent<{ issue: SchemaIssue }>).detail.issue.path)
    })
    goTo.host.addEventListener('click', () => {
      const parsed = this.#parsed
      if (!parsed.ok)
        this.#select(parsed.offset, parsed.offset, parsed.line)
    })
    formatButton.host.addEventListener('click', () => {
      const parsed = this.#parsed
      if (!parsed.ok)
        return
      this.#setText(format(parsed.value))
      this.requestUpdate()
    })
    copy.host.addEventListener('click', () => void this.#copy())
    cancel.host.addEventListener('click', () => this.#setOpen(false))
    apply.host.addEventListener('click', () => {
      const parsed = this.#parsed
      if (!parsed.ok || !this.#applicable())
        return
      emitEvent(this, 'json-apply', { value: parsed.value })
      this.#setOpen(false)
    })
    this.append(dialog)
    this.#parts = {
      dialog,
      title,
      input,
      area,
      error,
      errorText,
      goTo: goTo.host,
      goToText: goTo.text,
      issues,
      format: formatButton.host,
      formatText: formatButton.text,
      copy: copy.host,
      copyText: copy.text,
      status,
      cancel: cancel.host,
      cancelText: cancel.text,
      apply: apply.host,
      applyText: apply.text,
    }
    return this.#parts
  }

  #setOpen(open: boolean): void {
    this.open = open
    emitEvent(this, 'open-change', { open })
  }

  /** 换上编辑框的文字：重新解析与校验，复制的那一句清掉。 */
  #setText(text: string): void {
    this.#text = text
    this.#copied = undefined
    const input = this.#parts?.input
    if (input && input.value !== text)
      input.value = text
    this.#check()
  }

  #check(): void {
    this.#parsed = parseJsonText(this.#text)
    this.#items = this.#parsed.ok ? this.validate?.(this.#parsed.value) ?? [] : []
  }

  /** 解析得了、没有错误级问题、与打开时的值不同、也不是只读。 */
  #applicable(): boolean {
    return this.readonly !== true
      && this.#parsed.ok
      && !this.#items.some(item => issueSeverity(item.issue) === 'error')
      && !jsonEquals(this.#parsed.value, this.value ?? null)
  }

  async #copy(): Promise<void> {
    const text = this.#text
    try {
      const win = this.ownerDocument.defaultView
      if (!win)
        throw new Error('[xh] 编辑框不在窗口里，写不了剪贴板')
      await writeToClipboard(win, text)
      this.#copied = 'done'
    }
    catch {
      this.#copied = 'failed'
    }
    // 复制期间又改了文字，那一句就不写了
    if (this.#text !== text)
      this.#copied = undefined
    this.requestUpdate()
  }

  /** 把光标移到路径在文字里的位置；路径不在文字里时退到最近的上级。整块的对象或数组只选它起头的那一行。 */
  #reveal(path: JsonPath): void {
    for (let length = path.length; length >= 0; length--) {
      const location = locateJsonPath(this.#text, path.slice(0, length))
      if (location === undefined)
        continue
      const lineEnd = this.#text.indexOf('\n', location.start)
      this.#select(location.start, lineEnd < 0 ? location.end : Math.min(location.end, lineEnd), location.line)
      return
    }
  }

  #select(start: number, end: number, line: number): void {
    const area = this.#parts?.area
    if (!area)
      return
    area.focus()
    area.setSelectionRange(start, end)
    // 选区不一定在可见的几行里：按行高把那一行滚到上面三分之一处
    const style = this.ownerDocument.defaultView?.getComputedStyle(area)
    const lineHeight = Number.parseFloat(style?.lineHeight ?? '') || Number.parseFloat(style?.fontSize ?? '') * 1.5 || 0
    area.scrollTop = Math.max(0, (line - 1) * lineHeight - area.clientHeight / 3)
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'xh-designer-json-editor': XhDesignerJsonEditorElement
  }
}
