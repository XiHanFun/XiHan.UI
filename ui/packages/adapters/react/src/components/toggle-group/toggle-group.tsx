/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 toggle group 相关实现。

import type { ActionVariant, Direction, Orientation, PropTypes, Size, Tone } from '@xihan-ui/core'
import type { SelectionValueKey, ToggleGroupApi, ToggleGroupModel, ToggleGroupNode, ToggleGroupNodeMeta, ToggleGroupSchema, ToggleGroupSelection } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react'
import { toggleGroupStructure, valueKeyOf } from '@xihan-ui/headless'
import { Children, Fragment, isValidElement, useEffect, useRef } from 'react'
import { useIsomorphicLayoutEffect } from '../../runtime/layout-effect'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { renderStructure } from '../../runtime/structure'
import { useFieldGroupWiring, useFieldLabelWiring } from '../field/use-field-control'
import { useFormControlProps } from '../form/use-form-control'
import { ToggleGroupProvider, useToggleGroupContext } from './context'
import { useToggleGroup } from './use-toggle-group'

type ToggleGroupProps = ToggleGroupSchema['props']

/**
 * V 是选中值的类型，按 value / defaultValue / collection 推断，缺省 string：数字、对象都行，对象值给 valueKey。
 * M 是 multiple 的字面量类型：写了 multiple 时 value 与 onValueChange 的值是数组，没写时是一个值或 null。
 */
export interface XhToggleGroupRootProps<V = string, M extends boolean = false> extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'defaultValue'> {
  /** 不显示出来的名字，写成 aria-label 落在与字段标签同一个部件上；放进字段或渲染了 label 部件时以它们为准。 */
  ariaLabel?: string
  collection?: ToggleGroupNode<V>[]
  /** 对象值怎样取键：字段名或取值函数；同一个选项每次都是新对象时给它，不给按对象身份认。 */
  valueKey?: SelectionValueKey<V>
  value?: ToggleGroupModel<V, M>
  defaultValue?: ToggleGroupModel<V, M>
  multiple?: M
  disabled?: boolean
  /** 只读：条目仍可聚焦，不能改选中。 */
  readOnly?: boolean
  /** 校验失败标注。 */
  invalid?: boolean
  /** 必填：表单影子写原生 required。 */
  required?: boolean
  /** 不允许把值清空：单选点击当前项不取消，多选无法移除最后一个。 */
  disallowEmpty?: boolean
  variant?: ActionVariant
  tone?: Tone
  size?: Size
  fullWidth?: boolean
  separators?: boolean
  name?: string
  orientation?: Orientation
  dir?: Direction
  loop?: boolean
  /** roving tabindex，默认开启；关闭后每个条目自成一个 Tab 停靠点。 */
  rovingFocus?: boolean
  onValueChange?: (details: { value: ToggleGroupSelection<V, M> }) => void
  /** 每个条目的自定义内容；未提供时使用 collection 中的 label。 */
  renderItem?: (node: ToggleGroupNodeMeta<V>) => ReactNode
  children?: ReactNode
}

export function XhToggleGroupRoot<V = string, M extends boolean = false>({
  ariaLabel,
  collection,
  valueKey,
  value,
  defaultValue,
  multiple,
  disabled,
  readOnly,
  invalid,
  required,
  disallowEmpty,
  variant,
  tone,
  size,
  fullWidth,
  separators,
  name,
  orientation,
  dir,
  loop,
  rovingFocus,
  onValueChange,
  renderItem,
  children,
  ...rest
}: XhToggleGroupRootProps<V, M>): ReactNode {
  const ctx = useToggleGroup(useFormControlProps({
    ariaLabel,
    collection,
    valueKey,
    value,
    defaultValue,
    multiple,
    disabled,
    readOnly,
    invalid,
    required,
    disallowEmpty,
    variant,
    tone,
    size,
    fullWidth,
    separators,
    name,
    orientation,
    dir,
    loop,
    rovingFocus,
    onValueChange,
  } as unknown as ToggleGroupProps))
  const api = ctx.api

  // 容器的 onFocus 是 DOM 的 focus（不冒泡，只在容器自己得焦时接管）。React 的同名合成事件
  // 挂的是冒泡的 focusin，条目得焦也会把它叫起来，那一下会把焦点从条目抢回锚点上——
  // 装成原生监听器，到达路径才与另外两家一致。onFocusOut 归到的 onBlur 本就是冒泡的 focusout，不动它
  // 放进表单字段时，字段的标题与说明接到组上：读屏进组时念组名与说明
  const fieldWiring = useFieldGroupWiring()
  const fieldLabel = useFieldLabelWiring()
  const bind = useNativeEvents(fieldLabel({ ...fieldWiring, ...api.getRootProps() }), ['onFocus'])

  const body = children ?? renderDefaultStructure(api, renderItem)

  return (
    <ToggleGroupProvider value={ctx}>
      <div
        {...mergeReactProps(
          bind.attrs,
          rest,
          { ref: bind.ref },
          { ref: (el: HTMLDivElement | null) => { ctx.rootRef.current = el } },
        )}
      >
        {renderChildren(body, api)}
      </div>
    </ToggleGroupProvider>
  )
}

