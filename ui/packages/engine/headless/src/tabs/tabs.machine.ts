import type { DragAnnounceKind, DropTarget } from '../shared/drag'
import type { TabsSchema } from './tabs.types'
import { setup } from '@xihan-ui/machine'
import { createMultiPointerSession, resolveSessionDoc, shouldActivate } from '@xihan-ui/pointer'
import { dragAnnouncement, hitAlong, reorderFlat } from '../shared/drag'

const { createMachine } = setup<TabsSchema>()

// 选中值住在 context 的 cell 里，受控/非受控在 cell 收口，不需要影子事件与受控守卫。
export const tabsMachine = createMachine({
  name: 'tabs',
  context: ({ prop, cell }) => ({
    value: cell<string | null>(() => ({
      value: prop('value'),
      defaultValue: prop('defaultValue') ?? null,
      onChange: value => prop('onValueChange')?.({ value }),
    })),
    // 焦点锚点：不受控、不对外通知，只服务 roving tabindex 与方向键起点
    focusedValue: cell<string | null>(() => ({ defaultValue: null })),
    draggingTab: cell<string | null>(() => ({ defaultValue: null })),
    dropTarget: cell<DropTarget | null>(() => ({ defaultValue: null })),
    announcement: cell<string>(() => ({ defaultValue: '' })),
  }),
  // 跟手的会话整个生命周期都在，不按拖动状态挂卸。常驻的代价只是几个早退的
  // pointermove，换来的是状态树一行都不用改
  effects: ['trackPointer'],
  refs: () => ({
    gesture: null,
    tabDrag: null,
  }),
  initialState: () => 'idle',
  states: {
    idle: {
      // 省略 target：只跑 actions，不换状态
      on: {
        'VALUE.SET': { actions: ['setValue'] },
        'TRIGGER.SELECT': { actions: ['setValue', 'setFocusedValue'] },
        'TRIGGER.FOCUS': { actions: ['setFocusedValue'] },
        // automatic 下方向键顺带切换选中，manual 下只搬焦点锚点
        'TRIGGER.NAVIGATE': [
          { guard: 'isAutomatic', actions: ['setValue', 'setFocusedValue'] },
          { actions: ['setFocusedValue'] },
        ],
        'LIST.BLUR': { actions: ['clearFocusedValue'] },
        'TAB_DRAG.START': { actions: ['startTabDrag'] },
        'TAB_DRAG.MOVE': { actions: ['trackTabDrag'] },
        'TAB_DRAG.END': { actions: ['endTabDrag'] },
        'TAB_DRAG.CANCEL': { actions: ['cancelTabDrag'] },
        // 键盘换位不进拖动态：按一下就是一次已过守卫的完整提交
        'TAB.MOVE_BY': { actions: ['moveTabBy'] },
      },
    },
  },
  implementations: {
    effects: {
      /**
       * 跟住按在标签上的那根手指。
       *
       * 监听挂在文档上：拖出标签条、拖出窗口都要继续跟，系统收走指针也会收尾。
       * 会话只跟调用方交进来的那一根——连接层在按下时判完是不是该起拖再交。
       */
      trackPointer: ({ prop, refs, scope, send }) => {
        const horizontal = (prop('orientation') ?? 'horizontal') === 'horizontal'
        const session = createMultiPointerSession({
          doc: resolveSessionDoc(scope.getDoc().documentElement),
          onChange: (points: readonly { clientX: number, clientY: number }[]) => {
            const first = points[0]
            if (first)
              send({ type: 'TAB_DRAG.MOVE', point: horizontal ? first.clientX : first.clientY })
          },
          onEnd: ({ reason }: { reason: string }) =>
            send({ type: reason === 'pointercancel' ? 'TAB_DRAG.CANCEL' : 'TAB_DRAG.END' }),
        })
        refs.set('gesture', session)
        return () => {
          session.dispose()
          refs.set('gesture', null)
        }
      },
    },
    guards: {
      isAutomatic: ({ prop }) => (prop('activationMode') ?? 'automatic') === 'automatic',
    },
    actions: {
      setValue: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'VALUE.SET' || e.type === 'TRIGGER.SELECT' || e.type === 'TRIGGER.NAVIGATE')
          context.set('value', e.value)
      },
      setFocusedValue: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'TRIGGER.SELECT' || e.type === 'TRIGGER.FOCUS' || e.type === 'TRIGGER.NAVIGATE')
          context.set('focusedValue', e.value)
      },
      clearFocusedValue: ({ context }) => context.set('focusedValue', null),
      startTabDrag: ({ context, refs, event }) => {
        const e = event.current()
        if (e.type !== 'TAB_DRAG.START')
          return
        refs.set('tabDrag', { value: e.value, rects: e.rects, origin: e.origin, activated: false })
        // 按下还不算拖：这三样要等激活之后才写，在那之前界面上一点变化都没有
        context.set('draggingTab', null)
        context.set('dropTarget', null)
        context.set('announcement', '')
      },

      trackTabDrag: ({ context, refs, event }) => {
        const e = event.current()
        const session = refs.get('tabDrag')
        if (e.type !== 'TAB_DRAG.MOVE' || !session)
          return
        if (!session.activated) {
          // 整个标签都是拖动源，没有把手表明意图：要走够激活距离才算拖动，
          // 否则点一下切换标签就会被算成一次零位移的拖拽
          if (!shouldActivate({ x: e.point - session.origin, y: 0 }))
            return
          refs.set('tabDrag', { ...session, activated: true })
          context.set('draggingTab', session.value)
        }
        const hit = hitAlong(session.rects, e.point)
        // 落在自己身上不算落点：那不是一次移动，指示线该消失
        context.set('dropTarget', hit && hit.targetValue !== session.value ? hit : null)
      },

      endTabDrag: ({ context, prop, refs }) => {
        const session = refs.get('tabDrag')
        const target = context.get('dropTarget')
        clearTabDrag(context, refs)
        // 没激活过就只是按了一下：那是一次点击，不是拖动
        if (!session?.activated)
          return
        if (!target) {
          announceTabMove(context, prop, 'rejected', session.value)
          return
        }
        commitTabMove(context, prop, session.value, target, 'dropped')
      },

      cancelTabDrag: ({ context, prop, refs }) => {
        const session = refs.get('tabDrag')
        clearTabDrag(context, refs)
        if (session?.activated)
          announceTabMove(context, prop, 'canceled', session.value)
      },

      moveTabBy: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'TAB.MOVE_BY')
          return
        commitTabMove(context, prop, e.value, e.target, 'moved')
      },
    },
  },
})

