/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 form 类型契约。

import type { MachineSchema, PropTypes } from '@xihan-ui/core'
import type { FormErrorPatch, FormErrors } from './form.errors'
import type { FormArrayMutation, FormPath, FormPathRecord } from './form.path'

/**
 * 字段路径 → 值。字符串字段仍是对象上的单键；数组路径存放在不可枚举路径索引中，
 * 不会被 JavaScript 隐式转为逗号字符串。用 get/setFormPathValue 访问数组路径。
 */
export type FormValues = FormPathRecord<unknown>

/** 内置类型检查档位。 */
export type FormRuleType = 'string' | 'number' | 'integer' | 'email' | 'url' | 'array'

/** 一条声明式规则；各检查项都可省略，validator 支持异步。 */
export interface FormRule {
  /** 必填：空值（undefined / null / 空串 / 空数组）拦截。 */
  required?: boolean
  /** 类型检查档位；数值 / 整数会把字符串数字也识别为数。 */
  type?: FormRuleType
  /** 下限：字符串 / 数组比较长度，数值比较大小。 */
  min?: number
  /** 上限：语义同 min。 */
  max?: number
  /** 正则检查；只对字符串值生效。 */
  pattern?: RegExp
  /**
   * 自定义检查：返回错误文案即失败，返回空即通过；允许返回 Promise（远程校验）。
   * 第二个参数是整表值，跨字段规则从这里读取。
   */
  validator?: (value: unknown, values: FormValues) => string | undefined | null | Promise<string | undefined | null>
  /** 本条规则的文案，优先于模板。 */
  message?: string
}

/** 字段名 → 一条或一组规则。 */
export type FormRules = FormPathRecord<FormRule | FormRule[]>

/** 文案模板，{name}/{min}/{max} 现场代入；未提供时使用内置英文模板。 */
export interface FormValidateMessages {
  required?: string
  type?: Partial<Record<FormRuleType, string>>
  /** 字符串 / 数组的长度下限模板。 */
  minLength?: string
  maxLength?: string
  /** 数值的大小界限模板。 */
  minNumber?: string
  maxNumber?: string
  pattern?: string
}

/**
 * 表单排布：
 * - vertical：纵向一列（默认）。
 * - horizontal：标签左置为两列，整表标签列宽统一对齐。
 * - inline：字段横向排成一行流，放不下时自动换行。
 * - grid：字段排进等宽列的网格，列数由 columns 提供，单个字段可声明跨列。
 */
export type FormLayout = 'vertical' | 'horizontal' | 'inline' | 'grid'

/** grid 排布的列数取值：1 至 4，逐值对应一条皮肤规则。 */
export type FormColumnCount = 1 | 2 | 3 | 4

/** 逐档的列数：档与档之间自窄到宽依次接管，写了哪档就在哪档切换列数。 */
export interface FormColumnsByBreakpoint {
  /** 未达到任何断点时的列数，未提供时按一列排列。 */
  base?: FormColumnCount
  /** 视口宽度达到 sm 断点后的列数。 */
  sm?: FormColumnCount
  /** 视口宽度达到 md 断点后的列数。 */
  md?: FormColumnCount
  /** 视口宽度达到 lg 断点后的列数。 */
  lg?: FormColumnCount
  /** 视口宽度达到 xl 断点后的列数。 */
  xl?: FormColumnCount
}

/** 列数：整数即各档同一个列数；断点对象则逐档取值。 */
export type FormColumns = FormColumnCount | FormColumnsByBreakpoint

/**
 * 一个字段在网格中占的宽度：
 * - 1 至 4：固定跨该列数。
 * - full：占满整行，跟随当前的列数。
 */
export type FormFieldSpan = FormColumnCount | 'full'

/**
 * 校验的运行时机：
 * - submit：只在提交时运行，整表替换（默认）。
 * - blur：字段失去焦点时运行一次，只更新该字段的错误。
 * - change：字段值改动后运行一次，同样只更新该字段的错误。
 *
 * blur / change 两种模式下 validate 仍是整表运行（校验可能带跨字段规则），
 * 但只把当事字段的一条写回错误表。提交路径永远整表替换，与 validateOn 无关。
 */
export type FormValidateOn = 'submit' | 'blur' | 'change'

export interface FormValuesChangeDetails {
  values: FormValues
}

export interface FormErrorsChangeDetails {
  errors: FormErrors
}

export interface FormSubmitDetails {
  /** 通过校验的值。 */
  values: FormValues
}

export interface FormInvalidDetails {
  /** 本次提交拦截的全部错误。 */
  errors: FormErrors
  /** 提交时的值，与 errors 是同一时刻的快照。 */
  values: FormValues
}

/** 校验器执行异常，与字段填写错误分开；原始 cause 不转换为默认文案。 */
export interface FormValidationErrorDetails {
  cause: unknown
  /** 发生异常的值快照。 */
  values: FormValues
  /** null 表示整表提交校验；否则是触发校验的字段路径。 */
  field: FormPath | null
}

