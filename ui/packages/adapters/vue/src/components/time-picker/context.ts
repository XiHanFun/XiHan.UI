/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 context 相关实现。

import type { TimePickerColumnUnit } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey } from 'vue'
import type { TimePickerContext } from './use-time-picker'
import { inject, provide } from 'vue'

/** 列声明的单位，供列内选项取到自己所属的列。 */
export interface TimePickerColumnContext {
  unit: ComputedRef<TimePickerColumnUnit>
}

const KEY: InjectionKey<TimePickerContext> = Symbol.for('xh-time-picker')
const COLUMN_KEY: InjectionKey<TimePickerColumnContext> = Symbol.for('xh-time-picker-column')

export function provideTimePicker(ctx: TimePickerContext): void {
  provide(KEY, ctx)
}

export function useTimePickerContext(): TimePickerContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] TimePicker 部件必须用在 XhTimePickerRoot 内')
  return ctx
}

export function provideTimePickerColumn(ctx: TimePickerColumnContext): void {
  provide(COLUMN_KEY, ctx)
}

export function useTimePickerColumnContext(): TimePickerColumnContext {
  const ctx = inject(COLUMN_KEY, null)
  if (!ctx)
    throw new Error('[xh] TimePicker 选项必须用在 XhTimePickerColumn 内')
  return ctx
}

/** 标签声明的值，供标签中的删除按钮复用同一份声明。 */
export interface TimePickerTagContext {
  value: () => string
}

const TAG_KEY: InjectionKey<TimePickerTagContext> = Symbol.for('xh-time-picker-tag')

export function provideTimePickerTag(ctx: TimePickerTagContext): void {
  provide(TAG_KEY, ctx)
}

export function useTimePickerTagContext(): TimePickerTagContext {
  const ctx = inject(TAG_KEY, null)
  if (!ctx)
    throw new Error('[xh] TimePicker 标签子部件必须用在 XhTimePickerTag 内')
  return ctx
}
