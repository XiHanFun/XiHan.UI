import type { Params } from '@xihan-ui/core'
import type { FormErrors } from './form.errors'
import type { FormPath } from './form.path'
import type { FormSchema, FormValidateOn, FormValidationErrorDetails, FormValues } from './form.types'
import { focusFirst, focusSafely, getTabbables, queryItems, setup } from '@xihan-ui/core'
import { formFieldGroupQuery, formFieldName } from './form.anatomy'
import { firstFormErrorName, formErrorNames, mergeFormErrors, normalizeFormErrors, sameFormErrors } from './form.errors'
import { runFormRules } from './form.rules'
import { cloneFormPathRecord, formPathKey, getFormPathValue, sameFormPathRecords, setFormPathValue } from './form.path'

const { createMachine, guards } = setup<FormSchema>()
const { not } = guards

/** 校验时机缺省：只在提交时校验。 */
export const FORM_DEFAULT_VALIDATE_ON: FormValidateOn = 'submit'

/** 缺省值收口在一处，机器与连接层都读它。 */
export function formValidateOn(mode: FormValidateOn | undefined): FormValidateOn {
  return mode ?? FORM_DEFAULT_VALIDATE_ON
}

/** 写一个字段的值，返回新表；值没变就原样返回同一份引用。 */
export function setFormFieldValue(values: FormValues, name: FormPath, value: unknown): FormValues {
  return setFormPathValue(values, name, value)
}

/**
 * 两张值表逐键比。
 * 不能用 cell 默认的 Object.is：受控宿主每次重渲都可能交来一份内容相同的新表，引用恒不相等。
 */
export function sameFormValues(a: FormValues, b: FormValues | undefined): boolean {
  if (!b)
    return false
  return sameFormPathRecords(a, b)
}

/**
 * 表单里全部字段名，文档序。
 *
 * 只在事件那一刻调用，此时两个适配器看到的是同一份活 DOM。渲染期不得调用：
 * 那里 Vue 读到的是上一帧、WC 读到的是本帧，两侧会分叉。
 */
export function formFieldOrder(root: HTMLElement | null): FormPath[] {
  const out: FormPath[] = []
  for (const el of queryItems(root, formFieldGroupQuery)) {
    const name = formFieldName(el)
    // 同一个字段拆成好几块渲染时只算最靠前的那一处
    if (name != null && !out.some(path => formPathKey(path) === formPathKey(name)))
      out.push(name)
  }
  return out
}

/**
 * 把焦点送进某个字段。
 *
 * 落点是容器里第一个可聚焦控件；控件全禁用或作者没放控件时退回容器自身
 * （它带着 tabindex=-1）。返回是否找到了这个字段的容器。
 */
export function focusFormField(root: HTMLElement | null, name: FormPath): boolean {
  const key = formPathKey(name)
  const group = queryItems(root, formFieldGroupQuery).find(el => formFieldName(el) != null && formPathKey(formFieldName(el)!) === key)
  if (!group)
    return false
  if (!focusFirst(getTabbables(group)))
    focusSafely(group)
  return true
}

/** 忙碌状态来自有效任务，单个字段完成不能覆盖其他字段的状态。 */
function syncValidating({ context, refs }: Params<FormSchema>): void {
  context.set('validating', [...refs.get('validation').values()].some(task => task.pending))
}

function discardValidation({ context, refs }: Params<FormSchema>): void {
  refs.get('validation').clear()
  context.set('validating', false)
  context.set('validationError', null)
}

/** 同字段只保留最新任务；任务持有值快照，删除后即使 Promise 完成也不能写回。 */
function beginValidation(params: Params<FormSchema>, values: FormValues, field: FormPath | null): { pending: () => void, complete: () => boolean } {
  const running = params.refs.get('validation')
  const task = { values: cloneFormPathRecord(values), pending: false }
  running.set(field == null ? null : formPathKey(field), task)
  params.context.set('validationError', null)
  syncValidating(params)
  return {
    pending: (): void => {
      if (running.get(field == null ? null : formPathKey(field)) !== task)
        return
      task.pending = true
      syncValidating(params)
    },
    complete: (): boolean => {
      if (running.get(field == null ? null : formPathKey(field)) !== task)
        return false
      running.delete(field == null ? null : formPathKey(field))
      syncValidating(params)
      return sameFormValues(task.values, params.context.get('values'))
    },
  }
}

