/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 transfer 相关实现。

import type { Direction, Service, Size, Tone } from '@xihan-ui/core'
import type {
  CollectionVirtualizer,
  TransferApi,
  TransferCheckState,
  TransferFilter,
  TransferItem,
  TransferSchema,
  TransferSide,
} from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode, RefObject } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { transferStructure } from '@xihan-ui/headless'
import { useEffect, useMemo, useRef } from 'react'
import { withXhConfig } from '../../config/config'
import { useIsomorphicLayoutEffect } from '../../runtime/layout-effect'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { renderSlot } from '../../runtime/slot-content'
import { renderStructure } from '../../runtime/structure'
import { useScrollbars } from '../../runtime/use-scrollbars'
import { useFieldGroupWiring, useFieldLabelWiring } from '../field/use-field-control'
import { useFormControlProps } from '../form/use-form-control'
import {
  TransferGroupProvider,
  TransferItemProvider,
  TransferPanelProvider,
  TransferProvider,
  useTransferContext,
  useTransferGroupContext,
  useTransferItemContext,
  useTransferPanelContext,
} from './context'
import { useTransfer } from './use-transfer'

type TransferProps = TransferSchema['props']

/** 服务端没有提交这一步，layout effect 替换为永不执行的 useEffect，避开 React 的警告。 */

/** 函数式 children 的载荷：目标侧的值与两侧的勾选、两侧当前可见的条目，以及勾选、写值与移动的动作。 */
export interface TransferRootSlotProps {
  value: string[]
  selection: string[]
  sourceItems: readonly TransferItem[]
  targetItems: readonly TransferItem[]
  canMove: (to: TransferSide) => boolean
  checkState: (side: TransferSide) => TransferCheckState
  isChecked: (value: string) => boolean
  setValue: (next: string[]) => void
  setSelection: (next: string[]) => void
  toggle: (value: string, options?: { extend?: boolean }) => void
  toggleAll: (side: TransferSide) => void
  move: (to: TransferSide) => void
}

/** 面板函数式 children 的载荷：该侧的身份、当前可见的条目、该侧的全选三态与搜索词。 */
export interface TransferPanelSlotProps {
  side: TransferSide
  items: readonly TransferItem[]
  checkState: TransferCheckState
  query: string
  /** 这一侧分侧 + 搜索之后共有几条（不分页）。 */
  total: number
  /** 当前页码（从 1 起）；不分页时恒为 1。 */
  page: number
  /** 共有几页（至少 1 页）。 */
  pageCount: number
  /** 翻到这一侧的第 page 页。 */
  setPage: (page: number) => void
}

export interface XhTransferRootProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** 不显示出来的名字，写成 aria-label 落在与字段标签同一个部件上；放进字段或渲染了 label 部件时以它们为准。 */
  ariaLabel?: string
  collection?: TransferItem[]
  virtualizers?: Partial<Record<TransferSide, CollectionVirtualizer>>
  value?: string[]
  defaultValue?: string[]
  name?: string
  form?: string
  selection?: string[]
  defaultSelection?: string[]
  searchable?: boolean
  filter?: TransferFilter
  /** 每侧每页几条；给了即分页，两侧各翻各的，缺省不分页。 */
  pageSize?: number
  disabled?: boolean
  readOnly?: boolean
  invalid?: boolean
  /** 必填：至少移过去一项。已选一侧的列表报告 aria-required，没有值时表单的空值占位影子带原生 required。 */
  required?: boolean
  loading?: boolean
  tone?: Tone
  size?: Size
  oneWay?: boolean
  loop?: boolean
  dir?: Direction
  translations?: TransferProps['translations']
  onValueChange?: TransferProps['onValueChange']
  onSelectionChange?: TransferProps['onSelectionChange']
  children?: SlotChildren<TransferRootSlotProps>
}

