import type { FormatInputSchema, FormatInputValueChangeDetails } from '../src/format-input'
import type { StructureChild } from '../src/shared/structure'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { checkFormatSpec } from '@xihan-ui/expression'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { connectFormatInput, FORMAT_INPUT_ANNOUNCE_DELAY, formatInputMachine, formatInputStructure } from '../src/format-input'
import { FORMAT_INPUT_EN_US } from '../src/locale/en-US'

type Props = FormatInputSchema['props']

function makeInput(initial: Props = {}) {
  const changes: FormatInputValueChangeDetails[] = []
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>({ ...initial, onValueChange: d => changes.push(d) })
  const service = createService(formatInputMachine, { props: () => props.get(), runtime })
  runtime.start()
  return {
    changes,
    api: () => connectFormatInput(service, normalizeProps),
    root: () => connectFormatInput(service, normalizeProps).getRootProps() as Record<string, unknown>,
    setProps: (next: Props) => props.set({ ...props.get(), ...next }),
    stop: () => runtime.stop(),
  }
}

/** 结构里的组合节点：外包（部件与它的 value、标签）与组件名。 */
function instances(nodes: readonly StructureChild[], parent = ''): string[] {
  return nodes.flatMap((node) => {
    if ('instance' in node)
      return [`${parent}:${node.instance}`]
    if (!('part' in node))
      return []
    const at = `${node.part}${node.attrs?.value ? `[${node.attrs.value}]` : ''}<${node.tag}>`
    return instances(node.children ?? [], at)
  })
}

afterEach(() => {
  vi.useRealTimers()
})

