import type { Params } from '@xihan-ui/machine'
import type { VirtualizerKernel, VirtualizerKernelOptions } from './virtualizer.kernel'
import type { VirtualizerSchema } from './virtualizer.types'
import { setup } from '@xihan-ui/machine'
import {
  resolveVirtualizerEstimate,
  resolveVirtualizerLanes,
  resolveVirtualizerOverscan,
} from './virtualizer.geometry'
import { createVirtualizerKernel } from './virtualizer.kernel'
import { VIRTUALIZER_EMPTY_SNAPSHOT, virtualizerSnapshotEqual } from './virtualizer.sizing'

const { createMachine } = setup<VirtualizerSchema>()

type MachineParams = Params<VirtualizerSchema>

/** 喂给计算内核的排布参数。缺省在这里一次兜齐，内核只认已归一的值。 */
function kernelOptions(p: MachineParams, onChange: () => void): VirtualizerKernelOptions {
  return {
    count: p.prop('count') ?? 0,
    // 懒读：视口节点要等适配器提交完这一帧才存在
    getScrollElement: () => p.refs.get('getViewportEl')(),
    estimateSize: resolveVirtualizerEstimate(p.prop('estimateSize')),
    overscan: resolveVirtualizerOverscan(p.prop('overscan')),
    lanes: resolveVirtualizerLanes(p.prop('lanes')),
    horizontal: p.prop('horizontal') ?? false,
    gap: p.prop('gap') ?? 0,
    paddingStart: p.prop('paddingStart') ?? 0,
    paddingEnd: p.prop('paddingEnd') ?? 0,
    scrollMargin: p.prop('scrollMargin') ?? 0,
    getItemKey: p.prop('getItemKey'),
    onChange,
  }
}

/**
 * 把内核算好的结果写进 context，并把手还在滚吗同步成状态。
 * 第一行是停机判据：内核的监听摘干净之前仍可能回调一次（尤其是那只停手防抖计时器），
 * 此时 refs 里的内核已被清空，一比即知是残响。
 * 值没变就不写：内核每被问一次就产出一批新对象。
 */
function publishSnapshot(p: MachineParams, kernel: VirtualizerKernel): void {
  if (p.refs.get('getVirtualizer')() !== kernel)
    return
  const next = kernel.read()
  if (!virtualizerSnapshotEqual(next, p.context.get('snapshot')))
    p.context.set('snapshot', next)

  const scrolling = p.state.get() === 'scrolling'
  const kernelScrolling = kernel.isScrolling()
  if (kernelScrolling !== scrolling)
    p.send({ type: kernelScrolling ? 'SCROLL.START' : 'SCROLL.END' })
}

export const virtualizerMachine = createMachine({
  name: 'virtualizer',
  context: ({ prop, cell }) => ({
    // 快照是算出来的，宿主写不回来，因此只给 onChange 不给 value
    snapshot: cell<typeof VIRTUALIZER_EMPTY_SNAPSHOT>(() => ({
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
    // 估算尺寸改了要整个作废重排：实测尺寸账本不把 estimateSize 当依赖，换选项排出来的还是旧的。
    // 只认数字形态：函数形态的估算器身份每帧都变，拿它当重排判据会与清账本闭成回路；
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
       * prop 变了：换一份排布参数、让内核重新接一次滚动容器、把结果重新算出来。
       * sync 不能省，它是内核发现滚动容器换了或首次拿到容器的唯一入口，
       * 顺带把视口重量一遍——没有 ResizeObserver 的环境全靠这一下跟上尺寸变化。
       */
      syncOptions: (params) => {
        const kernel = params.refs.get('getVirtualizer')()
        if (!kernel)
          return
        kernel.setOptions(kernelOptions(params, () => publishSnapshot(params, kernel)))
        kernel.sync()
        publishSnapshot(params, kernel)
      },

      /** 整份作废重排：连实测尺寸一起丢，按当下的视口尺寸与估算值重来。 */
      remeasure: (params) => {
        const kernel = params.refs.get('getVirtualizer')()
        if (!kernel)
          return
        kernel.setOptions(kernelOptions(params, () => publishSnapshot(params, kernel)))
        kernel.sync()
        kernel.reset()
        publishSnapshot(params, kernel)
      },
    },
    effects: {
      /**
       * 计算内核的生死。它要挂 ResizeObserver 与 scroll 监听，因此整块落在效应里。
       * 推迟一拍再建：挂载这一刻视口节点未必就位，量到的尺寸是 0，内核会认定一条都排不下。
       * disposed 兜住还没建起来就被卸载那一路，否则监听器会挂到已停掉的机器上。
       */
      trackVirtualizer: (params) => {
        const { refs, scope, flush } = params
        let disposed = false
        let kernel: VirtualizerKernel | null = null

        flush(() => {
          if (disposed)
            return
          const viewport = refs.get('getViewportEl')()
          // 无 DOM 环境：状态转移照常，只是快照恒为空
          if (!viewport)
            return

          kernel = createVirtualizerKernel(
            kernelOptions(params, () => {
              if (kernel)
                publishSnapshot(params, kernel)
            }),
            scope,
          )
          // 先登记再接线：接上滚动容器当场就可能回调，refs 空着的话首帧快照会被当成残响丢掉
          refs.set('getVirtualizer', () => kernel)
          kernel.sync()
          publishSnapshot(params, kernel)
        })

        return () => {
          disposed = true
          // 先摘身份再停：停的过程中内核仍可能回调，此时它已不是在任的那台
          refs.set('getVirtualizer', () => null)
          const stopping = kernel
          kernel = null
          stopping?.dispose()
        }
      },
    },
  },
})
