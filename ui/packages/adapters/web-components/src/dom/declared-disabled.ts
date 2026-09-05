import { declaredItemDisabled } from '@xihan-ui/core'

/**
 * 作者在标记里声明的条目禁用，按元素记住头一回见到的那一份。
 *
 * connect 每帧把 aria-disabled 写回条目，第二帧起现读分不清是作者写的还是自己上一帧写的；
 * 记下首见那一份，「作者没写」才表达得出 undefined，collection 里的禁用才轮得到生效。
 */
export function createDeclaredDisabled(): (el: HTMLElement) => boolean | undefined {
  const seen = new WeakMap<HTMLElement, boolean | undefined>()
  return (el) => {
    if (!seen.has(el))
      seen.set(el, declaredItemDisabled(el))
    return seen.get(el)
  }
}
