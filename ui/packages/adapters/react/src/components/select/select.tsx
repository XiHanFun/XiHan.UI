import type { ControlVariant, Direction, Placement, Size, Tone } from '@xihan-ui/core'
import type { SelectApi, SelectNode, SelectNodeMeta, SelectSchema } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { useEffect, useMemo, useRef } from 'react'
import { withXhConfig } from '../../config/config'
import { useIsomorphicLayoutEffect } from '../../runtime/layout-effect'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { XhPortal } from '../../runtime/portal'
import { renderSlot } from '../../runtime/slot-content'
import { useFieldLabelWiring, useFieldStateWiring } from '../field/use-field-control'
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

/** 函数式 children 的载荷：展开态、选中集合与显示文字、可见标签与被折起的个数及其文字，以及四个动作。 */
export type SelectRootSlotProps = Pick<
  SelectApi,
  'open' | 'value' | 'displayText' | 'tags' | 'overflowCount' | 'overflowText' | 'setOpen' | 'setValue' | 'clear' | 'deselect'
>

/** 根上自有的那些取值；defaultValue 与 dir 与原生的同名属性含义不同，由这里接管。 */
type RootElementProps = Omit<ComponentPropsWithRef<'div'>, 'children' | 'defaultValue' | 'dir'>

export interface XhSelectRootProps extends RootElementProps {
  collection?: SelectNode[]
  /** 标题文字。给了它就不必再写 label 部件。 */
  label?: ReactNode
  value?: string | string[] | null
  defaultValue?: string | string[] | null
  multiple?: boolean
  open?: boolean
  defaultOpen?: boolean
  disabled?: boolean
  /** 只读：浮层照常展开与浏览，但选中值改不动、也清不掉。 */
  readOnly?: boolean
  /** 自动渲染树里是否带清空按钮；手写部件不看它，写了节点即可清。 */
  clearable?: boolean
  invalid?: boolean
  loading?: boolean
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
  onOpenChange?: SelectProps['onOpenChange']
  /** 每个条目的自定义内容；不给就用 collection 里的 label。 */
  renderItem?: (node: SelectNodeMeta) => ReactNode
  children?: SlotChildren<SelectRootSlotProps>
}

export function XhSelectRoot({
  collection,
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
  onOpenChange,
  renderItem,
  children,
  ...rest
}: XhSelectRootProps): ReactNode {
  const ctx = useSelect(withXhConfig('select', {
    collection,
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
    onOpenChange,
  }) as SelectProps)
  const api = ctx.api

  // 表单影子由根部件装配：空串选项打底，每个选中值一个 selected 选项，供 required 判定。
  // 选中态一律靠选项的 selected 表达，多选下 select.value 表达不了集合
  const hiddenSelect = (
    <select {...api.getHiddenSelectProps() as Record<string, unknown>}>
      <option value="" />
      {api.value.map((v, i) => (
        <option key={v} value={v} selected>{api.valueText[i] ?? v}</option>
      ))}
    </select>
  )

  const body = children != null
    ? renderSlot(children, {
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
      })
    : collection
      ? <DefaultTree collection={api.collection} label={label} clearable={clearable} renderItem={renderItem} />
      : null

  return (
    <SelectProvider value={ctx}>
      <div
        {...mergeReactProps(
          api.getRootProps() as Record<string, unknown>,
          rest as Record<string, unknown>,
          { ref: (el: HTMLDivElement | null) => { ctx.rootRef.current = el } },
        )}
      >
        {hiddenSelect}
        {body}
      </div>
    </SelectProvider>
  )
}

XhSelectRoot.xhEvents = ['value-change', 'open-change'] as const

