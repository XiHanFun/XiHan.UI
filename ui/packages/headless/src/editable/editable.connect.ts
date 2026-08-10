import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { EditableActivationMode, EditableApi, EditableSchema } from './editable.types'
import { dataAttr, isComposingEvent } from '@xihan-ui/kernel'
import { editableAnatomy } from './editable.anatomy'
import {
  EDITABLE_DEFAULT_ACTIVATION_MODE,
  EDITABLE_DEFAULT_SUBMIT_MODE,
  editableInputSize,
  submitsOnEnter,
} from './editable.machine'

const parts = editableAnatomy.build()

export function connectEditable<T extends PropTypes>(
  service: Service<EditableSchema>,
  normalize: NormalizeProps<T>,
): EditableApi<T> {
  const { state, prop, send, context, scope } = service
  const ids = scope.ids('editable', 'label', 'preview', 'input')

  const editing = state.get() === 'edit'
  const value = context.get('value')
  const committedValue = context.get('committedValue')
  const empty = value === ''
  const disabled = !!prop('disabled')
  const readOnly = !!prop('readOnly')
  const invalid = !!prop('invalid')
  const interactive = !disabled && !readOnly
  const placeholder = prop('placeholder')
  const displayValue = empty ? (placeholder ?? '') : value
  const submitMode = prop('submitMode') ?? EDITABLE_DEFAULT_SUBMIT_MODE
  const activationMode: EditableActivationMode = prop('activationMode') ?? EDITABLE_DEFAULT_ACTIVATION_MODE
  const autoResize = !!prop('autoResize')
  const maxLength = prop('maxLength')
  const stateAttr = editing ? 'edit' : 'preview'
  const previewActivates = interactive && activationMode !== 'none'

  // -1 这档不能删：退出编辑态要把焦点还回预览区，没有 tabindex 就 focus 不上去
  const previewTabIndex = !interactive ? undefined : activationMode === 'focus' ? 0 : -1

  const startEdit = (src: 'preview' | 'edit-trigger' | 'label'): void => {
    if (interactive)
      send({ type: 'EDIT.START', src })
  }

  // 提交/取消按钮按下时把焦点摁在输入框里：按钮抢走焦点会让输入框先派 blur、机器按
  // submitMode 收尾并把按钮收起，那一下 click 就落不到按钮上了
  const holdFocus = (event: { button?: number, preventDefault: () => void }): void => {
    // 只认主键，右键留给上下文菜单
    if (event.button != null && event.button !== 0)
      return
    event.preventDefault()
  }

  return {
    value,
    committedValue,
    editing,
    empty,
    displayValue,
    disabled,
    readOnly,
    invalid,
    interactive,
    setValue: next => send({ type: 'VALUE.SET', value: next }),
    edit: () => startEdit('edit-trigger'),
    submit: () => send({ type: 'EDIT.SUBMIT' }),
    cancel: () => send({ type: 'EDIT.CANCEL' }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'role': 'group',
      'aria-labelledby': ids.label,
      'data-state': stateAttr,
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid),
      'data-empty': dataAttr(empty),
    }),

    getLabelProps: () => normalize.label({
      ...parts.label.attrs,
      'id': ids.label,
      // 预览态输入框是收起的，点 label 不会触发原生行为，靠下面的 onClick 进编辑态
      'for': ids.input,
      'data-state': stateAttr,
      'data-disabled': dataAttr(disabled),
      'onClick': () => {
        if (previewActivates && !editing)
          startEdit('label')
      },
    }),

    getAreaProps: () => normalize.element({
      ...parts.area.attrs,
      'data-state': stateAttr,
      'data-disabled': dataAttr(disabled),
      'data-invalid': dataAttr(invalid),
    }),

    getPreviewProps: () => normalize.element({
      ...parts.preview.attrs,
      'id': ids.preview,
      // 用 hidden 收起而非卸载：节点由作者提供，卸载后拿不回来
      'hidden': editing || undefined,
      'tabindex': previewTabIndex,
      // 预览区挂不了原生 disabled；这里必须显式 'false' 而非省略，读屏对两者处理不同
      'aria-disabled': disabled ? 'true' : 'false',
      'data-state': stateAttr,
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid),
      // 供皮肤区分"显示的是占位文字"与"显示的是真值"
      'data-placeholder': dataAttr(empty),
      // 供皮肤决定光标形状
      'data-activation-mode': activationMode,
      'onClick': () => {
        if (activationMode === 'click')
          startEdit('preview')
      },
      'onDblClick': () => {
        if (activationMode === 'dblclick')
          startEdit('preview')
      },
      'onFocus': (event: FocusEvent) => {
        if (activationMode !== 'focus')
          return
        // 焦点从本实例输入框还回来的这一下不得再进编辑态，否则 focus 模式一提交就被拽回去
        const from = event.relatedTarget as { id?: string } | null
        if (from?.id === ids.input)
          return
        startEdit('preview')
      },
    }),

    getInputProps: () => normalize.input({
      ...parts.input.attrs,
      'id': ids.input,
      'type': 'text',
      'name': prop('name'),
      'value': value,
      'placeholder': placeholder,
      // 原生 maxlength 挡键盘输入这一路，机器侧截断挡绕过键盘的那一路，两道并存
      'maxlength': maxLength,
      // connect 在 render 期求值、不得读 DOM，宽度只能用由值算出的原生 size
      'size': autoResize ? editableInputSize(value, placeholder) : undefined,
      'disabled': disabled || undefined,
      'readonly': readOnly || undefined,
      // label 部件若不是 <label> 元素，for 会失效，靠这条兜住可访问名
      'aria-labelledby': ids.label,
      'aria-invalid': invalid ? 'true' : 'false',
      'data-state': stateAttr,
      'data-disabled': dataAttr(disabled),
      'data-invalid': dataAttr(invalid),
      'data-auto-resize': dataAttr(autoResize),
      // 用 hidden 收起而非卸载：常挂着才留得住输入法状态与作者挂在节点上的东西
      'hidden': !editing || undefined,
      'onInput': (event: Event) => {
        send({ type: 'VALUE.SET', value: (event.target as HTMLInputElement).value })
      },
      // 收尾归机器判：EDIT.LEAVE 只在编辑态被接住，退出时还焦点带出的那条 blur 无人接管
      'onBlur': () => send({ type: 'EDIT.LEAVE', src: 'blur' }),
      'onKeyDown': (event: KeyboardEvent) => {
        if (!editing || event.ctrlKey || event.metaKey || event.altKey)
          return
        // 组合期间的按键属于输入法候选框，组件一律不接
        if (isComposingEvent(event))
          return
        if (event.key === 'Escape') {
          // 拦下浏览器自带的 Escape 回滚（部分浏览器会把输入框还原到默认值），免得两套撤销打架
          event.preventDefault()
          send({ type: 'EDIT.CANCEL', src: 'escape' })
          return
        }
        if (event.key === 'Enter') {
          // 回车不算提交时把键原样交回去：多行输入靠它换行、外层表单靠它提交
          if (!submitsOnEnter(submitMode))
            return
          // 拦下"顺带提交外层 form"的默认行为，提交由组件收口
          event.preventDefault()
          send({ type: 'EDIT.SUBMIT', src: 'enter' })
          return
        }
        if (event.key === 'Tab') {
          // 不拦默认行为，Tab 照常移焦；这里只决定这次编辑按 submitMode 提交还是撤销
          send({ type: 'EDIT.LEAVE', src: 'tab' })
        }
      },
    }),

    getEditTriggerProps: () => normalize.button({
      ...parts['edit-trigger'].attrs,
      'type': 'button',
      'aria-controls': ids.input,
      // 用原生 disabled 而非 aria-disabled：只给 data-disabled 的话按钮仍可聚焦、读屏仍念"可点"
      'disabled': !interactive || undefined,
      'data-disabled': dataAttr(!interactive),
      'hidden': editing || undefined,
      'data-state': stateAttr,
      'onClick': () => startEdit('edit-trigger'),
    }),

    getSubmitTriggerProps: () => normalize.button({
      ...parts['submit-trigger'].attrs,
      'type': 'button',
      'disabled': !editing || undefined,
      'data-disabled': dataAttr(!editing),
      'hidden': !editing || undefined,
      'data-state': stateAttr,
      'onPointerDown': (event: PointerEvent) => holdFocus(event),
      'onClick': () => {
        if (editing)
          send({ type: 'EDIT.SUBMIT', src: 'submit-trigger' })
      },
    }),

    getCancelTriggerProps: () => normalize.button({
      ...parts['cancel-trigger'].attrs,
      'type': 'button',
      'disabled': !editing || undefined,
      'data-disabled': dataAttr(!editing),
      'hidden': !editing || undefined,
      'data-state': stateAttr,
      'onPointerDown': (event: PointerEvent) => holdFocus(event),
      'onClick': () => {
        if (editing)
          send({ type: 'EDIT.CANCEL', src: 'cancel-trigger' })
      },
    }),

    getControlProps: () => normalize.element({
      ...parts.control.attrs,
      'data-state': stateAttr,
      'data-disabled': dataAttr(disabled),
    }),
  }
}
