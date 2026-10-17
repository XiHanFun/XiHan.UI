/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 select 相关实现。

import type { ControlVariant, Direction, Placement, Size, Tone } from '@xihan-ui/core'
import type { CollectionVirtualizer, SelectApi, SelectNode, SelectNodeMeta, SelectSchema } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { selectStructure } from '@xihan-ui/headless'
import { useEffect, useMemo, useRef } from 'react'
import { withXhConfig } from '../../config/config'
import { useIsomorphicLayoutEffect } from '../../runtime/layout-effect'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { XhPortal } from '../../runtime/portal'
import { renderSlot, slotIsPlainText, slotPaints } from '../../runtime/slot-content'
import { renderStructure } from '../../runtime/structure'
import { useScrollbars } from '../../runtime/use-scrollbars'
import { useFieldLabelWiring, useFieldStateWiring } from '../field/use-field-control'
import { useFormControlProps } from '../form/use-form-control'
import {
  SelectGroupProvider,
  SelectItemProvider,
  SelectProvider,
  SelectTagProvider,
  useSelectContext,
  useSelectGroupContext,
  useSelectItemContext,
  useSelectTagContext,
} from './context'
import { useSelect } from './use-select'

type SelectProps = SelectSchema['props']

/** 函数式 children 的载荷：展开态、选中集合与显示文字、可见标签与被折叠的个数及其文字，以及四个动作。 */
export type SelectRootSlotProps = Pick<
  SelectApi,
  'open' | 'value' | 'displayText' | 'tags' | 'overflowCount' | 'overflowText' | 'setOpen' | 'setValue' | 'clear' | 'deselect'
>

/** 根上自有的取值；defaultValue 与 dir 与原生的同名属性含义不同，由这里接管。 */
type RootElementProps = Omit<ComponentPropsWithRef<'div'>, 'children' | 'defaultValue' | 'dir'>

export interface XhSelectRootProps extends RootElementProps {
  collection?: SelectNode[]
  virtualizer?: CollectionVirtualizer
  /** 列表内容第一次展开时才挂载；打开前的选中文字与收起态连打按 collection 算。 */
  lazyMount?: boolean
  /** 标题文字。提供后不必再写 label 部件。 */
  label?: ReactNode
  value?: string | string[] | null
  defaultValue?: string | string[] | null
  multiple?: boolean
  open?: boolean
  defaultOpen?: boolean
  disabled?: boolean
  /** 只读：浮层照常展开与浏览，但选中值不可修改、也不可清空。 */
  readOnly?: boolean
  /** 自动渲染树中是否带清空按钮；手写部件不使用它，写了节点即可清空。 */
  clearable?: boolean
  invalid?: boolean
  loading?: boolean
  /** 整表取数失败：浮层里露出 error 与 retry-trigger，空态占位让位；重试由 onRetry 交给宿主。 */
  error?: boolean
  required?: boolean
  name?: string
  translations?: SelectProps['translations']
  maxTagCount?: number
  placeholder?: string
  placement?: Placement
  offset?: number
  loop?: boolean
  dir?: Direction
  variant?: ControlVariant
  tone?: Tone
  size?: Size
  onValueChange?: SelectProps['onValueChange']
  /** 用户按清空钮（clear-trigger）清掉了值；先发值变化，再发它。程序化的 clear() 不发。 */
  onClear?: () => void
  onOpenChange?: SelectProps['onOpenChange']
  /** 整表取数失败后请求重试：点了 retry-trigger，或浮层里没有高亮条目时按了 Enter / Space。 */
  onRetry?: () => void
  /** 每个条目的自定义内容；未提供时使用 collection 中的 label。 */
  renderItem?: (node: SelectNodeMeta) => ReactNode
  /** 只接管条目行首那一格；其余槽仍由数据铺。 */
  renderItemPrefix?: (node: SelectNodeMeta) => ReactNode
  /** 只接管条目行尾那一格；其余槽仍由数据铺。 */
  renderItemSuffix?: (node: SelectNodeMeta) => ReactNode
  children?: SlotChildren<SelectRootSlotProps>
}

