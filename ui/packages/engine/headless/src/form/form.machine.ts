import type { Params } from '@xihan-ui/core'
import type { FormErrors } from './form.errors'
import type { FormSchema, FormValidateOn, FormValues } from './form.types'
import { focusFirst, focusSafely, getTabbables, queryItems, setup } from '@xihan-ui/core'
import { formFieldGroupQuery, formFieldName } from './form.anatomy'
import { firstFormErrorName, formErrorNames, mergeFormErrors, normalizeFormErrors, sameFormErrors } from './form.errors'
import { runFormRules } from './form.rules'

const { createMachine, guards } = setup<FormSchema>()
const { not } = guards

/** 校验时机缺省：只在提交时校验。 */
export const FORM_DEFAULT_VALIDATE_ON: FormValidateOn = 'submit'

/** 缺省值收口在一处，机器与连接层都读它。 */
export function formValidateOn(mode: FormValidateOn | undefined): FormValidateOn {
  return mode ?? FORM_DEFAULT_VALIDATE_ON
}

/** 写一个字段的值，返回新表；值没变就原样返回同一份引用。 */
export function setFormFieldValue(values: FormValues, name: string, value: unknown): FormValues {
  if (Object.hasOwn(values, name) && Object.is(values[name], value))
    return values
  return { ...values, [name]: value }
}

/**
 * 两张值表逐键比。
 * 不能用 cell 默认的 Object.is：受控宿主每次重渲都可能交来一份内容相同的新表，引用恒不相等。
 */
export function sameFormValues(a: FormValues, b: FormValues | undefined): boolean {
  if (!b)
    return false
  const keys = Object.keys(a)
  if (keys.length !== Object.keys(b).length)
    return false
  return keys.every(key => Object.hasOwn(b, key) && Object.is(a[key], b[key]))
}

/**
 * 表单里全部字段名，文档序。
 *
 * 只在事件那一刻调用，此时两个适配器看到的是同一份活 DOM。渲染期不得调用：
 * 那里 Vue 读到的是上一帧、WC 读到的是本帧，两侧会分叉。
 */
export function formFieldOrder(root: HTMLElement | null): string[] {
  const out: string[] = []
  for (const el of queryItems(root, formFieldGroupQuery)) {
    const name = formFieldName(el)
    // 同一个字段拆成好几块渲染时只算最靠前的那一处
    if (name != null && !out.includes(name))
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
export function focusFormField(root: HTMLElement | null, name: string): boolean {
  const group = queryItems(root, formFieldGroupQuery).find(el => formFieldName(el) === name)
  if (!group)
    return false
  if (!focusFirst(getTabbables(group)))
    focusSafely(group)
  return true
}

/**
 * 跑一次整表校验（校验可能带跨字段规则），但只把 name 这一条写回错误表。
 * 转异步时置 validating，晚到的结果按字段各自的批次号判弃。
 */
function validateOneField(params: Params<FormSchema>, values: FormValues, name: string): void {
  const validate = params.prop('validate')
  const rules = params.prop('rules')
  if (!validate && !rules?.[name])
    return
  const tracker = params.refs.get('validation')
  const seq = (tracker.fieldSeq[name] = (tracker.fieldSeq[name] ?? 0) + 1)
  const settle = (all: FormErrors): void => {
    if (tracker.fieldSeq[name] !== seq)
      return
    params.context.set('validating', false)
    params.context.set('errors', mergeFormErrors(params.context.get('errors'), { [name]: all[name] }))
  }
  const outcome = runFormRules(
    rules?.[name] ? { [name]: rules[name]! } : undefined,
    validate,
    values,
    params.prop('validateMessages'),
  )
  if (outcome instanceof Promise) {
    params.context.set('validating', true)
    void outcome.then(settle)
    return
  }
  settle(outcome)
}

// 值表与错误表住在 context 的 cell 里（给定 prop 即受控：读直取 prop、写只发回调不落内部值）。
// 状态只编码"上一次提交有没有被拦下"，它不受控、也没有对应的 prop。
export const formMachine = createMachine({
  name: 'form',
  refs: () => ({
    getRootEl: () => null,
    validation: { seq: 0, fieldSeq: {} },
  }),
  context: ({ prop, cell }) => ({
    values: cell<FormValues>(() => ({
      value: prop('values'),
      defaultValue: prop('defaultValues') ?? {},
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
  }),
  // 挂载即 idle：作者预置的 defaultErrors 不该让错误摘要一上来就显形
  initialState: () => 'idle',
  on: {
    'FIELD.SET': [
      // 禁用/只读整条吃掉，连 onValuesChange 都不发：受控宿主收到意图会照写，等于绕过禁用
      { guard: not('isEditable') },
      { actions: ['setFieldValue', 'validateChangedField'] },
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
        'VALIDATION.FAIL': { target: 'invalid', actions: ['invokeInvalid', 'focusFirstError'] },
        'VALIDATION.PASS': { actions: ['invokeSubmit'] },
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
        'VALIDATION.FAIL': { actions: ['invokeInvalid', 'focusFirstError'] },
        'VALIDATION.PASS': { target: 'idle', actions: ['invokeSubmit'] },
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
    },
    actions: {
      setFieldValue: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'FIELD.SET')
          return
        context.set('values', setFormFieldValue(context.get('values'), e.name, e.value))
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
       * 转异步时置 validating；再次提交或重置把批次号顶掉，晚到的旧结果整批作废。
       */
      runValidation: ({ prop, context, refs, send }) => {
        const values = context.get('values')
        const validate = prop('validate')
        const rules = prop('rules')
        const tracker = refs.get('validation')
        const seq = ++tracker.seq
        const settle = (errors: FormErrors): void => {
          if (tracker.seq !== seq)
            return
          context.set('validating', false)
          context.set('errors', errors)
          send(formErrorNames(errors).length > 0
            ? { type: 'VALIDATION.FAIL', errors, values }
            : { type: 'VALIDATION.PASS', errors, values })
        }
        if (!validate && !rules) {
          settle(context.get('errors'))
          return
        }
        const outcome = runFormRules(rules, validate, values, prop('validateMessages'))
        if (outcome instanceof Promise) {
          context.set('validating', true)
          void outcome.then(settle)
          return
        }
        settle(outcome)
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

      setFieldError: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'ERROR.SET')
          return
        context.set('errors', mergeFormErrors(context.get('errors'), { [e.name]: e.message }))
      },

      clearErrors: ({ context }) => {
        // 本来就空就别写，写一份新的空表会让受控宿主白重渲一轮
        if (formErrorNames(context.get('errors')).length === 0)
          return
        context.set('errors', {})
      },

      /**
       * 回到初始。落点取 prop 的当下值而不是挂载时的快照，
       * 宿主换了 defaultValues（如编辑另一条记录）时重置回到新的那一份。
       * 批次号整体顶掉：还在天上飞的异步校验结果落地时一律作废。
       */
      resetForm: ({ prop, context, refs }) => {
        const tracker = refs.get('validation')
        tracker.seq++
        for (const name of Object.keys(tracker.fieldSeq))
          tracker.fieldSeq[name]!++
        context.set('validating', false)
        context.set('values', { ...(prop('defaultValues') ?? {}) })
        context.set('errors', normalizeFormErrors(prop('defaultErrors')))
      },
    },
  },
})
