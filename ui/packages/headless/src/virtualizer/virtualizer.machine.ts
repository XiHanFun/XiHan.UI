import type { VirtualizerOptions as CoreOptions } from '@tanstack/virtual-core'
import type { Params } from '@xihan-ui/machine'
import type { VirtualizerItemState, VirtualizerSnapshot } from './virtualizer.sizing'
import type { VirtualizerCore, VirtualizerSchema } from './virtualizer.types'
import { elementScroll, observeElementOffset, observeElementRect, Virtualizer } from '@tanstack/virtual-core'
import { setup } from '@xihan-ui/machine'
import {
  resolveVirtualizerEstimate,
  resolveVirtualizerLanes,
  resolveVirtualizerOverscan,
  VIRTUALIZER_EMPTY_SNAPSHOT,
  virtualizerSnapshotEqual,
} from './virtualizer.sizing'

const { createMachine } = setup<VirtualizerSchema>()

type MachineParams = Params<VirtualizerSchema>

/**
 * 喂给计算内核的选项。缺省一律给 undefined 而不是自己兜一个值：
 * 内核的 setOptions 会跳过 undefined 落回它自己的默认，多兜一层就成了两个事实源。
 * overscan / lanes / estimateSize 三个例外——它们的默认由本组件规定（见 sizing）。
 */
function kernelOptions(
  p: MachineParams,
  onChange: (instance: VirtualizerCore) => void,
): CoreOptions<HTMLElement, HTMLElement> {
  return {
    count: p.prop('count') ?? 0,
    // 懒读：视口节点要等适配器提交完这一帧才存在，内核每次 _willUpdate 都会重新问
    getScrollElement: () => p.refs.get('getViewportEl')(),
    estimateSize: resolveVirtualizerEstimate(p.prop('estimateSize')),
    overscan: resolveVirtualizerOverscan(p.prop('overscan')),
    lanes: resolveVirtualizerLanes(p.prop('lanes')),
    horizontal: p.prop('horizontal') ?? false,
    gap: p.prop('gap'),
    paddingStart: p.prop('paddingStart'),
    paddingEnd: p.prop('paddingEnd'),
    scrollMargin: p.prop('scrollMargin'),
    getItemKey: p.prop('getItemKey'),
    // 滚动、尺寸观察、滚动写回三件事全用内核自带的元素实现：
    // 它们要挂 ResizeObserver 与 scroll 监听，正是效应该做的事
    scrollToFn: elementScroll,
    observeElementRect,
    observeElementOffset,
    onChange: instance => onChange(instance),
  }
}

/** 内核的条目投影成组件的快照形状。位移减掉 scrollMargin，换算成"距 content 起点"。 */
function readItems(instance: VirtualizerCore): VirtualizerItemState[] {
  const margin = instance.options.scrollMargin
  return instance.getVirtualItems().map(item => ({
    index: item.index,
    // 内核允许 bigint 型的 key，本组件对外只认字符串与数字
    key: typeof item.key === 'bigint' ? item.key.toString() : item.key,
    start: item.start - margin,
    end: item.end - margin,
    size: item.size,
    lane: item.lane,
  }))
}

/**
 * 把视口此刻的尺寸重新读进内核。
 *
 * 内核只在"接上滚动容器"那一刻量一次视口，此后靠 ResizeObserver 跟。
 * 没有 ResizeObserver 的环境（老浏览器、SSR 后的首帧、无布局的测试）里那一次就是全部——
 * 挂载时容器还没撑开的话，尺寸会永远停在 0，一条都渲不出来。
 * 因此每次显式重排都补量一次：读的是元素的边框盒，与内核自己那条路同源、同取整。
 */
function refreshRect(instance: VirtualizerCore, viewport: HTMLElement | null): void {
  if (!viewport)
    return
  instance.scrollRect = {
    width: Math.round(viewport.offsetWidth),
    height: Math.round(viewport.offsetHeight),
  }
}

function readSnapshot(instance: VirtualizerCore): VirtualizerSnapshot {
  // 先取条目：区间是它算出来的副产物，反过来读会拿到上一轮的
  const items = readItems(instance)
  return {
    items,
    totalSize: instance.getTotalSize(),
    startIndex: instance.range?.startIndex ?? null,
    endIndex: instance.range?.endIndex ?? null,
  }
}

/**
 * 把内核算好的结果写进 context，并把"手还在滚吗"同步成状态。
 *
 * 第一行是停机判据：内核的滚动监听与 ResizeObserver 摘干净之前仍可能回调一次
 * （observeElementOffset 里那只 150ms 的防抖计时器尤其），refs 里的内核此刻已被清空，
 * 一比就知道自己是停机后的残响，闭嘴即可。
 *
 * 值没变就不写：内核每被问一次就产出一批新对象，Vue 侧的 cell 是 shallowRef，
 * 无条件写等于每个滚动事件都白重渲一遍。
 */
function publishSnapshot(p: MachineParams, instance: VirtualizerCore): void {
  if (p.refs.get('getVirtualizer')() !== instance)
    return
  const next = readSnapshot(instance)
  if (!virtualizerSnapshotEqual(next, p.context.get('snapshot')))
    p.context.set('snapshot', next)

  const scrolling = p.state.get() === 'scrolling'
  if (instance.isScrolling !== scrolling)
    p.send({ type: instance.isScrolling ? 'SCROLL.START' : 'SCROLL.END' })
}

