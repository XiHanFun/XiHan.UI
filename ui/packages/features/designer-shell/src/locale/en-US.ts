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
  optionColumns: { value: 'Value', label: 'Label', disabled: 'Disabled' },
  optionCell: (column, row) => `${column}, option ${row}`,
  optionBoolean: { true: 'Yes', false: 'No' },
  optionTreeCell: (column, outline) => `${column}, option ${outline}`,
  optionActions: 'Actions',
  optionAddChild: outline => `Add a child to option ${outline}`,
  optionRemove: outline => `Remove option ${outline}`,
  optionAdd: 'Add option',
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

export const DESIGNER_OUTLINE_EN_US: DesignerShellLocaleTranslations['xh-designer-outline'] = {
  title: 'Structure',
  search: 'Search structure',
  noMatches: 'No matching items',
  empty: 'Nothing here yet',
  remove: label => `Delete ${label}`,
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

export const DESIGNER_SETTINGS_EN_US: DesignerShellLocaleTranslations['xh-designer-settings'] = {
  title: 'Settings',
  sections: 'Settings sections',
  locked: 'Managed by the host application',
  general: 'General',
  theme: 'Theme',
  themeHint: 'Applies to this designer only, not the rest of the page.',
  themeFollow: 'Follow page',
  themeSystem: 'Follow system',
  themeLight: 'Light',
  themeDark: 'Dark',
  brand: 'Accent color',
  brandHint: 'The color of buttons, selection and highlights in this designer.',
  toolbarDisplay: 'Toolbar buttons',
  toolbarDisplayHint: 'How the buttons on the toolbar are shown.',
  toolbarDisplayIcon: 'Icons',
  toolbarDisplayText: 'Text',
  toolbarDisplayBoth: 'Icons and text',
  statusBar: 'Status bar',
  statusBarHint: 'Show the status bar at the bottom of the designer.',
  language: 'Language',
  languageHint: 'Leave empty to follow the page.',
}

export const DESIGNER_COMMANDS_EN_US: DesignerShellLocaleTranslations['xh-designer-commands'] = {
  toolbar: 'Designer actions',
  undo: 'Undo',
  redo: 'Redo',
  cut: 'Cut',
  copy: 'Copy',
  paste: 'Paste',
  duplicate: 'Duplicate',
  delete: 'Delete',
  selectAll: 'Select all',
  alignLeft: 'Align left',
  alignCenter: 'Align centers horizontally',
  alignRight: 'Align right',
  alignTop: 'Align top',
  alignMiddle: 'Align centers vertically',
  alignBottom: 'Align bottom',
  distributeHorizontal: 'Distribute horizontally',
  distributeVertical: 'Distribute vertically',
  bringToFront: 'Bring to front',
  bringForward: 'Bring forward',
  sendBackward: 'Send backward',
  sendToBack: 'Send to back',
  zoomIn: 'Zoom in',
  zoomOut: 'Zoom out',
  zoomToFit: 'Zoom to fit',
  zoomToActual: 'Actual size',
  design: 'Design',
  preview: 'Preview',
  panels: 'Panels',
  settings: 'Settings',
  help: 'Help',
}

const translations: DesignerShellLocaleTranslations = {
  'xh-designer-properties': DESIGNER_PROPERTIES_EN_US,
  'xh-designer-issues': DESIGNER_ISSUES_EN_US,
  'xh-designer-palette': DESIGNER_PALETTE_EN_US,
  'xh-designer-outline': DESIGNER_OUTLINE_EN_US,
  'xh-designer-ruler': DESIGNER_RULER_EN_US,
  'xh-designer-frame': DESIGNER_FRAME_EN_US,
  'xh-designer-commands': DESIGNER_COMMANDS_EN_US,
  'xh-designer-settings': DESIGNER_SETTINGS_EN_US,
  'xh-designer-transform': {
    measure: 'Size',
    width: 'Width',
    height: 'Height',
    measureText: (width, height, unit) => (unit === '' ? `${width} × ${height}` : `${width} × ${height} ${unit}`),
  },
}

/** 英文。 */
export const designerShellEnUS: XhConfig = { translations }
