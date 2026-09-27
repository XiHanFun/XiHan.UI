/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 cartesian chart 相关实现。

import type { KeyboardTable } from '../spec/types'

// 绘图区只占一个 Tab 位，进去以后方向键在数据之间走；图例是工具条，整体也只占一个 Tab 位。
// 以 vertical 为例，horizontal 时两对方向键互换职责。绘图区不随 RTL 镜像，左键始终向左；
// 图例随文字方向镜像，左右键跟随视觉次序。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/'

export const cartesianChartKeyboard: KeyboardTable = {
  component: 'cartesian-chart',
  source: APG,
  rows: [
    { id: 'cartesian-chart.kbd.tab', keys: ['Tab', 'Shift+Tab'], when: '总是', does: '绘图区只占一个 Tab 位：焦点落到锚点数据，首次为第一个可见系列的第一个数据；图例同样只占一个 Tab 位' },
    { id: 'cartesian-chart.kbd.next', keys: ['ArrowRight'], when: '焦点在绘图区', does: '沿自变量方向移到下一个键（跳过缺失值）；horizontal 时由 ArrowDown 承担；已在末尾则原地不动' },
    { id: 'cartesian-chart.kbd.prev', keys: ['ArrowLeft'], when: '焦点在绘图区', does: '沿自变量方向移到上一个键；horizontal 时由 ArrowUp 承担' },
    { id: 'cartesian-chart.kbd.series-next', keys: ['ArrowUp'], when: '焦点在绘图区', does: '在同一个键上换到视觉次序的下一个系列（堆叠自下而上、分组自左而右），跳过隐藏系列与缺失值；horizontal 时由 ArrowRight 承担' },
    { id: 'cartesian-chart.kbd.series-prev', keys: ['ArrowDown'], when: '焦点在绘图区', does: '在同一个键上换到上一个系列；horizontal 时由 ArrowLeft 承担' },
    { id: 'cartesian-chart.kbd.first', keys: ['Home'], when: '焦点在绘图区', does: '当前系列的第一个数据' },
    { id: 'cartesian-chart.kbd.last', keys: ['End'], when: '焦点在绘图区', does: '当前系列的最后一个数据' },
    { id: 'cartesian-chart.kbd.page', keys: ['PageUp', 'PageDown'], when: '焦点在绘图区', does: '跨 10% 的键，至少 1 个' },
    { id: 'cartesian-chart.kbd.press', keys: ['Enter', 'Space'], when: '焦点在绘图区', does: '报告聚焦的数据（onDatumPress）' },
    { id: 'cartesian-chart.kbd.zoom-in', keys: ['+', '='], when: '焦点在绘图区且开了 zoom', does: '以聚焦的数据为中心放大 1.5 倍；类目轴按整个类目缩放，每按一次至少少露一个类目，最少露出一个' },
    { id: 'cartesian-chart.kbd.zoom-out', keys: ['-', '_'], when: '焦点在绘图区且开了 zoom', does: '以聚焦的数据为中心缩小 1.5 倍，类目轴每按一次至少多露一个类目，到整条轴为止；焦点走出窗口时窗口平移过去' },
    { id: 'cartesian-chart.kbd.zoom-edge', keys: ['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', 'PageUp', 'PageDown', 'Home', 'End'], when: '焦点在缩放条的手柄', does: '左右键（下上键同）把这一端移一步：类目轴一个类目，连续轴 1%；按住 Shift 或 PageUp / PageDown 移 10%（至少一个类目），Home / End 把这一端移到能到的最远处；两端之间至少留一个类目或 1% 的轴' },
    { id: 'cartesian-chart.kbd.brush', keys: ['Shift+ArrowRight', 'Shift+ArrowLeft', 'Shift+Home', 'Shift+End', 'Shift+PageUp', 'Shift+PageDown'], when: '焦点在绘图区且 brush 为 x 或 xy', does: '从锚点起沿自变量刷到焦点所在的键，每按一次派发 onBrushSelectionChange；锚点是开始按 Shift 时焦点所在的键，松开 Shift 移动焦点后放下，范围留着；horizontal 时由 Shift+ArrowDown / Shift+ArrowUp 承担' },
    { id: 'cartesian-chart.kbd.dismiss', keys: ['Escape'], when: '提示框显示着或有刷选范围', does: '收起提示框、清掉刷选（派发 onBrushSelectionChange，范围为 null），焦点留在原处；按键不拦截，外层浮层的关闭仍归它自己' },
    { id: 'cartesian-chart.kbd.legend-move', keys: ['ArrowLeft', 'ArrowRight', 'Home', 'End'], when: '焦点在图例', does: '在图例项之间移动，左右键跟随文字方向的视觉次序' },
    { id: 'cartesian-chart.kbd.legend-toggle', keys: ['Enter', 'Space'], when: '焦点在图例项', does: '切换该系列的显隐（原生按钮行为）' },
  ],
}
