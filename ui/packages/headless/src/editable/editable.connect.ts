import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { EditableActivationMode, EditableApi, EditableSchema } from './editable.types'
import { dataAttr } from '@xihan-ui/core'
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
  // 值为空时预览区显示占位文字；占位也没给就是空字符串（作者自己决定要不要留位）
  const displayValue = empty ? (placeholder ?? '') : value
  const submitMode = prop('submitMode') ?? EDITABLE_DEFAULT_SUBMIT_MODE
  const activationMode: EditableActivationMode = prop('activationMode') ?? EDITABLE_DEFAULT_ACTIVATION_MODE
  const autoResize = !!prop('autoResize')
  const maxLength = prop('maxLength')
  const stateAttr = editing ? 'edit' : 'preview'
  // 预览区认不认交互：模式为 none、或整个控件不可编辑时，它就只是一段文字
  const previewActivates = interactive && activationMode !== 'none'

  /**
   * 预览区的 Tab 位：
   * - focus 模式下它是进编辑态的入口，必须占一个 Tab 位；
   * - 其余可编辑的模式给 -1：正常的键盘入口是 edit-trigger 那颗按钮，
   *   但退出编辑态时焦点要还回预览区，没有 tabindex 就 focus 不上去，焦点会掉进 body；
   * - 不可编辑时干脆不给：一个停下来什么都做不了的 Tab 位只会碍事。
   */
  const previewTabIndex = !interactive ? undefined : activationMode === 'focus' ? 0 : -1

  const startEdit = (src: 'preview' | 'edit-trigger' | 'label'): void => {
    if (interactive)
      send({ type: 'EDIT.START', src })
  }

  // 提交/取消按钮按下时把焦点摁在输入框里：按钮一旦抢走焦点，输入框先派 blur、
  // 机器当场按 submitMode 收尾并把按钮收起，随后那一下 click 就再也落不到按钮上
  // （submitMode=none 时更糟：blur 走的是撤销，用户点的明明是"保存"）
  const holdFocus = (event: { button?: number, preventDefault: () => void }): void => {
    // 只认主键：右键要留给上下文菜单
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
      // 预览区、输入框与三颗按钮在读屏那里是一件东西，靠 group 兜住，名字由 label 提供
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
      // for 指向真正的输入框：预览态它是收起的，点标题不会有任何反应，
      // 所以另接一条 onClick 把人送进编辑态——否则这块标题在预览态形同虚设
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
      // 编辑态收起而不是卸载：预览区是作者写的节点，替他删掉他就再也拿不回来
      'hidden': editing || undefined,
      'tabindex': previewTabIndex,
      // 预览区是个普通节点、挂不了原生 disabled，只能显式说明；
      // 省略是"没说"，显式 false 是"明确说了不是"，读屏对两者处理不同
      'aria-disabled': disabled ? 'true' : 'false',
      'data-state': stateAttr,
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid),
      // 显示的是占位文字而不是真值，皮肤据此把颜色压淡
      'data-placeholder': dataAttr(empty),
      // 皮肤据此决定光标形状：认交互的才给 text 光标
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
        // 退出编辑态时焦点是从自己那个输入框还回来的，这一下不能再把人送回编辑态，
        // 否则 focus 模式下一提交就被拽回去，永远出不来。
        // 判据用输入框的 id（每个实例各不相同），同页两个 editable 不会互相误伤
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
      // 原生 maxlength 负责挡住键盘输入（还带来输入法与粘贴的正确行为），
      // 机器侧的截断负责挡住绕过键盘的那一路，两道并存不是重复
      'maxlength': maxLength,
      // 宽度跟着内容走：size 是纯粹由值算出来的，连接层因此不必去量 DOM
      'size': autoResize ? editableInputSize(value, placeholder) : undefined,
      'disabled': disabled || undefined,
      'readonly': readOnly || undefined,
      // 作者把 label 换成非 <label> 元素时 for 会失效，这条兜住名字
      'aria-labelledby': ids.label,
      'aria-invalid': invalid ? 'true' : 'false',
      'data-state': stateAttr,
      'data-disabled': dataAttr(disabled),
      'data-invalid': dataAttr(invalid),
      'data-auto-resize': dataAttr(autoResize),
      // 预览态收起而不是卸载：常挂着才留得住输入法状态与作者挂在它身上的东西
      'hidden': !editing || undefined,
      'onInput': (event: Event) => {
        send({ type: 'VALUE.SET', value: (event.target as HTMLInputElement).value })
      },
      // 失焦的收尾归机器判（EDIT.LEAVE 只在编辑态被接住）：
      // 退出编辑态时我们会主动把焦点还给预览区，输入框随之派一条 blur，
      // 那一条落在预览态上无人接管，正是想要的结果
      'onBlur': () => send({ type: 'EDIT.LEAVE', src: 'blur' }),
      'onKeyDown': (event: KeyboardEvent) => {
        if (!editing || event.ctrlKey || event.metaKey || event.altKey)
          return
        if (event.key === 'Escape') {
          // 拦下浏览器自己那套 Escape（部分浏览器会把输入框回滚到默认值），
          // 免得两套撤销各撤各的
          event.preventDefault()
          send({ type: 'EDIT.CANCEL', src: 'escape' })
          return
        }
        if (event.key === 'Enter') {
          // 这个模式下回车不算提交就把键原样交回去：多行输入靠它换行，
          // 外层表单靠它提交，吞掉等于把这两条路一起堵死
          if (!submitsOnEnter(submitMode))
            return
          // 拦下的是"顺带提交外层 form"这条默认行为：提交由组件自己收口
          event.preventDefault()
          send({ type: 'EDIT.SUBMIT', src: 'enter' })
          return
        }
        if (event.key === 'Tab') {
          // 不拦默认行为：Tab 得照常把焦点送到下一个控件去，
          // 这里只决定这次编辑怎么收尾（提交还是撤销，由 submitMode 说了算）
          send({ type: 'EDIT.LEAVE', src: 'tab' })
        }
      },
    }),

    getEditTriggerProps: () => normalize.button({
      ...parts['edit-trigger'].attrs,
      'type': 'button',
      'aria-controls': ids.input,
      // 单体控件用原生 disabled（不是集合条目那套 aria-disabled）：
      // 只给 data-disabled 的话按钮照样可聚焦、读屏照念"可点"，按下去却什么都不发生
      'disabled': !interactive || undefined,
      'data-disabled': dataAttr(!interactive),
      // 编辑态里它没有活儿干，收起而不是卸载
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
