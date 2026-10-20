/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 command 相关实现。

import type { Direction, OverlayBackdropVariant, Size } from '@xihan-ui/core'
import type { CommandApi, CommandGroup, CommandGroupMeta, CommandNode, CommandNodeMeta, CommandSchema, StructureNode } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { AsChildProps } from '../../runtime/as-child'
import type { SlotChildren } from '../../runtime/slot-content'
import { commandStructure, resolveCommandGroups } from '@xihan-ui/headless'
import { useCallback, useMemo } from 'react'
import { withXhConfig } from '../../config/config'
import { renderAsChild } from '../../runtime/as-child'
import { mergePartProps, mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { XhPortal } from '../../runtime/portal'
import { renderSlot } from '../../runtime/slot-content'
import { renderStructure } from '../../runtime/structure'
import { useScrollbars } from '../../runtime/use-scrollbars'
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

/** 函数式 children 的载荷：开合、检索串、结果与锚点，以及修改它们的命令。 */
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
  /** 内置过滤，默认开启；关闭后由调用方自行筛选。 */
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
  /** 无匹配时的提示语。提供后不必再写 empty 部件。 */
  empty?: ReactNode
  /** 铺开时的触发按钮内容；未提供时不渲染触发器（面板改由快捷键或受控 open 唤起）。 */
  trigger?: ReactNode
  /** 铺开时浮层底部的操作区内容；未提供时不渲染 footer 部件。 */
  footer?: ReactNode
  dir?: Direction
  size?: Size
  variant?: OverlayBackdropVariant
  translations?: CommandProps['translations']
  onOpenChange?: CommandProps['onOpenChange']
  onInputValueChange?: CommandProps['onInputValueChange']
  onItemSelect?: CommandProps['onItemSelect']
  /** 每条命令的自定义内容；未提供时使用清单中的 label。 */
  renderItem?: (node: CommandNodeMeta) => ReactNode
  /** 只接管条目行首那一格；其余槽仍由数据铺。 */
  renderItemPrefix?: (node: CommandNodeMeta) => ReactNode
  /** 只接管条目行尾那一格；其余槽仍由数据铺。 */
  renderItemSuffix?: (node: CommandNodeMeta) => ReactNode
  children?: SlotChildren<CommandRootSlotProps>
}

export function XhCommandRoot({ children, empty, trigger, footer, renderItem, renderItemPrefix, renderItemSuffix, ...props }: XhCommandRootProps): ReactNode {
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
    : renderDefaultStructure(fullTree, { trigger, empty, footer, item: renderItem, prefix: renderItemPrefix, suffix: renderItemSuffix })

  return <CommandProvider value={ctx}>{body}</CommandProvider>
}

XhCommandRoot.xhEvents = ['open-change', 'input-value-change', 'item-select'] as const

export interface XhCommandTriggerProps extends ComponentPropsWithRef<'button'>, AsChildProps {}
export function XhCommandTrigger({ children, asChild, ...rest }: XhCommandTriggerProps): ReactNode {
  const ctx = useCommandContext()
  const props = mergePartProps(
    ctx.api.getTriggerProps() as Record<string, unknown>,
    rest as Record<string, unknown>,
  )
  return renderAsChild(asChild, children, props, 'command', (p, kids) => <button {...p}>{kids}</button>)
}

