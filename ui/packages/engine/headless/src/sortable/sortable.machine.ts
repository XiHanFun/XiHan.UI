/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 sortable 相关实现。

import type { ContextFacade, RefsFacade } from '@xihan-ui/core'
import type { DndRect } from '@xihan-ui/pointer'
import type { SortableSchema } from './sortable.types'
import { ITEM_VALUE_ATTR, queryItems, setup } from '@xihan-ui/core'
import { createSpringValue, frameLoop } from '@xihan-ui/motion'
import {
  createPointerSession,
  edgeScrollDelta,
  moveItem,
  projectSortable,
  resolveSessionDoc,
  shouldActivate,
} from '@xihan-ui/pointer'
import { sortableAnatomy } from './sortable.anatomy'
import { sortableAnnouncement } from './sortable.announce'

const { createMachine } = setup<SortableSchema>()

const ZERO = { x: 0, y: 0 }
const ITEM_QUERY = { scope: sortableAnatomy.name, part: 'item' }

/** 项元素按文档序。几何一律从 DOM 量，`ids` 只管回调里那份顺序。 */
function itemElements(root: HTMLElement | null): HTMLElement[] {
  return queryItems(root, ITEM_QUERY)
}

export function toDndRect(el: HTMLElement): DndRect {
  const r = el.getBoundingClientRect()
  return { x: r.x, y: r.y, width: r.width, height: r.height }
}

/**
 * 容器左上角在视口里的位置，减去它自身的滚动量。
 * 项的矩形是视口坐标，落点线是容器的绝对定位子节点，两者差的就是这个原点。
 */
function rootOriginOf(root: HTMLElement | null): { x: number, y: number } | null {
  if (!root)
    return null
  const rect = root.getBoundingClientRect()
  return { x: rect.x - root.scrollLeft, y: rect.y - root.scrollTop }
}

/** 这一项的节点。 */
function itemEl(root: HTMLElement | null, id: string): HTMLElement | undefined {
  return itemElements(root).find(item => item.getAttribute(ITEM_VALUE_ATTR) === id)
}

/** 撤下放下归位的弹簧，那一项停在新位置上。 */
function stopSettle(refs: RefsFacade<SortableSchema>, context: ContextFacade<SortableSchema>): void {
  refs.get('settle')?.x.stop()
  refs.get('settle')?.y.stop()
  refs.set('settle', null)
  context.set('settle', null)
}

/** 这一项在 DOM 里排第几。找不到返回 -1。 */
function indexOfId(root: HTMLElement | null, id: string): number {
  return itemElements(root).findIndex(el => el.getAttribute(ITEM_VALUE_ATTR) === id)
}

/** 这一项屏幕上写着什么。节点不在、或里面一个字都没有时返回 null。 */
function itemTextOf(root: HTMLElement | null, id: string): string | null {
  const el = itemElements(root).find(item => item.getAttribute(ITEM_VALUE_ATTR) === id)
  const text = el?.textContent?.replace(/\s+/g, ' ').trim()
  return text || null
}

