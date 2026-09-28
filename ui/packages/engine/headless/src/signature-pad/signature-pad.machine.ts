/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 signature pad 相关实现。

import type { Params } from '@xihan-ui/core'
import type {
  SignaturePadDrawingOptions,
  SignaturePadPointerPoint,
  SignaturePadSchema,
  SignaturePadStroke,
  SignaturePadSurface,
  SignaturePadTrigger,
  SignaturePadValue,
} from './signature-pad.types'
import { resetDeclaredValue, setup } from '@xihan-ui/core'
import { createPointerSession, resolveSessionDoc } from '@xihan-ui/pointer'
import { sameArray } from '../shared/array'
import { lastStrokePath, pointDistance, SIGNATURE_PAD_MIN_DISTANCE, signaturePadSvg, simulatedPressure, strokesToPaths } from './signature-pad.geometry'

const { createMachine } = setup<SignaturePadSchema>()

type Props = SignaturePadSchema['props']
type PropReader = <K extends keyof Props>(key: K) => Props[K]
type MachineParams = Params<SignaturePadSchema>

/** 还没量到画布尺寸时的占位。 */
const EMPTY_SURFACE: SignaturePadSurface = { width: 0, height: 0 }

/** 一笔都没有的签名：清空与缺省初值都落到它。身份固定，重置成它不会白涨一次版本号。 */
export const EMPTY_SIGNATURE: SignaturePadValue = { strokes: [], surface: EMPTY_SURFACE }

interface Vec {
  x: number
  y: number
}

function hasSurface(surface: SignaturePadSurface): boolean {
  return surface.width > 0 && surface.height > 0
}

/**
 * 值按逐笔的对象身份与坐标系的两个数比：机器每定稿一次都换一个新数组，笔画对象定稿后只建不改。
 * 不给这条，默认的 Object.is 会把每次都新建的值一律判成变了。
 */
export function sameSignatureValue(a: SignaturePadValue, b: SignaturePadValue | undefined): boolean {
  return b != null
    && sameArray(a.strokes, b.strokes)
    && a.surface.width === b.surface.width
    && a.surface.height === b.surface.height
}

/**
 * 两份签名画出来是不是同一份：逐点比坐标与压感。
 * 宿主写回的值可能是代理或拷贝（Vue 的响应式代理、JSON 往返），对象身份认不出「还是我刚写出去的那份」。
 */
function sameInk(a: SignaturePadValue, b: SignaturePadValue): boolean {
  if (a === b)
    return true
  if (a.surface.width !== b.surface.width || a.surface.height !== b.surface.height)
    return false
  if (a.strokes.length !== b.strokes.length)
    return false
  return a.strokes.every((stroke, i) => {
    const other = b.strokes[i]!
    if (stroke === other)
      return true
    if (stroke.points.length !== other.points.length)
      return false
    return stroke.points.every((point, j) => {
      const q = other.points[j]!
      return point.x === q.x && point.y === q.y && point.pressure === q.pressure
    })
  })
}

/** 设备报的压感；报不出（0 或缺席）时取中档，否则鼠标画出来的笔迹会细成一条缝。 */
export function devicePressure(value: number | undefined): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? Math.min(value, 1) : 0.5
}

function drawingOptions(prop: PropReader): SignaturePadDrawingOptions {
  return prop('drawing') ?? {}
}

/** 笔迹变了就通知一次：整份路径加上正在写的那一笔。写完的笔画走缓存，不重算。 */
function notifyDraw(prop: PropReader, strokes: readonly SignaturePadStroke[]): void {
  const onDraw = prop('onDraw')
  if (!onDraw)
    return
  const options = drawingOptions(prop)
  onDraw({ paths: strokesToPaths(strokes, options), path: lastStrokePath(strokes, options) })
}

