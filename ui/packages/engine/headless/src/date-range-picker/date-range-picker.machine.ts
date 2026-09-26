/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 date range picker 相关实现。

import type { PositionResult, Service } from '@xihan-ui/core'
import type { CalendarRangePickerSchema } from '../calendar-range-picker'
import type { DateFieldSchema } from '../date-field'
import type { CalendarView } from '../shared/calendar'
import type { DateRangePickerPressedKey, DateRangePickerSchema, DateRangePickerValueSource } from './date-range-picker.types'
import { canTakeFocus, itemValue, resetDeclaredValue, resolveLocale, setup } from '@xihan-ui/core'
import { getLocalTimeZone, today } from '@xihan-ui/core/date'
import { calendarRangePickerAnatomy } from '../calendar-range-picker'
import { DATE_PICKER_GRANULARITY, datePickerSegmentSet } from '../date-picker'
import { sortIso } from '../shared/calendar'
import { OVERLAY_OFFSET, OVERLAY_PLACEMENT_LIST } from '../shared/overlay'
import { overlayCloseOnDismiss, trackOverlayLayer, trackOverlayPosition, trackPresenceResources } from '../shared/overlay-shell'

const { createMachine, guards } = setup<DateRangePickerSchema>()
const { and } = guards

/** 未指定 placement 时的默认落位，定位引擎与 connect 共用。 */
export const DATE_RANGE_PICKER_DEFAULT_PLACEMENT = OVERLAY_PLACEMENT_LIST

/** 日期格子的 CSS 选择器，取自日历解剖。 */
const CELL_TRIGGER_SELECTOR = calendarRangePickerAnatomy.build()['cell-trigger'].selector

/**
 * 对外的值：裁掉尾部的空位，前面的空缺原样留着。
 * 只填了终点时是 ['', 终点]——受控回写读的是同一份下标，抹掉这个空位会让终点
 * 落回起点那一格。只填起点时尾部无空位，仍是长度 1。
 */
function trimTrailingHoles(value: readonly string[]): string[] {
  const out = [...value]
  while (out.length > 0 && out[out.length - 1] === '')
    out.pop()
  return out
}

/** 收口整份写入的区间：空串是占位先丢掉，去重升序后最多两端。 */
function normalizeRange(next: readonly string[]): string[] {
  return sortIso(next.filter(v => v !== '')).slice(0, 2)
}

// 数组按位比：受控时每次读都归一成新数组，用默认的 Object.is 会把每次读写都判成变更。
// 空串是占位，与该位缺席算同一件事：对外通知过滤掉空串，回写的那一份短一截
function sameValues(a: string[], b: string[] | undefined): boolean {
  if (!b)
    return false
  const len = Math.max(a.length, b.length)
  for (let i = 0; i < len; i += 1) {
    if ((a[i] ?? '') !== (b[i] ?? ''))
      return false
  }
  return true
}

/**
 * 交给日历的那份值：空串占位剔掉。按底层数组缓存，同一份值每次读到的都是同一个数组——
 * 日历盯着它的引用判「值被宿主整份改写」，每读一次就 filter 出新数组会让刚落的起点当场作废。
 */
const filledCache = new WeakMap<readonly string[], string[]>()
function filledOf(value: string[]): string[] {
  let hit = filledCache.get(value)
  if (!hit) {
    hit = value.includes('') ? value.filter(v => v !== '') : value
    filledCache.set(value, hit)
  }
  return hit
}

/** 首个真实存在的选中值；空串是占位不算数。 */
function firstValue(values: readonly string[]): string | null {
  return values.find(v => v !== '') ?? null
}

/** 取区间某一端；空串占位视同没有值。 */
function valueAt(values: readonly string[], index: 0 | 1): string | null {
  return values[index] || null
}

/**
 * 按位写入区间的一端：另一端原样留着，空缺处填空串占位，位置不因缺值而错位。
 * 两端都空即空集合。
 */
function writeRangeAt(current: readonly string[], index: 0 | 1, value: string | null): string[] {
  const next: [string, string] = [current[0] ?? '', current[1] ?? '']
  next[index] = value ?? ''
  return next[0] === '' && next[1] === '' ? [] : next
}

function timeZoneOf(service: Service<DateRangePickerSchema>): string {
  return service.prop('timeZone') ?? getLocalTimeZone()
}

/**
 * 生效聚焦日：context 未定过则退回首个选中值，再退回今天。
 *
 * 恒返回非空串：日历的 focusedValue 须始终受控，不得在受控与非受控之间切换。
 */