/**
 * 表单影子：由根部件装配，作者不必手写。空串选项打底，每个选中值一个 selected 选项，供 required 判定。
 * 选中态一律靠选项的 selected 表达，多选下 select.value 表达不了集合。
 */
function SelectHiddenSelect(): ReactNode {
  const { api } = useSelectContext()
  return (
    <select {...api.getHiddenSelectProps() as Record<string, unknown>}>
      <option value="" />
      {api.value.map((v, i) => (
        <option key={v} value={v} selected>{api.valueText[i] ?? v}</option>
      ))}
    </select>
  )
}

export function XhSelectRoot({
  collection,
  virtualizer,
  lazyMount,
  label,
  value,
  defaultValue,
  multiple,
  open,
  defaultOpen,
  disabled,
  readOnly,
  clearable,
  invalid,
  loading,
  error,
  required,
  name,
  translations,
  maxTagCount,
  placeholder,
  placement,
  offset,
  loop,
  dir,
  variant,
  tone,
  size,
  onValueChange,
  onClear,
  onOpenChange,
  onRetry,
  renderItem,
  renderItemPrefix,
  renderItemSuffix,
  children,
  ...rest
}: XhSelectRootProps): ReactNode {
  const ctx = useSelect(withXhConfig('select', useFormControlProps({
    collection,
    virtualizer,
    lazyMount,
    value,
    defaultValue,
    multiple,
    open,
    defaultOpen,
    disabled,
    readOnly,
    clearable,
    invalid,
    loading,
    error,
    required,
    name,
    translations,
    maxTagCount,
    placeholder,
    placement,
    offset,
    loop,
    dir,
    variant,
    tone,
    size,
    onValueChange,
    onClear,
    onOpenChange,
    onRetry,
  })) as SelectProps)
  const api = ctx.api

  const body = children != null
    ? (
        <>
          <SelectHiddenSelect />
          {renderSlot(children, {
            open: api.open,
            value: api.value,
            displayText: api.displayText,
            tags: api.tags,
            overflowCount: api.overflowCount,
            overflowText: api.overflowText,
            setOpen: api.setOpen,
            setValue: api.setValue,
            clear: api.clear,
            deselect: api.deselect,
          })}
        </>
      )
    : renderDefaultStructure(api, { label, clearable, renderItem, renderItemPrefix, renderItemSuffix })

  return (
    <SelectProvider value={ctx}>
      <div
        {...mergeReactProps(
          api.getRootProps() as Record<string, unknown>,
          rest as Record<string, unknown>,
          { ref: (el: HTMLDivElement | null) => { ctx.rootRef.current = el } },
        )}
      >
        {body}
      </div>
    </SelectProvider>
  )
}

XhSelectRoot.xhEvents = ['clear', 'value-change', 'open-change', 'retry'] as const

