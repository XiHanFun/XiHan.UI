import { createAnatomy } from '@xihan-ui/kernel'

// 轻提示只做一件事：把刚才那个操作的结果用一句话说清楚，然后自己消失。
// 两层文本、九宫格落位、堆叠上限那些是「主动推来的一条消息」才需要的，归 notification。
export const toastAnatomy = createAnatomy('toast', [
  'root',
  'title',
  'action-trigger',
  'close-trigger',
  // 同时在场的几条叠成一摞。摞由服务档渲染，没有对应的容器组件，
  // 因此它没有 getter，属性直接从解剖里取。
  'group',
])
