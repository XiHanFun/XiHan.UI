/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 color picker 相关实现。

import type { Params, Scope, Service } from '@xihan-ui/core'
import type { ColorSliderSchema } from '../color-slider'
import type { ColorSwatchPickerSchema } from '../color-swatch-picker'
import type { ColorHsva } from '../shared/color'
import type { ColorPickerChannel } from './color-picker.color'
import type { ColorPickerPoint } from './color-picker.geometry'
import type { ColorPickerDragTarget, ColorPickerErrorDetails, ColorPickerErrors, ColorPickerSchema } from './color-picker.types'
import { resetDeclaredValue, setup } from '@xihan-ui/core'
import { createPointerSession, resolveSessionDoc } from '@xihan-ui/pointer'
import { COLOR_FALLBACK, colorHsvaToRgba, colorParse, colorResolveFormat, colorResolveHsva, colorRgbaToHsva, colorToString } from '../shared/color'
import { OVERLAY_OFFSET, OVERLAY_PLACEMENT_LIST } from '../shared/overlay'
import { trackOverlayLayer, trackPresenceResources } from '../shared/overlay-shell'
import { colorPickerApplyInput, colorPickerWithArea } from './color-picker.color'
import { colorPickerPointRatio } from './color-picker.geometry'

const { createMachine } = setup<ColorPickerSchema>()

/** 未指定 placement 时的落位；定位引擎与 connect 共用这一个缺省。 */
export const COLOR_PICKER_DEFAULT_PLACEMENT = OVERLAY_PLACEMENT_LIST

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

/** 宿主环境有没有屏幕取色；取色按钮据此禁用。 */
export function colorPickerHasEyeDropper(scope: Scope): boolean {
  return eyeDropperCtor(scope) != null
}

/** 唤起屏幕取色。用户放弃与接口缺席一律以 promise 拒绝表达。 */
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

type ColorPickerErrorSlot = keyof ColorPickerErrors

function emptyErrors(): ColorPickerErrors {
  return { format: null, input: null, parse: null, eyeDropper: null }
}

function sameError(a: ColorPickerErrorDetails | null, b: ColorPickerErrorDetails): boolean {
  if (!a || a.type !== b.type)
    return false
  if (a.type === 'format' && b.type === 'format')
    return a.format === b.format
  if (a.type === 'input' && b.type === 'input')
    return a.channel === b.channel && a.value === b.value
  if (a.type === 'parse' && b.type === 'parse')
    return a.source === b.source && a.value === b.value
  return a.type === 'eye-dropper' && b.type === 'eye-dropper' && Object.is(a.cause, b.cause)
}

function setError(params: MachineParams, slot: ColorPickerErrorSlot, error: ColorPickerErrorDetails): void {
  const current = params.context.get('errors')
  if (sameError(current[slot], error))
    return
  params.context.set('errors', { ...current, [slot]: error })
  params.prop('onColorError')?.(error)
}

function clearError(params: MachineParams, slot: ColorPickerErrorSlot): void {
  const current = params.context.get('errors')
  if (current[slot] === null)
    return
  params.context.set('errors', { ...current, [slot]: null })
}

function clearAllErrors(params: MachineParams): void {
  const current = params.context.get('errors')
  if (Object.values(current).some(Boolean))
    params.context.set('errors', emptyErrors())
}

function syncValueError(params: MachineParams): void {
  params.context.set('draft', null)
  clearError(params, 'input')
  const value = params.context.get('value')
  if (colorParse(value)) {
    clearError(params, 'parse')
    return
  }
  setError(params, 'parse', { type: 'parse', source: 'external', value })
}

function syncFormatError(params: MachineParams): void {
  const format = params.prop('format') as string | undefined
  if (colorResolveFormat(format)) {
    clearError(params, 'format')
    return
  }
  setError(params, 'format', { type: 'format', format: String(format) })
}

function isEyeDropperCancel(error: unknown): boolean {
  return typeof error === 'object' && error !== null && (error as { name?: unknown }).name === 'AbortError'
}

/** 当前工作色：值串加上锚。灰度处的色相由锚保住，详见 colorResolveHsva。 */
function currentHsva(params: MachineParams): ColorHsva {
  return colorResolveHsva(params.context.get('value'), params.context.get('anchor'))
}

