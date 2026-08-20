import type { ComponentMeta } from '../spec/types'

// 行是按数据摊出来的，作者一个也写不出，因此只有 root 由作者提供：
// 树容器与每一行都由适配器照摊平结果铺进 root 里。
export const jsonViewerMeta: ComponentMeta = {
  component: 'json-viewer',
  requiredParts: ['root'],
}