/** 一项仍有资格写回的校验任务。数组换序时它与字段和值快照一起迁移。 */
export interface FormValidationTask {
  /** 当前字段身份；整表校验为 null。 */
  field: FormPath | null
  /** 当前字段身份的稳定键，作为 validation Map 的键。 */
  key: string | null
  /** 与任务同行的值快照。 */
  values: FormValues
  pending: boolean
}

/**
 * 字段容器的声明：名字由作者声明，connect 据此产出 id、data-name 与失焦上报。
 * connect 不得反查 DOM：Vue 侧在 render 期求值（本帧 DOM 尚不存在）、WC 侧在 updated 后求值，
 * 读取 DOM 会使两个适配器的首帧快照分叉。
 */
export interface FormFieldGroupProps {
  /** 字段路径；字符串含点仍是单键，数组才表示嵌套层级。 */
  name: FormPath
  /**
   * grid 排布下该字段占的宽度：1 至 4 是固定跨列数，'full' 占满整行；未提供时占一列。
   * 范围外的值按未提供处理。'full' 跟随当前的列数，窄视口收为一列时它仍是一整行；
   * 写数字则是固定跨度，比当前列数大时会多撑出一列。
   * 其余三档排布下不参与排版。
   */
  span?: FormFieldSpan
}

/** 错误摘要中的一条：指向哪个字段由作者声明。 */
export interface FormErrorSummaryItemProps {
  name: FormPath
}

// 适配器在挂载前填入根元素 getter；纯逻辑测试与 SSR 下保持缺省，
// 此时 DOM 相关的动作（落焦、按文档序排序）一律短路，状态照常转移。
export interface FormRefs {
  /** 表单根节点（`<form>`）：字段容器的查询范围与落焦的起点。 */
  getRootEl: () => HTMLElement | null
  /** 当前有效的校验任务；null 表示整表提交，字符串表示字段。替换或删除即撤销写回资格。 */
  validation: Map<string | null, FormValidationTask>
  /**
   * 当前错误表中，哪些条目是本库自身校验计算出的。
   *
   * 不在该名单中的错误来自库外（作者预置的 defaultErrors、受控的 errors、
   * 服务端返回后经 setFieldError 写入的错误），字段一经编辑即清除。
   */
  validatedErrors: Set<string>
  /** 当前规则的可迁移副本；props 仍是下一次外部更新的来源。 */
  rules: FormRules | undefined
  rulesSource: FormRules | undefined
}

