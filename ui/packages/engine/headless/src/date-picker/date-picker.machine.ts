/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 date picker 相关实现。

import type { PositionResult, Service } from '@xihan-ui/core'
import type { CalendarPickerSchema, CalendarPickerSelectionMode } from '../calendar-picker'
import type { DateFieldSchema, DateGranularity, DateSegmentSet } from '../date-field'
import type { CalendarGranularity, CalendarView } from '../shared/calendar'
import type { DatePickerSchema } from './date-picker.types'
import { getLocalTimeZone, today } from '@internationalized/date'
import { canTakeFocus, itemValue, resetDeclaredValue, resolveLocale, setup } from '@xihan-ui/core'
import { calendarPickerAnatomy } from '../calendar-picker'
import { sameArray as sameValues, toArray as toValues } from '../shared/array'
import { sortIso } from '../shared/calendar'
import { OVERLAY_OFFSET, OVERLAY_PLACEMENT_LIST } from '../shared/overlay'
import { overlayCloseOnDismiss, trackOverlayLayer, trackOverlayPosition, trackPresenceResources } from '../shared/overlay-shell'
import { datePickerDatePart, datePickerJoinDateTime, datePickerTimePart } from './date-picker.time'

const { createMachine, guards } = setup<DatePickerSchema>()
const { and } = guards

/** 未指定 placement 时的默认落位，定位引擎与 connect 共用。 */
export const DATE_PICKER_DEFAULT_PLACEMENT = OVERLAY_PLACEMENT_LIST

/** 内嵌分段输入的精度：天，值格式 YYYY-MM-DD。按天挑时走它，其余粒度改走段集。 */
export const DATE_PICKER_GRANULARITY: DateGranularity = 'day'

/**
 * 挑的粒度 → 输入行默认铺哪几块。
 *
 * 按天挑时不给段集：留空才走 granularity 那条路，年月日按 locale 排（en-US 是月日年）。
 * 周选出「年 + 周」——它挑的是整周，日号在输入行里没有意义。
 */
export function datePickerSegmentSet(
  granularity: CalendarGranularity | undefined,
): DateSegmentSet | undefined {
  if (granularity === 'week')
    return ['year', 'week']
  if (granularity === 'month')
    return ['year', 'month']
  if (granularity === 'quarter')
    return ['year', 'quarter']
  if (granularity === 'year')
    return ['year']
  return undefined
}

/** 日期格子的 CSS 选择器，取自日历解剖。 */
const CELL_TRIGGER_SELECTOR = calendarPickerAnatomy.build()['cell-trigger'].selector

/** 收口选中集合：单选长度 ≤ 1，多选去重升序。 */
function normalizeSelection(next: readonly string[], mode: CalendarPickerSelectionMode): string[] {
  return mode === 'single' ? next.slice(0, 1) : sortIso(next)
}

/** 首个选中值；没有选中时为 null。 */
function firstValue(values: readonly string[]): string | null {
  return values[0] ?? null
}

function timeZoneOf(service: Service<DatePickerSchema>): string {
  return service.prop('timeZone') ?? getLocalTimeZone()
}

/**
 * 生效聚焦日：context 未定过则退回首个选中值，再退回今天。
 *
 * 恒返回非空串：日历的 focusedValue 须始终受控，不得在受控与非受控之间切换。
 */
export function datePickerFocusedValue(service: Service<DatePickerSchema>): string {
  const fallback = firstValue(service.context.get('value'))
  return service.context.get('focusedValue')
    // showTime 下选中值带时间段，聚焦日只要日期段
    ?? (fallback != null ? datePickerDatePart(fallback) : null)
    ?? today(timeZoneOf(service)).toString()
}

/** 这台编排机此刻用的语言标记：作者给的优先，没给按宿主语言，宿主也没有时按 en-US。 */
export function datePickerLocale(service: Service<DatePickerSchema>): string {
  return resolveLocale(service.prop('locale'), service.scope)
}

/** showTime 生效（只支持单选，其余模式维持纯日期值）。 */
export function datePickerShowTime(service: Service<DatePickerSchema>): boolean {
  return !!service.prop('showTime')
    && (service.prop('selectionMode') ?? 'single') === 'single'
    && (service.prop('granularity') ?? 'day') === 'day'
}

/** showTime 的时间段精度，默认分钟。 */
export function datePickerTimeGranularity(service: Service<DatePickerSchema>): 'minute' | 'second' {
  return service.prop('timeGranularity') ?? 'minute'
}

