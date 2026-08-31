import type { ComponentMeta } from '../spec/types'

// root / viewport / list 三者必需；item 不进必需表——新建会话一条消息都没有，那是真实首帧。
// item-label、scroll-button、live-region 同理可缺省。
export const messageFeedMeta: ComponentMeta = {
  component: 'message-feed',
  requiredParts: ['root', 'viewport', 'list'],
}
