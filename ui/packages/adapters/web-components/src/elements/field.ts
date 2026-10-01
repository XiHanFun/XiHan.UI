/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 field 相关实现。

import type { Scope } from '@xihan-ui/core'
import type { FieldProps, FormControlState } from '@xihan-ui/headless'
import type { FormControlHost } from '../runtime/form-control-host'
import { createCounterIdGenerator, createScope } from '@xihan-ui/core'
import { connectField, fieldAnatomy, fieldMeta, resolveFormControlState } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { XhReactiveElement } from '../reactive'
import { FORM_CONTROL_HOST_SELECTOR } from '../runtime/form-control-host'

/** 字段沿 DOM 祖先链认领控件时停在这两种节点上：更近的字段，或作者放的字段边界。 */
export const FIELD_SCOPE_SELECTOR = 'xh-field, xh-field-boundary'

// 属性缺席翻成 undefined，控件 id 的缺省由 connect 派生。
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/**
 * `<xh-field>`：Light-DOM 行为宿主，无状态机，把 connectField 产出的 id 与 aria-* 接到
 * label / control / description / error-text 角色节点上，自动对齐 `for` 与描述链。控件本身由作者渲染。
 *
 * 每个实例自带一份 scope 派生 part id，同页多个 field 各自分配 id。
 *
 * @customElement xh-field
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
  static override partContract = {
    anatomy: fieldAnatomy,
    meta: fieldMeta,
    tags: { label: ['label'] },
  }

  // 描述符逐个写全，CEM 分析器读不了对象展开。
  static override properties = {
    invalid: { converter: BOOLEAN_CONVERTER },
    required: { converter: BOOLEAN_CONVERTER },
    disabled: { converter: BOOLEAN_CONVERTER },
    readOnly: { converter: BOOLEAN_CONVERTER, attribute: 'read-only' },
    controlId: { converter: STRING_CONVERTER, attribute: 'control-id' },
  }

  declare invalid?: boolean
  declare required?: boolean
  declare disabled?: boolean
  declare readOnly?: boolean
  declare controlId?: string

  private inheritedControl: FormControlState | undefined

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
    const props: FieldProps = {
      invalid: state.invalid,
      required: state.required,
      disabled: state.disabled,
      readOnly: state.readOnly,
      controlId: this.controlId,
    }
    const api = connectField(props, this.fieldScope, wcNormalize)

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
    for (const control of this.querySelectorAll<FormControlHost>(FORM_CONTROL_HOST_SELECTOR)) {
      // 嵌套 Field 的控件归更近的那一层，字段边界后面的控件不归任何外层字段，当前 Field 都不跨过去覆盖。
      if (control.closest(FIELD_SCOPE_SELECTOR) !== this)
        continue
      control.setFormControlState({
        disabled: api.disabled,
        readOnly: api.readOnly,
        required: api.required,
        invalid: api.invalid,
      })
    }

    // 错误文案常挂，非 invalid 时用内联 display 收起
    this.setPartHidden(this.getPart('error-text'), !api.invalid)
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
