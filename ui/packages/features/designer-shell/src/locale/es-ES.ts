/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 设计器零件的西班牙语文案。

import type { XhConfig } from '@xihan-ui/web-components'
import type { DesignerShellLocaleTranslations } from './types'

const translations: DesignerShellLocaleTranslations = {
  'xh-designer-properties': {
    title: 'Propiedades',
    empty: 'No hay propiedades que editar',
    mixed: 'Varios valores',
    invalidJson: 'No es un JSON válido',
    notInteger: 'Debe ser un número entero',
    belowMinimum: min => `Debe ser como mínimo ${min}`,
    aboveMaximum: max => `No puede ser mayor que ${max}`,
    notAboveMinimum: min => `Debe ser mayor que ${min}`,
    invalidDataField: 'No es una ruta de campo válida',
    sidesLinked: 'Igual en los cuatro lados',
    sides: { all: 'Cuatro lados', top: 'Arriba', right: 'Derecha', bottom: 'Abajo', left: 'Izquierda' },
    sidesIncomplete: 'Rellena los cuatro lados',
    customColor: 'Color personalizado',
  },
  'xh-designer-issues': {
    title: 'Problemas',
    empty: 'No hay problemas',
    errors: count => `${count} ${count === 1 ? 'error' : 'errores'}`,
    warnings: count => `${count} ${count === 1 ? 'advertencia' : 'advertencias'}`,
    severityError: 'Error',
    severityWarning: 'Advertencia',
    filter: 'Mostrar problemas por gravedad',
    noTarget: 'General',
  },
  'xh-designer-palette': {
    title: 'Elementos',
    search: 'Buscar elementos',
    noMatches: 'No hay elementos que coincidan',
    empty: 'No hay elementos',
  },
  'xh-designer-ruler': {
    horizontalGuide: value => `Guía horizontal en ${value}`,
    verticalGuide: value => `Guía vertical en ${value}`,
  },
  'xh-designer-frame': {
    layout: 'Disposición del diseñador',
    resize: label => `Cambiar el tamaño de ${label}`,
    closePanel: label => `Cerrar ${label}`,
    panelHelp: label => `Acerca de ${label}`,
  },
}

/** 西班牙语。 */
export const designerShellEsES: XhConfig = { translations }
