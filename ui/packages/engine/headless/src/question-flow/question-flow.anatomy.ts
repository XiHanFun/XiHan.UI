import type { ItemQuery } from '@xihan-ui/core'
import { createAnatomy } from '@xihan-ui/core'

// viewport 定高并裁切，track 是纵向排布全部题目的轨道，靠位移把当前题推进视口；
// question 是一题的整块，prompt 是题干，group 按题型取单选组或普通组；
// note 是这一题的自由文本，counter 是给眼睛看的 N / M，live-region 才是念给读屏的进度
// （念的那句文本在 api.announcement 上）；
// submit-trigger 一颗按钮两个身份：不是末题时继续，末题时发送。
export const questionFlowAnatomy = createAnatomy('question-flow', [
  'root',
  'viewport',
  'track',
  'question',
  'prompt',
  'group',
  'item',
  'item-indicator',
  'item-text',
  'note',
  'footer',
  'prev-trigger',
  'counter',
  'next-trigger',
  'skip-trigger',
  'submit-trigger',
  'result',
  'live-region',
])

/** 量测当前题几何时查的集合，容器是 track。 */
export const questionFlowQuestionQuery: ItemQuery = { scope: questionFlowAnatomy.name, part: 'question' }

/** 选项组内漫游焦点时查的集合，容器是 group；归属过滤保证各题互不吞并。 */
export const questionFlowItemQuery: ItemQuery = { scope: questionFlowAnatomy.name, part: 'item' }
