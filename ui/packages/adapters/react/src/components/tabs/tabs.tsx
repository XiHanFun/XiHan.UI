import type { Direction, Orientation, Size, Tone } from '@xihan-ui/core'
import type { TabsActivationMode, TabsNode, TabsNodeMeta, TabsSchema, TabsVariant } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { useEffect, useRef } from 'react'
import { withXhConfig } from '../../config/config'
import { useIsomorphicLayoutEffect } from '../../runtime/layout-effect'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { slotPaints } from '../../runtime/slot-content'
import { TabsProvider, useTabsContext } from './context'
import { useTabs } from './use-tabs'

type TabsProps = TabsSchema['props']

/** 根上自有的那些取值；defaultValue 与 dir 与原生的同名属性含义不同，由这里接管。 */
type RootElementProps = Omit<ComponentPropsWithRef<'div'>, 'children' | 'defaultValue' | 'dir'>

export interface XhTabsRootProps extends RootElementProps {
  collection?: TabsNode[]
  value?: string | null
  defaultValue?: string | null
  orientation?: Orientation
  dir?: Direction
  /** automatic：方向键走到哪就选中哪；manual：方向键只搬焦点，Enter / Space 才选中。 */
  activationMode?: TabsActivationMode
  loop?: boolean
  variant?: TabsVariant
  tone?: Tone
  size?: Size
  /** 标签可以拖着换位。整个标签都是拖动源，不另出把手。 */
  reorderable?: boolean
  /** 标签可关闭：焦点落在标签上按 Delete / Backspace 即发 tab-close。 */
  closable?: boolean
  translations?: TabsProps['translations']
  onValueChange?: TabsProps['onValueChange']
  /** 换位是通知，标签序的真源在使用者的数据里。 */
  onTabMove?: TabsProps['onTabMove']
  /** 关闭同理：库不持有标签序，只发意图。 */
  onTabClose?: TabsProps['onTabClose']
  /** 每块面板的内容；不给就是空面板。 */
  renderPanel?: (node: TabsNodeMeta) => ReactNode
  children?: ReactNode
}

