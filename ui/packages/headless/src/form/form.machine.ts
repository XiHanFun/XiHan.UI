import type { Params } from '@xihan-ui/machine'
import type { FormErrors } from './form.errors'
import type { FormSchema, FormValidateOn, FormValues } from './form.types'
import { focusFirst, focusSafely, getTabbables, queryItems } from '@xihan-ui/behavior'
import { setup } from '@xihan-ui/machine'
import { formFieldGroupQuery, formFieldName } from './form.anatomy'
import { firstFormErrorName, formErrorNames, mergeFormErrors, normalizeFormErrors, sameFormErrors } from './form.errors'

const { createMachine, guards } = setup<FormSchema>()
const { not } = guards

/** 校验时机缺省：只在提交时校验。填到一半就开始报错是最招人烦的一种表单。 */
export const FORM_DEFAULT_VALIDATE_ON: FormValidateOn = 'submit'

/** 缺省收口在一处：机器与连接层都读它，两边各写一个 `?? 'submit'` 迟早会漂。 */
export function formValidateOn(mode: FormValidateOn | undefined): FormValidateOn {
  return mode ?? FORM_DEFAULT_VALIDATE_ON
}

/**
 * 写一个字段的值，返回新表；值没变就原样返回同一份引用。
 *
 * 不变就不换引用这件事是有用的：受控宿主拿引用做重渲判据，
 * 每次敲同一个字符都换一份新表会让整张表单跟着重渲一遍。
 */
export function setFormFieldValue(values: FormValues, name: string, value: unknown): FormValues {
  if (Object.hasOwn(values, name) && Object.is(values[name], value))
    return values
  return { ...values, [name]: value }
}

/**
 * 两张值表逐键比。
 * cell 默认的 Object.is 在这里不成立：受控宿主每次重渲都可能交来一份内容相同的新表，
 * 引用恒不相等——版本号会每读一次自增一次，onValuesChange 也会为"其实没变"重复发。
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
 * 只在事件那一刻调用：那一拍两个适配器看到的是同一份活 DOM，顺序天然是文档序，
 * 字段的增删（分步表单、条件字段）无需记账。渲染期不得调用——
 * 那里 Vue 读到的是上一帧、WC 读到的是本帧，两侧会分叉。
 */
export function formFieldOrder(root: HTMLElement | null): string[] {
  const out: string[] = []
  for (const el of queryItems(root, formFieldGroupQuery)) {
    const name = formFieldName(el)
    // 同一个字段拆成好几块渲染时只算最靠前的那一处：焦点该去的就是它
    if (name != null && !out.includes(name))
      out.push(name)
  }
  return out
}

/**
 * 把焦点送进某个字段。
 *
 * 落点是容器里第一个可聚焦控件，而不是容器本身：用户到了那儿就该能直接改，
 * 停在外面那层 div 上还得再按一次 Tab。控件全都禁用（或作者压根没放控件）时
 * 退回容器自身——它带着 tabindex=-1，至少让读屏念出这个字段，
 * 而不是把键盘用户丢在 body 上。
 *
 * 返回是否真找到了这个字段的容器。
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
 * 跑一次整表校验，但只把 name 这一条写回错误表。
 *
 * 整表跑是因为校验常有跨字段规则（确认密码要和密码一致）；只写回一条是因为
 * 逐字段校验只该动用户刚碰过的那个字段——整表写回会把他还没填到的字段全部标红。
 */
function validateOneField(params: Params<FormSchema>, values: FormValues, name: string): void {
  const validate = params.prop('validate')
  if (!validate)
    return
  const all = normalizeFormErrors(validate(values))
  params.context.set('errors', mergeFormErrors(params.context.get('errors'), { [name]: all[name] }))
}

