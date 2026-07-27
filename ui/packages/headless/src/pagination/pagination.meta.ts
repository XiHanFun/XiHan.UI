import type { ComponentMeta } from '../spec/types'

// item 缺省就没有页码可点，root 缺省则 nav 地标与 aria-label 无处安放。
// 前后翻页按钮与省略号都是可选装饰：只有一页时作者完全可以只渲染一个页码。
export const paginationMeta: ComponentMeta = {
  component: 'pagination',
  requiredParts: ['root', 'item'],
}
