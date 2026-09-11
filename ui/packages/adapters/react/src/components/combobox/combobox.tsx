import type { ControlVariant, Direction, Placement, Size, Tone } from '@xihan-ui/core'
import type { ComboboxApi, ComboboxInputBehavior, ComboboxInputEl, ComboboxInputHost, ComboboxNode, ComboboxNodeMeta, ComboboxSchema } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { useEffect, useMemo } from 'react'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { XhPortal } from '../../runtime/portal'
import { renderSlot } from '../../runtime/slot-content'
import { useScrollbars } from '../../runtime/use-scrollbars'
import { useFieldLabelWiring, useFieldStateWiring } from '../field/use-field-control'
import {
  ComboboxGroupProvider,
  ComboboxItemProvider,
  ComboboxProvider,
  useComboboxContext,
  useComboboxGroupContext,
  useComboboxItemContext,
} from './context'
import { useCombobox } from './use-combobox'

type ComboboxProps = ComboboxSchema['props']

/** 函数式 children 的载荷：展开状态、选中值、输入串、高亮候选、空态，与改这些的命令。 */
export type ComboboxRootSlotProps = Pick<
  ComboboxApi,
  'open' | 'value' | 'inputValue' | 'highlightedValue' | 'empty' | 'isSelected' | 'setOpen' | 'setValue' | 'setInputValue' | 'clear'
>

/** 根上自有的那些取值；dir 与原生的同名属性含义不同，由这里接管。 */
type RootElementProps = Omit<ComponentPropsWithRef<'div'>, 'children' | 'dir'>

export interface XhComboboxRootProps extends RootElementProps {
  collection?: ComboboxNode[]
  /** 标题文字。给了它就不必再写 label 部件。 */
  label?: ReactNode
  /** 无匹配时的提示语。给了它就不必再写 empty 部件。 */
  empty?: ReactNode
  value?: string | string[]
  defaultValue?: string | string[]
  inputValue?: string
  defaultInputValue?: string
  open?: boolean
  defaultOpen?: boolean
  /** 表单字段名；给了 hidden-input 才带 name 并参与提交。 */
  name?: string
  /** 显式关联的原生表单 ID。 */
  form?: string
  multiple?: boolean
  disabled?: boolean
  readOnly?: boolean
  invalid?: boolean
  loading?: boolean
  loop?: boolean
  placeholder?: string
  /** 自动铺开时是否渲染清空钮；手写部件模式不看它，写了节点即可清。 */
  clearable?: boolean
  translations?: ComboboxProps['translations']
  allowCustomValue?: boolean
  openOnClick?: boolean
  inputBehavior?: ComboboxInputBehavior
  placement?: Placement
  offset?: number
  dir?: Direction
  variant?: ControlVariant
  tone?: Tone
  size?: Size
  onValueChange?: ComboboxProps['onValueChange']
  onInputValueChange?: ComboboxProps['onInputValueChange']
  onOpenChange?: ComboboxProps['onOpenChange']
  /** 每个候选的自定义内容；不给就用 collection 里的 label。 */
  renderItem?: (node: ComboboxNodeMeta) => ReactNode
  children?: SlotChildren<ComboboxRootSlotProps>
}

export function XhComboboxRoot({
  collection,
  label,
  empty,
  value,
  defaultValue,
  inputValue,
  defaultInputValue,
  open,
  defaultOpen,
  name,
  form,
  multiple,
  disabled,
  readOnly,
  invalid,
  loading,
  loop,
  placeholder,
  clearable,
  translations,
  allowCustomValue,
  openOnClick,
  inputBehavior,
  placement,
  offset,
  dir,
  variant,
  tone,
  size,
  onValueChange,
  onInputValueChange,
  onOpenChange,
  renderItem,
  children,
  ...rest
}: XhComboboxRootProps): ReactNode {
  const ctx = useCombobox(withXhConfig('combobox', {
    collection,
    value,
    defaultValue,
    inputValue,
    defaultInputValue,
    open,
    defaultOpen,
    name,
    form,
    multiple,
    disabled,
    readOnly,
    invalid,
    loading,
    loop,
    placeholder,
    clearable,
    translations,
    allowCustomValue,
    openOnClick,
    inputBehavior,
    placement,
    offset,
    dir,
    variant,
    tone,
    size,
    onValueChange,
    onInputValueChange,
    onOpenChange,
  }) as ComboboxProps)
  const api = ctx.api

  // 首帧结算一次候选条数供空态节点判断，之后的增删由候选自己上报
  const { syncItems } = ctx
  useEffect(syncItems)

  const body = children != null
    ? renderSlot(children, {
        open: api.open,
        value: api.value,
        inputValue: api.inputValue,
        highlightedValue: api.highlightedValue,
        empty: api.empty,
        isSelected: api.isSelected,
        setOpen: api.setOpen,
        setValue: api.setValue,
        setInputValue: api.setInputValue,
        clear: api.clear,
      })
    : collection
      ? (
          <DefaultTree
            collection={api.collection}
            label={label}
            empty={empty}
            clearable={clearable}
            renderItem={renderItem}
          />
        )
      : null

  return (
    <ComboboxProvider value={ctx}>
      <div
        {...mergeReactProps(
          api.getRootProps() as Record<string, unknown>,
          rest as Record<string, unknown>,
          { ref: (el: HTMLDivElement | null) => { ctx.rootRef.current = el } },
        )}
      >
        {body}
      </div>
    </ComboboxProvider>
  )
}

