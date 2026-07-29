import type { ItemQuery } from '@xihan-ui/behavior'
import type { Scope } from '@xihan-ui/core'
import { createAnatomy } from '@xihan-ui/core'

// field-group 是一个字段在表单里的落脚点：作者把整个 Field 塞进去，表单只认它自报的字段名。
export const formAnatomy = createAnatomy('form', [
  'root',
  'field-group',
  'error-summary',
  'error-summary-item',
  'submit-trigger',
  'reset-trigger',
])

/**
 * 字段容器集合。错误摘要的链接目标、落焦目标与字段的文档序都从这份活 DOM 现查。
 */
export const formFieldGroupQuery: ItemQuery = { scope: formAnatomy.name, part: 'field-group' }

/** 字段名回写到容器上的属性。DOM 侧（落焦、排序）据此认出这是哪个字段。 */
export const FORM_FIELD_NAME_ATTR = 'data-name'

/**
 * 字段容器的 DOM id。错误摘要链接的 href 与落焦反查都用它，派生规则只此一处。
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