export const sortableMachine = createMachine({
  name: 'sortable',
  context: ({ cell }) => ({
    activeId: cell<string | null>(() => ({ defaultValue: null })),
    from: cell<number>(() => ({ defaultValue: -1 })),
    to: cell<number>(() => ({ defaultValue: -1 })),
    mode: cell<SortableSchema['context']['mode']>(() => ({ defaultValue: null })),
    delta: cell<SortableSchema['context']['delta']>(() => ({
      defaultValue: ZERO,
      isEqual: (a, b) => !!b && a.x === b.x && a.y === b.y,
    })),
    settle: cell<SortableSchema['context']['settle']>(() => ({
      defaultValue: null,
      isEqual: (a, b) => a === b || (!!a && !!b && a.id === b.id && a.x === b.x && a.y === b.y),
    })),
    rects: cell<DndRect[]>(() => ({
      defaultValue: [],
      // 每帧都是新数组，默认的 Object.is 会把「没变」也判成变了
      isEqual: (a, b) => Array.isArray(b) && a.length === b.length && a.every((r, i) => r === b.at(i)),
    })),
    rootOrigin: cell<SortableSchema['context']['rootOrigin']>(() => ({
      defaultValue: null,
      // 每次拾起都是新对象，默认的 Object.is 会把「没变」也判成变了
      isEqual: (a, b) => a === b || (!!a && !!b && a.x === b.x && a.y === b.y),
    })),
    announcement: cell<string>(() => ({ defaultValue: '' })),
    // 按压通道：被 Space / Enter 或触屏按住的那一个把手所属项，按 id 记
    pressedId: cell<string | null>(() => ({ defaultValue: null })),
  }),
  refs: () => ({
    getRootEl: () => null,
    origin: null,
    drop: null,
    settle: null,
  }),
  initialState: () => 'idle',
  // 放下归位的弹簧跨状态存在（回到 idle 之后才起），卸载时由它收
  effects: ['trackSettle'],
  // 按住途中整体转禁用，或按住的把手所属项离开了 ids：不会再来 keyup，按压面由机器自己收
  watch: ({ track, prop, action }) => {
    track([() => prop('disabled'), () => prop('ids')], () => action(['releaseWhenInert']))
  },
  // 松开从任何状态都要认
  on: {
    'PRESS.END': { actions: ['endPress'] },
  },
  states: {
    idle: {
      on: {
        // 按下先进 pending：还没走够激活距离，这一下可能只是点击
        'ITEM.POINTER_DOWN': { guard: 'canSort', target: 'pending', actions: ['setPending'] },
        'ITEM.PICKUP': { guard: 'canSort', target: 'dragging', actions: ['startKeyboardDrag'] },
        // 按压通道：触屏按下的那一帧与 ITEM.POINTER_DOWN 并存，拖动真开始前把手先有按压面
        'PRESS.START': { guard: 'canPress', actions: ['startPress'] },
      },
    },
    pending: {
      // pending 也要跟指针：走够距离才升级成拖动，抬手就散
      effects: ['trackPointer'],
      on: {
        'PRESS.START': { guard: 'canPress', actions: ['startPress'] },
        // 守卫不过就原地不动，视觉上完全没有拖动发生
        'POINTER.MOVE': { guard: 'passedActivation', target: 'dragging', actions: ['startPointerDrag', 'trackDelta'] },
        'POINTER.END': { target: 'idle', actions: ['clearSession'] },
        'POINTER.CANCEL': { target: 'idle', actions: ['clearSession'] },
      },
    },
    dragging: {
      // 拖动一开始就撤下按压面：拖动中的回执是 data-dragging，不叠着 data-pressed 一路拖到底
      entry: ['releasePress'],
      effects: ['trackPointer', 'trackAutoScroll'],
      on: {
        'POINTER.MOVE': { actions: ['trackDelta'] },
        // 放下：先记下被拖项此刻在屏幕上的位置，宿主按新顺序重排之后再把它从这里收进新位置
        'POINTER.END': { target: 'idle', actions: ['captureDrop', 'commit', 'invokeDragEnd', 'clearSession', 'settleDrop'] },
        // 系统收走指针按取消算：顺序不动
        'POINTER.CANCEL': { target: 'idle', actions: ['captureDrop', 'cancel', 'invokeDragEnd', 'clearSession', 'settleDrop'] },
        'KEY.MOVE': { actions: ['stepTo'] },
        'KEY.DROP': { target: 'idle', actions: ['captureDrop', 'commit', 'invokeDragEnd', 'clearSession', 'settleDrop'] },
        'KEY.CANCEL': { target: 'idle', actions: ['cancel', 'invokeDragEnd', 'clearSession'] },
      },
    },
  },
  implementations: {
    guards: {
      canSort: ({ prop }) => !prop('disabled'),
      // 整体禁用一律不进；该项自己的禁用由 connect 随事件带来
      canPress: ({ prop, event }) => {
        const e = event.current()
        return e.type === 'PRESS.START' && !e.disabled && !prop('disabled')
      },
      passedActivation: ({ prop, refs, event }) => {
        const e = event.current()
        if (e.type !== 'POINTER.MOVE')
          return false
        return shouldActivate(deltaFrom(refs.get('origin'), e.point), { distance: prop('activationDistance') })
      },
    },
    actions: {
      startPress: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'PRESS.START')
          context.set('pressedId', e.id)
      },
      // 只收自己那一下：另一个把手的 keyup 不该把正按着的这个松开
      endPress: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'PRESS.END' && context.get('pressedId') === e.id)
          context.set('pressedId', null)
      },
      releasePress: ({ context }) => context.set('pressedId', null),
      // 转入禁用一律松开；按住的把手所属项不在 ids 里了也松开
      releaseWhenInert: ({ context, prop }) => {
        const pressed = context.get('pressedId')
        if (pressed != null && (prop('disabled') || !(prop('ids') ?? []).includes(pressed)))
          context.set('pressedId', null)
      },

      setPending: ({ context, event, refs }) => {
        stopSettle(refs, context)
        const e = event.current()
        if (e.type !== 'ITEM.POINTER_DOWN')
          return
        // 起点与被按的那一项先记着；量几何要等真的开拖，点一下不该付这笔代价
        refs.set('origin', e.point)
        context.set('activeId', e.id)
        context.set('from', indexOfId(refs.get('getRootEl')(), e.id))
        context.set('delta', ZERO)
      },

      startPointerDrag: ({ context, prop, refs, event }) => {
        const e = event.current()
        if (e.type !== 'POINTER.MOVE')
          return
        const root = refs.get('getRootEl')()
        context.set('rects', itemElements(root).map(toDndRect))
        context.set('rootOrigin', rootOriginOf(root))
        context.set('mode', 'pointer')
        context.set('delta', deltaFrom(refs.get('origin'), e.point))
        context.set('to', context.get('from'))
        say(context, prop, refs, 'picked')
        prop('onDragStart')?.({ id: context.get('activeId') ?? '', from: context.get('from'), mode: 'pointer' })
      },

      startKeyboardDrag: ({ context, prop, refs, event }) => {
        stopSettle(refs, context)
        const e = event.current()
        if (e.type !== 'ITEM.PICKUP')
          return
        const root = refs.get('getRootEl')()
        const index = indexOfId(root, e.id)
        context.set('activeId', e.id)
        context.set('from', index)
        context.set('to', index)
        context.set('mode', 'keyboard')
        context.set('delta', ZERO)
        context.set('rects', itemElements(root).map(toDndRect))
        context.set('rootOrigin', rootOriginOf(root))
        say(context, prop, refs, 'picked')
        prop('onDragStart')?.({ id: e.id, from: index, mode: 'keyboard' })
      },

      trackDelta: ({ context, prop, refs, event }) => {
        const e = event.current()
        if (e.type !== 'POINTER.MOVE')
          return
        const delta = deltaFrom(refs.get('origin'), e.point)
        context.set('delta', delta)
        const { to } = projectSortable({
          rects: context.get('rects'),
          from: context.get('from'),
          delta,
          axis: prop('orientation') ?? 'vertical',
        })
        if (to !== context.get('to')) {
          context.set('to', to)
          say(context, prop, refs, 'moved')
        }
      },

      stepTo: ({ context, prop, refs, event }) => {
        const e = event.current()
        if (e.type !== 'KEY.MOVE')
          return
        const next = context.get('to') + e.step
        // 夹住不回绕：回绕会让「一直按下去」悄悄绕回原位，看不出到底动没动
        if (next < 0 || next >= context.get('rects').length)
          return
        context.set('to', next)
        say(context, prop, refs, 'moved')
      },

      commit: ({ context, prop, refs }) => {
        const from = context.get('from')
        const to = context.get('to')
        const id = context.get('activeId')
        if (id == null || from < 0 || to < 0 || from === to)
          return
        prop('onSort')?.({ from, to, id, ids: moveItem(prop('ids') ?? [], from, to) })
        say(context, prop, refs, 'dropped')
      },

      cancel: ({ context, prop, refs }) => {
        // 落点退回起点：收尾回调与播报都按「没动过」来说
        context.set('to', context.get('from'))
        say(context, prop, refs, 'canceled')
      },

      invokeDragEnd: ({ context, prop, event }) => {
        const id = context.get('activeId')
        if (id == null)
          return
        const type = event.current().type
        prop('onDragEnd')?.({
          id,
          from: context.get('from'),
          to: context.get('to'),
          mode: context.get('mode') ?? 'pointer',
          canceled: type === 'POINTER.CANCEL' || type === 'KEY.CANCEL',
        })
      },

      captureDrop: ({ context, refs, event }) => {
        const id = context.get('activeId')
        const el = id == null ? undefined : itemEl(refs.get('getRootEl')(), id)
        if (id == null || !el) {
          refs.set('drop', null)
          return
        }
        const e = event.current()
        const rect = el.getBoundingClientRect()
        refs.set('drop', {
          id,
          left: rect.left,
          top: rect.top,
          velocity: e.type === 'POINTER.END' && e.velocity ? e.velocity : { x: 0, y: 0 },
        })
      },

      /**
       * 放下归位：等宿主按新顺序重排、这一帧提交之后，量那一项的新位置，差多少由两支弹簧带着松手速度收到零。
       * 宿主不接这次排序时量到的就是原位，照样收回原位。差得很少（键盘放下本就落在槽位上）时不起弹簧。
       */
      settleDrop: ({ context, refs, flush }) => {
        const drop = refs.get('drop')
        refs.set('drop', null)
        if (!drop)
          return
        flush(() => {
          const el = itemEl(refs.get('getRootEl')(), drop.id)
          if (!el)
            return
          const rect = el.getBoundingClientRect()
          const dx = drop.left - rect.left
          const dy = drop.top - rect.top
          if (Math.hypot(dx, dy) < 0.5 && Math.hypot(drop.velocity.x, drop.velocity.y) < 5)
            return
          stopSettle(refs, context)
          const current = { id: drop.id, x: dx, y: dy }
          const write = (): void => {
            const springs = refs.get('settle')
            if (springs)
              context.set('settle', { id: drop.id, x: springs.x.value, y: springs.y.value })
          }
          const springs = {
            x: createSpringValue({ spring: 'smooth', value: dx, target: el, onUpdate: write }),
            y: createSpringValue({ spring: 'smooth', value: dy, target: el, onUpdate: write }),
          }
          refs.set('settle', springs)
          context.set('settle', current)
          void Promise.all([
            springs.x.to(0, { velocity: drop.velocity.x }),
            springs.y.to(0, { velocity: drop.velocity.y }),
          ]).then(() => {
            if (refs.get('settle') === springs)
              stopSettle(refs, context)
          })
        })
      },

      clearSession: ({ context, refs }) => {
        refs.set('origin', null)
        context.set('activeId', null)
        context.set('from', -1)
        context.set('to', -1)
        context.set('mode', null)
        context.set('delta', ZERO)
        context.set('rects', [])
        context.set('rootOrigin', null)
      },
    },
    effects: {
      trackSettle: ({ refs, context }) => () => stopSettle(refs, context),

      /** 跟手交给指针会话。pending 与 dragging 共用同一份，升级状态时不会断手。 */
      trackPointer: ({ refs, send }) => {
        const session = createPointerSession({
          doc: resolveSessionDoc(refs.get('getRootEl')()),
          onMove: ({ point }) => send({ type: 'POINTER.MOVE', point }),
          onEnd: ({ reason, velocity }) => send(reason === 'pointercancel' ? { type: 'POINTER.CANCEL' } : { type: 'POINTER.END', velocity }),
        })
        return () => session.dispose()
      },

      /**
       * 拖到容器边缘时把容器滚起来，否则视口外的落点永远够不着。
       * 只在指针模式下跑：键盘拖动一步一格，由适配器把目标项滚进视野即可，不需要连续滚。
       */
      trackAutoScroll: ({ context, prop, refs, scope }) => {
        if (prop('autoScroll') === false || context.get('mode') !== 'pointer')
          return undefined
        const win = scope.getWin()
        if (typeof win.requestAnimationFrame !== 'function')
          return undefined

        return frameLoop(win, () => {
          const root = refs.get('getRootEl')()
          const origin = refs.get('origin')
          // scrollBy 不是哪儿都有：无头 DOM 与非 HTML 元素上都可能缺席，缺了就当这一轮不滚
          if (root && origin && typeof root.scrollBy === 'function') {
            const delta = context.get('delta')
            const step = edgeScrollDelta({
              bounds: toDndRect(root),
              point: { x: origin.clientX + delta.x, y: origin.clientY + delta.y },
            })
            if (step.x !== 0 || step.y !== 0)
              root.scrollBy(step.x, step.y)
          }
        })
      },
    },
  },
})

