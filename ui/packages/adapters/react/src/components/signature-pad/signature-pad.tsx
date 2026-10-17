/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 signature pad 相关实现。

import type { SignaturePadApi, SignaturePadDrawingOptions, SignaturePadSchema, SignaturePadTranslations, SignaturePadValue } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { signaturePadStructure } from '@xihan-ui/headless'
import { useEffect } from 'react'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { renderSlot, slotPaints } from '../../runtime/slot-content'
import { renderStructure } from '../../runtime/structure'
import { useFormControlProps } from '../form/use-form-control'
import { SignaturePadProvider, useSignaturePadContext } from './context'
import { useSignaturePad } from './use-signature-pad'

type SignaturePadProps = SignaturePadSchema['props']

function noop(): void {}

/** 函数式 children 的载荷：签名数据、笔迹路径与空态、落笔中标记，以及导出、清空、撤销与重做的动作。 */
export type SignaturePadRootSlotProps = Pick<
  SignaturePadApi,
  | 'value'
  | 'paths'
  | 'empty'
  | 'drawing'
  | 'disabled'
  | 'readOnly'
  | 'canUndo'
  | 'canRedo'
  | 'statusText'
  | 'toSvg'
  | 'clear'
  | 'undo'
  | 'redo'
>

export interface XhSignaturePadRootProps extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'defaultValue'> {
  /** 标题。不给 children 时铺 label 部件。 */
  label?: ReactNode
  /** 不显示出来的名字，写成 aria-label 落在与字段标签同一个部件上；放进字段或渲染了 label 部件时以它们为准。 */
  ariaLabel?: string
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  invalid?: boolean
  /** 表单字段名；提供后才参与提交。 */
  name?: string
  /** 签名数据；提供即受控。 */
  value?: SignaturePadValue
  /** 非受控初值，也是表单重置回到的那一份。 */
  defaultValue?: SignaturePadValue
  drawing?: SignaturePadDrawingOptions
  translations?: Partial<SignaturePadTranslations>
  onDraw?: SignaturePadProps['onDraw']
  onDrawEnd?: SignaturePadProps['onDrawEnd']
  onValueChange?: SignaturePadProps['onValueChange']
  /** 用户按清空钮（clear-trigger）清掉了值；先发值变化，再发它。程序化的 clear() 不发。 */
  onClear?: () => void
  children?: SlotChildren<SignaturePadRootSlotProps>
}

export function XhSignaturePadRoot({
  label,
  ariaLabel,
  disabled,
  readOnly,
  required,
  invalid,
  name,
  value,
  defaultValue,
  drawing,
  translations,
  onDraw,
  onDrawEnd,
  onValueChange,
  onClear,
  children,
  ...rest
}: XhSignaturePadRootProps): ReactNode {
  const ctx = useSignaturePad(withXhConfig('signature-pad', useFormControlProps({
    ariaLabel,
    disabled,
    readOnly,
    required,
    invalid,
    name,
    value,
    defaultValue,
    drawing,
    translations,
    onDraw,
    onDrawEnd,
    onValueChange,
    onClear,
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
        {children != null
          ? renderSlot(children, {
              value: api.value,
              paths: api.paths,
              empty: api.empty,
              drawing: api.drawing,
              disabled: api.disabled,
              readOnly: api.readOnly,
              canUndo: api.canUndo,
              canRedo: api.canRedo,
              statusText: api.statusText,
              toSvg: api.toSvg,
              clear: api.clear,
              undo: api.undo,
              redo: api.redo,
            })
          : renderDefaultStructure(api, label, name !== undefined)}
      </div>
    </SignaturePadProvider>
  )
}

XhSignaturePadRoot.xhEvents = ['clear', 'draw', 'draw-end', 'value-change'] as const

export interface XhSignaturePadLabelProps extends ComponentPropsWithRef<'span'> {}
/** 不使用原生 label：画布是 svg、不是可被 label 关联的表单控件，名字经 aria-labelledby 关联。 */
export function XhSignaturePadLabel({ children, ...rest }: XhSignaturePadLabelProps): ReactNode {
  const ctx = useSignaturePadContext()
  // 渲出来了才登记：可聚焦部件的 aria-labelledby 只在这个节点真在场时才指过来
  const { registerLabel } = ctx
  useEffect(() => registerLabel(), [registerLabel])
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

export interface XhSignaturePadUndoTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhSignaturePadUndoTrigger({ children, ...rest }: XhSignaturePadUndoTriggerProps): ReactNode {
  const ctx = useSignaturePadContext()
  return (
    <button {...mergeReactProps(ctx.api.getUndoTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </button>
  )
}

export interface XhSignaturePadRedoTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhSignaturePadRedoTrigger({ children, ...rest }: XhSignaturePadRedoTriggerProps): ReactNode {
  const ctx = useSignaturePadContext()
  return (
    <button {...mergeReactProps(ctx.api.getRedoTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
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

/** 标准结构里各部件对应的组件。 */
const SIGNATURE_PAD_PARTS = {
  'label': XhSignaturePadLabel,
  'control': XhSignaturePadControl,
  'guide': XhSignaturePadGuide,
  'path': XhSignaturePadPath,
  'clear-trigger': XhSignaturePadClearTrigger,
  'status': XhSignaturePadStatus,
  'hidden-input': XhSignaturePadHiddenInput,
}

/**
 * 未写 children 时铺开的整套结构：照 headless 的 signaturePadStructure 渲，
 * 与 Web Components 不写部件时元素生成的节点出自同一份。文字以外的标题内容交给 label 部件。
 */
function renderDefaultStructure(api: SignaturePadApi, label: ReactNode, hiddenInput: boolean): ReactNode[] {
  const slotted = label != null && typeof label !== 'string'
  const nodes = signaturePadStructure(api, { label: typeof label === 'string' ? label : undefined, hiddenInput, slotted: name => name === 'label' && slotted })
  return renderStructure(nodes, SIGNATURE_PAD_PARTS, node => (node.slot ? label : undefined))
}
