import type { SegmentedBox, SegmentedIndicatorRect, SegmentedNode, SegmentedSchema } from './segmented.types'
import { itemValue, queryItems, readDirection, resetDeclaredValue, setup } from '@xihan-ui/core'
import { segmentedItemQuery } from './segmented.anatomy'

const { createMachine } = setup<SegmentedSchema>()

/**
 * 由根的内边距盒与选中条目的盒子算出指示器该落在哪。
 *
 * 起始缘按逻辑方向算：rtl 下从右缘往左量，样式侧因此只写一条 inset-inline-start 就两向通用。
 *
 * @param root 根的内边距盒（绝对定位的偏移就是相对它算的，根自己的描边不算在内）
 * @param item 选中条目的盒子
 * @param rtl 文字方向是否从右往左
 */
export function resolveSegmentedIndicator(root: SegmentedBox, item: SegmentedBox, rtl: boolean): SegmentedIndicatorRect {
  return {
    blockStart: item.top - root.top,
    blockSize: item.height,
    inlineStart: rtl
      ? (root.left + root.width) - (item.left + item.width)
      : item.left - root.left,
    inlineSize: item.width,
  }
}

/**
 * collection 的指纹：条目的身份与显示文本决定各段排在哪、有多宽，两者一变就得重量。
 * 取串而不是数组本身，作者每帧新建一个同内容的数组不该白惊动一次量测。
 * 段内与段间的分隔取制表符与换行，段文本里不会出现它们，拼出来的串不会撞车。
 */
function collectionKeyOf(nodes: SegmentedNode[] | undefined): string {
  return (nodes ?? []).map(node => `${node.value}\t${node.label ?? ''}`).join('\n')
}

/** 两次量测是否一样。作 cell 的 isEqual 用：不给的话每次量测都是新对象，版本号会一直空转自增。 */
function sameIndicator(a: SegmentedIndicatorRect | null, b: SegmentedIndicatorRect | null | undefined): boolean {
  if (a == null || b == null)
    return a === b
  return a.blockStart === b.blockStart && a.blockSize === b.blockSize
    && a.inlineStart === b.inlineStart && a.inlineSize === b.inlineSize
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
    indicator: cell<SegmentedIndicatorRect | null>(() => ({ defaultValue: null, isEqual: sameIndicator })),
  }),
  refs: () => ({
    getRootEl: () => null,
  }),
  initialState: () => 'idle',
  // 挂载即量一次指示器
  entry: ['measureIndicator'],
  effects: ['trackIndicatorSize'],
  watch: ({ track, context, prop, action }) => {
    // 选中值一变就把指示器挪过去
    track([context.dep('value')], () => action(['measureIndicator']))
    // 条目增删改名同样要重量：block 模式下根的宽度钉在父级上，段宽全变了根却一动不动，
    // 尺寸观察器一声不响，指示器会停在旧位置
    track([() => collectionKeyOf(prop('collection'))], () => action(['measureIndicator']))
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
      },
    },
  },
  implementations: {
    actions: {
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
          const rootRect = root.getBoundingClientRect()
          // 绝对定位的偏移从内边距盒起算，量测起点要把根自己的描边刨掉，
          // 否则根一带描边，指示器就整体偏出一个描边宽度
          const padBox: SegmentedBox = {
            left: rootRect.left + root.clientLeft,
            top: rootRect.top + root.clientTop,
            width: root.clientWidth,
            height: root.clientHeight,
          }
          const rect = item.getBoundingClientRect()
          // 方向从根节点现读：皮肤用的 inset-inline-start 按包含块的计算方向解析，
          // 那个方向由祖先链上任意一处 dir 或 CSS direction 决定。只认 prop 的话，
          // 整页 rtl 而作者没传 dir 时量测走 ltr、样式按 rtl 摆，指示器会落到错的那一段上。
          // prop('dir') 仍然优先，作者显式声明的方向说了算
          const rtl = (prop('dir') ?? readDirection(root)) === 'rtl'
          context.set('indicator', resolveSegmentedIndicator(
            padBox,
            { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
            rtl,
          ))
        }
        run()
        flush(run)
      },
    },
    effects: {
      /** 根的尺寸一变（换行、容器变窄、block 模式下父级伸缩）就重量指示器。 */
      trackIndicatorSize: ({ refs, scope, send, flush }) => {
        let disposed = false
        let stop: (() => void) | undefined

        // 推迟一拍再挂，等根节点就位
        flush(() => {
          if (disposed)
            return
          const root = refs.get('getRootEl')()
          if (!root)
            return
          // 无布局环境没有 ResizeObserver：不再跟随尺寸变化，选中值变化与显式 INDICATOR.MEASURE 仍会重量
          const win = scope.getWin()
          const observer = typeof win.ResizeObserver === 'function'
            ? new win.ResizeObserver(() => send({ type: 'INDICATOR.MEASURE' }))
            : null
          observer?.observe(root)
          stop = () => observer?.disconnect()
        })

        return () => {
          disposed = true
          stop?.()
        }
      },
    },
  },
})
