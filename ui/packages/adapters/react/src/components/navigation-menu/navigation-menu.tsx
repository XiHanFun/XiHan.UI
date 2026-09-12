import type { Direction, Orientation, Size, Tone } from '@xihan-ui/core'
import type { PresenceHandle } from '@xihan-ui/core/presence'
import type { NavigationMenuNode, NavigationMenuNodeMeta, NavigationMenuSchema, NavigationMenuTranslations } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { Fragment, useEffect, useRef } from 'react'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { slotPaints } from '../../runtime/slot-content'
import { useOverlayExit } from '../../runtime/use-overlay-exit'
import { NavigationMenuProvider, useNavigationMenuContext } from './context'
import { useNavigationMenu } from './use-navigation-menu'

type NavigationMenuProps = NavigationMenuSchema['props']

/** 根上自有的那些取值；defaultValue 与 dir 与原生的同名属性含义不同，由这里接管。 */
type RootElementProps = Omit<ComponentPropsWithRef<'nav'>, 'children' | 'defaultValue' | 'dir'>

export interface XhNavigationMenuRootProps extends RootElementProps {
  collection?: NavigationMenuNode[]
  value?: string | null
  defaultValue?: string | null
  orientation?: Orientation
  delayDuration?: number
  skipDelayDuration?: number
  dir?: Direction
  loop?: boolean
  disabled?: boolean
  translations?: Partial<NavigationMenuTranslations>
  tone?: Tone
  size?: Size
  onValueChange?: NavigationMenuProps['onValueChange']
  /** 每张面板的内容；只交 collection 时由它承载。 */
  renderPanel?: (node: NavigationMenuNodeMeta) => ReactNode
  children?: ReactNode
}

/** 根节点渲染为 nav，收起的三条出口（指针离开、焦点离场、Escape）在这一层处理。 */
export function XhNavigationMenuRoot({
  collection,
  value,
  defaultValue,
  orientation,
  delayDuration,
  skipDelayDuration,
  dir,
  loop,
  disabled,
  translations,
  tone,
  size,
  onValueChange,
  children,
  renderPanel,
  ...rest
}: XhNavigationMenuRootProps): ReactNode {
  const machineProps = {
    collection,
    value,
    defaultValue,
    orientation,
    delayDuration,
    skipDelayDuration,
    dir,
    loop,
    disabled,
    translations,
    tone,
    size,
    onValueChange,
  }
  const ctx = useNavigationMenu(withXhConfig('navigation-menu', machineProps) as NavigationMenuProps)
  // 根上的指针离开不冒泡，改装成原生监听器；onFocusout 归到的 onBlur 本就是冒泡的 focusout，不动它
  const bind = useNativeEvents(
    ctx.api.getRootProps() as Record<string, unknown>,
    ['onPointerLeave'],
  )
  // children 里有真会画出东西的节点就照旧交给作者；只剩空白时当没写，
  // 给了 collection 就按数据铺开整套结构
  const body = slotPaints(children)
    ? children
    : (collection ? <DefaultTree collection={ctx.api.collection} renderPanel={renderPanel} /> : null)
  return (
    <NavigationMenuProvider value={ctx}>
      <nav
        {...mergeReactProps(
          bind.attrs,
          rest as Record<string, unknown>,
          { ref: bind.ref },
          { ref: (el: HTMLElement | null) => { ctx.rootRef.current = el } },
        )}
      >
        {body}
      </nav>
    </NavigationMenuProvider>
  )
}

XhNavigationMenuRoot.xhEvents = ['value-change'] as const

export interface XhNavigationMenuListProps extends ComponentPropsWithRef<'ul'> {}
// 用 ul 而非 div：站点导航是一组并列的去处，读屏会念「列表，共 n 项」。
export function XhNavigationMenuList({ children, ...rest }: XhNavigationMenuListProps): ReactNode {
  const ctx = useNavigationMenuContext()
  return (
    <ul
      {...mergeReactProps(
        ctx.api.getListProps() as Record<string, unknown>,
        rest as Record<string, unknown>,
        { ref: (el: HTMLUListElement | null) => { ctx.listRef.current = el } },
      )}
    >
      {children}
    </ul>
  )
}

