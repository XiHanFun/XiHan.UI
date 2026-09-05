import type { DndRect } from '@xihan-ui/pointer'
import type { SortableSchema } from './sortable.types'
import { ITEM_VALUE_ATTR, queryItems, setup } from '@xihan-ui/core'
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
    rects: cell<DndRect[]>(() => ({
      defaultValue: [],
      // 每帧都是新数组，默认的 Object.is 会把「没变」也判成变了
      isEqual: (a, b) => Array.isArray(b) && a.length === b.length && a.every((r, i) => r === b.at(i)),
    })),
    announcement: cell<string>(() => ({ defaultValue: '' })),
  }),
  refs: () => ({
    getRootEl: () => null,
    origin: null,
  }),
  initialState: () => 'idle',
  states: {
    idle: {
      on: {
        // 按下先进 pending：还没走够激活距离，这一下可能只是点击
        'ITEM.POINTER_DOWN': { guard: 'canSort', target: 'pending', actions: ['setPending'] },
        'ITEM.PICKUP': { guard: 'canSort', target: 'dragging', actions: ['startKeyboardDrag'] },
      },
    },
    pending: {
      // pending 也要跟指针：走够距离才升级成拖动，抬手就散
      effects: ['trackPointer'],
      on: {
        // 守卫不过就原地不动，视觉上完全没有拖动发生
        'POINTER.MOVE': { guard: 'passedActivation', target: 'dragging', actions: ['startPointerDrag', 'trackDelta'] },
        'POINTER.END': { target: 'idle', actions: ['clearSession'] },
        'POINTER.CANCEL': { target: 'idle', actions: ['clearSession'] },
      },
    },
    dragging: {
      effects: ['trackPointer', 'trackAutoScroll'],
      on: {
        'POINTER.MOVE': { actions: ['trackDelta'] },
        'POINTER.END': { target: 'idle', actions: ['commit', 'invokeDragEnd', 'clearSession'] },
        // 系统收走指针按取消算：顺序不动
        'POINTER.CANCEL': { target: 'idle', actions: ['cancel', 'invokeDragEnd', 'clearSession'] },
        'KEY.MOVE': { actions: ['stepTo'] },
        'KEY.DROP': { target: 'idle', actions: ['commit', 'invokeDragEnd', 'clearSession'] },
        'KEY.CANCEL': { target: 'idle', actions: ['cancel', 'invokeDragEnd', 'clearSession'] },
      },
    },
  },
  implementations: {
    guards: {
      canSort: ({ prop }) => !prop('disabled'),
      passedActivation: ({ prop, refs, event }) => {
        const e = event.current()
        if (e.type !== 'POINTER.MOVE')
          return false
        return shouldActivate(deltaFrom(refs.get('origin'), e.point), { distance: prop('activationDistance') })
      },
    },
    actions: {
      setPending: ({ context, event, refs }) => {
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
        context.set('rects', itemElements(refs.get('getRootEl')()).map(toDndRect))
        context.set('mode', 'pointer')
        context.set('delta', deltaFrom(refs.get('origin'), e.point))
        context.set('to', context.get('from'))
        say(context, prop, refs, 'picked')
        prop('onDragStart')?.({ id: context.get('activeId') ?? '', from: context.get('from'), mode: 'pointer' })
      },

      startKeyboardDrag: ({ context, prop, refs, event }) => {
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

      clearSession: ({ context, refs }) => {
        refs.set('origin', null)
        context.set('activeId', null)
        context.set('from', -1)
        context.set('to', -1)
        context.set('mode', null)
        context.set('delta', ZERO)
        context.set('rects', [])
      },
    },
    effects: {
      /** 跟手交给指针会话。pending 与 dragging 共用同一份，升级状态时不会断手。 */
      trackPointer: ({ refs, send }) => {
        const session = createPointerSession({
          doc: resolveSessionDoc(refs.get('getRootEl')()),
          onMove: ({ point }) => send({ type: 'POINTER.MOVE', point }),
          onEnd: ({ reason }) => send({ type: reason === 'pointercancel' ? 'POINTER.CANCEL' : 'POINTER.END' }),
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

        let frame = win.requestAnimationFrame(function tick(): void {
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
          frame = win.requestAnimationFrame(tick)
        })
        return () => win.cancelAnimationFrame(frame)
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
