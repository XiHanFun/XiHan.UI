import type { ComponentMeta } from '../spec/types'

// root 缺省则整副瀑布流没有容器，列宽也无从等分；column 缺省则项无处安放。
// item 不在里面：项按数据铺开，一项都没有也是一副合法的空瀑布流。
export const masonryMeta: ComponentMeta = {
  component: 'masonry',
  requiredParts: ['root', 'column'],
}
