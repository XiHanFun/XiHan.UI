import type { Direction, Orientation } from '@xihan-ui/core'
import type { SplitterApi, SplitterPanelProps, SplitterPanelState, SplitterSchema, SplitterTranslations } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { normalizeItemIndex } from '@xihan-ui/core'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { renderSlot } from '../../runtime/slot-content'
import { SplitterProvider, useSplitterContext } from './context'
import { useSplitter } from './use-splitter'

type SplitterProps = SplitterSchema['props']

/** 函数式 children 的载荷：各面板的百分比与逐块状态、拖拽态，以及整份赋值、单块调整、折叠展开的命令。 */
export interface SplitterRootSlotProps {
  size: number[]
  panels: SplitterPanelState[]
  dragging: boolean
  setSizes: SplitterApi['setSizes']
  setPanelSize: SplitterApi['setPanelSize']
  collapsePanel: SplitterApi['collapsePanel']
  expandPanel: SplitterApi['expandPanel']
  togglePanel: SplitterApi['togglePanel']
}

export interface XhSplitterRootProps extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'dir'> {
  /** 受控布局，恒是百分比数组；给定即受控。 */
  sizes?: number[]
  /** 非受控初值。 */
  defaultSizes?: number[]
  /** 逐块的约束：最小、最大与能不能折叠。 */
  panels?: SplitterPanelProps[]
  orientation?: Orientation
  /** 文字方向，缺省 ltr。 */
  dir?: Direction
  disabled?: boolean
  /** 方向键一步走几个百分点。 */
  step?: number
  /** PageUp / PageDown 一步走几个百分点。 */
  largeStep?: number
  translations?: Partial<SplitterTranslations>
  /** 每次调整都发；拖动过程中会连续发很多次。 */
  onSizesChange?: SplitterProps['onSizesChange']
  /** 只在一次操作收尾时发一次。 */
  onSizesChangeEnd?: SplitterProps['onSizesChangeEnd']
  children?: SlotChildren<SplitterRootSlotProps>
}

export function XhSplitterRoot({
  sizes,
  defaultSizes,
  panels,
  orientation,
  dir,
  disabled,
  step,
  largeStep,
  translations,
  onSizesChange,
  onSizesChangeEnd,
  children,
  ...rest
}: XhSplitterRootProps): ReactNode {
  const ctx = useSplitter(withXhConfig('splitter', {
    sizes,
    defaultSizes,
    panels,
    orientation,
    dir,
    disabled,
    step,
    largeStep,
    translations,
    onSizesChange,
    onSizesChangeEnd,
  }) as SplitterProps)
  const api = ctx.api

  return (
    <SplitterProvider value={ctx}>
      {/* 容器节点交给机器，矩形在拖拽开始时现量 */}
      <div
        {...mergeReactProps(
          api.getRootProps() as Record<string, unknown>,
          rest as Record<string, unknown>,
          { ref: ctx.rootRef },
        )}
      >
        {renderSlot(children, {
          size: api.sizes,
          panels: api.panels,
          dragging: api.dragging,
          setSizes: api.setSizes,
          setPanelSize: api.setPanelSize,
          collapsePanel: api.collapsePanel,
          expandPanel: api.expandPanel,
          togglePanel: api.togglePanel,
        })}
      </div>
    </SplitterProvider>
  )
}

XhSplitterRoot.xhEvents = ['sizes-change', 'sizes-change-end'] as const

export interface XhSplitterPanelProps extends ComponentPropsWithRef<'div'> {
  /** 第几块面板；多块时必须逐个写明。兼收字符串。 */
  index?: number | string
}

export function XhSplitterPanel({ index = 0, children, ...rest }: XhSplitterPanelProps): ReactNode {
  const ctx = useSplitterContext()
  return (
    <div
      {...mergeReactProps(
        ctx.api.getPanelProps(normalizeItemIndex(index)) as Record<string, unknown>,
        rest as Record<string, unknown>,
      )}
    >
      {children}
    </div>
  )
}

export interface XhSplitterResizeTriggerProps extends ComponentPropsWithRef<'div'> {
  /** 第几条分隔条；它坐在第 index 与第 index+1 块面板之间，调整的是前一块。兼收字符串。 */
  index?: number | string
}

export function XhSplitterResizeTrigger({ index = 0, children, ...rest }: XhSplitterResizeTriggerProps): ReactNode {
  const ctx = useSplitterContext()
  // 分隔条上的 onFocus 是不冒泡的 DOM focus，React 的同名合成事件挂的是冒泡的 focusin：
  // 后代得焦会被算成分隔条自己得焦，键盘操作的那一条于是认错人。装成原生监听器，
  // 到达路径才与另外两家一致
  const bind = useNativeEvents(
    ctx.api.getResizeTriggerProps(normalizeItemIndex(index)) as Record<string, unknown>,
    ['onFocus'],
  )
  return (
    <div {...mergeReactProps(bind.attrs, { ref: bind.ref }, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}