/** 签名定稿时通知一次，带上可直接提交的 SVG。 */
function notifyDrawEnd(prop: PropReader, value: SignaturePadValue): void {
  const onDrawEnd = prop('onDrawEnd')
  if (!onDrawEnd)
    return
  const paths = strokesToPaths(value.strokes, drawingOptions(prop))
  onDrawEnd({ paths, svg: signaturePadSvg(paths, value.surface) })
}

/**
 * 定稿一份新值：写进 value、记下这是机器自己写出的，再按定稿的口径通知。
 * 清空、撤销、重做与表单重置不经过落笔，路径通知也在这里补一次。
 */
function settle({ context, prop, refs }: MachineParams, next: SignaturePadValue, drawn: boolean): void {
  refs.set('committed', next)
  context.set('value', next)
  if (!drawn)
    notifyDraw(prop, next.strokes)
  notifyDrawEnd(prop, next)
}

/**
 * 屏幕坐标换算成笔迹坐标：先减去画布原点，再按「钉住的尺寸 / 当前尺寸」缩放。
 * 容器变宽变窄后落的新笔，与之前那些笔落在同一套坐标里。
 */
function toSurfacePoint(rect: DOMRect, surface: SignaturePadSurface, point: SignaturePadPointerPoint): Vec {
  const sx = rect.width > 0 && surface.width > 0 ? surface.width / rect.width : 1
  const sy = rect.height > 0 && surface.height > 0 ? surface.height / rect.height : 1
  return { x: (point.clientX - rect.left) * sx, y: (point.clientY - rect.top) * sy }
}

/** 这颗按钮此刻按得下去：整块可编辑，撤销与重做还要各自的栈里有东西。 */
function triggerAvailable(trigger: SignaturePadTrigger, context: MachineParams['context']): boolean {
  if (trigger === 'undo')
    return context.get('past').length > 0
  if (trigger === 'redo')
    return context.get('future').length > 0
  return true
}

