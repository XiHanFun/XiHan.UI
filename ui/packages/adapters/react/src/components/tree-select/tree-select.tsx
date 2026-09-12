import type { ControlVariant, Direction, Placement, Service, Size, Tone } from '@xihan-ui/core'
import type { TreeSelectApi, TreeSelectNode, TreeSelectSchema } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode, RefObject } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { useEffect, useMemo, useRef } from 'react'
import { withXhConfig } from '../../config/config'
import { useIsomorphicLayoutEffect } from '../../runtime/layout-effect'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { XhPortal } from '../../runtime/portal'
import { renderSlot } from '../../runtime/slot-content'
import { useScrollbars } from '../../runtime/use-scrollbars'
import { useFieldLabelWiring, useFieldStateWiring } from '../field/use-field-control'
import { useFormControlProps } from '../form/use-form-control'
import { TreeSelectNodeProvider, TreeSelectProvider, useTreeSelectContext, useTreeSelectNodeContext } from './context'
import { useTreeSelect } from './use-tree-select'

type TreeSelectProps = TreeSelectSchema['props']

/** 函数式 children 的载荷：展开与选中状态、可见行序列、节点状态判定与写值方法。 */
export type TreeSelectRootSlotProps = Pick<
  TreeSelectApi,
  | 'open'
  | 'value'
  | 'expandedValue'
  | 'visibleNodes'
  | 'focusedValue'
  | 'displayText'
  | 'canClear'
  | 'isSelected'
  | 'isIndeterminate'
  | 'isExpanded'
  | 'setOpen'
  | 'setValue'
  | 'setExpandedValue'
  | 'expand'
  | 'collapse'
  | 'select'
  | 'clear'
>

/** 本节点持有焦点时，value 变更重报焦点节点，卸载时上报焦点丢失。 */
function useNodeFocusReport(
  service: Service<TreeSelectSchema>,
  el: RefObject<HTMLElement | null>,
  value: string,
): void {
  const previous = useRef(value)
  useEffect(() => {
    const prev = previous.current
    previous.current = value
    if (prev === value)
      return
    if (service.getStatus() !== 'Started')
      return
    if (el.current && service.scope.getActiveElement() === el.current)
      service.send({ type: 'NODE.FOCUS', value })
  }, [service, el, value])

  // 按「本节点当下正持有焦点」判定，不按 value 比对
  useIsomorphicLayoutEffect(() => () => {
    if (service.getStatus() !== 'Started')
      return
    if (el.current && service.scope.getActiveElement() === el.current)
      service.send({ type: 'NODE.LOST' })
  }, [service, el])
}

export interface XhTreeSelectRootProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  collection?: TreeSelectNode[]
  loadChildren?: TreeSelectProps['loadChildren']
  /** 标题文字。给了它就不必再写 label 部件。 */
  label?: ReactNode
  /** 自动渲染树里是否带清空按钮；手写部件不看它，写了节点即可清。 */
  clearable?: boolean
  value?: string | string[]
  defaultValue?: string | string[]
  expandedValue?: string[]
  defaultExpandedValue?: string[]
  open?: boolean
  defaultOpen?: boolean
  multiple?: boolean
  cascade?: boolean
  checkedStrategy?: TreeSelectProps['checkedStrategy']
  disabled?: boolean
  readOnly?: boolean
  invalid?: boolean
  loading?: boolean
  variant?: ControlVariant
  tone?: Tone
  size?: Size
  placeholder?: string
  translations?: TreeSelectProps['translations']
  placement?: Placement
  offset?: number
  loop?: boolean
  dir?: Direction
  name?: string
  /** 显式关联的原生表单 ID。 */
  form?: string
  onValueChange?: TreeSelectProps['onValueChange']
  onExpandedValueChange?: TreeSelectProps['onExpandedValueChange']
  onOpenChange?: TreeSelectProps['onOpenChange']
  children?: SlotChildren<TreeSelectRootSlotProps>
}

