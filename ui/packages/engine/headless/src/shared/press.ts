/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 按压通道的 Headless 侧：机器 context 存 pressed、事件 PRESS.START / PRESS.END，
// connect 把 Core 的按压跟踪器合成到可按部件的 getter 上，并投影 data-pressed。
// 皮肤写 :is(:active, [data-pressed])，指针、键盘与触屏看见同一副按压面。

import type { PressHandlers } from '@xihan-ui/core'
import { createPressTracker } from '@xihan-ui/core'

/** 按压事件：Space / Enter 或粗指针按住与松开。 */
export type PressEvent = { type: 'PRESS.START' } | { type: 'PRESS.END' }

/** 接了按压通道的机器在 connect 眼里的最小形状。 */
export interface PressService {
  context: { get: (key: 'pressed') => boolean }
  send: (event: PressEvent) => void
}

/** 合成到可按部件 getter 上的处理器：真源在机器 context，跟踪器只翻译事件。 */
export function pressHandlers(service: PressService): PressHandlers {
  return createPressTracker({
    isPressed: () => service.context.get('pressed'),
    onChange: pressed => service.send({ type: pressed ? 'PRESS.START' : 'PRESS.END' }),
  })
}
