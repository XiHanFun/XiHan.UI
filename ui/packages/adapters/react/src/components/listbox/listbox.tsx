/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 listbox 相关实现。

import type { Direction, Orientation, Size, Tone } from '@xihan-ui/core'
import type { CollectionVirtualizer, ListboxApi, ListboxNode, ListboxNodeMeta, ListboxSchema, ListboxSelectionMode, ListboxTranslations } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { listboxStructure } from '@xihan-ui/headless'
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
  ListboxGroupProvider,
  ListboxItemProvider,
  ListboxProvider,
  useListboxContext,
  useListboxGroupContext,
  useListboxItemContext,
} from './context'
import { useListbox } from './use-listbox'

type ListboxProps = ListboxSchema['props']

/** 函数式 children 的载荷：选中集合、选择模式与焦点锚点，以及判定选中与整份赋值、单选、切换的命令。 */
export type ListboxRootSlotProps = Pick<
  ListboxApi,
  'value' | 'selectionMode' | 'focusedValue' | 'isSelected' | 'setValue' | 'select' | 'toggle'
>

/** 根上自有的取值；defaultValue 与 dir 与原生的同名属性含义不同，由这里接管。 */
type RootElementProps = Omit<ComponentPropsWithRef<'div'>, 'children' | 'defaultValue' | 'dir'>

export interface XhListboxRootProps extends RootElementProps {
  /** 不显示出来的名字，写成 aria-label 落在与字段标签同一个部件上；放进字段或渲染了 label 部件时以它们为准。 */
  ariaLabel?: string
  collection?: ListboxNode[]
  virtualizer?: CollectionVirtualizer
  /** 标题文字。提供后不必再写 label 部件。 */
  label?: ReactNode
  value?: string | string[]
  defaultValue?: string | string[]
  selectionMode?: ListboxSelectionMode
  disabled?: boolean
  /** 只读：条目照常浏览与聚焦，但选中值不可修改。 */
  readOnly?: boolean
  invalid?: boolean
  loading?: boolean
  tone?: Tone
  size?: Size
  loop?: boolean
  typeahead?: boolean
  dir?: Direction
  orientation?: Orientation
  translations?: Partial<ListboxTranslations>
  onValueChange?: ListboxProps['onValueChange']
  /** 不给 children 时空态占位的内容；未写时取 translations.empty。 */
  empty?: ReactNode
  /** 每个条目的自定义内容；未提供时使用 collection 中的 label。 */
  renderItem?: (node: ListboxNodeMeta) => ReactNode
  /** 只接管条目行首那一格；其余槽仍由数据铺。 */
  renderItemPrefix?: (node: ListboxNodeMeta) => ReactNode
  /** 只接管条目行尾那一格；其余槽仍由数据铺。 */
  renderItemSuffix?: (node: ListboxNodeMeta) => ReactNode
  children?: SlotChildren<ListboxRootSlotProps>
}

