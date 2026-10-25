/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 3.x → 4.0。本版没有导出、属性、事件与部件的改名；删掉的 60 个组件覆盖槽由删除清单逐个报出。

import type { MigrationRules } from './types'

export const V4: MigrationRules = {
  major: 4,
  notes: [
    '缺省值：Accordion variant 改为 outline、Tree variant 改为 ghost、Badge tone 改为 danger，日历的 weekdayFormat 改为 narrow；要保持原样请显式传值',
    'Fieldset 的禁用会压到整棵子树；Web Components 的字段族宿主缺省 display: contents，写在宿主上的宽度与外边距改写到 root 或用 --xh-control-w',
    '令牌：控件高 sm / md / lg 为 28 / 32 / 36px，圆角 2 / 4 / 8px，--xh-motion-scale-press 为 1（主题写回 0.97 可恢复按下回弹）',
    '删掉的组件覆盖槽集中在字段聚焦环、Dialog、Slider 与日期时间面板，下面逐个报出写到它们的地方',
  ],
}