// 值表与错误表都住在 context 的 cell 里（cell 本身就是受控/非受控的收口点：
// 给定 prop 即受控，读直取 prop、写只发回调不落内部值），所以这两路不需要影子事件。
// 状态只编码"上一次提交有没有被拦下"这一件事，它不受控、也没有对应的 prop。
export const formMachine = createMachine({
  name: 'form',
  refs: () => ({
    getRootEl: () => null,
  }),
  context: ({ prop, cell }) => ({
    values: cell<FormValues>(() => ({
      value: prop('values'),
      defaultValue: prop('defaultValues') ?? {},
      isEqual: sameFormValues,
      onChange: values => prop('onValuesChange')?.({ values }),
    })),
    errors: cell<FormErrors>(() => ({
      // 受控的错误表也要过清理：空串在作者那儿是"这条没错"的惯用写法，
      // 原样收下会让它一直算作有错，表单就再也提交不出去了
      value: prop('errors') === undefined ? undefined : normalizeFormErrors(prop('errors')),
      defaultValue: normalizeFormErrors(prop('defaultErrors')),
      isEqual: sameFormErrors,
      onChange: errors => prop('onErrorsChange')?.({ errors }),
    })),
  }),
  // 挂载即 idle：错误摘要是"提交失败"的回执，作者预置的 defaultErrors 不该让它一上来就显形
  initialState: () => 'idle',
  on: {
    'FIELD.SET': [
      // 禁用/只读：整条吃掉，连 onValuesChange 都不发——受控宿主收到意图会照写，
      // 那等于绕过了禁用
      { guard: not('isEditable') },
      { actions: ['setFieldValue', 'validateChangedField'] },
    ],
    'FIELD.BLUR': [
      { guard: not('isEnabled') },
      { actions: ['validateBlurredField'] },
    ],
    // 错误表是作者的命令式口子，与 disabled/readOnly 无关：
    // 服务端返回的错误照样要能挂到一个只读表单上
    'ERROR.SET': { actions: ['setFieldError'] },
    'ERRORS.CLEAR': { actions: ['clearErrors'] },
    'ERROR.FOCUS': { actions: ['focusField'] },
  },
  states: {
    idle: {
      on: {
        'SUBMIT': [
          { guard: not('isEnabled') },
          // 校验跑完才知道去哪儿，所以这里只跑校验、由它送出 PASS / FAIL 再转移。
          // 把"跑校验"写进守卫的话，同一次提交会把 validate 跑两遍
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
        // 又没过：状态不变，但错误要重报一次、焦点也要重新送回第一个错处——
        // 用户改了几处又提交，落点该跟着变
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
        // 按事件重算一份"写完之后"的值表，而不是回头读 context：
        // 值受控时上一条动作只发了回调、没落值，此刻 context 里还是宿主的旧表，
        // 校验就会拿着上一个字符的值去判这一次输入
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
       * 提交这一路：整表跑、整表替换，与 validateOn 无关。
       * 没给 validate 就沿用当下的错误表——作者可能自己在管错误（服务端返回的那种），
       * 此时"没有校验函数"不等于"没有错误"。
       */
      runValidation: ({ prop, context, send }) => {
        const values = context.get('values')
        const validate = prop('validate')
        const errors = validate ? normalizeFormErrors(validate(values)) : context.get('errors')
        context.set('errors', errors)
        send(formErrorNames(errors).length > 0
          ? { type: 'VALIDATION.FAIL', errors, values }
          : { type: 'VALIDATION.PASS', errors, values })
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
       * 必须推迟一拍：这一刻宿主还没把这批错误渲上去，字段容器可能刚随条件分支挂出来、
       * 也可能还带着上一帧的样子，当场按文档序取到的会是旧答案。
       * 推迟后要再确认一次仍在失败态——中途若又提交成功或被重置，
       * 这条回调就不该再去抢焦点。
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
      // 推迟反而会让焦点在浏览器处理完这次点击之后才动，中间闪一下 body
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
        // 本来就空就别写：写一份新的空表会让受控宿主白重渲一轮
        if (formErrorNames(context.get('errors')).length === 0)
          return
        context.set('errors', {})
      },

      /**
       * 回到初始。落点取 prop 的当下值而不是挂载时的快照：
       * 表单常在切换记录后换一份 defaultValues（编辑另一条数据），
       * 那时重置该回到新的那一份。
       */
      resetForm: ({ prop, context }) => {
        context.set('values', { ...(prop('defaultValues') ?? {}) })
        context.set('errors', normalizeFormErrors(prop('defaultErrors')))
      },
    },
  },
})