export function XhListboxRoot({
  ariaLabel,
  collection,
  virtualizer,
  value,
  defaultValue,
  selectionMode,
  disabled,
  readOnly,
  invalid,
  loading,
  tone,
  size,
  loop,
  typeahead,
  dir,
  orientation,
  translations,
  onValueChange,
  children,
  label,
  empty,
  renderItem,
  renderItemPrefix,
  renderItemSuffix,
  ...rest
}: XhListboxRootProps): ReactNode {
  const ctx = useListbox(withXhConfig('listbox', useFormControlProps({
    ariaLabel,
    collection,
    virtualizer,
    value,
    defaultValue,
    selectionMode,
    disabled,
    readOnly,
    invalid,
    loading,
    tone,
    size,
    loop,
    typeahead,
    dir,
    orientation,
    translations,
    onValueChange,
  })) as ListboxProps)
  const api = ctx.api

  const body = children != null
    ? renderSlot(children, {
        value: api.value,
        selectionMode: api.selectionMode,
        focusedValue: api.focusedValue,
        isSelected: api.isSelected,
        setValue: api.setValue,
        select: api.select,
        toggle: api.toggle,
      })
    : renderDefaultStructure(api, { label, empty, renderItem, renderItemPrefix, renderItemSuffix })

  return (
    <ListboxProvider value={ctx}>
      <div {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{body}</div>
    </ListboxProvider>
  )
}

XhListboxRoot.xhEvents = ['value-change'] as const

export interface XhListboxLabelProps extends ComponentPropsWithRef<'span'> {}
export function XhListboxLabel({ children, ...rest }: XhListboxLabelProps): ReactNode {
  const ctx = useListboxContext()
  // 渲出来了才登记：可聚焦部件的 aria-labelledby 只在这个节点真在场时才指过来
  const { registerLabel } = ctx
  useEffect(() => registerLabel(), [registerLabel])
  return <span {...mergeReactProps(ctx.api.getLabelProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhListboxContentProps extends ComponentPropsWithRef<'div'> {}
/** 列表框本体：条目放在其中，方向键与连打检索都落在这一层。 */
export function XhListboxContent({ children, ...rest }: XhListboxContentProps): ReactNode {
  const ctx = useListboxContext()
  // content 自身得焦时把焦点转交给锚点条目，收的是不冒泡的 DOM focus：合成事件挂在
  // 冒泡的 focusin 上，后代条目得焦也会把它叫起来，判据整个变味。
  // onFocusOut 不动——它经归一化落到 React 的 onBlur，挂的正是冒泡的 focusout
  // 放进表单字段时，字段的标题与说明接到列表上：读屏进列表时念字段名与说明
  const fieldWiring = useFieldGroupWiring()
  const fieldLabel = useFieldLabelWiring()
  const bind = useNativeEvents(fieldLabel({ ...fieldWiring, ...ctx.api.getContentProps() as Record<string, unknown> }), ['onFocus'])
  const contentRef = useRef<HTMLDivElement | null>(null)
  // 定高小列表走自绘条：条子是 content 的兄弟、挂在 root 这个定位盒上，贴在 content 自己的盒子上
  // （root 里还有标题与占位，贴壳边会盖到它们）；两条轴都摆——皮肤给的是两轴 overflow: auto。
  // 页内宿主走 6px 缺省档；横条的正负按排版方向算，把机器里那份 dir 交过去
  const bars = useScrollbars({
    scrollable: () => contentRef.current,
    axes: ['vertical', 'horizontal'],
    anchor: 'layer',
    props: () => ({ dir: ctx.service.prop('dir') }),
  })
  // 条目增减、占位显隐都会挪动列表在壳内的位置与尺寸：每次提交后重量一次偏移盒
  useEffect(() => bars.measure())
  return (
    <>
      <div {...mergeReactProps(bind.attrs, rest as Record<string, unknown>, { ref: bind.ref }, { ref: contentRef })}>
        {children}
      </div>
      {bars.render()}
    </>
  )
}

export interface XhListboxEmptyProps extends ComponentPropsWithRef<'div'> {}
/** 空态占位：写在 root 中、content 的兄弟，不进入列表框的拥有关系。 */
export function XhListboxEmpty({ children, ...rest }: XhListboxEmptyProps): ReactNode {
  const ctx = useListboxContext()
  return <div {...mergeReactProps(ctx.api.getEmptyProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhListboxLoadingProps extends ComponentPropsWithRef<'div'> {}
/** 在途占位：与空态占位同一个位置，取数期间显示。 */
export function XhListboxLoading({ children, ...rest }: XhListboxLoadingProps): ReactNode {
  const ctx = useListboxContext()
  return <div {...mergeReactProps(ctx.api.getLoadingProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhListboxLoadMoreTriggerProps extends ComponentPropsWithRef<'button'> {}
/** 取下一页的入口：点击后的行为归作者，这里只把在途与禁用两档固定为不可按下。 */
export function XhListboxLoadMoreTrigger({ children, ...rest }: XhListboxLoadMoreTriggerProps): ReactNode {
  const ctx = useListboxContext()
  return <button {...mergeReactProps(ctx.api.getLoadMoreTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

export interface XhListboxGroupProps extends ComponentPropsWithRef<'div'> {
  value: string
}
/** 分组容器：条目照常挂在其中，role=group 是列表框允许拥有的两种子节点之一。 */
export function XhListboxGroup({ value, children, ...rest }: XhListboxGroupProps): ReactNode {
  const ctx = useListboxContext()
  const group = useMemo(() => ({ value }), [value])
  return (
    <ListboxGroupProvider value={group}>
      <div {...mergeReactProps(ctx.api.getGroupProps(group) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
    </ListboxGroupProvider>
  )
}

export interface XhListboxGroupLabelProps extends ComponentPropsWithRef<'span'> {}
export function XhListboxGroupLabel({ children, ...rest }: XhListboxGroupLabelProps): ReactNode {
  const ctx = useListboxContext()
  const group = useListboxGroupContext()
  return <span {...mergeReactProps(ctx.api.getGroupLabelProps(group) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhListboxItemProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  value: string
  /** 默认交给 connect 查询 collection，写死 false 会覆盖数据中的禁用。 */
  disabled?: boolean
}
export function XhListboxItem({ value, disabled, children, ...rest }: XhListboxItemProps): ReactNode {
  const ctx = useListboxContext()
  const item = useMemo(() => ({ value, disabled }), [value, disabled])
  const itemEl = useRef<HTMLElement | null>(null)
  const previous = useRef(value)
  // 条目的聚焦上报不冒泡，改装成原生监听器
  const bind = useNativeEvents(ctx.api.getItemProps(item) as Record<string, unknown>, ['onFocus'])

  // 本条目持有焦点时，value 变更重报焦点条目
  useEffect(() => {
    const prev = previous.current
    previous.current = value
    if (prev === value)
      return
    const svc = ctx.service
    if (svc.getStatus() !== 'Started')
      return
    if (svc.prop('virtualizer') && svc.prop('collection')?.some(node => node.value === value))
      return
    if (itemEl.current && svc.scope.getActiveElement() === itemEl.current)
      svc.send({ type: 'ITEM.FOCUS', value })
  }, [ctx.service, value])

  // 卸载时上报列表失焦：按「本节点当下正持有焦点」判定，不按 value 比对
  useIsomorphicLayoutEffect(() => () => {
    const svc = ctx.service
    if (svc.getStatus() !== 'Started')
      return
    if (itemEl.current && svc.scope.getActiveElement() === itemEl.current)
      svc.send({ type: 'LIST.BLUR' })
  }, [ctx.service, value])

  return (
    <ListboxItemProvider value={item}>
      <div
        {...mergeReactProps(
          bind.attrs,
          rest as Record<string, unknown>,
          { ref: bind.ref },
          { ref: (el: HTMLDivElement | null) => { itemEl.current = el } },
        )}
      >
        {children}
      </div>
    </ListboxItemProvider>
  )
}

export interface XhListboxItemTextProps extends ComponentPropsWithRef<'span'> {}
export function XhListboxItemText({ children, ...rest }: XhListboxItemTextProps): ReactNode {
  const ctx = useListboxContext()
  const item = useListboxItemContext()
  return <span {...mergeReactProps(ctx.api.getItemTextProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

/** 条目行首的作者内容（图标、色块、头像），对读屏隐藏。 */
export interface XhListboxItemPrefixProps extends ComponentPropsWithRef<'span'> {}
export function XhListboxItemPrefix({ children, ...rest }: XhListboxItemPrefixProps): ReactNode {
  const ctx = useListboxContext()
  const item = useListboxItemContext()
  return <span {...mergeReactProps(ctx.api.getItemPrefixProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

/** 条目行尾的作者内容（计数、徽标）。 */
export interface XhListboxItemSuffixProps extends ComponentPropsWithRef<'span'> {}
export function XhListboxItemSuffix({ children, ...rest }: XhListboxItemSuffixProps): ReactNode {
  const ctx = useListboxContext()
  const item = useListboxItemContext()
  return <span {...mergeReactProps(ctx.api.getItemSuffixProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

/** 条目的第 2 行副文本，跨文字槽、走 muted 档。 */
export interface XhListboxItemDescriptionProps extends ComponentPropsWithRef<'span'> {}
export function XhListboxItemDescription({ children, ...rest }: XhListboxItemDescriptionProps): ReactNode {
  const ctx = useListboxContext()
  const item = useListboxItemContext()
  return <span {...mergeReactProps(ctx.api.getItemDescriptionProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhListboxItemIndicatorProps extends ComponentPropsWithRef<'span'> {}
export function XhListboxItemIndicator({ children, ...rest }: XhListboxItemIndicatorProps): ReactNode {
  const ctx = useListboxContext()
  const item = useListboxItemContext()
  return <span {...mergeReactProps(ctx.api.getItemIndicatorProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

/** 标准结构里各部件对应的组件。 */
const LISTBOX_PARTS = {
  'label': XhListboxLabel,
  'content': XhListboxContent,
  'item': XhListboxItem,
  'item-prefix': XhListboxItemPrefix,
  'item-text': XhListboxItemText,
  'item-description': XhListboxItemDescription,
  'item-suffix': XhListboxItemSuffix,
  'item-indicator': XhListboxItemIndicator,
  'empty': XhListboxEmpty,
  'loading': XhListboxLoading,
}

interface ListboxStructureContent {
  label?: ReactNode
  empty?: ReactNode
  renderItem?: (node: ListboxNodeMeta) => ReactNode
  renderItemPrefix?: (node: ListboxNodeMeta) => ReactNode
  renderItemSuffix?: (node: ListboxNodeMeta) => ReactNode
}

/**
 * 未写 children 时铺开的整套结构，作者只提供数据：照 headless 的 listboxStructure 渲，
 * 与 Web Components 不写部件时元素生成的节点出自同一份。文字以外的标题、条目文字与行首行尾由对应渲染函数接管。
 */
function renderDefaultStructure(api: ListboxApi, content: ListboxStructureContent): ReactNode[] {
  const { label, empty, renderItem, renderItemPrefix, renderItemSuffix } = content
  const slotted: Readonly<Record<string, boolean>> = {
    'label': label != null && typeof label !== 'string',
    'empty': empty != null && typeof empty !== 'string',
    'item': renderItem != null,
    'item-prefix': renderItemPrefix != null,
    'item-suffix': renderItemSuffix != null,
  }
  const nodes = listboxStructure(api, {
    label: typeof label === 'string' ? label : undefined,
    empty: typeof empty === 'string' ? empty : undefined,
    slotted: name => slotted[name] === true,
  })
  return renderStructure(nodes, LISTBOX_PARTS, (node) => {
    const meta = node.data as ListboxNodeMeta
    switch (node.slot?.name) {
      case 'label':
        return label
      case 'empty':
        return empty
      case 'item':
        return renderItem?.(meta) ?? meta.label
      case 'item-prefix':
        return renderItemPrefix?.(meta)
      case 'item-suffix':
        return renderItemSuffix?.(meta)
      default:
        return undefined
    }
  })
}
