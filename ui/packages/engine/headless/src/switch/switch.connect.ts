/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 switch 相关实现。

import type { NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { SwitchApi, SwitchSchema } from './switch.types'
import { dataAttr } from '@xihan-ui/core'
import { pressHandlers } from '../shared/press'
import { switchAnatomy } from './switch.anatomy'

const parts = switchAnatomy.build()

export function connectSwitch<T extends PropTypes>(
  service: Service<SwitchSchema>,
  normalize: NormalizeProps<T>,
): SwitchApi<T> {
  const { state, prop, send, context } = service
  const checked = state.get() === 'on'
  const disabled = !!prop('disabled')
  const loading = !!prop('loading')
  const readOnly = !!prop('readOnly')
  const invalid = !!prop('invalid')
  const required = !!prop('required')
  const stateAttr = checked ? 'checked' : 'unchecked'
  const interactive = !disabled && !loading && !readOnly
  // 拖动与松手落定期间滑块的位移由机器逐帧写，停在两端时交还样式层
  const thumbPosition = context.get('thumbPosition')
  const dragging = context.get('dragging')
  const settling = context.get('settling')

  const setChecked = (next: boolean): void => {
    if (next !== checked)
      send({ type: 'TOGGLE' })
  }

  // 键盘 / 触屏按住期间的按压面；指针按住由 :active 表出，皮肤两者同一档。轨道是原生按钮，
  // Space 与 Enter 都是激活键（平台翻成 click），两键都进按压通道；与开关态互相独立
  const press = pressHandlers(service)

  return {
    checked,
    loading,
    setChecked,
    getRootProps: () => normalize.button({
      ...parts.root.attrs,
      'type': 'button',
      'role': 'switch',
      'aria-checked': checked ? 'true' : 'false',
      // 提交中不算禁用：仍可聚焦，读屏经 aria-busy 知道在忙
      'aria-busy': loading ? 'true' : undefined,
      'disabled': disabled || undefined,
      // 只读不能用原生 disabled 表达：那会连焦点一起拿掉，且不再提交值
      'aria-readonly': readOnly ? 'true' : 'false',
      'aria-invalid': invalid ? 'true' : 'false',
      'aria-required': required ? 'true' : 'false',
      // 轨道是定尺的独立动作控件（「轨道」）：接 Action Control text 档、outline 形态——悬停 / 按下 / 禁用面、
      // 0.97 缩放与换底、粗指针热区、焦点环由家族配方给，皮肤只把轨道的私有槽映射到桥接槽；
      // 宽高仍按 --xh-switch-track-h-* 走（皮肤覆盖 --xh-action-visual-size / -min-inline-size）
      'data-xh-action-control': '',
      'data-xh-action-profile': 'text',
      'data-xh-action-variant': 'outline',
      'data-xh-action-display': 'always',
      'data-xh-action-size': prop('size') ?? 'md',
      'data-state': stateAttr,
      'data-tone': prop('tone'),
      'data-size': prop('size'),
      'data-disabled': dataAttr(disabled),
      'data-loading': dataAttr(loading),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid),
      'data-required': dataAttr(required),
      'data-pressed': dataAttr(context.get('pressed')),
      'data-dragging': dataAttr(dragging),
      // 横向拖动归滑块，纵向留给页面滚动：不这样的话触屏一横划就被浏览器当成平移收走
      'style': { touchAction: interactive ? 'pan-y' : '' },
      'onClick': () => {
        // 刚拖完：开关态已由松手的落点决定，浏览器补派的这一下不再切换
        if (context.get('swallowClick')) {
          send({ type: 'CLICK.SWALLOW' })
          return
        }
        if (interactive)
          send({ type: 'TOGGLE' })
      },
      'onKeyDown': press.onKeyDown,
      'onKeyUp': press.onKeyUp,
      'onBlur': press.onBlur,
      'onPointerDown': (event: PointerEvent) => {
        press.onPointerDown(event)
        // 只认主键；按下先不算拖动，横向移动过激活距离才接管，点按照常经 click 切换
        if (interactive && event.button === 0)
          send({ type: 'DRAG.START', pointerId: event.pointerId, clientX: event.clientX, clientY: event.clientY, root: event.currentTarget as HTMLElement })
      },
      'onPointerUp': press.onPointerUp,
      'onPointerCancel': press.onPointerCancel,
    }),
    getThumbProps: () => normalize.element({
      ...parts.thumb.attrs,
      'data-state': stateAttr,
      'data-disabled': dataAttr(disabled),
      'data-loading': dataAttr(loading),
      'data-dragging': dataAttr(dragging),
      'data-animating': dataAttr(settling && !dragging),
      'style': { translate: thumbPosition == null ? '' : `${thumbPosition}px 0` },
    }),

    getHiddenInputProps: () => normalize.input({
      // type 先于 value 写入：改 type 会重置输入的值
      type: 'hidden',
      ...parts['hidden-input'].attrs,
      // 没勾上就不带 name，整条不参与提交——与原生复选框一致
      name: checked ? prop('name') : undefined,
      value: prop('value') ?? 'on',
      // 单体控件用原生 disabled，禁用时不提交值
      disabled: disabled || undefined,
    }),
    // <label> 包住 <button>：button 是 labelable 元素，点文字即激活它，可及名也从这里取
    getLabelProps: () => normalize.label({
      ...parts.label.attrs,
      'data-state': stateAttr,
      'data-size': prop('size'),
      'data-disabled': dataAttr(disabled),
    }),
    getTextProps: () => normalize.element({
      ...parts.text.attrs,
      'data-state': stateAttr,
      'data-disabled': dataAttr(disabled),
    }),
  }
}
