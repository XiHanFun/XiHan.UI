import type { FormatSpec } from '@xihan-ui/expression'
import type { FormatInputDraft } from '../src/format-input/format-input.model'
import { checkFormatSpec } from '@xihan-ui/expression'
import { describe, expect, it } from 'vitest'
import {
  draftFromFormat,
  emptyFormatDraft,
  FORMAT_INPUT_DATE_PATTERNS,
  formatFromDraft,
  formatPreview,
  formatSample,
  switchDecimalsMode,
  switchFormatKind,
} from '../src/format-input/format-input.model'

const empty = emptyFormatDraft()

function roundTrip(value: FormatSpec | undefined): FormatSpec | undefined {
  const result = formatFromDraft(draftFromFormat(value, empty))
  if (!result.ok)
    throw new Error(result.issue)
  return result.value
}

describe('格式输入的编辑模型', () => {
  it('空草稿是不设格式，日期模式取第一个预设、字形取第一种样式、舍入取四舍五入', () => {
    expect(empty).toMatchObject({ kind: null, decimalsMode: 'exact', pattern: FORMAT_INPUT_DATE_PATTERNS[0], style: 'roman-upper', rounding: 'half-up', grouping: false })
    expect(emptyFormatDraft(['yyyy']).pattern).toBe('yyyy')
    expect(formatFromDraft(empty)).toEqual({ ok: true, value: undefined })
  })

  it('格式说明进出草稿不变：缺省参数不写出来', () => {
    const values: FormatSpec[] = [
      { kind: 'number' },
      { kind: 'number', decimals: 2, grouping: true },
      { kind: 'percent', minDecimals: 1, maxDecimals: 3, rounding: 'half-even' },
      { kind: 'date', pattern: 'yyyy年M月d日' },
      { kind: 'rmb-upper' },
      { kind: 'rmb-upper', rounding: 'down' },
      { kind: 'numeral', style: 'cn-upper' },
    ]
    for (const value of values)
      expect(roundTrip(value)).toEqual(value)
    expect(roundTrip(undefined)).toBeUndefined()
    expect(roundTrip({ kind: 'number', decimals: 2, grouping: false, rounding: 'half-up' })).toEqual({ kind: 'number', decimals: 2 })
  })

  it('换种类时参数留在草稿里：数字与百分比互换沿用小数位、千分位与舍入，人民币大写沿用舍入，换回来还是上次填的', () => {
    const number = draftFromFormat({ kind: 'number', decimals: 3, grouping: true, rounding: 'ceil' }, empty)
    expect(formatFromDraft(switchFormatKind(number, 'percent'))).toEqual({ ok: true, value: { kind: 'percent', decimals: 3, grouping: true, rounding: 'ceil' } })
    expect(formatFromDraft(switchFormatKind(number, 'rmb-upper'))).toEqual({ ok: true, value: { kind: 'rmb-upper', rounding: 'ceil' } })
    expect(formatFromDraft(switchFormatKind(number, 'date'))).toEqual({ ok: true, value: { kind: 'date', pattern: 'yyyy-MM-dd' } })
    expect(formatFromDraft(switchFormatKind(number, 'numeral'))).toEqual({ ok: true, value: { kind: 'numeral', style: 'roman-upper' } })
    const back = switchFormatKind(switchFormatKind(number, 'date'), 'number')
    expect(formatFromDraft(back)).toEqual({ ok: true, value: { kind: 'number', decimals: 3, grouping: true, rounding: 'ceil' } })
    expect(switchFormatKind(number, 'number')).toBe(number)
    expect(formatFromDraft(switchFormatKind(number, null))).toEqual({ ok: true, value: undefined })
  })

  it('换小数位写法时数字尽量带过去：固定 n 换成 0 到 n，范围换成固定取上限，不舍入不写位数', () => {
    const fixed = draftFromFormat({ kind: 'number', decimals: 4 }, empty)
    const range = switchDecimalsMode(fixed, 'range')
    expect(formatFromDraft(range)).toEqual({ ok: true, value: { kind: 'number', minDecimals: 0, maxDecimals: 4 } })
    expect(formatFromDraft(switchDecimalsMode({ ...range, minDecimals: 1, maxDecimals: 3 }, 'fixed'))).toEqual({ ok: true, value: { kind: 'number', decimals: 3 } })
    expect(formatFromDraft(switchDecimalsMode(range, 'exact'))).toEqual({ ok: true, value: { kind: 'number' } })
    const exact = draftFromFormat({ kind: 'number' }, empty)
    expect(formatFromDraft(switchDecimalsMode(exact, 'fixed'))).toEqual({ ok: true, value: { kind: 'number', decimals: 2 } })
    expect(formatFromDraft(switchDecimalsMode(exact, 'range'))).toEqual({ ok: true, value: { kind: 'number', minDecimals: 0, maxDecimals: 2 } })
    expect(switchDecimalsMode(fixed, 'fixed')).toBe(fixed)
  })

  it('只写了范围一端的格式说明，另一端取 0 或上限', () => {
    expect(draftFromFormat({ kind: 'number', maxDecimals: 2 }, empty)).toMatchObject({ decimalsMode: 'range', minDecimals: 0, maxDecimals: 2 })
    expect(draftFromFormat({ kind: 'number', minDecimals: 1 }, empty)).toMatchObject({ decimalsMode: 'range', minDecimals: 1, maxDecimals: 34 })
  })

  it('不完整的草稿不产出格式说明，只给问题码', () => {
    const number = draftFromFormat({ kind: 'number', decimals: 2 }, empty)
    expect(formatFromDraft({ ...number, decimals: null })).toEqual({ ok: false, issue: 'decimals-empty' })
    const range: FormatInputDraft = { ...number, decimalsMode: 'range', minDecimals: 3, maxDecimals: 1 }
    expect(formatFromDraft(range)).toEqual({ ok: false, issue: 'range-inverted' })
    expect(formatFromDraft({ ...range, maxDecimals: null })).toEqual({ ok: false, issue: 'decimals-empty' })
    expect(formatFromDraft({ ...number, kind: 'date', pattern: '' })).toEqual({ ok: false, issue: 'pattern-empty' })
    expect(formatFromDraft({ ...number, decimals: 35 })).toEqual({ ok: false, issue: 'XH_EXPR_FORMAT_INVALID_OPTION' })
  })

  it('kinds 限定可选的种类：草稿的种类不在其中时报 checkFormatSpec 的种类问题', () => {
    const date = draftFromFormat({ kind: 'date', pattern: 'yyyy' }, empty)
    expect(formatFromDraft(date, ['number', 'percent'])).toEqual({ ok: false, issue: 'XH_EXPR_FORMAT_INVALID_KIND' })
    expect(formatFromDraft(switchFormatKind(date, 'percent'), ['number', 'percent'])).toEqual({ ok: true, value: { kind: 'percent' } })
  })

  it('派发出去的格式说明都能通过 checkFormatSpec', () => {
    const drafts: FormatInputDraft[] = []
    for (const kind of ['number', 'percent', 'date', 'rmb-upper', 'numeral'] as const) {
      for (const mode of ['fixed', 'range', 'exact'] as const)
        drafts.push(switchDecimalsMode(switchFormatKind({ ...empty, grouping: true, rounding: 'floor' }, kind), mode))
    }
    for (const draft of drafts) {
      const result = formatFromDraft(draft)
      expect(result.ok).toBe(true)
      if (result.ok && result.value)
        expect(checkFormatSpec(result.value)).toEqual([])
    }
  })

  it('样例按种类取缺省值，套不上的样例给 null', () => {
    expect(formatPreview({ kind: 'number', decimals: 2, grouping: true })).toBe('1,234,567.89')
    expect(formatPreview({ kind: 'percent', decimals: 1 })).toBe('12.3%')
    expect(formatPreview({ kind: 'date', pattern: 'yyyy-MM-dd HH:mm:ss.SSS' })).toBe('2026-01-02 03:04:05.006')
    expect(formatPreview({ kind: 'rmb-upper' })).toBe('壹仟贰佰叁拾肆元伍角')
    expect(formatPreview({ kind: 'numeral', style: 'roman-upper' })).toBe('MMXXVI')
    expect(formatPreview({ kind: 'numeral', style: 'roman-upper' }, 5000)).toBeNull()
    expect(formatPreview({ kind: 'number', grouping: true }, '1234.5', { locale: 'de-DE' })).toBe('1.234,5')
    expect(formatSample('number')).toBe('1234567.891')
  })
})
