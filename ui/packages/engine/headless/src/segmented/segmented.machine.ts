/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 segmented 相关实现。

import type { SegmentedIndicatorRect, SegmentedNode, SegmentedSchema } from './segmented.types'
import { itemValue, queryItems, resetDeclaredValue, setup } from '@xihan-ui/core'
import { measureIndicatorBox, sameIndicatorBox, trackIndicatorLayout } from '../shared/indicator'
import { segmentedItemQuery } from './segmented.anatomy'

const { createMachine } = setup<SegmentedSchema>()

/**
 * collection 的指纹：条目的身份与显示文本决定各段排在哪、有多宽，两者一变就得重量。
 * 取串而不是数组本身，作者每帧新建一个同内容的数组不该白惊动一次量测。
 * 段内与段间的分隔取制表符与换行，段文本里不会出现它们，拼出来的串不会撞车。
 */
function collectionKeyOf(nodes: SegmentedNode[] | undefined): string {
  return (nodes ?? []).map(node => `${node.value}\t${node.label ?? ''}`).join('\n')
}

// 选中值住在 context 的 cell 里，受控/非受控在 cell 收口，不需要影子事件与受控守卫。
// 机器只有一个状态，transition 省略 target 即只跑 actions、不换状态。
export const segmentedMachine = createMachine({
  name: 'segmented',
  context: ({ prop, cell }) => ({
    value: cell<string | null>(() => ({
      value: prop('value'),
      defaultValue: prop('defaultValue') ?? null,
      onChange: value => prop('onValueChange')?.({ value }),
    })),
    // 焦点锚点：不受控、不对外通知，只服务 roving tabindex 与方向键起点
    focusedValue: cell<string | null>(() => ({ defaultValue: null })),
    // 量测结果不受控、不对外通知
    indicator: cell<SegmentedIndicatorRect | null>(() => ({ defaultValue: null, isEqual: sameIndicatorBox })),
    // 按压通道：正被按住的段（按 value 记），与选中、焦点锚点无关
    pressedValue: cell<string | null>(() => ({ defaultValue: null })),
  }),
  refs: () => ({
    getRootEl: () => null,
  }),
  initialState: () => 'idle',
  // 挂载即量一次指示器
  entry: ['measureIndicator'],
  effects: ['trackIndicatorLayout'],
  watch: ({ track, context, prop, action }) => {
    // 选中值一变就把指示器挪过去
    track([context.dep('value')], () => action(['measureIndicator']))
    // 条目增删改名同样要重量：block 模式下根的宽度钉在父级上，段宽全变了根却一动不动，
    // 尺寸观察器一声不响，指示器会停在旧位置
    track([() => collectionKeyOf(prop('collection'))], () => action(['measureIndicator']))
    // 按住途中整组转入禁用或只读：不会再来 keyup，按压面由机器自己收
    track([() => prop('disabled'), () => prop('readOnly')], () => action(['releaseWhenInert']))
  },
  // 表单重置从任何状态都要认，所以挂根级。不设禁用/只读守卫：原生表单的重置算法
  // 不看这两个标志，禁用的字段一样回落点；要拦是表单那侧 preventDefault 的事
  on: {
    'FORM.RESET': { actions: ['resetToDefault'] },
  },
  states: {
    idle: {
      on: {
        'VALUE.SET': { actions: ['setValue'] },
        // 选中顺带把锚点搬过来，下次 Tab 进组落在刚选过的那一段上
        'ITEM.SELECT': { actions: ['setValue', 'setFocusedValue'] },
        'ITEM.FOCUS': { actions: ['setFocusedValue'] },
        'GROUP.BLUR': { actions: ['clearFocusedValue'] },
        'INDICATOR.MEASURE': { actions: ['measureIndicator'] },
        // 按压通道：段按 value 记按住的那一个；整组禁用或只读不进，段自身的禁用由 connect 判定后随事件带入
        'PRESS.START': { guard: 'canPress', actions: ['startPress'] },
        'PRESS.END': { actions: ['endPress'] },
      },
    },
  },
  implementations: {
    guards: {
      // 整组禁用或只读一票否决；段自身的禁用随事件带入
      canPress: ({ prop, event }) => {
        const e = event.current()
        return e.type === 'PRESS.START' && !prop('disabled') && !prop('readOnly') && !e.disabled
      },
    },
    actions: {
      startPress: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'PRESS.START')
          context.set('pressedValue', e.value)
      },
      // 只收自己那一下：另一段的 keyup 不该把正按着的这段松开
      endPress: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'PRESS.END' && context.get('pressedValue') === e.value)
          context.set('pressedValue', null)
      },
      releaseWhenInert: ({ context, prop }) => {
        if (prop('disabled') || prop('readOnly'))
          context.set('pressedValue', null)
      },
      // 落点即 value cell 自己的 defaultValue 表达式，不另抄一份。
      // 焦点锚点与指示器量测不动：原生重置不碰非表单的 UI 状态，指示器随值变化那条 watch 自会跟上
      resetToDefault: params => void resetDeclaredValue(params, 'value', 'value', 'defaultValue'),

      setValue: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'VALUE.SET' || e.type === 'ITEM.SELECT')
          context.set('value', e.value)
      },
      setFocusedValue: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'ITEM.SELECT' || e.type === 'ITEM.FOCUS')
          context.set('focusedValue', e.value)
      },
      clearFocusedValue: ({ context }) => context.set('focusedValue', null),

      /**
       * 量指示器。必须量两遍：同步那遍照顾"条目早就在 DOM 里"的常规情形，推迟那遍照顾首帧
       * （挂载当刻根节点还没进 DOM，WC 侧的身份标记更要等首次 wire 才写上）。
       * cell 带 isEqual，量到同一结果不会多推更新。
       */
      measureIndicator: ({ refs, prop, context, flush }) => {
        const run = (): void => {
          const root = refs.get('getRootEl')()
          const value = context.get('value')
          if (!root || value == null) {
            context.set('indicator', null)
            return
          }
          const item = queryItems(root, segmentedItemQuery).find(el => itemValue(el) === value)
          if (!item) {
            context.set('indicator', null)
            return
          }
          // 量排布位而不是屏幕矩形：整组放在正在缩放进场的对话框里时，矩形量到的是缩小后的值。
          // 方向缺省从根节点现读，与皮肤按 :dir(rtl) 翻转位移同一个来源；作者显式给的 dir 说了算
          context.set('indicator', measureIndicatorBox(root, item, prop('dir')))
        }
        run()
        flush(run)
      },
    },
    effects: {
      /** 根或段的尺寸一变（换行、容器变窄、段文案变长）、段增减、字体加载完成，就重量指示器。 */
      trackIndicatorLayout: ({ refs, scope, send, flush }) => {
        let disposed = false
        let stop: (() => void) | undefined

        // 推迟一拍再挂，等根节点就位
        flush(() => {
          if (disposed)
            return
          const root = refs.get('getRootEl')()
          if (!root)
            return
          stop = trackIndicatorLayout(scope.getWin(), {
            container: root,
            items: () => queryItems(root, segmentedItemQuery),
            onChange: () => send({ type: 'INDICATOR.MEASURE' }),
          })
        })

        return () => {
          disposed = true
          stop?.()
        }
      },
    },
  },
})
