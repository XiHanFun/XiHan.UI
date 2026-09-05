import type { MachineSchema, PropTypes } from '@xihan-ui/core'

/**
 * 编辑态怎么收尾：
 * - blur：焦点离开输入框即提交
 * - enter：回车提交
 * - both：两者都提交（默认）
 * - none：只有提交按钮与 api.submit() 算提交
 *
 * 不算提交的那些出口（离焦、Tab）一律按撤销处理：把值还回上一次提交的那个。
 */
export type EditableSubmitMode = 'blur' | 'enter' | 'both' | 'none'

/**
 * 预览区怎么进编辑态：
 * - click：单击（默认）
 * - dblclick：双击（单击留给选中文字这类操作）
 * - focus：焦点落到预览区即进（预览区因此占一个 Tab 位）
 * - none：预览区不认任何交互，只能走编辑按钮
 *
 * 无论哪种模式，edit-trigger 与 api.edit() 都能进编辑态。
 */
export type EditableActivationMode = 'click' | 'dblclick' | 'focus' | 'none'

export interface EditableValueChangeDetails {
  /** 输入框里的当下值；编辑途中每敲一下都会来一条。 */
  value: string
}

export interface EditableValueCommitDetails {
  /** 提交下来的值。 */
  value: string
  /** 上一次提交的值；与 value 相等即这次提交没带来任何变化。 */
  previousValue: string
}

export interface EditableValueRevertDetails {
  /** 撤销后回到的值，也就是上一次提交的那个。 */
  value: string
  /** 被丢掉的那份编辑中内容。 */
  discardedValue: string
}

export interface EditableEditChangeDetails {
  edit: boolean
}

// 适配器在挂载前填入元素 getter；纯逻辑测试与 SSR 下保持缺省，此时焦点副作用一律短路。
export interface EditableRefs {
  /** 编辑态的输入框；进编辑态后焦点搬进它。 */
  getInputEl: () => HTMLElement | null
  /** 预览态的显示区；退出编辑态后焦点还给它。 */
  getPreviewEl: () => HTMLElement | null
}

export interface EditableSchema extends MachineSchema {
  props: {
    /** 受控值；给了就由宿主说了算，机器不自改（cell 原生受控，无影子事件）。 */
    value?: string
    /** 非受控初值。 */
    defaultValue?: string
    /** 受控编辑态；给了就由宿主说了算，用户交互只发 onEditChange。 */
    edit?: boolean
    /** 非受控初始编辑态。为真时挂载即进编辑态并把焦点搬进输入框。 */
    defaultEdit?: boolean
    /** 值为空时预览区显示它，输入框也拿它当占位。 */
    placeholder?: string
    /** 禁用：进不了编辑态，输入框带原生 disabled。 */
    disabled?: boolean
    /** 只读：进不了编辑态，但已在编辑态时仍能退出（撤销/提交都通）。 */
    readOnly?: boolean
    /** 校验失败标注。 */
    invalid?: boolean
    /** 字符数上限；同时落成原生 maxlength 与机器侧截断。 */
    maxLength?: number
    /** 表单字段名；给了输入框才参与提交。 */
    name?: string
    /** 编辑态的收尾方式，默认 both。 */
    submitMode?: EditableSubmitMode
    /** 预览区的激活方式，默认 click。 */
    activationMode?: EditableActivationMode
    /** 进编辑态时全选已有内容，默认开。关掉则光标停在原处。 */
    selectOnFocus?: boolean
    /** 输入框宽度跟着内容走：连接层把字符数落成原生 size 属性。 */
    autoResize?: boolean
    /** 值变化意图回调；编辑途中每次输入都发，受控时是唯一出口。 */
    onValueChange?: (details: EditableValueChangeDetails) => void
    /** 提交那一刻才发；编辑途中的输入不会惊动它。 */
    onValueCommit?: (details: EditableValueCommitDetails) => void
    /** 撤销那一刻发（Escape、取消按钮、不算提交的离场）。 */
    onValueRevert?: (details: EditableValueRevertDetails) => void
    /** 编辑态变化意图回调；受控时是唯一出口，非受控随内部转移一并通知。 */
    onEditChange?: (details: EditableEditChangeDetails) => void
  }
  context: {
    /** 当下的值。受控（value 给定）时 cell 直读 prop。 */
    value: string
    /** 上一次提交的值，也是撤销的落点。进编辑态那一刻拍下快照。 */
    committedValue: string
  }
  computed: Record<string, never>
  refs: EditableRefs
  /** preview = 显示文本；edit = 显示输入框。两个部件常挂，另一个带 hidden。 */
  state: 'preview' | 'edit'
  event:
    /** 进编辑态意图（预览区激活、编辑按钮、api.edit）。禁用/只读时整条被吃掉。 */
    | { type: 'EDIT.START', src?: 'preview' | 'edit-trigger' | 'label' }
    /** 提交意图；不看 disabled/readOnly。 */
    | { type: 'EDIT.SUBMIT', src?: 'enter' | 'submit-trigger' }
    /** 撤销意图：值还回上一次提交的那个。 */
    | { type: 'EDIT.CANCEL', src?: 'escape' | 'cancel-trigger' }
    /** 焦点离场（失焦或 Tab）：按 submitMode 决定这次编辑是提交还是撤销。 */
    | { type: 'EDIT.LEAVE', src?: 'blur' | 'tab' }
    /** 用户敲字或作者调 setValue；超过 maxLength 的部分在这里被截掉。 */
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
  /** 当下的值（编辑途中就是输入框里的那串）。 */
  value: string
  /** 上一次提交的值，也是撤销的落点。 */
  committedValue: string
  /** 正处在编辑态。 */
  editing: boolean
  /** 值为空串。 */
  empty: boolean
  /** 预览区当下该显示的文字：值为空时退回 placeholder。 */
  displayValue: string
  disabled: boolean
  readOnly: boolean
  invalid: boolean
  /** 进得了编辑态（既没禁用也不只读）。 */
  interactive: boolean
  /** 直接写值，只受 disabled/readOnly 与 maxLength 约束，与编辑态无关。 */
  setValue: (next: string) => void
  /** 进编辑态；禁用或只读时不动。 */
  edit: () => void
  /** 提交当下的值并回到预览态。 */
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

/** 读屏用的文案。本组件目前没有需要外露的文案，位先留着。 */
export interface EditableTranslations {}
