/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 radio group 相关实现。

import type { RadioGroupNode, RadioGroupSchema, RadioGroupThumbRect } from './radio-group.types'
import { itemValue, queryItems, resetDeclaredValue, setup } from '@xihan-ui/core'
import { createLiquidIndicator, measureIndicatorBox, sameIndicatorBox, trackIndicatorLayout } from '../shared/indicator'
import { radioGroupItemQuery } from './radio-group.anatomy'
import { resolveRadioGroupOrientation } from './radio-group.orientation'

const { createMachine } = setup<RadioGroupSchema>()

/**
 * collection 的指纹：条目的身份、显示文本与图标决定各段排在哪、有多宽，一变就得重量滑块。
 * 取串而不是数组本身，作者每帧新建一个同内容的数组不该白惊动一次量测。
 * 段内与段间的分隔取制表符与换行，文本里不会出现它们，拼出来的串不会撞车。
 */
function collectionKeyOf(nodes: RadioGroupNode[] | undefined): string {
  return (nodes ?? []).map(node => `${node.value}\t${node.label ?? ''}\t${node.icon ?? ''}`).join('\n')
}

export const radioGroupMachine = createMachine({
  name: 'radio-group',
  context: ({ prop, cell }) => ({
    value: cell<string | null>(() => ({
      value: prop('value'),
      defaultValue: prop('defaultValue') ?? null,
      onChange: value => prop('onValueChange')?.({ value }),
    })),
    // 焦点锚点，不受控
    focusedValue: cell<string | null>(() => ({ defaultValue: null })),
    // 按压通道：正被按住的条目（按 value 记），与选中、焦点锚点无关
    pressedValue: cell<string | null>(() => ({ defaultValue: null })),
    // 滑块的量测结果不受控、不对外通知
    thumb: cell<RadioGroupThumbRect | null>(() => ({ defaultValue: null, isEqual: sameIndicatorBox })),
    thumbStretch: cell<number>(() => ({ defaultValue: 0 })),
    // 滑块这一落点直接到位（首次落位与同一项的重量），还是交给皮肤滑过去（标准档换项）
    thumbInstant: cell<boolean>(() => ({ defaultValue: true })),
  }),
  refs: () => ({
    getRootEl: () => null,
    liquidThumb: null,
    syncThumbLayout: null,
  }),
  initialState: () => 'idle',
  // 挂载即量一次滑块（不是 segmented 形态时落 null）
  entry: ['measureThumb'],
  effects: ['trackThumbLayout', 'trackLiquidThumb'],
  watch: ({ track, context, prop, action }) => {
    // 选中值一变就把滑块挪过去
    track([context.dep('value')], () => action(['measureThumb']))
    // 条目增删改名同样要重量：block 模式下根的宽度钉在父级上，段宽全变了根却一动不动，
    // 尺寸观察器一声不响，滑块会停在旧位置。排布方向一换，段全换了位置
    track([() => collectionKeyOf(prop('collection')), () => resolveRadioGroupOrientation(prop('orientation'), prop('variant'))], () => action(['measureThumb']))
    // 形态一换：进 segmented 挂上尺寸观察并量出落点，离开时摘掉观察、收起滑块
    track([() => prop('variant')], () => action(['syncThumbLayout', 'measureThumb']))
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
        // 选中顺带把锚点搬过来，下次 Tab 进组落在刚选过的那一个上
        'ITEM.SELECT': { actions: ['setValue', 'setFocusedValue'] },
        'ITEM.FOCUS': { actions: ['setFocusedValue'] },
        'GROUP.BLUR': { actions: ['clearFocusedValue'] },
        'THUMB.MEASURE': { actions: ['measureThumb'] },
        // 按压通道：条目按 value 记按住的那一个；整组禁用或只读不进，条目自身的禁用由 connect 判定后随事件带入
        'PRESS.START': { guard: 'canPress', actions: ['startPress'] },
        'PRESS.END': { actions: ['endPress'] },
      },
    },
  },
  implementations: {
    guards: {
      // 整组禁用或只读一票否决；条目自身的禁用随事件带入
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
      // 只收自己那一下：另一个条目的 keyup 不该把正按着的这个松开
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
      // 焦点锚点与滑块量测不动：原生重置不碰非表单的 UI 状态，滑块随值变化那条 watch 自会跟上
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

      syncThumbLayout: ({ refs }) => refs.get('syncThumbLayout')?.(),

      /**
       * 量滑块。必须量两遍：同步那遍照顾"条目早就在 DOM 里"的常规情形，推迟那遍照顾首帧
       * （挂载当刻根节点还没进 DOM，WC 侧的身份标记更要等首次 wire 才写上）。
       * cell 带 isEqual，量到同一结果不会多推更新。list / card 形态没有滑块，落 null 即收起。
       */
      measureThumb: ({ refs, prop, context, flush }) => {
        const run = (): void => {
          const root = refs.get('getRootEl')()
          const value = context.get('value')
          // 量到的落点交给液态滑块：液态档下选中项一变，两沿走弹簧过去；其余直接落定
          const place = (box: RadioGroupThumbRect | null): void => {
            const liquid = refs.get('liquidThumb')
            if (liquid) {
              liquid.place(box, value)
            }
            else {
              // 滑块的落位器建起之前（挂载即量的那一次）：首次落位，直接到位
              context.set('thumb', box)
              context.set('thumbInstant', true)
            }
          }
          if (prop('variant') !== 'segmented' || !root || value == null) {
            place(null)
            return
          }
          const item = queryItems(root, radioGroupItemQuery).find(el => itemValue(el) === value)
          if (!item) {
            place(null)
            return
          }
          // 量排布位而不是屏幕矩形：整组放在正在缩放进场的对话框里时，矩形量到的是缩小后的值。
          // 方向缺省从根节点现读，与皮肤按 --xh-direction-sign 翻转位移同一个来源；作者显式给的 dir 说了算
          place(measureIndicatorBox(root, item, prop('dir')))
        }
        run()
        flush(run)
      },
    },
    effects: {
      /** 液态档的双沿滑块：建好放进 refs，先把眼下的落点交给它，之后的落位都经它走。 */
      trackLiquidThumb: ({ refs, prop, context }) => {
        const liquid = createLiquidIndicator({
          axis: () => (resolveRadioGroupOrientation(prop('orientation'), prop('variant')) === 'vertical' ? 'block' : 'inline'),
          host: () => refs.get('getRootEl')(),
          onFrame: (box, stretch, instant) => {
            context.set('thumb', box)
            context.set('thumbStretch', stretch)
            context.set('thumbInstant', instant)
          },
        })
        liquid.place(context.get('thumb'), context.get('value'))
        refs.set('liquidThumb', liquid)
        return () => {
          liquid.dispose()
          refs.set('liquidThumb', null)
        }
      },
      /**
       * 根或条目的尺寸一变（换行、容器变窄、文案变长）、条目增减、字体加载完成，就重量滑块。
       * 只有 segmented 形态才盯：list / card 没有滑块，不该为每个单选组挂一套观察器。
       * 形态在运行期换了，由 syncThumbLayout 动作按新形态挂上或摘下。
       */
      trackThumbLayout: ({ refs, prop, scope, send, flush }) => {
        let disposed = false
        let stop: (() => void) | undefined

        const sync = (): void => {
          if (disposed)
            return
          const root = refs.get('getRootEl')()
          if (!root || prop('variant') !== 'segmented') {
            stop?.()
            stop = undefined
            return
          }
          if (stop)
            return
          stop = trackIndicatorLayout(scope.getWin(), {
            container: root,
            items: () => queryItems(root, radioGroupItemQuery),
            onChange: () => send({ type: 'THUMB.MEASURE' }),
          })
        }
        refs.set('syncThumbLayout', sync)
        // 推迟一拍再挂，等根节点就位
        flush(sync)

        return () => {
          disposed = true
          stop?.()
          stop = undefined
          refs.set('syncThumbLayout', null)
        }
      },
    },
  },
})
