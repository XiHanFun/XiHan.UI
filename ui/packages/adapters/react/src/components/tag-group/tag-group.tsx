/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 tag group 相关实现。

import type { Direction, Orientation, Size, Tone } from '@xihan-ui/core'
import type { TagGroupApi, TagGroupNode, TagGroupNodeMeta, TagGroupSchema, TagGroupSelectionMode, TagGroupTranslations, TagVariant } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { tagGroupStructure } from '@xihan-ui/headless'
import { useEffect, useMemo, useRef } from 'react'
import { withXhConfig } from '../../config/config'
import { useIsomorphicLayoutEffect } from '../../runtime/layout-effect'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { renderSlot } from '../../runtime/slot-content'
import { renderStructure } from '../../runtime/structure'
import { useFieldGroupWiring, useFieldLabelWiring } from '../field/use-field-control'
import { useFormControlProps } from '../form/use-form-control'
import { TagGroupItemProvider, TagGroupProvider, useTagGroupContext, useTagGroupItemContext } from './context'
import { useTagGroup } from './use-tag-group'

type TagGroupProps = TagGroupSchema['props']

/** 函数式 children 的载荷：选中集合、选择模式与焦点锚点，以及判定选中与整份赋值、单选、切换、移除的命令。 */
export type TagGroupRootSlotProps = Pick<
  TagGroupApi,
  'value' | 'selectionMode' | 'focusedValue' | 'isSelected' | 'setValue' | 'select' | 'toggle' | 'deleteItem'
>

/** 根上自有的取值；defaultValue 与 dir 与原生的同名属性含义不同，由这里接管。 */
type RootElementProps = Omit<ComponentPropsWithRef<'div'>, 'children' | 'defaultValue' | 'dir'>

export interface XhTagGroupRootProps extends RootElementProps {
  /** 不显示出来的名字，写成 aria-label 落在与字段标签同一个部件上；放进字段或渲染了 label 部件时以它们为准。 */
  ariaLabel?: string
  collection?: TagGroupNode[]
  /** 标题内容。提供后不必再写 label 部件。 */
  label?: ReactNode
  value?: string | string[]
  defaultValue?: string | string[]
  selectionMode?: TagGroupSelectionMode
  /** 整组开放移除；条目自身写了的以条目为准。 */
  deletable?: boolean
  disabled?: boolean
  /** 只读：标签照常浏览与聚焦，但选中值不可修改、也不可移除。 */
  readOnly?: boolean
  /** 校验失败：标签列表报告 aria-invalid，根与列表带 data-invalid。 */
  invalid?: boolean
  /** 必填：根与列表带 data-required。 */
  required?: boolean
  loop?: boolean
  dir?: Direction
  orientation?: Orientation
  typeahead?: boolean
  variant?: TagVariant
  tone?: Tone
  size?: Size
  translations?: Partial<TagGroupTranslations>
  onValueChange?: TagGroupProps['onValueChange']
  /** 只报告用户要移除该标签，条目的去留由宿主修改自己的数据。 */
  onItemDelete?: TagGroupProps['onItemDelete']
  /** 每个条目的自定义内容；未提供时使用 collection 中的 label。 */
  renderItem?: (node: TagGroupNodeMeta) => ReactNode
  children?: SlotChildren<TagGroupRootSlotProps>
}

/** 一排可选、可移除的标签。回传值恒为数组，单选时长度 ≤ 1。 */
export function XhTagGroupRoot({
  ariaLabel,
  collection,
  label,
  value,
  defaultValue,
  selectionMode,
  deletable,
  disabled,
  readOnly,
  invalid,
  required,
  loop,
  dir,
  orientation,
  typeahead,
  variant,
  tone,
  size,
  translations,
  onValueChange,
  onItemDelete,
  renderItem,
  children,
  ...rest
}: XhTagGroupRootProps): ReactNode {
  const ctx = useTagGroup(withXhConfig('tag-group', useFormControlProps({
    ariaLabel,
    collection,
    value,
    defaultValue,
    selectionMode,
    deletable,
    disabled,
    readOnly,
    invalid,
    required,
    loop,
    dir,
    orientation,
    typeahead,
    variant,
    tone,
    size,
    translations,
    onValueChange,
    onItemDelete,
  })) as TagGroupProps)
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
        deleteItem: api.deleteItem,
      })
    : renderDefaultStructure(api, { label, renderItem })

  return (
    <TagGroupProvider value={ctx}>
      <div {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{body}</div>
    </TagGroupProvider>
  )
}

