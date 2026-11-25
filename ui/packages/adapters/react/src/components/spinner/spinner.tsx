/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 spinner 相关实现。

import type { Orientation, Size, Tone } from '@xihan-ui/core'
import type { SpinnerProps, SpinnerTranslations, SpinnerVariant } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { SpinnerProvider, useSpinnerContext } from './context'
import { useSpinner } from './use-spinner'

export interface XhSpinnerProps extends ComponentPropsWithRef<'span'> {
  /** 该处的可及名字，写在 root 上。 */
  label?: string
  size?: Size
  /** 形态：ring / arc / dots。 */
  variant?: SpinnerVariant
  tone?: Tone
  /** 转圈与配文的排布：horizontal 并排 / vertical 转圈在上、配文在下；缺省单独使用并排、遮罩形态竖排。 */
  orientation?: Orientation
  /** 挂载后等多少毫秒才露面，默认 0；加载在这之前结束时转圈从头到尾不出现。 */
  delay?: number
  /** 是否在等待，缺省 true；false 时转圈藏起，遮罩形态下撤掉遮罩。 */
  loading?: boolean
  /** 遮罩形态：包住 children，等待时盖一层遮罩。 */
  overlay?: boolean
  /** 遮罩形态下盖住整个视口。 */
  fullscreen?: boolean
  translations?: Partial<SpinnerTranslations>
}

/**
 * 旋转图形由皮肤绘制在 root 的伪元素上，单独使用时不生成任何子节点。
 * overlay 时铺成遮罩形态：container 包住 content（children）与 mask，root 放在 mask 里居中；
 * 写了 label 就在转圈下方显示这段文案。
 */
export function XhSpinner({
  label,
  size,
  variant,
  tone,
  orientation,
  delay,
  loading,
  overlay,
  fullscreen,
  translations,
  children,
  ...rest
}: XhSpinnerProps): ReactNode {
  const ctx = useSpinner(withXhConfig('spinner', { label, size, variant, tone, orientation, delay, loading, overlay, fullscreen, translations }) as SpinnerProps)
  const { api } = ctx
  if (!overlay) {
    return (
      <SpinnerProvider value={ctx}>
        <span {...mergeReactProps(api.getRootProps(), rest)}>
          {children}
        </span>
      </SpinnerProvider>
    )
  }
  return (
    <SpinnerProvider value={ctx}>
      <div {...mergeReactProps(api.getContainerProps(), rest)}>
        <div {...api.getContentProps()}>{children}</div>
        <div {...api.getMaskProps()}>
          <span {...api.getRootProps()}>
            {label ? <span {...api.getLabelProps()}>{api.label}</span> : null}
          </span>
        </div>
      </div>
    </SpinnerProvider>
  )
}

export interface XhSpinnerLabelProps extends ComponentPropsWithRef<'span'> {}

/** 可见文案节点。作者未写内容时显示解析后的 label，屏幕上看到的与读屏朗读的因此是同一段文字。 */
export function XhSpinnerLabel({ children, ...rest }: XhSpinnerLabelProps): ReactNode {
  const ctx = useSpinnerContext()
  return (
    <span {...mergeReactProps(ctx.api.getLabelProps(), rest)}>
      {children ?? ctx.api.label}
    </span>
  )
}