XhToggleGroupRoot.xhEvents = ['value-change'] as const

export interface XhToggleGroupItemProps extends Omit<ComponentPropsWithRef<'button'>, 'value'> {
  /** 条目代表的值，与根上的值同类型：字符串、数字或对象。 */
  value: unknown
  /** 默认交给 connect 查询 collection，写死 false 会覆盖数据中的禁用。 */
  disabled?: boolean
}
/** 使用原生 button，Enter / Space 的激活交给平台。 */
export function XhToggleGroupItem({ value, disabled, children, ...rest }: XhToggleGroupItemProps): ReactNode {
  const ctx = useToggleGroupContext()
  const itemEl = useRef<HTMLElement | null>(null)
  const previous = useRef(value)

  // 本条目持有焦点时，value 变更重报焦点条目
  useEffect(() => {
    const prev = previous.current
    previous.current = value
    if (prev === value)
      return
    const svc = ctx.service
    if (svc.getStatus() !== 'Started')
      return
    if (itemEl.current && svc.scope.getActiveElement() === itemEl.current)
      // 机器只认键
      svc.send({ type: 'ITEM.FOCUS', value: valueKeyOf(svc.scope, value) })
  }, [ctx.service, value])

  // 卸载时上报整组失焦：按「本节点当下正持有焦点」判定，不按 value 比对
  useIsomorphicLayoutEffect(() => () => {
    const svc = ctx.service
    if (svc.getStatus() !== 'Started')
      return
    if (itemEl.current && svc.scope.getActiveElement() === itemEl.current)
      svc.send({ type: 'GROUP.BLUR' })
  }, [ctx.service])

  return (
    <button
      {...mergeReactProps(
        ctx.api.getItemProps({ value, disabled }),
        rest,
        { ref: (el: HTMLButtonElement | null) => { itemEl.current = el } },
      )}
    >
      {children}
    </button>
  )
}

export interface XhToggleGroupHiddenInputProps extends ComponentPropsWithRef<'input'> {}
/** 表单出口：整组只有一份，提供 name 后才参与提交。 */
export function XhToggleGroupHiddenInput({ ...rest }: XhToggleGroupHiddenInputProps): ReactNode {
  const ctx = useToggleGroupContext()
  return (
    <input
      {...mergeReactProps(
        ctx.api.getHiddenInputProps(),
        // 值攥在机器里，这份影子输入没有自己的变更出口。React 要求带 value 的输入
        // 交出一个出口，否则在开发构建里逐帧告警；这个出口不会被调用
        { onChange: noop },
        rest,
      )}
    />
  )
}

function noop(): void {}

/** 标准结构里各部件对应的组件。 */
const TOGGLE_GROUP_PARTS = {
  'item': XhToggleGroupItem,
  'hidden-input': XhToggleGroupHiddenInput,
}

/**
 * 未写 children 时铺开的整套结构，作者只提供数据：照 headless 的 toggleGroupStructure 渲，
 * 与 Web Components 不写部件时元素生成的节点出自同一份。条目的内容由 renderItem 接管。
 */
function renderDefaultStructure<V>(api: ToggleGroupApi<PropTypes, unknown>, renderItem?: (node: ToggleGroupNodeMeta<V>) => ReactNode): ReactNode[] {
  const nodes = toggleGroupStructure(api, { slotted: name => name === 'item' && renderItem != null })
  return renderStructure(nodes, TOGGLE_GROUP_PARTS, (node) => {
    if (node.slot?.name !== 'item')
      return undefined
    const meta = node.data as ToggleGroupNodeMeta<V>
    return renderItem?.(meta) ?? meta.label
  })
}

function flattenChildren(children: ReactNode): ReactNode[] {
  const result: ReactNode[] = []
  for (const child of Children.toArray(children)) {
    if (isValidElement(child) && child.type === Fragment) {
      flattenChildren((child as ReactElement<{ children?: ReactNode }>).props.children).forEach(value => result.push(value))
      continue
    }
    result.push(child)
  }
  return result
}

function renderChildren(children: ReactNode, api: {
  disabled: boolean
  orientation: Orientation
  separators: boolean
}): ReactNode[] {
  const result: ReactNode[] = []
  let itemCount = 0
  for (const child of flattenChildren(children)) {
    if (isValidElement(child) && child.type === XhToggleGroupItem) {
      if (api.separators && itemCount > 0) {
        result.push(
          <span
            key={`separator-${itemCount}`}
            aria-hidden="true"
            data-xh-toggle-group-separator=""
            data-orientation={api.orientation === 'horizontal' ? 'vertical' : 'horizontal'}
            data-disabled={api.disabled ? '' : undefined}
          />,
        )
      }
      itemCount += 1
    }
    result.push(child)
  }
  return result
}
