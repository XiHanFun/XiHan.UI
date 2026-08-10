import { createAnatomy } from '@xihan-ui/core'

// 两个角色节点：承载整张码的 <svg> 是 root，摆在码面正中、由作者放自己图形的那块是 logo。
// 除码眼外的深色模块与三个码眼各合成一条 <path>，logo 底下那块挖空是一个 <rect>——
// 这三样是算出来的几何、不是角色节点，它们带 data-xh-geom 标记，皮肤据此上色。
// 码眼恒是独立的一条：皮肤给它单独留了 --xh-qr-code-eye-fg，合并就没有能上色的节点。
export const qrCodeAnatomy = createAnatomy('qr-code', ['root', 'logo'])