export interface XhSelectLabelProps extends ComponentPropsWithRef<'span'> {}
export function XhSelectLabel({ children, ...rest }: XhSelectLabelProps): ReactNode {
  const ctx = useSelectContext()
  return <span {...mergeReactProps(ctx.api.getLabelProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhSelectControlProps extends ComponentPropsWithRef<'div'> {}
/** 盒：触发器与清空按钮在里面并排，描边、底色与聚焦环都长在它上面。 */
export function XhSelectControl({ children, ...rest }: XhSelectControlProps): ReactNode {
  const ctx = useSelectContext()
  return <div {...mergeReactProps(ctx.api.getControlProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
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
        fieldLabel({ ...ctx.api.getTriggerProps() as Record<string, unknown>, ...fieldWiring }),
        rest as Record<string, unknown>,
        { ref: (el: HTMLButtonElement | null) => { ctx.triggerRef.current = el } },
      )}
    >
      {children}
    </button>
  )
}

export interface XhSelectValueTextProps extends ComponentPropsWithRef<'span'> {}
/** 有内容用内容，否则显示选中项文本或 placeholder。 */
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
/** 节点常挂，清不了时靠 hidden 藏掉。 */
export function XhSelectClearTrigger({ children, ...rest }: XhSelectClearTriggerProps): ReactNode {
  const ctx = useSelectContext()
  return <button {...mergeReactProps(ctx.api.getClearTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

export interface XhSelectTagListProps extends ComponentPropsWithRef<'span'> {}
/** 标签行：可见标签与 +N 那一枚在里面并排；无选中时连接层给 hidden，value-text 回来显示占位文字。 */
export function XhSelectTagList({ children, ...rest }: XhSelectTagListProps): ReactNode {
  const ctx = useSelectContext()
  return <span {...mergeReactProps(ctx.api.getTagListProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhSelectTagProps extends ComponentPropsWithRef<'span'> {
  /** 它代表哪个选中值。 */
  value: string
}
export function XhSelectTag({ value, children, ...rest }: XhSelectTagProps): ReactNode {
  const ctx = useSelectContext()
  return (
    <SelectTagProvider value={value}>
      <span {...mergeReactProps(ctx.api.getTagProps({ value }) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
    </SelectTagProvider>
  )
}

export interface XhSelectOverflowTagProps extends ComponentPropsWithRef<'span'> {}
/** 有内容用内容，否则显示 +N；没有折起的标签时连接层给 hidden。 */
export function XhSelectOverflowTag({ children, ...rest }: XhSelectOverflowTagProps): ReactNode {
  const ctx = useSelectContext()
  return (
    <span {...mergeReactProps(ctx.api.getOverflowTagProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children ?? ctx.api.overflowText}
    </span>
  )
}

export interface XhSelectItemDeleteTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhSelectItemDeleteTrigger({ children, ...rest }: XhSelectItemDeleteTriggerProps): ReactNode {
  const ctx = useSelectContext()
  const value = useSelectTagContext()
  return <button {...mergeReactProps(ctx.api.getItemDeleteTriggerProps({ value }) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

export interface XhSelectPositionerProps extends ComponentPropsWithRef<'div'> {
  /** 浮层挂到哪个容器；不给就按全局配置，再不给挂 body。 */
  container?: () => Element | null
}
/** 搬到浮层落点：留在原地的话，宿主祖先只要建了层叠上下文就能盖住浮层。 */
export function XhSelectPositioner({ children, container, ...rest }: XhSelectPositionerProps): ReactNode {
  const ctx = useSelectContext()
  return (
    <XhPortal container={container ?? ctx.portalContainer}>
      <div
        {...mergeReactProps(
          ctx.api.getPositionerProps() as Record<string, unknown>,
          rest as Record<string, unknown>,
          { ref: (el: HTMLDivElement | null) => { ctx.positionerRef.current = el } },
        )}
      >
        {children}
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
      {children}
    </div>
  )
}

export interface XhSelectListProps extends ComponentPropsWithRef<'div'> {}
/** 列表框本体：条目放这里面。滚动也在这一层，底部操作区因此不随条目滚走。 */
export function XhSelectList({ children, ...rest }: XhSelectListProps): ReactNode {
  const ctx = useSelectContext()
  return <div {...mergeReactProps(ctx.api.getListProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
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

export interface XhSelectGroupProps extends ComponentPropsWithRef<'div'> {
  value: string
}
/** 分组容器：条目照常挂在它里面，role=group 是列表框允许拥有的两种子节点之一。 */
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
  /** 缺省交给 connect 回 collection 里查，写死 false 会盖掉数据里的禁用。 */
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
  }, [ctx.service])

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

export interface XhSelectItemIndicatorProps extends ComponentPropsWithRef<'span'> {}
export function XhSelectItemIndicator({ children, ...rest }: XhSelectItemIndicatorProps): ReactNode {
  const ctx = useSelectContext()
  const item = useSelectItemContext()
  return <span {...mergeReactProps(ctx.api.getItemIndicatorProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

/**
 * 没写 children 时按 collection 铺开的整套结构，作者只交数据。
 * 与手写部件产出的 DOM 完全一致，要改结构就写 children，行为不变。
 */
function DefaultTree(props: {
  collection: readonly SelectNodeMeta[]
  label?: ReactNode
  clearable?: boolean
  renderItem?: (node: SelectNodeMeta) => ReactNode
}): ReactNode {
  const trigger = (
    <XhSelectTrigger>
      <XhSelectValueText />
      <XhSelectIndicator />
    </XhSelectTrigger>
  )
  return (
    <>
      {props.label != null ? <XhSelectLabel>{props.label}</XhSelectLabel> : null}
      {/* control 是盒：描边、底色与聚焦环都长在它上面，触发器与清空钮在里面并排。
          清空钮排在触发器之后（按钮不能套按钮），展开箭头是触发器里的指示符 */}
      <XhSelectControl>
        {trigger}
        {props.clearable ? <XhSelectClearTrigger /> : null}
      </XhSelectControl>
      <XhSelectPositioner>
        <XhSelectContent>
          <XhSelectList>
            {props.collection.map(node => (
              <XhSelectItem key={node.value} value={node.value}>
                <XhSelectItemText>{props.renderItem?.(node) ?? node.label}</XhSelectItemText>
                <XhSelectItemIndicator />
              </XhSelectItem>
            ))}
          </XhSelectList>
        </XhSelectContent>
      </XhSelectPositioner>
    </>
  )
}
