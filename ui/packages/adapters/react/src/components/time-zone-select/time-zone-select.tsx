/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 time zone select 相关实现。

import type { ControlVariant, Direction, Placement, Size, Tone } from '@xihan-ui/core'
import type { TimeZoneSelectProps, TimeZoneSelectTranslations } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { useRef, useState } from 'react'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { XhComboboxRoot } from '../combobox/combobox'
import { useTimeZoneSelect } from './use-time-zone-select'

export interface XhTimeZoneSelectProps extends Omit<ComponentPropsWithRef<'div'>, 'defaultValue' | 'dir' | 'onChange'> {
  value?: string | null
  defaultValue?: string | null
  timeZones?: readonly string[]
  referenceTime?: Date | number
  locale?: string
  name?: string
  form?: string
  disabled?: boolean
  readOnly?: boolean
  invalid?: boolean
  loading?: boolean
  loop?: boolean
  placement?: Placement
  dir?: Direction
  offset?: number
  variant?: ControlVariant
  tone?: Tone
  size?: Size
  translations?: Partial<TimeZoneSelectTranslations>
  onValueChange?: TimeZoneSelectProps['onValueChange']
  onInputValueChange?: TimeZoneSelectProps['onInputValueChange']
}

export function XhTimeZoneSelect({
  value,
  defaultValue,
  timeZones,
  referenceTime,
  locale,
  name,
  form,
  disabled,
  readOnly,
  invalid,
  loading,
  loop,
  placement,
  dir,
  offset,
  variant,
  tone,
  size,
  translations,
  onValueChange,
  onInputValueChange,
  ...rest
}: XhTimeZoneSelectProps): ReactNode {
  const configured = withXhConfig('time-zone-select', {
    value,
    defaultValue,
    timeZones,
    referenceTime,
    locale,
    name,
    form,
    disabled,
    readOnly,
    invalid,
    loading,
    loop,
    placement,
    dir,
    offset,
    variant,
    tone,
    size,
    translations,
    onValueChange,
    onInputValueChange,
  }) as TimeZoneSelectProps
  const { api } = useTimeZoneSelect(configured)
  const [query, setQuery] = useState('')
  const selecting = useRef(false)
  const text: TimeZoneSelectTranslations = {
    label: configured.translations?.label ?? 'Time zone',
    placeholder: configured.translations?.placeholder ?? 'Search time zones',
    empty: configured.translations?.empty ?? 'No time zones found',
    trigger: configured.translations?.trigger ?? 'Show time zones',
    clearTrigger: configured.translations?.clearTrigger ?? 'Clear time zone',
  }
  const controlledValue = configured.value === undefined ? undefined : configured.value ?? []
  return (
    <div {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      <XhComboboxRoot
        collection={api.filter(query)}
        value={controlledValue}
        defaultValue={configured.defaultValue ?? undefined}
        name={configured.name}
        form={configured.form}
        disabled={configured.disabled}
        readOnly={configured.readOnly}
        invalid={configured.invalid}
        loading={configured.loading}
        loop={configured.loop}
        clearable
        label={text.label}
        empty={text.empty}
        placeholder={text.placeholder}
        translations={{ trigger: text.trigger, clearTrigger: text.clearTrigger }}
        openOnClick
        inputBehavior="autohighlight"
        placement={configured.placement}
        dir={configured.dir}
        offset={configured.offset}
        variant={configured.variant}
        tone={configured.tone}
        size={configured.size}
        onValueChange={(details) => {
          selecting.current = true
          queueMicrotask(() => {
            selecting.current = false
          })
          configured.onValueChange?.({ value: details.value[0] ?? null })
        }}
        onInputValueChange={(details) => {
          setQuery(selecting.current ? '' : details.inputValue)
          selecting.current = false
          configured.onInputValueChange?.(details)
        }}
      />
    </div>
  )
}

XhTimeZoneSelect.xhEvents = ['value-change', 'input-value-change'] as const
