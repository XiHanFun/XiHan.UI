import type { Params, RefsFacade } from '@xihan-ui/machine'
import type { DynamicInputFocusTarget, DynamicInputPendingKeys, DynamicInputSchema } from './dynamic-input.types'
import { focusSafely } from '@xihan-ui/behavior'
import { setup } from '@xihan-ui/machine'
import { dynamicInputTriggerId } from './dynamic-input.anatomy'

const { createMachine } = setup<DynamicInputSchema>()

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
function mintKeys(refs: RefsFacade<DynamicInputSchema>, n: number): string[] {
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
function commit(params: Params<DynamicInputSchema>, next: DynamicInputPendingKeys): void {
  params.refs.set('pending', next)
  params.context.set('value', next.value)
}

/** 等宿主把这一轮渲染提交完，再把焦点交给指定的把手。 */
function restoreFocus(params: Params<DynamicInputSchema>, target: DynamicInputFocusTarget): void {
  const { scope, flush } = params
  flush(() => {
    focusSafely(scope.getById(dynamicInputTriggerId(scope, target.part, target.index)))
  })
}

/**
 * 值是宿主的数据数组，机器只管增删换序这三个动作，不碰行里放了什么。
 * 值住在 context 的 cell 里，受控/非受控在 cell 收口，不需要影子事件与受控守卫；
 * 行号住在另一个 cell 里，恒非受控，由 syncKeys 跟着值走。
 */
export const dynamicInputMachine = createMachine({
  name: 'dynamic-input',
  refs: ({ prop }) => ({
    keySeq: (prop('value') ?? prop('defaultValue') ?? []).length,
    pending: null,
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
    }
  },
  initialState: () => 'idle',
  // 值一变就把号对上，受控写回与作者整份替换都经这里
  watch: ({ track, context, action }) => track([context.dep('value')], () => action(['syncKeys'])),
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
      canAdd: ({ prop, context }) => !prop('disabled') && !atRowMax(context.get('value').length, rowBound(prop('max'))),
      canRemove: ({ prop, context }) => !prop('disabled') && !atRowMin(context.get('value').length, rowBound(prop('min'))),
      canMove: ({ prop }) => !prop('disabled') && !!prop('movable'),
    },
    actions: {
      setValue: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'VALUE.SET')
          context.set('value', [...e.value])
      },

      addItem: (params) => {
        const { context, prop, refs } = params
        const create = prop('createItem')
        // 没给工厂就补一个 null 而不是 undefined：这份值多半要序列化出去，undefined 在那一步会整项消失
        commit(params, {
          value: [...context.get('value'), create ? create() : null],
          keys: [...context.get('keys'), ...mintKeys(refs, 1)],
        })
      },

      removeItem: (params) => {
        const e = params.event.current()
        if (e.type !== 'ITEM.REMOVE')
          return
        const { context } = params
        const value = context.get('value')
        if (e.index < 0 || e.index >= value.length)
          return
        const rest = value.filter((_, i) => i !== e.index)
        commit(params, {
          value: rest,
          keys: context.get('keys').filter((_, i) => i !== e.index),
        })
        if (!e.restoreFocus)
          return
        // 删掉的那个把手随行离场，焦点接给接位的那一行；整份删空了就交回新增把手
        restoreFocus(params, rest.length === 0
          ? { part: 'add-trigger' }
          : { part: 'remove-trigger', index: Math.min(e.index, rest.length - 1) })
      },

      moveItem: (params) => {
        const e = params.event.current()
        if (e.type !== 'ITEM.MOVE')
          return
        const { context } = params
        const value = context.get('value')
        const last = value.length - 1
        if (e.from < 0 || e.from > last || e.to < 0 || e.to > last || e.from === e.to)
          return
        commit(params, {
          value: moveRow(value, e.from, e.to),
          keys: moveRow(context.get('keys'), e.from, e.to),
        })
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
      syncKeys: ({ context, refs }) => {
        const value = context.get('value')
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
