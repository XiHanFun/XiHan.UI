import type { Placement, Scope } from '@xihan-ui/core'
import type { Params } from '@xihan-ui/machine'
import type { ColorPickerChannel, ColorPickerHsva } from './color-picker.color'
import type { ColorPickerPoint } from './color-picker.geometry'
import type { ColorPickerDragTarget, ColorPickerSchema } from './color-picker.types'
import { createDismissLayer, createFocusScope } from '@xihan-ui/behavior'
import { setup } from '@xihan-ui/machine'
import {
  COLOR_PICKER_FALLBACK,
  colorPickerApplyInput,
  colorPickerChannelRange,
  colorPickerChannelValue,
  colorPickerHsvaToRgba,
  colorPickerParse,
  colorPickerResolveHsva,
  colorPickerRgbaToHsva,
  colorPickerToString,
  colorPickerWithArea,
  colorPickerWithChannel,
} from './color-picker.color'
import { colorPickerPointRatio } from './color-picker.geometry'

const { createMachine } = setup<ColorPickerSchema>()

/** 未指定 placement 时的落位：浮层沿触发器起始缘展开。定位引擎与 connect 共用这一个缺省。 */
export const COLOR_PICKER_DEFAULT_PLACEMENT: Placement = 'bottom-start'

/** 屏幕取色接口的最小形状。DOM 类型库尚未收录它，这里只声明用得着的那一点。 */
interface EyeDropperLike {
  open: (options?: { signal?: AbortSignal }) => Promise<{ sRGBHex: string }>
}

type EyeDropperCtor = new () => EyeDropperLike

function eyeDropperCtor(scope: Scope): EyeDropperCtor | null {
  try {
    const ctor = (scope.getWin() as unknown as { EyeDropper?: EyeDropperCtor }).EyeDropper
    return typeof ctor === 'function' ? ctor : null
  }
  catch {
    // 无 document 的纯逻辑环境里 getWin 会抛
    return null
  }
}

/** 宿主环境有没有屏幕取色。取色按钮据此禁用，免得点了毫无反应。 */
export function colorPickerHasEyeDropper(scope: Scope): boolean {
  return eyeDropperCtor(scope) != null
}

/**
 * 唤起屏幕取色。用户按 Esc 放弃时接口以拒绝表达，这里原样传出去，
 * 调用方只需处理"没取到"这一种形态，不必再分"没有接口"与"取消了"。
 */
export function colorPickerOpenEyeDropper(scope: Scope, signal?: AbortSignal): Promise<string> {
  const Ctor = eyeDropperCtor(scope)
  if (!Ctor)
    return Promise.reject(new Error('[xh] 当前环境不提供 EyeDropper'))
  try {
    return Promise.resolve(new Ctor().open(signal ? { signal } : undefined)).then(result => result.sRGBHex)
  }
  catch (error) {
    // 个别实现在非用户手势里会同步抛
    return Promise.reject(error)
  }
}

type MachineParams = Params<ColorPickerSchema>

/** 当前工作色：值串加上锚。灰度处的色相由锚保住，详见 colorPickerResolveHsva。 */
function currentHsva(params: MachineParams): ColorPickerHsva {
  return colorPickerResolveHsva(params.context.get('value'), params.context.get('anchor'))
}

/**
 * 落一个新的工作色。
 *
 * 锚与值一起写：受控（value 给定）时 context.set('value') 不落内部值、只发回调，
 * 于是锚记的串与当前值对不上，connect 便会退回按当前值反解——界面因此纹丝不动，
 * 这正是受控该有的样子。宿主写回之后两者又对上，色相接着由锚保住。
 */
function applyHsva(params: MachineParams, next: ColorPickerHsva): void {
  const { context, prop } = params
  const alpha = prop('alpha') ?? false
  const hsva: ColorPickerHsva = alpha ? next : { ...next, a: 1 }
  const value = colorPickerToString(colorPickerHsvaToRgba(hsva), prop('format') ?? 'hex', alpha)
  context.set('anchor', { value, hsva })
  context.set('value', value)
}

