import type { ControlVariant, Direction, Placement, Size, Tone } from '@xihan-ui/core'
import type {
  CascaderApi,
  CascaderExpandTrigger,
  CascaderNode,
  CascaderSchema,
  CascaderSearchResult,
  CascaderValue,
} from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { withXhConfig } from '../../config/config'
import { useIsomorphicLayoutEffect } from '../../runtime/layout-effect'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { XhPortal } from '../../runtime/portal'
import { renderSlot } from '../../runtime/slot-content'
import { useScrollbars } from '../../runtime/use-scrollbars'
import { useFieldLabelWiring, useFieldStateWiring } from '../field/use-field-control'
import { useFormControlProps } from '../form/use-form-control'
import {
  CascaderContentProvider,
  CascaderGroupProvider,
  CascaderItemProvider,
  CascaderProvider,
  useCascaderContentContext,
  useCascaderContext,
  useCascaderGroupContext,
  useCascaderItemContext,
} from './context'
import { useCascader } from './use-cascader'

type CascaderProps = CascaderSchema['props']

/** 函数式 children 的载荷：级联的展开态、选中态与列数据，以及改动它们的方法。 */
export type CascaderRootSlotProps = Pick<
  CascaderApi,
  | 'open'
  | 'levels'
  | 'columns'
  | 'value'
  | 'valuePath'
  | 'activePath'
  | 'focusedPath'
  | 'displayText'
  | 'canClear'
  | 'isSelected'
  | 'isIndeterminate'
  | 'isActive'
  | 'isVisible'
  | 'setOpen'
  | 'setValue'
  | 'setActivePath'
  | 'select'
  | 'clear'
>

/** 根上自有的那些取值；dir 与 defaultValue 与原生的同名属性含义不同，由这里接管。 */
type RootElementProps = Omit<ComponentPropsWithRef<'div'>, 'children' | 'defaultValue' | 'dir'>

export interface XhCascaderRootProps extends RootElementProps {
  collection?: CascaderNode[]
  value?: CascaderValue
  defaultValue?: CascaderValue
  name?: string
  form?: string
  open?: boolean
  defaultOpen?: boolean
  expandTrigger?: CascaderExpandTrigger
  changeOnSelect?: boolean
  multiple?: boolean
  searchable?: boolean
  cascade?: boolean
  checkedStrategy?: CascaderProps['checkedStrategy']
  disabled?: boolean
  readOnly?: boolean
  invalid?: boolean
  loading?: boolean
  translations?: CascaderProps['translations']
  variant?: ControlVariant
  tone?: Tone
  size?: Size
  placeholder?: string
  separator?: string
  placement?: Placement
  offset?: number
  loop?: boolean
  dir?: Direction
  onValueChange?: CascaderProps['onValueChange']
  onOpenChange?: CascaderProps['onOpenChange']
  children?: SlotChildren<CascaderRootSlotProps>
}

export function XhCascaderRoot({
  collection,
  value,
  defaultValue,
  name,
  form,
  open,
  defaultOpen,
  expandTrigger,
  changeOnSelect,
  multiple,
  searchable,
  cascade,
  checkedStrategy,
  disabled,
  readOnly,
  invalid,
  loading,
  translations,
  variant,
  tone,
  size,
  placeholder,
  separator,
  placement,
  offset,
  loop,
  dir,
  onValueChange,
  onOpenChange,
  children,
  ...rest
}: XhCascaderRootProps): ReactNode {
  const ctx = useCascader(withXhConfig('cascader', useFormControlProps({
    collection,
    value,
    defaultValue,
    name,
    form,
    open,
    defaultOpen,
    expandTrigger,
    changeOnSelect,
    multiple,
    searchable,
    cascade,
    checkedStrategy,
    disabled,
    readOnly,
    invalid,
    loading,
    translations,
    variant,
    tone,
    size,
    placeholder,
    separator,
    placement,
    offset,
    loop,
    dir,
    onValueChange,
    onOpenChange,
  })) as CascaderProps)
  const api = ctx.api
  return (
    <CascaderProvider value={ctx}>
      <div {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>, { ref: ctx.rootRef })}>
        {renderSlot(children, {
          open: api.open,
          // levels 每层一列、层内节点各一条目，供作者渲染；columns 只读当前展开的列
          levels: api.levels,
          columns: api.columns,
          value: api.value,
          valuePath: api.valuePath,
          activePath: api.activePath,
          focusedPath: api.focusedPath,
          displayText: api.displayText,
          canClear: api.canClear,
          isSelected: api.isSelected,
          isIndeterminate: api.isIndeterminate,
          isActive: api.isActive,
          isVisible: api.isVisible,
          setOpen: api.setOpen,
          setValue: api.setValue,
          setActivePath: api.setActivePath,
          select: api.select,
          clear: api.clear,
        })}
        {api.value.map(path => <input key={JSON.stringify(path)} {...api.getHiddenInputProps({ path }) as Record<string, unknown>} />)}
      </div>
    </CascaderProvider>
  )
}

