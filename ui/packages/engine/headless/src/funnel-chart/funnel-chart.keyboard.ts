/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 funnel chart 相关实现。

import type { KeyboardTable } from '../spec/types'

// 绘图区只占一个 Tab 位，进去以后方向键沿阶段的先后走。右键总是下一阶段；上下键按画面：
// 漏斗往下排时下键是下一阶段，金字塔（direction="up"）往上排时上键是下一阶段。绘图区不随 RTL 镜像。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/'

export const funnelChartKeyboard: KeyboardTable = {
  component: 'funnel-chart',
  source: APG,
  rows: [
    { id: 'funnel-chart.kbd.tab', keys: ['Tab', 'Shift+Tab'], when: '总是', does: '绘图区只占一个 Tab 位：焦点落到锚点阶段，首次为第一阶段' },
    { id: 'funnel-chart.kbd.next', keys: ['ArrowDown', 'ArrowRight'], when: '焦点在绘图区', does: '下一阶段；金字塔里由 ArrowUp 承担；已在最后一个则原地不动' },
    { id: 'funnel-chart.kbd.prev', keys: ['ArrowUp', 'ArrowLeft'], when: '焦点在绘图区', does: '上一阶段；金字塔里由 ArrowDown 承担' },
    { id: 'funnel-chart.kbd.first', keys: ['Home'], when: '焦点在绘图区', does: '第一阶段' },
    { id: 'funnel-chart.kbd.last', keys: ['End'], when: '焦点在绘图区', does: '最后一个阶段' },
    { id: 'funnel-chart.kbd.page', keys: ['PageUp', 'PageDown'], when: '焦点在绘图区', does: '跨 10% 的阶段，至少 1 个' },
    { id: 'funnel-chart.kbd.press', keys: ['Enter', 'Space'], when: '焦点在绘图区', does: '报告聚焦的阶段（onDatumPress）' },
    { id: 'funnel-chart.kbd.dismiss', keys: ['Escape'], when: '提示框显示着', does: '收起提示框，焦点留在原处；按键不拦截，外层浮层的关闭仍归它自己' },
  ],
}
