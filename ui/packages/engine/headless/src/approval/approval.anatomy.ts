import { createAnatomy } from '@xihan-ui/kernel'

// root 是 role=group 的闸门本体；title 与 description 给它命名与描述；
// live-region 是可配档位的活区，念的那句文本在 api.announcement 上；
// scope-* 是勾选式授权范围——这里的 scope 指授权范围（对应 props 的 scopes / grantedScopes），
// 与标识组件身份的 data-scope 不是一回事；note 是附在判定上的自由文本；
// timer 是剩余时间；result 是落定后看得见的那一格；footer 是排布两颗按钮的那一行；
// approve-trigger 与 deny-trigger 是仅有的两个出口——本组件不提供不作答的第三条路。
export const approvalAnatomy = createAnatomy('approval', [
  'root',
  'title',
  'description',
  'live-region',
  'group',
  'item',
  'item-indicator',
  'item-text',
  'note',
  'timer',
  'result',
  'footer',
  'approve-trigger',
  'deny-trigger',
])