export function XhTransferRoot({
  ariaLabel,
  collection,
  virtualizers,
  value,
  defaultValue,
  name,
  form,
  selection,
  defaultSelection,
  searchable,
  filter,
  pageSize,
  disabled,
  readOnly,
  invalid,
  required,
  loading,
  tone,
  size,
  oneWay,
  loop,
  dir,
  translations,
  onValueChange,
  onSelectionChange,
  children,
  ...rest
}: XhTransferRootProps): ReactNode {
  const ctx = useTransfer(withXhConfig('transfer', useFormControlProps({
    ariaLabel,
    collection,
    virtualizers,
    value,
    defaultValue,
    name,
    form,
    selection,
    defaultSelection,
    searchable,
    filter,
    pageSize,
    disabled,
    readOnly,
    invalid,
    required,
    loading,
    tone,
    size,
    oneWay,
    loop,
    dir,
    translations,
    onValueChange,
    onSelectionChange,
  })) as TransferProps)
  const api = ctx.api
  return (
    <TransferProvider value={ctx}>
      <div {...mergeReactProps(api.getRootProps(), rest, { ref: ctx.rootRef })}>
        {children != null
          ? renderSlot(children, {
              value: api.value,
              selection: api.selection,
              sourceItems: api.visibleItems('source'),
              targetItems: api.visibleItems('target'),
              canMove: api.canMove,
              checkState: api.checkState,
              isChecked: api.isChecked,
              setValue: api.setValue,
              setSelection: api.setSelection,
              toggle: api.toggle,
              toggleAll: api.toggleAll,
              move: api.move,
            })
          : renderDefaultStructure(api)}
        {api.value.map(value => <input key={value} {...api.getHiddenInputProps({ value })} />)}
        {/* 必填且没有值：补一份空值占位，原生 required 才拦得住空表单 */}
        {api.value.length === 0 && api.required && <input {...mergeReactProps(api.getHiddenInputProps(), { onChange: noop })} />}
      </div>
    </TransferProvider>
  )
}

XhTransferRoot.xhEvents = ['value-change', 'selection-change'] as const

export interface XhTransferPanelProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  children?: SlotChildren<TransferPanelSlotProps>
}

/** 源 / 目标两个面板的共同实现，两侧只在 side 上不同。 */
function TransferPanel({ side, children, ...rest }: XhTransferPanelProps & { side: TransferSide }): ReactNode {
  const ctx = useTransferContext()
  const panel = useMemo(() => ({ side }), [side])
  const api = ctx.api
  return (
    <TransferPanelProvider value={panel}>
      <div {...mergeReactProps(api.getPanelProps(panel), rest)}>
        {renderSlot(children, {
          side,
          // 这一侧当下看得见的条目（分侧 + 搜索之后），不是数据入口：入口叫 collection，是整份全集
          items: api.visibleItems(side),
          checkState: api.checkState(side),
          query: api.query(side),
          total: api.filteredItems(side).length,
          page: api.page(side),
          pageCount: api.pageCount(side),
          setPage: (page: number) => api.setPage(side, page),
        })}
      </div>
    </TransferPanelProvider>
  )
}

export function XhTransferSourcePanel(props: XhTransferPanelProps): ReactNode {
  return <TransferPanel {...props} side="source" />
}

export function XhTransferTargetPanel(props: XhTransferPanelProps): ReactNode {
  return <TransferPanel {...props} side="target" />
}

export interface XhTransferPanelHeaderProps extends ComponentPropsWithRef<'div'> {}
export function XhTransferPanelHeader({ children, ...rest }: XhTransferPanelHeaderProps): ReactNode {
  const ctx = useTransferContext()
  const panel = useTransferPanelContext()
  return <div {...mergeReactProps(ctx.api.getPanelHeaderProps(panel), rest)}>{children}</div>
}

export interface XhTransferPanelTitleProps extends ComponentPropsWithRef<'span'> {}
export function XhTransferPanelTitle({ children, ...rest }: XhTransferPanelTitleProps): ReactNode {
  const ctx = useTransferContext()
  const panel = useTransferPanelContext()
  return <span {...mergeReactProps(ctx.api.getPanelTitleProps(panel), rest)}>{children}</span>
}

