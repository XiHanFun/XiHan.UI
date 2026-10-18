/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 field 相关实现。

import type { Scope } from '@xihan-ui/core'
import type { FieldProps, FormControlState } from '@xihan-ui/headless'
import type { ElementStructure } from '../element-base'
import type { FormControlHost } from '../runtime/form-control-host'
import { createCounterIdGenerator, createScope } from '@xihan-ui/core'
import { connectField, fieldAnatomy, fieldControlWiring, fieldMeta, fieldStructure, hasNamingContent, resolveFormControlState } from '@xihan-ui/headless'
import { BOOLEAN_CONVERTER } from '../dom/converters'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { XhReactiveElement } from '../reactive'
import { FORM_CONTROL_HOST_SELECTOR, isComposedControl } from '../runtime/form-control-host'

/** 字段沿 DOM 祖先链认领控件时停在这两种节点上：更近的字段，或作者放的字段边界。 */
export const FIELD_SCOPE_SELECTOR = 'xh-field, xh-field-boundary'

// 属性缺席翻成 undefined，控件 id 的缺省由 connect 派生。
/** 说明部件里会改变「读不读得出一句话」的属性：命名属性与对读屏隐藏的两种标记。 */
const DESCRIPTION_NAMING_ATTRS = ['aria-label', 'aria-labelledby', 'alt', 'title', 'aria-hidden', 'hidden']

const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }

/**
 * `<xh-field>`：Light-DOM 行为宿主，无状态机，把 connectField 产出的 id 与 aria-* 接到
 * label / control / description / error-text 角色节点上，自动对齐 `for` 与描述链。控件本身由作者渲染。
 *
 * 每个实例自带一份 scope 派生 part id，同页多个 field 各自分配 id。
 *
 * 作用域内的库内控件（不跨嵌套字段与 `<xh-field-boundary>`）还会收到字段接线：控件把描述链、校验三态与
 * 字段标签并进自己真正可聚焦的部件（输入框、触发钮、组根、拇指），提示与错误文案因此能被读屏念到。
 * 控件离开作用域或字段断开时接线收回。
 *
 * 不写部件（或只写 root）时元素按标准结构生成：标题（label）、控件、说明（description）、错误文案（error-text），
 * 标题、说明、错误文案给了属性或 slot 内容才有。宿主直接子节点写 `slot="control"` 的库内控件原样挪到标题之后，
 * 外面不包部件；标题、说明、错误文案也可以由 `slot="label"`、`slot="description"`、`slot="error-text"` 接管。
 * 原生控件要标成 control 部件时手写结构。
 *
 * @customElement xh-field
 * @attr {string} label - 标题文字：生成结构时铺带这段文字的 label 部件；手写部件时不使用它
 * @attr {string} description - 说明文字：生成结构时铺带这段文字的说明部件；手写部件时不使用它
 * @attr {string} error-text - 错误文案：生成结构时给了（空串也算）就铺错误文案部件，invalid 时显示；手写部件时不使用它
 * @attr {boolean} invalid - 校验失败态：控件 aria-invalid=true，错误文案接入描述链并显示
 * @attr {boolean} required - 必填：控件 aria-required=true
 * @attr {boolean} disabled - 禁用标注，只写 data-disabled，不代作者写原生 disabled
 * @attr {boolean} read-only - 只读标注：控件上 aria-readonly=true，仍保留焦点与提交语义
 * @attr {string} control-id - 接管控件 id；未提供该属性即由 scope 派生。刻意不命名为 id：
 *   宿主的 id 是 `<xh-field>` 自己的 DOM id，移作控件 id 会使两个节点使用同一个 id
 * @csspart root - 承载 data-disabled / data-invalid / data-required 的容器
 * @csspart label - 标题；`for` 恒指向控件，因此须是原生 `<label>` 才能点击聚焦控件
 * @csspart control - 实际的输入控件本身（id 与 aria-* 写在这里，不标注在外层包裹节点上）
 * @csspart description - 常驻说明文案，恒在控件的描述链中
 * @csspart error-text - 错误文案（role=status，排队播报不打断）；非 invalid 时带 hidden 收起，节点不卸载
 */
export class XhFieldElement extends XhElement {
  // label 必须是原生 <label>：for 只在它身上有效，写成 div 则点标签不再聚焦控件
  // （名字关联仍由 control 上的 aria-labelledby 兜住，丢的是点击行为）。
  // 放进字段的库内控件顶替 control 部件：字段按发现表给它接线，作者不另写 control。
  static override partContract = {
    anatomy: fieldAnatomy,
    meta: fieldMeta,
    tags: { label: ['label'] },
    fulfilledBy: { control: FORM_CONTROL_HOST_SELECTOR },
  }

