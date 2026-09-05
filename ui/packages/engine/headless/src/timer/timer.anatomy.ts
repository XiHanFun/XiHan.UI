import { createAnatomy } from '@xihan-ui/kernel'

// root 是外壳，承载尺寸档与整组状态；display 收口计时语义与读屏名字；
// item 是一段数字，separator 是段与段之间的记号，control 是起停按钮。
export const timerAnatomy = createAnatomy('timer', ['root', 'display', 'item', 'separator', 'control'])
