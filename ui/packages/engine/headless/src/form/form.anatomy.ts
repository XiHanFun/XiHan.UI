import type { ItemQuery, Scope } from '@xihan-ui/core'
import type { FormPath } from './form.path'
import { createAnatomy } from '@xihan-ui/core'
import { formPathKey } from './form.path'

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
export const FORM_FIELD_NAME_ATTR = 'data-form-path'

/**
 * 字段容器的 DOM id。错误摘要链接的 href 与落焦反查都用它，派生规则只此一处。
 * 名字先编码再拼：字段名里带空格或 `#` 会把 href 的片段标识切成两截。
 */
export function formFieldId(scope: Scope, name: FormPath): string {
  return scope.partId(formAnatomy.name, `field:${encodeURIComponent(formPathKey(name))}`)
}

/** 从字段容器上读回作者声明的稳定路径键；供 DOM 顺序与落焦比较。 */
export function formFieldName(el: HTMLElement | null): FormPath | null {
  const key = el?.getAttribute(FORM_FIELD_NAME_ATTR)
  if (key == null || key === '')
    return null
  // 连接层总写路径键；作者手写旧 data-name 时不再猜测，避免点号被暗解为路径。
  if (key.startsWith('string:')) {
    try {
      const path = JSON.parse(key.slice('string:'.length))
      return typeof path === 'string' ? path : null
    }
    catch { return null }
  }
  if (key.startsWith('path:')) {
    try {
      const path = JSON.parse(key.slice('path:'.length))
      return Array.isArray(path) && path.length > 0 && path.every(segment => typeof segment === 'string' || typeof segment === 'number') ? path : null
    }
    catch { return null }
  }
  return null
}
