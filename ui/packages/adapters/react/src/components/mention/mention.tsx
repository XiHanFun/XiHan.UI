import type { ControlVariant, Direction, Placement, Size, Tone } from '@xihan-ui/core'
import type { MentionApi, MentionInputEl, MentionInputHost, MentionNode, MentionNodeMeta, MentionSchema, MentionTranslations } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { useEffect, useMemo } from 'react'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { XhPortal } from '../../runtime/portal'
import { renderSlot } from '../../runtime/slot-content'
import { useScrollbars } from '../../runtime/use-scrollbars'
import { useFieldLabelWiring, useFieldStateWiring } from '../field/use-field-control'
import { MentionItemProvider, MentionProvider, useMentionContext, useMentionItemContext } from './context'
import { useMention } from './use-mention'

type MentionProps = MentionSchema['props']

/** 函数式 children 的载荷：浮层开合、正文与查询串、高亮候选，以及改写正文与收起浮层的句柄。 */
export type MentionRootSlotProps = Pick<
  MentionApi,
  | 'open'
  | 'value'
  | 'query'
  | 'activePrefix'
  | 'highlightedValue'
  | 'setValue'
  | 'close'
>

/** 根上自有的那些取值；defaultValue、dir 与 onSelect 与原生的同名属性含义不同，由这里接管。 */
type RootElementProps = Omit<ComponentPropsWithRef<'div'>, 'children' | 'defaultValue' | 'dir' | 'onSelect'>

export interface XhMentionRootProps extends RootElementProps {
  /** 开候选的前缀字符，缺省 '@'；给数组即多种前缀并存。 */
  triggerPrefix?: string | string[]
  collection?: MentionNode[]
  value?: string
  defaultValue?: string
  disabled?: boolean
  loading?: boolean
  /** 表单字段名；给了输入框才带 name，整段正文随表单一并提交。 */
  name?: string
  readOnly?: boolean
  invalid?: boolean
  placeholder?: string
  loop?: boolean
  placement?: Placement
  offset?: number
  /** 文字方向；浮层搬到落点后继承不到作者子树上的方向，要 RTL 就显式给。 */
  dir?: Direction
  translations?: MentionTranslations
  variant?: ControlVariant
  tone?: Tone
  size?: Size
  onValueChange?: MentionProps['onValueChange']
  onQueryChange?: MentionProps['onQueryChange']
  onSelect?: MentionProps['onSelect']
  onOpenChange?: MentionProps['onOpenChange']
  /** 铺开 collection 时每条候选的内容；不给就用 collection 里的 label。 */
  renderItem?: (node: MentionNodeMeta) => ReactNode
  /** 铺开 collection 时空态里那句话；不写走内建英文。 */
  empty?: ReactNode
  children?: SlotChildren<MentionRootSlotProps>
}

export function XhMentionRoot({
  triggerPrefix,
  collection,
  value,
  defaultValue,
  disabled,
  loading,
  name,
  readOnly,
  invalid,
  placeholder,
  loop,
  placement,
  offset,
  dir,
  translations,
  variant,
  tone,
  size,
  onValueChange,
  onQueryChange,
  onSelect,
  onOpenChange,
  children,
  renderItem,
  empty,
  ...rest
}: XhMentionRootProps): ReactNode {
  const machineProps = {
    triggerPrefix,
    collection,
    value,
    defaultValue,
    disabled,
    loading,
    name,
    readOnly,
    invalid,
    placeholder,
    loop,
    placement,
    offset,
    dir,
    translations,
    variant,
    tone,
    size,
    onValueChange,
    onQueryChange,
    onSelect,
    onOpenChange,
  }
  const ctx = useMention(withXhConfig('mention', machineProps) as MentionProps)
  const api = ctx.api

  // 首帧结算一次候选条数，之后的增删由条目自己上报
  const { syncItems } = ctx
  useEffect(syncItems)

  const body = children != null
    ? renderSlot(children, {
        open: api.open,
        value: api.value,
        query: api.query,
        activePrefix: api.activePrefix,
        highlightedValue: api.highlightedValue,
        setValue: api.setValue,
        close: api.close,
      })
    : collection
      ? <DefaultTree collection={api.collection} empty={empty} renderItem={renderItem} />
      : null

  return (
    <MentionProvider value={ctx}>
      <div
        {...mergeReactProps(
          api.getRootProps() as Record<string, unknown>,
          rest as Record<string, unknown>,
          { ref: (el: HTMLDivElement | null) => { ctx.rootRef.current = el } },
        )}
      >
        {body}
      </div>
    </MentionProvider>
  )
}

XhMentionRoot.xhEvents = ['value-change', 'query-change', 'select', 'open-change'] as const

