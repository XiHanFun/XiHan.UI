/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 time range picker 相关实现。

import type { Params, PositionResult } from '@xihan-ui/core'
import type { TimeDraft, TimeGranularity, TimeHourCycle } from '../time-field'
import type { TimePickerColumn, TimePickerFocusIntent } from '../time-picker'
import type { TimeRangePickerColumnRef, TimeRangePickerEndIndex, TimeRangePickerPressedKey, TimeRangePickerSchema, TimeRangePickerSegmentRef } from './time-range-picker.types'
import { canTakeFocus, resetDeclaredValue, setup } from '@xihan-ui/core'
import { OVERLAY_OFFSET, OVERLAY_PLACEMENT_LIST } from '../shared/overlay'
import { trackOverlayLayer, trackPresenceResources } from '../shared/overlay-shell'
import {
  appendSegmentDigit,
  clearTimeSegment,
  cycleTimeSegment,
  draftFromTime,
  emptyTimeDraft,
  formatTimeValue,
  parseTimeValue,
  resolveHourCycle,
  resolveTimeDraft,
  sameTimeDraft,
  segmentNumber,
  segmentRange,
  setTimeDayPeriod,
  setTimeSegment,
  TIME_FIELD_GRANULARITY,
} from '../time-field'
import { timePickerColumnsFor, timePickerItemValue } from '../time-picker'
import { findTimeRangePickerColumn, findTimeRangePickerItem } from './time-range-picker.anatomy'

const { createMachine, guards } = setup<TimeRangePickerSchema>()
const { and } = guards

/** 未指定 placement 时的落位；定位引擎与 connect 共用这一个缺省。 */
export const TIME_RANGE_PICKER_DEFAULT_PLACEMENT = OVERLAY_PLACEMENT_LIST

/** 两端的下标，起点在前。 */
export const TIME_RANGE_PICKER_ENDS: readonly TimeRangePickerEndIndex[] = [0, 1]

/** 起止两端只允许两组；除精确的 1 外都归起点组。 */
export function resolveTimeRangePickerEndIndex(input: number | string | undefined): TimeRangePickerEndIndex {
  return Number(input) === 1 ? 1 : 0
}

/** 取区间某一端；空串占位视同没有值。 */
export function timeRangePickerEndAt(value: readonly string[], index: TimeRangePickerEndIndex): string {
  return value[index] ?? ''
}

/**
 * 按位写入区间的一端：另一端原样留着，空缺处填空串占位，位置不因缺值而错位。
 * 两端都空即空集合。
 */
function writeEndAt(current: readonly string[], index: TimeRangePickerEndIndex, next: string): string[] {
  const out: [string, string] = [current[0] ?? '', current[1] ?? '']
  out[index] = next
  return out[0] === '' && out[1] === '' ? [] : out
}

/**
 * 对外的值：裁掉尾部的空位，前面的空缺原样留着。
 * 只填了终点时是 ['', 终点]——受控回写读的是同一份下标，抹掉这个空位会让终点落回起点那一格。
 */
export function trimTimeRangeHoles(value: readonly string[]): string[] {
  const out = [...value]
  while (out.length > 0 && out[out.length - 1] === '')
    out.pop()
  return out
}

// 数组按位比：受控时每次读都归一成新数组，用默认的 Object.is 会把每次读写都判成变更。
// 空串是占位，与该位缺席算同一件事
function sameValues(a: readonly string[], b: readonly string[] | undefined): boolean {
  if (!b)
    return false
  const len = Math.max(a.length, b.length)
  for (let i = 0; i < len; i += 1) {
    if ((a[i] ?? '') !== (b[i] ?? ''))
      return false
  }
  return true
}

function sameDrafts(a: readonly [TimeDraft, TimeDraft], b: readonly [TimeDraft, TimeDraft] | undefined): boolean {
  return !!b && sameTimeDraft(a[0], b[0]) && sameTimeDraft(a[1], b[1])
}

/** 两端的初始缓冲：各自按自己那一端的值解析。 */
function draftsFrom(value: readonly string[] | undefined): [TimeDraft, TimeDraft] {
  return [
    draftFromTime(parseTimeValue(value?.[0])),
    draftFromTime(parseTimeValue(value?.[1])),
  ]
}

function currentGranularity(params: Params<TimeRangePickerSchema>): TimeGranularity {
  return params.prop('granularity') ?? TIME_FIELD_GRANULARITY
}

