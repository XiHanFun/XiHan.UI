import { createAnatomy } from '@xihan-ui/kernel'

// 三件必需：root 是焦点环与三视觉轴的落点，input 是值，submit-trigger 缺了就没有指针入口。
// input-row 可选：写了它，root 翻成竖排、输入框与按钮收进这一行，上下两侧腾出来放别的东西；
// 不写就是单行，输入框与按钮并排。
// 没有独立的 stop-trigger：发送与停止原位共用一个节点，正在按它的用户不会按空——
// 生成期间只是 aria-label 与 data-mode 翻面。
// 附件条由 file-upload 的部件承载，动作行由作者的容器承载，都不是本组件的部件。
export const promptInputAnatomy = createAnatomy('prompt-input', ['root', 'input-row', 'input', 'submit-trigger'])