XhComboboxRoot.xhEvents = ['value-change', 'input-value-change', 'open-change'] as const

export interface XhComboboxLabelProps extends ComponentPropsWithRef<'label'> {}
/** 用原生 label，connect 给的 for 指向输入框。 */
export function XhComboboxLabel({ children, ...rest }: XhComboboxLabelProps): ReactNode {
  const ctx = useComboboxContext()
  return <label {...mergeReactProps(ctx.api.getLabelProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</label>
}

export interface XhComboboxControlProps extends ComponentPropsWithRef<'div'> {}
/** 盒：输入框、清空钮与展开钮在里面并排，描边、底色与聚焦环都长在它上面。 */
export function XhComboboxControl({ children, ...rest }: XhComboboxControlProps): ReactNode {
  const ctx = useComboboxContext()
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

export interface XhComboboxInputProps extends Omit<ComponentPropsWithRef<'input'>, 'value' | 'defaultValue'> {
  /**
   * 输入框渲染成哪个标签，默认 input。
   * 写 textarea 即多行宿主：connect 随之撤掉 type、role 与 aria-expanded。
   */
  as?: ComboboxInputHost
}
export function XhComboboxInput({ as = 'input', ...rest }: XhComboboxInputProps): ReactNode {
  const ctx = useComboboxContext()
  // 字段的说明与校验状态要落在真控件上，不能停在封装根的 div 上
  const fieldWiring = useFieldStateWiring()
  // 字段的标签也得并进名字链：控件自带的那条指的是它自己那个没渲染的 label 部件
  const fieldLabel = useFieldLabelWiring()
  const props = mergeReactProps(
    fieldLabel({ ...ctx.api.getInputProps({ as }) as Record<string, unknown>, ...fieldWiring }),
    rest as Record<string, unknown>,
    { ref: (el: ComboboxInputEl | null) => { ctx.inputRef.current = el } },
  )
  // 自己渲染宿主节点，label 的 for 指向它
  return as === 'textarea'
    ? <textarea {...props as ComponentPropsWithRef<'textarea'>} />
    : <input {...props as ComponentPropsWithRef<'input'>} />
}

export interface XhComboboxTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhComboboxTrigger({ children, ...rest }: XhComboboxTriggerProps): ReactNode {
  const ctx = useComboboxContext()
  return <button {...mergeReactProps(ctx.api.getTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

export interface XhComboboxClearTriggerProps extends ComponentPropsWithRef<'button'> {}
/** 节点常挂，清不了时靠 hidden 藏掉。 */
export function XhComboboxClearTrigger({ children, ...rest }: XhComboboxClearTriggerProps): ReactNode {
  const ctx = useComboboxContext()
  return <button {...mergeReactProps(ctx.api.getClearTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

export interface XhComboboxPositionerProps extends ComponentPropsWithRef<'div'> {
  /** 浮层挂到哪个容器；不给就按全局配置，再不给挂 body。 */
  container?: () => Element | null
}
/** 搬到浮层落点：留在原地的话，宿主祖先只要建了层叠上下文就能盖住浮层。 */
export function XhComboboxPositioner({ children, container, ...rest }: XhComboboxPositionerProps): ReactNode {
  const ctx = useComboboxContext()
  // 候选列表的自绘条：与 content 同级、绝对定位不占布局，壳是这层已经 fixed 的 positioner
  const bars = useScrollbars({ scrollable: () => ctx.contentRef.current })
  return (
    <XhPortal container={container ?? ctx.portalContainer} source={ctx.controlRef}>
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

export interface XhComboboxContentProps extends ComponentPropsWithRef<'div'> {}
export function XhComboboxContent({ children, ...rest }: XhComboboxContentProps): ReactNode {
  const ctx = useComboboxContext()
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

export interface XhComboboxGroupProps extends ComponentPropsWithRef<'div'> {
  value: string
}
export function XhComboboxGroup({ value, children, ...rest }: XhComboboxGroupProps): ReactNode {
  const ctx = useComboboxContext()
  const group = useMemo(() => ({ value }), [value])
  return (
    <ComboboxGroupProvider value={group}>
      <div {...mergeReactProps(ctx.api.getGroupProps(group) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
    </ComboboxGroupProvider>
  )
}

export interface XhComboboxGroupLabelProps extends ComponentPropsWithRef<'span'> {}
export function XhComboboxGroupLabel({ children, ...rest }: XhComboboxGroupLabelProps): ReactNode {
  const ctx = useComboboxContext()
  const group = useComboboxGroupContext()
  return <span {...mergeReactProps(ctx.api.getGroupLabelProps(group) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhComboboxItemProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  value: string
  /** 缺省交给 connect 回 collection 里查，写死 false 会盖掉数据里的禁用。 */
  disabled?: boolean
}
export function XhComboboxItem({ value, disabled, children, ...rest }: XhComboboxItemProps): ReactNode {
  const ctx = useComboboxContext()
  const item = useMemo(() => ({ value, disabled }), [value, disabled])
  // 指针离开候选不冒泡，改装成原生监听器
  const bind = useNativeEvents(ctx.api.getItemProps(item) as Record<string, unknown>, ['onPointerLeave'])

  // 候选的进出由条目自己上报，机器据此结算条数并摘掉悬空高亮；
  // 节点就地复用时数量不变但身份换了，跟着 value 再报一次
  const { syncItems } = ctx
  useEffect(() => {
    syncItems()
    return syncItems
  }, [syncItems, value])

  return (
    <ComboboxItemProvider value={item}>
      <div {...mergeReactProps(bind.attrs, rest as Record<string, unknown>, { ref: bind.ref })}>
        {children}
      </div>
    </ComboboxItemProvider>
  )
}

export interface XhComboboxItemTextProps extends ComponentPropsWithRef<'span'> {}
export function XhComboboxItemText({ children, ...rest }: XhComboboxItemTextProps): ReactNode {
  const ctx = useComboboxContext()
  const item = useComboboxItemContext()
  return <span {...mergeReactProps(ctx.api.getItemTextProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhComboboxItemIndicatorProps extends ComponentPropsWithRef<'span'> {}
export function XhComboboxItemIndicator({ children, ...rest }: XhComboboxItemIndicatorProps): ReactNode {
  const ctx = useComboboxContext()
  const item = useComboboxItemContext()
  return <span {...mergeReactProps(ctx.api.getItemIndicatorProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhComboboxHiddenInputProps extends Omit<ComponentPropsWithRef<'input'>, 'value' | 'defaultValue' | 'type'> {}
/** 表单出口，不写这个部件即不参与表单提交。 */
export function XhComboboxHiddenInput({ ...rest }: XhComboboxHiddenInputProps): ReactNode {
  const ctx = useComboboxContext()
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

export interface XhComboboxEmptyProps extends ComponentPropsWithRef<'div'> {}
/** 放在 positioner 里作 content 的兄弟节点，不进 role=listbox。 */
export function XhComboboxEmpty({ children, ...rest }: XhComboboxEmptyProps): ReactNode {
  const ctx = useComboboxContext()
  return <div {...mergeReactProps(ctx.api.getEmptyProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhComboboxLoadingProps extends ComponentPropsWithRef<'div'> {}
/** 在途占位：与空态占位同一个位置，取数期间顶上来。 */
export function XhComboboxLoading({ children, ...rest }: XhComboboxLoadingProps): ReactNode {
  const ctx = useComboboxContext()
  return <div {...mergeReactProps(ctx.api.getLoadingProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

function noop(): void {}

/**
 * 没写 children 时按 collection 铺开的整套结构，作者只交数据。
 * 与手写部件产出的 DOM 完全一致，要改结构就写 children，行为不变。
 * 过滤仍归调用方：collection 就是此刻该显示的那几条候选。
 */
function DefaultTree(props: {
  collection: readonly ComboboxNodeMeta[]
  label?: ReactNode
  empty?: ReactNode
  clearable?: boolean
  renderItem?: (node: ComboboxNodeMeta) => ReactNode
}): ReactNode {
  return (
    <>
      {props.label != null ? <XhComboboxLabel>{props.label}</XhComboboxLabel> : null}
      <XhComboboxControl>
        <XhComboboxInput />
        {props.clearable ? <XhComboboxClearTrigger /> : null}
        <XhComboboxTrigger />
      </XhComboboxControl>
      <XhComboboxPositioner>
        <XhComboboxContent>
          {props.collection.map(node => (
            <XhComboboxItem key={node.value} value={node.value}>
              <XhComboboxItemText>{props.renderItem?.(node) ?? node.label}</XhComboboxItemText>
              <XhComboboxItemIndicator />
            </XhComboboxItem>
          ))}
        </XhComboboxContent>
        {/* 空态节点是 content 的兄弟，不进 role=listbox */}
        <XhComboboxEmpty>{props.empty}</XhComboboxEmpty>
      </XhComboboxPositioner>
    </>
  )
}