  static override structure: ElementStructure<XhFieldElement> = {
    build: host => fieldStructure({
      label: host.label,
      description: host.description,
      errorText: host.errorText,
      slotted: (name, key) => host.slotted(name, key),
    }),
  }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    label: { converter: STRING_CONVERTER },
    description: { converter: STRING_CONVERTER },
    errorText: { converter: STRING_CONVERTER, attribute: 'error-text' },
    invalid: { converter: BOOLEAN_CONVERTER },
    required: { converter: BOOLEAN_CONVERTER },
    disabled: { converter: BOOLEAN_CONVERTER },
    readOnly: { converter: BOOLEAN_CONVERTER, attribute: 'read-only' },
    controlId: { converter: STRING_CONVERTER, attribute: 'control-id' },
  }

  declare label?: string
  declare description?: string
  declare errorText?: string
  declare invalid?: boolean
  declare required?: boolean
  declare disabled?: boolean
  declare readOnly?: boolean
  declare controlId?: string

  private inheritedControl: FormControlState | undefined

  /** 上一帧下发过接线的库内控件：这一帧不在作用域里的收回。 */
  private wiredControls = new Set<XhElement>()

  /** 说明部件的内容从无到有、从有到无时重新接线：读不出一句话的说明不进控件的描述链。 */
  private descriptionWatch: { el: HTMLElement, observer: MutationObserver } | undefined

  private watchDescription(el: HTMLElement | null): void {
    if (this.descriptionWatch?.el === el)
      return
    this.descriptionWatch?.observer.disconnect()
    this.descriptionWatch = undefined
    if (!el || typeof MutationObserver === 'undefined')
      return
    const observer = new MutationObserver(() => this.requestUpdate())
    observer.observe(el, { characterData: true, childList: true, subtree: true, attributes: true, attributeFilter: DESCRIPTION_NAMING_ATTRS })
    this.descriptionWatch = { el, observer }
  }

  // 实例级 scope 只建一次，避免派生出的 id 每帧变化
  private readonly fieldScope: Scope = createScope(null, createCounterIdGenerator())

  /** Form 发现 Light DOM 控件后调用；状态优先级仍由 headless 真源计算。 */
  setFormControlState(state: FormControlState | undefined): void {
    this.inheritedControl = state
    this.requestUpdate()
  }

  protected wire(): void {
    const state = resolveFormControlState({
      invalid: this.invalid,
      required: this.required,
      disabled: this.disabled,
      readOnly: this.readOnly,
    }, this.inheritedControl)
    const description = this.getPart('description')
    this.watchDescription(description)
    const props: FieldProps = {
      invalid: state.invalid,
      required: state.required,
      disabled: state.disabled,
      readOnly: state.readOnly,
      controlId: this.controlId,
      // 名字链与描述链只收作者写了的部件；读不出一句话的说明按没写处理
      parts: {
        label: this.getPart('label') != null,
        description: description != null && hasNamingContent(description),
        errorText: this.getPart('error-text') != null,
        control: this.getPart('control') != null,
      },
    }
    // 字段集压下来的作用域禁用也落到字段上：标题与说明随组内控件一起变淡
    const api = connectField(this.configured('field', props), this.fieldScope, wcNormalize)

    const put = (name: string, attrs: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, attrs)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('label', api.getLabelProps() as Record<string, unknown>)
    // 控件上只落 data-disabled，原生 disabled 归作者自己写
    put('control', api.getControlProps() as Record<string, unknown>)
    put('description', api.getDescriptionProps() as Record<string, unknown>)
    put('error-text', api.getErrorTextProps() as Record<string, unknown>)

    // Field 套库内控件时，状态必须进那台控件机器；只把 ARIA 铺在包装根上不足以挡住输入。
    const wiring = fieldControlWiring(api)
    const wired = new Set<XhElement>()
    for (const control of this.querySelectorAll<FormControlHost>(FORM_CONTROL_HOST_SELECTOR)) {
      // 嵌套 Field 的控件归更近的那一层，字段边界后面的控件不归任何外层字段，当前 Field 都不跨过去覆盖。
      if (control.closest(FIELD_SCOPE_SELECTOR) !== this)
        continue
      if (isComposedControl(control))
        continue
      control.setFormControlState({
        disabled: api.disabled,
        readOnly: api.readOnly,
        required: api.required,
        invalid: api.invalid,
      })
      // 描述链、校验三态与字段标签并进控件自己的可聚焦部件，由控件声明的 fieldTarget 决定落在哪里
      if (control instanceof XhElement && (control.constructor as typeof XhElement).fieldTarget) {
        control.setFieldWiring(wiring)
        wired.add(control)
      }
    }
    for (const control of this.wiredControls) {
      if (!wired.has(control))
        control.setFieldWiring(undefined)
    }
    this.wiredControls = wired
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    this.watchDescription(null)
    // 字段离场时收回接线；只是被移动的话，重连后的那一帧会重新下发
    for (const control of this.wiredControls) control.setFieldWiring(undefined)
    this.wiredControls = new Set()
  }
}

/**
 * `<xh-field-boundary>`：字段边界。包裹一棵子树，其中的库内控件不再继承外层 `<xh-field>` 与表单字段组的
 * 禁用、只读、必填与无效：组合控件把自己的内部输入（搜索框、筛选框）包进来，它们就不归外层字段管。
 *
 * 它不渲染任何内容、不接线任何角色节点：作者写的子节点原样留在 Light DOM 里，布局上它是 display: contents。
 * 与 Vue / React 的 XhFieldBoundary 是同一件事：那两家断开的是组件树上的字段上下文，这里是字段沿 DOM 祖先链
 * 认领控件时停在它身上。浮层内容经 Portal 搬到落点后本来就不在字段的子树里。
 *
 * @customElement xh-field-boundary
 */
export class XhFieldBoundaryElement extends XhReactiveElement {
  protected override createRenderRoot(): HTMLElement | DocumentFragment {
    return this // Light DOM，不建 shadowRoot
  }

  override connectedCallback(): void {
    super.connectedCallback()
    // 布局上让开：作者的子节点该由外层容器直接排布，不该被这一层挡出一个块
    if (!this.style.display)
      this.style.display = 'contents'
  }
}
