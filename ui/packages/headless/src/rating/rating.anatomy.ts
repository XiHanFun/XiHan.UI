import { createAnatomy } from '@xihan-ui/kernel'

// root 是包住标题、星星与表单影子的外壳，control 是承载键盘与 aria 关系的 role=radiogroup 星星带。
export const ratingAnatomy = createAnatomy('rating', ['root', 'label', 'control', 'item', 'hidden-input'])
