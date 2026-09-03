import { createAnatomy } from '@xihan-ui/kernel'

// root 是外壳并承载阶段与三视觉轴；trigger 是折叠开关，indicator/label/summary/status/duration
// 是它里面的排版位——summary 放一行参数摘要，收起时也看得见查了什么，duration 放耗时；
// approval 是 trigger 与 content 之间的常驻位——审批闸门不该被折叠藏起来；
// content 是详情区，input/output/error 按阶段取舍。
export const toolCallAnatomy = createAnatomy('tool-call', [
  'root',
  'trigger',
  'indicator',
  'label',
  'summary',
  'status',
  'duration',
  'approval',
  'content',
  'input',
  'output',
  'error',
])
