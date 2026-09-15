/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 editable 类型契约。

import type { ControlVariant, MachineSchema, PropTypes, Size, Tone } from '@xihan-ui/core'

/**
 * 编辑态的收尾方式：
 * - blur：焦点离开输入框即提交
 * - enter：回车提交
 * - both：两者都提交（默认）
 * - none：只有提交按钮与 api.submit() 视为提交
 *
 * 不视为提交的出口（失焦、Tab）一律按撤销处理：把值恢复为上一次提交的值。
 */
export type EditableSubmitMode = 'blur' | 'enter' | 'both' | 'none'

/**
 * 预览区进入编辑态的方式：
 * - click：单击（默认）
 * - dblclick：双击（单击保留给选中文字等操作）
 * - focus：焦点落到预览区即进入（预览区因此占一个 Tab 位）
 * - none：预览区不响应任何交互，只能通过编辑按钮
 *
 * 无论哪种模式，edit-trigger 与 api.edit() 都能进入编辑态。
 */
export type EditableActivationMode = 'click' | 'dblclick' | 'focus' | 'none'

export interface EditableValueChangeDetails {
  /** 输入框中的当前值；编辑途中每次输入都会发出一条。 */
  value: string
}

export interface EditableValueCommitDetails {
  /** 提交的值。 */
  value: string
  /** 上一次提交的值；与 value 相等即本次提交没有带来变化。 */
  previousValue: string
}

export interface EditableValueRevertDetails {
  /** 撤销后回到的值，即上一次提交的值。 */
  value: string
  /** 被丢弃的编辑中内容。 */
  discardedValue: string
}

export interface EditableEditChangeDetails {
  edit: boolean
}

// 适配器在挂载前填入元素 getter；纯逻辑测试与 SSR 下保持缺省，此时焦点副作用一律短路。
export interface EditableRefs {
  /** 编辑态的输入框；进入编辑态后焦点移入它。 */
  getInputEl: () => HTMLElement | null
  /** 预览态的显示区；退出编辑态后焦点归还给它。 */
  getPreviewEl: () => HTMLElement | null
}

