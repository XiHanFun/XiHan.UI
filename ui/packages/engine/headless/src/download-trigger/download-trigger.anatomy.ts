import { createAnatomy } from '@xihan-ui/kernel'

// 只有一个角色节点：root 就是那个按钮本身。
// 下载没有第二个可见部件——文件是交给浏览器的，界面上不留任何容器。
export const downloadTriggerAnatomy = createAnatomy('download-trigger', ['root'])
