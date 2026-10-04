/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 法语语言包。

import type { ChartDatumDetails } from '../shared/chart'
import type { KeyTextTable } from './key-text'
import type { XhLocale, XhLocaleTranslations } from './types'
import { keyText } from './key-text'

/** 读屏念的键名：修饰键在 Mac 与其余平台上叫法不同。 */
const KEY_NAME: KeyTextTable = {
  'Alt': { mac: 'Option', other: 'Alt' },
  'Control': { mac: 'Contrôle', other: 'Ctrl' },
  'Meta': { mac: 'Commande', other: 'Windows' },
  'Shift': 'Maj',
  ' ': 'Espace',
  'ArrowDown': 'Flèche bas',
  'ArrowLeft': 'Flèche gauche',
  'ArrowRight': 'Flèche droite',
  'ArrowUp': 'Flèche haut',
  'Backspace': 'Retour arrière',
  'Delete': 'Suppr',
  'Enter': 'Entrée',
  'Escape': 'Échap',
  'Tab': 'Tab',
}

/** 键帽上写的字：Mac 用系统符号。 */
const KEY_LABEL: KeyTextTable = {
  'Alt': { mac: '⌥', other: 'Alt' },
  'Control': { mac: '⌃', other: 'Ctrl' },
  'Meta': { mac: '⌘', other: 'Win' },
  'Shift': { mac: '⇧', other: 'Maj' },
  ' ': 'Espace',
  'ArrowDown': '↓',
  'ArrowLeft': '←',
  'ArrowRight': '→',
  'ArrowUp': '↑',
  'Backspace': { mac: '⌫', other: 'Retour' },
  'Delete': { mac: '⌦', other: 'Suppr' },
  'Enter': { mac: '⏎', other: 'Entrée' },
  'Escape': { mac: '⎋', other: 'Échap' },
  'Tab': { mac: '⇥', other: 'Tab' },
}

const EDGE = {
  n: 'bord supérieur',
  s: 'bord inférieur',
  e: 'bord droit',
  w: 'bord gauche',
  ne: 'coin supérieur droit',
  nw: 'coin supérieur gauche',
  se: 'coin inférieur droit',
  sw: 'coin inférieur gauche',
} as const

const COLOR_CHANNEL = {
  hue: 'Teinte',
  saturation: 'Saturation',
  brightness: 'Luminosité',
  alpha: 'Opacité',
  red: 'Rouge',
  green: 'Vert',
  blue: 'Bleu',
} as const

const COLOR_UNIT = { hue: '°', saturation: ' %', brightness: ' %', alpha: ' %', red: '', green: '', blue: '' } as const

const tagged = {
  deleteItem: (label: string) => `Supprimer ${label}`,
  overflowTag: (count: number) => `+${count}`,
}

const segments = { hour: 'heure', minute: 'minute', second: 'seconde', dayPeriod: 'matin/après-midi' }

const calendar = { todayDate: (date: string) => `Aujourd’hui, ${date}` }

const rangeCalendar = {
  ...calendar,
  startRangeSelectionPrompt: 'Cliquez pour commencer à sélectionner une plage de dates',
  finishRangeSelectionPrompt: 'Cliquez pour terminer la sélection de la plage de dates',
  selectedRange: (start: string, end: string) => `Plage sélectionnée : du ${start} au ${end}`,
}

const drag = {
  moved: (name: string, position: number, total: number) => `${name} est maintenant en position ${position} sur ${total}.`,
  dropped: (name: string, position: number) => `Dépôt terminé : ${name} en position ${position}.`,
  canceled: (name: string, position: number) => `Déplacement annulé. ${name} revient en position ${position}.`,
  rejected: (name: string) => `Impossible de déposer ${name} ici.`,
  movedInto: (name: string, into: string, position: number, total: number) => `${name} est maintenant dans ${into}, en position ${position} sur ${total}.`,
  droppedInto: (name: string, into: string, position: number) => `Dépôt terminé : ${name} dans ${into}, en position ${position}.`,
  canceledInto: (name: string, into: string, position: number) => `Déplacement annulé. ${name} revient dans ${into}, en position ${position}.`,
  rootLevel: 'le niveau racine',
}

