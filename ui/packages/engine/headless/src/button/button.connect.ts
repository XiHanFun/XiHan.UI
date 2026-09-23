/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 button 相关实现。

import type { NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { ButtonApi, ButtonSchema } from './button.types'
import { dataAttr, isDev } from '@xihan-ui/core'
import { pressHandlers } from '../shared/press'
import { buttonAnatomy } from './button.anatomy'

const parts = buttonAnatomy.build()

/** 图标按钮缺可及名的提醒只投一次，连接层每次重算都会经过这里。 */
let iconOnlyNameWarned = false

// Button 没有业务状态：禁用 / 加载来自 props 与原生伪类，机器只承载按压通道。
export function connectButton<T extends PropTypes>(
  service: Service<ButtonSchema>,
  normalize: NormalizeProps<T>,
): ButtonApi<T> {
  const { prop, context } = service
  const disabled = !!prop('disabled')
  const loading = !!prop('loading')
  const interactive = !disabled && !loading
  const iconOnly = !!prop('iconOnly')
  const size = prop('size')
  // 缺省形态显式落 solid：只有 Button 缺省品牌实心，其余触发器缺省中性
  const variant = prop('variant') ?? 'solid'
  // 渲染成链接时没有原生 type 与原生 disabled 可用，两件事都改走 ARIA
  const nativeButton = (prop('as') ?? 'button') === 'button'
  // 键盘 / 触屏按住期间的按压面；指针按住由 :active 表出，皮肤两者同一档
  const press = pressHandlers(service)
  // 图标按钮没有可见文字，没给 aria-label / aria-labelledby 就没有可及名；只在开发模式提醒一次
  if (isDev() && !iconOnlyNameWarned && iconOnly && !prop('ariaLabel') && !prop('ariaLabelledby')) {
    iconOnlyNameWarned = true
    console.warn('[xh:button] iconOnly 按钮没有可见文字，须给 aria-label 或 aria-labelledby')
  }

  return {
    disabled,
    loading,
    getRootProps: () => normalize.button({
      ...parts.root.attrs,
      'type': nativeButton ? (prop('type') ?? 'button') : undefined,
      // 真 disabled 用原生（会丢焦点）；loading 用 aria-disabled + 拦截事件（保留焦点）。
      // 链接上这两条原生属性都不成立，禁用一并落到 aria-disabled 上
      'disabled': (nativeButton && disabled) || undefined,
      'aria-disabled': (loading || (!nativeButton && disabled)) ? 'true' : undefined,
      // 在途要报 busy：aria-disabled 说的是「现在按不动」，aria-busy 说的是「这块还在更新」，
      // 两件事都成立。同族的 switch / popconfirm / table 都发这一条
      'aria-busy': loading ? 'true' : undefined,
      // Family Recipe 只需要稳定的视觉角色事实；具体尺寸与状态值全部由样式层配方决定。
      // 四种形态的底 / 前景 / 描边由家族形态矩阵按 data-xh-action-variant 给出，皮肤只桥接海拔与高光
      'data-xh-action-control': '',
      'data-xh-action-profile': iconOnly ? 'icon' : 'text',
      'data-xh-action-display': 'always',
      'data-xh-action-size': size ?? 'md',
      'data-xh-action-variant': variant,
      'data-variant': variant,
      'data-tone': prop('tone'),
      'data-size': size,
      'data-disabled': dataAttr(disabled),
      'data-loading': dataAttr(loading),
      'data-icon-only': dataAttr(iconOnly),
      'data-full-width': dataAttr(!!prop('fullWidth')),
      'data-pressed': dataAttr(context.get('pressed')),
      'onClick': (e: Event) => {
        if (interactive)
          return
        e.preventDefault()
        // 用 stopImmediatePropagation，同节点上作者的处理器也一并拦下
        e.stopImmediatePropagation()
      },
      'onKeyDown': press.onKeyDown,
      'onKeyUp': press.onKeyUp,
      'onBlur': press.onBlur,
      'onPointerDown': press.onPointerDown,
      'onPointerUp': press.onPointerUp,
      'onPointerCancel': press.onPointerCancel,
    }),
    getLabelProps: () => normalize.element({ ...parts.label.attrs }),
    getIndicatorProps: () => normalize.element({ ...parts.indicator.attrs, 'aria-hidden': true }),
    getPrefixProps: () => normalize.element({ ...parts.prefix.attrs, 'aria-hidden': true }),
    getSuffixProps: () => normalize.element({ ...parts.suffix.attrs, 'aria-hidden': true }),
  }
}
