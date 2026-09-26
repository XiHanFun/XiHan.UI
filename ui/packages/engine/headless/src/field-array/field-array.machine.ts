/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 field array 相关实现。

import type { Params, RefsFacade } from '@xihan-ui/core'
import type { FieldArrayFocusTarget, FieldArrayPendingKeys, FieldArrayPressedKey, FieldArraySchema } from './field-array.types'
import { focusSafely, resetDeclaredValue, setup, trackListMotion } from '@xihan-ui/core'
import { getFormPathValue } from '../form'
import { fieldArrayTriggerId } from './field-array.anatomy'

const { createMachine } = setup<FieldArraySchema>()

/** 绑定到 Form 后，数组值只从 Form 真源读取；不是数组时按空数组呈现。 */
export function fieldArrayValue(service: Pick<Params<FieldArraySchema>, 'context' | 'refs' | 'prop'>): unknown[] {
  const form = service.refs.get('form')
  const name = service.prop('name')
  if (form && name !== undefined) {
    const value = getFormPathValue(form.context.get('values'), name)
    return Array.isArray(value) ? value : []
  }
  return service.context.get('value')
}

/** 逐项比引用：数组每次都是新的，不比内容的话值没变也会通知一遍。 */
export function sameRows(a: readonly unknown[], b: readonly unknown[] | undefined): boolean {
  return !!b && a.length === b.length && a.every((row, i) => Object.is(row, b[i]))
}

/** 行数上下限的归一：负数与非有限值按"没给"处理。 */
export function rowBound(raw: number | undefined): number | undefined {
  return raw != null && Number.isFinite(raw) && raw >= 0 ? Math.trunc(raw) : undefined
}

/** 已到下限：再删就少于 min 了。min 缺省为 0，空列表因此也算到底。 */
export function atRowMin(count: number, min: number | undefined): boolean {
  return count <= (min ?? 0)
}

/** 已到上限：再加就多于 max 了。 */
export function atRowMax(count: number, max: number | undefined): boolean {
  return max != null && count >= max
}

/** 行号的形状。 */
function rowKey(seq: number): string {
  return `row-${seq}`
}

/** 发 n 个新号并推进流水号。 */
function mintKeys(refs: RefsFacade<FieldArraySchema>, n: number): string[] {
  const seq = refs.get('keySeq')
  refs.set('keySeq', seq + n)
  return Array.from({ length: n }, (_, i) => rowKey(seq + i))
}

/** 把一项从 from 挪到 to；下标越界就原样返回一份拷贝。 */
export function moveRow<T>(list: readonly T[], from: number, to: number): T[] {
  const out = [...list]
  if (from < 0 || from >= out.length || to < 0 || to >= out.length)
    return out
  const [row] = out.splice(from, 1)
  out.splice(to, 0, row as T)
  return out
}

/**
 * 落一次结构改动：新号先搁进 pending，再写值。
 * 写值这一步在受控下只发通知、不改内部值，所以号不能当场落，得等 value 真的变了由 syncKeys 认领。
 */
function commit(
  params: Params<FieldArraySchema>,
  next: FieldArrayPendingKeys,
  mutation: { type: 'insert', index: number } | { type: 'remove', index: number } | { type: 'move', from: number, to: number },
): void {
  params.refs.set('pending', next)
  const form = params.refs.get('form')
  const name = params.prop('name')
  if (form && name !== undefined) {
    form.send({ type: 'FIELD.ARRAY.MUTATE', name, value: next.value, mutation })
    params.prop('onValueChange')?.({ value: next.value })
    params.action(['syncKeys'])
    return
  }
  params.context.set('value', next.value)
}

/** 等宿主把这一轮渲染提交完，再把焦点交给指定的把手。 */
function restoreFocus(params: Params<FieldArraySchema>, target: FieldArrayFocusTarget): void {
  const { scope, flush } = params
  flush(() => {
    focusSafely(scope.getById(fieldArrayTriggerId(scope, target.part, target.index)))
  })
}

/**
 * 行条目：库写的部件属性；Web Components 里作者刚插进来的行只带 data-xh-part，
 * 下一轮接线才写上部件属性，到达得在插入的那一刻认出来。后者只认根节点的直接子节点，行里嵌的别的组件不算。
 */
const FIELD_ARRAY_ITEM_SELECTOR = '[data-scope="field-array"][data-part="item"], [data-scope="field-array"][data-part="root"] > [data-xh-part="item"]'

/**
 * 值是宿主的数据数组，机器只管增删换序这三个动作，不碰行里放了什么。
 * 值住在 context 的 cell 里，受控/非受控在 cell 收口，不需要影子事件与受控守卫；
 * 行号住在另一个 cell 里，恒非受控，由 syncKeys 跟着值走。
 */