export const signaturePadMachine = createMachine({
  name: 'signature-pad',
  context: ({ prop, cell }) => ({
    // 定稿的签名走 cell 原生受控；正在写的那一笔住在 draft 里，抬笔才并进来
    value: cell<SignaturePadValue>(() => ({
      value: prop('value'),
      defaultValue: prop('defaultValue') ?? EMPTY_SIGNATURE,
      isEqual: sameSignatureValue,
      onChange: value => prop('onValueChange')?.({ value }),
    })),
    draft: cell<SignaturePadSchema['context']['draft']>(() => ({ defaultValue: null })),
    past: cell<SignaturePadValue[]>(() => ({ defaultValue: [], isEqual: sameArray })),
    future: cell<SignaturePadValue[]>(() => ({ defaultValue: [], isEqual: sameArray })),
    // 三颗按钮的按压通道，与落笔状态无关：两个状态都认 PRESS.*
    pressed: cell<SignaturePadTrigger | null>(() => ({ defaultValue: null })),
  }),
  refs: ({ prop }) => ({
    getControlEl: () => null,
    strokePointerId: null,
    committed: prop('value') ?? prop('defaultValue') ?? EMPTY_SIGNATURE,
  }),
  initialState: () => 'idle',
  watch: ({ track, prop, context, action }) => {
    // 按住途中被禁用或转只读：原生 disabled 的按钮不再派 keyup / blur，按压面得由机器自己收
    track([() => prop('disabled'), () => prop('readOnly')], () => action(['releaseWhenInert']))
    // 值从外面换了一份：撤销与重做栈里存的是另一份签名的历史
    track([() => context.get('value')], () => action(['syncExternalValue']))
  },
  // 表单重置与程序化清空从哪个状态发出都要认，因此挂根级
  on: {
    'FORM.RESET': { actions: ['resetToDefault'] },
    // 程序化清空不设守卫，与原生表单重置一致；界面上的清空按钮在禁用/只读时本就按不动
    'STROKES.CLEAR': { actions: ['clearStrokes'] },
    // 三颗按钮的按压通道：禁用与只读时按不动，撤销与重做没东西可做时也按不进按压面
    'PRESS.START': { guard: 'canPress', actions: ['startPress'] },
    'PRESS.END': { actions: ['endPress'] },
  },
  states: {
    idle: {
      on: {
        'DRAW.START': { guard: 'canDraw', target: 'drawing', actions: ['beginStroke'] },
        // 撤销与重做只在两笔之间：落笔途中那一笔还没定稿，历史里没有它
        'HISTORY.UNDO': { actions: ['undo'] },
        'HISTORY.REDO': { actions: ['redo'] },
      },
    },
    drawing: {
      // 监听器挂在文档上：手划出画布甚至划出窗口都要跟手，pointercancel 不收会永远停在 drawing
      effects: ['trackPointer'],
      on: {
        // 落笔途中被禁用就不再收点，但抬笔照常收尾，状态不会卡住
        'DRAW.MOVE': { guard: 'canDraw', actions: ['extendStroke'] },
        'DRAW.END': { target: 'idle', actions: ['endStroke'] },
      },
    },
  },
  implementations: {
    guards: {
      canDraw: ({ prop }) => !prop('disabled') && !prop('readOnly'),
      // 三颗按钮与画布同一道判据：禁用或只读都按不动；撤销与重做另看栈里有没有东西
      canPress: ({ prop, context, event }) => {
        const e = event.current()
        if (e.type !== 'PRESS.START' || prop('disabled') || prop('readOnly'))
          return false
        return triggerAvailable(e.trigger, context)
      },
    },
    actions: {
      startPress: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'PRESS.START')
          context.set('pressed', e.trigger)
      },
      endPress: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'PRESS.END' && context.get('pressed') === e.trigger)
          context.set('pressed', null)
      },
      releaseWhenInert: ({ context, prop }) => {
        if (prop('disabled') || prop('readOnly'))
          context.set('pressed', null)
      },

      syncExternalValue: ({ context, refs }) => {
        const current = context.get('value')
        const committed = refs.get('committed')
        if (committed && sameInk(current, committed))
          return
        refs.set('committed', current)
        context.set('past', [])
        context.set('future', [])
      },

      clearStrokes: (params) => {
        const { context, prop, refs } = params
        refs.set('strokePointerId', null)
        const hadDraft = context.get('draft') !== null
        context.set('draft', null)
        const current = context.get('value')
        // 本来就是空的就不定稿、也不进历史：表单重置会连着打到每一个字段上
        if (current.strokes.length === 0) {
          if (hadDraft)
            notifyDraw(prop, [])
          return
        }
        // 清空也是一步，撤销能把整份签名找回来；坐标系跟着清掉，下一笔重新量当前画布
        context.set('past', [...context.get('past'), current])
        context.set('future', [])
        settle(params, EMPTY_SIGNATURE, false)
      },

      undo: (params) => {
        const { context } = params
        const past = context.get('past')
        const previous = past[past.length - 1]
        if (!previous)
          return
        context.set('past', past.slice(0, -1))
        context.set('future', [...context.get('future'), context.get('value')])
        settle(params, previous, false)
      },

      redo: (params) => {
        const { context } = params
        const future = context.get('future')
        const next = future[future.length - 1]
        if (!next)
          return
        context.set('future', future.slice(0, -1))
        context.set('past', [...context.get('past'), context.get('value')])
        settle(params, next, false)
      },

      resetToDefault: (params) => {
        const { context, prop, refs } = params
        refs.set('strokePointerId', null)
        const before = context.get('value')
        const hadDraft = context.get('draft') !== null
        context.set('draft', null)
        // 宿主攥着值又没声明默认值时一动不动：重置不该把宿主的签名抹掉
        if (!resetDeclaredValue(params, 'value', 'value', 'defaultValue')) {
          if (hadDraft)
            notifyDraw(prop, before.strokes)
          return
        }
        context.set('past', [])
        context.set('future', [])
        const after = context.get('value')
        refs.set('committed', after)
        if (!sameInk(before, after)) {
          notifyDraw(prop, after.strokes)
          notifyDrawEnd(prop, after)
        }
        else if (hadDraft) {
          notifyDraw(prop, after.strokes)
        }
      },

      beginStroke: ({ context, prop, refs, event }) => {
        const e = event.current()
        if (e.type !== 'DRAW.START')
          return
        const el = refs.get('getControlEl')()
        // 画布还没就位就没有坐标系可言，这一笔不落
        if (!el)
          return
        const rect = el.getBoundingClientRect()
        // 第一笔定下笔迹坐标系并钉住；之后画布再变宽变窄，已有笔迹跟着 viewBox 缩放
        const pinned = context.get('value').surface
        // 取整：画布上的 viewBox 与导出 SVG 的视窗写的是同一串数，两边不能差半个像素
        const surface = hasSurface(pinned)
          ? pinned
          : { width: Math.round(rect.width), height: Math.round(rect.height) }
        const options = drawingOptions(prop)
        const point = {
          ...toSurfacePoint(rect, surface, e.point),
          // 落笔那一刻没有前一点，速度无从谈起，取中档
          pressure: options.simulatePressure === false ? devicePressure(e.point.pressure) : 0.5,
        }
        // 这一笔归这根指针：手掌与第二根手指的移动不再被续进来
        refs.set('strokePointerId', typeof e.point.pointerId === 'number' ? e.point.pointerId : null)
        const stroke = { points: [point] }
        context.set('draft', { stroke, surface })
        notifyDraw(prop, [...context.get('value').strokes, stroke])
      },

      extendStroke: ({ context, prop, refs, event }) => {
        const e = event.current()
        if (e.type !== 'DRAW.MOVE')
          return
        const el = refs.get('getControlEl')()
        if (!el)
          return
        const draft = context.get('draft')
        const prev = draft?.stroke.points[draft.stroke.points.length - 1]
        // 没有正在写的那一笔就没有可续的点：落笔那一下没落成，后面的移动一概不认
        if (!draft || !prev)
          return
        const rect = el.getBoundingClientRect()
        const next = toSurfacePoint(rect, draft.surface, e.point)
        const moved = pointDistance(prev, next)
        if (moved < SIGNATURE_PAD_MIN_DISTANCE)
          return
        const options = drawingOptions(prop)
        const pressure = options.simulatePressure === false
          ? devicePressure(e.point.pressure)
          : simulatedPressure(moved, options.size)
        // 每收一个点换一个新的笔画对象：写完的笔身份不再变，轮廓缓存按身份命中
        const stroke = { points: [...draft.stroke.points, { ...next, pressure }] }
        context.set('draft', { stroke, surface: draft.surface })
        notifyDraw(prop, [...context.get('value').strokes, stroke])
      },

      endStroke: (params) => {
        const { context, refs } = params
        refs.set('strokePointerId', null)
        const draft = context.get('draft')
        // 落笔途中被清空或重置：这一笔已经作废，没有可定稿的东西
        if (!draft)
          return
        context.set('draft', null)
        const current = context.get('value')
        context.set('past', [...context.get('past'), current])
        context.set('future', [])
        settle(params, { strokes: [...current.strokes, draft.stroke], surface: draft.surface }, true)
      },
    },
    effects: {
      trackPointer: ({ send, refs }) => {
        // 只认起笔那根指针：起笔动作在本效应挂载之前就跑完了，此刻 ref 已就位。
        // 落笔时没报 pointerId（程序化发事件）就不筛，否则一条都收不到
        const session = createPointerSession({
          doc: resolveSessionDoc(refs.get('getControlEl')()),
          pointerId: refs.get('strokePointerId') ?? undefined,
          onMove: ({ point, pressure, pointerId }) => {
            send({
              type: 'DRAW.MOVE',
              point: { clientX: point.clientX, clientY: point.clientY, pressure, pointerId },
            })
          },
          onEnd: () => send({ type: 'DRAW.END' }),
        })
        return () => session.dispose()
      },
    },
  },
})
