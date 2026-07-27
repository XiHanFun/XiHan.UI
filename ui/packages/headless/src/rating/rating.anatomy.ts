import { createAnatomy } from '@xihan-ui/core'

// control 与 root 分开：root 是包住标题、星星与表单影子的外壳，
// control 才是那条 role=radiogroup 的星星带——键盘与 aria 关系全落在它身上。
export const ratingAnatomy = createAnatomy('rating', ['root', 'label', 'control', 'item', 'hidden-input'])