export const fieldArrayMachine = createMachine({
  name: 'field-array',
  refs: ({ prop }) => ({
    getRootEl: () => null,
    keySeq: (prop('value') ?? prop('defaultValue') ?? []).length,
    pending: null,
    form: null,
  }),
  context: ({ prop, cell }) => {
    const seed = prop('value') ?? prop('defaultValue') ?? []
    const seedKeys = seed.map((_, i) => rowKey(i))
    return {
      value: cell<unknown[]>(() => ({
        value: prop('value'),
        defaultValue: prop('defaultValue') ?? [],
        isEqual: sameRows,
        // 通知必须挂在 cell 上：受控时 set 不写内部值，只有这条回调能把用户意图送出去
        onChange: value => prop('onValueChange')?.({ value }),
      })),
      keys: cell<string[]>(() => ({ defaultValue: seedKeys, isEqual: sameRows })),
      // 按压通道：被 Space / Enter 或触屏按住的那一个把手（新增 / 逐行删除 / 上移 / 下移），按 key 记
      pressed: cell<FieldArrayPressedKey | null>(() => ({ defaultValue: null })),
      listTracked: cell<boolean>(() => ({ defaultValue: false })),
    }
  },
  initialState: () => 'idle',
  effects: ['trackListMotion'],
  // 适配器会在挂载前把最近 Form 接进 refs；首个 entry 统一把行号对到 Form 真源。
  entry: ['syncKeys'],
  watch: ({ track, prop, context, action }) => {
    // 值一变就把号对上，受控写回与作者整份替换都经这里
    track([context.dep('value')], () => action(['syncKeys']))
    // 按住途中转入禁用 / 只读，或按住的行内把手随行离场（作者整份换掉值）：不会再来 keyup，按压面由机器自己收。
    // 值也盯着：号在上一条 watch 里刚对完，这一条排在后面读到的已是新号
    track([() => prop('disabled'), () => prop('readOnly'), context.dep('value'), context.dep('keys')], () => action(['releaseWhenInert']))
  },
  // 表单重置从任何状态都要认，所以挂根级。不设禁用/只读守卫：原生表单的重置算法不看这两个标志
  on: {
    'FORM.RESET': { actions: ['resetToDefault'] },
    // 按压通道：四类把手都是 aria-disabled 而非原生 disabled，按不动的那一下由 connect 随事件带来、守卫拦下
    'PRESS.START': { guard: 'canPress', actions: ['startPress'] },
    'PRESS.END': { actions: ['endPress'] },
    'LIST.TRACKED': { actions: ['markListTracked'] },
  },
  states: {
    idle: {
      // 省略 target：只跑 actions，不换状态
      on: {
        // VALUE.SET 是程序化入口，不挂闸门：受控父组件写回值走的正是这条
        'VALUE.SET': { actions: ['setValue'] },
        'ITEM.ADD': { guard: 'canAdd', actions: ['addItem'] },
        'ITEM.REMOVE': { guard: 'canRemove', actions: ['removeItem'] },
        'ITEM.MOVE': { guard: 'canMove', actions: ['moveItem'] },
      },
    },
  },
  implementations: {
    guards: {
      canAdd: params => !params.prop('disabled') && !params.prop('readOnly') && !atRowMax(fieldArrayValue(params).length, rowBound(params.prop('max'))),
      canRemove: params => !params.prop('disabled') && !params.prop('readOnly') && !atRowMin(fieldArrayValue(params).length, rowBound(params.prop('min'))),
      canMove: params => !params.prop('disabled') && !params.prop('readOnly') && !!params.prop('movable'),
      // 整体禁用 / 只读一律不进；到上下限、首末行这类逐个把手的「按不动」由 connect 随事件带来
      canPress: ({ prop, event }) => {
        const e = event.current()
        return e.type === 'PRESS.START' && !e.disabled && !prop('disabled') && !prop('readOnly')
      },
    },
    effects: {
      /**
       * 行的到达、离场与换位：首帧就在的行直接呈现，新增的行播进场，删掉的行在原处播完退场，
       * 上移下移与增删带来的换位滑过去。React 的祖先 ref 在子组件 layout effect 之后才附着，
       * 延到提交后的微任务再取，仍在首帧绘制之前。没有 DOM 的宿主里取不到容器，不接。
       */
      trackListMotion: ({ refs, send, flush }) => {
        let disposed = false
        let stop: (() => void) | undefined
        flush(() => {
          queueMicrotask(() => {
            const root = refs.get('getRootEl')()
            if (disposed || !root)
              return
            stop = trackListMotion(root, { item: FIELD_ARRAY_ITEM_SELECTOR })
            send({ type: 'LIST.TRACKED' })
          })
        })
        return () => {
          disposed = true
          stop?.()
        }
      },
    },
    actions: {
      markListTracked: ({ context }) => context.set('listTracked', true),
      startPress: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'PRESS.START')
          context.set('pressed', e.key)
      },
      // 只收自己那一下：另一个把手的 keyup 不该把正按着的这个松开
      endPress: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'PRESS.END' && context.get('pressed') === e.key)
          context.set('pressed', null)
      },
      // 删除 / 换序落地后把手随行离场或换位（Enter 在 keydown 即动手）：不等 keyup，当场松开
      releasePress: ({ context }) => context.set('pressed', null),
      // 转入禁用 / 只读一律松开；按住的行内把手所属的行不在列表里了也松开
      releaseWhenInert: ({ context, prop }) => {
        const pressed = context.get('pressed')
        if (pressed == null)
          return
        if (prop('disabled') || prop('readOnly')) {
          context.set('pressed', null)
          return
        }
        if (pressed === 'add')
          return
        const key = pressed.slice(pressed.indexOf(':') + 1)
        if (!context.get('keys').includes(key))
          context.set('pressed', null)
      },

      resetToDefault: (params) => {
        if (params.refs.get('form')) {
          params.action(['syncKeys'])
          return
        }
        void resetDeclaredValue(params, 'value', 'value', 'defaultValue')
      },

      setValue: (params) => {
        const { context, event } = params
        const e = event.current()
        if (e.type !== 'VALUE.SET')
          return
        const form = params.refs.get('form')
        const name = params.prop('name')
        if (form && name !== undefined) {
          form.send({ type: 'FIELD.ARRAY.MUTATE', name, value: [...e.value], mutation: { type: 'replace', length: e.value.length } })
          params.prop('onValueChange')?.({ value: [...e.value] })
          params.action(['syncKeys'])
          return
        }
        context.set('value', [...e.value])
      },

      addItem: (params) => {
        params.action(['syncKeys'])
        const { context, prop, refs } = params
        const create = prop('createItem')
        // 没给工厂就补一个 null 而不是 undefined：这份值多半要序列化出去，undefined 在那一步会整项消失
        commit(params, {
          value: [...fieldArrayValue(params), create ? create() : null],
          keys: [...context.get('keys'), ...mintKeys(refs, 1)],
        }, { type: 'insert', index: fieldArrayValue(params).length })
      },

      removeItem: (params) => {
        params.action(['syncKeys'])
        const e = params.event.current()
        if (e.type !== 'ITEM.REMOVE')
          return
        const { context } = params
        const value = fieldArrayValue(params)
        if (e.index < 0 || e.index >= value.length)
          return
        const rest = value.filter((_, i) => i !== e.index)
        commit(params, {
          value: rest,
          keys: context.get('keys').filter((_, i) => i !== e.index),
        }, { type: 'remove', index: e.index })
        params.action(['releasePress'])
        if (!e.restoreFocus)
          return
        // 删掉的那个把手随行离场，焦点接给接位的那一行；整份删空了就交回新增把手
        restoreFocus(params, rest.length === 0
          ? { part: 'add-trigger' }
          : { part: 'item-delete-trigger', index: Math.min(e.index, rest.length - 1) })
      },

      moveItem: (params) => {
        params.action(['syncKeys'])
        const e = params.event.current()
        if (e.type !== 'ITEM.MOVE')
          return
        const { context } = params
        const value = fieldArrayValue(params)
        const last = value.length - 1
        if (e.from < 0 || e.from > last || e.to < 0 || e.to > last || e.from === e.to)
          return
        commit(params, {
          value: moveRow(value, e.from, e.to),
          keys: moveRow(context.get('keys'), e.from, e.to),
        }, { type: 'move', from: e.from, to: e.to })
        params.action(['releasePress'])
        if (!e.restoreFocus)
          return
        // 焦点跟着被挪的这一行走，落在新位置上同方向的那个把手上
        restoreFocus(params, {
          part: e.to < e.from ? 'move-up-trigger' : 'move-down-trigger',
          index: e.to,
        })
      },

      /**
       * 把号对到当下的值上。
       *
       * 值正是刚才那次改动算出来的那一份，就用它算好的号（增删换序都精确对位）；
       * 对不上说明值是从外面整份换掉的，此时只能按位置续用旧号，长出来的补新号。
       */
      syncKeys: (params) => {
        const { context, refs } = params
        const value = fieldArrayValue(params)
        const pending = refs.get('pending')
        if (pending && sameRows(pending.value, value)) {
          refs.set('pending', null)
          context.set('keys', pending.keys)
          return
        }
        const keys = context.get('keys')
        if (keys.length === value.length)
          return
        const next = keys.slice(0, value.length)
        next.push(...mintKeys(refs, value.length - next.length))
        context.set('keys', next)
      },
    },
  },
})
