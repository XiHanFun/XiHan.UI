/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 signature pad 相关实现。

import type { SignaturePadApi, SignaturePadDrawingOptions, SignaturePadSchema, SignaturePadTranslations } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { renderSlot, slotPaints } from '../../runtime/slot-content'
import { useFormControlProps } from '../form/use-form-control'
import { SignaturePadProvider, useSignaturePadContext } from './context'
import { useSignaturePad } from './use-signature-pad'

type SignaturePadProps = SignaturePadSchema['props']

function noop(): void {}

/** 函数式 children 的载荷：笔迹路径与空态、落笔中标记，以及导出与清空的动作。 */
export type SignaturePadRootSlotProps = Pick<
  SignaturePadApi,
  'paths' | 'empty' | 'drawing' | 'disabled' | 'readOnly' | 'statusText' | 'toSvg' | 'clear'
>

export interface XhSignaturePadRootProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  invalid?: boolean
  /** 表单字段名；提供后才参与提交。 */
  name?: string
  drawing?: SignaturePadDrawingOptions
  translations?: Partial<SignaturePadTranslations>
  onDraw?: SignaturePadProps['onDraw']
  onDrawEnd?: SignaturePadProps['onDrawEnd']
  children?: SlotChildren<SignaturePadRootSlotProps>
}

export function XhSignaturePadRoot({
  disabled,
  readOnly,
  required,
  invalid,
  name,
  drawing,
  translations,
  onDraw,
  onDrawEnd,
  children,
  ...rest
}: XhSignaturePadRootProps): ReactNode {
  const ctx = useSignaturePad(withXhConfig('signature-pad', useFormControlProps({
    disabled,
    readOnly,
    required,
    invalid,
    name,
    drawing,
    translations,
    onDraw,
    onDrawEnd,
  })) as SignaturePadProps)
  const api = ctx.api
  return (
    <SignaturePadProvider value={ctx}>
      <div
        {...mergeReactProps(
          api.getRootProps() as Record<string, unknown>,
          rest as Record<string, unknown>,
          { ref: (el: HTMLDivElement | null) => { ctx.rootRef.current = el } },
        )}
      >
        {renderSlot(children, {
          paths: api.paths,
          empty: api.empty,
          drawing: api.drawing,
          disabled: api.disabled,
          readOnly: api.readOnly,
          statusText: api.statusText,
          toSvg: api.toSvg,
          clear: api.clear,
        })}
      </div>
    </SignaturePadProvider>
  )
}

XhSignaturePadRoot.xhEvents = ['draw', 'draw-end'] as const

export interface XhSignaturePadLabelProps extends ComponentPropsWithRef<'span'> {}
/** 不使用原生 label：画布是 svg、不是可被 label 关联的表单控件，名字经 aria-labelledby 关联。 */
export function XhSignaturePadLabel({ children, ...rest }: XhSignaturePadLabelProps): ReactNode {
  const ctx = useSignaturePadContext()
  return (
    <span {...mergeReactProps(ctx.api.getLabelProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </span>
  )
}

export interface XhSignaturePadControlProps extends ComponentPropsWithRef<'svg'> {}
/**
 * 接收指针的画布。笔迹与基准线都是这棵 svg 子树中的图元，命名空间由它向下传递；
 * viewBox 由连接层按固定的尺寸给出。
 */
export function XhSignaturePadControl({ children, ...rest }: XhSignaturePadControlProps): ReactNode {
  const ctx = useSignaturePadContext()
  return (
    <svg
      {...mergeReactProps(
        ctx.api.getControlProps() as Record<string, unknown>,
        rest as Record<string, unknown>,
        { ref: (el: SVGSVGElement | null) => { ctx.controlRef.current = el } },
      )}
    >
      {children}
    </svg>
  )
}

export interface XhSignaturePadGuideProps extends ComponentPropsWithRef<'line'> {}
export function XhSignaturePadGuide({ ...rest }: XhSignaturePadGuideProps): ReactNode {
  const ctx = useSignaturePadContext()
  return <line {...mergeReactProps(ctx.api.getGuideProps() as Record<string, unknown>, rest as Record<string, unknown>)} />
}

export interface XhSignaturePadPathProps extends Omit<ComponentPropsWithRef<'path'>, 'd'> {}
/** 全部笔迹落在这一条路径上，每一笔是它的一条子路径。 */
export function XhSignaturePadPath({ ...rest }: XhSignaturePadPathProps): ReactNode {
  const ctx = useSignaturePadContext()
  return <path {...mergeReactProps(ctx.api.getPathProps() as Record<string, unknown>, rest as Record<string, unknown>)} />
}

export interface XhSignaturePadClearTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhSignaturePadClearTrigger({ children, ...rest }: XhSignaturePadClearTriggerProps): ReactNode {
  const ctx = useSignaturePadContext()
  return (
    <button {...mergeReactProps(ctx.api.getClearTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </button>
  )
}

export interface XhSignaturePadStatusProps extends ComponentPropsWithRef<'span'> {}
/** 向读屏朗读是否已签名的活区域；作者未写内容时使用内建文案。 */
export function XhSignaturePadStatus({ children, ...rest }: XhSignaturePadStatusProps): ReactNode {
  const ctx = useSignaturePadContext()
  return (
    <span {...mergeReactProps(ctx.api.getStatusProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {slotPaints(children) ? children : ctx.api.statusText}
    </span>
  )
}

export interface XhSignaturePadHiddenInputProps extends Omit<ComponentPropsWithRef<'input'>, 'value' | 'defaultValue' | 'type'> {}
/** 签名的表单出口，序列化为一份 SVG。 */
export function XhSignaturePadHiddenInput({ ...rest }: XhSignaturePadHiddenInputProps): ReactNode {
  const ctx = useSignaturePadContext()
  return (
    <input
      {...mergeReactProps(
        ctx.api.getHiddenInputProps() as Record<string, unknown>,
        // 值攥在机器里，这份影子输入没有自己的变更出口。React 要求带 value 的输入
        // 交出一个出口，否则在开发构建里逐帧告警；节点对读屏与 Tab 都不可及，这个出口不会被调用
        { onChange: noop },
        rest as Record<string, unknown>,
      )}
    />
  )
}