export interface XhTransferPanelCountProps extends ComponentPropsWithRef<'span'> {}
/** 只带 data-checked-count / data-count 属性，文案由作者或皮肤层提供。 */
export function XhTransferPanelCount({ children, ...rest }: XhTransferPanelCountProps): ReactNode {
  const ctx = useTransferContext()
  const panel = useTransferPanelContext()
  return <span {...mergeReactProps(ctx.api.getPanelCountProps(panel), rest)}>{children}</span>
}

export interface XhTransferSearchProps extends Omit<ComponentPropsWithRef<'input'>, 'value' | 'defaultValue'> {}
export function XhTransferSearch({ ...rest }: XhTransferSearchProps): ReactNode {
  const ctx = useTransferContext()
  const panel = useTransferPanelContext()
  return (
    <input
      {...mergeReactProps(
        ctx.api.getSearchProps(panel),
        // 搜索串攥在机器里，写回走 onInput。React 要求带 value 的输入交出一个 onChange，
        // 否则在开发构建里逐帧告警；真正的写回不经它
        { onChange: noop },
        rest,
      )}
    />
  )
}

export interface XhTransferListProps extends ComponentPropsWithRef<'div'> {}
export function XhTransferList({ children, ...rest }: XhTransferListProps): ReactNode {
  // 放进字段时字段的标题并进两侧列表的名字（排在面板标题前），说明与错误文案进描述链
  const fieldWiring = useFieldGroupWiring()
  const fieldLabel = useFieldLabelWiring()
  const ctx = useTransferContext()
  const panel = useTransferPanelContext()
  // 容器的 onFocus 是 DOM 的 focus（不冒泡，只在容器自己得焦时接管）。React 的同名合成事件
  // 挂的是冒泡的 focusin，条目得焦也会把它叫起来，那一下会把焦点从条目抢回锚点上
  const bind = useNativeEvents(fieldLabel({ ...fieldWiring, ...ctx.api.getListProps(panel) }), ['onFocus'])
  const listRef = useRef<HTMLDivElement | null>(null)
  // 两侧定高小列表各走一路自绘条：虚拟化时滚动层改为 Virtualizer viewport，
  // 条子仍紧跟在列表后面、贴实际滚动层自己的盒子上，
  // 挂在 root 这个定位盒上（面板不定位，root 才是列表的定位祖先）；两条轴都摆——皮肤给的是两轴 overflow: auto。
  // 页内宿主走 6px 缺省档；横条的正负按排版方向算，把机器里那份 dir 交过去
  const bars = useScrollbars({
    scrollable: () => ctx.service.prop('virtualizers')?.[panel.side]?.getViewportElement() ?? listRef.current,
    axes: ['vertical', 'horizontal'],
    anchor: 'layer',
    props: () => ({ dir: ctx.service.prop('dir') }),
  })
  // 搬运、搜索筛选与空态显隐都会挪动列表在壳内的位置与尺寸：每次提交后重量一次偏移盒
  useEffect(() => bars.measure())
  return (
    <>
      <div {...mergeReactProps(bind.attrs, rest, { ref: bind.ref }, { ref: listRef })}>
        {children}
      </div>
      {bars.render()}
    </>
  )
}

export interface XhTransferSelectAllTriggerProps extends ComponentPropsWithRef<'button'> {}
/** 使用原生 button，激活与禁用交给平台。 */
export function XhTransferSelectAllTrigger({ children, ...rest }: XhTransferSelectAllTriggerProps): ReactNode {
  const ctx = useTransferContext()
  const panel = useTransferPanelContext()
  return (
    <button {...mergeReactProps(ctx.api.getSelectAllTriggerProps(panel), rest)}>
      {children}
    </button>
  )
}

