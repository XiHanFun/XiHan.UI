/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 格式输入的标准结构：种类控件、当前种类的参数行、样例与行内说明。里面的控件是组合节点，结构由它们自己生成。
// Vue / React 不写默认插槽时的缺省树、Web Components 只写 root 时元素生成的节点，都照这一份渲。

import type { StructureChild, StructureNode } from '../shared/structure'
import type { formatInputAnatomy } from './format-input.anatomy'
import type { FormatInputApi, FormatInputOption, FormatInputTranslations } from './format-input.types'
import { structureInstance } from '../shared/structure-instance'
import { formatInputItemLabelTag, formatInputItemTag, formatInputOptionLabelKey } from './format-input.connect'

type FormatInputPart = (typeof formatInputAnatomy)['parts'][number]

/** 结构会产出的部件；root 由组件或元素自己给出，不在其列。 */
export const FORMAT_INPUT_STRUCTURE_PARTS = [
  'kind',
  'field-group',
  'item',
  'item-label',
  'pattern-description',
  'preview',
  'error-text',
] as const satisfies readonly FormatInputPart[]

/** anatomy 里不进标准结构的部件：标题由作者写，放进 xh-field 时用字段的标题。 */
export const FORMAT_INPUT_STRUCTURE_OMITS = ['label'] as const satisfies readonly FormatInputPart[]

type FormatInputNode = StructureNode<(typeof FORMAT_INPUT_STRUCTURE_PARTS)[number]>
type FormatInputChild = StructureChild<(typeof FORMAT_INPUT_STRUCTURE_PARTS)[number]>

/** 一个参数行里的控件。 */
function optionControl(api: FormatInputApi, option: FormatInputOption): FormatInputChild {
  switch (option) {
    case 'decimals-mode':
      return structureInstance('control', 'toggle-group', api.getDecimalsModeControlProps())
    case 'decimals':
      return structureInstance('control', 'number-field', api.getDecimalsControlProps('decimals'))
    case 'min-decimals':
      return structureInstance('control', 'number-field', api.getDecimalsControlProps('minDecimals'))
    case 'max-decimals':
      return structureInstance('control', 'number-field', api.getDecimalsControlProps('maxDecimals'))
    case 'grouping':
      return structureInstance('control', 'switch', api.getGroupingControlProps())
    case 'rounding':
      return structureInstance('control', 'select', api.getRoundingControlProps())
    case 'pattern':
      return structureInstance('control', 'combobox', api.getPatternControlProps())
    case 'numeral-style':
      return structureInstance('control', 'select', api.getNumeralStyleControlProps())
  }
}

/** 一个参数行：分段切换与开关前面放名字（legend 或 span），其余控件自己铺标题。 */
function optionNode(api: FormatInputApi, option: FormatInputOption, translations: FormatInputTranslations): FormatInputNode {
  const tag = formatInputItemTag(option, api.kindControl)
  const control = optionControl(api, option)
  const children: FormatInputChild[] = tag === 'div'
    ? [control]
    : [{ key: 'label', tag: formatInputItemLabelTag(option, api.kindControl), part: 'item-label', attrs: { value: option }, text: translations[formatInputOptionLabelKey(option)] }, control]
  return { key: option, tag, part: 'item', attrs: { value: option }, children }
}

/**
 * 格式输入在 root 里的标准结构，次序是种类、参数行、样例、行内说明。
 * 参数行只铺当前种类用得到的那几行；日期模式下面另有占位符说明。
 */
export function formatInputStructure(api: FormatInputApi, translations: FormatInputTranslations): FormatInputNode[] {
  const kind: FormatInputNode = api.kindControl === 'toggle-group'
    ? {
        key: 'kind',
        tag: 'fieldset',
        part: 'kind',
        children: [
          { key: 'label', tag: 'legend', part: 'item-label', attrs: { value: 'kind' }, text: translations.kind },
          structureInstance('control', 'toggle-group', api.getKindToggleGroupProps()),
        ],
      }
    : { key: 'kind', tag: 'div', part: 'kind', children: [structureInstance('control', 'select', api.getKindSelectProps())] }
  const rows: FormatInputNode[] = api.options.map(option => optionNode(api, option, translations))
  if (api.kind === 'date')
    rows.push({ key: 'hint', tag: 'p', part: 'pattern-description', text: translations.patternHint })
  const nodes: FormatInputNode[] = [kind]
  if (rows.length > 0)
    nodes.push({ key: 'options', tag: 'div', part: 'field-group', children: rows })
  if (api.value !== null)
    nodes.push({ key: 'preview', tag: 'div', part: 'preview', text: api.previewText })
  if (api.issue !== null)
    nodes.push({ key: 'error', tag: 'p', part: 'error-text', text: api.issueText })
  return nodes
}
