/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 toggle group 相关实现。

import type { ToggleGroupSchema, ToggleGroupValue } from './toggle-group.types'
import { resetDeclaredValue, setup } from '@xihan-ui/core'
import { sameArray } from '../shared/array'

const { createMachine } = setup<ToggleGroupSchema>()

/**
 * 作者那一侧的值形态归一成内部统一的数组。
 * 返回 undefined 只有一个来源：入参本身是 undefined，那是非受控的唯一表达，
 * 归一成空数组会变成受控且当前无选中。
 */
export function normalizeToggleGroupValue(
  input: ToggleGroupValue | undefined,
  multiple: boolean,
): string[] | undefined {
  if (input === undefined)
    return undefined
  if (input === null)
    return []
  const list = typeof input === 'string' ? [input] : [...input]
  // 去重：同一个值出现两次时点一下只摘掉一份，条目看着仍是选中的
  const unique = [...new Set(list)]
  // 单选只留第一个：多出来的那几个既报不出去也点不掉
  return multiple ? unique : unique.slice(0, 1)
}

/** 内部数组变回作者那一侧的形态：多选给数组，单选给单值（无选中为 null）。 */
export function toToggleGroupChangeValue(
  values: readonly string[],
  multiple: boolean,
): string | string[] | null {
  return multiple ? [...values] : (values[0] ?? null)
}

/**
 * 值按内容比，不按引用比：归一化每次都产出新数组，
 * cell 默认的 Object.is 会让版本号每读一次就涨一次、值没变也照发回调。
 */
export function sameToggleGroupValue(a: readonly string[], b: readonly string[] | undefined): boolean {
  return sameArray(a, b)
}

// 选中集合住在 context 的 cell 里，受控/非受控在 cell 收口，不需要影子事件与受控守卫。
// 机器只有一个状态，transition 省略 target 即只跑 actions、不换状态。
export const toggleGroupMachine = createMachine({
  name: 'toggle-group',
  context: ({ prop, cell }) => ({
    value: cell<string[]>(() => {
      const multiple = !!prop('multiple')
      return {
        value: normalizeToggleGroupValue(prop('value'), multiple),
        defaultValue: normalizeToggleGroupValue(prop('defaultValue'), multiple) ?? [],
        isEqual: sameToggleGroupValue,
        onChange: values => prop('onValueChange')?.({ value: toToggleGroupChangeValue(values, multiple) }),
      }
    }),
    // 焦点锚点：不受控、不对外通知，只服务 roving tabindex 与方向键起点
    focusedValue: cell<string | null>(() => ({ defaultValue: null })),
    // 按压通道：正被按住的条目（按 value 记），与开关态、焦点锚点无关
    pressedValue: cell<string | null>(() => ({ defaultValue: null })),
  }),
  initialState: () => 'idle',
  // 按住途中整组转入禁用：不会再来 keyup，按压面由机器自己收
  watch: ({ track, prop, action }) => {
    track([() => prop('disabled')], () => action(['releaseWhenInert']))
  },
  on: {
    'FORM.RESET': { actions: ['resetToDefault'] },
  },
  states: {
    idle: {
      on: {
        'VALUE.SET': { actions: ['setValue'] },
        // 激活顺带把锚点搬过来，下次 Tab 进组落在刚点过的那个条目上
        'ITEM.TOGGLE': { actions: ['toggleItem', 'setFocusedValue'] },
        'ITEM.FOCUS': { actions: ['setFocusedValue'] },
        'GROUP.BLUR': { actions: ['clearFocusedValue'] },
        // 按压通道：条目按 value 记按住的那一个；整组禁用不进，条目自身的禁用由 connect 判定后随事件带入
        'PRESS.START': { guard: 'canPress', actions: ['startPress'] },
        'PRESS.END': { actions: ['endPress'] },
      },
    },
  },
  implementations: {
    guards: {
      // 整组禁用一票否决；条目自身的禁用随事件带入
      canPress: ({ prop, event }) => {
        const e = event.current()
        return e.type === 'PRESS.START' && !prop('disabled') && !e.disabled
      },
    },
    actions: {
      startPress: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'PRESS.START')
          context.set('pressedValue', e.value)
      },
      // 只收自己那一下：另一个条目的 keyup 不该把正按着的这个松开
      endPress: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'PRESS.END' && context.get('pressedValue') === e.value)
          context.set('pressedValue', null)
      },
      releaseWhenInert: ({ context, prop }) => {
        if (prop('disabled'))
          context.set('pressedValue', null)
      },
      // 受控（给了 value 却没给 defaultValue）时不自改，交给宿主回写
      resetToDefault: params => void resetDeclaredValue(params, 'value', 'value', 'defaultValue'),

      setValue: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'VALUE.SET')
          return
        const next = normalizeToggleGroupValue(e.value, !!prop('multiple')) ?? []
        // 公开 API 不得造出界面造不出的值：disallowEmpty 下清空同样不认
        if (!next.length && prop('disallowEmpty'))
          return
        context.set('value', next)
      },
      toggleItem: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'ITEM.TOGGLE')
          return
        const current = context.get('value')
        const next = current.includes(e.value)
          ? current.filter(v => v !== e.value)
          // 单选选中一项即挤掉其余，集合恒为长度 1
          : (prop('multiple') ? [...current, e.value] : [e.value])
        // disallowEmpty：最后一个选中项点不掉，值恒非空
        if (!next.length && prop('disallowEmpty'))
          return
        context.set('value', next)
      },
      setFocusedValue: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'ITEM.TOGGLE' || e.type === 'ITEM.FOCUS')
          context.set('focusedValue', e.value)
      },
      clearFocusedValue: ({ context }) => context.set('focusedValue', null),
    },
  },
})
