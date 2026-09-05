import type { ComponentMeta } from '../spec/types'

// 粘底要读滚动容器与内容容器，两者必需；line 有几行摆几个，一行没有也是一份合法的日志视图。
// scroll-to-end-trigger 与 live-region 同样可缺省。
export const logMeta: ComponentMeta = {
  component: 'log',
  requiredParts: ['root', 'viewport', 'content'],
}