function currentHourCycle(params: Params<TimeRangePickerSchema>): TimeHourCycle {
  return resolveHourCycle(params.prop('hourCycle'), params.prop('locale'))
}

/** 此刻该编辑哪一端的哪一份逐段值；与 connect 显示用的是同一条规则。 */
function currentDraft(params: Params<TimeRangePickerSchema>, index: TimeRangePickerEndIndex): TimeDraft {
  return resolveTimeDraft(timeRangePickerEndAt(params.context.get('value'), index), params.context.get('drafts')[index])
}

/**
 * 一端的列该按哪一对界裁：终点那组还以起点为下界，起点那组还以终点为上界——
 * 另一端还没填全时不收窄。两端各自照 min/max 裁完再叠这一层。
 */
export function timeRangePickerBoundsAt(
  value: readonly string[],
  index: TimeRangePickerEndIndex,
  min: string | undefined,
  max: string | undefined,
): { min: string | undefined, max: string | undefined } {
  const other = timeRangePickerEndAt(value, index === 0 ? 1 : 0)
  if (other === '')
    return { min, max }
  if (index === 1)
    return { min: min == null || min < other ? other : min, max }
  return { min, max: max == null || max > other ? other : max }
}

/** 一端此刻的列表：纯函数按当前值算，connect 与机器读到的是同一份。 */
export function timeRangePickerColumnsAt(
  params: Pick<Params<TimeRangePickerSchema>, 'prop' | 'context'>,
  index: TimeRangePickerEndIndex,
): TimePickerColumn[] {
  const value = params.context.get('value')
  const bounds = timeRangePickerBoundsAt(value, index, params.prop('min'), params.prop('max'))
  return timePickerColumnsFor(
    resolveTimeDraft(timeRangePickerEndAt(value, index), params.context.get('drafts')[index]),
    {
      granularity: params.prop('granularity') ?? TIME_FIELD_GRANULARITY,
      hourCycle: resolveHourCycle(params.prop('hourCycle'), params.prop('locale')),
      step: params.prop('step'),
      min: bounds.min,
      max: bounds.max,
    },
  )
}

/**
 * 一端值的唯一写入口：先落缓冲、再落值，分段输入与浮层选中都经这里。
 * 顺序不能反：落值会触发 syncDrafts 拿缓冲与值对账，缓冲没更新的话这一段会被拨回去。
 */
function commitDraft(params: Params<TimeRangePickerSchema>, index: TimeRangePickerEndIndex, next: TimeDraft): void {
  const drafts: [TimeDraft, TimeDraft] = [...params.context.get('drafts')] as [TimeDraft, TimeDraft]
  drafts[index] = next
  params.context.set('drafts', drafts)
  params.context.set('value', writeEndAt(params.context.get('value'), index, formatTimeValue(next, currentGranularity(params))))
}

/** 整份写入两端：两端各走一遍解析再回填，写坏的那一端等同于清空。 */
function commitBoth(params: Params<TimeRangePickerSchema>, next: readonly string[]): void {
  const drafts = draftsFrom(next)
  params.context.set('drafts', drafts)
  const granularity = currentGranularity(params)
  params.context.set('value', writeEndAt(
    writeEndAt([], 0, formatTimeValue(drafts[0], granularity)),
    1,
    formatTimeValue(drafts[1], granularity),
  ))
}

/**
 * 值住在 context 的 cell 里，受控/非受控在 cell 收口；
 * 开合编进 FSM 状态，走守卫对加 CONTROLLED.* 影子事件加 watch 那一套。
 * 分段输入的每一条语义都直接调 time-field 导出的纯函数，两端各持一份缓冲，不在这里另写一份。
 */
