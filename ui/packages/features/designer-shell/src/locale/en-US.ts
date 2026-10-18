/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 设计器零件的英文文案，与零件不配语言包时的缺省文案相同。每个零件一桶，各自是具名导出。

import type { XhConfig } from '@xihan-ui/web-components'
import type { DesignerShellLocaleTranslations } from './types'

export const DESIGNER_PROPERTIES_EN_US: DesignerShellLocaleTranslations['xh-designer-properties'] = {
  title: 'Properties',
  empty: 'No properties to edit',
  mixed: 'Multiple values',
  invalidJson: 'Not valid JSON',
  notInteger: 'Must be a whole number',
  belowMinimum: min => `Must be at least ${min}`,
  aboveMaximum: max => `Must be at most ${max}`,
  notAboveMinimum: min => `Must be greater than ${min}`,
  invalidDataField: 'Not a valid field path',
  sidesLinked: 'Same on all sides',
  sides: { all: 'All sides', top: 'Top', right: 'Right', bottom: 'Bottom', left: 'Left' },
  sidesIncomplete: 'Fill in all four sides',
  customColor: 'Custom color',
}

export const DESIGNER_ISSUES_EN_US: DesignerShellLocaleTranslations['xh-designer-issues'] = {
  title: 'Problems',
  empty: 'No problems',
  errors: count => `${count} ${count === 1 ? 'error' : 'errors'}`,
  warnings: count => `${count} ${count === 1 ? 'warning' : 'warnings'}`,
  severityError: 'Error',
  severityWarning: 'Warning',
  filter: 'Show problems by severity',
  noTarget: 'General',
}

export const DESIGNER_PALETTE_EN_US: DesignerShellLocaleTranslations['xh-designer-palette'] = {
  title: 'Elements',
  search: 'Search elements',
  noMatches: 'No matching elements',
  empty: 'No elements',
}

export const DESIGNER_RULER_EN_US: DesignerShellLocaleTranslations['xh-designer-ruler'] = {
  horizontalGuide: value => `Horizontal guide at ${value}`,
  verticalGuide: value => `Vertical guide at ${value}`,
}

export const DESIGNER_FRAME_EN_US: DesignerShellLocaleTranslations['xh-designer-frame'] = {
  layout: 'Designer layout',
  resize: label => `Resize ${label}`,
  closePanel: label => `Close ${label}`,
  panelHelp: label => `About ${label}`,
}

const translations: DesignerShellLocaleTranslations = {
  'xh-designer-properties': DESIGNER_PROPERTIES_EN_US,
  'xh-designer-issues': DESIGNER_ISSUES_EN_US,
  'xh-designer-palette': DESIGNER_PALETTE_EN_US,
  'xh-designer-ruler': DESIGNER_RULER_EN_US,
  'xh-designer-frame': DESIGNER_FRAME_EN_US,
}

/** 英文。 */
export const designerShellEnUS: XhConfig = { translations }
