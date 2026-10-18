/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 设计器零件的法语文案。

import type { XhConfig } from '@xihan-ui/web-components'
import type { DesignerShellLocaleTranslations } from './types'

const translations: DesignerShellLocaleTranslations = {
  'xh-designer-properties': {
    title: 'Propriétés',
    empty: 'Aucune propriété à modifier',
    mixed: 'Plusieurs valeurs',
    invalidJson: 'JSON non valide',
    notInteger: 'Doit être un nombre entier',
    belowMinimum: min => `Doit être supérieur ou égal à ${min}`,
    aboveMaximum: max => `Doit être inférieur ou égal à ${max}`,
    notAboveMinimum: min => `Doit être supérieur à ${min}`,
    invalidDataField: 'Chemin de champ non valide',
    sidesLinked: 'Identique sur les quatre côtés',
    sides: { all: 'Quatre côtés', top: 'Haut', right: 'Droite', bottom: 'Bas', left: 'Gauche' },
    sidesIncomplete: 'Renseignez les quatre côtés',
  },
  'xh-designer-issues': {
    title: 'Problèmes',
    empty: 'Aucun problème',
    errors: count => `${count} ${count < 2 ? 'erreur' : 'erreurs'}`,
    warnings: count => `${count} ${count < 2 ? 'avertissement' : 'avertissements'}`,
    severityError: 'Erreur',
    severityWarning: 'Avertissement',
    filter: 'Afficher les problèmes par gravité',
    noTarget: 'Général',
  },
  'xh-designer-palette': {
    title: 'Éléments',
    search: 'Rechercher des éléments',
    noMatches: 'Aucun élément correspondant',
    empty: 'Aucun élément',
  },
  'xh-designer-ruler': {
    horizontalGuide: value => `Repère horizontal à ${value}`,
    verticalGuide: value => `Repère vertical à ${value}`,
  },
  'xh-designer-frame': {
    layout: 'Disposition du concepteur',
    resize: label => `Redimensionner ${label}`,
  },
}

/** 法语。 */
export const designerShellFrFR: XhConfig = { translations }
