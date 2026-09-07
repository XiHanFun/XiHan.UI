import type { Direction, OverlayBackdropVariant, Size } from '@xihan-ui/core'
import type { CommandApi, CommandGroup, CommandGroupMeta, CommandNode, CommandNodeMeta, CommandSchema } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { AsChildProps } from '../../runtime/as-child'
import type { SlotChildren } from '../../runtime/slot-content'
import { COMMAND_UNGROUPED, resolveCommandGroups } from '@xihan-ui/headless'
import { Fragment, useMemo } from 'react'
import { withXhConfig } from '../../config/config'
import { renderAsChild } from '../../runtime/as-child'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { XhPortal } from '../../runtime/portal'
import { renderSlot } from '../../runtime/slot-content'
import {
  CommandGroupProvider,
  CommandItemProvider,
  CommandProvider,
  useCommandContext,
  useCommandGroupContext,
  useCommandItemContext,
} from './context'
import { useCommand } from './use-command'

type CommandProps = CommandSchema['props']

/** 函数式 children 的载荷：开合、检索串、结果与锚点，以及改这些的命令。 */
export type CommandRootSlotProps = Pick<
  CommandApi,
  'open' | 'inputValue' | 'groups' | 'results' | 'highlightedValue' | 'empty' | 'setOpen' | 'setInputValue' | 'select'
>

export interface XhCommandRootProps {
  collection?: CommandNode[]
  groups?: CommandGroup[]
  open?: boolean
  defaultOpen?: boolean
  inputValue?: string
  defaultInputValue?: string
  /** 内置过滤，默认开；关掉即由调用方自己筛。 */
  filter?: boolean
  caseSensitive?: boolean
  closeOnSelect?: boolean
  modal?: boolean
  closeOnEscape?: boolean
  closeOnInteractOutside?: boolean
  restoreFocus?: boolean
  loop?: boolean
  loading?: boolean
  placeholder?: string
  /** 无匹配时的提示语。给了它就不必再写 empty 部件。 */
  empty?: ReactNode
  /** 铺开时的触发按钮内容；不给即不渲染触发器（面板改由快捷键或受控 open 唤起）。 */
  trigger?: ReactNode
  /** 铺开时浮层底部的操作区内容；不给即不渲染 footer 部件。 */
  footer?: ReactNode
  dir?: Direction
  size?: Size
  variant?: OverlayBackdropVariant
  translations?: CommandProps['translations']
  onOpenChange?: CommandProps['onOpenChange']
  onInputValueChange?: CommandProps['onInputValueChange']
  onSelect?: CommandProps['onSelect']
  /** 每条命令的自定义内容；不给就用清单里的 label。 */
  renderItem?: (node: CommandNodeMeta) => ReactNode
  children?: SlotChildren<CommandRootSlotProps>
}

export function XhCommandRoot({ children, empty, trigger, footer, renderItem, ...props }: XhCommandRootProps): ReactNode {
  const ctx = useCommand(withXhConfig('command', props) as CommandProps)
  const api = ctx.api

  // 铺开的是整份清单，不是过滤后那几条：此刻该不该露面由 connect 打在条目上的 hidden 说了算。
  // 只渲染命中的那几条会让「铺开」与「手写部件」产出两棵不同的 DOM
  const { collection, groups } = props
  const fullTree = useMemo(
    () => resolveCommandGroups(collection ?? [], groups ?? [], '', { filter: false, caseSensitive: false }),
    [collection, groups],
  )

  const body = children != null
    ? renderSlot(children, {
        open: api.open,
        inputValue: api.inputValue,
        groups: api.groups,
        results: api.results,
        highlightedValue: api.highlightedValue,
        empty: api.empty,
        setOpen: api.setOpen,
        setInputValue: api.setInputValue,
        select: api.select,
      })
    : (
        <DefaultTree
          tree={fullTree}
          trigger={trigger}
          empty={empty}
          footer={footer}
          renderItem={renderItem}
        />
      )

  return <CommandProvider value={ctx}>{body}</CommandProvider>
}

XhCommandRoot.xhEvents = ['open-change', 'input-value-change', 'select'] as const

export interface XhCommandTriggerProps extends ComponentPropsWithRef<'button'>, AsChildProps {}
export function XhCommandTrigger({ children, asChild, ...rest }: XhCommandTriggerProps): ReactNode {
  const ctx = useCommandContext()
  const props = mergeReactProps(
    ctx.api.getTriggerProps() as Record<string, unknown>,
    rest as Record<string, unknown>,
  )
  return renderAsChild(asChild, children, props, 'command', (p, kids) => <button {...p}>{kids}</button>)
}

export interface XhCommandContentProps extends ComponentPropsWithRef<'div'> {
  /** 浮层挂到哪个容器；不给就按全局配置，再不给挂 body。 */
  container?: () => Element | null
}
/** 搬到浮层落点：留在原地的话，宿主祖先只要建了层叠上下文就能盖住浮层。 */
export function XhCommandContent({ children, container, ...rest }: XhCommandContentProps): ReactNode {
  const ctx = useCommandContext()
  if (!ctx.rendered)
    return null
  const api = ctx.api
  return (
    <XhPortal container={container ?? ctx.portalContainer}>
      <div
        {...api.getBackdropProps() as Record<string, unknown>}
        ref={(el: HTMLDivElement | null) => { ctx.backdropRef.current = el }}
      />
      <div {...api.getPositionerProps() as Record<string, unknown>}>
        <div
          {...mergeReactProps(
            api.getContentProps() as Record<string, unknown>,
            rest as Record<string, unknown>,
            { ref: (el: HTMLDivElement | null) => { ctx.contentRef.current = el } },
          )}
        >
          {children}
        </div>
      </div>
    </XhPortal>
  )
}