describe('formatInputMachine', () => {
  it('缺省不设格式：根是 group，没有参数行与样例；种类条目最前面是「不设格式」', () => {
    const f = makeInput()
    expect(f.api().value).toBeNull()
    expect(f.api().options).toEqual([])
    expect(f.root()).toMatchObject({ 'role': 'group', 'data-kind': 'none' })
    expect(f.api().kindItems.map(item => item.value)).toEqual(['none', 'number', 'percent', 'date', 'rmb-upper', 'numeral'])
    expect(f.api().kindControl).toBe('select')
    expect(f.api().getPreviewProps()).toMatchObject({ role: 'status', hidden: true })
  })

  it('换种类、改参数时派发合法的格式说明；派发的值都能通过 checkFormatSpec', () => {
    const f = makeInput()
    f.api().setKind('number')
    f.api().setDecimalsMode('fixed')
    f.api().setGrouping(true)
    f.api().setRounding('ceil')
    expect(f.changes.map(change => change.value)).toEqual([
      { kind: 'number' },
      { kind: 'number', decimals: 2 },
      { kind: 'number', decimals: 2, grouping: true },
      { kind: 'number', decimals: 2, grouping: true, rounding: 'ceil' },
    ])
    for (const change of f.changes)
      expect(checkFormatSpec(change.value)).toEqual([])
    expect(f.api().options).toEqual(['decimals-mode', 'decimals', 'grouping', 'rounding'])
    f.api().setKind(null)
    expect(f.changes.at(-1)).toEqual({ value: null })
  })

  it('不完整的草稿不派发：清空位数、范围倒挂、日期模式清空时根标 aria-invalid，行内说明进描述链', () => {
    const f = makeInput({ defaultValue: { kind: 'number', decimals: 2 } })
    f.api().setDecimals('decimals', '')
    expect(f.changes).toEqual([])
    expect(f.api().issue).toBe('decimals-empty')
    expect(f.root()).toMatchObject({ 'aria-invalid': 'true' })
    expect(f.root()['aria-describedby']).toBe(f.api().getErrorTextProps().id)
    expect(f.api().getDecimalsControlProps('decimals')).toMatchObject({ value: '', invalid: true })
    f.api().setDecimals('decimals', '3')
    expect(f.changes.at(-1)).toEqual({ value: { kind: 'number', decimals: 3 } })
    f.api().setDecimalsMode('range')
    f.api().setDecimals('minDecimals', '5')
    expect(f.api().issue).toBe('range-inverted')
    expect(f.changes.at(-1)).toEqual({ value: { kind: 'number', minDecimals: 0, maxDecimals: 3 } })
    f.api().setKind('date')
    f.api().setPattern('')
    expect(f.api().issue).toBe('pattern-empty')
    expect(f.api().issueText).toBe(FORMAT_INPUT_EN_US.issue('pattern-empty'))
  })

  it('受控：只发意图，宿主写回后草稿跟着改；同一个值写回时输入中的文字不被打断', () => {
    const f = makeInput({ value: { kind: 'number', decimals: 2 } })
    f.api().setDecimals('decimals', '4')
    expect(f.changes.at(-1)).toEqual({ value: { kind: 'number', decimals: 4 } })
    expect(f.api().value).toEqual({ kind: 'number', decimals: 2 })
    f.setProps({ value: { kind: 'number', decimals: 4 } })
    expect(f.api().getDecimalsControlProps('decimals').value).toBe('4')
    f.setProps({ value: { kind: 'date', pattern: 'yyyy' } })
    expect(f.api().draft).toMatchObject({ kind: 'date', pattern: 'yyyy' })
    f.setProps({ value: null })
    expect(f.api().kind).toBeNull()
  })

  it('形态只交给字段形态的控件：下拉、数字框与组合框随 variant，开关与分段切换不收这一轴', () => {
    const f = makeInput({ variant: 'subtle', size: 'sm', defaultValue: { kind: 'number', decimals: 2 } })
    expect(f.api().getKindSelectProps()).toMatchObject({ variant: 'subtle', size: 'sm' })
    expect(f.api().getDecimalsControlProps('decimals')).toMatchObject({ variant: 'subtle', size: 'sm' })
    expect(f.api().getRoundingControlProps()).toMatchObject({ variant: 'subtle' })
    expect(f.api().getGroupingControlProps()).not.toHaveProperty('variant')
    expect(f.api().getDecimalsModeControlProps()).not.toHaveProperty('variant')
  })

  it('kinds 限定可选种类：只剩三项（含不设格式）时种类改用分段切换', () => {
    const f = makeInput({ kinds: ['number', 'percent'] })
    expect(f.api().kindItems.map(item => item.value)).toEqual(['none', 'number', 'percent'])
    expect(f.api().kindControl).toBe('toggle-group')
    const g = makeInput({ kinds: ['number', 'percent'], clearable: false, defaultValue: { kind: 'date', pattern: 'yyyy' } })
    expect(g.api().kindItems.map(item => item.value)).toEqual(['number', 'percent'])
    expect(g.api().issue).toBe('XH_EXPR_FORMAT_INVALID_KIND')
  })

  it('mixed：种类一项都不选，下拉显示「多个值」，参数行与样例不铺；选了种类即派发，与当前值相同也派发', () => {
    const f = makeInput({ value: null, mixed: true })
    expect([f.api().kind, f.api().options, f.root()['data-kind']]).toEqual([null, [], undefined])
    expect(f.api().getKindSelectProps()).toMatchObject({ value: null, placeholder: 'Multiple values' })
    expect(f.api().getPreviewProps().hidden).toBe(true)
    f.api().setKind(null)
    expect(f.changes).toEqual([{ value: null }])
    f.api().setKind('number')
    expect(f.changes.at(-1)!.value).toMatchObject({ kind: 'number' })
    const toggle = makeInput({ value: { kind: 'percent' }, kinds: ['number', 'percent'], clearable: false, mixed: true })
    expect(toggle.api().getKindToggleGroupProps().value).toBeNull()
    toggle.setProps({ mixed: false })
    expect([toggle.api().getKindToggleGroupProps().value, toggle.api().options.length > 0]).toEqual(['percent', true])
  })

  it('禁用与只读时不改草稿', () => {
    const f = makeInput({ disabled: true })
    f.api().setKind('number')
    expect(f.api().kind).toBeNull()
    const g = makeInput({ readOnly: true, defaultValue: { kind: 'number' } })
    g.api().setGrouping(true)
    expect(g.api().draft.grouping).toBe(false)
    expect(g.changes).toEqual([])
  })

  it('样例停止输入一会儿后才换播报文字，初始值立即显示', () => {
    vi.useFakeTimers()
    const f = makeInput({ defaultValue: { kind: 'number', decimals: 1 }, sample: '12.345' })
    expect(f.api().previewText).toBe('Example: 12.3')
    f.api().setDecimals('decimals', '2')
    expect(f.api().previewText).toBe('Example: 12.3')
    vi.advanceTimersByTime(FORMAT_INPUT_ANNOUNCE_DELAY - 1)
    f.api().setDecimals('decimals', '3')
    vi.advanceTimersByTime(FORMAT_INPUT_ANNOUNCE_DELAY - 1)
    expect(f.api().previewText).toBe('Example: 12.3')
    vi.advanceTimersByTime(1)
    expect(f.api().previewText).toBe('Example: 12.345')
    f.setProps({ sample: 5000 })
    f.api().setKind('numeral')
    vi.advanceTimersByTime(FORMAT_INPUT_ANNOUNCE_DELAY)
    expect(f.api().previewText).toBe(FORMAT_INPUT_EN_US.sampleUnavailable)
  })

  it('内层控件的 props：回调向外层机器 send，值来自草稿', () => {
    const f = makeInput({ defaultValue: { kind: 'date', pattern: 'yyyy-MM' } })
    const pattern = f.api().getPatternControlProps()
    expect(pattern).toMatchObject({ value: ['yyyy-MM'], inputValue: 'yyyy-MM', allowCustomValue: true })
    expect(pattern.collection![0]).toEqual({ value: 'yyyy-MM-dd', label: 'yyyy-MM-dd（2026-01-02）' })
    pattern.onInputValueChange!({ inputValue: 'yyyy/M' })
    expect(f.changes.at(-1)).toEqual({ value: { kind: 'date', pattern: 'yyyy/M' } })
    f.api().getKindSelectProps().onValueChange!({ value: ['percent'] })
    expect(f.api().kind).toBe('percent')
    f.api().getKindSelectProps().onValueChange!({ value: ['bogus'] })
    expect(f.api().kind).toBe('percent')
    f.api().getDecimalsModeControlProps().onValueChange!({ value: 'range' })
    expect(f.api().draft.decimalsMode).toBe('range')
    f.api().getGroupingControlProps().onCheckedChange!({ checked: true })
    expect(f.changes.at(-1)!.value).toMatchObject({ grouping: true })
  })
})