export function dateRangePickerFocusedValue(service: Service<DateRangePickerSchema>): string {
  return service.context.get('focusedValue')
    ?? firstValue(service.context.get('value'))
    ?? today(timeZoneOf(service)).toString()
}

/** 这台编排机此刻用的语言标记：作者给的优先，没给按宿主语言，宿主也没有时按 en-US。 */
export function dateRangePickerLocale(service: Service<DateRangePickerSchema>): string {
  return resolveLocale(service.prop('locale'), service.scope)
}

/** 喂给内嵌日历的那份 props：两端与聚焦日受控，选中与聚焦经回调送回编排机。 */
export function dateRangePickerCalendarProps(service: Service<DateRangePickerSchema>): CalendarRangePickerSchema['props'] {
  const { prop, context, send } = service
  return {
    // 空串占位不交给日历：它只认真实存在的两端
    value: filledOf(context.get('value')),
    focusedValue: dateRangePickerFocusedValue(service),
    granularity: prop('granularity'),
    // 钻到哪一层由编排机持有：日历是内嵌的，收起再展开要回到作者要的那一档
    activeView: context.get('activeView'),
    onActiveViewChange: ({ activeView }) => send({ type: 'VIEW.SET', activeView }),
    visibleCount: prop('visibleCount') ?? 1,
    // 恒六行：翻页时浮层的高度不跟着月份变
    fixedWeeks: prop('fixedWeeks') ?? true,
    min: prop('min'),
    max: prop('max'),
    locale: prop('locale'),
    timeZone: prop('timeZone'),
    isDateUnavailable: prop('isDateUnavailable'),
    allowsNonContiguousRanges: prop('allowsNonContiguousRanges'),
    disabled: prop('disabled'),
    readOnly: prop('readOnly'),
    // 日历那几句读屏文案从同一份文案桶里取
    translations: prop('translations'),
    onValueChange: ({ value }) => send({ type: 'VALUE.SET', value, src: 'calendar' }),
    onFocusedValueChange: ({ focusedValue }) => send({ type: 'FOCUSED.SET', value: focusedValue }),
  }
}

/** 喂给某一组段位的那份 props：index 即它承载的那一端。 */
function dateRangePickerFieldPropsAt(
  service: Service<DateRangePickerSchema>,
  index: 0 | 1,
): DateFieldSchema['props'] {
  const { prop, context, send } = service
  const src: DateRangePickerValueSource = index === 0 ? 'field' : 'field-end'
  return {
    value: valueAt(context.get('value'), index),
    granularity: DATE_PICKER_GRANULARITY,
    // 段集在场时 granularity 让路；不给就走老路，年月日按 locale 排
    segments: prop('segments') ?? datePickerSegmentSet(prop('granularity')),
    min: prop('min'),
    max: prop('max'),
    locale: prop('locale'),
    timeZone: prop('timeZone'),
    disabled: prop('disabled'),
    readOnly: prop('readOnly'),
    invalid: prop('invalid'),
    required: prop('required'),
    name: index === 0 ? prop('name') : prop('endName'),
    onValueChange: ({ value }) => {
      send({ type: 'VALUE.SET', value: writeRangeAt(context.get('value'), index, value), src })
    },
  }
}

/** 喂给起点那组段位的 props：承载 value[0]，表单名走 name。 */
export function dateRangePickerFieldProps(service: Service<DateRangePickerSchema>): DateFieldSchema['props'] {
  return dateRangePickerFieldPropsAt(service, 0)
}

/** 喂给终点那组段位的 props：承载 value[1]，表单名走 endName。 */
export function dateRangePickerFieldEndProps(service: Service<DateRangePickerSchema>): DateFieldSchema['props'] {
  return dateRangePickerFieldPropsAt(service, 1)
}

/**
 * 在浮层里按 ISO 串找到那一天的格子。
 *
 * 不能改用 queryItems：容器是本组件的 content、格子属于 calendar scope，归属过滤会把格子全滤掉。
 */
export function findDateRangePickerCellEl(container: HTMLElement | null, value: string | null): HTMLElement | null {
  if (!container || value == null)
    return null
  const cells = [...container.querySelectorAll<HTMLElement>(CELL_TRIGGER_SELECTOR)]
  return cells.find(el => itemValue(el) === value) ?? null
}