XhTagGroupRoot.xhEvents = ['value-change', 'item-delete'] as const

export interface XhTagGroupLabelProps extends ComponentPropsWithRef<'span'> {}
export function XhTagGroupLabel({ children, ...rest }: XhTagGroupLabelProps): ReactNode {
  const ctx = useTagGroupContext()
  // 渲出来了才登记：可聚焦部件的 aria-labelledby 只在这个节点真在场时才指过来
  const { registerLabel } = ctx
  useEffect(() => registerLabel(), [registerLabel])
  return <span {...mergeReactProps(ctx.api.getLabelProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhTagGroupListProps extends ComponentPropsWithRef<'div'> {}

/** 标签本体所在的层：键盘在这里收口，方向键、连打与移除都落在它上面。 */
export function XhTagGroupList({ children, ...rest }: XhTagGroupListProps): ReactNode {
  const ctx = useTagGroupContext()
  // list 自身得焦时把焦点转交给锚点标签，收的是不冒泡的 DOM focus：合成事件挂在
  // 冒泡的 focusin 上，后代标签得焦也会把它叫起来，判据整个变味。
  // onFocusOut 不动——它经归一化落到 React 的 onBlur，挂的正是冒泡的 focusout
  // 放进表单字段时，字段的标题与说明接到标签列表上：读屏进列表时念字段名与说明
  const fieldWiring = useFieldGroupWiring()
  const fieldLabel = useFieldLabelWiring()
  const bind = useNativeEvents(fieldLabel({ ...fieldWiring, ...ctx.api.getListProps() as Record<string, unknown> }), ['onFocus'])
  return (
    <div {...mergeReactProps(bind.attrs, rest as Record<string, unknown>, { ref: bind.ref })}>
      {children}
    </div>
  )
}

export interface XhTagGroupItemProps extends Omit<ComponentPropsWithRef<'span'>, 'value'> {
  value: string
  /** 默认交给 connect 查询 collection，写死 false 会覆盖数据中的声明。 */
  disabled?: boolean
  deletable?: boolean
}

/** 一个标签：渲染为 tag 的 root（data-scope="tag"），组把行角色、Tab 停靠点、选中与锚点叠加在它上面。使用 span 才能随文排列，选中与移除的键盘路径都在 list 上。 */
export function XhTagGroupItem({ value, disabled, deletable, children, ...rest }: XhTagGroupItemProps): ReactNode {
  const ctx = useTagGroupContext()
  const item = useMemo(() => ({ value, disabled, deletable }), [value, disabled, deletable])
  const itemEl = useRef<HTMLElement | null>(null)
  const previous = useRef(value)
  // 标签的聚焦上报不冒泡，改装成原生监听器：留在合成事件上，摘除钮得焦也会被算成标签得焦
  const bind = useNativeEvents(ctx.api.getItemProps(item) as Record<string, unknown>, ['onFocus'])

  // 本标签持有焦点时，value 变更重报焦点条目
  useEffect(() => {
    const prev = previous.current
    previous.current = value
    if (prev === value)
      return
    const svc = ctx.service
    if (svc.getStatus() !== 'Started')
      return
    if (itemEl.current && svc.scope.getActiveElement() === itemEl.current)
      svc.send({ type: 'ITEM.FOCUS', value })
  }, [ctx.service, value])

  // 卸载时上报整组失焦：按「本节点当下正持有焦点」判定，不按 value 比对
  useIsomorphicLayoutEffect(() => () => {
    const svc = ctx.service
    if (svc.getStatus() !== 'Started')
      return
    if (itemEl.current && svc.scope.getActiveElement() === itemEl.current)
      svc.send({ type: 'LIST.BLUR' })
  }, [ctx.service])

  return (
    <TagGroupItemProvider value={{ item }}>
      <span
        {...mergeReactProps(
          bind.attrs,
          rest as Record<string, unknown>,
          { ref: bind.ref },
          { ref: (el: HTMLSpanElement | null) => { itemEl.current = el } },
        )}
      >
        {children}
      </span>
    </TagGroupItemProvider>
  )
}

export interface XhTagGroupCellProps extends ComponentPropsWithRef<'span'> {}

/** 标签中的格子：移除按钮可聚焦，只有位于 gridcell 下才是合法嵌套。 */
export function XhTagGroupCell({ children, ...rest }: XhTagGroupCellProps): ReactNode {
  const ctx = useTagGroupContext()
  const { item } = useTagGroupItemContext()
  return <span {...mergeReactProps(ctx.api.getCellProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhTagGroupItemIndicatorProps extends ComponentPropsWithRef<'span'> {}

/** 选中标记：落在格子内、文字之后与摘除钮之前，选中时展示、未选中时收起；内容留空时由皮肤绘制对号。 */
export function XhTagGroupItemIndicator({ children, ...rest }: XhTagGroupItemIndicatorProps): ReactNode {
  const ctx = useTagGroupContext()
  const { item } = useTagGroupItemContext()
  return <span {...mergeReactProps(ctx.api.getItemIndicatorProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhTagGroupItemTextProps extends ComponentPropsWithRef<'span'> {}

/** 标签文字：渲染为 tag 的 label。 */
export function XhTagGroupItemText({ children, ...rest }: XhTagGroupItemTextProps): ReactNode {
  const ctx = useTagGroupContext()
  const { item } = useTagGroupItemContext()
  return <span {...mergeReactProps(ctx.api.getItemTextProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhTagGroupItemDeleteTriggerProps extends ComponentPropsWithRef<'button'> {}

/** 移除按钮：渲染为所在标签那份 tag 的 close-trigger，不占 Tab 位；整组未开放移除时收起，不保留一个不可按下的关闭按钮。 */
export function XhTagGroupItemDeleteTrigger({ children, ...rest }: XhTagGroupItemDeleteTriggerProps): ReactNode {
  const ctx = useTagGroupContext()
  const { item } = useTagGroupItemContext()
  return <button {...mergeReactProps(ctx.api.getItemDeleteTriggerProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

/** 标准结构里各部件对应的组件；标签、标签文字与摘除钮委派给 tag，按「tag/部件名」找。 */
const TAG_GROUP_PARTS = {
  'label': XhTagGroupLabel,
  'list': XhTagGroupList,
  'tag/item': XhTagGroupItem,
  'cell': XhTagGroupCell,
  'tag/item-text': XhTagGroupItemText,
  'item-indicator': XhTagGroupItemIndicator,
  'tag/item-delete-trigger': XhTagGroupItemDeleteTrigger,
}

interface TagGroupStructureContent {
  label?: ReactNode
  renderItem?: (node: TagGroupNodeMeta) => ReactNode
}

/**
 * 未写 children 时铺开的整套结构，作者只提供数据：照 headless 的 tagGroupStructure 渲，
 * 与 Web Components 不写部件时元素生成的节点出自同一份。文字以外的标题与标签文字由对应渲染函数接管。
 */
function renderDefaultStructure(api: TagGroupApi, content: TagGroupStructureContent): ReactNode[] {
  const { label, renderItem } = content
  const slotted: Readonly<Record<string, boolean>> = {
    label: label != null && typeof label !== 'string',
    item: renderItem != null,
  }
  const nodes = tagGroupStructure(api, {
    label: typeof label === 'string' ? label : undefined,
    slotted: name => slotted[name] === true,
  })
  return renderStructure(nodes, TAG_GROUP_PARTS, (node) => {
    const meta = node.data as TagGroupNodeMeta
    switch (node.slot?.name) {
      case 'label':
        return label
      case 'item':
        return renderItem?.(meta) ?? meta.label
      default:
        return undefined
    }
  })
}
