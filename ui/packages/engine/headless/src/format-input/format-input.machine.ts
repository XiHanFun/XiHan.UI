/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 format input 相关实现。

import type { ContextFacade, PropFn } from '@xihan-ui/core'
import type { JsonValue } from '@xihan-ui/core/json'
import type { FormatSpec } from '@xihan-ui/expression'
import type { FormatInputDraft } from './format-input.model'
import type { FormatInputDecimalsField, FormatInputSchema, FormatInputTranslations } from './format-input.types'
import { setTimeoutEffect, setup } from '@xihan-ui/core'
import { jsonEquals } from '@xihan-ui/core/json'
import { FORMAT_KINDS } from '@xihan-ui/expression'
import { FORMAT_INPUT_EN_US } from '../locale/en-US'
import { resolveTranslations } from '../shared/translations'
import { draftFromFormat, emptyFormatDraft, FORMAT_INPUT_DATE_PATTERNS, formatFromDraft, formatPreview, switchDecimalsMode, switchFormatKind } from './format-input.model'

const { createMachine } = setup<FormatInputSchema>()

/** 停止输入多久之后才换播报的样例文字（毫秒）。 */
export const FORMAT_INPUT_ANNOUNCE_DELAY = 300

/** 两份格式说明是否相同。 */
export function sameFormat(a: FormatSpec | null | undefined, b: FormatSpec | null | undefined): boolean {
  return jsonEquals(a as JsonValue | undefined, b as JsonValue | undefined)
}

/** 解析后的文案。 */
export function formatInputTranslations(prop: PropFn<FormatInputSchema>): FormatInputTranslations {
  return resolveTranslations(FORMAT_INPUT_EN_US, prop('translations'))
}

/** 样例行的文字：带「示例：」前缀；没有格式时为空串，套不上样例时是说明。 */
export function formatInputPreviewText(prop: PropFn<FormatInputSchema>, value: FormatSpec | null): string {
  if (value === null)
    return ''
  const t = formatInputTranslations(prop)
  const sample = prop('sample')
  const text = formatPreview(value, sample === undefined ? undefined : sample, { locale: prop('locale'), timeZone: prop('timeZone') })
  return text === null ? t.sampleUnavailable : t.preview(text)
}

/** 草稿里三个小数位的文字。 */
function inputsOf(draft: FormatInputDraft): Record<FormatInputDecimalsField, string> {
  const text = (value: number | null): string => (value === null ? '' : String(value))
  return { decimals: text(draft.decimals), minDecimals: text(draft.minDecimals), maxDecimals: text(draft.maxDecimals) }
}

/** 输入框的文字换成位数：空串为 null，其余照数字读（非整数、越界留给 checkFormatSpec 判）。 */
function decimalsOf(text: string): number | null {
  const trimmed = text.trim()
  if (trimmed === '')
    return null
  const value = Number(trimmed)
  return Number.isNaN(value) ? null : value
}

/** 写入新草稿：小数位的文字跟着位数走，草稿完整时提交格式说明。 */
function commit(context: ContextFacade<FormatInputSchema>, prop: PropFn<FormatInputSchema>, draft: FormatInputDraft, inputs?: Record<FormatInputDecimalsField, string>): void {
  context.set('draft', draft)
  context.set('inputs', inputs ?? inputsOf(draft))
  const result = formatFromDraft(draft, prop('kinds') ?? FORMAT_KINDS)
  if (result.ok)
    context.set('value', result.value ?? null)
}

