/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 time zone select 相关实现。

import type { ControlVariant, Direction, Placement, Size, Tone } from '@xihan-ui/core'
import type { TimeZoneSelectProps, TimeZoneSelectTranslations } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { defineComponent, h, ref } from 'vue'
import { withXhConfig } from '../../config/config'
import { XhComboboxRoot } from '../combobox/combobox'
import { useTimeZoneSelect } from './use-time-zone-select'

export const XhTimeZoneSelect = defineComponent({
  name: 'XhTimeZoneSelect',
  inheritAttrs: false,
  props: {
    value: { type: String as PropType<string | null> },
    defaultValue: { type: String as PropType<string | null> },
    timeZones: { type: Array as PropType<string[]> },
    referenceTime: { type: [Date, Number] as PropType<Date | number> },
    locale: String,
    name: String,
    form: String,
    disabled: { type: Boolean, default: undefined },
    readOnly: { type: Boolean, default: undefined },
    invalid: { type: Boolean, default: undefined },
    loading: Boolean,
    loop: { type: Boolean, default: undefined },
    placement: { type: String as PropType<Placement> },
    dir: { type: String as PropType<Direction> },
    offset: Number,
    variant: { type: String as PropType<ControlVariant> },
    tone: { type: String as PropType<Tone> },
    size: { type: String as PropType<Size> },
    translations: { type: Object as PropType<Partial<TimeZoneSelectTranslations>> },
  },
  emits: {
    'value-change': (_details: { value: string | null }) => true,
    'input-value-change': (_details: { inputValue: string }) => true,
    'update:value': (_value: string | null) => true,
  },
  setup(props, { emit, attrs }) {
    const configured = withXhConfig('time-zone-select', props) as TimeZoneSelectProps
    const { api } = useTimeZoneSelect(configured)
    const query = ref('')
    let selecting = false
    const labels = (): TimeZoneSelectTranslations => ({
      label: configured.translations?.label ?? 'Time zone',
      placeholder: configured.translations?.placeholder ?? 'Search time zones',
      empty: configured.translations?.empty ?? 'No time zones found',
      trigger: configured.translations?.trigger ?? 'Show time zones',
      clearTrigger: configured.translations?.clearTrigger ?? 'Clear time zone',
    })
    return () => {
      const text = labels()
      const options = api.value.filter(query.value)
      const value = configured.value === undefined ? undefined : configured.value ?? []
      return h('div', { ...api.value.getRootProps() as Record<string, unknown>, ...attrs }, [
        h(XhComboboxRoot, {
          collection: options,
          value,
          defaultValue: configured.defaultValue ?? undefined,
          name: configured.name,
          form: configured.form,
          disabled: configured.disabled,
          readOnly: configured.readOnly,
          invalid: configured.invalid,
          loading: configured.loading,
          loop: configured.loop,
          clearable: true,
          label: text.label,
          empty: text.empty,
          placeholder: text.placeholder,
          translations: { trigger: text.trigger, clearTrigger: text.clearTrigger },
          openOnClick: true,
          inputBehavior: 'autohighlight',
          placement: configured.placement,
          dir: configured.dir,
          offset: configured.offset,
          variant: configured.variant,
          tone: configured.tone,
          size: configured.size,
          onValueChange: (details: { value: string[] }) => {
            selecting = true
            queueMicrotask(() => {
              selecting = false
            })
            const next = details.value[0] ?? null
            emit('value-change', { value: next })
            emit('update:value', next)
          },
          onInputValueChange: (details: { inputValue: string }) => {
            query.value = selecting ? '' : details.inputValue
            selecting = false
            emit('input-value-change', details)
          },
        }),
      ])
    }
  },
})
