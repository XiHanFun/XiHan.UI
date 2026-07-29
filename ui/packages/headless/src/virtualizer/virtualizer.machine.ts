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
 * 内核的 setOptions 会跳过 undefined 落回它自己的默认，多兜一层就是两个事实源。
 * overscan / lanes / estimateSize 例外，它们的默认由本组件规定（见 sizing）。
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
    // 滚动、尺寸观察、滚动写回三件事全用内核自带的元素实现，它们要挂 ResizeObserver 与 scroll 监听
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
 * 内核只在接上滚动容器那一刻量一次视口，此后靠 ResizeObserver 跟；
 * 没有 ResizeObserver 的环境里那一次就是全部，挂载时容器没撑开尺寸会永远停在 0。
 * 因此每次显式重排都补量一次，读的是元素的边框盒，与内核自己那条路同源、同取整。
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
 * 把内核算好的结果写进 context，并把手还在滚吗同步成状态。
 * 第一行是停机判据：内核的监听摘干净之前仍可能回调一次（尤其是那只 150ms 的防抖计时器），
 * 此时 refs 里的内核已被清空，一比即知是残响。
 * 值没变就不写：内核每被问一次就产出一批新对象。
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
    // 快照是算出来的，宿主写不回来，因此只给 onChange 不给 value
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
  // 内核全程活着，它要挂 ResizeObserver 与 scroll 监听，与状态无关
  effects: ['trackVirtualizer'],
  // 显式重排在哪个状态下都是同一件事
  on: {
    MEASURE: { actions: ['remeasure'] },
  },
  watch: ({ track, prop, action }) => {
    // 影响区间与总长的 prop 全数盯住，少盯一个（典型是 count）会静默渲成旧长度
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
    // 估算尺寸改了要整个作废重排：内核的测量备忘录不把 estimateSize 当依赖，换选项排出来的还是旧的。
    // 只认数字形态：函数形态的估算器身份每帧都变，拿它当重排判据会与清缓存闭成回路；
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
       * _willUpdate 不能省，它是内核发现滚动容器换了或首次拿到容器的唯一入口。
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
       * 计算内核的生死。它要挂 ResizeObserver 与 scroll 监听，因此整块落在效应里。
       * 推迟一拍再建：挂载这一刻视口节点未必就位，量到的尺寸是 0，内核会认定一条都排不下。
       * disposed 兜住还没建起来就被卸载那一路，否则监听器会挂到已停掉的机器上。
       */
      trackVirtualizer: (params) => {
        const { refs, flush } = params
        let disposed = false
        let stopKernel: (() => void) | undefined

        flush(() => {
          if (disposed)
            return
          const viewport = refs.get('getViewportEl')()
          // 无 DOM 环境：状态转移照常，只是快照恒为空
          if (!viewport)
            return

          const instance = new Virtualizer<HTMLElement, HTMLElement>(
            kernelOptions(params, self => publishSnapshot(params, self)),
          )
          // 先登记再接线：_willUpdate 当场会回调一次 onChange，refs 空着的话首帧快照会被当成残响丢掉
          refs.set('getVirtualizer', () => instance)
          stopKernel = instance._didMount()
          instance._willUpdate()
          publishSnapshot(params, instance)
        })

        return () => {
          disposed = true
          // 先摘身份再停：停的过程中内核仍可能回调，此时它已不是在任的那台
          refs.set('getVirtualizer', () => null)
          stopKernel?.()
        }
      },
    },
  },
})