/** 校验执行与结果落地分开：只捕获校验器异常，不把用户事件处理器抛错当成校验失败。 */
function executeValidation(
  params: Params<FormSchema>,
  values: FormValues,
  field: FormPath | null,
  validate: () => FormErrors | Promise<FormErrors>,
  apply: (errors: FormErrors) => void,
): void {
  const task = beginValidation(params, values, field)
  const fail = (cause: unknown): void => {
    if (!task.complete())
      return
    discardValidation(params)
    const details: FormValidationErrorDetails = { cause, values: cloneFormPathRecord(values), field: Array.isArray(field) ? [...field] : field }
    params.context.set('validationError', details)
    params.prop('onValidationError')?.(details)
  }
  let outcome: FormErrors | Promise<FormErrors>
  try {
    outcome = validate()
  }
  catch (cause) {
    fail(cause)
    return
  }
  const settle = (errors: FormErrors): void => {
    if (task.complete())
      apply(errors)
  }
  if (outcome instanceof Promise) {
    task.pending()
    void outcome.then(settle, fail)
  }
  else {
    settle(outcome)
  }
}

/** 跑一次校验（可能读取整表），但只把当前字段写回错误表。 */
function validateOneField(params: Params<FormSchema>, values: FormValues, name: FormPath): void {
  const validate = params.prop('validate')
  const rules = params.prop('rules')
  const rule = getFormPathValue(rules, name)
  if (!validate && !rule)
    return
  const settle = (all: FormErrors): void => {
    // 这一条的来源改记成「校验算出来的」：接下来再编辑这个字段不该把它抹掉
    const validated = params.refs.get('validatedErrors')
    const key = formPathKey(name)
    const error = getFormPathValue(all, name)
    if (error)
      validated.add(key)
    else
      validated.delete(key)
    params.context.set('errors', mergeFormErrors(params.context.get('errors'), setFormPathValue({}, name, error)))
  }
  executeValidation(
    params,
    values,
    name,
    () => runFormRules(
      rule ? setFormPathValue({}, name, rule) : undefined,
      validate,
      values,
      params.prop('validateMessages'),
    ),
    settle,
  )
}