/** 喂给内嵌日历的那份 props：值与聚焦日受控，选中与聚焦经回调送回编排机。 */
export function datePickerCalendarProps(service: Service<DatePickerSchema>): CalendarPickerSchema['props'] {
  const { prop, context, send } = service
  const withTime = datePickerShowTime(service)
  return {
    // showTime 下值带时间段，日历只认日期段
    value: withTime ? context.get('value').map(datePickerDatePart) : context.get('value'),
    focusedValue: datePickerFocusedValue(service),
    selectionMode: prop('selectionMode'),
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
    disabled: prop('disabled'),
    readOnly: prop('readOnly'),
    // 日历那几句读屏文案从同一份文案桶里取
    translations: prop('translations'),
    onValueChange: ({ value }) => {
      if (!withTime) {
        send({ type: 'VALUE.SET', value, src: 'calendar' })
        return
      }
      // 选日保时：新挑的日子接上原来的时间段，还没有时间就落零点
      const time = datePickerTimePart(firstValue(context.get('value')) ?? '')
      const granularity = datePickerTimeGranularity(service)
      send({
        type: 'VALUE.SET',
        value: value.map(v => datePickerJoinDateTime(v, time, granularity)),
        src: 'calendar',
      })
    },
    onFocusedValueChange: ({ focusedValue }) => send({ type: 'FOCUSED.SET', value: focusedValue }),
  }
}

/** 喂给分段输入的那份 props：承载唯一的选中值，段位上的输入经 VALUE.SET 回到编排机。 */
export function datePickerFieldProps(service: Service<DatePickerSchema>): DateFieldSchema['props'] {
  const { prop, context, send } = service
  const withTime = datePickerShowTime(service)
  return {
    // showTime 下由同一台分段输入承载完整日期时间；日历仍只读取日期段。
    value: firstValue(context.get('value')),
    granularity: withTime ? datePickerTimeGranularity(service) : DATE_PICKER_GRANULARITY,
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
    name: prop('name'),
    onValueChange: ({ value }) => {
      // 段位只改首个选中值：多选下其余的原样留着
      const current = context.get('value')
      const next = value == null ? current.slice(1) : [value, ...current.slice(1)]
      send({ type: 'VALUE.SET', value: next, src: 'field' })
    },
  }
}

/**
 * 在浮层里按 ISO 串找到那一天的格子。
 *
 * 不能改用 queryItems：容器是本组件的 content、格子属于 calendar scope，归属过滤会把格子全滤掉。
 */
export function findDatePickerCellEl(container: HTMLElement | null, value: string | null): HTMLElement | null {
  if (!container || value == null)
    return null
  const cells = [...container.querySelectorAll<HTMLElement>(CELL_TRIGGER_SELECTOR)]
  return cells.find(el => itemValue(el) === value) ?? null
}

// 这台机器只管开合、值同步与焦点去处；日期数学由日历算好后以 ISO 串送进来。
// 值的受控收口在 cell（给定 prop 即受控）；开合编进 FSM 状态，受控时走守卫对 + CONTROLLED.* 影子事件 + watch。
export const datePickerMachine = createMachine({
  name: 'date-picker',
  context: ({ prop, cell }) => ({
    // 位置结果由 trackPosition 里的引擎回填；connect 只读这里，不碰 DOM
    position: cell<PositionResult | null>(() => ({ defaultValue: null })),
    value: cell<string[]>(() => ({
      value: toValues(prop('value')),
      defaultValue: toValues(prop('defaultValue')) ?? [],
      isEqual: sameValues,
      onChange: value => prop('onValueChange')?.({ value }),
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
  watch: ({ track, prop, action }) => {
    track([() => prop('open')], () => action(['syncOpen']))
  },
  // 两个状态都要认；展开态另行声明的 VALUE.SET 会盖过这里这一条
  on: {
    'FORM.RESET': { actions: ['resetToDefault'] },
    'VALUE.SET': { actions: ['setValue', 'syncFocusedValue'] },
    'VALUE.CLEAR': { actions: ['clearValue'] },
    'FOCUSED.SET': { actions: ['setFocusedValue'] },
    'VIEW.SET': { actions: ['setActiveView'] },
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

      /**
       * 这一次写值该不该收起浮层：只认日历与快捷选项两路，多选不收起。
       * showTime 下选完日子还要挑时间，收口交给确认按钮。
       */
      closesOnSelect: ({ prop, event }) => {
        const e = event.current()
        if (e.type !== 'VALUE.SET' || (e.src !== 'calendar' && e.src !== 'preset'))
          return false
        if (prop('showTime') && (prop('selectionMode') ?? 'single') === 'single')
          return false
        if ((prop('closeOnSelect') ?? true) === false)
          return false
        if ((prop('selectionMode') ?? 'single') === 'multiple')
          return false
        return e.value.length >= 1
      },
    },
    actions: {
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

      setValue: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'VALUE.SET')
          return
        context.set('value', normalizeSelection(e.value, prop('selectionMode') ?? 'single'))
      },

      clearValue: ({ context }) => context.set('value', []),

      setFocusedValue: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'FOCUSED.SET')
          context.set('focusedValue', e.value)
      },

      /**
       * 值变了，日历跟着翻到首个选中值所在的月。
       *
       * 不认日历那一路：日历点选时已先发过 FOCUSED.SET，这里再改一遍是多余的。
       */
      syncFocusedValue: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'VALUE.SET' || e.src === 'calendar')
          return
        const next = firstValue(context.get('value'))
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
          placement: prop('placement') ?? DATE_PICKER_DEFAULT_PLACEMENT,
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
                const cell = findDatePickerCellEl(refs.get('getContentEl')(), context.get('focusedValue'))
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
