import type { PropTypes } from '@xihan-ui/core'
import type { MachineSchema } from '@xihan-ui/machine'
import type { FormErrorPatch, FormErrors } from './form.errors'

/** 字段名 → 值。表单不解读值的类型，只负责搬运与交给 validate。 */
export type FormValues = Record<string, unknown>

/**
 * 什么时候跑校验：
 * - submit：只在提交时跑，整表替换（默认）。用户没提交过就不该看见红字。
 * - blur：字段失去焦点时跑一次，只更新这一个字段的错误。
 * - change：字段值改动后跑一次，同样只更新这一个字段的错误。
 *
 * blur / change 两种模式下 validate 仍然是整表跑（校验常有跨字段规则，
 * 比如"确认密码要和密码一致"），但只把当事字段那一条写回错误表——
 * 整表写回会把用户还没填到的字段全部当场标红。
 *
 * 提交这一路永远整表跑、整表替换，与 validateOn 无关。
 */
export type FormValidateOn = 'submit' | 'blur' | 'change'

export interface FormValuesChangeDetails {
  values: FormValues
}

export interface FormErrorsChangeDetails {
  errors: FormErrors
}

export interface FormSubmitDetails {
  /** 通过校验的那一份值。 */
  values: FormValues
}

export interface FormInvalidDetails {
  /** 这次提交拦下来的全部错误。 */
  errors: FormErrors
  /** 提交时的值，与 errors 是同一拍的快照。 */
  values: FormValues
}

/**
 * 字段容器自报家门：名字由作者声明，connect 据此产出 id、data-name 与失焦上报。
 * connect 因此是 (state/context/prop, 本容器声明) 的纯函数，不反查 DOM——
 * Vue 侧 connect 在 render 期求值（本帧 DOM 还不存在），WC 侧在 updated 后求值，
 * 连接期读 DOM 会让两个适配器的首帧快照分叉。
 */
export interface FormFieldGroupProps {
  /** 字段名，与 values / errors 表里的键一致。 */
  name: string
}

/** 错误摘要里的一条：指向哪个字段由作者声明。 */
export interface FormErrorSummaryItemProps {
  name: string
}

// 适配器在挂载前填入根元素 getter；纯逻辑测试与 SSR 下保持缺省，
// 此时 DOM 相关的动作（落焦、按文档序排序）一律短路，状态照常转移。
export interface FormRefs {
  /** 表单根节点（那个 `<form>`）：字段容器的现查范围与落焦的起点。 */
  getRootEl: () => HTMLElement | null
}

