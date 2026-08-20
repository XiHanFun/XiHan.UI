import { createAnatomy } from '@xihan-ui/kernel'

// root 是整组组合的容器，key 是一枚键帽，separator 是两枚键帽之间的连接符。
// key 与 separator 按 keys 铺开，数量随数据走，可以一个都没有。
export const hotkeysAnatomy = createAnatomy('hotkeys', ['root', 'key', 'separator'])
