/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 button group 类型契约。

import type { ActionVariant, PropTypes, Size, Tone } from '@xihan-ui/core'

export interface ButtonGroupProps {
  /** 排布：horizontal / vertical，决定相邻两段在哪个轴上合并边缘。 */
  orientation?: 'horizontal' | 'vertical'
  /** 变体：solid / subtle / outline / ghost，写入根上供皮肤填入组内按钮的颜色槽位。 */
  variant?: ActionVariant
  /** 颜色：brand / neutral / success / warning / danger / info，写入根上沿继承流下发给组内每一段。 */
  tone?: Tone
  /** 尺寸：sm / md / lg，写入根上供皮肤填入组内按钮的高度、内边距与字号槽位。 */
  size?: Size
  /** 整组禁用：适配器把它落到组内每一段的原生 disabled 上，段自身声明禁用的仍然禁用。 */
  disabled?: boolean
  /** 撑满行宽：整组占满可用宽度，每段等分剩余空间。 */
  fullWidth?: boolean
  /** 是否自动在相邻按钮之间插入分隔线，默认 true。 */
  separators?: boolean
}

export interface ButtonGroupApi<T extends PropTypes = PropTypes> {
  orientation: 'horizontal' | 'vertical'
  /** 整组是否禁用。适配器据此把禁用传给组内每一段：只写 data-* 是假禁用。 */
  disabled: boolean
  /** 适配器是否自动生成相邻按钮间的分隔线。 */
  separators: boolean
  getRootProps: () => T['element']
}

/** 读屏文案。本组件目前没有需要外露的文案，保留该位。 */
export interface ButtonGroupTranslations {}
