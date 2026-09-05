import { createAnatomy } from '@xihan-ui/core'

// 八个方向共用一个 handle 部件，方向写在 data-edge 上：
// 拆成八个部件会让皮肤与解剖各多七条，而它们的差别只有光标与落位。
export const resizableAnatomy = createAnatomy('resizable', [
  'root',
  'handle',
])
