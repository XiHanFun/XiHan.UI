/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 单选组排布方向的缺省值：机器量滑块与连接层投影共用同一个结算，不各写一份。

import type { Orientation } from '@xihan-ui/core'
import type { RadioGroupVariant } from './radio-group.types'

/**
 * 没传 orientation 时随形态取：list / card 是一列行或卡，缺省竖排；
 * segmented 是一条轨道里首尾相接的一排段，缺省横排。显式给了就以它为准。
 */
export function resolveRadioGroupOrientation(orientation: Orientation | undefined, variant: RadioGroupVariant | undefined): Orientation {
  return orientation ?? (variant === 'segmented' ? 'horizontal' : 'vertical')
}