export interface XhTransferEmptyProps extends ComponentPropsWithRef<'div'> {}
/** 空态占位：写在面板中、list 的兄弟；本侧没有可见条目时由连接层显示它。 */
export function XhTransferEmpty({ children, ...rest }: XhTransferEmptyProps): ReactNode {
  const ctx = useTransferContext()
  const panel = useTransferPanelContext()
  return <div {...mergeReactProps(ctx.api.getEmptyProps(panel), rest)}>{children}</div>
}

export interface XhTransferLoadingProps extends ComponentPropsWithRef<'div'> {}
/** 在途占位：与空态占位同一个位置，取数期间显示。 */
export function XhTransferLoading({ children, ...rest }: XhTransferLoadingProps): ReactNode {
  const ctx = useTransferContext()
  const panel = useTransferPanelContext()
  return <div {...mergeReactProps(ctx.api.getLoadingProps(panel), rest)}>{children}</div>
}

export interface XhTransferGroupProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  value: string
}
export function XhTransferGroup({ value, children, ...rest }: XhTransferGroupProps): ReactNode {
  const ctx = useTransferContext()
  const panel = useTransferPanelContext()
  // 两侧各挂一份同名分组，身份连 side 一起算，两边的标题 id 才不撞
  const group = useMemo(() => ({ value, side: panel.side }), [value, panel.side])
  return (
    <TransferGroupProvider value={group}>
      <div {...mergeReactProps(ctx.api.getGroupProps(group), rest)}>
        {children}
      </div>
    </TransferGroupProvider>
  )
}

export interface XhTransferGroupLabelProps extends ComponentPropsWithRef<'span'> {}
export function XhTransferGroupLabel({ children, ...rest }: XhTransferGroupLabelProps): ReactNode {
  const ctx = useTransferContext()
  const group = useTransferGroupContext()
  return <span {...mergeReactProps(ctx.api.getGroupLabelProps(group), rest)}>{children}</span>
}

/** 本条目持有焦点时，value 变更重新报告焦点条目，卸载时上报本侧列表失焦。 */
function useItemFocusReport(
  service: Service<TransferSchema>,
  el: RefObject<HTMLElement | null>,
  value: string,
  side: TransferSide,
): void {
  const previous = useRef(value)
  useEffect(() => {
    const prev = previous.current
    previous.current = value
    if (prev === value)
      return
    if (service.getStatus() !== 'Started')
      return
    if (service.prop('virtualizers')?.[side])
      return
    if (el.current && service.scope.getActiveElement() === el.current)
      service.send({ type: 'ITEM.FOCUS', side, value })
  }, [service, el, value, side])

  // 按「本条目当下正持有焦点」判定，不按 value 比对。
  // 用 layout effect：节点从文档里摘掉之前它的清理就跑完了，此刻焦点还在它身上；
  // 排到 passive 那一档就晚了，那时节点已经离场、焦点早掉回 body
  useIsomorphicLayoutEffect(() => () => {
    // 整组一起卸载时根部件先停机，此刻送事件会在 dev 下抛
    if (service.getStatus() !== 'Started')
      return
    if (el.current && service.scope.getActiveElement() === el.current)
      service.send({ type: 'LIST.BLUR', side })
  }, [service, el, side])
}

export interface XhTransferItemProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  value: string
}
export function XhTransferItem({ value, children, ...rest }: XhTransferItemProps): ReactNode {
  const ctx = useTransferContext()
  const panel = useTransferPanelContext()
  // 条目只报值与所属面板，禁用与标签回 collection 里查；同一 value 的两侧节点靠 side 分身份
  const item = useMemo(() => ({ value, side: panel.side }), [value, panel.side])
  const el = useRef<HTMLElement | null>(null)
  // 条目的聚焦上报不冒泡，改装成原生监听器
  const bind = useNativeEvents(ctx.api.getItemProps(item), ['onFocus'])
  useItemFocusReport(ctx.service, el, value, panel.side)
  return (
    <TransferItemProvider value={item}>
      <div
        {...mergeReactProps(
          bind.attrs,
          rest,
          { ref: bind.ref },
          { ref: (n: HTMLDivElement | null) => { el.current = n } },
        )}
      >
        {children}
      </div>
    </TransferItemProvider>
  )
}

