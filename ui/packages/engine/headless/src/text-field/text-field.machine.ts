/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 text field 相关实现。

import type { TextFieldSchema } from './text-field.types'
import { resetDeclaredValue, setup } from '@xihan-ui/core'
import { graphemeLength, graphemes } from '../shared/grapheme'
import { validateTextFieldAutoSize } from './text-field.autosize'

const { createMachine } = setup<TextFieldSchema>()

/** maxLength 是否给了个能用的上限；负数与非有限值按没给处理。 */
function hasLimit(maxLength: number | undefined): maxLength is number {
  return maxLength != null && Number.isFinite(maxLength) && maxLength >= 0
}

/**
 * 按 maxLength（字素）截断，切掉的是尾巴。作者调 setValue 与受控写入走这一路；
 * 用户的一次编辑走 fitToMaxLength，截的是这次新插入的文本。
 */
export function clampToMaxLength(value: string, maxLength: number | undefined): string {
  if (!hasLimit(maxLength) || graphemeLength(value) <= maxLength)
    return value
  return graphemes(value).slice(0, maxLength).join('')
}

/** 已顶到上限：再敲一个字也进不去。maxLength 为 0 时空串就已经到顶。 */
export function isAtLimit(value: string, maxLength: number | undefined): boolean {
  return hasLimit(maxLength) && graphemeLength(value) >= maxLength
}

export interface TextFieldFitResult {
  /** 收住之后的值。 */
  value: string
  /** 光标该落的位置（UTF-16 下标）：保留下来的插入文本之后。 */
  caret: number
}

/**
 * 把一次超出 maxLength 的编辑收住：与原生 maxlength 一样，截掉的是这次新插入的文本里放不下的那一截，
 * 光标前后原有的内容不动。prev 是编辑前的值，next 是编辑后的值；没超出上限时返回 null。
 * 编辑前就已越过上限（受控值塞进来的长串）时退回截尾巴。
 */
export function fitToMaxLength(prev: string, next: string, maxLength: number | undefined): TextFieldFitResult | null {
  if (!hasLimit(maxLength) || graphemeLength(next) <= maxLength)
    return null
  let head = 0
  const shortest = Math.min(prev.length, next.length)
  while (head < shortest && prev[head] === next[head])
    head++
  let tail = 0
  while (tail < shortest - head && prev[prev.length - 1 - tail] === next[next.length - 1 - tail])
    tail++
  const before = next.slice(0, head)
  const after = next.slice(next.length - tail)
  const room = maxLength - graphemeLength(before + after)
  if (room < 0) {
    const value = clampToMaxLength(next, maxLength)
    return { value, caret: value.length }
  }
  const kept = graphemes(next.slice(head, next.length - tail)).slice(0, room).join('')
  return { value: before + kept + after, caret: before.length + kept.length }
}

export const textFieldMachine = createMachine({
  name: 'text-field',
  props: ({ props }) => ({
    ...props,
    autoSize: validateTextFieldAutoSize(props.autoSize),
  }),
  context: ({ prop, cell }) => ({
    // 值住在 cell 里，受控/非受控在此收口，不需要 CONTROLLED.* 影子事件
    value: cell<string>(() => ({
      value: prop('value'),
      defaultValue: prop('defaultValue') ?? '',
      onChange: value => prop('onValueChange')?.({ value }),
    })),
    // 按压通道：清空按钮被 Space / Enter 或触屏按住期间为 true
    pressed: cell<boolean>(() => ({ defaultValue: false })),
  }),
  initialState: () => 'idle',
  // 按住途中转入禁用 / 只读、关掉 clearable 或值被清空：清空按钮随即藏起，不会再来 keyup，按压面由机器自己收
  watch: ({ track, prop, context, action }) => {
    track([() => prop('disabled'), () => prop('readOnly'), () => prop('clearable'), context.dep('value')], () => action(['releaseWhenInert']))
  },
  // 只有一个状态，事件都挂在根级
  on: {
    'FORM.RESET': { actions: ['resetToDefault'] },
    'VALUE.SET': { guard: 'canEdit', actions: ['setValue'] },
    'VALUE.CLEAR': { guard: 'canClear', actions: ['clearValue'] },
    // 清空按钮的按压与清空本身同一道守卫：清不了的按钮已经藏起，不该有按下的回执
    'PRESS.START': { guard: 'canClear', actions: ['startPress'] },
    'PRESS.END': { actions: ['endPress'] },
  },
  states: {
    idle: {},
  },
  implementations: {
    guards: {
      canEdit: ({ prop }) => !prop('disabled') && !prop('readOnly'),
      // 三个条件缺一不可；已经是空串时清空是一次没有变化的写，会白白惊动 onValueChange
      canClear: ({ prop, context }) =>
        !!prop('clearable') && !prop('disabled') && !prop('readOnly') && context.get('value') !== '',
    },
    actions: {
      resetToDefault: params => void resetDeclaredValue(params, 'value', 'value', 'defaultValue'),

      setValue: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type === 'VALUE.SET')
          // 输入法组合中的拼音字母不是最终的字，截了会把候选打断；落定时连接层再送一次
          context.set('value', e.composing ? e.value : clampToMaxLength(e.value, prop('maxLength')))
      },
      clearValue: ({ context }) => {
        context.set('value', '')
      },
      startPress: ({ context }) => context.set('pressed', true),
      endPress: ({ context }) => context.set('pressed', false),
      releaseWhenInert: ({ context, prop }) => {
        if (!prop('clearable') || prop('disabled') || prop('readOnly') || context.get('value') === '')
          context.set('pressed', false)
      },
    },
  },
})