// 当前值住在 context 的 cell 里，受控 / 非受控在 cell 收口；草稿另存，不完整的草稿不提交。
// 改了任何参数都转入 settling 并重新计时，计时到了才换播报的样例文字。
export const formatInputMachine = createMachine({
  name: 'format-input',
  context: ({ prop, cell }) => {
    const patterns = prop('datePatterns') ?? FORMAT_INPUT_DATE_PATTERNS
    const initial = prop('value') !== undefined ? prop('value') : prop('defaultValue')
    const draft = draftFromFormat(initial ?? undefined, emptyFormatDraft(patterns))
    return {
      value: cell<FormatSpec | null>(() => ({
        value: prop('value'),
        defaultValue: prop('defaultValue') ?? null,
        isEqual: sameFormat,
        onChange: value => prop('onValueChange')?.({ value }),
      })),
      draft: cell<FormatInputDraft>(() => ({ defaultValue: draft })),
      inputs: cell<Readonly<Record<FormatInputDecimalsField, string>>>(() => ({ defaultValue: inputsOf(draft) })),
      announced: cell<string>(() => ({ defaultValue: formatInputPreviewText(prop, initial ?? null) })),
    }
  },
  initialState: () => 'idle',
  watch: ({ track, prop, action }) => {
    track([() => prop('value')], () => action(['requestSync']))
  },
  on: {
    'KIND.SET': { guard: 'isEditable', target: 'settling', reenter: true, actions: ['setKind'] },
    'DECIMALS_MODE.SET': { guard: 'isEditable', target: 'settling', reenter: true, actions: ['setDecimalsMode'] },
    'DECIMALS.SET': { guard: 'isEditable', target: 'settling', reenter: true, actions: ['setDecimals'] },
    'GROUPING.SET': { guard: 'isEditable', target: 'settling', reenter: true, actions: ['setGrouping'] },
    'ROUNDING.SET': { guard: 'isEditable', target: 'settling', reenter: true, actions: ['setRounding'] },
    'PATTERN.SET': { guard: 'isEditable', target: 'settling', reenter: true, actions: ['setPattern'] },
    'STYLE.SET': { guard: 'isEditable', target: 'settling', reenter: true, actions: ['setStyle'] },
    'VALUE.SYNC': { target: 'settling', reenter: true, actions: ['syncValue'] },
  },
  states: {
    idle: {},
    settling: {
      effects: ['trackAnnounce'],
      on: {
        'after.announce': { target: 'idle', actions: ['announce'] },
      },
    },
  },
  implementations: {
    guards: {
      isEditable: ({ prop }) => !prop('disabled') && !prop('readOnly'),
    },
    actions: {
      setKind: ({ context, prop, event: facade }) => {
        const event = facade.current()
        if (event.type !== 'KIND.SET')
          return
        const before = context.get('value')
        const draft = switchFormatKind(context.get('draft'), event.kind)
        commit(context, prop, draft)
        // 取值各不相同时选了种类就要派发：与当前值不同的照常由值的 cell 派发，相同的在这里补发，几个对象要统一成这一份
        const result = formatFromDraft(draft, prop('kinds') ?? FORMAT_KINDS)
        if (prop('mixed') === true && result.ok && sameFormat(before, result.value ?? null))
          prop('onValueChange')?.({ value: result.value ?? null })
      },
      setDecimalsMode: ({ context, prop, event: facade }) => {
        const event = facade.current()
        if (event.type === 'DECIMALS_MODE.SET')
          commit(context, prop, switchDecimalsMode(context.get('draft'), event.mode))
      },
      setDecimals: ({ context, prop, event: facade }) => {
        const event = facade.current()
        if (event.type !== 'DECIMALS.SET')
          return
        const draft = { ...context.get('draft'), [event.field]: decimalsOf(event.text) }
        commit(context, prop, draft, { ...context.get('inputs'), [event.field]: event.text })
      },
      setGrouping: ({ context, prop, event: facade }) => {
        const event = facade.current()
        if (event.type === 'GROUPING.SET')
          commit(context, prop, { ...context.get('draft'), grouping: event.value })
      },
      setRounding: ({ context, prop, event: facade }) => {
        const event = facade.current()
        if (event.type === 'ROUNDING.SET')
          commit(context, prop, { ...context.get('draft'), rounding: event.value })
      },
      setPattern: ({ context, prop, event: facade }) => {
        const event = facade.current()
        if (event.type === 'PATTERN.SET')
          commit(context, prop, { ...context.get('draft'), pattern: event.value })
      },
      setStyle: ({ context, prop, event: facade }) => {
        const event = facade.current()
        if (event.type === 'STYLE.SET')
          commit(context, prop, { ...context.get('draft'), style: event.value })
      },
      // 宿主改了受控值：草稿与它不一致时按它改写草稿，输入中途合法的草稿不被同一个值写回打断
      syncValue: ({ context, prop }) => {
        const value = prop('value')
        if (value === undefined)
          return
        const draft = context.get('draft')
        const current = formatFromDraft(draft, prop('kinds') ?? FORMAT_KINDS)
        if (current.ok && sameFormat(current.value ?? null, value))
          return
        const next = draftFromFormat(value ?? undefined, draft)
        context.set('draft', next)
        context.set('inputs', inputsOf(next))
      },
      requestSync: ({ send }) => send({ type: 'VALUE.SYNC' }),
      announce: ({ context, prop }) => {
        context.set('announced', formatInputPreviewText(prop, context.get('value') ?? null))
      },
    },
    effects: {
      trackAnnounce: ({ send }) => setTimeoutEffect(() => send({ type: 'after.announce' }), FORMAT_INPUT_ANNOUNCE_DELAY),
    },
  },
})
