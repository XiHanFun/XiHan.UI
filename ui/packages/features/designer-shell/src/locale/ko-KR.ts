/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 设计器零件的韩语文案。

import type { XhConfig } from '@xihan-ui/web-components'
import type { DesignerShellLocaleTranslations } from './types'

const translations: DesignerShellLocaleTranslations = {
  'xh-designer-properties': {
    title: '속성',
    empty: '편집할 속성이 없습니다',
    mixed: '여러 값',
    invalidJson: '올바른 JSON이 아닙니다',
    notInteger: '정수여야 합니다',
    belowMinimum: min => `${min} 이상이어야 합니다`,
    aboveMaximum: max => `${max} 이하여야 합니다`,
    notAboveMinimum: min => `${min}보다 커야 합니다`,
    invalidDataField: '올바른 필드 경로가 아닙니다',
    sidesLinked: '네 변 모두 같음',
    sides: { all: '네 변', top: '위', right: '오른쪽', bottom: '아래', left: '왼쪽' },
    sidesIncomplete: '네 변을 모두 입력하세요',
    customColor: '사용자 지정 색',
  },
  'xh-designer-issues': {
    title: '문제',
    empty: '문제 없음',
    errors: count => `오류 ${count}개`,
    warnings: count => `경고 ${count}개`,
    severityError: '오류',
    severityWarning: '경고',
    filter: '심각도별 문제 표시',
    noTarget: '전체',
  },
  'xh-designer-palette': {
    title: '요소',
    search: '요소 검색',
    noMatches: '일치하는 요소 없음',
    empty: '요소 없음',
  },
  'xh-designer-ruler': {
    horizontalGuide: value => `가로 안내선 ${value}`,
    verticalGuide: value => `세로 안내선 ${value}`,
  },
  'xh-designer-frame': {
    layout: '디자이너 레이아웃',
    resize: label => `${label} 크기 조정`,
    closePanel: label => `${label} 닫기`,
    panelHelp: label => `${label} 도움말`,
  },
}

/** 韩语。 */
export const designerShellKoKR: XhConfig = { translations }
