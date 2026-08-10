import { createAnatomy } from '@xihan-ui/kernel'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
// 两个角色节点：铺水印的那块地是 root，被盖住的那段内容是 content。
// 印子本身不是角色节点——它是 root 的伪元素，因此天然不进无障碍树、也选不中。
export const watermarkAnatomy = createAnatomy('watermark', ['root', 'content'])
