import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { FormApi, FormSchema } from './form.types'
import { contains, dataAttr } from '@xihan-ui/core'
import { FORM_FIELD_NAME_ATTR, formAnatomy, formFieldId } from './form.anatomy'
import { formErrorNames } from './form.errors'
import { formValidateOn } from './form.machine'

const parts = formAnatomy.build()

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
  // 摘要是"这次提交被拦下了"的回执：错误全改完了就该撤下去，
  // 哪怕状态还停在失败态（下一次提交成功才会回 idle）
  const summaryVisible = submitFailed && invalid

  const fieldError = (name: string): string | undefined => errors[name]

  return {
    values,
    errors,
    errorNames,
    errorCount,
    invalid,
    submitFailed,
    disabled,
    readOnly,
    validateOn,
    getFieldId: name => formFieldId(scope, name),
    getFieldValue: name => values[name],
    getFieldError: fieldError,
    isFieldInvalid: name => fieldError(name) !== undefined,
    setFieldValue: (name, value) => send({ type: 'FIELD.SET', name, value }),
    setFieldError: (name, message) => send({ type: 'ERROR.SET', name, message }),
    clearErrors: () => send({ type: 'ERRORS.CLEAR' }),
    submit: () => send({ type: 'SUBMIT' }),
    reset: () => send({ type: 'RESET' }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      // 浏览器自带的约束校验一律关掉：它会用自己的气泡挡在页面上，
      // 与本组件的错误摘要各说各话，而且首个不合规的控件会让 submit 事件压根不派发。
      // 写空串而不是 true：两个适配器对布尔属性的落法不同（一边 novalidate=""、
      // 一边 novalidate="true"），空串是"属性在场"的统一写法，两侧落出的 DOM 才逐字相同
      'novalidate': '',
      'data-state': stateAttr,
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid),
      'onSubmit': (event: Event) => {
        // 一律拦：提交走组件自己的校验与回调，绝不让浏览器把整页导航掉。
        // 禁用时同样要拦——不拦的话，一个"禁用"的表单反而会真的提交出去
        event.preventDefault()
        // 连冒泡一并掐断：提交已经完全由本组件接管，这条原生事件再往上冒只会与
        // 组件自己派发的同名语义事件撞在一起（WC 侧尤其明显——两者都从宿主元素上冒出去，
        // 作者听一个名字会收到两条，其中一条还是永远被拦下的空事件）
        event.stopPropagation()
        send({ type: 'SUBMIT' })
      },
      'onReset': (event: Event) => {
        // 重置的默认行为（把原生控件还原成各自的初始值）是有用的，正常放行：
        // 作者用的常是非受控的原生控件，拦掉它们就还原不回去了。
        // 只有在改不动的时候才拦——状态不重置，DOM 也不该单方面重置
        if (!editable)
          event.preventDefault()
        send({ type: 'RESET' })
      },
    }),

    // 刻意不给 role：无名字的 role=group 对读屏只是多一层噪音，
    // 字段的名字与描述由里面那个 Field 自己接线。这里只负责身份、状态与失焦上报
    getFieldGroupProps: field => normalize.element({
      ...parts['field-group'].attrs,
      // 摘要里的链接指向它，落焦时又要按同一个身份反查回来
      'id': formFieldId(scope, field.name),
      [FORM_FIELD_NAME_ATTR]: field.name,
      // 容器里的控件全禁用时，焦点至少落得到这块区域上
      'tabindex': -1,
      'data-invalid': dataAttr(fieldError(field.name) !== undefined),
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'onFocusOut': (event: FocusEvent) => {
        const group = event.currentTarget as HTMLElement | null
        // 焦点还在本字段内部（从输入框挪到旁边的单位选择器）不算离场：
        // 按一次就校验一次，用户还没填完就先挨一顿红字
        if (contains(group, event.relatedTarget as Node | null))
          return
        send({ type: 'FIELD.BLUR', name: field.name })
      },
    }),

    getErrorSummaryProps: () => normalize.element({
      ...parts['error-summary'].attrs,
      // 自带 id：作者常要从页面别处指过来（跳转链接、aria-describedby），
      // 没有稳定 id 的话他只能自己再造一个，同页多个表单就会撞名
      'id': ids['error-summary'],
      // role=alert 自带 assertive 活区：从收起翻成显出的那一刻读屏立刻播报，
      // 键盘用户不必自己去找哪里出了错
      'role': 'alert',
      'data-state': stateAttr,
      // 皮肤据此做"共 N 处错误"这类修饰，作者不必再自己数一遍
      'data-count': String(errorCount),
      // 常挂 + hidden：作者写在里面的节点不卸载
      'hidden': !summaryVisible || undefined,
    }),

    getErrorSummaryItemProps: item => normalize.element({
      ...parts['error-summary-item'].attrs,
      // 指向字段容器的片段标识。写成真链接而不是按钮：读屏会把它归进链接列表，
      // 用户因此能用链接导航直接跳到出错的地方
      'href': `#${formFieldId(scope, item.name)}`,
      [FORM_FIELD_NAME_ATTR]: item.name,
      'data-invalid': dataAttr(fieldError(item.name) !== undefined),
      // 作者一次把所有字段的条目都写上，这里按当下的错误表决定谁露面
      'hidden': fieldError(item.name) === undefined || undefined,
      'onClick': (event: MouseEvent) => {
        // 拦掉浏览器自己那套锚点跳转：它只滚动、不搬焦点（容器不是可聚焦元素时更是什么都不做），
        // 而且会往历史里塞一条哈希记录，用户按返回键就退回到摘要出现前
        event.preventDefault()
        send({ type: 'ERROR.FOCUS', name: item.name })
      },
    }),

    // 就是一颗原生的提交键：提交事件由 <form> 统一收口（回车的隐式提交也走那儿），
    // 这里再挂一个 onClick 会让一次点击提交两遍
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
      // 只读表单也重置不了：重置就是在写值
      'disabled': !editable || undefined,
      'data-disabled': dataAttr(!editable),
    }),
  }
}
