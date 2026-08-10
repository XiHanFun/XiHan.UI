import { createAnatomy } from '@xihan-ui/kernel'

// root 包住整段文本，mark 是命中关键词的那一小段；mark 有几个由文本与关键词算出来。
export const highlightAnatomy = createAnatomy('highlight', ['root', 'mark'])
