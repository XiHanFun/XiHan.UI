import type { ComponentMeta } from '../spec/types'

// root 缺省则尺寸档与整组状态无处安放；display 缺省则计时语义与读屏名字都没了着落。
// item / separator / control 都可以一段不写——作者自己排版，或做一个没有按钮、只管走的计时。
export const timerMeta: ComponentMeta = {
  component: 'timer',
  requiredParts: ['root', 'display'],
}
