import type { ItemQuery } from '@xihan-ui/behavior'
import type { Scope } from '@xihan-ui/core'
import { createAnatomy } from '@xihan-ui/core'

// field-group 是「一个字段在表单里的落脚点」：作者把 Field（标题/控件/描述/错误文案）
// 整个塞进去，表单只认它自报的字段名。表单因此不必知道控件长什么样，
// 也就不必替作者去猜哪个 input 对应哪条错误。
export const formAnatomy = createAnatomy('form', [
  'root',
  'field-group',
  'error-summary',
  'error-summary-item',
  'submit-trigger',
  'reset-trigger',
])

/**
 * 字段容器集合。只认 field-group：错误摘要里的链接、提交失败后的落焦目标，
 * 以及「哪个字段排在前面」都从这份活 DOM 现查——文档序就是用户看到的顺序，
 * 而错误表的键序只是 validate 里写 return 时的手气。
 */
export const formFieldGroupQuery: ItemQuery = { scope: formAnatomy.name, part: 'field-group' }

/** 字段名回写到容器上的属性。DOM 侧（落焦、排序）据此认出这是哪个字段。 */
export const FORM_FIELD_NAME_ATTR = 'data-name'

/**
 * 字段容器的 DOM id。
 *
 * 错误摘要那条链接的 href 指向它，落焦时又要按同一个身份反查回来，
 * 所以派生规则必须只有这一处——两边各拼一次，改了其中一处链接就指空了。
 * 名字先编码再拼：字段名里带空格或 `#` 会把 href 的片段标识切成两截。
 */
export function formFieldId(scope: Scope, name: string): string {
  return scope.partId(formAnatomy.name, `field:${encodeURIComponent(name)}`)
}

/** 从字段容器上读回它自报的字段名；没写名字的容器不参与任何匹配。 */
export function formFieldName(el: HTMLElement | null): string | null {
  const name = el?.getAttribute(FORM_FIELD_NAME_ATTR)
  return name == null || name === '' ? null : name
}
