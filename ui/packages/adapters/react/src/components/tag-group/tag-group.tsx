import type { Direction, Orientation, Size, Tone } from '@xihan-ui/core'
import type { TagGroupApi, TagGroupNode, TagGroupNodeMeta, TagGroupSchema, TagGroupSelectionMode, TagGroupTranslations, TagVariant } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { useEffect, useMemo, useRef } from 'react'
import { withXhConfig } from '../../config/config'
import { useIsomorphicLayoutEffect } from '../../runtime/layout-effect'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { renderSlot } from '../../runtime/slot-content'
import { useFormControlProps } from '../form/use-form-control'
import { TagGroupItemProvider, TagGroupProvider, useTagGroupContext, useTagGroupItemContext } from './context'
import { useTagGroup } from './use-tag-group'

type TagGroupProps = TagGroupSchema['props']

/** 函数式 children 的载荷：选中集合、选择模式与焦点锚点，以及判定选中与整份赋值、单选、切换、摘除的命令。 */
export type TagGroupRootSlotProps = Pick<
  TagGroupApi,
  'value' | 'selectionMode' | 'focusedValue' | 'isSelected' | 'setValue' | 'select' | 'toggle' | 'deleteItem'
>

/** 根上自有的那些取值；defaultValue 与 dir 与原生的同名属性含义不同，由这里接管。 */
type RootElementProps = Omit<ComponentPropsWithRef<'div'>, 'children' | 'defaultValue' | 'dir'>

export interface XhTagGroupRootProps extends RootElementProps {
  collection?: TagGroupNode[]
  /** 标题内容。给了它就不必再写 label 部件。 */
  label?: ReactNode
  value?: string | string[]
  defaultValue?: string | string[]
  selectionMode?: TagGroupSelectionMode
  /** 整组开放摘除；条目自己写了的以条目为准。 */
  deletable?: boolean
  disabled?: boolean
  /** 只读：标签照常浏览与聚焦，但选中值改不动、也摘不掉。 */
  readOnly?: boolean
  loop?: boolean
  dir?: Direction
  orientation?: Orientation
  typeahead?: boolean
  variant?: TagVariant
  tone?: Tone
  size?: Size
  translations?: Partial<TagGroupTranslations>
  onValueChange?: TagGroupProps['onValueChange']
  /** 只报「用户要摘这一枚」，条目的去留由宿主改自己的数据。 */
  onItemDelete?: TagGroupProps['onItemDelete']
  /** 每个条目的自定义内容；不给就用 collection 里的 label。 */
  renderItem?: (node: TagGroupNodeMeta) => ReactNode
  children?: SlotChildren<TagGroupRootSlotProps>
}

/** 一排可选、可摘的标签。回传值恒为数组，单选时长度 ≤ 1。 */
export function XhTagGroupRoot({
  collection,
  label,
  value,
  defaultValue,
  selectionMode,
  deletable,
  disabled,
  readOnly,
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
    collection,
    value,
    defaultValue,
    selectionMode,
    deletable,
    disabled,
    readOnly,
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
    : collection
      ? <DefaultTree collection={api.collection} label={label} renderItem={renderItem} />
      : null

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
  return <span {...mergeReactProps(ctx.api.getLabelProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhTagGroupListProps extends ComponentPropsWithRef<'div'> {}

/** 标签本体所在的那一层：键盘在这里收口，方向键、连打与摘除都落在它身上。 */
export function XhTagGroupList({ children, ...rest }: XhTagGroupListProps): ReactNode {
  const ctx = useTagGroupContext()
  // list 自身得焦时把焦点转交给锚点标签，收的是不冒泡的 DOM focus：合成事件挂在
  // 冒泡的 focusin 上，后代标签得焦也会把它叫起来，判据整个变味。
  // onFocusOut 不动——它经归一化落到 React 的 onBlur，挂的正是冒泡的 focusout
  const bind = useNativeEvents(ctx.api.getListProps() as Record<string, unknown>, ['onFocus'])
  return (
    <div {...mergeReactProps(bind.attrs, rest as Record<string, unknown>, { ref: bind.ref })}>
      {children}
    </div>
  )
}

export interface XhTagGroupItemProps extends Omit<ComponentPropsWithRef<'span'>, 'value'> {
  value: string
  /** 缺省交给 connect 回 collection 里查，写死 false 会盖掉数据里的声明。 */
  disabled?: boolean
  deletable?: boolean
}

/** 一枚标签：渲出来是 tag 的 root（data-scope="tag"），组把行角色、Tab 停靠点、选中与锚点叠在它上面。用 span 才能随文排，选中与摘除的键盘路径都在 list 上。 */
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

/** 标签里那一格：摘除钮可聚焦，只有落在 gridcell 下面才是合法嵌套。 */
export function XhTagGroupCell({ children, ...rest }: XhTagGroupCellProps): ReactNode {
  const ctx = useTagGroupContext()
  const { item } = useTagGroupItemContext()
  return <span {...mergeReactProps(ctx.api.getCellProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhTagGroupItemTextProps extends ComponentPropsWithRef<'span'> {}

/** 标签文字：渲出来是 tag 的 label。 */
export function XhTagGroupItemText({ children, ...rest }: XhTagGroupItemTextProps): ReactNode {
  const ctx = useTagGroupContext()
  const { item } = useTagGroupItemContext()
  return <span {...mergeReactProps(ctx.api.getItemTextProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhTagGroupItemDeleteTriggerProps extends ComponentPropsWithRef<'button'> {}

/** 摘除钮：渲出来是所在标签那份 tag 的 close-trigger，不占 Tab 位；整组没开放摘除时收起，不留一个按不动的叉。 */
export function XhTagGroupItemDeleteTrigger({ children, ...rest }: XhTagGroupItemDeleteTriggerProps): ReactNode {
  const ctx = useTagGroupContext()
  const { item } = useTagGroupItemContext()
  return <button {...mergeReactProps(ctx.api.getItemDeleteTriggerProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

/**
 * 没写 children 时按 collection 铺开的整套结构，作者只交数据。
 * 与手写部件产出的 DOM 完全一致，要改结构就写 children，行为不变。
 */
function DefaultTree(props: {
  collection: readonly TagGroupNodeMeta[]
  label?: ReactNode
  renderItem?: (node: TagGroupNodeMeta) => ReactNode
}): ReactNode {
  return (
    <>
      {props.label != null ? <XhTagGroupLabel>{props.label}</XhTagGroupLabel> : null}
      <XhTagGroupList>
        {props.collection.map(node => (
          <XhTagGroupItem key={node.value} value={node.value}>
            <XhTagGroupCell>
              <XhTagGroupItemText>{props.renderItem?.(node) ?? node.label}</XhTagGroupItemText>
              <XhTagGroupItemDeleteTrigger />
            </XhTagGroupCell>
          </XhTagGroupItem>
        ))}
      </XhTagGroupList>
    </>
  )
}
