/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 format input 相关实现。

import type { NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { FormatRounding, NumeralStyle } from '@xihan-ui/expression'
import type { FormatInputDecimalsMode, FormatInputDraft, FormatInputKind } from './format-input.model'
import type { FormatInputApi, FormatInputKindOption, FormatInputOption, FormatInputSchema } from './format-input.types'
import { dataAttr } from '@xihan-ui/core'
import { FORMAT_DECIMALS_LIMIT, FORMAT_KINDS, FORMAT_ROUNDINGS, NUMERAL_STYLES } from '@xihan-ui/expression'
import { formatInputAnatomy } from './format-input.anatomy'
import { formatInputTranslations } from './format-input.machine'
import { FORMAT_INPUT_DATE_PATTERNS, FORMAT_INPUT_DECIMALS_MODES, formatFromDraft, formatPreview } from './format-input.model'

const parts = formatInputAnatomy.build()

/** 种类条目不超过这么多项时用分段切换。 */
const TOGGLE_LIMIT = 3

/** 参数行的部件名与它的名字（文案键）。 */
const OPTION_LABELS = {
  'decimals-mode': 'decimalsMode',
  'decimals': 'decimals',
  'min-decimals': 'minDecimals',
  'max-decimals': 'maxDecimals',
  'grouping': 'grouping',
  'rounding': 'rounding',
  'pattern': 'pattern',
  'numeral-style': 'numeralStyle',
} as const satisfies Record<FormatInputOption, string>

/** 参数行的外包标签：分段切换包在 fieldset 里、名字写在 legend；开关包在 label 里由它命名；其余的控件自己铺标题。 */
export function formatInputItemTag(option: FormatInputOption | 'kind', kindControl: FormatInputApi['kindControl']): 'div' | 'fieldset' | 'label' {
  if (option === 'decimals-mode' || (option === 'kind' && kindControl === 'toggle-group'))
    return 'fieldset'
  return option === 'grouping' ? 'label' : 'div'
}

/** 参数行名字的标签：在 fieldset 里是 legend，其余是 span。 */
export function formatInputItemLabelTag(option: FormatInputOption | 'kind', kindControl: FormatInputApi['kindControl']): 'legend' | 'span' {
  return formatInputItemTag(option, kindControl) === 'fieldset' ? 'legend' : 'span'
}

/** 当前种类用得到的参数行；不舍入时没有舍入方式。 */
export function formatInputOptions(draft: FormatInputDraft): FormatInputOption[] {
  switch (draft.kind) {
    case 'number':
    case 'percent': {
      const counts: FormatInputOption[] = draft.decimalsMode === 'fixed' ? ['decimals'] : draft.decimalsMode === 'range' ? ['min-decimals', 'max-decimals'] : []
      return ['decimals-mode', ...counts, 'grouping', ...(draft.decimalsMode === 'exact' ? [] : ['rounding' as const])]
    }
    case 'date':
      return ['pattern']
    case 'rmb-upper':
      return ['rounding']
    case 'numeral':
      return ['numeral-style']
    case null:
      return []
  }
}

export function connectFormatInput<T extends PropTypes>(
  service: Service<FormatInputSchema>,
  normalize: NormalizeProps<T>,
): FormatInputApi<T> {
  const { context, prop, send, scope } = service
  const t = formatInputTranslations(prop)
  const value = context.get('value') ?? null
  const draft = context.get('draft')
  const inputs = context.get('inputs')
  const kinds = prop('kinds') ?? FORMAT_KINDS
  const clearable = prop('clearable') ?? true
  const disabled = !!prop('disabled')
  const readOnly = !!prop('readOnly')
  const size = prop('size')
  const variant = prop('variant')
  const result = formatFromDraft(draft, kinds)
  const issue = result.ok ? null : result.issue
  const invalid = !!prop('invalid') || issue !== null
  const options = formatInputOptions(draft)
  const ids = scope.ids('format-input', 'label', 'preview', 'error-text')
  const kindItems: { value: FormatInputKindOption, label: string }[] = [
    ...(clearable ? [{ value: 'none' as const, label: t.kindOption('none') }] : []),
    ...kinds.map(kind => ({ value: kind, label: t.kindOption(kind) })),
  ]
  const kindControl = kindItems.length <= TOGGLE_LIMIT ? 'toggle-group' : 'select'
  const kindValue: FormatInputKindOption = draft.kind ?? 'none'
  const patterns = prop('datePatterns') ?? FORMAT_INPUT_DATE_PATTERNS
  const shared = { disabled, readOnly, size }
  // 下拉、数字框与组合框是字段形态的控件，形态跟着本组件走；开关与分段切换没有这一轴
  const fieldStyle = { ...shared, variant }

  const setKind = (kind: FormatInputKind | null): void => send({ type: 'KIND.SET', kind })
  const kindOf = (option: string | null | undefined): FormatInputKind | null | undefined => {
    if (option === 'none')
      return null
    return (kinds as readonly string[]).includes(option ?? '') ? option as FormatInputKind : undefined
  }

  return {
    value,
    kind: draft.kind,
    draft,
    issue,
    issueText: issue === null ? '' : t.issue(issue),
    previewText: context.get('announced'),
    options,
    kindItems,
    kindControl,
    setKind,
    setDecimalsMode: (mode: FormatInputDecimalsMode) => send({ type: 'DECIMALS_MODE.SET', mode }),
    setDecimals: (field, text) => send({ type: 'DECIMALS.SET', field, text }),
    setGrouping: (next: boolean) => send({ type: 'GROUPING.SET', value: next }),
    setRounding: (next: FormatRounding) => send({ type: 'ROUNDING.SET', value: next }),
    setPattern: (next: string) => send({ type: 'PATTERN.SET', value: next }),
    setNumeralStyle: (next: NumeralStyle) => send({ type: 'STYLE.SET', value: next }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'role': 'group',
      // 只指向真渲染了的标题：悬空的 IDREF 让组没有名字
      'aria-labelledby': prop('labelled') ? ids.label : undefined,
      'aria-invalid': invalid ? 'true' : undefined,
      'aria-describedby': issue === null ? undefined : ids['error-text'],
      'data-kind': draft.kind ?? 'none',
      'data-size': size,
      'data-variant': variant,
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid),
    }),
    getLabelProps: () => normalize.element({ ...parts.label.attrs, id: ids.label }),
    getKindProps: () => normalize.element({ ...parts.kind.attrs }),
    getFieldGroupProps: () => normalize.element({ ...parts['field-group'].attrs, hidden: options.length === 0 || undefined }),
    getItemProps: option => normalize.element({ ...parts.item.attrs, 'data-value': option, 'hidden': !options.includes(option) || undefined }),
    getItemLabelProps: option => normalize.element({ ...parts['item-label'].attrs, 'data-value': option }),
    getPatternDescriptionProps: () => normalize.element({ ...parts['pattern-description'].attrs, hidden: draft.kind !== 'date' || undefined }),
    getPreviewProps: () => normalize.element({
      ...parts.preview.attrs,
      'id': ids.preview,
      'role': 'status',
      'aria-live': 'polite',
      'hidden': value === null || undefined,
    }),
    getErrorTextProps: () => normalize.element({ ...parts['error-text'].attrs, id: ids['error-text'], hidden: issue === null || undefined }),

    getKindToggleGroupProps: () => ({
      disabled: disabled || readOnly,
      size,
      collection: kindItems.map(item => ({ value: item.value, label: item.label })),
      value: kindValue,
      disallowEmpty: true,
      onValueChange: (details) => {
        const next = kindOf(Array.isArray(details.value) ? details.value[0] : details.value)
        if (next !== undefined)
          setKind(next)
      },
    }),
    getKindSelectProps: () => ({
      ...fieldStyle,
      label: t.kind,
      collection: kindItems.map(item => ({ value: item.value, label: item.label })),
      value: kindValue,
      onValueChange: (details) => {
        const next = kindOf(details.value[0])
        if (next !== undefined)
          setKind(next)
      },
    }),
    getDecimalsModeControlProps: () => ({
      disabled: disabled || readOnly,
      size,
      collection: FORMAT_INPUT_DECIMALS_MODES.map(mode => ({ value: mode, label: t.decimalsModeOption(mode) })),
      value: draft.decimalsMode,
      disallowEmpty: true,
      onValueChange: (details) => {
        const mode = Array.isArray(details.value) ? details.value[0] : details.value
        if ((FORMAT_INPUT_DECIMALS_MODES as readonly (string | null | undefined)[]).includes(mode))
          send({ type: 'DECIMALS_MODE.SET', mode: mode as FormatInputDecimalsMode })
      },
    }),
    getDecimalsControlProps: field => ({
      ...fieldStyle,
      label: t[field],
      value: inputs[field],
      min: 0,
      max: FORMAT_DECIMALS_LIMIT,
      step: 1,
      invalid: (issue === 'decimals-empty' && inputs[field].trim() === '') || (issue === 'range-inverted' && field !== 'decimals'),
      onValueChange: details => send({ type: 'DECIMALS.SET', field, text: details.value }),
    }),
    getGroupingControlProps: () => ({
      ...shared,
      checked: draft.grouping,
      onCheckedChange: details => send({ type: 'GROUPING.SET', value: details.checked }),
    }),
    getRoundingControlProps: () => ({
      ...fieldStyle,
      label: t.rounding,
      collection: FORMAT_ROUNDINGS.map(rounding => ({ value: rounding, label: t.roundingOption(rounding) })),
      value: draft.rounding,
      onValueChange: (details) => {
        const next = details.value[0]
        if ((FORMAT_ROUNDINGS as readonly (string | undefined)[]).includes(next))
          send({ type: 'ROUNDING.SET', value: next as FormatRounding })
      },
    }),
    getPatternControlProps: () => ({
      ...fieldStyle,
      label: t.pattern,
      collection: patterns.map((pattern) => {
        const sample = formatPreview({ kind: 'date', pattern }, undefined, { locale: prop('locale'), timeZone: prop('timeZone') })
        return { value: pattern, label: sample === null ? pattern : `${pattern}（${sample}）` }
      }),
      value: patterns.includes(draft.pattern) ? [draft.pattern] : [],
      inputValue: draft.pattern,
      allowCustomValue: true,
      invalid: issue === 'pattern-empty',
      onValueChange: (details) => {
        const next = details.value[0]
        if (next !== undefined)
          send({ type: 'PATTERN.SET', value: next })
      },
      onInputValueChange: details => send({ type: 'PATTERN.SET', value: details.inputValue }),
    }),
    getNumeralStyleControlProps: () => ({
      ...fieldStyle,
      label: t.numeralStyle,
      collection: NUMERAL_STYLES.map(style => ({ value: style, label: t.numeralStyleOption(style) })),
      value: draft.style,
      onValueChange: (details) => {
        const next = details.value[0]
        if ((NUMERAL_STYLES as readonly (string | undefined)[]).includes(next))
          send({ type: 'STYLE.SET', value: next as NumeralStyle })
      },
    }),
  }
}

/** 参数行名字的文案键。 */
export function formatInputOptionLabelKey(option: FormatInputOption): (typeof OPTION_LABELS)[FormatInputOption] {
  return OPTION_LABELS[option]
}
