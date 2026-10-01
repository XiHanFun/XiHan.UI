/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 time picker 相关实现。

import type { Params, PositionResult } from '@xihan-ui/core'
import type { ColumnScrollTarget } from '../shared/column-scroll'
import type { TimeColumn } from '../shared/time-constraint'
import type { TimeDraft, TimeGranularity, TimeHourCycle, TimeSegmentType } from '../time-field'
import type {
  TimePickerColumnUnit,
  TimePickerFocusIntent,
  TimePickerPressedKey,
  TimePickerSchema,
} from './time-picker.types'
import { canTakeFocus, queryItems, resetDeclaredValue, setup } from '@xihan-ui/core'
import { sameArray } from '../shared/array'
import { alignColumnsOnOpen, followColumnSelection } from '../shared/column-scroll'
import { clearOpenedAtMount, openAtMount, openedAtMountCell } from '../shared/first-frame'
import { OVERLAY_OFFSET, OVERLAY_PLACEMENT_LIST } from '../shared/overlay'
import { trackOverlayLayer, trackPresenceResources } from '../shared/overlay-shell'
import { trackSelectionTagMotion } from '../shared/selection-tags'
import { timeColumnsFor, timeItemValue } from '../shared/time-constraint'
import {
  appendSegmentDigit,
  clearTimeSegment,
  cycleTimeSegment,
  draftFromTime,
  emptyTimeDraft,
  formatTimeValue,
  isTimeOutOfRange,
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
import { findTimePickerColumn, findTimePickerItem, TIME_PICKER_TAG_LIST_SELECTOR, timePickerColumnQuery } from './time-picker.anatomy'

const { createMachine, guards } = setup<TimePickerSchema>()
const { and } = guards

/** 未指定 placement 时的落位；定位引擎与 connect 共用这一个缺省。 */
export const TIME_PICKER_DEFAULT_PLACEMENT = OVERLAY_PLACEMENT_LIST

function isMultiple(params: Pick<Params<TimePickerSchema>, 'prop'>): boolean {
  return params.prop('selectionMode') === 'multiple'
}

/** 单选时的当前值：值至多一项，还没填全时为空串。 */
function singleValue(params: Params<TimePickerSchema>): string {
  return params.context.get('value')[0] ?? ''
}

/**
 * 宿主给的值归一成数组：裸串是单选的写法，空串即没有值；数组里的空串丢掉。
 * 不归一的 undefined 原样留着，那是「非受控」的唯一表达。
 */
export function toTimePickerValues(input: string | readonly string[] | undefined): string[] | undefined {
  if (input === undefined)
    return undefined
  if (typeof input === 'string')
    return input === '' ? [] : [input]
  return input.filter(value => value !== '')
}

/** 多选的值：每一项按精度归一（'9:00' → '09:00'、多出的秒截掉），解析不了的丢掉，去重并按时刻升序。 */
function normalizeTimes(values: readonly string[], granularity: TimeGranularity): string[] {
  const out = new Set<string>()
  for (const value of values) {
    const text = formatTimeValue(draftFromTime(parseTimeValue(value)), granularity)
    if (text !== '')
      out.add(text)
  }
  return [...out].sort()
}

/** maxSelected 的生效值：非整数向下取整，小于 1 或不是有限数时不设上限。 */
export function resolveTimePickerMaxSelected(max: number | undefined): number | null {
  if (max == null || !Number.isFinite(max))
    return null
  const floor = Math.floor(max)
  return floor >= 1 ? floor : null
}

/** 此刻该编辑哪一份逐段值；与 connect 显示用的是同一条规则。多选时就是浮层里拼着的草稿。 */
function currentDraft(params: Params<TimePickerSchema>): TimeDraft {
  return isMultiple(params)
    ? params.context.get('draft')
    : resolveTimeDraft(singleValue(params), params.context.get('draft'))
}

function currentHourCycle(params: Params<TimePickerSchema>): TimeHourCycle {
  return resolveHourCycle(params.prop('hourCycle'), params.prop('locale'))
}

function currentGranularity(params: Params<TimePickerSchema>): TimeGranularity {
  return params.prop('granularity') ?? TIME_FIELD_GRANULARITY
}

function currentColumns(params: Params<TimePickerSchema>): TimeColumn[] {
  return timeColumnsFor(currentDraft(params), {
    granularity: currentGranularity(params),
    hourCycle: currentHourCycle(params),
    timeStep: params.prop('timeStep'),
    min: params.prop('min'),
    max: params.prop('max'),
  })
}

/**
 * 值的唯一写入口：先落缓冲、再落值，分段输入与浮层选中都经这里。
 * 顺序不能反：落值会触发 syncDraft 拿缓冲与值对账，缓冲没更新的话这一段会被拨回去。
 */
function commitDraft(params: Params<TimePickerSchema>, next: TimeDraft): void {
  params.context.set('draft', next)
  // 多选时草稿只是浮层里拼着的那一个，按「添加」才收进值
  if (isMultiple(params))
    return
  const text = formatTimeValue(next, currentGranularity(params))
  params.context.set('value', text === '' ? [] : [text])
}

/**
 * 值住在 context 的 cell 里，受控/非受控在 cell 收口；
 * 开合编进 FSM 状态，走守卫对加 CONTROLLED.* 影子事件加 watch 那一套。
 * 分段输入的每一条语义都直接调 time-field 导出的纯函数，不在这里另写一份。
 */
/** 时间列的滚动定位：打开时各列停到选中的那一格，选中换格时那一列平滑滚过去。 */
function columnScrollTarget(params: Params<TimePickerSchema>): ColumnScrollTarget {
  return {
    scope: params.scope,
    flush: params.flush,
    content: () => params.refs.get('getContentEl')(),
    columns: content => queryItems(content, timePickerColumnQuery),
  }
}

export const timePickerMachine = createMachine({
  name: 'time-picker',
  context: ({ prop, cell }) => ({
    // 首帧标记：挂载时开着、还没收起过
    openedAtMount: openedAtMountCell(cell, openAtMount(prop)),
    position: cell<PositionResult | null>(() => ({ defaultValue: null })),
    value: cell<string[]>(() => ({
      value: toTimePickerValues(prop('value')),
      defaultValue: toTimePickerValues(prop('defaultValue')) ?? [],
      // 数组每次都是新对象，比内容才不会把没变当成变了
      isEqual: sameArray,
      onChange: value => prop('onValueChange')?.({ value }),
    })),
    draft: cell<TimeDraft>(() => ({
      // 单选时缓冲从值起步；多选的草稿与值无关，从空起步
      defaultValue: prop('selectionMode') === 'multiple'
        ? emptyTimeDraft()
        : draftFromTime(parseTimeValue((toTimePickerValues(prop('value')) ?? toTimePickerValues(prop('defaultValue')) ?? [])[0])),
      // 逐段比内容而不是比引用：每次写入都产出新对象，不比内容会重复通知宿主
      isEqual: sameTimeDraft,
    })),
    // 段与选项的焦点锚点：都不受控、不对外通知，服务 roving tabindex 与 data-focus 标记
    focusedSegment: cell<TimeSegmentType | null>(() => ({ defaultValue: null })),
    typeBuffer: cell<string>(() => ({ defaultValue: '' })),
    focusedColumn: cell<TimePickerColumnUnit | null>(() => ({ defaultValue: null })),
    focusedItem: cell<string | null>(() => ({ defaultValue: null })),
    focusIntent: cell<TimePickerFocusIntent>(() => ({ defaultValue: 'selected' })),
    returnFocus: cell<boolean>(() => ({ defaultValue: true })),
    // 缺省搬：触发钮、键盘与命令式入口都要把焦点送进浮层
    moveFocusIn: cell<boolean>(() => ({ defaultValue: true })),
    // 按压通道：被 Space / Enter 或触屏按住的那一个部件（清空钮 / 触发钮 / 添加钮 / 快捷选项 / 时间格），按 key 记
    pressed: cell<TimePickerPressedKey | null>(() => ({ defaultValue: null })),
    tagListTracked: cell<boolean>(() => ({ defaultValue: false })),
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
  initialState: ({ prop }) => (openAtMount(prop) ? 'open' : 'closed'),
  // Layer、消解与焦点资源由顶层 effect 持有，逻辑关闭后等 Presence 真实退场再释放。
  effects: ['trackLayer', 'trackTagListMotion'],
  watch: ({ track, prop, context, action }) => {
    // 开合受控时用户事件只发意图、不自改状态；宿主写回 open 后由这里派发影子事件无条件回写
    track([() => prop('open')], () => action(['syncOpen']))
    // 只兜宿主侧的写入，内部提交当场已把缓冲一起更新
    track([context.dep('value')], () => action(['syncDraft']))
    // 按住途中转入禁用 / 只读或值被清空：触发钮随即 disabled、清空钮藏起，不会再来 keyup，按压面由机器自己收
    track([() => prop('disabled'), () => prop('readOnly'), context.dep('value'), context.dep('draft')], () => action(['releaseWhenInert']))
    // 选中值变了：选中换了格的时间列平滑滚过去（打开时的那一下由展开态的 effect 直接到位）
    track([context.dep('value'), context.dep('draft')], () => action(['followColumnSelection']))
  },
  // 分段输入与值这几件事与开合无关，两个状态里都得认
  on: {
    'FORM.RESET': { actions: ['resetToDefault'] },
    'VALUE.SET': { actions: ['setValue'] },
    'VALUE.CLEAR': { guard: 'canEdit', actions: ['clearValue'] },
    'VALUE.ADD': { guard: 'canEdit', actions: ['addValue'] },
    'VALUE.REMOVE': { guard: 'canEdit', actions: ['removeValue'] },
    'VALUE.TOGGLE': { guard: 'canEdit', actions: ['toggleValue'] },
    'TAG_LIST.TRACKED': { actions: ['markTagListTracked'] },
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
      // 第一次收起即撤首帧标记：之后的每一次打开都是用户操作带来的
      entry: ['clearOpenedAtMount'],
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
      effects: ['trackPosition', 'trackColumnScroll'],
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
        // 选中不收起：时分秒是分列挑的，挑完一列还得接着挑下一列
        'ITEM.SELECT': { guard: 'canEdit', actions: ['selectItem'] },
        // 快捷选项给的是整份时间，写完就该收；命令式 setValue（无 src）照旧不收。
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
      /** 这一次写值来自快捷选项：整份时间已经定了，浮层该收起。 */
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
      followColumnSelection: (params) => {
        if (params.state.matches('open'))
          followColumnSelection(columnScrollTarget(params))
      },
      clearOpenedAtMount,
      resetToDefault: (params) => {
        resetDeclaredValue(params, 'value', 'value', 'defaultValue')
        params.context.reset('draft')
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
       * 判据与 connect 里清空钮的显隐同一口径：value 与各段缓冲都空才算清干净。
       */
      releaseWhenInert: ({ context, prop }) => {
        const pressed = context.get('pressed')
        if (pressed == null)
          return
        if (prop('disabled') || (prop('readOnly') && pressed !== 'trigger')) {
          context.set('pressed', null)
          return
        }
        const draft = context.get('draft')
        const dirty = context.get('value').length > 0 || draft.hour != null || draft.minute != null
          || draft.second != null || draft.dayPeriod != null
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
       * 展开那一刻焦点落在时列：这一段已填的值仍在列里就停在它上面，否则退回意图那一端。
       * 列由纯函数按当前值算出，这里不必查 DOM。
       */
      setInitialFocusedItem: (params) => {
        const first = currentColumns(params)[0]
        if (!first)
          return
        const current = segmentNumber(currentDraft(params), first.unit, currentHourCycle(params))
        const selected = current == null ? null : timeItemValue(current)
        // 从输入段展开时保留段上的编辑焦点；从触发器展开则把空值落到第一项，
        // 避免焦点停在整列容器上，也让方向键与 Enter 立即有明确起点。
        const intent = params.context.get('focusIntent')
        if (!params.context.get('moveFocusIn') && intent === 'selected' && selected == null)
          return
        const edge = intent === 'last' ? first.options.at(-1) : first.options[0]
        params.context.set('focusedColumn', first.unit)
        params.context.set(
          'focusedItem',
          selected != null && first.options.includes(selected) ? selected : (edge ?? null),
        )
      },

      setFocusedItem: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'OPTION.FOCUS')
          return
        context.set('focusedColumn', e.unit)
        context.set('focusedItem', e.value)
      },

      clearFocusedItem: ({ context }) => {
        context.set('focusedColumn', null)
        context.set('focusedItem', null)
      },

      /**
       * 浮层里选中一格：只改对应的那一段，其余段原样留着。
       * 走的是与分段输入同一个 setTimeSegment，12 小时制下按当前上午/下午换算回 0-23。
       */
      selectItem: (params) => {
        const e = params.event.current()
        if (e.type !== 'ITEM.SELECT')
          return
        params.context.set('typeBuffer', '')
        params.context.set('focusedColumn', e.unit)
        params.context.set('focusedItem', e.value)
        commitDraft(
          params,
          setTimeSegment(currentDraft(params), e.unit, Number(e.value), currentHourCycle(params)),
        )
      },

      setValue: (params) => {
        const e = params.event.current()
        if (e.type !== 'VALUE.SET')
          return
        if (isMultiple(params)) {
          params.context.set('value', normalizeTimes(e.value, currentGranularity(params)))
          return
        }
        // 走一遍解析再回填：写坏的串等同于清空
        commitDraft(params, draftFromTime(parseTimeValue(e.value[0])))
      },

      clearValue: (params) => {
        // 多选清的是选中的那一组，浮层里拼着的草稿留着
        if (isMultiple(params)) {
          params.context.set('value', [])
          return
        }
        commitDraft(params, emptyTimeDraft())
        params.context.set('typeBuffer', '')
      },

      /** 把草稿收进值：填全、在界内、还没选过、没到上限才收；收完草稿留着，改一列就能接着添下一个。 */
      addValue: (params) => {
        if (!isMultiple(params))
          return
        const text = formatTimeValue(params.context.get('draft'), currentGranularity(params))
        const current = params.context.get('value')
        const max = resolveTimePickerMaxSelected(params.prop('maxSelected'))
        if (text === '' || current.includes(text) || isTimeOutOfRange(text, params.prop('min'), params.prop('max')))
          return
        if (max != null && current.length >= max)
          return
        params.context.set('value', normalizeTimes([...current, text], currentGranularity(params)))
      },

      removeValue: (params) => {
        const e = params.event.current()
        if (e.type !== 'VALUE.REMOVE')
          return
        params.context.set('value', params.context.get('value').filter(value => value !== e.value))
      },

      /** 快捷选项点一下切换：选过的点掉，没选过的加进来（满了就加不进）。 */
      toggleValue: (params) => {
        const e = params.event.current()
        if (e.type !== 'VALUE.TOGGLE' || !isMultiple(params))
          return
        const current = params.context.get('value')
        if (current.includes(e.value)) {
          params.context.set('value', current.filter(value => value !== e.value))
          return
        }
        const max = resolveTimePickerMaxSelected(params.prop('maxSelected'))
        if (max != null && current.length >= max)
          return
        params.context.set('value', normalizeTimes([...current, e.value], currentGranularity(params)))
      },

      markTagListTracked: ({ context }) => context.set('tagListTracked', true),

      stepSegment: (params) => {
        const e = params.event.current()
        if (e.type !== 'SEGMENT.STEP')
          return
        // 加减是另一种输入方式，之前敲了一半的数字作废
        params.context.set('typeBuffer', '')
        commitDraft(params, cycleTimeSegment(currentDraft(params), e.segment, e.delta, currentHourCycle(params)))
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
        commitDraft(params, setTimeSegment(currentDraft(params), e.segment, result.value, hourCycle))
      },

      clearSegment: (params) => {
        const e = params.event.current()
        if (e.type !== 'SEGMENT.CLEAR')
          return
        params.context.set('typeBuffer', '')
        commitDraft(params, clearTimeSegment(currentDraft(params), e.segment))
      },

      setPeriod: (params) => {
        const e = params.event.current()
        if (e.type !== 'SEGMENT.PERIOD')
          return
        params.context.set('typeBuffer', '')
        commitDraft(params, setTimeDayPeriod(currentDraft(params), e.period))
      },

      setFocusedSegment: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'SEGMENT.FOCUS')
          return
        // 换段就重开一轮数字输入
        if (context.get('focusedSegment') !== e.segment)
          context.set('typeBuffer', '')
        context.set('focusedSegment', e.segment)
      },

      clearFocusedSegment: ({ context }) => {
        context.set('focusedSegment', null)
        context.set('typeBuffer', '')
      },

      /**
       * 把缓冲拨回权威值。
       * 缓冲算出来的串与当前值一致时直接返回，否则会把填了一半的段当成外部清空抹掉。
       */
      syncDraft: (params) => {
        // 多选的草稿与值无关：值变了（添加、摘掉、宿主写回）草稿照旧
        if (isMultiple(params))
          return
        const value = singleValue(params)
        if (formatTimeValue(params.context.get('draft'), currentGranularity(params)) === value)
          return
        params.context.set('draft', draftFromTime(parseTimeValue(value)))
      },
    },
    effects: {
      // 多选的标签行：首帧就在的标签直接呈现，之后新选的播进场、摘掉的在原处播完退场
      trackTagListMotion: ({ refs, send, flush }) => trackSelectionTagMotion({
        flush,
        list: () => refs.get('getAnchorEl')()?.querySelector<HTMLElement>(TIME_PICKER_TAG_LIST_SELECTOR),
        onTracked: () => send({ type: 'TAG_LIST.TRACKED' }),
      }),
      trackColumnScroll: params => alignColumnsOnOpen(columnScrollTarget(params)),
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
              placement: prop('placement') ?? TIME_PICKER_DEFAULT_PLACEMENT,
              offset: prop('offset') ?? OVERLAY_OFFSET,
              // positioner 渲染成 fixed，坐标系必须跟着走视口系
              strategy: 'fixed',
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
                const unit = context.get('focusedColumn')
                const value = context.get('focusedItem')
                if (unit != null && value != null) {
                  const el = findTimePickerItem(content, unit, value)
                  return canTakeFocus(el, scope) ? el : null
                }
                // 判据与 setInitialFocusedItem 同一条：只有「指针入口且首列那一段还空着」才真的没有锚点。
                // 其余情形是本轮该有锚点却还没挑出来，返回 null 让焦点域重试。
                const first = currentColumns(params)[0]
                const empty = !first || segmentNumber(currentDraft(params), first.unit, currentHourCycle(params)) == null
                if (!first || !empty || context.get('focusIntent') !== 'selected')
                  return null
                const columnEl = findTimePickerColumn(content, first.unit)
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