/**
 * 落一个新的工作色。锚与值一起写。
 *
 * 受控时 context.set('value') 只发回调不落内部值，锚与当前值对不上，connect 退回按当前值反解。
 */
function applyHsva(params: MachineParams, next: ColorHsva): void {
  const { context, prop } = params
  const format = colorResolveFormat(prop('format') as string | undefined)
  if (!format) {
    syncFormatError(params)
    return
  }
  const alpha = prop('alpha') ?? false
  const hsva: ColorHsva = alpha ? next : { ...next, a: 1 }
  const value = colorToString(colorHsvaToRgba(hsva), format, alpha)
  context.set('draft', null)
  clearError(params, 'format')
  clearError(params, 'input')
  clearError(params, 'parse')
  context.set('anchor', { value, hsva })
  context.set('value', value)
}

/** 把一个外来的串收成工作色；解析不出时保留原值并显式报告来源。 */
function applyValueString(params: MachineParams, raw: string, source: 'external' | 'api' | 'swatch' | 'eye-dropper'): void {
  const rgba = colorParse(raw)
  if (!rgba) {
    setError(params, 'parse', { type: 'parse', source, value: raw })
    return
  }
  applyHsva(params, colorRgbaToHsva(rgba, currentHsva(params).h))
}

/** 取色区的拖动落点 → 工作色。矩形在事件那一刻现量，connect 不得读 DOM。 */
function applyPoint(params: MachineParams, point: ColorPickerPoint): void {
  const { refs, prop } = params
  const el = refs.get('getAreaEl')()
  // 节点还没就位时原地不动
  if (!el)
    return
  const ratio = colorPickerPointRatio(point, el.getBoundingClientRect(), prop('dir'))
  // 纵轴向下是明度变暗，所以取补数
  applyHsva(params, { ...currentHsva(params), s: ratio.x * 100, v: (1 - ratio.y) * 100 })
}

/** 通道名与播报文本：取色器文案桶里的两条，转成滑块那份文案的形状。 */
const CHANNEL_UNIT: Record<ColorPickerChannel, string> = { hue: '°', alpha: '%' }
const CHANNEL_NAME: Record<ColorPickerChannel, string> = { hue: 'Hue', alpha: 'Alpha' }

/**
 * 喂给某条内嵌颜色滑块的 props：值串、工作色与状态都受控于取色器，推动经 HSVA.SET 送回来。
 * 工作色整份交过去（而不只是串）：灰度处的色相、全透明处的三个分量串里写不进，滑块推色相时才不会把它们抹掉。
 *
 * 透明度那条在 alpha 关掉时整条不可用，与禁用同一档；只读只是改不动，Tab 位照留。
 */
function colorPickerSliderProps(service: Service<ColorPickerSchema>, channel: ColorPickerChannel): ColorSliderSchema['props'] {
  const { prop, context, send } = service
  const translations = prop('translations')
  const format = colorResolveFormat(prop('format') as string | undefined) ?? 'hex'
  const alpha = prop('alpha') ?? false
  return {
    channel,
    value: context.get('value'),
    hsva: colorResolveHsva(context.get('value'), context.get('anchor')),
    format,
    // 色相那条也要保留透明度，否则推色相会把透明度归 1
    alpha,
    orientation: 'horizontal',
    dir: prop('dir'),
    size: prop('size'),
    disabled: !!prop('disabled') || (channel === 'alpha' && !alpha),
    readOnly: !!prop('readOnly'),
    translations: {
      label: () => translations?.channel?.(channel) ?? CHANNEL_NAME[channel],
      valueText: (_, value) => translations?.channelValueText?.(channel, value) ?? `${value}${CHANNEL_UNIT[channel]}`,
    },
    onValueChange: ({ hsva }) => send({ type: 'HSVA.SET', hsva }),
  }
}

/** 色相那条颜色滑块的 props。 */
export function colorPickerHueSliderProps(service: Service<ColorPickerSchema>): ColorSliderSchema['props'] {
  return colorPickerSliderProps(service, 'hue')
}

/** 透明度那条颜色滑块的 props。 */
export function colorPickerAlphaSliderProps(service: Service<ColorPickerSchema>): ColorSliderSchema['props'] {
  return colorPickerSliderProps(service, 'alpha')
}