export const virtualizerMachine = createMachine({
  name: 'virtualizer',
  context: ({ prop, cell }) => ({
    // 快照是算出来的事实，宿主没有"正确答案"可以写回来，因此只给 onChange 不给 value
    snapshot: cell<VirtualizerSnapshot>(() => ({
      defaultValue: VIRTUALIZER_EMPTY_SNAPSHOT,
      isEqual: virtualizerSnapshotEqual,
      onChange: value => prop('onChange')?.({
        virtualItems: value.items,
        totalSize: value.totalSize,
        startIndex: value.startIndex,
        endIndex: value.endIndex,
      }),
    })),
  }),
  refs: () => ({
    getViewportEl: () => null,
    getContentEl: () => null,
    getVirtualizer: () => null,
  }),
  initialState: () => 'idle',
  // 内核全程活着：它要挂 ResizeObserver 与 scroll 监听，与状态无关
  effects: ['trackVirtualizer'],
  // 显式重排在哪个状态下都是同一件事
  on: {
    MEASURE: { actions: ['remeasure'] },
  },
  watch: ({ track, prop, action }) => {
    // 影响区间与总长的 prop 全数盯住。少盯一个（典型是 count）就会出现
    // "数据换了一批、列表还照着旧长度渲"的静默错
    track(
      [
        () => prop('count'),
        () => prop('estimateSize'),
        () => prop('overscan'),
        () => prop('horizontal'),
        () => prop('gap'),
        () => prop('lanes'),
        () => prop('paddingStart'),
        () => prop('paddingEnd'),
        () => prop('scrollMargin'),
        () => prop('getItemKey'),
      ],
      () => action(['syncOptions']),
    )
    // 估算尺寸改了要把排好的位置整个作废重排：内核的测量备忘录不把 estimateSize
    // 当依赖（它假定估算值是常量），光换选项排出来的还是旧的那份。
    //
    // 只认数字形态：函数形态的估算器身份天然每帧都变（作者常写内联箭头），
    // 拿它当重排判据会把实测尺寸每帧清一次，并与"清了→回落估算值→重渲→再量"闭成回路。
    // 函数的行为真变了，作者调 api.measure()。
    track(
      [() => (typeof prop('estimateSize') === 'number' ? prop('estimateSize') : null)],
      () => action(['remeasure']),
    )
  },
  states: {
    idle: {
      on: { 'SCROLL.START': { target: 'scrolling' } },
    },
    scrolling: {
      on: { 'SCROLL.END': { target: 'idle' } },
    },
  },
  implementations: {
    actions: {
      /**
       * prop 变了：换一份选项、让内核重新接一次滚动容器、把结果重新算出来。
       * _willUpdate 不能省——它是内核"发现滚动容器换了/首次拿到容器"的唯一入口。
       */
      syncOptions: (params) => {
        const instance = params.refs.get('getVirtualizer')()
        if (!instance)
          return
        instance.setOptions(kernelOptions(params, self => publishSnapshot(params, self)))
        refreshRect(instance, params.refs.get('getViewportEl')())
        instance._willUpdate()
        publishSnapshot(params, instance)
      },

      /** 整份作废重排：连实测尺寸一起丢，按当下的视口尺寸与估算值重来。 */
      remeasure: (params) => {
        const instance = params.refs.get('getVirtualizer')()
        if (!instance)
          return
        instance.setOptions(kernelOptions(params, self => publishSnapshot(params, self)))
        refreshRect(instance, params.refs.get('getViewportEl')())
        instance.measure()
        publishSnapshot(params, instance)
      },
    },
    effects: {
      /**
       * 计算内核的生死。它要挂 ResizeObserver（量视口）与 scroll 监听（读滚动量），
       * 因此整块落在效应里，连接层一行 DOM 都不碰。
       *
       * 推迟一拍再建：挂载这一刻视口节点未必就位（Vue 的 ref 要等提交、WC 的角色节点
       * 要等首次 updated），此时量到的尺寸是 0，内核会认定"一条都排不下"。
       * disposed 标记兜住"还没建起来就被卸载"那一路——不然监听器会挂到一台已经停掉的机器上。
       */
      trackVirtualizer: (params) => {
        const { refs, flush } = params
        let disposed = false
        let stopKernel: (() => void) | undefined

        flush(() => {
          if (disposed)
            return
          const viewport = refs.get('getViewportEl')()
          // 无 DOM 环境（纯逻辑测试 / SSR）：状态转移照常，只是快照恒为空
          if (!viewport)
            return

          const instance = new Virtualizer<HTMLElement, HTMLElement>(
            kernelOptions(params, self => publishSnapshot(params, self)),
          )
          // 先登记再接线：_willUpdate 当场就会回调一次 onChange，
          // 那一刻 refs 里若还是空的，首帧快照会被停机判据当成残响丢掉
          refs.set('getVirtualizer', () => instance)
          stopKernel = instance._didMount()
          instance._willUpdate()
          publishSnapshot(params, instance)
        })

        return () => {
          disposed = true
          // 先摘身份再停：停的过程中内核仍可能回调，此时它已不是"在任的那台"
          refs.set('getVirtualizer', () => null)
          stopKernel?.()
        }
      },
    },
  },
})