export interface XhTransferItemTextProps extends ComponentPropsWithRef<'span'> {}
export function XhTransferItemText({ children, ...rest }: XhTransferItemTextProps): ReactNode {
  const ctx = useTransferContext()
  const item = useTransferItemContext()
  return <span {...mergeReactProps(ctx.api.getItemTextProps(item), rest)}>{children}</span>
}

/** 条目的第 2 行副文本，跨文字槽、走 muted 档。 */
export interface XhTransferItemDescriptionProps extends ComponentPropsWithRef<'span'> {}
export function XhTransferItemDescription({ children, ...rest }: XhTransferItemDescriptionProps): ReactNode {
  const ctx = useTransferContext()
  const item = useTransferItemContext()
  return <span {...mergeReactProps(ctx.api.getItemDescriptionProps(item), rest)}>{children}</span>
}

/** 条目行尾的作者内容（计数、徽标）。 */
export interface XhTransferItemSuffixProps extends ComponentPropsWithRef<'span'> {}
export function XhTransferItemSuffix({ children, ...rest }: XhTransferItemSuffixProps): ReactNode {
  const ctx = useTransferContext()
  const item = useTransferItemContext()
  return <span {...mergeReactProps(ctx.api.getItemSuffixProps(item), rest)}>{children}</span>
}

export interface XhTransferItemCheckboxProps extends ComponentPropsWithRef<'span'> {}
export function XhTransferItemCheckbox({ children, ...rest }: XhTransferItemCheckboxProps): ReactNode {
  const ctx = useTransferContext()
  const item = useTransferItemContext()
  return <span {...mergeReactProps(ctx.api.getItemCheckboxProps(item), rest)}>{children}</span>
}

export interface XhTransferToTargetTriggerProps extends ComponentPropsWithRef<'button'> {}
/** 使用原生 button，激活与禁用交给平台。 */
export function XhTransferToTargetTrigger({ children, ...rest }: XhTransferToTargetTriggerProps): ReactNode {
  const ctx = useTransferContext()
  return (
    <button {...mergeReactProps(ctx.api.getToTargetTriggerProps(), rest)}>
      {children}
    </button>
  )
}

export interface XhTransferToSourceTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhTransferToSourceTrigger({ children, ...rest }: XhTransferToSourceTriggerProps): ReactNode {
  const ctx = useTransferContext()
  return (
    <button {...mergeReactProps(ctx.api.getToSourceTriggerProps(), rest)}>
      {children}
    </button>
  )
}

function noop(): void {}

/** 标准结构里各部件对应的组件。 */
const TRANSFER_PARTS = {
  'source-panel': XhTransferSourcePanel,
  'target-panel': XhTransferTargetPanel,
  'panel-header': XhTransferPanelHeader,
  'panel-title': XhTransferPanelTitle,
  'panel-count': XhTransferPanelCount,
  'select-all-trigger': XhTransferSelectAllTrigger,
  'search': XhTransferSearch,
  'list': XhTransferList,
  'item': XhTransferItem,
  'item-checkbox': XhTransferItemCheckbox,
  'item-text': XhTransferItemText,
  'item-description': XhTransferItemDescription,
  'empty': XhTransferEmpty,
  'loading': XhTransferLoading,
  'to-target-trigger': XhTransferToTargetTrigger,
  'to-source-trigger': XhTransferToSourceTrigger,
}

/**
 * 未写 children 时铺开的整套结构：照 headless 的 transferStructure 渲，
 * 与 Web Components 不写部件时元素生成的节点出自同一份。表单影子仍由根按值装配在后面。
 */
function renderDefaultStructure(api: TransferApi): ReactNode[] {
  return renderStructure(transferStructure(api), TRANSFER_PARTS)
}
