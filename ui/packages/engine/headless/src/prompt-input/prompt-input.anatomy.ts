import { createAnatomy } from '@xihan-ui/kernel'

// 三件全必需：root 是焦点环与三视觉轴的落点，input 是值，submit-trigger 缺了就没有指针入口。
// 没有独立的 stop-trigger：发送与停止原位共用一个节点，正在按它的用户不会按空——
// 生成期间只是 aria-label 与 data-mode 翻面。
// 附件条由 file-upload 的部件承载，动作行由作者的容器承载，都不是本组件的部件。
export const promptInputAnatomy = createAnatomy('prompt-input', ['root', 'input', 'submit-trigger'])