/** 播报与提交两处都要写 announcement，抽一个最小接口，别把整个 service 拖进来。 */
interface TabDragContext {
  set: (k: 'announcement', v: string) => void
}

/** 标签的顺序真源就是 collection 给的那一串。 */
function tabValues(
  prop: <K extends keyof TabsSchema['props']>(k: K) => TabsSchema['props'][K],
): string[] {
  return (prop('collection') ?? []).map(node => node.value)
}

/** 播报一句。位置说的是这一串里的第几个。 */
function announceTabMove(
  context: TabDragContext,
  prop: <K extends keyof TabsSchema['props']>(k: K) => TabsSchema['props'][K],
  kind: DragAnnounceKind,
  value: string,
  position?: number,
): void {
  const values = tabValues(prop)
  const collection = prop('collection') ?? []
  context.set('announcement', dragAnnouncement(kind, {
    value,
    position: position ?? values.indexOf(value) + 1,
    total: values.length,
    // 标签文字比 value 好听。作者没给 translations.item 时退回条目的 label
    translations: {
      item: (id: string) => collection.find(node => node.value === id)?.label ?? id,
      ...prop('translations'),
    },
  }))
}

/**
 * 落点折算成一次换位，报给宿主并播报。
 *
 * 顺序不进机器：collection 是 prop，库没有一份自己的标签序可写，所以只发意图、
 * 写回归宿主——它本来就是那一串的主人。
 */
function commitTabMove(
  context: TabDragContext,
  prop: <K extends keyof TabsSchema['props']>(k: K) => TabsSchema['props'][K],
  value: string,
  target: DropTarget,
  kind: DragAnnounceKind,
): void {
  const moved = reorderFlat(tabValues(prop), value, target)
  if (!moved) {
    announceTabMove(context, prop, 'rejected', value)
    return
  }
  prop('onTabMove')?.({ value, from: moved.from, to: moved.to, values: moved.ids })
  announceTabMove(context, prop, kind, value, moved.to + 1)
}

/** 收尾：拖动态的三样一起清干净，别留半截。 */
function clearTabDrag(
  context: { set: (k: 'draggingTab' | 'dropTarget', v: null) => void },
  refs: { set: (k: 'tabDrag', v: null) => void },
): void {
  refs.set('tabDrag', null)
  context.set('draggingTab', null)
  context.set('dropTarget', null)
}