XhCascaderRoot.xhEvents = ['value-change', 'open-change'] as const

export interface XhCascaderLabelProps extends ComponentPropsWithRef<'span'> {}
export function XhCascaderLabel({ children, ...rest }: XhCascaderLabelProps): ReactNode {
  const ctx = useCascaderContext()
  return <span {...mergeReactProps(ctx.api.getLabelProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhCascaderControlProps extends ComponentPropsWithRef<'div'> {}
/** 描边、底色与聚焦环所在的那一层，触发按钮与尾部动作钮在里面并排。 */
export function XhCascaderControl({ children, ...rest }: XhCascaderControlProps): ReactNode {
  const ctx = useCascaderContext()
  return <div {...mergeReactProps(ctx.api.getControlProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhCascaderTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhCascaderTrigger({ children, ...rest }: XhCascaderTriggerProps): ReactNode {
  const ctx = useCascaderContext()
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

export interface XhCascaderValueTextProps extends ComponentPropsWithRef<'span'> {}
/** 有内容用内容，否则显示整条路径或 placeholder。 */
export function XhCascaderValueText({ children, ...rest }: XhCascaderValueTextProps): ReactNode {
  const ctx = useCascaderContext()
  return (
    <span {...mergeReactProps(ctx.api.getValueTextProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children ?? ctx.api.displayText}
    </span>
  )
}

export interface XhCascaderIndicatorProps extends ComponentPropsWithRef<'span'> {}
export function XhCascaderIndicator({ children, ...rest }: XhCascaderIndicatorProps): ReactNode {
  const ctx = useCascaderContext()
  return <span {...mergeReactProps(ctx.api.getIndicatorProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhCascaderClearTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhCascaderClearTrigger({ children, ...rest }: XhCascaderClearTriggerProps): ReactNode {
  const ctx = useCascaderContext()
  return <button {...mergeReactProps(ctx.api.getClearTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}

export interface XhCascaderPositionerProps extends ComponentPropsWithRef<'div'> {
  /** 浮层挂到哪个容器；不给就按全局配置，再不给挂 body。 */
  container?: () => Element | null
}
/** 搬到浮层落点：留在原地的话，宿主祖先只要建了层叠上下文就能盖住浮层。 */
export function XhCascaderPositioner({ children, container, ...rest }: XhCascaderPositionerProps): ReactNode {
  const ctx = useCascaderContext()
  // 列区的自绘条：与 content 同级、绝对定位不占布局，壳是这层已经 fixed 的 positioner。
  // 只摆横的：列多到放不下时整体横向滚动，纵向溢出归每一列自己。
  // 横条的正负按排版方向算，而组件不读计算样式，把 positioner 上那份显式交过去
  const bars = useScrollbars({
    scrollable: () => ctx.contentRef.current,
    axes: ['horizontal'],
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

export interface XhCascaderContentProps extends ComponentPropsWithRef<'div'> {
  /** 空态占位的内容；不给就按视图取「无匹配」或「无数据」。 */
  empty?: ReactNode
}

/** 放在作者 children 之后渲染；作者 Loading 即使隔着业务组件，也已用同一 Content 令牌登记。 */
function CascaderAutoLoading(): ReactNode {
  const ctx = useCascaderContext()
  const content = useCascaderContentContext()
  if (content.authoredLoadingCount > 0 || content.renderRegistration.authoredLoading)
    return null
  return (
    <div {...ctx.api.getLoadingProps() as Record<string, unknown>} data-xh-cascader-auto-loading="">
      {ctx.api.translations.loading}
    </div>
  )
}

/** 收起时只隐藏不卸载；跨列的键盘导航也在这一层处理。 */
export function XhCascaderContent({ children, empty, ...rest }: XhCascaderContentProps): ReactNode {
  const ctx = useCascaderContext()
  const api = ctx.api
  const [authoredLoadingCount, setAuthoredLoadingCount] = useState(0)
  const registerLoading = useCallback(() => {
    let active = true
    setAuthoredLoadingCount(count => count + 1)
    return () => {
      if (!active)
        return
      active = false
      setAuthoredLoadingCount(count => count - 1)
    }
  }, [])
  // 每轮各用自己的对象；并发或被中断的树只改自己，不能污染另一轮的判断。
  const renderRegistration = { authoredLoading: false }
  const contentContext = {
    renderRegistration,
    authoredLoadingCount,
    registerLoading,
  }
  return (
    <CascaderContentProvider value={contentContext}>
      <div
        {...mergeReactProps(
          api.getContentProps() as Record<string, unknown>,
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
        {/* 空态占位常挂在列后，露不露面归连接层 */}
        <div {...api.getEmptyProps() as Record<string, unknown>}>
          {empty ?? (api.searching ? api.translations.noMatch : api.translations.empty)}
        </div>
        <CascaderAutoLoading />
      </div>
    </CascaderContentProvider>
  )
}

export interface XhCascaderLoadingProps extends ComponentPropsWithRef<'div'> {}
/** 在途占位：当前视图无候选时顶上来；无 children 则读取 Cascader translations.loading。 */
export function XhCascaderLoading({ children, ...rest }: XhCascaderLoadingProps): ReactNode {
  const ctx = useCascaderContext()
  const content = useCascaderContentContext()
  // render 阶段登记让服务端直出和客户端首帧都能在末尾自动节点渲染前识别作者部件。
  content.renderRegistration.authoredLoading = true
  useIsomorphicLayoutEffect(() => content.registerLoading(), [content.registerLoading])
  return (
    <div {...mergeReactProps(ctx.api.getLoadingProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children ?? ctx.api.translations.loading}
    </div>
  )
}

export interface XhCascaderInputProps extends Omit<ComponentPropsWithRef<'input'>, 'value' | 'defaultValue'> {}
/** 搜索框放在 content 顶部；没开 searchable 时连接层给 hidden。 */
export function XhCascaderInput({ ...rest }: XhCascaderInputProps): ReactNode {
  const ctx = useCascaderContext()
  return <input {...mergeReactProps(ctx.api.getInputProps() as Record<string, unknown>, rest as Record<string, unknown>)} />
}

export interface XhCascaderSearchListProps extends ComponentPropsWithRef<'div'> {
  /** 每条候选的自定义内容；不给就把整条路径连缀成一行。 */
  renderItem?: (result: CascaderSearchResult) => ReactNode
}
/** 候选整组自动铺：整条路径连缀成一行。 */
export function XhCascaderSearchList({ renderItem, ...rest }: XhCascaderSearchListProps): ReactNode {
  const ctx = useCascaderContext()
  const api = ctx.api
  return (
    <div {...mergeReactProps(api.getSearchListProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {api.searchResults.map(result => (
        <div key={result.key} {...api.getSearchItemProps({ path: result.path }) as Record<string, unknown>}>
          {renderItem?.(result) ?? result.labels.join(' / ')}
        </div>
      ))}
    </div>
  )
}

export interface XhCascaderColumnProps extends ComponentPropsWithRef<'div'> {
  /** 层号，兼收字符串。 */
  level: number | string
}
/** 展开路径变短时本列收起，节点常挂不卸载。 */
export function XhCascaderColumn({ level, children, ...rest }: XhCascaderColumnProps): ReactNode {
  const ctx = useCascaderContext()
  return (
    <div
      {...mergeReactProps(
        ctx.api.getColumnProps({ level: Number(level) }) as Record<string, unknown>,
        rest as Record<string, unknown>,
      )}
    >
      {children}
    </div>
  )
}

export interface XhCascaderGroupProps extends ComponentPropsWithRef<'div'> {
  value: string
}
/** 分组容器：写在列里，条目照常挂在它下面。 */
export function XhCascaderGroup({ value, children, ...rest }: XhCascaderGroupProps): ReactNode {
  const ctx = useCascaderContext()
  const group = useMemo(() => ({ value }), [value])
  return (
    <CascaderGroupProvider value={group}>
      <div {...mergeReactProps(ctx.api.getGroupProps(group) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
    </CascaderGroupProvider>
  )
}

export interface XhCascaderGroupLabelProps extends ComponentPropsWithRef<'span'> {}
export function XhCascaderGroupLabel({ children, ...rest }: XhCascaderGroupLabelProps): ReactNode {
  const ctx = useCascaderContext()
  const group = useCascaderGroupContext()
  return <span {...mergeReactProps(ctx.api.getGroupLabelProps(group) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhCascaderItemProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  value: string
}
export function XhCascaderItem({ value, children, ...rest }: XhCascaderItemProps): ReactNode {
  const ctx = useCascaderContext()
  const item = useMemo(() => ({ value }), [value])
  const itemEl = useRef<HTMLElement | null>(null)
  const previous = useRef(value)
  // 条目的聚焦上报与指针划入都不冒泡，改装成原生监听器
  const bind = useNativeEvents(
    ctx.api.getItemProps(item) as Record<string, unknown>,
    ['onFocus', 'onPointerEnter'],
  )
  // 层号回 collection 里查，条目只自报值；api 每渲染一份，效应里现读最新那一份
  const apiRef = useRef(ctx.api)
  apiRef.current = ctx.api

  // 本条目持有焦点时，value 变更重报焦点条目
  useEffect(() => {
    const prev = previous.current
    previous.current = value
    if (prev === value)
      return
    const svc = ctx.service
    if (svc.getStatus() !== 'Started')
      return
    if (!itemEl.current || svc.scope.getActiveElement() !== itemEl.current)
      return
    const meta = apiRef.current.levels.flatMap(level => level.items).find(one => one.value === value)
    if (meta)
      svc.send({ type: 'ITEM.FOCUS', level: meta.level, value })
  }, [ctx.service, value])

  // 卸载时上报焦点丢失：按「本条目当下正持有焦点」判定，不按 value 比对
  useIsomorphicLayoutEffect(() => () => {
    const svc = ctx.service
    if (svc.getStatus() !== 'Started')
      return
    if (itemEl.current && svc.scope.getActiveElement() === itemEl.current)
      svc.send({ type: 'ITEM.LOST' })
  }, [ctx.service])

  return (
    <CascaderItemProvider value={item}>
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
    </CascaderItemProvider>
  )
}

export interface XhCascaderItemTextProps extends ComponentPropsWithRef<'span'> {}
export function XhCascaderItemText({ children, ...rest }: XhCascaderItemTextProps): ReactNode {
  const ctx = useCascaderContext()
  const item = useCascaderItemContext()
  return <span {...mergeReactProps(ctx.api.getItemTextProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhCascaderItemIndicatorProps extends ComponentPropsWithRef<'span'> {}
export function XhCascaderItemIndicator({ children, ...rest }: XhCascaderItemIndicatorProps): ReactNode {
  const ctx = useCascaderContext()
  const item = useCascaderItemContext()
  return <span {...mergeReactProps(ctx.api.getItemIndicatorProps(item) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhCascaderFooterProps extends ComponentPropsWithRef<'div'> {}
/**
 * 浮层底部的操作区：写在 content 里、与列并列，横跨全部列；
 * 列表框语义在每一列上，放在这里的按钮既不进列的拥有关系，也走不到方向键。
 */
export function XhCascaderFooter({ children, ...rest }: XhCascaderFooterProps): ReactNode {
  const ctx = useCascaderContext()
  return <div {...mergeReactProps(ctx.api.getFooterProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}