const chart = {
  chartRoleDescription: 'graphique',
  seriesRoleDescription: 'série',
  legendLabel: 'Légende',
  missingValue: 'Aucune valeur',
  emptyText: 'Aucune donnée',
  loadingText: 'Chargement…',
  otherLabel: 'Autres',
  tableCaption: 'Tableau de données',
  datumLabel: (details: ChartDatumDetails) =>
    `${details.formatted.key ?? String(details.key)}, ${details.seriesName} ${details.formatted.value ?? ''}`,
}

const NO_DATA = 'Aucune donnée.'

const translations = {
  'alert': { close: 'Fermer' },
  'anchor': { root: 'Navigation par ancres' },
  'approval': {
    scopes: 'Autorisations',
    note: 'Remarque',
    reason: 'Motif du refus',
    pending: 'En attente de votre décision',
    approved: 'Approuvé',
    denied: 'Refusé',
    expired: 'Expiré, considéré comme refusé',
  },
  'back-top': { trigger: 'Retour en haut' },
  'breadcrumb': { root: 'Fil d’Ariane', ellipsis: 'Afficher le chemin complet' },
  'calendar-picker': calendar,
  'calendar-range-picker': rangeCalendar,
  'carousel': {
    root: 'Carrousel',
    rootRoleDescription: 'carrousel',
    itemRoleDescription: 'diapositive',
    prevTrigger: 'Diapositive précédente',
    nextTrigger: 'Diapositive suivante',
    autoplayTriggerPlay: 'Démarrer le défilement automatique',
    autoplayTriggerPause: 'Arrêter le défilement automatique',
    indicatorGroup: 'Choisir la diapositive à afficher',
    indicator: page => `Aller à la diapositive ${page}`,
    item: (index, count) => `${index} sur ${count}`,
  },
  'cartesian-chart': {
    ...chart,
    keyLabel: 'Catégorie',
    seriesLabel: 'Série',
    valueLabel: 'Valeur',
    sizeLabel: 'Taille',
    colorLabel: 'Couleur',
    referenceLabel: 'Référence',
    averageLabel: 'Moyenne',
    ohlcLabel: ({ open, high, low, close }) => `Ouverture ${open}, plus haut ${high}, plus bas ${low}, clôture ${close}`,
    ohlcColumns: { open: 'Ouverture', high: 'Plus haut', low: 'Plus bas', close: 'Clôture' },
    boxLabel: ({ min, q1, median, q3, max }) => `Minimum ${min}, Q1 ${q1}, médiane ${median}, Q3 ${q3}, maximum ${max}`,
    boxColumns: { min: 'Minimum', q1: 'Q1', median: 'Médiane', q3: 'Q3', max: 'Maximum', outliers: 'Valeurs aberrantes' },
    zoomLabel: 'Zoom',
    zoomStartLabel: 'Début de la fenêtre',
    zoomEndLabel: 'Fin de la fenêtre',
    aggregatedCaption: ({ caption, rows, ranges }) => `${caption} (${rows} lignes regroupées en ${ranges} plages)`,
    annotationSummary: items => items.map(item => `${item.label}${item.series ? ` (${item.series})` : ''} : ${item.value}.`).join(' '),
    summary: (model) => {
      if (!model.range || model.series.every(s => s.count === 0))
        return NO_DATA
      const { first, last, count } = model.range
      const head = `${model.seriesCount} ${model.seriesCount < 2 ? 'série' : 'séries'}, ${count} ${count < 2 ? 'point' : 'points'} entre ${first} et ${last}.`
      const lines = model.series.flatMap((s) => {
        if (!s.min || !s.max)
          return []
        if (s.min.key === s.max.key && s.min.value === s.max.value)
          return `${s.name} : ${s.max.value} (${s.max.key}).`
        return `${s.name} : minimum ${s.min.value} (${s.min.key}), maximum ${s.max.value} (${s.max.key}).`
      })
      return [head, ...lines].join(' ')
    },
  },
  'cascader': {
    ...tagged,
    empty: 'Aucune donnée',
    noMatch: 'Aucun résultat',
    loading: 'Chargement',
    branchError: 'Impossible de charger les sous-éléments',
    retry: 'Réessayer',
    column: 'Options',
    searchInput: 'Rechercher',
    searchList: 'Résultats de la recherche',
    clearTrigger: 'Effacer',
  },
  'citation': {
    sources: 'Sources',
    preview: 'Aperçu de la source',
    closePreview: 'Fermer l’aperçu de la source',
    openSource: title => `Ouvrir ${title}`,
    citation: (index, title) => `Source ${index} : ${title}`,
    citations: indexes => `Sources ${indexes.join(', ')}`,
    previousSource: 'Source précédente',
    nextSource: 'Source suivante',
    source: (index, title) => `Source ${index} : ${title}`,
    document: 'Document',
    previewLinkSource: 'Ouvrir la source',
    previewLinkDocument: 'Ouvrir le document',
  },
  'clipboard': { copied: 'Copié' },
  'code-view': {
    code: 'Code',
    expand: 'Développer le code',
    collapse: 'Réduire le code',
    foldBlock: (first, last) => (first === last ? `Ligne ${first}` : `Lignes ${first}–${last}`),
  },
  'color-field': { clearTrigger: 'Effacer' },
  'color-picker': {
    ...tagged,
    area: 'Saturation et luminosité',
    areaValueText: (saturation, brightness) => `Saturation ${saturation} %, luminosité ${brightness} %`,
    channel: channel => COLOR_CHANNEL[channel],
    channelValueText: (channel, value) => `${value}${COLOR_UNIT[channel]}`,
    input: channel => ({ hex: 'Hexadécimal', r: 'Rouge', g: 'Vert', b: 'Bleu', a: 'Opacité' })[channel],
    swatch: value => `Couleur ${value}`,
    swatchGroup: 'Nuancier',
    recentSwatchGroup: 'Couleurs récentes',
    eyeDropperTrigger: 'Prélever une couleur à l’écran',
  },
  'color-slider': {
    label: channel => COLOR_CHANNEL[channel],
    valueText: (channel, value) => `${value}${COLOR_UNIT[channel]}`,
  },
  'color-swatch-picker': { group: 'Nuancier', swatch: value => `Couleur ${value}` },
  'combobox': { ...tagged, trigger: 'Afficher les suggestions', clearTrigger: 'Effacer' },
  'command': { title: 'Palette de commandes', input: 'Rechercher des commandes', list: 'Commandes' },
  'context-menu': { content: 'Menu contextuel' },
  'date-field': {
    ...segments,
    year: 'année',
    quarter: 'trimestre',
    month: 'mois',
    week: 'semaine de l’année',
    day: 'jour',
    clearTrigger: 'Effacer',
  },
  'date-picker': { ...tagged, ...segments, ...calendar, presets: 'Raccourcis', clearTrigger: 'Effacer' },
  'date-range-picker': {
    ...segments,
    ...rangeCalendar,
    startDate: 'Date de début',
    endDate: 'Date de fin',
    startTime: 'Heure de début',
    endTime: 'Heure de fin',
    presets: 'Raccourcis',
    clearTrigger: 'Effacer',
  },
  'dialog': {
    close: 'Fermer',
    dragTrigger: 'Déplacer la boîte de dialogue',
    ok: 'OK',
    cancel: 'Annuler',
    actionError: 'L’action a échoué. Veuillez réessayer.',
  },
  'diff-view': {
    added: 'Ajouté',
    removed: 'Supprimé',
    unchanged: 'Inchangé',
    expandGap: count => `Afficher ${count} ${count < 2 ? 'ligne masquée' : 'lignes masquées'}`,
    diff: 'Différences',
    noChanges: 'Aucune modification',
    truncated: count => (count < 2
      ? `${count} ligne supplémentaire tronquée, non affichée`
      : `${count} lignes supplémentaires tronquées, non affichées`),
    commentOn: (line, side) => `Commenter la ligne ${line} de ${side === 'old' ? 'l’ancienne' : 'la nouvelle'} version`,
  },
  'drawer': { close: 'Fermer', resizeTrigger: 'Redimensionner le panneau' },
  'field-array': {
    deleteItem: (index, count) => `Supprimer la ligne ${index} sur ${count}`,
    moveUpTrigger: (index, count) => `Monter la ligne ${index} sur ${count}`,
    moveDownTrigger: (index, count) => `Descendre la ligne ${index} sur ${count}`,
  },
  'file-upload': {
    dropzone: 'Déposez des fichiers ici',
    deleteItem: file => `Supprimer ${file.name}`,
    clearTrigger: 'Retirer tous les fichiers',
  },
  'float-button': { trigger: 'Actions' },
  'floating-panel': {
    dragTrigger: 'Déplacer le panneau',
    resizeTrigger: edge => `Redimensionner depuis le ${EDGE[edge]}`,
    resizeValueText: size => `Largeur ${Math.round(size.width)}, hauteur ${Math.round(size.height)}`,
    windowStateTrigger: state => ({ default: 'Restaurer le panneau', maximized: 'Agrandir le panneau', minimized: 'Réduire le panneau' })[state],
    close: 'Fermer',
  },
  'form': {
    required: '{name} est obligatoire',
    type: {
      string: '{name} doit être une chaîne de caractères',
      number: '{name} doit être un nombre',
      integer: '{name} doit être un nombre entier',
      email: '{name} n’est pas une adresse e-mail valide',
      url: '{name} n’est pas une URL valide',
      array: '{name} doit être une liste',
    },
    minLength: '{name} doit contenir au moins {min} caractères',
    maxLength: '{name} ne peut pas dépasser {max} caractères',
    minNumber: '{name} doit être supérieur ou égal à {min}',
    maxNumber: '{name} doit être inférieur ou égal à {max}',
    pattern: '{name} ne respecte pas le format requis',
  },
  'funnel-chart': {
    ...chart,
    datumLabel: (details) => {
      const head = `${details.seriesName}, ${details.formatted.value ?? ''}`
      return details.formatted.previous ? `${head}, ${details.formatted.previous} de l’étape précédente` : head
    },
    nameLabel: 'Étape',
    valueLabel: 'Valeur',
    previousLabel: 'Depuis l’étape précédente',
    firstLabel: 'Depuis la première étape',
    summary: (model) => {
      if (model.stageCount === 0 || !model.first || !model.last)
        return NO_DATA
      if (model.stageCount === 1)
        return `1 étape : ${model.first.name} ${model.first.value}.`
      const parts = [`${model.stageCount} étapes, depuis ${model.first.name} (${model.first.value}) jusqu’à ${model.last.name} (${model.last.value}).`]
      if (model.overall)
        parts.push(`Conversion globale : ${model.overall}.`)
      if (model.steepest)
        parts.push(`Plus forte baisse entre ${model.steepest.from} et ${model.steepest.to}, ${model.steepest.rate} conservés.`)
      return parts.join(' ')
    },
  },
  'graph-chart': {
    ...chart,
    datumLabel: (details) => {
      const parts = [details.seriesName]
      if (details.formatted.value)
        parts.push(details.formatted.value)
      parts.push(`${details.formatted.links ?? '0'} ${Number(details.values.links ?? 0) < 2 ? 'lien' : 'liens'}`)
      return parts.join(', ')
    },
    sourceLabel: 'Source',
    targetLabel: 'Cible',
    valueLabel: 'Valeur',
    linkLabel: 'Libellé',
    linksLabel: 'Liens',
    incomingLabel: 'Entrants',
    outgoingLabel: 'Sortants',
    summary: (model) => {
      if (model.nodeCount === 0)
        return NO_DATA
      const head = `${model.nodeCount} ${model.nodeCount < 2 ? 'nœud' : 'nœuds'}, ${model.linkCount} ${model.linkCount < 2 ? 'lien' : 'liens'}.`
      return model.hub ? `${head} Le plus connecté : ${model.hub.name} (${model.hub.degree} ${model.hub.degree < 2 ? 'lien' : 'liens'}).` : head
    },
  },
  'grid-list': { root: 'Éléments' },
  'heatmap': {
    gridLabel: 'Carte de chaleur de l’activité',
    cellLabel: details => `${details.date} : ${details.count}`,
    matrixCellLabel: details => `${details.row} ${details.column} : ${details.count}`,
    legendLabel: 'Niveau d’activité',
    legendLow: 'Moins',
    legendHigh: 'Plus',
  },
  'hierarchy-chart': {
    ...chart,
    chartRoleDescription: 'graphique en arbre',
    datumLabel: (details) => {
      const head = `${details.seriesName}, ${details.formatted.value ?? ''}`
      return details.formatted.parentShare ? `${head}, ${details.formatted.parentShare} dans ${details.formatted.parent ?? ''}` : head
    },
    rootLabel: 'Tout',
    pathLabel: 'Chemin',
    nameLabel: 'Chemin',
    valueLabel: 'Valeur',
    levelLabel: level => `Niveau ${level}`,
    parentShareLabel: 'Part du parent',
    rootShareLabel: 'Part du total',
    summary: (model) => {
      if (model.childCount === 0)
        return NO_DATA
      const head = `${model.root} : ${model.childCount} ${model.childCount < 2 ? 'élément' : 'éléments'}, total ${model.total}.`
      return model.largest ? `${head} Le plus grand : ${model.largest.name} ${model.largest.value} (${model.largest.share}).` : head
    },
  },
  'image-cropper': {
    cropArea: 'Zone de recadrage',
    valueText: rect => `X ${rect.x}, Y ${rect.y}, largeur ${rect.width}, hauteur ${rect.height}`,
    handleTopLeft: 'Poignée du coin supérieur gauche',
    handleTop: 'Poignée du bord supérieur',
    handleTopRight: 'Poignée du coin supérieur droit',
    handleRight: 'Poignée du bord droit',
    handleBottomRight: 'Poignée du coin inférieur droit',
    handleBottom: 'Poignée du bord inférieur',
    handleBottomLeft: 'Poignée du coin inférieur gauche',
    handleLeft: 'Poignée du bord gauche',
    zoomSlider: 'Zoom',
    rotateSlider: 'Rotation',
    flipHorizontal: 'Retourner horizontalement',
    flipVertical: 'Retourner verticalement',
  },
  'image-viewer': {
    content: 'Aperçu de l’image',
    toolbar: 'Outils d’image',
    close: 'Fermer',
    zoomIn: 'Zoom avant',
    zoomOut: 'Zoom arrière',
    rotateLeft: 'Faire pivoter à gauche',
    rotateRight: 'Faire pivoter à droite',
    flipHorizontal: 'Retourner horizontalement',
    flipVertical: 'Retourner verticalement',
    reset: 'Réinitialiser',
    prev: 'Image précédente',
    next: 'Image suivante',
    counter: (index, count) => `${index} / ${count}`,
  },
  'json-viewer': {
    text: 'Source JSON',
    tree: 'JSON',
    root: 'racine',
    objectPreview: count => `{…} ${count}`,
    arrayPreview: count => `[…] ${count}`,
    collapsedBranchLabel: (name, count) => `${name}, ${count} ${count < 2 ? 'élément' : 'éléments'}`,
    moreItems: count => `… ${count} de plus`,
    empty: 'Aucune donnée',
  },
  'kbd': {
    keyName: (key, platform) => keyText(KEY_NAME, key, platform),
    keyLabel: (key, platform) => keyText(KEY_LABEL, key, platform),
    hotkey: names => names.join(' + '),
  },
  'loading-bar': { root: 'Chargement' },
  'log': { log: 'Journal', scrollToBottom: 'Faire défiler jusqu’en bas' },
  'markdown-stream': { completed: 'Réponse terminée' },
  'marquee': { autoplayTriggerPause: 'Suspendre le défilement', autoplayTriggerPlay: 'Reprendre le défilement' },
  'mention': { content: 'Mentions', empty: 'Aucun résultat' },
  'menubar': { root: 'Barre de menus' },
  'message-feed': {
    feed: 'Conversation',
    scrollToBottom: 'Faire défiler jusqu’en bas',
    scrollToBottomUnread: count => `Faire défiler jusqu’en bas, ${count} ${count < 2 ? 'nouveau message' : 'nouveaux messages'}`,
    item: (position, size, role) => {
      const who = role == null ? '' : `, ${({ user: 'utilisateur', assistant: 'assistant', system: 'système' })[role]}`
      return size > 0 ? `Message ${position} sur ${size}${who}` : `Message ${position}${who}`
    },
  },
  'navigation-menu': { root: 'Navigation principale' },
  'notification': { region: 'Notifications', close: 'Fermer' },
  'pagination': {
    root: 'Pagination',
    firstTrigger: 'Première page',
    prevTrigger: 'Page précédente',
    nextTrigger: 'Page suivante',
    lastTrigger: 'Dernière page',
    item: page => `Page ${page}`,
    ellipsis: count => `${count} ${count < 2 ? 'autre page' : 'autres pages'}`,
    pageSizeSelect: 'Éléments par page',
    pageSizeOption: size => `${size} / page`,
    summary: (start, end, count) => `${start}-${end} sur ${count}`,
    jumper: 'Aller à la page',
  },
  'password-input': {
    visibilityTriggerShow: 'Afficher le mot de passe',
    visibilityTriggerHide: 'Masquer le mot de passe',
    capsLockOn: 'Verrouillage des majuscules activé',
    strengthMeter: 'Robustesse du mot de passe',
  },
  'pie-chart': {
    ...chart,
    datumLabel: details => `${details.seriesName}, ${details.formatted.value ?? ''}, ${details.formatted.share ?? ''}`,
    centerLabel: 'Total',
    nameLabel: 'Nom',
    valueLabel: 'Valeur',
    shareLabel: 'Part',
    summary: (model) => {
      const first = model.slices[0]
      const last = model.slices.at(-1)
      if (model.sliceCount === 0 || !first || !last)
        return NO_DATA
      const head = `${model.sliceCount} ${model.sliceCount < 2 ? 'secteur' : 'secteurs'}, total ${model.total}.`
      if (model.sliceCount === 1)
        return `${head} ${first.name} : ${first.share}.`
      return `${head} Le plus grand : ${first.name} ${first.share}. Le plus petit : ${last.name} ${last.share}.`
    },
  },
  'pin-input': { input: (index, length) => `Caractère ${index} sur ${length}` },
  'popover': { close: 'Fermer' },
  'progress': { segmentValueText: ({ value, label }) => `${value}, ${label}` },
  'prompt-input': { send: 'Envoyer', stop: 'Arrêter la génération' },
  'question-flow': {
    prompt: 'Question',
    options: 'Options',
    note: 'Autre réponse',
    prev: 'Question précédente',
    next: 'Question suivante',
    progress: (current, total) => `Question ${current} sur ${total}`,
    submitted: 'Réponses envoyées',
    selectionRange: (min, max) => {
      if (max === undefined)
        return `Choisissez au moins ${min} ${min < 2 ? 'option' : 'options'}`
      if (min === max)
        return `Choisissez ${min} ${min < 2 ? 'option' : 'options'}`
      return min > 1 ? `Choisissez entre ${min} et ${max} options` : `Choisissez jusqu’à ${max} ${max < 2 ? 'option' : 'options'}`
    },
  },
  'radar-chart': {
    ...chart,
    nameLabel: 'Nom',
    summary: (model) => {
      if (model.seriesCount === 0)
        return NO_DATA
      const head = `${model.seriesCount} ${model.seriesCount < 2 ? 'série' : 'séries'} sur ${model.indicatorCount} ${model.indicatorCount < 2 ? 'indicateur' : 'indicateurs'}.`
      const parts = model.series.map((s) => {
        if (!s.highest)
          return `${s.name} : aucune valeur.`
        return s.lowest
          ? `${s.name} : plus élevé ${s.highest.indicator} ${s.highest.value}, plus bas ${s.lowest.indicator} ${s.lowest.value}.`
          : `${s.name} : ${s.highest.indicator} ${s.highest.value}.`
      })
      return [head, ...parts].join(' ')
    },
  },
  'reasoning': {
    label: 'Processus de réflexion',
    thinking: 'Réflexion…',
    thinkingFor: 'Réflexion depuis {seconds} s',
    thoughtFor: 'A réfléchi pendant {seconds} s',
  },
  'resizable': { root: 'Zone redimensionnable', handle: edge => `Redimensionner depuis le ${EDGE[edge]}` },
  'sankey-chart': {
    ...chart,
    datumLabel: details => `${details.seriesName}, ${details.formatted.value ?? ''}`,
    sourceLabel: 'Source',
    targetLabel: 'Cible',
    valueLabel: 'Valeur',
    inflowLabel: 'Depuis',
    outflowLabel: 'Vers',
    summary: (model) => {
      if (model.linkCount === 0)
        return NO_DATA
      const head = `${model.nodeCount} ${model.nodeCount < 2 ? 'nœud' : 'nœuds'}, ${model.linkCount} flux, total ${model.total}.`
      return model.largest ? `${head} Flux le plus important : ${model.largest.source} vers ${model.largest.target}, ${model.largest.value}.` : head
    },
  },
  'scrollbar': { thumb: 'Barre de défilement' },
  'select': { ...tagged, clearTrigger: 'Effacer', content: 'Options' },
  'side-nav': { root: 'Barre latérale', input: 'Filtrer la navigation', noMatch: 'Aucun résultat' },
  'signature-pad': {
    label: 'Signature',
    clearTrigger: 'Effacer la signature',
    undoTrigger: 'Annuler le dernier trait',
    redoTrigger: 'Rétablir le trait',
    statusEmpty: 'Pas encore de signature',
    statusSigned: 'Signé',
  },
  'sortable': {
    root: 'Liste triable',
    itemDragTrigger: name => `Réorganiser ${name}`,
    itemDragTriggerRoleDescription: 'élément triable',
    picked: (name, position, total) => `Élément saisi : ${name}. Position ${position} sur ${total}. Utilisez les touches fléchées pour déplacer, Espace pour déposer, Échap pour annuler.`,
    moved: (_name, position, total) => `Nouvelle position : ${position} sur ${total}.`,
    dropped: (name, position) => `Dépôt terminé : ${name} en position ${position}.`,
    canceled: (name, position) => `Tri annulé. ${name} revient en position ${position}.`,
    movedToList: (listName, listPosition, listTotal, position, total) =>
      `Déplacement vers ${listName}, liste ${listPosition} sur ${listTotal}. Position ${position} sur ${total}.`,
    droppedInList: (name, listName, listPosition, position) => `Dépôt terminé : ${name} dans ${listName}, liste ${listPosition}, en position ${position}.`,
  },
  'sparkline': {
    summary: (model) => {
      if (model.count === 0)
        return NO_DATA
      if (model.variant === 'win-loss') {
        const parts = [`${model.wins} ${model.wins < 2 ? 'victoire' : 'victoires'}`, `${model.losses} ${model.losses < 2 ? 'défaite' : 'défaites'}`]
        if (model.ties > 0)
          parts.push(`${model.ties} ${model.ties < 2 ? 'égalité' : 'égalités'}`)
        return `${model.count} ${model.count < 2 ? 'résultat' : 'résultats'} : ${parts.join(', ')}.`
      }
      const reference = model.reference == null ? '' : ` Référence : ${model.reference}.`
      if (model.count === 1)
        return `1 point : ${model.last}.${reference}`
      const range = model.min === model.max ? `tous égaux à ${model.max}` : `compris entre ${model.min} et ${model.max}`
      const head = `${model.count} points, ${range}.${reference}`
      if (model.direction === 'flat')
        return `${head} Dernière valeur ${model.last}, identique à la première.`
      if (model.change == null)
        return `${head} Dernière valeur ${model.last}.`
      return `${head} Dernière valeur ${model.last}, en ${model.direction === 'up' ? 'hausse' : 'baisse'} de ${model.change} par rapport à la première.`
    },
  },
  'spinner': { label: 'Chargement' },
  'splitter': { root: 'Panneaux fractionnés', resizeTrigger: index => `Redimensionner le panneau ${index + 1}` },
  'steps': { progressLabel: 'Progression des étapes', progressValueText: percent => `${percent} % terminé` },
  'table': {
    ...drag,
    sort: column => `Trier par ${column}`,
    columnResize: column => `Redimensionner la colonne ${column}`,
    columnDrag: column => `Réorganiser la colonne ${column}`,
    columnDragRoleDescription: 'colonne déplaçable',
    selectAll: 'Sélectionner toutes les lignes',
    toolbar: 'Barre d’outils du tableau',
    columnList: 'Paramètres des colonnes',
    columnVisibility: column => `Afficher la colonne ${column}`,
  },
  'tabs': { ...drag, overflowTrigger: 'Plus d’onglets' },
  'tag': { close: 'Supprimer' },
  'tag-group': { deleteItem: label => `Supprimer ${label}`, list: 'Étiquettes' },
  'tags-input': { deleteItem: value => `Supprimer ${value}`, editTagInput: value => `Modifier ${value}`, clearTrigger: 'Effacer' },
  'text-field': { clearTrigger: 'Effacer' },
  'time-field': { ...segments, clearTrigger: 'Effacer' },
  'time-picker': { ...tagged, ...segments, presets: 'Raccourcis', clearTrigger: 'Effacer' },
  'time-range-picker': { ...segments, startTime: 'Heure de début', endTime: 'Heure de fin', presets: 'Raccourcis', clearTrigger: 'Effacer' },
  'timer': {
    time: ({ days, hours, minutes, seconds }) => {
      const words = [
        `${hours} ${hours < 2 ? 'heure' : 'heures'}`,
        `${minutes} ${minutes < 2 ? 'minute' : 'minutes'}`,
        `${seconds} ${seconds < 2 ? 'seconde' : 'secondes'}`,
      ]
      return days > 0 ? [`${days} ${days < 2 ? 'jour' : 'jours'}`, ...words].join(' ') : words.join(' ')
    },
    start: 'Démarrer',
    pause: 'Mettre en pause',
    resume: 'Reprendre',
    reset: 'Réinitialiser',
  },
  'tool-call': {
    inputStreaming: 'Préparation…',
    inputAvailable: 'Exécution…',
    awaitingApproval: 'En attente d’approbation',
    outputAvailable: 'Terminé',
    outputError: 'Échec',
  },
  'toolbar': { overflowTrigger: 'Plus' },
  'tour': { close: 'Fermer', progress: (step, count) => `Étape ${step} sur ${count}` },
  'transfer': { toTarget: 'Déplacer vers la liste cible', toSource: 'Déplacer vers la liste source' },
  'tree': drag,
  'tree-select': {
    ...tagged,
    tree: 'Options arborescentes',
    clearTrigger: 'Effacer',
    empty: 'Aucune donnée',
    loading: 'Chargement',
    branchError: 'Impossible de charger les sous-éléments',
    retry: 'Réessayer',
    branchEmpty: 'Aucun sous-élément',
    searchInput: 'Rechercher',
    noMatch: 'Aucun résultat',
  },
  'truncate': { expand: 'Afficher plus', collapse: 'Afficher moins' },
} satisfies XhLocaleTranslations

/** Français。 */
export const frFR: XhLocale = { locale: 'fr-FR', translations }
