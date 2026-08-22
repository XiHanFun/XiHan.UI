import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { TextFieldApi, TextFieldSchema, TextFieldTranslations } from './text-field.types'
import { dataAttr, isComposingEvent } from '@xihan-ui/kernel'
import { textFieldAnatomy } from './text-field.anatomy'
import { autoSizeTextarea } from './text-field.autosize'
import { isAtLimit } from './text-field.machine'

const parts = textFieldAnatomy.build()

function resolveTranslations(input: Partial<TextFieldTranslations> | undefined): TextFieldTranslations {
  return {
    clearTrigger: input?.clearTrigger ?? 'Clear',
  }
}

export function connectTextField<T extends PropTypes>(
  service: Service<TextFieldSchema>,
  normalize: NormalizeProps<T>,
): TextFieldApi<T> {
  const { prop, send, context, scope } = service
  const ids = scope.ids('text-field', 'label', 'input')
  const label = resolveTranslations(prop('translations'))

  const value = context.get('value')
  const empty = value === ''
  const disabled = !!prop('disabled')
  const readOnly = !!prop('readOnly')
  const invalid = !!prop('invalid')
  const clearable = !!prop('clearable')
  const maxLength = prop('maxLength')
  const editable = !disabled && !readOnly
  const atLimit = isAtLimit(value, maxLength)
  const autoSize = prop('autoSize') ?? false
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
    autoSize,
    setValue: next => send({ type: 'VALUE.SET', value: next }),
    clear: () => send({ type: 'VALUE.CLEAR' }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      // 三个视觉轴只落在 root，子部件从这里继承皮肤声明的私有槽
      'data-variant': prop('variant'),
      'data-tone': prop('tone'),
      'data-size': prop('size'),
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid),
      'data-empty': dataAttr(empty),
      'data-at-limit': dataAttr(atLimit),
    }),

    // 视觉盒：写了这个节点就由它画描边、底色与聚焦环，输入框与清空按钮排在它里面；
    // 不写时输入框自己当盒
    getControlProps: () => normalize.element({
      ...parts.control.attrs,
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid),
      'data-at-limit': dataAttr(atLimit),
    }),

    getLabelProps: () => normalize.label({
      ...parts.label.attrs,
      'id': ids.label,
      // for 指向真正的 input，不是外层包裹节点：指到不可标注的元素上，点标题不会聚焦
      'for': ids.input,
      'data-disabled': dataAttr(disabled),
    }),

    getInputProps: (input = {}) => normalize.input({
      ...parts.input.attrs,
      'id': ids.input,
      // textarea 没有 type 属性
      'type': (input.as ?? 'input') === 'textarea' ? undefined : (prop('type') ?? 'text'),
      'name': prop('name'),
      'value': value,
      'placeholder': prop('placeholder'),
      // 多行宿主首帧先按 minRows 站好，量高补在挂载后
      'rows': (input.as ?? 'input') === 'textarea' && typeof autoSize === 'object' ? autoSize.minRows : undefined,
      // 原生 maxlength 挡键盘输入，机器侧的截断挡绕过键盘的那一路，两道并存
      'maxlength': maxLength,
      'disabled': disabled || undefined,
      'readonly': readOnly || undefined,
      'required': prop('required') || undefined,
      // 作者把 label 换成非 <label> 元素时 for 会失效，这条兜住名字
      'aria-labelledby': ids.label,
      // 显式 true/false：省略是没说，显式 false 是明确说了不是
      'aria-invalid': invalid ? 'true' : 'false',
      // 皮肤只认 data-*、不认标签名，多行宿主的排版靠这一条认出来
      'data-multiline': dataAttr((input.as ?? 'input') === 'textarea'),
      'data-autosize': dataAttr((input.as ?? 'input') === 'textarea' && !!autoSize),
      'data-disabled': dataAttr(disabled),
      'data-invalid': dataAttr(invalid),
      'data-at-limit': dataAttr(atLimit),
      'onInput': (event: Event) => {
        const el = event.target as HTMLInputElement | HTMLTextAreaElement
        send({ type: 'VALUE.SET', value: el.value })
        if ((input.as ?? 'input') === 'textarea')
          autoSizeTextarea(el as HTMLTextAreaElement, autoSize)
      },
      'onKeyDown': (event: KeyboardEvent) => {
        // 组合期间的按键属于输入法候选框，组件一律不接
        if (isComposingEvent(event))
          return
        if (event.key !== 'Escape' || event.ctrlKey || event.metaKey || event.altKey)
          return
        // 不可清空时不吞键：Escape 在输入框里还有外层浮层消解、输入法候选框收起等去处
        if (!canClear)
          return
        // 拦下浏览器自己那套 Escape 行为，部分浏览器会把输入框回滚到默认值
        event.preventDefault()
        send({ type: 'VALUE.CLEAR' })
      },
    }),

    getClearTriggerProps: () => normalize.button({
      ...parts['clear-trigger'].attrs,
      'type': 'button',
      // 不占 Tab 位（键盘用户走 Escape），但读屏按虚拟光标仍找得到它
      'tabindex': -1,
      'aria-label': label.clearTrigger,
      // 没开 clearable 或此刻清不了时按钮收起而不是卸载，节点是作者写的
      'hidden': !canClear || undefined,
      'onPointerDown': (event: PointerEvent) => {
        // 只认主键，右键留给上下文菜单
        if (event.button !== 0)
          return
        // 焦点留在输入框，清完还能接着打字
        event.preventDefault()
      },
      'onClick': () => {
        if (!canClear)
          return
        send({ type: 'VALUE.CLEAR' })
        // 清完把焦点送回输入框，接着打字不用再点一次
        scope.getById(ids.input)?.focus()
      },
    }),
  }
}
