/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 设计器零件的德语文案。

import type { XhConfig } from '@xihan-ui/web-components'
import type { DesignerShellLocaleTranslations } from './types'

const translations: DesignerShellLocaleTranslations = {
  'xh-designer-properties': {
    title: 'Eigenschaften',
    empty: 'Keine bearbeitbaren Eigenschaften',
    mixed: 'Mehrere Werte',
    invalidJson: 'Kein gültiges JSON',
    notInteger: 'Muss eine ganze Zahl sein',
    belowMinimum: min => `Muss mindestens ${min} sein`,
    aboveMaximum: max => `Darf höchstens ${max} sein`,
    notAboveMinimum: min => `Muss größer als ${min} sein`,
    invalidDataField: 'Kein gültiger Feldpfad',
    sidesLinked: 'Alle Seiten gleich',
    sides: { all: 'Alle Seiten', top: 'Oben', right: 'Rechts', bottom: 'Unten', left: 'Links' },
    sidesIncomplete: 'Alle vier Seiten ausfüllen',
    customColor: 'Eigene Farbe',
  },
  'xh-designer-issues': {
    title: 'Probleme',
    empty: 'Keine Probleme',
    errors: count => `${count} Fehler`,
    warnings: count => `${count} ${count === 1 ? 'Warnung' : 'Warnungen'}`,
    severityError: 'Fehler',
    severityWarning: 'Warnung',
    filter: 'Probleme nach Schweregrad anzeigen',
    noTarget: 'Allgemein',
  },
  'xh-designer-palette': {
    title: 'Elemente',
    search: 'Elemente suchen',
    noMatches: 'Keine passenden Elemente',
    empty: 'Keine Elemente',
  },
  'xh-designer-ruler': {
    horizontalGuide: value => `Horizontale Hilfslinie bei ${value}`,
    verticalGuide: value => `Vertikale Hilfslinie bei ${value}`,
  },
  'xh-designer-frame': {
    layout: 'Designer-Layout',
    resize: label => `Größe von ${label} ändern`,
  },
}

/** 德语。 */
export const designerShellDeDE: XhConfig = { translations }
