import type { SignaturePadDrawingOptions, SignaturePadPointerPoint, SignaturePadSchema, SignaturePadStroke, SignaturePadSurface } from './signature-pad.types'
import { setup } from '@xihan-ui/core'
import { createPointerSession, resolveSessionDoc } from '@xihan-ui/pointer'
import { lastStrokePath, pointDistance, SIGNATURE_PAD_MIN_DISTANCE, signaturePadSvg, simulatedPressure, strokesToPaths } from './signature-pad.geometry'

const { createMachine } = setup<SignaturePadSchema>()

type Props = SignaturePadSchema['props']
type PropReader = <K extends keyof Props>(key: K) => Props[K]

/** 还没量到画布尺寸时的占位。身份固定，重置成它不会白涨一次版本号。 */
const EMPTY_SURFACE: SignaturePadSurface = { width: 0, height: 0 }

interface Vec {
  x: number
  y: number
}

/**
 * 笔迹按逐笔的对象身份比：每添一个点都会换一个新的笔对象，身份变了就是真变了。
 * 不给这条，默认的 Object.is 会把每次都新建的数组一律判成变了。
 */
export function sameSignatureStrokes(
  a: readonly SignaturePadStroke[],
  b: readonly SignaturePadStroke[] | undefined,
): boolean {
  return b != null && a.length === b.length && a.every((stroke, i) => stroke === b[i])
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
function notifyDrawEnd(prop: PropReader, strokes: readonly SignaturePadStroke[], surface: SignaturePadSurface): void {
  const onDrawEnd = prop('onDrawEnd')
  if (!onDrawEnd)
    return
  const paths = strokesToPaths(strokes, drawingOptions(prop))
  onDrawEnd({ paths, svg: signaturePadSvg(paths, surface) })
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

export const signaturePadMachine = createMachine({
  name: 'signature-pad',
  context: ({ cell }) => ({
    // 笔迹不受控：签名是一串指针轨迹，宿主写不回来，只能清空重画
    strokes: cell<SignaturePadStroke[]>(() => ({
      defaultValue: [],
      isEqual: sameSignatureStrokes,
    })),
    surface: cell<SignaturePadSurface>(() => ({
      defaultValue: EMPTY_SURFACE,
      isEqual: (a, b) => b != null && a.width === b.width && a.height === b.height,
    })),
  }),
  refs: () => ({
    getControlEl: () => null,
    strokePointerId: null,
  }),
  initialState: () => 'idle',
  // 表单重置与程序化清空从哪个状态发出都要认，因此挂根级
  on: {
    'FORM.RESET': { actions: ['clearStrokes'] },
    // 程序化清空不设守卫，与原生表单重置一致；界面上的清空按钮在禁用/只读时本就按不动
    'STROKES.CLEAR': { actions: ['clearStrokes'] },
  },
  states: {
    idle: {
      on: {
        'DRAW.START': { guard: 'canDraw', target: 'drawing', actions: ['beginStroke'] },
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
    },
    actions: {
      clearStrokes: ({ context, prop, refs }) => {
        refs.set('strokePointerId', null)
        // 本来就是空的就不发通知：表单重置会连着打到每一个字段上
        if (context.get('strokes').length === 0)
          return
        context.set('strokes', [])
        // 尺寸跟着清掉：下一笔重新量当前画布，笔迹坐标系与那一刻的画布对齐
        context.set('surface', EMPTY_SURFACE)
        notifyDraw(prop, [])
        notifyDrawEnd(prop, [], EMPTY_SURFACE)
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
        const pinned = context.get('surface')
        // 取整：画布上的 viewBox 与导出 SVG 的视窗写的是同一串数，两边不能差半个像素
        const surface = pinned.width > 0 && pinned.height > 0
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
        context.set('surface', surface)
        context.set('strokes', [...context.get('strokes'), { points: [point] }])
        notifyDraw(prop, context.get('strokes'))
      },

      extendStroke: ({ context, prop, refs, event }) => {
        const e = event.current()
        if (e.type !== 'DRAW.MOVE')
          return
        const el = refs.get('getControlEl')()
        if (!el)
          return
        const strokes = context.get('strokes')
        const current = strokes[strokes.length - 1]
        const prev = current?.points[current.points.length - 1]
        // 没有正在写的那一笔就没有可续的点：落笔那一下没落成，后面的移动一概不认
        if (!current || !prev)
          return
        const rect = el.getBoundingClientRect()
        const next = toSurfacePoint(rect, context.get('surface'), e.point)
        const moved = pointDistance(prev, next)
        if (moved < SIGNATURE_PAD_MIN_DISTANCE)
          return
        const options = drawingOptions(prop)
        const pressure = options.simulatePressure === false
          ? devicePressure(e.point.pressure)
          : simulatedPressure(moved, options.size)
        const points = [...current.points, { ...next, pressure }]
        context.set('strokes', [...strokes.slice(0, -1), { points }])
        notifyDraw(prop, context.get('strokes'))
      },

      endStroke: ({ context, prop, refs }) => {
        refs.set('strokePointerId', null)
        notifyDrawEnd(prop, context.get('strokes'), context.get('surface'))
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