export function XhTreeSelectRoot({
  collection,
  loadChildren,
  label,
  clearable,
  value,
  defaultValue,
  expandedValue,
  defaultExpandedValue,
  open,
  defaultOpen,
  multiple,
  cascade,
  checkedStrategy,
  disabled,
  readOnly,
  invalid,
  loading,
  variant,
  tone,
  size,
  placeholder,
  translations,
  placement,
  offset,
  loop,
  dir,
  name,
  form,
  onValueChange,
  onExpandedValueChange,
  onOpenChange,
  children,
  ...rest
}: XhTreeSelectRootProps): ReactNode {
  const ctx = useTreeSelect(withXhConfig('tree-select', useFormControlProps({
    collection,
    loadChildren,
    clearable,
    value,
    defaultValue,
    expandedValue,
    defaultExpandedValue,
    open,
    defaultOpen,
    multiple,
    cascade,
    checkedStrategy,
    disabled,
    readOnly,
    invalid,
    loading,
    variant,
    tone,
    size,
    placeholder,
    translations,
    placement,
    offset,
    loop,
    dir,
    name,
    form,
    onValueChange,
    onExpandedValueChange,
    onOpenChange,
  })) as TreeSelectProps)
  const api = ctx.api

  const body = children != null
    ? renderSlot(children, {
        open: api.open,
        value: api.value,
        expandedValue: api.expandedValue,
        visibleNodes: api.visibleNodes,
        focusedValue: api.focusedValue,
        displayText: api.displayText,
        canClear: api.canClear,
        isSelected: api.isSelected,
        isIndeterminate: api.isIndeterminate,
        isExpanded: api.isExpanded,
        setOpen: api.setOpen,
        setValue: api.setValue,
        setExpandedValue: api.setExpandedValue,
        expand: api.expand,
        collapse: api.collapse,
        select: api.select,
        clear: api.clear,
      })
    : collection
      ? <DefaultTree collection={api.collection} label={label} clearable={clearable} />
      : null

  return (
    <TreeSelectProvider value={ctx}>
      <div
        {...mergeReactProps(
          api.getRootProps() as Record<string, unknown>,
          rest as Record<string, unknown>,
          { ref: (el: HTMLDivElement | null) => { ctx.rootRef.current = el } },
        )}
      >
        {body}
      </div>
    </TreeSelectProvider>
  )
}

XhTreeSelectRoot.xhEvents = ['value-change', 'expanded-value-change', 'open-change'] as const