export const timeRangePickerMachine = createMachine({
  name: 'time-range-picker',
  context: ({ prop, cell }) => ({
    position: cell<PositionResult | null>(() => ({ defaultValue: null })),
    value: cell<string[]>(() => ({
      value: prop('value'),
      defaultValue: prop('defaultValue') ?? [],
      isEqual: sameValues,
      onChange: value => prop('onValueChange')?.({ value: trimTimeRangeHoles(value) }),
    })),
    drafts: cell<readonly [TimeDraft, TimeDraft]>(() => ({
      defaultValue: draftsFrom(prop('value') ?? prop('defaultValue')),
      // 逐段比内容而不是比引用：每次写入都产出新对象，不比内容会重复通知宿主
      isEqual: sameDrafts,
    })),
    // 段与选项的焦点锚点：都不受控、不对外通知，服务 roving tabindex 与 data-focus 标记
    focusedSegment: cell<TimeRangePickerSegmentRef | null>(() => ({ defaultValue: null })),
    typeBuffer: cell<string>(() => ({ defaultValue: '' })),
    focusedColumn: cell<TimeRangePickerColumnRef | null>(() => ({ defaultValue: null })),
    focusedItem: cell<string | null>(() => ({ defaultValue: null })),
    focusIntent: cell<TimePickerFocusIntent>(() => ({ defaultValue: 'selected' })),
    returnFocus: cell<boolean>(() => ({ defaultValue: true })),
    // 缺省搬：触发钮、键盘与命令式入口都要把焦点送进浮层
    moveFocusIn: cell<boolean>(() => ({ defaultValue: true })),
    // 按压通道：被 Space / Enter 或触屏按住的那一个部件（清空钮 / 触发钮 / 快捷选项 / 时间格），按 key 记
    pressed: cell<TimeRangePickerPressedKey | null>(() => ({ defaultValue: null })),
  }),
  refs: () => ({
    config: null,
    registerLayer: null,
    presence: null,
    position: null,
    getAnchorEl: () => null,
    getTriggerEl: () => null,
    getFloatingEl: () => null,
    getContentEl: () => null,
  }),
  initialState: ({ prop }) => ((prop('open') ?? prop('defaultOpen')) ? 'open' : 'closed'),
  // Layer、消解与焦点资源由顶层 effect 持有，逻辑关闭后等 Presence 真实退场再释放。
  effects: ['trackLayer'],
  watch: ({ track, prop, context, action }) => {
    // 开合受控时用户事件只发意图、不自改状态；宿主写回 open 后由这里派发影子事件无条件回写
    track([() => prop('open')], () => action(['syncOpen']))
    // 只兜宿主侧的写入，内部提交当场已把缓冲一起更新
    track([context.dep('value')], () => action(['syncDrafts']))
    // 按住途中转入禁用 / 只读或值被清空：触发钮随即 disabled、清空钮藏起，不会再来 keyup，按压面由机器自己收
    track([() => prop('disabled'), () => prop('readOnly'), context.dep('value'), context.dep('drafts')], () => action(['releaseWhenInert']))
  },
  // 分段输入与值这几件事与开合无关，两个状态里都得认
  on: {
    'FORM.RESET': { actions: ['resetToDefault'] },
    'VALUE.SET': { actions: ['setValue'] },
    'VALUE.CLEAR': { guard: 'canEdit', actions: ['clearValue'] },
    'SEGMENT.STEP': { guard: 'canEdit', actions: ['stepSegment'] },
    'SEGMENT.DIGIT': { guard: 'canEdit', actions: ['typeDigit'] },
    'SEGMENT.CLEAR': { guard: 'canEdit', actions: ['clearSegment'] },
    'SEGMENT.PERIOD': { guard: 'canEdit', actions: ['setPeriod'] },
    'SEGMENT.FOCUS': { actions: ['setFocusedSegment'] },
    'SEGMENT.BLUR': { actions: ['clearFocusedSegment'] },
    // 按压通道：触发钮与清空钮在收起态按、快捷选项与时间格在展开态按，两个状态都认
    'PRESS.START': { guard: 'canPress', actions: ['startPress'] },
    'PRESS.END': { actions: ['endPress'] },
  },
  states: {
    closed: {
      on: {
        // 受控命中 → 只发意图；非受控 → 落 target 并一并通知。
        // 落点意图先记进 context：受控那一拍走 CONTROLLED.OPEN，读不到原按键事件
        'OPEN': [
          { guard: 'isOpenControlled', actions: ['setFocusIntent', 'setMoveFocusIn', 'setReturnFocus', 'invokeOnOpen'] },
          { target: 'open', actions: ['setFocusIntent', 'setMoveFocusIn', 'setReturnFocus', 'invokeOnOpen'] },
        ],
        'TOGGLE': [
          { guard: 'isOpenControlled', actions: ['setFocusIntent', 'setMoveFocusIn', 'setReturnFocus', 'invokeOnOpen'] },
          { target: 'open', actions: ['setFocusIntent', 'setMoveFocusIn', 'setReturnFocus', 'invokeOnOpen'] },
        ],
        'CONTROLLED.OPEN': { target: 'open' },
      },
    },
    open: {
      // 锚点在进入展开态时就位：列是按当前值算出来的，不必等 DOM
      entry: ['setInitialFocusedItem'],
      // 按住快捷选项途中收起（Enter 在 keydown 即写值收起）或按住格子时 Escape：浮层里的部件不会再来 keyup
      exit: ['clearFocusedItem', 'releasePress'],
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
        'OPTION.FOCUS': { actions: ['setFocusedItem'] },
        // 选中不收起：时分秒是分列挑的，挑完一列还得接着挑下一列，挑完起点还得挑终点
        'ITEM.SELECT': { guard: 'canEdit', actions: ['selectItem'] },
        // 快捷选项给的是两端整份时间，写完就该收；命令式 setValue（无 src）照旧不收。
        // 受控的是 open 不是值，两条分支都照落值
        'VALUE.SET': [
          {
            guard: and('closesOnPreset', 'isOpenControlled'),
            actions: ['setValue', 'setReturnFocus', 'invokeOnClose'],
          },
          {
            guard: 'closesOnPreset',
            target: 'closed',
            actions: ['setValue', 'setReturnFocus', 'invokeOnClose'],
          },
          { actions: ['setValue'] },
        ],
        'CONTROLLED.CLOSE': { target: 'closed' },
      },
    },
  },
  implementations: {
    guards: {
      isOpenControlled: ({ prop }) => prop('open') !== undefined,
      // 只读仍可展开、可在列里走，只是改不动值
      canEdit: ({ prop }) => !prop('disabled') && !prop('readOnly'),
      /** 这一次写值来自快捷选项：两端整份都定了，浮层该收起。 */
      closesOnPreset: ({ event }) => {
        const e = event.current()
        return e.type === 'VALUE.SET' && e.src === 'preset'
      },
      /**
       * 按压守卫：整体禁用一律不进；触发钮只读仍可展开查看，照有回执；其余（清空钮、快捷选项、时间格）
       * 与它们各自的写值同一道门——只读改不动值，逐条禁用（越界、作者禁用、清不了）的事实由 connect 随事件带来。
       */
      canPress: ({ prop, event }) => {
        const e = event.current()
        if (e.type !== 'PRESS.START' || e.disabled || prop('disabled'))
          return false
        return e.key === 'trigger' || !prop('readOnly')
      },
    },
    actions: {
      resetToDefault: (params) => {
        resetDeclaredValue(params, 'value', 'value', 'defaultValue')
        params.context.reset('drafts')
        params.context.reset('typeBuffer')
      },

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
      /**
       * 转入禁用一律松开；只读松开触发钮以外的；清空钮在没东西可清时藏起，随之松开。
       * 判据与 connect 里清空钮的显隐同一口径：两端的值与两份段缓冲都空才算清干净。
       */
      releaseWhenInert: ({ context, prop }) => {
        const pressed = context.get('pressed')
        if (pressed == null)
          return
        if (prop('disabled') || (prop('readOnly') && pressed !== 'trigger')) {
          context.set('pressed', null)
          return
        }
        const value = context.get('value')
        const dirty = timeRangePickerEndAt(value, 0) !== '' || timeRangePickerEndAt(value, 1) !== ''
          || context.get('drafts').some(draft => draft.hour != null || draft.minute != null || draft.second != null || draft.dayPeriod != null)
        if (pressed === 'clear' && !dirty)
          context.set('pressed', null)
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

      /** Tab 与层外交互关闭时把焦点让出，其余出口一律归还触发器。 */
      setReturnFocus: ({ context, event }) => {
        const e = event.current()
        const handedOff = e.type === 'CLOSE' && (e.src === 'tab' || e.src === 'interact-outside')
        context.set('returnFocus', !handedOff)
      },

      /** 点输入行展开的那一路不搬焦点，其余（触发钮、键盘、命令式）照搬。 */
      setMoveFocusIn: ({ context, event }) => {
        const e = event.current()
        const src = e.type === 'OPEN' || e.type === 'TOGGLE' ? e.src : undefined
        context.set('moveFocusIn', src !== 'control')
      },

      setFocusIntent: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'OPEN' || e.type === 'TOGGLE')
          context.set('focusIntent', e.focus ?? 'selected')
      },

      /**
       * 展开那一刻焦点落在起点那组的时列：这一段已填的值仍在列里就停在它上面，否则退回意图那一端。
       * 焦点正停在终点那组段位上时改落终点那组，人在编辑哪一端就从哪一端接着挑。
       * 列由纯函数按当前值算出，这里不必查 DOM。
       */
      setInitialFocusedItem: (params) => {
        const index: TimeRangePickerEndIndex = params.context.get('focusedSegment')?.index ?? 0
        const first = timeRangePickerColumnsAt(params, index)[0]
        if (!first)
          return
        const current = segmentNumber(currentDraft(params, index), first.unit, currentHourCycle(params))
        const selected = current == null ? null : timePickerItemValue(current)
        // 从输入段展开时保留段上的编辑焦点；从触发器展开则把空值落到第一项，
        // 避免焦点停在整列容器上，也让方向键与 Enter 立即有明确起点。
        const intent = params.context.get('focusIntent')
        if (!params.context.get('moveFocusIn') && intent === 'selected' && selected == null)
          return
        const edge = intent === 'last' ? first.options.at(-1) : first.options[0]
        params.context.set('focusedColumn', { index, unit: first.unit })
        params.context.set(
          'focusedItem',
          selected != null && first.options.includes(selected) ? selected : (edge ?? null),
        )
      },

      setFocusedItem: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'OPTION.FOCUS')
          return
        context.set('focusedColumn', { index: e.index, unit: e.unit })
        context.set('focusedItem', e.value)
      },

      clearFocusedItem: ({ context }) => {
        context.set('focusedColumn', null)
        context.set('focusedItem', null)
      },

      /**
       * 浮层里选中一格：只改那一端对应的那一段，其余段原样留着。
       * 走的是与分段输入同一个 setTimeSegment，12 小时制下按当前上午/下午换算回 0-23。
       */
      selectItem: (params) => {
        const e = params.event.current()
        if (e.type !== 'ITEM.SELECT')
          return
        params.context.set('typeBuffer', '')
        params.context.set('focusedColumn', { index: e.index, unit: e.unit })
        params.context.set('focusedItem', e.value)
        commitDraft(
          params,
          e.index,
          setTimeSegment(currentDraft(params, e.index), e.unit, Number(e.value), currentHourCycle(params)),
        )
      },

      setValue: (params) => {
        const e = params.event.current()
        if (e.type !== 'VALUE.SET')
          return
        commitBoth(params, e.value)
      },

      clearValue: (params) => {
        params.context.set('drafts', [emptyTimeDraft(), emptyTimeDraft()])
        params.context.set('value', [])
        params.context.set('typeBuffer', '')
      },

      stepSegment: (params) => {
        const e = params.event.current()
        if (e.type !== 'SEGMENT.STEP')
          return
        // 加减是另一种输入方式，之前敲了一半的数字作废
        params.context.set('typeBuffer', '')
        commitDraft(params, e.index, cycleTimeSegment(currentDraft(params, e.index), e.segment, e.delta, currentHourCycle(params)))
      },

      typeDigit: (params) => {
        const e = params.event.current()
        if (e.type !== 'SEGMENT.DIGIT')
          return
        const hourCycle = currentHourCycle(params)
        const result = appendSegmentDigit(
          params.context.get('typeBuffer'),
          e.digit,
          segmentRange(e.segment, hourCycle),
        )
        params.context.set('typeBuffer', result.buffer)
        // 还凑不成合法值时只记着，不往段上落
        if (result.value == null)
          return
        commitDraft(params, e.index, setTimeSegment(currentDraft(params, e.index), e.segment, result.value, hourCycle))
      },

      clearSegment: (params) => {
        const e = params.event.current()
        if (e.type !== 'SEGMENT.CLEAR')
          return
        params.context.set('typeBuffer', '')
        commitDraft(params, e.index, clearTimeSegment(currentDraft(params, e.index), e.segment))
      },

      setPeriod: (params) => {
        const e = params.event.current()
        if (e.type !== 'SEGMENT.PERIOD')
          return
        params.context.set('typeBuffer', '')
        commitDraft(params, e.index, setTimeDayPeriod(currentDraft(params, e.index), e.period))
      },

      setFocusedSegment: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'SEGMENT.FOCUS')
          return
        // 换段（含换端）就重开一轮数字输入
        const prev = context.get('focusedSegment')
        if (prev?.index !== e.index || prev.segment !== e.segment)
          context.set('typeBuffer', '')
        context.set('focusedSegment', { index: e.index, segment: e.segment })
      },

      clearFocusedSegment: ({ context }) => {
        context.set('focusedSegment', null)
        context.set('typeBuffer', '')
      },

      /**
       * 把两端的缓冲拨回权威值。
       * 某一端缓冲算出来的串与当前值一致时不动它，否则会把填了一半的段当成外部清空抹掉。
       */
      syncDrafts: (params) => {
        const value = params.context.get('value')
        const granularity = currentGranularity(params)
        const drafts = params.context.get('drafts')
        const next: [TimeDraft, TimeDraft] = [drafts[0], drafts[1]]
        let changed = false
        for (const index of TIME_RANGE_PICKER_ENDS) {
          const end = timeRangePickerEndAt(value, index)
          if (formatTimeValue(drafts[index], granularity) === end)
            continue
          next[index] = draftFromTime(parseTimeValue(end))
          changed = true
        }
        if (changed)
          params.context.set('drafts', next)
      },
    },
    effects: {
      // 定位全程在 effect 里：引擎订阅的返回值即 cleanup，位置结果写进 context 供 connect 读
      trackPosition: ({ refs, prop, context, flush }) => {
        // 进入展开态先清上一次的坐标：引擎量完之前不算落位，皮肤据此藏着。
        // 不清的话重开会按上次的位置判「已落位」——页面滚过就在旧位置闪一帧
        context.set('position', null)
        const engine = refs.get('position')
        // 无引擎（纯逻辑测试 / 无布局环境 / SSR）：不定位，其余照常
        if (!engine)
          return undefined

        let stop: (() => void) | undefined
        let disposed = false

        // 必须等 DOM 落定再挂：进入展开态这一刻 content 还带 hidden、高度为 0，算出的坐标会错位
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
              placement: prop('placement') ?? TIME_RANGE_PICKER_DEFAULT_PLACEMENT,
              offset: prop('offset') ?? OVERLAY_OFFSET,
              // positioner 渲染成 fixed，坐标系必须跟着走视口系
              strategy: 'fixed',
              // 落定那一侧的可用空间，connect 转成内联自定义属性给皮肤夹住行内轴：
              // 两组时列并排，秒与上下午都开时八列合计会越过最窄视口
              size: true,
              // start / end 是逻辑对齐，RTL 下行内轴要翻过来
              dir: prop('dir'),
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
      trackLayer: (params) => {
        const { refs, context, send, flush, scope, state, track } = params
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
            onDismiss: reason =>
              send({ type: 'CLOSE', src: reason === 'escape-key' ? 'esc' : 'interact-outside' }),
            focusScope: {
              // 每次读最新 ref，容器晚一拍就位也能命中
              container: () => refs.get('getContentEl')(),
              // 显式指定落焦点，两种落点都不交给 Tab 序列探测：探测按文档序取 content 的可 tab 后代，
              // 作者放在列前面的输入框会把焦点抢走，而键盘处理器挂在 content 上，方向键就此失灵。
              initialFocus: () => {
                const content = refs.get('getContentEl')()
                if (!content)
                  return null
                // 点输入行展开：焦点本来就在某个段位上，把它原样交回去——
                // 焦点域一拿到非空落点就认账，既不搬走焦点，也不会退回去聚焦浮层里头一个可聚焦元素
                if (!context.get('moveFocusIn')) {
                  const anchor = refs.get('getAnchorEl')()
                  const active = refs.get('config')?.scope.getActiveElement()
                  if (anchor && active instanceof HTMLElement && anchor.contains(active))
                    return active
                }
                // 目标还没显形（Light DOM 宿主晚一拍才把浮层摘掉 hidden、搬进落点）时回 null：
                // 回非空会被当成焦点已安排好，随后节点一搬焦点就丢了；回 null 焦点域下一帧再来
                const column = context.get('focusedColumn')
                const value = context.get('focusedItem')
                if (column != null && value != null) {
                  const el = findTimeRangePickerItem(content, column.index, column.unit, value)
                  return canTakeFocus(el, scope) ? el : null
                }
                // 判据与 setInitialFocusedItem 同一条：只有「指针入口且那一端首列那一段还空着」才真的没有锚点。
                // 其余情形是本轮该有锚点却还没挑出来，返回 null 让焦点域重试。
                const index: TimeRangePickerEndIndex = context.get('focusedSegment')?.index ?? 0
                const first = timeRangePickerColumnsAt(params, index)[0]
                const empty = !first || segmentNumber(currentDraft(params, index), first.unit, currentHourCycle(params)) == null
                if (!first || !empty || context.get('focusIntent') !== 'selected')
                  return null
                const columnEl = findTimeRangePickerColumn(content, index, first.unit)
                return canTakeFocus(columnEl, scope) ? columnEl : null
              },
              restoreFocus: () => context.get('returnFocus'),
              // 归还落点显式给触发器，避免 Safari 指针激活时退回 body。
              restoreTarget: () => refs.get('getTriggerEl')(),
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