export interface FormSchema extends MachineSchema {
  props: {
    /** 受控值表；给定即受控：cell 直读 prop，写只发 onValuesChange 不落内部值。 */
    values?: FormValues
    /** 非受控初值，同时也是 reset 的落点。 */
    defaultValues?: FormValues
    /** 受控错误表；给定即受控。空串会被清理掉（空串不是一条错误）。 */
    errors?: FormErrorPatch
    defaultErrors?: FormErrorPatch
    /**
     * 校验函数，由作者给。同步返回「字段名 → 错误文案」，没错的字段给空串或干脆不写。
     * 不给这个函数就等于没有校验，提交时沿用当下的错误表（作者可以自己往里写）。
     */
    validate?: (values: FormValues) => FormErrorPatch
    /** 校验时机，默认 submit。 */
    validateOn?: FormValidateOn
    /** 整个表单禁用：提交、重置、写值一概不发生，两颗按钮带原生 disabled。 */
    disabled?: boolean
    /** 只读：写值与重置不发生，但仍可提交（用户仍能确认这份内容）。 */
    readOnly?: boolean
    /** 值表变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 */
    onValuesChange?: (details: FormValuesChangeDetails) => void
    /** 错误表变化意图回调；受控时是唯一出口。 */
    onErrorsChange?: (details: FormErrorsChangeDetails) => void
    /** 校验通过才调。校验不通过时一次也不会调到它。 */
    onSubmit?: (details: FormSubmitDetails) => void
    /** 校验不通过时调，带上拦下来的整张错误表。 */
    onInvalid?: (details: FormInvalidDetails) => void
  }
  context: {
    /** 当下的值表。受控（values 给定）时 cell 直读 prop。 */
    values: FormValues
    /** 当下的错误表，已清理（在表里 = 此刻有错）。受控（errors 给定）时 cell 直读 prop。 */
    errors: FormErrors
  }
  computed: Record<string, never>
  refs: FormRefs
  /**
   * idle = 还没提交失败过（错误摘要不显形，哪怕错误表非空）；
   * invalid = 上一次提交被拦下了。摘要是"提交失败"的回执，不是"字段有错"的实时镜子——
   * 用户刚打开表单就看见一片红字，只会以为自己已经填错了。
   */
  state: 'idle' | 'invalid'
  event:
    /** 提交意图（`<form>` 的 submit 事件与 api.submit 都走它）。禁用时整条吃掉。 */
    | { type: 'SUBMIT' }
    /** 重置意图：值与错误都回到 defaultValues / defaultErrors。 */
    | { type: 'RESET' }
    /** 校验跑完且全过：带上这一拍的值，回调直接用它，不再回头读 context。 */
    | { type: 'VALIDATION.PASS', errors: FormErrors, values: FormValues }
    /**
     * 校验跑完有错。errors 随事件带走而不是从 context 现读——
     * 错误表受控时 context.set 只发回调、不落值，那一刻回头读到的还是宿主的旧表。
     */
    | { type: 'VALIDATION.FAIL', errors: FormErrors, values: FormValues }
    /** 写一个字段的值（api.setFieldValue）。change 模式下顺带校验这一个字段。 */
    | { type: 'FIELD.SET', name: string, value: unknown }
    /** 焦点离开某个字段容器。blur 模式下据此校验这一个字段。 */
    | { type: 'FIELD.BLUR', name: string }
    /** 写一个字段的错误（api.setFieldError）；空文案即清掉这一条。 */
    | { type: 'ERROR.SET', name: string, message?: string }
    /** 清空整张错误表。 */
    | { type: 'ERRORS.CLEAR' }
    /** 把焦点送进某个字段（错误摘要里的链接点了就发它）。 */
    | { type: 'ERROR.FOCUS', name: string }
  tag: never
  guard: 'isEnabled' | 'isEditable'
  action:
    | 'setFieldValue'
    | 'validateChangedField'
    | 'validateBlurredField'
    | 'runValidation'
    | 'invokeSubmit'
    | 'invokeInvalid'
    | 'focusFirstError'
    | 'focusField'
    | 'setFieldError'
    | 'clearErrors'
    | 'resetForm'
  effect: never
}

export interface FormApi<T extends PropTypes = PropTypes> {
  /** 当下的值表。 */
  values: FormValues
  /** 当下的错误表（已清理）。 */
  errors: FormErrors
  /** 出错的字段名，插入顺序。 */
  errorNames: string[]
  errorCount: number
  /** 错误表非空。与"提交失败过"无关，刚挂载时作者塞进来的错误也算。 */
  invalid: boolean
  /** 上一次提交被拦下了：错误摘要据此显形。 */
  submitFailed: boolean
  disabled: boolean
  readOnly: boolean
  validateOn: FormValidateOn
  /** 字段容器的 DOM id；错误摘要的链接指向它。 */
  getFieldId: (name: string) => string
  getFieldValue: (name: string) => unknown
  /** 该字段此刻的错误文案；没错时为 undefined。 */
  getFieldError: (name: string) => string | undefined
  isFieldInvalid: (name: string) => boolean
  /** 写一个字段的值；禁用或只读时不动。 */
  setFieldValue: (name: string, value: unknown) => void
  /** 写一个字段的错误；不给文案（或给空串）即清掉这一条。 */
  setFieldError: (name: string, message?: string) => void
  clearErrors: () => void
  /** 走完整的校验与提交流程，与用户按提交键完全同一条路。 */
  submit: () => void
  /** 值与错误都回到初始；禁用或只读时不动。 */
  reset: () => void
  getRootProps: () => T['element']
  getFieldGroupProps: (props: FormFieldGroupProps) => T['element']
  getErrorSummaryProps: () => T['element']
  getErrorSummaryItemProps: (props: FormErrorSummaryItemProps) => T['element']
  getSubmitTriggerProps: () => T['button']
  getResetTriggerProps: () => T['button']
}