export interface XhSelectLabelProps extends ComponentPropsWithRef<'span'> {}
export function XhSelectLabel({ children, ...rest }: XhSelectLabelProps): ReactNode {
  const ctx = useSelectContext()
  // 渲出来了才登记：可聚焦部件的 aria-labelledby 只在这个节点真在场时才指过来
  const { registerLabel } = ctx
  useEffect(() => registerLabel(), [registerLabel])
  return <span {...mergeReactProps(ctx.api.getLabelProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhSelectControlProps extends ComponentPropsWithRef<'div'> {}
/** 控件盒：触发器与清空按钮在其中并排，描边、底色与聚焦环都落在它上面。 */
export function XhSelectControl({ children, ...rest }: XhSelectControlProps): ReactNode {
  const ctx = useSelectContext()
  return (
    <div
      {...mergeReactProps(
        ctx.api.getControlProps() as Record<string, unknown>,
        rest as Record<string, unknown>,
        { ref: (el: HTMLDivElement | null) => { ctx.controlRef.current = el } },
      )}
    >
      {children}
    </div>
  )
}

export interface XhSelectTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhSelectTrigger({ children, ...rest }: XhSelectTriggerProps): ReactNode {
  const ctx = useSelectContext()
  // 字段的说明与校验状态要落在真控件上，不能停在封装根的 div 上
  const fieldWiring = useFieldStateWiring()
  // 字段的标签也得并进名字链：控件自带的那条指的是它自己那个没渲染的 label 部件
  const fieldLabel = useFieldLabelWiring()
  return (
    <button
      {...mergeReactProps(
        fieldLabel({ ...fieldWiring, ...ctx.api.getTriggerProps() as Record<string, unknown> }),
        rest as Record<string, unknown>,
        { ref: (el: HTMLButtonElement | null) => { ctx.triggerRef.current = el } },
      )}
    >
      {children}
    </button>
  )
}

export interface XhSelectValueTextProps extends ComponentPropsWithRef<'span'> {}
/** 有内容时使用内容，否则显示选中项文本或 placeholder。 */
export function XhSelectValueText({ children, ...rest }: XhSelectValueTextProps): ReactNode {
  const ctx = useSelectContext()
  return (
    <span {...mergeReactProps(ctx.api.getValueTextProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children ?? ctx.api.displayText}
    </span>
  )
}

export interface XhSelectIndicatorProps extends ComponentPropsWithRef<'span'> {}
export function XhSelectIndicator({ children, ...rest }: XhSelectIndicatorProps): ReactNode {
  const ctx = useSelectContext()
  return <span {...mergeReactProps(ctx.api.getIndicatorProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhSelectClearTriggerProps extends ComponentPropsWithRef<'button'> {}
/** 节点常驻，不可清空时依靠 hidden 隐藏。 */
export function XhSelectClearTrigger({ children, ...rest }: XhSelectClearTriggerProps): ReactNode {
  const ctx = useSelectContext()
  return <button {...mergeReactProps(ctx.api.getClearTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

export interface XhSelectTagListProps extends ComponentPropsWithRef<'span'> {}
/** 标签行：可见标签与 +N 标签在其中并排；无选中时连接层写 hidden，value-text 恢复显示占位文字。 */
export function XhSelectTagList({ children, ...rest }: XhSelectTagListProps): ReactNode {
  const ctx = useSelectContext()
  return <span {...mergeReactProps(ctx.api.getTagListProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhSelectTagLabelProps extends ComponentPropsWithRef<'span'> {}
/** 标签文字所在的块（tag 的 label）：截断规则挂在这一层。 */
export function XhSelectTagLabel({ children, ...rest }: XhSelectTagLabelProps): ReactNode {
  const ctx = useSelectContext()
  return <span {...mergeReactProps(ctx.api.getTagLabelProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

/**
 * 标签内容：只有文字时替它包一层 label：截断规则挂在 label 上，直接展开在 root 上的文字过长会把
 * 删除按钮挤出；作者自己写了节点则原样放行。与 XhTagRoot 同一规则。
 * 库自身填入的文字（+N，没有折叠时是空串）恒包 label，三个适配器渲染出同一棵树。
 */
function tagChildren(children: ReactNode): ReactNode {
  return typeof children === 'string' || slotIsPlainText(children) ? <XhSelectTagLabel>{children}</XhSelectTagLabel> : children
}

export interface XhSelectTagProps extends ComponentPropsWithRef<'span'> {
  /** 它代表哪个选中值。 */
  value: string
}
/** 一个选中值一个标签，即库内 tag 的 root（data-scope="tag"）：语气、尺寸与禁用从 select 传下，形态按控件的面派生；触发器内纯展示，触发器外配合 XhSelectItemDeleteTrigger 可删除。 */
export function XhSelectTag({ value, children, ...rest }: XhSelectTagProps): ReactNode {
  const ctx = useSelectContext()
  return (
    <SelectTagProvider value={value}>
      <span {...mergeReactProps(ctx.api.getTagProps({ value }) as Record<string, unknown>, rest as Record<string, unknown>)}>{tagChildren(children)}</span>
    </SelectTagProvider>
  )
}

export interface XhSelectOverflowTagProps extends ComponentPropsWithRef<'span'> {}
/** 折叠的标签合成的一个标签：同样是 tag 的 root；有内容时使用内容，否则显示 +N。没有折叠的标签时连接层写 hidden。 */
export function XhSelectOverflowTag({ children, ...rest }: XhSelectOverflowTagProps): ReactNode {
  const ctx = useSelectContext()
  return (
    <span {...mergeReactProps(ctx.api.getOverflowTagProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {tagChildren(children ?? ctx.api.overflowText)}
    </span>
  )
}

export interface XhSelectItemDeleteTriggerProps extends ComponentPropsWithRef<'button'> {}
/** 标签中的删除按钮：即所在标签那份 tag 的 close-trigger（data-scope="tag"），可及名使用 translations.deleteItem；点按移除所在标签的选中值。 */
export function XhSelectItemDeleteTrigger({ children, ...rest }: XhSelectItemDeleteTriggerProps): ReactNode {
  const ctx = useSelectContext()
  const value = useSelectTagContext()
  return <button {...mergeReactProps(ctx.api.getItemDeleteTriggerProps({ value }) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

export interface XhSelectPositionerProps extends ComponentPropsWithRef<'div'> {
  /** 浮层挂载的容器；未提供时按全局配置，再未提供时挂载到 body。 */
  container?: () => Element | null
}
/** 迁移到浮层落点：留在原地时，宿主祖先只要建立了层叠上下文就能遮住浮层。 */
export function XhSelectPositioner({ children, container, ...rest }: XhSelectPositionerProps): ReactNode {
  const ctx = useSelectContext()
  // 列表的自绘条：与 content 同级、绝对定位不占布局，壳是这层已经 fixed 的 positioner，条子走浮层 4px 档
  // 列表内容懒挂载、还没展开过时轴先禁用着：容器暂缺属于预期
  const bars = useScrollbars({ scrollable: () => ctx.listRef.current, props: () => ({ size: 'sm', disabled: !ctx.api.isContentMounted() }) })
  return (
    <XhPortal container={container ?? ctx.portalContainer} source={ctx.triggerRef} present={ctx.rendered}>
      <div
        {...mergeReactProps(
          ctx.api.getPositionerProps() as Record<string, unknown>,
          rest as Record<string, unknown>,
          { ref: (el: HTMLDivElement | null) => { ctx.positionerRef.current = el } },
        )}
      >
        {children}
        {bars.render()}
      </div>
    </XhPortal>
  )
}

export interface XhSelectContentProps extends ComponentPropsWithRef<'div'> {}
export function XhSelectContent({ children, ...rest }: XhSelectContentProps): ReactNode {
  const ctx = useSelectContext()
  return (
    <div
      {...mergeReactProps(
        ctx.api.getContentProps() as Record<string, unknown>,
        rest as Record<string, unknown>,
        {
          // 收起跟着退场闸门走：皮肤刻意没给 content 补 [hidden]{display:none}（补了退场
          // 就一帧都播不出来），所以真正的收起落成内联 display——节点始终留在原地
          style: ctx.rendered ? undefined : { display: 'none' },
          ref: (el: HTMLDivElement | null) => { ctx.contentRef.current = el },
        },
      )}
    >
      {ctx.api.isContentMounted() ? children : null}
    </div>
  )
}

export interface XhSelectListProps extends ComponentPropsWithRef<'div'> {}
/** 列表框本体：条目放在其中。滚动也在这一层，底部操作区因此不随条目滚动。 */
export function XhSelectList({ children, ...rest }: XhSelectListProps): ReactNode {
  const ctx = useSelectContext()
  return (
    <div
      {...mergeReactProps(
        ctx.api.getListProps() as Record<string, unknown>,
        rest as Record<string, unknown>,
        { ref: (el: HTMLDivElement | null) => { ctx.listRef.current = el } },
      )}
    >
      {children}
    </div>
  )
}

export interface XhSelectFooterProps extends ComponentPropsWithRef<'div'> {}
export function XhSelectFooter({ children, ...rest }: XhSelectFooterProps): ReactNode {
  const ctx = useSelectContext()
  return <div {...mergeReactProps(ctx.api.getFooterProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhSelectEmptyProps extends ComponentPropsWithRef<'div'> {}
export function XhSelectEmpty({ children, ...rest }: XhSelectEmptyProps): ReactNode {
  const ctx = useSelectContext()
  return <div {...mergeReactProps(ctx.api.getEmptyProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhSelectLoadingProps extends ComponentPropsWithRef<'div'> {}
export function XhSelectLoading({ children, ...rest }: XhSelectLoadingProps): ReactNode {
  const ctx = useSelectContext()
  return <div {...mergeReactProps(ctx.api.getLoadingProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhSelectErrorProps extends ComponentPropsWithRef<'div'> {}
/** 整表取数失败的提示：与空态、在途占位同一个位置；没写内容时显示 translations.loadError。 */
export function XhSelectError({ children, ...rest }: XhSelectErrorProps): ReactNode {
  const ctx = useSelectContext()
  return <div {...mergeReactProps(ctx.api.getErrorProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{slotPaints(children) ? children : ctx.api.translations.loadError}</div>
}

export interface XhSelectRetryTriggerProps extends ComponentPropsWithRef<'button'> {}
/** 重试钮：没写内容时显示 translations.retry。 */
export function XhSelectRetryTrigger({ children, ...rest }: XhSelectRetryTriggerProps): ReactNode {
  const ctx = useSelectContext()
  return <button {...mergeReactProps(ctx.api.getRetryTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{slotPaints(children) ? children : ctx.api.translations.retry}</button>
}

export interface XhSelectGroupProps extends ComponentPropsWithRef<'div'> {
  value: string
}
/** 分组容器：条目照常挂在其中，role=group 是列表框允许拥有的两种子节点之一。 */
export function XhSelectGroup({ value, children, ...rest }: XhSelectGroupProps): ReactNode {
  const ctx = useSelectContext()
  const group = useMemo(() => ({ value }), [value])
  return (
    <SelectGroupProvider value={group}>
      <div {...mergeReactProps(ctx.api.getGroupProps(group) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
    </SelectGroupProvider>
  )
}

export interface XhSelectGroupLabelProps extends ComponentPropsWithRef<'span'> {}
export function XhSelectGroupLabel({ children, ...rest }: XhSelectGroupLabelProps): ReactNode {
  const ctx = useSelectContext()
  const group = useSelectGroupContext()
  return <span {...mergeReactProps(ctx.api.getGroupLabelProps(group) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhSelectItemProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  value: string
  /** 默认交给 connect 查询 collection，写死 false 会覆盖数据中的禁用。 */
  disabled?: boolean
}
export function XhSelectItem({ value, disabled, children, ...rest }: XhSelectItemProps): ReactNode {
  const ctx = useSelectContext()
  const item = useMemo(() => ({ value, disabled }), [value, disabled])
  const itemEl = useRef<HTMLElement | null>(null)
  const previous = useRef(value)
  // 条目的聚焦上报与指针离开都不冒泡，改装成原生监听器
  const bind = useNativeEvents(
    ctx.api.getItemProps(item) as Record<string, unknown>,
    ['onFocus', 'onPointerLeave'],
  )

  // 本条目持有焦点时，value 变更重报高亮条目
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
      svc.send({ type: 'ITEM.HIGHLIGHT', value })
  }, [ctx.service, value])

  // 卸载时上报条目丢失：按「本节点当下正持有焦点」判定，不按 value 比对
  useIsomorphicLayoutEffect(() => () => {
    const svc = ctx.service
    if (svc.getStatus() !== 'Started')
      return
    if (itemEl.current && svc.scope.getActiveElement() === itemEl.current)
      svc.send({ type: 'ITEM.LOST' })
  }, [ctx.service, value])

  return (
    <SelectItemProvider value={item}>
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
    </SelectItemProvider>
  )
}

export interface XhSelectItemTextProps extends ComponentPropsWithRef<'span'> {}
export function XhSelectItemText({ children, ...rest }: XhSelectItemTextProps): ReactNode {
  const ctx = useSelectContext()
  const item = useSelectItemContext()
  return <span {...mergeReactProps(ctx.api.getItemTextProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

/** 条目行首的作者内容（图标、色块、头像），对读屏隐藏。 */
export interface XhSelectItemPrefixProps extends ComponentPropsWithRef<'span'> {}
export function XhSelectItemPrefix({ children, ...rest }: XhSelectItemPrefixProps): ReactNode {
  const ctx = useSelectContext()
  const item = useSelectItemContext()
  return <span {...mergeReactProps(ctx.api.getItemPrefixProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

/** 条目行尾的作者内容（计数、徽标）。 */
export interface XhSelectItemSuffixProps extends ComponentPropsWithRef<'span'> {}
export function XhSelectItemSuffix({ children, ...rest }: XhSelectItemSuffixProps): ReactNode {
  const ctx = useSelectContext()
  const item = useSelectItemContext()
  return <span {...mergeReactProps(ctx.api.getItemSuffixProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

/** 条目的第 2 行副文本，跨文字槽、走 muted 档。 */
export interface XhSelectItemDescriptionProps extends ComponentPropsWithRef<'span'> {}
export function XhSelectItemDescription({ children, ...rest }: XhSelectItemDescriptionProps): ReactNode {
  const ctx = useSelectContext()
  const item = useSelectItemContext()
  return <span {...mergeReactProps(ctx.api.getItemDescriptionProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhSelectItemIndicatorProps extends ComponentPropsWithRef<'span'> {}
export function XhSelectItemIndicator({ children, ...rest }: XhSelectItemIndicatorProps): ReactNode {
  const ctx = useSelectContext()
  const item = useSelectItemContext()
  return <span {...mergeReactProps(ctx.api.getItemIndicatorProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

/** 标准结构里各部件对应的组件；标签与 +N 委派给 tag，按「tag/部件名」找。 */
const SELECT_PARTS = {
  'hidden-select': SelectHiddenSelect,
  'label': XhSelectLabel,
  'control': XhSelectControl,
  'trigger': XhSelectTrigger,
  'value-text': XhSelectValueText,
  'indicator': XhSelectIndicator,
  'clear-trigger': XhSelectClearTrigger,
  'tag-list': XhSelectTagList,
  'tag/tag': XhSelectTag,
  'tag/overflow-tag': XhSelectOverflowTag,
  'positioner': XhSelectPositioner,
  'content': XhSelectContent,
  'list': XhSelectList,
  'item': XhSelectItem,
  'item-prefix': XhSelectItemPrefix,
  'item-text': XhSelectItemText,
  'item-description': XhSelectItemDescription,
  'item-suffix': XhSelectItemSuffix,
  'item-indicator': XhSelectItemIndicator,
}

interface SelectStructureContent {
  label?: ReactNode
  clearable?: boolean
  renderItem?: (node: SelectNodeMeta) => ReactNode
  renderItemPrefix?: (node: SelectNodeMeta) => ReactNode
  renderItemSuffix?: (node: SelectNodeMeta) => ReactNode
}

/**
 * 未写 children 时铺开的整套结构，作者只提供数据：照 headless 的 selectStructure 渲，
 * 与 Web Components 不写部件时元素生成的节点出自同一份。文字以外的标题、条目文字与行首行尾由对应渲染函数接管。
 */
function renderDefaultStructure(api: SelectApi, content: SelectStructureContent): ReactNode[] {
  const { label, renderItem, renderItemPrefix, renderItemSuffix } = content
  const slotted: Readonly<Record<string, boolean>> = {
    'label': label != null && typeof label !== 'string',
    'item': renderItem != null,
    'item-prefix': renderItemPrefix != null,
    'item-suffix': renderItemSuffix != null,
  }
  const nodes = selectStructure(api, {
    label: typeof label === 'string' ? label : undefined,
    clearable: content.clearable,
    slotted: name => slotted[name] === true,
  })
  return renderStructure(nodes, SELECT_PARTS, (node) => {
    const meta = node.data as SelectNodeMeta
    switch (node.slot?.name) {
      case 'label':
        return label
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
