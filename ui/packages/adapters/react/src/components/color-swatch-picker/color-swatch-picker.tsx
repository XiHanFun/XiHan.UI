/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 color swatch picker 相关实现。

import type { Direction, Size, Tone } from '@xihan-ui/core'
import type { ColorSwatchPickerApi, ColorSwatchPickerNode, ColorSwatchPickerNodeMeta, ColorSwatchPickerSchema } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { useEffect, useMemo, useRef } from 'react'
import { withXhConfig } from '../../config/config'
import { useIsomorphicLayoutEffect } from '../../runtime/layout-effect'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { renderSlot } from '../../runtime/slot-content'
import { useFormControlProps } from '../form/use-form-control'
import { ColorSwatchPickerProvider, useColorSwatchPickerContext } from './context'
import { useColorSwatchPicker } from './use-color-swatch-picker'

type ColorSwatchPickerProps = ColorSwatchPickerSchema['props']

export type ColorSwatchPickerRootSlotProps = Pick<
  ColorSwatchPickerApi,
  'value' | 'swatches' | 'focusedValue' | 'isSelected' | 'setValue'
>

/** 根上自有的取值；defaultValue 与 dir 与原生的同名属性含义不同，由这里接管。 */
type RootElementProps = Omit<ComponentPropsWithRef<'div'>, 'children' | 'defaultValue' | 'dir'>

export interface XhColorSwatchPickerRootProps extends RootElementProps {
  /** 格子数据；未写 children 时按它自动铺开。 */
  swatches?: ColorSwatchPickerNode[]
  /** 标题文字。提供后不必再写 label 部件。 */
  label?: ReactNode
  value?: string | null
  defaultValue?: string | null
  disabled?: boolean
  readOnly?: boolean
  invalid?: boolean
  required?: boolean
  dir?: Direction
  name?: string
  size?: Size
  tone?: Tone
  translations?: ColorSwatchPickerProps['translations']
  onValueChange?: ColorSwatchPickerProps['onValueChange']
  children?: SlotChildren<ColorSwatchPickerRootSlotProps>
}

export function XhColorSwatchPickerRoot({
  swatches,
  label,
  value,
  defaultValue,
  disabled,
  readOnly,
  invalid,
  required,
  dir,
  name,
  size,
  tone,
  translations,
  onValueChange,
  children,
  ...rest
}: XhColorSwatchPickerRootProps): ReactNode {
  const ctx = useColorSwatchPicker(withXhConfig('color-swatch-picker', useFormControlProps({
    swatches,
    value,
    defaultValue,
    disabled,
    readOnly,
    invalid,
    required,
    dir,
    name,
    size,
    tone,
    translations,
    onValueChange,
  } as ColorSwatchPickerProps)))
  const api = ctx.api
  // 容器的 onFocus 是 DOM 的 focus（不冒泡，只在容器自己得焦时接管）。React 的同名合成事件
  // 挂的是冒泡的 focusin，格子得焦也会把它叫起来，那一下会把焦点从格子抢回锚点上——
  // 装成原生监听器，到达路径才与另外两家一致。onFocusOut 归到的 onBlur 本就是冒泡的 focusout，不动它
  const bind = useNativeEvents(api.getRootProps() as Record<string, unknown>, ['onFocus'])
  const body = children
    ? renderSlot(children, {
        value: api.value,
        swatches: api.swatches,
        focusedValue: api.focusedValue,
        isSelected: api.isSelected,
        setValue: api.setValue,
      })
    : swatches
      ? <DefaultTree swatches={api.swatches} label={label} />
      : null
  return (
    <ColorSwatchPickerProvider value={ctx}>
      <div
        {...mergeReactProps(
          bind.attrs,
          rest as Record<string, unknown>,
          { ref: bind.ref },
          { ref: (el: HTMLDivElement | null) => { ctx.rootRef.current = el } },
        )}
      >
        {body}
      </div>
    </ColorSwatchPickerProvider>
  )
}

XhColorSwatchPickerRoot.xhEvents = ['value-change'] as const

export interface XhColorSwatchPickerLabelProps extends ComponentPropsWithRef<'span'> {}

export function XhColorSwatchPickerLabel({ children, ...rest }: XhColorSwatchPickerLabelProps): ReactNode {
  const ctx = useColorSwatchPickerContext()
  return <span {...mergeReactProps(ctx.api.getLabelProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhColorSwatchPickerItemProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  value: string
  /** 读屏朗读该格子的方式；默认交给 connect 查询 swatches，都没有时朗读颜色串。 */
  label?: string
  /** 默认交给 connect 查询 swatches，写死 false 会覆盖数据中的禁用。 */
  disabled?: boolean
}

/** 一格：色块面、选中标记与表单影子由格子自行装配，不暴露为独立部件。 */
export function XhColorSwatchPickerItem({ value, label, disabled, children, ...rest }: XhColorSwatchPickerItemProps): ReactNode {
  const ctx = useColorSwatchPickerContext()
  const item = useMemo(() => ({ value, label, disabled }), [value, label, disabled])
  const itemEl = useRef<HTMLElement | null>(null)
  const previous = useRef(value)
  // 本格持有焦点时，value 变更重报焦点格
  useEffect(() => {
    const prev = previous.current
    previous.current = value
    if (prev === value)
      return
    const svc = ctx.service
    if (svc.getStatus() !== 'Started')
      return
    if (itemEl.current && svc.scope.getActiveElement() === itemEl.current)
      svc.send({ type: 'ITEM.FOCUS', value })
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
    <div
      {...mergeReactProps(
        ctx.api.getItemProps(item) as Record<string, unknown>,
        rest as Record<string, unknown>,
        { ref: (el: HTMLDivElement | null) => { itemEl.current = el } },
      )}
    >
      <input
        {...ctx.api.getHiddenInputProps(item) as Record<string, unknown>}
        // 选中态由机器持有，这份影子输入没有自己的变更出口。React 要求带 checked 的输入
        // 交出一个出口，否则在开发构建里逐帧告警；节点是 inert，这个出口不会被调用
        onChange={noop}
      />
      <span {...ctx.api.getSwatchProps(item) as Record<string, unknown>} />
      <span {...ctx.api.getIndicatorProps(item) as Record<string, unknown>} />
      {children}
    </div>
  )
}

function noop(): void {}

/**
 * 未写 children 时按 swatches 铺开的整套结构，作者只提供数据。
 * 与手写部件产出的 DOM 完全一致，需要修改结构时写 children，行为不变。
 */
function DefaultTree(props: { swatches: readonly ColorSwatchPickerNodeMeta[], label?: ReactNode }): ReactNode {
  return (
    <>
      {props.label != null ? <XhColorSwatchPickerLabel>{props.label}</XhColorSwatchPickerLabel> : null}
      {props.swatches.map(node => <XhColorSwatchPickerItem key={node.value} value={node.value} />)}
    </>
  )
}
