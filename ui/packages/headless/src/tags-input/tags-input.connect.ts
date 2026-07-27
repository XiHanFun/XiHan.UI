import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { TagsInputApi, TagsInputItemProps, TagsInputSchema } from './tags-input.types'
import { ITEM_VALUE_ATTR } from '@xihan-ui/behavior'
import { contains, dataAttr } from '@xihan-ui/core'
import { tagsInputAnatomy, tagsInputEditInputId } from './tags-input.anatomy'
import { appendTags, isAtMax, isOverflow, splitTags, tagsDelimiter } from './tags-input.machine'

const parts = tagsInputAnatomy.build()

/**
 * 光标是不是贴着输入框最左端、且没有选区。
 * 取不到选区（个别输入类型不支持 selectionStart）时按"在最左"处理：
 * 那种框本来就没有光标可言，一律不接管反而让方向键彻底走不通。
 */
function atInputStart(el: HTMLInputElement): boolean {
  const start = el.selectionStart
  const end = el.selectionEnd
  return (start == null || start === 0) && (end == null || end === 0)
}

export function connectTagsInput<T extends PropTypes>(
  service: Service<TagsInputSchema>,
  normalize: NormalizeProps<T>,
): TagsInputApi<T> {
  const { context, prop, send, scope, state } = service
  const ids = scope.ids('tags-input', 'label', 'input')

  const value = context.get('value')
  const inputValue = context.get('inputValue')
  const count = value.length
  const disabled = !!prop('disabled')
  const readOnly = !!prop('readOnly')
  const invalid = !!prop('invalid')
  const editable = !disabled && !readOnly
  const canEditTags = editable && !!prop('editable')
  const delimiter = tagsDelimiter(prop('delimiter'))
  const max = prop('max')
  const allowOverflow = !!prop('allowOverflow')
  const atMax = isAtMax(count, max)
  const overflow = isOverflow(count, max)
  const empty = count === 0
  const canClear = editable && (count > 0 || inputValue !== '')

  const translations = prop('translations')
  const label = {
    deleteTagTrigger: translations?.deleteTagTrigger ?? ((tag: string) => `Delete ${tag}`),
    editTagInput: translations?.editTagInput ?? ((tag: string) => `Edit ${tag}`),
    clearTrigger: translations?.clearTrigger ?? 'Clear all',
  }

  // 锚点可能被外部改掉的 value 甩掉（宿主整份换了标签集合）：读侧一律夹回集合内，
  // 否则 data-highlighted 会长在一个已经不存在的标签上，而真正在列表里的那些一个都不亮
  const anchor = context.get('focusedValue')
  const focusedValue = anchor != null && value.includes(anchor) ? anchor : null
  const highlightedValue = state.matches('navigating') ? focusedValue : null
  const editedValue = state.matches('editing') ? focusedValue : null

  /**
   * 事件那一刻现查本组件的主输入框。
   * 连接期不得调用——Vue 侧那时 DOM 还不存在，WC 侧读到的是本帧，两侧会分叉。
   */
  const inputOf = (from: HTMLElement): HTMLInputElement | null => {
    const owner = from.closest<HTMLElement>(parts.root.selector) ?? from.closest<HTMLElement>(parts.control.selector)
    return owner?.querySelector<HTMLInputElement>(parts.input.selector) ?? null
  }

  /** 本节点当下是不是正持有焦点（含它的后代）。删掉它之前要据此决定焦点该不该另找去处。 */
  const holdsFocus = (el: HTMLElement): boolean => {
    const active = scope.getActiveElement()
    return !!active && contains(el, active)
  }

  /** 往左走一格；已经在第一个就停住（回绕会让人以为标签顺序变了）。 */
  const prevTag = (from: string | null): string | null => {
    if (count === 0)
      return null
    if (from == null)
      return value[count - 1]!
    const index = value.indexOf(from)
    return index > 0 ? value[index - 1]! : value[0]!
  }

  /** 往右走一格；走出末尾即返回 null，光标交回输入框。 */
  const nextTag = (from: string | null): string | null => {
    if (from == null)
      return null
    const index = value.indexOf(from)
    return index >= 0 && index + 1 < count ? value[index + 1]! : null
  }

  // item / item-preview / item-text / item-input 共用同一份状态标记，样式层各处一致
  const stateAttrs = (item: TagsInputItemProps): Record<string, string | undefined> => ({
    'data-highlighted': dataAttr(highlightedValue === item.value),
    'data-editing': dataAttr(editedValue === item.value),
    'data-disabled': dataAttr(disabled),
    'data-readonly': dataAttr(readOnly),
  })

  // root 与 control 报同一组闸门与容量标记：作者的边框、计数提示常挂在其中任一层上
  const surfaceAttrs = (): Record<string, string | undefined> => ({
    'data-disabled': dataAttr(disabled),
    'data-readonly': dataAttr(readOnly),
    'data-invalid': dataAttr(invalid),
    'data-empty': dataAttr(empty),
    'data-at-max': dataAttr(atMax),
    'data-overflow': dataAttr(overflow),
  })

  return {
    value,
    count,
    inputValue,
    empty,
    disabled,
    readOnly,
    invalid,
    atMax,
    overflow,
    highlightedValue,
    editedValue,
    canClear,
    setValue: next => send({ type: 'VALUE.SET', value: next }),
    addValue: next => send({ type: 'TAG.ADD', values: [next] }),
    deleteValue: v => send({ type: 'TAG.DELETE', value: v }),
    clear: () => send({ type: 'VALUE.CLEAR' }),
    setInputValue: next => send({ type: 'INPUT.CHANGE', value: next }),
    highlight: v => send({ type: 'TAG.HIGHLIGHT', value: v }),
    edit: v => send({ type: 'TAG.EDIT', value: v }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      ...surfaceAttrs(),
    }),

    getLabelProps: () => normalize.label({
      ...parts.label.attrs,
      'id': ids.label,
      // for 指向真正的输入框，不是外层包裹：指到不可标注的元素上，
      // 点标题不会聚焦、读屏也拿不到控件的名字，两头都断
      'for': ids.input,
      'data-disabled': dataAttr(disabled),
    }),

    getControlProps: () => normalize.element({
      ...parts.control.attrs,
      ...surfaceAttrs(),
      // 一排标签加一个输入框，在读屏那里是一个整体，靠 group 兜住，名字由 label 提供
      'role': 'group',
      'aria-labelledby': ids.label,
      // 显式 true/false：省略是"没说"，显式 false 是"明确说了不是"，读屏对两者处理不同
      'aria-disabled': disabled ? 'true' : 'false',
      'onPointerDown': (event: PointerEvent) => {
        // 只认容器自己的空白处：点在标签、删除按钮、输入框上时，那些节点各有各的事要做
        if (event.currentTarget !== event.target || event.button !== 0 || disabled)
          return
        const input = inputOf(event.currentTarget as HTMLElement)
        if (!input)
          return
        // 挡掉浏览器把容器设成 activeElement 的默认行为，焦点直接给输入框
        event.preventDefault()
        input.focus()
      },
    }),

    getInputProps: () => normalize.input({
      ...parts.input.attrs,
      'id': ids.input,
      'type': 'text',
      // 表单出口是 hidden-input：主输入框带上 name 会把"还没成为标签的半截文本"一并提交出去
      'autocomplete': 'off',
      'value': inputValue,
      'placeholder': prop('placeholder'),
      // 单体表单控件用原生 disabled（与集合条目的 aria-disabled 相反）：禁用的框不该能聚焦
      'disabled': disabled || undefined,
      'readonly': readOnly || undefined,
      // 作者把 label 换成非 <label> 元素时 for 会失效，这条兜住名字
      'aria-labelledby': ids.label,
      'aria-invalid': invalid ? 'true' : 'false',
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid),
      'onInput': (event: Event) => {
        const el = event.currentTarget as HTMLInputElement
        send({ type: 'INPUT.CHANGE', value: el.value })
        // 机器可能把这一次输入改写掉（断词、只剩空白、受控宿主不写回）。
        // 值若没变宿主就不会重渲，那段文本会一直留在框里——界面显示的和值里存的从此对不上
        const next = context.get('inputValue')
        if (el.value !== next)
          el.value = next
      },
      'onPaste': (event: ClipboardEvent) => {
        if (!editable || !prop('addOnPaste'))
          return
        const tags = splitTags(event.clipboardData?.getData('text') ?? '', delimiter)
        // 剪贴板里没有能成标签的内容：交给浏览器照常粘进框里
        if (tags.length === 0)
          return
        // 顶到上限时也不接管：拦下来又加不进去，等于把用户的内容凭空吃掉。
        // 让它粘进框里，用户至少看得见自己粘了什么
        if (appendTags(value, tags, { max, allowOverflow }).rejected.length > 0)
          return
        event.preventDefault()
        send({ type: 'TAG.ADD', values: tags })
      },
      'onBlur': (event: FocusEvent) => {
        if (!editable)
          return
        // 只有焦点真的离开整个组件才算失焦：点自己的删除按钮、跳进就地编辑框都还在组件里，
        // 那时按 blurBehavior 处置文本会把用户正打的字吃掉
        const el = event.currentTarget as HTMLElement
        const owner = el.closest<HTMLElement>(parts.root.selector) ?? el.closest<HTMLElement>(parts.control.selector)
        if (contains(owner, event.relatedTarget as Node | null))
          return
        send({ type: 'INPUT.BLUR' })
      },
      'onKeyDown': (event: KeyboardEvent) => {
        // 带 Ctrl/Meta/Alt 的组合归浏览器与读屏（Ctrl+A 全选文本之类），一律不接
        if (!editable || event.ctrlKey || event.metaKey || event.altKey)
          return
        const el = event.currentTarget as HTMLInputElement

        if (event.key === 'Enter') {
          // 光标停在某个标签上且开了就地编辑：Enter 是"改这一个"，不是"再加一个"
          if (highlightedValue != null && canEditTags) {
            event.preventDefault()
            send({ type: 'TAG.EDIT', value: highlightedValue })
            return
          }
          // 框里没有能成标签的内容就不接这个键：表单里的 Enter 还要用来提交
          if (splitTags(el.value, delimiter).length === 0)
            return
          event.preventDefault()
          send({ type: 'INPUT.COMMIT' })
          return
        }

        if (event.key === 'Escape') {
          // 没在标签间走就不吞：Escape 还要留给外层浮层的消解与输入法候选框的收起
          if (highlightedValue == null)
            return
          event.preventDefault()
          send({ type: 'TAG.HIGHLIGHT', value: null })
          return
        }

        if (event.key === 'Backspace') {
          // 框里还有字时，退格就是退格
          if (el.value !== '')
            return
          if (highlightedValue != null) {
            event.preventDefault()
            send({ type: 'TAG.DELETE', value: highlightedValue })
            return
          }
          if (count === 0)
            return
          // 头一下只高亮最后一个：直接删掉的话手滑一次就少一个标签，而且没有任何提示
          event.preventDefault()
          send({ type: 'TAG.HIGHLIGHT', value: value[count - 1]! })
          return
        }

        if (event.key === 'Delete') {
          if (highlightedValue == null)
            return
          event.preventDefault()
          send({ type: 'TAG.DELETE', value: highlightedValue })
          return
        }

        // 左键只在光标贴着最左端、且没有选区时才接管，否则会把"光标往左挪一格"吞掉
        if (event.key === 'ArrowLeft') {
          if (count === 0 || !atInputStart(el))
            return
          event.preventDefault()
          send({ type: 'TAG.HIGHLIGHT', value: prevTag(highlightedValue) })
          return
        }

        // 右键、Home、End 只在已经走进标签时才接管：光标还在框里时它们全归浏览器
        if (highlightedValue == null)
          return
        if (event.key === 'ArrowRight') {
          event.preventDefault()
          send({ type: 'TAG.HIGHLIGHT', value: nextTag(highlightedValue) })
          return
        }
        if (event.key === 'Home') {
          event.preventDefault()
          send({ type: 'TAG.HIGHLIGHT', value: value[0]! })
          return
        }
        if (event.key === 'End') {
          event.preventDefault()
          send({ type: 'TAG.HIGHLIGHT', value: null })
        }
      },
    }),

    getItemProps: item => normalize.element({
      ...parts.item.attrs,
      ...stateAttrs(item),
      // 标签身份。适配器与测试据此认出"离场的是哪一个标签"
      [ITEM_VALUE_ATTR]: item.value,
    }),

    getItemPreviewProps: item => normalize.element({
      ...parts['item-preview'].attrs,
      ...stateAttrs(item),
      // 就地编辑时让位给编辑框：收起而不是卸载，作者写的节点不该被替他删掉
      hidden: editedValue === item.value || undefined,
      onDblclick: () => {
        if (canEditTags)
          send({ type: 'TAG.EDIT', value: item.value })
      },
    }),

    getItemTextProps: item => normalize.element({
      ...parts['item-text'].attrs,
      ...stateAttrs(item),
    }),

    getItemDeleteTriggerProps: item => normalize.button({
      ...parts['item-delete-trigger'].attrs,
      'type': 'button',
      // 按钮里通常只有一个叉，不给名字读屏念不出删的是哪一个
      'aria-label': label.deleteTagTrigger(item.value),
      // 不占 Tab 位：标签一多，每个标签一个停靠点会让 Tab 变得没法用。
      // 键盘那一路走的是方向键 + Backspace/Delete
      'tabindex': -1,
      // 单体按钮用原生 disabled（与集合条目相反）：改不动的时候它就不该能被激活
      'disabled': !editable || undefined,
      'onPointerDown': (event: PointerEvent) => {
        // 只认主键：右键要留给上下文菜单
        if (event.button !== 0)
          return
        // 焦点留在输入框：按钮抢走焦点后，用户删完还想接着打字就得再点回去
        event.preventDefault()
      },
      'onClick': (event: MouseEvent) => {
        if (!editable)
          return
        const el = event.currentTarget as HTMLElement
        // 判据是"本节点当下正持有焦点"，不是"删的是不是它"：
        // 删完这个按钮就没了，它若正拿着焦点，焦点会掉到 body 上，键盘用户就此被踢出组件；
        // 而指针点击那一路焦点本来就还在输入框里，无条件抢过来反而会打断用户正在打的字。
        // 输入框必须在送事件之前先拿到：删完这个标签整块节点就离开文档了，
        // 那时再从它往上找 root 只会找到 null，焦点就再也交不回去
        const restore = holdsFocus(el) ? inputOf(el) : null
        send({ type: 'TAG.DELETE', value: item.value })
        restore?.focus()
      },
    }),

    getItemInputProps: item => normalize.input({
      ...parts['item-input'].attrs,
      ...stateAttrs(item),
      // id 是机器的聚焦副作用捞节点的唯一依据，两处算法必须逐字一致
      'id': tagsInputEditInputId(scope, item.value),
      'type': 'text',
      'autocomplete': 'off',
      // 不编辑这个标签时收起而不是卸载（与 item-preview 正好互斥）
      'hidden': editedValue === item.value ? undefined : true,
      // 缓冲只在编辑本标签时才是权威值；别的标签的编辑框照原值显示，免得串台
      'value': editedValue === item.value ? context.get('editedValue') : item.value,
      'disabled': disabled || undefined,
      'readonly': readOnly || undefined,
      // 编辑框没有可见标题，不给名字读屏只会念"编辑框"
      'aria-label': label.editTagInput(item.value),
      'onInput': (event: Event) => {
        if (editedValue !== item.value)
          return
        send({ type: 'EDIT.CHANGE', value: (event.currentTarget as HTMLInputElement).value })
      },
      'onKeyDown': (event: KeyboardEvent) => {
        if (editedValue !== item.value || event.ctrlKey || event.metaKey || event.altKey)
          return
        if (event.key !== 'Enter' && event.key !== 'Escape')
          return
        // 输入框先拿到再送事件：改成空白等于删掉这个标签，整块节点会随之离开文档，
        // 那时再从编辑框往上找 root 只会找到 null
        const back = inputOf(event.currentTarget as HTMLElement)
        event.preventDefault()
        send({ type: event.key === 'Enter' ? 'EDIT.SUBMIT' : 'EDIT.CANCEL' })
        // 编辑框马上就要收起来：焦点先交回输入框，否则它会掉到 body 上
        back?.focus()
      },
      'onBlur': () => {
        // 判据是"本节点正是当下在编辑的那一个"：别的编辑框迟到的失焦不该把这次编辑提交掉。
        // Enter/Escape 那两路走到这里时机器已经退出编辑态，EDIT.SUBMIT 无人接收，天然是空转
        if (editedValue !== item.value)
          return
        send({ type: 'EDIT.SUBMIT' })
      },
    }),

    getClearTriggerProps: () => normalize.button({
      ...parts['clear-trigger'].attrs,
      'type': 'button',
      'aria-label': label.clearTrigger,
      // 与删除按钮同一套取舍：键盘用户走 Backspace 逐个删，按钮只是指针用户的快捷方式
      'tabindex': -1,
      'disabled': !canClear || undefined,
      'data-disabled': dataAttr(!canClear),
      'onPointerDown': (event: PointerEvent) => {
        if (event.button !== 0)
          return
        // 焦点留在输入框：清完还要接着打字
        event.preventDefault()
      },
      'onClick': (event: MouseEvent) => {
        if (!canClear)
          return
        const el = event.currentTarget as HTMLElement
        // 清完这个按钮会转成 disabled，禁用元素持不住焦点：判据同样是"它此刻正拿着焦点"
        const restore = holdsFocus(el) ? inputOf(el) : null
        send({ type: 'VALUE.CLEAR' })
        restore?.focus()
      },
    }),

    getHiddenInputProps: () => normalize.input({
      ...parts['hidden-input'].attrs,
      // type 先于 value 写入：改 type 会重置输入的值
      type: 'hidden',
      // name 缺省即不产出该属性，此时这份输入不参与提交
      name: prop('name'),
      // 按断词符拼成一串：标签本来就是按它拆出来的，拼回去后端再拆一次就还原了
      value: value.join(delimiter),
      // 禁用的控件不该提交出值
      disabled: disabled || undefined,
    }),
  }
}
