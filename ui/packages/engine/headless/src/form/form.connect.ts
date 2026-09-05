import type { NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { FormApi, FormColumns, FormColumnsByBreakpoint, FormFieldSpan, FormSchema } from './form.types'
import { contains, dataAttr } from '@xihan-ui/core'
import { FORM_FIELD_NAME_ATTR, formAnatomy, formFieldId } from './form.anatomy'
import { formErrorNames } from './form.errors'
import { formValidateOn } from './form.machine'
import { hasRequiredRule } from './form.rules'

const parts = formAnatomy.build()

/** 断点档位，自窄到宽。 */
const COLUMN_BREAKPOINTS = ['sm', 'md', 'lg', 'xl'] as const

/** 列数与跨列的取值上限，与皮肤逐值写出的那一批规则同一个范围。 */
const MAX_COLUMN_COUNT = 4

/**
 * 列数落成字符串，两个适配器写到 DOM 上的值一致；没给就不写这个属性。
 * 只有 1 到上限的整数落得下去，0、负数、小数与超出上限的一律按没写算——
 * 类型只管得住 TypeScript 那一路，特性写的是字符串、property 也收得下任意数字，
 * 落一个皮肤没有规则接的值，等于既不生效又看不出写错在哪。
 */
function columnTier(value: number | undefined): string | undefined {
  if (value == null || !Number.isInteger(value) || value < 1 || value > MAX_COLUMN_COUNT)
    return undefined
  return String(value)
}

/** 逐档落到 DOM 上的字符串，档位名与断点令牌同名。 */
type ColumnTiers = Record<'base' | typeof COLUMN_BREAKPOINTS[number], string | undefined>

/**
 * 列数归一成五档字符串：给整数或不给时只有 base 那一格有值；
 * 给断点对象时逐档取，没写的档是 undefined。
 */
function columnTiers(value: FormColumns | undefined): ColumnTiers {
  const byTier: FormColumnsByBreakpoint = value != null && typeof value === 'object' ? value : { base: value }
  const out = { base: columnTier(byTier.base) } as ColumnTiers
  for (const at of COLUMN_BREAKPOINTS)
    out[at] = columnTier(byTier[at])
  return out
}

/** 跨列落成字符串：'full' 原样落下，数字走列数那一套范围判定。 */
function fieldSpan(value: FormFieldSpan | undefined): string | undefined {
  return value === 'full' ? 'full' : columnTier(value)
}

export function connectForm<T extends PropTypes>(
  service: Service<FormSchema>,
  normalize: NormalizeProps<T>,
): FormApi<T> {
  const { state, prop, send, context, scope } = service
  const ids = scope.ids('form', 'error-summary')

  const values = context.get('values')
  const errors = context.get('errors')
  const errorNames = formErrorNames(errors)
  const errorCount = errorNames.length
  const invalid = errorCount > 0
  const submitFailed = state.get() === 'invalid'
  const disabled = !!prop('disabled')
  const readOnly = !!prop('readOnly')
  const editable = !disabled && !readOnly
  const validateOn = formValidateOn(prop('validateOn'))
  const stateAttr = submitFailed ? 'invalid' : 'idle'
  // 错误全改完就撤下摘要，此时状态仍停在失败态（下一次提交成功才回 idle）
  const summaryVisible = submitFailed && invalid

  const fieldError = (name: string): string | undefined => errors[name]

  return {
    values,
    errors,
    errorNames,
    errorCount,
    invalid,
    submitFailed,
    validating: context.get('validating'),
    disabled,
    readOnly,
    validateOn,
    layout: prop('layout') ?? 'vertical',
    getFieldId: name => formFieldId(scope, name),
    getFieldValue: name => values[name],
    getFieldError: fieldError,
    isFieldInvalid: name => fieldError(name) !== undefined,
    isFieldRequired: name => hasRequiredRule(prop('rules')?.[name]),
    setFieldValue: (name, value) => send({ type: 'FIELD.SET', name, value }),
    setFieldError: (name, message) => send({ type: 'ERROR.SET', name, message }),
    clearErrors: () => send({ type: 'ERRORS.CLEAR' }),
    submit: () => send({ type: 'SUBMIT' }),
    reset: () => send({ type: 'RESET' }),

    getRootProps: () => {
      // 列数逐档落成 data-columns 与 data-columns-<档>，哪一档在多宽的视口上接管由皮肤定
      const columns = columnTiers(prop('columns'))
      return normalize.element({
        ...parts.root.attrs,
        // 关掉浏览器自带的约束校验：首个不合规的控件会让 submit 事件压根不派发。
        // 值写空串不写 true：两个适配器对布尔属性的落法不同，空串两侧落出的 DOM 才逐字相同
        'novalidate': '',
        'data-state': stateAttr,
        'data-layout': prop('layout'),
        'data-columns': columns.base,
        'data-columns-sm': columns.sm,
        'data-columns-md': columns.md,
        'data-columns-lg': columns.lg,
        'data-columns-xl': columns.xl,
        'data-label-align': prop('labelAlign'),
        // 标签列宽写成 CSS 变量：横排下整表字段照它对齐
        'style': prop('labelWidth') != null
          ? { '--xh-form-label-w': typeof prop('labelWidth') === 'number' ? `${prop('labelWidth')}px` : String(prop('labelWidth')) }
          : undefined,
        'data-disabled': dataAttr(disabled),
        'data-readonly': dataAttr(readOnly),
        'data-invalid': dataAttr(invalid),
        'onSubmit': (event: Event) => {
          // 一律拦，包括禁用时：不拦则禁用的表单会真的提交出去
          event.preventDefault()
          // WC 侧组件自己派发同名语义事件，这条原生事件再往上冒会让作者收到两条
          event.stopPropagation()
          send({ type: 'SUBMIT' })
        },
        'onReset': (event: Event) => {
          // 放行重置的默认行为，非受控的原生控件靠它还原成初始值；只在改不动时才拦
          if (!editable)
            event.preventDefault()
          send({ type: 'RESET' })
        },
      })
    },

    // 不给 role：字段的名字与描述由里面的 Field 自己接线，这里只负责身份、状态与失焦上报
    getFieldGroupProps: field => normalize.element({
      ...parts['field-group'].attrs,
      // 摘要链接与落焦反查都按这个 id 找容器
      'id': formFieldId(scope, field.name),
      [FORM_FIELD_NAME_ATTR]: field.name,
      // 容器里的控件全禁用时，焦点至少落得到这块区域上
      'tabindex': -1,
      // 网格排布下这一格占多宽，其余排布下皮肤不接这个属性
      'data-span': fieldSpan(field.span),
      'data-invalid': dataAttr(fieldError(field.name) !== undefined),
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'onFocusOut': (event: FocusEvent) => {
        const group = event.currentTarget as HTMLElement | null
        // 焦点还在本字段内部（如从输入框挪到旁边的单位选择器）不算离场，不触发校验
        if (contains(group, event.relatedTarget as Node | null))
          return
        send({ type: 'FIELD.BLUR', name: field.name })
      },
    }),

    getErrorSummaryProps: () => normalize.element({
      ...parts['error-summary'].attrs,
      // 自带稳定 id，供作者从页面别处指过来（跳转链接、aria-describedby）
      'id': ids['error-summary'],
      // 一次提交失败里唯一打断当前朗读的活区：摘要带着错误条数与逐条链接，
      // 字段与字段集那两处错误文案只排队不打断。
      // live 值显式写出：role 隐含的 live 各家读屏落实并不一致
      'role': 'alert',
      'aria-live': 'assertive',
      // 整份摘要一起念，否则用户只听到半截
      'aria-atomic': 'true',
      'data-state': stateAttr,
      // 皮肤据此渲染"共 N 处错误"这类修饰
      'data-count': String(errorCount),
      // 常挂 + hidden：作者写在里面的节点不卸载
      'hidden': !summaryVisible || undefined,
    }),

    getErrorSummaryItemProps: item => normalize.element({
      ...parts['error-summary-item'].attrs,
      // 指向字段容器的片段标识。写成真链接而非按钮，读屏才会把它归进链接列表
      'href': `#${formFieldId(scope, item.name)}`,
      [FORM_FIELD_NAME_ATTR]: item.name,
      'data-invalid': dataAttr(fieldError(item.name) !== undefined),
      // 作者一次把所有字段的条目都写上，这里按当下的错误表决定谁露面
      'hidden': fieldError(item.name) === undefined || undefined,
      'onClick': (event: MouseEvent) => {
        // 拦掉原生锚点跳转：它只滚动不搬焦点，还会往历史里塞一条哈希记录
        event.preventDefault()
        send({ type: 'ERROR.FOCUS', name: item.name })
      },
    }),

    // 原生提交键：提交事件由 <form> 统一收口，这里再挂 onClick 会让一次点击提交两遍
    getSubmitTriggerProps: () => normalize.button({
      ...parts['submit-trigger'].attrs,
      'type': 'submit',
      // 单体控件用原生 disabled（集合条目才用 aria-disabled）
      'disabled': disabled || undefined,
      'data-disabled': dataAttr(disabled),
    }),

    getResetTriggerProps: () => normalize.button({
      ...parts['reset-trigger'].attrs,
      'type': 'reset',
      // 只读表单也重置不了，重置就是在写值
      'disabled': !editable || undefined,
      'data-disabled': dataAttr(!editable),
    }),
  }
}