export interface XhTreeSelectLabelProps extends ComponentPropsWithRef<'span'> {}
export function XhTreeSelectLabel({ children, ...rest }: XhTreeSelectLabelProps): ReactNode {
  const ctx = useTreeSelectContext()
  return <span {...mergeReactProps(ctx.api.getLabelProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhTreeSelectControlProps extends ComponentPropsWithRef<'div'> {}
/** 描边、底色与聚焦环所在的那一层，触发按钮与尾部动作钮在里面并排。 */
export function XhTreeSelectControl({ children, ...rest }: XhTreeSelectControlProps): ReactNode {
  const ctx = useTreeSelectContext()
  return <div {...mergeReactProps(ctx.api.getControlProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhTreeSelectTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhTreeSelectTrigger({ children, ...rest }: XhTreeSelectTriggerProps): ReactNode {
  const ctx = useTreeSelectContext()
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

export interface XhTreeSelectValueTextProps extends ComponentPropsWithRef<'span'> {}
/** 有内容用内容，否则显示选中项文本或 placeholder。 */
export function XhTreeSelectValueText({ children, ...rest }: XhTreeSelectValueTextProps): ReactNode {
  const ctx = useTreeSelectContext()
  return (
    <span {...mergeReactProps(ctx.api.getValueTextProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children ?? ctx.api.displayText}
    </span>
  )
}

export interface XhTreeSelectIndicatorProps extends ComponentPropsWithRef<'span'> {}
export function XhTreeSelectIndicator({ children, ...rest }: XhTreeSelectIndicatorProps): ReactNode {
  const ctx = useTreeSelectContext()
  return <span {...mergeReactProps(ctx.api.getIndicatorProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhTreeSelectClearTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhTreeSelectClearTrigger({ children, ...rest }: XhTreeSelectClearTriggerProps): ReactNode {
  const ctx = useTreeSelectContext()
  return <button {...mergeReactProps(ctx.api.getClearTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

export interface XhTreeSelectPositionerProps extends ComponentPropsWithRef<'div'> {
  /** 浮层挂到哪个容器；不给就按全局配置，再不给挂 body。 */
  container?: () => Element | null
}
/** 搬到浮层落点：留在原地的话，宿主祖先只要建了层叠上下文就能盖住浮层。 */
export function XhTreeSelectPositioner({ children, container, ...rest }: XhTreeSelectPositionerProps): ReactNode {
  const ctx = useTreeSelectContext()
  // 树的自绘条：与 content 同级、绝对定位不占布局，壳是这层已经 fixed 的 positioner。
  // 两条轴都摆：深层节点靠缩进往行末推，横向溢出与纵向一样是常态。
  // 横条的正负按排版方向算，而组件不读计算样式，把 positioner 上那份显式交过去
  const bars = useScrollbars({
    scrollable: () => ctx.contentRef.current,
    axes: ['vertical', 'horizontal'],
    props: () => ({ dir: (ctx.api.getPositionerProps() as { dir?: Direction }).dir }),
  })
  return (
    <XhPortal container={container ?? ctx.portalContainer} source={ctx.triggerRef}>
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

export interface XhTreeSelectContentProps extends ComponentPropsWithRef<'div'> {}
/** 收起时只隐藏不卸载。 */
export function XhTreeSelectContent({ children, ...rest }: XhTreeSelectContentProps): ReactNode {
  const ctx = useTreeSelectContext()
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

export interface XhTreeSelectTreeProps extends ComponentPropsWithRef<'div'> {}
export function XhTreeSelectTree({ children, ...rest }: XhTreeSelectTreeProps): ReactNode {
  const ctx = useTreeSelectContext()
  return <div {...mergeReactProps(ctx.api.getTreeProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhTreeSelectItemProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  value: string
}
export function XhTreeSelectItem({ value, children, ...rest }: XhTreeSelectItemProps): ReactNode {
  const ctx = useTreeSelectContext()
  const node = useMemo(() => ({ value }), [value])
  const el = useRef<HTMLElement | null>(null)
  // 节点的聚焦上报不冒泡，改装成原生监听器
  const bind = useNativeEvents(ctx.api.getItemProps(node) as Record<string, unknown>, ['onFocus'])
  useNodeFocusReport(ctx.service, el, value)
  return (
    <TreeSelectNodeProvider value={node}>
      <div
        {...mergeReactProps(
          bind.attrs,
          rest as Record<string, unknown>,
          { ref: bind.ref },
          { ref: (n: HTMLDivElement | null) => { el.current = n } },
        )}
      >
        {children}
      </div>
    </TreeSelectNodeProvider>
  )
}

export interface XhTreeSelectItemTextProps extends ComponentPropsWithRef<'span'> {}
export function XhTreeSelectItemText({ children, ...rest }: XhTreeSelectItemTextProps): ReactNode {
  const ctx = useTreeSelectContext()
  const node = useTreeSelectNodeContext()
  return <span {...mergeReactProps(ctx.api.getItemTextProps(node) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhTreeSelectItemIndicatorProps extends ComponentPropsWithRef<'span'> {}
export function XhTreeSelectItemIndicator({ children, ...rest }: XhTreeSelectItemIndicatorProps): ReactNode {
  const ctx = useTreeSelectContext()
  const node = useTreeSelectNodeContext()
  return <span {...mergeReactProps(ctx.api.getItemIndicatorProps(node) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhTreeSelectBranchProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  value: string
}
/** 分支自身也是 treeitem，供其子部件读取；子节点各自再挂一层。 */
export function XhTreeSelectBranch({ value, children, ...rest }: XhTreeSelectBranchProps): ReactNode {
  const ctx = useTreeSelectContext()
  const node = useMemo(() => ({ value }), [value])
  const el = useRef<HTMLElement | null>(null)
  // 节点的聚焦上报不冒泡，改装成原生监听器
  const bind = useNativeEvents(ctx.api.getBranchProps(node) as Record<string, unknown>, ['onFocus'])
  useNodeFocusReport(ctx.service, el, value)
  return (
    <TreeSelectNodeProvider value={node}>
      <div
        {...mergeReactProps(
          bind.attrs,
          rest as Record<string, unknown>,
          { ref: bind.ref },
          { ref: (n: HTMLDivElement | null) => { el.current = n } },
        )}
      >
        {children}
      </div>
    </TreeSelectNodeProvider>
  )
}

export interface XhTreeSelectBranchControlProps extends ComponentPropsWithRef<'div'> {}
export function XhTreeSelectBranchControl({ children, ...rest }: XhTreeSelectBranchControlProps): ReactNode {
  const ctx = useTreeSelectContext()
  const node = useTreeSelectNodeContext()
  return <div {...mergeReactProps(ctx.api.getBranchControlProps(node) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhTreeSelectBranchTriggerProps extends ComponentPropsWithRef<'span'> {}
export function XhTreeSelectBranchTrigger({ children, ...rest }: XhTreeSelectBranchTriggerProps): ReactNode {
  const ctx = useTreeSelectContext()
  const node = useTreeSelectNodeContext()
  return <span {...mergeReactProps(ctx.api.getBranchTriggerProps(node) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhTreeSelectBranchIndicatorProps extends ComponentPropsWithRef<'span'> {}
export function XhTreeSelectBranchIndicator({ children, ...rest }: XhTreeSelectBranchIndicatorProps): ReactNode {
  const ctx = useTreeSelectContext()
  const node = useTreeSelectNodeContext()
  return <span {...mergeReactProps(ctx.api.getBranchIndicatorProps(node) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhTreeSelectBranchTextProps extends ComponentPropsWithRef<'span'> {}
export function XhTreeSelectBranchText({ children, ...rest }: XhTreeSelectBranchTextProps): ReactNode {
  const ctx = useTreeSelectContext()
  const node = useTreeSelectNodeContext()
  return <span {...mergeReactProps(ctx.api.getBranchTextProps(node) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhTreeSelectBranchContentProps extends ComponentPropsWithRef<'div'> {}
/** 收起只加 hidden，不卸载子树节点。 */
export function XhTreeSelectBranchContent({ children, ...rest }: XhTreeSelectBranchContentProps): ReactNode {
  const ctx = useTreeSelectContext()
  const node = useTreeSelectNodeContext()
  return <div {...mergeReactProps(ctx.api.getBranchContentProps(node) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhTreeSelectEmptyProps extends ComponentPropsWithRef<'div'> {}
/** 空态占位：写在 content 里、tree 的兄弟，不进 role=tree 的拥有关系。 */
export function XhTreeSelectEmpty({ children, ...rest }: XhTreeSelectEmptyProps): ReactNode {
  const ctx = useTreeSelectContext()
  return <div {...mergeReactProps(ctx.api.getEmptyProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhTreeSelectLoadingProps extends ComponentPropsWithRef<'div'> {}
/** 在途占位：与空态占位同一个位置，取数期间顶上来。 */
export function XhTreeSelectLoading({ children, ...rest }: XhTreeSelectLoadingProps): ReactNode {
  const ctx = useTreeSelectContext()
  return <div {...mergeReactProps(ctx.api.getLoadingProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhTreeSelectFooterProps extends ComponentPropsWithRef<'div'> {}
/** 浮层底部的操作区：写在 content 里、tree 的兄弟，走不到方向键与连打检索。 */
export function XhTreeSelectFooter({ children, ...rest }: XhTreeSelectFooterProps): ReactNode {
  const ctx = useTreeSelectContext()
  return <div {...mergeReactProps(ctx.api.getFooterProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhTreeSelectHiddenInputProps extends Omit<ComponentPropsWithRef<'input'>, 'value' | 'defaultValue' | 'type'> {}
/** 表单出口，不写这个部件即不参与表单提交。 */
export function XhTreeSelectHiddenInput({ ...rest }: XhTreeSelectHiddenInputProps): ReactNode {
  const ctx = useTreeSelectContext()
  return ctx.api.value.map(value => (
    <input
      key={value}
      {...mergeReactProps(
        ctx.api.getHiddenInputProps({ value }) as Record<string, unknown>,
        // 值攥在机器里，这份影子输入没有自己的变更出口。React 要求带 value 的输入
        // 交出一个出口，否则在开发构建里逐帧告警；节点是 hidden，这个出口不会被调用
        { onChange: noop },
        rest as Record<string, unknown>,
      )}
    />
  ))
}

function noop(): void {}

/** 按 collection 递归铺节点：带 children 的落成 branch，其余落成 item。 */
function renderNodes(nodes: readonly TreeSelectNode[]): ReactNode[] {
  return nodes.map(node => (node.children || node.hasChildren)
    ? (
        <XhTreeSelectBranch key={node.value} value={node.value}>
          <XhTreeSelectBranchControl>
            <XhTreeSelectBranchTrigger />
            <XhTreeSelectBranchText>{node.label ?? node.value}</XhTreeSelectBranchText>
            <XhTreeSelectItemIndicator />
          </XhTreeSelectBranchControl>
          <XhTreeSelectBranchContent>{renderNodes(node.children ?? [])}</XhTreeSelectBranchContent>
        </XhTreeSelectBranch>
      )
    : (
        <XhTreeSelectItem key={node.value} value={node.value}>
          <XhTreeSelectItemIndicator />
          <XhTreeSelectItemText>{node.label ?? node.value}</XhTreeSelectItemText>
        </XhTreeSelectItem>
      ))
}

/**
 * 没写 children 时按 collection 铺开的整套结构，作者只交数据。
 * 与手写部件产出的 DOM 完全一致，要改结构就写 children，行为不变。
 */
function DefaultTree(props: {
  collection: readonly TreeSelectNode[]
  label?: ReactNode
  clearable?: boolean
}): ReactNode {
  return (
    <>
      {props.label != null ? <XhTreeSelectLabel>{props.label}</XhTreeSelectLabel> : null}
      {/* 盒里放触发器；清空钮是触发器的兄弟（按钮不能套按钮） */}
      <XhTreeSelectControl>
        <XhTreeSelectTrigger>
          <XhTreeSelectValueText />
          <XhTreeSelectIndicator />
        </XhTreeSelectTrigger>
        {props.clearable ? <XhTreeSelectClearTrigger /> : null}
      </XhTreeSelectControl>
      <XhTreeSelectPositioner>
        <XhTreeSelectContent>
          <XhTreeSelectTree>{renderNodes(props.collection)}</XhTreeSelectTree>
        </XhTreeSelectContent>
      </XhTreeSelectPositioner>
    </>
  )
}
