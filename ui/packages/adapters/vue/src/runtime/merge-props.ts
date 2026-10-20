/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 merge props 相关实现。

import { isEventHandlerKey, stripScopeClass } from '@xihan-ui/core'
import { mergeProps as mergeVueProps, normalizeClass } from 'vue'

type Props = Record<string, unknown>

/** 摊平为数组：Vue 的直通属性中同名处理器可能已经是一组。 */
function handlers(value: unknown): unknown[] {
  if (value == null)
    return []
  const list = Array.isArray(value) ? value : [value]
  return list.filter(fn => typeof fn === 'function')
}

/**
 * 把部件接线与作者写在部件上的属性合并为一份。
 *
 * 同名事件处理器作者的排在前面先运行、部件的后运行，作者因此能在部件动作之前拦截事件；
 * class 与 style 两边都保留，其余普通值以作者的为准。
 */
export function mergePartProps(part: Props, author: Props): Props {
  const merged = mergeVueProps(part, author) as Props
  for (const key of Object.keys(merged)) {
    if (!isEventHandlerKey(key))
      continue
    const theirs = handlers(author[key])
    const ours = handlers(part[key])
    if (theirs.length > 0 && ours.length > 0) {
      // 保留数组形态，让 Vue 继续处理每个回调的异常及 stopImmediatePropagation。
      merged[key] = [...theirs, ...ours.map(handler => (...args: unknown[]) => {
        if ((args[0] as { defaultPrevented?: boolean } | null | undefined)?.defaultPrevented)
          return
        (handler as (...args: unknown[]) => void)(...args)
      })]
    }
  }
  return merged
}

/**
 * 去掉一份连接层产出里的皮肤挂载类（xh-scope-*），别的类照留。
 * 两层的产出合到同一个节点上、节点只认外层那一个 scope 时用（如子菜单入口：data-scope 取父层）。
 */
export function withoutScopeClass(props: Props): Props {
  if (props.class == null)
    return props
  const { class: value, ...others } = props
  const rest = stripScopeClass(normalizeClass(value))
  return rest ? { ...others, class: rest } : others
}

/**
 * 去掉值为 undefined 的键。两层的产出合到同一个节点上时套在后合的那一层上：它没给的键不盖掉先合那一层给的，
 * 与 Web Components 的属性铺设同一口径（连接层给 undefined 只表示这一条不给）。
 */
export function withoutUndefined<T extends Record<string, unknown>>(props: T): T {
  return Object.fromEntries(Object.entries(props).filter(([, value]) => value !== undefined)) as T
}