export interface XhNavigationMenuItemProps extends ComponentPropsWithRef<'li'> {}
/** 一项渲染为一个 li；面板 content 写在同一个 li 内、紧跟 trigger 之后。 */
export function XhNavigationMenuItem({ children, ...rest }: XhNavigationMenuItemProps): ReactNode {
  const ctx = useNavigationMenuContext()
  return <li {...mergeReactProps(ctx.api.getItemProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</li>
}

export interface XhNavigationMenuTriggerProps extends Omit<ComponentPropsWithRef<'button'>, 'value'> {
  value: string
  /** 缺省交给 connect 回 collection 里查，写死 false 会盖掉数据里的禁用。 */
  disabled?: boolean
}
export function XhNavigationMenuTrigger({ value, disabled, children, ...rest }: XhNavigationMenuTriggerProps): ReactNode {
  const ctx = useNavigationMenuContext()
  // 入口的聚焦上报与指针进入都不冒泡，改装成原生监听器
  const bind = useNativeEvents(
    ctx.api.getTriggerProps({ value, disabled }) as Record<string, unknown>,
    ['onFocus', 'onPointerEnter'],
  )
  return (
    <button
      {...mergeReactProps(
        bind.attrs,
        rest as Record<string, unknown>,
        { ref: bind.ref },
      )}
    >
      {children}
    </button>
  )
}

export interface XhNavigationMenuTriggerIndicatorProps extends Omit<ComponentPropsWithRef<'span'>, 'value'> {
  value: string
  disabled?: boolean
}
/** 入口里表示「底下还有一张面板」的标记，展开时转向；身份与所在 trigger 同一份声明。 */
export function XhNavigationMenuTriggerIndicator({ value, disabled, children, ...rest }: XhNavigationMenuTriggerIndicatorProps): ReactNode {
  const ctx = useNavigationMenuContext()
  return (
    <span {...mergeReactProps(ctx.api.getTriggerIndicatorProps({ value, disabled }) as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </span>
  )
}

export interface XhNavigationMenuContentProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  value: string
}
// 面板常挂，靠 hidden 显隐，不做懒挂载
export function XhNavigationMenuContent({ value, children, ...rest }: XhNavigationMenuContentProps): ReactNode {
  const ctx = useNavigationMenuContext()
  // 一个面板一份退场闸门：它们各开各的、动画各跑各的，一份管不过来。
  // 开合判据直接取 connect 这一帧的产出，不另起一套——两边各判一次迟早会说岔
  const contentRef = useRef<HTMLElement | null>(null)
  const presenceRef = useRef<PresenceHandle | null>(null)
  const visible = useOverlayExit({
    config: ctx.config,
    isOpen: () => ctx.api.isOpen(value),
    contentRef,
    onPresence: (next) => {
      const previous = presenceRef.current
      presenceRef.current = next
      if (ctx.service.getStatus() !== 'Started')
        return
      if (next) {
        ctx.service.send({ type: 'PRESENCE.SET', value, presence: next, connected: true })
      }
      else if (previous) {
        ctx.service.send({ type: 'PRESENCE.SET', value, presence: previous, connected: false })
      }
    },
  })
  // 子级 layout effect 可能早于根机器启动；被动阶段补报一次，确保首帧 Presence 已入 Headless 表。
  useEffect(() => {
    const presence = presenceRef.current
    if (!presence || ctx.service.getStatus() !== 'Started')
      return
    ctx.service.send({ type: 'PRESENCE.SET', value, presence, connected: true })
    return () => {
      if (ctx.service.getStatus() === 'Started')
        ctx.service.send({ type: 'PRESENCE.SET', value, presence, connected: false })
    }
  }, [ctx.service, value])
  return (
    <div
      {...mergeReactProps(
        ctx.api.getContentProps({ value }) as Record<string, unknown>,
        rest as Record<string, unknown>,
        {
          // 收起跟着闸门走：皮肤刻意没给 content 补 [hidden]{display:none}（补了退场就一帧都
          // 播不出来），所以真正的收起落成内联 display
          style: visible ? undefined : { display: 'none' },
          ref: (el: HTMLDivElement | null) => { contentRef.current = el },
        },
      )}
    >
      {children}
    </div>
  )
}

export interface XhNavigationMenuLinkProps extends ComponentPropsWithRef<'a'> {
  current?: boolean
}
/** 面板内的链接项：href 由作者写，点击不拦截，只收起导航。 */
export function XhNavigationMenuLink({ current, children, ...rest }: XhNavigationMenuLinkProps): ReactNode {
  const ctx = useNavigationMenuContext()
  return <a {...mergeReactProps(ctx.api.getLinkProps({ current }) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</a>
}

export interface XhNavigationMenuIndicatorProps extends ComponentPropsWithRef<'li'> {}
/** 指示条容器，位置由机器算好写入内联样式；渲染为 li 以 list 为定位参照系。 */
export function XhNavigationMenuIndicator({ ...rest }: XhNavigationMenuIndicatorProps): ReactNode {
  const ctx = useNavigationMenuContext()
  return <li {...mergeReactProps(ctx.api.getIndicatorProps() as Record<string, unknown>, rest as Record<string, unknown>)} />
}

export interface XhNavigationMenuViewportProps extends ComponentPropsWithRef<'div'> {}
/** 可选的共享面板外壳，放在 root 内、list 之后。 */
export function XhNavigationMenuViewport({ children, ...rest }: XhNavigationMenuViewportProps): ReactNode {
  const ctx = useNavigationMenuContext()
  return <div {...mergeReactProps(ctx.api.getViewportProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

/**
 * 没写 children 时按 collection 铺开的整套结构，作者只交数据。
 * 一项一个 li：带 href 的铺成直达链接，其余铺成 trigger 加面板，面板内容由 renderPanel 给。
 * 与手写部件产出的 DOM 完全一致，要改结构就写 children，行为不变。
 */
function DefaultTree(props: {
  collection: readonly NavigationMenuNodeMeta[]
  renderPanel?: (node: NavigationMenuNodeMeta) => ReactNode
}): ReactNode {
  return (
    <XhNavigationMenuList>
      {props.collection.map(node => (
        <XhNavigationMenuItem key={node.value}>
          {node.href != null
            ? <XhNavigationMenuLink href={node.href} current={node.current}>{node.label}</XhNavigationMenuLink>
            : (
                <Fragment>
                  <XhNavigationMenuTrigger value={node.value}>{node.label}</XhNavigationMenuTrigger>
                  <XhNavigationMenuContent value={node.value}>{props.renderPanel?.(node)}</XhNavigationMenuContent>
                </Fragment>
              )}
        </XhNavigationMenuItem>
      ))}
      <XhNavigationMenuIndicator />
    </XhNavigationMenuList>
  )
}