/** 把一个外来的串收成工作色。解析不出就原地不动——绝不猜一个颜色出来。 */
function applyValueString(params: MachineParams, raw: string): void {
  const rgba = colorPickerParse(raw)
  if (!rgba)
    return
  applyHsva(params, colorPickerRgbaToHsva(rgba, currentHsva(params).h))
}

/** 拖动落点 → 工作色。矩形在事件那一刻现量：connect 不许读 DOM，量尺子这件事只能落在这里。 */
function applyPoint(params: MachineParams, target: ColorPickerDragTarget, point: ColorPickerPoint): void {
  const { refs, prop } = params
  const el = target === 'area' ? refs.get('getAreaEl')() : refs.get('getChannelTrackEl')(target)
  // 节点还没就位（纯逻辑测试、或浮层还带着 hidden）时不猜，原地不动
  if (!el)
    return
  const ratio = colorPickerPointRatio(point, el.getBoundingClientRect(), prop('dir'))
  const hsva = currentHsva(params)
  if (target === 'area') {
    // 纵轴向下是明度变暗，所以取补数
    applyHsva(params, { ...hsva, s: ratio.x * 100, v: (1 - ratio.y) * 100 })
    return
  }
  const range = colorPickerChannelRange(target)
  applyHsva(params, colorPickerWithChannel(hsva, target, range.min + ratio.x * (range.max - range.min)))
}

function stepSize(channel: ColorPickerChannel | 'area', large: boolean): number {
  if (channel === 'area')
    return large ? 10 : 1
  const range = colorPickerChannelRange(channel)
  return large ? range.largeStep : range.step
}