export interface XhMentionLabelProps extends ComponentPropsWithRef<'label'> {}
/** 用原生 label，connect 给的 for 恒写向输入框。 */
export function XhMentionLabel({ children, ...rest }: XhMentionLabelProps): ReactNode {
  const ctx = useMentionContext()
  return <label {...mergeReactProps(ctx.api.getLabelProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</label>
}

export interface XhMentionInputProps extends Omit<ComponentPropsWithRef<'textarea'>, 'value' | 'defaultValue'> {
  /**
   * 输入框渲染成哪个标签，默认 textarea。
   * 写 input 即单行宿主：connect 随之补上 type、role 与 aria-expanded。
   */
  as?: MentionInputHost
}
export function XhMentionInput({ as = 'textarea', ...rest }: XhMentionInputProps): ReactNode {
  const ctx = useMentionContext()
  // 字段的说明与校验状态要落在真控件上，不能停在封装根的 div 上
  const fieldWiring = useFieldStateWiring()
  // 字段的标签也得并进名字链：控件自带的那条指的是它自己那个没渲染的 label 部件
  const fieldLabel = useFieldLabelWiring()
  const props = mergeReactProps(
    fieldLabel({ ...ctx.api.getInputProps({ as }) as Record<string, unknown>, ...fieldWiring }),
    rest as Record<string, unknown>,
    { ref: (el: MentionInputEl | null) => { ctx.inputRef.current = el } },
  )
  // 自己渲染宿主节点，label 的 for 指向它
  return as === 'input'
    ? <input {...props as ComponentPropsWithRef<'input'>} />
    : <textarea {...props as ComponentPropsWithRef<'textarea'>} />
}

export interface XhMentionPositionerProps extends ComponentPropsWithRef<'div'> {
  /** 浮层挂到哪个容器；不给就按全局配置，再不给挂 body。 */
  container?: () => Element | null
}
/** 搬到浮层落点：留在原地的话，宿主祖先只要建了层叠上下文就能盖住浮层。 */
export function XhMentionPositioner({ children, container, ...rest }: XhMentionPositionerProps): ReactNode {
  const ctx = useMentionContext()
  // 候选列表的自绘条：与 content 同级、绝对定位不占布局，壳是这层已经 fixed 的 positioner
  const bars = useScrollbars({ scrollable: () => ctx.contentRef.current })
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
        {bars.render()}
      </div>
    </XhPortal>
  )
}

export interface XhMentionContentProps extends ComponentPropsWithRef<'div'> {}
export function XhMentionContent({ children, ...rest }: XhMentionContentProps): ReactNode {
  const ctx = useMentionContext()
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

export interface XhMentionEmptyProps extends ComponentPropsWithRef<'div'> {}
/** 一条候选都没有时显出的空态；与候选面板同级，不进 role=listbox。 */
export function XhMentionEmpty({ children, ...rest }: XhMentionEmptyProps): ReactNode {
  const ctx = useMentionContext()
  return <div {...mergeReactProps(ctx.api.getEmptyProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhMentionLoadingProps extends ComponentPropsWithRef<'div'> {}
/** 候选还在取时顶上来的在途占位；与候选面板同级。 */
export function XhMentionLoading({ children, ...rest }: XhMentionLoadingProps): ReactNode {
  const ctx = useMentionContext()
  return <div {...mergeReactProps(ctx.api.getLoadingProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhMentionItemProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  value: string
  /** 缺省交给 connect 回 collection 里查，写死 false 会盖掉数据里的禁用。 */
  disabled?: boolean
}
export function XhMentionItem({ value, disabled, children, ...rest }: XhMentionItemProps): ReactNode {
  const ctx = useMentionContext()
  const item = useMemo(() => ({ value, disabled }), [value, disabled])

  // 候选的进出由条目自己上报，机器据此结算条数并摘掉悬空高亮；
  // 节点就地复用时数量不变但身份换了，跟着 value 再报一次
  const { syncItems } = ctx
  useEffect(() => {
    syncItems()
    return syncItems
  }, [syncItems, value])

  return (
    <MentionItemProvider value={item}>
      <div {...mergeReactProps(ctx.api.getItemProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>
        {children}
      </div>
    </MentionItemProvider>
  )
}

export interface XhMentionItemTextProps extends ComponentPropsWithRef<'span'> {}
export function XhMentionItemText({ children, ...rest }: XhMentionItemTextProps): ReactNode {
  const ctx = useMentionContext()
  const item = useMentionItemContext()
  return <span {...mergeReactProps(ctx.api.getItemTextProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

/**
 * 没写 children 时按 collection 铺开的整套结构，作者只交数据。
 * 与手写部件产出的 DOM 完全一致，要改结构就写 children，行为不变。
 * 过滤仍归调用方：collection 就是此刻该显示的那几条候选。
 */
function DefaultTree(props: {
  collection: readonly MentionNodeMeta[]
  empty?: ReactNode
  renderItem?: (node: MentionNodeMeta) => ReactNode
}): ReactNode {
  return (
    <>
      <XhMentionInput />
      <XhMentionPositioner>
        <XhMentionContent>
          {props.collection.map(node => (
            <XhMentionItem key={node.value} value={node.value}>
              <XhMentionItemText>{props.renderItem?.(node) ?? node.label}</XhMentionItemText>
            </XhMentionItem>
          ))}
        </XhMentionContent>
        {/* 空态节点是 content 的兄弟，不进 role=listbox */}
        <XhMentionEmpty>{props.empty ?? 'No results'}</XhMentionEmpty>
      </XhMentionPositioner>
    </>
  )
}