export interface XhCommandInputProps extends Omit<ComponentPropsWithRef<'input'>, 'value' | 'defaultValue'> {}
export function XhCommandInput({ ...rest }: XhCommandInputProps): ReactNode {
  const ctx = useCommandContext()
  return (
    <input
      {...mergeReactProps(
        ctx.api.getInputProps() as Record<string, unknown>,
        rest as Record<string, unknown>,
        { ref: (el: HTMLInputElement | null) => { ctx.inputRef.current = el } },
      )}
    />
  )
}

export interface XhCommandListProps extends ComponentPropsWithRef<'div'> {}
export function XhCommandList({ children, ...rest }: XhCommandListProps): ReactNode {
  const ctx = useCommandContext()
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

export interface XhCommandGroupProps extends ComponentPropsWithRef<'div'> {
  value: string
}
export function XhCommandGroup({ value, children, ...rest }: XhCommandGroupProps): ReactNode {
  const ctx = useCommandContext()
  const group = useMemo(() => ({ value }), [value])
  return (
    <CommandGroupProvider value={group}>
      <div {...mergeReactProps(ctx.api.getGroupProps(group) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
    </CommandGroupProvider>
  )
}

export interface XhCommandGroupLabelProps extends ComponentPropsWithRef<'span'> {}
export function XhCommandGroupLabel({ children, ...rest }: XhCommandGroupLabelProps): ReactNode {
  const ctx = useCommandContext()
  const group = useCommandGroupContext()
  return <span {...mergeReactProps(ctx.api.getGroupLabelProps(group) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhCommandItemProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  value: string
  /** 缺省交给 connect 回清单里查，写死 false 会盖掉数据里的禁用。 */
  disabled?: boolean
}
export function XhCommandItem({ value, disabled, children, ...rest }: XhCommandItemProps): ReactNode {
  const ctx = useCommandContext()
  const item = useMemo(() => ({ value, disabled }), [value, disabled])
  // 指针离开条目不冒泡，改装成原生监听器
  const bind = useNativeEvents(ctx.api.getItemProps(item) as Record<string, unknown>, ['onPointerLeave'])
  return (
    <CommandItemProvider value={item}>
      <div {...mergeReactProps(bind.attrs, rest as Record<string, unknown>, { ref: bind.ref })}>
        {children}
      </div>
    </CommandItemProvider>
  )
}

export interface XhCommandItemTextProps extends ComponentPropsWithRef<'span'> {}
export function XhCommandItemText({ children, ...rest }: XhCommandItemTextProps): ReactNode {
  const ctx = useCommandContext()
  const item = useCommandItemContext()
  return <span {...mergeReactProps(ctx.api.getItemTextProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhCommandEmptyProps extends ComponentPropsWithRef<'div'> {}
/** 放在 content 里作 list 的兄弟节点，不进 role=listbox。 */
export function XhCommandEmpty({ children, ...rest }: XhCommandEmptyProps): ReactNode {
  const ctx = useCommandContext()
  return <div {...mergeReactProps(ctx.api.getEmptyProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhCommandLoadingProps extends ComponentPropsWithRef<'div'> {}
/** 在途占位：与空态占位同一个位置，取数期间顶上来。 */
export function XhCommandLoading({ children, ...rest }: XhCommandLoadingProps): ReactNode {
  const ctx = useCommandContext()
  return <div {...mergeReactProps(ctx.api.getLoadingProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhCommandFooterProps extends ComponentPropsWithRef<'footer'> {}
export function XhCommandFooter({ children, ...rest }: XhCommandFooterProps): ReactNode {
  const ctx = useCommandContext()
  return <footer {...mergeReactProps(ctx.api.getFooterProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</footer>
}

/**
 * 没写 children 时按清单铺开的整套结构，作者只交数据。
 * 与手写部件产出的 DOM 完全一致，要改结构就写 children，行为不变。
 */
function DefaultTree(props: {
  tree: readonly CommandGroupMeta[]
  trigger?: ReactNode
  empty?: ReactNode
  footer?: ReactNode
  renderItem?: (node: CommandNodeMeta) => ReactNode
}): ReactNode {
  const item = (node: CommandNodeMeta): ReactNode => (
    <XhCommandItem key={node.value} value={node.value}>
      <XhCommandItemText>{props.renderItem?.(node) ?? node.label}</XhCommandItemText>
    </XhCommandItem>
  )
  return (
    <>
      {props.trigger != null ? <XhCommandTrigger>{props.trigger}</XhCommandTrigger> : null}
      <XhCommandContent>
        <XhCommandInput />
        <XhCommandList>
          {props.tree.map(group => (
            // 没归组的那批直接铺条目，不套分组外壳——空标题的分组只会在列表里留一道白
            group.value === COMMAND_UNGROUPED
              ? <Fragment key={group.value}>{group.items.map(item)}</Fragment>
              : (
                  <XhCommandGroup key={group.value} value={group.value}>
                    <XhCommandGroupLabel>{group.label}</XhCommandGroupLabel>
                    {group.items.map(item)}
                  </XhCommandGroup>
                )
          ))}
        </XhCommandList>
        {/* 空态与在途占位都是 list 的兄弟，不进 role=listbox */}
        <XhCommandEmpty>{props.empty}</XhCommandEmpty>
        <XhCommandLoading />
        {props.footer != null ? <XhCommandFooter>{props.footer}</XhCommandFooter> : null}
      </XhCommandContent>
    </>
  )
}