/**
 * 喂给内嵌色块选择器的 props：格子取 swatches，选中值就是取色器当前的串（色板按颜色比，写法不同也对得上），
 * 挑一格经 VALUE.SET 送回来。只读与禁用都不改值；色板整组禁用时格子仍可聚焦，与色板单独用时一致。
 */
export function colorPickerSwatchPickerProps(service: Service<ColorPickerSchema>): ColorSwatchPickerSchema['props'] {
  const { prop, context, send } = service
  const translations = prop('translations')
  return {
    swatches: (prop('swatches') ?? []).map(value => ({ value })),
    value: context.get('value'),
    disabled: !!prop('disabled'),
    readOnly: !!prop('readOnly'),
    dir: prop('dir'),
    size: prop('size'),
    translations: {
      group: translations?.swatchGroup ?? 'Color swatches',
      swatch: translations?.swatch ?? (value => `Color ${value}`),
    },
    onValueChange: ({ value }) => {
      if (value != null)
        send({ type: 'VALUE.SET', value, source: 'swatch' })
    },
  }
}

function stepSize(large: boolean): number {
  return large ? 10 : 1
}

// 值走 cell 原生受控（value 给定即受控），不需要影子事件；
// 开合编进 FSM 状态，走守卫对 + CONTROLLED.* 影子事件 + watch。
// 展开态下再分闲置、指针拖动、屏幕取色三段，后两者各挂一份副作用。
export const colorPickerMachine = createMachine({
  name: 'color-picker',
  context: ({ prop, cell }) => ({
    value: cell<string>(() => ({
      value: prop('value'),
      defaultValue: prop('defaultValue') ?? COLOR_FALLBACK,
      onChange: value => prop('onValueChange')?.({ value }),
    })),
    anchor: cell<ColorPickerSchema['context']['anchor']>(() => ({ defaultValue: null })),
    position: cell<ColorPickerSchema['context']['position']>(() => ({ defaultValue: null })),
    draft: cell<ColorPickerSchema['context']['draft']>(() => ({ defaultValue: null })),
    dragTarget: cell<ColorPickerDragTarget | null>(() => ({ defaultValue: null })),
    eyeDropperSupported: cell<boolean>(() => ({ defaultValue: false })),
    errors: cell<ColorPickerErrors>(() => ({ defaultValue: emptyErrors() })),
  }),
  refs: () => ({
    config: null,
    registerLayer: null,
    presence: null,
    position: null,
    getAnchorEl: () => null,
    getFloatingEl: () => null,
    getContentEl: () => null,
    getAreaEl: () => null,
  }),
  initialState: ({ prop }) => ((prop('open') ?? prop('defaultOpen')) ? 'open' : 'closed'),
  // Layer、消解与焦点资源由顶层 effect 持有，逻辑关闭后等 Presence 真实退场再释放。
  effects: ['trackLayer'],
  // 挂载即问一次环境有没有屏幕取色，按钮从首帧起就要正确禁用
  entry: ['syncValueError', 'syncFormatError', 'syncEyeDropperSupport'],
  // 开合受控时用户事件只发意图、不自改状态；宿主写回 open 后由这里派发影子事件无条件回写
  watch: ({ track, prop, action }) => {
    track([() => prop('open')], () => action(['syncOpen']))
    track([() => prop('value')], () => action(['syncValueError']))
    track([() => prop('format')], () => action(['syncFormatError']))
  },
  // 改值与开合无关，收起态下 api.setValue 同样要认
  on: {
    'FORM.RESET': { actions: ['resetToDefault'] },
    'VALUE.SET': { guard: 'canInteract', actions: ['setValue'] },
    'AREA.SET': { guard: 'canInteract', actions: ['setArea'] },
    'AREA.STEP': { guard: 'canInteract', actions: ['stepArea'] },
    'AREA.TO_EDGE': { guard: 'canInteract', actions: ['areaToEdge'] },
    'HSVA.SET': { guard: 'canInteract', actions: ['setHsva'] },
    // 打字不设守卫：草稿是纯显示状态，落值那一步在 setDraft / commitDraft 内另有守卫
    'INPUT.CHANGE': { actions: ['setDraft'] },
    'INPUT.COMMIT': { actions: ['commitDraft'] },
    'ERROR.CLEAR': { actions: ['clearErrors'] },
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
      // 定位只服务逻辑展开；行为资源由顶层 effect 延后到真实退场释放。
      effects: ['trackPosition'],
      // 收起时丢掉没收下的草稿，再展开时输入框显示当前颜色
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
            // 按下即跳，随后的拖动由 trackPointer 接手
            'DRAG.START': { guard: 'canInteract', target: 'open.dragging', actions: ['startDrag'] },
            'EYE_DROPPER.OPEN': { guard: 'canPick', target: 'open.picking', actions: ['clearEyeDropperError'] },
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
            'EYE_DROPPER.CANCEL': { target: 'open.idle' },
            'EYE_DROPPER.ERROR': { target: 'open.idle', actions: ['setEyeDropperError'] },
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
      resetToDefault: (params) => {
        if (params.prop('value') === undefined)
          params.context.reset('anchor')
        resetDeclaredValue(params, 'value', 'value', 'defaultValue')
        params.context.reset('draft')
        clearAllErrors(params)
        syncValueError(params)
        syncFormatError(params)
      },

      invokeOnOpen: ({ prop }) => prop('onOpenChange')?.({ open: true }),
      invokeOnClose: ({ prop }) => prop('onOpenChange')?.({ open: false }),

      // 只在受控（open 为布尔）时回写；open 变回 undefined = 转非受控，不强制关闭
      syncOpen: ({ prop, send }) => {
        const open = prop('open')
        if (open === undefined)
          return
        send(open ? { type: 'CONTROLLED.OPEN' } : { type: 'CONTROLLED.CLOSE' })
      },

      syncValueError,
      syncFormatError,

      syncEyeDropperSupport: ({ scope, context }) => {
        context.set('eyeDropperSupported', colorPickerHasEyeDropper(scope))
      },

      setValue: (params) => {
        const e = params.event.current()
        if (e.type === 'VALUE.SET')
          applyValueString(params, e.value, e.source ?? 'api')
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
        const size = stepSize(!!e.large)
        const base = e.axis === 'x' ? hsva.s : hsva.v
        applyHsva(params, colorPickerWithArea(hsva, e.axis, base + e.direction * size))
      },

      areaToEdge: (params) => {
        const e = params.event.current()
        if (e.type !== 'AREA.TO_EDGE')
          return
        applyHsva(params, colorPickerWithArea(currentHsva(params), e.axis, e.edge === 'min' ? 0 : 100))
      },

      // 内嵌滑块推出来的整份工作色直接落下：它已经按取色器交过去的工作色算好，不再从串反解
      setHsva: (params) => {
        const e = params.event.current()
        if (e.type !== 'HSVA.SET')
          return
        applyHsva(params, e.hsva)
      },

      /** 打字：先留下草稿（框里的字不能被规范文本冲掉），能收下就顺手落值。 */
      setDraft: (params) => {
        const e = params.event.current()
        if (e.type !== 'INPUT.CHANGE')
          return
        params.context.set('draft', { channel: e.channel, text: e.value })
        if (!params.guard('canInteract'))
          return
        const next = colorPickerApplyInput(currentHsva(params), e.channel, e.value, params.prop('alpha') ?? false)
        if (!next) {
          setError(params, 'input', { type: 'input', channel: e.channel, value: e.value })
          return
        }
        clearError(params, 'input')
        applyHsva(params, next)
      },

      /** 收下（回车或失焦）：收得了就落值，收不了保留草稿与错误供作者修正。 */
      commitDraft: (params) => {
        const e = params.event.current()
        if (e.type !== 'INPUT.COMMIT')
          return
        const draft = params.context.get('draft')
        if (!draft || draft.channel !== e.channel || !params.guard('canInteract'))
          return
        const next = colorPickerApplyInput(currentHsva(params), e.channel, draft.text, params.prop('alpha') ?? false)
        if (!next) {
          setError(params, 'input', { type: 'input', channel: draft.channel, value: draft.text })
          return
        }
        applyHsva(params, next)
      },

      clearDraft: (params) => {
        params.context.set('draft', null)
        clearError(params, 'input')
      },

      startDrag: (params) => {
        const e = params.event.current()
        if (e.type !== 'DRAG.START')
          return
        params.context.set('dragTarget', e.target)
        applyPoint(params, e.point)
      },

      dragMove: (params) => {
        const e = params.event.current()
        const target = params.context.get('dragTarget')
        if (e.type !== 'DRAG.MOVE' || !target)
          return
        applyPoint(params, e.point)
      },

      endDrag: ({ context }) => context.set('dragTarget', null),

      setValueFromEyeDropper: (params) => {
        const e = params.event.current()
        if (e.type === 'EYE_DROPPER.RESULT')
          applyValueString(params, e.value, 'eye-dropper')
      },

      setEyeDropperError: (params) => {
        const e = params.event.current()
        if (e.type === 'EYE_DROPPER.ERROR')
          setError(params, 'eyeDropper', { type: 'eye-dropper', cause: e.cause })
      },

      clearEyeDropperError: (params) => {
        clearError(params, 'eyeDropper')
        const parseError = params.context.get('errors').parse
        if (parseError?.source === 'eye-dropper')
          clearError(params, 'parse')
      },
      clearErrors: (params) => {
        params.context.set('draft', null)
        clearAllErrors(params)
      },
    },
    effects: {
      // 定位全程在 effect 里：引擎订阅的返回值即 cleanup，位置结果写进 context 供 connect 读
      trackPosition: ({ refs, prop, context, flush }) => {
        // 进入展开态先清上一次的坐标：引擎量完之前不算落位，皮肤据此藏着。
        // 不清的话重开会按上次的位置判「已落位」——页面滚过就在旧位置闪一帧
        context.set('position', null)
        const engine = refs.get('position')
        // 无引擎时不定位，其余照常
        if (!engine)
          return undefined

        let stop: (() => void) | undefined
        let disposed = false

        // 必须等 DOM 落定再挂：进入展开态这一刻 content 还带着 hidden，此时量出的浮层尺寸为 0
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
            {
              placement: prop('placement') ?? COLOR_PICKER_DEFAULT_PLACEMENT,
              offset: prop('offset') ?? OVERLAY_OFFSET,
              // positioner 渲染成 fixed，坐标系必须跟着走视口系
              strategy: 'fixed',
              // start / end 是逻辑对齐，RTL 下行内轴要翻过来
              dir: prop('dir'),
              // 落定那一侧的可用空间，connect 转成内联自定义属性给皮肤限高
              size: true,
            },
            result => context.set('position', result),
          )
        })

        return () => {
          disposed = true
          stop?.()
        }
      },

      // Layer、DismissableLayer 与 FocusScope 共用 Presence 生命周期；退场中仍占栈顶但不再响应关闭。
      trackLayer: ({ refs, send, flush, scope, state, track }) => {
        let reactivateFocus: (() => void) | null = null
        return trackPresenceResources({
          presence: () => refs.get('presence'),
          open: () => state.matches('open'),
          track,
          acquire: () => trackOverlayLayer({
            // 无 DOM 环境不挂副作用，状态机照常转移
            config: refs.get('config'),
            registerLayer: refs.get('registerLayer'),
            flush,
            active: () => state.matches('open'),
            onDismiss: () => send({ type: 'CLOSE' }),
            focusScope: {
              // 展开即把焦点送进浮层；非模态，Tab 走得出去后由消解层判定是否收起
              container: () => refs.get('getContentEl')(),
              restoreFocus: () => true,
              // 归还落点显式给触发器：Safari 指针激活时也不退回 body。
              restoreTarget: () => refs.get('getAnchorEl')(),
              onReactivate: reactivate => reactivateFocus = reactivate,
            },
          }),
          onReopen: () => {
            const activate = reactivateFocus
            flush(() => scope.getWin().requestAnimationFrame(() => {
              if (state.matches('open') && reactivateFocus === activate)
                activate?.()
            }))
          },
        })
      },

      // 跟手交给指针会话：监听挂在文档上，挂在取色区上指针一离开就断，系统收走指针也会收尾
      trackPointer: ({ send, refs }) => {
        const session = createPointerSession({
          doc: resolveSessionDoc(refs.get('getAreaEl')()),
          onMove: ({ point }) => send({ type: 'DRAG.MOVE', point }),
          onEnd: () => send({ type: 'DRAG.END' }),
        })
        return () => session.dispose()
      },

      /** 屏幕取色。拆卸时用 disposed 标记挡掉已过期的 promise 回送，并 abort 接口。 */
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
          (error) => {
            if (!disposed)
              send(isEyeDropperCancel(error) ? { type: 'EYE_DROPPER.CANCEL' } : { type: 'EYE_DROPPER.ERROR', cause: error })
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