export interface EditableSchema extends MachineSchema {
  props: {
    /** 受控值；提供后由宿主决定，状态机不自行修改（cell 原生受控，无影子事件）。 */
    value?: string
    /** 非受控初值。 */
    defaultValue?: string
    /** 受控编辑态；提供后由宿主决定，用户交互只发 onEditChange。 */
    edit?: boolean
    /** 非受控初始编辑态。为真时挂载即进入编辑态并把焦点移入输入框。 */
    defaultEdit?: boolean
    /** 值为空时预览区显示它，输入框也将其用作占位。 */
    placeholder?: string
    /** 禁用：无法进入编辑态，输入框带原生 disabled。 */
    disabled?: boolean
    /** 只读：无法进入编辑态，但已在编辑态时仍能退出（撤销 / 提交都可用）。 */
    readOnly?: boolean
    /** 校验失败标注。 */
    invalid?: boolean
    /** 字符数上限；同时落为原生 maxlength 与状态机侧截断。 */
    maxLength?: number
    /** 表单字段名；提供后输入框才参与提交。 */
    name?: string
    /** 编辑态的收尾方式，默认 both。 */
    submitMode?: EditableSubmitMode
    /** 预览区的激活方式，默认 click。 */
    activationMode?: EditableActivationMode
    /** 进入编辑态时全选已有内容，默认开启。关闭则光标停在原处。 */
    selectOnFocus?: boolean
    /** 输入框宽度跟随内容：连接层把字符数写为原生 size 属性。 */
    autoResize?: boolean
    /** 形态：outline / subtle / ghost，决定预览态与编辑态共用 control 的底色与描边。 */
    variant?: ControlVariant
    /** 语气：brand / neutral / success / warning / danger / info，决定 control 的聚焦描边与焦点环颜色。 */
    tone?: Tone
    /** 尺寸：sm / md / lg，决定 control、预览区、输入框与三个动作按钮的几何档位。 */
    size?: Size
    /** 值变化意图回调；编辑途中每次输入都发出，受控时是唯一出口。 */
    onValueChange?: (details: EditableValueChangeDetails) => void
    /** 提交时才发出；编辑途中的输入不触发它。 */
    onValueCommit?: (details: EditableValueCommitDetails) => void
    /** 撤销时发出（Escape、取消按钮、不视为提交的离场）。 */
    onValueRevert?: (details: EditableValueRevertDetails) => void
    /** 编辑态变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 */
    onEditChange?: (details: EditableEditChangeDetails) => void
  }
  context: {
    /** 当前的值。受控（value 提供）时 cell 直读 prop。 */
    value: string
    /** 上一次提交的值，也是撤销的落点。进入编辑态时记录快照。 */
    committedValue: string
  }
  computed: Record<string, never>
  refs: EditableRefs
  /** preview = 显示文本；edit = 显示输入框。两个部件常驻，另一个带 hidden。 */
  state: 'preview' | 'edit'
  event:
    /** 进入编辑态意图（预览区激活、编辑按钮、api.edit）。禁用 / 只读时整条被拦截。 */
    | { type: 'EDIT.START', src?: 'preview' | 'edit-trigger' | 'label' }
    /** 提交意图；不检查 disabled / readOnly。 */
    | { type: 'EDIT.SUBMIT', src?: 'enter' | 'submit-trigger' }
    /** 撤销意图：值恢复为上一次提交的值。 */
    | { type: 'EDIT.CANCEL', src?: 'escape' | 'cancel-trigger' }
    /** 焦点离场（失焦或 Tab）：按 submitMode 决定本次编辑是提交还是撤销。 */
    | { type: 'EDIT.LEAVE', src?: 'blur' | 'tab' }
    /** 用户输入或作者调用 setValue；超过 maxLength 的部分在这里截断。 */
    | { type: 'VALUE.SET', value: string }
    // 受控回写：宿主改 edit prop 后由 watch 派发，无条件跳转，不再通知
    | { type: 'CONTROLLED.EDIT' }
    | { type: 'CONTROLLED.PREVIEW' }
    | { type: 'FORM.RESET' }
  tag: never
  guard: 'isEditControlled' | 'canEdit' | 'submitsOnLeave'
  action:
    | 'setValue'
    | 'snapshotValue'
    | 'commitValue'
    | 'revertValue'
    | 'invokeEditOn'
    | 'invokeEditOff'
    | 'syncEdit'
    | 'resetToDefault'
  effect: 'trackEditFocus'
}

export interface EditableApi<T extends PropTypes = PropTypes> {
  /** 当前的值（编辑途中即输入框中的内容）。 */
  value: string
  /** 上一次提交的值，也是撤销的落点。 */
  committedValue: string
  /** 处于编辑态。 */
  editing: boolean
  /** 值为空串。 */
  empty: boolean
  /** 预览区当前应显示的文字：值为空时回退为 placeholder。 */
  displayValue: string
  disabled: boolean
  readOnly: boolean
  invalid: boolean
  /** 可以进入编辑态（既未禁用也不只读）。 */
  interactive: boolean
  /** 直接写值，只受 disabled / readOnly 与 maxLength 约束，与编辑态无关。 */
  setValue: (next: string) => void
  /** 进入编辑态；禁用或只读时不生效。 */
  edit: () => void
  /** 提交当前的值并回到预览态。 */
  submit: () => void
  /** 撤销回上一次提交的值并回到预览态。 */
  cancel: () => void
  getRootProps: () => T['element']
  getLabelProps: () => T['label']
  getPreviewProps: () => T['element']
  getInputProps: () => T['input']
  getEditTriggerProps: () => T['button']
  getSubmitTriggerProps: () => T['button']
  getCancelTriggerProps: () => T['button']
  getControlProps: () => T['element']
}

/** 读屏文案。本组件目前没有需要外露的文案，保留该位。 */
export interface EditableTranslations {}
