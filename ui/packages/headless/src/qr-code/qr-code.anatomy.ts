import { createAnatomy } from '@xihan-ui/core'

// 只有一个角色节点：承载整张码的 <svg>。
// 深色模块合成一条 <path> 铺在它里面，那条 path 是算出来的几何、不是角色节点，
// 皮肤靠 root 上的 fill 继承给它上色。
export const qrCodeAnatomy = createAnatomy('qr-code', ['root'])