// 值表与错误表住在 context 的 cell 里（给定 prop 即受控：读直取 prop、写只发回调不落内部值）。
// 状态只编码"上一次提交有没有被拦下"，它不受控、也没有对应的 prop。
export const formMachine = createMachine({
  name: 'form',
  refs: () => ({
    getRootEl: () => null,
    validation: new Map(),
    // 空表起步：作者预置的 defaultErrors 不是校验算出来的，编辑那个字段就该让它走
    validatedErrors: new Set<string>(),
  }),
  context: ({ prop, cell }) => ({
    values: cell<FormValues>(() => ({
      value: prop('values'),
      defaultValue: cloneFormPathRecord(prop('defaultValues')),
      isEqual: sameFormValues,
      onChange: values => prop('onValuesChange')?.({ values }),
    })),
    errors: cell<FormErrors>(() => ({
      // 受控的错误表也要过清理：空串是"这条没错"，原样收下会让它一直算作有错
      value: prop('errors') === undefined ? undefined : normalizeFormErrors(prop('errors')),
      defaultValue: normalizeFormErrors(prop('defaultErrors')),
      isEqual: sameFormErrors,
      onChange: errors => prop('onErrorsChange')?.({ errors }),
    })),
    validating: cell<boolean>(() => ({ defaultValue: false })),
    validationError: cell<FormValidationErrorDetails | null>(() => ({ defaultValue: null })),
  }),
  // 挂载即 idle：作者预置的 defaultErrors 不该让错误摘要一上来就显形
  initialState: () => 'idle',
  exit: ['discardValidation'],
  watch: ({ track, prop, context, action }) => {
    track([context.dep('values'), () => prop('values')], () => action(['discardStaleValidation']))
  },
  on: {
    'FIELD.SET': [
      // 禁用/只读整条吃掉，连 onValuesChange 都不发：受控宿主收到意图会照写，等于绕过禁用
      { guard: not('isEditable') },
      { actions: ['setFieldValue', 'clearExternalFieldError', 'validateChangedField'] },
    ],
    'FIELD.BLUR': [
      { guard: not('isEnabled') },
      { actions: ['validateBlurredField'] },
    ],
    // 错误表是命令式口子，与 disabled/readOnly 无关：服务端返回的错误也要能挂到只读表单上
    'ERROR.SET': { actions: ['setFieldError'] },
    'ERRORS.CLEAR': { actions: ['clearErrors'] },
    'ERROR.FOCUS': { actions: ['focusField'] },
  },
  states: {
    idle: {
      on: {
        'SUBMIT': [
          { guard: not('isEnabled') },
          // 这里只跑校验，由它送出 PASS / FAIL 再转移。
          // 把跑校验写进守卫的话，同一次提交会把 validate 跑两遍
          { actions: ['runValidation'] },
        ],
        'VALIDATION.FAIL': { guard: 'isValidationSnapshotCurrent', target: 'invalid', actions: ['invokeInvalid', 'focusFirstError'] },
        'VALIDATION.PASS': { guard: 'isValidationSnapshotCurrent', actions: ['invokeSubmit'] },
        'RESET': [
          { guard: not('isEditable') },
          { actions: ['resetForm'] },
        ],
      },
    },
    invalid: {
      on: {
        'SUBMIT': [
          { guard: not('isEnabled') },
          { actions: ['runValidation'] },
        ],
        // 又没过：状态不变，但错误重报一次、焦点也重新送回第一个错处
        'VALIDATION.FAIL': { guard: 'isValidationSnapshotCurrent', actions: ['invokeInvalid', 'focusFirstError'] },
        'VALIDATION.PASS': { guard: 'isValidationSnapshotCurrent', target: 'idle', actions: ['invokeSubmit'] },
        'RESET': [
          { guard: not('isEditable') },
          { target: 'idle', actions: ['resetForm'] },
        ],
      },
    },
  },
  implementations: {
    guards: {
      isEnabled: ({ prop }) => !prop('disabled'),
      isEditable: ({ prop }) => !prop('disabled') && !prop('readOnly'),
      isValidationSnapshotCurrent: ({ context, event }) => {
        const e = event.current()
        return (e.type === 'VALIDATION.PASS' || e.type === 'VALIDATION.FAIL') && sameFormValues(e.values, context.get('values'))
      },
    },
    actions: {
      discardValidation,
      discardStaleValidation: (params) => {
        const running = params.refs.get('validation')
        const values = params.context.get('values')
        for (const [key, task] of running) {
          if (!sameFormValues(task.values, values))
            running.delete(key)
        }
        const error = params.context.get('validationError')
        if (error && !sameFormValues(error.values, values))
          params.context.set('validationError', null)
        syncValidating(params)
      },
      setFieldValue: (params) => {
        const { context, event } = params
        const e = event.current()
        if (e.type !== 'FIELD.SET')
          return
        const current = context.get('values')
        const next = setFormFieldValue(current, e.name, e.value)
        if (next !== current)
          discardValidation(params)
        context.set('values', next)
      },

      /**
       * 编辑一个字段就清掉它身上那条来自库外的错误。
       *
       * 服务端返回的错误是经 setFieldError 写进来的，本库的校验不认识它：validateOn
       * 是 submit 时两次提交之间没有任何一条路径会重算它，而 validate 与 rules 都没给
       * 的表单连提交那一路的整表替换也不发生——用户照着提示改完，错误还挂在原处。
       * 校验自己算出来的那几条不动，它们由下一次校验负责收回。
       */
      clearExternalFieldError: ({ context, event, refs }) => {
        const e = event.current()
        if (e.type !== 'FIELD.SET' || refs.get('validatedErrors').has(formPathKey(e.name)))
          return
        context.set('errors', mergeFormErrors(context.get('errors'), setFormPathValue({}, e.name, undefined)))
      },

      validateChangedField: (params) => {
        const e = params.event.current()
        if (e.type !== 'FIELD.SET' || formValidateOn(params.prop('validateOn')) !== 'change')
          return
        // 按事件重算一份"写完之后"的值表，不回头读 context：
        // 值受控时上一条动作只发了回调、没落值，此刻 context 里还是宿主的旧表
        const next = setFormFieldValue(params.context.get('values'), e.name, e.value)
        validateOneField(params, next, e.name)
      },

      validateBlurredField: (params) => {
        const e = params.event.current()
        if (e.type !== 'FIELD.BLUR' || formValidateOn(params.prop('validateOn')) !== 'blur')
          return
        validateOneField(params, params.context.get('values'), e.name)
      },

      /**
       * 提交这一路：整表跑（声明式规则 + validate 函数）、整表替换，与 validateOn 无关。
       * 两边都没给就沿用当下的错误表，作者可能自己在管错误（如服务端返回的）。
       * 整表提交取代先前的校验任务；变值、重置或卸载撤销旧快照，不自动重提。
       */
      runValidation: (params) => {
        const { prop, context, refs, send } = params
        const values = context.get('values')
        const validate = prop('validate')
        const rules = prop('rules')
        discardValidation(params)
        // computed=true 是真跑过一轮：整表被替换掉，这张表整个记成校验算出来的，
        // 库外写进来的那几条随旧表一起作废。什么都没跑的那一路照旧不动来源登记。
        const computed = !!(validate || rules)
        const settle = (errors: FormErrors): void => {
          if (computed) {
            const validated = refs.get('validatedErrors')
            validated.clear()
            for (const name of formErrorNames(errors))
              validated.add(formPathKey(name))
          }
          context.set('errors', errors)
          send(formErrorNames(errors).length > 0
            ? { type: 'VALIDATION.FAIL', errors, values }
            : { type: 'VALIDATION.PASS', errors, values })
        }
        executeValidation(
          params,
          values,
          null,
          () => computed ? runFormRules(rules, validate, values, prop('validateMessages')) : context.get('errors'),
          settle,
        )
      },

      invokeSubmit: ({ prop, event }) => {
        const e = event.current()
        if (e.type === 'VALIDATION.PASS')
          prop('onSubmit')?.({ values: e.values })
      },

      invokeInvalid: ({ prop, event }) => {
        const e = event.current()
        if (e.type === 'VALIDATION.FAIL')
          prop('onInvalid')?.({ errors: e.errors, values: e.values })
      },

      /**
       * 提交失败后把焦点送到第一个出错的字段。
       *
       * 必须推迟一拍：这一刻宿主还没把这批错误渲上去，当场按文档序取到的是旧答案。
       * 推迟后要再确认一次仍在失败态，中途若又提交成功或被重置就不该再抢焦点。
       */
      focusFirstError: ({ refs, event, state, flush }) => {
        const e = event.current()
        if (e.type !== 'VALIDATION.FAIL')
          return
        const { errors } = e
        flush(() => {
          if (state.get() !== 'invalid')
            return
          const root = refs.get('getRootEl')()
          // 无 DOM 环境（纯逻辑测试 / SSR）：状态照常转移，只是不搬焦点
          if (!root)
            return
          const name = firstFormErrorName(formFieldOrder(root), errors)
          if (name != null)
            focusFormField(root, name)
        })
      },

      // 错误摘要里的链接点了就走这条。不推迟：点击那一刻 DOM 就是活的，
      // 推迟会让焦点在浏览器处理完这次点击之后才动，中间闪一下 body
      focusField: ({ refs, event }) => {
        const e = event.current()
        if (e.type === 'ERROR.FOCUS')
          focusFormField(refs.get('getRootEl')(), e.name)
      },

      setFieldError: ({ context, event, refs }) => {
        const e = event.current()
        if (e.type !== 'ERROR.SET')
          return
        // 命令式写进来的这条归库外，哪怕它顶掉的是校验刚算出来的同名错误
        refs.get('validatedErrors').delete(formPathKey(e.name))
        context.set('errors', mergeFormErrors(context.get('errors'), setFormPathValue({}, e.name, e.message)))
      },

      clearErrors: ({ context, refs }) => {
        refs.get('validatedErrors').clear()
        // 本来就空就别写，写一份新的空表会让受控宿主白重渲一轮
        if (formErrorNames(context.get('errors')).length === 0)
          return
        context.set('errors', {})
      },

      /**
       * 回到初始。落点取 prop 的当下值而不是挂载时的快照，
       * 宿主换了 defaultValues（如编辑另一条记录）时重置回到新的那一份。
       * 清空有效任务：还在进行的异步校验结果一律作废。
       */
      resetForm: (params) => {
        const { prop, context, refs } = params
        discardValidation(params)
        // 落回去的是 defaultErrors，那份归库外
        refs.get('validatedErrors').clear()
        context.set('values', cloneFormPathRecord(prop('defaultValues')))
        context.set('errors', normalizeFormErrors(prop('defaultErrors')))
      },
    },
  },
})