export interface FormSchema extends MachineSchema {
  props: {
    /** 受控值表；提供即受控：cell 直读 prop，写入只发 onValuesChange 不落内部值。 */
    values?: FormValues
    /** 非受控初值，同时也是 reset 的落点。 */
    defaultValues?: FormValues
    /** 受控错误表；提供即受控。空串会被清理（空串不是一条错误）。 */
    errors?: FormErrorPatch
    defaultErrors?: FormErrorPatch
    /**
     * 校验函数。返回字段名 → 错误文案，无错的字段给空串或省略；
     * 允许返回 Promise（远程校验），期间 validating 置真。
     * 与 rules 并用时同字段两边都报错按 rules 的文案计算。
     */
    validate?: (values: FormValues) => FormErrorPatch | Promise<FormErrorPatch>
    /** 声明式校验规则：字段名 → 一条或一组规则，与 validate 可并用。 */
    rules?: FormRules
    /** 规则文案模板，{name}/{min}/{max} 现场代入；未提供时使用内置英文模板。 */
    validateMessages?: FormValidateMessages
    /** 校验时机，默认 submit。 */
    validateOn?: FormValidateOn
    /** 排布，默认 vertical。 */
    layout?: FormLayout
    /**
     * grid 排布下的列数：1 至 4 的整数，未提供时按一列排列；范围外的值也按一列排列。
     * 也接受断点对象 `{ base, sm, md, lg, xl }`，逐档写各自的列数，未写的档沿用更窄的一档。
     * 其余三档排布下不参与排版。
     */
    columns?: FormColumns
    /** horizontal 下标签列宽（number 视作 px），整表统一、字段据此对齐。 */
    labelWidth?: number | string
    /** horizontal 下标签文字的对齐缘，默认 end（贴近控件）。 */
    labelAlign?: 'start' | 'end'
    /** 整个表单禁用：提交、重置、写值一概不发生，两个按钮带原生 disabled。 */
    disabled?: boolean
    /** 只读：写值与重置不发生，但仍可提交。 */
    readOnly?: boolean
    /** 值表变化意图回调；受控时是唯一出口，非受控时随内部写入一并通知。 */
    onValuesChange?: (details: FormValuesChangeDetails) => void
    /** 错误表变化意图回调；受控时是唯一出口。 */
    onErrorsChange?: (details: FormErrorsChangeDetails) => void
    /** 校验通过才调用。 */
    onSubmit?: (details: FormSubmitDetails) => void
    /** 校验不通过时调用，附带拦截的整张错误表。 */
    onInvalid?: (details: FormInvalidDetails) => void
    /** 校验器抛错或拒绝 Promise 时调用；不触发 onInvalid 或 onSubmit。 */
    onValidationError?: (details: FormValidationErrorDetails) => void
  }
  context: {
    /** 当前的值表。受控（values 提供）时 cell 直读 prop。 */
    values: FormValues
    /** 当前的错误表，已清理（在表中 = 当前有错）。受控（errors 提供）时 cell 直读 prop。 */
    errors: FormErrors
    /** 至少一项有效异步校验进行中；过期任务不再计入。 */
    validating: boolean
    /** 最近一次有效校验的执行异常；新校验、变值或重置时清除。 */
    validationError: FormValidationErrorDetails | null
  }
  computed: Record<string, never>
  refs: FormRefs
  /**
   * idle = 尚未提交失败过（错误摘要不显示，即使错误表非空）；
   * invalid = 上一次提交被拦截。
   */
  state: 'idle' | 'invalid'
  event:
    /** 提交意图（`<form>` 的 submit 事件与 api.submit 都经过它）。禁用时整条拦截。 */
    | { type: 'SUBMIT' }
    /** 重置意图：值与错误都回到 defaultValues / defaultErrors。 */
    | { type: 'RESET' }
    /** 校验完成且全部通过：附带该时刻的值，回调直接使用它，不再回头读取 context。 */
    | { type: 'VALIDATION.PASS', errors: FormErrors, values: FormValues }
    /**
     * 校验完成且有错。errors 随事件带出而不从 context 读取：
     * 错误表受控时 context.set 只发回调、不落值，此时回头读到的仍是宿主的旧表。
     */
    | { type: 'VALIDATION.FAIL', errors: FormErrors, values: FormValues }
    /** 写一个字段的值（api.setFieldValue）。change 模式下顺带校验该字段。 */
    | { type: 'FIELD.SET', name: FormPath, value: unknown }
    /** FieldArray 的结构变更。表单一次迁移所有跟随行号的状态。 */
    | { type: 'FIELD.ARRAY.MUTATE', name: FormPath, value: unknown[], mutation: FormArrayMutation }
    /** 焦点离开某个字段容器。blur 模式下据此校验该字段。 */
    | { type: 'FIELD.BLUR', name: FormPath }
    /** 写一个字段的错误（api.setFieldError）；空文案即清除该条。 */
    | { type: 'ERROR.SET', name: FormPath, message?: string }
    /** 清空整张错误表。 */
    | { type: 'ERRORS.CLEAR' }
    /** 把焦点送进某个字段（错误摘要中的链接点击时发出）。 */
    | { type: 'ERROR.FOCUS', name: FormPath }
  tag: never
  guard: 'isEnabled' | 'isEditable' | 'isValidationSnapshotCurrent'
  action:
    | 'setFieldValue'
    | 'mutateFieldArray'
    | 'clearExternalFieldError'
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
    | 'discardValidation'
    | 'discardStaleValidation'
    | 'syncRules'
  effect: never
}

export interface FormApi<T extends PropTypes = PropTypes> {
  /** 当前的值表。 */
  values: FormValues
  /** 当前的错误表（已清理）。 */
  errors: FormErrors
  /** 出错的字段名，插入顺序。 */
  errorNames: FormPath[]
  errorCount: number
  /** 错误表非空。与是否提交失败过无关，挂载时作者预置的错误也计入。 */
  invalid: boolean
  /** 上一次提交被拦截：错误摘要据此显示。 */
  submitFailed: boolean
  /** 异步校验进行中（提交或逐字段都计入）。 */
  validating: boolean
  /** 校验服务异常；null 表示没有异常，字段错误仍从 errors 读取。 */
  validationError: FormValidationErrorDetails | null
  disabled: boolean
  readOnly: boolean
  validateOn: FormValidateOn
  /** 当前的排布档。 */
  layout: FormLayout
  /** 字段容器的 DOM id；错误摘要的链接指向它。 */
  getFieldId: (name: FormPath) => string
  getFieldValue: (name: FormPath) => unknown
  /** 该字段当前的错误文案；无错时为 undefined。 */
  getFieldError: (name: FormPath) => string | undefined
  isFieldInvalid: (name: FormPath) => boolean
  /** 该字段的规则中声明了 required：字段的必填标记由此推导。 */
  isFieldRequired: (name: FormPath) => boolean
  /** 写一个字段的值；禁用或只读时不生效。 */
  setFieldValue: (name: FormPath, value: unknown) => void
  /** 写一个字段的错误；未提供文案（或提供空串）即清除该条。 */
  setFieldError: (name: FormPath, message?: string) => void
  clearErrors: () => void
  /** 执行完整的校验与提交流程，与用户按提交键走同一路径。 */
  submit: () => void
  /** 值与错误都回到初始；禁用或只读时不生效。 */
  reset: () => void
  getRootProps: () => T['element']
  getFieldGroupProps: (props: FormFieldGroupProps) => T['element']
  getErrorSummaryProps: () => T['element']
  getErrorSummaryItemProps: (props: FormErrorSummaryItemProps) => T['element']
  getSubmitTriggerProps: () => T['button']
  getResetTriggerProps: () => T['button']
}

/** 读屏文案。本组件目前没有需要外露的文案，保留该位。 */
export interface FormTranslations {}
