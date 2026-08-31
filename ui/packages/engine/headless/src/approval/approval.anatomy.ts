import { createAnatomy } from '@xihan-ui/kernel'

// root 是 role=group 的闸门本体；title 与 description 给它命名与描述；
// announcement 是可配档位的活区；scope-* 是勾选式授权范围；timer 是剩余时间；
// approve-trigger 与 deny-trigger 是仅有的两个出口——本组件不提供不作答的第三条路。
export const approvalAnatomy = createAnatomy('approval', [
  'root',
  'title',
  'description',
  'announcement',
  'scope-group',
  'scope-item',
  'scope-indicator',
  'scope-label',
  'timer',
  'approve-trigger',
  'deny-trigger',
])