// 值住在 context 的 cell 里，走 cell 原生受控（value prop 给定即受控，读直取 prop，
// 写只发 onValueChange 不落内部值），因此不需要影子事件。
// 开合是布尔态、编进 FSM 状态，走「守卫对 + CONTROLLED.* 影子事件 + watch」那一套。
// 展开态下再分三段：闲置、指针拖动、屏幕取色——后两者各自要挂拆一份副作用，
// 只有编成状态才拿得到确定的拆卸时机。
export const colorPickerMachine = createMachine({
  name: 'color-picker',
  context: ({ prop, cell }) => ({
    value: cell<string>(() => ({
      value: prop('value'),
      defaultValue: prop('defaultValue') ?? COLOR_PICKER_FALLBACK,
      onChange: value => prop('onValueChange')?.({ value }),
    })),
    anchor: cell<ColorPickerSchema['context']['anchor']>(() => ({ defaultValue: null })),
    position: cell<ColorPickerSchema['context']['position']>(() => ({ defaultValue: null })),
    draft: cell<ColorPickerSchema['context']['draft']>(() => ({ defaultValue: null })),
    dragTarget: cell<ColorPickerDragTarget | null>(() => ({ defaultValue: null })),
    eyeDropperSupported: cell<boolean>(() => ({ defaultValue: false })),
  }),
  refs: () => ({
    config: null,
    registerLayer: null,
    position: null,
    getAnchorEl: () => null,
    getFloatingEl: () => null,
    getContentEl: () => null,
    getAreaEl: () => null,
    getChannelTrackEl: () => null,
  }),
  initialState: ({ prop }) => ((prop('open') ?? prop('defaultOpen')) ? 'open' : 'closed'),
  // 挂载即问一次环境有没有屏幕取色：没有的话那个按钮从首帧起就该是禁用的，
  // 而不是等用户点下去才发现什么都没发生
  entry: ['syncEyeDropperSupport'],
  // 开合受控时用户事件只发意图、不自改状态；宿主写回 open 后由这里派发影子事件无条件回写
  watch: ({ track, prop, action }) => track([() => prop('open')], () => action(['syncOpen'])),
  // 改值这一路与开合无关：收起态下作者仍可能用 api.setValue 改色，两个状态里都得认
  on: {
    'VALUE.SET': { guard: 'canInteract', actions: ['setValue'] },
    'AREA.SET': { guard: 'canInteract', actions: ['setArea'] },
    'AREA.STEP': { guard: 'canInteract', actions: ['stepArea'] },
    'AREA.TO_EDGE': { guard: 'canInteract', actions: ['areaToEdge'] },
    'CHANNEL.SET': { guard: 'canInteract', actions: ['setChannel'] },
    'CHANNEL.STEP': { guard: 'canInteract', actions: ['stepChannel'] },
    'CHANNEL.TO_EDGE': { guard: 'canInteract', actions: ['channelToEdge'] },
    // 打字这一路不设守卫：只读/禁用时输入框本就带着原生 readonly/disabled，打不进字；
    // 草稿是纯显示状态，落值那一步在 commitDraft 里另有守卫
    'INPUT.CHANGE': { actions: ['setDraft'] },
    'INPUT.COMMIT': { actions: ['commitDraft'] },
  },
  states: {
    closed: {
      on: {
        // 受控命中 → 只发意图；非受控 → 落 target 并一并通知
        'OPEN': [
          { guard: 'isOpenControlled', actions: ['invokeOnOpen'] },
          { target: 'open', actions: ['invokeOnOpen'] },
        ],
        'TOGGLE': [
          { guard: 'isOpenControlled', actions: ['invokeOnOpen'] },
          { target: 'open', actions: ['invokeOnOpen'] },
        ],
        'CONTROLLED.OPEN': { target: 'open' },
      },
    },
    open: {
      initial: 'idle',
      // 进入 open：定位 → 消解 + 焦点。退出时逆序拆
      effects: ['trackPosition', 'trackLayer'],
      // 收起时把没收下的草稿丢掉：再展开时输入框该显示当前颜色，而不是上一轮打了一半的字
      exit: ['clearDraft'],
      on: {
        'CLOSE': [
          { guard: 'isOpenControlled', actions: ['invokeOnClose'] },
          { target: 'closed', actions: ['invokeOnClose'] },
        ],
        'TOGGLE': [
          { guard: 'isOpenControlled', actions: ['invokeOnClose'] },
          { target: 'closed', actions: ['invokeOnClose'] },
        ],
        'CONTROLLED.CLOSE': { target: 'closed' },
      },
      states: {
        idle: {
          on: {
            // 按下即跳：点取色区或轨道任意位置，颜色当场跟过来（随后的拖动由 trackPointer 接手）
            'DRAG.START': { guard: 'canInteract', target: 'open.dragging', actions: ['startDrag'] },
            'EYE_DROPPER.OPEN': { guard: 'canPick', target: 'open.picking' },
          },
        },
        dragging: {
          effects: ['trackPointer'],
          on: {
            'DRAG.MOVE': { actions: ['dragMove'] },
            'DRAG.END': { target: 'open.idle', actions: ['endDrag'] },
          },
        },
        picking: {
          effects: ['runEyeDropper'],
          on: {
            'EYE_DROPPER.RESULT': { target: 'open.idle', actions: ['setValueFromEyeDropper'] },
            // 放弃取色与接口报错走同一条：界面上都该只是"什么也没发生"
            'EYE_DROPPER.CANCEL': { target: 'open.idle' },
          },
        },
      },
    },
  },
  implementations: {
    guards: {
      isOpenControlled: ({ prop }) => prop('open') !== undefined,
      canInteract: ({ prop }) => !prop('disabled') && !prop('readOnly'),
      canPick: ({ prop, context }) =>
        !prop('disabled') && !prop('readOnly') && context.get('eyeDropperSupported'),
    },
    actions: {
      invokeOnOpen: ({ prop }) => prop('onOpenChange')?.({ open: true }),
      invokeOnClose: ({ prop }) => prop('onOpenChange')?.({ open: false }),

      // 只在受控（open 为布尔）时回写；open 变回 undefined = 转非受控，不强制关闭
      syncOpen: ({ prop, send }) => {
        const open = prop('open')
        if (open === undefined)
          return
        send(open ? { type: 'CONTROLLED.OPEN' } : { type: 'CONTROLLED.CLOSE' })
      },

      syncEyeDropperSupport: ({ scope, context }) => {
        context.set('eyeDropperSupported', colorPickerHasEyeDropper(scope))
      },

      setValue: (params) => {
        const e = params.event.current()
        if (e.type === 'VALUE.SET')
          applyValueString(params, e.value)
      },

      setArea: (params) => {
        const e = params.event.current()
        if (e.type !== 'AREA.SET')
          return
        applyHsva(params, { ...currentHsva(params), s: e.x * 100, v: (1 - e.y) * 100 })
      },

      stepArea: (params) => {
        const e = params.event.current()
        if (e.type !== 'AREA.STEP')
          return
        const hsva = currentHsva(params)
        const size = stepSize('area', !!e.large)
        const base = e.axis === 'x' ? hsva.s : hsva.v
        applyHsva(params, colorPickerWithArea(hsva, e.axis, base + e.direction * size))
      },

      areaToEdge: (params) => {
        const e = params.event.current()
        if (e.type !== 'AREA.TO_EDGE')
          return
        applyHsva(params, colorPickerWithArea(currentHsva(params), e.axis, e.edge === 'min' ? 0 : 100))
      },

      setChannel: (params) => {
        const e = params.event.current()
        if (e.type !== 'CHANNEL.SET')
          return
        applyHsva(params, colorPickerWithChannel(currentHsva(params), e.channel, e.value))
      },

      stepChannel: (params) => {
        const e = params.event.current()
        if (e.type !== 'CHANNEL.STEP')
          return
        const hsva = currentHsva(params)
        const next = colorPickerChannelValue(hsva, e.channel) + e.direction * stepSize(e.channel, !!e.large)
        applyHsva(params, colorPickerWithChannel(hsva, e.channel, next))
      },

      channelToEdge: (params) => {
        const e = params.event.current()
        if (e.type !== 'CHANNEL.TO_EDGE')
          return
        const range = colorPickerChannelRange(e.channel)
        applyHsva(params, colorPickerWithChannel(currentHsva(params), e.channel, e.edge === 'min' ? range.min : range.max))
      },

      /**
       * 打字：先留下草稿（框里的字不能被规范化冲掉，否则打 `#3b8` 的第三个字符时
       * 前面的会被改写），能收下就顺手落值——所见即所得，不必等回车。
       */
      setDraft: (params) => {
        const e = params.event.current()
        if (e.type !== 'INPUT.CHANGE')
          return
        params.context.set('draft', { channel: e.channel, text: e.value })
        if (!params.guard('canInteract'))
          return
        const next = colorPickerApplyInput(currentHsva(params), e.channel, e.value, params.prop('alpha') ?? false)
        if (next)
          applyHsva(params, next)
      },

      /**
       * 收下（回车或失焦）：收得了就落值，收不了就把草稿丢掉——
       * 框里那串半截字随即被规范文本顶替，用户看到的与实际值重新对上。
       */
      commitDraft: (params) => {
        const e = params.event.current()
        if (e.type !== 'INPUT.COMMIT')
          return
        const draft = params.context.get('draft')
        params.context.set('draft', null)
        if (!draft || draft.channel !== e.channel || !params.guard('canInteract'))
          return
        const next = colorPickerApplyInput(currentHsva(params), e.channel, draft.text, params.prop('alpha') ?? false)
        if (next)
          applyHsva(params, next)
      },

      clearDraft: ({ context }) => context.set('draft', null),

      startDrag: (params) => {
        const e = params.event.current()
        if (e.type !== 'DRAG.START')
          return
        params.context.set('dragTarget', e.target)
        applyPoint(params, e.target, e.point)
      },

      dragMove: (params) => {
        const e = params.event.current()
        const target = params.context.get('dragTarget')
        if (e.type !== 'DRAG.MOVE' || !target)
          return
        applyPoint(params, target, e.point)
      },

      endDrag: ({ context }) => context.set('dragTarget', null),

      setValueFromEyeDropper: (params) => {
        const e = params.event.current()
        if (e.type === 'EYE_DROPPER.RESULT')
          applyValueString(params, e.value)
      },
    },
    effects: {
      // 定位全程在 effect 里：引擎订阅的返回值即 cleanup，位置结果写进 context 供 connect 读
      trackPosition: ({ refs, prop, context, flush }) => {
        const engine = refs.get('position')
        // 无引擎（纯逻辑测试 / 无布局环境 / SSR）：不定位，其余照常
        if (!engine)
          return undefined

        let stop: (() => void) | undefined
        let disposed = false

        // 必须等 DOM 落定再挂：进入展开态这一刻 content 还带着 hidden（高度为 0），
        // 此时算出的坐标会少掉浮层自身的尺寸——placement=top 会正好错位一个浮层高度
        flush(() => {
          if (disposed)
            return
          const anchor = refs.get('getAnchorEl')()
          const floating = refs.get('getFloatingEl')()
          if (!anchor || !floating)
            return
          stop = engine.attach(
            anchor,
            floating,
            { placement: prop('placement') ?? COLOR_PICKER_DEFAULT_PLACEMENT, offset: prop('offset') },
            result => context.set('position', result),
          )
        })

        return () => {
          disposed = true
          stop?.()
        }
      },

      // 层只在展开期间入栈——消解层只让栈顶层响应 Escape，若层在挂载期就注册、与开合无关地
      // 常驻栈里，同页后挂载的那个会永久占着栈顶，把它下面每一层的 Escape 都堵死
      trackLayer: ({ refs, send }) => {
        const config = refs.get('config')
        const registerLayer = refs.get('registerLayer')
        // 无 DOM 环境（纯逻辑测试）：状态机照常转移，不挂副作用
        if (!config || !registerLayer)
          return undefined

        const { layer, dispose: disposeLayer } = registerLayer()

        const dismiss = createDismissLayer({
          config,
          layer,
          onDismiss: () => send({ type: 'CLOSE' }),
        })

        // 浮层里全是可聚焦控件（取色区、两条滑杆、数值框），展开即把焦点送进去，
        // 键盘用户才够得着。非模态：Tab 走得出去，走出去即由消解层判定是否收起
        const focus = createFocusScope({
          config,
          layer,
          container: () => refs.get('getContentEl')(),
          trapped: () => false,
          loop: false,
          restoreFocus: () => true,
        })

        // 逆序拆：先撤依赖层的两个订阅，最后才把层本身移出栈
        return () => {
          focus.dispose()
          dismiss.dispose()
          disposeLayer()
        }
      },

      // 监听器挂在文档上而不是取色区上：指针拖出区域甚至拖出窗口时仍要跟手，
      // 挂在区域上会在指针离开的那一刻断掉，颜色就停在半路。
      // pointercancel 也要收：系统手势抢走指针时不收会让状态永远停在 dragging
      trackPointer: ({ send, refs }) => {
        const area = refs.get('getAreaEl')()
        const doc = area?.ownerDocument ?? (typeof document === 'undefined' ? null : document)
        if (!doc)
          return undefined
        const onMove = (ev: PointerEvent): void => {
          send({ type: 'DRAG.MOVE', point: { clientX: ev.clientX, clientY: ev.clientY } })
        }
        const onUp = (): void => send({ type: 'DRAG.END' })
        doc.addEventListener('pointermove', onMove)
        doc.addEventListener('pointerup', onUp)
        doc.addEventListener('pointercancel', onUp)
        return () => {
          doc.removeEventListener('pointermove', onMove)
          doc.removeEventListener('pointerup', onUp)
          doc.removeEventListener('pointercancel', onUp)
        }
      },

      /**
       * 屏幕取色。异步活儿必须住在状态副作用里才拿得到拆卸钩子：
       * 取色途中组件被卸载、或浮层被收起时，兑现的 promise 会被 disposed 标记挡住，
       * 不会往已经停机或已经走远的机器里送事件；顺带把接口那边也取消掉。
       */
      runEyeDropper: ({ scope, send }) => {
        let disposed = false
        let controller: AbortController | null = null
        try {
          controller = new (scope.getWin().AbortController)()
        }
        catch {
          controller = null
        }

        colorPickerOpenEyeDropper(scope, controller?.signal).then(
          (value) => {
            if (!disposed)
              send({ type: 'EYE_DROPPER.RESULT', value })
          },
          () => {
            if (!disposed)
              send({ type: 'EYE_DROPPER.CANCEL' })
          },
        )

        return () => {
          disposed = true
          controller?.abort()
        }
      },
    },
  },
})