function deltaFrom(origin: { clientX: number, clientY: number } | null, point: { clientX: number, clientY: number }): { x: number, y: number } {
  if (!origin)
    return ZERO
  return { x: point.clientX - origin.clientX, y: point.clientY - origin.clientY }
}

/** 拼一句播报塞进 context，适配器把它渲进 aria-live 区域。 */
function say(
  context: { get: <K extends keyof SortableSchema['context']>(k: K) => SortableSchema['context'][K], set: (k: 'announcement', v: string) => void },
  prop: <K extends keyof SortableSchema['props']>(k: K) => SortableSchema['props'][K],
  refs: { get: <K extends keyof SortableSchema['refs']>(k: K) => SortableSchema['refs'][K] },
  kind: 'picked' | 'moved' | 'dropped' | 'canceled',
): void {
  const id = context.get('activeId') ?? ''
  const text = itemTextOf(refs.get('getRootEl')(), id)
  context.set('announcement', sortableAnnouncement(kind, {
    id,
    // 播报里说的是人类的第几位，从 1 数起；取消那次说的是回到哪儿
    position: context.get(kind === 'picked' || kind === 'canceled' ? 'from' : 'to') + 1,
    total: context.get('rects').length,
    // 项上写着的字比 id 好听。作者没给 translations.item 时退回它
    translations: { item: () => text ?? id, ...prop('translations') },
  }))
}