export interface XhCommandContentProps extends ComponentPropsWithRef<'div'> {
  /** 浮层挂载的容器；未提供时按全局配置，再未提供时挂载到 body。 */
  container?: () => Element | null
}
/** 迁移到浮层落点：留在原地时，宿主祖先只要建立了层叠上下文就能遮住浮层。 */
export function XhCommandContent({ children, container, ...rest }: XhCommandContentProps): ReactNode {
  const ctx = useCommandContext()
  // 结果列表的自绘条：与 list 同级、绝对定位不占布局，壳是面板自己（content 已经 relative）；
  // 模态浮层里的条子走 4px 档。hook 在早退之前调用，调用顺序不随开合变
  const bars = useScrollbars({ scrollable: () => ctx.listRef.current, props: () => ({ size: 'sm' }) })
  if (!ctx.rendered)
    return null
  const api = ctx.api
  const backdrop = api.getBackdropProps() as Record<string, unknown>
  return (
    <XhPortal container={container ?? ctx.portalContainer}>
      {!backdrop.hidden
        ? (
            <div
              {...backdrop}
              ref={(el: HTMLDivElement | null) => { ctx.backdropRef.current = el }}
            />
          )
        : null}
      <div {...api.getPositionerProps() as Record<string, unknown>}>
        <div
          {...mergeReactProps(
            api.getContentProps() as Record<string, unknown>,
            rest as Record<string, unknown>,
            { ref: (el: HTMLDivElement | null) => { ctx.contentRef.current = el } },
          )}
        >
          {children}
          {bars.render()}
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
  const listRef = useCallback((el: HTMLDivElement | null): void => {
    if (ctx.listRef.current === el)
      return
    ctx.listRef.current = el
    // 首次提交前仍由初始化端口读取引用；运行中的换代须通知效应撤旧重绑。
    if (ctx.service.getStatus() === 'Started') {
      ctx.service.refs.set('getListEl', () => el)
      ctx.service.refs.get('syncListVisibility')?.()
    }
  }, [ctx.listRef, ctx.service])
  return (
    <div
      {...mergeReactProps(
        ctx.api.getListProps() as Record<string, unknown>,
        rest as Record<string, unknown>,
        { ref: listRef },
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
  /** 默认交给 connect 查询清单，写死 false 会覆盖数据中的禁用。 */
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

/** 条目行首的作者内容（图标、色块、头像），对读屏隐藏。 */
export interface XhCommandItemPrefixProps extends ComponentPropsWithRef<'span'> {}
export function XhCommandItemPrefix({ children, ...rest }: XhCommandItemPrefixProps): ReactNode {
  const ctx = useCommandContext()
  const item = useCommandItemContext()
  return <span {...mergeReactProps(ctx.api.getItemPrefixProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

/** 条目行尾的作者内容（计数、徽标）。 */
export interface XhCommandItemSuffixProps extends ComponentPropsWithRef<'span'> {}
export function XhCommandItemSuffix({ children, ...rest }: XhCommandItemSuffixProps): ReactNode {
  const ctx = useCommandContext()
  const item = useCommandItemContext()
  return <span {...mergeReactProps(ctx.api.getItemSuffixProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

/** 条目的第 2 行副文本，跨文字槽、走 muted 档。 */
export interface XhCommandItemDescriptionProps extends ComponentPropsWithRef<'span'> {}
export function XhCommandItemDescription({ children, ...rest }: XhCommandItemDescriptionProps): ReactNode {
  const ctx = useCommandContext()
  const item = useCommandItemContext()
  return <span {...mergeReactProps(ctx.api.getItemDescriptionProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

/** 命令行尾的快捷键提示，与说明同档同色；纯装饰。 */
export interface XhCommandItemShortcutProps extends ComponentPropsWithRef<'span'> {}
export function XhCommandItemShortcut({ children, ...rest }: XhCommandItemShortcutProps): ReactNode {
  const ctx = useCommandContext()
  const item = useCommandItemContext()
  return <span {...mergeReactProps(ctx.api.getItemShortcutProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhCommandEmptyProps extends ComponentPropsWithRef<'div'> {}
/** 放在 content 中作为 list 的兄弟节点，不进入 role=listbox。 */
export function XhCommandEmpty({ children, ...rest }: XhCommandEmptyProps): ReactNode {
  const ctx = useCommandContext()
  return <div {...mergeReactProps(ctx.api.getEmptyProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhCommandLoadingProps extends ComponentPropsWithRef<'div'> {}
/** 在途占位：与空态占位同一个位置，取数期间显示。 */
export function XhCommandLoading({ children, ...rest }: XhCommandLoadingProps): ReactNode {
  const ctx = useCommandContext()
  return <div {...mergeReactProps(ctx.api.getLoadingProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhCommandFooterProps extends ComponentPropsWithRef<'footer'> {}
export function XhCommandFooter({ children, ...rest }: XhCommandFooterProps): ReactNode {
  const ctx = useCommandContext()
  return <footer {...mergeReactProps(ctx.api.getFooterProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</footer>
}

/** 遮罩：XhCommandContent 连同定位层一起把它铺在浮层落点里，结构里这个节点不另渲。 */
function CommandStructureBackdrop(): ReactNode {
  return null
}

/** 定位层：由 XhCommandContent 铺在浮层落点里，结构里这一层只把面板交下去。 */
function CommandStructurePositioner({ children }: { children?: ReactNode }): ReactNode {
  return children
}

/** 标准结构里各部件对应的组件。 */
const COMMAND_PARTS = {
  'trigger': XhCommandTrigger,
  'backdrop': CommandStructureBackdrop,
  'positioner': CommandStructurePositioner,
  'content': XhCommandContent,
  'input': XhCommandInput,
  'list': XhCommandList,
  'group': XhCommandGroup,
  'group-label': XhCommandGroupLabel,
  'item': XhCommandItem,
  'item-prefix': XhCommandItemPrefix,
  'item-text': XhCommandItemText,
  'item-description': XhCommandItemDescription,
  'item-shortcut': XhCommandItemShortcut,
  'item-suffix': XhCommandItemSuffix,
  'empty': XhCommandEmpty,
  'loading': XhCommandLoading,
  'footer': XhCommandFooter,
}

/** 不写 children 时可给的作者内容。 */
interface CommandStructureContent {
  trigger?: ReactNode
  empty?: ReactNode
  footer?: ReactNode
  item?: (node: CommandNodeMeta) => ReactNode
  prefix?: (node: CommandNodeMeta) => ReactNode
  suffix?: (node: CommandNodeMeta) => ReactNode
}

/**
 * 未写 children 时照 commandStructure 铺开的整套结构，与 Web Components 不写部件时元素生成的节点出自同一份。
 * 铺的是整份清单分好的组，不是过滤后那几条：此刻该不该露面由 connect 打在条目上的 hidden 说了算。
 * 触发按钮、空态与页脚给了内容才归作者；条目文字、行首、行尾可由三个渲染函数逐槽接管。
 */
function renderDefaultStructure(tree: readonly CommandGroupMeta[], content: CommandStructureContent): ReactNode[] {
  const renderOf = (name: string | undefined): ((node: CommandNodeMeta) => ReactNode) | undefined =>
    name === 'item' ? content.item : name === 'item-prefix' ? content.prefix : name === 'item-suffix' ? content.suffix : undefined
  const fixed = (name: string | undefined): ReactNode => name === 'trigger' ? content.trigger : name === 'empty' ? content.empty : name === 'footer' ? content.footer : undefined
  const nodes = commandStructure(tree, { slotted: name => fixed(name) != null || renderOf(name) != null })
  return renderStructure(nodes, COMMAND_PARTS, (node: StructureNode) => {
    const name = node.slot?.name
    const own = fixed(name)
    if (own != null)
      return own
    const render = renderOf(name)
    const meta = node.data as CommandNodeMeta | undefined
    return render && meta ? render(meta) : undefined
  })
}
