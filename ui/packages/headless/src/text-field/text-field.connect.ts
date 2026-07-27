import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { TextFieldApi, TextFieldSchema } from './text-field.types'
import { dataAttr } from '@xihan-ui/core'
import { textFieldAnatomy } from './text-field.anatomy'
import { isAtLimit } from './text-field.machine'

const parts = textFieldAnatomy.build()

export function connectTextField<T extends PropTypes>(
  service: Service<TextFieldSchema>,
  normalize: NormalizeProps<T>,
): TextFieldApi<T> {
  const { prop, send, context, scope } = service
  const ids = scope.ids('text-field', 'label', 'input')

  const value = context.get('value')
  const empty = value === ''
  const disabled = !!prop('disabled')
  const readOnly = !!prop('readOnly')
  const invalid = !!prop('invalid')
  const clearable = !!prop('clearable')
  const maxLength = prop('maxLength')
  const editable = !disabled && !readOnly
  const atLimit = isAtLimit(value, maxLength)
  // 与机器里 canClear 守卫同义。两处都要：这里决定按钮长什么样，那里挡住绕过 DOM 的调用
  const canClear = clearable && editable && !empty

  return {
    value,
    empty,
    disabled,
    readOnly,
    invalid,
    clearable,
    atLimit,
    canClear,
    setValue: next => send({ type: 'VALUE.SET', value: next }),
    clear: () => send({ type: 'VALUE.CLEAR' }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid),
      'data-empty': dataAttr(empty),
      'data-at-limit': dataAttr(atLimit),
    }),

    getLabelProps: () => normalize.label({
      ...parts.label.attrs,
      'id': ids.label,
      // for 指向真正的 input，不是外层包裹节点：指到不可标注的元素上，
      // 点标题不会聚焦、读屏也拿不到控件的名字，两头都断
      'for': ids.input,
      'data-disabled': dataAttr(disabled),
    }),

    getInputProps: () => normalize.input({
      ...parts.input.attrs,
      'id': ids.input,
      'type': 'text',
      'name': prop('name'),
      'value': value,
      'placeholder': prop('placeholder'),
      // 原生 maxlength 负责挡住键盘输入（还带来输入法与粘贴的正确行为），
      // 机器侧的截断负责挡住绕过键盘的那一路，两道并存不是重复
      'maxlength': maxLength,
      'disabled': disabled || undefined,
      'readonly': readOnly || undefined,
      'required': prop('required') || undefined,
      // 作者把 label 换成非 <label> 元素时 for 会失效，这条兜住名字
      'aria-labelledby': ids.label,
      // 显式 true/false：省略是"没说"，显式 false 是"明确说了不是"，读屏对两者处理不同
      'aria-invalid': invalid ? 'true' : 'false',
      'data-disabled': dataAttr(disabled),
      'data-invalid': dataAttr(invalid),
      'data-at-limit': dataAttr(atLimit),
      'onInput': (event: Event) => {
        send({ type: 'VALUE.SET', value: (event.target as HTMLInputElement).value })
      },
      'onKeyDown': (event: KeyboardEvent) => {
        if (event.key !== 'Escape' || event.ctrlKey || event.metaKey || event.altKey)
          return
        // 不可清空时一个字都不动，也不吞键：Escape 在输入框里还有别的去处
        // （外层浮层的消解、输入法候选框的收起），这里没活儿干就不该把它拦下
        if (!canClear)
          return
        // 拦下浏览器自己那套 Escape 行为（部分浏览器会把输入框回滚到默认值），
        // 免得两套清空各清各的
        event.preventDefault()
        send({ type: 'VALUE.CLEAR' })
      },
    }),

    getClearTriggerProps: () => normalize.button({
      ...parts['clear-trigger'].attrs,
      'type': 'button',
      // 与数字框的加减按钮同一套取舍：键盘用户走 Escape，按钮只是指针用户的快捷方式。
      // 暴露给读屏等于把同一个能力报两遍，还会在 Tab 序里多出一站
      'tabindex': -1,
      'aria-hidden': true,
      // 没开 clearable 时按钮收起而不是卸载：节点是作者写的，替他删掉他就再也拿不回来。
      // 留一个永远点不动的按钮杵在那儿看着像坏了，所以也不能只置灰
      'hidden': !clearable || undefined,
      'disabled': !canClear || undefined,
      'data-disabled': dataAttr(!canClear),
      'onPointerDown': (event: PointerEvent) => {
        // 只认主键：右键要留给上下文菜单
        if (event.button !== 0)
          return
        // 焦点留在输入框：按钮抢走焦点后，用户清完还想接着打字就得再点回去
        event.preventDefault()
      },
      'onClick': () => {
        if (canClear)
          send({ type: 'VALUE.CLEAR' })
      },
    }),
  }
}