export function XhTabsRoot({
  collection,
  value,
  defaultValue,
  orientation,
  dir,
  activationMode,
  loop,
  variant,
  tone,
  size,
  reorderable,
  closable,
  translations,
  onValueChange,
  onTabMove,
  onTabClose,
  renderPanel,
  children,
  ...rest
}: XhTabsRootProps): ReactNode {
  const ctx = useTabs(withXhConfig('tabs', {
    collection,
    value,
    defaultValue,
    orientation,
    dir,
    activationMode,
    loop,
    variant,
    tone,
    size,
    reorderable,
    closable,
    translations,
    onValueChange,
    onTabMove,
    onTabClose,
  }) as TabsProps)
  // children 里有真会画出东西的节点就照旧交给作者；只剩空白时当没写，
  // 给了 collection 就按数据铺开整套结构
  const body = slotPaints(children)
    ? children
    : (collection ? <DefaultTree collection={ctx.api.collection} renderPanel={renderPanel} /> : null)
  return (
    <TabsProvider value={ctx}>
      <div {...mergeReactProps(ctx.api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{body}</div>
    </TabsProvider>
  )
}

XhTabsRoot.xhEvents = ['value-change', 'tab-move', 'tab-close'] as const

export interface XhTabsListProps extends ComponentPropsWithRef<'div'> {}
export function XhTabsList({ children, ...rest }: XhTabsListProps): ReactNode {
  const ctx = useTabsContext()
  // 容器的 onFocus 是 DOM 的 focus（不冒泡，只在容器自己得焦时接管）。React 的同名合成事件
  // 挂的是冒泡的 focusin，标签得焦也会把它叫起来，那一下会把焦点从标签抢回锚点上——
  // 装成原生监听器，到达路径才与另外两家一致。onFocusout 归到的 onBlur 本就是冒泡的 focusout，不动它
  const bind = useNativeEvents(ctx.api.getListProps() as Record<string, unknown>, ['onFocus'])
  return (
    <div
      {...mergeReactProps(
        bind.attrs,
        { ref: bind.ref },
        rest as Record<string, unknown>,
        { ref: (el: HTMLDivElement | null) => { ctx.listRef.current = el } },
      )}
    >
      {children}
    </div>
  )
}

export interface XhTabsIndicatorProps extends ComponentPropsWithRef<'div'> {}
/** 选中标签下的滑条：位置由机器量好写进内联样式；住在 list 里，以 list 为定位参照系。 */
export function XhTabsIndicator({ children, ...rest }: XhTabsIndicatorProps): ReactNode {
  const ctx = useTabsContext()
  return <div {...mergeReactProps(ctx.api.getIndicatorProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhTabsSeparatorProps extends ComponentPropsWithRef<'div'> {}
/** 标签之间的细分隔线，纯装饰。 */
export function XhTabsSeparator({ children, ...rest }: XhTabsSeparatorProps): ReactNode {
  const ctx = useTabsContext()
  return <div {...mergeReactProps(ctx.api.getSeparatorProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhTabsLiveRegionProps extends ComponentPropsWithRef<'div'> {}
/**
 * 拖动过程的读屏播报区，视觉上不可见。
 *
 * 放在 root 里、与 list 部件平级。它必须在拖动开始之前就在 DOM 上——
 * 读屏不播报后插入的节点，等到拖起才渲出来等于没有。
 */
export function XhTabsLiveRegion({ ...rest }: XhTabsLiveRegionProps): ReactNode {
  const ctx = useTabsContext()
  return (
    <div {...mergeReactProps(ctx.api.getLiveRegionProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {ctx.api.announcement}
    </div>
  )
}

export interface XhTabsTriggerProps extends Omit<ComponentPropsWithRef<'button'>, 'value'> {
  value: string
  /** 缺省交给 connect 回 collection 里查，写死 false 会盖掉数据里的禁用。 */
  disabled?: boolean
}
export function XhTabsTrigger({ value, disabled, children, ...rest }: XhTabsTriggerProps): ReactNode {
  const ctx = useTabsContext()
  const itemEl = useRef<HTMLElement | null>(null)
  const previous = useRef(value)

  // 本节点持有焦点时，value 变更重报焦点标签
  useEffect(() => {
    const prev = previous.current
    previous.current = value
    if (prev === value)
      return
    const svc = ctx.service
    if (svc.getStatus() !== 'Started')
      return
    if (itemEl.current && svc.scope.getActiveElement() === itemEl.current)
      svc.send({ type: 'TRIGGER.FOCUS', value })
  }, [ctx.service, value])

  // 卸载时上报列表失焦：按「本节点当下正持有焦点」判定，不按 value 比对
  useIsomorphicLayoutEffect(() => () => {
    const svc = ctx.service
    if (svc.getStatus() !== 'Started')
      return
    if (itemEl.current && svc.scope.getActiveElement() === itemEl.current)
      svc.send({ type: 'LIST.BLUR' })
  }, [ctx.service])

  // 标签自己的 onFocus 同样是不冒泡的 DOM focus：改装成原生监听器，与另外两家同一条到达路径
  const bind = useNativeEvents(
    ctx.api.getTriggerProps({ value, disabled }) as Record<string, unknown>,
    ['onFocus'],
  )

  return (
    <button
      {...mergeReactProps(
        bind.attrs,
        { ref: bind.ref },
        rest as Record<string, unknown>,
        { ref: (el: HTMLButtonElement | null) => { itemEl.current = el } },
      )}
    >
      {children}
    </button>
  )
}

export interface XhTabsTabDragTriggerProps extends Omit<ComponentPropsWithRef<'span'>, 'value'> {
  /** 所属标签的 value。 */
  value: string
}
/**
 * 标签拖拽把手。放在标签里，自带 touch-action: none，按下即拖，不等激活距离。
 * 对读屏隐藏、也不占 Tab 位；键盘换位由标签带上的 Alt + 方向键承担。
 * 整个标签起手那一路照旧可用，把手是叠加的第二个入口。
 */
export function XhTabsTabDragTrigger({ value, children, ...rest }: XhTabsTabDragTriggerProps): ReactNode {
  const ctx = useTabsContext()
  return (
    <span
      {...mergeReactProps(
        ctx.api.getTabDragTriggerProps({ value }) as Record<string, unknown>,
        rest as Record<string, unknown>,
      )}
    >
      {children}
    </span>
  )
}

export interface XhTabsContentProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  value: string
}
export function XhTabsContent({ value, children, ...rest }: XhTabsContentProps): ReactNode {
  const ctx = useTabsContext()
  return (
    <div {...mergeReactProps(ctx.api.getContentProps({ value }) as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

/**
 * 没写 children 时按 collection 铺开的整套结构，作者只交数据。
 * 与手写部件产出的 DOM 完全一致，要改结构就写 children，行为不变。
 */
function DefaultTree(props: {
  collection: readonly TabsNodeMeta[]
  renderPanel?: (node: TabsNodeMeta) => ReactNode
}): ReactNode {
  return (
    <>
      <XhTabsList>
        {props.collection.map(node => (
          <XhTabsTrigger key={node.value} value={node.value}>{node.label}</XhTabsTrigger>
        ))}
      </XhTabsList>
      {props.collection.map(node => (
        <XhTabsContent key={node.value} value={node.value}>{props.renderPanel?.(node) ?? null}</XhTabsContent>
      ))}
    </>
  )
}
