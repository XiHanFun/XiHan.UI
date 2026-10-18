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
    customColor: 'Couleur personnalisée',
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
    closePanel: label => `Fermer ${label}`,
    panelHelp: label => `À propos de ${label}`,
  },
  'xh-designer-settings': {
    title: 'Paramètres',
    sections: 'Sections des paramètres',
    locked: 'Géré par l’application hôte',
    general: 'Général',
    theme: 'Thème',
    themeHint: 'S’applique uniquement à ce concepteur, pas au reste de la page.',
    themeFollow: 'Suivre la page',
    themeSystem: 'Suivre le système',
    themeLight: 'Clair',
    themeDark: 'Sombre',
    brand: 'Couleur d’accent',
    brandHint: 'La couleur des boutons, de la sélection et des mises en évidence de ce concepteur.',
    toolbarDisplay: 'Boutons de la barre d’outils',
    toolbarDisplayHint: 'Comment les boutons de la barre d’outils sont affichés.',
    toolbarDisplayIcon: 'Icônes',
    toolbarDisplayText: 'Texte',
    toolbarDisplayBoth: 'Icônes et texte',
    statusBar: 'Barre d’état',
    statusBarHint: 'Afficher la barre d’état en bas du concepteur.',
    language: 'Langue',
    languageHint: 'Laisser vide pour suivre la page.',
  },
  'xh-designer-commands': {
    toolbar: 'Actions du concepteur',
    undo: 'Annuler',
    redo: 'Rétablir',
    cut: 'Couper',
    copy: 'Copier',
    paste: 'Coller',
    duplicate: 'Dupliquer',
    delete: 'Supprimer',
    selectAll: 'Tout sélectionner',
    alignLeft: 'Aligner à gauche',
    alignCenter: 'Centrer horizontalement',
    alignRight: 'Aligner à droite',
    alignTop: 'Aligner en haut',
    alignMiddle: 'Centrer verticalement',
    alignBottom: 'Aligner en bas',
    distributeHorizontal: 'Répartir horizontalement',
    distributeVertical: 'Répartir verticalement',
    bringToFront: 'Mettre au premier plan',
    bringForward: 'Avancer',
    sendBackward: 'Reculer',
    sendToBack: 'Mettre à l’arrière-plan',
    zoomIn: 'Zoom avant',
    zoomOut: 'Zoom arrière',
    zoomToFit: 'Ajuster à la fenêtre',
    zoomToActual: 'Taille réelle',
    design: 'Conception',
    preview: 'Aperçu',
    panels: 'Panneaux',
    settings: 'Paramètres',
    help: 'Aide',
  },
}

/** 法语。 */
export const designerShellFrFR: XhConfig = { translations }