describe('formatInputStructure', () => {
  it('种类、参数行（名字加控件）、样例与行内说明；内层控件是组合节点', () => {
    const f = makeInput({ defaultValue: { kind: 'number', decimals: 2 } })
    const nodes = formatInputStructure(f.api(), FORMAT_INPUT_EN_US)
    expect(nodes.map(node => node.part)).toEqual(['kind', 'field-group', 'preview'])
    expect(instances(nodes)).toEqual([
      'kind<div>:select',
      'item[decimals-mode]<fieldset>:toggle-group',
      'item[decimals]<div>:number-field',
      'item[grouping]<label>:switch',
      'item[rounding]<div>:select',
    ])
    // 分段切换与开关前面放名字（legend / span），带标题的控件经组合节点传 label
    const options = nodes[1]!.children! as StructureChild[]
    expect(options.map(node => ('part' in node && node.children?.[0] && 'part' in node.children[0] ? `${node.children[0].part}<${node.children[0].tag}>` : 'instance'))).toEqual(['item-label<legend>', 'instance', 'item-label<span>', 'instance'])
    expect(f.api().getDecimalsControlProps('decimals').label).toBe(FORMAT_INPUT_EN_US.decimals)
    expect(f.api().getKindSelectProps().label).toBe(FORMAT_INPUT_EN_US.kind)
    f.api().setDecimals('decimals', '')
    const invalid = formatInputStructure(f.api(), FORMAT_INPUT_EN_US)
    expect(invalid.at(-1)).toMatchObject({ part: 'error-text', text: FORMAT_INPUT_EN_US.issue('decimals-empty') })
  })

  it('日期带占位符说明；不设格式时只有种类', () => {
    const date = makeInput({ defaultValue: { kind: 'date', pattern: 'yyyy' }, kinds: ['number', 'date'] })
    const nodes = formatInputStructure(date.api(), FORMAT_INPUT_EN_US)
    expect(instances(nodes)).toEqual(['kind<fieldset>:toggle-group', 'item[pattern]<div>:combobox'])
    expect(nodes[1]!.children!.at(-1)).toMatchObject({ part: 'pattern-description', text: FORMAT_INPUT_EN_US.patternHint })
    const none = makeInput()
    expect(formatInputStructure(none.api(), FORMAT_INPUT_EN_US).map(node => node.part)).toEqual(['kind'])
  })
})
