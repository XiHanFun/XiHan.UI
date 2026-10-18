/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 field array 相关实现。

import type { Params, RefsFacade, Service } from '@xihan-ui/core'
import type { FormArrayMutation } from '../form'
import type { SortableSchema } from '../sortable/sortable.types'
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

/** 插入位置的归一：取整后夹到 0 到行数之间；没给或不是有限数即追加在末尾。 */
export function fieldArrayInsertIndex(raw: number | undefined, length: number): number {
  if (raw == null || !Number.isFinite(raw))
    return length
  return Math.min(length, Math.max(0, Math.trunc(raw)))
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

/** 本组发起的那几次写值各是哪一种行变更：按新数组的身份记，落值的 onChange 取出来附上。 */
const pendingMutations = new WeakMap<readonly unknown[], FormArrayMutation>()

/** 写值通知的载荷：这份数组是本组的行变更写出来的就带上那一种。 */
function changeDetails(value: unknown[]): { value: unknown[], mutation?: FormArrayMutation } {
  const mutation = pendingMutations.get(value)
  return mutation ? { value, mutation } : { value }
}

/**
 * 落一次结构改动：新号先搁进 pending，再写值。
 * 写值这一步在受控下只发通知、不改内部值，所以号不能当场落，得等 value 真的变了由 syncKeys 认领。
 */
function commit(
  params: Params<FieldArraySchema>,
  next: FieldArrayPendingKeys,
  mutation: { type: 'insert', index: number } | { type: 'remove', index: number } | { type: 'move', from: number, to: number },
  dropped = false,
): void {
  params.refs.set('pending', next)
  params.refs.set('dropped', dropped)
  const form = params.refs.get('form')
  const name = params.prop('name')
  if (form && name !== undefined) {
    form.send({ type: 'FIELD.ARRAY.MUTATE', name, value: next.value, mutation })
    params.prop('onValueChange')?.({ value: next.value, mutation })
    params.action(['syncKeys'])
    return
  }
  pendingMutations.set(next.value, mutation)
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
const FIELD_ARRAY_TABLE_SELECTOR = '[data-scope="field-array"][data-part="table"]'
const FIELD_ARRAY_ROOT_SELECTOR = '[data-scope="field-array"][data-part="root"]'

/** 滚动位置离一端不到这么多像素就算贴着这一端：小数缩放下 scrollLeft 到不了整数端点。 */
const EDGE_EPSILON = 1

type ScrollEdges = FieldArraySchema['context']['scrollEdges']

const sameEdges = (a: ScrollEdges, b: ScrollEdges | undefined): boolean => !!b && a.atStart === b.atStart && a.atEnd === b.atEnd

/** 滚动容器横向离两端的远近；RTL 下 scrollLeft 从 0 往负数走，按绝对值算。 */
function scrollEdgesOf(el: HTMLElement, rtl: boolean): ScrollEdges {
  const offset = rtl ? Math.abs(el.scrollLeft) : el.scrollLeft
  const max = el.scrollWidth - el.clientWidth
  return { atStart: offset <= EDGE_EPSILON, atEnd: offset >= max - EDGE_EPSILON }
}

/** 根节点自己的表格本体：嵌套的另一个字段数组里的表格不算。 */
function ownTable(root: HTMLElement): HTMLElement | null {
  for (const el of root.querySelectorAll<HTMLElement>(FIELD_ARRAY_TABLE_SELECTOR)) {
    if (el.closest(FIELD_ARRAY_ROOT_SELECTOR) === root)
      return el
  }
  return null
}

const FIELD_ARRAY_ROW_SELECTOR = '[data-scope="field-array"][data-part="item"]'

/**
 * 拖动换序用的 sortable 机器的 props：项是各行，标识取行 key，顺序就是行序；不换序、禁用或只读时拖不动。
 * 放下即按 from / to 换位，与上移、下移同一条路径（同受 movable 与禁用约束），各行滑进新位置由 sortable 负责。
 * 拖动把手只接指针，sortable 的读屏播报用不上，不必给文案。
 */
export function fieldArrayDragProps(service: Pick<Service<FieldArraySchema>, 'context' | 'refs' | 'prop' | 'send'>): Partial<SortableSchema['props']> {
  const value = fieldArrayValue(service)
  const pending = service.refs.get('pending')
  const keys = pending && sameRows(pending.value, value) ? pending.keys : service.context.get('keys')
  return {
    ids: keys,
    orientation: 'vertical',
    disabled: !service.prop('movable') || !!service.prop('disabled') || !!service.prop('readOnly'),
    onSort: ({ from, to }) => service.send({ type: 'ITEM.MOVE', from, to, drag: true }),
  }
}

/** 拖动换序的容器：表格排布是表格本体（行在它里面，横向滚动也在它上面），列表排布是根节点。 */
export function fieldArrayDragContainer(root: HTMLElement | null): HTMLElement | null {
  return root ? ownTable(root) ?? root : null
}

/** 拖动换序的项：这个字段数组自己的行，按文档序；嵌在行里的另一个字段数组的行不算。 */
export function fieldArrayDragItems(root: HTMLElement | null): HTMLElement[] {
  if (!root)
    return []
  return [...root.querySelectorAll<HTMLElement>(FIELD_ARRAY_ROW_SELECTOR)].filter(el => el.closest(FIELD_ARRAY_ROOT_SELECTOR) === root)
}

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
    dropped: false,
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
        onChange: value => prop('onValueChange')?.(changeDetails(value)),
      })),
      keys: cell<string[]>(() => ({ defaultValue: seedKeys, isEqual: sameRows })),
      // 按压通道：被 Space / Enter 或触屏按住的那一个把手（新增 / 逐行删除 / 上移 / 下移），按 key 记
      pressed: cell<FieldArrayPressedKey | null>(() => ({ defaultValue: null })),
      listTracked: cell<boolean>(() => ({ defaultValue: false })),
      scrollEdges: cell<ScrollEdges>(() => ({ defaultValue: { atStart: true, atEnd: true }, isEqual: sameEdges })),
    }
  },
  initialState: () => 'idle',
  effects: ['trackListMotion', 'trackScrollEdges'],
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
            stop = trackListMotion(root, {
              item: FIELD_ARRAY_ITEM_SELECTOR,
              // 拖动放下的那一批换位由拖动那一套滑过去，这里不再补偿；问过即撤，下一批照常
              reflow: () => {
                const dropped = refs.get('dropped')
                refs.set('dropped', false)
                return !dropped
              },
            })
            send({ type: 'LIST.TRACKED' })
          })
        })
        return () => {
          disposed = true
          stop?.()
        }
      },
      /**
       * 表格排布横向滚动离两端还有多远，给钉在两侧的行头与把手画分隔线用。滚动容器是表格本体；
       * 滚动与尺寸变化时现量，根节点子树换了节点（生成结构、增删行）时重新找表格本体并挂上。
       */
      trackScrollEdges: ({ refs, prop, context, scope, flush }) => {
        let disposed = false
        let stop: (() => void) | undefined
        flush(() => {
          queueMicrotask(() => {
            const root = refs.get('getRootEl')()
            if (disposed || !root)
              return
            const win = scope.getWin()
            let table: HTMLElement | null = null
            const read = (): void => {
              if (!table || prop('layout') !== 'table') {
                context.set('scrollEdges', { atStart: true, atEnd: true })
                return
              }
              context.set('scrollEdges', scrollEdgesOf(table, win.getComputedStyle(table).direction === 'rtl'))
            }
            const resize = typeof win.ResizeObserver === 'function' ? new win.ResizeObserver(read) : null
            const attach = (): void => {
              const next = ownTable(root)
              if (next !== table) {
                table?.removeEventListener('scroll', read)
                table = next
                table?.addEventListener('scroll', read, { passive: true })
              }
              resize?.disconnect()
              if (table) {
                resize?.observe(table)
                for (const child of table.children)
                  resize?.observe(child)
              }
              read()
            }
            const mutations = typeof win.MutationObserver === 'function' ? new win.MutationObserver(attach) : null
            mutations?.observe(root, { childList: true, subtree: true })
            attach()
            stop = () => {
              table?.removeEventListener('scroll', read)
              resize?.disconnect()
              mutations?.disconnect()
            }
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
          const mutation: FormArrayMutation = { type: 'replace', length: e.value.length }
          form.send({ type: 'FIELD.ARRAY.MUTATE', name, value: [...e.value], mutation })
          params.prop('onValueChange')?.({ value: [...e.value], mutation })
          params.action(['syncKeys'])
          return
        }
        const next = [...e.value]
        pendingMutations.set(next, { type: 'replace', length: next.length })
        params.refs.set('dropped', false)
        context.set('value', next)
      },

      addItem: (params) => {
        params.action(['syncKeys'])
        const { context, event, prop, refs } = params
        const e = event.current()
        const value = fieldArrayValue(params)
        const keys = context.get('keys')
        const index = fieldArrayInsertIndex(e.type === 'ITEM.ADD' ? e.index : undefined, value.length)
        const create = prop('createItem')
        // 没给工厂就补一个 null 而不是 undefined：这份值多半要序列化出去，undefined 在那一步会整项消失
        const row = e.type === 'ITEM.ADD' && e.item ? e.item.value : create ? create() : null
        // 新行拿一个从没用过的号插在同一个位置，别的行各自的号原样不动
        commit(params, {
          value: [...value.slice(0, index), row, ...value.slice(index)],
          keys: [...keys.slice(0, index), ...mintKeys(refs, 1), ...keys.slice(index)],
        }, { type: 'insert', index })
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
        }, { type: 'move', from: e.from, to: e.to }, e.drag === true)
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
