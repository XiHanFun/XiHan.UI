/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 color field 相关实现。

import type { Params } from '@xihan-ui/core'
import type { ColorFieldSchema } from './color-field.types'
import { resetDeclaredValue, setup } from '@xihan-ui/core'
import { colorParse, colorResolveFormat, colorToString } from '../shared/color'

const { createMachine } = setup<ColorFieldSchema>()

type MachineParams = Params<ColorFieldSchema>

/**
 * 把一串字收成规范的值串：解析不出返回 null；格式写错时也返回 null（静默换成 hex 会让宿主收到一种它没要过的写法）。
 * 空串是合法的「没有颜色」，原样返回。
 */
export function colorFieldNormalize(raw: string, format: string | undefined, alpha: boolean): string | null {
  const trimmed = raw.trim()
  if (trimmed === '')
    return ''
  const resolved = colorResolveFormat(format)
  if (!resolved)
    return null
  const rgba = colorParse(trimmed)
  return rgba ? colorToString(rgba, resolved, alpha) : null
}

function applyValue(params: MachineParams, raw: string): boolean {
  const { context, prop } = params
  const next = colorFieldNormalize(raw, prop('format') as string | undefined, prop('alpha') ?? false)
  if (next === null)
    return false
  context.set('value', next)
  return true
}

export const colorFieldMachine = createMachine({
  name: 'color-field',
  context: ({ prop, cell }) => ({
    // 值住在 cell 里，受控/非受控在此收口
    value: cell<string>(() => ({
      value: prop('value'),
      defaultValue: prop('defaultValue') ?? '',
      onChange: value => prop('onValueChange')?.({ value }),
    })),
    draft: cell<string | null>(() => ({ defaultValue: null })),
    draftInvalid: cell<boolean>(() => ({ defaultValue: false })),
    // 按压通道：清空按钮被 Space / Enter 或触屏按住期间为 true
    pressed: cell<boolean>(() => ({ defaultValue: false })),
  }),
  initialState: () => 'idle',
  // 按住途中转入禁用 / 只读、关掉 clearable 或值被清空：清空按钮随即藏起，不会再来 keyup，按压面由机器自己收
  watch: ({ track, prop, context, action }) => {
    track([() => prop('disabled'), () => prop('readOnly'), () => prop('clearable'), context.dep('value')], () => action(['releaseWhenInert']))
  },
  on: {
    'FORM.RESET': { actions: ['resetToDefault'] },
    // 打字不设守卫：草稿是纯显示状态；落值那一步在 commitDraft 内另有守卫
    'INPUT.CHANGE': { actions: ['setDraft'] },
    'INPUT.COMMIT': { actions: ['commitDraft'] },
    'INPUT.CANCEL': { actions: ['cancelDraft'] },
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
      resetToDefault: (params) => {
        resetDeclaredValue(params, 'value', 'value', 'defaultValue')
        params.context.reset('draft')
        params.context.reset('draftInvalid')
      },

      setDraft: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'INPUT.CHANGE')
          return
        context.set('draft', e.value)
        // 一改动就摘掉上次收下失败的标记，等下一次收下再判
        context.set('draftInvalid', false)
      },

      // 收得了就落值并清草稿；收不了保留草稿并标成无效，让人看见自己打的是什么
      commitDraft: (params) => {
        const { context, prop } = params
        const draft = context.get('draft')
        if (draft == null)
          return
        if (prop('disabled') || prop('readOnly')) {
          context.set('draft', null)
          return
        }
        if (applyValue(params, draft)) {
          context.set('draft', null)
          context.set('draftInvalid', false)
          return
        }
        context.set('draftInvalid', true)
      },

      cancelDraft: ({ context }) => {
        context.set('draft', null)
        context.set('draftInvalid', false)
      },

      // 作者写值：解析不出的串原地不动；写值同时丢掉框里的草稿
      setValue: (params) => {
        const e = params.event.current()
        if (e.type !== 'VALUE.SET')
          return
        if (applyValue(params, e.value)) {
          params.context.set('draft', null)
          params.context.set('draftInvalid', false)
        }
      },

      clearValue: ({ context }) => {
        context.set('value', '')
        context.set('draft', null)
        context.set('draftInvalid', false)
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
