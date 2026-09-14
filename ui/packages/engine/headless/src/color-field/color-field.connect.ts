/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 color field 相关实现。

import type { NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { ColorFieldApi, ColorFieldSchema, ColorFieldTranslations } from './color-field.types'
import { dataAttr, isComposingEvent } from '@xihan-ui/core'
import { colorCss, colorParse, colorToRgba } from '../shared/color'
import { colorFieldAnatomy } from './color-field.anatomy'

const parts = colorFieldAnatomy.build()

function resolveTranslations(input: Partial<ColorFieldTranslations> | undefined): ColorFieldTranslations {
  return {
    clearTrigger: input?.clearTrigger ?? 'Clear',
  }
}

export function connectColorField<T extends PropTypes>(
  service: Service<ColorFieldSchema>,
  normalize: NormalizeProps<T>,
): ColorFieldApi<T> {
  const { prop, send, context, scope } = service
  const ids = scope.ids('color-field', 'label', 'input')
  const label = resolveTranslations(prop('translations'))

  const value = context.get('value')
  // cell 的 null 默认值在首帧读出来是 undefined，两者都当作「没在编辑」
  const draft = context.get('draft') ?? null
  const draftInvalid = context.get('draftInvalid')
  const empty = value === ''
  const editing = draft !== null
  const text = draft ?? value
  const parsed = empty ? null : colorParse(value)
  const valid = parsed !== null
  const rgba = parsed ?? colorToRgba(value)
  const disabled = !!prop('disabled')
  const readOnly = !!prop('readOnly')
  // 作者标的无效与草稿收不下是同一种表达：框描红、读屏念 invalid
  const invalid = !!prop('invalid') || draftInvalid
  const clearable = !!prop('clearable')
  const editable = !disabled && !readOnly
  // 与机器里 canClear 守卫同义。两处都要：这里决定按钮长什么样，那里挡住绕过 DOM 的调用
  const canClear = clearable && editable && !empty

  return {
    value,
    empty,
    text,
    editing,
    draftInvalid,
    rgba,
    valid,
    disabled,
    readOnly,
    invalid,
    clearable,
    canClear,
    setValue: next => send({ type: 'VALUE.SET', value: next }),
    clear: () => send({ type: 'VALUE.CLEAR' }),
    commit: () => send({ type: 'INPUT.COMMIT' }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      // Action Control 的显示策略只读取命名空间宿主，不反查 color-field anatomy。
      'data-xh-action-owner': '',
      // 三个视觉轴只落在 root，子部件从这里继承皮肤声明的私有槽
      'data-variant': prop('variant'),
      'data-tone': prop('tone'),
      'data-size': prop('size'),
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid),
      'data-empty': dataAttr(empty),
      'data-editing': dataAttr(editing),
    }),

    // 视觉盒：描边、底色与聚焦环画在这个节点上，色块、输入框与清空按钮排在它里面
    getControlProps: () => normalize.element({
      ...parts.control.attrs,
      'data-xh-field-chrome': '',
      'data-xh-field-size': prop('size') ?? 'md',
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid),
      'data-empty': dataAttr(empty),
      'data-editing': dataAttr(editing),
    }),

    getLabelProps: () => normalize.label({
      ...parts.label.attrs,
      'id': ids.label,
      // for 指向真正的 input，不是外层包裹节点：指到不可标注的元素上，点标题不会聚焦
      'for': ids.input,
      'data-disabled': dataAttr(disabled),
    }),

    // 当前颜色的色块：色块面家族画棋盘格、描边与尺寸档，这里只投影颜色。
    // 纯装饰：颜色串已经在输入框里，读屏不再念一遍
    getSwatchProps: () => normalize.element({
      ...parts.swatch.attrs,
      'aria-hidden': true,
      'data-xh-swatch': '',
      'data-xh-swatch-size': prop('size'),
      'data-disabled': dataAttr(disabled),
      'data-empty': dataAttr(empty),
      // 空值或解析不出时不画颜色层：写空串撤销声明而不是不写键，WC 侧 Object.assign 不会撤掉上一帧旧值
      'style': { '--xh-_swatch-color': valid ? colorCss(rgba) : '' },
    }),

    getInputProps: () => normalize.input({
      ...parts.input.attrs,
      'id': ids.input,
      'type': 'text',
      // 值经表单影子提交，这里不带 name：框里的半截字不该被提交
      'value': text,
      'placeholder': prop('placeholder'),
      // 十六进制要打字母，数字键盘反而挡路
      'autocomplete': 'off',
      'autocapitalize': 'none',
      // 布尔要写成字符串：WC 侧 spread 见到 false 会把属性整个摘掉，与 Vue 侧对不上
      'spellcheck': 'false',
      'disabled': disabled || undefined,
      'readonly': readOnly || undefined,
      'required': prop('required') || undefined,
      // 作者把 label 换成非 <label> 元素时 for 会失效，这条兜住名字
      'aria-labelledby': ids.label,
      // 显式 true/false：省略是没说，显式 false 是明确说了不是
      'aria-invalid': invalid ? 'true' : 'false',
      'aria-readonly': readOnly ? 'true' : 'false',
      'aria-required': prop('required') ? 'true' : 'false',
      // Field Chrome 不读取 color-field anatomy；布局与原生输入角色由 Headless 明确投影。
      'data-xh-field-input': '',
      'data-xh-field-layout': 'single-line',
      'data-disabled': dataAttr(disabled),
      'data-invalid': dataAttr(invalid),
      'data-empty': dataAttr(empty),
      'data-editing': dataAttr(editing),
      'onInput': (event: Event) => {
        send({ type: 'INPUT.CHANGE', value: (event.target as HTMLInputElement).value })
      },
      // 失焦即收下：留在框里的半截字要么成为值，要么标成无效
      'onBlur': () => send({ type: 'INPUT.COMMIT' }),
      'onKeyDown': (event: KeyboardEvent) => {
        // 组合期间的按键属于输入法候选框，组件一律不接
        if (isComposingEvent(event))
          return
        if (event.ctrlKey || event.metaKey || event.altKey)
          return
        if (event.key === 'Enter') {
          // 只在真有草稿时拦：没在编辑时回车该照常提交表单
          if (!editing)
            return
          event.preventDefault()
          // 按住不放会连发 keydown：收下一次就够，重复的只吞键不再收
          if (event.repeat)
            return
          send({ type: 'INPUT.COMMIT' })
          return
        }
        if (event.key !== 'Escape')
          return
        // 先撤草稿，再谈清空：两者都做不了时不吞键，Escape 还有外层浮层消解等去处
        if (editing) {
          event.preventDefault()
          send({ type: 'INPUT.CANCEL' })
          return
        }
        if (!canClear)
          return
        event.preventDefault()
        send({ type: 'VALUE.CLEAR' })
      },
    }),

    getClearTriggerProps: () => normalize.button({
      ...parts['clear-trigger'].attrs,
      'data-xh-action-control': '',
      'data-xh-action-profile': 'field-inset',
      'data-xh-action-display': 'has-value',
      'data-xh-action-size': prop('size') ?? 'md',
      'data-xh-action-has-value': dataAttr(!empty),
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

    // 表单出口：提交的是收下的值
    getHiddenInputProps: () => normalize.input({
      ...parts['hidden-input'].attrs,
      // type 先于 value 写：改 type 会重置输入的值
      type: 'hidden',
      // name 缺省即不产出该属性，此时这份输入不参与提交
      name: prop('name'),
      value,
      // 禁用的控件不该提交出值
      disabled: disabled || undefined,
    }),
  }
}