// 这台机器只管开合、值同步与焦点去处；日期数学由日历算好后以 ISO 串送进来。
// 值的受控收口在 cell（给定 prop 即受控）；开合编进 FSM 状态，受控时走守卫对 + CONTROLLED.* 影子事件 + watch。
export const dateRangePickerMachine = createMachine({
  name: 'date-range-picker',
  context: ({ prop, cell }) => ({
    // 位置结果由 trackPosition 里的引擎回填；connect 只读这里，不碰 DOM
    position: cell<PositionResult | null>(() => ({ defaultValue: null })),
    value: cell<string[]>(() => ({
      value: prop('value'),
      defaultValue: prop('defaultValue') ?? [],
      isEqual: sameValues,
      onChange: value => prop('onValueChange')?.({ value: trimTrailingHoles(value) }),
    })),
    // 聚焦日不受控，onFocusedValueChange 只作对外重画通知
    focusedValue: cell<string | null>(() => ({
      defaultValue: prop('defaultFocusedValue') ?? null,
      onChange: (focusedValue) => {
        if (focusedValue != null)
          prop('onFocusedValueChange')?.({ focusedValue })
      },
    })),
    // 人钻到了哪一层。缺省即作者要挑的那一档，每次展开都拨回去
    activeView: cell<CalendarView>(() => ({
      value: prop('activeView'),
      defaultValue: prop('granularity') ?? 'day',
      onChange: activeView => prop('onActiveViewChange')?.({ activeView }),
    })),
    returnFocus: cell<boolean>(() => ({ defaultValue: true })),
    // 缺省搬：触发钮、键盘与命令式入口都要把焦点送进浮层
    moveFocusIn: cell<boolean>(() => ({ defaultValue: true })),
    // 按压通道：被 Space / Enter 或触屏按住的那一个部件（清空钮 / 触发钮 / 快捷选项），按 key 记
    pressed: cell<DateRangePickerPressedKey | null>(() => ({ defaultValue: null })),
  }),
  refs: () => ({
    config: null,
    registerLayer: null,
    presence: null,
    position: null,
    getAnchorEl: () => null,
    getFloatingEl: () => null,
    getContentEl: () => null,
  }),
  initialState: ({ prop }) => ((prop('open') ?? prop('defaultOpen')) ? 'open' : 'closed'),
  // Layer、消解与焦点资源由顶层 effect 持有，逻辑关闭后等 Presence 真实退场再释放。
  effects: ['trackLayer'],
  // 开合受控（给定 open prop）时用户事件只发意图、不自改状态；宿主写回 open 后由 watch
  // 派发 CONTROLLED.* 回写状态
  watch: ({ track, prop, context, action }) => {
    track([() => prop('open')], () => action(['syncOpen']))
    // 按住途中转入禁用 / 只读或值被清空：触发钮随即 disabled、清空钮藏起，不会再来 keyup，按压面由机器自己收
    track([() => prop('disabled'), () => prop('readOnly'), context.dep('value')], () => action(['releaseWhenInert']))
  },
  // 两个状态都要认；展开态另行声明的 VALUE.SET 会盖过这里这一条
  on: {
    'FORM.RESET': { actions: ['resetToDefault'] },
    'VALUE.SET': { actions: ['setValue', 'syncFocusedValue'] },
    'VALUE.CLEAR': { actions: ['clearValue'] },
    'FOCUSED.SET': { actions: ['setFocusedValue'] },
    'VIEW.SET': { actions: ['setActiveView'] },
    // 按压通道：触发钮与清空钮在收起态按、快捷选项在展开态按，两个状态都认
    'PRESS.START': { guard: 'canPress', actions: ['startPress'] },
    'PRESS.END': { actions: ['endPress'] },
  },
  states: {
    closed: {
      on: {
        // 受控命中 → 只发意图；非受控 → 落 target 并一并通知
        'OPEN': [
          { guard: 'isOpenControlled', actions: ['setMoveFocusIn', 'setReturnFocus', 'invokeOnOpen'] },
          { target: 'open', actions: ['setMoveFocusIn', 'setReturnFocus', 'invokeOnOpen'] },
        ],
        'TOGGLE': [
          { guard: 'isOpenControlled', actions: ['setMoveFocusIn', 'setReturnFocus', 'invokeOnOpen'] },
          { target: 'open', actions: ['setMoveFocusIn', 'setReturnFocus', 'invokeOnOpen'] },
        ],
        'CONTROLLED.OPEN': { target: 'open' },
      },
    },
    open: {
      // 焦点域靠这个值去活 DOM 里找落点格子；钻到哪一层也一并拨回作者要的那一档
      entry: ['focusSelectedDay', 'resetActiveView'],
      // 按住快捷选项途中收起（Enter 在 keydown 即写值收起）：浮层里的部件不会再来 keyup
      exit: ['releasePress'],
      // 定位只服务逻辑展开；行为资源由顶层 effect 延后到真实退场释放。
      effects: ['trackPosition'],
      on: {
        'CLOSE': [
          { guard: 'isOpenControlled', actions: ['setReturnFocus', 'invokeOnClose'] },
          { target: 'closed', actions: ['setReturnFocus', 'invokeOnClose'] },
        ],
        'TOGGLE': [
          { guard: 'isOpenControlled', actions: ['setReturnFocus', 'invokeOnClose'] },
          { target: 'closed', actions: ['setReturnFocus', 'invokeOnClose'] },
        ],
        // closeOnSelect 时收起；受控的是 open 不是值，两条分支都照落值
        'VALUE.SET': [
          {
            guard: and('closesOnSelect', 'isOpenControlled'),
            actions: ['setValue', 'syncFocusedValue', 'setReturnFocus', 'invokeOnClose'],
          },
          {
            guard: 'closesOnSelect',
            target: 'closed',
            actions: ['setValue', 'syncFocusedValue', 'setReturnFocus', 'invokeOnClose'],
          },
          { actions: ['setValue', 'syncFocusedValue'] },
        ],
        'CONTROLLED.CLOSE': { target: 'closed' },
      },
    },
  },
  implementations: {
    guards: {
      isOpenControlled: ({ prop }) => prop('open') !== undefined,

      /** 这一次写值该不该收起浮层：只认日历与快捷选项两路，且要两端都落定。 */
      closesOnSelect: ({ prop, event }) => {
        const e = event.current()
        if (e.type !== 'VALUE.SET' || (e.src !== 'calendar' && e.src !== 'preset'))
          return false
        if ((prop('closeOnSelect') ?? true) === false)
          return false
        return e.value.filter(v => v !== '').length >= 2
      },

      /**
       * 按压守卫：整体禁用一律不进；触发钮只读仍可展开查看，照有回执；其余（清空钮、快捷选项）与它们各自的
       * 写值同一道门——只读改不动值，逐条禁用的事实由 connect 随事件带来。
       */
      canPress: ({ prop, event }) => {
        const e = event.current()
        if (e.type !== 'PRESS.START' || e.disabled || prop('disabled'))
          return false
        return e.key === 'trigger' || !prop('readOnly')
      },
    },
    actions: {
      startPress: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'PRESS.START')
          context.set('pressed', e.key)
      },
      // 只收自己那一下：另一个部件的 keyup 不该把正按着的这个松开
      endPress: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'PRESS.END' && context.get('pressed') === e.key)
          context.set('pressed', null)
      },
      releasePress: ({ context }) => context.set('pressed', null),
      // 转入禁用一律松开；只读松开触发钮以外的；清空钮在两端都清空时藏起，随之松开（与 connect 的 canClear 同口径）
      releaseWhenInert: ({ context, prop }) => {
        const pressed = context.get('pressed')
        if (pressed == null)
          return
        const empty = context.get('value').every(v => v === '')
        if (prop('disabled') || (prop('readOnly') && pressed !== 'trigger') || (pressed === 'clear' && empty))
          context.set('pressed', null)
      },

      resetToDefault: (params) => {
        resetDeclaredValue(params, 'value', 'value', 'defaultValue')
        params.context.reset('focusedValue')
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

      /** 点输入行展开的那一路不搬焦点，其余（触发钮、键盘、命令式）照搬。 */
      setMoveFocusIn: ({ context, event }) => {
        const e = event.current()
        const src = e.type === 'OPEN' || e.type === 'TOGGLE' ? e.src : undefined
        context.set('moveFocusIn', src !== 'control')
      },

      // Tab 关闭与层外交互不归还焦点：焦点已落在别处，抢回会把光标从新落点拽走；其余出口归还
      setReturnFocus: ({ context, event }) => {
        const e = event.current()
        const handedOff = e.type === 'CLOSE' && (e.src === 'tab' || e.src === 'interact-outside')
        context.set('returnFocus', !handedOff)
      },

      // 段位来的值按位落：不排序也不去重，两端各自对应一组输入框；其余来源整份归一
      setValue: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'VALUE.SET')
          return
        const fromField = e.src === 'field' || e.src === 'field-end'
        context.set('value', fromField ? e.value.slice(0, 2) : normalizeRange(e.value))
      },

      clearValue: ({ context }) => context.set('value', []),

      setFocusedValue: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'FOCUSED.SET')
          context.set('focusedValue', e.value)
      },

      /**
       * 值变了，日历跟着翻到那一天所在的月：终点那组段位跟终点，其余跟首个选中值。
       *
       * 不认日历那一路：日历点选时已先发过 FOCUSED.SET，这里再改一遍会把区间终点的焦点拽回起点。
       */
      syncFocusedValue: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'VALUE.SET' || e.src === 'calendar')
          return
        const values = context.get('value')
        const next = e.src === 'field-end' ? valueAt(values, 1) : firstValue(values)
        if (next != null)
          context.set('focusedValue', next)
      },

      setActiveView: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'VIEW.SET')
          context.set('activeView', e.activeView)
      },

      /** 展开那一刻回到作者要的那一档：上次钻上去看年份，这次展开不该还停在十年格上。 */
      resetActiveView: ({ context, prop }) => {
        context.set('activeView', prop('granularity') ?? 'day')
      },

      /** 展开那一刻把聚焦日拉回当前选中值；没有选中就落作者给的起始页，再没有才落到今天。 */
      focusSelectedDay: ({ context, prop }) => {
        const first = firstValue(context.get('value'))
        context.set('focusedValue', first ?? prop('defaultFocusedValue') ?? today(prop('timeZone') ?? getLocalTimeZone()).toString())
      },
    },
    effects: {
      // 引擎订阅的返回值即 cleanup；位置结果写进 context 供 connect 读
      trackPosition: ({ refs, prop, context, flush }) => trackOverlayPosition({
        // 无引擎（纯逻辑测试 / 无布局环境 / SSR）：不定位，其余照常
        engine: refs.get('position'),
        flush,
        // 进入展开态先清上一次的坐标：引擎量完之前不算落位，皮肤据此藏着。
        // 不清的话重开会按上次的位置判「已落位」——页面滚过就在旧位置闪一帧
        clear: () => context.set('position', null),
        getAnchor: () => refs.get('getAnchorEl')(),
        getFloating: () => refs.get('getFloatingEl')(),
        options: () => ({
          placement: prop('placement') ?? DATE_RANGE_PICKER_DEFAULT_PLACEMENT,
          offset: prop('offset') ?? OVERLAY_OFFSET,
          // positioner 渲染成 fixed，坐标系必须跟着走视口系
          strategy: 'fixed',
          // start / end 是逻辑对齐，RTL 下行内轴要翻过来
          dir: prop('dir'),
          // 落定那一侧的可用空间，connect 转成内联自定义属性给皮肤限高
          size: true,
        }),
        onResult: result => context.set('position', result),
      }),

      // Layer、DismissableLayer 与 FocusScope 共用 Presence 生命周期；退场中仍占栈顶但不再响应关闭。
      trackLayer: ({ refs, context, send, flush, scope, state, track }) => {
        let reactivateFocus: (() => void) | null = null
        return trackPresenceResources({
          presence: () => refs.get('presence'),
          open: () => state.get() === 'open',
          track,
          acquire: () => trackOverlayLayer({
            // 无 DOM 环境（纯逻辑测试）：状态机照常转移，不挂副作用
            config: refs.get('config'),
            registerLayer: refs.get('registerLayer'),
            flush,
            active: () => state.get() === 'open',
            onDismiss: overlayCloseOnDismiss(send),
            focusScope: {
              // 每次读最新 ref，容器晚一拍就位也能命中
              container: () => refs.get('getContentEl')(),
              // 落点显式指定为聚焦日那一格，交给 Tab 序列探测会停在第一个可聚焦元素。
              // 每次求值都现查：content 仍带 hidden 的那一帧返回 null，焦点域会重试到 DOM 就位
              initialFocus: () => {
                // 点输入行展开:焦点本来就在某个段位上,把它原样交回去——焦点域一拿到非空落点
                // 就认账,于是既不搬走焦点,也不会退回去聚焦浮层里的头一个可聚焦元素
                if (!context.get('moveFocusIn')) {
                  const anchor = refs.get('getAnchorEl')()
                  const active = refs.get('config')?.scope.getActiveElement()
                  if (anchor && active instanceof HTMLElement && anchor.contains(active))
                    return active
                }
                // 目标还没显形（Light DOM 宿主晚一拍才把浮层摘掉 hidden、搬进落点）时回 null：
                // 回非空会被当成焦点已安排好，随后节点一搬焦点就丢了；回 null 焦点域下一帧再来
                const cell = findDateRangePickerCellEl(refs.get('getContentEl')(), context.get('focusedValue'))
                return canTakeFocus(cell, scope) ? cell : null
              },
              restoreFocus: () => context.get('returnFocus'),
              onReactivate: reactivate => reactivateFocus = reactivate,
            },
          }),
          onReopen: () => {
            const activate = reactivateFocus
            flush(() => scope.getWin().requestAnimationFrame(() => {
              if (state.get() === 'open' && reactivateFocus === activate)
                activate?.()
            }))
          },
        })
      },
    },
  },
})
